// tests/economia.test.js — §318 FASE 2: a ECONOMIA é do SERVIDOR. As babás crescem por etapa.
// ETAPA 1 — o buraco fechado: salvarPerfil aceita só campos LOCAIS; moedas e a POSSE de deuses (ownership
// + copias) ficam as do servidor. Um cliente que forja gemas/deuses/copias não muda NADA na conta.
const contas = require('../server/contas.js');

let falhas = 0;
const ok = (c, m) => { if (!c) { console.log('  FALHA: ' + m); falhas++; } };
const clone = x => JSON.parse(JSON.stringify(x));

console.log('§318 FASE 2 — ECONOMIA AUTORITATIVA');
console.log('== ETAPA 1: salvarPerfil ignora economia forjada pelo cliente ==');
(() => {
  contas._resetParaTeste();
  const r = contas.criar({ faixaIdade: 'maior' });   // grant inicial (gema) + deuses iniciais
  const tok = r.conta.token, id = r.conta.id;
  const antes = clone(contas.porToken(tok).perfil);
  const gema0 = antes.moedas.gema, ess0 = antes.moedas.essencia;
  const umDeus = Object.keys(antes.deuses)[0];
  const copias0 = antes.deuses[umDeus].copias;
  ok(gema0 > 0, 'grant inicial de gema > 0 (pré-condição)');

  // o CLIENTE forja: +99999 gema, +essência, um deus NOVO, copias:50 num deus possuído
  const forjado = clone(antes);
  forjado.moedas.gema += 99999;
  forjado.moedas.essencia = (forjado.moedas.essencia || 0) + 5000;
  forjado.deuses['__deus_forjado__'] = { copias: 3, favorito: false, obtidoEm: 0 };
  forjado.deuses[umDeus].copias = 50;
  const s = contas.salvarPerfil(tok, forjado);
  ok(s.ok, 'salvarPerfil ok');

  const dep = contas.porToken(tok).perfil;
  ok(dep.moedas.gema === gema0, `gema NÃO muda (${dep.moedas.gema} === ${gema0})`);
  ok(dep.moedas.essencia === ess0, 'essência NÃO muda');
  ok(!dep.deuses['__deus_forjado__'], 'deus forjado IGNORADO (posse não se forja)');
  ok(dep.deuses[umDeus].copias === copias0, `copias NÃO mudam (${dep.deuses[umDeus].copias} === ${copias0})`);

  // a preferência `favorito` (local) SOBREVIVE, sem tocar posse/copias
  const pref = clone(contas.porToken(tok).perfil);
  pref.deuses[umDeus].favorito = true;
  pref.deuses[umDeus].copias = 999;   // tenta forjar junto
  contas.salvarPerfil(tok, pref);
  const dep2 = contas.porToken(tok).perfil;
  ok(dep2.deuses[umDeus].favorito === true, 'favorito (preferência) PERSISTE');
  ok(dep2.deuses[umDeus].copias === copias0, 'favorito persiste MAS copias continuam do servidor');

  // campos LOCAIS (times, maestria) passam
  const loc = clone(contas.porToken(tok).perfil);
  loc.times = [['zeus', 'ogum', 'tyr']];
  loc.maestria = { zeus: { vitorias: 7, milagre: 2 } };
  contas.salvarPerfil(tok, loc);
  const dep3 = contas.porToken(tok).perfil;
  ok(JSON.stringify(dep3.times) === JSON.stringify([['zeus', 'ogum', 'tyr']]), 'times (loadout local) PERSISTE');
  ok(dep3.maestria.zeus && dep3.maestria.zeus.vitorias === 7, 'maestria (cosmética local) PERSISTE');
  contas._resetParaTeste();
})();

// ================================================================================================
// ETAPA 2 — PvE PAGO POR REPLAY. O cliente grava a partida (montagem do modo + ações do JOGADOR); o
// servidor RE-SIMULA com o mesmo motor determinístico e só credita se o resultado bater. A dificuldade
// vem do DADO (server/dados-pve.js), a IA roda no servidor. Portões: 1ª vez, 1×/semana, teto diário,
// teto por corrida, dedupe de reenvio (fila offline). Nada de economia se forja pelo cliente.
// ================================================================================================
const HOST = require('../server/motor-host.js');
const E = HOST.E, ia = HOST.ia, PROV = HOST.PROV;
const DOM = require('../src/dominios.js');
const DADOS = require('../server/dados-pve.js');
const pve = require('../server/pve.js');

// harness: joga o LADO 0 com política gulosa (grava só as ações do jogador) e roda a IA — devolve os ops
// do jogador + se venceu. Espelha o driver do cliente (turno.js) e o re-simulador do servidor (pve.js).
function jogar(montarFn) {
  let st; try { st = montarFn(); } catch (e) { return { erro: e.message }; }
  const ops = []; let g = 0;
  while (!st.fim && g++ < 6000) {
    if (st.ativo === 0) {
      // §324 P2: o lado do JOGADOR é dirigido pela IA real (iaProximaAcao), não por um guloso-só-Básico.
      // O guloso-só-Básico era um piso frágil: a régua do gerador de Domínios é a IA gulosa COMPLETA,
      // então NENHUM nível é garantidamente vencível só com o Básico (o n1 da Grega deixou de ser vencível
      // por ele quando o Fujin inimigo foi reforçado — e nem o trio re-medido seria). A IA real vence o que
      // o gerador mede como vencível, e o replay gravado (só as ações do jogador) re-simula idêntico no
      // servidor: `pve.js` roda o MESMO motor e a MESMA IA inimiga (v1) sobre estes ops.
      let p = 0, mv;
      while (!st.fim && (mv = ia.iaProximaAcao(st, 'normal')) && p++ < 16) {
        const r = E.agir(st, mv.uid, mv.slot, mv.alvos || [], mv.escolhas || null, mv.modo || null);
        if (r && r.ok) ops.push({ tipo: 'agir', uid: mv.uid, slot: mv.slot, alvos: mv.alvos || [], escolhas: mv.escolhas || null, modo: mv.modo || null });
      }
      if (st.fim) break;
      ops.push({ tipo: 'fim' }); E.fimTurno(st);
    } else {
      let p = 0, mv;
      while (!st.fim && (mv = ia.iaProximaAcao(st, 'normal')) && p++ < 16) E.agir(st, mv.uid, mv.slot, mv.alvos || [], mv.escolhas || null, mv.modo || null);
      if (!st.fim) E.fimTurno(st);
    }
  }
  return { ops, venceu: !!(st.fim && st.fim.resultado === 'vitoria' && st.fim.lado === 0) };
}
let _seq = 0;
const novaConta = () => contas.criar({ faixaIdade: 'maior' }).conta;
const idNovo = () => 'p' + (++_seq) + '_' + Date.now();

console.log('');
console.log('== ETAPA 2: PvE pago por replay (crédito autoritativo no servidor) ==');

// --- (1) REPLAY LEGÍTIMO credita o valor EXATO (sandbox = Gema 20) ---
(() => {
  contas._resetParaTeste();
  const c = novaConta();
  const montar = () => E.novoEstado(['zeus', 'ogum', 'tyr'], ['cuca'], 123, 0, DADOS.ECONOMIA.energia || null);
  const j = jogar(montar);
  ok(j.venceu, 'sandbox 3v1: o jogador guloso vence (pré-condição do replay)');
  const g0 = c.perfil.moedas.gema;
  const r = pve.creditar(c, { modo: 'sandbox', aliados: ['zeus', 'ogum', 'tyr'], inimigos: ['cuca'], seed: 123, comeca: 0, ops: j.ops, idPartida: idNovo() }, Date.now());
  ok(r.ok && r.creditou, 'replay legítimo: creditou');
  ok(r.recompensa.gema === 20 && r.recompensa.essencia === 0, `sandbox paga Gema 20 exato (${r.recompensa.gema}/${r.recompensa.essencia})`);
  ok(c.perfil.moedas.gema === g0 + 20, 'saldo do servidor subiu 20');
})();

// --- (2) OPS FORJADAS → RECUSA (ilegal e truncada; e vitória não conquistada não paga) ---
(() => {
  contas._resetParaTeste();
  const c = novaConta();
  const montar = () => E.novoEstado(['zeus', 'ogum', 'tyr'], ['cuca'], 123, 0, DADOS.ECONOMIA.energia || null);
  const j = jogar(montar);
  const base = { modo: 'sandbox', aliados: ['zeus', 'ogum', 'tyr'], inimigos: ['cuca'], seed: 123, comeca: 0 };
  // (a) op ILEGAL: alvo inexistente
  const ilegais = j.ops.map(o => o.tipo === 'agir' ? Object.assign({}, o, { alvos: ['uid_que_nao_existe'] }) : o);
  const g0 = c.perfil.moedas.gema;
  const ra = pve.creditar(c, Object.assign({ ops: ilegais, idPartida: idNovo() }, base), Date.now());
  ok(!ra.ok || !ra.creditou, 'ops com alvo ilegal: NÃO credita');
  // (b) TRUNCADA: tira a última ação (o golpe que vence) → partida não termina
  const truncada = j.ops.slice(0, Math.max(0, j.ops.length - 1));
  const rb = pve.creditar(c, Object.assign({ ops: truncada, idPartida: idNovo() }, base), Date.now());
  ok(!rb.ok || !rb.creditou, 'ops truncadas: NÃO credita (partida não vencida)');
  // (c) vazio (só declara, não joga)
  const rc = pve.creditar(c, Object.assign({ ops: [], idPartida: idNovo() }, base), Date.now());
  ok(!rc.ok || !rc.creditou, 'ops vazias: NÃO credita');
  ok(c.perfil.moedas.gema === g0, 'nenhum forjado mexeu no saldo');
})();

// --- (3) MESMA PARTIDA 2× → credita 1× (dedupe da fila offline por idPartida) ---
(() => {
  contas._resetParaTeste();
  const c = novaConta();
  const montar = () => E.novoEstado(['zeus', 'ogum', 'tyr'], ['cuca'], 77, 0, DADOS.ECONOMIA.energia || null);
  const j = jogar(montar);
  const id = idNovo();
  const rep = { modo: 'sandbox', aliados: ['zeus', 'ogum', 'tyr'], inimigos: ['cuca'], seed: 77, comeca: 0, ops: j.ops, idPartida: id };
  const g0 = c.perfil.moedas.gema;
  const r1 = pve.creditar(c, rep, Date.now());
  const r2 = pve.creditar(c, rep, Date.now());   // reenvio idêntico (fila offline)
  ok(r1.creditou && !r2.creditou, 'reenvio do mesmo idPartida: credita 1×');
  ok(r2.motivo === 'duplicado', 'o 2º diz "duplicado"');
  ok(c.perfil.moedas.gema === g0 + 20, 'saldo subiu só 20 (uma vez)');
})();

// --- (4) SANDBOX: teto diário de 5 vitórias/dia (relógio do servidor) ---
(() => {
  contas._resetParaTeste();
  const c = novaConta();
  const montar = () => E.novoEstado(['zeus', 'ogum', 'tyr'], ['cuca'], 5, 0, DADOS.ECONOMIA.energia || null);
  const j = jogar(montar);
  const dia = Date.parse('2026-03-10T12:00:00Z');
  let creditadas = 0;
  for (let i = 0; i < 8; i++) { const r = pve.creditar(c, { modo: 'sandbox', aliados: ['zeus', 'ogum', 'tyr'], inimigos: ['cuca'], seed: 5, comeca: 0, ops: j.ops, idPartida: idNovo() }, dia); if (r.creditou) creditadas++; }
  ok(creditadas === 5, `sandbox credita no máximo 5/dia (creditou ${creditadas})`);
  // vira o dia → volta a creditar
  const r = pve.creditar(c, { modo: 'sandbox', aliados: ['zeus', 'ogum', 'tyr'], inimigos: ['cuca'], seed: 5, comeca: 0, ops: j.ops, idPartida: idNovo() }, dia + 24 * 3600 * 1000);
  ok(r.creditou, 'no dia seguinte volta a creditar (reset por data do servidor)');
})();

// --- (5) CAMPANHA: só a 1ª vitória de cada encontro paga (Gema 120) ---
(() => {
  contas._resetParaTeste();
  const c = novaConta();
  const ato = DADOS.campanhaAto('pro-ii');
  const j = jogar(() => PROV.montarProvacao({ aliados: ato.aliados, inimigos: ato.inimigos, montar: ato.montar }));
  ok(j.venceu, 'campanha pro-ii: o jogador guloso vence (pré-condição)');
  const g0 = c.perfil.moedas.gema;
  const r1 = pve.creditar(c, { modo: 'campanha', atoId: 'pro-ii', aliados: ato.aliados, ops: j.ops, idPartida: idNovo() }, Date.now());
  const r2 = pve.creditar(c, { modo: 'campanha', atoId: 'pro-ii', aliados: ato.aliados, ops: j.ops, idPartida: idNovo() }, Date.now());
  ok(r1.creditou && r1.recompensa.gema === 120, `1ª vez paga Gema 120 (${r1.recompensa.gema})`);
  ok(!r2.creditou && r2.motivo === 'ja_pago', 're-jogar o mesmo encontro NÃO paga');
  ok(c.perfil.moedas.gema === g0 + 120, 'saldo subiu só 120');
})();

// --- (6) SEMANAL: 150 uma vez por semana (relógio do servidor; monkeypatch p/ puzzle fácil) ---
(() => {
  contas._resetParaTeste();
  const c = novaConta();
  const salvo = DADOS.SEMANAIS.puzzles;
  DADOS.SEMANAIS.puzzles = [{ aliados: ['zeus', 'ogum', 'tyr'], inimigos: ['cuca'], montar: { seed: 1, comeca: 0 }, condicoes: [] }];
  try {
    const semA = Date.parse('2026-03-10T12:00:00Z');   // uma semana
    const semB = Date.parse('2026-03-24T12:00:00Z');   // duas semanas depois
    const j = jogar(() => PROV.montarProvacao(DADOS.SEMANAIS.puzzles[0]));
    ok(j.venceu, 'semanal fácil: vence (pré-condição)');
    const g0 = c.perfil.moedas.gema;
    const r1 = pve.creditar(c, { modo: 'semanal', ops: j.ops, idPartida: idNovo() }, semA);
    const r2 = pve.creditar(c, { modo: 'semanal', ops: j.ops, idPartida: idNovo() }, semA);
    const r3 = pve.creditar(c, { modo: 'semanal', ops: j.ops, idPartida: idNovo() }, semB);
    ok(r1.creditou && r1.recompensa.gema === 150, `1ª vitória da semana paga Gema 150 (${r1.recompensa.gema})`);
    ok(!r2.creditou && r2.motivo === 'ja_pago_semana', '2ª vitória na MESMA semana NÃO paga');
    ok(r3.creditou && r3.recompensa.gema === 150, 'na semana seguinte paga de novo');
    ok(c.perfil.moedas.gema === g0 + 300, 'saldo subiu 300 (duas semanas)');
  } finally { DADOS.SEMANAIS.puzzles = salvo; }
})();

// --- (7) DESAFIO composição: 1ª vez Essência 20, repetição 8 (monkeypatch enemies fáceis) ---
(() => {
  contas._resetParaTeste();
  const c = novaConta();
  const salvo = DADOS.desafioComp;
  DADOS.desafioComp = () => ({ inimigos: ['cuca'], montar: { seed: 1, comeca: 0 }, recompensa: 'padrao' });
  try {
    const j = jogar(() => PROV.montarProvacao({ aliados: ['zeus', 'ogum', 'tyr'], inimigos: ['cuca'], montar: { seed: 1, comeca: 0 } }));
    ok(j.venceu, 'desafio fácil: vence (pré-condição)');
    const e0 = c.perfil.moedas.essencia;
    const r1 = pve.creditar(c, { modo: 'desafio', desafioId: 'cx_x', aliados: ['zeus', 'ogum', 'tyr'], ops: j.ops, idPartida: idNovo() }, Date.now());
    const r2 = pve.creditar(c, { modo: 'desafio', desafioId: 'cx_x', aliados: ['zeus', 'ogum', 'tyr'], ops: j.ops, idPartida: idNovo() }, Date.now());
    ok(r1.creditou && r1.recompensa.essencia === 20, `1ª vez Essência 20 (${r1.recompensa.essencia})`);
    ok(r2.creditou && r2.recompensa.essencia === 8, `repetição Essência 8 (${r2.recompensa.essencia})`);
    ok(c.perfil.moedas.essencia === e0 + 28, 'saldo de Essência subiu 20+8');
  } finally { DADOS.desafioComp = salvo; }
})();

// --- (8) DOMÍNIOS: 2 de Essência por nível + teto POR CORRIDA (30) + teto DIÁRIO (90) ---
(() => {
  contas._resetParaTeste();
  const c = novaConta();
  const lad = DADOS.dominioLadder('grega');
  const esc = DOM.domEscadaSemana(lad, 0);
  const run = { nivel: 1, bonus: 0, semanaIdx: 0, vida: [{ hp: 999, vivo: true }, { hp: 999, vivo: true }, { hp: 999, vivo: true }], reviveGasto: [] };
  const j = jogar(() => DOM.domMontarBatalha(run, esc, { seed: (1 * 7919) >>> 0 }));
  ok(j.venceu, 'domínio grega n1: vence (pré-condição)');
  const rep = () => ({ modo: 'dominio', cultura: 'grega', runId: 'runA', run: run, ops: j.ops, idPartida: idNovo() });
  const dia = Date.parse('2026-04-01T12:00:00Z');
  const e0 = c.perfil.moedas.essencia;
  let somaRun = 0;
  for (let i = 0; i < 20; i++) { const r = pve.creditar(c, rep(), dia); somaRun += r.recompensa.essencia; }
  ok(somaRun === 30, `uma corrida rende no máx 30 de Essência (rendeu ${somaRun})`);
  ok(c.perfil.moedas.essencia === e0 + 30, 'saldo subiu 30 (teto por corrida)');
  // nova corrida no MESMO dia: o teto DIÁRIO (90) continua contando — cabe +60, depois trava
  let somaDia = 30;
  for (let k = 0; k < 3; k++) {
    const runId = 'runB' + k;
    for (let i = 0; i < 20; i++) { const r = pve.creditar(c, { modo: 'dominio', cultura: 'grega', runId, run, ops: j.ops, idPartida: idNovo() }, dia); somaDia += r.recompensa.essencia; }
  }
  ok(somaDia === 90, `o teto DIÁRIO trava a Essência de PvE em 90 (deu ${somaDia})`);
  ok(c.perfil.moedas.essencia === e0 + 90, 'saldo do dia parou em +90');
})();

// ================================================================================================
// ETAPA 3 — INVOCAÇÃO e CÓPIAS no servidor. Sorteio 3-passos (faixa×raridade×deus) por FÓRMULA da faixa
// de ranque do jogador; pity 60; duplicata→PONTOS (A1/S2/SS4); excedente do deus MAX→Essência (15/40/120);
// subirNivel gasta pontos (1/2/3); débito de gema no servidor.
// ================================================================================================
const invoc = require('../server/invocacao.js');
const ECON3 = JSON.parse(require('fs').readFileSync(__dirname + '/../data/economia.json', 'utf8'));

console.log('');
console.log('== ETAPA 3: invocação por faixa×raridade (autoritativa no servidor) ==');

// contas de teste (mínimo que invocar/subirNivel leem): perfil.moedas/deuses + ranque.pontos + ledgers
function contaFake(pontosRanque, gema, deuses) {
  return { ranque: { pontos: pontosRanque || 0 }, perfil: { moedas: { gema: gema || 0, essencia: 0 }, deuses: deuses || {} }, niveis: {}, gacha: { pity: 0 }, pontos: {} };
}
function quiQuadrado(obs, esp) { let x = 0; for (let i = 0; i < obs.length; i++) if (esp[i] > 0) x += (obs[i] - esp[i]) * (obs[i] - esp[i]) / esp[i]; return x; }

// --- (1) as 8 LINHAS de faixa: batem a fórmula, somam 100, e o SS efetivo ≤ 1% em toda faixa do jogador ---
(() => {
  const esperado = {
    0: [97.5, 2, 0.4, 0.08, 0.016, 0.0032, 0.00064, 0.000128],
    1: [37.5, 60, 2, 0.4, 0.08, 0.016, 0.0032, 0.00064],
    7: [11.489, 6.383, 5.532, 5.106, 4.681, 3.830, 2.979, 60],
  };
  for (const f of [0, 1, 7]) {
    const r = invoc.linhaFaixa(Number(f));
    let bate = true; for (let i = 0; i < 8; i++) if (Math.abs(r[i] - esperado[f][i]) > 0.05) bate = false;
    ok(bate, `linha da faixa ${f} bate os valores do dono (${r.map(x => x.toFixed(2)).join('/')})`);
  }
  for (let f = 0; f < invoc.NFAIXAS; f++) {
    const r = invoc.linhaFaixa(f);
    const soma = r.reduce((a, b) => a + b, 0);
    ok(Math.abs(soma - 100) < 1e-6, `faixa ${f}: a linha soma 100 (${soma.toFixed(4)})`);
    // SS efetivo (natural, sem pity) = Σ linha[f']·1% sobre as faixas que TÊM SS
    let ssEf = 0; for (const ff of invoc.FAIXAS_COM_SS) ssEf += r[ff] * ECON3.invocacao.taxas.SS / 100;
    ok(ssEf <= 0.01 + 1e-9, `faixa ${f}: SS efetivo natural ≤ 1% (${(ssEf * 100).toFixed(3)}%)`);
  }
})();

// --- (2) QUI-QUADRADO: 1M seleções de faixa batem a linha (mecanismo puro, sem pity) ---
(() => {
  const f = 3;   // Adepto
  const row = invoc.linhaFaixa(f);
  const rng = invoc.mulberry32(20260928);
  const N = 1000000; const obs = new Array(invoc.NFAIXAS).fill(0);
  // amostra a seleção de faixa pela própria linha (o mesmo _pesoPick que o sorteio usa)
  const total = row.reduce((a, b) => a + b, 0);
  for (let i = 0; i < N; i++) { let x = rng() * total; let k = 0; for (; k < row.length; k++) { x -= row[k]; if (x < 0) break; } if (k >= row.length) k = row.length - 1; obs[k]++; }
  const esp = row.map(p => p / 100 * N);
  // gl = faixas com esperado > 5; qui-quadrado crítico ~ generoso (as caudas raríssimas juntam ruído)
  let x2 = 0, gl = 0; for (let i = 0; i < obs.length; i++) if (esp[i] > 30) { x2 += (obs[i] - esp[i]) ** 2 / esp[i]; gl++; }
  ok(x2 < 30, `1M sorteios de faixa (Adepto): qui-quadrado ${x2.toFixed(2)} dentro do esperado (gl≈${gl})`);
})();

// --- (3) RARIDADE NATURAL dentro de uma faixa cheia: SS≈1 / S≈14 / A≈85 (1M, sem pity) ---
// (o pity — que garante SS a cada 60 — é medido à parte no item 4; aqui é a taxa NATURAL da raridade.)
(() => {
  let f = -1; for (let i = 0; i < invoc.NFAIXAS; i++) if (invoc.POOL[i].A.length && invoc.POOL[i].S.length && invoc.POOL[i].SS.length) { f = i; break; }
  ok(f >= 0, `existe faixa com as 3 raridades (faixa ${f})`);
  const rng = invoc.mulberry32(777);
  const N = 1000000; const t = { SS: 0, S: 0, A: 0 };
  for (let i = 0; i < N; i++) t[invoc._raridadeNaFaixa(f, rng)]++;
  const ssPct = t.SS / N * 100, sPct = t.S / N * 100, aPct = t.A / N * 100;
  ok(Math.abs(ssPct - 1) < 0.15, `SS natural ≈ 1% (${ssPct.toFixed(3)}%)`);
  ok(Math.abs(sPct - 14) < 0.5, `S natural ≈ 14% (${sPct.toFixed(2)}%)`);
  ok(Math.abs(aPct - 85) < 0.5, `A natural ≈ 85% (${aPct.toFixed(2)}%)`);
})();

// --- (4) PITY 60: 60 sorteios sem SS garantem SS no 60º, e o contador zera ---
(() => {
  // rng que nunca dá SS naturalmente (x sempre alto) para isolar o pity
  const rngSemSS = () => 0.999999;
  const est = { pity: 0 };
  let ssEm = -1;
  for (let i = 1; i <= 60; i++) { const o = invoc.sortearUm(est, 3, rngSemSS, null); if (o.raridade === 'SS') { ssEm = i; break; } }
  ok(ssEm === 60, `pity DURO entrega SS exatamente no 60º sorteio (deu ${ssEm})`);
  ok(est.pity === 0, 'o contador de pity zera após o SS garantido');
})();

// --- (5) INVOCAR: débito de gema + posse/pontos/essência ---
(() => {
  const c = contaFake(0, 300, {});   // Suplicante, 300 gema
  const rng = invoc.mulberry32(42);
  const r = invoc.invocar(c, { pacote: false }, 0, rng);
  ok(r.ok && r.saldo.gema === 150, `avulso debita 150 gema (saldo ${r.saldo.gema})`);
  ok(r.resultados.length === 1 && r.resultados[0].novo, 'o 1º deus é NOVO (posse)');
  ok(c.perfil.deuses[r.resultados[0].key] && c.perfil.deuses[r.resultados[0].key].copias === 1, 'deus novo entra com 1 cópia');
  // segunda cópia do MESMO deus (força uma duplicata dando o deus e re-invocando com rng que o repita não é trivial;
  // testamos a conversão diretamente pela regra): dar o deus, marcá-lo não-max, e invocar até repetir
  const k = r.resultados[0].key, rar = r.resultados[0].raridade;
  // simula uma duplicata: chama invocar num rng preparado é frágil; validamos a REGRA de pontos via muitos pulls
  let dupViu = false;
  const c2 = contaFake(0, 100000, {}); const rng2 = invoc.mulberry32(7);
  for (let i = 0; i < 60 && !dupViu; i++) { const rr = invoc.invocar(c2, { pacote: true }, 0, rng2); for (const o of rr.resultados) if (o.pontos > 0) { dupViu = true; ok((ECON3.invocacao.pontosPorDuplicata[o.raridade]) === o.pontos, `duplicata ${o.raridade} vira ${o.pontos} ponto(s) (A1/S2/SS4)`); break; } }
  ok(dupViu, 'duplicatas viram PONTOS ao longo de vários pacotes');
})();

// --- (6) EXCEDENTE: deus MAXIMIZADO (3 slots nv4) → duplicata vira Essência (15/40/120) ---
(() => {
  const c = contaFake(0, 100000, { zeus: { copias: 1, favorito: false, obtidoEm: 0 } });
  c.niveis = { zeus: { basico: 4, habilidade: 4, milagre: 4 } };   // zeus MAX (SS)
  ok(invoc._maximizado(c, 'zeus'), 'zeus está maximizado (3 slots no nv4)');
  const e0 = c.perfil.moedas.essencia;
  // força um destaque em zeus (SS) via pity: 60 pulls forçam SS = zeus (destaque)
  const est = { pity: 59 };
  const o = invoc.sortearUm(est, invoc.FAIXA_DEUS.zeus || 0, () => 0.5, 'zeus');
  ok(o.key === 'zeus' && o.raridade === 'SS', 'o destaque no pity entrega o zeus (SS)');
  // aplica a regra do excedente diretamente por invocar com destaque zeus e pity alto
  const c2 = contaFake(0, 100000, { zeus: { copias: 1, favorito: false, obtidoEm: 0 } });
  c2.niveis = { zeus: { basico: 4, habilidade: 4, milagre: 4 } };
  c2.gacha.pity = 59;   // o próximo pull força SS = zeus (destaque), que está MAX → Essência
  const rr = invoc.invocar(c2, { pacote: false, destaque: 'zeus' }, 0, () => 0.5);
  const zres = rr.resultados[0];
  ok(zres.key === 'zeus' && zres.essencia === ECON3.invocacao.essenciaPorDuplicata.SS, `excedente SS do zeus MAX vira Essência ${zres.essencia} (=120)`);
  ok(c2.perfil.moedas.essencia === e0 + ECON3.invocacao.essenciaPorDuplicata.SS, 'a Essência do excedente entra no saldo');
})();

// --- (7) SUBIR NÍVEL: custo 1/2/3, gasta pontos, e todas as recusas ---
(() => {
  const c = contaFake(0, 0, { zeus: { copias: 1, favorito: false, obtidoEm: 0 } });
  c.pontos = { zeus: 6 };   // exatamente 1+2+3 = maximiza UM slot do nv1 ao nv4
  let r = invoc.subirNivel(c, 'zeus', 'basico');
  ok(r.ok && r.nivel === 2 && c.pontos.zeus === 5, `nv1→2 custa 1 ponto (sobrou ${c.pontos.zeus})`);
  r = invoc.subirNivel(c, 'zeus', 'basico');
  ok(r.ok && r.nivel === 3 && c.pontos.zeus === 3, `nv2→3 custa 2 pontos (sobrou ${c.pontos.zeus})`);
  r = invoc.subirNivel(c, 'zeus', 'basico');
  ok(r.ok && r.nivel === 4 && c.pontos.zeus === 0, `nv3→4 custa 3 pontos (sobrou ${c.pontos.zeus})`);
  r = invoc.subirNivel(c, 'zeus', 'basico');
  ok(!r.ok && r.motivo === 'nivel_maximo', 'slot no topo (nv4, escada completa) recusa (nivel_maximo, regra j\')');
  r = invoc.subirNivel(c, 'zeus', 'habilidade');
  ok(!r.ok && r.motivo === 'pontos_insuficientes', 'sem pontos recusa (pontos_insuficientes)');
  r = invoc.subirNivel(c, 'zeus', 'lixo');
  ok(!r.ok && r.motivo === 'slot_invalido', 'slot inexistente recusa (slot_invalido)');
  r = invoc.subirNivel(c, 'poseidon', 'basico');
  ok(!r.ok && r.motivo === 'nao_possui', 'deus não possuído recusa (nao_possui)');
})();

// --- (7b) §318 F3 TRAVA DE LIBERAÇÃO: subir nível só em deus cuja escada passou na triagem ---
(() => {
  // deus POSSUÍDO e COM pontos, mas FORA da lista de liberados → recusa 'niveis_nao_liberados'
  // §318 F3 FECHO: a FASE 3 liberou os 100 deuses reais, então NÃO há mais um deus do catálogo fora da lista. A trava
  // em si (subirNivel checa possui→liberados) continua valendo para QUALQUER chave fora da lista: usamos uma chave
  // sintética que a conta "possui" mas que nunca entrará em niveis_liberados.json. (Se um dia houver deus real não
  // liberado, este teste segue correto — a trava não distingue chave real de sintética, só olha a lista.)
  const naoLib = '__teste_nao_liberado__';
  ok(!invoc.NIVEIS_LIBERADOS.has(naoLib), 'a chave de teste não está na lista de liberados (a trava deve recusá-la)');
  const c = contaFake(0, 0, { [naoLib]: { copias: 1, favorito: false, obtidoEm: 0 } });
  c.pontos = { [naoLib]: 6 };
  let r = invoc.subirNivel(c, naoLib, 'basico');
  ok(!r.ok && r.motivo === 'niveis_nao_liberados', `deus fora da lista de liberados recusa (${naoLib} → niveis_nao_liberados)`);
  ok((c.pontos[naoLib] === 6) && !(c.niveis && c.niveis[naoLib]), 'a recusa não gasta pontos nem cria nível');
  // deus LIBERADO (zeus) com pontos → sobe normalmente
  const c2 = contaFake(0, 0, { zeus: { copias: 1, favorito: false, obtidoEm: 0 } });
  c2.pontos = { zeus: 1 };
  const r2 = invoc.subirNivel(c2, 'zeus', 'basico');
  ok(invoc.NIVEIS_LIBERADOS.has('zeus') && r2.ok && r2.nivel === 2, 'deus liberado (zeus) sobe de nível');
  // §318 F3 (f'): subir o BÁSICO de um deus muito durável (Aquiles/Kraken, sem escada no básico) → nivel_inexistente
  const durao = ['aquiles', 'kraken'].find(k => invoc.NIVEIS_LIBERADOS.has(k));
  if (durao) {
    const c3 = contaFake(0, 0, { [durao]: { copias: 1, favorito: false, obtidoEm: 0 } });
    c3.pontos = { [durao]: 6 };
    const rb = invoc.subirNivel(c3, durao, 'basico');
    ok(!rb.ok && rb.motivo === 'nivel_inexistente', `básico de deus (f') recusa (${durao} → nivel_inexistente)`);
    const rh = invoc.subirNivel(c3, durao, 'habilidade');
    ok(rh.ok && rh.nivel === 2, `${durao} sobe habilidade normalmente (só o básico é bloqueado)`);
    // _maximizado conta só as escadas EXISTENTES: hab+milagre nv4 já maximiza (básico não tem escada)
    ok(invoc._maximizado({ niveis: { [durao]: { basico: 1, habilidade: 4, milagre: 4 } } }, durao), `${durao} maximiza com hab+milagre nv4 (básico não conta, regra f')`);
  }
})();

// --- (7c) §318 F3 L12 REGRA (j') ESCADA CURTA no servidor: topo = 1 + nº de degraus. subirNivel recusa acima do
// topo ('nivel_maximo'); _maximizado usa o topo por slot (Fujin básico/milagre têm 2 degraus → topo 3). ---
(() => {
  if (!invoc.NIVEIS_LIBERADOS.has('fujin')) { ok(true, '(7c pulado: fujin não liberado)'); return; }
  const topoBas = require('../src/catalogo.js').GODS.fujin.ab.find(a => a.slot === 'basico').niveis.length + 1;
  ok(topoBas === 3, `Fujin básico é escada curta: topo = 1 + ${topoBas - 1} degraus = ${topoBas}`);
  const c = contaFake(0, 0, { fujin: { copias: 1, favorito: false, obtidoEm: 0 } });
  c.pontos = { fujin: 99 };
  ok(invoc.subirNivel(c, 'fujin', 'basico').nivel === 2, 'Fujin básico 1→2 sobe');
  ok(invoc.subirNivel(c, 'fujin', 'basico').nivel === 3, 'Fujin básico 2→3 sobe (topo curto)');
  const rMax = invoc.subirNivel(c, 'fujin', 'basico');
  ok(!rMax.ok && rMax.motivo === 'nivel_maximo' && rMax.topo === 3, "Fujin básico 3→4 recusa: acima do topo (nivel_maximo, topo 3)");
  // milagre também é curto (topo 3); habilidade é completa (topo 4)
  invoc.subirNivel(c, 'fujin', 'milagre'); invoc.subirNivel(c, 'fujin', 'milagre');
  const rMil = invoc.subirNivel(c, 'fujin', 'milagre');
  ok(!rMil.ok && rMil.motivo === 'nivel_maximo', 'Fujin milagre 3→4 recusa (topo 3 curto)');
  // _maximizado: básico 3 + milagre 3 + habilidade 4 (cada no SEU topo) → maximizado
  ok(invoc._maximizado({ niveis: { fujin: { basico: 3, habilidade: 4, milagre: 3 } } }, 'fujin'), 'Fujin maximiza com básico 3 + milagre 3 + habilidade 4 (topo por slot, j\')');
  ok(!invoc._maximizado({ niveis: { fujin: { basico: 3, habilidade: 3, milagre: 3 } } }, 'fujin'), 'Fujin NÃO maximiza com habilidade 3 (topo dela é 4)');
})();

// --- (8) SEM GEMAS → recusa (nada muda) ---
(() => {
  const c = contaFake(0, 100, {});   // 100 gema < 150
  const antes = JSON.stringify(c.perfil);
  const r = invoc.invocar(c, { pacote: false }, 0, invoc.mulberry32(1));
  ok(!r.ok && r.motivo === 'gemas_insuficientes', 'invocar sem gema suficiente recusa');
  ok(JSON.stringify(c.perfil) === antes, 'a recusa não mexe no perfil (sem débito, sem sorteio)');
  const r2 = invoc.invocar(c, { pacote: true }, 0, invoc.mulberry32(1));
  ok(!r2.ok && r2.motivo === 'gemas_insuficientes', 'pacote sem 1350 recusa também');
})();

// ================================================================================================
// §318 F2 — RENDA DE GEMA por VITÓRIA de PvP (ranqueado e casual). 15/vitória, teto 10/dia no relógio do
// SERVIDOR, mínimo de rodadas (anti-farm). Derrota/empate não pagam (crédito é win-only, por construção).
// ================================================================================================
console.log('');
console.log('== PvP: renda contínua de Gema por vitória (autoritativa no servidor) ==');
const pvem = require('../server/pve.js');
const VG = ECON3.pvp.vitoria.gema, VTETO = ECON3.pvp.tetoDia, VMINR = ECON3.pvp.minRodadas;

// --- (1) vitória (>= minRodadas) paga 15; a (teto+1)ª do dia não paga; o dia seguinte zera ---
(() => {
  const c = contaFake(0, 0, {});
  const dia = Date.parse('2026-05-10T12:00:00Z');
  let creditadas = 0, somaGema = 0;
  for (let i = 0; i < VTETO + 3; i++) { const r = pvem.creditarPvP(c, VMINR, dia); if (r.creditou) { creditadas++; somaGema += r.gema; } }
  ok(creditadas === VTETO, `paga no máximo ${VTETO} vitórias/dia (pagou ${creditadas})`);
  ok(somaGema === VTETO * VG, `${VTETO} vitórias = ${VTETO * VG} gema (deu ${somaGema})`);
  const r11 = pvem.creditarPvP(c, VMINR, dia);
  ok(!r11.creditou && r11.motivo === 'teto_diario', `a ${VTETO + 1}ª do dia não paga (teto_diario)`);
  const rAmanha = pvem.creditarPvP(c, VMINR, dia + 24 * 3600 * 1000);
  ok(rAmanha.creditou && rAmanha.gema === VG, 'no dia seguinte volta a pagar (reset por data do servidor)');
})();

// --- (2) a 1ª vitória paga EXATO 15 e credita no saldo do servidor ---
(() => {
  const c = contaFake(0, 0, {});
  const g0 = c.perfil.moedas.gema;
  const r = pvem.creditarPvP(c, VMINR, Date.now());
  ok(r.creditou && r.gema === VG, `vitória paga ${VG} gema exato (deu ${r.gema})`);
  ok(c.perfil.moedas.gema === g0 + VG, 'o saldo do servidor subiu 15');
  ok(r.vitoriasHoje === 1 && r.teto === VTETO, `a tela recebe "${r.gema} gemas (${r.vitoriasHoje}/${r.teto} hoje)"`);
})();

// --- (3) partida curta (< minRodadas) NÃO paga, mesmo com vitória (anti-farm/abandono cedo) ---
(() => {
  const c = contaFake(0, 0, {});
  const g0 = c.perfil.moedas.gema;
  const r = pvem.creditarPvP(c, VMINR - 1, Date.now());
  ok(!r.creditou && r.motivo === 'partida_curta', `vitória com < ${VMINR} rodadas não paga (partida_curta)`);
  ok(c.perfil.moedas.gema === g0, 'saldo intacto na partida curta');
  const r2 = pvem.creditarPvP(c, VMINR, Date.now());
  ok(r2.creditou, `com ${VMINR} rodadas já paga`);
})();

// --- (4) o CLIENTE não credita: forjar gema via salvarPerfil não muda a conta (mesmo após "vencer") ---
(() => {
  contas._resetParaTeste();
  const r = contas.criar({ faixaIdade: 'maior' });
  const tok = r.conta.token;
  const g0 = contas.porToken(tok).perfil.moedas.gema;
  const forj = clone(contas.porToken(tok).perfil); forj.moedas.gema += 99999;
  contas.salvarPerfil(tok, forj);
  ok(contas.porToken(tok).perfil.moedas.gema === g0, 'cliente forjando gema de PvP via salvarPerfil → conta inalterada');
  contas._resetParaTeste();
})();

console.log('');
console.log(falhas === 0 ? '>>> ECONOMIA OK' : `>>> ${falhas} FALHA(S)`);
process.exit(falhas ? 1 : 0);
