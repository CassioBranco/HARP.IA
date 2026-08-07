// ============================================================
// ANCOREO — a ponte entre o blog e o Google Perfil de Empresa.
//
// Funções PURAS: recebem a agenda e o artigo, devolvem decisões.
// Nada aqui fala com banco, IA ou rede.
//
// O problema que este arquivo resolve não é técnico, é de produto.
// Artigo e post do Google servem a coisas diferentes:
//
//   artigo   → longo, mora no site pra sempre, é o que ranqueia
//   post GPE → curto, some em uma semana, mantém o perfil vivo
//
// Ligar os dois do jeito óbvio (resumir o artigo no perfil) estraga
// os dois: o post fica comprido e chato, e quem leu o resumo não
// clica pro site. O perfil fica ativo e o site continua sem visita.
//
// Então a ligação é deliberadamente TORTA: o post do Google conta
// UMA coisa do artigo e para. O resto é o link. Isso se chama isca,
// e é por isso que o tipo se chama assim aqui dentro.
//
// A segunda regra é de cadência. O calendário (gbp-calendar.ts)
// promete 4 posts por mês, um por terça. Se cada artigo publicado
// criasse um post novo, quem escreve 4 artigos ficaria com 8 na
// fila, o calendário quebraria e o lembrete por e-mail viraria
// spam. Então a isca NUNCA cria vaga: ela ocupa uma que já existe.
// ============================================================
import { POSTS_POR_MES, proximasDatas, type GbpPostType } from './gbp-calendar'

/** Quanto do artigo vai no prompt. O modelo não precisa do texto
 *  inteiro pra escolher UMA ideia, e artigo grande custa caro. */
export const TRECHO_DO_ARTIGO = 2500

export type PostNaAgenda = {
  id: string
  scheduled_for: string | null
  published_at: string | null
  post_type: GbpPostType | string | null
  /** Veio de um artigo do blog? Iscas não cedem vaga uma pra outra. */
  deBlog: boolean
}

/**
 * Onde a isca entra no calendário.
 *
 * - `livre`   — sobrou terça sem post. Caso fácil.
 * - `troca`   — o mês está cheio. A isca toma a data do próximo post
 *               genérico e ele volta pra fila sem data. Um post que
 *               aponta pra um artigo real vale mais que uma dica que
 *               a IA inventou sozinha, então o real empurra o
 *               genérico, nunca o contrário. Nada é apagado.
 * - `sem-data`— não há nada pra ceder (o mês é só oferta, evento e
 *               outras iscas). A isca fica de fora do calendário,
 *               disponível pra usar quando quiser. Post sem data não
 *               dispara lembrete por e-mail, então ninguém é cobrado
 *               por algo que não prometeu.
 */
export type VagaDaIsca =
  | { tipo: 'livre'; data: string }
  | { tipo: 'troca'; data: string; cedeuId: string }
  | { tipo: 'sem-data' }

export function escolherVagaDaIsca(
  agendados: PostNaAgenda[],
  hoje: Date = new Date(),
): VagaDaIsca {
  const datas = proximasDatas(hoje, POSTS_POR_MES)

  const pendentes = agendados.filter((p) => !p.published_at && p.scheduled_for)
  const ocupadas = new Set(pendentes.map((p) => p.scheduled_for as string))

  const livre = datas.find((d) => !ocupadas.has(d))
  if (livre) return { tipo: 'livre', data: livre }

  // Só 'novidade' genérica cede a vez. Oferta e evento costumam ter
  // motivo no mundo real (uma promoção que começa, uma data que
  // chega); tirar a data deles é desmarcar um compromisso do dono.
  const cedivel = pendentes
    .filter((p) => !p.deBlog && p.post_type === 'novidade' && datas.includes(p.scheduled_for as string))
    .sort((a, b) => (a.scheduled_for as string).localeCompare(b.scheduled_for as string))[0]

  if (cedivel) {
    return { tipo: 'troca', data: cedivel.scheduled_for as string, cedeuId: cedivel.id }
  }
  return { tipo: 'sem-data' }
}

/** Republicar um artigo não pode gerar uma segunda isca do mesmo artigo. */
export function jaTemIscaDoArtigo(agendados: { origemBlogId?: string | null }[], blogPostId: string): boolean {
  return agendados.some((p) => p.origemBlogId === blogPostId)
}

/**
 * O texto do artigo em prosa limpa, cortado.
 *
 * Corta em fronteira de palavra: metade de uma palavra no fim do
 * prompt faz o modelo inventar o resto dela.
 */
export function extrairTextoDoArtigo(html: string | null | undefined, limite = TRECHO_DO_ARTIGO): string {
  const texto = (html ?? '')
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()

  if (texto.length <= limite) return texto
  const corte = texto.slice(0, limite)
  const ultimo = corte.lastIndexOf(' ')
  return `${(ultimo > limite / 2 ? corte.slice(0, ultimo) : corte).trim()}…`
}

/** Endereço público do artigo. É o que o botão do post do Google abre. */
export function urlDoArtigo(domain: string | null | undefined, slug: string | null | undefined): string | null {
  const d = (domain ?? '').trim()
  const s = (slug ?? '').trim()
  if (!d || !s) return null
  return `https://${d}/blog/${s}`
}

/**
 * Os assuntos que o mês NÃO deve repetir.
 *
 * Sem isto, o gerador do mês escreve quatro posts sem saber que o
 * dono acabou de publicar um artigo sobre um deles, e o perfil sai
 * falando duas vezes da mesma coisa em semanas seguidas.
 */
export function assuntosJaCobertos(titulos: (string | null | undefined)[], maximo = 8): string[] {
  const vistos = new Set<string>()
  const out: string[] = []
  for (const t of titulos) {
    const limpo = (t ?? '').replace(/\s+/g, ' ').trim()
    if (!limpo) continue
    const chave = limpo.toLowerCase()
    if (vistos.has(chave)) continue
    vistos.add(chave)
    out.push(limpo)
    if (out.length >= maximo) break
  }
  return out
}
