'use strict';
// FASE 6 / §231 — CALIBRAR OS VOLUMES pela ARENA (§202). Os volumes agora vêm da RARIDADE (SS 40 · S 20 ·
// A 15 vitórias com o panteão), então não há número a INVENTAR — o que se calibra é a FEASIBILIDADE:
// quão rápido cada PANTEÃO ganha sob a IA gulosa, e quantas partidas o volume implica. Reporta se algum
// ficou ABSURDO (um panteão que quase nunca ganha faria o volume levar partidas demais).
//
//   node tools/calibrar_missoes.js [rodadas]   (padrão 300) — anota data/missoes.json (não muda os volumes)

const fs = require('fs');
const path = require('path');
const E = require(path.join(__dirname, '..', 'src', 'engine.js'));
Object.assign(global, E);
const { iaProximaAcao } = require(path.join(__dirname, '..', 'src', 'ia.js'));
const { panteaoDe } = require(path.join(__dirname, '..', 'tools', 'gerar_missoes.js'));

const RODADAS = parseInt(process.argv[2], 10) || 300;
const keys = Object.keys(E.GODS);

function mulberry32(seed) { return function () { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function embaralhar(arr, r) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function jogar(A, B, seed, comeca) { const st = E.novoEstado(A, B, seed, comeca); let g = 0; while (!st.fim && g++ < 400) { let p = 0, a; while (!st.fim && (a = iaProximaAcao(st)) && p++ < 8) E.agir(st, a.uid, a.slot, a.alvos, a.escolhas); if (st.fim) break; E.fimTurno(st); } return st; }

// por PANTEÃO: partidas em que um time DAQUELE panteão jogou, e quantas esse time VENCEU (o volume conta
// "vitórias com o panteão"). winRate = vit/jogos. matchesParaN ≈ N / winRate (partidas até N vitórias).
const stat = {}; for (const k of keys) { const p = panteaoDe(k); if (!stat[p]) stat[p] = { jogos: 0, vit: 0 }; }
let partidas = 0;
for (let rodada = 0; rodada < RODADAS; rodada++) {
  const r = mulberry32(0x3000 + rodada * 2654435761);
  const ordem = embaralhar(keys, r);
  const times = []; for (let i = 0; i + 3 <= ordem.length; i += 3) times.push(ordem.slice(i, i + 3));
  let seed = rodada * 100000 + 1;
  for (let t = 0; t + 1 < times.length; t += 2) {
    const A = times[t], B = times[t + 1];
    const st = jogar(A, B, seed, seed % 2); seed++;
    if (!st.fim) continue; partidas++;
    const venc = st.fim.lado;
    for (const [lado, time] of [[0, A], [1, B]]) {
      const pants = new Set(time.map(panteaoDe));
      for (const p of pants) { stat[p].jogos++; if (lado === venc) stat[p].vit++; }
    }
  }
}

const VOL = { A: 15, S: 20, SS: 40 };
const linhas = [];
const absurdos = [];
for (const p of Object.keys(stat).sort()) {
  const s = stat[p]; const wr = s.jogos ? s.vit / s.jogos : 0;
  const mA = wr > 0 ? Math.round(VOL.A / wr) : Infinity;
  const mS = wr > 0 ? Math.round(VOL.S / wr) : Infinity;
  const mSS = wr > 0 ? Math.round(VOL.SS / wr) : Infinity;
  linhas.push({ panteao: p, jogos: s.jogos, winRate: +wr.toFixed(3), matchesA: mA, matchesS: mS, matchesSS: mSS });
  // "absurdo" = win rate tão baixo que o volume SS levaria > 400 partidas (ou o panteão nunca ganha).
  if (!(wr > 0) || mSS > 400) absurdos.push(`${p} (wr ${wr.toFixed(2)}, SS≈${mSS} partidas)`);
}

const doc = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'missoes.json'), 'utf8'));
doc.calibracao = { rodadas: RODADAS, partidas, quando: new Date().toISOString().slice(0, 10), volumes: VOL, feasibilidade: linhas, absurdos };
fs.writeFileSync(path.join(__dirname, '..', 'data', 'missoes.json'), JSON.stringify(doc, null, 1) + '\n');

console.log(`Calibração de FEASIBILIDADE: ${partidas} partidas em ${RODADAS} rodadas (IA gulosa).`);
console.log('panteão'.padEnd(12), 'winRate', ' A→part', ' S→part', 'SS→part');
for (const l of linhas) console.log(l.panteao.padEnd(12), String(l.winRate).padStart(6), String(l.matchesA).padStart(7), String(l.matchesS).padStart(7), String(l.matchesSS).padStart(7));
console.log(absurdos.length ? `\nVOLUMES ABSURDOS (${absurdos.length}): ${absurdos.join(' · ')}` : '\nNenhum volume absurdo: todo panteão ganha o bastante para o volume ser alcançável.');
console.log('(Nota: sob IA gulosa o win rate por panteão gira em torno de 50% por construção — os desvios apontam panteões fortes/fracos, o elo com a Fase 4.)');
