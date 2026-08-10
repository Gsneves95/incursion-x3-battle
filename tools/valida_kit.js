// tools/valida_kit.js — SCHEMA de kit, validado na BUILD (falha alto).
// O vocabulário (classes, tipos de fx, tipos de efeito, alvos, chaves de custo e de fx)
// NÃO é redigitado aqui — vem de E.VOCAB, o próprio motor. Assim o schema não pode divergir
// do que o motor executa: se o motor ganhar/perder um fx.t, o validador acompanha sozinho.
//
// O que ele pega (o que impede erro silencioso ao escrever 73 kits):
//  - campo desconhecido no deus, na habilidade e no efeito (typo de chave)
//  - custo mal formado (elemento inválido, valor não inteiro positivo)
//  - classe inválida (habilidade e classePorModo)
//  - alvo inexistente
//  - efeito com tipo que o motor não sabe executar (fx.t) e apply com eff.type inválido
// Valida também a DEFESA (é regra, mas tem o MESMO formato de habilidade — se o formato
// mudar, a Defesa não fica para trás sem ninguém perceber).

const E = require('../src/engine.js');
const V = E.VOCAB;

const CHAVES_DEUS = new Set(['key', 'nome', 'faccao', 'elem', 'classe', 'funcao', 'inicial', 'passiva', 'provacao', 'ab']);
const CHAVES_AB = new Set(['slot', 'classe', 'classePorModo', 'nome', 'cost', 'cd', 'alvo', 'desc', 'fx', 'alterna', 'opcoes', 'universal']);
const CLASSES_DEUS = new Set([...V.classes, 'Híbrido']);   // no deus, Híbrido é rótulo válido; na habilidade não

function validarCusto(cost, ctx, errs) {
  if (typeof cost !== 'object' || cost === null || Array.isArray(cost)) { errs.push(`${ctx}: custo mal formado (não é objeto)`); return; }
  for (const [k, v] of Object.entries(cost)) {
    if (!V.custo.includes(k)) errs.push(`${ctx}: custo com elemento inválido "${k}" (válidos: ${V.custo.join(', ')})`);
    if (typeof v !== 'number' || !Number.isInteger(v) || v <= 0) errs.push(`${ctx}: custo "${k}" mal formado (${JSON.stringify(v)}; esperado inteiro > 0)`);
  }
}

function validarFx(f, ctx, errs) {
  if (!f || typeof f !== 'object' || Array.isArray(f)) { errs.push(`${ctx}: efeito não é objeto`); return; }
  if (!V.fx.includes(f.t)) errs.push(`${ctx}: efeito com tipo que o motor não sabe executar: "${f.t}"`);
  if (f.t === 'apply' && (!f.eff || !V.efeitos.includes(f.eff.type)))
    errs.push(`${ctx}: apply com eff.type inválido: "${f.eff && f.eff.type}"`);
  for (const k of Object.keys(f)) if (!V.fxKeys.includes(k)) errs.push(`${ctx}: campo desconhecido no efeito: "${k}"`);
}

// Valida uma habilidade OU a Defesa (mesmo formato).
function validarHabilidade(ab, ctx, errs) {
  if (!ab || typeof ab !== 'object') { errs.push(`${ctx}: habilidade não é objeto`); return; }
  for (const k of Object.keys(ab)) if (!CHAVES_AB.has(k)) errs.push(`${ctx}: campo desconhecido na habilidade: "${k}"`);
  if (typeof ab.slot !== 'string') errs.push(`${ctx}: slot ausente ou não-string`);
  if (typeof ab.nome !== 'string') errs.push(`${ctx}: nome ausente ou não-string`);
  if ('classe' in ab && !V.classes.includes(ab.classe)) errs.push(`${ctx}: classe inválida "${ab.classe}" (válidas: ${V.classes.join(', ')})`);
  if ('classePorModo' in ab) for (const m of Object.values(ab.classePorModo))
    if (!V.classes.includes(m)) errs.push(`${ctx}: classePorModo com classe inválida "${m}"`);
  if ('cd' in ab && (typeof ab.cd !== 'number' || ab.cd < 0)) errs.push(`${ctx}: cd inválido (${JSON.stringify(ab.cd)})`);
  if ('alvo' in ab && !V.alvos.includes(ab.alvo)) errs.push(`${ctx}: alvo inexistente "${ab.alvo}" (válidos: ${V.alvos.join(', ')})`);
  if ('cost' in ab) validarCusto(ab.cost, ctx, errs);
  if ('fx' in ab) {
    if (!Array.isArray(ab.fx)) errs.push(`${ctx}: fx não é array`);
    else ab.fx.forEach((f, i) => validarFx(f, `${ctx} fx[${i}]`, errs));
  }
  if ('opcoes' in ab) {
    if (!Array.isArray(ab.opcoes)) errs.push(`${ctx}: opcoes não é array`);
    else ab.opcoes.forEach((o, i) => {
      if (!o || !Array.isArray(o.fx)) errs.push(`${ctx} opcoes[${i}]: sem fx[]`);
      else o.fx.forEach((f, j) => validarFx(f, `${ctx} opcoes[${i}].fx[${j}]`, errs));
    });
  }
  // toda habilidade precisa de UMA forma de efeito: fx, alterna (Nezha) ou opcoes (escolha múltipla)
  if (!('fx' in ab) && !ab.alterna && !('opcoes' in ab)) errs.push(`${ctx}: sem efeito (nem fx, nem alterna, nem opcoes)`);
}

// Valida um deus inteiro. Devolve lista de problemas (vazia = ok).
function validarDeus(g) {
  const errs = [];
  const ctx = (g && g.key) ? g.key : '(sem key)';
  if (!g || typeof g !== 'object' || Array.isArray(g)) return [`${ctx}: deus não é objeto`];
  for (const k of Object.keys(g)) if (!CHAVES_DEUS.has(k)) errs.push(`${ctx}: campo desconhecido no deus: "${k}"`);
  if (typeof g.key !== 'string') errs.push(`${ctx}: key ausente ou não-string`);
  if (typeof g.nome !== 'string') errs.push(`${ctx}: nome ausente ou não-string`);
  if ('classe' in g && !CLASSES_DEUS.has(g.classe)) errs.push(`${ctx}: classe de deus inválida "${g.classe}"`);
  if (!Array.isArray(g.ab)) errs.push(`${ctx}: ab não é array`);
  else g.ab.forEach((ab, i) => validarHabilidade(ab, `${ctx}.ab[${i}](${(ab && ab.nome) || '?'})`, errs));
  return errs;
}

module.exports = { validarDeus, validarHabilidade, validarFx, validarCusto };
