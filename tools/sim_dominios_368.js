// ===================================================================
// §368 — SIMULAÇÃO da CORRIDA de Domínios com RESERVAS + CURA, para a RECALIBRAGEM por metas.
// Joga a corrida de PRODUÇÃO (src/dominios.js: 5 deuses = 3 titulares + 2 reservas, vida que carrega,
// cura fração entre níveis, reserva assume a vaga do caído, acaba com os 5 caídos), IA v2 DOS DOIS LADOS
// (a IA v2 joga do lado do jogador, como o runtime). Mede a PROFUNDIDADE MEDIANA por cultura para:
//   • time INICIAL  = melhor 5 formável só com os INICIAIS (titulares = regua.p3Time; reservas = 2 iniciais + fortes);
//   • time FORTE    = §325b (titulares = regua.times[0]) + 2 reservas fortes do pool da régua.
// Varre curaPorNivel ∈ {15,20,25,30,35}% (e, se pedido, um danoMult extra). NADA de produção é tocado:
// a cura entra por OVERRIDE na escada clonada; o dado só muda quando o chamador decidir (fora daqui).
//   node tools/sim_dominios_368.js [--n=40] [--curas=0.15,0.2,0.25,0.3,0.35] [--danoMult=1] [--culturas=grega,...] [--json]
// ===================================================================
'use strict';
const fs = require('fs');
const path = require('path');
const E = require(path.join(__dirname, '..', 'src', 'engine.js'));
Object.assign(global, E);                 // ia.js lê o motor pelo global
const { iaProximaAcao } = require(path.join(__dirname, '..', 'src', 'ia.js'));
const D = require(path.join(__dirname, '..', 'src', 'dominios.js'));
const GODS = E.GODS;
const V2 = s => iaProximaAcao(s, 'normal', 2);
const DIR = path.join(__dirname, '..', 'data', 'dominios');

// ---- FORÇA v2 (docs/kits-forca-v2.txt): nome exibido → wr% ; mapeado p/ chave por GODS[].nome ----
function carregarForca() {
  const txt = fs.readFileSync(path.join(__dirname, '..', 'docs', 'kits-forca-v2.txt'), 'utf8');
  const EL = 'Maré|Chama|Umbra|Verdejante|Aurora|Tempestade';
  const re = new RegExp('^\\s*\\d+\\s+(.+?)\\s+(?:' + EL + ')\\s+\\S+\\s+([\\d.]+)');
  const porNome = {};
  for (const ln of txt.split('\n')) { const m = ln.match(re); if (m) porNome[_norm(m[1])] = parseFloat(m[2]); }
  const porChave = {};
  for (const k in GODS) { const n = _norm(GODS[k].nome || k); if (porNome[n] != null) porChave[k] = porNome[n]; }
  return porChave;
}
function _norm(s) { return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z]/g, ''); }
const FORCA = carregarForca();
const forcaDe = k => (FORCA[k] != null ? FORCA[k] : 0);

// ---- times de referência (§368): 5 = 3 titulares + 2 reservas, determinísticos ----
const INICIAIS = require(path.join(__dirname, '..', 'src', 'perfil.js')).INICIAIS;
function timeInicial(lad) {
  const tit = (lad.regua && lad.regua.p3Time) || ['brigid', 'ogum', 'nezha'];     // melhor trio de INICIAIS (§325b)
  const resto = INICIAIS.filter(k => !tit.includes(k)).sort((a, b) => forcaDe(b) - forcaDe(a));
  return tit.concat(resto.slice(0, 2));                                            // + 2 iniciais mais fortes
}
function timeForte(lad) {
  const tit = (lad.regua && lad.regua.times && lad.regua.times[0]) || ['oxum', 'piranha', 'curupira'];  // §325b forte
  const pool = [];
  for (const t of (lad.regua && lad.regua.times) || []) for (const k of t) if (!pool.includes(k)) pool.push(k);
  const resto = pool.filter(k => !tit.includes(k)).sort((a, b) => forcaDe(b) - forcaDe(a));
  return tit.concat(resto.slice(0, 2));                                            // + 2 fortes do pool da régua
}

// ---- uma batalha v2×v2 até o fim (ou teto de turnos) ----
function jogarBatalha(st) {
  let g = 0;
  while (!st.fim && g++ < 400) { let p = 0, a; while (!st.fim && (a = V2(st)) && p++ < 10) E.agir(st, a.uid, a.slot, a.alvos, a.escolhas); if (st.fim) break; E.fimTurno(st); }
  return st;
}
// prêmio de chefe: BÔNUS até o teto (snowball), senão REVIVER o caído mais FORTE, senão CURA. Política FIXA (relatório).
function escolherPremio(run, escada) {
  const opc = D.domPremiosDisponiveis(run);
  if (opc.includes('bonus')) return D.domAplicarPremio(run, escada, 'bonus');
  if (opc.includes('reviver')) {
    let alvo = -1, melhor = -1;
    run.vida.forEach((c, i) => { if (c && !c.vivo) { const f = forcaDe(run.time[i]); if (f > melhor) { melhor = f; alvo = i; } } });
    return D.domAplicarPremio(run, escada, 'reviver', alvo);
  }
  return D.domAplicarPremio(run, escada, 'cura');
}

// ---- uma CORRIDA; devolve a profundidade. seedBase varia a semente de batalha (produção usa fixa; a
// calibragem varia p/ robustez, à moda da régua "média sobre seeds"). ----
function simCorrida(escada, time5, seedBase) {
  const run = D.domNovaCorrida(escada, 0, '', 0, time5);
  let guard = 0;
  while (run.status === 'ativo' && guard++ < 400) {
    if (run.aguardandoPremio) { escolherPremio(run, escada); continue; }
    const vivosAntes = run.vida.filter(c => c && c.vivo).length;
    const seed = ((run.nivel * 7919) ^ (seedBase * 2654435761)) >>> 0 || 1;
    const st = D.domMontarBatalha(run, escada, { seed });
    if (!st) break;
    jogarBatalha(st);
    const r = D.domResolverBatalha(run, escada, st);
    // guarda anti-travamento (sim determinístico): derrota NÃO-TPK (empate/timeout com alguém vivo) que
    // não reduziu os vivos → repetir o mesmo nível com a mesma semente daria o mesmo resultado p/ sempre.
    if (r.retomar && run.vida.filter(c => c && c.vivo).length >= vivosAntes) { run.status = 'morto'; break; }
  }
  return run.profundidade;
}

function mediana(a) { const s = a.slice().sort((x, y) => x - y); const n = s.length; return n ? (n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2) : 0; }
function medirTime(escada, time5, N) {
  const ds = []; for (let s = 1; s <= N; s++) ds.push(simCorrida(escada, time5, s));
  ds.sort((a, b) => a - b);
  const pct40 = ds.filter(d => d >= 40).length / N;
  return { med: mediana(ds), min: ds[0], max: ds[ds.length - 1], pct40, ds };
}

function clonarEscadaComCura(lad, cura, danoMultExtra) {
  const esc = D.domEscadaSemana(lad, 0);
  const niveis = esc.niveis.map(l => Object.assign({}, l, (danoMultExtra && danoMultExtra !== 1) ? { danoMult: +( (l.danoMult || 1) * danoMultExtra ).toFixed(4) } : {}));
  return { cultura: esc.cultura, trio: esc.trio, curaPorNivel: cura, tetoBonusDano: esc.tetoBonusDano, faixa: esc.faixa, niveis };
}

function main() {
  const arg = n => { const p = process.argv.find(a => a.startsWith('--' + n + '=')); return p ? p.split('=')[1] : null; };
  const N = parseInt(arg('n') || '40', 10);
  const curas = (arg('curas') || '0.15,0.2,0.25,0.3,0.35').split(',').map(Number);
  const danoMult = parseFloat(arg('danoMult') || '1');
  const culturas = (arg('culturas') || 'grega,nórdica,egípcia,japonesa,chinesa').split(',');
  const asJson = process.argv.includes('--json');
  const lads = {}; for (const c of culturas) lads[c] = JSON.parse(fs.readFileSync(path.join(DIR, c + '.json'), 'utf8'));

  const out = { N, danoMult, curas, culturas, inicial: {}, forte: {} };
  for (const cura of curas) {
    for (const c of culturas) {
      const lad = lads[c];
      const escada = clonarEscadaComCura(lad, cura, danoMult);
      const ti = timeInicial(lad), tf = timeForte(lad);
      const ri = medirTime(escada, ti, N), rf = medirTime(escada, tf, N);
      (out.inicial[cura] = out.inicial[cura] || {})[c] = ri;
      (out.forte[cura] = out.forte[cura] || {})[c] = rf;
      if (!asJson) console.log(`cura ${(cura * 100).toFixed(0)}% ${c.padEnd(9)} INICIAL med ${String(ri.med).padStart(4)} [${ri.min}-${ri.max}]  FORTE med ${String(rf.med).padStart(4)} [${rf.min}-${rf.max}] 40:${(rf.pct40 * 100).toFixed(0)}%`);
    }
    if (!asJson) {
      const medI = culturas.map(c => out.inicial[cura][c].med), medF = culturas.map(c => out.forte[cura][c].med);
      console.log(`  → cura ${(cura * 100).toFixed(0)}%: INICIAL medianas ${JSON.stringify(medI)}  FORTE medianas ${JSON.stringify(medF)}\n`);
    }
  }
  if (asJson) console.log(JSON.stringify(out));
  out.teams = { inicial: timeInicial(lads[culturas[0]]), forte: timeForte(lads[culturas[0]]) };
  return out;
}

module.exports = { timeInicial, timeForte, simCorrida, medirTime, clonarEscadaComCura, carregarForca, forcaDe };
if (require.main === module) main();
