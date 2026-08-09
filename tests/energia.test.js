// energia.test.js — geração de energia com sorte (parâmetro em data/economia.json).
// Motor puro em node; a simulação de partidas usa a IA (também determinística).
const E = require('../src/engine.js');
Object.assign(global, E);                 // expõe agir/acoesDe/podeAgir… p/ ia.js
const { iaProximaAcao } = require('../src/ia.js');

let f = 0;
function ok(c, m) { if (!c) { console.log('  FALHA: ' + m); f++; } }
const R = n => Math.round(n * 1000) / 1000;

const CFG_TIME = { modo: 'time', pesoTime: 1, pesoLivre: 0 };
const CFG_PND  = { modo: 'ponderado', pesoTime: 0.75, pesoLivre: 0.25 };
const CFG_UNI  = { modo: 'uniforme' };
const TIME3 = ['Tempestade', 'Umbra', 'Maré'];   // time de 3 elementos distintos (os outros 3 são estrangeiros)

function fracoes(cfg, tipos, N) {
  const st = { seed: 99, rngN: 0, energia: cfg };
  const c = {}; E.ELEMS.forEach(e => c[e] = 0);
  for (let i = 0; i < N; i++) c[E.sortearElemento(st, tipos)]++;
  const fr = {}; E.ELEMS.forEach(e => fr[e] = c[e] / N);
  return fr;
}

// ---------------------------------------------------------------- 7
console.log('== 7. modo "time"/1.0 == comportamento atual (fallback de compat.) ==');
{
  // o fallback (st.energia ausente) tem de ser IDÊNTICO ao modo "time"
  const seq = (cfg) => { const st = { seed: 7, rngN: 0, energia: cfg }; const o = []; for (let i = 0; i < 2000; i++) o.push(E.sortearElemento(st, TIME3)); return o; };
  const nulo = seq(null), time = seq(CFG_TIME);
  ok(nulo.join() === time.join(), 'fallback (null) idêntico ao modo time');
  ok(nulo.every(e => TIME3.includes(e)), 'modo time nunca gera cor fora do time');
  // contrato do fluxo do RNG: time gasta 1 sorteio por energia; ponderado gasta 2
  const cont = (cfg) => { const st = { seed: 7, rngN: 0, energia: cfg }; for (let i = 0; i < 100; i++) E.sortearElemento(st, TIME3); return st.rngN; };
  ok(cont(CFG_TIME) === 100, 'modo time: exatamente 1 sorteio por energia (' + cont(CFG_TIME) + ')');
  ok(cont(CFG_PND) === 200, 'modo ponderado: exatamente 2 sorteios por energia (' + cont(CFG_PND) + ')');
  console.log('  fallback == time · time 1 sorteio/energia · ponderado 2 (as 9 suítes rodam sem edição)');
}

// ---------------------------------------------------------------- 8
console.log('== 8. modo "ponderado": distribuição bate com os pesos (±1%) ==');
{
  const fr = fracoes(CFG_PND, TIME3, 300000);
  const share = (set) => E.ELEMS.filter(e => set(e)).reduce((s, e) => s + fr[e], 0);
  const timeShare = share(e => TIME3.includes(e));       // esperado 0.75 + 0.25·(3/6) = 0.875
  const estrShare = share(e => !TIME3.includes(e));      // esperado 0.25·(3/6) = 0.125
  // recupera os pesos declarados a partir da distribuição observada
  const recPesoLivre = estrShare / ((6 - 3) / 6);         // = pesoLivre
  const recPesoTime  = timeShare - recPesoLivre * (3 / 6); // = pesoTime
  ok(Math.abs(recPesoTime - 0.75) < 0.01, 'pesoTime recuperado ' + R(recPesoTime) + ' ≈ 0.75');
  ok(Math.abs(recPesoLivre - 0.25) < 0.01, 'pesoLivre recuperado ' + R(recPesoLivre) + ' ≈ 0.25');
  // cada elemento do time ≈ 0.2917; cada estrangeiro ≈ 0.0417
  ok(TIME3.every(e => Math.abs(fr[e] - 0.2917) < 0.01), 'cada elemento do time ≈ 0.292');
  ok(E.ELEMS.filter(e => !TIME3.includes(e)).every(e => Math.abs(fr[e] - 0.0417) < 0.01), 'cada estrangeiro ≈ 0.042');
  console.log('  time ' + R(timeShare) + ' · estrangeiro ' + R(estrShare) + ' → pesos ' + R(recPesoTime) + '/' + R(recPesoLivre));
}

// ---------------------------------------------------------------- 9
console.log('== 9. modo "uniforme": cada um dos 6 ≈ 1/6 ==');
{
  const fr = fracoes(CFG_UNI, TIME3, 300000);
  ok(E.ELEMS.every(e => Math.abs(fr[e] - 1 / 6) < 0.01), 'cada elemento ≈ 0.167');
  console.log('  ' + E.ELEMS.map(e => e[0] + R(fr[e])).join(' '));
}

// ---------------------------------------------------------------- 10 + medições
console.log('== 10. velocidade do jogo: time/1.0 × ponderado/0.75 (+ medições) ==');
{
  const KEYS = Object.keys(E.GODS);
  const variado = s => { const t = []; let n = s; while (t.length < 3) { const k = KEYS[n % KEYS.length]; if (!t.includes(k)) t.push(k); n += 3; } return t; };
  const mono = s => { const k = KEYS[s % KEYS.length]; return [k, k, k]; };
  const N = 500;

  function simular(cfg, tA, tB, seed, comeca) {
    const st = E.novoEstado(tA, tB, seed, comeca, cfg);
    const teamEl = [new Set(st.lados[0].units.map(u => u.elem)), new Set(st.lados[1].units.map(u => u.elem))];
    let guard = 0, milagre = null, starved = 0, foSum = 0, foN = 0, foMax = 0;
    while (!st.fim && guard++ < 5000) {
      const a = iaProximaAcao(st);
      if (a) {
        if (a.slot === 'milagre' && milagre === null) milagre = st.turno;
        const r = E.agir(st, a.uid, a.slot, a.alvos, a.escolhas);
        if (!r || !r.ok) { medirEfim(); }   // ação inválida: fecha o turno como a IA faria
      } else { medirEfim(); }
      function medirEfim() {
        const side = st.ativo, l = st.lados[side];
        for (const u of l.units) if (E.podeAgir(u) && E.acoesDe(st, u).every(x => !x.disponivel)) starved++;
        let fo = 0; E.ELEMS.forEach(e => { if (!teamEl[side].has(e)) fo += l.orbs[e]; });
        foSum += fo; foN++; if (fo > foMax) foMax = fo;
        E.fimTurno(st);
      }
    }
    return { turnos: st.turno, milagre: milagre == null ? st.turno : milagre, starved, foAvg: foSum / Math.max(1, foN), foMax };
  }

  function cohorte(cfg, pick) {
    const acc = { turnos: 0, milagre: 0, starved: 0, foAvg: 0, foMax: 0 };
    for (let s = 0; s < N; s++) {
      const r = simular(cfg, pick(s), pick(s + 7), s + 1, s % 2);
      acc.turnos += r.turnos; acc.milagre += r.milagre; acc.starved += r.starved;
      acc.foAvg += r.foAvg; acc.foMax = Math.max(acc.foMax, r.foMax);
    }
    return { turnos: acc.turnos / N, milagre: acc.milagre / N, starved: acc.starved / N, foAvg: acc.foAvg / N, foMax: acc.foMax };
  }

  const linha = (nome, r) => console.log('  ' + nome.padEnd(22) +
    'dur ' + R(r.turnos) + '  1ºMilagre ' + R(r.milagre) + '  faminto/part ' + R(r.starved) +
    '  estrang.média ' + R(r.foAvg) + ' (máx ' + r.foMax + ')');

  const vT = cohorte(CFG_TIME, variado), vP = cohorte(CFG_PND, variado);
  const mT = cohorte(CFG_TIME, mono),    mP = cohorte(CFG_PND, mono);
  console.log('  --- ' + N + ' partidas por célula (IA × IA, semente fixa) ---');
  linha('variado · time/1.0', vT); linha('variado · ponderado', vP);
  linha('mono · time/1.0', mT);    linha('mono · ponderado', mP);

  const dV = (vP.turnos - vT.turnos) / vT.turnos, dM = (mP.turnos - mT.turnos) / mT.turnos;
  console.log('  Δ duração — variado ' + R(dV * 100) + '% · mono ' + R(dM * 100) + '%');

  // teste 10 (reforçado): a ponderação não pode desacelerar o jogo além de 20%
  ok(dV <= 0.20, 'duração do time variado subiu ' + R(dV * 100) + '% (> 20% → peso errado, avisar o dono)');
  ok(dM <= 0.20, 'duração do time mono subiu ' + R(dM * 100) + '% (> 20% → peso errado, avisar o dono)');
  // medição 1: excesso estrangeiro parado. Reporta; alerta (não falha) se > 4.
  const foAlvo = Math.max(vP.foAvg, mP.foAvg);
  if (foAlvo > 4) console.log('  ⚠ estrangeira parada média ' + R(foAlvo) + ' > 4 — conversão pode precisar de mais vazão (decisão do dono)');
  // sanidade do item 10 original: mono ainda deve castar milagre em tempo razoável
  ok(mP.milagre <= mT.milagre * 1.20 + 1, 'mono/ponderado atrasa o 1º Milagre além do aceitável');
}

console.log('');
console.log(f === 0 ? '>>> ENERGIA OK' : `>>> ${f} FALHA(S)`);
process.exit(f ? 1 : 0);
