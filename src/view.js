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
ir('home');
render();
ligarDiag();   // F0.6 passo 1: painel de diagnóstico (oculto; ?diag ou 3 toques no build)
ligarModoApp();// F0.6 passo 3: modo app (manifest embutido + tela cheia no 1º toque)
