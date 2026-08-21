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

// melhor próxima ação do lado ativo, ou null se nada melhora a posição
function iaProximaAcao(st) {
  const lado = st.ativo;
  const base = iaPontuar(st, lado);
  let melhor = null, melhorDelta = 1e-6;   // exige ganho estritamente positivo
  for (const u of st.lados[lado].units) {
    if (!podeAgir(u)) continue;
    for (const c of iaCandidatos(st, u)) {
      const cl = iaClonar(st);
      const r = agir(cl, c.uid, c.slot, c.alvos, c.escolhas);
      if (!r || !r.ok) continue;
      const d = iaPontuar(cl, lado) - base;
      if (d > melhorDelta) { melhorDelta = d; melhor = c; }
    }
  }
  return melhor;
}

if (typeof module !== 'undefined') {
  module.exports = { iaProximaAcao, iaPontuar };
}
