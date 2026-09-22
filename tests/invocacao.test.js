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
  w.eval("ir('selecao');render()");   // F3.0: o app abre na HOME; o botão Invocar mora na seleção
  tap($('#binvocar'));
  ok(!!$('#iv'), 'a tela de invocação deveria montar');
  // §302: UMA invocação, sem abas. Não existe mais #iv-tabs; o deus em destaque é a própria invocação.
  ok(!$('#iv-tabs'), 'não há mais abas de banner (uma invocação só)');
  ok(w.eval('typeof INV.setBanner') === 'undefined', 'setBanner saiu (não há modo/banner a trocar)');
  ok(w.eval('typeof INV.claimIniciante') === 'function', 'claimIniciante é a porta única da oferta grátis');
  ok($$('#iv .iv-feat .iv-carta').length >= 1, 'o deus em destaque renderiza na única invocação');
  ok(!!$('.iv-oferta'), 'a Bênção do Iniciante aparece como OFERTA única inline (não aba)');
  ok(/\/60/.test($('#iv-pity').textContent), 'o pity de SS (/60) deveria aparecer');
  ok(/Coleção/.test($('#iv-tally').textContent), 'o contador de coleção deveria aparecer');
  ok(!!$('#iv .iv-carta'), 'as cartas do destaque deveriam renderizar');
  console.log(`  montou · sem abas · pity 60 · destaque com ${$$('#iv .iv-feat .iv-carta').length} cartas · oferta iniciante inline`);
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
  // Sementes achadas por busca sobre o build (banner único 'destaque', pity 0):
  //   seed 5  -> as 59 primeiras SEM SS; a 60ª é forçada pela garantia.
  //   seed 1  -> SS natural no meio (o contador tem de zerar ali e contar dali).
  const A = w.eval("(function(){var r=INV.sortearLote(5,'destaque',{pity:0},60);return {rs:r.out.map(o=>o.r),pity:r.pity.pity};})()");
  ok(A.rs.slice(0, 59).every(x => x !== 'SS'), 'seed 5: nenhum SS nas 59 primeiras (garantia ainda não disparou)');
  ok(A.rs[59] === 'SS', 'seed 5: a 60ª é SS — o pity DURO disparou exatamente na garantia');
  ok(A.pity === 0, 'o contador zera após o SS');
  const B = w.eval("(function(){var r=INV.sortearLote(1,'destaque',{pity:0},60);return {rs:r.out.map(o=>o.r),pity:r.pity.pity};})()");
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

console.log('== 6. carteira real: x10 debita o perfil; saldo insuficiente NÃO avança estado ==');
{
  // O grant inicial (1500) cobriu UM x10 (1350) na seção 3 -> sobram 150. Agora um x10
  // (1350) tem de ser BLOQUEADO: sem revelar, sem consumir pity, sem gravar. Falha de
  // pagamento não avança estado nenhum — é o invariante que o dono mais quer travado.
  ok(w.eval('perfil.moedas.gema') === 150, `x10 debitou o perfil de verdade (grant 1500 - 1350 = 150, veio ${w.eval('perfil.moedas.gema')})`);
  const saldoAntes = w.eval('perfil.moedas.gema');
  const totalAntes = w.eval('perfil.invocacao.total');
  const pityAntes  = w.eval('perfil.invocacao.desdeUltimoSS');
  const salvoAntes = w.eval('localStorage.getItem("incursion:perfil")');
  const cartasAntes = $$('#iv-cards .iv-carta').length;
  w.eval('INV.pull(10)');   // custa 1350 > 150
  ok(w.eval('perfil.moedas.gema') === saldoAntes, 'saldo intacto (nada debitado)');
  ok(w.eval('perfil.invocacao.total') === totalAntes, 'total de invocações intacto (estado não avançou)');
  ok(w.eval('perfil.invocacao.desdeUltimoSS') === pityAntes, 'pity intacto (não consumido)');
  ok(w.eval('localStorage.getItem("incursion:perfil")') === salvoAntes, 'nada gravado no perfil persistido');
  ok($$('#iv-cards .iv-carta').length === cartasAntes, 'não revelou cartas novas');
  ok(/insufic/i.test($('#iv-toast') ? $('#iv-toast').textContent : ''), 'mensagem visível de gemas insuficientes');
  console.log('  x10 debita de verdade; insuficiente bloqueia com aviso, pity/estado/persistência intactos');
}

console.log('== 7. crédito DEV credita o perfil, MARCA (perfil.dev) e mostra o indicador ==');
{
  const antes = w.eval('perfil.moedas.gema');   // 150
  w.eval('INV.topup()');
  ok(w.eval('perfil.moedas.gema') === antes + w.eval('ECONOMIA.grantTeste.gema'), 'DEV creditou o perfil de verdade');
  ok(w.eval('!!(perfil.dev && perfil.dev.creditosTeste === ECONOMIA.grantTeste.gema)'), 'perfil marcado como contaminado (perfil.dev)');
  ok($('#iv-devmark') && $('#iv-devmark').style.display !== 'none', 'indicador ⚠ DEV visível enquanto o perfil está marcado');
  const h = w.eval('JSON.parse(localStorage.getItem("incursion:historico")||"[]")');
  ok(h.some(e => e.tipo === 'dev-credito'), 'histórico tem entrada de tipo próprio "dev-credito" (nunca confundível com jogo)');
  console.log('  DEV credita + marca perfil + acende indicador + loga dev-credito');
}

console.log('== 8. §302 UMA invocação: um pity, uma moeda, um histórico; iniciante é oferta única ==');
{
  // (a) o DADO pressupõe estado único, não banners paralelos: perfil.invocacao é {total, desdeUltimoSS},
  //     sem um mapa de pity por banner. Se alguém reintroduzir pity-por-banner no perfil, isto quebra.
  const chaves = w.eval('JSON.stringify(Object.keys(perfil.invocacao).sort())');
  ok(chaves === '["desdeUltimoSS","total"]', `perfil.invocacao é UM contador único (chaves ${chaves})`);
  ok(w.eval('typeof perfil.moedas.gema') === 'number', 'UMA moeda de invocação (perfil.moedas.gema)');
  ok(w.eval('Array.isArray(JSON.parse(localStorage.getItem("incursion:historico")||"[]"))'), 'UM histórico (log único)');
  // (b) os banners paralelos saíram: nada de trocar de banner (setBanner) nem abas; sobrou UMA invocação
  //     com o deus em evidência (a feat renderiza). BANNERS é privado do INV — a prova é a superfície.
  ok(w.eval('typeof INV.setBanner') === 'undefined' && !$('#iv-tabs'), 'sem troca de banner: setBanner e abas fora');
  ok($$('#iv .iv-feat .iv-carta').length >= 1, 'sobrou a invocação única, com o deus em evidência');
  // (c) a oferta do iniciante é UMA vez e alimenta o MESMO contador (a garantia repõe um SS → pity baixo).
  w.eval('perfil=creditarDev(perfil,"gema",0,0)');   // garante perfil presente (já está)
  const usadaAntes = w.eval('(function(){var b=document.querySelector(".iv-oferta");return !!b;})()');
  ok(usadaAntes, 'a oferta aparece enquanto não usada');
  w.eval('INV.claimIniciante()');
  const temSS = w.eval('perfil.deuses && Object.values(perfil.deuses).length>0');
  ok(temSS, 'a Bênção do Iniciante entregou deuses (10× com SS garantido)');
  ok(w.eval('typeof perfil.invocacao.desdeUltimoSS') === 'number', 'o iniciante escreveu o MESMO contador de pity único');
  w.eval('INV.closeReveal(); render()');
  ok(!w.eval('(function(){return !!document.querySelector(".iv-oferta");})()'), 'usada uma vez, a oferta some (não vira aba nem repete)');
  console.log('  um pity/uma moeda/um histórico · sem "padrao" · iniciante é oferta única no mesmo contador');
}

console.log('');
console.log(falhas === 0 ? '>>> INVOCAÇÃO OK' : `>>> ${falhas} FALHA(S)`);
process.exit(falhas ? 1 : 0);
