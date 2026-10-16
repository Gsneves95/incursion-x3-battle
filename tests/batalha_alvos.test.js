// batalha_alvos.test.js (§336) — AUDITORIA de TODOS os tipos de alvo com TOQUE REAL (click no elemento renderizado,
// não chamada direta de função). Para cada tipo: arma a habilidade (click no botão), confirma com o toque indicado
// (inimigo / 2 inimigos / aliado / 2 aliados / qualquer inimigo p/ área / #bconf p/ sem-alvo·auto / inimigo+#bconf p/
// distribui) e verifica que a AÇÃO FOI TOMADA (a unidade agiu). FALHA se os seletores do campo/painel mudarem de novo.
// (self não é um alvo armável de topo — só existe como escopo interno de fx; coberto por nenhum/auto.)
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
function acharChromium(){ if(process.env.INCURSION_CHROMIUM) return process.env.INCURSION_CHROMIUM;
  try{ const base='/opt/pw-browsers'; const d=fs.readdirSync(base).filter(x=>/^chromium-\d+$/.test(x)).sort().pop();
    if(d){ const b=path.join(base,d,'chrome-linux','chrome'); if(fs.existsSync(b)) return b; } }catch(e){} return undefined; }
let falhas=0; const ok=(c,m)=>{ console.log((c?'  ok ':'  XX ')+m); if(!c) falhas++; };
const distAbs=path.resolve(__dirname,'..','dist','incursion.html');

// um caso por tipo, com uma habilidade REAL daquele tipo (deus · slot)
const CASOS=[
  { tipo:'inimigo',       god:'afrodite',  slot:'basico',     toques:['foe0'] },
  { tipo:'2inimigos',     god:'afrodite',  slot:'habilidade', toques:['foe0','foe1'] },
  { tipo:'todosInimigos', god:'afrodite',  slot:'milagre',    toques:['foe1'] },      // QUALQUER inimigo confirma
  { tipo:'nenhum',        god:'amaterasu', slot:'habilidade', toques:['bconf'] },
  { tipo:'auto',          god:'lugh',      slot:'milagre',    toques:['bconf'] },
  { tipo:'aliado',        god:'apolo',     slot:'habilidade', toques:['ally1'] },
  { tipo:'2aliados',      god:'freyja',    slot:'habilidade', toques:['ally1','ally2'] },
  { tipo:'distribui',     god:'babi',      slot:'milagre',    toques:['foe0','bconf'] }, // escolhe 1 + confirma
];

(async()=>{
  const browser=await chromium.launch({executablePath:acharChromium(),headless:true,args:['--no-sandbox']});
  const ctx=await browser.newContext({viewport:{width:1846,height:852},deviceScaleFactor:1});
  const page=await ctx.newPage(); await page.goto('file://'+distAbs,{waitUntil:'load'});
  console.log('== §336 auditoria de alvos (toque real) ==');

  for(const c of CASOS){
    // monta a batalha com o deus do caso como aliado 0, orbes cheias, meu turno
    await page.evaluate((c)=>{
      st=montarProvacao({aliados:[c.god,'ares','tyr'],inimigos:['poseidon','hera','zeus'],montar:{seed:3,comeca:0}});
      prova=null;provaFim=null;campanha=null;campanhaFim=null;dominio=null;vsCPU=true;IA_LADO=1;try{pararRelogio();}catch(e){}
      ELEMS.forEach(e=>st.lados[0].orbs[e]=9);
      st.ativo=0;foco=st.lados[0].units[0].uid;armado=null;alvos=[];escolhidos=[];detalhe=null;resumoTurno=null;
      ir('batalha',{},{substituir:true});render();
    }, c);

    const uid=await page.evaluate(()=>st.lados[0].units[0].uid);
    // 1) o botão da habilidade existe e está CLICÁVEL (usável): data-arma=1
    const arma=await page.$eval(`[data-sk="${uid}|${c.slot}"]`, el=>el.getAttribute('data-arma')).catch(()=>null);
    ok(arma==='1', `${c.tipo} (${c.god}/${c.slot}): a habilidade está usável (data-arma=1)`);
    // 2) ARMA com TOQUE real no botão
    await page.$eval(`[data-sk="${uid}|${c.slot}"]`, el=>el.click());
    await page.waitForTimeout(40);
    const armou=await page.evaluate(()=>!!armado);
    ok(armou, `${c.tipo}: armou ao tocar o botão`);
    // 3) os toques de confirmação (inimigo/aliado/qualquer/ #bconf)
    for(const t of c.toques){
      await page.evaluate(async (t)=>{
        const byFoe=i=>st.lados[1].units.filter(u=>u.vivo)[i];
        const byAlly=i=>st.lados[0].units.filter(u=>u.vivo)[i];
        let sel=null;
        if(t==='bconf') sel='#bconf';
        else if(t.startsWith('foe')) sel=`[data-uid="${byFoe(+t.slice(3)).uid}"]`;
        else if(t.startsWith('ally')) sel=`[data-uid="${byAlly(+t.slice(4)).uid}"]`;
        const el=document.querySelector(sel); if(el) el.click();
      }, t);
      await page.waitForTimeout(40);
    }
    // 4) a AÇÃO foi tomada: a unidade agiu (ou, p/ multi-passo, ao menos confirmou) — agiu=true é a prova final
    const agiu=await page.evaluate(()=>st.lados[0].units[0].agiu===true);
    ok(agiu, `${c.tipo}: depois do toque, a ação foi marcada/executada (a unidade agiu)`);
    // 5) e desarmou (ação concluída, não ficou pendurada)
    const limpo=await page.evaluate(()=>!armado);
    ok(limpo, `${c.tipo}: a ação concluiu (desarmou)`);
  }

  // ---- (2) §336: habilidade INUSÁVEL parece inativa (apagada) no MEU turno; USÁVEL fica colorida e arma ----
  console.log('== §336 inusável apagada / usável colorida ==');
  async function estado(slot){ const uid=await page.evaluate(()=>st.lados[0].units[0].uid);
    return page.$eval(`[data-sk="${uid}|${slot}"]`, el=>({arma:el.getAttribute('data-arma'), style:el.getAttribute('style')})); }
  const apagado=s=>/grayscale\(\.85\)|grayscale\(0\.85\)/.test(s.style||'');
  // (a) USÁVEL: orbes cheias, deus são → afrodite basico colorido (filtro none) e arma
  await page.evaluate(()=>{ st=montarProvacao({aliados:['afrodite','apolo','tyr'],inimigos:['poseidon','hera','zeus'],montar:{seed:3,comeca:0}});
    prova=null;campanha=null;vsCPU=true;IA_LADO=1;try{pararRelogio();}catch(e){} ELEMS.forEach(e=>st.lados[0].orbs[e]=9);
    st.ativo=0;foco=st.lados[0].units[0].uid;armado=null;detalhe=null; ir('batalha',{},{substituir:true});render(); });
  let s=await estado('basico'); ok(s.arma==='1'&&!apagado(s), 'usável: afrodite basico colorido (data-arma=1, sem grayscale)');
  // (b) SEM ENERGIA: zera os orbes → o basico (custo Aurora) fica apagado e NÃO arma (abre leitura com motivo)
  await page.evaluate(()=>{ ELEMS.forEach(e=>st.lados[0].orbs[e]=0); armado=null;detalhe=null; render(); });
  s=await estado('basico'); ok(s.arma==='0'&&apagado(s), 'sem energia: basico apagado (grayscale) e data-arma=0');
  { const uid=await page.evaluate(()=>st.lados[0].units[0].uid);
    await page.$eval(`[data-sk="${uid}|basico"]`, el=>el.click()); await page.waitForTimeout(40);
    const r=await page.evaluate(()=>({armado:!!armado, motivo:(detalhe&&detalhe.motivo)||''}));
    ok(!r.armado, 'sem energia: tocar NÃO arma'); ok(/energia/i.test(r.motivo), 'sem energia: a leitura mostra o motivo ("'+r.motivo+'")'); }
  // (c) EM RECARGA: cd>0 → apagado e não arma
  await page.evaluate(()=>{ ELEMS.forEach(e=>st.lados[0].orbs[e]=9); st.lados[0].units[0].cd.habilidade=2; armado=null;detalhe=null; render(); });
  s=await estado('habilidade'); ok(s.arma==='0'&&apagado(s), 'recarga: habilidade apagada (grayscale) e data-arma=0');
  // (d) IMPEDIDO (atordoado): a unidade não pode agir → todas as habilidades apagadas
  await page.evaluate(()=>{ st.lados[0].units[0].cd.habilidade=0; st.lados[0].units[0].efeitos=[{type:'atordoado',dur:1}]; armado=null;detalhe=null; render(); });
  s=await estado('basico'); ok(s.arma==='0'&&apagado(s), 'atordoado: basico apagado (grayscale) e data-arma=0');
  // (e) MORTO: unidade morta → apagada
  await page.evaluate(()=>{ st.lados[0].units[0].efeitos=[]; st.lados[0].units[0].vivo=false; armado=null;detalhe=null; render(); });
  s=await estado('basico'); ok(s.arma==='0'&&apagado(s), 'morto: basico apagado (grayscale) e data-arma=0');
  // (f) RECÁLCULO: gastar a energia apaga NA HORA a habilidade de OUTRA unidade que dependia dela
  await page.evaluate(()=>{ st=montarProvacao({aliados:['afrodite','apolo','tyr'],inimigos:['poseidon','hera','zeus'],montar:{seed:3,comeca:0}});
    prova=null;campanha=null;vsCPU=true;IA_LADO=1;try{pararRelogio();}catch(e){} ELEMS.forEach(e=>st.lados[0].orbs[e]=0); st.lados[0].orbs.Aurora=1;
    st.ativo=0;foco=st.lados[0].units[0].uid;armado=null;detalhe=null; ir('batalha',{},{substituir:true});render(); });
  const apoloUid=await page.evaluate(()=>st.lados[0].units[1].uid);
  let ap=await page.$eval(`[data-sk="${apoloUid}|basico"]`, el=>el.getAttribute('data-arma'));
  ok(ap==='1', 'recálculo: antes, o basico do apolo (custo Aurora) está usável');
  // afrodite gasta a única Aurora no seu basico (arma + confirma num inimigo)
  await page.evaluate(()=>{ const u=st.lados[0].units[0]; document.querySelector(`[data-sk="${u.uid}|basico"]`).click(); });
  await page.waitForTimeout(40);
  await page.evaluate(()=>{ const foe=st.lados[1].units.find(u=>u.vivo); document.querySelector(`[data-uid="${foe.uid}"]`).click(); });
  await page.waitForTimeout(40);
  ap=await page.$eval(`[data-sk="${apoloUid}|basico"]`, el=>({arma:el.getAttribute('data-arma'),style:el.getAttribute('style')}));
  ok(ap.arma==='0'&&apagado(ap), 'recálculo: após gastar a Aurora, o basico do apolo apaga na hora (grayscale, data-arma=0)');

  await ctx.close();
  await browser.close();
  console.log(falhas===0?'\n>>> BATALHA_ALVOS OK':`\n>>> ${falhas} FALHA(S)`);
  process.exit(falhas?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
