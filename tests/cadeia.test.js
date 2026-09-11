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

console.log('== §270: DENTES nos METADADOS e nos EIXOS NOVOS (orbe/escudo/combo) — mexa o fx, a build quebra ==');
{
  // base: prosa e máquina IDÊNTICAS em metadados e nos 3 eixos → 0 divergência
  const prosaBase = () => ({ y: {
    faccao: 'Grega', elemento: 'Chama', tipo: 'Físico', funcao: 'Atacante',
    basico: { nome: 'A', custo: '—', recarga: 0, efeito: 'Ganha 2 orbes; 15 de Defesa; Gera 3 de Combo; atordoa por 2 turnos.' } } });
  const maqBase = () => [{ key: 'y', faccao: 'Grega', elem: 'Chama', classe: 'Físico', funcao: 'Atacante',
    ab: [{ slot: 'basico', nome: 'A', cd: 0, cost: {},
      fx: [{ t: 'orbGain', n: 2 }, { t: 'shield', v: 15 }, { t: 'contador', nome: 'combo', v: 3 }, { t: 'apply', eff: { type: 'atordoado', dur: 2 } }] }] }];
  ok(C.conferir(prosaBase(), maqBase()).divergencias.length === 0, 'base idêntica: 0 divergência');
  // METADADOS: cada campo, mexido no motor sem mexer na prosa, quebra alto
  for (const [campo, mut] of [['faccao', m => m[0].faccao = 'Nórdica'], ['elem', m => m[0].elem = 'Maré'],
    ['classe', m => m[0].classe = 'Mágico'], ['funcao', m => m[0].funcao = 'Guardião']]) {
    const m = maqBase(); mut(m);
    ok(C.conferir(prosaBase(), m).divergencias.some(d => new RegExp(`\\[${campo}\\]`).test(d)), `metadado ${campo}: fx≠prosa deveria divergir`);
  }
  // EIXOS: mexa o VALOR do fx (sem tocar o texto) → diverge
  const mOrbe = maqBase(); mOrbe[0].ab[0].fx[0].n = 9;
  ok(C.conferir(prosaBase(), mOrbe).divergencias.some(d => /\[orbe\]/.test(d)), 'orbe: fx 9 ≠ texto 2 deveria divergir');
  const mEsc = maqBase(); mEsc[0].ab[0].fx[1].v = 99;
  ok(C.conferir(prosaBase(), mEsc).divergencias.some(d => /\[escudo\]/.test(d)), 'escudo: fx 99 ≠ texto 15 deveria divergir');
  const mCombo = maqBase(); mCombo[0].ab[0].fx[2].v = 7;
  ok(C.conferir(prosaBase(), mCombo).divergencias.some(d => /\[combo\]/.test(d)), 'combo: fx 7 ≠ texto 3 deveria divergir');
  const mDur = maqBase(); mDur[0].ab[0].fx[3].eff.dur = 5;
  ok(C.conferir(prosaBase(), mDur).divergencias.some(d => /\[duração\]/.test(d)), 'duração: fx 5 ≠ texto 2 deveria divergir');
  // §271: a CONVENÇÃO do agendado — texto "por 1 turno" + fx dur:2 + `agendar` NÃO diverge (aceita +1)
  const prosaAg = { z: { faccao: 'Grega', elemento: 'Chama', tipo: 'Físico', funcao: 'Atacante',
    basico: { nome: 'B', custo: '—', recarga: 0, efeito: 'Fica Inalvejável por 1 turno; no turno seguinte causa 25 de dano.' } } };
  const maqAg = [{ key: 'z', faccao: 'Grega', elem: 'Chama', classe: 'Físico', funcao: 'Atacante',
    ab: [{ slot: 'basico', nome: 'B', cd: 0, cost: {}, fx: [{ t: 'apply', eff: { type: 'inalvejavel', dur: 2 } }, { t: 'agendar', agenda: [{ t: 'dmg', v: 25 }] }] }] }];
  ok(!C.conferir(prosaAg, maqAg).divergencias.some(d => /\[duração\]/.test(d)), 'agendado: dur 2 com texto "1 turno" NÃO diverge (convenção +1)');
  // e SEM agendar, o mesmo dur:2 vs "1 turno" DIVERGE (a convenção não vale sem agendado)
  const maqSemAg = JSON.parse(JSON.stringify(maqAg)); maqSemAg[0].ab[0].fx = [{ t: 'apply', eff: { type: 'inalvejavel', dur: 2 } }];
  ok(C.conferir(prosaAg, maqSemAg).divergencias.some(d => /\[duração\]/.test(d)), 'sem agendar: dur 2 vs "1 turno" DEVERIA divergir (convenção não se aplica)');
  console.log('  metadados (4) + orbe + escudo + combo + duração(+convenção do agendado): cada um quebra quando o fx sai do texto');
}

console.log('');
console.log(f === 0 ? '>>> CADEIA OK' : `>>> ${f} FALHA(S)`);
process.exit(f ? 1 : 0);
