// tests/composicao_ref.test.js — §323 P2 ETAPA D: a GERAÇÃO de times de referência da composição respeita a
// REGRA de cada desafio e é determinística. Guarda RÁPIDA (sem solucionador — a winnability é medida pelo tool
// tools/ref_composicao.js). Morde se a regra for violada (ex.: um "monoElemento" com elementos misturados).
const path = require('path');
const { gerar, meta, comp } = require(path.join(__dirname, '..', 'tools', 'ref_composicao.js'));

let falhas = 0, passes = 0;
const ok = (c, m) => { if (!c) { console.log('  ✗ FALHA: ' + m); falhas++; } else { console.log('  ✓ ' + m); passes++; } };

console.log('== §323 P2 ETAPA D — geração de times de referência (regra + determinismo) ==');

const cumpre = {
  monoElemento: t => new Set(t.map(k => meta(k).elem)).size === 1,
  mesmaFuncao: t => new Set(t.map(k => meta(k).funcao)).size === 1,
  funcoesDistintas: t => new Set(t.map(k => meta(k).funcao)).size === 3,
  monoPanteao: t => new Set(t.map(k => meta(k).faccao)).size === 1,
  livre: t => true,
};

for (const d of comp.desafios) {
  const times = gerar(d.regra, 3);
  ok(times.length >= 1, `${d.id} (${d.regra}): gerou ao menos 1 time de referência`);
  for (const t of times) {
    ok(Array.isArray(t) && t.length === 3 && new Set(t).size === 3, `${d.id} [${t.join(',')}]: trio válido (3 distintos)`);
    ok(cumpre[d.regra] ? cumpre[d.regra](t) : true, `${d.id} [${t.join(',')}]: CUMPRE a regra "${d.regra}"`);
  }
  // determinismo: gerar de novo dá EXATAMENTE o mesmo resultado
  const t2 = gerar(d.regra, 3);
  ok(JSON.stringify(t2) === JSON.stringify(times), `${d.id}: geração é determinística`);
}

// BITE: um "monoElemento" montado com elementos MISTURADOS é rejeitado pela regra (a guarda realmente discrimina)
const misto = ['zeus', 'cuca', 'ogum'];   // elementos diferentes (pré-condição: não são todos do mesmo elemento)
ok(new Set(misto.map(k => meta(k).elem)).size > 1 && !cumpre.monoElemento(misto),
  'BITE: um trio de elementos misturados NÃO cumpre monoElemento (a regra discrimina)');

console.log(`\n${falhas ? '✗ ' + falhas + ' FALHA(S)' : '✓ tudo verde'} · ${passes} asserções`);
process.exit(falhas ? 1 : 0);
