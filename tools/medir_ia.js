// ===================================================================
// INCURSION x3 Battle — MEDIÇÃO DAS IAs (§322 PARTE 1)
// Compara a IA do jogo (src/ia.js 'normal') com as candidatas de tools/ia_proto.js nos 3 critérios do §322:
//   USO   — quantas habilidades e milagres dos 100 deuses ficam com uso < 0,1 por partida (arena espelho
//           do roster; a MESMA amostragem da tools/arena.js, determinística).
//   FORÇA — a candidata × a IA atual, times sorteados em ESPELHO (o mesmo trio dos dois lados), alternando
//           lado e quem começa; taxa de vitória da candidata.
//   CUSTO — tempo por DECISÃO (ms) no Node; estimativa no celular (×5) e no replay por partida.
// NÃO altera o motor nem a IA do jogo. Só mede.
//
//   node tools/medir_ia.js uso   [--ai=atual|papel|ply2|combo] [--rodadas=60]
//   node tools/medir_ia.js forca [--ai=papel|ply2|combo] [--n=400]
//   node tools/medir_ia.js custo [--rodadas=20]
//   node tools/medir_ia.js tudo  [--ai=combo] [--rodadas=60] [--n=400]
// ===================================================================
'use strict';
const path = require('path');
const E = require(path.join(__dirname, '..', 'src', 'engine.js'));
Object.assign(global, E);
const { iaProximaAcao } = require(path.join(__dirname, '..', 'src', 'ia.js'));
const { PROTOS } = require(path.join(__dirname, 'ia_proto.js'));

const keys = Object.keys(E.GODS);
const NOME = k => E.GODS[k].nome || k;
const SLOTS = ['basico', 'habilidade', 'milagre'];
const arg = (n, d) => { const p = process.argv.find(a => a.startsWith('--' + n + '=')); return p ? p.split('=')[1] : d; };
const CMD = process.argv[2] || 'tudo';
const LIMIAR = 0.1;   // "uso < 0,1 por partida"

const decisor = nome => nome === 'atual' ? (st => iaProximaAcao(st, 'normal')) : (PROTOS[nome] || null);

// PRNG semeado (mulberry32) — determinístico.
function mulberry32(seed) { return function () { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function embaralhar(arr, r) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

// ---- USO: arena do roster (ambos os lados usam a MESMA candidata), conta uso/partida por deus+slot ----
function medirUso(nomeAI, rodadas) {
  const prox = decisor(nomeAI); if (!prox) throw new Error('IA desconhecida: ' + nomeAI);
  const stat = {}; for (const k of keys) stat[k] = { jogos: 0, usou: { basico: 0, habilidade: 0, milagre: 0 } };
  let partidas = 0, decisoes = 0, somaTurnos = 0, semFim = 0;
  for (let rod = 0; rod < rodadas; rod++) {
    const r = mulberry32(0x1000 + rod * 2654435761);
    const ordem = embaralhar(keys, r), times = [];
    for (let i = 0; i + 3 <= ordem.length; i += 3) times.push(ordem.slice(i, i + 3));
    for (let t = 0; t + 1 < times.length; t += 2) {
      const A = times[t], B = times[t + 1], comeca = (partidas) % 2;
      const st = E.novoEstado(A, B, partidas + 1, comeca);
      const uid2key = {}; for (const l of st.lados) for (const u of l.units) uid2key[u.uid] = u.key;
      let guard = 0, a;
      while (!st.fim && guard++ < 400) {
        let passos = 0;
        while (!st.fim && (a = prox(st)) && passos++ < 8) {
          decisoes++; const k = uid2key[a.uid];
          if (k && stat[k] && SLOTS.includes(a.slot)) stat[k].usou[a.slot]++;
          E.agir(st, a.uid, a.slot, a.alvos, a.escolhas);
        }
        if (st.fim) break; E.fimTurno(st);
      }
      partidas++;
      for (const k of [...A, ...B]) stat[k].jogos++;
      if (st.fim) somaTurnos += st.turno; else semFim++;
    }
  }
  // uso/partida por deus = usos / jogos desse deus
  const raros = { habilidade: [], milagre: [] };
  for (const k of keys) {
    const s = stat[k]; if (!s.jogos) continue;
    for (const slot of ['habilidade', 'milagre']) {
      const pp = s.usou[slot] / s.jogos;
      if (pp < LIMIAR) raros[slot].push({ k, nome: NOME(k), pp });
    }
  }
  return { partidas, decisoes, somaTurnos, semFim, stat, raros };
}

// ---- FORÇA: candidata × atual em ESPELHO sorteado (mesmo trio dos dois lados) ----
function composicoes(n, semente) {
  const pool = keys.filter(k => (E.GODS[k].ab || []).length >= 3);
  const r = mulberry32(semente), out = [];
  for (let i = 0; i < n; i++) { const a = pool[Math.floor(r() * pool.length)]; let b = pool[Math.floor(r() * pool.length)], g = 0; while (b === a && g++ < 20) b = pool[Math.floor(r() * pool.length)]; let c = pool[Math.floor(r() * pool.length)], g2 = 0; while ((c === a || c === b) && g2++ < 20) c = pool[Math.floor(r() * pool.length)]; out.push([a, b, c]); }
  return out;
}
// uma partida: ladoCand controla um lado com a candidata, o outro com a atual. Devolve 1 se a candidata vence.
function duelo(time, seed, comeca, ladoCand, proxCand) {
  const st = E.novoEstado(time.slice(), time.slice(), seed, comeca);
  let guard = 0, a;
  while (!st.fim && guard++ < 400) {
    const prox = st.ativo === ladoCand ? proxCand : (s => iaProximaAcao(s, 'normal'));
    let passos = 0;
    while (!st.fim && (a = prox(st)) && passos++ < 8) E.agir(st, a.uid, a.slot, a.alvos, a.escolhas);
    if (st.fim) break; E.fimTurno(st);
  }
  if (!st.fim || st.fim.resultado === 'empate') return 0.5;   // empate = meio ponto (não enviesa)
  return st.fim.lado === ladoCand ? 1 : 0;
}
function medirForca(nomeAI, N) {
  const proxCand = decisor(nomeAI); if (!proxCand || nomeAI === 'atual') throw new Error('escolha uma candidata (papel|ply2|combo)');
  const comps = composicoes(Math.max(10, Math.round(N / 8)), 20240322);
  const M = Math.max(2, Math.round(N / comps.length)); // partidas por composição
  let venc = 0, emp = 0, tot = 0;
  for (let ci = 0; ci < comps.length; ci++) {
    for (let i = 0; i < M; i++) {
      const ladoCand = i % 2, comeca = (i >> 1) % 2, seed = ci * 100003 + i + 1;
      const r = duelo(comps[ci], seed, comeca, ladoCand, proxCand);
      if (r === 1) venc++; else if (r === 0.5) emp++;
      tot++;
    }
  }
  return { venc, emp, tot, comps: comps.length, M, p: (venc + 0.5 * emp) / tot };
}

// ---- CUSTO: tempo por decisão (ms) de cada IA, no MESMO fluxo de partidas ----
function medirCusto(rodadas) {
  const nomes = ['atual', 'papel', 'ply2', 'combo'];
  const res = {};
  for (const nome of nomes) {
    const prox = decisor(nome); let decisoes = 0; const t0 = process.hrtime.bigint();
    for (let rod = 0; rod < rodadas; rod++) {
      const r = mulberry32(0x55 + rod * 2654435761), ordem = embaralhar(keys, r), times = [];
      for (let i = 0; i + 3 <= ordem.length; i += 3) times.push(ordem.slice(i, i + 3));
      for (let t = 0; t + 1 < times.length; t += 2) {
        const st = E.novoEstado(times[t], times[t + 1], rod * 1000 + t + 1, (t) % 2);
        let guard = 0, a;
        while (!st.fim && guard++ < 400) { let p = 0; while (!st.fim && (a = prox(st)) && p++ < 8) { decisoes++; E.agir(st, a.uid, a.slot, a.alvos, a.escolhas); } if (st.fim) break; E.fimTurno(st); }
      }
    }
    const ms = Number(process.hrtime.bigint() - t0) / 1e6;
    res[nome] = { decisoes, ms, porDecisao: ms / decisoes };
  }
  return res;
}

// =================== RELATÓRIO ===================
const pct = x => (100 * x).toFixed(1) + '%';
console.log('=== §322 — MEDIÇÃO DAS IAs ===');

if (CMD === 'uso' || CMD === 'tudo') {
  const nomeAI = arg('ai', CMD === 'tudo' ? 'combo' : 'atual');
  const rod = parseInt(arg('rodadas', '60'), 10);
  for (const comparar of (CMD === 'tudo' ? ['atual', nomeAI] : [nomeAI])) {
    const t0 = Date.now(); const u = medirUso(comparar, rod); const dt = (Date.now() - t0) / 1000;
    console.log('');
    console.log(`USO — IA=${comparar} · ${u.partidas} partidas (arena espelho do roster, ${rod} rodadas) · ${(u.partidas / dt).toFixed(0)} part/s`);
    console.log(`  duração média ${(u.somaTurnos / (u.partidas - u.semFim)).toFixed(1)} turnos · sem fim ${u.semFim}`);
    console.log(`  habilidades com uso < ${LIMIAR}/partida: ${u.raros.habilidade.length} de ${keys.length}`);
    console.log(`  milagres   com uso < ${LIMIAR}/partida: ${u.raros.milagre.length} de ${keys.length}`);
    if (arg('listar', '') === '1') {
      console.log('    habilidades raras: ' + u.raros.habilidade.map(x => x.nome).join(', '));
      console.log('    milagres raros: ' + u.raros.milagre.map(x => x.nome).join(', '));
    }
  }
}

if (CMD === 'forca' || CMD === 'tudo') {
  const nomeAI = arg('ai', 'combo'); const N = parseInt(arg('n', '400'), 10);
  const t0 = Date.now(); const f = medirForca(nomeAI, N); const dt = (Date.now() - t0) / 1000;
  // IC de Wilson 95% (empates contam meio — aproximo pela proporção efetiva)
  const z = 1.96, n = f.tot, p = f.p, d = 1 + z * z / n, centro = (p + z * z / (2 * n)) / d, meio = (z * Math.sqrt(p * (1 - p) / n + z * z / (4 * n * n))) / d;
  console.log('');
  console.log(`FORÇA — candidata=${nomeAI} × IA atual · ${f.comps} composições × ${f.M}×(espelho) = ${f.tot} partidas · ${(f.tot / dt).toFixed(0)} part/s`);
  console.log(`  vitórias da candidata: ${f.venc}  empates: ${f.emp}  → taxa ${pct(f.p)}  IC95 [${pct(centro - meio)}, ${pct(centro + meio)}]`);
  console.log(`  ${f.p >= 0.6 ? '✓ vence com folga (≥60%)' : f.p > 0.5 + meio ? '~ vence (acima de 50%, IC exclui 50)' : 'não vence com folga'}`);
}

if (CMD === 'verif') {
  // DETERMINISMO — o replay exige que a mesma posição decida SEMPRE igual. Amostra posições reais de várias
  // partidas e, em cada uma, chama a candidata DUAS vezes: as decisões têm de ser idênticas (JSON).
  const nomes = ['atual', 'papel', 'ply2', 'combo'];
  let total = 0, falhas = 0;
  for (let rod = 0; rod < 8; rod++) {
    const r = mulberry32(0x9e + rod * 2654435761), ordem = embaralhar(keys, r), times = [];
    for (let i = 0; i + 3 <= ordem.length; i += 3) times.push(ordem.slice(i, i + 3));
    for (let t = 0; t + 1 < times.length; t += 2) {
      const st = E.novoEstado(times[t], times[t + 1], rod * 97 + t + 1, t % 2);
      let guard = 0;
      while (!st.fim && guard++ < 60) {
        for (const nome of nomes) {
          const prox = decisor(nome);
          const a = JSON.stringify(prox(st)), b = JSON.stringify(prox(st));   // mesma posição, duas chamadas
          total++; if (a !== b) { falhas++; if (falhas <= 5) console.log(`  ✗ ${nome} divergiu: ${a} ≠ ${b}`); }
        }
        const a = decisor('atual')(st); if (!a) { E.fimTurno(st); } else E.agir(st, a.uid, a.slot, a.alvos, a.escolhas);
      }
    }
  }
  console.log('');
  console.log(`DETERMINISMO — ${total} pares de decisões (mesma posição, 2 chamadas) · ${falhas} divergências`);
  console.log(`  ${falhas === 0 ? '✓ todas as candidatas são determinísticas (replay-safe)' : '✗ há não-determinismo — NÃO usar no replay'}`);
  process.exit(falhas === 0 ? 0 : 1);
}

if (CMD === 'custo' || CMD === 'tudo') {
  const rod = parseInt(arg('rodadas', CMD === 'tudo' ? '20' : '20'), 10);
  const r = medirCusto(rod);
  console.log('');
  console.log(`CUSTO — ms por DECISÃO (Node) · estimativa celular = ×5 · replay típico ~30-60 decisões de IA/partida`);
  for (const nome of ['atual', 'papel', 'ply2', 'combo']) {
    const c = r[nome]; const cel = c.porDecisao * 5;
    console.log(`  ${nome.padEnd(6)}: ${c.porDecisao.toFixed(3)} ms/decisão (Node) · ~${cel.toFixed(2)} ms/decisão (celular ×5) ${cel <= 50 ? '✓ ≤50ms' : '⚠ >50ms'} · replay ~${(c.porDecisao * 45).toFixed(1)} ms/partida (Node, 45 dec.)`);
  }
}
