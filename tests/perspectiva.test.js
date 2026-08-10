// perspectiva.test.js (F0.7) — perspectiva fixa, modo espectador, resumo de turno
// e rótulos por modo. Integração jsdom sobre o build (como interface/rotas).
const { JSDOM } = require('jsdom');
const fs = require('fs'), path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', 'dist', 'incursion.html'), 'utf8');

let f = 0; const ok = (c, m) => { if (!c) { console.log('  FALHA: ' + m); f++; } };
const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true });
const w = dom.window;
const $$ = s => Array.from(w.document.querySelectorAll(s));
const $ = s => w.document.querySelector(s);
const MEU = ['zeus', 'ogum', 'tyr'], OPO = ['sobek', 'brigid', 'ganesha'];
// gods desenhados no time da esquerda (.team--ally)
const aliados = () => $$('.team--ally [data-slot^="god-"]').map(e => e.dataset.slot.replace('god-', ''));
function batalha(comeca) {
  w.eval(`st=novoEstado(${JSON.stringify(MEU)},${JSON.stringify(OPO)},1,${comeca}); ir('batalha',{},{substituir:true}); render();`);
}

console.log('== 8. perspectiva fixa: meu time à esquerda nos DOIS turnos (vs CPU) ==');
{
  w.eval("vsCPU=true; IA_LADO=1");   // eu = lado 0, CPU = lado 1
  batalha(0); w.eval("st.ativo=0; render()");
  const meuTurno = aliados();
  batalha(0); w.eval("st.ativo=1; render()");
  const turnoCPU = aliados();
  ok(MEU.every(k => meuTurno.includes(k)), 'no meu turno, meu time está à esquerda: ' + meuTurno);
  ok(MEU.every(k => turnoCPU.includes(k)), 'no turno da CPU, meu time CONTINUA à esquerda: ' + turnoCPU);
  ok(!turnoCPU.some(k => OPO.includes(k)), 'a CPU nunca aparece à esquerda');
  console.log('  esquerda = meu time nos dois turnos');
}

console.log('== 9. modo espectador no turno do oponente ==');
{
  w.eval("vsCPU=true; IA_LADO=1"); batalha(0); w.eval("st.ativo=1; render()");
  ok($$('.team--ally .skill[data-sk]:not([disabled])').length === 0, 'nenhum disco meu clicável no turno dele');
  ok($$('.skill.is-armed').length === 0, 'nenhum disco armado');
  ok($$('.foetab.open').length === 0, 'aba do oponente fechada');
  ok($$('.portrait.is-target').length === 0, 'nenhum alvo pulsando');
  ok(!$('#bend') && !!$('.endturn--wait'), 'botão primário vira indicador de espera');
  console.log('  discos apagados, aba fechada, sem alvo, primário = espera');
}

console.log('== 10. hot-seat: comportamento antigo (tela inverte) ==');
{
  w.eval("vsCPU=false"); batalha(0);
  w.eval("st.ativo=0; render()"); const a0 = aliados();
  w.eval("st.ativo=1; render()"); const a1 = aliados();
  ok(MEU.every(k => a0.includes(k)), 'ativo 0 → time 0 à esquerda');
  ok(OPO.every(k => a1.includes(k)), 'ativo 1 → time 1 à esquerda (inverteu)');
  ok($$('.team--ally .skill[data-sk]:not([disabled])').length > 0, 'em hot-seat os discos do lado ativo são clicáveis (sem espectador)');
  console.log('  hot-seat inverte a tela e nunca entra em espectador');
}

console.log('== 11. resumo do turno: aparece ao voltar, some ao 1º toque ==');
{
  w.eval("vsCPU=true; IA_LADO=1"); batalha(0); w.eval("st.ativo=0");
  w.eval("resumoTurno=[{turno:1,msg:'Sobek ataca Zeus: 12 de dano'}]; render()");
  ok(!!$('.detail--resumo'), 'o resumo aparece ao voltar para o meu turno');
  w.eval("stage.dispatchEvent(new Event('pointerdown')); render();");
  ok(!$('.detail--resumo'), 'o resumo some após o 1º toque');
  console.log('  resumo mostrado e dispensado no toque');
}

console.log('== 12. rótulos por modo ==');
{
  // vs CPU: eu = VOCÊ, oponente = CPU; banner traduz o texto neutro do motor
  w.eval("vsCPU=true; IA_LADO=1"); batalha(0); w.eval("st.ativo=0; render()");
  const aliado = $('.player:not(.player--enemy) .player__name')?.textContent.trim();
  const inimigo = $('.player--enemy .player__name')?.textContent.trim();
  ok(aliado === 'VOCÊ', 'placa aliada = VOCÊ (veio ' + aliado + ')');
  ok(inimigo === 'CPU', 'placa inimiga = CPU (veio ' + inimigo + ')');
  ok(!!$('.player--enemy .nrgmini'), 'energia do oponente aparece como mini-pips na placa dele');
  // st.fim é EVENTO estruturado (docs/eventos.md); o narrador resolve lado -> rótulo por modo.
  w.eval("st.fim={tipo:'fim',resultado:'vitoria',lado:1}; render()");
  ok($('.result h1').textContent.trim() === 'CPU VENCE', 'banner traduz lado 1 → CPU (veio ' + $('.result h1').textContent.trim() + ')');
  // hot-seat: numeração neutra
  w.eval("vsCPU=false"); batalha(0); w.eval("st.ativo=0; render()");
  const a2 = $('.player:not(.player--enemy) .player__name')?.textContent.trim();
  ok(a2 === 'JOGADOR 1', 'hot-seat mantém JOGADOR 1 (veio ' + a2 + ')');
  w.eval("st.fim={tipo:'fim',resultado:'vitoria',lado:1}; render()");
  ok($('.result h1').textContent.trim() === 'JOGADOR 2 VENCE', 'hot-seat: lado 1 → JOGADOR 2 (numeração neutra)');
  console.log('  vs CPU: VOCÊ/CPU + banner traduzido · hot-seat: JOGADOR N');
}

w.close();
console.log('');
console.log(f === 0 ? '>>> PERSPECTIVA OK' : `>>> ${f} FALHA(S)`);
process.exit(f ? 1 : 0);
