// ===================================================================
// INCURSION x3 Battle — RÉGUA DE NÍVEIS (§318, Fase 1: a medição)
// Partidas ESPELHO (o MESMO time dos dois lados) com a IA simuladora nos dois lados: o deus X com um
// VETOR DE NÍVEL de um lado × X no nível 1 do outro. Mede a TAXA DE VITÓRIA do lado com nível, com
// intervalo de confiança. Alterna quem começa E qual lado é o nivelado, para cancelar o viés de
// primeiro-lance e de lado. Também conta quantas vezes a IA USA cada habilidade de X — se ela nunca
// usa o milagre, o nível do milagre mede ZERO, e a régua tem de DIZER isso (senão mente).
//
// NÃO altera o motor nem os dados. O delta de nível entra por um catálogo EFETIVO montado aqui.
//
//   node tools/medir_niveis.js [--n=N] [--time=zeus,ares,atena] [--x=zeus]
//                              [--niv=basico:4,habilidade:1,milagre:1]   (vetor de nível de X)
//                              [--falso]   (delta de TESTE, NÃO commitado: Zeus +5 de dano no básico)
// Sem --niv e sem --falso: corrida NULA (delta zero) — a régua deve dar ~50% (a validação da régua).
// ===================================================================
const path = require('path');
const E = require(path.join(__dirname, '..', 'src', 'engine.js'));
Object.assign(global, E);
const { iaProximaAcao, iaPontuar, iaCandidatos, iaClonar } = require(path.join(__dirname, '..', 'src', 'ia.js'));

// §318 F1b — POLÍTICA DE USO FORÇADO (só para MEDIR; a IA do jogo NÃO muda). Em cada lance, a unidade
// ativa usa a habilidade PRONTA E PAGA de maior prioridade (milagre > habilidade > básico), com o ALVO
// pela regra da própria IA (iaCandidatos usa a mira por menor HP). Diferente da IA gulosa, USA mesmo que
// o lance baixe a pontuação — assim o nível de uma habilidade defensiva/cara é medido em vez de ignorado.
const PRIO_FORCADO = ['milagre', 'habilidade', 'basico'];
function forcadoProxima(st) {
  const lado = st.ativo, base = iaPontuar(st, lado);
  for (const u of st.lados[lado].units) {
    if (!podeAgir(u)) continue;
    const cands = iaCandidatos(st, u);
    if (!cands.length) continue;
    const slot = PRIO_FORCADO.find(s => cands.some(c => c.slot === s));
    if (!slot) continue;
    const sc = cands.filter(c => c.slot === slot);
    let bc = null, bd = -Infinity;                       // entre os alvos do slot forçado, o que a IA escolheria
    for (const c of sc) { const cl = iaClonar(st); const r = agir(cl, c.uid, c.slot, c.alvos, c.escolhas); if (!r || !r.ok) continue; const d = iaPontuar(cl, lado) - base; if (d > bd) { bd = d; bc = c; } }
    if (bc) return bc;                                    // só devolve um lance que o motor ACEITA (evita laço)
  }
  return null;
}

// §318 F1c — POLÍTICA REATIVA. Habilidade cujo EFEITO (no fx, não no nome) é provocação / redução /
// escudo / imunidade só é usada quando HÁ MOTIVO: (a) um aliado < 50% de HP; (b) o lançador < 60% de HP
// (para efeito no PRÓPRIO); (c) o time inimigo tem uma habilidade de dano pronta. Fora disso, cai na
// política forçada (a próxima prioridade). O tipo é classificado do fx BASE (identidade da habilidade,
// independe do nível). Só para MEDIR habilidades reativas (tank/suporte) sem inflar nem zerar o uso.
const _CTRL = ['atordoado', 'adormecido', 'submerso', 'taunt', 'silenceClass', 'lockSkill', 'dominado', 'medo', 'agarrar', 'pacificado', 'selado'];
function tagsReativas(baseAb) {
  const fx = (baseAb && baseAb.fx) || [];
  const ap = fx.filter(f => f.t === 'apply').map(f => f.eff && f.eff.type);
  const t = [];
  if (ap.includes('taunt')) t.push('provocação');
  if (ap.includes('dmgReduction')) t.push('redução');
  if (fx.some(f => f.t === 'shield') || ap.includes('shield')) t.push('escudo');
  if (ap.some(x => ['controlImmune', 'invulneravel', 'imunidade'].includes(x))) t.push('imunidade');
  return t;
}
const abBaseDe = (key, slot) => (GODS[key] && (GODS[key].ab || []).find(a => a.slot === slot)) || null;
const ehReativa = baseAb => tagsReativas(baseAb).length > 0;
// dano DIRETO de alvo único de uma habilidade EFETIVA (o maior fx dmg; ignora AoE/posicional/dot p/ a ameaça 1-a-1).
function danoDireto(ab) { return Math.max(0, 0, ...((ab && ab.fx) || []).filter(f => f.t === 'dmg' && typeof f.v === 'number' && !f.posicional).map(f => f.v)); }
function motivoReativo(st, u, baseAb) {
  const ali = st.lados[u.lado].units.filter(x => x.vivo);
  if (ali.some(x => x.hp < 0.5 * (x.maxHp || 120))) return true;                              // (a) aliado já ferido (<50%)
  const selfEff = (baseAb.fx || []).some(f => f.escopo === 'self' && (f.t === 'apply' || f.t === 'shield'));
  if (selfEff && u.hp < 0.6 * (u.maxHp || 120)) return true;                                  // (b) efeito no self e lançador <60%
  // (c) §318 F1d APERTADO: um inimigo tem dano PRONTO que deixaria um aliado abaixo de 50% (ou o mataria),
  // calculado com o dano do kit EFETIVO. Antes era "inimigo com dano pronto" (quase sempre true no 3v3).
  for (const e of st.lados[1 - u.lado].units) {
    if (!e.vivo || !podeAgir(e)) continue;
    const ek = kitDe(st, e); if (!ek) continue;
    for (const a of acoesDe(st, e)) {
      if (!a.disponivel) continue;
      const eab = (ek.ab || []).find(x => x.slot === a.slot); if (!eab) continue;
      const D = danoDireto(eab); if (D <= 0) continue;
      if (ali.some(x => x.hp <= D || (x.hp - D) < 0.5 * (x.maxHp || 120))) return true;
    }
  }
  return false;
}
function reativaProxima(st) {
  const lado = st.ativo, base = iaPontuar(st, lado);
  for (const u of st.lados[lado].units) {
    if (!podeAgir(u)) continue;
    const cands = iaCandidatos(st, u);
    if (!cands.length) continue;
    for (const slot of PRIO_FORCADO) {                    // prioridade milagre>hab>básico; pula a reativa sem motivo
      const sc = cands.filter(c => c.slot === slot);
      if (!sc.length) continue;
      const ab = abBaseDe(u.key, slot);
      if (ehReativa(ab) && !motivoReativo(st, u, ab)) continue;   // reativa sem motivo → tenta a próxima prioridade
      let bc = null, bd = -Infinity;
      for (const c of sc) { const cl = iaClonar(st); const r = agir(cl, c.uid, c.slot, c.alvos, c.escolhas); if (!r || !r.ok) continue; const d = iaPontuar(cl, lado) - base; if (d > bd) { bd = d; bc = c; } }
      if (bc) return bc;
    }
  }
  return null;
}

const GODS = E.GODS;
const SLOTS = ['basico', 'habilidade', 'milagre'];
const arg = (nome, def) => { const p = process.argv.find(a => a.startsWith('--' + nome + '=')); return p ? p.split('=')[1] : def; };
const tem = nome => process.argv.includes('--' + nome);

const N = parseInt(arg('n', '1200'), 10);
const TIME = arg('time', 'zeus,ares,atena').split(',');
const X = arg('x', TIME[0]);
const FALSO = tem('falso');
const FORCADO = tem('forcado');   // §318 F1b: política de uso forçado (mede o que a IA gulosa não usa)
const REATIVO = tem('reativo');   // §318 F1c: forçada, mas habilidade reativa só com motivo
const proximaAcao = REATIVO ? reativaProxima : FORCADO ? forcadoProxima : iaProximaAcao;
const POLITICA = REATIVO ? 'REATIVA' : FORCADO ? 'USO FORÇADO' : 'IA gulosa (jogo)';
// vetor de nível de X: --niv=basico:4,... (default: básico no 4, resto 1) OU o delta falso (básico 2)
function parseNiv(s) { const o = { basico: 1, habilidade: 1, milagre: 1 }; for (const p of (s || '').split(',')) { const [k, v] = p.split(':'); if (SLOTS.includes(k)) o[k] = parseInt(v, 10) || 1; } return o; }
const NIV = FALSO ? { basico: 2, habilidade: 1, milagre: 1 } : parseNiv(arg('niv', 'basico:4'));

// catálogo com a ESCADA de X. --falso: +5 de dano no básico (15→20) como nv2. Senão: uma escada
// SINTÉTICA de demonstração no básico (a Fase 0 não tem conteúdo real) — a régua mede o que existir.
function catalogoComEscada() {
  const cat = JSON.parse(JSON.stringify(GODS));
  const x = cat[X]; if (!x) throw new Error('deus desconhecido: ' + X);
  const basico = (x.ab || []).find(a => a.slot === 'basico');
  if (FALSO && basico && basico.fx && typeof basico.fx[0].v === 'number') {
    const de = basico.fx[0].v;
    basico.niveis = [{ nv: 2, muda: [{ caminho: 'fx[0].v', de, para: de + 5 }], desc: `${de + 5} de dano (delta de teste +5).` }];
  } else if (basico && basico.fx && typeof basico.fx[0].v === 'number') {
    const de = basico.fx[0].v;   // escada de demonstração: +2 por nível no dano do básico (nv2..nv4)
    basico.niveis = [
      { nv: 2, muda: [{ caminho: 'fx[0].v', de, para: de + 2 }], desc: `${de + 2} de dano.` },
      { nv: 3, muda: [{ caminho: 'fx[0].v', de: de + 2, para: de + 4 }], desc: `${de + 4} de dano.` },
      { nv: 4, muda: [{ caminho: 'fx[0].v', de: de + 4, para: de + 6 }], desc: `${de + 6} de dano.` },
    ];
  }
  return cat;
}

// UMA partida-espelho. leveled = lado (0/1) que recebe o vetor NIV em X; comeca = quem abre.
// Devolve { venceuNivelado, empate, usouX:{basico,habilidade,milagre} } — uso de X no lado nivelado.
function jogar(cat, time, leveled, niv, seed, comeca, usarDelta) {
  const niveis = usarDelta ? (leveled === 0 ? [{ [X]: niv }, {}] : [{}, { [X]: niv }]) : [{}, {}];
  const st = E.novoEstado(time.slice(), time.slice(), seed, comeca, null, cat, niveis);
  const usouX = { basico: 0, habilidade: 0, milagre: 0 };
  let guard = 0;
  while (!st.fim && guard++ < 400) {
    let passos = 0, a;
    while (!st.fim && (a = proximaAcao(st)) && passos++ < 8) {
      const u = st.lados.flatMap(l => l.units).find(x => x.uid === a.uid);
      if (u && u.lado === leveled && u.key === X && SLOTS.includes(a.slot)) usouX[a.slot]++;
      E.agir(st, a.uid, a.slot, a.alvos, a.escolhas);
    }
    if (st.fim) break;
    E.fimTurno(st);
  }
  const venceuNivelado = !!(st.fim && st.fim.resultado === 'vitoria' && st.fim.lado === leveled);
  return { venceuNivelado, empate: !!(st.fim && st.fim.resultado === 'empate'), usouX };
}

// corre N partidas alternando leveled e comeca; usarDelta=false = corrida NULA (baseline).
function corrida(cat, time, niv, usarDelta) {
  let vit = 0, emp = 0; const usou = { basico: 0, habilidade: 0, milagre: 0 };
  for (let i = 0; i < N; i++) {
    const leveled = i % 2, comeca = (i >> 1) % 2, seed = i + 1;
    const r = jogar(cat, time, leveled, niv, seed, comeca, usarDelta);
    if (r.venceuNivelado) vit++; if (r.empate) emp++;
    for (const s of SLOTS) usou[s] += r.usouX[s];
  }
  return { vit, emp, usou, p: vit / N };
}

// §318 F1d — RÉGUA SORTEADA (candidata a padrão dos 97): 30 composições sorteadas com semente fixa,
// cada uma X + 2 companheiros do roster; cada composição em ESPELHO. Delta = MÉDIA dos 30 deltas-de-
// composição, com IC de CLUSTER (não binomial) — captura a variância ENTRE composições, não só o ruído
// de partida. Menos enviesada que um único time fixo. M partidas por composição por corrida (nula/nivelada).
const _COMPS = 30;
function _mulberry32(s) { return function () { s |= 0; s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function _composicoes(x, n, semente) {
  const pool = Object.keys(GODS).filter(k => k !== x && (GODS[k].ab || []).length >= 3);
  const r = _mulberry32(semente); const out = [];
  for (let i = 0; i < n; i++) { const a = pool[Math.floor(r() * pool.length)]; let b = pool[Math.floor(r() * pool.length)]; let g = 0; while (b === a && g++ < 20) b = pool[Math.floor(r() * pool.length)]; out.push([x, a, b]); }
  return out;
}
function corridaSorteada(cat, niv) {
  const comps = _composicoes(X, _COMPS, 20240318);
  const M = Math.max(2, Math.round(N / _COMPS));   // partidas por composição por corrida
  const deltas = []; const usou = { basico: 0, habilidade: 0, milagre: 0 };
  for (let ci = 0; ci < comps.length; ci++) {
    const time = comps[ci]; let vN = 0, vD = 0;
    for (let i = 0; i < M; i++) {
      const leveled = i % 2, comeca = (i >> 1) % 2, seed = ci * 100003 + i + 1;
      if (jogar(cat, time, leveled, niv, seed, comeca, false).venceuNivelado) vN++;
      const rd = jogar(cat, time, leveled, niv, seed, comeca, true);
      if (rd.venceuNivelado) vD++;
      for (const s of SLOTS) usou[s] += rd.usouX[s];
    }
    deltas.push(vD / M - vN / M);
  }
  const mean = deltas.reduce((a, b) => a + b, 0) / deltas.length;
  const sd = Math.sqrt(deltas.reduce((a, b) => a + (b - mean) ** 2, 0) / (deltas.length - 1));
  const half = 1.96 * sd / Math.sqrt(deltas.length);
  return { mean, half, sd, usou, M, comps: comps.length };
}
const SORTEADO = tem('sorteado');

// IC de Wilson 95% para uma proporção.
function wilson(k, n) {
  if (!n) return { lo: 0, hi: 0, half: 0 };
  const z = 1.96, p = k / n, d = 1 + z * z / n;
  const centro = (p + z * z / (2 * n)) / d;
  const meio = (z * Math.sqrt(p * (1 - p) / n + z * z / (4 * n * n))) / d;
  return { lo: centro - meio, hi: centro + meio, half: meio };
}
const pct = x => (100 * x).toFixed(1) + '%';

console.log('=== §318 — RÉGUA DE NÍVEIS ===');
console.log(`time (espelho): ${TIME.join(', ')} · X = ${X} (${GODS[X] ? GODS[X].nome : '?'})`);
console.log(`vetor de nível de X: ${SLOTS.map(s => s + ':' + NIV[s]).join(' ')}${FALSO ? '   [DELTA FALSO: +5 dano no básico — NÃO commitar]' : ''}`);
console.log(`N = ${N} partidas por corrida · política = ${POLITICA}`);
// §318 F1c: classificação REATIVA das habilidades de X (do fx base) — reportada por habilidade.
for (const slot of ['basico', 'habilidade', 'milagre']) { const t = tagsReativas(abBaseDe(X, slot)); if (t.length) console.log(`  ${X}.${slot}: REATIVA (${t.join(', ')})`); }

const cat = catalogoComEscada();

if (SORTEADO) {
  const t0 = Date.now();
  const r = corridaSorteada(cat, NIV);
  const dt = (Date.now() - t0) / 1000;
  const detecta = (r.mean - r.half > 0) || (r.mean + r.half < 0);
  console.log('');
  console.log(`RÉGUA SORTEADA — ${r.comps} composições × ${r.M}×2 partidas — política ${POLITICA}`);
  console.log(`DELTA (média das composições): ${(100 * r.mean).toFixed(1)} pp  ±${(100 * r.half).toFixed(1)} pp (IC95 cluster)  · sd entre comps ${(100 * r.sd).toFixed(1)}pp  → ${detecta ? 'DETECTADO' : 'não detectado'}`);
  console.log(`uso de X na nivelada: ${SLOTS.map(s => s + ' ' + (r.usou[s] / (r.comps * r.M)).toFixed(2)).join(' · ')}/partida`);
  console.log(`(${2 * r.comps * r.M} partidas em ${dt.toFixed(1)}s)`);
  process.exit(0);
}

const t0 = Date.now();
const nulo = corrida(cat, TIME, NIV, false);   // baseline: delta zero
const nivelado = corrida(cat, TIME, NIV, true);  // com o vetor de nível
const dt = (Date.now() - t0) / 1000;
const partidasTotais = 2 * N;

const wN = wilson(nulo.vit, N), wL = wilson(nivelado.vit, N);
const delta = nivelado.p - nulo.p;
// IC do delta (diferença de proporções independentes): soma das variâncias.
const seDelta = Math.sqrt(nulo.p * (1 - nulo.p) / N + nivelado.p * (1 - nivelado.p) / N);
const deltaHalf = 1.96 * seDelta;
const detecta = (delta - deltaHalf > 0) || (delta + deltaHalf < 0);

console.log('');
console.log(`NULA      (delta 0): vitória do "nivelado" ${pct(nulo.p)}  IC95 [${pct(wN.lo)}, ${pct(wN.hi)}]  (esperado ~50%)`);
console.log(`NIVELADA (com vetor): vitória do nivelado  ${pct(nivelado.p)}  IC95 [${pct(wL.lo)}, ${pct(wL.hi)}]`);
console.log(`DELTA (nivelada − nula): ${(100 * delta).toFixed(1)} pp  ±${(100 * deltaHalf).toFixed(1)} pp (IC95)  → ${detecta ? 'DETECTADO (IC exclui 0)' : 'NÃO detectado (IC inclui 0)'}`);

console.log('');
console.log('--- validade da régua ---');
console.log(`velocidade: ${(partidasTotais / dt).toFixed(0)} partidas/s (${partidasTotais} partidas em ${dt.toFixed(1)}s)`);
// nº de partidas para IC de ±3pp na taxa nivelada (p(1-p) no p medido; e o pior caso p=0.5).
const nParaMeia = (p, meia) => Math.ceil((1.96 / meia) ** 2 * p * (1 - p));
console.log(`para IC de ±3pp na taxa: ${nParaMeia(nivelado.p, 0.03)} partidas (no p medido) · ${nParaMeia(0.5, 0.03)} (pior caso p=0.5)`);
// estabilidade do uso das habilidades de X (por N partidas na corrida nivelada).
console.log('uso das habilidades de X (na corrida nivelada, ' + N + ' partidas):');
for (const s of SLOTS) {
  const total = nivelado.usou[s], porPartida = total / N;
  const aviso = total === 0 ? '  ⚠ NUNCA usada → o nível deste slot mede ZERO (régua cega para ele)' : (porPartida < 0.2 ? '  ⚠ uso raro → medida fraca deste slot' : '');
  console.log(`  ${s.padEnd(11)}: ${total} usos (${porPartida.toFixed(2)}/partida)${aviso}`);
}
console.log('');
console.log(FALSO
  ? `>>> DELTA FALSO (+5 dano no básico): a régua ${detecta ? 'DETECTA' : 'NÃO detecta'} o ganho.`
  : '>>> corrida de demonstração (escada sintética). Sem --falso a NULA valida ~50%.');
