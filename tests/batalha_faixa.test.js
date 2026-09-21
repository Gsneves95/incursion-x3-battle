// batalha_faixa.test.js (§299) — GUARDA BABÁ da tela de batalha refeita: a FAIXA de efeitos ACIMA das
// fichas, o PAINEL lateral removido, a LEITURA no rodapé e a CITAÇÃO de repouso.
//
// Declara o ESPAÇO DE ESTADOS (convenção §295) e o percorre INTEIRO:
//   • duas escalas — o palco de 780 (piso) E de 951 (folga), o mesmo design 780×428 escalado;
//   • 0 a 6 efeitos por unidade (o pior EMPILHAMENTO real medido é 4; 6 é margem);
//   • os dois lados (aliado com fichas, inimigo só retrato).
// E crava as decisões da fatia 2:
//   1) NENHUM efeito colapsa em "+N" (o compromisso do §266 acabou) — todo chip numérico mostra a magnitude;
//   2) NADA corta, nas duas escalas, com 0..6 efeitos (a faixa vive na banda ACIMA das fichas, dentro do board);
//   3) a LEITURA aparece no rodapé ao tocar habilidade E ao tocar inimigo; a CITAÇÃO volta no repouso;
//   4) a FICHA continua em 90 e o RESPIRO do §239 se mantém (a moldura une retrato+fichas; o retrato pop acima).
//
// Chromium (não jsdom): a faixa "acima das fichas" e o "não corta" são medidos por rect real.

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

function acharChromium() {
  if (process.env.INCURSION_CHROMIUM) return process.env.INCURSION_CHROMIUM;
  try {
    const base = '/opt/pw-browsers';
    const dir = fs.readdirSync(base).filter(d => /^chromium-\d+$/.test(d)).sort().pop();
    if (dir) { const bin = path.join(base, dir, 'chrome-linux', 'chrome'); if (fs.existsSync(bin)) return bin; }
  } catch (e) {}
  return undefined;
}

let falhas = 0;
const ok = (c, m) => { if (!c) { falhas++; console.log('  XX ' + m); } };
const distAbs = path.resolve(__dirname, '..', 'dist', 'incursion.html');
// as duas ESCALAS: 780×640 → escala 1.0 (piso) · 951×640 → escala ~1.22 (folga), mesmo design 780×428
const ESCALAS = [{ nome: 'piso 780', w: 780, h: 640 }, { nome: 'folga 951', w: 951, h: 640 }];

(async () => {
  const browser = await chromium.launch({ executablePath: acharChromium(), headless: true, args: ['--no-sandbox'] });

  for (const E of ESCALAS) {
    const ctx = await browser.newContext({ viewport: { width: E.w, height: E.h }, deviceScaleFactor: 2 });
    const page = await ctx.newPage();
    await page.goto('file://' + distAbs, { waitUntil: 'load' });
    console.log(`== §299 ${E.nome} (${E.w}×${E.h}) ==`);

    // entra na batalha e semeia NEF efeitos em TODAS as unidades dos dois lados
    const entrar = (nef) => page.evaluate((nef) => {
      st = montarProvacao({ aliados: ['zeus', 'ogum', 'tyr'], inimigos: ['silfo', 'ghoul', 'quimera'], montar: { seed: 3, comeca: 0 } });
      prova = null; provaFim = null; campanha = null; campanhaFim = null; vsCPU = true; try { pararRelogio(); } catch (e) {}
      const pool = [{ type: 'dmgUp', v: 8, dur: 3 }, { type: 'vulneravel', v: 6, dur: 2 }, { type: 'dmgReduction', v: 5, dur: 4 },
        { type: 'regen', v: 10, dur: 9 }, { type: 'dmgDown', v: 4, dur: 2 }, { type: 'adormecido', dur: 1 }];
      const seed = (u) => { u.efeitos = pool.slice(0, Math.min(nef, pool.length)).map(x => ({ ...x })); u.dots = nef > pool.length ? [{ nome: 'queimadura', dur: 2, dano: 5 }] : []; };
      if (nef > 0) { st.lados[0].units.forEach(seed); st.lados[1].units.forEach(seed); }
      armado = null; peekKit = null; detalhe = null; kitSel = null;
      ir('batalha', {}, { substituir: true }); render();
    }, nef);

    const medir = () => page.evaluate(() => {
      const e = ultimaEscala || 1; const R = el => el.getBoundingClientRect();
      const board = R(document.querySelector('.board'));
      let clip = 0;
      const scan = sel => document.querySelectorAll(sel).forEach(el => { const r = R(el); if (r.width < 1 || r.height < 1) return;
        if (r.bottom > board.bottom + 0.5) clip = Math.max(clip, (r.bottom - board.bottom) / e);
        if (r.top < board.top - 0.5) clip = Math.max(clip, (board.top - r.top) / e); });
      scan('.fxstrip .effect'); scan('.brow__tiles'); scan('.portrait'); scan('.fxstrip');
      // faixa ACIMA das fichas (aliado) e do retrato (inimigo)
      let acimaAlly = true, acimaFoe = true;
      document.querySelectorAll('.brow').forEach(b => {
        const fa = b.querySelector('.fxstrip--ally'), ti = b.querySelector('.brow__tiles');
        if (fa && ti && fa.children.length) acimaAlly = acimaAlly && (R(fa).bottom <= R(ti).top + 1);
        const fe = b.querySelector('.fxstrip--enemy'), po = b.querySelector('.brow__enemy .portrait');
        if (fe && po && fe.children.length) acimaFoe = acimaFoe && (R(fe).bottom <= R(po).top + 1);
      });
      const chips = document.querySelectorAll('.fxstrip .effect').length;
      const fxmore = document.querySelectorAll('.fxmore').length;
      // chips numéricos: quantos deveriam ter magnitude vs quantos têm .effect__v
      const magChips = document.querySelectorAll('.fxstrip .effect--mag').length;
      const magVals = document.querySelectorAll('.fxstrip .effect--mag .effect__v').length;
      const skill = R(document.querySelector('.skill'));
      return { clip: +clip.toFixed(2), acimaAlly, acimaFoe, chips, fxmore, magChips, magVals,
        skillW: Math.round(skill.width / e), skillH: Math.round(skill.height / e) };
    });

    for (let nef = 0; nef <= 6; nef++) {
      await entrar(nef); await page.waitForTimeout(60);
      const m = await medir();
      ok(m.clip === 0, `${E.nome} ${nef}ef: NADA corta (clip ${m.clip}px)`);
      ok(m.fxmore === 0, `${E.nome} ${nef}ef: nenhum "+N" (colapso removido; fxmore ${m.fxmore})`);
      ok(m.acimaAlly && m.acimaFoe, `${E.nome} ${nef}ef: a faixa fica ACIMA das fichas/retrato (ally ${m.acimaAlly}, foe ${m.acimaFoe})`);
      ok(m.magChips === m.magVals && m.magVals >= 0, `${E.nome} ${nef}ef: todo chip de magnitude MOSTRA o número (${m.magVals}/${m.magChips})`);
      if (nef > 0) ok(m.chips >= 6, `${E.nome} ${nef}ef: os efeitos aparecem (chips ${m.chips}, ${nef}/unidade × 6 vivos)`);
      ok(m.skillW === 90 && m.skillH === 90, `${E.nome} ${nef}ef: a FICHA continua 90×90 (veio ${m.skillW}×${m.skillH})`);
    }

    // §239 RESPIRO: a moldura une retrato+fichas e o retrato POP acima da borda de cima da placa (repouso)
    await entrar(0); await page.waitForTimeout(60);
    const resp = await page.evaluate(() => {
      const R = el => el.getBoundingClientRect();
      const brow = document.querySelector('.brow'), unit = brow.querySelector('.brow__unit');
      const cs = getComputedStyle(unit, '::before'); const insetT = parseFloat(cs.top) || 0;
      const por = R(brow.querySelector('.brow__ally .portrait'));
      const ur = R(unit); const plateT = ur.top + insetT;
      const tLastR = [...brow.querySelectorAll('.brow__tiles .skill')].map(R).pop().right;
      return { pop: por.top < plateT - 0.5, unitCobreFichas: ur.right >= tLastR - 1, unitCobreRetrato: ur.left <= por.left + 1 };
    });
    ok(resp.pop, `${E.nome}: §239 o retrato POP acima da borda de cima da placa`);
    ok(resp.unitCobreRetrato && resp.unitCobreFichas, `${E.nome}: §239 a moldura une retrato + fichas`);

    // LEITURA no rodapé: repouso=citação · tocar habilidade=leitura · tocar inimigo=kit · volta à citação
    await entrar(0); await page.waitForTimeout(40);
    const leituras = await page.evaluate(() => {
      const out = {};
      // repouso
      out.repousoCite = !!document.querySelector('.footer .acao__cite') && (document.querySelector('.footer .acao__cite').textContent || '').length > 8;
      // tocar habilidade (armar)
      const u = st.lados[st.ativo].units[0]; const a = acoesDe(st, u).find(x => x.disponivel) || acoesDe(st, u)[0];
      armado = { uid: u.uid, slot: a.slot, passos: a.passos || ['inimigo'], distribui: false }; peekKit = null; detalhe = null; render();
      out.habLeitura = !!document.querySelector('.footer .leitura__nome') && !document.querySelector('.footer .acao__cite');
      // tocar inimigo (kit)
      armado = null; peekKit = st.lados[1].units[0].uid; kitSel = null; render();
      out.inimKit = !!document.querySelector('.footer .leitura__kstrip') && !document.querySelector('.footer .acao__cite');
      // volta ao repouso
      peekKit = null; armado = null; detalhe = null; render();
      out.voltaCite = !!document.querySelector('.footer .acao__cite');
      // sem painel lateral
      out.semPainel = !document.querySelector('.panel');
      return out;
    });
    ok(leituras.repousoCite, `${E.nome}: repouso mostra a CITAÇÃO (dado)`);
    ok(leituras.habLeitura, `${E.nome}: tocar HABILIDADE troca pela leitura no rodapé`);
    ok(leituras.inimKit, `${E.nome}: tocar INIMIGO troca pelo kit no rodapé`);
    ok(leituras.voltaCite, `${E.nome}: dispensado o foco, a citação VOLTA ao repouso`);
    ok(leituras.semPainel, `${E.nome}: não há painel lateral (§299)`);

    // §300: o disco da ficha é QUADRADO ARREDONDADO (raio 6), a arte PREENCHE o quadrado (sem recorte
    // circular), a ficha segue 90×90 e nada corta — nas duas escalas.
    await entrar(0); await page.waitForTimeout(40);
    await page.waitForFunction(() => { const im = document.querySelector('.brow__tiles .skill .slot__art'); return im && im.complete && im.naturalWidth > 0; }, { timeout: 6000 }).catch(() => {});
    const forma = await page.evaluate(() => {
      const R = el => el.getBoundingClientRect();
      const disc = document.querySelector('.brow__tiles .skill .skill__disc');
      const cs = getComputedStyle(disc);
      const cd = document.querySelector('.skill__cd'), lock = document.querySelector('.skill__lock'), na = document.querySelector('.skill__na');
      // a arte (slot__art) cobre o disco inteiro → object-fit cover num quadrado: sem faixa/canto vazio
      // a arte (slot__art) preenche o INTERIOR do disco (object-fit cover); a caixa da img = disco menos a
      // borda (1–2px) → tolerância 5px. (Se os PIXELS da arte chegam ao canto é trabalho de arte por deus —
      // aqui garantimos que o CONTÊINER quadrado mostra a arte que o preenche, sem recorte circular.)
      const art = document.querySelector('.brow__tiles .skill .slot__art');
      const dr = R(disc), ar = art ? R(art) : null;
      const cobre = ar ? (Math.abs(ar.width - dr.width) <= 5 && Math.abs(ar.height - dr.height) <= 5) : false;
      const board = R(document.querySelector('.board'));
      let clip = 0; document.querySelectorAll('.brow__tiles .skill, .brow__tiles .skill__cost').forEach(el => { const r = R(el); if (r.bottom > board.bottom + 0.5) clip = Math.max(clip, r.bottom - board.bottom); if (r.top < board.top - 0.5) clip = Math.max(clip, board.top - r.top); });
      const cost = document.querySelector('.brow__tiles .skill__cost');
      const cbot = cost ? (R(document.querySelector('.brow__tiles .skill')).bottom - R(cost).bottom) / (ultimaEscala || 1) : null;
      return { radius: cs.borderRadius, overflow: cs.overflow, cobre, hasArt: !!art,
        cdR: getComputedStyle(cd).borderRadius, lockR: getComputedStyle(lock).borderRadius, naR: getComputedStyle(na).borderRadius,
        skillW: Math.round(R(document.querySelector('.brow__tiles .skill')).width / (ultimaEscala || 1)),
        clip: +clip.toFixed(1), cbot: cbot == null ? null : +cbot.toFixed(1) };
    });
    ok(forma.radius === '6px', `${E.nome} §300: o disco é quadrado arredondado (raio 6, veio ${forma.radius})`);
    ok(forma.overflow === 'hidden', `${E.nome} §300: o disco recorta a arte ao quadrado (overflow hidden)`);
    ok(forma.cdR === '6px' && forma.lockR === '6px' && forma.naR === '6px', `${E.nome} §300: as máscaras de estado acompanham o raio 6 (cd ${forma.cdR}/lock ${forma.lockR}/na ${forma.naR})`);
    ok(!forma.hasArt || forma.cobre, `${E.nome} §300: a arte PREENCHE o quadrado inteiro (slot__art cobre o disco, sem canto vazio)`);
    ok(forma.skillW === 90, `${E.nome} §300: a ficha segue 90 (veio ${forma.skillW})`);
    ok(forma.clip === 0, `${E.nome} §300: nada corta com o disco quadrado (clip ${forma.clip})`);
    ok(forma.cbot != null && forma.cbot >= 0 && forma.cbot <= 14, `${E.nome} §300: os orbes de custo continuam na base (bottom ${forma.cbot}px, 0..14)`);

    await ctx.close();
  }

  await browser.close();
  console.log(falhas === 0 ? '\n>>> BATALHA_FAIXA OK' : `\n>>> ${falhas} FALHA(S)`);
  process.exit(falhas ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
