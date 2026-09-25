'use strict';
// FASE 6 / §230-§231 — GERADOR DA ÁRVORE DE MISSÕES a partir dos REQUISITOS DO DONO.
// As 91 missões NÃO se derivam da mecânica (§230): o vínculo é TEMÁTICO (o Cérbero é o cão do Hades),
// escrito à mão pelo dono em `data/missoes_requisitos.json` — panteão exigido + companheiro + motivo.
// O gerador só CASA isso com a raridade real (o volume) e emite `data/missoes.json`, validando por
// varredura contra os DADOS do repositório (§202).
//
// O REQUISITO de cada deus (do dono):
//   - VOLUME por raridade: SS 40 vit c/ o panteão + 5 seguidas c/ o companheiro; S 20 + 3 seguidas;
//     A 15 (+ companheiro onde houver, sem "seguidas").
//   - COMPANHEIRO temático (83 têm; 8 são só volume — os portões de entrada de cada mitologia).
// O feito-por-habilidade do §229 saiu do caminho crítico (o leitor segue para maestria; §230).

const fs = require('fs');
const path = require('path');
const FAM = require('../src/missoes_familias.js');

const REQDOC = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'missoes_requisitos.json'), 'utf8'));
const REQ = Array.isArray(REQDOC) ? REQDOC : REQDOC.missoes;                 // §312: o arquivo virou {missoes, precedencia}
const PRECED = (Array.isArray(REQDOC) ? [] : (REQDOC.precedencia || []));    // §312: desempate temático do dono
const RAR = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'raridades.json'), 'utf8'));
const RANQ = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'ranqueado.json'), 'utf8'));
const GODS = FAM._carregarDeuses();
const CLS = FAM.classificarTodos();
const INICIAIS = ['zeus', 'ogum', 'tyr', 'sobek', 'brigid', 'ganesha', 'cuca', 'fujin', 'nezha'];

// §241 — AS TRÊS ALAVANCAS JUNTAS (o desbloqueio vira caçada longa):
//   ranque REVELA · cadeia ORDENA · sequência PROVA HABILIDADE.
// O PORTÃO DE RANQUE reverte o §232 (que o removera): não é cadeado duplo, é ESTRUTURA QUE REVELA
// (como o "ser no mínimo Anbu" do Naruto-Arena). Reusa as 8 faixas do ranqueado (nenhuma escada nova).
const FAIXAS = RANQ.faixas;                                   // 8, em ordem Suplicante -> Semideus
// DISTRIBUIÇÃO de missões por faixa, MAIS GENEROSA EMBAIXO (soma = 91). As 3 primeiras abrem 46/91 (51%):
// quem chega tem o que fazer, e o casual tem ~50 deuses de caminho antes de o ranque apertar (§232: fica
// LONGE do topo, não trancado).
const DISTRIB = [18, 15, 13, 12, 11, 9, 7, 6];
// AS TRÊS TRAVAS CORRELACIONADAS por faixa (rampa, não parede): a sequência sobe 2->3->4 com a faixa;
// a cadeia fica mais funda no topo (emerge da atribuição por PROFUNDIDADE). Duas faixas por degrau.
// RAMPA SUAVIZADA para teto 4 (§241, decisão do dono após a MEDIÇÃO): a rampa literal 3/4/5/6 dava
// 6-8 meses (a simulação em tools/custo_missoes.js) — perto do abandono; as sequências são exponenciais
// (uma de 6 ~ 126 partidas a 50%) e o contador-desde-o-desbloqueio impede pré-farm, então quase não se
// sobrepõem entre elos. Teto 4 (2/3/4) traz para ~3-4 meses (a "caçada") mantendo as três travas.
const SEGUIDAS_POR_TIER = [2, 2, 3, 3, 3, 3, 4, 4];          // por índice de faixa (0..7)

// PROFUNDIDADE da cadeia: 1 = a raiz (companheiro inicial ou nulo); N = N-1 deuses de missão antes dele.
// É o que ORDENA a árvore; a faixa é atribuída por ela, então faixa e cadeia correlacionam por construção.
function profundidades(REQmap) {
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

// ATRIBUIÇÃO DE FAIXA por PROFUNDIDADE: ordena por (profundidade, raridade, nome) e fatia nos baldes da
// DISTRIB. Como profundidade(companheiro) < profundidade(deus), o companheiro sempre cai numa faixa <= a do
// deus — a árvore é destravável em ordem (invariante cobrado na validação). Emerge: faixa baixa = cadeia
// rasa, faixa alta = cadeia funda (a correlação que o §241 pede).
function atribuirFaixas(depth) {
  const rarRank = { A: 0, S: 1, SS: 2 };
  const ordem = REQ.map(r => r.deus).sort((a, b) =>
    (depth[a] - depth[b]) || ((rarRank[RAR[a]] || 0) - (rarRank[RAR[b]] || 0)) || a.localeCompare(b));
  const faixaIdx = {};
  let i = 0;
  for (let fi = 0; fi < FAIXAS.length; fi++) for (let n = 0; n < DISTRIB[fi]; n++) faixaIdx[ordem[i++]] = fi;
  return faixaIdx;
}

// PANTEÃO de MEMBRESIA (quem PROVÊ o volume de um panteão) = a facção REAL do deus, normalizada
// (Olímpica é Grega). É o TRUE pantheon — por isso itzamná (facção Maia) provê Maia depois de liberado,
// que é o que faz a mitologia sem inicial (Maia) alcançável. NÃO é o panteão EXIGIDO (esse vem do
// arquivo e pode ser cruzado: itzamná EXIGE Egípcia, mas É Maia).
function panteaoDe(godKey) { const f = GODS[godKey].faccao; return f === 'Olímpica' ? 'Grega' : f; }

// VOLUME por raridade (a raridade real, §230), a REFERÊNCIA antes do corte.
const VOL_BASE = { A: 15, S: 20, SS: 40 };
// §242 — O FATOR DE VOLUME (o PARÂMETRO; mora AQUI, muda-se UMA linha e roda `npm run gerar:missoes`).
// O volume é o FREIO DE TEMPO (a sequência é o de habilidade, §241, e NÃO muda). Com 1 slot ativo o volume
// deixa de se dividir entre várias Provações — um requisito de 12 fazia sentido contando para cinco missões,
// sozinho vira parede. Cortar para 40% devolve a proporção que o modelo paralelo tinha. PISO 4 (o corte não
// trivializa os A). Recalibrar depois = trocar FATOR_VOLUME e regerar; nenhum dos 91 registros é editado à mão.
const FATOR_VOLUME = 0.55;
const PISO_VOLUME = 4;
function volume(rar) {
  const base = (VOL_BASE[rar] != null) ? VOL_BASE[rar] : VOL_BASE.A;
  const panteao = Math.max(PISO_VOLUME, Math.round(base * FATOR_VOLUME));   // §242: cortado + piso
  const seguidas = rar === 'SS' ? 5 : (rar === 'S' ? 3 : 0);                // legado (§241 usa SEGUIDAS_POR_TIER)
  return { panteao, seguidas, base };
}

// §312 — DIFERENCIAR os grupos de TAREFA IDÊNTICA (mesma tupla panteão+volume+seguidas+faixa+companheiro+
// seguidasAlvo → o servidor os completa na MESMA partida, provado por simulação). A regra do dono:
//   (1) ordena os irmãos por CENTRALIDADE DECRESCENTE (outdeg = de quantas missões o deus é companheiro);
//       a CHAVE (mais central) vem primeiro e FICA no volume base — somar volume à chave atrasaria toda a
//       cadeia que depende dela (o Cérbero é companheiro de 2). (2) o empate residual (mesma centralidade)
//       quebra pela PRECEDÊNCIA escrita pelo dono (data/missoes_requisitos.json), NUNCA por alfabeto/id/
//       ordem-do-arquivo (a "3ª espécie" do §300b: número arbitrário com cara de derivado). (3) volume =
//       base + posição-na-fila × 1 vitória. Falha ALTO: empate sem precedência, ou precedência velha/fora.
function _outdeg(missoes) { const o = {}; for (const k in missoes) { const c = missoes[k].companheiro; if (c) o[c] = (o[c] || 0) + 1; } return o; }
function _alvoK(m) { const a = m.seguidasAlvo || {}; return a.tipo + ':' + a.chave; }
function _tupla(m) { return [m.panteao, m.vitoriasPanteao, m.seguidas, m.faixa, m.companheiro || '-', _alvoK(m)].join('|'); }
function diferenciar(missoes, PRECED) {
  const erros = [];
  const outdeg = _outdeg(missoes);
  const groups = {};
  for (const k in missoes) { const t = _tupla(missoes[k]); (groups[t] = groups[t] || []).push(k); }
  const precBySet = new Map();            // set-de-chaves -> ordem escrita pelo dono
  for (const p of PRECED) precBySet.set((p.grupo || []).slice().sort().join(','), p.grupo || []);
  const usada = new Set();
  const offsets = {}; for (const k in missoes) offsets[k] = 0;
  const tabela = [];
  for (const t in groups) {
    const membros = groups[t];
    if (membros.length < 2) continue;
    // ordena por centralidade decrescente e parte em degraus (tiers) de mesma centralidade
    membros.sort((a, b) => (outdeg[b] || 0) - (outdeg[a] || 0));
    const tiers = []; let cur = null, curO = null;
    for (const k of membros) { const o = outdeg[k] || 0; if (o !== curO) { cur = []; tiers.push(cur); curO = o; } cur.push(k); }
    const fila = [];
    for (const tier of tiers) {
      if (tier.length === 1) { fila.push(tier[0]); continue; }
      // empate de centralidade: exige precedência do dono cobrindo EXATAMENTE estes irmãos
      const key = tier.slice().sort().join(',');
      const ordem = precBySet.get(key);
      if (!ordem) { erros.push(`§312 grupo idêntico SEM desempate: [${tier.join(', ')}] (panteão ${missoes[tier[0]].panteao} · faixa ${missoes[tier[0]].faixa} · comp ${missoes[tier[0]].companheiro || '-'}) — a centralidade empata e falta precedência do dono`); fila.push(...tier); continue; }
      usada.add(key);
      for (const g of ordem) fila.push(g);
    }
    fila.forEach((k, i) => { offsets[k] = i; });
    for (const k of fila) tabela.push({ deus: k, nome: missoes[k].nome, panteao: missoes[k].panteao, antes: missoes[k].vitoriasPanteao, pos: offsets[k], depois: missoes[k].vitoriasPanteao + offsets[k], outdeg: outdeg[k] || 0 });
  }
  // babá: precedência que não casa um empate REAL (cita deus fora do grupo, ou grupo que já não colide — dado velho)
  for (const p of PRECED) { const key = (p.grupo || []).slice().sort().join(','); if (!usada.has(key)) erros.push(`§312 precedência inútil/velha: [${(p.grupo || []).join(', ')}] — não corresponde a um empate de centralidade num grupo que ainda colide`); }
  return { offsets, erros, outdeg, tabela };
}

function gerar() {
  const REQmap = {}; for (const r of REQ) REQmap[r.deus] = r;
  const depth = profundidades(REQmap);
  const faixaIdx = atribuirFaixas(depth);
  const missoes = {};
  for (const r of REQ) {
    const k = r.deus;
    const rar = RAR[k];
    const vol = volume(rar);
    const fi = faixaIdx[k];
    const seguidas = SEGUIDAS_POR_TIER[fi];            // §241: sequência pela FAIXA (rampa 3->6), toda missão tem
    // §241: TODA missão tem >=1 sequência. Com companheiro, "seguidas com o companheiro" (a cadeia prova
    // habilidade no deus temático); sem companheiro (as 8 portas de entrada), "seguidas com o PANTEÃO".
    const alvo = r.companheiro ? { tipo: 'companheiro', chave: r.companheiro } : { tipo: 'panteao', chave: r.panteao };
    missoes[k] = {
      deus: k, nome: GODS[k].nome, raridade: rar,
      panteao: r.panteao,            // EXIGIDO (do dono; pode ser cruzado)
      companheiro: r.companheiro || null,
      motivo: r.motivo,
      // §241 — o PORTÃO DE RANQUE (reverte §232): a missão só REVELA/destrava a partir desta faixa.
      faixa: FAIXAS[fi].chave, faixaNome: FAIXAS[fi].nome, faixaIndice: fi, faixaMin: FAIXAS[fi].min,
      profundidade: depth[k],        // §241: profundidade da cadeia (1 = raiz)
      vitoriasPanteao: vol.panteao,  // VOLUME por raridade (inalterado)
      seguidas, seguidasAlvo: alvo,  // §241: sequência pela faixa; alvo = companheiro OU panteão
      // compat: o campo antigo passa a espelhar `seguidas` onde há companheiro (os leitores antigos seguem)
      seguidasCompanheiro: r.companheiro ? seguidas : 0,
      // informativo (maestria/futuro, §230) — a família-assinatura e a habilidade nomeada do kit.
      familia: CLS[k].familia, feito: { metrica: CLS[k].metrica, habilidade: CLS[k].habilidade, slot: CLS[k].slot },
    };
  }
  // §312 — DIFERENCIAÇÃO: soma o offset de posição-na-fila ao volume dos irmãos de tarefa idêntica.
  const dif = diferenciar(missoes, PRECED);
  for (const k in missoes) missoes[k].vitoriasPanteao += dif.offsets[k];
  const panteaoMap = {};
  for (const k of Object.keys(GODS)) panteaoMap[k] = panteaoDe(k);
  // distribuição real por faixa (confere a DISTRIB) — vira dado para a tela agrupar por faixa (§241 item 5).
  const porFaixa = FAIXAS.map((f, fi) => ({ chave: f.chave, nome: f.nome, min: f.min,
    quantas: Object.values(missoes).filter(m => m.faixaIndice === fi).length }));
  return {
    versao: 4,
    _nota: 'Gerado por tools/gerar_missoes.js (§241 três travas · §242 volume cortado · §312 diferenciação): VOLUME por panteão (raridade × FATOR_VOLUME, piso) + SEQUÊNCIA pela FAIXA (rampa 2/3/4, teto 4) + PORTÃO DE RANQUE (8 faixas). §312: grupos de TAREFA IDÊNTICA (mesma tupla) recebem +0/+1/+2 vitórias por posição — ordem por CENTRALIDADE (outdeg) decrescente, empate residual pela PRECEDÊNCIA do dono (missoes_requisitos.json). O 1º da fila fica no volume base. Vínculo temático (companheiro/motivo/precedência) do dono.',
    _difInfo: { erros: dif.erros, tabela: dif.tabela },
    volumeFator: FATOR_VOLUME, volumePiso: PISO_VOLUME,
    volumes: { A: volume('A'), S: volume('S'), SS: volume('SS') },
    faixas: FAIXAS, distribuicao: porFaixa, seguidasPorTier: SEGUIDAS_POR_TIER,
    iniciais: INICIAIS.slice(),
    panteaoDe: panteaoMap,
    missoes,
  };
}

// -------- VALIDAÇÃO POR VARREDURA (§202) contra os DADOS do repositório --------
// (a) sem CICLO nas arestas de companheiro (companheiro -> deus); (b) TODOS alcançáveis a partir dos 9
// iniciais por PONTO-FIXO: um deus libera quando o companheiro (se houver) já é possuído E o panteão
// EXIGIDO tem um PROVEDOR possuído (inicial ou já-liberado cuja facção real = o panteão). (c) o caso
// Maia (sem inicial) fecha pelo cruzamento do itzamná.
function validar(doc) {
  const erros = [];
  const M = doc.missoes;
  const keys = Object.keys(M);
  if (keys.length !== 91) erros.push(`esperado 91 missões, achei ${keys.length}`);

  // (a) CICLO nas arestas companheiro->deus
  const filhos = {};   // companheiro -> [deuses que o exigem]
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

  // (b) ALCANÇABILIDADE por ponto-fixo (companheiro possuído + provedor do panteão exigido possuído)
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
      const volOk = disp.has(m.panteao);   // há um deus possuído cuja facção real = o panteão EXIGIDO
      if (compOk && volOk) { possui.add(k); mudou = true; }
    }
  }
  const inalc = keys.filter(k => !possui.has(k));
  if (inalc.length) erros.push(`INALCANÇÁVEIS a partir dos 9 iniciais (${inalc.length}): ${inalc.join(' ')}`);

  // (c) o caso MAIA: sem inicial, fecha pelo cruzamento
  const semInicial = !doc.iniciais.some(k => doc.panteaoDe[k] === 'Maia');
  const maias = keys.filter(k => doc.panteaoDe[k] === 'Maia');
  const it = M.itzamna;
  const maiaOk = semInicial && it && it.panteao === 'Egípcia' && it.companheiro === 'ra' && maias.every(k => k === 'itzamna' || M[k].panteao === 'Maia');
  if (!maiaOk) erros.push('caso MAIA não fecha: itzamná deveria exigir Egípcia+ra e os outros Maias (chaac/ahpuch/kukulkan) exigir Maia');

  // (d) §241 — ORDEM DA RAMPA: o companheiro (não-inicial) precisa destravar em faixa <= a do deus, senão
  // a cadeia não é destravável em ordem. Garante que o portão de ranque não trava o próprio pré-requisito.
  const foraDeOrdem = [];
  for (const k of keys) {
    const c = M[k].companheiro;
    if (c && M[c] && M[c].faixaIndice > M[k].faixaIndice)
      foraDeOrdem.push(`${k} (${M[k].faixa}) exige ${c} que só destrava em ${M[c].faixa}`);
  }
  if (foraDeOrdem.length) erros.push(`FORA DE ORDEM na rampa (companheiro destrava depois do deus): ${foraDeOrdem.join(' · ')}`);

  // (e) §312 — DIFERENCIAÇÃO: (1) os erros de fila/precedência que o gerador acumulou; (2) NENHUM par com a
  // tupla de tarefa idêntica no doc FINAL (a diferenciação zerou os grupos, sem colisão nova entre grupos);
  // (3) o 1º de cada grupo (posição 0) fica EXATAMENTE no volume base da raridade — o "piso não muda".
  for (const e of (doc._difInfo && doc._difInfo.erros) || []) erros.push(e);
  const porTup = {};
  for (const k of keys) { const t = _tupla(M[k]); (porTup[t] = porTup[t] || []).push(k); }
  const aindaIguais = Object.values(porTup).filter(v => v.length > 1);
  if (aindaIguais.length) erros.push(`§312 AINDA HÁ tarefas idênticas após diferenciar (${aindaIguais.length}): ${aindaIguais.map(v => v.join('/')).join(' · ')}`);
  const baseDe = { A: volume('A').panteao, S: volume('S').panteao, SS: volume('SS').panteao };
  for (const g of (doc._difInfo && doc._difInfo.tabela) || []) {
    if (g.pos === 0 && g.depois !== baseDe[M[g.deus].raridade]) erros.push(`§312 o 1º da fila (${g.deus}) não está no volume base (${g.depois} ≠ ${baseDe[M[g.deus].raridade]})`);
  }

  return { ok: erros.length === 0, erros, alcancados: possui.size - doc.iniciais.length, maiaCross: maiaOk };
}

module.exports = { gerar, validar, panteaoDe, volume, diferenciar, _tupla };

if (require.main === module) {
  const doc = gerar();
  const v = validar(doc);
  if (!v.ok) { console.error('VALIDAÇÃO FALHOU:'); for (const e of v.erros) console.error('  - ' + e); process.exit(1); }
  const difTabela = (doc._difInfo && doc._difInfo.tabela) || [];
  delete doc._difInfo;   // §312: helper de validação — não polui o data/missoes.json
  fs.writeFileSync(path.join(__dirname, '..', 'data', 'missoes.json'), JSON.stringify(doc, null, 1) + '\n');
  const M = doc.missoes, keys = Object.keys(M);
  const cnt = { A: 0, S: 0, SS: 0 }; let comComp = 0;
  for (const k of keys) { cnt[M[k].raridade]++; if (M[k].companheiro) comComp++; }
  const inicial = k => doc.iniciais.includes(k);
  // "cadeia" ESTRITA (§241): companheiro NÃO-inicial (a missão fica escondida atrás de um deus a ganhar).
  const cadeias = keys.filter(k => M[k].companheiro && !inicial(M[k].companheiro)).length;
  // GATED = não disponível de cara: faixa > Suplicante OU companheiro não-inicial. Imediatas = o resto.
  const imediatas = keys.filter(k => M[k].faixaIndice === 0 && (!M[k].companheiro || inicial(M[k].companheiro))).length;
  const gated = keys.length - imediatas;
  const prof = Math.max(...keys.map(k => M[k].profundidade));
  const seq = {}; for (const k of keys) seq[M[k].seguidas] = (seq[M[k].seguidas] || 0) + 1;
  console.log(`OK — 91 missões (A ${cnt.A} · S ${cnt.S} · SS ${cnt.SS}); ${comComp} com companheiro, ${91 - comComp} só volume.`);
  console.log(`Volume §242: fator ${FATOR_VOLUME} (piso ${PISO_VOLUME}) → A ${VOL_BASE.A}→${volume('A').panteao} · S ${VOL_BASE.S}→${volume('S').panteao} · SS ${VOL_BASE.SS}→${volume('SS').panteao} vitórias.`);
  console.log(`Varredura §202: sem ciclo · ${v.alcancados}/91 alcançáveis · rampa em ordem · caso Maia ${v.maiaCross ? 'OK' : 'FALHOU'}.`);
  console.log(`Distribuição por faixa (${doc.distribuicao.map(f => f.nome + ' ' + f.quantas).join(' · ')}) = ${doc.distribuicao.reduce((s, f) => s + f.quantas, 0)}`);
  console.log(`Cadeias (companheiro NÃO-inicial): ${cadeias} · gated (ranque>Suplicante OU cadeia): ${gated} · imediatas: ${imediatas} · profundidade: ${prof} ondas`);
  console.log(`Sequências (§241, rampa 2/3/4): ${Object.keys(seq).sort().map(n => n + '→' + seq[n]).join(' · ')} missões (todas ≥1, teto 4).`);
  // §312 — diferenciação: a tabela dos irmãos ajustados (deus · antes→depois · posição · centralidade)
  console.log(`§312 diferenciação: ${difTabela.length} missões em ${new Set(difTabela.map(g => g.panteao + '|' + M[g.deus].companheiro + '|' + M[g.deus].faixa)).size} grupos ajustados (o 1º de cada fica no volume base):`);
  for (const g of difTabela) console.log(`   ${g.deus.padEnd(14)} ${g.panteao.padEnd(11)} vol ${g.antes}→${g.depois}  (posição ${g.pos}, outdeg ${g.outdeg})`);
  console.log('Escrito: data/missoes.json');
}
