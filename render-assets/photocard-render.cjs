// PHOTO CARD templates — J&B text over a lifestyle background (bright treatment).
// Styles: editorial | sticker | band | stacked | list2 | cardlist
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const b64 = f => fs.readFileSync(path.join(__dirname, f)).toString('base64');
const font = (name, file) =>
  `@font-face{font-family:'${name}';src:url(data:font/ttf;base64,${b64('fonts/'+file)});font-display:block;}`;
const LOGO_WHITE = 'data:image/png;base64,' + fs.readFileSync(path.join(__dirname,'assets/logo_white.b64'),'utf8');
const LOGO_COLOR = 'data:image/png;base64,' + fs.readFileSync(path.join(__dirname,'assets/logo_color.b64'),'utf8');
const NAVY='#22334f', CORAL='#e8836f', MINT='#cdeee1';
const bgURI = p => `data:image/${path.extname(p).slice(1)};base64,`+fs.readFileSync(p).toString('base64');

function head(){return `<meta charset="utf8"><style>
  ${font('Poppins','Poppins-SemiBold.ttf')}
  ${font('PoppinsMed','Poppins-Medium.ttf')}
  @font-face{font-family:'Bebas';src:url(data:font/otf;base64,${b64('fonts/BebasNeue-Regular.otf')});font-display:block;}
  @font-face{font-family:'Havana';src:url(data:font/otf;base64,${b64('fonts/Havana-Regular.otf')});font-display:block;}
  *{margin:0;padding:0;box-sizing:border-box;-webkit-font-smoothing:antialiased;}
  html,body{width:1000px;height:1500px;}
  .pin{position:relative;width:1000px;height:1500px;overflow:hidden;}
  .bg{position:absolute;inset:0;background-size:cover;background-position:center;}
  .frame{position:absolute;inset:26px;border:5px solid ${CORAL};border-radius:34px;pointer-events:none;z-index:8;}
  .lift{position:absolute;inset:0;z-index:2;background:linear-gradient(180deg,rgba(255,255,255,.14),rgba(255,255,255,0) 30%);}
  .wash{position:absolute;inset:0;z-index:2;background:rgba(255,255,255,.36);}
</style>`;}

function editorial(cfg){const bg=bgURI(cfg.bg);return `<!doctype html><html><head>${head()}<style>
  .halo{position:absolute;left:50%;top:46%;transform:translate(-50%,-50%);width:900px;height:760px;z-index:3;
        background:radial-gradient(ellipse at center, rgba(255,255,255,.82) 0%, rgba(255,255,255,.55) 42%, rgba(255,255,255,0) 72%);}
  .wrap{position:absolute;inset:0;z-index:4;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:150px 100px;}
  .eyebrow{font-family:'Poppins';font-weight:600;letter-spacing:.30em;text-transform:uppercase;font-size:27px;color:${CORAL};margin-bottom:26px;padding-left:.30em;}
  .hl{font-family:'Bebas';color:${NAVY};font-size:${cfg.size||120}px;line-height:.95;letter-spacing:.01em;}
  .script{font-family:'Havana';color:${CORAL};font-size:${cfg.scriptSize||162}px;line-height:1;transform:rotate(-4deg);margin:30px 0;text-box:trim-both ex text;}
  .logo{position:absolute;bottom:70px;left:50%;transform:translateX(-50%);z-index:7;}
  .logo img{width:300px;}
</style></head><body><div class="pin">
  <div class="bg" style="background-image:url('${bg}')"></div><div class="wash"></div><div class="lift"></div><div class="halo"></div>
  <div class="wrap">${cfg.eyebrow?`<div class="eyebrow">${cfg.eyebrow}</div>`:''}
    ${(cfg.top||[]).map(l=>`<div class="hl">${l}</div>`).join('')}
    ${cfg.script?`<div class="script">${cfg.script}</div>`:''}
    ${(cfg.bottom||[]).map(l=>`<div class="hl">${l}</div>`).join('')}</div>
  <div class="logo"><img src="${LOGO_COLOR}"></div><div class="frame"></div></div></body></html>`;}

function sticker(cfg){const bg=bgURI(cfg.bg);return `<!doctype html><html><head>${head()}<style>
  .wrap{position:absolute;inset:0;z-index:4;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:150px 90px;}
  .block{background:${CORAL};border:8px solid #fff;border-radius:40px;box-shadow:0 24px 60px rgba(34,51,79,.32);
         padding:52px 60px 60px;text-align:center;}
  .kick{font-family:'Poppins';font-weight:600;letter-spacing:.24em;text-transform:uppercase;font-size:26px;color:#fff;opacity:.9;margin-bottom:18px;padding-left:.24em;}
  .hl{font-family:'Bebas';color:#fff;font-size:${cfg.size||150}px;line-height:.92;letter-spacing:.01em;}
  .tag{font-family:'Havana';color:#fff;font-size:${cfg.tagSize||112}px;line-height:.85;margin-top:8px;transform:rotate(-3deg);}
  .logo{position:absolute;bottom:66px;left:50%;transform:translateX(-50%);z-index:7;}
  .logo img{width:290px;}
  .chip{position:absolute;bottom:60px;left:50%;transform:translateX(-50%);z-index:6;background:#fff;border-radius:40px;padding:16px 30px;box-shadow:0 10px 30px rgba(34,51,79,.25);}
  .chip img{width:250px;display:block;}
</style></head><body><div class="pin">
  <div class="bg" style="background-image:url('${bg}')"></div><div class="wash"></div><div class="lift"></div>
  <div class="wrap"><div class="block">${cfg.kick?`<div class="kick">${cfg.kick}</div>`:''}
    ${(cfg.head||[]).map(l=>`<div class="hl">${l}</div>`).join('')}
    ${cfg.tag?`<div class="tag">${cfg.tag}</div>`:''}</div></div>
  <div class="chip"><img src="${LOGO_COLOR}"></div><div class="frame"></div></div></body></html>`;}

function band(cfg){const bg=bgURI(cfg.bg);
  const hlHTML=cfg.head.map(line=>`<div class="hl">${line.map(s=>s.hi?`<span class="hi">${s.t}</span>`:`<span>${s.t}</span>`).join(' ')}</div>`).join('');
  return `<!doctype html><html><head>${head()}<style>
  .head{position:absolute;top:150px;left:0;right:0;z-index:4;text-align:center;padding:0 84px;}
  .hl{font-family:'Bebas';color:${NAVY};font-size:${cfg.size||120}px;line-height:1.0;letter-spacing:.01em;margin-bottom:46px;}
  .hi{background:${CORAL};color:#fff;padding:.24em .2em .06em;border-radius:16px;line-height:1;-webkit-box-decoration-break:clone;box-decoration-break:clone;}
  .cap{position:absolute;left:26px;right:26px;bottom:26px;z-index:5;background:${NAVY};border-radius:0 0 30px 30px;padding:44px 60px 40px;display:flex;flex-direction:column;align-items:center;text-align:center;}
  .cap .c{font-family:'PoppinsMed';font-weight:500;color:#fff;font-size:34px;line-height:1.35;}
  .cap img{width:210px;margin-top:20px;}
</style></head><body><div class="pin">
  <div class="bg" style="background-image:url('${bg}')"></div><div class="wash"></div><div class="lift"></div>
  <div class="head">${hlHTML}</div>
  <div class="cap"><div class="c">${cfg.cap}</div><img src="${LOGO_WHITE}"></div><div class="frame"></div></div></body></html>`;}

function stacked(cfg){const bg=bgURI(cfg.bg);return `<!doctype html><html><head>${head()}<style>
  .wrap{position:absolute;left:0;right:0;top:150px;z-index:4;display:flex;flex-direction:column;align-items:flex-end;padding:0 70px;}
  .script{display:inline-block;font-family:'Havana';color:${CORAL};font-size:${cfg.scriptSize||120}px;line-height:1;transform:rotate(-4deg);margin:0 0 20px 0;background:rgba(255,255,255,.92);padding:.28em .3em .16em;border-radius:18px;}
  .row{margin-bottom:16px;}
  .row .w{display:inline-block;font-family:'Bebas';color:${NAVY};font-size:${cfg.size||130}px;line-height:1;letter-spacing:.01em;background:rgba(255,255,255,.92);padding:.22em .2em .04em;border-radius:10px;}
  .logo{position:absolute;bottom:66px;left:50%;transform:translateX(-50%);z-index:7;}
  .logo img{filter:drop-shadow(0 1px 10px rgba(255,255,255,.9)) drop-shadow(0 1px 3px rgba(255,255,255,.9));}
  .logo img{width:250px;display:block;}
</style></head><body><div class="pin">
  <div class="bg" style="background-image:url('${bg}')"></div><div class="wash"></div><div class="lift"></div>
  <div class="wrap">${cfg.script?`<div class="script">${cfg.script}</div>`:''}
    ${(cfg.words||[]).map(w=>`<div class="row"><span class="w">${w}</span></div>`).join('')}</div>
  <div class="logo"><img src="${LOGO_COLOR}"></div><div class="frame"></div></div></body></html>`;}

function list2(cfg){const bg=bgURI(cfg.bg);
  const items=(cfg.items||[]).map((t,i)=>`<div class="li"><span class="n">${i+1}</span><span class="t">${t}</span></div>`).join('');
  return `<!doctype html><html><head>${head()}<style>
  .wash{background:rgba(255,255,255,.52);}
  .wrap{position:absolute;inset:0;z-index:4;display:flex;flex-direction:column;justify-content:center;padding:150px 96px 200px;}
  .eyebrow{font-family:'Poppins';font-weight:600;letter-spacing:.16em;text-transform:uppercase;font-size:34px;color:${NAVY};line-height:1.25;margin-bottom:52px;}
  .li{display:flex;align-items:center;gap:30px;margin-bottom:34px;}
  .n{font-family:'Bebas';color:${CORAL};font-size:96px;line-height:1;flex:0 0 74px;text-align:center;text-box:trim-both cap alphabetic;}
  .t{font-family:'PoppinsMed';font-weight:500;color:${NAVY};font-size:40px;line-height:1.15;}
  .logo{position:absolute;bottom:70px;left:50%;transform:translateX(-50%);z-index:7;}
  .logo img{width:300px;}
  </style></head><body><div class="pin">
  <div class="bg" style="background-image:url('${bg}')"></div><div class="wash"></div><div class="lift"></div>
  <div class="wrap"><div class="eyebrow">${cfg.eyebrow||''}</div>${items}</div>
  <div class="logo"><img src="${LOGO_COLOR}"></div><div class="frame"></div></div></body></html>`;}

function cardlist(cfg){const bg=bgURI(cfg.bg);
  const items=(cfg.items||[]).map((t,i)=>`<div class="li"><span class="n">${i+1}</span><span class="t">${t}</span></div>`).join('');
  return `<!doctype html><html><head>${head()}<style>
  .scrim{position:absolute;inset:0;z-index:2;background:linear-gradient(180deg,rgba(34,51,79,.14),rgba(34,51,79,0) 32%);}
  .card{position:absolute;left:60px;right:60px;top:802px;bottom:58px;z-index:4;background:#fff;border-radius:30px;box-shadow:0 24px 60px rgba(34,51,79,.30);padding:40px 54px;display:flex;flex-direction:column;}
  .eyebrow{font-family:'Poppins';font-weight:600;letter-spacing:.14em;text-transform:uppercase;font-size:31px;color:${NAVY};text-align:center;line-height:1.25;margin-bottom:6px;}
  .list{flex:1;display:flex;flex-direction:column;justify-content:center;}
  .li{display:flex;align-items:center;gap:26px;margin:13px 0;}
  .n{font-family:'Bebas';color:${CORAL};font-size:78px;line-height:1;flex:0 0 62px;text-align:center;text-box:trim-both cap alphabetic;}
  .t{font-family:'PoppinsMed';font-weight:500;color:${NAVY};font-size:37px;line-height:1.12;}
  .logo{width:250px;align-self:center;}
  </style></head><body><div class="pin">
  <div class="bg" style="background-image:url('${bg}')"></div><div class="scrim"></div>
  <div class="card"><div class="eyebrow">${cfg.eyebrow||''}</div><div class="list">${items}</div><img class="logo" src="${LOGO_COLOR}"></div>
  <div class="frame"></div></div></body></html>`;}

(async()=>{
  const cfg = JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
  const out = process.argv[3]||'out.png';
  const fn = {editorial,sticker,band,stacked,list2,cardlist}[cfg.style]||editorial;
  const browser = await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
  const page = await browser.newPage({viewport:{width:1000,height:1500},deviceScaleFactor:2});
  await page.setContent(fn(cfg),{waitUntil:'networkidle'});
  await page.evaluate(()=>document.fonts.ready);
  await page.waitForTimeout(250);
  await page.locator('.pin').screenshot({path:out});
  await browser.close();
  console.log('rendered',out);
})();
