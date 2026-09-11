// ===================================================================
// INCURSION — MEDIDOR do modo DOMÍNIOS (fase 1: medir para desenhar).
// NÃO é produção: simula uma CORRIDA (sequência de batalhas 3v3 com vida que
// carrega + cura parcial), IA gulosa dos dois lados, para achar a PROFUNDIDADE
// e a DISPERSÃO. Reusa o motor; nada de tela nem dado de produção.
//   node tools/medir_dominios.js [experimento]   (1..6, ou 'all')
// ===================================================================
const path = require('path');
const E = require(path.join(__dirname, '..', 'src', 'engine.js'));
Object.assign(global, E);
const { iaProximaAcao } = require(path.join(__dirname, '..', 'src', 'ia.js'));
const GODS = E.GODS;
const KEYS = Object.keys(GODS);

// culturas = facção → deuses
const CULT = {};
for (const k of KEYS) { const f = GODS[k].faccao; (CULT[f] = CULT[f] || []).push(k); }

// PRNG determinístico
function mulberry32(a){ return function(){ a|=0; a=(a+0x6D2B79F5)|0; let t=Math.imul(a^(a>>>15),1|a); t=(t+Math.imul(t^(t>>>7),61|t))^t; return ((t^(t>>>14))>>>0)/4294967296; }; }
function pick3(rng, pool, exclude){ const p=pool.filter(k=>!exclude.includes(k)); const out=[]; while(out.length<3 && p.length){ const i=Math.floor(rng()*p.length); out.push(p.splice(i,1)[0]); } return out; }

// ---- scaler de dano no catálogo (só as chaves indicadas) ----
function scaleFx(fx, mul){ for(const e of (fx||[])){ if(!e||typeof e!=='object')continue;
  if(e.t==='dmg'){ if(typeof e.v==='number')e.v=Math.round(e.v*mul); if(Array.isArray(e.posicional))e.posicional=e.posicional.map(x=>Math.round(x*mul));
    for(const kk of ['seEncharcado','seAdormecido','seDia']) if(typeof e[kk]==='number')e[kk]=Math.round(e[kk]*mul); }
  for(const kk of ['entao','senao','agenda','faz']) if(Array.isArray(e[kk]))scaleFx(e[kk],mul); } }
function buildCat(playerKeys, pMul, enemyKeys, eMul){
  const cat={}; for(const k of KEYS) cat[k]=GODS[k];   // default: referência normal
  const clone=k=>JSON.parse(JSON.stringify(GODS[k]));
  if(pMul!==1) for(const k of playerKeys){ const g=clone(k); (g.ab||[]).forEach(a=>scaleFx(a.fx,pMul)); cat[k]=g; }
  if(eMul!==1) for(const k of enemyKeys){ if(playerKeys.includes(k))continue; const g=clone(k); (g.ab||[]).forEach(a=>scaleFx(a.fx,eMul)); cat[k]=g; }
  return cat;
}

// ---- uma batalha: gulosa × gulosa, devolve {venc, turnos} ----
function batalha(player, enemy, seed, cat, playerHp, enemyHpMul){
  const st=E.novoEstado(player, enemy, seed, 0, null, cat);   // comeca=0: o jogador abre
  // vida que CARREGA no lado do jogador
  st.lados[0].units.forEach((u,i)=>{ const c=playerHp[i]; if(c.vivo){ u.hp=Math.min(u.maxHp,c.hp); } else { u.hp=0; u.vivo=false; } });
  if(enemyHpMul!==1) st.lados[1].units.forEach(u=>{ u.maxHp=Math.round(u.maxHp*enemyHpMul); u.hp=u.maxHp; });
  let guard=0, turnos=0;
  while(!st.fim && guard++<500){ let passos=0,a; while(!st.fim && (a=iaProximaAcao(st)) && passos++<8) E.agir(st,a.uid,a.slot,a.alvos,a.escolhas); if(st.fim)break; E.fimTurno(st); turnos++; }
  const venc = st.fim ? (st.fim.resultado==='vitoria'?st.fim.lado : (st.fim.resultado==='empate'?'empate':1)) : 'timeout';
  const hpFim = st.lados[0].units.map(u=>({hp:u.hp,vivo:u.vivo}));
  return { venc, turnos, hpFim };
}

// ---- uma corrida ----
function corrida({trio, seedBase, heal=25, hpMul=()=>1, dmgMul=()=>1, pDmg=1, maxLevel=60, bossEvery=10}){
  let carry = trio.map(()=>({hp:120,vivo:true}));   // deuses nascem com 120 (default do motor)
  const turnosPorNivel=[];
  for(let nivel=1; nivel<=maxLevel; nivel++){
    // cura parcial a cada nível (menos o 1º), nos vivos
    if(nivel>1) carry=carry.map(c=>c.vivo?{hp:Math.min(120,c.hp+heal),vivo:true}:c);
    if(carry.every(c=>!c.vivo)) return {depth:nivel-1, turnos:turnosPorNivel, morteNivel:nivel-1};
    const rng=mulberry32((seedBase*2654435761 ^ nivel*40503)>>>0);
    let enemy;
    const ehChefe = nivel%bossEvery===0;
    if(ehChefe){ const cults=Object.keys(CULT).filter(c=>CULT[c].length>=3); const c=cults[Math.floor(rng()*cults.length)]; enemy=pick3(rng,CULT[c],trio); }
    else enemy=pick3(rng,KEYS,trio);
    const cat=buildCat(trio,pDmg,enemy,dmgMul(nivel));
    const r=batalha(trio,enemy,(seedBase^nivel*7919)>>>0,cat,carry,hpMul(nivel));
    turnosPorNivel.push(r.turnos);
    if(r.venc===0){ carry=r.hpFim; }   // jogador venceu: carrega a vida final
    else return {depth:nivel-1, turnos:turnosPorNivel, morteNivel:nivel};   // morreu/empatou/timeout neste nível
  }
  return {depth:maxLevel, turnos:turnosPorNivel, morteNivel:null};   // sobreviveu ao teto
}

const med=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:0;
const trioAmostra = c => CULT[c].slice(0,3);   // trio representativo (os 3 primeiros da cultura)
function corridasN(opts, N){ const ds=[]; const ts=[]; for(let s=1;s<=N;s++){ const r=corrida({...opts,seedBase:s}); ds.push(r.depth); ts.push(...r.turnos); } ds.sort((a,b)=>a-b); return {ds, tMed:med(ts), min:ds[0], max:ds[ds.length-1], med:med(ds), p50:ds[Math.floor(ds.length/2)]}; }

const EXP = process.argv[2] || 'all';
const N = parseInt(process.argv[3],10) || 40;
// ... experimentos definidos no main abaixo; ver runExp
module.exports = { corrida, corridasN, batalha, CULT, trioAmostra, KEYS, GODS, buildCat, med };

if (require.main === module) require('./medir_dominios_exp.js');
