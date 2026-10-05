// ===================================================================
// INCURSION x3 Battle — IA PROTÓTIPO (§322). As candidatas de medição/afinação.
// IMPORTANTE (§322 Parte 2): a candidata "papel" é agora a MESMA função que o jogo roda — iaProximaAcaoPapel
// de src/ia.js (a IA v2). Aqui só re-exportamos (medido == embarcado) + a fábrica makePapel(W) para a
// afinação varrer pesos, e mantemos ply2/combo (experimentais, NÃO embarcadas; ficaram mais fracas na Parte 1).
//
// Determinísticas (sem Math.random, sem corte por tempo). Dependem dos globais do motor (agir/fimTurno/
// podeAgir/acoesDe) e reusam iaClonar/iaCandidatos/iaPontuar de src/ia.js.
// ===================================================================
'use strict';
const path = require('path');
const { iaClonar, iaCandidatos, iaPontuar, iaProximaAcaoPapel, iaPontuarPapel, IA_V2_W } = require(path.join(__dirname, '..', 'src', 'ia.js'));

const DEFAULT_W = IA_V2_W;                 // os pesos embarcados (a afinação parte daqui / varre em volta)
const pontuarPapel = iaPontuarPapel;       // a MESMA pontuação do jogo
const makePapel = W => (st => iaProximaAcaoPapel(st, W || IA_V2_W));   // decisor papel com pesos W (a afinação mede isto)
const proxPapel = makePapel(IA_V2_W);

// --- ply2 / combo: experimentais da Parte 1 (mais fracas) — mantidas só para o registro de medição ---
function _candidatosLado(st) { const lado = st.ativo, out = []; for (const u of st.lados[lado].units) { if (!podeAgir(u)) continue; for (const c of iaCandidatos(st, u)) out.push(c); } return out; }
function _melhorRespostaInimigo(st, pontuar) {
  const lado = st.ativo, base = pontuar(st, lado); let md = 1e-6, best = null;
  for (const c of _candidatosLado(st)) { const cl = iaClonar(st); const r = agir(cl, c.uid, c.slot, c.alvos, c.escolhas); if (!r || !r.ok) continue; const d = pontuar(cl, lado) - base; if (d > md) { md = d; best = cl; } }
  return best;
}
function _decidir2ply(st, pontuar) {
  const lado = st.ativo, base = pontuar(st, lado); let melhor = null, melhorDelta = 1e-6;
  for (const c of _candidatosLado(st)) {
    const cl = iaClonar(st); const r = agir(cl, c.uid, c.slot, c.alvos, c.escolhas); if (!r || !r.ok) continue;
    let valor;
    if (cl.fim) valor = pontuar(cl, lado) + (cl.fim.resultado === 'vitoria' && cl.fim.lado === lado ? 1000 : 0);
    else { fimTurno(cl); if (!cl.fim && cl.ativo === (1 - lado)) { const resp = _melhorRespostaInimigo(cl, pontuar); valor = pontuar(resp || cl, lado); } else valor = pontuar(cl, lado); }
    const ganho = valor - base; if (ganho > melhorDelta) { melhorDelta = ganho; melhor = c; }
  }
  return melhor;
}
const proxPly2 = st => _decidir2ply(st, iaPontuar);
const proxCombo = st => _decidir2ply(st, (s, l) => iaPontuarPapel(s, l, IA_V2_W));

const PROTOS = { papel: proxPapel, ply2: proxPly2, combo: proxCombo };

module.exports = { PROTOS, proxPapel, proxPly2, proxCombo, pontuarPapel, makePapel, DEFAULT_W };
