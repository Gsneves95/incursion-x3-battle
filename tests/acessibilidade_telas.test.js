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
  // §361: PROVAÇÕES — 5 estados no canvas 780×360 (ativa c/ máx de objetivos; prévia; confirmação; faixa espiada; offline).
  'Provações — ativa (4 objetivos)': `window.ativarProvacaoServidor=async()=>({ok:true});contaAtual={nick:'T',ranque:{pontos:5000,faixa:{chave:'semideus',nome:'Semideus'}},perfil:{deuses:{cerberus:{copias:1},zeus:{copias:1}}},missoes:{ativa:'hades',progresso:{hades:{ativadaEm:0,obj:[{seq:1},{vol:5},{vol:3,seqA:4,seqB:2},{vol:2}]}},liberados:[]}};provPrevia=null;provTrocaConfirm=null;provPendente=null;provFiltro='todas';provBusca='';provFaixaAba='todas';faixasEspiadas.clear();ir('provacoes',{},{substituir:true});render();`,
  'Provações — prévia de uma disponível': `window.ativarProvacaoServidor=async()=>({ok:true});contaAtual={nick:'T',ranque:{pontos:5000,faixa:{chave:'semideus',nome:'Semideus'}},perfil:{deuses:{cerberus:{copias:1},zeus:{copias:1}}},missoes:{ativa:'hades',progresso:{hades:{ativadaEm:0,obj:[{seq:1},{vol:5},{vol:3,seqA:4,seqB:2},{vol:2}]}},liberados:[]}};provPrevia=null;provTrocaConfirm=null;provPendente=null;provFiltro='todas';provBusca='';provFaixaAba='todas';faixasEspiadas.clear();ir('provacoes',{},{substituir:true});render();(function(){var c=document.querySelector('.pvc--disponivel[data-carta]');if(c){provPrevia=c.dataset.carta;render();}})();`,
  'Provações — confirmação de troca': `window.ativarProvacaoServidor=async()=>({ok:true});contaAtual={nick:'T',ranque:{pontos:5000,faixa:{chave:'semideus',nome:'Semideus'}},perfil:{deuses:{cerberus:{copias:1},zeus:{copias:1}}},missoes:{ativa:'hades',progresso:{hades:{ativadaEm:0,obj:[{seq:1},{vol:5},{vol:3,seqA:4,seqB:2},{vol:2}]}},liberados:[]}};provPrevia=null;provTrocaConfirm=null;provPendente=null;provFiltro='todas';provBusca='';provFaixaAba='todas';faixasEspiadas.clear();ir('provacoes',{},{substituir:true});render();(function(){var c=document.querySelector('.pvc--disponivel[data-carta]');if(c){provPrevia=c.dataset.carta;provTrocaConfirm=c.dataset.carta;render();}})();`,
  'Provações — faixa acima espiada (aba)': `window.ativarProvacaoServidor=async()=>({ok:true});contaAtual={nick:'T',ranque:{pontos:60,faixa:{chave:'suplicante',nome:'Suplicante'}},perfil:{deuses:{cerberus:{copias:1},zeus:{copias:1}}},missoes:{ativa:null,progresso:{},liberados:[]}};provPrevia=null;provTrocaConfirm=null;provPendente=null;provFiltro='todas';provBusca='';provFaixaAba='todas';faixasEspiadas.clear();ir('provacoes',{},{substituir:true});render();(function(){var c=faixaAtualIdx();var alvo=c+2;provFaixaAba=alvo;faixasEspiadas.add(alvo);render();})();`,
  'Provações — sem conexão': `contaAtual=null;provPrevia=null;provTrocaConfirm=null;provPendente=null;provFiltro='todas';provBusca='';provFaixaAba='todas';faixasEspiadas.clear();ir('provacoes',{},{substituir:true});render();`,
  // §362: BATALHA — 10 estados no canvas 780×360 (design do dono).
  'Batalha — meu turno': BTBOOT,
  'Batalha — turno do oponente': BTBOOT + `st.ativo=1;IA_LADO=0;armado=null;detalhe=null;render();`,
  'Batalha — habilidade armada (desc + longa)': BTBOOT + `armar(st.lados[0].units[1].uid,'milagre');`,
  'Batalha — habilidade lida': BTBOOT + `lerHabilidade(st.lados[0].units[2].uid,'habilidade');`,
  'Batalha — deus inspecionado': BTBOOT + `infoUnidade(st.lados[1].units[0].uid);`,
  'Batalha — efeito': BTBOOT + `st.lados[0].units[1].efeitos=[{type:'vulneravel',v:6,dur:2,origem:st.lados[1].units[0].uid}];infoEfeito(st.lados[0].units[1].uid,0);`,
  'Batalha — resumo da CPU': BTBOOT + `foco=null;resumoTurno=[{turno:st.turno,tipo:'acao',origem:'poseidon',slot:'milagre'},{turno:st.turno,tipo:'dano',origem:'poseidon',alvo:'hades',valor:14}];render();`,
  'Batalha — menu ☰ aberto': BTBOOT + `menuAberto=true;render();`,
  'Batalha — confirmar encerrar sem agir': BTBOOT + `ov='confirmEnc';render();`,
  'Batalha — caixa de energia com 6 tipos': BTBOOT + `infoUnidade(st.lados[0].units[0].uid);`,
};

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
  await browser.close();
  if (falhas) { console.log(`\n>>> ${falhas} FALHA(S) de acessibilidade §358`); process.exit(1); }
  console.log('\n>>> ACESSIBILIDADE §358 OK — Coleção/Ficha/Níveis cumprem o padrão §357 em todos os estados.');
  process.exit(0);
})().catch(e => { console.error(e.stack || e.message || e); process.exit(1); });
