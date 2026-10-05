// src/replay_cliente.js — §318 F2 E2 (cliente): a economia de PvE é do SERVIDOR. O cliente NÃO credita
// recompensa de PvE. Ele GRAVA a partida — a montagem do modo (o servidor reconstrói a dificuldade do
// DADO, então mandamos só o que o modo precisa: id/params + o time do jogador) e as AÇÕES DO JOGADOR na
// ordem — e, ao vencer, ENVIA. O servidor RE-SIMULA no motor determinístico e credita só se bater; devolve
// o saldo autoritativo, que a UI passa a mostrar.
//
// FILA OFFLINE (cap 20): sem conexão, o replay fica guardado; ao reconectar, esvazia. NUNCA há crédito
// local (nem provisório): o número que o jogador vê vem do servidor. Dedupe por idPartida (o servidor
// credita 1× mesmo com reenvio da fila).
const REPLAY_CAP_FILA = 20;
const REPLAY_CHAVE = 'incursion:pve:fila';
let _repRec = null;              // gravação em curso: { desc, ops }
let _repFila = _repCarregar();  // replays pendentes de envio/confirmação
let _repTx = null, _repToken = null, _repAoCreditar = null;   // wiring injetado pela view

function _repCarregar() { try { const s = (typeof localStorage !== 'undefined') && localStorage.getItem(REPLAY_CHAVE); return s ? JSON.parse(s) : []; } catch (e) { return []; } }
function _repPersistir() { try { if (typeof localStorage !== 'undefined') localStorage.setItem(REPLAY_CHAVE, JSON.stringify(_repFila)); } catch (e) {} }
function _repNovoId() { return 'r' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }

// view.js injeta o transporte de conta + token + o callback que aplica o saldo autoritativo.
function _repConfigurar(o) { o = o || {}; if ('transporte' in o) _repTx = o.transporte; if ('token' in o) _repToken = o.token; if ('aoCreditar' in o) _repAoCreditar = o.aoCreditar; if (_repTx && _repToken) _repEnviarPendentes(); }
function _repDefinirToken(t) { _repToken = t; if (_repTx && _repToken) _repEnviarPendentes(); }

function _repIniciar(desc) { _repRec = { desc: desc || {}, ops: [] }; }   // começa a gravar (modo de recompensa)
function _repGravando() { return !!_repRec; }
function _repGravarOp(op) { if (_repRec && op) _repRec.ops.push(op); }
function _repDescartar() { _repRec = null; }                              // partida que não é de recompensa / abandonada

// finaliza a gravação (só chame quando VENCEU) com os parâmetros finais do modo; enfileira e tenta enviar.
function _repConcluir(extra) {
  if (!_repRec) return null;
  // §322: carimba a VERSÃO da IA que o cliente rodou NESTA batalha (P3: vem do MODO, via turno). O servidor
  // re-simula com esta versão; replays sem iaVer (pré-§322, inclusive fila offline) caem na v1 no servidor.
  const iaVer = (typeof iaVersaoBatalhaAtual === 'function') ? iaVersaoBatalhaAtual()
    : (typeof IA_VERSAO_JOGO !== 'undefined' ? IA_VERSAO_JOGO : 1);
  const replay = Object.assign({}, _repRec.desc, extra || {}, { ops: _repRec.ops, iaVer, idPartida: _repNovoId() });
  _repRec = null;
  _repEnfileirar(replay);
  _repEnviarPendentes();
  return replay;
}
function _repEnfileirar(replay) { _repFila.push(replay); while (_repFila.length > REPLAY_CAP_FILA) _repFila.shift(); _repPersistir(); }
function _repFilaLista() { return _repFila.slice(); }

// envia TODO o pendente num lote; ao confirmar, remove os enviados (por idPartida) e aplica o saldo.
function _repEnviarPendentes() {
  if (!_repTx || !_repToken || !_repFila.length) return;
  const enviados = _repFila.slice();
  let p;
  try { p = _repTx.pedir({ v: 1, tipo: 'pveResultado', token: _repToken, replays: enviados }); } catch (e) { return; }
  if (!p || typeof p.then !== 'function') return;
  p.then((r) => {
    if (!r || r.tipo !== 'pveCreditado') return;
    const ids = {}; for (const x of enviados) ids[x.idPartida] = true;
    _repFila = _repFila.filter(x => !ids[x.idPartida]); _repPersistir();
    if (typeof _repAoCreditar === 'function') _repAoCreditar(r);
  }).catch(() => {});
}

// Handle de NAMESPACE para o resto do bundle (como PARTIDA_CLI). A view/turno/home chamam REPLAY.*.
const REPLAY = {
  configurar: _repConfigurar, definirToken: _repDefinirToken,
  iniciar: _repIniciar, gravando: _repGravando, gravarOp: _repGravarOp, descartar: _repDescartar,
  concluir: _repConcluir, enfileirar: _repEnfileirar, fila: _repFilaLista, enviarPendentes: _repEnviarPendentes,
};

if (typeof module !== 'undefined') module.exports = REPLAY;
