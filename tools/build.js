// Concatena motor + dados + visão + casca num único HTML que abre sem servidor.
// A visão é modular (src/turno.js, src/rotas.js, src/ui/*, src/view.js); este
// script junta na ordem de camadas e valida duas coisas que o escopo único
// concatenado esconde: a DIREÇÃO das dependências entre módulos de ui/ e a
// ORDEM (símbolo referenciado antes de existir).
const fs = require('fs'), path = require('path');
const raiz = path.join(__dirname, '..');
const ler = p => fs.readFileSync(path.join(raiz, p), 'utf8');
const semGuard = s => s.split("if (typeof module !== 'undefined')")[0];

// ---------- 1. checagem de direção: nenhum ui/ referencia OUTRO ui/ (só base.js e narrar.js) ----------
// base.js e narrar.js são a FUNDAÇÃO: os outros ui/ podem chamá-los (helpers e o narrador),
// mas eles só podem usar base.js entre si. narrar.js é o único tradutor evento->pt-BR; se
// fosse um ui/ comum, quem renderiza o registro (painel, sobrepor) não poderia invocá-lo.
const UI_FUNDACAO = new Set(['base.js', 'narrar.js']);
function checarDirecaoUI() {
  const dir = path.join(raiz, 'src/ui');
  const mods = fs.readdirSync(dir).filter(f => f.endsWith('.js'));
  const reDef = /^(?:function|const|let|var)\s+([A-Za-z_$][\w$]*)/gm;
  const defs = {};
  for (const m of mods) {
    const src = ler('src/ui/' + m); const s = new Set(); let mt;
    reDef.lastIndex = 0; while ((mt = reDef.exec(src))) s.add(mt[1]);
    defs[m] = s;
  }
  const erros = [];
  for (const m of mods) {
    if (m === 'base.js') continue;   // base.js não é checado como origem (fundação pura)
    const src = ler('src/ui/' + m);
    for (const outro of mods) {
      if (outro === m || UI_FUNDACAO.has(outro)) continue;   // chamar base.js/narrar.js é livre
      for (const id of defs[outro]) {
        // casa CHAMADA (`id(`), não a palavra solta — evita falso positivo com
        // texto de ajuda e comentários; acoplamento ui->ui real é sempre chamada.
        if (new RegExp('\\b' + id.replace(/\$/g, '\\$') + '\\s*\\(').test(src))
          erros.push(`src/ui/${m} chama \`${id}()\` (definido em src/ui/${outro}). ui -> ui é proibido: suba o compartilhado para src/ui/base.js.`);
      }
    }
  }
  if (erros.length) { console.error('ERRO de direção de dependência:\n  ' + erros.join('\n  ')); process.exit(1); }
}

// ---------- 2. smoke de carga: o bundle roda em jsdom sem símbolo faltando ----------
function smokeCarga(distAbs) {
  let jsdom; try { jsdom = require('jsdom'); } catch (e) { console.warn('jsdom ausente — pulei o smoke de carga'); return; }
  const html = fs.readFileSync(distAbs, 'utf8');
  const erros = [];
  const vc = new jsdom.VirtualConsole();
  vc.on('jsdomError', e => erros.push(e.message + (e.detail ? ' :: ' + e.detail : '')));
  const dom = new jsdom.JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc });
  if (erros.length) { console.error('ERRO no smoke de carga (símbolo ausente ou ordem de concatenação):\n  ' + erros.join('\n  ')); process.exit(1); }
  const r = dom.window.eval("typeof rotaAtual === 'function' && rotaAtual()");
  if (r !== 'home') { console.error('ERRO no smoke de carga: rota inicial deveria ser "home", veio ' + JSON.stringify(r)); process.exit(1); }
  dom.window.close();
}

checarDirecaoUI();

const motor  = semGuard(ler('src/engine.js'));
const catalogo = semGuard(ler('src/catalogo.js'));   // só montarCatalogo no browser (fs cai no semGuard)
const roster = ler('src/roster_data.js');
const perfil = semGuard(ler('src/perfil.js'));
const armaz  = semGuard(ler('src/armazenamento.js'));
const turno  = semGuard(ler('src/turno.js'));
const rotas  = semGuard(ler('src/rotas.js'));
const enquadr= semGuard(ler('src/enquadramento.js'));
const provac = semGuard(ler('src/provacao.js'));   // F3.1: o motor de Provação (montar/avaliar/PREDICADOS) passa a rodar no browser
const visao  = ler('src/view.js');
const invoc  = ler('src/invocacao.js');
const ia     = semGuard(ler('src/ia.js'));
const raridades = ler('data/raridades.json').trim();
const economia = ler('data/economia.json').trim();
const kits   = ler('data/kits.json').trim();
const casca  = ler('src/shell.html');

// ---------- 3. schema de kit: um arquivo por deus em data/deuses/, validado na build ----------
// (falha alto, como a direção ui e o smoke) — impede erro silencioso ao escrever os 73 kits.
const deuses = fs.readdirSync(path.join(raiz, 'data', 'deuses'))
  .filter(f => f.endsWith('.json')).sort()
  .map(f => JSON.parse(ler('data/deuses/' + f)));
// as criaturas do bestiário viram DADO embutido (F3.1): as Ordálias têm inimigos que são
// criaturas PvE, não deuses do roster. montarProvacao usa o catálogo MERGED (GODS ∪ BESTIARIO).
const bestiarioDir = path.join(raiz, 'data', 'bestiario');
const bestiarioDados = fs.existsSync(bestiarioDir)
  ? fs.readdirSync(bestiarioDir).filter(f => f.endsWith('.json')).sort().map(f => JSON.parse(ler('data/bestiario/' + f)))
  : [];
function checarKits() {
  const { validarDeus, validarHabilidade } = require('./valida_kit.js');
  const E = require('../src/engine.js');
  const erros = [];
  for (const g of deuses) erros.push(...validarDeus(g));
  validarHabilidade(E.DEFESA, 'DEFESA (regra universal)', erros);   // a Defesa tem o formato de habilidade
  if (erros.length) { console.error('ERRO de schema de kit:\n  ' + erros.join('\n  ')); process.exit(1); }
}
checarKits();

// ---------- 3-bis. schema do BESTIÁRIO: as criaturas PvE em data/bestiario/, validadas na build (F2.3) ----------
// Mesma forma de deus (validarDeus reusado) + campo `hp`. Falha alto, como os kits de deus. NÃO passam pela
// cadeia (não há prosa-fonte em kits.json) nem pelo checar_cadeia; o TETO de tropa é teste (tests/bestiario.test.js),
// não build — a régua de balanceamento mora na suíte, o schema mora aqui (§ owner F2.3: "um teste que RODA").
{
  const dirB = path.join(raiz, 'data', 'bestiario');
  if (fs.existsSync(dirB)) {
    const { validarDeus } = require('./valida_kit.js');
    const erros = [];
    for (const f of fs.readdirSync(dirB).filter(f => f.endsWith('.json')).sort())
      erros.push(...validarDeus(JSON.parse(ler('data/bestiario/' + f))));
    if (erros.length) { console.error('ERRO de schema de bestiário:\n  ' + erros.join('\n  ')); process.exit(1); }
  }
}

// ---------- 3b. CADEIA DE VERDADE, elo B: kits.json (prosa, fonte revisada) ↔ data/deuses (derivado) ----------
// Falha alto, como o schema. DIVERGÊNCIA é presunção de erro no MOTOR (kits.json é a fonte, §26);
// o checador só aponta. (Elo A, planilha↔kits.json, é tarefa aberta no ESTADO — parse cru de XML.)
const cadeia = require('./checar_cadeia.js');
if (cadeia.divergencias.length) {
  console.error('ERRO de cadeia (kits.json ↔ data/deuses):\n  ' + cadeia.divergencias.join('\n  ')); process.exit(1);
}

// ---------- 3c. schema de Provação: um arquivo por deus em data/provacoes/, validado na build (F2.0) ----------
// Predicado desconhecido FALHA AQUI, não em runtime (§71): uma Provação com condição inválida que só quebra
// quando alguém a joga passa em todo teste e falha no jogador. O vocabulário de condição é conjunto fechado.
{
  const dir = path.join(raiz, 'data', 'provacoes');
  if (fs.existsSync(dir)) {
    const { validarProvacao } = require('../src/provacao.js');
    const erros = [];
    for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort()) {
      erros.push(...validarProvacao(JSON.parse(ler('data/provacoes/' + f))));
    }
    if (erros.length) { console.error('ERRO de schema de Provação:\n  ' + erros.join('\n  ')); process.exit(1); }

    // ---------- 3d. CARIMBO DE VERSÃO (F2.1, §148): AVISA (não falha) quando o catálogo mudou desde a verificação ----------
    // Kit rebalanceado não quebra a build; marca as Provações a re-solver. Aviso VISÍVEL (banner ⚠) + lista.
    const { catalogoHash } = require('../src/provacao.js');
    const E = require('../src/engine.js');
    const velhas = [], semCarimbo = [], mentiras = [];
    for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort()) {
      const prov = JSON.parse(ler('data/provacoes/' + f));
      if (!prov.verificacao) { semCarimbo.push(prov.key); continue; }
      // §150 IDENTIDADE: o nível declarado da Provação tem de ser IDENTICAMENTE o carimbado. Divergência de
      // identidade é MENTIRA (o carimbo garante contra um oponente que o jogo não roda) → FALHA, não avisa.
      const nivelDecl = prov.nivelIA || 'normal';
      if (prov.verificacao.nivelIA !== nivelDecl) mentiras.push(`${prov.key} (declara "${nivelDecl}", carimbado contra "${prov.verificacao.nivelIA}")`);
      if (prov.verificacao.hash !== catalogoHash(prov)) velhas.push(prov.key);   // carimbo velho = AVISO (catalogoHash usa o catálogo MERGED deuses∪bestiário — o que o jogo roda)
    }
    if (mentiras.length) {   // identidade divergente FALHA a build
      console.error('ERRO de carimbo de Provação — IDENTIDADE de IA divergente (§150: o carimbo garante contra um oponente que o jogo não roda):\n  ' + mentiras.join('\n  ') + '\n  re-carimbe contra o nível declarado: node tools/solucionador.js --carimbar <deus>');
      process.exit(1);
    }
    if (velhas.length || semCarimbo.length) {
      console.warn('\n⚠️  ============ CARIMBO DE PROVAÇÃO ============');
      if (velhas.length) console.warn(`⚠️  ${velhas.length} Provação(ões) com carimbo VELHO (hash) — kit mudou, RE-SOLVER: ${velhas.join(', ')}`);
      if (semCarimbo.length) console.warn(`⚠️  ${semCarimbo.length} Provação(ões) SEM carimbo — nunca verificadas: ${semCarimbo.join(', ')}`);
      console.warn('⚠️     rode: node tools/solucionador.js --carimbar <deus>');
      console.warn('⚠️  =============================================\n');
    }
  }
}

// Camadas, em ordem de dependência (cada uma só usa as anteriores):
// engine -> perfil -> armazenamento -> turno -> rotas -> ui/base -> ui/narrar -> ui/* -> view.
const blocoVisao = [
  perfil, armaz, turno, rotas, enquadr, provac,
  ler('src/ui/base.js'), ler('src/ui/narrar.js'), ler('src/ui/topo.js'), ler('src/ui/campo.js'),
  ler('src/ui/painel.js'), ler('src/ui/sobrepor.js'), ler('src/ui/selecao.js'), ler('src/ui/home.js'),
  visao,
].join('\n');

// PROVACOES: array SLIM (só o que a lista da F3.0 mostra) a partir dos arquivos por-deus.
// O NÍVEL vem daqui (o arquivo carimbado, corrigido pela medição), NUNCA do catálogo em
// prosa data/provacoes.json (§185: o nível medido diverge do de design em 36/90). O flag
// `generica` viaja para a lógica, mas a UI NÃO o exibe — o jogador não distingue rota de
// kit-ensino. São 90 (um por deus carimbado), não 91 nem 63.
const provacoes = (() => {
  const dir = path.join(raiz, 'data', 'provacoes');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort()
    .map(f => JSON.parse(ler('data/provacoes/' + f)))
    .map(p => {
      // F3.1: além dos campos de exibição, o runtime precisa de aliados/inimigos/montar/condicoes
      // p/ montar e avaliar a batalha. `minimo` = lances do MELHOR caminho do solucionador (lances = ações,
      // não "passar"): é o placar embrionário — "concluída em N" contra o mínimo conhecido. O `caminho`
      // completo (pesado) NÃO viaja: só o número.
      const cam = (p.verificacao && Array.isArray(p.verificacao.caminho)) ? p.verificacao.caminho : null;
      const minimo = cam ? cam.filter(l => !/^passar$/i.test(String(l).trim())).length : null;
      return {
        key: p.key, titulo: p.titulo, nivel: p.nivel, dificuldade: p.dificuldade, generica: !!p.generica,
        aliados: p.aliados, inimigos: p.inimigos, montar: p.montar || {}, condicoes: p.condicoes || [], minimo,
      };
    });
})();

// CAMPANHA (F3.3): capítulo 1 embutido. VALIDA na build (falha alto, como os outros schemas): cada
// aliado/inimigo tem de resolver no catálogo MERGED (deuses ∪ bestiário) — senão montarProvacao quebra no
// jogador — e a CHAVE de recompensa tem de existir em economia.json. Predicado nenhum: a campanha reusa a
// máquina de Provação SEM condição (vencer = derrubar os inimigos).
const campanhaObj = (() => {
  const arq = path.join(raiz, 'data', 'campanha.json');
  if (!fs.existsSync(arq)) return null;
  const c = JSON.parse(ler('data/campanha.json'));
  const catalogoKeys = new Set([...deuses.map(d => d.key), ...bestiarioDados.map(b => b.key)]);
  const recompensas = (JSON.parse(economia).campanha && JSON.parse(economia).campanha.recompensas) || {};
  const erros = [];
  for (const e of (c.encontros || [])) {
    for (const k of (e.aliados || [])) if (!catalogoKeys.has(k)) erros.push(`${e.id}: aliado "${k}" fora do catálogo`);
    for (const k of (e.inimigos || [])) if (!catalogoKeys.has(k)) erros.push(`${e.id}: inimigo "${k}" fora do catálogo`);
    if (!recompensas[e.recompensa]) erros.push(`${e.id}: recompensa "${e.recompensa}" não existe em economia.campanha.recompensas`);
  }
  if (erros.length) { console.error('ERRO de schema de campanha:\n  ' + erros.join('\n  ')); process.exit(1); }
  return c;
})();

// SEMANAIS (F3.4): pool de Provações semanais PRÉ-GERADAS e provadas VENCÍVEL pelo solucionador
// (tools/gerar_semanais.js). O runtime escolhe pela semana ISO — determinístico, offline, sem servidor.
// Cada puzzle carrega aliados/inimigos/montar/condicoes/minimo (o que monta, avalia e pontua). Valida
// que as chaves resolvem no catálogo (falha alto), como a campanha.
const semanaisObj = (() => {
  const arq = path.join(raiz, 'data', 'semanais.json');
  if (!fs.existsSync(arq)) return null;
  const s = JSON.parse(ler('data/semanais.json'));
  const catalogoKeys = new Set([...deuses.map(d => d.key), ...bestiarioDados.map(b => b.key)]);
  const erros = [];
  (s.puzzles || []).forEach((p, i) => {
    for (const k of [...(p.aliados || []), ...(p.inimigos || [])]) if (!catalogoKeys.has(k)) erros.push(`semana ${i}: chave "${k}" fora do catálogo`);
  });
  if (erros.length) { console.error('ERRO de schema semanal:\n  ' + erros.join('\n  ')); process.exit(1); }
  return s;
})();

const build = new Date().toISOString().slice(0, 16).replace('T', ' ') + ' UTC';

const saida = casca
  // Os kits vêm de data/deuses/* → array DEUSES → catalogo.js monta o global GODS ANTES do
  // motor (o motor lê GODS só em runtime, mas a UI o lê no render; e é "dado consumido cedo").
  .replace('/*__ENGINE__*/',
    'const DEUSES=' + JSON.stringify(deuses) + ';\n' + catalogo + '\nconst GODS=montarCatalogo(DEUSES);\n'
    + 'const BESTIARIO_DADOS=' + JSON.stringify(bestiarioDados) + ';\nconst BESTIARIO=montarCatalogo(BESTIARIO_DADOS);\n'
    + roster + '\n' + motor + '\nconst KITS=' + kits + ';')
  // RARIDADE/ECONOMIA vêm ANTES do blocoVisao: o boot (view.js → iniciar()) lê ECONOMIA
  // para o grant inicial, então o dado precisa estar inicializado antes de a view rodar.
  .replace('/*__VIEW__*/', 'const RARIDADE=' + raridades + ';\nconst ECONOMIA=' + economia + ';\nconst PROVACOES=' + JSON.stringify(provacoes) + ';\nconst CAMPANHA=' + JSON.stringify(campanhaObj) + ';\nconst SEMANAIS=' + JSON.stringify(semanaisObj) + ';\n' + blocoVisao + '\n' + invoc + '\n' + ia)
  .replace('/*__BUILD__*/', build);

if (saida.includes('__ENGINE__') || saida.includes('__VIEW__')) {
  console.error('ERRO: marcador de injeção não substituído'); process.exit(1);
}
fs.mkdirSync(path.join(raiz, 'dist'), { recursive: true });
const distAbs = path.join(raiz, 'dist/incursion.html');
fs.writeFileSync(distAbs, saida);

// assets do modo app (manifest + ícones): arquivos REAIS servidos no Pages. Copiados
// para junto do incursion.html para o dist de dev também os encontrar. O invariante
// "arquivo único" vale para o incursion.html; o artefato publicado é um site pequeno.
const web = path.join(raiz, 'web');
if (fs.existsSync(web)) for (const f of fs.readdirSync(web))
  fs.cpSync(path.join(web, f), path.join(raiz, 'dist', f), { recursive: true });   // recursive: cobre web/skills/ (401 artes F1.7), não só os arquivos-topo

smokeCarga(distAbs);
console.log('dist/incursion.html —', (saida.length / 1024 / 1024).toFixed(2),
  `MB · direção ui ok · smoke ok · cadeia ok (${cadeia.R.match} conf, ${cadeia.R.naoConf} não-conf)`);
