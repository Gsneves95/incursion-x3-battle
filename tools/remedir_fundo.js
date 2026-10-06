// ===================================================================
// §323 P2 ETAPA B — separar os "só fundos" dos "fechados".
// Re-roda o solucionador (v2) com orçamento MAIOR (default 900k) nos conteúdos que o manifesto 200k deixou
// INDETERMINADOS. Os que VENCEM aqui são SÓ FUNDO (saem da fila de ajuste); os que seguem INDETERMINADO/INVENCÍVEL
// são candidatos a alavanca (ETAPA C). Reporta o comprimento v2 contra o v1 (carimbo) e a faixa 0,8×–1,5×.
//
// NÃO toca o manifesto (que é a régua a 200k) — é diagnóstico. Imprime linhas JSON (uma por item) + um resumo.
//
//   node tools/remedir_fundo.js [--orc=900000] [--slice=i/n] [--sem=idx,idx,...] [--only=rito|sem]
// --slice=i/n roda só a fatia i (1..n) da lista (para paralelizar em n processos, higiene de 1 core cada).
// --sem: índices dos puzzles semanais INDETERMINADOS (keys duplicadas → índice, achados por scripts/sem_idx).
// ===================================================================
'use strict';
const fs = require('fs');
const path = require('path');
const E = require(path.join(__dirname, '..', 'src', 'engine.js'));
Object.assign(global, E);
try { const { BESTIARIO } = require(path.join(__dirname, '..', 'src', 'bestiario.js')); global.BESTIARIO = BESTIARIO; } catch (e) {}
const SOL = require(path.join(__dirname, 'solucionador.js'));

const arg = (n, d) => { const p = process.argv.find(a => a.startsWith('--' + n + '=')); return p ? p.split('=')[1] : d; };
const ORC = parseInt(arg('orc', '900000'), 10);
const ONLY = arg('only', '');
const SEM = (arg('sem', '')).split(',').map(s => s.trim()).filter(s => s !== '').map(Number);
const SLICE = arg('slice', '1/1').split('/').map(Number);   // [i, n]

const raiz = path.join(__dirname, '..');
const manifesto = JSON.parse(fs.readFileSync(path.join(raiz, 'data', 'ia_winnability_v2.json'), 'utf8'));

// alvos: rito indeterminados (do manifesto, exclui INVENCÍVEL) + semanais pelos índices passados.
const alvos = [];
if (ONLY !== 'sem') {
  for (const it of ((manifesto.modos.rito && manifesto.modos.rito.naoVencivel) || [])) {
    if (it.veredito === 'INVENCIVEL') continue;   // fechado provado — não é "fundo"
    const prov = JSON.parse(fs.readFileSync(path.join(raiz, 'data', 'provacoes', it.id + '.json'), 'utf8'));
    const v1 = (prov.verificacao && prov.verificacao.lancesNesteCaminho) || null;
    alvos.push({ modo: 'rito', id: it.id, prov, v1 });
  }
}
if (ONLY !== 'rito' && SEM.length) {
  const S = JSON.parse(fs.readFileSync(path.join(raiz, 'data', 'semanais.json'), 'utf8'));
  for (const idx of SEM) { const p = (S.puzzles || [])[idx]; if (p) alvos.push({ modo: 'sem', id: p.key + '#' + idx, prov: p, v1: null }); }
}

// fatia (paralelismo)
const [si, sn] = SLICE;
const meus = alvos.filter((_, k) => (k % sn) === ((si - 1) % sn));

const linhas = [];
for (const a of meus) {
  let r; try { r = SOL.resolver(a.prov, { orcamentoNos: ORC, versao: 2 }); } catch (e) { r = { veredito: 'ERRO', motivo: String(e && e.message) }; }
  // v1 para os semanais (sem carimbo): roda v1 a 200k (barato se vence) para ter a baseline da faixa
  let v1 = a.v1;
  if (v1 == null && a.modo === 'sem') { try { const rv1 = SOL.resolver(a.prov, { orcamentoNos: 200000, versao: 1 }); if (rv1.veredito === 'VENCIVEL') v1 = rv1.comprimento; } catch (e) {} }
  const comp = (r.veredito === 'VENCIVEL') ? r.comprimento : null;
  const faixaOk = (v1 && comp) ? (comp >= 0.8 * v1 && comp <= 1.5 * v1) : null;
  const o = { modo: a.modo, id: a.id, veredito: r.veredito, comp, nos: r.nos, v1, faixaOk };
  linhas.push(o);
  process.stdout.write('RES ' + JSON.stringify(o) + '\n');
}
process.stdout.write('DONE slice=' + si + '/' + sn + ' n=' + meus.length + '\n');
