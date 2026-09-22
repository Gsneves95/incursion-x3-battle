// §301 — MEDIÇÃO dos selos de raridade (a caixa de CADA lugar que mostra SS/S/A, em px de DESIGN e FÍSICOS).
// É a medição que decide onde o ornamento do dono cabe e onde a letra precisa de contorno — commitada para
// que ninguém precise refazê-la. Roda o dist REAL num Chromium headless, navega até cada tela e lê a caixa.
//
// POR QUE design E físico: o #stage é escalado (src/enquadramento.js). px físico = px design × ultimaEscala.
// Medimos dois viewports que ancoram a régua: 780×640 (piso, escala 1,0) e 951×640 (folga, escala ~1,219).
// O iPhone SE fica em ~0,855 e o tablet no teto 1,25 — interpoláveis a partir destes dois.
//
// SAÍDA: uma linha por (lugar × viewport) no stdout e um CSV em docs/selos-raridade.csv. O "≥40?" marca quem
// passa do limiar em que o ornamento LÊ (o dono mediu: <20 borra, 40 lê, 64 ótimo).
//
// USO:  NODE_PATH=./node_modules node tools/med_selos.js
const { chromium } = require(require('path').join(__dirname, '..', 'node_modules', 'playwright'));
const fs = require('fs'), path = require('path');
const raiz = path.join(__dirname, '..');
function acharChrome() {
  const b = '/opt/pw-browsers';
  const d = fs.readdirSync(b).filter(x => /^chromium-\d+$/.test(x)).sort().pop();
  return path.join(b, d, 'chrome-linux', 'chrome');
}
const dist = path.join(raiz, 'dist', 'incursion.html');

// lê a caixa de um seletor em px de DESIGN (dividido pela escala) e FÍSICOS (o que o olho vê)
const LER = `(sel)=>{const e=(typeof ultimaEscala!=='undefined'&&ultimaEscala)||1;const el=document.querySelector(sel);
  if(!el)return null;const r=el.getBoundingClientRect();const cs=getComputedStyle(el);
  return {dW:+(r.width/e).toFixed(1),dH:+(r.height/e).toFixed(1),fW:+r.width.toFixed(1),fH:+r.height.toFixed(1),font:cs.fontSize,esc:+e.toFixed(3)};}`;

async function medir(W, H) {
  const b = await chromium.launch({ executablePath: acharChrome(), headless: true, args: ['--no-sandbox'] });
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2 });
  const p = await ctx.newPage();
  await p.goto('file://' + dist, { waitUntil: 'load' });
  // possui todos os deuses (grade cheia) e uma CONTA sintética (as Missões só desenham online)
  await p.evaluate(() => {
    Object.keys(GODS).forEach(k => { perfil.deuses[k] = perfil.deuses[k] || { obtidoEm: Date.now(), copias: 1 }; });
    try { contaAtual = { nick: 'medida', perfil, missoes: { liberados: Object.keys(MISSOES.missoes || {}) }, ranque: {} }; } catch (e) {}
  });
  const D = sel => p.evaluate(new Function('sel', 'return (' + LER + ')(sel)'), sel);
  const out = { W, H };
  const K0 = await p.evaluate(() => Object.keys(GODS)[0]);

  // 1) GRADE + 2) RESUMO (mesma tela)
  await p.evaluate(() => { ir('colecao', {}, { substituir: true }); render(); });
  await p.waitForTimeout(150);
  out.grade = await D('.col2c__rar');
  out.resumo = await D('.col2r__rlabel');
  // 3) PAINEL — colSelecionar é CIRÚRGICO (não faz render() que zera colSel)
  await p.evaluate(k => { colSelecionar(k); }, K0);
  await p.waitForTimeout(80);
  out.painel = await D('.col2p__rar:not(.col2ov__rarart)');
  // 4) SOBREPOSIÇÃO — colAbrirVer anexa o overlay
  await p.evaluate(k => { colAbrirVer(k); }, K0);
  await p.waitForTimeout(120);
  out.sobrepor = await D('.col2ov__rarart');
  // 5) ROTA DEUS
  await p.evaluate(k => { colFecharVer && colFecharVer(); ir('deus', { key: k }, { substituir: true }); render(); }, K0);
  await p.waitForTimeout(120);
  out.deus = await D('.dtop__rar');
  // 6) MISSÕES (barra de 3px, sem letra)
  await p.evaluate(() => { ir('provacoes', {}, { substituir: true }); render(); });
  await p.waitForTimeout(150);
  out.missoes = await D('.mtile__rar');
  // 7) SELEÇÃO (kbox aparece com o painel de kit aberto: previewPk)
  await p.evaluate(k => { ir('selecao', { novo: true }, { substituir: true }); render(); previewPk(k); renderPick(); }, K0);
  await p.waitForTimeout(150);
  out.selecao = await D('.kbox__rar');
  // 8) REVEAL DA INVOCAÇÃO — o selo grande (SVG). topup() dá gema de teste, pull(1) revela.
  await p.evaluate(() => { ir('invocacao', {}, { substituir: true }); INV.montar(); INV.topup(); INV.topup(); INV.pull(1); });
  await p.waitForTimeout(400);
  out.reveal = await D('.iv-raridade');
  out.revealCard = await D('#iv-cards svg');   // o svg preenche o card → sua largura é a largura do card

  await b.close();
  return out;
}

(async () => {
  // o ornamento é um QUADRO atrás da letra: quem governa se ele LÊ é o MENOR lado da caixa (uma barra de
  // 3px de largura não mostra ornamento por mais alta que seja). Por isso o limiar corre sobre o menor lado.
  const linhas = [['lugar', 'viewport', 'escala', 'design_larg', 'design_alt', 'fisico_larg', 'fisico_alt', 'menor_lado_fisico', 'fonte', 'menor>=40?', 'cabe_ornamento?']];
  const ordem = ['grade', 'resumo', 'painel', 'sobrepor', 'deus', 'missoes', 'selecao', 'reveal'];
  // "cabe": tem caixa (não é barra/frameless) e menor lado de design ≥ ~16px. medição §301, não palpite.
  const CABE = { grade: 1, resumo: 1, painel: 1, sobrepor: 1, selecao: 1, deus: 0, missoes: 0, reveal: 0 };
  for (const [W, H] of [[780, 640], [951, 640]]) {
    const r = await medir(W, H);
    console.log('\n===== viewport ' + W + 'x' + H + ' (escala ' + (r.grade ? r.grade.esc : '?') + ') =====');
    for (const k of ordem) {
      const m = r[k];
      if (!m) { console.log(k.padEnd(9), 'null (não alcançado nesta passada)'); linhas.push([k, W + 'x' + H, '', '', '', '', '', '', '', '', '']); continue; }
      const menor = Math.min(m.fW, m.fH);
      const cabe = CABE[k] ? 'sim' : (k === 'reveal' ? 'ja-svg' : 'nao');
      console.log(k.padEnd(9), 'design ' + m.dW + '×' + m.dH + '  físico ' + m.fW + '×' + m.fH + '  menor ' + menor.toFixed(1) + '  fonte ' + m.font + '  ' + (menor >= 40 ? '≥40' : '<40') + '  ornamento:' + cabe);
      linhas.push([k, W + 'x' + H, m.esc, m.dW, m.dH, m.fW, m.fH, menor.toFixed(1), m.font, menor >= 40 ? 'sim' : 'nao', cabe]);
    }
    if (r.reveal && r.revealCard) {
      const razao = (r.reveal.fH / r.revealCard.fW * 100).toFixed(1);
      console.log('  → reveal: letra(alt ' + r.reveal.fH + ') / card(larg ' + r.revealCard.fW + ') = ' + razao + '% da largura do card (o dono estimou 27,5%)');
    }
  }
  const csv = path.join(raiz, 'docs', 'selos-raridade.csv');
  fs.writeFileSync(csv, linhas.map(l => l.join(',')).join('\n') + '\n');
  console.log('\nCSV → ' + path.relative(raiz, csv));
})().catch(e => { console.error(e); process.exit(1); });
