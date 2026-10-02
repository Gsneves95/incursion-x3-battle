// §318b-2 — RECONEXÃO PROATIVA + BARRA DE MOEDAS SÓ DO SERVIDOR.
//   A) socket derrubado + volta ao FOCO → religa o socket e REFRESCA a conta (forçado), ANTES de qualquer
//      toque; o próximo pedido funciona de primeira. (A reconexão do socket em si — enviar e casar após
//      religar — está provada no transporte em tests/invocacao_net.test.js.)
//   B) Toda barra de moedas da CONTA lê do servidor: contaAtual null → "—"; com conta → o saldo do servidor.
//      Nenhum fallback ao perfil local. Guarda de código: os leitores de barra usam moedaServidor, não
//      perfil.moedas (provado que morde).
const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

let falhas = 0, passes = 0;
const ok = (c, m) => { if (!c) { console.log('  ✗ FALHA: ' + m); falhas++; } else { console.log('  ✓ ' + m); passes++; } };
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const html = fs.readFileSync(path.join(__dirname, '../dist/incursion.html'), 'utf8');
const vc = new VirtualConsole();
let err = null; vc.on('jsdomError', e => { err = (e.detail && e.detail.message) || e.message; });
const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://x/', virtualConsole: vc });
const w = dom.window, d = w.document;
const $ = s => d.querySelector(s); const T = el => (el ? el.textContent : '').replace(/\s+/g, ' ').trim();

(async () => {
  console.log('== §318b-2 — reconexão proativa no foco + barra de moedas do servidor ==');
  ok(!err, 'o app sobe sem quebrar (ligarReconexao sem TDZ) — ' + (err || 'ok'));
  ok(w.eval("typeof ligarReconexao==='function' && typeof _aoVoltarAoFoco==='function'"), 'as funções de reconexão existem');

  // ---- A) FOCO religa + refresca a conta (transporte-espião que conta religar/pedir) ----
  w.eval(`
    window.__spy = { religou:0, pediu:[] };
    contaTransporte = {
      religar(){ window.__spy.religou++; },
      estaViva(){ return false; },                                   // simula socket caído
      pedir(m){ window.__spy.pediu.push(m.tipo); return Promise.resolve({ tipo:'conta', conta:{ perfil:{ moedas:{ gema:1500, essencia:40 } } } }); },
      aoPush(){}, fechar(){}
    };
    lerToken = function(){ return 'tok-test'; };
    contaAtual = null;
    ir('home',{},{substituir:true}); render();
  `);
  ok(/💎—/.test(T($('.mmoedas'))), 'antes de refrescar (contaAtual null): a barra da home mostra "—"');
  // dispara o evento REAL de volta ao foco — a wiring de ligarReconexao tem de agir
  w.eval("dispatchEvent(new window.Event('focus'));");
  await sleep(30);
  ok(w.eval('window.__spy.religou') >= 1, 'ao voltar o foco: religa o socket (religar chamado)');
  ok(w.eval("window.__spy.pediu.indexOf('entrar')") >= 0, 'ao voltar o foco: refresca a conta (pedido "entrar" forçado) ANTES de qualquer toque');
  ok(w.eval('!!contaAtual && contaAtual.perfil.moedas.gema===1500'), 'a conta é refrescada do servidor (gema 1500)');
  // visibilitychange (visível) também religa
  w.eval("window.__spy.religou=0; Object.defineProperty(document,'hidden',{configurable:true,get:()=>false}); document.dispatchEvent(new window.Event('visibilitychange'));");
  await sleep(10);
  ok(w.eval('window.__spy.religou') >= 1, 'visibilitychange (visível) também religa');

  // ---- B) barra de moedas: contaAtual null → "—"; com conta → servidor ----
  console.log('\n== B) barra de moedas: sempre do servidor, "—" desconectado ==');
  // DESCONECTADO: perfil local "fantasma" não vaza para NENHUMA barra de conta
  w.eval("contaAtual=null; perfil.moedas={gema:26100,essencia:777};");
  w.eval("ir('home',{},{substituir:true}); render();");
  ok(T($('.mmoedas')) === '💎— ◈—' , 'HOME desconectado: 💎— ◈— (não o 26.100 local)');
  w.eval("ir('colecao',{},{substituir:true}); render();");
  ok(/◈—/.test(T($('.col2__moedas'))) && /◆—/.test(T($('.col2__moedas'))) && !/26\.?100/.test(T($('.col2__moedas'))), 'COLEÇÃO desconectado: "—", nunca o 26.100 fantasma');
  // CONECTADO: mostra o saldo do servidor
  w.eval("contaAtual={perfil:{moedas:{gema:1500,essencia:40}}}; ir('home',{},{substituir:true}); render();");
  ok(/💎1\.500/.test(T($('.mmoedas'))) && /◈40/.test(T($('.mmoedas'))), 'HOME conectado: mostra o saldo do servidor (1.500 / 40)');
  w.eval("ir('colecao',{},{substituir:true}); render();");
  ok(/◆1\.500/.test(T($('.col2__moedas'))) && /◈40/.test(T($('.col2__moedas'))), 'COLEÇÃO conectado: saldo do servidor');

  // ---- C) GUARDA DE CÓDIGO: os leitores de barra usam moedaServidor, não perfil.moedas (bite) ----
  console.log('\n== C) guarda de código: leitores de barra fora do perfil local ==');
  const home = fs.readFileSync(path.join(__dirname, '../src/ui/home.js'), 'utf8');
  const mapaFn = home.slice(home.indexOf('function mapaMoedasHTML'), home.indexOf('function mapaMoedasHTML') + 420);
  ok(/moedaServidor\(\)/.test(mapaFn) && !/perfil\.moedas/.test(mapaFn), 'mapaMoedasHTML lê moedaServidor() e NÃO perfil.moedas');
  const base = fs.readFileSync(path.join(__dirname, '../src/ui/base.js'), 'utf8');
  ok(/function moedaServidor\s*\(/.test(base) && /contaAtual/.test(base.slice(base.indexOf('function moedaServidor'), base.indexOf('function moedaServidor') + 300)), 'moedaServidor() lê contaAtual (fonte única do servidor)');

  console.log(`\n${falhas ? '✗ ' + falhas + ' FALHA(S)' : '✓ tudo verde'} · ${passes} asserções`);
  try { w.close(); } catch (e) {}
  process.exit(falhas ? 1 : 0);
})().catch(e => { console.log('  ✗ ERRO: ' + (e && e.message || e)); process.exit(1); });
