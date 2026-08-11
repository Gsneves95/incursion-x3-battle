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
const CHAVES_PASSIVA = new Set(['nome', 'desc', 'fx', 'inerte']);   // inerte: passiva ainda não funcional (UI acinzenta)
const CHAVES_PASSIVA_FX = new Set(['gatilho', 'escopo', 'v', 'quando']);
const CHAVES_AB = new Set(['slot', 'classe', 'classePorModo', 'nome', 'cost', 'cd', 'alvo', 'desc', 'fx', 'alterna', 'modos', 'opcoes', 'universal']);
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
  if (f.t === 'dot' && !V.dots.includes(f.nome))
    errs.push(`${ctx}: dot com nome fora do vocabulário: "${f.nome}" (válidos: ${V.dots.join(', ')})`);
  if (f.t === 'contador' && !V.contadores.includes(f.nome))
    errs.push(`${ctx}: contador com nome fora do vocabulário: "${f.nome}" (válidos: ${V.contadores.join(', ')})`);
  if ('limiar' in f) {   // gatilho-no-acúmulo: contador cruza `em` -> aplica `aplica` (F1.1)
    const L = f.limiar;
    if (!L || typeof L !== 'object') errs.push(`${ctx}: limiar não é objeto`);
    else {
      if (typeof L.em !== 'number' || !Number.isInteger(L.em) || L.em <= 0) errs.push(`${ctx}: limiar.em inválido (${JSON.stringify(L.em)}; inteiro > 0)`);
      if (!L.aplica || !V.efeitos.includes(L.aplica.type)) errs.push(`${ctx}: limiar.aplica.type inválido: "${L.aplica && L.aplica.type}"`);
    }
  }
  for (const k of Object.keys(f)) if (!V.fxKeys.includes(k)) errs.push(`${ctx}: campo desconhecido no efeito: "${k}"`);
}

// Valida a CONDIÇÃO `quando` de um fx de passiva (F1.2). O conjunto de condições e COMO validar o
// valor de cada uma vêm de V.condicoesDef (o motor), não são redigitados aqui. `pendente` = condição
// no vocabulário mas cujo estado o motor ainda não rastreia: recusa em voz alta (não vira falso silencioso).
function validarQuando(q, ctx, errs) {
  if (!q || typeof q !== 'object' || Array.isArray(q)) { errs.push(`${ctx}: quando não é objeto`); return; }
  const chaves = Object.keys(q);
  if (chaves.length !== 1) errs.push(`${ctx}: quando deve ter exatamente 1 condição (tem ${chaves.length})`);
  for (const k of chaves) {
    const def = V.condicoesDef[k];
    if (!def) { errs.push(`${ctx}: condição desconhecida "${k}" (válidas: ${V.condicoes.join(', ')})`); continue; }
    if (def.pendente) { errs.push(`${ctx}: condição "${k}" reservada — ${def.pendente}`); continue; }
    const val = q[k];
    if (def.bool) { if (val !== true) errs.push(`${ctx}: condição "${k}" espera true (recebeu ${JSON.stringify(val)})`); }
    else if (def.hp) {
      if (!val || typeof val !== 'object' || !['cheio', 'abaixo', 'acima'].includes(val.op)) errs.push(`${ctx}: alvoHp.op inválido (${JSON.stringify(val && val.op)}; cheio|abaixo|acima)`);
      else if ((val.op === 'abaixo' || val.op === 'acima') && typeof val.v !== 'number') errs.push(`${ctx}: alvoHp.v ausente para op "${val.op}"`);
    }
    else if (def.sub) { if (!def.sub.includes(val)) errs.push(`${ctx}: valor "${val}" fora do sub-vocabulário de "${k}" (válidos: ${def.sub.join(', ') || '(vazio)'})`); }
  }
}

// Valida a PASSIVA declarativa (F1.2). Prosa (nome/desc) é livre; se houver fx, ele tem forma fechada.
function validarPassiva(p, ctx, errs) {
  if (!p || typeof p !== 'object') { errs.push(`${ctx}: passiva não é objeto`); return; }
  for (const k of Object.keys(p)) if (!CHAVES_PASSIVA.has(k)) errs.push(`${ctx}: campo desconhecido na passiva: "${k}"`);
  if (!('fx' in p)) return;   // passiva ainda em prosa pura (hardcoded no motor) — permitido
  if (!Array.isArray(p.fx)) { errs.push(`${ctx}: passiva.fx não é array`); return; }
  p.fx.forEach((f, i) => {
    const c = `${ctx}.fx[${i}]`;
    if (!f || typeof f !== 'object') { errs.push(`${c}: fx de passiva não é objeto`); return; }
    for (const k of Object.keys(f)) if (!CHAVES_PASSIVA_FX.has(k)) errs.push(`${c}: campo desconhecido no fx de passiva: "${k}"`);
    if (!V.gatilhosPassiva.includes(f.gatilho)) errs.push(`${c}: gatilho inválido "${f.gatilho}" (válidos: ${V.gatilhosPassiva.join(', ')})`);
    if ('escopo' in f && !V.escoposPassiva.includes(f.escopo)) errs.push(`${c}: escopo inválido "${f.escopo}" (válidos: ${V.escoposPassiva.join(', ')})`);
    if (typeof f.v !== 'number' || !Number.isInteger(f.v) || f.v <= 0) errs.push(`${c}: v mal formado (${JSON.stringify(f.v)}; inteiro > 0)`);
    if ('quando' in f) validarQuando(f.quando, `${c}.quando`, errs);
  });
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
  if ('passiva' in g) validarPassiva(g.passiva, `${ctx}.passiva`, errs);
  if (!Array.isArray(g.ab)) errs.push(`${ctx}: ab não é array`);
  else g.ab.forEach((ab, i) => validarHabilidade(ab, `${ctx}.ab[${i}](${(ab && ab.nome) || '?'})`, errs));
  return errs;
}

module.exports = { validarDeus, validarHabilidade, validarFx, validarCusto, validarPassiva };
