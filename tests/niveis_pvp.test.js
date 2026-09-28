// tests/niveis_pvp.test.js — §318 FASE 1: a SEMENTE do PvP nivelado.
// No PvP com níveis DIFERENTES entre os lados, o cliente reproduz a partida a partir do estado
// serializado do servidor. Para o hash da prova F5.0 bater, o cliente precisa montar os catálogos
// EFETIVOS dos DOIS lados (a própria conta + niveisOponente, a projeção pública do servidor) e
// registrá-los sob os ids que o servidor pôs em st.catId. Prova:
//   (1) cliente CERTO (own niveis + niveisOponente) → o replay bate o hash do servidor a cada passo;
//   (2) cliente ERRADO (ignora niveisOponente) → a guarda ACUSA (hash diverge) quando o lado do
//       oponente age com o kit nivelado.
// Server e cliente compartilham o MESMO módulo do motor no processo (in-process); _limparCatalogos()
// simula um cliente FRESCO (registro de catálogos vazio), senão o registro do servidor mascararia o teste.
const host = require('../server/motor-host.js');   // Object.assign(globalThis, E): funções do motor viram globais
const cli = require('../src/partida_cliente.js');
const E = host.E;

let falhas = 0;
const ok = (c, m) => { if (!c) { console.log('  FALHA: ' + m); falhas++; } };

console.log('§318 FASE 1 — SEMENTE DO PvP NIVELADO');

// escada SINTÉTICA no básico do Zeus (independente do conteúdo commitado; pequenos, p/ o teste do replay).
E.GODS.zeus.ab[0].niveis = [
  { nv: 2, muda: [{ caminho: 'fx[0].v', de: 15, para: 17 }], desc: '17 de dano a 1 inimigo.' },
  { nv: 3, muda: [{ caminho: 'fx[0].v', de: 17, para: 19 }], desc: '19 de dano a 1 inimigo.' },
];
const T0 = ['zeus', 'ares', 'atena'], T1 = ['zeus', 'apolo', 'hades'];
// lado 0 (o "meu"): Zeus nv3 (dano 19). lado 1 (oponente): Zeus nv2 (dano 17). ASSIMÉTRICO.
const NIV0 = { zeus: { basico: 3, habilidade: 1, milagre: 1 } };
const NIV1 = { zeus: { basico: 2, habilidade: 1, milagre: 1 } };

// monta o estado autoritativo do servidor e prepara os orbes (parte do estado inicial compartilhado).
function montarServidor() {
  const st = host.montar({ aliados: T0, inimigos: T1, montar: { seed: 5, comeca: 0 }, condicoes: [], niveis: [NIV0, NIV1] });
  st.lados[0].orbs.Tempestade = 9; st.lados[1].orbs.Tempestade = 9;
  return st;
}
// SEQUÊNCIA de ops idêntica nos dois lados: Zeus0 bate em Zeus1, encerra, Zeus1 bate em Zeus0, encerra.
const OPS = [
  { tipo: 'agir', uid: '0-0', slot: 'basico', alvos: ['1-0'] },
  { tipo: 'fim' },
  { tipo: 'agir', uid: '1-0', slot: 'basico', alvos: ['0-0'] },
  { tipo: 'fim' },
];
function aplicarOp(st, op) {
  if (op.tipo === 'fim') E.fimTurno(st);
  else E.agir(st, op.uid, op.slot, op.alvos, null, null);
}

// catId é PAR (lados divergem)?
const stProbe = montarServidor();
ok(Array.isArray(stProbe.catId), 'catId é PAR no PvP com níveis distintos');

// VERDADE do servidor: hashes a cada passo.
const stS = montarServidor();
const verdade = [host.hashEstado(stS)];
for (const op of OPS) { aplicarOp(stS, op); verdade.push(host.hashEstado(stS)); }
// sanity: o dano do Zeus0 (nv3) = 19; do Zeus1 (nv2) = 17.
const s2 = montarServidor(); const hp1 = s2.lados[1].units[0].hp; aplicarOp(s2, OPS[0]);
ok(hp1 - s2.lados[1].units[0].hp === 19, 'servidor: Zeus0 (nv3) causa 19');

// serializa o estado inicial UMA vez (a string do servidor). Reusar isto (em vez de re-montar) é
// crucial: re-montar re-registraria os catálogos efetivos do servidor e mascararia o teste do cliente
// FRESCO — o cliente tem de reconstruí-los sozinho a partir do estado + níveis.
const ESTADO_STR = host.serializar(montarServidor());
// snapshot que o servidor manda ao cliente do lado 0 (humano:0). niveisOponente = níveis do lado 1.
function snapPara(humano, niveisOponente) {
  return {
    v: 1, tipo: 'partida',
    estado: JSON.parse(ESTADO_STR),
    turnoDe: 0, humano, modo: 'pvp',
    deadline: 100000, agora: 0, restanteMs: 100000, fim: null,
    niveisOponente,
  };
}
function transporteQueDevolve(msg) { return { pedir: async () => msg }; }

// reproduz OPS no estado do cliente e devolve os hashes a cada passo.
function replayCliente(MP) {
  const hs = [host.hashEstado(MP.st)];
  for (const op of OPS) { aplicarOp(MP.st, op); hs.push(host.hashEstado(MP.st)); }
  return hs;
}

// (1) CLIENTE CERTO: own niveis (lado 0 = NIV0) + niveisOponente (lado 1 = NIV1). Fresco.
(async () => {
  E._limparCatalogos();
  cli.configurarNiveis(() => NIV0);   // os MEUS níveis (lado 0)
  const MP = await cli.novaPartida(transporteQueDevolve(snapPara(0, NIV1)), 'x', {});
  const hs = replayCliente(MP);
  let bate = true; for (let i = 0; i < verdade.length; i++) if (hs[i] !== verdade[i]) bate = false;
  ok(bate, 'CLIENTE CERTO: o replay bate o hash do servidor em TODOS os passos');
  ok(hs[hs.length - 1] === verdade[verdade.length - 1], 'CLIENTE CERTO: hash final idêntico ao servidor');

  // (2) CLIENTE ERRADO: IGNORA niveisOponente (oponente cai para base). A guarda tem de acusar.
  E._limparCatalogos();
  cli.configurarNiveis(() => NIV0);
  const MPruim = await cli.novaPartida(transporteQueDevolve(snapPara(0, /* niveisOponente */ undefined)), 'x', {});
  const hsRuim = replayCliente(MPruim);
  // o passo em que o Zeus1 (oponente) age é o 3º op (índice 3 no array de hashes). Antes disso pode bater.
  let divergiu = false; for (let i = 0; i < verdade.length; i++) if (hsRuim[i] !== verdade[i]) divergiu = true;
  ok(divergiu, 'CLIENTE ERRADO (ignora niveisOponente): a guarda ACUSA — o hash diverge do servidor');
  // e é PRECISAMENTE quando o oponente age (o dano dele cai para 15 base em vez de 17): o hp de Zeus0 difere.
  ok(MPruim.st.lados[0].units[0].hp !== stS.lados[0].units[0].hp || hsRuim[3] !== verdade[3], 'CLIENTE ERRADO: a divergência aparece quando o oponente nivelado age');

  console.log('');
  console.log(falhas === 0 ? '>>> NÍVEIS PvP OK' : `>>> ${falhas} FALHA(S)`);
  process.exit(falhas ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
