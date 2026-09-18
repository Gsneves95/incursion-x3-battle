// retrato_grande.test.js (§297) — RETRATO de deus: toda caixa que AMPLIA usa o arquivo grande (retratos/<k>.webp),
// as que reduzem ficam no embutido. O §289 consertou a sobreposição da Coleção mas a tabela dele tinha um BURACO DE
// ESCOPO: a rota 'deus' (ficha cheia, alcançada por Missões/Provações/Desafios/Domínios/campanha) não estava na lista
// e ficou com o IMG embutido de 168 esticado na caixa 382×380 (2,27× = borrão). Esta guarda:
//   (1) toda caixa AMPLIADORA (slot de retrato com lado > TETO) tem um <img src="retratos/…"> cobrindo;
//   (2) esse <img> é lazy + onerror=this.remove() (ausente o arquivo, cai no embutido, sem 404) e nunca base64 (§289);
//   (3) ANTI-REGRESSÃO: varre as telas alcançáveis e QUEBRA se surgir um retrato acima do teto sem o arquivo grande.
// Navegador REAL (jsdom não faz layout). Limite honesto: a BATALHA precisa de partida viva e não é varrida aqui — o
// retrato de combate é 94px (§258) < TETO, então reduz; se um dia crescer, entra nesta varredura.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const TETO = 168;   // a arte EMBUTIDA (IMG[k]) é 168×168; caixa maior que isso faz upscale (borra) → exige o grande

function acharChromium() {
  if (process.env.INCURSION_CHROMIUM) return process.env.INCURSION_CHROMIUM;
  try { const base = '/opt/pw-browsers'; const d = fs.readdirSync(base).filter(x => /^chromium-\d+$/.test(x)).sort().pop(); if (d) { const b = path.join(base, d, 'chrome-linux', 'chrome'); if (fs.existsSync(b)) return b; } } catch (e) {}
  return undefined;
}
let falhas = 0;
const ok = (c, m) => { if (!c) { falhas++; console.log('  XX ' + m); } };

(async () => {
  const distAbs = path.resolve(__dirname, '..', 'dist', 'incursion.html');
  const browser = await chromium.launch({ executablePath: acharChromium(), headless: true });
  const page = await (await browser.newContext()).newPage();
  await page.goto('file://' + distAbs, { waitUntil: 'load' });

  // nenhum retrato grande é base64 embutido (§289): a fonte é sempre um ARQUIVO retratos/*.webp
  const html = fs.readFileSync(distAbs, 'utf8');
  ok(!/src="data:image[^"]*"[^>]*class="[^"]*retratog|class="[^"]*retratog[^"]*"[^>]*src="data:/.test(html), 'retrato grande não pode ser base64 (tem de ser <img src="retratos/…"> lazy)');

  for (const W of [780, 951]) {
    await page.setViewportSize({ width: W, height: 428 });
    const r = await page.evaluate((TETO) => {
      ROSTER.forEach(e => { perfil.deuses[e.key] = perfil.deuses[e.key] || { obtidoEm: Date.now(), copias: 1 }; });
      const viol = [], amplia = [];
      function varrer(tela) {
        for (const s of document.querySelectorAll('.slot[data-slot^="god-"]')) {
          const b = s.getBoundingClientRect(); const lado = Math.max(b.width, b.height);
          if (lado <= TETO + 0.5) continue;   // reduz — embutido basta
          const cont = s.parentElement;
          const big = cont && cont.querySelector('img[src^="retratos/"]');
          amplia.push(`${tela}:${s.dataset.slot} ${Math.round(b.width)}×${Math.round(b.height)} (${(lado / TETO).toFixed(2)}×)${big ? '' : ' SEM-GRANDE'}`);
          if (!big) viol.push(`${tela}:${s.dataset.slot} ${Math.round(b.width)}×${Math.round(b.height)} sem retratos/`);
          else {
            if ((big.getAttribute('loading') || '') !== 'lazy') viol.push(`${tela}:${s.dataset.slot} grande não é lazy`);
            if (!/this\.remove/.test(big.getAttribute('onerror') || '')) viol.push(`${tela}:${s.dataset.slot} grande sem onerror=remove`);
            if (!cont.querySelector('.slot img, .slot__glyph')) viol.push(`${tela}:${s.dataset.slot} sem embutido de reserva`);
          }
        }
      }
      // telas alcançáveis sem partida viva
      ir('colecao', {}, { substituir: true }); render(); varrer('colecao-grade');
      colSelecionar('odin'); varrer('colecao-painel');
      colAbrirVer('odin'); varrer('colecao-sobrep'); colFecharVer();
      ir('deus', { key: 'odin' }); render(); varrer('rota-deus');
      ir('selecao', {}, { substituir: true }); render(); varrer('selecao');
      ir('dominios', {}, { substituir: true }); render(); varrer('dominios');
      ir('desafios', {}, { substituir: true }); render(); varrer('desafios');
      ir('pvp', {}, { substituir: true }); render(); varrer('pvp');
      return { viol, amplia };
    }, TETO);
    ok(r.viol.length === 0, `@${W} caixa amplia sem arquivo grande (ou sem lazy/onerror/reserva): ` + r.viol.slice(0, 6).join(' · '));
    console.log(`  @${W}: caixas que ampliam (>${TETO}px) → ` + (r.amplia.length ? r.amplia.join(' · ') : '(nenhuma)'));
  }

  await browser.close();
  console.log(falhas === 0 ? '\n>>> RETRATO-GRANDE OK' : `\n>>> ${falhas} FALHA(S)`);
  process.exit(falhas ? 1 : 0);
})();
