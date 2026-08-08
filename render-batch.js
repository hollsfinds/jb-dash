#!/usr/bin/env node
/*
 * jb-dash Mac batch render runner.
 * Runs entirely on Holly's Mac (Cowork can't render or push). Cowork writes a
 * render-batch.json with every job fully specified; this runner just executes.
 *
 * Usage:  node render-batch.js /path/to/render-batch.json
 * Run it from inside a jb-dash clone (needs render-assets/ + reels/broll/ + pins/).
 *
 * render-batch.json shape:
 * {
 *   "commit_msg": "Batch Mon",
 *   "images": [
 *     { "script":"typestack-render.cjs", "cfg":{...}, "name":"mon-s11-t3",
 *       "pad":"#22334f",
 *       "platforms": { "pinterest":"1000x1500", "igfb":"1080x1350" } }
 *   ],
 *   "reels": [
 *     { "slots":{...}, "broll":"reels/broll/broll-22-x.mp4", "name":"mon-s11-reel-t3" }
 *   ],
 *   "manifest_updates": { "broll-22-x.mp4":"2026-08-08" }
 * }
 *
 * Nothing is pushed unless every render succeeds (no partial batches).
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const RAW = 'https://raw.githubusercontent.com/hollsfinds/jb-dash/main/pins/';
const jobPath = process.argv[2];
if (!jobPath) { console.error('usage: node render-batch.js <render-batch.json>'); process.exit(1); }

const noPush = process.argv.includes('--no-push') || process.env.NOPUSH;
const repo = process.cwd();
const pinsDir = path.join(repo, 'pins');
const tmp = fs.mkdtempSync('/tmp/jbrun-');
const sh = (c) => execSync(c, { stdio: 'inherit' });
const shq = (c) => execSync(c, { stdio: ['ignore', 'pipe', 'pipe'] }).toString();

function need(p, label) { if (!fs.existsSync(p)) { console.error(`MISSING ${label}: ${p}`); process.exit(1); } }
need(path.join(repo, 'render-assets'), 'render-assets/ (run from a jb-dash clone)');
need(jobPath, 'render-batch.json');
if (!fs.existsSync(pinsDir)) fs.mkdirSync(pinsDir);

const batch = JSON.parse(fs.readFileSync(jobPath, 'utf8'));
const hexColor = (c) => { if (!c) return 'white'; return c.startsWith('#') ? '0x' + c.slice(1) : c; };
const outputs = [];

// ---- IMAGES ----
for (const im of (batch.images || [])) {
  const script = path.join(repo, 'render-assets', im.script);
  need(script, `render script ${im.script}`);
  const cfgPath = path.join(tmp, `${im.name}.json`);
  fs.writeFileSync(cfgPath, JSON.stringify(im.cfg || {}));
  const base = path.join(tmp, `${im.name}-base.png`);
  console.log(`\n[image] ${im.name}  (${im.script})`);
  sh(`node ${JSON.stringify(script)} ${JSON.stringify(cfgPath)} ${JSON.stringify(base)}`);
  if (!fs.existsSync(base)) { console.error(`render produced no file for ${im.name}`); process.exit(1); }
  const pad = hexColor(im.pad);
  const platforms = im.platforms || { pinterest: '1000x1500' };
  for (const [plat, size] of Object.entries(platforms)) {
    const [W, H] = size.split('x');
    const outName = `${im.name}-${plat}.png`;
    const outPath = path.join(pinsDir, outName);
    // scale to fit (never crop) then pad to exact size with the pin's bg color
    sh(`ffmpeg -y -loglevel error -i ${JSON.stringify(base)} -vf "scale=${W}:${H}:force_original_aspect_ratio=decrease,pad=${W}:${H}:(ow-iw)/2:(oh-ih)/2:color=${pad}" ${JSON.stringify(outPath)}`);
    outputs.push({ kind: 'image', platform: plat, file: outName, url: RAW + outName });
    console.log(`   -> pins/${outName}  (${size})`);
  }
}

// ---- REELS ----
for (const r of (batch.reels || [])) {
  const bg = path.join(repo, r.broll);
  need(bg, `b-roll clip ${r.broll}`);
  const slotsPath = path.join(tmp, `${r.name}-slots.json`);
  fs.writeFileSync(slotsPath, JSON.stringify(r.slots || {}));
  const outName = `${r.name}.mp4`;
  const outPath = path.join(pinsDir, outName);
  console.log(`\n[reel] ${r.name}  (bg: ${path.basename(r.broll)})`);
  sh(`node ${JSON.stringify(path.join(repo, 'render-assets', 'reel-render.cjs'))} ${JSON.stringify(slotsPath)} ${JSON.stringify(bg)} ${JSON.stringify(outPath)}`);
  if (!fs.existsSync(outPath)) { console.error(`reel produced no file for ${r.name}`); process.exit(1); }
  outputs.push({ kind: 'reel', file: outName, url: RAW + outName });
  console.log(`   -> pins/${outName}`);
}

// ---- MANIFEST last_used updates ----
const mUp = batch.manifest_updates || {};
if (Object.keys(mUp).length) {
  const manPath = path.join(repo, 'reels', 'broll', 'manifest.json');
  need(manPath, 'reels/broll/manifest.json');
  const man = JSON.parse(fs.readFileSync(manPath, 'utf8'));
  let hits = 0;
  for (const e of man) { if (mUp[e.file]) { e.last_used = mUp[e.file]; hits++; } }
  fs.writeFileSync(manPath, '[\n' + man.map(e => JSON.stringify(e)).join(',\n') + '\n]\n');
  console.log(`\n[manifest] updated last_used on ${hits} clip(s)`);
}

// ---- COMMIT + PUSH ----
if (noPush) {
  console.log('\n[git] --no-push: skipping commit/push. Files rendered locally into pins/ for inspection.');
} else {
  console.log('\n[git] committing + pushing...');
  try { sh(`git add pins reels/broll/manifest.json`); } catch (e) {}
  const msg = (batch.commit_msg || 'Batch render').replace(/"/g, "'");
  try { sh(`git commit -m ${JSON.stringify(msg)}`); }
  catch (e) { console.error('nothing to commit (renders may have failed)'); process.exit(1); }
  try { sh(`git push origin main`); }
  catch (e) { console.log('push rejected, rebasing...'); sh(`git pull --rebase`); sh(`git push origin main`); }
}

// ---- REPORT ----
if (noPush) {
  console.log('\n===============  LOCAL FILES (not pushed)  ===============');
  for (const o of outputs) console.log(`${o.kind.padEnd(5)} ${o.platform ? '('+o.platform+') ' : ''}pins/${o.file}`);
} else {
  console.log('\n================  HOSTED URLS  ================');
  for (const o of outputs) console.log(`${o.kind.padEnd(5)} ${o.platform ? '('+o.platform+') ' : ''}${o.url}`);
}
fs.writeFileSync(path.join(path.dirname(jobPath), 'render-batch.result.json'), JSON.stringify(outputs, null, 2));
console.log('\nwrote result JSON next to the batch file. DONE.');
try { execSync(`rm -rf ${tmp}`); } catch (e) {}
