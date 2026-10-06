// ===================================================================
// §323 P2 ETAPA D — COMPOSIÇÃO (time livre) por TIMES DE REFERÊNCIA.
// A composição não tem solução única (o jogador monta qualquer time que cumpra a regra). "Winnable" = EXISTE um
// time válido que vence. Este tool GERA, por REGRA (não à mão), 1–3 times de referência por desafio que cumprem a
// restrição — escolhidos como "o que um jogador razoável montaria": MENOR raridade somada, ordem determinística
// (raridade A<S<SS, empate alfabético) — e VERIFICA cada um sob a v2 (200k). O desafio é VENCÍVEL se ≥1 vence.
//
//   node tools/ref_composicao.js            # gera + verifica + imprime
//   node tools/ref_composicao.js --escrever # grava timesRef + winnability em data/composicao.json
// ===================================================================
'use strict';
const fs = require('fs');
const path = require('path');
const E = require(path.join(__dirname, '..', 'src', 'engine.js'));
Object.assign(global, E);
try { global.BESTIARIO = require(path.join(__dirname, '..', 'src', 'bestiario.js')).BESTIARIO; } catch (e) {}
const SOL = require(path.join(__dirname, 'solucionador.js'));
const RAR = require(path.join(__dirname, '..', 'data', 'raridades.json'));
const COMPPATH = path.join(__dirname, '..', 'data', 'composicao.json');
const comp = JSON.parse(fs.readFileSync(COMPPATH, 'utf8'));

const ESCREVER = process.argv.includes('--escrever');
const ORC = 200000;
const GK = Object.keys(global.GODS);
const rank = { A: 1, S: 2, SS: 3 };
const rar = k => rank[RAR[k] || 'A'] || 1;
const meta = k => global.GODS[k];
const soma = t => t.reduce((s, k) => s + rar(k), 0);
const cmp = (a, b) => (rar(a) - rar(b)) || (a < b ? -1 : a > b ? 1 : 0);   // menor raridade, depois alfabético

// gera até N times que CUMPREM a regra, por menor raridade somada, determinístico
function gerar(regra, N = 3) {
  const keys = GK.slice().sort(cmp);
  const times = [];
  const push = t => { const s = t.slice().sort(); if (s.length === 3 && new Set(s).size === 3 && !times.some(x => x.join() === s.join())) times.push(s); };
  if (regra === 'monoElemento' || regra === 'mesmaFuncao' || regra === 'monoPanteao') {
    const prop = regra === 'monoElemento' ? 'elem' : regra === 'mesmaFuncao' ? 'funcao' : 'faccao';
    const grupos = {};
    for (const k of keys) { const v = meta(k)[prop]; (grupos[v] = grupos[v] || []).push(k); }   // keys já em ordem cmp
    const cand = Object.values(grupos).filter(g => g.length >= 3).map(g => g.slice(0, 3));
    cand.sort((a, b) => soma(a) - soma(b));
    for (const t of cand) { push(t); if (times.length >= N) break; }
  } else if (regra === 'funcoesDistintas') {
    const porFn = {};
    for (const k of keys) { const f = meta(k).funcao; (porFn[f] = porFn[f] || []).push(k); }
    const fns = Object.keys(porFn).sort((a, b) => rar(porFn[a][0]) - rar(porFn[b][0]));
    for (let i = 0; i < fns.length; i++) for (let j = i + 1; j < fns.length; j++) for (let l = j + 1; l < fns.length; l++) {
      push([porFn[fns[i]][0], porFn[fns[j]][0], porFn[fns[l]][0]]);
    }
    times.sort((a, b) => soma(a) - soma(b));
    times.length = Math.min(times.length, N);
  } else { // livre (muitas vezes com uma CONDIÇÃO extra: sem milagre / sem perder aliado) → precisa de DANO:
    // 1º os 3 mais baratos; 2º os 3 ATACANTES mais baratos (dano que não depende de milagre); 3º 2 atacantes + 1 guardião.
    const atk = keys.filter(k => meta(k).funcao === 'Atacante');
    const grd = keys.filter(k => meta(k).funcao === 'Guardião');
    push(keys.slice(0, 3));
    if (atk.length >= 3) push(atk.slice(0, 3));
    if (atk.length >= 2 && grd.length >= 1) push([atk[0], atk[1], grd[0]]);
    return times.slice(0, N);   // ordem de inserção (diversidade), não re-ordena por raridade
  }
  return times.slice(0, N);
}

// requerido por um teste (guarda rápida da REGRA, sem solucionador) → exporta e não roda o main.
if (require.main !== module) { module.exports = { gerar, meta, comp }; return; }

console.log('=== §323 P2 ETAPA D — composição por times de referência (v2, ' + ORC + ' nós) ===');
let todosOk = true;
for (const d of comp.desafios) {
  const times = gerar(d.regra, 3);
  const resultados = [];
  let vencivel = false;
  for (const t of times) {
    const prov = { aliados: t, inimigos: d.inimigos, montar: d.montar || {}, condicoes: d.condicoes || [] };
    let r; try { r = SOL.resolver(prov, { orcamentoNos: ORC, versao: 2 }); } catch (e) { r = { veredito: 'ERRO', motivo: String(e && e.message) }; }
    const venceu = r.veredito === 'VENCIVEL';
    if (venceu) vencivel = true;
    resultados.push({ time: t, veredito: r.veredito, comp: venceu ? r.comprimento : null, nos: r.nos });
    console.log(`  ${d.id} [${t.join(',')}] (rar ${soma(t)}): ${r.veredito}${venceu ? ' comp=' + r.comprimento + ' nos=' + r.nos : ''}`);
  }
  if (!vencivel) todosOk = false;
  console.log(`  → ${d.id}: ${vencivel ? 'VENCÍVEL' : 'NÃO vencível'} (${d.regra})`);
  if (ESCREVER) { d.timesRef = times; d.winnableV2 = vencivel; }
}
console.log('\n=== composicao ' + (todosOk ? 'TODA vencível sob v2 → pode ir a v2' : 'NÃO 100% vencível → fica v1') + ' ===');
if (ESCREVER) { fs.writeFileSync(COMPPATH, JSON.stringify(comp, null, 2) + '\n'); console.log('gravado data/composicao.json (timesRef + winnableV2)'); }
