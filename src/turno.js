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
// F5.2 — MODO ONLINE (partida no SERVIDOR): o servidor valida cada ação, dirige a IA e é dono do
// fim e do relógio. `MP` = a partida-cliente (src/partida_cliente.js); `_transOnline` = o transporte.
// Enquanto MP existe, modoPartida()==='online' e os pontos de ação/relógio/IA desviam para o servidor.
let MP = null, _transOnline = null, _onlineOcupado = false, _tokenOnline = null;
function entrarModoOnline(mp, transporte, token) { MP = mp; _transOnline = transporte; _tokenOnline = token || null; st = MP.st; }
function sairModoOnline() { MP = null; _transOnline = null; _onlineOcupado = false; _tokenOnline = null; }
function ehOnline() { return !!MP; }
function ocupadoOnline() { return _onlineOcupado; }   // uma ação por vez está em voo ao servidor?
function fimOnline() { return MP ? MP.fim : null; }    // o fim declarado pelo SERVIDOR (ou null)
function avisosOnline() { return MP ? (MP.avisos || []) : []; }   // divergências/recusas/tempo (canal do cliente)

function modoPartida() { return MP ? 'online' : (vsCPU ? 'cpu' : 'hotseat'); }
function ladoExibido() { return MP ? MP.humano : (vsCPU ? (1 - IA_LADO) : st.ativo); }
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
  // ONLINE (F5.2): o relógio é do SERVIDOR. O cliente só DESENHA o que sobra (do deadline autoritativo)
  // e NÃO encerra o turno ao chegar a zero — quem faz isso é o push do servidor (auto-passa/abandono).
  if (MP) { relogio = Math.max(0, Math.ceil((MP.restanteMs || 0) / 1000)); pintarRelogio(); return; }
  relogio--;
  if (relogio <= 0) { encerrarTurno(); return; }
  pintarRelogio();
}
function pintarRelogio() {
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
  // ONLINE (F5.2): encerrar é um PEDIDO ao servidor — ele roda a IA do oponente e devolve o resultado
  // autoritativo (o cliente prevê e desenha na hora; o servidor confirma). Não roda fimTurno local.
  if (MP) return encerrarOnline();
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
  if (MP) return;   // ONLINE: a IA do oponente roda no SERVIDOR (o encerrar já trouxe/desenhou a jogada dela)
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
  if (MP) { if (st.ativo !== MP.humano || _onlineOcupado) return; }   // ONLINE: só no MEU turno (PvP: eu sou MP.humano)
  else if (cpuControla(st.ativo)) return;   // sem input humano no turno da CPU
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
  // ONLINE (F5.2): a ação vai ao SERVIDOR (otimista: aplica local e desenha; o servidor confirma).
  if (MP) return confirmarOnline({ uid: armado.uid, slot: a.slot, alvos: [...escolhidos] });
  const r = agir(st, armado.uid, a.slot, [...escolhidos]);
  if (!r.ok) st.log.push({ turno: st.turno, msg: '✗ ' + r.erro });
  else if (typeof prova !== 'undefined' && prova) provaLances++;   // F3.1: conta o lance do jogador (o placar) — só ação confirmada e válida
  armado = null; alvos = []; escolhidos = []; detalhe = null; _redesenhar();
}

// ---- pontes ONLINE (F5.2): confirmar/encerrar viram pedidos ao servidor; o cliente desenha ----
// A ação é OTIMISTA: PARTIDA_CLI.jogar aplica em MP.st (=st) na hora e o chamador redesenha; o
// servidor confirma e, se divergir, corrige (visível em MP.avisos). Uma ação por vez (trava _onlineOcupado).
function confirmarOnline(op) {
  armado = null; alvos = []; escolhidos = []; detalhe = null;
  if (st.ativo !== MP.humano) return;   // não é o meu turno (PvP): não age
  if (_onlineOcupado) return;   // uma ação por vez: espera a confirmação do servidor
  _onlineOcupado = true;
  PARTIDA_CLI.jogar(_transOnline, MP, op, { token: _tokenOnline }).then((r) => {
    _onlineOcupado = false;
    st = MP.st; _bannerRanqueTalvez();            // o servidor pode ter corrigido o estado
    if (r && r.ok && typeof prova !== 'undefined' && prova) provaLances++;
    _redesenhar();
  }).catch(() => { _onlineOcupado = false; _redesenhar(); });
  _redesenhar();                                  // desenho OTIMISTA imediato (já aplicado em MP.st)
}
function encerrarOnline() {
  if (st.ativo !== MP.humano || _onlineOcupado) return;   // só encerro o MEU turno (PvP)
  _onlineOcupado = true;
  armado = null; alvos = []; escolhidos = []; detalhe = null; ov = null; menuAberto = false;
  PARTIDA_CLI.encerrar(_transOnline, MP, { token: _tokenOnline }).then(() => {
    _onlineOcupado = false;
    st = MP.st; _bannerRanqueTalvez();            // já contém o turno do oponente (dirigido pelo servidor)
    relogio = TURNO_SEG; _redesenhar();
  }).catch(() => { _onlineOcupado = false; _redesenhar(); });
  _redesenhar();
}
// PUSH do servidor (relógio estourou / jogada do oponente no PvP): absorve e redesenha.
function receberPushOnline(msg) {
  if (!MP) return;
  PARTIDA_CLI.aplicarPush(MP, msg);
  st = MP.st; _bannerRanqueTalvez(); _redesenhar();
}
// F5.5: ao fim de uma partida RANQUEADA, mostra a mudança de faixa (o servidor computou; o cliente
// só desenha). Uma vez só. `montarBannerRanque` é global da view (guardado por typeof).
function _bannerRanqueTalvez() {
  if (MP && MP.fim && MP.ranqueadoResultado && !MP._banner && typeof montarBannerRanque === 'function') { MP._banner = true; montarBannerRanque(MP.ranqueadoResultado); }
}
function resultadoRanqueOnline() { return MP ? (MP.ranqueadoResultado || null) : null; }

if (typeof module !== 'undefined') module.exports = { configurarTurno, iniciarRelogio, pararRelogio, tique, encerrarTurno, talvezIA, passoIA, armar, atualizarAlvos, alvo, faltamAlvos, confirmar, cpuControla, modoPartida, ladoExibido, ehMeuTurno, entrarModoOnline, sairModoOnline, ehOnline, receberPushOnline, ocupadoOnline, fimOnline, avisosOnline, resultadoRanqueOnline, confirmarOnline, encerrarOnline };
