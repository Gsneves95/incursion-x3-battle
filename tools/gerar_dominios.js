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

// ---- FORÇA v2 por deus (§324, pós-P3b) — lida de docs/kits-forca-v2.txt (a MESMA medida do §324). ----
// §325b: a régua escolhe por FORÇA v2, não por raridade. Falha alto se o arquivo não casar 100 deuses.
const FORCA = (() => {
  const txt = fs.readFileSync(path.join(__dirname, '..', 'docs', 'kits-forca-v2.txt'), 'utf8');
  const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z]/g, '');
  const nameToKey = {}; for (const k of KEYS) nameToKey[norm(GODS[k].nome)] = k;
  const EL = 'Maré|Chama|Umbra|Aurora|Verdejante|Tempestade', FN = 'Suporte|Atacante|Guardião|Controlador|Manipulador';
  const RE = new RegExp('^\\s*\\d+\\s+(.+?)\\s+(?:' + EL + ')\\s+(?:' + FN + ')\\s+([\\d.]+)\\s');   // ancora no ELEMENTO+FUNÇÃO (nome pode ter 1 espaço de padding)
  const f = {};
  for (const line of txt.split('\n')) { const m = line.match(RE); if (m) { const key = nameToKey[norm(m[1].trim())]; if (key) f[key] = parseFloat(m[2]); } }
  const faltam = KEYS.filter(k => f[k] == null);
  if (faltam.length) { process.stderr.write('ERRO: força v2 não casou: ' + faltam.join(',') + '\n'); process.exit(1); }
  return f;
})();

// ---- TIMES DE REFERÊNCIA (regua.times) — §325b: 6 times em 3 FAIXAS DE FORÇA (2 fracos, 2 médios, 2 fortes). ----
// Regra determinística: pool = deuses FORA das 5 culturas de Domínio (para nenhum ref ser também inimigo),
// ordenado por FORÇA v2 desc (desempate por força; chave só como piso final). Divide em 3 terços (forte/médio/
// fraco); em cada terço, 2 times de 3 por força, preferindo FUNÇÕES DISTINTAS (passo 1) e completando por força
// (passo 2) — cada time fica com ≥2 funções. 18 deuses distintos; o conjunto cobre as 5 funções. Mesmos nas 5
// culturas. P3 (nv1 vencível pelo mais barato) usa o melhor trio formável SÓ com os INICIAIS (o que o novato tem).
const INICIAIS = require(path.join(__dirname, '..', 'src', 'perfil.js')).INICIAIS;
const DOM_CULT = new Set(['Grega', 'Nórdica', 'Egípcia', 'Japonesa', 'Chinesa']);
const fnDe = k => GODS[k].funcao;
const porForca = (a, b) => (FORCA[b] - FORCA[a]) || (a < b ? -1 : a > b ? 1 : 0);
function _doisTimes(band) {
  const rest = band.slice(); const times = [];
  for (let t = 0; t < 2; t++) {
    const time = []; const funcs = new Set();
    for (const k of rest.slice()) { if (time.length >= 3) break; if (!funcs.has(fnDe(k))) { time.push(k); funcs.add(fnDe(k)); rest.splice(rest.indexOf(k), 1); } }   // passo 1: funções distintas
    for (const k of rest.slice()) { if (time.length >= 3) break; time.push(k); funcs.add(fnDe(k)); rest.splice(rest.indexOf(k), 1); }   // passo 2: completa por força
    times.push(time);
  }
  return times;
}
function timesReferencia() {
  const pool = KEYS.filter(k => !DOM_CULT.has(GODS[k].faccao)).sort(porForca);   // 31 deuses fora das culturas
  const n = pool.length, t1 = Math.floor(n / 3), t2 = Math.floor(2 * n / 3);
  const bands = [['forte', pool.slice(0, t1)], ['medio', pool.slice(t1, t2)], ['fraco', pool.slice(t2)]];
  const times = [], faixas = [];
  for (const [faixa, band] of bands) for (const t of _doisTimes(band)) {
    const forca = +(t.reduce((s, k) => s + FORCA[k], 0) / 3).toFixed(1);
    times.push(t.slice()); faixas.push({ faixa, forca, funcoes: [...new Set(t.map(fnDe))] });
  }
  const p3Time = INICIAIS.slice().sort(porForca).slice(0, 3);   // melhor trio só de INICIAIS (P3)
  return { times, faixas, p3Time };
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

// ---- montagem de UMA semana: rampa monotônica, chefes crescentes, nv40 = icônico, variedade (§325b P5). ----
// `usoGlobal` = contagem de uso de cada trio COMUM através das semanas (espalha p/ o portão P5: trio ≤12× e ≥70%
// dos deuses). DIST=5: nenhum trio se repete a menos de 5 níveis de distância NA SEMANA (P5c), por construção.
function montarEscadaSemana(CFG, pool, refTimes, wrng, usoGlobal) {
  const niveis = []; let prev = -Infinity;
  const nChefes = Math.floor(CFG.niveis / CFG.faixa);   // 4 (nv 10/20/30/40)
  const faixaDe = n => Math.floor((n - 1) / CFG.faixa);
  const DIST = 5;                               // §325b P5c: distância mínima entre dois usos do mesmo trio
  const ultimoNivel = {};                       // chave do trio → último nível em que apareceu (nesta semana)
  const distOk = (c, n) => { const u = ultimoNivel[chave(c.inimigos)]; return u == null || (n - u) >= DIST; };
  const chefeHard = pool.chefes.filter(c => chave(c.inimigos) !== pool.iconKey);
  const icon = pool.chefes.find(c => chave(c.inimigos) === pool.iconKey) || { inimigos: CFG.trio, base: dificuldade(refTimes, CFG.trio, 1.0, POOLSEEDS) };
  const chefeDe = b => {
    if (b === nChefes - 1) return icon;                                   // última faixa = icônico (nv40)
    const alvo = Math.floor(chefeHard.length * (b + 1) / (nChefes + 1));  // percentil crescente
    const jan = [alvo - 1, alvo, alvo + 1].map(i => Math.min(chefeHard.length - 1, Math.max(0, i)));
    return chefeHard[jan[Math.floor(wrng() * jan.length)]] || icon;
  };
  const uso = c => usoGlobal[chave(c.inimigos)] || 0;
  const escolherComum = (alvo, n) => {
    let cs = pool.comuns.filter(c => distOk(c, n));          // P5c: distância ≥5 (duro)
    if (!cs.length) cs = pool.comuns.slice();                // pool pequeno demais → degenera (P5 acusa no build)
    // banda ao redor do alvo da rampa; alarga até ter alguns candidatos (mantém a forma da rampa)
    let band = 0.08, near = [];
    while (near.length < 3 && band <= 0.6) { near = cs.filter(c => Math.abs(c.base - alvo) <= band); band += 0.06; }
    if (!near.length) near = cs.slice().sort((a, b) => Math.abs(a.base - alvo) - Math.abs(b.base - alvo)).slice(0, 5);
    // entre os da banda, prefere o MENOS usado globalmente (espalha → P5a/P5b); desempate por proximidade do alvo
    near.sort((a, b) => (uso(a) - uso(b)) || (Math.abs(a.base - alvo) - Math.abs(b.base - alvo)));
    const K = Math.min(3, near.length);
    return near[Math.floor(wrng() * K)] || pool.comuns[0];
  };
  let iComum = 0; const nComuns = CFG.niveis - nChefes;
  for (let n = 1; n <= CFG.niveis; n++) {
    const b = faixaDe(n), dano = CFG.rampaDano[b];
    let cand, chefe = D.domEhChefe(n);
    if (chefe) cand = chefeDe(b);
    else { const alvo = CFG.difTopo * (iComum / Math.max(1, nComuns - 1)); iComum++; cand = escolherComum(alvo, n); usoGlobal[chave(cand.inimigos)] = uso(cand) + 1; }
    const dif = dificuldade(refTimes, cand.inimigos, dano, SEEDS);
    const difFinal = Math.max(dif, prev);   // sela a monotonia (o dado gravado nunca cai)
    niveis.push({ n, chefe, inimigos: cand.inimigos.slice(), danoMult: dano, dificuldade: difFinal });
    prev = difFinal; ultimoNivel[chave(cand.inimigos)] = n;   // todos os trios (comuns e chefes) contam p/ a distância
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
function gerar(CFG, REF) {
  const refTimes = REF.times;
  const t0 = Date.now();
  process.stderr.write(`[${CFG.cultura}] medindo pool da cultura (${CULT[CFG.cultura].length} deuses)…\n`);
  const pool = medirPool(CFG, refTimes);
  process.stderr.write(`[${CFG.cultura}] comuns ≤${CFG.capComum}: ${pool.comuns.length}/${pool.chefes.length} trios medidos\n`);
  const semanas = []; const distintosPorSemana = [];
  const pisoAcum = refTimes.map(() => []);   // §325b: piso por TIME, acumulado nas semanas → média por faixa
  const usoGlobal = {};   // §325b P5: contagem de uso de cada trio comum ATRAVÉS das semanas (espalha o uso)
  for (let w = 0; w < SEMANAS; w++) {
    const wrng = mulberry32((0x53454d ^ (w + 1) * 2654435761 ^ hashStr(CFG.cultura)) >>> 0);
    const niveis = montarEscadaSemana(CFG, pool, refTimes, wrng, usoGlobal);
    const flat = { cultura: CFG.cultura, trio: CFG.trio, curaPorNivel: CFG.curaPorNivel, tetoBonusDano: D.DOM_TETO_BONUS, faixa: CFG.faixa, niveis };
    const pisoPorTime = refTimes.map((t, i) => { const p = medirPisoPorTime(flat, t, PISON); pisoAcum[i].push(p); return p; });
    const distintos = new Set(niveis.map(l => chave(l.inimigos))).size; distintosPorSemana.push(distintos);
    semanas.push({ niveis, pisoIAGuloso: { med: +med(pisoPorTime).toFixed(1), min: Math.min(...pisoPorTime), max: Math.max(...pisoPorTime), corridas: PISON, porTime: pisoPorTime.map(p => +p.toFixed(1)) }, triosDistintos: distintos });
    process.stderr.write(`[${CFG.cultura}] semana ${w + 1}/${SEMANAS}: rampa ${niveis[0].dificuldade.toFixed(2)}→${niveis[niveis.length-1].dificuldade.toFixed(2)} · trios ${distintos} · piso ${med(pisoPorTime).toFixed(1)}\n`);
  }
  // §325b report: variedade de COMUNS (só níveis não-chefe), somando as 8 semanas
  const cultgods = CULT[CFG.cultura].length;
  const comunsChaves = {}; const godsUsados = new Set();
  for (const s of semanas) for (const lv of s.niveis) if (!lv.chefe) { const c = chave(lv.inimigos); comunsChaves[c] = (comunsChaves[c] || 0) + 1; lv.inimigos.forEach(k => godsUsados.add(k)); }
  const comunsDistintos = Object.keys(comunsChaves).length;
  const trioMax = Math.max(0, ...Object.values(comunsChaves));
  const cobertura = Math.round(godsUsados.size / cultgods * 100);
  // piso médio por FAIXA (fraco/médio/forte): média do piso-por-time (média nas semanas) agrupada pela faixa do time
  const pisoMedTime = pisoAcum.map(a => med(a));
  const porFaixa = { fraco: [], medio: [], forte: [] };
  REF.faixas.forEach((f, i) => porFaixa[f.faixa].push(pisoMedTime[i]));
  const pisoFaixa = ['fraco', 'medio', 'forte'].map(fx => +med(porFaixa[fx]).toFixed(1));
  const ladder = {
    _fonte: 'GERADO por tools/gerar_dominios.js (§273/§274/§275/§325/§325b). NÃO editar à mão. §325b: o JOGADOR monta o '
      + 'time; TODOS os inimigos são da cultura (faccao); o nv40 é o trio ICÔNICO e os chefes 10/20/30 são trios da '
      + 'cultura em dureza crescente. dificuldade[n] = 1 − média de vitória (vida cheia, IA v2, no danoMult da faixa) '
      + 'dos 6 TIMES DE REFERÊNCIA (regua.times, 2 fracos/2 médios/2 fortes por FORÇA v2) × ' + SEEDS + ' seeds. '
      + 'Reproduzir: node tools/gerar_dominios.js --todas --semanas=' + SEMANAS,
    cultura: CFG.cultura, nome: CFG.nome, trio: CFG.trio, frase: CFG.frase, curtos: CFG.curtos || {},
    faixa: CFG.faixa, rampaDano: CFG.rampaDano, curaPorNivel: CFG.curaPorNivel,
    tetoBonusDano: D.DOM_TETO_BONUS, passoBonusDano: D.DOM_PASSO_BONUS, tolMonotonia: CFG.tolMonotonia,
    regua: {
      metodo: '§325b: 1 − média de vitória (vida cheia, IA v2) dos 6 times de referência (2 fracos/2 médios/2 fortes por força v2 do §324), no danoMult da faixa',
      seeds: SEEDS, times: refTimes, faixas: REF.faixas, p3Time: REF.p3Time,
    },
    semanas,
  };
  const dir = path.join(__dirname, '..', 'data', 'dominios');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, CFG.cultura.toLowerCase() + '.json'), JSON.stringify(ladder) + '\n');
  const seg = +((Date.now() - t0) / 1000).toFixed(0);
  const chefesNv = (semanas[0] ? semanas[0].niveis.filter(l => l.chefe).map(l => l.inimigos.join('/')) : []);
  const difS1 = (semanas[0] ? [1, 10, 20, 30, 40].map(n => semanas[0].niveis[n - 1].dificuldade.toFixed(2)) : []);
  console.log(`\n### ${CFG.nome} (${CFG.cultura}) · ${SEMANAS} sem · ${seg}s · comuns distintos ${comunsDistintos} de ${cultgods} (${cobertura}% deuses) · trio máx ${trioMax}×`);
  console.log(`  chefes(s1) 10/20/30/40: ${chefesNv.join(' | ')}`);
  console.log(`  dif s1 nv1/10/20/30/40: ${difS1.join(' / ')}`);
  console.log(`  piso faixa fraco/médio/forte: ${pisoFaixa.join(' / ')}`);
  return { cultura: CFG.cultura, semanas, seg, distintos: distintosPorSemana, chefes: chefesNv, comunsDistintos, cultgods, cobertura, trioMax, pisoFaixa, difS1 };
}

// seleção
const _sel = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : null;
const alvo = process.argv.includes('--todas') ? Object.values(CFGS) : [CFGS[_sel] || CFGS.Grega];
const REF = timesReferencia();
const refTimes = REF.times;
process.stderr.write(`times de referência (§325b, ${refTimes.length}): ` + REF.times.map((t, i) => `[${REF.faixas[i].faixa} ${REF.faixas[i].forca}] ${t.join('+')}`).join(' · ') + `\n  P3 (melhor trio de INICIAIS): ${REF.p3Time.join('+')}\n`);
const T0 = Date.now();
const resumo = alvo.map(c => gerar(c, REF));
const segTotal = ((Date.now() - T0) / 1000).toFixed(0);
console.log(`\n### RESUMO §325b — ${SEMANAS} sem × ${resumo.length} cultura(s) em ${segTotal}s · seeds ${SEEDS}/pool ${POOLSEEDS} · ${refTimes.length} times de referência (2 fracos/2 médios/2 fortes)`);
for (const r of resumo) console.log(`  ${r.cultura.padEnd(9)} comuns distintos ${r.comunsDistintos} de ${r.cultgods} (${r.cobertura}%) · trio máx ${r.trioMax}× · piso faixa fraco/médio/forte ${r.pisoFaixa.join('/')} · ${r.seg}s`);
