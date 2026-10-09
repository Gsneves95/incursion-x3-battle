// batalha_faixa.test.js (§329) — GUARDA BABÁ do LAYOUT de batalha À RISCA da referência (data/layout_batalha.json).
// Prova as decisões do §329:
//   1) NENHUMA área de toque se sobrepõe a outra, em CADA estado (meu turno / turno do oponente);
//   2) NADA transborda nem é cortado com "…" no nome do deus, na função ou na vida (guardas de encaixe);
//   3) tudo cabe dentro do palco (nada corta acima/abaixo) nas aspect-ratios reais do celular.
// Chromium (não jsdom): sobreposição e corte são medidos por rect real. Três enquadramentos: 20:9, 16:9 e o piso.

const { chromium } = require('playwright');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
function acharChromium(){ if(process.env.INCURSION_CHROMIUM) return process.env.INCURSION_CHROMIUM;
  try{ const base='/opt/pw-browsers'; const d=fs.readdirSync(base).filter(x=>/^chromium-\d+$/.test(x)).sort().pop();
    if(d){ const b=path.join(base,d,'chrome-linux','chrome'); if(fs.existsSync(b)) return b; } }catch(e){} return undefined; }

let falhas=0; const ok=(c,m)=>{ if(!c){ falhas++; console.log('  XX '+m); } };
const distAbs=path.resolve(__dirname,'..','dist','incursion.html');
const ESCALAS=[{nome:'20:9 1600',w:1600,h:720},{nome:'16:9 1280',w:1280,h:720},{nome:'piso 780',w:780,h:360}];
// seletores de TOQUE (controles distintos). O contains-skip trata o aninhado (o "P" dentro do retrato é intencional).
const TOQUE='.bt-ajustes,.bt-prof,.bt-trocar,.bt-encerrar,.bt-skill,.bt-portrait,.bt-eff,.bt-mini,.bt-cbtn,.bt-som,.bt-portrait__pas,.bt-panel';

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
      // §329c Parte B1: a caixa do <img> de CADA retrato preenche o quadro (até a borda de 1px). Medida
      // normalizada pela escala (divide por e) → a borda lê ~1 em qualquer enquadramento. Offset por aresta.
      const retr=[...document.querySelectorAll('.bt-portrait')].map(p=>{ const img=p.querySelector('img'); if(!img) return {foe:p.classList.contains('bt-portrait--foe'),semImg:true};
        const rp=R(p), ri=R(img);
        return { foe:p.classList.contains('bt-portrait--foe'),
          dl:+((ri.left-rp.left)/e).toFixed(1), dt:+((ri.top-rp.top)/e).toFixed(1),
          dr:+((rp.right-ri.right)/e).toFixed(1), db:+((rp.bottom-ri.bottom)/e).toFixed(1) }; });
      // §330: TAMANHOS que preenchem a tela (medidos em px reais, no piso). Inclui a bolinha de custo e a fonte dos
      // números de energia no topo. Também: o quadro de ação NÃO EXISTE mais no DOM.
      const w=el=>el?R(el).width:0;
      const skMin=Math.min(...[...document.querySelectorAll('.bt-skill')].map(w).concat([1e9]));
      const ptMin=Math.min(...[...document.querySelectorAll('.bt-portrait')].map(w).concat([1e9]));
      const efMin=Math.min(...[...document.querySelectorAll('.bt-eff')].map(w).concat([1e9]));
      const pipMin=Math.min(...[...document.querySelectorAll('.bt-skill__pips i')].map(w).concat([1e9]));
      const ecEl=document.querySelector('.bt-ebox .bt-ec'); const ecFonte=ecEl?parseFloat(getComputedStyle(ecEl).fontSize)||0:0;
      const acao=document.querySelectorAll('.bt-acao,[data-acao]').length;
      const centro=!!document.querySelector('.bt-centro .bt-centro__corpo');
      return { n:els.length, over, clip:+clip.toFixed(1), corta, vazios, retr, acao, centro,
        tam:{ skMin:+skMin.toFixed(1), ptMin:+ptMin.toFixed(1), efMin:+efMin.toFixed(1), pipMin:+pipMin.toFixed(1), ecFonte:+ecFonte.toFixed(1) } };
    },sel=TOQUE);
    // §329c Parte B2: o ÍCONE DE EFEITO não é um quadrado vazio — a amostra CENTRAL tem pixels VISÍVEIS de cor
    // diferente do fundo do próprio ícone (símbolos monocromáticos como ⊕ agora renderizam claros). Medido em
    // PIXELS REAIS: screenshot + amostra da região central vs. um canto do ícone (fundo do azulejo).
    const efVisiveis=async()=>{
      const dsf=2;
      const rects=await page.evaluate(()=>[...document.querySelectorAll('.bt-eff')].map(el=>{ const r=el.getBoundingClientRect();
        return {x:r.x,y:r.y,w:r.width,h:r.height,cls:el.className}; }));
      if(!rects.length) return [];
      const buf=await page.screenshot();
      const img=sharp(buf); const meta=await img.metadata(); const raw=await img.raw().toBuffer();
      const ch=raw.length/(meta.width*meta.height);
      const px=(cx,cy)=>{ const X=Math.max(0,Math.min(meta.width-1,Math.round(cx*dsf))), Y=Math.max(0,Math.min(meta.height-1,Math.round(cy*dsf)));
        const o=(Y*meta.width+X)*ch; return [raw[o],raw[o+1],raw[o+2]]; };
      const dist=(a,b)=>Math.abs(a[0]-b[0])+Math.abs(a[1]-b[1])+Math.abs(a[2]-b[2]);
      return rects.map((r,i)=>{ const bg=px(r.x+r.w*0.14, r.y+r.h*0.14);   // canto sup-esq interno = fundo do azulejo
        let maxD=0; for(let gx=0.30;gx<=0.70;gx+=0.1) for(let gy=0.30;gy<=0.70;gy+=0.1) maxD=Math.max(maxD,dist(px(r.x+r.w*gx,r.y+r.h*gy),bg));
        return {i,cls:r.cls,maxD}; });
    };

    for(const modo of ['meu','oponente']){
      await entrar(modo); await page.waitForTimeout(80);
      const m=await medir();
      ok(!m.over, `${E.nome} [${modo}]: nenhuma área de toque se sobrepõe` + (m.over?` (${m.over.a} × ${m.over.b} = ${m.over.ix}×${m.over.iy}u)`:` (${m.n} alvos)`));
      ok(m.clip===0, `${E.nome} [${modo}]: nada de toque corta fora do palco (clip ${m.clip}px)`);
      ok(m.corta.length===0, `${E.nome} [${modo}]: nome/vida/função não transbordam` + (m.corta.length?` (${m.corta.join(', ')})`:''));
      ok(m.vazios.length===0, `${E.nome} [${modo}]: nenhum ícone/miniatura/botão vazio (sem imagem e sem fallback)` + (m.vazios.length?` (${m.vazios.join(', ')})`:''));
      // §329c B1: a caixa do <img> enche o quadro em TODO retrato (|offset| por aresta ≤ 2, borda ~1).
      const b1Ruim=m.retr.filter(r=>r.semImg||Math.max(Math.abs(r.dl),Math.abs(r.dt),Math.abs(r.dr),Math.abs(r.db))>2);
      ok(b1Ruim.length===0, `${E.nome} [${modo}]: a imagem preenche o quadro em todos os ${m.retr.length} retratos (±1px da borda)`
        + (b1Ruim.length?` (${b1Ruim.map(r=>(r.foe?'foe':'ally')+(r.semImg?':sem-img':`:${r.dl}/${r.dt}/${r.dr}/${r.db}`)).join(', ')})`:''));
      // §329c B2: ícone de efeito com amostra central VISÍVEL (cor ≠ fundo do azulejo), medido em pixels reais.
      const vis=await efVisiveis(); const b2Ruim=vis.filter(v=>v.maxD<40);
      ok(vis.length>0 && b2Ruim.length===0, `${E.nome} [${modo}]: ícones de efeito com pixels visíveis no centro (≠ fundo)`
        + (b2Ruim.length?` (vazios: ${b2Ruim.map(v=>'eff'+v.i+'='+v.maxD).join(', ')})`:` (${vis.length} ícones, menor Δ=${Math.min(...vis.map(v=>v.maxD))})`));
      // §330: sem quadro de ação no DOM (a escolha marca-se no próprio botão).
      ok(m.acao===0, `${E.nome} [${modo}]: o quadro de ação não existe no DOM (há ${m.acao})`);
      // §330: a arte do centro (fixa por turno) aparece nos 3 enquadramentos reais (largura ≥ 25u).
      ok(m.centro, `${E.nome} [${modo}]: a arte FIXA do centro está presente (.bt-centro__corpo)`);
      // §330: tamanhos que preenchem a tela — PROVADOS no piso (780×360), onde a altura é a mais apertada.
      if(E.w===780){
        ok(m.tam.skMin>=66, `${E.nome} [${modo}]: botão de habilidade ≥66px (${m.tam.skMin}px)`);
        ok(m.tam.ptMin>=66, `${E.nome} [${modo}]: retrato ≥66px (${m.tam.ptMin}px)`);
        ok(m.tam.efMin>=22, `${E.nome} [${modo}]: ícone de efeito ≥22px (${m.tam.efMin}px)`);
        if(modo==='meu') ok(m.tam.pipMin>=7, `${E.nome} [${modo}]: bolinha de custo ≥7px (${m.tam.pipMin}px)`);
        if(modo==='meu') ok(m.tam.ecFonte>=9, `${E.nome} [${modo}]: números de energia ≥9px (${m.tam.ecFonte}px)`);
      }
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
