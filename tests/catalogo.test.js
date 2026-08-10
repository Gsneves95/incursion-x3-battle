// catalogo.test.js (F1.0a) — o catálogo entra por REGISTRO COM CHAVE, não por variável de
// módulo. Trava o bug que um `_CAT` global teria: duas partidas com catálogos DIFERENTES,
// criadas em sequência, cada uma tem de respeitar o SEU catálogo. Com _CAT de módulo, a
// segunda novoEstado sobrescreveria o catálogo da primeira e agir(A) leria o de B — em
// silêncio, o pior caso para a arena de balanceamento (F1.4).
const E = require('../src/engine.js');

let f = 0; const ok = (c, m) => { if (!c) { console.log('  FALHA: ' + m); f++; } };

// dois catálogos com a MESMA chave 'g', mas o básico causa dano DIFERENTE (15 vs 5).
function mkCat(dano) {
  return {
    g: {
      key: 'g', nome: 'G', elem: 'Chama', classe: 'Físico', funcao: 'Atacante',
      passiva: { nome: '-', desc: '-' },
      ab: [
        { slot: 'basico', classe: 'Físico', nome: 'Golpe', cost: {}, cd: 0, alvo: 'inimigo', fx: [{ t: 'dmg', v: dano }] },
        { slot: 'habilidade', classe: 'Físico', nome: 'H', cost: {}, cd: 9, alvo: 'inimigo', fx: [{ t: 'dmg', v: 1 }] },
        { slot: 'milagre', classe: 'Físico', nome: 'M', cost: {}, cd: 9, alvo: 'inimigo', fx: [{ t: 'dmg', v: 1 }] },
      ],
    },
  };
}

console.log('== duas partidas, catálogos diferentes, criadas em sequência ==');
{
  const catA = mkCat(15), catB = mkCat(5);
  const stA = E.novoEstado(['g', 'g', 'g'], ['g', 'g', 'g'], 1, 0, null, catA);
  const stB = E.novoEstado(['g', 'g', 'g'], ['g', 'g', 'g'], 1, 0, null, catB);   // criada DEPOIS
  const clA = JSON.parse(JSON.stringify(stA));   // clone da IA, tirado ANTES de qualquer ação
  ok(stA.catId && stB.catId && stA.catId !== stB.catId, `catId distinto por catálogo (A ${stA.catId}, B ${stB.catId})`);
  ok(clA.catId === stA.catId, 'o catId sobrevive ao JSON.stringify (clone da IA)');

  // agir INTERCALADO: se o catálogo fosse de módulo, o último (B) venceria os dois
  const aA = stA.lados[1].units[0], hpA = aA.hp;
  const aB = stB.lados[1].units[0], hpB = aB.hp;
  const aC = clA.lados[1].units[0], hpC = aC.hp;
  E.agir(stA, stA.lados[0].units[0].uid, 'basico', [aA.uid]);
  E.agir(stB, stB.lados[0].units[0].uid, 'basico', [aB.uid]);
  E.agir(clA, clA.lados[0].units[0].uid, 'basico', [aC.uid]);
  ok(hpA - aA.hp === 15, `partida A respeita catA (15 de dano); caiu ${hpA - aA.hp}`);
  ok(hpB - aB.hp === 5, `partida B respeita catB (5 de dano); caiu ${hpB - aB.hp}`);
  ok(hpC - aC.hp === 15, `clone de A (só com catId) lê o mesmo snapshot de catA (15); caiu ${hpC - aC.hp}`);

  // o catálogo NÃO viaja dentro do estado (é o que mantém o clone barato)
  ok(!('catalogo' in stA) && !JSON.stringify(stA).includes('"ab"'), 'o estado não carrega o kit (só o catId)');
}

console.log('');
console.log(f === 0 ? '>>> CATÁLOGO OK' : `>>> ${f} FALHA(S)`);
process.exit(f ? 1 : 0);
