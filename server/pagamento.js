// server/pagamento.js — §370: o ÚNICO ponto de verificação de pagamento (compra) e de anúncio.
//
// HOJE (antes da loja de verdade): só aceita a confirmação SIMULADA, e SÓ quando a env LOJA_SIMULADA=1
// está no servidor. Sem ela, NADA é aceito — os endpoints respondem "pagamento indisponível". O segredo
// nunca entra em código: lemos process.env no momento da chamada (como o DATABASE_URL do §354).
//
// AMANHÃ (passo "antes da loja", ver docs/monetizacao.md): trocar SÓ o corpo de verificarCompra/
// verificarAnuncio por:
//   - COMPRA : validar o RECIBO do Google Play Billing / App Store no servidor (API da loja).
//   - ANÚNCIO: validar o callback SSV do AdMob (assinatura + nonce de uso único).
// ...e DESLIGAR a LOJA_SIMULADA. Este arquivo é o único lugar a mudar — nenhum outro módulo sabe como um
// pagamento é verificado; todos chamam estas duas funções.
function lojaSimulada() { return process.env.LOJA_SIMULADA === '1'; }

// `confirmacao` no modo de teste é { simulado:true }. No futuro é o recibo/token real da loja/AdMob.
function verificarCompra(confirmacao) {
  if (lojaSimulada() && confirmacao && confirmacao.simulado) return { ok: true, via: 'simulado' };
  return { ok: false, codigo: 'pagamento_indisponivel', erro: 'pagamento indisponível' };
}
function verificarAnuncio(confirmacao) {
  if (lojaSimulada() && confirmacao && confirmacao.simulado) return { ok: true, via: 'simulado' };
  return { ok: false, codigo: 'pagamento_indisponivel', erro: 'pagamento indisponível' };
}

module.exports = { lojaSimulada, verificarCompra, verificarAnuncio };
