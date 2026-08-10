// tests/cadeia.test.js — trava o ELO B da cadeia de verdade (F1.0e): kits.json ↔ data/deuses.
// A build já falha em divergência; aqui gravamos (1) que os 11 kits estão consistentes, (2) que a
// proporção não-conferível fica sob o teto de 20% (senão o checador não protege), e (3) que ele
// TEM DENTES — uma divergência sintética é apontada (o dono: "se não achar nenhuma, desconfie").
const C = require('../tools/checar_cadeia.js');

let f = 0;
const ok = (c, m) => { if (!c) { console.log('  FALHA: ' + m); f++; } };

console.log('== ELO B: os 11 kits reais batem prosa↔motor ==');
ok(C.divergencias.length === 0, 'divergências nos 11: ' + C.divergencias.join(' | '));
ok(C.pctNaoConf <= 20, `não-conferível ${C.pctNaoConf.toFixed(1)}% acima do teto de 20% — padronizar prosa, não afrouxar o parser`);
console.log(`  ${C.total} conferências · match ${C.R.match} · não-conferível ${C.R.naoConf} (${C.pctNaoConf.toFixed(1)}%)`);

console.log('== o checador tem DENTES: divergência sintética é apontada ==');
// prosa dizendo 15 de dano, cd 2, custo "2 Chama"; máquina com 99 (dano), cd 3, custo errado
const prosa = { x: { basico: { nome: 'Golpe', custo: '2 Chama', recarga: 2, efeito: '15 de dano a 1 inimigo.' } } };
const maqDivergente = [{ key: 'x', ab: [{ slot: 'basico', nome: 'Golpe', cd: 3, cost: { Chama: 1 }, fx: [{ t: 'dmg', v: 99 }] }] }];
const r = C.conferir(prosa, maqDivergente);
ok(r.divergencias.some(d => /\[dano\]/.test(d)), 'deveria apontar dano 99≠15');
ok(r.divergencias.some(d => /\[recarga\]/.test(d)), 'deveria apontar recarga 3≠2');
ok(r.divergencias.some(d => /\[custo\]/.test(d)), 'deveria apontar custo {Chama:1}≠{chama:2}');
// e um par idêntico NÃO gera divergência
const maqOk = [{ key: 'x', ab: [{ slot: 'basico', nome: 'Golpe', cd: 2, cost: { Chama: 2 }, fx: [{ t: 'dmg', v: 15 }] }] }];
ok(C.conferir(prosa, maqOk).divergencias.length === 0, 'par idêntico não deveria divergir');
console.log(`  divergência sintética: ${r.divergencias.length} apontadas; par idêntico: 0`);

console.log('');
console.log(f === 0 ? '>>> CADEIA OK' : `>>> ${f} FALHA(S)`);
process.exit(f ? 1 : 0);
