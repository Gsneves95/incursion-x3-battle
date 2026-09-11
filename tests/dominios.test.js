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
const ladder = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'dominios', 'grega.json'), 'utf8'));
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

console.log('== 5) as CINCO escadas são monotônicas na dificuldade medida (como a grega) ==');
{
  const keys = new Set(Object.keys(GODS));
  const dir = path.join(__dirname, '..', 'data', 'dominios');
  const arqs = fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort();
  ok(arqs.length === 5, 'cinco arquivos de escada publicados (tem ' + arqs.length + ': ' + arqs.join(',') + ')');
  for (const f of arqs) {
    const lad = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    const erros = D.domValidarLadder(lad, keys);
    ok(erros.length === 0, `${lad.cultura}: domValidarLadder aprova (${erros[0] || 'ok'})`);
    let prev = -Infinity, mono = true;
    for (const lv of lad.niveis) { if (lv.dificuldade < prev - (lad.tolMonotonia || 0.06)) mono = false; prev = Math.max(prev, lv.dificuldade); }
    ok(mono && lad.niveis.length === 40 && lad.trio.length === 3, `${lad.cultura}: 40 níveis, trio de 3, monotônica (${lad.niveis[0].dificuldade}→${lad.niveis[lad.niveis.length-1].dificuldade})`);
  }
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

console.log('');
console.log(f === 0 ? '>>> DOMINIOS OK' : `>>> ${f} FALHA(S)`);
if (f) process.exit(1);
