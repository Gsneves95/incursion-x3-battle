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

// CAIXAS ESPERADAS (px de design, relativas ao #batalha) — transcritas do HTML/JSON.
const CAIXAS=[
  { nome:'header',   sel:'#batalha > #baselayer, header, header', pick:'header', x:0,   y:0,   w:1846, h:96 },
  { nome:'energia',  sel:'.bt-ebox',              x:590, y:26,  w:388,  h:50 },
  { nome:'encerrar', sel:'#bend2',                x:1000,y:4,   w:307,  h:52 },
  { nome:'menu',     sel:'#bmenu',                x:1328,y:18,  w:46,   h:46 },
  { nome:'campo',    sel:'.b5-campo',             x:58,  y:98,  w:1732, h:536 },
  { nome:'painel',   sel:'.b5-painel',            x:58,  y:640, w:1732, h:166 },
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
    ok(JSON.stringify(m.campoCols)===JSON.stringify([676,884,172]), `@1846 colunas do campo = 676|884|172 (veio ${JSON.stringify(m.campoCols)})`);
    ok(JSON.stringify(m.painelCols)===JSON.stringify([840,564,328]), `@1846 colunas do painel = 840|564|328 (veio ${JSON.stringify(m.painelCols)})`);
    ok(m.retrato&&perto(m.retrato.w,140,2)&&perto(m.retrato.h,140,2), `@1846 retrato 140×140 (veio ${m.retrato&&Math.round(m.retrato.w)}×${m.retrato&&Math.round(m.retrato.h)})`);
    ok(m.skill&&perto(m.skill.w,108,2)&&perto(m.skill.h,108,2), `@1846 botão de habilidade 108×108 (veio ${m.skill&&Math.round(m.skill.w)}×${m.skill&&Math.round(m.skill.h)})`);
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
    const meu=await page.evaluate(()=>{ const bat=document.getElementById('batalha');
      const img=bat.querySelector('.b5-art img'); const tit=[...bat.querySelectorAll('div')].map(d=>d.textContent).find(t=>/SEU TURNO/.test(t));
      return { src:(img&&img.getAttribute('src'))||'', seuTurno:!!bat.textContent.match(/SEU TURNO/) }; });
    ok(/nezha/i.test(meu.src), `meu turno: a cena é a da Nezha (src ${meu.src})`);
    ok(meu.seuTurno, 'meu turno: o anúncio diz "SEU TURNO"');
    await page.evaluate(`st.ativo=1; armado=null;detalhe=null; render();`); await page.waitForTimeout(80);
    const opo=await page.evaluate(()=>{ const bat=document.getElementById('batalha'); const img=bat.querySelector('.b5-art img');
      return { src:(img&&img.getAttribute('src'))||'', opoTurno:/TURNO DO OPONENTE/.test(bat.textContent) }; });
    ok(/ahpuch/i.test(opo.src), `turno do oponente: a cena é a do Ah Puch (src ${opo.src})`);
    ok(opo.opoTurno, 'turno do oponente: o anúncio diz "TURNO DO OPONENTE"');
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
    ok(/nezha/i.test(m.artSrc)&&m.opY<50, `§335b cena: fallback de retrato ancora no topo p/ mostrar o rosto (object-position Y=${m.opY}%)`);
    ok(m.alpha>0, `§335b pílula de tipo: fundo colorido (alpha ${m.alpha})`);
    ok(m.temMoldura, '§335b imagem do painel: moldura inset na cor do acento');
    ok(/hades/i.test(m.avMe), `§335b avatar do jogador: retrato do 1º deus (src ${m.avMe})`);
    ok(/poseidon/i.test(m.avFoe), `§335b avatar da CPU: retrato do 1º inimigo (src ${m.avFoe})`);
    await ctx.close();
  }

  await browser.close();
  console.log(falhas===0?'\n>>> BATALHA_LAYOUT OK':`\n>>> ${falhas} FALHA(S)`);
  process.exit(falhas?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
