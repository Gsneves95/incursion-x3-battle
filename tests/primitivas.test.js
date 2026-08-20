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

// ----------------------------------------------------------- 12. Inalvejável (F1.9): mira, não impacto (§84)
console.log('== 12. Inalvejável: evasão na SELEÇÃO; AoE atinge; cura aliada alcança (§84 a) ==');
{
  const st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 130);
  const atk = st.lados[0].units[0], foe0 = st.lados[1].units[0], foe1 = st.lados[1].units[1];
  foe0.efeitos.push({ type: 'inalvejavel', dur: 2 });
  const val = E.alvosValidos(st, atk, { alvo: 'inimigo' }).map(x => x.uid);
  ok(!val.includes(foe0.uid) && val.includes(foe1.uid), `alvo único não mira o Inalvejável (${val.length} de 3 selecionáveis)`);
  const h = foe0.hp; E.bater(st, atk, foe0, 12, 'afetado', 'milagre', { unico: false });   // AoE = golpe não-único; o bater não filtra
  ok(h - foe0.hp === 12, `AoE ATINGE o Inalvejável: 12 (${h - foe0.hp}) — a evasão mora só na seleção`);
  const st2 = E.novoEstado(['zeus', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 131);
  const healer = st2.lados[0].units[0], ally = st2.lados[0].units[1];
  ally.efeitos.push({ type: 'inalvejavel', dur: 2 });
  ok(E.alvosValidos(st2, healer, { alvo: 'aliado' }).map(x => x.uid).includes(ally.uid), 'cura ALIADA alcança o aliado Inalvejável (ramo aliado não filtra)');
  console.log('  seleção INIMIGA filtra; AoE e ramo ALIADO não — a evasão é da mira, não do impacto');
}

console.log('== 12b. Inalvejável × redirect (sink inalvejável) e × intercepta (interceptador inalvejável): ATINGEM ==');
{
  // redirect com o SINK Inalvejável: o golpe CAI nele — desvio pós-mira, a evasão não protege de ricochete
  const st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 132);
  const atk = st.lados[0].units[0], sink = st.lados[0].units[1], alvo = st.lados[1].units[0];
  sink.efeitos.push({ type: 'inalvejavel', dur: 2 });
  alvo.efeitos.push({ type: 'redirect', destino: sink.uid, dur: 2, contra: 'todos', origem: alvo.uid });
  const hs = sink.hp, ha = alvo.hp;
  E.bater(st, atk, alvo, 15, 'afetado', 'basico', { unico: true });
  ok(ha === alvo.hp, 'o alvo original foi desviado (redirect)');
  ok(hs - sink.hp === 15, `o golpe CAI no sink Inalvejável: 15 (${hs - sink.hp})`);
  // intercepta: o interceptador Inalvejável se oferece e recebe (interceptar é escolher SER atingido)
  const st2 = E.novoEstado(['zeus', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 133);
  const atk2 = st2.lados[1].units[0], ally2 = st2.lados[0].units[0], inter = st2.lados[0].units[1];
  inter.efeitos.push({ type: 'inalvejavel', dur: 2 });
  inter.efeitos.push({ type: 'intercepta', protege: ally2.uid, dur: 2, contra: 'todos', origem: inter.uid });
  const hi = inter.hp, hy = ally2.hp;
  E.bater(st2, atk2, ally2, 15, 'afetado', 'basico', { unico: true });
  ok(hy === ally2.hp, 'o protegido não sofre');
  ok(hi - inter.hp === 15, `o interceptador Inalvejável recebe: 15 (${hi - inter.hp})`);
  console.log('  redirect e intercepta operam ABAIXO da seleção — Inalvejável não os alcança');
}

console.log('== 12c. Inalvejável: dispel remove (b); Provocar suspenso; ignora-mira (flag + passiva self/time, c) ==');
{
  const st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 134);
  const u = st.lados[1].units[0]; u.efeitos.push({ type: 'inalvejavel', dur: 2 });
  E.aplicarFx(st, st.lados[0].units[0], [{ t: 'stripOne' }], A('inimigo', 'habilidade'), [u]);
  ok(!E.ef(u, 'inalvejavel'), 'dispel (stripOne) REMOVE a Inalvejável (buff defensivo, decisão b) — a trava é só na seleção dela');
  // Provocar suspenso se o provocador está Inalvejável
  const st2 = E.novoEstado(['zeus', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 135);
  const atk2 = st2.lados[0].units[0], prov = st2.lados[1].units[0];
  prov.efeitos.push({ type: 'inalvejavel', dur: 2 });
  atk2.efeitos.push({ type: 'taunt', origem: prov.uid, dur: 2 });
  const vt = E.alvosValidos(st2, atk2, { alvo: 'inimigo' }).map(x => x.uid);
  ok(!vt.includes(prov.uid) && vt.length === 2, 'Provocar suspenso: não se é forçado a mirar quem não se pode selecionar');
  // ignora-mira por FLAG de habilidade (Odin/Hórus no básico)
  const st3 = E.novoEstado(['zeus', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 136);
  const atk3 = st3.lados[0].units[0], foe3 = st3.lados[1].units[0]; foe3.efeitos.push({ type: 'inalvejavel', dur: 2 });
  ok(E.alvosValidos(st3, atk3, { alvo: 'inimigo', ignoraInalvejavel: true }).map(x => x.uid).includes(foe3.uid), 'flag de habilidade ignoraInalvejavel mira o oculto');
  // ignora-mira por PASSIVA: self (Hou Yi — só o dono) e time (Boitatá — o lado)
  E.GODS.thouyi = { nome: 'THouYi', faccao: 'T', elem: 'Aurora', classe: 'Físico', funcao: 'Atacante', passiva: { nome: 'p', desc: 'd', fx: [{ gatilho: 'ignoraInalvejavel' }] } };
  E.GODS.tboita = { nome: 'TBoita', faccao: 'T', elem: 'Chama', classe: 'Mágico', funcao: 'Guardião', passiva: { nome: 'p', desc: 'd', fx: [{ gatilho: 'ignoraInalvejavel', escopo: 'time' }] } };
  const st4 = E.novoEstado(['thouyi', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 137);
  const hy4 = st4.lados[0].units[0], zA4 = st4.lados[0].units[1], foe4 = st4.lados[1].units[0]; foe4.efeitos.push({ type: 'inalvejavel', dur: 2 });
  ok(E.alvosValidos(st4, hy4, { alvo: 'inimigo' }).map(x => x.uid).includes(foe4.uid), 'passiva self (Hou Yi): o DONO mira o oculto');
  ok(!E.alvosValidos(st4, zA4, { alvo: 'inimigo' }).map(x => x.uid).includes(foe4.uid), 'passiva self NÃO estende ao aliado (só o dono)');
  const st5 = E.novoEstado(['tboita', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 138);
  const zA5 = st5.lados[0].units[1], foe5 = st5.lados[1].units[0]; foe5.efeitos.push({ type: 'inalvejavel', dur: 2 });
  ok(E.alvosValidos(st5, zA5, { alvo: 'inimigo' }).map(x => x.uid).includes(foe5.uid), 'passiva time (Boitatá): o ALIADO também mira o oculto');
  delete E.GODS.thouyi; delete E.GODS.tboita;
  console.log('  dispel remove (b); Provocar suspenso; ignora-mira em dois pontos — flag (pontual) + passiva self/time (c)');
}

console.log('== 12d. INVARIANTE ESTRUTURAL (§84): nenhum ef(...,inalvejavel) dentro do bater ==');
{
  const src = require('fs').readFileSync(require('path').join(__dirname, '..', 'src', 'engine.js'), 'utf8');
  const i = src.indexOf('function bater(');
  const j = src.indexOf('\nfunction ', i + 1);
  const corpo = src.slice(i, j > i ? j : undefined);
  ok(i >= 0 && !/inalvejavel/.test(corpo), 'o corpo de bater() NÃO menciona inalvejavel — a evasão mora só na seleção');
  console.log('  guarda estrutural: um if(inalvejavel) no bater quebraria redirect-atinge-sink e AoE-atinge — o teste apita');
}

// ------------------------------------------------------------ 13. condicional com `se` do ALVO (Hórus §87)
console.log('== 13. condicional ramifica pela condição do ALVO (§87): EXCLUSÃO POR CONSTRUÇÃO — nunca soma os ramos ==');
{
  // atacante PLANO (zeus, sem passiva de bônus) isola o mecanismo: 45 puro COM Olho, 32 SEM, JAMAIS 77.
  const mil = [{ t: 'condicional', se: { alvoMarca: 'olho' }, entao: [{ t: 'dmg', v: 45, kind: 'puro' }], senao: [{ t: 'dmg', v: 32 }] }];
  const st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 200);
  const z = st.lados[0].units[0], foe = st.lados[1].units[0];
  let h = foe.hp; E.aplicarFx(st, z, mil, A('inimigo', 'milagre'), [foe]);
  ok(h - foe.hp === 32, `SEM Olho: ramo senao, 32 (${h - foe.hp})`);
  const st2 = E.novoEstado(['zeus', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 201);
  const z2 = st2.lados[0].units[0], foe2 = st2.lados[1].units[0]; foe2.efeitos.push({ type: 'olho', dur: 2 });
  h = foe2.hp; E.aplicarFx(st2, z2, mil, A('inimigo', 'milagre'), [foe2]);
  ok(h - foe2.hp === 45, `COM Olho: ramo entao, 45 puro — NÃO 77 (32+45). Só um ramo roda (${h - foe2.hp})`);
  // regressão: `se` de CAMPO (estadoOK) ainda funciona — Freyja, aliadoCaido
  const st3 = E.novoEstado(['zeus', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 202);
  const z3 = st3.lados[0].units[0], foe3 = st3.lados[1].units[0];
  const campo = [{ t: 'condicional', se: { aliadoCaido: true }, entao: [{ t: 'dmg', v: 99 }], senao: [{ t: 'dmg', v: 10 }] }];
  h = foe3.hp; E.aplicarFx(st3, z3, campo, A('inimigo', 'milagre'), [foe3]);
  ok(h - foe3.hp === 10, `se de CAMPO (aliadoCaido) ainda via estadoOK: ninguém caiu → ramo senao 10 (${h - foe3.hp})`);
  // §87: os dois vocabulários de `se` são DISJUNTOS (senão a desambiguação vira ambígua)
  const inter = E.VOCAB.condicoes.filter(k => E.VOCAB.estadoCond.includes(k));
  ok(inter.length === 0, `CONDICOES ∩ ESTADO_COND = [${inter}] deve ser vazio (§87: valida_kit falha alto se cruzarem)`);
  console.log('  se∈CONDICOES→condOK(alvo) · se∈ESTADO_COND→estadoOK(campo) · disjuntos · um ramo só, nunca soma');
}

// ------------------------------------------------------------ 14. primeiroPorTurno (RASTREIO, Bastet §88)
console.log('== 14. primeiroPorTurno: flag por-turno — 1º golpe único reduz, os seguintes não; AoE não consome ==');
{
  // Bastet REAL: reducao v:8 + contra:{alcance:unico} + estado:{primeiroPorTurno}. Prova a cadeia inteira.
  // caso base + caso 3 (dois golpes únicos no mesmo turno): 1º reduz, 2º não.
  let st = E.novoEstado(['bastet', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 300);
  let b = st.lados[0].units[0], atk = st.lados[1].units[0];
  let h = b.hp; E.bater(st, atk, b, 20, 'afetado', 'basico', { unico: true });
  ok(h - b.hp === 12, `1º golpe único: 20-8 = 12 (${h - b.hp})`);
  h = b.hp; E.bater(st, atk, b, 20, 'afetado', 'basico', { unico: true });
  ok(h - b.hp === 20, `2º golpe único no mesmo turno: 20, sem redução (${h - b.hp})`);

  // caso 2 (o dono insistiu): a AoE NÃO marca o flag no ESCRITOR — se marcasse, consumiria a proteção sem acioná-la.
  st = E.novoEstado(['bastet', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 301);
  b = st.lados[0].units[0]; atk = st.lados[1].units[0];
  h = b.hp; E.bater(st, atk, b, 20, 'afetado', 'milagre', { unico: false });
  ok(h - b.hp === 20 && b.golpeUnicoNoTurno === false, `AoE: dano cheio 20 E flag intacto (${h - b.hp}/${b.golpeUnicoNoTurno})`);
  h = b.hp; E.bater(st, atk, b, 20, 'afetado', 'basico', { unico: true });
  ok(h - b.hp === 12, `o golpe único DEPOIS da AoE ainda é o primeiro: 12 (${h - b.hp})`);

  // caso 1 (o dono insistiu): reset no turno do DONO, não do atacante (senão a proteção 2× por rodada num hot-seat)
  st = E.novoEstado(['bastet', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 302);
  b = st.lados[0].units[0]; atk = st.lados[1].units[0];
  E.bater(st, atk, b, 20, 'afetado', 'basico', { unico: true });
  ok(b.golpeUnicoNoTurno === true, 'flag marcado após o golpe');
  st.ativo = 1; E.iniciarTurno(st);
  ok(b.golpeUnicoNoTurno === true, 'iniciarTurno do INIMIGO NÃO reseta o flag da Bastet (é do lado dela)');
  st.ativo = 0; E.iniciarTurno(st);
  ok(b.golpeUnicoNoTurno === false, 'iniciarTurno do DONO reseta — armado para o turno inimigo seguinte');

  // dois dmg num MESMO fx contam como dois golpes (o básico da Bastet é 2×7): o 2º já não é o primeiro
  st = E.novoEstado(['bastet', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 303);
  b = st.lados[0].units[0]; atk = st.lados[1].units[0];
  h = b.hp; E.aplicarFx(st, atk, [{ t: 'dmg', v: 20 }, { t: 'dmg', v: 20 }], A('inimigo', 'basico'), [b]);
  ok(h - b.hp === 12 + 20, `dois dmg num fx = dois golpes: 12 + 20 = 32 (${h - b.hp})`);
  console.log('  1º único reduz · 2º não · AoE não marca · reset no turno do dono · dois dmg = dois golpes');
}

// ------------------------------------------------------------ 15. multi-golpe DISTRIBUÍDO (§92)
console.log('== 15. multi-golpe distribuído: N golpes repartidos igual, EXTRA p/ os primeiros; degenerado concentra ==');
{
  // DIVISÃO DESIGUAL (a posição do dono, travada em teste): 8 golpes entre 3 alvos = 3/3/2, e o EXTRA vai para
  // os PRIMEIROS SELECIONADOS. A ordem de `alvos` É a ordem de seleção do jogador (Forma A), então o teste passa
  // os alvos numa ordem conhecida e confere que o resto (8%3=2) caiu nos dois primeiros — não nos últimos.
  let st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['tyr', 'tyr', 'tyr'], 400);
  let u = st.lados[0].units[0];
  let [a0, a1, a2] = st.lados[1].units;
  let h = [a0.hp, a1.hp, a2.hp];
  E.aplicarFx(st, u, [{ t: 'dmg', v: 3, golpes: 8 }], A('distribui', 'habilidade'), [a0, a1, a2]);
  const dano = [h[0] - a0.hp, h[1] - a1.hp, h[2] - a2.hp];
  ok(dano[0] === 9 && dano[1] === 9 && dano[2] === 6, `8 golpes de 3 entre 3 = 3/3/2 golpes = 9/9/6; extra p/ os PRIMEIROS (${dano})`);
  // e a ordem MANDA: se o 3º entra primeiro, ELE leva o extra (prova que não é "sempre o mesmo slot")
  st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['tyr', 'tyr', 'tyr'], 401);
  u = st.lados[0].units[0]; [a0, a1, a2] = st.lados[1].units;
  h = [a0.hp, a1.hp, a2.hp];
  E.aplicarFx(st, u, [{ t: 'dmg', v: 3, golpes: 8 }], A('distribui', 'habilidade'), [a2, a0, a1]);   // a2 selecionado 1º
  ok(a2.hp === h[2] - 9 && a0.hp === h[0] - 9 && a1.hp === h[1] - 6, `ordem manda: a2 escolhido 1º leva o extra (a2=${h[2] - a2.hp} a0=${h[0] - a0.hp} a1=${h[1] - a1.hp})`);

  // DEGENERADO no motor: um só alvo selecionado concentra TODOS os golpes (8×3=24) — nada se perde.
  st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['tyr', 'tyr', 'tyr'], 402);
  u = st.lados[0].units[0]; a0 = st.lados[1].units[0];
  h = a0.hp;
  E.aplicarFx(st, u, [{ t: 'dmg', v: 3, golpes: 8 }], A('distribui', 'habilidade'), [a0]);
  ok(h - a0.hp === 24, `1 alvo concentra tudo: 8×3 = 24 (${h - a0.hp})`);
  console.log('  8 golpes/3 alvos = 9/9/6 · extra p/ os primeiros SELECIONADOS (ordem manda) · 1 alvo = 24');
}

// ------------------------------------------------------------ 16. remoção SELETIVA de fase (§94, Hou Yi)
console.log('== 16. fase.remove: limpa SÓ a fase nomeada — remove:Dia zera o Dia, não toca a Noite ==');
{
  // O modelo é UM st.fase global, sem dono, mutuamente exclusivo (só um valor por vez). A remoção é seletiva:
  // remove:'Dia' zera SÓ se a fase atual for Dia. Se for Noite (ou nula), é no-op — o "abater o Sol" não apaga a Lua.
  const A = a => ({ alvo: a, slot: 'habilidade' });
  let st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 500);
  E.definirFase(st, 'Dia', 3);
  E.aplicarFx(st, st.lados[0].units[0], [{ t: 'fase', remove: 'Dia' }], A('nenhum'), []);
  ok(st.fase === null && st.faseDur === 0, `remove:Dia com Dia ativo → limpo (fase=${st.fase}, dur=${st.faseDur})`);

  st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 501);
  E.definirFase(st, 'Noite', 3);
  E.aplicarFx(st, st.lados[0].units[0], [{ t: 'fase', remove: 'Dia' }], A('nenhum'), []);
  ok(st.fase === 'Noite' && st.faseDur === 3, `remove:Dia com Noite ativa → NÃO toca (fase=${st.fase}, dur=${st.faseDur})`);

  st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 502);
  E.aplicarFx(st, st.lados[0].units[0], [{ t: 'fase', remove: 'Dia' }], A('nenhum'), []);
  ok(st.fase === null, 'remove:Dia sem fase alguma → no-op silencioso');

  // e a ATIVAÇÃO (a outra forma do mesmo fx) segue funcionando — não quebrei o escritor
  st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 503);
  E.aplicarFx(st, st.lados[0].units[0], [{ t: 'fase', v: 'Dia', dur: 3 }], A('nenhum'), []);
  ok(st.fase === 'Dia' && st.faseDur === 3, 'fase.v ainda ATIVA (a remoção não quebrou o escritor)');
  console.log('  remove:Dia zera o Dia · poupa a Noite · no-op sem fase · ativação (v) intacta');
}

// ------------------------------------------------------------ 17. PAYLOAD da fase (§96): modificador global por elemento
console.log('== 17. payload da fase: Dia favorece Aurora / pune Umbra; Noite espelha; faseDur RESETA por escrita ==');
{
  // O modificador é de SAÍDA, por elemento do ATACANTE, GLOBAL (vale nos dois lados). Meço o DELTA contra o sem-fase
  // com o MESMO atacante/alvo — assim qualquer passiva constante do alvo se cancela e sobra só o payload.
  // perseu=Aurora, babi=Umbra (passivas não mexem em dano de saída); alvo zeus (sem redução).
  const st = E.novoEstado(['perseu', 'babi', 'zeus'], ['zeus', 'zeus', 'zeus'], 600);
  const aur = st.lados[0].units[0], umb = st.lados[0].units[1], alvo = st.lados[1].units[0];
  const bate = (atk) => { const h = alvo.hp; E.bater(st, atk, alvo, 12, 'afetado', 'basico', { semContra: true }); const d = h - alvo.hp; alvo.hp = 120; return d; };
  const base0Aur = bate(aur), base0Umb = bate(umb);
  ok(base0Aur === 12 && base0Umb === 12, `sem fase: 12/12 (${base0Aur}/${base0Umb})`);
  E.definirFase(st, 'Dia', 3);
  ok(bate(aur) === 20 && bate(umb) === 7, `Dia: Aurora +8 (20), Umbra −5 (7)`);
  E.definirFase(st, 'Noite', 3);
  ok(bate(aur) === 7 && bate(umb) === 20, `Noite espelha: Aurora −5 (7), Umbra +8 (20)`);
  // o payload é GLOBAL (não do lado de quem ativou): um Aurora INIMIGO também ganha no Dia
  E.definirFase(st, 'Dia', 3);
  const inimAur = st.lados[1].units[0];   // zeus… precisa de um Aurora do outro lado — usa o alvo como atacante contra um aliado
  const alvo2 = st.lados[0].units[2]; const hh = alvo2.hp;
  E.bater(st, aur, alvo2, 12, 'afetado', 'basico', { semContra: true });   // Aurora batendo no próprio lado (prova de que é por elemento, não por lado)
  ok(hh - alvo2.hp === 20, `payload é por ELEMENTO, não por lado (Aurora bate 20 mesmo num aliado): ${hh - alvo2.hp}`);

  // Q3: faseDur RESETA a cada escrita (não herda o tempo restante)
  const st2 = E.novoEstado(['zeus', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 601);
  E.definirFase(st2, 'Dia', 3); st2.faseDur = 1;   // simula 2 turnos já corridos
  E.definirFase(st2, 'Noite', 3);
  ok(st2.fase === 'Noite' && st2.faseDur === 3, `escrever a fase RESETA a duração para 3 (${st2.faseDur}), não herda o 1 restante`);
  console.log('  Dia: Aurora+8/Umbra−5 · Noite espelha · global por elemento · faseDur reseta por escrita (troca = relógio novo)');
}

// ------------------------------------------------------------ 18. RASTREIO curado-no-turno-anterior (§97, Tsukuyomi)
console.log('== 18. rastreio de dois tempos: curado-agora vira curado-antes no giro; janela de 1 turno; borda mesmo-turno ==');
{
  const heal = u => E.aplicarFx(st, u, [{ t: 'heal', v: 20, escopo: 'self' }], A('nenhum'), []);
  let st;
  const novo = () => { st = E.novoEstado(['tsukuyomi', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 700); return st; };
  const bateT = foe => { const h = foe.hp; E.aplicarFx(st, st.lados[0].units[0], [{ t: 'dmg', v: 12 }], A('inimigo', 'basico'), [foe]); return h - foe.hp; };

  // ESCRITOR + PROMOTOR: cura marca 'agora'; o iniciarTurno promove 'agora'→'antes' (dos DOIS lados)
  novo(); let foe = st.lados[1].units[0]; foe.hp = 50; heal(foe);
  ok(foe.curadoAgora && !foe.curadoAntes, 'cura marca curadoAgora, não curadoAntes ainda');
  st.ativo = 1; E.iniciarTurno(st);
  ok(!foe.curadoAgora && foe.curadoAntes, 'o giro promove agora→antes (inimigo é do lado INATIVO — a promoção cruza o lado)');
  ok(bateT(foe) === 22, `Tsukuyomi lê alvoCuradoAntes: 12+10 = 22 (${bateT(foe)})`);

  // JANELA de 1 turno: mais um giro sem nova cura → fecha
  novo(); foe = st.lados[1].units[0]; foe.hp = 50; heal(foe);
  st.ativo = 1; E.iniciarTurno(st); st.ativo = 0; E.iniciarTurno(st);
  ok(!foe.curadoAntes, 'dois giros sem nova cura: a janela fecha (curadoAntes volta a false)');
  ok(bateT(foe) === 12, `sem o bônus depois da janela: 12 (${bateT(foe)})`);

  // BORDA mesmo-turno: curar e bater no MESMO turno NÃO conta (é o turno ANTERIOR que importa)
  novo(); foe = st.lados[1].units[0]; foe.hp = 50; heal(foe);
  ok(bateT(foe) === 12, `curou e bateu no mesmo turno: 12, sem bônus (só 'agora', não 'antes')`);

  // ESCRITOR só conta cura REAL: bloqueada (noHeal) e no-teto não marcam
  novo(); foe = st.lados[1].units[0]; foe.efeitos.push({ type: 'noHeal', dur: 2 }); heal(foe);
  ok(!foe.curadoAgora, 'cura BLOQUEADA (noHeal) não marca o rastreio');
  novo(); foe = st.lados[1].units[0]; foe.hp = foe.maxHp; heal(foe);
  ok(!foe.curadoAgora, 'cura no TETO (hp cheio, nada subiu) não marca o rastreio');
  console.log('  escritor=cura real · promotor gira agora→antes nos 2 lados · janela 1 turno · mesmo-turno não conta');
}

// ------------------------------------------------------------ 19. DOMINAR (§99, Afrodite/Boto) — a órfã mais antiga (§71)
console.log('== 19. dominar: a vítima usa o Básico DELA contra um aliado dela; tag nega orbe; curaCausador dreba; imune barra ==');
{
  // O fx `dominar` age sobre alvos[0]=vítima e alvos[1]=aliado-alvo (fogo amigo). Testo em ISOLAMENTO com aplicarFx.
  // perseu (básico 12) domina, babi leva o golpe. u = o lançador (zeus aqui) — só importa p/ curaCausador.
  const A2 = { alvo: '2inimigos', slot: 'habilidade' };
  let st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['perseu', 'babi', 'tyr'], 800);
  let u = st.lados[0].units[0], vitima = st.lados[1].units[0], aliado = st.lados[1].units[1];
  let h = aliado.hp;
  E.aplicarFx(st, u, [{ t: 'dominar', dur: 1 }], A2, [vitima, aliado]);
  ok(h - aliado.hp === 12 && !!E.ef(vitima, 'dominado'), `vítima (perseu, básico 12) bate no aliado: 12 e fica dominada (${h - aliado.hp}/${!!E.ef(vitima, 'dominado')})`);

  // curaCausador (Boto): o LANÇADOR dreba o dano do golpe-fantoche
  st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['perseu', 'babi', 'tyr'], 801);
  u = st.lados[0].units[0]; u.hp = 50; vitima = st.lados[1].units[0]; aliado = st.lados[1].units[1];
  E.aplicarFx(st, u, [{ t: 'dominar', dur: 1, curaCausador: true }], A2, [vitima, aliado]);
  ok(u.hp === 62, `curaCausador: o lançador cura o dano causado (50+12=62): ${u.hp}`);

  // durNoite: a tag dura +1 na Noite (Boto)
  st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['perseu', 'babi', 'tyr'], 802); E.definirFase(st, 'Noite', 3);
  u = st.lados[0].units[0]; vitima = st.lados[1].units[0];
  E.aplicarFx(st, u, [{ t: 'dominar', dur: 1, durNoite: 2 }], A2, [vitima, st.lados[1].units[1]]);
  ok((E.ef(vitima, 'dominado') || {}).dur === 2, `durNoite: na Noite a Dominação dura 2 (${(E.ef(vitima, 'dominado') || {}).dur})`);

  // RESÍDUO: o dominado nega geração de orbe (o que o motor já fazia)
  st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['perseu', 'babi', 'tyr'], 803);
  u = st.lados[0].units[0]; E.aplicarFx(st, u, [{ t: 'dominar', dur: 1 }], A2, [st.lados[1].units[0], st.lados[1].units[1]]);
  const antes = E.totalOrbs(st.lados[1]); st.ativo = 1; E.iniciarTurno(st);
  ok(E.totalOrbs(st.lados[1]) - antes === 2, `dominado nega orbe: 3 vivos, 1 dominado → gera 2 (${E.totalOrbs(st.lados[1]) - antes})`);

  // DEGENERADO: 1 inimigo vivo — aplica a tag, sem golpe (não há aliado)
  st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['perseu', 'babi', 'tyr'], 804);
  u = st.lados[0].units[0]; vitima = st.lados[1].units[0];
  E.aplicarFx(st, u, [{ t: 'dominar', dur: 1 }], A2, [vitima]);   // só a vítima
  ok(!!E.ef(vitima, 'dominado'), 'degenerado (sem aliado): a tag aplica, sem golpe (nada a golpear)');

  // IMUNE a controle barra a dominação inteira (tag E golpe)
  st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['perseu', 'babi', 'tyr'], 805);
  u = st.lados[0].units[0]; vitima = st.lados[1].units[0]; aliado = st.lados[1].units[1];
  vitima.efeitos.push({ type: 'controlImmune', dur: 9 }); h = aliado.hp;
  E.aplicarFx(st, u, [{ t: 'dominar', dur: 1 }], A2, [vitima, aliado]);
  ok(!E.ef(vitima, 'dominado') && aliado.hp === h, `imune a controle barra tudo: sem tag, sem golpe (${!!E.ef(vitima, 'dominado')}/${h - aliado.hp})`);
  console.log('  vítima bate no aliado dela · curaCausador dreba · durNoite +1 · nega orbe · degenerado só marca · imune barra');
}

// ------------------------------------------------------------ 20. RECARGA CONDICIONAL (§101, cdSe) — Lugh/Chang'e
console.log('== 20. cdSe: base condicional lida na disponibilidade; cd 0 dispensa a recarga (usa toda rodada); teto-invisível barrado ==');
{
  // deus de teste com Samildánach-like: recarga 2, mas 0 no Dia (a forma do Lugh). aliadoPresente cobre a do Chang'e.
  E.GODS.tcd = { nome: 'TCD', faccao: 'Celta', elem: 'Aurora', classe: 'Mágico', funcao: 'Suporte', passiva: { nome: '-', desc: '-' },
    ab: [{ slot: 'habilidade', classe: 'Mágico', nome: 'H', cost: {}, cd: 2, cdSe: { estado: { fase: 'Dia' }, cd: 0 }, alvo: 'inimigo', fx: [{ t: 'dmg', v: 10 }] }] };
  const acao = (st, u, slot) => E.acoesDe(st, u).find(a => a.slot === slot);
  let st = E.novoEstado(['tcd', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 900);
  let u = st.lados[0].units[0];
  ok(acao(st, u, 'habilidade').cd === 2, `fora do Dia: recarga base 2 (${acao(st, u, 'habilidade').cd})`);
  // com uma recarga STALE (usou antes): fora do Dia fica em_recarga; no Dia é dispensada
  u.cd.habilidade = 1;
  ok(acao(st, u, 'habilidade').motivo === 'em_recarga', 'com recarga pendente e sem Dia: em_recarga');
  E.definirFase(st, 'Dia', 3);
  const ad = acao(st, u, 'habilidade');
  ok(ad.cd === 0 && ad.disponivel, `no Dia: recarga efetiva 0 e DISPONÍVEL mesmo com recarga pendente (usa toda rodada) (${ad.cd}/${ad.disponivel})`);
  delete E.GODS.tcd;

  // Chang'e (real): base condicional por COMPOSIÇÃO de time (aliadoPresente) — constante na partida, lida ao vivo = constante
  st = E.novoEstado(['change', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 901);
  ok(acao(st, st.lados[0].units[0], 'habilidade').cd === 3, 'Chang’e sem Hou Yi: Elixir recarga 3');
  st = E.novoEstado(['change', 'houyi', 'zeus'], ['zeus', 'zeus', 'zeus'], 902);
  ok(acao(st, st.lados[0].units[0], 'habilidade').cd === 2, 'Chang’e com Hou Yi: Elixir recarga 2 (uma gaveta: ler ao vivo cobre o caso constante)');

  // GUARDA do teto-invisível (§101): cdSe cd 0 num MILAGRE é barrado; numa habilidade/básico é ok
  const errM = []; require('../tools/valida_kit.js').validarHabilidade({ slot: 'milagre', nome: 'X', cd: 4, cdSe: { estado: { fase: 'Dia' }, cd: 0 }, alvo: 'inimigo', fx: [{ t: 'dmg', v: 40 }] }, 'X', errM);
  ok(errM.some(e => /teto invis/.test(e)), 'cdSe cd 0 num MILAGRE barrado (nuke toda rodada — o auditor não vê frequência)');
  const errH = []; require('../tools/valida_kit.js').validarHabilidade({ slot: 'habilidade', nome: 'Y', cd: 1, cdSe: { estado: { fase: 'Dia' }, cd: 0 }, alvo: 'inimigo', fx: [{ t: 'dmg', v: 15 }] }, 'Y', errH);
  ok(errH.length === 0, 'cdSe cd 0 numa HABILIDADE é ok (Samildánach do Lugh)');
  console.log('  base condicional na disponibilidade · cd 0 dispensa recarga · aliadoPresente = constante · milagre-0 barrado');
}

// ------------------------------------------------------------ 21. SELETOR POR HP (§103, alvoHp) — max/min, aliado/inimigo, empate
console.log('== 21. alvoHp: escolhe AUTO por HP (max/min, aliado/inimigo); empate = MENOR ÍNDICE (determinístico) ==');
{
  const A = (alvo, slot) => ({ alvo: alvo || 'auto', slot: slot || 'milagre' });
  // max-inimigo (Lugh): dmg no de MAIOR HP
  let st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['tyr', 'tyr', 'tyr'], 900);
  let u = st.lados[0].units[0], fo = st.lados[1].units; fo[0].hp = 50; fo[1].hp = 90; fo[2].hp = 70;
  let h = fo.map(x => x.hp); E.aplicarFx(st, u, [{ t: 'dmg', v: 20, alvoHp: { lado: 'inimigo', ext: 'max' } }], A(), []);
  ok(h[1] - fo[1].hp === 20 && fo[0].hp === h[0] && fo[2].hp === h[2], `max-inimigo: só o de 90 leva 20 (${fo.map((x, i) => h[i] - x.hp)})`);
  // min-inimigo (Thor)
  st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['tyr', 'tyr', 'tyr'], 901);
  u = st.lados[0].units[0]; fo = st.lados[1].units; fo[0].hp = 50; fo[1].hp = 90; fo[2].hp = 30;
  h = fo.map(x => x.hp); E.aplicarFx(st, u, [{ t: 'dmg', v: 20, alvoHp: { lado: 'inimigo', ext: 'min' } }], A(), []);
  ok(h[2] - fo[2].hp === 20 && fo[0].hp === h[0] && fo[1].hp === h[1], `min-inimigo: só o de 30 leva 20 (${fo.map((x, i) => h[i] - x.hp)})`);
  // min-aliado (Deméter mais ferido) via aplicarFx direto
  st = E.novoEstado(['demeter', 'zeus', 'zeus'], ['tyr', 'tyr', 'tyr'], 902);
  u = st.lados[0].units[0]; let al = st.lados[0].units; al[0].hp = 100; al[1].hp = 40; al[2].hp = 80;
  E.aplicarFx(st, u, [{ t: 'heal', v: 6, alvoHp: { lado: 'aliado', ext: 'min' } }], A('nenhum'), []);
  ok(al[1].hp === 46 && al[0].hp === 100 && al[2].hp === 80, `min-aliado (mais ferido): só o de 40 cura (${al.map(x => x.hp)})`);
  // EMPATE → menor índice (o replay/arena não podem divergir — a posição do dono, como o Huang Di)
  st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['tyr', 'tyr', 'tyr'], 903);
  u = st.lados[0].units[0]; fo = st.lados[1].units; fo[0].hp = 90; fo[1].hp = 90; fo[2].hp = 50;
  h = fo.map(x => x.hp); E.aplicarFx(st, u, [{ t: 'dmg', v: 20, alvoHp: { lado: 'inimigo', ext: 'max' } }], A(), []);
  ok(h[0] - fo[0].hp === 20 && fo[1].hp === h[1], `empate no 90: o MENOR ÍNDICE (0) leva, não o 1 (${fo.map((x, i) => h[i] - x.hp)})`);
  // caminho do FAZ (rodarFaz, Deméter porTurno): o mesmo seletor no faz-heal
  st = E.novoEstado(['demeter', 'zeus', 'zeus'], ['tyr', 'tyr', 'tyr'], 904);
  al = st.lados[0].units; al[0].hp = 100; al[1].hp = 30; al[2].hp = 100;
  st.ativo = 0; E.iniciarTurno(st);
  ok(al[1].hp === 36, `no faz (porTurno da Deméter): o mais ferido (índice 1) curou 6 (${al[1].hp})`);
  console.log('  max/min · aliado/inimigo · empate = menor índice · funciona no fx E no faz (rodarFaz)');
}

// ------------------------------------------------------------ 22. semContra (§105, Lugh) — "não pode ser contra-atacado"
console.log('== 22. semContra: o golpe não aciona contraAtaca; sem a flag, aciona (negação do contraAtaca, ≠ intercepta/reflete) ==');
{
  let st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['atena', 'zeus', 'zeus'], 900);
  let atk = st.lados[0].units[0], foe = st.lados[1].units[0];
  foe.efeitos.push({ type: 'contraAtaca', v: 10, dur: 9 });
  let h = atk.hp;
  E.bater(st, atk, foe, 15, 'afetado', 'basico', { unico: true, semContra: true });
  ok(h - atk.hp === 0, `com semContra: o atacante NÃO sofre o contra-ataque (${h - atk.hp})`);
  // controle: sem a flag, o mesmo golpe sofre o contra (prova de que é a flag que barra)
  st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['atena', 'zeus', 'zeus'], 901);
  atk = st.lados[0].units[0]; foe = st.lados[1].units[0]; foe.efeitos.push({ type: 'contraAtaca', v: 10, dur: 9 });
  h = atk.hp;
  E.bater(st, atk, foe, 15, 'afetado', 'basico', { unico: true });
  ok(h - atk.hp === 10, `sem a flag: o golpe único sofre o contra-ataque de 10 (${h - atk.hp})`);
  console.log('  semContra barra o contraAtaca do alvo · sem a flag o contra acontece');
}

// ------------------------------------------------------------ 23. alvoSenhor (§107, Hanuman) — o aliado designado, fallback mais ferido
console.log('== 23. alvoSenhor: mira o aliado que a intercepta protege; sem Senhor, cai no mais ferido (alvoHp) ==');
{
  const A = a => ({ alvo: a || 'nenhum', slot: 'milagre' });
  // COM Senhor: a intercepta{protege: X} do dono → o heal alvoSenhor vai em X, mesmo que outro esteja MAIS ferido
  let st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['tyr', 'tyr', 'tyr'], 900);
  let u = st.lados[0].units[0], senhor = st.lados[0].units[1], outro = st.lados[0].units[2];
  senhor.hp = 70; outro.hp = 30;
  E.aplicarFx(st, u, [{ t: 'intercepta', dur: 2, contra: 'todos' }], { alvo: 'aliado', slot: 'habilidade' }, [senhor]);
  E.aplicarFx(st, u, [{ t: 'heal', v: 30, alvoSenhor: true }], A(), []);
  ok(senhor.hp === 100 && outro.hp === 30, `com Senhor: cura o DESIGNADO (70→100), não o mais ferido (30 intacto) (${senhor.hp}/${outro.hp})`);
  // SEM Senhor: sem intercepta → fallback no mais ferido (alvoHp min)
  st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['tyr', 'tyr', 'tyr'], 901);
  u = st.lados[0].units[0]; let a1 = st.lados[0].units[1], a2 = st.lados[0].units[2];
  a1.hp = 90; a2.hp = 40;
  E.aplicarFx(st, u, [{ t: 'heal', v: 30, alvoSenhor: true }], A(), []);
  ok(a2.hp === 70 && a1.hp === 90, `sem Senhor: fallback no mais ferido (40→70), não no de 90 (${a2.hp}/${a1.hp})`);
  // Senhor CAIU → também cai no fallback (a intercepta aponta p/ um morto)
  st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['tyr', 'tyr', 'tyr'], 902);
  u = st.lados[0].units[0]; senhor = st.lados[0].units[1]; outro = st.lados[0].units[2];
  E.aplicarFx(st, u, [{ t: 'intercepta', dur: 2, contra: 'todos' }], { alvo: 'aliado', slot: 'habilidade' }, [senhor]);
  senhor.vivo = false; senhor.hp = 0; outro.hp = 50;
  E.aplicarFx(st, u, [{ t: 'heal', v: 30, alvoSenhor: true }], A(), []);
  ok(outro.hp === 80, `Senhor caído: fallback no mais ferido vivo (50→80) (${outro.hp})`);
  console.log('  mira o designado (intercepta.protege) · sem/caído → mais ferido (alvoHp) · sem 2º lugar guardando o Senhor');
}

// ------------------------------------------------------------ 24. refleteDano (thorns) + intercepta-passiva-nomeada (§109, Mnevis)
console.log('== 24a. refleteDano (thorns): devolve v FIXO ao atacante quando o portador sofre dano; não faz loop; só se o dano entrou ==');
{
  // o portador de refleteDano devolve v FIXO (10) ao atacante — independente do dano que sofreu
  let st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 940);
  let carr = st.lados[0].units[0], atk = st.lados[1].units[0];
  carr.efeitos.push({ type: 'refleteDano', v: 10, dur: 2 });
  let ha = atk.hp;
  E.bater(st, atk, carr, 20, 'afetado', 'basico', { unico: true });
  ok(ha - atk.hp === 10, `o atacante sofre o reflexo FIXO de 10 (não os 20 do golpe) (${ha - atk.hp})`);
  // sem loop entre DOIS portadores: o golpe de reflexo usa slot 'reflexo' e NÃO re-reflete
  st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 941);
  carr = st.lados[0].units[0]; atk = st.lados[1].units[0];
  carr.efeitos.push({ type: 'refleteDano', v: 10, dur: 2 });
  atk.efeitos.push({ type: 'refleteDano', v: 10, dur: 2 });   // o atacante TAMBÉM reflete
  ha = atk.hp; let hc = carr.hp;
  E.bater(st, atk, carr, 20, 'afetado', 'basico', { unico: true });
  ok(hc - carr.hp === 20 && ha - atk.hp === 10, `sem loop: portador leva 20, atacante leva só o reflexo de 10 (o reflexo não re-reflete) (${hc - carr.hp}/${ha - atk.hp})`);
  // só reflete se o dano ENTROU (v > 0): golpe barrado por invulnerável → sem reflexo
  st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 942);
  carr = st.lados[0].units[0]; atk = st.lados[1].units[0];
  carr.efeitos.push({ type: 'refleteDano', v: 10, dur: 2 }, { type: 'invulneravel', dur: 2 });
  ha = atk.hp;
  E.bater(st, atk, carr, 20, 'afetado', 'basico', { unico: true });
  ok(ha - atk.hp === 0, `dano barrado (v=0) → NÃO reflete (${ha - atk.hp})`);
  console.log('  reflexo FIXO · slot reflexo não re-reflete (sem loop) · só com v>0');
}
console.log('== 24b. intercepta-passiva-nomeada: a passiva do Mnevis re-arma intercepta protegendo Rá por NOME, 1º golpe por turno, só com Rá no time ==');
{
  // COM Rá no time: iniciarTurno arma a intercepta no Mnevis protegendo Rá (contra:'unico' + porTurno)
  let st = E.novoEstado(['mnevis', 'ra', 'zeus'], ['zeus', 'zeus', 'zeus'], 943);
  let mnevis = st.lados[0].units[0], ra = st.lados[0].units[1], foe = st.lados[1].units[0];
  st.ativo = 0; E.iniciarTurno(st);
  let hr = ra.hp, hm = mnevis.hp;
  E.bater(st, foe, ra, 18, 'afetado', 'basico', { unico: true });
  ok(ra.hp === hr && hm - mnevis.hp === 18, `1º golpe único contra Rá é INTERCEPTADO: Rá intacto, Mnevis leva 18 (Rá ${hr - ra.hp}, Mnevis ${hm - mnevis.hp})`);
  // 2º golpe no MESMO turno: a intercepta foi consumida (contra:'unico') → Rá leva
  hr = ra.hp;
  E.bater(st, foe, ra, 18, 'afetado', 'basico', { unico: true });
  ok(hr - ra.hp === 18, `2º golpe no mesmo turno NÃO é interceptado (primeiro-por-turno) (${hr - ra.hp})`);
  // turno seguinte: porTurno re-arma → intercepta de novo
  E.iniciarTurno(st);
  hr = ra.hp; hm = mnevis.hp;
  E.bater(st, foe, ra, 18, 'afetado', 'basico', { unico: true });
  ok(ra.hp === hr && hm - mnevis.hp === 18, `no turno seguinte a passiva re-armou: 1º golpe interceptado de novo (Rá ${hr - ra.hp}, Mnevis ${hm - mnevis.hp})`);
  // SEM Rá no time: o estado (aliadoPresente:'ra') não bate → nada é armado
  st = E.novoEstado(['mnevis', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 944);
  mnevis = st.lados[0].units[0]; let ali = st.lados[0].units[1]; foe = st.lados[1].units[0];
  st.ativo = 0; E.iniciarTurno(st);
  let hal = ali.hp;
  E.bater(st, foe, ali, 18, 'afetado', 'basico', { unico: true });
  ok(hal - ali.hp === 18, `sem Rá no time: nada é interceptado (aliadoPresente gateia) (${hal - ali.hp})`);
  console.log('  arma só com Rá · 1º golpe por turno · re-arma no porTurno · gateado por aliadoPresente');
}

// ------------------------------------------------------------ 25. acaoPerfeita + rastreio de dano causado (§111, Krishna)
console.log('== 25a. acaoPerfeita: buff TRANSFERIDO que torna a HABILIDADE do portador não-evitável/reduzível/absorvível/contra-atacável ==');
{
  // não-reduzível + não-absorvível: a habilidade fura redução E escudo (os dois nomes = o MESMO danoIrredutivel)
  let st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['tyr', 'tyr', 'tyr'], 960);
  let atk = st.lados[0].units[0], foe = st.lados[1].units[0];
  atk.efeitos.push({ type: 'acaoPerfeita', dur: 2 });
  foe.shield = 50; foe.efeitos.push({ type: 'dmgReduction', v: 10, dur: 9 });
  let h = foe.hp;
  E.bater(st, atk, foe, 30, 'afetado', 'habilidade', { unico: true });
  ok(h - foe.hp === 30 && foe.shield === 50, `habilidade com Ação Perfeita fura redução E escudo (30 no HP, escudo 50 intacto) (${h - foe.hp}/${foe.shield})`);
  // MESMO portador, MESMO golpe, slot BÁSICO: NÃO fura (só a habilidade herda — "a próxima habilidade")
  st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['tyr', 'tyr', 'tyr'], 961);
  atk = st.lados[0].units[0]; foe = st.lados[1].units[0];
  atk.efeitos.push({ type: 'acaoPerfeita', dur: 2 });
  foe.shield = 50; foe.efeitos.push({ type: 'dmgReduction', v: 10, dur: 9 });
  h = foe.hp; let sh = foe.shield;
  E.bater(st, atk, foe, 30, 'afetado', 'basico', { unico: true });
  ok(h - foe.hp === 0 && foe.shield === 30, `básico do mesmo portador NÃO fura: 30−10 red = 20 absorvido pelo escudo (HP intacto, escudo 50→30) (${h - foe.hp}/${foe.shield})`);
  // não-contra-atacável: a habilidade não aciona o contraAtaca do alvo
  st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['atena', 'zeus', 'zeus'], 962);
  atk = st.lados[0].units[0]; foe = st.lados[1].units[0];
  atk.efeitos.push({ type: 'acaoPerfeita', dur: 2 }); foe.efeitos.push({ type: 'contraAtaca', v: 10, dur: 9 });
  let ha = atk.hp;
  E.bater(st, atk, foe, 15, 'afetado', 'habilidade', { unico: true });
  ok(ha - atk.hp === 0, `habilidade com Ação Perfeita não sofre contra-ataque (${ha - atk.hp})`);
  // controle: sem o buff, o mesmo golpe sofre o contra (prova de que é o buff que barra)
  st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['atena', 'zeus', 'zeus'], 963);
  atk = st.lados[0].units[0]; foe = st.lados[1].units[0]; foe.efeitos.push({ type: 'contraAtaca', v: 10, dur: 9 });
  ha = atk.hp;
  E.bater(st, atk, foe, 15, 'afetado', 'habilidade', { unico: true });
  ok(ha - atk.hp === 10, `sem o buff: a habilidade sofre o contra de 10 (${ha - atk.hp})`);
  // não-evitável: a MIRA da habilidade alcança Inalvejável; a do básico NÃO (só a habilidade herda — §84 no eixo da mira)
  st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['tyr', 'tyr', 'tyr'], 964);
  atk = st.lados[0].units[0]; foe = st.lados[1].units[0];
  atk.efeitos.push({ type: 'acaoPerfeita', dur: 2 }); foe.efeitos.push({ type: 'inalvejavel', dur: 9 });
  const vHab = E.alvosValidos(st, atk, { slot: 'habilidade', alvo: 'inimigo' });
  const vBas = E.alvosValidos(st, atk, { slot: 'basico', alvo: 'inimigo' });
  ok(vHab.some(x => x.uid === foe.uid) && !vBas.some(x => x.uid === foe.uid), `Inalvejável mirável na HABILIDADE, não no básico (hab ${vHab.length}, bas ${vBas.length})`);
  console.log('  fura red+escudo+contra só na habilidade · básico não herda · mira alcança Inalvejável só na habilidade');
}
console.log('== 25b. rastreio de dano causado: escritor (dano líquido em inimigo), promotor ANCORADO ao lado ativo (≠ global do §97) ==');
{
  // ESCRITOR: bater credita ao atacante o dano LÍQUIDO em inimigo; dano em aliado NÃO conta
  let st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['tyr', 'tyr', 'tyr'], 965);
  let atk = st.lados[0].units[0], foe = st.lados[1].units[0], ali = st.lados[0].units[1];
  foe.shield = 5;
  E.bater(st, atk, foe, 20, 'afetado', 'basico', { unico: true });   // 20−5 escudo = 15 líquido
  ok(atk.danoAgora === 15, `escritor credita o dano LÍQUIDO (20−5 escudo = 15) (${atk.danoAgora})`);
  E.bater(st, atk, ali, 10, 'afetado', 'basico', {});   // dano no próprio lado NÃO é "causar dano"
  ok(atk.danoAgora === 15, `dano em aliado não é creditado (segue 15) (${atk.danoAgora})`);
  // PROMOTOR ancorado: iniciarTurno promove SÓ o lado ATIVO (o §97 promove os dois; este é o gêmeo de âncora oposta)
  st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['tyr', 'tyr', 'tyr'], 966);
  let u0 = st.lados[0].units[0], u1 = st.lados[1].units[0];
  u0.danoAgora = 20; u1.danoAgora = 30;
  st.ativo = 0; E.iniciarTurno(st);
  ok(u0.danoAntes === 20 && u0.danoAgora === 0, `lado ATIVO promovido (antes 20, agora 0) (${u0.danoAntes}/${u0.danoAgora})`);
  ok(u1.danoAntes === 0 && u1.danoAgora === 30, `lado INATIVO intacto (antes 0, agora 30 ainda) — âncora ao dono, não global (${u1.danoAntes}/${u1.danoAgora})`);
  console.log('  escritor = dano líquido em inimigo · aliado não conta · promotor ancorado ao lado ativo (≠ §97 global)');
}

// ------------------------------------------------------------ 26. DoT escalado por contador + alvoContador (§114, Izanami)
console.log('== 26a. DoT escalado: o tique lê o MESMO escalador do dano de habilidade (porContador), ao vivo, no portador ==');
{
  const A = (alvo, slot) => ({ alvo, slot: slot || 'habilidade' });
  // aplica via fx real; o dot guarda o escalador; o tique faz v(0) + 6×contador
  let st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 970);
  let atk = st.lados[0].units[0], u = st.lados[1].units[0];
  u.contadores.maldicao = 3;
  E.aplicarFx(st, atk, [{ t: 'dot', nome: 'maldicao', v: 0, porContador: { nome: 'maldicao', onde: 'self', v: 6 }, dur: 9 }], A('inimigo', 'habilidade'), [u]);
  const d = u.dots.find(x => x.nome === 'maldicao');
  ok(d && d.escala, 'o dot guardou o escalador (porContador) para ler no tique');
  let h = u.hp; st.ativo = 1; E.iniciarTurno(st);
  ok(h - u.hp === 18, `tique = v(0) + 6×3 = 18 (${h - u.hp})`);
  // contador maior → tique maior (lê AO VIVO): 6×5 = 30, em estado separado (sem re-init duplo)
  st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 971);
  atk = st.lados[0].units[0]; u = st.lados[1].units[0]; u.contadores.maldicao = 5;
  E.aplicarFx(st, atk, [{ t: 'dot', nome: 'maldicao', v: 0, porContador: { nome: 'maldicao', onde: 'self', v: 6 }, dur: 9 }], A('inimigo', 'habilidade'), [u]);
  h = u.hp; st.ativo = 1; E.iniciarTurno(st);
  ok(h - u.hp === 30, `contador 5 → tique 6×5 = 30 (o escalador é o mesmo do dano de habilidade) (${h - u.hp})`);
  // sem contador → tique 0 (inofensivo)
  st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 972);
  atk = st.lados[0].units[0]; u = st.lados[1].units[0];
  E.aplicarFx(st, atk, [{ t: 'dot', nome: 'maldicao', v: 0, porContador: { nome: 'maldicao', onde: 'self', v: 6 }, dur: 9 }], A('inimigo', 'habilidade'), [u]);
  h = u.hp; st.ativo = 1; E.iniciarTurno(st);
  ok(h - u.hp === 0, `sem acúmulo → 0 no tique (${h - u.hp})`);
  console.log('  o tique reusa escalaContagem · lê o contador do portador ao vivo · 6×N puro/turno');
}
console.log('== 26b. alvoContador: condição "o alvo tem o contador cruzando o limiar" (execIf: elimina só amaldiçoados) ==');
{
  const A = (alvo, slot) => ({ alvo, slot: slot || 'habilidade' });
  let st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 973);
  let atk = st.lados[0].units[0], e = st.lados[1].units;
  e[0].hp = 25; e[0].contadores.maldicao = 1;   // ≤30 E amaldiçoado → executa
  e[1].hp = 25; e[1].contadores.maldicao = 0;   // ≤30 mas SEM maldicao → sobrevive
  e[2].hp = 80; e[2].contadores.maldicao = 3;   // amaldiçoado mas HP alto → sobrevive
  E.aplicarFx(st, atk, [{ t: 'dmg', v: 1, escopo: 'todosInimigos', executaAbaixoDe: 30, execIf: { alvoContador: { nome: 'maldicao', op: 'min', n: 1 } } }], A('todosInimigos', 'milagre'), []);
  ok(!e[0].vivo && e[1].vivo && e[2].vivo, `execIf alvoContador: elimina só o amaldiçoado ≤30 (e0), poupa o não-amaldiçoado (e1) e o de HP alto (e2) (${e.map(x => x.vivo)})`);
  console.log('  alvoContador gateia a execução · só quem carrega a Maldição é elegível');
}

// ------------------------------------------------------------ 27. agendador de payload (§117, M1/Kukulkán)
console.log('== 27. agendar: no lançamento só guarda; dispara no PRÓXIMO iniciarTurno do dono; ordem por índice; sem fila global ==');
{
  const A = (alvo, slot) => ({ alvo: alvo || 'nenhum', slot: slot || 'habilidade' });
  // lançar NÃO dispara — só empilha no pendente do dono
  let st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['tyr', 'tyr', 'tyr'], 975);
  let u = st.lados[0].units[0], e = st.lados[1].units;
  const h = e.map(x => x.hp);
  E.aplicarFx(st, u, [{ t: 'agendar', alvo: 'todosInimigos', agenda: [{ t: 'dmg', v: 25, escopo: 'todosInimigos' }] }], A('nenhum'), []);
  ok(u.pendente.length === 1 && e.every((x, i) => x.hp === h[i]), `no lançamento: guarda o payload, NÃO dispara (pend ${u.pendente.length}, dano ${e.map((x, i) => h[i] - x.hp)})`);
  // dispara no iniciarTurno do dono, e é consumido
  st.ativo = 0; E.iniciarTurno(st);
  ok(e.every((x, i) => h[i] - x.hp === 25) && u.pendente.length === 0, `dispara no iniciarTurno do dono: 25 a todos, pendente limpo (${e.map((x, i) => h[i] - x.hp)}, pend ${u.pendente.length})`);
  // determinismo: dois payloads no MESMO dono disparam em ordem de inserção (sem fila global)
  st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['tyr', 'tyr', 'tyr'], 976);
  u = st.lados[0].units[0]; e = st.lados[1].units; const h2 = e.map(x => x.hp);
  E.aplicarFx(st, u, [{ t: 'agendar', alvo: 'todosInimigos', agenda: [{ t: 'dmg', v: 10, escopo: 'todosInimigos' }] }], A('nenhum'), []);
  E.aplicarFx(st, u, [{ t: 'agendar', alvo: 'todosInimigos', agenda: [{ t: 'dmg', v: 5, escopo: 'todosInimigos' }] }], A('nenhum'), []);
  st.ativo = 0; E.iniciarTurno(st);
  ok(e.every((x, i) => h2[i] - x.hp === 15), `dois payloads no mesmo dono empilham (10+5=15) (${e.map((x, i) => h2[i] - x.hp)})`);
  // unidade morta não dispara (e não crasha)
  st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['tyr', 'tyr', 'tyr'], 977);
  u = st.lados[0].units[0]; e = st.lados[1].units; const h3 = e.map(x => x.hp);
  E.aplicarFx(st, u, [{ t: 'agendar', alvo: 'todosInimigos', agenda: [{ t: 'dmg', v: 25, escopo: 'todosInimigos' }] }], A('nenhum'), []);
  u.vivo = false; u.hp = 0;
  st.ativo = 0; E.iniciarTurno(st);
  ok(e.every((x, i) => x.hp === h3[i]), `dono morto não dispara o payload (${e.map((x, i) => h3[i] - x.hp)})`);
  console.log('  guarda no lançamento · dispara no iniciarTurno do dono · ordem de inserção · dono morto não dispara');
}

// ------------------------------------------------------------ 28. consequência de abate (§118, M3): zeraCd + abateNaoRevive
console.log('== 28. consequência de abate: zeraCd (aoCair inimigo, self) + abateNaoRevive (leitor do matar, carimba o MORTO) ==');
{
  // zeraCd via aoCair{quem:inimigo}: Ares abate → sua recarga zera (self); sem abate, fica
  let st = E.novoEstado(['ares', 'zeus', 'zeus'], ['tyr', 'tyr', 'tyr'], 978);
  let a = st.lados[0].units[0], foe = st.lados[1].units[0];
  a.cd.milagre = 3; foe.hp = 8;
  E.bater(st, a, foe, 20, 'afetado', 'basico', {});   // 20 > 8 → matar → aoCair inimigo → zeraCd
  ok(!foe.vivo && a.cd.milagre === 0, `abate → zeraCd no PRÓPRIO (recarga 3→0) (${a.cd.milagre}, foe vivo ${foe.vivo})`);
  st = E.novoEstado(['ares', 'zeus', 'zeus'], ['tyr', 'tyr', 'tyr'], 979);
  a = st.lados[0].units[0]; foe = st.lados[1].units[0]; a.cd.milagre = 3;
  E.bater(st, a, foe, 20, 'afetado', 'basico', {});   // não mata
  ok(foe.vivo && a.cd.milagre === 3, `sem abate: a recarga fica (${a.cd.milagre})`);
  // abateNaoRevive: quem o MATADOR (com a passiva) abate leva naoRevive; matador comum não
  st = E.novoEstado(['ammit', 'zeus', 'zeus'], ['tyr', 'tyr', 'tyr'], 980);
  let am = st.lados[0].units[0], v = st.lados[1].units[0]; v.hp = 5;
  E.bater(st, am, v, 15, 'afetado', 'basico', {});
  ok(!v.vivo && v.naoRevive === true, `abatido por Ammit → naoRevive (carimba o morto, keyed pelo matador) (${v.naoRevive})`);
  st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['tyr', 'tyr', 'tyr'], 981);
  let z = st.lados[0].units[0], v2 = st.lados[1].units[0]; v2.hp = 5;
  E.bater(st, z, v2, 15, 'afetado', 'basico', {});
  ok(!v2.vivo && !v2.naoRevive, `abatido por matador comum → SEM naoRevive (${v2.naoRevive})`);
  console.log('  zeraCd só ao abater, no próprio · abateNaoRevive carimba o morto só se o matador tem a passiva');
}

// ------------------------------------------------------------ 29. extensões da imunidade (§120, M4/izanagi)
console.log('== 29. imunidade: TEAM-scope (um aliado protege o lado) + MECÂNICA contágio (espalha) + bloqueia GANHAR o contador ==');
{
  const Ai = (alvo, slot) => ({ alvo: alvo || 'inimigo', slot: slot || 'habilidade' });
  // TEAM-scope: izanagi (imune escopo:time) protege o ALIADO; Nezha (self) NÃO
  let st = E.novoEstado(['izanagi', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 982);
  let ali = st.lados[0].units[1], atk = st.lados[1].units[0];
  E.aplicarFx(st, atk, [{ t: 'dot', nome: 'maldicao', v: 6, dur: 9 }], Ai('inimigo'), [ali]);
  ok(!ali.dots.some(d => d.nome === 'maldicao'), 'escopo:time — o aliado do izanagi é imune (a imunidade varre o lado)');
  st = E.novoEstado(['nezha', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 983);
  ali = st.lados[0].units[1]; atk = st.lados[1].units[0];
  E.aplicarFx(st, atk, [{ t: 'dot', nome: 'queimadura', v: 8, dur: 3 }], Ai('inimigo'), [ali]);
  ok(ali.dots.some(d => d.nome === 'queimadura'), 'escopo:self (Nezha) NÃO vaza p/ o aliado');
  // MECÂNICA contágio: espalharContador pula o contagio-imune (izanagi)
  st = E.novoEstado(['izanagi', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 984);
  const u0 = st.lados[0].units[0], u1 = st.lados[0].units[1];
  u1.contadores.maldicao = 5;
  E.espalharContador(st, [u0, u1], { nome: 'maldicao' }, u1);
  ok(E.getContador(u0, 'maldicao') === 0, `contágio: izanagi (imune) não é alcançado pelo espalha (${E.getContador(u0, 'maldicao')})`);
  // bloqueia GANHAR o contador (addContador via fx) — mas o consumo/decremento passa
  st = E.novoEstado(['izanagi', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 985);
  const alvo = st.lados[0].units[0];   // izanagi (imune a maldicao)
  E.aplicarFx(st, st.lados[1].units[0], [{ t: 'contador', nome: 'maldicao', v: 1 }], Ai('inimigo'), [alvo]);
  ok(E.getContador(alvo, 'maldicao') === 0, `imune a Maldição bloqueia GANHAR o contador (${E.getContador(alvo, 'maldicao')})`);
  console.log('  team-scope varre o lado · self não vaza · contágio (mecânica) pula o imune · ganho de contador bloqueado');
}

// ------------------------------------------------------------ 30. iniciativa (§121, M2/Hermes/Exu): "age primeiro" = ser o starter, regra de SETUP
console.log('== 30. iniciativa: um lado com a passiva ABRE (força o starter); ambos CANCELAM (comeca sorteado vale); o custo de abertura segue ==');
{
  // UM lado com iniciativa → ABRE, mesmo contra o comeca sorteado
  let st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['hermes', 'zeus', 'zeus'], 5, 0);
  ok(st.starter === 1 && st.ativo === 1, `iniciativa no lado 1 → ele abre apesar de comeca=0 (starter ${st.starter})`);
  ok(E.totalOrbs(st.lados[1]) === 1 && E.totalOrbs(st.lados[0]) === 0, `o starter-por-passiva paga o custo de abertura (1 orbe, não 3) (${E.totalOrbs(st.lados[1])})`);
  st = E.novoEstado(['hermes', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 5, 1);
  ok(st.starter === 0, `iniciativa no lado 0 → ele abre apesar de comeca=1 (starter ${st.starter})`);
  // AMBOS os lados com iniciativa → CANCELAM (determinístico), o comeca SORTEADO vale
  st = E.novoEstado(['hermes', 'zeus', 'zeus'], ['hermes', 'zeus', 'zeus'], 5, 1);
  ok(st.starter === 1, `ambos com iniciativa → cancelam, comeca=1 sorteado vale (${st.starter})`);
  st = E.novoEstado(['hermes', 'zeus', 'zeus'], ['hermes', 'zeus', 'zeus'], 5, 0);
  ok(st.starter === 0, `ambos com iniciativa → comeca=0 sorteado vale (${st.starter})`);
  // NENHUM → comeca sorteado intacto (regressão: a regra não muda o baseline)
  st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 5, 1);
  ok(st.starter === 1, `nenhum com iniciativa → comeca sorteado (1) intacto (${st.starter})`);
  console.log('  um lado abre · ambos cancelam (sorteio vale) · nenhum = baseline · custo de abertura preservado');
}

// ------------------------------------------------------------ 31. Mimir (§123): bonusDano `mesmoMorto` (vale derrotado) + gatilho `naoRevivivel` (self não revive)
console.log('== 31. Mimir: bonusDano mesmoMorto vale MORTO (gate por-fx) + naoRevivivel carimba o próprio morto ==');
{
  // (a) mesmoMorto: Mimir VIVO dá +6 ao time; MORTO continua dando +6 (a "Cabeça Falante" fala do além)
  let st = E.novoEstado(['mimir', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 990);
  let mimir = st.lados[0].units[0], atk = st.lados[0].units[1], foe = st.lados[1].units[0];
  ok(E.bonusDanoDeclarativo(st, atk, foe) === 6, `Mimir vivo: +6 ao time (${E.bonusDanoDeclarativo(st, atk, foe)})`);
  mimir.vivo = false;
  ok(E.bonusDanoDeclarativo(st, atk, foe) === 6, `Mimir MORTO: +6 continua (mesmoMorto relaxa o gate de vivo) (${E.bonusDanoDeclarativo(st, atk, foe)})`);
  // (b) o gate é POR-FX, não por-unidade: um bonusDano SEM mesmoMorto (Osíris) morto contribui 0,
  //     mesmo sendo agora 1 caído que faria o porAliadoCaido:8 render — o fx é pulado antes de escalar
  st = E.novoEstado(['osiris', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 991);
  let osi = st.lados[0].units[0], atk2 = st.lados[0].units[1], foe2 = st.lados[1].units[0];
  osi.vivo = false;
  ok(E.bonusDanoDeclarativo(st, atk2, foe2) === 0, `Osíris (sem mesmoMorto) morto: 0 — o gate é por-fx, não vaza (${E.bonusDanoDeclarativo(st, atk2, foe2)})`);
  // (c) naoRevivivel: Mimir abatido fica irrevivível — o snapshot em matar lê a PRÓPRIA passiva (self-direction, §119)
  st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['mimir', 'zeus', 'zeus'], 992);
  let killer = st.lados[0].units[0], m2 = st.lados[1].units[0]; m2.hp = 5;
  E.bater(st, killer, m2, 15, 'afetado', 'basico', {});
  ok(!m2.vivo && m2.naoRevive === true, `Mimir abatido → naoRevive carimbado pela própria passiva (matador comum) (${m2.naoRevive})`);
  E.reviver(st, m2, { hp: 60 });
  ok(!m2.vivo, `reviver falha: a Cabeça Falante não volta (vivo ${m2.vivo})`);
  console.log('  +6 mesmo morto · gate por-fx (Osíris não vaza) · self-naoRevive trava o revive');
}

// ------------------------------------------------------------ 32. Leva 1 do HOOK (§126): déficit-de-aliados · condição comparativa · condicional POR-ALVO em AoE (§87 fechada)
console.log('== 32. §126: porDeficitAliados (piso 0) · alvoMaisDebuffs (comparativo) · condicional AoE por-alvo (a pendência §87) ==');
{
  // (a) porDeficitAliados (Susanoo): +v por unidade viva a MENOS que o inimigo; piso 0 (nunca negativo)
  let st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 1100);
  let u = st.lados[0].units[0], foes = st.lados[1].units;
  let h = foes[0].hp; E.aplicarFx(st, u, [{ t: 'dmg', v: 5, porDeficitAliados: { v: 6 } }], A('inimigo', 'basico'), [foes[0]]);
  ok(h - foes[0].hp === 5, `déficit 0 (3×3): 5 + 0 = 5 (${h - foes[0].hp})`);
  st.lados[0].units[1].vivo = false; st.lados[0].units[2].vivo = false;   // 1 aliado vivo × 3 inimigos = déficit 2
  h = foes[0].hp; E.aplicarFx(st, u, [{ t: 'dmg', v: 5, porDeficitAliados: { v: 6 } }], A('inimigo', 'basico'), [foes[0]]);
  ok(h - foes[0].hp === 17, `déficit 2: 5 + 6×2 = 17 (${h - foes[0].hp})`);
  st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 1101);   // agora mais aliados que inimigos → piso 0
  u = st.lados[0].units[0]; foes = st.lados[1].units; foes[1].vivo = false; foes[2].vivo = false;   // 3 aliados × 1 inimigo = déficit -2
  h = foes[0].hp; E.aplicarFx(st, u, [{ t: 'dmg', v: 5, porDeficitAliados: { v: 6 } }], A('inimigo', 'basico'), [foes[0]]);
  ok(h - foes[0].hp === 5, `déficit negativo → piso 0: 5 + 0 = 5 (${h - foes[0].hp})`);

  // (b) alvoMaisDebuffs (Anúbis): condição COMPARATIVA de contagem (não presença) — debuff inclui DoT; buff inclui escudo
  st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 1102);
  u = st.lados[0].units[0]; let foe = st.lados[1].units[0];
  foe.efeitos.push({ type: 'dmgDown', v: 5, dur: 3 }, { type: 'noHeal', dur: 3 });   // 2 debuffs, 0 buffs (nenhum mexe no dano de ENTRADA — o teste mede o ramo, não riders)
  const cond = [{ t: 'condicional', se: { alvoMaisDebuffs: true }, entao: [{ t: 'dmg', v: 10 }], senao: [{ t: 'dmg', v: 1 }] }];
  h = foe.hp; E.aplicarFx(st, u, cond, A('inimigo', 'habilidade'), [foe]);
  ok(h - foe.hp === 10, `2 debuffs > 0 buffs → ramo entao (10) (${h - foe.hp})`);
  foe.efeitos.push({ type: 'dmgUp', v: 5, dur: 3 }, { type: 'intercepta', dur: 3 }, { type: 'regen', v: 5, dur: 3 });   // agora 3 buffs vs 2 debuffs
  h = foe.hp; E.aplicarFx(st, u, cond, A('inimigo', 'habilidade'), [foe]);
  ok(h - foe.hp === 1, `2 debuffs <= 3 buffs → ramo senao (1) (${h - foe.hp})`);

  // (c) condicional POR-ALVO em AoE (§87 fechada, Anúbis milagre): cada inimigo avalia o próprio `se`; o ramo NÃO re-expande
  st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 1103);
  u = st.lados[0].units[0]; const e = st.lados[1].units;
  e[0].contadores.atadura = 4; e[1].contadores.atadura = 2; e[2].contadores.atadura = 5;
  E.aplicarFx(st, u, [{ t: 'condicional', escopo: 'todosInimigos', se: { alvoContador: { nome: 'atadura', op: 'min', n: 4 } }, entao: [{ t: 'apply', eff: { type: 'selado', dur: 2 } }] }], A('todosInimigos', 'milagre'), []);
  ok(!!E.ef(e[0], 'selado') && !E.ef(e[1], 'selado') && !!E.ef(e[2], 'selado'), `por-alvo: sela só quem tem ≥4 (4/2/5 → sela/não/sela) (${e.map(x => !!E.ef(x, 'selado'))})`);
  console.log('  déficit com piso 0 · comparativo debuff>buff · condicional AoE por-alvo (o ramo mira só o alvo casado, não re-expande)');
}

// ------------------------------------------------------------ 33. Leva 2 do HOOK (§127): naoRevive-no-DoT (alimentador) · execução DIFERIDA por limiar · curaPorAlvo · copiar básico de aliado
console.log('== 33. §127: DoT carrega naoRevive (o alimentador que faltava) · execução diferida (pressagio+limiar) · curaPorAlvo · copiar basicoAliado ==');
{
  // (a) naoRevive-no-DoT: o LEITOR (matar l.905) existia; o ALIMENTADOR (aplicarDot) não. Agora um DoT sela naoRevive
  let st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 1110);
  let atk = st.lados[0].units[0], foe = st.lados[1].units[0];
  E.aplicarFx(st, atk, [{ t: 'dot', nome: 'marcaMorte', v: 10, dur: 2, naoRevive: true }], A('inimigo', 'habilidade'), [foe]);
  ok(foe.dots[0] && foe.dots[0].naoRevive === true, `DoT carrega naoRevive (alimentador wireado) (${foe.dots[0] && foe.dots[0].naoRevive})`);
  foe.hp = 8; E.bater(st, atk, foe, 15, 'afetado', 'basico', {});
  ok(!foe.vivo && foe.naoRevive === true, `morto sob o DoT-naoRevive → selado (o leitor da l.905 agora tem quem o alimente) (${foe.naoRevive})`);
  // um DoT comum (sem naoRevive) NÃO sela — regressão
  st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 1111);
  atk = st.lados[0].units[0]; foe = st.lados[1].units[0];
  E.aplicarFx(st, atk, [{ t: 'dot', nome: 'queimadura', v: 8, dur: 2 }], A('inimigo', 'habilidade'), [foe]);
  foe.hp = 8; E.bater(st, atk, foe, 15, 'afetado', 'basico', {});
  ok(!foe.vivo && !foe.naoRevive, `DoT comum não sela naoRevive (${foe.naoRevive})`);

  // (b) execução DIFERIDA por limiar (pressagio): no fimTurno, portador com hp <= execLimiar é executado; senão a marca é inócua
  st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 1112);
  let u = st.lados[0].units[0]; u.hp = 20;   // o portador está no LADO ATIVO (fimTurno processa st.ativo)
  E.aplicarFx(st, st.lados[1].units[0], [{ t: 'apply', eff: { type: 'pressagio', dur: 2, execLimiar: 24 } }], A('inimigo', 'habilidade'), [u]);
  E.fimTurno(st);
  ok(!u.vivo, `hp 20 ≤ 24 + pressagio → executado no fim do turno (vivo ${u.vivo})`);
  st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 1113);
  u = st.lados[0].units[0]; u.hp = 80;
  E.aplicarFx(st, st.lados[1].units[0], [{ t: 'apply', eff: { type: 'pressagio', dur: 2, execLimiar: 24 } }], A('inimigo', 'habilidade'), [u]);
  E.fimTurno(st);
  ok(u.vivo, `hp 80 > 24 → a marca é inócua, sobrevive (vivo ${u.vivo})`);

  // (c) curaPorAlvo: cura fixa por alvo atingido na área (soma v × nº de golpes)
  st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 1114);
  u = st.lados[0].units[0]; u.hp = 50;
  E.aplicarFx(st, u, [{ t: 'dmg', v: 10, escopo: 'todosInimigos', curaPorAlvo: 5 }], A('todosInimigos', 'milagre'), []);
  ok(u.hp === 65, `curaPorAlvo 5 × 3 alvos = +15 (50→65) (${u.hp})`);

  // (d) copiar basicoAliado: executa o Básico do aliado escolhido, pago pelo copiador (Xangô básico = 15)
  st = E.novoEstado(['zeus', 'xango', 'zeus'], ['zeus', 'zeus', 'zeus'], 1115);
  u = st.lados[0].units[0]; const ali = st.lados[0].units[1]; foe = st.lados[1].units[0];
  const h = foe.hp; E.aplicarFx(st, u, [{ t: 'copiar', fonte: 'basicoAliado' }], A('aliado', 'habilidade'), [ali]);
  ok(h - foe.hp === 15, `copiar basicoAliado: o Machado Oxê (15) do Xangô cai no 1º inimigo (${h - foe.hp})`);
  console.log('  DoT-naoRevive (alimentador) · execução diferida por limiar · curaPorAlvo · copiar básico de aliado escolhido');
}

// ------------------------------------------------------------ 34. B1 (§130): evadeContra (evade 1º único + contra) · dominar em MASSA
console.log('== 34. §130: evadeContra (Saci — 1º golpe único falha + revida) · dominar MASSA (Dionísio — todos os inimigos batem num aliado) ==');
{
  // (a) evadeContra: o 1º golpe ÚNICO por turno falha e revida v; o 2º passa; a ÁREA não consome a proteção
  let st = E.novoEstado(['saci', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 1120);
  let sa = st.lados[0].units[0], atk = st.lados[1].units[0];
  let hs = sa.hp, ha = atk.hp; E.bater(st, atk, sa, 20, 'afetado', 'basico', { unico: true });
  ok(hs - sa.hp === 0 && ha - atk.hp === 10, `1º golpe único: falha (0) + contra 10 no atacante (sofreu ${hs - sa.hp}, contra ${ha - atk.hp})`);
  hs = sa.hp; E.bater(st, atk, sa, 20, 'afetado', 'basico', { unico: true });
  ok(hs - sa.hp === 20, `2º golpe único do turno: passa (${hs - sa.hp})`);
  st = E.novoEstado(['saci', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 1121);
  sa = st.lados[0].units[0]; atk = st.lados[1].units[0]; hs = sa.hp;
  E.bater(st, atk, sa, 20, 'afetado', 'basico', {});   // AoE (unico=false)
  ok(hs - sa.hp === 20, `golpe de ÁREA não é evadido nem consome a proteção (${hs - sa.hp})`);

  // (b) dominar MASSA: cada inimigo vira vítima e bate no 1º aliado vivo ≠ ele (determinístico); sem alvo escolhido
  st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 1122);
  const u = st.lados[0].units[0], e = st.lados[1].units; const hp0 = e.map(x => x.hp);
  E.aplicarFx(st, u, [{ t: 'dominar', massa: true, dur: 1 }], A('nenhum', 'milagre'), []);
  ok(e.every(x => !!E.ef(x, 'dominado')), `massa: todos os inimigos dominados (${e.map(x => !!E.ef(x, 'dominado'))})`);
  ok(e.some((x, i) => hp0[i] - x.hp > 0), `massa: fogo amigo aconteceu (dano ${e.map((x, i) => hp0[i] - x.hp)})`);
  console.log('  evade 1º único + contra (área não consome) · dominar em massa (fogo amigo determinístico, sem escolha)');
}

// ------------------------------------------------------------ 35. B2 (§131): realoca (M5, um mecanismo/dois usos) · evadeControle · stripOne rouba
console.log('== 35. §131: realoca buff(inimigos→self) + debuff(time→inimigos) · evadeControle (1ª tentativa falha) · stripOne rouba ==');
{
  // (a) realoca — MOVE todos os efeitos da categoria. Mesma primitiva, dois usos por parâmetro
  let st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 1130);
  let u = st.lados[0].units[0], ali = st.lados[0].units[1], e = st.lados[1].units;
  e[0].efeitos.push({ type: 'dmgUp', v: 8, dur: 3 }); e[1].efeitos.push({ type: 'regen', v: 5, dur: 3 });
  E.aplicarFx(st, u, [{ t: 'realoca', categoria: 'buff', de: 'inimigos', para: 'self' }], A('nenhum', 'milagre'), []);
  ok(u.efeitos.some(x => x.type === 'dmgUp') && u.efeitos.some(x => x.type === 'regen') && !e[0].efeitos.some(x => x.type === 'dmgUp'), `realoca buff inimigos→self: Loki ganha, inimigos perdem (${u.efeitos.map(x => x.type)})`);
  ali.efeitos.push({ type: 'dmgDown', v: 5, dur: 3 }); ali.dots.push({ nome: 'veneno', v: 6, dur: 2 });
  E.aplicarFx(st, u, [{ t: 'realoca', categoria: 'debuff', de: 'time', para: 'inimigos' }], A('nenhum', 'milagre'), []);
  ok(!ali.efeitos.some(x => x.type === 'dmgDown') && ali.dots.length === 0 && e.every(x => x.efeitos.some(y => y.type === 'dmgDown') && x.dots.some(d => d.nome === 'veneno')), `realoca debuff time→inimigos: time limpo, inimigos recebem (incl. DoT)`);

  // (b) evadeControle (Loki): a 1ª tentativa de controle por turno falha; a 2ª aplica; refletido não conta
  st = E.novoEstado(['loki', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 1131);
  const lo = st.lados[0].units[0], atk = st.lados[1].units[0];
  E.aplicarFx(st, atk, [{ t: 'apply', eff: { type: 'atordoado', dur: 2 } }], A('inimigo', 'habilidade'), [lo]);
  ok(!E.ef(lo, 'atordoado'), `1ª tentativa de controle FALHA (${!!E.ef(lo, 'atordoado')})`);
  E.aplicarFx(st, atk, [{ t: 'apply', eff: { type: 'atordoado', dur: 2 } }], A('inimigo', 'habilidade'), [lo]);
  ok(!!E.ef(lo, 'atordoado'), `2ª tentativa aplica (proteção do turno já usada) (${!!E.ef(lo, 'atordoado')})`);

  // (c) stripOne rouba: o buff removido vai p/ o lançador (roubo de UM, ≠ realoca de todos)
  st = E.novoEstado(['zeus', 'zeus', 'zeus'], ['zeus', 'zeus', 'zeus'], 1132);
  u = st.lados[0].units[0]; const foe = st.lados[1].units[0]; foe.efeitos.push({ type: 'dmgUp', v: 7, dur: 5 });
  E.aplicarFx(st, u, [{ t: 'stripOne', rouba: true }], A('inimigo', 'habilidade'), [foe]);
  ok(!E.ef(foe, 'dmgUp') && !!E.ef(u, 'dmgUp'), `stripOne rouba: o buff sai do inimigo e entra no lançador (foe ${!!E.ef(foe, 'dmgUp')}, u ${!!E.ef(u, 'dmgUp')})`);
  console.log('  realoca (um mecanismo, dois usos) · evadeControle (1ª falha) · stripOne rouba (roubo de 1, distinto do realoca de todos)');
}

console.log('');
console.log(f === 0 ? '>>> PRIMITIVAS OK' : `>>> ${f} FALHA(S)`);
process.exit(f ? 1 : 0);
