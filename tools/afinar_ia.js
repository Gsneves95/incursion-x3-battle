// ===================================================================
// INCURSION x3 Battle — AFINAÇÃO DA IA "papel" (§322 Parte 2)
// Busca os pesos de pontuarPapel (tools/ia_proto.js) por SUBIDA COORDENADA (um peso por vez), medindo a
// FORÇA (candidata × IA atual, espelho sorteado) num conjunto de TREINO, e CONFIRMA o melhor num conjunto
// SEPARADO (sementes que a busca nunca viu) — anti-sobreajuste. Determinístico: mesmas sementes em toda a
// busca (common random numbers — o que muda entre avaliações é só o peso, não a sorte).
//
//   node tools/afinar_ia.js [--treino=40] [--conf=240] [--passes=2] [--M=8]
//   node tools/afinar_ia.js --so-confirma --W='{"exec":0.6,...}'   (mede um W dado, treino+confirma)
// Imprime o melhor W (JSON) para colar como constantes da IA v2 (se os alvos baterem).
// ===================================================================
'use strict';
const path = require('path');
const E = require(path.join(__dirname, '..', 'src', 'engine.js'));
Object.assign(global, E);
const { iaProximaAcao } = require(path.join(__dirname, '..', 'src', 'ia.js'));
const { makePapel, DEFAULT_W, pontuarPapel } = require(path.join(__dirname, 'ia_proto.js'));

const keys = Object.keys(E.GODS);
const arg = (n, d) => { const p = process.argv.find(a => a.startsWith('--' + n + '=')); return p ? p.split('=')[1] : d; };
const tem = n => process.argv.includes('--' + n);

function mulberry32(seed) { return function () { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function composicoes(n, semente) {
  const pool = keys.filter(k => (E.GODS[k].ab || []).length >= 3);
  const r = mulberry32(semente), out = [];
  for (let i = 0; i < n; i++) { const a = pool[Math.floor(r() * pool.length)]; let b = pool[Math.floor(r() * pool.length)], g = 0; while (b === a && g++ < 20) b = pool[Math.floor(r() * pool.length)]; let c = pool[Math.floor(r() * pool.length)], g2 = 0; while ((c === a || c === b) && g2++ < 20) c = pool[Math.floor(r() * pool.length)]; out.push([a, b, c]); }
  return out;
}
// uma partida espelho: ladoCand controla um lado com proxCand, o outro com a IA atual. 1 = candidata venceu.
function duelo(time, seed, comeca, ladoCand, proxCand) {
  const st = E.novoEstado(time.slice(), time.slice(), seed, comeca);
  let guard = 0, a;
  while (!st.fim && guard++ < 400) {
    const prox = st.ativo === ladoCand ? proxCand : (s => iaProximaAcao(s, 'normal'));
    let passos = 0;
    while (!st.fim && (a = prox(st)) && passos++ < 8) E.agir(st, a.uid, a.slot, a.alvos, a.escolhas);
    if (st.fim) break; E.fimTurno(st);
  }
  if (!st.fim || st.fim.resultado === 'empate') return 0.5;
  return st.fim.lado === ladoCand ? 1 : 0;
}
// FORÇA de W num conjunto de composições (CRN: as sementes dependem só de (ci,i), não do W).
function forca(W, comps, M) {
  const prox = makePapel(W); let pontos = 0, tot = 0, venc = 0, emp = 0;
  for (let ci = 0; ci < comps.length; ci++) for (let i = 0; i < M; i++) {
    const ladoCand = i % 2, comeca = (i >> 1) % 2, seed = ci * 100003 + i + 1;
    const r = duelo(comps[ci], seed, comeca, ladoCand, prox); pontos += r; tot++; if (r === 1) venc++; else if (r === 0.5) emp++;
  }
  return { p: pontos / tot, venc, emp, tot };
}
function wilson(p, n) { const z = 1.96, d = 1 + z * z / n, c = (p + z * z / (2 * n)) / d, m = (z * Math.sqrt(p * (1 - p) / n + z * z / (4 * n * n))) / d; return { lo: c - m, hi: c + m }; }
const pc = x => (100 * x).toFixed(1) + '%';

const TREINO = parseInt(arg('treino', '40'), 10);
const CONF = parseInt(arg('conf', '240'), 10);
const M = parseInt(arg('M', '8'), 10);
const PASSES = parseInt(arg('passes', '2'), 10);
const SEEDT = parseInt(arg('seedT', '0xA11CE'), 16) || 0xA11CE;   // semente da família de TREINO
const SEEDC = parseInt(arg('seedC', '0xC0FFEE2'), 16) || 0xC0FFEE2;   // semente da família de CONFIRMAÇÃO (disjunta)
const compsTreino = composicoes(TREINO, SEEDT);
const compsConf = composicoes(CONF, SEEDC);

// grade de busca (pesos de alta alavancagem; os demais ficam no DEFAULT_W). Faixas alargadas onde o ótimo
// da 1ª rodada bateu na borda (controle, dmgDownIni, execLimiar, buffOff).
const GRADE = {
  exec: [0.3, 0.6, 0.9, 1.3],
  execLimiar: [30, 34, 40, 48],
  controle: [8, 12, 18, 26],
  provoca: [0.3, 0.6, 1.0, 1.6],
  vulneravel: [0.6, 0.9, 1.3],
  buffOff: [0, 0.2, 0.4],
  hpInimigo: [1.0, 1.1, 1.2],
  dmgDownIni: [0.6, 0.8, 1.1, 1.5],
  reducao: [0.4, 0.6, 0.9],
};

console.log('=== §322 Parte 2 — AFINAÇÃO da IA papel (subida coordenada, CRN) ===');
console.log(`treino: ${TREINO} comps × ${M}×espelho = ${TREINO * M} partidas/avaliação · confirmação: ${CONF} comps × ${M} = ${CONF * M}`);

if (tem('so-confirma')) {
  const W = Object.assign({}, DEFAULT_W, JSON.parse(arg('W', '{}')));
  const t = forca(W, compsTreino, M), c = forca(W, compsConf, M);
  const wc = wilson(c.p, c.tot);
  console.log('W =', JSON.stringify(W));
  console.log(`TREINO: ${pc(t.p)}  ·  CONFIRMAÇÃO: ${pc(c.p)}  IC95 [${pc(wc.lo)}, ${pc(wc.hi)}]`);
  process.exit(0);
}

let best = Object.assign({}, DEFAULT_W, JSON.parse(arg('W', '{}')));   // --W= aquece a busca de um ponto dado
// arranque: ligar exec/provoca num valor plausível antes da busca (se não vieram no --W)
if (!('exec' in JSON.parse(arg('W', '{}')))) best.exec = 0.6;
if (!('provoca' in JSON.parse(arg('W', '{}')))) best.provoca = 0.6;
let bestP = forca(best, compsTreino, M).p;
console.log(`arranque (treino): ${pc(bestP)}`);
const t0 = Date.now();
for (let pass = 0; pass < PASSES; pass++) {
  console.log(`\n--- passe ${pass + 1}/${PASSES} ---`);
  for (const w of Object.keys(GRADE)) {
    let localBest = best[w], localP = bestP;
    for (const v of GRADE[w]) {
      if (v === best[w]) continue;
      const cand = Object.assign({}, best, { [w]: v });
      const p = forca(cand, compsTreino, M).p;
      if (p > localP + 1e-9) { localP = p; localBest = v; }
    }
    if (localBest !== best[w]) { console.log(`  ${w}: ${best[w]} → ${localBest}   (treino ${pc(bestP)} → ${pc(localP)})`); best[w] = localBest; bestP = localP; }
    else console.log(`  ${w}: mantém ${best[w]} (treino ${pc(bestP)})`);
  }
}
const dt = (Date.now() - t0) / 1000;
console.log(`\nbusca em ${dt.toFixed(0)}s · melhor no TREINO: ${pc(bestP)}`);

// CONFIRMAÇÃO no conjunto separado (grande)
const c = forca(best, compsConf, M), wc = wilson(c.p, c.tot);
console.log('\n=== CONFIRMAÇÃO (sementes que a busca nunca viu) ===');
console.log('W afinado =', JSON.stringify(best));
console.log(`FORÇA confirmação: ${pc(c.p)}  (${c.venc}V ${c.emp}E / ${c.tot})  IC95 [${pc(wc.lo)}, ${pc(wc.hi)}]`);
const bate = c.p >= 0.58 && wc.lo > 0.55;
console.log(bate ? '✓ ALVO ATINGIDO (≥58% e limite inferior >55%)' : '✗ alvo NÃO atingido (quer ≥58% e IC-inf >55%)');
