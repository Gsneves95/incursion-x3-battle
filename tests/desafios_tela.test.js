// desafios_tela.test.js (§339) — a TELA DESAFIOS no modelo do dono (tela fixa 1846×852 escalada). Comportamento:
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

(async () => {
  console.log('\n== §339 layout (Chromium) ==');
  let chromium; try { chromium = require('playwright').chromium; } catch (e) { console.log('  (playwright ausente — pulo o layout)'); console.log(`\n== DESAFIOS_TELA — ${passes} asserções, ${falhas} falha(s) ==`); process.exit(falhas ? 1 : 0); }
  function acha(){ try{ const b='/opt/pw-browsers'; const dd=fs.readdirSync(b).filter(x=>/^chromium-\d+$/.test(x)).sort().pop(); if(dd){ const p=path.join(b,dd,'chrome-linux','chrome'); if(fs.existsSync(p)) return p; } }catch(e){} return undefined; }
  const distAbs = path.resolve(__dirname, '..', 'dist', 'incursion.html');
  const browser = await chromium.launch({ executablePath: acha(), headless: true, args: ['--no-sandbox'] });
  const BOOT = SETUP(1240, ATIVOS) + "ir('desafios'); render();";
  // @1846×852: caixas dos blocos
  { const ctx = await browser.newContext({ viewport: { width: 1846, height: 852 }, deviceScaleFactor: 1 });
    const page = await ctx.newPage(); await page.goto('file://' + distAbs, { waitUntil: 'load' });
    await page.evaluate(BOOT); await page.waitForTimeout(120);
    const m = await page.evaluate(() => { const df = document.getElementById('desafios'); const b = df.getBoundingClientRect();
      const rel = sel => { const el = df.querySelector(sel); if (!el) return null; const r = el.getBoundingClientRect(); return { x: r.left - b.left, y: r.top - b.top, w: r.width, h: r.height }; };
      return { df: { w: b.width, h: b.height }, cab: rel('.df-cab'), sem: rel('.df-sem'), compos: rel('.df-compos'), regras: rel('.df-regras'), filtros: rel('.df-filtros'), grade: rel('.df-grade') }; });
    const perto = (a, b, t) => Math.abs(a - b) <= (t || 2);
    ok(perto(m.df.w, 1846) && perto(m.df.h, 852), `#desafios é 1846×852 (veio ${Math.round(m.df.w)}×${Math.round(m.df.h)})`);
    ok(m.sem && perto(m.sem.y, 100) && perto(m.sem.h, 182), `banner em top 100, h 182 (veio ${m.sem && Math.round(m.sem.y)}/${m.sem && Math.round(m.sem.h)})`);
    ok(m.compos && perto(m.compos.y, 298), `composição em top 298 (veio ${m.compos && Math.round(m.compos.y)})`);
    ok(m.regras && perto(m.regras.y, 378), `regras em top 378 (veio ${m.regras && Math.round(m.regras.y)})`);
    ok(m.filtros && perto(m.filtros.y, 430), `filtros em top 430 (veio ${m.filtros && Math.round(m.filtros.y)})`);
    ok(m.grade && perto(m.grade.y, 488) && perto(m.grade.x, 32), `grade em top 488/left 32 (veio ${m.grade && Math.round(m.grade.y)}/${m.grade && Math.round(m.grade.x)})`);
    await ctx.close(); }
  // @780×360: cabe, nada corta
  { const ctx = await browser.newContext({ viewport: { width: 780, height: 360 }, deviceScaleFactor: 2 });
    const page = await ctx.newPage(); await page.goto('file://' + distAbs, { waitUntil: 'load' });
    await page.evaluate(BOOT); await page.waitForTimeout(120);
    const m = await page.evaluate(() => { const esc = (typeof ultimaEscalaBatalha !== 'undefined' && ultimaEscalaBatalha) || 1; const df = document.getElementById('desafios'); const b = df.getBoundingClientRect();
      const fora = b.left < -0.5 || b.top < -0.5 || b.right > window.innerWidth + 0.5 || b.bottom > window.innerHeight + 0.5;
      const card = df.querySelector('.df-card'); const btn = df.querySelector('.dfb');
      const nome = df.querySelector('.df-card__n');
      const clip = el => el ? (el.scrollWidth > el.clientWidth + 1) : false;
      return { esc: Math.round(esc * 1000) / 1000, fora,
        cardTxtPx: nome ? Math.round(parseFloat(getComputedStyle(nome).fontSize) * esc * 10) / 10 : null,
        btnH: btn ? Math.round(btn.getBoundingClientRect().height * 10) / 10 : null,
        nomeClip: clip(nome), tituloClip: clip(df.querySelector('.df-sem__tit')) }; });
    console.log(`  @780×360: escala ${m.esc} · nome do cartão ${m.cardTxtPx}px · altura do botão ${m.btnH}px`);
    ok(!m.fora, '@780×360: a tela fixa cabe (nada sai da viewport)');
    ok(!m.nomeClip && !m.tituloClip, '@780×360: nome do cartão e título da semana não cortam');
    await ctx.close(); }
  await browser.close();
  console.log(`\n== DESAFIOS_TELA — ${passes} asserções, ${falhas} falha(s) ==`);
  process.exit(falhas ? 1 : 0);
})();
