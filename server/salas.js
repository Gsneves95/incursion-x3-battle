// server/salas.js — F5.4: a PARTIDA PERTENCE À CONTA, não à conexão. É a decisão central da fase.
// No Android a WebView morre a cada troca de app — reconectar é o caminho NORMAL, não exceção. Uma
// conexão nova com o MESMO token retoma a partida em curso; sem isto, cada troca de app é uma derrota.
//
// O RELÓGIO NÃO PARA. A partida (e o seu relógio) vive no SERVIDOR, keyed pelo id da CONTA, e corre
// independente de haver conexão. Desconectar no seu turno gasta o seu tempo; a regra de abandono (3
// turnos ociosos, §223) é a regra de forfeit por queda. Não há janela de graça (relógio correndo é o
// que impede sair do app para pensar).
//
// GUARDA (provada em tests/reconexao.test.js): reconectar NUNCA dá vantagem. A retomada é LEITURA PURA
// — não avança turno, não zera relógio, não adianta recarga. O estado que volta é EXATAMENTE o que
// seria se o jogador nunca tivesse saído (a evolução da partida não olha para a conexão: `estourarTempo`
// só recebe a partida e o instante, nunca o socket).
const partidaCtrl = require('./partida.js');
const proto = require('./protocol.js');

const _salas = new Map();   // contaId -> { P, contaId, timer, ws, ultimoLogVisto }

function de(contaId) { return _salas.get(contaId) || null; }
function existe(contaId) { return _salas.has(contaId); }

// cria (ou SUBSTITUI) a partida da conta. Uma conta = uma partida ativa. Arma o relógio do servidor.
function criar(contaId, pergaminho, opts = {}) {
  encerrar(contaId);   // nova partida descarta a anterior da mesma conta
  const P = partidaCtrl.criar(pergaminho, { agora: Date.now(), limiteMs: opts.limiteMs });
  const sala = { P, contaId, timer: null, ws: opts.ws || null, ultimoLogVisto: 0 };
  _salas.set(contaId, sala);
  _armar(sala);
  return sala;
}

// anexa a conexão atual à sala da conta (na retomada). NÃO toca no estado nem no relógio: leitura pura.
function anexar(contaId, ws) { const s = _salas.get(contaId); if (s) s.ws = ws; return s || null; }
// a conexão caiu: SÓ desanexa (o relógio SEGUE correndo no servidor). Sem isto, o push tentaria um socket morto.
function desanexar(contaId, ws) { const s = _salas.get(contaId); if (s && s.ws === ws) s.ws = null; }

function encerrar(contaId) {
  const s = _salas.get(contaId);
  if (s) { if (s.timer) clearTimeout(s.timer); _salas.delete(contaId); }
}

// snapshot para o cliente, marcando ATÉ ONDE ele já viu o log (para a retomada dizer "o que mudou na
// sua ausência" sem replay animado — o painel §214 desenha o log; `desdeLog` marca o trecho perdido).
function snapshot(sala, extra) {
  const snap = partidaCtrl.estado(sala.P, Date.now());
  const desdeLog = sala.ultimoLogVisto;
  sala.ultimoLogVisto = sala.P.st.log.length;   // o que enviamos agora passa a ser "visto"
  return Object.assign(snap, { desdeLog }, extra || {});
}

// o RELÓGIO do servidor: corre independente de conexão. Ao estourar, aplica a regra (turno passa; 3
// ociosos = abandono) e, SE houver socket vivo, empurra; senão, o novo estado espera o retomar.
function _armar(sala) {
  if (sala.timer) { clearTimeout(sala.timer); sala.timer = null; }
  const P = sala.P;
  if (!P || P.fim || P.st.ativo !== P.humano) return;   // só corre no turno do humano
  const ms = Math.max(0, P.deadline - Date.now());
  sala.timer = setTimeout(() => {
    sala.timer = null;
    if (!P || P.fim) return;
    const r = partidaCtrl.estourarTempo(P, { agora: Date.now() });   // MESMA regra, conectado ou não
    _empurrar(sala, { autopassou: !!r.autopassou, abandono: !!r.abandono, cpuOps: r.cpuOps || [] });
    _armar(sala);   // rearma se voltou ao humano e não acabou
  }, ms);
}
function _empurrar(sala, flags) {
  if (!sala.ws || sala.ws.readyState !== 1) return;   // ninguém conectado: o estado espera o retorno
  try { sala.ws.send(JSON.stringify(proto.envelope('partida', Object.assign(snapshot(sala), { push: true }, flags || {})))); }
  catch (e) { /* socket morto entre a checagem e o send: o estado ainda está guardado na sala */ }
}

// rearma o relógio após uma jogada do dono da sala (jogar/encerrar mudaram o turno/deadline).
function rearmar(contaId) { const s = _salas.get(contaId); if (s) _armar(s); }
// para o relógio quando a partida acaba (mantém a sala para a retomada ver o resultado final).
function pararRelogio(contaId) { const s = _salas.get(contaId); if (s && s.timer) { clearTimeout(s.timer); s.timer = null; } }

// utilitário de teste/limpeza: encerra todas as salas (e seus timers).
function _limparTudo() { for (const id of [..._salas.keys()]) encerrar(id); }

module.exports = { de, existe, criar, anexar, desanexar, encerrar, snapshot, rearmar, pararRelogio, _limparTudo, _salas };
