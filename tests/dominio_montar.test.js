// §342 — MONTAR TIME do Domínio (base reaproveitável montadorTimeHTML/ligarMontadorTime), tela fixa 1846×852.
// escolher/tirar/X; 3 vagas bloqueiam o 4º + dica; filtros (elem·função·busca) combinam; painel de kit (4 habilidades
// com custo/GRÁTIS e nível) + ESCOLHER/X/voltar-Android; COMEÇAR só com 3 chama iniciarCorridaDominio na ordem;
// VOLTAR → hub; selo Nv só para quem tem habilidade >1. Chromium: caixas dos blocos (tol 4px) + @780 sem corte.
const fs = require('fs'), path = require('path');
const { JSDOM } = require('jsdom');
let falhas = 0, passes = 0;
const ok = (c, m) => { if (!c) { console.log('  ✗ ' + m); falhas++; } else { console.log('  ✓ ' + m); passes++; } };
const html = fs.readFileSync(path.join(__dirname, '../dist/incursion.html'), 'utf8');
// coleção ampla + níveis só em zeus (p/ o selo Nv) e brigid (básico grátis, p/ o GRÁTIS no kit)
const SETUP = `
  perfil.deuses={}; ROSTER.slice(0,24).forEach(e=>perfil.deuses[e.key]={copias:1});
  perfil.deuses['brigid']={copias:1};
  contaAtual={perfil, niveis:{zeus:{basico:2,habilidade:2}}};
  domTimePick=[]; montFiltroElem=null; montFiltroFunc=null; montBusca=''; montKitAberto=null; montDica=false;
  ir('dominiomontar',{cultura:'grega'}); render();`;
function sessao() {
  const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://x/' });
  const w = dom.window, d = w.document; w.eval(SETUP);
  return { w, d, $: s => d.querySelector(s), $$: s => [...d.querySelectorAll(s)] };
}

console.log('== §342 escolher / tirar / tirar pelo X ==');
{ const { w, $, $$ } = sessao();
  const cards = $$('.dm-card[data-pick]');
  const k0 = cards[0].dataset.pick, k1 = cards[1].dataset.pick;
  cards[0].dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  ok(w.eval('domTimePick.length') === 1 && w.eval('domTimePick[0]') === k0, 'tocar escolhe (vai para a 1ª vaga)');
  // tocar de novo tira
  $(`.dm-card[data-pick="${k0}"]`).dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  ok(w.eval('domTimePick.length') === 0, 'tocar de novo tira o deus');
  // escolhe dois e tira o 1º pelo X da vaga
  $(`.dm-card[data-pick="${k0}"]`).dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  $(`.dm-card[data-pick="${k1}"]`).dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  ok(w.eval('domTimePick.length') === 2, 'dois escolhidos');
  $(`.dm-vaga__x[data-rem="${k0}"]`).dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  ok(w.eval('domTimePick.length') === 1 && w.eval('domTimePick[0]') === k1, 'o X da vaga remove e o 2º vira o 1º');
}

console.log('\n== §342 as 3 vagas cheias bloqueiam o 4º e mostram a dica ==');
{ const { w, $, $$ } = sessao();
  const cards = $$('.dm-card[data-pick]');
  for (let i = 0; i < 3; i++) $(`.dm-card[data-pick="${cards[i].dataset.pick}"]`).dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  ok(w.eval('domTimePick.length') === 3, 'três escolhidos enchem as vagas');
  const quarto = cards[3].dataset.pick;
  $(`.dm-card[data-pick="${quarto}"]`).dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  ok(w.eval('domTimePick.length') === 3 && !w.eval(`domTimePick.includes(${JSON.stringify(quarto)})`), 'um 4º não entra (vagas cheias)');
  ok(!!$('#dmdica'), 'mostra a dica "Tire um deus para trocar"');
}

console.log('\n== §342 filtros (elemento · função · busca) combinam e a contagem bate ==');
{ const { w, $, $$ } = sessao();
  const jog = w.eval('_montJogaveis()');
  const cont = () => $$('.dm-card[data-pick]').length;
  // função
  $('[data-func="Atacante"]').dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  const nAtac = w.eval("_montJogaveis().filter(k=>HRM[k].funcao==='Atacante').length");
  ok(cont() === nAtac && /(\d+) deuses/.test($('.dm-conta').textContent) && parseInt($('.dm-conta').textContent) === nAtac, `só Atacantes (${nAtac})`);
  // + elemento (combina E)
  $('[data-elem="Chama"]').dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  const nAtacChama = w.eval("_montJogaveis().filter(k=>HRM[k].funcao==='Atacante'&&HRM[k].elem==='Chama').length");
  ok(cont() === nAtacChama && parseInt($('.dm-conta').textContent) === nAtacChama, `Atacante E Chama (${nAtacChama})`);
  // Todos limpa elemento+função
  $('[data-todos]').dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  ok(cont() === jog.length, `"Todos" limpa os filtros (${jog.length})`);
  // busca (ignora acento/maiúscula)
  const alvo = w.eval("HRM[_montJogaveis()[0]].nome");
  w.eval(`montBusca=${JSON.stringify(alvo.slice(0, 3).toUpperCase())}; render();`);
  const nBusca = w.eval(`_montJogaveis().filter(k=>HRM[k].nome.normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').toLowerCase().includes(${JSON.stringify(alvo.slice(0,3).toLowerCase())})).length`);
  ok($$('.dm-card[data-pick]').length === nBusca, `busca por "${alvo.slice(0, 3)}" (${nBusca})`);
}

console.log('\n== §342 painel de kit: 4 habilidades com custo/GRÁTIS e nível; ESCOLHER põe no time; X e voltar-Android fecham ==');
{ const { w, $, $$ } = sessao();
  // abre o kit da brigid (básico GRÁTIS) pelo "i"
  $(`.dm-card[data-pick="brigid"] .dm-card__i`).dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  ok(!!$('#dmkit') && w.eval("montKitAberto") === 'brigid', 'o "i" abre o painel de kit SEM escolher');
  ok(w.eval('domTimePick.length') === 0, 'abrir o kit não escolhe o deus');
  ok($$('.dmk-ab').length === 4, 'o painel mostra as 4 habilidades (Básico/Habilidade/Milagre/Defesa)');
  ok(/GR[ÁA]TIS/.test($('.dm-kit__abs').textContent), 'o básico grátis da brigid mostra GRÁTIS no custo (§340)');
  // ESCOLHER põe no time e fecha
  $('[data-kit-toggle="brigid"]').dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  ok(w.eval(`domTimePick.includes('brigid')`) && !$('#dmkit'), 'ESCOLHER põe o deus no time e fecha o painel');
  // reabrir → agora TIRAR; nível real no kit do zeus (basico Nv 2)
  $(`.dm-card[data-pick="zeus"] .dm-card__i`).dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  ok(/Nv 2/.test($('.dm-kit__abs').textContent), 'o kit mostra o nível real ("Nv 2") de quem subiu habilidade');
  // X fecha
  $('[data-kit-x]').dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  ok(!$('#dmkit') && w.eval("montKitAberto") === null, 'o X fecha o painel');
  // voltar do Android fecha o painel (sem sair da tela)
  $(`.dm-card[data-pick="zeus"] .dm-card__i`).dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  w.eval("voltarNativo();");
  ok(!$('#dmkit') && w.eval("rotaAtual()") === 'dominiomontar', 'o voltar do Android fecha o painel e permanece no montar');
}

console.log('\n== §342 COMEÇAR só com 3 chama iniciarCorridaDominio com o time NA ORDEM ==');
{ const { w, $, $$ } = sessao();
  ok($('#bcomecar').disabled, 'COMEÇAR começa travado (0 deuses)');
  w.eval("globalThis.__ini=null; iniciarCorridaDominio=(cult,time)=>{__ini={cult,time};};");
  const cards = $$('.dm-card[data-pick]'), a = cards[0].dataset.pick, b = cards[1].dataset.pick, cc = cards[2].dataset.pick;
  $(`.dm-card[data-pick="${a}"]`).dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  $(`.dm-card[data-pick="${b}"]`).dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  ok($('#bcomecar').disabled, 'com 2 ainda travado');
  $(`.dm-card[data-pick="${cc}"]`).dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  ok(!$('#bcomecar').disabled, 'com 3 habilita');
  $('#bcomecar').dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  ok(w.eval('__ini && __ini.cult') === 'grega', 'COMEÇAR chama iniciarCorridaDominio(cultura, time)');
  ok(w.eval(`JSON.stringify(__ini.time)`) === JSON.stringify([a, b, cc]), 'o time vai na ORDEM das vagas (1,2,3)');
}

console.log('\n== §342 VOLTAR volta ao hub do Domínio ==');
{ const { w, $ } = sessao();
  $('#bvoltar').dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  ok(w.eval("rotaAtual()") === 'dominio', 'VOLTAR → ir(dominio) (o hub)');
}

console.log('\n== §342 o selo "Nv" aparece só para quem tem habilidade acima de 1 ==');
{ const { w, $ } = sessao();
  ok(!!$('.dm-card[data-pick="zeus"] .dm-card__nv') && /Nv 2/.test($('.dm-card[data-pick="zeus"] .dm-card__nv').textContent), 'zeus (basico Nv 2) tem o selo Nv 2');
  const semNv = w.eval("_montJogaveis().find(k=>k!=='zeus' && _montNivelMax(k)===1)");
  ok(semNv && !$(`.dm-card[data-pick="${semNv}"] .dm-card__nv`), `um deus sem habilidade acima de 1 (${semNv}) NÃO tem o selo`);
}

// ---------- Chromium: caixas dos blocos (tol 4px) @1846 e nada corta @780 ----------
(async () => {
  let chromium; try { chromium = require('playwright').chromium; } catch (e) { console.log('  (playwright ausente — pulo o layout)'); console.log(`\n== DOMINIO_MONTAR — ${passes} asserções, ${falhas} falha(s) ==`); process.exit(falhas ? 1 : 0); }
  function acha(){ try{ const b='/opt/pw-browsers'; const dd=fs.readdirSync(b).filter(x=>/^chromium-\d+$/.test(x)).sort().pop(); if(dd){ const p=path.join(b,dd,'chrome-linux','chrome'); if(fs.existsSync(p)) return p; } }catch(e){} return undefined; }
  const distAbs = path.resolve(__dirname, '..', 'dist', 'incursion.html');
  const browser = await chromium.launch({ executablePath: acha(), headless: true, args: ['--no-sandbox'] });
  const BOOT = `perfil.deuses={}; ROSTER.slice(0,24).forEach(e=>perfil.deuses[e.key]={copias:1}); domTimePick=[]; montFiltroElem=null;montFiltroFunc=null;montBusca='';montKitAberto=null;montDica=false; ir('dominiomontar',{cultura:'grega'}); render();`;
  console.log('\n== §342 layout (Chromium) ==');
  { const ctx = await browser.newContext({ viewport: { width: 1846, height: 852 }, deviceScaleFactor: 1 });
    const page = await ctx.newPage(); await page.goto('file://' + distAbs, { waitUntil: 'load' });
    await page.evaluate(BOOT); await page.waitForTimeout(140);
    const m = await page.evaluate(() => { const df = document.getElementById('dommontar'); const b = df.getBoundingClientRect();
      const rel = sel => { const el = df.querySelector(sel); if (!el) return null; const r = el.getBoundingClientRect(); return { x: r.left - b.left, y: r.top - b.top, w: r.width, h: r.height, bot: r.bottom - b.top }; };
      const minH = sels => { let mn = 1e9, who = null; sels.forEach(s => df.querySelectorAll(s).forEach(el => { const h = el.getBoundingClientRect().height; if (h > 0 && h < mn) { mn = h; who = s; } })); return { mn: Math.round(mn * 10) / 10, who }; };
      const minFs = sels => { let mn = 1e9, who = null; sels.forEach(s => df.querySelectorAll(s).forEach(el => { const f = parseFloat(getComputedStyle(el).fontSize); if (f < mn) { mn = f; who = s; } })); return { mn: Math.round(mn * 10) / 10, who }; };
      let clips = []; df.querySelectorAll('.dm-card__n,.dm-card__f,.dm-vaga__n,.dm-titulo,.dm-sub,.dm-ctx__t,.dm-ini__n,.dm-chefe__n').forEach(el => { if (el.scrollWidth > el.clientWidth + 1.5) clips.push(el.className); });
      return { df: { w: b.width, h: b.height }, voltar: rel('.dmb--voltar'), titulo: rel('.dm-titulo'), ctx: rel('.dm-ctx'), time: rel('.dm-time'), dir: rel('.dm-dir'), comecar: rel('#bcomecar'),
        btn: minH(['.dmb--voltar', '.dmb--comecar', '.dm-chip', '.dm-orbe']), body: minFs(['.dm-sub', '.dm-ctx__trava', '.dm-vaga__meta', '.dm-conta']), nome: minFs(['.dm-card__n']), clips: clips.slice(0, 6) }; });
    const perto = (a, b, t) => Math.abs(a - b) <= (t || 4);
    ok(perto(m.df.w, 1846) && perto(m.df.h, 852), `#dommontar é 1846×852 (${Math.round(m.df.w)}×${Math.round(m.df.h)})`);
    ok(m.voltar && perto(m.voltar.x, 57) && perto(m.voltar.w, 180) && m.voltar.h >= 71.5, `VOLTAR x57 w180 h≥72 (${Math.round(m.voltar.x)}/${Math.round(m.voltar.w)}/${Math.round(m.voltar.h)})`);
    ok(m.titulo && perto(m.titulo.x, 268), `título em x268 (${m.titulo && Math.round(m.titulo.x)})`);
    ok(m.ctx && perto(m.ctx.x, 57) && perto(m.ctx.y, 95) && perto(m.ctx.w, 528) && perto(m.ctx.h, 410), `contexto x57 y95 528×410 (${m.ctx && [m.ctx.x, m.ctx.y, m.ctx.w, m.ctx.h].map(Math.round).join('/')})`);
    ok(m.time && perto(m.time.x, 57) && perto(m.time.y, 519) && perto(m.time.w, 528) && perto(m.time.h, 291), `seu time x57 y519 528×291 (${m.time && [m.time.x, m.time.y, m.time.w, m.time.h].map(Math.round).join('/')})`);
    ok(m.dir && perto(m.dir.x, 600) && perto(m.dir.y, 95) && perto(m.dir.w, 1190) && perto(m.dir.h, 620), `seus deuses x600 y95 1190×620 (${m.dir && [m.dir.x, m.dir.y, m.dir.w, m.dir.h].map(Math.round).join('/')})`);
    ok(m.comecar && m.comecar.h >= 71.5 && perto(m.comecar.y, 735, 6) && m.comecar.x > 1000, `COMEÇAR CORRIDA à direita, y≈735, h≥72 (y${Math.round(m.comecar.y)} h${Math.round(m.comecar.h)})`);
    console.log(`  @1846: menor botão ${m.btn.mn}px (${m.btn.who}) · menor corpo ${m.body.mn}px (${m.body.who}) · nome ${m.nome.mn}px`);
    ok(m.btn.mn >= 71.5, `botões ≥72px (menor ${m.btn.mn} em ${m.btn.who})`);
    ok(m.body.mn >= 19.5, `corpo ≥20px (menor ${m.body.mn} em ${m.body.who})`);
    ok(m.nome.mn >= 21.5, `nome dos cartões ≥22px (${m.nome.mn})`);
    ok(m.clips.length === 0, `nenhum texto cortado (${m.clips.length ? m.clips.join(',') : 'ok'})`);
    await ctx.close(); }
  { const ctx = await browser.newContext({ viewport: { width: 780, height: 360 }, deviceScaleFactor: 2 });
    const page = await ctx.newPage(); await page.goto('file://' + distAbs, { waitUntil: 'load' });
    await page.evaluate(BOOT); await page.waitForTimeout(140);
    const m = await page.evaluate(() => { const esc = (typeof ultimaEscalaBatalha !== 'undefined' && ultimaEscalaBatalha) || 1; const df = document.getElementById('dommontar'); const b = df.getBoundingClientRect();
      const fora = b.left < -0.5 || b.top < -0.5 || b.right > window.innerWidth + 0.5 || b.bottom > window.innerHeight + 0.5;
      let minBtn = 1e9; ['.dmb--voltar', '.dmb--comecar', '.dm-chip', '.dm-orbe'].forEach(s => df.querySelectorAll(s).forEach(el => { const h = el.getBoundingClientRect().height; if (h > 0) minBtn = Math.min(minBtn, h); }));
      let minBody = 1e9; ['.dm-sub', '.dm-vaga__meta', '.dm-conta'].forEach(s => df.querySelectorAll(s).forEach(el => minBody = Math.min(minBody, parseFloat(getComputedStyle(el).fontSize) * esc)));
      let clips = []; df.querySelectorAll('.dm-card__n,.dm-card__f,.dm-vaga__n,.dm-titulo,.dm-ini__n,.dm-chefe__n').forEach(el => { if (el.scrollWidth > el.clientWidth + 1.5) clips.push(el.className); });
      // sobreposição: o bloco ctx e o bloco time não se cruzam; a dir não cruza a esquerda
      const r = s => { const el = df.querySelector(s); const q = el.getBoundingClientRect(); return { l: q.left - b.left, t: q.top - b.top, r: q.right - b.left, bot: q.bottom - b.top }; };
      const ctxB = r('.dm-ctx'), timeB = r('.dm-time'), dirB = r('.dm-dir');
      const over = (timeB.t < ctxB.bot - 1) || (dirB.l < ctxB.r - 1);
      return { esc: Math.round(esc * 1000) / 1000, fora, minBtn: Math.round(minBtn * 10) / 10, minBody: Math.round(minBody * 100) / 100, clips: clips.slice(0, 6), over }; });
    console.log(`  @780×360: escala ${m.esc} · menor botão ${m.minBtn}px · menor corpo ${m.minBody}px`);
    ok(!m.fora, '@780×360: a tela fixa cabe (nada sai da viewport)');
    ok(!m.over, '@780×360: os blocos não se sobrepõem');
    ok(m.clips.length === 0, `@780×360: nenhum texto corta (${m.clips.length ? m.clips.join(',') : 'ok'})`);
    ok(m.minBtn >= 30, `@780×360: botões ≥30px (${m.minBtn})`);
    ok(m.minBody >= 8.4, `@780×360: corpo ≥8,4px (${m.minBody})`);
    await ctx.close(); }
  await browser.close();
  console.log(`\n== DOMINIO_MONTAR — ${passes} asserções, ${falhas} falha(s) ==`);
  process.exit(falhas ? 1 : 0);
})();
