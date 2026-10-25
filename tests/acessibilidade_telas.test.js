// §358 — ACESSIBILIDADE das três telas consertadas (Coleção, Ficha, Níveis), medida pela MESMA ferramenta da
// auditoria §357 (tools/auditoria_medida.js), no viewport de referência 780×360. EXIGE a=0, b=0, c=0, d=0 em TODOS
// os estados: nenhum texto < 12px (corpo) / < 11px (rótulo), nenhum toque < 40×40, NENHUMA rolagem fora da lista
// branca, NENHUM corte (reticência em info importante / estouro do viewport). Falha a suíte se alguma regressão voltar.
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { medirNaPagina, CFG } = require('../tools/auditoria_medida.js');

function acharChromium() {
  if (process.env.INCURSION_CHROMIUM) return process.env.INCURSION_CHROMIUM;
  try { const base = '/opt/pw-browsers'; const d = fs.readdirSync(base).filter(x => /^chromium-\d+$/.test(x)).sort().pop(); const b = path.join(base, d, 'chrome-linux', 'chrome'); if (fs.existsSync(b)) return b; } catch (e) {}
  return undefined;
}
let falhas = 0;
const ok = (c, m) => { if (!c) { falhas++; console.log('  XX ' + m); } else console.log('  ok ' + m); };
const distAbs = 'file://' + path.resolve(__dirname, '..', 'dist', 'incursion.html');

// perfil base: roster possuído + níveis/pontos do zeus (p/ a ficha/níveis mostrarem conteúdo real).
const BASE = `try{
  perfil.deuses={}; ROSTER.slice(0,60).forEach(e=>perfil.deuses[e.key]={copias:2,obtidoEm:Date.now()});
  contaAtual={nick:'Herói',perfil,niveis:{zeus:{basico:2,habilidade:4,milagre:1}},pontos:{zeus:9},ranque:{pontos:1200},missoes:{ativa:null,progresso:{},liberados:[]}};
}catch(e){}`;

// §362: BOOT da batalha (uma Provação sandbox: 3 aliados × 3 inimigos, meu turno, 6 tipos de energia).
const BTBOOT = `st=montarProvacao({aliados:['hades','babi','zeus'],inimigos:['poseidon','hera','apolo'],montar:{seed:3,comeca:0}});prova=null;campanha=null;dominio=null;vsCPU=true;IA_LADO=1;try{pararRelogio();}catch(e){}try{ELEMS.forEach(e=>st.lados[0].orbs[e]=9);}catch(e){}st.ativo=0;foco=st.lados[0].units[0].uid;armado=null;detalhe=null;resumoTurno=null;menuAberto=false;ov=null;ir('batalha',{},{substituir:true});render();`;

// §365: HUB do Domínio — semeia a corrida no estado pedido (reusa o padrão do dominio_hub.test).
const DOMHUB = estado => `(function(){
  var lads=dominioLadders(),lad=lads[0],c=String(lad.cultura).toLowerCase(),tot=domTotalNiveis(lad),sem=semanaInfo(lad);
  perfil.dominios=perfil.dominios||{porDominio:{}}; perfil.dominios.porDominio=perfil.dominios.porDominio||{};
  var prog=perfil.dominios.porDominio[c]={run:null,melhorSempre:24,semanas:{}}; prog.semanas[sem.chaveAnt]=18; prog.semanas[sem.chave]=12;
  var team=['zeus','ogum','tyr'],vida=[{hp:84,vivo:true},{hp:37,vivo:true},{hp:0,vivo:false}];
  function mk(o){return Object.assign({cultura:lad.cultura,time:team.slice(),semanaIdx:sem.idx,semana:sem.chave,marcaAnterior:18,nivel:12,vida:vida.map(function(v){return Object.assign({},v)}),bonus:0.2,reviveGasto:[],profundidade:11,status:'ativo',aguardandoPremio:false,id:'t'},o);}
  var E=${JSON.stringify(estado)};
  if(E==='andamento') prog.run=mk({});
  else if(E==='premio') prog.run=mk({nivel:20,profundidade:20,aguardandoPremio:true});
  else if(E==='nova') prog.run=null;
  else if(E==='morto') prog.run=mk({status:'morto',nivel:12,profundidade:11});
  else if(E==='completo') prog.run=mk({status:'completo',nivel:tot,profundidade:tot,vida:[{hp:84,vivo:true},{hp:37,vivo:true},{hp:50,vivo:true}]});
  ir('dominio',{cultura:c},{substituir:true}); render();
})();`;

const ESTADOS = {
  'Coleção — sem filtro': `colF={busca:'',cultura:'',classe:'',funcao:'',elem:'',status:'',raridade:'',ordem:'recentes'};ir('colecao',{},{substituir:true});render();`,
  'Coleção — com filtro': `colF={busca:'',cultura:'',classe:'',funcao:'Controlador',elem:'Aurora',status:'tem',raridade:'',ordem:'nome'};ir('colecao',{},{substituir:true});render();`,
  'Ficha — possuída': `fichaAba='habilidades';deusSel='milagre';deusSelKey=null;ir('deus',{key:'zeus'},{substituir:true});render();`,
  // §358b: a PASSIVA mostra o texto completo (não só "não gasta a ação") — deus com passiva longa (Anúbis, possuído).
  'Ficha — passiva (texto completo)': `perfil.deuses.anubis={copias:1,obtidoEm:Date.now()};fichaAba='habilidades';deusSel='passiva';deusSelKey=null;ir('deus',{key:'anubis'},{substituir:true});render();`,
  'Ficha — SINERGIA aberta': `fichaAba='sinergia';deusSelKey=null;ir('deus',{key:'zeus'},{substituir:true});render();`,
  // pior caso de missão: o deus com o requisito de Provação mais longo, NÃO possuído.
  'Ficha — não possuída (pior missão)': `(function(){var best={len:0,k:'anubis'};try{for(var kk in MISSOES.missoes){var t=reqMissaoTexto(kk)||'';if(t.length>best.len)best={len:t.length,k:kk};}}catch(e){}delete perfil.deuses[best.k];fichaAba='habilidades';deusSelKey=null;ir('deus',{key:best.k},{substituir:true});render();})();`,
  // NÍVEIS — 4 estados: (1) pode subir + máximo juntos; (2) sem pontos (FALTAM); (3) confirmando; (4) sem conexão.
  'Níveis — pode subir / máximo': `contaAtual.pontos={zeus:9};contaAtual.niveis={zeus:{basico:2,habilidade:4,milagre:1}};nlConfirm=null;nlPendente=false;nlMsg=null;nlSelKey=null;ir('niveis',{key:'zeus'},{substituir:true});render();`,
  'Níveis — sem pontos (FALTAM)': `contaAtual.pontos={zeus:0};contaAtual.niveis={zeus:{basico:2,habilidade:2,milagre:1}};nlConfirm=null;nlPendente=false;nlMsg=null;nlSelKey=null;ir('niveis',{key:'zeus'},{substituir:true});render();`,
  'Níveis — confirmando': `contaAtual.pontos={zeus:9};contaAtual.niveis={zeus:{basico:2,habilidade:2,milagre:1}};nlSelKey='zeus';nlConfirm='basico';nlPendente=false;nlMsg=null;ir('niveis',{key:'zeus'},{substituir:true});render();`,
  'Níveis — sem conexão': `contaAtual=null;nlConfirm=null;nlPendente=false;nlMsg=null;nlSelKey=null;ir('niveis',{key:'zeus'},{substituir:true});render();`,
  // §359: MONTADORES de time (6 telas na base só) — todos no canvas 780×360.
  'Montar — Domínio': `montFiltroElem=null;montFiltroFunc=null;montBusca='';montKitAberto=null;montDica=false;domTimePick=[];ir('dominiomontar',{cultura:'grega'});render();`,
  'Montar — Campanha (troca aberta)': `montFiltroElem=null;montFiltroFunc=null;montBusca='';montKitAberto=null;montDica=false;ir('campanha',{},{substituir:true});render();campPicker=0;render();`,
  'Montar — Composição (cartão travado)': `montFiltroElem=null;montFiltroFunc=null;montBusca='';montKitAberto=null;montDica=false;desafioTimePick=[];var ds=desafios()[0];ir('desafiomontar',{id:ds.id});render();(function(){var byE={};_montJogaveis().forEach(k=>{(byE[HRM[k].elem]=byE[HRM[k].elem]||[]).push(k);});var el=Object.keys(byE).find(e=>byE[e].length>=3)||Object.keys(byE)[0];desafioTimePick=[byE[el][0]];render();})();`,
  'PvP — lobby': `montFiltroElem=null;montFiltroFunc=null;montBusca='';montKitAberto=null;montDica=false;contaTransporte={};contaAtual={nick:'Herói',perfil,ranque:{pontos:1206},missoes:{ativa:null,progresso:{},liberados:[]}};pvpTime=[];pvpEstado='idle';pvpRanqueado=false;pvpMsg='';ir('pvp',{},{substituir:true});render();`,
  'PvP — na fila': `montFiltroElem=null;montFiltroFunc=null;montBusca='';montKitAberto=null;montDica=false;contaTransporte={};contaAtual={nick:'Herói',perfil,ranque:{pontos:1206},missoes:{ativa:null,progresso:{},liberados:[]}};pvpTime=_montJogaveis().slice(0,3);pvpEstado='fila';pvpRanqueado=true;pvpMsg='';ir('pvp',{},{substituir:true});render();`,
  'Seleção — dois times': `montFiltroElem=null;montFiltroFunc=null;montBusca='';montKitAberto=null;montDica=false;vsCPU=true;ir('selecao',{novo:true});render();(function(){var ks=listaFiltrada().filter(jogavel);vez=0;for(var i=0;i<5&&i<ks.length;i++)commitPk(ks[i]);renderPick();})();`,
  'Seleção — Mais filtros aberto': `montFiltroElem=null;montFiltroFunc=null;montBusca='';montKitAberto=null;montDica=false;vsCPU=true;ir('selecao',{novo:true});render();painelFiltro=true;renderPick();`,
  'Kit "i" (deus de maior descrição)': `montFiltroElem=null;montFiltroFunc=null;montBusca='';montKitAberto=null;montDica=false;domTimePick=[];ir('dominiomontar',{cultura:'grega'});render();montKitAberto='odin';render();`,
  // §360: DESAFIOS (grid de deuses) + COMPOSIÇÃO — canvas 780×360. Os 7 estados do §339 estão cobertos entre
  // os dois primeiros renders: COMPRAR/comprando/em andamento/confirmando desistência/recarga/Mestre no estado
  // "estados", e a trava "Onde ganhar Essência?" (sem Essência / sem conexão) no estado "sem conexão".
  'Desafios — estados (comprar/comprando/andamento/desistir/recarga/Mestre)': `contaAtual={perfil:{moedas:{gema:0,essencia:1240},desafios:{poseidon:{ativo:true},demeter:{ativo:true},atena:{ativo:false,recargaAte:Date.now()+12000000}}}};perfil.deuses={hades:1,poseidon:1,demeter:1,atena:1,apolo:1,ares:1,hera:1,afrodite:1};perfil.maestria={hades:{vitorias:30,milagre:true},atena:{vitorias:15},poseidon:{vitorias:8},demeter:{vitorias:5},apolo:{vitorias:6},ares:{vitorias:0},hera:{vitorias:2},afrodite:{vitorias:12}};perfil.provacoes={};desafioFiltro='todos';desafioOrdem='padrao';desafioComprando='apolo';desafioDesistindo='poseidon';desafioAjuda=false;ir('desafios');render();`,
  'Desafios — ajuda "?" aberta': `contaAtual={perfil:{moedas:{gema:0,essencia:1240},desafios:{}}};perfil.deuses={hades:1,poseidon:1,demeter:1,atena:1,apolo:1,ares:1,hera:1,afrodite:1};perfil.maestria={hades:{vitorias:30,milagre:true}};perfil.provacoes={};desafioFiltro='todos';desafioOrdem='padrao';desafioComprando=null;desafioDesistindo=null;desafioAjuda=true;ir('desafios');render();`,
  'Desafios — sem conexão (trava "Onde ganhar")': `contaAtual=null;perfil.deuses={hades:1,poseidon:1,demeter:1,atena:1,apolo:1,ares:1,hera:1,afrodite:1};perfil.maestria={hades:{vitorias:30,milagre:true}};perfil.provacoes={};desafioFiltro='todos';desafioOrdem='padrao';desafioComprando=null;desafioDesistindo=null;desafioAjuda=false;ir('desafios');render();`,
  'Composição — 1 cumprido + abertos': `perfil.deuses={zeus:1};perfil.provacoes={};var _ids=desafios().map(d=>d.id);perfil.provacoes['desafio:'+_ids[0]]={feito:true};ir('composicao');render();`,
  // §364: CAMPANHA no canvas 780×360. Seis estados cobrem os piores casos: batalha com consequências+kit revelado
  // (cap1-vi, todas as escolhas certas), o ato de TEXTO mais longo (Conselho, 819c, paginado), a ESCOLHA na vista
  // 'opções' (pista de 86c em 1 linha, full-width), uma HISTÓRIA sintética, um ato TRAVADO e a TROCA do emprestado aberta.
  'Campanha — batalha (consequências + kit revelado)': `perfil.campanha={capitulo:1,fase:0,concluidas:[],escolhas:{}};var caps=CAMPANHAS.capitulos;caps.forEach(c=>c.atos.forEach(a=>{if(a.id!=='cap1-vi')perfil.campanha.concluidas.push(a.id);}));caps.forEach(c=>c.atos.forEach(a=>{if(a.tipo==='escolha'&&a.certa)perfil.campanha.escolhas[a.id]=a.certa;}));var c1=caps.findIndex(c=>c.numero===1);campCapIdx=c1;campAtoIdx=caps[c1].atos.findIndex(a=>a.id==='cap1-vi');campVistaAto=null;ir('campanha',{},{substituir:true});render();`,
  'Campanha — texto mais longo (Conselho, 819c)': `perfil.campanha={capitulo:1,fase:0,concluidas:[],escolhas:{}};var caps=CAMPANHAS.capitulos;var f=null;caps.forEach((c,ci)=>c.atos.forEach((a,ai)=>{if(a.nome==='O Conselho Temporário')f={ci,ai};}));campCapIdx=f.ci;campAtoIdx=f.ai;campVistaAto=null;campEscolhaVista=null;ir('campanha',{},{substituir:true});render();`,
  'Campanha — escolha (opções inteiras, pista 86c)': `perfil.campanha={capitulo:1,fase:0,concluidas:[],escolhas:{}};var caps=CAMPANHAS.capitulos;var f=null;caps.forEach((c,ci)=>c.atos.forEach((a,ai)=>{if(a.nome==='O Conselho Temporário')f={ci,ai};}));campCapIdx=f.ci;campAtoIdx=f.ai;campVistaAto=null;ir('campanha',{},{substituir:true});render();campEscolhaVista='opções';render();`,
  'Campanha — história (sintético)': `var caps=CAMPANHAS.capitulos;var a=caps[0].atos[0];a.__tipo0=a.tipo;a.tipo='historia';perfil.campanha={capitulo:0,fase:0,concluidas:[],escolhas:{}};campCapIdx=0;campAtoIdx=0;campVistaAto=null;ir('campanha',{},{substituir:true});render();`,
  'Campanha — ato travado': `perfil.campanha={capitulo:1,fase:0,concluidas:[],escolhas:{}};var caps=CAMPANHAS.capitulos;var c1=caps.findIndex(c=>c.numero===1);campCapIdx=c1;campAtoIdx=caps[c1].atos.findIndex(a=>a.id==='cap1-vi');campVistaAto=null;ir('campanha',{},{substituir:true});render();`,
  'Campanha — troca do emprestado aberta': `perfil.campanha={capitulo:1,fase:0,concluidas:[],escolhas:{}};var caps=CAMPANHAS.capitulos;caps.forEach(c=>c.atos.forEach(a=>{if(a.id!=='cap1-vi')perfil.campanha.concluidas.push(a.id);}));var c1=caps.findIndex(c=>c.numero===1);campCapIdx=c1;campAtoIdx=caps[c1].atos.findIndex(a=>a.id==='cap1-vi');campVistaAto=null;ir('campanha',{},{substituir:true});render();campPicker=0;render();`,
  // §365: DOMÍNIOS no canvas 780×360 — a seleção dos 5, o "?" aberto, e o hub nos 5 estados (andamento c/ 1 caído,
  // chefe vencido, nova corrida, encerrada, conquistado). Tudo sem rolar, nada cortado.
  'Domínios — seleção dos 5': `ir('dominios',{},{substituir:true});render();`,
  'Domínios — ajuda "?" aberta': `ir('dominios',{},{substituir:true});render();abrirAjudaDominios();`,
  'Domínio HUB — em andamento (1 caído)': DOMHUB('andamento'),
  'Domínio HUB — chefe vencido (3 prêmios)': DOMHUB('premio'),
  'Domínio HUB — nova corrida': DOMHUB('nova'),
  'Domínio HUB — corrida encerrada': DOMHUB('morto'),
  'Domínio HUB — conquistado': DOMHUB('completo'),
  // §361: PROVAÇÕES — 5 estados no canvas 780×360 (ativa c/ máx de objetivos; prévia; confirmação; faixa espiada; offline).
  'Provações — ativa (4 objetivos)': `window.ativarProvacaoServidor=async()=>({ok:true});contaAtual={nick:'T',ranque:{pontos:5000,faixa:{chave:'semideus',nome:'Semideus'}},perfil:{deuses:{cerberus:{copias:1},zeus:{copias:1}}},missoes:{ativa:'hades',progresso:{hades:{ativadaEm:0,obj:[{seq:1},{vol:5},{vol:3,seqA:4,seqB:2},{vol:2}]}},liberados:[]}};provPrevia=null;provTrocaConfirm=null;provPendente=null;provFiltro='todas';provBusca='';provFaixaAba='todas';faixasEspiadas.clear();ir('provacoes',{},{substituir:true});render();`,
  'Provações — prévia de uma disponível': `window.ativarProvacaoServidor=async()=>({ok:true});contaAtual={nick:'T',ranque:{pontos:5000,faixa:{chave:'semideus',nome:'Semideus'}},perfil:{deuses:{cerberus:{copias:1},zeus:{copias:1}}},missoes:{ativa:'hades',progresso:{hades:{ativadaEm:0,obj:[{seq:1},{vol:5},{vol:3,seqA:4,seqB:2},{vol:2}]}},liberados:[]}};provPrevia=null;provTrocaConfirm=null;provPendente=null;provFiltro='todas';provBusca='';provFaixaAba='todas';faixasEspiadas.clear();ir('provacoes',{},{substituir:true});render();(function(){var c=document.querySelector('.pvc--disponivel[data-carta]');if(c){provPrevia=c.dataset.carta;render();}})();`,
  'Provações — confirmação de troca': `window.ativarProvacaoServidor=async()=>({ok:true});contaAtual={nick:'T',ranque:{pontos:5000,faixa:{chave:'semideus',nome:'Semideus'}},perfil:{deuses:{cerberus:{copias:1},zeus:{copias:1}}},missoes:{ativa:'hades',progresso:{hades:{ativadaEm:0,obj:[{seq:1},{vol:5},{vol:3,seqA:4,seqB:2},{vol:2}]}},liberados:[]}};provPrevia=null;provTrocaConfirm=null;provPendente=null;provFiltro='todas';provBusca='';provFaixaAba='todas';faixasEspiadas.clear();ir('provacoes',{},{substituir:true});render();(function(){var c=document.querySelector('.pvc--disponivel[data-carta]');if(c){provPrevia=c.dataset.carta;provTrocaConfirm=c.dataset.carta;render();}})();`,
  'Provações — faixa acima espiada (aba)': `window.ativarProvacaoServidor=async()=>({ok:true});contaAtual={nick:'T',ranque:{pontos:60,faixa:{chave:'suplicante',nome:'Suplicante'}},perfil:{deuses:{cerberus:{copias:1},zeus:{copias:1}}},missoes:{ativa:null,progresso:{},liberados:[]}};provPrevia=null;provTrocaConfirm=null;provPendente=null;provFiltro='todas';provBusca='';provFaixaAba='todas';faixasEspiadas.clear();ir('provacoes',{},{substituir:true});render();(function(){var c=faixaAtualIdx();var alvo=c+2;provFaixaAba=alvo;faixasEspiadas.add(alvo);render();})();`,
  'Provações — sem conexão': `contaAtual=null;provPrevia=null;provTrocaConfirm=null;provPendente=null;provFiltro='todas';provBusca='';provFaixaAba='todas';faixasEspiadas.clear();ir('provacoes',{},{substituir:true});render();`,
  // §362/§363: BATALHA — estados no canvas 780×360 (design do dono); §363 inclui a leitura de habilidade longa (campo curto).
  'Batalha — meu turno': BTBOOT,
  'Batalha — turno do oponente': BTBOOT + `st.ativo=1;IA_LADO=0;armado=null;detalhe=null;render();`,
  'Batalha — habilidade armada (desc + longa)': BTBOOT + `armar(st.lados[0].units[1].uid,'milagre');`,
  'Batalha — habilidade lida': BTBOOT + `lerHabilidade(st.lados[0].units[2].uid,'habilidade');`,
  // §363: ler uma habilidade de descrição LONGA deixa o painel alto → a fileira encolhe; a barra de vida vira faixa sobre a
  // base do retrato (hpOverlay) p/ o campo não transbordar sobre o painel (regressão do §363 — guarda nos dois modos).
  'Batalha — habilidade longa lida': BTBOOT + `lerHabilidade(st.lados[0].units[0].uid,'milagre');`,
  'Batalha — deus inspecionado': BTBOOT + `infoUnidade(st.lados[1].units[0].uid);`,
  'Batalha — efeito': BTBOOT + `st.lados[0].units[1].efeitos=[{type:'vulneravel',v:6,dur:2,origem:st.lados[1].units[0].uid}];infoEfeito(st.lados[0].units[1].uid,0);`,
  'Batalha — resumo da CPU': BTBOOT + `foco=null;resumoTurno=[{turno:st.turno,tipo:'acao',origem:'poseidon',slot:'milagre'},{turno:st.turno,tipo:'dano',origem:'poseidon',alvo:'hades',valor:14}];render();`,
  'Batalha — menu ☰ aberto': BTBOOT + `menuAberto=true;render();`,
  'Batalha — confirmar encerrar sem agir': BTBOOT + `ov='confirmEnc';render();`,
  'Batalha — caixa de energia com 6 tipos': BTBOOT + `infoUnidade(st.lados[0].units[0].uid);`,
};
// §363: os mesmos 10 estados da batalha também no modo RECOLHIDO (painel em barra fina; as ações de LER reabrem o painel).
for (const [nome, setup] of Object.entries(ESTADOS)) {
  if (/^Batalha/.test(nome)) ESTADOS[nome + ' · recolhido'] = 'painelRecolhido=true;' + setup;
}

(async () => {
  const browser = await chromium.launch({ executablePath: acharChromium(), headless: true, args: ['--no-sandbox'] });
  console.log('== §358 — acessibilidade das três telas (780×360, a=b=c=d=0) ==');
  for (const [nome, setup] of Object.entries(ESTADOS)) {
    const ctx = await browser.newContext({ viewport: { width: 780, height: 360 }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    await page.goto(distAbs, { waitUntil: 'load' });
    const err = await page.evaluate(([b, s]) => { try { eval(b); eval(s); } catch (e) { return String(e && e.message || e); } const g = document.getElementById('gsplash'); if (g) g.remove(); return null; }, [BASE, setup]);
    if (err) { ok(false, `${nome}: setup quebrou — ${err}`); await ctx.close(); continue; }
    const r = await page.evaluate(medirNaPagina, CFG);
    const det = s => s.slice(0, 4).map(x => x.sel + (x.px ? ' ' + x.px + 'px' : x.w ? ' ' + x.w + '×' + x.h : '') + (x.txt ? ' "' + x.txt.slice(0, 18) + '"' : '')).join(' | ');
    ok(r.a.length === 0, `${nome}: texto ≥12/11px (a=${r.a.length})` + (r.a.length ? ' → ' + det(r.a) : ''));
    ok(r.b.length === 0, `${nome}: toque ≥40×40 (b=${r.b.length})` + (r.b.length ? ' → ' + det(r.b) : ''));
    ok(r.c.length === 0, `${nome}: sem rolagem proibida (c=${r.c.length})` + (r.c.length ? ' → ' + r.c.map(x => x.sel).join(', ') : ''));
    ok(r.d.length === 0, `${nome}: sem corte (d=${r.d.length})` + (r.d.length ? ' → ' + det(r.d) : ''));
    await ctx.close();
  }

  // §362b — TAMANHOS MÍNIMOS da batalha (opção A do dono): em repouso o painel fica baixo e os RETRATOS/HABILIDADES
  // crescem (retrato ≥56, habilidade ≥52, aliados e inimigos); com a descrição MAIS LONGA armada o painel cresce p/ cima
  // e eles encolhem até o piso (retrato ≥46, habilidade ≥44). A barra de vida fica ABAIXO do retrato (não intersecta a
  // arte); não há mais botões "P"/"?"; tocar o retrato (sem arma) mostra o deus com a passiva no painel.
  console.log('\n== §362b — retratos e habilidades MAIORES (painel embaixo, opção A) ==');
  {
    // roster de passiva CURTA p/ os estados de repouso (isis 1 linha); nuwa traz a descrição de habilidade mais longa.
    // isis (passiva curta, 1 linha, sem buff recebido), ares/nuwa (passivas condicionais, paradas no turno 1 → sem
    // "AGINDO AGORA" no isis); nuwa traz a descrição de habilidade mais longa do jogo p/ o caso do painel alto.
    const B2 = `st=montarProvacao({aliados:['isis','ares','nuwa'],inimigos:['khnum','ganesha','ymir'],montar:{seed:3,comeca:0}});prova=null;campanha=null;dominio=null;vsCPU=true;IA_LADO=1;try{pararRelogio();}catch(e){}try{ELEMS.forEach(e=>st.lados[0].orbs[e]=9);}catch(e){}st.ativo=0;foco=st.lados[0].units[0].uid;armado=null;detalhe=null;resumoTurno=null;menuAberto=false;ov=null;ir('batalha',{},{substituir:true});render();{var g=document.getElementById('gsplash');if(g)g.remove();}`;
    const medir = async (setup) => {
      const ctx = await browser.newContext({ viewport: { width: 780, height: 360 }, deviceScaleFactor: 1 });
      const page = await ctx.newPage(); await page.goto(distAbs, { waitUntil: 'load' });
      const err = await page.evaluate(([b, s]) => { try { eval(b); eval(s); } catch (e) { return String(e && e.message || e); } return null; }, [BASE, setup]);
      const r = err ? { err } : await page.evaluate(() => {
        const H = el => Math.round(el.getBoundingClientRect().height);
        const ally = [...document.querySelectorAll('.bt-portrait--ally')], foe = [...document.querySelectorAll('.bt-portrait--foe')];
        const sk = [...document.querySelectorAll('.bt-skill')];
        // a barra de vida fica ABAIXO do retrato: topo da vida ≥ base do retrato (sem interseção com a arte)
        let hpIntersecta = 0;
        document.querySelectorAll('.bt-portrait--ally').forEach((p, i) => {
          const bloco = p.parentElement; const hp = bloco.querySelector('.bt-hp'); if (!hp) return;
          if (hp.getBoundingClientRect().top < p.getBoundingClientRect().bottom - 0.5) hpIntersecta++;
        });
        return { retAlly: Math.min(...ally.map(H)), retFoe: Math.min(...foe.map(H)), skill: Math.min(...sk.map(H)),
          hpIntersecta, nPas: document.querySelectorAll('[data-pas]').length, nIns: document.querySelectorAll('[data-inspect]').length };
      });
      await ctx.close(); return r;
    };
    // repouso: meu turno, deus inspecionado (isis), habilidade lida curta (isis básico)
    for (const [nome, extra] of [['meu turno', ''], ['deus inspecionado', `infoUnidade(st.lados[0].units[0].uid);`], ['habilidade lida curta', `lerHabilidade(st.lados[0].units[0].uid,'basico');`]]) {
      const r = await medir(B2 + extra);
      if (r.err) { ok(false, `§362b repouso ${nome}: setup quebrou — ${r.err}`); continue; }
      ok(r.retAlly >= 56 && r.retFoe >= 56, `§362b repouso ${nome}: retrato ≥56 (aliado ${r.retAlly}, inimigo ${r.retFoe})`);
      ok(r.skill >= 52, `§362b repouso ${nome}: habilidade ≥52 (${r.skill})`);
    }
    // descrição MAIS LONGA armada (nuwa habilidade, 157 chars): piso ≥46 / ≥44
    {
      const r = await medir(B2 + `armar(st.lados[0].units[2].uid,'habilidade');`);
      if (r.err) ok(false, `§362b armada-longa: setup quebrou — ${r.err}`);
      else {
        ok(r.retAlly >= 46 && r.retFoe >= 46, `§362b descrição mais longa armada: retrato ≥46 (aliado ${r.retAlly}, inimigo ${r.retFoe})`);
        ok(r.skill >= 44, `§362b descrição mais longa armada: habilidade ≥44 (${r.skill})`);
      }
    }
    // invariantes: vida abaixo do retrato (sem interseção), sem "P"/"?", tocar retrato mostra o deus com a passiva
    {
      const r = await medir(B2);
      ok(r.hpIntersecta === 0, `§362b: a barra de vida não intersecta a arte do retrato (${r.hpIntersecta} interseções)`);
      ok(r.nPas === 0 && r.nIns === 0, `§362b: não existem mais botões "P" nem "?" (P=${r.nPas}, ?=${r.nIns})`);
    }
    {
      const ctx = await browser.newContext({ viewport: { width: 780, height: 360 }, deviceScaleFactor: 1 });
      const page = await ctx.newPage(); await page.goto(distAbs, { waitUntil: 'load' });
      const kind = await page.evaluate(([b, s]) => { eval(b); eval(s);
        const el = document.querySelector('.bt-portrait--ally[data-uid]'); el && el.click();
        const d = (document.querySelector('.bt-panel__desc') || {}).textContent || '';
        return { kind: (typeof detalhe !== 'undefined' && detalhe && detalhe.kind), temPassiva: /secreto|imune|passiva/i.test(d) }; }, [BASE, B2]);
      ok(kind.kind === 'unidade', `§362b: tocar o retrato (sem arma) mostra o deus no painel (kind=${kind.kind})`);
      ok(kind.temPassiva, `§362b: o painel do deus traz a passiva`);
      await ctx.close();
    }
  }

  // §363 — habilidades maiores (altura da fileira) + painel recolhível (retratos/habilidades crescem).
  console.log('\n== §363 — habilidades maiores + painel recolhível ==');
  {
    const roster = `st=montarProvacao({aliados:['isis','ares','nuwa'],inimigos:['khnum','ganesha','ymir'],montar:{seed:3,comeca:0}});prova=null;campanha=null;dominio=null;vsCPU=true;IA_LADO=1;try{pararRelogio();}catch(e){}try{ELEMS.forEach(e=>st.lados[0].orbs[e]=9);}catch(e){}st.ativo=0;foco=st.lados[0].units[0].uid;armado=null;detalhe=null;`;
    const boot = rec => `painelRecolhido=${rec};` + roster + `ir('batalha',{},{substituir:true});render();{var g=document.getElementById('gsplash');if(g)g.remove();}`;
    const med = async (setup) => {
      const ctx = await browser.newContext({ viewport: { width: 780, height: 360 }, deviceScaleFactor: 1 });
      const page = await ctx.newPage(); await page.goto(distAbs, { waitUntil: 'load' });
      const r = await page.evaluate(([b, s]) => { eval(b); eval(s); const H = el => Math.round(el.getBoundingClientRect().height);
        return { ret: Math.min(...[...document.querySelectorAll('.bt-portrait--ally')].map(H)), sk: Math.min(...[...document.querySelectorAll('.bt-skill')].map(H)),
          panel: H(document.querySelector('.b5-painel')), barra: !!document.querySelector('.b5-barra') }; }, [BASE, setup]);
      await ctx.close(); return r;
    };
    const ab = await med(boot(false)), re = await med(boot(true));
    ok(ab.sk >= 68, `§363 item2: ABERTO habilidade ≥68px (${ab.sk})`);
    ok(!ab.barra && ab.panel >= 60 && ab.panel <= 72, `§363 item2: ABERTO o painel mantém a altura do §362d (~67, veio ${ab.panel})`);
    ok(re.barra && re.panel <= 48, `§363 item3a: RECOLHIDO o painel vira barra fina (~44, veio ${re.panel})`);
    ok(re.ret >= 64, `§363 item3b: RECOLHIDO retrato ≥64px (${re.ret})`);
    ok(re.sk >= 76, `§363 item3b: RECOLHIDO habilidade ≥76px (${re.sk})`);
  }

  // §365 — PAGINAÇÃO do texto da campanha pelo ESPAÇO REAL: nenhum ato que cabe numa página é paginado; e numa
  // página que não é a última, o texto ocupa ≥85% da área. (A medição é no DOM, 780×360.)
  console.log('\n== §365 — paginação do texto da campanha (preenche a página, sem cortar frase no vácuo) ==');
  {
    const ctx = await browser.newContext({ viewport: { width: 780, height: 360 }, deviceScaleFactor: 1 });
    const page = await ctx.newPage(); await page.goto(distAbs, { waitUntil: 'load' });
    await page.evaluate(b => { try { eval(b); } catch (e) {} }, BASE);
    // (a) nenhum ato real é paginado à toa (todos cabem numa página hoje) e nenhuma página transborda
    const real = await page.evaluate(() => {
      const out = []; const caps = CAMPANHAS.capitulos;
      for (let ci = 0; ci < caps.length; ci++) for (let ai = 0; ai < caps[ci].atos.length; ai++) {
        perfil.campanha = { capitulo: 1, fase: 0, concluidas: [], escolhas: {} };
        campCapIdx = ci; campAtoIdx = ai; campVistaAto = null; campEscolhaVista = null; campStoryPage = 0;
        ir('campanha', {}, { substituir: true }); render();
        const nav = document.querySelector('.camp__pag'); const n = nav ? +(nav.querySelector('.camp__pagn').textContent.split('/')[1]) : 1;
        let over = false, worst = 100;
        for (let p = 0; p < n; p++) { campStoryPage = p; render(); const t = document.querySelector('.camp__texto'); if (!t) continue;
          if (t.scrollHeight > t.clientHeight + 1) over = true; if (p < n - 1) worst = Math.min(worst, Math.round(100 * t.scrollHeight / t.clientHeight)); }
        out.push({ nome: caps[ci].atos[ai].nome, pags: n, over, worst });
      }
      return out;
    });
    const over = real.filter(r => r.over), subfill = real.filter(r => r.pags > 1 && r.worst < 85);
    ok(over.length === 0, `§365a: nenhuma página de ato transborda (${over.map(r => r.nome).join(', ') || 'ok'})`);
    ok(subfill.length === 0, `§365a: páginas não-últimas ocupam ≥85% (${subfill.map(r => r.nome + ' ' + r.worst + '%').join(', ') || 'ok'})`);
    // (b) um TEXTO sintético bem longo DEVE paginar, e cada página não-última ocupa ≥85% (prova de que preenche)
    const syn = await page.evaluate(() => {
      const caps = CAMPANHAS.capitulos; const a = caps[0].atos[0]; const velho = a.texto;
      a.texto = ('Os deuses caminharam sobre as ruínas do mundo partido, medindo o que restava e o que ainda podia ruir. ').repeat(12);
      perfil.campanha = { capitulo: 0, fase: 0, concluidas: [], escolhas: {} };
      campCapIdx = 0; campAtoIdx = 0; campVistaAto = null; campEscolhaVista = null; campStoryPage = 0;
      ir('campanha', {}, { substituir: true }); render();
      const nav = document.querySelector('.camp__pag'); const n = nav ? +(nav.querySelector('.camp__pagn').textContent.split('/')[1]) : 1;
      let worst = 100, over = false;
      for (let p = 0; p < n; p++) { campStoryPage = p; render(); const t = document.querySelector('.camp__texto'); if (t.scrollHeight > t.clientHeight + 1) over = true; if (p < n - 1) worst = Math.min(worst, Math.round(100 * t.scrollHeight / t.clientHeight)); }
      a.texto = velho; return { n, worst, over };
    });
    ok(syn.n >= 2, `§365b: um texto longo sintético é dividido em páginas (${syn.n})`);
    ok(!syn.over, `§365b: nenhuma página do texto longo transborda`);
    ok(syn.worst >= 85, `§365b: cada página não-última do texto longo ocupa ≥85% da área (pior ${syn.worst}%)`);
    await ctx.close();
  }

  // §366 — a GUARDA do ponto cego (conteúdo empurrado p/ fora da tela e escondido por overflow:hidden) pega de verdade:
  // num hub já correto (d=0), reverter a correção (reinserir conteúdo alto na coluna da direita) faz o d7 'fora-tela' acusar.
  console.log('\n== §366 — a guarda de conteúdo fora da tela acusa quando o conteúdo é empurrado p/ fora ==');
  {
    const ctx = await browser.newContext({ viewport: { width: 780, height: 360 }, deviceScaleFactor: 1 });
    const page = await ctx.newPage(); await page.goto(distAbs, { waitUntil: 'load' });
    await page.evaluate(([b, s]) => { try { eval(b); eval(s); } catch (e) {} const g = document.getElementById('gsplash'); if (g) g.remove(); }, [BASE, DOMHUB('andamento')]);
    const antes = await page.evaluate(medirNaPagina, CFG);
    // reverte: empurra conteúdo p/ baixo da coluna da direita (como era antes do §365) — fica fora do canvas, recortado.
    await page.evaluate(() => { const cfs = document.querySelector('.dh-cfs'); [...cfs.querySelectorAll('.dh-cf__p')].forEach(p => { p.style.height = '106px'; }); });
    const depois = await page.evaluate(medirNaPagina, CFG);
    const foraAntes = antes.d.filter(x => x.tipo === 'fora-tela').length;
    const foraDepois = depois.d.filter(x => x.tipo === 'fora-tela').length;
    ok(foraAntes === 0, `§366: hub corrigido não tem conteúdo fora da tela (fora-tela=${foraAntes})`);
    ok(foraDepois > 0, `§366: ao reverter a correção, a guarda acusa conteúdo fora da tela (fora-tela=${foraDepois})`);
    await ctx.close();
  }

  await browser.close();
  if (falhas) { console.log(`\n>>> ${falhas} FALHA(S) de acessibilidade §358`); process.exit(1); }
  console.log('\n>>> ACESSIBILIDADE §358 OK — Coleção/Ficha/Níveis cumprem o padrão §357 em todos os estados.');
  process.exit(0);
})().catch(e => { console.error(e.stack || e.message || e); process.exit(1); });
