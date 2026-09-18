// colecao_sinergia.test.js (§294) — a SINERGIA na Coleção: painel lateral (3 parceiros + cabeçalho, ordem de
// prioridade, faixa global, solista honesto) e o "+N ›" que abre a lista completa como MODO da sobreposição.
// Navegador REAL (Chromium), medido no piso 780 E na folga 951 (a lição do §291: as duas larguras, todos os deuses).
// jsdom não serve p/ o corte (não faz layout). As guardas são as do dono (§294):
//   1) no máximo 3 parceiros no painel, com cabeçalho;   2) a ordem de prioridade é respeitada (laço antes de anti);
//   3) quem tem >3 mostra "+N" e ele abre a lista COMPLETA;   4) o solista mostra a linha, não um vão vazio;
//   5) NENHUM nome/mecânica corta a 780 (nem a 951), nos 100 deuses;   6) "Ver detalhes" continua alcançável (§210).
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const S = require('../data/sinergia.json');

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

// ---------- guardas de DADO (baratas, sem navegador): a fonte que a tela lê ----------
(function dados() {
  console.log('== §294 dado: prioridade ordenada, aura=2, solistas honestos ==');
  let desordenados = 0, solistas = 0;
  for (const k of Object.keys(S.fichas)) {
    const ps = S.fichas[k].parceiros;
    for (let i = 1; i < ps.length; i++) if (ps[i].prioridade < ps[i - 1].prioridade) desordenados++;
    if (S.fichas[k].solista) { solistas++; ok(ps.length === 0 && !S.fichas[k].suporte, `solista ${k} não devia ter parceiro/suporte`); }
    for (const p of ps) ok(p.curto && p.motivo, `${k}→${p.para}: curto/motivo vazio`);
  }
  ok(desordenados === 0, `${desordenados} fichas com parceiros fora da ordem de prioridade`);
  ok(S.auraDoadores.length === 2, `auraDoadores deviam ser 2 (Brigid/Mímir), são ${S.auraDoadores.length}`);
  ok(solistas === 22, `solistas deviam ser 22, são ${solistas}`);
  // mnevis: laço vem antes de fase/elemento e o anti fica FORA do top-3
  const mn = S.fichas.mnevis.parceiros;
  ok(mn[0].familia === 'laço', `mnevis: 1º parceiro devia ser laço, é ${mn[0].familia}`);
  ok(!mn.slice(0, 3).some(p => p.familia === 'fase-anti'), 'mnevis: a anti-sinergia não devia estar no top-3');
})();

(async () => {
  const distAbs = path.resolve(__dirname, '..', 'dist', 'incursion.html');
  const browser = await chromium.launch({ executablePath: acharChromium(), headless: true });
  const page = await (await browser.newContext()).newPage();
  await page.goto('file://' + distAbs, { waitUntil: 'load' });

  for (const W of [780, 951]) {
    await page.setViewportSize({ width: W, height: 428 });
    console.log(`\n== §294 tela @ ${W} ==`);

    // (1)(2)(6) painel de um deus MISTO (mnevis: laço>fase>elemento, +anti no +N) e do pior caso (odin, 15)
    const r = await page.evaluate(() => {
      ROSTER.forEach(e => { perfil.deuses[e.key] = perfil.deuses[e.key] || { obtidoEm: Date.now(), copias: 1 }; });
      ir('colecao', {}, { substituir: true }); render();
      function painel(k) {
        colSelecionar(k);
        const pares = [...document.querySelectorAll('.col2p .col2s__par')];
        const nomes = pares.map(p => p.querySelector('.col2s__nome').textContent);
        const antiNoPainel = pares.some(p => p.className.includes('col2s__par--anti'));
        const rot = document.querySelector('.col2p .col2s__rot');
        const mais = document.querySelector('.col2p .col2s__mais');
        const faixa = document.querySelector('.col2p .col2s__faixa');
        const solo = document.querySelector('.col2p .col2s__solo');
        const ver = document.querySelector('.col2p__ver');
        return {
          n: pares.length, nomes, antiNoPainel,
          temRot: !!rot, rot: rot && rot.textContent,
          maisTxt: mais ? mais.textContent : null,
          temFaixa: !!faixa, solo: solo ? solo.textContent : null,
          verBottom: ver ? Math.round(ver.getBoundingClientRect().bottom) : null,
          verVisivel: ver ? (ver.getBoundingClientRect().bottom <= innerHeight + 1) : false,
        };
      }
      return { mnevis: painel('mnevis'), odin: painel('odin'), zeus: painel('zeus'), ahpuch: painel('ahpuch') };
    });
    // TETO = 2 parceiros no painel (medido §294: 3 linhas de 2 linhas estouram 31px; 2 cabem com folga). mnevis tem
    // 4 (laço>fase>elemento>anti) → painel mostra 2 + "+2 mais"; anti fica no +N; faixa migra p/ a sobreposição.
    ok(r.mnevis.n === 2, `mnevis: ${r.mnevis.n} parceiros no painel (teto 2, o resto vai p/ o +N)`);
    ok(r.mnevis.temRot && r.mnevis.rot === 'SINERGIA', 'mnevis: cabeçalho SINERGIA ausente');
    ok(!r.mnevis.antiNoPainel, 'mnevis: anti-sinergia não devia aparecer no painel (só no +N)');
    ok(r.mnevis.nomes[0] === S.fichas.mnevis.parceiros[0].nome, `mnevis: 1º do painel (${r.mnevis.nomes[0]}) ≠ 1º por prioridade`);
    ok(/\+2 mais/.test(r.mnevis.maisTxt || ''), `mnevis: devia ter "+2 mais", tem ${r.mnevis.maisTxt}`);
    ok(!r.mnevis.temFaixa, 'mnevis: com "+N" a faixa migra p/ a sobreposição (não no painel apertado)');
    ok(r.odin.n === 2 && /\+13 mais/.test(r.odin.maisTxt || ''), `odin: painel devia ter 2 + "+13 mais", tem ${r.odin.n} / ${r.odin.maisTxt}`);
    ok(r.odin.verVisivel, `odin (pior caso): "Ver detalhes" saiu da tela (base ${r.odin.verBottom} > 428)`);
    ok(r.ahpuch.n === 2 && !r.ahpuch.maisTxt, `ahpuch (2 parceiros): mostra os 2 sem +N (tem ${r.ahpuch.n} / ${r.ahpuch.maisTxt})`);
    ok(!r.ahpuch.temFaixa, 'ahpuch (com parceiros): a faixa fica na sobreposição, não no painel');
    // (4) solista: linha honesta + a faixa global (ali sobra espaço)
    ok(r.zeus.n === 0 && /funciona sozinho/.test(r.zeus.solo || ''), `zeus: solista devia mostrar a linha "funciona sozinho" (n=${r.zeus.n}, solo=${r.zeus.solo})`);
    ok(r.zeus.temFaixa, 'zeus (solista): a faixa global (aura) devia estar no painel (há espaço)');

    // (3) "+N" abre a lista COMPLETA como modo da sobreposição
    const abre = await page.evaluate(() => {
      colSelecionar('odin');
      document.querySelector('.col2p .col2s__mais').click();
      const ov = document.querySelector('#col2ov'); if (!ov) return { erro: 'sobreposição não abriu' };
      const modoOn = ov.querySelector('.col2ov__modo.is-on');
      const linhas = ov.querySelectorAll('.col2ov__sinpar').length;
      const total = SINERGIA.fichas.odin.parceiros.length;
      return { modo: modoOn && modoOn.dataset.modo, linhas, total };
    });
    ok(abre.modo === 'sinergia', `+N devia abrir no modo SINERGIA (abriu em ${abre.modo || abre.erro})`);
    ok(abre.linhas === abre.total, `a lista completa devia ter os ${abre.total} parceiros do odin, tem ${abre.linhas}`);
    await page.evaluate(() => { const x = document.querySelector('#col2ovx'); if (x) x.click(); });

    // (§294-ajuste) o TÍTULO da sobreposição não corta no topo (o Cinzel 900 estourava a caixa; overflow:visible) e
    // não colide com o × — nos 100. A métrica é a TINTA (Range), não scrollHeight (que só pega corte embaixo).
    const titulo = await page.evaluate(() => {
      const bad = [];
      for (const e of ROSTER) {
        colAbrirVer(e.key);
        const nome = document.querySelector('.col2ov__nome'), card = document.querySelector('.col2ov__card'), x = document.querySelector('#col2ovx');
        const rg = document.createRange(); rg.selectNodeContents(nome); const ink = rg.getBoundingClientRect();
        const cr = card.getBoundingClientRect(), lim = x ? x.getBoundingClientRect().left : cr.right;
        if (ink.top < cr.top + 0.5) bad.push(e.key + ' topo cortado ' + Math.round(cr.top - ink.top));
        if (ink.right > lim - 1) bad.push(e.key + ' colide com o × ' + Math.round(ink.right - lim));
        colFecharVer();
      }
      return bad;
    });
    ok(titulo.length === 0, `${titulo.length}/100 títulos cortam/colidem na sobreposição` + (titulo.length ? ' → ' + titulo.slice(0, 6).join(' · ') : ''));

    // (5)(6) NENHUM nome/mecânica corta no painel, o "Ver detalhes" fica alcançável (§210) e a maestria só aparece no
    // POSSUÍDO — nos 100 deuses E NOS DOIS ESTADOS DE POSSE. O §294 original mediu só possuído (semeava tudo) e por
    // isso não pegou o corte do não-possuído (a caixa de maestria "falta" empurrava o botão): a MESMA falha de escopo
    // do §291 (medir só um estado). Aqui varre possuído E não-possuído (§295).
    async function varrer(possuir) {
      return await page.evaluate((poss) => {
        if (poss) ROSTER.forEach(e => { perfil.deuses[e.key] = perfil.deuses[e.key] || { obtidoEm: Date.now(), copias: 1 }; });
        else perfil.deuses = {};   // ninguém possuído (nem os 9 iniciais) — o estado que o §294 nunca mediu
        ir('colecao', {}, { substituir: true }); render();
        const bad = []; let piorVer = 0, piorVerK = ''; let maestriaErrada = 0;
        for (const e of ROSTER) {
          colSelecionar(e.key);
          for (const sel of ['.col2s__nome', '.col2s__mec']) {
            for (const el of document.querySelectorAll('.col2p ' + sel)) {
              if (el.scrollWidth > el.clientWidth + 1) bad.push(e.key + ' ' + sel + ' +' + (el.scrollWidth - el.clientWidth));
            }
          }
          const ver = document.querySelector('.col2p__ver');
          const vb = ver ? Math.round(ver.getBoundingClientRect().bottom) : 0;
          if (vb > piorVer) { piorVer = vb; piorVerK = e.key; }
          // §252: maestria só no possuído (não-possuído não tem posto — a caixa inteira sai, não encolhe)
          const temMaestria = !!document.querySelector('.col2p .col2m');
          if (temMaestria !== poss) maestriaErrada++;
        }
        return { bad, piorVer, piorVerK, maestriaErrada };
      }, possuir);
    }
    for (const poss of [true, false]) {
      const v = await varrer(poss);
      const rot = poss ? 'possuído' : 'NÃO possuído';
      ok(v.bad.length === 0, `[${rot}] ${v.bad.length} nomes/mecânicas cortam no painel` + (v.bad.length ? ' → ' + v.bad.slice(0, 6).join(' · ') : ''));
      ok(v.piorVer <= 428, `[${rot}] "Ver detalhes" saiu da tela no pior deus (${v.piorVerK}: base ${v.piorVer} > 428)`);
      ok(v.maestriaErrada === 0, `[${rot}] maestria no estado errado em ${v.maestriaErrada} deuses (§252: só aparece no possuído)`);
      console.log(`  @${W} [${rot}]: cortes ${v.bad.length}/100 · pior botão ${v.piorVer} (${v.piorVerK}) · maestria-errada ${v.maestriaErrada}`);
    }
    console.log(`  @${W}: mnevis ${r.mnevis.n}p · odin ${r.odin.n}+"${r.odin.maisTxt}" · zeus solista · lista completa ${abre.linhas}/${abre.total}`);

    // (§295-cont) MAESTRIA por POSTO é dimensão de estado do painel possuído (Iniciado→★Mestre). As outras varreduras
    // semeiam copias:1 sem vitórias → só o posto base. Aqui a dimensão é DECLARADA e percorrida: o odin (pior painel
    // possuído, 2 parceiros + "+13 mais") é semeado em cada posto, com vitórias de verdade, e o "Ver detalhes" tem de
    // caber. (Medido §295: a caixa de maestria é 51px constante — mas cobrir é o ponto, não confiar na sorte de altura.)
    const postos = await page.evaluate(() => {
      const casos = [['base', 0, false], ['Iniciado', 1, false], ['Aprendiz', 5, false], ['Adepto', 15, false], ['soMilagre', 30, false], ['Mestre', 30, true]];
      const out = [];
      for (const [nome, vit, mil] of casos) {
        perfil.deuses = {}; perfil.deuses.odin = { obtidoEm: Date.now(), copias: 1 };
        perfil.maestria = { odin: { vitorias: vit, milagre: mil } };   // a maestria mora em perfil.maestria[k], não em deuses[k] (§228)
        ir('colecao', {}, { substituir: true }); render(); colSelecionar('odin');
        const posto = (document.querySelector('.col2p .col2m__posto') || {}).textContent || '(sem)';
        const ver = document.querySelector('.col2p__ver');
        out.push({ nome, posto, verBot: ver ? Math.round(ver.getBoundingClientRect().bottom) : 0 });
      }
      return out;
    });
    const postosMal = postos.filter(p => p.verBot > 428);
    ok(postosMal.length === 0, `[maestria] "Ver detalhes" corta em algum posto: ` + postosMal.map(p => `${p.nome} ${p.verBot}`).join(', '));
    console.log(`  @${W} [maestria postos]: ` + postos.map(p => `${p.nome}(${p.posto.trim()})=${p.verBot}`).join(' · '));
  }

  await browser.close();
  console.log(falhas === 0 ? '\n>>> COLEÇÃO-SINERGIA OK' : `\n>>> ${falhas} FALHA(S)`);
  process.exit(falhas ? 1 : 0);
})();
