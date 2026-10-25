// §357 — AUDITORIA DE ACESSIBILIDADE. Percorre TODAS as telas no viewport de referência 780×360 (um S24 deitado),
// mede em px CSS REAIS (descontando a escala do enquadramento fixo), e escreve o relatório + um print por tela.
// NÃO conserta nada: só mede e reporta. Padrão medido (docs/guia-visual.md §357):
//   corpo ≥ 12px · rótulo/legenda/número pequeno ≥ 11px · título de bloco ≥ 15px;
//   área de toque ≥ 40×40px; SEM rolagem dentro de cartão/painel/janela/sobreposição (só LISTAS da lista branca);
//   nada cortado com "…" em informação importante (nome, custo, efeito).
// Uso: node tools/build.js && node tools/auditoria_acessibilidade.js
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const ROOT = path.resolve(__dirname, '..');
const DIST = 'file://' + path.join(ROOT, 'dist', 'incursion.html');
const TELAS = path.join(ROOT, 'docs', 'telas');
const REL = path.join(ROOT, 'docs', 'acessibilidade-auditoria.md');
function acharChromium(){ if(process.env.INCURSION_CHROMIUM) return process.env.INCURSION_CHROMIUM;
  const base='/opt/pw-browsers'; const d=fs.readdirSync(base).filter(x=>/^chromium-\d+$/.test(x)).sort().pop();
  return path.join(base, d, 'chrome-linux', 'chrome'); }

const VW = 780, VH = 360, DSF = 2;           // 780×360 CSS (escala do desenho ~0,4225)
// §358: a MEDIÇÃO e os mínimos vivem no módulo compartilhado (o teste §358 usa os MESMOS).
const { medirNaPagina, nota, MIN_CORPO, MIN_ROTULO, MIN_TOQUE, SCROLL_OK } = require('./auditoria_medida.js');

// splash (carregamento): o shell remove o #gsplash após iniciar; reinjetamos o MESMO markup para auditar a tela.
const distHtml = fs.readFileSync(path.join(ROOT, 'dist', 'incursion.html'), 'utf8');
const mSplash = distHtml.match(/<div id="gsplash"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/);
const SPLASH = mSplash ? mSplash[0] : '<div id="gsplash"><div class="gsplash__box"><h1 class="gsplash__name">INCURSION</h1><div class="gsplash__bar"><i></i></div></div></div>';

// reset comum antes de cada tela
const BASE = `try{
  perfil.deuses={}; (typeof ROSTER!=='undefined'?ROSTER:[]).slice(0,40).forEach(e=>perfil.deuses[e.key]={copias:1,obtidoEm:Date.now()});
  contaAtual={nick:'Herói',perfil,niveis:{},pontos:{},ranque:{pontos:1200},missoes:{ativa:null,progresso:{},liberados:[]}};
}catch(e){}
try{menuAberto=false;}catch(e){} try{ov=null;}catch(e){} try{detalhe=null;}catch(e){} try{armado=null;alvos=[];escolhidos=[];}catch(e){}
try{campPicker=null;campKitRev=null;}catch(e){} try{colVer=null;}catch(e){} try{montKitAberto=null;}catch(e){}`;

// montador: utilidades de preenchimento de time (reusa as funções reais)
const PICK = (arr, n) => `(function(){try{const ks=_montFiltrados(_montJogaveis()); for(let i=0;i<${n};i++)${arr}.push(ks[i]); render();}catch(e){}})();`;

// ---------- TELAS ----------
const SCREENS = [
 { slug:'carregamento', nome:'Carregamento (splash)', setup:`document.body.insertAdjacentHTML('beforeend', __SPLASH__); var s=document.getElementById('gsplash'); if(s)s.classList.remove('gsplash--fora');` },
 { slug:'home', nome:'Home', setup:`ir('home',{},{substituir:true}); render();` },

 // BATALHA (4 estados)
 { slug:'batalha-meu-turno', nome:'Batalha — meu turno', setup:`st=montarProvacao({aliados:['hades','ares','brigid'],inimigos:['poseidon','hera','apolo'],montar:{seed:3,comeca:0}});prova=null;campanha=null;dominio=null;vsCPU=true;IA_LADO=1;try{pararRelogio();}catch(e){}try{ELEMS.forEach(e=>st.lados[0].orbs[e]=0);st.lados[0].orbs[st.lados[0].units[0].elem]=3;st.lados[0].orbs[st.lados[0].units[1].elem]=1;}catch(e){}st.ativo=0;foco=st.lados[0].units[0].uid;armado=null;detalhe=null;resumoTurno=null;menuAberto=false;ov=null;ir('batalha',{},{substituir:true});render();` },
 { slug:'batalha-oponente', nome:'Batalha — turno do oponente', setup:`st=montarProvacao({aliados:['hades','ares','brigid'],inimigos:['poseidon','hera','apolo'],montar:{seed:3,comeca:1}});prova=null;campanha=null;dominio=null;vsCPU=true;IA_LADO=1;try{pararRelogio();}catch(e){}st.ativo=1;foco=st.lados[1].units[0].uid;armado=null;detalhe=null;menuAberto=false;ov=null;ir('batalha',{},{substituir:true});render();` },
 { slug:'batalha-armada', nome:'Batalha — habilidade armada', setup:`st=montarProvacao({aliados:['hades','ares','brigid'],inimigos:['poseidon','hera','apolo'],montar:{seed:3,comeca:0}});prova=null;campanha=null;dominio=null;vsCPU=true;IA_LADO=1;try{pararRelogio();}catch(e){}try{ELEMS.forEach(e=>st.lados[0].orbs[e]=0);st.lados[0].orbs[st.lados[0].units[0].elem]=3;}catch(e){}st.ativo=0;foco=st.lados[0].units[0].uid;detalhe=null;ir('batalha',{},{substituir:true});render();try{armar(st.lados[0].units[0].uid,'habilidade');}catch(e){}render();` },
 { slug:'batalha-inspecao', nome:'Batalha — inspeção da habilidade', setup:`st=montarProvacao({aliados:['hades','ares','brigid'],inimigos:['poseidon','hera','apolo'],montar:{seed:3,comeca:0}});prova=null;campanha=null;dominio=null;vsCPU=true;IA_LADO=1;try{pararRelogio();}catch(e){}st.ativo=0;foco=st.lados[0].units[0].uid;armado=null;ir('batalha',{},{substituir:true});render();try{lerHabilidade(st.lados[0].units[0].uid,'habilidade');}catch(e){}render();` },

 // CAMPANHA §364 (canvas 780×360): batalha c/ consequências+kit, texto mais longo (paginado), escolha em opções (pista 86c), história sintética
 { slug:'campanha-batalha', nome:'Campanha — ato de batalha (consequências + kit)', setup:`perfil.campanha={capitulo:1,fase:0,concluidas:[],escolhas:{}};var caps=CAMPANHAS.capitulos;caps.forEach(c=>c.atos.forEach(a=>{if(a.id!=='cap1-vi')perfil.campanha.concluidas.push(a.id);}));caps.forEach(c=>c.atos.forEach(a=>{if(a.tipo==='escolha'&&a.certa)perfil.campanha.escolhas[a.id]=a.certa;}));var c1=caps.findIndex(c=>c.numero===1);campCapIdx=c1;campAtoIdx=caps[c1].atos.findIndex(a=>a.id==='cap1-vi');campVistaAto=null;ir('campanha',{},{substituir:true});render();` },
 { slug:'campanha-texto-longo', nome:'Campanha — texto mais longo (Conselho, 819c, paginado)', setup:`perfil.campanha={capitulo:1,fase:0,concluidas:[],escolhas:{}};var caps=CAMPANHAS.capitulos;var f=null;caps.forEach((c,ci)=>c.atos.forEach((a,ai)=>{if(a.nome==='O Conselho Temporário')f={ci,ai};}));campCapIdx=f.ci;campAtoIdx=f.ai;campVistaAto=null;campEscolhaVista=null;ir('campanha',{},{substituir:true});render();` },
 { slug:'campanha-escolha', nome:'Campanha — ato de escolha (opções inteiras, pista 86c)', setup:`perfil.campanha={capitulo:1,fase:0,concluidas:[],escolhas:{}};var caps=CAMPANHAS.capitulos;var f=null;caps.forEach((c,ci)=>c.atos.forEach((a,ai)=>{if(a.nome==='O Conselho Temporário')f={ci,ai};}));campCapIdx=f.ci;campAtoIdx=f.ai;campVistaAto=null;ir('campanha',{},{substituir:true});render();campEscolhaVista='opções';render();` },
 { slug:'campanha-historia', nome:'Campanha — ato de história (sintético)', setup:`var caps=CAMPANHAS.capitulos;var a=caps[0].atos[0];a.__tipo0=a.tipo;a.tipo='historia';perfil.campanha={capitulo:0,fase:0,concluidas:[],escolhas:{}};campCapIdx=0;campAtoIdx=0;campVistaAto=null;ir('campanha',{},{substituir:true});render();` },

 // MONTADORES (todos os modos usam #dommontar)
 { slug:'montar-campanha', nome:'Montar time — encontro da campanha', setup:`campTimePick=[];var e=(campEncontros().find(x=>x.aliados==null)||campEncontros()[0]);ir('montartime',{id:e.id});render();${PICK('campTimePick',2)}` },
 { slug:'montar-dominio', nome:'Montar time — Domínio (corrida)', setup:`try{var cult=(DOMINIOS&&DOMINIOS[0]&&DOMINIOS[0].cultura)||'grega';ir('dominiomontar',{cultura:cult});render();}catch(e){ir('dominiomontar',{});render();}${PICK('(typeof dmTimePick!=="undefined"?dmTimePick:[])',1)}` },
 { slug:'montar-desafio', nome:'Montar time — Desafio de composição', setup:`desafioTimePick=[];var ds=(desafios().find(d=>d.regra==='monoElemento')||desafios()[0]);ir('desafiomontar',{id:ds.id});render();${PICK('desafioTimePick',1)}` },
 { slug:'montar-selecao', nome:'Seleção de time (Batalha CPU/hot-seat)', setup:`ir('selecao',{},{substituir:true});render();` },
 { slug:'pvp', nome:'PvP — lobby (time montado)', setup:`contaTransporte={};contaAtual={nick:'Herói',perfil,ranque:{pontos:1206}};pvpTime=[];pvpEstado='idle';pvpRanqueado=false;ir('pvp',{},{substituir:true});render();${PICK('pvpTime',3)}` },
 { slug:'pvp-fila', nome:'PvP — na fila', setup:`contaTransporte={};contaAtual={nick:'Herói',perfil};pvpRanqueado=true;ir('pvp',{},{substituir:true});render();(function(){try{var ks=_montFiltrados(_montJogaveis());pvpTime.push(ks[0],ks[1],ks[2]);pvpEstado='fila';pvpFilaInicio=Date.now()-72000;render();}catch(e){}})();` },

 // COLEÇÃO (sem seleção, com seleção, sobreposição kit, sobreposição níveis)
 { slug:'colecao', nome:'Coleção — sem seleção', setup:`colF={busca:'',cultura:'',classe:'',funcao:'',elem:'',status:'',raridade:'',ordem:'recentes'};ir('colecao',{},{substituir:true});render();` },
 { slug:'colecao-filtro', nome:'Coleção — com filtro', setup:`colF={busca:'',cultura:'',classe:'',funcao:'Controlador',elem:'Aurora',status:'tem',raridade:'',ordem:'nome'};ir('colecao',{},{substituir:true});render();` },
 { slug:'ficha-sinergia', nome:'Ficha do deus — SINERGIA', setup:`fichaAba='sinergia';deusSelKey=null;ir('deus',{key:'odin'},{substituir:true});render();` },
 { slug:'ficha-falta', nome:'Ficha do deus — não possuída', setup:`delete perfil.deuses.anubis;fichaAba='habilidades';deusSelKey=null;ir('deus',{key:'anubis'},{substituir:true});render();` },

 // FICHA / NÍVEIS
 { slug:'ficha', nome:'Ficha do deus', setup:`perfil.deuses.zeus=perfil.deuses.zeus||{obtidoEm:Date.now(),copias:1};contaAtual={pontos:{zeus:1},niveis:{zeus:{basico:2,habilidade:4,milagre:1}},perfil:{deuses:perfil.deuses},missoes:{ativa:null,progresso:{},liberados:[]}};fichaAba='habilidades';deusSelKey=null;ir('deus',{key:'zeus'},{substituir:true});render();` },
 { slug:'niveis', nome:'Níveis de habilidade', setup:`perfil.deuses.zeus=perfil.deuses.zeus||{copias:1,obtidoEm:0};contaAtual={nick:'T',ranque:{pontos:60},pontos:{zeus:1},niveis:{zeus:{basico:3,habilidade:4,milagre:1}},perfil:{deuses:{zeus:{copias:1}}},missoes:{ativa:null,progresso:{},liberados:[]}};nlConfirm=null;nlPendente=false;nlMsg=null;nlSelKey=null;ir('niveis',{key:'zeus'},{substituir:true});render();` },

 // HUBS / LISTAS
 { slug:'desafios', nome:'Desafios (hub)', setup:`ir('desafios',{},{substituir:true});render();` },
 { slug:'composicao', nome:'Composição (desafios)', setup:`ir('composicao',{},{substituir:true});render();` },
 { slug:'provacoes', nome:'Provações', setup:`ir('provacoes',{},{substituir:true});render();` },

 // DOMÍNIOS
 { slug:'dominios', nome:'Domínios — seleção', setup:`ir('dominios',{},{substituir:true});render();` },
 { slug:'dominio-hub', nome:'Domínio — hub', setup:`['nezha','brigid','ogum','zeus','poseidon','atena','ares','hera','apolo'].forEach(k=>perfil.deuses[k]={copias:1,obtidoEm:Date.now()});perfil.dominios={porDominio:{}};try{var cult=(DOMINIOS&&DOMINIOS[0]&&DOMINIOS[0].cultura)||'grega';ir('dominio',{cultura:cult});render();}catch(e){ir('dominio',{});render();}` },

 // INVOCAÇÃO
 { slug:'invocacao', nome:'Invocação — tela', setup:`ir('invocacao',{},{substituir:true});render();` },
 { slug:'invocacao-reveal', nome:'Invocação — revelação', setup:`ir('invocacao',{},{substituir:true});render();var rv=document.getElementById('iv-reveal');if(rv){rv.classList.add('iv-show');var tip=rv.querySelector('.iv-tip');if(tip)tip.textContent='toque fora para voltar';var b=document.getElementById('iv-revagain');if(b){b.style.display='inline-block';b.textContent='Invocar mais ×1';}}` },

 // DEV / MARCADORES / MENUS / CONFIRMAÇÕES
 { slug:'guia', nome:'Guia (folha de componentes, dev)', setup:`ir('guia',{},{substituir:true});render();` },
 { slug:'embreve', nome:'Em breve (marcador)', setup:`ir('embreve',{titulo:'Loja'},{substituir:true});render();` },
 { slug:'batalha-menu', nome:'Batalha — menu', setup:`st=montarProvacao({aliados:['hades','ares','brigid'],inimigos:['poseidon','hera','apolo'],montar:{seed:3,comeca:0}});prova=null;campanha=null;dominio=null;vsCPU=true;IA_LADO=1;try{pararRelogio();}catch(e){}st.ativo=0;foco=st.lados[0].units[0].uid;ir('batalha',{},{substituir:true});render();menuAberto=true;render();` },
 { slug:'batalha-confirmar-sair', nome:'Batalha — confirmação de sair', setup:`st=montarProvacao({aliados:['hades','ares','brigid'],inimigos:['poseidon','hera','apolo'],montar:{seed:3,comeca:0}});prova=null;campanha=null;dominio=null;vsCPU=true;IA_LADO=1;try{pararRelogio();}catch(e){}st.ativo=0;foco=st.lados[0].units[0].uid;ir('batalha',{},{substituir:true});render();ov='sair';render();` },
 { slug:'batalha-confirmar-desistir', nome:'Batalha — confirmação de desistir', setup:`st=montarProvacao({aliados:['hades','ares','brigid'],inimigos:['poseidon','hera','apolo'],montar:{seed:3,comeca:0}});prova=null;campanha=null;dominio=null;vsCPU=true;IA_LADO=1;try{pararRelogio();}catch(e){}st.ativo=0;foco=st.lados[0].units[0].uid;ir('batalha',{},{substituir:true});render();ov='surr';render();` },
];

// caveats por tela (limitações da captura offline)
const NOTAS = {
  'invocacao-reveal': 'A revelação é autoritativa do SERVIDOR; no modo arquivo (sem WS) as cartas não chegam. Aqui a sobreposição é aberta com o esqueleto REAL (`#iv-reveal`) para auditar a moldura (dica + "Invocar mais"); as cartas (`.iv-card`) precisam do servidor vivo.',
  'campanha-historia': 'A campanha atual só tem atos de batalha e escolha; este caso força `tipo=\'historia\'` num ato real para auditar o caminho de render da história.',
};

(async () => {
  const browser = await chromium.launch({ executablePath: acharChromium(), headless: true, args: ['--no-sandbox'] });
  const resultados = [];
  for (const sc of SCREENS) {
    const ctx = await browser.newContext({ viewport: { width: VW, height: VH }, deviceScaleFactor: DSF });
    const page = await ctx.newPage();
    const erros = [];
    page.on('pageerror', e => erros.push(String(e && e.message || e)));
    await page.goto(DIST, { waitUntil: 'load' });
    let setupErr = null;
    try {
      const setup = sc.setup.replace('__SPLASH__', JSON.stringify(SPLASH));
      setupErr = await page.evaluate((s) => { try { eval(s); const g = document.getElementById('gsplash'); if (g && !location.hash.includes('splash')) {} return null; } catch (e) { return String(e && e.message || e); } }, setup);
    } catch (e) { setupErr = String(e); }
    // o splash só deve existir na tela de carregamento
    if (sc.slug !== 'carregamento') { try { await page.evaluate(() => { const g = document.getElementById('gsplash'); if (g) g.remove(); }); } catch (e) {} }
    await page.waitForTimeout(sc.slug.startsWith('invocacao-reveal') ? 700 : 260);
    const file = `357-${sc.slug}-780x360.png`;
    try { await page.screenshot({ path: path.join(TELAS, file) }); } catch (e) {}
    let med = null, medErr = null;
    try { med = await page.evaluate(medirNaPagina, { MIN_CORPO, MIN_ROTULO, MIN_TOQUE, SCROLL_OK }); }
    catch (e) { medErr = String(e && e.message || e); }
    const r = med || { a: [], b: [], c: [], d: [], textTotal: 0, tapTotal: 0 };
    resultados.push({ slug: sc.slug, nome: sc.nome, file, r, nota: med ? nota(r) : 0, setupErr, medErr, erros: erros.slice(0, 3) });
    console.log(`  ${sc.slug.padEnd(26)} a=${r.a.length} b=${r.b.length} c=${r.c.length} d=${r.d.length} nota=${med ? nota(r) : '—'}${setupErr ? ' [setupErr]' : ''}`);
    await ctx.close();
  }
  await browser.close();

  // ---------- RELATÓRIO ----------
  const esc = s => String(s).replace(/\|/g, '\\|').replace(/\n/g, ' ');
  const ordem = [...resultados].sort((x, y) => x.nota - y.nota);
  let md = '';
  md += '# Auditoria de acessibilidade (§357)\n\n';
  md += '> Gerada por `tools/auditoria_acessibilidade.js` no viewport de referência **780×360** (um S24 deitado; escala do\n';
  md += `> desenho ≈ 0,4225). Mede em **px CSS reais** (descontando o transform do enquadramento). Padrão em \`docs/guia-visual.md\`\n`;
  md += `> (§357). **Esta tarefa NÃO conserta telas** — só mede e ordena o conserto.\n\n`;
  md += `**Mínimos:** corpo ≥ ${MIN_CORPO}px · rótulo/legenda/número pequeno ≥ ${MIN_ROTULO}px · título de bloco ≥ 15px · toque ≥ ${MIN_TOQUE}×${MIN_TOQUE}px · sem rolagem fora das listas · sem corte em nome/custo/efeito.\n\n`;
  md += 'Colunas: **a)** textos < 12px (corpo) — entre parênteses os < 11px (falham até como rótulo); **b)** toques < 40×40px; **c)** rolagens proibidas (fora da lista branca); **d)** cortes (reticências em info importante / estouro do viewport).\n\n';
  md += 'Lista branca de rolagem (permitida — são LISTAS): ' + SCROLL_OK.map(s => '`' + s + '`').join(', ') + '.\n\n';
  md += 'Nota 0–10 (transparente): `10·(0,5·textoOK + 0,2·toqueOK + 0,3·rolagemOK) − penal.corte`, onde textoOK/toqueOK são a fração de itens dentro do mínimo, rolagemOK = `1/(1+nº rolagens)` e a penalidade de corte é `0,1·nº` (máx 2).\n\n';

  // tabela-resumo (ordem de conserto = pior primeiro)
  md += '## Resumo (ordem de conserto — pior primeiro)\n\n';
  md += '| # | Tela | a) texto<12 (<11) | b) toque<40 | c) rolagem | d) corte | nota | print |\n';
  md += '|--:|------|--:|--:|--:|--:|:--:|------|\n';
  ordem.forEach((o, i) => {
    const a11 = o.r.a.filter(x => x.abaixoRotulo).length;
    md += `| ${i + 1} | ${esc(o.nome)} | ${o.r.a.length} (${a11}) | ${o.r.b.length} | ${o.r.c.length} | ${o.r.d.length} | **${o.nota}** | \`${o.file}\` |\n`;
  });
  md += '\n';

  // detalhe por tela (ordem de conserto)
  md += '## Detalhe por tela\n\n';
  for (const o of ordem) {
    md += `### ${o.nome} — nota ${o.nota}\n\n`;
    md += `Print: \`docs/telas/${o.file}\`. Contagens: a=${o.r.a.length}, b=${o.r.b.length}, c=${o.r.c.length}, d=${o.r.d.length}. `;
    md += `(textos visíveis: ${o.r.textTotal}; tocáveis: ${o.r.tapTotal}.)` + (o.setupErr ? ` **setup: ${esc(o.setupErr)}**` : '') + (o.medErr ? ` **medição: ${esc(o.medErr)}**` : '') + '\n\n';
    if (NOTAS[o.slug]) md += `> Nota: ${NOTAS[o.slug]}\n\n`;

    const aw = [...o.r.a].sort((x, y) => x.px - y.px).slice(0, 10);
    if (aw.length) { md += '**a) 10 piores textos pequenos** (px real):\n\n'; aw.forEach(x => md += `- \`${esc(x.sel)}\` — **${x.px}px**${x.abaixoRotulo ? ' ⚠<11' : ''} — "${esc(x.txt)}"\n`); md += '\n'; }
    const bw = [...o.r.b].sort((x, y) => x.min - y.min).slice(0, 10);
    if (bw.length) { md += '**b) 10 piores toques** (menor lado):\n\n'; bw.forEach(x => md += `- \`${esc(x.sel)}\` — **${x.w}×${x.h}** — "${esc(x.txt)}"\n`); md += '\n'; }
    const cw = [...o.r.c].sort((x, y) => y.over - x.over).slice(0, 10);
    if (cw.length) { md += '**c) rolagens proibidas:**\n\n'; cw.forEach(x => md += `- \`${esc(x.sel)}\` — eixo ${x.eixo}, +${Math.round(x.over)}px — "${esc(x.txt)}"\n`); md += '\n'; }
    const dw = [...o.r.d].sort((x, y) => (y.importante ? 1 : 0) - (x.importante ? 1 : 0)).slice(0, 10);
    if (dw.length) { md += '**d) cortes:**\n\n'; dw.forEach(x => md += `- [${x.tipo}]${x.importante ? ' **importante**' : ''} \`${esc(x.sel)}\` — "${esc(x.txt)}"\n`); md += '\n'; }
    if (!aw.length && !bw.length && !cw.length && !dw.length) md += '_Sem achados._\n\n';
  }

  // lista de prints
  md += '## Prints gerados\n\n';
  resultados.forEach(o => md += `- \`docs/telas/${o.file}\` — ${esc(o.nome)}\n`);
  md += '\n';

  fs.writeFileSync(REL, md);
  fs.writeFileSync(path.join(ROOT, 'docs', '357-auditoria.json'), JSON.stringify(resultados, null, 1));
  console.log('\nRelatório: ' + REL);
  console.log('Prints: docs/telas/357-*-780x360.png (' + resultados.length + ')');
  const comErro = resultados.filter(o => o.setupErr || o.medErr);
  if (comErro.length) console.log('Telas com erro de setup/medição: ' + comErro.map(o => o.slug).join(', '));
})().catch(e => { console.error(e.stack || e.message || e); process.exit(1); });
