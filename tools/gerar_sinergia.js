// tools/gerar_sinergia.js — §293: MAPA DE SINERGIA entre os 100 deuses, DERIVADO DO FX (nunca da prosa nem do
// tema — a lição do theme≠mechanic, paga 28 vezes). Regenerável: kit novo no futuro roda isto, não edita à mão.
// Como o gerar_dominios/medir_campanha: lê data/deuses (só o fx), escreve data/sinergia.json, imprime distribuição.
//
// CORTE (o dono): efeito que MEIO ELENCO tem é LINHA DE BASE, não sinergia — não entra. 45 curam; listar "cura"
// faria toda ficha mostrar quase todos. Só entram mecânicas RARAS o bastante para dizer algo.
//
// Aresta DIRECIONAL {de, para, familia, motivo}: "na ficha de DE, PARA é parceiro, porque <motivo>". Geramos a
// aresta no lado INFORMATIVO (o beneficiário lista a fonte) p/ o painel não virar lista; onde a mecânica é mútua,
// geramos os dois sentidos.
const fs = require('fs'), path = require('path');
const raiz = path.join(__dirname, '..');
const dir = path.join(raiz, 'data', 'deuses');
const G = {};
for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.json'))) { const g = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); G[g.key] = g; }
const KEYS = Object.keys(G).sort();
const nm = k => (G[k] && G[k].nome) || k, el = k => G[k] && G[k].elem, fac = k => G[k] && G[k].faccao;
const fxDe = g => [...(g.ab || []).flatMap(a => (a.fx || []).map(e => ({ ...e, _slot: a.slot }))), ...((g.passiva && g.passiva.fx) || []).map(e => ({ ...e, _slot: 'passiva' }))];
function walk(fx, cb) { for (const e of (fx || [])) { if (!e || typeof e !== 'object') continue; cb(e); for (const k of ['faz', 'entao', 'senao', 'agenda']) if (Array.isArray(e[k])) walk(e[k], cb); } }

// ---------- 1) PAPÉIS por deus (só do fx) ----------
const AMP = ['vulneravel', 'adormecido', 'marcado', 'encharcado', 'medo'];   // debuffs que AMPLIFICAM o dano recebido (§266)
const P = {};
for (const k of KEYS) {
  const p = P[k] = { bonds: [], setaFase: null, faccaoConta: null, elemAura: null, auraIncond: 0, comboGera: 0, comboConsome: false, aplica: new Set(), execDebuff: new Set(), maiorGolpe: 0 };
  walk(fxDe(G[k]), e => {
    const cond = e.estado || e.quando || null;
    if (cond && cond.aliadoPresente) p.bonds.push({ alvo: cond.aliadoPresente, via: 'aliadoPresente' });
    if (e.gatilho === 'sinergiaAliado' && e.aliado) p.bonds.push({ alvo: e.aliado, via: 'sinergiaAliado', contador: e.contador, v: e.v });
    if (e.t === 'fase' && e.v) p.setaFase = { fase: e.v, dur: e.dur };
    if (cond && cond.faccaoConta) p.faccaoConta = cond.faccaoConta;
    const isBonus = (e.gatilho === 'bonusDano') || (e.t === 'apply' && e.eff && e.eff.type === 'dmgUp');
    const esc = e.escopo, v = (typeof e.v === 'number' ? e.v : (e.eff && e.eff.v));
    if (isBonus && esc === 'time') {
      if (cond && cond.atacanteElem) p.elemAura = { elem: cond.atacanteElem, v };
      else if (cond && cond.alvoDebuff) p.execDebuff.add(cond.alvoDebuff);
      else if (e._slot === 'passiva' && !cond) p.auraIncond = Math.max(p.auraIncond, v || 0);
    }
    if (e.t === 'apply' && e.eff && AMP.includes(e.eff.type)) p.aplica.add(e.eff.type);
    if (e.t === 'dot' && AMP.includes(e.nome)) p.aplica.add(e.nome);
    if (e.t === 'dmg' && typeof e.v === 'number' && e.escopo !== 'todosInimigos' && !e.golpes) p.maiorGolpe = Math.max(p.maiorGolpe, e.v);
    if (e.t === 'contador' && e.nome === 'combo' && e.pool === 'lado') p.comboGera += e.v || 0;
    if ((cond && cond.contadorLado && cond.contadorLado.nome === 'combo') || (e.porContador && e.porContador.nome === 'combo')) p.comboConsome = true;
  });
}

// ---------- 2) ARESTAS por família ----------
const pares = [];
const add = (de, para, familia, motivo) => { if (de !== para && G[para]) pares.push({ de, para, familia, motivo }); };

// (1) LAÇO NOMEADO — o fx cita outro deus (aliadoPresente / sinergiaAliado). Mútuo: os dois se listam.
for (const k of KEYS) for (const b of P[k].bonds) {
  if (b.via === 'sinergiaAliado') {
    add(k, b.alvo, 'laço', `Com ${nm(b.alvo)} no time, gera +${b.v} de ${b.contador} para ele.`);
    add(b.alvo, k, 'laço', `${nm(k)} alimenta o seu contador ${b.contador} quando estão juntos.`);
  } else {
    add(k, b.alvo, 'laço', `A passiva de ${nm(k)} só age com ${nm(b.alvo)} no time (laço nomeado no fx).`);
    add(b.alvo, k, 'laço', `${nm(k)} tem um efeito que se ativa com você no time (laço nomeado).`);
  }
}

// (2) FASE — 3 setters (amaterasu Dia, tsukuyomi Noite, houyi remove o Dia). O FASE_MOD (§96) dá +8 ao ATACANTE
// do elemento favorecido e −5 ao oposto. Aresta do BENEFICIÁRIO p/ o setter (a ficha do Aurora lista o Amaterasu).
const FAVORECE = { Dia: 'Aurora', PUNE_Dia: 'Umbra', Noite: 'Umbra', PUNE_Noite: 'Aurora' };
for (const s of KEYS) {
  const sf = P[s].setaFase; if (!sf) continue;
  const bom = sf.fase === 'Dia' ? 'Aurora' : 'Umbra';
  const ruim = sf.fase === 'Dia' ? 'Umbra' : 'Aurora';
  for (const a of KEYS) {
    if (a === s) continue;
    if (el(a) === bom) add(a, s, 'fase', `${nm(s)} cria a ${sf.fase}: +8 aos seus ataques ${bom} (§96).`);
    if (el(a) === ruim) add(a, s, 'fase-anti', `⚠ ${nm(s)} cria a ${sf.fase}: −5 aos seus ataques ${ruim} (anti-sinergia).`);
  }
}

// (3) COMBO — único contador de POOL do lado (pool:"lado"). Geradores: raijin/susanoo. Consumidor: yamatotakeru.
// (todos os outros contadores — cauda, disco, atadura… — são alvo:self: sinergia com o PRÓPRIO deus, não cruza.)
const geradores = KEYS.filter(k => P[k].comboGera > 0), consumidores = KEYS.filter(k => P[k].comboConsome);
for (const c of consumidores) for (const g of geradores) {
  add(c, g, 'combo', `${nm(g)} enche o Combo do lado (+${P[g].comboGera}) que ${nm(c)} consome.`);
  add(g, c, 'combo', `${nm(c)} consome o Combo do lado que ${nm(g)} gera (senão fica parado).`);
}

// (4) FACÇÃO — passiva com faccaoConta (Odin conta Nórdica ≥2). Odin lista os Nórdicos; cada Nórdico lista o Odin.
for (const o of KEYS) {
  const fc = P[o].faccaoConta; if (!fc) continue;
  for (const a of KEYS) if (a !== o && fac(a) === fc.faccao) {
    add(o, a, 'facção', `${nm(a)} é ${fc.faccao}: conta para a passiva de ${nm(o)} (precisa de ${fc.n}).`);
    add(a, o, 'facção', `Você é ${fc.faccao}: ativa a passiva de ${nm(o)} (${fc.op} ${fc.n} ${fc.faccao}).`);
  }
}

// (5) ELEMENTO — aura condicionada a elemento do ATACANTE (Rá dá +5 aos aliados Aurora). Direcional: o Aurora
// lista o Rá; o Rá não ganha nada de um Aurora qualquer (mas listamos o alcance dele também, p/ o dono decidir).
for (const r of KEYS) {
  const ea = P[r].elemAura; if (!ea) continue;
  for (const a of KEYS) if (a !== r && el(a) === ea.elem) {
    add(a, r, 'elemento', `${nm(r)} dá +${ea.v} aos ataques ${ea.elem} — e você é ${ea.elem}.`);
  }
}

// (6) PREPARADOR→EXECUTOR — direcional. Quem APLICA um debuff amplificador (vulneravel/adormecido/marcado/
// encharcado/medo) prepara para (a) quem tem bonusDano CONTRA aquele debuff (executor explícito no fx), e (b) os
// maiores golpes ÚNICOS do jogo (o amplificador rende mais num golpe grande). Corta o self (aplica e executa só ele).
const TOPGOLPE = 34;   // piso do "maior golpe único" que vale a pena preparar (a cauda alta dos 100)
const CONTROLE = ['adormecido', 'medo'];   // membros do AMP que também são CONTROLE (dormir/provocar) — casam com bonusDano vs 'controle' (Atena, engine.js:12)
for (const prep of KEYS) {
  for (const deb of P[prep].aplica) {
    for (const ex of KEYS) {
      if (ex === prep) continue;
      const exec = P[ex].execDebuff.has(deb) || P[ex].execDebuff.has('qualquer') || (P[ex].execDebuff.has('controle') && CONTROLE.includes(deb));
      const bigHit = P[ex].maiorGolpe >= TOPGOLPE;
      if (exec) add(ex, prep, 'preparador', `${nm(prep)} aplica ${deb}; o seu dano cresce contra alvo com ${deb}.`);
      else if (bigHit && ['vulneravel', 'adormecido'].includes(deb)) add(ex, prep, 'preparador', `${nm(prep)} deixa o alvo ${deb} (recebe mais dano) — e você tem o golpe único de ${P[ex].maiorGolpe}.`);
    }
  }
}

// (7) AURA INCONDICIONAL — passiva que dá dano ao time inteiro, sem condição (Brigid +5, Mímir +6). Direcional:
// cada aliado lista o doador (a ficha do doador não repete os 99). Reforça todo mundo.
for (const d of KEYS) {
  if (P[d].auraIncond <= 0) continue;
  for (const a of KEYS) if (a !== d) add(a, d, 'aura', `${nm(d)} dá +${P[d].auraIncond} de dano ao time inteiro (aura incondicional).`);
}

// ---------- 3) DEDUP + DISTRIBUIÇÃO ----------
const vis = new Set(), limpos = [];
for (const e of pares) { const id = e.de + '|' + e.para + '|' + e.familia; if (vis.has(id)) continue; vis.add(id); limpos.push(e); }
// grau = quantos parceiros a ficha de cada deus mostra (out-degree), sem duplicar por família
const parceirosDe = {}; for (const k of KEYS) parceirosDe[k] = new Set();
for (const e of limpos) parceirosDe[e.de].add(e.para);
const dist = KEYS.map(k => ({ k, n: parceirosDe[k].size })).sort((a, b) => b.n - a.n);
const famCount = {}; for (const e of limpos) famCount[e.familia] = (famCount[e.familia] || 0) + 1;

const saida = {
  gerado: new Date().toISOString().slice(0, 10),
  fonte: 'data/deuses/*.json (fx) — DERIVADO, não editar à mão; rode tools/gerar_sinergia.js',
  familias: { laço: 'fx cita outro deus (aliadoPresente/sinergiaAliado)', fase: 'setter de Dia/Noite + FASE_MOD por elemento (§96)', 'fase-anti': 'anti-sinergia: a fase pune o elemento oposto', combo: 'contador de pool do lado: gera↔consome', facção: 'passiva faccaoConta (Odin: Nórdica)', elemento: 'aura por elemento do atacante (Rá: Aurora)', preparador: 'aplica debuff amplificador → executor', aura: 'aura de dano ao time inteiro, incondicional' },
  totalPares: limpos.length,
  porFamilia: famCount,
  distribuicao: dist.map(d => ({ deus: d.k, parceiros: d.n })),
  pares: limpos.sort((a, b) => a.de.localeCompare(b.de) || a.familia.localeCompare(b.familia) || a.para.localeCompare(b.para)),
};
fs.writeFileSync(path.join(raiz, 'data', 'sinergia.json'), JSON.stringify(saida, null, 1) + '\n');

// ---------- 4) RELATÓRIO ----------
console.log('MAPA DE SINERGIA (§293) — ' + limpos.length + ' arestas direcionais, ' + KEYS.length + ' deuses');
console.log('por família:', JSON.stringify(famCount));
const ns = dist.map(d => d.n);
console.log('\nDISTRIBUIÇÃO de parceiros por deus (out-degree):');
console.log('  máx ' + ns[0] + ' (' + dist[0].k + ') · mediana ' + ns[Math.floor(ns.length / 2)] + ' · mín ' + ns[ns.length - 1] + ' (' + dist[dist.length - 1].k + ')');
console.log('  top 8:', dist.slice(0, 8).map(d => d.k + ':' + d.n).join(' '));
console.log('  bottom 8:', dist.slice(-8).map(d => d.k + ':' + d.n).join(' '));
console.log('  deuses com 0 parceiros:', dist.filter(d => d.n === 0).map(d => d.k).join(', ') || '(nenhum)');
