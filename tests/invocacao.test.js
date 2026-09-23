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
  // §303: com os 3 webp presentes (SELOS_ARTE=1 no dist), a raridade na revelação vira ARTE (emblema),
  // não a letra SVG — cada carta mostra 1 selo-imagem e ZERO letra .iv-raridade (sem letra dupla).
  ok($$('#iv-cards image[href*="selos/seal-"]').length === 10, 'cada carta mostra o selo cerimonial (arte), 10 imagens');
  ok($$('#iv-cards .iv-raridade').length === 0, 'nenhuma letra SVG de raridade (o emblema já traz a letra — sem dupla)');
  ok(/Total <b>10<\/b>/.test($('#iv-tally').innerHTML) || /Total\s*10/.test($('#iv-tally').textContent), 'o total deveria ir a 10');
  console.log(`  10 cartas · zero estrelas · selo cerimonial por arte · total 10`);
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

console.log('== 9. §302 TRAVA: o pity CONTINUA quando o destaque troca — nunca zera (contra §20) ==');
{
  // Decisão do dono (§302): o pity é UM contador único, agnóstico de qual deus está em evidência. Trocar o
  // destaque (ou re-entrar na tela) NÃO pode zerá-lo — seria um reset que o jogador não causou nem vê. Uma
  // "troca de destaque" é, na prática, um re-render/re-montar da tela lendo o MESMO perfil.invocacao.desdeUltimoSS.
  // Babá: se uma sessão futura "consertar" achando que cada banner tem contador próprio (zerar ao montar, ou
  // ler um pity keyed por deus), o pity remontado deixa de bater com o do perfil e este teste QUEBRA.
  w.eval('perfil.invocacao.desdeUltimoSS = 37; if(typeof salvar==="function") salvar(perfil);');
  w.eval('INV.montar()');   // re-monta a tela (equivale a re-entrar com outro destaque)
  ok(/37\/60/.test($('#iv-pity').textContent), `o pity remontado continua 37/60 (veio "${($('#iv-pity').textContent||'').trim().replace(/\s+/g,' ')}") — não zerou`);
  ok(w.eval('perfil.invocacao.desdeUltimoSS') === 37, 'o contador do perfil segue 37 após remontar (a tela lê, não reseta)');
  // e não há contador de pity keyed por deus/banner no perfil — só o único desdeUltimoSS
  ok(w.eval('JSON.stringify(Object.keys(perfil.invocacao).sort())') === '["desdeUltimoSS","total"]', 'segue UM só contador (nenhum pity por deus/banner brotou)');
  console.log('  pity continua ao remontar/trocar destaque (37/60), lido do contador único — nunca reseta');
}

console.log('== 10. §303 destino: a arte SÓ na revelação; selos pequenos como hoje; fallback e pacote ==');
{
  // (c) os SELOS PEQUENOS ficam como hoje MESMO com os 3 arquivos presentes: a classe-raiz .selo-arte NÃO entra,
  //     e o selo da grade mostra a LETRA (texto), sem imagem de selo. Babá: se alguém religar a composição pequena,
  //     a classe volta ou aparece uma seal-image na grade — e isto quebra.
  ok(!d.documentElement.classList.contains('selo-arte'), 'a classe-raiz .selo-arte NÃO existe (composição pequena removida)');
  w.eval("Object.keys(GODS).forEach(k=>{perfil.deuses[k]=perfil.deuses[k]||{obtidoEm:Date.now(),copias:1}}); ir('colecao',{},{substituir:true}); if(typeof colSel!=='undefined')colSel=null; render();");
  const selos = $$('.col2c__rar');
  ok(selos.length > 0 && selos.every(s => /^(SS|S|A)$/.test(s.textContent.trim())), 'o selo da grade segue LETRA (texto), com os 3 arquivos presentes');
  ok($$('.col2c__rar image, .col2c__rar [style*="selos/"]').length === 0, 'nenhuma arte de selo entrou na grade');
  // (d) pacote: os 3 selos são EXTERNOS (href selos/…), nunca base64. Prova na FONTE (o dist é uma linha só):
  //     nenhuma linha da invocacao.js que fala de selo carrega um data: URI, e a revelação usa href externo.
  const fonteInv = fs.readFileSync(require('path').join(__dirname, '../src/invocacao.js'), 'utf8');
  const linhasSelo = fonteInv.split('\n').filter(l => /seal-|selos\//.test(l));
  ok(linhasSelo.length > 0 && linhasSelo.every(l => !/data:/i.test(l)), 'os selos são referência externa, nunca data:/base64 (pacote não incha)');
  ok(/href="selos\/seal-/.test(html), 'a revelação referencia selos/seal-*.webp como arquivo externo');
  console.log('  arte só na revelação · grade letra-só com arquivos presentes · selos externos, sem base64');
}

console.log('== 11. §303 fallback: sem os 3 arquivos, a revelação cai no selo-letra SVG (sem 404) ==');
{
  const { JSDOM } = require('jsdom');
  const html0 = html.replace(/const SELOS_ARTE=[01]/, 'const SELOS_ARTE=0');
  const dom0 = new JSDOM(html0, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://x/' });
  const w0 = dom0.window, d0 = w0.document;
  w0.eval("ir('invocacao');INV.montar();INV.topup();INV.topup();INV.pull(1)");
  ok(d0.querySelectorAll('#iv-cards image[href*="selos/seal-"]').length === 0, 'sem arquivos: NENHUMA imagem de selo (sem 404)');
  ok(d0.querySelectorAll('#iv-cards .iv-raridade').length >= 1, 'sem arquivos: a revelação usa o selo-letra SVG de hoje');
  console.log('  SELOS_ARTE=0 → revelação usa o SVG-letra, nenhuma imagem requisitada');
}

console.log('');
console.log(falhas === 0 ? '>>> INVOCAÇÃO OK' : `>>> ${falhas} FALHA(S)`);
process.exit(falhas ? 1 : 0);
