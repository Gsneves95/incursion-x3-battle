// F3.4 — GERADOR de Provação SEMANAL. A Fase 2 não construiu 90 puzzles: construiu um
// MOTOR de puzzles. Isto o usa como gerador perpétuo — 52 Provações/ano, offline, sem servidor.
//
// SEMENTE = índice da semana (o runtime escolhe pela semana ISO). Determinístico: mesmo índice,
// mesmo puzzle, para todo jogador. GERAÇÃO: sorteia título/aliados/inimigos/rider, RODA O
// SOLUCIONADOR, e só aceita VENCÍVEL sem dica — o jogador nunca vê um puzzle não provado.
//
// FILTROS DA FASE 2 (a taxonomia de 6 saídas existe p/ isto — §194): a EXCLUSÃO é aplicada ao
// SORTEIO (não redescoberta): nada de simultaneidade (predicado excluído), rider só do conjunto
// SEGURO com gradiente (§176), e o time de suporte com curador (§196) p/ o rider de sobrevivência.
// O SOLUCIONADOR é o juiz final: o que mata o título ou estoura o prazo é rejeitado e re-sorteado.
//
// Uso: node tools/gerar_semanais.js [N]   → escreve data/semanais.json e imprime a taxa de tentativas.

const fs = require('fs'), path = require('path');
const raiz = path.join(__dirname, '..');
const { resolver } = require('./solucionador.js');

const deuses = fs.readdirSync(path.join(raiz, 'data', 'deuses')).filter(f => f.endsWith('.json')).map(f => f.replace('.json', ''));
const GODKEYS = deuses.slice();
// times de SUPORTE que a §195/§196 provaram habilitar a vitória mantendo o título vivo (curador incluso).
const SUPORTES = [['perseu', 'oxum'], ['perseu', 'houyi'], ['oxum', 'houyi']];
const N_ALVO = Number(process.argv[2]) || 52;
const ORC = 90000;              // orçamento de nós por tentativa (a forma genérica fecha barato)
const MAX_TENT = 60;            // teto de tentativas por semana (bound de tempo); acima disso, a semana é "dura"

// RNG determinístico por semente (mulberry32) — o mesmo índice reproduz o mesmo sorteio.
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

function sortear(rng, semanaIdx) {
  const pick = arr => arr[Math.floor(rng() * arr.length)];
  const titulo = pick(GODKEYS);
  const sup = pick(SUPORTES).filter(k => k !== titulo);
  const aliados = [titulo, ...sup].slice(0, 3);
  while (aliados.length < 3) { const k = pick(GODKEYS); if (!aliados.includes(k)) aliados.push(k); }
  const inimigos = [];
  while (inimigos.length < 3) { const k = pick(GODKEYS); if (!aliados.includes(k) && !inimigos.includes(k)) inimigos.push(k); }
  const dl = 12 + Math.floor(rng() * 5);   // prazo 12–16
  // RIDER do conjunto SEGURO. Base = sobrevivência do título (§195, gradiente por construção — o
  // título vivo é a condição). Excluído por desenho: estadoSimultaneo (§193) e riders sem gradiente (§176).
  const condicoes = [{ predicado: 'deadline', turnos: dl }, { predicado: 'semPerderAliado', quem: titulo }];
  return { key: titulo, semana: semanaIdx, titulo: null, aliados, inimigos, montar: { seed: 1, comeca: 0 }, condicoes };
}

function gerarSemana(i) {
  let tent = 0;
  while (tent < MAX_TENT) {
    tent++;
    const rng = mulberry32((i + 1) * 2654435761 + tent * 40503);   // semente = (semana, tentativa)
    const p = sortear(rng, i);
    const r = resolver(p, { orcamentoNos: ORC });
    if (r.veredito === 'VENCIVEL') {
      const cam = r.sequencia || [];
      const minimo = cam.filter(l => !/^passar$/i.test(String(l).trim())).length;
      return { puzzle: Object.assign(p, { minimo, verif: { veredito: r.veredito, nos: r.nos, comprimento: r.comprimento } }), tentativas: tent };
    }
  }
  return { puzzle: null, tentativas: tent };
}

const puzzles = [];
const tentativas = [];
let duras = 0;
const t0 = Date.now();
for (let i = 0; i < N_ALVO; i++) {
  const g = gerarSemana(i);
  tentativas.push(g.tentativas);
  if (!g.puzzle) { duras++; process.stdout.write(`  semana ${i}: SEM VENCÍVEL em ${g.tentativas} tentativas\n`); continue; }
  puzzles.push(g.puzzle);
  if ((i + 1) % 10 === 0) process.stdout.write(`  ${i + 1}/${N_ALVO} geradas…\n`);
}
const media = tentativas.reduce((a, b) => a + b, 0) / tentativas.length;
const max = Math.max(...tentativas);
const dist = tentativas.reduce((o, t) => ((o[t] = (o[t] || 0) + 1), o), {});

// data/semanais.json: pool SLIM (o runtime só precisa do que monta + avalia + o mínimo).
const saida = {
  _fonte: 'Gerado por tools/gerar_semanais.js (F3.4). Determinístico por índice de semana. Cada puzzle foi PROVADO VENCÍVEL pelo solucionador sem dica. Regenerar com: npm run gerar:semanais.',
  geradoEm: new Date().toISOString().slice(0, 10),
  mediaTentativas: Number(media.toFixed(2)),
  maxTentativas: max,
  puzzles: puzzles.map(p => ({ key: p.key, aliados: p.aliados, inimigos: p.inimigos, montar: p.montar, condicoes: p.condicoes, minimo: p.minimo })),
};
fs.writeFileSync(path.join(raiz, 'data', 'semanais.json'), JSON.stringify(saida, null, 2) + '\n');

console.log('\n=========== GERADOR SEMANAL ===========');
console.log(`geradas: ${puzzles.length}/${N_ALVO}  ·  duras (sem vencível em ${MAX_TENT}): ${duras}`);
console.log(`TENTATIVAS DE SORTEIO até uma válida — média ${media.toFixed(2)}  ·  máx ${max}`);
console.log(`distribuição de tentativas: ${JSON.stringify(dist)}`);
console.log(`tempo: ${((Date.now() - t0) / 1000).toFixed(1)}s  ·  escrito data/semanais.json`);
