// ===================================================================
// Primitivas de efeito (ROTEIRO fase 1, item 6).
// Cada primitiva é exercitada em ISOLAMENTO, antes de qualquer um dos 89
// deuses restantes — é a garantia de que o modelo de dados cabe antes de
// escrever kit em cima dele. Usa aplicarFx/bater/fimTurno diretamente e, para
// escolha-múltipla e cópia (que passam por agir), dois deuses de teste.
// ===================================================================
const E = require('../src/engine.js');
let f = 0; const ok = (c, m) => { if (!c) { console.log('  FALHA: ' + m); f++; } };
const A = (alvo, slot) => ({ alvo, slot: slot || 'habilidade' });   // "ability" mínima para aplicarFx

// ------------------------------------------------------------ 1. contadores
console.log('== 1. contadores acumuláveis: somam, teto, escalam dano, consomem ==');
{
  const st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 101);
  const u = st.lados[0].units[0];
  E.aplicarFx(st, u, [{ t: 'contador', nome: 'discoSolar', v: 1, alvo: 'self', max: 6 }], A('nenhum', 'basico'), []);
  E.aplicarFx(st, u, [{ t: 'contador', nome: 'discoSolar', v: 2, alvo: 'self', max: 6 }], A('nenhum', 'basico'), []);
  ok(E.getContador(u, 'discoSolar') === 3, `deveria somar para 3, tem ${E.getContador(u, 'discoSolar')}`);
  E.addContador(st, u, 'discoSolar', 10, 6);
  ok(E.getContador(u, 'discoSolar') === 6, 'o teto de 6 deveria valer');
  // Olho de Rá: 16 a todos, +4 por Disco (=40), consome todos
  const e0 = st.lados[1].units[0], e1 = st.lados[1].units[1], h0 = e0.hp, h1 = e1.hp;
  E.aplicarFx(st, u, [{ t: 'dmg', v: 16, escopo: 'todosInimigos', porContador: { nome: 'discoSolar', onde: 'self', v: 4 }, consomeContador: 'discoSolar' }], A('todosInimigos', 'milagre'), []);
  ok(h0 - e0.hp === 40 && h1 - e1.hp === 40, `todos os inimigos deveriam levar 40, levaram ${h0 - e0.hp}/${h1 - e1.hp}`);
  ok(E.getContador(u, 'discoSolar') === 0, 'o contador deveria ser consumido depois de escalar TODOS os alvos');
  console.log(`  soma 3 · teto 6 · Olho de Rá 16+4×6=40 em todos · consumido a 0`);
}
{ // contador no campo (Ah Puch: +8 por Podridão em campo)
  const st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 102);
  const u = st.lados[0].units[0];
  E.addContador(st, st.lados[1].units[0], 'podridao', 2);
  E.addContador(st, st.lados[1].units[1], 'podridao', 1);
  ok(E.contadorNoCampo(st, 'podridao', 1) === 3, 'campo deveria somar 3 Podridões');
  const e0 = st.lados[1].units[0], h0 = e0.hp;
  E.aplicarFx(st, u, [{ t: 'dmg', v: 18, escopo: 'todosInimigos', porContadorCampo: { nome: 'podridao', lado: 'inimigos', v: 8 } }], A('todosInimigos', 'milagre'), []);
  ok(h0 - e0.hp === 18 + 24, `18 + 8×3 = 42 esperado, deu ${h0 - e0.hp}`);
  console.log(`  Portões de Xibalbá: 18 + 8×3 Podridões = 42`);
}
console.log('== 1b. limiar de contador: CRUZAR N dispara efeito UMA vez (gatilho-no-acúmulo, F1.1) ==');
{ // família "gatilho-no-acúmulo": dispara sozinho quando o número cruza `em` (≠ condição-na-ação)
  const st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 103);
  const u = st.lados[0].units[0], alvo = st.lados[1].units[0];
  const FX = v => ({ t: 'contador', nome: 'atadura', v, limiar: { em: 4, aplica: { type: 'atordoado', dur: 2 } } });
  E.aplicarFx(st, u, [FX(3)], A('inimigo', 'milagre'), [alvo]);          // 3: abaixo do limiar
  ok(E.getContador(alvo, 'atadura') === 3 && !E.ef(alvo, 'atordoado'), 'abaixo de 4 não dispara');
  E.aplicarFx(st, u, [FX(2)], A('inimigo', 'milagre'), [alvo]);          // 3->5: cruza o 4 DE UMA VEZ (edge #2)
  ok(E.getContador(alvo, 'atadura') === 5 && !!E.ef(alvo, 'atordoado'), 'cruzar de uma vez (3→5) dispara o limiar');
  alvo.efeitos = alvo.efeitos.filter(e => e.type !== 'atordoado');       // limpa e acumula a 6ª (edge #1)
  E.aplicarFx(st, u, [FX(1)], A('inimigo', 'milagre'), [alvo]);
  ok(E.getContador(alvo, 'atadura') === 6 && !E.ef(alvo, 'atordoado'), 'acúmulo acima do limiar NÃO redispara (chegar a 4, não estar em 4+)');
  console.log('  <4 nada · 3→5 cruza e dispara · 6ª acima não redispara');
}
{ // edge #3: cruza o limiar, mas o controle FALHA por imunidade; contador fica, SEM retroação
  const st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 104);
  const u = st.lados[0].units[0], alvo = st.lados[1].units[0];
  alvo.efeitos.push({ type: 'controlImmune', dur: 9 });
  const FX = v => ({ t: 'contador', nome: 'atadura', v, limiar: { em: 4, aplica: { type: 'atordoado', dur: 2 } } });
  E.aplicarFx(st, u, [FX(4)], A('inimigo', 'milagre'), [alvo]);          // cruza 4, mas atordoar falha (imune)
  ok(E.getContador(alvo, 'atadura') === 4 && !E.ef(alvo, 'atordoado'), 'imune: cruza mas o controle falha; contador acumula até 4');
  alvo.efeitos = alvo.efeitos.filter(e => e.type !== 'controlImmune');   // imunidade cai; 5ª não re-cruza
  E.aplicarFx(st, u, [FX(1)], A('inimigo', 'milagre'), [alvo]);
  ok(!E.ef(alvo, 'atordoado'), 'SEM retroação: cair a imunidade não aplica o efeito que falhou');
  console.log('  imune: contra-controle falha, contador segue, sem retroação');
}

// ------------------------------------------------------- 2. estado Dia/Noite
console.log('== 2. estado global Dia/Noite: ativa, escala dano, expira ==');
{
  const st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 103);
  const u = st.lados[0].units[0], e0 = st.lados[1].units[0];
  E.aplicarFx(st, u, [{ t: 'fase', v: 'Dia', dur: 2 }], A('nenhum'), []);
  ok(st.fase === 'Dia', 'deveria ativar o Dia');
  const h0 = e0.hp;
  E.aplicarFx(st, u, [{ t: 'dmg', v: 18, seDia: 28 }], A('inimigo', 'milagre'), [e0]);
  ok(h0 - e0.hp === 28, `durante o Dia deveria bater 28, bateu ${h0 - e0.hp}`);
  E.fimTurno(st); E.fimTurno(st);   // conta 2 turnos de jogador
  ok(st.fase === null, `o Dia deveria ter expirado, é ${st.fase}`);
  console.log(`  Dia ativo → dano 18 vira 28 · expira após 2 turnos`);
}

// ------------------------------------------------------------- 3. Vida Extra
console.log('== 3. Vida Extra: revive no ato ao cair, uma vez ==');
{
  const st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 104);
  const b = st.lados[0].units[1], atk = st.lados[1].units[0];
  E.aplicarFx(st, st.lados[0].units[0], [{ t: 'vidaExtra', hp: 25 }], A('aliado', 'milagre'), [b]);
  E.bater(st, atk, b, 999, 'puro', 'milagre', {});
  ok(b.vivo && b.hp === 25, `deveria reviver na hora com 25, vivo=${b.vivo} hp=${b.hp}`);
  ok(b.vidaExtra === null, 'a Vida Extra deveria ter sido consumida');
  E.bater(st, atk, b, 999, 'puro', 'milagre', {});
  ok(!b.vivo, 'sem Vida Extra, o segundo golpe letal deveria matar');
  console.log(`  golpe letal → revive a 25 · consumida · 2º golpe mata`);
}

// ---------------------------------------------------------------- 4. revive
console.log('== 4. revive: traz caído de volta, respeita "não pode ser revivido" ==');
{
  const st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 105);
  const heal = st.lados[0].units[0], b = st.lados[0].units[1], c = st.lados[0].units[2];
  b.vivo = false; b.hp = 0;
  E.aplicarFx(st, heal, [{ t: 'revive', hp: 50, escopo: 'aliadoCaido' }], A('aliado', 'milagre'), [b]);
  ok(b.vivo && b.hp === 50, `deveria reviver com 50, vivo=${b.vivo} hp=${b.hp}`);
  c.vivo = false; c.hp = 0; c.naoRevive = true;
  E.aplicarFx(st, heal, [{ t: 'revive', hp: 50, escopo: 'aliadoCaido' }], A('aliado', 'milagre'), [c]);
  ok(!c.vivo, 'quem está marcado como irrevivível não deveria voltar');
  console.log(`  revive a 50 · bloqueado por naoRevive`);
}

// -------------------------------------------------- 5. contagem de morte
console.log('== 5. contagem de morte: escala por aliado caído + Livro executa ==');
{
  const st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 106);
  const u = st.lados[0].units[0], e0 = st.lados[1].units[0];
  st.lados[0].units[1].vivo = false; st.lados[0].units[2].vivo = false;   // 2 caídos
  ok(E.caidos(st, 0) === 2, 'deveria contar 2 aliados caídos');
  const h0 = e0.hp;
  E.aplicarFx(st, u, [{ t: 'dmg', v: 10, porAliadoCaido: 8 }], A('inimigo', 'basico'), [e0]);
  ok(h0 - e0.hp === 26, `10 + 8×2 = 26 esperado (Rei dos Mortos), deu ${h0 - e0.hp}`);
  console.log(`  +8 por aliado caído: 10 → 26`);
}
{ // Livro da Vida e Morte executa ao fim da contagem
  const st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 107);
  const x = st.lados[1].units[0];
  x.efeitos.push({ type: 'livro', dur: 1 });     // inscrito, contagem termina neste turno dele
  E.fimTurno(st);   // encerra turno do Jogador 1 → passa para o 2
  E.fimTurno(st);   // encerra turno do Jogador 2 → o Livro dispara
  ok(!x.vivo, 'o inscrito deveria ser executado ao fim da contagem');
  ok(x.naoRevive, 'quem morre sob o Livro não pode ser revivido');
  console.log(`  inscrito executado ao zerar a contagem · marcado irrevivível`);
}

// -------------------------------------------------------- 6. dano armazenado
console.log('== 6. dano armazenado: acumula o sofrido e devolve (teto) ==');
{
  const st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 108);
  const xango = st.lados[0].units[0], ally = st.lados[0].units[1], alvo = st.lados[1].units[0];
  E.aplicarFx(st, xango, [{ t: 'armazenaDano', dur: 1, max: 50 }], A('inimigo', 'habilidade'), [alvo]);
  const enemy = st.lados[1].units[1];
  E.bater(st, enemy, ally, 40, 'afetado', 'basico', {});   // time sofre 40
  E.bater(st, enemy, xango, 30, 'afetado', 'basico', {});  // e mais 30 (acc=70)
  const h0 = alvo.hp;
  E.fimTurno(st);   // expira o armazenamento e devolve
  ok(h0 - alvo.hp === 50, `deveria devolver o teto de 50 (acc 70), devolveu ${h0 - alvo.hp}`);
  console.log(`  acumulou 70, devolveu 50 (teto) como dano puro`);
}

// ----------------------------------------------------------- 7. interceptar
console.log('== 7. interceptar: protetor assume o golpe de alvo único ==');
{
  const st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 109);
  const prot = st.lados[0].units[0], ally = st.lados[0].units[1], atk = st.lados[1].units[0];
  E.aplicarFx(st, prot, [{ t: 'intercepta', dur: 2, contra: 'unico' }], A('aliado', 'habilidade'), [ally]);
  const hp0 = ally.hp, hp1 = prot.hp;
  E.bater(st, atk, ally, 15, 'afetado', 'basico', { unico: true });
  ok(ally.hp === hp0, `o aliado protegido não deveria sofrer, sofreu ${hp0 - ally.hp}`);
  ok(hp1 - prot.hp === 15, `o protetor deveria levar os 15, levou ${hp1 - prot.hp}`);
  // uso único: o próximo golpe já não é interceptado
  E.bater(st, atk, ally, 15, 'afetado', 'basico', { unico: true });
  ok(hp0 - ally.hp === 15, 'depois do uso único, o aliado volta a sofrer');
  console.log(`  golpe redirecionado ao protetor · consumido no uso único`);
}

// --------------------------------------------------------- 8. contra-atacar
console.log('== 8. contra-atacar: quem carrega o efeito revida golpe único ==');
{
  const st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 110);
  const b = st.lados[0].units[0], atk = st.lados[1].units[0];
  b.efeitos.push({ type: 'contraAtaca', v: 15, dur: 2, contra: 'todos' });
  const ha = atk.hp;
  E.bater(st, atk, b, 12, 'afetado', 'basico', { unico: true });
  ok(ha - atk.hp === 15, `o atacante deveria levar 15 de volta, levou ${ha - atk.hp}`);
  // golpe de área (não-único) não sofre contra-ataque
  const ha2 = atk.hp;
  E.bater(st, atk, b, 12, 'afetado', 'milagre', { unico: false });
  ok(atk.hp === ha2, 'golpe de área não deveria ser contra-atacado');
  console.log(`  revida 15 só contra golpe de alvo único`);
}

// ---------------------------------------------------------- 9. escolha múltipla
console.log('== 9. escolha múltipla: escolhe N opções e só elas resolvem ==');
{
  E.GODS.tnuwa = {
    nome: 'TNuwa', faccao: 'Teste', elem: 'Aurora', classe: 'Mágico', funcao: 'Suporte',
    passiva: { nome: '-', desc: '-' },
    ab: [
      { slot: 'basico', classe: 'Mágico', nome: 'b', cost: {}, cd: 0, alvo: 'inimigo', fx: [{ t: 'dmg', v: 10 }] },
      { slot: 'habilidade', classe: 'Mágico', nome: 'Cinco Cores', cost: {}, cd: 0, alvo: 'nenhum',
        opcoes: [
          { nome: 'cura', fx: [{ t: 'heal', v: 20, escopo: 'time' }] },
          { nome: 'buff', fx: [{ t: 'apply', eff: { type: 'dmgUp', v: 8, dur: 2 }, escopo: 'time' }] },
          { nome: 'escudo', fx: [{ t: 'shield', v: 15, escopo: 'time' }] },
        ] },
      { slot: 'milagre', classe: 'Mágico', nome: 'm', cost: {}, cd: 0, alvo: 'nenhum', fx: [] },
    ],
  };
  const st = E.novoEstado(['tnuwa', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 111);
  const u = st.lados[0].units[0], b = st.lados[0].units[1];
  b.hp = 50;
  E.agir(st, u.uid, 'habilidade', [], [0, 2]);   // escolhe cura + escudo, NÃO o buff
  ok(b.hp === 70, `cura de 20 esperada (50→70), deu ${b.hp}`);
  ok(st.lados[0].units.every(x => x.shield === 15), 'todos deveriam ganhar 15 de escudo');
  ok(!E.ef(u, 'dmgUp'), 'a opção NÃO escolhida (buff) não deveria ter efeito');
  console.log(`  escolheu 2 de 3: cura+escudo aplicados, buff não`);
  delete E.GODS.tnuwa;
}

// ------------------------------------------------------ 10. copiar habilidade
console.log('== 10. copiar: repete a última Habilidade de um aliado sem custo ==');
{
  E.GODS.tcopia = {
    nome: 'TCopia', faccao: 'Teste', elem: 'Aurora', classe: 'Mágico', funcao: 'Suporte',
    passiva: { nome: '-', desc: '-' },
    ab: [
      { slot: 'basico', classe: 'Mágico', nome: 'b', cost: {}, cd: 0, alvo: 'inimigo', fx: [{ t: 'dmg', v: 10 }] },
      { slot: 'habilidade', classe: 'Mágico', nome: 'Feitiço Roubado', cost: {}, cd: 0, alvo: 'nenhum',
        fx: [{ t: 'copiar', fonte: 'ultimaHabilidadeAliada' }] },
      { slot: 'milagre', classe: 'Mágico', nome: 'm', cost: {}, cd: 0, alvo: 'nenhum', fx: [] },
    ],
  };
  const st = E.novoEstado(['zeus', 'tcopia', 'zeus'], ['zeus', 'zeus', 'zeus'], 112);
  st.lados[0].orbs['Tempestade'] = 9;
  const zeus = st.lados[0].units[0], copia = st.lados[0].units[1], e0 = st.lados[1].units[0];
  E.agir(st, zeus.uid, 'habilidade', [e0.uid]);   // Julgamento do Trovão: 25 + silêncio Mágico
  ok(120 - e0.hp === 25, `Zeus deveria bater 25, bateu ${120 - e0.hp}`);
  E.agir(st, copia.uid, 'habilidade', []);        // copia e repete o Julgamento no 1º inimigo
  ok(120 - e0.hp === 50, `a cópia deveria repetir os 25 (total 50), total ${120 - e0.hp}`);
  console.log(`  Zeus 25 · cópia repete 25 → 50 total, sem pagar orbe`);
  delete E.GODS.tcopia;
}

// ------------------------------------------------------------ 11. invocações
console.log('== 11. invocações: guarda que absorve e clone que bate por turno ==');
{
  const st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 113);
  const u = st.lados[0].units[0], ally = st.lados[0].units[1], atk = st.lados[1].units[0];
  E.aplicarFx(st, u, [{ t: 'invocar', nome: 'Shabti', tipo: 'guarda', hp: 30, dur: 2 }], A('nenhum', 'habilidade'), []);
  const hp0 = ally.hp;
  E.bater(st, atk, ally, 15, 'afetado', 'basico', { unico: true });
  ok(ally.hp === hp0, 'o Shabti deveria absorver o golpe dirigido ao aliado');
  ok(st.lados[0].invocacoes[0].hp === 15, `o Shabti deveria ficar com 15 de HP, tem ${st.lados[0].invocacoes[0].hp}`);
  console.log(`  Shabti absorve 15 (30→15), aliado intacto`);
}
{ // clones batem no início do turno do dono
  const st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 114);
  const u = st.lados[0].units[0], e0 = st.lados[1].units[0];
  E.aplicarFx(st, u, [
    { t: 'invocar', nome: 'Clone', tipo: 'dano', v: 8, dur: 2 },
    { t: 'invocar', nome: 'Clone', tipo: 'dano', v: 8, dur: 2 },
  ], A('nenhum', 'habilidade'), []);
  const h0 = e0.hp;
  E.fimTurno(st);   // → Jogador 2
  E.fimTurno(st);   // → volta ao Jogador 1: os 2 clones agem
  ok(h0 - e0.hp === 16, `2 clones de 8 deveriam somar 16, deram ${h0 - e0.hp}`);
  console.log(`  2 clones × 8 = 16 no início do turno do dono`);
}

console.log('');
console.log(f === 0 ? '>>> PRIMITIVAS OK' : `>>> ${f} FALHA(S)`);
process.exit(f ? 1 : 0);
