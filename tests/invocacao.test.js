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
  // §304: layout do mockup — o deus em destaque é nome (Cinzel) + arquétipo + selo grande; cartas só na revelação.
  ok(!!$('.iv-hero__nome') && $('.iv-hero__nome').textContent.trim().length > 0, 'o NOME do deus em destaque renderiza (coluna herói)');
  ok(!$('.iv-hero__arq'), '§304b: o EPÍTETO (arquétipo) NÃO aparece na tela de cerimônia — o nome + selo bastam');
  ok(!!$('.iv-hero__selo'), 'o SELO grande (§303) renderiza no herói');
  ok(!!$('.iv-oferta'), 'a Bênção do Iniciante aparece como OFERTA única inline (não aba)');
  ok(/\/60/.test($('#iv-pity').textContent), 'o pity de SS (/60) deveria aparecer');
  ok(!!$('.iv-pb.iv-x1') && !!$('.iv-pb.iv-x10'), 'os dois botões de invocar (×1 e ×10)');
  console.log(`  montou · sem abas · herói ${$('.iv-hero__nome').textContent.trim()} · pity /60 · dois botões · oferta inline`);
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
  ok(!!$('.iv-hero__nome'), 'sobrou a invocação única, com o deus em evidência (coluna herói)');
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

console.log('== 12. §304 tela pelo mockup: preço do DADO, frase some, fundo/arte do dado, pity do perfil ==');
{
  // re-monta a invocação limpa para ler o estado do banner
  w.eval("ir('invocacao',{},{substituir:true}); INV.montar();");
  // (1) PREÇO vem do DADO (economia.json), nunca escrito no código: o botão mostra o valor de ECONOMIA,
  //     e invocacao.js não tem literal de preço. Babá: troque o custo no economia e o botão muda; hard-code e cai.
  const c1 = String(w.eval('ECONOMIA.invocacao.custo.avulso'));
  const c10 = w.eval('ECONOMIA.invocacao.custo.pacote10').toLocaleString('pt-BR');
  ok($('.iv-pb.iv-x1').textContent.includes(c1), `×1 mostra o custo do dado (${c1})`);
  ok($('.iv-pb.iv-x10').textContent.includes(c10), `×10 mostra o custo do dado (${c10})`);
  const fonteInv = fs.readFileSync(require('path').join(__dirname, '../src/invocacao.js'), 'utf8');
  // o preço vem de ECONOMIA.invocacao.custo (dado), tanto no botão quanto na cobrança do pull — nunca um literal.
  ok(/ECONOMIA\.invocacao\.custo\.avulso/.test(fonteInv) && /ECONOMIA\.invocacao\.custo\.pacote10/.test(fonteInv),
    'os botões leem o custo de ECONOMIA.invocacao.custo (dado), não de um literal');
  ok(!/custo\s*[:=]\s*\d/.test(fonteInv) && !/cost\s*=\s*(150|1350)\b/.test(fonteInv), 'nenhum custo numérico escrito à mão em invocacao.js');
  ok(/10% OFF/.test($('.iv-pb.iv-x10').textContent), 'o selo 10% OFF fica no ×10 (o pacote de dez), não no ×1');
  // (2) §304b: a FRASE é conteúdo do DESTAQUE (INVOCACAO.destaque.frase), não do elenco. Testa o MECANISMO some/aparece,
  //     independente do valor atual do dado (o dono pode ter escrito a do destaque da vez): força vazio, depois cheio.
  w.eval("INVOCACAO.destaque._frase=INVOCACAO.destaque.frase; INVOCACAO.destaque.frase=undefined; INV.render();");
  ok(!$('.iv-hero__cite'), 'sem frase no destaque, a linha de citação SOME (nada renderiza)');
  w.eval("INVOCACAO.destaque.frase='O céu obedece.'; INV.render();");
  ok(!!$('.iv-hero__cite') && /O céu obedece/.test($('.iv-hero__cite').textContent), 'com frase no destaque, a linha aparece (a tela É a casa da frase)');
  w.eval("INVOCACAO.destaque.frase=INVOCACAO.destaque._frase; delete INVOCACAO.destaque._frase; INV.render();");
  // (3) §304b: nada de epíteto/arquétipo nem de "Pai dos Deuses" nesta tela
  ok(!$('.iv-hero__arq'), 'sem linha de epíteto/arquétipo na tela de invocação (§304b)');
  ok(!/pai dos deuses/i.test($('#iv').textContent), 'nada de "Pai dos Deuses" (rótulo da referência que não existe no jogo)');
  // (4) FUNDO e ARTE vêm do DADO, com placeholder sem 404: presente → url externo; a config é do banner (INVOCACAO)
  const fundoBg = $('#iv-fundo').style.backgroundImage;
  ok(w.eval('!!(INVOC_FUNDO && INVOC_FUNDO[INVOCACAO.destaque.fundo])') ? /banners\/invocacao\//.test(fundoBg) : $('#iv-fundo').classList.contains('iv-fundo--ph'),
    'o fundo vem do dado (arquivo externo presente) OU cai no placeholder sem 404');
  ok(w.eval('typeof INVOCACAO!=="undefined" && !!INVOCACAO.destaque.deus'), 'o deus em destaque é DADO (INVOCACAO.destaque.deus)');
  // §304d: arte do destaque em CASCATA (nome derivado da chave, sem campo novo): banner web/invocacao/<deus>.webp →
  // retrato §289 (reserva) → placeholder. Nunca 404, nunca base64.
  const arteBg = $('#iv-arte').style.backgroundImage;
  const temBanner = w.eval('!!(INVOC_ARTE && INVOC_ARTE[INVOCACAO.destaque.deus])');
  const temRetrato = w.eval('!!(RETRATO_ARTE && RETRATO_ARTE[INVOCACAO.destaque.deus])');
  ok(temBanner ? /invocacao\//.test(arteBg) : (temRetrato ? /retratos\//.test(arteBg) : $('#iv-arte').classList.contains('iv-arte--ph')),
    '§304d: arte do destaque em cascata — banner → retrato §289 → placeholder (sem 404)');
  ok(!temBanner || $('#iv-arte').classList.contains('iv-arte--banner'), '§304d: com arte de banner, a caixa alarga (proporção da arte, não do retrato)');
  // (5) o pity MOSTRADO é o do perfil; o TETO é o do economia
  w.eval('perfil.invocacao.desdeUltimoSS=13; INV.montar();');
  const teto = String(w.eval('ECONOMIA.invocacao.pity.duro'));
  ok(new RegExp('13\\/' + teto).test($('#iv-pity').textContent), `o pity mostrado é o do perfil (13) sobre o teto do economia (${teto})`);
  console.log('  preço do dado · frase some/aparece · arquétipo do dado · fundo/arte do dado+placeholder · pity do perfil/teto do economia');
}

console.log('== 13. §304c: a figura ENCOSTA na coluna e a borda dura fica FUNDIDA (não volta o retângulo colado) ==');
{
  // babá de fonte (o jsdom não pinta máscara): a .iv-arte tem de manter a FUSÃO (máscara de degradê) e o encaixe de
  // pôster (proporção travada + adjacente à coluna). Se uma sessão futura tirar a máscara, o retângulo colado volta.
  const shell = fs.readFileSync(require('path').join(__dirname, '../src/shell.html'), 'utf8');
  const bloco = (shell.match(/#iv \.iv-arte\{[^}]*\}/) || [''])[0];
  ok(/mask-image:linear-gradient/.test(bloco) && /mask-composite:intersect/.test(bloco), '§304c: a .iv-arte funde as bordas (máscara de degradê nas 4 bordas) — o retângulo não volta');
  ok(/aspect-ratio:512\/590/.test(bloco), '§304c: a caixa é travada na proporção do retrato (a máscara casa com a borda real da arte)');
  ok(/left:31%/.test(bloco) && !/right:0/.test(bloco), '§304c: a figura encosta na coluna (não mais colada na borda direita)');
  console.log('  figura adjacente à coluna (left:31%) + bordas fundidas (máscara 4 bordas, proporção travada)');
}

console.log('');
console.log(falhas === 0 ? '>>> INVOCAÇÃO OK' : `>>> ${falhas} FALHA(S)`);
process.exit(falhas ? 1 : 0);
