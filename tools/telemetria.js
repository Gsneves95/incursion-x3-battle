// tools/telemetria.js — LÊ a telemetria e imprime um relatório legível. "Um número que ninguém consulta
// não existe" — este é o jeito de VER os dados sem escrever consulta. Rode:  node tools/telemetria.js
// (ou `npm run telemetria`). Responde as 5 perguntas do §22 e destaca as NUNCA-USADAS e os 4 suspeitos F4.
const fs = require('fs'), path = require('path');
const telemetria = require('../server/telemetria.js');

// CATÁLOGO: todos os deuses × habilidades ativas (basico/habilidade/milagre) de data/deuses/. É o que
// permite listar as NUNCA-USADAS (habilidade do catálogo com 0 uso registrado).
function carregarCatalogo() {
  const dir = path.join(__dirname, '..', 'data', 'deuses');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(f => f.endsWith('.json')).map(f => {
    const d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    return { key: d.key, nome: d.nome, ab: (d.ab || []).filter(a => ['basico', 'habilidade', 'milagre'].includes(a.slot)) };
  });
}
// os 4 SUSPEITOS de "slot morto" da Fase 4 (§189): a arena com IA Difícil os previu em "nunca usadas".
// A telemetria de gente real é a SEGUNDA evidência. Se concordar, o rebalanceamento é decisão informada.
const SUSPEITOS_F4 = ['xango', 'cernunnos', 'hercules', 'shutendoji'];

function pct(x) { return x == null ? '  —  ' : (x * 100).toFixed(1).padStart(4) + '%'; }
function pad(s, n) { s = String(s); return s.length >= n ? s : s + ' '.repeat(n - s.length); }

function main() {
  const cat = carregarCatalogo();
  const nomeDe = {}; for (const g of cat) { nomeDe[g.key] = g.nome; for (const a of g.ab) nomeDe[g.key + ':' + a.slot] = a.nome; }
  const r = telemetria.relatorio(cat);

  console.log('\n================ TELEMETRIA (§22) — o que gente de verdade escolhe e usa ================');
  console.log(`partidas PvP registradas: ${r.partidas}`);
  if (!r.partidas) { console.log('\n(ainda não há partidas PvP registradas — jogue algumas e rode de novo.)\n'); return; }
  console.log(`duração média: ${r.duracaoMedia} turnos   ·   abandono: ${pct(r.taxaAbandono)} (${r.abandonos}/${r.partidas})`);

  console.log('\n-- DURAÇÃO (histograma de turnos) — o relógio/prazo está calibrado? --');
  Object.keys(r.duracao).sort().forEach(b => console.log(`  ${b}: ${'█'.repeat(Math.min(40, r.duracao[b]))} ${r.duracao[b]}`));

  console.log('\n-- TAXA DE VITÓRIA por deus (desequilíbrio) — ordenada, extremos no topo/rodapé --');
  const comStats = r.porDeus.filter(d => d.jogou >= 1).sort((a, b) => (b.taxaVitoria || 0) - (a.taxaVitoria || 0));
  comStats.forEach(d => console.log(`  ${pad(nomeDe[d.deus] || d.deus, 16)} vitória ${pct(d.taxaVitoria)}  ·  uso ${pct(d.taxaUso)}  ·  jogou ${d.jogou}`));

  console.log('\n-- NUNCA USADAS (habilidade do catálogo com 0 uso) — a lista que a Fase 4 quer --');
  if (!r.nuncaUsadas.length) console.log('  (nenhuma — toda habilidade já foi usada ao menos uma vez)');
  else r.nuncaUsadas.sort((a, b) => a.deus.localeCompare(b.deus)).forEach(s => console.log(`  ${pad((nomeDe[s.deus] || s.deus) + ' / ' + s.slot, 26)} ${s.nome || ''}`));

  console.log('\n-- SUSPEITOS DA FASE 4 (§189) — a arena os previu em "nunca usadas"; a telemetria confirma ou desmente --');
  for (const g of SUSPEITOS_F4) {
    const gg = cat.find(x => x.key === g); if (!gg) continue;
    const linha = gg.ab.map(a => { const u = (r.slotsUsados.find(s => s.chave === g + ':' + a.slot) || {}).usos || 0; return `${a.slot}:${u}`; }).join('  ');
    const suspeita = gg.ab.map(a => ({ a, u: (r.slotsUsados.find(s => s.chave === g + ':' + a.slot) || {}).usos || 0 })).sort((x, y) => x.u - y.u)[0];
    console.log(`  ${pad(gg.nome, 14)} ${pad(linha, 34)} ← menos usada: ${suspeita.a.nome} (${suspeita.u})`);
  }
  console.log('\n  ELO FASE 4: quando houver dado suficiente, "nunca usadas" + os suspeitos acima são a 2ª evidência');
  console.log('  sobre Balança do Xangô, reflexo do Cernunnos, grind do Hércules e roubo do Shutendoji.\n');
}

main();
