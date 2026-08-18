// Fluxo de turno + relógio + ação: o CONTROLADOR de batalha. NÃO é ui — não gera
// HTML nem referencia nenhum módulo de ui/. Recebe do orquestrador, por injeção
// (configurarTurno), o redesenho e o predicado "estou em batalha?", para não
// apontar para cima (view/rotas). Camada: engine -> turno -> ui/base -> ui/*.
// A guarda st.fim mora aqui: com a partida encerrada, o relógio não conta e a IA
// não age (o resultado aparece com a rota ainda em 'batalha').
const TURNO_SEG = 60;
let relogio = TURNO_SEG, tick = null;
let vsCPU = true, IA_LADO = 1, iaAtiva = false;   // Jogador 2 controlado pela IA (modo vs CPU)
const cpuControla = lado => vsCPU && lado === IA_LADO;

// ---- perspectiva e modo de partida (F0.7) ----
// O lado EXIBIDO à esquerda (com os discos) é PERSPECTIVA, não turno. Em hot-seat os
// dois humanos dividem a tela, então acompanha st.ativo (a tela inverte, como sempre);
// contra a CPU é fixo no humano (o processo da CPU fica oculto no turno dela).
// online (Fase 5) fixaria no lado da conexão. Um lugar só — ninguém decide isso por ifs.
function modoPartida() { return vsCPU ? 'cpu' : 'hotseat'; }   // 'online' entra na Fase 5
function ladoExibido() { return vsCPU ? (1 - IA_LADO) : st.ativo; }
function ehMeuTurno() { return st.ativo === ladoExibido(); }

// resumo do turno do oponente (F0.7): quando o controle volta para mim, guardo as
// linhas de log do turno dele (dado cru; a visão formata). Marco o log ao começar o
// turno da CPU. Só existe quando NÃO é hot-seat (lá eu vejo tudo acontecer).
let resumoTurno = null, _marcaLog = 0;

// injeção do orquestrador (para não apontar para cima: turno < ui/base). _rotulo
// formata o nome do lado por modo — a regra (Você/CPU/Jogador N) mora em ui/base.
let _redesenhar = () => {}, _emBatalha = () => false, _rotulo = l => 'JOGADOR ' + (l + 1);
function configurarTurno(deps) {
  if (deps.redesenhar) _redesenhar = deps.redesenhar;
  if (deps.emBatalha) _emBatalha = deps.emBatalha;
  if (deps.rotulo) _rotulo = deps.rotulo;
}

// um segundo do relógio. Nomeada (não closure anônima) para ser testável: com a
// partida encerrada (st.fim) ou fora da batalha, sai ANTES de contar ou encerrar.
// NÃO pausa por sobreposição — pausar seria explorável.
function tique() {
  if (!_emBatalha() || st.fim) { return; }
  relogio--;
  if (relogio <= 0) { encerrarTurno(); return; }
  const t = stage.querySelector('.timer'); const f = stage.querySelector('.timer__fill');
  const lb = stage.querySelector('.timer__label');
  if (f) f.style.width = Math.round(relogio / TURNO_SEG * 100) + '%';
  if (t) t.classList.toggle('low', relogio <= 10);
  if (lb) lb.textContent = `TURNO ${st.turno}${st.turno >= 30 ? '/40' : ''} · ${_rotulo(st.ativo)} · 0:${String(relogio).padStart(2, '0')}`;
}
function iniciarRelogio() {
  relogio = TURNO_SEG;
  if (tick) clearInterval(tick);
  tick = setInterval(tique, 1000);
}
function pararRelogio() { if (tick) { clearInterval(tick); tick = null; } }

function encerrarTurno(forcar) {
  if (!forcar && cpuControla(st.ativo)) return;   // o humano não encerra o turno da CPU
  // energia livre é escolhida no FIM do turno: se há dívida, abre a alocação primeiro
  const l = st.lados[st.ativo];
  if (!forcar && (l.dividaLivre || 0) > 0 && ov !== 'livre') {
    ov = 'livre'; livrePlano = {}; armado = null; alvos = []; escolhidos = []; detalhe = null; menuAberto = false; _redesenhar(); return;
  }
  fimTurno(st); armado = null; alvos = []; escolhidos = []; detalhe = null; abaFoe = null; convAlvo = null;
  ov = null; livrePlano = {}; menuAberto = false;
  relogio = TURNO_SEG; _redesenhar();
}

// ---- IA do oponente ----
function talvezIA() {
  if (iaAtiva || !_emBatalha() || st.fim || !cpuControla(st.ativo)) return;
  iaAtiva = true; _marcaLog = st.log.length; resumoTurno = null;   // marca o início do turno dele p/ o resumo
  setTimeout(passoIA, 600);
}
function passoIA() {
  if (!_emBatalha() || st.fim || !cpuControla(st.ativo)) { iaAtiva = false; return; }
  const a = iaProximaAcao(st);
  if (a) { agir(st, a.uid, a.slot, a.alvos, a.escolhas); armado = null; alvos = []; escolhidos = []; detalhe = null; _redesenhar(); setTimeout(passoIA, 750); }
  else {
    iaAtiva = false;
    // guarda o que ele fez (dado cru do log); a visão formata no painel de detalhe
    resumoTurno = st.log.slice(_marcaLog);
    encerrarTurno(true);
  }
}

// ---- ação: armar / escolher alvo / confirmar ----
function armar(uid, slot) {
  if (cpuControla(st.ativo)) return;   // sem input humano no turno da CPU
  detalhe = null; menuAberto = false; resumoTurno = null;   // 1º toque some com o resumo
  if (armado && armado.uid === uid && armado.slot === slot) { armado = null; alvos = []; escolhidos = []; _redesenhar(); return; }
  const u = st.lados[st.ativo].units.find(x => x.uid === uid);
  const a = acoesDe(st, u).find(x => x.slot === slot);
  if (!a || !a.disponivel || !podeAgir(u)) return;
  escolhidos = [];
  armado = { uid, slot, passos: (a.passos || []).slice() };
  // MULTI-GOLPE DISTRIBUÍDO (§92, Forma A): o jogador escolhe um SUBCONJUNTO e confirma; o motor reparte igual.
  // DEGENERADO: com 1 inimigo válido não há o que repartir — cai no fluxo normal de alvo único (toque = resolve).
  // Só com 2+ vira modo distribui (toggle, sem auto-confirmar). Ver §92 e o teste de transição do degenerado.
  if (a.alvo === 'distribui' && alvosValidos(st, u, a, 0, []).length > 1) { armado.distribui = true; armado.passos = []; }
  atualizarAlvos();
  _redesenhar();
}
// candidatos do passo atual; se o passo ficou sem ninguém, encurta a exigência
function atualizarAlvos() {
  alvos = [];
  if (!armado) return;
  const u = st.lados[st.ativo].units.find(x => x.uid === armado.uid);
  if (!u) return;
  const a = acoesDe(st, u).find(x => x.slot === armado.slot);
  if (!a) return;
  // distribui: a piscina é SEMPRE todos os inimigos válidos (a UI realça os já escolhidos); não encurta por passo.
  if (armado.distribui) { alvos = alvosValidos(st, u, a, 0, []); return; }
  const i = escolhidos.length;
  if (i >= armado.passos.length) return;
  const c = alvosValidos(st, u, a, i, escolhidos);
  if (!c.length) { armado.passos = armado.passos.slice(0, i); return; }
  alvos = c;
}
// distribui: falta = 1 até haver ≥1 selecionado (mantém o CONFIRMAR escondido com zero alvos), depois 0.
function faltamAlvos() { return armado ? (armado.distribui ? (escolhidos.length ? 0 : 1) : armado.passos.length - escolhidos.length) : 0; }
function alvo(uid) {
  if (!armado) return;
  // distribui: TOGGLE, nunca auto-confirma — o gasto só acontece no CONFIRMAR explícito (invariante 13).
  if (armado.distribui) {
    if (!alvos.some(x => x.uid === uid)) return;
    const j = escolhidos.indexOf(uid);
    if (j >= 0) escolhidos.splice(j, 1); else escolhidos.push(uid);
    _redesenhar();
    return;
  }
  if (faltamAlvos() <= 0) return;
  if (!alvos.some(x => x.uid === uid)) return;
  escolhidos.push(uid);
  atualizarAlvos();
  if (faltamAlvos() <= 0) confirmar(); else _redesenhar();
}
function confirmar() {
  if (!armado) return;
  if (armado.distribui && escolhidos.length === 0) return;   // sem alvo escolhido, nada a repartir — não gasta
  const u = st.lados[st.ativo].units.find(x => x.uid === armado.uid);
  const a = acoesDe(st, u).find(x => x.slot === armado.slot);
  if (!a || !a.disponivel) { armado = null; alvos = []; escolhidos = []; _redesenhar(); return; }
  const r = agir(st, armado.uid, a.slot, [...escolhidos]);
  if (!r.ok) st.log.push({ turno: st.turno, msg: '✗ ' + r.erro });
  armado = null; alvos = []; escolhidos = []; detalhe = null; _redesenhar();
}

if (typeof module !== 'undefined') module.exports = { configurarTurno, iniciarRelogio, pararRelogio, tique, encerrarTurno, talvezIA, passoIA, armar, atualizarAlvos, alvo, faltamAlvos, confirmar, cpuControla, modoPartida, ladoExibido, ehMeuTurno };
