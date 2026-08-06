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
  ok(t1.hp===100-22,`1º alvo deveria levar 22, levou ${100-t1.hp}`);
  ok(t2.hp===100-12,`2º alvo deveria levar 12, levou ${100-t2.hp}`);
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
  ok(100-alvo.hp===9,`15 menos 6 do Thor = 9, deu ${100-alvo.hp}`);
  st.lados[1].units[0].vivo=false;
  const h=alvo.hp;
  E.agir(st,st.lados[0].units[1].uid,'basico',[alvo.uid]);
  ok(h-alvo.hp===15,`sem Thor vivo deveria levar 15, levou ${h-alvo.hp}`);
  console.log('  Thor vivo: 9 \u00b7 Thor caído: 15');
}

console.log('');
console.log(f===0?'>>> NOVAS CAPACIDADES OK':`>>> ${f} FALHA(S)`);
process.exit(f?1:0);
