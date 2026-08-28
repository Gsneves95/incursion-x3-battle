// ===================================================================
// INCURSION x3 Battle — o FORMATO da Provação (F2.0)
// Uma Provação = estado montado à mão + time inimigo fixo + CONDIÇÃO DE
// VITÓRIA que vai além de "derrube os três". Depende do motor puro
// (novoEstado + st.log estruturado, §F1.0b); não altera o motor.
//
// FECHA POR MODO, não por forma (§144): as ~17 formas da varredura caem
// em 3 MODOS de avaliação, e forma nova cai num modo existente sem tocar
// o avaliador. O `quando` (cedo|fim) é DERIVADO do modo — campo derivado
// não pode divergir do modo (campo declarado poderia).
//   final    — predicado sobre o ESTADO no fim (só julgável no fim)
//   log      — predicado sobre o STREAM de eventos (falha CEDO, quando impossível)
//   continuo — invariante checado a cada turno (falha CEDO, no turno em que quebra)
//
// Predicado desconhecido é recusado na BUILD (validarProvacao → build.js),
// nunca ignorado em runtime (§71: condição que não faz nada é o pior caso).
// ===================================================================

const MODOS = { final: 'fim', log: 'cedo', continuo: 'cedo' };   // modo → `quando` (DERIVADO, nunca declarado)

const ladoDoQuem = quem => (quem === 'aliado' || quem === 'aliados') ? 0 : 1;
const cmp = (a, op, b) => op === '>=' ? a >= b : op === '<=' ? a <= b : op === '==' ? a === b : op === '>' ? a > b : op === '<' ? a < b : false;
// §192: espelha DEBUFFS do motor (CONTROLES + extras, engine l.62/75) — p/ semDebuffEmAliado default "qualquer debuff". Duplicado por robustez (sem require de engine).
const DEBUFFS_TODOS = ['atordoado', 'adormecido', 'submerso', 'taunt', 'silenceClass', 'lockSkill', 'dominado', 'selado', 'agarrar', 'pacificado', 'medo', 'dmgDown', 'vulneravel', 'encharcado', 'noHeal', 'livro', 'antiRevive', 'olho', 'pressagio', 'marcado', 'torpor', 'retaliacao'];

// Registro FECHADO. Cada predicado declara { modo, obrig, aval }. aval(st, cfg, ctx) devolve:
//   'ok'       — satisfeito; pode vencer
//   'pendente' — não violado, mas o requisito ainda não foi cumprido (só barra a vitória, não falha cedo)
//   'falha'    — violado / impossível (derrota imediata nos modos log/continuo)
// ctx = { ladoDe(chave)->0|1 }. A completude ("todos os inimigos") cai no gate de base-vitória.
const PREDICADOS = {
  // ---- CONTÍNUO (invariante por turno) ----
  deadline: {
    modo: 'continuo', obrig: ['turnos'],
    aval: (st, c) => st.turno <= c.turnos ? 'ok' : 'falha',   // "vença em N turnos": passou de N sem vencer → falha
  },

  // ---- LOG (predicado sobre o stream de eventos) ----
  morteEmEstado: {   // "cada `quem` tem de cair carregando `estado`" (poseidon: inimigo/encharcado). §161: `quantos` opcional → "≥quantos caem carregando".
    modo: 'log', obrig: ['quem', 'estado'],
    aval: (st, c, ctx) => {
      const lado = ladoDoQuem(c.quem);
      const qNaQueda = e => e.tipo === 'queda' && ctx.ladoDe(e.alvo) === lado && e.estados && e.estados.includes(c.estado);
      if (c.quantos != null) {   // §161: forma-CONTAGEM — "≥quantos caem carregando". Morte SEM o estado não falha (só não conta); pendente até atingir.
        return st.log.filter(qNaQueda).length >= c.quantos ? 'ok' : 'pendente';
      }
      for (const e of st.log) if (e.tipo === 'queda' && ctx.ladoDe(e.alvo) === lado) {   // forma canônica "TODOS": qualquer queda sem o estado → impossível
        if (!(e.estados && e.estados.includes(c.estado))) return 'falha';
      }
      return 'ok';
    },
    // §161: gradiente SÓ na forma-contagem (com ganho: sem ele o predicado-contagem contribui 0 e nunca acha). Forma "todos" fica sem gradiente (revertido, §161).
    chave: (st, c, ctx) => { if (c.quantos == null) return ''; const lado = ladoDoQuem(c.quem); return String(st.log.filter(e => e.tipo === 'queda' && ctx.ladoDe(e.alvo) === lado && e.estados && e.estados.includes(c.estado)).length); },
    distancia: (st, c, ctx) => {
      if (c.quantos == null) return 0;
      const lado = ladoDoQuem(c.quem);
      const n = st.log.filter(e => e.tipo === 'queda' && ctx.ladoDe(e.alvo) === lado && e.estados && e.estados.includes(c.estado)).length;
      const falta = Math.max(0, c.quantos - n); if (!falta) return 0;
      // custo de COBRIR os `falta` vivos mais baratos: 1000 se ainda sem o estado (>> maxHp, então cobrir vence baixar-HP e
      // não trava num inimigo a 1 de HP), 0 se já carrega. NÃO cancela o HP-base: manter o incentivo de matar (progresso da
      // luta / farm de recurso — ahpuch só tem Umbra confiável na passiva de abate; cancelar tirava esse incentivo e travava).
      const vivos = st.lados[lado].units.filter(u => u.vivo);
      const custos = vivos.map(u => (u.efeitos.some(e => e.type === c.estado) || u.dots.some(d => d.nome === c.estado)) ? 0 : 1000).sort((a, b) => a - b);
      let s = 0; for (let i = 0; i < falta; i++) s += (i < custos.length ? custos[i] : 100000);   // vivos < falta = beco sem saída
      return s;
    },
  },
  morteComContador: {   // §160 (ahpuch): "cada `quem` cai carregando ≥`limiar` de `contador`" (podridão). §161: `quantos` opcional → "≥quantos caem carregando".
    modo: 'log', obrig: ['quem', 'contador', 'limiar'],
    aval: (st, c, ctx) => {
      const lado = ladoDoQuem(c.quem);
      const qNaQueda = e => e.tipo === 'queda' && ctx.ladoDe(e.alvo) === lado && e.contadores && (e.contadores[c.contador] || 0) >= c.limiar;
      if (c.quantos != null) return st.log.filter(qNaQueda).length >= c.quantos ? 'ok' : 'pendente';   // §161 forma-contagem
      for (const e of st.log) if (e.tipo === 'queda' && ctx.ladoDe(e.alvo) === lado) {
        if (!(e.contadores && (e.contadores[c.contador] || 0) >= c.limiar)) return 'falha';   // caiu com < limiar → impossível
      }
      return 'ok';
    },
    chave: (st, c, ctx) => { if (c.quantos == null) return ''; const lado = ladoDoQuem(c.quem); return String(st.log.filter(e => e.tipo === 'queda' && ctx.ladoDe(e.alvo) === lado && e.contadores && (e.contadores[c.contador] || 0) >= c.limiar).length); },
    distancia: (st, c, ctx) => {
      if (c.quantos == null) return 0;
      const lado = ladoDoQuem(c.quem);
      const n = st.log.filter(e => e.tipo === 'queda' && ctx.ladoDe(e.alvo) === lado && e.contadores && (e.contadores[c.contador] || 0) >= c.limiar).length;
      const falta = Math.max(0, c.quantos - n); if (!falta) return 0;
      // igual ao morteEmEstado: custo-de-empilhar (fração do déficit × 1000), SEM cancelar o HP-base (mantém o incentivo de matar/farmar).
      const vivos = st.lados[lado].units.filter(u => u.vivo);
      const custos = vivos.map(u => Math.max(0, c.limiar - (u.contadores[c.contador] || 0)) / c.limiar * 1000).sort((a, b) => a - b);
      let s = 0; for (let i = 0; i < falta; i++) s += (i < custos.length ? custos[i] : 100000);
      return s;
    },
  },
  abatePorExecucao: {   // §160 (iara): ≥`quantos` `quem` caíram por EXECUÇÃO (queda.execucao). Conta ao vivo; ok quando atinge.
    modo: 'log', obrig: ['quem', 'quantos'],
    aval: (st, c, ctx) => {
      const lado = ladoDoQuem(c.quem);
      const n = st.log.filter(e => e.tipo === 'queda' && e.execucao && ctx.ladoDe(e.alvo) === lado).length;
      return n >= c.quantos ? 'ok' : 'pendente';
    },
    chave: (st, c, ctx) => { const lado = ladoDoQuem(c.quem); return String(st.log.filter(e => e.tipo === 'queda' && e.execucao && ctx.ladoDe(e.alvo) === lado).length); },
    distancia: (st, c, ctx) => { const lado = ladoDoQuem(c.quem); return Math.max(0, c.quantos - st.log.filter(e => e.tipo === 'queda' && e.execucao && ctx.ladoDe(e.alvo) === lado).length); },
  },
  reviveAliado: {   // §179 (núcleo REVIVE): ≥`quantos` aliados REVIVIDOS (evento tipo:'revive' no lado 0, motor l.993). O caído VOLTA — inverso do abate. Conta ao vivo.
    modo: 'log', obrig: ['quantos'],
    aval: (st, c, ctx) => st.log.filter(e => e.tipo === 'revive' && ctx.ladoDe(e.alvo) === 0).length >= c.quantos ? 'ok' : 'pendente',
    chave: (st, c, ctx) => String(st.log.filter(e => e.tipo === 'revive' && ctx.ladoDe(e.alvo) === 0).length),
    // ×1000: reviver é ANTI-GREEDY (exige DEIXAR um aliado cair p/ trazer de volta — o guloso evita cair). Domina o HP-base, como o abatePeloProprioLado.
    distancia: (st, c, ctx) => Math.max(0, c.quantos - st.log.filter(e => e.tipo === 'revive' && ctx.ladoDe(e.alvo) === 0).length) * 1000,
  },
  naoReviveInimigo: {   // §167 (parado, hel) → §179 (consumidor real): NENHUM inimigo revivido ("ninguém volta"). falha-DURANTE. Enforcement (naoRevive/marcaMorte da Hel) já existe no motor.
    modo: 'log', obrig: [],
    aval: (st, c, ctx) => st.log.some(e => e.tipo === 'revive' && ctx.ladoDe(e.alvo) === 1) ? 'falha' : 'ok',
  },
  abatePorSlot: {   // §162 (cernunnos): ≥`quantos` `quem` caíram por um SLOT nomeado (queda.slot). Parametrizado (§46) — cernunnos: slot 'reflexo' (o reflexo é a ARMA, não a coleta). Mesmo padrão do abatePorExecucao.
    modo: 'log', obrig: ['quem', 'slot', 'quantos'],
    aval: (st, c, ctx) => {
      const lado = ladoDoQuem(c.quem);
      return st.log.filter(e => e.tipo === 'queda' && e.slot === c.slot && ctx.ladoDe(e.alvo) === lado).length >= c.quantos ? 'ok' : 'pendente';
    },
    chave: (st, c, ctx) => { const lado = ladoDoQuem(c.quem); return String(st.log.filter(e => e.tipo === 'queda' && e.slot === c.slot && ctx.ladoDe(e.alvo) === lado).length); },
    // gradiente de MANEIRA-DO-ABATE (§161): sem peso, o guloso abate direto (n fica 0, platô). Recompensa deixar inimigos VIVOS a
    // baixo HP (candidatos a cair pelo slot) e pune abatê-los pelo slot ERRADO: um vivo custa min(hp, 1000); um morto-pelo-slot-certo, 0.
    distancia: (st, c, ctx) => {
      const lado = ladoDoQuem(c.quem);
      const n = st.log.filter(e => e.tipo === 'queda' && e.slot === c.slot && ctx.ladoDe(e.alvo) === lado).length;
      const falta = Math.max(0, c.quantos - n); if (!falta) return 0;
      const vivos = st.lados[lado].units.filter(u => u.vivo).map(u => Math.min(u.hp || 0, 1000)).sort((a, b) => a - b);
      let s = 0; for (let i = 0; i < falta; i++) s += (i < vivos.length ? vivos[i] : 100000);   // precisa de `falta` candidatos vivos a abater pelo slot; se faltam, beco sem saída
      return s;
    },
  },
  semPerderAliado: {   // nenhum aliado cai (estrito: uma `queda` de aliado já falha; variante tolerante-a-revive fica p/ depois)
    // §172: ESCOPO opcional (espelha protegeDe) — {quem:X} só X não cai (mnevis→Rá); {exceto:X} nenhum aliado MENOS X cai (cerberus/bastet).
    // Bare (sem escopo) = TODOS os aliados, comportamento inalterado (thor/change/guanyu/oxalá). É o "0 MORTE do protegido": o que o
    // kit de cobertura-parcial/ampla de fato entrega em 3v3, onde "0 DANO" é impossível fora da interceptação total (§172).
    modo: 'log', obrig: [],
    aval: (st, c, ctx) => {
      const protegido = alvo => c.quem ? alvo === c.quem : (ctx.ladoDe(alvo) === 0 && alvo !== c.exceto);
      return st.log.some(e => e.tipo === 'queda' && protegido(e.alvo)) ? 'falha' : 'ok';
    },
  },
  protegeDe: {   // §172 (PROTEGER_UNIDADE, 5 consumidores): nenhum dano QUALIFICADO atinge o(s) protegido(s). Falha-DURANTE (o dano recebido
    // não se desfaz — poda ao vivo, sem gradiente, como o semPerderAliado). ESCOPO: `quem` = unidade nomeada (mnevis→Rá, hanuman→Senhor);
    // OU `exceto` = TODOS os aliados menos essa unidade (cerberus/bastet/boitatá — o protetor tanca por eles). FILTRO opcional:
    // `tipoDano:'unico'` (bastet: só golpe de ALVO ÚNICO conta) · `dot:'<nome>'` (boitatá: só o DoT nomeado conta, ex. 'queimadura').
    // Interceptação (mnevis/hanuman/bastet) REDIRECIONA o golpe: o evento de dano fica no PROTETOR, não no protegido → o protegido não gera evento → ok.
    modo: 'log', obrig: [],
    aval: (st, c, ctx) => {
      const protegido = (alvo) => c.quem ? alvo === c.quem : (ctx.ladoDe(alvo) === 0 && alvo !== c.exceto);
      const f = c.filtro || {};
      const bateu = st.log.some(e => {
        if (!(e.valor > 0)) return false;
        const ehDano = e.tipo === 'dano', ehDot = e.tipo === 'dot';
        if (!ehDano && !ehDot) return false;
        if (!protegido(e.alvo)) return false;
        if (f.tipoDano === 'unico') return ehDano && !!e.unico;   // só golpe de alvo único
        if (f.dot) return ehDot && e.efeito === f.dot;            // só o DoT nomeado
        return true;                                              // sem filtro: qualquer dano/DoT no protegido
      });
      return bateu ? 'falha' : 'ok';
    },
  },
  // §172 buff-timing — DUAS sub-formas, porque o `modo` é ESTÁTICO e timing-PONTUAL ≠ timing-CONTÍNUO (previsto pelo dono):
  buffNoAbate: {   // hera: o buff `buff` (Juramento Nupcial = 'vinculo') está ativo em ALGUM aliado NO GOLPE FINAL. modo:'final' (só o estado terminal importa).
    // §187: `v` opcional (VALOR MÍNIMO do buff — hercules: dmgUp v≥20 = ≥5 usos de Os Doze Trabalhos, pois dmgUp FUNDE no motor l.502, +4/uso);
    // `quem` opcional (aliado NOMEADO — hercules, p/ ser protagonista). Sem v/quem = comportamento hera (presença em qualquer aliado).
    modo: 'final', obrig: ['buff'],
    aval: (st, c) => st.lados[0].units.some(u => u.vivo && (c.quem ? u.key === c.quem : true) && (u.efeitos || []).some(e => e.type === c.buff && (c.v == null || (e.v || 0) >= c.v))) ? 'ok' : 'falha',
    // §176: GRADIENTE (testado ≠ navegável). §187: com `v`, gradua pelo DÉFICIT de valor (nudge p/ CRESCER o buff, não só ativá-lo); sem `v`, o flat 30 do hera.
    distancia: (st, c) => {
      const best = Math.max(0, ...st.lados[0].units.filter(u => u.vivo && (c.quem ? u.key === c.quem : true)).flatMap(u => (u.efeitos || []).filter(e => e.type === c.buff).map(e => e.v || 1)));
      if (c.v == null) return best > 0 ? 0 : 30;
      return best >= c.v ? 0 : (c.v - best) * 3;
    },
  },
  buffContinuo: {   // dagda: o buff `buff` (Caldeirão = 'caldeirao') está ativo em ALGUM aliado TODO turno a partir de `desde`. modo:'continuo' (falha-DURANTE: um turno sem já perde).
    modo: 'continuo', obrig: ['buff', 'desde'],
    aval: (st, c) => st.turno < c.desde ? 'ok' : (st.lados[0].units.some(u => u.vivo && (u.efeitos || []).some(e => e.type === c.buff)) ? 'ok' : 'falha'),
    distancia: (st, c) => (st.turno < c.desde || st.lados[0].units.some(u => u.vivo && (u.efeitos || []).some(e => e.type === c.buff))) ? 0 : 30,   // §176: nudge p/ manter o buff a partir de `desde`
  },
  estadoContinuo: {   // §176 (uptime de CAMPO/STATUS — 3 consumidores): um estado GLOBAL vale TODO turno a partir de `desde`. NÃO é buffContinuo (esse lê buff em UNIDADE).
    // `campo` = st.fase (amaterasu:'Dia', tsukuyomi:'Noite'); OU `statusInimigo` = ≥1 inimigo VIVO carrega o status (orfeu:'adormecido'). modo:'continuo' (falha-DURANTE).
    modo: 'continuo', obrig: ['desde'],
    aval: (st, c) => {
      if (st.turno < c.desde) return 'ok';
      const ativo = c.campo ? (st.fase === c.campo)
        : c.statusInimigo ? st.lados[1].units.some(u => u.vivo && ((u.efeitos || []).some(e => e.type === c.statusInimigo) || (u.dots || []).some(d => d.nome === c.statusInimigo)))
          : false;
      return ativo ? 'ok' : 'falha';
    },
    distancia: (st, c) => {
      if (st.turno < c.desde) return 0;
      const ativo = c.campo ? (st.fase === c.campo)
        : c.statusInimigo ? st.lados[1].units.some(u => u.vivo && ((u.efeitos || []).some(e => e.type === c.statusInimigo) || (u.dots || []).some(d => d.nome === c.statusInimigo)))
          : false;
      return ativo ? 0 : 30;
    },
  },
  estadoTurnos: {   // §178: ≥`limiar` TURNOS com o campo `campo` ativo (amaterasu:'Dia', tsukuyomi:'Noite'). Conta os turno-events carimbados (engine §178).
    // RELAXA o uptime ESTRITO (estadoContinuo) — irrealizável neste motor (§174/§177/§178: economia+recargas não dão cobertura contínua). Mede ESFORÇO, não perfeição.
    modo: 'log', obrig: ['campo', 'limiar'],
    aval: (st, c) => new Set(st.log.filter(e => e.tipo === 'turno' && e.campo === c.campo).map(e => e.turno)).size >= c.limiar ? 'ok' : 'pendente',
    chave: (st, c) => String(new Set(st.log.filter(e => e.tipo === 'turno' && e.campo === c.campo).map(e => e.turno)).size),
    distancia: (st, c) => Math.max(0, c.limiar - new Set(st.log.filter(e => e.tipo === 'turno' && e.campo === c.campo).map(e => e.turno)).size) * 30,   // nudge p/ ATIVAR e MANTER o campo
  },
  statusTurnos: {   // §186 (orfeu): ≥`limiar` TURNOS com ≥1 inimigo carregando o status `status` (adormecido). Espelha estadoTurnos, lendo `statusInimigo` (engine §186).
    // RELAXA o uptime-de-status ESTRITO (irrealizável, §178: economia+recargas não dão cobertura contínua). Mede ESFORÇO (≥N turnos com alguém dormindo), não perfeição.
    modo: 'log', obrig: ['status', 'limiar'],
    aval: (st, c) => new Set(st.log.filter(e => e.tipo === 'turno' && e.statusInimigo && e.statusInimigo.includes(c.status)).map(e => e.turno)).size >= c.limiar ? 'ok' : 'pendente',
    chave: (st, c) => String(new Set(st.log.filter(e => e.tipo === 'turno' && e.statusInimigo && e.statusInimigo.includes(c.status)).map(e => e.turno)).size),
    distancia: (st, c) => Math.max(0, c.limiar - new Set(st.log.filter(e => e.tipo === 'turno' && e.statusInimigo && e.statusInimigo.includes(c.status)).map(e => e.turno)).size) * 30,   // nudge p/ APLICAR e MANTER o status
  },
  estadoSimultaneo: {   // §192 (aokuang/chaac/medusa/kukulkan): num MESMO turno, ≥`n` inimigos carregam CADA estado de `req`. Snapshot momentâneo (≠ estadoTurnos/estadoContinuo, que são duração).
    // Lê `statusInimigo` do turno-event (§186), que JÁ duplica por-inimigo (flatMap) → contar ocorrências de um status = nº de inimigos com ele. SEM motor novo.
    // req = [{status, n}] — todos no MESMO evento (medusa: [{atordoado,3}]; aokuang/chaac: [{encharcado,3},{atordoado,3}]; kukulkan: [{encharcado,3}]).
    modo: 'log', obrig: ['req'],
    aval: (st, c) => st.log.some(e => e.tipo === 'turno' && e.statusInimigo && c.req.every(r => e.statusInimigo.filter(s => s === r.status).length >= r.n)) ? 'ok' : 'pendente',
    chave: (st, c) => {
      let best = -1; for (const e of st.log) if (e.tipo === 'turno' && e.statusInimigo) { const d = c.req.reduce((s, r) => s + Math.min(e.statusInimigo.filter(x => x === r.status).length, r.n), 0); if (d > best) best = d; }
      return String(best);
    },
    // §176 gradiente: menor déficit-de-cobertura sobre os turno-events (nudge p/ aplicar os estados nos inimigos ao mesmo tempo). ×30.
    distancia: (st, c) => {
      const total = c.req.reduce((s, r) => s + r.n, 0);
      let best = 0; for (const e of st.log) if (e.tipo === 'turno' && e.statusInimigo) { const cob = c.req.reduce((s, r) => s + Math.min(e.statusInimigo.filter(x => x === r.status).length, r.n), 0); if (cob > best) best = cob; }
      return Math.max(0, total - best) * 30;
    },
  },
  semDebuffEmAliado: {   // §192 (nefertem/perseu): NENHUM aliado carrega debuff. continuo (falha-DURANTE, como semPerderAliado/protegeDe — sem gradiente, poda ao vivo).
    // `filtro` opcional (lista de tipos): nefertem = bare (qualquer debuff = DEBUFFS_TODOS); perseu = {filtro:['atordoado','selado']} (controle; petrificação = atordoado).
    modo: 'continuo', obrig: [],
    aval: (st, c) => {
      const proibidos = c.filtro || DEBUFFS_TODOS;
      return st.lados[0].units.some(u => u.vivo && (u.efeitos || []).some(e => proibidos.includes(e.type))) ? 'falha' : 'ok';
    },
  },
  proibirSlotProprio: {   // você NUNCA usa o slot X (≠ negarAcaoInimigo: este é sobre o SEU lado, §144 instr. 4)
    modo: 'log', obrig: ['slot'],
    aval: (st, c, ctx) => st.log.some(e => e.tipo === 'acao' && ctx.ladoDe(e.origem) === 0 && e.slot === c.slot) ? 'falha' : 'ok',
  },
  negarAcaoInimigo: {   // NENHUM inimigo usa o slot X (depende do que o OPONENTE faz — predicado distinto, não escopo).
    // `max` opcional (§156, shutendoji "se usar DOIS milagres, falha" = max 1): tolera até `max` usos, falha no (max+1)-ésimo.
    // Default max 0 = comportamento original (qualquer uso falha) — dionisio/boto/khonshu seguem valendo sem tocar.
    modo: 'log', obrig: ['slot'],
    aval: (st, c, ctx) => st.log.filter(e => e.tipo === 'acao' && ctx.ladoDe(e.origem) === 1 && e.slot === c.slot).length > (c.max || 0) ? 'falha' : 'ok',
  },
  efeitoEmNInimigos: {   // §158 (shutendoji, rewrite): o efeito nomeado foi APLICADO a ≥`limiar` inimigos (latch `jaRecebeu`, sobrevive à morte).
    // `limiar` opcional (default = TODOS os inimigos). CAVALGA o abate (aplicar não exige preservar) — o oposto do rider extrativo.
    // `distancia` puxa o solver a aplicar nos que faltam. Número DERIVÁVEL (dono: "se o Saké não alcançar os 3, é o que alcançar").
    modo: 'log', obrig: ['efeito'],
    aval: (st, c) => { const alvo = c.limiar != null ? c.limiar : st.lados[1].units.length; return st.lados[1].units.filter(u => u.jaRecebeu && u.jaRecebeu[c.efeito] != null).length >= alvo ? 'ok' : 'pendente'; },
    chave: (st, c) => String(st.lados[1].units.filter(u => u.jaRecebeu && u.jaRecebeu[c.efeito] != null).length),
    distancia: (st, c) => { const alvo = c.limiar != null ? c.limiar : st.lados[1].units.length; return Math.max(0, alvo - st.lados[1].units.filter(u => u.jaRecebeu && u.jaRecebeu[c.efeito] != null).length); },
  },
  tetoDeGasto: {   // §158 (hermes rewrite): vença gastando no máximo `limiar` orbes de fonte PRÓPRIA. Roubado NÃO conta (estica o orçamento).
    // FINAL: só julgado na vitória (o teto pode subir depois, quando se rouba — não falha cedo). gastoProprio = gasto − roubado.
    modo: 'final', obrig: ['limiar'],
    aval: (st, c) => {
      const roubado = st.log.reduce((s, e) => s + (e.tipo === 'orbe' && e.ganhouLado === 0 && e.valor > 0 ? e.valor : 0), 0);
      const gastoProprio = Math.max(0, (st.orbeGasto ? st.orbeGasto[0] : 0) - roubado);
      return gastoProprio <= c.limiar ? 'ok' : 'falha';
    },
  },
  semPerderOrbe: {   // §156 (heimdall): nenhum orbe do jogador perdido PARA o inimigo (roubo). Distingue roubo (ganhouLado===1) de
    // remoção pura (ganhouLado===null) e de GASTO (paga custo — evento sem o tag perdeuLado/ganhouLado, §153). "para o inimigo" = roubo.
    modo: 'log', obrig: [],
    aval: (st, c, ctx) => st.log.some(e => e.tipo === 'orbe' && e.perdeuLado === 0 && e.ganhouLado === 1) ? 'falha' : 'ok',
  },
  stripBuffsInimigo: {   // §187 (yamato): um GOLPE removeu ≥`quantos` buffs de um inimigo DE UMA VEZ (Corte Ceifa-Ervas: stripBuffs). GOLPE-FINAL (timing),
    // não acumulação (volume) — o erro do §185. Lê o evento de remoção que o motor já loga (engine l.1823: tipo:'efeito', efeito:'buff',
    // ganhouLado:null, qtd). Só mass-strip (yamato, iansã) produz qtd≥3 num evento → protagonista se o time não tiver o outro. Exige set que se auto-buffa.
    modo: 'log', obrig: ['quantos'],
    aval: (st, c, ctx) => st.log.some(e => e.tipo === 'efeito' && e.efeito === 'buff' && e.ganhouLado == null && ctx.ladoDe(e.alvo) === 1 && (e.qtd || 0) >= c.quantos) ? 'ok' : 'pendente',
    chave: (st, c, ctx) => String(Math.max(0, ...st.log.filter(e => e.tipo === 'efeito' && e.efeito === 'buff' && e.ganhouLado == null && ctx.ladoDe(e.alvo) === 1).map(e => e.qtd || 0))),
    distancia: (st, c, ctx) => { const best = Math.max(0, ...st.log.filter(e => e.tipo === 'efeito' && e.efeito === 'buff' && e.ganhouLado == null && ctx.ladoDe(e.alvo) === 1).map(e => e.qtd || 0)); return Math.max(0, c.quantos - best) * 30; },   // nudge p/ um strip MAIOR (não cancela o HP-base: manter o incentivo de vencer)
  },
  limparBuffsAntesDeAbate: {   // §156 (iansã): TODO buff dos 3 inimigos removido ANTES da 1ª queda inimiga. O marco (motor) grava o
    // turno em que o lado inimigo ficou TODO sem buff; a 1ª queda vem do log (carrega `turno`). Falha cedo se cair um inimigo antes.
    modo: 'log', obrig: [],
    aval: (st, c, ctx) => {
      const limpou = (st.marcos && st.marcos.semBuffLado) ? st.marcos.semBuffLado[1] : null;   // turno em que os inimigos ficaram TODOS sem buff
      let caiu = null;
      for (const e of st.log) if (e.tipo === 'queda' && ctx.ladoDe(e.alvo) === 1) { caiu = e.turno; break; }   // 1ª queda inimiga
      if (limpou != null && (caiu == null || limpou <= caiu)) return 'ok';   // limpou antes (ou sem) qualquer queda
      if (caiu != null) return 'falha';   // caiu um inimigo antes de limpar todos → impossível
      return 'pendente';
    },
  },
  abatePeloProprioLado: {   // fogo amigo: `quantos` inimigos caem pela mão de um aliado deles (matador e alvo no mesmo lado)
    modo: 'log', obrig: ['quantos'],
    aval: (st, c, ctx) => {
      const n = st.log.filter(e => e.tipo === 'queda' && e.matador && ctx.ladoDe(e.alvo) === 1 && ctx.ladoDe(e.matador) === 1).length;
      return n >= c.quantos ? 'ok' : 'pendente';   // nunca 'falha': até o fim pode acontecer; o gate de base-vitória barra o 'pendente'
    },
    // §175: GRADIENTE (era filtro sem distancia — construído no §106 como predicado de TESTE, nunca alvo do solver; afrodite/curupira travavam em H=0).
    chave: (st, c, ctx) => String(st.log.filter(e => e.tipo === 'queda' && e.matador && ctx.ladoDe(e.alvo) === 1 && ctx.ladoDe(e.matador) === 1).length),
    distancia: (st, c, ctx) => Math.max(0, c.quantos - st.log.filter(e => e.tipo === 'queda' && e.matador && ctx.ladoDe(e.alvo) === 1 && ctx.ladoDe(e.matador) === 1).length) * 1000,   // fração do déficit ×1000: recompensa DEIXAR inimigos vivos p/ o fogo-amigo (≠ abatê-los você)
  },
  acumulo: {   // §146/§147: uma QUANTIDADE (fonte) tem de atingir um limiar. Nasce com as 9 fontes da varredura
    // dos 91 (§87). Modo log: nunca falha cedo (sempre pode acumular); o gate de base-vitória barra o 'pendente'.
    // "Modo saindo de onde se lê" — a quantidade vem da fonte certa. golpe-final-com-limiar (susanoo/yamato) é
    // OUTRO predicado, não acumulo (§46: mesma palavra, leituras diferentes).
    modo: 'log', obrig: ['fonte', 'limiar'],
    aval: (st, c, ctx) => acumuladoDe(st, c, ctx) >= c.limiar ? 'ok' : 'pendente',
    chave: (st, c, ctx) => { try { return String(acumuladoDe(st, c, ctx)); } catch { return ''; } },   // progresso p/ o dedup do solucionador
    distancia: (st, c, ctx) => { try { return Math.max(0, c.limiar - acumuladoDe(st, c, ctx)); } catch { return 0; } },   // quanto falta p/ o limiar (heurística do best-first)
  },

  maximoNumEvento: {   // §153/§156 (loki): PICO de roubo num ÚNICO evento (≠ acumulo, que soma tudo). "roubar ≥6 buffs de uma só vez."
    // A Trama do Caos (realoca) loga um evento por FONTE; loki casta 1× por turno e é o único ladrão-de-buff da sua Provação,
    // então o pico-por-ativação = pico-por-TURNO da soma das qtd de roubo-p/-si (ganhouLado 0). (Se um dia 2 ladrões agirem no
    // mesmo turno, trocar o agrupamento por-turno por um marcador de ativação.)
    modo: 'log', obrig: ['fonte', 'limiar'],
    aval: (st, c, ctx) => maxNumEvento(st, c, ctx) >= c.limiar ? 'ok' : 'pendente',
    chave: (st, c, ctx) => { try { return String(maxNumEvento(st, c, ctx)); } catch { return ''; } },
    distancia: (st, c, ctx) => { try { return Math.max(0, c.limiar - maxNumEvento(st, c, ctx)); } catch { return 0; } },
  },

  // ---- FINAL (só julgável no fim) ----
  hpNoFim: {   // no golpe final, o HP de `quem` (chave de unidade) satisfaz op v — só faz sentido no estado final
    modo: 'final', obrig: ['quem', 'op', 'v'],
    aval: (st, c, ctx) => {
      const u = st.lados.flatMap(l => l.units).find(x => x.key === c.quem);
      if (!u) return 'falha';
      return cmp(u.hp, c.op, c.v) ? 'ok' : 'falha';
    },
    // §172 (vishnu): GRADIENTE (déficit de HP até o limiar). Sem ele, o filtro-final não dava sinal ao solver — o guloso vencia a
    // luta e chegava ao terminal com aliados danificados, travando em H=0 (relaxar o VALOR não resolve; faltava o gradiente).
    // NÃO muda o aval → nenhum veredito carimbado se move; só torna o alvo NAVEGÁVEL. `heuristica` soma distancia de TODO predicado (solucionador l.104).
    distancia: (st, c, ctx) => {
      const u = st.lados.flatMap(l => l.units).find(x => x.key === c.quem);
      if (!u) return 100000;                       // morto/ausente = longe (recompensa mantê-lo VIVO e são)
      if (cmp(u.hp, c.op, c.v)) return 0;
      if (c.op === '>=' || c.op === '>') return c.v - u.hp;   // precisa GANHAR HP (cura)
      if (c.op === '<=' || c.op === '<') return u.hp - c.v;   // precisa PERDER HP
      return Math.abs(u.hp - c.v);                            // '=='
    },
  },
  hpTetoSelf: {   // §177 (ares/mula/odin): "CURAR `quem` acima de `teto` anula". É sobre a CURA, não o HP natural — o deus nasce com HP cheio (não é cura) e isso não viola;
    // só um TIQUE DE CURA que deixe `quem` acima do teto falha. Força o deus a FICAR baixo ("precisa apanhar") sem punir o HP inicial. falha-DURANTE (lê u.curadoAgora, §97).
    modo: 'continuo', obrig: ['quem', 'teto'],
    aval: (st, c) => {
      const u = st.lados.flatMap(l => l.units).find(x => x.key === c.quem);
      if (!u || !u.vivo) return 'ok';
      return (u.curadoAgora && u.hp > c.teto) ? 'falha' : 'ok';   // foi CURADO neste turno E ficou acima do teto → anula
    },
  },
  protegeHpMax: {   // §165 (itzamna): nenhum aliado termina com HP MÁXIMO permanentemente perdido (Podridão inimiga RESTAURADA). modo final.
    // `limiar` opcional (perda total tolerada, default 0). O 2º rider que ENDURECE o danoBonus automático: exige a Aurora da Criação (restauraMax) na hora certa.
    modo: 'final', obrig: [],
    aval: (st, c, ctx) => st.lados[0].units.reduce((s, u) => s + (u.maxHpPerdido || 0), 0) > (c.limiar || 0) ? 'falha' : 'ok',
    chave: (st, c, ctx) => String(st.lados[0].units.reduce((s, u) => s + (u.maxHpPerdido || 0), 0)),
    distancia: (st, c, ctx) => Math.max(0, st.lados[0].units.reduce((s, u) => s + (u.maxHpPerdido || 0), 0) - (c.limiar || 0)),   // guia p/ restaurar (Σ maxHpPerdido acima do teto)
  },
  soloSobrevivente: {   // §184 (erinias): VENCER com só o TÍTULO vivo — todos os OUTROS aliados caídos. INVERSO do semPerderAliado.
    // O passivo dela (Fúria Vingativa: +8 por aliado morto, p/ sempre) faz a morte-de-aliado um POWER-UP → solver-ALINHADO (§182):
    // o gradiente e o kit puxam no MESMO sentido (≠ mimir/ymir, onde o gradiente luta contra a auto-preservação sozinho).
    modo: 'final', obrig: ['quem'],
    aval: (st, c) => {
      const titulo = st.lados[0].units.find(u => u.key === c.quem);
      if (!titulo || !titulo.vivo) return 'falha';                                    // o título TEM de sobreviver
      return st.lados[0].units.some(u => u.key !== c.quem && u.vivo) ? 'falha' : 'ok'; // qualquer outro aliado vivo no fim → falha
    },
    chave: (st, c) => String(st.lados[0].units.filter(u => u.key !== c.quem && u.vivo).length),
    // §176 GRADIENTE: cada OUTRO aliado ainda vivo = ×1000 (anti-greedy — o solver PRESERVA aliados por padrão; aqui precisa deixá-los cair).
    distancia: (st, c) => {
      const titulo = st.lados[0].units.find(u => u.key === c.quem);
      if (!titulo || !titulo.vivo) return 100000;                                     // título morto = beco (recompensa mantê-LO vivo)
      return st.lados[0].units.filter(u => u.key !== c.quem && u.vivo).length * 1000;
    },
  },
  tituloCaido: {   // §184 (mimir, ymir): o TÍTULO tem de estar MORTO no golpe final (AUTO-MORTE real). Espelho NEGATIVO do reviveAliado:
    // sem gradiente que premie a morte, o solver protege o título e o rider é insatisfazível (a tensão do dono, §179). O ×1000 RECOMPENSA
    // deixá-lo cair. "Não revivido" cai no naoRevivivel do próprio kit (mimir) — o aval só exige !vivo no estado final. Combina com hpNoFim
    // (ymir: título caído + 2 aliados <30) e com o dead-passive do motor (mesmoMorto §123, aoCair self).
    modo: 'final', obrig: ['quem'],
    aval: (st, c) => {
      const u = st.lados[0].units.find(x => x.key === c.quem);
      return (u && !u.vivo) ? 'ok' : 'falha';   // vivo (ou ausente) no fim = rider não satisfeito
    },
    chave: (st, c) => { const u = st.lados[0].units.find(x => x.key === c.quem); return (u && u.vivo) ? '1' : '0'; },
    distancia: (st, c) => {
      const u = st.lados[0].units.find(x => x.key === c.quem);
      if (!u) return 0;
      return u.vivo ? 1000 : 0;   // vivo = longe (recompensa deixá-lo MORRER e ficar morto)
    },
  },
};

// as 9 FONTES de acúmulo, da varredura dos 91 (§146/§147): nasce com todas registradas (§87). A implementação
// de `acumuladoDe` cobre as de-log baratas hoje; as demais lançam ao serem USADAS (ao construir a Provação),
// nunca silenciam. golpe-final-com-limiar (susanoo/yamato) NÃO está aqui — é outro predicado (§46).
const FONTES_ACUMULO = ['danoAbsorvido', 'danoRefletido', 'danoArmazenado', 'danoDevolvido', 'danoBonus', 'contador', 'contadorLado', 'buffsRoubados', 'orbesRoubados', 'orbesGuardados', 'curaAcumulada'];
function _somaLog(st, f) { let s = 0; for (const e of st.log) s += (f(e) || 0); return s; }

// §156 (loki): PICO por evento. Agrupa por TURNO os eventos de roubo-p/-si da fonte e devolve o MAIOR total num turno.
function maxNumEvento(st, c, ctx) {
  if (c.fonte === 'alvosAtingidos') {   // §165 (raijin): PICO de inimigos DISTINTOS atingidos por UMA unidade num turno (a largura da cadeia). Acoplado — bater 3 é melhor que bater 1.
    const porUnTurno = {};   // turno|origem → Set de alvos inimigos distintos
    for (const e of st.log) if (e.tipo === 'dano' && e.valor > 0 && ctx.ladoDe(e.origem) === 0 && ctx.ladoDe(e.alvo) === 1) {
      const k = e.turno + '|' + e.origem; (porUnTurno[k] = porUnTurno[k] || new Set()).add(e.alvo);
    }
    let mx = 0; for (const k in porUnTurno) mx = Math.max(mx, porUnTurno[k].size); return mx;
  }
  const porTurno = {};
  for (const e of st.log) {
    let q = 0;
    if (c.fonte === 'buffsRoubados') q = (e.tipo === 'efeito' && e.ganhouLado === 0) ? (e.qtd || 1) : 0;   // roubo-p/-si de buff (realoca/stripOne rouba)
    else if (c.fonte === 'orbesRoubados') q = (e.tipo === 'orbe' && e.ganhouLado === 0 && e.valor > 0) ? e.valor : 0;
    else throw new Error(`maximoNumEvento: fonte não suportada "${c.fonte}"`);
    if (q) porTurno[e.turno] = (porTurno[e.turno] || 0) + q;
  }
  let mx = 0; for (const t in porTurno) if (porTurno[t] > mx) mx = porTurno[t];
  return mx;
}
function acumuladoDe(st, c, ctx) {
  switch (c.fonte) {
    case 'danoRefletido': return _somaLog(st, e => e.tipo === 'dano' && e.reflexo && ctx.ladoDe(e.origem) === 0 ? e.valor : 0);   // §162: o golpe de reflexo é marcado `reflexo` (kind fica 'afetado'); origem = o aliado que revida
    case 'danoAbsorvido': return _somaLog(st, e => e.tipo === 'dano' && ctx.ladoDe(e.alvo) === 0 ? ((e.absorvido || 0) + (e.soak || 0)) : 0);   // §162: escudo absorvido (Def Destrutível) + dano engolido por interceptação (Khnum)
    case 'danoArmazenado': return _somaLog(st, e => e.tipo === 'armazenado' && ctx.ladoDe(e.alvo) === 0 ? e.valor : 0);   // §162: dano guardado na vault (Xangô/armazenaDano), emitido no ato de guardar
    case 'danoDevolvido': return _somaLog(st, e => e.tipo === 'dano' && e.devolvido && ctx.ladoDe(e.origem) === 0 ? e.devolvido : 0);   // §162: dano DEVOLVIDO pela Balança (o que se ENTREGA — cavalga o abate, ≠ o armazenado que se coleta)
    case 'curaAcumulada': return _somaLog(st, e => e.tipo === 'cura' && ctx.ladoDe(e.alvo) === 0 ? e.valor : 0);
    case 'orbesGuardados': return Object.values(st.lados[0].orbs).reduce((a, b) => a + b, 0);
    case 'contador': { const u = st.lados[0].units.find(x => x.key === c.quem) || st.lados[0].units[0]; return (u && u.contadores[c.contador]) || 0; }
    case 'contadorLado': return (st.lados[0].contadores || {})[c.contador] || 0;   // §163: POOL do lado (combo — susanoo/raijin/yamato geram atacando; ≠ contador por-unidade)
    case 'danoBonus': return st.lados[0].units.reduce((s, u) => { const e = (u.efeitos || []).find(x => x.type === 'dmgUp'); return s + (e ? e.v : 0); }, 0);   // §163: soma do dmgUp (merge → um por unidade, .v acumula) do time — o +dano PERMANENTE (hercules/brahma) ou temporário-empilhável (itzamna dur2, peak)
    // §153 (tag de roubo): ganhouLado===0 = o JOGADOR levou p/ si (≠ remoção pura, ganhouLado null; ≠ roubo inimigo, 1).
    // ROUBO-p/-si, cumulativo. buffsRoubados por-EVENTO (loki) é OUTRO predicado (maximoNumEvento), não esta soma.
    case 'orbesRoubados': return _somaLog(st, e => e.tipo === 'orbe' && e.ganhouLado === 0 && e.valor > 0 ? e.valor : 0);
    case 'buffsRoubados': return _somaLog(st, e => e.tipo === 'efeito' && e.ganhouLado === 0 ? (e.qtd || 1) : 0);
    default: throw new Error(`acumulo: fonte "${c.fonte}" registrada mas acumuladoDe() ainda não implementado — implementar ao construir a Provação que a usa`);
  }
}

// -------- carimbo de versão (pendente desde a F1.0a): hash do catálogo com que a Provação foi verificada --------
// CATÁLOGO da Provação = os 100 deuses ∪ o bestiário PvE (as criaturas são inimigos das Ordálias; os aliados
// são deuses). Dual, como o catalogoAtivo() do motor: no bundle (futuro da UI de Ordália) GODS/BESTIARIO são
// globais; em Node lê os módulos. É o catálogo que o jogo REALMENTE roda — o hash e o montar têm de vê-lo (§150:
// o carimbo garante contra o oponente que o jogo roda; um bestiário fora do hash deixaria criatura rebalanceada
// passar em silêncio).
function catalogoProvacao() {
  const gods = (typeof GODS !== 'undefined') ? GODS : require('./catalogo.js').GODS;
  const best = (typeof BESTIARIO !== 'undefined') ? BESTIARIO : require('./bestiario.js').BESTIARIO;
  return { ...gods, ...best };
}

function _djb2(s) { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0; return h.toString(16); }
function catalogoHash(prov, gods = catalogoProvacao()) {
  const keys = [...new Set([...(prov.aliados || []), ...(prov.inimigos || [])])].sort();
  return _djb2(keys.map(k => k + ':' + JSON.stringify(gods[k] || null)).join('|'));
}

// -------- validação de FORMA (chamada na BUILD; falha alto, não em runtime) --------
function validarProvacao(prov) {
  const erros = [];
  const nome = (prov && prov.key) || '(sem key)';
  if (!prov || typeof prov !== 'object') return [`${nome}: não é objeto`];
  if (!Array.isArray(prov.condicoes) || prov.condicoes.length === 0) erros.push(`${nome}: sem condicoes`);
  if (!Array.isArray(prov.aliados) || !Array.isArray(prov.inimigos)) erros.push(`${nome}: aliados/inimigos ausentes`);
  for (const c of (prov.condicoes || [])) {
    const def = PREDICADOS[c.predicado];
    if (!def) { erros.push(`${nome}: predicado DESCONHECIDO "${c.predicado}" (conjunto fechado: ${Object.keys(PREDICADOS).join(', ')})`); continue; }
    for (const campo of def.obrig) if (c[campo] === undefined) erros.push(`${nome}.${c.predicado}: falta o campo obrigatório "${campo}"`);
    if (c.predicado === 'acumulo' && c.fonte !== undefined && !FONTES_ACUMULO.includes(c.fonte)) erros.push(`${nome}.acumulo: fonte DESCONHECIDA "${c.fonte}" (fechado: ${FONTES_ACUMULO.join(', ')})`);
    if ('quando' in c) erros.push(`${nome}.${c.predicado}: "quando" é DERIVADO do modo (${MODOS[def.modo]}), não pode ser declarado`);
    if ('modo' in c) erros.push(`${nome}.${c.predicado}: "modo" é do predicado, não do kit — não declare`);
  }
  return erros;
}

// -------- montar o estado inicial (o "estado montado à mão") --------
function montarProvacao(prov) {
  const m = prov.montar || {};
  // catálogo MERGED (deuses ∪ bestiário): os inimigos de uma Ordália podem ser criaturas. novoEstado recebe o
  // catálogo (o motor não possui dados); passo energia=null p/ manter o default de geração.
  const st = novoEstado(prov.aliados, prov.inimigos, m.seed || 1, m.comeca || 0, null, catalogoProvacao());
  if (m.orbs) for (const l of [0, 1]) if (m.orbs[l]) for (const el in m.orbs[l]) st.lados[l].orbs[el] = m.orbs[l][el];
  if (m.semRenda) st.semRenda = m.semRenda;   // §158 (hermes): [lado0, lado1] booleanos — lado sem renda de orbe (orçamento fixo)
  if (m.rendaFracao) st.rendaFracao = m.rendaFracao;   // §158 (hermes rewrite): [lado0, lado1] frações — renda pela metade (0.5) etc.
  for (const u of (m.unidades || [])) {
    const un = st.lados[u.lado] && st.lados[u.lado].units[u.idx];
    if (!un) continue;
    // CHEFE = deus do roster + HP inflado: maxHp ANTES do hp (o hp não pode nascer acima do teto). "deus + 200-300"
    // é o mecanismo de chefe — não há kit de chefe separado; a Provação sobe o maxHp da unidade aqui (§ owner F2.3).
    if (u.maxHp != null) un.maxHp = u.maxHp;
    if (u.hp != null) un.hp = u.hp;
    if (u.caido) { un.vivo = false; un.hp = 0; }   // §179 (núcleo REVIVE): aliado começa CAÍDO (demeter "começa com dois aliados já caídos") — o revive traz de volta, sem depender da IA inimiga matar
    if (u.shield != null) un.shield = u.shield;
    if (u.efeitos) un.efeitos.push(...u.efeitos);
    if (u.contadores) Object.assign(un.contadores, u.contadores);
    if (u.cd) Object.assign(un.cd, u.cd);
  }
  return st;
}

// -------- avaliar: {resultado:'andamento'|'vitoria'|'derrota', motivo?} --------
// Chamar a cada turno (falha cedo dos modos log/continuo) e no fim. `quando` é derivado: log/continuo falham
// cedo; final só é lido na base-vitória.
function avaliarProvacao(st, prov) {
  const lados = { 0: new Set(prov.aliados), 1: new Set(prov.inimigos) };
  const ctx = { ladoDe: chave => lados[0].has(chave) ? 0 : lados[1].has(chave) ? 1 : undefined };

  const baseVitoria = st.fim && st.fim.resultado === 'vitoria' && st.fim.lado === 0;
  const baseDerrota = st.fim && (st.fim.resultado === 'empate' || (st.fim.resultado === 'vitoria' && st.fim.lado === 1));
  if (baseDerrota) return { resultado: 'derrota', motivo: 'partida perdida (base)' };

  // falha CEDO: qualquer predicado de modo log/continuo em 'falha', a qualquer momento
  for (const c of prov.condicoes) {
    const def = PREDICADOS[c.predicado];
    if (def.modo !== 'final' && def.aval(st, c, ctx) === 'falha') return { resultado: 'derrota', motivo: c.predicado };
  }

  if (baseVitoria) {
    for (const c of prov.condicoes) {
      const def = PREDICADOS[c.predicado];
      const r = def.aval(st, c, ctx);
      if (r !== 'ok') return { resultado: 'derrota', motivo: `${c.predicado}:${r}` };   // 'pendente' ou 'falha' final
    }
    return { resultado: 'vitoria' };
  }
  return { resultado: 'andamento' };
}

if (typeof module !== 'undefined') {
  module.exports = { PREDICADOS, MODOS, FONTES_ACUMULO, validarProvacao, montarProvacao, avaliarProvacao, catalogoHash, catalogoProvacao };
}
