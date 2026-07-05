// ============================================================
// SEO score ao vivo — núcleo compartilhado dos 7 checks.
// Usado pelo editor de posts do blog (PostEditor) e pelo editor
// do site (SeoPanel). As réguas moram AQUI, num lugar só:
// mudou o limite, muda nos dois editores ao mesmo tempo.
// Client-safe: sem dependência de banco ou de servidor.
// ============================================================

import { extractKeywords, norm } from './triangulation'

/** weight opcional: sem ele todo check vale 1 (páginas seguem iguais). */
export type SeoCheck = { id: string; ok: boolean; label: string; weight?: number }
export type SeoScore = { score: number; label: 'Bom' | 'Regular' | 'Fraco' }
export type FaqItem = { question: string; answer: string }

// ── Réguas (mesmas do PostEditor original / AEO rules) ──────
export const TITLE_MIN = 8 // título "de verdade", não 2 letras
export const TITLE_MAX = 60 // não corta na SERP do Google
export const META_MIN = 80
export const META_MAX = 160
export const POST_WORDS_MIN = 600 // artigo de blog
export const PAGE_WORDS_MIN = 300 // página institucional (home/serviços) é mais enxuta

/** Conta palavras do texto visível (remove tags HTML antes). */
export function wordCount(text: string): number {
  return text.replace(/<[^>]+>/g, ' ').trim().split(/\s+/).filter(Boolean).length
}

/**
 * Parágrafos de texto do conteúdo (corpo aceita HTML da IA ou markdown do
 * usuário): com <p> usa os blocos <p>; sem, divide por linha em branco e
 * descarta headings/listas/citações/tags soltas.
 */
export function contentParagraphs(content: string): string[] {
  const fromHtml = Array.from(content.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi))
    .map(m => (m[1] ?? '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim())
    .filter(Boolean)
  if (fromHtml.length) return fromHtml
  return content
    .split(/\n{2,}/)
    .map(b => b.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim())
    .filter(b => b && !/^(#|>|[-*]\s|\d+\.\s|\|)/.test(b))
}

/** Primeiro parágrafo de texto do conteúdo (base do check de keyword e do preview de IA). */
export function firstParagraph(content: string): string {
  return contentParagraphs(content)[0] ?? ''
}

/** FAQ tem pelo menos uma pergunta completa (pergunta E resposta)? */
export function hasCompleteFaq(faq: FaqItem[] | null | undefined): boolean {
  return (faq ?? []).some(f => (f?.question ?? '').trim().length > 0 && (f?.answer ?? '').trim().length > 0)
}

// ── Checks-núcleo (mesma régua pra post e página) ───────────
function checkTitleFilled(title: string, label: string): SeoCheck {
  return { id: 'titulo', ok: title.trim().length >= TITLE_MIN, label }
}

function checkTitleLength(title: string): SeoCheck {
  const t = title.trim()
  return {
    id: 'titulo-60',
    ok: t.length > 0 && t.length <= TITLE_MAX,
    label: `Título até ${TITLE_MAX} caracteres (não corta no Google)`,
  }
}

function checkMeta(meta: string): SeoCheck {
  const m = meta.trim()
  return {
    id: 'meta',
    ok: m.length >= META_MIN && m.length <= META_MAX,
    label: `Resumo (meta) entre ${META_MIN} e ${META_MAX} caracteres`,
  }
}

function checkWords(words: number, min: number, what: string): SeoCheck {
  return { id: 'palavras', ok: words >= min, label: `${what} com ${min}+ palavras (${words})` }
}

// ── POST (blog: título + meta + corpo markdown/HTML livre) ──
export const PARAGRAPH_WORDS_MAX = 120 // escaneabilidade (leitor e IA)

export type PostSeoInput = {
  title: string
  metaDescription: string
  content: string
  /** FAQ estruturada do artigo (blog_posts.schema_faq) — pode não existir ainda. */
  faq?: FaqItem[] | null
  /** Existem outros artigos publicados pra linkar? (sem alvo, o check passa) */
  hasLinkTargets: boolean
  /** O corpo já tem link interno pra outro artigo? */
  hasInternalLink: boolean
}

/** Keyword do título aparece no primeiro parágrafo? (relevância imediata pra SERP e IA) */
function checkKeywordIntro(title: string, content: string): boolean {
  const kws = Array.from(extractKeywords(title, null))
  if (kws.length === 0) return false
  const intro = norm(firstParagraph(content))
  return intro.length > 0 && kws.some(k => intro.includes(k))
}

/** Toda imagem do corpo (HTML <img> ou markdown ![alt]) tem alt não-vazio? Sem imagem passa. */
function checkImagesAlt(content: string): boolean {
  const badHtml = Array.from(content.matchAll(/<img\b[^>]*>/gi))
    .some(m => !/\balt\s*=\s*["'][^"']*\S[^"']*["']/i.test(m[0]))
  const badMd = Array.from(content.matchAll(/!\[([^\]]*)\]\(/g))
    .some(m => !(m[1] ?? '').trim())
  return !badHtml && !badMd
}

/** Tem pelo menos 1 lista ou tabela? (estrutura que IA generativa adora citar) */
function checkListOrTable(content: string): boolean {
  return /(<ul\b|<ol\b|<table\b)/i.test(content) || /^\s*([-*]\s|\d+\.\s|\|)/m.test(content)
}

export function buildPostSeoChecks(input: PostSeoInput): SeoCheck[] {
  const { title, metaDescription, content, faq, hasLinkTargets, hasInternalLink } = input

  const paragraphs = contentParagraphs(content)
  const noLongParagraph = paragraphs.length > 0 && paragraphs.every(p => wordCount(p) <= PARAGRAPH_WORDS_MAX)

  // FAQ: campo estruturado é o caminho novo; regex no corpo mantém
  // compatibilidade com artigos antigos que escreveram a FAQ no texto.
  const faqOk = hasCompleteFaq(faq) || /faq|pergunt/i.test(content)

  // Pesos somam 100 — os fundamentos (título/meta/tamanho/FAQ) pesam
  // mais que os refinamentos; computeSeoScore normaliza de todo jeito.
  return [
    { ...checkTitleFilled(title, 'Título preenchido'), weight: 10 },
    { ...checkTitleLength(title), weight: 10 },
    { ...checkMeta(metaDescription), weight: 12 },
    { ...checkWords(wordCount(content), POST_WORDS_MIN, 'Texto'), weight: 14 },
    { id: 'h2', ok: /(<h2|^##\s|\n##\s)/i.test(content), label: 'Pelo menos 1 subtítulo (H2)', weight: 10 },
    { id: 'faq', ok: faqOk, label: 'Perguntas frequentes preenchidas', weight: 12 },
    { id: 'link-interno', ok: !hasLinkTargets || hasInternalLink, label: 'Link pra outro artigo do site', weight: 8 },
    { id: 'keyword-intro', ok: checkKeywordIntro(title, content), label: 'Palavra do título no primeiro parágrafo', weight: 8 },
    { id: 'lista-tabela', ok: checkListOrTable(content), label: 'Pelo menos 1 lista ou tabela', weight: 8 },
    { id: 'paragrafos', ok: noLongParagraph, label: `Parágrafos curtos (até ${PARAGRAPH_WORDS_MAX} palavras)`, weight: 4 },
    { id: 'img-alt', ok: checkImagesAlt(content), label: 'Imagens com texto alternativo (alt)', weight: 4 },
  ]
}

// ── PÁGINA (site: conteúdo mora nas sections JSONB) ─────────
export type PageSection = { section_type: string; content: unknown }

/** Extrai todo o texto visível (strings) do JSON de uma section, recursivo. */
export function sectionText(content: unknown): string {
  if (typeof content === 'string') return content
  if (Array.isArray(content)) return content.map(sectionText).join(' ')
  if (content && typeof content === 'object') {
    return Object.entries(content as Record<string, unknown>)
      // urls de imagem/posição não são texto visível
      .filter(([k]) => !['image', 'image_pos', 'icon'].includes(k))
      .map(([, v]) => sectionText(v))
      .join(' ')
  }
  return ''
}

type FaqLike = { question?: unknown; answer?: unknown }

export type PageSeoInput = {
  /** Título SEO da página (pages.title); cai pro H1 do hero se vazio. */
  title: string
  metaDescription: string
  sections: PageSection[]
  /** Existem artigos publicados no blog pra linkar? (sem alvo, o check passa) */
  hasLinkTargets: boolean
}

export function buildPageSeoChecks(input: PageSeoInput): SeoCheck[] {
  const { title, metaDescription, sections, hasLinkTargets } = input

  const allText = sections.map(s => sectionText(s.content)).join(' ')
  const words = wordCount(allText)

  // H2 = título de section editável (ex.: "Sobre o negócio" → campo Título da seção)
  const hasH2 = sections.some(s => {
    if (s.section_type === 'hero') return false
    const c = s.content as Record<string, unknown> | null
    return typeof c?.title === 'string' && c.title.trim().length > 0
  })

  // FAQ: section faq com pelo menos 1 pergunta completa (pergunta E resposta)
  const faq = sections.find(s => s.section_type === 'faq')
  const faqItems = Array.isArray((faq?.content as { items?: unknown } | null)?.items)
    ? ((faq!.content as { items: FaqLike[] }).items)
    : []
  const hasFaq = faqItems.some(
    it => String(it?.question ?? '').trim().length > 0 && String(it?.answer ?? '').trim().length > 0,
  )

  // Link interno: qualquer link relativo pra página/artigo do próprio site
  const hasInternalLink = /\]\(\/|href=['"]\//.test(allText)

  return [
    checkTitleFilled(title, 'Título da página preenchido'),
    checkTitleLength(title),
    checkMeta(metaDescription),
    checkWords(words, PAGE_WORDS_MIN, 'Conteúdo'),
    { id: 'h2', ok: hasH2, label: 'Pelo menos 1 subtítulo de seção (H2)' },
    { id: 'faq', ok: hasFaq, label: 'FAQ com perguntas e respostas' },
    { id: 'link-interno', ok: !hasLinkTargets || hasInternalLink, label: 'Link pra outra página ou artigo do site' },
  ]
}

// ── Score agregado (0–100 + rótulo) ─────────────────────────
// Ponderado: check sem weight vale 1 (páginas continuam com a média
// simples de antes); posts usam os pesos de buildPostSeoChecks.
export function computeSeoScore(checks: SeoCheck[]): SeoScore {
  const total = checks.reduce((s, c) => s + (c.weight ?? 1), 0)
  const got = checks.reduce((s, c) => s + (c.ok ? (c.weight ?? 1) : 0), 0)
  const score = total ? Math.round((got / total) * 100) : 0
  return { score, label: score >= 80 ? 'Bom' : score >= 50 ? 'Regular' : 'Fraco' }
}
