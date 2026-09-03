'use strict';
// FASE 6 / §229 — GERADOR DA ÁRVORE DE MISSÕES (91 não-iniciais).
// Deriva TUDO dos dados (data/deuses via o classificador §228, data/raridades) — nada de tema, nada de
// literal solto. Emite data/missoes.json: por deus, a família-assinatura + a HABILIDADE NOMEADA (o
// feito), o(s) prereq(s) da árvore, as vitórias/seguidas e o portão de faixa. Os ALVOS dos feitos
// nascem como estimativa por família e são SOBRESCRITOS por medição (tools/calibrar_missoes.js, §202).
//
// Regras de raridade (do dono): A camada 1 → 10 vit PvP com um dos 9 INICIAIS + o feito; A camada 2 →
// 15 vit com um deus da camada 1 + o feito; S → 15 + o feito · portão Iniciado; SS → 20 + 5 seguidas ·
// portão Oráculo. Os 8 laços à mão SOBRESCREVEM o prereq default. Odin exige 2+ Nórdicos no time.
//
// O prereq default só aponta p/ um deus de RANK ESTRITAMENTE MENOR (iniciais<A1<A2<S<SS) → o grafo é
// um DAG por construção; os laços à mão são verificados por varredura (sem ciclo, todos alcançáveis).

const fs = require('fs');
const path = require('path');
const FAM = require('../src/missoes_familias.js');

const RAR = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'raridades.json'), 'utf8'));
const GODS = FAM._carregarDeuses();
const CLS = FAM.classificarTodos();
const INICIAIS = ['zeus', 'ogum', 'tyr', 'sobek', 'brigid', 'ganesha', 'cuca', 'fujin', 'nezha'];

// famílias "de fundação" (o iniciante encontra cedo) → camada 1; as demais → camada 2.
const FUNDACAO = new Set(['dano', 'cura', 'dot', 'controle', 'area']);

// os 8 laços à mão (X → Y = "Y destrava X"; a passiva de X nomeia Y em 5 dos 7). Odin é especial.
const CADEIAS = {
  perseu: 'medusa', isis: 'osiris', mnevis: 'ra', raijin: 'fujin',
  inari: 'kitsune', change: 'houyi', hanuman: 'sunwukong',
};
const ODIN_NORDICOS = 2;

// vitórias/seguidas/portão por (raridade, camada) — os números do dono.
function exigencia(rar, camada) {
  if (rar === 'A') return camada === 1 ? { vitorias: 10, seguidas: 0, gate: null } : { vitorias: 15, seguidas: 0, gate: null };
  if (rar === 'S') return { vitorias: 15, seguidas: 0, gate: 'iniciado' };
  return { vitorias: 20, seguidas: 5, gate: 'oraculo' };   // SS
}

// alvo-estimativa por família (SOBRESCRITO pela calibração). Semente honesta, marcada.
const ALVO_ESTIMADO = {
  curaFeita: 600, danoDireto: 800, danoArea: 500, danoDot: 400, danoRefletido: 300,
  danoAbsorvido: 400, contadoresGanhos: 20, controlesAplicados: 12, orbesRoubados: 15,
  execucoes: 6, revives: 4, revivesNegados: 4, interceptacoes: 8, turnosCampo: 10, buffsRemovidos: 10,
};

function rankDe(key, camadaA) {
  if (INICIAIS.includes(key)) return 0;
  const r = RAR[key];
  if (r === 'A') return camadaA[key] === 1 ? 1 : 2;
  if (r === 'S') return 3;
  return 4;   // SS
}

function gerar() {
  const naoIniciais = Object.keys(GODS).filter(k => !INICIAIS.includes(k)).sort();

  // 1) camada de cada A (fundação → 1, senão 2)
  const camadaA = {};
  for (const k of naoIniciais) if (RAR[k] === 'A') camadaA[k] = FUNDACAO.has(CLS[k].familia) ? 1 : 2;

  // 2) listas por rank, p/ o round-robin de prereq default
  const porRank = { 0: INICIAIS.slice().sort(), 1: [], 2: [], 3: [], 4: [] };
  for (const k of naoIniciais) porRank[rankDe(k, camadaA)].push(k);
  for (const r of [1, 2, 3, 4]) porRank[r].sort();

  // 3a) arestas de CADEIA (parceiro -> alvo) e o fecho transitivo "quem depende de k por cadeia".
  //     Um default-prereq de k NUNCA pode ser alguém que já depende de k (senão fecha ciclo).
  const cadeiaEdges = {};   // parceiro -> [alvos]
  for (const alvo in CADEIAS) (cadeiaEdges[CADEIAS[alvo]] = cadeiaEdges[CADEIAS[alvo]] || []).push(alvo);
  function dependeDe(k) {   // BFS: todos os que k destrava por cadeia (transitivo)
    const vis = new Set(), fila = [k];
    while (fila.length) { const n = fila.shift(); for (const a of (cadeiaEdges[n] || [])) if (!vis.has(a)) { vis.add(a); fila.push(a); } }
    return vis;
  }

  // 3b) prereq default: um deus de rank estritamente menor, com AFINIDADE de facção quando houver,
  //    senão round-robin determinístico. Exclui quem já depende de k por cadeia (garante DAG mesmo
  //    com os laços à mão cruzando ranks).
  const rrIdx = {};
  function prereqDefault(k) {
    const rank = rankDe(k, camadaA);
    const proibidos = dependeDe(k);
    // procura o maior rank menor que tenha candidato válido
    let base = null, cand = null;
    for (let r = rank - 1; r >= 0; r--) { const c = porRank[r].filter(x => !proibidos.has(x)); if (c.length) { base = r; cand = c; break; } }
    const fac = GODS[k].faccao;
    const mesmaFac = cand.filter(x => GODS[x].faccao === fac);
    const pool = mesmaFac.length ? mesmaFac : cand;
    const key = base + '|' + (mesmaFac.length ? fac : '*');
    const i = (rrIdx[key] = (rrIdx[key] == null ? 0 : rrIdx[key] + 1)) % pool.length;
    return pool[i];
  }

  // 4) montar as missões
  const missoes = {};
  for (const k of naoIniciais) {
    const rar = RAR[k];
    const camada = rar === 'A' ? camadaA[k] : null;
    const ex = exigencia(rar, camada);
    const sig = CLS[k];
    let prereq, chain = false, especial = null;
    if (k === 'odin') { prereq = []; especial = { nordicos: ODIN_NORDICOS }; chain = true; }
    else if (CADEIAS[k]) { prereq = [CADEIAS[k]]; chain = true; }
    else prereq = [prereqDefault(k)];

    missoes[k] = {
      key: k, nome: GODS[k].nome, raridade: rar, camada,
      familia: sig.familia,
      prereq, chain, especial,
      vitorias: ex.vitorias, seguidas: ex.seguidas, gate: ex.gate,
      feito: { metrica: sig.metrica, habilidade: sig.habilidade, slot: sig.slot, alvo: ALVO_ESTIMADO[sig.metrica] || 100, calibrado: false },
    };
  }

  const doc = {
    versao: 1,
    nota: 'Gerado por tools/gerar_missoes.js a partir de data/deuses + data/raridades. Alvos dos feitos calibrados por tools/calibrar_missoes.js. Portões lidos de data/ranqueado.json por CHAVE.',
    gate: { S: 'iniciado', SS: 'oraculo' },   // faixa-CHAVE (robusto a reordenar as faixas); §226
    iniciais: INICIAIS.slice(),
    missoes,
  };
  return doc;
}

// -------- VALIDAÇÃO POR VARREDURA (§202): sem ciclo + todos alcançáveis a partir dos 9 iniciais --------
function validar(doc) {
  const erros = [];
  const missoes = doc.missoes;
  const keys = Object.keys(missoes);
  if (keys.length !== 91) erros.push(`esperado 91 missões, achei ${keys.length}`);

  // arestas prereq -> alvo (Y destrava X). Iniciais são raízes.
  const filhos = {};   // prereq -> [alvos]
  const donos = new Set(doc.iniciais);
  for (const k of keys) donos.add(k);
  for (const k of keys) {
    const m = missoes[k];
    for (const p of (m.prereq || [])) {
      if (!donos.has(p)) erros.push(`${k}: prereq desconhecido "${p}"`);
      (filhos[p] = filhos[p] || []).push(k);
    }
    // Odin: prereq por facção — os 2+ Nórdicos precisam EXISTIR e ser alcançáveis; ligamos Odin a um
    // Nórdico-raiz (o inicial Tyr) para a alcançabilidade do grafo, sem inventar dado.
    if (m.especial && m.especial.nordicos) (filhos['tyr'] = filhos['tyr'] || []).push(k);
  }

  // (a) SEM CICLO — DFS com pilha de cor. Se um alvo volta a um ancestral, é ciclo.
  const cor = {};   // 0 branco, 1 cinza, 2 preto
  const stack = [];
  let cicloMsg = null;
  function dfs(n) {
    cor[n] = 1; stack.push(n);
    for (const f of (filhos[n] || [])) {
      if (cor[f] === 1) { cicloMsg = `CICLO: ${stack.slice(stack.indexOf(f)).join(' -> ')} -> ${f}`; return true; }
      if (!cor[f] && dfs(f)) return true;
    }
    cor[n] = 2; stack.pop(); return false;
  }
  for (const r of doc.iniciais) if (!cor[r] && dfs(r)) break;
  // varre também alvos não tocados (caso um subgrafo desconexo tenha ciclo interno)
  for (const k of keys) if (!cor[k] && dfs(k)) break;
  if (cicloMsg) erros.push(cicloMsg);

  // (b) TODOS ALCANÇÁVEIS a partir dos 9 iniciais (BFS pelas arestas prereq->alvo)
  const visto = new Set(doc.iniciais);
  const fila = [...doc.iniciais];
  while (fila.length) { const n = fila.shift(); for (const f of (filhos[n] || [])) if (!visto.has(f)) { visto.add(f); fila.push(f); } }
  const inalcancaveis = keys.filter(k => !visto.has(k));
  if (inalcancaveis.length) erros.push(`INALCANÇÁVEIS a partir dos 9 iniciais (${inalcancaveis.length}): ${inalcancaveis.join(' ')}`);

  // (c) cada missão nomeia UMA habilidade (o feito) e conta 91
  for (const k of keys) if (!missoes[k].feito || !missoes[k].feito.habilidade) erros.push(`${k}: feito sem habilidade nomeada`);

  return { ok: erros.length === 0, erros, alcancados: visto.size - doc.iniciais.length };
}

module.exports = { gerar, validar };

if (require.main === module) {
  const doc = gerar();
  const v = validar(doc);
  if (!v.ok) { console.error('VALIDAÇÃO FALHOU:'); for (const e of v.erros) console.error('  - ' + e); process.exit(1); }
  const out = path.join(__dirname, '..', 'data', 'missoes.json');
  fs.writeFileSync(out, JSON.stringify(doc, null, 1) + '\n');
  const porCam = { A1: 0, A2: 0, S: 0, SS: 0 };
  for (const k in doc.missoes) { const m = doc.missoes[k]; porCam[m.raridade === 'A' ? 'A' + m.camada : m.raridade]++; }
  console.log('OK — 91 missões, sem ciclo, todos alcançáveis. Camadas:', JSON.stringify(porCam));
  console.log('Cadeias:', Object.entries({ ...CADEIAS, odin: '2+ Nórdicos' }).map(([a, b]) => a + '→' + b).join(' · '));
  console.log('Escrito:', out);
}
