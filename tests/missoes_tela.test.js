// §312 — A TELA DAS MISSÕES, refeita: LISTA PLANA por ranque crescente (o híbrido). ABERTA = cartão cheio
// (retrato + nome + MOTIVO 2 linhas + as 3 TRAVAS: volume do panteão com barra · sequência COM O COMPANHEIRO
// · ranque mínimo). TRAVADA = linha curta, SEMPRE com o QUE FALTA (§234) + cadeado, NÃO interativa.
// GUARDAS §295: o espaço de estados INTEIRO percorrido (progresso · disponível · trava-comp · trava-ranque ·
// trava-ambos · conquistada · offline). Números do DADO (nada da referência); nenhum nome de ranque fora das
// 8 faixas; motivo clampado que não transborda; e nada corta nas 4 larguras (Chromium, no fim).
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

console.log('== §312 / TELA DAS MISSÕES (híbrida, espaço de estados §295) ==');
ok(w.eval("typeof MISSOES==='object' && Object.keys(MISSOES.missoes).length===91"), 'as 91 missões estão no cliente');

// ---- 1. OFFLINE: estado honesto (não mostra zero) + os 91 motivos legíveis ----
console.log('\n== 1. offline: honesto + motivos legíveis ==');
err = null;
w.eval("contaAtual=null; ir('provacoes',{},{substituir:true}); render();");
ok(!err, 'renderiza offline sem quebrar');
ok(/conecte/i.test(txt($('.moff__msg'))) && /pvp/i.test(txt($('.moff__msg'))), 'diz honestamente: contam no PvP, conecte');
ok($$('.mcard, .mlock').length === 0, 'offline NÃO desenha cartões de progresso (nada de zero forjado)');
ok($$('.mcat').length === 91, 'as 91 histórias (motivos) ficam legíveis offline');

// ---- 2. ONLINE: LISTA PLANA (sem cabeçalhos de faixa), os 91 presentes ----
console.log('\n== 2. online: lista plana por ranque, 91 presentes, sem seções de faixa ==');
// Conta 1 (pontos 150 = Suplicante+Devoto abertos): saci CONQUISTADO; Gregas com zeus EM PROGRESSO;
// portas disponíveis; faixas altas travadas por ranque (e por companheiro → ambos).
const C1 = "contaAtual={nick:'T',ranque:{pontos:150},perfil:{deuses:{hera:{copias:1},poseidon:{copias:1}}},missoes:{vitoriasPanteaoPvP:{Grega:5},sequenciaPvP:{zeus:1},sequenciaPanteaoPvP:{Grega:3},desbloqueio:{}}};ir('provacoes',{},{substituir:true});render();";
err = null; w.eval(C1);
ok(!err, 'renderiza online sem quebrar');
ok($$('.msec--faixa, .mfx__cab').length === 0, 'NÃO há mais cabeçalhos de faixa (lista plana, §312)');
ok(($$('.mcard').length + $$('.mlock').length) === 91, `os 91 aparecem (cartões ${$$('.mcard').length} + travadas ${$$('.mlock').length})`);
// ordem: por ranque crescente — o 1º cartão/linha é de faixa <= o último
const ordFaixa = $$('.mcard, .mlock').map(el => { const k = el.dataset.deus || el.dataset.lock; return MISSOES2(k).faixaIndice; });
ok(ordFaixa.every((v, i) => i === 0 || ordFaixa[i - 1] <= v), 'a lista está em ranque CRESCENTE (faixaIndice não-decrescente)');
function MISSOES2(k) { return w.eval(`MISSOES.missoes[${JSON.stringify(k)}]`); }

// ---- 3. ESPAÇO DE ESTADOS §295: cada estado presente e correto ----
console.log('\n== 3. §295 — os estados: conquistada · progresso · disponível · trava-ranque · trava-ambos ==');
ok($$('.mcard--conquistada').length >= 1 && /✓/.test(txt($('.mcard--conquistada'))), 'CONQUISTADA: cartão com ✓');
ok($$('.mcard--progresso').length >= 1, 'PROGRESSO: há cartão em progresso');
{
  const prog = $('.mcard--progresso');
  ok(/\d+\/\d+/.test(txt(prog.querySelector('.mreq'))) && !!prog.querySelector('.mreq__bar>i'), 'PROGRESSO: contador ao vivo "X/Y" + barra de volume');
}
ok($$('.mcard--disponivel').length >= 1 && /0\//.test(txt($('.mcard--disponivel .mreq'))), 'DISPONÍVEL: cartão em 0/Y');
ok($$('.mlock--trava-ranque').length >= 1 && /falta:\s*ranque/i.test(txt($('.mlock--trava-ranque'))), 'TRAVA-RANQUE: linha "falta: ranque <faixa>"');
ok($$('.mlock--trava-ambos').length >= 1, 'TRAVA-AMBOS: presente');
{
  const amb = $('.mlock--trava-ambos'); const t = txt(amb.querySelector('.mlock__falta'));
  ok(/falta:/i.test(t) && /ranque/i.test(t) && t.split('·').length === 2, 'TRAVA-AMBOS: mostra companheiro E ranque ("falta: X · ranque Y")');
}
// Conta 2 (pontos 800 = todos os ranques abertos, nada extra possuído) → TRAVA-COMP puro
const C2 = "contaAtual={nick:'T',ranque:{pontos:800},perfil:{deuses:{}},missoes:{vitoriasPanteaoPvP:{},sequenciaPvP:{},sequenciaPanteaoPvP:{},desbloqueio:{}}};ir('provacoes',{},{substituir:true});render();";
w.eval(C2);
ok($$('.mlock--trava-comp').length >= 1, 'TRAVA-COMP: com todos os ranques abertos, missões de cadeia ficam só por companheiro');
{
  const c = $('.mlock--trava-comp'); const t = txt(c.querySelector('.mlock__falta'));
  ok(/falta:/i.test(t) && !/ranque/i.test(t), 'TRAVA-COMP: "falta: <companheiro>" (sem ranque)');
}
w.eval(C1);   // volta à conta 1 para o resto

// ---- 4. as 3 TRAVAS em TODO cartão aberto + o QUE FALTA em TODA travada (§234) ----
console.log('\n== 4. 3 travas em todo aberto · o que falta em toda travada (§234) ==');
ok($$('.mcard').every(c => c.querySelectorAll('.mreq').length === 3), 'TODO cartão aberto tem as 3 travas (volume · seguidas · ranque)');
ok($$('.mcard').every(c => !!c.querySelector('.mreq__bar')), 'a trava de VOLUME sempre tem barra');
ok($$('.mcard').every(c => /com /i.test(txt(c.querySelector('.mreq:nth-child(2)')))), 'a trava de SEQUÊNCIA diz "com <companheiro/panteão>"');
const travSemFalta = $$('.mlock').filter(l => !/falta:/i.test(txt(l.querySelector('.mlock__falta'))) || txt(l.querySelector('.mlock__falta')).replace(/falta:/i, '').trim().length === 0);
ok(travSemFalta.length === 0, 'GUARDA §234: NENHUMA travada é só cadeado — toda diz o que falta (0 sem falta)');
ok($$('.mlock').every(l => !!l.querySelector('.mlock__cad')), 'toda travada tem o cadeado');

// ---- 5. MOTIVO do dado (identidade) + NENHUM nome de ranque fora das 8 faixas ----
console.log('\n== 5. motivo do dado · nomes de ranque só as 8 faixas ==');
ok($$('.mcard').every(c => txt(c.querySelector('.mcard__motivo')).length > 0), 'todo cartão aberto mostra o MOTIVO');
{
  const alvo = $('.mcard[data-deus]'); const k = alvo.dataset.deus;
  ok(txt(alvo.querySelector('.mcard__motivo')) === MISSOES2(k).motivo, 'o motivo vem do DADO (bate com MISSOES[k].motivo)');
}
const faixasNaTela = $$('.mreq__faixa').map(txt);
const foraDas8 = faixasNaTela.filter(f => !FAIXAS8.includes(f));
ok(foraDas8.length === 0, `nenhum nome de ranque inventado — só as 8 faixas${foraDas8.length ? ': ' + [...new Set(foraDas8)].join(', ') : ''}`);
ok(!/Bronze|Prata|Ouro|Platina|Diamante/i.test(txt($('.mlista'))), 'nada de Bronze/Prata/Ouro/Platina/Diamante (o erro da referência)');

// ---- 6. a DIFERENCIAÇÃO (§312) aparece: irmãos com números DIFERENTES ----
console.log('\n== 6. a diferenciação §312 é visível na tela ==');
{
  const card = k => $(`.mcard[data-deus="${k}"] .mreq__val`);
  const apolo = card('apolo'), ares = card('ares');
  ok(apolo && ares && /\/12/.test(txt(apolo)) && /\/13/.test(txt(ares)), `apolo (${txt(apolo)}) e ares (${txt(ares)}) mostram volumes DIFERENTES`);
}

// ---- 7. ALVO DE TOQUE (§234) + travada NÃO interativa ----
console.log('\n== 7. toque ≥76px no cartão aberto · travada não abre ==');
ok(parseFloat(w.getComputedStyle($('.mcard')).minHeight) >= 76, `cartão aberto ≥76px de toque (§234): ${w.getComputedStyle($('.mcard')).minHeight}`);
ok($$('.mlock').every(l => l.tagName === 'DIV' && !l.dataset.deus && typeof l.onclick !== 'function'), 'a TRAVADA é <div> sem data-deus e sem clique — NÃO abre (não afrouxa o §234)');

// ---- 8. ELO com o detalhe do deus, nos dois sentidos (só do cartão aberto) ----
console.log('\n== 8. elo com o detalhe do deus (do cartão aberto) ==');
{
  const aberto = $('.mcard[data-deus]'); const k = aberto.dataset.deus;
  w.eval(`[...document.querySelectorAll('.mcard[data-deus]')].find(b=>b.dataset.deus===${JSON.stringify(k)}).click();`);
  ok(w.eval("rotaAtual()==='deus'"), 'do cartão aberto vai-se ao detalhe do deus');
  w.eval("if(document.querySelector('[data-vermissao]')) document.querySelector('[data-vermissao]').click();");
  ok(w.eval("rotaAtual()==='provacoes'"), 'do detalhe do deus volta-se às Missões');
}

if (falhas) { console.log(`\n== ${passes} ok, ${falhas} FALHAS (jsdom) ==`); process.exit(1); }
console.log(`\n== jsdom OK (${passes}) — agora a varredura de LARGURA no Chromium ==`);

// ================= §312 — LARGURA: nada corta em 780/893/1075/1200; clamp do motivo não transborda ==========
(async () => {
  const { chromium } = require('playwright');
  function acharChromium() { try { const base = '/opt/pw-browsers'; const dir = fs.readdirSync(base).filter(x => /^chromium-\d+$/.test(x)).sort().pop(); const bin = path.join(base, dir, 'chrome-linux', 'chrome'); if (fs.existsSync(bin)) return bin; } catch (e) {} return undefined; }
  const distAbs = 'file://' + path.resolve(__dirname, '..', 'dist', 'incursion.html');
  const MOCK = "contaAtual={nick:'T',ranque:{pontos:150},perfil:{deuses:{hera:{copias:1},poseidon:{copias:1}}},missoes:{vitoriasPanteaoPvP:{Grega:5},sequenciaPvP:{zeus:1},sequenciaPanteaoPvP:{Grega:3},desbloqueio:{}}};ir('provacoes',{},{substituir:true});render();";
  let cf = 0; const ok2 = (c, m) => { if (!c) { cf++; console.log('  XX ' + m); } else console.log('  ok ' + m); };
  const browser = await chromium.launch({ executablePath: acharChromium(), headless: true });
  for (const W of [780, 893, 1075, 1200]) {
    const page = await (await browser.newContext({ viewport: { width: W, height: 428 }, deviceScaleFactor: 2 })).newPage();
    await page.goto(distAbs, { waitUntil: 'load' }); await page.evaluate(MOCK); await page.waitForTimeout(150);
    const r = await page.evaluate(() => {
      const rol = document.querySelector('.tela__rol');
      const overflowX = rol ? rol.scrollWidth - rol.clientWidth : 0;
      const card = document.querySelector('.mcard');
      const cardH = card ? Math.round(card.getBoundingClientRect().height) : 0;
      // clamp: o PIOR motivo (o mais longo dos 91) cabe em 2 linhas na largura da coluna do cartão?
      const mot = document.querySelector('.mcard__motivo'); const cs = getComputedStyle(mot); const lh = parseFloat(cs.lineHeight);
      let pior = ''; for (const k in MISSOES.missoes) { const mm = MISSOES.missoes[k].motivo || ''; if (mm.length > pior.length) pior = mm; }
      const clone = document.createElement('span'); clone.textContent = pior;
      clone.style.cssText = 'position:absolute;left:-9999px;visibility:hidden;white-space:normal;display:block;width:' + mot.clientWidth + 'px;font:' + cs.font;
      document.body.appendChild(clone); const natH = clone.offsetHeight; clone.remove();
      return { overflowX, cardH, idW: Math.round(mot.clientWidth), linhasPior: Math.round(natH / lh), lh: +lh.toFixed(1) };
    });
    ok2(r.overflowX <= 1, `${W}: nada corta na horizontal (overflowX ${r.overflowX})`);
    ok2(r.cardH >= 76, `${W}: cartão ≥76px (${r.cardH})`);
    ok2(r.linhasPior <= 2, `${W}: o pior motivo cabe em ${r.linhasPior} linha(s) na coluna (idW ${r.idW}) — clamp de 2 não corta`);
    await page.close();
  }
  await browser.close();
  if (cf) { console.log(`\n== ${cf} FALHA(S) de largura (Chromium) ==`); process.exit(1); }
  console.log('\n== TELA DAS MISSÕES §312 OK (jsdom + 4 larguras) ==');
  process.exit(0);
})().catch(e => { console.error(e.message || e); process.exit(1); });
