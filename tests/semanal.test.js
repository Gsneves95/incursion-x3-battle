// F3.4 — PROVAÇÃO SEMANAL: gerador perpétuo. O pool foi PRÉ-GERADO e provado VENCÍVEL pelo
// solucionador; aqui provamos o RUNTIME: determinístico pela semana ISO, todo puzzle monta e
// começa em andamento, e o PLACAR grava sob chave semanal (sem colidir com a Provação do deus).
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

let falhas = 0;
const ok = (c, m) => { if (!c) { console.log('  FALHA: ' + m); falhas++; } };
const abertos = [];
function sessao() {
  const html = fs.readFileSync(path.join(__dirname, '../dist/incursion.html'), 'utf8');
  const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://x/' });
  abertos.push(dom);
  const w = dom.window, d = w.document;
  return { w, d, $: s => d.querySelector(s), $$: s => [...d.querySelectorAll(s)] };
}

console.log('== 1. o pool existe, foi provado, e traz a taxa de tentativas (viabilidade) ==');
{
  const { w } = sessao();
  const n = w.eval('SEMANAIS.puzzles.length');
  ok(n >= 16, `o pool deveria ter puzzles (tem ${n})`);
  ok(w.eval('typeof SEMANAIS.mediaTentativas === "number"'), 'o pool registra a média de tentativas (métrica de viabilidade)');
  ok(w.eval('SEMANAIS.puzzles.every(p=>Array.isArray(p.aliados)&&Array.isArray(p.inimigos)&&Array.isArray(p.condicoes)&&typeof p.minimo==="number")'), 'todo puzzle carrega o que monta/avalia/pontua');
  console.log(`  pool ${n} · média de tentativas ${w.eval('SEMANAIS.mediaTentativas')} · máx ${w.eval('SEMANAIS.maxTentativas')}`);
}

console.log('== 2. DETERMINÍSTICO pela semana ISO: mesma semana → mesmo puzzle ==');
{
  const { w } = sessao();
  // semanaISO de datas conhecidas (ISO 8601)
  ok(w.eval('semanaISOAtual(new Date("2026-01-01"))') === 1, '2026-01-01 é semana ISO 1');
  ok(w.eval('semanaISOAtual(new Date("2026-08-28"))') === 35, '2026-08-28 é semana ISO 35');
  // duas leituras no mesmo instante → puzzle IDÊNTICO (o que garante "mesmo p/ todo jogador")
  const a = w.eval('JSON.stringify((({key,aliados,inimigos,condicoes})=>({key,aliados,inimigos,condicoes}))(provaSemanalAtual()))');
  const b = w.eval('JSON.stringify((({key,aliados,inimigos,condicoes})=>({key,aliados,inimigos,condicoes}))(provaSemanalAtual()))');
  ok(a === b, 'duas leituras da mesma semana dão o mesmo puzzle');
  // o índice é semana % tamanho-do-pool
  const idxOk = w.eval('(function(){var wk=semanaISOAtual();var p=SEMANAIS.puzzles[((wk%SEMANAIS.puzzles.length)+SEMANAIS.puzzles.length)%SEMANAIS.puzzles.length];return p.key===provaSemanalAtual().key;})()');
  ok(idxOk, 'o puzzle da semana é pool[semanaISO % tamanho]');
}

console.log('== 3. todo puzzle do pool MONTA e começa em ANDAMENTO (o solver já provou vencível) ==');
{
  const { w } = sessao();
  const r = w.eval(`(function(){
    var erros=[];
    for(var i=0;i<SEMANAIS.puzzles.length;i++){
      var p=SEMANAIS.puzzles[i];
      try{ var s=montarProvacao(p);
        if(s.lados[0].units.length!==3||s.lados[1].units.length!==3) erros.push(i+":montagem");
        var av=avaliarProvacao(s,p); if(av.resultado!=="andamento") erros.push(i+":"+av.resultado);
      }catch(e){ erros.push(i+":"+e.message); }
    }
    return {n:SEMANAIS.puzzles.length, erros};
  })()`);
  ok(r.erros.length === 0, `todo puzzle monta e começa andamento (falhas: ${r.erros.slice(0, 6).join(', ')})`);
  console.log(`  ${r.n} puzzles montam e avaliam em andamento`);
}

console.log('== 4. o banner joga a semanal; o placar grava sob chave SEMANAL (sem colidir) ==');
{
  const { w, $ } = sessao();
  w.eval("ir('provacoes'); render();");
  const b = $('.psem[data-semanal]');
  ok(!!b && /PROVAÇÃO DA SEMANA/.test(b.textContent), 'o banner da semana aparece no topo da lista');
  b.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  w.eval("vsCPU=false; pararRelogio();");
  ok(w.eval("rotaAtual()") === 'batalha' && w.eval('!!(prova&&prova.semanal)'), 'tocar o banner entra na Provação semanal');
  const sk = w.eval('prova.scoreKey');
  ok(/^semanal:W\d+$/.test(sk), `a chave de placar é semanal (${sk})`);
  const godKey = w.eval('prova.key');
  w.eval("st.lados[1].units.forEach(u=>{u.vivo=false;u.hp=0;}); st.fim={tipo:'fim',resultado:'vitoria',lado:0}; provaLances=13; render();");
  ok(w.eval(`perfil.provacoes[${JSON.stringify(sk)}] && perfil.provacoes[${JSON.stringify(sk)}].lances===13`), 'o placar grava sob a chave semanal');
  ok(w.eval(`!perfil.provacoes[${JSON.stringify(godKey)}] || perfil.provacoes[${JSON.stringify(godKey)}].lances!==13`), 'não colide com a Provação regular do mesmo deus');
  ok(/PROVAÇÃO VENCIDA/.test($('.result--prova').textContent) && /Concluída em/.test($('.result--prova').textContent), 'overlay de vitória com o placar');
}

for (const dom of abertos) try { dom.window.close(); } catch (e) {}
if (falhas) { console.log(`\n>>> ${falhas} FALHA(S) na Provação semanal`); process.exit(1); }
console.log('>>> SEMANAL OK');
process.exit(0);
