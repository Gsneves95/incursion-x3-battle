// batalha_inspecao.test.js (§329) — as PROVAS jsdom do dono sobre o layout refeito:
//   1) tocar no Anúbis sem habilidade selecionada mostra a PASSIVA no painel;
//   2) a miniatura do MILAGRE (caixa "Toque numa habilidade") mostra o Milagre no painel;
//   3) com habilidade SELECIONADA, tocar no inimigo ESCOLHE ALVO (não inspeciona);
//   4) no TURNO DO OPONENTE, as habilidades do jogador NÃO RESPONDEM;
//   5) tocar num ÍCONE DE EFEITO mostra o efeito no painel.
const fs=require('fs'); const path=require('path'); const { JSDOM, VirtualConsole } = require('jsdom');
let falhas=0, passes=0; const ok=(c,m)=>{ if(!c){ console.log('  ✗ FALHA: '+m); falhas++; } else { console.log('  ✓ '+m); passes++; } };
const html=fs.readFileSync(path.resolve(__dirname,'..','dist','incursion.html'),'utf8');

(function main(){
  const vc=new VirtualConsole(); let err=null; vc.on('jsdomError',e=>err=(e.detail&&e.detail.message)||e.message);
  const w=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'http://localhost/',virtualConsole:vc}).window;
  const d=w.document, $=s=>d.querySelector(s), $$=s=>[...d.querySelectorAll(s)];
  const txt=el=>(el?el.textContent:'').replace(/\s+/g,' ').trim();
  console.log('== §329 / INSPEÇÃO E TOQUES NO LAYOUT REFEITO (jsdom) ==');
  ok(w.eval("typeof LAYOUT_BATALHA==='object' && !!LAYOUT_BATALHA"), 'LAYOUT_BATALHA injetado (data/layout_batalha.json)');

  const allyK=w.eval(`(function(){ const temMil=k=>{const g=GODS[k];return g&&(g.ab||[]).some(a=>a.slot==='milagre');};
    if(GODS['anubis']&&GODS['anubis'].passiva&&temMil('anubis'))return 'anubis';
    return Object.keys(GODS).find(k=>GODS[k].passiva&&temMil(k))||Object.keys(GODS)[0]; })()`);
  const fill=JSON.parse(w.eval(`JSON.stringify(Object.keys(GODS).filter(k=>k!==${JSON.stringify(allyK)}).slice(0,5))`));
  const ally=[allyK,fill[0],fill[1]], enemy=[fill[2],fill[3],fill[4]];
  w.eval(`
    perfil=novoPerfil(0,0);
    st=montarProvacao({aliados:${JSON.stringify(ally)},inimigos:${JSON.stringify(enemy)},montar:{seed:3,comeca:0}});
    prova=null;campanha=null;provaFim=null;campanhaFim=null;dominio=null;vsCPU=true;IA_LADO=1;modoPvP=false;
    st.ativo=0; foco=null; armado=null; detalhe=null;
    ir('batalha',{},{substituir:true}); if(typeof pararRelogio==='function')pararRelogio(); render();
  `);
  ok(!err,'a batalha renderiza sem quebrar ('+(err||'ok')+')');
  const allyUid=w.eval("st.lados[0].units[0].uid");
  const enemyUid=w.eval("st.lados[1].units[0].uid");

  // ---- 1) tocar o Anúbis (sem arma) → passiva no painel ----
  console.log('\n== 1) tocar o aliado (sem arma) mostra a passiva no painel ==');
  w.eval("armado=null;detalhe=null;render();");
  const pAlly=$(`.bt-portrait--ally[data-uid="${allyUid}"]`);
  ok(!!pAlly,'o retrato do aliado existe (.bt-portrait--ally)');
  pAlly.onclick({stopPropagation(){}});
  ok(w.eval("detalhe&&detalhe.kind")==='unidade','tocar o aliado abre a leitura da unidade no painel');
  const pasNome=w.eval(`(GODS[${JSON.stringify(allyK)}].passiva||{}).nome||''`);
  const panel=$('.bt-panel');
  ok(!!panel && new RegExp(pasNome.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'i').test(txt(panel)), `o painel nomeia a passiva ("${pasNome}")`);

  // ---- 2) a miniatura do Milagre mostra o Milagre ----
  console.log('\n== 2) a miniatura do Milagre mostra o Milagre no painel ==');
  const miniMil=$(`.bt-mini[data-look="${allyUid}|milagre"]`);
  ok(!!miniMil,'a miniatura do Milagre existe na caixa "Toque numa habilidade"');
  miniMil.onclick({stopPropagation(){}});
  const milNome=w.eval(`(function(){const u=st.lados[0].units[0];const a=acoesDe(st,u).find(x=>x.slot==='milagre');return a?a.nome:'';})()`);
  ok(w.eval("detalhe&&detalhe.kind")==='skill','a miniatura abre a leitura de habilidade no painel');
  ok(milNome && txt($('.bt-panel__titulo')).toUpperCase().includes(milNome.toUpperCase()), `o painel mostra o Milagre ("${milNome}")`);

  // ---- 3) com habilidade armada, tocar o inimigo ESCOLHE ALVO ----
  console.log('\n== 3) com habilidade armada, tocar o inimigo escolhe alvo (não inspeciona) ==');
  w.eval("try{ELEMS.forEach(e=>st.lados[0].orbs[e]=9);}catch(e){} armado=null;detalhe=null;render();");
  w.eval(`armar('${allyUid}','basico'); render();`);
  ok(!!w.eval("armado"),'o básico ficou ARMADO');
  ok(w.eval(`alvos.some(a=>a.uid==='${enemyUid}')`),'o inimigo é alvo legal (data-target)');
  const foe=$(`.bt-portrait--foe[data-uid="${enemyUid}"]`);
  const hpAntes=w.eval(`st.lados[1].units.find(u=>u.uid==='${enemyUid}').hp`);
  foe.onclick({stopPropagation(){}});
  const resolveu = w.eval("!armado") || w.eval(`st.lados[1].units.find(u=>u.uid==='${enemyUid}').hp`) < hpAntes;
  ok(resolveu,'tocar o inimigo com arma RESOLVE/avança o alvo (não vira inspeção)');
  ok(w.eval("!(detalhe&&detalhe.kind==='unidade')"),'tocar o inimigo com arma NÃO abre a leitura de unidade');

  // ---- 4) turno do oponente: as habilidades do jogador não respondem ----
  console.log('\n== 4) no turno do oponente, as habilidades do jogador não respondem ==');
  w.eval("st.ativo=1; iaAtiva=true; armado=null; detalhe=null; foco=st.lados[1].units[0].uid; render();");
  const sk=$(`.bt-skill[data-sk="${allyUid}|basico"]`);
  ok(!!sk && sk.dataset.dead==='1','as habilidades do jogador ficam marcadas inertes (data-dead)');
  ok(!sk.onclick,'a habilidade do jogador NÃO tem handler no turno do oponente');
  w.eval("st.ativo=0; iaAtiva=false; render();");

  // ---- 5) tocar um ícone de efeito mostra o efeito ----
  console.log('\n== 5) tocar um ícone de efeito mostra o efeito no painel ==');
  w.eval(`(function(){ const u=st.lados[0].units[0]; u.efeitos=[{type:'dmgUp',v:8,dur:2}]; u.dots=[{nome:'queimadura',v:5,dur:2}]; armado=null; detalhe=null; render(); })()`);
  const eff=$('.bt-eff[data-eff]');
  ok(!!eff,'há ícone de efeito (.bt-eff)');
  eff.onclick({stopPropagation(){}});
  ok(w.eval("detalhe&&detalhe.kind")==='efeito','tocar o ícone abre a leitura do EFEITO no painel');
  ok(/Dano|Queimadura/i.test(txt($('.bt-panel__titulo'))),'o painel nomeia o efeito');

  // ---- 6) §330: SEM quadro de ação; marcar/desmarcar uma habilidade funciona pelo PRÓPRIO botão ----
  console.log('\n== 6) §330: sem quadro de ação; marcar/desmarcar pelo próprio botão ==');
  w.eval(`st=montarProvacao({aliados:${JSON.stringify(ally)},inimigos:${JSON.stringify(enemy)},montar:{seed:3,comeca:0}});
    st.ativo=0;iaAtiva=false;armado=null;detalhe=null;escolhidos=[];alvos=[];try{ELEMS.forEach(e=>st.lados[0].orbs[e]=9);}catch(e){} foco=st.lados[0].units[0].uid; render();`);
  ok($$('.bt-acao').length===0 && $$('[data-acao]').length===0, `o quadro de ação não existe no DOM (há ${$$('.bt-acao').length})`);
  let bsk=$(`.bt-skill[data-sk="${allyUid}|basico"]`);
  ok(!!bsk && bsk.dataset.arma==='1','o Básico é armável (data-arma=1)');
  bsk.onclick(); w.eval('render()');
  ok(w.eval(`armado&&armado.slot==='basico'`),'tocar o botão ARMA a habilidade (sem quadro de ação)');
  const bskArm=$(`.bt-skill[data-sk="${allyUid}|basico"]`);
  ok(!!bskArm && bskArm.classList.contains('is-armed'),'o botão fica marcado (moldura is-armed)');
  ok(!!$('.bt-skill.is-armed .bt-skill__sel'),'o selo ✓ aparece no botão marcado');
  bskArm.onclick(); w.eval('render()');
  ok(w.eval("!armado"),'tocar o MESMO botão de novo DESMARCA a habilidade');
  ok(!$('.bt-skill.is-armed'),'nenhum botão fica marcado após desmarcar');

  // ---- 7) §331: confirmar ENCERRAR TURNO sem nenhuma ação ----
  console.log('\n== 7) §331: confirmar encerrar turno sem agir ==');
  const fresh = (extra='') => w.eval(`st=montarProvacao({aliados:${JSON.stringify(ally)},inimigos:${JSON.stringify(enemy)},montar:{seed:3,comeca:0}});
    prova=null;campanha=null;dominio=null;provaFim=null;campanhaFim=null;vsCPU=true;IA_LADO=1;modoPvP=false;iaAtiva=false;
    st.ativo=0; armado=null;detalhe=null;escolhidos=[];alvos=[];ov=null; try{ELEMS.forEach(e=>st.lados[0].orbs[e]=9);}catch(e){}
    st.lados[0].dividaLivre=0; foco=st.lados[0].units[0].uid; relogio=60; ${extra} render();`);
  // (a) zero marcadas + há usável → abre a confirmação
  fresh(); $('#bend2').onclick();
  ok(w.eval("ov")==='confirmEnc', '(a) zero marcadas + usável → abre a confirmação');
  // (b) VOLTAR mantém o turno
  $('#bencvolta').onclick();
  ok(w.eval("ov")===null && w.eval("st.ativo")===0, '(b) VOLTAR fecha a caixa e MANTÉM o turno (ativo=0)');
  // (c) ENCERRAR MESMO ASSIM encerra (o lado passa)
  fresh(); $('#bend2').onclick(); ok(w.eval("ov")==='confirmEnc','(c) abriu para encerrar');
  $('#bencok').onclick();
  ok(w.eval("ov")===null && w.eval("st.ativo")===1, '(c) ENCERRAR MESMO ASSIM encerra o turno (ativo=1)');
  // (d) com UMA habilidade marcada (armada) → NÃO abre
  fresh(`armar(st.lados[0].units[0].uid,'basico');`);
  ok(w.eval("!!armado"), '(d) há uma habilidade marcada (armada)');
  $('#bend2').onclick();
  ok(w.eval("ov")!=='confirmEnc', '(d) com uma marcada → NÃO abre a confirmação (encerra direto)');
  // (e) sem NADA usável (todos dormindo) → NÃO abre
  fresh(`st.lados[0].units.forEach(u=>u.efeitos=[{type:'adormecido',dur:1}]);`);
  ok(!w.eval("deveConfirmarEncerrar()"), '(e) sem habilidade usável → não pede confirmação');
  $('#bend2').onclick();
  ok(w.eval("ov")!=='confirmEnc', '(e) sem nada usável → NÃO abre (encerra direto)');
  // (f) tempo esgotado com a caixa aberta → ela fecha e o turno encerra
  fresh(); $('#bend2').onclick(); ok(w.eval("ov")==='confirmEnc','(f) caixa aberta');
  w.eval("relogio=1; tique();");
  ok(w.eval("ov")===null && w.eval("st.ativo")===1, '(f) tempo esgotado com a caixa aberta → fecha e encerra o turno');

  console.log(`\n${falhas===0?'>>> BATALHA_INSPECAO OK':'>>> '+falhas+' FALHA(S)'} (${passes} ok)`);
  process.exit(falhas?1:0);
})();
