// ===================================================================
// §324 P1 — RÉGUA DE KITS sob a IA v2 (mede, NÃO muda kit).
//  forca : arena v2 (ambos os lados v2, times sorteados) → win-rate por deus (+IC) e USO por slot/partida.
//  slot  : SLOT MORTO — por deus, desliga UM slot por vez e mede a perda em jogos PAREADOS (common random
//          numbers): mesma batalha (G + 2 aliados sorteados vs 3 sorteados), baseline × slot-nulo. Ativo
//          (básico/habilidade/milagre) = PROIBIR a IA de escolher aquele slot do deus; passiva = tirar os
//          gatilhos (fx=[]). delta = P(vitória | baseline) − P(vitória | nulo). delta≈0 (IC cruza 0) = morto.
//
//   node tools/medir_kits.js forca [--rounds=200] [--slice=i/n] [--out=f]
//   node tools/medir_kits.js slot  [--M=100] [--alvos=a,b|--slice=i/n] [--out=f]
// Determinístico (mulberry32). Imprime/escreve JSON. Lotes: use --slice=i/n p/ paralelizar (1 core cada).
// ===================================================================
'use strict';
const fs = require('fs');
const path = require('path');
const E = require(path.join(__dirname, '..', 'src', 'engine.js'));
Object.assign(global, E);
const { iaProximaAcao } = require(path.join(__dirname, '..', 'src', 'ia.js'));

const arg = (n, d) => { const p = process.argv.find(a => a.startsWith('--' + n + '=')); return p ? p.split('=')[1] : d; };
const CMD = process.argv[2] || 'forca';
const OUT = arg('out', '');
const SLOTS = ['basico', 'habilidade', 'milagre'];
const keys = Object.keys(E.GODS).filter(k => (E.GODS[k].ab || []).length >= 3);   // jogáveis (3 ativas)
const NOME = k => E.GODS[k].nome || k;

function mulberry32(seed) { return function () { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function embaralhar(arr, r) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const VER = parseInt(arg('ia', '2'), 10) === 1 ? 1 : 2;   // --ia=1 mede sob a v1 gulosa (default v2)
const V2 = s => iaProximaAcao(s, 'normal', VER);

// joga uma partida; proibido = {uidSet, slot} (opcional) p/ vetar um slot de certas unidades. conta USO por key/slot.
function jogar(timeA, timeB, seed, comeca, catalogo, veto, statUso) {
  const st = E.novoEstado(timeA, timeB, seed, comeca, null, catalogo || E.catalogoAtivo());
  const uid2key = {}; for (const lado of st.lados) for (const u of lado.units) uid2key[u.uid] = u.key;
  let guard = 0, a;
  while (!st.fim && guard++ < 400) {
    let passos = 0;
    while (!st.fim && (a = V2(st)) && passos++ < 8) {
      if (veto && veto.uids.has(a.uid) && a.slot === veto.slot) break;   // slot vetado → a IA "não tem" aquele slot
      if (statUso) { const k = uid2key[a.uid]; if (k && statUso[k] && SLOTS.includes(a.slot)) statUso[k][a.slot]++; }
      E.agir(st, a.uid, a.slot, a.alvos || [], a.escolhas || null, a.modo || null);
    }
    if (st.fim) break;
    E.fimTurno(st);
  }
  return st;
}

// catálogo com a PASSIVA de um deus zerada (sem gatilhos) — demais deuses intactos (referência base).
function catSemPassiva(gkey) {
  const base = E.catalogoAtivo(); const out = {};
  for (const k in base) out[k] = k === gkey ? Object.assign({}, base[k], { passiva: Object.assign({}, base[k].passiva, { fx: [] }) }) : base[k];
  return out;
}

// ---------------- FORÇA + USO ----------------
function cmdForca() {
  const ROUNDS = parseInt(arg('rounds', '200'), 10);
  const [si, sn] = arg('slice', '1/1').split('/').map(Number);
  const stat = {}; const uso = {};
  for (const k of keys) { stat[k] = { jogos: 0, vit: 0, emp: 0, uso: { basico: 0, habilidade: 0, milagre: 0 } }; uso[k] = { basico: 0, habilidade: 0, milagre: 0 }; }
  let seedC = 1;
  for (let rodada = 0; rodada < ROUNDS; rodada++) {
    if ((rodada % sn) !== (si - 1)) { seedC += 20; continue; }   // fatia: só as rodadas desta fatia (seed estável)
    const r = mulberry32(0x1000 + rodada * 2654435761);
    const ordem = embaralhar(keys, r);
    const times = []; for (let i = 0; i + 3 <= ordem.length; i += 3) times.push(ordem.slice(i, i + 3));
    for (let t = 0; t + 1 < times.length; t += 2) {
      const A = times[t], B = times[t + 1], comeca = seedC % 2;
      const st = jogar(A, B, seedC++, comeca, null, null, uso);
      const membros = [...A.map(k => [k, 0]), ...B.map(k => [k, 1])];
      if (!st.fim) continue;
      if (st.fim.resultado === 'empate') { for (const [k] of membros) { stat[k].jogos++; stat[k].emp++; } }
      else { const v = st.fim.lado; for (const [k, l] of membros) { stat[k].jogos++; if (l === v) stat[k].vit++; } }
    }
  }
  for (const k of keys) stat[k].uso = uso[k];   // contagem bruta de uso por slot (dividir por jogos na análise)
  const res = { cmd: 'forca', rounds: ROUNDS, slice: [si, sn], stat };
  if (OUT) fs.writeFileSync(OUT, JSON.stringify(res)); else console.log(JSON.stringify(res));
}

// ---------------- SLOT MORTO (pareado) ----------------
function cmdSlot() {
  const M = parseInt(arg('M', '100'), 10);
  const [si, sn] = arg('slice', '1/1').split('/').map(Number);
  let alvos = arg('alvos', '') ? arg('alvos').split(',') : keys.filter((_, idx) => (idx % sn) === (si - 1));
  const out = {};
  for (const G of alvos) {
    if (!E.GODS[G]) continue;
    const rec = { nome: NOME(G), M: 0, base: 0, uso: { basico: 0, habilidade: 0, milagre: 0 }, delta: {} };
    const nulos = ['passiva', 'basico', 'habilidade', 'milagre'];
    const win = { base: 0, passiva: 0, basico: 0, habilidade: 0, milagre: 0 };
    const r = mulberry32(0xBEEF + hash(G));
    const uso = { basico: 0, habilidade: 0, milagre: 0 };
    for (let m = 0; m < M; m++) {
      // sorteia 2 aliados + 3 inimigos (≠ G, distintos), seed e comeca
      const pool = keys.filter(k => k !== G);
      const pick = embaralhar(pool, r).slice(0, 5);
      const A = [G, pick[0], pick[1]], B = [pick[2], pick[3], pick[4]];
      const seed = (hash(G) ^ (m * 2654435761)) >>> 0 || 1, comeca = m % 2;
      const uidsG = st => { const s = new Set(); for (const u of st.lados[0].units) if (u.key === G) s.add(u.uid); return s; };
      // baseline (conta USO de G)
      const stB = E.novoEstado(A, B, seed, comeca, null, E.catalogoAtivo());
      venceu(stB, null, { [G]: uso }) && win.base++;
      // slots ativos: veto; passiva: catálogo sem passiva
      for (const slot of SLOTS) { const st = E.novoEstado(A, B, seed, comeca, null, E.catalogoAtivo()); if (venceuVeto(st, A, G, slot)) win[slot]++; }
      { const st = E.novoEstado(A, B, seed, comeca, null, catSemPassiva(G)); if (venceu(st, null, null)) win.passiva++; }
      rec.M++;
    }
    rec.base = win.base;
    rec.uso = { basico: +(uso.basico / M).toFixed(3), habilidade: +(uso.habilidade / M).toFixed(3), milagre: +(uso.milagre / M).toFixed(3) };
    for (const s of nulos) rec.delta[s] = +((win.base - win[s]) / M).toFixed(4);   // queda de win-rate ao desligar s
    rec.winCounts = win;
    out[G] = rec;
    process.stderr.write(`  ${G}: base ${win.base}/${M} · Δpas ${rec.delta.passiva} Δbás ${rec.delta.basico} Δhab ${rec.delta.habilidade} Δmil ${rec.delta.milagre}\n`);
  }
  const res = { cmd: 'slot', M, slice: [si, sn], out };
  if (OUT) fs.writeFileSync(OUT, JSON.stringify(res)); else console.log(JSON.stringify(res));
}
function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
// joga do estado montado; retorna true se lado 0 venceu. statUso opcional conta USO por key.
function venceu(st, veto, statUso) {
  let guard = 0, a;
  while (!st.fim && guard++ < 400) {
    let p = 0;
    while (!st.fim && (a = V2(st)) && p++ < 8) {
      if (veto && veto.uids.has(a.uid) && a.slot === veto.slot) break;
      if (statUso) { const k = uidKey(st, a.uid); if (k && statUso[k] && SLOTS.includes(a.slot)) statUso[k][a.slot]++; }
      E.agir(st, a.uid, a.slot, a.alvos || [], a.escolhas || null, a.modo || null);
    }
    if (st.fim) break; E.fimTurno(st);
  }
  return !!(st.fim && st.fim.resultado === 'vitoria' && st.fim.lado === 0);
}
function venceuVeto(st, teamA, G, slot) {
  const uids = new Set(); for (const u of st.lados[0].units) if (u.key === G) uids.add(u.uid);
  return venceu(st, { uids, slot }, null);
}
function uidKey(st, uid) { for (const l of st.lados) for (const u of l.units) if (u.uid === uid) return u.key; return null; }

if (CMD === 'forca') cmdForca(); else if (CMD === 'slot') cmdSlot(); else { console.error('cmd? forca|slot'); process.exit(1); }
