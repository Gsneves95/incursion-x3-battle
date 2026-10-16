// orbes_server.test.js (§337b) — pelo SERVIDOR DE VERDADE (http, não file://): as orbes (e todo asset de web/) saem com
// Content-Type correto, nunca application/octet-stream — senão o navegador/WebView do celular não desenha o SVG.
const http = require('http');
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
function acharChromium(){ if(process.env.INCURSION_CHROMIUM) return process.env.INCURSION_CHROMIUM;
  try{ const base='/opt/pw-browsers'; const d=fs.readdirSync(base).filter(x=>/^chromium-\d+$/.test(x)).sort().pop();
    if(d){ const b=path.join(base,d,'chrome-linux','chrome'); if(fs.existsSync(b)) return b; } }catch(e){} return undefined; }
let falhas=0; const ok=(c,m)=>{ console.log((c?'  ok ':'  XX ')+m); if(!c) falhas++; };
const raiz=path.resolve(__dirname,'..');

// um arquivo representativo por extensão existente em web/ (prova que a tabela TIPOS cobre toda extensão presente)
function umPorExtensao(){
  const porExt={};
  (function anda(dir){ for(const f of fs.readdirSync(dir)){ const p=path.join(dir,f); const st=fs.statSync(p);
    if(st.isDirectory()) anda(p); else { const e=path.extname(f).toLowerCase(); if(e && !porExt[e]) porExt[e]=p; } } })(path.join(raiz,'web'));
  return porExt;
}

(async()=>{
  console.log('== §337b servidor: Content-Type das orbes e de todo asset de web/ ==');
  const { server } = require('../server/server.js');
  await new Promise(r => server.listen(0, r));
  const port = server.address().port;
  const GET = (caminho) => new Promise((res, rej) => { http.get({ host:'localhost', port, path:caminho }, r => {
    let buf=0; r.on('data',d=>buf+=d.length); r.on('end',()=>res({ status:r.statusCode, ct:r.headers['content-type']||'', len:buf })); }).on('error', rej); });

  // (a) as orbes do enunciado → 200 + image/svg+xml
  for(const c of ['/orbes/orbe_umbra.svg','/orbes/orbe_livre_min.svg']){
    const r=await GET(c); ok(r.status===200 && /image\/svg\+xml/.test(r.ct), `GET ${c} → 200 image/svg+xml (veio ${r.status} ${r.ct})`); }
  // (b) o servidor ignora a ?v=... (query) ao achar o arquivo
  { const r=await GET('/orbes/orbe_umbra.svg?v=202610162320'); ok(r.status===200 && /image\/svg\+xml/.test(r.ct), `GET da orbe com ?v= → 200 image/svg+xml (o servidor ignora a query)`); }
  // (c) NENHUMA extensão de web/ cai em application/octet-stream
  const porExt=umPorExtensao();
  for(const ext in porExt){ const rel='/'+path.relative(path.join(raiz,'web'), porExt[ext]).split(path.sep).join('/');
    const r=await GET(rel); ok(r.status===200 && !/octet-stream/.test(r.ct) && r.ct, `extensão ${ext}: ${rel} → ${r.ct} (não octet-stream)`); }

  // (d) no Chromium, pelo http (não file://), toda <img.orbe> carrega e um elemento com orbeBg tem o fundo carregado
  console.log('== §337b no navegador pelo http: as orbes desenham ==');
  const browser=await chromium.launch({executablePath:acharChromium(),headless:true,args:['--no-sandbox']});
  const page=await (await browser.newContext({viewport:{width:1846,height:852},deviceScaleFactor:1})).newPage();
  await page.goto(`http://localhost:${port}/`,{waitUntil:'load'});
  await page.evaluate(`
    st=montarProvacao({aliados:['hades','ares','brigid'],inimigos:['poseidon','hera','apolo'],montar:{seed:3,comeca:0}});
    prova=null;campanha={_capIdx:0,_atoIdx:2};dominio=null;vsCPU=true;IA_LADO=1;try{pararRelogio();}catch(e){}
    st.lados[0].orbs.Umbra=3; st.lados[0].orbs.Chama=1;
    st.ativo=0;foco=st.lados[0].units[0].uid;armado=null;detalhe=null;
    ir('batalha',{},{substituir:true}); armar(st.lados[0].units[0].uid,'milagre'); render();`);
  await page.waitForTimeout(500);   // deixa as imagens carregarem
  const r=await page.evaluate(async ()=>{
    const bat=document.getElementById('batalha');
    const imgs=[...bat.querySelectorAll('img.orbe')];
    const todasOk = imgs.length>0 && imgs.every(i=>i.complete && i.naturalWidth>0);
    // orbeBg: pega um elemento com background-image de orbe e carrega a URL via Image()
    let bgOk=false, bgUrl='';
    const comBg=[...bat.querySelectorAll('*')].find(el=>/orbes\/orbe_/.test(getComputedStyle(el).backgroundImage||''));
    if(comBg){ const m=/url\("?([^")]+)"?\)/.exec(getComputedStyle(comBg).backgroundImage); if(m){ bgUrl=m[1];
      bgOk=await new Promise(res=>{ const im=new Image(); im.onload=()=>res(im.naturalWidth>0); im.onerror=()=>res(false); im.src=m[1]; }); } }
    else { bgOk=true; }   // não há orbeBg na batalha (os dots de batalha são <img>); não falha por isso
    return { n:imgs.length, todasOk, bgOk, bgUrl };
  });
  ok(r.todasOk, `toda <img.orbe> carregou pelo http (${r.n} imagens, naturalWidth>0)`);
  // orbeBg: a tela de Níveis usa cost__pip/elemento com background de orbe — carrega a URL via Image()
  await page.evaluate(()=>{ try{ir('niveis',{key:'hades'},{substituir:true});}catch(e){} try{render();}catch(e){} });
  await page.waitForTimeout(300);
  const b=await page.evaluate(async ()=>{
    const el=[...document.querySelectorAll('*')].find(x=>/orbes\/orbe_/.test(getComputedStyle(x).backgroundImage||''));
    if(!el) return { achou:false };
    const m=/url\("?([^")]+)"?\)/.exec(getComputedStyle(el).backgroundImage);
    const okLoad=await new Promise(res=>{ const im=new Image(); im.onload=()=>res(im.naturalWidth>0); im.onerror=()=>res(false); im.src=m[1]; });
    return { achou:true, okLoad, url:m[1] };
  });
  ok(b.achou && b.okLoad, `um elemento com orbeBg (fora da batalha) tem o fundo carregado (${b.url||'não achou'})`);
  await browser.close();
  server.close();
  console.log(falhas===0?'\n>>> ORBES_SERVER OK':`\n>>> ${falhas} FALHA(S)`);
  process.exit(falhas?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
