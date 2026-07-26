// ADVICE FROM HOLLS — s6 White Card (code-rendered)
// full-bleed headshot + white card in the lower third + coral frame + logo on the card
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const b64 = f => fs.readFileSync(path.join(__dirname, f)).toString('base64');
const font = (name, file) =>
  `@font-face{font-family:'${name}';src:url(data:font/ttf;base64,${b64('fonts/'+file)});font-display:block;}`;
const LOGO_COLOR = 'data:image/png;base64,' + fs.readFileSync(path.join(__dirname,'assets/logo_color.b64'),'utf8');
const NAVY='#22334f', CORAL='#e8836f';
const bgURI = p => `data:image/${path.extname(p).slice(1)};base64,`+fs.readFileSync(p).toString('base64');

function advice(cfg){
  const bg = bgURI(cfg.bg);
  const lines = (cfg.advice||[]).map(l=>`<div class="hl">${l}</div>`).join('');
  const cardTop = cfg.cardTop || 796;
  return `<!doctype html><html><head><meta charset="utf8"><style>
  ${font('Poppins','Poppins-SemiBold.ttf')}
  @font-face{font-family:'Bebas';src:url(data:font/otf;base64,${b64('fonts/BebasNeue-Regular.otf')});font-display:block;}
  @font-face{font-family:'Havana';src:url(data:font/otf;base64,${b64('fonts/Havana-Regular.otf')});font-display:block;}
  *{margin:0;padding:0;box-sizing:border-box;-webkit-font-smoothing:antialiased;}
  html,body{width:1000px;height:1500px;}
  .pin{position:relative;width:1000px;height:1500px;overflow:hidden;background:#fff;}
  .bg{position:absolute;inset:0;background-size:cover;background-position:${cfg.bgPos||'center top'};}
  .scrim{position:absolute;inset:0;z-index:2;background:linear-gradient(180deg,rgba(34,51,79,.14),rgba(34,51,79,0) 32%);}
  .frame{position:absolute;inset:26px;border:5px solid ${CORAL};border-radius:34px;pointer-events:none;z-index:8;}
  .card{position:absolute;left:66px;right:66px;top:${cardTop}px;bottom:72px;z-index:4;background:#fff;border-radius:30px;
        box-shadow:0 24px 60px rgba(34,51,79,.30);padding:46px 48px 32px;display:flex;flex-direction:column;}
  .eyebrow{font-family:'Poppins';font-weight:600;letter-spacing:.24em;text-transform:uppercase;
           font-size:${cfg.eyebrowSize||26}px;color:${CORAL};line-height:1.2;padding-left:.12em;margin-bottom:${cfg.eyebrowGap||26}px;}
  .head{margin-bottom:${cfg.scriptGap||18}px;}
  .hl{font-family:'Bebas';color:${NAVY};font-size:${cfg.size||96}px;line-height:.95;letter-spacing:.01em;}
  .script{font-family:'Havana';color:${CORAL};font-size:${cfg.scriptSize||76}px;line-height:1.05;margin-bottom:${cfg.ruleGap||22}px;}
  .rule{flex:0 0 2px;height:2px;background:#e4e8ee;margin-top:auto;}
  .logo{flex:0 0 auto;width:${cfg.logoW||340}px;align-self:flex-end;margin-top:${cfg.logoGap||22}px;display:block;}
  </style></head><body><div class="pin">
  <div class="bg" style="background-image:url('${bg}')"></div><div class="scrim"></div>
  <div class="card">
    ${cfg.eyebrow?`<div class="eyebrow">${cfg.eyebrow}</div>`:''}
    <div class="head">${lines}</div>
    ${cfg.script?`<div class="script">${cfg.script}</div>`:''}
    <div class="rule"></div>
    <img class="logo" src="${LOGO_COLOR}">
  </div>
  <div class="frame"></div></div></body></html>`;
}

(async()=>{
  const cfg = JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
  const out = process.argv[3]||'out.png';
  const browser = await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
  const page = await browser.newPage({viewport:{width:1000,height:1500},deviceScaleFactor:2});
  await page.setContent(advice(cfg),{waitUntil:'networkidle'});
  await page.evaluate(()=>document.fonts.ready);
  await page.waitForTimeout(250);
  await page.locator('.pin').screenshot({path:out});
  await browser.close();
  console.log('rendered',out);
})();
