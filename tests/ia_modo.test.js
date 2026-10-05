'use strict';
// §322 Parte 3 — GUARDAS da ponte de segurança (versão da IA POR MODO).
// Prova (e cada guarda MORDE):
//  1. a tabela (data/ia_por_modo.json) é a FONTE: iaVersaoDeModo lê dela; modo desconhecido → v1 (seguro).
//  2. o build QUEBRA se um modo em v2 tem conteúdo não-vencível sob a v2 — provado com o 'rito' (hanuman INVENCÍVEL).
//  3. a tabela EMBARCADA é consistente com a prova (ia_winnability_v2.json): nenhum modo v2 com item não-vencível.
//  4. domínios/sandbox são isentos (sem solução fixa). composicao (time livre) não pode ir a v2.
//  5. o replay carimba a versão da BATALHA (do modo), não um global fixo.
const assert = require('assert');
const path = require('path');
const guard = require(path.join(__dirname, '..', 'tools', 'ia_modo_guard.js'));
const tabela = require(path.join(__dirname, '..', 'data', 'ia_por_modo.json'));
const manifesto = require(path.join(__dirname, '..', 'data', 'ia_winnability_v2.json'));
const ia = require(path.join(__dirname, '..', 'src', 'ia.js'));

let passes = 0;
const ok = (c, m) => { assert.ok(c, m); console.log('  ✓ ' + m); passes++; };

console.log('== §322 P3 — IA por modo + ponte de segurança ==');

// ---------- 1) iaVersaoDeModo lê a tabela; default v1 ----------
{
  global.IA_POR_MODO = tabela;
  ok(ia.iaVersaoDeModo('dominio') === 2, 'iaVersaoDeModo("dominio") = 2 (tabela)');
  ok(ia.iaVersaoDeModo('rito') === 1, 'iaVersaoDeModo("rito") = 1 (tabela — rito fica na v1)');
  ok(ia.iaVersaoDeModo('modo_que_nao_existe') === 1, 'modo desconhecido → v1 (seguro, nunca sobe por acidente)');
  delete global.IA_POR_MODO;
  ok(ia.iaVersaoDeModo('dominio') === 1, 'sem IA_POR_MODO → v1 (falha fechada)');
}

// ---------- 2) a guarda do build MORDE (rito em v2 → hanuman INVENCÍVEL) ----------
{
  ok(guard.validar(tabela, manifesto).length === 0, 'a tabela EMBARCADA passa na guarda (nenhum modo v2 com item não-vencível)');
  const ritoV2 = { modos: Object.assign({}, tabela.modos, { rito: 2 }) };
  const erros = guard.validar(ritoV2, manifesto);
  ok(erros.length > 0 && /rito/.test(erros.join(' ')), 'pôr "rito" em v2 é REPROVADO pela guarda (morde)');
  const ritoNV = (manifesto.modos.rito && manifesto.modos.rito.naoVencivel) || [];
  ok(ritoNV.some(n => n.id === 'hanuman' && n.veredito === 'INVENCIVEL'), 'o manifesto marca hanuman INVENCÍVEL (a razão de o rito não poder ir a v2)');
  // composicao (time livre) não pode ir a v2
  const compV2 = { modos: { composicao: 2 } };
  ok(guard.validar(compV2, manifesto).some(e => /composicao/.test(e) && /VERIFIC/i.test(e)), 'composicao em v2 é reprovada (time livre, não verificável)');
  // isenção de domínio/sandbox
  ok(guard.validar({ modos: { dominio: 2, sandbox: 2 } }, manifesto).length === 0, 'dominio/sandbox em v2 são ISENTOS (sem solução fixa)');
  // falha fechada: v2 sem manifesto
  ok(guard.validar({ modos: { campanha: 2 } }, null).length > 0, 'modo v2 sem manifesto → reprovado (falha fechada)');
}

// ---------- 3) coerência: cada modo v2 (não isento) tem prova ok no manifesto ----------
{
  const EX = new Set(guard.EXENTOS_PADRAO);
  let coerente = true, quebra = '';
  for (const m of Object.keys(tabela.modos)) {
    if (tabela.modos[m] !== 2 || EX.has(m)) continue;
    const p = manifesto.modos && manifesto.modos[m];
    if (!p || p.naoVerificavel || !p.ok) { coerente = false; quebra = m; }
  }
  ok(coerente, `todo modo v2 não-isento da tabela tem prova ok no manifesto${quebra ? ' (falhou: ' + quebra + ')' : ''}`);
}

// ---------- 5) o replay carimba a versão da BATALHA (do modo) ----------
{
  delete require.cache[require.resolve(path.join(__dirname, '..', 'src', 'replay_cliente.js'))];
  global.iaVersaoBatalhaAtual = () => 2;
  const rc = require(path.join(__dirname, '..', 'src', 'replay_cliente.js'));
  rc.iniciar({ modo: 'campanha' }); rc.gravarOp({ tipo: 'fim' });
  const env2 = rc.concluir({ atoId: 'c1e1' });
  ok(env2 && env2.iaVer === 2, 'replay de uma batalha v2 carimba iaVer=2');
  delete require.cache[require.resolve(path.join(__dirname, '..', 'src', 'replay_cliente.js'))];
  global.iaVersaoBatalhaAtual = () => 1;
  const rc1 = require(path.join(__dirname, '..', 'src', 'replay_cliente.js'));
  rc1.iniciar({ modo: 'rito' }); rc1.gravarOp({ tipo: 'fim' });
  const env1 = rc1.concluir({});
  ok(env1 && env1.iaVer === 1, 'replay de uma batalha v1 (ex.: Rito) carimba iaVer=1');
  delete global.iaVersaoBatalhaAtual;
}

console.log(`\n== IA por modo OK — ${passes} asserções ==`);
process.exit(0);
