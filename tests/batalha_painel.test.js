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
  st.ativo=0;foco=st.lados[0].units[0].uid;armado=null;detalhe=null;resumoTurno=null; ir('batalha',{},{substituir:true});render();`;
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
  s=await sit(SIT['deus']); ok(/VIDA/.test(s.meio)&&/ELEMENTO/.test(s.meio), 'deus: o meio mostra VIDA | ELEMENTO'); ok(/HABILIDADES/.test(s.minilab)&&s.minis>0&&!s.sel, 'deus: coluna direita = HABILIDADES (nenhuma destacada)');
  s=await sit(SIT['habilidade lida']); ok(/OUTRAS HABILIDADES/.test(s.minilab), 'lida: coluna direita = OUTRAS HABILIDADES'); ok(s.sel, 'lida: a miniatura mostrada vem destacada'); ok(!s.cancel, 'lida: sem CANCELAR');
  s=await sit(SIT['armada']); ok(s.cancel, 'armada: coluna direita = CANCELAR'); ok(s.mira, 'armada: instrução com a mira'); ok(s.minis===0, 'armada: sem miniaturas');
  s=await sit(SIT['efeito']); ok(/TURNOS/.test(s.meio)&&/APLICADO POR/.test(s.meio), 'efeito: o meio mostra TURNOS | APLICADO POR'); ok(s.minis>0, 'efeito: minis do portador');
  s=await sit(SIT['resumo']); ok(/RESUMO/.test(s.txt), 'resumo: título RESUMO'); ok(s.minis>0, 'resumo: minis do último a agir');

  // §334: nenhum botão em DISCO mostra pixel claro nos cantos (a arte foi recortada no círculo).
  if(sharp){
    await page.evaluate(BOOT); await page.waitForTimeout(60);
    const discos=await page.evaluate(()=>[...document.querySelectorAll('.bt-skill[data-sk]')].filter(b=>b.querySelector('.slot__art--disco'))
      .map(b=>{const r=b.getBoundingClientRect(); return {x:r.x,y:r.y,w:r.width,h:r.height};}).filter(b=>b.w>8&&b.h>8));
    ok(discos.length>0, '§334: há botões em DISCO para checar os cantos');
    for(const b of discos.slice(0,10)){
      const buf=await page.screenshot({clip:{x:b.x,y:b.y,width:b.w,height:b.h}});
      const {data,info}=await sharp(buf).raw().toBuffer({resolveWithObject:true});
      const W=info.width,H=info.height,chn=info.channels, L=(x,y)=>{const o=(y*W+x)*chn;return 0.299*data[o]+0.587*data[o+1]+0.114*data[o+2];};
      const mm=3, cantos=[L(mm,mm),L(W-1-mm,mm),L(mm,H-1-mm),L(W-1-mm,H-1-mm)].map(v=>Math.round(v));
      ok(!cantos.some(v=>v>150), `§334: botão DISCO sem pixel claro nos cantos (lumas ${cantos.join(',')})`);
    }
  }
  await ctx.close(); await browser.close();
  console.log(falhas===0?'\n>>> BATALHA_PAINEL OK':`\n>>> ${falhas} FALHA(S)`);
  process.exit(falhas?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
