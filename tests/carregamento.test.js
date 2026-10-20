// tests/carregamento.test.js — §341 TELA DE CARREGAMENTO.
// (1) o LANÇADOR local (web/carregamento/lancador.html): a lógica do stepper + o DOM de erro, dirigidos por um
//     RELÓGIO controlado e um ping stub (jsdom). Casos: responde de primeira → navega após ~1s; demora → a barra
//     avança sem passar de 90% antes da resposta e não enche sozinha, e completa+navega depois; sem rede → TENTAR
//     DE NOVO; >90s → mensagem de demora.
// (2) o SPLASH do jogo (shell.html/dist): o bloco #gsplash aparece do 1º byte e some depois que o jogo inicia.
const fs = require('fs'), path = require('path');
const { JSDOM } = require('jsdom');
let falhas = 0; const ok = (c, m) => { if (!c) { console.log('  FALHA: ' + m); falhas++; } };
const lancHtml = fs.readFileSync(path.join(__dirname, '..', 'web', 'carregamento', 'lancador.html'), 'utf8');
const flush = () => new Promise(r => setTimeout(r, 0));

// cria uma sessão do lançador com relógio e deps controlados; auto-start desligado (__LAN_TEST__)
function lancador(cfg, deps0) {
  const dom = new JSDOM(lancHtml, { runScripts: 'dangerously', pretendToBeVisual: true,
    beforeParse(w) { w.__LAN_TEST__ = true; w.setInterval = () => 0; } });   // sem auto-tick: o teste chama __lanTick
  const w = dom.window, d = w.document;
  // o fonte versionado tem __JOGO_URL__ (o cap-www.js troca no empacote); no teste fixamos uma URL real
  Object.assign(w.LAN.CFG, { jogoUrl: 'https://incursion-servidor.onrender.com', pingMs: 0, completarMs: 300, minMs: 1000, alvoMs: 45000, teto: 98, demoraMs: 90000 }, cfg || {});
  Object.assign(w.LAN.DEPS, deps0);
  w.iniciarLancador();
  const barW = () => parseFloat((d.getElementById('lanbar').style.width || '0').replace('%', '')) || 0;
  return { w, d, barW,
    tick: () => w.__lanTick(),
    erroVis: () => d.getElementById('lan').classList.contains('lan--erro'),
    erroMsg: () => d.getElementById('lanerromsg').textContent,
    retry: () => d.getElementById('lanretry'),
    fechar: () => dom.window.close() };
}

(async () => {
  console.log('== 1. lançador: responde de primeira → navega após ~1s (não antes) ==');
  {
    let T = 0, nav = null;
    const S = lancador({}, { agora: () => T, online: () => true, ping: () => Promise.resolve(true), navegar: u => { nav = u; } });
    S.tick(); await flush();                       // 1º tick em T=0: pinga, resposta chega (microtask)
    T = 300; S.tick();
    ok(nav === null, 'antes de ~1s não navega (sem piscar)');
    T = 1000; S.tick();
    ok(nav === 'https://incursion-servidor.onrender.com' || /onrender/.test(String(nav)), `com ~1s de tela, navega para o jogo (nav ${nav})`);
    ok(S.barW() >= 99.5, `a barra completa a 100% (${S.barW()}%)`);
    S.fechar();
  }

  console.log('== 2. lançador: demora → barra ≤90% antes da resposta, nunca enche sozinha, depois completa+navega ==');
  {
    let T = 0, nav = null, respder = false;
    const S = lancador({}, { agora: () => T, online: () => true, ping: () => Promise.resolve(respder), navegar: u => { nav = u; } });
    S.tick(); await flush();
    T = 5000; S.tick(); await flush(); const p5 = S.barW();
    T = 10000; S.tick(); await flush(); const p10 = S.barW();
    ok(p5 > 0 && p10 > p5 && p10 < 90, `a barra avança e fica abaixo de 90% em 10s (${p5}% → ${p10}%)`);
    T = 44000; S.tick(); await flush();
    ok(S.barW() < 90, `pouco antes de 45s ainda < 90% (${S.barW()}%)`);
    T = 300000; S.tick(); await flush();            // muito tempo, sem resposta
    ok(S.barW() <= 98 && S.barW() < 100, `sem resposta a barra NUNCA enche sozinha (${S.barW()}%, teto 98)`);
    ok(nav === null, 'sem resposta, não navega');
    respder = true; T = 300000; S.tick(); await flush();   // agora o ping responde
    T = 301000; S.tick();
    ok(nav && /onrender/.test(String(nav)) && S.barW() >= 99.5, `quando o ping responde, completa a 100% e navega (nav ${nav}, ${S.barW()}%)`);
    S.fechar();
  }

  console.log('== 3. lançador: sem rede → "Sem conexão" + TENTAR DE NOVO ==');
  {
    let T = 0; let onl = false;
    const S = lancador({}, { agora: () => T, online: () => onl, ping: () => Promise.resolve(true), navegar: () => {} });
    S.tick(); await flush();
    ok(S.erroVis() && /Sem conexão/i.test(S.erroMsg()), `sem rede mostra "Sem conexão" (msg "${S.erroMsg()}")`);
    ok(!!S.retry() && /TENTAR DE NOVO/i.test(S.retry().textContent), 'há o botão TENTAR DE NOVO');
    // a rede volta: continua sozinho e navega
    let nav = null; S.w.LAN.DEPS.navegar = u => { nav = u; };
    onl = true; T = 100; S.tick(); await flush(); T = 1200; S.tick();
    ok(!S.erroVis() && nav && /onrender/.test(String(nav)), `quando a rede volta, segue sozinho e navega (nav ${nav})`);
    S.fechar();
  }

  console.log('== 4. lançador: demora excessiva (>90s) → mensagem de demora, barra não travada em valor falso ==');
  {
    let T = 0;
    const S = lancador({}, { agora: () => T, online: () => true, ping: () => Promise.resolve(false), navegar: () => {} });
    S.tick(); await flush();
    T = 91000; S.tick(); await flush();
    ok(S.erroVis() && /demorando para responder/i.test(S.erroMsg()), `>90s mostra "servidor demorando" (msg "${S.erroMsg()}")`);
    ok(S.barW() > 90 && S.barW() < 100, `a barra segue viva (${S.barW()}%), não travada num valor falso`);
    S.fechar();
  }

  console.log('== 5. splash do jogo (shell.html/dist): aparece do 1º byte e some após iniciar ==');
  {
    const html = fs.readFileSync(path.join(__dirname, '..', 'dist', 'incursion.html'), 'utf8');
    ok(/id="gsplash"/.test(html), 'o #gsplash está no HTML (visível do 1º byte, CSS no <head>)');
    ok(/INCURSION<\/h1>/.test(html) || /gsplash__name/.test(html), 'o splash traz o nome INCURSION');
    const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://x/' });
    const g = dom.window.document.getElementById('gsplash');
    // _splashFora() roda no boot (view.js, após o 1º render): marca p/ sair (fade) e remove em 600ms
    ok(!g || g.classList.contains('gsplash--fora'), 'após iniciar, o splash foi marcado para sair (fade) ou já saiu');
    dom.window.close();
  }

  console.log('');
  console.log(falhas === 0 ? '>>> CARREGAMENTO OK' : `>>> ${falhas} FALHA(S)`);
  process.exit(falhas ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
