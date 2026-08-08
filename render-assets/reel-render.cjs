// Juney & Byrd reel renderer (code-rendered kinetic typography over B-roll footage).
// Usage: node reel-render.cjs <slots.json> <background-clip.mp4> <out.mp4>
// slots.json: { eyebrow, stack:[l1,l2,l3], script, sub, handle, duration? }
// Renders the animated text as transparent PNG frames (playwright), then ffmpeg
// composites them over the footage with a readability scrim baked into the text layer.
const { chromium } = require('playwright');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const [,, slotsPath, bgPath, outPath] = process.argv;
if (!slotsPath || !bgPath || !outPath) { console.error('usage: node reel-render.cjs <slots.json> <bg.mp4> <out.mp4>'); process.exit(1); }
const S = JSON.parse(fs.readFileSync(slotsPath, 'utf8'));
// accept the dash's on-image slot names (EYEBROW/STACK/SCRIPT/SUB) as well as lowercase; STACK may be a newline string
S.eyebrow = S.eyebrow || S.EYEBROW || '';
S.script  = S.script  || S.SCRIPT  || '';
S.sub     = S.sub     || S.SUB     || '';
S.handle  = S.handle  || '@juneyandbyrd';
if (!Array.isArray(S.stack)) { const raw = S.stack || S.STACK || ''; S.stack = String(raw).split(/\r?\n|\\n/).map(x => x.trim()).filter(Boolean); }
const FONTS = path.join(__dirname, 'fonts');
const CHROME = process.env.PW_CHROME || '';
const b64 = f => fs.readFileSync(path.join(FONTS, f)).toString('base64');
const POPB = b64('Poppins-Black.ttf'), POPM = b64('Poppins-Medium.ttf'), HAV = b64('Havana-Regular.otf');

const FPS = 30, DUR = +S.duration || 7.0, W = 1080, H = 1920, CORAL = S.accent || '#FF8FA6';
const stack = (S.stack || []).slice(0, 4);

const html = `<!doctype html><html><head><meta charset="utf8"><style>
@font-face{font-family:'PopB';src:url(data:font/ttf;base64,${POPB});}
@font-face{font-family:'PopM';src:url(data:font/ttf;base64,${POPM});}
@font-face{font-family:'Hav';src:url(data:font/otf;base64,${HAV}) format('opentype');}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:${W}px;height:${H}px;overflow:hidden;background:transparent}
.stage{position:relative;width:${W}px;height:${H}px}
#scrim{position:absolute;inset:0;background:linear-gradient(180deg,rgba(18,22,32,.50) 0%,rgba(18,22,32,.14) 26%,rgba(18,22,32,.14) 66%,rgba(18,22,32,.62) 100%)}
.wrap{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:0 110px;text-align:center;text-shadow:0 2px 18px rgba(0,0,0,.35)}
#eyebrow{font-family:'PopM';font-size:33px;letter-spacing:7px;color:${CORAL};font-weight:600;margin-bottom:44px;will-change:transform,opacity}
#stack{font-family:'PopB';font-size:120px;line-height:1.02;color:#fff;text-transform:uppercase;letter-spacing:-1px}
#stack .line{display:block;will-change:transform,opacity;opacity:0}
#script{font-family:'Hav';font-size:152px;color:${CORAL};margin:26px 0 34px;will-change:transform,opacity;opacity:0}
#sub{font-family:'PopM';font-size:42px;line-height:1.4;color:rgba(255,255,255,.92);max-width:840px;will-change:transform,opacity;opacity:0}
.foot{position:absolute;left:0;right:0;bottom:96px;display:flex;flex-direction:column;align-items:center;gap:22px;text-shadow:0 2px 14px rgba(0,0,0,.4)}
#handle{font-family:'PopM';font-size:32px;letter-spacing:2px;color:rgba(255,255,255,.9)}
.track{width:300px;height:6px;border-radius:3px;background:rgba(255,255,255,.28);overflow:hidden}
#bar{height:100%;width:0;background:${CORAL};border-radius:3px}
</style></head><body>
<div class="stage"><div id="scrim"></div>
<div class="wrap">
  <div id="eyebrow">${S.eyebrow || ''}</div>
  <div id="stack">${stack.map(l => `<span class="line">${l}</span>`).join('')}</div>
  <div id="script">${S.script || ''}</div>
  <div id="sub">${S.sub || ''}</div>
</div>
<div class="foot"><div class="track"><div id="bar"></div></div><div id="handle">${S.handle || ''}</div></div>
</div>
<script>
const DUR=${DUR};const $=id=>document.getElementById(id);
const lines=Array.from(document.querySelectorAll('#stack .line'));
const eoc=x=>1-Math.pow(1-x,3);
const eob=x=>{const c1=1.70158,c3=c1+1;return 1+c3*Math.pow(x-1,3)+c1*Math.pow(x-1,2);};
const seg=(t,s,d)=>Math.max(0,Math.min(1,(t-s)/d));
window.seek=function(t){
  const e=eoc(seg(t,0.3,0.7));$('eyebrow').style.opacity=e;$('eyebrow').style.transform='translateY('+((1-e)*30).toFixed(2)+'px)';
  lines.forEach((el,i)=>{const p=eoc(seg(t,1.0+i*0.42,0.62));el.style.opacity=p;el.style.transform='translateY('+((1-p)*72).toFixed(2)+'px)';});
  const s=seg(t,2.5,0.7),so=eoc(s),sb=eob(Math.max(0.0001,Math.min(1,s)));
  $('script').style.opacity=so;$('script').style.transform='scale('+(0.7+0.3*sb).toFixed(3)+') rotate('+(-5+(1-sb)*-4).toFixed(2)+'deg)';
  const u=eoc(seg(t,3.3,0.7));$('sub').style.opacity=u;$('sub').style.transform='translateY('+((1-u)*24).toFixed(2)+'px)';
  $('bar').style.width=(Math.min(1,t/DUR)*100).toFixed(2)+'%';
};window.seek(0);
</script></body></html>`;

(async () => {
  const N = Math.round(FPS * DUR);
  const tdir = fs.mkdtempSync('/tmp/reel-tf-');
  const b = await chromium.launch(CHROME?{executablePath:CHROME}:{});
  const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  await p.setContent(html, { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(200);
  for (let f = 0; f < N; f++) { await p.evaluate(t => window.seek(t), f / FPS);
    await p.screenshot({ path: `${tdir}/frame-${String(f).padStart(4,'0')}.png`, omitBackground: true }); }
  await b.close();
  execSync(`ffmpeg -y -stream_loop -1 -i ${JSON.stringify(bgPath)} -framerate ${FPS} -i ${tdir}/frame-%04d.png -filter_complex "[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1,fps=${FPS}[bg];[bg][1:v]overlay=0:0:shortest=1[v]" -map "[v]" -an -c:v libx264 -pix_fmt yuv420p -movflags +faststart -r ${FPS} ${JSON.stringify(outPath)}`, { stdio: 'inherit' });
  execSync(`rm -rf ${tdir}`);
  console.log('reel ->', outPath);
})();
