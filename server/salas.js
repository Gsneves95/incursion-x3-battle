// server/salas.js — a PARTIDA PERTENCE À CONTA, não à conexão (§224). No PvP (F5.3) uma partida tem
// DOIS participantes (uma conta por lado); no PvE, um. O registro mapeia CADA conta participante para
// a MESMA sala, então a reconexão (conexão nova com o mesmo token) reencontra a partida de qualquer lado.
//
// O RELÓGIO corre no servidor, independente de conexão (§224). Ao estourar, aplica a regra (turno
// passa; 3 ociosos = abandono daquele lado) e EMPURRA para TODOS os participantes conectados; quem
// estiver caído recebe o estado atualizado ao retomar. Cada participante recebe o snapshot do SEU
// ponto de vista (fim/lado dele) e o SEU `desdeLog` (o que perdeu na ausência).
const partidaCtrl = require('./partida.js');
const proto = require('./protocol.js');
const contas = require('./contas.js');
const telemetria = require('./telemetria.js');
const missoes = require('./missoes.js');

const _porConta = new Map();   // contaId -> sala (compartilhada pelos participantes)
const _todas = new Set();

function de(contaId) { return _porConta.get(contaId) || null; }
function existe(contaId) { return _porConta.has(contaId); }
function ladoDe(sala, contaId) { return sala.participantes.findIndex(p => p.contaId === contaId); }

function _registrar(sala) { _todas.add(sala); for (const p of sala.participantes) _porConta.set(p.contaId, sala); _armar(sala); return sala; }

// PvE: uma conta, o oponente é a IA do servidor.
function criar(contaId, pergaminho, opts = {}) {
  encerrar(contaId);
  const P = partidaCtrl.criar(pergaminho, { limiteMs: opts.limiteMs, agora: Date.now() });
  return _registrar({ P, modo: 'pve', participantes: [{ contaId, ws: opts.ws || null, ultimoLogVisto: 0 }], timer: null });
}
// PvP: duas contas, uma por lado. a/b = { contaId, ws, time }. seed/comeca escolhidos pelo servidor (justo).
// ranqueado: a partida vale pontos (aplicados UMA vez no fim, pelo servidor — o cliente nunca soma).
function criarPvP(a, b, opts = {}) {
  encerrar(a.contaId); encerrar(b.contaId);
  const P = partidaCtrl.criarPvP(a.time, b.time, { seed: opts.seed, comeca: opts.comeca, limiteMs: opts.limiteMs, agora: Date.now() });
  return _registrar({ P, modo: 'pvp', ranqueado: !!opts.ranqueado, pontuado: false, registrado: false, resultado: null,
    time0: a.time.slice(), time1: b.time.slice(),   // os times ESCOLHIDOS (a telemetria mede a escolha do jogador)
    participantes: [
      { contaId: a.contaId, ws: a.ws || null, ultimoLogVisto: 0 },
      { contaId: b.contaId, ws: b.ws || null, ultimoLogVisto: 0 },
    ], timer: null });
}

// FINALIZAR uma partida no fim (idempotente): TELEMETRIA (§22, toda partida PvP) + PONTOS (§226, só
// ranqueado). Chamado de vários pontos (após jogar/encerrar e no estouro do relógio); os flags
// `registrado`/`pontuado` garantem uma vez só. O vencedor é st.fim.lado (o servidor sabe, não o cliente).
function finalizarPartida(sala) {
  if (!sala || !sala.P.st.fim) return null;
  const venc = (sala.P.st.fim.lado === 0 || sala.P.st.fim.lado === 1) ? sala.P.st.fim.lado : null;
  // TELEMETRIA: toda partida PvP, uma vez. Agregado, SEM jogador (só os deuses/turnos/abandono).
  if (sala.modo === 'pvp' && !sala.registrado) {
    sala.registrado = true;
    telemetria.partida({ time0: sala.time0, time1: sala.time1, vencedor: venc, turnos: sala.P.st.turno, abandono: sala.P.st.fim.motivo === 'abandono' });
    // MISSÕES (§228): contador de progressão, SÓ PvP, lido do st autoritativo. A ÚNICA porta — o
    // cliente não manda progresso. Idempotente pelo mesmo flag `registrado` (uma vez por partida).
    missoes.registrarPvP(sala);
  }
  // PONTOS: só ranqueado, uma vez. Abandono chega como derrota do abandonador — o cliente não influencia.
  if (!sala.ranqueado || sala.pontuado) return sala.resultado;
  sala.pontuado = true;
  if (venc === null) return null;   // empate técnico (turno 40): sem pontos
  const idVenc = sala.participantes[venc].contaId, idPerd = sala.participantes[1 - venc].contaId;
  const r = contas.aplicarResultadoRanqueado(idVenc, idPerd, sala.P.st.fim.motivo || null);
  sala.resultado = r && r.ok ? r : null;
  return sala.resultado;
}

function _part(sala, contaId) { return sala.participantes.find(p => p.contaId === contaId); }
function anexar(contaId, ws) { const s = _porConta.get(contaId); if (s) { const p = _part(s, contaId); if (p) p.ws = ws; } return s || null; }
function desanexar(contaId, ws) { const s = _porConta.get(contaId); if (s) { const p = _part(s, contaId); if (p && p.ws === ws) p.ws = null; } }   // só desanexa; o relógio SEGUE
function encerrar(contaId) { const s = _porConta.get(contaId); if (s) { if (s.timer) clearTimeout(s.timer); for (const p of s.participantes) _porConta.delete(p.contaId); _todas.delete(s); } }

// snapshot para UM participante: o estado do PONTO DE VISTA do lado dele + `desdeLog` (o que perdeu).
function snapshotPara(sala, contaId, extra) {
  const lado = ladoDe(sala, contaId); const p = sala.participantes[lado] || sala.participantes[0];
  const snap = partidaCtrl.estado(sala.P, Date.now(), lado < 0 ? 0 : lado);
  const desdeLog = p.ultimoLogVisto;
  p.ultimoLogVisto = sala.P.st.log.length;
  // F5.5: se a partida ranqueada foi pontuada, anexa a MUDANÇA DE RANQUE deste jogador (o servidor
  // computou; o cliente só desenha "subiu para Herói, +25"). Nunca o cliente calcula.
  if (sala.resultado) {
    const meu = (sala.resultado.vencedor.id === contaId) ? sala.resultado.vencedor : (sala.resultado.perdedor.id === contaId ? sala.resultado.perdedor : null);
    if (meu) snap.ranqueadoResultado = Object.assign({ venceu: sala.resultado.vencedor.id === contaId, motivo: sala.resultado.motivo }, meu);
  }
  return Object.assign(snap, { desdeLog }, extra || {});
}
// snapshot "genérico" (participante 0) — usado onde só há um lado (PvE) ou para o próprio remetente.
function snapshot(sala, extra) { return snapshotPara(sala, sala.participantes[0].contaId, extra); }

// EMPURRA o estado para todos os participantes conectados (cada um do seu ponto de vista).
function empurrarTodos(sala, flags) {
  for (const p of sala.participantes) {
    if (!p.ws || p.ws.readyState !== 1) continue;
    try { p.ws.send(JSON.stringify(proto.envelope('partida', Object.assign(snapshotPara(sala, p.contaId), flags || {})))); } catch (e) { /* socket morto: o estado fica guardado */ }
  }
}
// empurra para o OUTRO participante (o oponente do remetente) — usado quando um lado joga e o outro precisa ver.
function empurrarOutro(sala, contaIdRemetente, flags) {
  for (const p of sala.participantes) {
    if (p.contaId === contaIdRemetente) continue;
    if (!p.ws || p.ws.readyState !== 1) continue;
    try { p.ws.send(JSON.stringify(proto.envelope('partida', Object.assign(snapshotPara(sala, p.contaId), flags || {})))); } catch (e) {}
  }
}

// o RELÓGIO do servidor: corre para o lado ATIVO, independente de conexão.
function _armar(sala) {
  if (sala.timer) { clearTimeout(sala.timer); sala.timer = null; }
  const P = sala.P;
  if (!P || P.st.fim) return;
  const ms = Math.max(0, P.deadline - Date.now());
  sala.timer = setTimeout(() => {
    sala.timer = null;
    if (!P || P.st.fim) return;
    const r = partidaCtrl.estourarTempo(P, { agora: Date.now() });
    if (P.st.fim) finalizarPartida(sala);   // abandono/fim pelo relógio: pontua ANTES de empurrar (o push leva a mudança de ranque)
    empurrarTodos(sala, { push: true, autopassou: !!r.autopassou, abandono: !!r.abandono, cpuOps: r.cpuOps || [] });
    _armar(sala);
  }, ms);
}
function rearmar(contaId) { const s = _porConta.get(contaId); if (s) _armar(s); }
function pararRelogio(contaId) { const s = _porConta.get(contaId); if (s && s.timer) { clearTimeout(s.timer); s.timer = null; } }

function _limparTudo() { for (const s of [..._todas]) if (s.participantes[0]) encerrar(s.participantes[0].contaId); }

module.exports = {
  de, existe, ladoDe, criar, criarPvP, anexar, desanexar, encerrar, finalizarPartida,
  snapshot, snapshotPara, empurrarTodos, empurrarOutro, rearmar, pararRelogio, _limparTudo, _porConta,
};
