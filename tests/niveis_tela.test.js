// §350 — A TELA DE NÍVEIS DE HABILIDADE (renderNiveis, rota 'niveis') no modelo do dono: TELA FIXA 1846×852
// escalada. Cabeçalho (‹ <Nome> volta p/ a FICHA · "NÍVEIS DE HABILIDADE" · "Pontos de <Nome>: N" com ícone
// próprio) · COLUNA ESQUERDA (retrato + nome + raridade + panteão·elemento + PASSIVA "não tem níveis") · COLUNA
// DIREITA = 4 cartões 2×2 (Básico/Habilidade/Milagre/Defesa). Cada cartão: cabeçalho (ícone·tipo·nome·Nv N de TOPO
// + bolinhas quando TEM escada) · AGORA | PRÓXIMO (só os números que mudam em dourado) · ação por estado. O servidor
// (subirNivel) é AUTORITATIVO; isto é TELA — tudo deriva do data/deuses (escadas), do kitEfetivo (texto) e da
// economia.json (custo em pontos). Prova os estados, o diff dourado, confirmar/cancelar, o voltar à ficha, e o
// ENCAIXE no Chromium (1846×852 e 780×360): tudo dentro da tela, nada se sobrepõe, nada corta.
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
const tick = () => new Promise(r => setTimeout(r, 30));
// monta uma conta ONLINE possuindo os deuses dados, com níveis/pontos à escolha, e abre a rota 'niveis'.
function abrir(k, opts = {}) {
  const niveis = opts.niveis || {};
  const pontos = opts.pontos || {};
  const deuses = {}; (opts.possui || [k]).forEach(x => deuses[x] = { copias: 1 });
  w.eval(`perfil.deuses=${JSON.stringify(deuses)};
    contaAtual={nick:'T',ranque:{pontos:60},pontos:${JSON.stringify(pontos)},niveis:${JSON.stringify(niveis)},perfil:{deuses:${JSON.stringify(deuses)}},missoes:{ativa:null,progresso:{},liberados:[]}};
    nlConfirm=null;nlPendente=false;nlMsg=null;nlSelKey=null;ir('niveis',{key:${JSON.stringify(k)}},{substituir:true});render();`);
}

(async () => {
  console.log('== §350 / TELA DE NÍVEIS DE HABILIDADE (tela fixa: cabeçalho + esquerda + 4 cartões) ==');
  ok(w.eval("typeof subirNivelServidor==='function'"), 'o cliente tem subirNivelServidor (pede ao servidor autoritativo)');
  ok(w.eval("typeof ECONOMIA==='object' && ECONOMIA.invocacao && ECONOMIA.invocacao.custoNivel && ECONOMIA.invocacao.custoNivel['2']===1"), 'o custo em pontos vem do economia.json (nv2=1)');

  // ---- 1. CABEÇALHO + COLUNA ESQUERDA (identidade + passiva) ----
  console.log('\n== 1. cabeçalho + coluna esquerda (identidade, passiva) ==');
  err = null;
  abrir('zeus', { pontos: { zeus: 3 }, niveis: { zeus: { basico: 1, habilidade: 1, milagre: 1 } } });
  ok(!err, 'renderiza sem quebrar (' + (err || 'ok') + ')');
  ok(!!$('#nlfix.nlfix2, .nlfix2 #nlfix'), 'monta na tela fixa (#nlfix dentro de .nlfix2)');
  ok(/‹ Zeus/.test(txt($('#bvoltar'))), 'o voltar diz "‹ <Nome do deus>" (§319c: volta para a FICHA)');
  ok(/NÍVEIS DE HABILIDADE/.test(txt($('.nlx-titulo'))), 'título "NÍVEIS DE HABILIDADE"');
  ok(/Pontos de Zeus: 3/.test(txt($('.nltop__ptn'))), 'os pontos do deus vêm da conta (servidor)');
  ok(!!$('.nltop__ic'), 'o topo tem o ÍCONE PRÓPRIO de pontos (gema azul, distinto da Essência)');
  ok(/cópias repetidas viram pontos/.test(txt($('.nltop__cop'))), 'o topo explica "cópias repetidas viram pontos"');
  ok(!!$('.nlx-esq .nlmed .slot'), 'retrato/medalhão na esquerda');
  ok(txt($('.nlmed__nome')) === 'Zeus', 'o nome do deus na esquerda (Cinzel)');
  ok(/Grega/.test(txt($('.nlid__sub'))) && /Tempestade/i.test(txt($('.nlid__sub'))), 'panteão · elemento (do data/deuses)');
  ok(!!$('.nlpas') && /PASSIVA/.test(txt($('.nlpas__rot'))) && txt($('.nlpas__nome')) === 'Soberano', 'a PASSIVA fica na esquerda com nome');
  ok(/não tem níveis/i.test(txt($('.nlpas__nota'))), 'a passiva diz que não tem níveis');

  // ---- 2. COLUNA DIREITA: 4 cartões (Básico/Habilidade/Milagre/Defesa), na ordem ----
  console.log('\n== 2. coluna direita: 4 cartões na ordem (básico/habilidade/milagre/defesa) ==');
  {
    const P = $$('.nlx-dir .nlp');
    ok(P.length === 4, `4 cartões (básico/habilidade/milagre/defesa), há ${P.length}`);
    ok(txt(P[0].querySelector('.nlp__tipo')) === 'BÁSICO' && /Cetro do Trovão/.test(txt(P[0].querySelector('.nlp__nome'))), 'cartão 1 = BÁSICO · Cetro do Trovão');
    ok(txt(P[1].querySelector('.nlp__tipo')) === 'HABILIDADE', 'cartão 2 = HABILIDADE');
    ok(txt(P[2].querySelector('.nlp__tipo')) === 'MILAGRE', 'cartão 3 = MILAGRE');
    ok(txt(P[3].querySelector('.nlp__tipo')) === 'DEFESA', 'cartão 4 = DEFESA (universal, 4º)');
    // cabeçalho do básico: "Nv 1 de 4" + 4 bolinhas, 1 acesa
    ok(txt(P[0].querySelector('.nlp__nv')) === 'Nv 1 de 4', '"Nv N de TOPO" no básico (Nv 1 de 4)');
    ok(P[0].querySelectorAll('.nlpin').length === 4 && P[0].querySelectorAll('.nlpin.on').length === 1, 'bolinhas: 4 (topo) com 1 acesa (nv atual)');
    ok(/AGORA \(Nv 1\)/.test(txt(P[0].querySelector('.nlp__coll'))) && /15 de dano/.test(txt(P[0].querySelector('.nlp__cell .nlp__txt'))), 'AGORA (Nv 1): texto do nível atual (kit efetivo)');
  }

  // ---- 3. OS 4 ESTADOS numa só tela: faltam · máximo · pode subir (diff) · sem escada ----
  console.log('\n== 3. estados: FALTAM · NÍVEL MÁXIMO · SUBIR (diff dourado) · sem escada ==');
  abrir('zeus', { pontos: { zeus: 1 }, niveis: { zeus: { basico: 3, habilidade: 4, milagre: 1 } } });
  {
    const P = $$('.nlx-dir .nlp');
    // básico nv3 de 4, custo p/ nv4 = 3, tem 1 ponto → FALTAM 2 PONTOS (botão apagado)
    const a0 = P[0].querySelector('.nlp__pe .nlb');
    ok(!P[0].querySelector('[data-subir]') && a0.disabled && /FALTAM 2 PONTOS/.test(txt(a0)), 'BÁSICO (custo 3, tem 1): "FALTAM 2 PONTOS" (apagado)');
    // habilidade nv4 de 4 (topo) → NÍVEL MÁXIMO ALCANÇADO (laurel), sem botão
    ok(!!P[1].querySelector('.nlp__maxbox') && /NÍVEL MÁXIMO/.test(txt(P[1].querySelector('.nlp__maxt'))) && /ALCAN/.test(txt(P[1].querySelector('.nlp__maxt'))), 'HABILIDADE no topo: caixa "NÍVEL MÁXIMO ALCANÇADO" (louros)');
    ok(!P[1].querySelector('[data-subir]') && !P[1].querySelector('.nlp__cell--px'), 'no máximo: sem botão SUBIR e sem coluna PRÓXIMO');
    ok(P[1].querySelectorAll('.nlpin.on').length === 4, 'no máximo: todas as bolinhas acesas');
    // milagre nv1 de 4, custo p/ nv2 = 1, tem 1 ponto → SUBIR PARA NV 2 · 1 PONTO (ouro; §350b singular + ícone)
    const b2 = P[2].querySelector('[data-subir]');
    ok(!!b2 && /SUBIR PARA NV 2 · 1 PONTO\b/.test(txt(b2)) && !/PONTOS/.test(txt(b2)) && b2.classList.contains('nlb--go'), 'MILAGRE (custo 1): botão de ouro "SUBIR PARA NV 2 · 1 PONTO" (singular, §350b)');
    ok(!!b2.querySelector('.nlb__pt'), '§350b: o botão de subir traz o ÍCONE PRÓPRIO de pontos (selo dourado)');
    ok(!!P[2].querySelector('.nlp__cell--px') && /PRÓXIMO \(Nv 2\)/.test(txt(P[2].querySelector('.nlp__coll--px'))), 'MILAGRE tem a coluna PRÓXIMO (Nv 2)');
    // DIFF por PALAVRAS: no milagre só o número que muda (20 → 22) fica em .nl-hi, e NADA mais
    const hi = P[2].querySelectorAll('.nlp__cell--px .nl-hi');
    ok(hi.length === 1 && txt(hi[0]) === '22', `MILAGRE Nv1→Nv2: o PRÓXIMO destaca só o número que muda (22), e só ele (${hi.length} destaque(s))`);
    ok(/20 de dano/.test(txt(P[2].querySelector('.nlp__cell:not(.nlp__cell--px) .nlp__txt'))), 'o AGORA do milagre ainda mostra 20 de dano');
    // §350b DIFF por PALAVRAS: no BÁSICO Nv3→Nv4 o TRECHO NOVO inteiro fica destacado (não só números)
    const hiB = [...P[0].querySelectorAll('.nlp__cell--px .nl-hi')].map(txt).join(' ');
    ok(/ele/.test(hiB) && /causa/.test(hiB) && /menos/.test(hiB) && /turno/.test(hiB), `BÁSICO Nv3→Nv4: o trecho novo "ele causa 3 menos de dano por 1 turno" sai destacado (veio "${hiB}")`);
    ok(!/<b class="nl-hi">inimigo/.test(P[0].querySelector('.nlp__cell--px .nlp__txt').innerHTML), 'o que NÃO muda (ex.: "inimigo") NÃO fica destacado');
    // defesa: universal, sem escada → rótulo "EFEITO" (§350b), sem bolinhas/Nv
    ok(P[3].classList.contains('nlp--sem'), 'DEFESA entra no estado SEM ESCADA');
    ok(/^EFEITO$/.test(txt(P[3].querySelector('.nlp__coll'))) && !/AGORA/.test(txt(P[3].querySelector('.nlp__coll'))), '§350b: DEFESA (sem escada) rotula "EFEITO", não "AGORA (Nv 1)"');
    ok(!P[3].querySelector('.nlpin') && !P[3].querySelector('.nlp__nvbox'), 'DEFESA: sem bolinhas e sem "Nv N de TOPO"');
    const d3 = P[3].querySelector('.nlp__pe .nlb');
    ok(d3.disabled && /não tem níveis/i.test(txt(d3)), 'DEFESA: "Esta habilidade não tem níveis."');
  }

  // ---- 4. CONFIRMAÇÃO: SUBIR abre; CANCELAR fecha; CONFIRMAR chama o servidor no SLOT certo ----
  console.log('\n== 4. confirmação inline: abre · cancela · confirma (slot certo, servidor autoritativo) ==');
  abrir('zeus', { pontos: { zeus: 1 }, niveis: { zeus: { basico: 3, habilidade: 4, milagre: 1 } } });
  clk($$('.nlx-dir .nlp')[2].querySelector('[data-subir]'));
  {
    const P = $$('.nlx-dir .nlp');
    ok(P[2].classList.contains('nlp--conf') && !!P[2].querySelector('.nlp__conf'), 'SUBIR abre a confirmação NO cartão do milagre (sem modal)');
    ok(/Subir para Nv 2 por 1 ponto\?/.test(txt(P[2].querySelector('.nlp__confq'))) && !/pontos/.test(txt(P[2].querySelector('.nlp__confq'))), 'a pergunta cita o nível e o custo no singular (Nv 2 · 1 ponto, §350b)');
    ok(!!P[2].querySelector('[data-subir-ok]') && !!P[2].querySelector('[data-subir-no]'), 'a confirmação tem CONFIRMAR e CANCELAR');
  }
  clk($('[data-subir-no]'));
  ok(!$('.nlp__conf') && !!$$('.nlx-dir .nlp')[2].querySelector('[data-subir]'), 'CANCELAR fecha e devolve o botão SUBIR');
  // CONFIRMAR chama o servidor com (k, slot) corretos
  w.eval("window.__got=null; subirNivelServidor=async function(k,sl){ window.__got={k:k,sl:sl}; contaAtual.pontos[k]-=1; contaAtual.niveis[k][sl]=(contaAtual.niveis[k][sl]||1)+1; return {ok:true,nivel:contaAtual.niveis[k][sl],pontos:contaAtual.pontos[k]}; };");
  clk($$('.nlx-dir .nlp')[2].querySelector('[data-subir]'));
  clk($('[data-subir-ok]'));
  await tick();
  ok(w.eval("window.__got && window.__got.k==='zeus' && window.__got.sl==='milagre'"), 'CONFIRMAR chama subirNivelServidor no SLOT certo (milagre)');
  ok(txt($$('.nlx-dir .nlp')[2].querySelector('.nlp__nv')) === 'Nv 2 de 4', 'após CONFIRMAR o nível do milagre sobe (1 → 2)');
  ok(/Pontos de Zeus: 0/.test(txt($('.nltop__ptn'))), 'os pontos baixam pelo custo (1 → 0)');
  ok(!$('.nlp__conf'), 'a confirmação fecha após a resposta');

  // ---- 5. RECUSA do servidor → linha curta no cartão ----
  console.log('\n== 5. recusa do servidor → linha curta no cartão ==');
  abrir('zeus', { pontos: { zeus: 1 }, niveis: { zeus: { basico: 1, habilidade: 1, milagre: 1 } } });
  w.eval("subirNivelServidor=async function(){ return {erro:'x',codigo:'pontos_insuficientes'}; };");
  clk($$('.nlx-dir .nlp')[0].querySelector('[data-subir]'));
  clk($('[data-subir-ok]'));
  await tick();
  ok(/Pontos insuficientes/.test(txt($('.nlx-dir .nlp .nlp__erro'))), 'recusa "pontos_insuficientes" → mensagem curta no cartão');

  // ---- 6. VOLTAR vai para a FICHA do MESMO deus ----
  console.log('\n== 6. o "‹" volta para a FICHA do mesmo deus ==');
  abrir('zeus', { pontos: { zeus: 1 }, niveis: { zeus: { basico: 1, habilidade: 1, milagre: 1 } } });
  clk($('#bvoltar'));
  ok(w.eval("rotaAtual()") === 'deus' && w.eval("(paramsAtuais()||{}).key") === 'zeus', 'o "‹" leva à FICHA (rota deus) do mesmo deus (zeus)');

  // ---- 7. NÃO POSSUÍDO: aviso + cartões só-leitura (sem subir) ----
  console.log('\n== 7. não possuído: aviso + cartões só-leitura ==');
  abrir('ahpuch', { possui: ['zeus'] });   // possui zeus, NÃO ahpuch
  ok(/não tem este deus/i.test(txt($('.nltop__pts--falta'))), '"Você ainda não tem este deus" no topo');
  ok(!!$('.nlmed__tag') && /NÃO POSSUI/.test(txt($('.nlmed__tag'))), 'tag "NÃO POSSUI" no medalhão');
  ok($$('[data-subir]').length === 0, 'não possuído: nenhum botão SUBIR ativo');
  ok(/precisa ter o deus/i.test(txt($$('.nlx-dir .nlp')[0].querySelector('.nlp__pe .nlb'))), 'cartão com escada: "Você precisa ter o deus"');

  // ---- 8. SEM CONEXÃO: cartões apagados + aviso; nenhum SUBIR ativo ----
  console.log('\n== 8. sem conexão: cartões apagados + aviso ==');
  w.eval("contaAtual=null;perfil.deuses={zeus:{copias:1,obtidoEm:0}};nlSelKey=null;ir('niveis',{key:'zeus'},{substituir:true});render();");
  {
    const esc = $$('.nlx-dir .nlp--esc')[0];
    ok(!!esc.querySelector('.nlp__pe .nlb[disabled]') && /Sem conexão/.test(txt(esc.querySelector('.nlp__pe .nlb'))), 'offline: botão apagado + "Sem conexão com o servidor"');
    ok($$('[data-subir]').length === 0, 'offline: nenhum SUBIR ativo (o servidor é a verdade)');
  }

  if (falhas) { console.log(`\n== ${passes} ok, ${falhas} FALHAS (jsdom) ==`); process.exit(1); }
  console.log(`\n== jsdom OK (${passes}) — agora o ENCAIXE no Chromium (1846×852 e 780×360) ==`);
  await larguras();
})().catch(e => { console.error(e.stack || e.message || e); process.exit(1); });

// ================= §350 — ENCAIXE: a tela fixa enche o palco; cabeçalho/esquerda/cartões dentro (≤830),
//                   esquerda e direita não se sobrepõem, nenhum texto corta. 1846×852 e 780×360. =================
async function larguras() {
  const { chromium } = require('playwright');
  function acharChromium() { try { const base = '/opt/pw-browsers'; const dir = fs.readdirSync(base).filter(x => /^chromium-\d+$/.test(x)).sort().pop(); const bin = path.join(base, dir, 'chrome-linux', 'chrome'); if (fs.existsSync(bin)) return bin; } catch (e) {} return undefined; }
  const distAbs = 'file://' + path.resolve(__dirname, '..', 'dist', 'incursion.html');
  // estado rico: os 4 estados numa tela só (faltam · máximo · subir · sem escada) — o pior caso de conteúdo.
  const RICO = `perfil.deuses={zeus:{copias:1,obtidoEm:0}};contaAtual={nick:'T',ranque:{pontos:60},pontos:{zeus:1},niveis:{zeus:{basico:3,habilidade:4,milagre:1}},perfil:{deuses:{zeus:{copias:1}}},missoes:{ativa:null,progresso:{},liberados:[]}};nlConfirm=null;nlPendente=false;nlMsg=null;nlSelKey=null;ir('niveis',{key:'zeus'},{substituir:true});render();`;
  const CONF = RICO + `document.querySelector('.nlx-dir .nlp [data-subir]').dispatchEvent(new MouseEvent('click',{bubbles:true}));`;
  const browser = await chromium.launch({ executablePath: acharChromium(), headless: true });
  let cf = 0; const ok2 = (c, m) => { if (!c) { cf++; console.log('  XX ' + m); } else console.log('  ok ' + m); };
  for (const [W, H] of [[1846, 852], [780, 360]]) {
    for (const [nome, mk] of [['estados', RICO], ['confirmando', CONF]]) {
      const page = await (await browser.newContext({ viewport: { width: W, height: H } })).newPage();
      await page.goto(distAbs, { waitUntil: 'load' });
      const r = await page.evaluate((mk) => {
        eval(mk); const g = document.getElementById('gsplash'); if (g) g.remove();
        const fix = document.getElementById('nlfix'), fb = fix.getBoundingClientRect();
        const esc = fb.height / 852;
        const pw = fb.width / innerWidth, ph = fb.height / innerHeight;
        const designBot = el => Math.round((el.getBoundingClientRect().bottom - fb.top) / esc);
        // y de design dos containers E de cada cartão (medir os FILHOS: nada pode cair fora da tela)
        let botMax = 0, pior = '';
        const alvos = ['.nlx-cab', '.nlx-esq'];
        fix.querySelectorAll('.nlx-dir .nlp').forEach((el, i) => alvos.push('.nlp#' + i));
        [...fix.querySelectorAll('.nlx-cab,.nlx-esq'), ...fix.querySelectorAll('.nlx-dir .nlp')].forEach((el) => {
          const b = designBot(el); if (b > botMax) { botMax = b; pior = el.className.split(' ')[0]; }
        });
        // sobreposição esquerda × direita
        const le = fix.querySelector('.nlx-esq').getBoundingClientRect(), di = fix.querySelector('.nlx-dir').getBoundingClientRect();
        const overlap = le.right > di.left + 1;
        // overflow horizontal da coluna direita
        const dir = fix.querySelector('.nlx-dir'); const over = dir.scrollWidth - dir.clientWidth;
        // texto cortado em títulos/nomes/rótulos
        let clips = [];
        fix.querySelectorAll('.nlx-titulo,.nltop__ptn,.nltop__cop,.nlmed__nome,.nlid__sub,.nlpas__nome,.nlp__tipo,.nlp__nome,.nlp__nv,.nlp__coll,.nlb,.nlp__confq,.nlp__maxt').forEach(el => { if (el.scrollWidth > el.clientWidth + 1.5) clips.push(el.className.split(' ')[0]); });
        return { pw, ph, botMax, pior, overlap, over, clips: [...new Set(clips)].slice(0, 6) };
      }, mk);
      ok2(Math.min(r.pw, r.ph) >= 0.98, `§350 níveis/${nome} @${W}×${H}: enche a tela (${(r.pw * 100).toFixed(1)}%×${(r.ph * 100).toFixed(1)}%)`);
      ok2(r.botMax <= 832, `§350 níveis/${nome} @${W}×${H}: cabeçalho/esquerda/cartões terminam em y≤830 (pior ${r.botMax} em ${r.pior})`);
      ok2(!r.overlap, `§350 níveis/${nome} @${W}×${H}: esquerda e direita não se sobrepõem`);
      ok2(r.over <= 2, `§350 níveis/${nome} @${W}×${H}: a coluna direita não corta na horizontal (over ${r.over})`);
      ok2(r.clips.length === 0, `§350 níveis/${nome} @${W}×${H}: nenhum texto corta (${r.clips.join(',') || 'ok'})`);
      await page.close();
    }
  }
  await browser.close();
  if (cf || falhas) { console.log(`\n== ${cf} falha(s) de encaixe + ${falhas} jsdom ==`); process.exit(1); }
  console.log('\n== TELA DE NÍVEIS §350 OK (jsdom + Chromium) ==');
  process.exit(0);
}
