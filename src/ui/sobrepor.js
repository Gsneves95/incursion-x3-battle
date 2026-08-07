// ui/sobrepor.js — sobreposições: troca de energia, energia livre, registro,
// ajuda, rendição, resultado da partida.
function trocaHTML(){
  const l=st.lados[st.ativo];
  const g=convAlvo?planoConversao(l,convAlvo):null;
  const proprios=new Set(l.units.filter(u=>u.vivo).map(u=>u.elem));
  const opts=ELEMS.map(e=>{
    const alcanca=proprios.has(e)||l.orbs[e]>0;
    return `<button class="copt ${convAlvo===e?'on':''}" data-ct="${e}" ${alcanca?'':'disabled'}
      title="${alcanca?'':'nenhum deus seu usa este elemento'}">
      <span class="copt__d" style="background:${COR(e)}"></span>
      <span class="copt__n">${H(ELAB[e])}</span>
      <span class="copt__q">${l.orbs[e]}</span></button>`;}).join('');
  const troca=g?`<div class="ctrade">
      <span class="ctrade__g">${ELEMS.filter(e=>g[e]>0).map(e=>
        Array(g[e]).fill(`<i class="ctrade__p" style="background:${COR(e)}"></i>`).join('')).join('')}</span>
      <span class="ctrade__t">gasta ${CONV_CUSTO}</span>
      <span class="ctrade__a">\u2192</span>
      <span class="ctrade__t">recebe 1</span>
      <span class="ctrade__g"><i class="ctrade__p" style="background:${COR(convAlvo)}"></i></span>
    </div>`:'';
  return `<div class="ov" id="ovconv"><div class="cbox">
    <div class="cbox__h"><h2>Trocar energia</h2>
      <span>${CONV_CUSTO} quaisquer \u2192 1 \u00b7 uma vez por turno</span></div>
    <div class="cbox__b">
      <div class="cbox__lbl">O que você quer receber?</div>
      <div class="cgrid">${opts}</div>
      ${troca}
    </div>
    ${convAlvo?'':`<div class="cnote">A taxa é ruim de propósito: é saída de emergência para sorteio azarado, não engrenagem do turno. O cronômetro do turno continua correndo.</div>`}
    <div class="cbox__f">
      <button class="b b--quiet b--md" id="ctcanc">Cancelar</button>
      <button class="b b--ok b--md" id="ctok" ${g?'':'disabled'}>Confirmar troca</button>
    </div></div></div>`;
}

function livreHTML(){
  const l=st.lados[st.ativo], devido=l.dividaLivre||0;
  const escolhido=ELEMS.reduce((s,e)=>s+(livrePlano[e]||0),0);
  const faltam=devido-escolhido;
  const opts=ELEMS.map(e=>{
    const disp=l.orbs[e]||0, m=livrePlano[e]||0;
    return `<button class="copt ${m>0?'on':''}" data-lv="${e}" ${disp>0?'':'disabled'}>
      <span class="copt__d" style="background:${COR(e)}"></span>
      <span class="copt__n">${H(ELAB[e])}</span>
      <span class="copt__q">${m}/${disp}</span></button>`;}).join('');
  return `<div class="ov" id="ovlivre"><div class="cbox">
    <div class="cbox__h"><h2>Pagar energia livre</h2>
      <span>escolha <b>${devido}</b> ${devido>1?'orbes':'orbe'} · ${faltam>0?`faltam ${faltam}`:'pronto'}</span></div>
    <div class="cbox__b">
      <div class="cbox__lbl">Quais orbes pagam o custo livre deste turno?</div>
      <div class="cgrid">${opts}</div></div>
    <div class="cbox__f">
      <button class="b b--quiet b--md" id="lvlimpar">Limpar</button>
      <button class="b b--ok b--md" id="lvok" ${faltam===0?'':'disabled'}>Confirmar e encerrar</button>
    </div></div></div>`;
}

function overlayHTML(){
  if(ov==='livre')return livreHTML();
  if(ov==='conv')return trocaHTML();
  if(st.fim){
    return `<div class="ov"><div class="ovbox"><div class="result">
      <h1>${H(st.fim)}</h1><p>ENCERROU NO TURNO ${st.turno}</p>
      <button class="b b--primary b--lg" id="bnew">Nova batalha</button></div></div></div>`;
  }
  if(ov==='log'){
    return `<div class="ov"><div class="ovbox"><div class="ovh"><h2>REGISTRO</h2>
      <span class="sub">${st.log.length} EVENTOS</span>
      <span class="push"><button class="b b--quiet b--md" id="bclose">Fechar</button></span></div>
      <div class="ovb" id="logscroll">${st.log.slice(-200).map(r=>
        `<div class="log__row ${/caiu|vence|Turno|Empate|renasceu/.test(r.msg)?'hi':''}"><b>${r.turno}</b><span>${H(r.msg)}</span></div>`
      ).join('')}</div></div></div>`;
  }
  if(ov==='help'){
    return `<div class="ov"><div class="ovbox"><div class="ovh"><h2>COMO JOGAR</h2>
      <span class="sub">3V3 \u00b7 120 DE VIDA \u00b7 TURNOS ALTERNADOS</span>
      <span class="push"><button class="b b--quiet b--md" id="bclose">Fechar</button></span></div>
      <div class="ovb" style="font-size:13px;font-weight:600;line-height:1.5">
      <p style="margin:0 0 9px"><b style="color:var(--gold-text)">TURNO</b> \u2014 cada uma das suas 3 unidades faz UMA ação por turno: uma das 3 habilidades ou a Defesa. Elas resolvem uma por vez, na ordem que você escolher — e a ordem importa, porque o estado atualiza entre elas.</p>
      <p style="margin:0 0 9px"><b style="color:var(--gold-text)">ENERGIA</b> \u2014 existem 6 elementos no jogo, mas um time de 3 deuses gera no máximo 3 tipos: você recebe 1 energia por unidade viva por turno, sorteada entre os elementos do seu próprio time. Por isso o topo mostra só os tipos que te interessam — as habilidades de um deus custam o elemento dele ou energia livre, então guardar tipo alheio não serviria de nada. Perder uma unidade é perder economia, não só dano.</p>
      <p style="margin:0 0 9px"><b style="color:var(--gold-text)">CONVERSÃO</b> \u2014 toque numa pílula de energia para converter ${CONV_CUSTO} quaisquer em 1 do tipo escolhido, uma vez por turno, sem gastar a ação. A taxa é ruim de propósito: é saída de emergência para sorteio azarado, não engrenagem do turno.</p>
      <p style="margin:0 0 9px"><b style="color:var(--gold-text)">TOCAR NÃO GASTA</b> \u2014 o primeiro toque numa habilidade só mostra o que ela faz e a arma. O gasto só acontece quando você toca no alvo ou em CONFIRMAR. Pílula de custo com contorno vermelho é energia que você ainda não tem.</p>
      <p style="margin:0 0 9px"><b style="color:var(--gold-text)">DEFESA</b> \u2014 toda unidade tem. Custa 1 energia livre, recarga 4, e deixa a unidade Invulnerável por 1 turno. Gasta a ação. Dano contínuo já aplicado atravessa a Invulnerabilidade.</p>
      <p style="margin:0 0 9px"><b style="color:var(--gold-text)">EFEITOS</b> \u2014 a faixa na base de cada retrato mostra os buffs, debuffs e danos contínuos ativos naquela unidade, com o número de turnos restantes. Vale para os dois times. Toque em qualquer ícone para ler o que ele faz; toque no "P" para a passiva do deus e no retrato para a ficha completa.</p>
      <p style="margin:0 0 9px"><b style="color:var(--gold-text)">ESPIAR O INIMIGO</b> \u2014 cada unidade inimiga tem uma alça estreita ao lado do retrato. Toque para abrir as 4 habilidades dela e ver o que fazem e quantos turnos faltam de recarga. Abre uma por vez e fecha ao virar o turno. Um ponto verde na alça avisa que a Defesa daquela unidade está em recarga — ou seja, ela não pode ficar Invulnerável neste turno.</p>
      <p style="margin:0"><b style="color:var(--gold-text)">VITÓRIA</b> \u2014 derrube as 3 unidades inimigas. Se ninguém fechar até o turno 40, ganha quem tiver mais vida somada — a partir do turno 30 o relógio passa a mostrar "TURNO N/40" para avisar. Cada turno tem 60 segundos; se acabar, ele encerra sozinho.</p>
      </div></div></div>`;
  }
  if(ov==='surr'){
    return `<div class="ov"><div class="ovbox"><div class="result">
      <h1>RENDER-SE?</h1><p>O JOGADOR ${st.ativo+1} PERDE A BATALHA</p>
      <div style="display:flex;gap:8px;justify-content:center">
        <button class="b b--quiet b--md" id="bclose">Voltar</button>
        <button class="b b--danger b--md" id="bsurrok">Confirmar rendição</button></div></div></div></div>`;
  }
  return '';
}

/* ---------- eventos das sobreposições (conversão, energia livre, registro, ajuda, rendição, resultado) ---------- */
function ligarSobrepor(){
  const q=s=>stage.querySelector(s);
  stage.querySelectorAll('[data-ct]').forEach(b=>{if(b.disabled)return;
    b.onclick=()=>{convAlvo=convAlvo===b.dataset.ct?null:b.dataset.ct;render();};});
  const cc=q('#ctcanc'); if(cc)cc.onclick=()=>{ov=null;convAlvo=null;render();};
  const co=q('#ctok'); if(co&&!co.disabled)co.onclick=()=>{
    const r=converter(st,convAlvo);
    if(!r.ok)st.log.push({turno:st.turno,msg:'✗ '+r.erro});
    ov=null;convAlvo=null;render();};
  const oc=q('#ovconv'); if(oc)oc.onclick=ev=>{if(ev.target===oc){ov=null;convAlvo=null;render();}};
  // overlay de energia livre (escolha no fim do turno)
  stage.querySelectorAll('[data-lv]').forEach(b=>{if(b.disabled)return;
    b.onclick=()=>{ const e=b.dataset.lv, l=st.lados[st.ativo];
      const escolhido=ELEMS.reduce((s,x)=>s+(livrePlano[x]||0),0), faltam=(l.dividaLivre||0)-escolhido, m=livrePlano[e]||0;
      if(m<(l.orbs[e]||0)&&faltam>0)livrePlano[e]=m+1; else livrePlano[e]=0;   // clique cicla; se cheio, zera
      render();};});
  const ll=q('#lvlimpar'); if(ll)ll.onclick=()=>{livrePlano={};render();};
  const lo=q('#lvok'); if(lo&&!lo.disabled)lo.onclick=()=>{
    const r=alocarLivre(st,livrePlano);
    if(r.ok){ov=null;livrePlano={};encerrarTurno();}
    else{st.log.push({turno:st.turno,msg:'✗ '+r.erro});render();}};
  const ol=q('#ovlivre'); if(ol)ol.onclick=ev=>{if(ev.target===ol){ov=null;livrePlano={};render();}};
  const bl=q('#bclose'); if(bl)bl.onclick=()=>{ov=null;render();};
  const bso=q('#bsurrok'); if(bso)bso.onclick=()=>{
    st.fim=`JOGADOR ${2-st.ativo} VENCE`; st.log.push({turno:st.turno,msg:`Jogador ${st.ativo+1} rendeu-se.`});
    ov=null;render();};
  const bn=q('#bnew'); if(bn)bn.onclick=()=>{
    // sai da batalha para a seleção pedindo um recomeço (aoEntrarSelecao zera a grade);
    // aoSair(batalha) para o relógio e limpa a sobreposição.
    ir('selecao',{novo:true},{substituir:true});render();};
  const ls=q('#logscroll'); if(ls)ls.scrollTop=ls.scrollHeight;
}
