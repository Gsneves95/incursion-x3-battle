// ===================================================================
// INCURSION x3 — MEDIDOR DE BATALHAS DE CAMPANHA (§268, permanente)
// Mede o win-rate de cada batalha de um capítulo do MESMO jeito que o
// jogo a monta (montarProvacao → o mesmo estado do iniciarAto), com a IA
// GULOSA dos dois lados. É a ferramenta que substitui os números soltos:
// número no repositório que não reproduz é pior que número nenhum.
//
// MÉTODO (explícito e reprodutível):
//   • time = os aliados DEFAULT do ato (emprestado incluso, sem troca do jogador);
//   • quem abre = o `montar.comeca` do dado (0 = jogador/lado 0 abre — como no jogo);
//   • as duas IAs são a GULOSA `iaProximaAcao` (a mesma dos testes; determinística);
//   • um jogo é DETERMINÍSTICO dado (time, sementes, comeca) — não há Math.random no
//     motor nem na IA; a taxa vem de VARIAR a semente de 1..N (amostra a dificuldade
//     do confronto). Mesma N ⇒ mesma taxa, sempre.
//
//   node tools/medir_campanha.js [capNumero=1] [N=2000]
//
// A `montar.seed` gravada no dado é a semente do JOGO REAL (uma amostra); a taxa
// abaixo é sobre 1..N. O ato-alvo do §268 é medido com o time default (sem escolha).
// ===================================================================
const path = require('path'), fs = require('fs');
const raiz = path.join(__dirname, '..');
const E = require(path.join(raiz, 'src', 'engine.js'));
Object.assign(global, E);
const { iaProximaAcao } = require(path.join(raiz, 'src', 'ia.js'));
const PROV = require(path.join(raiz, 'src', 'provacao.js'));

const capNum = parseInt(process.argv[2], 10); const CAP = isNaN(capNum) ? 1 : capNum;
const N = parseInt(process.argv[3], 10) || 2000;

// os dados dos capítulos, pelo índice (a mesma fonte da build)
const indice = JSON.parse(fs.readFileSync(path.join(raiz, 'data', 'campanha', 'indice.json'), 'utf8'));
const linha = (indice.capitulos || []).find(c => c.numero === CAP);
if (!linha) { console.error(`capítulo ${CAP} não existe no índice`); process.exit(1); }
const cap = JSON.parse(fs.readFileSync(path.join(raiz, 'data', 'campanha', linha.arquivo), 'utf8'));

// resolve o time DEFAULT do ato: [string] = travado; [{deus}] = a cena + emprestado default; null = pulado.
function timeDefault(ato){
  if (ato.aliados == null) return null;
  return ato.aliados.map(a => typeof a === 'string' ? a : a.deus);
}

// um jogo: guloso × guloso, com o catálogo MERGED (via montarProvacao — o mesmo do jogo).
function jogar(ato, time, seed){
  const st = PROV.montarProvacao({ aliados: time, inimigos: ato.inimigos, montar: { seed, comeca: (ato.montar && ato.montar.comeca) || 0 } });
  let guard = 0;
  while (!st.fim && guard++ < 400) {
    let passos = 0, a;
    while (!st.fim && (a = iaProximaAcao(st)) && passos++ < 8) E.agir(st, a.uid, a.slot, a.alvos, a.escolhas);
    if (st.fim) break;
    E.fimTurno(st);
  }
  return st;
}

console.log(`# Capítulo ${CAP} — ${cap.nome}`);
console.log(`# método: guloso×guloso · jogador (lado 0) abre quando comeca=0 · N=${N} sementes 1..${N} · determinístico`);
console.log('');
const NOME = k => (E.GODS[k] && E.GODS[k].nome) || k;
for (const ato of (cap.atos || [])) {
  if (ato.tipo !== 'batalha') continue;
  const time = timeDefault(ato);
  if (!time) { console.log(`${ato.id} (${ato.numeral}) — aliados:null (o jogador monta) — não medido`); continue; }
  const comeca = (ato.montar && ato.montar.comeca) || 0;
  let vit = 0, emp = 0;
  for (let s = 1; s <= N; s++) {
    const st = jogar(ato, time, s);
    if (st.fim && st.fim.resultado === 'vitoria' && st.fim.lado === 0) vit++;
    else if (st.fim && st.fim.resultado === 'empate') emp++;
  }
  const taxa = (vit / N * 100);
  const abre = comeca === 0 ? 'jogador abre' : 'inimigo abre';
  console.log(`${ato.id} (${ato.numeral}) — ${time.map(NOME).join(', ')}  vs  ${(ato.inimigos||[]).map(NOME).join(', ')}`);
  console.log(`   winRate ${taxa.toFixed(1)}%  (${abre}, comeca ${comeca}; ${vit}/${N}${emp?`, ${emp} empates`:''})  · seed do jogo: ${ato.montar && ato.montar.seed}`);
  console.log(`   _seedNota sugerido: "seed ${ato.montar && ato.montar.seed} · winRate guloso ${taxa.toFixed(1)}% (${abre}) · guloso×guloso, N=${N} sementes 1..N · repro: node tools/medir_campanha.js ${CAP} ${N}"`);
  console.log('');
}
