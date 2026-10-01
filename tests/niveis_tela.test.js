// §319 FASE 4 — A TELA DOS NÍVEIS DE HABILIDADE (ref. aprovada pelo dono). A rota 'deus' da Coleção virou a
// tela de NÍVEIS: barra superior (‹ Coleção · nome · pontos), COLUNA ESQUERDA (identidade + PASSIVA + rodapé
// "X de Y") que NUNCA rola, e COLUNA DIREITA (3 painéis de habilidade) que PODE rolar. O servidor (subirNivel)
// é AUTORITATIVO; isto é TELA — tudo deriva do data/deuses (escadas), do kitEfetivo (texto no nível) e da
// economia.json (custo em pontos). GUARDAS §292/§295/§307/§308: estados × 4 larguras, nada cortado em silêncio,
// esquerda nunca rola, direita nunca corta na horizontal, toque do SUBIR/CONFIRMAR/CANCELAR >= piso (§301).
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
// monta uma conta ONLINE possuindo os deuses dados, com níveis/pontos à escolha, e abre a rota 'deus'.
function abrir(k, opts = {}) {
  const niveis = opts.niveis || {};
  const pontos = opts.pontos || {};
  const deuses = {}; (opts.possui || [k]).forEach(x => deuses[x] = { copias: 1 });
  w.eval(`perfil.deuses=${JSON.stringify(deuses)};
    contaAtual={nick:'T',ranque:{pontos:60},pontos:${JSON.stringify(pontos)},niveis:${JSON.stringify(niveis)},perfil:{deuses:${JSON.stringify(deuses)}},missoes:{ativa:null,progresso:{},liberados:[]}};
    nlConfirm=null;nlPendente=false;nlMsg=null;deusSelKey=null;ir('deus',{key:${JSON.stringify(k)}},{substituir:true});render();`);
}

console.log('== §319 / TELA DOS NÍVEIS DE HABILIDADE ==');
ok(w.eval("typeof subirNivelServidor==='function'"), 'o cliente tem subirNivelServidor (pede ao servidor autoritativo)');
ok(w.eval("typeof ECONOMIA==='object' && ECONOMIA.invocacao && ECONOMIA.invocacao.custoNivel && ECONOMIA.invocacao.custoNivel['2']===1"), 'o custo em pontos vem do economia.json (nv2=1)');

// ---- 1. BARRA SUPERIOR + COLUNA ESQUERDA (identidade + passiva + rodapé) ----
console.log('\n== 1. barra superior + coluna esquerda (identidade, passiva, rodapé "X de Y") ==');
err = null;
abrir('zeus', { pontos: { zeus: 3 }, niveis: { zeus: { basico: 1, habilidade: 1, milagre: 1 } } });
ok(!err, 'renderiza sem quebrar (' + (err || 'ok') + ')');
ok(/‹ Coleção/.test(txt($('#bvoltar'))), 'o voltar diz "‹ Coleção"');
ok(txt($('.nltop__nome')) === 'Zeus', 'a barra nomeia o deus (Cinzel)');
ok(/Pontos de Zeus: 3/.test(txt($('.nltop__ptn'))), 'os pontos do deus vêm da conta (servidor)');
ok(/4 pontos por cópia \(SS\)/.test(txt($('.nltop__cop'))), 'os pontos por cópia saem da raridade (pontosPorDuplicata, do dado)');
ok(!!$('.nlesq .nlmed .slot'), 'medalhão redondo na esquerda');
ok(/Grega · Tempestade/i.test(txt($('.nlid__sub'))), 'panteão · elemento (do data/deuses)');
ok(!!$('.nlpas') && /PASSIVA/.test(txt($('.nlpas__rot'))) && txt($('.nlpas__nome')) === 'Soberano', 'a PASSIVA fica na esquerda com nome');
ok(/não tem níveis/i.test(txt($('.nlpas__nota'))), 'a passiva diz que não tem níveis');
ok(txt($('.nlfoot__num')) === '3 de 12', 'rodapé "X de Y" = 3 de 12 (3 slots nv1; topos 4+4+4)');
ok(/Essência/.test(txt($('.nlfoot__nota'))), 'rodapé nota: cópias extras viram Essência');

// ---- 2. COLUNA DIREITA: 3 painéis, marcadores, Atual, Próximo (SÓ o que muda) ----
console.log('\n== 2. coluna direita: 3 painéis; marcadores; Atual; Próximo só o que muda ==');
{
  const P = $$('.nldir .nlp');
  ok(P.length === 3, `3 painéis ativos (básico/habilidade/milagre), há ${P.length}`);
  const p0 = P[0];
  ok(/Cetro do Trovão/.test(txt(p0.querySelector('.nlp__nome'))) && txt(p0.querySelector('.nlp__tipo')) === 'BÁSICO', 'painel: nome (Cinzel) + tipo');
  ok(!!p0.querySelector('.nlp__meta .cost') && /recarga|sem recarga/i.test(txt(p0.querySelector('.nlp__cd'))), 'painel: custo (orbes) + recarga (do kit efetivo)');
  ok(p0.querySelectorAll('.nlpin').length === 4 && p0.querySelectorAll('.nlpin.on').length === 1, 'marcadores: 4 (topo) com 1 aceso (nv atual)');
  ok(txt(p0.querySelector('.nlp__nv')) === 'Nível 1 de 4', '"Nível N de TOPO"');
  ok(/Atual:/.test(txt(p0.querySelector('.nlp__atual'))) && /15 de dano/.test(txt(p0.querySelector('.nlp__atual'))), 'Atual: texto do nível atual (kit efetivo)');
  const prox = txt(p0.querySelector('.nlp__prox'));
  ok(/Próximo \(nível 2\)/.test(prox) && /15 → 16/.test(prox), 'Próximo: SÓ o número que muda (15 → 16)');
  ok(!/de dano a 1 inimigo/.test(prox.replace(/Próximo[^:]*:/, '')), 'Próximo NÃO repete a frase inteira (só o que muda)');
}

// ---- 3. Próximo com SALTO: "Novo: <nova parte>" derivado do texto, não escrito à mão ----
console.log('\n== 3. Próximo com SALTO → "Novo:" (derivado do desc do próximo nível) ==');
{
  abrir('zeus', { pontos: { zeus: 0 }, niveis: { zeus: { basico: 3, habilidade: 3, milagre: 4 } } });
  const P = $$('.nldir .nlp');
  ok(!!P[0].querySelector('.nlp__novo') && /Novo:/.test(txt(P[0].querySelector('.nlp__prox'))), 'básico nv3→nv4 (efeito novo): "Novo:" aparece');
  ok(/menos de dano/.test(txt(P[0].querySelector('.nlp__novo'))), 'o "Novo:" cita a oração nova do desc (não inventada)');
  ok(/2 turnos/.test(txt(P[1].querySelector('.nlp__prox'))), 'habilidade nv3→nv4 (duração): a nova redação aparece no Próximo');
  ok(txt(P[2].querySelector('.nlp__max')) === 'NÍVEL MÁXIMO' && !P[2].querySelector('[data-subir]'), 'milagre nv4: "NÍVEL MÁXIMO", sem botão');
  ok(P[2].querySelectorAll('.nlpin.on').length === 4, 'milagre no máximo: todos os marcadores acesos');
}

// ---- 4. BOTÃO SUBIR: custo em pontos; pode pagar (ouro) × faltam pontos (apagado) ----
console.log('\n== 4. SUBIR: custo em pontos; pode pagar × faltam pontos ==');
{
  // pode pagar: 1 ponto → o básico (custo 1) vira botão de ouro
  abrir('zeus', { pontos: { zeus: 1 }, niveis: { zeus: { basico: 1, habilidade: 1, milagre: 1 } } });
  const bt0 = $$('.nldir .nlp')[0].querySelector('[data-subir]');
  ok(!!bt0 && /SUBIR · 1 ponto/.test(txt(bt0)) && bt0.classList.contains('b--primary'), 'básico (custo 1, tem 1): botão de ouro "SUBIR · 1 ponto"');
  // faltam pontos: 0 pontos → o básico fica apagado + "Faltam 1 ponto", sem botão ativo
  abrir('zeus', { pontos: { zeus: 0 }, niveis: { zeus: { basico: 1, habilidade: 1, milagre: 1 } } });
  const p0 = $$('.nldir .nlp')[0];
  ok(!p0.querySelector('[data-subir]') && p0.querySelector('.nlp__acao .b').disabled, 'sem pontos: o botão fica apagado (sem SUBIR ativo)');
  ok(/Falta 1 ponto/.test(txt(p0.querySelector('.nlp__nota'))), 'sem pontos: "Falta 1 ponto" (concordância singular)');
}

// ---- 5. SEM ESCADA (Aquiles básico): cópia genérica, sem marcadores, sem botão; nada técnico vaza ----
console.log('\n== 5. sem escada: cópia genérica, sem marcadores/botão ==');
{
  abrir('aquiles', { pontos: { aquiles: 0 }, niveis: { aquiles: { basico: 1, habilidade: 1, milagre: 1 } } });
  const P = $$('.nldir .nlp');
  ok(!!P[0].querySelector('.nlp__sem'), 'o básico do Aquiles cai no estado SEM ESCADA');
  ok(/não tem níveis/i.test(txt(P[0].querySelector('.nlp__semt'))), 'diz "Esta habilidade não tem níveis."');
  ok(/desequilibraria/i.test(txt(P[0].querySelector('.nlp__sems'))), 'a linha menor explica sem número técnico');
  ok(!P[0].querySelector('.nlpin') && !P[0].querySelector('[data-subir]') && !P[0].querySelector('.nlp__max'), 'sem marcadores, sem botão, sem selo de máximo');
  ok(txt($('.nlfoot__num')) === '3 de 9', '"X de Y" conta o slot sem-escada como topo 1 (3 de 9)');
}

// ---- 6. ESCADA CURTA (Fujin básico/milagre): topo < 4, marcadores conforme os degraus ----
console.log('\n== 6. escada curta: topo abaixo de 4 ==');
{
  abrir('fujin', { pontos: { fujin: 0 }, niveis: { fujin: { basico: 1, habilidade: 1, milagre: 1 } } });
  const P = $$('.nldir .nlp');
  ok(txt(P[0].querySelector('.nlp__nv')) === 'Nível 1 de 3' && P[0].querySelectorAll('.nlpin').length === 3, 'básico escada curta: "Nível 1 de 3", 3 marcadores');
  ok(txt(P[2].querySelector('.nlp__nv')) === 'Nível 1 de 3', 'milagre escada curta: topo 3');
  ok(txt($('.nlfoot__num')) === '3 de 10', '"X de Y" soma os topos reais das curtas (3 de 10)');
}

// ---- 7. CONFIRMAÇÃO INLINE (§245): SUBIR abre; CANCELAR fecha; CONFIRMAR chama o servidor e bloqueia o duplo ----
console.log('\n== 7. confirmação inline (§245): abre, cancela, confirma (servidor autoritativo) ==');
{
  abrir('zeus', { pontos: { zeus: 3 }, niveis: { zeus: { basico: 1, habilidade: 1, milagre: 1 } } });
  clk($('.nldir .nlp [data-subir]'));
  ok(!!$('.nlp__conf') && /Não dá para desfazer/.test(txt($('.nlp__conf'))), 'SUBIR abre a confirmação inline no painel (sem modal)');
  ok(!!$('[data-subir-ok]') && !!$('[data-subir-no]'), 'a confirmação tem CONFIRMAR e CANCELAR');
  clk($('[data-subir-no]'));
  ok(!$('.nlp__conf') && !!$('.nldir .nlp [data-subir]'), 'CANCELAR fecha e devolve o botão SUBIR');
  // CONFIRMAR com servidor DUBLE (sucesso) → atualiza nível/pontos; a confirmação fecha.
  w.eval("subirNivelServidor=async function(k,sl){ contaAtual.pontos[k]-=1; contaAtual.niveis[k][sl]=(contaAtual.niveis[k][sl]||1)+1; render(); return {ok:true,nivel:contaAtual.niveis[k][sl],pontos:contaAtual.pontos[k]}; };");
  clk($('.nldir .nlp [data-subir]'));
  clk($('[data-subir-ok]'));
}

// a resposta do servidor é assíncrona (Promise) — espera um tique antes de conferir o efeito.
setTimeout(() => {
  ok(txt($$('.nldir .nlp')[0].querySelector('.nlp__nv')) === 'Nível 2 de 4', 'após CONFIRMAR (servidor), o nível sobe (1 → 2)');
  ok(/Pontos de Zeus: 2/.test(txt($('.nltop__ptn'))), 'os pontos baixam pelo custo (3 → 2)');
  ok(!$('.nlp__conf'), 'a confirmação fecha após a resposta');

  // ---- 8. RECUSA do servidor → linha curta no painel ----
  console.log('\n== 8. recusa do servidor → linha curta no painel ==');
  w.eval("subirNivelServidor=async function(){ return {erro:'x',codigo:'pontos_insuficientes'}; }; nlConfirm=null;nlMsg=null;render();");
  clk($('.nldir .nlp [data-subir]'));
  clk($('[data-subir-ok]'));
  setTimeout(() => {
    ok(/Pontos insuficientes/.test(txt($('.nlp__erro'))), 'recusa "pontos_insuficientes" → mensagem curta no painel');

    // ---- 9. NÃO POSSUÍDO: aviso + escada só-leitura, sem botões ----
    console.log('\n== 9. não possuído: aviso + escada só-leitura ==');
    abrir('ahpuch', { possui: ['zeus'] });   // possui zeus, NÃO ahpuch
    ok(/não tem este deus/i.test(txt($('.nltop__pts--falta'))), '"Você ainda não tem este deus" na barra');
    ok(!!$('.nlmed__tag') && /NÃO POSSUI/.test(txt($('.nlmed__tag'))), 'tag no medalhão');
    ok($$('[data-subir]').length === 0 && $$('[data-subir-ok]').length === 0, 'nenhum botão (escada só-leitura)');
    ok($$('.nldir .nlp .nlp__esc').length >= 1, 'a escada continua legível');

    // ---- 10. SEM CONEXÃO: botões apagados + aviso; nenhum SUBIR ativo ----
    console.log('\n== 10. sem conexão: botões apagados + aviso ==');
    w.eval("contaAtual=null;perfil.deuses={zeus:{copias:1,obtidoEm:0}};deusSelKey=null;ir('deus',{key:'zeus'},{substituir:true});render();");
    const z0 = $$('.nldir .nlp')[0];
    ok(!!z0.querySelector('.b--wait[disabled]') && /Sem conexão/.test(txt(z0.querySelector('.nlp__nota'))), 'offline: botão SUBIR apagado + "Sem conexão com o servidor"');
    ok($$('[data-subir]').length === 0, 'offline: nenhum SUBIR ativo (o servidor é a verdade)');

    console.log(`\n${falhas ? '✗ ' + falhas + ' FALHA(S)' : '✓ jsdom verde'} · ${passes} asserções`);
    larguras();
  }, 20);
}, 20);

// ================= §292/§295/§307/§308 — LARGURA 780/893/1075/1200: esquerda nunca rola, direita nunca corta
//                   na horizontal, nenhum nome de habilidade cortado por reticência, toque dos botões >= 44px =================
function larguras() {
  (async () => {
    const { chromium } = require('playwright');
    function acharChromium() { try { const base = '/opt/pw-browsers'; const dir = fs.readdirSync(base).filter(x => /^chromium-\d+$/.test(x)).sort().pop(); const bin = path.join(base, dir, 'chrome-linux', 'chrome'); if (fs.existsSync(bin)) return bin; } catch (e) {} return undefined; }
    const distAbs = 'file://' + path.resolve(__dirname, '..', 'dist', 'incursion.html');
    // o deus com o nome de habilidade mais longo (nowrap no painel) estressa a reticência.
    const nomeLongo = (() => {
      let best = { len: 0, k: 'zeus' };
      for (const f of fs.readdirSync(path.resolve(__dirname, '..', 'data', 'deuses'))) {
        const g = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', 'data', 'deuses', f)));
        (g.ab || []).forEach(a => { if (a.nome && a.nome.length > best.len) best = { len: a.nome.length, k: g.key }; });
      }
      return best.k;
    })();
    // mocks (cada um retorna o eval que arma contaAtual + abre a rota 'deus')
    const C = (k, pontos, niveis, possui) => `perfil.deuses=${JSON.stringify((possui || [k]).reduce((o, x) => (o[x] = { copias: 1, obtidoEm: 0 }, o), {}))};contaAtual={nick:'T',ranque:{pontos:60},pontos:${JSON.stringify(pontos || {})},niveis:${JSON.stringify(niveis || {})},perfil:{deuses:perfil.deuses},missoes:{ativa:null,progresso:{},liberados:[]}};nlConfirm=null;nlPendente=false;nlMsg=null;deusSelKey=null;ir('deus',{key:${JSON.stringify(k)}},{substituir:true});render();`;
    const casos = {
      'zeus meio':       C('zeus', { zeus: 5 }, { zeus: { basico: 2, habilidade: 1, milagre: 1 } }),
      'zeus nv1':        C('zeus', { zeus: 0 }, { zeus: { basico: 1, habilidade: 1, milagre: 1 } }),
      'zeus máximo':     C('zeus', { zeus: 0 }, { zeus: { basico: 4, habilidade: 4, milagre: 4 } }),
      'aquiles s/escada':C('aquiles', { aquiles: 0 }, { aquiles: { basico: 1, habilidade: 1, milagre: 1 } }),
      'fujin curta':     C('fujin', { fujin: 9 }, { fujin: { basico: 1, habilidade: 1, milagre: 1 } }),
      'zeus s/pontos':   C('zeus', { zeus: 0 }, { zeus: { basico: 1, habilidade: 1, milagre: 1 } }),
      'não possuído':    C('ahpuch', {}, {}, ['zeus']),
      'nome longo':      C(nomeLongo, { [nomeLongo]: 9 }, {}),
      'confirmação':     C('zeus', { zeus: 3 }, { zeus: { basico: 1, habilidade: 1, milagre: 1 } }) + "clk();",
      'sem conexão':     `perfil.deuses={zeus:{copias:1,obtidoEm:0}};contaAtual=null;nlConfirm=null;nlMsg=null;deusSelKey=null;ir('deus',{key:'zeus'},{substituir:true});render();`,
    };
    let cf = 0; const ok2 = (c, m) => { if (!c) { cf++; console.log('  XX ' + m); } else console.log('  ok ' + m); };
    const browser = await chromium.launch({ executablePath: acharChromium(), headless: true });
    for (const W of [780, 893, 1075, 1200]) {
      for (const [nome, mk] of Object.entries(casos)) {
        const page = await (await browser.newContext({ viewport: { width: W, height: 428 }, deviceScaleFactor: 2 })).newPage();
        await page.goto(distAbs, { waitUntil: 'load' });
        await page.evaluate("window.clk=function(){var b=document.querySelector('.nldir .nlp [data-subir]');if(b)b.dispatchEvent(new MouseEvent('click',{bubbles:true}));};");
        await page.evaluate(mk); await page.waitForTimeout(90);
        const r = await page.evaluate(() => {
          const esq = document.querySelector('.nlesq'); const dir = document.querySelector('.nldir');
          const esqClip = esq ? (esq.scrollHeight - esq.clientHeight) : 0;
          const rb = dir.getBoundingClientRect(); const cw = dir.clientWidth; let over = 0;
          dir.querySelectorAll('*').forEach(el => { const o = el.getBoundingClientRect().right - rb.left - cw; if (o > over) over = o; });
          // pior NOME de habilidade (nowrap): natural (clone) vs a caixa — nada por reticência.
          let nameClip = 0;
          document.querySelectorAll('.nlp__nome').forEach(el => { const cs = getComputedStyle(el); const c = document.createElement('span'); c.textContent = el.textContent; c.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap;font:' + cs.font; document.body.appendChild(c); const nat = c.offsetWidth; c.remove(); const clip = nat - el.clientWidth; if (clip > nameClip) nameClip = clip; });
          // toque dos botões de ação (SUBIR/CONFIRMAR/CANCELAR)
          let btnMin = 99; document.querySelectorAll('.nlp__acao .b, .nlp__confb .b').forEach(b => { const h = b.getBoundingClientRect().height; if (h < btnMin) btnMin = h; });
          if (btnMin === 99) btnMin = 44;   // estados sem botão (máximo/sem escada) não têm toque a medir
          return { esqClip: Math.round(esqClip), over: Math.round(over), nameClip: Math.round(nameClip), btnMin: Math.round(btnMin) };
        });
        ok2(r.esqClip <= 1, `${W} ${nome}: a coluna esquerda NÃO rola (clip ${r.esqClip})`);
        ok2(r.over <= 1, `${W} ${nome}: a coluna direita não corta na horizontal (over ${r.over})`);
        ok2(r.nameClip <= 1, `${W} ${nome}: nenhum nome de habilidade cortado por reticência (clip ${r.nameClip})`);
        ok2(r.btnMin >= 44, `${W} ${nome}: toque dos botões >= 44px (menor ${r.btnMin})`);
        await page.close();
      }
    }
    await browser.close();
    if (cf || falhas) { console.log(`\n== ${cf} falha(s) de largura + ${falhas} jsdom ==`); process.exit(1); }
    console.log('\n== TELA DE NÍVEIS §319 OK (jsdom + 4 larguras) ==');
    process.exit(0);
  })().catch(e => { console.error(e.message || e); process.exit(1); });
}
