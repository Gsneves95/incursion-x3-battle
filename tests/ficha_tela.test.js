// §350 — A FICHA DO DEUS (renderDeusDetalhe, rota 'deus') no modelo do dono: TELA FIXA 1846×852 escalada. Arte
// grande à ESQUERDA (retrato cover + véu + nome Cinzel + "VOCÊ NÃO POSSUI" se não tem) · cabeçalho (‹ VOLTAR ·
// raridade + "SUBIR HABILIDADES ›") · COLUNA à direita (etiquetas panteão/elemento/classe/função · MAESTRIA ou
// "COMO CONSEGUIR" · HABILIDADES = 5 botões quadrados · DETALHE da selecionada). Abre na PASSIVA. Prova os botões,
// o selo de nível só nas ativas, o custo GRÁTIS/orbes, o elo com a Provação, e o ENCAIXE no Chromium (1846×852 e
// 780×360): a arte e a coluna não se sobrepõem, o detalhe inteiro cabe na tela, nenhum texto corta.
const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

let falhas = 0, passes = 0;
const ok = (c, m) => { if (!c) { console.log('  ✗ FALHA: ' + m); falhas++; } else { console.log('  ✓ ' + m); passes++; } };

const html = fs.readFileSync(path.join(__dirname, '../dist/incursion.html'), 'utf8');
const vc = new VirtualConsole();
let err = null;
vc.on('jsdomError', e => { err = (e.detail && e.detail.message) || e.message; });
const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://x/', virtualConsole: vc });
const w = dom.window, d = w.document;
const $ = s => d.querySelector(s), $$ = s => [...d.querySelectorAll(s)];
const txt = el => (el ? el.textContent : '').replace(/\s+/g, ' ').trim();
const clk = el => el.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
function abrir(k, tem) {
  w.eval(`${tem ? `perfil.deuses.${k}=perfil.deuses.${k}||{obtidoEm:Date.now(),copias:1};` : `delete perfil.deuses.${k};`}
    contaAtual={pontos:{${k}:1},niveis:{${k}:{basico:2,habilidade:1,milagre:1}},perfil:{deuses:perfil.deuses},missoes:{ativa:null,progresso:{},liberados:[]}};
    deusSelKey=null;ir('deus',{key:${JSON.stringify(k)}},{substituir:true});render();`);
}

console.log('== §350 / FICHA DO DEUS (tela fixa: arte + cabeçalho + coluna) ==');

// ---- 1. POSSUINDO: 5 botões, abre na PASSIVA (sem selo de nível), MAESTRIA ----
console.log('\n== 1. possuindo: 5 habilidades, abre na PASSIVA (sem Nv), MAESTRIA ==');
err = null;
abrir('zeus', true);
ok(!err, 'renderiza sem quebrar (' + (err || 'ok') + ')');
ok(!!$('#deusfix') && !$('.deusfix--falta'), 'monta na tela fixa (#deusfix), possuindo (sem --falta)');
ok(txt($('.dsx-art__nome')) === 'Zeus', 'o nome na arte nomeia o deus');
ok($$('.dsx-hab__btns .dsk').length === 5, 'HABILIDADES: 5 botões (Passiva + Básico/Habilidade/Milagre + Defesa)');
ok(!!$('.dmaes') && !$('.dcomo'), 'possuindo: mostra a MAESTRIA (não o "como conseguir")');
ok(!!$('.dsx-art__posse--tem') && /Possuído/.test(txt($('.dsx-art__posse'))), '§358: "Possuído · N cópias · N pontos" está na arte');
ok($$('.dsx-tab[data-ficha-aba]').length === 2, '§358: abas HABILIDADES | SINERGIA acima das habilidades');
ok(!!$('#dsxprev') && !!$('#dsxnext'), '§358: setas ‹ › de navegação na ficha');
// HRM é const léxica do bundle (não vai p/ window) — lê via eval no escopo global da página.
ok(!!(w.eval('!!(typeof HRM!=="undefined" && HRM.zeus && HRM.zeus.arquetipo)') ? $('.dsx-art__arq') : true), '§358: o arquétipo aparece na arte (quando há)');
{
  const sel = $('.dsk.is-sel');
  ok(sel.title === 'Passiva' && !sel.querySelector('.dsk__nv'), 'abre na PASSIVA e a PASSIVA NÃO tem selo de nível');
  ok(/PASSIVA/.test(txt($('.ddet__pill--tipo'))), 'o detalhe abre na PASSIVA');
  ok(!!$('.ddet__pas') && !$('.ddet__cost'), 'a passiva NÃO mostra custo (é "não gasta a ação")');
  ok($('.ddet__desc') && $('.ddet__desc').textContent.replace(/\s+/g, ' ').trim().length > 8, '§358b: a PASSIVA mostra o TEXTO completo (não só "não gasta a ação")');
}

// ---- 2. §350c: o SELO "Nv N" só nas habilidades COM escada; Passiva E Defesa (sem níveis) NÃO têm selo ----
console.log('\n== 2. selo "Nv N" só nas habilidades com escada (Passiva/Defesa sem selo) ==');
{
  const btn = sl => $$('.dsk[data-deussel]').find(b => b.dataset.deussel === sl);
  ok(!!btn('basico').querySelector('.dsk__nv') && /Nv 2/.test(txt(btn('basico').querySelector('.dsk__nv'))), 'o Básico tem "Nv 2" (do nível na conta)');
  ok(!!btn('habilidade').querySelector('.dsk__nv') && !!btn('milagre').querySelector('.dsk__nv'), 'Habilidade e Milagre (com escada) têm selo de nível');
  ok(!btn('passiva').querySelector('.dsk__nv'), '§350c: a PASSIVA não tem selo de nível');
  ok(!btn('defesa').querySelector('.dsk__nv'), '§350c: a DEFESA (sem escada) não tem selo de nível');
}

// ---- 3. tocar uma ATIVA troca o detalhe: título + pílulas (tipo/classe/alvo/NV) + custo em ORBES + recarga ----
console.log('\n== 3. tocar o milagre: detalhe com pílulas + custo em ORBES + recarga ==');
{
  clk($$('.dsk[data-deussel]').find(b => b.dataset.deussel === 'milagre'));
  const btSel = $$('.dsk[data-deussel]').find(b => b.dataset.deussel === 'milagre');   // re-consulta: render() refez o DOM
  ok(btSel.classList.contains('is-sel') && /MILAGRE/.test(txt($('.ddet__pill--tipo'))), 'tocar o milagre seleciona e o detalhe vira MILAGRE');
  ok(/Ira Celestial/.test(txt($('.ddet__tit'))), 'o detalhe mostra o nome real (Ira Celestial)');
  ok(!!$('.ddet__cost .dmk-ab__orbs') && !$('.ddet__cost .dmk-ab__gratis'), 'o milagre do Zeus mostra o custo em ORBES (não GRÁTIS)');
  ok(/Recarga/.test(txt($('.ddet__cd'))), 'mostra a recarga');
  ok($('.ddet__desc').textContent.length > 8, 'mostra a descrição completa');
}

// ---- 4. CUSTO GRÁTIS (§340): um básico sem orbes diz "GRÁTIS", não pontinhos ----
console.log('\n== 4. custo GRÁTIS (§340) ==');
{
  abrir('brigid', true);
  const bt = $$('.dsk[data-deussel]').find(b => b.dataset.deussel === 'basico');
  clk(bt);
  ok(!!$('.ddet__cost .dmk-ab__gratis') && /GRÁTIS/.test(txt($('.ddet__cost'))), 'o básico sem orbes diz "GRÁTIS"');
}

// ---- 5. NÃO POSSUINDO: tag na arte + "COMO CONSEGUIR" (atalho p/ a Provação) ----
console.log('\n== 5. não possuindo: tag + COMO CONSEGUIR com atalho para a Provação ==');
{
  abrir('anubis', false);
  ok(!!$('.deusfix--falta') && /NÃO POSSUI/.test(txt($('.dsx-art__tag'))), 'tag "VOCÊ NÃO POSSUI" na arte');
  ok(!!$('.dcomo') && !$('.dmaes'), '"COMO CONSEGUIR" no lugar da maestria');
  ok(/Invoca/.test(txt($('.dcomo'))) && /Missão/.test(txt($('.dcomo'))), 'cita Invocação e Missão');
  const via = $('.dcomo [data-vermissao]');
  ok(!!via, 'a via de Missão é um atalho (data-vermissao)');
  clk(via);
  ok(w.eval("rotaAtual()") === 'provacoes', 'o atalho leva às Provações');
  // o kit continua legível/tocável mesmo sem possuir
  abrir('anubis', false);
  ok($$('.dsx-hab__btns .dsk:not([disabled])').length === 5, 'não possuindo: as 5 habilidades continuam tocáveis');
}

// ---- 6. "SUBIR HABILIDADES ›": leva à rota 'niveis'; acende (is-pag) só com nível pagável ----
console.log('\n== 6. "SUBIR HABILIDADES ›": elo com níveis; acende só quando pagável ==');
{
  // pagável: tudo nv1 + 1 ponto → acende
  w.eval("perfil.deuses.zeus=perfil.deuses.zeus||{obtidoEm:Date.now(),copias:1};contaAtual={pontos:{zeus:1},niveis:{zeus:{basico:1,habilidade:1,milagre:1}},perfil:{deuses:perfil.deuses},missoes:{ativa:null,progresso:{},liberados:[]}};deusSelKey=null;ir('deus',{key:'zeus'},{substituir:true});render();");
  const b = $('.dsxb--subir[data-irniveis="zeus"]');
  ok(!!b && /SUBIR HABILIDADES/.test(txt(b)) && b.classList.contains('is-pag') && !!b.querySelector('.dsx-dot'), 'pagável: o botão acende (is-pag) com a bolinha de aviso');
  clk(b);
  ok(w.eval("rotaAtual()") === 'niveis', 'o botão leva à TELA DE NÍVEIS');
  // sem ponto → não acende
  w.eval("contaAtual={pontos:{zeus:0},niveis:{zeus:{basico:1,habilidade:1,milagre:1}},perfil:{deuses:perfil.deuses},missoes:{ativa:null,progresso:{},liberados:[]}};deusSelKey=null;ir('deus',{key:'zeus'},{substituir:true});render();");
  ok(!$('.dsxb--subir[data-irniveis="zeus"]').classList.contains('is-pag'), 'sem ponto pagável: o botão NÃO acende');
}

if (falhas) { console.log(`\n== ${passes} ok, ${falhas} FALHAS (jsdom) ==`); process.exit(1); }
console.log(`\n== jsdom OK (${passes}) — agora o ENCAIXE no Chromium (1846×852 e 780×360) ==`);

// ================= §350 — ENCAIXE: a tela fixa enche o palco; arte×coluna sem sobrepor; a coluna toda (inclusive o
//                   DETALHE) termina dentro da tela (≤830); nenhum texto corta. 1846×852 e 780×360. =================
(async () => {
  const { chromium } = require('playwright');
  function acharChromium() { try { const base = '/opt/pw-browsers'; const dir = fs.readdirSync(base).filter(x => /^chromium-\d+$/.test(x)).sort().pop(); const bin = path.join(base, dir, 'chrome-linux', 'chrome'); if (fs.existsSync(bin)) return bin; } catch (e) {} return undefined; }
  const distAbs = 'file://' + path.resolve(__dirname, '..', 'dist', 'incursion.html');
  // possuído com uma ATIVA selecionada (detalhe cheio) + não possuído com o PIOR caso (missão de texto mais longo +
  // a habilidade de maior descrição) — §350c: o COMO CONSEGUIR compacto tem de deixar o detalhe INTEIRO na tela.
  const TEM = `perfil.deuses.zeus=perfil.deuses.zeus||{obtidoEm:Date.now(),copias:1};contaAtual={pontos:{zeus:1},niveis:{zeus:{basico:2,habilidade:1,milagre:1}},perfil:{deuses:perfil.deuses},missoes:{ativa:null,progresso:{},liberados:[]}};deusSelKey=null;ir('deus',{key:'zeus'},{substituir:true});render();document.querySelectorAll('.dsk[data-deussel]').forEach(b=>{if(b.dataset.deussel==='milagre')b.dispatchEvent(new MouseEvent('click',{bubbles:true}));});`;
  const FALTA = `(function(){var best={len:0,k:'anubis'};for(var kk in MISSOES.missoes){var t=reqMissaoTexto(kk)||'';if(t.length>best.len)best={len:t.length,k:kk};}var K=best.k;delete perfil.deuses[K];contaAtual={pontos:{},niveis:{},perfil:{deuses:perfil.deuses},missoes:{ativa:null,progresso:{},liberados:[]}};deusSelKey=null;ir('deus',{key:K},{substituir:true});render();var g=GODS[K],best2='basico',bl=0;(g.ab||[]).forEach(function(a){if((a.desc||'').length>bl){bl=a.desc.length;best2=a.slot;}});document.querySelectorAll('.dsk[data-deussel]').forEach(function(b){if(b.dataset.deussel===best2)b.dispatchEvent(new MouseEvent('click',{bubbles:true}));});})();`;
  const browser = await chromium.launch({ executablePath: acharChromium(), headless: true });
  let cf = 0; const ok2 = (c, m) => { if (!c) { cf++; console.log('  XX ' + m); } else console.log('  ok ' + m); };
  for (const [W, H] of [[1846, 852], [780, 360]]) {
    for (const [nome, mk] of [['possui', TEM], ['falta', FALTA]]) {
      const page = await (await browser.newContext({ viewport: { width: W, height: H } })).newPage();
      await page.goto(distAbs, { waitUntil: 'load' });
      const r = await page.evaluate((mk) => {
        eval(mk); const g = document.getElementById('gsplash'); if (g) g.remove();
        const fix = document.getElementById('deusfix'), fb = fix.getBoundingClientRect();
        const esc = fb.height / 360;   // §358: canvas 780×360 (= o celular)
        const pw = fb.width / innerWidth, ph = fb.height / innerHeight;
        const designBot = el => Math.round((el.getBoundingClientRect().bottom - fb.top) / esc);
        // §350c: y de design do CONTEÚDO — cabeçalho + os FILHOS diretos da coluna + os FILHOS do DETALHE (cabeçalho,
        // meta, descrição): nada do detalhe pode cair fora da tela. A .dsx-art é o retrato full-bleed (862×852, fundo
        // decorativo de propósito) — não é zona de conteúdo, fica de fora.
        let botMax = 0, pior = '';
        const alvos = [fix.querySelector('.dsx-cab'), ...fix.querySelectorAll('.dsx-col > *'), ...fix.querySelectorAll('.ddet > *')].filter(Boolean);
        alvos.forEach(el => { const b = designBot(el); if (b > botMax) { botMax = b; pior = el.className.split(' ')[0]; } });
        // sobreposição arte × coluna
        const art = fix.querySelector('.dsx-art').getBoundingClientRect(), col = fix.querySelector('.dsx-col').getBoundingClientRect();
        const overlap = art.right > col.left + 1;
        // texto cortado em títulos/nomes/rótulos
        let clips = [];
        // obs.: a .dsxb--subir fica de fora — a bolinha de aviso (.dsx-dot) é absoluta em right:-6px (fora da borda de
        // propósito) e contaria como "overflow" sem ser corte de texto.
        fix.querySelectorAll('.dsx-art__nome,.dsx-rar,.dsx-tag,.dmaes__nv,.dmaes__hint,.dsk__nome,.dsk__nv,.ddet__tit,.ddet__pill,.dcomo__via b,.ddet__clab').forEach(el => { if (el.scrollWidth > el.clientWidth + 1.5) clips.push(el.className.split(' ')[0]); });
        return { pw, ph, botMax, pior, overlap, clips: [...new Set(clips)].slice(0, 6) };
      }, mk);
      ok2(Math.min(r.pw, r.ph) >= 0.98, `§350 ficha/${nome} @${W}×${H}: enche a tela (${(r.pw * 100).toFixed(1)}%×${(r.ph * 100).toFixed(1)}%)`);
      ok2(r.botMax <= 360, `§358 ficha/${nome} @${W}×${H}: cabeçalho/coluna (inclusive o detalhe) terminam dentro do canvas 360 (pior ${r.botMax} em ${r.pior})`);
      ok2(!r.overlap, `§350 ficha/${nome} @${W}×${H}: a arte e a coluna não se sobrepõem`);
      ok2(r.clips.length === 0, `§350 ficha/${nome} @${W}×${H}: nenhum texto corta (${r.clips.join(',') || 'ok'})`);
      await page.close();
    }
  }
  await browser.close();
  if (cf || falhas) { console.log(`\n== ${cf} falha(s) de encaixe + ${falhas} jsdom ==`); process.exit(1); }
  console.log('\n== FICHA DO DEUS §350 OK (jsdom + Chromium) ==');
  process.exit(0);
})().catch(e => { console.error(e.stack || e.message || e); process.exit(1); });
