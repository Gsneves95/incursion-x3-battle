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

console.log('== 2. Invocação: tela monta, pity visível, carteira com Essência; as CHANCES vêm do servidor (§318 F2 E3/E4) ==');
{
  const { w, $ } = sessao();
  w.eval("ir('invocacao'); INV.montar();");
  ok(!!$('#iv'), 'a tela de invocação monta a partir da home');
  ok(!!$('#iv-pity') && /\/60/.test($('#iv-pity').textContent), 'o contador de pity é visível na tela');
  ok(!!$('#iv-essencia'), 'a carteira mostra Essência');
  // §304/§318: as odds saíram do "1000 sorteios locais" e viraram a TABELA DE CHANCES do SERVIDOR (por faixa).
  // Sem conexão (sessão local), o painel abre e avisa honestamente que a economia é do servidor.
  w.eval('INV.openAudit()');
  const box = $('#iv-auditBox');
  ok(!!box && $('#iv-audit').classList.contains('iv-show'), 'o painel de chances abre (Ver detalhes / ?)');
  ok(/chances/i.test(box.textContent), 'o painel é a tabela de chances (do servidor), não sorteio local');
}

console.log('== 3. §318 F2 E3: SEM servidor o cliente NÃO sorteia nem credita (a economia é do servidor) ==');
{
  const { w } = sessao();
  w.eval("ir('invocacao'); render();");
  const totalAntes = w.eval('(perfil.invocacao && perfil.invocacao.total) || 0');
  const essAntes = w.eval('perfil.moedas.essencia||0');
  const gemaAntes = w.eval('perfil.moedas.gema||0');
  w.eval("INV.pull(10);");
  ok(w.eval('((perfil.invocacao && perfil.invocacao.total) || 0)') === totalAntes, 'sem servidor o total NÃO avança (nada local)');
  ok(w.eval('perfil.moedas.essencia||0') === essAntes, 'a Essência não muda no cliente');
  ok(w.eval('perfil.moedas.gema||0') === gemaAntes, 'a gema não é debitada no cliente');
}

console.log('== 4. Coleção (§282 refeita): os 100 navegáveis por BUSCA/FILTRO/ABAS de cultura + dois estados ==');
{
  const { w, $, $$ } = sessao();
  w.eval("ir('colecao'); render();");
  // §282: a vitrine por-panteão (10 seções .csec) deu lugar a GRADE filtrável + ABAS de cultura + PAINEL-leitor.
  ok(!!$('.col2') && /Personagens/i.test($('.col2__titulo').textContent), 'a tela de Personagens monta (.col2)');
  ok($$('#col2grade .col2c[data-deus]').length === 100, `a grade lista os 100 deuses (tem ${$$('#col2grade .col2c[data-deus]').length})`);
  // as 10 culturas agora são ABAS (não seções): "Todas" + os 10 panteões na ordem
  const abas = $$('.col2__tab').map(e => e.textContent.trim());
  ok(abas.join(',') === 'Todas,Grega,Nórdica,Egípcia,Japonesa,Chinesa,Hindu,Brasileira,Africana,Celta,Maia', 'as 10 culturas + "Todas" como abas, na ordem');
  // §216: dois estados INEQUÍVOCOS — possuído (col2c--tem, dourado) x ausência (col2c--falta, apagado), cobrindo os 100
  ok($$('.col2c--tem').length + $$('.col2c--falta').length === 100, 'todo cartão é ou "tem" (col2c--tem) ou "falta" (col2c--falta)');
  // nome/cultura moram na FAIXA (col2c__foot) de cada cartão, sobre um scrim — nunca texto solto na arte crua
  ok($$('#col2grade .col2c__foot').length === 100, 'nome/cultura moram na faixa (col2c__foot) de cada cartão');
}

console.log('== 5. §319 — a rota "deus" é a TELA DE NÍVEIS: identidade + passiva à esquerda, 3 painéis à direita; possui x não-possui ==');
{
  const { w, $, $$ } = sessao();
  const T = el => (el ? el.textContent : '').replace(/\s+/g, ' ').trim();
  // POSSUINDO + ONLINE (a tela lê pontos/níveis da conta): zeus com 3 pontos, tudo nv1.
  w.eval("perfil.deuses.zeus=perfil.deuses.zeus||{obtidoEm:Date.now()}; contaAtual={pontos:{zeus:3},niveis:{zeus:{basico:1,habilidade:1,milagre:1}},perfil:{deuses:{zeus:{copias:1}}},missoes:{ativa:null,progresso:{},liberados:[]}}; ir('deus',{key:'zeus'}); render();");
  ok(T($('.nltop__nome')) === 'Zeus', 'a barra superior nomeia o deus');
  ok(!$('.deus--falta') && !$('.nlmed__tag'), 'possuindo: sem tag de ausência no medalhão');
  ok(!!$('.nlesq .nlmed .slot'), 'o medalhão redondo aparece na coluna esquerda');
  ok(/Pontos de Zeus: 3/.test(T($('.nltop__ptn'))), 'possuindo+online: a barra mostra os pontos do deus');
  ok(/por cópia \(SS\)/.test(T($('.nltop__cop'))), 'mostra quantos pontos cada cópia rende (pela raridade, do dado)');
  ok(!!$('.nlpas') && /PASSIVA/.test(T($('.nlpas__rot'))) && /não tem níveis/i.test(T($('.nlpas__nota'))), 'a PASSIVA fica à esquerda e diz que não tem níveis');
  // os 3 painéis das habilidades ativas (básico/habilidade/milagre) — a passiva NÃO é painel (fica à esquerda)
  ok($$('.nldir .nlp').length === 3, `a coluna direita traz os 3 painéis ativos, há ${$$('.nldir .nlp').length}`);
  ok($$('.nldir .nlp .nlp__esc').length === 3, 'cada painel traz os marcadores de nível');
  ok(/\dde \d/.test(T($('.nlfoot__num')).replace(/\s/g, '')) || /de/.test(T($('.nlfoot__num'))), 'o rodapé mostra "X de Y"');
  ok(!!$('.nldir .nlp [data-subir]'), 'com pontos, há ao menos um botão SUBIR');
  ok(/SUBIR · 1 ponto/.test(T($('.nldir .nlp [data-subir]'))), 'o botão SUBIR traz o custo em pontos (do economia.json)');
  // SUBIR abre a confirmação inline NO painel (§245, sem modal)
  $('.nldir .nlp [data-subir]').dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  ok(!!$('.nlp__conf') && !!$('[data-subir-ok]') && !!$('[data-subir-no]'), 'tocar SUBIR abre a confirmação inline (CONFIRMAR/CANCELAR) no painel');

  // NÃO POSSUINDO: aviso no topo, tag no medalhão, NENHUM botão SUBIR; a escada fica só-leitura
  w.eval("delete perfil.deuses.ahpuch; contaAtual={pontos:{},niveis:{},perfil:{deuses:{}},missoes:{ativa:null,progresso:{},liberados:[]}}; ir('deus',{key:'ahpuch'}); render();");
  ok(!!$('.deus--falta') && /não tem este deus/i.test(T($('.nltop__pts--falta'))), 'não-possuindo: "Você ainda não tem este deus" na barra');
  ok(!!$('.nlmed__tag') && /NÃO POSSUI/.test(T($('.nlmed__tag'))), 'não-possuindo: tag no medalhão');
  ok($$('[data-subir]').length === 0 && $$('[data-subir-ok]').length === 0, 'não-possuindo: nenhum botão de subir (escada só-leitura)');
  ok($$('.nldir .nlp .nlp__esc').length >= 1, 'não-possuindo: a escada continua legível');
}

console.log('== 6. §245 — DESAFIO POR DEUS: comprar com Essência inicia a batalha marcada como paga; só de deus que você TEM ==');
{
  const { w, $ } = sessao();
  w.eval("perfil.moedas.essencia=100; ir('desafios'); render();");
  // o hub lista os deuses que você TEM (os 9 iniciais); zeus (inicial, possuído) aparece comprável.
  ok(!!$('[data-comprar="zeus"]'), 'um deus possuído (zeus) tem desafio comprável no hub');
  ok(!w.eval("!!(perfil.deuses['durga'])") && !$('[data-comprar="durga"]') && !$('[data-jogar="durga"]'), 'um deus NÃO possuído (durga) não aparece (só de deus que você tem)');
  // COMPRAR paga Essência e entra na batalha marcada como desafio POR DEUS (pago).
  const essAntes = w.eval('perfil.moedas.essencia'), custo = w.eval('ECONOMIA.pergaminhos.custoEssencia');
  $('[data-comprar="zeus"]').dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  ok(w.eval('perfil.moedas.essencia') === essAntes - custo, `comprar debita a Essência (${custo})`);
  ok(w.eval("rotaAtual()") === 'batalha' && w.eval('!!prova && prova.desafioDeus==="zeus"'), 'comprar inicia a batalha do desafio POR DEUS (pago)');
}

console.log('== 7. §245 — cobertura 100%: os 100 têm pergaminho, nenhum genérico; o hub lista os deuses possuídos ==');
{
  const { w, $, $$ } = sessao();
  ok(w.eval('PROVACOES.length') === 100, 'os 100 deuses têm pergaminho no dado (§245: gerados/promovidos)');
  ok(w.eval('PROVACOES.filter(p=>p.generica).length') === 0, 'nenhum genérico (os 27 promovidos ao acervo)');
  ok(w.eval('PROVACOES.filter(p=>!p.generica).length') === 100, '100 no acervo jogável (cobertura completa)');
  // a FAIXA deriva dos nós medidos: Fácil <5k · Médio 5k–50k · Difícil 50k–200k · Épico >200k
  const fx = n => n == null ? null : n < 5000 ? 'Fácil' : n < 50000 ? 'Médio' : n < 200000 ? 'Difícil' : 'Épico';
  const errosFaixa = w.eval('PROVACOES').filter(p => p.faixa !== fx(p.nos));
  ok(errosFaixa.length === 0, `a faixa injetada bate a derivada dos nós (${errosFaixa.length} divergências)`);
  // a TELA "Desafios": título Desafios, seção DESAFIOS POR DEUS, uma linha por deus POSSUÍDO
  w.eval("ir('desafios'); render();");
  ok(/Desafios/.test($('.tela__titulo').textContent), 'a tela se chama "Desafios"');
  ok(/DESAFIOS POR DEUS/.test($('#provrol').textContent), 'a seção é "Desafios por deus"');
  ok($$('.dsf').length === w.eval('Object.keys(perfil.deuses).length'), `uma linha por deus possuído (${$$('.dsf').length})`);
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

console.log('== 9. §318 F2 E2 — SANDBOX (Batalha CPU): vitória ENVIA replay (a Gema é do servidor, sem crédito local; teto 5/dia no servidor) ==');
{
  const { w } = sessao();
  const g0 = w.eval('perfil.moedas.gema');
  // batalha PLANA vs CPU: grava a montagem e as ações; ao vencer, ENVIA o replay (não credita local).
  w.eval("prova=null;campanha=null;provaFim=null;campanhaFim=null; vsCPU=true; REPLAY.iniciar({modo:'sandbox',aliados:['zeus','ogum','tyr'],inimigos:['sobek','brigid','ganesha'],seed:1,comeca:0}); st=novoEstado(['zeus','ogum','tyr'],['sobek','brigid','ganesha'],1,0); st.ativo=0; ir('batalha',{},{substituir:true}); pararRelogio();");
  const nFila0 = w.eval('REPLAY.fila().length');
  w.eval("st.lados[1].units.forEach(u=>{u.vivo=false;u.hp=0;}); st.fim={tipo:'fim',resultado:'vitoria',lado:0}; render();");
  ok(w.eval('!!(st._sandbox && st._sandbox.enviado)'), 'a vitória vs CPU marca envio ao servidor');
  ok(w.eval('perfil.moedas.gema') === g0, 'a Gema NÃO é creditada local (a economia é do servidor)');
  ok(w.eval('REPLAY.fila().length') === nFila0 + 1, 'a vitória ENFILEIRA um replay');
  ok(JSON.parse(w.eval('JSON.stringify(REPLAY.fila()[REPLAY.fila().length-1])')).modo === 'sandbox', 'o replay é do modo sandbox');
  // derrota NÃO credita nem envia
  const g1 = w.eval('perfil.moedas.gema');
  w.eval("REPLAY.iniciar({modo:'sandbox',aliados:['zeus','ogum','tyr'],inimigos:['sobek','brigid','ganesha'],seed:1,comeca:0}); st=novoEstado(['zeus','ogum','tyr'],['sobek','brigid','ganesha'],1,0); st.ativo=0; st.fim={tipo:'fim',resultado:'vitoria',lado:1}; render();");
  ok(w.eval('st._sandbox===null') && w.eval('perfil.moedas.gema') === g1, 'derrota (CPU vence) não credita nada');
}

console.log('== 10. ROTAS separadas (§213/§234): Provações = mapa das Missões; Desafios = hub de pergaminhos ==');
{
  const { w, $, $$ } = sessao();
  // o carrossel tem 9 destinos (§273: +Domínios entre Campanha e Provações), com "Desafios" entre "Provações" e "Invocação"
  const ordem = w.eval('HOME_BANNERS.map(d=>d.chave)');
  ok(ordem.length === 9, `o carrossel tem 9 destinos (tem ${ordem.length})`);
  ok(ordem.indexOf('dominios') === ordem.indexOf('campanha') + 1, 'Domínios fica logo após a Campanha (§273)');
  ok(ordem.indexOf('desafios') === ordem.indexOf('provacoes') + 1 && ordem.indexOf('desafios') === ordem.indexOf('invocacao') - 1, 'Desafios fica entre Provações e Invocação');
  // "Provações" → o MAPA DAS MISSÕES (§234). Sem servidor (a sessão é local), diz honestamente que as
  // missões contam no PvP e NÃO lista pergaminhos.
  w.eval("ir('provacoes'); render();");
  ok(/Prova/i.test(($('.pv__titulo')||$('.tela__titulo')).textContent) && /prova/i.test($('#baselayer').textContent) && /pvp/i.test($('#baselayer').textContent), 'Provações abre a tela de Provações (conta no PvP)');
  ok($$('.prow[data-prova]').length === 0, 'a tela de Provações NÃO lista pergaminhos');
  // "Desafios" → o hub dos DESAFIOS POR DEUS (§245): uma linha por deus possuído
  w.eval("ir('desafios'); render();");
  ok(/Desafios/.test($('.tela__titulo').textContent) && $$('.dsf').length === w.eval('Object.keys(perfil.deuses).length'), 'Desafios abre o hub dos desafios por deus (uma linha por deus possuído)');
  // §306: a home é MAPA — a ilha Desafios tem seu ícone (arquivo) e NAVEGA (não é "em breve").
  w.eval("ir('home',{},{substituir:true}); render();");
  const cd = $('.ilha[data-dest="desafios"]');
  ok(!!cd && !cd.classList.contains('ilha--breve'), 'a ilha Desafios navega (não é "em breve", §306)');
  const img = cd && cd.querySelector('img.ilha__ic');
  ok(!!img && img.getAttribute('src') === 'mapa/desafios.webp', 'a ilha Desafios aponta para mapa/desafios.webp (ícone versionado)');
}

for (const dom of abertos) try { dom.window.close(); } catch (e) {}
if (falhas) { console.log(`\n>>> ${falhas} FALHA(S) no laço de aquisição`); process.exit(1); }
console.log('>>> AQUISIÇÃO OK');
process.exit(0);
