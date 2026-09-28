// tests/economia.test.js — §318 FASE 2: a ECONOMIA é do SERVIDOR. As babás crescem por etapa.
// ETAPA 1 — o buraco fechado: salvarPerfil aceita só campos LOCAIS; moedas e a POSSE de deuses (ownership
// + copias) ficam as do servidor. Um cliente que forja gemas/deuses/copias não muda NADA na conta.
const contas = require('../server/contas.js');

let falhas = 0;
const ok = (c, m) => { if (!c) { console.log('  FALHA: ' + m); falhas++; } };
const clone = x => JSON.parse(JSON.stringify(x));

console.log('§318 FASE 2 — ECONOMIA AUTORITATIVA');
console.log('== ETAPA 1: salvarPerfil ignora economia forjada pelo cliente ==');
(() => {
  contas._resetParaTeste();
  const r = contas.criar({ faixaIdade: 'maior' });   // grant inicial (gema) + deuses iniciais
  const tok = r.conta.token, id = r.conta.id;
  const antes = clone(contas.porToken(tok).perfil);
  const gema0 = antes.moedas.gema, ess0 = antes.moedas.essencia;
  const umDeus = Object.keys(antes.deuses)[0];
  const copias0 = antes.deuses[umDeus].copias;
  ok(gema0 > 0, 'grant inicial de gema > 0 (pré-condição)');

  // o CLIENTE forja: +99999 gema, +essência, um deus NOVO, copias:50 num deus possuído
  const forjado = clone(antes);
  forjado.moedas.gema += 99999;
  forjado.moedas.essencia = (forjado.moedas.essencia || 0) + 5000;
  forjado.deuses['__deus_forjado__'] = { copias: 3, favorito: false, obtidoEm: 0 };
  forjado.deuses[umDeus].copias = 50;
  const s = contas.salvarPerfil(tok, forjado);
  ok(s.ok, 'salvarPerfil ok');

  const dep = contas.porToken(tok).perfil;
  ok(dep.moedas.gema === gema0, `gema NÃO muda (${dep.moedas.gema} === ${gema0})`);
  ok(dep.moedas.essencia === ess0, 'essência NÃO muda');
  ok(!dep.deuses['__deus_forjado__'], 'deus forjado IGNORADO (posse não se forja)');
  ok(dep.deuses[umDeus].copias === copias0, `copias NÃO mudam (${dep.deuses[umDeus].copias} === ${copias0})`);

  // a preferência `favorito` (local) SOBREVIVE, sem tocar posse/copias
  const pref = clone(contas.porToken(tok).perfil);
  pref.deuses[umDeus].favorito = true;
  pref.deuses[umDeus].copias = 999;   // tenta forjar junto
  contas.salvarPerfil(tok, pref);
  const dep2 = contas.porToken(tok).perfil;
  ok(dep2.deuses[umDeus].favorito === true, 'favorito (preferência) PERSISTE');
  ok(dep2.deuses[umDeus].copias === copias0, 'favorito persiste MAS copias continuam do servidor');

  // campos LOCAIS (times, maestria) passam
  const loc = clone(contas.porToken(tok).perfil);
  loc.times = [['zeus', 'ogum', 'tyr']];
  loc.maestria = { zeus: { vitorias: 7, milagre: 2 } };
  contas.salvarPerfil(tok, loc);
  const dep3 = contas.porToken(tok).perfil;
  ok(JSON.stringify(dep3.times) === JSON.stringify([['zeus', 'ogum', 'tyr']]), 'times (loadout local) PERSISTE');
  ok(dep3.maestria.zeus && dep3.maestria.zeus.vitorias === 7, 'maestria (cosmética local) PERSISTE');
  contas._resetParaTeste();
})();

console.log('');
console.log(falhas === 0 ? '>>> ECONOMIA OK' : `>>> ${falhas} FALHA(S)`);
process.exit(falhas ? 1 : 0);
