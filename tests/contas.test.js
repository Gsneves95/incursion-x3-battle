// tests/contas.test.js — F5.1: CONTAS. O servidor é autoritativo; o cliente só guarda o token.
// Prova, sem depender de olho:
//  (1) o CADASTRO (server/contas.js): cria com faixa, entra por token, recusa token ruim, EXCLUI
//      de verdade (a linha some), migra o perfil de dev com RANQUE ZERO, nunca vaza o token.
//  (2) o SERVIDOR de verdade (WebSocket): criarConta devolve token, mensagem de jogo SEM token
//      valido e RECUSADA, entrar reabre a mesma conta, excluirConta apaga e o token deixa de valer.
//  (3) o MODULO CLIENTE (src/conta.js) com um TRANSPORTE injetavel (o jsdom nao tem WebSocket):
//      primeira abertura pede a faixa, cria a conta em silencio, guarda o token; reabrir pula o
//      portao; excluir devolve ao estado de primeira abertura; a migracao acontece UMA vez.
const path = require('path');
const WebSocket = require('ws');
const proto = require('../server/protocol.js');
const contas = require('../server/contas.js');
const cliente = require('../src/conta.js');

let falhas = 0; const ok = (c, m) => { if (!c) { console.log('  FALHA: ' + m); falhas++; } };

// ---- um localStorage de mentira, para exercitar o modulo cliente fora do navegador ----
function fakeLocalStorage() {
  const m = new Map();
  return { getItem: k => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k), _map: m };
}
// ---- um TRANSPORTE de mentira que fala DIRETO com o cadastro (a mesma logica do servidor) ----
// Nao e o WebSocket (isso o bloco 2 cobre): isola o modulo cliente da rede, provando a maquina
// de estados dele. Responde com os MESMOS envelopes que o servidor responderia.
function transporteFake() {
  return {
    pedir: async (msg) => {
      if (msg.tipo === 'ola') return { v: 1, tipo: 'ola', motor: 'autoritativo' };
      if (msg.tipo === 'criarConta') {
        const r = contas.criar({ faixaIdade: msg.faixaIdade, perfil: msg.perfil || null });
        return r.ok ? { v: 1, tipo: 'conta', token: r.conta.token, conta: contas.paraDono(r.conta) } : { v: 1, tipo: 'recusado', codigo: r.codigo, erro: r.erro };
      }
      if (msg.tipo === 'entrar') {
        const r = contas.entrar(msg.token);
        return r.ok ? { v: 1, tipo: 'conta', conta: contas.paraDono(r.conta) } : { v: 1, tipo: 'recusado', codigo: r.codigo, erro: r.erro };
      }
      if (msg.tipo === 'excluirConta') {
        const r = contas.excluir(msg.token);
        return r.ok ? { v: 1, tipo: 'contaExcluida', apagou: true } : { v: 1, tipo: 'recusado', codigo: r.codigo, erro: r.erro };
      }
      return { v: 1, tipo: 'erro', erro: 'tipo desconhecido' };
    },
  };
}

(async () => {
  // ===== (1) o CADASTRO autoritativo =====
  console.log('== 1. o cadastro: cria com faixa, entra por token, exclui de verdade, migra com ranque zero ==');
  contas._resetParaTeste();
  ok(!contas.criar({}).ok && contas.criar({}).codigo === 'faixa_invalida', 'sem faixa: recusa (a lei exige ter perguntado)');
  ok(contas.criar({ faixaIdade: '18+' }).codigo === 'faixa_invalida', 'faixa fora do vocabulario: recusa');
  const nova = contas.criar({ faixaIdade: 'maior' });
  ok(nova.ok && nova.conta.token && nova.conta.id, 'cria conta anonima: emite token + id');
  ok(nova.conta.faixaIdade === 'maior', 'guarda a FAIXA (nao a data)');
  ok(nova.conta.ranque && nova.conta.ranque.pontos === 0, 'ranque nasce ZERO (§221-d)');
  ok(nova.conta.perfil && Object.keys(nova.conta.perfil.deuses).length === 9 && nova.conta.perfil.moedas.gema === contas.GRANT_GEMA, `perfil nasce no servidor (9 deuses, grant ${contas.GRANT_GEMA})`);
  ok(nova.conta.nick === null, 'nick reservado (null) — chega no PvP');

  const ent = contas.entrar(nova.conta.token);
  ok(ent.ok && ent.conta.id === nova.conta.id, 'entrar com o token reabre a MESMA conta');
  ok(contas.entrar('token-inventado').codigo === 'token_invalido', 'token desconhecido: recusa clara');
  ok(contas.entrar(null).codigo === 'sem_token', 'sem token: recusa clara');

  // migracao do perfil de DEV: um perfil rico, com ranque MENTIROSO, migra UMA vez com ranque ZERO
  const perfilDev = { versao: 3, deuses: { zeus: { copias: 4 }, ogum: { copias: 2 } }, times: [['zeus', 'ogum', 'tyr']], moedas: { gema: 8800, essencia: 120 }, campanha: { capitulo: 1, concluidas: ['e1', 'e2'] }, maestria: { zeus: { vitorias: 30 } }, ranque: { pontos: 9999 } };
  const mig = contas.criar({ faixaIdade: 'maior', perfil: perfilDev });
  ok(mig.conta.perfil.moedas.gema === 8800 && mig.conta.perfil.campanha.concluidas.length === 2 && mig.conta.perfil.maestria.zeus.vitorias === 30, 'migracao preserva campanha, colecao e maestria');
  ok(mig.conta.ranque.pontos === 0, 'ranque do perfil migrado e IGNORADO — comeca em zero');

  // projecoes: o token NUNCA vaza
  ok(!('token' in contas.paraDono(nova.conta)), 'paraDono nao vaza o token (ja esta no aparelho)');
  ok(!('perfil' in contas.publica(nova.conta)) && !('token' in contas.publica(nova.conta)) && !('faixaIdade' in contas.publica(nova.conta)), 'publica (visao de outro jogador) nao vaza perfil/token/faixa');

  // EXCLUSAO de verdade: a linha some
  const antes = contas._total();
  const exc = contas.excluir(nova.conta.token);
  ok(exc.ok && exc.apagou, 'excluir confirma o apagamento');
  ok(contas._total() === antes - 1 && !contas._existeToken(nova.conta.token), 'a conta SOME do cadastro (nao e marcacao de apagado)');
  ok(contas.entrar(nova.conta.token).codigo === 'token_invalido', 'apos excluir, o token nao vale mais');
  console.log(`  cadastro: cria/entra/exclui · faixa guardada · ranque zero (inclusive migrado) · token nao vaza`);

  // ===== (2) o SERVIDOR de verdade, por WebSocket, com AUTENTICACAO =====
  console.log('== 2. o servidor por WebSocket: token obrigatorio apos o handshake, exclusao real ==');
  contas._resetParaTeste();
  const { server } = require('../server/server.js');
  await new Promise(r => server.listen(0, r));
  const porta = server.address().port;
  const ws = new WebSocket('ws://localhost:' + porta);
  await new Promise((res, rej) => { ws.on('open', res); ws.on('error', rej); });
  const pede = (msg) => new Promise((res) => { ws.once('message', (d) => res(JSON.parse(d.toString()))); ws.send(JSON.stringify(msg)); });
  const V = proto.PROTOCOL_VERSION;
  const prov = require('../data/provacoes/afrodite.json');

  await pede({ v: V, tipo: 'ola' });
  // mensagem de JOGO sem token: RECUSADA (autenticacao obrigatoria apos o handshake)
  const semTok = await pede({ v: V, tipo: 'montar', pergaminho: prov });
  ok(semTok.tipo === 'recusado' && semTok.codigo === 'sem_token', 'montar SEM token e recusado (mensagem sem token nao passa)');
  // criar conta: nao exige token, devolve um
  const criada = await pede({ v: V, tipo: 'criarConta', faixaIdade: 'menor' });
  ok(criada.tipo === 'conta' && criada.token && criada.conta.faixaIdade === 'menor', 'criarConta devolve o token e guarda a faixa');
  const tok = criada.token;
  // com token invalido: recusa
  const tokRuim = await pede({ v: V, tipo: 'montar', pergaminho: prov, token: 'nao-existe' });
  ok(tokRuim.tipo === 'recusado' && tokRuim.codigo === 'token_invalido', 'token invalido numa mensagem de jogo: recusa clara');
  // com token bom: passa
  const comTok = await pede({ v: V, tipo: 'montar', pergaminho: prov, token: tok });
  ok(comTok.tipo === 'estado' && comTok.hash, 'com token valido, a mensagem de jogo e aceita (estado autoritativo)');
  // entrar reabre a mesma conta (mesmo id)
  const reentrou = await pede({ v: V, tipo: 'entrar', token: tok });
  ok(reentrou.tipo === 'conta' && reentrou.conta.id === criada.conta.id && !('token' in reentrou), 'entrar reabre a mesma conta e NAO reenvia o token');
  // excluir de verdade: depois, o token nao vale
  const excluiu = await pede({ v: V, tipo: 'excluirConta', token: tok });
  ok(excluiu.tipo === 'contaExcluida' && excluiu.apagou, 'excluirConta confirma o apagamento');
  const depois = await pede({ v: V, tipo: 'entrar', token: tok });
  ok(depois.tipo === 'recusado' && depois.codigo === 'token_invalido', 'apos a exclusao no servidor, o token deixa de valer');
  ws.close();
  await new Promise(r => server.close(r));
  console.log('  WS: handshake · montar sem token RECUSADO · criarConta->token · token ruim recusado · token bom aceito · excluir real');

  // ===== (3) o MODULO CLIENTE (src/conta.js) com transporte injetavel =====
  console.log('== 3. o cliente: 1a abertura pede a faixa, cria em silencio, guarda o token, reabre sem portao ==');
  contas._resetParaTeste();
  global.localStorage = fakeLocalStorage();
  const trans = transporteFake();

  // primeira abertura: sem token => o cliente pede a FAIXA (nunca um login)
  const r0 = await cliente.iniciarConta(trans, {});
  ok(r0.fase === 'perguntarFaixa', 'primeira abertura: pede a faixa (sem tela de login)');
  ok(cliente.lerToken() === null, 'antes de criar, nao ha token no aparelho');

  // responde a faixa => cria a conta em silencio e guarda o token
  const perfilLocal = { versao: 3, deuses: { zeus: { copias: 3 } }, moedas: { gema: 4200, essencia: 0 }, campanha: { concluidas: ['e1'] }, ranque: { pontos: 777 } };
  const r1 = await cliente.criarConta(trans, { faixaIdade: 'maior', tinhaPerfil: true, perfilLocal });
  ok(r1.fase === 'entrou' && r1.conta && r1.conta.faixaIdade === 'maior', 'faixa respondida: conta criada, entrou');
  ok(r1.migrou === true && r1.conta.perfil.moedas.gema === 4200, 'o perfil de dev MIGROU (gema 4200 preservada)');
  ok(r1.conta.ranque.pontos === 0, 'a conta migrada comeca com ranque ZERO');
  const tokGuardado = cliente.lerToken();
  ok(tokGuardado && typeof tokGuardado === 'string', 'o token FICOU no aparelho (persiste ao fechar/reabrir)');
  ok(cliente.jaMigrou(), 'marca que ja migrou (a migracao e UMA vez)');

  // reabrir (novo boot, MESMO localStorage): token valido => entra direto, SEM portao de faixa
  const r2 = await cliente.iniciarConta(trans, {});
  ok(r2.fase === 'entrou' && r2.conta.id === r1.conta.id, 'reabrir com o token guardado: entra na MESMA conta, sem portao');

  // segunda "abertura" nao deve migrar de novo: criar outra conta agora nao carrega o perfil
  // (jaMigrou true). Simula um cenario de nova conta apos ja ter migrado uma vez.
  const r1b = await cliente.criarConta(trans, { faixaIdade: 'maior', tinhaPerfil: true, perfilLocal });
  ok(r1b.migrou === false, 'nao migra de novo: a migracao do perfil de dev e UMA unica vez');

  // EXCLUSAO pelo cliente: apaga no servidor + tira o token => volta ao estado de primeira abertura
  cliente.guardarToken(tokGuardado);   // garante um token valido apontando p/ a conta de r1
  // recria a conta de r1 no cadastro caso r1b a tenha deixado orfa: usa o token de r2/r1
  const rExc = await cliente.excluir(trans);
  ok(rExc.fase === 'excluida', 'excluir: fluxo de exclusao concluido');
  ok(cliente.lerToken() === null, 'apos excluir, NAO ha token no aparelho (volta a primeira abertura)');
  ok(!cliente.jaMigrou(), 'apos excluir, a marca de migracao tambem some (aparelho zerado)');
  const r3 = await cliente.iniciarConta(trans, {});
  ok(r3.fase === 'perguntarFaixa', 'apos a exclusao, a proxima abertura pede a faixa de novo (estado inicial)');

  // offline: sem transporte => dormente (o app roda local, sem conta, sem portao)
  const rOff = await cliente.iniciarConta(null, {});
  ok(rOff.fase === 'offline', 'sem servidor: DORMENTE (nenhum portao, app roda local)');
  delete global.localStorage;
  console.log('  cliente: 1a abertura->faixa->conta silenciosa->token guardado · reabre sem portao · migra 1x · exclui->estado inicial · dormente sem servidor');

  contas._resetParaTeste();
  console.log('');
  console.log(falhas === 0 ? '>>> CONTAS OK' : `>>> ${falhas} FALHA(S)`);
  process.exit(falhas ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
