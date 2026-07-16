const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const b64 = f => fs.readFileSync(path.join(__dirname, f)).toString('base64');
const font = (name, file, weight='400') =>
  `@font-face{font-family:'${name}';src:url(data:font/ttf;base64,${b64('fonts/'+file)});font-weight:${weight};font-display:block;}`;

const LOGO_COLOR = 'data:image/png;base64,' + fs.readFileSync(path.join(__dirname,'assets/logo_color.b64'),'utf8');
const LOGO_WHITE = 'data:image/png;base64,' + fs.readFileSync(path.join(__dirname,'assets/logo_white.b64'),'utf8');

const NAVY='#22334f', CORAL='#e8836f', MINT='#cdeee1', TEAL='#2f8f7d', SAGE='#b7d6c4';
const THEMES = {
  white: { bg:`#ffffff`, blob:`radial-gradient(1100px 900px at 78% 8%, ${MINT}55, transparent 60%), radial-gradient(900px 800px at 12% 96%, ${CORAL}22, transparent 60%)`,
           eyebrow:CORAL, text:NAVY, accent:CORAL, script:CORAL, frame:CORAL, logo:LOGO_COLOR, motif:NAVY },
  navy:  { bg:NAVY, blob:`radial-gradient(1100px 950px at 80% 6%, #34507288, transparent 60%), radial-gradient(900px 800px at 10% 98%, ${TEAL}44, transparent 60%)`,
           eyebrow:MINT, text:'#ffffff', accent:CORAL, script:MINT, frame:MINT, logo:LOGO_WHITE, motif:'#3a5578' },
};

function stackHTML(lines){
  return lines.map(ln=>{
    const parts = ln.map(seg=> seg.a ? `<span class="acc">${seg.t}</span>` : `<span>${seg.t}</span>`).join(' ');
    return `<div class="line">${parts}</div>`;
  }).join('');
}

function html(cfg){
  const t = THEMES[cfg.theme||'white'];
  return `<!doctype html><html><head><meta charset="utf8"><style>
  ${font('Poppins','Poppins-SemiBold.ttf','600')}
  ${font('PoppinsMed','Poppins-Medium.ttf','500')}
  ${font('Raleway','Raleway-Bold.ttf','700')}
  @font-face{font-family:'Bebas';src:url(data:font/otf;base64,${b64('fonts/BebasNeue-Regular.otf')});font-display:block;}
  @font-face{font-family:'Havana';src:url(data:font/otf;base64,${b64('fonts/Havana-Regular.otf')});font-display:block;}
  *{margin:0;padding:0;box-sizing:border-box;-webkit-font-smoothing:antialiased;}
  html,body{width:1000px;height:1500px;}
  .pin{position:relative;width:1000px;height:1500px;overflow:hidden;background:${t.bg};}
  .blob{position:absolute;inset:0;background:${t.blob};}
  .frame{position:absolute;inset:26px;border:5px solid ${t.frame};border-radius:34px;pointer-events:none;z-index:5;}
  .motif{position:absolute;top:120px;left:50%;transform:translateX(-50%);display:flex;gap:11px;opacity:.9;z-index:3;}
  .motif i{display:block;width:34px;height:7px;border-radius:4px;}
  .wrap{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;
        text-align:center;padding:${cfg.padTop||200}px 108px 0;z-index:4;}
  .eyebrow{font-family:'Poppins';font-weight:600;letter-spacing:.30em;text-transform:uppercase;
           font-size:31px;color:${t.eyebrow};margin-bottom:40px;padding-left:.30em;}
  .stack{font-family:'Bebas';color:${t.text};line-height:.94;letter-spacing:.005em;}
  .line{font-size:${cfg.size||150}px;}
  .acc{color:${t.accent};}
  .script{font-family:'Havana';color:${t.script};font-size:${cfg.scriptSize||140}px;
          margin-top:32px;margin-bottom:72px;line-height:.92;transform:rotate(-4deg);}
  .sub{font-family:'PoppinsMed';font-weight:500;color:${t.text};opacity:.9;font-size:33px;
       line-height:1.4;margin-top:0;max-width:720px;}
  .logo{position:absolute;bottom:78px;left:50%;transform:translateX(-50%);width:340px;z-index:6;}
  </style></head><body>
  <div class="pin">
    <div class="blob"></div>
    ${cfg.motif!==false?`<div class="motif">
      <i style="background:${MINT}"></i><i style="background:${CORAL}"></i>
      <i style="background:${TEAL}"></i><i style="background:${SAGE}"></i>
      <i style="background:${CORAL}"></i></div>`:''}
    <div class="wrap">
      ${cfg.eyebrow?`<div class="eyebrow">${cfg.eyebrow}</div>`:''}
      <div class="stack">${stackHTML(cfg.stack)}</div>
      ${cfg.script?`<div class="script">${(Array.isArray(cfg.script)?cfg.script:[cfg.script]).join('<br>')}</div>`:''}
      ${cfg.sub?`<div class="sub">${cfg.sub}</div>`:''}
    </div>
    <img class="logo" src="${t.logo}"/>
    <div class="frame"></div>
  </div></body></html>`;
}

function listHTML(cfg){
  const t = THEMES[cfg.theme||'white'];
  const items=(cfg.items||[]).map((it,i)=>`<div class="li"><span class="n">${i+1}</span><span class="t">${it}</span></div>`).join('');
  return `<!doctype html><html><head><meta charset="utf8"><style>
  ${font('Poppins','Poppins-SemiBold.ttf','600')}
  ${font('PoppinsMed','Poppins-Medium.ttf','500')}
  @font-face{font-family:'Bebas';src:url(data:font/otf;base64,${b64('fonts/BebasNeue-Regular.otf')});font-display:block;}
  *{margin:0;padding:0;box-sizing:border-box;-webkit-font-smoothing:antialiased;}
  html,body{width:1000px;height:1500px;}
  .pin{position:relative;width:1000px;height:1500px;overflow:hidden;background:${t.bg};}
  .blob{position:absolute;inset:0;background:${t.blob};}
  .frame{position:absolute;inset:26px;border:5px solid ${t.frame};border-radius:34px;pointer-events:none;z-index:5;}
  .motif{position:absolute;top:120px;left:50%;transform:translateX(-50%);display:flex;gap:11px;opacity:.9;z-index:3;}
  .motif i{display:block;width:34px;height:7px;border-radius:4px;}
  .wrap{position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;padding:150px 120px 210px;z-index:4;}
  .eyebrow{font-family:'Poppins';font-weight:600;letter-spacing:.20em;text-transform:uppercase;font-size:35px;color:${t.eyebrow};margin-bottom:54px;line-height:1.25;text-align:center;}
  .li{display:flex;align-items:center;gap:30px;margin-bottom:38px;}
  .n{font-family:'Bebas';color:${t.accent};font-size:100px;line-height:1;flex:0 0 78px;text-align:center;text-box:trim-both cap alphabetic;}
  .t{font-family:'PoppinsMed';font-weight:500;color:${t.text};font-size:42px;line-height:1.15;}
  .logo{position:absolute;bottom:78px;left:50%;transform:translateX(-50%);width:320px;z-index:6;}
  </style></head><body>
  <div class="pin"><div class="blob"></div>
    ${cfg.motif!==false?`<div class="motif"><i style="background:${MINT}"></i><i style="background:${CORAL}"></i><i style="background:${TEAL}"></i><i style="background:${SAGE}"></i><i style="background:${CORAL}"></i></div>`:''}
    <div class="wrap">${cfg.eyebrow?`<div class="eyebrow">${cfg.eyebrow}</div>`:''}${items}</div>
    <img class="logo" src="${t.logo}"/><div class="frame"></div>
  </div></body></html>`;
}

(async()=>{
  const cfg = JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
  const out = process.argv[3]||'out.png';
  const browser = await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
  const page = await browser.newPage({viewport:{width:1000,height:1500},deviceScaleFactor:2});
  await page.setContent((cfg.mode==='list'?listHTML:html)(cfg),{waitUntil:'networkidle'});
  await page.evaluate(()=>document.fonts.ready);
  await page.waitForTimeout(250);
  await page.locator('.pin').screenshot({path:out});
  await browser.close();
  console.log('rendered',out);
})();
