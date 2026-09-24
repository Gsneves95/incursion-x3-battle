// §306 — a HOME vira MAPA estático (o carrossel §213 sai; fica de fallback). Guardas BABÁ do
// espaço de estados (§295): o que NÃO pode acontecer na 1ª tela do jogo.
//  1) 9 destinos aparecem e cada um abre O SEU modo (Treino = selecao {novo:true}).
//  2) os 5 contadores mostram DADO REAL (lido do perfil), nunca número escrito no código.
//  3) os 2 "em breve" (Domínios, Loja) NÃO abrem nada e NÃO parecem defeito (nunca vermelho).
//  4) os ícones ancoram em % DA ARTE → nunca saem das ilhas em nenhuma largura (780..1200).
//  5) a arte ausente cai no CARROSSEL de hoje (fallback), sem 404 e sem base64 (o pacote não cresce).
//  6) o espaçamento das ilhas: nenhum par colado (< ~85px de design) na mesma faixa horizontal.
//  7) a referência MENTE (§305): sem barra de nível, sem envelope, sem sino; apelido + faixa; moeda pt-BR.
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const html = fs.readFileSync(path.join(__dirname, '../dist/incursion.html'), 'utf8');

let falhas = 0;
const ok = (c, m) => { if (!c) { console.log('  FALHA: ' + m); falhas++; } };

const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://x/' });
const w = dom.window, d = w.document;
const $ = s => d.querySelector(s), $$ = s => [...d.querySelectorAll(s)];
const home = () => w.eval("perfil=novoPerfil(0,0); ir('home',{},{substituir:true}); render();");

console.log('== §306 MAPA — 1) 9 destinos, cada um abre o seu modo ==');
{
  home();
  ok(!!$('.mapa') && !$('.hscroll'), 'a home é o MAPA (não o carrossel): .mapa presente, .hscroll ausente');
  ok($$('.ilha').length === 9, `9 ilhas no mapa (tem ${$$('.ilha').length})`);
  // rota esperada por destino (a fonte é data/mapa.json; Treino = selecao com novo:true)
  const espera = { campanha: 'campanha', provacoes: 'provacoes', desafios: 'desafios', invocacao: 'invocacao', colecao: 'colecao', treino: 'selecao', pvp: 'pvp' };
  for (const chave of Object.keys(espera)){
    home();
    const b = $(`.ilha[data-dest="${chave}"]`);
    ok(!!b, `a ilha ${chave} existe e é clicável`);
    if (!b) continue;
    b.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
    const r = w.eval('rotaAtual()');
    ok(r === espera[chave], `${chave} deveria abrir "${espera[chave]}" (abriu "${r}")`);
    if (chave === 'treino') ok(w.eval('!!paramsAtuais().novo'), 'Treino abre a seleção com novo:true (nova investida)');
  }
  console.log('  9 ilhas · 7 navegam para o modo certo · Treino=selecao{novo:true}');
}

console.log('== §306 MAPA — 2) os 5 contadores mostram DADO REAL do perfil (não escrito no código) ==');
{
  // dado A: perfil sem deuses (novoPerfil concede os iniciais; zeramos p/ ver o contador em 0)
  w.eval("perfil=novoPerfil(0,0); perfil.deuses={}; perfil.invocacao.desdeUltimoSS=0; ir('home',{},{substituir:true}); render();");
  const contDe = ch => { const el = $(`.ilha[data-dest="${ch}"] .ilha__cont`); return el ? el.textContent.trim() : null; };
  const colVazio = contDe('colecao');
  ok(colVazio === '0/100', `Coleção vazia deveria ser 0/100 (é "${colVazio}")`);
  const invVazio = contDe('invocacao');
  const duro = w.eval("(ECONOMIA.invocacao&&ECONOMIA.invocacao.pity&&ECONOMIA.invocacao.pity.duro)||0");
  ok(invVazio === `0/${duro}`, `Invocação vazia deveria ser 0/${duro} (é "${invVazio}")`);
  // dado B: perfil mexido — os contadores acompanham (prova que LEEM o estado)
  w.eval("perfil=novoPerfil(0,0); perfil.deuses={}; ['zeus','thor','ra'].forEach(k=>perfil.deuses[k]={copias:1,favorito:false,obtidoEm:0}); perfil.invocacao.desdeUltimoSS=17; perfil.campanha.concluidas=[CAMPANHA.encontros[0].id]; ir('home',{},{substituir:true}); render();");
  ok(contDe('colecao') === '3/100', `Coleção com 3 deuses deveria ser 3/100 (é "${contDe('colecao')}")`);
  ok(contDe('invocacao') === `17/${duro}`, `Invocação com pity 17 deveria ser 17/${duro} (é "${contDe('invocacao')}")`);
  const campNum = $('.ilha[data-dest="campanha"] .ilha__campnum');
  ok(campNum && /^1\//.test(campNum.textContent), `Campanha com 1 feito deveria começar "1/" (é "${campNum ? campNum.textContent : 'nada'}")`);
  const barra = $('.ilha[data-dest="campanha"] .ilha__barra > i');
  const total = w.eval('CAMPANHA.encontros.length');
  ok(barra && barra.style.width === Math.round(1 / total * 100) + '%', `a barra da Campanha reflete 1/${total} (é "${barra ? barra.style.width : 'nada'}")`);
  // Desafios = acervo de pergaminhos (o número vem do dado, não de um literal)
  const desTxt = contDe('desafios'), acervo = w.eval('acervoPergaminhos().length');
  ok(desTxt === String(acervo), `Desafios deveria mostrar o acervo (${acervo}), é "${desTxt}"`);
  // exatamente 5 ilhas têm contador (Campanha, Provações, Desafios, Invocação, Coleção)
  const comContador = $$('.ilha[data-dest]').filter(x => x.querySelector('.ilha__cont')).map(x => x.dataset.dest).sort().join(',');
  ok(comContador === 'campanha,colecao,desafios,invocacao,provacoes', `5 contadores nas ilhas certas (achei: ${comContador})`);
  console.log(`  contadores leem o perfil: coleção 0→3/100, pity 0→17/${duro}, campanha 0→1 + barra, desafios=${acervo}`);
}

console.log('== §306 MAPA — 3) os 2 "em breve" não abrem e não parecem defeito (nunca vermelho) ==');
{
  home();
  const breve = $$('.ilha--breve');
  ok(breve.length === 2, `2 ilhas "em breve" (tem ${breve.length})`);
  const nomes = breve.map(x => x.querySelector('.ilha__nome').textContent).sort().join(',');
  ok(nomes === 'Domínios,Loja', `as "em breve" são Domínios e Loja (achei: ${nomes})`);
  ok(breve.every(x => x.tagName === 'DIV' && !x.hasAttribute('data-dest')), 'as "em breve" são <div> sem data-dest (não focam, não navegam)');
  ok(breve.every(x => !!x.querySelector('.ilha__breveTag')), 'cada "em breve" tem a tag · em breve');
  // NUNCA vermelho: a cor da tag não pode ser um vermelho de erro
  const vermelhas = breve.filter(x => { const c = w.getComputedStyle(x.querySelector('.ilha__breveTag')).color || ''; return /\bred\b|crimson/i.test(c) || /rgb\(\s*(1[89]\d|2\d\d)\s*,\s*([0-5]?\d)\s*,/.test(c); });
  ok(vermelhas.length === 0, 'a tag "em breve" NUNCA é vermelha (§306: indisponível, não defeito)');
  // clicar numa "em breve" não muda a rota
  w.eval("ir('home',{},{substituir:true}); render();");
  breve[0].dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  ok(w.eval('rotaAtual()') === 'home', 'clicar numa "em breve" NÃO navega (fica na home)');
  console.log('  Domínios + Loja: <div> inertes, tag apagada (não vermelha), clique não navega');
}

console.log('== §306 MAPA — 4) ícones ancorados em % DA ARTE → nunca saem das ilhas (780..1200) ==');
{
  home();
  // §310: a arte MUDOU (2400×999, 2,40; era 1524×856, 1,78) e a caixa DEIXOU de ser travada em 1,78 — a arte agora
  //  PREENCHE o palco. A caixa tem a ALTURA do palco (428) e a LARGURA natural da arte a essa altura (≈1028px), fora do
  //  fluxo (absolute). Mantém a lição do §308b: px EXPLÍCITO + FORA DO FLUXO (um filho absoluto não é flex-item, o motor
  //  do S24 não estica). O que corta as laterais no piso é o overflow:hidden da .mapa, não uma trava de proporção.
  const caixa = $('.mapa__caixa');
  const cs = w.getComputedStyle(caixa);
  ok(cs.width === '1028px' && cs.height === '428px', `§310: a caixa é px explícito 1028×428 — altura do palco × largura natural da arte (é ${cs.width}×${cs.height})`);
  ok(cs.position === 'absolute', `§308b/§310: a caixa fica FORA DO FLUXO (position:absolute) — flex-item o S24 estica; absoluto não (veio "${cs.position}")`);
  ok(!cs.aspectRatio || cs.aspectRatio === 'auto', `§308/§310: a caixa NÃO depende de aspect-ratio (motor da WebView não honra; veio "${cs.aspectRatio}")`);
  ok(Math.abs(1028 / 428 - 2400 / 999) < 0.001, `§310: a razão da caixa (1028/428=${(1028/428).toFixed(4)}) casa a arte nova (2400/999=${(2400/999).toFixed(4)}) — cover preenche sem corte perceptível`);
  // §309b/§310: a EXTENSÃO desfocada continua (agora reserva p/ palco > 2,40). Mesmo arquivo em cache → PESO ZERO (sem
  // 404, sem base64); decorativa (aria-hidden); atrás da caixa nítida (z-index menor).
  const fundo = $('.mapa__fundo');
  ok(!!fundo && fundo.getAttribute('src') === 'banners/mapa.webp', '§309/§310: a extensão usa o MESMO arquivo (banners/mapa.webp) — peso zero');
  ok(!!fundo && !/^data:/.test(fundo.getAttribute('src') || ''), '§309: a extensão NÃO é base64 (arquivo externo em cache)');
  ok(!!fundo && (fundo.getAttribute('aria-hidden') === 'true'), '§309: a extensão é decorativa (aria-hidden) — não entra na leitura');
  const zF = parseInt(w.getComputedStyle(fundo).zIndex) || 0, zC = parseInt(cs.zIndex) || 0;
  ok(zF < zC, `§309: a extensão fica ATRÁS da caixa nítida (z-index fundo ${zF} < caixa ${zC})`);
  // §310: com a arte PREENCHENDO (caixa 1028 centrada, overflow corta), todo ÍCONE (62px) fica INTEIRO no quadro em
  //  780/893/1075/1200 — inclusive no PISO (780, corte 24%: janela visível 12,1%..87,9%). Cálculo analítico (o mesmo do
  //  motor: caixa 1028 centrada em cada largura, meia-âncora do ícone 24px = 48/2 §311).
  const ART_W = 2400, ART_H = 999, CX = 428 * ART_W / ART_H, MEIA = 24;   // §311: ícone 62→48 → meia-âncora 31→24
  const larguras = [780, 893, 1075, 1200];
  const ilhas310 = $$('.ilha').map(il => ({ c: il.dataset.dest || il.querySelector('.ilha__nome').textContent, x: parseFloat(il.style.left) }));
  const foraQuadro = [];
  for (const S of larguras) {
    const left = (S - CX) / 2;
    for (const it of ilhas310) {
      const cxStage = left + it.x / 100 * CX;
      if (cxStage - MEIA < 0 || cxStage + MEIA > S) foraQuadro.push(`${it.c}@${it.x}% (${S}px)`);
    }
  }
  ok(foraQuadro.length === 0, `§310/§311: todo ícone (48px) fica INTEIRO no quadro em 780/893/1075/1200 (fora: ${foraQuadro.join(' | ')})`);
  // as posições são % (não px): garante independência de largura
  ok($$('.ilha').every(il => /%$/.test(il.style.left) && /%$/.test(il.style.top)), 'as ilhas ancoram em % (independe da largura do palco)');
  // §311: ÍCONE 62→48px de design. A 48 dá ~40 físicos no S24 (escala ~0,84), acima do piso de toque do projeto (28–34,
  // §301); e o alvo de toque real é a .ilha inteira (100px), não só o glifo. A guarda crava que o glifo não encolheu
  // abaixo do alvo (44–52px) — quebra se alguém voltar a 62 (tapa a ilha) ou encolher demais (perde o toque).
  const icW = parseFloat(w.getComputedStyle($('.ilha__ic')).width);
  ok(icW >= 44 && icW <= 52, `§311: o ícone mede ~48px de design (é ${icW}px) — ~40 físicos no S24, acima do piso de toque 28–34`);
  console.log(`  arte preenche o palco (caixa 1028×428) · ícone 48px · 9 ícones inteiros no quadro em ${larguras.join('/')}`);
}

console.log('== §306 MAPA — 5) arte ausente → carrossel de hoje (fallback), sem 404 nem base64 ==');
{
  const dirB = path.join(__dirname, '../web/banners');
  w.eval("perfil=novoPerfil(0,0); ir('home',{},{substituir:true}); renderHomeCarrossel();");
  const cards = $$('.bcard');
  ok(cards.length === 9, `o fallback (carrossel) tem 9 cartões (tem ${cards.length})`);
  const base64 = [], semArq = [];
  for (const c of cards){
    if (c.querySelector('.bcard__ph')) continue;   // Domínios placeholder (§274)
    const img = c.querySelector('img.bcard__art'); const src = img ? (img.getAttribute('src') || '') : '';
    if (/^data:/.test(src)) base64.push(src.slice(0, 24));
    const m = /^banners\/(.+\.webp)$/.exec(src);
    if (!m || !fs.existsSync(path.join(dirB, m[1]))) semArq.push(src || 'sem <img>');
  }
  ok(base64.length === 0, `o fallback não usa base64 (achei: ${base64.join(' | ')})`);
  ok(semArq.length === 0, `todo banner do fallback aponta arquivo existente (falhas: ${semArq.join(' | ')})`);
  // pacote não cresce: a arte do mapa é ARQUIVO externo (nenhuma referência base64 a mapa/ ou banners/mapa)
  ok(!/data:image\/[^;]+;base64[^"']*mapa/.test(html), 'a arte do mapa NÃO é base64 (arquivo externo, o pacote não cresce)');
  ok(/src="banners\/mapa\.webp"/.test(html) || /banners\/mapa\.webp/.test(html), 'a arte do mapa é referência a arquivo (banners/mapa.webp)');
  console.log('  fallback do carrossel intacto · 0 base64 · arte do mapa é arquivo externo');
}

console.log('== §306 MAPA — 6) espaçamento das ilhas: nenhum par colado (< ~85px) na mesma faixa ==');
{
  const LARG = 1028, ALT = 428, PISO = 85;   // §310: a caixa passou a ter a largura natural da arte nova (≈1028px)
  const il = w.eval('JSON.stringify(MAPA.ilhas.map(i=>({c:i.chave,x:i.x,y:i.y})))');
  const arr = JSON.parse(il);
  let pior = Infinity, piorPar = '';
  for (let a = 0; a < arr.length; a++) for (let b = a + 1; b < arr.length; b++){
    const dyDes = Math.abs(arr[a].y - arr[b].y) / 100 * ALT;
    if (dyDes >= 60) continue;   // faixas verticais distintas: os rótulos não competem
    const dxDes = Math.abs(arr[a].x - arr[b].x) / 100 * LARG;
    if (dxDes < pior){ pior = dxDes; piorPar = `${arr[a].c}↔${arr[b].c}`; }
  }
  ok(pior >= PISO, `o par mais próximo na horizontal deveria ficar ≥${PISO}px de design (é ${pior.toFixed(0)}px em ${piorPar})`);
  console.log(`  par mais próximo na mesma faixa: ${piorPar} a ${pior.toFixed(0)}px de design (piso ${PISO})`);
}

console.log('== §306 MAPA — 7) a referência MENTE (§305): sem nível/envelope/sino; apelido+faixa; moeda pt-BR ==');
{
  home();
  const topo = $('.mapa__topo');
  ok(!!topo && !!topo.querySelector('.mperfil') && !!topo.querySelector('.mmoedas'), 'o topo tem o chip de perfil e as moedas');
  // SEM barra de nível: nenhuma barra de progresso dentro do chip de perfil (§305: não há nível de conta)
  ok(!topo.querySelector('.mperfil .ilha__barra, .mperfil .bcard__barra, .mperfil progress, .mperfil .timer'), 'o chip de perfil NÃO tem barra de nível (§305)');
  // SEM envelope, SEM sino: nenhum desses glifos no topo (flag u — senão os surrogates colidem com 💎)
  ok(!/[✉\u{1F514}\u{1F4E9}\u{1F6CE}\u{1F515}]/u.test(topo.textContent), 'o topo NÃO tem envelope nem sino (§305: não há correio nem notificação)');
  // apelido presente (offline = "Jogador"); a faixa aparece só online (aqui, offline, não engana com faixa fake)
  ok($('.mperfil__nick').textContent.trim().length > 0, 'o chip mostra o apelido');
  ok(!$('.mperfil__faixa'), 'offline NÃO inventa faixa de ranque (§305: faixa só com conta)');
  // moeda no formato pt-BR (toLocaleString): milhar com ponto, sem "K"
  w.eval("perfil=novoPerfil(0,0); perfil.moedas.gema=2450; perfil.moedas.essencia=12360; ir('home',{},{substituir:true}); render();");
  const moedas = $$('.mmoeda b').map(x => x.textContent);
  ok(moedas.includes('2.450'), `a gema 2450 deveria ler "2.450" em pt-BR (achei: ${moedas.join(' / ')})`);
  ok(moedas.includes('12.360'), `a essência 12360 deveria ler "12.360" em pt-BR (achei: ${moedas.join(' / ')})`);
  ok(!moedas.some(m => /K/i.test(m)), 'a moeda NÃO usa abreviação "K" (§305)');
  console.log(`  sem nível/envelope/sino · apelido="${$('.mperfil__nick').textContent}" · moedas ${moedas.join(' / ')} (pt-BR)`);
}

if (falhas){ console.log(`\n>>> ${falhas} FALHA(S) em §306/§310 MAPA (jsdom)`); process.exit(1); }
console.log('>>> §306/§310 MAPA (jsdom) OK');

// ================= §310 — VARREDURA DE FAIXA (Chromium), 780..1200 de 10 em 10 =================
// A arte PREENCHE o palco: a caixa mantém a razão da arte (2,40) e FILL VERTICAL (altura da caixa == altura da .mapa,
// sem letterbox em cima/baixo), e TODO ícone fica inteiro no quadro em toda a faixa. Mede o RECT REAL de cada .ilha__ic.
//
// ⚠ NOTA QUE QUEM LÊ O TESTE PRECISA SABER — o que esta varredura NÃO vê:
// Isto roda no Chromium do Playwright. O bug do Galaxy S24 (o mapa cortando edge-to-edge, §308) era do MOTOR da WebView,
// que não honrava o CSS frágil do §306 — e o Chromium não reproduzia. MEDIR NO CHROMIUM NÃO É MEDIR NO APARELHO (§308).
// Esta varredura é HIGIENE contra regressões de LARGURA/enquadramento. A proteção real contra o motor é a caixa em px
// EXPLÍCITO (1028×428) e FORA DO FLUXO, cravada na guarda jsdom acima — é a única que independe do engine.
(async () => {
  let cf = 0; const ok2 = (c, m) => { if (!c) { cf++; console.log('  XX ' + m); } };
  const { chromium } = require('playwright');
  const distAbs = path.resolve(__dirname, '..', 'dist', 'incursion.html');
  function acharChromium() {
    try { const base = '/opt/pw-browsers'; const dir = fs.readdirSync(base).filter(d => /^chromium-\d+$/.test(d)).sort().pop();
      if (dir) { const bin = path.join(base, dir, 'chrome-linux', 'chrome'); if (fs.existsSync(bin)) return bin; } } catch (e) {}
    return undefined;
  }
  const browser = await chromium.launch({ executablePath: acharChromium(), headless: true });
  const page = await (await browser.newContext({ viewport: { width: 900, height: 428 }, deviceScaleFactor: 2 })).newPage();
  await page.goto('file://' + distAbs, { waitUntil: 'load' });
  await page.evaluate(() => { perfil = novoPerfil(0, 0); ir('home', {}, { substituir: true }); render(); });
  const semFill = [], iconeFora = [], colide = [];
  for (let D = 780; D <= 1200; D += 10) {
    await page.setViewportSize({ width: D, height: 428 }); await page.waitForTimeout(12);
    const r = await page.evaluate(() => {
      const R = el => el.getBoundingClientRect();
      const c = R(document.querySelector('.mapa__caixa')), m = R(document.querySelector('.mapa'));
      // cada ícone: fora do quadro se ultrapassar as bordas da .mapa (que tem overflow:hidden — é o quadro real)
      const fora = [];
      // §311: dois alvos de toque colados fazem o dedo errar — nenhum ÍCONE pode encostar no painel JOGADOR nem nas moedas
      const inter = (a, b) => !(a.right <= b.left || a.left >= b.right || a.bottom <= b.top || a.top >= b.bottom);
      const perfil = document.querySelector('.mperfil'), moedas = document.querySelector('.mmoedas');
      const rp = perfil && R(perfil), rmo = moedas && R(moedas);
      const bate = [];
      for (const ic of document.querySelectorAll('.ilha .ilha__ic')) {
        const b = R(ic);
        if (b.left < m.left - 0.5 || b.right > m.right + 0.5) fora.push((ic.closest('.ilha').dataset.dest) || 'ilha');
        const nome = (ic.closest('.ilha').dataset.dest) || 'ilha';
        if (rp && inter(b, rp)) bate.push(nome + '↔JOGADOR');
        if (rmo && inter(b, rmo)) bate.push(nome + '↔moedas');
      }
      // fill vertical = a caixa COBRE a altura do quadro (.mapa), sem faixa em cima/baixo (pode transbordar ~1px pela borda do palco)
      return { ratio: +(c.width / c.height).toFixed(4), fillV: c.height >= m.height - 0.5, fora, bate };
    });
    if (Math.abs(r.ratio - 2.4024) > 0.01 || !r.fillV) semFill.push(`${D}(r${r.ratio} fillV${r.fillV})`);
    if (r.fora.length) iconeFora.push(`${D}:${[...new Set(r.fora)].join(',')}`);
    if (r.bate.length) colide.push(`${D}:${[...new Set(r.bate)].join(',')}`);
  }
  ok2(semFill.length === 0, `§310: a arte PREENCHE (razão 2,40 + fill vertical) em TODA a faixa 780..1200 (falhou em: ${semFill.join(' ') || '—'})`);
  ok2(iconeFora.length === 0, `§310: todo ícone fica INTEIRO no quadro em TODA a faixa 780..1200 (ícone fora em: ${iconeFora.join(' ') || '—'})`);
  ok2(colide.length === 0, `§311: nenhum ícone colide com o painel JOGADOR nem com as moedas em 780..1200 (colisão em: ${colide.join(' ') || '—'})`);
  console.log(`  §310/§311 varredura 780..1200/10: ${(semFill.length || iconeFora.length || colide.length) ? ('FALHAS ' + [...semFill, ...iconeFora, ...colide].join(' ')) : 'arte preenche + 9 ícones inteiros + sem colisão com JOGADOR/moedas em TODAS (Chromium) — não cobre o motor da WebView, ver nota'}`);
  await browser.close();
  if (cf) { console.log(`\n>>> ${cf} FALHA(S) em §310 MAPA (Chromium)`); process.exit(1); }
  console.log('>>> §306/§310 MAPA OK');
  process.exit(0);
})();
