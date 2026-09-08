'use strict';
// §245 — GERADOR de PERGAMINHOS por deus (cobertura 100%). Reusa o motor de puzzles (como o §203 semanal):
// fixa o TÍTULO no deus-alvo, sorteia suporte curado + inimigos, RODA O SOLUCIONADOR e só aceita VENCÍVEL
// (o jogador nunca vê um puzzle não provado). Grava data/provacoes/<deus>.json com o CARIMBO (§148), no
// mesmo formato do acervo. Uso: node tools/gerar_pergaminhos.js [deus1 deus2 ...]  (padrão: os 10 sem pergaminho)
const fs = require('fs'), path = require('path');
const raiz = path.join(__dirname, '..');
const { resolver } = require('./solucionador.js');
const PROV = require('../src/provacao.js');

const deuses = fs.readdirSync(path.join(raiz, 'data', 'deuses')).filter(f => f.endsWith('.json')).map(f => f.replace('.json', ''));
const GODKEYS = deuses.slice();
const provDir = path.join(raiz, 'data', 'provacoes');
const jaTem = new Set(fs.readdirSync(provDir).filter(f => f.endsWith('.json')).map(f => f.replace('.json', '')));
// os 10 SEM pergaminho (9 iniciais + oni) — o padrão quando não se passa argumento
const FALTANTES = GODKEYS.filter(k => !jaTem.has(k));

const SUPORTES = [['perseu', 'oxum'], ['perseu', 'houyi'], ['oxum', 'houyi']];
const ORC = 120000;      // orçamento de nós por tentativa (um pouco mais folgado que o semanal)
const MAX_TENT = 200;    // teto de tentativas por deus
const NIVEL_NOS = n => n == null ? 2 : n < 5000 ? 1 : n < 50000 ? 2 : 3;

function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

// gera UM pergaminho VENCÍVEL com o TÍTULO fixo (forma genérica: suporte curado + prazo + não perder o título)
function gerarPara(alvo, semente) {
  const pick = (arr, rng) => arr[Math.floor(rng() * arr.length)];
  for (let tent = 0; tent < MAX_TENT; tent++) {
    const rng = mulberry32(semente + tent * 40503);
    const sup = pick(SUPORTES, rng).filter(k => k !== alvo);
    const aliados = [alvo, ...sup].slice(0, 3);
    while (aliados.length < 3) { const k = pick(GODKEYS, rng); if (!aliados.includes(k)) aliados.push(k); }
    const inimigos = [];
    while (inimigos.length < 3) { const k = pick(GODKEYS, rng); if (!aliados.includes(k) && !inimigos.includes(k)) inimigos.push(k); }
    const dl = 12 + Math.floor(rng() * 5);
    const prov = {
      key: alvo, titulo: 'Prova de Domínio', nivel: 'Provação', dificuldade: 2,
      aliados, inimigos, montar: { seed: 1, comeca: 0 },
      condicoes: [{ predicado: 'deadline', turnos: dl }, { predicado: 'semPerderAliado', quem: alvo }],
    };
    const r = resolver(prov, { orcamentoNos: ORC });
    if (r.veredito === 'VENCIVEL') {
      prov.dificuldade = NIVEL_NOS(r.nos);
      prov.verificacao = {
        hash: PROV.catalogoHash(prov), nivelIA: r.nivelIA, veredito: r.veredito,
        lancesNesteCaminho: r.comprimento != null ? r.comprimento : null, comDica: false,
        nos: r.nos, ms: r.ms, caminho: r.sequencia || null,
      };
      return { prov, tent: tent + 1 };
    }
  }
  return { prov: null, tent: MAX_TENT };
}

const alvos = process.argv.slice(2).length ? process.argv.slice(2) : FALTANTES;
console.log(`GERAR PERGAMINHOS (§245) — ${alvos.length} deus(es): ${alvos.join(', ')}`);
const t0 = Date.now();
let ok = 0; const falhas = [];
for (const alvo of alvos) {
  if (!GODKEYS.includes(alvo)) { console.log(`  ${alvo}: NÃO é um deus do roster — pulado`); continue; }
  const g = gerarPara(alvo, (GODKEYS.indexOf(alvo) + 1) * 2654435761);
  if (!g.prov) { falhas.push(alvo); console.log(`  ${alvo}: SEM VENCÍVEL em ${MAX_TENT} tentativas`); continue; }
  fs.writeFileSync(path.join(provDir, alvo + '.json'), JSON.stringify(g.prov, null, 2) + '\n');
  ok++;
  console.log(`  ${alvo}: VENCÍVEL em ${g.tent} tentativa(s) · ${g.prov.verificacao.nos} nós · ${g.prov.verificacao.lancesNesteCaminho} lances → escrito`);
}
console.log(`\n${ok}/${alvos.length} gerados · ${falhas.length ? 'FALHAS: ' + falhas.join(', ') : 'sem falhas'} · ${((Date.now() - t0) / 1000).toFixed(1)}s`);
process.exit(falhas.length ? 1 : 0);
