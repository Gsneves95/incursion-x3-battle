// Bestiário PvE (F2.3) — as 12 criaturas: exercitadas no motor (a mecânica DISPARA, não só
// passa no schema, §106/§115), + a RÉGUA DE TROPA como teste que FALHA de verdade (§ owner:
// "tropa não-auditada foi o buraco que a régua veio fechar"), + a integração com montarProvacao
// (criatura como inimigo nasce com o HP dela; chefe = deus + maxHp inflado).
const E = require('../src/engine.js');
Object.assign(global, E);                 // novoEstado etc. como globais p/ ia.js (via provacao/solucionador não, mas mantém o padrão)
const { BESTIARIO } = require('../src/bestiario.js');
const PROV = require('../src/provacao.js');

let f = 0; const ok = (c, m) => { if (!c) { console.log('  FALHA: ' + m); f++; } };
const CAT = { ...E.GODS, ...BESTIARIO };
const efeito = (u, t) => u.efeitos.some(e => e.type === t);
const temDot = (u, n) => u.dots.some(d => d.nome === n);

// monta a criatura no lado 0 (unidade 0) com energia à vontade; alvos = deuses no lado 1
function montar(criatura, alvos = ['ogum', 'ogum', 'ogum']) {
  const st = E.novoEstado([criatura, 'zeus', 'zeus'], alvos, 1, 0, null, CAT);
  E.ELEMS.forEach(e => st.lados[0].orbs[e] = 9);
  return st;
}
const roda = (st, slot, alvos, escolhas) => { const u = st.lados[0].units[0]; return E.agir(st, u.uid, slot, alvos, escolhas); };

console.log('== as 12 existem e nascem com o HP do kit ==');
{
  const files = require('fs').readdirSync('data/bestiario').filter(x => x.endsWith('.json'));
  ok(files.length === 12, `12 criaturas (achei ${files.length})`);
  ok(Object.keys(BESTIARIO).length === 12, '12 no catálogo BESTIARIO');
  const hps = { servo_cinzas: 70, automato_bronze: 120, elemental_chama: 70, naiade: 85, silfo: 65, guardiao_bosque: 120, ghoul: 70, aparicao: 75, quimera: 130, golem_runico: 180, vidente_corrompido: 120, ceifador: 130 };
  for (const k in hps) { const st = montar(k); ok(st.lados[0].units[0].maxHp === hps[k], `${k} nasce com ${hps[k]} (nasceu ${st.lados[0].units[0].maxHp})`); }
  console.log('  12 criaturas · HP do kit (65..180) no nascimento');
}

console.log('== #1 Servo: atacante puro de 12, sem passiva (simplificado, decisão do dono) ==');
{
  const st = montar('servo_cinzas'); const t = st.lados[1].units[0]; const h = t.hp;
  roda(st, 'basico', [t.uid]);
  ok(t.hp === h - 12, `Servo básico 12 (${h}->${t.hp})`);
  ok(!BESTIARIO.servo_cinzas.passiva, 'Servo NÃO tem passiva (sem explosão ao cair)');
  ok(BESTIARIO.servo_cinzas.ab.length === 1, 'Servo só tem o básico');
}

console.log('== #2 Autômato: Provoca todos + 15 de escudo (self) ==');
{
  const st = montar('automato_bronze'); const c = st.lados[0].units[0];
  roda(st, 'habilidade', []);
  ok(st.lados[1].units.every(t => efeito(t, 'taunt')), 'todos os inimigos Provocados');
  ok(c.shield === 15, `Autômato ganhou 15 de escudo (${c.shield})`);
}

console.log('== #3 Elemental: dano + Queimadura no básico; 2 alvos na habilidade ==');
{
  const st = montar('elemental_chama'); const a = st.lados[1].units[0];
  const h = a.hp; roda(st, 'basico', [a.uid]);
  ok(a.hp === h - 10 && temDot(a, 'queimadura'), 'básico: 10 + Queimadura');
  const st2 = montar('elemental_chama'); const x = st2.lados[1].units[0], y = st2.lados[1].units[1];   // estado novo: unidade só age 1×/turno
  roda(st2, 'habilidade', [x.uid, y.uid]);
  ok(x.hp === 110 && y.hp === 110 && temDot(x, 'queimadura') && temDot(y, 'queimadura'), 'habilidade: 10 + Queimadura nos 2 alvos');
}

console.log('== #4 Náiade: cura 20 no aliado mais ferido (auto) ==');
{
  const st = montar('naiade'); st.lados[0].units[1].hp = 40;
  roda(st, 'habilidade', []);
  ok(st.lados[0].units[1].hp === 60, `curou o mais ferido p/ 60 (${st.lados[0].units[1].hp})`);
}

console.log('== #5 Silfo: remove 1 orbe do maior pool inimigo ==');
{
  const st = montar('silfo'); const li = st.lados[1]; E.ELEMS.forEach(e => li.orbs[e] = 0); li.orbs['Chama'] = 3;
  roda(st, 'habilidade', []);
  ok(li.orbs['Chama'] === 2, `removeu 1 orbe (Chama 3->${li.orbs['Chama']})`);
}

console.log('== #6 Guardião do Bosque: tranca a Habilidade de 1 alvo + 15 de escudo ==');
{
  const st = montar('guardiao_bosque'); const t = st.lados[1].units[0]; const c = st.lados[0].units[0];
  roda(st, 'habilidade', [t.uid]);
  ok(efeito(t, 'lockSkill'), 'alvo com Habilidade trancada');
  ok(c.shield === 15, `Guardião ganhou 15 de escudo (${c.shield})`);
}

console.log('== #7 Ghoul: 12 normal / 18 abaixo de 40 HP + lifesteal 6 (curaPorAlvo) ==');
{
  const st = montar('ghoul'); const c = st.lados[0].units[0]; c.hp = 50;
  const t = st.lados[1].units[0];   // 120 HP -> golpe normal
  roda(st, 'basico', [t.uid]);
  ok(t.hp === 108 && c.hp === 56, `12 no alvo cheio + cura 6 (alvo ${t.hp}, ghoul ${c.hp})`);
  const st2 = montar('ghoul'); const t2 = st2.lados[1].units[0]; t2.hp = 30;   // estado novo; abaixo de 40 -> 18
  roda(st2, 'basico', [t2.uid]);
  ok(t2.hp === 12, `18 no alvo abaixo de 40 (30->${t2.hp})`);
}

console.log('== #8 Aparição: Silencia (selado) 1 alvo ==');
{
  const st = montar('aparicao'); const t = st.lados[1].units[0];
  roda(st, 'habilidade', [t.uid]);
  ok(efeito(t, 'selado'), 'alvo Silenciado (selado)');
}

console.log('== #9 Quimera: 3x6 no básico; IMUNE a controle (total); 15 em área + Queimadura ==');
{
  const st = montar('quimera'); const t = st.lados[1].units[0]; const h = t.hp;
  roda(st, 'basico', [t.uid]);
  ok(t.hp === h - 18, `3 golpes de 6 = 18 concentrado (${h}->${t.hp})`);
  // imunidade TOTAL a controle: a Aparição (creature) tenta selar a Quimera e FALHA
  const st2 = E.novoEstado(['aparicao', 'zeus', 'zeus'], ['quimera', 'ogum', 'ogum'], 1, 0, null, CAT);
  E.ELEMS.forEach(e => st2.lados[0].orbs[e] = 9);
  const q = st2.lados[1].units[0];
  E.agir(st2, st2.lados[0].units[0].uid, 'habilidade', [q.uid]);
  ok(!efeito(q, 'selado'), 'Quimera imune a selado (controle de alvo único)');
  // e a habilidade em área bate nos 3 + Queimadura
  const st3 = montar('quimera'); roda(st3, 'habilidade', st3.lados[1].units.map(u => u.uid));
  ok(st3.lados[1].units.every(u => u.hp === 105 && temDot(u, 'queimadura')), '15 em todos + Queimadura');
}

console.log('== #10 Golem: redução 10 contra Mágico; escudo 25 + Provocar + reflete ==');
{
  // passiva reducao vs Mágico: Zeus (Mágico) bate 15 -> 5 no Golem (10 de redução)
  const st = E.novoEstado(['zeus', 'ogum', 'ogum'], ['golem_runico', 'ogum', 'ogum'], 1, 0, null, CAT);
  E.ELEMS.forEach(e => st.lados[0].orbs[e] = 9);
  const g = st.lados[1].units[0]; const h = g.hp;
  E.agir(st, st.lados[0].units[0].uid, 'basico', [g.uid]);   // Cetro do Trovão (Mágico, 15)
  ok(g.hp === h - 5, `Golem reduz Mágico em 10 (15->5; ${h}->${g.hp})`);
  const st2 = montar('golem_runico'); const c = st2.lados[0].units[0];
  roda(st2, 'habilidade', []);
  ok(c.shield === 25 && efeito(c, 'refleteDano') && st2.lados[1].units.every(t => efeito(t, 'taunt')), 'escudo 25 + reflete + Provoca todos');
}

console.log('== #11 Vidente: atordoa 1 + o time inimigo causa 8 menos (área) ==');
{
  const st = montar('vidente_corrompido'); const t = st.lados[1].units[0];
  roda(st, 'habilidade', [t.uid]);
  ok(efeito(t, 'atordoado'), 'alvo atordoado');
  ok(st.lados[1].units.every(u => efeito(u, 'dmgDown')), 'todos os inimigos com dmgDown');
}

console.log('== #12 Ceifador: 24 + executa abaixo de 20 + cura 10; passiva +4 ao time ==');
{
  const st = montar('ceifador'); const t = st.lados[1].units[0]; t.hp = 30; const c = st.lados[0].units[0]; c.hp = 100;
  roda(st, 'habilidade', [t.uid]);   // 24 leva 30->6 (<20) -> executa; cura 10
  ok(!t.vivo, 'alvo abaixo de 20 pós-golpe é executado');
  ok(c.hp === 110, `Ceifador curou 10 (100->${c.hp})`);
  // passiva bonusDano +4 ao time: um aliado (Zeus, básico 15) bate 19
  const t2 = st.lados[1].units[1]; const h = t2.hp;
  E.agir(st, st.lados[0].units[1].uid, 'basico', [t2.uid]);   // Zeus Cetro do Trovão 15 +4 = 19
  ok(t2.hp === h - 19, `aliado causa +4 pela passiva do Ceifador (${h}->${t2.hp}, esperado -19)`);
}

console.log('== RÉGUA DE TROPA (teste que RODA e FALHA): básico<=20, habilidade<=25 ==');
{
  const TETO_TROPA = { basico: 20, habilidade: 25 };   // milagre: tropa não tem. Cura/escudo: não auditados (espelha o auditor de deus)
  // maior dano que um fx pode causar num alvo: golpes × max(v, seCond, seEncharcado, seAdormecido) — mesma forma do auditor de deus
  const danoDeFx = fx => fx.t !== 'dmg' ? 0 : (fx.golpes || 1) * Math.max(fx.v || 0, (fx.seCond && fx.seCond.v) || 0, fx.seEncharcado || 0, fx.seAdormecido || 0);
  const auditar = cri => {
    const viol = [];
    for (const ab of (cri.ab || [])) {
      const teto = TETO_TROPA[ab.slot]; if (teto == null) continue;
      const dano = Math.max(0, ...(ab.fx || []).map(danoDeFx));
      if (dano > teto) viol.push(`${cri.key}.${ab.slot}(${ab.nome}): ${dano} > ${teto}`);
    }
    return viol;
  };
  // as 12 reais: ZERO violação
  const viol = Object.values(BESTIARIO).flatMap(auditar);
  ok(viol.length === 0, `as 12 dentro da régua (violações: ${viol.join(' | ') || 'nenhuma'})`);
  // maiores de fato: Ghoul 18 e Quimera 18 (básico), Ceifador 24 (habilidade)
  ok(auditar(BESTIARIO.ghoul).length === 0 && auditar(BESTIARIO.ceifador).length === 0, 'Ghoul 18 e Ceifador 24 passam');
  // a régua MORDE: uma criatura inventada com 25 no básico é PEGA (o buraco que a régua fecha)
  const bicho25 = { key: '_bicho25', nome: 'Bicho 25', elem: 'Umbra', classe: 'Físico', funcao: 'Atacante', hp: 70, ab: [{ slot: 'basico', classe: 'Físico', nome: 'Golpe Absurdo', cost: { Umbra: 1 }, cd: 0, alvo: 'inimigo', fx: [{ t: 'dmg', v: 25 }] }] };
  const pego = auditar(bicho25);
  ok(pego.length === 1 && /25 > 20/.test(pego[0]), `criatura de 25 no básico é REPROVADA (${pego[0] || 'NÃO PEGOU — buraco!'})`);
  console.log('  as 12 passam · básico 25 REPROVA · régua morde de verdade');
}

console.log('== integração: criatura como INIMIGO nasce com o HP dela; CHEFE = deus + maxHp inflado ==');
{
  // tropa como inimigo via montarProvacao (o catálogo merged deuses∪bestiário)
  const provTropa = { key: '_tropa', aliados: ['zeus', 'brigid', 'ogum'], inimigos: ['servo_cinzas', 'ghoul', 'naiade'], montar: {}, condicoes: [{ predicado: 'deadline', turnos: 40 }] };
  const st = PROV.montarProvacao(provTropa);
  ok(st.lados[1].units[0].maxHp === 70 && st.lados[1].units[2].maxHp === 85, 'inimigos-criatura nascem 70/85 (fora da faixa)');
  ok(st.lados[0].units[0].maxHp === 120, 'aliados-deus seguem 120');
  // chefe = deus do roster + maxHp inflado (maxHp antes do hp)
  const provChefe = { key: '_chefe', aliados: ['zeus', 'brigid', 'ogum'], inimigos: ['kraken', 'ogum', 'ogum'], montar: { unidades: [{ lado: 1, idx: 0, maxHp: 300, hp: 300 }] }, condicoes: [{ predicado: 'deadline', turnos: 40 }] };
  const st2 = PROV.montarProvacao(provChefe);
  ok(st2.lados[1].units[0].maxHp === 300 && st2.lados[1].units[0].hp === 300, `chefe (Kraken) nasce 300/300 (${st2.lados[1].units[0].hp}/${st2.lados[1].units[0].maxHp})`);
}

console.log('');
console.log(f === 0 ? '>>> BESTIÁRIO OK' : `>>> ${f} FALHA(S)`);
process.exit(f ? 1 : 0);
