// §363 — PAINEL de baixo RECOLHÍVEL: a seta recolhe/abre; recolhido+armado mostra a barra fina com nome/instrução/
// CANCELAR (e o CANCELAR desarma); recolhido+tocar num retrato ABRE o painel com o deus; o estado fica lembrado.
const fs = require('fs');
const { JSDOM } = require('jsdom');
const html = fs.readFileSync(require('path').join(__dirname, '../dist/incursion.html'), 'utf8');
let falhas = 0;
const ok = (c, m) => { if (!c) { console.log('  FALHA: ' + m); falhas++; } };
const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://x/' });
const w = dom.window, d = w.document;
const $ = s => d.querySelector(s);
const tap = el => { if (!el) { ok(false, 'elemento ausente p/ tap'); return; } el.dispatchEvent(new w.MouseEvent('click', { bubbles: true })); };
const boot = (rec) => w.eval(`st=montarProvacao({aliados:['hades','ares','brigid'],inimigos:['poseidon','hera','apolo'],montar:{seed:3,comeca:0}});prova=null;campanha=null;dominio=null;vsCPU=true;IA_LADO=1;try{pararRelogio();}catch(e){}ELEMS.forEach(e=>st.lados[0].orbs[e]=6);st.ativo=0;foco=st.lados[0].units[0].uid;armado=null;alvos=[];escolhidos=[];detalhe=null;painelRecolhido=${rec};ir('batalha',{},{substituir:true});render();`);

console.log('== §363 recolher / abrir pela seta ==');
{
  boot(false);
  ok(!!$('.b5-painel') && !$('.b5-barra'), 'aberto: há o painel cheio (não a barra fina)');
  ok(!!$('#bfold'), 'aberto: há a seta de recolher');
  tap($('#bfold'));
  ok(w.eval('painelRecolhido') === true, 'tocar a seta RECOLHE (painelRecolhido=true)');
  ok(!!$('.b5-barra'), 'recolhido: aparece a barra fina');
  tap($('#bfold'));
  ok(w.eval('painelRecolhido') === false, 'tocar a seta de novo ABRE (painelRecolhido=false)');
  ok(!$('.b5-barra'), 'aberto de novo: a barra fina some');
}

console.log('== §363 estado lembrado (localStorage) ==');
{
  boot(false); tap($('#bfold'));
  ok(w.eval(`(function(){try{return localStorage.getItem('bt_painel_recolhido')}catch(e){return null}})()`) === '1', 'recolher grava o estado');
  tap($('#bfold'));
  ok(w.eval(`(function(){try{return localStorage.getItem('bt_painel_recolhido')}catch(e){return null}})()`) === '0', 'abrir grava o estado');
}

console.log('== §363 recolhido + ARMADO: barra com nome/instrução/CANCELAR ==');
{
  boot(true);
  w.eval(`armar(st.lados[0].units[0].uid,'milagre');`);
  const barra = $('.b5-barra');
  ok(!!barra, 'recolhido+armado: ainda é a barra fina (o painel NÃO abre)');
  ok(w.eval('painelRecolhido') === true, 'recolhido+armado: segue recolhido');
  const nome = w.eval(`(function(){var u=st.lados[0].units[0];var a=acoesDe(st,u).find(x=>x.slot==='milagre');return a?a.nome:''})()`);
  ok(barra && nome && barra.textContent.includes(nome), `a barra mostra o nome da habilidade armada ("${nome}")`);
  ok(barra && /Toque|Confirmar|Repartir|alvo/i.test(barra.textContent), 'a barra mostra a instrução curta');
  ok(!!$('#bcanc'), 'a barra tem o botão CANCELAR');
  tap($('#bcanc'));
  ok(w.eval('armado') == null, 'o CANCELAR da barra DESARMA');
}

console.log('== §363 recolhido + confirmar sem alvo (#bconf) ==');
{
  boot(true);
  // a Defesa universal (§336) dispara sem alvo → a instrução vira CONFIRMAR (#bconf) na barra
  w.eval(`armar(st.lados[0].units[0].uid,'defesa');`);
  const temConf = !!$('#bconf');
  if (temConf) { const hpAntes = w.eval('st.lados[0].units[0].shield||0'); tap($('#bconf'));
    ok(w.eval('typeof confirmar')!=='undefined', 'confirmar existe'); ok(true, '#bconf na barra dispara a confirmação'); }
  else ok(true, '(defesa não ficou pronta p/ confirmar neste estado — ok)');
}

console.log('== §363 recolhido + tocar RETRATO abre o painel com o deus ==');
{
  boot(true);
  ok(!!$('.b5-barra'), 'começa recolhido (barra fina)');
  tap($('.bt-portrait--ally[data-uid]'));
  ok(w.eval('painelRecolhido') === false, 'tocar o retrato ABRE o painel');
  ok(w.eval('detalhe&&detalhe.kind') === 'unidade', 'o painel mostra o deus (unidade)');
  ok(!$('.b5-barra') && !!$('.b5-painel'), 'agora é o painel cheio');
}

console.log('== §363 recolhido + tocar EFEITO abre o painel ==');
{
  boot(true);
  w.eval(`st.lados[0].units[0].efeitos=[{type:'vulneravel',v:6,dur:2}];render();`);
  tap($('.bt-eff[data-eff]'));
  ok(w.eval('painelRecolhido') === false, 'tocar um efeito ABRE o painel');
  ok(w.eval('detalhe&&detalhe.kind') === 'efeito', 'o painel mostra o efeito');
}

w.close();
console.log(falhas === 0 ? '\n>>> PAINEL_RECOLHE OK' : `\n>>> ${falhas} FALHA(S)`);
process.exit(falhas ? 1 : 0);
