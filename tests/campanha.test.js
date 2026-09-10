// §252 — CAMPANHA NARRATIVA (O Trono do Uno): a tela do ATO substitui a lista. O ato tem TIPO
// (batalha|historia); capítulo = arquivo (data/campanha/ → CAMPANHAS). Bundle real em jsdom.
// As 5 GUARDAS da Fase 4 têm babá: tire a asserção e o teste quebra.
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

let falhas = 0;
const ok = (c, m) => { if (!c) { console.log('  FALHA: ' + m); falhas++; } };
const abertos = [];
function sessao() {
  const html = fs.readFileSync(path.join(__dirname, '../dist/incursion.html'), 'utf8');
  const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://x/' });
  abertos.push(dom);
  const w = dom.window, d = w.document;
  w.eval("perfil=novoPerfil(0,999); ['zeus','ogum','tyr','sobek','brigid','ganesha','cuca','fujin','nezha'].forEach(k=>{perfil.deuses[k]={copias:1,favorito:false,obtidoEm:0};});");
  return { w, d, $: s => d.querySelector(s), $$: s => [...d.querySelectorAll(s)] };
}
// lista plana dos atos, em ordem (cap, ato, id, tipo)
function flat(w) { return JSON.parse(w.eval(`JSON.stringify(CAMPS().flatMap((c,ci)=>c.atos.map((a,ai)=>({ci,ai,id:a.id,tipo:a.tipo,cap:c.numero}))))`)); }
function abrir(w, capIdx, atoIdx, concluidas, escolhas) {
  w.eval(`perfil.campanha={capitulo:0,fase:0,concluidas:${JSON.stringify(concluidas || [])},escolhas:${JSON.stringify(escolhas || {})}}; campCapIdx=${capIdx}; campAtoIdx=${atoIdx}; campSwap={}; campEscolhaSel=null; campKitRev=null; campVistaAto=null; ir('campanha',{},{substituir:true}); render();`);
}

console.log('== 1. os dados: 2 capítulos, 7 atos no Prólogo, 6 no Cap 1; tipos declarados ==');
{
  const { w } = sessao();
  const caps = JSON.parse(w.eval('JSON.stringify(CAMPS().map(c=>({num:c.numero,n:c.atos.length})))'));
  ok(caps.length === 2, `2 capítulos (tem ${caps.length})`);
  ok(caps[0].num === 0 && caps[0].n === 7, `Prólogo com 7 atos (veio ${caps[0] && caps[0].n})`);
  ok(caps[1].num === 1 && caps[1].n === 6, `Cap 1 com 6 atos (veio ${caps[1] && caps[1].n})`);
  const tipos = flat(w).map(a => a.tipo);
  ok(tipos.every(t => t === 'batalha' || t === 'historia' || t === 'escolha'), 'todo ato tem tipo batalha|historia|escolha');
}

console.log('== GUARDA 1 (§210): todo ato é alcançável pela linha do tempo ==');
{
  const { w, $$ } = sessao();
  const atos = flat(w);
  // caminho linear: para cada ato, com TODOS os anteriores feitos, ele fica ABERTO (jogável) — nunca preso.
  let inalcancavel = [];
  for (let p = 0; p < atos.length; p++) {
    const anteriores = atos.slice(0, p).map(a => a.id);
    abrir(w, atos[p].ci, atos[p].ai, anteriores);
    const est = w.eval(`atoEstado(${atos[p].ci},${atos[p].ai})`);
    if (est !== 'aberto') inalcancavel.push(atos[p].id + ':' + est);
  }
  ok(inalcancavel.length === 0, `todo ato abre quando os anteriores estão feitos (presos: ${inalcancavel.join(',')})`);   // BABÁ
  // e cada ato do capítulo aparece como um nó na linha do tempo (a navegação existe p/ todos)
  abrir(w, 0, 0, []);
  ok($$('.cnode').length === 7, `a linha do tempo do Prólogo mostra os 7 nós (tem ${$$('.cnode').length})`);   // BABÁ
}

console.log('== GUARDA 2: ato de não-batalha (escolha) não tem recompensa e não abre batalha ==');
{
  const { w } = sessao();
  // §268: os antigos atos de `historia` viraram `escolha` — nenhum abre luta nem paga.
  const naoBatalha = flat(w).filter(a => a.tipo !== 'batalha');
  ok(naoBatalha.length >= 2, `há atos que não são batalha (${naoBatalha.length})`);
  const comRec = JSON.parse(w.eval(`JSON.stringify(CAMPS().flatMap(c=>c.atos).filter(a=>a.tipo!=='batalha'&&a.recompensa!=null).map(a=>a.id))`));
  ok(comRec.length === 0, `nenhum ato de não-batalha tem recompensa (violam: ${comRec.join(',')})`);   // BABÁ
  // CONFIRMAR uma escolha NÃO abre batalha e NÃO paga
  const h = naoBatalha[0];
  abrir(w, h.ci, h.ai, flat(w).slice(0, flat(w).findIndex(a => a.id === h.id)).map(a => a.id));
  const gemaAntes = w.eval('perfil.moedas.gema');
  if (h.tipo === 'escolha') w.eval("document.querySelector('.copc[data-opc]').click();");   // seleciona 1ª opção
  w.eval("document.querySelector('#campcta').click();");
  ok(w.eval("rotaAtual()") === 'campanha', 'CONFIRMAR uma escolha NÃO vai para a batalha');   // BABÁ
  ok(w.eval('perfil.moedas.gema') === gemaAntes, 'CONFIRMAR uma escolha NÃO paga');   // BABÁ
  ok(w.eval(`perfil.campanha.concluidas.includes(${JSON.stringify(h.id)})`), 'a escolha fica marcada como vista');
}

console.log('== GUARDA 3: batalha do Cap 1+ tem 3 aliados e 3 inimigos; o Prólogo é ISENTO ==');
{
  const { w } = sessao();
  // Cap 1: toda batalha é 3×3
  const cap1bad = JSON.parse(w.eval(`JSON.stringify(CAMPS().filter(c=>c.numero>=1).flatMap(c=>c.atos).filter(a=>a.tipo==='batalha').filter(a=>(a.aliados||[]).length!==3||(a.inimigos||[]).length!==3).map(a=>a.id))`));
  ok(cap1bad.length === 0, `toda batalha do Cap 1 é 3×3 (fora do padrão: ${cap1bad.join(',')})`);   // BABÁ
  // Prólogo ISENTO: existe batalha do Prólogo que NÃO é 3×3 (senão a isenção seria vazia)
  const proNao3 = w.eval(`CAMPS()[0].atos.filter(a=>a.tipo==='batalha').some(a=>(a.inimigos||[]).length!==3)`);
  ok(proNao3 === true, 'o Prólogo tem batalha que não é 3×3 (3×1/3×2) — a isenção é real');   // BABÁ
}

console.log('== GUARDA 4: os 6 atos de batalha do Prólogo == data/campanha.json de hoje (balanço medido) ==');
{
  const { w } = sessao();
  const antigo = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/campanha.json'), 'utf8')).encontros;
  const proBatalhas = JSON.parse(w.eval(`JSON.stringify(CAMPS()[0].atos.filter(a=>a.tipo==='batalha').map(a=>({aliados:a.aliados,inimigos:a.inimigos,seed:a.montar.seed,comeca:a.montar.comeca})))`));
  ok(proBatalhas.length === 6 && antigo.length === 6, 'seis batalhas no Prólogo, seis encontros no antigo');
  let dif = [];
  for (let i = 0; i < 6; i++) {
    const a = antigo[i], b = proBatalhas[i];
    if (JSON.stringify(a.aliados) !== JSON.stringify(b.aliados)) dif.push(`${a.id}:aliados`);
    if (JSON.stringify(a.inimigos) !== JSON.stringify(b.inimigos)) dif.push(`${a.id}:inimigos`);
    if ((a.montar.seed || 0) !== (b.seed || 0)) dif.push(`${a.id}:seed`);
    if ((a.montar.comeca || 0) !== (b.comeca || 0)) dif.push(`${a.id}:comeca`);
  }
  ok(dif.length === 0, `Prólogo idêntico ao balanço medido de hoje (divergências: ${dif.join(', ')})`);   // BABÁ
}

console.log('== GUARDA 5: nenhuma arte de ato pede arquivo inexistente (§213: placeholder, nunca <img> 404) ==');
{
  const { w, $ } = sessao();
  const dirArte = path.join(__dirname, '../web/banners/campanha');
  const atos = flat(w);
  let vazamento = [];
  for (const a of atos) {
    abrir(w, a.ci, a.ai, atos.slice(0, atos.findIndex(x => x.id === a.id)).map(x => x.id));
    const arte = w.eval(`(CAMPS()[${a.ci}].atos[${a.ai}].arte||'')`);
    const existe = arte && fs.existsSync(path.join(dirArte, arte + '.webp'));
    const temImg = !!$('.camp__arteimg');
    if (!existe && temImg) vazamento.push(a.id + ' (img p/ arquivo ausente)');
    if (!existe && !$('.camp__artefallback')) vazamento.push(a.id + ' (sem placeholder)');
  }
  ok(vazamento.length === 0, `arte ausente sempre vira placeholder, nunca <img> (vazam: ${vazamento.join(', ')})`);   // BABÁ
}

console.log('== GUARDA 5b (§259): os 13 atos do Prólogo + Cap 1 têm ARTE PRESENTE — <img>, não placeholder ==');
{
  const { w, $ } = sessao();
  const dirArte = path.join(__dirname, '../web/banners/campanha');
  const atos = flat(w).filter(a => a.cap <= 1);   // Prólogo (0) + Capítulo 1 (1) = os 13 que ganharam arte no §259
  ok(atos.length === 13, `Prólogo + Cap 1 deveriam ter 13 atos, há ${atos.length}`);
  const semArte = [];
  for (const a of atos) {
    abrir(w, a.ci, a.ai, atos.slice(0, atos.findIndex(x => x.id === a.id)).map(x => x.id));
    const arte = w.eval(`(CAMPS()[${a.ci}].atos[${a.ai}].arte||'')`);
    const arteOk = w.eval(`!!CAMPS()[${a.ci}].atos[${a.ai}]._arteOk`);          // a build acendeu?
    const noDisco = !!(arte && fs.existsSync(path.join(dirArte, arte + '.webp'))); // arquivo presente? (BABÁ: renomeie e cai)
    const temImg = !!$('.camp__arteimg');                                        // a tela emite <img>?
    if (!(arteOk && noDisco && temImg)) semArte.push(`${a.id} (arte=${arte} _arteOk=${arteOk} disco=${noDisco} img=${temImg})`);
  }
  ok(semArte.length === 0, `os 13 atos saíram do placeholder e emitem <img> com o arquivo no disco (faltam: ${semArte.join(', ')})`);   // BABÁ: renomeie um webp e quebra
}

console.log('== 6. BATALHA: a CTA monta o time (travado + emprestado) e entra na luta ==');
{
  const { w } = sessao();
  const prologoTudo = ['pro-i', 'pro-ii', 'pro-iii', 'pro-iv', 'pro-v', 'pro-vi', 'pro-vii'];
  abrir(w, 1, 0, prologoTudo);   // Cap 1, ato I (Thor travado, Loki travado, Ogum emprestado)
  ok(w.eval(`JSON.stringify(timeDoAto(CAMPS()[1].atos[0]))`) === '["thor","loki","ogum"]', 'o time default é travados + emprestado');
  // troca o emprestado por um deus do jogador
  w.eval("campSwap={2:'nezha'}; render();");
  ok(w.eval(`JSON.stringify(timeDoAto(CAMPS()[1].atos[0]))`) === '["thor","loki","nezha"]', 'trocar o emprestado muda o time; travados ficam');
  w.eval("campSwap={}; document.querySelector('#campcta').click(); vsCPU=false; pararRelogio();");
  ok(w.eval("rotaAtual()") === 'batalha' && w.eval('campanha.id==="cap1-i"'), 'a CTA entra na batalha do ato');
  ok(w.eval('st.lados[0].units.map(u=>u.key).join(",")') === 'thor,loki,ogum', 'o time montou no motor');
  ok(w.eval('st.lados[1].units.length===3'), 'os 3 inimigos montaram (3×3)');
}

console.log('== 7. VITÓRIA paga UMA vez (chave de economia); DERROTA não paga nem conclui ==');
{
  const { w, $ } = sessao();
  const prologoTudo = ['pro-i', 'pro-ii', 'pro-iii', 'pro-iv', 'pro-v', 'pro-vi', 'pro-vii'];
  abrir(w, 1, 0, prologoTudo);
  w.eval("document.querySelector('#campcta').click(); vsCPU=false; pararRelogio();");
  const gema0 = w.eval('perfil.moedas.gema');
  const rec = w.eval('ECONOMIA.campanha.recompensas.encontro.gema');
  w.eval("st.fim={tipo:'fim',resultado:'vitoria',lado:0}; render();");
  ok(w.eval('perfil.moedas.gema') === gema0 + rec, `vitória paga a chave de economia (${rec})`);
  ok(w.eval('perfil.campanha.concluidas.includes("cap1-i")'), 'o ato entra em concluidas');
  ok(/ATO CONCLUÍDO/.test($('.result--prova').textContent), 'overlay anuncia o ato concluído');
  // re-jogar não paga
  w.eval("sairCampanha(); campCapIdx=1; campAtoIdx=0; ir('campanha'); render(); document.querySelector('#campcta').click(); vsCPU=false; pararRelogio();");
  const gema1 = w.eval('perfil.moedas.gema');
  w.eval("st.fim={tipo:'fim',resultado:'vitoria',lado:0}; render();");
  ok(w.eval('perfil.moedas.gema') === gema1, 're-jogar um ato vencido não paga de novo');
  // derrota
  abrir(w, 1, 2, prologoTudo.concat(['cap1-i', 'cap1-ii']));   // Cap 1 ato III (batalha)
  w.eval("document.querySelector('#campcta').click(); vsCPU=false; pararRelogio();");
  const gemaD = w.eval('perfil.moedas.gema');
  w.eval("st.fim={tipo:'fim',resultado:'vitoria',lado:1}; render();");
  ok(w.eval('perfil.moedas.gema') === gemaD, 'derrota não paga');
  ok(w.eval('!perfil.campanha.concluidas.includes("cap1-iii")'), 'derrota não conclui');
  ok(!!$('#cftentar'), 'derrota oferece tentar de novo');
}

console.log('== 8. TROCA de capítulo no cabeçalho quando o anterior está completo ==');
{
  const { w, $ } = sessao();
  const prologoTudo = ['pro-i', 'pro-ii', 'pro-iii', 'pro-iv', 'pro-v', 'pro-vi', 'pro-vii'];
  abrir(w, 0, 6, prologoTudo);   // Prólogo completo, olhando o último ato
  ok(!!$('#capnext'), 'com o Prólogo completo, dá para avançar ao Cap 1 no cabeçalho');
  $('#capnext').dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  ok(w.eval('campCapIdx') === 1, 'a seta troca para o Cap 1');
}

console.log('== 9. os aliados null (Prólogo VI): 3 slots vazios, CTA travada até 3 escolhidos ==');
{
  const { w, $, $$ } = sessao();
  abrir(w, 0, 5, ['pro-i', 'pro-ii', 'pro-iii', 'pro-iv', 'pro-v']);   // Prólogo VI (aliados:null)
  ok(w.eval('CAMPS()[0].atos[5].aliados===null'), 'o Prólogo VI mantém aliados:null (o time é do jogador)');
  ok($$('.cslot--vazio').length === 3, '3 slots vazios para o jogador montar');
  ok($('#campcta').disabled, 'a CTA fica travada sem os 3');
}

console.log('== GUARDAS §255 (o caminho da derrota): volta ao ato · troca sobrevive · Tentar de novo remonta a MESMA semente ==');
{
  const { w, $ } = sessao();
  const pro = ['pro-i', 'pro-ii', 'pro-iii', 'pro-iv', 'pro-v', 'pro-vi', 'pro-vii'];
  const concl = pro.concat(['cap1-i', 'cap1-ii', 'cap1-iii', 'cap1-iv', 'cap1-v']);
  // abre o Cap 1 VI (batalha, emprestados Ares/Hades), troca o slot 1 por um deus do jogador, entra e PERDE
  w.eval(`perfil.campanha={capitulo:0,fase:0,concluidas:${JSON.stringify(concl)}}; campCapIdx=1; campAtoIdx=5; campSwap={}; campVistaAto=null; campPicker=null; ir('campanha',{},{substituir:true}); render();`);
  w.eval("campSwap={1:'nezha'}; render();");
  const seedAto = w.eval('CAMPS()[1].atos[5].montar.seed');
  w.eval("document.querySelector('#campcta').click(); vsCPU=false; pararRelogio();");
  ok(w.eval("campanha.aliados.join(',')") === 'zeus,nezha,hades', 'o time montado leva a troca do jogador (zeus,nezha,hades)');
  w.eval("st.fim={tipo:'fim',resultado:'vitoria',lado:1}; render();");   // DERROTA (inimigo vence)
  // GUARDA A (§210): existe SEMPRE caminho de volta à tela do ato
  ok(!!$('#cfvoltarato'), 'a derrota oferece "Voltar ao ato" (caminho de volta, §210)');   // BABÁ
  ok(!!$('#cftentar'), 'a derrota oferece "Tentar de novo"');
  $('#cfvoltarato').dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  ok(w.eval("rotaAtual()") === 'campanha', '"Voltar ao ato" leva à tela do ato');
  ok(w.eval('CAMPS()[campCapIdx].atos[campAtoIdx].id') === 'cap1-vi', 'o ato ATUAL é o ato perdido (não a home nem o começo do capítulo)');
  // GUARDA B: o time montado sobrevive à volta
  ok(w.eval("campSwap[1]") === 'nezha', 'a troca do jogador sobrevive à volta (campSwap intacto)');   // BABÁ
  ok(w.eval("timeDoAto(CAMPS()[1].atos[5]).join(',')") === 'zeus,nezha,hades', 'a tela do ato mostra o time montado, não o emprestado padrão');   // BABÁ
  ok(/Nezha/i.test($('.camp__brief').textContent), 'o retrato do slot emprestado mostra o deus trocado');
  // GUARDA C: "Tentar de novo" remonta com a MESMA semente
  w.eval("document.querySelector('#campcta').click(); vsCPU=false; pararRelogio();");
  w.eval("st.fim={tipo:'fim',resultado:'vitoria',lado:1}; render();");
  w.eval("document.querySelector('#cftentar').click(); vsCPU=false; pararRelogio();");
  ok(w.eval("rotaAtual()") === 'batalha', '"Tentar de novo" reentra na batalha');
  ok(w.eval('st.seed') === seedAto, `"Tentar de novo" remonta com a MESMA semente (${seedAto}) — se alguém aleatorizar, quebra`);   // BABÁ
  ok(w.eval("campanha.aliados.join(',')") === 'zeus,nezha,hades', 'e com o MESMO time (a troca segue valendo)');
  // a VITÓRIA não mudou: derrota não concluiu nem pagou (o ato segue não-feito)
  ok(w.eval('!perfil.campanha.concluidas.includes("cap1-vi")'), 'a derrota não conclui o ato (vitória intacta)');
}

console.log('== GUARDA 6 (§254): arte de bestiário — arquivo presente vira <img>, ausente fica no monograma (nunca 404) ==');
{
  const { w } = sessao();
  // bicho COM arquivo (guardiao_bosque) → <img class="slot__art" src="bestiario/<chave>.webp">, sem 404
  const comArte = w.eval("slot('god-guardiao_bosque','GU','#fff',20)");
  ok(/<img[^>]*class="slot__art"[^>]*src="bestiario\/guardiao_bosque\.webp"/.test(comArte), 'bicho com arquivo emite <img> de bestiario/<chave>.webp');   // BABÁ
  ok(w.eval("!!BESTIARIO_ARTE.guardiao_bosque"), 'a build anotou guardiao_bosque como presente');
  // bicho SEM arquivo (chave que a build NÃO anotou) → monograma, NUNCA <img> (§213)
  const semArte = w.eval("slot('god-inexistente_zzz','ZZ','#fff',20)");
  ok(!/<img/.test(semArte), 'bicho sem arquivo NÃO emite <img> (nada de 404, §213)');   // BABÁ
  ok(/slot__glyph/.test(semArte) && /ZZ/.test(semArte), 'e mostra o monograma-reserva');   // BABÁ
  // o caminho dos DEUSES não muda (retrato embutido, não vira arquivo de bestiário)
  const deus = w.eval("slot('god-zeus','ZE','#fff',20)");
  ok(/<img/.test(deus) && !/bestiario\//.test(deus), 'o retrato de DEUS segue embutido (não pega o caminho do bestiário)');
}

console.log('== §268 A: a build RECUSA consequência fora do vocabulário fechado e efeito.errada sem certa ==');
{
  // babá REAL da rejeição da build: chama a MESMA função que a build usa, com dado inválido.
  const { errosEscolha } = require('../tools/valida_campanha');
  const ctx = { catalogoKeys: new Set(['hel', 'nezha']), atosPorId: { alvo1: { id: 'alvo1', tipo: 'batalha', inimigos: ['hel'] } } };
  const base = { pergunta: 'q?', opcoes: [{ id: 'a', rotulo: 'A' }, { id: 'b', rotulo: 'B' }], alvo: 'alvo1' };
  // 1) verbo fora do vocabulário (acrescentar inimigo) → recusa
  const e1 = errosEscolha('x', Object.assign({}, base, { certa: 'a', efeito: { certa: { inimigo: 'hel' }, errada: {} } }), ctx);
  ok(e1.some(m => /vocabulário fechado/.test(m)), `consequência fora dos 3 verbos é recusada (${e1.join('|') || 'nenhum erro!'})`);   // BABÁ
  // 2) sem certa, mas com efeito.errada → recusa (não há leitura errada)
  const e2 = errosEscolha('x', Object.assign({}, base, { efeito: { errada: {}, a: {}, b: {} } }), ctx);
  ok(e2.some(m => /pode ter efeito\.errada/i.test(m)), `escolha sem certa recusa efeito.errada (${e2.join('|') || 'nenhum erro!'})`);   // BABÁ
  // 3) kitRevelado de quem não é inimigo do alvo → recusa
  const e3 = errosEscolha('x', Object.assign({}, base, { certa: 'a', efeito: { certa: { kitRevelado: 'nezha' }, errada: {} } }), ctx);
  ok(e3.some(m => /kitRevelado .* não é inimigo/.test(m)), `kitRevelado precisa ser inimigo do alvo (${e3.join('|') || 'nenhum erro!'})`);   // BABÁ
  // 4) alvo que não é batalha → recusa
  const ctx2 = { catalogoKeys: ctx.catalogoKeys, atosPorId: { alvo1: { id: 'alvo1', tipo: 'escolha' } } };
  const e4 = errosEscolha('x', Object.assign({}, base, { certa: 'a', efeito: { certa: {}, errada: {} } }), ctx2);
  ok(e4.some(m => /não é uma batalha/.test(m)), `o alvo tem de ser batalha (${e4.join('|') || 'nenhum erro!'})`);   // BABÁ
  // 5) o verbo `orbes` (no vocabulário, mas sem PRODUTOR real hoje — a válvula medida da FASE 1) é validável
  //    SEM ato real: número passa, não-número recusa. Guarda sintética para que 'sem uso' não vire 'sem guarda'.
  const eOrbOk = errosEscolha('x', Object.assign({}, base, { certa: 'a', efeito: { certa: { orbes: -1 }, errada: {} } }), ctx);
  ok(!eOrbOk.some(m => /orbes/.test(m)), `orbes com número é aceito (${eOrbOk.join('|')})`);   // BABÁ
  const eOrbBad = errosEscolha('x', Object.assign({}, base, { certa: 'a', efeito: { certa: { orbes: 'muito' }, errada: {} } }), ctx);
  ok(eOrbBad.some(m => /orbes precisa ser número/.test(m)), `orbes não-número é recusado (${eOrbBad.join('|') || 'nenhum erro!'})`);   // BABÁ
}

console.log('== §268 A-bis: o tipo `historia` (0 instância hoje, volta no Cap 2) é validável SEM ato real ==');
{
  const { errosHistoria } = require('../tools/valida_campanha');
  ok(errosHistoria('h', { tipo: 'historia' }).length === 0, 'história sem recompensa passa');   // BABÁ
  const eh = errosHistoria('h', { tipo: 'historia', recompensa: 'encontro' });
  ok(eh.some(m => /NÃO pode ter recompensa/.test(m)), `história com recompensa é recusada (${eh.join('|') || 'nenhum erro!'})`);   // BABÁ
}

console.log('== §268 B: escolha sem `certa` não tem efeito.errada; `errada` nunca muda o balanço (não bloqueia) ==');
{
  const { w } = sessao();
  const escolhas = JSON.parse(w.eval(`JSON.stringify(CAMPS().flatMap(c=>c.atos).filter(a=>a.tipo==='escolha').map(a=>({id:a.id,certa:a.certa||null,efeito:a.efeito,rev:a.revelacao})))`));
  ok(escolhas.length === 3, `há 3 atos de escolha no jogo (tem ${escolhas.length})`);
  for (const a of escolhas) {
    if (a.certa == null) ok(!('errada' in (a.efeito || {})), `${a.id}: sem certa ⇒ sem efeito.errada`);   // BABÁ
    // FASE 1: errar CUSTA, nunca BLOQUEIA — a consequência `errada` não altera o balanço medido
    // (nada de `orbes` no ramo errado; hoje é {}). Se alguém puser orbes na errada, isto quebra.
    if (a.certa != null) ok(!((a.efeito && a.efeito.errada) || {}).orbes, `${a.id}: a leitura errada não tira orbes (não bloqueia o ato-alvo)`);   // BABÁ
    // §268 correção: no ato de IDENTIDADE (sem `certa` — o mapa plano→deus), todo deus `emprestado` está
    // FORA dos 9 fixos do novoPerfil — emprestar quem o jogador já tem garantido não é anzol (o pacote de 10
    // impede garantia absoluta; 'fora dos 9' é a linha acionável). Os atos COM `certa` são exceção deliberada:
    // ali o empréstimo é recompensa NARRATIVA da fonte (Cap 1 V empresta Nezha — o protagonista dos 22
    // capítulos aliando-se a você — mesmo Nezha sendo inicial; a intenção é a história, não expandir acervo).
    if (a.certa == null) for (const res of Object.keys(a.efeito || {})) {
      const g = (a.efeito[res] || {}).emprestado;
      if (g) ok(!w.eval(`INICIAIS.includes(${JSON.stringify(g)})`), `${a.id}/${res}: emprestado de identidade "${g}" não pode ser um dos 9 fixos do novoPerfil`);   // BABÁ
    }
  }
}

console.log('== §268 C: a CONSEQUÊNCIA cai no ato-alvo conforme a escolha gravada (empréstimo, kit, revelação) ==');
{
  const { w, $, $$ } = sessao();
  const proAll = ['pro-i', 'pro-ii', 'pro-iii', 'pro-iv', 'pro-v', 'pro-vi', 'pro-vii'];
  const cap1ate5 = proAll.concat(['cap1-i', 'cap1-ii', 'cap1-iii', 'cap1-iv', 'cap1-v']);
  // Prólogo I (olimpo) → empréstimo Poseidon semeia o 1º slot do Prólogo VI; a revelação aparece lá.
  // §268 correção: o deus emprestado NÃO pode ser um dos 9 fixos do novoPerfil (zeus/sobek eram; saíram).
  abrir(w, 0, 5, ['pro-i', 'pro-ii', 'pro-iii', 'pro-iv', 'pro-v'], { 'pro-i': 'olimpo' });
  ok(w.eval('slotsDoAto(CAMPS()[0].atos[5])[0].deus') === 'poseidon', 'Prólogo I=olimpo ⇒ empréstimo Poseidon no 1º slot do Prólogo VI');   // BABÁ
  ok(!w.eval(`INICIAIS.includes(slotsDoAto(CAMPS()[0].atos[5])[0].deus)`), 'o deus emprestado não está entre os 9 fixos do novoPerfil (não emprestar quem já se tem)');   // BABÁ
  ok($$('.cslot--vazio').length === 2, 'os outros 2 slots do Prólogo VI seguem do jogador (empréstimo só semeia 1)');
  ok(!!$('.camp__revel') && /Poseidon/.test($('.camp__revel').textContent), 'a revelação do empréstimo aparece no ato-alvo');   // BABÁ
  // Conselho CERTA (ah puch) → kit de Hel revelado no Cap 1 VI + revelação certa
  abrir(w, 1, 5, cap1ate5, { 'cap1-ii': 'ahpuch' });
  ok(!!$('.camp__kitchip'), 'Conselho certo (Ah Puch) ⇒ chip do kit revelado no Cap 1 VI');   // BABÁ
  ok(/segredo ficou/.test($('.camp__revel').textContent), 'a revelação certa do Conselho aparece');
  w.eval("document.querySelector('[data-kitrev]').click();");
  ok(!!$('#campkitrevov') && $$('.camp__kitrevlist .krow').length === 4, 'o overlay mostra o kit inteiro de Hel (4 skills)');   // BABÁ
  // Conselho ERRADA → SEM kit (consequência de erro é a PERDA do bônus, nunca desvantagem medida)
  abrir(w, 1, 5, cap1ate5, { 'cap1-ii': 'susanoo' });
  ok(!$('.camp__kitchip'), 'Conselho errado ⇒ NENHUM kit revelado (erro custa o bônus, não bloqueia)');   // BABÁ
  ok(/sem uma palavra/.test($('.camp__revel').textContent), 'a revelação errada do Conselho aparece');
  // Nezha CERTA (rivais) → empréstimo Nezha no slot emprestado do Cap 1 VI
  abrir(w, 1, 5, cap1ate5, { 'cap1-v': 'rivais' });
  ok(w.eval('timeDoAto(CAMPS()[1].atos[5]).join(",")') === 'zeus,nezha,hades', 'Nezha certo ⇒ empréstimo Nezha (zeus,nezha,hades)');   // BABÁ
  // NADA gravado ⇒ nenhuma consequência (o balanço medido do Cap 1 VI fica intacto)
  abrir(w, 1, 5, cap1ate5, {});
  ok(w.eval('timeDoAto(CAMPS()[1].atos[5]).join(",")') === 'zeus,ares,hades', 'sem escolha gravada, o time do Cap 1 VI é o default medido');   // BABÁ
  ok(!$('.camp__kitchip') && !$('.camp__revel'), 'sem escolha, nem kit nem revelação (a consequência se revela quando acontece)');
}

console.log('== §268 D: a trilha distingue os TRÊS tipos de nó (batalha|historia|escolha), sem rótulo escrito ==');
{
  const { w, $$ } = sessao();
  abrir(w, 1, 0, ['pro-i', 'pro-ii', 'pro-iii', 'pro-iv', 'pro-v', 'pro-vi', 'pro-vii']);
  const tipos = $$('.cnode').map(n => n.getAttribute('data-tipo'));
  ok(tipos.join(',') === 'batalha,escolha,batalha,batalha,escolha,batalha', `os nós do Cap 1 carregam o tipo (veio ${tipos.join(',')})`);   // BABÁ
  // cada tipo tem a SUA classe de forma no nó (o sinal é a forma, não texto)
  ok($$('.cnode--t-batalha').length === 4 && $$('.cnode--t-escolha').length === 2, 'batalha e escolha têm classes de forma distintas na trilha');   // BABÁ
  ok(!/cnode__nome[^>]*>[^<]*(BATALHA|ESCOLHA|HISTÓRIA)/i.test(w.eval('document.querySelector(".camp__nos").innerHTML')), 'o tipo NÃO vira rótulo escrito (o nó é a forma)');
  // e o Prólogo tem o tipo escolha no 1º nó (a identidade) + 6 batalhas
  abrir(w, 0, 0, []);
  const pt = $$('.cnode').map(n => n.getAttribute('data-tipo'));
  ok(pt[0] === 'escolha' && pt.slice(1).every(t => t === 'batalha'), `Prólogo: 1 escolha (identidade) + 6 batalhas (veio ${pt.join(',')})`);   // BABÁ
  ok($$('.cnode').length === 7, 'os 7 nós do Prólogo continuam cabendo na trilha (§259)');   // BABÁ
}

for (const dom of abertos) try { dom.window.close(); } catch (e) {}
if (falhas) { console.log(`\n>>> ${falhas} FALHA(S) na campanha`); process.exit(1); }
console.log('>>> CAMPANHA OK');
process.exit(0);
