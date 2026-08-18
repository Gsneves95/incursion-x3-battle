// tools/checar_cadeia.js — ELO B da cadeia de verdade (F1.0e): kits.json (PROSA, fonte revisada)
// ↔ data/deuses (MÁQUINA, derivada). Confere número a número; DIVERGÊNCIA é presunção de erro no
// MOTOR (o kits.json é a fonte — DECISÕES §26). Este checador só APONTA, nunca conserta.
//
// Campo que o parser não resolve com segurança vira NÃO-CONFERÍVEL (reportado, nunca engolido) —
// inclui fx dinâmico (alterna/opcoes, cujo valor mora no motor, não no kit) e dano multi/condicional.
// Se a proporção não-conferível ficar alta, o checador não protege nada; por isso ele imprime a
// proporção. A build (tools/build.js) falha se houver DIVERGÊNCIA. Elo A (planilha↔kits.json) é
// tarefa aberta no ESTADO.md — parse cru de XML, sem dep, para quando a Fase 1 fechar.
const fs = require('fs'), path = require('path');
const raiz = path.join(__dirname, '..');
const ler = p => fs.readFileSync(path.join(raiz, p), 'utf8');

const SLOTS = ['basico', 'habilidade', 'milagre'];   // defesa é universal (motor); passiva é só prosa

// "2 Chama + 1 livre" / "—" / "" -> { chama:2, livre:1 }  (chaves minúsculas dos dois lados)
function parseCusto(str) {
  const c = {};
  if (!str || str === '—' || /gr[aá]tis/i.test(str)) return c;
  for (const part of String(str).split('+')) {
    const m = part.trim().match(/^(\d+)\s+(.+)$/); if (!m) continue;
    const k = /^livres?$/.test(m[2].trim().toLowerCase()) ? 'livre' : m[2].trim().toLowerCase();
    c[k] = (c[k] || 0) + (+m[1]);
  }
  return c;
}
const normCost = cost => { const o = {}; for (const k in (cost || {})) o[k.toLowerCase()] = cost[k]; return o; };
const ord = o => JSON.stringify(Object.fromEntries(Object.entries(o).sort()));
const mesmoArr = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// dano CAUSADO na prosa: exclui "+N de dano" (dmgUp), "N menos/mais de dano" (dmgDown/Up)
function danosProsa(ef) {
  const out = [];
  for (const m of ef.matchAll(/(\d+)\s+de dano/g)) {
    const pre = ef.slice(Math.max(0, m.index - 8), m.index);
    if (/[+]\s*$|menos\s+$|mais\s+$/.test(pre)) continue;
    if (m[1] === '0' && /causam\s+$/.test(pre)) continue;   // Pacificar: "causam 0 de dano" descreve o EFEITO (dano do ALVO→0), não o dano DESTA habilidade — nenhuma habilidade "causa 0"
    const post = ef.slice(m.index + m[0].length, m.index + m[0].length + 16);
    if (/^\s*(?:(?:puro\s*)?\/\s*turno|(?:puro\s+)?(?:cada\s+)?por\s+turno)/.test(post)) continue;   // TICK de DoT ("N de dano [puro]/turno" OU "N de dano [puro] [cada] por turno" — Veneno/Sangramento/Tormento; "cada por turno" = tick de INVOCAÇÃO do Sun Wukong): dano do EFEITO ao longo do tempo, não o dano DESTA habilidade. Específico (dono §67): não casa "N de dano a 1 inimigo". "cada" é ÚNICO do Sun Wukong (varrido no kits.json)
    out.push(+m[1]);
  }
  return out;
}
const curasProsa = ef => [...ef.matchAll(/cura\s+(\d+)/gi)].map(m => +m[1]);
// dmg do fx, RECURSANDO no `condicional` (F1.9, Hórus §87): os dmg dos ramos entao/senao SÃO o dano da habilidade,
// só que condicionais — caem no balde "multi/condicional" (naoConf) via dM.length>1, com os dois valores à vista.
const danosFx = fx => (fx || []).flatMap(e => e.t === 'dmg' ? [e.v]
  : (e.t === 'condicional' ? [...(e.entao || []), ...(e.senao || [])].filter(x => x.t === 'dmg').map(x => x.v) : []));
const curasFx = fx => (fx || []).filter(e => e.t === 'heal').map(e => e.v);

// COMPARA prosa↔máquina. Puro (recebe os dados), para o teste exercitar com entradas sintéticas.
function conferir(prosaByKey, deusesArray) {
  const R = { match: 0, diverge: 0, naoConf: 0 };
  const divergencias = [], naoConferiveis = [];
  const reg = (kit, slot, campo, status, det) => {
    R[status]++;
    if (status === 'diverge') divergencias.push(`${kit}.${slot} [${campo}] ${det}`);
    if (status === 'naoConf') naoConferiveis.push(`${kit}.${slot} [${campo}] ${det}`);
  };
  for (const g of deusesArray) {
    const p = prosaByKey[g.key];
    if (!p) { divergencias.push(`${g.key} não existe em kits.json`); continue; }
    for (const slot of SLOTS) {
      const ab = (g.ab || []).find(a => a.slot === slot), ps = p[slot];
      if (!ab || !ps) continue;
      reg(g.key, slot, 'nome', ab.nome === ps.nome ? 'match' : 'diverge', `"${ab.nome}" ≠ "${ps.nome}"`);
      reg(g.key, slot, 'recarga', (ab.cd || 0) === (ps.recarga || 0) ? 'match' : 'diverge', `motor ${ab.cd || 0} ≠ prosa ${ps.recarga || 0}`);
      reg(g.key, slot, 'custo', ord(parseCusto(ps.custo)) === ord(normCost(ab.cost)) ? 'match' : 'diverge',
        `motor ${JSON.stringify(normCost(ab.cost))} ≠ prosa ${JSON.stringify(parseCusto(ps.custo))}`);
      const fxDinamico = !!(ab.alterna || ab.opcoes);   // valor mora no motor, não no kit
      const dP = danosProsa(ps.efeito).sort((a, b) => a - b), dM = danosFx(ab.fx).sort((a, b) => a - b);
      if (dP.length === 0 && dM.length === 0) { /* nada a conferir */ }
      else if (fxDinamico) reg(g.key, slot, 'dano', 'naoConf', 'fx dinâmico (alterna/opcoes): valor mora no motor');
      else if (dM.length > 1 || (ab.fx || []).some(e => e.golpes) || /golpes|por (Disco|Combo|Cauda|Podrid|Atadura|inimigo|aliado)/i.test(ps.efeito))
        // multi-golpe DISTRIBUÍDO (§92): a CONTAGEM mora na prosa ("9 flechas de 5"), o valor-por-golpe no motor —
        // detecta pelo fx (`golpes`), não pela palavra da prosa (a prosa diz "flechas", "golpes", etc.: robusto ao substantivo).
        reg(g.key, slot, 'dano', 'naoConf', `multi/condicional: prosa=${JSON.stringify(dP)} motor=${JSON.stringify(dM)}`);
      else reg(g.key, slot, 'dano', mesmoArr(dP, dM) ? 'match' : 'diverge', `motor ${JSON.stringify(dM)} ≠ prosa ${JSON.stringify(dP)}`);
      const hP = curasProsa(ps.efeito).sort((a, b) => a - b), hM = curasFx(ab.fx).sort((a, b) => a - b);
      if (hP.length === 0 && hM.length === 0) { /* nada */ }
      else if (fxDinamico) reg(g.key, slot, 'cura', 'naoConf', 'fx dinâmico (alterna/opcoes): valor mora no motor');
      else reg(g.key, slot, 'cura', mesmoArr(hP, hM) ? 'match' : 'diverge', `motor ${JSON.stringify(hM)} ≠ prosa ${JSON.stringify(hP)}`);
    }
  }
  const total = R.match + R.diverge + R.naoConf;
  return { R, divergencias, naoConferiveis, total, pctNaoConf: total ? R.naoConf / total * 100 : 0 };
}

// roda nos arquivos reais
const prosaByKey = Object.fromEntries(JSON.parse(ler('data/kits.json')).map(g => [g.key, g]));
const deusesArray = fs.readdirSync(path.join(raiz, 'data/deuses')).filter(f => f.endsWith('.json')).sort()
  .map(f => JSON.parse(ler('data/deuses/' + f)));
const res = conferir(prosaByKey, deusesArray);

if (require.main === module || process.env.CADEIA_VERBOSE) {
  console.log(`ELO B (kits.json ↔ data/deuses) — ${deusesArray.length} kits, ${res.total} conferências`);
  console.log(`  match ${res.R.match} · DIVERGE ${res.R.diverge} · não-conferível ${res.R.naoConf} (${res.pctNaoConf.toFixed(1)}%)`);
  if (res.divergencias.length) console.log('  DIVERGÊNCIAS:\n    ' + res.divergencias.join('\n    '));
  if (res.naoConferiveis.length) console.log('  não-conferível:\n    ' + res.naoConferiveis.join('\n    '));
}

module.exports = { conferir, ...res, prosaByKey, deusesArray };
if (require.main === module) process.exit(res.divergencias.length ? 1 : 0);
