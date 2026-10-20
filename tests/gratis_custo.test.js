// §340 — habilidade de custo vazio mostra "GRÁTIS" onde aparece o custo, em TODO o jogo.
// Os desenhadores de custo (grep): base.js pipsDetalhe (Coleção/kit, ficha, Níveis, seleção),
// painel.js _custoPips (painel de baixo da batalha), campo.js btCustoPips (botão da batalha).
// Uma grátis mostra GRÁTIS/Grátis e NENHUMA orbe; uma paga mostra as orbes e NÃO mostra GRÁTIS.
const fs = require('fs'), path = require('path');
const { JSDOM } = require('jsdom');
let falhas = 0, passes = 0;
const ok = (c, m) => { if (!c) { console.log('  ✗ ' + m); falhas++; } else { console.log('  ✓ ' + m); passes++; } };
const html = fs.readFileSync(path.join(__dirname, '../dist/incursion.html'), 'utf8');
function sessao() { const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://x/' });
  const w = dom.window, d = w.document; return { w, d, $: s => d.querySelector(s), $$: s => [...d.querySelectorAll(s)] }; }
const PAGO = 'hades'; // básico pago (fora dos 26 grátis do §338)

console.log('== §340 unidade — os três desenhadores de custo ==');
{ const { w } = sessao();
  const pdFree = w.eval("pipsDetalhe({})"), pdPay = w.eval("pipsDetalhe({Tempestade:2})");
  ok(/GR[ÁA]TIS/.test(pdFree) && !/cost__pip/.test(pdFree), 'pipsDetalhe custo vazio → "GRÁTIS", sem orbe');
  ok(/cost__pip/.test(pdPay) && !/GR[ÁA]TIS/.test(pdPay), 'pipsDetalhe custo pago → orbes, sem "GRÁTIS"');
  const cpFree = w.eval("_custoPips({})"), cpPay = w.eval("_custoPips({Tempestade:1})");
  ok(/Gr[áa]tis/.test(cpFree) && /4BE38A/i.test(cpFree) && !/<img/.test(cpFree), 'painel _custoPips vazio → "Grátis" verde, sem orbe');
  ok(/<img/.test(cpPay) && !/Gr[áa]tis/.test(cpPay), 'painel _custoPips pago → orbe (img), sem "Grátis"');
  const btFree = w.eval("btCustoPips({})"), btPay = w.eval("btCustoPips({Tempestade:1})");
  ok(/GR[ÁA]TIS/.test(btFree) && /4BE38A/i.test(btFree) && !/<img/.test(btFree), 'botão btCustoPips vazio → "GRÁTIS" verde na pílula, sem orbe');
  ok(/<img/.test(btPay) && !/GR[ÁA]TIS/.test(btPay), 'botão btCustoPips pago → orbes, sem "GRÁTIS"');
}

console.log('\n== §340 varredura nos dados — TODA habilidade de custo vazio vira GRÁTIS no botão ==');
{ const { w } = sessao();
  const r = w.eval(`(()=>{ let vazias=0, ok=0; Object.keys(GODS).forEach(k=>(GODS[k].ab||[]).forEach(a=>{
    if(a.cost && !Object.keys(a.cost).length){ vazias++; if(/GR[ÁA]TIS/.test(btCustoPips(a.cost)) && !/<img/.test(btCustoPips(a.cost))) ok++; } })); return {vazias,ok}; })()`);
  ok(r.vazias >= 26 && r.ok === r.vazias, `as ${r.vazias} habilidades de custo vazio renderizam GRÁTIS (${r.ok}/${r.vazias})`);
}

console.log('\n== §340 fora da batalha — cada tela que desenha custo ==');
// brigid tem básico GRÁTIS + habilidade/milagre PAGOS; hades é todo pago. Os renderizadores de linha de kit
// (kitLinhaHTML = Coleção/Campanha; colVerDetalheHTML = rota 'deus'/Missões) e as telas Níveis/Seleção.
{ const { w, d } = sessao();
  const bas = k => `GODS['${k}'].ab.find(a=>a.slot==='basico')`;
  const pago = k => `GODS['${k}'].ab.find(a=>Object.keys(a.cost||{}).length)`;
  // 1. Coleção / Campanha — kitLinhaHTML (renderizador único de linha de kit)
  ok(/cost__gratis/.test(w.eval(`kitLinhaHTML('BÁS', ${bas('brigid')})`)), 'Coleção/kit (kitLinhaHTML): básico grátis → GRÁTIS');
  const colPay = w.eval(`kitLinhaHTML('HAB', ${pago('hades')})`);
  ok(/cost__pip/.test(colPay) && !/cost__gratis/.test(colPay), 'Coleção/kit: habilidade paga → orbes, sem GRÁTIS');
  // 2. Ficha do deus (rota 'deus') — colVerDetalheHTML
  ok(/cost__gratis/.test(w.eval("colVerDetalheHTML('brigid',GODS['brigid'],'basico')")), 'Ficha do deus: básico grátis → GRÁTIS');
  const fichaPay = w.eval("colVerDetalheHTML('hades',GODS['hades'],'basico')");
  ok(/cost__pip/.test(fichaPay) && !/cost__gratis/.test(fichaPay), 'Ficha do deus: básico pago → orbes, sem GRÁTIS');
  // 3. Níveis (tela real) e 4. Seleção de kit (tela real)
  for (const [nome, boot] of [
    ['Níveis',         k => `ir('niveis',{key:'${k}'}); render();`],
    ['Seleção de kit', k => `ir('selecao'); focoPk='${k}'; render();`],
  ]) {
    w.eval(boot('brigid')); const hFree = d.getElementById('stage').innerHTML;
    w.eval(boot(PAGO));      const hPay = d.getElementById('stage').innerHTML;
    ok(/cost__gratis/.test(hFree) && /cost__pip/.test(hFree), `${nome}: o básico grátis mostra GRÁTIS e as pagas, orbes`);
    ok(!/cost__gratis/.test(hPay) && /cost__pip/.test(hPay), `${nome}: um deus todo pago (${PAGO}) mostra orbes e NENHUM GRÁTIS`);
  }
}

console.log('\n== §340 batalha — botões e painel ==');
{ const { w, d, $, $$ } = sessao();
  w.eval("vsCPU=false; st=novoEstado(['brigid','zeus','ares'],['hades','sobek','odin'],1,0); st.ativo=0; ELEMS.forEach(e=>st.lados[0].orbs[e]=6); ir('batalha',{},{substituir:true}); pararRelogio(); render();");
  const uidFree = w.eval("st.lados[0].units[0].uid"), uidPago = w.eval("st.lados[0].units[1].uid");
  const bFree = $(`[data-sk="${uidFree}|basico"]`), bPago = $(`[data-sk="${uidPago}|basico"]`);
  ok(!!bFree && /GR[ÁA]TIS/.test(bFree.textContent), 'o botão do básico grátis (brigid) mostra GRÁTIS');
  ok(!!bFree && !bFree.querySelector('.orbe'), 'o botão do básico grátis NÃO tem orbe (só a pílula GRÁTIS)');
  ok(!!bPago && !/GR[ÁA]TIS/.test(bPago.textContent) && !!bPago.querySelector('.orbe'), 'o botão de um básico pago (zeus) mostra orbes, sem GRÁTIS');
}
// o painel de baixo: lendo/armando o básico grátis, a coluna CUSTO diz "Grátis"
{ const { w, d, $ } = sessao();
  w.eval("vsCPU=false; st=novoEstado(['brigid','zeus','ares'],['hades','sobek','odin'],1,0); st.ativo=0; ELEMS.forEach(e=>st.lados[0].orbs[e]=6); ir('batalha',{},{substituir:true}); pararRelogio(); render();");
  const uidFree = w.eval("st.lados[0].units[0].uid");
  const bFree = $(`[data-sk="${uidFree}|basico"]`);
  bFree.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  const meio = ($('.bt-panel__meio') || {}).textContent || '';
  ok(/Gr[áa]tis/.test(meio), 'o painel de baixo mostra o custo "Grátis" ao armar o básico grátis');
}

console.log('\n== §340 regra intacta — a grátis nunca fica "sem energia" nem é apagada (§336) ==');
{ const { w, $ } = sessao();
  w.eval("vsCPU=false; st=novoEstado(['brigid','zeus','ares'],['hades','sobek','odin'],1,0); st.ativo=0; ELEMS.forEach(e=>st.lados[0].orbs[e]=0); ir('batalha',{},{substituir:true}); pararRelogio(); render();");
  const uidFree = w.eval("st.lados[0].units[0].uid");
  const bFree = $(`[data-sk="${uidFree}|basico"]`);
  ok(!!bFree && bFree.classList.contains('is-ready') && bFree.dataset.arma === '1', 'com 0 de energia, o básico grátis continua USÁVEL (não apagado)');
  bFree.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  const meio = ($('.bt-panel__meio') || {}).textContent || '';
  ok(!/Energia insuficiente/i.test(meio), 'o painel NÃO diz "Energia insuficiente" para uma grátis');
}

console.log('\n== §340 textos — "Grátis." saiu do começo do efeito de tyr/ganesha/brigid ==');
{ const { w } = sessao();
  const descs = w.eval("['tyr','ganesha','brigid'].map(k=>GODS[k].ab.find(a=>a.slot==='basico').desc)");
  ok(descs.every(d => !/^Gr[áa]tis\./.test(d)), 'os básicos de tyr/ganesha/brigid não começam mais com "Grátis."');
  ok(descs.every(d => /\d/.test(d)), 'o restante do efeito (dano etc.) segue intacto');
}

// ---------- Chromium: o GRÁTIS do botão cabe na pílula (1846 e 780) ----------
(async () => {
  let chromium; try { chromium = require('playwright').chromium; } catch (e) { console.log('  (playwright ausente — pulo o layout)'); console.log(`\n== GRÁTIS_CUSTO — ${passes} asserções, ${falhas} falha(s) ==`); process.exit(falhas ? 1 : 0); }
  function acha(){ try{ const b='/opt/pw-browsers'; const dd=fs.readdirSync(b).filter(x=>/^chromium-\d+$/.test(x)).sort().pop(); if(dd){ const p=path.join(b,dd,'chrome-linux','chrome'); if(fs.existsSync(p)) return p; } }catch(e){} return undefined; }
  const distAbs = path.resolve(__dirname, '..', 'dist', 'incursion.html');
  const browser = await chromium.launch({ executablePath: acha(), headless: true, args: ['--no-sandbox'] });
  const BOOT = "vsCPU=false; st=novoEstado(['brigid','tyr','ganesha'],['hades','sobek','odin'],1,0); st.ativo=0; ELEMS.forEach(e=>st.lados[0].orbs[e]=6); ir('batalha',{},{substituir:true}); pararRelogio(); render();";
  console.log('\n== §340 layout (Chromium) — o GRÁTIS do botão não corta ==');
  for (const [W, H, dsf] of [[1846, 852, 1], [780, 360, 2]]) {
    const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: dsf });
    const page = await ctx.newPage(); await page.goto('file://' + distAbs, { waitUntil: 'load' });
    await page.evaluate(BOOT); await page.waitForTimeout(140);
    const m = await page.evaluate(() => {
      const esc = (typeof ultimaEscalaBatalha !== 'undefined' && ultimaEscalaBatalha) || 1;
      const sels = [...document.querySelectorAll('[data-sk$="|basico"] div')].filter(el => /GR[ÁA]TIS/.test(el.textContent));
      const g = sels[0]; if (!g) return { achou: false };
      const span = g.querySelector('span') || g;
      const clip = g.scrollWidth > g.clientWidth + 1 || span.scrollWidth > span.clientWidth + 1;
      const fsDesign = Math.round(parseFloat(getComputedStyle(span).fontSize) * 10) / 10;       // px de design (esc=1 @1846)
      const fsReal = Math.round(parseFloat(getComputedStyle(span).fontSize) * esc * 10) / 10;   // px na tela
      return { achou: true, clip, fsDesign, fsReal, esc: Math.round(esc * 1000) / 1000 };
    });
    ok(m.achou, `@${W}×${H}: há um botão com a pílula GRÁTIS`);
    if (m.achou) {
      console.log(`  @${W}×${H}: escala ${m.esc} · fonte GRÁTIS ${m.fsDesign}px (design) / ${m.fsReal}px (tela) · corta=${m.clip}`);
      ok(!m.clip, `@${W}×${H}: o "GRÁTIS" cabe na pílula (não corta)`);
      if (W === 1846) ok(m.fsDesign >= 16, `@1846: a fonte do GRÁTIS é ≥16px de design (veio ${m.fsDesign})`);
    }
    await ctx.close();
  }
  await browser.close();
  console.log(`\n== GRÁTIS_CUSTO — ${passes} asserções, ${falhas} falha(s) ==`);
  process.exit(falhas ? 1 : 0);
})();
