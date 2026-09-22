// tools/medir_artes.js — DUAS medições sobre as 401 artes de habilidade (web/skills/*.webp).
// Ferramenta de INFORMAÇÃO DE ARTE (não entra no build). Rode: `node tools/medir_artes.js`.
// Escreve docs/artes-medalhao.csv (M1) e docs/artes-distincao.csv (M2). Ver docs/artes-skills-medicao.md.
//
// Usa Chromium (playwright) porque decodifica webp nativamente e desenha com object-fit:cover — exatamente
// o que a ficha da batalha (§300, quadrado r6) mostra. Cada arte é lida via data:URL (o file:// é bloqueado
// a partir de about:blank).
//
// ===== M1 — MEDALHÃO vs PREENCHE O QUADRADO =====
// O §300 trocou o disco circular por quadrado arredondado. Arte que só preenchia o círculo passa a mostrar
// os cantos. QUAIS precisam ser refeitas?
// CRITÉRIO (DOIS FATORES): medalhão = os 4 cantos ESCUROS (maior canto < 0,06 de luminância relativa)
//   E CHAPADOS (maior desvio-padrão de canto < 0,05).
// POR QUE O SEGUNDO FATOR (o chapado) EXISTE — não é enfeite:
//   Só a escuridão dá FALSO-POSITIVO. O milagre novo do Zeus é raio numa NUVEM ESCURA: os cantos têm
//   luminância ~0,08 (céu escuro) MAS textura std ~0,14 (nuvem/faísca) — ele PREENCHE o quadrado. Um
//   medalhão de verdade tem fundo CHAPADO (std ~0,012, quase liso). Sem o fator de textura, o Zeus (e toda
//   arte boa de fundo escuro) seria marcado como medalhão e REFEITO À TOA. O std separa "fundo liso de
//   medalhão" de "conteúdo escuro que preenche".
//
// ===== M2 — DISTINÇÃO entre as 4 artes do MESMO deus a 90px =====
// Métrica: assinatura 12×12 RGB (object-fit cover, como o jogo), ΔRGB = média de |Δ| por canal (0..255).
//   Menor = mais parecidas. Também correlação estrutural (12×12 cinza, zero-média).
// ⚠️ LIMITE DA MÉTRICA (o achado mais útil — leia antes de usar o CSV como veredito):
//   ΔRGB mede IMAGEM REPETIDA, não ASSUNTO REPETIDO. O Zeus habilidade×milagre dá ΔRGB 44 ("distintas")
//   e mesmo assim CONFUNDE, porque as duas são "raio em nuvem escura" — mesmo motivo, execução diferente.
//   O CSV é PISO, não teto: pega quase-duplicatas (mesma imagem, corr 0,9+), NÃO pega mesmo-assunto. A
//   distinção de relance depende de um OBJETO próprio por habilidade — isso o pixel não enxerga; o brief sim.

const path = require('path');
const fs = require('fs');
const RAIZ = path.resolve(__dirname, '..');
const SKILLS = path.join(RAIZ, 'web', 'skills');
const DOCS = path.join(RAIZ, 'docs');
const DARK = 0.06, FLAT = 0.05;   // limiares do M1 (canto escuro E chapado)
const SLOTS = ['basico', 'habilidade', 'milagre', 'passiva'];

function acharChromium() {
  if (process.env.INCURSION_CHROMIUM) return process.env.INCURSION_CHROMIUM;
  try {
    const base = '/opt/pw-browsers';
    const dir = fs.readdirSync(base).filter(d => /^chromium-\d+$/.test(d)).sort().pop();
    if (dir) { const bin = path.join(base, dir, 'chrome-linux', 'chrome'); if (fs.existsSync(bin)) return bin; }
  } catch (e) {}
  return undefined;
}
const parse = f => { const m = /^skill-(.+)-(basico|habilidade|milagre|passiva)\.webp$/.exec(f); return m ? { deus: m[1], slot: m[2] } : null; };

(async () => {
  const { chromium } = require('playwright');
  const files = fs.readdirSync(SKILLS).filter(f => /^skill-.+\.webp$/.test(f)).sort();
  const b = await chromium.launch({ executablePath: acharChromium(), headless: true, args: ['--no-sandbox'] });
  const p = await b.newContext().then(c => c.newPage());
  await p.goto('about:blank');
  const raw = [];
  for (const f of files) {
    const url = 'data:image/webp;base64,' + fs.readFileSync(path.join(SKILLS, f)).toString('base64');
    const r = await p.evaluate(async (url) => {
      const img = new Image(); img.src = url; try { await img.decode(); } catch (e) { return { err: true }; }
      const S = 90, cv = document.createElement('canvas'); cv.width = S; cv.height = S; const cx = cv.getContext('2d');
      const s = Math.max(S / img.naturalWidth, S / img.naturalHeight), w = img.naturalWidth * s, h = img.naturalHeight * s;
      cx.drawImage(img, (S - w) / 2, (S - h) / 2, w, h);   // object-fit: cover
      const d = cx.getImageData(0, 0, S, S).data;
      const L = (r, g, bl) => { const f = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(bl); };
      const stat = (x0, y0, ww, hh) => { const v = []; for (let y = y0; y < y0 + hh; y++) for (let x = x0; x < x0 + ww; x++) { const i = (y * S + x) * 4; v.push(L(d[i], d[i + 1], d[i + 2])); } const m = v.reduce((a, c) => a + c, 0) / v.length; return [m, Math.sqrt(v.reduce((a, c) => a + (c - m) * (c - m), 0) / v.length)]; };
      const C = 16, cst = [stat(0, 0, C, C), stat(S - C, 0, C, C), stat(0, S - C, C, C), stat(S - C, S - C, C, C)];
      const centro = stat((S - 30) / 2, (S - 30) / 2, 30, 30)[0];
      const G = 12, sig = [], cell = S / G;
      for (let gy = 0; gy < G; gy++) for (let gx = 0; gx < G; gx++) {
        let R = 0, Gc = 0, Bc = 0, n = 0; const x0 = Math.floor(gx * cell), y0 = Math.floor(gy * cell), x1 = Math.floor((gx + 1) * cell), y1 = Math.floor((gy + 1) * cell);
        for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) { const i = (y * S + x) * 4; R += d[i]; Gc += d[i + 1]; Bc += d[i + 2]; n++; }
        sig.push(R / n, Gc / n, Bc / n);
      }
      return { corners: cst.map(c => c[0]), cornerStd: cst.map(c => c[1]), centro, sig };
    }, url);
    if (r.err) { console.error('ERRO ao decodificar', f); continue; }
    raw.push({ f, ...parse(f), ...r });
  }
  await b.close();

  // ---- M1 ----
  const arts = raw.filter(a => a.slot);   // exclui skill-defesa (compartilhada)
  const classify = a => { const cmax = Math.max(...a.corners), stdMax = Math.max(...a.cornerStd); return { cmax, stdMax, contrast: a.centro - a.corners.reduce((x, y) => x + y, 0) / 4, medalhao: cmax < DARK && stdMax < FLAT }; };
  const rows = arts.map(a => ({ ...a, ...classify(a) }));
  const med = rows.filter(r => r.medalhao);
  fs.mkdirSync(DOCS, { recursive: true });
  fs.writeFileSync(path.join(DOCS, 'artes-medalhao.csv'),
    'deus,slot,cornerMax,cornerStdMax,contraste,subtipo\n' +
    med.slice().sort((a, b) => a.deus.localeCompare(b.deus) || SLOTS.indexOf(a.slot) - SLOTS.indexOf(b.slot))
      .map(r => `${r.deus},${r.slot},${r.cmax.toFixed(3)},${r.stdMax.toFixed(3)},${r.contrast.toFixed(3)},${r.contrast > 0.15 ? 'classico' : 'escuro-cheio'}`).join('\n') + '\n');

  // ---- M2 ----
  const dRGB = (s1, s2) => { let s = 0; for (let i = 0; i < s1.length; i++) s += Math.abs(s1[i] - s2[i]); return s / s1.length; };
  const grayZ = sig => { const g = []; for (let i = 0; i < sig.length; i += 3) g.push(0.299 * sig[i] + 0.587 * sig[i + 1] + 0.114 * sig[i + 2]); const m = g.reduce((a, b) => a + b, 0) / g.length; return g.map(x => x - m); };
  const corr = (a, b) => { let n = 0, da = 0, db = 0; for (let i = 0; i < a.length; i++) { n += a[i] * b[i]; da += a[i] * a[i]; db += b[i] * b[i]; } return (da && db) ? n / Math.sqrt(da * db) : 0; };
  const byGod = {}; arts.forEach(a => { (byGod[a.deus] = byGod[a.deus] || {})[a.slot] = a.sig; });
  const pares = [];
  for (const deus of Object.keys(byGod)) for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) {
    const s1 = byGod[deus][SLOTS[i]], s2 = byGod[deus][SLOTS[j]]; if (!s1 || !s2) continue;
    pares.push({ deus, par: SLOTS[i] + '×' + SLOTS[j], dRGB: +dRGB(s1, s2).toFixed(1), corr: +corr(grayZ(s1), grayZ(s2)).toFixed(3) });
  }
  pares.sort((a, b) => a.dRGB - b.dRGB);
  fs.writeFileSync(path.join(DOCS, 'artes-distincao.csv'),
    '# ΔRGB = imagem repetida, NÃO assunto repetido. PISO, não teto (ver cabeçalho de tools/medir_artes.js e docs/artes-skills-medicao.md).\n' +
    'deus,par,dRGB,corrEstrutural\n' + pares.map(p => `${p.deus},${p.par},${p.dRGB},${p.corr}`).join('\n') + '\n');

  const fill = rows.length - med.length;
  console.log(`M1: ${med.length} medalhões (${(med.length / rows.length * 100).toFixed(1)}%) · ${fill} preenchem (${(fill / rows.length * 100).toFixed(1)}%) de ${rows.length}`);
  console.log(`M2: pares <10 ΔRGB: ${pares.filter(p => p.dRGB < 10).length} · <15: ${pares.filter(p => p.dRGB < 15).length}`);
  console.log('escrito: docs/artes-medalhao.csv, docs/artes-distincao.csv');
})().catch(e => { console.error(e); process.exit(1); });
