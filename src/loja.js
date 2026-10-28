// ===================================================================
// INCURSION x3 Battle — TELA DA LOJA (§371). Parte 2 do §370 (o servidor): aqui são as TELAS.
// Tudo autoritativo no servidor (§370): o cliente só PEDE (lojaEstado/lojaComprar*/lojaAnuncio) e MOSTRA o que volta.
// O CLIENTE NUNCA SOMA. Compra/anúncio exigem a confirmação SIMULADA (LOJA_SIMULADA=1 no servidor); sem ela o servidor
// responde "pagamento indisponível" e a tela diz "Compras indisponíveis no momento".
// Canvas PEQUENO de 780×360 (px de design = px real, padrão §357): texto ≥12px, rótulo ≥11px, toque ≥40px, sem rolagem
// fora da lista branca (a grade de gemas, .loja-grade). Namespaced em LOJA, classes/ids `loja`/`loja-`.
// ===================================================================
const LOJA = (function () {
  const esc = x => String(x == null ? '' : x).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const byKey = {}; if (typeof ROSTER !== 'undefined') ROSTER.forEach(u => byKey[u.key] = u);
  const DADOS = (typeof ECONOMIA !== 'undefined' && ECONOMIA.loja) || {};
  const fmt = n => (n || 0).toLocaleString('pt-BR');
  const reais = v => 'R$ ' + Number(v || 0).toFixed(2).replace('.', ',');
  const nomeDeus = k => (byKey[k] && byKey[k].nome) || (typeof GODS !== 'undefined' && GODS[k] && GODS[k].nome) || k || '—';

  let LST = null;         // último estado do servidor (lojaEstado)
  let aba = 'destaques';
  let ocupado = false;    // uma operação por vez

  function _tx() { return (typeof contaTransporte !== 'undefined') ? contaTransporte : null; }
  function _token() { return (typeof lerToken === 'function') ? lerToken() : null; }
  function _uid() { return 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
  function _conf() { return { simulado: true }; }   // §370/§371: a confirmação SIMULADA do modo de teste

  // -------------------------------------------------- NET
  function carregar() {
    const tx = _tx(), token = _token();
    if (!tx || !token) { LST = null; pintar(); return; }
    Promise.resolve(tx.pedir(envelope('lojaEstado', { token }))).then(r => {
      if (r && r.tipo === 'lojaEstado' && r.loja) { LST = r.loja; if (r.conta && typeof contaAtual !== 'undefined') contaAtual = r.conta; }
      else if (!r || r.tipo === 'semResposta') { LST = null; }
      pintar();
    }).catch(() => { LST = null; pintar(); });
  }
  function _espelharConta(r) {
    if (r && r.conta && typeof contaAtual !== 'undefined') contaAtual = r.conta;
    if (r && r.saldo && typeof perfil !== 'undefined' && perfil) {
      perfil.moedas = perfil.moedas || { gema: 0, essencia: 0 };
      perfil.moedas.gema = r.saldo.gema; perfil.moedas.essencia = r.saldo.essencia;
      try { if (typeof salvar === 'function') salvar(perfil); } catch (e) {}
    }
  }
  // mensagem clara por código de recusa do servidor
  function _motivo(r) {
    const cod = r && (r.codigo || r.erro);
    if (cod === 'pagamento_indisponivel') return 'Compras indisponíveis no momento.';
    if (cod === 'gemas_insuficientes') return 'Gemas insuficientes.';
    if (cod === 'passe_ativo') return 'O passe já está ativo.';
    if (cod === 'limite_tipo') return 'Você já usou este anúncio hoje.';
    if (cod === 'teto_diario') return 'Limite de anúncios do dia atingido.';
    if (cod === 'max_vagas') return 'Você já tem o máximo de vagas.';
    if (cod === 'ja_resgatado_hoje') return 'O resgate de hoje já foi feito.';
    if (cod === 'sem_conexao' || !r) return 'Sem conexão com o servidor.';
    return 'Operação recusada' + (cod ? ': ' + cod : '') + '.';
  }
  // executa uma chamada autoritativa e trata a resposta de forma uniforme
  function _executar(tipo, extra, onOk) {
    const tx = _tx(), token = _token();
    if (!tx || !token) { flash('Sem conexão com o servidor.'); return; }
    if (ocupado) return; ocupado = true;
    Promise.resolve(tx.pedir(envelope(tipo, Object.assign({ token }, extra)))).then(r => {
      ocupado = false;
      if (!r || r.tipo === 'recusado' || r.tipo === 'semResposta') { flash(_motivo(r)); return; }
      _espelharConta(r);
      if (onOk) onOk(r);
      carregar();   // recarrega o estado autoritativo e repinta
    }).catch(() => { ocupado = false; flash('Sem conexão com o servidor.'); });
  }

  // -------------------------------------------------- CONFIRMAÇÃO SIMULADA (global, sobre qualquer tela)
  // Modal em px reais sobre o #stage: funciona na Loja E na Invocação (a invocação grátis por anúncio o usa).
  function confirmar(opts) {
    opts = opts || {};
    fecharModal();
    const kind = opts.kind || 'compra';
    const titulo = kind === 'anuncio' ? 'Anúncio simulado' : kind === 'gema' ? 'Confirmar compra' : 'Compra simulada';
    const sub = kind === 'anuncio' ? 'ANÚNCIO SIMULADO (modo de teste)'
      : kind === 'gema' ? (opts.corpo || '') : 'COMPRA SIMULADA (modo de teste) — nenhum valor será cobrado';
    const acoes = opts.acoes || [{ rotulo: 'Confirmar', fn: opts.onSim }];
    const botoes = acoes.map((a, i) => `<button class="loja-modal__ok" data-i="${i}">${esc(a.rotulo)}</button>`).join('');
    const host = document.getElementById('stage') || document.body;
    const m = document.createElement('div');
    m.id = 'loja-modal'; m.className = 'loja-modal loja-modal--on';
    m.innerHTML = `<div class="loja-modal__cx" role="dialog" aria-label="${esc(titulo)}">
      <h2 class="loja-modal__tit">${esc(titulo)}</h2>
      ${opts.linha ? `<p class="loja-modal__linha">${esc(opts.linha)}</p>` : ''}
      <p class="loja-modal__sub">${esc(sub)}</p>
      <div class="loja-modal__acoes">${botoes}<button class="loja-modal__cancel" data-cancel="1">Cancelar</button></div>
    </div>`;
    host.appendChild(m);
    m.addEventListener('click', ev => {
      const b = ev.target.closest('[data-i],[data-cancel]'); if (!b) { if (ev.target === m) fecharModal(); return; }
      if (b.hasAttribute('data-cancel')) { fecharModal(); return; }
      const a = acoes[+b.dataset.i]; fecharModal(); if (a && typeof a.fn === 'function') a.fn();
    });
  }
  function fecharModal() { const m = document.getElementById('loja-modal'); if (m) m.remove(); }

  // -------------------------------------------------- AÇÕES (compras / resgates / anúncios)
  function comprarPacote(id) {
    const p = (LST && LST.pacotes || []).find(x => x.id === id); if (!p) return;
    confirmar({ kind: 'compra', linha: `${fmt(p.gemas * (p.emDobro ? 2 : 1))} 💎 por ${reais(p.reais)}${p.emDobro ? ' (1ª compra em dobro)' : ''}`,
      onSim: () => _executar('lojaComprarPacote', { pacoteId: id, idCompra: _uid(), confirmacao: _conf() },
        r => flash(r.duplicado ? 'Compra já processada.' : ('+' + fmt(r.gemas) + ' 💎' + (r.emDobro ? ' (em dobro!)' : '')))) });
  }
  function comprarPasse() {
    confirmar({ kind: 'compra', linha: `Passe mensal — ${reais((DADOS.passe && DADOS.passe.reais) || 0)}`,
      onSim: () => _executar('lojaComprarPasse', { idCompra: _uid(), confirmacao: _conf() }, () => flash('Passe ativado! Resgate 1 recompensa por dia.')) });
  }
  function resgatarPasse() {
    _executar('lojaResgatarPasse', {}, r => {
      const pr = r.premio || {};
      if (pr.ss) { revelarSS(pr.ss); }
      else {
        const partes = []; if (pr.gema) partes.push('+' + fmt(pr.gema) + ' 💎'); if (pr.bilhetes) partes.push('+' + pr.bilhetes + ' 🎫');
        flash('Dia ' + (pr.dia || '') + ': ' + (partes.join('  ') || 'resgatado'));
      }
    });
  }
  function comprarDeusSemana() {
    const custo = (LST && LST.deusSemana && LST.deusSemana.compraDireta) || (DADOS.deusSemana && DADOS.deusSemana.compraDireta && DADOS.deusSemana.compraDireta.gema) || 1800;
    const deus = (LST && LST.deusSemana && LST.deusSemana.deus) || '';
    confirmar({ kind: 'gema', corpo: `Comprar ${nomeDeus(deus)} por ${fmt(custo)} 💎?`,
      onSim: () => _executar('lojaComprarDeusSemana', { idCompra: _uid() }, r => flash((r.concedido && r.concedido.novo) ? (nomeDeus(r.deus) + ' é seu!') : 'Virou pontos de duplicata.')) });
  }
  function anuncio(tipo, extra, rotuloOk) {
    confirmar({ kind: 'anuncio', linha: rotuloOk || '',
      onSim: () => _executar('lojaAnuncio', Object.assign({ anuncio: tipo, id: _uid(), confirmacao: _conf() }, extra || {}), r => {
        const pr = r.premio || {};
        if (tipo === 'marcaDeusSemana' && pr.deusSemana) flash(pr.deusSemana.concedido ? 'Deus da Semana conquistado!' : ('Marca ' + pr.deusSemana.marcas + '/' + pr.deusSemana.meta));
        else if (tipo === 'ofertaDia') flash('+' + fmt(pr.valor) + (pr.escolha === 'essencia' ? ' ✦' : ' 💎'));
        else flash('Recompensa creditada.');
      }) });
  }
  function ofertaDia() {
    const cfg = (DADOS.anuncios && DADOS.anuncios.tipos && DADOS.anuncios.tipos.ofertaDia) || { gema: 50, essencia: 10 };
    confirmar({ kind: 'anuncio', linha: 'Oferta do dia',
      acoes: [
        { rotulo: fmt(cfg.gema) + ' 💎', fn: () => _executar('lojaAnuncio', { anuncio: 'ofertaDia', id: _uid(), confirmacao: _conf(), escolha: 'gema' }, r => flash('+' + fmt(r.premio && r.premio.valor) + ' 💎')) },
        { rotulo: fmt(cfg.essencia) + ' ✦', fn: () => _executar('lojaAnuncio', { anuncio: 'ofertaDia', id: _uid(), confirmacao: _conf(), escolha: 'essencia' }, r => flash('+' + fmt(r.premio && r.premio.valor) + ' ✦')) },
      ] });
  }

  // -------------------------------------------------- REVELAÇÃO do SS (reusa a carta da Invocação, §303/§304)
  function revelarSS(ss) {
    if (!ss || !ss.key || typeof INV === 'undefined' || !INV.cartaPorKey) { flash('Deus SS recebido!'); return; }
    const host = document.getElementById('loja-ov'); if (!host) return;   // camada de overlay (não some no repaint)
    const H = host.clientHeight || 360;
    const W = Math.min(120, Math.max(56, Math.floor((H - 92 - 42) / 3.30)));   // cabe na altura (a carta é ~3,12× a largura)
    const wrap = document.createElement('div');
    wrap.id = 'iv';   // reusa todo o CSS `#iv .iv-*` da revelação (único nesta tela)
    wrap.innerHTML = `<div class="iv-reveal iv-show" id="loja-rev" onclick="LOJA.fecharRevelacao()">
      <div class="iv-grid"><div class="iv-cartaw">${INV.cartaPorKey(ss.key, W, ss.novo, 1, ss.essencia || 0)}<div class="iv-cardnome" style="width:${W}px">${esc(nomeDeus(ss.key))}</div></div></div>
      <div class="iv-tip">${ss.novo ? '✦ <b>SS ' + esc(nomeDeus(ss.key)) + '</b>! ✦ — toque fora para voltar' : 'duplicata — virou pontos · toque fora para voltar'}</div>
    </div>`;
    host.appendChild(wrap);
    if (INV.ajustarCartas) INV.ajustarCartas(wrap);
  }
  function fecharRevelacao() { const r = document.getElementById('iv'); if (r && r.closest('#loja-ov')) r.remove(); }

  // -------------------------------------------------- TOAST
  let flashT;
  function flash(msg) {
    const host = document.getElementById('loja-ov') || document.getElementById('stage'); if (!host) return;
    let t = document.getElementById('loja-toast');
    if (!t) { t = document.createElement('div'); t.id = 'loja-toast'; t.className = 'loja-toast'; host.appendChild(t); }
    t.textContent = msg; t.style.opacity = '1'; clearTimeout(flashT); flashT = setTimeout(() => t.style.opacity = '0', 1800);
  }

  // -------------------------------------------------- RENDER
  function ir(a) { aba = a; pintar(); }
  function sair() { fecharModal(); fecharRevelacao(); if (!(typeof voltar === 'function' && voltar())) ir2Home(); render(); }
  function ir2Home() { if (typeof ir === 'function') ir('home', {}, { substituir: true }); }

  function _usoAnuncio(tipo) { const a = (LST && LST.anuncios) || { porTipo: {}, total: 0, teto: 8 }; return { usado: (a.porTipo && a.porTipo[tipo]) || 0, total: a.total || 0, teto: a.teto || 8 }; }
  function _limiteTipo(tipo) { const t = (DADOS.anuncios && DADOS.anuncios.tipos && DADOS.anuncios.tipos[tipo]) || {}; return t.limiteDia || 1; }
  function _anuncioBloqueado(tipo) { const u = _usoAnuncio(tipo); if (u.total >= u.teto) return 'Limite de anúncios do dia (' + u.total + '/' + u.teto + ')'; if (u.usado >= _limiteTipo(tipo)) return 'Já usado hoje'; return ''; }

  // ---- cartões de DESTAQUE
  function cardPasseDestaque() {
    const d = DADOS.passe || {}; const ativo = LST && LST.passe && LST.passe.ativo;
    const dia = LST && LST.passe && LST.passe.diaAtual;
    const resgatHoje = ativo && LST.passe.dias && LST.passe.dias[(dia || 1) - 1] && LST.passe.dias[(dia || 1) - 1].estado === 'resgatado';
    const marcos = [7, 14, 21, 28].map(n => `<span class="loja-tl__mk" style="left:${(n / 30 * 100).toFixed(1)}%"><span class="loja-tl__ic">🎫</span><span class="loja-tl__n">${n}</span></span>`).join('');
    const btn = !ativo
      ? `<button class="loja-cta" onclick="LOJA.comprarPasse()">Comprar</button>`
      : (resgatHoje
        ? `<button class="loja-cta loja-cta--off" disabled>Resgatado hoje ✓</button>`
        : `<button class="loja-cta" onclick="LOJA.resgatarPasse()">Dia ${dia} · Resgatar</button>`);
    return `<section class="loja-card loja-card--passe">
      <div class="loja-card__topo"><h2 class="loja-card__tit">Passe Mensal</h2><span class="loja-card__preco">${reais(d.reais)}</span></div>
      <p class="loja-card__sub">40 invocações + 1 deus SS em 30 dias</p>
      <div class="loja-card__arte loja-card__arte--passe" aria-hidden="true">🎁</div>
      <div class="loja-tl">${marcos}<span class="loja-tl__mk loja-tl__mk--ss" style="left:100%"><span class="loja-tl__ic">SS</span><span class="loja-tl__n">30</span></span></div>
      ${btn}
    </section>`;
  }
  function cardDeusDestaque() {
    const ds = (LST && LST.deusSemana) || {}; const bloq = _anuncioBloqueado('marcaDeusSemana');
    const marcas = ds.marcas || 0, meta = ds.meta || 5;
    const pontos = Array.from({ length: meta }, (_, i) => `<span class="loja-dot${i < marcas ? ' is-on' : ''}"></span>`).join('');
    const btn = ds.dado
      ? `<button class="loja-cta loja-cta--off" disabled>Conquistado ✓</button>`
      : bloq ? `<button class="loja-cta loja-cta--off" disabled>${esc(bloq)}</button>`
        : `<button class="loja-cta" onclick="LOJA.anuncio('marcaDeusSemana',null,'Deus da Semana · +1 marca')">▶ Assistir (+1 marca)</button>`;
    return `<section class="loja-card loja-card--meio">
      <h2 class="loja-card__tit loja-card__tit--c">Deus da Semana</h2>
      ${artinhaDeus(ds.deus)}
      <div class="loja-card__linha"><b class="loja-card__nome">${esc(nomeDeus(ds.deus))}</b><span class="loja-selo">${esc(ds.raridade || 'S')}</span></div>
      <div class="loja-card__row"><span class="loja-card__marcas">${marcas} de ${meta} marcas</span><span class="loja-dots">${pontos}</span></div>
      ${btn}
      <p class="loja-card__nota">ou ${fmt((ds.compraDireta) || 1800)} gemas</p>
    </section>`;
  }
  function cardOfertaDestaque() {
    const cfg = (DADOS.anuncios && DADOS.anuncios.tipos && DADOS.anuncios.tipos.ofertaDia) || { gema: 50, limiteDia: 3 };
    const u = _usoAnuncio('ofertaDia'); const bloq = _anuncioBloqueado('ofertaDia');
    const btn = bloq ? `<button class="loja-cta loja-cta--off" disabled>${esc(bloq)}</button>`
      : `<button class="loja-cta" onclick="LOJA.ofertaDia()">▶ Assistir anúncio</button>`;
    return `<section class="loja-card loja-card--meio">
      <h2 class="loja-card__tit loja-card__tit--c">Oferta do Dia</h2>
      <div class="loja-card__arte loja-card__arte--oferta" aria-hidden="true">💎</div>
      <p class="loja-card__big">${fmt(cfg.gema)} gemas grátis</p>
      ${btn}
      <p class="loja-card__nota">${u.usado} de ${_limiteTipo('ofertaDia')} hoje</p>
    </section>`;
  }
  function artinhaDeus(k) {
    const url = (typeof RETRATO_ARTE !== 'undefined' && RETRATO_ARTE && RETRATO_ARTE[k]) ? 'retratos/' + k + '.webp'
      : (typeof IMG !== 'undefined' && IMG[k]) ? IMG[k] : '';
    return `<div class="loja-deusart${url ? '' : ' loja-deusart--ph'}" ${url ? `style="background-image:url(${url})"` : ''} aria-hidden="true"></div>`;
  }

  function abaDestaques() {
    return `<div class="loja-destaques">${cardPasseDestaque()}${cardDeusDestaque()}${cardOfertaDestaque()}</div>
      <button class="loja-rodape" onclick="LOJA.verChances()">ⓘ Itens de sorteio mostram as chances em <b>Ver detalhes</b>.</button>`;
  }
  function abaGemas() {
    const pacs = (LST && LST.pacotes) || [];
    const cells = pacs.map(p => `<button class="loja-pac" onclick="LOJA.comprarPacote('${p.id}')">
      ${p.emDobro ? `<span class="loja-pac__selo">1ª compra em dobro</span>` : ''}
      <span class="loja-pac__gem">💎 ${fmt(p.gemas * (p.emDobro ? 2 : 1))}</span>
      ${p.emDobro ? `<span class="loja-pac__base">${fmt(p.gemas)} × 2</span>` : ''}
      <span class="loja-pac__preco">${reais(p.reais)}</span>
    </button>`).join('');
    return `<div class="loja-grade loja-grade--gemas">${cells || '<p class="loja-vazio">Carregando…</p>'}</div>`;
  }
  function abaPasse() {
    const pa = (LST && LST.passe) || { ativo: false, dias: [] };
    if (!pa.ativo || !pa.dias || !pa.dias.length) {
      const d = DADOS.passe || {};
      return `<div class="loja-passe loja-passe--vazio">
        <div class="loja-passe__esq">
          <h2 class="loja-card__tit">Passe Mensal</h2>
          <p class="loja-card__sub">30 dias de calendário. 1 recompensa por dia; o dia não resgatado é perdido.</p>
          <ul class="loja-passe__lista">
            <li>Dias comuns: 150 gemas</li>
            <li>Dias 7, 14, 21: 150 gemas + 3 bilhetes</li>
            <li>Dia 28: 150 gemas + 2 bilhetes</li>
            <li>Dia 30: 1 deus SS</li>
          </ul>
          <button class="loja-cta" onclick="LOJA.comprarPasse()">Comprar — ${reais(d.reais)}</button>
        </div>
        <div class="loja-passe__arte" aria-hidden="true">🎁</div>
      </div>`;
    }
    const hoje = pa.diaAtual;
    const faltam = (pa.dias.length) - hoje;
    const cells = pa.dias.map(di => cellDia(di)).join('');
    return `<div class="loja-passe">
      <aside class="loja-passe__painel">
        <h2 class="loja-card__tit">Passe Mensal</h2>
        <p class="loja-passe__dia">Dia ${hoje} de ${pa.dias.length}</p>
        <p class="loja-passe__faltam">Faltam ${Math.max(0, faltam)} dias</p>
        <p class="loja-passe__aviso">O dia não resgatado é perdido.</p>
        <div class="loja-cta loja-cta--off" aria-disabled="true">✓ Passe ativo</div>
      </aside>
      <div class="loja-grade loja-grade--passe">${cells}
        <p class="loja-passe__incluso">🎁 Também incluso: recompensas dos anúncios sem assistir · 2 marcas por dia no Deus da Semana.</p>
      </div>
    </div>`;
  }
  function cellDia(di) {
    const rec = di.recompensa || {}, isSS = !!rec.ss, est = di.estado;
    let inner = `<span class="loja-dia__n">${di.dia}</span>`;
    if (est === 'hoje') {
      // o dia de hoje: número + a recompensa em UMA linha + o botão Resgatar (sem o ícone, p/ caber sem estourar a célula)
      inner += isSS ? `<span class="loja-dia__ss">SS</span>` : `<span class="loja-dia__val">${rec.gema ? rec.gema + ' 💎' : (rec.bilhetes ? rec.bilhetes + ' 🎫' : '')}</span>`;
      inner += `<button class="loja-dia__btn" onclick="LOJA.resgatarPasse()">Resgatar</button>`;
    } else {
      if (isSS) inner += `<span class="loja-dia__ss">SS</span>`;
      else { const bil = (rec.bilhetes && est === 'futuro') ? `<span class="loja-dia__bil">🎫 ×${rec.bilhetes}</span>` : ''; inner += `<span class="loja-dia__gem">💎</span>${bil}`; }
      if (est === 'resgatado') inner += `<span class="loja-dia__ok">✓</span>`;
      else if (est === 'perdido') inner += `<span class="loja-dia__x">✕</span>`;
    }
    return `<div class="loja-dia loja-dia--${est}${isSS ? ' loja-dia--ssbox' : ''}">${inner}</div>`;
  }
  function abaDeusSemana() {
    const ds = (LST && LST.deusSemana) || {}; const bloq = _anuncioBloqueado('marcaDeusSemana');
    const marcas = ds.marcas || 0, meta = ds.meta || 5;
    const dots = Array.from({ length: meta }, (_, i) => `<span class="loja-dot${i < marcas ? ' is-on' : ''}"></span>`).join('');
    const assistir = ds.dado ? `<div class="loja-cta loja-cta--off" aria-disabled="true">✓ ${marcas >= meta ? 'Seu!' : 'Conquistado'}</div>`
      : bloq ? `<button class="loja-cta loja-cta--off" disabled>${esc(bloq)}</button>`
        : `<button class="loja-cta" onclick="LOJA.anuncio('marcaDeusSemana',null,'Deus da Semana · +1 marca')">▶ Assistir (+1 marca)</button>`;
    const comprar = ds.dado ? '' : `<button class="loja-cta loja-cta--alt" onclick="LOJA.comprarDeusSemana()">Comprar por ${fmt(ds.compraDireta || 1800)} 💎</button>`;
    return `<div class="loja-ds">
      <div class="loja-ds__arte">${artinhaDeus(ds.deus)}</div>
      <div class="loja-ds__info">
        <div class="loja-card__linha"><b class="loja-card__nome loja-card__nome--g">${esc(nomeDeus(ds.deus))}</b><span class="loja-selo">${esc(ds.raridade || 'S')}</span></div>
        <div class="loja-card__row"><span class="loja-card__marcas">${marcas} de ${meta} marcas</span><span class="loja-dots">${dots}</span></div>
        <p class="loja-card__nota">Termina em ${terminaEm()}</p>
        ${assistir}${comprar}
      </div>
    </div>`;
  }
  function abaOutros() {
    const v = (DADOS.vagaProvacao && DADOS.vagaProvacao.gema) || 500;
    return `<div class="loja-outros">
      <section class="loja-card loja-card--breve">
        <h2 class="loja-card__tit">+1 Vaga de Provação</h2>
        <p class="loja-card__sub">Por ${fmt(v)} gemas (até +2). Ativa quando o jogo permitir mais de uma Provação ativa.</p>
        <div class="loja-cta loja-cta--off" aria-disabled="true">Em breve</div>
      </section>
      <section class="loja-card loja-card--breve">
        <h2 class="loja-card__tit">Cosméticos</h2>
        <p class="loja-card__sub">Molduras e artes alternativas, sem vantagem de jogo.</p>
        <div class="loja-cta loja-cta--off" aria-disabled="true">Em breve</div>
      </section>
    </div>`;
  }
  function terminaEm() {
    const now = Date.now(), dia = Math.floor(now / 86400000);
    const proxSeg = (Math.floor((dia + 3) / 7) + 1) * 7 - 3;
    const ms = proxSeg * 86400000 - now;
    return Math.max(0, Math.floor(ms / 86400000)) + 'd ' + Math.max(0, Math.floor((ms % 86400000) / 3600000)) + 'h';
  }
  function verChances() { flash('SS: ' + ((ECONOMIA.invocacao.taxas.SS * 100).toFixed(0)) + '% · S ' + ((ECONOMIA.invocacao.taxas.S * 100).toFixed(0)) + '% · A ' + ((ECONOMIA.invocacao.taxas.A * 100).toFixed(0)) + '%. Pity garante SS em ' + ECONOMIA.invocacao.pity.duro + '.'); }

  const ABAS = [['destaques', 'Destaques'], ['gemas', 'Gemas'], ['passe', 'Passe'], ['deussemana', 'Deus da Semana'], ['outros', 'Outros']];
  function corpoHTML() {
    if (aba === 'gemas') return abaGemas();
    if (aba === 'passe') return abaPasse();
    if (aba === 'deussemana') return abaDeusSemana();
    if (aba === 'outros') return abaOutros();
    return abaDestaques();
  }
  function pintar() {
    const fix = document.getElementById('loja-root'); if (!fix) return;   // §371: só o miolo repinta; #loja-ov (toast/revelação) fica
    const online = !!LST;
    const g = online ? fmt(LST.saldo && LST.saldo.gema) : '—';
    const b = online ? fmt(LST.bilhetes) : '—';
    const e = online ? fmt(LST.saldo && LST.saldo.essencia) : '—';
    const tabs = ABAS.map(([k, r]) => `<button class="loja__tab${aba === k ? ' is-on' : ''}" onclick="LOJA.ir('${k}')">${esc(r)}</button>`).join('');
    fix.innerHTML = `<div id="loja">
      <header class="loja__cab">
        <button class="loja__voltar" id="bvoltar" onclick="LOJA.sair()">‹ Voltar</button>
        <h1 class="loja__titulo">Loja</h1>
        <div class="loja__saldos">
          <span class="loja__moeda" title="Gemas">💎 <b>${g}</b></span>
          <span class="loja__moeda" title="Bilhetes de invocação">🎫 <b>${b}</b></span>
          <span class="loja__moeda" title="Essência">✦ <b>${e}</b></span>
        </div>
      </header>
      <nav class="loja__tabs" role="tablist">${tabs}</nav>
      <div class="loja__corpo">${online ? corpoHTML() : '<p class="loja-vazio">Conecte-se para ver a Loja.</p>'}</div>
    </div>`;
  }

  // -------------------------------------------------- montagem (rota 'loja')
  function montar() {
    aba = 'destaques'; LST = null; ocupado = false;
    document.getElementById('stage').innerHTML = '<div id="baselayer" class="loja2"><div id="lojafix"><div id="loja-root"></div><div id="loja-ov"></div></div></div>';
    pintar();
    carregar();
    if (typeof fit === 'function') fit();
  }
  function aoSair() { fecharModal(); }

  // hooks de TESTE/auditoria: pinta um estado dado de forma síncrona (sem rede) e revela um SS.
  function _setEstadoTeste(loja, abaId) { LST = loja; if (abaId) aba = abaId; pintar(); }
  function _revelarTeste(ss) { revelarSS(ss); }

  return { montar, aoSair, ir, sair, comprarPacote, comprarPasse, resgatarPasse, comprarDeusSemana, anuncio, ofertaDia, confirmar, fecharRevelacao, revelarSS, verChances, _estado: () => LST, _setEstadoTeste, _revelarTeste };
})();
