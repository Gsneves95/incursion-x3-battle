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

  // (§295-cont) A FRASE (g.frase → col2ov__cite) é a dimensão que vai MORDER: o campo foi reservado no §288 p/ o dono
  // escrever as 100; hoje 0/100 têm, então o bloco nunca renderiza cheio e nenhuma guarda o via — a assinatura exata do
  // problema (a guarda percorre o que EXISTE NO DADO, não o que o CÓDIGO desenha). Aqui a dimensão é coberta ANTES da
  // frase existir: (A) guarda de dado — enquanto a sobreposição não tiver ORÇAMENTO p/ a cite, nenhum deus pode ter
  // frase (o dia que a 1ª entrar, ISTO quebra e força a decisão de onde a frase mora); (B) medição — semeia uma frase
  // sintética de ~70 chars e imprime QUANTO corta, p/ o dono saber o orçamento antes de escrever.
  await page.setViewportSize({ width: 780, height: 428 });
  const frase = await page.evaluate(() => {
    ROSTER.forEach(e => { perfil.deuses[e.key] = perfil.deuses[e.key] || { obtidoEm: Date.now(), copias: 1 }; });
    // (A) nenhum deus tem frase HOJE (a sobreposição não tem orçamento p/ a cite — medido §295)
    const comFrase = ROSTER.filter(e => GODS[e.key] && GODS[e.key].frase).map(e => e.key);
    // (B) mede o orçamento: semeia 70 chars em todos e conta os efeitos que passam a cortar (piso 780, o pior)
    const F = 'Aquele que caminha entre os mundos e nunca teme a morte alheia ou a sua';
    ROSTER.forEach(e => { if (GODS[e.key]) GODS[e.key].frase = F; });
    ir('colecao', {}, { substituir: true }); render();
    let corta = 0, citeH = 0;
    for (const e of ROSTER) {
      colAbrirVer(e.key);
      const cite = document.querySelector('.col2ov__cite'); if (cite && !citeH) citeH = Math.round(cite.getBoundingClientRect().height);
      for (const slot of ['basico', 'habilidade', 'milagre', 'passiva']) {
        const chip = document.querySelector('#col2ov .col2ov__sk[data-versel="' + slot + '"]'); if (chip) chip.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        const dt = document.querySelector('#col2ovdet .col2ov__deftxt'); if (dt && dt.scrollHeight > dt.clientHeight + 1) corta++;
      }
      colFecharVer();
    }
    ROSTER.forEach(e => { if (GODS[e.key]) delete GODS[e.key].frase; });   // limpa o synthetic
    return { comFrase, citeH, corta, fraseLen: F.length };
  });
  ok(frase.comFrase.length === 0, `§295: ${frase.comFrase.length} deuses já têm g.frase (${frase.comFrase.slice(0, 5).join(',')}) — a sobreposição NÃO tem orçamento p/ a cite (medido: uma frase corta a caixa de efeito). Dê uma casa à frase (fora da caixa de efeito do §292) ANTES de escrevê-las, senão cortam.`);
  console.log(`  §295 FRASE — orçamento medido: uma frase de ${frase.fraseLen} chars (cite ${frase.citeH}px) faria ${frase.corta}/400 efeitos CORTAREM a 780. Orçamento atual da cite na sobreposição: ~0 (a caixa de efeito do §292 tem só ~6px de folga). Nenhum deus tem frase hoje: ${frase.comFrase.length === 0 ? 'ok' : 'JÁ QUEBROU'}.`);

  await browser.close();
  console.log(falhas === 0 ? '\n>>> COLEÇÃO-ENCAIXE OK' : `\n>>> ${falhas} FALHA(S)`);
  process.exit(falhas ? 1 : 0);
})();
