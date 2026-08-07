// ============================================================
// ANCOREO — Calendário mensal de posts do Google Perfil de Empresa.
//
// Funções PURAS. Nada aqui fala com banco, IA ou rede: recebe datas,
// devolve datas e agrupamentos. É separado da UI porque a mesma
// regra vai ser usada pelo lembrete por e-mail (item 5.6) e não pode
// haver duas noções de "o post desta semana" no produto.
//
// A ideia do item 5.3: em vez de o dono lembrar de pedir um post, o
// mês já chega pronto. Quatro posts, um por semana, cada um com o dia
// de ir ao ar. O painel deixa de perguntar "quer gerar?" e passa a
// dizer "hoje é o dia deste aqui".
//
// Nada disto publica sozinho. A data é um compromisso com o dono, não
// um agendador — quem cola no Google continua sendo ele.
// ============================================================

export type GbpPostType = 'novidade' | 'oferta' | 'evento'

// Um mês tem 4 posts. Cinco cansa o dono e o Google não pede tanto;
// três deixa buraco de mais de uma semana, que é onde a cadência cai
// pra 'due'. Quatro é uma terça por semana.
export const POSTS_POR_MES = 4

// Terça-feira. Dia de semana com movimento de busca local e longe do
// fim de semana, quando o dono de PME não abre o painel.
const DIA_DA_SEMANA_PADRAO = 2

// A rotação existe pra o mês não sair com quatro posts iguais. Começa
// e termina em 'novidade' porque é o tipo que serve a qualquer negócio;
// oferta e evento aparecem uma vez cada e não se repetem colados.
const ROTACAO: GbpPostType[] = ['novidade', 'oferta', 'novidade', 'evento']

const DIA_MS = 86_400_000

/** Data local (sem hora) no formato YYYY-MM-DD que o Postgres DATE aceita. */
export function paraDataISO(d: Date): string {
  const ano = d.getFullYear()
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const dia = String(d.getDate()).padStart(2, '0')
  return `${ano}-${mes}-${dia}`
}

/** Interpreta 'YYYY-MM-DD' como meia-noite LOCAL. `new Date('2026-08-11')`
 *  devolveria meia-noite UTC, que no Brasil é dia 10 às 21h — e o calendário
 *  mostraria o post um dia antes do combinado. */
export function deDataISO(iso: string): Date {
  const [a, m, d] = iso.split('-').map(Number)
  return new Date(a ?? 1970, (m ?? 1) - 1, d ?? 1)
}

/**
 * As próximas datas de publicação a partir de hoje.
 *
 * Cai sempre na terça. Se hoje já é terça, a primeira é HOJE — quem
 * acabou de abrir o painel não deveria esperar uma semana pra começar.
 */
export function proximasDatas(a_partir_de: Date = new Date(), quantas = POSTS_POR_MES): string[] {
  const base = new Date(a_partir_de.getFullYear(), a_partir_de.getMonth(), a_partir_de.getDate())
  const diff = (DIA_DA_SEMANA_PADRAO - base.getDay() + 7) % 7
  const primeira = new Date(base.getTime() + diff * DIA_MS)

  const datas: string[] = []
  for (let i = 0; i < quantas; i++) {
    datas.push(paraDataISO(new Date(primeira.getTime() + i * 7 * DIA_MS)))
  }
  return datas
}

/** O tipo de post de cada posição do mês, para o mês não sair repetitivo. */
export function tipoDaPosicao(i: number): GbpPostType {
  return ROTACAO[i % ROTACAO.length] ?? 'novidade'
}

// ── Agrupamento para a tela ───────────────────────────────────

export type GrupoAgenda = 'atrasado' | 'hoje' | 'semana' | 'depois' | 'publicado' | 'avulso'

export type ItemAgendado = {
  scheduled_for: string | null
  published_at: string | null
}

/**
 * Onde este post entra no calendário do dono.
 *
 * 'publicado' vence tudo: post que já foi ao ar não está atrasado, mesmo
 * que tenha saído depois da data combinada. Cobrar alguém por algo que a
 * pessoa já fez é o jeito mais rápido de perder a confiança no painel.
 */
export function grupoDoPost(post: ItemAgendado, hoje: Date = new Date()): GrupoAgenda {
  if (post.published_at) return 'publicado'
  if (!post.scheduled_for) return 'avulso'

  const dia = deDataISO(post.scheduled_for)
  const base = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate())
  const dias = Math.round((dia.getTime() - base.getTime()) / DIA_MS)

  if (dias < 0) return 'atrasado'
  if (dias === 0) return 'hoje'
  if (dias <= 7) return 'semana'
  return 'depois'
}

/** "hoje", "amanhã", "há 3 dias", "ter, 11 de ago". Texto de gente. */
export function rotuloDaData(iso: string | null, hoje: Date = new Date()): string {
  if (!iso) return 'sem data'
  const dia = deDataISO(iso)
  const base = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate())
  const dias = Math.round((dia.getTime() - base.getTime()) / DIA_MS)

  if (dias === 0) return 'hoje'
  if (dias === 1) return 'amanhã'
  if (dias === -1) return 'era ontem'
  if (dias < 0) return `era há ${-dias} dias`
  if (dias <= 6) return dia.toLocaleDateString('pt-BR', { weekday: 'long' })
  return dia.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })
}

/**
 * A frase que o painel mostra no topo do calendário.
 *
 * Uma coisa por vez: se tem post atrasado, é disso que se fala. O resto
 * pode esperar a próxima abertura da tela.
 */
export function resumoDaAgenda(posts: ItemAgendado[], hoje: Date = new Date()): {
  atrasados: number
  paraHoje: number
  pendentes: number
  mensagem: string
} {
  let atrasados = 0, paraHoje = 0, pendentes = 0
  for (const p of posts) {
    const g = grupoDoPost(p, hoje)
    if (g === 'publicado') continue
    if (g === 'atrasado') { atrasados++; pendentes++ }
    else if (g === 'hoje') { paraHoje++; pendentes++ }
    else if (g === 'semana' || g === 'depois') pendentes++
  }

  if (atrasados > 0) {
    return {
      atrasados, paraHoje, pendentes,
      mensagem: atrasados === 1
        ? 'Um post do seu calendário passou da data. Cole ele no perfil hoje que você volta pro ritmo.'
        : `${atrasados} posts do seu calendário passaram da data. Comece pelo mais antigo.`,
    }
  }
  if (paraHoje > 0) {
    return {
      atrasados, paraHoje, pendentes,
      mensagem: paraHoje === 1
        ? 'Hoje é dia de post no seu perfil. O texto já está pronto aqui embaixo.'
        : `Você tem ${paraHoje} posts marcados pra hoje. Os textos já estão prontos.`,
    }
  }
  if (pendentes > 0) {
    return {
      atrasados, paraHoje, pendentes,
      mensagem: `Seu mês está montado: ${pendentes} ${pendentes === 1 ? 'post esperando a data' : 'posts esperando a data'}. Nada pra fazer hoje.`,
    }
  }
  return {
    atrasados, paraHoje, pendentes,
    mensagem: 'Seu calendário do mês está vazio. Peça o mês inteiro de uma vez e não precisa lembrar disso de novo.',
  }
}
