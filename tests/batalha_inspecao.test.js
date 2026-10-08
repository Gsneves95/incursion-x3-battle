// batalha_inspecao.test.js (§328) — QUADRO DE INSPEÇÃO + ETIQUETAS NOMEADAS (jsdom).
// As provas do dono, no caminho real de eventos (ligarCampo/ligarFoe/voltarNativo):
//   1) tocar um ALIADO sem habilidade armada ABRE o quadro, com a PASSIVA escrita;
//   2) tocar a miniatura MILAGRE mostra o texto do Milagre (no nível REAL da partida);
//   3) com habilidade ARMADA, tocar o INIMIGO escolhe ALVO e NÃO abre o quadro;
//   4) TODO tipo de efeito do motor (VOCAB) vira etiqueta com NOME escrito (nunca só ícone);
//   5) o VOLTAR do Android (voltarNativo) FECHA o quadro antes de qualquer outra coisa.
const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

let falhas = 0, passes = 0;
const ok = (c, m) => { if (!c) { console.log('  ✗ FALHA: ' + m); falhas++; } else { console.log('  ✓ ' + m); passes++; } };

const distAbs = path.resolve(__dirname, '..', 'dist', 'incursion.html');
const html = fs.readFileSync(distAbs, 'utf8');

(function main() {
  const vc = new VirtualConsole(); let err = null; vc.on('jsdomError', e => { err = (e.detail && e.detail.message) || e.message; });
  const w = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'http://localhost/', virtualConsole: vc }).window;
  const d = w.document, $ = s => d.querySelector(s), $$ = s => [...d.querySelectorAll(s)];
  const txt = el => (el ? el.textContent : '').replace(/\s+/g, ' ').trim();

  console.log('== §328 / QUADRO DE INSPEÇÃO + ETIQUETAS (jsdom) ==');
  ok(w.eval("typeof abrirInspec==='function' && typeof fecharInspec==='function'"), 'a view expõe abrirInspec/fecharInspec');
  ok(w.eval("typeof STATUS_VISUAL==='object' && !!STATUS_VISUAL"), 'STATUS_VISUAL existe (data/status_visual.json injetado)');

  // escolhe um ALIADO com PASSIVA e com MILAGRE (anubis, se existir; senão o 1º deus com passiva+milagre)
  const allyK = w.eval(`(function(){
    const temMil=k=>{ const g=GODS[k]; return g&&(g.ab||[]).some(a=>a.slot==='milagre'); };
    if(GODS['anubis']&&GODS['anubis'].passiva&&temMil('anubis')) return 'anubis';
    return Object.keys(GODS).find(k=>GODS[k].passiva&&temMil(k))||Object.keys(GODS)[0];
  })()`);
  const fill = JSON.parse(w.eval(`JSON.stringify(Object.keys(GODS).filter(k=>k!==${JSON.stringify(allyK)}).slice(0,5))`));
  const ally = [allyK, fill[0], fill[1]], enemy = [fill[2], fill[3], fill[4]];

  // Provação vsCPU: eu controlo o lado 0 e é o MEU turno (comeca:0) → posso ARMAR. Relógio parado p/ render estável.
  w.eval(`
    perfil = novoPerfil(0, 0);
    st = montarProvacao({ aliados: ${JSON.stringify(ally)}, inimigos: ${JSON.stringify(enemy)}, montar: { seed: 3, comeca: 0 } });
    prova=null; campanha=null; provaFim=null; campanhaFim=null; vsCPU=true; modoPvP=false;
    ir('batalha',{},{substituir:true}); if(typeof pararRelogio==='function') pararRelogio(); render();
  `);
  ok(!err, 'a batalha renderiza sem quebrar (' + (err || 'ok') + ')');
  const allyUid = w.eval("st.lados[0].units[0].uid");
  const enemyUid = w.eval("st.lados[1].units[0].uid");

  // ---- 1) tocar ALIADO sem arma → QUADRO com PASSIVA ----
  console.log('\n== 1) tocar aliado (sem arma) abre o quadro com a passiva ==');
  w.eval("armado=null; inspec=null; render();");
  ok(!$('.inspecao'), 'em repouso não há quadro aberto');
  const pAlly = $(`.portrait[data-uid="${allyUid}"]:not([data-foe])`);
  ok(!!pAlly, 'o retrato do aliado existe');
  pAlly.onclick({ stopPropagation(){} });   // dispara o handler de ligarCampo
  ok(w.eval("inspec") === allyUid, 'tocar o aliado marca inspec = uid do aliado');
  ok(!!$('.inspecao'), 'o QUADRO abre no campo');
  const pasNome = w.eval(`(GODS[${JSON.stringify(allyK)}].passiva||{}).nome||''`);
  const pasEl = $('.insppas');
  ok(!!pasEl && /Passiva —/.test(txt(pasEl)), 'o quadro mostra o bloco "Passiva — …"');
  ok(!!pasEl && txt(pasEl).includes(pasNome), `o quadro nomeia a passiva do aliado ("${pasNome}")`);

  // ---- 2) tocar a miniatura MILAGRE → texto do Milagre (nível real) ----
  console.log('\n== 2) tocar a miniatura Milagre mostra o texto do Milagre ==');
  const miniMil = $('[data-inspslot="milagre"]');
  ok(!!miniMil, 'a miniatura Milagre existe no quadro');
  miniMil.onclick({ stopPropagation(){} });
  ok(w.eval("inspecSlot") === 'milagre', 'a seleção do quadro passa a "milagre"');
  const milNome = w.eval(`(function(){ const u=st.lados[0].units[0]; const a=acoesDe(st,u).find(x=>x.slot==='milagre'); return a?a.nome:''; })()`);
  const milDesc = w.eval(`(function(){ const u=st.lados[0].units[0]; const a=acoesDe(st,u).find(x=>x.slot==='milagre'); return a?(a.desc||''):''; })()`);
  const detCab = txt($('.inspdet__cab'));
  ok(milNome && detCab.includes(milNome), `o detalhe mostra o NOME do Milagre ("${milNome}")`);
  const detTxt = txt($('.inspdet__txt'));
  // o texto do detalhe bate com o desc EFETIVO (nível da partida), não é vazio
  ok(detTxt.length > 0, 'o detalhe traz o texto do Milagre');
  if (milDesc) { const amostra = milDesc.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().slice(0, 18); ok(amostra && detTxt.includes(amostra), 'o texto do detalhe é o desc EFETIVO do Milagre (nível da partida)'); }

  // ---- 5) o VOLTAR do Android fecha o quadro (feito aqui p/ reusar o quadro aberto) ----
  console.log('\n== 5) o voltar do Android fecha o quadro ==');
  ok(w.eval("typeof voltarNativo==='function'"), 'voltarNativo existe');
  ok(!!w.eval("inspec"), 'o quadro está aberto antes do voltar');
  w.eval("voltarNativo();");
  ok(w.eval("inspec") === null, 'o voltar do Android zera inspec (fecha o quadro)');
  ok(!$('.inspecao'), 'o quadro some do campo após o voltar');

  // ---- 3) ARMADO: tocar o inimigo escolhe ALVO e NÃO abre o quadro ----
  console.log('\n== 3) com habilidade armada, tocar o inimigo é ALVO, não quadro ==');
  w.eval("inspec=null; armado=null; peekKit=null; detalhe=null; render();");
  // garante energia p/ o básico ficar disponível (o custo não é o foco deste teste) e arma pelo caminho real
  w.eval("try{ ELEMS.forEach(e=>st.lados[0].orbs[e]=9); }catch(e){} render();");
  const tileBas = $(`.skill[data-sk="${allyUid}|basico"]`);
  ok(!!tileBas, 'o tile do básico do aliado existe');
  w.eval(`armar('${allyUid}','basico'); render();`);
  ok(!!w.eval("armado"), 'o básico ficou ARMADO');
  const foe = $(`.portrait[data-uid="${enemyUid}"][data-foe]`);
  ok(!!foe, 'o retrato do inimigo existe');
  const alvoAntes = w.eval("JSON.stringify(alvos.map(a=>a.uid))");
  ok(w.eval(`alvos.some(a=>a.uid==='${enemyUid}')`), 'o inimigo é um ALVO legal do básico (data-target)');
  // gesto de toque curto: pointerdown + pointerup imediatos (sem long-press, sem mover)
  foe.dispatchEvent(new w.Event('pointerdown', { bubbles: true }));
  foe.dispatchEvent(new w.Event('pointerup', { bubbles: true }));
  ok(w.eval("inspec") === null, 'tocar o inimigo com arma NÃO abre o quadro (inspec segue null)');
  // o toque de alvo consumiu a mira: ou resolveu a ação (armado nulo) ou avançou a escolha — de todo modo, não é inspeção
  ok(!$('.inspecao'), 'nenhum quadro aparece ao mirar o inimigo');

  // ---- 4) TODO efeito do motor vira etiqueta NOMEADA ----
  console.log('\n== 4) todo tipo de efeito (VOCAB) rende etiqueta com NOME escrito ==');
  const vocab = JSON.parse(w.eval("JSON.stringify({ef:VOCAB.efeitos, dot:VOCAB.dots, cont:VOCAB.contadores})"));
  const nomeDe = (campo, k) => w.eval(`(function(){
    const u={uid:'t',vivo:true,efeitos:[],dots:[],contadores:{},shield:0,maxHp:100,hp:100};
    ${campo};
    const t=tagsDe(u).find(x=>x.key===${JSON.stringify(k)});
    return t&&t.nome?t.nome:'';
  })()`);
  let faltou = [];
  for (const k of vocab.ef) {
    const campo = k === 'shield' ? "u.shield=12" : `u.efeitos=[{type:${JSON.stringify(k)},v:5,dur:3}]`;
    const n = nomeDe(campo, k); if (!n) faltou.push('ef:' + k);
  }
  for (const k of vocab.dot) { const n = nomeDe(`u.dots=[{nome:${JSON.stringify(k)},v:5,dur:3}]`, k); if (!n) faltou.push('dot:' + k); }
  for (const k of vocab.cont) { const n = nomeDe(`u.contadores={${JSON.stringify(k)}:3}`, k); if (!n) faltou.push('cont:' + k); }
  ok(faltou.length === 0, `todos os ${vocab.ef.length}+${vocab.dot.length}+${vocab.cont.length} tipos têm etiqueta nomeada${faltou.length ? ' (faltou: ' + faltou.join(', ') + ')' : ''}`);

  console.log(`\n${falhas === 0 ? '>>> BATALHA_INSPECAO OK' : '>>> ' + falhas + ' FALHA(S)'} (${passes} ok)`);
  process.exit(falhas ? 1 : 0);
})();
