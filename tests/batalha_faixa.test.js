// batalha_faixa.test.js (§335) — a TELA DE BATALHA reproduz o design do dono (Claude Design): tela FIXA 1846×852
// escalada por min(w/1846,h/852). PROVAS: (1) em 1846×852 (escala 1) as caixas dos blocos batem com as coordenadas do
// HTML (tolerância 2px); (2) em 780×360, 915×412 e 1280×720 nada sai da tela, nenhuma área de toque se sobrepõe, nenhum
// texto corta (reporta a escala e os px reais); (3) meu turno = cena da Nezha + "SEU TURNO"; turno do oponente = Ah Puch
// + "TURNO DO OPONENTE"; (4) sem requisição a fonts.googleapis.com. Chromium (rect real).
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
function acharChromium(){ if(process.env.INCURSION_CHROMIUM) return process.env.INCURSION_CHROMIUM;
  try{ const base='/opt/pw-browsers'; const d=fs.readdirSync(base).filter(x=>/^chromium-\d+$/.test(x)).sort().pop();
    if(d){ const b=path.join(base,d,'chrome-linux','chrome'); if(fs.existsSync(b)) return b; } }catch(e){} return undefined; }
let falhas=0; const ok=(c,m)=>{ if(!c){ falhas++; console.log('  XX '+m); } };
const distAbs=path.resolve(__dirname,'..','dist','incursion.html');

// §335: sem requisição a fonts.googleapis.com no bundle.
const html=fs.readFileSync(distAbs,'utf8');
ok(!/fonts\.googleapis\.com|fonts\.gstatic\.com/.test(html), 'sem requisição a fonts.googleapis.com (fontes empacotadas em web/)');

const BOOT=`
  st=montarProvacao({aliados:['hades','ares','brigid'],inimigos:['poseidon','hera','apolo'],montar:{seed:3,comeca:0}});
  prova=null;campanha=null;dominio=null;vsCPU=true;IA_LADO=1;try{pararRelogio();}catch(e){}
  try{ELEMS.forEach(e=>st.lados[0].orbs[e]=0); st.lados[0].orbs[st.lados[0].units[0].elem]=3; st.lados[0].orbs[st.lados[0].units[1].elem]=1;}catch(e){}
  st.ativo=0;foco=st.lados[0].units[0].uid;armado=null;detalhe=null;resumoTurno=null; ir('batalha',{},{substituir:true});render();`;

// §362: CAIXAS ESPERADAS (px de design 780×360, relativas ao #batalha) — do data/layout_batalha.json.
const CAIXAS=[
  { nome:'header',   pick:'header', x:0,   y:0,   w:780, h:60 },
  { nome:'energia',  sel:'.bt-ebox',              x:150, y:10,  w:304,  h:40 },
  { nome:'encerrar', sel:'#bend2',                x:460, y:1,   w:150,  h:40 },
  { nome:'menu',     sel:'#bmenu',                x:616, y:10,  w:40,   h:40 },
];

(async()=>{
  const browser=await chromium.launch({executablePath:acharChromium(),headless:true,args:['--no-sandbox']});

  // ---- (1) coordenadas em 1846×852 (escala 1) ----
  {
    const ctx=await browser.newContext({viewport:{width:1846,height:852},deviceScaleFactor:1});
    const page=await ctx.newPage(); await page.goto('file://'+distAbs,{waitUntil:'load'});
    await page.evaluate(BOOT); await page.waitForTimeout(120);
    console.log('== §335 coordenadas @1846×852 (escala 1) ==');
    const m=await page.evaluate((CAIXAS)=>{
      const bat=document.getElementById('batalha'); const b=bat.getBoundingClientRect();
      const esc=(typeof ultimaEscalaBatalha!=='undefined'&&ultimaEscalaBatalha)||1;
      const rel=el=>{ const r=el.getBoundingClientRect(); return { x:(r.left-b.left)/esc, y:(r.top-b.top)/esc, w:r.width/esc, h:r.height/esc }; };
      const out={esc};
      out.header=(()=>{ const h=bat.querySelector('header'); return h?rel(h):null; })();
      CAIXAS.forEach(c=>{ if(c.nome==='header')return; const el=bat.querySelector(c.sel); out[c.nome]=el?rel(el):null; });
      // colunas do campo (grid: aliados | cena | inimigos) e do painel (info | meio | resto)
      const campo=bat.querySelector('.b5-campo'); out.campoCols=campo?[...campo.children].map(c=>Math.round(c.getBoundingClientRect().width/esc)):[];
      const painel=bat.querySelector('.b5-painel'); out.painelCols=painel?[...painel.children].map(c=>Math.round(c.getBoundingClientRect().width/esc)):[];
      const retr=bat.querySelector('.bt-portrait--ally'); out.retrato=retr?rel(retr):null;
      const skill=bat.querySelector('.bt-skill[data-sk]'); out.skill=skill?rel(skill):null;
      return out;
    }, CAIXAS);
    const perto=(a,b,t)=>Math.abs(a-b)<=t;
    const bateCaixa=(c,got)=>{ if(!got){ok(false,`@1846 ${c.nome}: elemento ausente`); return;}
      ok(perto(got.x,c.x,2)&&perto(got.y,c.y,2)&&perto(got.w,c.w,2)&&perto(got.h,c.h,2),
        `@1846 ${c.nome}: caixa bate o HTML (esperado ${c.x},${c.y} ${c.w}×${c.h} · veio ${Math.round(got.x)},${Math.round(got.y)} ${Math.round(got.w)}×${Math.round(got.h)})`); };
    bateCaixa(CAIXAS[0], m.header);
    CAIXAS.slice(1).forEach(c=>bateCaixa(c, m[c.nome]));
    ok(JSON.stringify(m.campoCols)===JSON.stringify([276,388,100]), `@1846 colunas do campo = 276|388|100 (veio ${JSON.stringify(m.campoCols)})`);
    ok(JSON.stringify(m.painelCols)===JSON.stringify([300,228,236]), `@1846 colunas do painel = 300|228|236 (veio ${JSON.stringify(m.painelCols)})`);
    ok(m.retrato&&perto(m.retrato.w,44,2)&&perto(m.retrato.h,44,2), `@1846 retrato 44×44 (veio ${m.retrato&&Math.round(m.retrato.w)}×${m.retrato&&Math.round(m.retrato.h)})`);
    ok(m.skill&&perto(m.skill.w,40,2)&&perto(m.skill.h,40,2), `@1846 botão de habilidade 40×40 (veio ${m.skill&&Math.round(m.skill.w)}×${m.skill&&Math.round(m.skill.h)})`);
    await ctx.close();
  }

  // ---- (2) responsivo: nada sai da tela, sem sobreposição de toque, sem corte de texto ----
  for(const E of [{w:780,h:360},{w:915,h:412},{w:1280,h:720}]){
    const ctx=await browser.newContext({viewport:{width:E.w,height:E.h},deviceScaleFactor:2});
    const page=await ctx.newPage(); await page.goto('file://'+distAbs,{waitUntil:'load'});
    await page.evaluate(BOOT); await page.waitForTimeout(100);
    const m=await page.evaluate((E)=>{
      const esc=(typeof ultimaEscalaBatalha!=='undefined'&&ultimaEscalaBatalha)||1;
      const bat=document.getElementById('batalha'); const b=bat.getBoundingClientRect();
      const fora = b.left<-0.5||b.top<-0.5||b.right>E.w+0.5||b.bottom>E.h+0.5;
      // sobreposição de toques: os 12 botões de habilidade + 6 retratos não se intersectam entre si
      const toques=[...bat.querySelectorAll('.bt-skill[data-sk],.bt-portrait')].map(el=>el.getBoundingClientRect());
      let over=null; for(let i=0;i<toques.length&&!over;i++)for(let j=i+1;j<toques.length;j++){const a=toques[i],c=toques[j];
        const ix=Math.min(a.right,c.right)-Math.max(a.left,c.left), iy=Math.min(a.bottom,c.bottom)-Math.max(a.top,c.top);
        if(ix>1&&iy>1){over=i+'×'+j;break;}}
      const clip=el=>el?(el.scrollWidth>el.clientWidth+1):false;
      const px=(sel)=>{ const el=bat.querySelector(sel); return el?Math.round(el.getBoundingClientRect().width*10)/10:null; };
      return { esc:Math.round(esc*1000)/1000, fora, over,
        titCorta: clip(bat.querySelector('.bt-panel__titulo')), nomeCorta: clip(bat.querySelector('.bt-name__nick')), linhaCorta: clip(bat.querySelector('.bt-encerrar__linha')),
        skill:px('.bt-skill[data-sk]'), retrato:px('.bt-portrait--ally'), efeito:px('.bt-eff'), desc:(()=>{const d=bat.querySelector('.bt-panel__desc'); return d?Math.round(parseFloat(getComputedStyle(d).fontSize)*esc*10)/10:null;})() };
    }, E);
    console.log(`== §335 responsivo ${E.w}×${E.h}: escala ${m.esc} · habilidade ${m.skill}px · retrato ${m.retrato}px · efeito ${m.efeito}px · descrição ${m.desc}px ==`);
    ok(!m.fora, `${E.w}×${E.h}: a tela fixa cabe (nada sai da viewport)`);
    ok(!m.over, `${E.w}×${E.h}: nenhuma área de toque se sobrepõe`+(m.over?` (${m.over})`:''));
    ok(!m.titCorta, `${E.w}×${E.h}: o título do painel não corta`);
    ok(!m.nomeCorta, `${E.w}×${E.h}: o nome do jogador não corta`);
  }

  // ---- (3) cena + anúncio por turno ----
  {
    const ctx=await browser.newContext({viewport:{width:1846,height:852},deviceScaleFactor:1});
    const page=await ctx.newPage(); await page.goto('file://'+distAbs,{waitUntil:'load'});
    await page.evaluate(BOOT); await page.waitForTimeout(80);
    // §347: mede a cena (src larga) e a fração vertical onde o anúncio começa — o rosto (topo) tem de ficar livre dele
    const medeCena = () => { const bat=document.getElementById('batalha');
      const img=bat.querySelector('.b5-art img'); const cont=img.closest('.b5-art').parentElement; const cr=cont.getBoundingClientRect();
      const anun=[...cont.children].find(c=>/TURNO/.test(c.textContent||'')); const frac=anun?((anun.getBoundingClientRect().top-cr.top)/cr.height):0;
      const src=(img&&img.getAttribute('src'))||'';
      return { src, larga:/^cena\//.test(src), anunFrac:+frac.toFixed(3), seuTurno:/SEU TURNO/.test(bat.textContent), opoTurno:/TURNO DO OPONENTE/.test(bat.textContent) }; };
    const meu=await page.evaluate(medeCena);
    ok(/cena\/turno_meu\.webp/.test(meu.src), `§347 meu turno: a cena LARGA da Nezha (src ${meu.src})`);
    ok(meu.larga, '§347 meu turno: usa a arte larga (o fallback de retrato não entra)');
    ok(meu.seuTurno, 'meu turno: o anúncio diz "SEU TURNO"');
    ok(meu.anunFrac>=0.33, `§347 meu turno: o anúncio começa na metade de baixo (frac ${meu.anunFrac}) → o rosto (topo) fica fora dele`);
    await page.evaluate(`st.ativo=1; armado=null;detalhe=null; render();`); await page.waitForTimeout(80);
    const opo=await page.evaluate(medeCena);
    ok(/cena\/turno_oponente\.webp/.test(opo.src), `§347 turno do oponente: a cena LARGA do Ah Puch (src ${opo.src})`);
    ok(opo.larga, '§347 turno do oponente: usa a arte larga (o fallback de retrato não entra)');
    ok(opo.opoTurno, 'turno do oponente: o anúncio diz "TURNO DO OPONENTE"');
    ok(opo.anunFrac>=0.33, `§347 turno do oponente: o anúncio começa na metade de baixo (frac ${opo.anunFrac}) → o rosto (topo) fica fora dele`);
    await ctx.close();
  }

  // ---- (4) §335b: cena com rosto (recorte no topo no fallback), pílula de tipo com fundo, moldura da imagem, avatares ----
  {
    const ctx=await browser.newContext({viewport:{width:1846,height:852},deviceScaleFactor:1});
    const page=await ctx.newPage(); await page.goto('file://'+distAbs,{waitUntil:'load'});
    await page.evaluate(BOOT);
    await page.evaluate(`armar(st.lados[0].units[0].uid,'milagre'); render();`); await page.waitForTimeout(120);
    console.log('== §335b detalhes (cena/pílula/moldura/avatares) ==');
    const m=await page.evaluate(()=>{
      const bat=document.getElementById('batalha');
      // (a) cena: no FALLBACK de retrato, o recorte ancora no topo (object-position Y < 50%) p/ mostrar o rosto
      const art=bat.querySelector('.b5-art img');
      const op=art?getComputedStyle(art).objectPosition:''; const opY=parseFloat((op.split(' ')[1]||'50%'));
      const artSrc=art?art.getAttribute('src'):'';
      // (b) 1ª pílula (tipo): fundo colorido (alpha > 0)
      const tit=bat.querySelector('.bt-panel__titulo'); const pilRow=tit&&tit.nextElementSibling;
      const pil1=pilRow&&pilRow.firstElementChild; const bg=pil1?getComputedStyle(pil1).backgroundColor:'';
      const alpha=(()=>{ const cm=/\/\s*([0-9.]+)\s*\)/.exec(bg); if(cm)return parseFloat(cm[1]); // color(srgb r g b / a)
        const m=/rgba?\(([^)]+)\)/.exec(bg); if(m){const p=m[1].split(',').map(s=>parseFloat(s)); return p.length>3?p[3]:1;}
        return (bg&&bg!=='transparent'&&bg!=='rgba(0, 0, 0, 0)')?1:0; })();
      // (c) moldura da imagem: a imagem tem um filho com box-shadow inset (moldura do acento)
      const img=bat.querySelector('.bt-panel__img'); const overlay=img&&img.lastElementChild;
      const bs=overlay?getComputedStyle(overlay).boxShadow:''; const temMoldura=/inset/.test(bs);
      // (d) avatares: retratos reais (img) no topo
      const avMe=bat.querySelector('[data-prof="me"] img'); const avFoe=bat.querySelector('[data-prof="foe"] img');
      return { opY, artSrc, alpha, temMoldura, avMe:avMe?avMe.getAttribute('src'):'', avFoe:avFoe?avFoe.getAttribute('src'):'' };
    });
    ok(/^cena\/turno_meu\.webp/.test(m.artSrc), `§347: com a arte larga presente, a cena usa cena/turno_meu.webp (o fallback de retrato não entra; object-position Y=${m.opY}%)`);
    ok(m.alpha>0, `§335b pílula de tipo: fundo colorido (alpha ${m.alpha})`);
    ok(m.temMoldura, '§335b imagem do painel: moldura inset na cor do acento');
    ok(/hades/i.test(m.avMe), `§335b avatar do jogador: retrato do 1º deus (src ${m.avMe})`);
    ok(/poseidon/i.test(m.avFoe), `§335b avatar da CPU: retrato do 1º inimigo (src ${m.avFoe})`);
    await ctx.close();
  }

  // ---- (5) §336b: a caixa de energia nunca esconde o Σ nem o ⇄ TROCAR, com 1/3/6 tipos, em 1846×852 e 780×360 ----
  const CENAS_EN=[
    { n:1, aliados:['afrodite','amaterasu','apolo'], orbs:{Aurora:6} },
    { n:3, aliados:['afrodite','ahpuch','aokuang'],  orbs:{Aurora:3,'Umbra':3,'Maré':3} },
    { n:6, aliados:['afrodite','ahpuch','aokuang'],  orbs:{Tempestade:1,'Umbra':2,'Maré':3,Aurora:4,Chama:5,Verdejante:6} },
  ];
  for(const E of [{w:1846,h:852,dsf:1},{w:780,h:360,dsf:2}]){
    for(const C of CENAS_EN){
      const ctx=await browser.newContext({viewport:{width:E.w,height:E.h},deviceScaleFactor:E.dsf});
      const page=await ctx.newPage(); await page.goto('file://'+distAbs,{waitUntil:'load'});
      await page.evaluate((C)=>{ st=montarProvacao({aliados:C.aliados,inimigos:['poseidon','hera','zeus'],montar:{seed:3,comeca:0}});
        prova=null;campanha={_capIdx:0,_atoIdx:2};dominio=null;vsCPU=true;IA_LADO=1;try{pararRelogio();}catch(e){}
        ELEMS.forEach(e=>st.lados[0].orbs[e]=0); for(const k in C.orbs) st.lados[0].orbs[k]=C.orbs[k];
        st.ativo=0;foco=st.lados[0].units[0].uid;armado=null;detalhe=null; ir('batalha',{},{substituir:true});render(); }, C);
      await page.waitForTimeout(80);
      const m=await page.evaluate(()=>{ const bat=document.getElementById('batalha');
        const box=bat.querySelector('.bt-ebox'), tr=bat.querySelector('#btrocar'), sig=bat.querySelector('.bt-esigma'),
          end=bat.querySelector('#bend2'), nome=bat.querySelector('.bt-name--me');
        const R=el=>el?el.getBoundingClientRect():null; const vw=window.innerWidth;
        const dentro=(a,b)=>a&&b&&a.left>=b.left-0.6&&a.right<=b.right+0.6;
        const vis=el=>{ const r=R(el); return !!r&&r.width>1&&r.height>1&&r.left>=-0.6&&r.right<=vw+0.6; };
        const cells=[...bat.querySelectorAll('.bt-ec')]; const clipCel=cells.some(c=>c.scrollWidth>c.clientWidth+1);
        return { b:R(box), tr:R(tr), sig:R(sig), end:R(end), nome:R(nome),
          sigVis:vis(sig), trVis:vis(tr), sigDentro:dentro(R(sig),R(box)), trDentro:dentro(R(tr),R(box)),
          trClip:tr?(tr.scrollWidth>tr.clientWidth+1):true, clipCel, nCells:cells.length }; });
      const tag=`${E.w}×${E.h}/${C.n}tipos`;
      ok(m.nCells===C.n, `${tag}: mostra ${C.n} tipo(s) (veio ${m.nCells})`);
      ok(m.sigVis&&m.sigDentro, `${tag}: o Σ está inteiro e visível dentro da caixa`);
      ok(m.trVis&&m.trDentro&&!m.trClip, `${tag}: o ⇄ TROCAR está inteiro e visível dentro da caixa`);
      ok(!m.clipCel, `${tag}: nenhum quadrado de energia corta`);
      ok(m.b.right<=m.end.left+0.6, `${tag}: a caixa não encosta no ENCERRAR TURNO`);
      ok(m.b.left>=m.nome.right-0.6, `${tag}: a caixa não invade o bloco do nome`);
      // tocar no TROCAR abre a troca (ov='conv')
      await page.$eval('#btrocar', el=>el.click());
      const abriu=await page.evaluate(()=>ov==='conv');
      ok(abriu, `${tag}: tocar no ⇄ TROCAR abre a troca`);
      await ctx.close();
    }
  }

  await browser.close();
  console.log(falhas===0?'\n>>> BATALHA_LAYOUT OK':`\n>>> ${falhas} FALHA(S)`);
  process.exit(falhas?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
