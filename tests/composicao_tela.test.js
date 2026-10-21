// §351 — A LISTA DE DESAFIOS DE COMPOSIÇÃO (renderDesafios, rota 'composicao') no visual da tela DESAFIOS (§339):
// TELA FIXA 1846×852 escalada. Cabeçalho (‹ DESAFIOS · "DESAFIOS DE COMPOSIÇÃO" · "X de Y cumpridos" + barra dourada)
// + linha de introdução + grade de cartões (ícone da regra, nome Cinzel, regraTexto, inimigos em miniaturas, recompensa
// N ✦, estado/ação). Vencido = selo ✓ + moldura dourada fina + "JOGAR DE NOVO"; aberto = "JOGAR". Nada das regras/
// recompensas/validação/montador (§344) muda. Prova a contagem/barra, cada cartão, as ações (abrem o montador com o id
// certo e o time vazio), o VOLTAR, e o ENCAIXE no Chromium (1846×852 e 780×360).
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
const clk = el => el.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));

const IDS = w.eval("desafios().map(d=>d.id)");
const TOTAL = IDS.length;

console.log('== §351 / LISTA DE DESAFIOS DE COMPOSIÇÃO (tela fixa, visual §339) ==');
ok(TOTAL >= 1, `há desafios de composição no dado (${TOTAL})`);

// marca 2 como vencidos e abre a lista (via hub → composicao, p/ o VOLTAR ter o hub abaixo)
err = null;
w.eval(`perfil.provacoes=perfil.provacoes||{}; perfil.provacoes['desafio:${IDS[0]}']={feito:true}; perfil.provacoes['desafio:${IDS[1]}']={feito:true};
  ir('desafios',{},{substituir:true}); ir('composicao'); render();`);
ok(!err, 'renderiza sem quebrar (' + (err || 'ok') + ')');
ok(!!$('#compfix.cmp2, .cmp2 #compfix'), 'monta na tela fixa (#compfix dentro de .cmp2)');

// ---- 1. CABEÇALHO: voltar + título + "X de Y cumpridos" + barra ----
console.log('\n== 1. cabeçalho: voltar · título · "X de Y cumpridos" + barra ==');
ok(/‹ DESAFIOS/.test(txt($('#bvoltar'))), 'o voltar diz "‹ DESAFIOS"');
ok(/DESAFIOS DE COMPOSIÇÃO/.test(txt($('.cmp-titulo'))), 'título "DESAFIOS DE COMPOSIÇÃO"');
ok(new RegExp(`2 de ${TOTAL} cumpridos`).test(txt($('.cmp-prog__n'))), `progresso "2 de ${TOTAL} cumpridos"`);
{
  const bar = $('.cmp-prog__bar i'); const wpct = bar && bar.style.width;
  ok(wpct === Math.round(2 / TOTAL * 100) + '%', `a barra dourada reflete o progresso (${wpct})`);
}
ok(/monta o time/i.test(txt($('.cmp-intro'))), 'a linha de introdução está presente');

// ---- 2. a GRADE: um cartão por desafio, com nome/regra/recompensa/inimigos e o botão certo ----
console.log('\n== 2. grade: um cartão por desafio; nome, regra, recompensa, inimigos, botão por estado ==');
ok($$('.cmp-grade .cmp-card').length === TOTAL, `um cartão por desafio (${$$('.cmp-grade .cmp-card').length}/${TOTAL})`);
for (const id of IDS) {
  const dsf = w.eval(`desafios().find(d=>d.id===${JSON.stringify(id)})`);
  const feito = w.eval(`desafioFeito(${JSON.stringify(id)})`);
  const btn = $(`[data-desafio="${id}"]`);
  const card = btn && btn.closest('.cmp-card');
  ok(!!card, `${id}: o cartão existe`);
  ok(txt(card.querySelector('.cmp-card__n')) === dsf.nome, `${id}: nome "${dsf.nome}"`);
  ok(txt(card.querySelector('.cmp-card__regra')) === dsf.regraTexto, `${id}: mostra a regraTexto`);
  const r = w.eval(`recompensaDesafio(${JSON.stringify(dsf.recompensa)})`);
  if (r.essencia) ok(new RegExp(r.essencia + ' ✦').test(txt(card.querySelector('.cmp-card__rec'))), `${id}: recompensa "${r.essencia} ✦"`);
  if ((dsf.inimigos || []).length) {
    ok(card.querySelectorAll('.cmp-foe').length >= 1 && !!card.querySelector('.cmp-card__foeslab'), `${id}: miniaturas dos inimigos com rótulo`);
    const primeiro = w.eval(`metaComb(${JSON.stringify(dsf.inimigos[0])}).curto`) || '';
    ok(txt(card.querySelector('.cmp-foe .cmp-foe__n')).length > 0, `${id}: a miniatura traz o nome do bestiário (ex.: ${primeiro})`);
  }
  if (feito) {
    ok(card.classList.contains('cmp-card--feito') && !!card.querySelector('.cmp-card__selo') && /Vencido/.test(txt(card.querySelector('.cmp-card__won'))), `${id}: VENCIDO → selo ✓ + moldura + "✓ Vencido"`);
    ok(/JOGAR DE NOVO/.test(txt(btn)) && btn.classList.contains('cmpb--quiet'), `${id}: VENCIDO → botão secundário "JOGAR DE NOVO"`);
  } else {
    ok(!card.classList.contains('cmp-card--feito') && txt(btn) === 'JOGAR' && btn.classList.contains('cmpb--primary'), `${id}: ABERTO → botão dourado "JOGAR"`);
  }
}

// ---- 3. JOGAR / JOGAR DE NOVO abrem o montador com o id certo e o time VAZIO ----
console.log('\n== 3. JOGAR e JOGAR DE NOVO → montador (id certo, time vazio) ==');
{
  const aberto = IDS.find(id => !w.eval(`desafioFeito(${JSON.stringify(id)})`));
  w.eval("desafioTimePick=['zeus'];");   // sujeira proposital: tem de zerar ao abrir
  clk($(`[data-desafio="${aberto}"]`));
  ok(w.eval("rotaAtual()") === 'desafiomontar', 'JOGAR abre o montador (rota desafiomontar)');
  ok(w.eval("(paramsAtuais()||{}).id") === aberto, 'o montador abre no id certo');
  ok(w.eval("desafioTimePick.length") === 0, 'o time começa VAZIO (desafioTimePick=[])');
  // JOGAR DE NOVO de um vencido
  w.eval(`ir('composicao',{},{substituir:true}); desafioTimePick=['ogum']; render();`);
  clk($(`[data-desafio="${IDS[0]}"]`));
  ok(w.eval("rotaAtual()") === 'desafiomontar' && w.eval("(paramsAtuais()||{}).id") === IDS[0] && w.eval("desafioTimePick.length") === 0, 'JOGAR DE NOVO reabre o mesmo desafio com o time vazio');
}

// ---- 4. VOLTAR vai para 'desafios' ----
console.log('\n== 4. VOLTAR → hub de Desafios ==');
w.eval(`ir('desafios',{},{substituir:true}); ir('composicao'); render();`);
clk($('#bvoltar'));
ok(w.eval("rotaAtual()") === 'desafios', 'o "‹ DESAFIOS" volta para o hub de Desafios');

if (falhas) { console.log(`\n== ${passes} ok, ${falhas} FALHAS (jsdom) ==`); process.exit(1); }
console.log(`\n== jsdom OK (${passes}) — agora o ENCAIXE no Chromium (1846×852 e 780×360) ==`);

// ================= §351 — ENCAIXE: a tela fixa enche o palco; cabeçalho/introdução/cartões dentro (≤830),
//                   nada se sobrepõe, nenhum texto corta (mede os FILHOS). 1846×852 e 780×360. =================
(async () => {
  const { chromium } = require('playwright');
  function acharChromium() { try { const base = '/opt/pw-browsers'; const dir = fs.readdirSync(base).filter(x => /^chromium-\d+$/.test(x)).sort().pop(); const bin = path.join(base, dir, 'chrome-linux', 'chrome'); if (fs.existsSync(bin)) return bin; } catch (e) {} return undefined; }
  const distAbs = 'file://' + path.resolve(__dirname, '..', 'dist', 'incursion.html');
  const MK = `perfil.provacoes=perfil.provacoes||{};perfil.provacoes['desafio:${IDS[0]}']={feito:true};perfil.provacoes['desafio:${IDS[1]}']={feito:true};ir('composicao',{},{substituir:true});render();`;
  const browser = await chromium.launch({ executablePath: acharChromium(), headless: true });
  let cf = 0; const ok2 = (c, m) => { if (!c) { cf++; console.log('  XX ' + m); } else console.log('  ok ' + m); };
  for (const [W, H] of [[1846, 852], [780, 360]]) {
    const page = await (await browser.newContext({ viewport: { width: W, height: H } })).newPage();
    await page.goto(distAbs, { waitUntil: 'load' });
    const r = await page.evaluate((MK) => {
      eval(MK); const g = document.getElementById('gsplash'); if (g) g.remove();
      const fix = document.getElementById('compfix'), fb = fix.getBoundingClientRect();
      const esc = fb.height / 852;
      const pw = fb.width / innerWidth, ph = fb.height / innerHeight;
      const designBot = el => Math.round((el.getBoundingClientRect().bottom - fb.top) / esc);
      // FILHOS: cabeçalho + introdução + cada cartão (os 6 reais cabem em 2 fileiras, sem rolar)
      let botMax = 0, pior = '';
      [...fix.querySelectorAll('.cmp-cab,.cmp-intro'), ...fix.querySelectorAll('.cmp-grade .cmp-card')].forEach(el => {
        const b = designBot(el); if (b > botMax) { botMax = b; pior = el.className.split(' ')[0]; }
      });
      // overflow horizontal da grade
      const grade = fix.querySelector('.cmp-grade'); const over = grade.scrollWidth - grade.clientWidth;
      // sobreposição entre cartões vizinhos (mesma fileira)
      const cards = [...fix.querySelectorAll('.cmp-card')].map(c => c.getBoundingClientRect());
      let overlap = false;
      for (let i = 0; i < cards.length; i++) for (let j = i + 1; j < cards.length; j++) {
        const a = cards[i], b = cards[j];
        if (a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1) overlap = true;
      }
      // texto cortado (ignora a regra, que é clamp proposital de 2 linhas)
      let clips = [];
      fix.querySelectorAll('.cmp-titulo,.cmp-prog__n,.cmp-card__n,.cmp-foe__n,.cmpb,.cmp-card__rec,.cmp-card__won').forEach(el => { if (el.scrollWidth > el.clientWidth + 1.5) clips.push(el.className.split(' ')[0]); });
      return { pw, ph, botMax, pior, over, overlap, clips: [...new Set(clips)].slice(0, 6) };
    }, MK);
    ok2(Math.min(r.pw, r.ph) >= 0.98, `§351 @${W}×${H}: enche a tela (${(r.pw * 100).toFixed(1)}%×${(r.ph * 100).toFixed(1)}%)`);
    ok2(r.botMax <= 831, `§351 @${W}×${H}: cabeçalho/introdução/cartões terminam em y≤830 (pior ${r.botMax} em ${r.pior})`);
    ok2(!r.overlap, `§351 @${W}×${H}: os cartões não se sobrepõem`);
    ok2(r.over <= 2, `§351 @${W}×${H}: a grade não corta na horizontal (over ${r.over})`);
    ok2(r.clips.length === 0, `§351 @${W}×${H}: nenhum texto corta (${r.clips.join(',') || 'ok'})`);
    await page.close();
  }
  await browser.close();
  if (cf || falhas) { console.log(`\n== ${cf} falha(s) de encaixe + ${falhas} jsdom ==`); process.exit(1); }
  console.log('\n== LISTA DE DESAFIOS DE COMPOSIÇÃO §351 OK (jsdom + Chromium) ==');
  process.exit(0);
})().catch(e => { console.error(e.stack || e.message || e); process.exit(1); });
