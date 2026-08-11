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
// gatilho reducao (sessão 3): eixo defensivo `contra` (separado do `quando` ofensivo)
err(g => g.passiva.fx.push({ gatilho: 'reducao' }), 'exige o campo "v"');                                          // falta v
err(g => g.passiva.fx.push({ gatilho: 'reducao', v: 10, contra: { classe: 'Mágico' } }), 'desconhecida');          // classe ainda não aberta em contra
err(g => g.passiva.fx.push({ gatilho: 'reducao', v: 10, contra: { slot: 'ultimate' } }), 'fora do sub-vocabulário'); // slot inválido
err(g => g.passiva.fx.push({ gatilho: 'reducao', v: 10, quando: { alvoDebuff: 'qualquer' } }), 'não pertence ao gatilho'); // quando (ofensivo) não vai em reducao
err(g => g.passiva.fx.push({ gatilho: 'bonusDano', v: 5, contra: { slot: 'basico' } }), 'não pertence ao gatilho'); // contra (defensivo) não vai em bonusDano
// gatilhos de turno (sessão 4): faz reusa fx, mas só os turno-seguros e sem alvo escolhido
err(g => g.passiva.fx.push({ gatilho: 'porTurno' }), 'exige o campo "faz"');                                        // falta faz
err(g => g.passiva.fx.push({ gatilho: 'porTurno', faz: [{ t: 'dmg', v: 10 }] }), 'não pode disparar por turno');    // dmg fora de fxTurno
err(g => g.passiva.fx.push({ gatilho: 'abertura', faz: [{ t: 'contador', nome: 'discoSolar', v: 1, alvo: 'inimigo' }] }), 'faz não escolhe alvo'); // alvo não pode ser inimigo
// gatilho imunidade (sessão 5): `a` = array não-vazio de tags do sub-vocabulário
err(g => g.passiva.fx.push({ gatilho: 'imunidade' }), 'exige o campo "a"');                       // falta a
err(g => g.passiva.fx.push({ gatilho: 'imunidade', a: [] }), 'array não-vazio');                   // a vazio
err(g => g.passiva.fx.push({ gatilho: 'imunidade', a: ['medo'] }), 'fora do sub-vocabulário');     // medo ainda não é controle (F1.4)
err(g => g.passiva.fx.push({ gatilho: 'imunidade', a: ['adormecido'], v: 5 }), 'não pertence ao gatilho'); // v não vai em imunidade
// gatilho aoCair (sessão 6): quem (sujeito) + faz (efeito no reator)
err(g => g.passiva.fx.push({ gatilho: 'aoCair', faz: [{ t: 'orbGain', n: 1 }] }), 'exige o campo "quem"');        // falta quem
err(g => g.passiva.fx.push({ gatilho: 'aoCair', quem: 'inimigo' }), 'exige o campo "faz"');                        // falta faz
err(g => g.passiva.fx.push({ gatilho: 'aoCair', quem: 'self', faz: [{ t: 'orbGain', n: 1 }] }), 'quem inválido'); // 'self' ainda não aberto
err(g => g.passiva.fx.push({ gatilho: 'aoCair', quem: 'inimigo', faz: [{ t: 'dmg', v: 10 }] }), 'não pode disparar por turno'); // faz turno-seguro
console.log('');
console.log(f === 0 ? '>>> PASSIVA OK' : `>>> ${f} FALHA(S)`);
process.exit(f ? 1 : 0);
