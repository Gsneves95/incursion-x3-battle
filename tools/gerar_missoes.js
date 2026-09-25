'use strict';
// FASE 6 / §230-§231 + §313 — GERADOR DA ÁRVORE DE PROVAÇÕES a partir dos REQUISITOS DO DONO.
// As 91 Provações NÃO se derivam da mecânica (§230): o vínculo é TEMÁTICO (o Cérbero é o cão do Hades),
// escrito à mão pelo dono em `data/missoes_requisitos.json` — panteão exigido + companheiro + motivo + a
// LISTA DE OBJETIVOS (§313). O gerador casa isso com a raridade (volume legado), a profundidade (faixa) e
// a rampa de sequência, emite `data/missoes.json`, e valida por VARREDURA contra os DADOS (§202) + as
// 7 babás do §313.
//
// §313 — cada Provação é uma LISTA DE OBJETIVOS (A 2 · S 3 · SS 4). Tipos (contam só em PvP):
//   ["s",X]     K seguidas com X          ["v",[..]]  N vitórias com ≥1 da lista ("ou")
//   ["j",[a,b]] N vitórias com a e b       ["c",[a,b]] K seguidas com a E K seguidas com b (separadas)
//   ["p"]       N vitórias com o panteão   ["sp"]      K seguidas com o panteão
//   ["a",N]     amplitude: cada vitória soma ≤1 panteão novo; cumpre em N panteões distintos
// NÚMEROS (regra fixa aqui): K = a sequência da faixa (rampa 2/3/4); "v" 1º da Provação A8/S8/SS14, 2º
//   S5/SS8; "j" S5/SS8; "p" A8/S6/SS12; "c"/"sp" usam K; "a" carrega seu N.
// §312 (precedência + diferenciação por posição) ficou OBSOLETO e foi REMOVIDO junto com suas babás.

const fs = require('fs');
const path = require('path');
const FAM = require('../src/missoes_familias.js');

const REQDOC = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'missoes_requisitos.json'), 'utf8'));
const REQ = Array.isArray(REQDOC) ? REQDOC : REQDOC.missoes;
const OBJ = (REQDOC && REQDOC.objetivos) || {};            // §313: a lista de objetivos por deus (do dono)
const RAR = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'raridades.json'), 'utf8'));
const RANQ = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'ranqueado.json'), 'utf8'));
const GODS = FAM._carregarDeuses();
const CLS = FAM.classificarTodos();
const INICIAIS = ['zeus', 'ogum', 'tyr', 'sobek', 'brigid', 'ganesha', 'cuca', 'fujin', 'nezha'];

// §241 — AS TRÊS ALAVANCAS JUNTAS: ranque REVELA · cadeia ORDENA · sequência PROVA HABILIDADE.
const FAIXAS = RANQ.faixas;                                   // 8, em ordem Suplicante -> Semideus
const DISTRIB = [18, 15, 13, 12, 11, 9, 7, 6];               // por faixa, mais generosa embaixo (soma 91)
const SEGUIDAS_POR_TIER = [2, 2, 3, 3, 3, 3, 4, 4];          // K por índice de faixa (rampa 2/3/4, teto 4)

// §313 — os NÚMEROS dos objetivos (regra fixa). K vem da faixa (SEGUIDAS_POR_TIER); N das tabelas:
const N_V1 = { A: 8, S: 8, SS: 14 };   // 1º "v" da Provação
const N_V2 = { A: 5, S: 5, SS: 8 };    // 2º "v" em diante (A é fallback; A nunca tem 2 "v")
const N_J = { A: 5, S: 5, SS: 8 };    // "j" (o dono deu S5/SS8; A é fallback, A não tem "j")
const N_P = { A: 8, S: 6, SS: 12 };   // "p"
const OBJS_POR_RAR = { A: 2, S: 3, SS: 4 };   // §313 babá 1

const REQmap = {}; for (const r of REQ) REQmap[r.deus] = r;
function ehMissao(k) { return !!REQmap[k]; }
function panteaoDe(godKey) { const f = GODS[godKey].faccao; return f === 'Olímpica' ? 'Grega' : f; }   // membresia real
function panteaoExigido(k) { return REQmap[k] ? REQmap[k].panteao : panteaoDe(k); }                    // alvo do "p"/"sp"

// os DEUSES NOMEADOS por um objetivo (s/v/j/c) — a base das dependências e das babás.
function nomeadosDoObj(o) { const t = o[0]; if (t === 's') return [o[1]]; if (t === 'v' || t === 'j' || t === 'c') return o[1].slice(); return []; }
function nomeadosDe(k) { const s = []; for (const o of (OBJ[k] || [])) s.push(...nomeadosDoObj(o)); return s; }

// PROFUNDIDADE da cadeia de COMPANHEIRO (§241): 1 = raiz; N = N-1 deuses de missão antes dele. É o que
// ORDENA a árvore para a FAIXA — inalterado no §313 (a atribuição de faixa segue pela cadeia temática do
// companheiro, e a babá 4 confirma que TODO nome dos objetivos cai em faixa <= a do alvo).
function profundidades() {
  const memo = {};
  const dep = (k, vendo) => {
    if (memo[k] != null) return memo[k];
    const c = REQmap[k] && REQmap[k].companheiro;
    if (!c || INICIAIS.includes(c)) return (memo[k] = 1);
    if (vendo.has(k)) return 1;                              // guarda de ciclo (o ciclo real é pego na validação)
    vendo.add(k);
    return (memo[k] = dep(c, vendo) + 1);
  };
  const out = {};
  for (const r of REQ) out[r.deus] = dep(r.deus, new Set());
  return out;
}

// §313 — PROFUNDIDADE DA CADEIA DE OBJETIVOS (medição, NÃO dirige a faixa): 1 = sem dependência nomeada;
// N = 1 + a mais funda entre TODOS os deuses nomeados (s/v/j/c). É a "profundidade real" da caçada.
function profundidadesObjetivos() {
  const memo = {};
  const dep = (k, vendo) => {
    if (memo[k] != null) return memo[k];
    if (vendo.has(k)) return 1;                              // guarda de ciclo (o ciclo é pego na validação)
    vendo.add(k);
    let mx = 0, algum = false;
    for (const g of nomeadosDe(k)) { if (INICIAIS.includes(g) || !ehMissao(g)) continue; algum = true; mx = Math.max(mx, dep(g, new Set(vendo))); }
    return (memo[k] = algum ? mx + 1 : 1);
  };
  const out = {};
  for (const r of REQ) out[r.deus] = dep(r.deus, new Set());
  return out;
}

// ATRIBUIÇÃO DE FAIXA por PROFUNDIDADE (cadeia de companheiro): ordena por (profundidade, raridade, nome)
// e fatia nos baldes da DISTRIB. Como profundidade(companheiro) < profundidade(deus), o companheiro cai
// numa faixa <= a do deus. (§313 babá 4 estende isso a TODO nome dos objetivos.)
function atribuirFaixas(depth) {
  const rarRank = { A: 0, S: 1, SS: 2 };
  const ordem = REQ.map(r => r.deus).sort((a, b) =>
    (depth[a] - depth[b]) || ((rarRank[RAR[a]] || 0) - (rarRank[RAR[b]] || 0)) || a.localeCompare(b));
  const faixaIdx = {};
  let i = 0;
  for (let fi = 0; fi < FAIXAS.length; fi++) for (let n = 0; n < DISTRIB[fi]; n++) faixaIdx[ordem[i++]] = fi;
  return faixaIdx;
}

// VOLUME por raridade (legado §230/§242): o servidor (§314 ainda por vir) usa vitoriasPanteao/seguidas.
// Fica no volume BASE — o §312 (base + posição) foi removido. Mantido para compatibilidade do servidor
// enquanto a Parte 2 (que lê `objetivos`) não entra.
const VOL_BASE = { A: 15, S: 20, SS: 40 };
const FATOR_VOLUME = 0.55;
const PISO_VOLUME = 4;
function volume(rar) {
  const base = (VOL_BASE[rar] != null) ? VOL_BASE[rar] : VOL_BASE.A;
  const panteao = Math.max(PISO_VOLUME, Math.round(base * FATOR_VOLUME));
  const seguidas = rar === 'SS' ? 5 : (rar === 'S' ? 3 : 0);
  return { panteao, seguidas, base };
}

// §313 — MONTA a lista de objetivos RESOLVIDA (com K/N) de uma Provação, a partir do dado do dono + a faixa.
function construirObjetivos(k, fi, rar) {
  const raw = OBJ[k] || [];
  const K = SEGUIDAS_POR_TIER[fi];
  const P = panteaoExigido(k);
  let vCount = 0;
  return raw.map(o => {
    const t = o[0];
    if (t === 's') return { tipo: 's', alvo: o[1], k: K };
    if (t === 'sp') return { tipo: 'sp', panteao: P, k: K };
    if (t === 'c') return { tipo: 'c', lista: o[1].slice(), k: K };
    if (t === 'p') return { tipo: 'p', panteao: P, n: N_P[rar] };
    if (t === 'a') return { tipo: 'a', n: o[1] };
    if (t === 'j') return { tipo: 'j', lista: o[1].slice(), n: N_J[rar] };
    if (t === 'v') { vCount++; const n = (vCount === 1 ? N_V1[rar] : N_V2[rar]); return { tipo: 'v', lista: o[1].slice(), n }; }
    throw new Error(`§313 tipo de objetivo desconhecido "${t}" em ${k}`);
  });
}

// assinatura NORMALIZADA de uma lista de objetivos (babá 7): tipo + nomes ordenados + panteão/N.
function assinaturaObjetivos(objs) {
  return objs.map(o => {
    if (o.tipo === 's') return ['s', o.alvo, o.k];
    if (o.tipo === 'sp') return ['sp', o.panteao, o.k];
    if (o.tipo === 'c') return ['c', o.lista.slice().sort(), o.k];
    if (o.tipo === 'p') return ['p', o.panteao, o.n];
    if (o.tipo === 'a') return ['a', o.n];
    if (o.tipo === 'j') return ['j', o.lista.slice().sort(), o.n];
    if (o.tipo === 'v') return ['v', o.lista.slice().sort(), o.n];
    return [o.tipo];
  }).map(x => JSON.stringify(x)).sort().join('|');
}

function gerar() {
  const depth = profundidades();
  const depthObj = profundidadesObjetivos();
  const faixaIdx = atribuirFaixas(depth);
  const missoes = {};
  for (const r of REQ) {
    const k = r.deus;
    const rar = RAR[k];
    const vol = volume(rar);
    const fi = faixaIdx[k];
    const seguidas = SEGUIDAS_POR_TIER[fi];
    const alvo = r.companheiro ? { tipo: 'companheiro', chave: r.companheiro } : { tipo: 'panteao', chave: r.panteao };
    missoes[k] = {
      deus: k, nome: GODS[k].nome, raridade: rar,
      panteao: r.panteao,            // EXIGIDO (do dono; pode ser cruzado)
      companheiro: r.companheiro || null,
      motivo: r.motivo,
      // §241 — o PORTÃO DE RANQUE: a Provação só REVELA/destrava a partir desta faixa.
      faixa: FAIXAS[fi].chave, faixaNome: FAIXAS[fi].nome, faixaIndice: fi, faixaMin: FAIXAS[fi].min,
      profundidade: depth[k],        // §241: profundidade da cadeia de companheiro (dirige a faixa)
      profundidadeObjetivos: depthObj[k],   // §313: profundidade da cadeia de objetivos (medição)
      // legado (§230/§242) — o servidor atual ainda usa; a Parte 2 (§314) migra para `objetivos`.
      vitoriasPanteao: vol.panteao,
      seguidas, seguidasAlvo: alvo,
      seguidasCompanheiro: r.companheiro ? seguidas : 0,
      // §313 — a LISTA DE OBJETIVOS resolvida (com K/N), o dado que a Parte 2 (servidor + tela) consome.
      objetivos: construirObjetivos(k, fi, rar),
      // informativo (maestria/futuro, §230).
      familia: CLS[k].familia, feito: { metrica: CLS[k].metrica, habilidade: CLS[k].habilidade, slot: CLS[k].slot },
    };
  }
  const panteaoMap = {};
  for (const k of Object.keys(GODS)) panteaoMap[k] = panteaoDe(k);
  const porFaixa = FAIXAS.map((f, fi) => ({ chave: f.chave, nome: f.nome, min: f.min,
    quantas: Object.values(missoes).filter(m => m.faixaIndice === fi).length }));
  return {
    versao: 5,
    _nota: 'Gerado por tools/gerar_missoes.js (§241 três travas · §242 volume · §313 objetivos): cada Provação é uma LISTA DE OBJETIVOS (A 2 · S 3 · SS 4) que conta só em PvP. Tipos s/v/j/c/p/sp/a; números fixos no gerador (K pela faixa; v 1º A8/S8/SS14 2º S5/SS8; j S5/SS8; p A8/S6/SS12; c/sp usam K; a carrega N). Campos legados (vitoriasPanteao/seguidas) mantidos p/ o servidor atual até a Parte 2 (§314) migrar. Vínculo temático (companheiro/motivo/objetivos) do dono.',
    volumeFator: FATOR_VOLUME, volumePiso: PISO_VOLUME,
    volumes: { A: volume('A'), S: volume('S'), SS: volume('SS') },
    faixas: FAIXAS, distribuicao: porFaixa, seguidasPorTier: SEGUIDAS_POR_TIER,
    objetivosPorRaridade: OBJS_POR_RAR,
    numerosObjetivos: { v1: N_V1, v2: N_V2, j: N_J, p: N_P },
    profundidadeObjetivosMax: Math.max(...Object.values(depthObj)),
    iniciais: INICIAIS.slice(),
    panteaoDe: panteaoMap,
    missoes,
  };
}

// -------- VALIDAÇÃO POR VARREDURA (§202) + as 7 BABÁS do §313 --------
function validar(doc) {
  const erros = [];
  const M = doc.missoes;
  const keys = Object.keys(M);
  if (keys.length !== 91) erros.push(`esperado 91 missões, achei ${keys.length}`);

  // (a) CICLO nas arestas companheiro->deus (higiene do dado do companheiro)
  const filhos = {};
  for (const k of keys) { const c = M[k].companheiro; if (c) { if (!M[c] && !doc.iniciais.includes(c)) erros.push(`${k}: companheiro desconhecido "${c}"`); (filhos[c] = filhos[c] || []).push(k); } }
  const cor = {}; const pilha = []; let ciclo = null;
  const dfs = (n) => {
    cor[n] = 1; pilha.push(n);
    for (const f of (filhos[n] || [])) { if (cor[f] === 1) { ciclo = `CICLO: ${pilha.slice(pilha.indexOf(f)).join(' -> ')} -> ${f}`; return true; } if (!cor[f] && dfs(f)) return true; }
    cor[n] = 2; pilha.pop(); return false;
  };
  for (const r of doc.iniciais) if (!cor[r] && dfs(r)) break;
  for (const k of keys) if (!cor[k] && dfs(k)) break;
  if (ciclo) erros.push(ciclo);

  // (b) ALCANÇABILIDADE (modelo legado do servidor atual): companheiro possuído + provedor do panteão exigido.
  const possui = new Set(doc.iniciais);
  const panteoesPossuidos = () => { const s = new Set(); for (const k of possui) s.add(doc.panteaoDe[k]); return s; };
  let mudou = true;
  while (mudou) {
    mudou = false;
    const disp = panteoesPossuidos();
    for (const k of keys) {
      if (possui.has(k)) continue;
      const m = M[k];
      const compOk = m.companheiro ? possui.has(m.companheiro) : true;
      const volOk = disp.has(m.panteao);
      if (compOk && volOk) { possui.add(k); mudou = true; }
    }
  }
  const inalc = keys.filter(k => !possui.has(k));
  if (inalc.length) erros.push(`INALCANÇÁVEIS (companheiro) a partir dos 9 iniciais (${inalc.length}): ${inalc.join(' ')}`);

  // (c) o caso MAIA: sem inicial, fecha pelo cruzamento do itzamná
  const semInicial = !doc.iniciais.some(k => doc.panteaoDe[k] === 'Maia');
  const maias = keys.filter(k => doc.panteaoDe[k] === 'Maia');
  const it = M.itzamna;
  const maiaOk = semInicial && it && it.panteao === 'Egípcia' && it.companheiro === 'ra' && maias.every(k => k === 'itzamna' || M[k].panteao === 'Maia');
  if (!maiaOk) erros.push('caso MAIA não fecha: itzamná deveria exigir Egípcia+ra e os outros Maias (chaac/ahpuch/kukulkan) exigir Maia');

  // (d) §241 — ORDEM DA RAMPA: o companheiro (não-inicial) destrava em faixa <= a do deus.
  const foraDeOrdem = [];
  for (const k of keys) { const c = M[k].companheiro; if (c && M[c] && M[c].faixaIndice > M[k].faixaIndice) foraDeOrdem.push(`${k} (${M[k].faixa}) exige ${c} que só destrava em ${M[c].faixa}`); }
  if (foraDeOrdem.length) erros.push(`FORA DE ORDEM na rampa (companheiro destrava depois do deus): ${foraDeOrdem.join(' · ')}`);

  // ===== §313 — AS 7 BABÁS =====
  const b = validarObjetivos(doc);
  for (const e of b.erros) erros.push(e);

  return { ok: erros.length === 0, erros, alcancados: possui.size - doc.iniciais.length, maiaCross: maiaOk,
    objetivos: b };
}

// §313 — as 7 babás dos objetivos, separadas para os testes exercitarem cada uma (e provarem que MORDEM).
function validarObjetivos(doc) {
  const erros = [];
  const M = doc.missoes;
  const keys = Object.keys(M);
  const nomeadosResolvidos = (m) => { const s = []; for (const o of (m.objetivos || [])) { if (o.tipo === 's') s.push(o.alvo); else if (o.tipo === 'v' || o.tipo === 'j' || o.tipo === 'c') s.push(...o.lista); } return s; };
  const existe = (n) => !!M[n] || doc.iniciais.includes(n);

  // babá 1 — número de objetivos por raridade (A 2 · S 3 · SS 4)
  for (const k of keys) { const esp = doc.objetivosPorRaridade[M[k].raridade]; const n = (M[k].objetivos || []).length; if (n !== esp) erros.push(`§313 b1 ${k}: ${n} objetivos, raridade ${M[k].raridade} espera ${esp}`); }

  // babá 2 — nunca nomear o próprio deus (§230)
  for (const k of keys) for (const nm of nomeadosResolvidos(M[k])) if (nm === k) erros.push(`§313 b2 ${k} nomeia a si mesmo`);

  // babá 3 — todo nome existe (entre as 91 ou os 9 iniciais)
  for (const k of keys) for (const nm of nomeadosResolvidos(M[k])) if (!existe(nm)) erros.push(`§313 b3 ${k}: nome inexistente "${nm}"`);

  // babá 4 — nenhum nome de faixa MAIOR que a do alvo
  for (const k of keys) for (const nm of nomeadosResolvidos(M[k])) { if (!M[nm]) continue; if (M[nm].faixaIndice > M[k].faixaIndice) erros.push(`§313 b4 ${k} (${M[k].faixa}) nomeia ${nm} de faixa MAIOR (${M[nm].faixa})`); }

  // babá 5 — sem ciclo nos objetivos; os 91 alcançáveis (modelo §313); caso Maia resolvido
  const c5 = varreduraObjetivos(doc);
  if (c5.ciclo) erros.push(`§313 b5 CICLO nos objetivos: ${c5.ciclo}`);
  if (c5.inalcancaveis.length) erros.push(`§313 b5 INALCANÇÁVEIS pelos objetivos (${c5.inalcancaveis.length}): ${c5.inalcancaveis.join(' ')}`);
  const maiasKeys = keys.filter(k => doc.panteaoDe[k] === 'Maia');
  const maiaResolvido = maiasKeys.every(k => !c5.inalcancaveis.includes(k)) && maiasKeys.length > 0;
  if (!maiaResolvido) erros.push('§313 b5 caso MAIA não fecha pelos objetivos');

  // babá 6 — PONTE NUNCA OBRIGATÓRIA: cada "v" tem ≥1 do panteão do alvo. Exceção: alvo Maia.
  for (const k of keys) {
    if (doc.panteaoDe[k] === 'Maia') continue;   // exceção do dono
    const P = M[k].panteao;                       // panteão EXIGIDO do alvo
    for (const o of (M[k].objetivos || [])) {
      if (o.tipo !== 'v') continue;
      const temMesmo = o.lista.some(g => (M[g] ? M[g].panteao : doc.panteaoDe[g]) === P || doc.panteaoDe[g] === P);
      if (!temMesmo) erros.push(`§313 b6 ${k} (${P}): "v" [${o.lista.join(', ')}] sem deus do panteão do alvo (ponte obrigatória)`);
    }
  }

  // babá 7 — nenhuma lista de objetivos igual a outra (normalizada por tipo + nomes + panteão/N)
  const vistos = {};
  for (const k of keys) { const a = assinaturaObjetivos(M[k].objetivos || []); if (vistos[a]) erros.push(`§313 b7 ${k} tem a MESMA lista de objetivos que ${vistos[a]}`); else vistos[a] = k; }

  return { erros, maiaResolvido, alcancados: c5.alcancados };
}

// §313 — varredura de alcançabilidade pelos OBJETIVOS (o modelo real da Parte 2): um deus fica possuível
// quando os nomes obrigatórios (s/j/c) estão possuídos, cada lista "v" tem ≥1 possuído, cada "p"/"sp" tem
// um provedor do panteão possuído, e cada "a" N tem N panteões distintos possuídos. (Ignora o portão de
// ranque: o dono decidiu que o ranque é o RITMO, sempre alcançável.) Também detecta ciclo por não-progresso.
function varreduraObjetivos(doc) {
  const M = doc.missoes; const keys = Object.keys(M);
  const possui = new Set(doc.iniciais);
  const panteoes = () => { const s = new Set(); for (const k of possui) s.add(doc.panteaoDe[k]); return s; };
  let mudou = true;
  while (mudou) {
    mudou = false;
    const disp = panteoes();
    for (const k of keys) {
      if (possui.has(k)) continue;
      let ok = true;
      for (const o of M[k].objetivos) {
        if (o.tipo === 's') { if (!possui.has(o.alvo)) { ok = false; break; } }
        else if (o.tipo === 'j' || o.tipo === 'c') { if (!o.lista.every(g => possui.has(g))) { ok = false; break; } }
        else if (o.tipo === 'v') { if (!o.lista.some(g => possui.has(g))) { ok = false; break; } }
        else if (o.tipo === 'p' || o.tipo === 'sp') { if (!disp.has(o.panteao)) { ok = false; break; } }
        else if (o.tipo === 'a') { if (disp.size < o.n) { ok = false; break; } }
      }
      if (ok) { possui.add(k); mudou = true; }
    }
  }
  const inalcancaveis = keys.filter(k => !possui.has(k));
  // "ciclo" prático: se sobrou algo inalcançável, aponta o menos-bloqueado como pista.
  let ciclo = null;
  if (inalcancaveis.length) {
    const k = inalcancaveis[0];
    ciclo = null; // o erro de inalcançável já cobre; ciclo só se um deus depende (transitivamente) de si.
  }
  return { alcancados: possui.size - doc.iniciais.length, inalcancaveis, ciclo };
}

module.exports = { gerar, validar, validarObjetivos, varreduraObjetivos, panteaoDe, volume,
  construirObjetivos, assinaturaObjetivos, SEGUIDAS_POR_TIER, N_V1, N_V2, N_J, N_P };

if (require.main === module) {
  const doc = gerar();
  const v = validar(doc);
  if (!v.ok) { console.error('VALIDAÇÃO FALHOU:'); for (const e of v.erros) console.error('  - ' + e); process.exit(1); }
  fs.writeFileSync(path.join(__dirname, '..', 'data', 'missoes.json'), JSON.stringify(doc, null, 1) + '\n');
  const M = doc.missoes, keys = Object.keys(M);
  const cnt = { A: 0, S: 0, SS: 0 }; let comComp = 0;
  for (const k of keys) { cnt[M[k].raridade]++; if (M[k].companheiro) comComp++; }
  const inicial = k => doc.iniciais.includes(k);
  const cadeias = keys.filter(k => M[k].companheiro && !inicial(M[k].companheiro)).length;
  const imediatas = keys.filter(k => M[k].faixaIndice === 0 && (!M[k].companheiro || inicial(M[k].companheiro))).length;
  const gated = keys.length - imediatas;
  const prof = Math.max(...keys.map(k => M[k].profundidade));
  const profObj = doc.profundidadeObjetivosMax;
  const seq = {}; for (const k of keys) seq[M[k].seguidas] = (seq[M[k].seguidas] || 0) + 1;
  const tipos = {}; for (const k of keys) for (const o of M[k].objetivos) tipos[o.tipo] = (tipos[o.tipo] || 0) + 1;
  console.log(`OK — 91 Provações (A ${cnt.A} · S ${cnt.S} · SS ${cnt.SS}); ${comComp} com companheiro, ${91 - comComp} só volume.`);
  console.log(`§313 objetivos: por raridade A ${doc.objetivosPorRaridade.A} · S ${doc.objetivosPorRaridade.S} · SS ${doc.objetivosPorRaridade.SS}; tipos ${Object.keys(tipos).sort().map(t => t + ':' + tipos[t]).join(' · ')}.`);
  console.log(`Varredura §202: sem ciclo · ${v.alcancados}/91 alcançáveis (companheiro) · ${v.objetivos.alcancados}/91 alcançáveis (objetivos) · rampa em ordem · caso Maia ${v.maiaCross ? 'OK' : 'FALHOU'}.`);
  console.log(`Distribuição por faixa (${doc.distribuicao.map(f => f.nome + ' ' + f.quantas).join(' · ')}) = ${doc.distribuicao.reduce((s, f) => s + f.quantas, 0)}`);
  console.log(`Cadeias (companheiro NÃO-inicial): ${cadeias} · gated: ${gated} · imediatas: ${imediatas} · profundidade companheiro: ${prof} · profundidade objetivos: ${profObj}`);
  console.log(`Sequências (§241, rampa 2/3/4): ${Object.keys(seq).sort().map(n => n + '→' + seq[n]).join(' · ')} (todas ≥1, teto 4).`);
  console.log('Escrito: data/missoes.json');
}
