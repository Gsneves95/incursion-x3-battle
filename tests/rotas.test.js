// Navegação (F0.2). Parte 1: o roteador puro em isolamento. Parte 2: integração
// jsdom sobre o build, provando que o relógio REAL zera ao sair da batalha.
const R = require('../src/rotas.js');
let f = 0; const ok = (c, m) => { if (!c) { console.log('  FALHA: ' + m); f++; } };

console.log('== ir / rotaAtual / params ==');
{
  R.resetRotas();
  R.registrar('a', {}); R.registrar('b', {});
  R.ir('a', { x: 1 });
  ok(R.rotaAtual() === 'a', 'rotaAtual deveria ser a');
  ok(R.paramsAtuais().x === 1, 'params deveriam viajar com a rota');
  R.ir('b');
  ok(R.rotaAtual() === 'b', 'ir empilha e troca o topo para b');
  console.log('  a -> b, params preservados');
}

console.log('== profundidade e voltar (inicial > deuses > ficha) ==');
{
  R.resetRotas();
  ['inicial', 'deuses', 'ficha'].forEach(r => { R.registrar(r, {}); R.ir(r); });
  ok(R.rotaAtual() === 'ficha', 'topo deveria ser ficha');
  ok(R.voltar() === true && R.rotaAtual() === 'deuses', 'voltar 1x -> deuses');
  ok(R.voltar() === true && R.rotaAtual() === 'inicial', 'voltar 2x -> inicial');
  console.log('  voltar duas vezes chega na inicial');
}

console.log('== pilha vazia / raiz ==');
{
  ok(R.voltar() === false, 'voltar na raiz (1 item) devolve false');
  ok(R.rotaAtual() === 'inicial', 'e não mexe na rota');
  R.resetRotas();
  ok(R.voltar() === false, 'voltar com pilha vazia devolve false');
  ok(R.rotaAtual() === null, 'sem rota, rotaAtual é null');
  console.log('  raiz e pilha vazia devolvem false sem quebrar');
}

console.log('== ordem dos ganchos aoEntrar/aoSair ==');
{
  R.resetRotas();
  const log = [];
  R.registrar('sel', { aoEntrar: () => log.push('entra-sel'), aoSair: () => log.push('sai-sel') });
  R.registrar('bat', { aoEntrar: () => log.push('entra-bat'), aoSair: () => log.push('sai-bat') });
  R.ir('sel');
  R.ir('bat', {}, { substituir: true });
  ok(log.join(',') === 'entra-sel,sai-sel,entra-bat', `ordem errada: ${log.join(',')}`);
  console.log('  ' + log.join(' · '));
}

console.log('== batalha não entra na pilha; voltar não abandona a partida ==');
{
  R.resetRotas();
  R.registrar('selecao', {}); R.registrar('batalha', {});
  R.ir('selecao');
  R.ir('batalha', {}, { substituir: true });   // substitui, não empilha
  ok(R.rotaAtual() === 'batalha', 'batalha é o topo');
  ok(R.NAV.pilha.length === 1, `batalha deveria SUBSTITUIR a seleção (pilha=1, tem ${R.NAV.pilha.length})`);
  ok(R.voltar() === false, 'voltar durante a batalha devolve false (não abandona)');
  ok(R.rotaAtual() === 'batalha', 'segue na batalha após tentar voltar');
  console.log('  batalha isolada na pilha; voltar bloqueado');
}

console.log('== sair da batalha zera o relógio (contador sintético) ==');
{
  R.resetRotas();
  let timers = 0;
  R.registrar('selecao', {});
  R.registrar('batalha', { aoEntrar: () => { timers++; }, aoSair: () => { timers--; } });
  R.ir('selecao');
  R.ir('batalha', {}, { substituir: true });
  ok(timers === 1, 'ao entrar na batalha, 1 timer ativo');
  R.ir('selecao', {}, { substituir: true });
  ok(timers === 0, `ao sair da batalha, nenhum timer ativo (tem ${timers})`);
  console.log('  aoEntrar liga, aoSair desliga: nenhum vazamento');
}

console.log('== integração jsdom: o relógio REAL (tick) zera ao sair da batalha ==');
{
  const { JSDOM } = require('jsdom');
  const fs = require('fs'), path = require('path');
  const html = fs.readFileSync(path.join(__dirname, '..', 'dist', 'incursion.html'), 'utf8');
  const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true });
  const w = dom.window;
  ok(w.eval("rotaAtual()") === 'selecao', 'o app abre na seleção');
  // entra na batalha pela API pública, sem depender de toques
  w.eval("st=novoEstado(['zeus','ogum','tyr'],['sobek','brigid','ganesha'],1,0); ir('batalha',{},{substituir:true}); render();");
  ok(w.eval('tick') !== null, 'na batalha o relógio está ativo (tick != null)');
  ok(w.eval("rotaAtual()") === 'batalha', 'rota é batalha');
  w.eval("ir('selecao',{},{substituir:true}); render();");
  ok(w.eval('tick') === null, 'ao sair da batalha, o relógio foi limpo (tick === null)');
  ok(w.eval("rotaAtual()") === 'selecao', 'voltou para a seleção');
  console.log('  tick != null na batalha, tick === null ao sair');

  // V1: partida ENCERRADA — o tique não conta nem encerra o turno (a rota segue
  // 'batalha' enquanto o resultado aparece; a guarda st.fim tem de segurar).
  w.eval("st=novoEstado(['zeus','ogum','tyr'],['sobek','brigid','ganesha'],1,0); ir('batalha',{},{substituir:true}); render();");
  w.eval("st.fim={tipo:'fim',resultado:'vitoria',lado:0};");
  const relAntes = w.eval('relogio'), turnoAntes = w.eval('st.turno'), ativoAntes = w.eval('st.ativo');
  w.eval('tique(); tique(); tique();');   // avança o relógio três vezes, à mão
  ok(w.eval('relogio') === relAntes, `com a partida encerrada, o relógio não muda (era ${relAntes}, ficou ${w.eval('relogio')})`);
  ok(w.eval('st.turno') === turnoAntes && w.eval('st.ativo') === ativoAntes, 'com a partida encerrada, nenhum turno é encerrado');
  w.eval('pararRelogio();');
  console.log('  partida encerrada: tique não conta nem passa o turno');
}

console.log('');
console.log(f === 0 ? '>>> ROTAS OK' : `>>> ${f} FALHA(S)`);
process.exit(f ? 1 : 0);
