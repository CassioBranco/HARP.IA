// ============================================================
// Score do SITE em 4 dimensões — SEO · GEO · AEO · Autoridade.
// Alinha o editor ao north-star do ANCOREO: não basta ranquear no
// Google (SEO), o site precisa ser ENTENDIDO e CITADO pelas IAs
// generativas (GEO), estar PRONTO pra virar resposta direta (AEO)
// e deixar claro QUEM assina o que está escrito (Autoridade/EEAT).
//
// RÉGUA ÚNICA: este arquivo é a única implementação do score do site.
// O editor (ScoreBar) e o painel de métricas (/api/score/[siteId])
// chamam a MESMA função com os MESMOS sinais — se as duas telas
// mostrassem números diferentes, nenhuma delas teria valor.
// Toda regra nova entra aqui, nunca dentro de uma rota ou de um
// componente.
//
// Client-safe: sem banco, sem servidor — recebe tudo pronto.
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

export type DimensionKey = 'seo' | 'geo' | 'aeo' | 'eeat'

export type Dimension = {
  key: DimensionKey
  /** Rótulo curto — cabe nas 4 colunas da barra do editor. */
  label: string
  /** Frase curta explicando a dimensão (tooltip). */
  hint: string
  score: number
  checks: SeoCheck[]
}

export type SiteScores = {
  /** Média das 4 dimensões — o número grande do círculo. */
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
  /** Links internos REAIS registrados no grafo (tabela internal_links). */
  internalLinks?: number
  /** Site publicado? Antes disso não existe robots.txt liberando bot de IA. */
  published?: boolean
  /** Cidade do perfil — SEO local vive de a cidade aparecer no texto. */
  city?: string
  /** Credencial/registro de conselho (CRO 123456, OAB/SP 1234…). */
  credential?: string
  /** Anos de atuação declarados no onboarding. */
  yearsExperience?: number
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

/** Depoimentos com nome preenchido — prova social só conta se tem autor. */
function namedTestimonials(sections: PageSection[]): number {
  const t = findSection(sections, 'testimonials')
  const items = (t?.content as { items?: unknown } | null)?.items
  if (!Array.isArray(items)) return 0
  return (items as { name?: unknown }[]).filter(it => asString(it?.name).trim().length > 0).length
}

/** Quantas vezes a cidade aparece no texto do site (acento e caixa ignorados). */
function cityMentions(allText: string, city: string): number {
  const c = city.trim()
  if (!c) return 0
  const norm = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  const alvo = norm(c)
  const texto = norm(allText)
  if (!alvo) return 0
  let n = 0
  let i = texto.indexOf(alvo)
  while (i !== -1) {
    n++
    i = texto.indexOf(alvo, i + alvo.length)
  }
  return n
}

// ── Dimensão SEO (ser achado no Google) ─────────────────────
function buildSeoChecks(input: SiteScoreInput, effTitle: string, allText: string, words: number): SeoCheck[] {
  const t = effTitle.trim()
  const m = input.metaDescription.trim()
  const city = (input.city ?? '').trim()

  const hasH2 = input.sections.some(s => {
    if (s.section_type === 'hero') return false
    const c = s.content as Record<string, unknown> | null
    return typeof c?.title === 'string' && c.title.trim().length > 0
  })
  // Grafo real (internal_links) quando existe; sem alvo pra linkar, o check passa.
  const links = input.internalLinks ?? 0
  const linkOk = !input.hasLinkTargets || links >= 2 || /\]\(\/|href=['"]\//.test(allText)

  return [
    { id: 'titulo', ok: t.length >= TITLE_MIN, label: 'Título da página preenchido', weight: 10,
      fix: 'Preencha o título da página na aba SEO do editor.' },
    { id: 'titulo-60', ok: t.length > 0 && t.length <= TITLE_MAX, label: `Título até ${TITLE_MAX} caracteres (não corta no Google)`, weight: 8,
      fix: `Encurte o título para até ${TITLE_MAX} caracteres na aba SEO.` },
    { id: 'meta', ok: m.length >= META_MIN && m.length <= META_MAX, label: `Resumo (meta) entre ${META_MIN} e ${META_MAX} caracteres`, weight: 12,
      fix: `Escreva o resumo (meta) entre ${META_MIN} e ${META_MAX} caracteres na aba SEO.` },
    { id: 'palavras', ok: words >= PAGE_WORDS_MIN, label: `Conteúdo com ${PAGE_WORDS_MIN}+ palavras (${words})`, weight: 14,
      fix: `Adicione mais conteúdo às seções: o site precisa de ${PAGE_WORDS_MIN}+ palavras no total.` },
    { id: 'h2', ok: hasH2, label: 'Pelo menos 1 subtítulo de seção (H2)', weight: 10,
      fix: 'Preencha ao menos uma seção com título (ex: Sobre ou Serviços).' },
    { id: 'cidade', ok: !city || cityMentions(allText, city) >= 2, label: city ? `Cidade (${city}) citada 2+ vezes` : 'Cidade citada no texto', weight: 10,
      fix: city
        ? `Cite ${city} pelo menos duas vezes: quem busca serviço perto adiciona a cidade na pesquisa.`
        : 'Informe a cidade no seu perfil para o site aparecer em buscas locais.' },
    { id: 'link-interno', ok: linkOk, label: 'Link pra outra página ou artigo do site', weight: 8,
      fix: 'Publique um artigo no blog e vincule-o à home.' },
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
    { id: 'entidade', ok: heroHeadline.trim().length >= TITLE_MIN, label: 'Nome/título do negócio claro no topo', weight: 12,
      fix: 'Preencha o título do topo (hero) com o nome do negócio.' },
    { id: 'descricao', ok: wordCount(aboutBody) >= 20, label: 'Descrição do negócio preenchida (quem é, o que faz)', weight: 12,
      fix: 'Preencha a seção "Sobre": quem é o negócio e o que faz.' },
    { id: 'contato', ok: hasPhone || hasContactSection, label: 'Telefone ou contato visível (onde atende)', weight: 12,
      fix: 'Informe um telefone ou WhatsApp com DDD: sem contato a IA não indica seu negócio.' },
    { id: 'oferta', ok: servicesCount(input.sections) >= 1, label: 'Serviços ou produtos listados', weight: 10,
      fix: 'Adicione ao menos 1 serviço ou produto na seção de serviços.' },
    { id: 'estrutura', ok: filledSections >= 3, label: 'Site com 3+ seções de conteúdo', weight: 8,
      fix: 'Deixe pelo menos 3 seções de conteúdo preenchidas.' },
    { id: 'substancia', ok: words >= PAGE_WORDS_MIN, label: `Substância suficiente pra IA citar (${PAGE_WORDS_MIN}+ palavras)`, weight: 10,
      fix: `Escreva mais: ${PAGE_WORDS_MIN}+ palavras no total dão substância pra IA citar.` },
    { id: 'bots-ia', ok: Boolean(input.published), label: 'Site no ar e liberado para os robôs de IA', weight: 12,
      fix: 'Publique o site: enquanto ele não está no ar, nenhuma IA consegue ler o conteúdo.' },
  ]
}

// ── Dimensão AEO (pronto pra virar resposta direta) ─────────
// AEO = Answer Engine Optimization. Perguntas e respostas objetivas,
// oferta estruturada em itens — o formato que a IA transforma em
// resposta pronta.
const AEO_ANSWER_WORDS_MAX = 60
const AEO_FAQ_IDEAL = 6

function buildAeoChecks(input: SiteScoreInput): SeoCheck[] {
  const items = faqItems(input.sections)
  const complete = items.filter(it => it.question.length > 0 && it.answer.length > 0)
  const concise = complete.length > 0 && complete.every(it => wordCount(it.answer) <= AEO_ANSWER_WORDS_MAX)
  const cta = asString((findSection(input.sections, 'hero')?.content as { cta_label?: unknown } | null)?.cta_label)
  // Verbo de posse: o visitante lê a ação que ele vai fazer, não "clique aqui".
  const ctaOk = /^(quero|agendar|ver|solicitar|contratar|falar|conhecer|baixar|garantir|pedir|marcar)/i.test(cta.trim())

  return [
    { id: 'faq', ok: hasCompleteFaq(complete), label: 'FAQ com pergunta e resposta', weight: 12,
      fix: 'Adicione perguntas e respostas na seção de FAQ.' },
    { id: 'faq-3', ok: complete.length >= 3, label: 'Pelo menos 3 perguntas frequentes', weight: 12,
      fix: 'Chegue a pelo menos 3 perguntas na FAQ.' },
    { id: 'faq-6', ok: complete.length >= AEO_FAQ_IDEAL, label: `${AEO_FAQ_IDEAL}+ perguntas (cobre o que o cliente pergunta)`, weight: 10,
      fix: `Suba a FAQ para ${AEO_FAQ_IDEAL} perguntas: cada pergunta é uma busca que seu site pode responder.` },
    { id: 'faq-objetiva', ok: concise, label: `Respostas objetivas (até ${AEO_ANSWER_WORDS_MAX} palavras)`, weight: 10,
      fix: `Deixe cada resposta da FAQ com até ${AEO_ANSWER_WORDS_MAX} palavras.` },
    { id: 'oferta-itens', ok: servicesCount(input.sections) >= 3, label: 'Oferta em itens (a IA cita como lista)', weight: 8,
      fix: 'Liste pelo menos 3 itens de serviço ou produto.' },
    { id: 'cta-verbo', ok: ctaOk, label: 'Botão principal com verbo de ação', weight: 8,
      fix: 'Troque o texto do botão do topo por uma ação: "Quero agendar", "Falar no WhatsApp", "Ver serviços".' },
  ]
}

// ── Dimensão Autoridade / EEAT (quem assina o que está escrito) ──
// Google e IA generativa pesam quem fala, não só o que foi dito.
// Credencial, tempo de atuação e prova social são o que separa um
// site de negócio real de uma página gerada em série.
const EEAT_ABOUT_WORDS = 80

function buildEeatChecks(input: SiteScoreInput): SeoCheck[] {
  const about = findSection(input.sections, 'about')
  const aboutContent = about?.content as { body?: unknown; credential?: unknown } | null
  const aboutBody = asString(aboutContent?.body)
  const credential = asString(aboutContent?.credential).trim() || (input.credential ?? '').trim()

  return [
    { id: 'eeat-credencial', ok: credential.length > 0, label: 'Credencial ou registro visível (CRO, OAB, CREA…)', weight: 12,
      fix: 'Informe seu registro de conselho: é o sinal de autoridade mais forte que um site de profissional pode ter.' },
    { id: 'eeat-anos', ok: (input.yearsExperience ?? 0) > 0, label: 'Tempo de atuação declarado', weight: 8,
      fix: 'Diga há quantos anos você atua: tempo de casa é confiança para quem nunca te viu.' },
    { id: 'eeat-sobre', ok: wordCount(aboutBody) >= EEAT_ABOUT_WORDS, label: `Seção "Sobre" com substância (${EEAT_ABOUT_WORDS}+ palavras)`, weight: 10,
      fix: `Escreva ${EEAT_ABOUT_WORDS}+ palavras no "Sobre": história, formação e como você trabalha.` },
    { id: 'eeat-prova', ok: namedTestimonials(input.sections) >= 1, label: 'Pelo menos 1 depoimento com nome real', weight: 10,
      fix: 'Adicione um depoimento de cliente com o nome dele: depoimento sem autor não vale como prova.' },
  ]
}

// ── Score do site (4 dimensões + agregado) ──────────────────
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
  const eeatChecks = buildEeatChecks(input)

  const dimensions: Dimension[] = [
    {
      key: 'seo',
      label: 'SEO',
      hint: 'O quanto o Google entende e ranqueia sua página.',
      score: computeSeoScore(seoChecks).score,
      checks: seoChecks,
    },
    {
      key: 'geo',
      label: 'GEO',
      hint: 'O quanto as IAs (ChatGPT, Gemini) entendem e citam seu negócio.',
      score: computeSeoScore(geoChecks).score,
      checks: geoChecks,
    },
    {
      key: 'aeo',
      label: 'AEO',
      hint: 'O quanto seu conteúdo está pronto pra virar resposta direta.',
      score: computeSeoScore(aeoChecks).score,
      checks: aeoChecks,
    },
    {
      key: 'eeat',
      label: 'Autoridade',
      hint: 'O quanto fica claro quem assina o site e por que confiar.',
      score: computeSeoScore(eeatChecks).score,
      checks: eeatChecks,
    },
  ]

  // Média simples das 4: cada pilar vale o mesmo. É o número que aparece
  // no círculo do editor e no painel — e tem que ser explicável em uma frase.
  const overall = Math.round(dimensions.reduce((s, d) => s + d.score, 0) / dimensions.length)
  return { overall, dimensions }
}
