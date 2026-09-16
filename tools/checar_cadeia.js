// tools/checar_cadeia.js — ELO B da cadeia de verdade (F1.0e): kits.json (PROSA, fonte revisada)
// ↔ data/deuses (MÁQUINA, derivada). Confere número a número; DIVERGÊNCIA é presunção de erro no
// MOTOR (o kits.json é a fonte — DECISÕES §26). Este checador só APONTA, nunca conserta.
// §286: os NÚMEROS (dano/cura/orbe/escudo/combo/duração) são extraídos do `data/deuses.desc` — o TEXTO
// QUE O JOGADOR LÊ (§271/§284-ajuste2) — e conferidos contra o fx do MESMO arquivo. Antes vinham do
// `kits.efeito`, que a tela de coleção/campanha não exibe: o guarda protegia um arquivo, não a tela.
// A ESTRUTURA (nome do deus/ação, custo, recarga, facção/elemento/classe/função, arquétipo, nome da
// passiva) segue conferida kits.json ↔ data/deuses — é o balanço, guardado à parte dos números.
//
// Campo que o parser não resolve com segurança vira NÃO-CONFERÍVEL (reportado, nunca engolido) —
// inclui fx dinâmico (alterna/opcoes, cujo valor mora no motor, não no kit) e dano multi/condicional.
// Se a proporção não-conferível ficar alta, o checador não protege nada; por isso ele imprime a
// proporção. A build (tools/build.js) falha se houver DIVERGÊNCIA. Elo A (planilha↔kits.json) é
// tarefa aberta no ESTADO.md — parse cru de XML, sem dep, para quando a Fase 1 fechar.
const fs = require('fs'), path = require('path');
const raiz = path.join(__dirname, '..');
const ler = p => fs.readFileSync(path.join(raiz, p), 'utf8');

const SLOTS = ['basico', 'habilidade', 'milagre'];   // defesa é universal (motor); a passiva é conferida à parte (nome §285 + números §286)

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
const danosFx = fx => (fx || []).flatMap(e => e.t === 'dmg' ? (e.posicional || [e.v])   // §135 (Raijin): dano posicional [18,12,8] — cada posição é um valor da habilidade
  : (e.t === 'condicional' ? danosFx([...(e.entao || []), ...(e.senao || [])])   // §118 (Ammit): recursa FUNDO — condicional aninhado (OR de status via ramos senão) leva o dmg vários níveis abaixo
  : (e.t === 'apply' && e.eff && e.eff.type === 'retaliacao' ? [e.eff.v]   // §136 (Khonshu): a marca-retaliação carrega o dano (30 puro) que o matador sofre — é dano da habilidade, condicional/diferido
  : (e.t === 'agendar' ? danosFx(e.agenda || [])   // §117: o dano AGENDADO (Kukulkán) mora no payload `agenda` — é dano da habilidade, só que no próximo turno
  : (Array.isArray(e.faz) ? danosFx(e.faz) : [])))));   // §286: a PASSIVA embrulha o efeito em {gatilho, faz:[...]} — recursa no faz (as habilidades não usam `faz`, então é neutro p/ elas)
// cura do fx, RECURSANDO no `condicional` (§101, Chang'e): "cura 20; na NOITE cura 30" mora em entao/senao — os dois
// valores SÃO a cura da habilidade (um ramo por vez). §118: recursa fundo (condicional aninhado).
const curasFx = fx => (fx || []).flatMap(e => e.t === 'heal' ? [e.v]
  : e.curaPorAlvo ? [e.curaPorAlvo]   // §127 (Hel): "cura N por alvo atingido" — o N é a cura da habilidade (rider no dmg)
  : (e.t === 'condicional' ? curasFx([...(e.entao || []), ...(e.senao || [])])
  : (Array.isArray(e.faz) ? curasFx(e.faz) : [])));   // §286: recursa no `faz` da passiva (neutro p/ habilidades)

// ---------- §270: EIXOS DE VALOR além de dano/cura (o achado da auditoria: só 2 dos 6 eram conferidos) ----------
// Extração recursiva por eixo. Regra de bucketing (como o dano): confere ESTRITO só quando os dois lados têm
// EXATAMENTE UM valor; qualquer outra forma (multi-status, contagem que não casa, vazio de um lado) vira
// NÃO-CONFERÍVEL (reportado, nunca engolido, nunca falha-alto) — assim nenhum eixo MENTE.
//
// QUATRO eixos entram: `orbe`, `escudo`/Defesa, `combo` (geração) ESTRITOS; `duração` estrita COM UMA
// CONVENÇÃO codificada (§271, medido: dos 55 descasamentos, 1 é a convenção, 54 são ambiguidade de texto,
// ZERO defeito real). A convenção do AGENDADO: efeito agendado conta a vez da aplicação, então um status
// aplicado junto de um `agendar` aceita fx = texto OU texto+1 (Kukulkán: texto "por 1 turno", fx dur:2).
// Multi-status (um "por N turnos" cobrindo vários) e assimétrico (dur em fx sem número no texto, ou vice-
// versa) viram NÃO-CONFERÍVEL — nunca falha-alto, nunca mente.
//
// UM eixo fica DE FORA de propósito, porque NÃO é extraível de forma confiável (§270/§271, medido):
//   • `buff` (magnitude +/− de dano): mora em ≥5 tipos de efeito (bonusDano/reducao/vulnerabilidade/
//     dmgUp/dmgDown/dmgReduction) e o texto "+N de dano" não distingue buff-próprio de debuff-no-inimigo
//     de redução (ex.: Aquiles passiva = 12 de redução + 10 de vulnerabilidade num só texto). SEM guarda.
// Preferência do dono: guarda em N eixos com o resto DE FORA e declarado > guarda em todos com um mentindo.
function _walkFx(fx, fn) { for (const e of (fx || [])) { if (!e || typeof e !== 'object') continue; fn(e);
  for (const k of ['entao', 'senao', 'agenda', 'faz']) if (Array.isArray(e[k])) _walkFx(e[k], fn); } }
const sortN = a => a.slice().sort((x, y) => x - y);
// duração de status: prosa "por N turno(s)"; fx = `dur` finito (<90 = não-permanente) em apply.eff/dot/…
const dursProsa = ef => sortN([...String(ef).matchAll(/por (\d+)\s+turno/g)].map(m => +m[1]));
const dursFx = fx => { const o = []; _walkFx(fx, e => { if (typeof e.dur === 'number' && e.dur < 90) o.push(e.dur);
  if (e.t === 'apply' && e.eff && typeof e.eff.dur === 'number' && e.eff.dur < 90) o.push(e.eff.dur); }); return sortN(o); };
const temAgendar = fx => (fx || []).some(e => e && (e.t === 'agendar' || Array.isArray(e.agenda)));
// orbe: prosa "N orbe(s)"; fx = orbGain/roubaOrbe .n
const orbesProsa = ef => sortN([...String(ef).matchAll(/(\d+)\s+orbe/g)].map(m => +m[1]));
const orbesFx = fx => { const o = []; _walkFx(fx, e => { if ((e.t === 'orbGain' || e.t === 'roubaOrbe') && typeof e.n === 'number') o.push(e.n); }); return sortN(o); };
// escudo/Defesa: prosa "N de Defesa" | "escudo N"; fx = shield.v / vidaExtra.hp
const escudoProsa = ef => sortN([...String(ef).matchAll(/(\d+)\s+de\s+Defesa/g)].map(m => +m[1]).concat([...String(ef).matchAll(/escudo\s+(\d+)/gi)].map(m => +m[1])));
const escudoFx = fx => { const o = []; _walkFx(fx, e => { if (e.t === 'shield' && typeof e.v === 'number') o.push(e.v); if (e.t === 'vidaExtra' && typeof e.hp === 'number') o.push(e.hp); }); return sortN(o); };
// Combo (GERAÇÃO só): prosa "Gera N de Combo"; fx = contador nome:combo .v. Consumo ("+N por ponto de Combo") é
// porContadorLado — NÃO é geração; a regex exige "Gera" para não casar o consumo.
const comboProsa = ef => sortN([...String(ef).matchAll(/[Gg]era\s+(\d+)\s+de\s+Combo/g)].map(m => +m[1]));
const comboFx = fx => { const o = []; _walkFx(fx, e => { if (e.t === 'contador' && e.nome === 'combo' && typeof e.v === 'number') o.push(e.v); }); return sortN(o); };
const EIXOS = [['orbe', orbesProsa, orbesFx], ['escudo', escudoProsa, escudoFx], ['combo', comboProsa, comboFx]];

// §286 — confere os NÚMEROS de UMA linha (habilidade OU passiva): dano/cura/orbe/escudo/combo/duração.
// A `prosa` é o TEXTO QUE O JOGADOR LÊ (data/deuses.desc), o `fx` é o que o MOTOR executa. Estrito só com
// 1-de-cada; multi/condicional/dinâmico/assimétrico vira naoConf (reportado, nunca falha-alto — nenhum eixo
// mente). MESMA lógica para os dois → mude aqui e ação e passiva mudam juntas.
function conferirNumeros(reg, key, slot, prosa, fx, fxDinamico) {
  const dP = danosProsa(prosa).sort((a, b) => a - b), dM = danosFx(fx).sort((a, b) => a - b);
  if (dP.length === 0 && dM.length === 0) { /* nada */ }
  else if (fxDinamico) reg(key, slot, 'dano', 'naoConf', 'fx dinâmico (alterna/opcoes): valor mora no motor');
  else if (dM.length > 1 || (fx || []).some(e => e.golpes) || /golpes|por (Disco|Combo|Cauda|Podrid|Atadura|inimigo|aliado)/i.test(prosa))
    reg(key, slot, 'dano', 'naoConf', `multi/condicional: prosa=${JSON.stringify(dP)} motor=${JSON.stringify(dM)}`);
  else reg(key, slot, 'dano', mesmoArr(dP, dM) ? 'match' : 'diverge', `motor ${JSON.stringify(dM)} ≠ prosa ${JSON.stringify(dP)}`);
  const hP = curasProsa(prosa).sort((a, b) => a - b), hM = curasFx(fx).sort((a, b) => a - b);
  if (hP.length === 0 && hM.length === 0) { /* nada */ }
  else if (fxDinamico) reg(key, slot, 'cura', 'naoConf', 'fx dinâmico (alterna/opcoes): valor mora no motor');
  // §286: cura CONDICIONAL/multi (2+ valores) vira naoConf — como o DANO já faz (§92/§118). Ex.: shutendoji
  // "cura 6 (10 se abaixo de 60)" = 2 curas condicionais; a prosa diz os dois, mas o "10" não vem depois de
  // "cura", então curasProsa pega só [6] — array-igualdade estrita seria falso-positivo. Não é mentira: os dois
  // valores estão no desc E no fx. (o eixo cura só ganhou este bucketing agora; antes nenhuma AÇÃO o expunha.)
  else if (hM.length > 1 || hP.length > 1) reg(key, slot, 'cura', 'naoConf', `multi/condicional: prosa=${JSON.stringify(hP)} motor=${JSON.stringify(hM)}`);
  else reg(key, slot, 'cura', mesmoArr(hP, hM) ? 'match' : 'diverge', `motor ${JSON.stringify(hM)} ≠ prosa ${JSON.stringify(hP)}`);
  for (const [nome, pf, mf] of EIXOS) {
    const vP = pf(prosa), vM = mf(fx);
    if (vP.length === 0 && vM.length === 0) continue;
    if (fxDinamico) reg(key, slot, nome, 'naoConf', 'fx dinâmico');
    else if (vP.length === 1 && vM.length === 1) reg(key, slot, nome, vP[0] === vM[0] ? 'match' : 'diverge', `motor ${JSON.stringify(vM)} ≠ prosa ${JSON.stringify(vP)}`);
    else reg(key, slot, nome, 'naoConf', `multi/assimétrico: prosa=${JSON.stringify(vP)} motor=${JSON.stringify(vM)}`);
  }
  const durP = dursProsa(prosa), durM = dursFx(fx);
  if (durP.length || durM.length) {
    if (fxDinamico) reg(key, slot, 'duração', 'naoConf', 'fx dinâmico');
    else if (durP.length === 1 && durM.length === 1) {
      const ag = temAgendar(fx), bate = durM[0] === durP[0] || (ag && durM[0] === durP[0] + 1);
      reg(key, slot, 'duração', bate ? 'match' : 'diverge', `motor ${JSON.stringify(durM)} ≠ prosa ${JSON.stringify(durP)}${ag ? ' (agendado: aceita +1)' : ''}`);
    } else reg(key, slot, 'duração', 'naoConf', `multi-status/assimétrico: prosa=${JSON.stringify(durP)} motor=${JSON.stringify(durM)}`);
  }
}

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
    // §270: METADADOS — o motor lê faccao/elem/classe/funcao; era o buraco por onde o Exu (e afrodite/apolo/
    // kraken/hermes) passaram. Nome de campo difere entre os catálogos: elem↔elemento, classe↔tipo.
    // §282: `arquetipo` — legenda de tela (o motor NÃO lê), mas DUPLICADA nos dois catálogos → pode derivar.
    // Entra na cadeia como os outros metadados: muda um lado e a build QUEBRA. (Fica FORA do carimbo de
    // Provação — projecaoCombate o exclui via TELA_TOPO — então guardá-lo aqui não re-carimba nada.)
    // §286: o NOME do deus entra junto. Estava latente (0 derivam hoje) mas SEM guarda — mesmo buraco do
    // arquetipo/§282 e da passiva.nome/§285: duplicado nos dois catálogos, exibido, e nada obrigava a bater.
    // Barato fechar agora que a função já tem o formato. FORA do carimbo (nome ∈ TELA_TOPO → projecaoCombate o
    // strippa; hash lê data/deuses) → não re-carimba nenhuma Provação.
    for (const [campo, dv, kv] of [['nome', g.nome, p.nome], ['faccao', g.faccao, p.faccao], ['elem', g.elem, p.elemento], ['classe', g.classe, p.tipo], ['funcao', g.funcao, p.funcao], ['arquetipo', g.arquetipo, p.arquetipo]])
      reg(g.key, '·', campo, String(dv) === String(kv) ? 'match' : 'diverge', `motor "${dv}" ≠ prosa "${kv}"`);
    // §285: o NOME da PASSIVA — o jogador o lê no botão P (§266). DUPLICADO nos dois catálogos e SEM guarda até
    // aqui (por isso 7 derivaram sem ninguém ver — mesmo buraco do arquetipo/§282, mesma função). Entra na cadeia:
    // muda um lado e a build QUEBRA. FORA do carimbo (projecaoCombate strippa passiva.nome via TELA_PASS; e o hash
    // lê data/deuses, nunca o kits.json que se reconcilia) → guardá-lo aqui não re-carimba nenhuma Provação.
    if (g.passiva && p.passiva)
      reg(g.key, 'passiva', 'nome', String(g.passiva.nome || '') === String(p.passiva.nome || '') ? 'match' : 'diverge', `motor "${g.passiva.nome}" ≠ prosa "${p.passiva.nome}"`);
    for (const slot of SLOTS) {
      const ab = (g.ab || []).find(a => a.slot === slot), ps = p[slot];
      if (!ab || !ps) continue;
      reg(g.key, slot, 'nome', ab.nome === ps.nome ? 'match' : 'diverge', `"${ab.nome}" ≠ "${ps.nome}"`);
      reg(g.key, slot, 'recarga', (ab.cd || 0) === (ps.recarga || 0) ? 'match' : 'diverge', `motor ${ab.cd || 0} ≠ prosa ${ps.recarga || 0}`);
      reg(g.key, slot, 'custo', ord(parseCusto(ps.custo)) === ord(normCost(ab.cost)) ? 'match' : 'diverge',
        `motor ${JSON.stringify(normCost(ab.cost))} ≠ prosa ${JSON.stringify(parseCusto(ps.custo))}`);
      // §286: os NÚMEROS conferem contra o TEXTO QUE O JOGADOR LÊ — `ab.desc` (data/deuses, exibido nas 3 telas
      // desde §271/§284-ajuste2), NÃO o `ps.efeito` do kits.json (que ninguém vê). Assim o guarda protege a tela,
      // não um arquivo morto. (nome/custo/recarga acima seguem contra o kits.json — é a ESTRUTURA, guardada à parte.)
      conferirNumeros(reg, g.key, slot, ab.desc || '', ab.fx, !!(ab.alterna || ab.opcoes));
    }
    // §286: a PASSIVA — os NÚMEROS do texto exibido (desc) contra o fx (faz-aware). O jogador lê a passiva no
    // botão P (§266); antes NADA dela era conferido além do nome (§285). Mesma função das ações → mesma régua.
    if (g.passiva && g.passiva.fx)
      conferirNumeros(reg, g.key, 'passiva', g.passiva.desc || '', g.passiva.fx, !!(g.passiva.alterna || g.passiva.opcoes));
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

module.exports = { conferir, ...res, prosaByKey, deusesArray,
  danosProsa, danosFx, curasProsa, curasFx, EIXOS, dursProsa, dursFx, temAgendar, mesmoArr, sortN };
if (require.main === module) process.exit(res.divergencias.length ? 1 : 0);
