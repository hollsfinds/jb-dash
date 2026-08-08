// ADVICE FROM HOLLS — s7 Mint Pills (code-rendered)
// full-bleed headshot + mint highlighter pills hugging each line + Havana script + coral frame + logo on a pill
// config schema (same family as advice-render.cjs): {bg, eyebrow, advice:[lines], script, bgPos?, size?, scriptSize?, eyebrowSize?, pushDown?}
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const b64 = f => fs.readFileSync(path.join(__dirname, f)).toString('base64');
const LOGO_COLOR = 'data:image/png;base64,' + fs.readFileSync(path.join(__dirname,'assets/logo_color.b64'),'utf8');
const NAVY='#22334f', CORAL='#e8836f', MINT='rgba(205,238,225,.88)';
const bgURI = p => `data:image/${path.extname(p).slice(1)};base64,`+fs.readFileSync(p).toString('base64');

function pins(cfg){
  const bg = bgURI(cfg.bg);
  const lines = (cfg.advice||[]).map(l=>`<div class="row"><span class="pill hl">${l}</span></div>`).join('');
  return `<!doctype html><html><head><meta charset="utf8"><style>
  @font-face{font-family:'Poppins';src:url(data:font/ttf;base64,${b64('fonts/Poppins-SemiBold.ttf')});font-display:block;}
  @font-face{font-family:'Bebas';src:url(data:font/otf;base64,${b64('fonts/BebasNeue-Regular.otf')});font-display:block;}
  @font-face{font-family:'Havana';src:url(data:font/otf;base64,${b64('fonts/Havana-Regular.otf')});font-display:block;}
  *{margin:0;padding:0;box-sizing:border-box;-webkit-font-smoothing:antialiased;}
  html,body{width:1000px;height:1500px;}
  .pin{position:relative;width:1000px;height:1500px;overflow:hidden;background:#fff;}
  .bg{position:absolute;inset:0;background-size:cover;background-position:${cfg.bgPos||'center top'};}
  .scrim{position:absolute;inset:0;z-index:2;background:linear-gradient(180deg,rgba(34,51,79,.10),rgba(34,51,79,0) 30%);}
  .frame{position:absolute;inset:26px;border:5px solid ${CORAL};border-radius:34px;pointer-events:none;z-index:8;}
  .stack{position:absolute;left:70px;right:70px;top:0;bottom:0;z-index:4;display:flex;flex-direction:column;
         align-items:center;justify-content:center;text-align:center;padding-top:${cfg.pushDown||210}px;}
  .row{margin:${cfg.rowGap||6}px 0;line-height:0;}
  .pill{display:inline-block;background:${MINT};border-radius:16px;padding:.06em .30em;box-decoration-break:clone;-webkit-box-decoration-break:clone;}
  .eyebrow .pill{font-family:'Poppins';font-weight:600;letter-spacing:.22em;text-transform:uppercase;
           font-size:${cfg.eyebrowSize||26}px;color:${NAVY};padding:.34em .55em .30em;}
  .eyebrow{margin-bottom:${cfg.eyebrowGap||22}px;}
  .hl{font-family:'Bebas';color:${NAVY};font-size:${cfg.size||100}px;line-height:1;letter-spacing:.01em;padding:.02em .26em .10em;}
  .script .pill{font-family:'Havana';color:${NAVY};font-size:${cfg.scriptSize||78}px;line-height:1;padding:.10em .40em .22em;}
  .script{margin-top:${cfg.scriptGap||14}px;}
  .logo{margin-top:${cfg.logoGap||30}px;}
  .logo .pill{padding:20px 34px;border-radius:22px;}
  .logo img{width:${cfg.logoW||320}px;display:block;}
  </style></head><body><div class="pin">
  <div class="bg" style="background-image:url('${bg}')"></div><div class="scrim"></div>
  <div class="stack">
    ${cfg.eyebrow?`<div class="row eyebrow"><span class="pill">${cfg.eyebrow}</span></div>`:''}
    ${lines}
    ${cfg.script?`<div class="row script"><span class="pill">${cfg.script}</span></div>`:''}
    <div class="row logo"><span class="pill"><img src="${LOGO_COLOR}"></span></div>
  </div>
  <div class="frame"></div></div></body></html>`;
}

(async()=>{
  const cfg = JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
  const out = process.argv[3]||'out.png';
  const browser = await chromium.launch((process.env.PW_CHROME?{executablePath:process.env.PW_CHROME}:{}));
  const page = await browser.newPage({viewport:{width:1000,height:1500},deviceScaleFactor:2});
  await page.setContent(pins(cfg),{waitUntil:'networkidle'});
  await page.evaluate(()=>document.fonts.ready);
  await page.waitForTimeout(250);
  await page.locator('.pin').screenshot({path:out});
  await browser.close();
  console.log('rendered',out);
})();
