// server/dados-pve.js — §318 F2 E2: os DADOS AUTORITATIVOS das montagens de PvE.
// A economia é do SERVIDOR (§318): o servidor NUNCA confia na dificuldade que o cliente declara.
// Ele RECONSTRÓI a montagem de cada modo a partir DAQUI (os mesmos JSON que a build injeta no cliente)
// — inimigos, semente e inflação de chefe vêm do DADO, nunca do envelope do cliente. Assim um forjador
// não pode declarar inimigos fracos para ganhar de graça. (O TIME do jogador, quando o modo deixa ele
// escolher, é aceito do cliente mas VALIDADO por posse em pve.js.)
const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');
function ler(rel) { return JSON.parse(fs.readFileSync(path.join(RAIZ, rel), 'utf8')); }

const ECONOMIA = ler('data/economia.json');

// ---- CAMPANHA: atos de BATALHA indexados por id (varre todos os capítulos do índice) ----
const _campanhaAtos = {};
(function () {
  try {
    const idx = ler('data/campanha/indice.json');
    for (const linha of (idx.capitulos || [])) {
      const cap = ler('data/campanha/' + linha.arquivo);
      for (const a of (cap.atos || [])) if (a.tipo === 'batalha') _campanhaAtos[a.id] = a;
    }
  } catch (e) { /* sem campanha: campanhaAto devolve null */ }
})();
function campanhaAto(id) { return _campanhaAtos[id] || null; }

// ---- DESAFIOS de COMPOSIÇÃO por id ----
const _comp = {};
(function () {
  try { for (const d of (ler('data/composicao.json').desafios || [])) _comp[d.id] = d; } catch (e) {}
})();
function desafioComp(id) { return _comp[id] || null; }

// ---- SEMANAIS: o pool inteiro (a escolha por semana ISO mora em pve.js, no RELÓGIO DO SERVIDOR) ----
const SEMANAIS = (function () { try { return ler('data/semanais.json'); } catch (e) { return { puzzles: [] }; } })();

// ---- DOMÍNIOS: escadas por cultura (minúscula), como a build monta DOMINIOS ----
const _dom = {};
(function () {
  try {
    const dir = path.join(RAIZ, 'data', 'dominios');
    for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.json'))) {
      const lad = ler('data/dominios/' + f);
      _dom[(lad.cultura || f.replace(/\.json$/, '')).toLowerCase()] = lad;
    }
  } catch (e) {}
})();
function dominioLadder(cultura) { return _dom[String(cultura || '').toLowerCase()] || null; }

module.exports = { ECONOMIA, campanhaAto, desafioComp, SEMANAIS, dominioLadder };
