// ============================================================
// ANCOREO — Saúde de presença local no Google (NV5).
// Funções PURAS (sem I/O). Derivam status SÓ do que temos no
// banco; o que vem do Google e a gente NÃO lê via API vira item
// de CONFERÊNCIA GUIADA (o dono confirma na mão). Regra de ouro:
// nunca fabricar número ou status que não tem fonte real.
// ============================================================

export type PresenceItemKind = 'auto' | 'confira'
export type PresenceItemStatus = 'ok' | 'todo'

export type PresenceItem = {
  key: string
  label: string
  kind: PresenceItemKind
  status: PresenceItemStatus
  hint: string
  actionHref?: string
  actionLabel?: string
}

export type PresenceChecklist = {
  items: PresenceItem[]
  done: number
  total: number
}

// Entrada tolerante: qualquer campo pode faltar (coluna ausente,
// perfil não preenchido). Nada aqui pode quebrar por undefined.
export type PresenceInput = {
  siteStatus?: string | null            // sites.status
  siteDomain?: string | null            // sites.domain
  gpeModo?: string | null               // onboarding_profiles.gpe_modo
  gpeLink?: string | null               // onboarding_profiles.gpe_link
  businessName?: string | null          // onboarding_profiles.business_name
  city?: string | null                  // onboarding_profiles.city
  gbpPostDates?: (string | null | undefined)[]   // datas de gbp_posts
  blogPublishedDates?: (string | null | undefined)[] // published_at dos artigos
}

const DAY_MS = 86_400_000

// Dias inteiros entre agora e uma data ISO. null se inválida.
function daysAgo(iso: string | null | undefined, now: number): number | null {
  if (!iso) return null
  const t = new Date(iso).getTime()
  if (Number.isNaN(t)) return null
  return Math.floor((now - t) / DAY_MS)
}

// Menor "dias atrás" de uma lista de datas (a mais recente). null se vazia.
function mostRecentDaysAgo(dates: (string | null | undefined)[] | undefined, now: number): number | null {
  if (!dates || dates.length === 0) return null
  let best: number | null = null
  for (const d of dates) {
    const n = daysAgo(d, now)
    if (n === null) continue
    if (best === null || n < best) best = n
  }
  return best
}

// Link pra o dono conferir o perfil dele. Usa o gpe_link se houver;
// senão manda pra uma busca do Google pelo nome + cidade do negócio.
function profileHref(input: PresenceInput): string {
  const link = (input.gpeLink ?? '').trim()
  if (link) return link
  const q = [input.businessName, input.city].filter(Boolean).join(' ').trim()
  if (q) return `https://www.google.com/search?q=${encodeURIComponent(q)}`
  return 'https://business.google.com/'
}

/**
 * Monta o checklist de presença local.
 * - AUTOMÁTICOS: derivados do nosso banco (viram ok/todo sozinhos).
 * - CONFERÊNCIA GUIADA (kind:'confira'): dado do Google que não lemos
 *   via API. Começam como 'todo'; o "conferido" é do cliente (localStorage
 *   na UI). Cada um leva um link pra ele conferir no próprio perfil.
 */
export function buildPresenceChecklist(input: PresenceInput = {}): PresenceChecklist {
  const now = Date.now()
  const published = input.siteStatus === 'published'
  const gpeLinked = input.gpeModo === 'vincular' && !!(input.gpeLink ?? '').trim()
  const href = profileHref(input)

  const gbpDays = mostRecentDaysAgo(input.gbpPostDates, now)
  const blogDays = mostRecentDaysAgo(input.blogPublishedDates, now)

  const items: PresenceItem[] = []

  // ── Automáticos (fonte real: nosso banco) ─────────────────────
  items.push({
    key: 'site-published',
    label: 'Site publicado e no ar',
    kind: 'auto',
    status: published ? 'ok' : 'todo',
    hint: published
      ? 'Seu site está publicado — é o alicerce de tudo que o Google mostra.'
      : 'Publique seu site pra o Google ter o que indexar.',
  })

  items.push({
    key: 'gpe-linked',
    label: 'Perfil do Google vinculado',
    kind: 'auto',
    status: gpeLinked ? 'ok' : 'todo',
    hint: gpeLinked
      ? 'Seu Perfil de Empresa está ligado ao site.'
      : 'Ligue seu Perfil de Empresa ao site no onboarding — é ele que aparece no mapa.',
    actionHref: gpeLinked ? undefined : href,
    actionLabel: gpeLinked ? undefined : 'Abrir meu perfil',
  })

  items.push({
    key: 'gbp-fresh',
    label: 'Post no Google nos últimos 14 dias',
    kind: 'auto',
    status: gbpDays !== null && gbpDays <= 14 ? 'ok' : 'todo',
    hint: gbpDays === null
      ? 'Você ainda não gerou nenhum post pro Google. Perfis que postam aparecem mais.'
      : gbpDays <= 14
        ? `Seu último post foi há ${gbpDays} dia${gbpDays === 1 ? '' : 's'}. No ritmo certo.`
        : `Seu último post foi há ${gbpDays} dias. Gere um novo pra manter o perfil vivo.`,
    actionHref: '/gbp',
    actionLabel: 'Ir pros posts do Google',
  })

  items.push({
    key: 'blog-fresh',
    label: 'Artigo no blog nos últimos 30 dias',
    kind: 'auto',
    status: blogDays !== null && blogDays <= 30 ? 'ok' : 'todo',
    hint: blogDays === null
      ? 'Nenhum artigo publicado ainda. Conteúdo novo traz gente pela busca.'
      : blogDays <= 30
        ? `Seu último artigo saiu há ${blogDays} dia${blogDays === 1 ? '' : 's'}. Boa cadência.`
        : `Faz ${blogDays} dias desde o último artigo. Um texto novo por mês mantém o site fresco.`,
    actionHref: '/blog',
    actionLabel: 'Ir pro blog',
  })

  items.push({
    key: 'sitemap',
    label: 'Sitemap disponível pro Google',
    kind: 'auto',
    status: published ? 'ok' : 'todo',
    hint: published
      ? 'Seu sitemap.xml está no ar — é o mapa que o Google usa pra achar suas páginas.'
      : 'O sitemap fica disponível assim que o site é publicado.',
  })

  // ── Conferência guiada (dado do Google que NÃO lemos via API) ──
  // Começam como 'todo'. O cliente confirma na mão (localStorage na UI).
  const confira: Omit<PresenceItem, 'kind' | 'status'>[] = [
    {
      key: 'categorias',
      label: 'Categorias do perfil preenchidas',
      hint: 'Confira no seu perfil: a categoria principal e as secundárias descrevem certo o que você faz.',
      actionHref: href,
      actionLabel: 'Conferir no meu perfil',
    },
    {
      key: 'horario',
      label: 'Horário de funcionamento certo',
      hint: 'Confira no seu perfil: horário atualizado (e feriados) evita cliente na porta fechada.',
      actionHref: href,
      actionLabel: 'Conferir no meu perfil',
    },
    {
      key: 'fotos',
      label: 'Ao menos 3 fotos boas',
      hint: 'Confira no seu perfil: fachada, ambiente e trabalho. Perfis com fotos recebem mais cliques.',
      actionHref: href,
      actionLabel: 'Conferir no meu perfil',
    },
    {
      key: 'avaliacoes',
      label: 'Avaliações recentes respondidas',
      hint: 'Confira no seu perfil: responder avaliações (boas e ruins) mostra ao Google que o perfil está ativo.',
      actionHref: href,
      actionLabel: 'Conferir no meu perfil',
    },
  ]
  for (const c of confira) {
    items.push({ ...c, kind: 'confira', status: 'todo' })
  }

  const done = items.filter(i => i.status === 'ok').length
  return { items, done, total: items.length }
}

// ── Cadência de posts no Google Perfil de Empresa ─────────────
export type GbpCadenceStatus = 'never' | 'ok' | 'due' | 'overdue'
export type GbpCadence = {
  daysSince: number | null
  status: GbpCadenceStatus
  message: string
}

/**
 * Avalia há quanto tempo o dono não posta no Google.
 * never = nunca postou · ok ≤7d · due 8–14d · overdue >14d.
 * Tom "vizinho experiente" — direto, sem corporativês.
 */
export function gbpCadence(postDates: (string | null | undefined)[] = []): GbpCadence {
  const now = Date.now()
  const daysSince = mostRecentDaysAgo(postDates, now)

  if (daysSince === null) {
    return {
      daysSince: null,
      status: 'never',
      message: 'Você ainda não postou nada no seu Perfil do Google. É de graça e aparece pra quem procura você aqui perto — que tal começar hoje?',
    }
  }
  if (daysSince <= 7) {
    return {
      daysSince,
      status: 'ok',
      message: daysSince === 0
        ? 'Você postou no Google hoje. Esse é o ritmo — o Google gosta de perfil ativo.'
        : `Seu último post foi há ${daysSince} dia${daysSince === 1 ? '' : 's'}. Tá no ritmo certo, continua assim.`,
    }
  }
  if (daysSince <= 14) {
    return {
      daysSince,
      status: 'due',
      message: `Faz ${daysSince} dias desde seu último post no Google. Já dá pra soltar um novo — quem posta toda semana aparece mais na busca.`,
    }
  }
  return {
    daysSince,
    status: 'overdue',
    message: `Você não posta no Google há ${daysSince} dias. Perfis que postam toda semana aparecem mais na busca local. Bora gerar um post agora.`,
  }
}
