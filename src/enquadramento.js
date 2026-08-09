// Regra de enquadramento do palco (F0.6b) — FONTE ÚNICA.
// Altura de design FIXA (428): em paisagem a altura é a dimensão escassa (as 3 bandas
// precisam caber). A LARGURA flui: o palco central fica mais largo/estreito, os times
// ficam nas bordas. Assim aparelho de proporção diferente não perde escala junto com
// a tarja — o iPhone SE (667×375) sai de 0,720 para 0,855, +19% em tudo.
//
// Esta função é PURA e a única dona da regra. O fit() (src/ui/base.js) só APLICA o
// resultado ao DOM; as suítes de navegador CHAMAM esta função e comparam com o que
// renderizou; o teste de unidade (tests/enquadramento.test.js) crava os 6 casos da
// tabela como ESPECIFICAÇÃO — o único lugar onde o número aparece escrito à mão.
const ALT_DESIGN = 428;      // altura de design, SEMPRE fixa
const TETO_ESCALA = 1.25;    // acima disto a arte-fonte (168px) borra em tablet — ver ESTADO
const LARG_MIN = 780;        // largura de design mínima (abaixo, a largura passa a mandar)
const LARG_MAX = 1200;       // largura de design máxima (acima, tarja lateral)

function calcularEnquadramento({ larguraUtil, alturaUtil }) {
  // escala pela ALTURA, com teto para não borrar a arte em tablet
  let escala = Math.min(alturaUtil / ALT_DESIGN, TETO_ESCALA);
  let larguraDesign = larguraUtil / escala;
  if (larguraDesign < LARG_MIN) {
    // a largura útil não cobre 780 na escala da altura → a LARGURA manda
    larguraDesign = LARG_MIN;
    escala = larguraUtil / LARG_MIN;
  } else if (larguraDesign > LARG_MAX) {
    // tela larguíssima → trava em 1200 e aceita tarja lateral (escala fica pela altura)
    larguraDesign = LARG_MAX;
  }
  return { escala, larguraDesign };
}

if (typeof module !== 'undefined')
  module.exports = { calcularEnquadramento, ALT_DESIGN, TETO_ESCALA, LARG_MIN, LARG_MAX };
