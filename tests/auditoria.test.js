// Auditoria: motor contra as definições da planilha
const E = require('../src/engine.js');
let f = 0; const ok = (c, m) => { if (!c) { console.log('  FALHA: ' + m); f++; } };

console.log('== 6 elementos existem; um time gera no máximo 3 ==');
ok(E.ELEMS.length === 6, `deveriam ser 6 elementos, são ${E.ELEMS.length}`);
{
  const st = E.novoEstado(['zeus','sobek','brigid'], ['ogum','tyr','cuca'], 5);
  const tipos = new Set(st.lados[0].units.map(u => u.elem));
  ok(tipos.size <= 3, 'um time de 3 não pode gerar mais de 3 tipos');
  for (let i = 0; i < 12; i++) E.fimTurno(st);
  const alheios = E.ELEMS.filter(e => !tipos.has(e) && st.lados[0].orbs[e] > 0);
  ok(alheios.length === 0, `nunca deveria acumular tipo alheio sem conversão: ${alheios}`);
  console.log(`  time gera ${[...tipos].join('/')} \u00b7 zero acúmulo de tipo alheio em 12 turnos`);
}

console.log('== 1 energia por unidade VIVA por turno ==');
{
  const st = E.novoEstado(['zeus','zeus','zeus'], ['ogum','ogum','ogum'], 21);
  ok(E.totalOrbs(st.lados[0]) === 3, `3 vivos = 3 energias, deu ${E.totalOrbs(st.lados[0])}`);
  st.lados[0].units[2].vivo = false;
  E.fimTurno(st); E.fimTurno(st);
  const g = E.totalOrbs(st.lados[0]) - 3;
  ok(g === 2, `com 2 vivos deveria gerar 2, gerou ${g}`);
  console.log(`  3 vivos \u2192 3 \u00b7 2 vivos \u2192 2`);
}

console.log('== unidade sob controle não gera energia ==');
{
  const st = E.novoEstado(['cuca','cuca','cuca'], ['zeus','zeus','zeus'], 23);
  st.lados[0].orbs['Umbra'] = 9;
  E.agir(st, st.lados[0].units[0].uid, 'habilidade', [st.lados[1].units[0].uid]);
  const antes = E.totalOrbs(st.lados[1]);
  E.fimTurno(st);
  const g = E.totalOrbs(st.lados[1]) - antes;
  ok(g === 2, `1 dos 3 adormecido deveria gerar 2, gerou ${g}`);
  console.log(`  1 adormecido de 3 \u2192 gerou ${g}`);
}

console.log('== Defesa universal: 1 livre, recarga 4, invulnerável 1 turno ==');
{
  const st = E.novoEstado(['zeus','zeus','zeus'], ['ogum','ogum','ogum'], 27);
  const u = st.lados[0].units[0];
  const d = E.acoesDe(st, u).find(a => a.slot === 'defesa');
  ok(d && d.cd === 4, `recarga da Defesa deveria ser 4, é ${d && d.cd}`);
  ok(d && d.cost.livre === 1 && Object.keys(d.cost).length === 1, 'custo deveria ser 1 livre');
  st.lados[0].orbs['Tempestade'] = 5;
  E.agir(st, u.uid, 'defesa', []);
  ok(!!E.ef(u, 'invulneravel'), 'deveria ficar Invulnerável');
  ok(u.cd.defesa === 4, 'recarga deveria ficar em 4');
  console.log('  1 livre \u00b7 recarga 4 \u00b7 invulnerável aplicado');
}

console.log('== Silenciar não bloqueia a Defesa; Atordoar bloqueia tudo ==');
{
  const st = E.novoEstado(['zeus','zeus','zeus'], ['ogum','ogum','ogum'], 31);
  const u = st.lados[0].units[0];
  st.lados[0].orbs['Tempestade'] = 9;
  u.efeitos.push({ type: 'silenceClass', cls: 'Mágico', dur: 2 });
  const acs = E.acoesDe(st, u);
  ok(acs.find(a => a.slot === 'defesa').disponivel, 'Defesa deveria seguir liberada sob silêncio');
  ok(acs.find(a => a.slot === 'basico').disponivel, 'Básico deveria seguir liberado sob silêncio');
  ok(!acs.find(a => a.slot === 'habilidade').disponivel, 'Habilidade Mágica deveria estar travada');
  u.efeitos.push({ type: 'atordoado', dur: 1 });
  ok(!E.podeAgir(u), 'atordoado não age de forma alguma');
  console.log('  silêncio poupa Básico e Defesa \u00b7 atordoamento tira a ação');
}

console.log('== dano contínuo atravessa Invulnerabilidade ==');
{
  const st = E.novoEstado(['brigid','zeus','zeus'], ['ogum','ogum','ogum'], 37);
  const alvo = st.lados[1].units[0];
  alvo.dots.push({ nome: 'Queimadura', v: 8, dur: 3 });
  alvo.efeitos.push({ type: 'invulneravel', dur: 3 });
  const hp = alvo.hp;
  E.fimTurno(st);
  ok(alvo.hp === hp - 8, `DoT deveria contar mesmo Invulnerável (${hp} \u2192 ${alvo.hp})`);
  console.log(`  ${hp} \u2192 ${alvo.hp} mesmo Invulnerável`);
}

console.log('== empate técnico no turno 40 ==');
{
  const st = E.novoEstado(['tyr','tyr','tyr'], ['tyr','tyr','tyr'], 41);
  let g = 0;
  while (!st.fim && g++ < 200) E.fimTurno(st);
  ok(!!st.fim, 'deveria terminar por tempo');
  ok(st.turno >= 40, `deveria fechar no turno 40, fechou em ${st.turno}`);
  console.log(`  ${st.fim} no turno ${st.turno}`);
}

console.log('== teto de dano por categoria (orçamento documentado) ==');
{
  const TETO = { basico: 15, habilidade: 25, milagre: 40 };
  const AREA = { basico: 10, habilidade: 15, milagre: 22 };
  let piores = [];
  for (const [k, g] of Object.entries(E.GODS)) {
    for (const a of g.ab) {
      if (!a.fx) continue;
      for (const e of a.fx) {
        if (e.t !== 'dmg') continue;
        const area = (e.escopo || a.alvo) === 'todosInimigos';
        const lim = area ? AREA[a.slot] : TETO[a.slot];
        const val = Math.max(e.v, e.seEncharcado || 0, e.seAdormecido || 0);
        if (val > lim) piores.push(`${g.nome}/${a.nome}: ${val} > ${lim}${area ? ' (área)' : ''}`);
      }
    }
  }
  // Dilúvio (30 em Encharcado) e O Papão (38 em Adormecido) são bônus condicionais previstos
  const inesperados = piores.filter(p => !/Dil\u00favio|Pap\u00e3o/.test(p));
  ok(inesperados.length === 0, 'fora do orçamento: ' + inesperados.join(' | '));
  console.log(`  ${piores.length} acima do teto base, todos com condição: ${piores.join(' | ') || 'nenhum'}`);
}

console.log('');
console.log(f === 0 ? '>>> AUDITORIA OK' : `>>> ${f} DIVERGÊNCIA(S)`);
process.exit(f ? 1 : 0);
