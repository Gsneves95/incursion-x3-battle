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
