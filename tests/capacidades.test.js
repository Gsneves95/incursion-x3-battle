const E=require('../src/engine.js');
let f=0;const ok=(c,m)=>{if(!c){console.log('  FALHA: '+m);f++}};

console.log('== classe é da HABILIDADE, não do deus ==');
{
  const st=E.novoEstado(['nezha','nezha','nezha'],['zeus','zeus','zeus'],3);
  const u=st.lados[0].units[0];
  st.lados[0].orbs['Chama']=9;
  let acs=E.acoesDe(st,u);
  const cls=acs.filter(a=>a.slot!=='defesa').map(a=>a.classe);
  ok(new Set(cls).size===3,'Nezha (Híbrido) deveria ter 3 classes distintas: '+cls.join('/'));
  console.log('  Nezha: '+cls.join(' / ')+'  -> nenhum silêncio de classe cala o kit todo');

  // Zeus trava só as Mágicas
  u.efeitos.push({type:'silenceClass',cls:'Mágico',dur:2});
  acs=E.acoesDe(st,u);
  ok(acs.find(a=>a.slot==='milagre').motivo,'o Milagre Mágico deveria travar');
  ok(acs.find(a=>a.slot==='habilidade').disponivel,'o Arsenal (Mental no modo Anel) NÃO deveria travar');
  console.log('  silêncio Mágico: Milagre travado, Arsenal Mental livre');

  // ao alternar para Manto o Arsenal vira Aflição, segue livre
  u.efeitos=[]; E.agir(st,u.uid,'habilidade',[st.lados[1].units[0].uid]);
  ok(u.modo===1,'deveria alternar de modo');
  ok(E.acoesDe(st,u).find(a=>a.slot==='habilidade').classe==='Aflição','no modo Manto a classe deveria virar Aflição');
  console.log('  Arsenal troca de classe com o modo: Mental -> Aflição');
}

console.log('== seleção de 2 alvos: 2 inimigos com valores diferentes ==');
{
  const st=E.novoEstado(['thor','thor','thor'],['zeus','zeus','zeus'],7);
  const u=st.lados[0].units[0]; st.lados[0].orbs['Tempestade']=9;
  const a=E.acoesDe(st,u).find(x=>x.slot==='habilidade');
  ok(a.passos.length===2,'Arremesso deveria pedir 2 alvos');
  const c0=E.alvosValidos(st,u,a,0,[]);
  ok(c0.length===3,'passo 1: 3 candidatos');
  const c1=E.alvosValidos(st,u,a,1,[c0[0].uid]);
  ok(c1.length===2,'passo 2: o já escolhido deveria sair da lista');
  const [t1,t2]=[st.lados[1].units[0],st.lados[1].units[1]];
  E.agir(st,u.uid,'habilidade',[t1.uid,t2.uid]);
  ok(t1.hp===120-22,`1º alvo deveria levar 22, levou ${120-t1.hp}`);
  ok(t2.hp===120-12,`2º alvo deveria levar 12, levou ${120-t2.hp}`);
  console.log(`  ${t1.nome} -22 / ${t2.nome} -12  (ordem respeitada)`);
}

console.log('== seleção de 2 aliados: Bênção Real ==');
{
  const st=E.novoEstado(['hera','zeus','ogum'],['tyr','tyr','tyr'],11);
  const u=st.lados[0].units[0]; st.lados[0].orbs['Tempestade']=9;
  const a=E.acoesDe(st,u).find(x=>x.slot==='habilidade');
  ok(a.passos.join()==='aliado,aliado','deveria pedir 2 aliados');
  const b=st.lados[0].units[1], c=st.lados[0].units[2];
  E.agir(st,u.uid,'habilidade',[b.uid,c.uid]);
  ok(E.ef(b,'dmgUp')&&E.ef(c,'dmgUp'),'os dois aliados deveriam receber +dano');
  ok(E.ef(b,'dmgReduction')&&E.ef(c,'dmgReduction'),'os dois deveriam receber redução');
  ok(!E.ef(u,'dmgUp'),'a própria Hera não foi escolhida, não deveria receber');
  console.log('  buff aplicado exatamente nos 2 escolhidos');
}

console.log('== vínculo divide o dano entre os dois ==');
{
  const st=E.novoEstado(['hera','zeus','ogum'],['ogum','ogum','ogum'],13);
  const u=st.lados[0].units[0]; st.lados[0].orbs['Tempestade']=9;
  const b=st.lados[0].units[1], c=st.lados[0].units[2];
  E.agir(st,u.uid,'milagre',[b.uid,c.uid]);
  ok(E.ef(b,'vinculo')&&E.ef(c,'vinculo'),'os dois deveriam ficar vinculados');
  ok(E.ef(b,'controlImmune'),'e imunes a controle');
  E.fimTurno(st);
  st.lados[1].orbs['Verdejante']=9;
  const hb=b.hp, hc=c.hp;
  E.agir(st,st.lados[1].units[0].uid,'basico',[b.uid]);   // 15 perfurante
  const perdaB=hb-b.hp, perdaC=hc-c.hp;
  ok(perdaB>0&&perdaC>0,`o golpe deveria atingir os dois (${perdaB}/${perdaC})`);
  ok(Math.abs(perdaB-perdaC)<=1,'as metades deveriam ser iguais');
  console.log(`  golpe de 15 -> ${perdaB} em ${b.nome} + ${perdaC} em ${c.nome}`);
}

console.log('== escudo existe: passiva da Hera + Ogum destrói ==');
{
  const st=E.novoEstado(['hera','brigid','zeus'],['ogum','ogum','ogum'],17);
  st.lados[0].orbs['Chama']=9;
  E.agir(st,st.lados[0].units[1].uid,'habilidade',[]);      // Chama Sagrada cura o time
  const escudos=st.lados[0].units.filter(x=>x.shield>0).length;
  ok(escudos===3,`a cura deveria dar escudo aos 3 (deu a ${escudos})`);
  const alvo=st.lados[0].units[2];
  const s0=alvo.shield;
  E.fimTurno(st);
  st.lados[1].orbs['Verdejante']=9;
  E.agir(st,st.lados[1].units[0].uid,'habilidade',[alvo.uid]);  // Abrir Caminho à Força
  ok(alvo.shield===0,`Ogum deveria zerar o escudo (${s0} -> ${alvo.shield})`);
  console.log(`  cura -> escudo 10 nos 3 \u00b7 Ogum zera (${s0} -> 0)`);
}

console.log('== Thor: redução de 6 para o time todo ==');
{
  const st=E.novoEstado(['zeus','zeus','zeus'],['thor','tyr','cuca'],19);
  st.lados[0].orbs['Tempestade']=9;
  const alvo=st.lados[1].units[2];   // Cuca, sem redução própria
  E.agir(st,st.lados[0].units[0].uid,'basico',[alvo.uid]);   // 15 afetado
  ok(120-alvo.hp===9,`15 menos 6 do Thor = 9, deu ${120-alvo.hp}`);
  st.lados[1].units[0].vivo=false;
  const h=alvo.hp;
  E.agir(st,st.lados[0].units[1].uid,'basico',[alvo.uid]);
  ok(h-alvo.hp===15,`sem Thor vivo deveria levar 15, levou ${h-alvo.hp}`);
  console.log('  Thor vivo: 9 \u00b7 Thor caído: 15');
}

// §266 — infoPassiva: a passiva SE ANUNCIA quando age (a base do "P acende" e da leitura com valor/fonte).
console.log('== §266 infoPassiva: passiva agindo vs parada, e a aura legível a partir do AFETADO ==');
{
  // aura INCONDICIONAL (Brígida +5 no time): a dona age; os 2 aliados RECEBEM, com a FONTE
  const st=E.novoEstado(['brigid','apolo','tyr'],['zeus','zeus','zeus'],3);
  const [b,ap]=st.lados[0].units;
  const iB=E.infoPassiva(st,b), iAp=E.infoPassiva(st,ap);
  ok(iB.propria.some(x=>x.gat==='bonusDano'&&x.v===5),'Brígida: a própria aura +5 aparece como AGINDO');
  ok(iAp.recebidas.some(x=>x.v===5&&x.fonte==='brigid'),'o aliado AFETADO lê o +5 e a FONTE (Brígida) — a aura é legível a partir de quem recebe');
  // SÓ-ALVO (Ogum +10 vs defendido): PARADA em repouso, AGE ao mirar um alvo que casa
  const st2=E.novoEstado(['ogum','tyr','zeus'],['zeus','zeus','zeus'],3);
  const og=st2.lados[0].units[0], alvo=st2.lados[1].units[0];
  ok(E.infoPassiva(st2,og).propria.length===0,'Ogum PARADO em repouso (a condição alvoDefesa não vale sem alvo)');
  alvo.efeitos.push({type:'dmgReduction',v:10,dur:9});
  const iOg=E.infoPassiva(st2,og,{uid:og.uid,alvos:[alvo.uid]});
  ok(iOg.propria.some(x=>x.gat==='bonusDano'&&x.v===10),'Ogum AGE ao mirar o alvo defendido (+10 explica o 25)');
  // CAMPO/SELF (Amaterasu redução no time, gated por Dia): parada sem fase, age no Dia
  const st3=E.novoEstado(['amaterasu','tyr','zeus'],['zeus','zeus','zeus'],3);
  const al=st3.lados[0].units[1];
  ok(E.infoPassiva(st3,al).recebidas.length===0,'Amaterasu: sem fase, a redução não age');
  st3.fase='Dia';
  ok(E.infoPassiva(st3,al).recebidas.some(x=>x.gat==='reducao'&&x.fonte==='amaterasu'),'Amaterasu: no Dia a redução age e é legível no aliado');
  console.log('  Brígida aura legível no afetado · Ogum acende ao mirar · Amaterasu acende no Dia');
}
// §267 — simetria da defesa: a redução com `contra` só acende quando o golpe MIRADO casa o filtro (senão engana).
console.log('== §267 redução com `contra`: acende SÓ quando o golpe mirado casa (simetria do §266) ==');
{
  const st=E.novoEstado(['zeus'],['sobek','poseidon','afrodite'],3);
  const atk=st.lados[0].units[0]; const [sobek,pos,afro]=st.lados[1].units;
  const reduzOn=(u,g)=>E.infoPassiva(st,u,g?{uid:atk.uid,alvos:[u.uid],golpe:g}:null).propria.some(x=>x.gat==='reducao');
  // sobek: contra={slot:'basico'}
  ok(!reduzOn(sobek,null),'sobek (contra=básico): PARADO em repouso — não engana sem golpe mirado');
  ok(reduzOn(sobek,{slot:'basico',classe:'Físico',elem:'Tempestade',unico:true}),'sobek ACENDE com golpe BÁSICO mirado (casa o contra)');
  ok(!reduzOn(sobek,{slot:'habilidade',classe:'Mágico',elem:'Tempestade',unico:true}),'sobek NÃO acende com HABILIDADE mirada (não casa — o indicador não engana)');
  // afrodite: contra={alcance:'unico'}
  ok(reduzOn(afro,{slot:'basico',classe:'Físico',elem:'x',unico:true}),'afrodite (contra=único) ACENDE com golpe ÚNICO');
  ok(!reduzOn(afro,{slot:'habilidade',classe:'Mágico',elem:'x',unico:false}),'afrodite NÃO acende com golpe de ÁREA');
  // poseidon: SEM contra — redução permanente, de pé mesmo em repouso
  ok(reduzOn(pos,null),'poseidon (sem contra): redução PERMANENTE acende em repouso (de pé, como a aura incondicional)');
  console.log('  contra-redução gateada pelo golpe · redução permanente de pé');
}

console.log('== §271 geraContadorPorGolpe gateado por `estado`: Raijin intacto, Fujin condicional ==');
{
  const comboApos=(time,quemBate)=>{
    const st=E.novoEstado(time,['tyr','sobek','cuca'],5,0);
    const u=st.lados[0].units.find(x=>x.key===quemBate); const alvo=st.lados[1].units[0];
    E.ELEMS.forEach(e=>st.lados[0].orbs[e]=5);
    E.agir(st,u.uid,'basico',[alvo.uid]);
    return E.getContadorLado(st,0,'combo');
  };
  ok(comboApos(['raijin','zeus','ogum'],'raijin')===1,'Raijin sem estado gera Combo por golpe (incondicional, intacto)');   // BABÁ
  ok(comboApos(['fujin','zeus','ogum'],'fujin')===0,'Fujin sem Raijin no time NÃO gera Combo (estado não casa)');   // BABÁ
  ok(comboApos(['fujin','raijin','zeus'],'fujin')===1,'Fujin com Raijin no time gera Combo (estado casa)');   // BABÁ
  // gate genérico: é vocabulário, não código de deus
  E.GODS.tgc={key:'tgc',nome:'TGC',faccao:'T',elem:'Chama',classe:'Físico',funcao:'Atacante',
    passiva:{nome:'p',desc:'d',fx:[{gatilho:'geraContadorPorGolpe',contador:'combo',v:1,max:20,estado:{aliadoPresente:'zeus'}}]},
    ab:[{slot:'basico',classe:'Físico',nome:'b',cost:{},cd:0,alvo:'inimigo',fx:[{t:'dmg',v:10}]}]};
  ok(comboApos(['tgc','zeus','ogum'],'tgc')===1,'gate genérico: com o aliado exigido, gera');   // BABÁ
  ok(comboApos(['tgc','tyr','ogum'],'tgc')===0,'gate genérico: sem o aliado exigido, NÃO gera');   // BABÁ
  delete E.GODS.tgc;
  // §266: a passiva do Fujin é LEGÍVEL — o P acende só com Raijin em campo
  const pOn=time=>{const st=E.novoEstado(time,['tyr','sobek','cuca'],5,0); const fj=st.lados[0].units.find(x=>x.key==='fujin'); return E.infoPassiva(st,fj).propria.some(x=>x.gat==='geraContadorPorGolpe');};
  ok(pOn(['fujin','raijin','zeus']),'Fujin: P acende com Raijin no time (legível, não só funcional)');   // BABÁ
  ok(!pOn(['fujin','zeus','ogum']),'Fujin: P NÃO acende sem Raijin (o indicador não engana)');   // BABÁ
  console.log('  Raijin intacto · Fujin gera/legível só com Raijin · gate é vocabulário (data, não motor)');
}

console.log('');
console.log(f===0?'>>> NOVAS CAPACIDADES OK':`>>> ${f} FALHA(S)`);
process.exit(f?1:0);
