// batalha_painel.test.js (§335) — o BattleDetailPanel do design do dono: grade 840 | 564 | resto. Prova, no Chromium
// (rect real, em 1846×852 / escala 1), as 5 situações do §333b (deus / habilidade lida / armada / efeito / resumo):
// nenhum filho sai da caixa do painel; as 3 colunas não se intersectam; o conteúdo por situação é o esperado
// (VIDA|ELEMENTO; OUTRAS HABILIDADES com a mini destacada; CANCELAR + mira; TURNOS|aplicado; RESUMO). E §334: nenhum
// botão em DISCO mostra pixel claro nos cantos (mede o pixel real via screenshot).
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
let sharp; try { sharp = require('sharp'); } catch (e) { sharp = null; }
function acharChromium(){ if(process.env.INCURSION_CHROMIUM) return process.env.INCURSION_CHROMIUM;
  try{ const base='/opt/pw-browsers'; const d=fs.readdirSync(base).filter(x=>/^chromium-\d+$/.test(x)).sort().pop();
    if(d){ const b=path.join(base,d,'chrome-linux','chrome'); if(fs.existsSync(b)) return b; } }catch(e){} return undefined; }
let falhas=0; const ok=(c,m)=>{ if(!c){ falhas++; console.log('  XX '+m); } };
const distAbs=path.resolve(__dirname,'..','dist','incursion.html');

const BOOT=`
  st=montarProvacao({aliados:['hades','babi','zeus'],inimigos:['poseidon','hera','apolo'],montar:{seed:3,comeca:0}});
  prova=null;campanha=null;dominio=null;vsCPU=true;IA_LADO=1;try{pararRelogio();}catch(e){} try{ELEMS.forEach(e=>st.lados[0].orbs[e]=9);}catch(e){}
  st.ativo=0;foco=st.lados[0].units[0].uid;armado=null;detalhe=null;resumoTurno=null; ir('batalha',{},{substituir:true});render();
  { var _g=document.getElementById('gsplash'); if(_g)_g.remove(); }`;
const SIT={
  'deus':`detalhe=null;armado=null; infoUnidade(st.lados[1].units[0].uid);`,
  'habilidade lida':`armado=null; lerHabilidade(st.lados[0].units[2].uid,'habilidade');`,
  'armada':`armado=null;detalhe=null; armar(st.lados[0].units[0].uid,'milagre');`,
  'efeito':`armado=null;detalhe=null; st.lados[0].units[1].efeitos=[{type:'vulneravel',v:6,dur:2,origem:st.lados[1].units[0].uid}]; infoEfeito(st.lados[0].units[1].uid,0);`,
  'resumo':`armado=null;detalhe=null;foco=null; resumoTurno=[{turno:st.turno,tipo:'acao',origem:'poseidon',slot:'milagre'},{turno:st.turno,tipo:'dano',origem:'poseidon',alvo:'hades',valor:14}]; render();`,
  'armada (desc mais longa)':`armado=null;detalhe=null; armar(st.lados[0].units[1].uid,'milagre');`,
};

(async()=>{
  const browser=await chromium.launch({executablePath:acharChromium(),headless:true,args:['--no-sandbox']});
  const ctx=await browser.newContext({viewport:{width:1846,height:852},deviceScaleFactor:1});
  const page=await ctx.newPage(); await page.goto('file://'+distAbs,{waitUntil:'load'});
  console.log('== §335 painel @1846×852 ==');
  for(const [nome,extra] of Object.entries(SIT)){
    await page.evaluate(BOOT); await page.evaluate(extra); await page.waitForTimeout(70);
    const m=await page.evaluate(()=>{
      const R=el=>el.getBoundingClientRect(); const pan=document.querySelector('.b5-painel'); if(!pan) return {err:1};
      const rp=R(pan); const cols=[...pan.children].map(c=>({r:R(c)}));
      const fora=cols.filter(c=>c.r.left<rp.left-0.5||c.r.right>rp.right+0.5||c.r.top<rp.top-0.5||c.r.bottom>rp.bottom+0.5).length;
      let inter=false; for(let i=0;i<cols.length&&!inter;i++)for(let j=i+1;j<cols.length;j++){const a=cols[i].r,b=cols[j].r;
        const ix=Math.min(a.right,b.right)-Math.max(a.left,b.left), iy=Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top);
        if(ix>1&&iy>1){inter=true;break;}}
      const tit=pan.querySelector('.bt-panel__titulo');
      return { err:0, fora, inter, titCorta: tit?(tit.scrollWidth>tit.clientWidth+1):false,
        temMeio:!!pan.querySelector('.bt-panel__meio'), temMinis:!!pan.querySelector('.bt-panel__minis'),
        temCancel:!!pan.querySelector('.bt-cancel'), temMira:!!pan.querySelector('.bt-panel__mira'),
        selMini:!!pan.querySelector('.bt-mini.is-sel'), minilab:(pan.querySelector('.bt-panel__minilab')||{}).textContent||'',
        txt:(pan.textContent||'').replace(/\s+/g,' ') };
    });
    ok(!m.err, `[${nome}]: o painel existe`);
    ok(m.err||m.fora===0, `[${nome}]: nenhum filho sai da caixa do painel`);
    ok(m.err||!m.inter, `[${nome}]: as 3 colunas não se intersectam`);
    ok(m.err||!m.titCorta, `[${nome}]: o título não corta`);
  }
  // conteúdo por situação
  const sit=async(extra)=>{ await page.evaluate(BOOT); await page.evaluate(extra); await page.waitForTimeout(60);
    return page.evaluate(()=>{ const pan=document.querySelector('.b5-painel');
      return { minilab:(pan.querySelector('.bt-panel__minilab')||{}).textContent||'', sel:!!pan.querySelector('.bt-mini.is-sel'),
        cancel:!!pan.querySelector('.bt-cancel'), mira:!!pan.querySelector('.bt-panel__mira'), meio:(pan.querySelector('.bt-panel__meio')||{}).textContent||'',
        minis:pan.querySelectorAll('.bt-panel__minis .bt-mini').length, txt:(pan.textContent||'').replace(/\s+/g,' ') }; }); };
  let s;
  // §363b: as miniaturas não têm mais rótulo (a faixa é de altura fixa); valem a presença e o destaque da mini atual.
  s=await sit(SIT['deus']); ok(/VIDA/.test(s.meio)&&/ELEMENTO/.test(s.meio), 'deus: o meio mostra VIDA | ELEMENTO'); ok(s.minis>0&&!s.sel, 'deus: miniaturas das habilidades (nenhuma destacada)');
  s=await sit(SIT['habilidade lida']); ok(s.minis>0, 'lida: miniaturas das outras habilidades'); ok(s.sel, 'lida: a miniatura mostrada vem destacada'); ok(!s.cancel, 'lida: sem CANCELAR');
  s=await sit(SIT['armada']); ok(s.cancel, 'armada: coluna direita = CANCELAR'); ok(s.mira, 'armada: instrução com a mira'); ok(s.minis===0, 'armada: sem miniaturas');
  s=await sit(SIT['efeito']); ok(/TURNOS/.test(s.meio)&&/POR/.test(s.meio), 'efeito: o meio mostra TURNOS | POR'); ok(s.minis>0, 'efeito: minis do portador');
  s=await sit(SIT['resumo']); ok(/RESUMO/.test(s.txt), 'resumo: título RESUMO'); ok(s.minis>0, 'resumo: minis do último a agir');

  // §353b: a forma DISCO foi APOSENTADA — toda arte de habilidade é CHEIA. Nenhum botão de habilidade recorta a arte
  // em círculo (sem .slot__art--disco, sem clip-path:circle); os botões de habilidade usam a arte cheia.
  {
    await page.evaluate(BOOT); await page.waitForTimeout(60);
    const r=await page.evaluate(()=>{
      const btns=[...document.querySelectorAll('.bt-skill[data-sk]')];
      const discos=btns.filter(b=>b.querySelector('.slot__art--disco')).length;
      const cheias=btns.filter(b=>b.querySelector('img.slot__art--cheia')).length;
      const clip=btns.some(b=>{const a=b.querySelector('img.slot__art'); if(!a) return false; const cs=getComputedStyle(a); return /circle/i.test(cs.clipPath||cs.webkitClipPath||'');});
      return {discos,cheias,clip,total:btns.length};
    });
    ok(r.discos===0, `§353b: nenhum botão de habilidade em DISCO (${r.discos})`);
    ok(!r.clip, '§353b: nenhuma arte de habilidade com clip-path circular');
    ok(r.cheias>0, `§353b: os botões de habilidade usam a arte CHEIA (${r.cheias}/${r.total})`);
  }
  await ctx.close(); await browser.close();
  console.log(falhas===0?'\n>>> BATALHA_PAINEL OK':`\n>>> ${falhas} FALHA(S)`);
  process.exit(falhas?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
