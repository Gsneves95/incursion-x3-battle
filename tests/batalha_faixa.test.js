// batalha_faixa.test.js (§328) — GUARDA BABÁ da tela de batalha: as ETIQUETAS de efeito LEGÍVEIS, empilhadas
// LOGO ABAIXO da barra de vida, nos DOIS lados, sem cortar o enquadramento.
//
// Troca a faixa de chips do §299 (acima das fichas, sem "+N") pelo layout do §328:
//   • cada efeito vira uma ETIQUETA com NOME escrito (nunca só ícone) + valor/acúmulo + selinho de TURNOS;
//   • as etiquetas ficam ABAIXO da barra de vida do retrato (os dois lados);
//   • cabem ATÉ 3 por retrato (o retrato encolheu p/ 58 e a banda por fileira é ~102px de design); o resto é "+N";
//   • NADA corta na vertical, nas aspect-ratios reais do celular (20:9 e 16:9) e no piso estreito.
//
// Declara o ESPAÇO DE ESTADOS (convenção §295) e o percorre INTEIRO: 0..6 efeitos por unidade, os dois lados,
// três enquadramentos. Chromium (não jsdom): "abaixo da vida" e "não corta" são medidos por rect real.

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
// os enquadramentos que o §328 exige verdes: 20:9 e 16:9 (aspect do celular), mais o piso estreito do palco.
// O clip é medido em px de DESIGN (dividido por ultimaEscala), então é invariante à escala — mas variar a
// aspect-ratio muda qual eixo manda e a largura de design, exercitando o layout em condições reais.
const ESCALAS = [
  { nome: '20:9 1600', w: 1600, h: 720 },   // aspect 2.22 — ultrawide do celular
  { nome: '16:9 1280', w: 1280, h: 720 },   // aspect 1.78
  { nome: 'piso 780',  w: 780,  h: 640 },   // palco estreito (piso de largura de design)
];
const FXTAGS_MAX = 3;   // deve bater com src/ui/campo.js

(async () => {
  const browser = await chromium.launch({ executablePath: acharChromium(), headless: true, args: ['--no-sandbox'] });

  for (const E of ESCALAS) {
    const ctx = await browser.newContext({ viewport: { width: E.w, height: E.h }, deviceScaleFactor: 2 });
    const page = await ctx.newPage();
    await page.goto('file://' + distAbs, { waitUntil: 'load' });
    console.log(`== §328 ${E.nome} (${E.w}×${E.h}) ==`);

    // entra na batalha e semeia NEF efeitos em TODAS as unidades dos dois lados
    const entrar = (nef) => page.evaluate((nef) => {
      st = montarProvacao({ aliados: ['zeus', 'ogum', 'tyr'], inimigos: ['silfo', 'ghoul', 'quimera'], montar: { seed: 3, comeca: 0 } });
      prova = null; provaFim = null; campanha = null; campanhaFim = null; vsCPU = true; try { pararRelogio(); } catch (e) {}
      const pool = [{ type: 'dmgUp', v: 8, dur: 3 }, { type: 'vulneravel', v: 6, dur: 2 }, { type: 'dmgReduction', v: 5, dur: 4 },
        { type: 'regen', v: 10, dur: 9 }, { type: 'dmgDown', v: 4, dur: 2 }, { type: 'adormecido', dur: 1 }];
      const seed = (u) => { u.efeitos = pool.slice(0, Math.min(nef, pool.length)).map(x => ({ ...x })); u.dots = nef > pool.length ? [{ nome: 'queimadura', dur: 2, v: 5 }] : []; };
      if (nef > 0) { st.lados[0].units.forEach(seed); st.lados[1].units.forEach(seed); }
      armado = null; peekKit = null; detalhe = null; kitSel = null; inspec = null;
      ir('batalha', {}, { substituir: true }); render();
    }, nef);

    const medir = () => page.evaluate(() => {
      const e = ultimaEscala || 1; const R = el => el.getBoundingClientRect();
      const board = R(document.querySelector('.board'));
      let clip = 0;
      const scan = sel => document.querySelectorAll(sel).forEach(el => { const r = R(el); if (r.width < 1 || r.height < 1) return;
        if (r.bottom > board.bottom + 0.5) clip = Math.max(clip, (r.bottom - board.bottom) / e);
        if (r.top < board.top - 0.5) clip = Math.max(clip, (board.top - r.top) / e); });
      scan('.fxtag'); scan('.fxtags'); scan('.brow__tiles'); scan('.portrait');
      // ETIQUETAS abaixo da barra de VIDA (os dois lados) e, por unidade, no máximo FXTAGS_MAX células.
      let abaixoDaVida = true, maxCelulas = 0, nomesVazios = 0, semValor = 0;
      document.querySelectorAll('.unit__portrait').forEach(up => {
        const fxs = up.querySelector('.fxtags'); if (!fxs) return;
        const cells = [...fxs.querySelectorAll('.fxtag')]; if (!cells.length) return;
        maxCelulas = Math.max(maxCelulas, cells.length);
        const hp = up.querySelector('.hp'); const hpB = hp ? R(hp).bottom : R(up.querySelector('.portrait')).bottom;
        if (R(fxs).top < hpB - 1) abaixoDaVida = false;   // a faixa começa ABAIXO da barra de vida
        cells.forEach(c => {
          if (c.classList.contains('fxtag--mais')) return;   // "+N" não é etiqueta nomeada
          const n = c.querySelector('.fxtag__n');
          if (!n || !(n.textContent || '').trim()) nomesVazios++;   // NOME sempre escrito
          // efeito de magnitude (⚔️/vulnerável/redução/regen/veneno…) tem o número visível e separado
          const v = c.querySelector('.fxtag__v');
          if (v && !(v.textContent || '').trim()) semValor++;
        });
      });
      const cells = document.querySelectorAll('.fxtag').length;
      const mais = document.querySelectorAll('.fxtag--mais').length;
      const skill = R(document.querySelector('.skill'));
      return { clip: +clip.toFixed(2), abaixoDaVida, maxCelulas, nomesVazios, semValor, cells, mais,
        skillW: Math.round(skill.width / e), skillH: Math.round(skill.height / e) };
    });

    for (let nef = 0; nef <= 6; nef++) {
      await entrar(nef); await page.waitForTimeout(60);
      const m = await medir();
      ok(m.clip === 0, `${E.nome} ${nef}ef: NADA corta na vertical (clip ${m.clip}px)`);
      ok(m.maxCelulas <= FXTAGS_MAX, `${E.nome} ${nef}ef: no máximo ${FXTAGS_MAX} células por retrato (veio ${m.maxCelulas})`);
      ok(m.nomesVazios === 0, `${E.nome} ${nef}ef: toda etiqueta tem NOME escrito (vazias ${m.nomesVazios})`);
      ok(m.semValor === 0, `${E.nome} ${nef}ef: todo valor de etiqueta aparece (vazios ${m.semValor})`);
      if (nef > 0) {
        ok(m.abaixoDaVida, `${E.nome} ${nef}ef: as etiquetas ficam ABAIXO da barra de vida (dois lados)`);
        ok(m.cells >= 6, `${E.nome} ${nef}ef: os efeitos aparecem (células ${m.cells}, ≥ 6 unidades vivas)`);
      }
      // com mais efeitos do que cabe, o excedente VIRA "+N" (não some nem corta)
      if (nef > FXTAGS_MAX) ok(m.mais > 0, `${E.nome} ${nef}ef: o excedente colapsa em "+N" (mais ${m.mais})`);
      ok(m.skillW === 90 && m.skillH === 90, `${E.nome} ${nef}ef: a FICHA continua 90×90 (veio ${m.skillW}×${m.skillH})`);
      if (nef === 6) console.log(`  ${E.nome}: no pior empilhamento (6ef) clip=${m.clip}, máx células/retrato=${m.maxCelulas}, "+N"=${m.mais}`);
    }

    // §239 (preservado no §328): a MOLDURA ainda une retrato + fichas (o retrato encolheu, mas segue na placa)
    await entrar(0); await page.waitForTimeout(60);
    const resp = await page.evaluate(() => {
      const R = el => el.getBoundingClientRect();
      const brow = document.querySelector('.brow'), unit = brow.querySelector('.brow__unit');
      const por = R(brow.querySelector('.brow__ally .portrait'));
      const ur = R(unit);
      const tLastR = [...brow.querySelectorAll('.brow__tiles .skill')].map(R).pop().right;
      return { unitCobreFichas: ur.right >= tLastR - 1, unitCobreRetrato: ur.left <= por.left + 1 };
    });
    ok(resp.unitCobreRetrato && resp.unitCobreFichas, `${E.nome}: §239 a moldura une retrato + fichas`);

    // LEITURA no rodapé (inalterada no §328): repouso=citação · tocar habilidade=leitura · tocar inimigo=kit · volta
    await entrar(0); await page.waitForTimeout(40);
    const leituras = await page.evaluate(() => {
      const out = {};
      out.repousoCite = !!document.querySelector('.footer .acao__cite') && (document.querySelector('.footer .acao__cite').textContent || '').length > 8;
      const u = st.lados[st.ativo].units[0]; const a = acoesDe(st, u).find(x => x.disponivel) || acoesDe(st, u)[0];
      armado = { uid: u.uid, slot: a.slot, passos: a.passos || ['inimigo'], distribui: false }; peekKit = null; detalhe = null; inspec = null; render();
      out.habLeitura = !!document.querySelector('.footer .leitura__nome') && !document.querySelector('.footer .acao__cite');
      armado = null; peekKit = st.lados[1].units[0].uid; kitSel = null; render();
      out.inimKit = !!document.querySelector('.footer .leitura__kstrip') && !document.querySelector('.footer .acao__cite');
      peekKit = null; armado = null; detalhe = null; render();
      out.voltaCite = !!document.querySelector('.footer .acao__cite');
      out.semPainel = !document.querySelector('.panel');
      return out;
    });
    ok(leituras.repousoCite, `${E.nome}: repouso mostra a CITAÇÃO (dado)`);
    ok(leituras.habLeitura, `${E.nome}: tocar HABILIDADE troca pela leitura no rodapé`);
    ok(leituras.inimKit, `${E.nome}: tocar INIMIGO troca pelo kit no rodapé`);
    ok(leituras.voltaCite, `${E.nome}: dispensado o foco, a citação VOLTA ao repouso`);
    ok(leituras.semPainel, `${E.nome}: não há painel lateral (§299)`);

    // §300 (preservado): o disco da ficha é QUADRADO ARREDONDADO (raio 6), a ficha segue 90 e nada corta
    await entrar(0); await page.waitForTimeout(40);
    await page.waitForFunction(() => { const im = document.querySelector('.brow__tiles .skill .slot__art'); return im && im.complete && im.naturalWidth > 0; }, { timeout: 6000 }).catch(() => {});
    const forma = await page.evaluate(() => {
      const R = el => el.getBoundingClientRect();
      const disc = document.querySelector('.brow__tiles .skill .skill__disc');
      const cs = getComputedStyle(disc);
      const board = R(document.querySelector('.board'));
      let clip = 0; document.querySelectorAll('.brow__tiles .skill, .brow__tiles .skill__cost').forEach(el => { const r = R(el); if (r.bottom > board.bottom + 0.5) clip = Math.max(clip, r.bottom - board.bottom); if (r.top < board.top - 0.5) clip = Math.max(clip, board.top - r.top); });
      return { radius: cs.borderRadius, overflow: cs.overflow,
        skillW: Math.round(R(document.querySelector('.brow__tiles .skill')).width / (ultimaEscala || 1)),
        clip: +clip.toFixed(1) };
    });
    ok(forma.radius === '6px', `${E.nome} §300: o disco é quadrado arredondado (raio 6, veio ${forma.radius})`);
    ok(forma.overflow === 'hidden', `${E.nome} §300: o disco recorta a arte ao quadrado (overflow hidden)`);
    ok(forma.skillW === 90, `${E.nome} §300: a ficha segue 90 (veio ${forma.skillW})`);
    ok(forma.clip === 0, `${E.nome} §300: nada corta com o disco quadrado (clip ${forma.clip})`);

    await ctx.close();
  }

  await browser.close();
  console.log(falhas === 0 ? '\n>>> BATALHA_FAIXA OK' : `\n>>> ${falhas} FALHA(S)`);
  process.exit(falhas ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
