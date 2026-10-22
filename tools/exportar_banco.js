#!/usr/bin/env node
// tools/exportar_banco.js — §354: BACKUP/SAÍDA. Exporta TODO o cadastro (contas + recibos) para um JSON legível, para
// backup manual ou migração de provedor. Usa a MESMA camada de armazenamento do servidor (Postgres se houver
// DATABASE_URL; senão o arquivo local). O segredo (DATABASE_URL) vem só do ambiente e NUNCA é impresso.
//
//   Uso:  node tools/exportar_banco.js [caminho-de-saida.json]
//         DATABASE_URL=postgres://… node tools/exportar_banco.js backup.json   (exporta do Postgres)
//         node tools/exportar_banco.js                                         (exporta do arquivo local)
//
// Para um backup COMPLETO do Postgres (todas as tabelas, índices, tipos), prefira o pg_dump (ver docs/persistencia.md);
// este script é o export LEGÍVEL (um JSON com as contas) — rápido de ler e de reimportar em outro lugar.
const fs = require('fs');
const path = require('path');
const armazenamento = require(path.join(__dirname, '..', 'server', 'armazenamento.js'));

(async () => {
  const saida = process.argv[2] || path.join(process.cwd(), `backup-incursion-${new Date().toISOString().slice(0, 10)}.json`);
  const store = armazenamento.criar({ dir: path.join(__dirname, '..', 'server', 'dados') });
  await store.pronto();
  const contas = await store.carregarContas();
  const doc = { exportadoEm: new Date().toISOString(), armazenamento: store.tipo, contas };
  fs.writeFileSync(saida, JSON.stringify(doc, null, 2), 'utf8');
  // NUNCA imprime o DATABASE_URL — só o tipo e a contagem.
  console.log(`[exportar] ${contas.length} conta(s) de "${store.tipo}" → ${saida}`);
  if (store.fechar) await store.fechar();
  process.exit(0);
})().catch(e => { console.error('[exportar] falhou:', (e && e.message) || e); process.exit(1); });
