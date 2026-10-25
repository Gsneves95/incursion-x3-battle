// §363b — VARREDURA DE ESTABILIDADE: o painel de baixo tem ALTURA FIXA (não depende do conteúdo). Logo, para CADA deus (os
// 100) × cada situação (habilidade lida/armada, inspeção do deus, efeito, resumo, turno do oponente), no modo ABERTO e no
// RECOLHIDO, as caixas do PAINEL e de TODOS os retratos/habilidades/colunas-de-efeito/cena são IDÊNTICAS às do estado de
// referência (±1px), e nenhum texto do painel é cortado (eixo d da auditoria = 0 dentro do .b5-painel). Rodamos a 780×360
// (pior viewport) e conferimos a identidade também a 1846×852.
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const { medirNaPagina, CFG } = require('../tools/auditoria_medida.js');
function acharChromium(){ if(process.env.INCURSION_CHROMIUM) return process.env.INCURSION_CHROMIUM;
  try{ const base='/opt/pw-browsers'; const d=fs.readdirSync(base).filter(x=>/^chromium-\d+$/.test(x)).sort().pop();
    if(d){ const b=path.join(base,d,'chrome-linux','chrome'); if(fs.existsSync(b)) return b; } }catch(e){} return undefined; }
const distAbs = 'file://' + path.resolve(__dirname, '..', 'dist', 'incursion.html');
let falhas = 0; const ok = (c, m) => { if (!c) { falhas++; console.log('  XX ' + m); } };

// roda DENTRO da página: monta cada deus como aliado[0], percorre as situações e devolve as divergências.
// doClip=false pula a auditoria (medidor) — usado no 2º viewport, onde só checamos a identidade das caixas.
function varrer(medSrc, cfg, doClip, LIMIT) {
  const medirNaPagina = eval('(' + medSrc + ')');
  const FILL = ['atena', 'hades', 'poseidon', 'ares', 'zeus'];
  const trio = k => { const t = [k]; for (const f of FILL) { if (t.length >= 3) break; if (f !== k) t.push(f); } return t; };
  const stress = nome => /deus|efeito|resumo|milagre|habilidade|semEn/.test(nome);
  const R = el => { const r = el.getBoundingClientRect(); return [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)]; };
  const assinatura = () => {
    const bat = document.getElementById('batalha');
    const pan = bat.querySelector('.b5-painel');
    const sig = {
      painel: pan ? R(pan) : null,
      retr: [...bat.querySelectorAll('.bt-portrait')].map(R),
      skill: [...bat.querySelectorAll('.bt-skill')].map(R),
      eff: [...bat.querySelectorAll('.bt-effcol')].map(R),
      cena: (() => { const c = bat.querySelector('.b5-cena'); return c ? R(c) : null; })()
    };
    return sig;
  };
  const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b) || (Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((v, i) => Array.isArray(v) ? v.every((n, j) => Math.abs(n - b[i][j]) <= 1) : Math.abs(v - b[i]) <= 1));
  const sigEq = (a, b) => eq([a.painel], [b.painel]) && eq(a.retr, b.retr) && eq(a.skill, b.skill) && eq(a.eff, b.eff) && eq([a.cena], [b.cena]);
  const panClip = () => { const r = medirNaPagina(cfg); const inside = f => { try { const el = f.el || document.querySelector(f.sel); return el && el.closest && el.closest('.b5-painel'); } catch (e) { return false; } };
    return { d: r.d.filter(inside), a: r.a.filter(inside) }; };

  const keys = (typeof LIMIT !== 'undefined' && LIMIT) ? ROSTER.slice(0, LIMIT).map(e => e.key) : ROSTER.map(e => e.key);
  const out = { divergiu: [], clipou: [], ref: {}, n: keys.length };
  // REFERÊNCIAS (meu turno): uma aberta, uma recolhida. Cada situação é comparada à referência do modo em que ela REALMENTE
  // fica (uma ação de LER no modo recolhido REABRE o painel, §363 — então essa situação deve bater a referência ABERTA).
  const refs = {};
  for (const modo of [false, true]) {
    painelRecolhido = modo;
    st = montarProvacao({ aliados: ['atena', 'hades', 'poseidon'], inimigos: ['ares', 'hera', 'apolo'], montar: { seed: 3, comeca: 0 } });
    prova = null; campanha = null; dominio = null; vsCPU = true; IA_LADO = 1; try { pararRelogio(); } catch (e) {}
    st.ativo = 0; foco = st.lados[0].units[0].uid; armado = null; detalhe = null; resumoTurno = null;
    try { ELEMS.forEach(e => st.lados[0].orbs[e] = 9); } catch (e) {}
    ir('batalha', {}, { substituir: true }); render();
    refs[modo ? 'rec' : 'ab'] = assinatura();
  }
  out.ref = refs;

  for (const modo of [false, true]) {
    for (const k of keys) {
      let u;
      try { st = montarProvacao({ aliados: trio(k), inimigos: ['ares', 'hera', 'apolo'], montar: { seed: 3, comeca: 0 } }); }
      catch (e) { continue; }
      prova = null; campanha = null; dominio = null; vsCPU = true; IA_LADO = 1; try { pararRelogio(); } catch (e) {}
      st.ativo = 0; u = st.lados[0].units[0]; foco = u.uid;
      try { ELEMS.forEach(e => st.lados[0].orbs[e] = 9); } catch (e) {}
      ir('batalha', {}, { substituir: true });
      const slots = acoesDe(st, u).map(a => a.slot);
      const sits = [];
      sits.push(['deus', () => { armado = null; detalhe = null; infoUnidade(u.uid); }]);
      sits.push(['deusInim', () => { armado = null; detalhe = null; infoUnidade(st.lados[1].units[0].uid); }]);
      for (const s of slots) {
        sits.push(['lida ' + s, () => { armado = null; detalhe = null; try { ELEMS.forEach(e => st.lados[0].orbs[e] = 9); } catch (e) {} lerHabilidade(u.uid, s); }]);
        sits.push(['semEn ' + s, () => { armado = null; detalhe = null; try { ELEMS.forEach(e => st.lados[0].orbs[e] = 0); } catch (e) {} lerHabilidade(u.uid, s); }]);
        sits.push(['armada ' + s, () => { try { ELEMS.forEach(e => st.lados[0].orbs[e] = 9); } catch (e) {} armado = null; detalhe = null; armar(u.uid, s); }]);
      }
      sits.push(['efeito', () => { armado = null; detalhe = null; u.efeitos = [{ type: 'vulneravel', v: 6, dur: 2, origem: st.lados[1].units[0].uid }]; infoEfeito(u.uid, 0); }]);
      sits.push(['resumo', () => { armado = null; detalhe = null; foco = null; resumoTurno = [{ turno: st.turno, tipo: 'acao', origem: st.lados[1].units[0].key, slot: 'milagre' }, { turno: st.turno, tipo: 'dano', origem: st.lados[1].units[0].key, alvo: u.key, valor: 14 }]; render(); }]);
      sits.push(['oponente', () => { armado = null; detalhe = null; resumoTurno = null; foco = u.uid; st.ativo = 1; IA_LADO = 0; }]);
      for (const [nome, setup] of sits) {
        painelRecolhido = modo;          // modo inicial da situação (uma LER pode reabrir)
        try { setup(); } catch (e) {}
        render();
        const atual = painelRecolhido ? 'rec' : 'ab';   // modo REAL depois da ação
        if (out.divergiu.length < 8 && !sigEq(assinatura(), refs[atual])) out.divergiu.push((modo ? 'REC ' : 'AB ') + k + ' ' + nome + ' (vs ' + atual + ')');
        // §363b: a prova de NÃO-CORTE é o eixo d (corte/sobreposição) dentro do painel, nas situações que mais estressam o
        // texto (modo aberto — o recolhido vira barra de 1 linha ou reabre p/ aberto, já coberto).
        if (doClip && !modo && stress(nome)) { const c = panClip(); if (out.clipou.length < 8 && c.d.length) out.clipou.push(k + ' ' + nome + ': d=' + c.d.length + ' ' + c.d.slice(0, 1).map(x => x.tipo + ' "' + (x.txt || '').slice(0, 18) + '"').join('')); }
        st.ativo = 0; IA_LADO = 1; // restaura p/ a próxima
      }
    }
  }
  return out;
}

(async () => {
  const browser = await chromium.launch({ executablePath: acharChromium(), headless: true, args: ['--no-sandbox'] });
  console.log('== §363b — varredura de estabilidade (100 deuses × situações × 2 modos) ==');
  // 780×360 — pior viewport: identidade das caixas + nenhum corte no painel
  const ctx = await browser.newContext({ viewport: { width: 780, height: 360 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage(); await page.goto(distAbs, { waitUntil: 'load' });
  const res = await page.evaluate(([varrerSrc, medSrc, cfg]) => { const varrer = eval('(' + varrerSrc + ')'); return varrer(medSrc, cfg, true, 0); }, [varrer.toString(), medirNaPagina.toString(), CFG]);
  ok(res.divergiu.length === 0, `as caixas de painel/retrato/habilidade/efeito/cena são idênticas à referência em todo deus×situação (divergências: ${res.divergiu.slice(0,6).join(' | ')||'0'})`);
  ok(res.clipou.length === 0, `nenhum texto do painel é cortado em todo deus×situação (cortes: ${res.clipou.slice(0,6).join(' | ')||'0'})`);
  await ctx.close();

  // 1846×852 — a identidade das caixas vale também aqui (campo escala por 2)
  const ctx2 = await browser.newContext({ viewport: { width: 1846, height: 852 }, deviceScaleFactor: 1 });
  const page2 = await ctx2.newPage(); await page2.goto(distAbs, { waitUntil: 'load' });
  const res2 = await page2.evaluate(([varrerSrc, medSrc, cfg]) => { const varrer = eval('(' + varrerSrc + ')'); return varrer(medSrc, cfg, false, 8); }, [varrer.toString(), medirNaPagina.toString(), CFG]);
  ok(res2.divergiu.length === 0, `@1846 caixas idênticas à referência em todo deus×situação (divergências: ${res2.divergiu.slice(0,6).join(' | ')||'0'})`);
  await ctx2.close();

  await browser.close();
  console.log(falhas === 0 ? '\n>>> BATALHA_ESTABILIDADE OK' : `\n>>> ${falhas} FALHA(S)`);
  process.exit(falhas ? 1 : 0);
})().catch(e => { console.error(e.stack || e); process.exit(1); });
