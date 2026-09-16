// §283 — GUARDA ANTI-DERIVA do ESTADO.md.
// A deriva tem causa ESTRUTURAL: o ESTADO.md é append-sem-sweep — a resolução vira um bloco ★ novo no
// topo, e a linha pendente lá embaixo nunca é riscada. Já enganou duas vezes (Fujin pós-§271; A/S/SS
// listada como indecisa quando data/raridades.json a resolve). Disciplina falhou; isto é o guarda.
//
// O teste LÊ o ESTADO.md e QUEBRA se uma decisão marcada PENDENTE ([ ]) citar um item que o DADO já
// resolveu. Só guarda o que TEM DADO por trás (raridades.json, economia.json); pick/ban e o ELO A da
// planilha NÃO têm arquivo de dado → sem guarda (não se inventa). Fonte da verdade é o DADO; o documento
// é conferido contra ele — nunca o contrário.
const fs = require('fs'), path = require('path');
const estado = fs.readFileSync(path.join(__dirname, '..', 'ESTADO.md'), 'utf8');
const economia = require('../data/economia.json');
const raridades = require('../data/raridades.json');

let falhas = 0, passes = 0;
const ok = (c, m) => { if (!c) { console.log('  ✗ FALHA: ' + m); falhas++; } else { console.log('  ✓ ' + m); passes++; } };

// caixas de decisão NÃO marcadas (linha começa com "- [ ]"); as "[x]" são fechadas e não contam.
const pendentes = estado.split('\n').filter(l => /^\s*-\s*\[ \]/.test(l));

console.log('== §283 — ESTADO.md não pode afirmar pendência que o DADO contradiz ==');

// 1. ORDEM A/S/SS — data/raridades.json cobre os 100 ⇒ a ordem não está indecisa.
const nRar = Object.keys(raridades).length;
ok(nRar === 100, `raridades.json cobre os 100 deuses (tem ${nRar})`);
if (nRar === 100)
  ok(!pendentes.some(l => /A\/S\/SS/.test(l)),
    'nenhuma decisão PENDENTE ([ ]) cita "A/S/SS" — raridades.json (16/31/53) já a resolveu');

// 2. 50/50 (garantia de destaque) — economia diz REMOVIDO ⇒ não pode constar como pendente/a-definir.
ok(economia.invocacao && economia.invocacao.cinquentaCinquenta === false,
  'economia.invocacao.cinquentaCinquenta === false (removido, §20)');
if (economia.invocacao && economia.invocacao.cinquentaCinquenta === false)
  ok(!pendentes.some(l => /50\s*[\/\-]\s*50|cinquenta|garantia de destaque/i.test(l)),
    'nenhuma decisão PENDENTE ([ ]) cita o 50/50 / garantia de destaque');

// 3. ECONOMIA — economia.json existe ⇒ o texto não pode afirmar que ele falta nem chamá-lo de bloqueante.
ok(economia && typeof economia === 'object', 'data/economia.json existe e carrega');
ok(!/economia\.json[^.\n]{0,40}n[ãa]o\s+existe/i.test(estado),
  'o texto NÃO afirma que economia.json não existe');
ok(!pendentes.some(l => /economia[^\n]*bloqueante/i.test(l)),
  'nenhuma decisão PENDENTE ([ ]) chama a economia de bloqueante');

console.log(`\n${falhas ? '✗ ' + falhas + ' FALHA(S)' : '✓ tudo verde'} · ${passes} asserções`);
process.exit(falhas ? 1 : 0);
