// ===================================================================
// INCURSION x3 Battle — GUARDA da ponte de segurança (§322 Parte 3)
// Valida data/ia_por_modo.json contra a prova data/ia_winnability_v2.json:
// um modo só pode estar em v2 se TODO o conteúdo verificável dele for VENCÍVEL sob a v2.
// Isto MORDE: pôr o 'rito' em v2 falha (hanuman é INVENCÍVEL). Usado pelo build (quebra) e pelo teste.
// Domínios e sandbox são ISENTOS (sem solução fixa — corrida/livre).
// ===================================================================
'use strict';
const EXENTOS_PADRAO = ['dominio', 'sandbox'];

// devolve [] se OK, ou uma lista de mensagens de erro.
function validar(tabela, manifesto, exentos) {
  const EX = new Set(exentos || EXENTOS_PADRAO);
  const erros = [];
  const modos = (tabela && tabela.modos) || {};
  for (const m of Object.keys(modos)) {
    if (modos[m] !== 2 || EX.has(m)) continue;
    const prova = manifesto && manifesto.modos && manifesto.modos[m];
    if (!manifesto) { erros.push(`modo "${m}" está em v2 mas não há prova de winnability (data/ia_winnability_v2.json) — rode tools/verificar_pve_v2.js`); continue; }
    if (!prova) { erros.push(`modo "${m}" está em v2 mas o manifesto não traz prova dele`); continue; }
    if (prova.naoVerificavel) { erros.push(`modo "${m}" está em v2 mas é NÃO VERIFICÁVEL por solução única (time livre) — mantenha na v1`); continue; }
    if (!prova.ok || (prova.naoVencivel && prova.naoVencivel.length)) {
      const quem = (prova.naoVencivel || []).map(n => n.id + ':' + n.veredito).slice(0, 8).join(', ');
      erros.push(`modo "${m}" está em v2 mas tem conteúdo NÃO-VENCÍVEL sob a v2: ${quem}${(prova.naoVencivel || []).length > 8 ? '…' : ''}`);
    }
  }
  return erros;
}

module.exports = { validar, EXENTOS_PADRAO };
