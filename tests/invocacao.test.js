// Tela de invocação (gacha) — exercitada de verdade via jsdom sobre o build.
// Trava: lê os 100 deuses do repo, raridade só de OBTENÇÃO (SS/S/A, sem B/estrelas),
// pity duro garante SS, e a auditoria de taxas funciona.
const fs = require('fs');
const { JSDOM } = require('jsdom');
const html = fs.readFileSync(require('path').join(__dirname, '../dist/incursion.html'), 'utf8');

let falhas = 0;
const ok = (c, m) => { if (!c) { console.log('  FALHA: ' + m); falhas++; } };

const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://x/' });
const w = dom.window, d = w.document;
const $ = s => d.querySelector(s), $$ = s => [...d.querySelectorAll(s)];
const tap = el => { if (!el) { ok(false, 'elemento ausente'); return; } el.dispatchEvent(new w.MouseEvent('click', { bubbles: true })); };

console.log('== 1. fonte da verdade: 100 deuses, raridade só SS/S/A ==');
{
  ok(w.eval('ROSTER.length') === 100, 'roster deveria ter 100');
  ok(w.eval('Object.keys(RARIDADE).length') === 100, `RARIDADE deveria cobrir os 100 (tem ${w.eval('Object.keys(RARIDADE).length')})`);
  const vals = w.eval('JSON.stringify([...new Set(Object.values(RARIDADE))].sort())');
  ok(vals === '["A","S","SS"]', `raridades deveriam ser só SS/S/A (sem B/estrela), são ${vals}`);
  const cont = w.eval('Object.values(RARIDADE).reduce((o,r)=>((o[r]=(o[r]||0)+1),o),{})');
  console.log(`  100 deuses · raridades ${vals} · distribuição ${JSON.stringify(cont)}`);
}

console.log('== 2. a tela monta a partir do botão Invocar ==');
{
  tap($('#binvocar'));
  ok(!!$('#iv'), 'a tela de invocação deveria montar');
  ok($$('#iv-tabs .iv-tab').length === 3, '3 banners (Destaque/Padrão/Iniciante)');
  ok(/\/60/.test($('#iv-pity').textContent), 'o pity de SS (/60) deveria aparecer');
  ok(/Coleção/.test($('#iv-tally').textContent), 'o contador de coleção deveria aparecer');
  ok(!!$('#iv .iv-carta'), 'as cartas do destaque deveriam renderizar');
  console.log(`  montou · 3 banners · pity 60 · destaque com ${$$('#iv .iv-feat .iv-carta').length} cartas`);
}

console.log('== 3. invocação x10 revela 10 cartas, SEM estrelas ==');
{
  w.eval('INV.pull(10)');
  const cartas = $$('#iv-cards .iv-carta');
  ok(cartas.length === 10, `deveriam revelar 10 cartas, revelou ${cartas.length}`);
  const htmlCartas = $('#iv-cards').innerHTML;
  ok(!htmlCartas.includes('★'), 'nenhuma estrela (★) deveria aparecer na carta');
  ok($$('#iv-cards [class*="star"], #iv-cards [class*="estrela"]').length === 0, 'nenhum elemento de estrela');
  ok($$('#iv-cards .iv-raridade').length >= 10, 'cada carta mostra a letra de raridade');
  ok(/Total <b>10<\/b>/.test($('#iv-tally').innerHTML) || /Total\s*10/.test($('#iv-tally').textContent), 'o total deveria ir a 10');
  console.log(`  10 cartas · zero estrelas · raridade por letra · total 10`);
}

console.log('== 4. pity DURO, determinístico por semente (exercita a garantia de verdade) ==');
{
  // `ss>=1` em 60 pulls passava ~84% por SORTE (SS natural antes da garantia), sem
  // nunca exercitar o pity. Como INV.sortearLote é pura e semeada, testamos direto.
  // Sementes achadas por busca sobre o build (200k seeds, banner 'padrao', pity 0):
  //   seed 5  -> as 59 primeiras SEM SS; a 60ª é forçada pela garantia.
  //   seed 1  -> SS natural no meio (o contador tem de zerar ali e contar dali).
  const A = w.eval("(function(){var r=INV.sortearLote(5,'padrao',{pity:0},60);return {rs:r.out.map(o=>o.r),pity:r.pity.pity};})()");
  ok(A.rs.slice(0, 59).every(x => x !== 'SS'), 'seed 5: nenhum SS nas 59 primeiras (garantia ainda não disparou)');
  ok(A.rs[59] === 'SS', 'seed 5: a 60ª é SS — o pity DURO disparou exatamente na garantia');
  ok(A.pity === 0, 'o contador zera após o SS');
  const B = w.eval("(function(){var r=INV.sortearLote(1,'padrao',{pity:0},60);return {rs:r.out.map(o=>o.r),pity:r.pity.pity};})()");
  const ultimoSS = B.rs.lastIndexOf('SS');
  ok(ultimoSS >= 1 && ultimoSS < 59, 'seed 1: houve SS NATURAL antes da garantia');
  ok(B.pity === 59 - ultimoSS, `após SS natural o contador zera e conta dali (pity=${B.pity}, esperado ${59 - ultimoSS})`);
  console.log(`  garantia dispara no 60º (seed 5); SS natural zera o contador (seed 1: último SS no ${ultimoSS}, pity ${B.pity})`);
}

console.log('== 5. auditoria de taxas abre e tabela bate ==');
{
  w.eval('INV.openAudit()');
  ok($('#iv-audit').classList.contains('iv-show'), 'a auditoria deveria abrir');
  ok(/1\.000 invocações/.test($('#iv-auditBox').textContent), 'deveria simular 1000');
  ok($$('#iv-auditBox table tr').length >= 4, 'a tabela deveria listar as raridades');
  console.log(`  auditoria de 1000 aberta com ${$$('#iv-auditBox table tr').length} linhas`);
}

console.log('');
console.log(falhas === 0 ? '>>> INVOCAÇÃO OK' : `>>> ${falhas} FALHA(S)`);
process.exit(falhas ? 1 : 0);
