// §348 — HUB DO DOMÍNIO (renderDominioHub) no modelo do dono. Prova:
//  (1) cada ESTADO (nova/andamento/premio/morto/completo) mostra a coluna do meio e o botão certos, e o botão chama
//      o handler certo (montar · descerDominio · escolherPremioDominio · nova corrida);
//  (2) os inimigos do próximo nível BATEM com a escada da semana;
//  (3) o REVIVER usa o deus do TIME do jogador (run.time), não o trio inimigo (lad.trio) — o defeito do §348;
//  (4) a sublinha NÃO tem anotação interna ("a régua não calibra, a mão sim");
//  (5) a trilha marca vencidos, o atual e os chefes certos;
//  (6) Chromium @1846×852 e @780×360: nada sai da tela, nada se sobrepõe, nenhum texto corta.
const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

let falhas = 0, passes = 0;
const ok = (c, m) => { if (!c) { console.log('  ✗ FALHA: ' + m); falhas++; } else { console.log('  ✓ ' + m); passes++; } };
const html = fs.readFileSync(path.join(__dirname, '..', 'dist', 'incursion.html'), 'utf8');

function mkDom(){
  const vc = new VirtualConsole(); let err = null; vc.on('jsdomError', e => { err = (e.detail && e.detail.message) || e.message; });
  const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://x/', virtualConsole: vc });
  return { w: dom.window, d: dom.window.document, getErr: () => err };
}
// semeia um estado da corrida e abre o hub. Devolve a chave da cultura e os dados úteis.
function semear(w, estado, over){
  return w.eval(`(function(){
    var c = Object.keys(DOMINIOS)[0], lad = DOMINIOS[c], sem = semanaInfo(lad), tot = domTotalNiveis(lad);
    perfil = novoPerfil(0,0);
    var team = ['zeus','ogum','tyr'];
    var vida = [{hp:84,vivo:true},{hp:37,vivo:true},{hp:0,vivo:false}];
    var prog = { run:null, melhorSempre:24, semanas:{} };
    prog.semanas[sem.chave]=11; prog.semanas[sem.chaveAnt]=18;
    function mk(o){ var r={cultura:lad.cultura,time:team.slice(),semanaIdx:sem.idx,semana:sem.chave,marcaAnterior:18,superou:false,nivel:12,vida:vida.map(function(v){return Object.assign({},v)}),bonus:0.2,reviveGasto:[],profundidade:11,status:'ativo',aguardandoPremio:false,id:'dom_t'}; for(var k in (o||{})) r[k]=o[k]; return r; }
    var E = ${JSON.stringify(estado)}, O = ${JSON.stringify(over || {})};
    if(E==='andamento') prog.run=mk(O);
    else if(E==='premio') prog.run=mk(Object.assign({nivel:20,profundidade:20,aguardandoPremio:true},O));
    else if(E==='morto') prog.run=mk(Object.assign({status:'morto',nivel:12,profundidade:11},O));
    else if(E==='completo') prog.run=mk(Object.assign({status:'completo',nivel:tot,profundidade:tot,vida:[{hp:84,vivo:true},{hp:37,vivo:true},{hp:50,vivo:true}]},O));
    else prog.run=null;
    perfil.dominios.porDominio[c]=prog;
    ir('dominio',{cultura:c},{substituir:true}); render();
    return { c:c, tot:tot, nivel:(prog.run?prog.run.nivel:1), semIdx:sem.idx };
  })()`);
}

console.log('== §348 — HUB DO DOMÍNIO: estados, botões, handlers ==');
{
  // --- NOVA CORRIDA ---
  const { w, d } = mkDom();
  semear(w, 'nova');
  ok(!!d.querySelector('#domhub[data-estado="nova"]'), 'nova: o hub marca data-estado="nova"');
  ok(d.querySelectorAll('.dh-un--vazia').length === 3, 'nova: 3 vagas vazias na esquerda ("Você monta o time ao começar")');
  ok(/Você monta o time ao começar/.test(d.querySelector('.dh-col--time').textContent), 'nova: a dica de montar aparece');
  ok(/PRIMEIRO NÍVEL/.test(d.querySelector('.dh-meio__t').textContent), 'nova: o meio diz "PRIMEIRO NÍVEL"');
  ok(!!d.querySelector('#dentrar') && !d.querySelector('#ddescer'), 'nova: o botão é "MONTAR TIME E COMEÇAR" (#dentrar), não descer');
  d.querySelector('#dentrar').dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  ok(w.eval("rotaAtual()") === 'dominiomontar', 'nova: #dentrar leva ao montador de time (dominiomontar)');
}
{
  // --- EM ANDAMENTO ---
  const { w, d } = mkDom();
  const inf = semear(w, 'andamento');
  ok(!!d.querySelector('#domhub[data-estado="andamento"]'), 'andamento: data-estado="andamento"');
  ok(/PRÓXIMO NÍVEL — 12/.test(d.querySelector('.dh-meio__t').textContent), 'andamento: "PRÓXIMO NÍVEL — 12"');
  // (2) os inimigos do meio BATEM com a escada da semana
  const foes = [...d.querySelectorAll('.dh-foe[data-foe]')].map(e => e.getAttribute('data-foe'));
  const escada = w.eval(`(function(){ var r=perfil.dominios.porDominio["${inf.c}"].run; return domInimigosNivel(DOMINIOS["${inf.c}"], r.semanaIdx, r.nivel); })()`);
  ok(foes.length === 3 && foes.join(',') === escada.join(','), `andamento: os 3 inimigos batem com a escada (${foes.join(',')})`);
  ok(!!d.querySelector('#ddescer') && /12/.test(d.querySelector('#ddescer').textContent), 'andamento: botão "DESCER AO NÍVEL 12" (#ddescer)');
  d.querySelector('#ddescer').dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  ok(w.eval("rotaAtual()") === 'batalha', 'andamento: #ddescer chama descerDominio → entra na batalha do nível');
  // (5) trilha: vencidos (is-done) = profundidade; atual (is-cur) = nivel; chefes = total/10
  const { w: w2, d: d2 } = mkDom();
  semear(w2, 'andamento');
  const done = d2.querySelectorAll('.dh-no.is-done').length, cur = [...d2.querySelectorAll('.dh-no.is-cur')].map(e => +e.getAttribute('data-no'));
  const chefes = [...d2.querySelectorAll('.dh-no--chefe')].map(e => +e.getAttribute('data-no'));
  ok(done === 11, `andamento: a trilha marca 11 vencidos (profundidade) — tem ${done}`);
  ok(cur.length === 1 && cur[0] === 12, `andamento: o marcador ATUAL está no nível 12 (tem ${cur.join(',')})`);
  ok(chefes.join(',') === '10,20,30,40', `andamento: coroas nos chefes 10/20/30/40 (tem ${chefes.join(',')})`);
  // (4) a sublinha NÃO tem anotação interna
  ok(!/régua|a mão sim|não calibra/i.test(d2.querySelector('.dh-sub').textContent), 'a sublinha não traz anotação interna ("a régua não calibra, a mão sim")');
  ok(/CORRIDA EM ANDAMENTO · SEMANA/i.test(d2.querySelector('.dh-sub').textContent), 'a sublinha mostra estado + semana');
}
{
  // --- CHEFE VENCIDO (prêmio) ---
  const { w, d } = mkDom();
  semear(w, 'premio');
  ok(!!d.querySelector('#domhub[data-estado="premio"]'), 'premio: data-estado="premio"');
  ok(/CHEFE VENCIDO — NÍVEL 20/.test(d.querySelector('.dh-meio__t').textContent), 'premio: "CHEFE VENCIDO — NÍVEL 20"');
  ok(!!d.querySelector('.dompremio[data-premio="cura"]') && !!d.querySelector('.dompremio[data-premio="reviver"]') && !!d.querySelector('.dompremio[data-premio="bonus"]'), 'premio: os 3 cartões (cura/reviver/bônus) disponíveis');
  // (3) REVIVER usa o DEUS DO TIME (run.time[caído]=tyr), não o trio inimigo (lad.trio)
  const revTxt = d.querySelector('.dompremio[data-premio="reviver"]').textContent;
  const nomeTime = w.eval(`domNomeDeus('tyr')`), nomeTrio = w.eval(`domNomeDeus(DOMINIOS[Object.keys(DOMINIOS)[0]].trio[2])`);
  ok(revTxt.indexOf(nomeTime) >= 0, `premio: REVIVER mostra o deus do TIME caído ("${nomeTime}")`);
  ok(nomeTime === nomeTrio || revTxt.indexOf(nomeTrio) < 0, 'premio: REVIVER NÃO usa o nome do trio inimigo (lad.trio)');
  // a sublinha da trilha é a de prêmio
  ok(/Chefe vencido no nível 20 · escolha uma recompensa/.test(d.querySelector('.dh-trilha__cap').textContent), 'premio: a legenda da trilha pede a recompensa');
  // clicar BÔNUS → escolherPremioDominio (bonus sobe, aguardandoPremio sai)
  d.querySelector('.dompremio[data-premio="bonus"]').dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  ok(w.eval(`(function(){ var r=perfil.dominios.porDominio[Object.keys(DOMINIOS)[0]].run; return !r.aguardandoPremio && Math.round(r.bonus*100)===30; })()`), 'premio: tocar BÔNUS chama escolherPremioDominio (bônus 20%→30%, sai do portão)');
}
{
  // --- CHEFE VENCIDO, REVIVER sem caído no slot do trio: cobre que o índice vem do TIME ---
  const { w, d } = mkDom();
  // caído no slot 1 (brigid-like): time ['zeus','ogum','tyr'], 2º caído
  semear(w, 'premio', { vida: [{ hp: 50, vivo: true }, { hp: 0, vivo: false }, { hp: 40, vivo: true }] });
  const revTxt = d.querySelector('.dompremio[data-premio="reviver"]').textContent;
  ok(revTxt.indexOf(w.eval(`domNomeDeus('ogum')`)) >= 0, 'premio: com o 2º do time caído, o REVIVER nomeia ESSE deus (ogum)');
}
{
  // --- ENCERRADA (morto) ---
  const { w, d } = mkDom();
  semear(w, 'morto');
  ok(!!d.querySelector('#domhub[data-estado="morto"]') && !!d.querySelector('.dh-selo--morto'), 'morto: selo "CORRIDA ENCERRADA"');
  ok(!!d.querySelector('#dnova') && !d.querySelector('#ddescer'), 'morto: botão "NOVA CORRIDA" (#dnova)');
  ok(/CORRIDA ENCERRADA/.test(d.querySelector('.dh-sub').textContent), 'morto: a sublinha diz "CORRIDA ENCERRADA"');
  d.querySelector('#dnova').dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  ok(w.eval("rotaAtual()") === 'dominiomontar', 'morto: #dnova leva ao montador (nova corrida)');
}
{
  // --- CONQUISTADO (completo) ---
  const { w, d } = mkDom();
  const inf = semear(w, 'completo');
  ok(!!d.querySelector('#domhub[data-estado="completo"]') && !!d.querySelector('.dh-selo--venceu'), 'completo: selo "DOMÍNIO CONQUISTADO"');
  ok(d.querySelectorAll('.dh-no.is-done').length === inf.tot, `completo: a trilha marca TODOS os ${inf.tot} níveis vencidos`);
  ok(!!d.querySelector('#dnova'), 'completo: botão "NOVA CORRIDA"');
  // chefe final sempre presente (3 retratos do trio inimigo)
  ok(d.querySelectorAll('.dh-cf[data-chefe]').length === 3, 'o CHEFE FINAL mostra os 3 do trio inimigo da cultura');
}

// ---------------- Chromium: nada sai da tela, nada se sobrepõe, nenhum texto corta ----------------
const { chromium } = require('playwright');
function acharChromium(){
  if (process.env.INCURSION_CHROMIUM) return process.env.INCURSION_CHROMIUM;
  try { const base = '/opt/pw-browsers'; const dir = fs.readdirSync(base).filter(d => /^chromium-\d+$/.test(d)).sort().pop();
    if (dir) { const bin = path.join(base, dir, 'chrome-linux', 'chrome'); if (fs.existsSync(bin)) return bin; } } catch (e) {}
  return undefined;
}

(async () => {
  console.log('\n== §348 — Chromium: cabe, não se sobrepõe, não corta (1846×852 e 780×360) ==');
  const distAbs = path.resolve(__dirname, '..', 'dist', 'incursion.html');
  const browser = await chromium.launch({ executablePath: acharChromium(), headless: true });
  const page = await (await browser.newContext()).newPage();
  await page.goto('file://' + distAbs, { waitUntil: 'load' });

  async function setup(estado){
    return await page.evaluate((estado) => {
      const c = 'grega', lad = DOMINIOS[c], sem = semanaInfo(lad), tot = domTotalNiveis(lad);
      perfil = novoPerfil(0, 0);
      const team = ['zeus', 'ogum', 'tyr'], vida = [{ hp: 84, vivo: true }, { hp: 37, vivo: true }, { hp: 0, vivo: false }];
      const prog = { run: null, melhorSempre: 24, semanas: {} }; prog.semanas[sem.chave] = 11; prog.semanas[sem.chaveAnt] = 18;
      const mk = o => Object.assign({ cultura: 'Grega', time: team.slice(), semanaIdx: sem.idx, semana: sem.chave, marcaAnterior: 18, superou: false, nivel: 12, vida: vida.map(v => Object.assign({}, v)), bonus: 0.2, reviveGasto: [], profundidade: 11, status: 'ativo', aguardandoPremio: false, id: 'dom_c' }, o);
      if (estado === 'andamento') prog.run = mk({});
      else if (estado === 'premio') prog.run = mk({ nivel: 20, profundidade: 20, aguardandoPremio: true });
      else if (estado === 'nova') prog.run = null;
      else if (estado === 'morto') prog.run = mk({ status: 'morto', nivel: 12, profundidade: 11 });
      else if (estado === 'completo') prog.run = mk({ status: 'completo', nivel: tot, profundidade: tot, vida: [{ hp: 84, vivo: true }, { hp: 37, vivo: true }, { hp: 50, vivo: true }] });
      perfil.dominios.porDominio[c] = prog;
      ir('dominio', { cultura: c }, { substituir: true }); render();
      const g = document.getElementById('gsplash'); if (g) g.remove();
      // mede
      const hub = document.getElementById('domhub'), hb = hub.getBoundingClientRect();
      const fora = hb.left < -1 || hb.top < -1 || hb.right > innerWidth + 1 || hb.bottom > innerHeight + 1;
      const pw = hb.width / innerWidth, ph = hb.height / innerHeight;
      // sobreposição entre as 3 colunas (em coords de design, dentro do hub)
      const r = s => { const el = hub.querySelector(s); return el ? el.getBoundingClientRect() : null; };
      const t = r('.dh-col--time'), m = r('.dh-col--meio'), dr = r('.dh-col--dir');
      const overlap = (t && m && t.right > m.left + 1) || (m && dr && m.right > dr.left + 1);
      // texto cortado (largura natural > caixa) nos títulos/nomes/legendas
      let clips = [];
      hub.querySelectorAll('.dh-titulo,.dh-sub,.dh-trilha__cap,.dh-meio__t,.dh-un__n,.dh-foe__n,.dh-rec__l,.dh-rec__v,.dh-premio__t,.dh-box__t,.dh-col__t').forEach(el => { if (el.scrollWidth > el.clientWidth + 1.5) clips.push(el.className.split(' ')[0] + ':' + el.textContent.trim().slice(0, 16)); });
      // §348b: o defeito que o §348 NÃO pegou — media #domhub (que tem overflow:hidden e RECORTA os filhos que
      // transbordam) e nunca os FILHOS. Agora medimos o fundo (y de DESIGN) de cada caixa de coluna E dos filhos que
      // transbordavam (nomes do chefe final, régua do bônus, retratos), convertendo a coord de tela em design pela escala.
      const esc = hb.height / 852;   // escala da tela fixa (1 a 1846×852; ~0.42 a 780×360)
      const designBot = el => Math.round((el.getBoundingClientRect().bottom - hb.top) / esc);
      let botMax = 0, piorBot = '';
      hub.querySelectorAll('.dh-col--time,.dh-col--meio,.dh-col--dir,.dh-cf__n,.dh-cf__p,.dh-bon__mk em,.dh-bon__rail,.dh-foe__n,.dh-premio__s,.dh-un__bar').forEach(el => { const b = designBot(el); if (b > botMax) { botMax = b; piorBot = el.className.split(' ')[0] + ':' + el.textContent.trim().slice(0, 12); } });
      return { fora, pw, ph, overlap, clips: clips.slice(0, 6), botMax, piorBot };
    }, estado);
  }

  const estados = ['andamento', 'premio', 'nova', 'morto', 'completo'];
  for (const [W, H] of [[1846, 852], [780, 360]]){
    await page.setViewportSize({ width: W, height: H });
    const lista = (W === 1846) ? estados : ['andamento'];   // o piso 780 cobre o estado mais denso
    for (const est of lista){
      const m = await setup(est);
      ok(!m.fora, `§348 @${W}×${H} [${est}]: o hub cabe na tela (nada fora)`);
      ok(Math.min(m.pw, m.ph) >= 0.98, `§348 @${W}×${H} [${est}]: enche a tela (${(m.pw * 100).toFixed(1)}%×${(m.ph * 100).toFixed(1)}% ≥ 98%)`);
      ok(!m.overlap, `§348 @${W}×${H} [${est}]: as 3 colunas não se sobrepõem`);
      ok(m.clips.length === 0, `§348 @${W}×${H} [${est}]: nenhum texto corta (${m.clips.join(' | ') || 'ok'})`);
      // §348b: NENHUM filho (caixa de coluna, nomes do chefe final, régua do bônus) passa de y=830 de design.
      ok(m.botMax <= 830, `§348b @${W}×${H} [${est}]: o conteúdo (colunas, chefe final, bônus) termina em y≤830 (pior: ${m.botMax} em ${m.piorBot})`);
    }
  }

  await browser.close();
  console.log(`\n${falhas ? '✗ ' + falhas + ' FALHA(S)' : '✓ tudo verde'} · ${passes} asserções`);
  process.exit(falhas ? 1 : 0);
})();
