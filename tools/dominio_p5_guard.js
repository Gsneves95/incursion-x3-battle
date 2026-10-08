// ===================================================================
// INCURSION — PORTÃO P5 dos DOMÍNIOS (§325b): VARIEDADE dos níveis COMUNS.
// Puramente ESTRUTURAL (conta sobre o dado, sem simular). Por cultura, contando SÓ níveis comuns (não-chefe),
// somando as 8 semanas:
//   (a) pelo menos 70% dos deuses da cultura aparecem como inimigos;
//   (b) nenhum trio aparece mais de 12 vezes;
//   (c) em cada semana, nenhum trio se repete em menos de 5 níveis de distância.
// Usado pelo build (quebra) e pelo teste. `gods` = mapa key→{faccao} (catálogo); default: src/dominios._domGods via require.
// ===================================================================
'use strict';
const P5_COBERTURA = 0.70, P5_MAX_REPETICAO = 12, P5_DIST_MIN = 5;
const chave = t => [...t].sort().join('|');

function _gods() {
  if (typeof global !== 'undefined' && global.GODS) return global.GODS;
  try { return require('./..' + '/src/engine.js').GODS; } catch (e) {}
  try { return require(require('path').join(__dirname, '..', 'src', 'engine.js')).GODS; } catch (e) { return {}; }
}

// devolve { erros:[], cobertura, usados, nCult, maxRepeticao, minDist } de UMA cultura.
function medir(ladder, gods) {
  gods = gods || _gods();
  const cultura = ladder.cultura;
  const nCult = Object.keys(gods).filter(k => gods[k] && gods[k].faccao === cultura).length;
  const usados = new Set(); const cont = {}; let minDist = Infinity;
  for (const s of (ladder.semanas || [])) {
    const ultimo = {};
    (s.niveis || []).forEach((lv, idx) => {
      if (lv.chefe) return;                                  // só COMUNS
      const c = chave(lv.inimigos); const n = idx + 1;
      cont[c] = (cont[c] || 0) + 1;
      (lv.inimigos || []).forEach(k => usados.add(k));
      if (ultimo[c] != null) minDist = Math.min(minDist, n - ultimo[c]);
      ultimo[c] = n;
    });
  }
  const cobertura = nCult ? usados.size / nCult : 0;
  const maxRepeticao = Math.max(0, ...Object.values(cont));
  return { cobertura, usados: usados.size, nCult, maxRepeticao, minDist: minDist === Infinity ? null : minDist };
}

// [] se OK, ou lista de mensagens de erro.
function validar(ladder, gods) {
  const m = medir(ladder, gods);
  const nome = (ladder && ladder.cultura) || '(sem cultura)';
  const erros = [];
  if (m.cobertura < P5_COBERTURA - 1e-9) erros.push(`${nome}: só ${(m.cobertura * 100).toFixed(0)}% dos deuses da cultura aparecem como comuns (${m.usados}/${m.nCult}), mínimo ${(P5_COBERTURA * 100)}% [P5a]`);
  if (m.maxRepeticao > P5_MAX_REPETICAO) erros.push(`${nome}: um trio comum aparece ${m.maxRepeticao}× (máximo ${P5_MAX_REPETICAO}) [P5b]`);
  if (m.minDist != null && m.minDist < P5_DIST_MIN) erros.push(`${nome}: dois usos do mesmo trio comum a ${m.minDist} níveis de distância (mínimo ${P5_DIST_MIN}) [P5c]`);
  return erros;
}

module.exports = { validar, medir, P5_COBERTURA, P5_MAX_REPETICAO, P5_DIST_MIN };

// CLI: node tools/dominio_p5_guard.js
if (require.main === module) {
  const fs = require('fs'), path = require('path');
  const gods = require(path.join(__dirname, '..', 'src', 'engine.js')).GODS;
  const dir = path.join(__dirname, '..', 'data', 'dominios');
  let ok = true;
  for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort()) {
    const lad = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    const m = medir(lad, gods); const erros = validar(lad, gods);
    console.log(`${(lad.cultura || f).padEnd(9)} cobertura ${(m.cobertura * 100).toFixed(0)}% (${m.usados}/${m.nCult}) · trio máx ${m.maxRepeticao}× · dist mín ${m.minDist} ${erros.length ? '✗ ' + erros.join(' | ') : '✓'}`);
    if (erros.length) ok = false;
  }
  process.exit(ok ? 0 : 1);
}
