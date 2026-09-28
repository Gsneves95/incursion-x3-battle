// tests/niveis_degrau.test.js — §318 F1b babá 8: TODO DEGRAU MUDA O ESTADO.
// Para cada degrau (nv 2,3,4) de cada habilidade com niveis: um cenário roteirizado de estado FIXO,
// a habilidade lançada no nível N e no N−1. Prova, em DOIS níveis:
//   (A) KIT: o kit efetivo no nv N difere do nv N−1 (fora o texto `desc`) — degrau INERTE quebra;
//       e o valor no `caminho` declarado passou a ser `para` (o degrau faz EXATAMENTE o que diz).
//   (B) ESTADO: lançar a habilidade produz um estado de combate DIFERENTE (o degrau CHEGA ao motor).
// Vale para os 900: varre TODO deus com niveis (hoje zeus/oxum/tyr). Prova que MORDE com um degrau falso INERTE.
const path = require('path');
const E = require('../src/engine.js');
Object.assign(global, E);
const fs = require('fs');
const DIR = path.join(__dirname, '..', 'data', 'deuses');

let falhas = 0;
const ok = (c, m) => { if (!c) { console.log('  FALHA: ' + m); falhas++; } };
const clone = x => JSON.parse(JSON.stringify(x));
const canon = v => (v === null || typeof v !== 'object') ? JSON.stringify(v)
  : Array.isArray(v) ? '[' + v.map(canon).join(',') + ']'
    : '{' + Object.keys(v).sort().map(k => JSON.stringify(k) + ':' + canon(v[k])).join(',') + '}';

// lê o valor de um `caminho` num ab (espelha o motor; fx[] não tem valor "atual").
function lerCaminho(ab, c) {
  let m;
  if (c === 'fx[]') return undefined;
  if ((m = c.match(/^fx\[(\d+)\]\.v$/))) { const f = (ab.fx || [])[+m[1]]; return f ? f.v : undefined; }
  if ((m = c.match(/^fx\[(\d+)\]\.eff\.v$/))) { const f = (ab.fx || [])[+m[1]]; return f && f.eff ? f.eff.v : undefined; }
  if (c === 'cd') return ab.cd;
  if ((m = c.match(/^cost\.(.+)$/))) return ab.cost ? ab.cost[m[1]] : undefined;
  if ((m = c.match(/^fx\[(\d+)\]\.eff\.dur$/))) { const f = (ab.fx || [])[+m[1]]; return f && f.eff ? f.eff.dur : undefined; }
  return undefined;
}
const semDesc = ab => { const o = clone(ab); delete o.desc; return o; };

// companheiros e inimigos por deus (só precisam ser deuses válidos e estáveis; a escolha se cancela
// entre N e N−1, pois o cenário é idêntico — só o nível de ALVO muda).
const CENARIO = {
  zeus: { time: ['zeus', 'ares', 'atena'], inim: ['ogum', 'thor', 'odin'] },
  oxum: { time: ['oxum', 'ogum', 'tyr'], inim: ['ares', 'thor', 'odin'] },
  tyr: { time: ['tyr', 'thor', 'odin'], inim: ['ares', 'atena', 'apolo'] },
};
const _cenPad = key => CENARIO[key] || { time: [key, 'ares', 'atena'], inim: ['ogum', 'thor', 'odin'] };

// projeção de combate do estado (o que o degrau pode mexer): os dois lados (unidades: hp, efeitos,
// dots, shield, cd, contadores) + orbes. NÃO o catId (que muda com o nível por construção) nem o log.
function projLados(st) { return canon(st.lados.map(l => ({ orbs: l.orbs, units: l.units.map(u => ({ hp: u.hp, shield: u.shield, cd: u.cd, efeitos: u.efeitos, dots: u.dots, contadores: u.contadores, vivo: u.vivo })) }))); }

// monta o cenário FIXO e lança `slot` de ALVO no nível `nv`; devolve a projeção de estado (ou null se não deu p/ lançar).
function estadoAposCast(catBase, key, slot, nv) {
  const cen = _cenPad(key);
  const cat = clone(catBase);
  const st = E.novoEstado(cen.time.slice(), cen.inim.slice(), 7, 0, null, cat, [{ [key]: { [slot]: nv } }, {}]);
  E.ELEMS.forEach(e => { st.lados[0].orbs[e] = 9; });     // orbes cheios: paga qualquer custo
  st.lados[0].units.forEach(u => { u.hp = 60; });          // lado 0 ferido: curas/self-heal ficam VISÍVEIS (abaixo do teto)
  const u = st.lados[0].units[0];
  const a = E.acoesDe(st, u).find(x => x.slot === slot);
  if (!a || !a.disponivel) return null;
  let alvos = [];
  if (a.alvo === 'inimigo') alvos = ['1-0'];
  else if (a.alvo === 'aliado') alvos = ['0-1'];
  else if (a.alvo === '2inimigos') alvos = ['1-0', '1-1'];
  else if (a.alvo === '2aliados') alvos = ['0-1', '0-2'];
  else if (a.alvo === 'aliado+inimigo') alvos = ['0-1', '1-0'];
  const r = E.agir(st, u.uid, slot, alvos, null);
  if (!r || !r.ok) return null;
  return projLados(st);
}

// confere TODOS os degraus de um deus. `okFn` = coletor de asserção (o global `ok`, ou um silencioso na prova-que-morde).
function conferirDeus(catBase, g, okFn) {
  const ok = okFn;
  const nome = g.nome || g.key;
  for (const ab of (g.ab || [])) {
    if (!Array.isArray(ab.niveis)) continue;
    for (const d of ab.niveis) {
      const nv = d.nv, tag = `${nome}.${ab.slot} nv${nv}`;
      // (A) KIT: efetivo N ≠ efetivo N−1 (fora desc) → INERTE quebra.
      const efN = E.kitEfetivo(g, { [ab.slot]: nv }).ab.find(a => a.slot === ab.slot);
      const efP = E.kitEfetivo(g, { [ab.slot]: nv - 1 }).ab.find(a => a.slot === ab.slot);
      ok(canon(semDesc(efN)) !== canon(semDesc(efP)), `${tag}: KIT inerte — o nível não muda nada no kit efetivo (fora o texto)`);
      // (A1) o caminho declarado passou a valer `para` (o degrau faz o que diz).
      for (const mud of (d.muda || [])) {
        if (mud.caminho === 'fx[]') {
          ok((efN.fx || []).length === (efP.fx || []).length + 1, `${tag}: efeito NOVO (fx[]) não foi acrescentado ao fx`);
        } else {
          ok(lerCaminho(efN, mud.caminho) === mud.para, `${tag}: ${mud.caminho} devia virar ${JSON.stringify(mud.para)} no kit efetivo, veio ${JSON.stringify(lerCaminho(efN, mud.caminho))}`);
        }
      }
      // (B) ESTADO: lançar a habilidade no nível N muda o combate vs N−1.
      const sN = estadoAposCast(catBase, g.key, ab.slot, nv);
      const sP = estadoAposCast(catBase, g.key, ab.slot, nv - 1);
      if (sN === null || sP === null) { ok(false, `${tag}: não consegui lançar ${ab.slot} no cenário (indisponível)`); continue; }
      ok(sN !== sP, `${tag}: ESTADO inerte — lançar a habilidade no nv${nv} produz o MESMO estado do nv${nv - 1} (o degrau não chega ao motor)`);
    }
  }
}

console.log('§318 F1b — babá 8: TODO DEGRAU MUDA O ESTADO');
const catBase = E.catalogoAtivo();
const arquivos = fs.readdirSync(DIR).filter(f => f.endsWith('.json'));
let comNiveis = 0, degraus = 0;
for (const f of arquivos) {
  const g = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'));
  if (!(g.ab || []).some(a => Array.isArray(a.niveis))) continue;
  comNiveis++; for (const ab of g.ab) if (Array.isArray(ab.niveis)) degraus += ab.niveis.length;
  conferirDeus(catBase, g, ok);
}
console.log(`  varridos ${comNiveis} deus(es) com escada, ${degraus} degraus`);

// PROVA QUE MORDE: um degrau FALSO INERTE (de==para: não muda nada) tem de ser ACUSADO (coletor silencioso).
(() => {
  const g = clone(catBase.zeus);
  g.ab[0].niveis = [{ nv: 2, muda: [{ caminho: 'fx[0].v', de: 15, para: 15 }], desc: '15 de dano a 1 inimigo.' }];
  let mordeu = 0; const okSilencioso = (c) => { if (!c) mordeu++; };
  conferirDeus(catBase, g, okSilencioso);
  ok(mordeu > 0, 'MORDE: degrau falso inerte (fx[0].v 15→15) é acusado');
})();

console.log('');
console.log(falhas === 0 ? '>>> DEGRAU OK' : `>>> ${falhas} FALHA(S)`);
process.exit(falhas ? 1 : 0);
