// desafios_tela.test.js (§339/§360) — a TELA DESAFIOS no modelo do dono (canvas fixo 780×360, escalado por fit()). Comportamento:
// cada estado (a–g) renderiza a ação certa e o clique chama o handler certo; sem conexão trava tudo; filtros contam
// e filtram; os 3 ordenamentos ordenam; "Termina em" bate com a virada da semana; e (Chromium) o layout cabe/escala.
const fs = require('fs'), path = require('path');
const { JSDOM } = require('jsdom');
let falhas = 0, passes = 0;
const ok = (c, m) => { if (!c) { console.log('  ✗ ' + m); falhas++; } else { console.log('  ✓ ' + m); passes++; } };
const html = fs.readFileSync(path.join(__dirname, '../dist/incursion.html'), 'utf8');
function sessao() { const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://x/' });
  const w = dom.window, d = w.document; return { w, d, $: s => d.querySelector(s), $$: s => [...d.querySelectorAll(s)] }; }
// deuses COM pergaminho (estados reais): hades=mestre, atena=recarga, poseidon=ativo, demeter=ativo, apolo/ares/hera/afrodite=disponível
const SETUP = (ess, desafios) => `
  contaAtual={perfil:{moedas:{gema:0,essencia:${ess}},desafios:${JSON.stringify(desafios || {})}}};
  perfil.deuses={hades:1,poseidon:1,demeter:1,atena:1,apolo:1,ares:1,hera:1,afrodite:1};
  perfil.maestria={hades:{vitorias:30,milagre:true},atena:{vitorias:15},poseidon:{vitorias:8},demeter:{vitorias:5},apolo:{vitorias:6},ares:{vitorias:0},hera:{vitorias:2},afrodite:{vitorias:12}};
  perfil.provacoes={}; desafioFiltro='todos'; desafioOrdem='padrao'; desafioAjuda=false; desafioDesistindo=null; desafioComprando=null;`;
const ATIVOS = { poseidon: { ativo: true }, demeter: { ativo: true }, atena: { ativo: false, recargaAte: Date.now() + 12000000 } };

console.log('== §339 estados (a–g) + handlers ==');
{
  const { w, d, $ } = sessao();
  w.eval(SETUP(1240, ATIVOS) + "ir('desafios'); render();");
  // (g) mestre: sem ação, badge
  ok(!!$('[data-godcard="hades"] .df-card__mestre') && !$('[data-godcard="hades"] button'), '(g) Mestre: badge "★ Mestre", sem botão de ação');
  // (f) recarga
  ok(/recarga/i.test(($('[data-godcard="atena"] .df-card__recarga') || {}).textContent || ''), '(f) recarga: "Em recarga" + contador');
  // (d) ativo: JOGAR + Desistir
  ok(!!$('[data-godcard="poseidon"] [data-jogar="poseidon"]') && !!$('[data-godcard="poseidon"] [data-desistir="poseidon"]'), '(d) ativo: JOGAR + Desistir');
  // (a) disponível + pode pagar: COMPRAR
  ok(!!$('[data-godcard="ares"] [data-comprar="ares"]'), '(a) disponível + paga: COMPRAR');
}
// (a→comprar) o clique chama comprarPergaminhoServidor
{ const { w, $ } = sessao();
  w.eval(SETUP(1240, ATIVOS) + "ir('desafios'); render();");
  w.eval("globalThis.__c=null; comprarPergaminhoServidor=async(k)=>{__c=k; return {ok:false,codigo:'sem_conexao'};};");
  $('[data-comprar="ares"]').click();
  ok(w.eval("__c") === 'ares', '(a) COMPRAR → comprarPergaminhoServidor(ares)');
}
// (d→jogar) o clique chama iniciarDesafioDeus (que vai à batalha)
{ const { w, $ } = sessao();
  w.eval(SETUP(1240, ATIVOS) + "ir('desafios'); render();");
  w.eval("globalThis.__j=null; iniciarDesafioDeus=(k)=>{__j=k;};");
  $('[data-jogar="poseidon"]').click();
  ok(w.eval("__j") === 'poseidon', '(d) JOGAR → iniciarDesafioDeus(poseidon) → batalha');
}
// (e) desistir: confirma no cartão → SIM fecha / NÃO volta
{ const { w, d, $ } = sessao();
  w.eval(SETUP(1240, ATIVOS) + "ir('desafios'); render();");
  $('[data-desistir="poseidon"]').click();
  ok(!!$('[data-godcard="poseidon"] [data-desiste-ok="poseidon"]') && !!$('[data-godcard="poseidon"] [data-desiste-no]'), '(e) Desistir → confirmação no cartão (SIM/NÃO)');
  w.eval("globalThis.__f=null; fecharDesafioServidor=(k,c)=>{__f=[k,c]; return Promise.resolve();};");
  $('[data-desiste-ok="poseidon"]').click();
  ok(JSON.stringify(w.eval("JSON.stringify(__f)")) !== 'null' && w.eval("__f[0]") === 'poseidon' && w.eval("__f[1]") === false, '(e) SIM → desistirDesafio → fecharDesafioServidor(poseidon,false)');
  ok(w.eval("desafioDesistindo") === null, '(e) após SIM, a confirmação fecha');
  // NÃO volta
  w.eval("ir('desafios'); render();"); $('[data-desistir="demeter"]').click();
  $('[data-godcard="demeter"] [data-desiste-no]').click();
  ok(w.eval("desafioDesistindo") === null && !$('[data-godcard="demeter"] [data-desiste-ok]'), '(e) NÃO → cancela a confirmação');
}
// (c) comprando
{ const { w, $ } = sessao();
  w.eval(SETUP(1240, ATIVOS) + "desafioComprando='apolo'; ir('desafios'); render();");
  ok(!!$('[data-godcard="apolo"] .df-card__comprando'), '(c) comprando: "Comprando…" travado');
}
// (b) disponível SEM poder pagar: motivo + "Onde ganhar Essência?" → Domínios
{ const { w, $ } = sessao();
  w.eval(SETUP(10, ATIVOS) + "ir('desafios'); render();");
  ok(/insuficiente/i.test(($('[data-godcard="ares"] .df-card__motivo') || {}).textContent || '') && !!$('[data-godcard="ares"] [data-ondeganhar]'), '(b) sem pagar: "Essência insuficiente" + "Onde ganhar Essência?"');
  w.eval("globalThis.__ir=null; var _ir0=ir; ir=(r)=>{__ir=r;};");
  $('[data-godcard="ares"] [data-ondeganhar]').click();
  ok(w.eval("__ir") === 'dominios', '(b) "Onde ganhar Essência?" → ir(dominios)');
}

console.log('\n== §339 banner semana / composição / voltar / "?" ==');
{ const { w, d, $ } = sessao();
  w.eval(SETUP(1240, ATIVOS) + "ir('desafios'); render();");
  // semana → iniciarSemanal
  w.eval("globalThis.__s=0; iniciarSemanal=()=>{__s++;};");
  $('[data-semanal-jogar]').click(); ok(w.eval("__s") === 1, 'JOGAR da semana → iniciarSemanal');
  // composição → ir(composicao)
  w.eval("globalThis.__ir=null; ir=(r)=>{__ir=r;};");
  $('[data-compos]').click(); ok(w.eval("__ir") === 'composicao', 'cartão de composição → ir(composicao)');
}
{ const { w, d, $ } = sessao();
  w.eval(SETUP(1240, ATIVOS) + "ir('desafios'); render();");
  $('[data-ajuda]').click(); ok(!!$('#df-ajuda') && w.eval("desafioAjuda") === true, '"?" abre o painel de ajuda');
  $('[data-ajuda-fechar]').click(); ok(!$('#df-ajuda') && w.eval("desafioAjuda") === false, '"?" fecha pelo X');
}
{ const { w, $ } = sessao();
  w.eval("ir('home'); render(); ir('desafios'); render();");
  w.eval(SETUP(1240, ATIVOS) + "render();");
  $('[data-voltar]').click();
  ok(w.eval("rotaAtual()") !== 'desafios', 'voltar (‹ INÍCIO) sai da tela Desafios (volta à home)');
}

console.log('\n== §339 sem conexão trava as compras ==');
{ const { w, d, $, $$ } = sessao();
  w.eval(SETUP(1240, ATIVOS) + "contaAtual=null; ir('desafios'); render();");
  ok(($('[data-ess]') || {}).textContent.trim() === '—', 'sem conexão: saldo de Essência "—"');
  ok($$('[data-comprar]').length === 0, 'sem conexão: nenhum COMPRAR habilitado');
  ok($$('[data-ondeganhar]').length > 0, 'sem conexão: as disponíveis mostram "Onde ganhar Essência?"');
}

console.log('\n== §339 filtros: contagens + filtram ==');
{ const { w, d, $, $$ } = sessao();
  w.eval(SETUP(1240, ATIVOS) + "ir('desafios'); render();");
  const cont = k => ($(`[data-filtro="${k}"]`).textContent.match(/\((\d+)\)/) || [])[1];
  ok(cont('todos') === '8', 'Todos (8)');
  ok(cont('andamento') === '2', 'Em andamento (2): poseidon + demeter');
  ok(cont('recarga') === '1', 'Recarga (1): atena');
  ok(cont('mestres') === '1', 'Mestres (1): hades');
  ok(cont('disp') === '4', 'Disponíveis (4): apolo/ares/hera/afrodite');
  w.eval("desafioFiltro='mestres'; render();");
  ok($$('.df-card').length === 1 && !!$('[data-godcard="hades"]'), 'filtro Mestres mostra só hades');
  w.eval("desafioFiltro='recarga'; render();");
  ok($$('.df-card').length === 1 && !!$('[data-godcard="atena"]'), 'filtro Recarga mostra só atena');
}

console.log('\n== §339 ordenar: Padrão / Nome / Maestria ==');
{ const { w, d, $$ } = sessao();
  w.eval(SETUP(1240, ATIVOS) + "ir('desafios'); render();");
  const ordem = () => $$('[data-godcard]').map(e => e.dataset.godcard);
  w.eval("desafioOrdem='padrao'; render();");
  const pad = ordem();
  ok(pad.indexOf('poseidon') < pad.indexOf('atena') && pad.indexOf('atena') < pad.indexOf('ares') && pad.indexOf('ares') < pad.indexOf('hades'), 'Padrão: ativo → recarga → disponível → mestre');
  w.eval("desafioOrdem='nome'; render();");
  const nm = ordem(); const nmS = nm.slice().sort((a, b) => a.localeCompare(b, 'pt'));
  // nomes de exibição ordenam; aqui as keys batem a ordem alfabética dos nomes (grego)
  ok(nm[0] === 'afrodite' && nm[nm.length - 1] === 'poseidon', 'Nome: Afrodite primeiro, Poseidon por último (A→Z)');
  w.eval("desafioOrdem='maestria'; render();");
  const ma = ordem();
  ok(ma[0] === 'hades', 'Maestria: o Mestre (hades) primeiro');
}

console.log('\n== §339 "Termina em" bate com a virada da semana (segunda 00:00 UTC) ==');
{ const { w } = sessao();
  const ms = w.eval("_msAteViradaSemana()");
  // calcula a próxima segunda 00:00 UTC aqui e compara (tolerância 2 min)
  const agora = new Date(); const dia = agora.getUTCDay() || 7;
  const prox = Date.UTC(agora.getUTCFullYear(), agora.getUTCMonth(), agora.getUTCDate() + (8 - dia), 0, 0, 0, 0);
  const esperado = prox - agora.getTime();
  ok(Math.abs(ms - esperado) < 120000, `_msAteViradaSemana ≈ próxima segunda 00:00 UTC (dif ${Math.round((ms - esperado) / 1000)}s)`);
  ok(ms > 0 && ms <= 7 * 24 * 3600000, 'a virada está dentro de 7 dias');
}

console.log('\n== §339b "conta" e "build" não somem — só ficam ocultos na tela fixa; seguem na home/menu ==');
{ const { w, d } = sessao();
  // #build é um elemento de corpo (fixo no canto), compartilhado por TODAS as telas — não vive dentro de #desafios
  const build = d.getElementById('build');
  ok(!!build && build.parentElement === d.body, '#build é filho do <body> (persiste em todas as telas, não é da tela Desafios)');
  // o botão "conta" é montado no <body> e PERMANECE ao navegar (não é removido ao sair da tela)
  w.eval("montarBotaoConta();");
  ok(!!d.getElementById('conta-botao') && d.getElementById('conta-botao').parentElement === d.body, 'o botão "conta" é montado no <body>');
  w.eval("ir('desafios'); render();");
  ok(!!d.getElementById('conta-botao') && !!d.getElementById('build'), 'na tela Desafios os dois CONTINUAM no DOM (apenas ocultos por CSS, não removidos)');
  w.eval("ir('home',{},{substituir:true}); render();");
  ok(!!d.getElementById('conta-botao') && !!d.getElementById('build'), 'de volta à home, "conta" e "build" seguem presentes (função preservada)');
  // o ocultamento é ESCOPADO por classe de corpo (body.emdesafios / body.embatalha) — reversível, só nessas telas
  ok(/body\.emdesafios\s+#build/.test(html) && /body\.emdesafios\s+#conta-botao/.test(html), 'a regra de ocultar é escopada em body.emdesafios (reversível; some só na tela fixa)');
}

(async () => {
  console.log('\n== §339/§360 layout (Chromium) — canvas 780×360 ==');
  let chromium; try { chromium = require('playwright').chromium; } catch (e) { console.log('  (playwright ausente — pulo o layout)'); console.log(`\n== DESAFIOS_TELA — ${passes} asserções, ${falhas} falha(s) ==`); process.exit(falhas ? 1 : 0); }
  function acha(){ try{ const b='/opt/pw-browsers'; const dd=fs.readdirSync(b).filter(x=>/^chromium-\d+$/.test(x)).sort().pop(); if(dd){ const p=path.join(b,dd,'chrome-linux','chrome'); if(fs.existsSync(p)) return p; } }catch(e){} return undefined; }
  const distAbs = path.resolve(__dirname, '..', 'dist', 'incursion.html');
  const browser = await chromium.launch({ executablePath: acha(), headless: true, args: ['--no-sandbox'] });
  const BOOT = SETUP(1240, ATIVOS) + "ir('desafios'); render();";
  // §360: TODO botão tocável da tela (≥40×40) + corpo/rótulos visíveis (≥12px). A df-sem__foen fica oculta no canvas
  // pequeno (não entra na medição); os chips de regra viraram ícones curtos (.df-regras span).
  const BTN_SELS = ['[data-voltar]', '[data-semanal-jogar]', '.df-regras__q', '.df-chip', '.df-ordenar', '[data-comprar]', '[data-jogar]', '[data-desistir]'];
  const BODY_SELS = ['.df-regras span', '.df-card__maes', '.df-bar__lab', '.df-sem__prazo', '.df-sem__obj'];
  // §360 @780×360 (px desenho = px real, escala 1): os blocos cabem SEM rolagem (semana+composição+regras+filtros
  // visíveis) e a grade mostra ≥1 fileira de cartão inteira; toque ≥40; corpo ≥12; nome do deus ≥12; nada corta.
  { const ctx = await browser.newContext({ viewport: { width: 780, height: 360 }, deviceScaleFactor: 1 });
    const page = await ctx.newPage(); await page.goto('file://' + distAbs, { waitUntil: 'load' });
    await page.evaluate(BOOT); await page.waitForTimeout(120);
    const m = await page.evaluate((args) => { const [btnSels, bodySels] = args; const df = document.getElementById('desafios'); const b = df.getBoundingClientRect();
      const rel = sel => { const el = df.querySelector(sel); if (!el) return null; const r = el.getBoundingClientRect(); return { x: r.left - b.left, y: r.top - b.top, w: r.width, h: r.height, r: r.right - b.left, bot: r.bottom - b.top }; };
      const minH = sels => { let mn = 1e9, who = null; sels.forEach(s => df.querySelectorAll(s).forEach(el => { const r = el.getBoundingClientRect(); const h = Math.min(r.height, r.width); if (h < mn) { mn = h; who = s; } })); return { mn: Math.round(mn * 10) / 10, who }; };
      const minFs = sels => { let mn = 1e9, who = null; sels.forEach(s => df.querySelectorAll(s).forEach(el => { const f = parseFloat(getComputedStyle(el).fontSize); if (f < mn) { mn = f; who = s; } })); return { mn: Math.round(mn * 10) / 10, who }; };
      // fileiras inteiras de cartão visíveis na grade (sem rolar)
      const g = df.querySelector('.df-grade'); const gr = g.getBoundingClientRect(); const rows = {};
      g.querySelectorAll('.df-card').forEach(c => { const r = c.getBoundingClientRect(); if (r.bottom <= gr.bottom + 0.5 && r.top >= gr.top - 0.5) rows[Math.round(r.top)] = 1; });
      let clips = []; df.querySelectorAll('*').forEach(el => { if (el.scrollWidth > el.clientWidth + 1.5 && getComputedStyle(el).overflowX !== 'visible') clips.push(el.className || el.tagName); });
      return { df: { w: b.width, h: b.height }, cab: rel('.df-cab'), sem: rel('.df-sem'), compos: rel('.df-compos'), regras: rel('.df-regras'), filtros: rel('.df-filtros'), grade: rel('.df-grade'),
        btn: minH(btnSels), body: minFs(bodySels), nome: minFs(['.df-card__n']), fileiras: Object.keys(rows).length, clips: clips.slice(0, 6) }; }, [BTN_SELS, BODY_SELS]);
    const perto = (a, b, t) => Math.abs(a - b) <= (t || 3);
    ok(perto(m.df.w, 780) && perto(m.df.h, 360), `#desafios é 780×360 (veio ${Math.round(m.df.w)}×${Math.round(m.df.h)})`);
    // os cinco blocos de cima ficam TODOS dentro da viewport de 360 (nada precisa rolar p/ aparecer)
    ok(m.sem && m.sem.y >= 44 && m.sem.bot <= 360, `banner da semana visível (top ${m.sem && Math.round(m.sem.y)}, bottom ${m.sem && Math.round(m.sem.bot)} ≤ 360)`);
    ok(m.compos && m.compos.bot <= 360, `cartão de composição visível (bottom ${m.compos && Math.round(m.compos.bot)} ≤ 360)`);
    ok(m.regras && m.regras.bot <= 360, `linha de regras visível (bottom ${m.regras && Math.round(m.regras.bot)} ≤ 360)`);
    ok(m.filtros && m.filtros.bot <= 360, `filtros visíveis (bottom ${m.filtros && Math.round(m.filtros.bot)} ≤ 360)`);
    ok(m.grade && m.grade.y <= 300, `a grade começa visível, abaixo dos blocos (top ${m.grade && Math.round(m.grade.y)})`);
    ok(m.fileiras >= 1, `≥1 fileira de cartão inteira aparece sem rolar (veio ${m.fileiras})`);
    console.log(`  @780×360: menor toque ${m.btn.mn}px (${m.btn.who}) · menor corpo ${m.body.mn}px (${m.body.who}) · nome ${m.nome.mn}px · fileiras ${m.fileiras}`);
    ok(m.btn.mn >= 39.5, `todo botão tocável tem ≥40×40 (menor ${m.btn.mn} em ${m.btn.who})`);
    ok(m.body.mn >= 11.5, `todo texto de corpo/rótulo tem ≥12px (menor ${m.body.mn} em ${m.body.who})`);
    ok(m.nome.mn >= 11.5, `o nome do deus tem ≥12px (veio ${m.nome.mn})`);
    ok(m.clips.length === 0, `nada corta no desenho de 780×360 (${m.clips.length ? m.clips.join(',') : 'ok'})`);
    await ctx.close(); }
  // §360: os botões que só aparecem noutros estados (SIM/NÃO da desistência; "Onde ganhar" offline) também ≥40×40
  { const ctx = await browser.newContext({ viewport: { width: 780, height: 360 }, deviceScaleFactor: 1 });
    const page = await ctx.newPage(); await page.goto('file://' + distAbs, { waitUntil: 'load' });
    await page.evaluate(SETUP(1240, ATIVOS) + "desafioDesistindo='poseidon'; ir('desafios'); render();"); await page.waitForTimeout(80);
    const h1 = await page.evaluate(() => { const df = document.getElementById('desafios'); let mn = 1e9; ['[data-desiste-ok]', '[data-desiste-no]'].forEach(s => { const el = df.querySelector(s); if (el) { const r = el.getBoundingClientRect(); mn = Math.min(mn, r.height, r.width); } }); return Math.round(mn * 10) / 10; });
    ok(h1 >= 39.5, `SIM/NÃO da desistência têm ≥40×40 (veio ${h1})`);
    await page.evaluate("contaAtual=null; ir('desafios'); render();"); await page.waitForTimeout(80);
    const h2 = await page.evaluate(() => { const el = document.querySelector('#desafios [data-ondeganhar]'); if (!el) return null; const r = el.getBoundingClientRect(); return Math.round(Math.min(r.height, r.width) * 10) / 10; });
    ok(h2 != null && h2 >= 39.5, `"Onde ganhar Essência?" (offline) tem ≥40×40 (veio ${h2})`);
    await ctx.close(); }
  // §360 @1846×852: a tela fixa escala para cima (fit) e cabe inteira sem cortar, ainda com ≥1 fileira
  { const ctx = await browser.newContext({ viewport: { width: 1846, height: 852 }, deviceScaleFactor: 1 });
    const page = await ctx.newPage(); await page.goto('file://' + distAbs, { waitUntil: 'load' });
    await page.evaluate(BOOT); await page.waitForTimeout(120);
    const m = await page.evaluate(() => { const df = document.getElementById('desafios'); const b = df.getBoundingClientRect();
      const fora = b.left < -0.5 || b.top < -0.5 || b.right > window.innerWidth + 0.5 || b.bottom > window.innerHeight + 0.5;
      const esc = b.width / 780;
      const g = df.querySelector('.df-grade'); const gr = g.getBoundingClientRect(); const rows = {};
      g.querySelectorAll('.df-card').forEach(c => { const r = c.getBoundingClientRect(); if (r.bottom <= gr.bottom + 0.5 && r.top >= gr.top - 0.5) rows[Math.round(r.top)] = 1; });
      let clips = []; df.querySelectorAll('*').forEach(el => { if (el.scrollWidth > el.clientWidth + 1.5 && getComputedStyle(el).overflowX !== 'visible') clips.push(el.className || el.tagName); });
      return { esc: Math.round(esc * 1000) / 1000, fora, fileiras: Object.keys(rows).length, clips: clips.slice(0, 6) }; });
    console.log(`  @1846×852: escala ${m.esc} · fileiras ${m.fileiras}`);
    ok(m.esc > 1.5, `a tela escala para cima (escala ${m.esc})`);
    ok(!m.fora, '@1846×852: a tela fixa cabe (nada sai da viewport)');
    ok(m.fileiras >= 1, `@1846×852: ≥1 fileira de cartão inteira (veio ${m.fileiras})`);
    ok(m.clips.length === 0, `@1846×852: nada corta (${m.clips.length ? m.clips.join(',') : 'ok'})`);
    await ctx.close(); }
  await browser.close();
  console.log(`\n== DESAFIOS_TELA — ${passes} asserções, ${falhas} falha(s) ==`);
  process.exit(falhas ? 1 : 0);
})();
