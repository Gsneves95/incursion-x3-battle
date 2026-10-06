// §318b-3 — DEFEITO do dono: os Desafios por deus GASTAVAM Essência no CELULAR (comprarDesafio →
// debitar(perfil)), um saldo local que o servidor nem aceita salvar (lista branca do salvarPerfil). A Essência
// é GANHA no servidor (Domínios/Desafios por replay) mas era GASTA local: a economia do §318 Fase 2 furada.
// O conserto leva a COMPRA ao servidor: débito de Essência + recarga de 8h, com o relógio do servidor.
// Este teste prova a economia do desafio de PONTA A PONTA contra o SERVIDOR REAL (processo + WebSocket):
//   A) GANHAR Essência é do servidor: 15 replays de Domínio (nível 1 vencido) → saldo autoritativo sobe a 30.
//   B) COMPRAR com Essência → o servidor DEBITA 30 e entra em RECARGA de 8h (ativo + recargaAte no relógio dele).
//   C) SEM Essência → recusa CLARA (essencia_insuficiente), nunca em silêncio.
//   D) EM RECARGA → recusa CLARA (desafio_recarga) depois de fechar o desafio.
//   E) O CLIENTE TENTANDO GASTAR LOCAL não muda NADA: salvarPerfil com +999 de Essência e um desafio forjado é
//      descartado pela lista branca — o saldo e os desafios continuam os do servidor.
//   F) GUARDA DE CÓDIGO (prova que MORDE): a tela dos Desafios lê moedaServidor (não perfil.moedas) e a compra
//      vai por comprarPergaminhoServidor; nenhum leitor/gastador local de Essência sobrou no fluxo do desafio.
const path = require('path');
const assert = require('assert');
const cp = require('child_process');
const fs = require('fs');

let falhas = 0, passes = 0;
const ok = (c, m) => { if (!c) { console.log('  ✗ FALHA: ' + m); falhas++; } else { console.log('  ✓ ' + m); passes++; } };
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// ---- harness de combate (espelha o driver do cliente e o re-simulador do servidor, como economia.test) ----
const HOST = require('../server/motor-host.js');
const E = HOST.E, ia = HOST.ia;
const DOM = require('../src/dominios.js');
const DADOS = require('../server/dados-pve.js');
function jogar(montarFn) {
  let st; try { st = montarFn(); } catch (e) { return { erro: e.message }; }
  const ops = []; let g = 0;
  while (!st.fim && g++ < 6000) {
    if (st.ativo === 0) {
      // §324 P2: o lado do JOGADOR é dirigido pela IA real (iaProximaAcao), não por um guloso-só-Básico.
      // A régua do gerador de Domínios é a IA gulosa COMPLETA — nenhum nível é garantidamente vencível só
      // com o Básico. A IA real vence o que o gerador mede como vencível, e o replay gravado (só as ações do
      // jogador) re-simula idêntico no servidor (pve.js roda o MESMO motor e a MESMA IA inimiga sobre os ops).
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

// ---- servidor REAL em processo ----
function esperarServidor(child) {
  return new Promise((resolve, reject) => {
    const to = setTimeout(() => reject(new Error('servidor não subiu a tempo')), 15000);
    const onData = (d) => { if (/servidor no ar/.test(d.toString())) { clearTimeout(to); child.stdout.off('data', onData); resolve(); } };
    child.stdout.on('data', onData);
    child.stderr.on('data', () => {});
    child.on('exit', (c) => { clearTimeout(to); reject(new Error('servidor saiu no boot (code ' + c + ')')); });
  });
}

async function e2e() {
  console.log('== §318b-3 — economia dos Desafios de ponta a ponta no SERVIDOR REAL ==');
  const PORT = 8800 + Math.floor(Math.random() * 90);
  const dados = path.join(require('os').tmpdir(), 'inc-dsf-' + process.pid + '-' + Date.now());
  const child = cp.spawn(process.execPath, [path.join(__dirname, '..', 'server', 'server.js')],
    { env: Object.assign({}, process.env, { PORT: String(PORT), HOST: '127.0.0.1', INCURSION_DADOS_DIR: dados }), stdio: ['ignore', 'pipe', 'pipe'] });
  try {
    await esperarServidor(child);
    global.WebSocket = require('ws');
    delete require.cache[require.resolve('../src/conta.js')];
    const { criarTransporteWS } = require('../src/conta.js');
    const tx = await criarTransporteWS('ws://127.0.0.1:' + PORT, { timeout: 5000, pedidoTimeout: 4000 });
    ok(!!tx, 'conecta ao servidor real');

    const rc = await tx.pedir({ v: 1, tipo: 'criarConta', faixaIdade: 'maior' });
    ok(rc && rc.tipo === 'conta' && rc.token, 'criarConta devolve token + conta');
    const token = rc.token;
    ok(rc.conta.perfil.moedas.essencia === 0, 'a conta nasce com 0 de Essência (economia do servidor)');
    ok(!!rc.conta.perfil.deuses.zeus && !!rc.conta.perfil.deuses.tyr, 'a conta possui zeus e tyr (deuses iniciais)');

    // ---- A) GANHAR Essência é do servidor: Domínio nível 1 vencido, 2 por nível, teto por corrida 30 ----
    console.log('\n== A) a Essência é GANHA no servidor (replay de Domínio) ==');
    const lad = DADOS.dominioLadder('grega');
    const esc = DOM.domEscadaSemana(lad, 0);
    const run = { nivel: 1, bonus: 0, semanaIdx: 0, vida: [{ hp: 999, vivo: true }, { hp: 999, vivo: true }, { hp: 999, vivo: true }], reviveGasto: [] };
    const j = jogar(() => DOM.domMontarBatalha(run, esc, { seed: (1 * 7919) >>> 0 }));
    ok(j.venceu, 'o jogador guloso vence o nível 1 do Domínio (pré-condição do replay)');
    let saldoEss = 0;
    for (let i = 0; i < 20 && saldoEss < 30; i++) {
      const r = await tx.pedir({ v: 1, tipo: 'pveResultado', token, replay: { modo: 'dominio', cultura: 'grega', runId: 'runE2E', run, ops: j.ops, idPartida: 'e2e_' + i + '_' + Date.now() } });
      if (r && r.tipo === 'pveCreditado' && r.saldo) saldoEss = r.saldo.essencia;
    }
    ok(saldoEss === 30, `o saldo de Essência sobe pelo SERVIDOR ao teto da corrida (30) — veio ${saldoEss}`);

    // ---- B) COMPRAR com Essência → o SERVIDOR debita 30 e entra em recarga de 8h ----
    console.log('\n== B) comprar com Essência → debita + recarga (relógio do servidor) ==');
    const antes = Date.now();
    const comp = await tx.pedir({ v: 1, tipo: 'comprarPergaminho', token, deus: 'zeus' });
    ok(comp && comp.tipo === 'pergaminhoComprado' && comp.deus === 'zeus', 'comprar zeus → pergaminhoComprado');
    ok(comp.custo === 30 && comp.saldo.essencia === 0, `o servidor DEBITA 30 (saldo 30→0) — veio custo ${comp.custo}, saldo ${comp.saldo.essencia}`);
    const dz = comp.conta.perfil.desafios && comp.conta.perfil.desafios.zeus;
    ok(dz && dz.ativo === true, 'o desafio de zeus fica ATIVO no servidor');
    const resta = (dz && dz.recargaAte || 0) - antes;
    ok(resta > 7.8 * 3600 * 1000 && resta <= 8.2 * 3600 * 1000, `a recarga de ~8h é fixada NA COMPRA pelo relógio do servidor — veio ${(resta / 3600000).toFixed(2)}h`);

    // ---- C) SEM Essência → recusa clara ----
    console.log('\n== C) sem Essência → recusa clara (essencia_insuficiente) ==');
    const semEss = await tx.pedir({ v: 1, tipo: 'comprarPergaminho', token, deus: 'tyr' });
    ok(semEss && semEss.tipo === 'recusado' && semEss.codigo === 'essencia_insuficiente', 'comprar tyr sem Essência → recusado "essencia_insuficiente" (nunca em silêncio)');

    // ---- D) EM RECARGA → recusa clara (após fechar o desafio ativo) ----
    console.log('\n== D) em recarga → recusa clara (desafio_recarga) ==');
    const fecha = await tx.pedir({ v: 1, tipo: 'fecharDesafio', token, deus: 'zeus', cumpriu: true });
    ok(fecha && fecha.tipo === 'desafioFechado' && fecha.deus === 'zeus', 'fecharDesafio(zeus, cumpriu) → desafioFechado');
    const dzf = fecha.conta.perfil.desafios.zeus;
    ok(dzf.ativo === false && dzf.recargaAte > Date.now(), 'após fechar: ativo=false, mas a recarga (fixada na compra) ainda corre');
    const emRec = await tx.pedir({ v: 1, tipo: 'comprarPergaminho', token, deus: 'zeus' });
    ok(emRec && emRec.tipo === 'recusado' && emRec.codigo === 'desafio_recarga', 'recomprar zeus em recarga → recusado "desafio_recarga"');

    // ---- E) o CLIENTE tentando gastar LOCAL não muda NADA (lista branca do salvarPerfil morde) ----
    console.log('\n== E) cliente tentando gastar local → nada muda (whitelist bite) ==');
    const forjado = { versao: 7, moedas: { gema: 999999, essencia: 999 }, desafios: { tyr: { ativo: true, recargaAte: 0 }, zeus: { ativo: true, recargaAte: 0 } }, deuses: {} };
    const sp = await tx.pedir({ v: 1, tipo: 'salvarPerfil', token, perfil: forjado });
    ok(sp && sp.tipo === 'perfilSalvo', 'salvarPerfil aceita a chamada (mas só grava os campos locais)');
    const re = await tx.pedir({ v: 1, tipo: 'entrar', token });
    ok(re && re.tipo === 'conta', 'reentrar devolve a conta do servidor');
    ok(re.conta.perfil.moedas.essencia === 0, 'a Essência continua 0 (o +999 do cliente foi descartado)');
    ok(!(re.conta.perfil.desafios.tyr && re.conta.perfil.desafios.tyr.ativo), 'o desafio de tyr forjado pelo cliente NÃO existe no servidor');
    const rz = re.conta.perfil.desafios.zeus;
    ok(rz && rz.ativo === false && rz.recargaAte > Date.now(), 'o desafio de zeus continua o do servidor (fechado, em recarga) — a forja do cliente não reabriu');

    try { tx.fechar(); } catch (e) {}
  } finally {
    try { child.kill('SIGKILL'); } catch (e) {}
    try { fs.rmSync(dados, { recursive: true, force: true }); } catch (e) {}
  }
}

// ---- F) GUARDA DE CÓDIGO: nenhum leitor/gastador local de Essência no fluxo do desafio (prova que MORDE) ----
function guardaDeCodigo() {
  console.log('\n== F) guarda de código: Desafios sem leitor/gastador local de Essência (bite) ==');
  const home = fs.readFileSync(path.join(__dirname, '../src/ui/home.js'), 'utf8');

  // a tela dos Desafios mostra o saldo do SERVIDOR (moedaServidor), não o perfil local.
  const iTela = home.indexOf('DESAFIOS POR DEUS');
  ok(iTela > 0, 'a tela "DESAFIOS POR DEUS" existe em home.js');
  const bloco = home.slice(home.lastIndexOf('const mestres', iTela) >= 0 ? home.lastIndexOf('const mestres', iTela) : iTela - 600, iTela);
  ok(/moedaServidor\(\)/.test(bloco) && !/perfil\s*&&\s*perfil\.moedas/.test(bloco), 'o cabeçalho dos Desafios lê moedaServidor() e NÃO perfil.moedas (bite: o leitor local do §318b-2 saiu)');

  // a COMPRA vai ao servidor (comprarPergaminhoServidor); não há débito local.
  ok(/comprarPergaminhoServidor\s*\(/.test(home), 'a compra do desafio chama comprarPergaminhoServidor (servidor)');
  ok(!/debitar\s*\(\s*perfil/.test(home), 'não sobrou nenhum debitar(perfil, ...) no fluxo do desafio (bite: o gastador local saiu)');

  // podeComprarDesafio decide pela Essência do SERVIDOR (offline não compra).
  const iPode = home.indexOf('function podeComprarDesafio');
  const pode = home.slice(iPode, home.indexOf('}', home.indexOf('return { ok: true', iPode)) + 1);
  ok(/moedaServidor/.test(pode) && !/perfil\.moedas/.test(pode), 'podeComprarDesafio lê a Essência de moedaServidor, não de perfil.moedas');
  ok(/sem conexão/.test(pode), 'podeComprarDesafio recusa desconectado (sem conexão)');

  // NEGATIVO (prova que a guarda morde): se o código VELHO voltasse, estes padrões casariam.
  ok(!/comprarDesafio\s*\(\s*k\s*\)\s*\{[\s\S]{0,200}debitar/.test(home), 'o padrão do código velho (comprarDesafio→debitar) NÃO existe mais');
}

(async () => {
  try {
    await e2e();
    guardaDeCodigo();
  } catch (e) { console.log('  ✗ ERRO: ' + (e && e.message || e)); falhas++; }
  console.log(`\n${falhas ? '✗ ' + falhas + ' FALHA(S)' : '✓ tudo verde'} · ${passes} asserções`);
  process.exit(falhas ? 1 : 0);
})();
