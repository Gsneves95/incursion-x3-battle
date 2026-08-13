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
console.log('== 1c. contador de CAMPO por LADO (pool do time, Combo): gera, teto, consome, dois lados independentes ==');
{ // acumula no pool do LADO (não na unidade), teto 20, escala e consome
  const st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 105);
  const u = st.lados[0].units[0];
  const GERA = (v, lado) => ({ t: 'contador', nome: 'combo', v, pool: 'lado', lado: lado || 'proprio', max: 20 });
  E.aplicarFx(st, u, [GERA(8)], A('auto'), []);
  E.aplicarFx(st, u, [GERA(8)], A('auto'), []);
  E.aplicarFx(st, u, [GERA(8)], A('auto'), []);            // 24 -> teto 20
  ok(E.getContadorLado(st, 0, 'combo') === 20, `pool do lado 0 no teto 20, tem ${E.getContadorLado(st, 0, 'combo')}`);
  ok(E.getContador(u, 'combo') === 0, 'o pool NÃO é contador da unidade (u.combo continua 0)');
  const e0 = st.lados[1].units[0], h0 = e0.hp;             // Fúria do Tufão: 18 + 2×Combo, consome
  E.aplicarFx(st, u, [{ t: 'dmg', v: 18, escopo: 'todosInimigos', porContadorLado: { nome: 'combo', lado: 'proprio', v: 2 }, consomeContadorLado: 'combo' }], A('todosInimigos', 'milagre'), []);
  ok(h0 - e0.hp === 18 + 40, `18 + 2×20 = 58 esperado, deu ${h0 - e0.hp}`);
  ok(E.getContadorLado(st, 0, 'combo') === 0, 'consumir zera o pool do lado');
  console.log('  gera 8+8+8→teto 20 · pool ≠ unidade · 18+2×20=58 · consumido a 0');
}
{ // o pool é do LADO: sobrevive à queda do gerador (≠ contadorNoCampo, que soma vivos)
  const st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 106);
  E.addContadorLado(st, 0, 'combo', 12);
  st.lados[0].units[0].vivo = false;                      // gerador cai
  ok(E.getContadorLado(st, 0, 'combo') === 12, 'o pool do lado NÃO cai com a morte de uma unidade (é do time)');
  E.addContador(st, st.lados[0].units[1], 'atadura', 3);
  ok(E.contadorNoCampo(st, 'atadura', 0) === 3, 'contadorNoCampo conta só vivos — pergunta diferente do pool');
  console.log('  pool sobrevive à queda (12) · contadorNoCampo depende de quem vive');
}
{ // OS DOIS LADOS SÃO INDEPENDENTES: geração simultânea, teto por-lado, consumo não cruza
  const st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 107);
  const a = st.lados[0].units[0], b = st.lados[1].units[0];
  const GERA = v => ({ t: 'contador', nome: 'combo', v, pool: 'lado', lado: 'proprio', max: 20 });
  E.aplicarFx(st, a, [GERA(15)], A('auto'), []);
  E.aplicarFx(st, b, [GERA(9)], A('auto'), []);
  ok(E.getContadorLado(st, 0, 'combo') === 15 && E.getContadorLado(st, 1, 'combo') === 9, 'cada lado acumula no SEU pool');
  E.aplicarFx(st, a, [GERA(10)], A('auto'), []);          // lado 0: 25 -> teto 20; lado 1 intocado
  ok(E.getContadorLado(st, 0, 'combo') === 20 && E.getContadorLado(st, 1, 'combo') === 9, 'teto é POR LADO; o lado 1 não é somado nem tocado');
  E.aplicarFx(st, a, [{ t: 'dmg', v: 0, escopo: 'todosInimigos', consomeContadorLado: 'combo' }], A('todosInimigos', 'milagre'), []);
  ok(E.getContadorLado(st, 0, 'combo') === 0 && E.getContadorLado(st, 1, 'combo') === 9, 'consumir o lado 0 não toca o pool do lado 1');
  console.log('  dois lados: pools separados · teto por lado · consumo não cruza');
}
console.log('== 1d. redução de HP MÁXIMO (Podridão): -10/acúmulo, guarda o perdido, piso 1, clamp não mata, restaura sem curar ==');
{
  const st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 108);
  const vitima = st.lados[0].units[0], ahpuch = st.lados[1].units[0], itzamna = st.lados[0].units[1];
  const POD = v => ({ t: 'contador', nome: 'podridao', v, reduzMaxHp: 10 });
  E.aplicarFx(st, ahpuch, [POD(2)], A('inimigo', 'habilidade'), [vitima]);   // 2 Podridão -> máx 100
  ok(vitima.maxHp === 100 && vitima.hp === 100, `2 Podridão: máx 120→100, hp clampa (${vitima.maxHp}/${vitima.hp})`);
  ok((vitima.maxHpPerdido || 0) === 20, `guardou 20 de máximo perdido (${vitima.maxHpPerdido})`);
  E.aplicarFx(st, ahpuch, [POD(12)], A('inimigo', 'habilidade'), [vitima]);  // +12 -> máx tentaria -120, PISO 1
  ok(vitima.maxHp === 1, `piso 1 no máximo (${vitima.maxHp})`);
  ok(vitima.hp === 1 && vitima.vivo, `clamp puxa hp p/ 1, NÃO mata (hp ${vitima.hp}, vivo ${vitima.vivo})`);
  // Itzamná restaura: devolve TODO o máximo perdido, SEM curar
  vitima.hp = 1;
  E.aplicarFx(st, itzamna, [{ t: 'restauraMax', escopo: 'time' }], A('auto', 'milagre'), []);
  ok(vitima.maxHp === 120, `máximo restaurado a 120 (${vitima.maxHp})`);
  ok(vitima.hp === 1, `restaurar NÃO cura — hp fica em 1 (${vitima.hp})`);
  ok((vitima.maxHpPerdido || 0) === 0, 'perdido zerado após restaurar');
  console.log('  2 Podridão→100 (guarda 20) · piso 1 · clamp não mata · restaura 120 sem curar');
}
{ // edge #4: a redução não mata por clamp mesmo com hp já baixo
  const st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 109);
  const a = st.lados[1].units[0], v = st.lados[0].units[0];
  v.maxHp = 10; v.hp = 5;
  E.aplicarFx(st, a, [{ t: 'contador', nome: 'podridao', v: 1, reduzMaxHp: 10 }], A('inimigo', 'habilidade'), [v]);
  ok(v.maxHp === 1 && v.hp === 1 && v.vivo, `5/10 + Podridão → 1/1 viva (${v.maxHp}/${v.hp} vivo=${v.vivo})`);
  console.log('  clamp não mata: 5/10 + Podridão → 1/1 viva');
}
console.log('== 1e. contágio (Maldição de Yomi): iguala ao maior, fonte retém, teto, dispara limiar ==');
{
  const st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 110);
  const izan = st.lados[0].units[0];
  const [a, b, c] = st.lados[1].units;
  E.addContador(st, a, 'maldicao', 3);   // fonte com 3
  E.addContador(st, b, 'maldicao', 1);   // c fica em 0
  const ESPALHA = { t: 'espalha', nome: 'maldicao', max: 5, escopo: 'todosInimigos' };
  E.aplicarFx(st, izan, [ESPALHA], A('todosInimigos', 'habilidade'), []);
  ok(E.getContador(a, 'maldicao') === 3 && E.getContador(b, 'maldicao') === 3 && E.getContador(c, 'maldicao') === 3,
    `todos igualados ao maior (3); fonte retém (${E.getContador(a, 'maldicao')}/${E.getContador(b, 'maldicao')}/${E.getContador(c, 'maldicao')})`);
  E.aplicarFx(st, izan, [ESPALHA], A('todosInimigos', 'habilidade'), []);   // 2× sem novo acúmulo
  ok(E.getContador(a, 'maldicao') === 3 && E.getContador(b, 'maldicao') === 3 && E.getContador(c, 'maldicao') === 3, 'espalhar 2× sem novo acúmulo NÃO aumenta');
  E.addContador(st, a, 'maldicao', 10);   // força a acima do teto (artificial) p/ provar o cap do espalhamento
  E.aplicarFx(st, izan, [ESPALHA], A('todosInimigos', 'habilidade'), []);
  ok(E.getContador(b, 'maldicao') === 5 && E.getContador(c, 'maldicao') === 5, 'espalhamento respeita o teto 5 nos que recebem');
  console.log('  iguala ao maior (fonte retém) · 2× não muda · teto 5');
}
{ // contágio DISPARA o limiar de quem recebe (chegar a N é chegar a N — §33)
  const st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 111);
  const izan = st.lados[0].units[0];
  const [a, b] = st.lados[1].units;
  E.addContador(st, a, 'atadura', 4);   // fonte já em 4; b em 0
  const ESPALHA = { t: 'espalha', nome: 'atadura', max: 9, escopo: 'todosInimigos', limiar: { em: 4, aplica: { type: 'atordoado', dur: 2 } } };
  E.aplicarFx(st, izan, [ESPALHA], A('todosInimigos', 'habilidade'), []);
  ok(E.getContador(b, 'atadura') === 4 && !!E.ef(b, 'atordoado'), 'contágio que leva b a 4 dispara o limiar (atordoa) — via aposAcumular');
  console.log('  contágio dispara limiar em quem recebe (chegar a N é chegar a N)');
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
  x.efeitos.push({ type: 'livro', dur: 1, naoRevive: true });   // o efeito 'livro' CARREGA naoRevive (propriedade do debuff)
  E.fimTurno(st);   // encerra turno do Jogador 1 → passa para o 2
  E.fimTurno(st);   // encerra turno do Jogador 2 → o Livro dispara
  ok(!x.vivo, 'o inscrito deveria ser executado ao fim da contagem');
  ok(x.naoRevive, 'quem morre sob o Livro não pode ser revivido');   // selado pelo snapshot geral em matar, não por set imperativo
  console.log(`  inscrito executado ao zerar a contagem · marcado irrevivível`);
}

// -------------------------------------------------- 5b. antirevive (núcleo F1.3)
console.log('== 5b. antirevive: gate completo (fura auto-renascimento tb) + source geral + contra-jogo ==');
{ // GATE: quem cai marcado irrevivível NÃO auto-renasce (reviveProximoTurno da Nezha), não só o revive-por-aliado
  const st = E.novoEstado(['nezha', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 130);
  const nezha = st.lados[0].units[0], atk = st.lados[1].units[0];
  nezha.efeitos.push({ type: 'marca', dur: 3, naoRevive: true });   // marca prévia que proíbe revive (ex.: Marca da Morte)
  E.aplicarFx(st, atk, [{ t: 'dmg', v: 400 }], A('inimigo', 'milagre'), [nezha]);
  ok(!nezha.vivo && nezha.naoRevive, 'ao cair com a marca, deveria ficar irrevivível');
  ok(!nezha.pendenteRenascer, 'o auto-renascimento (reviveProximoTurno) NÃO deveria ser agendado');
  E.iniciarTurno(st); E.fimTurno(st); E.fimTurno(st);
  ok(!nezha.vivo, 'e não deveria voltar no turno seguinte');
  console.log('  Nezha marcada cai → não agenda renascimento → segue caída');
}
{ // CONTROLE: a mesma Nezha SEM a marca renasce normalmente (o gate não vaza)
  const st = E.novoEstado(['nezha', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 131);
  const nezha = st.lados[0].units[0], atk = st.lados[1].units[0];
  E.aplicarFx(st, atk, [{ t: 'dmg', v: 400 }], A('inimigo', 'milagre'), [nezha]);
  ok(!nezha.vivo && nezha.pendenteRenascer && !nezha.naoRevive, 'sem marca, agenda renascimento e não fica irrevivível');
  console.log('  Nezha sem marca cai → agenda renascimento (gate não vaza)');
}
{ // SOURCE GERAL via DOT: marcador naoRevive num dot também sela ao cair
  const st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 132);
  const alvo = st.lados[0].units[1], heal = st.lados[0].units[0];
  alvo.dots.push({ nome: 'marcaMortal', v: 5, dur: 2, naoRevive: true });
  alvo.hp = 1; E.aplicarFx(st, st.lados[1].units[0], [{ t: 'dmg', v: 20 }], A('inimigo', 'basico'), [alvo]);
  ok(!alvo.vivo && alvo.naoRevive, 'dot com naoRevive deveria selar ao cair');
  E.reviver(st, alvo, { hp: 50 });
  ok(!alvo.vivo, 'e o revive-por-aliado deveria ser bloqueado');
  console.log('  marcador naoRevive em dot → selado → revive bloqueado');
}
{ // CONTRA-JOGO: limpar o marcador ANTES de cair libera o revive
  const st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 133);
  const alvo = st.lados[0].units[1];
  alvo.efeitos.push({ type: 'marca', dur: 3, naoRevive: true });
  alvo.efeitos = alvo.efeitos.filter(e => e.type !== 'marca');   // cleanse ANTES da morte
  alvo.hp = 1; E.aplicarFx(st, st.lados[1].units[0], [{ t: 'dmg', v: 20 }], A('inimigo', 'basico'), [alvo]);
  ok(!alvo.vivo && !alvo.naoRevive, 'limpo antes de cair → NÃO fica irrevivível (contra-jogo)');
  E.reviver(st, alvo, { hp: 50 });
  ok(alvo.vivo && alvo.hp === 50, 'e o revive deveria funcionar');
  console.log('  cleanse antes da queda → revive liberado');
}
{ // FRONTEIRA vidaExtra: antirevive é PÓS-morte; vidaExtra (pré-morte) segue intacto — não redundante com execução
  const st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 134);
  const alvo = st.lados[0].units[1];
  alvo.efeitos.push({ type: 'marca', dur: 3, naoRevive: true });
  alvo.vidaExtra = { hp: 30 };   // sobrevive 1× ao letal
  E.aplicarFx(st, st.lados[1].units[0], [{ t: 'dmg', v: 400 }], A('inimigo', 'milagre'), [alvo]);
  ok(alvo.vivo && alvo.hp === 30, 'vidaExtra segura o letal — antirevive não interfere na sobrevivência');
  ok(!alvo.naoRevive, 'não morreu → não é marcado irrevivível');
  console.log('  vidaExtra segura o letal · naoRevive só age PÓS-morte (ortogonal à execução)');
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
