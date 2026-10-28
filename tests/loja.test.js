// §370 — LOJA (servidor + dados). Prova TUDO do enunciado, e as compras/créditos rodam sobre os DOIS armazenamentos
// (ARQUIVO e PostgreSQL pg-mem), como o §354: a idempotência por recibo e a concorrência têm de valer nos dois.
//   1ª-compra-em-dobro só na 1ª de cada pacote; mesmo id paga 1× (recibo); passe: resgate hoje / ontem não-resgatado é
//   PERDIDO / 30 dias / dia 30 SS pela regra (faixa ≤ jogador, inédito; tudo tendo → pontos) / recomprar ativo RECUSA;
//   bilhete: desconta 1, sem gema, avança o pity; Deus da Semana: determinístico por semana, nunca repete em 12, só S,
//   5 marcas dão o deus, 2/dia com passe, marcas zeram na virada; anúncios: limite por tipo + teto 8/dia, com passe
//   credita sem assistir, invocação grátis avança o pity; vaga extra de Provação até +2; sem LOJA_SIMULADA compra/anúncio
//   respondem "pagamento indisponível"; concorrência: 20 compras simultâneas somam certo.
const fs = require('fs');
const path = require('path');
const os = require('os');
const { newDb } = require('pg-mem');
const arm = require(path.join(__dirname, '..', 'server', 'armazenamento.js'));
const loja = require(path.join(__dirname, '..', 'server', 'loja.js'));
const invoc = require(path.join(__dirname, '..', 'server', 'invocacao.js'));
const RARIDADE = require(path.join(__dirname, '..', 'data', 'raridades.json'));

let falhas = 0, passes = 0;
const ok = (c, m) => { if (!c) { console.log('  ✗ FALHA: ' + m); falhas++; } else { console.log('  ✓ ' + m); passes++; } };

const SEGREDO = 'FAKE_MARCADO_SEGREDO_NAO_VAZAR';
const URL_FALSA = `postgres://u:${SEGREDO}@host.exemplo/db?sslmode=require`;
const tmpDir = () => fs.mkdtempSync(path.join(os.tmpdir(), 'incloja-'));

// relógio: segunda-feira âncora + dia(n) = o n-ésimo dia (meio-dia UTC) do calendário do passe.
const SEG = Date.UTC(2026, 0, 12, 12, 0, 0);       // 2026-01-12 é segunda
const dia = (n) => SEG + (n - 1) * 86400000 + 3600000;
const semEnv = () => { delete process.env.LOJA_SIMULADA; };
const comEnv = () => { process.env.LOJA_SIMULADA = '1'; };
const SIM = { simulado: true };

// ---------------- provas PURAS (independem de armazenamento; rodam 1×) ----------------
function provasPuras() {
  console.log('\n== PURO · Deus da Semana + calendário do passe ==');
  // determinístico por semana e nunca repete em 12 (na verdade em |S| = 31) + só S
  const seq = [];
  for (let w = 0; w < 31; w++) seq.push(loja.deusDaSemana(SEG + w * 7 * 86400000));
  ok(new Set(seq).size === 31, 'rotação não repete em 31 semanas (⇒ nunca em 12)');
  ok(seq.every(k => RARIDADE[k] === 'S'), 'o Deus da Semana é SEMPRE raridade S');
  ok(loja.deusDaSemana(SEG) === loja.deusDaSemana(SEG + 6 * 86400000) && loja.deusDaSemana(SEG) !== loja.deusDaSemana(SEG + 7 * 86400000),
    'determinístico na semana; vira só na segunda seguinte');

  // 5 marcas (1/dia) dão o deus; marcas zeram na virada de semana
  const c = { perfil: { moedas: { gema: 0, essencia: 0 }, deuses: {} }, ranque: { pontos: 0 } };
  let ganhou = null;
  for (let d = 1; d <= 5; d++) { const m = loja.marcarDeusSemana(c, dia(d)); if (m.concedido) ganhou = m; }
  ok(ganhou && ganhou.marcas === 5, '5 marcas (1/dia) concedem o Deus da Semana');
  const prox = loja.marcarDeusSemana(c, dia(8));   // semana seguinte
  ok(prox.ok && prox.marcas === 1, 'na virada de semana as marcas zeram (recomeça em 1)');

  // 2 marcas/dia com o passe → 5 em 3 dias
  const c2 = { perfil: { moedas: { gema: 0, essencia: 0 }, deuses: {} }, ranque: { pontos: 0 } };
  loja.comprarPasse(c2, dia(1));
  loja.marcarDeusSemana(c2, dia(1)); loja.marcarDeusSemana(c2, dia(2)); const terceiro = loja.marcarDeusSemana(c2, dia(3));
  ok(terceiro.marcas === 5 && terceiro.concedido, 'com o passe são 2 marcas/dia (5 em 3 dias)');
}

// ---------------- provas sobre contas.js, rodadas em CADA armazenamento ----------------
async function provasLoja(contas, rotulo) {
  console.log(`\n== ${rotulo} ==`);
  const novo = () => { const r = contas.criar({ faixaIdade: 'maior' }); contas.devCredito(r.conta.token); return r.conta.token; };   // +grantTeste de gema

  // 1) PACOTE: 1ª compra em dobro só na 1ª de cada pacote; mesmo id paga 1× (recibo).
  comEnv();
  {
    const t = novo();
    const base = contas.paraDono(contas.entrar(t).conta).perfil.moedas.gema;
    const a = await contas.comprarPacote(t, 'p1', 'A', SIM);
    ok(a.ok && a.emDobro && a.gemas === 450 * 2, '1ª compra do p1 vem em DOBRO (900)');
    const b = await contas.comprarPacote(t, 'p1', 'B', SIM);
    ok(b.ok && !b.emDobro && b.gemas === 450, '2ª compra do p1 (id novo) NÃO dobra (450)');
    const saldoDepois = b.conta.perfil.moedas.gema;
    const dup = await contas.comprarPacote(t, 'p1', 'B', SIM);   // MESMO id da 2ª
    ok(dup.duplicado === true && dup.conta.perfil.moedas.gema === saldoDepois, 'mesmo idCompra NÃO paga de novo (idempotente por recibo)');
  }

  // 2) PASSE: resgate hoje / dia pulado é PERDIDO / recomprar ativo RECUSA / dia 7 dá bilhetes / dia 30 é SS.
  {
    const t = novo();
    const compra = await contas.comprarPasse(t, 'PASSE1', SIM, dia(1));
    ok(compra.ok, 'passe comprado (simulado)');
    const r1 = contas.resgatarPasse(t, dia(1));
    ok(r1.ok && r1.premio.gema === 150, 'resgate do dia 1 (150 gemas)');
    ok(contas.resgatarPasse(t, dia(1)).codigo === 'ja_resgatado_hoje', 'resgatar o mesmo dia 2× recusa');
    const r3 = contas.resgatarPasse(t, dia(3));   // pulou o dia 2
    ok(r3.ok, 'resgate do dia 3 (pulando o 2)');
    const est = loja.estadoPasse(contas.entrar(t).conta, dia(3));
    ok(est.dias[1].estado === 'perdido', 'o dia 2 não resgatado é PERDIDO (não se recupera)');
    const recompra = await contas.comprarPasse(t, 'PASSE2', SIM, dia(5));
    ok(!recompra.ok && recompra.codigo === 'passe_ativo', 'recomprar com o passe ATIVO é RECUSADO (regra §370)');
    const r7 = contas.resgatarPasse(t, dia(7));
    ok(r7.ok && r7.premio.bilhetes === 3 && r7.bilhetes >= 3, 'dia 7 dá 3 bilhetes');
    const r30 = contas.resgatarPasse(t, dia(30), () => 0);
    ok(r30.ok && r30.premio.ss && r30.premio.ss.ok, 'dia 30 concede 1 SS');
    ok(contas.resgatarPasse(t, dia(31)).codigo === 'passe_expirado', 'fora dos 30 dias não resgata');
  }

  // 2b) DIA 30 SS pela REGRA: inédito na faixa ≤ jogador; se tem TODOS, vira pontos.
  {
    // inédito: jogador de faixa ALTA (há SS que ele não tem) → SS novo, de faixa ≤ a dele.
    const t = novo();
    contas._setPontos(t, 1000000);   // sobe a faixa ao topo (há SS inéditos nas faixas ≤ a dele)
    const fJog = invoc.faixaDoJogador(contas.entrar(t).conta);
    await contas.comprarPasse(t, 'PX', SIM, dia(1));
    const r = contas.resgatarPasse(t, dia(30), () => 0);
    ok(r.ok && r.premio.ss.novo === true && r.premio.ss.faixa <= fJog, 'dia 30: SS INÉDITO e de faixa ≤ a do jogador');
    // tem TODOS os SS da faixa (≤ jogador) → vira PONTOS (duplicata SS = 4). Faixa 0: o único SS (zeus) já é inicial.
    const t2 = novo();   // faixa 0; já possui zeus (único SS da faixa 0)
    await contas.comprarPasse(t2, 'PY', SIM, dia(1));
    const r2 = contas.resgatarPasse(t2, dia(30), () => 0);
    ok(r2.ok && r2.premio.ss.novo === false && r2.premio.ss.pontos === 4, 'dia 30: tendo todos os SS da faixa → vira pontos (SS=4)');
  }

  // 3) BILHETE: desconta 1, sem gema, avança o pity.
  {
    const t = novo();
    await contas.comprarPasse(t, 'PB', SIM, dia(1));
    contas.resgatarPasse(t, dia(7));   // +3 bilhetes
    const antes = contas.paraDono(contas.entrar(t).conta);   // projeção: pity/bilhetes já expostos
    const gemaAntes = antes.perfil.moedas.gema, bilAntes = antes.bilhetes, pityAntes = antes.pity;
    const inv = contas.invocar(t, { bilhete: true }, dia(7));
    const dep = inv.conta;
    ok(inv.ok && dep.bilhetes === bilAntes - 1, 'usar bilhete desconta exatamente 1 bilhete');
    ok(dep.perfil.moedas.gema === gemaAntes, 'usar bilhete NÃO gasta gema');
    const avancouPity = (dep.pity === pityAntes + 1) || (inv.resultados.some(r => r.raridade === 'SS') && dep.pity === 0);   // SS zera o pity
    ok(avancouPity, 'a invocação por bilhete AVANÇA o pity (como uma paga)');
    // sem bilhetes: recusa
    const t2 = novo();
    ok(contas.invocar(t2, { bilhete: true }, dia(1)).motivo === 'sem_bilhete', 'sem bilhete, invocar por bilhete recusa');
  }

  // 4) ANÚNCIOS: limite por tipo + teto 8/dia; com passe credita sem assistir; invocação grátis avança o pity.
  comEnv();
  {
    const t = novo();
    const a1 = await contas.creditarAnuncio(t, 'invocacaoGratis', 'ig1', SIM, {}, dia(1));
    ok(a1.ok && a1.premio.invocacao, 'anúncio de invocação grátis credita (simulado)');
    const pityDepois = a1.conta.pity;
    ok(typeof pityDepois === 'number' && pityDepois >= 1, 'a invocação grátis avança o pity');
    const a2 = await contas.creditarAnuncio(t, 'invocacaoGratis', 'ig2', SIM, {}, dia(1));
    ok(!a2.ok && a2.codigo === 'limite_tipo', 'invocação grátis: limite 1/dia');
    // teto 8/dia: dispara tipos distintos até bater 8 e o 9º recusa
    const t3 = novo();
    const tipos = ['invocacaoGratis', 'marcaDeusSemana', 'dobrarSemanal', 'dobrarDominio', 'ofertaDia', 'ofertaDia', 'ofertaDia', 'reviverExtra'];
    let totalOk = 0;
    for (let i = 0; i < tipos.length; i++) { const r = await contas.creditarAnuncio(t3, tipos[i], 'cap' + i, SIM, { escolha: 'gema', runId: 'run1' }, dia(1)); if (r.ok) totalOk++; }
    ok(totalOk === 8, `8 anúncios creditam no dia (deu ${totalOk})`);
    const nono = await contas.creditarAnuncio(t3, 'acelerarRecarga', 'cap9', SIM, {}, dia(1));
    ok(!nono.ok && nono.codigo === 'teto_diario', 'o 9º anúncio do dia bate no teto de 8');
  }
  // com o passe: credita SEM assistir (sem LOJA_SIMULADA)
  {
    comEnv();
    const t = novo();
    await contas.comprarPasse(t, 'PP', SIM, dia(1));
    semEnv();
    const r = await contas.creditarAnuncio(t, 'ofertaDia', 'semassistir', null, { escolha: 'gema' }, dia(1));
    ok(r.ok && r.premio.valor === 50, 'com o passe, o anúncio credita SEM assistir (sem LOJA_SIMULADA)');
  }

  // 5) VAGA EXTRA DE PROVAÇÃO: até +2.
  comEnv();
  {
    const t = novo();
    const base = loja.vagasProvacao(contas.entrar(t).conta);
    const v1 = await contas.comprarVagaProvacao(t, 'VA');
    const v2 = await contas.comprarVagaProvacao(t, 'VB');
    const v3 = await contas.comprarVagaProvacao(t, 'VC');
    ok(v1.ok && v2.ok && v2.vagas === base + 2, 'comprar 2 vagas extras: total = base + 2');
    ok(!v3.ok && v3.codigo === 'max_vagas', 'a 3ª vaga extra é recusada (máx +2)');
  }

  // 6) SEM LOJA_SIMULADA: compra e anúncio respondem "pagamento indisponível".
  {
    semEnv();
    const t = novo();
    const compra = await contas.comprarPacote(t, 'p1', 'ne1', SIM);
    ok(!compra.ok && compra.codigo === 'pagamento_indisponivel' && compra.erro === 'pagamento indisponível', 'sem LOJA_SIMULADA: compra = "pagamento indisponível"');
    const anuncio = await contas.creditarAnuncio(t, 'ofertaDia', 'ne2', SIM, { escolha: 'gema' }, dia(1));
    ok(!anuncio.ok && anuncio.codigo === 'pagamento_indisponivel' && anuncio.erro === 'pagamento indisponível', 'sem LOJA_SIMULADA e sem passe: anúncio = "pagamento indisponível"');
  }

  // 7) CONCORRÊNCIA: 20 compras simultâneas do mesmo pacote (ids distintos) somam certo (1ª em dobro + 19 simples).
  comEnv();
  {
    const t = novo();
    const base = contas.entrar(t).conta.perfil.moedas.gema;
    await Promise.all(Array.from({ length: 20 }, (_, i) => contas.comprarPacote(t, 'p2', 'c' + i, SIM)));
    if (contas.drenar) await contas.drenar();
    const total = contas.entrar(t).conta.perfil.moedas.gema - base;
    const esperado = 950 * 2 + 19 * 950;   // 1ª do p2 em dobro + 19 simples
    ok(total === esperado, `20 compras simultâneas somam certo (${total} === ${esperado})`);
  }
  semEnv();
}

(async () => {
  console.log('== §370 / LOJA (pg-mem + arquivo) ==');
  provasPuras();

  const contas = require(path.join(__dirname, '..', 'server', 'contas.js'));

  // ARQUIVO
  await contas._usarArmazenamentoTeste(arm.criar({ dir: tmpDir() }));
  await provasLoja(contas, 'ARQUIVO · contas.js ponta a ponta');

  // POSTGRES (pg-mem)
  const pg = newDb({ noAstCoverageCheck: true }).adapters.createPg();
  await contas._usarArmazenamentoTeste(arm.criar({ databaseUrl: URL_FALSA, pg, dir: tmpDir() }));
  await provasLoja(contas, 'POSTGRES (pg-mem) · contas.js ponta a ponta');

  if (falhas) { console.log(`\n>>> ${falhas} FALHA(S) (${passes} ok)`); process.exit(1); }
  console.log(`\n>>> LOJA §370 OK (${passes})`);
  process.exit(0);
})().catch(e => { console.error(e.stack || e.message || e); process.exit(1); });
