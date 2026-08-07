// ============================================================
// ANCOREO — E-mail que lembra o dono do post da semana no Google
// Perfil de Empresa (item 5.6 do MVP).
//
// Função PURA: recebe a agenda, devolve { subject, html } ou null.
// Devolver null é metade do trabalho deste arquivo. Um lembrete que
// chega toda semana mesmo sem ter nada pendente vira propaganda, e o
// dono aprende a apagar sem ler — aí, no dia em que houver algo
// atrasado de verdade, o e-mail já não é lido.
//
// A noção de "o post desta semana" vem de lib/seo/gbp-calendar.ts, a
// mesma que o painel usa. Duas noções de atraso no mesmo produto é
// como o painel diz uma coisa e o e-mail diz outra.
// ============================================================
import { resumoDaAgenda, rotuloDaData, grupoDoPost, type ItemAgendado } from '@/lib/seo/gbp-calendar'

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export type PostDoLembrete = ItemAgendado & {
  /** Primeiras linhas do post, pro dono reconhecer do que se trata. */
  content?: string | null
}

/** Corta o texto do post numa prévia curta, sem cortar palavra no meio. */
function previa(texto: string | null | undefined, limite = 180): string {
  const t = (texto ?? '').replace(/\s+/g, ' ').trim()
  if (t.length <= limite) return t
  const corte = t.slice(0, limite)
  const ultimo = corte.lastIndexOf(' ')
  return `${(ultimo > 60 ? corte.slice(0, ultimo) : corte).trim()}…`
}

/**
 * Monta o lembrete semanal, ou devolve null quando não há motivo pra
 * incomodar: nada pendente, ou só posts com data lá na frente.
 *
 * Só existe assunto quando existe uma dessas duas coisas:
 * - post atrasado (passou da data e não foi publicado)
 * - post marcado pra hoje
 */
export function buildGbpLembreteEmail(i: {
  businessName?: string | null
  siteDomain?: string | null
  /** Link direto pra tela do Google no painel. */
  painelUrl: string
  posts: PostDoLembrete[]
  hoje?: Date
}): { subject: string; html: string } | null {
  const hoje = i.hoje ?? new Date()
  const resumo = resumoDaAgenda(i.posts, hoje)
  if (resumo.atrasados === 0 && resumo.paraHoje === 0) return null

  const negocio = i.businessName || i.siteDomain || 'seu negócio'

  // O e-mail fala de UM post: o mais urgente. Listar quatro faz o dono
  // fechar a caixa de entrada e decidir "depois eu vejo tudo isso".
  const pendentes = i.posts
    .filter((p) => {
      const g = grupoDoPost(p, hoje)
      return g === 'atrasado' || g === 'hoje'
    })
    .sort((a, b) => (a.scheduled_for ?? '').localeCompare(b.scheduled_for ?? ''))

  const alvo = pendentes[0]
  const quando = rotuloDaData(alvo?.scheduled_for ?? null, hoje)

  const subject = resumo.atrasados > 0
    ? `Seu post do Google ficou pra trás — ${negocio}`
    : `Hoje é dia de post no Google — ${negocio}`

  const abertura = resumo.atrasados > 0
    ? `O post que estava marcado para ${escapeHtml(quando)} ainda não foi ao ar. Ele leva menos de um minuto: o texto já está escrito, é copiar e colar no seu perfil.`
    : `O post desta semana está pronto e é hoje. Copiar e colar no seu perfil leva menos de um minuto.`

  const trecho = previa(alvo?.content)
  const blocoDoPost = trecho
    ? `<blockquote style="margin:16px 0;padding:12px 16px;border-left:3px solid #ddd;color:#444;background:#fafafa">${escapeHtml(trecho)}</blockquote>`
    : ''

  const outros = resumo.pendentes - 1
  const rodapeAgenda = outros > 0
    ? `<p style="color:#555">Depois deste, ${outros === 1 ? 'ainda tem mais um post' : `ainda tem mais ${outros} posts`} no seu calendário do mês, cada um com a data dele. Nada é publicado sozinho.</p>`
    : `<p style="color:#555">Nada é publicado sozinho: quem cola no Google é você.</p>`

  const html = `<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#222;max-width:560px">
<h2 style="font-size:18px;margin:0 0 12px">${escapeHtml(resumo.atrasados > 0 ? 'Seu post do Google ficou pra trás' : 'Hoje é dia de post no Google')}</h2>
<p>${abertura}</p>
${blocoDoPost}
<p style="margin:20px 0">
  <a href="${escapeHtml(i.painelUrl)}" style="display:inline-block;background:#0f172a;color:#fff;text-decoration:none;padding:11px 22px;border-radius:8px;font-weight:bold">Ver o post e copiar</a>
</p>
<p style="color:#555">Perfil ativo aparece nas buscas de quem está perto de você. Perfil parado some dessa lista — é a parte gratuita do Google que mais traz cliente da sua região.</p>
${rodapeAgenda}
<p style="margin-top:24px;font-size:12px;color:#999">Você recebe este aviso só quando tem post esperando. Semana sem pendência, semana sem e-mail.</p>
</div>`

  return { subject, html }
}
