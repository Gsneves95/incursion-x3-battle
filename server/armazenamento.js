// server/armazenamento.js — §354: a CAMADA ÚNICA de persistência do servidor. O resto do servidor só fala com ela.
// Duas implementações, escolhidas por process.env.DATABASE_URL:
//   • POSTGRES (quando DATABASE_URL existe): um documento JSONB por conta + tabelas de unicidade (id/nick) e de
//     recibos (anti-duplicação de prêmio) + tabela de versões de migração. Portável: driver "pg" padrão e SQL comum.
//     NADA específico do Neon (sem SDK, sem driver serverless, sem branching) — trocar de provedor = trocar a variável
//     DATABASE_URL + pg_dump/pg_restore.
//   • ARQUIVO (quando NÃO existe DATABASE_URL): o comportamento de hoje (JSON em server/dados/) — dev e testes antigos
//     seguem funcionando, sem banco.
// O SEGREDO (DATABASE_URL) vem SÓ de process.env, nunca é escrito em código/log/erro. SSL ligado (o Neon exige).
const fs = require('fs');
const path = require('path');

// ---- mutex por chave (serializa escritas/transações da MESMA conta no processo; a atomicidade multi-processo é do
//      Postgres via FOR UPDATE). Node é single-thread, mas há `await` dentro das transações — o mutex impede corrida. ----
function _criarMutex() {
  const filas = new Map();
  return (chave, fn) => {
    const anterior = filas.get(chave) || Promise.resolve();
    const atual = anterior.then(fn, fn);           // roda fn depois do anterior (mesmo se falhou)
    filas.set(chave, atual.catch(() => {}));       // a fila não trava num erro
    return atual;
  };
}

// ============================================================================ ARQUIVO (dev/testes)
function armazenamentoArquivo(dir) {
  const DIR = dir, ARQ = path.join(DIR, 'contas.json'), REC = path.join(DIR, 'recibos.json');
  const trava = _criarMutex();
  let recibos = null;
  function _lerRecibos() { if (recibos) return recibos; try { recibos = new Set(JSON.parse(fs.readFileSync(REC, 'utf8'))); } catch (e) { recibos = new Set(); } return recibos; }
  function _gravarRecibos() { try { fs.mkdirSync(DIR, { recursive: true }); fs.writeFileSync(REC, JSON.stringify([..._lerRecibos()]), 'utf8'); } catch (e) {} }
  function _ler() { try { const a = JSON.parse(fs.readFileSync(ARQ, 'utf8')); return Array.isArray(a) ? a : []; } catch (e) { return []; } }
  function _gravar(arr) { try { fs.mkdirSync(DIR, { recursive: true }); fs.writeFileSync(ARQ, JSON.stringify(arr), 'utf8'); } catch (e) {} }
  let mapa = null;
  function _mapa() { if (mapa) return mapa; mapa = new Map(); for (const c of _ler()) if (c && c.token) mapa.set(c.token, c); return mapa; }
  function _flush() { _gravar([..._mapa().values()]); }

  return {
    tipo: 'arquivo',
    async pronto() { try { fs.mkdirSync(DIR, { recursive: true }); } catch (e) {} },
    async carregarContas() { return [..._mapa().values()]; },
    // SÍNCRONOS: o armazenamento de arquivo é sync por natureza (fs.*Sync) — contas.js usa estes para manter o
    // carregamento preguiçoso de sempre (os testes antigos chamam contas.* sem boot assíncrono).
    carregarContasSync() { return [..._mapa().values()]; },
    salvarContaSync(c) { if (!c || !c.token) return; _mapa().set(c.token, c); _flush(); },
    removerContaSync(token) { _mapa().delete(token); _flush(); },
    _resetSync() { mapa = new Map(); recibos = new Set(); try { fs.rmSync(ARQ, { force: true }); } catch (e) {} try { fs.rmSync(REC, { force: true }); } catch (e) {} },
    async salvarConta(c) { if (!c || !c.token) return; _mapa().set(c.token, c); _flush(); },
    agendarSalvar(c) { try { this.salvarConta(c); } catch (e) {} },
    async removerConta(token) { _mapa().delete(token); _flush(); },
    agendarRemover(token) { try { this.removerConta(token); } catch (e) {} },
    async drenar() { _flush(); },
    // transação atômica por token: no arquivo (single-thread, sync) a leitura+escrita roda sem `await` entre elas → atômica.
    transacao(token, mutador) {
      return trava(token, async () => {
        const c = _mapa().get(token); if (!c) throw new Error('conta inexistente');
        const r = await mutador(c);     // mutador altera o próprio objeto (mesma referência do cache)
        _flush();
        return r === undefined ? c : r;
      });
    },
    async reservarRecibo(chave) { const s = _lerRecibos(); if (s.has(chave)) return false; s.add(chave); _gravarRecibos(); return true; },
    async contar() { return _mapa().size; },
    async saude() { return { armazenamento: 'arquivo', banco: 'ok', contas: _mapa().size }; },
    acordar() { /* arquivo não dorme */ },
    async importarSeVazio() { return { importou: false, motivo: 'arquivo é a própria fonte' }; },
    async fechar() { _flush(); },
  };
}

// ============================================================================ POSTGRES (produção; portável)
function armazenamentoPostgres(databaseUrl, dirImport, pgMod) {
  const { Pool } = pgMod || require('pg');   // pgMod injetável (pg-mem nos testes); em produção, o driver "pg" padrão
  // pool PEQUENO (o Neon grátis tem poucas conexões) + tempos limite curtos. SSL ligado (Neon exige), sem rejeitar o
  // certificado gerenciado do provedor. O DATABASE_URL vem só do ambiente — nunca é logado.
  const pool = new Pool({ connectionString: databaseUrl, max: 5, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 8000, idleTimeoutMillis: 30000, query_timeout: 12000, statement_timeout: 12000 });
  pool.on('error', () => { /* conexão ociosa caiu (Neon dormiu) — o pool reabre sozinho; nunca derruba o processo */ });
  const trava = _criarMutex();
  let semForUpdate = false;   // pg-mem (teste) pode não suportar FOR UPDATE; detecta e segue sem (o mutex garante)

  // nova tentativa curta: o Neon grátis suspende após ~5 min e acorda na 1ª consulta (ECONNREFUSED/timeout no 1º tiro).
  async function q(texto, args) {
    let err;
    for (let i = 0; i < 3; i++) {
      try { return await pool.query(texto, args); }
      catch (e) { err = e; if (!_transiente(e)) throw e; await _espera(300 * (i + 1)); }
    }
    throw err;
  }
  function _transiente(e) { const c = e && e.code; return c === 'ECONNREFUSED' || c === 'ETIMEDOUT' || c === 'ENOTFOUND' || c === '57P01' || c === '57P03' || /terminat|timeout|connection/i.test((e && e.message) || ''); }
  const _espera = ms => new Promise(r => setTimeout(r, ms));

  async function _migrar() {
    await q(`CREATE TABLE IF NOT EXISTS migracoes (versao integer PRIMARY KEY, aplicada timestamptz NOT NULL DEFAULT now())`);
    await q(`CREATE TABLE IF NOT EXISTS contas (
      token text PRIMARY KEY,
      id text NOT NULL UNIQUE,
      nick text UNIQUE,
      dados jsonb NOT NULL,
      versao integer NOT NULL DEFAULT 1,
      atualizado timestamptz NOT NULL DEFAULT now())`);
    await q(`CREATE TABLE IF NOT EXISTS recibos (chave text PRIMARY KEY, criado timestamptz NOT NULL DEFAULT now())`);
    await q(`INSERT INTO migracoes (versao) VALUES (1) ON CONFLICT DO NOTHING`);
  }
  async function _jaImportou() { const r = await q(`SELECT 1 FROM migracoes WHERE versao=2`); return r.rowCount > 0; }

  return {
    tipo: 'postgres',
    async pronto() {
      await _migrar();
      // detecta suporte a FOR UPDATE (pg-mem não tem; Postgres real tem)
      try { const cli = await pool.connect(); try { await cli.query('BEGIN'); await cli.query('SELECT 1 FOR UPDATE'); await cli.query('ROLLBACK'); } catch (e) { semForUpdate = true; try { await cli.query('ROLLBACK'); } catch (_) {} } finally { cli.release(); } } catch (e) { semForUpdate = true; }
      await this.importarSeVazio();
    },
    async carregarContas() { const r = await q(`SELECT dados FROM contas`); return r.rows.map(x => x.dados); },
    async salvarConta(c) {
      if (!c || !c.token) return;
      await q(`INSERT INTO contas (token, id, nick, dados, versao, atualizado)
               VALUES ($1,$2,$3,$4,1,now())
               ON CONFLICT (token) DO UPDATE SET id=EXCLUDED.id, nick=EXCLUDED.nick, dados=EXCLUDED.dados, versao=contas.versao+1, atualizado=now()`,
        [c.token, c.id, c.nick || null, c]);
    },
    agendarSalvar(c) { if (!c || !c.token) return; trava('w:' + c.token, () => this.salvarConta(c).catch(() => {})); },
    async removerConta(token) { await q(`DELETE FROM contas WHERE token=$1`, [token]); },
    agendarRemover(token) { trava('w:' + token, () => this.removerConta(token).catch(() => {})); },
    async drenar() { await trava('__drenar__', async () => {}); },   // espera a fila corrente esvaziar
    // TRANSAÇÃO ATÔMICA por token (economia): BEGIN; SELECT … FOR UPDATE; mutador(dados)->dados'; UPDATE versao+1; COMMIT.
    // O mutex serializa no processo; o FOR UPDATE protege entre conexões/processos. Devolve os dados novos.
    transacao(token, mutador) {
      return trava('w:' + token, async () => {
        const cli = await pool.connect();
        try {
          await cli.query('BEGIN');
          const sel = await cli.query(`SELECT dados FROM contas WHERE token=$1${semForUpdate ? '' : ' FOR UPDATE'}`, [token]);
          if (!sel.rowCount) { await cli.query('ROLLBACK'); throw new Error('conta inexistente'); }
          const dados = sel.rows[0].dados;
          const r = await mutador(dados);
          const novo = (r === undefined) ? dados : r;
          await cli.query(`UPDATE contas SET dados=$2, nick=$3, versao=versao+1, atualizado=now() WHERE token=$1`, [token, novo, novo.nick || null]);
          await cli.query('COMMIT');
          return novo;
        } catch (e) { try { await cli.query('ROLLBACK'); } catch (_) {} throw e; }
        finally { cli.release(); }
      });
    },
    // RECIBO de prêmio: insere a chave; devolve true só na 1ª vez. A UNICIDADE da PK (chave) garante pagar 1× — a 2ª
    // inserção viola a restrição (23505) e devolve false. (catch da violação é portável: real Postgres e pg-mem.)
    async reservarRecibo(chave) {
      try { await q(`INSERT INTO recibos (chave) VALUES ($1)`, [chave]); return true; }
      catch (e) { if (e && e.code === '23505') return false; throw e; }
    },
    async contar() { const r = await q(`SELECT count(*)::int AS n FROM contas`); return r.rows[0].n; },
    async saude() {
      try { const r = await q(`SELECT count(*)::int AS n FROM contas`); return { armazenamento: 'postgres', banco: 'ok', contas: r.rows[0].n }; }
      catch (e) { return { armazenamento: 'postgres', banco: 'fora', contas: null }; }
    },
    acordar() { pool.query('SELECT 1').catch(() => {}); },   // §341: dispara o "acordar" do banco em 2º plano, sem esperar
    // IMPORTAÇÃO ÚNICA: se o banco está VAZIO e há dados no arquivo local, importa uma vez e registra (migração 2).
    async importarSeVazio() {
      if (await _jaImportou()) return { importou: false, motivo: 'já importado' };
      const n = await this.contar();
      if (n > 0) { await q(`INSERT INTO migracoes (versao) VALUES (2) ON CONFLICT DO NOTHING`); return { importou: false, motivo: 'banco não estava vazio' }; }
      let arr = [];
      try { const a = JSON.parse(fs.readFileSync(path.join(dirImport, 'contas.json'), 'utf8')); if (Array.isArray(a)) arr = a; } catch (e) {}
      for (const c of arr) if (c && c.token) await this.salvarConta(c);
      await q(`INSERT INTO migracoes (versao) VALUES (2) ON CONFLICT DO NOTHING`);
      return { importou: arr.length > 0, contas: arr.length };
    },
    async fechar() { await pool.end(); },
    _pool: pool,
  };
}

// FÁBRICA: Postgres quando há DATABASE_URL; senão, arquivo. `dir` é o diretório do armazenamento de arquivo.
function criar(opts = {}) {
  const dir = opts.dir || path.join(__dirname, 'dados');
  const url = ('databaseUrl' in opts) ? opts.databaseUrl : process.env.DATABASE_URL;
  if (url || opts.pg) return armazenamentoPostgres(url, dir, opts.pg);
  return armazenamentoArquivo(dir);
}

module.exports = { criar, armazenamentoArquivo, armazenamentoPostgres };
