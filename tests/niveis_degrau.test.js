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

// lê o valor de um `caminho` num ab (espelha o motor; fx[] não tem valor "atual"). §318 F3 L6: navega ramos
// condicionais aninhados (entao/senao) e o `.hp` de revive/vidaExtra — igual ao _navFx do motor.
function lerCaminho(ab, c) {
  let m;
  if (c === 'fx[]') return undefined;
  if (c === 'cd') return ab.cd;
  if ((m = c.match(/^cost\.(.+)$/))) return ab.cost ? ab.cost[m[1]] : undefined;
  // §318 F3 L9 (ext iii leve) — prefixo opcoes[k].: navega dentro da opção k (Lugh)
  let base = ab, c1 = c, om;
  if ((om = c.match(/^opcoes\[(\d+)\]\./))) { base = (ab.opcoes || [])[+om[1]]; if (!base) return undefined; c1 = c.slice(om[0].length); }
  const nm = c1.match(/^fx\[(\d+)\]/);
  if (!nm) return undefined;
  let node = (base.fx || [])[+nm[1]];
  let rest = c1.slice(nm[0].length), bm;
  while ((bm = rest.match(/^\.(entao|senao|agenda)\[(\d+)\]/))) { if (!node) return undefined; const arr = node[bm[1]]; node = Array.isArray(arr) ? arr[+bm[2]] : undefined; rest = rest.slice(bm[0].length); }
  if (!node) return undefined;
  if (rest === '.v') return node.v;
  if (rest === '.dur') return node.dur;
  if (rest === '.hp') return node.hp;
  if (rest === '.eff.v') return node.eff ? node.eff.v : undefined;
  if (rest === '.eff.dur') return node.eff ? node.eff.dur : undefined;
  let pm;   // §318 F3 L11 (ext v): dano POSICIONAL (Raijin) — fx[i].posicional[k]
  if ((pm = rest.match(/^\.posicional\[(\d+)\]$/))) return (node.posicional || [])[+pm[1]];
  return undefined;
}
// §318 F3 L6 — varre fx recursivamente (inclui ramos) procurando um marcador.
function scanFx(fxArr, pred) { for (const f of (fxArr || [])) { if (pred(f)) return f; for (const br of ['entao', 'senao']) { const r = f && Array.isArray(f[br]) && scanFx(f[br], pred); if (r) return r; } } return null; }
const semDesc = ab => { const o = clone(ab); delete o.desc; return o; };

// companheiros e inimigos por deus (só precisam ser deuses válidos e estáveis; a escolha se cancela
// entre N e N−1, pois o cenário é idêntico — só o nível de ALVO muda).
const CENARIO = {
  zeus: { time: ['zeus', 'ares', 'atena'], inim: ['ogum', 'thor', 'odin'] },
  oxum: { time: ['oxum', 'ogum', 'tyr'], inim: ['ares', 'thor', 'odin'] },
  tyr: { time: ['tyr', 'thor', 'odin'], inim: ['ares', 'atena', 'apolo'] },
};
// §318 F3 LOTE1: o cenário PADRÃO usa inimigos LIMPOS (sem redução de time — Thor daria −6 a todos e ENGOLIRIA um dano
// NOVO-PEQUENO de 5, mascarando o degrau como "inerte"). demeter/ganesha/hades não reduzem, não têm invulnerabilidade
// nem evasão: um dano pequeno POUSA e o degrau fica VISÍVEL. Deuses com CENARIO próprio (zeus/oxum/tyr) seguem intactos.
const _cenPad = key => CENARIO[key] || { time: [key, 'ares', 'atena'], inim: ['demeter', 'ganesha', 'hades'] };

// projeção de combate do estado (o que o degrau pode mexer): os dois lados (unidades: hp, efeitos,
// dots, shield, cd, contadores) + orbes. NÃO o catId (que muda com o nível por construção) nem o log.
function projLados(st) { return canon(st.lados.map(l => ({ orbs: l.orbs, units: l.units.map(u => ({ hp: u.hp, shield: u.shield, cd: u.cd, efeitos: u.efeitos, dots: u.dots, contadores: u.contadores, vivo: u.vivo, vidaExtra: u.vidaExtra, pendente: u.pendente })) }))); }   // §318 F3 L6: vidaExtra (Bastet) é campo próprio da unidade — sem ele o degrau de hp da Vida Extra pareceria inerte

// monta o cenário FIXO e lança `slot` de ALVO no nível `nv`; devolve a projeção de estado (ou null se não deu p/ lançar).
function estadoAposCast(catBase, key, slot, nv, caminhoAtual) {
  const cen = _cenPad(key);
  const cat = clone(catBase);
  const st = E.novoEstado(cen.time.slice(), cen.inim.slice(), 7, 0, null, cat, [{ [key]: { [slot]: nv } }, {}]);
  E.ELEMS.forEach(e => { st.lados[0].orbs[e] = 9; });     // orbes cheios: paga qualquer custo
  st.lados[0].units.forEach(u => { u.hp = 60; });          // lado 0 ferido: curas/self-heal ficam VISÍVEIS (abaixo do teto)
  // §318 F3 LOTE1: SEMEIA um debuff nos ALIADOS do lançador (nunca no lançador — ele precisa agir) — igual em N e N−1,
  // então CANCELA para todo degrau que não o toca; só um `cleanse`/strip de escopo TIME o consome, tornando o degrau
  // (ex.: Apolo milagre nv4) VISÍVEL no estado. Um efeito (vulneravel) e um DoT (veneno) cobrem as duas famílias.
  for (let i = 1; i < st.lados[0].units.length; i++) {
    const al = st.lados[0].units[i];
    al.efeitos.push({ type: 'vulneravel', v: 5, dur: 3, origem: st.lados[1].units[0].uid });
    al.dots.push({ nome: 'veneno', v: 4, dur: 3, origem: st.lados[1].units[0].uid });
  }
  // §318 F3 L6 — PREPARA a condição só quando o DEGRAU testado precisa dela (senão o ramo/revive nunca dispara e
  // pareceria inerte). Guiado pelo CAMINHO do degrau: um degrau no ramo `entao` quer a condição VERDADEIRA; no `senao`
  // quer FALSA (cenário padrão); um degrau `.hp` é revive/vidaExtra. O cenário é idêntico em N e N−1 → a diferença cancela.
  const efAb = E.kitEfetivo(cat[key], { [slot]: nv }).ab.find(a => a.slot === slot);
  const cam = caminhoAtual || '';
  const inEntao = /\.entao\[/.test(cam);
  if (efAb) {
    if (/\.hp$/.test(cam) && scanFx(efAb.fx, f => f.t === 'revive' || f.t === 'reviveProximoTurno')) { const cai = st.lados[0].units[2]; cai.vivo = false; cai.hp = 0; cai.efeitos = []; cai.dots = []; }   // revive: aliado caído
    if (inEntao) {
      const seHp = scanFx(efAb.fx, f => f.se && f.se.alvoHp && f.se.alvoHp.op === 'abaixo');   // ramo "hp abaixo de X": fere o aliado-alvo (Osíris)
      if (seHp) { const al = st.lados[0].units[1]; al.hp = Math.max(1, seHp.se.alvoHp.v - 20); }
      const seMarca = scanFx(efAb.fx, f => f.se && f.se.alvoMarca);   // ramo "tem a marca": semeia a marca no inimigo-alvo (Hórus: o Olho)
      if (seMarca) { const inim = st.lados[1].units[0]; inim.efeitos.push({ type: seMarca.se.alvoMarca, dur: 3, origem: st.lados[0].units[0].uid }); }
      const seCont = scanFx(efAb.fx, f => f.se && f.se.contador && typeof f.se.contador.n === 'number');   // §318 F3 L8 — ramo "contador >= n": arma o contador do lançador (Dagda: clava a cada 3º uso)
      if (seCont) { const u0 = st.lados[0].units[0]; u0.contadores = u0.contadores || {}; u0.contadores[seCont.se.contador.nome] = seCont.se.contador.n; }
      const seAlvoCont = scanFx(efAb.fx, f => f.se && f.se.alvoContador && typeof f.se.alvoContador.n === 'number');   // §318 F3 L12 — ramo "o ALVO tem contador >= n" (Izanagi: limpa+cura um ALIADO com Maldição): semeia o contador no aliado-alvo
      if (seAlvoCont) { const al = st.lados[0].units[1]; al.contadores = al.contadores || {}; al.contadores[seAlvoCont.se.alvoContador.nome] = seAlvoCont.se.alvoContador.n; }
    }
  }
  const u = st.lados[0].units[0];
  const a = E.acoesDe(st, u).find(x => x.slot === slot);
  if (!a || !a.disponivel) return null;
  let alvos = [];
  if (a.alvo === 'inimigo') alvos = ['1-0'];
  else if (a.alvo === 'aliado') alvos = ['0-1'];
  else if (a.alvo === '2inimigos') alvos = ['1-0', '1-1'];
  else if (a.alvo === '2aliados') alvos = ['0-1', '0-2'];
  else if (a.alvo === 'aliado+inimigo') alvos = ['0-1', '1-0'];
  else if (a.alvo === 'distribui') alvos = ['1-0', '1-1', '1-2'];   // §318 F3 L6: multi-golpe distribuído (Babi milagre)
  // §318 F3 L9 (ext iii leve) — habilidade de ESCOLHA (opcoes, Lugh): lança TODAS as opções para o degrau de cada uma ficar visível
  const escolhas = (efAb && Array.isArray(efAb.opcoes)) ? efAb.opcoes.map((_, i) => i) : null;
  const r = E.agir(st, u.uid, slot, alvos, escolhas);
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
      // (B) ESTADO: lançar a habilidade no nível N muda o combate vs N−1. O cenário é preparado p/ o caminho do
      // degrau nv (ramo entao/senao, revive) — IGUAL em N e N−1, isolando a diferença deste degrau.
      const camDegrau = (d.muda && d.muda[0] && d.muda[0].caminho) || '';
      const sN = estadoAposCast(catBase, g.key, ab.slot, nv, camDegrau);
      const sP = estadoAposCast(catBase, g.key, ab.slot, nv - 1, camDegrau);
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
