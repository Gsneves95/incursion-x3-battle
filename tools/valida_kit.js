// tools/valida_kit.js — SCHEMA de kit, validado na BUILD (falha alto).
// O vocabulário (classes, tipos de fx, tipos de efeito, alvos, chaves de custo e de fx)
// NÃO é redigitado aqui — vem de E.VOCAB, o próprio motor. Assim o schema não pode divergir
// do que o motor executa: se o motor ganhar/perder um fx.t, o validador acompanha sozinho.
//
// O que ele pega (o que impede erro silencioso ao escrever 73 kits):
//  - campo desconhecido no deus, na habilidade e no efeito (typo de chave)
//  - custo mal formado (elemento inválido, valor não inteiro positivo)
//  - classe inválida (habilidade e classePorModo)
//  - alvo inexistente
//  - efeito com tipo que o motor não sabe executar (fx.t) e apply com eff.type inválido
// Valida também a DEFESA (é regra, mas tem o MESMO formato de habilidade — se o formato
// mudar, a Defesa não fica para trás sem ninguém perceber).

const E = require('../src/engine.js');
const V = E.VOCAB;

const CHAVES_DEUS = new Set(['key', 'nome', 'faccao', 'elem', 'classe', 'funcao', 'inicial', 'passiva', 'provacao', 'ab']);
const CHAVES_PASSIVA = new Set(['nome', 'desc', 'fx', 'inerte']);   // inerte: passiva ainda não funcional (UI acinzenta)
const CHAVES_AB = new Set(['slot', 'classe', 'classePorModo', 'nome', 'cost', 'cd', 'alvo', 'desc', 'fx', 'alterna', 'modos', 'opcoes', 'universal', 'umaVez']);
const CLASSES_DEUS = new Set([...V.classes, 'Híbrido']);   // no deus, Híbrido é rótulo válido; na habilidade não

function validarCusto(cost, ctx, errs) {
  if (typeof cost !== 'object' || cost === null || Array.isArray(cost)) { errs.push(`${ctx}: custo mal formado (não é objeto)`); return; }
  for (const [k, v] of Object.entries(cost)) {
    if (!V.custo.includes(k)) errs.push(`${ctx}: custo com elemento inválido "${k}" (válidos: ${V.custo.join(', ')})`);
    if (typeof v !== 'number' || !Number.isInteger(v) || v <= 0) errs.push(`${ctx}: custo "${k}" mal formado (${JSON.stringify(v)}; esperado inteiro > 0)`);
  }
}

function validarFx(f, ctx, errs) {
  if (!f || typeof f !== 'object' || Array.isArray(f)) { errs.push(`${ctx}: efeito não é objeto`); return; }
  if (!V.fx.includes(f.t)) errs.push(`${ctx}: efeito com tipo que o motor não sabe executar: "${f.t}"`);
  if (f.t === 'apply' && (!f.eff || !V.efeitos.includes(f.eff.type)))
    errs.push(`${ctx}: apply com eff.type inválido: "${f.eff && f.eff.type}"`);
  if (f.t === 'dot' && !V.dots.includes(f.nome))
    errs.push(`${ctx}: dot com nome fora do vocabulário: "${f.nome}" (válidos: ${V.dots.join(', ')})`);
  if (f.t === 'contador' && !V.contadores.includes(f.nome))
    errs.push(`${ctx}: contador com nome fora do vocabulário: "${f.nome}" (válidos: ${V.contadores.join(', ')})`);
  if ('limiar' in f) {   // gatilho-no-acúmulo: contador cruza `em` -> aplica `aplica` (F1.1)
    const L = f.limiar;
    if (!L || typeof L !== 'object') errs.push(`${ctx}: limiar não é objeto`);
    else {
      if (typeof L.em !== 'number' || !Number.isInteger(L.em) || L.em <= 0) errs.push(`${ctx}: limiar.em inválido (${JSON.stringify(L.em)}; inteiro > 0)`);
      if (!L.aplica || !V.efeitos.includes(L.aplica.type)) errs.push(`${ctx}: limiar.aplica.type inválido: "${L.aplica && L.aplica.type}"`);
    }
  }
  if ('executaAbaixoDe' in f && (!Number.isInteger(f.executaAbaixoDe) || f.executaAbaixoDe <= 0)) errs.push(`${ctx}: executaAbaixoDe mal formado (${JSON.stringify(f.executaAbaixoDe)}; inteiro > 0)`);
  if ('seCond' in f) {   // F1.6: bump condicional geral — {quando: <condição ofensiva>, v: dano quando a condição bate}
    const s = f.seCond;
    if (!s || typeof s !== 'object' || typeof s.v !== 'number' || !Number.isInteger(s.v) || s.v <= 0) errs.push(`${ctx}: seCond.v mal formado (${JSON.stringify(s && s.v)}; inteiro > 0)`);
    else validarQuando(s.quando, `${ctx}.seCond.quando`, errs);
  }
  if (f.t === 'condicional') {   // F1.6 (Freyja): se(estado) ? entao[fx] : senao[fx]
    if (!('se' in f)) errs.push(`${ctx}: condicional exige 'se' (condição de estado)`); else validarEstado(f.se, `${ctx}.se`, errs);
    if (!('entao' in f) && !('senao' in f)) errs.push(`${ctx}: condicional exige ao menos um ramo (entao/senao)`);
    for (const ramo of ['entao', 'senao']) {
      if (!(ramo in f)) continue;
      if (!Array.isArray(f[ramo]) || f[ramo].length === 0) errs.push(`${ctx}.${ramo}: deve ser array de fx não-vazio`);
      else f[ramo].forEach((x, i) => validarFx(x, `${ctx}.${ramo}[${i}]`, errs));
    }
  }
  for (const k of Object.keys(f)) if (!V.fxKeys.includes(k)) errs.push(`${ctx}: campo desconhecido no efeito: "${k}"`);
}

// Valida a CONDIÇÃO `quando` de um fx de passiva (F1.2). O conjunto de condições e COMO validar o
// valor de cada uma vêm de V.condicoesDef (o motor), não são redigitados aqui. `pendente` = condição
// no vocabulário mas cujo estado o motor ainda não rastreia: recusa em voz alta (não vira falso silencioso).
function validarQuando(q, ctx, errs) {
  if (!q || typeof q !== 'object' || Array.isArray(q)) { errs.push(`${ctx}: quando não é objeto`); return; }
  const chaves = Object.keys(q);
  if (chaves.length !== 1) errs.push(`${ctx}: quando deve ter exatamente 1 condição (tem ${chaves.length})`);
  for (const k of chaves) {
    if (k === 'fase') { errs.push(`${ctx}: "fase" MIGROU para o campo estado (é estado-de-campo, não do ataque) — use estado:{fase}`); continue; }
    const def = V.condicoesDef[k];
    if (!def) { errs.push(`${ctx}: condição desconhecida "${k}" (válidas: ${V.condicoes.join(', ')})`); continue; }
    if (def.pendente) { errs.push(`${ctx}: condição "${k}" reservada — ${def.pendente}`); continue; }
    const val = q[k];
    if (def.bool) { if (val !== true) errs.push(`${ctx}: condição "${k}" espera true (recebeu ${JSON.stringify(val)})`); }
    else if (def.hp) {
      if (!val || typeof val !== 'object' || !['cheio', 'abaixo', 'acima'].includes(val.op)) errs.push(`${ctx}: alvoHp.op inválido (${JSON.stringify(val && val.op)}; cheio|abaixo|acima)`);
      else if ((val.op === 'abaixo' || val.op === 'acima') && typeof val.v !== 'number') errs.push(`${ctx}: alvoHp.v ausente para op "${val.op}"`);
    }
    else if (def.sub) { if (!def.sub.includes(val)) errs.push(`${ctx}: valor "${val}" fora do sub-vocabulário de "${k}" (válidos: ${def.sub.join(', ') || '(vazio)'})`); }
  }
}

// Valida a CONDIÇÃO DEFENSIVA `contra` do gatilho reducao (F1.2 sessão 3). Eixo SEPARADO do `quando`
// (que é ofensivo): `contra` lê o golpe que chega. Conjunto e sub-vocabulário vêm de V.contraDef (o motor).
function validarContra(c, ctx, errs) {
  if (!c || typeof c !== 'object' || Array.isArray(c)) { errs.push(`${ctx}: contra não é objeto`); return; }
  const chaves = Object.keys(c);
  if (chaves.length !== 1) errs.push(`${ctx}: contra deve ter exatamente 1 condição (tem ${chaves.length})`);
  for (const k of chaves) {
    const def = V.contraDef[k];
    if (!def) { errs.push(`${ctx}: condição de redução desconhecida "${k}" (válidas: ${V.contra.join(', ')})`); continue; }
    if (def.sub && !def.sub.includes(c[k])) errs.push(`${ctx}: valor "${c[k]}" fora do sub-vocabulário de "${k}" (válidos: ${def.sub.join(', ')})`);
  }
}

// Valida a CONDIÇÃO `quandoCura` do gatilho bonusCura (F1.2 sessão 7). TERCEIRO eixo, separado de `quando`
// (ofensivo) e `contra` (defensivo): a cura não tem ataque, então lê o contexto da cura. Vem de V.condicoesCuraDef.
function validarQuandoCura(q, ctx, errs) {
  if (!q || typeof q !== 'object' || Array.isArray(q)) { errs.push(`${ctx}: quandoCura não é objeto`); return; }
  const chaves = Object.keys(q);
  if (chaves.length !== 1) errs.push(`${ctx}: quandoCura deve ter exatamente 1 condição (tem ${chaves.length})`);
  for (const k of chaves) {
    const def = V.condicoesCuraDef[k];
    if (!def) { errs.push(`${ctx}: condição de cura desconhecida "${k}" (válidas: ${V.condicoesCura.join(', ')})`); continue; }
    if (def.sub && !def.sub.includes(q[k])) errs.push(`${ctx}: valor "${q[k]}" fora do sub-vocabulário de "${k}" (válidos: ${def.sub.join(', ')})`);
  }
}

// Valida o `faz` de um gatilho de turno (F1.2 sessão 4). Reusa validarFx (o fx é normal), mas EXIGE que o
// tipo esteja no subconjunto turno-seguro (V.fxTurno) e que o alvo seja fixo — um gatilho de turno não
// escolhe alvo. Sem isso, alguém declara faz:[{t:'dmg'}] sem alvo e o motor descobre em runtime.
function validarFaz(faz, ctx, errs) {
  if (!Array.isArray(faz) || faz.length === 0) { errs.push(`${ctx}: faz deve ser array não-vazio`); return; }
  faz.forEach((fx, i) => {
    const cc = `${ctx}[${i}]`;
    validarFx(fx, cc, errs);
    if (fx && typeof fx === 'object' && !V.fxTurno.includes(fx.t)) errs.push(`${cc}: fx "${fx.t}" não pode disparar por turno (válidos: ${V.fxTurno.join(', ')}) — exigiria alvo escolhido ou seletor`);
    if (fx && typeof fx === 'object' && 'alvo' in fx && fx.alvo !== 'self') errs.push(`${cc}: faz não escolhe alvo — alvo deve ser 'self' (o dono) ou ausente (o lado)`);
    // F1.2.5: alvo de heal/apply num faz é FIXO — escopo self|time (self ou own-lado), nunca escolhido/inimigo.
    if (fx && typeof fx === 'object' && 'escopo' in fx && !['self', 'time'].includes(fx.escopo)) errs.push(`${cc}: escopo de faz inválido "${fx.escopo}" (só self|time — o lado do sujeito, nunca inimigo)`);
    // apply dentro de um faz só aplica BUFF — um controle/debuff exigiria um alvo inimigo ESCOLHIDO, que o faz proíbe.
    if (fx && typeof fx === 'object' && fx.t === 'apply' && fx.eff && !V.buffs.includes(fx.eff.type)) errs.push(`${cc}: apply dentro de faz só aplica BUFF (${V.buffs.join('|')}); "${fx.eff.type}" é controle/debuff e exigiria alvo inimigo escolhido`);
  });
}

// Valida o `noAtacante` do aoSerAtingido (F1.4) — payload que roda no ATACANTE (sujeito ENTREGUE pelo evento, não
// escolhido — §55). Ao contrário do `faz` (BUFF-only em self/lado, garantia intacta), aqui o alvo é o INIMIGO do
// evento, então DoT e apply-DEBUFF são PERMITIDOS. Proíbe dmg (recursaria em bater) e apply-BUFF (buff no inimigo é inútil).
function validarNoAtacante(payload, ctx, errs) {
  if (!Array.isArray(payload) || payload.length === 0) { errs.push(`${ctx}: noAtacante deve ser array não-vazio`); return; }
  payload.forEach((fx, i) => {
    const cc = `${ctx}[${i}]`;
    if (!fx || typeof fx !== 'object') { errs.push(`${cc}: fx não é objeto`); return; }
    if (!['dot', 'apply'].includes(fx.t)) { errs.push(`${cc}: noAtacante só aceita dot|apply no atacante ("${fx.t}" não — dmg recursaria, buff no inimigo é inútil)`); return; }
    if (fx.t === 'dot') {
      if (typeof fx.nome !== 'string' || !fx.nome) errs.push(`${cc}: dot.nome ausente`);
      if (typeof fx.v !== 'number' || !Number.isInteger(fx.v) || fx.v <= 0) errs.push(`${cc}: dot.v inválido (${JSON.stringify(fx.v)}; inteiro > 0)`);
      if (typeof fx.dur !== 'number' || !Number.isInteger(fx.dur) || fx.dur <= 0) errs.push(`${cc}: dot.dur inválido (${JSON.stringify(fx.dur)}; inteiro > 0)`);
    }
    if (fx.t === 'apply') {
      if (!fx.eff || !V.efeitos.includes(fx.eff.type)) errs.push(`${cc}: apply.eff.type inválido "${fx.eff && fx.eff.type}"`);
      else if (V.buffs.includes(fx.eff.type)) errs.push(`${cc}: noAtacante aplica DEBUFF/controle no atacante, não BUFF ("${fx.eff.type}" é buff)`);
    }
  });
}

// Valida o `noAtor` do aoAgirSobEfeito (F1.4) — payload no ATOR (sujeito do evento). Ao contrário do `noAtacante`
// (aoSerAtingido, que PROÍBE dmg p/ não recursar), aqui dmg É permitido: o gatilho é por AÇÃO, não por golpe, então
// dano no ator não re-dispara o gatilho (§56). Proíbe apply-BUFF (buff no inimigo é inútil).
function validarNoAtor(payload, ctx, errs) {
  if (!Array.isArray(payload) || payload.length === 0) { errs.push(`${ctx}: noAtor deve ser array não-vazio`); return; }
  payload.forEach((fx, i) => {
    const cc = `${ctx}[${i}]`;
    if (!fx || typeof fx !== 'object') { errs.push(`${cc}: fx não é objeto`); return; }
    if (!['dmg', 'dot', 'apply'].includes(fx.t)) { errs.push(`${cc}: noAtor só aceita dmg|dot|apply no ator ("${fx.t}" não)`); return; }
    if (fx.t === 'dmg' && (typeof fx.v !== 'number' || !Number.isInteger(fx.v) || fx.v <= 0)) errs.push(`${cc}: dmg.v inválido (${JSON.stringify(fx.v)}; inteiro > 0)`);
    if (fx.t === 'dot') {
      if (typeof fx.nome !== 'string' || !fx.nome) errs.push(`${cc}: dot.nome ausente`);
      if (typeof fx.v !== 'number' || !Number.isInteger(fx.v) || fx.v <= 0) errs.push(`${cc}: dot.v inválido (${JSON.stringify(fx.v)}; inteiro > 0)`);
      if (typeof fx.dur !== 'number' || !Number.isInteger(fx.dur) || fx.dur <= 0) errs.push(`${cc}: dot.dur inválido (${JSON.stringify(fx.dur)}; inteiro > 0)`);
    }
    if (fx.t === 'apply') {
      if (!fx.eff || !V.efeitos.includes(fx.eff.type)) errs.push(`${cc}: apply.eff.type inválido "${fx.eff && fx.eff.type}"`);
      else if (V.buffs.includes(fx.eff.type)) errs.push(`${cc}: noAtor aplica DEBUFF no ator, não BUFF ("${fx.eff.type}")`);
    }
  });
}

// Valida o campo `estado` (F1.2.5 s3) — CAMPO UNIVERSAL de condição de estado, composável com o eixo do gatilho.
// Conjunto e validação vêm de V.estadoCondDef. `pendente` = precisa de rastreio (primeiroPorTurno): recusa em voz alta.
function validarEstado(e, ctx, errs) {
  if (!e || typeof e !== 'object' || Array.isArray(e)) { errs.push(`${ctx}: estado não é objeto`); return; }
  const chaves = Object.keys(e);
  if (chaves.length !== 1) errs.push(`${ctx}: estado deve ter exatamente 1 condição (tem ${chaves.length})`);
  for (const k of chaves) {
    const def = V.estadoCondDef[k];
    if (!def) { errs.push(`${ctx}: condição de estado desconhecida "${k}" (válidas: ${V.estadoCond.join(', ')})`); continue; }
    if (def.pendente) { errs.push(`${ctx}: condição de estado "${k}" reservada — ${def.pendente}`); continue; }
    const val = e[k];
    if (def.sub) { if (!def.sub.includes(val)) errs.push(`${ctx}: valor "${val}" fora do sub-vocabulário de "${k}" (válidos: ${def.sub.join(', ')})`); }
    else if (def.bool) { if (val !== true) errs.push(`${ctx}: condição "${k}" espera true`); }
    else if (def.count) {
      if (!val || typeof val !== 'object' || !['min', 'max', 'exato'].includes(val.op) || typeof val.n !== 'number' || !Number.isInteger(val.n)) errs.push(`${ctx}: ${k} espera {op:min|max|exato, n:inteiro} (recebeu ${JSON.stringify(val)})`);
    }
    else if (def.contadorCmp) {
      if (!val || typeof val !== 'object' || typeof val.nome !== 'string' || !V.contadores.includes(val.nome) || !['min', 'max', 'exato'].includes(val.op) || typeof val.n !== 'number') errs.push(`${ctx}: contador espera {nome∈(${V.contadores.join('|')}), op:min|max|exato, n:inteiro} (recebeu ${JSON.stringify(val)})`);
    }
    else if (def.hp) {
      if (!val || typeof val !== 'object' || !['cheio', 'abaixo', 'acima'].includes(val.op)) errs.push(`${ctx}: hpProprio.op inválido (cheio|abaixo|acima)`);
      else if ((val.op === 'abaixo' || val.op === 'acima') && typeof val.v !== 'number') errs.push(`${ctx}: hpProprio.v ausente para op "${val.op}"`);
    }
    else if (def.godkey) { if (typeof val !== 'string' || !val) errs.push(`${ctx}: aliadoPresente espera a KEY de um deus (string)`); }
  }
}

// Valida a PASSIVA declarativa (F1.2). Prosa (nome/desc) é livre; se houver fx, ele tem forma fechada.
function validarPassiva(p, ctx, errs) {
  if (!p || typeof p !== 'object') { errs.push(`${ctx}: passiva não é objeto`); return; }
  for (const k of Object.keys(p)) if (!CHAVES_PASSIVA.has(k)) errs.push(`${ctx}: campo desconhecido na passiva: "${k}"`);
  if (!('fx' in p)) return;   // passiva ainda em prosa pura (hardcoded no motor) — permitido
  if (!Array.isArray(p.fx)) { errs.push(`${ctx}: passiva.fx não é array`); return; }
  p.fx.forEach((f, i) => {
    const c = `${ctx}.fx[${i}]`;
    if (!f || typeof f !== 'object') { errs.push(`${c}: fx de passiva não é objeto`); return; }
    const def = V.gatilhosPassivaDef[f.gatilho];
    if (!def) { errs.push(`${c}: gatilho inválido "${f.gatilho}" (válidos: ${V.gatilhosPassiva.join(', ')})`); return; }
    // campos permitidos/obrigatórios são POR GATILHO — um campo de outro gatilho é recusado
    const permitidos = new Set(['gatilho', 'estado', ...def.campos]);   // `estado` é CAMPO universal (F1.2.5 s3): qualquer gatilho o aceita
    for (const k of Object.keys(f)) if (!permitidos.has(k)) errs.push(`${c}: campo "${k}" não pertence ao gatilho "${f.gatilho}"`);
    for (const req of def.obrig) if (!(req in f)) errs.push(`${c}: gatilho "${f.gatilho}" exige o campo "${req}"`);
    // validações de valor (só se o campo pertence ao gatilho)
    // v:0 é permitido QUANDO o bônus é puramente escalado (Oni: "+1 por 4 Combo", sem parte fixa) — §73
    const temEscala = ['porContador', 'porContadorCampo', 'porContadorLado', 'porAliadoCaido', 'porInimigoCaido', 'porHpFaltante'].some(k => k in f);
    if ('v' in f && (typeof f.v !== 'number' || !Number.isInteger(f.v) || f.v < (temEscala ? 0 : 1))) errs.push(`${c}: v mal formado (${JSON.stringify(f.v)}; inteiro ${temEscala ? '>= 0' : '> 0'})`);
    if ('escopo' in f && !V.escoposPassiva.includes(f.escopo)) errs.push(`${c}: escopo inválido "${f.escopo}" (válidos: ${V.escoposPassiva.join(', ')})`);
    if ('quando' in f) validarQuando(f.quando, `${c}.quando`, errs);
    if ('estado' in f) validarEstado(f.estado, `${c}.estado`, errs);
    if ('quandoCura' in f) validarQuandoCura(f.quandoCura, `${c}.quandoCura`, errs);
    if ('contra' in f) validarContra(f.contra, `${c}.contra`, errs);
    if ('faz' in f) validarFaz(f.faz, `${c}.faz`, errs);
    if ('noAtacante' in f) validarNoAtacante(f.noAtacante, `${c}.noAtacante`, errs);
    if ('noAtor' in f) validarNoAtor(f.noAtor, `${c}.noAtor`, errs);
    if (f.gatilho === 'aoAgirSobEfeito') {
      if (typeof f.efeito !== 'string' || !f.efeito) errs.push(`${c}: aoAgirSobEfeito.efeito deve ser o nome (string) do efeito-marcador`);
      if (!('faz' in f) && !('noAtor' in f)) errs.push(`${c}: aoAgirSobEfeito exige um payload (faz no dono OU noAtor no ator)`);
    }
    if ('quem' in f) {   // `quem` é POR gatilho: aoCair (sujeito da morte) ≠ aoSerAtingido (sujeito do golpe)
      const vocab = f.gatilho === 'aoSerAtingido' ? V.aoSerAtingidoQuem : V.aoCairQuem;
      if (!vocab.includes(f.quem)) errs.push(`${c}: ${f.gatilho}.quem inválido "${f.quem}" (válidos: ${vocab.join(', ')})`);
    }
    if (f.gatilho === 'aoSerAtingido' && !('faz' in f) && !('noAtacante' in f)) errs.push(`${c}: aoSerAtingido exige um payload (faz no reator OU noAtacante no atacante)`);
    if (f.gatilho === 'aoUsarHabilidade' && !V.slotsAtaque.includes(f.slot)) errs.push(`${c}: aoUsarHabilidade.slot inválido "${f.slot}" (válidos: ${V.slotsAtaque.join(', ')})`);
    if (f.gatilho === 'aCadaN') {   // cadência ABSOLUTA n + EXATAMENTE um payload (faz OU custoGratis — nunca os dois, nunca nenhum)
      if (typeof f.n !== 'number' || !Number.isInteger(f.n) || f.n < 2) errs.push(`${c}: aCadaN.n inválido (${JSON.stringify(f.n)}; inteiro >= 2 — n=1 é porTurno)`);
      const payloads = ['faz', 'custoGratis'].filter(k => k in f);
      if (payloads.length !== 1) errs.push(`${c}: aCadaN exige EXATAMENTE um payload (faz OU custoGratis; tem ${payloads.length ? payloads.join('+') : 'nenhum'})`);
    }
    if ('custoGratis' in f) {   // payload de aCadaN: zera o custo de um slot de ataque
      const cg = f.custoGratis;
      if (!cg || typeof cg !== 'object' || Array.isArray(cg)) errs.push(`${c}: custoGratis não é objeto`);
      else if (!V.slotsAtaque.includes(cg.slot)) errs.push(`${c}: custoGratis.slot inválido "${cg.slot}" (válidos: ${V.slotsAtaque.join(', ')})`);
      else if (Object.keys(cg).length !== 1) errs.push(`${c}: custoGratis só aceita "slot" (tem: ${Object.keys(cg).join(', ')})`);
    }
    if ('a' in f) {   // imunidade: array não-vazio de tags do sub-vocabulário (controle/DoT/'controle')
      if (!Array.isArray(f.a) || f.a.length === 0) errs.push(`${c}: a deve ser array não-vazio (${V.imunizaveis.join('|')})`);
      else for (const tag of f.a) if (!V.imunizaveis.includes(tag)) errs.push(`${c}: imunidade a "${tag}" fora do sub-vocabulário (válidos: ${V.imunizaveis.join(', ')})`);
    }
    if ('ignora' in f) {
      if (!Array.isArray(f.ignora) || f.ignora.length === 0) errs.push(`${c}: ignora deve ser array não-vazio (${V.ignoraveis.join('|')})`);
      else for (const x of f.ignora) if (!V.ignoraveis.includes(x)) errs.push(`${c}: ignora com valor inválido "${x}" (válidos: ${V.ignoraveis.join(', ')})`);
    }
  });
}

// Valida uma habilidade OU a Defesa (mesmo formato).
function validarHabilidade(ab, ctx, errs) {
  if (!ab || typeof ab !== 'object') { errs.push(`${ctx}: habilidade não é objeto`); return; }
  for (const k of Object.keys(ab)) if (!CHAVES_AB.has(k)) errs.push(`${ctx}: campo desconhecido na habilidade: "${k}"`);
  if (typeof ab.slot !== 'string') errs.push(`${ctx}: slot ausente ou não-string`);
  if (typeof ab.nome !== 'string') errs.push(`${ctx}: nome ausente ou não-string`);
  if ('classe' in ab && !V.classes.includes(ab.classe)) errs.push(`${ctx}: classe inválida "${ab.classe}" (válidas: ${V.classes.join(', ')})`);
  if ('classePorModo' in ab) for (const m of Object.values(ab.classePorModo))
    if (!V.classes.includes(m)) errs.push(`${ctx}: classePorModo com classe inválida "${m}"`);
  if ('cd' in ab && (typeof ab.cd !== 'number' || ab.cd < 0)) errs.push(`${ctx}: cd inválido (${JSON.stringify(ab.cd)})`);
  if ('alvo' in ab && !V.alvos.includes(ab.alvo)) errs.push(`${ctx}: alvo inexistente "${ab.alvo}" (válidos: ${V.alvos.join(', ')})`);
  if ('cost' in ab) validarCusto(ab.cost, ctx, errs);
  if ('fx' in ab) {
    if (!Array.isArray(ab.fx)) errs.push(`${ctx}: fx não é array`);
    else ab.fx.forEach((f, i) => validarFx(f, `${ctx} fx[${i}]`, errs));
  }
  if ('opcoes' in ab) {
    if (!Array.isArray(ab.opcoes)) errs.push(`${ctx}: opcoes não é array`);
    else ab.opcoes.forEach((o, i) => {
      if (!o || !Array.isArray(o.fx)) errs.push(`${ctx} opcoes[${i}]: sem fx[]`);
      else o.fx.forEach((f, j) => validarFx(f, `${ctx} opcoes[${i}].fx[${j}]`, errs));
    });
  }
  // toda habilidade precisa de UMA forma de efeito: fx, alterna (Nezha) ou opcoes (escolha múltipla)
  if (!('fx' in ab) && !ab.alterna && !('opcoes' in ab)) errs.push(`${ctx}: sem efeito (nem fx, nem alterna, nem opcoes)`);
}

// Valida um deus inteiro. Devolve lista de problemas (vazia = ok).
function validarDeus(g) {
  const errs = [];
  const ctx = (g && g.key) ? g.key : '(sem key)';
  if (!g || typeof g !== 'object' || Array.isArray(g)) return [`${ctx}: deus não é objeto`];
  for (const k of Object.keys(g)) if (!CHAVES_DEUS.has(k)) errs.push(`${ctx}: campo desconhecido no deus: "${k}"`);
  if (typeof g.key !== 'string') errs.push(`${ctx}: key ausente ou não-string`);
  if (typeof g.nome !== 'string') errs.push(`${ctx}: nome ausente ou não-string`);
  if ('classe' in g && !CLASSES_DEUS.has(g.classe)) errs.push(`${ctx}: classe de deus inválida "${g.classe}"`);
  if ('passiva' in g) validarPassiva(g.passiva, `${ctx}.passiva`, errs);
  if (!Array.isArray(g.ab)) errs.push(`${ctx}: ab não é array`);
  else g.ab.forEach((ab, i) => validarHabilidade(ab, `${ctx}.ab[${i}](${(ab && ab.nome) || '?'})`, errs));
  return errs;
}

module.exports = { validarDeus, validarHabilidade, validarFx, validarCusto, validarPassiva };
