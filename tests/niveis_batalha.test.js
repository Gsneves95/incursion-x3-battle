// §320 — NÍVEIS DE HABILIDADE na BATALHA (os dois lados) + na SELEÇÃO. É TELA: o número mostrado DERIVA do
// kitDe (o que o MOTOR usa), via niveisEmBatalha — logo bate com o motor por construção. Guardas:
//   jsdom: indicador no retrato (aliado E inimigo) com os números certos; botão de habilidade com "Nv N"
//     (só ≥2, sem escada → nada); o TOOLTIP lê o kit EFETIVO do lado (bite: difere do base); todo nv1 → nada;
//     seleção de time mostra o indicador nos deuses escolhidos.
//   Chromium (780/893/1075/1200): o indicador não cobre HP, efeitos nem botões, e nada corta.
const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

let falhas = 0, passes = 0;
const ok = (c, m) => { if (!c) { console.log('  ✗ FALHA: ' + m); falhas++; } else { console.log('  ✓ ' + m); passes++; } };

const distAbs = path.resolve(__dirname, '..', 'dist', 'incursion.html');
const html = fs.readFileSync(distAbs, 'utf8');

// ================================ PARTE 1 — jsdom ================================
(function parte1(){
  const vc = new VirtualConsole(); let err = null; vc.on('jsdomError', e => { err = (e.detail && e.detail.message) || e.message; });
  const w = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'http://localhost/', virtualConsole: vc }).window;
  const d = w.document, $ = s => d.querySelector(s), $$ = s => [...d.querySelectorAll(s)];
  const txt = el => (el ? el.textContent : '').replace(/\s+/g, ' ').trim();

  console.log('== §320 / NÍVEIS NA BATALHA (jsdom) ==');
  ok(w.eval("typeof niveisEmBatalha==='function' && typeof nivelSlotEmBatalha==='function'"), 'o motor expõe niveisEmBatalha/nivelSlotEmBatalha (derivação pública)');

  // escolhe 2 deuses cujo BÁSICO tem escada que MUDA o desc no nv2 (p/ a bite do tooltip) + 4 de preenchimento.
  const info = JSON.parse(w.eval(`(function(){
    const dc=[]; for(const k in GODS){ const g=GODS[k]; const ab=(g.ab||[]).find(a=>a.slot==='basico'&&Array.isArray(a.niveis)&&a.niveis.length); if(!ab)continue; const ef=kitEfetivo(g,{basico:2}).ab.find(a=>a.slot==='basico'); if(ef&&ef.desc&&ab.desc&&ef.desc!==ab.desc) dc.push(k); }
    const topo=dc.slice(0,2); const fill=Object.keys(GODS).filter(k=>!topo.includes(k)).slice(0,4);
    return JSON.stringify({dc:topo, fill});
  })()`));
  ok(info.dc.length === 2, 'há ao menos 2 deuses com escada de básico que muda o texto (pré-condição da bite)');
  const allyK = info.dc[0], enemyK = info.dc[1];
  const ally = [allyK, info.fill[0], info.fill[1]], enemy = [enemyK, info.fill[2], info.fill[3]];
  // PvP com níveis ASSIMÉTRICOS: aliado básico nv2; inimigo básico nv2 (lados leem catálogos efetivos distintos).
  w.eval(`
    perfil = novoPerfil(0, 0);
    st = novoEstado(${JSON.stringify(ally)}, ${JSON.stringify(enemy)}, 1, 0, null, catalogoAtivo(), [${JSON.stringify({ [allyK]: { basico: 2 } })}, ${JSON.stringify({ [enemyK]: { basico: 2 } })}]);
    prova=null; campanha=null; provaFim=null; campanhaFim=null; vsCPU=false; modoPvP=true;
    ir('batalha',{},{substituir:true}); if(typeof pararRelogio==='function') pararRelogio(); render();
  `);
  ok(!err, 'a batalha renderiza sem quebrar (' + (err || 'ok') + ')');

  // ---- A) indicador no retrato dos DOIS lados; os números batem com o motor; nv1 → nada ----
  console.log('\n== A) indicador no retrato (aliado E inimigo), números do motor, nv1 oculto ==');
  const nvAlly = w.eval("JSON.stringify(niveisEmBatalha(st, st.lados[0].units[0]))");
  const nvEnemy = w.eval("JSON.stringify(niveisEmBatalha(st, st.lados[1].units[0]))");
  ok(/"basico":2/.test(nvAlly), 'motor: aliado 0 tem básico nível 2');
  ok(/"basico":2/.test(nvEnemy), 'motor: inimigo 0 tem básico nível 2');
  const allyUid = w.eval("st.lados[0].units[0].uid"), enemyUid = w.eval("st.lados[1].units[0].uid");
  const pAlly = $(`.bt-portrait[data-uid="${allyUid}"] .bt-portrait__niv`);
  const pEnemy = $(`.bt-portrait[data-uid="${enemyUid}"] .bt-portrait__niv`);
  ok(!!pAlly && /^2/.test(txt(pAlly)), 'o retrato do ALIADO mostra o indicador começando em 2 (ex.: 2·1·1)');
  ok(!!pEnemy && /^2/.test(txt(pEnemy)), 'o retrato do INIMIGO mostra o indicador começando em 2');
  // uma unidade toda nv1 (um dos fill) NÃO tem indicador
  const u1Uid = w.eval("st.lados[0].units[1].uid");
  ok(!$(`.bt-portrait[data-uid="${u1Uid}"] .bt-portrait__niv`), 'uma unidade toda nível 1 NÃO tem indicador (zero poluição)');
  ok(w.eval("nivelSlotEmBatalha(st, st.lados[0].units[0], 'habilidade')") === 1, 'um slot sem subir fica nível 1 (o indicador o mostra como 1, não some sozinho)');

  // ---- B) botão de habilidade: "Nv N" só quando ≥2; sem escada / nv1 → nada ----
  console.log('\n== B) botão de habilidade: "Nv N" (≥2); sem escada / nv1 → nada ==');
  const tileBas = $(`.bt-skill[data-sk="${allyUid}|basico"] .bt-skill__nv`);
  ok(!!tileBas && /Nv\s*2/.test(txt(tileBas)), 'o tile do BÁSICO do aliado (nv2) mostra "Nv 2"');
  ok(!$(`.bt-skill[data-sk="${allyUid}|habilidade"] .bt-skill__nv`), 'o tile de uma habilidade em nv1 NÃO mostra nível');
  ok(!$(`.bt-skill[data-sk="${allyUid}|defesa"] .bt-skill__nv`), 'a DEFESA (universal, sem escada) NUNCA mostra nível');

  // ---- C) o TOOLTIP lê o kit EFETIVO do lado (bite: difere do base) ----
  console.log('\n== C) tooltip/inspeção lê o kit EFETIVO dos dois lados (bite) ==');
  const efAlly = w.eval("kitDe(st, st.lados[0].units[0]).ab.find(a=>a.slot==='basico').desc");
  const baseAlly = w.eval("GODS[st.lados[0].units[0].key].ab.find(a=>a.slot==='basico').desc");
  ok(efAlly !== baseAlly, 'pré-condição: o básico efetivo do aliado difere do base (nv2 mudou o texto)');
  w.eval(`lerHabilidade('${allyUid}','basico')`);
  // §329: a leitura mora no PAINEL de baixo (detalhe.desc), não mais num `detalhe.texto`.
  ok(w.eval("detalhe && detalhe.desc") === efAlly, 'ao LER a habilidade do aliado, o painel mostra o texto EFETIVO (não o base)');
  // INIMIGO: §329/invariante #15 — o kit do oponente é LEITURA pela caixa de minis (data-look, nunca data-sk).
  // Foca o inimigo (o centro e as minis trocam p/ ele) e toca a mini do básico; o PAINEL de baixo mostra o efetivo DELE.
  const efEnemy = w.eval("kitDe(st, st.lados[1].units[0]).ab.find(a=>a.slot==='basico').desc");
  const baseEnemy = w.eval("GODS[st.lados[1].units[0].key].ab.find(a=>a.slot==='basico').desc");
  ok(efEnemy !== baseEnemy, 'pré-condição: o básico efetivo do inimigo difere do base');
  w.eval(`foco='${enemyUid}'; render();`);
  const miniFoe = $(`.bt-mini[data-look="${enemyUid}|basico"]`);
  ok(!!miniFoe, 'a caixa de minis mostra as habilidades do oponente em foco (leitura, data-look)');
  if(miniFoe) miniFoe.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  const rod = txt($('.bt-panel'));
  ok(rod.indexOf(efEnemy.slice(0, 24)) >= 0, 'o KIT do inimigo (painel) mostra o texto EFETIVO dele');
  ok(baseEnemy !== efEnemy && rod.indexOf(baseEnemy) < 0, 'BITE: o kit do inimigo NÃO mostra o texto base (seria o erro do §320)');
  ok(w.eval("nivelSlotEmBatalha(st, st.lados[1].units[0], 'basico')") === 2, 'o nível mostrado do inimigo = o nível do kit efetivo do servidor (valor público)');

  // ---- D) PvE / tudo nv1 → nenhum indicador, nenhum "Nv" ----
  console.log('\n== D) tudo nível 1 (PvE) → nada ==');
  w.eval(`st = novoEstado(${JSON.stringify(ally)}, ${JSON.stringify(enemy)}, 1, 0); ir('batalha',{},{substituir:true}); if(typeof pararRelogio==='function') pararRelogio(); render();`);
  ok($$('.bt-portrait__niv').length === 0, 'nível 1 em todos: NENHUM indicador de retrato');
  ok($$('.bt-skill__nv').length === 0, 'nível 1 em todos: NENHUM "Nv" nos botões');

  // ---- E) SELEÇÃO de time: indicador nos deuses escolhidos (níveis da conta) ----
  console.log('\n== E) seleção de time: indicador nos deuses escolhidos ==');
  // escolhe deuses JOGÁVEIS (os que aparecem no pool da seleção): um com escada de básico + outro p/ o negativo.
  const selInfo = JSON.parse(w.eval(`(function(){
    const pool=ROSTER.map(e=>e.key).filter(jogavel);
    const comEsc=pool.filter(k=>(GODS[k].ab||[]).some(a=>a.slot==='basico'&&Array.isArray(a.niveis)&&a.niveis.length));
    const sel=comEsc[0]||pool[0]; const outro=pool.find(k=>k!==sel);
    return JSON.stringify({sel, outro});
  })()`));
  w.eval(`contaAtual = { niveis: { '${selInfo.sel}': { basico: 2 } }, perfil:{} };
    ir('selecao', { novo: true }, { substituir: true }); render();
    pick = [['${selInfo.sel}'], []]; render();`);
  const selTile = $(`.pk[data-k="${selInfo.sel}"] .pk__niv`);
  ok(!!selTile && /^2/.test(txt(selTile)), 'o deus ESCOLHIDO mostra o indicador compacto (2·1·1) na seleção');
  // um deus NÃO escolhido não mostra (mesmo que exista no pool): o indicador é dos escolhidos
  ok(!!$(`.pk[data-k="${selInfo.outro}"]`) && !$(`.pk[data-k="${selInfo.outro}"] .pk__niv`), 'um deus NÃO escolhido (presente no pool) não mostra o indicador');

  // ---- F) §323 P2: o LANÇADOR de PvE monta com os níveis da CONTA e carimba o snapshot do replay ----
  console.log('\n== F) §323 P2: PvE monta com os níveis da conta + snapshot do replay (cliente) ==');
  ok(w.eval("typeof niveisTimeLocal==='function' && typeof montarPvEComNiveis==='function' && typeof niveisBatalhaAtual==='function'"), 'o cliente expõe niveisTimeLocal/montarPvEComNiveis/niveisBatalhaAtual');
  // conta com o deus de escada no básico nv2 (o MESMO allyK), time de PvE = ally
  const provF = JSON.stringify({ aliados: ally, inimigos: enemy, montar: { seed: 1, comeca: 0 } });
  const r323 = JSON.parse(w.eval(`(function(){
    contaAtual = { niveis: { '${allyK}': { basico: 2 } }, perfil: { deuses: { '${allyK}':1, '${ally[1]}':1, '${ally[2]}':1 } } };
    const snap = niveisTimeLocal(${JSON.stringify(ally)});
    st = montarPvEComNiveis(${provF}, ${JSON.stringify(ally)});
    const nvMontado = niveisEmBatalha(st, st.lados[0].units[0]).basico;
    const carimbo = niveisBatalhaAtual();
    return JSON.stringify({ snap, nvMontado, carimbo });
  })()`));
  ok(r323.snap && r323.snap[allyK] && r323.snap[allyK].basico === 2, 'niveisTimeLocal pega o básico nv2 do deus da conta');
  ok(r323.nvMontado === 2, 'o LANÇADOR monta o lado 0 com o básico nv2 da conta (niveisEmBatalha prova)');
  ok(r323.carimbo && r323.carimbo[allyK] && r323.carimbo[allyK].basico === 2, 'o snapshot da batalha (para o replay) foi carimbado com os níveis da conta');
  // BITE: conta toda nv1 → montagem base e snapshot nulo (regressão zero / replay antigo)
  const r323b = JSON.parse(w.eval(`(function(){
    contaAtual = { niveis: {}, perfil: { deuses: { '${allyK}':1 } } };
    const snap = niveisTimeLocal(${JSON.stringify(ally)});
    st = montarPvEComNiveis(${provF}, ${JSON.stringify(ally)});
    return JSON.stringify({ snap, nvMontado: niveisEmBatalha(st, st.lados[0].units[0]).basico, carimbo: niveisBatalhaAtual() });
  })()`));
  ok(r323b.snap === null && r323b.carimbo === null && r323b.nvMontado === 1, 'BITE: conta toda nv1 → montagem base, snapshot nulo (sem níveis = byte-idêntico a hoje)');

  try { w.close(); } catch (e) {}
})();

// ============================ PARTE 2 — Chromium (medir) ============================
function acharChromium() {
  if (process.env.INCURSION_CHROMIUM) return process.env.INCURSION_CHROMIUM;
  try { const base = '/opt/pw-browsers'; const dir = fs.readdirSync(base).filter(x => /^chromium-\d+$/.test(x)).sort().pop();
    if (dir) { const bin = path.join(base, dir, 'chrome-linux', 'chrome'); if (fs.existsSync(bin)) return bin; } } catch (e) {}
  return undefined;
}

(async function parte2(){
  let chromium; try { chromium = require('playwright').chromium; } catch (e) { console.log('  (playwright ausente — pulando a medição Chromium)'); fechar(); return; }
  console.log('\n== §320 / NÍVEIS NA BATALHA — medição (Chromium, 4 larguras) ==');
  const browser = await chromium.launch({ executablePath: acharChromium(), headless: true });
  try {
    const page = await (await browser.newContext()).newPage();
    await page.goto('file://' + distAbs, { waitUntil: 'load' });
    // monta uma batalha com níveis dos DOIS lados (básico nv2 em cada lado).
    const dc = await page.evaluate(() => {
      const d = []; for (const k in GODS) { const g = GODS[k]; const ab = (g.ab || []).find(a => a.slot === 'basico' && Array.isArray(a.niveis) && a.niveis.length); if (ab) d.push(k); if (d.length >= 6) break; }
      return d;
    });
    const ally = [dc[0], dc[1], dc[2]], enemy = [dc[3], dc[4], dc[5]];
    for (const W of [780, 893, 1075, 1200]) {
      await page.setViewportSize({ width: W, height: 412 });
      const r = await page.evaluate(({ ally, enemy }) => {
        perfil = novoPerfil(0, 0);
        const nvA = { [ally[0]]: { basico: 2 } }, nvB = { [enemy[0]]: { basico: 2 } };
        st = novoEstado(ally, enemy, 1, 0, null, catalogoAtivo(), [nvA, nvB]);
        prova = null; campanha = null; provaFim = null; campanhaFim = null; vsCPU = false; modoPvP = true;
        ir('batalha', {}, { substituir: true }); if (typeof pararRelogio === 'function') pararRelogio(); render();
        const R = el => el.getBoundingClientRect();
        const over = (a, b) => !(a.right <= b.left + 0.5 || a.left >= b.right - 0.5 || a.bottom <= b.top + 0.5 || a.top >= b.bottom - 0.5);
        const vw = document.documentElement.clientWidth;
        // §329: retrato/vida/efeitos/habilidades agora são IRMÃOS absolutos (sem contêiner por unidade). O selo de
        // nível (.bt-portrait__niv) mora DENTRO do retrato; checamos sua sobreposição contra TODAS as barras de vida,
        // ícones de efeito e habilidades do campo — a intenção (o selo não cobre nada disso) é preservada.
        let niv = document.querySelectorAll('.bt-portrait__niv').length;
        let sk = document.querySelectorAll('.bt-skill__nv').length;
        let cobreHP = 0, cobreFx = 0, foraRetrato = 0, cortaH = 0, cobreSkill = 0, foraTile = 0;
        const hps = [...document.querySelectorAll('.bt-hp')].map(R);
        const effs = [...document.querySelectorAll('.bt-eff')].map(R);
        const skills = [...document.querySelectorAll('.bt-skill')].map(R);
        document.querySelectorAll('.bt-portrait__niv').forEach(el => {
          const b = R(el), port = R(el.closest('.bt-portrait'));
          if (hps.some(h => over(b, h))) cobreHP++;
          if (effs.some(f => over(b, f))) cobreFx++;
          if (skills.some(s => over(b, s))) cobreSkill++;
          if (b.left < port.left - 0.5 || b.right > port.right + 0.5 || b.top < port.top - 0.5) foraRetrato++;
          if (b.right > vw + 0.5) cortaH++;
        });
        document.querySelectorAll('.bt-skill__nv').forEach(el => {
          const b = R(el), tile = R(el.closest('.bt-skill'));
          // §329: obsoleto — o custo saiu do tile para o painel de baixo; o selo "Nv" só precisa caber no tile.
          if (b.left < tile.left - 0.5 || b.right > tile.right + 0.5 || b.top < tile.top - 0.5 || b.bottom > tile.bottom + 0.5) foraTile++;
          if (b.right > vw + 0.5) cortaH++;
        });
        return { niv, sk, cobreHP, cobreFx, foraRetrato, cortaH, cobreSkill, foraTile };
      }, { ally, enemy });
      ok(r.niv >= 2, `@${W}: há indicador nos retratos dos dois lados (${r.niv})`);
      ok(r.sk >= 1, `@${W}: há "Nv" no(s) botão(ões) do aliado (${r.sk})`);
      ok(r.cobreHP === 0, `@${W}: o indicador NÃO cobre a barra de HP (${r.cobreHP})`);
      ok(r.cobreFx === 0, `@${W}: o indicador NÃO cobre os ícones de efeito (${r.cobreFx})`);
      ok(r.cobreSkill === 0, `@${W}: o indicador NÃO cobre as habilidades (${r.cobreSkill})`);
      ok(r.foraRetrato === 0, `@${W}: o indicador fica DENTRO do retrato (${r.foraRetrato})`);
      ok(r.foraTile === 0, `@${W}: o "Nv" fica DENTRO do tile (${r.foraTile})`);
      ok(r.cortaH === 0, `@${W}: nada do indicador corta na horizontal (${r.cortaH})`);
      console.log(`  @${W}: retratos ${r.niv} · botões ${r.sk} · sem cobrir HP/efeitos/habilidades · sem corte`);
    }
  } finally { try { await browser.close(); } catch (e) {} }
  fechar();
})().catch(e => { console.log('  ✗ ERRO: ' + (e && e.message || e)); falhas++; fechar(); });

function fechar(){
  console.log(`\n${falhas ? '✗ ' + falhas + ' FALHA(S)' : '✓ tudo verde'} · ${passes} asserções`);
  process.exit(falhas ? 1 : 0);
}
