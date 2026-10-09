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
// gods desenhados no LADO aliado (esquerda) — §329: retratos .bt-portrait--ally, cada um com o slot god-<key>
const aliados = () => $$('.bt-portrait--ally [data-slot^="god-"]').map(e => e.dataset.slot.replace('god-', ''));
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
  // §329: no turno do oponente as 12 habilidades do jogador ficam APAGADAS e NÃO respondem (data-dead=1),
  // nenhuma ARMA (data-arma=0) e a leitura do kit (inclusive do oponente) é pela caixa de minis (data-look).
  ok($$('.bt-skill[data-arma="1"]').length === 0, 'nenhuma habilidade minha ARMA no turno dele');
  ok($$('.bt-skill[data-dead="1"]').length === 12, 'todas as minhas 12 habilidades ficam mortas (não respondem) no turno dele');
  ok($$('.bt-skill.is-armed').length === 0, 'nenhuma habilidade armada');
  ok(!w.eval('detalhe'), 'nenhuma consulta de kit aberta por conta própria');
  ok($$('.bt-portrait.is-target').length === 0, 'nenhum alvo pulsando');
  // §330: o ENCERRAR TURNO é o botão .bt-encerrar (#bend2); no turno dele ele desabilita e vira "TURNO DO OPONENTE…".
  const estado = $('#bend2');
  ok(!!estado && estado.disabled && /oponente|aguarde/i.test(estado.textContent), 'o botão de encerrar vira indicador de espera (desabilitado) no turno dele');
  console.log('  habilidades mortas (não respondem), nenhuma arma, sem alvo, encerrar = espera');
}

console.log('== 10. hot-seat: comportamento antigo (tela inverte) ==');
{
  w.eval("vsCPU=false"); batalha(0);
  w.eval("st.ativo=0; render()"); const a0 = aliados();
  w.eval("st.ativo=1; render()"); const a1 = aliados();
  ok(MEU.every(k => a0.includes(k)), 'ativo 0 → time 0 à esquerda');
  ok(OPO.every(k => a1.includes(k)), 'ativo 1 → time 1 à esquerda (inverteu)');
  // em hot-seat o lado da vez é sempre "eu" (sem espectador): dá energia ao lado ativo e as habilidades ARMAM.
  w.eval("st.ativo=0; ELEMS.forEach(e=>st.lados[0].orbs[e]=6); render()");
  ok($$('.bt-skill[data-arma="1"]').length > 0, 'em hot-seat as habilidades do lado ativo ARMAM (sem espectador)');
  console.log('  hot-seat inverte a tela e nunca entra em espectador');
}

console.log('== 11. resumo do turno: aparece ao voltar, some ao 1º toque ==');
{
  w.eval("vsCPU=true; IA_LADO=1"); batalha(0); w.eval("st.ativo=0");
  w.eval("resumoTurno=[{turno:1,msg:'Sobek ataca Zeus: 12 de dano'}]; render()");
  // §329: o resumo do turno aparece no PAINEL de baixo (título "RESUMO · …"), não mais num rodapé separado.
  ok(!!$('.bt-panel__titulo') && /RESUMO/.test($('.bt-panel__titulo').textContent), 'o resumo aparece no painel de baixo ao voltar para o meu turno');
  w.eval("stage.dispatchEvent(new Event('pointerdown')); render();");
  ok(!($('.bt-panel__titulo') && /RESUMO/.test($('.bt-panel__titulo').textContent)), 'o resumo some após o 1º toque');
  console.log('  resumo mostrado e dispensado no toque');
}

console.log('== 12. rótulos de time por modo (§329: placas sumiram — os NOMES vivem no topo, .bt-name__nick) ==');
{
  // §329: as placas .teamlbl sobre as colunas sumiram; os NOMES moram no topo — jogador .bt-name--me,
  // oponente .bt-name--foe. vs CPU: eu = Você, oponente = CPU; o banner de fim traduz o lado neutro do motor.
  w.eval("vsCPU=true; IA_LADO=1"); batalha(0); w.eval("st.ativo=0; render()");
  const aliado = $('.bt-name--me .bt-name__nick')?.textContent.trim();
  const inimigo = $('.bt-name--foe .bt-name__nick')?.textContent.trim();
  ok(aliado === 'Você', 'nome do jogador no topo = Você (veio ' + aliado + ')');
  ok(inimigo === 'CPU', 'nome do oponente no topo = CPU (veio ' + inimigo + ')');
  // st.fim é EVENTO estruturado (docs/eventos.md); o narrador resolve lado -> rótulo por modo.
  w.eval("st.fim={tipo:'fim',resultado:'vitoria',lado:1}; render()");
  ok($('.result h1').textContent.trim() === 'CPU VENCE', 'banner traduz lado 1 → CPU (veio ' + $('.result h1').textContent.trim() + ')');
  // hot-seat: o nome do jogador da vez é sempre VOCÊ; o oponente é numerado.
  w.eval("vsCPU=false"); batalha(0); w.eval("st.ativo=0; render()");
  ok($('.bt-name--me .bt-name__nick')?.textContent.trim() === 'Você', 'hot-seat: o nome da vez é sempre VOCÊ');
  ok($('.bt-name--foe .bt-name__nick')?.textContent.trim() === 'Jogador 2', 'hot-seat: o oponente é Jogador 2');
  w.eval("st.fim={tipo:'fim',resultado:'vitoria',lado:1}; render()");
  ok($('.result h1').textContent.trim() === 'JOGADOR 2 VENCE', 'hot-seat: lado 1 → JOGADOR 2 (numeração neutra)');
  console.log('  vs CPU: Você/CPU + banner traduzido · hot-seat: Você/Jogador 2');
}

console.log('== 13. §329: a MINHA energia aparece no topo (contadores de leitura) e o oponente é nomeado do lado dele ==');
{
  w.eval("vsCPU=true; IA_LADO=1"); batalha(0); w.eval("st.ativo=0");
  w.eval("ELEMS.forEach(e=>{st.lados[0].orbs[e]=2; st.lados[1].orbs[e]=2;}); render()");
  // §330: os contadores de energia (leitura) do MEU lado vivem na caixa do topo, em .bt-ebox > .bt-ec (orbe + ×N).
  ok($$('.bt-ebox .bt-ec').length >= 1, 'os meus contadores de energia aparecem no topo');
  ok(/×2/.test($('.bt-ebox').textContent), 'os contadores mostram a quantidade (×N) por elemento');
  // §329: obsoleto — a energia do OPONENTE não é mais exibida em separado no topo (§215 refeito), e não há
  // mais pílulas [data-conv] na barra: a conversão passou a ser pelo botão ⇄ Trocar (abre a sobreposição conv).
  ok($$('[data-conv]').length === 0, 'não há mais pílulas [data-conv] no topo');
  ok(!!$('.bt-trocar'), 'a conversão de energia é pelo botão ⇄ Trocar (#btrocar)');
  // o oponente é NOMEADO no topo, do lado dele (nome no lugar da antiga placa de time)
  ok(/CPU/.test($('.bt-name--foe .bt-name__nick').textContent), 'o topo nomeia o oponente (CPU) do lado dele');
  console.log('  minha energia no topo (×N) · oponente nomeado à direita · conversão pelo botão Trocar');
}

w.close();
console.log('');
console.log(f === 0 ? '>>> PERSPECTIVA OK' : `>>> ${f} FALHA(S)`);
process.exit(f ? 1 : 0);
