// §245 — DESAFIOS POR DEUS: comprados com Essência, dão MAESTRIA (moldura no Mestre). AS 9 REGRAS + os
// números + o DESAFIO DA SEMANA (Gema). Runtime no bundle real (jsdom): o perfil é o global do jogo.
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

let falhas = 0, passes = 0;
const ok = (c, m) => { if (!c) { console.log('  ✗ ' + m); falhas++; } else { console.log('  ✓ ' + m); passes++; } };
const html = fs.readFileSync(path.join(__dirname, '../dist/incursion.html'), 'utf8');
function sessao() {
  const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://x/' });
  const w = dom.window, d = w.document;
  return { w, d, $: s => d.querySelector(s), $$: s => [...d.querySelectorAll(s)] };
}
const CFG = require('../data/economia.json').pergaminhos;

console.log('== §245 / DESAFIOS POR DEUS — os números da economia ==');
ok(CFG.custoEssencia === 30 && CFG.maestriaPorVitoria === 3 && CFG.recargaHoras === 8, `custo 30 · maestria 3 · recarga 8h (veio ${CFG.custoEssencia}/${CFG.maestriaPorVitoria}/${CFG.recargaHoras})`);
ok(30 / CFG.maestriaPorVitoria === 10, '30 de maestria (Mestre) ÷ 3 por desafio = 10 desafios por moldura');
ok(require('../data/economia.json').semanal.recompensa.gema > 0, 'o Desafio da Semana dá Gema (economia)');

console.log('\n== a compra + as regras 1/2/8 (um por deus, vários deuses, só de deus que você tem) ==');
{
  const { w } = sessao();
  w.eval("perfil.moedas.essencia=200; perfil.desafios={};");
  // REGRA 8: só de deus que você TEM
  ok(w.eval("podeComprarDesafio('hades').ok") === false, 'não dá para comprar de um deus que você não tem (hades)');
  ok(w.eval("podeComprarDesafio('zeus').ok") === true, 'dá para comprar de um deus possuído (zeus, inicial)');
  // COMPRA: debita, vira ATIVO, e a recarga NÃO começa na compra (REGRA 6)
  const ess0 = w.eval('perfil.moedas.essencia');
  ok(w.eval("comprarDesafio('zeus').ok") === true, 'comprar zeus retorna ok');
  ok(w.eval('perfil.moedas.essencia') === ess0 - 30, 'a compra debita 30 de Essência');
  ok(w.eval("desafioEstado('zeus').estado") === 'ativo', 'após a compra o desafio fica ATIVO');
  ok(w.eval("!perfil.desafios.zeus.recargaAte"), 'a recarga NÃO começa na compra (regra 6)');
  // REGRA 1: um por deus por vez
  ok(w.eval("podeComprarDesafio('zeus').ok") === false, 'não dá para comprar um 2º desafio do MESMO deus (um por vez)');
  // REGRA 2: vários DEUSES ao mesmo tempo, sem teto
  ok(w.eval("comprarDesafio('tyr').ok") === true && w.eval("desafioEstado('tyr').estado") === 'ativo', 'dá para ter um 2º deus ativo ao mesmo tempo (sem teto)');
}

console.log('\n== a vitória (regra: maestria ao título + recarga) e o "não avança Provação" (regra 9) ==');
{
  const { w } = sessao();
  w.eval("perfil.moedas.essencia=200; perfil.desafios={}; perfil.maestria={}; perfil.provacoes={}; comprarDesafio('zeus');");
  const ess = w.eval('perfil.moedas.essencia');
  w.eval("cumprirDesafioDeus('zeus');");
  ok(w.eval("perfil.maestria.zeus.vitorias") === 3, 'cumprir dá +3 de maestria ao deus-título');
  ok(w.eval("perfil.maestria.zeus.milagre") === true, 'cumprir marca a condição de kit (milagre) do Mestre');
  ok(w.eval('perfil.moedas.essencia') === ess, 'cumprir NÃO dá moeda (já pagou na compra)');
  ok(w.eval("desafioEstado('zeus').estado") === 'recarga', 'ao cumprir, a RECARGA começa (regra 6)');
  ok(w.eval("Object.keys(perfil.provacoes).length") === 0, 'o desafio NÃO grava progresso de Provação (regra 9)');
}

console.log('\n== perder (regra 4) e desistir (regra 5) ==');
{
  const { w } = sessao();
  w.eval("perfil.moedas.essencia=200; perfil.desafios={}; comprarDesafio('zeus');");
  // REGRA 4: perder a batalha não muda o estado — fica ATIVO (repete de graça). Simula: nada reseta ao perder.
  ok(w.eval("desafioEstado('zeus').estado") === 'ativo', 'perdeu a batalha? o desafio fica ATIVO (repete de graça)');
  ok(w.eval("podeComprarDesafio('zeus').ok") === false, 'e não cobra de novo (já é ativo)');
  // REGRA 5: desistir — sem reembolso, recarga começa
  const ess = w.eval('perfil.moedas.essencia');
  w.eval("desistirDesafio('zeus');");
  ok(w.eval("desafioEstado('zeus').estado") === 'recarga', 'desistir inicia a recarga');
  ok(w.eval('perfil.moedas.essencia') === ess, 'desistir NÃO reembolsa (regra 5)');
  ok(w.eval("!perfil.maestria || !perfil.maestria.zeus || !perfil.maestria.zeus.vitorias"), 'desistir NÃO dá maestria');
}

console.log('\n== a recarga (regras 6/7): 8h ao cumprir/desistir, bloqueia recomprar até passar ==');
{
  const { w } = sessao();
  w.eval("perfil.moedas.essencia=200; perfil.desafios={}; comprarDesafio('zeus'); cumprirDesafioDeus('zeus');");
  ok(w.eval("desafioEstado('zeus').estado") === 'recarga' && w.eval("podeComprarDesafio('zeus').ok") === false, 'em recarga não dá para recomprar');
  const dur = w.eval("perfil.desafios.zeus.recargaAte - Date.now()");
  ok(dur > 7.8 * 3600 * 1000 && dur <= 8 * 3600 * 1000, `a recarga é de ~8h (veio ${(dur / 3600000).toFixed(2)}h)`);
  // recarga passou → disponível de novo
  w.eval("perfil.desafios.zeus.recargaAte = Date.now() - 1;");
  ok(w.eval("desafioEstado('zeus').estado") === 'disponivel' && w.eval("podeComprarDesafio('zeus').ok") === true, 'passada a recarga, volta a ser comprável');
}

console.log('\n== a MOLDURA sai no MESTRE (10 desafios = 30 maestria + milagre) ==');
{
  const { w, $ } = sessao();
  w.eval("perfil.maestria={}; perfil.desafios={};");
  // 10 cumprimentos (cada um +3, e marca milagre) → 30 → Mestre
  w.eval("for(let i=0;i<10;i++){ perfil.desafios.zeus={ativo:true,recargaAte:0}; cumprirDesafioDeus('zeus'); }");
  ok(w.eval("perfil.maestria.zeus.vitorias") === 30, '10 desafios = 30 de maestria');
  ok(w.eval("nivelMaestria('zeus')") === 4, 'zeus vira MESTRE (nível 4)');
  w.eval("ir('colecao'); render();");
  const tile = $('.colx[data-deus="zeus"]');
  ok(!!tile && tile.classList.contains('colx--mestre'), 'a MOLDURA do Mestre aparece no tile da coleção (colx--mestre)');
}

console.log('\n== o DESAFIO DA SEMANA foi renomeado e dá Gema ==');
{
  const { w, $ } = sessao();
  w.eval("perfil.provacoes={}; ir('desafios'); render();");
  const banner = $('.psem[data-semanal]');
  ok(!!banner && /DESAFIO DA SEMANA/.test(banner.textContent) && !/PROVAÇÃO/.test(banner.textContent), 'o banner diz "DESAFIO DA SEMANA" (renomeado)');
  // a via de recompensa credita GEMA na 1ª vitória da semana (aplicarDesbloqueioProva)
  w.eval("prova=provaSemanalAtual(); provaFim={resultado:'vitoria'}; provaLances=13;");
  const g0 = w.eval('perfil.moedas.gema');
  w.eval("aplicarDesbloqueioProva(prova);");
  const gema = require('../data/economia.json').semanal.recompensa.gema;
  ok(w.eval('perfil.moedas.gema') === g0 + gema, `vencer o Desafio da Semana credita ${gema} de Gema`);
}

console.log(`\n== DESAFIOS OK — ${passes} asserções, ${falhas} falha(s) ==`);
if (falhas) process.exit(1);
