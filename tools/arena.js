// ===================================================================
// INCURSION x3 Battle — ARENA (leitura de balanceamento)
// IA gulosa × IA gulosa sobre o ROSTER COMPLETO (100 deuses).
// Existe desde a F1.4; esta é a primeira corrida com os 100.
//
// Amostragem: em cada RODADA, embaralha os 100 deuses (Fisher-Yates
// com PRNG semeado — determinístico, sem Math.random), forma times de
// 3 e emparelha times adjacentes. O `comeca` alterna por partida para
// cancelar a vantagem do primeiro lance. Sobre R rodadas cada deus joga
// ~R partidas, com companheiros e adversários variados.
//
// NÃO altera o motor. Mede o que a IA de 1 lance (a mesma dos testes)
// FAZ quando os kits jogam uns contra os outros. É um proxy de
// balanceamento — o win-rate de um deus é influenciado pelos
// companheiros do time; sobre muitas partidas isso se dilui.
//
//   node tools/arena.js [rodadas]     (padrão 200)
// ===================================================================

const path = require('path');
const E = require(path.join(__dirname, '..', 'src', 'engine.js'));
Object.assign(global, E);
const { iaProximaAcao } = require(path.join(__dirname, '..', 'src', 'ia.js'));

const RODADAS = parseInt(process.argv[2], 10) || 200;

// PRNG semeado (mulberry32) — determinístico, replay estável.
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function embaralhar(arr, r) {                 // Fisher-Yates com PRNG
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

const keys = Object.keys(E.GODS);
const NOME = k => E.GODS[k].nome || k;
const SLOTS = ['basico', 'habilidade', 'milagre'];   // defesa é excluída pela IA por construção (ia.js)

// acumuladores por deus
const stat = {};
for (const k of keys) stat[k] = { jogos: 0, vit: 0, der: 0, emp: 0, usou: { basico: 0, habilidade: 0, milagre: 0 } };

let totalPartidas = 0, somaTurnos = 0, semDesfecho = 0, empates = 0;
const durHist = {};   // turno -> contagem

function jogarPartida(timeA, timeB, seed, comeca) {
  const st = E.novoEstado(timeA, timeB, seed, comeca);
  const uid2key = {};
  for (const lado of st.lados) for (const u of lado.units) uid2key[u.uid] = u.key;
  let guard = 0;
  while (!st.fim && guard++ < 400) {
    let passos = 0, a;
    while (!st.fim && (a = iaProximaAcao(st)) && passos++ < 8) {
      const k = uid2key[a.uid];
      if (k && stat[k] && SLOTS.includes(a.slot)) stat[k].usou[a.slot]++;
      E.agir(st, a.uid, a.slot, a.alvos, a.escolhas);
    }
    if (st.fim) break;
    E.fimTurno(st);
  }
  return st;
}

const rBase = mulberry32(0xC0FFEE);
let seedContador = 1;

for (let rodada = 0; rodada < RODADAS; rodada++) {
  const r = mulberry32(0x1000 + rodada * 2654435761);   // PRNG por rodada, derivado
  const ordem = embaralhar(keys, r);
  const times = [];
  for (let i = 0; i + 3 <= ordem.length; i += 3) times.push(ordem.slice(i, i + 3));   // 33 times (1 sobra)
  for (let t = 0; t + 1 < times.length; t += 2) {                                     // pares adjacentes
    const A = times[t], B = times[t + 1];
    const comeca = seedContador % 2;                 // alterna o starter
    const st = jogarPartida(A, B, seedContador++, comeca);
    totalPartidas++;
    const membros = [...A.map(k => [k, 0]), ...B.map(k => [k, 1])];
    if (!st.fim) { semDesfecho++; continue; }
    somaTurnos += st.turno;
    durHist[st.turno] = (durHist[st.turno] || 0) + 1;
    if (st.fim.resultado === 'empate') {
      empates++;
      for (const [k] of membros) { stat[k].jogos++; stat[k].emp++; }
    } else {
      const venc = st.fim.lado;
      for (const [k, lado] of membros) { stat[k].jogos++; if (lado === venc) stat[k].vit++; else stat[k].der++; }
    }
  }
}

// ---------- RELATÓRIO ----------
const linha = '─'.repeat(64);
console.log(linha);
console.log(`ARENA — ${RODADAS} rodadas · ${totalPartidas} partidas · roster ${keys.length} deuses`);
console.log(linha);

// win-rate por deus
const linhas = keys.map(k => {
  const s = stat[k];
  const wr = s.jogos ? s.vit / s.jogos : 0;
  return { k, nome: NOME(k), jogos: s.jogos, vit: s.vit, der: s.der, emp: s.emp, wr, usou: s.usou };
});
const wrs = linhas.map(l => l.wr);
const media = wrs.reduce((a, b) => a + b, 0) / wrs.length;
const dp = Math.sqrt(wrs.reduce((a, b) => a + (b - media) ** 2, 0) / wrs.length);

console.log(`\nDURAÇÃO: média ${(somaTurnos / (totalPartidas - semDesfecho)).toFixed(1)} turnos · empates(turno 40) ${empates} (${(100 * empates / totalPartidas).toFixed(1)}%) · sem desfecho ${semDesfecho}`);
console.log(`WIN-RATE: média ${(100 * media).toFixed(1)}% · desvio-padrão ${(100 * dp).toFixed(1)} pts · jogos/deus ~${Math.round(linhas.reduce((a, l) => a + l.jogos, 0) / keys.length)}`);
const sePct = 100 * Math.sqrt(0.25 / (linhas.reduce((a, l) => a + l.jogos, 0) / keys.length));
console.log(`(erro-padrão de um win-rate 50%: ~${sePct.toFixed(1)} pts — diferenças menores que isso são ruído)`);

// histograma de win-rate
console.log('\nHISTOGRAMA DE WIN-RATE (deuses por faixa de 5 pts):');
const buckets = {};
for (const l of linhas) { const b = Math.min(19, Math.floor(l.wr * 20)); buckets[b] = (buckets[b] || 0) + 1; }
for (let b = 0; b < 20; b++) {
  const n = buckets[b] || 0; if (!n && (b * 5 < 20 || b * 5 > 80)) continue;
  const lo = (b * 5).toString().padStart(2), hi = (b * 5 + 5).toString().padStart(2);
  console.log(`  ${lo}-${hi}% │${'█'.repeat(n)} ${n}`);
}

// ranking completo
const ord = linhas.slice().sort((a, b) => b.wr - a.wr);
console.log('\nRANKING COMPLETO (win-rate ↓):');
ord.forEach((l, i) => {
  const flag = l.wr > media + 1.5 * dp ? ' ▲FORA' : l.wr < media - 1.5 * dp ? ' ▼FORA' : '';
  console.log(`  ${(i + 1).toString().padStart(3)}. ${l.nome.padEnd(16)} ${(100 * l.wr).toFixed(1).padStart(5)}%  (${l.vit}V ${l.der}D ${l.emp}E / ${l.jogos})${flag}`);
});

// fora da curva
const alto = ord.filter(l => l.wr > media + 1.5 * dp);
const baixo = ord.filter(l => l.wr < media - 1.5 * dp);
console.log(`\nFORA DA CURVA (> ±1.5 desvios da média = fora de [${(100 * (media - 1.5 * dp)).toFixed(1)}%, ${(100 * (media + 1.5 * dp)).toFixed(1)}%]):`);
console.log(`  ACIMA (${alto.length}): ${alto.map(l => `${l.nome} ${(100 * l.wr).toFixed(0)}%`).join(' · ') || 'nenhum'}`);
console.log(`  ABAIXO (${baixo.length}): ${baixo.map(l => `${l.nome} ${(100 * l.wr).toFixed(0)}%`).join(' · ') || 'nenhum'}`);

// habilidades nunca usadas pela IA gulosa
console.log('\nHABILIDADES QUE O AGENTE GULOSO NUNCA USOU (defesa é excluída por construção):');
const nunca = [];
for (const l of linhas) {
  const zero = SLOTS.filter(s => l.usou[s] === 0);
  if (zero.length) nunca.push({ nome: l.nome, zero, jogos: l.jogos });
}
if (!nunca.length) console.log('  nenhuma — os 3 slots (básico/habilidade/milagre) foram todos escolhidos ao menos uma vez');
else for (const n of nunca) console.log(`  ${n.nome.padEnd(16)} nunca usou: ${n.zero.join(', ')}  (${n.jogos} jogos)`);

console.log('\n' + linha);
