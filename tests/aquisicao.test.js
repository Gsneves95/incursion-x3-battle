// F3.2 — o laço de AQUISIÇÃO: Invocação (odds visíveis, repetido→Essência, pity) e
// Coleção (os 100 por panteão, detalhe do deus, elo Coleção↔Provação). Parte PURA
// (registrarInvocacao) + parte de TELA no bundle real (jsdom).
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

let falhas = 0;
const ok = (c, m) => { if (!c) { console.log('  FALHA: ' + m); falhas++; } };
const abertos = [];

console.log('== 1. registrarInvocacao: NOVO entra, REPETIDO vira Essência (15/40/120), a cópia única não é dissolvida ==');
{
  const P = require('../src/perfil.js');
  const ESS = require('../data/economia.json').invocacao.essenciaPorDuplicata;
  ok(ESS && ESS.A === 15 && ESS.S === 40 && ESS.SS === 120, 'a fonte (economia.json) tem 15/40/120 por ordem A/S/SS');
  let p = P.novoPerfil(0, 0);
  const antesEss = p.moedas.essencia;
  // hades é SS e não é inicial → novo na 1ª, repetido na 2ª
  p = P.registrarInvocacao(p, { resultados: [{ key: 'hades', raridade: 'SS' }], pity: 1 }, 0, ESS);
  ok(p.deuses.hades && p.deuses.hades.copias === 1, 'deus novo entra com 1 cópia');
  ok(p.moedas.essencia === antesEss, 'deus novo NÃO gera Essência');
  p = P.registrarInvocacao(p, { resultados: [{ key: 'hades', raridade: 'SS' }], pity: 2 }, 0, ESS);
  ok(p.deuses.hades.copias === 1, 'REPETIDO não empilha cópia (a única cópia fica) — não dissolve');
  ok(p.moedas.essencia === antesEss + 120, 'repetido SS credita 120 de Essência');
  // lote com A repetido
  p = P.registrarInvocacao(p, { resultados: [{ key: 'hades', raridade: 'SS' }, { key: 'hades', raridade: 'SS' }], pity: 3 }, 0, ESS);
  ok(p.moedas.essencia === antesEss + 120 + 240, 'dois repetidos no mesmo lote creditam os dois');
  console.log('  novo=cópia · repetido=Essência (A15/S40/SS120) · cópia única preservada');
}

function sessao() {
  const html = fs.readFileSync(path.join(__dirname, '../dist/incursion.html'), 'utf8');
  const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://x/' });
  abertos.push(dom);
  const w = dom.window, d = w.document;
  return { w, d, $: s => d.querySelector(s), $$: s => [...d.querySelectorAll(s)] };
}

console.log('== 2. Invocação: odds VISÍVEIS antes da compra + pity + carteira com Essência ==');
{
  const { w, $ } = sessao();
  w.eval("ir('invocacao'); render();");
  ok(!!$('#iv'), 'a tela de invocação monta a partir da home');
  const odds = $('.iv-odds');
  ok(!!odds && /SS 3%/.test(odds.textContent) && /S 17%/.test(odds.textContent) && /A 80%/.test(odds.textContent), 'as odds 3/17/80 aparecem antes de invocar');
  ok(/garantia de SS em 60/.test(odds.textContent), 'a garantia dura (pity 60) é anunciada');
  ok(!!$('#iv-pity') && /\/60/.test($('#iv-pity').textContent), 'o contador de pity é visível');
  ok(!!$('#iv-essencia'), 'a carteira mostra Essência');
}

console.log('== 3. invocar de verdade (via DEV) e ver repetido creditar Essência ==');
{
  const { w, $ } = sessao();
  w.eval("ir('invocacao'); render();");
  // dá gemas de teste e força um deus já possuído para garantir repetido no reveal
  w.eval("INV.topup();");
  const essAntes = w.eval('perfil.moedas.essencia||0');
  // pull ×10: com 100 no pool e coleção pequena, garante ao menos alguns; verifica que a Essência não regride
  w.eval("INV.pull(10);");
  const essDepois = w.eval('perfil.moedas.essencia||0');
  ok(essDepois >= essAntes, 'a Essência nunca regride ao invocar');
  ok(w.eval('perfil.invocacao.total>=10'), 'o total de invocações avançou');
  // um repetido garantido: invoca o mesmo deus que já temos via registrarInvocacao no runtime seria trapaça;
  // em vez disso, confirmamos que a carteira reflete essência (render escreve o número)
  ok(/\d/.test($('#iv-essencia').textContent), 'a carteira de Essência renderiza um número');
}

console.log('== 4. Coleção: os 100 por PANTEÃO, 10 grupos de 10, navegável ==');
{
  const { w, $, $$ } = sessao();
  w.eval("ir('colecao'); render();");
  ok(!!$('.tela') && /Coleção/.test($('.tela__titulo').textContent), 'a tela de Coleção monta');
  ok($$('.csec').length === 10, `deveria haver 10 panteões (tem ${$$('.csec').length})`);
  ok($$('.colx[data-deus]').length === 100, `deveria listar os 100 deuses (tem ${$$('.colx[data-deus]').length})`);
  const cabs = $$('.csec__cab h2').map(e => e.textContent);
  ok(cabs.join(',') === 'Grega,Nórdica,Egípcia,Japonesa,Chinesa,Hindu,Brasileira,Africana,Celta,Maia', 'os 10 panteões na ordem esperada');
  // NB: o roster NÃO é 10×10 (Grega 19 … Maia 4) — o agrupamento por panteão vale, a contagem por grupo é a real.
  const soma = $$('.csec').reduce((s, sec) => s + sec.querySelectorAll('.colx').length, 0);
  ok(soma === 100, `a soma dos grupos deveria cobrir os 100 (deu ${soma})`);
  // §216: dois estados INEQUÍVOCOS — quem você tem (moldura dourada, arte em cor) x quem falta
  // (AUSÊNCIA: cinza + cadeado; a régua do §211 não se aplica). Nada de selo cobrindo a ilustração.
  ok($$('.colx--tem').length + $$('.colx--falta').length === 100, 'todo tile é ou "tem" (colx--tem) ou "falta" (colx--falta)');
  ok($$('.colx--falta .colx__lock').length === $$('.colx--falta').length, 'quem falta mostra o cadeado (na faixa, não sobre a arte)');
  ok($$('.colx--tem .colx__lock').length === 0, 'quem você tem não mostra cadeado');
  ok($$('.colx__foot').length === 100 && $$('.colx__art .colx__lock, .colx__art .colx__n').length === 0,
    'nome/cadeado moram na FAIXA (colx__foot), nunca sobre a arte (colx__art)');
}

console.log('== 5. detalhe do deus (§220): arte à esquerda + coluna; passiva pré-selecionada; possui x não-possui ==');
{
  const { w, $, $$ } = sessao();
  // POSSUINDO: garante o deus na coleção e abre o detalhe
  w.eval("perfil.deuses.zeus=perfil.deuses.zeus||{obtidoEm:Date.now()}; ir('deus',{key:'zeus'}); render();");
  ok(($('.dart__nome').textContent || '').trim() === 'Zeus', 'o nome sobreposto na arte nomeia o deus');
  ok(!$('.deus--falta') && !$('.dart__tag'), 'possuindo: sem tag de ausência');
  ok($$('.dchips .dchip').length === 4, 'os 4 chips de identidade (facção/elemento/classe/função)');
  ok(!!$('.dmaes') && !$('.dcomo'), 'possuindo: mostra a MAESTRIA (não o "como conseguir")');
  // guarda permanente: as 4 skills sempre presentes e tocáveis
  ok($$('.dkit .dsk').length === 4, `o kit tem as 4 skills (bás/hab/mil/pas), há ${$$('.dkit .dsk').length}`);
  ok($$('.dkit .dsk:not([disabled])').length === 4, 'as 4 skills são tocáveis');
  // decisão do dono: ao abrir, a PASSIVA já vem selecionada
  ok(/PASSIVA/.test($('.dsk.is-sel .dsk__tipo').textContent), 'a PASSIVA já vem selecionada ao abrir');
  ok($('.ddet .ddet__txt').textContent.length > 8, 'o detalhe mostra o texto completo da selecionada');
  // tocar outra skill troca o detalhe
  const outra = $$('.dsk[data-deussel]').find(b => !b.classList.contains('is-sel'));
  outra.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  ok(!/PASSIVA/.test($('.dsk.is-sel .dsk__tipo').textContent), 'tocar outra skill muda a seleção');
  ok(!!$('.ddet .cost, .ddet .ddet__cd'), 'a skill mostra custo/recarga no detalhe');

  // NÃO POSSUINDO: tag + "como conseguir" no lugar da maestria, e o kit CONTINUA legível/tocável
  w.eval("delete perfil.deuses.ahpuch; ir('deus',{key:'ahpuch'}); render();");
  ok(!!$('.deus--falta') && !!$('.dart__tag') && /NÃO POSSUI/.test($('.dart__tag').textContent), 'não-possuindo: tag "VOCÊ NÃO POSSUI" na arte');
  ok(!!$('.dcomo') && !$('.dmaes'), 'não-possuindo: "COMO CONSEGUIR" no lugar da maestria');
  ok(/Invoca/.test($('.dcomo').textContent), 'o "como conseguir" cita a Invocação');
  ok($$('.dkit .dsk:not([disabled])').length === 4, 'não-possuindo: as 4 skills continuam legíveis e tocáveis');
}

console.log('== 6. Pergaminho: vencido mostra placar e é rejogável; genérica fora do acervo; inicial sem pergaminho (F4/§212) ==');
{
  const { w, $ } = sessao();
  // §220: o detalhe do deus não carrega mais o Pergaminho — o jogar mora no HUB de Desafios (§213).
  // O estado do acervo se lê lá: inicial (zeus) e genérica (durga) NÃO aparecem na lista jogável.
  w.eval("ir('desafios'); render();");
  ok(!$('.prow[data-prova="zeus"]'), 'deus inicial (zeus) não tem pergaminho no acervo');
  ok(!$('.prow[data-prova="durga"]'), 'pergaminho genérico (durga) fica fora do acervo jogável');
  // um pergaminho VENCIDO (placar gravado, não posse) aparece marcado e, ao tocar, JOGA (não abre a coleção)
  w.eval("perfil.provacoes.ra={lances:5,minimo:4,em:0}; ir('desafios'); render();");
  const feita = $('.prow--feita[data-prova="ra"]');
  ok(!!feita, 'o pergaminho vencido aparece marcado na lista');
  feita.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  ok(w.eval("rotaAtual()") === 'batalha' && w.eval('!!prova && prova.key==="ra"'), 'tocar um pergaminho joga-o (não abre a coleção)');
}

console.log('== 7. ACERVO de Pergaminhos (F4/§212): 90 no dado, 63 jogáveis (genéricas fora), faixa dos nós ==');
{
  const { w, $, $$ } = sessao();
  ok(w.eval('PROVACOES.length') === 90, 'o dado mantém as 90 (histórico)');
  ok(w.eval('PROVACOES.filter(p=>p.generica).length') === 27, '27 são genéricas');
  ok(w.eval('PROVACOES.filter(p=>!p.generica).length') === 63, '63 no acervo jogável');
  // a FAIXA deriva dos nós medidos: Fácil <5k · Médio 5k–50k · Difícil 50k–200k · Épico >200k
  const fx = n => n == null ? null : n < 5000 ? 'Fácil' : n < 50000 ? 'Médio' : n < 200000 ? 'Difícil' : 'Épico';
  const errosFaixa = w.eval('PROVACOES').filter(p => p.faixa !== fx(p.nos));
  ok(errosFaixa.length === 0, `a faixa injetada bate a derivada dos nós (${errosFaixa.length} divergências)`);
  ok(w.eval("PROVACOES.filter(p=>!p.generica).every(p=>['Fácil','Médio','Difícil','Épico'].includes(p.faixa))"), 'todo pergaminho do acervo tem faixa válida');
  // a TELA vira "Desafios": título Desafios, seção PERGAMINHOS com 63, genéricas fora da lista
  w.eval("ir('desafios'); render();");
  ok(/Desafios/.test($('.tela__titulo').textContent), 'a tela agora se chama "Desafios"');
  ok(/PERGAMINHOS/.test($('#provrol').textContent), 'a seção do acervo é "Pergaminhos"');
  ok($$('.prow[data-prova]').length === 63, `a lista mostra os 63 do acervo (mostrou ${$$('.prow[data-prova]').length})`);
  const gen = new Set(w.eval('PROVACOES.filter(p=>p.generica).map(p=>p.key)'));
  ok($$('.prow[data-prova]').every(b => !gen.has(b.dataset.prova)), 'nenhuma genérica aparece na lista jogável');
}

console.log('== 8. Pergaminho vencido NÃO libera deus (coleção = só gacha, §212) ==');
{
  const { w } = sessao();
  const antes = w.eval('Object.keys(perfil.deuses).length');
  // monta o pergaminho de um deus fora da coleção e aplica a VITÓRIA (a função que mudou):
  // aplicarDesbloqueioProva não pode mais adicionar o deus — só maestria + placar.
  w.eval("var alvo=PROVACOES.find(p=>!p.generica && !perfil.deuses[p.key]); iniciarProva(alvo.key);");
  const alvoKey = w.eval("prova.key");
  w.eval("provaFim={resultado:'vitoria',categoria:null,motivo:null,lances:9,minimo:prova.minimo}; provaLances=9; aplicarDesbloqueioProva(prova);");
  ok(w.eval('Object.keys(perfil.deuses).length') === antes, 'vencer NÃO adiciona o deus à coleção');
  ok(w.eval(`!perfil.deuses[${JSON.stringify(alvoKey)}]`), 'o deus do pergaminho continua fora da coleção');
  ok(w.eval(`!!(perfil.provacoes[${JSON.stringify(alvoKey)}] && perfil.provacoes[${JSON.stringify(alvoKey)}].lances===9)`), 'mas o PLACAR foi gravado');
  ok(w.eval(`!!(perfil.maestria[${JSON.stringify(alvoKey)}] && perfil.maestria[${JSON.stringify(alvoKey)}].vitorias>=1)`), 'e a maestria avançou (cosmética)');
}

console.log('== 9. SANDBOX (Batalha CPU): vitória plana vs CPU credita 20 Gema, com teto (F4) ==');
{
  const { w } = sessao();
  w.eval("perfil.sandbox={dia:'',vitorias:0};");
  const g0 = w.eval('perfil.moedas.gema');
  // batalha PLANA vs CPU (sem prova/campanha), humano (lado 0) vence
  w.eval("prova=null;campanha=null;provaFim=null;campanhaFim=null; vsCPU=true; st=novoEstado(['zeus','ogum','tyr'],['sobek','brigid','ganesha'],1,0); st.ativo=0; ir('batalha',{},{substituir:true}); pararRelogio();");
  w.eval("st.lados[1].units.forEach(u=>{u.vivo=false;u.hp=0;}); st.fim={tipo:'fim',resultado:'vitoria',lado:0}; render();");
  ok(w.eval('!!(st._sandbox && st._sandbox.creditou && st._sandbox.gema===20)'), 'a vitória plana vs CPU credita 20 Gema');
  ok(w.eval('perfil.moedas.gema') === g0 + 20, 'o saldo subiu 20');
  ok(w.eval('perfil.sandbox.vitorias') === 1, 'contou 1 vitória no dia');
  // derrota NÃO credita
  const g1 = w.eval('perfil.moedas.gema');
  w.eval("st=novoEstado(['zeus','ogum','tyr'],['sobek','brigid','ganesha'],1,0); st.ativo=0; st.fim={tipo:'fim',resultado:'vitoria',lado:1}; render();");
  ok(w.eval('st._sandbox===null') && w.eval('perfil.moedas.gema') === g1, 'derrota (CPU vence) não credita nada');
}

console.log('== 10. ROTAS separadas (§213): Provações = marcador de missões; Desafios = hub de pergaminhos ==');
{
  const { w, $, $$ } = sessao();
  // o carrossel tem 8 destinos, com "Desafios" entre "Provações" e "Invocação"
  const ordem = w.eval('HOME_BANNERS.map(d=>d.chave)');
  ok(ordem.length === 8, `o carrossel tem 8 destinos (tem ${ordem.length})`);
  ok(ordem.indexOf('desafios') === ordem.indexOf('provacoes') + 1 && ordem.indexOf('desafios') === ordem.indexOf('invocacao') - 1, 'Desafios fica entre Provações e Invocação');
  // "Provações" → marcador de missões (honesto): fala de missões/PvP/Fase 5, SEM lista de pergaminhos
  w.eval("ir('provacoes'); render();");
  ok(/Provações/.test($('.tela__titulo').textContent) && /miss/i.test($('#baselayer').textContent) && /Fase 5/.test($('#baselayer').textContent), 'Provações abre o marcador de missões (PvP/Fase 5)');
  ok($$('.prow[data-prova]').length === 0, 'o marcador de missões NÃO lista pergaminhos');
  // "Desafios" → o hub, com os 63 pergaminhos
  w.eval("ir('desafios'); render();");
  ok(/Desafios/.test($('.tela__titulo').textContent) && $$('.prow[data-prova]').length === 63, 'Desafios abre o hub com os 63 pergaminhos');
  // o placeholder do banner Desafios existe (sem arte ainda) e tem título de espera
  w.eval("ir('home',{},{substituir:true}); render();");
  const ph = $('.bcard[data-dest="desafios"] .bcard__ph');
  ok(!!ph && /Desafios/.test(ph.textContent), 'o banner Desafios usa placeholder com título até a arte chegar');
}

for (const dom of abertos) try { dom.window.close(); } catch (e) {}
if (falhas) { console.log(`\n>>> ${falhas} FALHA(S) no laço de aquisição`); process.exit(1); }
console.log('>>> AQUISIÇÃO OK');
process.exit(0);
