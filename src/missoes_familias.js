'use strict';
// FASE 6 / §228-§229 — CLASSIFICADOR DE FAMÍLIA-ASSINATURA.
// Deriva, de cada kit em data/deuses/*.json, a MECÂNICA que o define — a "família" (15) — e a
// HABILIDADE NOMEADA que a encarna. NÃO por tema; pela varredura do JSON (fx.t, apply.eff.type,
// campos como executaAbaixoDe/roubaOrbe/intercepta/contador). Puro (sem estado): o gerador, o
// calibrador e o servidor leem daqui a MESMA verdade. Uma única fonte para "qual é o feito do deus".
//
// As 15 famílias (a lista do dono) + a métrica-de-feito de cada uma (o que se ACUMULA entre partidas
// PvP, lido do st.log autoritativo — §229). A ORDEM é PRIORIDADE: a família mais distintiva do kit
// vence (roubo de orbe é mais raro/assinatura que "dano"; "dano" é o piso, só quando nada mais marca).

const fs = require('fs');
const path = require('path');

// controle = estes efeitos de apply TIRAM O TURNO / TRANCAM a ação do inimigo (≠ debuff de número).
const EFF_CONTROLE = new Set(['atordoado', 'lockSkill', 'selado', 'medo', 'adormecido', 'taunt', 'agarrar', 'pacificado', 'torpor', 'silenceClass', 'submerso', 'passeForcado']);
// remove-buff = fx que ARRANCAM vantagem do inimigo (buff/escudo/def).
const T_REMOVE = new Set(['stripBuffs', 'stripOne', 'stripDef', 'destroyShield', 'realoca', 'suspendeBuffs']);
// controle "de milagre" (fx próprios, não via apply.eff)
const T_CONTROLE = new Set(['dominar', 'passeForcado', 'suspendeBuffs', 'aceleraLivro']);

// ordem de prioridade (índice menor = mais assinatura). O piso é 'dano'.
const FAMILIAS = [
  'roubo-de-orbe', 'execucao', 'anti-revive', 'revive', 'intercepta', 'campo',
  'remove-buff', 'reflexo', 'absorve', 'contador', 'controle', 'dot', 'cura', 'area', 'dano',
];

// a métrica de cada família: o que o servidor SOMA entre partidas (a "unidade do feito").
const METRICA = {
  'roubo-de-orbe': 'orbesRoubados',   // orbes levados p/ si
  'execucao': 'execucoes',            // inimigos executados (queda por golpe com executaAbaixoDe)
  'anti-revive': 'revivesNegados',    // revives inimigos bloqueados
  'revive': 'revives',                // aliados revividos
  'intercepta': 'interceptacoes',     // golpes interceptados/redirecionados
  'campo': 'turnosCampo',             // turnos com o campo ativo
  'remove-buff': 'buffsRemovidos',    // vantagens arrancadas
  'reflexo': 'danoRefletido',         // dano devolvido por reflexo
  'absorve': 'danoAbsorvido',         // dano engolido/guardado
  'contador': 'contadoresGanhos',     // marcas/contadores acumulados
  'controle': 'controlesAplicados',   // efeitos de controle aplicados
  'dot': 'danoDot',                   // dano por veneno/queimadura/etc.
  'cura': 'curaFeita',                // HP curado
  'area': 'danoArea',                 // dano de golpe em TODOS os inimigos
  'dano': 'danoDireto',               // dano direto (piso)
};

// -------- marcadores por família num conjunto de fx (varre fx e o que estiver aninhado) --------
function _flatFx(ab) {
  const out = [];
  const walk = (fx) => { if (!fx) return; out.push(fx); (fx.entao || []).forEach(walk); (fx.senao || []).forEach(walk); (fx.agenda || []).forEach(walk); };
  for (const a of ab) for (const fx of (a.fx || [])) walk(fx);
  return out;
}
function _effTypes(fxs) {
  const s = new Set();
  for (const fx of fxs) if (fx.eff && fx.eff.type) s.add(fx.eff.type);
  return s;
}

// pontua a presença de cada família no kit (0 = ausente). Usada p/ escolher a assinatura (o MAIOR
// score na maior prioridade) e p/ auditar (um kit pode marcar várias; a assinatura é UMA).
function pontuar(god) {
  const ab = god.ab || [];
  const fxs = _flatFx(ab);
  const effs = _effTypes(fxs);
  const pass = (god.passiva && god.passiva.fx) || [];
  const passGat = new Set(pass.map(f => f.gatilho));
  const t = (tp) => fxs.filter(f => f.t === tp).length;
  const sc = {};
  sc['roubo-de-orbe'] = fxs.filter(f => f.t === 'roubaOrbe').length + (passGat.has('negaOrbe') || passGat.has('protegeOrbe') ? 1 : 0);
  sc['execucao'] = fxs.filter(f => f.executaAbaixoDe != null).length + (passGat.has('porExecucao') || passGat.has('abateNaoRevive') ? 1 : 0);
  sc['anti-revive'] = (passGat.has('antiReviveContador') ? 1 : 0) + (passGat.has('antiReviveAura') ? 1 : 0) + (passGat.has('abateNaoRevive') ? 1 : 0) + (passGat.has('naoRevivivel') ? 1 : 0) + (effs.has('antiRevive') || effs.has('noHeal') && false ? 1 : 0) + (effs.has('antiRevive') ? 1 : 0);
  sc['revive'] = t('revive') + t('vidaExtra') + t('restauraMax');
  sc['intercepta'] = t('intercepta') + t('redirect') + (passGat.has('ignoraInalvejavel') ? 0 : 0);
  sc['campo'] = t('fase') + t('espalha') + (passGat.has('amplificaDot') ? 0 : 0);
  sc['remove-buff'] = fxs.filter(f => T_REMOVE.has(f.t)).length;
  sc['reflexo'] = t('contraAtaca') + fxs.filter(f => f.eff && f.eff.type === 'contraAtaca').length + fxs.filter(f => f.eff && f.eff.type === 'refleteDano').length + (passGat.has('refleteControle') || passGat.has('geraContadorPorGolpe') ? 1 : 0) + (['contraAtaca', 'refleteDano', 'retaliacao'].some(e => effs.has(e)) ? 1 : 0);
  sc['absorve'] = t('armazenaDano') + t('shield') + t('destroyShield');
  sc['contador'] = t('contador');
  sc['controle'] = fxs.filter(f => T_CONTROLE.has(f.t)).length + [...effs].filter(e => EFF_CONTROLE.has(e)).length;
  sc['dot'] = t('dot') + (passGat.has('amplificaDot') ? 1 : 0);
  sc['cura'] = t('heal') + t('restauraMax') + (passGat.has('bonusCura') || passGat.has('aoCurar') ? 1 : 0);
  sc['area'] = fxs.filter(f => (f.escopo === 'todosInimigos' || f.massa === true) && (f.t === 'dmg')).length;
  sc['dano'] = t('dmg');
  return sc;
}

// escolhe a HABILIDADE NOMEADA que encarna uma família no kit: a ab (slot != basico de preferência)
// cujo fx marca a família; senão a passiva. Devolve {nome, slot, fonte}.
function _habilidadeDa(god, familia) {
  const marca = (fx) => {
    switch (familia) {
      case 'roubo-de-orbe': return fx.t === 'roubaOrbe';
      case 'execucao': return fx.executaAbaixoDe != null;
      case 'revive': return fx.t === 'revive' || fx.t === 'vidaExtra' || fx.t === 'restauraMax';
      case 'intercepta': return fx.t === 'intercepta' || fx.t === 'redirect';
      case 'campo': return fx.t === 'fase' || fx.t === 'espalha';
      case 'remove-buff': return T_REMOVE.has(fx.t);
      case 'reflexo': return fx.t === 'contraAtaca' || (fx.eff && (fx.eff.type === 'contraAtaca' || fx.eff.type === 'refleteDano'));
      case 'absorve': return fx.t === 'armazenaDano' || fx.t === 'shield' || fx.t === 'destroyShield';
      case 'contador': return fx.t === 'contador';
      case 'controle': return T_CONTROLE.has(fx.t) || (fx.eff && EFF_CONTROLE.has(fx.eff.type));
      case 'dot': return fx.t === 'dot';
      case 'cura': return fx.t === 'heal' || fx.t === 'restauraMax';
      case 'area': return fx.t === 'dmg' && (fx.escopo === 'todosInimigos' || fx.massa === true);
      case 'dano': return fx.t === 'dmg';
      default: return false;
    }
  };
  const walkMarca = (fx) => marca(fx) || (fx.entao || []).some(walkMarca) || (fx.senao || []).some(walkMarca) || (fx.agenda || []).some(walkMarca);
  // preferir milagre > habilidade > básico (a assinatura costuma estar no milagre/habilidade)
  const ordem = ['milagre', 'habilidade', 'basico'];
  const abs = (god.ab || []).slice().sort((a, b) => ordem.indexOf(a.slot) - ordem.indexOf(b.slot));
  for (const a of abs) if ((a.fx || []).some(walkMarca)) return { nome: a.nome, slot: a.slot, fonte: 'ab' };
  // família passiva (anti-revive, reflexo por passiva): nomeia a passiva
  if (god.passiva && god.passiva.nome) return { nome: god.passiva.nome, slot: 'passiva', fonte: 'passiva' };
  // piso absoluto: o básico
  const b = (god.ab || []).find(a => a.slot === 'basico') || (god.ab || [])[0];
  return b ? { nome: b.nome, slot: b.slot, fonte: 'ab' } : { nome: '(sem)', slot: 'basico', fonte: 'nenhum' };
}

// a ASSINATURA de um deus: a família de MAIOR prioridade com score > 0, e a habilidade que a encarna.
function assinatura(god) {
  const sc = pontuar(god);
  let fam = 'dano';
  for (const f of FAMILIAS) if ((sc[f] || 0) > 0) { fam = f; break; }
  const hab = _habilidadeDa(god, fam);
  return { key: god.key, familia: fam, metrica: METRICA[fam], habilidade: hab.nome, slot: hab.slot, fonte: hab.fonte };
}

function _carregarDeuses(dir) {
  const d = dir || path.join(__dirname, '..', 'data', 'deuses');
  const out = {};
  for (const f of fs.readdirSync(d)) if (f.endsWith('.json')) { const g = JSON.parse(fs.readFileSync(path.join(d, f), 'utf8')); out[g.key] = g; }
  return out;
}

function classificarTodos(dir) {
  const gods = _carregarDeuses(dir);
  const out = {};
  for (const k of Object.keys(gods)) out[k] = assinatura(gods[k]);
  return out;
}

module.exports = { FAMILIAS, METRICA, pontuar, assinatura, classificarTodos, _carregarDeuses };

if (require.main === module) {
  const cls = classificarTodos();
  const porFam = {};
  for (const k of Object.keys(cls)) { const f = cls[k].familia; (porFam[f] = porFam[f] || []).push(k); }
  for (const f of FAMILIAS) if (porFam[f]) console.log(`${f} (${porFam[f].length}): ${porFam[f].join(' ')}`);
  console.log('total', Object.keys(cls).length);
}
