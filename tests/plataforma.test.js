// plataforma.test.js (§240) — o APK Capacitor no modelo SERVIDOR-APONTADO. Prova, em jsdom com um
// `window.Capacitor` FALSO (injetado antes do script rodar, como a WebView faz na origem do server.url):
//   - o SPLASH nativo é escondido assim que a UI aparece (não fica branco/preso);
//   - o botão VOLTAR do Android faz o que o "‹ Início" faz e NUNCA fecha o app no meio de uma partida;
//   - num navegador comum (sem Capacitor) nada disso liga — é no-op, o jogo segue igual.
const { JSDOM } = require('jsdom');
const fs = require('fs'), path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', 'dist', 'incursion.html'), 'utf8');

let f = 0; const ok = (c, m) => { if (!c) { console.log('  FALHA: ' + m); f++; } };

// ---- Capacitor FALSO: captura o callback do backButton e conta as chamadas nativas ----
const nativo = { splashHid: false, backCb: null, exited: 0 };
const fakeCapacitor = {
  isNativePlatform: () => true,
  Plugins: {
    SplashScreen: { hide: () => { nativo.splashHid = true; return Promise.resolve(); } },
    App: {
      addListener: (ev, cb) => { if (ev === 'backButton') nativo.backCb = cb; return { remove() {} }; },
      exitApp: () => { nativo.exited++; return Promise.resolve(); },
    },
  },
};

const dom = new JSDOM(html, {
  runScripts: 'dangerously', pretendToBeVisual: true,
  beforeParse(window) { window.Capacitor = fakeCapacitor; },   // a WebView injeta a ponte ANTES do script
});
const w = dom.window;
const back = () => nativo.backCb && nativo.backCb();

console.log('== §240: dentro do APK (Capacitor) — splash escondido e ponte ligada ==');
ok(nativo.splashHid, 'o splash nativo é escondido quando a UI aparece (não fica branco/preso)');
ok(typeof nativo.backCb === 'function', 'um ouvinte de backButton foi registrado (senão o Android fecharia o app)');
ok(w.__incBackLigado === true, 'a plataforma nativa ligou (flag anti-registro-duplo)');
console.log('  splash escondido · backButton registrado');

console.log('== §240: o botão VOLTAR faz o que o "‹ Início" faz, e não fecha o app no meio do jogo ==');
{
  // A) numa sub-tela, VOLTAR vai para a home (não fecha o app)
  w.eval("ir('colecao'); render()");
  nativo.exited = 0; back();
  ok(w.eval("rotaAtual()") === 'home', 'sub-tela → VOLTAR vai para a home (veio ' + w.eval("rotaAtual()") + ')');
  ok(nativo.exited === 0, 'sub-tela → VOLTAR NÃO fecha o app');

  // B) NA BATALHA, VOLTAR abre o confirmar-sair (ov='sair') — não abandona direto, não fecha o app
  w.eval("vsCPU=false; st=novoEstado(['iara','zeus','ogum'],['sobek','brigid','ganesha'],1,0); st.ativo=0; ir('batalha',{},{substituir:true}); pararRelogio(); render()");
  nativo.exited = 0; back();
  ok(w.eval("ov") === 'sair', 'batalha → VOLTAR abre o confirmar-sair (ov=' + w.eval("String(ov)") + ')');
  ok(w.eval("rotaAtual()") === 'batalha', 'batalha → VOLTAR NÃO abandona a partida sozinho (segue em batalha)');
  ok(nativo.exited === 0, 'batalha → VOLTAR NUNCA fecha o app (o requisito do dono)');

  // C) com a sobreposição aberta, VOLTAR fecha ela primeiro (não sai da batalha, não fecha o app)
  nativo.exited = 0; back();
  ok(!w.eval("ov"), 'sobreposição aberta → VOLTAR fecha a sobreposição primeiro (ov=' + w.eval("String(ov)") + ')');
  ok(w.eval("rotaAtual()") === 'batalha', 'e continua na batalha (não voltou nem fechou)');
  ok(nativo.exited === 0, 'e não fechou o app');

  // D) já na HOME (a raiz), VOLTAR aí sim sai do app — o padrão do Android
  w.eval("while(NAV.pilha.length>1)NAV.pilha.pop(); ir('home',{},{substituir:true}); render()");
  nativo.exited = 0; back();
  ok(nativo.exited === 1, 'home (raiz) → VOLTAR sai do app (padrão do Android)');
  console.log('  sub-tela→home · batalha→confirmar-sair · sobreposição→fecha · home→sai do app');
}
w.close();

// == num NAVEGADOR comum (sem Capacitor) nada disso liga — é no-op ==
console.log('== §240: navegador comum (sem Capacitor) — a plataforma nativa é no-op ==');
{
  const dom2 = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true });
  const w2 = dom2.window;
  ok(typeof w2.Capacitor === 'undefined', 'sem Capacitor no navegador comum');
  ok(w2.__incBackLigado === undefined, 'a plataforma nativa NÃO ligou (nada de backButton no navegador)');
  ok(typeof w2.eval("typeof voltarNativo") === 'string' && w2.eval("typeof voltarNativo") === 'function',
    'a função existe (definida sempre), mas fica adormecida sem a ponte');
  w2.close();
  console.log('  sem Capacitor: adormecido, o jogo no navegador segue idêntico');
}

console.log('');
console.log(f === 0 ? '>>> PLATAFORMA OK' : `>>> ${f} FALHA(S)`);
process.exit(f ? 1 : 0);
