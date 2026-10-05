// §322 P3 — DIFICULDADE dos Domínios: antes (inimigo v1) × depois (inimigo v2).
// Sem solução fixa (corrida), então "winnability" não se aplica: reportamos até que NÍVEL a corrida chega quando
// o próprio jogo joga dos dois lados (jogador = IA fixa; inimigo = v1 vs v2). Menos níveis sob a v2 = mais difícil.
//   node tools/medir_dominio_dif.js [--jog=2]
'use strict';
const path = require('path'); const fs = require('fs');
const E = require(path.join(__dirname, '..', 'src', 'engine.js')); Object.assign(global, E);
const ia = require(path.join(__dirname, '..', 'src', 'ia.js'));
const DOM = require(path.join(__dirname, '..', 'src', 'dominios.js'));
const arg = (n, d) => { const p = process.argv.find(a => a.startsWith('--' + n + '=')); return p ? p.split('=')[1] : d; };
const JOG = parseInt(arg('jog', '2'), 10);   // versão do JOGADOR (proxy fixo); variamos só o inimigo

function corrida(ladderRaw, inimigoVer) {
  const ladder = DOM.domEscadaSemana(ladderRaw, 0);   // a escada da semana tem os .niveis (o cru guarda em .semanas)
  const run = DOM.domNovaCorrida(ladder, 0, '2000-W01', 0);
  let guardaRun = 0;
  while (run.status === 'ativo' && guardaRun++ < 60) {
    const st = DOM.domMontarBatalha(run, ladder, { seed: (run.nivel * 7919) >>> 0 || 1 });
    if (!st) break;
    let g = 0, a;
    while (!st.fim && g++ < 400) {
      const ver = st.ativo === 0 ? JOG : inimigoVer;
      let p = 0;
      while (!st.fim && (a = ia.iaProximaAcao(st, 'normal', ver)) && p++ < 8) E.agir(st, a.uid, a.slot, a.alvos, a.escolhas);
      if (st.fim) break; E.fimTurno(st);
    }
    const r = DOM.domResolverBatalha(run, ladder, st);
    if (r.morreu) break;
    if (run.aguardandoPremio) DOM.domAplicarPremio(run, ladder, 'bonus');   // escolhe o bônus e avança
  }
  return { nivel: run.profundidade, status: run.status };
}

console.log('=== §322 P3 — dificuldade dos Domínios (jogador v' + JOG + ' fixo; inimigo v1 × v2) ===');
const dir = path.join(__dirname, '..', 'data', 'dominios');
for (const f of fs.readdirSync(dir).filter(x => x.endsWith('.json'))) {
  const ladderRaw = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  const ladder = DOM.domEscadaSemana(ladderRaw, 0);
  const total = (ladder.niveis || []).length;
  const v1 = corrida(ladderRaw, 1), v2 = corrida(ladderRaw, 2);
  console.log(`  ${(ladder.cultura || f).padEnd(10)}: inimigo v1 chega ao nível ${v1.nivel}/${total} (${v1.status}) · inimigo v2 ao ${v2.nivel}/${total} (${v2.status})  → ${v2.nivel < v1.nivel ? 'MAIS DIFÍCIL (−' + (v1.nivel - v2.nivel) + ')' : v2.nivel === v1.nivel ? 'igual' : 'mais fácil'}`);
}
