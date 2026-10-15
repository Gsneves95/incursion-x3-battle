// batalha_painel.test.js (§333) — o PAINEL DE BAIXO é uma GRADE DE COLUNAS: nenhum filho sai da caixa, as colunas
// não se intersectam, nenhum texto transborda da sua coluna (a descrição ROLA dentro da coluna 2) e o título não
// corta com "…". Prova as 5 situações (deus / habilidade armada / habilidade lida / efeito / resumo), incluindo a
// descrição MAIS LONGA do jogo (babi · Frenesi Sanguinário), em 780×360 e 1280×720. Chromium (rect real).
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
function acharChromium(){ if(process.env.INCURSION_CHROMIUM) return process.env.INCURSION_CHROMIUM;
  try{ const base='/opt/pw-browsers'; const d=fs.readdirSync(base).filter(x=>/^chromium-\d+$/.test(x)).sort().pop();
    if(d){ const b=path.join(base,d,'chrome-linux','chrome'); if(fs.existsSync(b)) return b; } }catch(e){} return undefined; }
let falhas=0; const ok=(c,m)=>{ if(!c){ falhas++; console.log('  XX '+m); } };
const distAbs=path.resolve(__dirname,'..','dist','incursion.html');

const BOOT=`
  st=montarProvacao({aliados:['hades','babi','zeus'],inimigos:['poseidon','hera','apolo'],montar:{seed:3,comeca:0}});
  prova=null;campanha=null;dominio=null;vsCPU=true;IA_LADO=1;try{pararRelogio();}catch(e){} try{ELEMS.forEach(e=>st.lados[0].orbs[e]=9);}catch(e){}
  st.ativo=0;foco=st.lados[0].units[0].uid;armado=null;detalhe=null;resumoTurno=null; ir('batalha',{},{substituir:true});render();`;
const SIT={
  'deus inspecionado':`detalhe=null;armado=null; infoUnidade(st.lados[1].units[0].uid);`,
  'habilidade armada':`armado=null;detalhe=null; armar(st.lados[0].units[0].uid,'milagre');`,
  'habilidade lida':`armado=null; lerHabilidade(st.lados[0].units[2].uid,'habilidade');`,
  'efeito':`armado=null;detalhe=null; st.lados[0].units[1].efeitos=[{type:'vulneravel',v:6,dur:2,origem:st.lados[1].units[0].uid}]; infoEfeito(st.lados[0].units[1].uid,0);`,
  'resumo CPU':`armado=null;detalhe=null;foco=null; resumoTurno=[{turno:st.turno,tipo:'acao',origem:'poseidon',slot:'milagre'},{turno:st.turno,tipo:'dano',origem:'poseidon',alvo:'hades',valor:14}]; render();`,
  'armada (desc mais longa)':`armado=null;detalhe=null; armar(st.lados[0].units[1].uid,'milagre');`,   // babi · Frenesi Sanguinário (168 chars)
};

(async()=>{
  const browser=await chromium.launch({executablePath:acharChromium(),headless:true,args:['--no-sandbox']});
  for(const E of [{nome:'780',w:780,h:360},{nome:'1280',w:1280,h:720}]){
    const ctx=await browser.newContext({viewport:{width:E.w,height:E.h},deviceScaleFactor:2});
    const page=await ctx.newPage(); await page.goto('file://'+distAbs,{waitUntil:'load'});
    console.log(`== §333 painel ${E.nome}×${E.h} ==`);
    for(const [nome,extra] of Object.entries(SIT)){
      await page.evaluate(BOOT); await page.evaluate(extra); await page.waitForTimeout(70);
      const m=await page.evaluate(()=>{
        const R=el=>el.getBoundingClientRect(); const pan=document.querySelector('.bt-panel'); if(!pan) return {err:1};
        const rp=R(pan); const cols=[...pan.children].map(c=>({cls:c.className.split(' ')[0],r:R(c)}));
        const fora=cols.filter(c=>c.r.left<rp.left-0.5||c.r.right>rp.right+0.5||c.r.top<rp.top-0.5||c.r.bottom>rp.bottom+0.5).map(c=>c.cls);
        let inter=null; for(let i=0;i<cols.length&&!inter;i++)for(let j=i+1;j<cols.length;j++){const a=cols[i].r,b=cols[j].r;
          const ix=Math.min(a.right,b.right)-Math.max(a.left,b.left), iy=Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top);
          if(ix>1&&iy>1){inter=cols[i].cls+'×'+cols[j].cls;break;}}
        const tit=pan.querySelector('.bt-panel__titulo'), rod=pan.querySelector('.bt-panel__rodape');
        const desc=pan.querySelector('.bt-panel__desc'), col2=pan.querySelector('.bt-panel__conteudo');
        return { err:0, fora, inter,
          titCorta: tit?(tit.scrollWidth>tit.clientWidth+1):false,
          rodCorta: rod?(rod.scrollWidth>rod.clientWidth+1):false,
          descFora: (desc&&col2)?(R(desc).right>R(col2).right+0.5||R(desc).left<R(col2).left-0.5):false };
      },extra);
      ok(!m.err, `${E.nome} [${nome}]: o painel existe`);
      ok(m.err||m.fora.length===0, `${E.nome} [${nome}]: nenhum filho sai da caixa do painel` + (m.fora&&m.fora.length?` (${m.fora.join(', ')})`:''));
      ok(m.err||!m.inter, `${E.nome} [${nome}]: as colunas não se intersectam` + (m.inter?` (${m.inter})`:''));
      ok(m.err||!m.titCorta, `${E.nome} [${nome}]: o título não corta com "…"`);
      ok(m.err||!m.rodCorta, `${E.nome} [${nome}]: o rodapé não transborda`);
      ok(m.err||!m.descFora, `${E.nome} [${nome}]: a descrição fica dentro da coluna 2 (rola, não vaza)`);
    }
    // §333 item 6: no inimigo com a passiva ACESA, o "P" é legível (texto escuro, não cor de fundo).
    await page.evaluate(BOOT); await page.waitForTimeout(40);
    const pas=await page.evaluate(()=>{ const p=document.querySelector('.bt-portrait--foe .bt-portrait__pas.pas--on'); if(!p) return null;
      const cs=getComputedStyle(p); return {text:(p.textContent||'').trim(), color:cs.color}; });
    if(pas){ ok(pas.text==='P', `${E.nome}: o selo de passiva do inimigo mostra "P" (${pas.text})`);
      ok(/rgb\(\s*2[0-9],\s*2?[0-9],\s*[0-9]/.test(pas.color), `${E.nome}: o "P" do inimigo é escuro/legível (${pas.color})`); }
    await ctx.close();
  }
  await browser.close();
  console.log(falhas===0?'\n>>> BATALHA_PAINEL OK':`\n>>> ${falhas} FALHA(S)`);
  process.exit(falhas?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
