// colecao_encaixe.test.js (§292 → §307) — FOLGA da Coleção, em navegador REAL, no PISO de 780 E a 951.
//
// §292 nasceu porque o §291 mediu errado (só a 951, só o slot básico). §307 corrige o SEGUNDO erro de método:
// medir com scrollHeight só responde "ESTOUROU?" — trava no box quando o texto cabe (scrollHeight === clientHeight),
// então NUNCA diz "sobrou quanto?" e é CEGO ao corte por reticência/clamp (que some sem transbordar). A guarda agora
// mede o tamanho NATURAL (clone solto, height/width auto) e reporta a FOLGA em px, quebrando ABAIXO de um piso —
// para avisar enquanto ainda há margem, não depois que o texto já cortou (a lição do babi.milagre, §306).
//
// Cobre: (1) a caixa de efeito da SOBREPOSIÇÃO (folga vertical ≥ piso); (2) a caixa > o seletor; (3) o nome na GRADE
// (reticência — mede QUANTO se perde, quebra se piorar). jsdom não serve (não faz layout → rect 0).
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

function acharChromium() {
  if (process.env.INCURSION_CHROMIUM) return process.env.INCURSION_CHROMIUM;
  try {
    const base = '/opt/pw-browsers';
    const dir = fs.readdirSync(base).filter(d => /^chromium-\d+$/.test(d)).sort().pop();
    if (dir) { const bin = path.join(base, dir, 'chrome-linux', 'chrome'); if (fs.existsSync(bin)) return bin; }
  } catch (e) { /* deixa o playwright resolver */ }
  return undefined;
}

// PISOS §307 (px de design). Justificativa no docs/folga-telas.md e no DECISOES §307.
const PISO_EFEITO = 8;   // a caixa de efeito da sobreposição: pior caso hoje +20px; piso 8 avisa com folga (não em cima do corte)
const GRADE_CAP  = 12;   // nome na grade (reticência): corte tolerado; hoje 0 (folga +5). Quebra se algum nome perder > 12px

// helper de TAMANHO NATURAL (o que a scrollHeight não dá): clona solto, height/width auto, lê o rect.
const HELP = `
window.__natH=(el)=>{const c=el.cloneNode(true);const s=c.style;s.cssText=getComputedStyle(el).cssText;s.position='absolute';s.left='-99999px';s.top='0';s.height='auto';s.maxHeight='none';s.overflow='visible';s.webkitLineClamp='unset';s.display=getComputedStyle(el).display.includes('box')?'block':getComputedStyle(el).display;s.width=el.clientWidth+'px';document.body.appendChild(c);const h=c.getBoundingClientRect().height;c.remove();return h;};
window.__natW=(el)=>{const c=el.cloneNode(true);const s=c.style;s.cssText=getComputedStyle(el).cssText;s.position='absolute';s.left='-99999px';s.top='0';s.width='auto';s.maxWidth='none';s.overflow='visible';s.whiteSpace='nowrap';document.body.appendChild(c);const w=c.getBoundingClientRect().width;c.remove();return w;};
`;

let falhas = 0;
const ok = (c, m) => { if (!c) { falhas++; console.log('  XX ' + m); } };

(async () => {
  const distAbs = path.resolve(__dirname, '..', 'dist', 'incursion.html');
  const browser = await chromium.launch({ executablePath: acharChromium(), headless: true });
  const page = await (await browser.newContext()).newPage();
  await page.goto('file://' + distAbs, { waitUntil: 'load' });
  await page.addScriptTag({ content: HELP });

  // percorre os 400 slots e devolve a MENOR FOLGA (clientHeight − alturaNatural do texto) + a proporção.
  // §295: mede NOS DOIS ESTADOS DE POSSE (o não-possuído troca o layout: selo "Você não possui" + col2ov--falta).
  async function medir(possuir) {
    return await page.evaluate((poss) => {
      if (poss) ROSTER.forEach(e => { perfil.deuses[e.key] = perfil.deuses[e.key] || { obtidoEm: Date.now(), copias: 1 }; });
      else perfil.deuses = {};
      ir('colecao', {}, { substituir: true }); render();
      let folgaMin = 1e9, pior = ''; let chipsH = 0, boxH = 0;
      for (const e of ROSTER) {
        colAbrirVer(e.key);
        if (!chipsH) { chipsH = Math.round(document.querySelector('.col2ov__sks').getBoundingClientRect().height); boxH = Math.round(document.querySelector('.col2ov__det').getBoundingClientRect().height); }
        for (const slot of ['basico', 'habilidade', 'milagre', 'passiva']) {
          const chip = document.querySelector('#col2ov .col2ov__sk[data-versel="' + slot + '"]');
          if (chip) chip.dispatchEvent(new MouseEvent('click', { bubbles: true }));
          const dt = document.querySelector('#col2ovdet .col2ov__deftxt');
          if (!dt) continue;
          const folga = dt.clientHeight - window.__natH(dt);   // POSITIVA = sobra; negativa = corta
          if (folga < folgaMin) { folgaMin = folga; pior = e.key + '.' + slot; }
        }
        colFecharVer();
      }
      return { folgaMin: Math.round(folgaMin), pior, chipsH, boxH, larg: (typeof ultimaLarguraDesign !== 'undefined' ? ultimaLarguraDesign : innerWidth) };
    }, possuir);
  }

  console.log(`== §307: a caixa de efeito da sobreposição tem FOLGA ≥ ${PISO_EFEITO}px — a 780 (piso) E a 951, possuído E não ==`);
  for (const W of [780, 951]) {
    await page.setViewportSize({ width: W, height: 428 });
    for (const poss of [true, false]) {
      const r = await medir(poss);
      const rot = poss ? 'possuído' : 'NÃO possuído';
      ok(r.folgaMin >= PISO_EFEITO, `design ${r.larg} [${rot}]: folga da caixa de efeito ${r.folgaMin}px deve ser ≥ ${PISO_EFEITO}px (pior: ${r.pior})`);
      ok(r.boxH > r.chipsH, `design ${r.larg} [${rot}]: a caixa de detalhe (${r.boxH}) deve ser maior que a fileira de chips (${r.chipsH})`);
      console.log(`  design ${r.larg} [${rot}]: folga MÍNIMA ${r.folgaMin}px (pior ${r.pior}) · caixa ${r.boxH} > chips ${r.chipsH}`);
    }
  }

  // GRADE (§307) — o nome do card usa reticência: NÃO transborda, corta em silêncio. Medimos QUANTO se perde
  // (natural − box) e quebramos se piorar. Hoje 0/100 cortam (o mais largo, "Mula sem Cabeça", tem ~+5px de folga).
  console.log(`== §307: nome na GRADE — o corte por reticência não passa de ${GRADE_CAP}px (mede o que some, não só o transbordo) ==`);
  for (const W of [780, 951]) {
    await page.setViewportSize({ width: W, height: 428 });
    const g = await page.evaluate(() => {
      ROSTER.forEach(e => { perfil.deuses[e.key] = perfil.deuses[e.key] || { obtidoEm: Date.now(), copias: 1 }; });
      ir('colecao', {}, { substituir: true }); render();
      let cutMax = 0, pior = '', folgaMin = 1e9, cortados = 0;
      for (const el of document.querySelectorAll('.col2c__n')) {
        const folga = el.clientWidth - window.__natW(el);
        const cut = Math.max(0, -folga);
        if (cut > 0.5) cortados++;
        if (cut > cutMax) { cutMax = cut; pior = el.textContent; }
        if (folga < folgaMin) folgaMin = folga;
      }
      return { cutMax: Math.round(cutMax), pior, folgaMin: Math.round(folgaMin), cortados, larg: (typeof ultimaLarguraDesign !== 'undefined' ? ultimaLarguraDesign : innerWidth) };
    });
    ok(g.cutMax <= GRADE_CAP, `design ${g.larg}: o pior corte na grade (${g.cutMax}px, "${g.pior}") não pode passar de ${GRADE_CAP}px`);
    console.log(`  design ${g.larg}: ${g.cortados}/100 nomes cortam · pior corte ${g.cutMax}px ("${g.pior}") · folga do mais largo ${g.folgaMin}px`);
  }

  // (§304b, medição corrigida no §307) A FRASE saiu da sobreposição (virou conteúdo do DESTAQUE). Aqui confirmamos
  // que a sobreposição não a renderiza NEM com `frase` no dado (cites=0), e reportamos a folga REAL (natural) — o
  // §304b dizia "folga ~0" porque media com clientHeight−scrollHeight (sempre ≤0); a folga real da caixa de efeito é
  // ~+20px, e mesmo assim NÃO comporta a citação (2–3 linhas ≈ 50px > 20): por isso a frase mora no destaque.
  await page.setViewportSize({ width: 780, height: 428 });
  const frase = await page.evaluate(() => {
    ROSTER.forEach(e => { perfil.deuses[e.key] = perfil.deuses[e.key] || { obtidoEm: Date.now(), copias: 1 }; });
    const F = 'Aquele que caminha entre os mundos e nunca teme a morte alheia ou a sua';
    ROSTER.forEach(e => { if (GODS[e.key]) GODS[e.key].frase = F; });   // semeia frase em TODOS (o pior caso)
    ir('colecao', {}, { substituir: true }); render();
    let cites = 0, corta = 0, folgaMin = 1e9;
    for (const e of ROSTER) {
      colAbrirVer(e.key);
      if (document.querySelector('#col2ov .col2ov__cite')) cites++;   // §304b: deve seguir 0 (a Coleção não mostra frase)
      for (const slot of ['basico', 'habilidade', 'milagre', 'passiva']) {
        const chip = document.querySelector('#col2ov .col2ov__sk[data-versel="' + slot + '"]'); if (chip) chip.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        const dt = document.querySelector('#col2ovdet .col2ov__deftxt'); if (dt) { const folga = dt.clientHeight - window.__natH(dt); if (folga < 0) corta++; folgaMin = Math.min(folgaMin, folga); }
      }
      colFecharVer();
    }
    ROSTER.forEach(e => { if (GODS[e.key]) delete GODS[e.key].frase; });   // limpa o synthetic
    return { cites, corta, folgaMin: Math.round(folgaMin), fraseLen: F.length };
  });
  ok(frase.cites === 0, `§304b: a sobreposição da Coleção NÃO renderiza citação nem com frase no dado (viram ${frase.cites} cites) — a frase é do destaque, não do elenco`);
  ok(frase.corta === 0, `§304b: sem cite na sobreposição, nenhum efeito corta (${frase.corta}/400) — a frase não rouba o orçamento daqui`);
  console.log(`  §304b FRASE — folga REAL da caixa de efeito ~${frase.folgaMin}px (natural, não scrollHeight): mesmo assim não comporta a cite (2–3 linhas ≈ 50px). Com frase em todos: ${frase.cites} cites, ${frase.corta}/400 cortes.`);

  await browser.close();
  console.log(falhas === 0 ? '\n>>> COLEÇÃO-ENCAIXE OK' : `\n>>> ${falhas} FALHA(S)`);
  process.exit(falhas ? 1 : 0);
})();
