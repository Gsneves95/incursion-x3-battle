// §273 — DOMÍNIOS: guardas-babá da CORRIDA. As regras que o dono fixou:
//  1) "1× por CORRIDA" (ressurreição) NÃO recarrega entre níveis; "1× por NÍVEL" (pico) recarrega.
//  2) VIDA e BÔNUS carregam; RECARGA, EFEITO e CONTADOR não carregam.
//  3) o REVIVER não aparece quando não há caído (§252).
//  4) o bônus de dano não passa de +50% por acúmulo.
//  5) a escada é MONOTÔNICA na dificuldade medida.
//  6) §210/§240: fim de nível/escolha de prêmio tem SAÍDA e o "voltar" fecha para o hub (corrida persiste).
const path = require('path');
const E = require(path.join(__dirname, '..', 'src', 'engine.js'));
Object.assign(global, E);
const D = require(path.join(__dirname, '..', 'src', 'dominios.js'));
const fs = require('fs');
const ladderFile = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'dominios', 'grega.json'), 'utf8'));
const ladder = D.domEscadaSemana(ladderFile, 0);   // §275: vista PLANA da semana 0 (as funções de corrida consomem .niveis)
const GODS = E.GODS;

let f = 0; const ok = (c, m) => { if (!c) { f++; console.log('  XX ' + m); } else console.log('  ok ' + m); };
const primeiroDano = kit => { let v = null; (kit.ab || []).forEach(a => (a.fx || []).forEach(e => { if (e.t === 'dmg' && typeof e.v === 'number' && v == null) v = e.v; })); return v; };

console.log('== 1) RESSURREIÇÃO é 1× por CORRIDA: o gate reviveGastoCorrida no motor ==');
{
  // A) SEM o flag: a Vida Extra salva (comportamento normal, intocado fora de Domínios)
  const st = E.novoEstado(ladder.trio, ['sobek', 'brigid', 'ganesha'], 1, 0);
  const atk = st.lados[1].units[0];
  const z = st.lados[0].units[0]; z.hp = 30; z.shield = 0; z.vidaExtra = { hp: 44 };
  E.bater(st, atk, z, 9999, 'fisico', 'habilidade');
  ok(z.vivo && z.hp === 44, 'sem gate: Vida Extra RESSUSCITA (44 de vida)');
  // B) COM o flag: a mesma Vida Extra NÃO salva — a rede já foi gasta na corrida
  const p = st.lados[0].units[1]; p.hp = 30; p.shield = 0; p.vidaExtra = { hp: 44 }; p.reviveGastoCorrida = true;
  E.bater(st, atk, p, 9999, 'fisico', 'habilidade');
  ok(!p.vivo, 'com gate reviveGastoCorrida: a Vida Extra NÃO ressuscita (fica caído)');
  // C) a camada de corrida CARIMBA o gate por deus (quem está em reviveGasto)
  const run = D.domNovaCorrida(ladder); run.reviveGasto = [ladder.trio[0]];
  const st2 = D.domMontarBatalha(run, ladder, { seed: 1 });
  ok(st2.lados[0].units[0].reviveGastoCorrida === true, 'domMontarBatalha carimba o gate no deus da rede gasta');
  ok(st2.lados[0].units[1].reviveGastoCorrida === false, 'os demais deuses do trio começam SEM o gate');
  // D) default false fora de Domínios: uma unidade nova qualquer não carrega o gate
  ok(E.novoEstado(['zeus'], ['sobek'], 1, 0).lados[0].units[0].reviveGastoCorrida === false, 'novoUnidade nasce reviveGastoCorrida=false (nada muda fora de Domínios)');
}

console.log('== 1b) "1× por NÍVEL" (pico/umaVez e recarga) RECARREGA a cada nível ==');
{
  const run = D.domNovaCorrida(ladder);
  run.nivel = 5;
  const a = D.domMontarBatalha(run, ladder, { seed: 1 });
  // suja o estado do nível: recarga, uso de pico, efeito e contador
  a.lados[0].units.forEach(u => { u.cd.habilidade = 3; u.usos = { habilidade: true }; u.efeitos.push({ tipo: 'buff', dur: 5 }); u.contadores.combo = 4; });
  run.nivel = 6;   // próximo nível
  const b = D.domMontarBatalha(run, ladder, { seed: 1 });
  const limpo = b.lados[0].units.every(u => u.cd.habilidade === 0 && Object.keys(u.usos).length === 0 && u.efeitos.length === 0 && Object.keys(u.contadores).length === 0);
  ok(limpo, 'nível novo = novoEstado FRESCO: recarga, pico(umaVez), efeito e contador ZERAM (não carregam)');
}

console.log('== 2) VIDA e BÔNUS carregam; enemy/player scaling separados ==');
{
  const run = D.domNovaCorrida(ladder);
  run.vida = [{ hp: 50, vivo: true }, { hp: 0, vivo: false }, { hp: 80, vivo: true }];
  run.bonus = 0.3;
  const st = D.domMontarBatalha(run, ladder, { seed: 1 });
  ok(st.lados[0].units[0].hp === 50, 'a vida CARREGA (50)');
  ok(!st.lados[0].units[1].vivo && st.lados[0].units[1].hp === 0, 'o caído CARREGA caído');
  ok(st.lados[0].units[2].hp === 80, 'a vida do 3º CARREGA (80)');
  // bônus escala SÓ o trio; danoMult escala SÓ o inimigo
  const cat = D.domCatalogoNivel(GODS, ladder.trio, 0.3, ['sobek', 'brigid', 'ganesha'], 1.2);
  const dTrioBase = primeiroDano(GODS[ladder.trio[0]]), dTrioEsc = primeiroDano(cat[ladder.trio[0]]);
  const dInimBase = primeiroDano(GODS['sobek']), dInimEsc = primeiroDano(cat['sobek']);
  ok(dTrioEsc > dTrioBase && Math.abs(dTrioEsc - Math.round(dTrioBase * 1.3)) <= 1, `bônus +30% escala o DANO do trio (${dTrioBase}→${dTrioEsc})`);
  ok(dInimEsc > dInimBase && Math.abs(dInimEsc - Math.round(dInimBase * 1.2)) <= 1, `danoMult +20% escala o DANO do inimigo (${dInimBase}→${dInimEsc})`);
  // e não cruzam: o trio não pega o danoMult, o inimigo não pega o bônus
  const catSoBonus = D.domCatalogoNivel(GODS, ladder.trio, 0.3, ['sobek'], 1.0);
  ok(primeiroDano(catSoBonus['sobek']) === dInimBase, 'o inimigo NÃO pega o bônus do jogador');
}

console.log('== 3) o REVIVER só aparece quando há CAÍDO (§252 — opção vazia some) ==');
{
  const run = D.domNovaCorrida(ladder);
  run.vida = [{ hp: 40, vivo: true }, { hp: 60, vivo: true }, { hp: 70, vivo: true }];
  run.bonus = 0;
  let p = D.domPremiosDisponiveis(run);
  ok(p.includes('cura') && p.includes('bonus') && !p.includes('reviver'), 'sem caído: Cura+Bônus, SEM Reviver');
  run.vida[1].vivo = false;
  p = D.domPremiosDisponiveis(run);
  ok(p.includes('reviver'), 'com um caído: Reviver aparece');
}

console.log('== 4) o bônus de dano NÃO passa de +50% por acúmulo ==');
{
  const run = D.domNovaCorrida(ladder); run.aguardandoPremio = true; run.nivel = 10; run.bonus = 0.45;
  D.domAplicarPremio(run, ladder, 'bonus');
  ok(Math.abs(run.bonus - 0.5) < 1e-9, '0,45 + 0,10 = teto 0,50 (não 0,55)');
  run.aguardandoPremio = true; run.nivel = 20;
  D.domAplicarPremio(run, ladder, 'bonus');
  ok(Math.abs(run.bonus - 0.5) < 1e-9, 'no teto, aplicar bônus de novo NÃO passa de 0,50');
  ok(!D.domPremiosDisponiveis({ vida: [{ hp: 1, vivo: true }], bonus: 0.5 }).includes('bonus'), 'no teto, BÔNUS some da escolha (§252: não oferece o que não faz nada)');
  ok(run.bonus <= D.DOM_TETO_BONUS, `bonus (${run.bonus}) nunca acima do teto ${D.DOM_TETO_BONUS}`);
}

console.log('== 5) as CINCO culturas × TODAS as semanas são monotônicas na dificuldade medida ==');
{
  const keys = new Set(Object.keys(GODS));
  const dir = path.join(__dirname, '..', 'data', 'dominios');
  const arqs = fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort();
  ok(arqs.length === 5, 'cinco arquivos de escada publicados (tem ' + arqs.length + ': ' + arqs.join(',') + ')');
  for (const f of arqs) {
    const lad = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    const erros = D.domValidarLadder(lad, keys);   // (loopa as semanas: 3 inimigos, chefe/10, monotonia por semana)
    ok(erros.length === 0, `${lad.cultura}: domValidarLadder aprova as ${(lad.semanas||[]).length} semanas (${erros[0] || 'ok'})`);
    let todasMono = true;
    for (const s of (lad.semanas || [])) { let prev = -Infinity; for (const lv of s.niveis) { if (lv.dificuldade < prev - (lad.tolMonotonia || 0.06)) todasMono = false; prev = Math.max(prev, lv.dificuldade); } if (s.niveis.length !== 40) todasMono = false; }
    ok(todasMono && lad.trio.length === 3 && (lad.semanas || []).length >= 1, `${lad.cultura}: trio de 3, ${(lad.semanas||[]).length} semanas todas de 40 níveis e monotônicas`);
  }
  // trio ESTÁVEL entre semanas (rotação de trio NÃO entra nesta fatia) — o trio é do topo, um só
  const g = JSON.parse(fs.readFileSync(path.join(dir, 'grega.json'), 'utf8'));
  ok(g.trio.join('/') === 'zeus/poseidon/atena' && !g.semanas.some(s => s.trio), 'trio é do topo (mesmo em todas as semanas) — sem rotação de trio (§275)');
}

console.log('== 6) TELA DE SELEÇÃO: os cinco aparecem, cada um abre o seu; progresso independente; retomável ==');
{
  const jsdom = require('jsdom');
  const html = fs.readFileSync(path.join(__dirname, '..', 'dist', 'incursion.html'), 'utf8');
  const vc = new jsdom.VirtualConsole(); const errs = []; vc.on('jsdomError', e => errs.push(e.message));
  const dom = new jsdom.JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc });
  const w = dom.window, d = w.document;
  w.eval('perfil=novoPerfil(0,0);');
  // os cinco na seleção
  w.eval('ir("dominios",{},{substituir:true}); render();');
  const cards = w.eval('[...document.querySelectorAll(".domcard")].map(c=>c.getAttribute("data-cultura"))');
  ok(cards.length === 5, 'a seleção mostra os CINCO Domínios (tem ' + cards.length + ')');
  // cada card abre o SEU Domínio (o hub certo)
  let todosAbrem = true, erroAbre = '';
  for (const c of cards) {
    w.eval(`ir("dominios",{},{substituir:true}); render(); document.querySelector('.domcard[data-cultura="${c}"]').click();`);
    const ok1 = w.eval('rotaAtual()') === 'dominio' && w.eval('(paramsAtuais()||{}).cultura') === c && !!d.querySelector('#dentrar');
    if (!ok1) { todosAbrem = false; erroAbre = c; }
  }
  ok(todosAbrem, 'cada cartão abre o SEU Domínio (hub com Entrar)' + (todosAbrem ? '' : ' — falhou em ' + erroAbre));
  // PROGRESSO INDEPENDENTE: iniciar uma corrida na 1ª cultura NÃO mexe na 2ª
  const c0 = cards[0], c1 = cards[1];
  w.eval(`ir("dominios",{},{substituir:true}); render(); document.querySelector('.domcard[data-cultura="${c0}"]').click(); document.querySelector('#dentrar').click();`);
  ok(w.eval('rotaAtual()') === 'batalha', 'entrar no 1º Domínio abre a batalha');
  ok(w.eval(`!!(perfil.dominios.porDominio["${c0}"] && perfil.dominios.porDominio["${c0}"].run)`), 'a corrida do 1º Domínio foi persistida');
  ok(w.eval(`!perfil.dominios.porDominio["${c1}"]`), 'INDEPENDENTE: o 2º Domínio segue sem corrida (correr num não mexe no outro)');
  // RETOMÁVEL e NUNCA se perde ao SAIR: avança um nível, sai para a seleção, volta — a corrida está lá
  w.eval('st.lados[1].units.forEach(u=>{u.vivo=false;u.hp=0}); st.fim={tipo:"fim",resultado:"vitoria",lado:0}; render();');   // vence nível 1 → nível 2
  ok(w.eval(`perfil.dominios.porDominio["${c0}"].run.nivel`) === 2, 'venceu o nível 1 → a corrida está no nível 2 (persistida)');
  w.eval('sairParaHubDominio();');   // volta ao hub (mesmo caminho do voltar do Android)
  w.eval('if(!voltar())ir("dominios"); render();');   // sai do hub para a seleção
  ok(w.eval('rotaAtual()') === 'dominios', 'saiu do Domínio para a SELEÇÃO');
  const badge = w.eval(`(document.querySelector('.domcard[data-cultura="${c0}"] .domcard__prog')||{}).textContent||''`);
  ok(/Em corrida/.test(badge) && /2/.test(badge), 'o cartão mostra a corrida em ANDAMENTO no nível 2 (retomável) — badge: "' + badge.trim() + '"');
  // reabre e retoma no MESMO nível — a corrida nunca se perdeu
  w.eval(`document.querySelector('.domcard[data-cultura="${c0}"]').click();`);
  ok(!!d.querySelector('#ddescer') && /2/.test(d.querySelector('#ddescer').textContent), 'reabrir o Domínio RETOMA (Descer ao nível 2) — a corrida não se perde ao sair (§progressão)');
  ok(!!d.querySelector('#bvoltar'), 'o hub tem saída ‹ Voltar (§210)');
  ok(errs.length === 0, 'sem erros de jsdom no fluxo' + (errs.length ? ': ' + errs.join(' | ') : ''));
  w.close();
}

console.log('== 7) §210/§240: fim de nível tem saída; o "voltar" fecha para o hub do Domínio (corrida persiste) ==');
{
  const jsdom = require('jsdom');
  const html = fs.readFileSync(path.join(__dirname, '..', 'dist', 'incursion.html'), 'utf8');
  const vc = new jsdom.VirtualConsole(); const errs = []; vc.on('jsdomError', e => errs.push(e.message));
  const dom = new jsdom.JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc });
  const w = dom.window, d = w.document;
  w.eval('perfil=novoPerfil(0,0);');
  const c0 = w.eval('Object.keys(DOMINIOS)[0]');
  w.eval(`ir("dominios",{},{substituir:true}); render(); document.querySelector('.domcard[data-cultura="${c0}"]').click(); document.querySelector('#dentrar').click();`);
  // força vitória de CHEFE (nível 10) → sobreposição com escolha de prêmio
  w.eval(`perfil.dominios.porDominio["${c0}"].run.nivel=10; st.lados[1].units.forEach(u=>{u.vivo=false;u.hp=0}); st.fim={tipo:"fim",resultado:"vitoria",lado:0}; render();`);
  ok(!!d.querySelector('#dfpremio'), 'chefe vencido: sobreposição de fim tem AÇÃO (não é tela sem saída — §210)');
  ok(w.eval(`perfil.dominios.porDominio["${c0}"].run.aguardandoPremio`) === true, 'a corrida marcou aguardandoPremio (persistido)');
  // o "voltar" (mesma função do botão VOLTAR do Android §240) fecha para o HUB, sem perder a corrida
  w.eval('sairParaHubDominio();');
  ok(w.eval('rotaAtual()') === 'dominio' && w.eval('(paramsAtuais()||{}).cultura') === c0, '§240: o voltar fecha a escolha para o HUB do Domínio certo');
  ok(w.eval('dominio===null && dominioFim===null'), 'o latch de batalha foi limpo ao ir ao hub');
  ok(w.eval(`perfil.dominios.porDominio["${c0}"].run.aguardandoPremio`) === true, 'a corrida PERSISTE (aguardandoPremio) — o hub retoma a escolha, sem beco sem saída');
  ok(!!d.querySelector('.dompremio[data-premio=cura]'), 'o hub mostra a escolha de prêmio retomável');
  ok(errs.length === 0, 'sem erros de jsdom no fluxo' + (errs.length ? ': ' + errs.join(' | ') : ''));
  w.close();
}

console.log('== 8) nenhum banner de home renderiza <img> que dá 404 — Domínios é placeholder (§213/§274) ==');
{
  const jsdom = require('jsdom');
  const html = fs.readFileSync(path.join(__dirname, '..', 'dist', 'incursion.html'), 'utf8');
  const dom = new jsdom.JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true });
  const w = dom.window, d = w.document;
  w.eval('perfil=novoPerfil(0,0); ir("home",{},{substituir:true}); render();');
  const dcard = d.querySelector('.bcard[data-dest="dominios"]');
  ok(!!dcard && !!dcard.querySelector('.bcard__ph') && !dcard.querySelector('img'), 'o cartão de Domínios é PLACEHOLDER (§213): sem <img>, logo sem 404');
  ok(!fs.existsSync(path.join(__dirname, '..', 'web', 'banners', 'dominios.webp')), 'o banner programático foi removido (aguarda a ilustração definitiva)');
  w.close();
}

console.log('== 9) RECORDE ANTERIOR aparece e a SUPERAÇÃO é anunciada (o instante) ==');
{
  const jsdom = require('jsdom');
  const html = fs.readFileSync(path.join(__dirname, '..', 'dist', 'incursion.html'), 'utf8');
  const vc = new jsdom.VirtualConsole(); const errs = []; vc.on('jsdomError', e => errs.push(e.message));
  const dom = new jsdom.JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc });
  const w = dom.window, d = w.document;
  const c0 = w.eval('Object.keys(DOMINIOS)[0]');
  const prev = w.eval('domChaveSemanaAnterior()');
  // semeia o recorde da SEMANA ANTERIOR = 2 (a marca a bater)
  w.eval(`perfil=novoPerfil(0,0); perfil.dominios.porDominio["${c0}"]={run:null,melhorSempre:2,semanas:{"${prev}":2}};`);
  // o hub mostra o recorde anterior a bater
  w.eval(`ir("dominio",{cultura:"${c0}"},{substituir:true}); render();`);
  ok(/Recorde anterior/.test(d.querySelector('.domhub').textContent) && /2/.test(d.querySelector('.domhub').textContent), 'o hub mostra o RECORDE ANTERIOR a bater (nível 2)');
  // inicia a corrida — a marca a bater viaja na run
  w.eval(`document.querySelector('#dentrar').click();`);
  ok(w.eval(`perfil.dominios.porDominio["${c0}"].run.marcaAnterior`) === 2, 'a corrida carrega a marca a bater (2)');
  // vence nível 1 (prof 1, não supera), depois 2 (prof 2, empata, não supera), depois 3 (prof 3 > 2 → SUPERA)
  const vencerNivel = () => w.eval('st.lados[1].units.forEach(u=>{u.vivo=false;u.hp=0}); st.fim={tipo:"fim",resultado:"vitoria",lado:0}; render();');
  const tituloOv = () => (d.querySelector('.result h1') || {}).textContent || '';
  vencerNivel();  // nível 1 → prof 1
  ok(!d.querySelector('.result--superou') && !/SUPERAD/.test(tituloOv()), 'nível 1 (prof 1 ≤ marca 2): ainda NÃO superou');
  w.eval('document.querySelector("#dfprox").click();'); vencerNivel();  // nível 2 → prof 2
  ok(!d.querySelector('.result--superou') && !/SUPERAD/.test(tituloOv()), 'nível 2 (prof 2 = marca 2): ainda NÃO superou');
  w.eval('document.querySelector("#dfprox").click();'); vencerNivel();  // nível 3 → prof 3 > 2
  ok(w.eval('dominioFim.superou') === true && /SUPERADO/.test(tituloOv()) && !!d.querySelector('.result--superou'), 'nível 3 (prof 3 > marca 2): SUPERAÇÃO anunciada (instante dourado, linguagem do banner de ranque)');
  ok(w.eval(`perfil.dominios.porDominio["${c0}"].run.superou`) === true, 'a superação é marcada na run (anuncia UMA vez)');
  // segue para o nível 4: NÃO re-anuncia (já superou)
  w.eval('document.querySelector("#dfprox").click();'); vencerNivel();
  ok(w.eval('dominioFim.superou') === false, 'nível 4: a superação NÃO re-dispara (uma vez por corrida)');
  ok(errs.length === 0, 'sem erros de jsdom no fluxo' + (errs.length ? ': ' + errs.join(' | ') : ''));
  w.close();
}

console.log('== 10) §276 A TELA DE ESCOLHA (pôster): sem recompensa/placar comparativo · SEU HISTÓRICO · A MARCA A BATER · sem 404 de arte · sem fundo obrigatório ==');
{
  const jsdom = require('jsdom');
  const html = fs.readFileSync(path.join(__dirname, '..', 'dist', 'incursion.html'), 'utf8');
  const vc = new jsdom.VirtualConsole(); const errs = []; vc.on('jsdomError', e => errs.push(e.message));
  const dom = new jsdom.JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc });
  const w = dom.window, d = w.document;
  w.eval('perfil=novoPerfil(0,0); ir("dominios",{},{substituir:true}); render();');
  const sel = d.querySelector('.dsel');
  ok(!!sel, 'a tela de escolha renderiza (.dsel)');
  // (correção 1) NADA de placar comparativo/recompensa: sem RANKING, TOP 10, recompensa, prêmio-por-ranque, baú
  const txt = sel.textContent.toUpperCase();
  ok(!/RANKING|TOP 10|TOP10|RECOMPENSA|PRÊMIO|PREMIO|BAÚ|BAU/.test(txt),
    'NENHUM cartão/banda promete recompensa ou placar comparativo (mentira 1 do mockup rejeitada)');
  // no lugar do "ranking semanal": SEU HISTÓRICO (canto sup. dir.) abre os recordes semanais locais
  ok(!!d.querySelector('#dhist') && /SEU HIST[ÓO]RICO/.test(txt), 'o botão do canto é SEU HISTÓRICO (recordes por Domínio)');
  d.querySelector('#dhist').click();
  const ov = d.querySelector('#dhistov');
  ok(!!ov && /SEM COMPARA[ÇC][ÃA]O COM OUTROS JOGADORES/.test(ov.textContent.toUpperCase()),
    'SEU HISTÓRICO diz, em voz alta, que é local e SEM comparação com outros jogadores');
  ov.remove();
  // no lugar da "barra de recompensas": A MARCA A BATER (o próprio recorde, nunca placar entre jogadores)
  ok(/A MARCA A BATER|COMECE A MARCAR/.test(txt), 'a barra de baixo é A MARCA A BATER (o próprio recorde), não recompensa');
  // (correção 2) NENHUM cartão "EM BREVE"/bloqueado: os cinco abrem
  ok(!/EM BREVE|BLOQUEAD/.test(txt), 'nenhum cartão diz EM BREVE / bloqueado (mentira 2: todos jogáveis desde o §274)');
  ok([...d.querySelectorAll('.dcard')].length === 5, 'os CINCO pôsteres aparecem');
  // (correção 4) o Domínio japonês é TAKAMAGAHARA (do dado), com a trinca Amaterasu/Susanoo/Tsukuyomi — nunca "Yomi"
  const jap = [...d.querySelectorAll('.dcard[data-cultura="japonesa"]')][0];
  ok(!!jap && /TAKAMAGAHARA/.test(jap.textContent.toUpperCase()) && !/YOMI(?!\w)/.test(jap.textContent.toUpperCase().replace('TSUKUYOMI','')),
    'o Domínio japonês é TAKAMAGAHARA (a arte dizia "Yomi" — mentira 4 rejeitada, vale o dado)');
  ok(/AMATERASU/.test(jap.textContent.toUpperCase()) && /SUSANOO/.test(jap.textContent.toUpperCase()) && /TSUKUYOMI/.test(jap.textContent.toUpperCase()),
    'a trinca japonesa é Amaterasu/Susanoo/Tsukuyomi (do dado)');
  // ARTE POR ARQUIVO: sem os .webp de Domínio, nenhum cartão emite <img> de arte (placeholder, nunca 404)
  const temArte = w.eval('typeof DOMINIOS_ARTE!=="undefined" && DOMINIOS_ARTE && Object.keys(DOMINIOS_ARTE).some(k=>/^dominio-/.test(k))');
  if (!temArte) {
    ok([...d.querySelectorAll('.dcard__art')].length === 0 && [...d.querySelectorAll('.dcard')].every(c => !!c.querySelector('.dcard__ph')),
      'sem arte de Domínio: cada cartão usa placeholder (.dcard__ph), NENHUM <img> de arte → sem 404 (§213)');
  } else {
    ok(true, 'há arte de Domínio no build — o portão de arquivo decide por cartão (medido à parte)');
  }
  // FUNDO OPCIONAL: sem dominios-fundo.webp, a tela NÃO emite <img.dsel__fundo> (usa o gradiente do jogo)
  const temFundo = w.eval('typeof DOMINIOS_ARTE!=="undefined" && DOMINIOS_ARTE && !!DOMINIOS_ARTE["dominios-fundo"]');
  if (!temFundo) ok(!d.querySelector('.dsel__fundo'), 'sem fundo: a tela não emite <img> de fundo (o gradiente radial do jogo assume) — funciona sem a arte');
  else ok(true, 'há arte de fundo no build');
  // (correção 3) PROGRESSO volta ao cartão: com recorde da semana, o cartão mostra o nível (entre a frase e o botão)
  const c0 = w.eval('Object.keys(DOMINIOS)[0]'); const cur = w.eval('domSemanaChave()');
  w.eval(`perfil=novoPerfil(0,0); perfil.dominios.porDominio["${c0}"]={run:null,melhorSempre:7,semanas:{"${cur}":7}}; ir("dominios",{},{substituir:true}); render();`);
  const prog = w.eval(`(document.querySelector('.dcard[data-cultura="${c0}"] .domcard__prog')||{}).textContent||''`);
  ok(/7\/40/.test(prog) && /Nível/.test(prog), 'o cartão traz o PROGRESSO da semana (nível 7/40) de volta ao cartão (correção 3; rótulo curto §278) — "' + prog.trim() + '"');
  ok(errs.length === 0, 'sem erros de jsdom no fluxo' + (errs.length ? ': ' + errs.join(' | ') : ''));
  w.close();
}

console.log('== 11) §277 RESKIN pôster: paleta distinta por cultura · emblema-monograma em LATINO (sem tofu) · rodapé de dois painéis ==');
{
  const jsdom = require('jsdom');
  const html = fs.readFileSync(path.join(__dirname, '..', 'dist', 'incursion.html'), 'utf8');
  const vc = new jsdom.VirtualConsole(); const errs = []; vc.on('jsdomError', e => errs.push(e.message));
  const dom = new jsdom.JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc });
  const w = dom.window, d = w.document;
  w.eval('perfil=novoPerfil(0,0); ir("dominios",{},{substituir:true}); render();');
  // cada cartão tem a classe de paleta da sua cultura
  const cults = w.eval('Object.keys(DOMINIOS)');
  let todosClasse = true;
  for (const c of cults) { if (!d.querySelector(`.dcard--${c}[data-cultura="${c}"]`)) todosClasse = false; }
  ok(todosClasse, 'cada cartão carrega a classe de paleta .dcard--<cultura>');
  // as CINCO paletas têm --tag DISTINTO (nenhuma duas iguais) — lido das regras CSS do bundle
  const tags = cults.map(c => { const m = new RegExp(`\\.dcard--${c}\\{[^}]*--tag:\\s*([^;]+);`).exec(html); return m ? m[1].trim() : null; });
  ok(tags.every(Boolean), 'toda cultura tem uma regra .dcard--<c> com --tag no CSS');
  ok(new Set(tags).size === cults.length, 'as cinco paletas têm --tag DISTINTO (' + tags.join(' · ') + ')');
  // o emblema-monograma é SÓ LATINO (basic + extended, ≤ U+024F) — cobertura da Cinzel subsetada (§260), sem tofu no Android
  const monos = [...d.querySelectorAll('.dcard__embmono')].map(e => e.textContent);
  ok(monos.length === cults.length, 'cada cartão sem arte mostra um monograma de emblema');
  const foraLatino = monos.filter(s => [...s].some(ch => ch.codePointAt(0) > 0x24F));
  ok(foraLatino.length === 0, 'todo monograma está no LATINO coberto pela Cinzel (sem glifo tofu) — monos: ' + monos.join(','));
  // o rodapé é de DOIS painéis, e o da esquerda tem o atalho VER HISTÓRICO
  ok(d.querySelectorAll('.dsel__pain').length === 2, 'o rodapé tem dois painéis (esq: melhor desempenho · dir: a marca a bater)');
  ok(!!d.querySelector('#dhistver'), 'o painel esquerdo tem o atalho VER HISTÓRICO');
  d.querySelector('#dhistver').click();
  ok(!!d.querySelector('#dhistov'), 'VER HISTÓRICO abre o mesmo overlay de histórico');
  (d.querySelector('#dhistov') || {}).remove && d.querySelector('#dhistov').remove();
  // o "?" do cabeçalho abre a ajuda HONESTA (sem placar comparativo/recompensa)
  ok(!!d.querySelector('#dajuda'), 'o cabeçalho tem o "?" de ajuda');
  d.querySelector('#dajuda').click();
  const aj = d.querySelector('#dajudaov');
  ok(!!aj && /SEM COMPARA[ÇC][ÃA]O COM OUTROS JOGADORES|SEM RECOMPENSA/.test(aj.textContent.toUpperCase()), 'a ajuda é honesta: placar só seu, sem recompensa');
  // o nome do Domínio sai em DUAS linhas (dois <span> dentro de .dcard__nome)
  ok([...d.querySelectorAll('.dcard__nome')].every(n => n.querySelectorAll('span').length === 2), 'o nome do Domínio vem em duas linhas (dois <span>)');
  // §277-ajustes: nome CURTO da trinca no cartão — Sun Wukong sai "Wukong" (do campo `curtos` do dado, §262)
  const chinesa = d.querySelector('.dcard[data-cultura="chinesa"]');
  ok(!!chinesa && /Wukong/.test(chinesa.textContent) && !/Sun Wukong/.test(chinesa.textContent),
    'o cartão chinês mostra "Wukong" (curto do dado), não "Sun Wukong"');
  // e a fonte disso é o DADO (a escada carrega `curtos`), não código
  ok(w.eval('!!(DOMINIOS.chinesa && DOMINIOS.chinesa.curtos && DOMINIOS.chinesa.curtos.sunwukong==="Wukong")'),
    'o nome curto vem do dado (DOMINIOS.chinesa.curtos.sunwukong)');
  // Amaterasu/Tsukuyomi FICAM inteiros no dado (sem forma curta graciosa — cortam com reticência, §277-ajustes)
  ok(w.eval('Object.keys(DOMINIOS.japonesa.curtos||{}).length===0'), 'a trinca japonesa fica inteira (curtos vazio) — reticência, não nome errado');
  // §278 — PROPORÇÃO do pôster: cartão 134 de largura (0,435 = referência do dono), não 172
  ok(/\.dcard\{[^}]*max-width:134px/.test(html), 'o cartão tem 134px de largura (proporção 0,435 da referência §278)');
  // §278 — o VÉU é um ARCO (máscara SVG em abóbada), não um degradê linear reto
  ok(/\.dcard__scrim\{[^}]*mask:url\(['"]?data:image\/svg\+xml/.test(html.replace(/\s+/g, ' ')), 'o véu é um ARCO (máscara SVG), não linha reta (§278)');
  // §278 — retrato de canto ARREDONDADO com moldura fina (sem o chanfro diagonal do §277)
  ok(/\.dcard__deus \.slot\{[^}]*border-radius:6px/.test(html) && !/\.dcard__deus \.slot\{[^}]*clip-path/.test(html),
    'o retrato é quadrado de canto arredondado + moldura fina (não chanfro diagonal) — §278');
  ok(errs.length === 0, 'sem erros de jsdom no fluxo' + (errs.length ? ': ' + errs.join(' | ') : ''));
  w.close();
}

console.log('== 12) §279 NOME DE ARQUIVO de arte é ASCII: a chave acentuada do dado traduz para o arquivo sem acento ==');
{
  const jsdom = require('jsdom');
  const html = fs.readFileSync(path.join(__dirname, '..', 'dist', 'incursion.html'), 'utf8');
  const vc = new jsdom.VirtualConsole(); const errs = []; vc.on('jsdomError', e => errs.push(e.message));
  const dom = new jsdom.JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc });
  const w = dom.window;
  w.eval('perfil=novoPerfil(0,0);');
  // a função é REUTILIZÁVEL (não tabela de 5): tira diacríticos por NFD
  ok(w.eval('semAcento("Egípcia")') === 'Egipcia', 'semAcento tira o acento (Egípcia→Egipcia)');
  ok(w.eval('semAcento("Nórdica")') === 'Nordica', 'semAcento tira o acento (Nórdica→Nordica)');
  ok(w.eval('semAcento("Céltica")') === 'Celtica', 'semAcento serve para culturas futuras (Céltica→Celtica)');
  // a tradução CHAVE(acentuada)→ARQUIVO(ASCII) que o cartão usa
  ok(w.eval('domArteArquivo("dominio","Egípcia")') === 'dominio-egipcia', 'a arte da Egípcia é dominio-egipcia (ASCII)');
  ok(w.eval('domArteArquivo("dominio","Nórdica")') === 'dominio-nordica', 'a arte da Nórdica é dominio-nordica (ASCII)');
  ok(w.eval('domArteArquivo("emblema","Nórdica")') === 'emblema-nordica', 'o emblema também é ASCII (emblema-nordica)');
  // e o resultado é ASCII PURO (sem nenhum codepoint > 127) para as CINCO culturas do dado
  const todasAscii = w.eval('Object.keys(DOMINIOS).every(c => { const a = domArteArquivo("dominio", c); return [...a].every(ch => ch.codePointAt(0) < 128); })');
  ok(todasAscii, 'os cinco nomes de arquivo de arte são ASCII puro (nenhum acento vaza para o disco/URL)');
  ok(errs.length === 0, 'sem erros de jsdom no fluxo' + (errs.length ? ': ' + errs.join(' | ') : ''));
  w.close();
}

console.log('');
console.log(f === 0 ? '>>> DOMINIOS OK' : `>>> ${f} FALHA(S)`);
if (f) process.exit(1);
