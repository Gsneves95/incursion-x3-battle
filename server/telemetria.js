// server/telemetria.js — F5 (§22): TELEMETRIA. "Faça ANTES de lançar, não depois" — sem ela, balancear
// 100 deuses é opinião de fórum; com ela, evidência. A arena determinística mede o MOTOR (3200 partidas,
// IA gulosa); a telemetria mede o JOGADOR: o que gente de verdade ESCOLHE e USA.
//
// AGREGADO, NÃO EVENTO (decisão do dono): nada de fluxo de evento por ação — só CONTADORES que respondem
// as perguntas. Menos dado, mesma resposta, nada a vazar.
//
// LGPD POR DESENHO (decisão do dono, §221): NADA identifica o jogador — nem a conta anônima entra aqui.
// Guardamos só o QUE aconteceu (deus, habilidade, turnos, abandono), NUNCA quem. Sem id, sem token, sem
// localização, sem aparelho, sem nada fora da partida. Não há o que ligar a uma pessoa.
//
// SÓ PvP: a taxa de uso revela "slot morto" (deus/habilidade que ninguém escolhe/usa) — e isso só faz
// sentido quando o time é ESCOLHIDO pelo jogador. Partida contra a IA (montagem fixa) não conta.
const fs = require('fs'), path = require('path');
const DIR = path.join(__dirname, 'dados');
const ARQ = path.join(DIR, 'telemetria.json');

let _c = null;
function _vazio() { return { partidas: 0, abandonos: 0, turnosTotal: 0, duracao: {}, deuses: {}, slots: {} }; }
function _carregar() { if (_c) return; try { _c = JSON.parse(fs.readFileSync(ARQ, 'utf8')); } catch (e) { _c = _vazio(); } if (!_c || !_c.deuses) _c = _vazio(); }
function _persistir() { try { fs.mkdirSync(DIR, { recursive: true }); fs.writeFileSync(ARQ, JSON.stringify(_c)); } catch (e) {} }

// balde de duração (histograma de 5 em 5 turnos): "01-05", "06-10", ... "36-40".
function _balde(t) { if (!t || t < 1) return '00'; const lo = Math.floor((t - 1) / 5) * 5 + 1, hi = lo + 4; const p = (n) => ('0' + n).slice(-2); return p(lo) + '-' + p(hi); }

// registra o USO de uma habilidade (um agir bem-sucedido numa partida PvP). Só incrementa um contador
// agregado — nenhum evento, nenhum jogador. Persistido no fim da partida (partida()).
function acao(godKey, slot) { if (!godKey || !slot) return; _carregar(); const k = godKey + ':' + slot; _c.slots[k] = (_c.slots[k] || 0) + 1; }

// registra o FIM de uma partida PvP: composições dos dois lados, vencedor, duração, abandono.
// vencedor = 0 | 1 | null (empate). Nenhum id de conta entra — só as chaves dos deuses jogados.
function partida({ time0, time1, vencedor, turnos, abandono } = {}) {
  _carregar();
  _c.partidas += 1;
  if (abandono) _c.abandonos += 1;
  _c.turnosTotal += turnos || 0;
  const b = _balde(turnos); _c.duracao[b] = (_c.duracao[b] || 0) + 1;
  [[0, time0 || []], [1, time1 || []]].forEach(([lado, time]) => {
    for (const g of time) { const d = _c.deuses[g] || (_c.deuses[g] = { jogou: 0, venceu: 0 }); d.jogou++; if (vencedor === lado) d.venceu++; }
  });
  _persistir();
}

// snapshot cru dos contadores (para o tools/telemetria.js formatar) + derivados simples.
function snapshot() { _carregar(); return JSON.parse(JSON.stringify(_c)); }

// RELATÓRIO legível: responde as 5 perguntas. Recebe o CATÁLOGO (todos os deuses × habilidades) para
// listar as NUNCA-USADAS (uma habilidade que nunca apareceu no contador = nunca usada). O catálogo entra
// por parâmetro para o módulo do servidor não depender de como o roster é carregado.
function relatorio(catalogo) {
  _carregar();
  const cat = catalogo || [];   // [{ key, ab:[{slot,nome}] }]
  const nomeDe = {}, abrDe = {};
  for (const g of cat) { for (const a of (g.ab || [])) { nomeDe[g.key + ':' + a.slot] = a.nome; abrDe[g.key + ':' + a.slot] = { deus: g.key, slot: a.slot, nome: a.nome }; } }

  const porDeus = Object.entries(_c.deuses).map(([k, d]) => ({ deus: k, jogou: d.jogou, venceu: d.venceu, taxaVitoria: d.jogou ? +(d.venceu / d.jogou).toFixed(3) : null, taxaUso: _c.partidas ? +(d.jogou / (_c.partidas * 2)).toFixed(3) : null }));
  // NUNCA-USADAS: toda habilidade do catálogo (basico/habilidade/milagre) com 0 uso registrado.
  const nuncaUsadas = [];
  for (const g of cat) for (const a of (g.ab || [])) { const key = g.key + ':' + a.slot; if (!(key in _c.slots)) nuncaUsadas.push({ deus: g.key, slot: a.slot, nome: a.nome }); }
  const slotsUsados = Object.entries(_c.slots).map(([k, n]) => ({ chave: k, nome: nomeDe[k] || null, usos: n })).sort((a, b) => a.usos - b.usos);

  return {
    partidas: _c.partidas,
    abandonos: _c.abandonos,
    taxaAbandono: _c.partidas ? +(_c.abandonos / _c.partidas).toFixed(3) : null,
    duracaoMedia: _c.partidas ? +(_c.turnosTotal / _c.partidas).toFixed(1) : null,
    duracao: _c.duracao,
    porDeus,
    slotsUsados,
    nuncaUsadas,
  };
}

// utilitários de teste/manutenção
function _reset() { _c = _vazio(); try { fs.rmSync(ARQ, { force: true }); } catch (e) {} }

module.exports = { ARQ, acao, partida, snapshot, relatorio, _reset };
