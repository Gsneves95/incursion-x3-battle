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
      for (const u of st.lados[0].units) {
        if (st.fim) break;
        if (!E.podeAgir(u)) continue;
        const acoes = E.acoesDe(st, u).filter(a => a.disponivel);
        if (!acoes.length) continue;
        const a = acoes[0];
        let alvos = [];
        if (a.alvo === 'distribui') { const vs = E.alvosValidos(st, u, a, 0, []); if (vs.length) alvos = [vs[0].uid]; }
        else { const passos = (a.passos || []).length; let bom = true; for (let p = 0; p < passos; p++) { const vs = E.alvosValidos(st, u, a, p, alvos); if (!vs.length) { bom = false; break; } alvos.push(vs[0].uid); } if (!bom) continue; }
        const r = E.agir(st, u.uid, a.slot, alvos, null, null);
        if (r && r.ok) ops.push({ tipo: 'agir', uid: u.uid, slot: a.slot, alvos, escolhas: null, modo: null });
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

console.log('');
console.log(falhas === 0 ? '>>> ECONOMIA OK' : `>>> ${falhas} FALHA(S)`);
process.exit(falhas ? 1 : 0);
