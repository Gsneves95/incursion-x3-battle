// Experimentos do medir_dominios (fase 1). Chamado por medir_dominios.js.
const M = require('./medir_dominios.js');
const { corrida, corridasN, batalha, CULT, trioAmostra, KEYS, GODS, buildCat, med } = M;
const EXP = process.argv[2] || 'all';
const N = parseInt(process.argv[3], 10) || 40;
const CULTS = Object.keys(CULT).filter(c => CULT[c].length >= 3);
const run = e => EXP === 'all' || EXP === String(e);

function mulberry32(a){ return function(){ a|=0; a=(a+0x6D2B79F5)|0; let t=Math.imul(a^(a>>>15),1|a); t=(t+Math.imul(t^(t>>>7),61|t))^t; return ((t^(t>>>14))>>>0)/4294967296; }; }

if (run(1)) {
  console.log(`\n### 1) LINHA DE BASE — 3 fixos vs trios sorteados, 1,0×, cura 25, N=${N} por cultura`);
  console.log('cultura        depth  min  p50  max   turnos/batalha');
  for (const c of CULTS) {
    const r = corridasN({ trio: trioAmostra(c), heal: 25, maxLevel: 60 }, N);
    console.log(`${c.padEnd(13)}  med ${r.med.toFixed(1).padStart(4)}  ${String(r.min).padStart(3)}  ${String(r.p50).padStart(3)}  ${String(r.max).padStart(3)}   ${r.tMed.toFixed(1)}`);
  }
}

if (run(2)) {
  console.log(`\n### 2) INFLAR VIDA vs INFLAR DANO (trio Grega, cura 25, flat no run inteiro), N=${N}`);
  const trio = trioAmostra('Celta');
  console.log('  VIDA inflada:   +%    depth(med)  turnos/batalha');
  for (const x of [0, 0.25, 0.50, 1.0]) { const r = corridasN({ trio, heal: 25, hpMul: () => 1 + x, maxLevel: 60 }, N); console.log(`                +${(x*100).toFixed(0).padStart(3)}%   ${r.med.toFixed(1).padStart(5)}       ${r.tMed.toFixed(1)}`); }
  console.log('  DANO inflado:   +%    depth(med)  turnos/batalha');
  for (const x of [0, 0.25, 0.50, 1.0]) { const r = corridasN({ trio, heal: 25, dmgMul: () => 1 + x, maxLevel: 60 }, N); console.log(`                +${(x*100).toFixed(0).padStart(3)}%   ${r.med.toFixed(1).padStart(5)}       ${r.tMed.toFixed(1)}`); }
}

if (run(3)) {
  console.log(`\n### 3) CURA PARCIAL 10..60 (trio Grega, 1,0×), N=${N} — dispersão?`);
  console.log('  cura   depth(med)  min  p50  max   turnos');
  const trio = trioAmostra('Celta');
  for (const h of [10, 20, 30, 40, 50, 60]) { const r = corridasN({ trio, heal: h, maxLevel: 80 }, N); console.log(`   ${String(h).padStart(3)}    ${r.med.toFixed(1).padStart(5)}     ${String(r.min).padStart(3)}  ${String(r.p50).padStart(3)}  ${String(r.max).padStart(3)}   ${r.tMed.toFixed(1)}`); }
}

if (run(4)) {
  console.log(`\n### 4) VARIÂNCIA DO SORTEIO — trio Grega FULL HP vs 200 trios aleatórios (1 batalha cada)`);
  const trio = trioAmostra('Celta');
  const rng = mulberry32(12345); let win = 0, loss = 0, draw = 0; const turnosWin = [];
  for (let i = 0; i < 200; i++) {
    const pool = KEYS.filter(k => !trio.includes(k)); const en = []; while (en.length < 3) { const g = pool[Math.floor(rng()*pool.length)]; if (!en.includes(g)) en.push(g); }
    const r = batalha(trio, en, (i*7919)>>>0, buildCat(trio,1,en,1), [{hp:120,vivo:true},{hp:120,vivo:true},{hp:120,vivo:true}], 1);
    if (r.venc===0){win++;turnosWin.push(r.turnos);} else if(r.venc==='empate')draw++; else loss++;
  }
  console.log(`  de 200 trios: VITÓRIA ${win} (${(win/2).toFixed(0)}%) · DERROTA ${loss} (${(loss/2).toFixed(0)}%) · empate ${draw}`);
  console.log(`  → um único nível (full HP) já perde ${(loss/2).toFixed(0)}% das vezes: o sorteio é ${loss>60?'RUÍDO ALTO':'moderado'}. turnos quando vence: ${med(turnosWin).toFixed(1)}`);
}

if (run(5)) {
  console.log(`\n### 5) TETO DO BÔNUS DE DANO — jogador com +% de dano (trio Grega, cura 25), N=${N}`);
  console.log('  +dano  depth(med)  min  max');
  const trio = trioAmostra('Celta');
  for (const x of [0, 0.10, 0.20, 0.30, 0.50, 1.0]) { const r = corridasN({ trio, heal: 25, pDmg: 1 + x, maxLevel: 80 }, N); console.log(`  +${(x*100).toFixed(0).padStart(3)}%   ${r.med.toFixed(1).padStart(5)}     ${String(r.min).padStart(3)}  ${String(r.max).padStart(3)}`); }
}

if (run(6)) {
  console.log(`\n### 6) O QUE QUEBRA numa sequência — inspeção de estado`);
  // (a) passivas de ABERTURA disparam a cada nível (cada batalha é um novoEstado)
  const abertura = KEYS.filter(k => (GODS[k].passiva && (GODS[k].passiva.fx||[]).some(f => f.gatilho==='abertura')));
  console.log(`  a) ${abertura.length} deuses têm passiva de ABERTURA (ex.: ${abertura.slice(0,4).join(', ')}) — dispara a CADA nível (cada batalha = novoEstado). Numa corrida, "começa a partida com..." vira "a cada nível".`);
  // (b) contadores por-LADO que crescem: combo/etc — resetam? no meu modelo cada batalha é fresh → resetam. Numa sequência REAL de estado carregado, cresceriam.
  const geradores = KEYS.filter(k => (GODS[k].passiva && (GODS[k].passiva.fx||[]).some(f => f.gatilho==='geraContadorPorGolpe')) || (GODS[k].ab||[]).some(a=>(a.fx||[]).some(e=>e.t==='contador')));
  console.log(`  b) ${geradores.length} deuses geram CONTADOR de lado (combo/disco/atadura...). No modelo "vida carrega, resto reseta" eles zeram por nível (correto). Se o estado inteiro carregasse, o combo cresceria sem teto entre níveis.`);
  // (c) efeitos que deveriam expirar: no meu modelo cada batalha é novoEstado → efeitos (dur) somem. Correto SE o design reseta efeitos entre níveis.
  // (d) "uma vez por partida": revive/vidaExtra/etc.
  const umaVez = KEYS.filter(k => (GODS[k].ab||[]).some(a=>(a.fx||[]).some(e=>['revive','reviveProximoTurno','vidaExtra'].includes(e.t))) || (GODS[k].passiva&&(GODS[k].passiva.fx||[]).some(f=>f.gatilho==='aoCair')));
  console.log(`  d) ${umaVez.length} deuses têm revive/vidaExtra/aoCair (efeitos "de partida"). Numa corrida reseta por nível (revive volta a cada nível) — decisão: o revive é por-nível ou por-corrida?`);
  console.log(`  MODELO DESTA MEDIÇÃO: cada nível é um novoEstado; CARREGA só hp+vivo do jogador; cd/efeitos/contadores RESETAM. É o modelo limpo — o motor nunca some estado sozinho entre partidas, então uma corrida com estado carregado precisa de reset explícito.`);
}
