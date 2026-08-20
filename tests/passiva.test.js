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
console.log('== F1.6 cdShift MIRADO: 1 unidade (Bragi só a maior recarga; Brahma zera todas) ==');
{ // soMaior toca só a maior recarga ativa; sem soMaior (v:-99) zera todas as recargas da unidade; não toca outros
  const st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 603);
  const caster = st.lados[0].units[0], ally = st.lados[0].units[1], other = st.lados[0].units[2];
  ally.cd = { habilidade: 3, milagre: 1 };
  E.aplicarFx(st, caster, [{ t: 'cdShift', unidade: true, soMaior: true, v: -1 }], { alvo: 'aliado', slot: 'habilidade' }, [ally]);
  ok(ally.cd.habilidade === 2 && ally.cd.milagre === 1, `soMaior (Bragi): só a MAIOR recarga cai -1 (${JSON.stringify(ally.cd)})`);
  ally.cd = { habilidade: 2, milagre: 4 };
  other.cd = { habilidade: 3 };
  E.aplicarFx(st, caster, [{ t: 'cdShift', unidade: true, v: -99 }], { alvo: 'aliado', slot: 'milagre' }, [ally]);
  ok(ally.cd.habilidade === 0 && ally.cd.milagre === 0, `zera-todas (Brahma): todas as recargas da unidade a 0 (${JSON.stringify(ally.cd)})`);
  ok(other.cd.habilidade === 3, `MIRADO: não toca outros aliados (${JSON.stringify(other.cd)})`);
  console.log('  cdShift mirado: soMaior (Bragi) vs zera-todas (Brahma), 1 unidade só');
}
console.log('== F1.6 Iansã: limparInvocacoes destrói invocações inimigas; antiRevive = naoRevive proativo nos vivos ==');
{ // destrói invocações do lado inimigo; marca antiRevive num vivo → ao cair, não revive
  const st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 604);
  const iansa = st.lados[0].units[0], inimigos = st.lados[1].units;
  st.lados[1].invocacoes.push({ nome: 'Egum', tipo: 'x', hp: 10, v: 5, dur: 3, dono: inimigos[0].uid });
  E.aplicarFx(st, iansa, [{ t: 'limparInvocacoes' }], { alvo: 'todosInimigos', slot: 'milagre' }, inimigos);
  ok(st.lados[1].invocacoes.length === 0, `limparInvocacoes: invocações inimigas destruídas (restam ${st.lados[1].invocacoes.length})`);
  const t = inimigos[0];
  E.aplicarFx(st, iansa, [{ t: 'apply', eff: { type: 'antiRevive', dur: 2 }, escopo: 'todosInimigos' }], { alvo: 'todosInimigos', slot: 'milagre' }, inimigos);
  t.hp = 5;
  E.bater(st, iansa, t, 999, 'afetado', 'basico', { unico: true });   // cai carregando antiRevive
  ok(!t.vivo && t.naoRevive, `antiRevive: caiu com a marca → naoRevive selado (vivo=${t.vivo} naoRevive=${t.naoRevive})`);
  E.reviver(st, t, { hp: 40 });
  ok(!t.vivo, `revive BLOQUEADO pelo naoRevive proativo (vivo=${t.vivo})`);
  console.log('  Iansã: limparInvocacoes + antiRevive (naoRevive proativo nos vivos)');
}
console.log('== F1.6 Freyja: fx CONDICIONAL por estado — aliadoCaido ? revive : buff time ==');
{ // ramo ENTAO (há caído): revive 1 caído, sem buff. ramo SENAO (ninguém caiu): time ganha dmgUp
  const mil = [{ t: 'condicional', se: { aliadoCaido: true }, entao: [{ t: 'revive', hp: 48, escopo: 'umCaido' }], senao: [{ t: 'apply', eff: { type: 'dmgUp', v: 12, dur: 2 }, escopo: 'time' }] }];
  const st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 605);
  const caster = st.lados[0].units[0], a1 = st.lados[0].units[1];
  a1.vivo = false; a1.hp = 0;
  E.aplicarFx(st, caster, mil, { alvo: 'nenhum', slot: 'milagre' }, []);
  ok(a1.vivo && a1.hp === 48 && !E.ef(caster, 'dmgUp'), `ENTAO (há caído): revive a 48 e NÃO buffa (vivo=${a1.vivo} hp=${a1.hp} buff=${!!E.ef(caster, 'dmgUp')})`);
  const st2 = E.novoEstado(['zeus', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 606);
  const c2 = st2.lados[0].units[0];
  E.aplicarFx(st2, c2, mil, { alvo: 'nenhum', slot: 'milagre' }, []);
  ok(E.ef(c2, 'dmgUp') && E.ef(c2, 'dmgUp').v === 12, `SENAO (ninguém caiu): o time ganha dmgUp+12 (${E.ef(c2, 'dmgUp') && E.ef(c2, 'dmgUp').v})`);
  console.log('  Freyja: fx condicional (aliadoCaido ? revive : buff time)');
}
console.log('== F1.6 Medusa: limiar com CONSOME — ao cruzar em:3, aplica atordoado E zera as marcas ==');
{ // acumula Pedra; na 3ª marca petrifica (atordoado) e o contador volta a 0 ("perde as marcas")
  const st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 607);
  const caster = st.lados[0].units[0], t = st.lados[1].units[0];
  const marca = [{ t: 'contador', nome: 'Pedra', v: 1, limiar: { em: 3, aplica: { type: 'atordoado', dur: 1 }, consome: true } }];
  E.aplicarFx(st, caster, marca, { alvo: 'inimigo', slot: 'habilidade' }, [t]);
  E.aplicarFx(st, caster, marca, { alvo: 'inimigo', slot: 'habilidade' }, [t]);
  ok(E.getContador(t, 'Pedra') === 2 && !E.ef(t, 'atordoado'), `2 marcas: ainda não petrifica (pedra=${E.getContador(t, 'Pedra')})`);
  E.aplicarFx(st, caster, marca, { alvo: 'inimigo', slot: 'habilidade' }, [t]);
  ok(E.ef(t, 'atordoado') && E.getContador(t, 'Pedra') === 0, `3ª marca: PETRIFICADO e marcas ZERADAS (consome): pedra=${E.getContador(t, 'Pedra')} atordoado=${!!E.ef(t, 'atordoado')}`);
  console.log('  Medusa: limiar-consome (petrifica em 3, perde as marcas)');
}
console.log('== F1.6 Nefertem: bonusCura por FACÇÃO do curador — +5 só quando quem cura é Egípcio ==');
{ // nefertem no time; cura de Egípcio ganha +5, cura de Grego não
  E.GODS.tnefer = { nome: 'TNef', faccao: 'Egípcia', elem: 'Aurora', classe: 'Mágico', funcao: 'Suporte', passiva: { nome: 'p', desc: 'd', fx: [{ gatilho: 'bonusCura', v: 5, quandoCura: { curadorFaccao: 'Egípcia' } }] } };
  E.GODS.tegp = { nome: 'TEgp', faccao: 'Egípcia', elem: 'Aurora', classe: 'Mágico', funcao: 'Suporte', passiva: { nome: 'p', desc: 'd', fx: [] } };
  E.GODS.tgrg = { nome: 'TGrg', faccao: 'Grega', elem: 'Aurora', classe: 'Mágico', funcao: 'Suporte', passiva: { nome: 'p', desc: 'd', fx: [] } };
  const st = E.novoEstado(['tnefer', 'tegp', 'tgrg'], ['zeus', 'zeus', 'zeus'], 608);
  const nefer = st.lados[0].units[0], egp = st.lados[0].units[1], grg = st.lados[0].units[2];
  nefer.hp = 50; const h0 = nefer.hp;
  E.aplicarFx(st, egp, [{ t: 'heal', v: 10 }], { alvo: 'aliado', slot: 'habilidade' }, [nefer]);
  ok(nefer.hp === h0 + 15, `curador Egípcio: 10 + 5 do bonusCura = 15 (${h0}→${nefer.hp})`);
  nefer.hp = 50; const h1 = nefer.hp;
  E.aplicarFx(st, grg, [{ t: 'heal', v: 10 }], { alvo: 'aliado', slot: 'habilidade' }, [nefer]);
  ok(nefer.hp === h1 + 10, `curador Grego: só 10, sem bônus (${h1}→${nefer.hp})`);
  delete E.GODS.tnefer; delete E.GODS.tegp; delete E.GODS.tgrg;
  console.log('  Nefertem: bonusCura lê a facção de QUEM curou (curador), não do curado');
}
console.log('== F1.6 umaVez: habilidade "1× por partida" trava PERMANENTE após um uso (Ísis/Shiva) ==');
{ // o campo `usos` existia sem fio; agora ligado — acoesDe trava, agir marca
  E.GODS.tuma = { key: 'tuma', nome: 'TUma', faccao: 'T', elem: 'Aurora', classe: 'Mágico', funcao: 'Suporte', passiva: { nome: 'p', desc: 'd', fx: [] }, ab: [
    { slot: 'basico', classe: 'Mágico', nome: 'b', cost: {}, cd: 0, alvo: 'inimigo', fx: [{ t: 'dmg', v: 10 }] },
    { slot: 'milagre', classe: 'Mágico', nome: 'm', cost: {}, cd: 0, umaVez: true, alvo: 'nenhum', fx: [{ t: 'heal', v: 5, escopo: 'time' }] }
  ] };
  const st = E.novoEstado(['tuma', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 609);
  const u = st.lados[0].units[0];
  ok(E.acoesDe(st, u).find(a => a.slot === 'milagre').disponivel, 'milagre umaVez disponível ANTES de usar');
  E.agir(st, u.uid, 'milagre', []);
  const m = E.acoesDe(st, u).find(a => a.slot === 'milagre');
  ok(!m.disponivel && m.motivo === 'ja_usou' && u.usos.milagre === true, `milagre umaVez TRAVADO após 1 uso, mesmo com cd:0 (motivo=${m.motivo} usos=${JSON.stringify(u.usos)})`);
  delete E.GODS.tuma;
  console.log('  umaVez: trava permanente (ja_usou), o cd:0 não reabre');
}
console.log('== F1.6 (§73) wrapper: bonusDano PASSIVO escala por contagem (MESMO helper do danoBase) — Oni +1 por 4 Combo ==');
{ // v FIXO (0 aqui) + escala; passo:4 → +floor(count/4). Sem caminho duplicado — reusa escalaContagem.
  E.GODS.tesc = { key: 'tesc', nome: 'TEsc', faccao: 'T', elem: 'Chama', classe: 'Físico', funcao: 'Guardião', passiva: { nome: 'p', desc: 'd', fx: [{ gatilho: 'bonusDano', v: 0, escopo: 'self', porContadorLado: { nome: 'combo', v: 1, passo: 4 } }] }, ab: [{ slot: 'basico', classe: 'Físico', nome: 'b', cost: {}, cd: 0, alvo: 'inimigo', fx: [{ t: 'dmg', v: 10 }] }] };
  const st = E.novoEstado(['tesc', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 610);
  const u = st.lados[0].units[0], alvo = st.lados[1].units[0];
  const h0 = alvo.hp; E.bater(st, u, alvo, 10, 'afetado', 'basico', {});
  ok(alvo.hp === h0 - 10, `0 Combo: v:0 + escala 0 = 10 (${h0}→${alvo.hp})`);
  E.addContadorLado(st, 0, 'combo', 9); alvo.hp = 100;
  E.bater(st, u, alvo, 10, 'afetado', 'basico', {});
  ok(alvo.hp === 100 - 12, `9 Combo (passo 4): +floor(9/4)=+2 → 12 (${alvo.hp})`);
  delete E.GODS.tesc;
  console.log('  §73: bonusDano passivo escala pelo MESMO helper (passo), sem caminho duplicado com o danoBase');
}
{ // porHpFaltante — Mula "+1 por 5 de HP perdido" (HP do próprio atacante)
  E.GODS.thp = { key: 'thp', nome: 'THp', faccao: 'T', elem: 'Chama', classe: 'Físico', funcao: 'Atacante', passiva: { nome: 'p', desc: 'd', fx: [{ gatilho: 'bonusDano', v: 0, escopo: 'self', porHpFaltante: { v: 1, passo: 5 } }] }, ab: [{ slot: 'basico', classe: 'Físico', nome: 'b', cost: {}, cd: 0, alvo: 'inimigo', fx: [{ t: 'dmg', v: 10 }] }] };
  const st = E.novoEstado(['thp', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 611);
  const u = st.lados[0].units[0], alvo = st.lados[1].units[0];
  u.hp = u.maxHp - 12;   // 12 de HP perdido → floor(12/5)=2
  alvo.hp = 100; E.bater(st, u, alvo, 10, 'afetado', 'basico', {});
  ok(alvo.hp === 100 - 12, `12 HP perdido (passo 5): +floor(12/5)=+2 → 10+2=12 (${alvo.hp})`);
  delete E.GODS.thp;
  console.log('  §73: porHpFaltante escala pelo HP-faltante do próprio atacante');
}
console.log('== F1.6 nega-orbe: roubaOrbe remove/rouba do maior pool inimigo; protegeOrbe (Heimdall) barra ==');
{ // rouba 1 do maior pool inimigo → vai p/ o próprio
  const st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 612);
  const u = st.lados[0].units[0];
  E.ELEMS.forEach(e => { st.lados[1].orbs[e] = 0; st.lados[0].orbs[e] = 0; });
  st.lados[1].orbs.Tempestade = 3; st.lados[1].orbs.Umbra = 1;
  E.aplicarFx(st, u, [{ t: 'roubaOrbe', n: 1, rouba: true }], { alvo: 'inimigo', slot: 'milagre' }, [st.lados[1].units[0]]);
  ok(st.lados[1].orbs.Tempestade === 2 && st.lados[0].orbs.Tempestade === 1, `rouba 1 do MAIOR pool inimigo (Tempestade 3→${st.lados[1].orbs.Tempestade}) e ganha (${st.lados[0].orbs.Tempestade})`);
}
{ // protegeOrbe (Heimdall) barra o roubo
  E.GODS.theim = { key: 'theim', nome: 'THeim', faccao: 'T', elem: 'Aurora', classe: 'Físico', funcao: 'Guardião', passiva: { nome: 'p', desc: 'd', fx: [{ gatilho: 'protegeOrbe' }] }, ab: [{ slot: 'basico', classe: 'Físico', nome: 'b', cost: {}, cd: 0, alvo: 'inimigo', fx: [{ t: 'dmg', v: 10 }] }] };
  const st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['theim', 'zeus', 'zeus'], 613);
  const u = st.lados[0].units[0];
  E.ELEMS.forEach(e => st.lados[1].orbs[e] = 0); st.lados[1].orbs.Umbra = 5;
  E.aplicarFx(st, u, [{ t: 'roubaOrbe', n: 2, rouba: true }], { alvo: 'inimigo', slot: 'milagre' }, [st.lados[1].units[0]]);
  ok(st.lados[1].orbs.Umbra === 5, `protegeOrbe (Heimdall vivo) BARRA o roubo (Umbra segue 5)`);
  delete E.GODS.theim;
  console.log('  nega-orbe: roubaOrbe (maior pool, rouba→próprio) + protegeOrbe barra');
}
console.log('== F1.6 execIf: execução FILTRADA por status (Iara — elimina só Encharcados) ==');
{ // dois alvos ≤24 HP: só o Encharcado é executado
  const st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 614);
  const u = st.lados[0].units[0], a = st.lados[1].units;
  a[0].hp = 20; a[0].efeitos.push({ type: 'encharcado', dur: 2 });
  a[1].hp = 20;
  E.aplicarFx(st, u, [{ t: 'dmg', v: 1, executaAbaixoDe: 24, execIf: { alvoDebuff: 'encharcado' }, escopo: 'todosInimigos' }], { alvo: 'todosInimigos', slot: 'milagre' }, a);
  ok(!a[0].vivo, `Encharcado ≤24: EXECUTADO (vivo=${a[0].vivo})`);
  ok(a[1].vivo, `SEM Encharcado ≤24: NÃO executado (vivo=${a[1].vivo})`);
  console.log('  execIf: execução só nos que casam o status');
}

console.log('== F1.6 contraClasse: contra-ataque FILTRADO por classe do golpe (Atena — só Físico) ==');
{ // o defensor carrega contraAtaca{contraClasse:'Físico'}: revida golpe Físico, IGNORA golpe Mágico
  E.GODS.tfis = { nome: 'TFis', faccao: 'T', elem: 'Tempestade', classe: 'Físico', funcao: 'Atacante', passiva: { nome: '-', desc: '-' }, ab: [{ slot: 'basico', classe: 'Físico', nome: 'Soco', cost: { Tempestade: 1 }, cd: 0, alvo: 'inimigo', fx: [{ t: 'dmg', v: 10 }] }] };
  E.GODS.tmag = { nome: 'TMag', faccao: 'T', elem: 'Tempestade', classe: 'Mágico', funcao: 'Atacante', passiva: { nome: '-', desc: '-' }, ab: [{ slot: 'basico', classe: 'Mágico', nome: 'Raio', cost: { Tempestade: 1 }, cd: 0, alvo: 'inimigo', fx: [{ t: 'dmg', v: 10 }] }] };
  const st = E.novoEstado(['tfis', 'tmag', 'zeus'], ['zeus', 'zeus', 'zeus'], 615);
  st.lados[0].orbs['Tempestade'] = 9;
  const fis = st.lados[0].units[0], mag = st.lados[0].units[1], def = st.lados[1].units[0];
  def.efeitos.push({ type: 'contraAtaca', v: 10, dur: 3, contraClasse: 'Físico', origem: def.uid });
  const hf = fis.hp;
  E.agir(st, fis.uid, 'basico', [def.uid]);
  ok(fis.hp === hf - 10, `golpe Físico → contra-atacado por 10 (${hf}→${fis.hp})`);
  const hm = mag.hp;
  E.agir(st, mag.uid, 'basico', [def.uid]);
  ok(mag.hp === hm, `golpe Mágico → NÃO contra-atacado (${hm}→${mag.hp})`);
  delete E.GODS.tfis; delete E.GODS.tmag;
  console.log('  contraClasse: revida só a classe casada, ignora o resto');
}

console.log('== F1.6 vulneravel: debuff "recebe +N de dano" soma no dano de ENTRADA (Durga) ==');
{ // vulneravel amplia o dano SOFRIDO pelo alvo (não o dano de saída de quem carrega)
  const st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 616);
  const atk = st.lados[0].units[0], alvo = st.lados[1].units[0];
  const bater10 = () => E.aplicarFx(st, atk, [{ t: 'dmg', v: 10 }], { alvo: 'inimigo', slot: 'basico' }, [alvo]);
  const aplicaVul = () => E.aplicarFx(st, atk, [{ t: 'apply', eff: { type: 'vulneravel', v: 8, dur: 3 } }], { alvo: 'inimigo', slot: 'habilidade' }, [alvo]);
  const h0 = alvo.hp; bater10();
  ok(alvo.hp === h0 - 10, `sem vulnerável: 10 de dano (${h0}→${alvo.hp})`);
  aplicaVul(); const h1 = alvo.hp; bater10();
  ok(alvo.hp === h1 - 18, `com vulnerável +8: 10→18 de dano (${h1}→${alvo.hp})`);
  aplicaVul(); const h2 = alvo.hp; bater10();   // reaplicar EMPILHA (família dmgUp/dmgDown)
  ok(alvo.hp === h2 - 26, `vulnerável empilha (+8+8): 10→26 de dano (${h2}→${alvo.hp})`);
  E.aplicarFx(st, alvo, [{ t: 'cleanse', escopo: 'time' }], { alvo: 'time', slot: 'milagre' }, []);   // o próprio lado limpa: vulneravel ∈ DEBUFFS
  const h3 = alvo.hp; bater10();
  ok(alvo.hp === h3 - 10, `cleanse remove vulnerável: volta a 10 (${h3}→${alvo.hp})`);
  console.log('  vulneravel: soma no dano de entrada, empilha, é cleansável');
}

console.log('== F1.6 aoCair quem:aliado: reage à queda de aliado REAL e de invocação-guarda (Khnum) ==');
{ // Khnum: quando um aliado (ou o Shabti) cai, o time cura 12
  E.GODS.tkh = { nome: 'TKh', faccao: 'T', elem: 'Verdejante', classe: 'Mágico', funcao: 'Manipulador', passiva: { nome: 'p', desc: 'd', fx: [{ gatilho: 'aoCair', quem: 'aliado', faz: [{ t: 'heal', v: 12, escopo: 'time' }] }] }, ab: [{ slot: 'habilidade', classe: 'Mágico', nome: 'Molda', cost: { Verdejante: 2 }, cd: 3, alvo: 'inimigo', fx: [{ t: 'invocar', nome: 'Shabti', tipo: 'guarda', hp: 30, dur: 2, provoca: true }] }] };
  // 1. aliado REAL cai → cura o time
  let st = E.novoEstado(['tkh', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 617);
  let kh = st.lados[0].units[0], ally = st.lados[0].units[1], enemy = st.lados[1].units[0];
  kh.hp = 50; ally.hp = 5;
  E.aplicarFx(st, enemy, [{ t: 'dmg', v: 20 }], { alvo: 'inimigo', slot: 'basico' }, [ally]);
  ok(!ally.vivo && kh.hp === 62, `aliado real caiu → time cura 12 (Khnum 50→${kh.hp})`);
  // 2. invocação-guarda (Shabti) cai POR DANO → conta como queda de aliado
  st = E.novoEstado(['tkh', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 618);
  kh = st.lados[0].units[0]; ally = st.lados[0].units[1]; enemy = st.lados[1].units[0];
  st.lados[0].orbs['Verdejante'] = 9; kh.hp = 50;
  E.agir(st, kh.uid, 'habilidade', [enemy.uid]);
  E.aplicarFx(st, enemy, [{ t: 'dmg', v: 40 }], { alvo: 'inimigo', slot: 'basico' }, [ally]);
  ok(st.lados[0].invocacoes.length === 0 && kh.hp === 62, `Shabti caiu por dano → time cura 12 (Khnum 50→${kh.hp})`);
  // 3. lado: a queda de um INIMIGO não dispara (quem:aliado é só o MESMO lado)
  st = E.novoEstado(['tkh', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 619);
  kh = st.lados[0].units[0]; const inimigo = st.lados[1].units[0];
  kh.hp = 50; inimigo.hp = 5;
  E.aplicarFx(st, kh, [{ t: 'dmg', v: 20 }], { alvo: 'inimigo', slot: 'basico' }, [inimigo]);
  ok(!inimigo.vivo && kh.hp === 50, `queda de inimigo NÃO dispara quem:aliado (Khnum ${kh.hp})`);
  delete E.GODS.tkh;
  console.log('  aoCair aliado: aliado real + invocação-guarda disparam; inimigo não');
}

console.log('== F1.6 reducao protegido: redução FILTRADA pelo elemento do beneficiário (Poseidon — só Maré) ==');
{ // protetor Maré protege o time, mas só os aliados Maré recebem a redução
  E.GODS.tpo = { nome: 'TPo', faccao: 'T', elem: 'Maré', classe: 'Mágico', funcao: 'Atacante', passiva: { nome: 'p', desc: 'd', fx: [{ gatilho: 'reducao', v: 5, escopo: 'time', protegido: { elem: 'Maré' } }] } };
  E.GODS.tmare = { nome: 'TMare', faccao: 'T', elem: 'Maré', classe: 'Mágico', funcao: 'Atacante', passiva: { nome: '-', desc: '-' } };
  const st = E.novoEstado(['tpo', 'tmare', 'zeus'], ['zeus', 'zeus', 'zeus'], 620);
  const po = st.lados[0].units[0], mare = st.lados[0].units[1], outro = st.lados[0].units[2], enemy = st.lados[1].units[0];
  const bate = (alvo) => { const h = alvo.hp; E.aplicarFx(st, enemy, [{ t: 'dmg', v: 20 }], { alvo: 'inimigo', slot: 'basico' }, [alvo]); return h - alvo.hp; };
  ok(bate(mare) === 15, `aliado Maré: 20-5 = 15 de dano recebido`);
  ok(bate(po) === 15, `o próprio protetor (Maré) também recebe -5`);
  ok(bate(outro) === 20, `aliado NÃO-Maré (Tempestade): 20 cheio, sem redução`);
  delete E.GODS.tpo; delete E.GODS.tmare;
  console.log('  protegido: filtra o beneficiário, não o golpe — só o elemento casado reduz');
}

console.log('== F1.6 bonusCura viaRegen: só o TICK de regeneração recebe o bônus (Chaac) ==');
{ // "regenerações no time curam +4" — o bônus entra no tick de regen, NÃO numa cura direta
  E.GODS.tch = { nome: 'TCh', faccao: 'T', elem: 'Maré', classe: 'Mágico', funcao: 'Atacante', passiva: { nome: 'p', desc: 'd', fx: [{ gatilho: 'bonusCura', v: 4, quandoCura: { viaRegen: true } }] } };
  // 1. tick de regen num aliado → +4
  let st = E.novoEstado(['tch', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 621);
  let ally = st.lados[0].units[1]; ally.hp = 50; ally.efeitos.push({ type: 'regen', v: 10, dur: 3 });
  st.ativo = 0; E.iniciarTurno(st);
  ok(ally.hp === 64, `regen tick 10 +4 (viaRegen) = 14 (50→${ally.hp})`);
  // 2. cura DIRETA (não-regen) NÃO recebe o bônus
  st = E.novoEstado(['tch', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 622);
  ally = st.lados[0].units[1]; ally.hp = 50;
  E.aplicarFx(st, st.lados[0].units[0], [{ t: 'heal', v: 10, escopo: 'time' }], { alvo: 'time', slot: 'habilidade' }, []);
  ok(ally.hp === 60, `cura direta 10 SEM bônus (viaRegen só no tick) (50→${ally.hp})`);
  delete E.GODS.tch;
  console.log('  viaRegen: o bônus lê a ORIGEM da cura (tick de regen), não a magnitude');
}

console.log('== F1.6 apply soSe: apply FILTRADO por status do alvo — atordoa só os Encharcados (Chaac) ==');
{ // milagre em área: atordoa apenas os alvos que já estão Encharcados
  const st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 623);
  const atk = st.lados[0].units[0], e0 = st.lados[1].units[0], e1 = st.lados[1].units[1];
  e0.efeitos.push({ type: 'encharcado', dur: 2 });   // só e0 está Encharcado
  E.aplicarFx(st, atk, [{ t: 'apply', eff: { type: 'atordoado', dur: 1 }, escopo: 'todosInimigos', soSe: { alvoDebuff: 'encharcado' } }], { alvo: 'todosInimigos', slot: 'milagre' }, []);
  ok(!!E.ef(e0, 'atordoado'), `alvo Encharcado → atordoado`);
  ok(!E.ef(e1, 'atordoado'), `alvo seco → NÃO atordoado (soSe filtra)`);
  console.log('  soSe: aplica só nos alvos que casam a condição de status');
}

console.log('== F1.6 cdShift CLUSTER (Huangdi): team-longest -1/turno (desempate DETERMINÍSTICO), lado inteiro, mirado-2 ==');
{ // PASSIVA porTurno: "a recarga mais longa do time -1" — EXTRA, além do tick geral (que já baixa tudo -1)
  const st = E.novoEstado(['huangdi', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 624);
  const u = st.lados[0].units;
  u[0].cd = { habilidade: 2 }; u[1].cd = { milagre: 5 }; u[2].cd = { habilidade: 3 };
  st.ativo = 0; E.iniciarTurno(st);
  // tick geral: hab 2→1, mil 5→4, hab 3→2; passiva pega a MAIOR pós-tick (u[1].mil=4) → 3
  ok(u[1].cd.milagre === 3, `a recarga mais longa do time leva o -1 EXTRA (tick+passiva: 5→3) [${u[1].cd.milagre}]`);
  ok(u[0].cd.habilidade === 1 && u[2].cd.habilidade === 2, `as outras só o tick geral (2→1, 3→2) [${u[0].cd.habilidade},${u[2].cd.habilidade}]`);
}
{ // DESEMPATE 1 — duas unidades com a mesma maior: a de MENOR índice cede (trava replay/cadeia)
  const st = E.novoEstado(['huangdi', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 625);
  const u = st.lados[0].units;
  u[0].cd = {}; u[1].cd = { milagre: 4 }; u[2].cd = { milagre: 4 };
  st.ativo = 0; E.iniciarTurno(st);
  // tick: ambas 4→3; empate em 3 → menor índice (u[1]) cede → 2; u[2] fica 3
  ok(u[1].cd.milagre === 2 && u[2].cd.milagre === 3, `empate → menor índice cede (u[1]=2, u[2]=3) [${u[1].cd.milagre},${u[2].cd.milagre}]`);
}
{ // DESEMPATE 2 — mesma unidade, dois slots na maior: ordem de slot (basico→hab→milagre) → habilidade cede
  const st = E.novoEstado(['huangdi', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 626);
  const u = st.lados[0].units;
  u[0].cd = {}; u[1].cd = { habilidade: 4, milagre: 4 }; u[2].cd = {};
  st.ativo = 0; E.iniciarTurno(st);
  // tick: hab 4→3, mil 4→3; empate → ordem de slot → habilidade cede → 2; milagre fica 3
  ok(u[1].cd.habilidade === 2 && u[1].cd.milagre === 3, `empate no mesmo deus → slot habilidade antes de milagre (hab=2, mil=3) [${u[1].cd.habilidade},${u[1].cd.milagre}]`);
}
{ // HABILIDADE: escopo-de-lado próprio (reduz TODAS as recargas do time -1) + dmgUp no time
  const st = E.novoEstado(['huangdi', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 627);
  const u = st.lados[0].units;
  u[1].cd = { milagre: 3 }; u[2].cd = { habilidade: 2 };
  E.aplicarFx(st, u[0], [{ t: 'cdShift', v: -1, lado: 'proprio' }, { t: 'apply', eff: { type: 'dmgUp', v: 5, dur: 2 }, escopo: 'time' }], { alvo: 'nenhum', slot: 'habilidade' }, []);
  ok(u[1].cd.milagre === 2 && u[2].cd.habilidade === 1, `habilidade: TODAS as recargas do time -1 (3→2, 2→1) [${u[1].cd.milagre},${u[2].cd.habilidade}]`);
  ok(!!E.ef(u[0], 'dmgUp') && !!E.ef(u[1], 'dmgUp'), `dmgUp no time inteiro`);
}
{ // MILAGRE: mirado em 2 aliados (zera TODAS as recargas dos DOIS) + cleanse nos dois
  const st = E.novoEstado(['huangdi', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 628);
  const u = st.lados[0].units;
  u[1].cd = { milagre: 4, habilidade: 2 }; u[2].cd = { habilidade: 3 };
  u[1].efeitos.push({ type: 'atordoado', dur: 2 }); u[2].efeitos.push({ type: 'dmgDown', v: 5, dur: 2 });
  E.aplicarFx(st, u[0], [{ t: 'cdShift', unidade: true, v: -99 }, { t: 'cleanse' }], { alvo: '2aliados', slot: 'milagre' }, [u[1], u[2]]);
  ok(u[1].cd.milagre === 0 && u[1].cd.habilidade === 0 && u[2].cd.habilidade === 0, `mirado-2: zera TODAS as recargas dos DOIS [${u[1].cd.milagre},${u[1].cd.habilidade},${u[2].cd.habilidade}]`);
  ok(!E.ef(u[1], 'atordoado') && !E.ef(u[2], 'dmgDown'), `cleanse nos dois aliados escolhidos`);
  console.log('  cdShift-cluster: team-longest (desempate índice→slot), lado-inteiro e mirado-2 — Huang Di inteiro');
}

console.log('== F1.8 porStatus: escala por contagem de status (UM source, 2 escopos) — Erínias / Ao Kuang ==');
{ // ERÍNIAS-shape: dmg base + v por debuff NO ALVO (conta efeitos+DoTs; "debuff" inclui DoT como o alvoDebuff)
  const st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 629);
  const atk = st.lados[0].units[0], t = st.lados[1].units[0];
  let h = t.hp;
  E.aplicarFx(st, atk, [{ t: 'dmg', v: 25, porStatus: { v: 10, categoria: 'debuff', onde: 'alvo' } }], { alvo: 'inimigo', slot: 'milagre' }, [t]);
  ok(t.hp === h - 25, `alvo limpo: só a base 25 (sem escala) [${h - t.hp}]`);
  t.efeitos.push({ type: 'encharcado', dur: 2 }); t.efeitos.push({ type: 'dmgDown', v: 5, dur: 2 }); t.dots.push({ nome: 'veneno', v: 8, dur: 2 });
  h = t.hp;
  E.aplicarFx(st, atk, [{ t: 'dmg', v: 25, porStatus: { v: 10, categoria: 'debuff', onde: 'alvo' } }], { alvo: 'inimigo', slot: 'milagre' }, [t]);
  ok(t.hp === h - 55, `3 debuffs (encharcado+dmgDown+veneno) → 25 + 10×3 = 55 [${h - t.hp}]`);
}
{ // AOKUANG/JÖRMUNGANDR-shape: bonusDano PASSIVO escala por contagem de UNIDADES com o status no time inimigo
  E.GODS.tps = { nome: 'TPS', faccao: 'T', elem: 'Maré', classe: 'Mágico', funcao: 'Atacante', passiva: { nome: 'p', desc: 'd', fx: [{ gatilho: 'bonusDano', v: 0, porStatus: { v: 5, categoria: 'encharcado', onde: 'timeInimigo' } }] } };
  const st = E.novoEstado(['tps', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 630);
  const atk = st.lados[0].units[0], e = st.lados[1].units;
  ok(E.bonusDanoDeclarativo(st, atk, e[0]) === 0, 'nenhum Encharcado: +0');
  e[0].efeitos.push({ type: 'encharcado', dur: 2 });
  ok(E.bonusDanoDeclarativo(st, atk, e[0]) === 5, '1 inimigo Encharcado: +5');
  e[1].efeitos.push({ type: 'encharcado', dur: 2 }); e[2].efeitos.push({ type: 'encharcado', dur: 2 });
  ok(E.bonusDanoDeclarativo(st, atk, e[0]) === 15, '3 inimigos Encharcados: +15 (escopo timeInimigo conta unidades)');
  delete E.GODS.tps;
  console.log('  porStatus: MESMO source escala por efeitos-no-alvo (Erínias) e por unidades-com-status-no-lado (Ao Kuang)');
}

console.log('== F1.8 antirevive A (por-contador, Ah Puch): quem cai com Podridão não revive (snapshot na morte) ==');
{
  E.GODS.tap = { nome: 'TAp', faccao: 'T', elem: 'Umbra', classe: 'Mágico', funcao: 'Controlador', passiva: { nome: 'p', desc: 'd', fx: [{ gatilho: 'antiReviveContador', contador: 'podridao' }] } };
  const st = E.novoEstado(['tap', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 631);
  const ap = st.lados[0].units[0], comP = st.lados[1].units[0], semP = st.lados[1].units[1];
  comP.contadores.podridao = 1; comP.hp = 5; semP.hp = 5;
  E.aplicarFx(st, ap, [{ t: 'dmg', v: 20 }], { alvo: 'inimigo', slot: 'basico' }, [comP]);
  E.aplicarFx(st, ap, [{ t: 'dmg', v: 20 }], { alvo: 'inimigo', slot: 'basico' }, [semP]);
  ok(!comP.vivo && comP.naoRevive === true, `caiu COM Podridão → naoRevive (${comP.naoRevive})`);
  ok(!semP.vivo && !semP.naoRevive, `caiu SEM Podridão → revive livre (${semP.naoRevive})`);
  E.reviver(st, comP, { hp: 40 }); E.reviver(st, semP, { hp: 40 });
  ok(!comP.vivo, 'quem tinha Podridão continua caído após tentar reviver');
  ok(semP.vivo, 'quem não tinha revive normalmente');
  delete E.GODS.tap;
  console.log('  A: o contador declarado bloqueia o revive; snapshot no ato da morte');
}

console.log('== F1.8 antirevive B (aura, Cérberus): inimigo não revive enquanto o dono vive — DINÂMICO ==');
{
  E.GODS.tcb = { nome: 'TCb', faccao: 'T', elem: 'Umbra', classe: 'Físico', funcao: 'Guardião', passiva: { nome: 'p', desc: 'd', fx: [{ gatilho: 'antiReviveAura' }] } };
  const st = E.novoEstado(['tcb', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 632);
  const cb = st.lados[0].units[0], foe = st.lados[1].units[0];
  foe.vivo = false; foe.hp = 0;
  E.reviver(st, foe, { hp: 40 });
  ok(!foe.vivo, 'com o dono da aura VIVO, o inimigo não revive');
  cb.vivo = false;   // aura cai
  E.reviver(st, foe, { hp: 40 });
  ok(foe.vivo, 'com o dono da aura MORTO, o revive volta (aura é dinâmica, não snapshot)');
  delete E.GODS.tcb;
  console.log('  B: aura checada no ato do revive; o próprio aliado da aura não é afetado (só inimigos)');
}

console.log('== F1.8 refleteControle (Perseu): a TENTATIVA é o gatilho — reflete MESMO com o dono imune ==');
{
  E.GODS.tpe = { nome: 'TPe', faccao: 'T', elem: 'Aurora', classe: 'Físico', funcao: 'Atacante', passiva: { nome: 'p', desc: 'd', fx: [{ gatilho: 'imunidade', a: ['atordoado'] }, { gatilho: 'refleteControle', a: ['atordoado'], dur: 1 }] } };
  let st = E.novoEstado(['tpe', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 633);
  const per = st.lados[0].units[0], atk = st.lados[1].units[0];
  E.aplicarFx(st, atk, [{ t: 'apply', eff: { type: 'atordoado', dur: 2 } }], { alvo: 'inimigo', slot: 'habilidade' }, [per]);
  ok(!E.ef(per, 'atordoado'), 'o dono é imune — não é atordoado');
  ok(!!E.ef(atk, 'atordoado'), 'quem TENTOU leva o atordoar de volta (reflete mesmo com a falha por imunidade)');
  // controle FORA de `a` não reflete
  st = E.novoEstado(['tpe', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 634);
  const per2 = st.lados[0].units[0], atk2 = st.lados[1].units[0];
  E.aplicarFx(st, atk2, [{ t: 'apply', eff: { type: 'selado', dur: 2 } }], { alvo: 'inimigo', slot: 'habilidade' }, [per2]);
  ok(!E.ef(atk2, 'selado'), 'controle fora de `a` (selado) não é refletido');
  ok(!!E.ef(per2, 'selado'), 'e o dono, não sendo imune a ele, o recebe normalmente');
  delete E.GODS.tpe;
  console.log('  refleteControle: dispara na tentativa (antes da imunidade), escopado por `a`, sem loop (refletido)');
}

console.log('== F1.8 vulnerabilidade por-função (Aquiles): +v só de atacantes da função (lê o atacante) ==');
{
  E.GODS.taq = { nome: 'TAq', faccao: 'T', elem: 'Chama', classe: 'Físico', funcao: 'Atacante', passiva: { nome: 'p', desc: 'd', fx: [{ gatilho: 'reducao', v: 12 }, { gatilho: 'vulnerabilidade', v: 10, deFuncao: 'Manipulador' }] } };
  E.GODS.tman = { nome: 'TMan', faccao: 'T', elem: 'Chama', classe: 'Físico', funcao: 'Manipulador', passiva: { nome: '-', desc: '-' } };
  E.GODS.tatk = { nome: 'TAtk', faccao: 'T', elem: 'Chama', classe: 'Físico', funcao: 'Atacante', passiva: { nome: '-', desc: '-' } };
  const st = E.novoEstado(['taq', 'zeus', 'zeus'], ['tman', 'tatk', 'zeus'], 635);
  const aq = st.lados[0].units[0], man = st.lados[1].units[0], atk = st.lados[1].units[1];
  let h = aq.hp; E.aplicarFx(st, man, [{ t: 'dmg', v: 20 }], { alvo: 'inimigo', slot: 'basico' }, [aq]);
  ok(h - aq.hp === 18, `Manipulador: 20 +10 vuln -12 red = 18 (${h - aq.hp})`);
  h = aq.hp; E.aplicarFx(st, atk, [{ t: 'dmg', v: 20 }], { alvo: 'inimigo', slot: 'basico' }, [aq]);
  ok(h - aq.hp === 8, `Atacante: 20 -12 red, sem vuln = 8 (${h - aq.hp})`);
  delete E.GODS.taq; delete E.GODS.tman; delete E.GODS.tatk;
  console.log('  vulnerabilidade: lê a FUNÇÃO do atacante (eixo distinto do contra do reducao)');
}

console.log('== F1.8 amplificaDot (Kagutsuchi): +v em todo tick de queimadura no campo, enquanto o dono vive ==');
{
  E.GODS.tka = { nome: 'TKa', faccao: 'T', elem: 'Chama', classe: 'Mágico', funcao: 'Atacante', passiva: { nome: 'p', desc: 'd', fx: [{ gatilho: 'amplificaDot', nome: 'queimadura', v: 4 }] } };
  const st = E.novoEstado(['tka', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 636);
  const ka = st.lados[0].units[0], foe = st.lados[1].units[0];
  foe.dots.push({ nome: 'queimadura', v: 8, dur: 3 });
  let h = foe.hp; st.ativo = 1; E.iniciarTurno(st);
  ok(h - foe.hp === 12, `com o dono vivo: queimadura 8+4 = 12 (${h - foe.hp})`);
  ka.vivo = false;
  foe.dots = [{ nome: 'queimadura', v: 8, dur: 3 }]; h = foe.hp; st.ativo = 1; E.iniciarTurno(st);
  ok(h - foe.hp === 8, `com o dono morto: queimadura volta a 8 (${h - foe.hp})`);
  // veneno NÃO é amplificado (só queimadura)
  const st2 = E.novoEstado(['tka', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 637);
  const f2 = st2.lados[1].units[0]; f2.dots.push({ nome: 'veneno', v: 8, dur: 3 });
  h = f2.hp; st2.ativo = 1; E.iniciarTurno(st2);
  ok(h - f2.hp === 8, `veneno não é amplificado (nome: queimadura só) (${h - f2.hp})`);
  delete E.GODS.tka;
  console.log('  amplificaDot: field-wide enquanto vivo, escopado pelo nome do DoT');
}

console.log('== F1.8 aCadaN faz (Inari): a cadência ABSOLUTA dispara um faz (orbe periódico), não só zera custo ==');
{
  // time sem membro Verdejante: a geração normal nunca sorteia Verdejante, então o único
  // orbe Verdejante possível vem do faz com para:'Verdejante' — isola o efeito da cadência.
  E.GODS.tin = { nome: 'TIn', faccao: 'T', elem: 'Chama', classe: 'Mágico', funcao: 'Suporte', passiva: { nome: 'p', desc: 'd', fx: [{ gatilho: 'aCadaN', n: 3, faz: [{ t: 'orbGain', n: 1, para: 'Verdejante' }] }] } };
  const st = E.novoEstado(['tin', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 640);
  st.ativo = 0;
  st.turno = 2; let v = st.lados[0].orbs.Verdejante; E.iniciarTurno(st);
  ok(st.lados[0].orbs.Verdejante === v, `turno 2 (2%3≠0): nenhum orbe Verdejante extra (${st.lados[0].orbs.Verdejante - v})`);
  st.turno = 3; v = st.lados[0].orbs.Verdejante; E.iniciarTurno(st);
  ok(st.lados[0].orbs.Verdejante === v + 1, `turno 3 (3%3=0): +1 orbe Verdejante do faz (${st.lados[0].orbs.Verdejante - v})`);
  delete E.GODS.tin;
  console.log('  aCadaN.faz: dispara em turno%n==0; para:Verdejante é FIXO (o outro ramo do aCadaN, o custoGratis, é o §9)');
}

console.log('== F1.8 sinergiaAliado (Inari→Kitsune): no 1º turno o aliado NOMEADO ganha o contador; sem ele, no-op ==');
{
  E.GODS.tin2 = { nome: 'TIn2', faccao: 'T', elem: 'Verdejante', classe: 'Mágico', funcao: 'Suporte', passiva: { nome: 'p', desc: 'd', fx: [{ gatilho: 'sinergiaAliado', aliado: 'tks', contador: 'cauda', v: 1 }] } };
  E.GODS.tks = { nome: 'TKs', faccao: 'T', elem: 'Verdejante', classe: 'Físico', funcao: 'Atacante', passiva: { nome: '-', desc: '-' } };
  const st = E.novoEstado(['tin2', 'tks', 'zeus'], ['zeus', 'zeus', 'zeus'], 641);
  const ks = st.lados[0].units[1];
  st.ativo = 0; E.iniciarTurno(st);
  ok((ks.contadores.cauda || 0) === 1, `Kitsune começa com 1 Cauda quando a Inari está no time (${ks.contadores.cauda || 0})`);
  // sem a Inari: a Kitsune não recebe Cauda de sinergia
  const st2 = E.novoEstado(['tks', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 642);
  const ks2 = st2.lados[0].units[0];
  st2.ativo = 0; E.iniciarTurno(st2);
  ok((ks2.contadores.cauda || 0) === 0, `sem a Inari, a Kitsune não ganha Cauda (${ks2.contadores.cauda || 0})`);
  delete E.GODS.tin2; delete E.GODS.tks;
  console.log('  sinergiaAliado: só no primeiro turno (primeiro), acha o aliado por key; sem o aliado nomeado é no-op');
}

console.log('== F1.9-pre marca ofensiva: RÓTULO puro lido por alvoMarca; nome=etiqueta, qualquer=guarda-chuva (§83) ==');
{
  E.GODS.tho = { nome: 'THo', faccao: 'T', elem: 'Aurora', classe: 'Físico', funcao: 'Atacante', passiva: { nome: 'p', desc: 'd', fx: [{ gatilho: 'bonusDano', quando: { alvoMarca: 'olho' }, v: 8 }] } };
  E.GODS.thq = { nome: 'THq', faccao: 'T', elem: 'Aurora', classe: 'Físico', funcao: 'Atacante', passiva: { nome: 'p', desc: 'd', fx: [{ gatilho: 'bonusDano', quando: { alvoMarca: 'qualquer' }, v: 8 }] } };
  const st = E.novoEstado(['tho', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 650);
  const ho = st.lados[0].units[0], foe = st.lados[1].units[0];
  let h = foe.hp; E.aplicarFx(st, ho, [{ t: 'dmg', v: 10 }], { alvo: 'inimigo', slot: 'basico' }, [foe]);
  ok(h - foe.hp === 10, `sem marca: 10, sem +8 (${h - foe.hp})`);
  // a marca 'olho' aplicada sozinha é RÓTULO: não causa dano por si — o +8 vem do bonusDano
  foe.efeitos.push({ type: 'olho', dur: 2 });
  h = foe.hp; E.aplicarFx(st, ho, [{ t: 'dmg', v: 10 }], { alvo: 'inimigo', slot: 'basico' }, [foe]);
  ok(h - foe.hp === 18, `com olho: 10 +8; a marca é rótulo, o +dano é do bonusDano (${h - foe.hp})`);
  // ETIQUETAS distintas (§54): quem lê 'olho' NÃO dispara contra 'marcado'
  const st2 = E.novoEstado(['tho', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 651);
  const ho2 = st2.lados[0].units[0], f2 = st2.lados[1].units[0]; f2.efeitos.push({ type: 'marcado', dur: 2 });
  h = f2.hp; E.aplicarFx(st2, ho2, [{ t: 'dmg', v: 10 }], { alvo: 'inimigo', slot: 'basico' }, [f2]);
  ok(h - f2.hp === 10, `'olho' específico não dispara contra 'marcado' — etiquetas distintas (${h - f2.hp})`);
  // GUARDA-CHUVA 'qualquer': pune a marca de OUTRO deus (vocabulário compartilhado, §83)
  const st3 = E.novoEstado(['thq', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 652);
  const hq3 = st3.lados[0].units[0], f3 = st3.lados[1].units[0]; f3.efeitos.push({ type: 'marcado', dur: 2 });
  h = f3.hp; E.aplicarFx(st3, hq3, [{ t: 'dmg', v: 10 }], { alvo: 'inimigo', slot: 'basico' }, [f3]);
  ok(h - f3.hp === 18, `'qualquer' pune 'marcado' de outro deus — marca é vocabulário compartilhado (${h - f3.hp})`);
  // decisão (a): vulneravel IRMÃO — o +dano all-source soma por fora, a marca não o carrega
  const st4 = E.novoEstado(['zeus', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 653);
  const atk4 = st4.lados[0].units[0], f4 = st4.lados[1].units[0];
  f4.efeitos.push({ type: 'olho', dur: 2 }); f4.efeitos.push({ type: 'vulneravel', v: 8, dur: 2 });
  h = f4.hp; E.aplicarFx(st4, atk4, [{ t: 'dmg', v: 10 }], { alvo: 'inimigo', slot: 'basico' }, [f4]);
  ok(h - f4.hp === 18, `olho(rótulo)+vulneravel(irmão): 10 +8 all-source; a marca não duplica (${h - f4.hp})`);
  delete E.GODS.tho; delete E.GODS.thq;
  console.log('  marca = rótulo puro; alvoMarca:nome é etiqueta (§54), :qualquer é guarda-chuva compartilhado (§83)');
}

console.log('== §61 imunidade a EXECUÇÃO exercitada por KIT REAL (Sun Wukong): construída há sessões, nunca provada ==');
{
  // Sun Wukong tem imunidade:{a:['execucao']}. Abaixo do limiar, a execução NÃO o mata; um zeus sem imunidade morre.
  const st = E.novoEstado(['sunwukong', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 640);
  const wk = st.lados[0].units[0], atk = st.lados[1].units[0];
  wk.hp = 20;
  E.aplicarFx(st, atk, [{ t: 'dmg', v: 5, executaAbaixoDe: 24 }], { alvo: 'inimigo', slot: 'milagre' }, [wk]);
  ok(wk.vivo && wk.hp === 15, `Sun Wukong com HP 15 (≤24) NÃO é executado — imunidade a execucao (${wk.vivo}/${wk.hp})`);
  const st2 = E.novoEstado(['zeus', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 641);
  const z = st2.lados[0].units[0], a2 = st2.lados[1].units[0]; z.hp = 20;
  E.aplicarFx(st2, a2, [{ t: 'dmg', v: 5, executaAbaixoDe: 24 }], { alvo: 'inimigo', slot: 'milagre' }, [z]);
  ok(!z.vivo, 'controle: zeus SEM imunidade É executado — o mecanismo dispara de fato (não é falso-verde)');
  console.log('  §61 confirmado: a imunidade-a-execução funciona; primeiro kit real a exercê-la');
}

console.log('== §89 Yan Wong: Livro É execução; naoRevive-em-apply (§61); orbe-por-execução uniforme ==');
{
  const hab = E.GODS.yanwong.ab.find(a => a.slot === 'habilidade').fx;
  // §61: aplicar efeito com naoRevive nunca fora exercitado por kit. Livro mata pelo timer → execução + naoRevive.
  let st = E.novoEstado(['yanwong', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 400);
  let yw = st.lados[0].units[0], foe = st.lados[1].units[0];
  E.aplicarFx(st, yw, hab, { alvo: 'inimigo', slot: 'habilidade' }, [foe]);
  ok(E.ef(foe, 'livro') && E.ef(foe, 'livro').naoRevive === true, 'habilidade aplica livro COM naoRevive (§61: 1º kit a exercê-lo)');
  ok(!!E.ef(foe, 'vulneravel'), 'e o vulneravel irmão (+8 enquanto marcado, decisão-(a) do §83)');
  E.ef(foe, 'livro').dur = 1; st.ativo = 1; E.fimTurno(st);
  ok(!foe.vivo && foe.naoRevive === true, 'Livro mata (timer) E sela naoRevive');
  E.reviver(st, foe, { hp: 40 });
  ok(!foe.vivo, 'não revive sob o Livro — só a execução entrega morte definitiva');
  // Livro É execução: o Sun Wukong (imune a execução) é o COUNTER estrutural
  st = E.novoEstado(['yanwong', 'zeus', 'zeus'], ['sunwukong', 'zeus', 'zeus'], 401);
  yw = st.lados[0].units[0]; const wk = st.lados[1].units[0];
  E.aplicarFx(st, yw, hab, { alvo: 'inimigo', slot: 'habilidade' }, [wk]);
  E.ef(wk, 'livro').dur = 1; st.ativo = 1; E.fimTurno(st);
  ok(wk.vivo, 'Sun Wukong SOBREVIVE ao Livro (imune a execução) — o counter estrutural (§89: parece bug, é design)');
  // vidaExtra NÃO salva do Livro (execução fura vidaExtra — senão a vítima sobreviveria e a cláusula anti-revive nunca valeria)
  st = E.novoEstado(['yanwong', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 402);
  yw = st.lados[0].units[0]; foe = st.lados[1].units[0]; foe.vidaExtra = { hp: 30 };
  E.aplicarFx(st, yw, hab, { alvo: 'inimigo', slot: 'habilidade' }, [foe]);
  E.ef(foe, 'livro').dur = 1; st.ativo = 1; E.fimTurno(st);
  ok(!foe.vivo, 'vidaExtra NÃO salva do Livro — a morte é definitiva');
  // orbe-por-execução UNIFORME: dispara em QUALQUER execução (aqui via executaAbaixoDe, isolado de fimTurno)
  st = E.novoEstado(['yanwong', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 403);
  yw = st.lados[0].units[0]; foe = st.lados[1].units[0]; foe.hp = 20;
  const orbes0 = Object.values(st.lados[0].orbs).reduce((a, b) => a + b, 0);
  E.aplicarFx(st, yw, [{ t: 'dmg', v: 5, executaAbaixoDe: 24 }], { alvo: 'inimigo', slot: 'milagre' }, [foe]);
  const orbes1 = Object.values(st.lados[0].orbs).reduce((a, b) => a + b, 0);
  ok(!foe.vivo && orbes1 - orbes0 === 1, `execução de OUTRA fonte (executaAbaixoDe) também dá +1 orbe: leitura literal de "por execução" (${orbes1 - orbes0})`);
  // aceleraLivro: dur -= 1 (piso 1)
  st = E.novoEstado(['yanwong', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 404);
  yw = st.lados[0].units[0]; foe = st.lados[1].units[0]; foe.efeitos.push({ type: 'livro', dur: 3, naoRevive: true });
  E.aplicarFx(st, yw, [{ t: 'aceleraLivro', escopo: 'todosInimigos' }], { alvo: 'todosInimigos', slot: 'milagre' }, []);
  ok(E.ef(foe, 'livro').dur === 2, `aceleraLivro: 3 → 2 (${E.ef(foe, 'livro').dur})`);
  console.log('  Livro é execução (Wukong imune, vidaExtra não salva, naoRevive vale); orbe uniforme; aceleraLivro piso 1');
}

console.log('== §91 Shiva: ignora-Invulnerabilidade (flag de habilidade) + ignora-piso (§61, 1º kit); puro fura escudo ==');
{
  const mil = E.GODS.shiva.ab.find(a => a.slot === 'milagre').fx;
  // ignora-Invuln: o milagre fura Invulnerabilidade (o golpe normal NÃO)
  let st = E.novoEstado(['shiva', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 500);
  let s = st.lados[0].units[0], foe = st.lados[1].units[0]; foe.efeitos.push({ type: 'invulneravel', dur: 2 });
  let h = foe.hp; E.aplicarFx(st, s, mil, { alvo: 'inimigo', slot: 'milagre' }, [foe]);
  ok(h - foe.hp === 45, `milagre FURA Invulnerabilidade: 45 (${h - foe.hp})`);
  st = E.novoEstado(['shiva', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 501);
  s = st.lados[0].units[0]; foe = st.lados[1].units[0]; foe.efeitos.push({ type: 'invulneravel', dur: 2 });
  h = foe.hp; E.aplicarFx(st, s, [{ t: 'dmg', v: 20 }], { alvo: 'inimigo', slot: 'basico' }, [foe]);
  ok(h - foe.hp === 0, `golpe normal (sem a flag) continua BARRADO por Invulnerabilidade (${h - foe.hp})`);
  // §61: ignora-piso — a flag existia em opts, nenhum kit a exercia. Shiva é o 1º: fura o 'não cai abaixo de 1 HP'
  st = E.novoEstado(['shiva', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 502);
  s = st.lados[0].units[0]; foe = st.lados[1].units[0]; foe.hp = 5; foe.efeitos.push({ type: 'pisoVida', dur: 2 });
  E.aplicarFx(st, s, mil, { alvo: 'inimigo', slot: 'milagre' }, [foe]);
  ok(!foe.vivo, 'FURA o piso (não cai abaixo de 1 HP): mata mesmo com pisoVida — §61, 1º kit a exercê-lo');
  // Defesa Destrutível: kind:puro fura o escudo (sem consumi-lo)
  st = E.novoEstado(['shiva', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 503);
  s = st.lados[0].units[0]; foe = st.lados[1].units[0]; foe.shield = 20; h = foe.hp;
  E.aplicarFx(st, s, mil, { alvo: 'inimigo', slot: 'milagre' }, [foe]);
  ok(h - foe.hp === 45 && foe.shield === 20, `puro FURA a Defesa Destrutível: 45 no HP, escudo intacto (${h - foe.hp}/${foe.shield})`);
  // permanente por uso (padrão Brahma): dmgUp empilha
  st = E.novoEstado(['shiva', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 504);
  s = st.lados[0].units[0];
  const hab = E.GODS.shiva.ab.find(a => a.slot === 'habilidade').fx;
  E.aplicarFx(st, s, hab, { alvo: 'todosInimigos', slot: 'habilidade' }, st.lados[1].units);
  E.aplicarFx(st, s, hab, { alvo: 'todosInimigos', slot: 'habilidade' }, st.lados[1].units);
  ok(E.ef(s, 'dmgUp') && E.ef(s, 'dmgUp').v === 12, `+6 permanente acumula: 2 usos = 12 (${E.ef(s, 'dmgUp') && E.ef(s, 'dmgUp').v})`);
  console.log('  ignoraInvuln fura só com a flag; ignora-piso exercitado (§61); puro fura escudo; +6 permanente acumula');
}

console.log('== §91 Odin: faccaoConta (2+ Nórdicos → orbe na abertura), marca+time-bônus, ignora-Invuln no básico ==');
{
  // faccaoConta ISOLADO com um Nórdico sintético inerte: 2+ → +1 orbe na abertura; <2 → nada. (novoEstado já roda a abertura)
  E.GODS.tnord = { nome: 'TNord', faccao: 'Nórdica', elem: 'Umbra', classe: 'Mágico', funcao: 'Suporte', passiva: { nome: '-', desc: '-' }, ab: [] };
  const orbs = team => Object.values(E.novoEstado(team, ['zeus', 'zeus', 'zeus'], 700).lados[0].orbs).reduce((a, b) => a + b, 0);
  ok(orbs(['odin', 'tnord', 'zeus']) === 2, `2 Nórdicos: 1 abertura + 1 extra = 2 (${orbs(['odin', 'tnord', 'zeus'])})`);
  ok(orbs(['odin', 'zeus', 'zeus']) === 1, `1 Nórdico: só a abertura = 1, sem extra (${orbs(['odin', 'zeus', 'zeus'])})`);
  delete E.GODS.tnord;
  // marca (habilidade) + time causa +6 contra marcados (passiva bonusDano escopo:time)
  let st = E.novoEstado(['odin', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 602);
  const o = st.lados[0].units[0], ally = st.lados[0].units[1], foe = st.lados[1].units[0];
  E.aplicarFx(st, o, E.GODS.odin.ab.find(a => a.slot === 'habilidade').fx, { alvo: 'todosInimigos', slot: 'habilidade' }, st.lados[1].units);
  ok(!!E.ef(foe, 'marcado'), 'habilidade marca todos os inimigos');
  let h = foe.hp; E.aplicarFx(st, ally, [{ t: 'dmg', v: 10 }], { alvo: 'inimigo', slot: 'basico' }, [foe]);
  ok(h - foe.hp === 16, `ALIADO do Odin causa +6 contra marcado: 10+6 = 16 (${h - foe.hp})`);
  // ignora-Invuln no básico
  st = E.novoEstado(['odin', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 603);
  const o2 = st.lados[0].units[0], f2 = st.lados[1].units[0]; f2.efeitos.push({ type: 'invulneravel', dur: 2 });
  h = f2.hp; E.aplicarFx(st, o2, E.GODS.odin.ab.find(a => a.slot === 'basico').fx, { alvo: 'inimigo', slot: 'basico' }, [f2]);
  ok(h - f2.hp === 15, `básico fura Invulnerabilidade: 15 (${h - f2.hp})`);
  console.log('  faccaoConta gateia por facção (small-serve-um); marca+time-bônus; ignora-Invuln no básico');
}

console.log('== §96 Amaterasu: Amanhecer ativa o Dia + cura; passiva reducao-no-Dia; Luz da Caverna 28+trava no Dia ==');
{
  const hab = E.GODS.amaterasu.ab.find(a => a.slot === 'habilidade').fx;
  const mil = E.GODS.amaterasu.ab.find(a => a.slot === 'milagre').fx;
  // Amanhecer: ativa o Dia por 3 e cura 12 no time
  let st = E.novoEstado(['amaterasu', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 700);
  let a = st.lados[0].units[0], ally = st.lados[0].units[1]; a.hp = 80; ally.hp = 80;
  E.aplicarFx(st, a, hab, { alvo: 'nenhum', slot: 'habilidade' }, []);
  ok(st.fase === 'Dia' && st.faseDur === 3, `Amanhecer ativa o Dia por 3 (${st.fase}/${st.faseDur})`);
  ok(a.hp === 92 && ally.hp === 92, `e cura 12 no time (${a.hp}/${ally.hp})`);
  // passiva reducao 6 durante o Dia: um atacante REDUZÍVEL (zeus) bate 20 → 14; sem a Amaterasu viva, 20
  const foe = st.lados[1].units[0]; let h = ally.hp;
  E.bater(st, foe, ally, 20, 'afetado', 'basico', { semContra: true });
  ok(h - ally.hp === 14, `passiva: 6 de redução ao time no Dia (20→14): ${h - ally.hp}`);
  a.vivo = false; h = ally.hp;
  E.bater(st, foe, ally, 20, 'afetado', 'basico', { semContra: true });
  ok(h - ally.hp === 20, `redução some quando a Amaterasu cai (fonte da passiva): ${h - ally.hp}`);
  // Luz da Caverna: 18 fora do Dia; 28 + trava-Habilidade no Dia
  st = E.novoEstado(['amaterasu', 'zeus', 'zeus'], ['tyr', 'tyr', 'tyr'], 701);  // tyr defensor: dano reduzível não confunde (é o atacante que importa)
  a = st.lados[0].units[0]; let e0 = st.lados[1].units[0]; h = e0.hp;
  E.aplicarFx(st, a, mil, { alvo: 'todosInimigos', slot: 'milagre' }, st.lados[1].units);
  ok(h - e0.hp === 18 && !E.ef(e0, 'lockSkill'), `fora do Dia: 18 e SEM trava (${h - e0.hp})`);
  st = E.novoEstado(['amaterasu', 'zeus', 'zeus'], ['tyr', 'tyr', 'tyr'], 702);
  a = st.lados[0].units[0]; e0 = st.lados[1].units[0]; E.definirFase(st, 'Dia', 3);
  E.ELEMS.forEach(x => st.lados[1].orbs[x] = 9);   // energia p/ o inimigo: assim o único bloqueio da Habilidade é a TRAVA, não falta de orbe
  h = e0.hp;
  E.aplicarFx(st, a, mil, { alvo: 'todosInimigos', slot: 'milagre' }, st.lados[1].units);
  // 28 (seDia) + 8 (a própria Amaterasu é Aurora e bate mais no SEU Dia — payload §96 aplica ao atacante Aurora) = 36
  ok(h - e0.hp === 36 && !!E.ef(e0, 'lockSkill'), `no Dia: 28+8(payload Aurora)=36 e trava a Habilidade de todos (${h - e0.hp}/${!!E.ef(e0, 'lockSkill')})`);
  const hab2 = E.acoesDe(st, e0).find(x => x.slot === 'habilidade');
  ok(!hab2.disponivel && hab2.motivo === 'travada', `e a Habilidade travada fica indisponível (${hab2.motivo})`);
  console.log('  Amanhecer→Dia+cura · reducao-no-Dia (some com a fonte) · Luz da Caverna 18→36(28+payload) e trava no Dia');
}

console.log('== §97 Tsukuyomi: passiva +10 a curado-no-anterior; Anoitecer escreve a Noite + adormece; Julgamento silencia na Noite ==');
{
  // passiva pelo caminho REAL da batalha: inimigo curado, gira o turno, Tsukuyomi bate +10 (e a Noite não interfere: alvo Umbra? não — o payload some sem fase)
  let st = E.novoEstado(['tsukuyomi', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 720);
  let t = st.lados[0].units[0], foe = st.lados[1].units[0]; foe.hp = 50;
  E.aplicarFx(st, foe, [{ t: 'heal', v: 20, escopo: 'self' }], { alvo: 'nenhum' }, []);
  st.ativo = 1; E.iniciarTurno(st);   // promove o rastreio do inimigo (lado inativo)
  let h = foe.hp; E.aplicarFx(st, t, E.GODS.tsukuyomi.ab.find(a => a.slot === 'basico').fx, { alvo: 'inimigo', slot: 'basico' }, [foe]);
  ok(h - foe.hp === 22, `passiva: +10 contra curado-no-turno-anterior (12+10=22): ${h - foe.hp}`);
  // um inimigo NÃO curado no anterior: sem bônus
  const foe2 = st.lados[1].units[1]; h = foe2.hp;
  E.aplicarFx(st, t, E.GODS.tsukuyomi.ab.find(a => a.slot === 'basico').fx, { alvo: 'inimigo', slot: 'basico' }, [foe2]);
  ok(h - foe2.hp === 12, `sem cura no anterior: 12, sem bônus (${h - foe2.hp})`);

  // Anoitecer: escreve a Noite (escritor da metade que estava ociosa) + adormece 1 inimigo
  st = E.novoEstado(['tsukuyomi', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 721);
  t = st.lados[0].units[0]; foe = st.lados[1].units[0];
  E.aplicarFx(st, t, E.GODS.tsukuyomi.ab.find(a => a.slot === 'habilidade').fx, { alvo: 'inimigo', slot: 'habilidade' }, [foe]);
  ok(st.fase === 'Noite' && st.faseDur === 3, `Anoitecer escreve a Noite por 3 (${st.fase}/${st.faseDur})`);
  ok(!!E.ef(foe, 'adormecido'), 'e adormece o inimigo alvo');
  // na Noite o payload vale: um Umbra bate +8 (a própria Tsukuyomi é Umbra)
  const h2 = st.lados[1].units[1].hp;
  E.aplicarFx(st, t, [{ t: 'dmg', v: 12 }], { alvo: 'inimigo', slot: 'basico' }, [st.lados[1].units[1]]);
  ok(h2 - st.lados[1].units[1].hp === 20, `Noite acordada: Tsukuyomi (Umbra) bate 12+8=20 (${h2 - st.lados[1].units[1].hp})`);

  // Julgamento da Lua: 18 área; na Noite, Silencia (selado) todos
  st = E.novoEstado(['tsukuyomi', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 722);
  t = st.lados[0].units[0]; const mil = E.GODS.tsukuyomi.ab.find(a => a.slot === 'milagre').fx;
  let e0 = st.lados[1].units[0]; h = e0.hp;
  E.aplicarFx(st, t, mil, { alvo: 'todosInimigos', slot: 'milagre' }, st.lados[1].units);
  ok(h - e0.hp === 18 && !E.ef(e0, 'selado'), `fora da Noite: 18 e SEM silêncio (${h - e0.hp})`);
  st = E.novoEstado(['tsukuyomi', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 723);
  t = st.lados[0].units[0]; E.definirFase(st, 'Noite', 3); e0 = st.lados[1].units[0]; h = e0.hp;
  E.aplicarFx(st, t, mil, { alvo: 'todosInimigos', slot: 'milagre' }, st.lados[1].units);
  // 18 + 8 (Tsukuyomi Umbra na sua Noite) = 26; e silencia todos
  ok(h - e0.hp === 26 && !!E.ef(e0, 'selado'), `na Noite: 18+8(payload)=26 e Silencia todos (${h - e0.hp}/${!!E.ef(e0, 'selado')})`);
  console.log('  passiva +10 a curado-no-anterior · Anoitecer acorda a Noite + adormece · Julgamento silencia na Noite');
}

console.log('== §99 dominar: Afrodite (fechada retroativamente) e Boto (lifesteal + Noite +1) — a órfã mais antiga (§71) ==');
{
  // Afrodite RETROATIVA: o Encanto antes era inerte (só aplicava a tag); agora a vítima bate no aliado dela.
  let st = E.novoEstado(['afrodite', 'zeus', 'zeus'], ['perseu', 'babi', 'tyr'], 900);
  let a = st.lados[0].units[0], vitima = st.lados[1].units[0], aliado = st.lados[1].units[1];
  let h = aliado.hp;
  E.aplicarFx(st, a, E.GODS.afrodite.ab.find(x => x.slot === 'habilidade').fx, { alvo: '2inimigos', slot: 'habilidade' }, [vitima, aliado]);
  ok(h - aliado.hp === 12 && !!E.ef(vitima, 'dominado'), `Afrodite: a vítima usa o Básico dela (12) no aliado, e fica dominada (${h - aliado.hp})`);

  // Boto: lifesteal do golpe-fantoche + Baile
  st = E.novoEstado(['boto', 'zeus', 'zeus'], ['perseu', 'babi', 'tyr'], 901);
  const b = st.lados[0].units[0]; b.hp = 40; vitima = st.lados[1].units[0]; aliado = st.lados[1].units[1];
  h = aliado.hp;
  E.aplicarFx(st, b, E.GODS.boto.ab.find(x => x.slot === 'habilidade').fx, { alvo: '2inimigos', slot: 'habilidade' }, [vitima, aliado]);
  ok(h - aliado.hp === 12 && b.hp === 52, `Boto: golpe 12 no aliado e Boto dreba (40+12=52): ${h - aliado.hp}/${b.hp}`);

  // Boto milagre: trava o Milagre de todos + cura o time
  st = E.novoEstado(['boto', 'zeus', 'zeus'], ['perseu', 'babi', 'tyr'], 902);
  const b2 = st.lados[0].units[0], ally2 = st.lados[0].units[1]; ally2.hp = 60;
  E.ELEMS.forEach(x => st.lados[1].orbs[x] = 9);
  E.aplicarFx(st, b2, E.GODS.boto.ab.find(x => x.slot === 'milagre').fx, { alvo: 'todosInimigos', slot: 'milagre' }, st.lados[1].units);
  const mil = E.acoesDe(st, st.lados[1].units[0]).find(x => x.slot === 'milagre');
  ok(!mil.disponivel && mil.motivo === 'travada' && ally2.hp === 75, `Festa de São João: Milagre inimigo travado e time curado 15 (${mil.motivo}/${ally2.hp})`);
  console.log('  Afrodite fechada (vítima bate no aliado) · Boto dreba o golpe · milagre trava Milagre + cura');
}

console.log('== §101 Chang’e: recarga condicional (Elixir 3→2 com Hou Yi) + +8 com Hou Yi + Luz do Jade 20/30 na Noite ==');
{
  const acao = (st, u, slot) => E.acoesDe(st, u).find(a => a.slot === slot);
  // cd condicional por composição de time (a gaveta do §101): sem Hou Yi 3, com Hou Yi 2
  let st = E.novoEstado(['change', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 950);
  ok(acao(st, st.lados[0].units[0], 'habilidade').cd === 3, 'Elixir sem Hou Yi: recarga 3');
  st = E.novoEstado(['change', 'houyi', 'zeus'], ['zeus', 'zeus', 'zeus'], 951);
  ok(acao(st, st.lados[0].units[0], 'habilidade').cd === 2, 'Elixir com Hou Yi: recarga 2 (cdSe por aliadoPresente)');

  // Elixir aplica pisoVida (não cai abaixo de 1) no aliado escolhido
  st = E.novoEstado(['change', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 952);
  const ch = st.lados[0].units[0], ally = st.lados[0].units[1];
  E.aplicarFx(st, ch, E.GODS.change.ab.find(a => a.slot === 'habilidade').fx, { alvo: 'aliado', slot: 'habilidade' }, [ally]);
  ally.hp = 1; E.bater(st, st.lados[1].units[0], ally, 999, 'afetado', 'basico', {});
  ok(ally.vivo && ally.hp === 1, 'Elixir: pisoVida segura o aliado em 1 de HP');

  // passiva +8 só com Hou Yi no time (escopo self — a metade fiel que mora na Chang’e; ver §101)
  st = E.novoEstado(['change', 'houyi', 'zeus'], ['zeus', 'zeus', 'zeus'], 953);
  let c = st.lados[0].units[0], foe = st.lados[1].units[0], h = foe.hp;
  E.bater(st, c, foe, 10, 'afetado', 'basico', {});
  ok(h - foe.hp === 18, `+8 com Hou Yi no time: 10+8=18 (${h - foe.hp})`);
  st = E.novoEstado(['change', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 954);
  c = st.lados[0].units[0]; foe = st.lados[1].units[0]; h = foe.hp;
  E.bater(st, c, foe, 10, 'afetado', 'basico', {});
  ok(h - foe.hp === 10, `sem Hou Yi: 10, sem bônus (${h - foe.hp})`);

  // Luz do Jade: 20 fora da Noite, 30 na Noite (+ regen no time)
  st = E.novoEstado(['change', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 955);
  c = st.lados[0].units[0]; c.hp = 50;
  E.aplicarFx(st, c, E.GODS.change.ab.find(a => a.slot === 'milagre').fx, { alvo: 'nenhum', slot: 'milagre' }, []);
  ok(c.hp === 70 && !!E.ef(c, 'regen'), `fora da Noite: cura 20 (50→70) e regen aplicado (${c.hp})`);
  st = E.novoEstado(['change', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 956); E.definirFase(st, 'Noite', 3);
  c = st.lados[0].units[0]; c.hp = 50;
  E.aplicarFx(st, c, E.GODS.change.ab.find(a => a.slot === 'milagre').fx, { alvo: 'nenhum', slot: 'milagre' }, []);
  ok(c.hp === 80, `na Noite: cura 30 (50→80): ${c.hp}`);
  console.log('  Elixir 3→2 com Hou Yi (cdSe) · pisoVida segura em 1 · +8 self com Hou Yi · Luz do Jade 20/30 na Noite');
}

console.log('== §103 Deméter: seletor-por-HP (aliado mais ferido cura 6 por turno) + regen no time + revive-ou-cura ==');
{
  // passiva porTurno: o aliado MAIS FERIDO cura 6 no início do turno da Deméter (o seletor por HP no faz)
  let st = E.novoEstado(['demeter', 'zeus', 'zeus'], ['tyr', 'tyr', 'tyr'], 970);
  let al = st.lados[0].units; al[0].hp = 100; al[1].hp = 25; al[2].hp = 90;
  st.ativo = 0; E.iniciarTurno(st);
  ok(al[1].hp === 31 && al[0].hp === 100 && al[2].hp === 90, `passiva: só o mais ferido (25→31) curou (${al.map(x => x.hp)})`);
  // empate no mais ferido → menor índice
  st = E.novoEstado(['demeter', 'zeus', 'zeus'], ['tyr', 'tyr', 'tyr'], 971);
  al = st.lados[0].units; al[0].hp = 40; al[1].hp = 40; al[2].hp = 100;
  st.ativo = 0; E.iniciarTurno(st);
  ok(al[0].hp === 46 && al[1].hp === 40, `empate no mais ferido: menor índice (0) cura, não o 1 (${al[0].hp}/${al[1].hp})`);

  // habilidade: regen 12 no time por 2 turnos
  st = E.novoEstado(['demeter', 'zeus', 'zeus'], ['tyr', 'tyr', 'tyr'], 972);
  const d = st.lados[0].units[0];
  E.aplicarFx(st, d, E.GODS.demeter.ab.find(a => a.slot === 'habilidade').fx, { alvo: 'nenhum', slot: 'habilidade' }, []);
  ok(st.lados[0].units.every(x => E.ef(x, 'regen') && E.ef(x, 'regen').v === 12), 'Dádiva: regen 12 em todo o time');

  // milagre: revive 1 caído (48) OU, sem caídos, cura 25 no time
  st = E.novoEstado(['demeter', 'zeus', 'zeus'], ['tyr', 'tyr', 'tyr'], 973);
  const d2 = st.lados[0].units[0], caido = st.lados[0].units[1]; caido.vivo = false; caido.hp = 0;
  E.aplicarFx(st, d2, E.GODS.demeter.ab.find(a => a.slot === 'milagre').fx, { alvo: 'nenhum', slot: 'milagre' }, []);
  ok(caido.vivo && caido.hp === 48, `milagre com caído: revive com 48 (${caido.vivo}/${caido.hp})`);
  st = E.novoEstado(['demeter', 'zeus', 'zeus'], ['tyr', 'tyr', 'tyr'], 974);
  const d3 = st.lados[0].units[0]; st.lados[0].units.forEach(x => x.hp = 50);
  E.aplicarFx(st, d3, E.GODS.demeter.ab.find(a => a.slot === 'milagre').fx, { alvo: 'nenhum', slot: 'milagre' }, []);
  ok(st.lados[0].units.every(x => x.hp === 75), `milagre sem caído: cura 25 no time (${st.lados[0].units.map(x => x.hp)})`);
  console.log('  aliado mais ferido cura 6/turno (empate=menor índice) · regen 12 no time · revive 48 ou cura 25');
}

console.log('== §105 Lugh (fechado: cd-condicional + seletor + semContra) + Thor migrado ao seletor geral ==');
{
  const orbs = l => { E.ELEMS.forEach(e => l.orbs[e] = 9); l.orbs.livre = 9; };
  // básico: não pode ser contra-atacado (semContra) nem evitado (ignoraInalvejavel)
  let st = E.novoEstado(['lugh', 'zeus', 'zeus'], ['atena', 'zeus', 'zeus'], 990); orbs(st.lados[0]);
  let lugh = st.lados[0].units[0], foe = st.lados[1].units[0];
  foe.efeitos.push({ type: 'contraAtaca', v: 10, dur: 9 }); foe.efeitos.push({ type: 'inalvejavel', dur: 9 });
  const hl = lugh.hp, hf = foe.hp;
  E.agir(st, lugh.uid, 'basico', [foe.uid]);
  ok(hl - lugh.hp === 0 && hf - foe.hp === 15, `básico: fura Inalvejável (15) e NÃO é contra-atacado (${hf - foe.hp}/${hl - lugh.hp})`);

  // milagre Funda de Balor: 38 puro ao de MAIOR HP + executa <=24
  st = E.novoEstado(['lugh', 'zeus', 'zeus'], ['tyr', 'tyr', 'tyr'], 991); orbs(st.lados[0]);
  lugh = st.lados[0].units[0]; let f = st.lados[1].units; f[0].hp = 100; f[1].hp = 20; f[2].hp = 60;
  E.agir(st, lugh.uid, 'milagre', []);
  ok(f[0].hp === 62 && f[1].hp === 20, `Funda: 38 ao de maior HP (100→62), não toca os outros (${f[0].hp})`);
  st = E.novoEstado(['lugh', 'zeus', 'zeus'], ['tyr', 'tyr', 'tyr'], 992); orbs(st.lados[0]);
  lugh = st.lados[0].units[0]; f = st.lados[1].units; f[0].hp = 24; f[1].hp = 10; f[2].hp = 8;
  E.agir(st, lugh.uid, 'milagre', []);
  ok(!f[0].vivo, 'Funda: o de maior HP com <=24 é ELIMINADO (executa)');

  // Samildánach: opcoes (GUERRA/CURA/FORJA) e cdSe 0 no Dia
  st = E.novoEstado(['lugh', 'zeus', 'zeus'], ['tyr', 'tyr', 'tyr'], 993); orbs(st.lados[0]);
  lugh = st.lados[0].units[0]; f = st.lados[1].units; const hh = f.map(x => x.hp);
  E.agir(st, lugh.uid, 'habilidade', [], 0);   // opção 0 = GUERRA (15 a todos)
  ok(f.every((x, i) => hh[i] - x.hp === 15), `Samildánach GUERRA: 15 a todos (${f.map((x, i) => hh[i] - x.hp)})`);
  E.definirFase(st, 'Dia', 3);
  ok(E.acoesDe(st, lugh).find(a => a.slot === 'habilidade').cd === 0, 'Samildánach sem recarga no Dia (cdSe)');

  // Thor MIGRADO: milagre atordoa o de menor HP via o seletor geral; e não atordoa invulnerável (esquisitice preservada)
  st = E.novoEstado(['thor', 'zeus', 'zeus'], ['tyr', 'tyr', 'tyr'], 994); orbs(st.lados[0]);
  const thor = st.lados[0].units[0]; f = st.lados[1].units; f[0].hp = 100; f[1].hp = 40; f[2].hp = 70;
  E.agir(st, thor.uid, 'milagre', []);
  ok(!!E.ef(f[1], 'atordoado') && !E.ef(f[0], 'atordoado'), 'Thor migrado: atordoa só o de menor HP (índice 1)');
  st = E.novoEstado(['thor', 'zeus', 'zeus'], ['tyr', 'tyr', 'tyr'], 995); orbs(st.lados[0]);
  const t2 = st.lados[0].units[0]; f = st.lados[1].units; f[0].hp = 100; f[1].hp = 40; f[2].hp = 70;
  f[1].efeitos.push({ type: 'invulneravel', dur: 2 });
  E.agir(st, t2.uid, 'milagre', []);
  ok(!E.ef(f[1], 'atordoado'), 'Thor migrado: NÃO atordoa o menor-HP se INVULNERÁVEL (esquisitice preservada, regra geral do apply)');
  console.log('  Lugh: básico fura+sem-contra · Funda maior-HP/executa · Samildánach opcoes+cdSe · Thor absorvido no seletor');
}

console.log('== §107 Hanuman: Senhor (intercepta.protege, como a Bastet) + milagre cura o Senhor ou o mais ferido ==');
{
  const orbs = l => { E.ELEMS.forEach(e => l.orbs[e] = 9); l.orbs.livre = 9; };
  // habilidade: adota Senhor → intercepta o dano dirigido a ele + Hanuman +10
  let st = E.novoEstado(['hanuman', 'zeus', 'brigid'], ['tyr', 'tyr', 'tyr'], 990); orbs(st.lados[0]);
  let han = st.lados[0].units[0], senhor = st.lados[0].units[1], atk = st.lados[1].units[0];
  E.agir(st, han.uid, 'habilidade', [senhor.uid]);
  const ic = E.ef(han, 'intercepta');
  ok(ic && ic.protege === senhor.uid && !!E.ef(han, 'dmgUp'), 'Devoção: intercepta protege o Senhor escolhido + Hanuman +10');
  const hh = han.hp, hs = senhor.hp;
  E.bater(st, atk, senhor, 20, 'afetado', 'basico', { unico: true });
  ok(hs - senhor.hp === 0 && hh - han.hp === 20, `golpe único no Senhor → Hanuman assume (Senhor 0, Hanuman 20) (${hs - senhor.hp}/${hh - han.hp})`);

  // milagre COM Senhor: cura o Senhor (não o mais ferido) + 18 a todos
  st = E.novoEstado(['hanuman', 'zeus', 'brigid'], ['tyr', 'tyr', 'tyr'], 991); orbs(st.lados[0]);
  han = st.lados[0].units[0]; senhor = st.lados[0].units[1]; const outro = st.lados[0].units[2];
  senhor.hp = 60; outro.hp = 40;
  E.agir(st, han.uid, 'habilidade', [senhor.uid]); han.agiu = false; orbs(st.lados[0]);
  const he = st.lados[1].units.map(x => x.hp);
  E.agir(st, han.uid, 'milagre', []);
  // o mecanismo do §107 é o HEAL ir no Senhor (não no mais ferido); o dano de área nos inimigos varia por bônus de time
  // (o próprio dmgUp de adotar o Senhor + bônus de aliados), então confiro só que a área bateu em TODOS, não o valor exato.
  const bateuTodos = st.lados[1].units.every((x, i) => he[i] - x.hp > 0);
  ok(senhor.hp === 90 && outro.hp === 40 && bateuTodos, `milagre com Senhor: cura o Senhor (60→90), NÃO o mais ferido (40 intacto), e área em todos (${senhor.hp}/${outro.hp})`);

  // milagre SEM Senhor: fallback no mais ferido
  st = E.novoEstado(['hanuman', 'zeus', 'brigid'], ['tyr', 'tyr', 'tyr'], 992); orbs(st.lados[0]);
  han = st.lados[0].units[0]; const b1 = st.lados[0].units[1], b2 = st.lados[0].units[2];
  b1.hp = 90; b2.hp = 35;
  E.agir(st, han.uid, 'milagre', []);
  ok(b2.hp === 65 && b1.hp === 90, `milagre sem Senhor: fallback no mais ferido (35→65) (${b2.hp}/${b1.hp})`);

  // passiva: imune a Queimadura; +8 com Sun Wukong (escopo self — §102-C, o recíproco não mora no catálogo do Sun Wukong)
  st = E.novoEstado(['hanuman', 'zeus', 'zeus'], ['tyr', 'tyr', 'tyr'], 993); orbs(st.lados[0]);
  han = st.lados[0].units[0]; const inim = st.lados[1].units[0];
  E.aplicarFx(st, inim, [{ t: 'dot', nome: 'queimadura', v: 8, dur: 2 }], { alvo: 'inimigo', slot: 'basico' }, [han]);   // aplicado PELA via real (aplicarDot checa imuneA)
  ok(!han.dots.some(d => d.nome === 'queimadura'), 'imune a Queimadura (o DoT não pega ao ser aplicado)');
  st = E.novoEstado(['hanuman', 'sunwukong', 'zeus'], ['tyr', 'tyr', 'tyr'], 994);
  let h2 = st.lados[0].units[0]; let foe = st.lados[1].units[0], hf = foe.hp;
  E.bater(st, h2, foe, 15, 'afetado', 'basico', {});
  ok(hf - foe.hp === 23, `+8 com Sun Wukong no time: 15+8=23 (${hf - foe.hp})`);
  console.log('  Senhor via intercepta.protege · assume o golpe · milagre cura Senhor/mais-ferido · imune queimadura · +8 c/ Sun Wukong');
}

console.log('== §109 Mnevis (fecha a família guarda): thorns no milagre + intercepta-passiva-nomeada de Rá ==');
{
  const orbs = l => { E.ELEMS.forEach(e => l.orbs[e] = 9); l.orbs.livre = 9; };
  // básico Chifrada: 15 a um inimigo
  let st = E.novoEstado(['mnevis', 'zeus', 'zeus'], ['tyr', 'tyr', 'tyr'], 995); orbs(st.lados[0]);
  let m = st.lados[0].units[0], foe = st.lados[1].units;
  let h = foe.map(x => x.hp);
  E.agir(st, m.uid, 'basico', [foe[0].uid]);
  ok(h[0] - foe[0].hp === 15, `Chifrada: 15 a 1 inimigo (${h[0] - foe[0].hp})`);

  // habilidade Investida Solar: 15 a DOIS inimigos + 15 de Defesa Destrutível em si
  st = E.novoEstado(['mnevis', 'zeus', 'zeus'], ['tyr', 'tyr', 'tyr'], 996); orbs(st.lados[0]);
  m = st.lados[0].units[0]; foe = st.lados[1].units; h = foe.map(x => x.hp);
  E.agir(st, m.uid, 'habilidade', [foe[0].uid, foe[1].uid]);
  ok(h[0] - foe[0].hp === 15 && h[1] - foe[1].hp === 15 && foe[2].hp === h[2] && m.shield === 15,
    `Investida Solar: 15 nos DOIS mirados, 3º intacto, +15 escudo self (${h[0] - foe[0].hp}/${h[1] - foe[1].hp}/${h[2] - foe[2].hp}, escudo ${m.shield})`);

  // milagre Fúria do Touro de Rá: provoca todos + Mnevis ganha thorns (reflete 10)
  st = E.novoEstado(['mnevis', 'zeus', 'zeus'], ['tyr', 'tyr', 'tyr'], 997); orbs(st.lados[0]);
  m = st.lados[0].units[0]; foe = st.lados[1].units;
  E.agir(st, m.uid, 'milagre', []);
  const provocouTodos = foe.every(x => !!E.ef(x, 'taunt'));
  const thorns = E.ef(m, 'refleteDano');
  ok(provocouTodos && thorns && thorns.v === 10 && thorns.dur === 2, `Fúria: provoca TODOS (2 turnos) + thorns de 10 em Mnevis (${provocouTodos}/${JSON.stringify(thorns)})`);
  const hm = m.hp, hf = foe[0].hp;
  E.bater(st, foe[0], m, 20, 'afetado', 'basico', { unico: true });
  ok(hm - m.hp === 20 && hf - foe[0].hp === 10, `com thorns: o atacante que bate 20 sofre 10 de volta (Mnevis ${hm - m.hp}, atacante ${hf - foe[0].hp})`);

  // passiva Montaria do Sol: COM Rá no time, intercepta o 1º golpe único contra Rá por turno
  st = E.novoEstado(['mnevis', 'ra', 'zeus'], ['tyr', 'tyr', 'tyr'], 998);
  m = st.lados[0].units[0]; let ra = st.lados[0].units[1]; foe = st.lados[1].units;
  st.ativo = 0; E.iniciarTurno(st);
  const ic = E.ef(m, 'intercepta');
  ok(ic && ic.protege === ra.uid && ic.contra === 'unico', `Montaria: passiva arma intercepta em Mnevis protegendo Rá, contra:unico (${JSON.stringify(ic)})`);
  const hr = ra.hp, hmm = m.hp;
  E.bater(st, foe[0], ra, 18, 'afetado', 'basico', { unico: true });
  ok(ra.hp === hr && hmm - m.hp === 18, `1º golpe único contra Rá → Mnevis assume (Rá intacto, Mnevis 18) (${hr - ra.hp}/${hmm - m.hp})`);

  // SEM Rá no time: a passiva não arma nada (aliadoPresente gateia)
  st = E.novoEstado(['mnevis', 'zeus', 'zeus'], ['tyr', 'tyr', 'tyr'], 999);
  m = st.lados[0].units[0]; st.ativo = 0; E.iniciarTurno(st);
  ok(!E.ef(m, 'intercepta'), 'sem Rá no time: a Montaria não arma intercepta (aliadoPresente gateia)');
  console.log('  Chifrada 15 · Investida 15×2 + escudo 15 · Fúria provoca todos + thorns 10 · Montaria intercepta Rá (1º/turno, só com Rá)');
}

console.log('== §111 Krishna: Ação Perfeita (buff transferido, os 4 ignores, próxima habilidade) + passiva top-dano ==');
{
  const orbs = l => { E.ELEMS.forEach(e => l.orbs[e] = 9); l.orbs.livre = 9; };
  // básico Flauta Divina: 12 a 1 inimigo (sem custo)
  let st = E.novoEstado(['krishna', 'zeus', 'zeus'], ['tyr', 'tyr', 'tyr'], 980); orbs(st.lados[0]);
  let kr = st.lados[0].units[0], foe = st.lados[1].units[0];
  let h = foe.hp;
  E.agir(st, kr.uid, 'basico', [foe.uid]);
  ok(h - foe.hp === 12, `Flauta Divina: 12 a 1 inimigo (${h - foe.hp})`);

  // Conselho do Gita ARMA a Ação Perfeita num aliado; Krishna não a carrega
  st = E.novoEstado(['krishna', 'zeus', 'zeus'], ['tyr', 'tyr', 'tyr'], 981); orbs(st.lados[0]);
  kr = st.lados[0].units[0]; let ally = st.lados[0].units[1]; foe = st.lados[1].units[0];
  foe.shield = 100; foe.efeitos.push({ type: 'dmgReduction', v: 10, dur: 9 });
  E.agir(st, kr.uid, 'habilidade', [ally.uid]);
  ok(E.ef(ally, 'acaoPerfeita') && !E.ef(kr, 'acaoPerfeita'), 'Conselho do Gita: o ALIADO recebe a Ação Perfeita, Krishna não a carrega');
  // a HABILIDADE do aliado fura escudo E redução e é consumida em seguida
  h = foe.hp;
  E.agir(st, ally.uid, 'habilidade', [foe.uid]);
  ok(h - foe.hp > 0 && foe.shield === 100, `a habilidade do aliado fura escudo E redução (HP caiu, escudo 100 intacto) (${h - foe.hp}/${foe.shield})`);
  ok(!E.ef(ally, 'acaoPerfeita'), 'consumida após a habilidade (a PRÓXIMA habilidade, uma só)');

  // GATING: o básico do portador NÃO consome (nem herda) — só a habilidade; e o buff sobrevive à alternância (dur 2, tick só no lado ativo)
  st = E.novoEstado(['krishna', 'zeus', 'zeus'], ['tyr', 'tyr', 'tyr'], 982); orbs(st.lados[0]);
  kr = st.lados[0].units[0]; ally = st.lados[0].units[1]; foe = st.lados[1].units[0];
  E.agir(st, kr.uid, 'habilidade', [ally.uid]);
  E.agir(st, ally.uid, 'basico', [foe.uid]);
  ok(E.ef(ally, 'acaoPerfeita'), 'o básico do portador NÃO consome a Ação Perfeita');
  E.fimTurno(st); E.fimTurno(st); orbs(st.lados[0]);   // volta ao time (fimTurno já re-inicia o turno)
  ok(E.ef(ally, 'acaoPerfeita'), 'sobrevive à alternância (dur 2, desconta só no fim do turno do dono)');
  E.agir(st, ally.uid, 'habilidade', [foe.uid]);
  ok(!E.ef(ally, 'acaoPerfeita'), 'a habilidade seguinte consome');

  // milagre Forma Universal: +12 de dano ao TIME por 2 turnos (+ 2 orbes)
  st = E.novoEstado(['krishna', 'zeus', 'zeus'], ['tyr', 'tyr', 'tyr'], 983); orbs(st.lados[0]);
  kr = st.lados[0].units[0]; ally = st.lados[0].units[1];
  E.agir(st, kr.uid, 'milagre', []);
  const up = E.ef(ally, 'dmgUp'), upK = E.ef(kr, 'dmgUp');
  ok(up && up.v === 12 && upK && upK.v === 12, `Forma Universal: +12 de dano em TODO o time (${up && up.v})`);

  // passiva Auriga de Arjuna: quem causou MAIS dano no turno anterior (do time) causa +5
  st = E.novoEstado(['krishna', 'zeus', 'zeus'], ['tyr', 'tyr', 'tyr'], 984); orbs(st.lados[0]);
  let z1 = st.lados[0].units[1], z2 = st.lados[0].units[2], f0 = st.lados[1].units[0], f1 = st.lados[1].units[1];
  E.agir(st, z1.uid, 'basico', [f0.uid]);   // z1 causa dano no turno; z2 não
  E.fimTurno(st); E.fimTurno(st); orbs(st.lados[0]);   // enemy + volta: promove o lado do time → z1 é o top-dano-anterior
  let a = f0.hp; E.agir(st, z1.uid, 'basico', [f0.uid]); let d1 = a - f0.hp;
  let b = f1.hp; E.agir(st, z2.uid, 'basico', [f1.uid]); let d2 = b - f1.hp;
  ok(d1 === d2 + 5, `o top-dano do turno anterior (z1) causa +5 vs o não-top (z2) (${d1} vs ${d2})`);
  console.log('  Flauta 12 · Ação Perfeita arma no aliado, fura os 4, só na próxima habilidade · Forma Universal +12 time · passiva top-dano +5');
}

console.log('== §114 Izanami: contágio (espalha) + DoT escalado por Maldição + execução dos amaldiçoados ==');
{
  const orbs = l => { E.ELEMS.forEach(e => l.orbs[e] = 9); l.orbs.livre = 9; };
  // básico Toque de Yomi: 12 + 1 Maldição no alvo (delta, isolando o tique de abertura da passiva)
  let st = E.novoEstado(['izanami', 'zeus', 'zeus'], ['tyr', 'tyr', 'tyr'], 980); orbs(st.lados[0]);
  let iz = st.lados[0].units[0], f0 = st.lados[1].units[0];
  let h = f0.hp, c = E.getContador(f0, 'maldicao');
  E.agir(st, iz.uid, 'basico', [f0.uid]);
  ok(h - f0.hp === 12 && E.getContador(f0, 'maldicao') - c === 1, `Toque de Yomi: 12 de dano + 1 Maldição (${h - f0.hp}, +${E.getContador(f0, 'maldicao') - c})`);

  // passiva Mil por Dia: no início do turno, o inimigo de MAIOR HP ganha 1 Maldição
  st = E.novoEstado(['izanami', 'zeus', 'zeus'], ['tyr', 'tyr', 'tyr'], 981); orbs(st.lados[0]);
  let e = st.lados[1].units;
  e.forEach(x => x.contadores.maldicao = 0);        // limpa o tique de abertura
  e[0].hp = 100; e[1].hp = 90; e[2].hp = 118;       // e2 é o de maior HP
  E.fimTurno(st); E.fimTurno(st);                    // volta ao turno da Izanami → a passiva roda
  ok(E.getContador(e[2], 'maldicao') === 1 && E.getContador(e[0], 'maldicao') === 0 && E.getContador(e[1], 'maldicao') === 0,
    `Mil por Dia: só o de maior HP (e2) ganha Maldição — 1º porTurno que toca inimigo, auto-alvo (${e.map(x => E.getContador(x, 'maldicao'))})`);

  // habilidade Praga: espalha (iguala ao máximo) + o DoT escalado tica 6×acúmulo/turno
  st = E.novoEstado(['izanami', 'zeus', 'zeus'], ['tyr', 'tyr', 'tyr'], 982); orbs(st.lados[0]);
  iz = st.lados[0].units[0]; e = st.lados[1].units;
  e[0].contadores.maldicao = 3; e[1].contadores.maldicao = 1; e[2].contadores.maldicao = 0;
  E.agir(st, iz.uid, 'habilidade', []);
  ok(e.every(x => E.getContador(x, 'maldicao') === 3), `Praga espalha: todos igualados ao máximo 3 (${e.map(x => E.getContador(x, 'maldicao'))})`);
  ok(e.every(x => x.dots.some(d => d.nome === 'maldicao')), 'Praga aplica o DoT da Maldição a todos');
  const hp0 = e[0].hp;
  E.fimTurno(st);   // vai aos inimigos → o DoT tica no iniciarTurno deles
  ok(hp0 - e[0].hp === 18, `o DoT escalado tica 6×3 = 18 puro/turno (${hp0 - e[0].hp})`);

  // milagre Portal de Yomotsu: 20 a todos + elimina amaldiçoados com ≤30 HP
  st = E.novoEstado(['izanami', 'zeus', 'zeus'], ['tyr', 'tyr', 'tyr'], 983); orbs(st.lados[0]);
  iz = st.lados[0].units[0]; e = st.lados[1].units;
  e[0].hp = 45; e[0].contadores.maldicao = 1;   // 45−20=25 ≤30 E amaldiçoado → executa
  e[1].hp = 45; e[1].contadores.maldicao = 0;   // 25 ≤30 mas SEM Maldição → sobrevive
  e[2].hp = 100; e[2].contadores.maldicao = 2;  // 80 → sobrevive
  E.agir(st, iz.uid, 'milagre', []);
  ok(!e[0].vivo && e[1].vivo && e[2].vivo, `Portal: 20 a todos + executa só o amaldiçoado ≤30 (${e.map(x => x.vivo)})`);
  console.log('  Toque 12+Maldição · Mil por Dia no maior HP · Praga espalha+DoT 6×acúmulo · Portal 20 + executa amaldiçoados ≤30');
}

console.log('== §117 Kukulkán (M1, agendador): habilidade telegrafada (Inalvejável + AoE no próximo turno) ==');
{
  const orbs = l => { E.ELEMS.forEach(e => l.orbs[e] = 9); l.orbs.livre = 9; };
  // básico 15
  let st = E.novoEstado(['kukulkan', 'zeus', 'zeus'], ['tyr', 'tyr', 'tyr'], 985); orbs(st.lados[0]);
  let k = st.lados[0].units[0], e = st.lados[1].units;
  let h = e[0].hp;
  E.agir(st, k.uid, 'basico', [e[0].uid]);
  ok(h - e[0].hp === 15, `Presas do Vento: 15 (${h - e[0].hp})`);

  // habilidade: NO lançamento fica Inalvejável e agenda; o AoE 25 só cai no próximo turno do Kukulkán
  st = E.novoEstado(['kukulkan', 'zeus', 'zeus'], ['tyr', 'tyr', 'tyr'], 986); orbs(st.lados[0]);
  k = st.lados[0].units[0]; e = st.lados[1].units; const hb = e.map(x => x.hp);
  E.agir(st, k.uid, 'habilidade', []);
  ok(!!E.ef(k, 'inalvejavel') && e.every((x, i) => x.hp === hb[i]), 'Voo da Serpente: Inalvejável no lançamento, AoE ainda não caiu');
  E.fimTurno(st);   // turno inimigo — protegido, e o AoE não dispara aqui
  ok(!!E.ef(k, 'inalvejavel') && e.every((x, i) => x.hp === hb[i]), 'durante o turno inimigo: ainda Inalvejável, AoE não disparou');
  E.fimTurno(st);   // volta ao Kukulkán → o payload dispara
  ok(e.every((x, i) => hb[i] - x.hp === 25), `no próximo turno do Kukulkán: 25 a TODOS (${e.map((x, i) => hb[i] - x.hp)})`);

  // milagre: 20 a todos + o time causa +10 por 2 turnos
  st = E.novoEstado(['kukulkan', 'zeus', 'zeus'], ['tyr', 'tyr', 'tyr'], 987); orbs(st.lados[0]);
  k = st.lados[0].units[0]; const ally = st.lados[0].units[1]; e = st.lados[1].units; const hm = e.map(x => x.hp);
  E.agir(st, k.uid, 'milagre', []);
  const up = E.ef(ally, 'dmgUp');
  ok(e.every((x, i) => hm[i] - x.hp === 20) && up && up.v === 10, `Estrela da Manhã: 20 a todos + time dmgUp 10 (${e.map((x, i) => hm[i] - x.hp)}, up ${up && up.v})`);

  // passiva: +8 contra Encharcados
  st = E.novoEstado(['kukulkan', 'zeus', 'zeus'], ['tyr', 'tyr', 'tyr'], 988); orbs(st.lados[0]);
  k = st.lados[0].units[0]; const foe = st.lados[1].units[0];
  foe.efeitos.push({ type: 'encharcado', dur: 9 });
  const hf = foe.hp;
  E.agir(st, k.uid, 'basico', [foe.uid]);
  ok(hf - foe.hp === 23, `Deus-Rei: +8 vs Encharcado (15+8=23) (${hf - foe.hp})`);
  console.log('  Presas 15 · Voo da Serpente telegrafado (Inalvejável agora, 25 a todos no próximo turno) · Estrela 20+dmgUp · +8 vs Encharcado');
}

console.log('== §118 Ares + Ammit (M3, consequência de abate): zeraCd-ao-abater (si) + naoRevive-ao-abater (o morto) ==');
{
  const orbs = l => { E.ELEMS.forEach(e => l.orbs[e] = 9); l.orbs.livre = 9; };
  // ARES básico 15 + cura 6
  let st = E.novoEstado(['ares', 'zeus', 'zeus'], ['tyr', 'tyr', 'tyr'], 990); orbs(st.lados[0]);
  let a = st.lados[0].units[0], foe = st.lados[1].units[0]; a.hp = 100;   // 20 perdidos → passiva +2
  const h = foe.hp;
  E.agir(st, a.uid, 'basico', [foe.uid]);
  ok(h - foe.hp === 17 && a.hp === 106, `Golpe Sanguinário: 15 + passiva(+2 por 20 HP perdido) = 17; Ares cura 6 (100→106) (${h - foe.hp}, hp ${a.hp})`);
  // ARES passiva + escalador da habilidade: +1/4 HP-falta (hab) e +1/10 HP-perdido (passiva)
  st = E.novoEstado(['ares', 'zeus', 'zeus'], ['tyr', 'tyr', 'tyr'], 991); orbs(st.lados[0]);
  a = st.lados[0].units[0]; foe = st.lados[1].units[0]; a.hp = 90;   // 30 perdidos
  const h2 = foe.hp; E.agir(st, a.uid, 'habilidade', [foe.uid]);   // 22 + floor(30/4)=7 (hab) + floor(30/10)=3 (passiva) = 32
  ok(h2 - foe.hp === 32, `Sede de Sangue: 22 + 7 (hab /4 de 30) + 3 (passiva /10) = 32 (${h2 - foe.hp})`);
  // ARES milagre: 4×12; ao abater, a recarga do Massacre zera
  st = E.novoEstado(['ares', 'zeus', 'zeus'], ['tyr', 'tyr', 'tyr'], 992); orbs(st.lados[0]);
  a = st.lados[0].units[0]; foe = st.lados[1].units[0]; foe.hp = 40;
  E.agir(st, a.uid, 'milagre', [foe.uid]);
  ok(!foe.vivo && a.cd.milagre === 0, `Massacre abate → recarga volta (cd ${a.cd.milagre})`);

  // AMMIT básico 15; habilidade +6 por debuff
  st = E.novoEstado(['ammit', 'zeus', 'zeus'], ['tyr', 'tyr', 'tyr'], 993); orbs(st.lados[0]);
  let am = st.lados[0].units[0]; foe = st.lados[1].units[0];
  foe.efeitos.push({ type: 'dmgDown', v: 5, dur: 2 }, { type: 'vulneravel', v: 5, dur: 2 });   // 2 debuffs
  const h3 = foe.hp; E.agir(st, am.uid, 'habilidade', [foe.uid]);   // 22 + 6×2 = 34, +5 vulneravel de entrada = 39
  ok(h3 - foe.hp === 39, `Faro do Pecado: 22 + 6×2 debuffs = 34, +5 (vulnerável) = 39 (${h3 - foe.hp})`);
  // AMMIT milagre: elimina Atordoado/Selado/≤30; senão 35
  st = E.novoEstado(['ammit', 'zeus', 'zeus'], ['tyr', 'tyr', 'tyr'], 994); orbs(st.lados[0]);
  am = st.lados[0].units[0]; let e = st.lados[1].units;
  e[0].hp = 120; e[0].efeitos.push({ type: 'selado', dur: 2 });
  E.agir(st, am.uid, 'milagre', [e[0].uid]);
  ok(!e[0].vivo, 'Devorar a Alma: elimina Selado mesmo com 120 HP');
  st = E.novoEstado(['ammit', 'zeus', 'zeus'], ['tyr', 'tyr', 'tyr'], 995); orbs(st.lados[0]);
  am = st.lados[0].units[0]; e = st.lados[1].units; e[0].hp = 100;
  const h4 = e[0].hp; E.agir(st, am.uid, 'milagre', [e[0].uid]);
  ok(e[0].vivo && h4 - e[0].hp === 35, `Devorar sem gatilho: 35 de dano (${h4 - e[0].hp})`);
  // AMMIT passiva: quem ele abate não revive (mesmo Nezha, que renasceria)
  st = E.novoEstado(['ammit', 'zeus', 'zeus'], ['nezha', 'tyr', 'tyr'], 996); orbs(st.lados[0]);
  am = st.lados[0].units[0]; const nez = st.lados[1].units[0]; nez.efeitos = []; nez.hp = 5;
  E.agir(st, am.uid, 'basico', [nez.uid]);
  E.fimTurno(st); E.fimTurno(st);   // o turno da Nezha voltaria — mas naoRevive a segura
  ok(!nez.vivo, `Sentença Final: quem Ammit abate NÃO revive (Nezha fica caída) (vivo ${nez.vivo})`);
  console.log('  Ares: +HP-falta, cura, Massacre-volta-ao-abater · Ammit: +debuff, elimina-condicional, abatido-não-revive');
}

console.log('== §120 Izanagi (M4, extensão da imunidade): o TIME imune a Maldição + a contágio (mecânica) ==');
{
  const orbs = l => { E.ELEMS.forEach(e => l.orbs[e] = 9); l.orbs.livre = 9; };
  // básico 12
  let st = E.novoEstado(['izanagi', 'zeus', 'zeus'], ['tyr', 'tyr', 'tyr'], 997); orbs(st.lados[0]);
  let iz = st.lados[0].units[0], foe = st.lados[1].units[0];
  const h = foe.hp; E.agir(st, iz.uid, 'basico', [foe.uid]);
  ok(h - foe.hp === 12, `Lança Ame-no-Nuboko: 12 (${h - foe.hp})`);
  // habilidade Misogi: cleanse + cura 20 no aliado (sem Maldição → sem o +10 time)
  st = E.novoEstado(['izanagi', 'zeus', 'zeus'], ['tyr', 'tyr', 'tyr'], 998); orbs(st.lados[0]);
  iz = st.lados[0].units[0]; const al = st.lados[0].units[1]; al.hp = 40; al.efeitos.push({ type: 'dmgDown', v: 5, dur: 2 });
  E.agir(st, iz.uid, 'habilidade', [al.uid]);
  ok(al.hp === 60 && !al.efeitos.some(x => x.type === 'dmgDown'), `Misogi: cleanse + cura 20 (40→60) (${al.hp})`);
  // milagre Criação das Ilhas: time +20 escudo + regen 8
  st = E.novoEstado(['izanagi', 'zeus', 'zeus'], ['tyr', 'tyr', 'tyr'], 999); orbs(st.lados[0]);
  iz = st.lados[0].units[0]; const a2 = st.lados[0].units[1];
  E.agir(st, iz.uid, 'milagre', []);
  ok(a2.shield === 20 && E.ef(a2, 'regen') && E.ef(a2, 'regen').v === 8, `Criação das Ilhas: time +20 escudo + regen 8 (escudo ${a2.shield})`);
  // passiva Fuga de Yomi: o TIME de Izanagi é imune ao contador de Maldição (básico do Izanami) E ao contágio (Praga)
  st = E.novoEstado(['izanami', 'zeus', 'zeus'], ['izanagi', 'tyr', 'tyr'], 1000); orbs(st.lados[0]);
  const izm = st.lados[0].units[0], izg = st.lados[1].units[0], teamAlly = st.lados[1].units[1];
  E.agir(st, izm.uid, 'basico', [izg.uid]);
  ok(E.getContador(izg, 'maldicao') === 0, `Fuga de Yomi: Izanagi imune ao contador de Maldição (${E.getContador(izg, 'maldicao')})`);
  // e o ALIADO de Izanagi também (escopo:time), inclusive contra o contágio da Praga
  st = E.novoEstado(['izanami', 'zeus', 'zeus'], ['izanagi', 'tyr', 'tyr'], 1001); orbs(st.lados[0]);
  const izm2 = st.lados[0].units[0]; const e = st.lados[1].units; e[1].contadores.maldicao = 4;   // valor forçado num aliado
  E.agir(st, izm2.uid, 'habilidade', []);   // Praga espalha — mas o time do Izanagi é imune
  ok(E.getContador(e[0], 'maldicao') === 0 && E.getContador(e[2], 'maldicao') === 0, `contágio da Praga não alcança o time do Izanagi (${e.map(x => E.getContador(x, 'maldicao'))})`);
  console.log('  Lança 12 · Misogi cleanse+cura20(+10 se Maldição) · Criação escudo20+regen8 · Fuga de Yomi: TIME imune a Maldição + contágio');
}

console.log('== §121 Hermes (M2, iniciativa como regra de setup): age primeiro (starter) + reducao·unico ==');
{
  // passiva iniciativa: o lado do Hermes ABRE (força o starter), mesmo contra o comeca sorteado
  let st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['hermes', 'zeus', 'zeus'], 5, 0);
  ok(st.starter === 1 && st.ativo === 1, `Hermes age primeiro: o lado dele abre (starter ${st.starter}), apesar de comeca=0`);
  ok(E.totalOrbs(st.lados[1]) === 1, `e paga o custo de abertura como todo starter: 1 orbe (${E.totalOrbs(st.lados[1])})`);
  // básico Golpe Alado: 2×8 = 16
  st = E.novoEstado(['hermes', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 5, 0);
  E.ELEMS.forEach(e => st.lados[0].orbs[e] = 9); st.lados[0].orbs.livre = 9;
  let hrm = st.lados[0].units[0], foe = st.lados[1].units[0];
  let h = foe.hp; E.agir(st, hrm.uid, 'basico', [foe.uid]);
  ok(h - foe.hp === 16, `Golpe Alado: 2 golpes de 8 = 16 (${h - foe.hp})`);
  // passiva reducao·unico: golpe ÚNICO contra Hermes −5; ÁREA não
  let hh = hrm.hp; E.bater(st, foe, hrm, 15, 'afetado', 'basico', { unico: true });
  ok(hh - hrm.hp === 10, `golpe único contra Hermes: 15−5 = 10 (${hh - hrm.hp})`);
  hh = hrm.hp; E.bater(st, foe, hrm, 15, 'afetado', 'basico', {});
  ok(hh - hrm.hp === 15, `golpe de área NÃO é reduzido (só alcance único) (${hh - hrm.hp})`);
  // habilidade Passo Alado: −1 nas recargas de 1 aliado
  st = E.novoEstado(['hermes', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 5, 0);
  E.ELEMS.forEach(e => st.lados[0].orbs[e] = 9); st.lados[0].orbs.livre = 9;
  hrm = st.lados[0].units[0]; const al = st.lados[0].units[1]; al.cd.milagre = 4; al.cd.habilidade = 2;
  E.agir(st, hrm.uid, 'habilidade', [al.uid]);
  ok(al.cd.milagre === 3 && al.cd.habilidade === 1, `Passo Alado: −1 em todas as recargas do aliado (mil 4→3, hab 2→1) (${al.cd.milagre}/${al.cd.habilidade})`);
  console.log('  age primeiro = starter (paga a abertura) · Golpe Alado 16 · reducao só do único · Passo Alado −1 recargas');
}

console.log('== §123 leva JÁ DÁ: Osíris (limpo) + Nüwa (limpo) + Mimir (arrastou 2 hooks: mesmoMorto + naoRevivivel) ==');
{
  const orbs = l => { E.ELEMS.forEach(e => l.orbs[e] = 9); l.orbs.livre = 9; };
  // ---- OSÍRIS (limpo): revive/almas ----
  // básico 12
  let st = E.novoEstado(['osiris', 'zeus', 'zeus'], ['tyr', 'tyr', 'tyr'], 1010); orbs(st.lados[0]);
  let os = st.lados[0].units[0], foe = st.lados[1].units[0];
  let h = foe.hp; E.agir(st, os.uid, 'basico', [foe.uid]);
  ok(h - foe.hp === 12, `Cajado e Mangual: 12 (${h - foe.hp})`);
  // habilidade: cura 20; aliado ABAIXO de 60 ganha 15 de escudo (condição lida ANTES da cura — err p/ cima)
  st = E.novoEstado(['osiris', 'zeus', 'zeus'], ['tyr', 'tyr', 'tyr'], 1011); orbs(st.lados[0]);
  os = st.lados[0].units[0]; let al = st.lados[0].units[1]; al.hp = 40;
  E.agir(st, os.uid, 'habilidade', [al.uid]);
  ok(al.hp === 60 && al.shield === 15, `Trigo do Renascimento: aliado a 40 (<60) → escudo 15 + cura 20 = 60 HP (${al.hp}/${al.shield})`);
  // aliado saudável (>=60): só cura, sem escudo
  st = E.novoEstado(['osiris', 'zeus', 'zeus'], ['tyr', 'tyr', 'tyr'], 1012); orbs(st.lados[0]);
  os = st.lados[0].units[0]; al = st.lados[0].units[1]; al.hp = 70;
  E.agir(st, os.uid, 'habilidade', [al.uid]);
  ok(al.hp === 90 && al.shield === 0, `aliado a 70 (>=60): cura 20 (→90), SEM escudo (${al.hp}/${al.shield})`);
  // milagre: revive 1 caído com 60 e limpa os debuffs dele (o reviver já zera efeitos/dots)
  st = E.novoEstado(['osiris', 'zeus', 'zeus'], ['tyr', 'tyr', 'tyr'], 1013); orbs(st.lados[0]);
  os = st.lados[0].units[0]; const caido = st.lados[0].units[1]; caido.hp = 5;
  E.bater(st, st.lados[1].units[0], caido, 15, 'afetado', 'basico', {});   // derruba o aliado
  ok(!caido.vivo, 'aliado caiu (pré-condição do revive)');
  E.agir(st, os.uid, 'milagre', []);
  ok(caido.vivo && caido.hp === 60 && caido.efeitos.length === 0, `Tribunal do Duat: revive com 60 e sem debuffs (vivo ${caido.vivo}, hp ${caido.hp})`);
  // passiva Rei dos Mortos: +8 de dano ao TIME por aliado caído
  st = E.novoEstado(['osiris', 'zeus', 'zeus'], ['tyr', 'tyr', 'tyr'], 1014);
  let atk = st.lados[0].units[1]; foe = st.lados[1].units[0];
  ok(E.bonusDanoDeclarativo(st, atk, foe) === 0, `Rei dos Mortos: 0 caídos → +0 (${E.bonusDanoDeclarativo(st, atk, foe)})`);
  st.lados[0].units[2].vivo = false;
  ok(E.bonusDanoDeclarativo(st, atk, foe) === 8, `1 caído → +8 ao time (${E.bonusDanoDeclarativo(st, atk, foe)})`);

  // ---- NÜWA (limpo): opcoes escolha-2 (idiom do Lugh) + aoCair (idiom da Erínias) ----
  // básico 12
  st = E.novoEstado(['nuwa', 'zeus', 'zeus'], ['tyr', 'tyr', 'tyr'], 1015); orbs(st.lados[0]);
  let nu = st.lados[0].units[0]; foe = st.lados[1].units[0];
  h = foe.hp; E.agir(st, nu.uid, 'basico', [foe.uid]);
  ok(h - foe.hp === 12, `Escama Celeste: 12 (${h - foe.hp})`);
  // habilidade Pedras: escolha 2 = CURA(0) + ESCUDO(2) → time cura 20 e ganha 15 de escudo (as duas opções aplicadas)
  st = E.novoEstado(['nuwa', 'zeus', 'zeus'], ['tyr', 'tyr', 'tyr'], 1016); orbs(st.lados[0]);
  nu = st.lados[0].units[0]; st.lados[0].units.forEach(u => u.hp = 50);
  E.agir(st, nu.uid, 'habilidade', [], [0, 2]);
  ok(st.lados[0].units.every(u => u.hp === 70 && u.shield === 15), `Pedras (CURA+ESCUDO): time cura 20 (→70) e escuda 15 (${st.lados[0].units.map(u => u.hp + '/' + u.shield)})`);
  // milagre Remendar o Céu: time +20 escudo + regen 10 por 3
  st = E.novoEstado(['nuwa', 'zeus', 'zeus'], ['tyr', 'tyr', 'tyr'], 1017); orbs(st.lados[0]);
  nu = st.lados[0].units[0]; const na = st.lados[0].units[1];
  E.agir(st, nu.uid, 'milagre', []);
  ok(na.shield === 20 && E.ef(na, 'regen') && E.ef(na, 'regen').v === 10, `Remendar o Céu: time +20 escudo + regen 10 (escudo ${na.shield})`);
  // passiva Mãe da Humanidade: quando um aliado cai, os VIVOS ganham dmgUp +10 (resto da partida)
  st = E.novoEstado(['nuwa', 'zeus', 'zeus'], ['tyr', 'tyr', 'tyr'], 1018); orbs(st.lados[0]);
  const surv = st.lados[0].units[1], dying = st.lados[0].units[2]; dying.hp = 5;
  E.bater(st, st.lados[1].units[0], dying, 15, 'afetado', 'basico', {});
  const dU = surv.efeitos.find(x => x.type === 'dmgUp');
  ok(dU && dU.v === 10, `Mãe da Humanidade: queda de aliado → sobrevivente ganha dmgUp +10 (${dU ? dU.v : 'nenhum'})`);

  // ---- MIMIR (arrastou): suporte pós-morte — os 2 hooks já provados em primitivas §31, aqui o KIT ----
  // básico 10
  st = E.novoEstado(['mimir', 'zeus', 'zeus'], ['tyr', 'tyr', 'tyr'], 1019); orbs(st.lados[0]);
  let mi = st.lados[0].units[0]; foe = st.lados[1].units[0];
  h = foe.hp; E.agir(st, mi.uid, 'basico', [foe.uid]);
  ok(h - foe.hp === 16, `Sussurro Ancestral: 10 + a própria passiva (+6 ao time, Mimir incluso) = 16 (${h - foe.hp})`);
  // habilidade Conselho do Poço: remove 1 orbe do inimigo + 1 aliado causa +8 por 2 turnos
  st = E.novoEstado(['mimir', 'zeus', 'zeus'], ['tyr', 'tyr', 'tyr'], 1020); orbs(st.lados[0]);
  mi = st.lados[0].units[0]; al = st.lados[0].units[1];
  st.lados[1].orbs.Chama = 3; const antes = E.totalOrbs(st.lados[1]);
  E.agir(st, mi.uid, 'habilidade', [al.uid]);
  const buff = al.efeitos.find(x => x.type === 'dmgUp');
  ok(E.totalOrbs(st.lados[1]) === antes - 1 && buff && buff.v === 8 && buff.dur === 2, `Conselho do Poço: −1 orbe inimigo + aliado dmgUp 8/2 (orbes ${antes}→${E.totalOrbs(st.lados[1])}, buff ${buff ? buff.v : '-'})`);
  // milagre Segredos de Mímir: zera TODAS as recargas de 1 aliado (cdShift v:-99) + ele causa +10 por 2
  st = E.novoEstado(['mimir', 'zeus', 'zeus'], ['tyr', 'tyr', 'tyr'], 1021); orbs(st.lados[0]);
  mi = st.lados[0].units[0]; al = st.lados[0].units[1]; al.cd.habilidade = 2; al.cd.milagre = 4;
  E.agir(st, mi.uid, 'milagre', [al.uid]);
  const b2 = al.efeitos.find(x => x.type === 'dmgUp');
  ok(al.cd.habilidade === 0 && al.cd.milagre === 0 && b2 && b2.v === 10, `Segredos: zera as recargas do aliado + dmgUp 10 (cds ${al.cd.habilidade}/${al.cd.milagre}, buff ${b2 ? b2.v : '-'})`);
  // passiva Cabeça Falante (o KIT, não o hook): Mimir MORTO ainda dá +6 ao time
  st = E.novoEstado(['mimir', 'zeus', 'zeus'], ['tyr', 'tyr', 'tyr'], 1022);
  mi = st.lados[0].units[0]; atk = st.lados[0].units[1]; foe = st.lados[1].units[0];
  mi.vivo = false;
  ok(E.bonusDanoDeclarativo(st, atk, foe) === 6, `Cabeça Falante: Mimir derrotado ainda concede +6 ao time (${E.bonusDanoDeclarativo(st, atk, foe)})`);
  console.log('  Osíris limpo (revive+escudo-condicional+porCaído) · Nüwa limpa (opcoes-2+aoCair) · Mimir arrastou mesmoMorto+naoRevivivel');
}

console.log('== §126 Leva 1 do HOOK: Susanoo (déficit + Combo por-ataque) · Kitsune (reducao-por-Cauda + isca) · Anúbis (Atadura) ==');
{
  const orbs = l => { E.ELEMS.forEach(e => l.orbs[e] = 9); l.orbs.livre = 9; };
  // ---- SUSANOO ----
  // básico 15 + stripOne + gera 2 de Combo (o tell "por-ataque": escrevível como fx, sem gancho no bater)
  let st = E.novoEstado(['susanoo', 'zeus', 'zeus'], ['tyr', 'tyr', 'tyr'], 1030); orbs(st.lados[0]);
  let su = st.lados[0].units[0], foe = st.lados[1].units[0]; foe.efeitos.push({ type: 'dmgUp', v: 5, dur: 3 });
  let h = foe.hp; E.agir(st, su.uid, 'basico', [foe.uid]);
  ok(h - foe.hp === 15 && !E.ef(foe, 'dmgUp') && E.getContadorLado(st, 0, 'combo') === 2, `Corte de Kusanagi: 15 + remove buff + 2 Combo (dano ${h - foe.hp}, combo ${E.getContadorLado(st, 0, 'combo')})`);
  // passiva déficit: mate 2 aliados → +6×2 = +12 no próprio ataque (escopo self)
  st = E.novoEstado(['susanoo', 'zeus', 'zeus'], ['tyr', 'tyr', 'tyr'], 1031); orbs(st.lados[0]);
  su = st.lados[0].units[0]; foe = st.lados[1].units[0];
  ok(E.bonusDanoDeclarativo(st, su, foe) === 0, `Exílio Divino: 3×3 déficit 0 → +0 (${E.bonusDanoDeclarativo(st, su, foe)})`);
  st.lados[0].units[1].vivo = false; st.lados[0].units[2].vivo = false;
  ok(E.bonusDanoDeclarativo(st, su, foe) === 12, `déficit 2 → +12 (${E.bonusDanoDeclarativo(st, su, foe)})`);
  // milagre 18 + 2/Combo, consome tudo (o Combo NÃO é re-gerado no milagre: "consome todo")
  st = E.novoEstado(['susanoo', 'zeus', 'zeus'], ['tyr', 'tyr', 'tyr'], 1032); orbs(st.lados[0]);
  su = st.lados[0].units[0]; st.lados[0].contadores.combo = 5; const e0 = st.lados[1].units.map(x => x.hp);
  E.agir(st, su.uid, 'milagre', []);
  ok(st.lados[1].units.every((x, i) => e0[i] - x.hp === 28) && E.getContadorLado(st, 0, 'combo') === 0, `Fúria do Tufão: 18 + 2×5 = 28 a todos, Combo zerado (${st.lados[1].units.map((x, i) => e0[i] - x.hp)}, combo ${E.getContadorLado(st, 0, 'combo')})`);

  // ---- KITSUNE ----
  // passiva reducao ESCALADA por Cauda: a cada 3 Caudas, +5 (a cada terco; piso 0). Atacante ZEUS: o Tyr tem
  // danoIrredutivel e FURARIA a reducao (comportamento correto do motor — §121), mascarando o que se testa aqui.
  st = E.novoEstado(['kitsune', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 1033);
  let ki = st.lados[0].units[0], atk = st.lados[1].units[0];
  h = ki.hp; E.bater(st, atk, ki, 20, 'afetado', 'basico', {}); ok(h - ki.hp === 20, `0 Caudas: reducao 0 → sofre 20 (${h - ki.hp})`);
  st = E.novoEstado(['kitsune', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 1034);
  ki = st.lados[0].units[0]; atk = st.lados[1].units[0]; ki.contadores.cauda = 6;
  h = ki.hp; E.bater(st, atk, ki, 20, 'afetado', 'basico', {}); ok(h - ki.hp === 10, `6 Caudas: reducao 10 → sofre 10 (${h - ki.hp})`);
  // habilidade: isca (intercepta protege time, contra único, consumida na 1ª) + 1 Cauda
  st = E.novoEstado(['kitsune', 'zeus', 'zeus'], ['tyr', 'tyr', 'tyr'], 1035); orbs(st.lados[0]);
  ki = st.lados[0].units[0]; const ali = st.lados[0].units[1];
  E.agir(st, ki.uid, 'habilidade', []);
  ok(E.getContador(ki, 'cauda') === 1 && !!E.ef(ki, 'intercepta'), `Ilusão da Raposa: isca (intercepta time) + 1 Cauda (${E.getContador(ki, 'cauda')})`);
  const ha = ali.hp, hk = ki.hp; E.bater(st, st.lados[1].units[0], ali, 15, 'afetado', 'basico', { unico: true });
  ok(ha - ali.hp === 0 && hk - ki.hp === 15, `isca absorve o golpe único ao aliado (aliado ${ha - ali.hp}, Kitsune ${hk - ki.hp})`);
  // milagre: 12 + 3/Cauda a todos; com 5+ Caudas Domina 1 (o alvo escolhido)
  st = E.novoEstado(['kitsune', 'zeus', 'zeus'], ['tyr', 'tyr', 'tyr'], 1036); orbs(st.lados[0]);
  ki = st.lados[0].units[0]; ki.contadores.cauda = 5; const ke = st.lados[1].units; const kh = ke.map(x => x.hp);
  E.agir(st, ki.uid, 'milagre', [ke[0].uid]);
  ok(ke.every((x, i) => kh[i] - x.hp === 27) && !!E.ef(ke[0], 'dominado'), `Nove Caudas: 12 + 3×5 = 27 a todos + Domina o alvo (${ke.map((x, i) => kh[i] - x.hp)}, dominado ${!!E.ef(ke[0], 'dominado')})`);
  // com <5 Caudas: sem dominar
  st = E.novoEstado(['kitsune', 'zeus', 'zeus'], ['tyr', 'tyr', 'tyr'], 1037); orbs(st.lados[0]);
  ki = st.lados[0].units[0]; ki.contadores.cauda = 4; const ke2 = st.lados[1].units;
  E.agir(st, ki.uid, 'milagre', [ke2[0].uid]);
  ok(!E.ef(ke2[0], 'dominado'), `com 4 Caudas (<5): sem Dominar (${!!E.ef(ke2[0], 'dominado')})`);

  // ---- ANÚBIS ----
  // básico 12 + 1 Atadura
  st = E.novoEstado(['anubis', 'zeus', 'zeus'], ['tyr', 'tyr', 'tyr'], 1038); orbs(st.lados[0]);
  let an = st.lados[0].units[0]; foe = st.lados[1].units[0];
  h = foe.hp; E.agir(st, an.uid, 'basico', [foe.uid]);
  ok(h - foe.hp === 12 && E.getContador(foe, 'atadura') === 1, `Toque do Embalsamador: 12 + 1 Atadura (${h - foe.hp}, atadura ${E.getContador(foe, 'atadura')})`);
  // passiva: +2 dano por Atadura (escopo time — vale p/ aliado) + Atadura bloqueia revive
  st = E.novoEstado(['anubis', 'zeus', 'zeus'], ['tyr', 'tyr', 'tyr'], 1039);
  const aliA = st.lados[0].units[1]; foe = st.lados[1].units[0]; foe.contadores.atadura = 3;
  ok(E.bonusDanoDeclarativo(st, aliA, foe) === 6, `Pesador de Almas: +2×3 Ataduras = +6 (escopo time) (${E.bonusDanoDeclarativo(st, aliA, foe)})`);
  st = E.novoEstado(['anubis', 'zeus', 'zeus'], ['tyr', 'tyr', 'tyr'], 1040);
  foe = st.lados[1].units[0]; foe.contadores.atadura = 1; foe.hp = 5;
  E.bater(st, st.lados[0].units[1], foe, 15, 'afetado', 'basico', {});
  ok(!foe.vivo && foe.naoRevive === true, `inimigo com Atadura abatido → naoRevive (antiReviveContador) (${foe.naoRevive})`);
  // habilidade condicional: mais debuffs que buffs → atordoa + 2 Atadura; senão 25
  st = E.novoEstado(['anubis', 'zeus', 'zeus'], ['tyr', 'tyr', 'tyr'], 1041); orbs(st.lados[0]);
  an = st.lados[0].units[0]; foe = st.lados[1].units[0]; foe.efeitos.push({ type: 'dmgDown', v: 5, dur: 3 }, { type: 'vulneravel', v: 5, dur: 3 });
  h = foe.hp; E.agir(st, an.uid, 'habilidade', [foe.uid]);
  ok(h - foe.hp === 0 && !!E.ef(foe, 'atordoado') && E.getContador(foe, 'atadura') === 2, `Pesagem (mais debuffs): atordoa + 2 Atadura, 0 dano (atordoado ${!!E.ef(foe, 'atordoado')}, atadura ${E.getContador(foe, 'atadura')})`);
  st = E.novoEstado(['anubis', 'zeus', 'zeus'], ['tyr', 'tyr', 'tyr'], 1042); orbs(st.lados[0]);
  an = st.lados[0].units[0]; foe = st.lados[1].units[0]; foe.efeitos.push({ type: 'dmgUp', v: 5, dur: 3 });
  h = foe.hp; E.agir(st, an.uid, 'habilidade', [foe.uid]);
  ok(h - foe.hp === 25, `Pesagem (mais buffs): 25 de dano (${h - foe.hp})`);
  // milagre: +2 Atadura a todos; quem chega a 4 → Selado (a condicional AoE por-alvo, §87)
  st = E.novoEstado(['anubis', 'zeus', 'zeus'], ['tyr', 'tyr', 'tyr'], 1043); orbs(st.lados[0]);
  an = st.lados[0].units[0]; const ae = st.lados[1].units;
  ae[0].contadores.atadura = 2; ae[1].contadores.atadura = 0; ae[2].contadores.atadura = 3;
  E.agir(st, an.uid, 'milagre', []);
  ok(ae.map(x => E.getContador(x, 'atadura')).join(',') === '4,2,5' && !!E.ef(ae[0], 'selado') && !E.ef(ae[1], 'selado') && !!E.ef(ae[2], 'selado'), `Sentença do Duat: +2 a todos (4/2/5), sela só ≥4 (${ae.map(x => (!!E.ef(x, 'selado')))})`);
  console.log('  Susanoo déficit+Combo-por-ataque · Kitsune reducao-por-Cauda+isca+Domina-condicional · Anúbis Atadura (antirevive + +2/atadura + Selado-AoE-por-alvo)');
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
{ const g = base(); g.passiva.fx[0].quando = { alvoMarca: 'olho' }; ok(validarDeus(g).length === 0, 'alvoMarca:olho agora é VÁLIDA (§83, saiu de pendente): ' + JSON.stringify(validarDeus(g))); }
err(g => g.passiva.fx[0].quando = { alvoMarca: 'nuvem' }, 'fora do sub-vocabulário'); // marca fora do vocabulário FECHADO de MARCAS
{ const g = base(); g.passiva.fx[0].quando = { alvoCuradoAntes: true }; ok(validarDeus(g).length === 0, 'alvoCuradoAntes agora é VÁLIDA (§97, saiu de pendente): ' + JSON.stringify(validarDeus(g))); }   // era reservada; o rastreio de dois tempos existe (Tsukuyomi)
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
{ const g = base(); g.passiva.fx.push({ gatilho: 'reducao', v: 5, estado: { primeiroPorTurno: true } }); ok(validarDeus(g).length === 0, 'primeiroPorTurno agora é VÁLIDA (§88, saiu de pendente): ' + JSON.stringify(validarDeus(g))); }   // era reservada; o rastreio existe (Bastet)
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
err(g => g.passiva.fx.push({ gatilho: 'aoCair', quem: 'qualquerAliado', faz: [{ t: 'orbGain', n: 1 }] }), 'quem inválido'); // 'aliado' abriu na F1.6 (§76, Khnum); 'qualquerInimigo' na F1.3 morte 4/4; 'qualquerAliado' segue fora do vocab
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
// §123 Mimir: bonusDano.mesmoMorto (booleano do gatilho) + naoRevivivel (gatilho sem payload)
{ const g = base(); g.passiva.fx[0] = { gatilho: 'bonusDano', v: 6, escopo: 'time', mesmoMorto: true }; ok(validarDeus(g).length === 0, 'bonusDano.mesmoMorto é VÁLIDO (Mimir): ' + JSON.stringify(validarDeus(g))); }
{ const g = base(); g.passiva.fx.push({ gatilho: 'naoRevivivel' }); ok(validarDeus(g).length === 0, 'naoRevivivel sem payload é VÁLIDO (Mimir): ' + JSON.stringify(validarDeus(g))); }
err(g => g.passiva.fx.push({ gatilho: 'naoRevivivel', v: 1 }), 'não pertence ao gatilho');   // naoRevivivel não carrega payload
err(g => g.passiva.fx.push({ gatilho: 'reducao', v: 5, mesmoMorto: true }), 'não pertence ao gatilho'); // mesmoMorto é só de bonusDano
// §126 Leva 1: porDeficitAliados (bonusDano, v:0 permitido por ser escalador) · reducao.porContador · alvoMaisDebuffs (condição)
{ const g = base(); g.passiva.fx[0] = { gatilho: 'bonusDano', v: 0, escopo: 'self', porDeficitAliados: { v: 6 } }; ok(validarDeus(g).length === 0, 'bonusDano.porDeficitAliados (v:0 escalado) VÁLIDO (Susanoo): ' + JSON.stringify(validarDeus(g))); }
{ const g = base(); g.passiva.fx.push({ gatilho: 'reducao', v: 0, porContador: { nome: 'cauda', v: 5, passo: 3 } }); ok(validarDeus(g).length === 0, 'reducao.porContador (v:0 escalado) VÁLIDO (Kitsune): ' + JSON.stringify(validarDeus(g))); }
{ const g = base(); g.passiva.fx[0] = { gatilho: 'bonusDano', v: 10, quando: { alvoMaisDebuffs: true } }; ok(validarDeus(g).length === 0, 'alvoMaisDebuffs é condição VÁLIDA (Anúbis): ' + JSON.stringify(validarDeus(g))); }
err(g => g.passiva.fx.push({ gatilho: 'reducao', v: 5, porDeficitAliados: { v: 6 } }), 'não pertence ao gatilho'); // porDeficitAliados só de bonusDano
console.log('');
console.log(f === 0 ? '>>> PASSIVA OK' : `>>> ${f} FALHA(S)`);
process.exit(f ? 1 : 0);
