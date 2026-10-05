// ===================================================================
// INCURSION x3 Battle — IA PROTÓTIPO (§322 PARTE 1 — SÓ MEDIÇÃO)
// Candidatas a uma IA que usa o KIT INTEIRO. NÃO são ligadas no jogo: vivem aqui, fora de src/, e só são
// consumidas pelas ferramentas de medição (tools/medir_ia.js, tools/medir_niveis.js --proto=…). A IA do
// jogo (src/ia.js) NÃO muda nesta parte.
//
// Três candidatas, todas DETERMINÍSTICAS (sem Math.random, sem corte por tempo — o replay exige que a
// mesma posição decida sempre igual):
//   (a) PAPEL  — gulosa de 1 lance, mas com uma PONTUAÇÃO por PAPEL do efeito (dá valor a buff, escudo/cura
//                SÓ se há dano chegando, provocação/redução, controle, vulnerável, execução). Resolve o
//                "a utilidade baixa a pontuação crua, então nunca é escolhida".
//   (b) PLY2   — a pontuação ATUAL (iaPontuar), mas olhando 2 lances: o meu lance + a MELHOR resposta
//                gulosa do inimigo (fimTurno + 1 iaProximaAcao 'normal'); escolhe o lance com melhor
//                resultado DEPOIS da resposta.
//   (c) COMBO  — (a) e (b): pontuação por papel + a resposta gulosa do inimigo.
//
// Depende dos globais do motor (agir, fimTurno, podeAgir, acoesDe, alvosValidos, ef) e reusa de src/ia.js
// iaClonar / iaCandidatos / iaPontuar (não duplica a enumeração de lances nem a mira).
// ===================================================================
'use strict';
const path = require('path');
const { iaClonar, iaCandidatos, iaPontuar } = require(path.join(__dirname, '..', 'src', 'ia.js'));

// --- vocabulário de efeitos (data/deuses) classificado por PAPEL (quem lê é a pontuação) ---
const P_CONTROLE = ['atordoado', 'adormecido', 'submerso', 'taunt', 'silenceClass', 'lockSkill', 'dominado', 'medo', 'agarrar', 'pacificado', 'selado', 'torpor', 'passeForcado'];
const P_DEBUFF_DANO = ['dmgDown', 'encharcado'];               // reduz o dano de SAÍDA do inimigo
const P_DEBUFF_UTIL = ['noHeal', 'livro', 'antiRevive', 'olho', 'pressagio', 'marcado', 'retaliacao'];  // atrapalha sem ser dano/controle
const P_BUFF_DEF = ['dmgReduction', 'invulneravel', 'controlImmune', 'pisoVida', 'intercepta', 'refleteDano', 'contraAtaca', 'caldeirao'];
const P_BUFF_OFF = ['dmgUp', 'proximoGolpePuro', 'acaoPerfeita', 'danoFimTurno'];
const P_EVASAO = ['inalvejavel'];

function _ef(u, tipo) { return u.efeitos && u.efeitos.find(e => e.type === tipo); }
function _tem(u, lista) { return !!(u.efeitos && u.efeitos.some(e => lista.includes(e.type))); }
function _soma(u, lista) { let s = 0; if (u.efeitos) for (const e of u.efeitos) if (lista.includes(e.type)) s += (typeof e.v === 'number' ? e.v : 0) * Math.max(1, e.dur || 1); return s; }

// dano PRONTO do lado `lado` (há golpe disponível que vai chegar) — serve p/ só valorizar escudo/cura/
// provocação/redução QUANDO há dano chegando (senão a IA cura sem motivo e infla o uso falsamente).
function _danoProntoDoLado(st, lado) {
  let max = 0;
  for (const e of st.lados[lado].units) {
    if (!e.vivo || !podeAgir(e)) continue;
    for (const a of acoesDe(st, e)) {
      if (!a.disponivel || a.slot === 'defesa') continue;
      // dano declarado do kit efetivo do atacante (o motor expõe kitDe); fallback 0
      try {
        const ek = (typeof kitDe === 'function') ? kitDe(st, e) : null;
        const ab = ek && (ek.ab || []).find(x => x.slot === a.slot);
        const d = ab ? Math.max(0, 0, ...((ab.fx) || []).filter(f => f.t === 'dmg' && typeof f.v === 'number').map(f => f.v)) : 0;
        if (d > max) max = d;
      } catch (e2) { /* kitDe indisponível: ignora */ }
    }
  }
  return max;
}

// ---------------------------------------------------------------
// (a) PONTUAÇÃO POR PAPEL — do ponto de vista de `lado`. Estende a iaPontuar: além de hp/escudo/controle,
// dá valor explícito a buff ofensivo/defensivo do próprio lado, a vulnerável/debuff no inimigo, e pesa
// escudo/regen pelo dano que está CHEGANDO (zero dano chegando → escudo vale pouco).
// ---------------------------------------------------------------
function pontuarPapel(st, lado) {
  const meu = st.lados[lado].units, ini = st.lados[1 - lado].units;
  const danoIniPronto = _danoProntoDoLado(st, 1 - lado);   // dano que o INIMIGO pode cravar (ameaça aos meus)
  let s = 0;
  for (const u of meu) {
    if (!u.vivo) { s -= 45; continue; }
    s += u.hp;
    // escudo e redução valem conforme o dano que vem chegando (até o teto da ameaça), + um piso simbólico
    const esc = (u.shield || 0), red = (_ef(u, 'dmgReduction') || {}).v || 0;
    s += Math.min(esc, danoIniPronto) * 0.7 + esc * 0.15;
    s += Math.min(red, danoIniPronto) * 0.6;
    if (danoIniPronto > 0) {
      if (_ef(u, 'invulneravel')) s += Math.min(danoIniPronto, 24) * 0.8;
      if (_ef(u, 'pisoVida')) s += 6;
      if (_tem(u, ['intercepta', 'refleteDano', 'contraAtaca'])) s += 4;
    }
    // buff ofensivo: dano extra × turnos (× nº de alvos que ele provavelmente bate = os inimigos vivos, cap 3)
    const off = _soma(u, P_BUFF_OFF); if (off) s += off * 0.9;
    if (_ef(u, 'regen')) s += (_ef(u, 'regen').v || 0) * Math.max(1, (_ef(u, 'regen').dur || 1)) * 0.5;
    if (_tem(u, P_CONTROLE)) s -= 6;
    if (_tem(u, ['noHeal', 'livro', 'medo'])) s -= 2;
  }
  for (const u of ini) {
    if (!u.vivo) { s += 45; continue; }
    s -= u.hp * 1.1; s -= (u.shield || 0) * 0.6;
    // controle no inimigo: nega o lance dele (o ply2 captura o resto, por via da resposta não acontecer)
    if (_tem(u, P_CONTROLE)) s += 5;
    // vulnerável: +dano de ENTRADA → vale o dano extra que meus aliados cravam (× turnos)
    const vul = _soma(u, ['vulneravel']); if (vul) s += vul * 0.9;
    // dmgDown/encharcado no inimigo: menos dano de saída dele
    s += _soma(u, P_DEBUFF_DANO) * 0.5;
    s += (u.efeitos ? u.efeitos.filter(e => P_DEBUFF_UTIL.includes(e.type)).length : 0) * 2;
    if (u.dots) s += u.dots.reduce((a, d) => a + d.v * d.dur, 0) * 0.5;
  }
  return s;
}

// ---------------------------------------------------------------
// enumeração de lances do lado ativo (reusa iaCandidatos de src/ia.js — mesma mira que a IA do jogo)
// ---------------------------------------------------------------
function _candidatosLado(st) {
  const lado = st.ativo, out = [];
  for (const u of st.lados[lado].units) { if (!podeAgir(u)) continue; for (const c of iaCandidatos(st, u)) out.push(c); }
  return out;
}

// melhor resposta GULOSA (1 lance) do inimigo após o meu turno — para o ply2. Determinística: usa a MESMA
// iaPontuar e a MESMA enumeração; NÃO usa a iaProximaAcao do jogo (evita acoplar o protótipo à versão dela).
function _melhorRespostaInimigo(st, pontuar) {
  const lado = st.ativo, base = pontuar(st, lado);
  let melhor = null, md = 1e-6;
  for (const c of _candidatosLado(st)) {
    const cl = iaClonar(st); const r = agir(cl, c.uid, c.slot, c.alvos, c.escolhas);
    if (!r || !r.ok) continue;
    const d = pontuar(cl, lado) - base; if (d > md) { md = d; melhor = { c, cl }; }
  }
  return melhor;   // { c, cl } ou null
}

// ---------------------------------------------------------------
// decisor genérico. pontuar = função de posição; olhar2 = aplica a resposta gulosa do inimigo antes de pontuar.
// ---------------------------------------------------------------
function _decidir(st, pontuar, olhar2) {
  const lado = st.ativo, base = pontuar(st, lado);
  let melhor = null, melhorDelta = 1e-6;
  for (const c of _candidatosLado(st)) {
    const cl = iaClonar(st);
    const r = agir(cl, c.uid, c.slot, c.alvos, c.escolhas);
    if (!r || !r.ok) continue;
    let valor;
    if (cl.fim) {
      valor = pontuar(cl, lado) + (cl.fim.resultado === 'vitoria' && cl.fim.lado === lado ? 1000 : 0);
    } else if (olhar2) {
      // meu lance + a melhor resposta gulosa do inimigo: encerro meu turno e deixo UM lance dele
      fimTurno(cl);
      if (!cl.fim && cl.ativo === (1 - lado)) {
        const resp = _melhorRespostaInimigo(cl, pontuar);
        valor = pontuar(resp ? resp.cl : cl, lado);
      } else {
        valor = pontuar(cl, lado);   // meu lance já encerrou (empate/vitória) ou ainda é meu turno
      }
    } else {
      valor = pontuar(cl, lado);
    }
    const ganho = valor - base;
    if (ganho > melhorDelta) { melhorDelta = ganho; melhor = c; }
  }
  return melhor;
}

// --- as três candidatas ---
function proxPapel(st) { return _decidir(st, pontuarPapel, false); }
function proxPly2(st) { return _decidir(st, iaPontuar, true); }
function proxCombo(st) { return _decidir(st, pontuarPapel, true); }

const PROTOS = { papel: proxPapel, ply2: proxPly2, combo: proxCombo };

module.exports = { PROTOS, proxPapel, proxPly2, proxCombo, pontuarPapel };
