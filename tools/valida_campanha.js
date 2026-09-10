// §268 — validação do ato de ESCOLHA, extraída da build para poder ser TESTADA diretamente (a build
// e o teste chamam a MESMA função). O ato de escolha é leitura fora do combate: não abre luta, não paga,
// aponta um `alvo` (a batalha onde a consequência cai) e usa um vocabulário de consequência FECHADO.
// Fora dele — em especial acrescentar/remover inimigo — a build RECUSA, porque isso mudaria o balanço
// medido do ato-alvo sem remedição.
const VERBOS_ESCOLHA = new Set(['emprestado', 'orbes', 'kitRevelado']);

// Devolve a lista de erros (vazia = ok). ctx: { catalogoKeys:Set, atosPorId:{id->ato} }.
function errosEscolha(pre, a, ctx){
  const erros = [];
  const catalogoKeys = ctx.catalogoKeys, atosPorId = ctx.atosPorId || {};
  if (a.recompensa) erros.push(`${pre}: ato "escolha" NÃO pode ter recompensa`);
  if (!a.pergunta) erros.push(`${pre}: escolha precisa de "pergunta"`);
  const ops = Array.isArray(a.opcoes) ? a.opcoes : [];
  if (ops.length < 2) erros.push(`${pre}: escolha precisa de ao menos 2 opções`);
  const ids = new Set();
  for (const o of ops) {
    if (!o || !o.id || !o.rotulo) { erros.push(`${pre}: opção sem id/rotulo`); continue; }
    if (ids.has(o.id)) erros.push(`${pre}: opção "${o.id}" duplicada`);
    ids.add(o.id);
    if (o.deus && !catalogoKeys.has(o.deus)) erros.push(`${pre}: opção "${o.id}" tem deus "${o.deus}" fora do catálogo`);
  }
  const temCerta = a.certa != null;
  if (temCerta && !ids.has(a.certa)) erros.push(`${pre}: "certa" ("${a.certa}") não é uma das opções`);
  // alvo: existe e é batalha (a consequência cai numa luta).
  const alvo = a.alvo != null ? atosPorId[a.alvo] : null;
  if (a.alvo == null) erros.push(`${pre}: escolha precisa de "alvo"`);
  else if (!alvo) erros.push(`${pre}: alvo "${a.alvo}" não é um ato existente`);
  else if (alvo.tipo !== 'batalha') erros.push(`${pre}: alvo "${a.alvo}" não é uma batalha (é "${alvo.tipo}")`);
  // efeito: as CHAVES de resultado dependem de haver `certa`. Com certa → {certa,errada}; sem certa
  // (identidade) → uma entrada por opção, e NUNCA "errada" (não há leitura errada quando nada se lê).
  const ef = a.efeito || {};
  const chavesEf = Object.keys(ef);
  if (temCerta) {
    for (const k of chavesEf) if (k !== 'certa' && k !== 'errada') erros.push(`${pre}: efeito tem resultado "${k}" inesperado (com certa: só certa|errada)`);
  } else {
    if ('errada' in ef) erros.push(`${pre}: escolha sem "certa" NÃO pode ter efeito.errada (não há leitura errada)`);
    for (const k of chavesEf) if (!ids.has(k)) erros.push(`${pre}: efeito tem resultado "${k}" que não é uma opção`);
  }
  // vocabulário FECHADO: cada consequência só usa emprestado|orbes|kitRevelado. Errar não pode BLOQUEAR
  // (§268/FASE 1): a consequência `errada` não altera o balanço medido — mantê-la em {} ou fora de `orbes`.
  for (const k of chavesEf) {
    const cons = ef[k] || {};
    for (const verbo of Object.keys(cons)) {
      if (!VERBOS_ESCOLHA.has(verbo)) { erros.push(`${pre}: consequência "${verbo}" fora do vocabulário fechado (emprestado|orbes|kitRevelado)`); continue; }
      const val = cons[verbo];
      if (verbo === 'emprestado' && !catalogoKeys.has(val)) erros.push(`${pre}: emprestado "${val}" fora do catálogo`);
      if (verbo === 'orbes' && typeof val !== 'number') erros.push(`${pre}: orbes precisa ser número (é ${typeof val})`);
      if (verbo === 'kitRevelado') {
        if (!catalogoKeys.has(val)) erros.push(`${pre}: kitRevelado "${val}" fora do catálogo`);
        else if (alvo && !(alvo.inimigos || []).includes(val)) erros.push(`${pre}: kitRevelado "${val}" não é inimigo do alvo "${a.alvo}"`);
      }
    }
  }
  // revelacao: as chaves devem existir no efeito (texto mostrado só onde há resultado).
  const rev = a.revelacao || {};
  for (const k of Object.keys(rev)) if (!(k in ef)) erros.push(`${pre}: revelacao "${k}" sem efeito correspondente`);
  return erros;
}

module.exports = { VERBOS_ESCOLHA, errosEscolha };
