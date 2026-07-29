// ============================================================
// Score do SITE em 3 dimensões — SEO · GEO · AEO.
// Alinha o editor ao north-star do ANCOREO: não basta ranquear no
// Google (SEO), o site precisa ser ENTENDIDO e CITADO pelas IAs
// generativas (GEO) e estar PRONTO pra virar resposta direta (AEO).
//
// Reaproveita o motor de checks de lib/seo/score.ts (mesma régua do
// SeoPanel) e agrupa os sinais nas 3 dimensões. Client-safe: sem
// banco, sem servidor — recebe as sections já carregadas.
// ============================================================

import {
  computeSeoScore,
  hasCompleteFaq,
  sectionText,
  wordCount,
  TITLE_MIN,
  TITLE_MAX,
  META_MIN,
  META_MAX,
  PAGE_WORDS_MIN,
  type PageSection,
  type SeoCheck,
} from './score'

export type DimensionKey = 'seo' | 'geo' | 'aeo'

export type Dimension = {
  key: DimensionKey
  label: string
  /** Frase curta explicando a dimensão (tooltip do wireframe). */
  hint: string
  score: number
  checks: SeoCheck[]
}

export type SiteScores = {
  /** Média das 3 dimensões — o número grande do círculo. */
  overall: number
  dimensions: Dimension[]
}

export type SiteScoreInput = {
  /** Título SEO da página (pages.title); cai pro H1 do hero se vazio. */
  title: string
  metaDescription: string
  sections: PageSection[]
  /** Existem artigos publicados no blog pra linkar? (sem alvo, o check passa) */
  hasLinkTargets: boolean
}

// ── Extração dos blocos conhecidos das sections ─────────────
function findSection(sections: PageSection[], type: string): PageSection | undefined {
  return sections.find(s => s.section_type === type)
}

function asString(v: unknown): string {
  return typeof v === 'string' ? v : ''
}

type FaqLike = { question?: unknown; answer?: unknown }

function faqItems(sections: PageSection[]): { question: string; answer: string }[] {
  const faq = findSection(sections, 'faq')
  const items = (faq?.content as { items?: unknown } | null)?.items
  if (!Array.isArray(items)) return []
  return (items as FaqLike[]).map(it => ({
    question: asString(it?.question).trim(),
    answer: asString(it?.answer).trim(),
  }))
}

function servicesCount(sections: PageSection[]): number {
  const svc = findSection(sections, 'services')
  const items = (svc?.content as { items?: unknown } | null)?.items
  return Array.isArray(items) ? items.length : 0
}

// ── Dimensão SEO (ser achado no Google) ─────────────────────
function buildSeoChecks(input: SiteScoreInput, effTitle: string, allText: string, words: number): SeoCheck[] {
  const t = effTitle.trim()
  const m = input.metaDescription.trim()

  const hasH2 = input.sections.some(s => {
    if (s.section_type === 'hero') return false
    const c = s.content as Record<string, unknown> | null
    return typeof c?.title === 'string' && c.title.trim().length > 0
  })
  const hasInternalLink = /\]\(\/|href=['"]\//.test(allText)

  return [
    { id: 'titulo', ok: t.length >= TITLE_MIN, label: 'Título da página preenchido' },
    { id: 'titulo-60', ok: t.length > 0 && t.length <= TITLE_MAX, label: `Título até ${TITLE_MAX} caracteres (não corta no Google)` },
    { id: 'meta', ok: m.length >= META_MIN && m.length <= META_MAX, label: `Resumo (meta) entre ${META_MIN} e ${META_MAX} caracteres` },
    { id: 'palavras', ok: words >= PAGE_WORDS_MIN, label: `Conteúdo com ${PAGE_WORDS_MIN}+ palavras (${words})` },
    { id: 'h2', ok: hasH2, label: 'Pelo menos 1 subtítulo de seção (H2)' },
    { id: 'link-interno', ok: !input.hasLinkTargets || hasInternalLink, label: 'Link pra outra página ou artigo do site' },
  ]
}

// ── Dimensão GEO (ser entendido e citado pelas IAs) ─────────
// GEO = Generative Engine Optimization. A IA precisa saber QUEM é o
// negócio, O QUE oferece e ONDE atende, com substância pra citar.
function buildGeoChecks(input: SiteScoreInput, heroHeadline: string, words: number): SeoCheck[] {
  const about = findSection(input.sections, 'about')
  const aboutBody = asString((about?.content as { body?: unknown } | null)?.body)
  const rawJson = JSON.stringify(input.sections)
  // Telefone BR (com ou sem DDD/9) ou uma seção de contato/endereço explícita.
  const hasPhone = /\(?\d{2}\)?\s*9?\d{4}[-\s]?\d{4}/.test(rawJson)
  const hasContactSection = input.sections.some(s => /contact|contato|endereco|endereço|local/i.test(s.section_type))
  const filledSections = input.sections.filter(s => sectionText(s.content).trim().length > 0).length

  return [
    { id: 'entidade', ok: heroHeadline.trim().length >= TITLE_MIN, label: 'Nome/título do negócio claro no topo' },
    { id: 'descricao', ok: wordCount(aboutBody) >= 20, label: 'Descrição do negócio preenchida (quem é, o que faz)' },
    { id: 'contato', ok: hasPhone || hasContactSection, label: 'Telefone ou contato visível (onde atende)' },
    { id: 'oferta', ok: servicesCount(input.sections) >= 1, label: 'Serviços ou produtos listados' },
    { id: 'estrutura', ok: filledSections >= 3, label: 'Site com 3+ seções de conteúdo' },
    { id: 'substancia', ok: words >= PAGE_WORDS_MIN, label: 'Substância suficiente pra IA citar (300+ palavras)' },
  ]
}

// ── Dimensão AEO (pronto pra virar resposta direta) ─────────
// AEO = Answer Engine Optimization. Perguntas e respostas objetivas,
// oferta estruturada em itens — o formato que a IA transforma em
// resposta pronta.
const AEO_ANSWER_WORDS_MAX = 60

function buildAeoChecks(input: SiteScoreInput): SeoCheck[] {
  const items = faqItems(input.sections)
  const complete = items.filter(it => it.question.length > 0 && it.answer.length > 0)
  const concise = complete.length > 0 && complete.every(it => wordCount(it.answer) <= AEO_ANSWER_WORDS_MAX)

  return [
    { id: 'faq', ok: hasCompleteFaq(complete), label: 'FAQ com pergunta e resposta' },
    { id: 'faq-3', ok: complete.length >= 3, label: 'Pelo menos 3 perguntas frequentes' },
    { id: 'faq-objetiva', ok: concise, label: `Respostas objetivas (até ${AEO_ANSWER_WORDS_MAX} palavras)` },
    { id: 'oferta-itens', ok: servicesCount(input.sections) >= 3, label: 'Oferta em itens (a IA cita como lista)' },
  ]
}

// ── Score do site (3 dimensões + agregado) ──────────────────
export function buildSiteScores(input: SiteScoreInput): SiteScores {
  const heroHeadline = asString(
    (findSection(input.sections, 'hero')?.content as { headline?: unknown } | null)?.headline,
  )
  const effTitle = input.title.trim() || heroHeadline
  const allText = input.sections.map(s => sectionText(s.content)).join(' ')
  const words = wordCount(allText)

  const seoChecks = buildSeoChecks(input, effTitle, allText, words)
  const geoChecks = buildGeoChecks(input, heroHeadline, words)
  const aeoChecks = buildAeoChecks(input)

  const dimensions: Dimension[] = [
    {
      key: 'seo',
      label: 'SEO Tradicional',
      hint: 'O quanto o Google entende e ranqueia sua página.',
      score: computeSeoScore(seoChecks).score,
      checks: seoChecks,
    },
    {
      key: 'geo',
      label: 'GEO Index',
      hint: 'O quanto as IAs (ChatGPT, Gemini) entendem e citam seu negócio.',
      score: computeSeoScore(geoChecks).score,
      checks: geoChecks,
    },
    {
      key: 'aeo',
      label: 'AEO Readiness',
      hint: 'O quanto seu conteúdo está pronto pra virar resposta direta.',
      score: computeSeoScore(aeoChecks).score,
      checks: aeoChecks,
    },
  ]

  const overall = Math.round(dimensions.reduce((s, d) => s + d.score, 0) / dimensions.length)
  return { overall, dimensions }
}
