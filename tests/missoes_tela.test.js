// §314 — A TELA DAS PROVAÇÕES: painel fixo "PROVAÇÃO ATIVA" no topo (retrato + nome + cada objetivo x/y +
// TROCAR; ou vazio) + a LISTA híbrida por ranque crescente com 5 estados (ativa/pausada/disponivel/travada/
// conquistada). Cartões (≥76px, §234) mostram os objetivos (até 4); a travada é linha curta NÃO interativa
// com o que falta. GUARDAS §295: o espaço de estados INTEIRO — incluindo pausada, painel vazio e painel/
// cartão com 4 objetivos — e nada corta nas 4 larguras (Chromium, no fim).
const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

let falhas = 0, passes = 0;
const ok = (c, m) => { if (!c) { console.log('  ✗ FALHA: ' + m); falhas++; } else { console.log('  ✓ ' + m); passes++; } };

const html = fs.readFileSync(path.join(__dirname, '../dist/incursion.html'), 'utf8');
const vc = new VirtualConsole();
let err = null;
vc.on('jsdomError', e => { err = (e.detail && e.detail.message) || e.message; });
const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://x/', virtualConsole: vc });
const w = dom.window, d = w.document;
const $ = s => d.querySelector(s), $$ = s => [...d.querySelectorAll(s)];
const txt = el => (el ? el.textContent : '').replace(/\s+/g, ' ').trim();
const FAIXAS8 = ['Suplicante', 'Devoto', 'Iniciado', 'Adepto', 'Sacerdote', 'Oráculo', 'Herói', 'Semideus'];
function MISSOES2(k) { return w.eval(`MISSOES.missoes[${JSON.stringify(k)}]`); }

// mock RICO (rank alto = nenhuma trava de ranque; a travada restante é por NOMES): cerberus/saci conquistados,
// atena ATIVA (3 objetivos), hades PAUSADA (4 objetivos — o cartão de 4), dionisio DISPONÍVEL, aquiles TRAVADA.
const C_RICO = "contaAtual={nick:'T',ranque:{pontos:2000,faixa:{chave:'semideus'}},"
  + "perfil:{deuses:{cerberus:{copias:1},saci:{copias:1}}},"
  + "missoes:{ativa:'atena',progresso:{atena:{ativadaEm:0,obj:[{seq:1},{vol:2},{vol:3}]},hades:{ativadaEm:0,obj:[{seq:1},{vol:1},{vol:0},{vol:2}]}},liberados:['cerberus','saci']}};"
  + "ir('provacoes',{},{substituir:true});render();";
const C_VAZIO = "contaAtual={nick:'T',ranque:{pontos:2000,faixa:{chave:'semideus'}},perfil:{deuses:{}},missoes:{ativa:null,progresso:{},liberados:[]}};ir('provacoes',{},{substituir:true});render();";
const C_RANK0 = "contaAtual={nick:'T',ranque:{pontos:0,faixa:{chave:'suplicante'}},perfil:{deuses:{}},missoes:{ativa:null,progresso:{},liberados:[]}};ir('provacoes',{},{substituir:true});render();";

console.log('== §314 / TELA DAS PROVAÇÕES (painel ativa + lista híbrida, espaço de estados §295) ==');
ok(w.eval("typeof MISSOES==='object' && Object.keys(MISSOES.missoes).length===91"), 'as 91 Provações estão no cliente');
ok(w.eval("MISSOES.slotsGratis===1"), 'slotsGratis=1 vem do dado (data/provacoes_slots.json → missoes.json)');

// ---- 1. OFFLINE: estado honesto (não mostra zero) + os 91 motivos legíveis ----
console.log('\n== 1. offline: honesto + histórias legíveis ==');
err = null;
w.eval("contaAtual=null; ir('provacoes',{},{substituir:true}); render();");
ok(!err, 'renderiza offline sem quebrar');
ok(/conecte/i.test(txt($('.moff__msg'))) && /pvp/i.test(txt($('.moff__msg'))), 'diz honestamente: contam no PvP, conecte');
ok($$('.mcard, .mlock, .pativa').length === 0, 'offline NÃO desenha painel nem cartões de progresso');
ok($$('.mcat').length === 91, 'as 91 histórias ficam legíveis offline');

// ---- 2. ONLINE: painel + lista plana (91 presentes), ranque crescente ----
console.log('\n== 2. online: painel ativa + lista por ranque, 91 presentes ==');
err = null; w.eval(C_RICO);
ok(!err, 'renderiza online sem quebrar');
ok(!!$('.pativa'), 'o PAINEL "Provação ativa" existe no topo');
ok(($$('.mcard').length + $$('.mlock').length) === 91, `os 91 aparecem na lista (cartões ${$$('.mcard').length} + travadas ${$$('.mlock').length})`);
const ordFaixa = $$('.mcard, .mlock').map(el => MISSOES2(el.dataset.deus || el.dataset.lock).faixaIndice);
ok(ordFaixa.every((v, i) => i === 0 || ordFaixa[i - 1] <= v), 'a lista está em ranque CRESCENTE (faixaIndice não-decrescente)');

// ---- 3. PAINEL ATIVA (cheio): retrato + nome + cada objetivo x/y + TROCAR ----
console.log('\n== 3. painel ativa: nome + objetivos x/y + Trocar ==');
{
  const pa = $('.pativa');
  ok(/atena/i.test(txt(pa.querySelector('.pativa__nome'))), 'o painel mostra o nome da ativa (atena)');
  ok(pa.querySelectorAll('.pativa__objs .orow').length === MISSOES2('atena').objetivos.length, `o painel lista os ${MISSOES2('atena').objetivos.length} objetivos da atena`);
  ok($$('.pativa .orow__xy').every(e => /\d+/.test(txt(e))) && /1/.test(txt(pa.querySelector('.orow__xy'))), 'cada objetivo do painel mostra o progresso x/y (ao vivo)');
  ok(!!pa.querySelector('#btrocar'), 'o painel tem o botão TROCAR');
}

// ---- 4. PAINEL VAZIO: "Nenhuma Provação ativa — escolha uma abaixo" ----
console.log('\n== 4. painel vazio ==');
w.eval(C_VAZIO);
ok(!!$('.pativa--vazio') && /nenhuma/i.test(txt($('.pativa--vazio'))) && /escolha/i.test(txt($('.pativa--vazio'))), 'sem ativa: painel VAZIO com "Nenhuma Provação ativa — escolha uma abaixo"');
w.eval(C_RICO);

// ---- 5. ESPAÇO DE ESTADOS §295: os 5 estados presentes e corretos ----
console.log('\n== 5. §295 — os estados: ativa · pausada · disponivel · conquistada · travada ==');
ok($$('.mcard--ativa').length >= 1, 'ATIVA: cartão destacado na lista');
ok($$('.mcard--conquistada').length >= 1 && /✓/.test(txt($('.mcard--conquistada'))), 'CONQUISTADA: cartão com ✓');
ok($$('.mcard--disponivel').length >= 1 && !!$('.mcard--disponivel [data-ativar]'), 'DISPONÍVEL: cartão com botão Ativar');
{
  const pa = $('.mcard--pausada');
  ok(!!pa && /pausada/i.test(txt(pa.querySelector('.mcard__selo'))), 'PAUSADA: cartão com selo Pausada');
  ok(pa && pa.querySelectorAll('.orow').length === 4, 'PAUSADA hades: o cartão mostra os 4 OBJETIVOS (o cartão de 4)');
  ok(pa && !!pa.querySelector('[data-ativar]'), 'PAUSADA: tem botão Retomar (ativar)');
}
ok($$('.mlock').length >= 1, 'TRAVADA: há linhas travadas');
{
  const lk = $('.mlock'); const t = txt(lk.querySelector('.mlock__falta'));
  ok(/falta:/i.test(t) && t.replace(/falta:/i, '').trim().length > 0, 'TRAVADA: SEMPRE diz o que falta (§234, nunca só cadeado)');
  ok(!!lk.querySelector('.mlock__cad'), 'TRAVADA: tem o cadeado');
}
// TRAVA por RANQUE: no rank 0, alguma travada cita "ranque"
w.eval(C_RANK0);
ok($$('.mlock').some(l => /ranque/i.test(txt(l.querySelector('.mlock__falta')))), 'TRAVA-RANQUE: com rank 0, alguma travada cita "ranque <faixa>"');
w.eval(C_RICO);

// ---- 6. OBJETIVOS: rótulo humano + x/y + barra; números do DADO; nomes de ranque só as 8 faixas ----
console.log('\n== 6. objetivos: rótulo + x/y + barra · números do dado · só as 8 faixas ==');
ok($$('.mcard .orow').length >= 1 && $$('.mcard .orow').every(r => !!r.querySelector('.orow__xy') && !!r.querySelector('.mreq__bar')), 'todo objetivo tem x/y + barra');
{
  // o painel da atena: 1º objetivo é "s zeus" (k=2) com o progresso 1/2 do mock
  const first = $('.pativa .orow'); ok(/zeus/i.test(txt(first)) && /1\D*2/.test(txt(first.querySelector('.orow__xy'))), 'objetivo lê o DADO: "seguidas com Zeus" 1/2');
}
{
  const alvo = $('.mcard--disponivel'); const k = alvo.dataset.deus;
  ok(txt(alvo.querySelector('.mcard__motivo')) === MISSOES2(k).motivo, 'o motivo vem do DADO (bate com MISSOES[k].motivo)');
}
const faltasRanque = $$('.mlock__falta').map(txt).join(' ');
const foraDas8 = FAIXAS8.filter(() => false).concat((faltasRanque.match(/ranque\s+([A-Za-zÁ-ú]+)/g) || []).map(s => s.replace(/ranque\s+/i, '')).filter(f => !FAIXAS8.includes(f)));
ok(foraDas8.length === 0, `nenhum nome de ranque inventado nas travas — só as 8 faixas${foraDas8.length ? ': ' + [...new Set(foraDas8)].join(', ') : ''}`);
ok(!/Bronze|Prata|Ouro|Platina|Diamante/i.test(txt($('.mlista'))), 'nada de Bronze/Prata/Ouro/Platina/Diamante (o erro da referência)');

// ---- 7. ALVO DE TOQUE (§234) + travada NÃO interativa ----
console.log('\n== 7. toque ≥76px no cartão · travada não abre ==');
ok(parseFloat(w.getComputedStyle($('.mcard')).minHeight) >= 76, `cartão ≥76px de toque (§234): ${w.getComputedStyle($('.mcard')).minHeight}`);
ok($$('.mlock').every(l => l.tagName === 'DIV' && !l.dataset.deus && typeof l.onclick !== 'function'), 'a TRAVADA é <div> sem data-deus e sem clique — NÃO abre (não afrouxa o §234)');

// ---- 8. CONFIRMAÇÃO de troca (§314): Ativar com outra já ativa pede confirmação inline ----
console.log('\n== 8. troca: ativar com outra ativa pede confirmação (a atual fica pausada) ==');
{
  w.eval(C_RICO);
  const btn = $('.mcard--disponivel [data-ativar][data-troca="1"]');
  ok(!!btn, 'um cartão disponível tem Ativar marcado como TROCA (há outra ativa)');
  const k = btn.dataset.ativar;
  w.eval(`[...document.querySelectorAll('[data-ativar]')].find(b=>b.dataset.ativar===${JSON.stringify(k)}).click();`);
  const conf = $('.mcard__conf');
  ok(!!conf && /pausada/i.test(txt(conf)) && !!conf.querySelector('[data-troca-ok]') && !!conf.querySelector('[data-troca-no]'), 'aparece a confirmação inline: "a atual fica pausada" + Trocar/Cancelar');
  // cancelar volta ao normal (sem chamar servidor)
  w.eval("document.querySelector('[data-troca-no]').click();");
  ok(!$('.mcard__conf'), 'Cancelar fecha a confirmação (nada é enviado)');
}

// ---- 9. ELO com o detalhe do deus (do cartão e do painel) ----
console.log('\n== 9. elo com o detalhe do deus ==');
{
  w.eval(C_RICO);
  const aberto = $('.mcard__abrir[data-abrir]'); const k = aberto.dataset.abrir;
  w.eval(`[...document.querySelectorAll('.mcard__abrir[data-abrir]')].find(b=>b.dataset.abrir===${JSON.stringify(k)}).click();`);
  ok(w.eval("rotaAtual()==='deus'"), 'do cartão vai-se ao detalhe do deus');
  w.eval("if(document.querySelector('[data-vermissao]')) document.querySelector('[data-vermissao]').click();");
  ok(w.eval("rotaAtual()==='provacoes'"), 'do detalhe do deus volta-se às Provações');
}

if (falhas) { console.log(`\n== ${passes} ok, ${falhas} FALHAS (jsdom) ==`); process.exit(1); }
console.log(`\n== jsdom OK (${passes}) — agora a varredura de LARGURA no Chromium ==`);

// ================= §314 — LARGURA: nada corta em 780/893/1075/1200; painel e cartão de 4 objetivos cabem ==========
(async () => {
  const { chromium } = require('playwright');
  function acharChromium() { try { const base = '/opt/pw-browsers'; const dir = fs.readdirSync(base).filter(x => /^chromium-\d+$/.test(x)).sort().pop(); const bin = path.join(base, dir, 'chrome-linux', 'chrome'); if (fs.existsSync(bin)) return bin; } catch (e) {} return undefined; }
  const distAbs = 'file://' + path.resolve(__dirname, '..', 'dist', 'incursion.html');
  const MOCK = C_RICO;
  const MOCKV = C_VAZIO;
  let cf = 0; const ok2 = (c, m) => { if (!c) { cf++; console.log('  XX ' + m); } else console.log('  ok ' + m); };
  const browser = await chromium.launch({ executablePath: acharChromium(), headless: true });
  for (const W of [780, 893, 1075, 1200]) {
    const page = await (await browser.newContext({ viewport: { width: W, height: 428 }, deviceScaleFactor: 2 })).newPage();
    await page.goto(distAbs, { waitUntil: 'load' }); await page.evaluate(MOCK); await page.waitForTimeout(150);
    const r = await page.evaluate(() => {
      const rol = document.querySelector('.tela__rol');
      const overflowX = rol ? rol.scrollWidth - rol.clientWidth : 0;
      const pativa = document.querySelector('.pativa');
      const paOverflowX = pativa ? pativa.scrollWidth - pativa.clientWidth : 0;
      const cards = [...document.querySelectorAll('.mcard')];
      const minCardH = Math.min(...cards.map(c => Math.round(c.getBoundingClientRect().height)));
      // o cartão de 4 objetivos (hades pausada): todas as 4 linhas presentes e não recortadas
      const quatro = document.querySelector('.mcard--pausada');
      const nObj = quatro ? quatro.querySelectorAll('.orow').length : 0;
      const objClip = quatro ? (quatro.scrollHeight - quatro.clientHeight) : 0;
      return { overflowX, paOverflowX, minCardH, nObj, objClip };
    });
    ok2(r.overflowX <= 1, `${W}: a lista não corta na horizontal (overflowX ${r.overflowX})`);
    ok2(r.paOverflowX <= 1, `${W}: o painel ativa não corta na horizontal (overflowX ${r.paOverflowX})`);
    ok2(r.minCardH >= 76, `${W}: todo cartão ≥76px (menor ${r.minCardH})`);
    ok2(r.nObj === 4 && r.objClip <= 1, `${W}: o cartão de 4 objetivos mostra os 4 sem recorte (clip ${r.objClip})`);
    // painel VAZIO também não estoura
    await page.evaluate(MOCKV); await page.waitForTimeout(80);
    const rv = await page.evaluate(() => { const p = document.querySelector('.pativa--vazio'); return p ? (p.scrollWidth - p.clientWidth) : -1; });
    ok2(rv >= 0 && rv <= 1, `${W}: o painel VAZIO cabe (overflowX ${rv})`);
    await page.close();
  }
  await browser.close();
  if (cf) { console.log(`\n== ${cf} FALHA(S) de largura (Chromium) ==`); process.exit(1); }
  console.log('\n== TELA DAS PROVAÇÕES §314 OK (jsdom + 4 larguras) ==');
  process.exit(0);
})().catch(e => { console.error(e.message || e); process.exit(1); });
