'use strict';
// §241 — CUSTO da árvore de missões por SIMULAÇÃO (o que a hand-math erra: as sequências são exponenciais
// E se sobrepõem — uma sequência de 6 com Zeus satisfaz a sequência de TODAS as missões que pedem Zeus).
// Modela um jogador razoável de PvP a p de vitória, com o CONTADOR COMEÇANDO NO DESBLOQUEIO (§241 item 4):
// nada de pré-farm. Reporta a mediana de partidas para completar as 91 e as horas a 6 e 8 min.
//
//   node tools/custo_missoes.js [pWin=0.5] [trials=400]

const fs = require('fs');
const path = require('path');
const DOC = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'missoes.json'), 'utf8'));
const M = DOC.missoes, KEYS = Object.keys(M), INICIAIS = DOC.iniciais;
const PANTE = DOC.panteaoDe;              // deus -> panteão de membresia (facção real)
const RANQ = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'ranqueado.json'), 'utf8'));
const PT = RANQ.pontos;                   // {vitoria, derrota, piso}

const pWin = parseFloat(process.argv[2]) || 0.5;
const TRIALS = parseInt(process.argv[3], 10) || 400;

// deuses de cada panteão que EXISTEM como jogáveis (iniciais + qualquer deus de missão) — para montar time.
function godsDoPanteao(P, possui) { return [...possui].filter(k => PANTE[k] === P); }

function umaTrial(rng, opts) {
  opts = opts || {};
  const O_FROMUNLOCK = opts.fromUnlock !== false;   // §241 item 4 (contador desde o desbloqueio)
  const O_ALLSEQ = opts.allSeq !== false;           // §241 item 3 (toda missão tem sequência)
  const O_RANKGATE = opts.rankGate !== false;       // §241 item 1 (portão de ranque)
  const RAMP = opts.seqRamp || null;   // [8] por índice de faixa; sobrepõe M[k].seguidas quando dado
  const seguidasDe = k => !O_ALLSEQ ? (M[k].raridade === 'A' ? 0 : (M[k].raridade === 'SS' ? 5 : 3))
    : (RAMP ? RAMP[M[k].faixaIndice] : M[k].seguidas);
  const faixaMinDe = k => O_RANKGATE ? M[k].faixaMin : 0;
  const possui = new Set(INICIAIS);
  let pontos = 0, jogos = 0;
  const pantWins = {};                    // vitórias acumuladas por panteão (volume)
  const streak = {};                      // sequência atual por deus (reset na derrota do time)
  const pantStreak = {};                  // sequência atual por panteão (para missões sem companheiro)
  const est = {};                         // por missão: {unlocked, volBase, seqBase, done}
  for (const k of KEYS) est[k] = { unlocked: false, volBase: 0, seqBase: 0, done: false };

  const faixaMin = k => faixaMinDe(k);
  const compProv = k => { const c = M[k].companheiro; return !c || possui.has(c); };
  const alvoChave = k => M[k].seguidasAlvo ? M[k].seguidasAlvo.chave : (M[k].companheiro || M[k].panteao);
  const alvoTipo = k => M[k].seguidasAlvo ? M[k].seguidasAlvo.tipo : (M[k].companheiro ? 'companheiro' : 'panteao');

  function reavaliarUnlocks() {
    for (const k of KEYS) {
      const e = est[k]; if (e.unlocked || e.done) continue;
      if (compProv(k) && pontos >= faixaMin(k)) {
        e.unlocked = true;
        // §241 item 4: contador COMEÇA no desbloqueio. Com O_FROMUNLOCK off, base 0 = conta retroativo (o antigo).
        e.volBase = O_FROMUNLOCK ? (pantWins[M[k].panteao] || 0) : 0;
        e.seqBase = O_FROMUNLOCK ? (alvoTipo(k) === 'companheiro' ? (streak[alvoChave(k)] || 0) : (pantStreak[alvoChave(k)] || 0)) : 0;
      }
    }
  }
  function completar() {
    let mudou = false;
    for (const k of KEYS) {
      const e = est[k]; if (e.done || !e.unlocked) continue;
      const vol = (pantWins[M[k].panteao] || 0) - e.volBase;
      const cur = alvoTipo(k) === 'companheiro' ? (streak[alvoChave(k)] || 0) : (pantStreak[alvoChave(k)] || 0);
      const seq = Math.max(0, cur - e.seqBase);
      if (vol >= M[k].vitoriasPanteao && seq >= seguidasDe(k)) { e.done = true; possui.add(k); mudou = true; }
    }
    return mudou;
  }
  reavaliarUnlocks();

  const feito = () => KEYS.every(k => est[k].done);
  const volRest = k => M[k].vitoriasPanteao - Math.max(0, (pantWins[M[k].panteao] || 0) - est[k].volBase);
  const seqCur = k => alvoTipo(k) === 'companheiro' ? (streak[alvoChave(k)] || 0) : (pantStreak[alvoChave(k)] || 0);
  const seqRest = k => seguidasDe(k) - Math.max(0, seqCur(k) - est[k].seqBase);
  let travas = 0;
  while (!feito() && jogos < 300000) {
    // ESTRATÉGIA REALISTA: um jogador esperto farma 3 PANTEÕES por partida (time misto → o volume conta para
    // os três) e, quando uma missão já tem o volume e falta só a SEQUÊNCIA, ancora o companheiro dela no time
    // (uma derrota já quebra qualquer sequência, então misturar os outros 2 slots é de graça). Assim as
    // sequências avançam em paralelo com o volume dos outros panteões — o ótimo do jogador.
    const inc = KEYS.filter(k => est[k].unlocked && !est[k].done);
    if (!inc.length) { const P = maisPromissor(); jogarUm(escolherTimePorPanteao(P)); travas++; if (travas > 200000) break; continue; }
    // ancoras de SEQUÊNCIA: missões cujo volume já está perto e falta a sequência → fixar o alvo no time
    const ancoras = [];
    for (const k of inc) if (volRest(k) <= 0 && seqRest(k) > 0) {
      const g = alvoTipo(k) === 'companheiro' ? alvoChave(k) : (godsDoPanteao(alvoChave(k), possui)[0]);
      if (g && possui.has(g) && !ancoras.includes(g)) ancoras.push(g);
    }
    // monta time: até 2 âncoras + preenche com deuses de panteões de MAIOR volume pendente (panteões distintos)
    const time = [];
    for (const g of ancoras) { if (time.length >= 3) break; time.push(g); }
    const pendPorPant = {}; for (const k of inc) pendPorPant[M[k].panteao] = (pendPorPant[M[k].panteao] || 0) + Math.max(0, volRest(k));
    const pantsOrd = Object.keys(pendPorPant).sort((a, b) => pendPorPant[b] - pendPorPant[a]);
    const jaPants = new Set(time.map(g => PANTE[g]));
    for (const P of pantsOrd) {
      if (time.length >= 3) break; if (jaPants.has(P)) continue;
      const g = godsDoPanteao(P, possui).find(x => !time.includes(x)); if (g) { time.push(g); jaPants.add(P); }
    }
    if (time.length < 3) for (const g of possui) { if (time.length >= 3) break; if (!time.includes(g)) time.push(g); }
    jogarUm(time);
  }

  function maisPromissor() {
    const cnt = {}; for (const k of KEYS) if (!est[k].done) cnt[M[k].panteao] = (cnt[M[k].panteao] || 0) + 1;
    let best = null, bv = -1; for (const P in cnt) if (cnt[P] > bv && godsDoPanteao(P, possui).length) { bv = cnt[P]; best = P; }
    return best || PANTE[[...possui][0]];
  }
  function escolherTimePorPanteao(P) {
    const t = godsDoPanteao(P, possui).slice(0, 3);
    for (const g of possui) { if (t.length >= 3) break; if (!t.includes(g)) t.push(g); }
    return t;
  }
  function jogarUm(time) {
    if (!time || !time.length) { jogos++; return; }
    jogos++;
    const venceu = rng() < (opts.pWin || pWin);
    // panteões presentes no time (para volume) e sequência por deus/panteão
    const pants = new Set(time.map(g => PANTE[g]));
    if (venceu) {
      pontos = Math.max(PT.piso || 0, pontos + (PT.vitoria || 0));
      for (const p of pants) pantWins[p] = (pantWins[p] || 0) + 1;
      for (const g of time) streak[g] = (streak[g] || 0) + 1;
      for (const p of pants) pantStreak[p] = (pantStreak[p] || 0) + 1;
    } else {
      pontos = Math.max(PT.piso || 0, pontos + (PT.derrota || 0));
      for (const g of time) streak[g] = 0;
      for (const p of pants) pantStreak[p] = 0;
    }
    reavaliarUnlocks();
    // ponto-fixo de conclusão (conceder um deus pode destravar o próximo na mesma passagem)
    let m = true; while (m) { m = completar(); if (m) reavaliarUnlocks(); }
  }

  return jogos;
}

// RNG determinística por trial (mulberry32)
function mulberry32(seed) { return function () { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

function rodar(opts) {
  const res = [];
  for (let i = 0; i < TRIALS; i++) res.push(umaTrial(mulberry32(0xA11CE + i * 2654435761), opts));
  res.sort((a, b) => a - b);
  return { mediana: res[Math.floor(res.length / 2)], media: Math.round(res.reduce((s, x) => s + x, 0) / res.length) };
}
const hrs = (g, min) => (g * min / 60).toFixed(0);
const meses = (g, min) => (g * min / 60 / 30).toFixed(1);

const base = { fromUnlock: true, allSeq: true, rankGate: true };
const CENAS = [
  ['§241 literal — rampa 3/4/5/6 (teto 6)', { ...base }],
  ['rampa mais suave 2/3/3/4 (teto 4)', { ...base, seqRamp: [2, 2, 3, 3, 3, 3, 4, 4] }],
  ['rampa 2/2/3/3 (teto 3)', { ...base, seqRamp: [2, 2, 2, 2, 3, 3, 3, 3] }],
  ['rampa 2 fixa (sequência simbólica)', { ...base, seqRamp: [2, 2, 2, 2, 2, 2, 2, 2] }],
  ['literal, mas jogador HÁBIL p=0.6', { ...base, pWin: 0.6 }],
  ['rampa 2/3/3/4 + p=0.6', { ...base, seqRamp: [2, 2, 3, 3, 3, 3, 4, 4], pWin: 0.6 }],
];
console.log(`SIMULAÇÃO §241 — ${TRIALS} trials. Mediana de partidas p/ completar as 91, e meses a 1h/dia (6/8 min).`);
console.log('ALVO: 2-3 meses = caçada · >12 meses = abandono (palavras do dono).\n');
console.log('cenário'.padEnd(42), 'p', 'mediana', ' 6min', ' 8min', ' meses(6/8)');
for (const [nome, opts] of CENAS) {
  const p = opts.pWin || pWin;
  const r = rodar({ ...opts, __p: p });
  console.log(nome.padEnd(42), p.toFixed(2), String(r.mediana).padStart(7), (hrs(r.mediana, 6) + 'h').padStart(6), (hrs(r.mediana, 8) + 'h').padStart(6),
    ('  ' + meses(r.mediana, 6) + '/' + meses(r.mediana, 8)).padStart(11));
}
