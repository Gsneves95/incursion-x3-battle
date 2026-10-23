// §363 — CENA DISCRETA: a arte de turno fica escurecida (não compete com as habilidades). PROVA: a luminância média da
// área da cena é MENOR que a luminância média dos 12 botões de habilidade, no meu turno e no turno do oponente.
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const sharp = require('sharp');
function acharChromium(){ if(process.env.INCURSION_CHROMIUM) return process.env.INCURSION_CHROMIUM;
  try{ const base='/opt/pw-browsers'; const d=fs.readdirSync(base).filter(x=>/^chromium-\d+$/.test(x)).sort().pop();
    if(d){ const b=path.join(base,d,'chrome-linux','chrome'); if(fs.existsSync(b)) return b; } }catch(e){} return undefined; }
let falhas=0; const ok=(c,m)=>{ if(!c){ falhas++; console.log('  XX '+m); } else console.log('  ok '+m); };
const distAbs='file://'+path.resolve(__dirname,'..','dist','incursion.html');
const BASE=`try{perfil.deuses={};ROSTER.slice(0,60).forEach(e=>perfil.deuses[e.key]={copias:2,obtidoEm:Date.now()});contaAtual={nick:'H',perfil,niveis:{},pontos:{},ranque:{pontos:1200},missoes:{ativa:null,progresso:{},liberados:[]}};}catch(e){}`;
const BOOT=(extra)=>`st=montarProvacao({aliados:['hades','nuwa','zeus'],inimigos:['poseidon','hera','apolo'],montar:{seed:3,comeca:0}});prova=null;campanha=null;dominio=null;vsCPU=true;IA_LADO=1;try{pararRelogio();}catch(e){}try{ELEMS.forEach(e=>st.lados[0].orbs[e]=9);}catch(e){}st.ativo=0;foco=st.lados[0].units[0].uid;armado=null;detalhe=null;painelRecolhido=false;ir('batalha',{},{substituir:true});render();${extra||''}{var g=document.getElementById('gsplash');if(g)g.remove();}`;
async function lum(buf, r){ const {data,info}=await sharp(buf).extract({left:Math.max(0,Math.round(r.x)),top:Math.max(0,Math.round(r.y)),width:Math.max(1,Math.round(r.w)),height:Math.max(1,Math.round(r.h))}).raw().toBuffer({resolveWithObject:true});
  let s=0,n=0; const ch=info.channels; for(let i=0;i<data.length;i+=ch){ s+=0.299*data[i]+0.587*data[i+1]+0.114*data[i+2]; n++; } return s/n; }
(async()=>{
  const browser=await chromium.launch({executablePath:acharChromium(),headless:true,args:['--no-sandbox']});
  console.log('== §363 — a cena é mais escura que os botões de habilidade ==');
  for(const [nome,extra] of [['meu turno',''],['turno do oponente',`st.ativo=1;IA_LADO=0;armado=null;detalhe=null;render();`]]){
    const ctx=await browser.newContext({viewport:{width:780,height:360},deviceScaleFactor:1});
    const page=await ctx.newPage(); await page.goto(distAbs,{waitUntil:'load'});
    await page.evaluate(([b,s])=>{eval(b);eval(s);},[BASE,BOOT(extra)]); await page.waitForTimeout(250);
    const rects=await page.evaluate(()=>{const R=el=>{const r=el.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height};};
      return {cena:R(document.querySelector('.b5-cena')), skills:[...document.querySelectorAll('.bt-skill[data-sk]')].map(R)};});
    const buf=await page.screenshot();
    const cenaL=await lum(buf, rects.cena);
    let skL=0; for(const s of rects.skills) skL+=await lum(buf,s); skL/=rects.skills.length;
    ok(cenaL < skL, `${nome}: luminância da cena (${cenaL.toFixed(1)}) < luminância dos ${rects.skills.length} botões (${skL.toFixed(1)})`);
    await ctx.close();
  }
  await browser.close();
  console.log(falhas===0?'\n>>> CENA_DISCRETA OK':`\n>>> ${falhas} FALHA(S)`);
  process.exit(falhas?1:0);
})().catch(e=>{console.error(e.stack||e);process.exit(1);});
