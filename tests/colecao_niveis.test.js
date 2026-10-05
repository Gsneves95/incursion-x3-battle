// §321 — A: a Coleção abre o KIT direto na sobreposição, com a VISÃO DE NÍVEIS embutida (SUBIR troca a visão
// SEM rota; "‹ Kit" volta; setas mantêm a visão de níveis no vizinho; subir atualiza pontos/marcadores).
// B: as Provações de PvE agora se chamam RITOS — nenhum texto visível de PvE usa "Provação".
const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

let falhas = 0, passes = 0;
const ok = (c, m) => { if (!c) { console.log('  ✗ FALHA: ' + m); falhas++; } else { console.log('  ✓ ' + m); passes++; } };
const distAbs = path.resolve(__dirname, '..', 'dist', 'incursion.html');
const html = fs.readFileSync(distAbs, 'utf8');

// ================================ PARTE 1 — jsdom ================================
(async function parte1(){
  const vc = new VirtualConsole(); let err = null; vc.on('jsdomError', e => { err = (e.detail && e.detail.message) || e.message; });
  const w = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'http://localhost/', virtualConsole: vc }).window;
  const d = w.document, $ = s => d.querySelector(s), $$ = s => [...d.querySelectorAll(s)];
  const txt = el => (el ? el.textContent : '').replace(/\s+/g, ' ').trim();
  const tick = () => new Promise(r => setTimeout(r, 40));

  console.log('== §321 A — Coleção: sobreposição do kit + visão de níveis embutida (jsdom) ==');
  const pair = JSON.parse(w.eval(`(function(){
    const pool=ROSTER.map(e=>e.key).filter(jogavel);
    const comEsc=pool.filter(k=>(GODS[k].ab||[]).some(a=>a.slot==='basico'&&Array.isArray(a.niveis)&&a.niveis.length));
    return JSON.stringify(comEsc.slice(0,2));
  })()`));
  const k0 = pair[0], k1 = pair[1];
  w.eval(`perfil.deuses['${k0}']=perfil.deuses['${k0}']||{copias:1,obtidoEm:0}; perfil.deuses['${k1}']=perfil.deuses['${k1}']||{copias:1,obtidoEm:0};
    contaAtual={pontos:{'${k0}':9,'${k1}':9},niveis:{'${k0}':{basico:1,habilidade:1,milagre:1},'${k1}':{basico:1,habilidade:1,milagre:1}},perfil:{deuses:perfil.deuses},missoes:{ativa:null,progresso:{},liberados:[]}};
    colF.busca='';colF.cultura='';colF.classe='';colF.funcao='';colF.status='';colF.raridade=''; lerToken=function(){return 'tok';};
    ir('colecao',{},{substituir:true}); render();`);
  ok(!err, 'a Coleção renderiza sem quebrar (' + (err || 'ok') + ')');

  // A1 — tocar no cartão ABRE a sobreposição (bite: antes só selecionava).
  ok(!$('#col2ov'), 'antes do toque: nenhuma sobreposição aberta');
  w.eval(`document.querySelector('.col2c[data-deus="${k0}"]').click()`);
  ok(!!$('#col2ov'), 'A1: tocar no cartão ABRE a sobreposição do kit (bite)');
  ok(!!$('.col2ov__sks') && !!$('#col2ovsubir'), 'abre na visão do KIT, com o botão "SUBIR HABILIDADES"');
  ok(w.eval(`colVer==='${k0}'`), 'a sobreposição é do deus tocado');

  // A3 — SUBIR troca para a visão de níveis SEM mudar de rota; "‹ Kit" volta.
  const rotaAntes = w.eval("rotaAtual()");
  ok($('#col2ovsubir').classList.contains('b--primary'), 'o SUBIR fica DOURADO (há nível pagável, 9 pontos)');
  w.eval("document.querySelector('#col2ovsubir').click()");
  ok(w.eval("rotaAtual()") === rotaAntes && !!$('#col2ov'), 'A3: SUBIR não muda de rota e a sobreposição continua aberta');
  ok(!!$('.col2ov__nivscroll') && $$('.col2ov__nivscroll .nlp').length === 3, 'A4: a visão de níveis traz os 3 painéis (lógica do §319)');
  ok(/Pontos de/.test(txt($('.col2ov__nivscroll .nltop__ptn'))) && $$('.col2ov__nivscroll [data-subir]').length >= 1, 'A4: traz os pontos do deus + botões SUBIR por slot');
  ok(!!$('#col2ovkit'), 'há o "‹ Kit"');
  w.eval("document.querySelector('#col2ovkit').click()");
  ok(!!$('.col2ov__sks') && !$('.col2ov__nivscroll'), 'A3: "‹ Kit" volta à visão do kit (mesma sobreposição)');

  // A5 — a setinha, na visão de níveis, mantém a visão de níveis no vizinho.
  w.eval("document.querySelector('#col2ovsubir').click()");   // volta p/ níveis
  ok(!!$('.col2ov__nivscroll'), 'de volta à visão de níveis');
  const seta = w.eval("(document.querySelector('#col2ovnext') && !document.querySelector('#col2ovnext').disabled) ? 'next' : 'prev'");
  ok(w.eval(`!!document.querySelector('#col2ov${seta}') && !document.querySelector('#col2ov${seta}').disabled`), 'há uma setinha habilitada');
  w.eval(`document.querySelector('#col2ov${seta}').click()`);
  ok(!!$('.col2ov__nivscroll') && w.eval('colVer') !== k0, 'A5: a setinha passa ao vizinho JÁ na visão de níveis');

  // A8 — subir dentro da sobreposição atualiza pontos e marcadores (servidor mockado).
  w.eval("colFecharVer(); colAbrirVer('" + k0 + "'); colVerVista='niveis'; colVerRefrescarCard(document.querySelector('#col2ov'), '" + k0 + "');");
  w.eval(`contaTransporte={ pedir:function(msg){ var dz=msg.deus, sl=msg.slot;
    var conta={ pontos:Object.assign({},contaAtual.pontos,{[dz]:8}),
      niveis:Object.assign({},contaAtual.niveis,{[dz]:Object.assign({},contaAtual.niveis[dz],{[sl]:2})}),
      perfil:contaAtual.perfil, missoes:contaAtual.missoes };
    return Promise.resolve({ tipo:'nivelSubiu', deus:dz, slot:sl, nivel:2, pontos:8, conta:conta }); } };`);
  w.eval("var b=document.querySelector('.col2ov__nivscroll [data-subir=\"basico\"]'); if(b)b.click();");
  ok(!!$('.col2ov__nivscroll .nlp__conf') && !!$('.col2ov__nivscroll [data-subir-ok]'), 'A8: SUBIR abre a confirmação inline DENTRO da sobreposição');
  w.eval("document.querySelector('.col2ov__nivscroll [data-subir-ok]').click()");
  await tick();
  ok(!!$('.col2ov__nivscroll'), 'após subir, a visão de níveis permanece');
  ok(/:\s*8\b/.test(txt($('.col2ov__nivscroll .nltop__ptn'))), 'A8: os pontos do deus caíram para 8 (atualizou)');
  const pins = $$('.col2ov__nivscroll .nlp[data-slot="basico"] .nlpin.on').length;
  ok(pins >= 2, `A8: o marcador do básico subiu para nível 2 (pins acesos ${pins})`);

  // ---- PARTE B — "Rito" no PvE, nunca "Provação" ----
  console.log('\n== §321 B — Provações de PvE viram RITOS (jsdom) ==');
  w.eval("colFecharVer();");
  w.eval(`prova={key:'${k0}',faixa:'Fácil',minimo:5,condicoes:[]}; provaFim={resultado:'vitoria',categoria:null,motivo:null,lances:6,minimo:5};`);
  const resHTML = w.eval("provaResultadoOverlay()");
  ok(/RITO VENCIDO/.test(resHTML) && /Rito ·/.test(resHTML), 'B: o resultado do PvE diz "RITO VENCIDO" e o selo "Rito ·"');
  ok(!/Provaç/.test(resHTML) && !/PERGAMINHO|Pergaminho/.test(resHTML), 'B (bite): o resultado do PvE NÃO usa "Provação" nem "Pergaminho"');
  const cond = w.eval("motivoHumano('condicao_desconhecida_xyz')");
  ok(/Rito/.test(cond) && !/Provaç/.test(cond), 'B: a condição não cumprida fala em "Rito"');
  w.eval("prova=null;provaFim=null; ir('desafios',{},{substituir:true}); render();");
  ok(!/Provaç/.test(txt($('#baselayer'))), 'B: o hub de Desafios (PvE) não mostra "Provação"');
  w.eval("ir('composicao',{},{substituir:true}); render();");
  ok(!/Provaç/.test(txt($('#baselayer'))), 'B: a composição (PvE) não mostra "Provação" (o "‹" diz Desafios)');
  // ESCOPO: a tela de DESBLOQUEIO continua "Provações" (o rename é só do PvE).
  w.eval(`contaAtual={nick:'T',ranque:{pontos:0},pontos:{},niveis:{},perfil:{deuses:perfil.deuses},missoes:{ativa:null,progresso:{},liberados:[]}}; ir('provacoes',{},{substituir:true}); render();`);
  ok(/Provações/.test(txt($('#baselayer'))), 'B (escopo): a tela de DESBLOQUEIO segue "Provações"');

  try { w.close(); } catch (e) {}
  await parte2();
})();

// ================================ PARTE 2 — Chromium (medir a sobreposição na visão de níveis) ============
function acharChromium(){
  if (process.env.INCURSION_CHROMIUM) return process.env.INCURSION_CHROMIUM;
  try { const base = '/opt/pw-browsers'; const dir = fs.readdirSync(base).filter(x => /^chromium-\d+$/.test(x)).sort().pop();
    if (dir) { const bin = path.join(base, dir, 'chrome-linux', 'chrome'); if (fs.existsSync(bin)) return bin; } } catch (e) {}
  return undefined;
}
async function parte2(){
  let chromium; try { chromium = require('playwright').chromium; } catch (e) { console.log('  (playwright ausente — pulando a medição Chromium)'); return fechar(); }
  console.log('\n== §321 A — medição da sobreposição na visão de níveis (Chromium, 4 larguras) ==');
  const browser = await chromium.launch({ executablePath: acharChromium(), headless: true });
  try {
    const page = await (await browser.newContext()).newPage();
    await page.goto('file://' + distAbs, { waitUntil: 'load' });
    // o deus com a MAIOR descrição de habilidade (pior caso de texto) que seja jogável e tenha escada.
    const k = await page.evaluate(() => {
      let best = { len: -1, k: null };
      for (const key in GODS) { if (!(GODS[key].ab || []).some(a => a.slot === 'basico' && Array.isArray(a.niveis) && a.niveis.length)) continue;
        const L = Math.max(...(GODS[key].ab || []).map(a => (a.desc || '').length)); if (L > best.len) best = { len: L, k: key }; }
      return best.k;
    });
    for (const W of [780, 893, 1075, 1200]) {
      await page.setViewportSize({ width: W, height: 412 });
      const r = await page.evaluate(({ k }) => {
        perfil.deuses[k] = perfil.deuses[k] || { copias: 1, obtidoEm: 0 };
        contaAtual = { pontos: { [k]: 9 }, niveis: { [k]: { basico: 1, habilidade: 1, milagre: 1 } }, perfil: { deuses: perfil.deuses }, missoes: { ativa: null, progresso: {}, liberados: [] } };
        ir('colecao', {}, { substituir: true }); render();
        colAbrirVer(k); colVerVista = 'niveis'; const ov = document.querySelector('#col2ov'); colVerRefrescarCard(ov, k);
        const R = el => el.getBoundingClientRect();
        const card = R(document.querySelector('.col2ov__card'));
        const scroll = document.querySelector('.col2ov__nivscroll');
        let over = 0; scroll.querySelectorAll('*').forEach(el => { const o = R(el).right - card.right; if (o > over) over = o; });
        const vw = document.documentElement.clientWidth;
        let cut = 0; document.querySelectorAll('#col2ov *').forEach(el => { if (R(el).right > vw + 0.5) cut++; });
        // a altura de TOQUE em px de DESIGN (getComputedStyle) — o #stage tem transform:scale(fit), então o
        // rect encolhe junto com a tela toda; o piso de toque é a medida lógica, que escala com todo o app.
        const btns = [...scroll.querySelectorAll('.nlp__acao .b, .nlp__confb .b, [data-subir]')].map(b => parseFloat(getComputedStyle(b).height) || R(b).height);
        const minBtn = btns.length ? Math.min(...btns) : 99;
        const paineis = scroll.querySelectorAll('.nlp').length;
        return { over: Math.round(over), cut, minBtn: Math.round(minBtn), paineis };
      }, { k });
      ok(r.paineis === 3, `@${W}: a visão de níveis mostra os 3 painéis (${r.paineis})`);
      ok(r.over <= 1, `@${W}: nada da visão de níveis vaza o cartão na horizontal (over ${r.over})`);
      ok(r.cut === 0, `@${W}: nada da sobreposição corta na viewport (${r.cut})`);
      ok(r.minBtn >= 44, `@${W}: o toque dos botões de subir é >= 44px (menor ${r.minBtn})`);
      console.log(`  @${W}: 3 painéis · over ${r.over} · corte ${r.cut} · menor toque ${r.minBtn}px`);
    }
  } finally { try { await browser.close(); } catch (e) {} }
  fechar();
}
function fechar(){
  console.log(`\n${falhas ? '✗ ' + falhas + ' FALHA(S)' : '✓ tudo verde'} · ${passes} asserções`);
  process.exit(falhas ? 1 : 0);
}
