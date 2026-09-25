// §316 — A TELA DE PROVAÇÕES (paisagem, ref. do dono): barra superior (‹ Início · PROVAÇÕES · ranque),
// COLUNA ESQUERDA FIXA = painel PROVAÇÃO ATIVA (único com moldura acesa), COLUNA DIREITA rolável = lista
// agrupada por faixa com 5 estados (ativa/pausada/disponivel/travada/conquistada) e ACORDEÃO de requisitos.
// Regras (§313/§314) intactas. GUARDAS §295/§307/§308: estados × 4 larguras; painel nunca rola; lista
// nunca rola na horizontal; nada cortado (nem por reticência em silêncio — medido por clone solto).
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

// mock RICO: rank 60 (Suplicante), atena ATIVA (3 obj), cerberus CONQUISTADA, hercules PAUSADA; o resto da
// Suplicante fica disponível/travada; as faixas acima ficam fechadas ("faltam X pontos").
const P = "atena:{ativadaEm:0,obj:[{seq:1},{vol:5},{vol:3}]},hercules:{ativadaEm:0,obj:[{seq:1},{vol:2}]}";
const C_RICO = `contaAtual={nick:'T',ranque:{pontos:60,faixa:{chave:'suplicante',nome:'Suplicante'}},perfil:{deuses:{cerberus:{copias:1}}},missoes:{ativa:'atena',progresso:{${P}},liberados:['cerberus']}};ir('provacoes',{},{substituir:true});render();`;
const C_VAZIO = `contaAtual={nick:'T',ranque:{pontos:60,faixa:{chave:'suplicante',nome:'Suplicante'}},perfil:{deuses:{}},missoes:{ativa:null,progresso:{},liberados:[]}};ir('provacoes',{},{substituir:true});render();`;
const C_MAX = `contaAtual={nick:'T',ranque:{pontos:5000,faixa:{chave:'semideus',nome:'Semideus'}},perfil:{deuses:{}},missoes:{ativa:null,progresso:{},liberados:[]}};ir('provacoes',{},{substituir:true});render();`;

console.log('== §316 / TELA DE PROVAÇÕES (paisagem: painel fixo + lista rolável) ==');
ok(w.eval("typeof MISSOES==='object' && Object.keys(MISSOES.missoes).length===91"), 'as 91 Provações estão no cliente');
ok(w.eval("MISSOES.slotsGratis===1"), 'slotsGratis=1 vem do dado');

// ---- 1. OFFLINE ----
console.log('\n== 1. offline: honesto + histórias ==');
err = null; w.eval("contaAtual=null; ir('provacoes',{},{substituir:true}); render();");
ok(!err, 'renderiza offline sem quebrar');
ok(/conecte/i.test(txt($('.moff__msg'))) && /pvp/i.test(txt($('.moff__msg'))), 'diz honestamente: contam no PvP, conecte');
ok($$('.mcat').length === 91, 'as 91 histórias ficam legíveis offline');
ok($$('.pa, .lr').length === 0, 'offline NÃO desenha painel nem linhas');

// ---- 2. BARRA SUPERIOR + RANQUE ----
console.log('\n== 2. barra superior: título + ranque (faixa + barra até a próxima) ==');
err = null; w.eval(C_RICO);
ok(!err, 'renderiza online sem quebrar');
ok(/Provaç/i.test(txt($('.pv__titulo'))), 'título "Provações" no centro');
ok(!!$('.rq__helm') && /Suplicante/.test(txt($('.rq__f'))), 'ranque: elmo + faixa atual (Suplicante)');
ok(!!$('.rq__bar>i') && /60\/100 até Devoto/i.test(txt($('.rq__t'))), 'barra fina "60/100 até Devoto" (lida do dado, sem literal)');
w.eval(C_MAX);
ok(!$('.rq__bar') && /faixa máxima/i.test(txt($('.rq__max'))), 'no Semideus: sem barra, "faixa máxima"');
w.eval(C_RICO);

// ---- 3. DUAS COLUNAS ----
console.log('\n== 3. coluna esquerda fixa (painel) + direita rolável (lista) ==');
ok(!!$('.pv__esq .pa') && !!$('.pv__dir'), 'painel na esquerda, lista na direita');

// ---- 4. PAINEL PROVAÇÃO ATIVA ----
console.log('\n== 4. painel: medalhão + nome + selo + panteão/ranque + motivo + objetivos + TROCAR + slot ==');
{
  const pa = $('.pa');
  ok(/provaç.*ativa/i.test(txt($('.pa__rot'))), 'rótulo "Provação ativa"');
  ok(!!pa.querySelector('.pa__med .slot') && /ATENA/i.test(txt(pa.querySelector('.pa__nome'))), 'medalhão + nome (Atena)');
  ok(/S/.test(txt(pa.querySelector('.pa__nome .selo'))), 'selo de raridade no nome');
  ok(/Grega · ranque Suplicante/i.test(txt(pa.querySelector('.pa__sub'))), 'panteão · ranque (do dado)');
  ok(txt(pa.querySelector('.pa__motivo')) === MISSOES2('atena').motivo, 'motivo vem do DADO');
  ok(pa.querySelectorAll('.pa__objs .ob').length === MISSOES2('atena').objetivos.length, `${MISSOES2('atena').objetivos.length} linhas de objetivo`);
  ok(pa.querySelectorAll('.pa__objs .obic').length === 3, 'cada objetivo tem ícone por tipo');
  ok(/8 vitórias com/i.test(txt(pa)) && /Zeus/.test(txt(pa)) && /Ganesha/.test(txt(pa)), 'objetivo "v" lista os nomes (Zeus ou Ganesha)');
  ok(/qualquer grego/i.test(txt(pa)), 'objetivo "p" diz "qualquer grego" (adjetivo singular)');
  ok(!!pa.querySelector('.dots .dot') && !!pa.querySelector('.obar'), 'widgets: pontos (s) + barra (v/p)');
  ok(!!pa.querySelector('#btrocar') && /1 slot/i.test(txt(pa.querySelector('.pa__slot'))), 'rodapé: TROCAR + "1 slot"');
}

// ---- 5. PAINEL VAZIO ----
console.log('\n== 5. painel vazio ==');
w.eval(C_VAZIO);
ok(!!$('.pa--vazio') && /nenhuma provaç/i.test(txt($('.pa--vazio'))) && /escolha uma na lista/i.test(txt($('.pa--vazio'))), 'sem ativa: "Nenhuma Provação ativa — escolha uma na lista"');
w.eval(C_RICO);

// ---- 6. LISTA agrupada por faixa (aberta + fechada) ----
console.log('\n== 6. lista por faixa: atual aberta · acima fechada ("faltam X") · tocar espia ==');
ok($$('.fx').some(f => /SUPLICANTE/i.test(txt(f))), 'cabeçalho da faixa atual (SUPLICANTE)');
{
  const fech = $('.fx--fechada');
  ok(!!fech && /faltam \d+ pontos/i.test(txt(fech)), 'faixa ACIMA fechada com "· faltam X pontos"');
  const fi = fech.dataset.fxespiar;
  const antes = $$('.lr').length;
  w.eval(`[...document.querySelectorAll('[data-fxespiar]')].find(b=>b.dataset.fxespiar===${JSON.stringify(fi)}).click();`);
  ok($$('.lr').length > antes, 'TOCAR na faixa fechada abre para espiar (mais linhas aparecem)');
}

// ---- 7. os 5 ESTADOS ----
console.log('\n== 7. §295 — ativa · pausada · disponivel · travada · conquistada ==');
ok($$('.lr--ativa').length >= 1 && /ativa/i.test(txt($('.lr--ativa .lr__st'))) && !$('.lr--ativa .lr__seta'), 'ATIVA: destacada, "ativa", SEM seta');
ok($$('.lr--pausada').length >= 1 && /pausada · \d+%/i.test(txt($('.lr--pausada'))) && !!$('.lr--pausada [data-ativar]') && !!$('.lr--pausada .lr__seta'), 'PAUSADA: "pausada · %" + Retomar + seta');
ok($$('.lr--disponivel').length >= 1 && !!$('.lr--disponivel [data-ativar]') && !!$('.lr--disponivel .lr__seta'), 'DISPONÍVEL: botão Ativar + seta');
ok($$('.lr--travada').length >= 1 && /travada/i.test(txt($('.lr--travada .lr__st'))) && !!$('.lr--travada .lr__cad') && !!$('.lr--travada .lr__seta'), 'TRAVADA: cadeado + "travada" + seta');
ok($$('.lr--conquistada').length >= 1 && /conquistada/i.test(txt($('.lr--conquistada .lr__st'))) && !$('.lr--conquistada .lr__seta'), 'CONQUISTADA: "conquistada", SEM seta');
ok(!!$('.lr--disponivel .b--primary') && !$('.lr--pausada .lr__acao .b--primary'), 'ATIVAR é o único botão CHEIO (Retomar é de contorno)');

// ---- 8. ACORDEÃO (requisitos antes de ativar) ----
console.log('\n== 8. acordeão: tocar expande os requisitos (só uma aberta); Ativar NÃO expande ==');
{
  const disp = $('.lr--disponivel .lr__tap[data-linha]'); const kd = disp.dataset.linha;
  w.eval(`[...document.querySelectorAll('.lr__tap[data-linha]')].find(b=>b.dataset.linha===${JSON.stringify(kd)}).click();`);
  ok($$('.lr__exp').length === 1 && !!$(`.lr[data-deus="${kd}"] .lr__exp`), 'DISPONÍVEL expande: motivo + objetivos com a META (sem barra)');
  ok(!!$(`.lr[data-deus="${kd}"] .exp__motivo`) && !!$(`.lr[data-deus="${kd}"] .ob__meta`), 'a expansão disponível mostra META à direita');
  // expandir outra fecha a primeira (só uma por vez)
  const trav = $('.lr--travada .lr__tap[data-linha]'); const kt = trav.dataset.linha;
  w.eval(`[...document.querySelectorAll('.lr__tap[data-linha]')].find(b=>b.dataset.linha===${JSON.stringify(kt)}).click();`);
  ok($$('.lr__exp').length === 1 && !!$(`.lr[data-deus="${kt}"] .lr__exp`), 'acordeão: só UMA linha aberta por vez');
  const t = txt($(`.lr[data-deus="${kt}"] .lr__exp`));
  ok(/você ainda não tem|Requer ranque|você precisa de um destes/i.test(t), 'TRAVADA expandida diz o que falta (nome/ranque/um-destes)');
  // fecha
  w.eval(`[...document.querySelectorAll('.lr__tap[data-linha]')].find(b=>b.dataset.linha===${JSON.stringify(kt)}).click();`);
  ok($$('.lr__exp').length === 0, 'tocar de novo fecha a expansão');
}

// ---- 9. CONFIRMAÇÃO de troca (com outra ativa) ----
console.log('\n== 9. confirmação inline de troca ==');
{
  const btn = $('.lr--disponivel [data-ativar][data-troca="1"]');
  ok(!!btn, 'Ativar de um disponível está marcado como TROCA (há outra ativa)');
  const k = btn.dataset.ativar;
  w.eval(`[...document.querySelectorAll('[data-ativar]')].find(b=>b.dataset.ativar===${JSON.stringify(k)}).click();`);
  const conf = $('.lr__conf');
  ok(!!conf && /fica pausada/i.test(txt(conf)) && !!conf.querySelector('[data-troca-ok]') && !!conf.querySelector('[data-troca-no]'), 'confirmação: "…fica pausada" + Confirmar/Cancelar');
  w.eval("document.querySelector('[data-troca-no]').click();");
  ok(!$('.lr__conf'), 'Cancelar fecha (nada enviado)');
}

// ---- 10. ELO com o detalhe do deus (medalhão do painel) ----
console.log('\n== 10. elo com o deus (medalhão do painel) ==');
{
  w.eval(C_RICO);
  w.eval("document.querySelector('.pa__med[data-abrir]').click();");
  ok(w.eval("rotaAtual()==='deus'"), 'o medalhão do painel leva ao detalhe do deus');
}

// ---- 11. ALVOS DE TOQUE (§234/§301) ----
console.log('\n== 11. toque: linha e botões acima do piso ==');
w.eval(C_RICO);
ok(parseFloat(w.getComputedStyle($('.lr__tap')).minHeight) >= 44, `a linha tem alvo de toque ≥44px de design (${w.getComputedStyle($('.lr__tap')).minHeight})`);
ok($$('.lr__acao .b, .pa__foot .b').every(b => parseFloat(w.getComputedStyle(b).minHeight) >= 36), 'os botões (Ativar/Retomar/Trocar) ≥36px de design');

if (falhas) { console.log(`\n== ${passes} ok, ${falhas} FALHAS (jsdom) ==`); process.exit(1); }
console.log(`\n== jsdom OK (${passes}) — agora a varredura de LARGURA no Chromium ==`);

// ================= §316/§307/§308 — LARGURA 780/893/1075/1200: painel nunca rola, lista nunca rola na horizontal, nada cortado =================
(async () => {
  const { chromium } = require('playwright');
  function acharChromium() { try { const base = '/opt/pw-browsers'; const dir = fs.readdirSync(base).filter(x => /^chromium-\d+$/.test(x)).sort().pop(); const bin = path.join(base, dir, 'chrome-linux', 'chrome'); if (fs.existsSync(bin)) return bin; } catch (e) {} return undefined; }
  const distAbs = 'file://' + path.resolve(__dirname, '..', 'dist', 'incursion.html');
  // mocks: painel com 4/3/2 objetivos, painel vazio; e um mock RANK MÁXIMO (todos os nomes/estados na lista).
  const M4 = `contaAtual={nick:'T',ranque:{pontos:5000,faixa:{chave:'semideus',nome:'Semideus'}},perfil:{deuses:{}},missoes:{ativa:'oxala',progresso:{oxala:{ativadaEm:0,obj:[{seq:1},{vol:2},{vol:0},{vol:3}]}},liberados:[]}};ir('provacoes',{},{substituir:true});render();`;
  const M3 = `contaAtual={nick:'T',ranque:{pontos:5000,faixa:{chave:'semideus',nome:'Semideus'}},perfil:{deuses:{}},missoes:{ativa:'huangdi',progresso:{huangdi:{ativadaEm:0,obj:[{seq:1},{vol:2},{vol:1}]}},liberados:[]}};ir('provacoes',{},{substituir:true});render();`;
  const M2 = `contaAtual={nick:'T',ranque:{pontos:5000,faixa:{chave:'semideus',nome:'Semideus'}},perfil:{deuses:{}},missoes:{ativa:'aquiles',progresso:{aquiles:{ativadaEm:0,obj:[{seq:1},{vol:1}]}},liberados:[]}};ir('provacoes',{},{substituir:true});render();`;
  const MV = `contaAtual={nick:'T',ranque:{pontos:5000,faixa:{chave:'semideus',nome:'Semideus'}},perfil:{deuses:{}},missoes:{ativa:null,progresso:{},liberados:[]}};ir('provacoes',{},{substituir:true});render();`;
  const casos = { 'painel 4 obj': M4, 'painel 3 obj': M3, 'painel 2 obj': M2, 'painel vazio': MV };
  let cf = 0; const ok2 = (c, m) => { if (!c) { cf++; console.log('  XX ' + m); } else console.log('  ok ' + m); };
  const browser = await chromium.launch({ executablePath: acharChromium(), headless: true });
  for (const W of [780, 893, 1075, 1200]) {
    for (const [nome, mk] of Object.entries(casos)) {
      const page = await (await browser.newContext({ viewport: { width: W, height: 428 }, deviceScaleFactor: 2 })).newPage();
      await page.goto(distAbs, { waitUntil: 'load' }); await page.evaluate(mk); await page.waitForTimeout(110);
      const r = await page.evaluate(() => {
        const pa = document.querySelector('.pa'); const rol = document.querySelector('.pv__dir');
        const paClip = pa ? (pa.scrollHeight - pa.clientHeight) : 0;
        const rb = rol.getBoundingClientRect(); const cw = rol.clientWidth; let over = 0;
        rol.querySelectorAll('*').forEach(el => { const o = el.getBoundingClientRect().right - rb.left - cw; if (o > over) over = o; });
        // pior NOME de linha e pior OBJETIVO do painel: medir natural (clone) vs a caixa — nada cortado.
        let nameClip = 0;
        document.querySelectorAll('.lr__nome').forEach(el => { const cs = getComputedStyle(el); const c = document.createElement('span'); c.textContent = el.textContent; c.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap;font:' + cs.font; document.body.appendChild(c); const nat = c.offsetWidth; c.remove(); const clip = nat - el.clientWidth; if (clip > nameClip) nameClip = clip; });
        return { paClip: Math.round(paClip), over: Math.round(over), nameClip: Math.round(nameClip) };
      });
      ok2(r.paClip <= 1, `${W} ${nome}: o painel NÃO rola (clip ${r.paClip})`);
      ok2(r.over <= 1, `${W} ${nome}: a lista não corta na horizontal (over ${r.over})`);
      ok2(r.nameClip <= 1, `${W} ${nome}: nenhum nome de linha cortado por reticência (clip ${r.nameClip})`);
      await page.close();
    }
  }
  await browser.close();
  if (cf) { console.log(`\n== ${cf} FALHA(S) de largura (Chromium) ==`); process.exit(1); }
  console.log('\n== TELA DE PROVAÇÕES §316 OK (jsdom + 4 larguras) ==');
  process.exit(0);
})().catch(e => { console.error(e.message || e); process.exit(1); });
