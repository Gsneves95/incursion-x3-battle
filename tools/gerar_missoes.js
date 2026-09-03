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

const REQ = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'missoes_requisitos.json'), 'utf8'));
const RAR = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'raridades.json'), 'utf8'));
const GODS = FAM._carregarDeuses();
const CLS = FAM.classificarTodos();
const INICIAIS = ['zeus', 'ogum', 'tyr', 'sobek', 'brigid', 'ganesha', 'cuca', 'fujin', 'nezha'];

// PANTEÃO de MEMBRESIA (quem PROVÊ o volume de um panteão) = a facção REAL do deus, normalizada
// (Olímpica é Grega). É o TRUE pantheon — por isso itzamná (facção Maia) provê Maia depois de liberado,
// que é o que faz a mitologia sem inicial (Maia) alcançável. NÃO é o panteão EXIGIDO (esse vem do
// arquivo e pode ser cruzado: itzamná EXIGE Egípcia, mas É Maia).
function panteaoDe(godKey) { const f = GODS[godKey].faccao; return f === 'Olímpica' ? 'Grega' : f; }

// VOLUME por raridade (os números do dono, da raridade real).
function volume(rar) {
  if (rar === 'SS') return { panteao: 40, seguidas: 5 };
  if (rar === 'S') return { panteao: 20, seguidas: 3 };
  return { panteao: 15, seguidas: 0 };   // A
}

function gerar() {
  const missoes = {};
  for (const r of REQ) {
    const k = r.deus;
    const rar = RAR[k];
    const vol = volume(rar);
    const temComp = !!r.companheiro;
    missoes[k] = {
      deus: k, nome: GODS[k].nome, raridade: rar,
      panteao: r.panteao,            // EXIGIDO (do dono; pode ser cruzado)
      companheiro: r.companheiro || null,
      motivo: r.motivo,
      vitoriasPanteao: vol.panteao,
      seguidasCompanheiro: temComp ? vol.seguidas : 0,   // só onde há companheiro (e só S/SS têm >0)
      // informativo (maestria/futuro, §230) — a família-assinatura e a habilidade nomeada do kit.
      familia: CLS[k].familia, feito: { metrica: CLS[k].metrica, habilidade: CLS[k].habilidade, slot: CLS[k].slot },
    };
  }
  const panteaoMap = {};
  for (const k of Object.keys(GODS)) panteaoMap[k] = panteaoDe(k);
  return {
    versao: 2,
    nota: 'Gerado por tools/gerar_missoes.js a partir de data/missoes_requisitos.json (vínculo temático, do dono) + data/raridades. Requisito = VOLUME por panteão + SEGUIDAS com o companheiro (§230). Membresia (quem provê um panteão) = facção real; panteão EXIGIDO vem do arquivo (pode ser cruzado).',
    volumes: { A: volume('A'), S: volume('S'), SS: volume('SS') },
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

  return { ok: erros.length === 0, erros, alcancados: possui.size - doc.iniciais.length, maiaCross: maiaOk };
}

module.exports = { gerar, validar, panteaoDe, volume };

if (require.main === module) {
  const doc = gerar();
  const v = validar(doc);
  if (!v.ok) { console.error('VALIDAÇÃO FALHOU:'); for (const e of v.erros) console.error('  - ' + e); process.exit(1); }
  fs.writeFileSync(path.join(__dirname, '..', 'data', 'missoes.json'), JSON.stringify(doc, null, 1) + '\n');
  const cnt = { A: 0, S: 0, SS: 0 }; let comComp = 0;
  for (const k in doc.missoes) { cnt[doc.missoes[k].raridade]++; if (doc.missoes[k].companheiro) comComp++; }
  console.log(`OK — 91 missões (A ${cnt.A} · S ${cnt.S} · SS ${cnt.SS}); ${comComp} com companheiro, ${91 - comComp} só volume.`);
  console.log(`Varredura §202: sem ciclo · ${v.alcancados}/91 alcançáveis · caso Maia (cruzamento itzamná→ra) ${v.maiaCross ? 'CONFIRMADO' : 'FALHOU'}.`);
  console.log('Escrito: data/missoes.json');
}
