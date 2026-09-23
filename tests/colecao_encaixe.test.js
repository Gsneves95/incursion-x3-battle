// colecao_encaixe.test.js (§292) — ENCAIXE da caixa de efeito da sobreposição de detalhe da Coleção, em navegador
// REAL, NO PISO DE 780 e percorrendo os QUATRO slots (básico/habilidade/milagre/passiva) dos 100 deuses.
//
// Por que existe: o §291 disse "0/400 corta" e ERROU por DUAS razões — mediu só a 951 (largura folgada, onde o
// card é 877 e o texto cabe) e só o slot básico (default), enquanto o texto longo mora em habilidade/milagre/
// passiva. No piso 780 o card é 706, a coluna de conteúdo é ~100px mais estreita e o texto quebra em mais linhas.
// Este babá fecha as DUAS falhas: mede a 780 E a 951, e os 400 slots. jsdom não serve (não faz layout → rect 0).
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

function acharChromium() {
  if (process.env.INCURSION_CHROMIUM) return process.env.INCURSION_CHROMIUM;
  try {
    const base = '/opt/pw-browsers';
    const dir = fs.readdirSync(base).filter(d => /^chromium-\d+$/.test(d)).sort().pop();
    if (dir) { const bin = path.join(base, dir, 'chrome-linux', 'chrome'); if (fs.existsSync(bin)) return bin; }
  } catch (e) { /* deixa o playwright resolver */ }
  return undefined;
}

let falhas = 0;
const ok = (c, m) => { if (!c) { falhas++; console.log('  XX ' + m); } };

(async () => {
  const distAbs = path.resolve(__dirname, '..', 'dist', 'incursion.html');
  const browser = await chromium.launch({ executablePath: acharChromium(), headless: true });
  const page = await (await browser.newContext()).newPage();
  await page.goto('file://' + distAbs, { waitUntil: 'load' });

  // percorre os 400 slots e devolve os que CORTAM ou ROLAM (scrollHeight > clientHeight) + a proporção.
  // §295: mede NOS DOIS ESTADOS DE POSSE — o §292 media só possuído (semeava tudo) e não via o não-possuído (mesma
  // cegueira de escopo do §291). O não-possuído põe o selo "Você não possui" e a classe col2ov--falta na sobreposição.
  async function medir(possuir) {
    return await page.evaluate((poss) => {
      if (poss) ROSTER.forEach(e => { perfil.deuses[e.key] = perfil.deuses[e.key] || { obtidoEm: Date.now(), copias: 1 }; });
      else perfil.deuses = {};
      ir('colecao', {}, { substituir: true }); render();
      const bad = []; let chipsH = 0, boxH = 0;
      for (const e of ROSTER) {
        colAbrirVer(e.key);
        if (!chipsH) { chipsH = Math.round(document.querySelector('.col2ov__sks').getBoundingClientRect().height); boxH = Math.round(document.querySelector('.col2ov__det').getBoundingClientRect().height); }
        for (const slot of ['basico', 'habilidade', 'milagre', 'passiva']) {
          const chip = document.querySelector('#col2ov .col2ov__sk[data-versel="' + slot + '"]');
          if (chip) chip.dispatchEvent(new MouseEvent('click', { bubbles: true }));
          const dt = document.querySelector('#col2ovdet .col2ov__deftxt');
          if (!dt) continue;
          if (dt.scrollHeight > dt.clientHeight + 1) bad.push(e.key + '.' + slot + ' +' + (dt.scrollHeight - dt.clientHeight) + 'px');
        }
        colFecharVer();
      }
      return { bad, chipsH, boxH, larg: (typeof ultimaLarguraDesign !== 'undefined' ? ultimaLarguraDesign : innerWidth) };
    }, possuir);
  }

  console.log('== §292: nenhum dos 400 textos de efeito corta/rola — a 780 (piso) E a 951 (folga), possuído E não ==');
  for (const W of [780, 951]) {
    await page.setViewportSize({ width: W, height: 428 });
    for (const poss of [true, false]) {
      const r = await medir(poss);
      const rot = poss ? 'possuído' : 'NÃO possuído';
      ok(r.bad.length === 0, `design ${r.larg} [${rot}]: ${r.bad.length}/400 textos cortam/rolam` + (r.bad.length ? ' → ' + r.bad.slice(0, 8).join(' · ') : ''));
      // §292 parte D: a caixa de detalhe tem de ser MAIOR que o seletor (o seletor não pode dominar o que seleciona)
      ok(r.boxH > r.chipsH, `design ${r.larg} [${rot}]: a caixa de detalhe (${r.boxH}) deve ser maior que a fileira de chips (${r.chipsH})`);
      console.log(`  design ${r.larg} [${rot}]: ${400 - r.bad.length}/400 inteiros · caixa ${r.boxH} > chips ${r.chipsH}`);
    }
  }

  // (§304b) A FRASE saiu da sobreposição: virou conteúdo do DESTAQUE (só a tela de invocação a mostra). O §288
  // reservava g.frase → col2ov__cite AQUI; o §292/§295 provou que a sobreposição NÃO tem orçamento (uma cite corta
  // a caixa de efeito). §304b resolve: a Coleção NÃO renderiza a cite, NEM com `frase` no dado. Esta guarda confirma
  // que a sobreposição continua SEM LUGAR para a frase: (A) mesmo semeando frase em todos, ZERO cite aparece e ZERO
  // efeito corta; (B) mede a folga vertical da caixa de efeito (~0), o motivo de a frase morar no destaque, não aqui.
  await page.setViewportSize({ width: 780, height: 428 });
  const frase = await page.evaluate(() => {
    ROSTER.forEach(e => { perfil.deuses[e.key] = perfil.deuses[e.key] || { obtidoEm: Date.now(), copias: 1 }; });
    const F = 'Aquele que caminha entre os mundos e nunca teme a morte alheia ou a sua';
    ROSTER.forEach(e => { if (GODS[e.key]) GODS[e.key].frase = F; });   // semeia frase em TODOS (o pior caso)
    ir('colecao', {}, { substituir: true }); render();
    let cites = 0, corta = 0, folgaMin = 1e9;
    for (const e of ROSTER) {
      colAbrirVer(e.key);
      if (document.querySelector('#col2ov .col2ov__cite')) cites++;   // §304b: deve seguir 0 (a Coleção não mostra frase)
      for (const slot of ['basico', 'habilidade', 'milagre', 'passiva']) {
        const chip = document.querySelector('#col2ov .col2ov__sk[data-versel="' + slot + '"]'); if (chip) chip.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        const dt = document.querySelector('#col2ovdet .col2ov__deftxt'); if (dt) { if (dt.scrollHeight > dt.clientHeight + 1) corta++; folgaMin = Math.min(folgaMin, dt.clientHeight - dt.scrollHeight); }
      }
      colFecharVer();
    }
    ROSTER.forEach(e => { if (GODS[e.key]) delete GODS[e.key].frase; });   // limpa o synthetic
    return { cites, corta, folgaMin, fraseLen: F.length };
  });
  ok(frase.cites === 0, `§304b: a sobreposição da Coleção NÃO renderiza citação nem com frase no dado (viram ${frase.cites} cites) — a frase é do destaque, não do elenco`);
  ok(frase.corta === 0, `§304b: sem cite na sobreposição, nenhum efeito corta (${frase.corta}/400) — a frase não rouba o orçamento daqui`);
  console.log(`  §304b FRASE — a Coleção não comporta a cite (folga da caixa de efeito ~${frase.folgaMin}px, medida §292): por isso a frase mora no DESTAQUE (tela de invocação, ~200-220 chars). Com frase em todos: ${frase.cites} cites, ${frase.corta}/400 cortes na Coleção.`);

  await browser.close();
  console.log(falhas === 0 ? '\n>>> COLEÇÃO-ENCAIXE OK' : `\n>>> ${falhas} FALHA(S)`);
  process.exit(falhas ? 1 : 0);
})();
