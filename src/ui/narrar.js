// ui/narrar.js — o ÚNICO tradutor de EVENTOS do motor para pt-BR (docs/eventos.md).
// O motor não escreve texto de interface; ele empilha eventos estruturados em st.log e
// grava st.fim estruturado. Aqui, no momento de exibir, cada evento vira frase. Assim o
// mesmo motor roda no servidor (Fase 4/5) sem uma única string de português.
//
// FUNDAÇÃO como base.js: depende SÓ de base.js (rotuloLado, rotuloEfeito, NOMES_DOT) e dos
// globais do motor (st, CATALOGOS, GODS, DEFESA). Nenhum outro ui/ é chamado — e outros ui/
// podem chamar `narrar` (a checagem de direção da build isenta narrar.js, igual a base.js).
//
// TOTAL (regra 5): evento de `tipo` desconhecido NÃO some — cai em `_despejo`, que imprime
// os campos crus. Log que engole evento é onde bug de motor se esconde; nos 73 kits vai
// acontecer, e o registro tem de mostrar, não silenciar.

// catálogo DA PARTIDA (decisão B): resolve chave->nome de deus, de habilidade e de passiva
// pelo snapshot congelado em st.catId; fora de uma partida, cai no GODS global (tem os 100).
function _catPartida() {
  return (typeof CATALOGOS !== 'undefined' && typeof st !== 'undefined' && st && CATALOGOS[st.catId])
    || (typeof GODS !== 'undefined' ? GODS : {});
}
function nomeDeus(k) { const g = _catPartida()[k]; return (g && g.nome) || k; }
function nomePassiva(k) { const g = _catPartida()[k]; return (g && g.passiva && g.passiva.nome) || k; }
function _habDe(origem, slot) { const g = _catPartida()[origem]; return g && g.ab && g.ab.find(x => x.slot === slot); }
function nomeHab(origem, slot) {
  if (slot === 'defesa') return (typeof DEFESA !== 'undefined' && DEFESA.nome) || 'Defesa';
  const a = _habDe(origem, slot);
  return (a && a.nome) || slot;
}
function _sinal(v) { return v > 0 ? '+' : ''; }   // negativo já traz o '-'

// evento de `tipo` desconhecido: despejo cru dos campos (nunca some do registro).
function _despejo(ev) {
  const campos = Object.keys(ev).filter(k => k !== 'tipo' && k !== 'turno' && k !== 'msg')
    .map(k => `${k}=${ev[k]}`).join(' ');
  return `[${ev.tipo}]${campos ? ' ' + campos : ''}`;
}

// os eventos `efeito` são muitos; sub-despacho pela CHAVE do efeito, usando os campos
// presentes (alvo/origem/duracao) para escolher a frase quando eles distinguem o caso.
function _narraEfeito(e) {
  const alvo = e.alvo != null ? nomeDeus(e.alvo) : '';
  const origem = e.origem != null ? nomeDeus(e.origem) : '';
  switch (e.efeito) {
    case 'intercepta':
      return alvo ? `${origem} intercepta o golpe dirigido a ${alvo}.`
                  : `${origem} passa a interceptar golpes do time.`;
    // C-aparado (docs/eventos.md): o par carrega o ícone de Vínculo no retrato — o estado já
    // mostra quem está ligado; a narração descreve o sujeito e para, sem nomear o parceiro nem
    // prometer a divisão (os dois eventos `dano` seguintes a mostram).
    case 'vinculo': return `Vínculo em ${alvo}.`;
    case 'contraAtaca': return `${origem} contra-ataca ${alvo}.`;
    case 'armazenaDano':
      return e.duracao === 0 ? `${origem} devolve o dano armazenado.`
                             : `${origem} começa a armazenar o dano do time.`;
    case 'invocacao':
      return e.duracao === 0 ? 'Uma invocação se desfez.'
           : origem ? `${origem} invoca uma unidade.` : 'A invocação ataca.';
    case 'livro': return `Livro da Vida e Morte: ${alvo} é executado.`;
    case 'vidaExtra': return `${alvo} recebeu Vida Extra.`;
    case 'copiar': return `${origem} não encontrou uma Habilidade para copiar.`;
    // stripOne e afins: `efeito` é o tipo do buff removido -> rótulo humano
    default:
      return alvo ? `${alvo} perdeu ${rotuloEfeito(e.efeito)}.`
                  : `Efeito: ${rotuloEfeito(e.efeito)}.`;
  }
}

// UMA função por `tipo`. `tipo` é a única coisa que decide o formato (regra 1).
const NARRA = {
  turno: e => (e.turno === 1 && typeof st !== 'undefined' && st && e.lado === st.starter)
    ? `Turno 1 · ${rotuloLado(e.lado)} abre a partida`
    : `Turno ${e.turno} · ${rotuloLado(e.lado)} joga`,
  abertura: e => `Abertura: ${rotuloLado(e.lado)} recebe ${e.valor} de energia.`,
  acao: e => {
    const quem = nomeDeus(e.origem), hab = nomeHab(e.origem, e.slot);
    if ('modo' in e) {
      const a = _habDe(e.origem, e.slot), lbl = a && a.modos && a.modos[e.modo];
      return `${quem} usa ${hab}${lbl ? ` — ${lbl}` : ` (modo ${e.modo + 1})`}.`;
    }
    if ('opcoes' in e) {
      const a = _habDe(e.origem, e.slot);
      const nomes = (e.opcoes || []).map(i => a && a.opcoes && a.opcoes[i] && a.opcoes[i].nome).filter(Boolean).join(' + ');
      return `${quem} usa ${hab}${nomes ? ` (${nomes})` : ''}.`;
    }
    return `${quem} usa ${hab}.`;
  },
  dano: e => {
    if (e.alvo === e.origem) return `${nomeDeus(e.alvo)} perdeu ${Math.abs(e.valor)} de HP.`;
    let t = `${nomeDeus(e.origem)} → ${nomeDeus(e.alvo)}: ${e.valor} de dano`;
    if (e.absorvido) t += ` (${e.absorvido} no escudo)`;
    if (e.kind && e.kind !== 'afetado') t += ` [${e.kind}]`;
    return t + '.';
  },
  cura: e => `${nomeDeus(e.alvo)} curou ${e.valor}.`,
  dot: e => `${rotuloEfeito(e.efeito)} em ${nomeDeus(e.alvo)}: ${e.valor} de dano puro.`,
  orbe: e => {
    if (e.valor < 0) return `${rotuloLado(e.lado)}: −${Math.abs(e.valor)}${e.para ? ` de ${e.para}` : ''} (energia livre).`;
    const suj = e.passiva ? nomeDeus(e.passiva) : rotuloLado(e.lado);
    const pre = e.passiva ? `${nomePassiva(e.passiva)}: ` : '';
    const elem = e.para ? ` de ${e.para}` : '';
    return `${pre}${suj} recebe ${e.valor} orbe${e.valor !== 1 ? 's' : ''}${elem}.`;
  },
  conversao: e => `Conversão: ${e.valor} orbes → 1 de ${e.para}.`,
  cd: e => `Recargas de ${rotuloLado(e.lado)}: ${_sinal(e.valor)}${e.valor}.`,
  bloqueio: e => {
    const alvo = nomeDeus(e.alvo);
    switch (e.motivo) {
      case 'invulneravel': return `${alvo} está Invulnerável — bloqueado.`;
      case 'submerso': return `${alvo} está Submerso — não pode ser alvo.`;
      case 'controle_imune': return `${alvo} é imune a controle${e.efeito ? ` — ${rotuloEfeito(e.efeito)} falhou` : ''}.`;
      case 'sem_cura': return `${alvo} não pode ser curado.`;
      case 'nao_revive': return `${alvo} não pode ser revivido.`;
      default: return `${alvo}: bloqueado (${e.motivo}).`;
    }
  },
  imune: e => `${nomeDeus(e.alvo)} é imune a ${rotuloEfeito(e.efeito)}.`,
  queda: e => `${nomeDeus(e.alvo)} caiu.`,
  revive: e => e.passiva
    ? `${nomePassiva(e.passiva)}: ${nomeDeus(e.alvo)} renasceu com ${e.valor} de HP.`
    : `${nomeDeus(e.alvo)} revive com ${e.valor} de HP.`,
  passiva: e => `${nomePassiva(e.origem)}: ${nomeDeus(e.origem)} renasce no próximo turno${e.valor != null ? ` com ${e.valor} de HP` : ''}.`,
  escudo: e => {
    if (e.valor < 0) return `Escudo de ${nomeDeus(e.alvo)} destruído (${Math.abs(e.valor)}).`;
    if (e.passiva) return `${nomePassiva(e.passiva)}: ${nomeDeus(e.alvo)} ganhou ${e.valor} de escudo.`;
    return `${nomeDeus(e.alvo)} ganhou ${e.valor} de Defesa Destrutível.`;
  },
  contador: e => `${nomeDeus(e.origem)}: ${nomeContador(e.efeito)} ${_sinal(e.valor)}${e.valor}.`,
  acordar: e => `${nomeDeus(e.alvo)} acordou.`,
  controle: e => `${e.valor} unidade(s) de ${rotuloLado(e.lado)} sob controle não geraram orbe.`,
  fase: e => e.duracao > 0 ? `${e.efeito} ativado por ${e.duracao} turno(s).` : `${e.efeito} terminou.`,
  // st.fim vira BANNER (maiúsculo): "X VENCE" / "EMPATE". Não vai ao st.log.
  fim: e => e.resultado === 'empate' ? 'EMPATE' : `${rotuloLado(e.lado).toUpperCase()} VENCE`,
  efeito: _narraEfeito,
};

// traduz UMA linha do registro. Linha autorada pela VIEW (erro/aviso) traz `msg` já em
// pt-BR — passa direto. Evento do motor vai pela tabela; tipo desconhecido, ao despejo.
function narrar(ev) {
  if (!ev) return '';
  if (ev.msg != null) return ev.msg;
  const f = NARRA[ev.tipo];
  return f ? f(ev) : _despejo(ev);
}
