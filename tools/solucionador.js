// ===================================================================
// INCURSION x3 Battle — o SOLUCIONADOR (F2.1)
// Prova que uma Provação é VENCÍVEL: busca determinística sobre as ações
// do jogador (lado 0) a partir do estado montado, com o oponente = a IA
// gulosa (§ determinística, agora não-cega a `distribui`, §147).
//
// Motor puro + determinístico → solubilidade é DEMONSTRÁVEL, não opinião.
// BFS por nº de movimentos → a primeira vitória é a sequência MAIS CURTA.
// TRÊS vereditos, com INDETERMINADO existindo de verdade:
//   VENCIVEL      — achou a sequência (a mais curta)
//   INVENCIVEL    — espaço de estados esgotado sem vitória (+ razão se der)
//   INDETERMINADO — estourou o orçamento de nós antes de esgotar
//
// Poda: alvos equivalentes e ação-sem-efeito e estados repetidos caem no
// MESMO `chave` (dedup) — a chave inclui o progresso das condições, então
// o dedup é SÃO para predicados cumulativos (não descarta caminho melhor).
//
//   node tools/solucionador.js [deus] [orçamentoNos]   (padrão: todos; 300000)
// ===================================================================

const path = require('path');
const E = require(path.join(__dirname, '..', 'src', 'engine.js'));
Object.assign(global, E);                        // agir/acoesDe/podeAgir/alvosValidos como globais p/ ia.js
const ia = require(path.join(__dirname, '..', 'src', 'ia.js'));
const PROV = require(path.join(__dirname, '..', 'src', 'provacao.js'));

const NIVEL_PADRAO = 'normal';                    // §150: a Provação pina no 'normal' (a gulosa); IDENTIDADE — verificar contra o MESMO oponente que o jogo roda

// clone barato: o log CRESCE, então não o serializo — cada nó recebe uma cópia RASA do array (os eventos são
// imutáveis: o motor só empilha objetos novos, nunca muta os antigos), como a ia.js faz com o clone da IA.
function clonar(st) { const log = st.log; st.log = []; const c = JSON.parse(JSON.stringify(st)); st.log = log; c.log = log.slice(); return c; }
function ctxDe(prov) { const A = new Set(prov.aliados), I = new Set(prov.inimigos); return { ladoDe: k => A.has(k) ? 0 : I.has(k) ? 1 : undefined }; }

// chave de estado p/ o dedup: tabuleiro + turno + quem-age + PROGRESSO das condições (dedup são p/ cumulativos).
// PODA de alvos equivalentes: os descritores de unidade são ORDENADOS por lado → duas unidades idênticas (mesmo
// kit, mesmo estado) colapsam, e mirar uma ou a outra vira o mesmo nó.
function chave(st, prov, ctx) {
  const desc = l => l.units.map(x =>
    `${x.key}:${x.vivo ? x.hp : 'x'}:${x.shield || 0}:${(x.efeitos || []).map(e => e.type).sort().join('.')}:${JSON.stringify(x.contadores || {})}`).sort().join(',');
  const orbs = st.lados.map(l => Object.entries(l.orbs).sort().map(([k, v]) => k + v).join('')).join('/');
  const prog = prov.condicoes.map(c => { const d = PROV.PREDICADOS[c.predicado]; return d.chave ? d.chave(st, c, ctx) : ''; }).join(';');
  return `${st.turno}|${st.ativo}|${desc(st.lados[0])}#${desc(st.lados[1])}|${orbs}|${prog}`;
}

// conjuntos de alvo do JOGADOR — mais amplos que a IA gulosa (o solucionador EXPLORA): cada inimigo, os pares,
// focar/dividir no distribui. É a fonte da ramificação; a medição diz se precisa podar mais (§ traga o número).
function alvoSets(a, ini, ali) {
  const pares = arr => { const r = []; for (let i = 0; i < arr.length; i++) for (let j = i + 1; j < arr.length; j++) r.push([arr[i].uid, arr[j].uid]); return r; };
  switch (a.alvo) {
    case 'inimigo': return ini.map(e => [e.uid]);
    case 'aliado': return ali.map(x => [x.uid]);
    case '2inimigos': return pares(ini).length ? pares(ini) : (ini.length ? [[ini[0].uid]] : [[]]);
    case '2aliados': return pares(ali).length ? pares(ali) : (ali.length ? [[ali[0].uid]] : [[]]);
    case 'aliado+inimigo': { const r = []; for (const x of ali) for (const e of ini) r.push([x.uid, e.uid]); return r.length ? r : [[]]; }
    case 'distribui': return ini.length ? [...ini.map(e => [e.uid]), ini.map(e => e.uid)] : [[]];   // focar em cada · dividir entre todos
    default: return [[]];   // nenhum, todosInimigos, auto
  }
}

function movimentos(st) {
  const out = [];
  for (const u of st.lados[0].units) {
    if (!E.podeAgir(u)) continue;
    for (const a of E.acoesDe(st, u)) {
      if (!a.disponivel || a.slot === 'defesa') continue;
      const ini = E.alvosValidos(st, u, a).filter(x => x.lado !== u.lado), ali = st.lados[0].units.filter(x => x.vivo);
      for (const alvos of alvoSets(a, ini, ali)) {
        if (a.opcoes) for (let i = 0; i < a.opcoes.length; i++) out.push({ uid: u.uid, slot: a.slot, alvos, escolhas: [i] });
        else if (a.alterna) for (let m = 0; m < (a.modos ? a.modos.length : 2); m++) out.push({ uid: u.uid, slot: a.slot, alvos, escolhas: null, modo: m });
        else out.push({ uid: u.uid, slot: a.slot, alvos, escolhas: null });
      }
    }
  }
  return out;
}

function avancarOponente(st, nivel) {   // roda o turno da IA (determinística, nível da Provação) até voltar ao jogador
  let guard = 0;
  while (!st.fim && st.ativo === 1 && guard++ < 60) {
    let a, p = 0;
    while (!st.fim && (a = ia.iaProximaAcao(st, nivel)) && p++ < 8) E.agir(st, a.uid, a.slot, a.alvos, a.escolhas);
    if (st.fim) break;
    E.fimTurno(st);
  }
}

function rotulo(st, mv) {
  const u = st.lados.flatMap(l => l.units).find(x => x.uid === mv.uid);
  const g = u && (PROV.catalogoProvacao()[u.key] || {}); const ab = g && g.ab && g.ab.find(x => x.slot === mv.slot);   // catálogo MERGED: o alvo pode ser uma criatura do bestiário, não só deus
  const nome = (ab && ab.nome) || mv.slot;
  const alvos = (mv.alvos || []).map(id => { const t = st.lados.flatMap(l => l.units).find(x => x.uid === id); return (t && t.key) || id; }).join('+');
  return `${u ? u.key : '?'} ${nome}${alvos ? ' → ' + alvos : ''}${mv.modo != null ? ` [modo ${mv.modo}]` : ''}`;
}

// min-heap por h (menor = mais perto da vitória); desempate por caminho mais curto
function MinHeap() { this.a = []; }
MinHeap.prototype.size = function () { return this.a.length; };
MinHeap.prototype.push = function (x) { const a = this.a; a.push(x); let i = a.length - 1; while (i > 0) { const p = (i - 1) >> 1; if (a[p].h <= a[i].h) break; [a[p], a[i]] = [a[i], a[p]]; i = p; } };
MinHeap.prototype.pop = function () { const a = this.a, top = a[0], last = a.pop(); if (a.length) { a[0] = last; let i = 0; for (;;) { let s = i, l = 2 * i + 1, r = l + 1; if (l < a.length && a[l].h < a[s].h) s = l; if (r < a.length && a[r].h < a[s].h) s = r; if (s === i) break; [a[s], a[i]] = [a[i], a[s]]; i = s; } } return top; };

// heurística MAIS SIMPLES que funciona (pedido do dono): HP inimigo somado + o que falta em cada condição.
function heuristica(st, prov, ctx) {
  let h = st.lados[1].units.filter(u => u.vivo).reduce((a, u) => a + u.hp, 0);
  for (const c of prov.condicoes) { const d = PROV.PREDICADOS[c.predicado]; h += d.distancia ? d.distancia(st, c, ctx) : 0; }
  return h;
}

// C (§): o solucionador prova JOGABILIDADE, não solubilidade — "existe um caminho de vitória contra o oponente
// declarado", não "o melhor". Best-first acha um caminho rápido; INVENCÍVEL SÓ quando a fronteira esvazia
// (exaustão real), NUNCA por orçamento (o pior erro: descartaria uma Provação boa). Orçamento → INDETERMINADO
// ACIONÁVEL: distingue "orçamento" (heurística progredindo) de "dica" (heurística estagnou).
function resolver(prov, opts = {}) {
  const orcamento = opts.orcamentoNos || 200000;
  const NIVEL_IA = prov.nivelIA || NIVEL_PADRAO;   // IDENTIDADE: verifica contra o oponente que a Provação declara
  const ctx = ctxDe(prov);
  const t0 = Date.now();
  const raiz = PROV.montarProvacao(prov); avancarOponente(raiz, NIVEL_IA);
  let nos = 0, maxHeap = 0, maxRam = 0, melhorH = Infinity, noDoMelhorH = 0;
  const visto = new Set([chave(raiz, prov, ctx)]);
  const heap = new MinHeap();
  heap.push({ st: raiz, path: [], h: heuristica(raiz, prov, ctx) });
  while (heap.size()) {
    maxHeap = Math.max(maxHeap, heap.size());
    if (nos >= orcamento) {   // ORÇAMENTO nunca vira veredito negativo — é INDETERMINADO, e acionável
      const estagnou = (nos - noDoMelhorH) > Math.min(orcamento * 0.4, 20000);
      return {
        veredito: 'INDETERMINADO', nos, maxHeap, maxRam, ms: Date.now() - t0, nivelIA: NIVEL_IA, melhorH,
        acionavel: estagnou ? 'dica' : 'orcamento',
        motivo: estagnou
          ? `heurística ESTAGNOU (melhorH parou em ${melhorH} há ${nos - noDoMelhorH} nós) — a Provação é candidata a DICA de sequência`
          : `ORÇAMENTO esgotado (${orcamento} nós; heurística ainda progredindo, melhorH=${melhorH}) — aumentar o orçamento`,
      };
    }
    const no = heap.pop(); nos++;
    if (no.h < melhorH) { melhorH = no.h; noDoMelhorH = nos; }
    const { st, path } = no;
    const r = PROV.avaliarProvacao(st, prov);
    if (r.resultado === 'vitoria') return { veredito: 'VENCIVEL', sequencia: path, comprimento: path.length, nos, maxHeap, maxRam, ms: Date.now() - t0, nivelIA: NIVEL_IA };
    if (r.resultado === 'derrota') continue;
    const movs = movimentos(st); maxRam = Math.max(maxRam, movs.length + 1);
    for (const mv of movs) {
      const cl = clonar(st); const res = E.agir(cl, mv.uid, mv.slot, mv.alvos, mv.escolhas, mv.modo);
      if (!res || !res.ok) continue;
      const k = chave(cl, prov, ctx); if (visto.has(k)) continue; visto.add(k);
      heap.push({ st: cl, path: [...path, rotulo(st, mv)], h: heuristica(cl, prov, ctx) });
    }
    { const cl = clonar(st); E.fimTurno(cl); avancarOponente(cl, NIVEL_IA);   // "passar": encerra o turno e roda o oponente
      const k = chave(cl, prov, ctx); if (!visto.has(k)) { visto.add(k); heap.push({ st: cl, path: [...path, 'passar'], h: heuristica(cl, prov, ctx) }); } }
  }
  // fronteira ESGOTADA (exaustão real) sem caminho → INVENCÍVEL. Só aqui, nunca por orçamento.
  return { veredito: 'INVENCIVEL', motivo: 'espaço de estados ESGOTADO sem caminho de vitória (exaustão real)', nos, maxHeap, maxRam, ms: Date.now() - t0, nivelIA: NIVEL_IA };
}

module.exports = { resolver, NIVEL_PADRAO };

// ---------- CLI ----------
//   node tools/solucionador.js [deus] [orçamento]              — resolve e imprime
//   node tools/solucionador.js --carimbar [deus] [orçamento]   — resolve e GRAVA o carimbo de versão no arquivo
if (require.main === module) {
  const fs = require('fs');
  const args = process.argv.slice(2);
  const carimbar = args.includes('--carimbar');
  const rest = args.filter(a => a !== '--carimbar');
  const alvo = rest[0]; const orc = parseInt(rest[1], 10) || 200000;
  const dir = path.join(__dirname, '..', 'data', 'provacoes');
  const arquivos = fs.readdirSync(dir).filter(f => f.endsWith('.json') && (!alvo || f === alvo + '.json'));
  for (const f of arquivos) {
    const prov = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    const r = resolver(prov, { orcamentoNos: orc });
    console.log(`\n=== ${prov.key} (${prov.titulo || ''}) — ${r.veredito} ===`);
    console.log(`  nós ${r.nos} · heap máx ${r.maxHeap} · ramificação máx ${r.maxRam} · ${r.ms}ms · IA ${r.nivelIA}`);
    if (r.veredito === 'VENCIVEL') { console.log(`  caminho (${r.comprimento} lances até vencer — NÃO o mínimo):`); r.sequencia.forEach((m, i) => console.log(`    ${i + 1}. ${m}`)); }
    else console.log(`  motivo: ${r.motivo}`);
    if (carimbar) {
      // carimbo de versão (§148): hash do catálogo + O QUE foi verificado (veredito, nível de IA, caminho)
      prov.verificacao = {
        hash: PROV.catalogoHash(prov), nivelIA: r.nivelIA, veredito: r.veredito,   // hash do catálogo MERGED (deuses∪bestiário) — o que o jogo roda
        lancesNesteCaminho: r.comprimento != null ? r.comprimento : null,   // NÃO o mínimo (§): teto solto
        nos: r.nos, ms: r.ms, caminho: r.sequencia || null,
      };
      fs.writeFileSync(path.join(dir, f), JSON.stringify(prov, null, 2) + '\n');
      console.log('  → carimbado.');
    }
  }
}
