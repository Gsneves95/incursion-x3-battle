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
  // §308/§308b: a CAIXA trava em px EXPLÍCITO (762×428) E FORA DO FLUXO (position:absolute). Duas voltas:
  //  §306 travava com aspect-ratio+max-width+flex — o Chromium honrava, a WebView do S24 NÃO (ia edge-to-edge).
  //  §308 pôs width:762px, mas num FLEX-ITEM — o Chromium honrava, o S24 ESTICAVA o flex-item p/ a largura do palco.
  //  §308b tira a caixa do fluxo (absolute): um filho absoluto NÃO é flex-item, nenhum pai consegue esticá-lo — em
  //  QUALQUER motor. Esta guarda (jsdom) crava as três propriedades engine-proof (px, sem aspect-ratio, fora do fluxo);
  //  a varredura Chromium no fim é só higiene de largura e NÃO enxerga o motor da WebView (ver a nota lá).
  const caixa = $('.mapa__caixa');
  const cs = w.getComputedStyle(caixa);
  ok(cs.width === '762px' && cs.height === '428px', `§308: a caixa trava em px explícito 762×428 (é ${cs.width}×${cs.height})`);
  ok(cs.position === 'absolute', `§308b: a caixa fica FORA DO FLUXO (position:absolute) — flex-item o S24 estica; absoluto não (veio "${cs.position}")`);
  ok(!cs.aspectRatio || cs.aspectRatio === 'auto', `§308: a caixa NÃO depende de aspect-ratio (motor da WebView não honra; veio "${cs.aspectRatio}")`);
  ok(Math.abs(762 / 428 - 1524 / 856) < 1e-6, '762×428 é a razão EXATA da arte (1524×856) — cover preenche sem cortar');
  // §309: o gutter é EXTENSÃO da arte (cópia desfocada/escurecida sob a caixa), não faixa preta. Mesmo arquivo já em
  // cache → PESO ZERO (sem 404, sem base64); decorativa (aria-hidden); atrás da caixa (z-index menor).
  const fundo = $('.mapa__fundo');
  ok(!!fundo && fundo.getAttribute('src') === 'banners/mapa.webp', '§309: a extensão do gutter usa o MESMO arquivo (banners/mapa.webp) — peso zero');
  ok(!!fundo && !/^data:/.test(fundo.getAttribute('src') || ''), '§309: a extensão NÃO é base64 (arquivo externo em cache)');
  ok(!!fundo && (fundo.getAttribute('aria-hidden') === 'true'), '§309: a extensão é decorativa (aria-hidden) — não entra na leitura');
  const zF = parseInt(w.getComputedStyle(fundo).zIndex) || 0, zC = parseInt(cs.zIndex) || 0;
  ok(zF < zC, `§309: a extensão fica ATRÁS da caixa nítida (z-index fundo ${zF} < caixa ${zC})`);
  const foraDaArte = [];
  for (const il of $$('.ilha')){
    const x = parseFloat(il.style.left), y = parseFloat(il.style.top);
    // ícone ~62px = ~8,1% da largura (762) e ~14,5% da altura (428); meia-âncora ~4,1%/7,3%.
    // a folga inclui o rótulo que desce → x em [5,95], y em [8,90] mantém ícone+rótulo dentro da arte.
    if (!(x >= 5 && x <= 95 && y >= 8 && y <= 90)) foraDaArte.push(`${il.dataset.dest || il.querySelector('.ilha__nome').textContent}@${x},${y}`);
  }
  ok(foraDaArte.length === 0, `toda ilha ancora dentro da arte [5..95]×[8..90]% (fora: ${foraDaArte.join(' | ')})`);
  // as posições são % (não px): garante independência de largura
  ok($$('.ilha').every(il => /%$/.test(il.style.left) && /%$/.test(il.style.top)), 'as ilhas ancoram em % (independe da largura do palco)');
  console.log('  caixa de proporção travada · 9 âncoras em % dentro da arte');
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
  const LARG = 762, ALT = 428, PISO = 85;
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

if (falhas){ console.log(`\n>>> ${falhas} FALHA(S) em §306/§308 MAPA (jsdom)`); process.exit(1); }
console.log('>>> §306/§308 MAPA (jsdom) OK');

// ================= §308 — VARREDURA DE FAIXA (Chromium), 780..1200 de 10 em 10 =================
// A caixa trava em 1,78 com gutter em TODA a largura, não em 3 pontos (a convenção de escopo do §295).
//
// ⚠ NOTA QUE QUEM LÊ O TESTE PRECISA SABER — o que esta varredura NÃO vê:
// Isto roda no Chromium do Playwright. O bug do Galaxy S24 (o mapa cortando edge-to-edge) era do MOTOR da WebView, que
// não honrava o aspect-ratio+max-width+flex do §306 — e o Chromium travava em TODA a faixa MESMO com aquele CSS frágil.
// Portanto esta varredura NÃO teria pego o bug do aparelho, e NÃO o pega hoje: MEDIR NO CHROMIUM NÃO É MEDIR NO
// APARELHO (§308). Ela é HIGIENE contra regressões de LARGURA. A proteção real contra o motor é a trava em px
// EXPLÍCITO (762×428), cravada na guarda jsdom acima — é a única que independe do engine.
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
  const semLock = [];
  for (let D = 780; D <= 1200; D += 10) {
    await page.setViewportSize({ width: D, height: 428 }); await page.waitForTimeout(12);
    const r = await page.evaluate(() => { const R = el => el.getBoundingClientRect(); const c = R(document.querySelector('.mapa__caixa')), m = R(document.querySelector('.mapa'));
      return { ratio: +(c.width / c.height).toFixed(4), gutter: Math.round((m.width - c.width) / 2) }; });
    if (Math.abs(r.ratio - 1.7804) > 0.005 || r.gutter < 0) semLock.push(`${D}(r${r.ratio} gut${r.gutter})`);
  }
  ok2(semLock.length === 0, `§308: a caixa trava em 1,78 com gutter em TODA a faixa 780..1200 (sem lock em: ${semLock.join(' ') || '—'})`);
  console.log(`  §308 varredura 780..1200/10: ${semLock.length ? ('SEM LOCK em ' + semLock.join(' ')) : 'trava em TODAS (Chromium) — não cobre o motor da WebView, ver nota no teste'}`);
  await browser.close();
  if (cf) { console.log(`\n>>> ${cf} FALHA(S) em §308 MAPA (Chromium)`); process.exit(1); }
  console.log('>>> §306/§308 MAPA OK');
  process.exit(0);
})();
