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
function criarPvP(a, b, opts = {}) {
  encerrar(a.contaId); encerrar(b.contaId);
  const P = partidaCtrl.criarPvP(a.time, b.time, { seed: opts.seed, comeca: opts.comeca, limiteMs: opts.limiteMs, agora: Date.now() });
  return _registrar({ P, modo: 'pvp', participantes: [
    { contaId: a.contaId, ws: a.ws || null, ultimoLogVisto: 0 },
    { contaId: b.contaId, ws: b.ws || null, ultimoLogVisto: 0 },
  ], timer: null });
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
    empurrarTodos(sala, { push: true, autopassou: !!r.autopassou, abandono: !!r.abandono, cpuOps: r.cpuOps || [] });
    _armar(sala);
  }, ms);
}
function rearmar(contaId) { const s = _porConta.get(contaId); if (s) _armar(s); }
function pararRelogio(contaId) { const s = _porConta.get(contaId); if (s && s.timer) { clearTimeout(s.timer); s.timer = null; } }

function _limparTudo() { for (const s of [..._todas]) if (s.participantes[0]) encerrar(s.participantes[0].contaId); }

module.exports = {
  de, existe, ladoDe, criar, criarPvP, anexar, desanexar, encerrar,
  snapshot, snapshotPara, empurrarTodos, empurrarOutro, rearmar, pararRelogio, _limparTudo, _porConta,
};
