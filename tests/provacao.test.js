// tests/provacao.test.js — o FORMATO da Provação (F2.0).
// Prova: montar carrega um estado jogável; o avaliador resolve (vitória/derrota) pelos 3 MODOS; falha CEDO
// nos modos log/continuo; o `matador`/`estados` no evento `queda` fazem fogo-amigo e morrer-em-estado caírem
// do log (§106); proibirSlotProprio × negarAcaoInimigo são distintos (§144 instr. 4); `quando` é derivado.

const E = require('../src/engine.js');
Object.assign(global, E);   // novoEstado etc. como globais p/ montarProvacao
const PROV = require('../src/provacao.js');
// FIXTURE TUNADO, não o catálogo (§149): o data/provacoes/poseidon.json de produção é a Provação DIFÍCIL
// (120 HP, dica). Este é o Poseidon fácil (60 HP, Maré=9) — entrada CONTROLADA da suíte, estável ao catálogo.
const poseidon = {
  key: 'poseidon', titulo: 'A Maré Não Espera (fixture tunado)',
  aliados: ['poseidon', 'iara', 'sobek'], inimigos: ['ares', 'thor', 'ogum'],
  montar: { seed: 2, comeca: 0, orbs: { '0': { 'Maré': 9 } }, unidades: [{ lado: 1, idx: 0, hp: 60 }, { lado: 1, idx: 1, hp: 60 }, { lado: 1, idx: 2, hp: 60 }] },
  condicoes: [{ predicado: 'deadline', turnos: 8 }, { predicado: 'morteEmEstado', quem: 'inimigo', estado: 'encharcado' }],
};

let f = 0; const ok = (c, m) => { if (!c) { console.log('  FALHA: ' + m); f++; } };
const encharca = u => u.efeitos.push({ type: 'encharcado', dur: 3 });
const matar = (st, atk, alvo) => { alvo.hp = 1; E.bater(st, atk, alvo, 999, 'afetado', 'basico', { unico: false }); };

console.log('== 1. montar: a Provação carrega um estado jogável (novoEstado + overrides) ==');
{
  const st = PROV.montarProvacao(poseidon);
  ok(st.lados[0].units.map(u => u.key).join(',') === 'poseidon,iara,sobek', 'aliados montados');
  ok(st.lados[1].units.map(u => u.key).join(',') === 'ares,thor,ogum', 'inimigos montados');
  ok(st.lados[0].orbs['Maré'] === 9, `override de orbe aplicado (Maré=${st.lados[0].orbs['Maré']})`);
  ok(st.lados[1].units.every(u => u.hp === 60), `override de HP dos inimigos aplicado (montar.unidades)`);
  ok(st.turno === 1 && !st.fim, 'partida em andamento no turno 1');
  console.log('  poseidon carrega: 3v3, Maré=9, inimigos a 60 HP, turno 1');
}

console.log('== 2. Poseidon RESOLVE: deadline (contínuo) + morteEmEstado (log) ==');
{
  // vitória: os três inimigos caem Encharcados, dentro de 8 turnos
  let st = PROV.montarProvacao(poseidon);
  const meu = st.lados[0].units[0];
  st.lados[1].units.forEach(encharca);
  st.lados[1].units.slice().forEach(inim => matar(st, meu, inim));
  ok(st.fim && st.fim.lado === 0, 'base-vitória (os três inimigos caíram)');
  let r = PROV.avaliarProvacao(st, poseidon);
  ok(r.resultado === 'vitoria', `vitória quando os três caem Encharcados em ≤8 turnos (veio ${r.resultado} ${r.motivo || ''})`);

  // derrota LOG (falha cedo): um inimigo cai SECO → morteEmEstado impossível, antes mesmo da base-vitória
  st = PROV.montarProvacao(poseidon);
  matar(st, st.lados[0].units[0], st.lados[1].units[0]);   // sem Encharcado
  r = PROV.avaliarProvacao(st, poseidon);
  ok(r.resultado === 'derrota' && r.motivo === 'morteEmEstado', `derrota cedo quando um inimigo cai seco (${r.resultado}/${r.motivo})`);

  // derrota CONTÍNUO: passou do turno 8 sem vencer
  st = PROV.montarProvacao(poseidon);
  st.turno = 9;
  r = PROV.avaliarProvacao(st, poseidon);
  ok(r.resultado === 'derrota' && r.motivo === 'deadline', `derrota quando o relógio estoura (${r.resultado}/${r.motivo})`);
  console.log('  vitória (3 Encharcados ≤8) · derrota-cedo (seco) · derrota (turno 9)');
}

console.log('== 3. fogo amigo cai do LOG (§106): matador no evento queda, sem rastreio novo ==');
{
  const st = PROV.montarProvacao(poseidon);
  const [ares, thor] = st.lados[1].units;             // dois INIMIGOS
  matar(st, ares, thor);                              // um inimigo abate o outro (matador e alvo no mesmo lado)
  const q = st.log.find(e => e.tipo === 'queda' && e.alvo === 'thor');
  ok(q && q.matador === 'ares', `o evento queda carrega o matador (${q && q.matador})`);
  const ctx = { ladoDe: k => new Set(poseidon.aliados).has(k) ? 0 : new Set(poseidon.inimigos).has(k) ? 1 : undefined };
  ok(PROV.PREDICADOS.abatePeloProprioLado.aval(st, { quantos: 1 }, ctx) === 'ok', 'abatePeloProprioLado conta o abate por aliado do inimigo');
  ok(PROV.PREDICADOS.abatePeloProprioLado.aval(st, { quantos: 2 }, ctx) === 'pendente', 'abatePeloProprioLado ainda pendente para 2 (nunca falha cedo)');
  console.log('  queda.matador presente · fogo-amigo é predicado sobre o log');
}

console.log('== 4. proibirSlotProprio × negarAcaoInimigo são DISTINTOS (§144 instr. 4) ==');
{
  const ctx = { ladoDe: k => new Set(poseidon.aliados).has(k) ? 0 : new Set(poseidon.inimigos).has(k) ? 1 : undefined };
  // só o INIMIGO usou o Milagre
  let st = PROV.montarProvacao(poseidon);
  st.log.push({ tipo: 'acao', origem: 'ares', slot: 'milagre' });
  ok(PROV.PREDICADOS.proibirSlotProprio.aval(st, { slot: 'milagre' }, ctx) === 'ok', 'proibir slot PRÓPRIO: inimigo usando não viola');
  ok(PROV.PREDICADOS.negarAcaoInimigo.aval(st, { slot: 'milagre' }, ctx) === 'falha', 'negar ação INIMIGA: inimigo usando viola');
  // só o ALIADO usou o Milagre
  st = PROV.montarProvacao(poseidon);
  st.log.push({ tipo: 'acao', origem: 'poseidon', slot: 'milagre' });
  ok(PROV.PREDICADOS.proibirSlotProprio.aval(st, { slot: 'milagre' }, ctx) === 'falha', 'proibir slot PRÓPRIO: aliado usando viola');
  ok(PROV.PREDICADOS.negarAcaoInimigo.aval(st, { slot: 'milagre' }, ctx) === 'ok', 'negar ação INIMIGA: aliado usando não viola');
  console.log('  os dois predicados leem lados opostos — não é um com escopo, são dois');
}

console.log('== 5. validação de FORMA (a build recusa condição inválida) ==');
{
  ok(PROV.validarProvacao(poseidon).length === 0, 'a Provação de exemplo é válida');
  const desc = PROV.validarProvacao({ key: 'x', aliados: ['zeus'], inimigos: ['zeus'], condicoes: [{ predicado: 'inventado' }] });
  ok(desc.some(e => /DESCONHECIDO/.test(e)), 'predicado desconhecido é recusado (falha alto)');
  const semCampo = PROV.validarProvacao({ key: 'y', aliados: ['zeus'], inimigos: ['zeus'], condicoes: [{ predicado: 'deadline' }] });
  ok(semCampo.some(e => /turnos/.test(e)), 'campo obrigatório ausente é recusado');
  const declQuando = PROV.validarProvacao({ key: 'z', aliados: ['zeus'], inimigos: ['zeus'], condicoes: [{ predicado: 'deadline', turnos: 5, quando: 'fim' }] });
  ok(declQuando.some(e => /DERIVADO/.test(e)), '`quando` declarado é recusado (é derivado do modo)');
  console.log('  exemplo válido · desconhecido/sem-campo/quando-declarado recusados');
}

console.log('== 6. `quando` é DERIVADO do modo (não declarado) ==');
{
  ok(PROV.MODOS[PROV.PREDICADOS.deadline.modo] === 'cedo', 'contínuo → falha cedo');
  ok(PROV.MODOS[PROV.PREDICADOS.morteEmEstado.modo] === 'cedo', 'log → falha cedo');
  ok(PROV.MODOS[PROV.PREDICADOS.hpNoFim.modo] === 'fim', 'final → julga no fim');
  console.log('  deadline/morteEmEstado → cedo · hpNoFim → fim');
}

console.log('== 7. TAG de roubo/remoção (§153): roubo-p/-si conta, remoção e roubo-inimigo NÃO ==');
{
  const acu = (log, fonte, limiar) => { const st = { lados: [{}, {}], log }; return PROV.PREDICADOS.acumulo.aval(st, { fonte, limiar }, { ladoDe: () => 0 }); };
  // orbe: só o GANHO do jogador (ganhouLado 0, valor>0) conta — não a perda, não o gasto, não o roubo inimigo
  const orbeLog = [
    { tipo: 'orbe', lado: 1, valor: -2, perdeuLado: 1, ganhouLado: 0 },   // inimigo perdeu p/ o jogador (roubo)
    { tipo: 'orbe', lado: 0, valor: 2, perdeuLado: 1, ganhouLado: 0 },    // jogador GANHOU (conta: +2)
    { tipo: 'orbe', lado: 0, valor: -3, para: 'Maré' },                   // GASTO (sem tag) — não conta
    { tipo: 'orbe', lado: 0, valor: -1, perdeuLado: 0, ganhouLado: 1 },   // jogador perdeu p/ inimigo (roubo inimigo) — não conta como roubado-por-mim
  ];
  ok(acu(orbeLog, 'orbesRoubados', 2) === 'ok', 'orbesRoubados conta só o ganho do jogador (2), não perda/gasto');
  ok(acu(orbeLog, 'orbesRoubados', 3) === 'pendente', 'não dobra a contagem nem soma gasto/roubo-inimigo');
  // buff: roubo-p/-si (ganhouLado 0) conta; REMOÇÃO pura (ganhouLado null) NÃO — o erro que o §153 evita
  const buffLog = [
    { tipo: 'efeito', alvo: 'x', efeito: 'dmgUp', duracao: 0, perdeuLado: 1, ganhouLado: 0, qtd: 1 },   // roubou 1 p/ si
    { tipo: 'efeito', alvo: 'y', efeito: 'buff', duracao: 0, perdeuLado: 1, ganhouLado: null, qtd: 3 },  // REMOÇÃO pura (yamato/iansã) — NÃO conta como roubado
  ];
  ok(acu(buffLog, 'buffsRoubados', 1) === 'ok', 'buffsRoubados conta o roubo-p/-si (1)');
  ok(acu(buffLog, 'buffsRoubados', 2) === 'pendente', 'remoção pura (ganhouLado null) NÃO infla buffsRoubados — o bug invisível que o §153 evita');
  console.log('  orbe: ganho conta, perda/gasto/roubo-inimigo não · buff: roubo-p/-si conta, remoção não');
}

console.log('== 8. semPerderOrbe (§156, heimdall): só o ROUBO inimigo (perdeuLado 0 & ganhouLado 1) viola ==');
{
  const sem = (log) => PROV.PREDICADOS.semPerderOrbe.aval({ log }, {}, { ladoDe: () => 0 });
  // roubo INIMIGO do orbe do jogador → falha
  ok(sem([{ tipo: 'orbe', lado: 0, valor: -1, perdeuLado: 0, ganhouLado: 1 }]) === 'falha', 'perder orbe PARA o inimigo (roubo) viola');
  // GASTO (paga custo, sem tag) → ok (não é "para o inimigo")
  ok(sem([{ tipo: 'orbe', lado: 0, valor: -3, para: 'Maré' }]) === 'ok', 'gastar orbe (custo, sem tag) NÃO viola — o §153 distingue gasto de roubo');
  // REMOÇÃO pura do orbe do jogador (ganhouLado null) → ok (não foi PARA o inimigo)
  ok(sem([{ tipo: 'orbe', lado: 0, valor: -1, perdeuLado: 0, ganhouLado: null }]) === 'ok', 'remoção pura (ninguém ganhou) NÃO viola — "para o inimigo" é roubo');
  // eu roubando do inimigo (ganhouLado 0) → ok
  ok(sem([{ tipo: 'orbe', lado: 0, valor: 2, perdeuLado: 1, ganhouLado: 0 }]) === 'ok', 'eu roubar do inimigo não é perder orbe');
  console.log('  roubo-inimigo viola · gasto/remoção-pura/roubo-meu não — a distinção do tag §153 em ação');
}

console.log('== 9. limparBuffsAntesDeAbate (§156, iansã): limpar TODOS os buffs inimigos ANTES da 1ª queda ==');
{
  const av = (marcos, log) => PROV.PREDICADOS.limparBuffsAntesDeAbate.aval({ marcos, log }, {}, { ladoDe: () => 1 });
  ok(av({ semBuffLado: [null, 3] }, []) === 'ok', 'limpou (t3) sem nenhuma queda → ok');
  ok(av({ semBuffLado: [null, 3] }, [{ tipo: 'queda', alvo: 'x', turno: 5 }]) === 'ok', 'limpou (t3) ANTES da queda (t5) → ok');
  ok(av({ semBuffLado: [null, 6] }, [{ tipo: 'queda', alvo: 'x', turno: 4 }]) === 'falha', 'caiu (t4) ANTES de limpar (t6) → falha (impossível)');
  ok(av({ semBuffLado: [null, null] }, [{ tipo: 'queda', alvo: 'x', turno: 4 }]) === 'falha', 'caiu sem nunca limpar → falha');
  ok(av({ semBuffLado: [null, null] }, []) === 'pendente', 'ainda não limpou, ninguém caiu → pendente (nunca falha cedo à toa)');
  console.log('  limpar-antes → ok · matar-antes-de-limpar → falha · nada ainda → pendente');
}

console.log('== 10. maximoNumEvento (§156, loki): PICO por turno, NÃO a soma cumulativa (a distinção saci×loki) ==');
{
  const mx = (log, fonte, limiar) => PROV.PREDICADOS.maximoNumEvento.aval({ log }, { fonte, limiar }, { ladoDe: () => 0 });
  const acu = (log, fonte, limiar) => PROV.PREDICADOS.acumulo.aval({ lados:[{}, {}], log }, { fonte, limiar }, { ladoDe: () => 0 });
  // dois turnos roubando 3 cada: cumulativo=6, PICO=3
  const doisTurnos = [
    { tipo: 'efeito', turno: 2, efeito: 'buff', ganhouLado: 0, qtd: 3 },
    { tipo: 'efeito', turno: 5, efeito: 'buff', ganhouLado: 0, qtd: 3 },
  ];
  ok(mx(doisTurnos, 'buffsRoubados', 6) === 'pendente', 'pico ≠ soma: 3+3 em turnos distintos NÃO satisfaz pico 6');
  ok(mx(doisTurnos, 'buffsRoubados', 3) === 'ok', 'pico 3 (um turno) satisfaz limiar 3');
  ok(acu(doisTurnos, 'buffsRoubados', 6) === 'ok', 'acumulo (saci) SOMA os dois turnos → 6 ok — a MESMA log, leituras diferentes (§46)');
  // um turno, 3 fontes de 2 (uma Trama que rouba de 3 inimigos): pico=6
  const umTurno = [
    { tipo: 'efeito', turno: 3, efeito: 'buff', ganhouLado: 0, qtd: 2 },
    { tipo: 'efeito', turno: 3, efeito: 'buff', ganhouLado: 0, qtd: 2 },
    { tipo: 'efeito', turno: 3, efeito: 'buff', ganhouLado: 0, qtd: 2 },
  ];
  ok(mx(umTurno, 'buffsRoubados', 6) === 'ok', 'uma Trama roubando 2+2+2 no MESMO turno = pico 6 → ok');
  console.log('  pico-por-turno ≠ soma cumulativa · a mesma log serve os dois predicados (§46)');
}

console.log('== 11. `quantos` (§161): forma-CONTAGEM "≥N caem carregando" ≠ forma-canônica "TODOS" ==');
{
  const ctx = { ladoDe: () => 1 };   // todas as quedas do log são do lado inimigo
  const me = (log, c) => PROV.PREDICADOS.morteEmEstado.aval({ log, lados: [{ units: [] }, { units: [] }] }, { quem: 'inimigo', estado: 'sangramento', ...c }, ctx);
  const mc = (log, c) => PROV.PREDICADOS.morteComContador.aval({ log, lados: [{ units: [] }, { units: [] }] }, { quem: 'inimigo', contador: 'podridao', limiar: 2, ...c }, ctx);
  const comEstado = { tipo: 'queda', alvo: 'x', estados: ['sangramento'] };
  const semEstado = { tipo: 'queda', alvo: 'y', estados: ['veneno'] };
  // TODOS (sem quantos): uma queda SEM o estado → falha
  ok(me([comEstado, semEstado], {}) === 'falha', 'TODOS: uma morte sem o estado falha');
  ok(me([comEstado], {}) === 'ok', 'TODOS: todas com o estado → ok');
  // CONTAGEM (quantos:1): morte SEM o estado NÃO falha; conta só as COM
  ok(me([semEstado], { quantos: 1 }) === 'pendente', 'CONTAGEM: morte sem o estado não falha (fica pendente)');
  ok(me([semEstado, comEstado], { quantos: 1 }) === 'ok', 'CONTAGEM: ≥1 carregando → ok mesmo com outra morte sem');
  ok(me([comEstado], { quantos: 2 }) === 'pendente', 'CONTAGEM: 1<2 → pendente');
  // morteComContador espelha
  const pod2 = { tipo: 'queda', alvo: 'x', contadores: { podridao: 2 } };
  const pod1 = { tipo: 'queda', alvo: 'y', contadores: { podridao: 1 } };
  ok(mc([pod2, pod1], {}) === 'falha', 'TODOS: uma morte com <limiar falha');
  ok(mc([pod1], { quantos: 1 }) === 'pendente', 'CONTAGEM: morte com <limiar não conta nem falha');
  ok(mc([pod1, pod2], { quantos: 1 }) === 'ok', 'CONTAGEM: ≥1 com o limiar → ok');
  console.log('  contagem não falha na morte-sem · TODOS falha · o mesmo predicado, o quantificador muda a leitura (§161)');
}

console.log('== 12. LEITORES do lote 5 (§162): danoRefletido, danoArmazenado, danoAbsorvido (escudo+soak) — motor EMITE, acumuladoDe LÊ ==');
{
  const prov = { key: 'x', aliados: ['cernunnos', 'khnum', 'oxum'], inimigos: ['ares', 'thor', 'ogum'], montar: { seed: 1, comeca: 0 } };
  const ctx = { ladoDe: k => new Set(prov.aliados).has(k) ? 0 : new Set(prov.inimigos).has(k) ? 1 : undefined };
  const lido = (st, fonte) => Number(PROV.PREDICADOS.acumulo.chave(st, { fonte, limiar: 1 }, ctx));
  // danoRefletido: um aliado com refleteDano é atingido → o revide é MARCADO (reflexo) e o leitor o soma (valor = dano que de fato voltou)
  {
    const st = PROV.montarProvacao(prov);
    const ali = st.lados[0].units[2], ini = st.lados[1].units[0];
    ali.efeitos.push({ type: 'refleteDano', v: 10, dur: 2 });
    E.bater(st, ini, ali, 15, 'afetado', 'basico', { unico: true });
    const refEv = st.log.find(e => e.tipo === 'dano' && e.reflexo);
    ok(refEv && refEv.valor > 0 && lido(st, 'danoRefletido') === refEv.valor, `danoRefletido casa com o golpe marcado reflexo (=${lido(st, 'danoRefletido')})`);
  }
  // danoArmazenado: um aliado com armazenaDano sofre dano → a vault guarda e o evento `armazenado` é somado
  {
    const st = PROV.montarProvacao(prov);
    const ali = st.lados[0].units[2], ini = st.lados[1].units[0];
    ali.efeitos.push({ type: 'armazenaDano', acc: 0, dur: 2, max: 99, alvo: null });
    E.bater(st, ini, ali, 20, 'afetado', 'basico', { unico: true });
    const armEv = st.log.find(e => e.tipo === 'armazenado');
    ok(armEv && armEv.valor > 0 && lido(st, 'danoArmazenado') === armEv.valor, `danoArmazenado casa com a vault (=${lido(st, 'danoArmazenado')})`);
  }
  // danoAbsorvido (escudo): Def Destrutível absorve → conta
  {
    const st = PROV.montarProvacao(prov);
    const ali = st.lados[0].units[2], ini = st.lados[1].units[0];
    ali.shield = 25;
    E.bater(st, ini, ali, 10, 'afetado', 'basico', { unico: true });
    ok(lido(st, 'danoAbsorvido') === 10, `danoAbsorvido lê o escudo (=${lido(st, 'danoAbsorvido')}, esperado 10)`);
  }
  // danoAbsorvido (soak): Khnum intercepta o golpe de alvo único → o dano engolido conta
  {
    const st = PROV.montarProvacao(prov);
    const khnum = st.lados[0].units[1], protegido = st.lados[0].units[2], ini = st.lados[1].units[0];
    khnum.efeitos.push({ type: 'intercepta', protege: 'time', contra: 'todos', dur: 2 });
    const hpKhnumAntes = khnum.hp;
    E.bater(st, ini, protegido, 12, 'afetado', 'basico', { unico: true });
    const soakEv = st.log.find(e => e.tipo === 'dano' && e.soak);
    ok(khnum.hp < hpKhnumAntes, 'Khnum engoliu o golpe (hp caiu) — a interceptação roteou p/ ele');
    ok(soakEv && soakEv.alvo === khnum.key && lido(st, 'danoAbsorvido') === soakEv.soak, `danoAbsorvido lê o soak da interceptação (=${lido(st, 'danoAbsorvido')})`);
  }
  console.log('  os 3 leitores casam com o que o motor emite (junta ligada, §162) — nasce testado (§87)');
}

console.log('== 13. REESCRITAS §162 (do que se COLETA p/ o que se ENTREGA): danoDevolvido (Xangô) e abatePorSlot (Cernunnos) ==');
{
  const prov = { key: 'x', aliados: ['xango', 'cernunnos', 'oxum'], inimigos: ['ares', 'thor', 'ogum'], montar: { seed: 1, comeca: 0 } };
  const ctx = { ladoDe: k => new Set(prov.aliados).has(k) ? 0 : new Set(prov.inimigos).has(k) ? 1 : undefined };
  const lido = (st, fonte) => Number(PROV.PREDICADOS.acumulo.chave(st, { fonte, limiar: 1 }, ctx));
  // danoDevolvido: o golpe com slot 'armazenado' (devolução da Balança) é marcado e somado
  {
    const st = PROV.montarProvacao(prov);
    const xango = st.lados[0].units[0], ini = st.lados[1].units[0];
    E.bater(st, xango, ini, 40, 'puro', 'armazenado', {});
    const devEv = st.log.find(e => e.tipo === 'dano' && e.devolvido);
    ok(devEv && devEv.valor > 0 && lido(st, 'danoDevolvido') === devEv.devolvido, `danoDevolvido casa com a devolução da Balança (=${lido(st, 'danoDevolvido')})`);
  }
  // abatePorSlot: um inimigo que cai por um golpe de slot 'reflexo' conta; slot errado NÃO conta
  {
    const st = PROV.montarProvacao(prov);
    const refletor = st.lados[0].units[1], ini = st.lados[1].units[0];
    ini.hp = 5;
    E.bater(st, refletor, ini, 999, 'afetado', 'reflexo', { semContra: true, semIntercepta: true });
    const qd = st.log.find(e => e.tipo === 'queda' && e.alvo === ini.key);
    ok(qd && qd.slot === 'reflexo', 'a queda carrega o slot do golpe letal (reflexo)');
    const av = (slot, q) => PROV.PREDICADOS.abatePorSlot.aval(st, { quem: 'inimigo', slot, quantos: q }, ctx);
    ok(av('reflexo', 1) === 'ok', 'abatePorSlot{reflexo,1} = ok');
    ok(av('reflexo', 2) === 'pendente', 'abatePorSlot{reflexo,2} = pendente (só 1 caiu por reflexo)');
    ok(av('milagre', 1) === 'pendente', 'abatePorSlot{milagre,1} = pendente (o slot errado não conta)');
  }
  console.log('  entregar (devolução) e abater-pelo-slot (reflexo) — o rider cavalga o abate (§162)');
}

console.log('== 14. LEITORES do lote 6 (§163): contadorLado (combo=pool) e danoBonus (soma do dmgUp) ==');
{
  const prov = { key: 'x', aliados: ['susanoo', 'hercules', 'brahma'], inimigos: ['ares', 'thor', 'ogum'], montar: { seed: 1, comeca: 0 } };
  const ctx = { ladoDe: k => new Set(prov.aliados).has(k) ? 0 : 1 };
  const lido = (st, fonte, contador) => Number(PROV.PREDICADOS.acumulo.chave(st, { fonte, contador, limiar: 1 }, ctx));
  // contadorLado: combo mora no POOL do lado, não no contador por-unidade
  {
    const st = PROV.montarProvacao(prov);
    st.lados[0].contadores = st.lados[0].contadores || {}; st.lados[0].contadores.combo = 10;
    st.lados[0].units[0].contadores.combo = 3;   // ruído por-unidade que o leitor NÃO deve somar
    ok(lido(st, 'contadorLado', 'combo') === 10, `contadorLado lê o POOL (=${lido(st, 'contadorLado', 'combo')}, esperado 10)`);
    ok(lido(st, 'contador', 'combo') === 3, `o 'contador' antigo lê POR-UNIDADE (=${lido(st, 'contador', 'combo')}) — são leitores distintos`);
  }
  // danoBonus: soma o dmgUp (merge → um por unidade, .v acumula — l.499 do motor) do time
  {
    const st = PROV.montarProvacao(prov);
    st.lados[0].units[0].efeitos.push({ type: 'dmgUp', v: 7, dur: 99 });   // merge de 4+3 numa unidade
    st.lados[0].units[1].efeitos.push({ type: 'dmgUp', v: 5, dur: 2 });    // +5 noutra
    ok(lido(st, 'danoBonus') === 12, `danoBonus soma o dmgUp do time (=${lido(st, 'danoBonus')}, esperado 12)`);
  }
  console.log('  contadorLado (pool) ≠ contador (por-unidade) · danoBonus soma o dmgUp — leitores prontos antes das Provações (§134/§87)');
}

console.log('');
console.log(f === 0 ? '>>> PROVAÇÃO OK' : `>>> ${f} FALHA(S)`);
process.exit(f ? 1 : 0);
