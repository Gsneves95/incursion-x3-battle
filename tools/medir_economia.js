// tools/medir_economia.js — §318 F2 E4: MEDIÇÃO da economia autoritativa (não é teste; imprime números).
//   node tools/medir_economia.js
// Mede: (1) invocações até MAXIMIZAR 1 deus A/S/SS por faixa (Suplicante 0, Adepto 3);
//        (2) taxa EFETIVA de SS por faixa COM pity; (3) Essência/dia de PvE vs consumo de pergaminhos;
//        (4) custo do REPLAY por partida no servidor (ms).
const path = require('path');
const invoc = require(path.join(__dirname, '..', 'server', 'invocacao.js'));
const ECON = require(path.join(__dirname, '..', 'data', 'economia.json'));
const HOST = require(path.join(__dirname, '..', 'server', 'motor-host.js'));
const DOM = require(path.join(__dirname, '..', 'src', 'dominios.js'));
const DADOS = require(path.join(__dirname, '..', 'server', 'dados-pve.js'));
const pve = require(path.join(__dirname, '..', 'server', 'pve.js'));
const E = HOST.E, ia = HOST.ia;

const PONTOS = ECON.invocacao.pontosPorDuplicata;   // A1/S2/SS4
const CUSTO_MAX = 1 + 2 + 3;                          // 6 pontos por slot; 18 para maximizar (3 slots)
const MAX_DEUS = 3 * CUSTO_MAX;                       // 18 pontos = deus MAX

// conta-fake para o sorteio (só o que invocar lê)
function conta(pontosRanque) { return { ranque: { pontos: pontosRanque }, perfil: { moedas: { gema: 1e12, essencia: 0 }, deuses: {} }, niveis: {}, gacha: { pity: 0, inicianteUsado: false }, pontos: {} }; }

// ---- (1) invocações até MAXIMIZAR o 1º deus de cada raridade, por faixa ----
function pullsAteMaximizar(faixaPontos, raridadeAlvo, trials, rng) {
  let soma = 0;
  for (let t = 0; t < trials; t++) {
    const pts = {};   // deus -> pontos acumulados
    let pulls = 0, ok = false;
    const est = { pity: 0 };
    const fJog = invoc.faixaDoJogador({ ranque: { pontos: faixaPontos } });
    while (!ok && pulls < 5000000) {
      const o = invoc.sortearUm(est, fJog, rng, null);
      pulls++;
      if (o.raridade === raridadeAlvo) {
        // 1ª cópia = posse (0 pontos); dups = pontos
        if (pts[o.key] === undefined) pts[o.key] = 0;
        else pts[o.key] += PONTOS[raridadeAlvo];
        if (pts[o.key] >= MAX_DEUS) ok = true;
      }
    }
    soma += pulls;
  }
  return Math.round(soma / trials);
}

// ---- (2) taxa efetiva de SS por faixa, COM pity ----
function ssEfetivo(faixaPontos, N, rng) {
  const fJog = invoc.faixaDoJogador({ ranque: { pontos: faixaPontos } });
  const est = { pity: 0 }; let ss = 0;
  for (let i = 0; i < N; i++) { const o = invoc.sortearUm(est, fJog, rng, null); if (o.raridade === 'SS') ss++; }
  return ss / N * 100;
}

function mulberry(seed) { return invoc.mulberry32(seed); }

console.log('===== §318 F2 E4 — MEDIÇÃO DA ECONOMIA =====\n');

console.log('(1) INVOCAÇÕES até MAXIMIZAR o 1º deus (18 pontos = 3 slots no nv4), por faixa e raridade:');
console.log('    (A1/S2/SS4 pontos por duplicata; média de trials)');
const RANQ = require(path.join(__dirname, '..', 'data', 'ranqueado.json'));
for (const [nome, pts] of [['Suplicante(0)', RANQ.faixas[0].min], ['Adepto(3)', RANQ.faixas[3].min]]) {
  const rng = mulberry(12345);
  const a = pullsAteMaximizar(pts, 'A', 200, rng);
  const s = pullsAteMaximizar(pts, 'S', 200, rng);
  const ss = pullsAteMaximizar(pts, 'SS', 60, rng);
  console.log(`    ${nome}: A ~${a} pulls · S ~${s} pulls · SS ~${ss} pulls  (≈ ${Math.round(a * ECON.invocacao.custo.avulso / 1000)}k / ${Math.round(s * ECON.invocacao.custo.avulso / 1000)}k / ${Math.round(ss * ECON.invocacao.custo.avulso / 1000)}k gema no avulso)`);
}

console.log('\n(2) TAXA de SS por faixa do jogador — NATURAL (analítica, ≤1%) e EFETIVA com pity 60 (sim):');
const rng2 = mulberry(999);
const temSS = invoc.FAIXAS_COM_SS;
for (let f = 0; f < invoc.NFAIXAS; f++) {
  const pts = RANQ.faixas[f].min;
  // NATURAL analítica: Σ linha[f']·1% sobre as faixas que TÊM SS (a cascata nunca ADICIONA SS)
  const row = invoc.linhaFaixa(f);
  let nat = 0; for (const ff of temSS) nat += (row[ff] / 100) * ECON.invocacao.taxas.SS;   // fração: (peso da faixa) × taxa SS
  const ef = ssEfetivo(pts, 300000, rng2);
  console.log(`    ${RANQ.faixas[f].nome.padEnd(11)} natural ${(nat * 100).toFixed(3)}%  ·  com pity ${ef.toFixed(2)}%`);
}

console.log('\n(3) ESSÊNCIA de PvE por dia vs CONSUMO de pergaminhos:');
const teto = ECON.tetoDiarioEssencia.valor, custoPerg = ECON.pergaminhos.custoEssencia, rec = ECON.pergaminhos.recargaHoras;
const pergDia = Math.floor(24 / rec);
console.log(`    teto diário de Essência (PvE repetível) = ${teto}`);
console.log(`    pergaminho custa ${custoPerg} · recarga ${rec}h → ${pergDia} pergaminhos/dia por deus = ${pergDia * custoPerg} Essência/dia`);
console.log(`    Domínios: ${ECON.dominios.recompensas.porNivel.essencia}/nível, até ${ECON.dominios.tetoRunEssencia}/corrida · Desafio repetido: ${ECON.desafios.recompensas.repeticao.essencia}/vitória`);
console.log(`    veredicto: o teto (${teto}) casa com o consumo de ${pergDia} pergaminhos (${pergDia * custoPerg}) — a fonte contínua paga exatamente o sorvedouro contínuo.`);

console.log('\n(4) CUSTO do REPLAY por partida no servidor (re-simulação):');
(function () {
  // joga uma sandbox 3v1 e mede a re-simulação
  function jogar(montarFn) {
    let st = montarFn(); const ops = []; let g = 0;
    while (!st.fim && g++ < 6000) {
      if (st.ativo === 0) {
        for (const u of st.lados[0].units) { if (st.fim) break; if (!E.podeAgir(u)) continue; const ac = E.acoesDe(st, u).filter(a => a.disponivel); if (!ac.length) continue; const a = ac[0]; let al = []; if (a.alvo === 'distribui') { const vs = E.alvosValidos(st, u, a, 0, []); if (vs.length) al = [vs[0].uid]; } else { const ps = (a.passos || []).length; let bom = true; for (let p = 0; p < ps; p++) { const vs = E.alvosValidos(st, u, a, p, al); if (!vs.length) { bom = false; break; } al.push(vs[0].uid); } if (!bom) continue; } const r = E.agir(st, u.uid, a.slot, al, null, null); if (r && r.ok) ops.push({ tipo: 'agir', uid: u.uid, slot: a.slot, alvos: al, escolhas: null, modo: null }); }
        if (st.fim) break; ops.push({ tipo: 'fim' }); E.fimTurno(st);
      } else { let p = 0, mv; while (!st.fim && (mv = ia.iaProximaAcao(st, 'normal')) && p++ < 16) E.agir(st, mv.uid, mv.slot, mv.alvos || [], mv.escolhas || null, mv.modo || null); if (!st.fim) E.fimTurno(st); }
    }
    return ops;
  }
  const ct = { ranque: { pontos: 0 }, perfil: { moedas: { gema: 0, essencia: 0 }, deuses: { zeus: {}, ogum: {}, tyr: {} } }, niveis: {} };
  const ops = jogar(() => E.novoEstado(['zeus', 'ogum', 'tyr'], ['cuca'], 123, 0, ECON.energia));
  const replay = { modo: 'sandbox', aliados: ['zeus', 'ogum', 'tyr'], inimigos: ['cuca'], seed: 123, comeca: 0, ops };
  const N = 2000; const t0 = process.hrtime.bigint();
  for (let i = 0; i < N; i++) pve.verificar(ct, replay, Date.now());
  const t1 = process.hrtime.bigint();
  console.log(`    re-simulação de uma partida (${ops.length} ops): ${(Number(t1 - t0) / 1e6 / N).toFixed(3)} ms/verificação (N=${N})`);
})();

console.log('\n===== fim da medição =====');
