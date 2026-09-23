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
  const byKey = {}; ROSTER.forEach(u => byKey[u.key] = u);
  const POOL = { SS: [], S: [], A: [] };   // ordem A/S/SS
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
    // §303: SÓ na REVELAÇÃO o selo de raridade vira ARTE (o webp cerimonial do dono). Gatilho = DESTINO + arquivo:
    // SELOS_ARTE (os 3 existem) E raridade SS/S/A. Ausente qualquer um → cai no selo-letra SVG de hoje, sem 404.
    // O emblema (256², a letra JÁ desenhada dentro) substitui a LETRA na chapa; a chapa fica como a placa/mont.
    const rarKey = String(cfg.raridade || '').toLowerCase();
    const seloArte = (typeof SELOS_ARTE !== 'undefined' && SELOS_ARTE) && (rarKey === 'ss' || rarKey === 's' || rarKey === 'a');
    const topo = cfg.nova ? `<span class="iv-topo-novo">Novo</span>`
      : (cfg.essencia > 0 ? `<span class="iv-topo-ess">+${cfg.essencia} ✦</span>`
        : (cfg.copias > 1 ? `<span class="iv-topo-copias">×${cfg.copias}</span>` : ''));
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
        ${seloArte
        ? /* §303: o emblema cerimonial (104×104 design ~53px@780/65px@951) na placa, no lugar da letra. A letra
             do SVG SAI (o webp já a traz desenhada — sem letra dupla). Máx sem brigar com o glifo abaixo ~104u;
             sem o glifo, a placa comporta ~158u (~80/97px) — número no docs/registro, a decisão do tamanho é do dono. */
          `<image href="selos/seal-${rarKey}.webp" x="48" y="450" width="104" height="104" preserveAspectRatio="xMidYMid meet"/>`
        : /* fallback (arte ausente): o selo-letra SVG de hoje, intacto, sem 404 */
          `<text class="iv-raridade" x="100" y="524" text-anchor="middle" style="font-size:${corpoRar}px" fill="${r.mB}" opacity=".55" filter="url(#iv-brilhof-${uid})">${r.rotulo}</text>
        <text class="iv-raridade" x="100" y="524" text-anchor="middle" style="font-size:${corpoRar}px" fill="url(#iv-metalv-${uid})" stroke="${r.mC}" stroke-width="1" paint-order="stroke">${r.rotulo}</text>`}
        <g transform="translate(100 566)" filter="url(#iv-sombra-${uid})"><path d="${cl.p}" fill="${glifoFill}" stroke="${G.borda}" stroke-width="1.1"/></g>
      </svg>
    </div>`;
  }

  // u = entrada do ROSTER (key/nome/elem/funcao). rarLetter = SS/S/A/B
  function gcard(u, largura, nova, copias, atraso, essencia) {
    return criarCarta({
      nome: u.nome, raridade: RARIDADE[u.key] || 'A', classe: u.funcao, elemento: u.elem,
      arte: IMG[u.key] || '', nova: !!nova, copias: copias || 1, largura, atraso: atraso || 0, essencia: essencia || 0,
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
  // §302 — UMA invocação, sem abas (decisão do dono). O "destaque" NÃO é um modo separado: é a única
  // invocação, com um deus em evidência (rate-up de DEUS — muda QUAL SS sai, nunca custo/taxa/pity, §20).
  // O antigo "Portal Eterno" (padrão) SAIU: era a mesma invocação sem o deus em evidência (mesma taxa 3%,
  // mesmo custo, mesmo pity) — redundante, estritamente dominado pelo destaque. A "Bênção do Iniciante"
  // continua, mas como OFERTA ÚNICA (grátis, uma vez) na mesma tela, não como aba/modo paralelo.
  const BANNERS = {
    destaque: { nome: 'Panteão em Ascensão', desc: () => `Todo SS desta invocação é ${byKey[FEAT_SS].nome} — o destaque escolhe QUAL SS sai, não QUANTO. Custo e taxa de SS iguais para todos.`, feat: true },
    iniciante:{ nome: 'Bênção do Iniciante', desc: () => 'Uma vez: 10 invocações com SS garantido. Gratuito.', feat: false, once: true },
  };
  const PRINCIPAL = 'destaque';   // a única invocação paga; o "destaque" é ela, com o deus em evidência
  // Economia: fonte única em data/economia.json, embutida como ECONOMIA no build.
  // ZERO literal de taxa/pity/custo aqui.
  const P = { SS: ECONOMIA.invocacao.taxas.SS, S: ECONOMIA.invocacao.taxas.S };
  const PITY = ECONOMIA.invocacao.pity.duro;   // garantia dura (fonte: data/economia.json)
  const ESS = ECONOMIA.invocacao.essenciaPorDuplicata || {};   // repetido→Essência A/S/SS (F3.2; ZERO literal aqui)
  // S.gemas é MIRROR do perfil (perfil.moedas.gema é a verdade). A carteira já NÃO nasce
  // do grantTeste — isso era a carteira FANTASMA (custo de invocação era ficção). Sincroniza
  // em montar() e após cada mutação. Sem perfil (preview isolado), fica em 0 e não invoca pago.
  // §302: UM contador de pity (S.pity, espelho de perfil.invocacao.desdeUltimoSS) — não há mais um
  // pity por banner (o "padrao" saiu; o iniciante não usa pity). Só sobrou a marca de "grátis já usado".
  let S = { gemas: 0, pity: 0, iniciante: { used: false },
    owned: {}, stats: { SS: 0, S: 0, A: 0, total: 0, fSS: 0 } };
  // Sincroniza a tela com o perfil REAL (saldo + pity). Chamada em montar(): no load o
  // perfil ainda é null (o boot carrega depois), então ler aqui, na abertura da tela, é
  // o momento certo. INTERIM: o pity é um contador único (desdeUltimoSS) no banner principal.
  function sincronizarCarteira() {
    S.gemas = (typeof perfil !== 'undefined' && perfil && perfil.moedas) ? (perfil.moedas.gema || 0) : 0;
    if (typeof perfil !== 'undefined' && perfil && perfil.invocacao) S.pity = perfil.invocacao.desdeUltimoSS || 0;
  }

  // Aleatório: durante um lote, roda por SEMENTE (mulberry32 do motor), para o
  // sorteio ser reproduzível e auditável. Fora de um lote, cai no Math.random do
  // cliente (borda) só para gerar a semente.
  let _rng = null;
  const rnd = () => (_rng ? _rng() : Math.random());
  const rand = a => a[Math.floor(rnd() * a.length)];
  function rollRarity(st) {
    st.pity++;
    const x = rnd();
    if (st.pity >= PITY || x < P.SS) return 'SS';   // pity DURO: no PITY-ésimo sem SS, garante SS
    if (x < P.SS + P.S) return 'S';
    return 'A';
  }
  function pickUnit(rar, bkey, st) {
    const b = BANNERS[bkey];
    if (rar === 'SS') {
      st.pity = 0;
      // Destaque: o SS é sempre o DEUS destacado (rate-up de deus, não de taxa).
      if (b.feat) return byKey[FEAT_SS];
      return rand(POOL.SS);
    }
    if (rar === 'S') return rand(POOL.S);   // rate-up só no SS destacado; S sai do pool cheio
    return rand(POOL.A.length ? POOL.A : POOL.S);
  }
  function doRoll(bkey, st) { const r = rollRarity(st); return { u: pickUnit(r, bkey, st), r }; }

  // Sorteio PURO: dada uma semente, o banner, o pity de entrada e a quantidade,
  // devolve o resultado e o pity de saída. Não olha perfil, não grava, não desenha
  // — o simulador de economia da Fase 3 chama só isto, milhares de vezes.
  function sortearLote(seed, bkey, pityEntrada, n) {
    const anterior = _rng;
    _rng = (typeof mulberry32 === 'function') ? mulberry32(seed >>> 0) : Math.random;
    const st = { pity: (pityEntrada && pityEntrada.pity) || 0 };
    const out = [];
    for (let i = 0; i < n; i++) out.push(doRoll(bkey, st));
    if (bkey === 'iniciante' && !out.some(o => o.r === 'SS')) out[out.length - 1] = { u: rand(POOL.SS), r: 'SS' };
    _rng = anterior;
    return { out, pity: st };
  }

  // §302: pull() é sempre a invocação PAGA (a única, com o deus em evidência). O sorteio grátis do
  // iniciante tem porta própria — claimIniciante() — para não reintroduzir "modo" na tela.
  function pull(n) { executar(PRINCIPAL, n); }
  function claimIniciante() {
    if (S.iniciante.used) { flash('Bênção do Iniciante já usada.'); return; }
    executar('iniciante', ECONOMIA.invocacao.banners.iniciante.qtd);
  }
  function executar(bkey, n) {
    let cost = 0;
    if (bkey === 'iniciante') {
      if (S.iniciante.used) { flash('Bênção do Iniciante já usada.'); return; }
    } else {
      cost = n === 10 ? ECONOMIA.invocacao.custo.pacote10 : ECONOMIA.invocacao.custo.avulso;
      // SALDO INSUFICIENTE BLOQUEIA ANTES DE QUALQUER MUDANÇA DE ESTADO: sem sorteio, sem
      // mexer no pity, sem gravar. Falha de pagamento não avança estado nenhum. Checa o
      // PERFIL (a verdade), não o mirror. Sem perfil, também bloqueia (não há carteira).
      const saldo = (typeof perfil !== 'undefined' && perfil && perfil.moedas) ? (perfil.moedas.gema || 0) : 0;
      if (!(typeof perfil !== 'undefined' && perfil) || saldo < cost) { flash('Gemas insuficientes — use o + (DEV) para recarregar.'); return; }
    }
    // UM pity só: o iniciante entra com o pity corrente (a garantia dele repõe um SS, que zera o
    // contador único — coerente com "um contador"). O pago entra com o pity espelhado do perfil.
    const pityEntrada = { pity: S.pity };
    const seed = (Math.floor(Math.random() * 4294967296)) >>> 0;   // borda: semente do cliente
    const { out, pity } = sortearLote(seed, bkey, pityEntrada, n);
    S.pity = pity.pity;
    if (bkey === 'iniciante') S.iniciante.used = true;
    // dono ANTES do lote (a verdade é o perfil, não o mirror de sessão): decide NOVO × repetido.
    // Repetido vira Essência; a contagem é SEQUENCIAL para a 2ª cópia do mesmo deus no MESMO lote já contar como dup.
    const donoAntes = {};
    if (typeof perfil !== 'undefined' && perfil && perfil.deuses) for (const k in perfil.deuses) donoAntes[k] = true;
    out.forEach(o => {
      S.stats[o.r]++; S.stats.total++;
      if (o.r === 'SS' && o.u.key === FEAT_SS) S.stats.fSS++;
      o.novo = !donoAntes[o.u.key];
      o.essencia = o.novo ? 0 : (ESS[o.r] || 0);   // repetido → Essência por ordem
      donoAntes[o.u.key] = true;
      S.owned[o.u.key] = (S.owned[o.u.key] || 0) + 1;
    });
    // PERSISTE ANTES de revelar: recompensa se commita antes de aparecer, nunca
    // depois — se o app morrer na animação, o jogador já recebeu. O DÉBITO das gemas
    // entra AQUI, no mesmo commit: paga antes de ver (mesma regra da recompensa). O
    // histórico guarda a SEMENTE, o pity de entrada e o custo: tudo reproduzível/auditável.
    if (typeof perfil !== 'undefined' && perfil && typeof registrarInvocacao === 'function') {
      if (cost > 0 && typeof debitar === 'function') perfil = debitar(perfil, 'gema', cost);   // saldo já checado; nunca fica negativo
      perfil = registrarInvocacao(perfil, { resultados: out.map(o => ({ key: o.u.key, raridade: o.r })), pity: pity.pity }, 0, ESS);
      if (typeof registrarHistorico === 'function') registrarHistorico({ tipo: 'invocacao', banner: bkey, seed, pityEntrada: pityEntrada.pity, qtd: n, custo: cost, deuses: out.map(o => o.u.key) });
      const rs = (typeof salvar === 'function') ? salvar(perfil) : { ok: true };
      if (!rs.ok) flash('Invocado — mas não consegui salvar: ' + rs.erro);
      S.gemas = perfil.moedas.gema;   // mirror segue a verdade
    }
    S._lastN = n;
    showReveal(out, bkey === 'iniciante'); render();
  }

  function showReveal(out, gratis) {
    const order = { SS: 3, S: 2, A: 1 };
    const scr = document.getElementById('iv');
    const avail = (scr.clientWidth || 926) - 28, alt = (scr.clientHeight || 428) - 92;
    const W = out.length === 1
      ? Math.min(132, Math.floor(alt / 3.30))
      : Math.min(Math.floor((avail - 9 * 4) / 10), Math.floor(alt / 3.30));
    const cards = document.getElementById('iv-cards');
    cards.innerHTML = out.map((o, i) => gcard(o.u, W, o.novo, S.owned[o.u.key], i * 70, o.essencia)).join('');
    const best = out.reduce((a, b) => order[b.r] > order[a.r] ? b : a);
    const btn = document.getElementById('iv-revagain');
    btn.style.display = gratis ? 'none' : 'inline-block';
    btn.textContent = `Invocar mais ×${out.length}`;
    document.querySelector('#iv-reveal .iv-tip').innerHTML = best.r === 'SS'
      ? `✦ <b>SS ${best.u.nome}</b>! ✦ — toque fora para voltar` : 'toque fora para voltar';
    document.getElementById('iv-reveal').classList.add('iv-show');
    gfit(cards);
  }
  function closeReveal() { document.getElementById('iv-reveal').classList.remove('iv-show'); }
  function rollAgain() { pull(S._lastN || 1); }

  function openAudit() {
    const N = 1000, st = { pity: 0 }, t = { SS: 0, S: 0, A: 0 }; let fss = 0;
    for (let i = 0; i < N; i++) { const o = doRoll(PRINCIPAL, st); t[o.r]++; if (o.r === 'SS' && o.u.key === FEAT_SS) fss++; }
    const pct = v => (v * 100).toFixed(0) + '%';
    const exp = { SS: pct(P.SS) + ' + pity', S: pct(P.S) + ' + pity', A: pct(ECONOMIA.invocacao.taxas.A) };
    const rows = ['SS', 'S', 'A'].map(r => `<tr><td class="iv-${r.toLowerCase()}c">${r}</td><td>${t[r]}</td><td>${(t[r] / N * 100).toFixed(1)}%</td><td style="color:var(--iv-dim)">${exp[r]}</td></tr>`).join('');
    document.getElementById('iv-auditBox').innerHTML = `<h3>Auditoria de 1.000 invocações</h3>
      <p>${BANNERS[PRINCIPAL].nome} · não gasta moedas nem afeta seus contadores</p>
      <table><tr><th>Ordem</th><th>Qtd</th><th>Observado</th><th>Esperado</th></tr>${rows}
      <tr><td>↳ SS em destaque (${byKey[FEAT_SS].nome})</td><td>${fss}</td><td>${t.SS ? (fss / t.SS * 100).toFixed(0) : 0}% dos SS</td><td style="color:var(--iv-dim)">100% (destaque)</td></tr></table>
      <p style="margin-top:12px">O SS observado fica acima de ${pct(P.SS)} porque o <b style="color:var(--iv-gold)">pity</b> (garantia dura em ${PITY}) eleva a taxa efetiva. É o esperado.</p>
      <button class="iv-close" onclick="document.getElementById('iv-audit').classList.remove('iv-show')">Fechar</button>`;
    document.getElementById('iv-audit').classList.add('iv-show');
  }

  // Crédito DEV: credita de VERDADE no perfil (para exercitar invocação sem grindar) mas
  // MARCA o perfil como contaminado (perfil.dev) e loga com tipo próprio 'dev-credito' —
  // nunca confundível com transação de jogo. O indicador na tela (ver render) fica aceso
  // enquanto o perfil estiver marcado. Sai antes do release (ver ESTADO).
  function topup() {
    if (typeof perfil === 'undefined' || !perfil || typeof creditarDev !== 'function') { flash('Sem perfil para creditar.'); return; }
    const v = ECONOMIA.grantTeste.gema;
    perfil = creditarDev(perfil, 'gema', v, 0);
    if (typeof registrarHistorico === 'function') registrarHistorico({ tipo: 'dev-credito', moeda: 'gema', valor: v });
    if (typeof salvar === 'function') salvar(perfil);
    S.gemas = perfil.moedas.gema;
    render();
    flash('+' + v.toLocaleString('pt-BR') + ' 💎 — DEV, contamina o perfil');
  }
  let flashT;
  function flash(msg) {
    let t = document.getElementById('iv-toast');
    if (!t) { t = document.createElement('div'); t.id = 'iv-toast'; document.getElementById('iv').appendChild(t); }
    t.textContent = msg; t.style.opacity = '1'; clearTimeout(flashT); flashT = setTimeout(() => t.style.opacity = '0', 1600);
  }

  // §304: FUNDO trocável (dado). Presente no manifesto INVOC_FUNDO → arquivo externo; ausente → '' (gradiente CSS, sem 404).
  function fundoURL() {
    const nome = (typeof INVOCACAO !== 'undefined' && INVOCACAO.destaque && INVOCACAO.destaque.fundo) || '';
    const tem = nome && (typeof INVOC_FUNDO !== 'undefined') && INVOC_FUNDO[nome];
    return tem ? 'banners/invocacao/' + nome + '.webp' : '';
  }
  // §304d: ARTE do deus em destaque, em cascata (nome derivado da CHAVE, sem campo novo): 1) a arte de BANNER
  // web/invocacao/<deus>.webp (recortada p/ ESTA caixa, ~1,15) se existir; 2) senão o RETRATO §289 (reserva); 3) senão
  // '' → silhueta placeholder CSS. NUNCA 404, NUNCA base64. Devolve {url, banner} (banner decide a proporção da caixa).
  function arteDestaque() {
    if ((typeof INVOC_ARTE !== 'undefined') && INVOC_ARTE[FEAT_SS]) return { url: 'invocacao/' + FEAT_SS + '.webp', banner: true };
    if ((typeof RETRATO_ARTE !== 'undefined') && RETRATO_ARTE[FEAT_SS]) return { url: 'retratos/' + FEAT_SS + '.webp', banner: false };
    return { url: '', banner: false };
  }
  // §304: o SELO grande é a ARTE do §303 (seal-<rar>.webp) — o destaque é SS. Ausente → medalhão-letra CSS, sem 404.
  function seloHeroHTML() {
    const temArte = (typeof SELOS_ARTE !== 'undefined' && SELOS_ARTE);
    return temArte
      ? `<img class="iv-hero__selo" src="selos/seal-ss.webp" alt="SS">`
      : `<span class="iv-hero__selo iv-hero__selo--letra">SS</span>`;
  }

  function render() {
    const scr = document.getElementById('iv'); if (!scr) return;
    // carteira (duas moedas) + marca DEV
    document.getElementById('iv-gemas').textContent = S.gemas.toLocaleString('pt-BR');
    { const ess = (typeof perfil !== 'undefined' && perfil && perfil.moedas) ? (perfil.moedas.essencia || 0) : 0;
      const en = document.getElementById('iv-essencia'); if (en) en.textContent = ess.toLocaleString('pt-BR'); }
    const dev = document.getElementById('iv-devmark');
    if (dev) dev.style.display = (typeof perfil !== 'undefined' && perfil && perfil.dev) ? 'inline-flex' : 'none';

    // §304: FUNDO e ARTE do destaque vêm do DADO (com placeholder). O deus em destaque é INVOCACAO.destaque.deus (§20).
    const fu = fundoURL(); const fundoEl = document.getElementById('iv-fundo');
    if (fundoEl) { fundoEl.style.backgroundImage = fu ? `url(${fu})` : ''; fundoEl.classList.toggle('iv-fundo--ph', !fu); }
    const ar = arteDestaque(); const arteEl = document.getElementById('iv-arte');
    if (arteEl) {
      arteEl.style.backgroundImage = ar.url ? `url(${ar.url})` : '';
      arteEl.classList.toggle('iv-arte--ph', !ar.url);
      arteEl.classList.toggle('iv-arte--banner', ar.banner);   // §304d: proporção larga (700/608) p/ a arte de banner; sem = retrato (512/590)
    }

    // COLUNA HERÓI (esquerda): RATE-UP, nome (Cinzel), selo grande (§303), frase (SOME se não houver), VER DETALHES.
    // §304b: o EPÍTETO (arquetipo) SAIU desta tela — é legenda MECÂNICA (boa na Coleção, ruim numa tela de cerimônia).
    // O nome grande + o selo já dizem o que a tela precisa. Se um dia houver um campo de epíteto PRÓPRIO, ele volta.
    const nome = (byKey[FEAT_SS] && byKey[FEAT_SS].nome) || (typeof GODS !== 'undefined' && GODS[FEAT_SS] && GODS[FEAT_SS].nome) || FEAT_SS;
    // §304b: a FRASE é conteúdo do DESTAQUE (data/invocacao.json → INVOCACAO.destaque.frase), NÃO do elenco (§283 supera o
    // §288: a frase deixa de ser campo por-deus). Escreve-se a de quem ENTRA em destaque, uma por vez. Sem frase, SOME (§252).
    const fr = (typeof INVOCACAO !== 'undefined' && INVOCACAO.destaque && INVOCACAO.destaque.frase) || '';
    const cite = fr ? `<p class="iv-hero__cite">“${esc(fr)}”</p>` : '';
    document.getElementById('iv-hero').innerHTML = `
      <span class="iv-hero__tag">RATE-UP</span>
      <h1 class="iv-hero__nome">${esc(nome)}</h1>
      ${seloHeroHTML()}
      ${cite}
      <button class="iv-hero__det" onclick="INV.openAudit()"><span class="iv-hero__lupa">⌕</span> Ver detalhes</button>`;

    // PITY (um contador, do perfil; teto do economia) + oferta ÚNICA do iniciante (§302).
    const oferta = S.iniciante.used ? '' :
      `<button class="iv-oferta" onclick="INV.claimIniciante()"><b>Bênção do Iniciante</b> — 10× grátis, SS garantido</button>`;
    document.getElementById('iv-pity').innerHTML = `
      ${oferta}
      <div class="iv-pity__row"><span class="iv-pity__lbl">SS garantido</span>
        <div class="iv-pbar iv-pity__bar"><span style="width:${Math.min(100, S.pity / PITY * 100)}%"></span></div>
        <b class="iv-pity__num">${S.pity}/${PITY}</b>
        <button class="iv-pity__q" onclick="INV.openAudit()" title="Como funciona a garantia">?</button></div>`;
  }

  const SKELETON = `
  <div id="iv">
    <div class="iv-fundo" id="iv-fundo"></div>
    <div class="iv-scrim"></div>
    <div class="iv-arte" id="iv-arte"></div>
    <div class="iv-topbar">
      <div class="iv-tleft">
        <button class="iv-hbtn" onclick="voltarInvocacao()" aria-label="Voltar">‹</button>
        <span class="iv-title">Invocação</span>
      </div>
      <div class="iv-wallet">
        <span id="iv-devmark" class="iv-devmark" style="display:none" title="Perfil contaminado por crédito de teste (DEV) — sai antes do release">⚠ DEV</span>
        <span class="iv-c iv-cess" title="Essência — vem de repetidos">✦ <b id="iv-essencia">0</b></span>
        <span class="iv-c">💎 <b id="iv-gemas">0</b> <button class="iv-plus" onclick="INV.topup()" title="Crédito de TESTE (DEV): contamina o perfil">+</button></span>
      </div>
    </div>
    <div class="iv-hero" id="iv-hero"></div>
    <div class="iv-base">
      <div class="iv-pity" id="iv-pity"></div>
      <div class="iv-pullbtns">
        <button class="iv-pb iv-x1" onclick="INV.pull(1)"><span class="iv-pb__t">Invocação ×1</span><span class="iv-cost">💎 ${ECONOMIA.invocacao.custo.avulso}</span></button>
        <button class="iv-pb iv-x10" onclick="INV.pull(10)"><span class="iv-off">10% OFF</span><span class="iv-pb__t">Invocação ×10</span><span class="iv-cost">💎 ${ECONOMIA.invocacao.custo.pacote10.toLocaleString('pt-BR')}</span></button>
      </div>
    </div>
    <div class="iv-reveal" id="iv-reveal" onclick="INV.closeReveal()">
      <div class="iv-grid" id="iv-cards"></div>
      <div class="iv-revfoot" onclick="event.stopPropagation()"><button class="iv-revbtn" id="iv-revagain" onclick="INV.rollAgain()">Invocar mais</button></div>
      <div class="iv-tip">toque fora para voltar</div>
    </div>
    <div class="iv-audit" id="iv-audit"><div class="iv-box" id="iv-auditBox"></div></div>
  </div>`;

  function montar() { sincronizarCarteira(); document.getElementById('stage').innerHTML = SKELETON; render(); }

  return { render, pull, claimIniciante, openAudit, topup, closeReveal, rollAgain, montar, sortearLote };
})();
