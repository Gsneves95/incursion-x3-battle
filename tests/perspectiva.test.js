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
// gods desenhados na COLUNA aliada (esquerda) — §214: cada fileira tem .brow__ally
const aliados = () => $$('.brow__ally [data-slot^="god-"]').map(e => e.dataset.slot.replace('god-', ''));
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
  // §238: os discos ficam TOCÁVEIS para LER (nunca custa), mas nenhum ARMA no turno dele (data-arma=0),
  // e todos entram em RECUO (a unidade não é a vez).
  ok($$('.brow__tiles .skill[data-arma="1"]').length === 0, 'nenhum disco meu ARMA no turno dele');
  ok($$('.brow__tiles .skill.nv-recuo').length === 12, 'todos os meus discos ficam em recuo no turno dele');
  ok($$('.skill.is-armed').length === 0, 'nenhum disco armado');
  ok(!$('.panel .kstrip'), 'nenhuma consulta de kit aberta por conta própria');
  ok($$('.portrait.is-target').length === 0, 'nenhum alvo pulsando');
  ok(!$('#bend') && !!$('.endturn--wait'), 'botão primário vira indicador de espera');
  console.log('  discos em recuo (legíveis), nenhum arma, sem alvo, primário = espera');
}

console.log('== 10. hot-seat: comportamento antigo (tela inverte) ==');
{
  w.eval("vsCPU=false"); batalha(0);
  w.eval("st.ativo=0; render()"); const a0 = aliados();
  w.eval("st.ativo=1; render()"); const a1 = aliados();
  ok(MEU.every(k => a0.includes(k)), 'ativo 0 → time 0 à esquerda');
  ok(OPO.every(k => a1.includes(k)), 'ativo 1 → time 1 à esquerda (inverteu)');
  ok($$('.brow__tiles .skill[data-arma="1"]').length > 0, 'em hot-seat os discos do lado ativo ARMAM (sem espectador)');
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

console.log('== 12. rótulos de time por modo (§214: placas VOCÊ/oponente sobre as colunas) ==');
{
  // §214 item 13: "VOCÊ" (ouro) sobre a coluna aliada, NOME do oponente (vermelho) sobre a dele.
  // vs CPU: aliada = Você, inimiga = CPU; o banner de fim traduz o lado neutro do motor.
  w.eval("vsCPU=true; IA_LADO=1"); batalha(0); w.eval("st.ativo=0; render()");
  const aliado = $('.teamlbl--ally')?.textContent.trim();
  const inimigo = $('.teamlbl--enemy')?.textContent.trim();
  ok(aliado === 'Você', 'placa aliada = Você (veio ' + aliado + ')');
  ok(inimigo === 'CPU', 'placa inimiga = CPU (veio ' + inimigo + ')');
  // st.fim é EVENTO estruturado (docs/eventos.md); o narrador resolve lado -> rótulo por modo.
  w.eval("st.fim={tipo:'fim',resultado:'vitoria',lado:1}; render()");
  ok($('.result h1').textContent.trim() === 'CPU VENCE', 'banner traduz lado 1 → CPU (veio ' + $('.result h1').textContent.trim() + ')');
  // hot-seat: a coluna aliada é sempre a do jogador da vez (VOCÊ); o oponente é numerado.
  w.eval("vsCPU=false"); batalha(0); w.eval("st.ativo=0; render()");
  ok($('.teamlbl--ally')?.textContent.trim() === 'Você', 'hot-seat: a coluna da vez é sempre VOCÊ');
  ok($('.teamlbl--enemy')?.textContent.trim() === 'Jogador 2', 'hot-seat: o oponente é Jogador 2');
  w.eval("st.fim={tipo:'fim',resultado:'vitoria',lado:1}; render()");
  ok($('.result h1').textContent.trim() === 'JOGADOR 2 VENCE', 'hot-seat: lado 1 → JOGADOR 2 (numeração neutra)');
  console.log('  vs CPU: Você/CPU + banner traduzido · hot-seat: Você/Jogador 2');
}

console.log('== 13. §215: a energia do OPONENTE aparece no topo (informação de jogo), do lado dele ==');
{
  w.eval("vsCPU=true; IA_LADO=1"); batalha(0); w.eval("st.ativo=0");
  // dá orbes aos dois lados e confere que os dois aparecem, cada um do seu lado
  w.eval("ELEMS.forEach(e=>{st.lados[0].orbs[e]=2; st.lados[1].orbs[e]=2;}); render()");
  ok($$('.energy--me .energy__pill').length >= 1, 'as minhas orbes aparecem à esquerda');
  ok($$('.energy--foe .energy__pill').length >= 1, 'a energia do OPONENTE aparece à direita (§215)');
  ok($$('.energy--foe .energy__pill--ro').length === $$('.energy--foe .energy__pill').length,
    'as orbes do oponente são leitura (não convertíveis)');
  ok($$('.energy--foe [data-conv]').length === 0, 'não dá para converter a energia do oponente');
  // o perfil do oponente nomeia CPU no topo, do lado dele
  ok(/CPU/.test($('.side--foe .prof__nick').textContent), 'o perfil direito nomeia o oponente (CPU)');
  console.log('  energia do oponente visível (leitura) · perfil dele à direita');
}

w.close();
console.log('');
console.log(f === 0 ? '>>> PERSPECTIVA OK' : `>>> ${f} FALHA(S)`);
process.exit(f ? 1 : 0);
