// ===================================================================
// §368 — PROVAS do modelo de RESERVAS + CURA fração (engine puro) + migração v7→v8.
//   • o reserva entra na vaga do titular caído no nível seguinte;
//   • a corrida só acaba quando os 5 estão caídos (derrota com reserva vivo = retoma);
//   • a cura entre níveis aplica a FRAÇÃO da vida máxima;
//   • o REVIVER escolhe entre os caídos (qualquer dos 5);
//   • a migração v7→v8 encerra a corrida do formato antigo (3 deuses, sem campo).
// ===================================================================
'use strict';
const path = require('path');
const E = require(path.join(__dirname, '..', 'src', 'engine.js'));
Object.assign(global, E);
const D = require(path.join(__dirname, '..', 'src', 'dominios.js'));
const P = require(path.join(__dirname, '..', 'src', 'perfil.js'));
const GODS = E.GODS;

let falhas = 0, n = 0;
function ok(c, m) { n++; if (c) console.log('  ✓ ' + m); else { falhas++; console.log('  ✗ FALHA: ' + m); } }

// escada sintética: 40 níveis, cura FRAÇÃO 0.25, inimigos fáceis fixos
const inimigos = ['atena', 'hera', 'dionisio'];
const niveis = []; for (let i = 1; i <= 40; i++) niveis.push({ n: i, chefe: i % 10 === 0, inimigos, danoMult: 1, dificuldade: i / 40 });
const escada = { cultura: 'Grega', trio: ['zeus', 'poseidon', 'atena'], curaPorNivel: 0.25, tetoBonusDano: 0.5, faixa: 10, niveis };
const time5 = ['zeus', 'ogum', 'tyr', 'sobek', 'brigid'];   // 3 titulares + 2 reservas

console.log('== §368 (1) montagem: 5 deuses, campo nos 3 titulares ==');
{
  const run = D.domNovaCorrida(escada, 0, '', 0, time5);
  ok(run.time.length === 5, 'o time tem 5 deuses (3 titulares + 2 reservas)');
  ok(JSON.stringify(run.campo) === '[0,1,2]', 'o campo começa nos 3 titulares [0,1,2]');
  ok(run.vida.length === 5 && run.vida.every(v => v.vivo), 'os 5 começam vivos');
}

console.log('\n== §368 (2) o RESERVA entra na vaga do titular caído no nível seguinte ==');
{
  const run = D.domNovaCorrida(escada, 0, '', 0, time5);
  // titular da vaga 0 (zeus) cai; vence o nível → ao avançar, o 1º reserva vivo (sobek, idx3) assume a vaga 0
  run.vida[0] = { hp: 0, vivo: false };
  const completou = D.domAvancar(run, escada);
  ok(!completou && run.nivel === 2, 'avançou para o nível 2');
  ok(run.campo[0] === 3, 'a vaga 0 (titular caído) agora é do 1º reserva vivo (idx 3 = sobek)');
  ok(D.domCampoKeys(run, escada).join(',') === 'sobek,ogum,tyr', 'o campo mostra sobek,ogum,tyr');
  // a ORDEM se mantém: se a vaga 1 também abrir, entra o PRÓXIMO reserva (brigid, idx4)
  run.vida[1] = { hp: 0, vivo: false };
  D.domAvancar(run, escada);
  ok(run.campo[1] === 4, 'a 2ª vaga aberta recebe o 2º reserva (idx 4 = brigid), mantendo a ordem');
}

console.log('\n== §368 (3) a corrida só ACABA quando os 5 estão caídos (derrota com reserva vivo = retoma) ==');
{
  const run = D.domNovaCorrida(escada, 0, '', 0, time5);
  // derrota do CAMPO (3 titulares caem), mas 2 reservas vivos → retoma (status segue ativo)
  run.campo = [0, 1, 2];
  const stPerde = { fim: { resultado: 'vitoria', lado: 1 }, lados: [{ units: [{ hp: 0, vivo: false }, { hp: 0, vivo: false }, { hp: 0, vivo: false }] }], log: [] };
  const r1 = D.domResolverBatalha(run, escada, stPerde);
  ok(r1.retomar && !r1.morreu && run.status === 'ativo', 'derrota com reservas vivos: RETOMA (corrida segue ativa)');
  ok(run.vida.some(v => v.vivo), 'ainda há deus vivo (os 2 reservas)');
  ok(run.campo.some(i => run.vida[i].vivo), 'um reserva assumiu uma vaga (campo com deus vivo)');
  // agora derrota de novo com TODOS os demais caídos → morto
  run.vida = run.vida.map(() => ({ hp: 0, vivo: false }));
  const stPerde2 = { fim: { resultado: 'vitoria', lado: 1 }, lados: [{ units: run.campo.map(() => ({ hp: 0, vivo: false })) }], log: [] };
  const r2 = D.domResolverBatalha(run, escada, stPerde2);
  ok(r2.morreu && run.status === 'morto', 'com os 5 caídos: a corrida ACABA (morto)');
}

console.log('\n== §368 (4) a cura entre níveis aplica a FRAÇÃO da vida máxima ==');
{
  const run = D.domNovaCorrida(escada, 0, '', 0, time5);
  const mxZeus = (GODS.zeus.hp || 120);
  run.vida = run.vida.map((v, i) => i === 0 ? { hp: 40, vivo: true } : v);
  D.domCurarParcial(run, escada);
  const esperado = Math.min(mxZeus, 40 + Math.round(mxZeus * 0.25));
  ok(run.vida[0].hp === esperado, `cura 25%: zeus 40 → ${run.vida[0].hp} (= min(${mxZeus}, 40 + round(${mxZeus}*0.25)) = ${esperado})`);
  // vivo a cheio não passa do máximo
  run.vida[1] = { hp: (GODS.ogum.hp || 120), vivo: true };
  D.domCurarParcial(run, escada);
  ok(run.vida[1].hp === (GODS.ogum.hp || 120), 'a cura não passa do máximo');
}

console.log('\n== §368 (5) REVIVER escolhe QUALQUER caído dos 5 ==');
{
  const run = D.domNovaCorrida(escada, 0, '', 0, time5);
  run.nivel = 10; run.aguardandoPremio = true;
  run.vida = [{ hp: 60, vivo: true }, { hp: 0, vivo: false }, { hp: 0, vivo: false }, { hp: 60, vivo: true }, { hp: 60, vivo: true }];
  ok(D.domPremiosDisponiveis(run).includes('reviver'), 'REVIVER disponível (há caídos)');
  D.domAplicarPremio(run, escada, 'reviver', 2);   // revive o idx 2 (tyr), não o 1º caído (idx 1)
  ok(run.vida[2].vivo && !run.vida[1].vivo, 'REVIVER trouxe de volta o caído ESCOLHIDO (idx 2), não o 1º caído (idx 1)');
}

console.log('\n== §368 (6) migração v7→v8: corrida do formato antigo (3 deuses, sem campo) ENCERRA; recorde preservado ==');
{
  const v7 = P.novoPerfil(0, 0); v7.versao = 7;
  v7.dominios = { porDominio: { grega: { run: { cultura: 'Grega', time: ['zeus', 'ogum', 'tyr'], nivel: 8, vida: [{ hp: 50, vivo: true }, { hp: 0, vivo: false }, { hp: 30, vivo: true }], bonus: 0.1, profundidade: 7, status: 'ativo', semana: '2026-W37' }, melhorSempre: 12, semanas: { '2026-W37': 7 } } } };
  const m = P.migrar(v7);
  ok(m.versao === P.VERSAO_PERFIL, 'migra para a versão atual (v8)');
  ok(m.dominios.porDominio.grega.run === null, 'a corrida antiga (3 deuses, sem campo) ENCERRA (run:null)');
  ok(m.dominios.porDominio.grega.melhorSempre === 12 && m.dominios.porDominio.grega.semanas['2026-W37'] === 7, 'melhorSempre (12) e o recorde semanal (W37=7) são PRESERVADOS');
  // uma corrida JÁ no formato novo (5 + campo) é MANTIDA
  const v7b = P.novoPerfil(0, 0); v7b.versao = 7;
  v7b.dominios = { porDominio: { nórdica: { run: { cultura: 'Nórdica', time: ['zeus', 'ogum', 'tyr', 'sobek', 'brigid'], campo: [0, 1, 2], nivel: 5, vida: [{ hp: 50, vivo: true }], bonus: 0, profundidade: 4, status: 'ativo', semana: '2026-W37' }, melhorSempre: 9, semanas: {} } } };
  const mb = P.migrar(v7b);
  ok(mb.dominios.porDominio['nórdica'].run && mb.dominios.porDominio['nórdica'].run.campo, 'uma corrida já no formato novo (5 + campo) é MANTIDA na migração');
}

console.log(`\n== §368 RESERVAS — ${n} asserções, ${falhas} falha(s) ==`);
if (falhas) process.exit(1);
