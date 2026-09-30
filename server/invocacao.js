// server/invocacao.js — §318 F2 E3: o SORTEIO e as CÓPIAS são do SERVIDOR (economia autoritativa).
//
// O cliente NÃO sorteia mais (o Math.random saiu de src/invocacao.js): ele PEDE `invocar` e MOSTRA o que
// volta. O sorteio é em 3 passos: (1) FAIXA — a faixa de RANQUE do deus, por FÓRMULA da faixa do jogador
// (economia.invocacao.faixaSorteio); (2) RARIDADE dentro da faixa (SS 1 / S 14 / A 85; ausente DESCE para a
// mais comum, NUNCA sobe para SS); (3) DEUS uniforme na faixa∩raridade. Pity 60 força SS, com a faixa do
// jogador RENORMALIZADA entre as faixas que TÊM SS. Débito de gema no servidor. Duplicata → PONTOS do deus
// (A1/S2/SS4); excedente de deus MAXIMIZADO → Essência (15/40/120). subirNivel gasta pontos (1/2/3).
//
// A faixa de cada deus = faixaIndice em data/missoes.json (+ os 9 iniciais na faixa 0). Nada se inventa.
const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');
function ler(rel) { return JSON.parse(fs.readFileSync(path.join(RAIZ, rel), 'utf8')); }

const ECON = ler('data/economia.json');
const INV = ECON.invocacao;
const RARIDADE = ler('data/raridades.json');          // deus -> 'A'|'S'|'SS'
const RANQ = ler('data/ranqueado.json');
const NFAIXAS = (RANQ.faixas || []).length || 8;
// §318 F3 — TRAVA DE LIBERAÇÃO: só os deuses cujas escadas passaram na triagem podem subir de nível.
// subirNivel recusa deus fora desta lista (mesmo com pontos). A lista cresce quando um deus mede DENTRO.
const NIVEIS_LIBERADOS = (function () { try { return new Set(ler('data/niveis_liberados.json').liberados || []); } catch (e) { return new Set(); } })();
const ORDEM_COMUM = ['A', 'S', 'SS'];                  // do mais comum ao mais raro (para "descer, nunca subir")

// deus -> faixaIndice (a faixa da Provação que o libera; iniciais na 0)
const FAIXA_DEUS = (function () {
  const m = {};
  try {
    const M = ler('data/missoes.json');
    for (const k of (M.iniciais || [])) m[k] = 0;
    for (const [deus, mis] of Object.entries(M.missoes || {})) m[deus] = mis.faixaIndice || 0;
  } catch (e) {}
  return m;
})();

// pools[faixa][raridade] = [deusKeys]; e a contagem de deuses por faixa (para o rateio "abaixo")
const POOL = [];
const CONTA_FAIXA = new Array(NFAIXAS).fill(0);
for (let f = 0; f < NFAIXAS; f++) POOL[f] = { A: [], S: [], SS: [] };
for (const deus in FAIXA_DEUS) {
  const f = FAIXA_DEUS[deus]; const r = RARIDADE[deus] || 'A';
  if (f >= 0 && f < NFAIXAS && POOL[f][r]) { POOL[f][r].push(deus); CONTA_FAIXA[f]++; }
}
for (let f = 0; f < NFAIXAS; f++) for (const r of ORDEM_COMUM) POOL[f][r].sort();   // determinístico
const FAIXAS_COM_SS = [];
for (let f = 0; f < NFAIXAS; f++) if (POOL[f].SS.length) FAIXAS_COM_SS.push(f);

// ---- RNG local seedável (para os testes/qui-quadrado); ao vivo usa Math.random ----
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

// ---- a LINHA de chances de FAIXA para a faixa `f` do jogador (fórmula; soma 100) ----
function linhaFaixa(f) {
  const cfg = INV.faixaSorteio || { own: 60, primeiroAcima: 2, razaoAcima: 0.2 };
  const row = new Array(NFAIXAS).fill(0);
  let aboveSum = 0;
  for (let k = f + 1; k < NFAIXAS; k++) { const v = cfg.primeiroAcima * Math.pow(cfg.razaoAcima, k - f - 1); row[k] = v; aboveSum += v; }
  const belowTotal = 100 - cfg.own - aboveSum;
  let cs = 0; for (let b = 0; b < f; b++) cs += CONTA_FAIXA[b];
  if (f > 0 && cs > 0) { row[f] = cfg.own; for (let b = 0; b < f; b++) row[b] = belowTotal * CONTA_FAIXA[b] / cs; }
  else { row[f] = cfg.own + belowTotal; }   // sem faixa abaixo (ou faixas abaixo vazias): a própria absorve o resto
  return row;
}

// faixa do JOGADOR a partir dos pontos de ranque (a faixa mais alta cujo min <= pontos)
function faixaDoJogador(conta) {
  const pts = (conta && conta.ranque && conta.ranque.pontos) || 0;
  let idx = 0;
  for (let i = 0; i < NFAIXAS; i++) if (pts >= (RANQ.faixas[i].min || 0)) idx = i;
  return idx;
}

function _pesoPick(pesos, rng) {
  const total = pesos.reduce((a, b) => a + b, 0);
  let x = rng() * total;
  for (let i = 0; i < pesos.length; i++) { x -= pesos[i]; if (x < 0) return i; }
  return pesos.length - 1;
}
function _raridadeNaFaixa(f, rng) {
  // rola SS/S/A pelas taxas; se a raridade sorteada não existe na faixa, DESCE para a mais comum presente.
  const P = INV.taxas; const x = rng();
  let rar = (x < P.SS) ? 'SS' : (x < P.SS + P.S) ? 'S' : 'A';
  if (POOL[f][rar].length) return rar;
  // desce, nunca sobe: SS->S->A ; S->A ; A->(nada acima; procura a mais comum presente)
  const desc = rar === 'SS' ? ['S', 'A'] : rar === 'S' ? ['A'] : [];
  for (const r of desc) if (POOL[f][r].length) return r;
  for (const r of ORDEM_COMUM) if (POOL[f][r].length) return r;   // qualquer presente (nunca sobe pra SS por acaso: SS é o último de ORDEM_COMUM só se for a única)
  return null;
}
function _deusDe(f, rar, rng, destaqueKey) {
  if (rar === 'SS' && destaqueKey && RARIDADE[destaqueKey] === 'SS') return destaqueKey;   // destaque dentro da raridade sorteada
  const pool = POOL[f][rar];
  return pool.length ? pool[Math.floor(rng() * pool.length)] : null;
}

// sorteia UM: {key, raridade, faixa}. `estado` carrega o pity (mutado). destaqueKey opcional.
function sortearUm(estado, fJogador, rng, destaqueKey) {
  estado.pity = (estado.pity || 0) + 1;
  const PITY = INV.pity.duro;
  if (estado.pity >= PITY) {
    // FORÇA SS: faixa pela linha do jogador RENORMALIZADA entre as faixas que têm SS
    const row = linhaFaixa(fJogador);
    const pesos = FAIXAS_COM_SS.map(f => row[f]);
    const f = FAIXAS_COM_SS.length ? FAIXAS_COM_SS[_pesoPick(pesos, rng)] : fJogador;
    const key = _deusDe(f, 'SS', rng, destaqueKey);
    estado.pity = 0;
    return { key, raridade: 'SS', faixa: f };
  }
  const row = linhaFaixa(fJogador);
  const f = _pesoPick(row, rng);
  const rar = _raridadeNaFaixa(f, rng);
  const key = _deusDe(f, rar, rng, destaqueKey);
  if (rar === 'SS') estado.pity = 0;
  return { key, raridade: rar, faixa: f };
}

function sortearLote(estado, fJogador, n, rng, destaqueKey) {
  const out = [];
  for (let i = 0; i < n; i++) out.push(sortearUm(estado, fJogador, rng, destaqueKey));
  return out;
}

// ---- ledgers do servidor (nascem/migram vazios; nunca no perfil que o cliente escreve) ----
function garantir(conta) {
  if (!conta.gacha || typeof conta.gacha !== 'object') conta.gacha = { pity: 0, inicianteUsado: false };
  if (typeof conta.gacha.pity !== 'number') conta.gacha.pity = 0;
  if (typeof conta.gacha.inicianteUsado !== 'boolean') conta.gacha.inicianteUsado = false;
  if (!conta.pontos || typeof conta.pontos !== 'object') conta.pontos = {};
  return conta;
}

const SLOTS = ['basico', 'habilidade', 'milagre'];
function _niveisDeus(conta, deus) {
  const raw = (conta.niveis && conta.niveis[deus]) || {};
  return { basico: raw.basico || 1, habilidade: raw.habilidade || 1, milagre: raw.milagre || 1 };
}
// §318 F3 — os SLOTS que TÊM escada no catálogo (data/deuses). Um deus da regra (f') não tem escada no básico,
// então "maximizado" e o custo total contam só as escadas EXISTENTES, não os 3 slots fixos.
const _CATN = (function () { try { return require('../src/catalogo.js').GODS; } catch (e) { return {}; } })();
function _escadasDe(deus) {
  const g = _CATN[deus]; if (!g || !Array.isArray(g.ab)) return [];
  return SLOTS.filter(s => { const ab = g.ab.find(a => a.slot === s); return ab && Array.isArray(ab.niveis) && ab.niveis.length; });
}
function _maximizado(conta, deus) {
  const n = _niveisDeus(conta, deus);
  const slots = _escadasDe(deus);
  return slots.length > 0 && slots.every(s => n[s] >= 4);   // só as escadas que EXISTEM (regra f': básico sem escada)
}
function _possui(conta, deus) { return !!(conta.perfil && conta.perfil.deuses && conta.perfil.deuses[deus]); }
function _addMoeda(conta, moeda, v) {
  conta.perfil.moedas = Object.assign({ gema: 0, essencia: 0 }, conta.perfil.moedas);
  conta.perfil.moedas[moeda] = (conta.perfil.moedas[moeda] || 0) + v;
}
function _saldo(conta) { const m = (conta.perfil && conta.perfil.moedas) || {}; return { gema: m.gema || 0, essencia: m.essencia || 0 }; }

// ---- INVOCAR: débito de gema + sorteio + aplicação (posse/pontos/essência) no SERVIDOR ----
// opts = { pacote:boolean, destaque:string? }. Devolve { ok, resultados, saldo, pity, motivo? }.
function invocar(conta, opts, agora, rngInj) {
  garantir(conta);
  opts = opts || {};
  const iniciante = !!opts.iniciante;
  const fJog = faixaDoJogador(conta);
  const rng = rngInj || Math.random;
  let bruto;
  if (iniciante) {
    // BÊNÇÃO DO INICIANTE: grátis, 10, uma vez, com SS GARANTIDO (economia.invocacao.banners.iniciante).
    if (conta.gacha.inicianteUsado) return { ok: false, motivo: 'iniciante_ja_usado', saldo: _saldo(conta) };
    const cfg = (INV.banners && INV.banners.iniciante) || { qtd: 10 };
    const estado = { pity: conta.gacha.pity };
    bruto = sortearLote(estado, fJog, cfg.qtd || 10, rng, opts.destaque || null);
    if ((cfg.garanteSS !== false) && !bruto.some(o => o.raridade === 'SS')) {
      const est2 = { pity: INV.pity.duro };   // força um SS pelo pity, renormalizado entre faixas com SS
      bruto[bruto.length - 1] = sortearUm(est2, fJog, rng, opts.destaque || null);
      estado.pity = 0;
    }
    conta.gacha.pity = estado.pity;
    conta.gacha.inicianteUsado = true;
  } else {
    const custo = opts.pacote ? INV.custo.pacote10 : INV.custo.avulso;
    const saldo = (conta.perfil && conta.perfil.moedas && conta.perfil.moedas.gema) || 0;
    if (saldo < custo) return { ok: false, motivo: 'gemas_insuficientes', saldo: _saldo(conta) };
    _addMoeda(conta, 'gema', -custo);
    const n = opts.pacote ? 10 : 1;
    const estado = { pity: conta.gacha.pity };
    bruto = sortearLote(estado, fJog, n, rng, opts.destaque || null);
    conta.gacha.pity = estado.pity;
  }
  const PONTOS = INV.pontosPorDuplicata || {}, ESS = INV.essenciaPorDuplicata || {};
  const resultados = bruto.map(o => {
    const r = { key: o.key, raridade: o.raridade, faixa: o.faixa, novo: false, pontos: 0, essencia: 0 };
    if (!o.key) return r;   // faixa/raridade sem deus (não deveria acontecer com pools cheios)
    if (!_possui(conta, o.key)) {
      conta.perfil.deuses[o.key] = { copias: 1, favorito: false, obtidoEm: (typeof agora === 'number' ? agora : Date.now()) };
      r.novo = true;
    } else if (_maximizado(conta, o.key)) {
      const e = ESS[o.raridade] || 0; _addMoeda(conta, 'essencia', e); r.essencia = e;   // EXCEDENTE do deus MAX → Essência
    } else {
      const p = PONTOS[o.raridade] || 0; conta.pontos[o.key] = (conta.pontos[o.key] || 0) + p; r.pontos = p;   // duplicata → PONTOS
    }
    return r;
  });
  return { ok: true, resultados, saldo: _saldo(conta), pity: conta.gacha.pity, pontos: conta.pontos, inicianteUsado: conta.gacha.inicianteUsado };
}

// crédito de TESTE (afordância de protótipo, botão +): credita gema NO SERVIDOR (a economia é do servidor)
// e MARCA a conta como contaminada. Sai antes do release, como o creditarDev do cliente. Valor do economia.
function devCredito(conta) {
  garantir(conta);
  const v = (ECON.grantTeste && ECON.grantTeste.gema) || 0;
  _addMoeda(conta, 'gema', v);
  conta.dev = conta.dev || { creditosTeste: 0 };
  conta.dev.creditosTeste += v;
  return { ok: true, valor: v, saldo: _saldo(conta) };
}

// ---- SUBIR NÍVEL: gasta PONTOS do deus (custo 1/2/3). Todas as recusas. ----
function subirNivel(conta, deus, slot) {
  garantir(conta);
  if (!_possui(conta, deus)) return { ok: false, motivo: 'nao_possui' };
  if (!NIVEIS_LIBERADOS.has(deus)) return { ok: false, motivo: 'niveis_nao_liberados' };   // §318 F3: escada ainda não passou na triagem
  if (SLOTS.indexOf(slot) < 0) return { ok: false, motivo: 'slot_invalido' };
  if (!_escadasDe(deus).includes(slot)) return { ok: false, motivo: 'nivel_inexistente' };   // §318 F3 (f'): slot sem escada (ex.: básico de deus muito durável)
  const n = _niveisDeus(conta, deus);
  const cur = n[slot];
  if (cur >= 4) return { ok: false, motivo: 'ja_no_maximo' };
  const alvo = cur + 1;
  const custo = (INV.custoNivel && INV.custoNivel[String(alvo)]) || 0;
  const pts = conta.pontos[deus] || 0;
  if (pts < custo) return { ok: false, motivo: 'pontos_insuficientes', custo, pontos: pts };
  conta.pontos[deus] = pts - custo;
  if (!conta.niveis) conta.niveis = {};
  if (!conta.niveis[deus]) conta.niveis[deus] = { basico: 1, habilidade: 1, milagre: 1 };
  conta.niveis[deus][slot] = alvo;
  return { ok: true, deus, slot, nivel: alvo, pontos: conta.pontos[deus] };
}

// ---- PERGAMINHO: debita Essência no servidor (a posse + recarga seguem no cliente por ora) ----
function comprarPergaminho(conta, deus) {
  garantir(conta);
  if (!_possui(conta, deus)) return { ok: false, motivo: 'nao_possui' };
  const custo = (ECON.pergaminhos && ECON.pergaminhos.custoEssencia) || 0;
  const ess = (conta.perfil && conta.perfil.moedas && conta.perfil.moedas.essencia) || 0;
  if (ess < custo) return { ok: false, motivo: 'essencia_insuficiente', custo, essencia: ess };
  _addMoeda(conta, 'essencia', -custo);
  return { ok: true, custo, saldo: _saldo(conta) };
}

module.exports = {
  linhaFaixa, faixaDoJogador, sortearUm, sortearLote, invocar, subirNivel, comprarPergaminho, devCredito, garantir,
  mulberry32, NFAIXAS, CONTA_FAIXA, FAIXA_DEUS, POOL, FAIXAS_COM_SS, _maximizado, _niveisDeus, NIVEIS_LIBERADOS,
  _raridadeNaFaixa, _pesoPick,
};
