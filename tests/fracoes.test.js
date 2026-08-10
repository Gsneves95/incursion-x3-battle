// tests/fracoes.test.js — FRAÇÃO IMPLÍCITA DA VIDA não pode derivar (F1.0c, DECISOES §26).
//
// O §15 subiu a vida para 120 SEM tocar no dano bruto (jogo ~20% mais lento, de propósito).
// Mas números que são FRAÇÃO da vida — limiar de execução, portão condicional "acima/abaixo de
// N de HP", HP fixo de revive — não escalam sozinhos: a 100 um limiar de 25 era 25% da vida; a
// 120 virou ~21%. Isso é degradação (ou, no caso da Durga, BUFF) SILENCIOSA: não quebra teste,
// ninguém revê. Este teste declara a FRAÇÃO PRETENDIDA por categoria e varre a prosa do roster
// (data/kits.json — onde os 100 kits são desenhados ANTES de virar máquina); falha se algum kit
// sentar fora das frações permitidas. Assim os 73 futuros nascem certos, e se a vida mudar de
// novo, o alvo (round(fração × vida)) recomputa e o teste aponta exatamente o que reescalar.
//
// NÃO substitui o teto de dano BRUTO de auditoria.test.js (esse o §15 manteve). Aqui só frações.
// Limite conhecido: cobre as FRASES conhecidas; fraseado novo escapa até virar kit de máquina,
// quando o checador prosa↔motor (tarefa aberta, ESTADO.md) o pega.

const fs = require('fs');
const path = require('path');
const E = require('../src/engine.js');

let f = 0;
const ok = (c, m) => { if (!c) { console.log('  FALHA: ' + m); f++; } };

// vida vem do MOTOR (não de um literal): se a vida mudar, os alvos recomputam sozinhos.
const HP = E.novoEstado(['zeus', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus']).lados[0].units[0].maxHp;

// FRAÇÕES PRETENDIDAS por categoria (conjunto FECHADO — nova fração entra por decisão consciente).
// O alvo de cada categoria NÃO é um número único (24 de 120 é 20%, 30 é 25%): é o conjunto de
// frações que aquela categoria admite. Um valor certo = round(fração × HP) para ALGUMA delas.
const FRACOES = {
  execucao:    [0.20, 0.25],              // abate por limiar: 24 e 30 em 120 (duas faixas de projeto)
  portaoAlto:  [0.70],                    // "acima de N de HP" (Durga): 84 em 120
  portaoBaixo: [0.50],                    // "abaixo de N de HP" (bônus): 60 em 120
  revive:      [0.25, 0.30, 0.40, 0.50],  // HP fixo de revive/vida-extra: 30/36/48/60 em 120
};
// TOLERÂNCIA = 0, e é uma decisão, não descuido: o valor pretendido É round(fração × HP), um
// inteiro que o designer escreve exato. Uma folga de ±1 pareceria inofensiva mas MESCLARIA as
// faixas de execução — 24 (20%) e o valor VELHO 25 (25% de 100) diferem por 1, então ±1 deixaria
// um limiar não-reescalado passar como se fosse o novo. Exato mantém as faixas nítidas. Se a vida
// virar um número que não divide (ex.: 110 → 27,5), round() já dá o inteiro certo dos dois lados.
const TOL = 0;
function alvos(cat) { return FRACOES[cat].map(fr => Math.round(fr * HP)); }
function naFracao(v, cat) { return alvos(cat).some(a => Math.abs(v - a) <= TOL); }

// ---- extração da prosa (mesmas âncoras da varredura da F1.0c) ----
const kits = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/kits.json'), 'utf8'));
const slots = ['basico', 'habilidade', 'milagre', 'passiva'];
const achados = [];   // {key, slot, cat, v}
function push(key, slot, cat, v) { achados.push({ key, slot, cat, v }); }
for (const g of kits) {
  for (const s of slots) {
    const ef = (g[s] && g[s].efeito) || '';
    if (/elimin|abat/i.test(ef)) for (const m of ef.matchAll(/(\d+)\s+ou menos/g)) push(g.key, s, 'execucao', +m[1]);
    for (const m of ef.matchAll(/acima de\s+(\d+)\s+de HP/g)) push(g.key, s, 'portaoAlto', +m[1]);
    for (const m of ef.matchAll(/abaixo de\s+(\d+)\s+de HP/g)) { if (+m[1] !== 1) push(g.key, s, 'portaoBaixo', +m[1]); }
    for (const m of ef.matchAll(/(?:revive|retorna|vida extra)[^.]*?com\s+(\d+)\s+de HP/gi)) { if (+m[1] !== 1) push(g.key, s, 'revive', +m[1]); }
  }
}

console.log(`== fração implícita da vida (HP=${HP}) — nenhum kit fora das frações do projeto ==`);
for (const a of achados)
  ok(naFracao(a.v, a.cat), `${a.key}.${a.slot} [${a.cat}]: ${a.v} não bate com ${JSON.stringify(alvos(a.cat))} (±${TOL})`);
const cont = achados.reduce((o, a) => (o[a.cat] = (o[a.cat] || 0) + 1, o), {});
console.log(`  ${achados.length} números de fração conferidos: ${JSON.stringify(cont)}`);

// dentes: um valor calibrado para 100 (não reescalado) TEM de falhar a 120
console.log('== o verificador tem dentes ==');
ok(!naFracao(25, 'execucao'), 'limiar 25 (25% de 100) deveria falhar a 120 (esperado 30)');
ok(!naFracao(40, 'revive'), 'revive 40 (não reescalado) deveria falhar a 120 (esperado 48)');
ok(naFracao(30, 'execucao') && naFracao(24, 'execucao'), 'execução 24 e 30 (as duas faixas de 120) deveriam passar');
ok(naFracao(84, 'portaoAlto') && naFracao(60, 'portaoBaixo'), 'portões 84/60 deveriam passar');
console.log('  25 e 40 reprovam; 24/30/84/60 aprovam');

console.log('');
console.log(f === 0 ? '>>> FRAÇÕES OK' : `>>> ${f} FALHA(S)`);
process.exit(f ? 1 : 0);
