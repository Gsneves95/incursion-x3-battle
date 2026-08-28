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

console.log('== 15. protegeHpMax (§165, itzamna): nenhum aliado termina com maxHp perdido (Podridão restaurada) ==');
{
  const prov = { key: 'x', aliados: ['itzamna', 'kali', 'perseu'], inimigos: ['ares', 'thor', 'ogum'], montar: { seed: 1, comeca: 0 } };
  const ctx = { ladoDe: k => new Set(prov.aliados).has(k) ? 0 : 1 };
  const av = (st, lim) => PROV.PREDICADOS.protegeHpMax.aval(st, { limiar: lim || 0 }, ctx);
  const st = PROV.montarProvacao(prov);
  ok(av(st) === 'ok', 'sem perda de maxHp → ok');
  st.lados[0].units[1].maxHpPerdido = 20;   // Podridão reduziu o maxHp de um aliado
  ok(av(st) === 'falha', 'aliado com maxHp perdido → falha');
  ok(av(st, 20) === 'ok', 'com teto 20, perda de 20 tolerada → ok');
  st.lados[0].units[1].maxHpPerdido = 0;   // Itzamná restaurou (restauraMax)
  ok(av(st) === 'ok', 'restaurado → ok de novo');
  console.log('  o 2º rider do itzamná lê maxHpPerdido — exige a Aurora da Criação na hora certa (§165)');
}

console.log('== 16. protegeDe (§172, PROTEGER_UNIDADE — 5 consumidores): escopo (quem × exceto) e filtro (tipoDano × dot), falha-DURANTE ==');
{
  // fixture SEM interceptor (mnevis/hanuman/bastet interceptariam e redirecionariam o golpe — isso é a proteção deles, testada nas Provações, não aqui)
  const prov = { key: 'x', aliados: ['zeus', 'ra', 'oxum'], inimigos: ['thor', 'ogum', 'tyr'], montar: { seed: 1, comeca: 0 } };
  const ctx = { ladoDe: k => new Set(prov.aliados).has(k) ? 0 : new Set(prov.inimigos).has(k) ? 1 : undefined };
  const av = (st, c) => PROV.PREDICADOS.protegeDe.aval(st, c, ctx);
  const novo = () => PROV.montarProvacao(prov);
  const ini = st => st.lados[1].units[0];
  const u = (st, key) => st.lados.flatMap(l => l.units).find(x => x.key === key);
  // ESCOPO quem: dano na unidade nomeada falha; dano em outro aliado NÃO
  { const st = novo(); E.bater(st, ini(st), u(st, 'ra'), 15, 'afetado', 'basico', { unico: true }); ok(av(st, { quem: 'ra' }) === 'falha', 'quem:ra — golpe em Rá → falha'); }
  { const st = novo(); E.bater(st, ini(st), u(st, 'oxum'), 15, 'afetado', 'basico', { unico: true }); ok(av(st, { quem: 'ra' }) === 'ok', 'quem:ra — golpe em OUTRO aliado → ok (só Rá protegido)'); }
  // ESCOPO exceto: dano em qualquer aliado ≠ protetor falha; dano NO protetor não
  { const st = novo(); E.bater(st, ini(st), u(st, 'ra'), 15, 'afetado', 'basico', { unico: true }); ok(av(st, { exceto: 'zeus' }) === 'falha', 'exceto:zeus — golpe num aliado qualquer → falha'); }
  { const st = novo(); E.bater(st, ini(st), u(st, 'zeus'), 15, 'afetado', 'basico', { unico: true }); ok(av(st, { exceto: 'zeus' }) === 'ok', 'exceto:zeus — golpe NO protetor → ok (ele tanca)'); }
  // FILTRO tipoDano:'unico' — só golpe de alvo único conta; AoE (unico ausente) não
  { const st = novo(); E.bater(st, ini(st), u(st, 'ra'), 15, 'afetado', 'basico', { unico: true }); ok(av(st, { exceto: 'zeus', filtro: { tipoDano: 'unico' } }) === 'falha', 'filtro único — golpe único → falha'); }
  { const st = novo(); E.bater(st, ini(st), u(st, 'ra'), 15, 'afetado', 'milagre', {}); ok(av(st, { exceto: 'zeus', filtro: { tipoDano: 'unico' } }) === 'ok', 'filtro único — golpe de ÁREA (sem unico) → ok'); }
  // FILTRO dot:'queimadura' — só o DoT nomeado conta (evento tipo:'dot', engine l.1343); outro DoT não
  { const st = novo(); st.log.push({ tipo: 'dot', alvo: 'ra', efeito: 'queimadura', valor: 6 }); ok(av(st, { exceto: 'zeus', filtro: { dot: 'queimadura' } }) === 'falha', 'filtro queimadura — tique de Queimadura → falha'); }
  { const st = novo(); st.log.push({ tipo: 'dot', alvo: 'ra', efeito: 'veneno', valor: 6 }); ok(av(st, { exceto: 'zeus', filtro: { dot: 'queimadura' } }) === 'ok', 'filtro queimadura — tique de OUTRO DoT (veneno) → ok'); }
  console.log('  1 predicado, 5 consumidores: unidade-nomeada × aliados-exceto × filtro-tipo/elemento — falha ao 1º dano qualificado (§172)');
}

console.log('== 17. buff-timing (§172): DUAS sub-formas — buffNoAbate (final, hera/vinculo) × buffContinuo (contínuo desde-N, dagda/caldeirao) ==');
{
  const prov = { key: 'x', aliados: ['dagda', 'hera', 'oxum'], inimigos: ['ares', 'thor', 'ogum'], montar: { seed: 1, comeca: 0 } };
  const ctx = { ladoDe: k => new Set(prov.aliados).has(k) ? 0 : 1 };
  const noAbate = (st, buff) => PROV.PREDICADOS.buffNoAbate.aval(st, { buff }, ctx);
  const cont = (st, buff, desde) => PROV.PREDICADOS.buffContinuo.aval(st, { buff, desde }, ctx);
  // buffNoAbate (final): algum aliado com o buff → ok; nenhum → falha
  { const st = PROV.montarProvacao(prov); ok(noAbate(st, 'vinculo') === 'falha', 'buffNoAbate: sem vinculo no time → falha'); st.lados[0].units[1].efeitos.push({ type: 'vinculo', dur: 2 }); ok(noAbate(st, 'vinculo') === 'ok', 'buffNoAbate: um aliado com vinculo → ok'); }
  // buffContinuo (falha-DURANTE): antes de `desde` sempre ok; a partir de `desde`, exige o buff a cada turno
  { const st = PROV.montarProvacao(prov); st.turno = 1; ok(cont(st, 'caldeirao', 3) === 'ok', 'buffContinuo: turno<desde → ok mesmo sem o buff'); st.turno = 3; ok(cont(st, 'caldeirao', 3) === 'falha', 'buffContinuo: turno>=desde sem o buff → falha'); st.lados[0].units[0].efeitos.push({ type: 'caldeirao', dur: 3 }); ok(cont(st, 'caldeirao', 3) === 'ok', 'buffContinuo: turno>=desde com o buff → ok'); }
  console.log('  final (pontual, no abate) × contínuo (uptime desde-N) NÃO cabem num predicado só: modo é estático → duas sub-formas (§172)');
}

console.log('== 18. semPerderAliado ESCOPADO (§172): bare (todos) × {quem} × {exceto} — o "0 MORTE do protegido" ==');
{
  const ctx = { ladoDe: k => (k === 'a1' || k === 'a2' || k === 'prot') ? 0 : 1 };
  const av = (log, c) => PROV.PREDICADOS.semPerderAliado.aval({ log }, c || {}, ctx);
  const quedaA1 = { tipo: 'queda', alvo: 'a1' }, quedaProt = { tipo: 'queda', alvo: 'prot' }, quedaIni = { tipo: 'queda', alvo: 'e1' };
  // bare: qualquer queda de aliado falha (inalterado)
  ok(av([quedaA1]) === 'falha', 'bare: aliado cai → falha');
  ok(av([quedaIni]) === 'ok', 'bare: inimigo cai → ok');
  // quem: só a queda do nomeado falha
  ok(av([quedaA1], { quem: 'prot' }) === 'ok', 'quem:prot — OUTRO aliado cai → ok (só o protegido importa)');
  ok(av([quedaProt], { quem: 'prot' }) === 'falha', 'quem:prot — o protegido cai → falha');
  // exceto: queda de qualquer aliado ≠ protetor falha; a do protetor não
  ok(av([quedaA1], { exceto: 'prot' }) === 'falha', 'exceto:prot — aliado qualquer cai → falha');
  ok(av([quedaProt], { exceto: 'prot' }) === 'ok', 'exceto:prot — o protetor cai → ok (ele se sacrifica)');
  console.log('  bare inalterado (thor et al) · quem/exceto espelham o protegeDe — 0-morte é o que o kit entrega em 3v3 (§172)');
}

console.log('== 19. estadoContinuo (§176, uptime de CAMPO/STATUS — 3 consumidores): campo (Dia/Noite) × statusInimigo, falha-DURANTE desde-N ==');
{
  const ec = (st, c) => PROV.PREDICADOS.estadoContinuo.aval(st, c, { ladoDe: () => 1 });
  const base = () => ({ turno: 2, fase: null, lados: [{ units: [] }, { units: [{ key: 'e', vivo: true, efeitos: [], dots: [] }] }] });
  // campo: antes de `desde` ok; a partir dele exige st.fase===campo
  { const st = base(); st.turno = 1; ok(ec(st, { desde: 2, campo: 'Dia' }) === 'ok', 'campo: turno<desde → ok mesmo sem Dia'); st.turno = 2; ok(ec(st, { desde: 2, campo: 'Dia' }) === 'falha', 'campo: turno>=desde sem Dia → falha'); st.fase = 'Dia'; ok(ec(st, { desde: 2, campo: 'Dia' }) === 'ok', 'campo: turno>=desde com Dia → ok'); }
  // statusInimigo: ≥1 inimigo vivo com o status
  { const st = base(); st.turno = 3; ok(ec(st, { desde: 3, statusInimigo: 'adormecido' }) === 'falha', 'status: nenhum inimigo adormecido → falha'); st.lados[1].units[0].efeitos.push({ type: 'adormecido' }); ok(ec(st, { desde: 3, statusInimigo: 'adormecido' }) === 'ok', 'status: ≥1 inimigo adormecido → ok'); }
  console.log('  campo (st.fase) × statusInimigo (≥1 vivo) — NÃO é o buffContinuo (buff em unidade); 3 consumidores num predicado (§176)');
}

console.log('== 20. hpTetoSelf (§177, ares/mula/odin): HP nunca acima do teto desde-N ("curar anula") — espelho-teto contínuo, falha-DURANTE ==');
{
  const mk = (hp, curado) => ({ turno: 3, lados: [{ units: [{ key: 'ares', vivo: true, hp, curadoAgora: !!curado }] }, { units: [] }] });
  const av = (s, c) => PROV.PREDICADOS.hpTetoSelf.aval(s, c, { ladoDe: () => 0 });
  ok(av(mk(120, false), { quem: 'ares', teto: 60 }) === 'ok', 'HP cheio SEM cura (HP natural) → ok — não é sobre o nível, é sobre a cura');
  ok(av(mk(70, true), { quem: 'ares', teto: 60 }) === 'falha', 'CURADO neste turno e acima do teto → falha ("curar acima de 60 anula")');
  ok(av(mk(55, true), { quem: 'ares', teto: 60 }) === 'ok', 'curado mas ainda <=teto → ok');
  ok(av(mk(90, false), { quem: 'ares', teto: 60 }) === 'ok', 'acima do teto mas SEM cura neste turno → ok (dano/base, não cura)');
  console.log('  é sobre a CURA (u.curadoAgora), não o HP natural — o "curar anula" que NÃO pune o HP inicial (§177)');
}

console.log('== 21. estadoTurnos (§178, uptime RELAXADO): ≥N turnos com o campo ativo — conta turno-events carimbados, NÃO uptime estrito ==');
{
  const av = (log, c) => PROV.PREDICADOS.estadoTurnos.aval({ log }, c, { ladoDe: () => 0 });
  const T = (turno, campo) => ({ tipo: 'turno', turno, campo });
  ok(av([T(1, 'Dia'), T(2, 'Dia'), T(3, null)], { campo: 'Dia', limiar: 2 }) === 'ok', '2 turnos de Dia ≥ 2 → ok');
  ok(av([T(1, 'Dia'), T(2, null)], { campo: 'Dia', limiar: 2 }) === 'pendente', '1 turno de Dia < 2 → pendente');
  ok(av([T(1, 'Dia'), T(1, 'Dia'), T(2, 'Dia')], { campo: 'Dia', limiar: 2 }) === 'ok', 'conta TURNOS distintos (2 events no turno 1 = 1 turno)');
  ok(av([T(1, 'Noite')], { campo: 'Dia', limiar: 1 }) === 'pendente', 'Noite não conta p/ Dia');
  console.log('  ≥N turnos-de-campo (distintos) — o relaxamento do uptime estrito irrealizável (§178)');
}

console.log('== 22. reviveAliado + naoReviveInimigo (§179, núcleo REVIVE): contar revives do lado 0; barrar revive do lado 1 ==');
{
  const ctx = { ladoDe: k => (k === 'a') ? 0 : 1 };
  const ra = (log, q) => PROV.PREDICADOS.reviveAliado.aval({ log }, { quantos: q }, ctx);
  const nr = (log) => PROV.PREDICADOS.naoReviveInimigo.aval({ log }, {}, ctx);
  ok(ra([{ tipo: 'revive', alvo: 'a' }], 1) === 'ok', 'reviveAliado: 1 revive de aliado ≥1 → ok');
  ok(ra([{ tipo: 'revive', alvo: 'a' }], 2) === 'pendente', 'reviveAliado: 1<2 → pendente');
  ok(ra([{ tipo: 'revive', alvo: 'e' }], 1) === 'pendente', 'reviveAliado: revive de INIMIGO não conta');
  ok(nr([{ tipo: 'revive', alvo: 'e' }]) === 'falha', 'naoReviveInimigo: um revive inimigo → falha ("ninguém volta")');
  ok(nr([{ tipo: 'revive', alvo: 'a' }]) === 'ok', 'naoReviveInimigo: revive de aliado não viola');
  console.log('  reviveAliado conta lado 0 (anti-greedy ×1000) · naoReviveInimigo barra lado 1 (§167→§179, hel)');
}

console.log('== 23. soloSobrevivente + tituloCaido (§184, lote AUTO-MORTE): predicados INVERTIDOS (espelhos negativos) ==');
{
  const mk = units => ({ lados: [{ units }], turno: 5 });
  const solo = (units, quem) => PROV.PREDICADOS.soloSobrevivente.aval(mk(units), { quem });
  const soloD = (units, quem) => PROV.PREDICADOS.soloSobrevivente.distancia(mk(units), { quem });
  ok(solo([{ key: 'erinias', vivo: true }, { key: 'a', vivo: false }, { key: 'b', vivo: false }], 'erinias') === 'ok', 'soloSobrevivente: só o título vivo → ok');
  ok(solo([{ key: 'erinias', vivo: true }, { key: 'a', vivo: true }, { key: 'b', vivo: false }], 'erinias') === 'falha', 'soloSobrevivente: outro aliado vivo → falha');
  ok(solo([{ key: 'erinias', vivo: false }, { key: 'a', vivo: false }], 'erinias') === 'falha', 'soloSobrevivente: título MORTO → falha (ele tem de sobreviver)');
  ok(soloD([{ key: 'erinias', vivo: true }, { key: 'a', vivo: true }, { key: 'b', vivo: true }], 'erinias') === 2000, 'soloSobrevivente: 2 outros vivos → distância 2000 (×1000 anti-greedy)');
  ok(soloD([{ key: 'erinias', vivo: false }], 'erinias') === 100000, 'soloSobrevivente: título morto → beco (100000)');
  const tc = (units, quem) => PROV.PREDICADOS.tituloCaido.aval(mk(units), { quem });
  const tcD = (units, quem) => PROV.PREDICADOS.tituloCaido.distancia(mk(units), { quem });
  ok(tc([{ key: 'mimir', vivo: false }, { key: 'odin', vivo: true }], 'mimir') === 'ok', 'tituloCaido: título morto no fim → ok');
  ok(tc([{ key: 'mimir', vivo: true }, { key: 'odin', vivo: true }], 'mimir') === 'falha', 'tituloCaido: título vivo no fim → falha');
  ok(tcD([{ key: 'mimir', vivo: true }], 'mimir') === 1000, 'tituloCaido: vivo → distância 1000 (recompensa deixá-lo morrer)');
  ok(tcD([{ key: 'mimir', vivo: false }], 'mimir') === 0, 'tituloCaido: morto → 0');
  console.log('  soloSobrevivente = semPerderAliado invertido (erinias, solver-alinhado) · tituloCaido = espelho negativo do reviveAliado (mimir/ymir, auto-morte)');
}

console.log('== 24. statusTurnos (§186, orfeu): ≥N turnos com ≥1 inimigo carregando o status — espelha estadoTurnos, lendo statusInimigo ==');
{
  const av = (log, c) => PROV.PREDICADOS.statusTurnos.aval({ log }, c);
  const T = (turno, status) => ({ tipo: 'turno', turno, statusInimigo: status });
  ok(av([T(3, ['adormecido']), T(4, ['adormecido']), T(5, [])], { status: 'adormecido', limiar: 2 }) === 'ok', '2 turnos com inimigo adormecido ≥ 2 → ok');
  ok(av([T(3, ['adormecido']), T(4, [])], { status: 'adormecido', limiar: 2 }) === 'pendente', '1 turno < 2 → pendente');
  ok(av([T(3, ['adormecido']), T(3, ['adormecido']), T(4, ['adormecido'])], { status: 'adormecido', limiar: 2 }) === 'ok', 'conta TURNOS distintos (2 events no turno 3 = 1 turno)');
  ok(av([T(3, ['veneno'])], { status: 'adormecido', limiar: 1 }) === 'pendente', 'outro status não conta');
  console.log('  ≥N turnos-com-status (distintos) — o uptime-de-status relaxado (§186); statusInimigo carimbado no turno-event');
}

console.log('== 25. stripBuffsInimigo (§187, yamato): um golpe removeu ≥N buffs de um inimigo — GOLPE-FINAL, não acumulação ==');
{
  const ctx = { ladoDe: k => (k === 'i') ? 1 : 0 };
  const sb = (log, q) => PROV.PREDICADOS.stripBuffsInimigo.aval({ log }, { quantos: q }, ctx);
  const sbD = (log, q) => PROV.PREDICADOS.stripBuffsInimigo.distancia({ log }, { quantos: q }, ctx);
  const strip = (alvo, qtd) => ({ tipo: 'efeito', efeito: 'buff', ganhouLado: null, alvo, qtd });
  ok(sb([strip('i', 3)], 3) === 'ok', 'um strip de 3 num inimigo ≥3 → ok');
  ok(sb([strip('i', 2)], 3) === 'pendente', 'strip de 2 < 3 → pendente (não acumula entre eventos: é POR GOLPE)');
  ok(sb([strip('i', 2), strip('i', 2)], 3) === 'pendente', 'dois strips de 2 NÃO somam (golpe-final, não volume)');
  ok(sb([strip('a', 3)], 3) === 'pendente', 'strip num ALIADO não conta (perdeuLado do inimigo)');
  ok(sbD([strip('i', 1)], 3) === 60, 'distância: melhor strip 1, falta 2 → 60 (×30)');
  console.log('  ≥N buffs num ÚNICO golpe (não soma entre golpes) — lê o evento de remoção que o motor já loga (§187)');
}

console.log('');
console.log(f === 0 ? '>>> PROVAÇÃO OK' : `>>> ${f} FALHA(S)`);
process.exit(f ? 1 : 0);
