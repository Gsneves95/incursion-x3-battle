// §202 — a CLASSE de bug: só a BUILD exercitava (schema + solucionador no motor puro), o
// RUNTIME da tela nunca. As 3 Provações de bestiário validavam, carimbavam e QUEBRARIAM ao
// jogar (retrato lia GODS, criatura não está lá). Este teste fecha a classe: RENDERIZA a
// batalha de TODA Provação e de TODO encontro de campanha, e move a IA sobre criaturas —
// tudo o que a build valida tem de aparecer na tela sem quebrar.
const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

let falhas = 0;
const ok = (c, m) => { if (!c) { console.log('  FALHA: ' + m); falhas++; } };

const html = fs.readFileSync(path.join(__dirname, '../dist/incursion.html'), 'utf8');
const vc = new VirtualConsole();
let err = null;
vc.on('jsdomError', e => { err = (e.detail && e.detail.message) || e.message; });
const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://x/', virtualConsole: vc });
const w = dom.window;
w.eval("vsCPU=false; ir('batalha',{},{substituir:true});");

console.log('== 1. TODA Provação (90) renderiza a batalha — inclusive as de bestiário ==');
{
  const keys = w.eval('PROVACOES.map(p=>p.key)');
  const quebradas = [];
  for (const k of keys) {
    err = null;
    try { w.eval(`prova=PROVACOES.find(p=>p.key===${JSON.stringify(k)}); provaFim=null; campanha=null; st=montarProvacao(prova); pararRelogio(); render();`); }
    catch (e) { err = e.message; }
    if (err) quebradas.push(k + ': ' + err);
  }
  ok(keys.length === 90, `deveria varrer as 90 (varreu ${keys.length})`);
  ok(quebradas.length === 0, `toda Provação deveria RENDERIZAR sem quebrar (quebraram: ${quebradas.slice(0, 6).join(' | ')})`);
  console.log(`  ${keys.length} batalhas de Provação renderizadas · ${quebradas.length} quebras`);
}

console.log('== 2. TODO encontro de campanha renderiza (times fixos + chefe com HP inflado) ==');
{
  const encs = w.eval('CAMPANHA.encontros.map(e=>({id:e.id,fixo:!!e.aliados}))');
  const quebradas = [];
  for (const e of encs) {
    if (!e.fixo) continue;   // o de escolha de time monta pelo picker (coberto em campanha.test.js)
    err = null;
    try { w.eval(`campanha=CAMPANHA.encontros.find(x=>x.id===${JSON.stringify(e.id)}); campanhaFim=null; prova=null; st=montarProvacao(campanha); pararRelogio(); render();`); }
    catch (ex) { err = ex.message; }
    if (err) quebradas.push(e.id + ': ' + err);
  }
  ok(quebradas.length === 0, `todo encontro fixo deveria renderizar (quebraram: ${quebradas.join(' | ')})`);
  console.log(`  encontros de campanha renderizados · ${quebradas.length} quebras`);
}

console.log('== 3. a IA MOVE criaturas de bestiário e a tela re-renderiza (o outro caminho de runtime) ==');
{
  err = null;
  w.eval("prova=PROVACOES.find(p=>p.key==='bragi'); provaFim=null; campanha=null; st=montarProvacao(prova); st.ativo=1; ELEMS.forEach(e=>st.lados[1].orbs[e]=6);");
  let moves = 0;
  try {
    for (let i = 0; i < 6; i++) {
      const s = w.eval("(function(){var a=iaProximaAcao(st); if(a){agir(st,a.uid,a.slot,a.alvos,a.escolhas); return a.slot;} return null;})()");
      if (!s) break; moves++;
    }
    w.eval("render();");
  } catch (e) { err = e.message; }
  ok(moves > 0, 'a IA deveria conseguir mover ao menos uma criatura');
  ok(!err, `mover criatura + renderizar não deveria quebrar (erro: ${err})`);
  console.log(`  IA moveu ${moves} criaturas · render limpo`);
}

try { dom.window.close(); } catch (e) {}
if (falhas) { console.log(`\n>>> ${falhas} FALHA(S) na varredura de render`); process.exit(1); }
console.log('>>> RENDER-SWEEP OK');
process.exit(0);
