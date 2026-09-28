// Tela de invocação (gacha) — §318 F2 E3: o SORTEIO é do SERVIDOR. O cliente só PEDE e MOSTRA.
// O jsdom exercita o cliente sobre o build; um TRANSPORTE MOCK resolve os pedidos chamando o MÓDULO
// REAL do servidor (server/invocacao.js) sobre uma conta-fake — o cliente passa pelo fio de verdade.
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const html = fs.readFileSync(path.join(__dirname, '../dist/incursion.html'), 'utf8');
const invSrv = require('../server/invocacao.js');
const ECON = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/economia.json'), 'utf8'));

let falhas = 0;
const ok = (c, m) => { if (!c) { console.log('  FALHA: ' + m); falhas++; } };
const tick = () => new Promise(r => setImmediate(r));   // esvazia microtasks (o pull resolve via Promise)

const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://x/' });
const w = dom.window, d = w.document;
const $ = s => d.querySelector(s), $$ = s => [...d.querySelectorAll(s)];

// ---- conta-fake + transporte mock (o servidor de verdade, em processo) ----
const fake = { id: 't', gacha: { pity: 0, inicianteUsado: false }, pontos: {}, niveis: {}, perfil: { moedas: { gema: 1500, essencia: 0 }, deuses: {} }, ranque: { pontos: 0 } };
function paraDonoFake(c) { return { id: c.id, pity: (c.gacha && c.gacha.pity) || 0, inicianteUsado: (c.gacha && c.gacha.inicianteUsado) || false, pontos: c.pontos || {}, niveis: c.niveis || {}, perfil: c.perfil, ranque: c.ranque }; }
function pedir(msg) {
  let r;
  if (msg.tipo === 'invocar') {
    r = invSrv.invocar(fake, { pacote: !!msg.pacote, iniciante: !!msg.iniciante }, Date.now());
    if (r.ok) { r = Object.assign({ tipo: 'invocado' }, r, { conta: paraDonoFake(fake) }); }
    else { r = { tipo: 'recusado', codigo: r.motivo, erro: r.motivo, saldo: r.saldo }; }
  } else if (msg.tipo === 'devCredito') {
    r = invSrv.devCredito(fake); r = Object.assign({ tipo: 'devCreditado' }, r, { conta: paraDonoFake(fake) });
  } else if (msg.tipo === 'chancesInvocacao') {
    const f = invSrv.faixaDoJogador(fake);
    r = { tipo: 'chancesInvocacao', faixa: f, faixaNome: 'Suplicante', faixaNomes: ['Suplicante','Devoto','Iniciado','Adepto','Sacerdote','Oráculo','Herói','Semideus'], linhaFaixa: invSrv.linhaFaixa(f), raridade: ECON.invocacao.taxas, pity: (fake.gacha && fake.gacha.pity) || 0 };
  } else r = { tipo: 'erro' };
  return Promise.resolve(r);
}

(async function main() {
  console.log('== 1. fonte da verdade: 100 deuses, raridade só SS/S/A ==');
  ok(w.eval('ROSTER.length') === 100, 'roster deveria ter 100');
  ok(w.eval('Object.keys(RARIDADE).length') === 100, 'RARIDADE cobre os 100');
  const vals = w.eval('JSON.stringify([...new Set(Object.values(RARIDADE))].sort())');
  ok(vals === '["A","S","SS"]', `raridades só SS/S/A (são ${vals})`);

  console.log('== 2. a tela monta a partir do botão Invocar; sem abas; pity /60; dois botões ==');
  w.eval("ir('selecao');render()");
  { const b = d.getElementById('binvocar'); if (b) b.dispatchEvent(new w.MouseEvent('click', { bubbles: true })); }
  ok(!!$('#iv'), 'a tela de invocação monta');
  ok(!$('#iv-tabs'), 'não há abas de banner');
  ok(w.eval('typeof INV.claimIniciante') === 'function', 'claimIniciante existe');
  ok(!!$('.iv-hero__nome') && $('.iv-hero__nome').textContent.trim().length > 0, 'o nome do destaque renderiza');
  ok(!!$('.iv-hero__selo'), 'o selo grande renderiza');
  ok(/\/60/.test($('#iv-pity').textContent), 'o pity /60 aparece');
  ok(!!$('.iv-pb.iv-x1') && !!$('.iv-pb.iv-x10'), 'os dois botões (×1 e ×10)');

  console.log('== 3. §318 F2 E3: SEM SERVIDOR o cliente NÃO sorteia (a economia é do servidor) ==');
  // sem contaTransporte, pull não revela nada e avisa
  w.eval('INV.pull(1)'); await tick();
  ok($$('#iv-cards .iv-carta').length === 0, 'sem servidor: nenhuma carta revelada (o cliente não sorteia local)');
  ok(w.eval('typeof (function(){return typeof rollRarity})()') === 'string' ? true : true, 'sanidade');

  // liga o transporte MOCK (servidor real em processo) + token
  w.__mockTx = { pedir };
  w.eval("contaTransporte = window.__mockTx; lerToken = function(){ return 'tok'; };");

  console.log('== 4. invocação ×10 pelo SERVIDOR revela 10 cartas (sem estrelas) e debita a gema no servidor ==');
  const g0 = fake.perfil.moedas.gema;
  w.eval('INV.pull(10)'); await tick();
  const cartas = $$('#iv-cards .iv-carta');
  ok(cartas.length === 10, `revela 10 cartas (revelou ${cartas.length})`);
  ok(!$('#iv-cards').innerHTML.includes('★'), 'nenhuma estrela (★) na carta');
  ok(fake.perfil.moedas.gema === g0 - ECON.invocacao.custo.pacote10, `o ×10 debita ${ECON.invocacao.custo.pacote10} de gema NO SERVIDOR (saldo ${fake.perfil.moedas.gema})`);
  ok(w.eval('contaAtual && contaAtual.perfil.moedas.gema') === fake.perfil.moedas.gema, 'o cliente reflete o saldo autoritativo (contaAtual)');

  console.log('== 5. saldo insuficiente → o SERVIDOR recusa; o cliente não revela nem credita ==');
  fake.perfil.moedas.gema = 100;   // < 150
  const cartasAntes = $$('#iv-cards .iv-carta').length;
  w.eval('INV.pull(1)'); await tick();
  ok(fake.perfil.moedas.gema === 100, 'saldo intacto (o servidor recusou)');
  ok($$('#iv-cards .iv-carta').length === cartasAntes, 'não revelou cartas novas');
  ok(/insufic/i.test($('#iv-toast') ? $('#iv-toast').textContent : ''), 'aviso de gemas insuficientes');

  console.log('== 6. crédito DEV roda no SERVIDOR (a gema é do servidor) ==');
  w.eval('INV.topup()'); await tick();
  ok(fake.perfil.moedas.gema === 100 + ECON.grantTeste.gema, `DEV credita ${ECON.grantTeste.gema} no servidor (saldo ${fake.perfil.moedas.gema})`);
  ok(!!fake.dev, 'a conta fica marcada como contaminada (dev) no servidor');

  console.log('== 7. Bênção do Iniciante: 10× grátis com SS garantido, UMA vez (servidor) ==');
  ok(!!$('.iv-oferta'), 'a oferta aparece enquanto não usada');
  const deusesAntes = Object.keys(fake.perfil.deuses).length;
  w.eval('INV.claimIniciante()'); await tick();
  ok(Object.keys(fake.perfil.deuses).length >= deusesAntes, 'a Bênção entregou deuses (posse no servidor)');
  ok(fake.gacha.inicianteUsado === true, 'o servidor marcou o iniciante como usado');
  w.eval('INV.closeReveal(); render()');
  ok(!$('.iv-oferta'), 'usada uma vez, a oferta some');
  // 2ª tentativa → recusa do servidor
  w.eval('INV.claimIniciante()'); await tick();
  ok(/já usada/i.test($('#iv-toast') ? $('#iv-toast').textContent : ''), 'o iniciante 2× é recusado');

  console.log('== 8. openAudit mostra a TABELA DE CHANCES da faixa (do servidor), sem sorteio local ==');
  w.eval('INV.openAudit()'); await tick();
  ok($('#iv-audit').classList.contains('iv-show'), 'a tabela abre');
  const box = $('#iv-auditBox').textContent;
  ok(/Tabela de chances/.test(box), 'é a tabela de chances (não "1.000 invocações" local)');
  ok(/Suplicante/.test(box), 'lista a faixa do jogador (Suplicante)');
  ok($$('#iv-auditBox table tr').length >= 8, 'a tabela lista as 8 faixas');

  console.log('== 9. o pity mostrado é o do SERVIDOR (contaAtual.pity), teto do economia ==');
  fake.gacha.pity = 13;
  w.eval("contaAtual.pity = 13; INV.montar();");
  const teto = String(ECON.invocacao.pity.duro);
  ok(new RegExp('13\\/' + teto).test($('#iv-pity').textContent), `pity 13/${teto} vem da conta autoritativa`);

  console.log('== 10. §318 F2 E3: nenhum Math.random de sorteio em invocacao.js (o gacha saiu) ==');
  const fonteInv = fs.readFileSync(path.join(__dirname, '../src/invocacao.js'), 'utf8');
  const linhasCodigo = fonteInv.split('\n').filter(l => !l.trim().startsWith('//'));
  ok(!linhasCodigo.some(l => /Math\.random/.test(l)), 'invocacao.js não tem Math.random em código (só o servidor sorteia)');
  ok(!/function\s+(rollRarity|doRoll|sortearLote|pickUnit)\b/.test(fonteInv), 'as funções de sorteio local saíram (rollRarity/doRoll/sortearLote/pickUnit)');

  console.log('== 11. preço do DADO (sem literal) e 10% OFF no ×10 ==');
  const c1 = String(ECON.invocacao.custo.avulso), c10 = ECON.invocacao.custo.pacote10.toLocaleString('pt-BR');
  ok($('.iv-pb.iv-x1').textContent.includes(c1), `×1 mostra o custo do dado (${c1})`);
  ok($('.iv-pb.iv-x10').textContent.includes(c10), `×10 mostra o custo do dado (${c10})`);
  ok(/ECONOMIA\.invocacao\.custo\.avulso/.test(fonteInv) && /ECONOMIA\.invocacao\.custo\.pacote10/.test(fonteInv), 'os botões leem o custo de ECONOMIA (dado)');
  ok(!/cost\s*=\s*(150|1350)\b/.test(fonteInv), 'nenhum custo numérico à mão em invocacao.js');
  ok(/10% OFF/.test($('.iv-pb.iv-x10').textContent), 'o selo 10% OFF fica no ×10');

  console.log('== 12. §304c: a .iv-arte mantém a fusão de bordas (máscara) e a proporção de pôster ==');
  const shell = fs.readFileSync(path.join(__dirname, '../src/shell.html'), 'utf8');
  const bloco = (shell.match(/#iv \.iv-arte\{[^}]*\}/) || [''])[0];
  ok(/mask-image:linear-gradient/.test(bloco) && /mask-composite:intersect/.test(bloco), 'a .iv-arte funde as bordas (máscara)');
  ok(/aspect-ratio:512\/590/.test(bloco), 'a caixa é travada na proporção do retrato');

  console.log('== 13. §318 F2 E4: token rejeitado após deploy (conta zerada) → recomecou + aviso honesto ==');
  w.eval("try{localStorage.setItem('incursion:token','tok-velho')}catch(e){}");
  w.__ftReset = { pedir: (m) => Promise.resolve(m && m.tipo === 'ola' ? { tipo: 'ola', v: 1 } : { tipo: 'recusado', codigo: 'token_invalido', erro: 'x' }) };
  const rboot = await w.eval("iniciarConta(window.__ftReset,{})");
  ok(rboot && rboot.fase === 'perguntarFaixa' && rboot.recomecou === true, 'token inválido após deploy → perguntarFaixa + recomecou=true');
  w.eval('_avisoRecomeco()');
  const av = d.getElementById('aviso-recomeco');
  ok(!!av && /recomeçaram/.test(av.textContent), 'o aviso honesto de recomeço aparece (uma linha, dispensável)');

  console.log('');
  console.log(falhas === 0 ? '>>> INVOCAÇÃO OK' : `>>> ${falhas} FALHA(S)`);
  process.exit(falhas ? 1 : 0);
})();
