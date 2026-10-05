'use strict';
// §244 — cap-native: o MainActivity IMERSIVO versionado é aplicado no path certo (derivado do appId),
// com os marcadores do imersivo, e SOBREVIVE ao cap add (é reaplicado). E é gracioso se android/ não existe.
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { aplicar } = require('../tools/cap-native.js');

let passes = 0;
const ok = (c, m) => { assert.ok(c, m); console.log('  ✓ ' + m); passes++; };

// monta uma raiz-fake: capacitor.config.json + native/MainActivity.java (o real) + (opcional) android/
function raizFake(appId, comAndroid) {
  const raiz = fs.mkdtempSync(path.join(os.tmpdir(), 'capnat-'));
  fs.writeFileSync(path.join(raiz, 'capacitor.config.json'), JSON.stringify({ appId, appName: 'INCURSION' }));
  fs.mkdirSync(path.join(raiz, 'native'), { recursive: true });
  fs.copyFileSync(path.join(__dirname, '..', 'native', 'MainActivity.java'), path.join(raiz, 'native', 'MainActivity.java'));
  if (comAndroid) fs.mkdirSync(path.join(raiz, 'android', 'app', 'src', 'main'), { recursive: true });
  return raiz;
}

console.log('== §244 / cap-native — MainActivity imersivo versionado ==');

// 1) o arquivo-fonte versionado existe e traz o imersivo
{
  const src = fs.readFileSync(path.join(__dirname, '..', 'native', 'MainActivity.java'), 'utf8');
  ok(/hide\(WindowInsetsCompat\.Type\.systemBars\(\)\)/.test(src), 'native/MainActivity.java esconde as systemBars (status + navegação)');
  ok(/BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE/.test(src), 'usa o comportamento "volta ao deslizar da borda"');
  ok(/setDecorFitsSystemWindows\(getWindow\(\), false\)/.test(src), 'desenha de borda a borda (sem faixa branca onde a barra estava)');
  ok(/onWindowFocusChanged/.test(src), 'reafirma o imersivo ao voltar o foco (resume) — as duas barras');
}

// 1b) §319b — GUARDA de visibilidade: todo método com @Override (que sobrescreve BridgeActivity/Activity)
//     tem de ser `public`. O Android recusa enfraquecer a visibilidade herdada
//     ("attempting to assign weaker access privileges"): BridgeActivity declara onResume/onCreate/
//     onWindowFocusChanged como public, então um `protected`/pacote-privado NÃO compila. O teste não
//     rodava javac, então deixou passar um `protected onResume()` — esta guarda fecha o buraco.
function overridesNaoPublicos(java) {
  const ruins = [];
  // @Override  <modificadores>  <tipo-de-retorno>  <nome>(
  const re = /@Override\b\s+((?:public|protected|private|static|final|synchronized|\s)*)([\w.$<>\[\],? ]+?)\s+(\w+)\s*\(/g;
  let m;
  while ((m = re.exec(java))) {
    const mods = m[1] || '';
    const nome = m[3];
    if (!/\bpublic\b/.test(mods)) ruins.push(nome);
  }
  return ruins;
}
{
  const src = fs.readFileSync(path.join(__dirname, '..', 'native', 'MainActivity.java'), 'utf8');
  // sanidade: o parser realmente enxerga os @Override do template (não é uma lista vazia por regex quebrada)
  const todos = [...src.matchAll(/@Override\b\s+(?:public|protected|private|static|final|synchronized|\s)*[\w.$<>\[\],? ]+?\s+(\w+)\s*\(/g)].map(x => x[1]);
  ok(todos.includes('onResume') && todos.includes('onCreate') && todos.includes('onWindowFocusChanged'),
     'a guarda enxerga os @Override do template (onCreate, onResume, onWindowFocusChanged)');
  ok(overridesNaoPublicos(src).length === 0,
     'todo @Override do MainActivity é public (não enfraquece a visibilidade do BridgeActivity)');
  // prova que MORDE: enfraquecer onResume para protected tem de ser pego
  const quebrado = src.replace(/public void onResume\(\)/, 'protected void onResume()');
  ok(quebrado !== src, 'sanidade: a mutação trocou onResume para protected');
  const pegos = overridesNaoPublicos(quebrado);
  ok(pegos.includes('onResume'),
     'a guarda MORDE: um @Override protected onResume() é reprovado ("weaker access privileges")');
}

// 2) aplicar() escreve no path derivado do appId, com o package certo
{
  const raiz = raizFake('com.gsneves.incursionx3battle', true);
  const r = aplicar(raiz);
  ok(r.ok && !r.skipped, 'aplicar() rodou (android/ existe)');
  const dest = path.join(raiz, 'android', 'app', 'src', 'main', 'java', 'com', 'gsneves', 'incursionx3battle', 'MainActivity.java');
  ok(fs.existsSync(dest), 'escreveu em android/app/src/main/java/<appId>/MainActivity.java');
  const out = fs.readFileSync(dest, 'utf8');
  ok(/^package com\.gsneves\.incursionx3battle;/m.test(out), 'o package casa com o appId');
  ok(/hide\(WindowInsetsCompat\.Type\.systemBars\(\)\)/.test(out), 'o arquivo aplicado traz o imersivo');
  fs.rmSync(raiz, { recursive: true, force: true });
}

// 3) o package acompanha se o appId mudar (recalibrar sem editar o Java à mão)
{
  const raiz = raizFake('br.com.outro.app', true);
  aplicar(raiz);
  const dest = path.join(raiz, 'android', 'app', 'src', 'main', 'java', 'br', 'com', 'outro', 'app', 'MainActivity.java');
  ok(fs.existsSync(dest) && /^package br\.com\.outro\.app;/m.test(fs.readFileSync(dest, 'utf8')), 'appId diferente → package e path acompanham');
  fs.rmSync(raiz, { recursive: true, force: true });
}

// 4) SOBREVIVE ao cap add: simula o cap add (regenera MainActivity vanilla) e reaplica
{
  const raiz = raizFake('com.gsneves.incursionx3battle', true);
  const dest = path.join(raiz, 'android', 'app', 'src', 'main', 'java', 'com', 'gsneves', 'incursionx3battle', 'MainActivity.java');
  aplicar(raiz);                                                      // 1ª aplicação
  fs.writeFileSync(dest, 'package com.gsneves.incursionx3battle;\npublic class MainActivity extends BridgeActivity {}');  // "cap add" vanilla
  ok(!/systemBars/.test(fs.readFileSync(dest, 'utf8')), 'após um cap add o MainActivity volta vanilla (sem imersivo)');
  aplicar(raiz);                                                      // o cap:sync seguinte reaplica
  ok(/hide\(WindowInsetsCompat\.Type\.systemBars\(\)\)/.test(fs.readFileSync(dest, 'utf8')), 'o cap:sync REAPLICA o imersivo — sobrevive ao cap add');
  fs.rmSync(raiz, { recursive: true, force: true });
}

// 5) gracioso se android/ ainda não existe (não derruba o cap:sync)
{
  const raiz = raizFake('com.gsneves.incursionx3battle', false);
  const r = aplicar(raiz);
  ok(r.ok && r.skipped, 'sem android/: retorna ok+skipped com um aviso (não quebra o cap:sync)');
  fs.rmSync(raiz, { recursive: true, force: true });
}

console.log(`\n== CAP-NATIVE OK — ${passes} asserções ==`);
