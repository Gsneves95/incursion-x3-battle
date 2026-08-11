// ===================================================================
// PASSIVA DECLARATIVA (F1.2, sessão 1) — gatilho `bonusDano` com condição FECHADA.
// A passiva deixa de ser prosa-hardcoded e ganha `fx` como a habilidade (DECISOES §36).
// Esta sessão abre UM gatilho só (bonusDano) e prova o vocabulário de condição num deus
// SINTÉTICO — porque os 12 já implementados têm passiva multi-parte e migração é por DEUS
// INTEIRO (§37): nenhum é migrável com um gatilho só sem deixar hardcode invisível.
// Exercita as 7 condições avaliáveis + escopo self/time + sem-quando + dono-morto, e prova
// que o valida_kit falha em voz alta em gatilho/condição/valor/reservada fora do conjunto.
// ===================================================================
const E = require('../src/engine.js');
const { validarDeus } = require('../tools/valida_kit.js');
let f = 0; const ok = (c, m) => { if (!c) { console.log('  FALHA: ' + m); f++; } };

// dono da passiva (Aurora) + dois atacantes (Aurora e Tempestade), sem passiva-fx próprio.
// O catálogo é congelado por conteúdo em novoEstado, então o fx é fixado ANTES de cada estado.
function setup(fx) {
  E.GODS.tpass = { nome: 'TPass', faccao: 'T', elem: 'Aurora', classe: 'Mágico', funcao: 'Atacante', passiva: { nome: 'p', desc: 'd', fx } };
  E.GODS.taur = { nome: 'TAur', faccao: 'T', elem: 'Aurora', classe: 'Mágico', funcao: 'Atacante', passiva: { nome: '-', desc: '-' } };
  E.GODS.ttem = { nome: 'TTem', faccao: 'T', elem: 'Tempestade', classe: 'Mágico', funcao: 'Atacante', passiva: { nome: '-', desc: '-' } };
  return E.novoEstado(['tpass', 'taur', 'ttem'], ['zeus', 'zeus', 'zeus'], 201);
}
const B = (st, a, alvo) => E.bonusDanoDeclarativo(st, a, alvo);

console.log('== PASSIVA DECLARATIVA: bonusDano condicional (as 7 condições avaliáveis) ==');

{ // alvoDefesa (forma do Ogum): escudo OU redução
  const st = setup([{ gatilho: 'bonusDano', v: 10, quando: { alvoDefesa: true } }]);
  const atk = st.lados[0].units[0], e = st.lados[1].units[0];
  ok(B(st, atk, e) === 0, 'alvoDefesa sem defesa: 0');
  e.shield = 20;
  ok(B(st, atk, e) === 10, 'alvoDefesa com escudo: +10');
  e.shield = 0; e.efeitos.push({ type: 'dmgReduction', v: 5, dur: 2 });
  ok(B(st, atk, e) === 10, 'alvoDefesa com redução: +10');
}
{ // alvoDebuff 'qualquer' (forma do Sobek)
  const st = setup([{ gatilho: 'bonusDano', v: 6, quando: { alvoDebuff: 'qualquer' } }]);
  const atk = st.lados[0].units[0], e = st.lados[1].units[0];
  ok(B(st, atk, e) === 0, 'alvoDebuff qualquer, limpo: 0');
  e.efeitos.push({ type: 'encharcado', dur: 2 });
  ok(B(st, atk, e) === 6, 'alvoDebuff qualquer (encharcado): +6');
}
{ // alvoDebuff nomeado: exige o debuff EXATO
  const st = setup([{ gatilho: 'bonusDano', v: 8, quando: { alvoDebuff: 'encharcado' } }]);
  const atk = st.lados[0].units[0], e = st.lados[1].units[0];
  e.efeitos.push({ type: 'dmgDown', v: 5, dur: 2 });
  ok(B(st, atk, e) === 0, 'alvoDebuff encharcado: outro debuff não conta');
  e.efeitos.push({ type: 'encharcado', dur: 2 });
  ok(B(st, atk, e) === 8, 'alvoDebuff encharcado presente: +8');
}
{ // alvoDebuff 'controle': só efeitos de CONTROLE
  const st = setup([{ gatilho: 'bonusDano', v: 5, quando: { alvoDebuff: 'controle' } }]);
  const atk = st.lados[0].units[0], e = st.lados[1].units[0];
  e.efeitos.push({ type: 'dmgDown', v: 5, dur: 2 });
  ok(B(st, atk, e) === 0, 'alvoDebuff controle: dmgDown não é controle');
  e.efeitos.push({ type: 'atordoado', dur: 1 });
  ok(B(st, atk, e) === 5, 'alvoDebuff controle (atordoado): +5');
}
{ // alvoBuff 'qualquer'
  const st = setup([{ gatilho: 'bonusDano', v: 8, quando: { alvoBuff: 'qualquer' } }]);
  const atk = st.lados[0].units[0], e = st.lados[1].units[0];
  ok(B(st, atk, e) === 0, 'alvoBuff sem buff: 0');
  e.efeitos.push({ type: 'dmgUp', v: 5, dur: 2 });
  ok(B(st, atk, e) === 8, 'alvoBuff com buff: +8');
}
{ // alvoElem
  const st = setup([{ gatilho: 'bonusDano', v: 8, quando: { alvoElem: 'Tempestade' } }]);
  const atk = st.lados[0].units[0], e = st.lados[1].units[0];   // zeus = Tempestade
  ok(B(st, atk, e) === 8, 'alvoElem Tempestade: +8');
  e.elem = 'Aurora';
  ok(B(st, atk, e) === 0, 'alvoElem: outro elemento não ganha');
}
{ // alvoHp cheio / abaixo
  let st = setup([{ gatilho: 'bonusDano', v: 6, quando: { alvoHp: { op: 'cheio' } } }]);
  let atk = st.lados[0].units[0], e = st.lados[1].units[0];
  ok(B(st, atk, e) === 6, 'alvoHp cheio (120/120): +6');
  e.hp = 100;
  ok(B(st, atk, e) === 0, 'alvoHp cheio: HP não cheio → 0');
  st = setup([{ gatilho: 'bonusDano', v: 8, quando: { alvoHp: { op: 'abaixo', v: 60 } } }]);
  atk = st.lados[0].units[0]; e = st.lados[1].units[0];
  ok(B(st, atk, e) === 0, 'alvoHp abaixo 60: HP 120 → 0');
  e.hp = 59;
  ok(B(st, atk, e) === 8, 'alvoHp abaixo 60: HP 59 → +8');
}

console.log('== ESCOPO self vs time, sem-quando, e dono morto ==');
{ // atacanteElem + escopo time (forma do Rá): qualquer aliado do elemento ganha
  const st = setup([{ gatilho: 'bonusDano', v: 5, escopo: 'time', quando: { atacanteElem: 'Aurora' } }]);
  const tpass = st.lados[0].units[0], taur = st.lados[0].units[1], ttem = st.lados[0].units[2], e = st.lados[1].units[0];
  ok(B(st, taur, e) === 5, 'escopo time: aliado Aurora (não-dono) atacante ganha +5');
  ok(B(st, ttem, e) === 0, 'escopo time: atacante Tempestade não ganha');
  ok(B(st, tpass, e) === 5, 'escopo time: o próprio dono Aurora também ganha');
}
{ // escopo self: SÓ o dono
  const st = setup([{ gatilho: 'bonusDano', v: 5, escopo: 'self', quando: { atacanteElem: 'Aurora' } }]);
  const tpass = st.lados[0].units[0], taur = st.lados[0].units[1], e = st.lados[1].units[0];
  ok(B(st, tpass, e) === 5, 'escopo self: o dono Aurora ganha');
  ok(B(st, taur, e) === 0, 'escopo self: outro aliado Aurora NÃO ganha (não é o dono)');
}
{ // fase Dia/Noite
  const st = setup([{ gatilho: 'bonusDano', v: 10, quando: { fase: 'Dia' } }]);
  const atk = st.lados[0].units[0], e = st.lados[1].units[0];
  ok(B(st, atk, e) === 0, 'fase Dia: sem fase → 0');
  E.definirFase(st, 'Dia', 3);
  ok(B(st, atk, e) === 10, 'fase Dia ativa: +10');
  E.definirFase(st, 'Noite', 3);
  ok(B(st, atk, e) === 0, 'fase Dia: Noite ativa → 0');
}
{ // sem quando = sempre; escopo self default
  const st = setup([{ gatilho: 'bonusDano', v: 3 }]);
  const tpass = st.lados[0].units[0], taur = st.lados[0].units[1], e = st.lados[1].units[0];
  ok(B(st, tpass, e) === 3, 'sem quando: sempre +3 quando o dono ataca');
  ok(B(st, taur, e) === 0, 'escopo self (default): outro aliado não ganha');
}
{ // dono morto → passiva de time some
  const st = setup([{ gatilho: 'bonusDano', v: 5, escopo: 'time', quando: { atacanteElem: 'Aurora' } }]);
  const tpass = st.lados[0].units[0], taur = st.lados[0].units[1], e = st.lados[1].units[0];
  ok(B(st, taur, e) === 5, 'dono vivo: aplica');
  tpass.vivo = false;
  ok(B(st, taur, e) === 0, 'dono morto: passiva de time some');
}

console.log('== ponta-a-ponta: o bônus FLUI para o dano real (bater) ==');
{
  const st = setup([{ gatilho: 'bonusDano', v: 10, quando: { alvoDefesa: true } }]);
  const atk = st.lados[0].units[0], e = st.lados[1].units[0];
  e.efeitos.push({ type: 'dmgReduction', v: 0, dur: 2 });   // satisfaz alvoDefesa; redução 0 não mexe na medida
  const h = e.hp;
  E.bater(st, atk, e, 10, 'afetado', 'habilidade');
  ok(h - e.hp === 20, `bater 10 + passiva 10 = 20 de HP, deu ${h - e.hp}`);
}

// CARACTERIZAÇÃO dos deuses migrados (F1.2 sessão 2, gatilho danoIrredutivel). É a REDE de
// equivalência: passa contra o hardcode HOJE e tem de continuar passando depois de virar dado
// (dado reproduz o hardcode). Ogum não tinha asserção da passiva (furo achado ao verificar) — esta
// é a cobertura que faltava, adicionada ANTES de migrar. Tyr já tem rede em motor.test.js #9.
console.log('== caracterização OGUM: +10 vs defesa, dano não-reduzível, mas absorvível por escudo ==');
{
  const st = E.novoEstado(['ogum', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 301);
  const ogum = st.lados[0].units[0];
  const limpo = st.lados[1].units[0], comReducao = st.lados[1].units[1], comEscudo = st.lados[1].units[2];
  let h = limpo.hp; E.bater(st, ogum, limpo, 15, 'afetado', 'basico');
  ok(h - limpo.hp === 15, `ogum vs alvo limpo: 15 (deu ${h - limpo.hp})`);
  comReducao.efeitos.push({ type: 'dmgReduction', v: 8, dur: 9 });
  h = comReducao.hp; E.bater(st, ogum, comReducao, 15, 'afetado', 'basico');
  ok(h - comReducao.hp === 25, `ogum vs redução: 15+10, redução IGNORADA = 25 (deu ${h - comReducao.hp})`);
  comEscudo.shield = 100; h = comEscudo.hp; const s = comEscudo.shield;
  E.bater(st, ogum, comEscudo, 15, 'afetado', 'basico');
  ok(comEscudo.hp === h && s - comEscudo.shield === 25, `ogum vs escudo: 25 absorvidos, HP intacto (escudo ${s}->${comEscudo.shield})`);
}

console.log('== valida_kit FALHA em voz alta: gatilho, condição, valor e reservada ==');
const base = () => ({
  key: 'tp', nome: 'TP', faccao: 'T', elem: 'Aurora', classe: 'Mágico', funcao: 'Atacante', inicial: false,
  passiva: { nome: 'p', desc: 'd', fx: [{ gatilho: 'bonusDano', v: 5, quando: { alvoDebuff: 'qualquer' } }] },
  ab: [
    { slot: 'basico', classe: 'Mágico', nome: 'b', cost: { Aurora: 1 }, cd: 0, alvo: 'inimigo', fx: [{ t: 'dmg', v: 10 }] },
    { slot: 'habilidade', classe: 'Mágico', nome: 'h', cost: { Aurora: 1 }, cd: 1, alvo: 'inimigo', fx: [{ t: 'dmg', v: 10 }] },
    { slot: 'milagre', classe: 'Mágico', nome: 'm', cost: { Aurora: 1, livre: 1 }, cd: 4, alvo: 'inimigo', fx: [{ t: 'dmg', v: 10 }] },
  ],
});
ok(validarDeus(base()).length === 0, 'a passiva declarativa base deve ser VÁLIDA: ' + JSON.stringify(validarDeus(base())));
const err = (mut, frag) => { const g = base(); mut(g); const e = validarDeus(g); ok(e.some(x => x.includes(frag)), `esperava erro contendo "${frag}", veio: ${JSON.stringify(e)}`); };
err(g => g.passiva.fx[0].gatilho = 'bonusCura', 'gatilho inválido');            // gatilho fora do conjunto
err(g => g.passiva.fx[0].quando = { foo: true }, 'condição desconhecida');       // chave de condição inventada
err(g => g.passiva.fx[0].quando = { alvoElem: 'Plasma' }, 'fora do sub-vocabulário'); // valor fora do sub-vocab
err(g => g.passiva.fx[0].quando = { alvoMarca: 'olho' }, 'reservada');           // condição pendente (marca)
err(g => g.passiva.fx[0].quando = { alvoCuradoAntes: true }, 'reservada');       // condição pendente (cura-anterior)
err(g => g.passiva.fx[0].v = 0, 'v mal formado');                               // v não-positivo
err(g => g.passiva.fx[0].escopo = 'ambos', 'escopo inválido');                  // escopo fora do conjunto
err(g => g.passiva.fx[0].zzz = 1, 'não pertence ao gatilho');                    // campo fora do gatilho bonusDano
// gatilho danoIrredutivel (sessão 2): campos POR gatilho e valores de `ignora`
err(g => g.passiva.fx.push({ gatilho: 'danoIrredutivel' }), 'exige o campo "ignora"');            // falta ignora (obrigatório)
err(g => g.passiva.fx.push({ gatilho: 'danoIrredutivel', ignora: ['plasma'] }), 'ignora com valor inválido'); // valor fora de IGNORAVEIS
err(g => g.passiva.fx.push({ gatilho: 'danoIrredutivel', ignora: ['reducao'], v: 5 }), 'não pertence ao gatilho'); // v não pertence a danoIrredutivel
err(g => g.passiva.fx.push({ gatilho: 'bonusDano', v: 5, ignora: ['reducao'] }), 'não pertence ao gatilho');       // ignora não pertence a bonusDano

delete E.GODS.tpass; delete E.GODS.taur; delete E.GODS.ttem;
console.log('');
console.log(f === 0 ? '>>> PASSIVA OK' : `>>> ${f} FALHA(S)`);
process.exit(f ? 1 : 0);
