// §371 — TELA DA LOJA (jsdom + servidor SIMULADO). Prova o que o enunciado pede no cliente: a ilha abre a rota; comprar
// pacote (confirmação simulada → envia a compra); comprar passe e resgatar hoje; dia perdido aparece como perdido; o dia 30
// mostra a REVELAÇÃO; assistir para a marca do Deus da Semana; os limites travam o botão com o motivo; "pagamento
// indisponível" vira mensagem; usar bilhete invoca e desconta. O cliente nunca soma — só mostra o que o servidor devolve.
const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

let falhas = 0, passes = 0;
const ok = (c, m) => { if (!c) { console.log('  ✗ FALHA: ' + m); falhas++; } else { console.log('  ✓ ' + m); passes++; } };
const html = fs.readFileSync(path.join(__dirname, '../dist/incursion.html'), 'utf8');
const sleep = ms => new Promise(r => setTimeout(r, ms));

// estado simulado do servidor (o que lojaEstado devolve) — mutável para refletir compras.
function estadoBase() {
  return {
    saldo: { gema: 1240, essencia: 180 }, bilhetes: 3,
    pacotes: [{ id: 'p1', reais: 4.90, gemas: 450, primeira: true, emDobro: true }, { id: 'p2', reais: 9.90, gemas: 950, primeira: true, emDobro: true }],
    passe: { ativo: true, diaAtual: 12, dias: Array.from({ length: 30 }, (_, i) => ({ dia: i + 1, estado: i < 11 ? ((i === 3 || i === 8) ? 'perdido' : 'resgatado') : (i === 11 ? 'hoje' : 'futuro'), recompensa: (i + 1 === 30) ? { ss: true } : (([7, 14, 21].includes(i + 1)) ? { gema: 150, bilhetes: 3 } : (i + 1 === 28 ? { gema: 150, bilhetes: 2 } : { gema: 150 })) })) },
    deusSemana: { deus: 'baldur', raridade: 'S', marcas: 3, meta: 5, dado: false, compraDireta: 1800 },
    anuncios: { total: 0, teto: 8, porTipo: {} }, vagasProvacao: 1,
  };
}

// monta uma página jsdom com um transporte simulado; `cfg` injeta respostas e grava as chamadas.
function montar(cfgResp) {
  const vc = new VirtualConsole(); let err = null;
  vc.on('jsdomError', e => err = (e.detail && e.detail.message) || e.message);
  const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://x/', virtualConsole: vc });
  const w = dom.window, d = w.document;
  w.__resp = cfgResp || {};
  w.eval(`
    window.__calls = [];
    lerToken = function(){ return 'tok'; };
    contaAtual = { perfil:{ moedas:{gema:1240,essencia:180}, deuses:{ zeus:{copias:1} } }, bilhetes:3, pity:10 };
    contaTransporte = { pedir: function(m){
      window.__calls.push(m);
      var r = window.__resp[m.tipo];
      if (typeof r === 'function') r = r(m);
      return Promise.resolve(r || { tipo:'semResposta', codigo:'sem_conexao' });
    } };
  `);
  return { w, d, err: () => err, calls: () => w.__calls, $: s => d.querySelector(s), $$: s => [...d.querySelectorAll(s)], clk: el => el && el.dispatchEvent(new w.MouseEvent('click', { bubbles: true })) };
}

(async () => {
  console.log('== §371 / TELA DA LOJA (jsdom + servidor simulado) ==');

  // 1) a ilha "Loja" da home abre a rota 'loja'.
  {
    const P = montar({ lojaEstado: { tipo: 'lojaEstado', loja: estadoBase(), conta: null } });
    P.w.eval("ir('home',{},{substituir:true}); render();");
    await sleep(30);
    const ilha = P.$$('.ilha').find(e => /Loja/.test(e.textContent));
    ok(!!ilha, 'a ilha Loja existe na home');
    P.clk(ilha); await sleep(40);
    ok(P.w.eval("rotaAtual()") === 'loja', 'clicar na ilha Loja abre a rota loja');
    ok(!!P.$('#lojafix') && P.$$('.loja__tab').length === 5, 'a Loja renderiza com as 5 abas');
    ok(!P.err(), 'sem erro de jsdom (' + (P.err() || 'ok') + ')');
  }

  // 2) comprar um pacote: confirmação SIMULADA → envia lojaComprarPacote com confirmacao.
  {
    const P = montar({ lojaEstado: { tipo: 'lojaEstado', loja: estadoBase(), conta: null },
      lojaComprarPacote: m => ({ tipo: 'lojaCompra', o: 'pacote', gemas: 900, emDobro: true, saldo: { gema: 2140, essencia: 180 }, conta: null }) });
    P.w.eval("ir('loja',{},{substituir:true}); render();"); await sleep(40);
    P.w.eval("LOJA.ir('gemas')");
    ok(P.$$('.loja-pac__selo').length >= 1, 'o pacote mostra o selo "1ª compra em dobro"');
    P.clk(P.$('.loja-pac'));
    ok(/COMPRA SIMULADA/.test((P.$('.loja-modal__sub') || {}).textContent || ''), 'abre a confirmação de COMPRA SIMULADA');
    P.clk(P.$('.loja-modal__ok')); await sleep(40);
    const envi = P.calls().find(c => c.tipo === 'lojaComprarPacote');
    ok(envi && envi.confirmacao && envi.confirmacao.simulado && envi.idCompra, 'confirmar envia lojaComprarPacote com confirmacao simulada + idCompra');
    ok(!P.$('.loja-modal'), 'o modal fecha após confirmar');
  }

  // 3) PASSE: resgatar HOJE (dia 12) → envia lojaResgatarPasse; dia perdido aparece como perdido.
  {
    const P = montar({ lojaEstado: { tipo: 'lojaEstado', loja: estadoBase(), conta: null },
      lojaResgatarPasse: { tipo: 'lojaPasseResgate', premio: { dia: 12, gema: 150 }, saldo: { gema: 1390, essencia: 180 }, bilhetes: 3, conta: null } });
    P.w.eval("ir('loja',{},{substituir:true}); render();"); await sleep(40);
    P.w.eval("LOJA.ir('passe')");
    ok(P.$$('.loja-dia').length === 30, 'o calendário mostra 30 dias');
    ok(P.$$('.loja-dia--perdido').length === 2, 'os dias não resgatados aparecem como PERDIDOS');
    ok(!!P.$('.loja-dia--hoje') && !!P.$('.loja-dia__btn'), 'o dia de hoje tem o botão Resgatar');
    ok(!!P.$('.loja-dia--ssbox'), 'o dia 30 é o selo SS');
    P.clk(P.$('.loja-dia__btn')); await sleep(40);
    ok(P.calls().some(c => c.tipo === 'lojaResgatarPasse'), 'resgatar envia lojaResgatarPasse');
  }

  // 4) dia 30 → a REVELAÇÃO do SS (reusa a carta da Invocação).
  {
    const P = montar({ lojaEstado: { tipo: 'lojaEstado', loja: estadoBase(), conta: null },
      lojaResgatarPasse: { tipo: 'lojaPasseResgate', premio: { dia: 30, ss: { ok: true, key: 'zeus', raridade: 'SS', novo: true, pontos: 0 } }, saldo: { gema: 1240, essencia: 180 }, bilhetes: 3, conta: null } });
    P.w.eval("ir('loja',{},{substituir:true}); render();"); await sleep(40);
    P.w.eval("LOJA.resgatarPasse()"); await sleep(40);
    ok(!!P.$('#lojafix #iv .iv-reveal.iv-show') && P.$$('#lojafix .iv-carta').length === 1, 'o dia 30 mostra a REVELAÇÃO do deus SS (uma carta)');
  }

  // 5) Deus da Semana: assistir → confirmação de ANÚNCIO → lojaAnuncio marcaDeusSemana.
  {
    const P = montar({ lojaEstado: { tipo: 'lojaEstado', loja: estadoBase(), conta: null },
      lojaAnuncio: { tipo: 'lojaAnuncio', premio: { tipo: 'marcaDeusSemana', deusSemana: { marcas: 4, meta: 5 } }, uso: { total: 1, teto: 8 }, conta: null } });
    P.w.eval("ir('loja',{},{substituir:true}); render();"); await sleep(40);
    P.w.eval("LOJA.ir('deussemana')");
    const btn = P.$$('.loja-ds .loja-cta').find(b => /Assistir/.test(b.textContent));
    ok(!!btn, 'o Deus da Semana tem o botão Assistir (+1 marca)');
    P.clk(btn);
    ok(/ANÚNCIO SIMULADO/.test((P.$('.loja-modal__sub') || {}).textContent || ''), 'abre a confirmação de ANÚNCIO SIMULADO');
    P.clk(P.$('.loja-modal__ok')); await sleep(40);
    const a = P.calls().find(c => c.tipo === 'lojaAnuncio');
    ok(a && a.anuncio === 'marcaDeusSemana' && a.id && a.confirmacao, 'confirmar envia lojaAnuncio marcaDeusSemana com id + confirmacao');
  }

  // 6) LIMITES travam o botão com o motivo (anúncio já usado hoje / teto do dia).
  {
    const loja = estadoBase(); loja.anuncios = { total: 1, teto: 8, porTipo: { ofertaDia: 3 } };   // ofertaDia limite 3/dia atingido
    const P = montar({ lojaEstado: { tipo: 'lojaEstado', loja, conta: null } });
    P.w.eval("ir('loja',{},{substituir:true}); render();"); await sleep(40);
    const oferta = P.$$('.loja-card--meio .loja-cta').find(b => /já usado|hoje|Limite|usado/i.test(b.textContent));
    ok(!!oferta && oferta.disabled, 'a Oferta do Dia esgotada fica travada com o motivo (' + (oferta && oferta.textContent.trim()) + ')');
  }

  // 7) "pagamento indisponível" → mensagem clara (sem quebrar).
  {
    const P = montar({ lojaEstado: { tipo: 'lojaEstado', loja: estadoBase(), conta: null },
      lojaComprarPacote: { tipo: 'recusado', codigo: 'pagamento_indisponivel', erro: 'pagamento indisponível' } });
    P.w.eval("ir('loja',{},{substituir:true}); render();"); await sleep(40);
    P.w.eval("LOJA.ir('gemas')"); P.clk(P.$('.loja-pac')); P.clk(P.$('.loja-modal__ok')); await sleep(40);
    ok(/indispon/i.test((P.$('#loja-toast') || {}).textContent || ''), 'pagamento recusado mostra "Compras indisponíveis no momento"');
    ok(!P.err(), 'não quebra ao recusar (' + (P.err() || 'ok') + ')');
  }

  // 8) USAR BILHETE: na Invocação, o botão invoca e desconta (conta p/ o pity é do servidor).
  {
    const P = montar({
      invocar: m => m.bilhete ? ({ tipo: 'invocado', resultados: [{ key: 'zeus', raridade: 'SS', novo: false, pontos: 4 }], saldo: { gema: 1240, essencia: 180 }, pity: 11, bilhetes: 2, conta: { perfil: { moedas: { gema: 1240, essencia: 180 }, deuses: { zeus: { copias: 1 } } }, bilhetes: 2, pity: 11 } }) : { tipo: 'recusado' },
    });
    P.w.eval("ir('invocacao',{},{substituir:true}); INV.montar();"); await sleep(40);
    const bil = P.$('.iv-pb.iv-bilhete');
    ok(!!bil && /3/.test(bil.textContent), 'a Invocação mostra "Usar bilhete" com o saldo (3)');
    ok(!!P.$('.iv-pb.iv-gratis'), 'a Invocação mostra a invocação grátis por anúncio');
    P.clk(bil); await sleep(50);
    const env = P.calls().find(c => c.tipo === 'invocar' && c.bilhete);
    ok(!!env, 'usar bilhete envia invocar{bilhete:true}');
    await sleep(20);
    const bil2 = P.$('.iv-pb.iv-bilhete');
    ok(bil2 && /2/.test(bil2.textContent), 'o saldo de bilhetes desce para 2 após usar');
  }

  if (falhas) { console.log(`\n>>> ${falhas} FALHA(S) (${passes} ok)`); process.exit(1); }
  console.log(`\n>>> LOJA TELA §371 OK (${passes})`);
  process.exit(0);
})().catch(e => { console.error(e.stack || e.message || e); process.exit(1); });
