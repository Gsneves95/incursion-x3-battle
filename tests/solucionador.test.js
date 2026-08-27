// tests/solucionador.test.js — o SOLUCIONADOR (F2.1). Prova JOGABILIDADE (existe um caminho), não solubilidade.
// Trava a reformulação (§148): VENCÍVEL = "existe caminho, aqui está um" (não o mínimo); INVENCÍVEL SÓ por
// exaustão real (nunca por orçamento); orçamento → INDETERMINADO ACIONÁVEL; determinismo.

const E = require('../src/engine.js');
Object.assign(global, E);
const PROV = require('../src/provacao.js');
const SOL = require('../tools/solucionador.js');
// FIXTURE TUNADO, não o catálogo: o data/provacoes/poseidon.json de produção é a Provação DIFÍCIL (120 HP,
// resolve com dica em ~90k nós) — o §149 diz que o exemplo tunado é do TESTE, não do catálogo. Este fixture é
// o Poseidon fácil (inimigos a 60 HP, Maré=9) que resolve em poucos nós: a suíte de regressão precisa de uma
// entrada CONTROLADA e estável, desacoplada do conteúdo do catálogo (que muda a cada lote/rebalanceamento).
const poseidon = {
  key: 'poseidon', titulo: 'A Maré Não Espera (fixture tunado)',
  aliados: ['poseidon', 'iara', 'sobek'], inimigos: ['ares', 'thor', 'ogum'],
  montar: { seed: 2, comeca: 0, orbs: { '0': { 'Maré': 9 } }, unidades: [{ lado: 1, idx: 0, hp: 60 }, { lado: 1, idx: 1, hp: 60 }, { lado: 1, idx: 2, hp: 60 }] },
  condicoes: [{ predicado: 'deadline', turnos: 8 }, { predicado: 'morteEmEstado', quem: 'inimigo', estado: 'encharcado' }],
};

let f = 0; const ok = (c, m) => { if (!c) { console.log('  FALHA: ' + m); f++; } };

console.log('== 1. Poseidon: VENCÍVEL com um caminho (jogabilidade) ==');
{
  const r = SOL.resolver(poseidon, { orcamentoNos: 50000 });
  ok(r.veredito === 'VENCIVEL', `Poseidon deveria ser VENCÍVEL (veio ${r.veredito})`);
  ok(Array.isArray(r.sequencia) && r.sequencia.length > 0, 'traz um caminho não-vazio');
  ok(r.comprimento === r.sequencia.length, 'comprimento = lances NESTE caminho (não o mínimo)');
  ok(r.nivelIA === 'normal', 'grava o nível de IA (normal) contra o qual verificou');
  ok(r.nos < 1000, `resolve em poucos nós (${r.nos}) — a heurística simples basta, não sofisticar`);
  console.log(`  VENCÍVEL em ${r.nos} nós · ${r.comprimento} lances · IA ${r.nivelIA}: ${r.sequencia.join(' → ')}`);
}

console.log('== 2. determinismo: mesma Provação, mesmo veredito e caminho ==');
{
  const a = SOL.resolver(poseidon, { orcamentoNos: 50000 });
  const b = SOL.resolver(poseidon, { orcamentoNos: 50000 });
  ok(a.veredito === b.veredito && JSON.stringify(a.sequencia) === JSON.stringify(b.sequencia), 'duas corridas idênticas');
  console.log('  duas corridas → mesmo caminho');
}

console.log('== 3. INVENCÍVEL só por EXAUSTÃO real (espaço pequeno, nunca por orçamento) ==');
{
  // 1v1, deadline 1 turno, inimigo cheio → impossível vencer no turno 1; o espaço é minúsculo → esgota
  const prov = { key: 'inv', aliados: ['zeus'], inimigos: ['zeus'], montar: { seed: 1, orbs: { '0': { 'Tempestade': 3 } } }, condicoes: [{ predicado: 'deadline', turnos: 1 }] };
  const r = SOL.resolver(prov, { orcamentoNos: 100000 });
  ok(r.veredito === 'INVENCIVEL', `deveria ser INVENCÍVEL por exaustão (veio ${r.veredito})`);
  ok(r.nos < 100000, `esgotou ANTES do orçamento (${r.nos} nós) — não foi o orçamento que decidiu`);
  console.log(`  INVENCÍVEL em ${r.nos} nós (fronteira esvaziou, não orçamento)`);
}

console.log('== 4. orçamento → INDETERMINADO ACIONÁVEL (nunca veredito negativo) ==');
{
  const r = SOL.resolver(poseidon, { orcamentoNos: 2 });   // Poseidon vence em ~4 nós → 2 é insuficiente
  ok(r.veredito === 'INDETERMINADO', `orçamento curto → INDETERMINADO (veio ${r.veredito}), NUNCA INVENCÍVEL`);
  ok(r.acionavel === 'orcamento' || r.acionavel === 'dica', `traz um motivo acionável (${r.acionavel})`);
  ok(/ORÇAMENTO|ESTAGNOU/.test(r.motivo), 'o motivo diz o que faltou');
  console.log(`  INDETERMINADO · acionável=${r.acionavel} · "${r.motivo.slice(0, 60)}..."`);
}

console.log('== 5. carimbo de versão: hash estável, muda com o catálogo ==');
{
  const h1 = PROV.catalogoHash(poseidon, E.GODS);
  const h2 = PROV.catalogoHash(poseidon, E.GODS);
  ok(h1 === h2 && typeof h1 === 'string', 'hash determinístico');
  const godsAlt = Object.assign({}, E.GODS, { poseidon: Object.assign({}, E.GODS.poseidon, { _mudou: true }) });
  ok(PROV.catalogoHash(poseidon, godsAlt) !== h1, 'hash MUDA quando o kit muda (rede de regressão)');
  // o carimbo vive no arquivo: uma Provação REAL carimbada bate com seu catálogo merged (a mesma checagem do build §3d)
  const real = require('../data/provacoes/apolo.json');
  ok(real.verificacao && real.verificacao.hash === PROV.catalogoHash(real), 'o carimbo de uma Provação real confere com o catálogo');
  console.log(`  hash ${h1} · muda com o kit · carimbo real (apolo) confere`);
}

console.log('== 6. acumulo{fonte,limiar}: nasce com as 11 fontes; fonte desconhecida é recusada ==');
{
  ok(PROV.FONTES_ACUMULO.length === 11, `11 fontes registradas (${PROV.FONTES_ACUMULO.length})`);
  const bom = PROV.validarProvacao({ key: 'a', aliados: ['zeus'], inimigos: ['zeus'], condicoes: [{ predicado: 'acumulo', fonte: 'danoRefletido', limiar: 50 }] });
  ok(bom.length === 0, 'acumulo com fonte conhecida é válido');
  const ruim = PROV.validarProvacao({ key: 'b', aliados: ['zeus'], inimigos: ['zeus'], condicoes: [{ predicado: 'acumulo', fonte: 'inventada', limiar: 50 }] });
  ok(ruim.some(e => /fonte DESCONHECIDA/.test(e)), 'fonte inventada é recusada na validação');
  console.log(`  11 fontes · fonte conhecida ok · fonte inventada recusada`);
}

console.log('');
console.log(f === 0 ? '>>> SOLUCIONADOR OK' : `>>> ${f} FALHA(S)`);
process.exit(f ? 1 : 0);
