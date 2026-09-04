// ============================================================
// ORQUESTRADOR DA VISÃO
// Guarda o estado de sessão da UI, despacha o render pela ROTA e junta os
// módulos de ui/. A lógica de desenho vive em src/ui/*; o fluxo de turno e o
// relógio vivem em src/turno.js; a navegação em src/rotas.js. Aqui só a cola.
// ============================================================

// Estado de sessão da UI (o estado de regras é o `st` do motor; relógio e IA
// moram em turno.js; estado da seleção mora em ui/selecao.js).
let st=null, pick=[[],[]], armado=null, alvos=[], escolhidos=[],
    ov=null, detalhe=null, hpAnt={}, peek=null, abaFoe=null, convAlvo=null, menuAberto=false, livrePlano={};
// §214 — painel de leitura (esquerda): recolhível (aba) e consulta de kit inimigo (toque longo).
// §219 — o kit PERSISTE (não fecha ao soltar o dedo): kitSel = habilidade selecionada dentro do kit;
// foeGesto/foeTimer rastreiam o gesto no retrato inimigo em nível de MÓDULO (sobrevivem ao render()
// que troca o DOM no meio do toque — é o que consertava o fechamento no pointerup).
let painelRecolhido=false, peekKit=null, kitSel=null, foeGesto=null, foeTimer=null;

// F3.1 — estado da PROVAÇÃO ativa (null numa batalha normal): a Provação em curso, o
// resultado já decidido (uma vez só) e o contador de lances do jogador (o placar).
let prova=null, provaFim=null, provaLances=0;
// F3.3 — estado do ENCONTRO de CAMPANHA ativo (null fora da campanha): o encontro em
// curso e o resultado já decidido (uma vez só). Reusa a batalha, sem condição especial.
let campanha=null, campanhaFim=null;

// Perfil do jogador (persistido; ver src/perfil.js + src/armazenamento.js). Carregado
// no bootstrap; a F0.4b liga o pity do gacha a ele.
let perfil=null;

// Apaga TODOS os dados: limpa as chaves, zera o perfil em memória e regrava o novo.
// salvar() não é silencioso — se a escrita falhar, avisa no registro da partida.
function apagarDados(){
  apagar();
  // reset é recriação: novoPerfil() aplica o grant inicial (senão o jogador fica sem
  // poder jogar) e a entrada de histórico marca que foi RESET, não grant normal.
  const grant=(typeof ECONOMIA!=='undefined'&&ECONOMIA.grantInicial)?ECONOMIA.grantInicial.gema:0;
  perfil=novoPerfil(0, grant);
  registrarHistorico(entradaDeEvento({tipo:'recriacao', causa:'reset-manual', valor:grant}));
  const r=salvar(perfil);
  if(!r.ok && st) st.log.push({turno:st.turno,msg:'⚠ dados apagados, mas a gravação falhou: '+r.erro});
}

/* ---------- navegação ---------- */
function voltarInvocacao(){ if(!voltar())ir('home',{},{substituir:true}); render(); }

// Ganchos de ciclo de vida das telas (usados pelos hooks de rota). A limpeza de
// sobreposição mora AQUI, num lugar só; parar o relógio é do turno.js.
function limparSobreposicao(){ armado=null;alvos=[];escolhidos=[];detalhe=null;abaFoe=null;convAlvo=null;menuAberto=false;ov=null;livrePlano={}; }
function sairBatalha(){ pararRelogio(); limparSobreposicao(); }

// render() despacha pela ROTA: chama o gancho de render da tela atual.
function render(){ const h=hooksAtuais(); if(h.render)h.render(); }

function renderBatalha(){
  // §214 — ZONAS por ergonomia (paisagem 2.16, polegar direito): LEITURA à esquerda (painel),
  // TOQUE à direita (tiles/alvo/encerrar). PERSPECTIVA fixa (F0.7): eu = ladoExibido.
  // Cada FILEIRA pareia um aliado (retrato + 4 tiles) com o inimigo da mesma posição (retrato).
  const eu=ladoExibido();
  const l=st.lados[eu], o=st.lados[1-eu];
  const prontas=l.units.filter(u=>podeAgir(u)).length;

  // F3.1: numa Provação, avalia a condição ANTES de desenhar — o latch (uma vez só) decide
  // vitória/derrota, congela o motor quando a condição quebra, e desbloqueia o deus na vitória.
  if(prova) atualizarProva(); else if(campanha) atualizarCampanha(); else atualizarSandbox();

  const scrim = !!ov || !!st.fim || !!provaFim || !!campanhaFim;
  const cls=[]; if(prova||campanha)cls.push('temhud'); if(painelRecolhido)cls.push('pnfold');
  // §239 item 4: a ênfase inverte com o turno SEM mover nada — o lado ativo acende. Em hot-seat a tela
  // gira e o jogador da vez é sempre "eu" (turno-eu); vs CPU/PvP, o turno dele acende o lado dele.
  cls.push(ehMeuTurno()?'turno-eu':'turno-eles');
  stage.innerHTML = `<div id="baselayer" class="${cls.join(' ')}"${scrim?' inert':''}>
  <div class="stage__bg"></div><div class="stage__scrim"></div>
  ${topoHTML()}
  ${prova?provaHUD():campanha?campanhaHUD():''}
  <div class="board">
    ${painelHTML()}
    <div class="rows">
      <span class="teamlbl teamlbl--ally">Você</span>
      <span class="teamlbl teamlbl--enemy">${H(rotuloLado(1-eu))}</span>
      ${Array.from({length:Math.max(l.units.length,o.units.length,1)},(_,i)=>filaHTML(l.units[i], o.units[i])).join('')}
    </div>
  </div>
  <footer class="footer">
    <div class="acaoestado">${acaoRodapeHTML()}</div>
    ${ehMeuTurno()
      ? `<button class="b ${scrim?'b--sec':'b--primary'} b--md endturn" id="bend">
      <span class="endturn__l1">Encerrar turno</span>
      <span class="endturn__hint">${l.dividaLivre>0?`escolher ${l.dividaLivre} energia livre`:(prontas?prontas+(prontas>1?' a agir':' a agir'):'todas agiram')}</span>
    </button>`
      : `<div class="endturn endturn--wait" aria-live="polite">
      <span class="endturn__l1">Vez de ${H(rotuloLado(st.ativo))}</span>
      <span class="endturn__hint">aguarde</span>
    </div>`}
  </footer>
  </div>
  ${(prova&&provaFim)?provaResultadoOverlay():(campanha&&campanhaFim)?campanhaResultadoOverlay():overlayHTML()}`;

  hpAnt={}; todas().forEach(u=>hpAnt[u.uid]=u.hp);
  if(peek){const el=stage.querySelector(`[data-look="${peek}"]`); if(el)el.classList.add('peek'); peek=null;}
  ligar(); fit();
}

// ligar() é só DESPACHANTE: cada módulo liga o próprio DOM. talvezIA (turno.js)
// roda por último — se for a vez da CPU, ela joga sozinha.
function ligar(){
  ligarCampo(); ligarTopo(); ligarPainel(); ligarSobrepor();
  if(prova&&provaFim) ligarProvaFim();   // F3.1: os botões do fim de Provação (voltar/tentar) substituem o "Nova batalha"
  else if(campanha&&campanhaFim) ligarCampanhaFim();   // F3.3: os botões do fim de encontro
  talvezIA();
}

/* ---------- bootstrap: carrega o perfil, injeta o turno, registra as telas ---------- */
// Carrega o perfil. Só avisa se o dado estava CORROMPIDO (perda real); ambiente sem
// localStorage é começo normal — o alarme de gravação (salvar) cobre a impossibilidade
// de persistir, que é o que de fato importa ao jogador.
// F5.1: captura ANTES de iniciar() (que persiste o perfil) se JÁ havia perfil no disco. É o que
// separa o perfil de DESENVOLVIMENTO do dono (progresso real, migra UMA vez) de uma instalação
// NOVA (nasce no servidor, nunca migra). Depois de iniciar() a chave existe sempre — por isso agora.
const _tinhaPerfilAntes = (typeof perfilPreexistente==='function') ? perfilPreexistente(CHAVE_PERFIL) : false;
// F5/§234: a CONTA do servidor (null = offline/local). Declarada ANTES do primeiro render() abaixo,
// porque o banner e a tela de Missões a leem; sem servidor fica null e a tela diz isso honestamente.
let contaAtual=null, contaTransporte=null;
{ const c=iniciar(); perfil=c.perfil;   // iniciar(): carrega + aplica/persiste grant inicial ou migração v2
  if(c.salvou && !c.salvou.ok) console.warn('perfil criado, mas a gravação falhou: '+c.salvou.erro);
  if(c.motivo && !/inacess/.test(c.motivo)) console.warn('perfil corrompido ('+c.motivo+') — recriei com o grant inicial'); }
configurarTurno({ redesenhar: render, emBatalha: ()=>rotaAtual()==='batalha',
  rotulo: (lado)=>rotuloLado(lado).toUpperCase() });
registrar('home',      { render: renderHome });
registrar('provacoes', { render: renderMissoes });    // F4/§213: MISSÕES (marcador honesto; chegam no PvP)
registrar('desafios',  { render: renderProvacoes });  // F4/§213: HUB de DESAFIOS (pergaminhos + semanal + composição)
registrar('colecao',   { render: renderColecao });    // F3.2: os 100 por panteão
registrar('deus',      { render: renderDeusDetalhe }); // F3.2: detalhe (kit + arte + Provação)
registrar('campanha',  { render: renderCampanha });   // F3.3: capítulo 1 (ensina as regras)
registrar('montartime',{ render: renderMontarTime }); // F3.3: escolha de time do encontro
registrar('composicao',{ render: renderDesafios });     // F3.6/§213: desafios de composição (sub-tela do hub)
registrar('desafiomontar',{ render: renderDesafioMontar });// F3.6: montador com validação de regra
registrar('embreve',   { render: renderEmBreve });   // marcador (F3.0)
registrar('selecao',   { render: renderPick,        aoEntrar: aoEntrarSelecao, aoSair: limparSobreposicao });
registrar('batalha',   { render: renderBatalha,     aoEntrar: iniciarRelogio,  aoSair: sairBatalha });
registrar('invocacao', { render: ()=>INV.montar(),                             aoSair: limparSobreposicao });
registrar('pvp',       { render: renderPvP,        aoEntrar: ()=>{ if(typeof pvpReset==='function') pvpReset(); } });  // F5.3/§236: o lobby do PvP (apelido + time + fila)
ir('home');
render();
ligarDiag();   // F0.6 passo 1: painel de diagnóstico (oculto; ?diag ou 3 toques no build)
ligarModoApp();// F0.6 passo 3: modo app (manifest embutido + tela cheia no 1º toque)
ligarPlataformaNativa();// §240: dentro do APK (Capacitor) — botão VOLTAR do Android + esconder o splash

// ============================================================
// §240 — PLATAFORMA NATIVA (o APK Capacitor, modelo servidor-apontado). Só faz efeito DENTRO do app:
// no navegador `window.Capacitor` não existe e tudo aqui é no-op. O jogo é servido pelo Render e roda
// na WebView com a PONTE do Capacitor injetada nessa origem (por causa do `server.url`), então o
// PRÓPRIO código do jogo fala com os plugins nativos — nada de editar o projeto Android à mão.
function _plataformaApp(){ return (typeof window!=='undefined') && window.Capacitor && window.Capacitor.Plugins; }
function ligarPlataformaNativa(){
  const P = _plataformaApp(); if(!P) return;   // navegador comum: sem plataforma nativa
  // 1) O SPLASH nativo cobre a tela ENQUANTO o servidor dorme acorda (~30s no Render grátis) — em vez de
  //    um branco de "app quebrado". Assim que a UI do jogo aparece, escondemos (o caso comum some em ~2-3s;
  //    o teto de 30s no config é a rede de segurança se o servidor estiver fora).
  if(P.SplashScreen && P.SplashScreen.hide){ try{ P.SplashScreen.hide(); }catch(e){} }
  // 2) O botão VOLTAR do Android = o que o "‹ Início" faz. NUNCA fecha o app no meio de uma partida
  //    (o router é uma pilha JS, sem history do navegador — sem isto o Android fecharia o app de cara).
  if(P.App && P.App.addListener && !window.__incBackLigado){
    window.__incBackLigado=true;
    P.App.addListener('backButton', ()=>{ voltarNativo(); });
  }
}
function voltarNativo(){
  // a) qualquer coisa ABERTA por cima fecha primeiro (menu ⋯, sobreposição, kit consultado, leitura)
  const temSobre = (typeof ov!=='undefined'&&ov) || (typeof menuAberto!=='undefined'&&menuAberto)
    || (typeof peekKit!=='undefined'&&peekKit) || (typeof detalhe!=='undefined'&&detalhe);
  if(temSobre){
    if(typeof menuAberto!=='undefined')menuAberto=false;
    if(typeof ov!=='undefined')ov=null;
    if(typeof peekKit!=='undefined')peekKit=null;
    if(typeof detalhe!=='undefined')detalhe=null;
    render(); return;
  }
  const r = (typeof rotaAtual==='function') ? rotaAtual() : null;
  // b) NA BATALHA: abre o confirmar-sair (o MESMO caminho do ⋯ → Sair). Não abandona direto, não fecha o app.
  if(r==='batalha'){ if(typeof ov!=='undefined')ov='sair'; render(); return; }
  // c) qualquer sub-tela: faz o que o "‹ Início" faz (desempilha; se não dá, vai pra home)
  if(r && r!=='home'){ if(!voltar()) ir('home',{},{substituir:true}); render(); return; }
  // d) JÁ NA HOME (a raiz): aí sim o padrão do Android — sai do app
  try{ window.Capacitor.Plugins.App.exitApp(); }catch(e){}
}

// ============================================================
// F5.1 — A CONTA no cliente. O jogador NUNCA vê login. DORMENTE sem servidor: aberto por file://
// ou com o servidor fora do ar, nada disto aparece e o app roda 100% local (as suítes caem aqui).
// As sobreposições (portão de idade, painel de conta) são DOM PRÓPRIO, fora do #stage — não
// passam pelo render() nem tocam nas telas. Só entram em cena quando há servidor.
// ============================================================
// F6/§234 — RE-BUSCAR a conta do servidor (progresso de missão AO VIVO). Chamada ao abrir a tela de
// Missões. THROTTLE (3s) + flag em voo impedem laço: render()->renderMissoes()->refrescarConta() volta
// no-op enquanto acabou de buscar. O progresso é do SERVIDOR (§228); o cliente só o desenha.
let _contaRefetchTs=0, _contaRefetchInflight=false;
async function refrescarConta(){
  if(!contaTransporte) return;
  if(_contaRefetchInflight || (Date.now()-_contaRefetchTs)<3000) return;
  _contaRefetchInflight=true;
  try{
    const t=(typeof lerToken==='function')?lerToken():null; if(!t) return;
    const r=await contaTransporte.pedir(envelope('entrar',{token:t}));
    if(r && r.tipo==='conta'){ contaAtual=r.conta; _contaRefetchTs=Date.now(); render(); }
  }catch(e){ /* mantém contaAtual */ }
  finally{ _contaRefetchInflight=false; }
}

// portão de IDADE (age-gate). NÃO é login: a lei explicada + duas escolhas de FAIXA. Sem e-mail,
// sem senha, sem data de nascimento. `aoEscolher(faixa)` recebe 'menor'|'maior'.
function montarPortaoIdade(aoEscolher){
  fecharPortaoIdade();
  const o=document.createElement('div'); o.id='portao-idade';
  o.setAttribute('style','position:fixed;inset:0;z-index:9000;display:flex;align-items:center;justify-content:center;background:rgba(8,6,20,.92);padding:20px;font-family:inherit');
  o.innerHTML=`<div style="max-width:520px;width:100%;background:#161230;border:1px solid #3a3170;border-radius:14px;padding:26px 24px;box-shadow:0 20px 60px rgba(0,0,0,.6)">
    <div style="font-size:12px;letter-spacing:.14em;color:#b9a94a;font-weight:800">ANTES DE COMEÇAR</div>
    <h2 style="margin:8px 0 12px;color:#efe9ff;font-size:22px">Qual a sua faixa de idade?</h2>
    <p style="margin:0 0 18px;color:#c3bce6;font-size:13.5px;line-height:1.55">A lei brasileira (15.211) proibe <b>aleatoriedade paga</b> para menores de 18. Por isso perguntamos a sua <b>faixa</b> - nunca a sua data de nascimento. Nao ha login nem cadastro: sua conta ja foi criada, so falta isto.</p>
    <div style="display:flex;flex-direction:column;gap:10px">
      <button id="pi-maior" style="cursor:pointer;padding:15px;border-radius:10px;border:1px solid #4a3f88;background:#241d52;color:#efe9ff;font-size:16px;font-weight:700;font-family:inherit">Tenho 18 anos ou mais</button>
      <button id="pi-menor" style="cursor:pointer;padding:15px;border-radius:10px;border:1px solid #4a3f88;background:#1c1740;color:#d8d2f5;font-size:16px;font-weight:700;font-family:inherit">Sou menor de 18</button>
    </div>
    <p style="margin:16px 0 0;color:#8b83b8;font-size:11.5px;line-height:1.5">Se voce responder aqui, sera pelo que informou. O jogo cumpre a lei ao perguntar e registrar a faixa.</p>
  </div>`;
  document.body.appendChild(o);
  const esc=(f)=>{ const b=o.querySelector('#pi-maior'), m=o.querySelector('#pi-menor'); if(b)b.disabled=true; if(m)m.disabled=true; aoEscolher(f); };
  o.querySelector('#pi-maior').onclick=()=>esc('maior');
  o.querySelector('#pi-menor').onclick=()=>esc('menor');
}
function fecharPortaoIdade(){ const o=document.getElementById('portao-idade'); if(o)o.remove(); }

// botao DISCRETO de conta (canto): so aparece logado. Abre o painel da conta (onde mora a exclusao).
function montarBotaoConta(){
  if(document.getElementById('conta-botao'))return;
  const b=document.createElement('button'); b.id='conta-botao'; b.textContent='conta';
  b.setAttribute('style','position:fixed;left:8px;bottom:8px;z-index:8000;padding:5px 11px;border-radius:8px;border:1px solid #3a3170;background:rgba(22,18,48,.85);color:#a99fe0;font-size:11px;font-weight:700;font-family:inherit;cursor:pointer;letter-spacing:.04em');
  b.onclick=montarPainelConta;
  document.body.appendChild(b);
}
function removerBotaoConta(){ const b=document.getElementById('conta-botao'); if(b)b.remove(); }

// painel da CONTA: mostra o que ha (anonima, faixa, ranque zero) e o caminho de EXCLUSAO. A
// exclusao apaga TUDO no servidor (nao e marcacao) e devolve o aparelho a primeira abertura.
function montarPainelConta(){
  const c=contaAtual||{};
  const idc=(c.id||'').slice(0,8), faixa=c.faixaIdade==='menor'?'menor de 18':c.faixaIdade==='maior'?'18 ou mais':'-';
  const rq=(c.ranque&&typeof c.ranque.pontos==='number')?c.ranque.pontos:0;
  const o=document.createElement('div'); o.id='painel-conta';
  o.setAttribute('style','position:fixed;inset:0;z-index:9000;display:flex;align-items:center;justify-content:center;background:rgba(8,6,20,.92);padding:20px;font-family:inherit');
  o.innerHTML=`<div style="max-width:520px;width:100%;background:#161230;border:1px solid #3a3170;border-radius:14px;padding:24px;box-shadow:0 20px 60px rgba(0,0,0,.6)">
    <div style="display:flex;justify-content:space-between;align-items:baseline">
      <h2 style="margin:0;color:#efe9ff;font-size:20px">Sua conta</h2>
      <button id="pc-fechar" style="cursor:pointer;background:none;border:none;color:#a99fe0;font-size:13px;font-weight:700;font-family:inherit">Fechar</button>
    </div>
    <p style="margin:10px 0 14px;color:#c3bce6;font-size:13px;line-height:1.55">Conta <b>anonima</b> - sem login, sem e-mail, sem nome. A identidade vive num <b>token</b> guardado neste aparelho.</p>
    <div style="background:#1c1740;border-radius:10px;padding:12px 14px;color:#d8d2f5;font-size:13px;line-height:1.7">
      <div>id <b style="color:#efe9ff;font-family:monospace">${idc||'-'}</b></div>
      <div>faixa de idade <b style="color:#efe9ff">${faixa}</b></div>
      <div>ranque <b style="color:#efe9ff">${rq}</b> <span style="color:#8b83b8">(comeca em zero)</span></div>
      <div>nick <span style="color:#8b83b8">reservado - chega no PvP</span></div>
    </div>
    <div id="pc-zonaexcluir" style="margin-top:18px;border-top:1px solid #2a2455;padding-top:16px">
      <div style="font-size:12px;letter-spacing:.1em;color:#d06a6a;font-weight:800">EXCLUIR CONTA</div>
      <p style="margin:8px 0 12px;color:#c3bce6;font-size:12.5px;line-height:1.55">Apaga <b>tudo</b> no servidor - id, token, faixa, ranque, colecao e progresso. <b>Nada</b> e preservado (conta anonima, sem obrigacao legal de reter). O aparelho volta a primeira abertura.</p>
      <button id="pc-excluir" style="cursor:pointer;padding:11px 16px;border-radius:9px;border:1px solid #7a2e2e;background:#3a1616;color:#f4c9c9;font-size:14px;font-weight:700;font-family:inherit">Excluir minha conta</button>
    </div>
  </div>`;
  document.body.appendChild(o);
  o.querySelector('#pc-fechar').onclick=()=>o.remove();
  o.onclick=(ev)=>{ if(ev.target===o)o.remove(); };
  o.querySelector('#pc-excluir').onclick=()=>{
    const z=o.querySelector('#pc-zonaexcluir');
    z.innerHTML=`<div style="font-size:12px;letter-spacing:.1em;color:#d06a6a;font-weight:800">TEM CERTEZA?</div>
      <p style="margin:8px 0 12px;color:#c3bce6;font-size:12.5px;line-height:1.55">Isto e definitivo. A conta e apagada de verdade no servidor.</p>
      <div style="display:flex;gap:8px">
        <button id="pc-cancelar" style="cursor:pointer;padding:11px 16px;border-radius:9px;border:1px solid #4a3f88;background:#241d52;color:#efe9ff;font-size:14px;font-weight:700;font-family:inherit">Cancelar</button>
        <button id="pc-confirmar" style="cursor:pointer;padding:11px 16px;border-radius:9px;border:1px solid #7a2e2e;background:#5a1f1f;color:#ffd7d7;font-size:14px;font-weight:700;font-family:inherit">Sim, excluir</button>
      </div>`;
    z.querySelector('#pc-cancelar').onclick=()=>o.remove();
    z.querySelector('#pc-confirmar').onclick=async()=>{
      z.querySelector('#pc-confirmar').disabled=true;
      await excluirContaFluxo();
      o.remove();
    };
  };
}

// fluxo de EXCLUSAO: exclui no servidor + apaga o local + volta a primeira abertura (reabre o
// portao de idade, ja que ha servidor e nao ha mais token). O perfil local tambem e apagado.
async function excluirContaFluxo(){
  try { if(contaTransporte) await excluir(contaTransporte); } catch(e){}
  contaAtual=null;
  apagarDados();          // zera o perfil local (mesma recriacao do "Apagar dados")
  removerBotaoConta();
  render();
  // volta a primeira abertura: com servidor e sem token, pergunta a faixa de novo (nasce outra conta)
  if(contaTransporte){
    montarPortaoIdade(async(faixa)=>{
      const rc=await criarConta(contaTransporte,{faixaIdade:faixa,tinhaPerfil:false,perfilLocal:null});
      if(rc&&rc.fase==='entrou'){ contaAtual=rc.conta; fecharPortaoIdade(); montarBotaoConta(); render(); }
    });
  }
}

// F5.2 — INICIAR UMA PARTIDA NO SERVIDOR (o oponente é a IA rodando no servidor; testa o protocolo
// inteiro sem depender do pareamento da F5.3). Reusa a tela de batalha: o `st` desenhado passa a ser
// o da partida-cliente (MP.st); armar/confirmar/encerrar viram pedidos ao servidor (turno.js, modo
// online); o servidor é dono do fim e do relógio. Exige conta (token) e servidor no ar.
async function iniciarPartidaServidor(pergaminhoKey){
  if(!contaTransporte){ console.warn('sem servidor: partida no servidor indisponível'); return { erro:'sem servidor' }; }
  const token = (typeof lerToken==='function') ? lerToken() : null;
  if(!token){ console.warn('sem conta: crie a conta antes'); return { erro:'sem conta' }; }
  const mp = await PARTIDA_CLI.novaPartida(contaTransporte, pergaminhoKey, { token });
  if(!mp || mp.erro){ console.warn('partida no servidor falhou: '+((mp&&mp.erro)||'?')); return mp||{erro:'falhou'}; }
  prova=null; provaFim=null; provaLances=0; campanha=null; campanhaFim=null;   // não é Provação/Campanha local
  vsCPU=true;                                   // perspectiva fixa no humano (o oponente é a IA do servidor)
  st=mp.st;
  entrarModoOnline(mp, contaTransporte, token);  // turno.js passa a rotear ação/relógio/IA para o servidor (com o token)
  if(contaTransporte.aoPush) contaTransporte.aoPush(aoPushGlobal);   // pushes: relógio, jogada do oponente (PvP), pareamento
  ir('batalha', {}, { substituir:true });
  render();
  return mp;
}

// DESPACHANTE de pushes do servidor: numa partida (ehOnline) -> desenha o que chegou (relógio/oponente);
// FORA de partida -> só o pareamento do PvP (o jogador que esperava recebe a partida por push).
function aoPushGlobal(msg){
  if(typeof ehOnline==='function' && ehOnline()){ receberPushOnline(msg); return; }
  if(msg && msg.tipo==='partida' && msg.pareado){ const mp=PARTIDA_CLI.absorverPareado(msg); if(mp) entrarPvPBatalha(mp); }
}

// F5.3 — entra na tela de batalha de uma partida PvP (pareada). vsCPU=false: o oponente é humano.
function entrarPvPBatalha(mp){
  prova=null; provaFim=null; provaLances=0; campanha=null; campanhaFim=null;
  vsCPU=false; st=mp.st;
  entrarModoOnline(mp, contaTransporte, lerToken());
  ir('batalha', {}, { substituir:true });
  render();
}

// F5.3 — INICIAR PvP: define o nick (na ENTRADA do PvP, não na 1ª abertura), entra na fila com o time
// (o servidor valida a POSSE), e ao parear entra na batalha. Se ficar na fila, o pareamento chega por push.
async function iniciarPvP(nick, time){
  if(!contaTransporte) return { erro:'sem servidor' };
  const token = (typeof lerToken==='function') ? lerToken() : null;
  if(!token) return { erro:'sem conta' };
  if(nick){ const rn=await PARTIDA_CLI.definirNick(contaTransporte,{token,nick}); if(!rn.ok) return { erro:rn.erro, codigo:rn.codigo }; }
  if(contaTransporte.aoPush) contaTransporte.aoPush(aoPushGlobal);   // garante o despachante (recebe o pareamento por push)
  const r=await PARTIDA_CLI.entrarFila(contaTransporte,{token,time});
  if(r.fase==='pareado'){ entrarPvPBatalha(r.MP); return { fase:'pareado' }; }
  if(r.fase==='recusado') return { erro:r.erro, codigo:r.codigo };
  return r;   // na_fila: espera o push de pareamento
}

// F5.5 — INICIAR RANQUEADO: como o PvP, mas na fila CIENTE DE FAIXA. A partida vale pontos; ao fim,
// o servidor manda a mudança de faixa e o cliente desenha o banner (montarBannerRanque).
async function iniciarRanqueado(nick, time){
  if(!contaTransporte) return { erro:'sem servidor' };
  const token=(typeof lerToken==='function')?lerToken():null;
  if(!token) return { erro:'sem conta' };
  if(nick){ const rn=await PARTIDA_CLI.definirNick(contaTransporte,{token,nick}); if(!rn.ok) return { erro:rn.erro, codigo:rn.codigo }; }
  if(contaTransporte.aoPush) contaTransporte.aoPush(aoPushGlobal);
  const r=await PARTIDA_CLI.entrarFilaRanqueada(contaTransporte,{token,time});
  if(r.fase==='pareado'){ entrarPvPBatalha(r.MP); return { fase:'pareado' }; }
  if(r.fase==='recusado') return { erro:r.erro, codigo:r.codigo };
  return r;
}

// F5.5 — BANNER de mudança de faixa ao fim de uma partida ranqueada. O SERVIDOR computou (subiu/desceu,
// pontos, faixa antes->depois); o cliente só DESENHA. DOM próprio, fora do #stage.
function montarBannerRanque(res){
  if(!res || document.getElementById('banner-ranque')) return;
  const subiu=res.subiu, desceu=res.desceu, venceu=res.venceu;
  const de=(res.faixaAntes&&res.faixaAntes.nome)||'', para=(res.faixa&&res.faixa.nome)||'';
  const delta=res.pontos-res.pontosAntes;
  const cor = subiu? '#b9a94a' : desceu? '#d06a6a' : '#a99fe0';
  const titulo = subiu? 'SUBIU DE FAIXA' : desceu? 'CAIU DE FAIXA' : (venceu?'VITÓRIA RANQUEADA':'DERROTA RANQUEADA');
  const o=document.createElement('div'); o.id='banner-ranque';
  o.setAttribute('style','position:fixed;inset:0;z-index:9500;display:flex;align-items:center;justify-content:center;background:rgba(8,6,20,.9);padding:20px;font-family:inherit');
  o.innerHTML=`<div style="max-width:460px;width:100%;background:#161230;border:1px solid ${cor};border-radius:16px;padding:28px 26px;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.6)">
    <div style="font-size:12px;letter-spacing:.16em;color:${cor};font-weight:800">${titulo}</div>
    <div style="margin:14px 0 6px;color:#efe9ff;font-size:30px;font-weight:800">${H(para)}</div>
    ${(subiu||desceu)&&de&&de!==para?`<div style="color:#8b83b8;font-size:14px">${H(de)} → <b style="color:${cor}">${H(para)}</b></div>`:''}
    <div style="margin:16px 0 4px;color:#efe9ff;font-size:22px;font-weight:800">${delta>=0?'+':''}${delta} <span style="font-size:13px;color:#8b83b8;font-weight:600">pontos</span></div>
    <div style="color:#c3bce6;font-size:13px">${res.pontos} pts nesta temporada</div>
    <button id="br-ok" style="margin-top:20px;cursor:pointer;padding:12px 28px;border-radius:10px;border:1px solid #4a3f88;background:#241d52;color:#efe9ff;font-size:15px;font-weight:700;font-family:inherit">Continuar</button>
  </div>`;
  document.body.appendChild(o);
  o.querySelector('#br-ok').onclick=()=>{ o.remove(); sairModoOnline(); ir('home',{},{substituir:true}); render(); };
}

// F5.4 — RETOMAR a partida do servidor na reabertura/reconexão. No Android a WebView morre a cada
// troca de app: reconectar é o caminho NORMAL. Pergunta ao servidor se a conta tem partida em curso;
// se sim, recebe o ESTADO INTEIRO e volta à batalha, sem replay animado (o log conta o que houve).
async function retomarPartidaServidor(token){
  if(!contaTransporte || !token) return { fase:'semPartida' };
  const r = await PARTIDA_CLI.retomar(contaTransporte, { token });
  if(!r || r.fase!=='retomada') return r||{ fase:'erro' };
  const mp = r.MP;
  prova=null; provaFim=null; provaLances=0; campanha=null; campanhaFim=null;
  vsCPU=true; st=mp.st;
  entrarModoOnline(mp, contaTransporte, token);
  if(contaTransporte.aoPush) contaTransporte.aoPush(aoPushGlobal);
  ir('batalha', {}, { substituir:true });
  render();
  return r;
}

// BOOT da conta: handshake + token guardado. Sem servidor -> dormente (retorna cedo, app local).
(async function bootConta(){
  try {
    if(typeof criarTransporteWS!=='function') return;
    const trans=await criarTransporteWS();
    if(!trans) return;                          // file:// ou servidor fora: modo local, sem conta
    contaTransporte=trans;
    const r=await iniciarConta(trans,{});
    if(r.fase==='entrou'){ contaAtual=r.conta; montarBotaoConta();
      if(trans.aoPush) trans.aoPush(aoPushGlobal);   // pronto para receber pareamento/relógio/oponente
      // F5.4: reconectou com token válido — havia partida em curso? Retoma antes de qualquer coisa.
      try { await retomarPartidaServidor(lerToken()); } catch(e){}
    }
    else if(r.fase==='perguntarFaixa'){
      montarPortaoIdade(async(faixa)=>{
        const rc=await criarConta(trans,{faixaIdade:faixa,tinhaPerfil:_tinhaPerfilAntes,perfilLocal:perfil});
        if(rc&&rc.fase==='entrou'){ contaAtual=rc.conta; fecharPortaoIdade(); montarBotaoConta(); render(); }
      });
    }
  } catch(e){ /* qualquer falha na conta: o app segue local */ }
})();
