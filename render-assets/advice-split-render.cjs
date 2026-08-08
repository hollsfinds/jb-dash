// ADVICE FROM HOLLS — s8 Navy Split / s9 White Split (code-rendered)
// headshot on the RIGHT bleeding off the edge + color block on the LEFT holding the words + seamless fade + coral frame
// config schema (same family as advice-render.cjs): {bg, eyebrow, advice:[lines], script, theme:'navy'|'white', bgPos?, size?, scriptSize?, eyebrowSize?, blockW?, padTop?}
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const b64 = f => fs.readFileSync(path.join(__dirname, f)).toString('base64');
const LOGO_COLOR = 'data:image/png;base64,' + fs.readFileSync(path.join(__dirname,'assets/logo_color.b64'),'utf8');
const NAVY='#22334f', CORAL='#e8836f', MINT='#cdeee1';
const bgURI = p => `data:image/${path.extname(p).slice(1)};base64,`+fs.readFileSync(p).toString('base64');

function theme(cfg){
  const t = cfg.theme||'navy';
  // white panel is slightly translucent (a bit opaque) so a soft ghost of the photo shows through
  if(t==='white') return {block:'#ffffff', ov:`rgba(255,255,255,${cfg.blockAlpha!=null?cfg.blockAlpha:0.93})`, head:NAVY, eb:CORAL, script:CORAL, chip:'transparent', chipPad:'0'};
  return {block:NAVY, ov:NAVY, head:'#ffffff', eb:CORAL, script:MINT, chip:'#ffffff', chipPad:'16px 26px'};
}

// baked-in default headshot + crop so split cards frame Holly on the right with zero fiddling
const DEFAULT_BG = path.join(__dirname,'advice-split-default.jpg');
function split(cfg){
  const bg = bgURI(cfg.bg || DEFAULT_BG);
  const T = theme(cfg);
  const lines = (cfg.advice||[]).map(l=>`<div class="hl">${l}</div>`).join('');
  const fadeStop = cfg.blockW || 46; // % of width where the solid block ends before fading into the photo
  return `<!doctype html><html><head><meta charset="utf8"><style>
  @font-face{font-family:'Poppins';src:url(data:font/ttf;base64,${b64('fonts/Poppins-SemiBold.ttf')});font-display:block;}
  @font-face{font-family:'Bebas';src:url(data:font/otf;base64,${b64('fonts/BebasNeue-Regular.otf')});font-display:block;}
  @font-face{font-family:'Havana';src:url(data:font/otf;base64,${b64('fonts/Havana-Regular.otf')});font-display:block;}
  *{margin:0;padding:0;box-sizing:border-box;-webkit-font-smoothing:antialiased;}
  html,body{width:1000px;height:1500px;}
  .pin{position:relative;width:1000px;height:1500px;overflow:hidden;background:${T.block};}
  .bg{position:absolute;inset:0;background-size:cover;background-position:${cfg.bgPos||'75% center'};}
  .overlay{position:absolute;inset:0;z-index:2;background:linear-gradient(90deg, ${T.ov} 0%, ${T.ov} ${fadeStop}%, rgba(0,0,0,0) ${fadeStop+20}%);}
  .frame{position:absolute;inset:26px;border:5px solid ${CORAL};border-radius:34px;pointer-events:none;z-index:8;}
  .content{position:absolute;left:0;top:0;bottom:0;width:${cfg.contentW||560}px;z-index:4;
           padding:${cfg.padTop||190}px 40px 70px 74px;display:flex;flex-direction:column;}
  .eyebrow{font-family:'Poppins';font-weight:600;letter-spacing:.22em;text-transform:uppercase;
           font-size:${cfg.eyebrowSize||26}px;color:${T.eb};line-height:1.2;margin-bottom:${cfg.eyebrowGap||24}px;}
  .hl{font-family:'Bebas';color:${T.head};font-size:${cfg.size||92}px;line-height:.96;letter-spacing:.01em;}
  .head{margin-bottom:${cfg.scriptGap||22}px;}
  .script{font-family:'Havana';color:${T.script};font-size:${cfg.scriptSize||72}px;line-height:1.05;}
  .logo{margin-top:auto;align-self:flex-start;background:${T.chip};padding:${T.chipPad};border-radius:18px;display:inline-block;}
  .logo img{width:${cfg.logoW||300}px;display:block;}
  </style></head><body><div class="pin">
  <div class="bg" style="background-image:url('${bg}')"></div><div class="overlay"></div>
  <div class="content">
    ${cfg.eyebrow?`<div class="eyebrow">${cfg.eyebrow}</div>`:''}
    <div class="head">${lines}</div>
    ${cfg.script?`<div class="script">${cfg.script}</div>`:''}
    <div class="logo"><img src="${LOGO_COLOR}"></div>
  </div>
  <div class="frame"></div></div></body></html>`;
}

(async()=>{
  const cfg = JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
  const out = process.argv[3]||'out.png';
  const browser = await chromium.launch((process.env.PW_CHROME?{executablePath:process.env.PW_CHROME}:{}));
  const page = await browser.newPage({viewport:{width:1000,height:1500},deviceScaleFactor:2});
  await page.setContent(split(cfg),{waitUntil:'networkidle'});
  await page.evaluate(()=>document.fonts.ready);
  await page.waitForTimeout(250);
  await page.locator('.pin').screenshot({path:out});
  await browser.close();
  console.log('rendered',out);
})();
