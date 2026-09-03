'use strict';
// FASE 6 / §229 — CALIBRAR OS ALVOS DOS FEITOS pela ARENA (§202: derivar por MEDIÇÃO, não chutar).
// Roda IA-gulosa × IA-gulosa (o mesmo proxy da tools/arena.js) sobre o roster; a cada partida MEDE, com
// o MESMO leitor do servidor (missoes.medir), quanto cada deus produz da sua métrica-assinatura no seu
// lado. O alvo do feito = o que ~K partidas SÓLIDAS entregam (K=5) — um alvo que a arena confirma
// alcançável. Famílias que a IA gulosa NÃO exercita (passivas de reflexo/intercepta/anti-revive — os
// "slots mortos" do §189/F4) medem ~0: recebem alvo-PISO e ficam MARCADAS, ligando F6 a F4.
//
//   node tools/calibrar_missoes.js [rodadas]   (padrão 300) — reescreve data/missoes.json

const fs = require('fs');
const path = require('path');
const E = require(path.join(__dirname, '..', 'src', 'engine.js'));
Object.assign(global, E);
const { iaProximaAcao } = require(path.join(__dirname, '..', 'src', 'ia.js'));
const FAM = require(path.join(__dirname, '..', 'src', 'missoes_familias.js'));
const missoes = require(path.join(__dirname, '..', 'server', 'missoes.js'));

const RODADAS = parseInt(process.argv[2], 10) || 300;
const K_PARTIDAS = 5;    // o feito ≈ o rendimento de ~5 partidas sólidas com a assinatura
const PISO = { curaFeita: 50, danoDireto: 100, danoArea: 60, danoDot: 40, danoRefletido: 20, danoAbsorvido: 40, contadoresGanhos: 3, controlesAplicados: 3, orbesRoubados: 3, execucoes: 1, revives: 1, revivesNegados: 1, interceptacoes: 1, turnosCampo: 2, buffsRemovidos: 2 };

function mulberry32(seed) { return function () { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function embaralhar(arr, r) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

const keys = Object.keys(E.GODS);
const SIG = {}; for (const k of keys) SIG[k] = FAM.assinatura(E.GODS[k]);

function jogar(timeA, timeB, seed, comeca) {
  const st = E.novoEstado(timeA, timeB, seed, comeca);
  let guard = 0;
  while (!st.fim && guard++ < 400) {
    let passos = 0, a;
    while (!st.fim && (a = iaProximaAcao(st)) && passos++ < 8) E.agir(st, a.uid, a.slot, a.alvos, a.escolhas);
    if (st.fim) break;
    E.fimTurno(st);
  }
  return st;
}

// acumula, por deus, a soma da sua métrica-assinatura e o nº de partidas em que jogou.
const acc = {}; for (const k of keys) acc[k] = { soma: 0, jogos: 0 };
let partidas = 0;
for (let rodada = 0; rodada < RODADAS; rodada++) {
  const r = mulberry32(0x2000 + rodada * 2654435761);
  const ordem = embaralhar(keys, r);
  const times = [];
  for (let i = 0; i + 3 <= ordem.length; i += 3) times.push(ordem.slice(i, i + 3));
  let seed = rodada * 100000 + 1;
  for (let t = 0; t + 1 < times.length; t += 2) {
    const A = times[t], B = times[t + 1];
    const st = jogar(A, B, seed, seed % 2); seed++;
    if (!st.fim) continue;
    partidas++;
    const med = missoes.medir(st, A, B);   // { 0:{metrica:val}, 1:{…} }
    for (const [lado, time] of [[0, A], [1, B]]) for (const k of time) { acc[k].jogos++; const m = SIG[k].metrica; acc[k].soma += (med[lado] || {})[m] || 0; }
  }
}

// deriva o alvo: perMatch × K, arredondado "bonito"; piso por família; marca os ~0 (slot morto).
function arredonda(v) { if (v <= 10) return Math.max(1, Math.round(v)); if (v <= 100) return Math.round(v / 5) * 5; if (v <= 1000) return Math.round(v / 25) * 25; return Math.round(v / 50) * 50; }
const doc = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'missoes.json'), 'utf8'));
const mortos = [];
for (const k of Object.keys(doc.missoes)) {
  const m = doc.missoes[k]; const metrica = m.feito.metrica;
  const a = acc[k]; const perMatch = a.jogos ? a.soma / a.jogos : 0;
  let alvo = arredonda(perMatch * K_PARTIDAS);
  const piso = PISO[metrica] || 1;
  let slotMorto = false;
  if (perMatch < (piso / K_PARTIDAS) * 0.5 || alvo < piso) { alvo = piso; slotMorto = true; mortos.push(`${k}(${m.familia}/${metrica})`); }
  m.feito.alvo = alvo;
  m.feito.perMatch = Math.round(perMatch * 100) / 100;
  m.feito.calibrado = true;
  if (slotMorto) m.feito.slotMorto = true; else delete m.feito.slotMorto;
}
doc.calibracao = { rodadas: RODADAS, partidas, kPartidas: K_PARTIDAS, quando: new Date().toISOString().slice(0, 10), slotsMortos: mortos.length };
fs.writeFileSync(path.join(__dirname, '..', 'data', 'missoes.json'), JSON.stringify(doc, null, 1) + '\n');

console.log(`Calibrado: ${partidas} partidas em ${RODADAS} rodadas. K=${K_PARTIDAS}.`);
console.log(`Slots mortos (IA gulosa não exercita — §189/F4): ${mortos.length}`);
if (mortos.length) console.log('  ' + mortos.join(' '));
// resumo por família
const porFam = {};
for (const k of Object.keys(doc.missoes)) { const m = doc.missoes[k]; (porFam[m.familia] = porFam[m.familia] || []).push(m.feito.alvo); }
for (const f of Object.keys(porFam).sort()) { const xs = porFam[f]; console.log(`  ${f.padEnd(14)} n=${xs.length} alvos ${Math.min(...xs)}…${Math.max(...xs)}`); }
