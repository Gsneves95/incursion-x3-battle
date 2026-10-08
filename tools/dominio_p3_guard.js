// ===================================================================
// INCURSION — PORTÃO P3 dos DOMÍNIOS (§325).
// "O nível 1 de cada cultura é VENCÍVEL, sob a IA v2 com vida cheia, pelo time de referência MAIS BARATO."
// Isto MORDE: um Domínio cuja escada comece dura demais para a coleção de início falha o build. É SIMULADO
// (não lê um carimbo gravado) → re-verifica de fato o dado toda vez. Usado pelo build (quebra) e pelo teste.
//   • mais barato = regua.times[0] (a lista é determinística, menor raridade somada — §325 F).
//   • vencível = taxa de vitória > 0.5 sob v2×v2, vida cheia, no danoMult do nível 1 (barato, poucas seeds).
// ===================================================================
'use strict';
const path = require('path');
const E = require(path.join(__dirname, '..', 'src', 'engine.js'));
Object.assign(global, E);   // ia.js lê o motor pelo global (como o gerador e os testes); sem isto, podeAgir é undefined
const { iaProximaAcao } = require(path.join(__dirname, '..', 'src', 'ia.js'));
const D = require(path.join(__dirname, '..', 'src', 'dominios.js'));
const V2 = s => iaProximaAcao(s, 'normal', 2);

// uma batalha v2×v2, vida cheia, catálogos POR LADO (o time pode conter um deus da própria cultura). 1 = jogador vence.
function _jogo(time, inimigos, seed, danoMult) {
  const cats = D.domCatalogosPorLado(E.GODS, time, 0, inimigos, danoMult);
  const st = E.novoEstado(time, inimigos, seed || 1, 0, null, cats);
  let g = 0;
  while (!st.fim && g++ < 500) { let p = 0, a; while (!st.fim && (a = V2(st)) && p++ < 8) E.agir(st, a.uid, a.slot, a.alvos, a.escolhas); if (st.fim) break; E.fimTurno(st); }
  return (st.fim && st.fim.resultado === 'vitoria' && st.fim.lado === 0) ? 1 : 0;
}

// devolve { tx, vit, seeds, cheapest, nv1 } da semana 0 (a cultura é a mesma em todas as semanas; o nv1 é o comum mais fácil).
function medir(ladder, seeds = 24) {
  const reg = ladder.regua || {};
  // §325b: o P3 usa o MELHOR trio formável SÓ com os INICIAIS (o que o jogador novo tem), gravado em regua.p3Time.
  // Fallback para regua.times[0] (dado §325 antigo, sem p3Time).
  const cheapest = (Array.isArray(reg.p3Time) && reg.p3Time.length === 3) ? reg.p3Time : (reg.times || [])[0];
  const sem0 = (ladder.semanas || [])[0] || { niveis: ladder.niveis || [] };
  const nv1 = sem0.niveis[0];
  if (!cheapest || !nv1) return { tx: 0, vit: 0, seeds, cheapest, nv1: nv1 && nv1.inimigos };
  let vit = 0;
  for (let s = 1; s <= seeds; s++) vit += _jogo(cheapest, nv1.inimigos, (s * 7919) >>> 0, nv1.danoMult || 1);
  return { tx: vit / seeds, vit, seeds, cheapest, nv1: nv1.inimigos };
}

// [] se OK, ou uma lista de mensagens de erro (uma por cultura reprovada).
function validar(ladder, seeds = 24) {
  const nome = (ladder && ladder.cultura) || '(sem cultura)';
  const r = medir(ladder, seeds);
  if (!r.cheapest) return [`${nome}: regua.p3Time/times ausente — sem trio de iniciais para o P3 (§325b)`];
  if (!(r.tx > 0.5)) return [`${nome}: nível 1 NÃO vencível pelo melhor trio de INICIAIS (${r.cheapest.join('+')}) sob v2 vida cheia: ${(r.tx * 100).toFixed(0)}% (${r.vit}/${r.seeds}) — §325 P3`];
  return [];
}

module.exports = { validar, medir };

// CLI: node tools/dominio_p3_guard.js [--seeds=N]
if (require.main === module) {
  const fs = require('fs');
  const seeds = (() => { const p = process.argv.find(a => a.startsWith('--seeds=')); return p ? parseInt(p.split('=')[1], 10) : 24; })();
  const dir = path.join(__dirname, '..', 'data', 'dominios');
  let ok = true;
  for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort()) {
    const lad = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    const r = medir(lad, seeds);
    const erros = validar(lad, seeds);
    console.log(`${(lad.cultura || f).padEnd(9)} nv1 ${r.cheapest ? r.cheapest.join('+') : '?'} vs ${r.nv1 ? r.nv1.join('+') : '?'}: ${(r.tx * 100).toFixed(0)}% ${erros.length ? '✗ ' + erros[0] : '✓'}`);
    if (erros.length) ok = false;
  }
  process.exit(ok ? 0 : 1);
}
