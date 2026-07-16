// SKELETON 7 — Product Filmstrip (code-rendered, product-agnostic)
// layout: stack | herostack | tophero   theme: white | navy   bg: optional lifestyle photo (whitewash light / navy scrim)
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const b64 = f => fs.readFileSync(path.join(__dirname, f)).toString('base64');
const font = (name, file, w='400') =>
  `@font-face{font-family:'${name}';src:url(data:font/ttf;base64,${b64('fonts/'+file)});font-weight:${w};font-display:block;}`;
const LOGO_COLOR = 'data:image/png;base64,' + fs.readFileSync(path.join(__dirname,'assets/logo_color.b64'),'utf8');
const LOGO_WHITE = 'data:image/png;base64,' + fs.readFileSync(path.join(__dirname,'assets/logo_white.b64'),'utf8');
const NAVY='#22334f', CORAL='#e8836f', MINT='#cdeee1', TEAL='#2f8f7d', SAGE='#b7d6c4';
const imgURI = p => `data:image/${path.extname(p).slice(1)};base64,`+fs.readFileSync(p).toString('base64');

function hl(lines){
  return lines.map(ln=>`<div class="line">${ln.map(s=> s.a?`<span class="acc">${s.t}</span>`:`<span>${s.t}</span>`).join(' ')}</div>`).join('');
}
const shot = (p,w,h,extra='')=>`<div class="shot" style="${extra}width:${w}px;height:${h}px"><img src="${imgURI(p)}"></div>`;

function theme(cfg){
  const t = cfg.theme||'white';
  if(t==='navy') return {page:NAVY, text:'#ffffff', eb:MINT, sub:'#cbd6e4', border:MINT, logo:LOGO_WHITE,
    stickerFill:'#fff6ea', stickerFx:'drop-shadow(0 0 6px #fff) drop-shadow(0 0 6px #fff) drop-shadow(0 16px 24px rgba(20,30,50,.42))',
    blob:`radial-gradient(1100px 950px at 82% 6%, #34507288, transparent 60%), radial-gradient(900px 800px at 8% 98%, ${TEAL}55, transparent 60%)`,
    wash:'rgba(34,51,79,.52)'};
  return {page:'#ffffff', text:NAVY, eb:TEAL, sub:'#6c7a8c', border:CORAL, logo:LOGO_COLOR,
    stickerFill:NAVY, stickerFx:'drop-shadow(0 3px 0 #fff) drop-shadow(0 16px 22px rgba(20,30,50,.26))',
    blob:`radial-gradient(1000px 900px at 88% 6%, ${MINT}44, transparent 60%), radial-gradient(800px 800px at 6% 98%, ${CORAL}18, transparent 60%)`,
    wash:'rgba(255,255,255,.46)'};
}

function panelStrip(cfg, T){
  const stripW = cfg.stripW || 420;
  const panelLeft = 60 + stripW + 28;
  let strip;
  if((cfg.layout||'stack')==='herostack'){
    const hR=cfg.heroRatio||1.18, sR=cfg.slotRatio||1.35;
    const heroH=Math.round(stripW/hR), cH=Math.round(stripW/sR);
    strip = shot(cfg.images[0],stripW,heroH)+cfg.images.slice(1).map(p=>shot(p,stripW,cH)).join('');
  } else {
    const R=cfg.slotRatio||1.35, h=Math.round(stripW/R);
    strip = cfg.images.map(p=>shot(p,stripW,h)).join('');
  }
  return `
    <div class="strip" style="left:60px;width:${stripW}px">${strip}</div>
    <div class="panel" style="left:${panelLeft}px">
      ${cfg.eyebrow?`<div class="eyebrow">${cfg.eyebrow}</div>`:''}
      <div class="head">${hl(cfg.headline)}</div>
      ${cfg.sub?`<div class="sub">${cfg.sub}</div>`:''}
    </div>`;
}

function topHero(cfg, T){
  const imgs=cfg.images||[];
  const heroW=cfg.heroW||824, heroH=Math.round(heroW/(cfg.heroRatio||1.72)), heroTop=cfg.heroTop||86;
  const smW=cfg.smW||344, smH=Math.round(smW/(cfg.smRatio||1.35));
  // equal, tight vertical gap G between hero, small1, small2; group centered above the logo
  const G=(cfg.gap!=null)?cfg.gap:26;
  const groupH=heroH+2*smH+2*G, topLimit=76, botLimit=1248;
  const gTop=Math.max(topLimit, Math.round((topLimit+botLimit)/2 - groupH/2));
  const hTop=gTop;
  const s1Top=hTop+heroH+G, s2Top=s1Top+smH+G, s2Bottom=s2Top+smH;
  const textMid=Math.round((s1Top+s2Bottom)/2);
  const smalls=[imgs[1],imgs[2]].map((p,i)=>shot(p,smW,smH,`position:absolute;top:${i?s2Top:s1Top}px;left:96px;z-index:4;`)).join('');
  return `
    ${shot(imgs[0],heroW,heroH,`position:absolute;top:${hTop}px;left:50%;transform:translateX(-50%);z-index:4;`)}
    ${smalls}
    <div class="panel" style="left:${96+smW+42}px;top:${textMid}px;transform:translateY(-50%)">
      ${cfg.eyebrow?`<div class="eyebrow">${cfg.eyebrow}</div>`:''}
      <div class="head">${hl(cfg.headline)}</div>
      ${cfg.sub?`<div class="sub" style="max-width:330px">${cfg.sub}</div>`:''}
    </div>`;
}

function gridLayout(cfg,T,accent){
  const imgs=(cfg.images||[]).slice(0,4);
  const gw=cfg.tileW||398, gh=cfg.tileH||340, gap=18;
  const gridW=gw*2+gap, gLeft=Math.round((1000-gridW)/2), gTop=cfg.gridTop||430;
  const tiles=imgs.map((p,i)=>{const r=Math.floor(i/2),c=i%2;return shot(p,gw,gh,`position:absolute;left:${gLeft+c*(gw+gap)}px;top:${gTop+r*(gh+gap)}px;z-index:4;`);}).join('');
  const ctaTop=gTop+gh*2+gap+42;
  const cta=(cfg.cta||[]).map(s=>s.hi?`<span class="hi">${s.t}</span>`:`<span>${s.t}</span>`).join(' ');
  const badge=cfg.badge?`<div class="sticker" style="top:${(cfg.badgeTop!=null?cfg.badgeTop:(gTop-104))}px">${cfg.badge}</div>`:'';
  return `
    <div class="ctac" style="top:${cfg.headTop||150}px">${cfg.eyebrow?`<div class="eyebrow" style="margin-bottom:14px">${cfg.eyebrow}</div>`:''}<div class="head${cfg.titleBold?' gt':''}">${hl(cfg.headline)}</div></div>
    ${badge}
    ${tiles}
    ${cfg.cta?`<div class="ctac" style="top:${ctaTop}px"><div class="cta">${cta}</div></div>`:''}`;
}
function html(cfg){
  const T=theme(cfg);
  const accent=cfg.accent||CORAL;
  const inner = cfg.layout==='grid' ? gridLayout(cfg,T,accent) : cfg.layout==='tophero' ? topHero(cfg,T) : panelStrip(cfg,T);
  const bgLayer = cfg.bg
    ? `<div class="bgphoto" style="background-image:url('${imgURI(cfg.bg)}')"></div><div class="wash"></div><div class="lift"></div>`
    : `<div class="blob"></div>`;
  return `<!doctype html><html><head><meta charset="utf8"><style>
  ${font('Poppins','Poppins-SemiBold.ttf','600')}
  ${font('PoppinsMed','Poppins-Medium.ttf','500')}
  @font-face{font-family:'Bebas';src:url(data:font/otf;base64,${b64('fonts/BebasNeue-Regular.otf')});font-display:block;}
  @font-face{font-family:'Pacifico';src:url(data:font/ttf;base64,${b64('fonts/Pacifico-Regular.ttf')});font-display:block;}
  @font-face{font-family:'PoppinsBlack';src:url(data:font/ttf;base64,${b64('fonts/Poppins-Black.ttf')});font-weight:900;font-display:block;}
  @font-face{font-family:'Anton';src:url(data:font/ttf;base64,${b64('fonts/Anton.ttf')});font-display:block;}
  *{margin:0;padding:0;box-sizing:border-box;-webkit-font-smoothing:antialiased;}
  html,body{width:1000px;height:1500px;}
  .pin{position:relative;width:1000px;height:1500px;overflow:hidden;background:${T.page};}
  .blob{position:absolute;inset:0;background:${T.blob};}
  .bgphoto{position:absolute;inset:0;background-size:cover;background-position:center;}
  .wash{position:absolute;inset:0;background:${T.wash};}
  .lift{position:absolute;inset:0;background:linear-gradient(180deg,rgba(255,255,255,.10),rgba(255,255,255,0) 32%);}
  .frame{position:absolute;inset:26px;border:5px solid ${T.border};border-radius:34px;pointer-events:none;z-index:6;}
  .strip{position:absolute;top:50%;transform:translateY(-50%);display:flex;flex-direction:column;gap:18px;z-index:4;}
  .shot{border-radius:16px;overflow:hidden;background:#fff;border:6px solid #fff;box-shadow:0 18px 44px rgba(20,30,50,.28);}
  .shot img{width:100%;height:100%;object-fit:cover;object-position:top left;display:block;}
  .panel{position:absolute;right:66px;top:50%;transform:translateY(-50%);display:flex;flex-direction:column;align-items:flex-start;text-align:left;z-index:5;}
  .eyebrow{font-family:'Poppins';font-weight:600;letter-spacing:.16em;text-transform:uppercase;font-size:26px;color:${T.eb};line-height:1.3;margin-bottom:24px;}
  .head{font-family:'Bebas';color:${T.text};line-height:.9;letter-spacing:.01em;}
  .line{font-size:${cfg.size||90}px;}
  .acc{color:${accent};}
  .gt{font-family:'Anton';font-weight:400;letter-spacing:.01em;line-height:1.0;}
  .sub{font-family:'PoppinsMed';font-weight:500;color:${T.sub};font-size:31px;line-height:1.4;margin-top:28px;max-width:400px;}
  .ctac{position:absolute;left:64px;right:64px;text-align:center;z-index:5;}
  .cta{font-family:'Bebas';color:${T.text};font-size:62px;line-height:1.02;letter-spacing:.01em;}
  .hi{background:${accent};color:#fff;border-radius:14px;padding:.10em .26em .02em;-webkit-box-decoration-break:clone;box-decoration-break:clone;}
  .sticker{position:absolute;left:50%;transform:translateX(-50%) rotate(-5deg);white-space:nowrap;z-index:5;font-family:'Pacifico';font-size:${cfg.badgeSize||84}px;line-height:1.2;color:${T.stickerFill};-webkit-text-stroke:30px ${accent};paint-order:stroke fill;filter:${T.stickerFx};}
  .logo{position:absolute;bottom:158px;left:50%;transform:translateX(-50%);width:250px;z-index:7;}
  </style></head><body>
  <div class="pin">${bgLayer}${inner}<img class="logo" src="${T.logo}"><div class="frame"></div></div></body></html>`;
}

(async()=>{
  const cfg = JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
  const out = process.argv[3]||'out.png';
  const browser = await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
  const page = await browser.newPage({viewport:{width:1000,height:1500},deviceScaleFactor:2});
  await page.setContent(html(cfg),{waitUntil:'networkidle'});
  await page.evaluate(()=>document.fonts.ready);
  await page.waitForTimeout(200);
  await page.locator('.pin').screenshot({path:out});
  await browser.close();
  console.log('rendered',out);
})();
