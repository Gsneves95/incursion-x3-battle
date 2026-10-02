// §245 / §318b-3 — DESAFIOS POR DEUS. A economia MIGROU para o servidor (§318b-3): a Essência é GANHA e GASTA
// no servidor; a COMPRA do pergaminho (débito + recarga de 8h) roda em comprarPergaminho, provada de ponta a
// ponta em tests/desafio_net.test.js. AQUI ficam as regras do CLIENTE que seguem locais:
//   • a MAESTRIA (cosmética, §215): cumprir dá +3 ao deus-título; a moldura sai no MESTRE (30 = 10 desafios).
//   • as DERIVAÇÕES de tela: desafioEstado lê o estado do SERVIDOR (contaAtual.perfil.desafios); podeComprar
//     decide por moedaServidor (Essência do servidor) + posse + maestria + ativo/recarga.
//   • a TELA mostra o saldo do SERVIDOR (moedaServidor), "—" desconectado — sem leitor local de Essência.
//   • o DESAFIO DA SEMANA dá Gema pelo servidor (envia replay, não credita local).
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
// liga uma conta de servidor (contaAtual) com o saldo e os desafios dados — a fonte autoritativa do cliente.
const conta = (essencia, desafios) => `contaAtual={perfil:{moedas:{gema:0,essencia:${essencia}},desafios:${JSON.stringify(desafios || {})}}};`;
const CFG = require('../data/economia.json').pergaminhos;

console.log('== §245 / DESAFIOS POR DEUS — os números da economia ==');
ok(CFG.custoEssencia === 30 && CFG.maestriaPorVitoria === 3 && CFG.recargaHoras === 8, `custo 30 · maestria 3 · recarga 8h (veio ${CFG.custoEssencia}/${CFG.maestriaPorVitoria}/${CFG.recargaHoras})`);
ok(30 / CFG.maestriaPorVitoria === 10, '30 de maestria (Mestre) ÷ 3 por desafio = 10 desafios por moldura');
ok(require('../data/economia.json').semanal.recompensa.gema > 0, 'o Desafio da Semana dá Gema (economia)');

console.log('\n== podeComprar: posse (REGRA 8) + Essência do SERVIDOR + conexão ==');
{
  const { w } = sessao();
  w.eval(conta(200, {}));
  // REGRA 8: só de deus que você TEM
  ok(w.eval("podeComprarDesafio('hades').ok") === false, 'não dá para comprar de um deus que você não tem (hades)');
  ok(w.eval("podeComprarDesafio('zeus').ok") === true, 'conectado, com Essência e deus possuído → pode comprar (zeus)');
  // DESCONECTADO: a Essência é do servidor; sem conta não dá para comprar (nunca em silêncio)
  w.eval("contaAtual=null;");
  const off = w.eval("JSON.stringify(podeComprarDesafio('zeus'))");
  ok(/"ok":false/.test(off) && /sem conex/i.test(off), 'desconectado → recusa "sem conexão com o servidor" (não um saldo fantasma)');
  // ESSÊNCIA INSUFICIENTE (do servidor): saldo < custo
  w.eval(conta(10, {}));
  const pobre = w.eval("JSON.stringify(podeComprarDesafio('zeus'))");
  ok(/"ok":false/.test(pobre) && /insuficiente/i.test(pobre), 'Essência do servidor < custo → recusa "Essência insuficiente"');
}

console.log('\n== desafioEstado lê o ESTADO DO SERVIDOR (contaAtual.perfil.desafios) ==');
{
  const { w } = sessao();
  // ATIVO (REGRA 1: um por deus por vez)
  w.eval(conta(200, { zeus: { ativo: true, recargaAte: 0 } }));
  ok(w.eval("desafioEstado('zeus').estado") === 'ativo', 'desafios.zeus.ativo no servidor → estado "ativo"');
  ok(w.eval("podeComprarDesafio('zeus').ok") === false, 'ativo → não dá para comprar de novo (REGRA 1)');
  // RECARGA (REGRA 6/7)
  w.eval(conta(200, { zeus: { ativo: false, recargaAte: Date.now() + 5 * 3600 * 1000 } }));
  ok(w.eval("desafioEstado('zeus').estado") === 'recarga', 'recargaAte futuro no servidor → estado "recarga"');
  ok(w.eval("podeComprarDesafio('zeus').ok") === false && /recarga/.test(w.eval("podeComprarDesafio('zeus').motivo")), 'em recarga → recusa "em recarga"');
  // RECARGA PASSOU → disponível
  w.eval(conta(200, { zeus: { ativo: false, recargaAte: Date.now() - 1 } }));
  ok(w.eval("desafioEstado('zeus').estado") === 'disponivel' && w.eval("podeComprarDesafio('zeus').ok") === true, 'passada a recarga, volta a ser comprável');
  // O CLIENTE NÃO É A FONTE: sem contaAtual, não há estado de desafio (não lê mais perfil.desafios local)
  w.eval("contaAtual=null; perfil.desafios={zeus:{ativo:true}};");
  ok(w.eval("desafioEstado('zeus').estado") === 'disponivel', 'perfil.desafios LOCAL não é mais lido — sem servidor, estado é "disponivel"');
}

console.log('\n== a MAESTRIA (cosmética, local) ao cumprir + a moldura no MESTRE ==');
{
  const { w, $ } = sessao();
  w.eval("perfil.maestria={}; perfil.provacoes={}; contaTransporte=null;");   // sem transporte: fecharDesafioServidor é no-op tolerante
  w.eval("cumprirDesafioDeus('zeus');");
  ok(w.eval("perfil.maestria.zeus.vitorias") === 3, 'cumprir dá +3 de maestria ao deus-título (local/cosmética)');
  ok(w.eval("perfil.maestria.zeus.milagre") === true, 'cumprir marca a condição de kit (milagre) do Mestre');
  ok(w.eval("Object.keys(perfil.provacoes).length") === 0, 'o desafio NÃO grava progresso de Provação (regra 9)');
}
{
  const { w, $ } = sessao();
  w.eval("perfil.maestria={}; contaTransporte=null;");
  w.eval("for(let i=0;i<10;i++){ cumprirDesafioDeus('zeus'); }");
  ok(w.eval("perfil.maestria.zeus.vitorias") === 30, '10 desafios = 30 de maestria');
  ok(w.eval("nivelMaestria('zeus')") === 4, 'zeus vira MESTRE (nível 4)');
  // §284: a maestria mora SÓ no PAINEL (saiu da grade).
  w.eval("ir('colecao'); render(); colSelecionar('zeus');");
  const mae = $('#col2painel .col2m');
  ok(!!mae && mae.classList.contains('col2m--mestre') && /Mestre/.test(mae.textContent), 'ao selecionar, o painel mostra ★ Mestre (col2m--mestre)');
  ok(!$('.col2c--mestre'), 'a moldura de Mestre não fica mais na grade (maestria só no painel, §284)');
}

console.log('\n== a TELA dos Desafios mostra o saldo do SERVIDOR (moedaServidor), "—" desconectado ==');
{
  const { w, $ } = sessao();
  // CONECTADO: "você tem <essência do servidor>"
  w.eval(conta(77, {}));
  w.eval("ir('desafios'); render();");
  const cab = $('.psec__cab--acervo .psec__n');
  ok(!!cab && new RegExp(CFG.custoEssencia + ' ✦').test(cab.textContent) && /você tem 77/.test(cab.textContent), `cabeçalho: "${CFG.custoEssencia} ✦ · você tem 77" (saldo do servidor)`);
  // DESCONECTADO: "você tem —" (nunca um saldo local fantasma)
  w.eval("contaAtual=null; perfil.moedas={gema:9,essencia:555};");
  w.eval("ir('desafios'); render();");
  const cab2 = $('.psec__cab--acervo .psec__n');
  ok(!!cab2 && /você tem —/.test(cab2.textContent) && !/555/.test(cab2.textContent), 'desconectado: "você tem —" (não o 555 local fantasma)');
}

console.log('\n== o DESAFIO DA SEMANA dá Gema PELO SERVIDOR (envia replay, não credita local) ==');
{
  const { w, $ } = sessao();
  w.eval("perfil.provacoes={}; ir('desafios'); render();");
  const banner = $('.psem[data-semanal]');
  ok(!!banner && /DESAFIO DA SEMANA/.test(banner.textContent) && !/PROVAÇÃO/.test(banner.textContent), 'o banner diz "DESAFIO DA SEMANA" (renomeado)');
  w.eval("prova=provaSemanalAtual(); provaFim={resultado:'vitoria'}; provaLances=13; REPLAY.iniciar({modo:'semanal'});");
  const g0 = w.eval('perfil.moedas.gema');
  const nFila0 = w.eval('REPLAY.fila().length');
  w.eval("aplicarDesbloqueioProva(prova);");
  ok(w.eval('perfil.moedas.gema') === g0, 'vencer o Desafio da Semana NÃO credita Gema local (economia do servidor)');
  ok(w.eval('REPLAY.fila().length') === nFila0 + 1, 'vencer o Desafio da Semana ENVIA um replay ao servidor');
  ok(JSON.parse(w.eval('JSON.stringify(REPLAY.fila()[REPLAY.fila().length-1])')).modo === 'semanal', 'o replay é do modo semanal');
}

console.log(`\n== DESAFIOS OK — ${passes} asserções, ${falhas} falha(s) ==`);
if (falhas) process.exit(1);
