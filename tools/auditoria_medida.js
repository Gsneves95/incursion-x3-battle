// §358 — módulo compartilhado da MEDIÇÃO de acessibilidade (usado pela ferramenta §357 e pelo teste §358).
// medirNaPagina roda DENTRO da página (via page.evaluate), medindo px REAIS (desconta o transform do enquadramento).
const MIN_CORPO = 12, MIN_ROTULO = 11, MIN_TOQUE = 40;
// lista BRANCA de rolagem: SÓ listas podem rolar (grade de personagens, Provações, Loja, Desafios/Composição).
const SCROLL_OK = ['.col2__grade', '.dm-grade', '.cgrid--pick', '#provfix .pv2-grade', '#provfix .pv2-off',
  '.df-grade', '#compfix .cmp-grade', '.guia-grade', '.loja-grade'];
// §371b: SÓ a grade de GEMAS (.loja-grade) rola na Loja. Tirados '.loja'/'#loja' — como o d7/d5 usam closest(), eles
// isentavam a TELA INTEIRA da Loja da checagem de "fora da tela" (foi por isso que o dia 30 do passe, empurrado para
// fora pela célula de 2 colunas, não foi acusado). A grade do passe NÃO é rolável (10×3 fixa) → agora o d7 a guarda.
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
    for (let i = 0; i < 16 && n; i++) { const ow = n.offsetWidth; if (ow >= 400) { const w = n.getBoundingClientRect().width; if (w > 0) return w / ow; } n = n.parentElement; }
    n = el;
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

  const _tagOK = e => !/^(SCRIPT|STYLE|NOSCRIPT|TITLE|svg|path|defs|g|use|DEFS)$/i.test(e.tagName);
  // §359: se há uma CAMADA MODAL aberta (um scrim que cobre a tela com fundo semiopaco — painel de kit, fila do PvP,
  // "MAIS FILTROS", troca da campanha), mede-se SÓ essa camada: o que está atrás está inerte e encoberto de propósito
  // (senão o d6 acusaria todo o fundo como "encoberto" pelo scrim). O canvas base não conta (o fundo dele é um
  // gradiente em background-image, não um background-color com alfa).
  const _cobreTudo = el => { const r = el.getBoundingClientRect(); return r.width * r.height >= 0.9 * vw * vh && r.left <= 2 && r.top <= 2 && r.right >= vw - 2 && r.bottom >= vh - 2; };
  const _bgAlpha = el => { const m = (getComputedStyle(el).backgroundColor || '').match(/rgba?\(([^)]+)\)/); if (!m) return 0; const p = m[1].split(',').map(s => parseFloat(s)); return p.length >= 4 ? p[3] : 1; };
  let _modal = null;
  for (const el of document.querySelectorAll('body *')) { if (_tagOK(el) && vis(el) && _cobreTudo(el) && _bgAlpha(el) >= 0.3) _modal = el; }   // o ÚLTIMO em ordem de DOM = o topo
  const _raiz = _modal || document;
  const todos = (_modal ? [_modal, ...(_modal.querySelectorAll('*'))] : [...document.querySelectorAll('body *')]).filter(_tagOK);

  // a) TEXTO pequeno
  // §355: TEXTO SVG (<text> dentro de uma carta vetorial, ex.: o nome do deus na revelação) escala pelo viewBox, não pelo
  // transform do enquadramento — `escalaDe` (offsetWidth dos ancestrais HTML) não enxerga esse encolhimento e daria o
  // tamanho de DESIGN. Para esses, o tamanho REAL na tela = font-size × a escala do getScreenCTM (viewBox + transforms
  // até a tela). Fecha o ponto cego dos nomes minúsculos das cartas.
  const a = [];
  for (const el of todos) {
    const t = txtDe(el); if (!t) continue; if (!vis(el)) continue;
    const cs = getComputedStyle(el);
    const fpx = parseFloat(cs.fontSize) || 0; if (!fpx) continue;
    let real;
    if (el.ownerSVGElement && typeof el.getScreenCTM === 'function') {
      const m = el.getScreenCTM();
      const sc = m ? Math.sqrt(Math.abs(m.a * m.d - m.b * m.c)) : 1;   // escala uniforme (área) do user-unit até o px de tela
      real = +(fpx * sc).toFixed(2);
    } else {
      real = +(fpx * escalaDe(el)).toFixed(2);
    }
    if (real < MIN_CORPO) a.push({ sel: sel(el), txt: t.slice(0, 40), px: real, abaixoRotulo: real < MIN_ROTULO });
  }

  // b) TOQUE pequeno. `cursor:pointer` é HERDADO — para não contar cada <span>/<i> dentro de um botão,
  // só entram: os tags interativos reais E o TOPO de cada região clicável (pointer cujo pai NÃO é pointer).
  const interativo = el => /^(BUTTON|A|INPUT|SELECT|TEXTAREA)$/.test(el.tagName) || el.hasAttribute('onclick') || el.getAttribute('role') === 'button';
  const tapSet = new Set();
  _raiz.querySelectorAll('button,a,input,select,textarea,[role="button"],[onclick]').forEach(e => tapSet.add(e));
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

  // d) CORTE / SOBREPOSIÇÃO. §358b: além da reticência, pega TEXTO CORTADO SEM reticência (a própria caixa ou um
  // ancestral com overflow:hidden/clip recorta o conteúdo) e TEXTO SOBRE TEXTO (duas folhas de texto se cruzam).
  // Exceção: line-clamp DE PROPÓSITO em texto secundário, marcado com data-clamp="ok" (lista no guia-visual §358b).
  const d = [];
  // folhas de texto visíveis, com rect em cache (reusadas por vários checks)
  const folhas = [];
  for (const el of todos) { const t = txtDe(el); if (!t || !vis(el)) continue; folhas.push({ el, t, r: el.getBoundingClientRect() }); }
  const clampOk = el => { let n = el; for (let i = 0; i < 5 && n && n.getAttribute; i++) { if (n.getAttribute('data-clamp') === 'ok') return true; n = n.parentElement; } return false; };
  const temClip = cs => cs.overflowX === 'hidden' || cs.overflowX === 'clip' || cs.overflowY === 'hidden' || cs.overflowY === 'clip';
  // §358b: conteúdo DENTRO de uma lista rolável da lista branca (SCROLL_OK) pode passar da dobra — é rolagem esperada,
  // não corte. d3 (sai da caixa do ancestral) e d5 (estoura viewport) NÃO valem p/ ele; corte de item (d1/d2) e
  // sobreposição (d4) continuam valendo. (Rolagem FORA da lista branca já cai no eixo c.)
  const dentroScrollOk = el => SCROLL_OK.some(s => { try { return !!el.closest(s); } catch (e) { return false; } });

  // d1) RETICÊNCIAS (mantido): text-overflow:ellipsis truncando
  for (const el of todos) {
    if (!vis(el)) continue;
    const cs = getComputedStyle(el);
    if (cs.textOverflow === 'ellipsis' && el.scrollWidth > el.clientWidth + 1) {
      const t = (el.textContent || '').replace(/\s+/g, ' ').trim();
      d.push({ tipo: 'ellipsis', sel: sel(el), txt: t.slice(0, 40), importante: IMPORT.test(el.className || '') });
    }
  }
  // d2) TEXTO CORTADO SEM reticência: a PRÓPRIA caixa recorta (overflow hidden/clip) e o conteúdo excede. A tolerância
  // VERTICAL é ~meia linha (o ink-box de uma fonte com line-height < 1 excede o line-box por alguns px sem cortar
  // glifo nenhum — só conta como corte quando some uma fração real de LINHA); a horizontal é estrita (1px).
  for (const f of folhas) {
    const el = f.el, cs = getComputedStyle(el);
    if (cs.textOverflow === 'ellipsis') continue;            // já em d1
    const lh = parseFloat(cs.lineHeight) || (parseFloat(cs.fontSize) * 1.2) || 16;
    const tolY = Math.max(4, lh * 0.5);
    const clipX = (cs.overflowX === 'hidden' || cs.overflowX === 'clip') && el.scrollWidth > el.clientWidth + 1;
    const clipY = (cs.overflowY === 'hidden' || cs.overflowY === 'clip') && el.scrollHeight > el.clientHeight + tolY;
    if ((clipX || clipY) && !clampOk(el)) d.push({ tipo: 'corte', sel: sel(el), txt: f.t.slice(0, 40), importante: true });
  }
  // d3) TEXTO que SAI da caixa do ANCESTRAL que o recorta (cortado por overflow do pai)
  for (const f of folhas) {
    if (clampOk(f.el) || dentroScrollOk(f.el)) continue;
    let n = f.el.parentElement;
    for (let i = 0; i < 12 && n && n !== document.body; i++) {
      const cs = getComputedStyle(n);
      if (temClip(cs)) {
        const ar = n.getBoundingClientRect();
        if (f.r.right > ar.right + 1 || f.r.left < ar.left - 1 || f.r.bottom > ar.bottom + 1 || f.r.top < ar.top - 1) {
          d.push({ tipo: 'corte-ancestral', sel: sel(f.el), txt: f.t.slice(0, 40), importante: true, por: sel(n) }); break;
        }
      }
      n = n.parentElement;
    }
  }
  // d4) TEXTO SOBRE TEXTO: duas folhas de texto se cruzam > 2px nos DOIS eixos, sem uma conter a outra (nem ser ancestral)
  const contem = (A, B) => A.left <= B.left + 1 && A.top <= B.top + 1 && A.right >= B.right - 1 && A.bottom >= B.bottom - 1;
  for (let i = 0; i < folhas.length; i++) for (let j = i + 1; j < folhas.length; j++) {
    const A = folhas[i].r, B = folhas[j].r;
    const ox = Math.min(A.right, B.right) - Math.max(A.left, B.left);
    const oy = Math.min(A.bottom, B.bottom) - Math.max(A.top, B.top);
    if (ox > 2 && oy > 2 && !contem(A, B) && !contem(B, A)
      && !folhas[i].el.contains(folhas[j].el) && !folhas[j].el.contains(folhas[i].el)
      && dentroScrollOk(folhas[i].el) === dentroScrollOk(folhas[j].el)) {   // §359: conteúdo de lista rolável recortado na borda não "sobrepõe" vizinhos de fora da lista
      d.push({ tipo: 'sobreposto', sel: sel(folhas[i].el) + ' × ' + sel(folhas[j].el), txt: folhas[i].t.slice(0, 18) + ' / ' + folhas[j].t.slice(0, 18), importante: true });
    }
  }
  // d5) ESTOURA-VIEWPORT (mantido): texto visível além da tela
  for (const f of folhas) {
    if (dentroScrollOk(f.el)) continue;
    const r = f.r;
    if (r.right > vw + 2 || r.left < -2 || r.bottom > vh + 2 || r.top < -2) {
      if (r.bottom <= 0 || r.top >= vh || r.right <= 0 || r.left >= vw) continue;
      d.push({ tipo: 'estoura-viewport', sel: sel(f.el), txt: f.t.slice(0, 40), importante: IMPORT.test(f.el.className || '') });
    }
  }

  // d6) TEXTO ENCOBERTO (§359): o PONTO CENTRAL de cada PALAVRA do texto não "pertence" ao próprio elemento (nem a um
  // ancestral/descendente) em document.elementFromPoint — ou seja, OUTRA caixa está desenhada por cima (mesmo sem os
  // TEXTOS se cruzarem; pega o título coberto pela borda do quadro vizinho, que o centro-da-LINHA deixava passar).
  // Mede palavra a palavra com um Range sobre os nós de texto DIRETOS da folha. Scrims decorativos com
  // pointer-events:none NÃO entram (elementFromPoint os ignora), de propósito: só caixa de verdade sobre o texto conta.
  for (const f of folhas) {
    if (clampOk(f.el) || dentroScrollOk(f.el)) continue;
    let coberto = null;
    for (const ch of f.el.childNodes) {
      if (coberto) break;
      if (ch.nodeType !== 3) continue;                   // só os nós de texto diretos (o resto é outra folha)
      const s = ch.textContent; const re = /\S+/g; let m;
      while ((m = re.exec(s))) {
        const rg = document.createRange(); rg.setStart(ch, m.index); rg.setEnd(ch, m.index + m[0].length);
        const qs = rg.getClientRects();
        for (const rc of qs) {
          if (rc.width < 2 || rc.height < 2) continue;
          const cy = rc.top + rc.height / 2;
          // amostra 3 pontos ao longo da palavra (incl. o CENTRO) — uma palavra longa coberta só numa ponta também conta.
          for (const fx of [0.15, 0.5, 0.85]) {
            const cx = rc.left + rc.width * fx;
            if (cx < 1 || cy < 1 || cx > vw - 1 || cy > vh - 1) continue;
            const top = document.elementFromPoint(cx, cy);
            if (!top || top === f.el || f.el.contains(top) || top.contains(f.el)) continue;
            coberto = top; break;
          }
          if (coberto) break;
        }
        if (coberto) break;
      }
    }
    if (coberto) d.push({ tipo: 'encoberto', sel: sel(f.el), txt: f.t.slice(0, 40), importante: true, por: sel(coberto) });
  }

  // d7) §366 — CONTEÚDO FORA DA TELA (o ponto cego do §365). Os checks acima só olham elementos VISÍVEIS (vis()); mas
  // conteúdo empurrado para FORA do canvas (abaixo dos 360, ou além da largura) e escondido pelo overflow:hidden de um
  // ancestral NÃO é "visível" — passava batido (no §365 escondia a coluna da direita do hub e os cartões de prêmio).
  // Acusa QUALQUER elemento COM CONTEÚDO (texto direto, imagem, botão/tocável) cuja caixa esteja, total ou parcialmente,
  // fora do viewport OU da área de um ancestral que o recorta. Exceção: conteúdo das listas roláveis (passar da dobra é
  // rolagem). NÃO depende de vis() — é justamente o que vis() escondia.
  // conteúdo = texto direto, elemento tocável, OU imagem COM alt (alt="" é imagem decorativa pelo padrão HTML — ex.: o
  // halo do orbe, que transborda o slot de propósito (margem negativa); não é conteúdo que se lê e pode ser recortado).
  const ehConteudo = el => {
    if (/^(IMG|SVG|CANVAS|VIDEO|PICTURE)$/.test(el.tagName)) return (el.getAttribute('alt') || '').trim().length > 0;
    if (interativo(el) || !!txtDe(el)) return true;
    // §367: `cursor:pointer` é HERDADO — um filho DECORATIVO (glow/halo/poça) dentro de um cartão clicável herda o
    // pointer e transbordava de propósito; só conta o TOPO da região clicável (pai NÃO é pointer), como no eixo (b).
    const cs = getComputedStyle(el); if (cs.cursor !== 'pointer') return false;
    const p = el.parentElement; return !p || getComputedStyle(p).cursor !== 'pointer';
  };
  const renderavel = el => { const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity < 0.05) return false; const r = el.getBoundingClientRect(); return r.width >= 0.5 && r.height >= 0.5; };
  const clipAncestral = el => { let n = el.parentElement; for (let i = 0; i < 14 && n && n !== document.body; i++) { if (temClip(getComputedStyle(n))) return n; n = n.parentElement; } return null; };
  const TOLF = 2;
  for (const el of todos) {
    if (!ehConteudo(el) || !renderavel(el) || dentroScrollOk(el)) continue;
    const r = el.getBoundingClientRect();
    let onde = '', por = '', base = null;
    if (r.left < -TOLF || r.top < -TOLF || r.right > vw + TOLF || r.bottom > vh + TOLF) { onde = 'viewport'; base = { left: 0, top: 0, right: vw, bottom: vh }; }
    else { const anc = clipAncestral(el); if (anc) { const ar = anc.getBoundingClientRect();
      if (r.right > ar.right + TOLF || r.left < ar.left - TOLF || r.bottom > ar.bottom + TOLF || r.top < ar.top - TOLF) { onde = 'ancestral'; por = sel(anc); base = ar; } } }
    if (onde) {
      const foraPx = Math.round(Math.max(0, r.bottom - base.bottom, base.top - r.top, r.right - base.right, base.left - r.left));
      const txt = (txtDe(el) || el.getAttribute('alt') || el.tagName.toLowerCase());
      d.push({ tipo: 'fora-tela', sel: sel(el), txt: String(txt).slice(0, 30), importante: true, por: por || 'viewport', foraPx });
    }
  }

  // total de textos/tocáveis visíveis (para a nota)
  let textTotal = 0; for (const el of todos) { if (txtDe(el) && vis(el)) textTotal++; }
  let tapTotal = 0; for (const el of tapSet) { if (vis(el)) tapTotal++; }
  return { a, b, c, d, textTotal, tapTotal };
}

// ===================== §367 — eixo (e) CONTRASTE (WCAG) contra o FUNDO REAL =====================
// Roda no Node (precisa de screenshot): (1) coleta, na página, cada texto visível (caixa + cor efetiva + se é "grande");
// e ESCONDE o texto (cor transparente; texto-gradiente via visibility:hidden, já que a caixa é transparente); (2) tira
// 1 screenshot do canvas SEM os textos (o fundo real que fica atrás de cada um); (3) amostra, na caixa de cada texto, a
// luminância do fundo mais DESFAVORÁVEL (percentil) e calcula a razão WCAG com a cor do texto; (4) restaura os textos.
// Exige ≥4.5:1 p/ corpo e ≥3:1 p/ título grande (≥18px, ou ≥14px negrito). Decorativo (texto sem conteúdo) não entra.
function _coletarContraste(cfg){
  const { MIN_CORPO } = cfg;
  const vw = window.innerWidth, vh = window.innerHeight;
  const vis = el => { const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity < 0.05) return false; const r = el.getBoundingClientRect(); if (r.width < 0.5 || r.height < 0.5) return false; if (r.bottom <= 0 || r.top >= vh || r.right <= 0 || r.left >= vw) return false; return true; };
  const escalaDe = el => { let n = el; for (let i = 0; i < 16 && n; i++) { const ow = n.offsetWidth; if (ow >= 400) { const w = n.getBoundingClientRect().width; if (w > 0) return w / ow; } n = n.parentElement; } n = el; for (let i = 0; i < 16 && n; i++) { const ow = n.offsetWidth; if (ow >= 160) { const w = n.getBoundingClientRect().width; if (w > 0) return w / ow; } n = n.parentElement; } return 1; };
  const txtDe = el => { let t = ''; el.childNodes.forEach(n => { if (n.nodeType === 3) t += n.textContent; }); return t.replace(/\s+/g, ' ').trim(); };
  const sel = el => { if (el.id) return '#' + el.id; let s = el.tagName.toLowerCase(); const cls = (el.getAttribute('class') || '').trim().split(/\s+/).filter(Boolean).slice(0, 2); if (cls.length) s += '.' + cls.join('.'); return s; };
  const parseCor = s => { const m = String(s).match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(',').map(x => parseFloat(x)); return [p[0] || 0, p[1] || 0, p[2] || 0, p.length >= 4 ? p[3] : 1]; };
  const corGrad = bg => { const ms = String(bg).match(/rgba?\([^)]+\)/g); if (!ms) return null; let r = 0, g = 0, b = 0, n = 0; for (const c of ms) { const p = parseCor(c); if (p && p[3] > 0.1) { r += p[0]; g += p[1]; b += p[2]; n++; } } return n ? [r / n, g / n, b / n, 1] : null; };
  // §367: mesma regra de MODAL do a/b/c/d — se há uma camada que cobre a tela (overlay/scrim), só medimos o contraste
  // DENTRO dela (o que está atrás está encoberto de propósito e não é lido pelo jogador).
  const _tagOK = e => !/^(SCRIPT|STYLE|NOSCRIPT|TITLE|svg|path|defs|g|use|DEFS)$/i.test(e.tagName);
  const _cobreTudo = el => { const r = el.getBoundingClientRect(); return r.width * r.height >= 0.9 * vw * vh && r.left <= 2 && r.top <= 2 && r.right >= vw - 2 && r.bottom >= vh - 2; };
  const _bgAlpha = el => { const m = (getComputedStyle(el).backgroundColor || '').match(/rgba?\(([^)]+)\)/); if (!m) return 0; const p = m[1].split(',').map(x => parseFloat(x)); return p.length >= 4 ? p[3] : 1; };
  let _modal = null;
  for (const el of document.querySelectorAll('body *')) { if (_tagOK(el) && vis(el) && _cobreTudo(el) && _bgAlpha(el) >= 0.3) _modal = el; }
  const todos = (_modal ? [_modal, ...(_modal.querySelectorAll('*'))] : [...document.querySelectorAll('body *')]).filter(_tagOK);
  const out = [];
  const esconder = [];   // §367: só escondemos DEPOIS de ler todas as cores (ver nota abaixo)
  for (const el of todos) {
    const t = txtDe(el); if (!t || !vis(el)) continue;
    if (!/[0-9A-Za-zÀ-ÿ]/.test(t)) continue;   // §367: contraste é p/ TEXTO legível; glifo decorativo puro (⚿ ◈ ♛ ⊕ ○ ✓) é ÍCONE, não entra
    if (el.closest('[disabled]') || el.closest('[aria-disabled="true"]')) continue;   // §367: controle INATIVO é isento de contraste (WCAG 1.4.3) — é apagado de propósito
    // §367: texto SVG (<text> dentro de um CARTÃO, ex.: o nome do deus na revelação) é parte de uma ilustração vetorial
    // AUTOCONTIDA, que carrega o próprio fundo desenhado (a "lavagem" clara atrás do nome + o selo). Amostrar o glifo de um
    // vetor escalado a ~71px no raster é impreciso (lê a cor herdada, não o fill; localiza mal o glifo); o eixo (a) de
    // TAMANHO continua valendo p/ esse texto. O contraste real que o jogador lê (caso CHINESA do §367) é sempre HTML.
    if (el.ownerSVGElement) continue;
    const cs = getComputedStyle(el);
    const esc = escalaDe(el);
    const fpx = (parseFloat(cs.fontSize) || 0) * esc;
    const bold = (parseInt(cs.fontWeight, 10) || 400) >= 700;
    const grande = fpx >= 18 || (fpx >= 14 && bold);
    let grad = cs.webkitBackgroundClip === 'text' || cs.backgroundClip === 'text';
    let cor = parseCor(cs.color) || [0, 0, 0, 1];
    if (grad || cor[3] < 0.05) {
      let cg = corGrad(cs.backgroundImage);
      // §367: texto-gradiente recortado num ANCESTRAL (background-clip:text no pai; o texto vive em <span> filhos que
      // herdam color:transparent). Sobe a árvore até quem tem o recorte e usa o gradiente DELE — senão a tinta do filho
      // seria lida como "preto" (luminância 0) e a razão colaria em ~1,0 contra qualquer fundo.
      if (!cg) { let p = el.parentElement; for (let i = 0; i < 6 && p; i++, p = p.parentElement) { const pcs = getComputedStyle(p); if (pcs.webkitBackgroundClip === 'text' || pcs.backgroundClip === 'text') { const pg = corGrad(pcs.backgroundImage); if (pg) { cg = pg; grad = true; break; } } } }
      if (cg) cor = cg;
    }
    const r = el.getBoundingClientRect();
    const x = Math.max(0, Math.round(r.left)), y = Math.max(0, Math.round(r.top));
    const w = Math.min(vw, Math.round(r.right)) - x, h = Math.min(vh, Math.round(r.bottom)) - y;
    if (w < 2 || h < 2) continue;
    out.push({ sel: sel(el), txt: t.slice(0, 30), cor: [cor[0], cor[1], cor[2]], grande, x, y, w, h });
    esconder.push({ el, grad: (grad || cor[3] < 0.05) });
  }
  // §367: esconde o texto SÓ depois de já ter lido TODAS as cores. Se escondêssemos cada folha dentro do mesmo laço,
  // um filho <b>/<span> (iterado depois do pai na ordem do DOM) teria sua cor HERDADA lida já transparente — porque o
  // pai já estaria com color:transparent — e a tinta do filho viraria "preto" (luminância 0), derrubando a razão p/ ~1,1
  // contra qualquer fundo escuro. Lendo tudo antes, a cor de cada folha é a real.
  // Escondemos só o PREENCHIMENTO do glifo, MANTENDO a text-shadow (o dono lista "sombra de texto" como correção legítima):
  // com o preenchimento transparente a área do glifo passa a mostrar a sombra/fundo que realmente fica atrás da letra.
  for (const { el, grad } of esconder) {
    el.setAttribute('data-ec', el.getAttribute('style') || '§none');
    if (grad) { el.style.visibility = 'hidden'; }   // texto-gradiente: caixa transparente → some com a letra
    else { el.style.setProperty('color', 'transparent', 'important'); el.style.setProperty('-webkit-text-fill-color', 'transparent', 'important'); }
  }
  return out;
}
function _restaurarContraste(){
  document.querySelectorAll('[data-ec]').forEach(el => { const s = el.getAttribute('data-ec'); if (s === '§none') el.removeAttribute('style'); else el.setAttribute('style', s); el.removeAttribute('data-ec'); });
}
function _relLum(r, g, b){ const f = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); }
function _ratio(l1, l2){ const a = Math.max(l1, l2), b = Math.min(l1, l2); return (a + 0.05) / (b + 0.05); }
// mede o eixo (e) numa página já renderizada. `page` = Playwright page; `cfg` = CFG. Devolve array de reprovados.
async function medirContraste(page, cfg){
  let sharp; try { sharp = require('sharp'); } catch (e) { return []; }
  const vp = page.viewportSize() || { width: 780, height: 360 };
  const clip = { x: 0, y: 0, width: vp.width, height: vp.height };
  const normalBuf = await page.screenshot({ clip });          // COM texto (p/ localizar os glifos)
  const infos = await page.evaluate(_coletarContraste, cfg);  // coleta + ESCONDE o texto
  const hiddenBuf = await page.screenshot({ clip });          // SEM texto (o fundo real)
  await page.evaluate(_restaurarContraste);
  const N = await sharp(normalBuf).raw().toBuffer({ resolveWithObject: true });
  const Hd = await sharp(hiddenBuf).raw().toBuffer({ resolveWithObject: true });
  const nd = N.data, hd = Hd.data, W = N.info.width, Ht = N.info.height, ch = N.info.channels;
  const sx = W / vp.width, sy = Ht / vp.height;
  const e = [];
  for (const t of infos) {
    const textLum = _relLum(t.cor[0], t.cor[1], t.cor[2]);
    const x0 = Math.max(0, Math.floor(t.x * sx)), x1 = Math.min(W, Math.ceil((t.x + t.w) * sx));
    const y0 = Math.max(0, Math.floor(t.y * sy)), y1 = Math.min(Ht, Math.ceil((t.y + t.h) * sy));
    const ratios = [];
    for (let yy = y0; yy < y1; yy++) for (let xx = x0; xx < x1; xx++) {
      const i = (yy * W + xx) * ch;
      const dif = Math.abs(nd[i] - hd[i]) + Math.abs(nd[i + 1] - hd[i + 1]) + Math.abs(nd[i + 2] - hd[i + 2]);
      if (dif < 45) continue;                                  // só os pixels do GLIFO (onde o texto pintava)
      ratios.push(_ratio(textLum, _relLum(hd[i], hd[i + 1], hd[i + 2])));   // contraste do glifo contra o fundo REAL atrás dele
    }
    if (ratios.length < 8) continue;                           // pouca tinta detectada → não mede (evita ruído)
    ratios.sort((a, b) => a - b);
    const pior = ratios[Math.floor(ratios.length * 0.20)];     // percentil 20% mais desfavorável (robusto a antialias/bordas de glifo)
    const req = t.grande ? 3 : 4.5;
    if (pior + 0.05 < req) e.push({ sel: t.sel, txt: t.txt, ratio: +pior.toFixed(2), req, grande: t.grande });
  }
  return e;
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

module.exports = { medirNaPagina, medirContraste, nota, CFG, MIN_CORPO, MIN_ROTULO, MIN_TOQUE, SCROLL_OK };
