// ===================================================================
// INCURSION — GERADOR da ESCADA de um DOMÍNIO (§273).
// A escada é DADO (data/dominios/<cultura>.json): 40 níveis de trios inimigos,
// em RAMPA de dificuldade MEDIDA (não sorteada — a fase 1 provou que o sorteio é
// loteria). A régua é o experimento 4: a taxa de vitória do trio GULOSO do jogador,
// vida cheia, contra o trio inimigo. dificuldade = 1 − vitória.
//   A dificuldade sobe por DANO do inimigo, em FAIXA de 10 (rampa suave).
//   Chefe a cada 10 níveis = um trio de UMA cultura só (sinérgico, o espelho do jogador).
// Reusa src/dominios.js (o MESMO montador que o runtime) — a escada mede o que se joga.
//
//   node tools/gerar_dominios.js            # gera Grega (zeus/poseidon/atena), escreve o arquivo
//   node tools/gerar_dominios.js --piso     # também mede o PISO da IA gulosa na escada
// Escada nova no futuro = rodar de novo com outro trio/cultura → arquivo novo, nunca código.
// ===================================================================
const path = require('path'), fs = require('fs');
const E = require(path.join(__dirname, '..', 'src', 'engine.js'));
Object.assign(global, E);
const { iaProximaAcao } = require(path.join(__dirname, '..', 'src', 'ia.js'));
const D = require(path.join(__dirname, '..', 'src', 'dominios.js'));
const GODS = E.GODS, KEYS = Object.keys(GODS);
const CULT = {}; for (const k of KEYS) { const f = GODS[k].faccao; (CULT[f] = CULT[f] || []).push(k); }

// ---- configuração das escadas: UM bloco por Domínio (Fatia 1 = Grega; Fatia 2 = +4 culturas) ----
// O trio de cada cultura foi escolhido por: JOGÁVEL (sustain+dano+controle), AUTOSSUFICIENTE
// (nenhum dos três depende de um deus fora do trio — o Fujin do §271 é o contra-exemplo) e
// ICÔNICO (os três rostos da cultura). Método e régua IDÊNTICOS entre as cinco (§274).
const COMUM = { niveis: 40, faixa: 10, rampaDano: [1.00, 1.05, 1.10, 1.15], curaPorNivel: 25, candidatos: 220, ruaN: 12, capComum: 0.45, difTopo: 0.45, tolMonotonia: 0.06 };
const CFGS = {
  Grega:    { cultura: 'Grega',    nome: 'Domínio do Olimpo',   trio: ['zeus', 'poseidon', 'atena'], ...COMUM },
  Nórdica:  { cultura: 'Nórdica',  nome: 'Domínio de Asgard',   trio: ['odin', 'thor', 'loki'], ...COMUM },
  Egípcia:  { cultura: 'Egípcia',  nome: 'Domínio de Duat',     trio: ['ra', 'isis', 'osiris'], ...COMUM },
  Japonesa: { cultura: 'Japonesa', nome: 'Domínio de Takamagahara', trio: ['amaterasu', 'susanoo', 'tsukuyomi'], ...COMUM },
  Chinesa:  { cultura: 'Chinesa',  nome: 'Domínio dos Céus',    trio: ['sunwukong', 'nezha', 'nuwa'], ...COMUM },
};
// seleção: `node tools/gerar_dominios.js [Cultura|--todas]` (default: Grega)
const _sel = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : null;
const CFG = CFGS[_sel] || CFGS.Grega;

function mulberry32(a){ return function(){ a|=0; a=(a+0x6D2B79F5)|0; let t=Math.imul(a^(a>>>15),1|a); t=(t+Math.imul(t^(t>>>7),61|t))^t; return ((t^(t>>>14))>>>0)/4294967296; }; }
const med = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0;

// uma batalha gulosa×gulosa, vida cheia (a régua). Devolve 1 se o jogador (lado 0) vence.
function jogarCheio(trio, inimigos, seed, danoMult) {
  const cat = D.domCatalogoNivel(GODS, trio, 0, inimigos, danoMult);
  const st = E.novoEstado(trio, inimigos, seed, 0, null, cat);
  let guard = 0;
  while (!st.fim && guard++ < 500) { let p = 0, a; while (!st.fim && (a = iaProximaAcao(st)) && p++ < 8) E.agir(st, a.uid, a.slot, a.alvos, a.escolhas); if (st.fim) break; E.fimTurno(st); }
  return (st.fim && st.fim.resultado === 'vitoria' && st.fim.lado === 0) ? 1 : 0;
}
// dificuldade MEDIDA de um trio inimigo a um danoMult: 1 − taxa de vitória gulosa (N seeds).
function dificuldade(trio, inimigos, danoMult, N) {
  let v = 0; for (let s = 1; s <= N; s++) v += jogarCheio(trio, inimigos, (s * 2654435761) >>> 0, danoMult);
  return 1 - v / N;
}
function pick3(rng, pool, exclude) { const p = pool.filter(k => !exclude.includes(k)); const o = []; while (o.length < 3 && p.length) o.push(p.splice(Math.floor(rng() * p.length), 1)[0]); return o; }

// ---- 1. pool de trios COMUNS "justos" (hard-counter SAI), ranqueado por dificuldade base ----
function poolComuns(CFG) {
  const rng = mulberry32(20260911), vistos = new Set(), pool = [];
  let tentativas = 0;
  while (pool.length < CFG.candidatos && tentativas++ < CFG.candidatos * 6) {
    const t = pick3(rng, KEYS, CFG.trio); const chave = [...t].sort().join('|');
    if (vistos.has(chave)) continue; vistos.add(chave);
    const base = dificuldade(CFG.trio, t, 1.0, CFG.ruaN);
    if (base > CFG.capComum) continue;   // §273: hard-counter fora (a escada bane o counter; o sorteio é loteria)
    pool.push({ inimigos: t, base });
  }
  pool.sort((a, b) => a.base - b.base);   // fácil → duro
  return pool;
}
// ---- 2. trios de CHEFE: um por cultura (os 3 primeiros da cultura = espelho sinérgico) ----
function poolChefes(CFG) {
  const cults = Object.keys(CULT).filter(c => c !== CFG.cultura && CULT[c].length >= 3);
  return cults.map(c => ({ cultura: c, inimigos: CULT[c].slice(0, 3), base: dificuldade(CFG.trio, CULT[c].slice(0, 3), 1.0, CFG.ruaN) }))
    .sort((a, b) => a.base - b.base);
}

// ---- 3. montagem em RAMPA: dificuldade medida no danoMult de cada nível, monotônica ----
function montarEscada(CFG) {
  process.stderr.write('medindo pool de comuns…\n');
  const comuns = poolComuns(CFG);
  process.stderr.write('medindo chefes…\n');
  const chefes = poolChefes(CFG);
  const niveis = []; let prev = -Infinity, usados = new Set();
  const faixaDe = n => Math.floor((n - 1) / CFG.faixa);
  const nChefes = Math.floor(CFG.niveis / CFG.faixa);
  const nComuns = CFG.niveis - nChefes;
  // os chefes em degraus de dureza crescente (o mais fundo é o mais duro), do pool de chefes ranqueado
  const chefePorFaixa = [];
  for (let b = 0; b < nChefes; b++) chefePorFaixa.push(chefes[Math.min(chefes.length - 1, Math.floor(chefes.length * (b + 1) / (nChefes + 1)))]);
  // candidato JUSTO não usado com dificuldade-base mais perto de um ALVO (espalha o comum na faixa justa)
  const escolherPertoDe = alvo => {
    let melhor = null, dd = Infinity;
    for (const c of comuns) { if (usados.has([...c.inimigos].sort().join('|'))) continue; const d = Math.abs(c.base - alvo); if (d < dd) { dd = d; melhor = c; } }
    return melhor;
  };
  let iComum = 0;
  for (let n = 1; n <= CFG.niveis; n++) {
    const b = faixaDe(n), dano = CFG.rampaDano[b];
    if (D.domEhChefe(n)) {
      const ch = chefePorFaixa[b] || chefes[chefes.length - 1];
      const dif = dificuldade(CFG.trio, ch.inimigos, dano, CFG.ruaN);
      niveis.push({ n, chefe: true, cultura: ch.cultura, inimigos: ch.inimigos, danoMult: dano, dificuldade: Math.max(dif, prev) });
      prev = Math.max(prev, dif);
      continue;
    }
    // comum: ALVO base sobe linear 0 → difTopo ao longo dos comuns; o DANO da faixa soma por cima
    const alvoBase = CFG.difTopo * (iComum / Math.max(1, nComuns - 1)); iComum++;
    const cand = escolherPertoDe(alvoBase) || comuns[0];
    usados.add([...cand.inimigos].sort().join('|'));
    const dif = dificuldade(CFG.trio, cand.inimigos, dano, CFG.ruaN);
    const difFinal = Math.max(dif, prev);   // sela a monotonia (o dado gravado nunca cai)
    niveis.push({ n, chefe: false, inimigos: cand.inimigos, danoMult: dano, dificuldade: difFinal });
    prev = difFinal;
  }
  return niveis;
}

// ---- 4. PISO da IA gulosa: até que nível a IA chega NESTA escada, com estas regras ----
function medirPiso(ladder, N) {
  const depths = [];
  for (let s = 1; s <= N; s++) {
    const run = D.domNovaCorrida(ladder); let guard = 0;
    while (run.status === 'ativo' && guard++ < 200) {
      if (run.aguardandoPremio) {   // política gulosa de prêmio: reviver caído, senão curar (defensivo)
        const opc = D.domPremiosDisponiveis(run);
        D.domAplicarPremio(run, ladder, opc.includes('reviver') ? 'reviver' : 'cura');
        continue;
      }
      const st = D.domMontarBatalha(run, ladder, { seed: (s * 40503 ^ run.nivel * 7919) >>> 0 });
      let g = 0; while (!st.fim && g++ < 500) { let p = 0, a; while (!st.fim && (a = iaProximaAcao(st)) && p++ < 8) E.agir(st, a.uid, a.slot, a.alvos, a.escolhas); if (st.fim) break; E.fimTurno(st); }
      D.domResolverBatalha(run, ladder, st);
    }
    depths.push(run.profundidade);
  }
  depths.sort((a, b) => a - b);
  return { min: depths[0], max: depths[depths.length - 1], med: med(depths), p50: depths[Math.floor(depths.length / 2)], depths };
}

// ---- gerar + escrever UM Domínio ----
function gerar(CFG) {
  const niveis = montarEscada(CFG);
  const ladder = {
    _fonte: 'GERADO por tools/gerar_dominios.js (§273/§274). NÃO editar à mão. A escada é uma RAMPA de dificuldade MEDIDA: '
      + 'dificuldade[n] = 1 − (vitórias do trio GULOSO do jogador, vida cheia, contra os inimigos do nível, no danoMult da faixa; '
      + CFG.ruaN + ' seeds). O sorteio SAIU (loteria); a dificuldade sobe por DANO do inimigo em faixa de ' + CFG.faixa + '. '
      + 'Reproduzir: node tools/gerar_dominios.js ' + CFG.cultura,
    cultura: CFG.cultura, nome: CFG.nome, trio: CFG.trio,
    faixa: CFG.faixa, rampaDano: CFG.rampaDano, curaPorNivel: CFG.curaPorNivel,
    tetoBonusDano: D.DOM_TETO_BONUS, passoBonusDano: D.DOM_PASSO_BONUS,
    tolMonotonia: CFG.tolMonotonia,
    regua: { metodo: '1 − vitória gulosa (vida cheia) vs trio inimigo, no danoMult da faixa', seeds: CFG.ruaN },
    niveis,
  };
  process.stderr.write(`[${CFG.cultura}] medindo piso da IA gulosa…\n`);
  const pisoRec = medirPiso(ladder, 30);
  ladder.pisoIAGuloso = { med: +pisoRec.med.toFixed(1), min: pisoRec.min, p50: pisoRec.p50, max: pisoRec.max, corridas: 30, politicaPremio: 'reviver caído senão curar' };

  const dir = path.join(__dirname, '..', 'data', 'dominios');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, CFG.cultura.toLowerCase() + '.json'), JSON.stringify(ladder, null, 1) + '\n');

  console.log(`\n### ESCADA — ${CFG.nome} (${CFG.cultura}) · trio ${CFG.trio.join('/')}`);
  console.log(`arquivo: data/dominios/${CFG.cultura.toLowerCase()}.json · ${niveis.length} níveis · rampa de dano por faixa ${CFG.rampaDano.map(x=>'+'+Math.round((x-1)*100)+'%').join(' ')}`);
  console.log('nv  dano   dif   tipo');
  for (const lv of niveis) console.log(`${String(lv.n).padStart(2)}  ${lv.danoMult.toFixed(2)}  ${lv.dificuldade.toFixed(2)}  ${lv.chefe ? 'CHEFE ' + lv.cultura + ' (' + lv.inimigos.join('/') + ')' : lv.inimigos.join('/')}`);
  console.log(`forma da rampa: ${niveis[0].dificuldade.toFixed(2)} → ${niveis[niveis.length-1].dificuldade.toFixed(2)} (monotônica, tol ${CFG.tolMonotonia})`);
  console.log(`PISO DA IA GULOSA (30 corridas): med ${pisoRec.med.toFixed(1)} · min ${pisoRec.min} · p50 ${pisoRec.p50} · max ${pisoRec.max}`);
  return { cultura: CFG.cultura, trio: CFG.trio, piso: pisoRec, dif1: niveis[0].dificuldade, difN: niveis[niveis.length-1].dificuldade };
}

const alvo = process.argv.includes('--todas') ? Object.values(CFGS) : [CFG];
const resumo = alvo.map(gerar);
if (resumo.length > 1) {
  console.log(`\n### RESUMO — piso da gulosa por Domínio (a curva entre eles)`);
  for (const r of resumo) console.log(`  ${r.cultura.padEnd(9)} ${r.trio.join('/').padEnd(28)} piso med ${r.piso.med.toFixed(1)} (min ${r.piso.min}, max ${r.piso.max})  ·  rampa ${r.dif1.toFixed(2)}→${r.difN.toFixed(2)}`);
}
