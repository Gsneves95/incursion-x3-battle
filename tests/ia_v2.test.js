'use strict';
// §322 Parte 2 — GUARDAS da IA v2 (papel) e do VERSIONAMENTO do replay.
// Prova (e cada guarda MORDE):
//  1. dispatch: iaProximaAcao(st,'normal',2) é uma IA DISTINTA da v1 (decide diferente em ao menos uma posição).
//  2. determinismo: a v2 decide SEMPRE igual na mesma posição (replay-safe).
//  3. replay versionado no SERVIDOR (server/pve.js): um replay gravado sob a v2 só é aceito re-simulado sob a v2;
//     re-simular sob a v1 (ou versão errada) DIVERGE → não credita. Prova que a versão do envelope manda.
//  4. envelope SEM iaVer (replay antigo / fila offline) cai na v1 — mesmo resultado que iaVer:1.
//  5. carimbo do cliente: replay_cliente grava iaVer = IA_VERSAO_JOGO; sem a constante, cai em 1.
const assert = require('assert');
const path = require('path');
const pve = require(path.join(__dirname, '..', 'server', 'pve.js'));   // motor-host põe o motor no globalThis
const E = require(path.join(__dirname, '..', 'src', 'engine.js'));
Object.assign(global, E);
const ia = require(path.join(__dirname, '..', 'src', 'ia.js'));
const ECON = require(path.join(__dirname, '..', 'data', 'economia.json'));
const energia = ECON.energia || null;

let passes = 0;
const ok = (c, m) => { assert.ok(c, m); console.log('  ✓ ' + m); passes++; };

console.log('== §322 — IA v2 (papel) + versionamento do replay ==');

// ---------- 1) dispatch: v2 ≠ v1 ----------
{
  let diferiu = false, amostras = 0;
  for (let seed = 1; seed <= 40 && !diferiu; seed++) {
    const st = E.novoEstado(['zeus', 'ares', 'atena'], ['thor', 'odin', 'loki'], seed, seed % 2, energia);
    let g = 0;
    while (!st.fim && g++ < 40 && !diferiu) {
      if (st.ativo === 0) {
        const a1 = JSON.stringify(ia.iaProximaAcao(st, 'normal', 1));
        const a2 = JSON.stringify(ia.iaProximaAcao(st, 'normal', 2));
        amostras++;
        if (a1 !== a2) diferiu = true;
      }
      const mv = ia.iaProximaAcao(st, 'normal', 2);
      if (!mv) { E.fimTurno(st); } else E.agir(st, mv.uid, mv.slot, mv.alvos, mv.escolhas);
    }
  }
  ok(ia.IA_VERSAO_JOGO === 2, 'IA_VERSAO_JOGO === 2 (a versão do jogo)');
  ok(diferiu, `v2 decide diferente da v1 em ao menos uma posição (de ${amostras} amostradas) — o dispatch está ligado`);
}

// ---------- 2) determinismo da v2 ----------
{
  let pares = 0, divergiu = 0;
  for (let seed = 1; seed <= 20; seed++) {
    const st = E.novoEstado(['hades', 'poseidon', 'hera'], ['freyja', 'tyr', 'fenrir'], seed, seed % 2, energia);
    let g = 0;
    while (!st.fim && g++ < 40) {
      const a = JSON.stringify(ia.iaProximaAcao(st, 'normal', 2)), b = JSON.stringify(ia.iaProximaAcao(st, 'normal', 2));
      pares++; if (a !== b) divergiu++;
      const mv = ia.iaProximaAcao(st, 'normal', 2);
      if (!mv) { E.fimTurno(st); } else E.agir(st, mv.uid, mv.slot, mv.alvos, mv.escolhas);
    }
  }
  ok(divergiu === 0, `v2 é determinística: ${pares} pares, ${divergiu} divergências`);
}

// ---------- captura: joga uma partida de sandbox com AMBOS os lados na versão `ver`, grava as ações do lado 0 ----------
function capturar(pT, eT, seed, comeca, ver) {
  const st = E.novoEstado(pT.slice(), eT.slice(), seed, comeca, energia);
  const ops = []; let g = 0;
  while (!st.fim && g++ < 300) {
    if (st.ativo === 0) {
      let p = 0, a;
      while (!st.fim && (a = ia.iaProximaAcao(st, 'normal', ver)) && p++ < 8) { ops.push({ tipo: 'agir', uid: a.uid, slot: a.slot, alvos: a.alvos || [], escolhas: a.escolhas || null }); E.agir(st, a.uid, a.slot, a.alvos, a.escolhas); }
      if (!st.fim) { ops.push({ tipo: 'fim' }); E.fimTurno(st); }   // o cliente NÃO grava 'fim' se o golpe venceu a partida
    } else {
      let p = 0, a;
      while (!st.fim && (a = ia.iaProximaAcao(st, 'normal', ver)) && p++ < 8) E.agir(st, a.uid, a.slot, a.alvos, a.escolhas);
      if (!st.fim) E.fimTurno(st);
    }
  }
  return { ops, venceu: !!(st.fim && st.fim.resultado === 'vitoria' && st.fim.lado === 0) };
}

// ---------- 3/4) replay versionado no servidor ----------
{
  const pT = ['zeus', 'ares', 'atena'];
  const conta = { perfil: { deuses: { zeus: {}, ares: {}, atena: {} } }, pve: {} };
  // Forward (replay NOVO): um replay gravado sob a v2 é aceito re-simulado sob a v2.
  let fwd = null;
  const inimigos = [['thor', 'odin', 'loki'], ['hades', 'hera', 'poseidon'], ['anubis', 'ra', 'horus'], ['shiva', 'kali', 'durga'], ['sunwukong', 'guanyu', 'nezha']];
  for (let si = 0; si < inimigos.length && !fwd; si++) for (let seed = 1; seed <= 20 && !fwd; seed++) for (let c = 0; c <= 1 && !fwd; c++) {
    const cap = capturar(pT, inimigos[si], seed, c, 2); if (!cap.venceu) continue;
    const replay = { modo: 'sandbox', aliados: pT, inimigos: inimigos[si], seed, comeca: c, ops: cap.ops, iaVer: 2 };
    const r = pve.verificar(conta, replay, Date.now()); if (r.ok && r.venceu) fwd = { replay, r };
  }
  ok(!!fwd && fwd.r.ok && fwd.r.venceu, 'replay NOVO (gravado sob a v2) re-simulado sob a v2 → ACEITO (venceu)');

  // A guarda que MORDE (o motivo do versionamento): um replay ANTIGO — gravado quando o JOGO rodava a v1
  // (jogador e inimigo na v1) e que VENCEU — re-simulado sob a v2 (inimigo mais forte) NÃO reproduz a vitória.
  // Logo o envelope antigo TEM de cair na v1; se o servidor forçasse a v2, recusaria crédito justo. Procuro um
  // seed onde a linha vencedora-vs-v1 deixa de vencer vs-v2 (existe, pois a v2 ganha ~59-63% da v1).
  let bite = null;
  for (let si = 0; si < inimigos.length && !bite; si++) for (let seed = 1; seed <= 40 && !bite; seed++) for (let c = 0; c <= 1 && !bite; c++) {
    const cap = capturar(pT, inimigos[si], seed, c, 1); if (!cap.venceu) continue;   // linha vencedora quando o inimigo era v1
    const base = { modo: 'sandbox', aliados: pT, inimigos: inimigos[si], seed, comeca: c, ops: cap.ops };
    const rV1 = pve.verificar(conta, Object.assign({}, base, { iaVer: 1 }), Date.now());
    const rV2 = pve.verificar(conta, Object.assign({}, base, { iaVer: 2 }), Date.now());
    if (rV1.ok && rV1.venceu && !(rV2.ok && rV2.venceu)) bite = { base, rV1, rV2 };
  }
  ok(!!bite, 'achou um replay v1-vencedor que, re-simulado sob a v2, NÃO vence (cenário que faz a guarda morder)');
  if (bite) {
    ok(bite.rV1.ok && bite.rV1.venceu, 'replay ANTIGO (iaVer:1) re-simulado sob a v1 → ACEITO (venceu) — crédito justo preservado');
    ok(!(bite.rV2.ok && bite.rV2.venceu), 'o MESMO replay sob a v2 → NÃO vence: por isso o envelope antigo não pode ser forçado à v2');
    // 4) envelope SEM iaVer cai na v1 (mesmo veredito do iaVer:1) — replays pré-§322 / fila offline continuam válidos.
    const semVer = Object.assign({}, bite.base); const rSem = pve.verificar(conta, semVer, Date.now());
    ok(rSem.ok === bite.rV1.ok && !!rSem.venceu === !!bite.rV1.venceu,
       'envelope SEM iaVer cai na v1 (mesmo veredito do iaVer:1) — replays antigos/fila offline continuam creditando');
  }
}

// ---------- 5) o cliente carimba iaVer = IA_VERSAO_JOGO ----------
{
  // replay_cliente usa o GLOBAL IA_VERSAO_JOGO (no bundle, a const da ia.js). Simulo os dois casos.
  delete require.cache[require.resolve(path.join(__dirname, '..', 'src', 'replay_cliente.js'))];
  global.IA_VERSAO_JOGO = 2;
  const rc = require(path.join(__dirname, '..', 'src', 'replay_cliente.js'));
  rc.iniciar({ modo: 'sandbox' }); rc.gravarOp({ tipo: 'agir', uid: 'u0', slot: 'basico', alvos: [] });
  const env = rc.concluir({ aliados: ['zeus', 'ares', 'atena'], inimigos: ['thor'], seed: 1, comeca: 0 });
  ok(env && env.iaVer === 2, 'replay_cliente carimba iaVer = IA_VERSAO_JOGO (2)');
  // sem a constante → cai em 1 (a guarda do typeof)
  delete require.cache[require.resolve(path.join(__dirname, '..', 'src', 'replay_cliente.js'))];
  delete global.IA_VERSAO_JOGO;
  const rc2 = require(path.join(__dirname, '..', 'src', 'replay_cliente.js'));
  rc2.iniciar({ modo: 'sandbox' }); rc2.gravarOp({ tipo: 'fim' });
  const env2 = rc2.concluir({ seed: 1 });
  ok(env2 && env2.iaVer === 1, 'sem IA_VERSAO_JOGO, o carimbo cai na v1 (replay pré-§322)');
}

console.log(`\n== IA v2 OK — ${passes} asserções ==`);
process.exit(0);
