// §349 — A TELA DE PROVAÇÕES (renderMissoes, rota 'provacoes') no modelo do dono: TELA FIXA 1846×852 escalada,
// painel esquerdo (ATIVA ou PRÉVIA) + área direita "DEUSES PARA DESBLOQUEAR" (pílulas + busca + grade de cartões
// do montador, agrupada por faixa). Regras das Provações (§313/§314/§316) intactas. Prova os estados do cartão, a
// prévia, a ativação/confirmação, os filtros/busca, o espiar, o elo com a ficha, e o encaixe no Chromium (os filhos
// dentro da tela, nada se sobrepõe, nada corta).
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
function MISSOES2(k) { return w.eval(`MISSOES.missoes[${JSON.stringify(k)}]`); }
w.eval("window.ativarProvacaoServidor = async () => ({ ok: true });");   // stub do servidor (jsdom)

const P = "atena:{ativadaEm:0,obj:[{seq:1},{vol:5},{vol:3}]},hercules:{ativadaEm:0,obj:[{seq:1},{vol:2}]}";
const C_RICO = `contaAtual={nick:'T',ranque:{pontos:60,faixa:{chave:'suplicante',nome:'Suplicante'}},perfil:{deuses:{cerberus:{copias:1}}},missoes:{ativa:'atena',progresso:{${P}},liberados:['cerberus']}};provPrevia=null;provTrocaConfirm=null;provPendente=null;provFiltro='todas';provBusca='';faixasEspiadas.clear();ir('provacoes',{},{substituir:true});render();`;
const C_VAZIO = `contaAtual={nick:'T',ranque:{pontos:60,faixa:{chave:'suplicante',nome:'Suplicante'}},perfil:{deuses:{}},missoes:{ativa:null,progresso:{},liberados:[]}};provPrevia=null;provTrocaConfirm=null;provPendente=null;provFiltro='todas';provBusca='';faixasEspiadas.clear();ir('provacoes',{},{substituir:true});render();`;
const C_MAX = `contaAtual={nick:'T',ranque:{pontos:5000,faixa:{chave:'semideus',nome:'Semideus'}},perfil:{deuses:{}},missoes:{ativa:null,progresso:{},liberados:[]}};provPrevia=null;provTrocaConfirm=null;provPendente=null;provFiltro='todas';provBusca='';faixasEspiadas.clear();ir('provacoes',{},{substituir:true});render();`;

console.log('== §349 / TELA DE PROVAÇÕES (tela fixa: painel + grade do montador) ==');
ok(w.eval("typeof MISSOES==='object' && Object.keys(MISSOES.missoes).length===91"), 'as 91 Provações estão no cliente');
ok(w.eval("MISSOES.slotsGratis===1"), 'slotsGratis=1 vem do dado');

// ---- 1. OFFLINE ----
console.log('\n== 1. offline: honesto + catálogo das histórias ==');
err = null; w.eval("contaAtual=null; ir('provacoes',{},{substituir:true}); render();");
ok(!err, 'renderiza offline sem quebrar');
ok(/conecte/i.test(txt($('.moff__msg'))) && /pvp/i.test(txt($('.moff__msg'))), 'diz honestamente: contam no PvP, conecte');
ok($$('.mcat').length === 91, 'as 91 histórias ficam legíveis offline');
ok($$('.pa, .pvc').length === 0, 'offline NÃO desenha painel nem cartões da grade');

// ---- 2. CABEÇALHO + RANQUE ----
console.log('\n== 2. cabeçalho: título + ranque (faixa + barra até a próxima) ==');
err = null; w.eval(C_RICO);
ok(!err, 'renderiza online sem quebrar');
ok(/PROVAÇ/i.test(txt($('.pv2-titulo'))), 'título "PROVAÇÕES"');
ok(!!$('.rq__helm') && /Suplicante/.test(txt($('.rq__f'))), 'ranque: elmo + faixa atual (Suplicante)');
ok(!!$('.rq__bar>i') && /60\/100 até Devoto/i.test(txt($('.rq__t'))), 'barra fina "60/100 até Devoto" (do dado)');
w.eval(C_MAX);
ok(!$('.rq__bar') && /faixa máxima/i.test(txt($('.rq__max'))), 'no Semideus: sem barra, "faixa máxima"');
w.eval(C_RICO);

// ---- 3. DUAS COLUNAS ----
console.log('\n== 3. painel esquerdo + grade direita ==');
ok(!!$('.pv2-esq .pa') && !!$('.pv2-dir #provgrade'), 'painel na esquerda, grade na direita');

// ---- 4. PAINEL PROVAÇÃO ATIVA ----
console.log('\n== 4. painel ATIVA: retrato + nome + selo + panteão/ranque + motivo + objetivos + Trocar + vagas ==');
{
  const pa = $('.pa');
  ok(/provaç.*ativa/i.test(txt($('.pa__rot'))), 'rótulo "Provação ativa"');
  ok(!!pa.querySelector('.pa__med .slot') && /ATENA/i.test(txt(pa.querySelector('.pa__nome'))), 'retrato + nome (Atena)');
  ok(/S/.test(txt(pa.querySelector('.pa__nome .selo'))), 'selo de raridade no nome');
  ok(/Grega · ranque Suplicante/i.test(txt(pa.querySelector('.pa__sub'))), 'panteão · ranque (do dado)');
  ok(txt(pa.querySelector('.pa__motivo')) === MISSOES2('atena').motivo, 'motivo vem do DADO');
  ok(pa.querySelectorAll('.pa__objs .ob').length === MISSOES2('atena').objetivos.length, `${MISSOES2('atena').objetivos.length} linhas de objetivo`);
  ok(pa.querySelectorAll('.pa__objs .ob__ck').length === 3, 'cada objetivo tem a marcação (checkbox)');
  // um objetivo cumprido → a marcação fica verde (is-on)
  w.eval("contaAtual.missoes.progresso.atena.obj[0]={seq:99,vol:99,seqA:99,seqB:99,pant:['Grega','Nórdica','Egípcia','Japonesa','Chinesa','Hindu'],n:99,k:99}; render();");
  ok(!!$('.pa__objs .ob--done .ob__ck.is-on'), 'objetivo cumprido fica marcado (verde)');
  w.eval(C_RICO);
  ok(!!pa.querySelector('#btrocar') && /Trocar Provação/i.test(txt(pa.querySelector('#btrocar'))), 'rodapé: "Trocar Provação"');
  ok(/1 vaga ativa · mais vagas na Loja/i.test(txt(pa.querySelector('.pa__slot'))), 'rodapé: "1 vaga ativa · mais vagas na Loja"');
}

// ---- 5. PAINEL VAZIO ----
console.log('\n== 5. painel vazio ==');
w.eval(C_VAZIO);
ok(!!$('.pa--vazio') && /nenhuma provaç/i.test(txt($('.pa--vazio'))) && /escolha uma na lista/i.test(txt($('.pa--vazio'))), 'sem ativa: "Nenhuma Provação ativa — escolha uma na lista"');
w.eval(C_RICO);

// ---- 6. GRADE: pílulas + busca + contagens ----
console.log('\n== 6. filtros (pílulas) + busca + "X de Y conquistados" ==');
{
  const c = w.eval("JSON.stringify(_provContagens())"); const C = JSON.parse(c);
  const pill = f => $(`[data-filtro="${f}"]`);
  ok(new RegExp('Todas\\s*' + C.todas).test(txt(pill('todas'))), `pílula Todas = ${C.todas} (real)`);
  ok(new RegExp('Dispon.*' + C.disponiveis).test(txt(pill('disponiveis'))), `pílula Disponíveis = ${C.disponiveis}`);
  ok(new RegExp('Pausadas\\s*' + C.pausadas).test(txt(pill('pausadas'))), `pílula Pausadas = ${C.pausadas}`);
  ok(new RegExp('Conquistadas\\s*' + C.conquistadas).test(txt(pill('conquistadas'))), `pílula Conquistadas = ${C.conquistadas}`);
  ok(new RegExp(C.conquistadas + ' de ' + C.total + ' conquistados').test(txt($('.pv2-conta'))), `"${C.conquistadas} de ${C.total} conquistados"`);
  // filtrar por Conquistadas → só cartões conquistados
  w.eval("provFiltro='conquistadas'; render();");
  ok($$('.pvc').length === C.conquistadas && $$('.pvc--conquistada').length === C.conquistadas, 'filtro "Conquistadas" mostra só os conquistados');
  // busca por nome (ignora acento): "atena"
  w.eval("provFiltro='todas'; provBusca='atena'; render();");
  ok($$('.pvc[data-deus]').length === 1 && $('.pvc[data-deus="atena"]'), 'busca "atena" reduz a 1 cartão');
  w.eval("provBusca='ATENA'; render();");
  ok($$('.pvc[data-deus="atena"]').length === 1, 'busca é insensível a maiúsculas/acentos');
  w.eval("provBusca=''; provFiltro='todas'; render();");
}

// ---- 7. os 5 ESTADOS do cartão (com o nome visível) ----
console.log('\n== 7. cartões: disponivel · pausada · ativa · conquistada · travada (nome sempre visível) ==');
{
  const nomeVis = sel => { const el = $(sel + ' .pvc__n'); return el && txt(el).length > 0; };
  ok(!!$('.pvc--disponivel [data-ativar]') && nomeVis('.pvc--disponivel'), 'DISPONÍVEL: botão ATIVAR + nome visível');
  ok(!!$('.pvc--pausada .pvc__pausa') && !!$('.pvc--pausada [data-ativar]') && nomeVis('.pvc--pausada'), 'PAUSADA: selo "Pausada · %" + RETOMAR + nome');
  ok(/RETOMAR/i.test(txt($('.pvc--pausada [data-ativar]'))), 'PAUSADA: o botão é RETOMAR');
  ok(!!$('.pvc--ativa .pvc__flag--ativa') && nomeVis('.pvc--ativa'), 'ATIVA: moldura + selo "Ativa" + nome');
  ok(!!$('.pvc--conquistada .pvc__flag--conq') && /Conquistado/i.test(txt($('.pvc--conquistada'))) && nomeVis('.pvc--conquistada'), 'CONQUISTADA: "✓ Conquistado" (sem botão)');
  ok(!$('.pvc--conquistada [data-ativar]') && !$('.pvc--ativa [data-ativar]'), 'ATIVA e CONQUISTADA não têm botão de ação');
  // TRAVADA: espiar uma faixa acima
  const cur = w.eval("faixaAtualIdx()");
  w.eval(`(function(){ var c=faixaAtualIdx(); (MISSOES.faixas||[]).forEach(function(f,fi){ if(fi>c) faixasEspiadas.add(fi); }); render(); })();`);
  ok(!!$('.pvc--travada .pvc__lock') && !!$('.pvc--travada .pvc__rank') && nomeVis('.pvc--travada'), 'TRAVADA: cadeado + "Ranque <faixa>" + nome visível, sem botão');
  ok(!$('.pvc--travada [data-ativar]'), 'TRAVADA não tem botão');
  w.eval("faixasEspiadas.clear(); render();");
}

// ---- 8. FAIXA acima recolhida + espiar ----
console.log('\n== 8. faixa acima recolhida ("faltam X") · tocar espia ==');
{
  const fech = $('.pv2-fx--fechada');
  ok(!!fech && /faltam \d+ pontos/i.test(txt(fech)), 'faixa ACIMA fechada com "(faltam X pontos)"');
  const fi = fech.dataset.fxespiar; const antes = $$('.pvc').length;
  w.eval(`[...document.querySelectorAll('[data-fxespiar]')].find(b=>b.dataset.fxespiar===${JSON.stringify(fi)}).click();`);
  ok($$('.pvc').length > antes, 'TOCAR na faixa fechada a abre para espiar (mais cartões aparecem)');
  w.eval("faixasEspiadas.clear(); render();");
}

// ---- 9. PRÉVIA: tocar num cartão → painel mostra aquela Provação; "Voltar à ativa" volta ----
console.log('\n== 9. prévia: tocar no cartão abre a prévia; "Voltar à ativa" volta ==');
{
  const card = $('.pvc--disponivel [data-carta]'); const k = card.dataset.carta;
  w.eval(`[...document.querySelectorAll('[data-carta]')].find(b=>b.dataset.carta===${JSON.stringify(k)}).click();`);
  ok(/Prévia/i.test(txt($('.pa__rot'))), 'o painel vira PRÉVIA');
  ok($('.pa[data-deus]').dataset.deus === k, 'a prévia é do deus tocado');
  ok($$('.pa__objs .ob').length === MISSOES2(k).objetivos.length, 'a prévia mostra os objetivos daquela Provação');
  ok(!!$('[data-voltarativa]'), 'há "‹ Voltar à ativa"');
  w.eval("document.querySelector('[data-voltarativa]').click();");
  ok(/provaç.*ativa/i.test(txt($('.pa__rot'))) && $('.pa[data-deus]').dataset.deus === 'atena', '"Voltar à ativa" volta para a ATIVA (Atena)');
}

// ---- 10. ATIVAR: sem outra ativa → direto; com outra ativa → confirmação; SIM/NÃO ----
console.log('\n== 10. ativar/confirmar/cancelar ==');
{
  // sem outra ativa (C_VAZIO): ATIVAR não abre confirmação
  w.eval(C_VAZIO);
  const disp = $('.pvc--disponivel [data-ativar]');
  ok(disp.dataset.troca === '0', 'sem ativa: o ATIVAR não é marcado como troca');
  w.eval(`document.querySelector('.pvc--disponivel [data-ativar]').click();`);
  ok(!$('.pa__conf'), 'sem outra ativa: ATIVAR não abre confirmação (ativa direto)');
  // com outra ativa (C_RICO): ATIVAR abre a confirmação no painel
  w.eval(C_RICO);
  const btn = $('.pvc--disponivel [data-ativar][data-troca="1"]'); const k = btn.dataset.ativar;
  ok(!!btn, 'com ativa: o ATIVAR é marcado como troca');
  w.eval(`[...document.querySelectorAll('[data-ativar]')].find(b=>b.dataset.ativar===${JSON.stringify(k)}).click();`);
  const conf = $('.pa__conf');
  ok(!!conf && /fica pausado/i.test(txt(conf)) && !!conf.querySelector('[data-troca-ok]') && !!conf.querySelector('[data-troca-no]'), 'confirmação no painel: "…fica pausado" + SIM/NÃO');
  w.eval("document.querySelector('[data-troca-no]').click();");
  ok(!$('.pa__conf'), 'NÃO cancela (nada enviado)');
  // SIM chama a ativação (provPendente durante o voo)
  w.eval(`[...document.querySelectorAll('[data-ativar]')].find(b=>b.dataset.ativar===${JSON.stringify(k)}).click();`);
  w.eval("document.querySelector('[data-troca-ok]').click();");
  ok(w.eval(`!document.querySelector('.pa__conf')`), 'SIM fecha a confirmação (envia a troca)');
  w.eval(C_RICO);
}

// ---- 11. RETOMAR (pausada) ----
console.log('\n== 11. retomar uma pausada ==');
{
  const btn = $('.pvc--pausada [data-ativar]');
  ok(!!btn && /RETOMAR/i.test(txt(btn)), 'a pausada (Hércules) tem RETOMAR');
}

// ---- 12. ELO com a ficha do deus (retrato do painel) + "Trocar Provação" ----
console.log('\n== 12. elo com o deus + "Trocar Provação" ==');
{
  w.eval(C_RICO);
  w.eval("document.querySelector('.pa__med[data-abrir]').click();");
  ok(w.eval("rotaAtual()==='deus'"), 'o retrato do painel leva à ficha do deus');
  w.eval(C_RICO);
  w.eval("document.querySelector('#btrocar').click();");
  ok(/Prévia/i.test(txt($('.pa__rot'))) && !!$('.pa[data-deus]'), '"Trocar Provação" abre a prévia de uma disponível');
}

// ---- 13. GRAMÁTICA da lista de nomes (mantida) ----
console.log('\n== 13. gramática da lista de nomes ==');
ok(w.eval("_obTexto({tipo:'v',lista:['zeus','ogum','tyr'],n:8},false)") === '8 vitórias com <b>Zeus</b>, <b>Ogum</b> ou <b>Tyr</b>', 'três nomes: "Zeus, Ogum ou Tyr"');
ok(w.eval("_obTexto({tipo:'v',lista:['zeus','brigid'],n:8},false)") === '8 vitórias com <b>Zeus</b> ou <b>Brigid</b>', 'dois nomes: "Zeus ou Brigid"');

if (falhas) { console.log(`\n== ${passes} ok, ${falhas} FALHAS (jsdom) ==`); process.exit(1); }
console.log(`\n== jsdom OK (${passes}) — agora o ENCAIXE no Chromium (1846×852 e 780×360) ==`);

// ================= §349/§348b — ENCAIXE: enche a tela, colunas dentro (≤830), sem sobrepor, nada corta =================
(async () => {
  const { chromium } = require('playwright');
  function acharChromium() { try { const base = '/opt/pw-browsers'; const dir = fs.readdirSync(base).filter(x => /^chromium-\d+$/.test(x)).sort().pop(); const bin = path.join(base, dir, 'chrome-linux', 'chrome'); if (fs.existsSync(bin)) return bin; } catch (e) {} return undefined; }
  const distAbs = 'file://' + path.resolve(__dirname, '..', 'dist', 'incursion.html');
  const RICO = C_RICO;
  const browser = await chromium.launch({ executablePath: acharChromium(), headless: true });
  let cf = 0; const ok2 = (c, m) => { if (!c) { cf++; console.log('  XX ' + m); } else console.log('  ok ' + m); };
  for (const [W, H] of [[1846, 852], [780, 360]]) {
    const page = await (await browser.newContext({ viewport: { width: W, height: H } })).newPage();
    await page.goto(distAbs, { waitUntil: 'load' });
    const r = await page.evaluate((RICO) => {
      eval(RICO); const g = document.getElementById('gsplash'); if (g) g.remove();
      const fix = document.getElementById('provfix'), fb = fix.getBoundingClientRect();
      const esc = fb.height / 852;
      const pw = fb.width / innerWidth, ph = fb.height / innerHeight;
      const designBot = el => Math.round((el.getBoundingClientRect().bottom - fb.top) / esc);
      // fundo (y de design) das CAIXAS de coluna (a grade rola por dentro, não conta)
      let botMax = 0, pior = '';
      ['.pa', '.pv2-dir', '.pv2-esq', '.pv2-cab', '.pv2-filtros'].forEach(s => { const el = fix.querySelector(s); if (el) { const b = designBot(el); if (b > botMax) { botMax = b; pior = s; } } });
      // sobreposição painel × direita
      const pa = fix.querySelector('.pv2-esq').getBoundingClientRect(), dir = fix.querySelector('.pv2-dir').getBoundingClientRect();
      const overlap = pa.right > dir.left + 1;
      // overflow horizontal da grade
      const grade = fix.querySelector('.pv2-grade'); const over = grade.scrollWidth - grade.clientWidth;
      // texto cortado nos títulos/nomes
      let clips = [];
      fix.querySelectorAll('.pv2-titulo,.pa__nome,.pa__sub,.pa__slot,.pv2-dir__t,.pv2-conta,.pvc__n,.pv2-fx__n,.ob__t').forEach(el => { if (el.scrollWidth > el.clientWidth + 1.5) clips.push(el.className.split(' ')[0]); });
      return { pw, ph, botMax, pior, overlap, over, clips: [...new Set(clips)].slice(0, 6) };
    }, RICO);
    ok2(Math.min(r.pw, r.ph) >= 0.98, `§349 @${W}×${H}: enche a tela (${(r.pw * 100).toFixed(1)}%×${(r.ph * 100).toFixed(1)}%)`);
    ok2(r.botMax <= 830, `§349 @${W}×${H}: as colunas terminam em y≤830 (pior ${r.botMax} em ${r.pior})`);
    ok2(!r.overlap, `§349 @${W}×${H}: painel e grade não se sobrepõem`);
    ok2(r.over <= 2, `§349 @${W}×${H}: a grade não rola na horizontal (over ${r.over}; absorvido pelo padding de 8px, overflow-x:hidden)`);
    ok2(r.clips.length === 0, `§349 @${W}×${H}: nenhum texto corta (${r.clips.join(',') || 'ok'})`);
    await page.close();
  }
  await browser.close();
  if (cf) { console.log(`\n== ${cf} FALHA(S) de encaixe (Chromium) ==`); process.exit(1); }
  console.log('\n== TELA DE PROVAÇÕES §349 OK (jsdom + Chromium) ==');
  process.exit(0);
})().catch(e => { console.error(e.message || e); process.exit(1); });
