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
// Cada aresta tem `motivo` (frase inteira, p/ a lista completa na sobreposição) E `curto` (SÓ A MECÂNICA, sem repetir
// o nome — o nome vai na linha de cima do parceiro no painel §294; o retrato mostra o rosto). A mecânica curta cabe em
// UMA linha de 167px sem reticência (a guarda do dono: "nenhum motivo corta a 780"). O painel mostra nome+curto (2
// linhas); a sobreposição mostra o motivo inteiro. PRIORIDADE (o dono): laço > combo > facção > preparador > elem/fase.
const pares = [];
const add = (de, para, familia, motivo, curto) => { if (de !== para && G[para]) pares.push({ de, para, familia, motivo, curto }); };

// (1) LAÇO NOMEADO — o fx cita outro deus (aliadoPresente / sinergiaAliado). Mútuo: os dois se listam.
for (const k of KEYS) for (const b of P[k].bonds) {
  if (b.via === 'sinergiaAliado') {
    add(k, b.alvo, 'laço', `Com ${nm(b.alvo)} no time, gera +${b.v} de ${b.contador} para ele.`, `+${b.v} de ${b.contador} p/ ele`);
    add(b.alvo, k, 'laço', `${nm(k)} alimenta o seu contador ${b.contador} quando estão juntos.`, `enche a sua ${b.contador}`);
  } else {
    add(k, b.alvo, 'laço', `A passiva de ${nm(k)} só age com ${nm(b.alvo)} no time (laço nomeado no fx).`, `destrava a sua passiva`);
    add(b.alvo, k, 'laço', `${nm(k)} tem um efeito que se ativa com você no time (laço nomeado).`, `a passiva dele ativa com você`);
  }
}

// (2) FASE — 2 setters (amaterasu Dia, tsukuyomi Noite). O FASE_MOD (§96) dá +8 ao ATACANTE do elemento favorecido
// e −5 ao oposto. Aresta do BENEFICIÁRIO p/ o setter (a ficha do Aurora lista o Amaterasu). fase-anti é AVISO.
for (const s of KEYS) {
  const sf = P[s].setaFase; if (!sf) continue;
  const bom = sf.fase === 'Dia' ? 'Aurora' : 'Umbra';
  const ruim = sf.fase === 'Dia' ? 'Umbra' : 'Aurora';
  for (const a of KEYS) {
    if (a === s) continue;
    if (el(a) === bom) add(a, s, 'fase', `${nm(s)} cria a ${sf.fase}: +8 aos seus ataques ${bom}.`, `${sf.fase}: +8 aos seus ${bom}`);
    if (el(a) === ruim) add(a, s, 'fase-anti', `⚠ ${nm(s)} cria a ${sf.fase}: −5 aos seus ataques ${ruim} (anti-sinergia).`, `⚠ ${sf.fase}: −5 nos seus ${ruim}`);
  }
}

// (3) COMBO — único contador de POOL do lado (pool:"lado"). Geradores: raijin/susanoo. Consumidor: yamatotakeru.
// (todos os outros contadores — cauda, disco, atadura… — são alvo:self: sinergia com o PRÓPRIO deus, não cruza.)
const geradores = KEYS.filter(k => P[k].comboGera > 0), consumidores = KEYS.filter(k => P[k].comboConsome);
for (const c of consumidores) for (const g of geradores) {
  add(c, g, 'combo', `${nm(g)} enche o Combo do lado (+${P[g].comboGera}) que ${nm(c)} consome.`, `enche o Combo que você gasta`);
  add(g, c, 'combo', `${nm(c)} consome o Combo do lado que ${nm(g)} gera (senão fica parado).`, `gasta o Combo que você faz`);
}

// (4) FACÇÃO — passiva com faccaoConta (Odin conta Nórdica ≥2). Odin lista os Nórdicos; cada Nórdico lista o Odin.
for (const o of KEYS) {
  const fc = P[o].faccaoConta; if (!fc) continue;
  for (const a of KEYS) if (a !== o && fac(a) === fc.faccao) {
    add(o, a, 'facção', `${nm(a)} é ${fc.faccao}: conta para a passiva de ${nm(o)} (precisa de ${fc.n}).`, `${fc.faccao}: conta p/ você`);
    add(a, o, 'facção', `Você é ${fc.faccao}: ativa a passiva de ${nm(o)} (${fc.op} ${fc.n} ${fc.faccao}).`, `você conta ${fc.faccao} p/ ele`);
  }
}

// (5) ELEMENTO — aura condicionada a elemento do ATACANTE (Rá dá +5 aos aliados Aurora). Direcional: o Aurora
// lista o Rá; o Rá não ganha nada de um Aurora qualquer (mas listamos o alcance dele também, p/ o dono decidir).
for (const r of KEYS) {
  const ea = P[r].elemAura; if (!ea) continue;
  for (const a of KEYS) if (a !== r && el(a) === ea.elem) {
    add(a, r, 'elemento', `${nm(r)} dá +${ea.v} aos ataques ${ea.elem} — e você é ${ea.elem}.`, `+${ea.v} aos seus ${ea.elem}`);
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
      if (exec) add(ex, prep, 'preparador', `${nm(prep)} aplica ${deb}; o seu dano cresce contra alvo com ${deb}.`, `deixa o alvo ${deb}`);
      else if (bigHit && ['vulneravel', 'adormecido'].includes(deb)) add(ex, prep, 'preparador', `${nm(prep)} deixa o alvo ${deb} (recebe mais dano) — e você tem o golpe único de ${P[ex].maiorGolpe}.`, `deixa o alvo ${deb}`);
    }
  }
}

// (7) AURA INCONDICIONAL — passiva que dá dano ao time inteiro, sem condição (Brigid +5, Mímir +6). NÃO é par: vira
// FAIXA GLOBAL (§294, dono). Guardado à parte (auraDoadores), não como aresta par-a-par. Ver bloco 3.


// ---------- 3) FAIXA GLOBAL (aura + suporte-de-time) — NÃO é par (§294) ----------
// AURA: doadores incondicionais (Brigid/Mímir). Vira uma linha fixa na ficha, não 98 arestas.
const auraDoadores = KEYS.filter(k => P[k].auraIncond > 0).map(k => ({ deus: k, nome: nm(k), v: P[k].auraIncond })).sort((a, b) => b.v - a.v);
// SUPORTE-DE-TIME próprio: cura/escuda/reduz/protege/revive o time — global, não par (uma curandeira não tem laço
// com ninguém). Vira "reforça/cura/protege o time" na ficha do próprio deus. Derivado do fx (mesmo critério do §293).
const suporte = {};
for (const k of KEYS) {
  let t = null;
  walk(fxDe(G[k]), e => {
    if (e.t === 'heal' && e.escopo === 'time') t = t || 'cura o time';
    else if (e.t === 'shield' && e.escopo === 'time') t = t || 'escuda o time';
    else if (e.gatilho === 'reducao' && e.escopo === 'time') t = t || 'reduz o dano do time';
    else if (e.t === 'revive' && e.escopo !== 'self') t = t || 'revive aliados';
    else if (e.t === 'intercepta') t = t || 'intercepta pelos aliados';
    else if (e.t === 'apply' && e.eff && e.eff.type === 'taunt') t = t || 'protege a frente';
  });
  if (t) suporte[k] = t;
}

// ---------- 4) DEDUP + PRIORIDADE + FICHAS ----------
const PRIOR = { 'laço': 1, combo: 2, 'facção': 3, preparador: 4, elemento: 5, fase: 5, 'fase-anti': 8 };
const vis = new Set(), limpos = [];
for (const e of pares) { const id = e.de + '|' + e.para + '|' + e.familia; if (vis.has(id)) continue; vis.add(id); limpos.push({ ...e, prioridade: PRIOR[e.familia] || 6 }); }
// FICHA por deus: parceiros ORDENADOS por prioridade (o dono, §294: laço muda comportamento, o resto soma número),
// desempate por nome; os 3 primeiros são o painel, o resto é o "+N ›" da sobreposição. solista = 0 parceiros e 0 suporte.
const fichas = {};
for (const k of KEYS) {
  const ps = limpos.filter(e => e.de === k).sort((a, b) => a.prioridade - b.prioridade || nm(a.para).localeCompare(nm(b.para)))
    .map(e => ({ para: e.para, nome: nm(e.para), familia: e.familia, prioridade: e.prioridade, curto: e.curto, motivo: e.motivo }));
  fichas[k] = { parceiros: ps, suporte: suporte[k] || null, solista: ps.length === 0 && !suporte[k] };
}
const dist = KEYS.map(k => ({ k, n: fichas[k].parceiros.length })).sort((a, b) => b.n - a.n);
const famCount = {}; for (const e of limpos) famCount[e.familia] = (famCount[e.familia] || 0) + 1;

const saida = {
  gerado: new Date().toISOString().slice(0, 10),
  fonte: 'data/deuses/*.json (fx) — DERIVADO, não editar à mão; rode tools/gerar_sinergia.js',
  familias: { laço: 'fx cita outro deus (aliadoPresente/sinergiaAliado)', fase: 'setter de Dia/Noite + FASE_MOD por elemento', 'fase-anti': 'anti-sinergia: a fase pune o elemento oposto', combo: 'contador de pool do lado: gera↔consome', facção: 'passiva faccaoConta (Odin: Nórdica)', elemento: 'aura por elemento do atacante (Rá: Aurora)', preparador: 'aplica debuff amplificador → executor' },
  prioridade: PRIOR,
  auraDoadores,   // faixa global: "<nomes> reforçam o time" (§294)
  totalPares: limpos.length,
  porFamilia: famCount,
  distribuicao: dist.map(d => ({ deus: d.k, parceiros: d.n })),
  fichas,         // por deus: parceiros ordenados (painel=3, resto=+N), suporte (faixa), solista
  pares: limpos.sort((a, b) => a.de.localeCompare(b.de) || a.prioridade - b.prioridade || a.para.localeCompare(b.para)),
};
fs.writeFileSync(path.join(raiz, 'data', 'sinergia.json'), JSON.stringify(saida, null, 1) + '\n');

// ---------- 5) RELATÓRIO ----------
console.log('MAPA DE SINERGIA (§293/§294) — ' + limpos.length + ' arestas par-a-par (aura virou faixa), ' + KEYS.length + ' deuses');
console.log('por família:', JSON.stringify(famCount));
console.log('faixa: aura', auraDoadores.map(d => d.nome + '+' + d.v).join('/'), '· suporte-de-time:', Object.keys(suporte).length, 'deuses');
const ns = dist.map(d => d.n);
console.log('\nDISTRIBUIÇÃO de parceiros por deus (out-degree, sem aura):');
console.log('  máx ' + ns[0] + ' (' + dist[0].k + ') · mediana ' + ns[Math.floor(ns.length / 2)] + ' · mín ' + ns[ns.length - 1]);
console.log('  cabem em ≤3 (painel):', ns.filter(n => n <= 3).length, '· estouram (>3, mostram +N):', ns.filter(n => n > 3).length);
console.log('  os que estouram:', dist.filter(d => d.n > 3).map(d => d.k + ':' + d.n).join(' '));
const solistas = KEYS.filter(k => fichas[k].solista);
console.log('  solistas (0 par, 0 suporte):', solistas.length, '·', solistas.join(', '));
