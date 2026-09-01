// F3.1 — o LAÇO da Provação no bundle real: lista → batalha → avaliação → desbloqueio,
// a condição visível durante, e as TRÊS derrotas distintas (HP, prazo, condição).
// Dirige o dist em jsdom (o mesmo caminho do jogador: toca a linha, entra na batalha).
const fs = require('fs');
const { JSDOM } = require('jsdom');
const html = fs.readFileSync(require('path').join(__dirname, '../dist/incursion.html'), 'utf8');

let falhas = 0;
const ok = (c, m) => { if (!c) { console.log('  FALHA: ' + m); falhas++; } };
const abertos = [];

// entra numa Provação e CONGELA o tabuleiro (vsCPU=false trava a IA autônoma; pararRelogio
// mata o setInterval do relógio) para as asserções lerem um estado estável e o processo sair.
function entrar(key) {
  const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://x/' });
  abertos.push(dom);
  const w = dom.window, d = w.document;
  const ctx = { w, d, $: s => d.querySelector(s), $$: s => [...d.querySelectorAll(s)] };
  w.eval("ir('desafios'); render();");   // §213: o hub de Desafios lista os pergaminhos
  const linha = ctx.$(`.prow[data-prova="${key}"]`);
  if (linha) linha.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  else w.eval(`iniciarProva(${JSON.stringify(key)})`);   // genérica (durga): fora da lista, mas jogável direto — fixture de FLUXO
  w.eval("vsCPU=false; pararRelogio(); render();");   // congela: sem IA, sem relógio
  return ctx;
}
const KEY = 'durga';   // genérica: deadline 14 + semPerderAliado{durga}, aliados durga/perseu/oxum. Fixture de fluxo (não de lista).

console.log('== 1. entrar na Provação: monta o estado e mostra o HUD ==');
{
  const { w, $ } = entrar(KEY);
  ok(w.eval("rotaAtual()") === 'batalha', 'iniciar a Provação entra na batalha');
  ok(w.eval('!!prova && prova.key==="' + KEY + '"'), 'a Provação ativa deveria ser a tocada');
  ok(w.eval('st.lados[0].units.map(u=>u.key).join(",")') === 'durga,perseu,oxum', 'o estado montou os aliados da Provação');
  ok(w.eval('st.lados[1].units.map(u=>u.key).join(",")') === 'saci,loki,cuca', 'o estado montou os inimigos da Provação');
  ok(!!$('.phud'), 'o HUD da condição deveria aparecer na batalha');
  ok(/T\s*1/.test($('.phud').textContent) && /14/.test($('.phud').textContent), 'o HUD deveria mostrar o prazo (T1/14) na faixa');
  ok(/Mantenha Durga/.test($('.phud').textContent), 'o HUD deveria descrever a condição de manter o título de pé');
  console.log('  HUD: ' + $('.phud').textContent.replace(/\s+/g, ' ').trim());
}

console.log('== 2. VITÓRIA: SEM desbloqueio de deus (§212) — maestria + placar, mostra o overlay ==');
{
  const { w, $ } = entrar(KEY);
  const antes = w.eval('Object.keys(perfil.deuses).length');
  w.eval("st.lados[1].units.forEach(u=>{u.vivo=false;u.hp=0;}); st.fim={tipo:'fim',resultado:'vitoria',lado:0}; provaLances=11; render();");
  ok(w.eval('!!provaFim && provaFim.resultado==="vitoria"'), 'a Provação deveria latch em vitória');
  ok(w.eval('Object.keys(perfil.deuses).length') === antes, 'a vitória NÃO adiciona deus (coleção = só gacha, §212)');
  ok(w.eval(`perfil.provacoes && perfil.provacoes.${KEY} && perfil.provacoes.${KEY}.lances===11`), 'o placar (lances) deveria ser gravado no perfil');
  ok(w.eval(`!!(perfil.maestria && perfil.maestria.${KEY} && perfil.maestria.${KEY}.vitorias>=1)`), 'a maestria avança (cosmética)');
  const ov = $('.result--prova');
  ok(!!ov && /PERGAMINHO VENCIDO/.test(ov.textContent), 'o overlay de vitória deveria aparecer (Pergaminho)');
  ok(/Vencido em/.test(ov.textContent) && /11/.test(ov.textContent), 'o placar deveria mostrar os lances');
  ok(/melhor conhecido/.test(ov.textContent), 'o placar deveria citar o mínimo do solucionador');
  $('#pfvoltar').dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  ok(w.eval("rotaAtual()") === 'desafios', 'voltar leva à tela de Desafios');
  ok(w.eval('prova===null'), 'sair da Provação limpa o estado ativo');
}

console.log('== 3. DERROTA POR HP: seus deuses tombam ==');
{
  const { w, $ } = entrar(KEY);
  w.eval("st.fim={tipo:'fim',resultado:'vitoria',lado:1}; render();");
  ok(w.eval('provaFim && provaFim.categoria==="hp"'), 'derrota por HP deveria ser categoria hp');
  ok(w.eval('!(perfil.deuses && perfil.deuses.durga)'), 'derrota NÃO desbloqueia o deus');
  ok(/DERROTA/.test($('.result--prova').textContent) && /tombaram/.test($('.result--prova').textContent), 'o overlay deveria dizer que os deuses tombaram');
}

console.log('== 4. DERROTA POR PRAZO: passou do limite de turnos ==');
{
  const { w, $ } = entrar(KEY);
  w.eval("st.turno=15; render();");
  ok(w.eval('provaFim && provaFim.categoria==="prazo"'), 'passar do prazo deveria ser categoria prazo');
  ok(/PRAZO ESGOTADO/.test($('.result--prova').textContent), 'o overlay deveria anunciar o prazo esgotado');
}

console.log('== 5. DERROTA POR CONDIÇÃO: o título protegido caiu ==');
{
  const { w, $ } = entrar(KEY);
  w.eval("st.log.push({tipo:'queda',alvo:'durga',turno:st.turno}); render();");
  ok(w.eval('provaFim && provaFim.categoria==="condicao"'), 'quebrar a condição deveria ser categoria condicao');
  ok(/CONDIÇÃO QUEBRADA/.test($('.result--prova').textContent), 'o overlay deveria anunciar a condição quebrada');
  ok(/Durga/.test($('.result--prova').textContent), 'o overlay deveria nomear o que faltou (manter Durga de pé)');
}

console.log('== 6. as 90 Provações montam e começam em andamento ==');
{
  const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://x/' });
  abertos.push(dom);
  const r = dom.window.eval(`(function(){
    let erros=[];
    for(const p of PROVACOES){
      try{ const s=montarProvacao(p);
        if(!s.lados||s.lados[0].units.length!==3||s.lados[1].units.length===0) erros.push(p.key+':montagem');
        const av=avaliarProvacao(s,p); if(av.resultado!=='andamento') erros.push(p.key+':'+av.resultado);
      }catch(e){ erros.push(p.key+':'+e.message); }
    }
    return {n:PROVACOES.length, erros};
  })()`);
  ok(r.n === 90, `deveria haver 90 Provações jogáveis (tem ${r.n})`);
  ok(r.erros.length === 0, `todas deveriam montar e começar em andamento (falhas: ${r.erros.slice(0, 8).join(', ')})`);
  console.log(`  ${r.n} Provações montam e avaliam em andamento no turno 1`);
}

console.log('== 7. batalha com inimigos do BESTIÁRIO renderiza (regressão: retrato lia GODS, não o catálogo da partida) ==');
{
  const { w, $$ } = entrar('bragi');   // bragi enfrenta vidente_corrompido/aparicao/golem_runico (criaturas PvE)
  ok(w.eval("rotaAtual()") === 'batalha', 'a Provação de bestiário entra na batalha');
  ok($$('.unit--enemy').length === 3, 'os 3 inimigos-criatura renderizam (sem quebrar em GODS[key] indefinido)');
}

for (const dom of abertos) try { dom.window.close(); } catch (e) {}
if (falhas) { console.log(`\n>>> ${falhas} FALHA(S) no laço de Provação`); process.exit(1); }
console.log('>>> PROVAÇÃO-LAÇO OK');
process.exit(0);
