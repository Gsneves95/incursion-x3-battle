// §344 — o MONTADOR do §342 aplicado à Campanha, à Composição e ao PvP (cfg por modo). Por modo: escolher/tirar/
// bloqueio do 4º; filtros+busca; kit "i"; COMEÇAR/ENTRAR chama o handler certo com o time na ordem; VOLTAR.
// Composição: cartão que viola a regra fica apagado e não entra. Campanha: troca do emprestado pela grade grava
// campSwap e volta ao ato. PvP: Amistosa/Ranqueada chamam o fluxo certo; "Usar último time"; estados da tela.
const fs = require('fs'), path = require('path');
const { JSDOM } = require('jsdom');
let falhas = 0, passes = 0;
const ok = (c, m) => { if (!c) { console.log('  ✗ ' + m); falhas++; } else { console.log('  ✓ ' + m); passes++; } };
const html = fs.readFileSync(path.join(__dirname, '../dist/incursion.html'), 'utf8');
function sessao() {
  const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://x/' });
  const w = dom.window, d = w.document;
  w.eval("perfil.deuses={}; ROSTER.slice(0,24).forEach(e=>perfil.deuses[e.key]={copias:1}); (MISSOES.iniciais||[]).forEach(k=>perfil.deuses[k]={copias:1}); montFiltroElem=null;montFiltroFunc=null;montBusca='';montKitAberto=null;montDica=false;");
  return { w, d, $: s => d.querySelector(s), $$: s => [...d.querySelectorAll(s)] };
}

console.log('== §344 CAMPANHA (montartime): escolher/tirar/4º, filtros+busca, kit, COMEÇAR na ordem, VOLTAR ==');
{ const { w, $, $$ } = sessao();
  w.eval("campTimePick=[]; var e=campEncontros().find(x=>x.aliados==null)||campEncontros()[0]; globalThis.__encId=e.id; ir('montartime',{id:e.id}); render();");
  ok(!!$('#dommontar') && /MONTE SEU TIME/.test($('.dm-titulo').textContent) && /CAMPANHA/.test($('.dm-sub').textContent), 'a Campanha usa o montador (título + sublinha CAMPANHA)');
  const cs = $$('.dm-card[data-pick]'), a = cs[0].dataset.pick, b = cs[1].dataset.pick, c = cs[2].dataset.pick, q = cs[3].dataset.pick;
  [a, b, c].forEach(k => $(`.dm-card[data-pick="${k}"]`).dispatchEvent(new w.MouseEvent('click', { bubbles: true })));
  ok(w.eval('campTimePick.length') === 3, 'escolher 3 enche as vagas');
  $(`.dm-card[data-pick="${q}"]`).dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  ok(w.eval('campTimePick.length') === 3 && !!$('#dmdica'), 'o 4º é bloqueado e a dica aparece');
  // tirar pelo X
  $(`.dm-vaga__x[data-rem="${a}"]`).dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  ok(w.eval('campTimePick.length') === 2, 'o X da vaga remove');
  // filtros + busca
  $('[data-func="Atacante"]').dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  ok($$('.dm-card[data-pick],.dm-card--off').length === w.eval("_montJogaveis().filter(k=>HRM[k].funcao==='Atacante').length"), 'filtro de função conta certo');
  $('[data-todos]').dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  // kit "i"
  $(`.dm-card[data-pick="${b}"] .dm-card__i`).dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  ok(!!$('#dmkit') && $$('.dmk-ab').length === 4, 'o "i" abre o painel de kit (4 habilidades)');
  $('[data-kit-x]').dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  // COMEÇAR na ordem
  w.eval("campTimePick=[]; render();");
  const cs2 = $$('.dm-card[data-pick]'), x = cs2[0].dataset.pick, y = cs2[1].dataset.pick, z = cs2[2].dataset.pick;
  w.eval("globalThis.__enc=null; iniciarEncontroComTime=(e,t)=>{__enc={id:e&&e.id,t};};");
  [x, y, z].forEach(k => $(`.dm-card[data-pick="${k}"]`).dispatchEvent(new w.MouseEvent('click', { bubbles: true })));
  $('#bcomecar').dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  ok(w.eval('__enc && __enc.id') === w.eval('__encId') && w.eval('JSON.stringify(__enc.t)') === JSON.stringify([x, y, z]), 'COMEÇAR chama iniciarEncontroComTime com o time NA ORDEM');
  w.eval("ir('campanha',{},{substituir:true}); campTimePick=[]; ir('montartime',{id:__encId}); render();");
  $('#bvoltar').dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  ok(w.eval("rotaAtual()") === 'campanha', 'VOLTAR volta à campanha');
}

console.log('\n== §344 COMPOSIÇÃO (desafiomontar): regra ao vivo, cartão que viola fica APAGADO e não entra ==');
{ const { w, $, $$ } = sessao();
  w.eval("desafioTimePick=[]; var ds=desafios().find(d=>d.regra==='monoElemento')||desafios()[0]; globalThis.__dsId=ds.id; ir('desafiomontar',{id:ds.id}); render();");
  ok(!!$('#dommontar') && /COMPOSIÇÃO/.test($('.dm-sub').textContent), 'a Composição usa o montador (sublinha COMPOSIÇÃO)');
  ok(/✕/.test($('.dm-ctx__val').textContent) && $('#bcomecar').disabled, 'a validação ao vivo diz ✕ e trava o COMEÇAR');
  const byE = w.eval("(function(){var m={};_montJogaveis().forEach(k=>{(m[HRM[k].elem]=m[HRM[k].elem]||[]).push(k);});return m;})()");
  const el = Object.keys(byE).find(e => byE[e].length >= 3) || Object.keys(byE)[0];
  $(`.dm-card[data-pick="${byE[el][0]}"]`).dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  const outro = w.eval(`_montJogaveis().find(k=>HRM[k].elem!==${JSON.stringify(el)})`);
  ok(!!outro && $(`.dm-card[data-pick="${outro}"]`) === null && $$('.dm-card--off').length > 0 && /elemento/i.test(($('.dm-card__off') || {}).textContent || ''), 'um deus de outro elemento fica APAGADO, sem data-pick, com o motivo');
  if (byE[el].length >= 3) {
    w.eval("desafioTimePick=[]; render();");
    byE[el].slice(0, 3).forEach(k => $(`.dm-card[data-pick="${k}"]`).dispatchEvent(new w.MouseEvent('click', { bubbles: true })));
    w.eval("globalThis.__dsf=null; iniciarDesafio=(dsf,t)=>{__dsf={id:dsf.id,t};};");
    ok(/✓/.test($('.dm-ctx__val').textContent) && !$('#bcomecar').disabled, 'time válido libera o COMEÇAR');
    const t = w.eval('desafioTimePick.slice()');
    $('#bcomecar').dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
    ok(w.eval('__dsf && __dsf.id') === w.eval('__dsId') && w.eval('JSON.stringify(__dsf.t)') === JSON.stringify(t), 'COMEÇAR chama iniciarDesafio com o time na ordem');
  }
  w.eval("ir('composicao',{},{substituir:true}); desafioTimePick=[]; ir('desafiomontar',{id:__dsId}); render();");
  $('#bvoltar').dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  ok(w.eval("rotaAtual()") === 'composicao', 'VOLTAR volta à composição');
}

console.log('\n== §344 CAMPANHA — a troca do emprestado usa a grade nova, grava campSwap e volta ao ato ==');
{ const { w, $, d } = sessao();
  w.eval("ir('campanha',{},{substituir:true}); render(); campPicker=0; render();");
  const host = d.getElementById('dmtroca-host');
  ok(!!host && host.querySelectorAll('.dm-card').length > 0, 'o seletor de troca abre com a grade do montador (host no viewport)');
  const c = host.querySelector('.dm-card[data-pick]'), k = c.dataset.pick;
  c.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  ok(w.eval('campSwap[0]') === k && w.eval('campPicker') === null && !d.getElementById('dmtroca-host') && w.eval("rotaAtual()") === 'campanha', 'tocar um deus grava campSwap[0] e volta ao ato (host removido)');
}

console.log('\n== §344 PvP — segmentado, fila, usar último, estados; ENTRAR chama o fluxo certo ==');
{ const { w, $, $$ } = sessao();
  // SEM SERVIDOR
  w.eval("contaTransporte=null; contaAtual=null; ir('pvp',{},{substituir:true}); render();");
  ok(!!$('.dm-aviso') && /servidor/i.test($('.dm-aviso').textContent), 'SEM SERVIDOR: mostra o aviso de como chegar ao servidor');
  // SEM CONTA
  w.eval("contaTransporte={}; contaAtual=null; ir('pvp',{},{substituir:true}); render();");
  ok(!!$('.dm-aviso') && /conta/i.test($('.dm-aviso').textContent), 'SEM CONTA: mostra o aviso de conta');
  // ONLINE + conta
  w.eval("contaTransporte={}; contaAtual={nick:'Herói', perfil, ranque:{pontos:42}}; pvpTime=[]; pvpEstado='idle'; pvpRanqueado=false; pvpMsg=''; ir('pvp',{},{substituir:true}); render();");
  ok($$('.dm-seg__b').length === 2 && /42/.test(($('.dm-pvp__ranque') || {}).textContent || ''), 'contexto: segmentado + ranque da conta (42)');
  // segmentado seleciona ranqueada
  $('[data-pvpmodo="1"]').dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  ok(w.eval('pvpRanqueado') === true && $('.dm-seg__b.is-on').textContent.indexOf('RANQUEADA') >= 0, 'escolher RANQUEADA marca o segmento');
  // escolhe 3 e ENTRAR → iniciarRanqueado
  const cs = $$('.dm-card[data-pick]'), a = cs[0].dataset.pick, b = cs[1].dataset.pick, c = cs[2].dataset.pick;
  w.eval("globalThis.__pvp=null; iniciarRanqueado=async()=>{__pvp='ranqueada';return{};}; iniciarPvP=async()=>{__pvp='amistosa';return{};};");
  [a, b, c].forEach(k => $(`.dm-card[data-pick="${k}"]`).dispatchEvent(new w.MouseEvent('click', { bubbles: true })));
  ok(!$('#bcomecar').disabled, 'com 3, ENTRAR NA FILA habilita');
  $('#bcomecar').dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  ok(w.eval('__pvp') === 'ranqueada', 'ENTRAR na RANQUEADA chama iniciarRanqueado');
  // NA FILA (pvpEntrar pôs em fila) → painel + sair
  ok(w.eval("pvpEstado") === 'fila' && !!$('#dmfila') && !!$('#pvpsair') && !!$('.dm-grade--travada'), 'NA FILA: painel "Procurando" + grade travada + Sair da fila');
  $('#pvpsair').dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  ok(w.eval("pvpEstado") === 'idle' && w.eval("rotaAtual()") === 'home', 'SAIR DA FILA reseta e volta à home');
  // amistosa
  w.eval("contaTransporte={}; contaAtual={nick:'Herói',perfil}; pvpTime=[]; pvpEstado='idle'; pvpRanqueado=false; pvpMsg=''; ir('pvp',{},{substituir:true}); render(); globalThis.__pvp=null; iniciarRanqueado=async()=>{__pvp='ranqueada';return{};}; iniciarPvP=async()=>{__pvp='amistosa';return{};};");
  const cs2 = $$('.dm-card[data-pick]');
  [cs2[0], cs2[1], cs2[2]].forEach(b2 => b2.dispatchEvent(new w.MouseEvent('click', { bubbles: true })));
  $('#bcomecar').dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  ok(w.eval('__pvp') === 'amistosa', 'ENTRAR na AMISTOSA chama iniciarPvP');
  // "Usar último time" remonta
  w.eval("pvpReset(); var ks=_montJogaveis().slice(0,3); pvpUltimoTime=ks.slice(); globalThis.__ult=ks.slice(); ir('pvp',{},{substituir:true}); render();");
  ok(!$('#pvpultimo').disabled, '"Usar último time" habilita quando há um time válido guardado');
  $('#pvpultimo').dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  ok(w.eval('JSON.stringify(pvpTime)') === w.eval('JSON.stringify(__ult)'), '"Usar último time" remonta o time guardado');
}

// ---------- Chromium: cada tela cabe/sem corte @1846 e @780 ----------
(async () => {
  let chromium; try { chromium = require('playwright').chromium; } catch (e) { console.log('  (playwright ausente)'); console.log(`\n== MONTAR_MODOS — ${passes} asserções, ${falhas} falha(s) ==`); process.exit(falhas ? 1 : 0); }
  function acha(){ try{ const b='/opt/pw-browsers'; const dd=fs.readdirSync(b).filter(x=>/^chromium-\d+$/.test(x)).sort().pop(); if(dd){ const p=path.join(b,dd,'chrome-linux','chrome'); if(fs.existsSync(p)) return p; } }catch(e){} return undefined; }
  const distAbs = path.resolve(__dirname, '..', 'dist', 'incursion.html');
  const browser = await chromium.launch({ executablePath: acha(), headless: true, args: ['--no-sandbox'] });
  const BASE = "perfil.deuses={}; ROSTER.slice(0,24).forEach(e=>perfil.deuses[e.key]={copias:1}); montFiltroElem=null;montFiltroFunc=null;montBusca='';montKitAberto=null;montDica=false;";
  const telas = [
    ['campanha', BASE + "campTimePick=[]; var e=campEncontros().find(x=>x.aliados==null)||campEncontros()[0]; ir('montartime',{id:e.id}); render();"],
    ['composicao', BASE + "desafioTimePick=[]; var ds=desafios()[0]; ir('desafiomontar',{id:ds.id}); render();"],
    ['pvp', BASE + "contaTransporte={}; contaAtual={nick:'Herói',perfil,ranque:{pontos:42}}; pvpTime=[]; pvpEstado='idle'; pvpRanqueado=false; ir('pvp',{},{substituir:true}); render();"],
  ];
  console.log('\n== §344 layout (Chromium) ==');
  for (const [nome, boot] of telas) {
    for (const [W, H, dsf] of [[1846, 852, 1], [780, 360, 2]]) {
      const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: dsf });
      const page = await ctx.newPage(); await page.goto('file://' + distAbs, { waitUntil: 'load' });
      await page.evaluate(boot); await page.waitForTimeout(140);
      const m = await page.evaluate(() => { const df = document.getElementById('dommontar'); if (!df) return { nodf: true }; const b = df.getBoundingClientRect();
        const fora = b.left < -0.5 || b.top < -0.5 || b.right > window.innerWidth + 0.5 || b.bottom > window.innerHeight + 0.5;
        let clips = []; df.querySelectorAll('.dm-card__n,.dm-card__f,.dm-vaga__n,.dm-titulo,.dm-sub,.dm-ctx__t,.dm-ini__n,.dm-seg__b').forEach(el => { if (el.scrollWidth > el.clientWidth + 1.5) clips.push(el.className); });
        return { fora, clips: clips.slice(0, 5), w: Math.round(b.width), h: Math.round(b.height) }; });
      ok(!m.nodf && !m.fora, `${nome} @${W}×${H}: a tela cabe (nada fora)`);
      ok(!m.nodf && m.clips.length === 0, `${nome} @${W}×${H}: nenhum texto corta (${m.clips && m.clips.length ? m.clips.join(',') : 'ok'})`);
      await ctx.close();
    }
  }
  // ---------- §344b-1: PvP — as 3 vagas cabem no bloco SEU TIME e nos 852px ----------
  console.log('\n== §344b PvP: 3 vagas cabem (Chromium) ==');
  for (const [W, H, dsf] of [[1846, 852, 1], [780, 360, 2]]) {
    const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: dsf });
    const page = await ctx.newPage(); await page.goto('file://' + distAbs, { waitUntil: 'load' });
    await page.evaluate(BASE + "contaTransporte={}; contaAtual={nick:'Herói',perfil,ranque:{pontos:1206}}; pvpTime=[]; pvpEstado='idle'; pvpRanqueado=false; ir('pvp',{},{substituir:true}); render(); (function(){var ks=_montFiltrados(_montJogaveis()); pvpTime.push(ks[0],ks[1],ks[2]); render();})();");
    await page.waitForTimeout(140);
    const m = await page.evaluate(() => { const dm = document.getElementById('dommontar'); const bloco = dm.querySelector('.dm-time'); const vagas = [...dm.querySelectorAll('.dm-vaga')];
      const dmr = dm.getBoundingClientRect(), rb = bloco.getBoundingClientRect(), last = vagas[vagas.length - 1].getBoundingClientRect(); const esc = dmr.width / 1846;
      return { n: vagas.length, dentroBloco: last.bottom <= rb.bottom + 0.5, dentro852: (last.bottom - dmr.top) / esc <= 852.5 }; });
    ok(m.n === 3 && m.dentroBloco && m.dentro852, `PvP @${W}×${H}: as 3 vagas cabem no bloco SEU TIME e nos 852px`);
    await ctx.close();
  }

  // ---------- §344b-2: Campanha — o painel de troca escurece a tela inteira, campanha inerte, X claro ----------
  console.log('\n== §344b Campanha: painel de troca (Chromium) ==');
  for (const [W, H, dsf] of [[1846, 852, 1], [780, 360, 2]]) {
    const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: dsf });
    const page = await ctx.newPage(); await page.goto('file://' + distAbs, { waitUntil: 'load' });
    await page.evaluate(BASE + "ir('campanha',{},{substituir:true}); render(); campPicker=0; render();");
    await page.waitForTimeout(140);
    const m = await page.evaluate(() => { const ov = document.querySelector('.dm-troca-ov'); if (!ov) return { no: true }; const r = ov.getBoundingClientRect();
      const cobre = r.left <= 0.5 && r.top <= 0.5 && r.right >= window.innerWidth - 0.5 && r.bottom >= window.innerHeight - 0.5;
      const x = document.querySelector('.dm-troca-x'); const el = document.elementFromPoint(window.innerWidth / 2, window.innerHeight / 2);
      const alpha = parseFloat((getComputedStyle(ov).backgroundColor.match(/[\d.]+\s*\)\s*$/) || ['1)'])[0]);
      return { cobre, temX: !!x, dim: alpha >= 0.7, inerte: ov.contains(el) }; });
    ok(!m.no && m.cobre && m.dim && m.inerte && m.temX, `troca @${W}×${H}: scrim escuro cobre o viewport + campanha inerte + X`);
    await ctx.close();
  }

  // ---------- §344c: no painel de troca a grade ocupa a largura toda + fundo opaco (campanha não aparece atrás) ----------
  console.log('\n== §344c Campanha: grade de troca em largura cheia + fundo opaco (Chromium) ==');
  for (const [W, H, dsf] of [[1846, 852, 1], [780, 360, 2]]) {
    const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: dsf });
    const page = await ctx.newPage(); await page.goto('file://' + distAbs, { waitUntil: 'load' });
    await page.evaluate(BASE + "ir('campanha',{},{substituir:true}); render(); campPicker=0; render();");
    await page.waitForTimeout(140);
    const m = await page.evaluate(() => { const dm = document.getElementById('dommontar'); const dir = dm.querySelector('.dm-dir');
      const dmr = dm.getBoundingClientRect(), d = dir.getBoundingClientRect(), esc = dmr.width / 1846;
      const left = (d.left - dmr.left) / esc, right = (d.right - dmr.left) / esc;
      const px = d.left + d.width * 0.25, py = d.top + d.height * 0.5;   // centro da metade esquerda do painel
      const el = document.elementFromPoint(px, py); const fundoPainel = dm.contains(el);
      return { left: Math.round(left), right: Math.round(right), fundoPainel }; });
    ok(m.left <= 70 && m.right >= 1777, `troca @${W}×${H}: grade em largura cheia (x ${m.left}→${m.right}, esperado ≤70 e ≥1777)`);
    ok(m.fundoPainel, `troca @${W}×${H}: o centro da metade esquerda é o fundo do painel (campanha não aparece atrás)`);
    await ctx.close();
  }

  // ---------- §344b-3: nenhum nome de inimigo parte palavra (todos os encontros e desafios) ----------
  console.log('\n== §344b nomes nunca quebram no meio da palavra (Chromium) ==');
  {
    const ctx = await browser.newContext({ viewport: { width: 1846, height: 852 }, deviceScaleFactor: 1 });
    const page = await ctx.newPage(); await page.goto('file://' + distAbs, { waitUntil: 'load' });
    await page.evaluate(BASE);
    const bad = await page.evaluate(() => {
      const ruins = [];
      const checa = () => { document.querySelectorAll('.dm-ini__n').forEach(n => { const cs = getComputedStyle(n);
        const quebraMeio = cs.wordBreak !== 'normal' || (cs.overflowWrap !== 'normal' && cs.overflowWrap !== 'initial');
        const cortaH = n.scrollWidth > n.clientWidth + 1 && cs.whiteSpace !== 'normal';
        const fontOk = parseFloat(cs.fontSize) >= 16;
        if (quebraMeio || cortaH || !fontOk) ruins.push(n.textContent + ' [' + cs.fontSize + ' wb=' + cs.wordBreak + ' ow=' + cs.overflowWrap + ' corta=' + cortaH + ']'); }); };
      try { (typeof campEncontros === 'function' ? campEncontros() : []).filter(e => e.aliados == null).forEach(e => { campTimePick = []; ir('montartime', { id: e.id }); render(); checa(); }); } catch (e) {}
      try { (typeof desafios === 'function' ? desafios() : []).forEach(d => { desafioTimePick = []; ir('desafiomontar', { id: d.id }); render(); checa(); }); } catch (e) {}
      return ruins.slice(0, 8);
    });
    ok(bad.length === 0, `nenhum nome de inimigo parte palavra / corta / < 16px (${bad.length ? bad.join(' | ') : 'ok'})`);
    await ctx.close();
  }

  // ---------- §345: a BATALHA CPU/hot-seat (seleção) cabe, sem corte, sem a coluna esquerda invadir a grade ----------
  console.log('\n== §345 seleção (Batalha CPU/hot-seat): layout (Chromium) ==');
  for (const [W, H, dsf] of [[1846, 852, 1], [780, 360, 2]]) {
    const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: dsf });
    const page = await ctx.newPage(); await page.goto('file://' + distAbs, { waitUntil: 'load' });
    await page.evaluate(BASE + "vsCPU=true; ir('selecao',{novo:true}); render(); (function(){var ks=listaFiltrada().filter(jogavel); vez=0; for(var i=0;i<6&&i<ks.length;i++)commitPk(ks[i]); renderPick();})();");
    await page.waitForTimeout(140);
    const m = await page.evaluate(() => { const dm = document.getElementById('dommontar'); if (!dm) return { no: 1 }; const b = dm.getBoundingClientRect();
      const fora = b.left < -0.5 || b.top < -0.5 || b.right > window.innerWidth + 0.5 || b.bottom > window.innerHeight + 0.5;
      let clips = []; dm.querySelectorAll('.dm-card__n,.dm-card__f,.sel-vaga__n,.sel-vaga__f,.dm-titulo,.dm-sub,.sel-time__t,.sel-seg__b,.dm-conta,.sel-info,.dm-motivo,.dmb--comecar').forEach(el => { if (el.scrollWidth > el.clientWidth + 1.5) clips.push(el.className); });
      const dir = dm.querySelector('.dm-dir').getBoundingClientRect(), times = dm.querySelector('.sel-times').getBoundingClientRect(), ops = dm.querySelector('.sel-ops').getBoundingClientRect();
      const overlapLR = times.right > dir.left + 0.5 || ops.right > dir.left + 0.5;
      return { fora, clips: clips.slice(0, 5), overlapLR }; });
    ok(!m.no && !m.fora, `seleção @${W}×${H}: a tela cabe (nada fora)`);
    ok(!m.no && m.clips.length === 0, `seleção @${W}×${H}: nenhum texto corta (${m.clips && m.clips.length ? m.clips.join(',') : 'ok'})`);
    ok(!m.no && !m.overlapLR, `seleção @${W}×${H}: a coluna esquerda (times/opções) não invade a grade`);
    await ctx.close();
  }

  await browser.close();
  console.log(`\n== MONTAR_MODOS — ${passes} asserções, ${falhas} falha(s) ==`);
  process.exit(falhas ? 1 : 0);
})();
