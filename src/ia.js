// ===================================================================
// INCURSION x3 Battle — IA do oponente (CPU)
// Gulosa de 1 lance: para cada ação possível de cada unidade do lado ativo,
// CLONA o estado, aplica a ação (mesmo motor puro) e PONTUA a posição
// resultante. Escolhe a de maior ganho. Prioriza abate > dano > controle >
// cura. Não é minimax (Fase 2 do ROTEIRO); é o suficiente pra um oponente
// realista de teste. Roda no cliente; pode usar clone/heurística à vontade.
// Depende dos globais do motor: acoesDe, podeAgir, agir (concatenados no build).
// ===================================================================

const IA_CONTROLES = ['atordoado', 'adormecido', 'submerso', 'taunt', 'silenceClass', 'lockSkill', 'dominado'];
const IA_DEBUFFS = ['dmgDown', 'encharcado', 'noHeal', 'livro'];

function iaClonar(st) {                 // clona sem o log (grande e irrelevante p/ decisão)
  const log = st.log; st.log = [];
  const c = JSON.parse(JSON.stringify(st));
  st.log = log; c.log = [];
  return c;
}

// pontua a posição do ponto de vista de `lado` (maior = melhor pra ele)
function iaPontuar(st, lado) {
  const meu = st.lados[lado].units, ini = st.lados[1 - lado].units;
  let s = 0;
  for (const u of meu) {
    if (u.vivo) { s += u.hp; s += (u.shield || 0) * 0.6; if (u.efeitos && u.efeitos.some(e => IA_CONTROLES.includes(e.type))) s -= 6; }
    else s -= 45;
  }
  for (const u of ini) {
    if (u.vivo) {
      s -= u.hp * 1.1; s -= (u.shield || 0) * 0.6;
      if (u.efeitos) {
        if (u.efeitos.some(e => IA_CONTROLES.includes(e.type))) s += 5;
        s += u.efeitos.filter(e => IA_DEBUFFS.includes(e.type)).length * 2;
      }
      if (u.dots) s += u.dots.reduce((a, d) => a + d.v * d.dur, 0) * 0.4;
    } else s += 45;
  }
  return s;
}

// conjuntos de alvos a tentar para uma ação, conforme o tipo de alvo
function iaAlvoSets(a, ini, ali) {
  const menorHp = arr => arr.slice().sort((x, y) => x.hp - y.hp);
  switch (a.alvo) {
    case 'inimigo':        return ini.map(e => [e.uid]);
    case 'aliado':         return ali.map(x => [x.uid]);
    case '2inimigos':      return ini.length >= 2 ? [menorHp(ini).slice(0, 2).map(e => e.uid)] : (ini.length ? [[ini[0].uid]] : [[]]);
    case '2aliados':       return ali.length >= 2 ? [menorHp(ali).slice(0, 2).map(x => x.uid)] : (ali.length ? [[ali[0].uid]] : [[]]);
    case 'aliado+inimigo': return (ali.length && ini.length) ? [[menorHp(ali)[0].uid, menorHp(ini)[0].uid]] : [[]];
    // §144: multi-golpe distribuído. Os DOIS intents reais da Forma A (o jogador não faz split fino, a IA
    // também não): FOCAR tudo no mais fraco, ou DIVIDIR igual entre os vivos. A ordem é a seleção (§92: o 1º
    // leva o extra da divisão desigual; o posicional do Raijin segue a seleção) → ordeno por menor HP, o mais
    // fraco em 1º, p/ o extra e o golpe posicional mais forte caírem no abatível. No máx 2 conjuntos por ação.
    case 'distribui': {
      if (!ini.length) return [[]];
      const ord = menorHp(ini).map(e => e.uid);
      return ini.length === 1 ? [[ord[0]]] : [[ord[0]], ord];   // [focar no mais fraco] · [dividir entre todos]
    }
    default:               return [[]];   // nenhum, todosInimigos, auto
  }
}

function iaCandidatos(st, u) {
  const out = [];
  const acs = acoesDe(st, u).filter(a => a.disponivel && a.slot !== 'defesa');
  const ali = st.lados[u.lado].units.filter(x => x.vivo);
  for (const a of acs) {
    // F1.9: a IA mira SÓ de alvosValidos — respeita Inalvejável/Submerso/Provocar/ignora-mira, como o jogador.
    // Sem isto, a IA atacaria um Inalvejável (o bater não tem rede — a evasão mora só na seleção, §84 invariante).
    const ini = alvosValidos(st, u, a).filter(x => x.lado !== u.lado);   // só inimigos (para habilidade de aliado, o passo 0 são aliados → ini vazio; iaAlvoSets usa `ali`)
    for (const alvos of iaAlvoSets(a, ini, ali)) {
      if (a.opcoes) { for (let i = 0; i < a.opcoes.length; i++) out.push({ uid: u.uid, slot: a.slot, alvos, escolhas: [i] }); }
      else out.push({ uid: u.uid, slot: a.slot, alvos, escolhas: null });
    }
  }
  return out;
}

// NÍVEIS de IA (F2.2) — todos DETERMINÍSTICOS: sem Math.random, sem corte por tempo (corte por tempo é
// não-determinismo disfarçado — a mesma posição decide diferente conforme a máquina). Servem o jogo normal e a
// arena; a PROVAÇÃO pina no 'normal' (§150: identidade — o solucionador verifica contra o MESMO oponente que o
// jogador enfrenta). A dificuldade da Provação vive no estado+condição, nunca na força da IA.
//   facil   — só o Básico (ignora habilidade/milagre): claramente mais fraco, previsível
//   normal  — a gulosa de 1 lance (o comportamento histórico)
//   dificil — gulosa com 2-ply DENTRO do turno (soma o melhor lance seguinte); mais forte, ainda determinístico
const NIVEIS_IA = ['facil', 'normal', 'dificil'];

function iaCandidatosLado(st, lado, nivel) {
  const out = [];
  for (const u of st.lados[lado].units) {
    if (!podeAgir(u)) continue;
    for (const c of iaCandidatos(st, u)) {
      if (nivel === 'facil' && c.slot !== 'basico') continue;   // Fácil: só o Básico
      out.push(c);
    }
  }
  return out;
}

// ===================================================================
// IA v2 (§322) — "papel": gulosa de 1 lance com PONTUAÇÃO POR PAPEL. Usa o kit inteiro (buff, escudo/cura
// com dano chegando, controle pelo dano negado, provocação que salva um aliado frágil, vulnerável, execução/
// foco). Determinística (replay-safe). Pesos AFINADOS no §322 Parte 2 (treino 64 comps; confirmação em
// sementes separadas = 58,9%–63,1% contra a v1; alvo ≥58% batido). Ver docs/ia-kit-inteiro.md.
// VERSIONADA: o replay carrega iaVer; v1 = a gulosa histórica (abaixo), v2 = esta. NUNCA mudar estes pesos
// sem criar uma v3 — mudá-los quebraria a re-simulação dos replays v2 (divergência).
const IA_VERSAO_JOGO = 2;   // §322 P2: a versão "mais nova" disponível (papel). §322 P3: QUAL modo a usa está em
// data/ia_por_modo.json (não é mais global) — iaVersaoDeModo decide por modo. IA_VERSAO_JOGO fica como o teto.
// §322 P3 — versão da IA de um MODO de PvE, lida da tabela única (IA_POR_MODO, embutida pelo build). Default 1
// (a v1 congelada, sempre vencível): um modo desconhecido ou sem tabela NUNCA sobe para a v2 por acidente.
function iaVersaoDeModo(modo) {
  try { const t = (typeof IA_POR_MODO !== 'undefined') ? IA_POR_MODO : null; const v = t && t.modos && t.modos[modo]; return v === 2 ? 2 : 1; }
  catch (e) { return 1; }
}
const IA_V2_W = {
  hpAliado: 1.0, escudoUtil: 0.7, escudoBase: 0.15, reducao: 0.6, invuln: 0.8, piso: 6, defExtra: 4,
  buffOff: 0.4, regen: 0.5, ctrlProprio: 6, debuffProprio: 2,
  hpInimigo: 1.0, escudoInimigo: 0.6, exec: 0.6, execLimiar: 48,
  controle: 12, controleTeto: 16, provoca: 1.6, vulneravel: 0.9, dmgDownIni: 0.6, debuffUtil: 2, dots: 0.5,
  morteAliado: 45, morteInimigo: 45,
};
const IA2_CONTROLE = ['atordoado', 'adormecido', 'submerso', 'silenceClass', 'lockSkill', 'dominado', 'medo', 'agarrar', 'pacificado', 'selado', 'torpor', 'passeForcado'];  // taunt NÃO (vai no termo de provocação)
const IA2_DEBUFF_DANO = ['dmgDown', 'encharcado'];
const IA2_DEBUFF_UTIL = ['noHeal', 'livro', 'antiRevive', 'olho', 'pressagio', 'marcado', 'retaliacao'];
const IA2_BUFF_OFF = ['dmgUp', 'proximoGolpePuro', 'acaoPerfeita', 'danoFimTurno'];
function _ia2ef(u, t) { return u.efeitos && u.efeitos.find(e => e.type === t); }
function _ia2tem(u, lista) { return !!(u.efeitos && u.efeitos.some(e => lista.includes(e.type))); }
function _ia2soma(u, lista) { let s = 0; if (u.efeitos) for (const e of u.efeitos) if (lista.includes(e.type)) s += (typeof e.v === 'number' ? e.v : 0) * Math.max(1, e.dur || 1); return s; }
// dano direto do kit de uma unidade (independe de controle — serve p/ creditar o controle pelo dano negado).
function _ia2danoKit(st, u) {
  let max = 0;
  try {
    const ek = (typeof kitDe === 'function') ? kitDe(st, u) : null;
    for (const a of acoesDe(st, u)) {
      if (!a.disponivel || a.slot === 'defesa') continue;
      const ab = ek && (ek.ab || []).find(x => x.slot === a.slot);
      const d = ab ? Math.max(0, 0, ...((ab.fx) || []).filter(f => f.t === 'dmg' && typeof f.v === 'number' && !f.posicional).map(f => f.v)) : 0;
      if (d > max) max = d;
    }
  } catch (e) { /* kitDe indisponível */ }
  return max;
}
function _ia2ameaca(st, lado) { let m = 0; for (const u of st.lados[lado].units) if (u.vivo && podeAgir(u)) m = Math.max(m, _ia2danoKit(st, u)); return m; }
// pontuação por papel (do ponto de vista de `lado`); W por omissão = IA_V2_W.
function iaPontuarPapel(st, lado, W) {
  W = W || IA_V2_W;
  const meu = st.lados[lado].units, ini = st.lados[1 - lado].units;
  const ameacaIni = _ia2ameaca(st, 1 - lado);
  let s = 0;
  for (const u of meu) {
    if (!u.vivo) { s -= W.morteAliado; continue; }
    s += W.hpAliado * u.hp;
    const esc = (u.shield || 0), red = (_ia2ef(u, 'dmgReduction') || {}).v || 0;
    s += W.escudoUtil * Math.min(esc, ameacaIni) + W.escudoBase * esc;
    s += W.reducao * Math.min(red, ameacaIni);
    if (ameacaIni > 0) {
      if (_ia2ef(u, 'invulneravel')) s += W.invuln * Math.min(ameacaIni, 24);
      if (_ia2ef(u, 'pisoVida')) s += W.piso;
      if (_ia2tem(u, ['intercepta', 'refleteDano', 'contraAtaca'])) s += W.defExtra;
    }
    s += W.buffOff * _ia2soma(u, IA2_BUFF_OFF);
    const rg = _ia2ef(u, 'regen'); if (rg) s += W.regen * (rg.v || 0) * Math.max(1, rg.dur || 1);
    if (_ia2tem(u, IA2_CONTROLE)) s -= W.ctrlProprio;
    if (_ia2tem(u, ['noHeal', 'livro', 'medo'])) s -= W.debuffProprio;
  }
  const provVivos = {};
  for (const u of meu) if (u.vivo) provVivos[u.uid] = u;
  for (const u of ini) {
    if (!u.vivo) { s += W.morteInimigo; continue; }
    s -= W.hpInimigo * u.hp;
    if (W.exec) s += W.exec * Math.max(0, W.execLimiar - u.hp);
    s -= W.escudoInimigo * (u.shield || 0);
    if (_ia2tem(u, IA2_CONTROLE)) s += W.controle * (Math.min(_ia2danoKit(st, u), W.controleTeto) / W.controleTeto);
    const vul = _ia2soma(u, ['vulneravel']); if (vul) s += W.vulneravel * vul;
    s += W.dmgDownIni * _ia2soma(u, IA2_DEBUFF_DANO);
    s += (u.efeitos ? u.efeitos.filter(e => IA2_DEBUFF_UTIL.includes(e.type)).length : 0) * W.debuffUtil;
    if (u.dots) s += W.dots * u.dots.reduce((a, d) => a + d.v * d.dur, 0);
    const tt = _ia2ef(u, 'taunt');
    if (W.provoca && tt) {
      const prov = provVivos[tt.origem];
      if (prov) { const frageis = meu.filter(x => x.vivo && x.uid !== prov.uid && x.hp < prov.hp); if (frageis.length) { const fraco = frageis.reduce((a, b) => a.hp < b.hp ? a : b); s += W.provoca * Math.min(_ia2danoKit(st, u), fraco.hp); } }
    }
  }
  return s;
}
// decisor papel (1 lance, determinístico). versão parametrizável por W — a afinação passa W; o jogo usa IA_V2_W.
function iaProximaAcaoPapel(st, W) {
  W = W || IA_V2_W;
  const lado = st.ativo, base = iaPontuarPapel(st, lado, W);
  let melhor = null, melhorDelta = 1e-6;
  for (const u of st.lados[lado].units) {
    if (!podeAgir(u)) continue;
    for (const c of iaCandidatos(st, u)) {
      const cl = iaClonar(st); const r = agir(cl, c.uid, c.slot, c.alvos, c.escolhas); if (!r || !r.ok) continue;
      const valor = cl.fim ? (iaPontuarPapel(cl, lado, W) + (cl.fim.resultado === 'vitoria' && cl.fim.lado === lado ? 1000 : 0)) : iaPontuarPapel(cl, lado, W);
      const ganho = valor - base;
      if (ganho > melhorDelta) { melhorDelta = ganho; melhor = c; }
    }
  }
  return melhor;
}

// melhor próxima ação do lado ativo, ou null se nada melhora a posição. `nivel` default 'normal' (compat.).
// §322: `versao` seleciona a IA — 1 = gulosa histórica (congelada; o replay antigo re-simula com ela), 2 =
// papel (IA_V2_W). Só o 'normal' versiona (facil/dificil seguem a v1). O default 1 preserva os chamadores
// de teste; o JOGO passa IA_VERSAO_JOGO (2) e o replay re-simula com a versão do envelope.
function iaProximaAcao(st, nivel = 'normal', versao = 1) {
  if (versao === 2 && nivel === 'normal') return iaProximaAcaoPapel(st, IA_V2_W);
  const lado = st.ativo;
  const base = iaPontuar(st, lado);
  let melhor = null, melhorDelta = 1e-6;   // exige ganho estritamente positivo
  for (const c of iaCandidatosLado(st, lado, nivel)) {
    const cl = iaClonar(st);
    const r = agir(cl, c.uid, c.slot, c.alvos, c.escolhas);
    if (!r || !r.ok) continue;
    let ganho = iaPontuar(cl, lado) - base;
    if (nivel === 'dificil') {   // 2-ply dentro do turno: + o melhor lance SEGUINTE do próprio lado (sem oponente, determinístico)
      const baseSeg = iaPontuar(cl, lado);
      let melhorSeg = 0;
      for (const c2 of iaCandidatosLado(cl, lado, nivel)) {
        const cl2 = iaClonar(cl);
        const r2 = agir(cl2, c2.uid, c2.slot, c2.alvos, c2.escolhas);
        if (!r2 || !r2.ok) continue;
        melhorSeg = Math.max(melhorSeg, iaPontuar(cl2, lado) - baseSeg);
      }
      ganho += melhorSeg;
    }
    if (ganho > melhorDelta) { melhorDelta = ganho; melhor = c; }
  }
  return melhor;
}

if (typeof module !== 'undefined') {
  module.exports = { iaProximaAcao, iaPontuar, NIVEIS_IA, iaCandidatos, iaClonar,   // iaCandidatos/iaClonar: §318 F1b régua de USO FORÇADO (força o slot, reusa a MIRA da IA)
    iaPontuarPapel, iaProximaAcaoPapel, IA_V2_W, IA_VERSAO_JOGO, iaVersaoDeModo };   // §322: IA v2 (papel) + versão por modo (P3)
}
