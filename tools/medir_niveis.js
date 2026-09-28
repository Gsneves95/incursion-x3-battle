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

const GODS = E.GODS;
const SLOTS = ['basico', 'habilidade', 'milagre'];
const arg = (nome, def) => { const p = process.argv.find(a => a.startsWith('--' + nome + '=')); return p ? p.split('=')[1] : def; };
const tem = nome => process.argv.includes('--' + nome);

const N = parseInt(arg('n', '1200'), 10);
const TIME = arg('time', 'zeus,ares,atena').split(',');
const X = arg('x', TIME[0]);
const FALSO = tem('falso');
const FORCADO = tem('forcado');   // §318 F1b: política de uso forçado (mede o que a IA gulosa não usa)
const proximaAcao = FORCADO ? forcadoProxima : iaProximaAcao;
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
console.log(`N = ${N} partidas por corrida · política = ${FORCADO ? 'USO FORÇADO' : 'IA gulosa (jogo)'}`);

const cat = catalogoComEscada();

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
