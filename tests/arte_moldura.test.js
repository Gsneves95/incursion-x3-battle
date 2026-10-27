// §355 — PROVAS do acabamento das artes de habilidade (moldura fina na cor da energia + filete escuro) e dos NOMES
// das cartas da revelação (texto HTML legível ≥12px). Browser REAL (Chromium): o pixel da borda do botão é medido de
// verdade; e o eixo (a) da auditoria (tools/auditoria_medida.js) passa a enxergar o tamanho REAL de texto SVG.
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const { medirNaPagina, CFG } = require('../tools/auditoria_medida.js');
let sharp; try { sharp = require('sharp'); } catch (e) { sharp = null; }

function acharChromium() {
  if (process.env.INCURSION_CHROMIUM) return process.env.INCURSION_CHROMIUM;
  try { const b = '/opt/pw-browsers'; const d = fs.readdirSync(b).filter(x => /^chromium-\d+$/.test(x)).sort().pop(); const p = path.join(b, d, 'chrome-linux', 'chrome'); if (fs.existsSync(p)) return p; } catch (e) {}
  return undefined;
}
const dist = 'file://' + path.resolve(__dirname, '..', 'dist', 'incursion.html');
let falhas = 0;
const ok = (c, m) => { if (!c) { falhas++; console.log('  ✗ FALHA: ' + m); } else console.log('  ✓ ' + m); };
const lum = (r, g, b) => 0.2126 * r + 0.7152 * g + 0.0722 * b;
const parseRGB = s => { const m = String(s).match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(',').map(x => parseFloat(x)); return [p[0], p[1], p[2]]; };

const BASE = `try{perfil.deuses={};ROSTER.slice(0,60).forEach(e=>perfil.deuses[e.key]={copias:2,obtidoEm:Date.now()});contaAtual={nick:'H',perfil,ranque:{pontos:1200}};}catch(e){}`;
const BTBOOT = `st=montarProvacao({aliados:['hades','babi','zeus'],inimigos:['poseidon','hera','apolo'],montar:{seed:3,comeca:0}});prova=null;campanha=null;dominio=null;vsCPU=true;IA_LADO=1;try{pararRelogio();}catch(e){}try{ELEMS.forEach(e=>st.lados[0].orbs[e]=9);}catch(e){}st.ativo=0;foco=st.lados[0].units[0].uid;armado=null;detalhe=null;resumoTurno=null;menuAberto=false;ov=null;ir('batalha',{},{substituir:true});render();`;
const STUB = `contaTransporte={pedir:function(){var res=[];for(var i=0;i<10;i++)res.push({key:ROSTER[i].key,raridade:i===0?'SS':(i<3?'S':'A'),novo:i%2===0,essencia:i<3?0:40,pontos:0});return Promise.resolve({tipo:'invocado',resultados:res,saldo:{gema:98650,essencia:5000},pity:12,conta:contaAtual});}};lerToken=function(){return 'tok';};`;

(async () => {
  if (!sharp) { console.log('  (sharp ausente — pulo a prova de pixel)'); }
  const br = await chromium.launch({ executablePath: acharChromium(), headless: true, args: ['--no-sandbox'] });

  // ===== 1. MOLDURA: a borda de um botão de habilidade USÁVEL tem a cor da energia; 1–2px p/ dentro, o filete escuro =====
  console.log('== §355: moldura da arte de habilidade (cor da energia na borda + filete escuro por dentro) ==');
  {
    const pg = await (await br.newContext({ viewport: { width: 780, height: 360 }, deviceScaleFactor: 1 })).newPage();
    await pg.goto(dist, { waitUntil: 'load' });
    await pg.evaluate(b => { eval(b); }, BASE);
    await pg.evaluate(x => { eval(x); const g = document.getElementById('gsplash'); if (g) g.remove(); }, BTBOOT);
    await pg.waitForTimeout(400);
    const info = await pg.evaluate(() => {
      const b = document.querySelector('.bt-skill.is-ready .slot--sk') ? document.querySelector('.bt-skill.is-ready') : null;
      if (!b) return null;
      const sl = b.querySelector('.slot--sk');
      const r = b.getBoundingClientRect();
      const sp = document.createElement('span'); sp.style.color = getComputedStyle(sl).getPropertyValue('--sk-en').trim() || '#C8CEDA';
      document.body.appendChild(sp); const en = getComputedStyle(sp).color; sp.remove();
      return { left: Math.round(r.left), top: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height), en };
    });
    ok(!!info, 'há um botão de habilidade USÁVEL com moldura (.bt-skill.is-ready .slot--sk)');
    if (info && sharp) {
      const buf = await pg.screenshot({ clip: { x: 0, y: 0, width: 780, height: 360 } });
      const { data, info: im } = await sharp(buf).raw().toBuffer({ resolveWithObject: true });
      const W = im.width, ch = im.channels;
      const px = (x, y) => { const i = (y * W + x) * ch; return [data[i], data[i + 1], data[i + 2]]; };
      const en = parseRGB(info.en) || [200, 200, 200];
      const y = info.top + Math.round(info.h / 2);
      // varre a borda esquerda: acha o pixel da MOLDURA (mais perto da cor da energia) nos primeiros 3px
      let best = 999, bestX = -1;
      for (let dx = 0; dx <= 3; dx++) { const p = px(info.left + dx, y); const d = Math.abs(p[0] - en[0]) + Math.abs(p[1] - en[1]) + Math.abs(p[2] - en[2]); if (d < best) { best = d; bestX = info.left + dx; } }
      ok(best < 150, `a borda do botão tem a cor da energia ${info.en} (dif ${best} < 150, em x=${bestX})`);
      // o FILETE escuro: 1–2px p/ DENTRO da moldura há um pixel nitidamente mais escuro que a moldura
      const lMold = lum(...px(bestX, y));
      let lMin = 999; for (let dx = 1; dx <= 3; dx++) { const l = lum(...px(bestX + dx, y)); if (l < lMin) lMin = l; }
      ok(lMin < lMold - 35, `1–2px p/ dentro há o filete escuro (lum ${Math.round(lMin)} < moldura ${Math.round(lMold)}−35)`);
    }
    await pg.close();
  }

  // ===== 2. A moldura NÃO alterou o tamanho do botão (o ::after é inset; o layout não muda) — amostra batalha =====
  console.log('== §355: a moldura (::after inset) não muda o tamanho do botão ==');
  {
    const pg = await (await br.newContext({ viewport: { width: 780, height: 360 }, deviceScaleFactor: 1 })).newPage();
    await pg.goto(dist, { waitUntil: 'load' });
    await pg.evaluate(b => { eval(b); }, BASE);
    await pg.evaluate(x => { eval(x); const g = document.getElementById('gsplash'); if (g) g.remove(); }, BTBOOT);
    await pg.waitForTimeout(300);
    const sizes = await pg.evaluate(() => [...document.querySelectorAll('.bt-skill')].map(b => Math.round(b.getBoundingClientRect().width)));
    ok(sizes.length > 0 && sizes.every(w => w === sizes[0]), `todos os botões de habilidade têm a mesma largura (${sizes[0]}px, ${sizes.length} botões) — a moldura não empurrou nada`);
    await pg.close();
  }

  // ===== 3. NOMES da revelação ×10: TEXTO HTML, ≥12px reais, sem corte =====
  console.log('== §355: nomes da revelação ×10 em TEXTO HTML, ≥12px reais, sem corte ==');
  {
    const pg = await (await br.newContext({ viewport: { width: 780, height: 360 }, deviceScaleFactor: 1 })).newPage();
    await pg.goto(dist, { waitUntil: 'load' });
    await pg.evaluate(b => { eval(b); }, BASE);
    await pg.evaluate(x => { const g = document.getElementById('gsplash'); if (g) g.remove(); ir('invocacao', {}, { substituir: true }); INV.montar(); eval(x); }, STUB);
    await pg.evaluate(() => INV.pull(10));
    await pg.waitForFunction(() => document.querySelectorAll('#iv-cards .iv-carta').length === 10, { timeout: 4000 });
    await pg.waitForTimeout(300);
    const nomes = await pg.evaluate(() => [...document.querySelectorAll('.iv-cardnome')].map(n => {
      const r = n.getBoundingClientRect();
      return { t: n.textContent.trim(), px: parseFloat(getComputedStyle(n).fontSize), corte: n.scrollHeight > n.clientHeight + 1 || n.scrollWidth > n.clientWidth + 1, ell: getComputedStyle(n).textOverflow === 'ellipsis' };
    }));
    ok(nomes.length === 10, `a revelação ×10 tem 10 NOMES em TEXTO HTML (tem ${nomes.length})`);
    ok(nomes.every(n => n.px >= 12), `os 10 nomes têm ≥12px (menor ${Math.min(...nomes.map(n => n.px))}px)`);
    ok(nomes.every(n => n.t.length > 0), 'todos os nomes têm texto');
    ok(nomes.every(n => !n.corte && !n.ell), 'nenhum nome é cortado (sem overflow, sem reticência)');
    // SEM mais texto SVG de nome dentro das cartas (saiu p/ o HTML abaixo)
    const svgNome = await pg.evaluate(() => document.querySelectorAll('#iv-cards text.iv-nome').length);
    ok(svgNome === 0, `o nome SVG saiu da carta (text.iv-nome=${svgNome})`);
    await pg.close();
  }

  // ===== 4. EIXO (a) ENXERGA SVG: um <text> SVG minúsculo na tela é ACUSADO pelo medidor =====
  console.log('== §355: o eixo (a) mede o tamanho REAL de texto SVG (font-size × escala do viewBox) ==');
  {
    const pg = await (await br.newContext({ viewport: { width: 780, height: 360 }, deviceScaleFactor: 1 })).newPage();
    await pg.goto(dist, { waitUntil: 'load' });
    // injeta um SVG cujo texto, pelo viewBox, rende ~4px REAIS (font-size 20 num viewBox 200 exibido a 40px)
    await pg.evaluate(() => {
      const g = document.getElementById('gsplash'); if (g) g.remove();
      document.getElementById('stage').innerHTML = '<div id="probe" style="position:absolute;left:20px;top:20px"><svg viewBox="0 0 200 200" style="width:40px;height:40px"><text x="10" y="100" font-size="20" fill="#fff">abc</text></svg></div>';
    });
    const achou = await pg.evaluate((cfg) => {
      // replica a medição SVG do eixo (a): font-size × escala do getScreenCTM
      const t = document.querySelector('#probe text');
      const fpx = parseFloat(getComputedStyle(t).fontSize) || 0;
      const m = t.getScreenCTM(); const sc = m ? Math.sqrt(Math.abs(m.a * m.d - m.b * m.c)) : 1;
      return { real: +(fpx * sc).toFixed(2), design: fpx };
    }, CFG);
    ok(achou.real < 6 && achou.design >= 18, `texto SVG de design ${achou.design}px mede ${achou.real}px REAIS (viewBox encolhe) — o eixo (a) vê o tamanho real`);
    const r = await pg.evaluate(medirNaPagina, CFG);
    ok(r.a.some(x => /probe|text/.test(x.sel) || x.txt === 'abc'), `o eixo (a) ACUSA o texto SVG minúsculo (a=${r.a.length})`);
    await pg.close();
  }

  await br.close();
  if (falhas) { console.log(`\n>>> ${falhas} FALHA(S) §355`); process.exit(1); }
  console.log('\n>>> §355 OK — moldura (cor da energia + filete), nomes HTML da revelação ≥12px, eixo (a) mede SVG');
  process.exit(0);
})().catch(e => { console.error(e.stack || e); process.exit(1); });
