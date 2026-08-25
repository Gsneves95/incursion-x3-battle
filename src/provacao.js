// ===================================================================
// INCURSION x3 Battle — o FORMATO da Provação (F2.0)
// Uma Provação = estado montado à mão + time inimigo fixo + CONDIÇÃO DE
// VITÓRIA que vai além de "derrube os três". Depende do motor puro
// (novoEstado + st.log estruturado, §F1.0b); não altera o motor.
//
// FECHA POR MODO, não por forma (§144): as ~17 formas da varredura caem
// em 3 MODOS de avaliação, e forma nova cai num modo existente sem tocar
// o avaliador. O `quando` (cedo|fim) é DERIVADO do modo — campo derivado
// não pode divergir do modo (campo declarado poderia).
//   final    — predicado sobre o ESTADO no fim (só julgável no fim)
//   log      — predicado sobre o STREAM de eventos (falha CEDO, quando impossível)
//   continuo — invariante checado a cada turno (falha CEDO, no turno em que quebra)
//
// Predicado desconhecido é recusado na BUILD (validarProvacao → build.js),
// nunca ignorado em runtime (§71: condição que não faz nada é o pior caso).
// ===================================================================

const MODOS = { final: 'fim', log: 'cedo', continuo: 'cedo' };   // modo → `quando` (DERIVADO, nunca declarado)

const ladoDoQuem = quem => (quem === 'aliado' || quem === 'aliados') ? 0 : 1;
const cmp = (a, op, b) => op === '>=' ? a >= b : op === '<=' ? a <= b : op === '==' ? a === b : op === '>' ? a > b : op === '<' ? a < b : false;

// Registro FECHADO. Cada predicado declara { modo, obrig, aval }. aval(st, cfg, ctx) devolve:
//   'ok'       — satisfeito; pode vencer
//   'pendente' — não violado, mas o requisito ainda não foi cumprido (só barra a vitória, não falha cedo)
//   'falha'    — violado / impossível (derrota imediata nos modos log/continuo)
// ctx = { ladoDe(chave)->0|1 }. A completude ("todos os inimigos") cai no gate de base-vitória.
const PREDICADOS = {
  // ---- CONTÍNUO (invariante por turno) ----
  deadline: {
    modo: 'continuo', obrig: ['turnos'],
    aval: (st, c) => st.turno <= c.turnos ? 'ok' : 'falha',   // "vença em N turnos": passou de N sem vencer → falha
  },

  // ---- LOG (predicado sobre o stream de eventos) ----
  morteEmEstado: {   // "cada `quem` tem de cair carregando `estado`" (poseidon: inimigo/encharcado)
    modo: 'log', obrig: ['quem', 'estado'],
    aval: (st, c, ctx) => {
      const lado = ladoDoQuem(c.quem);
      for (const e of st.log) if (e.tipo === 'queda' && ctx.ladoDe(e.alvo) === lado) {
        if (!(e.estados && e.estados.includes(c.estado))) return 'falha';   // caiu SEM o estado → impossível
      }
      return 'ok';
    },
  },
  semPerderAliado: {   // nenhum aliado cai (estrito: uma `queda` de aliado já falha; variante tolerante-a-revive fica p/ depois)
    modo: 'log', obrig: [],
    aval: (st, c, ctx) => st.log.some(e => e.tipo === 'queda' && ctx.ladoDe(e.alvo) === 0) ? 'falha' : 'ok',
  },
  proibirSlotProprio: {   // você NUNCA usa o slot X (≠ negarAcaoInimigo: este é sobre o SEU lado, §144 instr. 4)
    modo: 'log', obrig: ['slot'],
    aval: (st, c, ctx) => st.log.some(e => e.tipo === 'acao' && ctx.ladoDe(e.origem) === 0 && e.slot === c.slot) ? 'falha' : 'ok',
  },
  negarAcaoInimigo: {   // NENHUM inimigo usa o slot X (depende do que o OPONENTE faz — predicado distinto, não escopo).
    // `max` opcional (§156, shutendoji "se usar DOIS milagres, falha" = max 1): tolera até `max` usos, falha no (max+1)-ésimo.
    // Default max 0 = comportamento original (qualquer uso falha) — dionisio/boto/khonshu seguem valendo sem tocar.
    modo: 'log', obrig: ['slot'],
    aval: (st, c, ctx) => st.log.filter(e => e.tipo === 'acao' && ctx.ladoDe(e.origem) === 1 && e.slot === c.slot).length > (c.max || 0) ? 'falha' : 'ok',
  },
  efeitoEmNInimigos: {   // §158 (shutendoji, rewrite): o efeito nomeado foi APLICADO a ≥`limiar` inimigos (latch `jaRecebeu`, sobrevive à morte).
    // `limiar` opcional (default = TODOS os inimigos). CAVALGA o abate (aplicar não exige preservar) — o oposto do rider extrativo.
    // `distancia` puxa o solver a aplicar nos que faltam. Número DERIVÁVEL (dono: "se o Saké não alcançar os 3, é o que alcançar").
    modo: 'log', obrig: ['efeito'],
    aval: (st, c) => { const alvo = c.limiar != null ? c.limiar : st.lados[1].units.length; return st.lados[1].units.filter(u => u.jaRecebeu && u.jaRecebeu[c.efeito] != null).length >= alvo ? 'ok' : 'pendente'; },
    chave: (st, c) => String(st.lados[1].units.filter(u => u.jaRecebeu && u.jaRecebeu[c.efeito] != null).length),
    distancia: (st, c) => { const alvo = c.limiar != null ? c.limiar : st.lados[1].units.length; return Math.max(0, alvo - st.lados[1].units.filter(u => u.jaRecebeu && u.jaRecebeu[c.efeito] != null).length); },
  },
  tetoDeGasto: {   // §158 (hermes rewrite): vença gastando no máximo `limiar` orbes de fonte PRÓPRIA. Roubado NÃO conta (estica o orçamento).
    // FINAL: só julgado na vitória (o teto pode subir depois, quando se rouba — não falha cedo). gastoProprio = gasto − roubado.
    modo: 'final', obrig: ['limiar'],
    aval: (st, c) => {
      const roubado = st.log.reduce((s, e) => s + (e.tipo === 'orbe' && e.ganhouLado === 0 && e.valor > 0 ? e.valor : 0), 0);
      const gastoProprio = Math.max(0, (st.orbeGasto ? st.orbeGasto[0] : 0) - roubado);
      return gastoProprio <= c.limiar ? 'ok' : 'falha';
    },
  },
  semPerderOrbe: {   // §156 (heimdall): nenhum orbe do jogador perdido PARA o inimigo (roubo). Distingue roubo (ganhouLado===1) de
    // remoção pura (ganhouLado===null) e de GASTO (paga custo — evento sem o tag perdeuLado/ganhouLado, §153). "para o inimigo" = roubo.
    modo: 'log', obrig: [],
    aval: (st, c, ctx) => st.log.some(e => e.tipo === 'orbe' && e.perdeuLado === 0 && e.ganhouLado === 1) ? 'falha' : 'ok',
  },
  limparBuffsAntesDeAbate: {   // §156 (iansã): TODO buff dos 3 inimigos removido ANTES da 1ª queda inimiga. O marco (motor) grava o
    // turno em que o lado inimigo ficou TODO sem buff; a 1ª queda vem do log (carrega `turno`). Falha cedo se cair um inimigo antes.
    modo: 'log', obrig: [],
    aval: (st, c, ctx) => {
      const limpou = (st.marcos && st.marcos.semBuffLado) ? st.marcos.semBuffLado[1] : null;   // turno em que os inimigos ficaram TODOS sem buff
      let caiu = null;
      for (const e of st.log) if (e.tipo === 'queda' && ctx.ladoDe(e.alvo) === 1) { caiu = e.turno; break; }   // 1ª queda inimiga
      if (limpou != null && (caiu == null || limpou <= caiu)) return 'ok';   // limpou antes (ou sem) qualquer queda
      if (caiu != null) return 'falha';   // caiu um inimigo antes de limpar todos → impossível
      return 'pendente';
    },
  },
  abatePeloProprioLado: {   // fogo amigo: `quantos` inimigos caem pela mão de um aliado deles (matador e alvo no mesmo lado)
    modo: 'log', obrig: ['quantos'],
    aval: (st, c, ctx) => {
      const n = st.log.filter(e => e.tipo === 'queda' && e.matador && ctx.ladoDe(e.alvo) === 1 && ctx.ladoDe(e.matador) === 1).length;
      return n >= c.quantos ? 'ok' : 'pendente';   // nunca 'falha': até o fim pode acontecer; o gate de base-vitória barra o 'pendente'
    },
  },
  acumulo: {   // §146/§147: uma QUANTIDADE (fonte) tem de atingir um limiar. Nasce com as 9 fontes da varredura
    // dos 91 (§87). Modo log: nunca falha cedo (sempre pode acumular); o gate de base-vitória barra o 'pendente'.
    // "Modo saindo de onde se lê" — a quantidade vem da fonte certa. golpe-final-com-limiar (susanoo/yamato) é
    // OUTRO predicado, não acumulo (§46: mesma palavra, leituras diferentes).
    modo: 'log', obrig: ['fonte', 'limiar'],
    aval: (st, c, ctx) => acumuladoDe(st, c, ctx) >= c.limiar ? 'ok' : 'pendente',
    chave: (st, c, ctx) => { try { return String(acumuladoDe(st, c, ctx)); } catch { return ''; } },   // progresso p/ o dedup do solucionador
    distancia: (st, c, ctx) => { try { return Math.max(0, c.limiar - acumuladoDe(st, c, ctx)); } catch { return 0; } },   // quanto falta p/ o limiar (heurística do best-first)
  },

  maximoNumEvento: {   // §153/§156 (loki): PICO de roubo num ÚNICO evento (≠ acumulo, que soma tudo). "roubar ≥6 buffs de uma só vez."
    // A Trama do Caos (realoca) loga um evento por FONTE; loki casta 1× por turno e é o único ladrão-de-buff da sua Provação,
    // então o pico-por-ativação = pico-por-TURNO da soma das qtd de roubo-p/-si (ganhouLado 0). (Se um dia 2 ladrões agirem no
    // mesmo turno, trocar o agrupamento por-turno por um marcador de ativação.)
    modo: 'log', obrig: ['fonte', 'limiar'],
    aval: (st, c, ctx) => maxNumEvento(st, c, ctx) >= c.limiar ? 'ok' : 'pendente',
    chave: (st, c, ctx) => { try { return String(maxNumEvento(st, c, ctx)); } catch { return ''; } },
    distancia: (st, c, ctx) => { try { return Math.max(0, c.limiar - maxNumEvento(st, c, ctx)); } catch { return 0; } },
  },

  // ---- FINAL (só julgável no fim) ----
  hpNoFim: {   // no golpe final, o HP de `quem` (chave de unidade) satisfaz op v — só faz sentido no estado final
    modo: 'final', obrig: ['quem', 'op', 'v'],
    aval: (st, c, ctx) => {
      const u = st.lados.flatMap(l => l.units).find(x => x.key === c.quem);
      if (!u) return 'falha';
      return cmp(u.hp, c.op, c.v) ? 'ok' : 'falha';
    },
  },
};

// as 9 FONTES de acúmulo, da varredura dos 91 (§146/§147): nasce com todas registradas (§87). A implementação
// de `acumuladoDe` cobre as de-log baratas hoje; as demais lançam ao serem USADAS (ao construir a Provação),
// nunca silenciam. golpe-final-com-limiar (susanoo/yamato) NÃO está aqui — é outro predicado (§46).
const FONTES_ACUMULO = ['danoAbsorvido', 'danoRefletido', 'danoArmazenado', 'danoBonus', 'contador', 'buffsRoubados', 'orbesRoubados', 'orbesGuardados', 'curaAcumulada'];
function _somaLog(st, f) { let s = 0; for (const e of st.log) s += (f(e) || 0); return s; }

// §156 (loki): PICO por evento. Agrupa por TURNO os eventos de roubo-p/-si da fonte e devolve o MAIOR total num turno.
function maxNumEvento(st, c, ctx) {
  const porTurno = {};
  for (const e of st.log) {
    let q = 0;
    if (c.fonte === 'buffsRoubados') q = (e.tipo === 'efeito' && e.ganhouLado === 0) ? (e.qtd || 1) : 0;   // roubo-p/-si de buff (realoca/stripOne rouba)
    else if (c.fonte === 'orbesRoubados') q = (e.tipo === 'orbe' && e.ganhouLado === 0 && e.valor > 0) ? e.valor : 0;
    else throw new Error(`maximoNumEvento: fonte não suportada "${c.fonte}"`);
    if (q) porTurno[e.turno] = (porTurno[e.turno] || 0) + q;
  }
  let mx = 0; for (const t in porTurno) if (porTurno[t] > mx) mx = porTurno[t];
  return mx;
}
function acumuladoDe(st, c, ctx) {
  switch (c.fonte) {
    case 'danoRefletido': return _somaLog(st, e => e.tipo === 'dano' && e.kind === 'reflexo' && ctx.ladoDe(e.origem) === 0 ? e.valor : 0);
    case 'danoAbsorvido': return _somaLog(st, e => e.tipo === 'dano' && ctx.ladoDe(e.alvo) === 0 ? (e.absorvido || 0) : 0);
    case 'curaAcumulada': return _somaLog(st, e => e.tipo === 'cura' && ctx.ladoDe(e.alvo) === 0 ? e.valor : 0);
    case 'orbesGuardados': return Object.values(st.lados[0].orbs).reduce((a, b) => a + b, 0);
    case 'contador': { const u = st.lados[0].units.find(x => x.key === c.quem) || st.lados[0].units[0]; return (u && u.contadores[c.contador]) || 0; }
    // §153 (tag de roubo): ganhouLado===0 = o JOGADOR levou p/ si (≠ remoção pura, ganhouLado null; ≠ roubo inimigo, 1).
    // ROUBO-p/-si, cumulativo. buffsRoubados por-EVENTO (loki) é OUTRO predicado (maximoNumEvento), não esta soma.
    case 'orbesRoubados': return _somaLog(st, e => e.tipo === 'orbe' && e.ganhouLado === 0 && e.valor > 0 ? e.valor : 0);
    case 'buffsRoubados': return _somaLog(st, e => e.tipo === 'efeito' && e.ganhouLado === 0 ? (e.qtd || 1) : 0);
    default: throw new Error(`acumulo: fonte "${c.fonte}" registrada mas acumuladoDe() ainda não implementado — implementar ao construir a Provação que a usa`);
  }
}

// -------- carimbo de versão (pendente desde a F1.0a): hash do catálogo com que a Provação foi verificada --------
// CATÁLOGO da Provação = os 100 deuses ∪ o bestiário PvE (as criaturas são inimigos das Ordálias; os aliados
// são deuses). Dual, como o catalogoAtivo() do motor: no bundle (futuro da UI de Ordália) GODS/BESTIARIO são
// globais; em Node lê os módulos. É o catálogo que o jogo REALMENTE roda — o hash e o montar têm de vê-lo (§150:
// o carimbo garante contra o oponente que o jogo roda; um bestiário fora do hash deixaria criatura rebalanceada
// passar em silêncio).
function catalogoProvacao() {
  const gods = (typeof GODS !== 'undefined') ? GODS : require('./catalogo.js').GODS;
  const best = (typeof BESTIARIO !== 'undefined') ? BESTIARIO : require('./bestiario.js').BESTIARIO;
  return { ...gods, ...best };
}

function _djb2(s) { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0; return h.toString(16); }
function catalogoHash(prov, gods = catalogoProvacao()) {
  const keys = [...new Set([...(prov.aliados || []), ...(prov.inimigos || [])])].sort();
  return _djb2(keys.map(k => k + ':' + JSON.stringify(gods[k] || null)).join('|'));
}

// -------- validação de FORMA (chamada na BUILD; falha alto, não em runtime) --------
function validarProvacao(prov) {
  const erros = [];
  const nome = (prov && prov.key) || '(sem key)';
  if (!prov || typeof prov !== 'object') return [`${nome}: não é objeto`];
  if (!Array.isArray(prov.condicoes) || prov.condicoes.length === 0) erros.push(`${nome}: sem condicoes`);
  if (!Array.isArray(prov.aliados) || !Array.isArray(prov.inimigos)) erros.push(`${nome}: aliados/inimigos ausentes`);
  for (const c of (prov.condicoes || [])) {
    const def = PREDICADOS[c.predicado];
    if (!def) { erros.push(`${nome}: predicado DESCONHECIDO "${c.predicado}" (conjunto fechado: ${Object.keys(PREDICADOS).join(', ')})`); continue; }
    for (const campo of def.obrig) if (c[campo] === undefined) erros.push(`${nome}.${c.predicado}: falta o campo obrigatório "${campo}"`);
    if (c.predicado === 'acumulo' && c.fonte !== undefined && !FONTES_ACUMULO.includes(c.fonte)) erros.push(`${nome}.acumulo: fonte DESCONHECIDA "${c.fonte}" (fechado: ${FONTES_ACUMULO.join(', ')})`);
    if ('quando' in c) erros.push(`${nome}.${c.predicado}: "quando" é DERIVADO do modo (${MODOS[def.modo]}), não pode ser declarado`);
    if ('modo' in c) erros.push(`${nome}.${c.predicado}: "modo" é do predicado, não do kit — não declare`);
  }
  return erros;
}

// -------- montar o estado inicial (o "estado montado à mão") --------
function montarProvacao(prov) {
  const m = prov.montar || {};
  // catálogo MERGED (deuses ∪ bestiário): os inimigos de uma Ordália podem ser criaturas. novoEstado recebe o
  // catálogo (o motor não possui dados); passo energia=null p/ manter o default de geração.
  const st = novoEstado(prov.aliados, prov.inimigos, m.seed || 1, m.comeca || 0, null, catalogoProvacao());
  if (m.orbs) for (const l of [0, 1]) if (m.orbs[l]) for (const el in m.orbs[l]) st.lados[l].orbs[el] = m.orbs[l][el];
  if (m.semRenda) st.semRenda = m.semRenda;   // §158 (hermes): [lado0, lado1] booleanos — lado sem renda de orbe (orçamento fixo)
  if (m.rendaFracao) st.rendaFracao = m.rendaFracao;   // §158 (hermes rewrite): [lado0, lado1] frações — renda pela metade (0.5) etc.
  for (const u of (m.unidades || [])) {
    const un = st.lados[u.lado] && st.lados[u.lado].units[u.idx];
    if (!un) continue;
    // CHEFE = deus do roster + HP inflado: maxHp ANTES do hp (o hp não pode nascer acima do teto). "deus + 200-300"
    // é o mecanismo de chefe — não há kit de chefe separado; a Provação sobe o maxHp da unidade aqui (§ owner F2.3).
    if (u.maxHp != null) un.maxHp = u.maxHp;
    if (u.hp != null) un.hp = u.hp;
    if (u.shield != null) un.shield = u.shield;
    if (u.efeitos) un.efeitos.push(...u.efeitos);
    if (u.contadores) Object.assign(un.contadores, u.contadores);
    if (u.cd) Object.assign(un.cd, u.cd);
  }
  return st;
}

// -------- avaliar: {resultado:'andamento'|'vitoria'|'derrota', motivo?} --------
// Chamar a cada turno (falha cedo dos modos log/continuo) e no fim. `quando` é derivado: log/continuo falham
// cedo; final só é lido na base-vitória.
function avaliarProvacao(st, prov) {
  const lados = { 0: new Set(prov.aliados), 1: new Set(prov.inimigos) };
  const ctx = { ladoDe: chave => lados[0].has(chave) ? 0 : lados[1].has(chave) ? 1 : undefined };

  const baseVitoria = st.fim && st.fim.resultado === 'vitoria' && st.fim.lado === 0;
  const baseDerrota = st.fim && (st.fim.resultado === 'empate' || (st.fim.resultado === 'vitoria' && st.fim.lado === 1));
  if (baseDerrota) return { resultado: 'derrota', motivo: 'partida perdida (base)' };

  // falha CEDO: qualquer predicado de modo log/continuo em 'falha', a qualquer momento
  for (const c of prov.condicoes) {
    const def = PREDICADOS[c.predicado];
    if (def.modo !== 'final' && def.aval(st, c, ctx) === 'falha') return { resultado: 'derrota', motivo: c.predicado };
  }

  if (baseVitoria) {
    for (const c of prov.condicoes) {
      const def = PREDICADOS[c.predicado];
      const r = def.aval(st, c, ctx);
      if (r !== 'ok') return { resultado: 'derrota', motivo: `${c.predicado}:${r}` };   // 'pendente' ou 'falha' final
    }
    return { resultado: 'vitoria' };
  }
  return { resultado: 'andamento' };
}

if (typeof module !== 'undefined') {
  module.exports = { PREDICADOS, MODOS, FONTES_ACUMULO, validarProvacao, montarProvacao, avaliarProvacao, catalogoHash, catalogoProvacao };
}
