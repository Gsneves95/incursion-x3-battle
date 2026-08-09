// enquadramento.test.js (F0.6b) — ESPECIFICAÇÃO da regra de enquadramento.
// Função pura, SEM DOM. Este é o ÚNICO lugar onde os números da tabela aparecem
// escritos à mão — é a spec. Se a regra mudar de propósito, este teste falha e
// obriga a decisão consciente. As suítes de navegador NÃO recopiam a fórmula:
// elas chamam calcularEnquadramento e comparam com o que o navegador renderizou.
const { calcularEnquadramento, ALT_DESIGN, TETO_ESCALA } = require('../src/enquadramento.js');

let f = 0;
function ok(c, m) { if (!c) { console.log('  FALHA: ' + m); f++; } }

// tabela do dono: viewport (util) → escala, larguraDesign
const CASOS = [
  { w: 667, h: 375, escala: 0.855, larg: 780,  nota: 'iPhone SE — largura manda; tarja ~9px vert' },
  { w: 726, h: 312, escala: 0.729, larg: 996,  nota: 'aparelho do dono (janela) — altura manda' },
  { w: 800, h: 360, escala: 0.841, larg: 951,  nota: 'aparelho do dono em TELA CHEIA' },
  { w: 844, h: 390, escala: 0.911, larg: 926,  nota: 'design casa em 926 exatos' },
  { w: 915, h: 412, escala: 0.963, larg: 950,  nota: '' },
  { w: 1180, h: 820, escala: 1.250, larg: 944, nota: 'tablet — teto de escala, tarja vertical' },
];

console.log('== calcularEnquadramento bate a tabela (spec) ==');
for (const c of CASOS) {
  const r = calcularEnquadramento({ larguraUtil: c.w, alturaUtil: c.h });
  ok(Math.abs(r.escala - c.escala) < 0.001, `${c.w}x${c.h}: escala ${r.escala.toFixed(4)} esperava ${c.escala}`);
  ok(Math.abs(r.larguraDesign - c.larg) < 1, `${c.w}x${c.h}: largura ${r.larguraDesign.toFixed(1)} esperava ${c.larg}`);
}
console.log('  6 casos batem');

console.log('== invariantes da regra ==');
{
  // altura de design é sempre 428 (a escala nunca a viola: 428*escala <= alturaUtil,
  // exceto quando o teto de escala corta — aí sobra tarja vertical, intencional)
  const teto = calcularEnquadramento({ larguraUtil: 3000, alturaUtil: 3000 });
  ok(teto.escala === TETO_ESCALA, 'escala trava no teto ' + TETO_ESCALA + ' em tela enorme (veio ' + teto.escala + ')');
  ok(teto.larguraDesign === 1200, 'largura trava em 1200 em tela larguíssima (veio ' + teto.larguraDesign + ')');
  // largura nunca abaixo de 780
  const estreito = calcularEnquadramento({ larguraUtil: 500, alturaUtil: 400 });
  ok(estreito.larguraDesign === 780, 'largura mínima 780 em tela estreita (veio ' + estreito.larguraDesign + ')');
  ok(Math.abs(estreito.larguraDesign * estreito.escala - 500) < 0.5, 'com largura mandando, largura·escala = larguraUtil (cabe exato)');
  ok(ALT_DESIGN === 428, 'altura de design é 428');
  console.log('  teto 1,25 · largura ∈ [780,1200] · altura 428');
}

console.log('== piso de LEGIBILIDADE: menor texto em pixels FÍSICOS (spec) ==');
{
  // Legibilidade NÃO é a escala (proporção do palco) — é o TAMANHO FINAL do texto em
  // pixels FÍSICOS: menorTextoDesign × escala × DPR. Escala 0,729 num DPR 3 rende texto
  // MAIOR que escala 0,90 num DPR 1. Por isso o piso é em px físicos, com DPR na conta.
  // (Substitui o antigo piso de escala 0,80 — ver DECISOES.md.)
  const MENOR = 8;  // menor texto do jogo no palco, em px de DESIGN. Fonte: shell.html
                    // .skill__cost.gratis span e .foepanel__lbl. Único lugar à mão (spec).
  const PISO = 11;  // px FÍSICOS mínimos para leitura confortável em celular
  // físico esperado à mão por caso (a spec) — se a regra ou o menor texto mudar, falha.
  const LEG = [
    { w: 726,  h: 312, dpr: 2, fis: 11.7 }, // PIOR caso da matriz — folga ~0,7px sobre 11
    { w: 726,  h: 312, dpr: 3, fis: 17.5 }, // mesmo aparelho em DPR 3: sobra enorme
    { w: 667,  h: 375, dpr: 2, fis: 13.7 }, // iPhone SE (DPR 2 real)
    { w: 1180, h: 820, dpr: 2, fis: 20.0 }, // tablet no teto de escala
  ];
  for (const c of LEG) {
    const { escala } = calcularEnquadramento({ larguraUtil: c.w, alturaUtil: c.h });
    const fisico = MENOR * escala * c.dpr;
    ok(Math.abs(fisico - c.fis) < 0.1, `${c.w}x${c.h} @DPR${c.dpr}: físico ${fisico.toFixed(1)} esperava ${c.fis}`);
    ok(fisico >= PISO, `${c.w}x${c.h} @DPR${c.dpr}: físico ${fisico.toFixed(1)} ABAIXO do piso ${PISO}`);
  }
  console.log(`  menor texto ${MENOR}px design · piso ${PISO}px físicos · pior caso 726x312@DPR2 = 11,7px`);
}

console.log('');
console.log(f === 0 ? '>>> ENQUADRAMENTO OK' : `>>> ${f} FALHA(S)`);
process.exit(f ? 1 : 0);
