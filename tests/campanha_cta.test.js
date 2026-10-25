// campanha_cta.test.js (§356) — o BOTÃO DE AÇÃO do ato da CAMPANHA (JOGAR / REJOGAR / Escolha seu time /
// Confirmar escolha / Continuar, conforme tipo e estado) fica SEMPRE VISÍVEL dentro do painel da direita,
// sem rolagem, ACIMA da trilha (a faixa de baixo). O dono relatou que, no ato 6 do Capítulo 1, o botão
// "some" e BLOQUEIA o jogo. CAUSA: o painel tinha altura FIXA (290px) com o rodapé a ~2px da trilha, e os
// painéis de ESCOLHA/HISTÓRIA punham o conteúdo como filhos diretos (sem o rol que rola) — conteúdo alto
// empurrava a CTA para trás da trilha (que tem z-index maior) e ela sumia. §356 ancorou o painel pela base
// (bottom:80px, 7px acima da trilha, em qualquer escala) e pôs TODO o miolo no .camp__briefrol (rola);
// a CTA fica FORA do rol, ancorada embaixo.
//
// PROVAS (Chromium, rect real), em 1846×852 E 780×360, para CADA ato (Prólogo + Capítulo 1), nos dois tipos
// (batalha e escolha) e nos estados (não jogado, vencido, vaga travada, vaga emprestada trocada):
//   (1) a CTA #campcta EXISTE e é visível (altura real, display!=none, opacity>=.5);
//   (2) está INTEIRA dentro do viewport;
//   (3) está INTEIRA acima da trilha (.camp__pe) — rodapé da CTA <= topo da trilha;
//   (4) é o elemento que RECEBE o toque no seu centro (document.elementFromPoint).
// (5) ESTRESSE: inflando o miolo do painel (como o conteúdo real cresce) em batalha, escolha E história,
//     a CTA CONTINUA acima da trilha e clicável — o teste FALHA se alguém remover o rol de novo.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
function acharChromium(){ if(process.env.INCURSION_CHROMIUM) return process.env.INCURSION_CHROMIUM;
  try{ const base='/opt/pw-browsers'; const d=fs.readdirSync(base).filter(x=>/^chromium-\d+$/.test(x)).sort().pop();
    if(d){ const b=path.join(base,d,'chrome-linux','chrome'); if(fs.existsSync(b)) return b; } }catch(e){} return undefined; }
let falhas=0; const ok=(c,m)=>{ if(!c){ falhas++; console.log('  XX '+m); } };
const distAbs=path.resolve(__dirname,'..','dist','incursion.html');
const SIZES=[[1846,852],[780,360]];
const ESTADOS=['aberto','vencido','travado','trocado'];

// função (string) injetada na página: monta o perfil no estado pedido, renderiza o ato e mede a CTA.
const MEDIR=`(ci,ai,variante)=>{
  perfil.campanha={capitulo:0,fase:0,concluidas:[],escolhas:{}};
  perfil.deuses={}; campSwap={}; campVistaAto=null; campEscolhaSel=null; campPicker=null; campKitRev=null;
  const caps=CAMPANHAS.capitulos; const ato=caps[ci].atos[ai];
  // todas as escolhas ANTERIORES na opção certa -> gera consequências/empréstimo no ato-alvo
  caps.forEach(c=>c.atos.forEach(a=>{ if(a.tipo==='escolha'&&a.certa) perfil.campanha.escolhas[a.id]=a.certa; }));
  if(variante!=='travado') ROSTER.forEach(e=>perfil.deuses[e.key]={copias:1,obtidoEm:0});
  if(variante==='vencido') perfil.campanha.concluidas.push(ato.id);
  if(variante==='trocado'){ try{ const slots=slotsDoAto(ato); const k=slots.findIndex(s=>s&&s.emprestado);
    if(k>=0){ const cand=ROSTER.find(e=>!slots.some(s=>s&&s.key===e.key)); if(cand) campSwap[k]=cand.key; } }catch(e){} }
  campCapIdx=ci; campAtoIdx=ai; ir('campanha',{},{substituir:true}); render();
  const g=document.getElementById('gsplash'); if(g) g.remove();
  const cta=document.querySelector('.camp__cta'); const pe=document.querySelector('.camp__pe');  // §364: #campcta (batalha/história/escolha-opções) ou #campvopc (escolha-texto)
  if(!cta) return {semCta:true};
  const rc=cta.getBoundingClientRect(), rp=pe?pe.getBoundingClientRect():null, cs=getComputedStyle(cta);
  const cx=rc.left+rc.width/2, cy=rc.top+rc.height/2; const hit=document.elementFromPoint(cx,cy);
  return { label:cta.textContent.trim(), h:rc.height,
    dentroVP: rc.top>=-0.5 && rc.bottom<=innerHeight+0.5 && rc.left>=-0.5 && rc.right<=innerWidth+0.5,
    acimaTrilha: rp ? rc.bottom<=rp.top+0.5 : true, gap: rp?+(rp.top-rc.bottom).toFixed(1):null,
    hitIsCta: !!hit && (hit===cta||cta.contains(hit)), hitTag: hit?(hit.id||hit.className||hit.tagName):'null',
    visivel: cs.display!=='none' && +cs.opacity>=0.5 && rc.height>=10 };
}`;

// estresse: renderiza um ato do tipo pedido (história é SINTÉTICA — não há no dado atual), infla o miolo
// como o conteúdo real cresceria (dentro do .camp__briefrol quando existe) e remede a CTA.
const ESTRESSAR=`(tipo)=>{
  perfil.campanha={capitulo:0,fase:0,concluidas:[],escolhas:{}}; perfil.deuses={}; campSwap={}; campVistaAto=null;
  ROSTER.forEach(e=>perfil.deuses[e.key]={copias:1,obtidoEm:0});
  const caps=CAMPANHAS.capitulos; let f=null, restore=null;
  if(tipo==='historia'){ // transforma temporariamente um ato em história para exercer esse caminho de render
    const a=caps[0].atos[0]; const velho=a.tipo; a.tipo='historia'; restore=()=>{a.tipo=velho;}; f={ci:0,ai:0};
  } else { caps.forEach((c,ci)=>c.atos.forEach((a,ai)=>{ if(!f&&a.tipo===tipo) f={ci,ai}; })); }
  if(!f) return {semAto:true};
  campCapIdx=f.ci; campAtoIdx=f.ai; ir('campanha',{},{substituir:true}); render();
  const g=document.getElementById('gsplash'); if(g) g.remove();
  const brief=document.querySelector('.camp__brief'); const cta=document.querySelector('.camp__cta');
  const rol=brief?brief.querySelector('.camp__briefrol'):null;
  if(!brief||!cta){ if(restore)restore(); return {semCta:true}; }
  const alto=document.createElement('div'); alto.innerHTML='<p>'+('conteúdo muito alto de consequência '.repeat(80))+'</p>';
  (rol||brief).insertBefore(alto, rol?null:cta);   // no rol (fim) se existe; senão como filho direto antes da CTA
  const rc=cta.getBoundingClientRect(), pe=document.querySelector('.camp__pe'), rp=pe.getBoundingClientRect();
  const cx=rc.left+rc.width/2, cy=rc.top+rc.height/2; const hit=document.elementFromPoint(cx,cy);
  const r={ temRol:!!rol, acimaTrilha: rc.bottom<=rp.top+0.5, gap:+(rp.top-rc.bottom).toFixed(1),
    hitIsCta: !!hit && (hit===cta||cta.contains(hit)), hitTag: hit?(hit.id||hit.className||hit.tagName):'null' };
  if(restore) restore();
  return r;
}`;

(async()=>{
  const browser=await chromium.launch({executablePath:acharChromium(),headless:true,args:['--no-sandbox']});
  for(const [W,H] of SIZES){
    const ctx=await browser.newContext({viewport:{width:W,height:H},deviceScaleFactor:1});
    const page=await ctx.newPage(); await page.goto('file://'+distAbs,{waitUntil:'load'});
    const mapa=await page.evaluate(()=>CAMPANHAS.capitulos.map((c,ci)=>({ci,numero:c.numero,
      atos:c.atos.map((a,ai)=>({ai,id:a.id,tipo:a.tipo}))})));

    for(const cap of mapa){ for(const at of cap.atos){ for(const variante of ESTADOS){
      const r=await page.evaluate(([ci,ai,v,fn])=>eval('('+fn+')')(ci,ai,v), [cap.ci,at.ai,variante,MEDIR]);
      const tag=`${W}x${H} cap${cap.numero}/${at.id}[${at.tipo}]/${variante}`;
      if(r.semCta){ ok(false, tag+' :: #campcta NÃO existe'); continue; }
      ok(r.visivel,     tag+` :: CTA visível (h=${Math.round(r.h)})`);
      ok(r.dentroVP,    tag+' :: CTA inteira dentro do viewport');
      ok(r.acimaTrilha, tag+` :: CTA acima da trilha (gap=${r.gap})`);
      ok(r.hitIsCta,    tag+` :: toque no centro cai na CTA (caiu em: ${r.hitTag})`);
    }}}

    // (5) ESTRESSE por tipo
    for(const tipo of ['batalha','escolha','historia']){
      const r=await page.evaluate(([t,fn])=>eval('('+fn+')')(t), [tipo,ESTRESSAR]);
      const tag=`${W}x${H} ESTRESSE/${tipo}`;
      if(r.semAto){ ok(false, tag+' :: não achou ato do tipo'); continue; }
      if(r.semCta){ ok(false, tag+' :: sem painel/CTA'); continue; }
      ok(r.temRol,      tag+' :: o miolo está num .camp__briefrol que rola (não some a CTA)');
      ok(r.acimaTrilha, tag+` :: com conteúdo alto, a CTA CONTINUA acima da trilha (gap=${r.gap})`);
      ok(r.hitIsCta,    tag+` :: com conteúdo alto, o toque ainda cai na CTA (caiu em: ${r.hitTag})`);
    }
    await ctx.close();
  }
  await browser.close();
  if(falhas){ console.log(`\n>>> campanha_cta §356: ${falhas} FALHA(S)`); process.exit(1); }
  console.log('>>> campanha_cta §356 OK — a CTA do ato fica sempre visível e acima da trilha (todos os atos/estados/tamanhos + estresse).');
})().catch(e=>{ console.error(e.stack||e.message||e); process.exit(1); });
