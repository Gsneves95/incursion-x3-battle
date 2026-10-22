// §354 — PERSISTÊNCIA das contas. Roda contra um PostgreSQL em memória (pg-mem, SQL comum + transações) E contra o
// armazenamento de ARQUIVO. Prova: conta sobrevive a "reinício" (novo processo, mesmo banco); 20 créditos simultâneos
// somam 20×; o mesmo recibo pago 2× paga 1×; apelido duplicado é recusado pelo banco; a importação única funciona e não
// repete; /saude não tem segredo; o servidor não cai com o banco fora; nenhum log/erro contém o DATABASE_URL.
// O AMBIENTE DE TESTE NÃO ACESSA O NEON: o Postgres é pg-mem (injetado), e o DATABASE_URL usado é um valor FALSO marcado.
const fs = require('fs');
const path = require('path');
const os = require('os');
const { newDb } = require('pg-mem');
const arm = require(path.join(__dirname, '..', 'server', 'armazenamento.js'));

let falhas = 0, passes = 0;
const ok = (c, m) => { if (!c) { console.log('  ✗ FALHA: ' + m); falhas++; } else { console.log('  ✓ ' + m); passes++; } };

// valor FALSO marcado: se vazar em log/erro, o teste 8 pega.
const SEGREDO = 'FAKE_MARCADO_SEGREDO_NAO_VAZAR';
const URL_FALSA = `postgres://u:${SEGREDO}@host.exemplo/db?sslmode=require`;
const tmpDir = () => fs.mkdtempSync(path.join(os.tmpdir(), 'incpersist-'));
const conta = (t, extra) => Object.assign({ token: t, id: 'id-' + t, nick: null, perfil: { moedas: { gema: 0, essencia: 0 }, deuses: {} } }, extra || {});

// um "provedor" Postgres novo sobre o MESMO banco pg-mem (simula outro processo ligando no mesmo banco).
function pgCompartilhado() { const db = newDb({ noAstCoverageCheck: true }); const pg = db.adapters.createPg(); return () => arm.criar({ databaseUrl: URL_FALSA, pg, dir: tmpDir() }); }

(async () => {
  console.log('== §354 / PERSISTÊNCIA (pg-mem + arquivo) ==');

  // ---------- A) POSTGRES (pg-mem) ----------
  console.log('\n== A. PostgreSQL (pg-mem) ==');
  {
    const abrir = pgCompartilhado();
    // 1) sobrevive a reinício: store1 cria; store2 (novo "processo", mesmo banco) encontra.
    const s1 = abrir(); await s1.pronto();
    await s1.salvarConta(conta('t1', { nick: 'Zeus Fan', perfil: { moedas: { gema: 7 } } }));
    const s2 = abrir(); await s2.pronto();
    const achou = (await s2.carregarContas()).find(c => c.token === 't1');
    ok(!!achou && achou.perfil.moedas.gema === 7, 'conta criada CONTINUA após "reiniciar" (novo processo, mesmo banco)');

    // 2) 20 créditos simultâneos de gema na MESMA conta → exatamente 20× o valor.
    await s2.salvarConta(conta('cred', { perfil: { moedas: { gema: 0 } } }));
    await Promise.all(Array.from({ length: 20 }, () => s2.transacao('cred', d => { d.perfil.moedas.gema += 5; })));
    const soma = (await s2.carregarContas()).find(c => c.token === 'cred').perfil.moedas.gema;
    ok(soma === 100, `20 créditos simultâneos somam exatamente 20×5=100 (veio ${soma})`);

    // 3) o mesmo recibo de prêmio pago 2× paga 1×.
    ok(await s2.reservarRecibo('premio:abc') === true, '1ª vez: o recibo é aceito');
    ok(await s2.reservarRecibo('premio:abc') === false, '2ª vez: o MESMO recibo é recusado (paga 1×)');

    // 4) apelido duplicado é recusado PELO BANCO.
    await s2.salvarConta(conta('na', { nick: 'Repetido' }));
    let recusou = false;
    try { await s2.salvarConta(conta('nb', { nick: 'Repetido' })); } catch (e) { recusou = (e && e.code === '23505'); }
    ok(recusou, 'apelido duplicado é recusado pelo banco (unique_violation 23505)');
  }

  // 5) IMPORTAÇÃO ÚNICA: banco vazio + arquivo local com contas → importa 1× e não repete.
  {
    const dir = tmpDir();
    fs.writeFileSync(path.join(dir, 'contas.json'), JSON.stringify([conta('imp1', { nick: 'Importado' }), conta('imp2')]));
    const db = newDb({ noAstCoverageCheck: true }); const pg = db.adapters.createPg();
    const s1 = arm.criar({ databaseUrl: URL_FALSA, pg, dir }); await s1.pronto();   // pronto() importa do arquivo
    ok(await s1.contar() === 2, 'importação única: as 2 contas do arquivo entraram no banco vazio');
    const r = await s1.importarSeVazio();
    ok(r.importou === false, 'importar de novo NÃO repete (já importado)');
    // outro "processo" sobre o mesmo banco também não reimporta
    const s2 = arm.criar({ databaseUrl: URL_FALSA, pg, dir }); await s2.pronto();
    ok(await s2.contar() === 2, 'novo processo sobre o mesmo banco: continua 2 (não duplicou)');
  }

  // 6) /saude (via a camada) responde sem segredo.
  {
    const abrir = pgCompartilhado(); const s = abrir(); await s.pronto(); await s.salvarConta(conta('x'));
    const saude = await s.saude();
    ok(saude.armazenamento === 'postgres' && saude.banco === 'ok' && saude.contas === 1, 'saude = {armazenamento:postgres, banco:ok, contas:1}');
    ok(!JSON.stringify(saude).includes(SEGREDO) && !('databaseUrl' in saude) && !('url' in saude), 'o /saude NÃO contém segredo');
  }

  // 7 + 8) BANCO FORA: o servidor não cai; nenhum log/erro contém o DATABASE_URL.
  {
    const logs = [];
    const _log = console.log, _err = console.error, _warn = console.warn;
    console.log = (...a) => logs.push(a.join(' ')); console.error = (...a) => logs.push(a.join(' ')); console.warn = (...a) => logs.push(a.join(' '));
    // pg FALSO que falha sempre (banco fora)
    const pgFora = { Pool: class { constructor() {} on() {} async query() { throw Object.assign(new Error('ECONNREFUSED ' + URL_FALSA.slice(0, 0)), { code: 'ECONNREFUSED' }); } async connect() { throw Object.assign(new Error('fora'), { code: 'ECONNREFUSED' }); } async end() {} } };
    const s = arm.criar({ databaseUrl: URL_FALSA, pg: pgFora, dir: tmpDir() });
    let caiu = false, errMsg = '';
    try { const saude = await s.saude(); ok(saude.banco === 'fora' && saude.armazenamento === 'postgres', 'com o banco FORA, /saude responde {banco:fora} (não lança)'); }
    catch (e) { caiu = true; errMsg = (e && (e.stack || e.message)) || ''; }
    try { await s.transacao('qualquer', d => d); } catch (e) { errMsg += ' ' + ((e && (e.stack || e.message)) || ''); }
    console.log = _log; console.error = _err; console.warn = _warn;
    ok(!caiu, 'o servidor NÃO cai com o banco fora (saude resolve sem lançar)');
    const todo = logs.join('\n') + '\n' + errMsg;
    ok(!todo.includes(SEGREDO), 'nenhum log/erro contém o DATABASE_URL (segredo marcado ausente)');
  }

  // ---------- B) ARQUIVO ----------
  console.log('\n== B. Armazenamento de ARQUIVO ==');
  {
    const dir = tmpDir();
    const s1 = arm.criar({ dir }); await s1.pronto();
    ok(s1.tipo === 'arquivo', 'sem DATABASE_URL → armazenamento de arquivo');
    await s1.salvarConta(conta('f1', { perfil: { moedas: { gema: 3 } } }));
    // "reinício": nova instância lê o arquivo
    const s2 = arm.criar({ dir }); await s2.pronto();
    ok(!!(await s2.carregarContas()).find(c => c.token === 'f1'), 'arquivo: a conta sobrevive a uma nova instância (reinício)');
    // 20 créditos simultâneos (single-thread, sync) somam 20×
    await s2.salvarConta(conta('fc', { perfil: { moedas: { gema: 0 } } }));
    await Promise.all(Array.from({ length: 20 }, () => s2.transacao('fc', d => { d.perfil.moedas.gema += 5; })));
    ok((await s2.carregarContas()).find(c => c.token === 'fc').perfil.moedas.gema === 100, 'arquivo: 20 créditos simultâneos somam 20×5=100');
    // recibo 1×
    ok(await s2.reservarRecibo('p1') === true && await s2.reservarRecibo('p1') === false, 'arquivo: o mesmo recibo paga 1×');
    const saude = await s2.saude();
    ok(saude.armazenamento === 'arquivo' && saude.banco === 'ok', 'arquivo: /saude = {armazenamento:arquivo, banco:ok}');
  }

  // ---------- C) contas.js ponta a ponta no Postgres (pg-mem): a suíte do servidor roda sobre Postgres, não só arquivo ----------
  console.log('\n== C. contas.js ponta a ponta no Postgres (pg-mem) ==');
  {
    const contas = require(path.join(__dirname, '..', 'server', 'contas.js'));
    const pg = newDb({ noAstCoverageCheck: true }).adapters.createPg();
    const dir = tmpDir();
    await contas._usarArmazenamentoTeste(arm.criar({ databaseUrl: URL_FALSA, pg, dir }));
    const r = contas.criar({ faixaIdade: 'maior' });
    ok(r.ok, 'contas.criar funciona sobre o Postgres');
    const token = r.conta.token, id = r.conta.id;
    contas.definirNick(token, 'Jogador Um');
    contas._darDeus(token, 'zeus'); contas._salvar();
    await contas.drenar();
    // "reinicia o servidor": recria o cadastro em memória a partir do MESMO banco
    await contas._usarArmazenamentoTeste(arm.criar({ databaseUrl: URL_FALSA, pg, dir }));
    const e = contas.entrar(token);
    ok(e.ok && e.conta.id === id, 'após reiniciar, contas.entrar acha a MESMA conta (id igual)');
    ok(contas.possui(token, 'zeus'), 'a posse do deus sobreviveu ao reinício');
    ok(e.conta.nick === 'Jogador Um', 'o apelido sobreviveu ao reinício');
    const saude = await contas.saude();
    ok(saude.armazenamento === 'postgres' && saude.banco === 'ok' && saude.contas === 1, 'contas.saude() no Postgres = {postgres, ok, 1}');
  }

  if (falhas) { console.log(`\n>>> ${falhas} FALHA(S) (${passes} ok)`); process.exit(1); }
  console.log(`\n>>> PERSISTÊNCIA §354 OK (${passes})`);
  process.exit(0);
})().catch(e => { console.error(e.stack || e.message || e); process.exit(1); });
