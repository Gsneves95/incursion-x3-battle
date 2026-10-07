// ===================================================================
// INCURSION — GERADOR da ESCADA de um DOMÍNIO (§273/§274/§275 + §325).
// A escada é DADO (data/dominios/<cultura>.json): 40 níveis de trios inimigos, em RAMPA de dificuldade MEDIDA.
//
// §325 (decisão do dono, inverte o "trio fixo" do §273):
//   • O JOGADOR monta o time — a régua não é mais um trio fixo. dificuldade[n] = 1 − taxa de vitória, vida
//     cheia, no danoMult da faixa, de um CONJUNTO FIXO de TIMES DE REFERÊNCIA (regua.times), média sobre
//     times × seeds. O lado do jogador é jogado pela IA v2 (o mesmo da runtime, data/ia_por_modo.json).
//   • TODOS os inimigos (comuns E chefes) são da CULTURA do Domínio (faccao). O nível 40 é o trio ICÔNICO
//     da cultura; os chefes 10/20/30 são trios da cultura em dureza crescente, escolhidos pelo gerador.
//   • capComum medido contra a MÉDIA dos times de referência. Variedade: evita repetir trio inimigo em
//     níveis próximos e reporta quantos trios distintos cada escada usa. Mesmo método e régua nas 5 culturas.
//
//   node tools/gerar_dominios.js [Cultura|--todas] [--semanas=N] [--seeds=N] [--poolSeeds=N] [--cand=N] [--pisoN=N]
// Escada nova = rodar de novo → arquivo novo, nunca código.
// ===================================================================
const path = require('path'), fs = require('fs');
const E = require(path.join(__dirname, '..', 'src', 'engine.js'));
Object.assign(global, E);
const { iaProximaAcao } = require(path.join(__dirname, '..', 'src', 'ia.js'));
const D = require(path.join(__dirname, '..', 'src', 'dominios.js'));
const RAR = require(path.join(__dirname, '..', 'data', 'raridades.json'));
const GODS = E.GODS, KEYS = Object.keys(GODS);
const CULT = {}; for (const k of KEYS) { const f = GODS[k].faccao; (CULT[f] = CULT[f] || []).push(k); }
const V2 = s => iaProximaAcao(s, 'normal', 2);   // §325: o lado do jogador (e o inimigo) joga sob a IA v2 do modo

const arg = (n, d) => { const p = process.argv.find(a => a.startsWith('--' + n + '=')); return p ? parseInt(p.split('=')[1], 10) : d; };
const COMUM = { niveis: 40, faixa: 10, rampaDano: [1.00, 1.05, 1.10, 1.15], curaPorNivel: 25, capComum: 0.45, difTopo: 0.45, tolMonotonia: 0.08 };
// `trio` = §325 o TRIO ICÔNICO INIMIGO da cultura (o chefe final, mostrado no cartão como INIMIGO). `frase`/`curtos`: cartão.
const CFGS = {
  Grega:    { cultura: 'Grega',    nome: 'Domínio do Olimpo',   trio: ['zeus', 'poseidon', 'atena'], frase: 'O raio, o tridente e a lança que pensa.', curtos: {}, ...COMUM },
  Nórdica:  { cultura: 'Nórdica',  nome: 'Domínio de Asgard',   trio: ['odin', 'thor', 'loki'], frase: 'O corvo, o martelo e a mentira.', curtos: {}, ...COMUM },
  Egípcia:  { cultura: 'Egípcia',  nome: 'Domínio de Duat',     trio: ['ra', 'isis', 'osiris'], frase: 'A barca, a magia e o rei que volta.', curtos: {}, ...COMUM },
  Japonesa: { cultura: 'Japonesa', nome: 'Domínio de Takamagahara', trio: ['amaterasu', 'susanoo', 'tsukuyomi'], frase: 'O sol, a tempestade e a lua.', curtos: {}, ...COMUM },
  Chinesa:  { cultura: 'Chinesa',  nome: 'Domínio dos Céus',    trio: ['sunwukong', 'nezha', 'nuwa'], frase: 'A revolta, a lança e a mão que remendou o céu.', curtos: { sunwukong: 'Wukong' }, ...COMUM },
};
const SEMANAS = Math.max(1, arg('semanas', 8));
const SEEDS = Math.max(1, arg('seeds', 8));         // seeds por time na medição da escada
const POOLSEEDS = Math.max(1, arg('poolSeeds', 6)); // seeds por time na triagem do pool (mais barata)
const CAND = Math.max(0, arg('cand', 220));         // teto de trios comuns amostrados por cultura (≥C(n,3) = enumera tudo)
const PISON = Math.max(1, arg('pisoN', 12));        // corridas por time de referência na medição de piso

function mulberry32(a){ return function(){ a|=0; a=(a+0x6D2B79F5)|0; let t=Math.imul(a^(a>>>15),1|a); t=(t+Math.imul(t^(t>>>7),61|t))^t; return ((t^(t>>>14))>>>0)/4294967296; }; }
const med = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0;
const chave = t => [...t].sort().join('|');
function hashStr(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

// ---- TIMES DE REFERÊNCIA (regua.times) — determinísticos, mesmos nas 5 culturas (§325 F) ----
// menor raridade (A<S<SS), empate alfabético — "o que um jogador razoável de início montaria".
const rank = { A: 1, S: 2, SS: 3 };
const rar = k => rank[RAR[k] || 'A'] || 1;
const cmp = (a, b) => (rar(a) - rar(b)) || (a < b ? -1 : a > b ? 1 : 0);
const somaRar = t => t.reduce((s, k) => s + rar(k), 0);
function timesReferencia() {
  const keys = KEYS.slice().sort(cmp);
  const byFn = {}; for (const k of keys) { const f = GODS[k].funcao; (byFn[f] = byFn[f] || []).push(k); }  // cada lista já em ordem cmp
  const barato = fn => (byFn[fn] || [])[0];
  const times = []; const seen = new Set();
  const add = t => { const s = t.filter(Boolean); if (s.length === 3 && new Set(s).size === 3) { const c = chave(s); if (!seen.has(c)) { seen.add(c); times.push(s.slice().sort(cmp)); } } };
  add(keys.slice(0, 3));                      // os 3 MAIS BARATOS (coleção de início; é o "mais barato" do P3)
  add((byFn['Atacante'] || []).slice(0, 3));  // 3 atacantes mais baratos (dano puro, não depende de milagre)
  add([barato('Atacante'), barato('Guardião'), barato('Suporte')]);     // comp clássica
  add([barato('Atacante'), barato('Controlador'), barato('Suporte')]);  // controle + sustain
  add([barato('Atacante'), barato('Manipulador'), barato('Guardião')]); // manipulação + frente
  add([barato('Atacante'), barato('Controlador'), barato('Guardião')]); // controle + frente
  return times;
}

// uma batalha v2×v2, vida cheia, catálogos POR LADO (o time pode conter um deus da própria cultura). 1 = jogador vence.
function jogo(time, inimigos, seed, danoMult) {
  const cats = D.domCatalogosPorLado(GODS, time, 0, inimigos, danoMult);
  const st = E.novoEstado(time, inimigos, seed, 0, null, cats);
  let g = 0; while (!st.fim && g++ < 500) { let p = 0, a; while (!st.fim && (a = V2(st)) && p++ < 8) E.agir(st, a.uid, a.slot, a.alvos, a.escolhas); if (st.fim) break; E.fimTurno(st); }
  return (st.fim && st.fim.resultado === 'vitoria' && st.fim.lado === 0) ? 1 : 0;
}
// dificuldade MEDIDA de um trio inimigo: 1 − média de vitória sobre (times de referência × seeds). Memoizado por (trio,dano).
const MEMO = new Map();
function dificuldade(refTimes, inimigos, danoMult, seeds) {
  const key = chave(inimigos) + '@' + danoMult + '#' + seeds;
  if (MEMO.has(key)) return MEMO.get(key);
  let vit = 0, jogos = 0;
  for (const time of refTimes) for (let s = 1; s <= seeds; s++) {
    const seed = ((s * 2654435761) ^ hashStr(chave(inimigos) + chave(time)) ^ Math.round(danoMult * 97)) >>> 0;
    vit += jogo(time, inimigos, seed || 1, danoMult); jogos++;
  }
  const dif = 1 - vit / jogos;
  MEMO.set(key, dif);
  return dif;
}

// ---- combinações de 3 dentro de uma cultura ----
function trios(pool) { const out = []; for (let i = 0; i < pool.length; i++) for (let j = i + 1; j < pool.length; j++) for (let l = j + 1; l < pool.length; l++) out.push([pool[i], pool[j], pool[l]]); return out; }
function amostra(arr, n, rng) { if (!n || arr.length <= n) return arr.slice(); const a = arr.slice(); const out = []; while (out.length < n && a.length) out.push(a.splice(Math.floor(rng() * a.length), 1)[0]); return out; }

// ---- pool de trios da CULTURA, medidos; comuns (≤capComum) e chefes (ordenados por dureza) ----
function medirPool(CFG, refTimes) {
  const pool = CULT[CFG.cultura];
  const todos = trios(pool);
  const rng = mulberry32(0x5235 ^ hashStr(CFG.cultura));
  const amostrados = amostra(todos, CAND, rng);
  const iconKey = chave(CFG.trio);
  if (!amostrados.some(t => chave(t) === iconKey)) amostrados.push(CFG.trio.slice());   // o icônico (nv40) tem de estar medido
  const medidos = amostrados.map(t => ({ inimigos: t, base: dificuldade(refTimes, t, 1.0, POOLSEEDS) }));
  medidos.sort((a, b) => a.base - b.base);
  const comuns = medidos.filter(m => m.base <= CFG.capComum);   // §325 G: cap medido vs média dos refs
  return { comuns, chefes: medidos.slice(), iconKey, totalTrios: todos.length };
}

// ---- montagem de UMA semana: rampa monotônica, chefes crescentes, nv40 = icônico, variedade ----
function montarEscadaSemana(CFG, pool, refTimes, wrng) {
  const niveis = []; let prev = -Infinity;
  const nChefes = Math.floor(CFG.niveis / CFG.faixa);   // 4 (nv 10/20/30/40)
  const faixaDe = n => Math.floor((n - 1) / CFG.faixa);
  const recente = []; const JAN = 6;   // §325 H: janela de trios recém-usados (evita repetir em níveis próximos)
  const usadoRecente = t => recente.includes(chave(t));
  const marcarUso = t => { recente.push(chave(t)); if (recente.length > JAN) recente.shift(); };
  const chefeHard = pool.chefes.filter(c => chave(c.inimigos) !== pool.iconKey);
  const icon = pool.chefes.find(c => chave(c.inimigos) === pool.iconKey) || { inimigos: CFG.trio, base: dificuldade(refTimes, CFG.trio, 1.0, POOLSEEDS) };
  const chefeDe = b => {
    if (b === nChefes - 1) return icon;                                   // última faixa = icônico (nv40)
    const alvo = Math.floor(chefeHard.length * (b + 1) / (nChefes + 1));  // percentil crescente
    const jan = [alvo - 1, alvo, alvo + 1].map(i => Math.min(chefeHard.length - 1, Math.max(0, i)));
    return chefeHard[jan[Math.floor(wrng() * jan.length)]] || icon;
  };
  const escolherComum = alvo => {
    let cs = pool.comuns.filter(c => !usadoRecente(c.inimigos));
    if (!cs.length) cs = pool.comuns.slice();
    cs.sort((a, b) => Math.abs(a.base - alvo) - Math.abs(b.base - alvo));
    const K = Math.min(5, cs.length);
    return cs[Math.floor(wrng() * K)] || pool.comuns[0];
  };
  let iComum = 0; const nComuns = CFG.niveis - nChefes;
  for (let n = 1; n <= CFG.niveis; n++) {
    const b = faixaDe(n), dano = CFG.rampaDano[b];
    let cand, chefe = D.domEhChefe(n);
    if (chefe) cand = chefeDe(b);
    else { const alvo = CFG.difTopo * (iComum / Math.max(1, nComuns - 1)); iComum++; cand = escolherComum(alvo); }
    const dif = dificuldade(refTimes, cand.inimigos, dano, SEEDS);
    const difFinal = Math.max(dif, prev);   // sela a monotonia (o dado gravado nunca cai)
    niveis.push({ n, chefe, inimigos: cand.inimigos.slice(), danoMult: dano, dificuldade: difFinal });
    prev = difFinal; marcarUso(cand.inimigos);
  }
  return niveis;
}

// ---- PISO por TIME DE REFERÊNCIA: até que nível cada time chega (política gulosa de prêmio) ----
function medirPisoPorTime(flat, time, N) {
  const depths = [];
  for (let s = 1; s <= N; s++) {
    const run = D.domNovaCorrida(flat, 0, '', 0, time); let guard = 0;
    while (run.status === 'ativo' && guard++ < 200) {
      if (run.aguardandoPremio) { const opc = D.domPremiosDisponiveis(run); D.domAplicarPremio(run, flat, opc.includes('reviver') ? 'reviver' : 'cura'); continue; }
      const st = D.domMontarBatalha(run, flat, { seed: (s * 40503 ^ run.nivel * 7919 ^ hashStr(chave(time))) >>> 0 });
      let g = 0; while (!st.fim && g++ < 500) { let p = 0, a; while (!st.fim && (a = V2(st)) && p++ < 8) E.agir(st, a.uid, a.slot, a.alvos, a.escolhas); if (st.fim) break; E.fimTurno(st); }
      D.domResolverBatalha(run, flat, st);
    }
    depths.push(run.profundidade);
  }
  return +med(depths).toFixed(1);
}

// ---- gerar + escrever UM Domínio ----
function gerar(CFG, refTimes) {
  const t0 = Date.now();
  process.stderr.write(`[${CFG.cultura}] medindo pool da cultura (${CULT[CFG.cultura].length} deuses)…\n`);
  const pool = medirPool(CFG, refTimes);
  process.stderr.write(`[${CFG.cultura}] comuns ≤${CFG.capComum}: ${pool.comuns.length}/${pool.chefes.length} trios medidos\n`);
  const semanas = []; const distintosPorSemana = [];
  for (let w = 0; w < SEMANAS; w++) {
    const wrng = mulberry32((0x53454d ^ (w + 1) * 2654435761 ^ hashStr(CFG.cultura)) >>> 0);
    const niveis = montarEscadaSemana(CFG, pool, refTimes, wrng);
    const flat = { cultura: CFG.cultura, trio: CFG.trio, curaPorNivel: CFG.curaPorNivel, tetoBonusDano: D.DOM_TETO_BONUS, faixa: CFG.faixa, niveis };
    const pisoPorTime = refTimes.map(t => ({ time: t, piso: medirPisoPorTime(flat, t, PISON) }));
    const pisos = pisoPorTime.map(p => p.piso);
    const distintos = new Set(niveis.map(l => chave(l.inimigos))).size; distintosPorSemana.push(distintos);
    semanas.push({ niveis, pisoIAGuloso: { med: +med(pisos).toFixed(1), min: Math.min(...pisos), max: Math.max(...pisos), corridas: PISON, porTime: pisoPorTime.map(p => +p.piso.toFixed(1)) }, triosDistintos: distintos });
    process.stderr.write(`[${CFG.cultura}] semana ${w + 1}/${SEMANAS}: rampa ${niveis[0].dificuldade.toFixed(2)}→${niveis[niveis.length-1].dificuldade.toFixed(2)} · trios ${distintos} · piso ${med(pisos).toFixed(1)} (${pisos.map(p=>p.toFixed(0)).join('/')})\n`);
  }
  const ladder = {
    _fonte: 'GERADO por tools/gerar_dominios.js (§273/§274/§275/§325). NÃO editar à mão. §325: o JOGADOR monta o '
      + 'time; TODOS os inimigos são da cultura (faccao); o nv40 é o trio ICÔNICO e os chefes 10/20/30 são trios da '
      + 'cultura em dureza crescente. dificuldade[n] = 1 − média de vitória (vida cheia, IA v2, no danoMult da faixa) '
      + 'dos TIMES DE REFERÊNCIA (regua.times) × ' + SEEDS + ' seeds. Reproduzir: node tools/gerar_dominios.js --todas --semanas=' + SEMANAS,
    cultura: CFG.cultura, nome: CFG.nome, trio: CFG.trio, frase: CFG.frase, curtos: CFG.curtos || {},
    faixa: CFG.faixa, rampaDano: CFG.rampaDano, curaPorNivel: CFG.curaPorNivel,
    tetoBonusDano: D.DOM_TETO_BONUS, passoBonusDano: D.DOM_PASSO_BONUS, tolMonotonia: CFG.tolMonotonia,
    regua: { metodo: '1 − média de vitória (vida cheia, IA v2) dos times de referência, no danoMult da faixa', seeds: SEEDS, times: refTimes },
    semanas,
  };
  const dir = path.join(__dirname, '..', 'data', 'dominios');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, CFG.cultura.toLowerCase() + '.json'), JSON.stringify(ladder) + '\n');
  const seg = +((Date.now() - t0) / 1000).toFixed(0);
  const chefesNv = (semanas[0] ? semanas[0].niveis.filter(l => l.chefe).map(l => l.inimigos.join('/')) : []);
  console.log(`\n### ${CFG.nome} (${CFG.cultura}) · ${SEMANAS} sem · ${seg}s · trios distintos/sem ${distintosPorSemana.join(' ')}`);
  console.log(`  chefes(s1) 10/20/30/40: ${chefesNv.join(' | ')}`);
  console.log(`  piso med/sem ${semanas.map(s=>s.pisoIAGuloso.med).join(' ')}`);
  return { cultura: CFG.cultura, semanas, seg, distintos: distintosPorSemana, chefes: chefesNv };
}

// seleção
const _sel = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : null;
const alvo = process.argv.includes('--todas') ? Object.values(CFGS) : [CFGS[_sel] || CFGS.Grega];
const refTimes = timesReferencia();
process.stderr.write(`times de referência (${refTimes.length}): ` + refTimes.map(t => t.join('+') + '[' + somaRar(t) + ']').join(' · ') + '\n');
const T0 = Date.now();
const resumo = alvo.map(c => gerar(c, refTimes));
const segTotal = ((Date.now() - T0) / 1000).toFixed(0);
console.log(`\n### RESUMO §325 — ${SEMANAS} sem × ${resumo.length} cultura(s) em ${segTotal}s · seeds ${SEEDS}/pool ${POOLSEEDS} · ${refTimes.length} times de referência`);
for (const r of resumo) console.log(`  ${r.cultura.padEnd(9)} trios/sem ${r.distintos.join('/')} · piso/sem ${r.semanas.map(s=>s.pisoIAGuloso.med).join('/')} · ${r.seg}s`);
