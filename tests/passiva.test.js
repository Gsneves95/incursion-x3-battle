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
{ // fase Dia/Noite — MIGROU para estado (F1.2.5 s3): fase é estado-de-campo, não do ataque
  const st = setup([{ gatilho: 'bonusDano', v: 10, estado: { fase: 'Dia' } }]);
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

// LOTE A da rede (F1.2): sobek, hera, nezha, ra. Cada cláusula trava MAGNITUDE exata e ESCOPO exato
// (os dois lados de toda condição) — o erro da Hera foi asseverar existência ("ganhou escudo"), não valor.
// Verde contra o HARDCODE atual; zero migração. Vira prova de equivalência quando estes deuses migrarem.
console.log('== caracterização LOTE A: magnitude E escopo exatos (contra o hardcode) ==');
{ // SOBEK — +6 de dano contra alvo com debuff; SÓ quando o Sobek ataca
  const st = E.novoEstado(['sobek', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 401);
  const sobek = st.lados[0].units[0], zeus = st.lados[0].units[1];
  const limpo = st.lados[1].units[0], comDebuff = st.lados[1].units[1];
  comDebuff.efeitos.push({ type: 'dmgDown', v: 5, dur: 2 });   // um debuff qualquer
  let h = limpo.hp; E.bater(st, sobek, limpo, 15, 'afetado', 'basico');
  ok(h - limpo.hp === 15, `sobek vs alvo limpo: 15 (deu ${h - limpo.hp})`);
  h = comDebuff.hp; E.bater(st, sobek, comDebuff, 15, 'afetado', 'basico');
  ok(h - comDebuff.hp === 21, `sobek vs alvo com debuff: 15+6=21 (deu ${h - comDebuff.hp})`);
  h = comDebuff.hp; E.bater(st, zeus, comDebuff, 15, 'afetado', 'basico');
  ok(h - comDebuff.hp === 15, `ESCOPO: zeus vs mesmo alvo com debuff = 15 (o +6 é só do sobek) (deu ${h - comDebuff.hp})`);
}
{ // SOBEK — recebe -10 de dano de BÁSICOS; não de Habilidade
  const st = E.novoEstado(['sobek', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 402);
  const sobek = st.lados[0].units[0], atacante = st.lados[1].units[0];
  let h = sobek.hp; E.bater(st, atacante, sobek, 15, 'afetado', 'basico');
  ok(h - sobek.hp === 5, `básico vs sobek: 15-10=5 (deu ${h - sobek.hp})`);
  h = sobek.hp; E.bater(st, atacante, sobek, 15, 'afetado', 'habilidade');
  ok(h - sobek.hp === 15, `ESCOPO: habilidade vs sobek NÃO reduz = 15 (deu ${h - sobek.hp})`);
}
console.log('== F1.2.5 s2: contra por classe / elemNao / alcance (golpe puro, sintético) ==');
{ // contra.classe — reduz só golpes da classe
  E.GODS.trc = { nome: 'TRC', faccao: 'T', elem: 'Aurora', classe: 'Mágico', funcao: 'Guardião', passiva: { nome: 'p', desc: 'd', fx: [{ gatilho: 'reducao', v: 10, contra: { classe: 'Mágico' } }] } };
  const st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['trc', 'zeus', 'zeus'], 950);
  const atk = st.lados[0].units[0], def = st.lados[1].units[0];
  let h = def.hp; E.bater(st, atk, def, 20, 'afetado', 'habilidade', { classe: 'Mágico' });
  ok(h - def.hp === 10, `contra.classe: golpe Mágico reduz 20-10=10 (deu ${h - def.hp})`);
  h = def.hp; E.bater(st, atk, def, 20, 'afetado', 'habilidade', { classe: 'Físico' });
  ok(h - def.hp === 20, `contra.classe: golpe Físico NÃO reduz = 20 (deu ${h - def.hp})`);
  delete E.GODS.trc;
}
{ // contra.elemNao — reduz TODO golpe EXCETO os do elemento negado (baldur)
  E.GODS.tre = { nome: 'TRE', faccao: 'T', elem: 'Aurora', classe: 'Mágico', funcao: 'Guardião', passiva: { nome: 'p', desc: 'd', fx: [{ gatilho: 'reducao', v: 15, contra: { elemNao: 'Verdejante' } }] } };
  const st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['tre', 'zeus', 'zeus'], 951);
  const atk = st.lados[0].units[0], def = st.lados[1].units[0];
  let h = def.hp; E.bater(st, atk, def, 20, 'afetado', 'habilidade', {});
  ok(h - def.hp === 5, `contra.elemNao: golpe Tempestade (≠Verdejante) reduz 20-15=5 (deu ${h - def.hp})`);
  atk.elem = 'Verdejante'; h = def.hp; E.bater(st, atk, def, 20, 'afetado', 'habilidade', {});
  ok(h - def.hp === 20, `contra.elemNao: golpe Verdejante NÃO reduz = 20 (deu ${h - def.hp})`);
  delete E.GODS.tre;
}
{ // contra.alcance — reduz só golpes de alvo único (afrodite)
  E.GODS.tra = { nome: 'TRA', faccao: 'T', elem: 'Aurora', classe: 'Mágico', funcao: 'Guardião', passiva: { nome: 'p', desc: 'd', fx: [{ gatilho: 'reducao', v: 8, contra: { alcance: 'unico' } }] } };
  const st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['tra', 'zeus', 'zeus'], 952);
  const atk = st.lados[0].units[0], def = st.lados[1].units[0];
  let h = def.hp; E.bater(st, atk, def, 20, 'afetado', 'habilidade', { unico: true });
  ok(h - def.hp === 12, `contra.alcance unico: reduz 20-8=12 (deu ${h - def.hp})`);
  h = def.hp; E.bater(st, atk, def, 20, 'afetado', 'habilidade', { unico: false });
  ok(h - def.hp === 20, `contra.alcance: golpe em ÁREA NÃO reduz = 20 (deu ${h - def.hp})`);
  delete E.GODS.tra;
}
console.log('== F1.2.5 s3: estado COMPÕE com o eixo (contra + estado, AND) + as condições de leitura ==');
{ // COMPOSIÇÃO — a garantia que justifica campo universal: reduz SÓ se golpe Mágico E turno par
  E.GODS.tcp = { nome: 'TCP', faccao: 'T', elem: 'Aurora', classe: 'Mágico', funcao: 'Guardião', passiva: { nome: 'p', desc: 'd', fx: [{ gatilho: 'reducao', v: 10, contra: { classe: 'Mágico' }, estado: { paridade: 'par' } }] } };
  const st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['tcp', 'zeus', 'zeus'], 960);
  const atk = st.lados[0].units[0], def = st.lados[1].units[0];
  const hit = (classe, turno) => { st.turno = turno; const h = def.hp; E.bater(st, atk, def, 20, 'afetado', 'habilidade', { classe }); return h - def.hp; };
  ok(hit('Mágico', 2) === 10, `COMPÕE: Mágico E par -> reduz 20-10=10 (deu ${hit('Mágico', 2)})`);
  ok(hit('Mágico', 3) === 20, `COMPÕE: Mágico mas ÍMPAR -> NÃO reduz = 20`);
  ok(hit('Físico', 2) === 20, `COMPÕE: par mas FÍSICO -> NÃO reduz = 20`);
  ok(hit('Físico', 3) === 20, `COMPÕE: Físico e ímpar -> NÃO reduz = 20`);
  delete E.GODS.tcp;
}
{ // aliadosVivos (Guan Yu): reduz só com >= n vivos no lado do dono
  E.GODS.tav = { nome: 'TAV', faccao: 'T', elem: 'Aurora', classe: 'Mágico', funcao: 'Guardião', passiva: { nome: 'p', desc: 'd', fx: [{ gatilho: 'reducao', v: 6, estado: { aliadosVivos: { op: 'min', n: 3 } } }] } };
  const st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['tav', 'zeus', 'zeus'], 961);
  const atk = st.lados[0].units[0], def = st.lados[1].units[0];
  let h = def.hp; E.bater(st, atk, def, 20, 'afetado', 'habilidade', {});
  ok(h - def.hp === 14, `aliadosVivos min 3: 3 vivos -> reduz 20-6=14 (deu ${h - def.hp})`);
  st.lados[1].units[1].vivo = false; h = def.hp; E.bater(st, atk, def, 20, 'afetado', 'habilidade', {});
  ok(h - def.hp === 20, `aliadosVivos min 3: 2 vivos -> NÃO reduz = 20 (deu ${h - def.hp})`);
  delete E.GODS.tav;
}
{ // hpProprio (Shuten): reduz só com HP do DONO abaixo de 50
  E.GODS.thp = { nome: 'THP', faccao: 'T', elem: 'Aurora', classe: 'Mágico', funcao: 'Guardião', passiva: { nome: 'p', desc: 'd', fx: [{ gatilho: 'reducao', v: 8, estado: { hpProprio: { op: 'abaixo', v: 50 } } }] } };
  const st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['thp', 'zeus', 'zeus'], 962);
  const atk = st.lados[0].units[0], def = st.lados[1].units[0];
  def.hp = 40; let h = def.hp; E.bater(st, atk, def, 10, 'afetado', 'habilidade', {});
  ok(h - def.hp === 2, `hpProprio abaixo 50: HP 40 -> reduz 10-8=2 (deu ${h - def.hp})`);
  def.hp = 120; h = def.hp; E.bater(st, atk, def, 10, 'afetado', 'habilidade', {});
  ok(h - def.hp === 10, `hpProprio abaixo 50: HP 120 -> NÃO reduz = 10 (deu ${h - def.hp})`);
  delete E.GODS.thp;
}
{ // contador (Kitsune): reduz só com contador do dono >= n
  E.GODS.tct = { nome: 'TCT', faccao: 'T', elem: 'Aurora', classe: 'Mágico', funcao: 'Guardião', passiva: { nome: 'p', desc: 'd', fx: [{ gatilho: 'reducao', v: 5, estado: { contador: { nome: 'discoSolar', op: 'min', n: 3 } } }] } };
  const st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['tct', 'zeus', 'zeus'], 963);
  const atk = st.lados[0].units[0], def = st.lados[1].units[0];
  def.contadores.discoSolar = 3; let h = def.hp; E.bater(st, atk, def, 20, 'afetado', 'habilidade', {});
  ok(h - def.hp === 15, `contador min 3: com 3 -> reduz 20-5=15 (deu ${h - def.hp})`);
  def.contadores.discoSolar = 1; h = def.hp; E.bater(st, atk, def, 20, 'afetado', 'habilidade', {});
  ok(h - def.hp === 20, `contador min 3: com 1 -> NÃO reduz = 20 (deu ${h - def.hp})`);
  delete E.GODS.tct;
}
console.log('== Passo 0: aoUsarHabilidade (reativo a uso de slot) + estado.aliadoPresente (sinergia=condição) ==');
{ // aoUsarHabilidade: quando um aliado usa Milagre, o dono reage (shiva: +1 orbe). Checa o EVENTO (evita conta de custo).
  E.GODS.tuh = { nome: 'TUH', faccao: 'T', elem: 'Umbra', classe: 'Mágico', funcao: 'Suporte', passiva: { nome: 'p', desc: 'd', fx: [{ gatilho: 'aoUsarHabilidade', slot: 'milagre', faz: [{ t: 'orbGain', n: 1, para: 'Umbra' }] }] },
    ab: [{ slot: 'basico', classe: 'Mágico', nome: 'b', cost: {}, cd: 0, alvo: 'inimigo', fx: [{ t: 'dmg', v: 10 }] },
         { slot: 'habilidade', classe: 'Mágico', nome: 'h', cost: {}, cd: 1, alvo: 'inimigo', fx: [{ t: 'dmg', v: 10 }] },
         { slot: 'milagre', classe: 'Mágico', nome: 'm', cost: {}, cd: 4, alvo: 'inimigo', fx: [{ t: 'dmg', v: 20 }] }] };
  const st = E.novoEstado(['tuh', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 970);
  const tuh = st.lados[0].units[0]; st.ativo = 0; tuh.agiu = false;
  const enemy = st.lados[1].units[0].uid;
  const orbEv = () => st.log.filter(e => e.tipo === 'orbe' && e.passiva === 'tuh').length;
  E.agir(st, tuh.uid, 'basico', [enemy]);
  ok(orbEv() === 0, `básico NÃO dispara aoUsarHabilidade (eventos: ${orbEv()})`);
  tuh.agiu = false; E.agir(st, tuh.uid, 'milagre', [enemy]);
  ok(orbEv() === 1, `MILAGRE dispara aoUsarHabilidade: 1 evento de orbe do tuh (eventos: ${orbEv()})`);
  delete E.GODS.tuh;
}
console.log('== F1.3 morte: execução (caminho PRÓPRIO; fura piso e vidaExtra; dispara aoCair) ==');
{ // executa se hp <= N; acima do limiar não
  const st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 990);
  const atk = st.lados[0].units[0], a = st.lados[1].units;
  a[0].hp = 50;
  E.aplicarFx(st, atk, [{ t: 'dmg', v: 40, executaAbaixoDe: 24 }], { alvo: 'inimigo', slot: 'milagre' }, [a[0]]);
  ok(!a[0].vivo, `executa: 50-40=10 <=24 -> eliminado (vivo ${a[0].vivo})`);
  a[1].hp = 100;
  E.aplicarFx(st, atk, [{ t: 'dmg', v: 40, executaAbaixoDe: 24 }], { alvo: 'inimigo', slot: 'milagre' }, [a[1]]);
  ok(a[1].vivo && a[1].hp === 60, `acima do limiar: 100-40=60 >24 -> NÃO executa (hp ${a[1].hp})`);
}
{ // execução FURA o piso
  const st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 991);
  const atk = st.lados[0].units[0], t = st.lados[1].units[0];
  t.hp = 50; t.efeitos.push({ type: 'pisoVida', dur: 2 });
  E.aplicarFx(st, atk, [{ t: 'dmg', v: 100, executaAbaixoDe: 24 }], { alvo: 'inimigo', slot: 'milagre' }, [t]);
  ok(!t.vivo, `execução FURA o piso: o dano clampa a 1, a execução elimina (vivo ${t.vivo})`);
}
{ // execução FURA o vidaExtra
  const st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 992);
  const atk = st.lados[0].units[0], t = st.lados[1].units[0];
  t.hp = 20; t.vidaExtra = { hp: 30 };
  E.aplicarFx(st, atk, [{ t: 'dmg', v: 10, executaAbaixoDe: 24 }], { alvo: 'inimigo', slot: 'milagre' }, [t]);
  ok(!t.vivo, `execução FURA o vidaExtra: elimina apesar do vidaExtra (vivo ${t.vivo})`);
}
{ // dispara aoCair -> Zeus ganha orbe por execução; queda tagueada
  const st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 993);
  const zeus = st.lados[0].units[0], t = st.lados[1].units[0];
  t.hp = 20; const o0 = st.lados[0].orbs.Tempestade;
  E.aplicarFx(st, zeus, [{ t: 'dmg', v: 10, executaAbaixoDe: 24 }], { alvo: 'inimigo', slot: 'milagre' }, [t]);
  ok(!t.vivo && t.hp === 0, `zeus executa: alvo eliminado E hp=0 (morto⟹hp=0, mesmo vindo de hp>0 — Fenrir expôs)`);
  ok(st.lados[0].orbs.Tempestade === o0 + 1, `Zeus GANHA orbe por execução (aoCair dispara): ${o0} -> ${st.lados[0].orbs.Tempestade}`);
  ok(st.log.some(e => e.tipo === 'queda' && e.alvo === t.key && e.execucao === true), `queda tagueada execucao:true`);
}
{ // imune a execução (Sun Wukong)
  E.GODS.timexe = { nome: 'TIE', faccao: 'T', elem: 'Aurora', classe: 'Mágico', funcao: 'Guardião', passiva: { nome: 'p', desc: 'd', fx: [{ gatilho: 'imunidade', a: ['execucao'] }] } };
  const st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['timexe', 'zeus', 'zeus'], 994);
  const atk = st.lados[0].units[0], t = st.lados[1].units[0];
  t.hp = 10;
  E.aplicarFx(st, atk, [{ t: 'dmg', v: 5, executaAbaixoDe: 24 }], { alvo: 'inimigo', slot: 'milagre' }, [t]);
  ok(t.vivo, `imune a execução: NÃO é eliminado (vivo ${t.vivo}, hp ${t.hp})`);
  delete E.GODS.timexe;
}
console.log('== F1.6 sobrevivência: passiva abertura ARMA vidaExtra (hook rodarFaz) — Hércules Coragem Mortal ==');
{ // a passiva abertura arma o vidaExtra pelo NOVO ramo do rodarFaz; o golpe letal é sobrevivido 1× com 1 HP; o 2º mata
  E.GODS.tvidae = { nome: 'TVE', faccao: 'T', elem: 'Aurora', classe: 'Físico', funcao: 'Guardião', passiva: { nome: 'p', desc: 'd', fx: [{ gatilho: 'abertura', faz: [{ t: 'vidaExtra', hp: 1, escopo: 'self' }] }] } };
  const st = E.novoEstado(['tvidae', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 996);
  const h = st.lados[0].units[0];
  if (!h.vidaExtra) { st.ativo = 0; st.lados[0].estreou = false; E.iniciarTurno(st); }   // garante que o lado do tvidae rodou sua abertura
  ok(h.vidaExtra && h.vidaExtra.hp === 1, `passiva abertura ARMA vidaExtra{hp:1} via rodarFaz: ${JSON.stringify(h.vidaExtra)}`);
  const atk = st.lados[1].units[0];
  h.hp = 20; E.bater(st, atk, h, 999, 'afetado', 'basico', { unico: true });
  ok(h.vivo && h.hp === 1, `sobrevive ao golpe letal com 1 HP (vidaExtra consumido): vivo=${h.vivo} hp=${h.hp}`);
  ok(!h.vidaExtra, `vidaExtra gasto — a rede é 1× por partida`);
  h.hp = 20; E.bater(st, atk, h, 999, 'afetado', 'basico', { unico: true });
  ok(!h.vivo && h.hp === 0, `2º golpe letal mata (rede já gasta): vivo=${h.vivo} hp=${h.hp}`);
  delete E.GODS.tvidae;
}
console.log('== F1.3 morte: pisoVida (não cai abaixo de 1 HP) — buff real, furável ==');
{ // clamp a 1 no golpe letal; sem piso morre; ignoraPiso (Shiva) fura
  const st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 980);
  const atk = st.lados[0].units[0], a = st.lados[1].units;
  a[0].hp = 30; a[0].efeitos.push({ type: 'pisoVida', dur: 2 });
  E.bater(st, atk, a[0], 100, 'afetado', 'basico');
  ok(a[0].vivo && a[0].hp === 1, `pisoVida: golpe letal deixa em 1, vivo (hp ${a[0].hp}, vivo ${a[0].vivo})`);
  a[1].hp = 30;
  E.bater(st, atk, a[1], 100, 'afetado', 'basico');
  ok(!a[1].vivo, `sem piso: golpe letal MATA (vivo ${a[1].vivo})`);
  a[2].hp = 30; a[2].efeitos.push({ type: 'pisoVida', dur: 2 });
  E.bater(st, atk, a[2], 100, 'afetado', 'basico', { ignoraPiso: true });
  ok(!a[2].vivo, `ignoraPiso (Shiva fura): MATA apesar do piso (vivo ${a[2].vivo})`);
}
{ // o DoT também respeita o piso
  const st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 981);
  const u = st.lados[1].units[0]; u.hp = 5; u.efeitos.push({ type: 'pisoVida', dur: 2 }); u.dots.push({ nome: 'queimadura', v: 20, dur: 2 });
  st.ativo = 1; E.iniciarTurno(st);
  ok(u.vivo && u.hp === 1, `DoT respeita o piso: fica em 1, vivo (hp ${u.hp})`);
}
{ // aplicável de verdade via apply (escopo time) — prova que é buff real
  const st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 982);
  const caster = st.lados[0].units[0];
  E.aplicarFx(st, caster, [{ t: 'apply', eff: { type: 'pisoVida', dur: 1 }, escopo: 'time' }], { alvo: 'time', slot: 'milagre' }, []);
  ok(!!E.ef(st.lados[0].units[1], 'pisoVida'), 'apply pisoVida escopo time: aliado ganha o piso');
}
{ // estado.aliadoPresente: sinergia = condição (bonusDano só com deus X no time)
  E.GODS.tsin = { nome: 'TSIN', faccao: 'T', elem: 'Aurora', classe: 'Mágico', funcao: 'Atacante', passiva: { nome: 'p', desc: 'd', fx: [{ gatilho: 'bonusDano', v: 8, estado: { aliadoPresente: 'ganesha' } }] } };
  let st = E.novoEstado(['tsin', 'ganesha', 'zeus'], ['zeus', 'zeus', 'zeus'], 971);
  let atk = st.lados[0].units[0], e = st.lados[1].units[0];
  ok(E.bonusDanoDeclarativo(st, atk, e) === 8, `com ganesha no time: +8 (deu ${E.bonusDanoDeclarativo(st, atk, e)})`);
  st = E.novoEstado(['tsin', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 972);
  atk = st.lados[0].units[0]; e = st.lados[1].units[0];
  ok(E.bonusDanoDeclarativo(st, atk, e) === 0, `SEM ganesha no time: 0 (deu ${E.bonusDanoDeclarativo(st, atk, e)})`);
  delete E.GODS.tsin;
}
{ // HERA — aliado curado ganha EXATAMENTE 10 de escudo; só o curado; só com Hera viva
  const st = E.novoEstado(['hera', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 403);
  const hera = st.lados[0].units[0], a1 = st.lados[0].units[1], a2 = st.lados[0].units[2];
  a1.hp = 100;
  E.aplicarFx(st, a1, [{ t: 'heal', v: 20, escopo: 'self' }], { alvo: 'self', slot: 'basico' }, []);
  ok(a1.shield === 10, `curado ganha escudo EXATAMENTE 10 (deu ${a1.shield})`);
  ok(a2.shield === 0 && hera.shield === 0, `ESCOPO: só o curado ganha (a2=${a2.shield}, hera=${hera.shield})`);
  hera.vivo = false; a2.hp = 100;
  E.aplicarFx(st, a2, [{ t: 'heal', v: 20, escopo: 'self' }], { alvo: 'self', slot: 'basico' }, []);
  ok(a2.shield === 0, `ESCOPO: com Hera morta, cura NÃO dá escudo (deu ${a2.shield})`);
}
{ // NEZHA — imune a Queimadura (bloqueia 100%); só a Nezha
  const st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['nezha', 'zeus', 'zeus'], 404);
  const caster = st.lados[0].units[0];
  const nezha = st.lados[1].units[0], outro = st.lados[1].units[1];
  E.aplicarFx(st, caster, [{ t: 'dot', nome: 'queimadura', v: 8, dur: 2, escopo: 'todosInimigos' }], { alvo: 'todosInimigos', slot: 'habilidade' }, []);
  ok(nezha.dots.length === 0, `nezha IMUNE: 0 queimadura (tem ${nezha.dots.length})`);
  const q = outro.dots.find(d => d.nome === 'queimadura');
  ok(q && q.v === 8, `ESCOPO: o outro inimigo RECEBE queimadura v8 (${q && q.v})`);
}
{ // RÁ — aliados AURORA +5 de dano; não outros elementos; só com Rá vivo
  const st = E.novoEstado(['ra', 'tyr', 'zeus'], ['cuca', 'cuca', 'cuca'], 405);
  const ra = st.lados[0].units[0], tyrAurora = st.lados[0].units[1], zeusTemp = st.lados[0].units[2];
  const alvo = st.lados[1].units[0];
  let h = alvo.hp; E.bater(st, tyrAurora, alvo, 15, 'afetado', 'basico');
  ok(h - alvo.hp === 20, `aliado Aurora (tyr): 15+5=20 (deu ${h - alvo.hp})`);
  h = alvo.hp; E.bater(st, zeusTemp, alvo, 15, 'afetado', 'basico');
  ok(h - alvo.hp === 15, `ESCOPO: aliado Tempestade (zeus) NÃO ganha = 15 (deu ${h - alvo.hp})`);
  h = alvo.hp; E.bater(st, ra, alvo, 15, 'afetado', 'basico');
  ok(h - alvo.hp === 20, `o próprio Rá (Aurora) ganha: 20 (deu ${h - alvo.hp})`);
  ra.vivo = false; h = alvo.hp; E.bater(st, tyrAurora, alvo, 15, 'afetado', 'basico');
  ok(h - alvo.hp === 15, `ESCOPO: com Rá morto, aliado Aurora volta a 15 (deu ${h - alvo.hp})`);
}
{ // RÁ — +1 Disco Solar por turno, teto 6; só no turno do próprio Rá
  const st = E.novoEstado(['ra', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 406);
  const ra = st.lados[0].units[0];
  st.ativo = 0; const d0 = E.getContador(ra, 'discoSolar'); E.iniciarTurno(st);
  ok(E.getContador(ra, 'discoSolar') === d0 + 1, `+1 Disco no turno do Rá (${d0} -> ${E.getContador(ra, 'discoSolar')})`);
  ra.contadores.discoSolar = 6; st.ativo = 0; E.iniciarTurno(st);
  ok(E.getContador(ra, 'discoSolar') === 6, `teto 6: não passa de 6 (deu ${E.getContador(ra, 'discoSolar')})`);
  ra.contadores.discoSolar = 2; st.ativo = 1; E.iniciarTurno(st);
  ok(E.getContador(ra, 'discoSolar') === 2, `ESCOPO: no turno do inimigo o Rá NÃO ganha Disco (deu ${E.getContador(ra, 'discoSolar')})`);
}

console.log('== F1.2.5: faz-heal e faz-apply (self|time), alvo FIXO, apply só BUFF (sintético, migra 0 real) ==');
{ // faz-heal self: cura só o dono
  E.GODS.tfh = { nome: 'TFH', faccao: 'T', elem: 'Aurora', classe: 'Mágico', funcao: 'Suporte', passiva: { nome: 'p', desc: 'd', fx: [{ gatilho: 'porTurno', faz: [{ t: 'heal', v: 10 }] }] } };
  const st = E.novoEstado(['tfh', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 900);
  const d = st.lados[0].units; d[0].hp = 50; d[1].hp = 50;
  st.ativo = 0; E.iniciarTurno(st);
  ok(d[0].hp === 60 && d[1].hp === 50, `faz-heal self: só o dono cura 10 (dono ${d[0].hp}, aliado ${d[1].hp})`);
  delete E.GODS.tfh;
}
{ // faz-heal time: cura o lado todo vivo
  E.GODS.tft = { nome: 'TFT', faccao: 'T', elem: 'Aurora', classe: 'Mágico', funcao: 'Suporte', passiva: { nome: 'p', desc: 'd', fx: [{ gatilho: 'porTurno', faz: [{ t: 'heal', v: 8, escopo: 'time' }] }] } };
  const st = E.novoEstado(['tft', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 901);
  const d = st.lados[0].units; d[0].hp = 50; d[1].hp = 50; d[2].hp = 50; d[2].vivo = false;
  st.ativo = 0; E.iniciarTurno(st);
  ok(d[0].hp === 58 && d[1].hp === 58, `faz-heal time: vivos curam 8 (${d[0].hp}/${d[1].hp})`);
  ok(d[2].hp === 50, `faz-heal time: morto NÃO cura (${d[2].hp})`);
  delete E.GODS.tft;
}
{ // faz-apply buff self: aplica dmgReduction no dono (BUFF, alvo fixo)
  E.GODS.tfa = { nome: 'TFA', faccao: 'T', elem: 'Aurora', classe: 'Mágico', funcao: 'Guardião', passiva: { nome: 'p', desc: 'd', fx: [{ gatilho: 'porTurno', faz: [{ t: 'apply', eff: { type: 'dmgReduction', v: 5, dur: 1 } }] }] } };
  const st = E.novoEstado(['tfa', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 902);
  const d = st.lados[0].units;
  st.ativo = 0; E.iniciarTurno(st);
  ok(!!E.ef(d[0], 'dmgReduction') && !E.ef(d[1], 'dmgReduction'), `faz-apply buff: só o dono ganha dmgReduction`);
  delete E.GODS.tfa;
}

console.log('== caracterização LOTE B: brigid, cuca, ganesha, zeus (+ correção §39 da Nezha) ==');
{ // BRIGID — +5 de dano ao TIME (plano, qualquer elemento, sempre); some com Brigid morta
  const st = E.novoEstado(['brigid', 'zeus', 'cuca'], ['zeus', 'zeus', 'zeus'], 407);
  const brigid = st.lados[0].units[0], zeusAlly = st.lados[0].units[1], cucaAlly = st.lados[0].units[2];
  const alvo = st.lados[1].units[0];
  let h = alvo.hp; E.bater(st, zeusAlly, alvo, 15, 'afetado', 'basico');
  ok(h - alvo.hp === 20, `brigid: aliado (zeus) 15+5=20 (deu ${h - alvo.hp})`);
  h = alvo.hp; E.bater(st, cucaAlly, alvo, 15, 'afetado', 'basico');
  ok(h - alvo.hp === 20, `ESCOPO: time (qualquer elemento) ganha — cuca também = 20 (deu ${h - alvo.hp})`);
  brigid.vivo = false; h = alvo.hp; E.bater(st, zeusAlly, alvo, 15, 'afetado', 'basico');
  ok(h - alvo.hp === 15, `com Brigid morta: 15 (deu ${h - alvo.hp})`);
}
{ // BRIGID — cura +5 SE INIMIGO com Queimadura (§39: não aliado; não sem queimadura)
  const st = E.novoEstado(['brigid', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 408);
  const a1 = st.lados[0].units[1], aliado2 = st.lados[0].units[2], inimigo = st.lados[1].units[0];
  a1.hp = 90; E.aplicarFx(st, a1, [{ t: 'heal', v: 20, escopo: 'self' }], { alvo: 'self', slot: 'basico' }, []);
  ok(a1.hp === 110, `sem queimadura: cura 20 (90->110), deu ${a1.hp}`);
  a1.hp = 90; inimigo.dots.push({ nome: 'queimadura', v: 8, dur: 2 });
  E.aplicarFx(st, a1, [{ t: 'heal', v: 20, escopo: 'self' }], { alvo: 'self', slot: 'basico' }, []);
  ok(a1.hp === 115, `INIMIGO queima: cura 20+5=25 (90->115), deu ${a1.hp}`);
  inimigo.dots = []; aliado2.dots.push({ nome: 'queimadura', v: 8, dur: 2 });
  a1.hp = 90; E.aplicarFx(st, a1, [{ t: 'heal', v: 20, escopo: 'self' }], { alvo: 'self', slot: 'basico' }, []);
  ok(a1.hp === 110, `§39 ESCOPO: só ALIADO queima -> SEM bônus, cura 20 (90->110), deu ${a1.hp}`);
}
{ // CUCA — imune a Dormir (adormecido); só a Cuca
  const st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['cuca', 'zeus', 'zeus'], 409);
  const caster = st.lados[0].units[0], cuca = st.lados[1].units[0], outro = st.lados[1].units[1];
  E.aplicarFx(st, caster, [{ t: 'apply', eff: { type: 'adormecido', dur: 2 }, escopo: 'todosInimigos' }], { alvo: 'todosInimigos', slot: 'habilidade' }, []);
  ok(!E.ef(cuca, 'adormecido'), 'cuca IMUNE a Dormir');
  ok(!!E.ef(outro, 'adormecido'), 'ESCOPO: o outro inimigo ADORMECE');
}
{ // CUCA — Básico grátis quando turno%3===0; só o Básico, só a Cuca
  const st = E.novoEstado(['cuca', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 410);
  const cuca = st.lados[0].units[0], zeusAlly = st.lados[0].units[1];
  const acao = (u, slot) => E.acoesDe(st, u).find(a => a.slot === slot);
  st.turno = 3;
  ok(Object.keys(acao(cuca, 'basico').cost).length === 0, `turno 3: Básico da Cuca GRÁTIS (${JSON.stringify(acao(cuca, 'basico').cost)})`);
  ok(Object.keys(acao(cuca, 'habilidade').cost).length > 0, `ESCOPO: só o Básico é grátis, não a Habilidade`);
  ok(Object.keys(acao(zeusAlly, 'basico').cost).length > 0, `ESCOPO: só a Cuca (zeus paga o Básico)`);
  st.turno = 4;
  ok(Object.keys(acao(cuca, 'basico').cost).length > 0, `turno 4 (não múltiplo de 3): Básico da Cuca volta a custar`);
}
{ // GANESHA — turno 1: +2 orbes (na abertura, que o novoEstado já roda); não repete depois
  const st = E.novoEstado(['ganesha', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 411);   // side0 abre → iniciarTurno já rodou
  const ev1 = st.log.filter(e => e.tipo === 'orbe' && e.passiva === 'ganesha');
  ok(ev1.length === 1 && ev1[0].valor === 2, `turno 1: +2 orbes da Ganesha (${JSON.stringify(ev1)})`);
  const n0 = st.log.length; st.ativo = 0; E.iniciarTurno(st);
  const ev2 = st.log.slice(n0).filter(e => e.tipo === 'orbe' && e.passiva === 'ganesha');
  ok(ev2.length === 0, `ESCOPO: turno seguinte NÃO repete os +2 (só turno 1)`);
}
{ // ZEUS — ao derrotar inimigo: +1 orbe Tempestade; só o Zeus
  const st = E.novoEstado(['zeus', 'sobek', 'zeus'], ['cuca', 'cuca', 'cuca'], 412);
  const zeus = st.lados[0].units[0], sobekAlly = st.lados[0].units[1];
  const alvo1 = st.lados[1].units[0], alvo2 = st.lados[1].units[1];
  const o0 = st.lados[0].orbs['Tempestade'];
  alvo1.hp = 5; E.bater(st, zeus, alvo1, 15, 'afetado', 'basico');
  ok(!alvo1.vivo && st.lados[0].orbs['Tempestade'] === o0 + 1, `zeus mata -> +1 Tempestade (${o0} -> ${st.lados[0].orbs['Tempestade']})`);
  const o1 = st.lados[0].orbs['Tempestade'];
  alvo2.hp = 5; E.bater(st, sobekAlly, alvo2, 15, 'afetado', 'basico');
  ok(!alvo2.vivo && st.lados[0].orbs['Tempestade'] === o1, `ESCOPO: sobek mata -> SEM orbe do Zeus (${o1} -> ${st.lados[0].orbs['Tempestade']})`);
}
// aoCair quem:'qualquerInimigo' (F1.3 morte 4/4) — QUALQUER morte de inimigo, não matador-bound (hades/iansa/etc.)
console.log('== F1.3 morte: aoCair-qualquerInimigo (voz passiva) + coexistência com matador-bound ==');
E.GODS.tqi = { nome: 'TQI', faccao: 'T', elem: 'Umbra', classe: 'Mágico', funcao: 'Guardião', passiva: { nome: 'p', desc: 'd', fx: [{ gatilho: 'aoCair', quem: 'qualquerInimigo', faz: [{ t: 'orbGain', n: 1, para: 'Umbra' }] }] } };
{ // dispara MESMO quando quem mata é um ALIADO do reator (não o reator) — a diferença vs matador-bound
  const st = E.novoEstado(['tqi', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 420);
  const tqi = st.lados[0].units[0], aliado = st.lados[0].units[1], alvo = st.lados[1].units[0];
  const u0 = st.lados[0].orbs.Umbra;
  alvo.hp = 5; E.bater(st, aliado, alvo, 15, 'afetado', 'basico');   // o ALIADO mata, não o tqi
  ok(!alvo.vivo && st.lados[0].orbs.Umbra === u0 + 1, `aliado mata -> tqi ainda reage (${u0} -> ${st.lados[0].orbs.Umbra})`);
}
{ // dispara SEM matador (morte por DoT — atk=null)
  const st = E.novoEstado(['tqi', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 421);
  const alvo = st.lados[1].units[0];
  const u0 = st.lados[0].orbs.Umbra;
  alvo.hp = 3; alvo.dots.push({ nome: 'veneno', v: 8, dur: 2 });
  E.fimTurno(st); E.fimTurno(st);   // DoT no início do turno do lado 1 mata sem atacante
  ok(!alvo.vivo && st.lados[0].orbs.Umbra > u0, `morte por DoT (sem matador) -> tqi reage`);
}
{ // NÃO dispara quando cai um ALIADO do reator (o caído não é inimigo do tqi)
  const st = E.novoEstado(['tqi', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 422);
  const aliado = st.lados[0].units[1], inimigo = st.lados[1].units[0];
  const u0 = st.lados[0].orbs.Umbra;
  aliado.hp = 5; E.bater(st, inimigo, aliado, 15, 'afetado', 'basico');   // um ALIADO do tqi cai
  ok(!aliado.vivo && st.lados[0].orbs.Umbra === u0, `aliado do reator cai -> tqi NÃO reage (${u0} -> ${st.lados[0].orbs.Umbra})`);
}
{ // COEXISTÊNCIA (§49): um dono com 'inimigo' E 'qualquerInimigo' dispara OS DOIS quando ELE mata (efeitos distintos)
  E.GODS.tboth = { nome: 'TB', faccao: 'T', elem: 'Umbra', classe: 'Mágico', funcao: 'Guardião', passiva: { nome: 'p', desc: 'd', fx: [
    { gatilho: 'aoCair', quem: 'inimigo', faz: [{ t: 'orbGain', n: 1, para: 'Umbra' }] },
    { gatilho: 'aoCair', quem: 'qualquerInimigo', faz: [{ t: 'orbGain', n: 1, para: 'Chama' }] } ] } };
  const st = E.novoEstado(['tboth', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 423);
  const tb = st.lados[0].units[0], aliado = st.lados[0].units[1], a1 = st.lados[1].units[0], a2 = st.lados[1].units[1];
  const u0 = st.lados[0].orbs.Umbra, c0 = st.lados[0].orbs.Chama;
  a1.hp = 5; E.bater(st, tb, a1, 15, 'afetado', 'basico');   // TB mata: matador(Umbra) + qualquer(Chama) = DOIS disparos
  ok(st.lados[0].orbs.Umbra === u0 + 1 && st.lados[0].orbs.Chama === c0 + 1, `TB mata -> dispara os DOIS (Umbra ${u0}->${st.lados[0].orbs.Umbra}, Chama ${c0}->${st.lados[0].orbs.Chama})`);
  const u1 = st.lados[0].orbs.Umbra, c1 = st.lados[0].orbs.Chama;
  a2.hp = 5; E.bater(st, aliado, a2, 15, 'afetado', 'basico');   // ALIADO mata: só qualquer(Chama), matador NÃO
  ok(st.lados[0].orbs.Umbra === u1 && st.lados[0].orbs.Chama === c1 + 1, `aliado mata -> só qualquerInimigo (Umbra fixo ${u1}, Chama ${c1}->${st.lados[0].orbs.Chama})`);
}
{ // NEZHA (correção §39) — imune a veneno E queimadura, mas NÃO a um DoT fora da lista
  const st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['nezha', 'zeus', 'zeus'], 413);
  const caster = st.lados[0].units[0], nezha = st.lados[1].units[0];
  E.aplicarFx(st, caster, [{ t: 'dot', nome: 'veneno', v: 8, dur: 2, escopo: 'todosInimigos' }], { alvo: 'todosInimigos', slot: 'habilidade' }, []);
  ok(!nezha.dots.some(d => d.nome === 'veneno'), 'nezha imune a veneno (na lista)');
  E.aplicarFx(st, caster, [{ t: 'dot', nome: 'sangramento', v: 8, dur: 2, escopo: 'todosInimigos' }], { alvo: 'todosInimigos', slot: 'habilidade' }, []);
  ok(nezha.dots.some(d => d.nome === 'sangramento'), '§39: DoT FORA da lista (sangramento) NÃO é bloqueado — a folga latente morreu');
}

// IMUNIDADE (sessão 5): provada no SINTÉTICO (migra 0 real — cuca/nezha precisam de aCadaN/onDeath também).
// Um gatilho, sub-vocab CONTROLES ∪ DOTS ∪ 'controle' (coringa). Enforcement: aplicar (controle) / aplicarDot (DoT).
console.log('== IMUNIDADE declarativa: controle nomeado, DoT nomeado, coringa "controle" ==');
const imuneGod = (a) => ({ nome: 'TImune', faccao: 'T', elem: 'Aurora', classe: 'Mágico', funcao: 'Guardião', passiva: { nome: '-', desc: '-', fx: [{ gatilho: 'imunidade', a }] } });
const apToInimigos = (st, caster, fx) => E.aplicarFx(st, caster, fx, { alvo: 'todosInimigos', slot: 'habilidade' }, []);
{ // controle NOMEADO — só aquele controle
  E.GODS.timune = imuneGod(['adormecido']);
  const st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['timune', 'zeus', 'zeus'], 501);
  const caster = st.lados[0].units[0], imune = st.lados[1].units[0], outro = st.lados[1].units[1];
  apToInimigos(st, caster, [{ t: 'apply', eff: { type: 'adormecido', dur: 2 }, escopo: 'todosInimigos' }]);
  ok(!E.ef(imune, 'adormecido'), 'imune a adormecido (controle nomeado)');
  ok(!!E.ef(outro, 'adormecido'), 'ESCOPO: o outro inimigo NÃO é imune');
  apToInimigos(st, caster, [{ t: 'apply', eff: { type: 'taunt', dur: 2 }, escopo: 'todosInimigos' }]);
  ok(!!E.ef(imune, 'taunt'), 'a:[adormecido] NÃO cobre outro controle (taunt aplica)');
  delete E.GODS.timune;
}
{ // DoT nomeado
  E.GODS.timune = imuneGod(['queimadura']);
  const st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['timune', 'zeus', 'zeus'], 502);
  const caster = st.lados[0].units[0], imune = st.lados[1].units[0], outro = st.lados[1].units[1];
  apToInimigos(st, caster, [{ t: 'dot', nome: 'queimadura', v: 8, dur: 2, escopo: 'todosInimigos' }]);
  ok(imune.dots.length === 0, 'imune a queimadura (DoT nomeado)');
  ok(outro.dots.some(d => d.nome === 'queimadura'), 'ESCOPO: o outro inimigo RECEBE queimadura');
  delete E.GODS.timune;
}
{ // CORINGA 'controle' — cobre TODO controle, mas NÃO DoT
  E.GODS.timune = imuneGod(['controle']);
  const st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['timune', 'zeus', 'zeus'], 503);
  const caster = st.lados[0].units[0], imune = st.lados[1].units[0];
  apToInimigos(st, caster, [{ t: 'apply', eff: { type: 'atordoado', dur: 2 }, escopo: 'todosInimigos' }]);
  ok(!E.ef(imune, 'atordoado'), 'coringa: imune a atordoado');
  apToInimigos(st, caster, [{ t: 'apply', eff: { type: 'taunt', dur: 2 }, escopo: 'todosInimigos' }]);
  ok(!E.ef(imune, 'taunt'), 'coringa: imune a taunt (todo controle)');
  apToInimigos(st, caster, [{ t: 'dot', nome: 'queimadura', v: 8, dur: 2, escopo: 'todosInimigos' }]);
  ok(imune.dots.some(d => d.nome === 'queimadura'), 'coringa é SÓ controle — DoT (queimadura) NÃO é bloqueado');
  delete E.GODS.timune;
}

// SLOT-LOCK NOMEADO (F1.4) — controle que trava um CONJUNTO de slots; a ETIQUETA (o type) é o que a imunidade mira.
console.log('== slot-lock nomeado: Selado {Hab,Mil}, Agarrar {Hab}; imunidade por ETIQUETA (§53) ==');
{ // SELADO trava Hab+Mil, poupa Básico e Defesa ("só Básico")
  const st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['ogum', 'ogum', 'ogum'], 560);
  const u = st.lados[0].units[0]; st.lados[0].orbs['Tempestade'] = 9;
  u.efeitos.push({ type: 'selado', dur: 2 });
  const acs = E.acoesDe(st, u);
  ok(acs.find(a => a.slot === 'basico').disponivel, 'Selado poupa o Básico');
  ok(acs.find(a => a.slot === 'defesa').disponivel, 'Selado poupa a Defesa');
  ok(acs.find(a => a.slot === 'habilidade').motivo === 'travada', 'Selado trava a Habilidade');
  ok(acs.find(a => a.slot === 'milagre').motivo === 'travada', 'Selado trava o Milagre');
  console.log('  Selado: só Básico (Hab+Mil travados; Básico/Defesa livres)');
}
{ // AGARRAR trava só Hab; Milagre segue — conjunto DIFERENTE do Selado
  const st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['ogum', 'ogum', 'ogum'], 561);
  const u = st.lados[0].units[0]; st.lados[0].orbs['Tempestade'] = 9;
  u.efeitos.push({ type: 'agarrar', dur: 1 });
  const acs = E.acoesDe(st, u);
  ok(acs.find(a => a.slot === 'habilidade').motivo === 'travada', 'Agarrar trava a Habilidade');
  ok(acs.find(a => a.slot === 'milagre').disponivel, 'Agarrar NÃO trava o Milagre (≠ Selado)');
  console.log('  Agarrar: só Hab travada (Milagre livre)');
}
{ // IMUNIDADE POR ETIQUETA: imune a Agarrar (fenrir/kraken) NÃO protege de Selado
  E.GODS.timAg = imuneGod(['agarrar']);
  const st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['timAg', 'zeus', 'zeus'], 562);
  const caster = st.lados[0].units[0], imune = st.lados[1].units[0];
  apToInimigos(st, caster, [{ t: 'apply', eff: { type: 'agarrar', dur: 1 }, escopo: 'todosInimigos' }]);
  ok(!E.ef(imune, 'agarrar'), 'imune a Agarrar: o Agarrar NÃO cola');
  apToInimigos(st, caster, [{ t: 'apply', eff: { type: 'selado', dur: 1 }, escopo: 'todosInimigos' }]);
  ok(!!E.ef(imune, 'selado'), 'MAS imune a Agarrar NÃO protege de Selado — etiqueta distinta, Selado cola');
  delete E.GODS.timAg;
  console.log('  imune a Agarrar ⇏ imune a Selado (a etiqueta é o que a imunidade mira)');
}
{ // coringa 'controle' cobre AMBOS os slot-locks nomeados
  E.GODS.timC = imuneGod(['controle']);
  const st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['timC', 'zeus', 'zeus'], 563);
  const caster = st.lados[0].units[0], imune = st.lados[1].units[0];
  apToInimigos(st, caster, [{ t: 'apply', eff: { type: 'selado', dur: 1 }, escopo: 'todosInimigos' }]);
  apToInimigos(st, caster, [{ t: 'apply', eff: { type: 'agarrar', dur: 1 }, escopo: 'todosInimigos' }]);
  ok(!E.ef(imune, 'selado') && !E.ef(imune, 'agarrar'), 'coringa "controle" bloqueia Selado E Agarrar');
  delete E.GODS.timC;
  console.log('  imune a controle (coringa) cobre os dois slot-locks nomeados');
}

// aoSerAtingido (F1.4) — reage a SER ATINGIDO. faz no reator (BUFF, garantia intacta) / noAtacante no atacante (debuff, sujeito do evento).
console.log('== aoSerAtingido: debuff no ATACANTE (medusa) / buff no reator (xango) / cura self (boitata) ==');
{ // MEDUSA — atingida por Física, o ATACANTE recebe Veneno (efeito no sujeito ENTREGUE pelo evento, não escolhido)
  E.GODS.tmed = { nome: 'TMed', faccao: 'T', elem: 'Aurora', classe: 'Mágico', funcao: 'Guardião', passiva: { nome: 'p', desc: 'd', fx: [{ gatilho: 'aoSerAtingido', quem: 'self', contra: { classe: 'Físico' }, noAtacante: [{ t: 'dot', nome: 'veneno', v: 8, dur: 2 }] }] } };
  const st = E.novoEstado(['tmed', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 570);
  const med = st.lados[0].units[0], atk = st.lados[1].units[0];
  E.bater(st, atk, med, 10, 'afetado', 'habilidade', { classe: 'Físico', unico: true });
  ok(atk.dots.some(d => d.nome === 'veneno'), 'atingida por Física → o ATACANTE recebe Veneno (crédito Medusa)');
  const st2 = E.novoEstado(['tmed', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 571);
  const med2 = st2.lados[0].units[0], atk2 = st2.lados[1].units[0];
  E.bater(st2, atk2, med2, 10, 'afetado', 'habilidade', { classe: 'Mágico', unico: true });
  ok(!atk2.dots.some(d => d.nome === 'veneno'), 'atingida por Mágica → contra.classe não casa → sem Veneno');
  delete E.GODS.tmed;
  console.log('  Medusa: Física → Veneno no atacante · Mágica → nada (condição do golpe)');
}
{ // MEDUSA + atacante IMUNE a veneno: a imunidade do sujeito vale (o efeito passa por aplicarDot)
  E.GODS.tmed = { nome: 'TMed', faccao: 'T', elem: 'Aurora', classe: 'Mágico', funcao: 'Guardião', passiva: { nome: 'p', desc: 'd', fx: [{ gatilho: 'aoSerAtingido', quem: 'self', contra: { classe: 'Físico' }, noAtacante: [{ t: 'dot', nome: 'veneno', v: 8, dur: 2 }] }] } };
  E.GODS.timV = { nome: 'ImV', faccao: 'T', elem: 'Chama', classe: 'Físico', funcao: 'Guardião', passiva: { nome: '-', desc: '-', fx: [{ gatilho: 'imunidade', a: ['veneno'] }] } };
  const st = E.novoEstado(['tmed', 'zeus', 'zeus'], ['timV', 'zeus', 'zeus'], 572);
  const med = st.lados[0].units[0], atk = st.lados[1].units[0];
  E.bater(st, atk, med, 10, 'afetado', 'habilidade', { classe: 'Físico', unico: true });
  ok(!atk.dots.some(d => d.nome === 'veneno'), 'atacante imune a Veneno → não cola (imunidade do sujeito vale)');
  delete E.GODS.tmed; delete E.GODS.timV;
  console.log('  imunidade do atacante ao Veneno é respeitada');
}
{ // XANGO — quando um ALIADO é atingido, o reator ganha buff em SI (faz BUFF-only, garantia intacta)
  E.GODS.txan = { nome: 'TXan', faccao: 'T', elem: 'Aurora', classe: 'Mágico', funcao: 'Guardião', passiva: { nome: 'p', desc: 'd', fx: [{ gatilho: 'aoSerAtingido', quem: 'aliado', faz: [{ t: 'apply', eff: { type: 'dmgUp', v: 3, dur: 9 }, escopo: 'self' }] }] } };
  const st = E.novoEstado(['txan', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 573);
  const xan = st.lados[0].units[0], aliado = st.lados[0].units[1], atk = st.lados[1].units[0];
  E.bater(st, atk, aliado, 10, 'afetado', 'habilidade', { unico: true });   // um ALIADO do xango é atingido
  ok(E.ef(xan, 'dmgUp'), 'aliado atingido → xango (quem:aliado) ganha dmgUp em SI');
  const d0 = E.ef(xan, 'dmgUp').v;
  E.bater(st, atk, xan, 10, 'afetado', 'habilidade', { unico: true });      // o PRÓPRIO xango é atingido: quem:aliado NÃO dispara
  ok(E.ef(xan, 'dmgUp').v === d0, 'xango atingido em SI → quem:aliado NÃO dispara (só reage a aliado)');
  delete E.GODS.txan;
  console.log('  Xangô: aliado atingido → +dmgUp em si · self atingido → não (sujeito é aliado)');
}
{ // BOITATA — atingida por CHAMA, cura em SI (contra.elem positivo; faz heal self)
  E.GODS.tboi = { nome: 'TBoi', faccao: 'T', elem: 'Verdejante', classe: 'Mágico', funcao: 'Guardião', passiva: { nome: 'p', desc: 'd', fx: [{ gatilho: 'aoSerAtingido', quem: 'self', contra: { elem: 'Chama' }, faz: [{ t: 'heal', v: 10, escopo: 'self' }] }] } };
  const st = E.novoEstado(['tboi', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 574);
  const boi = st.lados[0].units[0], atk = st.lados[1].units[0];
  atk.elem = 'Chama'; boi.hp = 50;
  E.bater(st, atk, boi, 10, 'afetado', 'habilidade', { unico: true });   // atingida (perde 10) e cura 10 (contra.elem casa)
  ok(boi.hp === 50, `Chama: -10 do golpe +10 da cura = 50 (deu ${boi.hp})`);
  atk.elem = 'Tempestade'; const h = boi.hp;
  E.bater(st, atk, boi, 10, 'afetado', 'habilidade', { unico: true });   // não-Chama: só o dano
  ok(boi.hp === h - 10, 'não-Chama → contra.elem não casa → só o dano, sem cura');
  delete E.GODS.tboi;
  console.log('  Boitatá: Chama → cura self · outro elem → nada (contra.elem positivo)');
}

// aoAgirSobEfeito (F1.4) — quando o ATOR age sob um efeito, o DONO (origem = quem aplicou) reage. Torpor ≡ aoAgirSobEfeito.
console.log('== aoAgirSobEfeito: dono do gatilho = quem APLICOU (origem); dispara POR AÇÃO ==');
{ // SHUTEN — Torpor (efeito): quando o ator age, Shuten cura em SI (faz) e dana o ator (noAtor). Por AÇÃO.
  E.GODS.tshu = { nome: 'TShu', faccao: 'T', elem: 'Umbra', classe: 'Mágico', funcao: 'Guardião', passiva: { nome: 'p', desc: 'd', fx: [{ gatilho: 'aoAgirSobEfeito', efeito: 'torpor', faz: [{ t: 'heal', v: 10, escopo: 'self' }], noAtor: [{ t: 'dmg', v: 10 }] }] } };
  const st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['tshu', 'zeus', 'zeus'], 580);
  st.lados[0].orbs['Tempestade'] = 9;
  const ator = st.lados[0].units[0], shu = st.lados[1].units[0], alvo = st.lados[1].units[2];
  shu.hp = 50; ator.efeitos.push({ type: 'torpor', dur: 5, origem: shu.uid });   // Torpor aplicado por Shuten (origem)
  const h0 = ator.hp;
  E.agir(st, ator.uid, 'basico', [alvo.uid]);   // o ATOR age → Shuten (dono do Torpor) reage UMA vez
  ok(ator.hp === h0 - 10, `1 ação sob Torpor: ator -10 (${h0}→${ator.hp})`);
  ok(shu.hp === 60, `Shuten cura 10 (50→${shu.hp})`);
  // SEGUNDA ação no mesmo turno (precedente: Básico grátis da Cuca) → SEGUNDO disparo (por ação, não por turno)
  ator.agiu = false; const h1 = ator.hp, s1 = shu.hp;
  E.agir(st, ator.uid, 'basico', [alvo.uid]);
  ok(ator.hp === h1 - 10 && shu.hp === s1 + 10, `2ª ação → 2º disparo (por AÇÃO: ator ${h1}→${ator.hp}, shuten ${s1}→${shu.hp})`);
  delete E.GODS.tshu;
  console.log('  Shuten: cada ação sob Torpor → cura no dono + dano no ator (por ação, não por turno)');
}
{ // PIRANHA — Sangramento (DoT com origem): o ator sob Sangramento leva +4 ao agir
  E.GODS.tpir = { nome: 'TPir', faccao: 'T', elem: 'Maré', classe: 'Físico', funcao: 'Atacante', passiva: { nome: 'p', desc: 'd', fx: [{ gatilho: 'aoAgirSobEfeito', efeito: 'sangramento', noAtor: [{ t: 'dmg', v: 4 }] }] } };
  const st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['tpir', 'zeus', 'zeus'], 581);
  st.lados[0].orbs['Tempestade'] = 9;
  const ator = st.lados[0].units[0], pir = st.lados[1].units[0], alvo = st.lados[1].units[2];
  ator.dots.push({ nome: 'sangramento', v: 6, dur: 3, origem: pir.uid });   // DoT com origem (aplicarDot passa u.uid)
  const h0 = ator.hp;
  E.agir(st, ator.uid, 'basico', [alvo.uid]);
  ok(ator.hp === h0 - 4, `ator sob Sangramento leva +4 ao agir (${h0}→${ator.hp}) — marcador em DoT`);
  delete E.GODS.tpir;
  console.log('  Piranha: agir sob Sangramento → +4 no ator (origem em DoT)');
}
{ // ORIGEM É O DONO: só quem APLICOU reage, não qualquer um com a passiva
  E.GODS.tshu = { nome: 'TShu', faccao: 'T', elem: 'Umbra', classe: 'Mágico', funcao: 'Guardião', passiva: { nome: 'p', desc: 'd', fx: [{ gatilho: 'aoAgirSobEfeito', efeito: 'torpor', faz: [{ t: 'heal', v: 10, escopo: 'self' }] }] } };
  const st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['tshu', 'tshu', 'zeus'], 582);
  st.lados[0].orbs['Tempestade'] = 9;
  const ator = st.lados[0].units[0], aplicou = st.lados[1].units[0], outro = st.lados[1].units[1], alvo = st.lados[1].units[2];
  aplicou.hp = 50; outro.hp = 50;
  ator.efeitos.push({ type: 'torpor', dur: 5, origem: aplicou.uid });   // origem = aplicou, NÃO outro
  E.agir(st, ator.uid, 'basico', [alvo.uid]);
  ok(aplicou.hp === 60, 'quem APLICOU o Torpor reage (cura 10)');
  ok(outro.hp === 50, 'o outro TShu (mesma passiva, NÃO aplicou) NÃO reage — o gatilho é do aplicador');
  delete E.GODS.tshu;
  console.log('  origem: só o aplicador reage, não qualquer portador da passiva');
}
{ // DONO MORTO não reage
  E.GODS.tshu = { nome: 'TShu', faccao: 'T', elem: 'Umbra', classe: 'Mágico', funcao: 'Guardião', passiva: { nome: 'p', desc: 'd', fx: [{ gatilho: 'aoAgirSobEfeito', efeito: 'torpor', noAtor: [{ t: 'dmg', v: 10 }] }] } };
  const st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['tshu', 'zeus', 'zeus'], 583);
  st.lados[0].orbs['Tempestade'] = 9;
  const ator = st.lados[0].units[0], shu = st.lados[1].units[0], alvo = st.lados[1].units[2];
  shu.vivo = false; ator.efeitos.push({ type: 'torpor', dur: 5, origem: shu.uid });
  const h0 = ator.hp;
  E.agir(st, ator.uid, 'basico', [alvo.uid]);
  ok(ator.hp === h0, 'dono morto → sem reação (o gatilho é de uma unidade viva)');
  delete E.GODS.tshu;
  console.log('  dono caído → não reage');
}

// Pacificar (F1.4) — a unidade AGE mas causa 0 de dano (direto + DoT que aplicaria). Cura e DoT ATIVO seguem. Controle nomeado.
console.log('== Pacificar: age mas 0 de dano (direto + DoT aplicado); cura intacta; DoT ativo corre; imune por etiqueta ==');
{ // 1. dano direto → 0 ; 2. DoT que ele aplicaria no turno → não cola ; cura → intacta (não é "dois controles")
  const st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 590);
  const pac = st.lados[0].units[0], inimigo = st.lados[1].units[0];
  pac.efeitos.push({ type: 'pacificado', dur: 1 });
  const h0 = inimigo.hp;
  E.aplicarFx(st, pac, [{ t: 'dmg', v: 20 }], { alvo: 'inimigo', slot: 'habilidade' }, [inimigo]);
  ok(inimigo.hp === h0, `1. dano DIRETO do pacificado = 0 (${h0}→${inimigo.hp})`);
  E.aplicarFx(st, pac, [{ t: 'dot', nome: 'veneno', v: 8, dur: 2 }], { alvo: 'inimigo', slot: 'habilidade' }, [inimigo]);
  ok(!inimigo.dots.some(d => d.nome === 'veneno'), '2. DoT que o pacificado aplicaria no turno = não cola (é dano que ele causaria)');
  pac.hp = 50;
  E.aplicarFx(st, pac, [{ t: 'heal', v: 15, escopo: 'self' }], { alvo: 'nenhum', slot: 'milagre' }, []);
  ok(pac.hp === 65, `CURA do pacificado INTACTA (50→${pac.hp}) — zera dano, não cura (senão eram dois controles)`);
  console.log('  1) dano direto 0 · 2) DoT aplicado não cola · cura segue');
}
{ // 3. DoT JÁ ATIVO segue correndo — o tick não é a unidade agindo
  const st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 591);
  const pac = st.lados[0].units[0], vitima = st.lados[1].units[0];
  vitima.dots.push({ nome: 'queimadura', v: 8, dur: 3 });   // DoT ATIVO (aplicado antes do Pacificar)
  pac.efeitos.push({ type: 'pacificado', dur: 5 });
  const h0 = vitima.hp;
  E.fimTurno(st);   // encerra o turno do lado 0 → começa o do lado 1: o DoT ativo tica
  ok(vitima.hp === h0 - 8, `3. DoT ATIVO segue correndo apesar do Pacificar (${h0}→${vitima.hp})`);
  console.log('  3) DoT ativo continua (o tick não é ação do pacificado)');
}
{ // FORMA: pacificado AGE (não é atordoamento) — só o dano é 0
  const st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 592);
  const pac = st.lados[0].units[0]; st.lados[0].orbs['Tempestade'] = 9;
  pac.efeitos.push({ type: 'pacificado', dur: 1 });
  ok(E.podeAgir(pac), 'pacificado PODE agir (não trava a ação — só zera o dano)');
  ok(E.acoesDe(st, pac).find(a => a.slot === 'basico').disponivel, 'o Básico do pacificado segue disponível');
  console.log('  pacificado age normalmente (nenhum slot travado)');
}
{ // IMUNIDADE por etiqueta própria (controle nomeado) + coringa controle
  E.GODS.timP = imuneGod(['pacificado']);
  const st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['timP', 'zeus', 'zeus'], 593);
  const caster = st.lados[0].units[0], imune = st.lados[1].units[0], outro = st.lados[1].units[1];
  apToInimigos(st, caster, [{ t: 'apply', eff: { type: 'pacificado', dur: 2 }, escopo: 'todosInimigos' }]);
  ok(!E.ef(imune, 'pacificado'), 'imune a Pacificar (etiqueta própria) → não cola');
  ok(!!E.ef(outro, 'pacificado'), 'ESCOPO: o outro NÃO é imune → Pacificar cola');
  delete E.GODS.timP;
  console.log('  imune a Pacificar existe como etiqueta (controle nomeado)');
}

// Medo (F1.4) — COMPÓSITO nomeado: trava {Milagre} + reduz dano de saída, UM efeito. "Imune a Medo" cobre AS DUAS metades.
console.log('== Medo: compósito (lock Milagre + dmgDown), um efeito; imune cobre as duas metades; mesma duração ==');
{ // as DUAS metades num efeito só: trava Milagre E reduz o dano de saída
  const st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 594);
  const u = st.lados[0].units[0], alvo = st.lados[1].units[0]; st.lados[0].orbs['Tempestade'] = 9;
  u.efeitos.push({ type: 'medo', dur: 2, dmgDown: 8 });
  const acs = E.acoesDe(st, u);
  ok(acs.find(a => a.slot === 'milagre').motivo === 'travada', 'metade 1: Medo trava o Milagre');
  ok(acs.find(a => a.slot === 'habilidade').disponivel && acs.find(a => a.slot === 'basico').disponivel, 'Medo NÃO trava Hab/Básico (só Milagre)');
  const h0 = alvo.hp;
  E.bater(st, u, alvo, 20, 'afetado', 'basico', { unico: true });
  ok(h0 - alvo.hp === 12, `metade 2: dano de saída -8 (20→12), deu ${h0 - alvo.hp}`);
  console.log('  Medo: Milagre travado + dano de saída -8 (duas metades, um efeito)');
}
{ // IMUNE A MEDO cobre AS DUAS metades — um efeito, uma checagem de imuneA
  E.GODS.timM = imuneGod(['medo']);
  const st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['timM', 'zeus', 'zeus'], 595);
  const caster = st.lados[0].units[0], imune = st.lados[1].units[0], alvo = st.lados[0].units[1];
  apToInimigos(st, caster, [{ t: 'apply', eff: { type: 'medo', dur: 2, dmgDown: 8 }, escopo: 'todosInimigos' }]);
  ok(!E.ef(imune, 'medo'), 'imune a Medo: o efeito INTEIRO não cola (nem lock, nem dmgDown — é UM efeito)');
  const h0 = alvo.hp;
  E.bater(st, imune, alvo, 20, 'afetado', 'basico', { unico: true });
  ok(h0 - alvo.hp === 20, `imune: dano CHEIO 20 (a metade dmgDown foi barrada junto), deu ${h0 - alvo.hp}`);
  delete E.GODS.timM;
  console.log('  imune a Medo cobre as DUAS metades (composto, não dois efeitos com um nome)');
}
{ // MESMA duração: as duas metades expiram JUNTAS (um efeito, um dur)
  const st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 596);
  const u = st.lados[0].units[0];
  u.efeitos.push({ type: 'medo', dur: 1, dmgDown: 8 });
  E.fimTurno(st);   // regra 5: dur decrementa no fim do turno do portador
  ok(!E.ef(u, 'medo'), 'dur 1 → após um fim de turno, Medo INTEIRO expira (as duas metades juntas)');
  console.log('  as duas metades expiram juntas (uma duração)');
}

// Redirecionar (F1.4) — o golpe de alvo único vai para um SINK escolhido no lado do atacante. Loki: consumo-único; Curupira: janela.
console.log('== Redirecionar: golpe de alvo único → sink no lado do atacante; consumo-único (Loki) vs janela (Curupira); precede taunt ==');
{ // LOKI — consumo-único: um golpe redireciona, o efeito se gasta; o próximo cai normal
  const st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 597);
  const dono = st.lados[0].units[0], alvo = st.lados[0].units[1], atk = st.lados[1].units[0], sink = st.lados[1].units[1];
  dono.efeitos.push({ type: 'redirect', destino: sink.uid, contra: 'unico' });
  const hAlvo = alvo.hp, hSink = sink.hp;
  E.bater(st, atk, alvo, 20, 'afetado', 'basico', { unico: true });
  ok(alvo.hp === hAlvo && sink.hp === hSink - 20, `redirecionado ao SINK (aliado do atacante): alvo ${hAlvo}→${alvo.hp}, sink ${hSink}→${sink.hp}`);
  ok(!E.ef(dono, 'redirect'), 'consumo-único (Loki): redirect gasto após um uso (bookkeeping)');
  const hAlvo2 = alvo.hp;
  E.bater(st, atk, alvo, 20, 'afetado', 'basico', { unico: true });
  ok(alvo.hp === hAlvo2 - 20, 'o próximo golpe cai NORMAL (redirect já gasto)');
  console.log('  Loki: 1 golpe → sink · efeito consumido · 2º golpe normal');
}
{ // CURUPIRA — janela: dois golpes na duração, o efeito permanece
  const st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 598);
  const dono = st.lados[0].units[0], alvo = st.lados[0].units[1], atk = st.lados[1].units[0], sink = st.lados[1].units[1];
  dono.efeitos.push({ type: 'redirect', destino: sink.uid, dur: 2 });   // janela (sem contra:'unico')
  const hSink = sink.hp;
  E.bater(st, atk, alvo, 10, 'afetado', 'basico', { unico: true });
  E.bater(st, atk, alvo, 10, 'afetado', 'basico', { unico: true });
  ok(sink.hp === hSink - 20 && !!E.ef(dono, 'redirect'), `janela (Curupira): DOIS golpes redirecionados, efeito permanece (sink ${hSink}→${sink.hp})`);
  console.log('  Curupira: janela redireciona vários golpes (não consome)');
}
{ // PRECEDE TAUNT: o golpe forçado ao taunter é redirecionado ao sink (redirect tem a última palavra)
  const st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 599);
  const taunter = st.lados[0].units[0], atk = st.lados[1].units[0], sink = st.lados[1].units[1];
  taunter.efeitos.push({ type: 'redirect', destino: sink.uid, dur: 2 });
  const hT = taunter.hp, hS = sink.hp;
  E.bater(st, atk, taunter, 20, 'afetado', 'basico', { unico: true });   // atacante provocado mira o taunter → redirect intercepta
  ok(taunter.hp === hT && sink.hp === hS - 20, 'redirect PRECEDE taunt: o golpe mirado no taunter cai no sink');
  console.log('  redirect > taunt: golpe forçado ao taunter vai para o sink');
}
{ // ÁREA não é redirecionada (só alvo único)
  const st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 600);
  const dono = st.lados[0].units[0], alvo = st.lados[0].units[1], atk = st.lados[1].units[0], sink = st.lados[1].units[1];
  dono.efeitos.push({ type: 'redirect', destino: sink.uid, dur: 2 });
  const hAlvo = alvo.hp, hSink = sink.hp;
  E.bater(st, atk, alvo, 15, 'afetado', 'milagre', { unico: false });   // ÁREA
  ok(alvo.hp === hAlvo - 15 && sink.hp === hSink, 'golpe de ÁREA NÃO é redirecionado (só alvo único)');
  console.log('  área não redireciona (só alvo único, como intercepta)');
}
{ // AUTORIA F1.6: aplicarFx APLICA o redirect — o §62 só testou o CONSUMO via push sintético. Portador = o CASTER
  // (lado defensor); destino = o inimigo ESCOLHIDO (alvos[0], lado atacante). Fecha a dívida de autoria do §62 (Curupira).
  const st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 601);
  const dono = st.lados[0].units[0], alvo = st.lados[0].units[1], atk = st.lados[1].units[0], sink = st.lados[1].units[1];
  E.aplicarFx(st, dono, [{ t: 'redirect', dur: 2 }], { alvo: 'inimigo', slot: 'habilidade' }, [sink]);
  const rd = E.ef(dono, 'redirect');
  ok(rd && rd.destino === sink.uid, `AUTORIA: aplicarFx arma redirect no caster, destino = sink escolhido (${rd && rd.destino} == ${sink.uid})`);
  const hSink = sink.hp, hAlvo = alvo.hp;
  E.bater(st, atk, alvo, 12, 'afetado', 'basico', { unico: true });
  ok(sink.hp === hSink - 12 && alvo.hp === hAlvo, `golpe único inimigo cai no sink escolhido (sink ${hSink}→${sink.hp}, alvo intacto ${alvo.hp})`);
  console.log('  AUTORIA redirect (Curupira): fx aplica no caster, destino do inimigo escolhido');
}
console.log('== F1.6 dano condicional: seCond bumpa por estado do alvo (reusa condOK) — Xangô "30 em quem tiver buff" ==');
{ // sem a condição, dano base; com a condição (alvo tem buff), bump ao valor de seCond.v
  const st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 602);
  const atk = st.lados[0].units[0], a = st.lados[1].units;
  const fx = [{ t: 'dmg', v: 20, seCond: { quando: { alvoBuff: 'qualquer' }, v: 30 } }];
  const h0 = a[0].hp;
  E.aplicarFx(st, atk, fx, { alvo: 'inimigo', slot: 'milagre' }, [a[0]]);
  ok(a[0].hp === h0 - 20, `seCond SEM buff: dano base 20 (${h0}→${a[0].hp})`);
  a[1].efeitos.push({ type: 'dmgUp', v: 5, dur: 2 });   // um buff qualquer no alvo
  const h1 = a[1].hp;
  E.aplicarFx(st, atk, fx, { alvo: 'inimigo', slot: 'milagre' }, [a[1]]);
  ok(a[1].hp === h1 - 30, `seCond COM buff: bump para 30 (${h1}→${a[1].hp})`);
  console.log('  seCond: base sem condição, bump quando o alvo casa condOK');
}

// CARACTERIZAÇÃO do revive da Nezha (aoCair quem:'self') — trava ORDEM, não só magnitude: a Nezha reage à
// morte DO PRÓPRIO SUJEITO (vivo=false + efeitos limpos). Verde contra o hardcode atual, ANTES de migrar.
console.log('== caracterização NEZHA revive: ordem, vitória, 1x, timing (contra o hardcode) ==');
{ // 1. ORDEM: renasce DEPOIS da limpeza — 48 HP e SEM os efeitos que tinha ao cair. 4. TIMING: turno seguinte.
  const st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['nezha', 'zeus', 'zeus'], 601);
  const atk = st.lados[0].units[0], nezha = st.lados[1].units[0];
  nezha.efeitos.push({ type: 'dmgDown', v: 5, dur: 9 }); nezha.dots.push({ nome: 'queimadura', v: 8, dur: 9 });
  nezha.hp = 5; E.bater(st, atk, nezha, 15, 'afetado', 'basico');
  ok(!nezha.vivo && nezha.pendenteRenascer, 'caiu com revive pendente');
  ok(nezha.efeitos.length === 0 && nezha.dots.length === 0, 'ORDEM: efeitos/dots limpos ao cair');
  ok(!nezha.vivo, 'TIMING: NÃO renasce no mesmo turno (segue caída)');
  E.fimTurno(st);   // vira para o lado da Nezha -> iniciarTurno revive
  ok(nezha.vivo && nezha.hp === 48 && nezha.efeitos.length === 0, 'renasce no turno seguinte: 48 HP, sem efeitos');
}
{ // 3. UMA VEZ: cai, renasce, cai de novo -> NÃO renasce a segunda vez.
  const st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['nezha', 'zeus', 'zeus'], 602);
  const atk = st.lados[0].units[0], nezha = st.lados[1].units[0];
  nezha.hp = 5; E.bater(st, atk, nezha, 15, 'afetado', 'basico'); E.fimTurno(st);
  ok(nezha.vivo, '1ª queda renasceu');
  nezha.hp = 5; E.bater(st, atk, nezha, 15, 'afetado', 'basico');
  ok(!nezha.vivo && !nezha.pendenteRenascer, 'UMA VEZ: 2ª queda NÃO renasce');
}
{ // 2. VITÓRIA: caída-pendente NÃO perde (mesmo com os outros mortos); perde só quando o revive se esgota.
  const st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['nezha', 'zeus', 'zeus'], 603);
  const atk = st.lados[0].units[0], L1 = st.lados[1];
  for (const alvo of [L1.units[1], L1.units[2], L1.units[0]]) { alvo.hp = 5; E.bater(st, atk, alvo, 15, 'afetado', 'basico'); }
  ok(st.fim === null, 'VITÓRIA: time todo caído mas Nezha pendente -> NÃO perde ainda');
  E.fimTurno(st);
  ok(L1.units[0].vivo, 'Nezha renasce -> time sobrevive');
  L1.units[0].hp = 5; E.bater(st, atk, L1.units[0], 15, 'afetado', 'basico');   // 2ª morte, revive esgotado, todos mortos
  ok(st.fim && st.fim.lado === 0, 'revive ESGOTADO + todos mortos -> aí sim o outro lado vence');
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
err(g => g.passiva.fx[0].gatilho = 'gatilhoInexistente', 'gatilho inválido');   // gatilho fora do conjunto
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
// gatilho reducao (sessão 3): eixo defensivo `contra` (separado do `quando` ofensivo)
err(g => g.passiva.fx.push({ gatilho: 'reducao' }), 'exige o campo "v"');                                          // falta v
err(g => g.passiva.fx.push({ gatilho: 'reducao', v: 10, contra: { classe: 'Plasma' } }), 'fora do sub-vocabulário'); // classe aberta (F1.2.5 s2), valor inválido
err(g => g.passiva.fx.push({ gatilho: 'reducao', v: 10, contra: { elemNao: 'Plasma' } }), 'fora do sub-vocabulário'); // elemNao aberto, valor fora dos ELEMS
err(g => g.passiva.fx.push({ gatilho: 'reducao', v: 10, contra: { alcance: 'medio' } }), 'fora do sub-vocabulário'); // alcance só unico|area
err(g => g.passiva.fx.push({ gatilho: 'reducao', v: 10, contra: { paridade: 'par' } }), 'desconhecida');            // ESTADO (paridade) NÃO entra no contra — 4º eixo (s3)
err(g => g.passiva.fx.push({ gatilho: 'reducao', v: 10, contra: { slot: 'ultimate' } }), 'fora do sub-vocabulário'); // slot inválido
{ const g = base(); g.passiva.fx.push({ gatilho: 'reducao', v: 10, contra: { classe: 'Mágico' } }); ok(validarDeus(g).length === 0, 'contra.classe VÁLIDO: ' + JSON.stringify(validarDeus(g))); }
{ const g = base(); g.passiva.fx.push({ gatilho: 'reducao', v: 15, contra: { elemNao: 'Verdejante' } }); ok(validarDeus(g).length === 0, 'contra.elemNao VÁLIDO: ' + JSON.stringify(validarDeus(g))); }
{ const g = base(); g.passiva.fx.push({ gatilho: 'reducao', v: 8, contra: { alcance: 'unico' } }); ok(validarDeus(g).length === 0, 'contra.alcance VÁLIDO: ' + JSON.stringify(validarDeus(g))); }
// F1.2.5 s3: estado é CAMPO UNIVERSAL (composa com o eixo); fase MIGROU do quando; primeiroPorTurno reservado
err(g => g.passiva.fx.push({ gatilho: 'bonusDano', v: 5, quando: { fase: 'Dia' } }), 'MIGROU para o campo estado'); // fase saiu do quando
err(g => g.passiva.fx.push({ gatilho: 'reducao', v: 5, estado: { primeiroPorTurno: true } }), 'reservada');           // exige rastreio (sessão futura)
err(g => g.passiva.fx.push({ gatilho: 'reducao', v: 5, estado: { foo: true } }), 'condição de estado desconhecida');   // chave inventada
err(g => g.passiva.fx.push({ gatilho: 'reducao', v: 5, estado: { paridade: 'terça' } }), 'fora do sub-vocabulário');   // valor inválido
err(g => g.passiva.fx.push({ gatilho: 'reducao', v: 5, estado: { aliadosVivos: { op: 'quase', n: 3 } } }), 'op:min|max|exato'); // op inválido
{ const g = base(); g.passiva.fx.push({ gatilho: 'reducao', v: 5, contra: { classe: 'Mágico' }, estado: { paridade: 'par' } }); ok(validarDeus(g).length === 0, 'contra + estado COMPÕEM (universal): ' + JSON.stringify(validarDeus(g))); }
{ const g = base(); g.passiva.fx.push({ gatilho: 'bonusDano', v: 5, estado: { fase: 'Dia' } }); ok(validarDeus(g).length === 0, 'bonusDano + estado.fase VÁLIDO: ' + JSON.stringify(validarDeus(g))); }
{ const g = base(); g.passiva.fx.push({ gatilho: 'reducao', v: 5, estado: { hpProprio: { op: 'abaixo', v: 50 } } }); ok(validarDeus(g).length === 0, 'estado.hpProprio VÁLIDO: ' + JSON.stringify(validarDeus(g))); }
// Passo 0: aoUsarHabilidade (slot obrig) + estado.aliadoPresente
err(g => g.passiva.fx.push({ gatilho: 'aoUsarHabilidade', faz: [{ t: 'orbGain', n: 1 }] }), 'exige o campo "slot"'); // falta slot
err(g => g.passiva.fx.push({ gatilho: 'aoUsarHabilidade', slot: 'ultimate', faz: [{ t: 'orbGain', n: 1 }] }), 'slot inválido'); // slot fora
err(g => g.passiva.fx.push({ gatilho: 'reducao', v: 5, estado: { aliadoPresente: 123 } }), 'a KEY de um deus'); // key não-string
{ const g = base(); g.passiva.fx.push({ gatilho: 'aoUsarHabilidade', slot: 'milagre', faz: [{ t: 'orbGain', n: 1 }] }); ok(validarDeus(g).length === 0, 'aoUsarHabilidade VÁLIDO: ' + JSON.stringify(validarDeus(g))); }
{ const g = base(); g.passiva.fx.push({ gatilho: 'bonusDano', v: 8, estado: { aliadoPresente: 'ganesha' } }); ok(validarDeus(g).length === 0, 'estado.aliadoPresente VÁLIDO: ' + JSON.stringify(validarDeus(g))); }
err(g => g.passiva.fx.push({ gatilho: 'reducao', v: 10, quando: { alvoDebuff: 'qualquer' } }), 'não pertence ao gatilho'); // quando (ofensivo) não vai em reducao
err(g => g.passiva.fx.push({ gatilho: 'bonusDano', v: 5, contra: { slot: 'basico' } }), 'não pertence ao gatilho'); // contra (defensivo) não vai em bonusDano
// gatilhos de turno (sessão 4): faz reusa fx, mas só os turno-seguros e sem alvo escolhido
err(g => g.passiva.fx.push({ gatilho: 'porTurno' }), 'exige o campo "faz"');                                        // falta faz
err(g => g.passiva.fx.push({ gatilho: 'porTurno', faz: [{ t: 'dmg', v: 10 }] }), 'não pode disparar por turno');    // dmg fora de fxTurno
err(g => g.passiva.fx.push({ gatilho: 'abertura', faz: [{ t: 'contador', nome: 'discoSolar', v: 1, alvo: 'inimigo' }] }), 'faz não escolhe alvo'); // alvo não pode ser inimigo
// gatilho imunidade (sessão 5): `a` = array não-vazio de tags do sub-vocabulário
err(g => g.passiva.fx.push({ gatilho: 'imunidade' }), 'exige o campo "a"');                       // falta a
err(g => g.passiva.fx.push({ gatilho: 'imunidade', a: [] }), 'array não-vazio');                   // a vazio
{ const g = base(); g.passiva.fx.push({ gatilho: 'imunidade', a: ['medo'] }); ok(validarDeus(g).length === 0, `imune a Medo VÁLIDO (§60: medo virou controle nomeado): ${JSON.stringify(validarDeus(g))}`); }
{ const g = base(); g.passiva.fx[0] = { gatilho: 'bonusDano', v: 10, quando: { alvoDebuff: 'medo' } }; ok(validarDeus(g).length === 0, `"+dano vs Medo" (babi) VÁLIDO — medo é DEBUFF: ${JSON.stringify(validarDeus(g))}`); }
err(g => g.passiva.fx.push({ gatilho: 'imunidade', a: ['adormecido'], v: 5 }), 'não pertence ao gatilho'); // v não vai em imunidade
// gatilho aoCair (sessão 6): quem (sujeito) + faz (efeito no reator)
err(g => g.passiva.fx.push({ gatilho: 'aoCair', faz: [{ t: 'orbGain', n: 1 }] }), 'exige o campo "quem"');        // falta quem
err(g => g.passiva.fx.push({ gatilho: 'aoCair', quem: 'inimigo' }), 'exige o campo "faz"');                        // falta faz
err(g => g.passiva.fx.push({ gatilho: 'aoCair', quem: 'aliado', faz: [{ t: 'orbGain', n: 1 }] }), 'quem inválido'); // 'aliado' ainda não aberto (F1.4); 'qualquerInimigo' abriu na F1.3 morte 4/4
err(g => g.passiva.fx.push({ gatilho: 'aoCair', quem: 'inimigo', faz: [{ t: 'dmg', v: 10 }] }), 'não pode disparar por turno'); // faz turno-seguro
// gatilho aoSerAtingido (F1.4): quem próprio {self,aliado}; faz BUFF-only (garantia intacta); noAtacante = debuff no atacante
err(g => g.passiva.fx.push({ gatilho: 'aoSerAtingido', faz: [{ t: 'apply', eff: { type: 'dmgUp', v: 3, dur: 2 }, escopo: 'self' }] }), 'exige o campo "quem"'); // falta quem
err(g => g.passiva.fx.push({ gatilho: 'aoSerAtingido', quem: 'inimigo', faz: [{ t: 'shield', v: 5 }] }), 'aoSerAtingido.quem inválido'); // 'inimigo' não é sujeito de aoSerAtingido (só self|aliado)
err(g => g.passiva.fx.push({ gatilho: 'aoSerAtingido', quem: 'self' }), 'exige um payload'); // nem faz nem noAtacante
err(g => g.passiva.fx.push({ gatilho: 'aoSerAtingido', quem: 'self', faz: [{ t: 'apply', eff: { type: 'atordoado', dur: 1 }, escopo: 'self' }] }), 'só aplica BUFF'); // GARANTIA INTACTA: faz não aplica debuff
err(g => g.passiva.fx.push({ gatilho: 'aoSerAtingido', quem: 'self', noAtacante: [{ t: 'dmg', v: 10 }] }), 'só aceita dot|apply'); // noAtacante não faz dano (recursaria)
err(g => g.passiva.fx.push({ gatilho: 'aoSerAtingido', quem: 'self', noAtacante: [{ t: 'apply', eff: { type: 'dmgUp', v: 3, dur: 2 } }] }), 'não BUFF'); // buff no atacante é inútil
err(g => g.passiva.fx.push({ gatilho: 'aoSerAtingido', quem: 'self', contra: { elem: 'Plasma' }, faz: [{ t: 'heal', v: 5, escopo: 'self' }] }), 'fora do sub-vocabulário'); // contra.elem inválido
{ const g = base(); g.passiva.fx.push({ gatilho: 'aoSerAtingido', quem: 'aliado', faz: [{ t: 'apply', eff: { type: 'dmgUp', v: 3, dur: 9 }, escopo: 'self' }] }); ok(validarDeus(g).length === 0, 'aoSerAtingido faz-BUFF VÁLIDO (xango): ' + JSON.stringify(validarDeus(g))); }
{ const g = base(); g.passiva.fx.push({ gatilho: 'aoSerAtingido', quem: 'self', contra: { classe: 'Físico' }, noAtacante: [{ t: 'dot', nome: 'veneno', v: 8, dur: 2 }] }); ok(validarDeus(g).length === 0, 'aoSerAtingido noAtacante-DoT VÁLIDO (medusa): ' + JSON.stringify(validarDeus(g))); }
// gatilho aoAgirSobEfeito (F1.4): efeito (marcador) obrig; faz no dono (BUFF) / noAtor no ator (dmg PERMITIDO — por ação, não recursa)
err(g => g.passiva.fx.push({ gatilho: 'aoAgirSobEfeito', faz: [{ t: 'heal', v: 5, escopo: 'self' }] }), 'exige o campo "efeito"'); // falta efeito
err(g => g.passiva.fx.push({ gatilho: 'aoAgirSobEfeito', efeito: 'torpor' }), 'exige um payload'); // nem faz nem noAtor
err(g => g.passiva.fx.push({ gatilho: 'aoAgirSobEfeito', efeito: 'torpor', noAtor: [{ t: 'apply', eff: { type: 'dmgUp', v: 3, dur: 2 } }] }), 'não BUFF'); // buff no ator é inútil
err(g => g.passiva.fx.push({ gatilho: 'aoAgirSobEfeito', efeito: 'torpor', faz: [{ t: 'apply', eff: { type: 'atordoado', dur: 1 }, escopo: 'self' }] }), 'só aplica BUFF'); // faz segue BUFF-only (garantia intacta)
{ const g = base(); g.passiva.fx.push({ gatilho: 'aoAgirSobEfeito', efeito: 'torpor', faz: [{ t: 'heal', v: 10, escopo: 'self' }], noAtor: [{ t: 'dmg', v: 10 }] }); ok(validarDeus(g).length === 0, 'aoAgirSobEfeito dmg-no-ator VÁLIDO (shuten): ' + JSON.stringify(validarDeus(g))); }
{ const g = base(); g.passiva.fx.push({ gatilho: 'aoAgirSobEfeito', efeito: 'sangramento', noAtor: [{ t: 'dmg', v: 4 }] }); ok(validarDeus(g).length === 0, 'aoAgirSobEfeito só-noAtor VÁLIDO (piranha): ' + JSON.stringify(validarDeus(g))); }
// gatilho bonusCura (sessão 7): soma à MAGNITUDE da cura; eixo próprio `quandoCura` (3º eixo, separado de quando/contra)
err(g => g.passiva.fx.push({ gatilho: 'bonusCura' }), 'exige o campo "v"');                                          // falta v
err(g => g.passiva.fx.push({ gatilho: 'bonusCura', v: 5, quando: { alvoDebuff: 'qualquer' } }), 'não pertence ao gatilho'); // quando (ofensivo) NÃO vai em bonusCura — eixo errado
err(g => g.passiva.fx.push({ gatilho: 'bonusCura', v: 5, contra: { slot: 'basico' } }), 'não pertence ao gatilho');  // contra (defensivo) NÃO vai em bonusCura
err(g => g.passiva.fx.push({ gatilho: 'bonusCura', v: 5, quandoCura: { alvoDebuff: 'queimadura' } }), 'desconhecida'); // chave de quando não existe em quandoCura (eixos não se misturam)
err(g => g.passiva.fx.push({ gatilho: 'bonusCura', v: 5, quandoCura: { inimigoTem: 'medo' } }), 'fora do sub-vocabulário'); // 'medo' não é DoT (F1.4 amplia)
err(g => g.passiva.fx.push({ gatilho: 'bonusDano', v: 5, quandoCura: { inimigoTem: 'queimadura' } }), 'não pertence ao gatilho'); // quandoCura NÃO vai em bonusDano
// gatilho aCadaN (sessão 8): cadência ABSOLUTA n + EXATAMENTE um payload (faz OU custoGratis)
err(g => g.passiva.fx.push({ gatilho: 'aCadaN', custoGratis: { slot: 'basico' } }), 'exige o campo "n"');                    // falta n
err(g => g.passiva.fx.push({ gatilho: 'aCadaN', n: 1, custoGratis: { slot: 'basico' } }), 'n inválido');                     // n=1 é porTurno
err(g => g.passiva.fx.push({ gatilho: 'aCadaN', n: 3 }), 'EXATAMENTE um payload');                                           // nenhum payload
err(g => g.passiva.fx.push({ gatilho: 'aCadaN', n: 3, faz: [{ t: 'orbGain', n: 1 }], custoGratis: { slot: 'basico' } }), 'EXATAMENTE um payload'); // dois payloads
err(g => g.passiva.fx.push({ gatilho: 'aCadaN', n: 3, custoGratis: { slot: 'defesa' } }), 'custoGratis.slot inválido');      // defesa não é slot de ataque
err(g => g.passiva.fx.push({ gatilho: 'aCadaN', n: 3, custoGratis: { slot: 'basico', v: 2 } }), 'custoGratis só aceita');    // campo extra em custoGratis
err(g => g.passiva.fx.push({ gatilho: 'aCadaN', n: 3, faz: [{ t: 'dmg', v: 10 }] }), 'não pode disparar por turno');         // faz turno-seguro (reusa validarFaz)
err(g => g.passiva.fx.push({ gatilho: 'bonusDano', v: 5, custoGratis: { slot: 'basico' } }), 'não pertence ao gatilho');     // custoGratis NÃO vai em bonusDano
// gatilho aoCurar (sessão 10): faz roda NO CURADO; reusa validarFaz (fx turno-seguro, sem alvo escolhido)
err(g => g.passiva.fx.push({ gatilho: 'aoCurar' }), 'exige o campo "faz"');                                                  // falta faz
err(g => g.passiva.fx.push({ gatilho: 'aoCurar', faz: [{ t: 'dmg', v: 10 }] }), 'não pode disparar por turno');              // dmg não é faz-seguro
err(g => g.passiva.fx.push({ gatilho: 'aoCurar', faz: [{ t: 'shield', v: 10, alvo: 'inimigo' }] }), 'faz não escolhe alvo'); // alvo não pode ser escolhido
err(g => g.passiva.fx.push({ gatilho: 'aoCurar', v: 5, faz: [{ t: 'shield', v: 10 }] }), 'não pertence ao gatilho');         // v não vai em aoCurar
// F1.2.5: heal/apply entram no faz — mas apply é FECHADO a BUFF, e o alvo de heal/apply é self|time (nunca inimigo)
err(g => g.passiva.fx.push({ gatilho: 'porTurno', faz: [{ t: 'apply', eff: { type: 'atordoado', dur: 1 } }] }), 'só aplica BUFF'); // controle exigiria alvo inimigo
err(g => g.passiva.fx.push({ gatilho: 'porTurno', faz: [{ t: 'apply', eff: { type: 'dmgDown', v: 5, dur: 2 } }] }), 'só aplica BUFF'); // debuff idem
err(g => g.passiva.fx.push({ gatilho: 'porTurno', faz: [{ t: 'heal', v: 10, escopo: 'inimigo' }] }), 'escopo de faz inválido'); // escopo inimigo proibido
{ const g = base(); g.passiva.fx.push({ gatilho: 'porTurno', faz: [{ t: 'heal', v: 10, escopo: 'time' }] }); ok(validarDeus(g).length === 0, 'faz-heal escopo time é VÁLIDO: ' + JSON.stringify(validarDeus(g))); }
{ const g = base(); g.passiva.fx.push({ gatilho: 'porTurno', faz: [{ t: 'apply', eff: { type: 'dmgReduction', v: 5, dur: 2 } }] }); ok(validarDeus(g).length === 0, 'faz-apply BUFF é VÁLIDO: ' + JSON.stringify(validarDeus(g))); }
console.log('');
console.log(f === 0 ? '>>> PASSIVA OK' : `>>> ${f} FALHA(S)`);
process.exit(f ? 1 : 0);
