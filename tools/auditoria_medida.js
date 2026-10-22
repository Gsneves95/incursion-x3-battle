// §358 — módulo compartilhado da MEDIÇÃO de acessibilidade (usado pela ferramenta §357 e pelo teste §358).
// medirNaPagina roda DENTRO da página (via page.evaluate), medindo px REAIS (desconta o transform do enquadramento).
const MIN_CORPO = 12, MIN_ROTULO = 11, MIN_TOQUE = 40;
// lista BRANCA de rolagem: SÓ listas podem rolar (grade de personagens, Provações, Loja, Desafios/Composição).
const SCROLL_OK = ['.col2__grade', '.dm-grade', '.cgrid--pick', '#provfix .pv2-grade', '#provfix .pv2-off',
  '.df-grade', '#compfix .cmp-grade', '.guia-grade', '.loja', '#loja', '.loja-grade'];
const CFG = { MIN_CORPO, MIN_ROTULO, MIN_TOQUE, SCROLL_OK };

function medirNaPagina(cfg){
  const { MIN_CORPO, MIN_ROTULO, MIN_TOQUE, SCROLL_OK } = cfg;
  const vw = window.innerWidth, vh = window.innerHeight;
  const vis = el => {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity < 0.05) return false;
    const r = el.getBoundingClientRect();
    if (r.width < 0.5 || r.height < 0.5) return false;
    if (r.bottom <= 0 || r.top >= vh || r.right <= 0 || r.left >= vw) return false;   // fora do viewport
    return true;
  };
  const escalaDe = el => {                 // escala efetiva (desconta o transform do enquadramento)
    // §358: a escala é lida de um ANCESTRAL LARGO (offsetWidth ≥ 160) p/ o arredondamento inteiro do offsetWidth não
    // falsear a medição de fontes pequenas (um elemento de 24px erra ~2%; um de 400px erra ~0,1%).
    let n = el;
    for (let i = 0; i < 16 && n; i++) { const ow = n.offsetWidth; if (ow >= 160) { const w = n.getBoundingClientRect().width; if (w > 0) return w / ow; } n = n.parentElement; }
    n = el;
    for (let i = 0; i < 16 && n; i++) { const ow = n.offsetWidth; if (ow > 0) { const w = n.getBoundingClientRect().width; if (w > 0) return w / ow; } n = n.parentElement; }
    return 1;
  };
  const sel = el => {
    if (el.id) return '#' + el.id;
    let s = el.tagName.toLowerCase();
    const cls = (el.getAttribute('class') || '').trim().split(/\s+/).filter(Boolean).slice(0, 2);
    if (cls.length) s += '.' + cls.join('.');
    return s;
  };
  const txtDe = el => { let t = ''; el.childNodes.forEach(n => { if (n.nodeType === 3) t += n.textContent; }); return t.replace(/\s+/g, ' ').trim(); };
  const IMPORT = /nome|name|titulo|tit|custo|cost|efeito|efei|rot|desc|label|nick|pts|ponto/i;

  const todos = [...document.querySelectorAll('body *')].filter(e => !/^(SCRIPT|STYLE|NOSCRIPT|TITLE|svg|path|defs|g|use|DEFS)$/i.test(e.tagName));

  // a) TEXTO pequeno
  const a = [];
  for (const el of todos) {
    const t = txtDe(el); if (!t) continue; if (!vis(el)) continue;
    const cs = getComputedStyle(el);
    const fpx = parseFloat(cs.fontSize) || 0; if (!fpx) continue;
    const real = +(fpx * escalaDe(el)).toFixed(2);
    if (real < MIN_CORPO) a.push({ sel: sel(el), txt: t.slice(0, 40), px: real, abaixoRotulo: real < MIN_ROTULO });
  }

  // b) TOQUE pequeno. `cursor:pointer` é HERDADO — para não contar cada <span>/<i> dentro de um botão,
  // só entram: os tags interativos reais E o TOPO de cada região clicável (pointer cujo pai NÃO é pointer).
  const interativo = el => /^(BUTTON|A|INPUT|SELECT|TEXTAREA)$/.test(el.tagName) || el.hasAttribute('onclick') || el.getAttribute('role') === 'button';
  const tapSet = new Set();
  document.querySelectorAll('button,a,input,select,textarea,[role="button"],[onclick]').forEach(e => tapSet.add(e));
  for (const el of todos) {
    if (getComputedStyle(el).cursor !== 'pointer' || interativo(el)) continue;
    const p = el.parentElement;
    if (!p || getComputedStyle(p).cursor !== 'pointer') tapSet.add(el);   // topo da região clicável
  }
  const b = [];
  for (const el of tapSet) {
    if (!vis(el)) continue;
    // não marcar um container que só é "pointer" por herança e contém outro tocável (evita duplo)
    const r = el.getBoundingClientRect();
    const w = +r.width.toFixed(1), h = +r.height.toFixed(1);
    if (w < MIN_TOQUE || h < MIN_TOQUE) b.push({ sel: sel(el), txt: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 30), w, h, min: Math.min(w, h) });
  }

  // c) ROLAGEM proibida (fora da lista branca)
  const okScroll = el => SCROLL_OK.some(s => { try { return el.matches(s) || el.closest(s) === el; } catch (e) { return false; } });
  const c = [];
  for (const el of todos) {
    const cs = getComputedStyle(el);
    const oy = cs.overflowY, ox = cs.overflowX;
    const rolaY = (oy === 'auto' || oy === 'scroll') && el.scrollHeight > el.clientHeight + 2;
    const rolaX = (ox === 'auto' || ox === 'scroll') && el.scrollWidth > el.clientWidth + 2;
    if (!rolaY && !rolaX) continue;
    if (!vis(el)) continue;
    if (okScroll(el)) continue;
    c.push({ sel: sel(el), eixo: rolaY ? 'Y' : 'X', over: rolaY ? (el.scrollHeight - el.clientHeight) : (el.scrollWidth - el.clientWidth), txt: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 30) });
  }

  // d) CORTE: reticências em texto importante OU elemento estourando o viewport
  const d = [];
  for (const el of todos) {
    if (!vis(el)) continue;
    const cs = getComputedStyle(el);
    if (cs.textOverflow === 'ellipsis' && el.scrollWidth > el.clientWidth + 1) {
      const t = (el.textContent || '').replace(/\s+/g, ' ').trim();
      d.push({ tipo: 'ellipsis', sel: sel(el), txt: t.slice(0, 40), importante: IMPORT.test(el.className || '') });
    }
  }
  for (const el of todos) {
    const t = txtDe(el); if (!t) continue;
    const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity < 0.05) continue;
    const r = el.getBoundingClientRect(); if (r.width < 0.5 || r.height < 0.5) continue;
    if (r.right > vw + 2 || r.left < -2 || r.bottom > vh + 2 || r.top < -2) {
      if (r.bottom <= 0 || r.top >= vh || r.right <= 0 || r.left >= vw) continue;   // totalmente fora não conta (não visível)
      d.push({ tipo: 'estoura-viewport', sel: sel(el), txt: t.slice(0, 40), importante: IMPORT.test(el.className || '') });
    }
  }

  // total de textos/tocáveis visíveis (para a nota)
  let textTotal = 0; for (const el of todos) { if (txtDe(el) && vis(el)) textTotal++; }
  let tapTotal = 0; for (const el of tapSet) { if (vis(el)) tapTotal++; }
  return { a, b, c, d, textTotal, tapTotal };
}

function nota(r){
  const aFrac = r.textTotal ? r.a.length / r.textTotal : 0;
  const bFrac = r.tapTotal ? r.b.length / r.tapTotal : 0;
  const textOK = 1 - aFrac, touchOK = 1 - bFrac;
  const scrollOK = r.c.length ? 1 / (1 + r.c.length) : 1;
  const clipPen = Math.min(2, 0.1 * r.d.length);
  let n = 10 * (0.5 * textOK + 0.2 * touchOK + 0.3 * scrollOK) - clipPen;
  return Math.max(0, Math.min(10, +n.toFixed(1)));
}

module.exports = { medirNaPagina, nota, CFG, MIN_CORPO, MIN_ROTULO, MIN_TOQUE, SCROLL_OK };
