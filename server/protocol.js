// server/protocol.js — F5.0: o PROTOCOLO nasce VERSIONADO.
// Toda mensagem leva `v` (versão) desde a primeira. Motivo: o app atualiza pelas LOJAS e o servidor
// atualiza quando o dono quer — então cliente velho vai falar com servidor novo. É o bug mais chato
// de diagnosticar depois; custa uma linha agora. Versão incompatível é RECUSA CLARA, nunca falha silenciosa.
const PROTOCOL_VERSION = 1;

function envelope(tipo, dados) { return Object.assign({ v: PROTOCOL_VERSION, tipo }, dados || {}); }

// checa a versão de uma mensagem RECEBIDA. Retorna {ok} ou {ok:false, erro, codigo} — o servidor
// responde com um 'recusado' explícito (o cliente sabe exatamente por quê, e pede update).
function checarVersao(msg) {
  if (!msg || typeof msg.v !== 'number') return { ok: false, codigo: 'sem_versao', erro: 'mensagem sem versão de protocolo' };
  if (msg.v !== PROTOCOL_VERSION) return {
    ok: false, codigo: 'versao_incompativel',
    erro: `versão de protocolo incompatível: cliente v${msg.v}, servidor v${PROTOCOL_VERSION} — atualize o aplicativo`,
  };
  return { ok: true };
}

module.exports = { PROTOCOL_VERSION, envelope, checarVersao };
