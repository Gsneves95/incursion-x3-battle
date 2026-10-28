// §371 — CAPTURAS da Loja (e da invocação com bilhete) nos dois tamanhos: 780×360 (celular) e 1846×852 (o canvas escalado).
// Prefixo 371b-. Grava em docs/telas/. Usa o mesmo transporte simulado dos testes (sem servidor).
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

function acharChromium() {
  if (process.env.INCURSION_CHROMIUM) return process.env.INCURSION_CHROMIUM;
  const g = '/opt/pw-browsers'; try { for (const d of fs.readdirSync(g)) if (/^chromium/.test(d)) { const e = path.join(g, d, 'chrome-linux', 'chrome'); if (fs.existsSync(e)) return e; } } catch (e) {}
  return '/opt/pw-browsers/chromium';
}
const RAIZ = path.resolve(__dirname, '..');
const distAbs = 'file://' + path.join(RAIZ, 'dist', 'incursion.html');
const TELAS = path.join(RAIZ, 'docs', 'telas');
fs.mkdirSync(TELAS, { recursive: true });

const LOJA_BOOT = `lerToken=function(){return 'tok';};contaAtual={perfil:{moedas:{gema:1240,essencia:180},deuses:{zeus:{copias:1}}},bilhetes:3,pity:10,inicianteUsado:true};window.__L={saldo:{gema:1240,essencia:180},bilhetes:3,pacotes:[{id:'p1',reais:4.90,gemas:450,primeira:true,emDobro:true},{id:'p2',reais:9.90,gemas:950,primeira:true,emDobro:true},{id:'p3',reais:24.90,gemas:2500,primeira:true,emDobro:true},{id:'p4',reais:49.90,gemas:5200,primeira:true,emDobro:true},{id:'p5',reais:99.90,gemas:10800,primeira:false,emDobro:false},{id:'p6',reais:249.90,gemas:28000,primeira:true,emDobro:true}],passe:{ativo:false,dias:[]},deusSemana:{deus:'baldur',raridade:'S',marcas:3,meta:5,dado:false,compraDireta:1800},anuncios:{total:0,teto:8,porTipo:{}},vagasProvacao:1};contaTransporte={pedir:function(m){return Promise.resolve({tipo:'lojaEstado',loja:window.__L,conta:contaAtual});}};function __loja(ab){ir('loja',{},{substituir:true});render();LOJA._setEstadoTeste(window.__L,ab);}`;
const PASSE12 = `window.__L.passe={ativo:true,diaAtual:12,dias:(function(){var a=[];for(var i=1;i<=30;i++){var e=i<12?((i===4||i===9)?'perdido':'resgatado'):(i===12?'hoje':'futuro');var r=(i===30)?{ss:true}:((i===7||i===14||i===21)?{gema:150,bilhetes:3}:(i===28?{gema:150,bilhetes:2}:{gema:150}));a.push({dia:i,estado:e,recompensa:r});}return a;})()};`;

const CENAS = [
  ['destaques', LOJA_BOOT + `__loja('destaques');`],
  ['passe', LOJA_BOOT + PASSE12 + `__loja('passe');`],
  ['deus-semana', LOJA_BOOT + `__loja('deussemana');`],
];
const TAMS = [[780, 360], [1846, 852]];

(async () => {
  const browser = await chromium.launch({ executablePath: acharChromium(), headless: true, args: ['--no-sandbox'] });
  const nomes = [];
  for (const [slug, setup] of CENAS) {
    for (const [w, h] of TAMS) {
      const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
      const page = await ctx.newPage();
      await page.goto(distAbs, { waitUntil: 'load' });
      const err = await page.evaluate(s => { try { eval(s); } catch (e) { return String(e && e.message || e); } const g = document.getElementById('gsplash'); if (g) g.remove(); if (typeof fit === 'function') fit(); return null; }, setup);
      if (err) { console.log('ERRO', slug, w + 'x' + h, err); await ctx.close(); continue; }
      await page.waitForTimeout(120);
      const file = `371b-${slug}-${w}x${h}.png`;
      await page.screenshot({ path: path.join(TELAS, file) });
      nomes.push(file);
      await ctx.close();
    }
  }
  await browser.close();
  console.log('capturas §371:\n' + nomes.map(n => '  docs/telas/' + n).join('\n'));
})();
