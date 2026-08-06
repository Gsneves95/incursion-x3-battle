// ===================================================================
// INCURSION x3 Battle — TELA DE INVOCAÇÃO (gacha)
// Portado do protótipo do dono (INCURSION_Invocacao_1.html), adaptado ao repo:
//  - lê os 100 deuses de ROSTER + IMG (fonte da verdade única);
//  - raridade vem de RARIDADE (data/raridades.json), SÓ como chance de OBTENÇÃO
//    — nunca poder de batalha (invariante: todos têm 120 de vida, o kit decide);
//  - SEM estrelas (decisão do dono: cópias viram moeda, não sobem poder);
//  - tudo namespaced em INV e com classes/ids prefixados `iv-` para não colidir
//    com a tela de batalha/seleção (que usa .slot, .card, .on, .cost...).
// O sorteio roda no CLIENTE só no protótipo; no servidor (ROTEIRO fase 5) o
// mesmo modelo roda autoritativo. Math.random() é permitido AQUI (não no motor).
// ===================================================================
const INV = (function () {
  // ---- catálogo a partir do roster real ----
  const RANKN = { SS: '5★', S: '4★', A: '3★', B: '2★' };
  const byKey = {}; ROSTER.forEach(u => byKey[u.key] = u);
  const POOL = { SS: [], S: [], A: [], B: [] };
  ROSTER.forEach(u => { (POOL[RARIDADE[u.key] || 'A']).push(u); });

  // destaque derivado do próprio pool (sem depender de nomes fixos)
  const FEAT_SS = (POOL.SS.find(u => u.key === 'zeus') || POOL.SS[0]).key;
  const FEAT_S = POOL.S.slice(0, 2).map(u => u.key);

  const ELEMENTOS = {
    'Chama':      { c: '#FF7A3D', d: '#5E1A05' },
    'Verdejante': { c: '#57D98A', d: '#0B3D22' },
    'Maré':       { c: '#4FB8FF', d: '#08324F' },
    'Umbra':      { c: '#B266F7', d: '#2E0A52' },
    'Aurora':     { c: '#FFD84D', d: '#5C3D02' },
    'Tempestade': { c: '#6EC6FF', d: '#10314F' },
  };
  // glifo por função primária (mesmos paths do modelo do dono)
  const CLASSES = {
    'Guardião':    { p: 'M-12.5 -11 Q0 -14.5 12.5 -11 L12.5 -2 Q12.5 8.5 0 14 Q-12.5 8.5 -12.5 -2 Z' },
    'Atacante':    { p: 'M0 -14 L3 -7.5 L3 4 L-3 4 L-3 -7.5 Z M-9 4 L9 4 L9 7 L-9 7 Z M-2 7 L2 7 L2 11 L-2 11 Z M-2.8 11 L2.8 11 L2.4 14 L-2.4 14 Z' },
    'Controlador': { p: 'M0 -13.5 A6.6 6.6 0 0 1 0 -0.3 A6.6 6.6 0 0 1 0 -13.5 Z M-1.8 -2 L1.8 -2 L1.8 14 L-1.8 14 Z' },
    'Suporte':     { p: 'M-3.6 -14 L3.6 -14 L3.6 -3.6 L14 -3.6 L14 3.6 L3.6 3.6 L3.6 14 L-3.6 14 L-3.6 3.6 L-14 3.6 L-14 -3.6 L-3.6 -3.6 Z' },
    'Manipulador': { p: 'M-14 0 C-7.5 -10.5 7.5 -10.5 14 0 C7.5 10.5 -7.5 10.5 -14 0 Z' },
  };
  const RARIDADES = {
    SS: { rotulo: 'SS', fator: .60, mA: '#FFF0CC', mB: '#FF8A3C', mC: '#7A1408', pA: '#3B0E06', pB: '#120302', nm: '#7A1408', aA: '#FFF7EC', aB: '#FFB278', aC: '#D2461C', brilho: '#FF7A1F', brilho2: '#FFD45C', gb: 1.28, orn: 3, h0: .66, h1: .92, chapaClara: false },
    S:  { rotulo: 'S',  mA: '#FFF7DC', mB: '#EDBF52', mC: '#8A5E12', pA: '#1E2449', pB: '#070A18', nm: '#684007', aA: '#FFFCF2', aB: '#F2C86F', aC: '#B87A22', brilho: '#FFC94D', gb: 1.16, orn: 3, h0: .56, h1: .82, chapaClara: false },
    A:  { rotulo: 'A',  mA: '#F6ECFF', mB: '#B58BE8', mC: '#4A2E75', pA: '#2A1E4E', pB: '#0C0820', nm: '#3E2464', aA: '#FDFAFF', aB: '#C9A0F0', aC: '#7A4CB5', brilho: '#B98CE8', gb: .94, orn: 2, h0: .42, h1: .68, chapaClara: false },
    B:  { rotulo: 'B',  mA: '#EAF5FF', mB: '#83B7DA', mC: '#2A4A63', pA: '#E8F1F8', pB: '#B9CCDC', nm: '#22405A', aA: '#FBFDFF', aB: '#A8CBE4', aC: '#5988AC', brilho: '#8FC0E0', orn: 1, h0: 0, h1: 0, chapaClara: true },
  };
  const OURO = { alto: '#FFF6D2', meio: '#F5CB5C', baixo: '#D9A32E', fundo: '#A97410', borda: '#8A6B2E', halo: '#FFC94D', faisca: '#FFFDF2' };
  const BRONZE = { alto: '#9A6E17', meio: '#6B4A0E', fundo: '#3A2705', borda: '#2E1E04' };

  const ARCO    = 'M20 448 L20 148 C20 96 54 50 100 30 C146 50 180 96 180 148 L180 448 Z';
  const INTERNO = 'M27 442 L27 151 C27 102 58 59 100 40 C142 59 173 102 173 151 L173 442 Z';
  const CHAPA   = 'M6 442 L194 442 L194 538 C194 552 187 563 174 570 L112 598 Q100 604 88 598 L26 570 C13 563 6 552 6 538 Z';
  const FILETE  = 'M14 448 L186 448 L186 534 C186 547 180 557 169 563 L110 588 Q100 593 90 588 L31 563 C20 557 14 547 14 534 Z';

  const esc = x => String(x).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  function pecaNome(nome, r, uid) {
    const n = [...nome].length;
    const corpo = n <= 11 ? 16 : n <= 15 ? 14.5 : n <= 20 ? 12.8 : n <= 26 ? 11.4 : 10.4;
    return `
      <rect x="14" y="398" width="172" height="42" fill="url(#iv-lavagem-${uid})"/>
      <g opacity=".85">
        <path d="M50 404 L92 404" stroke="url(#iv-metal-${uid})" stroke-width=".9"/>
        <path d="M108 404 L150 404" stroke="url(#iv-metal-${uid})" stroke-width=".9"/>
        <path d="M100 399 L104 404 L100 409 L96 404 Z" fill="${r.nm}"/>
      </g>
      <text class="iv-nome" x="100" y="428" text-anchor="middle" font-size="${corpo}" letter-spacing=".05em" fill="${r.nm}">${esc(nome)}</text>`;
  }
  function pecaVolutas(r, uid) {
    if (r.orn < 2) return '';
    const v = `<path d="M0 0 C-14 -4 -20 -14 -16 -24 C-13 -31 -5 -32 -2 -26 C0 -21 -5 -18 -8 -21" fill="none" stroke="url(#iv-metal-${uid})" stroke-width="1.6" stroke-linecap="round" opacity=".9"/>`;
    let out = `<g transform="translate(30 176)">${v}</g><g transform="translate(170 176) scale(-1 1)">${v}</g>`;
    if (r.orn > 2) out += `<g transform="translate(30 372) scale(1 -1)">${v}</g><g transform="translate(170 372) scale(-1 -1)">${v}</g>`;
    return out;
  }
  function pecaParticulas(r, el) {
    if (r.orn < 3) return '';
    return [[46, 210, 2.2, 0], [152, 262, 1.6, 1.4], [58, 326, 1.9, .7], [144, 352, 1.4, 2.1], [70, 150, 1.3, 1.1], [136, 190, 2, .4]]
      .map(([x, y, raio, atraso]) => `
        <circle cx="${x}" cy="${y}" r="${raio}" fill="${el.c}" opacity=".7">
          <animate attributeName="cy" values="${y};${y - 26};${y}" dur="${5 + atraso}s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0;.8;0" dur="${5 + atraso}s" repeatCount="indefinite"/>
        </circle>`).join('');
  }

  let _uid = 0;
  // cfg: {nome, raridade(SS/S/A/B), classe(=função), elemento, arte, nova, copias, largura, atraso}
  function criarCarta(cfg) {
    const r = RARIDADES[cfg.raridade] || RARIDADES.A;
    const el = ELEMENTOS[cfg.elemento] || ELEMENTOS.Aurora;
    const cl = CLASSES[cfg.classe] || CLASSES['Guardião'];
    const uid = ++_uid;
    const claro = r.chapaClara, temBrilho = r.h0 > 0;
    const G = claro ? BRONZE : OURO, glifoFill = claro ? `url(#iv-bronze-${uid})` : `url(#iv-ouro-${uid})`;
    const corpoRar = 54 * 1.02 * (r.fator || 1);
    const topo = cfg.nova ? `<span class="iv-topo-novo">Novo</span>`
      : (cfg.copias > 1 ? `<span class="iv-topo-copias">×${cfg.copias}</span>` : '');
    const arte = cfg.arte
      ? `<image href="${cfg.arte}" x="20" y="30" width="160" height="340" preserveAspectRatio="xMidYMid slice"/>`
      : `<g transform="translate(100 260)"><circle r="52" fill="${el.d}" opacity=".5"/></g>`;

    return `
    <div class="iv-carta${temBrilho ? ' iv-tem-brilho' : ''}" tabindex="0"
         style="--iv-largura:${cfg.largura || 120}px;--iv-metal:${r.mB};--iv-brilho:${r.brilho};--iv-brilho2:${r.brilho2 || 'transparent'};--iv-gb:${r.gb || 1};--iv-h0:${r.h0};--iv-h1:${r.h1};animation-delay:${cfg.atraso || 0}ms"
         aria-label="${esc(cfg.nome)}, ${cfg.classe}, raridade ${r.rotulo}">
      <div class="iv-carta-topo">${topo}</div>
      ${temBrilho ? `
      <div class="iv-carta-halo" style="background:radial-gradient(circle,${r.brilho}88 0,${r.brilho}33 42%,transparent 68%)"></div>
      <div class="iv-carta-poca" style="background:radial-gradient(ellipse,${r.brilho}aa 0,transparent 70%)"></div>` : ''}
      <svg viewBox="0 0 200 624" role="img" aria-hidden="true">
        <defs>
          <linearGradient id="iv-metal-${uid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${r.mA}"/><stop offset=".34" stop-color="${r.mB}"/><stop offset=".58" stop-color="${r.mC}"/><stop offset=".78" stop-color="${r.mB}"/><stop offset="1" stop-color="${r.mA}"/></linearGradient>
          <linearGradient id="iv-metalv-${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${r.mA}"/><stop offset=".45" stop-color="${r.mB}"/><stop offset="1" stop-color="${r.mC}"/></linearGradient>
          <linearGradient id="iv-ouro-${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${OURO.alto}"/><stop offset=".38" stop-color="${OURO.meio}"/><stop offset=".74" stop-color="${OURO.baixo}"/><stop offset="1" stop-color="${OURO.fundo}"/></linearGradient>
          <linearGradient id="iv-bronze-${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${BRONZE.alto}"/><stop offset=".42" stop-color="${BRONZE.meio}"/><stop offset="1" stop-color="${BRONZE.fundo}"/></linearGradient>
          <radialGradient id="iv-retrato-${uid}" cx=".5" cy=".26" r=".85"><stop offset="0" stop-color="${r.aA}"/><stop offset=".42" stop-color="${r.aB}"/><stop offset="1" stop-color="${r.aC}"/></radialGradient>
          <linearGradient id="iv-chapa-${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${r.pA}"/><stop offset="1" stop-color="${r.pB}"/></linearGradient>
          <linearGradient id="iv-desbota-${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${r.aA}" stop-opacity="0"/><stop offset=".7" stop-color="${r.aA}" stop-opacity="0"/><stop offset="1" stop-color="${r.aA}" stop-opacity=".94"/></linearGradient>
          <linearGradient id="iv-lavagem-${uid}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${r.aA}" stop-opacity="0"/><stop offset=".22" stop-color="${r.aA}" stop-opacity=".7"/><stop offset=".78" stop-color="${r.aA}" stop-opacity=".7"/><stop offset="1" stop-color="${r.aA}" stop-opacity="0"/></linearGradient>
          <linearGradient id="iv-espelho-${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".32"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
          <clipPath id="iv-clip-${uid}"><path d="${ARCO}"/></clipPath>
          <mask id="iv-mascara-${uid}"><rect x="0" y="374" width="200" height="30" fill="url(#iv-espelho-${uid})"/></mask>
          <filter id="iv-difuso-${uid}" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="5"/></filter>
          <filter id="iv-brilhof-${uid}" x="-70%" y="-70%" width="240%" height="240%"><feGaussianBlur stdDeviation="3"/></filter>
          <filter id="iv-sombra-${uid}" x="-90%" y="-90%" width="280%" height="280%"><feDropShadow dx="0" dy="1.2" stdDeviation="1.4" flood-color="#000" flood-opacity=".62"/></filter>
        </defs>
        <path d="${ARCO}" fill="url(#iv-retrato-${uid})"/>
        <g clip-path="url(#iv-clip-${uid})">
          <g opacity=".5"><path d="M100 30 L40 448 L74 448 Z" fill="#fff" opacity=".22"/><path d="M100 30 L128 448 L156 448 Z" fill="#fff" opacity=".14"/></g>
          <ellipse cx="100" cy="196" rx="72" ry="86" fill="${el.c}" opacity=".3" filter="url(#iv-difuso-${uid})"/>
          <g mask="url(#iv-mascara-${uid})" transform="translate(0 744) scale(1 -1)">${arte}</g>
          ${arte}
          ${pecaParticulas(r, el)}
          <path d="${ARCO}" fill="url(#iv-desbota-${uid})"/>
          <path d="${ARCO}" fill="none" stroke="${r.aC}" stroke-width="10" opacity=".28"/>
          ${pecaNome(cfg.nome, r, uid)}
        </g>
        ${r.orn > 2 ? `<path d="M92 40 C86 24 76 16 66 14 C78 24 84 34 86 46 Z M108 40 C114 24 124 16 134 14 C122 24 116 34 114 46 Z" fill="${el.d}" opacity=".85"/>` : ''}
        <path d="${ARCO}" fill="none" stroke="url(#iv-metal-${uid})" stroke-width="3.2" class="iv-moldura"/>
        <path d="${INTERNO}" fill="none" stroke="${r.mA}" stroke-width=".9" opacity=".7"/>
        ${pecaVolutas(r, uid)}
        <g transform="translate(100 ${r.orn > 2 ? 18 : 22})"><path d="M0 -14 L9 0 L0 14 L-9 0 Z" fill="url(#iv-metalv-${uid})" stroke="${r.mC}" stroke-width=".7"/><path d="M0 -7 L4.4 0 L0 7 L-4.4 0 Z" fill="${r.mA}" opacity=".85"/></g>
        <path d="${CHAPA}" fill="url(#iv-chapa-${uid})"/>
        <path d="${CHAPA}" fill="none" stroke="url(#iv-metal-${uid})" stroke-width="2.6"/>
        <path d="${FILETE}" fill="none" stroke="${claro ? r.mB : r.mA}" stroke-width=".7" opacity=".4"/>
        <text class="iv-raridade" x="100" y="524" text-anchor="middle" style="font-size:${corpoRar}px" fill="${r.mB}" opacity=".55" filter="url(#iv-brilhof-${uid})">${r.rotulo}</text>
        <text class="iv-raridade" x="100" y="524" text-anchor="middle" style="font-size:${corpoRar}px" fill="url(#iv-metalv-${uid})" stroke="${r.mC}" stroke-width="1" paint-order="stroke">${r.rotulo}</text>
        <g transform="translate(100 566)" filter="url(#iv-sombra-${uid})"><path d="${cl.p}" fill="${glifoFill}" stroke="${G.borda}" stroke-width="1.1"/></g>
      </svg>
    </div>`;
  }

  // u = entrada do ROSTER (key/nome/elem/funcao). rarLetter = SS/S/A/B
  function gcard(u, largura, nova, copias, atraso) {
    return criarCarta({
      nome: u.nome, raridade: RARIDADE[u.key] || 'A', classe: u.funcao, elemento: u.elem,
      arte: IMG[u.key] || '', nova: !!nova, copias: copias || 1, largura, atraso: atraso || 0,
    });
  }
  function gfit(root) {
    const MAXW = 152, MIN = 9.4;
    root.querySelectorAll('text.iv-nome').forEach(el => {
      if (el.dataset.ok) return; el.dataset.ok = 1;
      if (typeof el.getComputedTextLength !== 'function') return;   // jsdom não tem layout SVG
      let fs = parseFloat(el.getAttribute('font-size'));
      while (el.getComputedTextLength() > MAXW && fs > MIN) { fs -= .4; el.setAttribute('font-size', fs.toFixed(2)); }
      if (el.getComputedTextLength() > MAXW) { el.setAttribute('textLength', MAXW); el.setAttribute('lengthAdjust', 'spacingAndGlyphs'); }
    });
  }

  // -------------------------------------------------- gacha
  const BANNERS = {
    destaque: { nome: 'Destaque · Panteão em Ascensão', desc: () => `Rate-up: ${byKey[FEAT_SS].nome} (SS) e ${FEAT_S.map(k => byKey[k].nome).join(' / ')} (S) com o dobro de chance. Regra do 50/50 no SS.`, feat: true },
    padrao:   { nome: 'Portal Eterno', desc: () => 'Pool completo, todos disponíveis. Sem destaque, sem 50/50.', feat: false },
    iniciante:{ nome: 'Bênção do Iniciante', desc: () => 'Uma vez: 10 invocações com SS garantido. Gratuito.', feat: false, once: true },
  };
  const P = { SS: 0.015, S: 0.085 };   // A é o restante (não temos B nos 100)
  let cur = 'destaque';
  let S = { gemas: 30000, perg: 30,
    banners: { destaque: { p4: 0, p5: 0, gf: false }, padrao: { p4: 0, p5: 0, gf: false }, iniciante: { used: false } },
    owned: {}, stats: { SS: 0, S: 0, A: 0, B: 0, total: 0, fSS: 0 } };

  const rand = a => a[Math.floor(Math.random() * a.length)];
  function rollRarity(st) {
    st.p5++; st.p4++;
    let pSS = P.SS; if (st.p5 >= 74) pSS = 0.015 + 0.06 * (st.p5 - 73);   // soft pity
    const x = Math.random();
    if (st.p5 >= 80 || x < pSS) return 'SS';                              // hard pity 80
    if (st.p4 >= 10) return 'S';                                          // garantia S em 10
    if (x < pSS + P.S) return 'S';
    return 'A';
  }
  function pickUnit(rar, bkey, st) {
    const b = BANNERS[bkey];
    if (rar === 'SS') {
      st.p5 = 0; st.p4 = 0;
      if (b.feat) {
        let feat = st.gf ? true : Math.random() < 0.5;
        if (st.gf) st.gf = false; else if (!feat) st.gf = true;
        return feat ? byKey[FEAT_SS] : rand(POOL.SS.filter(u => u.key !== FEAT_SS) ) || byKey[FEAT_SS];
      }
      return rand(POOL.SS);
    }
    if (rar === 'S') {
      st.p4 = 0;
      if (b.feat && Math.random() < 0.5) return byKey[rand(FEAT_S)];
      const semFeat = POOL.S.filter(u => !FEAT_S.includes(u.key));
      return b.feat ? (rand(semFeat) || rand(POOL.S)) : rand(POOL.S);
    }
    return rand(POOL.A.length ? POOL.A : POOL.S);
  }
  function doRoll(bkey, st) { const r = rollRarity(st); return { u: pickUnit(r, bkey, st), r }; }

  function pull(n, useTicket) {
    if (cur === 'iniciante') {
      if (S.banners.iniciante.used) { flash('Bênção do Iniciante já usada.'); return; }
      n = 10; useTicket = false;
    } else {
      const cost = n === 10 ? 1500 : 150;
      if (useTicket) { if (S.perg < 1) { flash('Sem Pergaminhos.'); return; } S.perg -= 1; }
      else { if (S.gemas < cost) { flash('Gemas insuficientes — use o + para recarregar.'); return; } S.gemas -= cost; }
    }
    const st = cur === 'iniciante' ? { p4: 0, p5: 0, gf: false } : S.banners[cur];
    const out = [];
    for (let i = 0; i < n; i++) out.push(doRoll(cur, st));
    if (cur === 'iniciante') {
      if (!out.some(o => o.r === 'SS')) out[out.length - 1] = { u: rand(POOL.SS), r: 'SS' };
      S.banners.iniciante.used = true;
    }
    out.forEach(o => {
      S.stats[o.r]++; S.stats.total++;
      if (o.r === 'SS' && o.u.key === FEAT_SS) S.stats.fSS++;
      o.novo = !S.owned[o.u.key];
      S.owned[o.u.key] = (S.owned[o.u.key] || 0) + 1;
    });
    S._lastN = n; S._lastTicket = useTicket;
    showReveal(out); render();
  }

  function showReveal(out) {
    const order = { SS: 4, S: 3, A: 2, B: 1 };
    const scr = document.getElementById('iv');
    const avail = (scr.clientWidth || 926) - 28, alt = (scr.clientHeight || 428) - 92;
    const W = out.length === 1
      ? Math.min(132, Math.floor(alt / 3.30))
      : Math.min(Math.floor((avail - 9 * 4) / 10), Math.floor(alt / 3.30));
    const cards = document.getElementById('iv-cards');
    cards.innerHTML = out.map((o, i) => gcard(o.u, W, o.novo, S.owned[o.u.key], i * 70)).join('');
    const best = out.reduce((a, b) => order[b.r] > order[a.r] ? b : a);
    const btn = document.getElementById('iv-revagain');
    btn.style.display = cur === 'iniciante' ? 'none' : 'inline-block';
    btn.textContent = `Invocar mais ×${out.length}`;
    document.querySelector('#iv-reveal .iv-tip').innerHTML = best.r === 'SS'
      ? `✦ <b>SS ${best.u.nome}</b>! ✦ — toque fora para voltar` : 'toque fora para voltar';
    document.getElementById('iv-reveal').classList.add('iv-show');
    gfit(cards);
  }
  function closeReveal() { document.getElementById('iv-reveal').classList.remove('iv-show'); }
  function rollAgain() { pull(S._lastN || 1, S._lastTicket || false); }

  function openAudit() {
    const N = 1000, st = { p4: 0, p5: 0, gf: false }, t = { SS: 0, S: 0, A: 0, B: 0 }; let fss = 0;
    for (let i = 0; i < N; i++) { const o = doRoll(cur, st); t[o.r]++; if (o.r === 'SS' && o.u.key === FEAT_SS) fss++; }
    const exp = { SS: '1,5% (base) + pity', S: '8,5% + pity', A: 'restante' };
    const rows = ['SS', 'S', 'A'].map(r => `<tr><td class="iv-${r.toLowerCase()}c">${r} <span style="color:var(--iv-dim)">(${RANKN[r]})</span></td><td>${t[r]}</td><td>${(t[r] / N * 100).toFixed(1)}%</td><td style="color:var(--iv-dim)">${exp[r]}</td></tr>`).join('');
    document.getElementById('iv-auditBox').innerHTML = `<h3>Auditoria de 1.000 invocações</h3>
      <p>Banner: ${BANNERS[cur].nome} · não gasta moedas nem afeta seus contadores</p>
      <table><tr><th>Raridade</th><th>Qtd</th><th>Observado</th><th>Esperado</th></tr>${rows}
      <tr><td>↳ SS em destaque (${byKey[FEAT_SS].nome})</td><td>${fss}</td><td>${t.SS ? (fss / t.SS * 100).toFixed(0) : 0}% dos SS</td><td style="color:var(--iv-dim)">~50%+ c/ 50-50</td></tr></table>
      <p style="margin-top:12px">O SS observado fica acima de 1,5% porque o <b style="color:var(--iv-gold)">pity</b> (garantia em 80 + soft pity a partir do 74º) eleva a taxa efetiva. É o esperado.</p>
      <button class="iv-close" onclick="document.getElementById('iv-audit').classList.remove('iv-show')">Fechar</button>`;
    document.getElementById('iv-audit').classList.add('iv-show');
  }

  function topup() { S.gemas += 15000; S.perg += 10; render(); flash('+15.000 💎  +10 📜 (modo teste)'); }
  let flashT;
  function flash(msg) {
    let t = document.getElementById('iv-toast');
    if (!t) { t = document.createElement('div'); t.id = 'iv-toast'; document.getElementById('iv').appendChild(t); }
    t.textContent = msg; t.style.opacity = '1'; clearTimeout(flashT); flashT = setTimeout(() => t.style.opacity = '0', 1600);
  }

  function render() {
    const scr = document.getElementById('iv'); if (!scr) return;
    const _h = (scr.clientHeight || 428) - 152;
    const FW = Math.max(52, Math.min(92, Math.floor(_h / 3.48)));
    const FW5 = Math.max(58, Math.min(102, Math.floor(_h / 3.22)));
    document.getElementById('iv-gemas').textContent = S.gemas.toLocaleString('pt-BR');
    document.getElementById('iv-perg').textContent = S.perg;
    document.getElementById('iv-tabs').innerHTML = Object.keys(BANNERS).map(k =>
      `<div class="iv-tab ${k === cur ? 'iv-on' : ''}" onclick="INV.setBanner('${k}')">${k === 'destaque' ? 'Destaque' : k === 'padrao' ? 'Padrão' : 'Iniciante'}</div>`).join('');
    const b = BANNERS[cur];
    let feat = '';
    if (b.feat) {
      feat = `<div class="iv-feat">
        ${gcard(byKey[FEAT_S[0]], FW, false, 1, 60)}
        <div class="iv-featwrap">${gcard(byKey[FEAT_SS], FW5, false, 1, 0)}<span class="iv-rateup">RATE-UP</span></div>
        ${gcard(byKey[FEAT_S[1]], FW, false, 1, 120)}</div>`;
    } else if (cur === 'iniciante') {
      feat = `<div class="iv-feat"><div class="iv-featc"><div class="iv-orb iv-big">🎁</div><div class="iv-fn">SS garantido</div><div class="iv-fr">uma vez</div></div></div>`;
    }
    document.getElementById('iv-banner').innerHTML = `<div class="iv-bt">${b.nome}</div><div class="iv-bd">${b.desc()}</div>${feat}`;
    const st = S.banners[cur] || { p4: 0, p5: 0, gf: false };
    if (cur === 'iniciante') {
      document.getElementById('iv-pity').innerHTML = `<div class="iv-fifty">${S.banners.iniciante.used ? '<b class="iv-n">Já utilizada</b>' : '<b class="iv-g">Disponível</b> — 10× com SS garantido, grátis'}</div>`;
    } else {
      document.getElementById('iv-pity').innerHTML = `
        <div class="iv-row"><span>SS garantido</span><b>${st.p5}/80</b></div><div class="iv-pbar iv-p5"><span style="width:${st.p5 / 80 * 100}%"></span></div>
        <div class="iv-row"><span>S garantido</span><b>${st.p4}/10</b></div><div class="iv-pbar iv-p4"><span style="width:${st.p4 / 10 * 100}%"></span></div>
        ${b.feat ? `<div class="iv-fifty">Próximo SS: ${st.gf ? '<b class="iv-g">destaque garantido</b>' : '<b class="iv-n">50/50</b>'}</div>` : ''}`;
    }
    document.querySelectorAll('#iv .iv-pb,#iv .iv-tool').forEach(el => el.classList.remove('iv-off'));
    if (cur === 'iniciante') document.querySelector('#iv .iv-pb.iv-x1').classList.add('iv-off');
    const s = S.stats;
    document.getElementById('iv-tally').innerHTML =
      `<span class="iv-tchip iv-tt">Total <b>${s.total}</b></span>` +
      ['SS', 'S', 'A'].map(r => `<span class="iv-tchip iv-t${r.toLowerCase()}">${r} <b>${s[r]}</b></span>`).join('') +
      `<span class="iv-tchip iv-tt">Coleção <b>${Object.keys(S.owned).length}</b>/${ROSTER.length}</span>`;
    gfit(scr);
  }
  function setBanner(k) { cur = k; closeReveal(); render(); }

  const SKELETON = `
  <div id="iv">
    <div class="iv-stars"></div>
    <div class="iv-topbar">
      <button class="iv-hbtn" onclick="voltarInvocacao()">‹ Voltar</button>
      <div class="iv-wallet">
        <span class="iv-c">💎 <b id="iv-gemas">0</b> <span class="iv-plus" onclick="INV.topup()">+</span></span>
        <span class="iv-c">📜 <b id="iv-perg">0</b></span>
      </div>
    </div>
    <div class="iv-tabs" id="iv-tabs"></div>
    <div class="iv-banner" id="iv-banner"></div>
    <div class="iv-side">
      <div class="iv-pity" id="iv-pity"></div>
      <div class="iv-pullbtns">
        <div class="iv-tools">
          <button class="iv-tool" onclick="INV.pull(1,true)">Usar 📜 ×1</button>
          <button class="iv-tool" onclick="INV.openAudit()">Auditar 1000</button>
        </div>
        <button class="iv-pb iv-x1" onclick="INV.pull(1,false)">Invocar ×1<span class="iv-cost">150 💎</span></button>
        <button class="iv-pb iv-x10" onclick="INV.pull(10,false)">Invocar ×10<span class="iv-cost">1.500 💎</span></button>
      </div>
    </div>
    <div class="iv-tally" id="iv-tally"></div>
    <div class="iv-reveal" id="iv-reveal" onclick="INV.closeReveal()">
      <div class="iv-grid" id="iv-cards"></div>
      <div class="iv-revfoot" onclick="event.stopPropagation()"><button class="iv-revbtn" id="iv-revagain" onclick="INV.rollAgain()">Invocar mais</button></div>
      <div class="iv-tip">toque fora para voltar</div>
    </div>
    <div class="iv-audit" id="iv-audit"><div class="iv-box" id="iv-auditBox"></div></div>
  </div>`;

  function montar() { document.getElementById('stage').innerHTML = SKELETON; render(); }

  return { render, pull, setBanner, openAudit, topup, closeReveal, rollAgain, montar };
})();
