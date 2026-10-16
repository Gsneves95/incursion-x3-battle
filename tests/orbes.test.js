// orbes.test.js (§337) — as ORBES de elemento substituem a cor lisa em todo o jogo.
// (1) os 14 arquivos existem, são SVG válidos e têm ids com o prefixo do elemento;
// (2) no Chromium, na batalha (1846×852), o contador do topo e as bolinhas de custo usam <img> de orbe (não cor lisa).
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
function acharChromium(){ if(process.env.INCURSION_CHROMIUM) return process.env.INCURSION_CHROMIUM;
  try{ const base='/opt/pw-browsers'; const d=fs.readdirSync(base).filter(x=>/^chromium-\d+$/.test(x)).sort().pop();
    if(d){ const b=path.join(base,d,'chrome-linux','chrome'); if(fs.existsSync(b)) return b; } }catch(e){} return undefined; }
let falhas=0; const ok=(c,m)=>{ console.log((c?'  ok ':'  XX ')+m); if(!c) falhas++; };
const raiz=path.resolve(__dirname,'..');
const distAbs=path.join(raiz,'dist','incursion.html');

// ---- (1) arquivos ----
console.log('== §337 orbes: arquivos ==');
const ELEMS=['tempestade','umbra','mare','aurora','chama','verdejante','livre'];
const dir=path.join(raiz,'web','orbes');
for(const e of ELEMS){
  for(const suf of ['','_min']){
    const p=path.join(dir,`orbe_${e}${suf}.svg`);
    const existe=fs.existsSync(p); ok(existe, `existe web/orbes/orbe_${e}${suf}.svg`);
    if(!existe) continue;
    const s=fs.readFileSync(p,'utf8');
    ok(/^<svg[\s>]/.test(s.trim()) && /<\/svg>\s*$/.test(s.trim()) && /viewBox=/.test(s), `orbe_${e}${suf}.svg é SVG válido (svg+viewBox)`);
    ok(s.includes(`id="${e}-corpo"`), `orbe_${e}${suf}.svg tem ids com o prefixo "${e}-"`);
    // o _min não tem o círculo de halo (glow); o cheio tem
    if(suf==='_min') ok(!s.includes(`${e}-glow`) && /viewBox="24 24 80 80"/.test(s), `orbe_${e}_min.svg sem halo e viewBox 24 24 80 80`);
    else ok(s.includes(`${e}-glow`), `orbe_${e}.svg tem o halo (glow)`);
  }
}

const BOOT=`
  st=montarProvacao({aliados:['hades','ares','brigid'],inimigos:['poseidon','hera','apolo'],montar:{seed:3,comeca:0}});
  prova=null;campanha={_capIdx:0,_atoIdx:2};dominio=null;vsCPU=true;IA_LADO=1;try{pararRelogio();}catch(e){}
  st.lados[0].orbs.Umbra=3; st.lados[0].orbs.Chama=1;
  st.ativo=0;foco=st.lados[0].units[0].uid;armado=null;detalhe=null;
  ir('batalha',{},{substituir:true}); armar(st.lados[0].units[0].uid,'milagre'); render();`;

(async()=>{
  const browser=await chromium.launch({executablePath:acharChromium(),headless:true,args:['--no-sandbox']});
  const ctx=await browser.newContext({viewport:{width:1846,height:852},deviceScaleFactor:1});
  const page=await ctx.newPage(); await page.goto('file://'+distAbs,{waitUntil:'load'});
  await page.evaluate(BOOT); await page.waitForTimeout(150);
  console.log('== §337 orbes na batalha (Chromium) ==');
  const m=await page.evaluate(()=>{
    const bat=document.getElementById('batalha');
    const ebox=bat.querySelector('.bt-ebox');
    const orbTopo=ebox?ebox.querySelectorAll('img.orbe').length:0;
    // nenhuma célula de energia é mais um fundo de COR LISA (div com background-color sólido)
    const celFlat=ebox?[...ebox.querySelectorAll('div')].some(d=>{ const bg=getComputedStyle(d).backgroundColor; return bg&&bg!=='rgba(0, 0, 0, 0)'&&bg!=='transparent'&&d.offsetWidth>8&&d.offsetWidth<40&&Math.abs(d.offsetWidth-d.offsetHeight)<3; }):true;
    // bolinhas de custo nos botões de habilidade = <img> de orbe
    const skillOrbs=bat.querySelectorAll('.bt-skill img.orbe').length;
    // painel CUSTO = <img> de orbe (milagre armado: 2 Umbra + 1 livre)
    const painelOrbs=bat.querySelectorAll('.bt-panel img.orbe').length;
    // todas as orbes apontam p/ web/orbes/
    const todas=[...bat.querySelectorAll('img.orbe')];
    const srcOk=todas.length>0 && todas.every(i=>/orbes\/orbe_[a-z]+(_min)?\.svg$/.test(i.getAttribute('src')||''));
    return { orbTopo, celFlat, skillOrbs, painelOrbs, total:todas.length, srcOk };
  });
  ok(m.orbTopo>=2, `o contador do topo usa orbes (<img>): ${m.orbTopo}`);
  ok(!m.celFlat, 'nenhuma célula do contador é mais um quadrado de cor lisa');
  ok(m.skillOrbs>0, `as bolinhas de custo dos botões de habilidade são orbes (<img>): ${m.skillOrbs}`);
  ok(m.painelOrbs>=3, `o CUSTO do painel usa orbes (<img>): ${m.painelOrbs}`);
  ok(m.srcOk, 'toda orbe aponta p/ web/orbes/orbe_*.svg');
  await ctx.close(); await browser.close();
  console.log(falhas===0?'\n>>> ORBES OK':`\n>>> ${falhas} FALHA(S)`);
  process.exit(falhas?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
