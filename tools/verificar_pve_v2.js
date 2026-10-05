// ===================================================================
// INCURSION x3 Battle — VERIFICAR WINNABILITY do PvE sob a IA v2 (§322 Parte 3)
// Roda o solucionador (versao:2) em TODO conteúdo de PvE com solução verificável e escreve o MANIFESTO
// data/ia_winnability_v2.json — a prova de quais MODOS podem usar a v2 (REGRA: só v2 se TODO item VENCÍVEL).
//
// Modos verificáveis por solução fixa:
//   rito         — data/provacoes/*.json (os pergaminhos; = "desafioDeus", que reusa a mesma data)
//   campanha     — encontros de batalha de data/campanha.json (+ data/campanha/*.json); slot livre resolvido
//   semanal      — data/semanais.json .puzzles
//   composicao   — data/composicao.json .desafios: TIME LIVRE do jogador (sem solução única) → NÃO verificável
//                  por este método; o manifesto marca naoVerificavel=true (a REGRA o mantém na v1).
// Domínios e sandbox NÃO têm solução fixa (corrida/livre) — ficam fora do manifesto; a tabela os põe em v2 e a
// mudança de dificuldade é reportada à parte (tools/medir_dominios_exp.js / medir_ia).
//
//   node tools/verificar_pve_v2.js [--modos=rito,campanha,semanal,composicao] [--orc=200000] [--versao=2]
// Sem --modos: todos. Atualiza só os modos pedidos no manifesto (merge).
// ===================================================================
'use strict';
const fs = require('fs');
const path = require('path');
const E = require(path.join(__dirname, '..', 'src', 'engine.js'));
Object.assign(global, E);
// campanha usa inimigos do BESTIÁRIO (silfo/ghoul/…), não só deuses — o motor lê o catálogo BESTIARIO do global.
try { const { BESTIARIO } = require(path.join(__dirname, '..', 'src', 'bestiario.js')); global.BESTIARIO = BESTIARIO; } catch (e) { /* sem bestiário: campanha pode falhar */ }
const SOL = require(path.join(__dirname, 'solucionador.js'));

const arg = (n, d) => { const p = process.argv.find(a => a.startsWith('--' + n + '=')); return p ? p.split('=')[1] : d; };
const VERSAO = parseInt(arg('versao', '2'), 10);
const ORC = parseInt(arg('orc', '200000'), 10);
const MODOS = (arg('modos', 'rito,campanha,semanal,composicao')).split(',').map(s => s.trim()).filter(Boolean);
const MANIFESTO = path.join(__dirname, '..', 'data', 'ia_winnability_v2.json');

const keysGods = Object.keys(E.GODS);
const TIME_LIVRE = ['zeus', 'ogum', 'sobek'];   // trio canônico p/ resolver um slot livre (deuses que existem no roster)
function resolverAliados(al) {
  if (al == null) return TIME_LIVRE.slice();
  const out = al.map(s => typeof s === 'string' ? s : (s && (s.deus || (s.travado && s.deus))) || null);
  // preenche vagas livres com o trio canônico, sem repetir
  let fill = TIME_LIVRE.filter(k => !out.includes(k));
  return out.map(k => k || fill.shift()).filter(Boolean);
}

function listaRitos() {
  const dir = path.join(__dirname, '..', 'data', 'provacoes');
  return fs.readdirSync(dir).filter(f => f.endsWith('.json')).map(f => {
    const p = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    return { id: p.key || f.replace('.json', ''), nome: p.titulo || p.key, prov: p };
  });
}
function listaCampanha() {
  const out = [];
  const arqs = ['data/campanha.json'];
  const dir = path.join(__dirname, '..', 'data', 'campanha');
  if (fs.existsSync(dir)) for (const f of fs.readdirSync(dir)) if (f.endsWith('.json') && f !== 'indice.json') arqs.push(path.join('data', 'campanha', f));
  for (const rel of arqs) {
    const abs = path.join(__dirname, '..', rel); if (!fs.existsSync(abs)) continue;
    const c = JSON.parse(fs.readFileSync(abs, 'utf8'));
    for (const e of (c.encontros || [])) {
      if (!e.inimigos) continue;   // só encontros de BATALHA
      out.push({ id: e.id, nome: (c.nome ? c.nome + ' · ' : '') + (e.nome || e.id), prov: { aliados: resolverAliados(e.aliados), inimigos: e.inimigos, montar: e.montar || {}, condicoes: e.condicoes || [] } });
    }
  }
  return out;
}
function listaSemanal() {
  const s = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'semanais.json'), 'utf8'));
  return (s.puzzles || []).map((p, i) => ({ id: p.key || ('puzzle' + i), nome: p.key || ('puzzle ' + i), prov: p }));
}

function verificarModo(nome, itens) {
  const res = { total: itens.length, vencivel: 0, naoVencivel: [], orc: ORC, versao: VERSAO };
  const t0 = Date.now();
  for (const it of itens) {
    let r;
    try { r = SOL.resolver(it.prov, { orcamentoNos: ORC, versao: VERSAO }); }
    catch (e) { r = { veredito: 'ERRO', motivo: String(e && e.message) }; }
    if (r.veredito === 'VENCIVEL') res.vencivel++;
    else res.naoVencivel.push({ id: it.id, nome: it.nome, veredito: r.veredito, motivo: r.motivo || '' });
    process.stdout.write(`  ${nome}/${it.id}: ${r.veredito}\n`);
  }
  res.segundos = Math.round((Date.now() - t0) / 1000);
  res.ok = res.naoVencivel.length === 0;
  return res;
}

function carregarManifesto() { try { return JSON.parse(fs.readFileSync(MANIFESTO, 'utf8')); } catch (e) { return { _nota: 'Winnability do PvE sob a IA v2 (§322 P3). Gerado por tools/verificar_pve_v2.js. ok=true → o modo pode usar a v2.', modos: {} }; } }

const manifesto = carregarManifesto();
manifesto.modos = manifesto.modos || {};
console.log(`=== §322 P3 — winnability sob IA v${VERSAO} (orçamento ${ORC} nós/item) ===`);

for (const m of MODOS) {
  if (m === 'composicao') {
    manifesto.modos.composicao = { total: 0, vencivel: 0, naoVencivel: [], naoVerificavel: true, _nota: 'time do jogador é LIVRE (sem solução única) — não verificável por este método; a REGRA mantém na v1 até a Fase 5.' };
    console.log('  composicao: NÃO VERIFICÁVEL (time livre) → v1 por regra'); continue;
  }
  const itens = m === 'rito' ? listaRitos() : m === 'campanha' ? listaCampanha() : m === 'semanal' ? listaSemanal() : null;
  if (!itens) { console.log('  modo desconhecido:', m); continue; }
  console.log(`\n--- ${m} (${itens.length} itens) ---`);
  manifesto.modos[m] = verificarModo(m, itens);
}
manifesto.geradoEm = new Date().toISOString();
fs.writeFileSync(MANIFESTO, JSON.stringify(manifesto, null, 2) + '\n');

console.log('\n=== RESUMO ===');
for (const m of Object.keys(manifesto.modos)) {
  const x = manifesto.modos[m];
  if (x.naoVerificavel) { console.log(`  ${m.padEnd(11)}: NÃO VERIFICÁVEL → v1`); continue; }
  console.log(`  ${m.padEnd(11)}: ${x.vencivel}/${x.total} vencível → ${x.ok ? 'PODE v2' : 'v1'}${x.naoVencivel.length ? '  (' + x.naoVencivel.map(n => n.id + ':' + n.veredito).slice(0, 6).join(', ') + (x.naoVencivel.length > 6 ? '…' : '') + ')' : ''}`);
}
console.log('manifesto →', path.relative(path.join(__dirname, '..'), MANIFESTO));
