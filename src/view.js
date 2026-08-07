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

// Perfil do jogador (persistido; ver src/perfil.js + src/armazenamento.js). Carregado
// no bootstrap; a F0.4b liga o pity do gacha a ele.
let perfil=null;

// Apaga TODOS os dados: limpa as chaves, zera o perfil em memória e regrava o novo.
// salvar() não é silencioso — se a escrita falhar, avisa no registro da partida.
function apagarDados(){
  apagar(); perfil=novoPerfil();
  const r=salvar(perfil);
  if(!r.ok && st) st.log.push({turno:st.turno,msg:'⚠ dados apagados, mas a gravação falhou: '+r.erro});
}

/* ---------- navegação ---------- */
function voltarInvocacao(){ if(!voltar())ir('selecao',{},{substituir:true}); render(); }

// Ganchos de ciclo de vida das telas (usados pelos hooks de rota). A limpeza de
// sobreposição mora AQUI, num lugar só; parar o relógio é do turno.js.
function limparSobreposicao(){ armado=null;alvos=[];escolhidos=[];detalhe=null;abaFoe=null;convAlvo=null;menuAberto=false;ov=null;livrePlano={}; }
function sairBatalha(){ pararRelogio(); limparSobreposicao(); }

// render() despacha pela ROTA: chama o gancho de render da tela atual.
function render(){ const h=hooksAtuais(); if(h.render)h.render(); }

function renderBatalha(){
  const l=st.lados[st.ativo], o=st.lados[1-st.ativo];
  const prontas=l.units.filter(u=>podeAgir(u)).length;

  stage.innerHTML = `<div class="stage__bg"></div><div class="stage__scrim"></div>
  <div class="field"><i></i><i></i><i></i><i></i></div>
  ${topoHTML()}
  <div class="stagemark">INCURSION</div>
  <section class="team team--ally">${l.units.map(u=>`
    <article class="unit ${u.vivo&&!podeAgir(u)?'acted':''}">${retrato(u,false)}${habilidades(u)}
    </article>`).join('')}</section>
  <section class="team team--enemy">${o.units.map(u=>`
    <article class="unit--enemy">${foeAba(u)}${retrato(u,true)}</article>`).join('')}</section>
  <footer class="footer">
    ${detalheHTML()}
    <button class="b b--primary b--lg endturn" id="bend">
      <span class="endturn__l1">Encerrar turno</span>
      <span class="endturn__hint">${l.dividaLivre>0?`escolher ${l.dividaLivre} energia livre`:(prontas?prontas+(prontas>1?' unidades a agir':' unidade a agir'):'todas agiram')}</span>
    </button>
  </footer>
  ${overlayHTML()}`;

  hpAnt={}; todas().forEach(u=>hpAnt[u.uid]=u.hp);
  if(peek){const el=stage.querySelector(`[data-look="${peek}"]`); if(el)el.classList.add('peek'); peek=null;}
  ligar(); fit();
}

// ligar() é só DESPACHANTE: cada módulo liga o próprio DOM. talvezIA (turno.js)
// roda por último — se for a vez da CPU, ela joga sozinha.
function ligar(){
  ligarCampo(); ligarTopo(); ligarPainel(); ligarSobrepor();
  talvezIA();
}

/* ---------- bootstrap: carrega o perfil, injeta o turno, registra as telas ---------- */
// Carrega o perfil. Só avisa se o dado estava CORROMPIDO (perda real); ambiente sem
// localStorage é começo normal — o alarme de gravação (salvar) cobre a impossibilidade
// de persistir, que é o que de fato importa ao jogador.
{ const c=carregar(); perfil=c.perfil; if(c.motivo && !/inacess/.test(c.motivo))console.warn('perfil corrompido ('+c.motivo+') — comecei do zero'); }
configurarTurno({ redesenhar: render, emBatalha: ()=>rotaAtual()==='batalha' });
registrar('selecao',   { render: renderPick,        aoEntrar: aoEntrarSelecao, aoSair: limparSobreposicao });
registrar('batalha',   { render: renderBatalha,     aoEntrar: iniciarRelogio,  aoSair: sairBatalha });
registrar('invocacao', { render: ()=>INV.montar(),                             aoSair: limparSobreposicao });
ir('selecao');
render();
