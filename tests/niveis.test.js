// tests/niveis.test.js — §318 NÍVEIS DE HABILIDADE POR CÓPIAS (FASE 0: fundação, SEM conteúdo).
// Prova, sem depender de olho, a FUNDAÇÃO técnica: a função-de-um-ponto-só kitEfetivo, o portão de
// build validarNiveisDeus, a lente texto×número, a projeção de níveis por conta e — o coração —
// as SETE babás, cada uma provada a MORDER (dado válido passa, dado inválido quebra).
const path = require('path');
const E = require('../src/engine.js');
Object.assign(global, E);   // o motor lê funções do escopo global (hábito de concatenação do browser)
const catalogo = require('../src/catalogo.js').GODS;
const contas = require('../server/contas.js');

let falhas = 0;
const ok = (c, m) => { if (!c) { console.log('  FALHA: ' + m); falhas++; } };
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const clone = x => JSON.parse(JSON.stringify(x));

// dado SINTÉTICO válido: zeus com uma escada legítima no básico (pequeno×2 + salto no nv4).
function zeusComEscada() {
  const z = clone(catalogo.zeus);
  z.ab[0].niveis = [
    { nv: 2, muda: [{ caminho: 'fx[0].v', de: 15, para: 17 }], desc: '17 de dano a 1 inimigo.' },
    { nv: 3, muda: [{ caminho: 'fx[0].v', de: 17, para: 19 }], desc: '19 de dano a 1 inimigo.' },
    { nv: 4, muda: [{ caminho: 'cd', de: 0, para: 0 }], desc: '19 de dano a 1 inimigo.' },
  ];
  return z;
}

console.log('§318 — NÍVEIS DE HABILIDADE (FASE 0)');

// ---------------------------------------------------------------- kitEfetivo (unidade) ----
(() => {
  const z = zeusComEscada();
  ok(E.kitEfetivo(z, { basico: 2 }).ab[0].fx[0].v === 17, 'kitEfetivo nv2: dano 15→17');
  ok(E.kitEfetivo(z, { basico: 2 }).ab[0].desc === '17 de dano a 1 inimigo.', 'kitEfetivo nv2: desc = texto do nível');
  ok(E.kitEfetivo(z, { basico: 3 }).ab[0].fx[0].v === 19, 'kitEfetivo nv3 CUMULATIVO: 15→17→19');
  ok(E.kitEfetivo(z, { basico: 4 }).ab[0].fx[0].v === 19, 'kitEfetivo nv4: mantém 19 (salto no cd)');
  // clamp: nível fora de 1–4 não estoura (defensivo — o portão da conta é quem recusa)
  ok(E.kitEfetivo(z, { basico: 9 }).ab[0].fx[0].v === 19, 'kitEfetivo clamp nv>4 → teto 4');
  // salto: efeito NOVO empurrado em fx[]
  const z2 = clone(catalogo.zeus);
  z2.ab[0].niveis = [{ nv: 4, muda: [{ caminho: 'fx[]', de: null, para: { t: 'apply', eff: { type: 'vulneravel', v: 5, dur: 1 } } }], desc: '15 de dano a 1 inimigo; ele fica vulnerável 1 turno (+5).' }];
  const ef = E.kitEfetivo(z2, { basico: 4 });
  ok(ef.ab[0].fx.length === catalogo.zeus.ab[0].fx.length + 1, 'kitEfetivo salto fx[]: efeito novo empurrado');
})();

// ---------------------------------------------------------------- catalogoEfetivo (identidade) ----
(() => {
  ok(E.catalogoEfetivo(catalogo, null) === catalogo, 'catalogoEfetivo(null) = catálogo base (identidade)');
  ok(E.catalogoEfetivo(catalogo, { zeus: { basico: 1 } }) === catalogo, 'catalogoEfetivo tudo-nv1 = base (identidade, mesmo hash)');
  const cat = clone(catalogo); cat.zeus.ab[0].niveis = [{ nv: 2, muda: [{ caminho: 'fx[0].v', de: 15, para: 20 }], desc: '20 de dano a 1 inimigo.' }];
  const out = E.catalogoEfetivo(cat, { zeus: { basico: 2 } });
  ok(out !== cat, 'catalogoEfetivo com nível>1 devolve catálogo NOVO');
  ok(out.zeus.ab[0].fx[0].v === 20, 'catalogoEfetivo: zeus efetivo 20');
  ok(out.ares === cat.ares, 'catalogoEfetivo: deus sem nível MANTÉM a referência base (sem clone)');
})();

// ================================================================ AS SETE BABÁS ============

// BABÁ 1 — REGRESSÃO ZERO. Deus com niveis ausente OU tudo-1 → kitEfetivo DEEP-EQUAL ao base.
// E o motor: novoEstado sem níveis (ou tudo-1) tem catId ESCALAR idêntico → partida byte a byte igual.
(() => {
  const bite = clone(catalogo.zeus);
  bite.ab[0].fx[0].v = 999;   // mexer no kit MUDA o efetivo — a babá morde
  ok(eq(E.kitEfetivo(catalogo.zeus, null), catalogo.zeus), 'B1 regressão: niveis null → deep-equal ao base');
  ok(eq(E.kitEfetivo(catalogo.zeus, {}), catalogo.zeus), 'B1 regressão: niveis {} → deep-equal');
  ok(eq(E.kitEfetivo(catalogo.zeus, { basico: 1, habilidade: 1, milagre: 1 }), catalogo.zeus), 'B1 regressão: tudo-nv1 → deep-equal');
  ok(!eq(E.kitEfetivo(bite, null), catalogo.zeus), 'B1 MORDE: kit alterado ≠ base (a igualdade é de verdade)');
  const time = ['zeus', 'ogum', 'tyr'], inim = ['ares', 'atena', 'apolo'];
  const s0 = E.novoEstado(time, inim, 7);
  const sNull = E.novoEstado(time, inim, 7, 0, null, catalogo, null);
  const nv1 = { zeus: { basico: 1, habilidade: 1, milagre: 1 } };
  const sAll1 = E.novoEstado(time, inim, 7, 0, null, catalogo, [nv1, nv1]);
  ok(typeof s0.catId === 'string', 'B1 motor: catId ESCALAR sem níveis');
  ok(s0.catId === sNull.catId && s0.catId === sAll1.catId, 'B1 motor: mesmo catId (regressão byte a byte)');
})();

// BABÁ 2 — a PASSIVA nunca tem niveis. O validador MORDE; e nenhum deus publicado tem passiva.niveis.
(() => {
  const bad = clone(catalogo.zeus); bad.passiva.niveis = [{ nv: 2, muda: [], desc: '' }];
  ok(E.validarNiveisDeus(bad).some(e => /passiva/i.test(e)), 'B2 MORDE: passiva com niveis quebra');
  ok(E.validarNiveisDeus(catalogo.zeus).length === 0, 'B2 passa: zeus base sem erros');
  let comPassivaNivel = 0;
  for (const k in catalogo) if (catalogo[k].passiva && catalogo[k].passiva.niveis !== undefined) comPassivaNivel++;
  ok(comPassivaNivel === 0, 'B2 dado: nenhum dos deuses publicados tem passiva.niveis');
})();

// BABÁ 3 — caminho FORA da whitelist → quebra.
(() => {
  const bad = clone(catalogo.zeus); bad.ab[0].niveis = [{ nv: 2, muda: [{ caminho: 'hp', de: 1, para: 2 }], desc: '' }];
  ok(E.validarNiveisDeus(bad).some(e => /whitelist/i.test(e)), 'B3 MORDE: caminho "hp" fora da whitelist');
  const badFx = clone(catalogo.zeus); badFx.ab[0].niveis = [{ nv: 2, muda: [{ caminho: 'fx[0].t', de: 'dmg', para: 'heal' }], desc: '' }];
  ok(E.validarNiveisDeus(badFx).some(e => /whitelist/i.test(e)), 'B3 MORDE: caminho "fx[0].t" (tipo) fora da whitelist');
  const good = zeusComEscada();
  ok(E.validarNiveisDeus(good).length === 0, 'B3 passa: escada legítima (fx[i].v pequeno, cd salto)');
})();

// BABÁ 4 — SALTO fora do nv4, OU mais de 1 salto por habilidade → quebra.
(() => {
  const saltoCedo = clone(catalogo.zeus); saltoCedo.ab[0].niveis = [{ nv: 2, muda: [{ caminho: 'cd', de: 0, para: 1 }], desc: '' }];
  ok(E.validarNiveisDeus(saltoCedo).some(e => /SALTO.*nv4/i.test(e)), 'B4 MORDE: salto (cd) no nv2');
  const doisSaltos = clone(catalogo.zeus); doisSaltos.ab[0].niveis = [{ nv: 4, muda: [{ caminho: 'cd', de: 0, para: 1 }, { caminho: 'cost.Tempestade', de: 1, para: 0 }], desc: '' }];
  ok(E.validarNiveisDeus(doisSaltos).some(e => /máx 1|saltos/i.test(e)), 'B4 MORDE: 2 saltos na mesma habilidade');
  const umSalto = clone(catalogo.zeus); umSalto.ab[0].niveis = [{ nv: 4, muda: [{ caminho: 'cd', de: 0, para: 1 }], desc: '' }];
  ok(E.validarNiveisDeus(umSalto).length === 0, 'B4 passa: 1 salto (cd) no nv4');
})();

// BABÁ 5 — "de" ≠ valor atual (cumulativo) → quebra, NOMEANDO deus/habilidade/nível.
(() => {
  const badDe = clone(catalogo.zeus); badDe.ab[0].niveis = [{ nv: 2, muda: [{ caminho: 'fx[0].v', de: 99, para: 17 }], desc: '17 de dano a 1 inimigo.' }];
  const errs = E.validarNiveisDeus(badDe);
  ok(errs.some(e => /Zeus/.test(e) && /basico/.test(e) && /nv2/.test(e) && /de/.test(e)), 'B5 MORDE: de≠atual nomeia Zeus.basico nv2');
  // cumulativo: nv3 com `de` do valor BASE (15) em vez do pós-nv2 (17) → quebra
  const badCumul = clone(catalogo.zeus); badCumul.ab[0].niveis = [
    { nv: 2, muda: [{ caminho: 'fx[0].v', de: 15, para: 17 }], desc: '17 de dano a 1 inimigo.' },
    { nv: 3, muda: [{ caminho: 'fx[0].v', de: 15, para: 19 }], desc: '19 de dano a 1 inimigo.' },
  ];
  ok(E.validarNiveisDeus(badCumul).some(e => /nv3/.test(e)), 'B5 MORDE cumulativo: nv3 com de=15 (devia ser 17)');
  ok(E.validarNiveisDeus(zeusComEscada()).length === 0, 'B5 passa: de cumulativos corretos (15→17→19)');
})();

// BABÁ 6 — TEXTO×NÚMERO. Todo número do desc do nível existe entre os valores efetivos; todo valor
// que o nível mudou aparece no desc. Vale também para o BASE (relatado, não consertado).
(() => {
  const mente = clone(catalogo.zeus); mente.ab[0].niveis = [{ nv: 2, muda: [{ caminho: 'fx[0].v', de: 15, para: 19 }], desc: '17 de dano a 1 inimigo.' }];
  const div = E.conferirTextoNiveis(mente);
  ok(div.some(d => d.nivel === 2 && d.tipo === 'texto>valor'), 'B6 MORDE: texto diz 17 mas efetivo é 19');
  ok(div.some(d => d.nivel === 2 && d.tipo === 'valor>texto'), 'B6 MORDE: nível muda p/ 19 mas o texto não cita 19');
  const honesto = clone(catalogo.zeus); honesto.ab[0].niveis = [{ nv: 2, muda: [{ caminho: 'fx[0].v', de: 15, para: 17 }], desc: '17 de dano a 1 inimigo.' }];
  ok(E.conferirTextoNiveis(honesto).filter(d => d.nivel === 2 && d.tipo === 'valor>texto').length === 0, 'B6 passa: o número mudado aparece no texto do nível');
  // a direção PRECISA (valor>texto) é a que o build trava: MORDE quando o número mudado some do texto.
  ok(E.conferirTextoNiveis(mente).some(d => d.nivel === 2 && d.tipo === 'valor>texto'), 'B6 direção precisa: valor mudado ausente do texto (o que o build trava)');
  // RELATÓRIO sobre o BASE. O guarda FINO é o §286 (checar_cadeia) — a fonte de verdade do texto×número.
  const cadeia = require('../tools/checar_cadeia.js');
  ok(cadeia.divergencias.length === 0, 'B6 base: §286/checar_cadeia sem divergências (guarda fino, build verde)');
  // a lente COARSE do §318 (texto>valor) sobre o base: over-conta por frases estruturais (alvo/duração/DoT) — só relato.
  let coarse = 0; for (const k in catalogo) coarse += E.conferirTextoNiveis(catalogo[k]).filter(d => d.nivel === 1 && d.tipo === 'texto>valor').length;
  console.log(`  B6 base texto×número: §286 fino = ${cadeia.divergencias.length} divergência(s); lente coarse §318 = ${coarse} (artefatos de frase estrutural — não trava a build)`);
})();

// BABÁ 7 — nível fora de 1–4 na CONTA → recusado pelo servidor.
(() => {
  contas._resetParaTeste();
  const r = contas.criar({ faixaIdade: 'maior' });
  const tok = r.conta.token;
  contas._darDeus(tok, 'zeus');
  ok(contas.definirNivel(tok, 'zeus', 'basico', 5).ok === false, 'B7 MORDE: nível 5 recusado');
  ok(contas.definirNivel(tok, 'zeus', 'basico', 0).ok === false, 'B7 MORDE: nível 0 recusado');
  ok(contas.definirNivel(tok, 'zeus', 'passiva', 2).ok === false, 'B7 MORDE: slot passiva recusado');
  ok(contas.definirNivel(tok, 'ares', 'basico', 2).ok === false, 'B7 MORDE: deus não possuído recusado');
  ok(contas.definirNivel(tok, 'zeus', 'basico', 3).ok === true, 'B7 passa: nível 3 aceito');
  ok(contas.niveisDoTime(tok, ['zeus'])['zeus'].basico === 3, 'B7 conta: niveisDoTime reflete o nível gravado');
  ok(contas.niveisDoTime(tok, ['zeus'])['zeus'].habilidade === 1, 'B7 conta: slots não tocados ficam em 1 (default)');
  contas._resetParaTeste();
})();

// ---------------------------------------------------------------- PvP autoritativo (per-side) ----
(() => {
  const cat = clone(catalogo); cat.zeus.ab[0].niveis = [{ nv: 2, muda: [{ caminho: 'fx[0].v', de: 15, para: 20 }], desc: '20 de dano a 1 inimigo.' }];
  const niveis = [{ zeus: { basico: 2 } }, { zeus: { basico: 1 } }];
  const st = E.novoEstado(['zeus', 'ogum', 'tyr'], ['zeus', 'ares', 'atena'], 3, 0, null, cat, niveis);
  ok(Array.isArray(st.catId), 'PvP: catId é PAR quando os lados divergem');
  const zA = st.lados[0].units[0], zB = st.lados[1].units[0];
  st.lados[0].orbs.Tempestade = 5; st.lados[1].orbs.Tempestade = 5;
  const hpB = zB.hp; E.agir(st, zA.uid, 'basico', [zB.uid]);
  ok(hpB - zB.hp === 20, 'PvP: zeus do lado 0 (nv2) causa 20');
  E.fimTurno(st); st.lados[1].orbs.Tempestade = 5;
  const hpA = zA.hp; E.agir(st, zB.uid, 'basico', [zA.uid]);
  ok(hpA - zA.hp === 15, 'PvP: zeus do lado 1 (nv1) causa 15 — kits efetivos por lado');
})();

console.log('');
console.log(falhas === 0 ? '>>> NÍVEIS OK' : `>>> ${falhas} FALHA(S)`);
process.exit(falhas ? 1 : 0);
