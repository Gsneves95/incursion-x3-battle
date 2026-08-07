// Navegação: rota atual + parâmetros + pilha de histórico.
// PURO sobre o objeto NAV — sem DOM, sem render. O efeito de redesenhar fica
// FORA (quem chama ir/voltar dispara render()). Cada tela se registra com seus
// ganchos de ciclo de vida; aoEntrar/aoSair são os DONOS do que liga e desliga
// ao trocar de tela (relógio, limpeza de sobreposição), para não haver a mesma
// limpeza repetida em cada ponto de navegação.

const NAV = { pilha: [], telas: {} };   // pilha de {rota, params}; telas: {nome:{render,aoEntrar,aoSair}}

// registrar(nome, {render, aoEntrar, aoSair}) — cada tela se registra uma vez.
function registrar(nome, ganchos) { NAV.telas[nome] = ganchos || {}; }

function rotaAtual()   { return NAV.pilha.length ? NAV.pilha[NAV.pilha.length - 1].rota   : null; }
function paramsAtuais(){ return NAV.pilha.length ? NAV.pilha[NAV.pilha.length - 1].params : {};  }
function hooksAtuais() { return NAV.telas[rotaAtual()] || {}; }

// ir(rota, params, {substituir}) — navega. Empilha por padrão; com substituir
// troca o topo sem empilhar (é assim que a batalha entra: não deve virar item de
// histórico, senão "voltar" abandonaria a partida em andamento).
function ir(rota, params, opc) {
  params = params || {}; opc = opc || {};
  const saindo = rotaAtual();
  if (saindo != null) { const h = NAV.telas[saindo]; if (h && h.aoSair) h.aoSair(); }
  const entrada = { rota, params };
  if (opc.substituir && NAV.pilha.length) NAV.pilha[NAV.pilha.length - 1] = entrada;
  else NAV.pilha.push(entrada);
  const h = NAV.telas[rota]; if (h && h.aoEntrar) h.aoEntrar(params);
  return rota;
}

// voltar() — desempilha. Devolve false se não há para onde voltar (0 ou 1 item),
// e nesse caso NÃO mexe em nada (não dispara aoSair) — é o que impede sair de uma
// batalha em andamento, já que ela entra por substituir e fica sozinha na pilha.
function voltar() {
  if (NAV.pilha.length <= 1) return false;
  const saindo = NAV.pilha[NAV.pilha.length - 1];
  const hs = NAV.telas[saindo.rota]; if (hs && hs.aoSair) hs.aoSair();
  NAV.pilha.pop();
  const destino = NAV.pilha[NAV.pilha.length - 1];
  const hd = NAV.telas[destino.rota]; if (hd && hd.aoEntrar) hd.aoEntrar(destino.params);
  return true;
}

// zera a pilha (bootstrap / testes). Não dispara ganchos.
function resetRotas() { NAV.pilha = []; }

if (typeof module !== 'undefined') module.exports = { ir, voltar, rotaAtual, paramsAtuais, registrar, hooksAtuais, resetRotas, NAV };
