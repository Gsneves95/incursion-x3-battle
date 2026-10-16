#!/usr/bin/env node
// §337 — GERADOR de ORBES de elemento (runa de vidro): web/orbes/orbe_<elem>.svg (com halo) e orbe_<elem>_min.svg
// (sem halo, viewBox 24 24 80 80). elem = tempestade, umbra, mare, aurora, chama, verdejante, livre.
// A cor principal (C) dos 6 elementos vem das --e-* do shell.html (se mudarem lá, a orbe acompanha); CLARO/MUITO/
// ESCURO/FUNDO são a paleta do desenho definido pelo dono. `livre` é todo da tabela (não tem --e-*).
const fs = require('fs'), path = require('path');
const RAIZ = path.resolve(__dirname, '..');
const DEST = path.join(RAIZ, 'web', 'orbes');

// paleta: [C, CLARO, MUITO, ESCURO, FUNDO]
const PALETA = {
  tempestade: ['#9fd8ff', '#fbfdff', '#ffffff', '#069aff', '#0a75be'],
  umbra:      ['#a06bff', '#dbc7ff', '#ffffff', '#4b00d1', '#37078c'],
  mare:       ['#4ad3c7', '#91e8e1', '#cdf3f0', '#176d66', '#113532'],
  aurora:     ['#ffc94a', '#ffe4a6', '#fffaed', '#b07b00', '#6d4e06'],
  chama:      ['#ff5c8a', '#ffb8cc', '#ffffff', '#c20037', '#7e0728'],
  verdejante: ['#58d68d', '#9febbf', '#dbf6e6', '#1a7b43', '#164228'],
  livre:      ['#b9bdc9', '#ecedf2', '#ffffff', '#606a89', '#535558'],
};
// elem → nome da --e-* no shell.html (livre não tem)
const EVAR = { tempestade: '--e-Tempestade', umbra: '--e-Umbra', mare: '--e-Mare', aurora: '--e-Aurora', chama: '--e-Chama', verdejante: '--e-Verdejante' };

// lê as --e-* do shell.html para sobrescrever o C (cor principal) de cada elemento
function lerCoresShell() {
  const out = {};
  try {
    const css = fs.readFileSync(path.join(RAIZ, 'src', 'shell.html'), 'utf8');
    for (const elem in EVAR) {
      const re = new RegExp(EVAR[elem].replace(/[-]/g, '\\-') + '\\s*:\\s*(#[0-9a-fA-F]{3,8})');
      const m = re.exec(css);
      if (m) out[elem] = m[1].toLowerCase();
    }
  } catch (e) { /* usa a paleta */ }
  return out;
}

function svgOrbe(elem, cores, min) {
  const [C, CLARO, MUITO, ESCURO, FUNDO] = cores;
  const P = elem + '-';
  const vb = min ? '24 24 80 80' : '0 0 128 128';
  const glowDef = min ? '' :
    `\n  <radialGradient id="${P}glow" cx="50%" cy="50%" r="50%"><stop offset="55%" stop-color="${C}" stop-opacity=".55"/><stop offset="100%" stop-color="${C}" stop-opacity="0"/></radialGradient>`;
  const glowCirc = min ? '' : `\n <circle cx="64" cy="64" r="63" fill="url(#${P}glow)"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}">
 <defs>${glowDef}
  <radialGradient id="${P}corpo" cx="38%" cy="32%" r="72%"><stop offset="0%" stop-color="${MUITO}"/><stop offset="35%" stop-color="${CLARO}"/><stop offset="75%" stop-color="${C}"/><stop offset="100%" stop-color="${ESCURO}"/></radialGradient>
  <radialGradient id="${P}miolo" cx="50%" cy="60%" r="55%"><stop offset="0%" stop-color="${C}" stop-opacity="0"/><stop offset="100%" stop-color="${FUNDO}" stop-opacity=".55"/></radialGradient>
  <linearGradient id="${P}aro" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#ffffff" stop-opacity=".95"/><stop offset="45%" stop-color="${CLARO}"/><stop offset="100%" stop-color="${ESCURO}"/></linearGradient>
  <radialGradient id="${P}brilho" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#ffffff" stop-opacity=".95"/><stop offset="100%" stop-color="#ffffff" stop-opacity="0"/></radialGradient>
 </defs>${glowCirc}
 <circle cx="64" cy="64" r="40" fill="url(#${P}corpo)"/>
 <circle cx="64" cy="64" r="40" fill="url(#${P}miolo)"/>
 <circle cx="64" cy="64" r="38.5" fill="none" stroke="url(#${P}aro)" stroke-width="3.5"/>
 <circle cx="64" cy="64" r="34" fill="none" stroke="#ffffff" stroke-opacity=".18" stroke-width="1.2"/>
 <ellipse cx="52" cy="47" rx="17" ry="10" transform="rotate(-28 52 47)" fill="url(#${P}brilho)" opacity=".85"/>
 <circle cx="47" cy="44" r="4" fill="#ffffff" opacity=".9"/>
 <ellipse cx="79" cy="84" rx="9" ry="4" transform="rotate(-35 79 84)" fill="#ffffff" opacity=".22"/>
</svg>
`;
}

function gerar() {
  const shell = lerCoresShell();
  fs.mkdirSync(DEST, { recursive: true });
  const feitos = [];
  for (const elem in PALETA) {
    const cores = PALETA[elem].slice();
    if (shell[elem]) cores[0] = shell[elem];   // C vem do shell.html quando existe
    fs.writeFileSync(path.join(DEST, `orbe_${elem}.svg`), svgOrbe(elem, cores, false));
    fs.writeFileSync(path.join(DEST, `orbe_${elem}_min.svg`), svgOrbe(elem, cores, true));
    feitos.push(elem);
  }
  return feitos;
}

if (require.main === module) {
  const f = gerar();
  console.log('orbes geradas:', f.length * 2, 'arquivos (' + f.join(', ') + ')');
}
module.exports = { gerar, svgOrbe, PALETA };
