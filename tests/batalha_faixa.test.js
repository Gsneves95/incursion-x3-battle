// batalha_faixa.test.js (§329) — GUARDA BABÁ do LAYOUT de batalha À RISCA da referência (data/layout_batalha.json).
// Prova as decisões do §329:
//   1) NENHUMA área de toque se sobrepõe a outra, em CADA estado (meu turno / turno do oponente);
//   2) NADA transborda nem é cortado com "…" no nome do deus, na função ou na vida (guardas de encaixe);
//   3) tudo cabe dentro do palco (nada corta acima/abaixo) nas aspect-ratios reais do celular.
// Chromium (não jsdom): sobreposição e corte são medidos por rect real. Três enquadramentos: 20:9, 16:9 e o piso.

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
function acharChromium(){ if(process.env.INCURSION_CHROMIUM) return process.env.INCURSION_CHROMIUM;
  try{ const base='/opt/pw-browsers'; const d=fs.readdirSync(base).filter(x=>/^chromium-\d+$/.test(x)).sort().pop();
    if(d){ const b=path.join(base,d,'chrome-linux','chrome'); if(fs.existsSync(b)) return b; } }catch(e){} return undefined; }

let falhas=0; const ok=(c,m)=>{ if(!c){ falhas++; console.log('  XX '+m); } };
const distAbs=path.resolve(__dirname,'..','dist','incursion.html');
const ESCALAS=[{nome:'20:9 1600',w:1600,h:720},{nome:'16:9 1280',w:1280,h:720},{nome:'piso 780',w:780,h:360}];
// seletores de TOQUE (controles distintos). O contains-skip trata o aninhado (o "P" dentro do retrato é intencional).
const TOQUE='.bt-ajustes,.bt-prof,.bt-estado,.bt-trocar,.bt-skill,.bt-acao,.bt-portrait,.bt-eff,.bt-mini,.bt-cbtn,.bt-som,.bt-portrait__pas,.bt-panel';

(async()=>{
  const browser=await chromium.launch({executablePath:acharChromium(),headless:true,args:['--no-sandbox']});
  for(const E of ESCALAS){
    const ctx=await browser.newContext({viewport:{width:E.w,height:E.h},deviceScaleFactor:2});
    const page=await ctx.newPage();
    await page.goto('file://'+distAbs,{waitUntil:'load'});
    console.log(`== §329 ${E.nome} (${E.w}×${E.h}) ==`);

    const entrar=(modo)=>page.evaluate((modo)=>{
      st=montarProvacao({aliados:['anubis','ogum','tyr'],inimigos:['silfo','ghoul','quimera'],montar:{seed:3,comeca:0}});
      prova=null;provaFim=null;campanha=null;campanhaFim=null;dominio=null;dominioFim=null;vsCPU=true;IA_LADO=1;try{pararRelogio();}catch(e){}
      try{ ELEMS.forEach(e=>st.lados[0].orbs[e]=2); }catch(e){}
      // efeitos nos dois lados p/ os ícones renderizarem
      st.lados[0].units[0].efeitos=[{type:'dmgUp',v:8,dur:3},{type:'regen',v:10,dur:4},{type:'shield',v:20}];st.lados[0].units[0].shield=20;
      st.lados[1].units[0].efeitos=[{type:'adormecido',dur:1},{type:'vulneravel',v:6,dur:2},{type:'selado',dur:3}];
      armado=null;detalhe=null;
      if(modo==='oponente'){ st.ativo=1; iaAtiva=true; foco=st.lados[1].units[0].uid; }
      else { st.ativo=0; foco=st.lados[0].units[0].uid; }
      ir('batalha',{},{substituir:true}); render();
    },modo);

    const medir=()=>page.evaluate((sel)=>{
      const e=ultimaEscala||1; const R=el=>el.getBoundingClientRect();
      const stageEl=document.getElementById('stage'); const sr=R(stageEl);
      const els=[...document.querySelectorAll(sel)].filter(el=>{ const r=R(el); return r.width>1&&r.height>1; });
      // 1) sobreposição par-a-par (ignora aninhados)
      let over=null;
      for(let i=0;i<els.length&&!over;i++) for(let j=i+1;j<els.length;j++){
        const a=els[i], b=els[j]; if(a.contains(b)||b.contains(a)) continue;
        const ra=R(a), rb=R(b);
        const ix=Math.min(ra.right,rb.right)-Math.max(ra.left,rb.left);
        const iy=Math.min(ra.bottom,rb.bottom)-Math.max(ra.top,rb.top);
        if(ix>1&&iy>1){ over={a:a.className,b:b.className,ix:+(ix/e).toFixed(1),iy:+(iy/e).toFixed(1)}; break; }
      }
      // 2) corte: algum toque fora do palco?
      let clip=0; els.forEach(el=>{ const r=R(el);
        if(r.left<sr.left-0.5) clip=Math.max(clip,(sr.left-r.left)/e);
        if(r.right>sr.right+0.5) clip=Math.max(clip,(r.right-sr.right)/e);
        if(r.top<sr.top-0.5) clip=Math.max(clip,(sr.top-r.top)/e);
        if(r.bottom>sr.bottom+0.5) clip=Math.max(clip,(r.bottom-sr.bottom)/e); });
      // 3) encaixe de texto: nome/vida/função não transbordam (scrollWidth<=clientWidth)
      const corta=[];
      const chk=(s,lab)=>document.querySelectorAll(s).forEach(el=>{ if(el.scrollWidth>el.clientWidth+1) corta.push(lab+':"'+(el.textContent||'').trim().slice(0,18)+'"'); });
      chk('.bt-hp__lab','vida'); chk('.bt-panel__titulo','titulo'); chk('.bt-panel__tf','funcao'); chk('.bt-name__nick','nick'); chk('.bt-name__sub','sub');
      // §329b item 6: nenhum ícone de efeito/miniatura/botão renderiza SEM imagem E SEM fallback (monograma/ícone).
      const vazios=[];
      document.querySelectorAll('.bt-eff').forEach((el,i)=>{ const hasImg=!!el.querySelector('img'); const t=(el.textContent||'').replace(/\s/g,''); if(!hasImg&&!t) vazios.push('eff'+i); });
      document.querySelectorAll('.bt-mini').forEach((el,i)=>{ const hasImg=!!el.querySelector('.slot__art'); const m=el.querySelector('.bt-mini__mono'); if(!hasImg&&!(m&&(m.textContent||'').trim())) vazios.push('mini'+i); });
      document.querySelectorAll('.bt-skill').forEach((el,i)=>{ const hasImg=!!el.querySelector('.slot__art'); const m=el.querySelector('.bt-skill__mono'); if(!hasImg&&!(m&&(m.textContent||'').trim())) vazios.push('skill'+i); });
      return { n:els.length, over, clip:+clip.toFixed(1), corta, vazios };
    },sel=TOQUE);

    for(const modo of ['meu','oponente']){
      await entrar(modo); await page.waitForTimeout(80);
      const m=await medir();
      ok(!m.over, `${E.nome} [${modo}]: nenhuma área de toque se sobrepõe` + (m.over?` (${m.over.a} × ${m.over.b} = ${m.over.ix}×${m.over.iy}u)`:` (${m.n} alvos)`));
      ok(m.clip===0, `${E.nome} [${modo}]: nada de toque corta fora do palco (clip ${m.clip}px)`);
      ok(m.corta.length===0, `${E.nome} [${modo}]: nome/vida/função não transbordam` + (m.corta.length?` (${m.corta.join(', ')})`:''));
      ok(m.vazios.length===0, `${E.nome} [${modo}]: nenhum ícone/miniatura/botão vazio (sem imagem e sem fallback)` + (m.vazios.length?` (${m.vazios.join(', ')})`:''));
    }
    // §329b item 6 reforço: com um INIMIGO do bestiário em FOCO, as minis dele (sem arte) caem no monograma — não ficam vazias.
    await page.evaluate(()=>{ foco=st.lados[1].units[0].uid; detalhe=null; armado=null; render(); });
    await page.waitForTimeout(40);
    const mf=await medir();
    ok(mf.vazios.length===0, `${E.nome}: com inimigo do bestiário em foco, minis caem no monograma (sem vazio)` + (mf.vazios.length?` (${mf.vazios.join(', ')})`:''));
    await ctx.close();
  }
  await browser.close();
  console.log(falhas===0?'\n>>> BATALHA_FAIXA OK':`\n>>> ${falhas} FALHA(S)`);
  process.exit(falhas?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
