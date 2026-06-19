// ============================================================
// seo-validator — a última barreira antes de publicar (AEO).
// Valida as regras críticas de AEO-ARCHITECTURE-RULES.md sobre o
// SiteContent real montado do banco (DRY: usa buildSiteContent).
// Erros BLOQUEIAM a publicação; avisos só informam.
// ============================================================
import type { SupabaseClient } from '@supabase/supabase-js'
import { buildSiteContent } from '@/lib/templates/build-site-content'

export type IssueLevel = 'error' | 'warning'
export type ValidationIssue = { rule: string; level: IssueLevel; message: string }
export type ValidationResult = {
  ok: boolean
  errors: ValidationIssue[]
  warnings: ValidationIssue[]
}

const FAQ_MIN = 6 // AEO Regra 4 — piso de perguntas na FAQ

/**
 * Valida um site para publicação. Roda sobre o conteúdo REAL (sections +
 * onboarding_profile) já montado, o mesmo que vai ao ar — então o que valida
 * é exatamente o que publica.
 */
export async function validateSiteForPublish(
  supabase: SupabaseClient,
  siteId: string,
): Promise<ValidationResult> {
  const errors: ValidationIssue[] = []
  const warnings: ValidationIssue[] = []

  const built = await buildSiteContent(supabase, { siteId })
  if (!built) {
    errors.push({
      rule: 'conteudo',
      level: 'error',
      message: 'O site ainda não tem conteúdo gerado. Gere o site com a IA antes de publicar.',
    })
    return { ok: false, errors, warnings }
  }

  const c = built.content

  // ── Conteúdo essencial (sem isto a página fica vazia/quebrada) ──────────────
  if (!c.heroHeadline?.trim()) {
    errors.push({ rule: 'hero', level: 'error', message: 'A seção principal (hero) está sem título. Gere o conteúdo antes de publicar.' })
  }
  if (!c.businessName?.trim() || c.businessName === 'Seu negócio') {
    errors.push({ rule: 'nome-negocio', level: 'error', message: 'O nome do negócio não foi definido. Complete o onboarding antes de publicar.' })
  }

  // ── AEO Regra 4 — FAQ com FAQPage schema, mínimo 6 perguntas ────────────────
  const faqCount = c.faqs?.length ?? 0
  if (faqCount < FAQ_MIN) {
    errors.push({
      rule: 'faq-minimo',
      level: 'error',
      message: `A home precisa de no mínimo ${FAQ_MIN} perguntas na FAQ (tem ${faqCount}). É o canal mais direto de aparecer em resposta de IA (Regra AEO 4).`,
    })
  } else {
    // garante que nenhuma pergunta/resposta esteja vazia (schema FAQPage inválido)
    const incompleta = c.faqs.some(f => !f.question?.trim() || !f.answer?.trim())
    if (incompleta) {
      errors.push({ rule: 'faq-incompleta', level: 'error', message: 'Há perguntas ou respostas vazias na FAQ. Toda pergunta precisa de resposta para o schema FAQPage ser válido.' })
    }
  }

  // ── AEO Regra 2 — schema JSON-LD precisa de dados pra ser útil ───────────────
  if (!c.city?.trim()) {
    warnings.push({ rule: 'cidade', level: 'warning', message: 'Cidade não informada: o schema LocalBusiness fica sem endereço/área servida, enfraquecendo o SEO local.' })
  }

  const metaOk = await hasHomeMeta(supabase, siteId)
  if (!metaOk) {
    warnings.push({ rule: 'meta-description', level: 'warning', message: 'A home está sem meta description. Recomendado para a busca tradicional.' })
  }

  // ── Sinais de conversão / completude ────────────────────────────────────────
  if (!c.services?.length) {
    warnings.push({ rule: 'servicos', level: 'warning', message: 'Nenhum serviço cadastrado: a seção de serviços fica vazia.' })
  }
  if (!c.ctaPhone?.trim() && !c.whatsapp?.trim()) {
    warnings.push({ rule: 'contato', level: 'warning', message: 'Sem telefone/WhatsApp: o cliente potencial não tem como entrar em contato.' })
  }

  return { ok: errors.length === 0, errors, warnings }
}

// ============================================================
// Validação de ARTIGO de blog para publicação (AEO Regras 3, 4).
// Roda sobre o HTML salvo (content) — o mesmo que vai ao ar.
// Título vazio bloqueia; o resto vira aviso (heurística sobre HTML
// livre pode ter falso-negativo; não bloqueamos publicação por isso).
// ============================================================
const BLOG_WORDS_MIN = 600
const BLOG_FAQ_MIN = 6

export function validateBlogPostForPublish(args: {
  title: string
  content: string
  metaDescription?: string | null
}): ValidationResult {
  const errors: ValidationIssue[] = []
  const warnings: ValidationIssue[] = []
  const { title, content } = args
  const html = content ?? ''

  if (!title?.trim()) {
    errors.push({ rule: 'titulo', level: 'error', message: 'Dê um título ao artigo antes de publicar.' })
  }

  // Palavras (texto sem tags)
  const words = html.replace(/<[^>]+>/g, ' ').replace(/[#>*_]/g, ' ').trim().split(/\s+/).filter(Boolean).length
  if (words < BLOG_WORDS_MIN) {
    warnings.push({ rule: 'tamanho', level: 'warning', message: `Artigo com ${words} palavras (recomendado ${BLOG_WORDS_MIN}+). Textos curtos rankeiam e são citados menos.` })
  }

  // AEO Regra 4 — FAQ >= 6. Conta perguntas em headings (h2/h3) ou markdown (##).
  const faqCount = countFaqQuestions(html)
  if (faqCount < BLOG_FAQ_MIN) {
    warnings.push({ rule: 'faq-minimo', level: 'warning', message: `FAQ com ${faqCount} perguntas (recomendado ${BLOG_FAQ_MIN}+). É o canal mais direto de aparecer em resposta de IA (Regra AEO 4).` })
  }

  // AEO Regra 3 — H2 autossuficiente: primeira frase após H2 não pode começar
  // com pronome/referência órfã ("isso", "como vimos", "conforme acima"...).
  const orphanH2 = findOrphanH2(html)
  if (orphanH2.length > 0) {
    warnings.push({ rule: 'h2-autossuficiente', level: 'warning', message: `${orphanH2.length} subtítulo(s) começam com referência órfã ("${orphanH2[0]}"). A IA lê cada bloco isolado — a 1ª frase após o H2 deve responder direto (Regra AEO 3).` })
  }

  return { ok: errors.length === 0, errors, warnings }
}

const ORPHAN_STARTS = ['isso', 'isto', 'essa', 'esse', 'esta', 'este', 'como vimos', 'conforme', 'além disso', 'por isso', 'assim']

/** Conta perguntas (terminam em "?") em headings HTML ou markdown. */
function countFaqQuestions(html: string): number {
  const headings = [
    ...Array.from(html.matchAll(/<h[2-4][^>]*>([\s\S]*?)<\/h[2-4]>/gi)),
    ...Array.from(html.matchAll(/^#{2,4}\s+(.+)$/gim)),
  ].map(m => (m[1] ?? '').replace(/<[^>]+>/g, '').trim())
  return headings.filter(h => h.endsWith('?')).length
}

/** Devolve os primeiros termos órfãos achados logo após um H2. */
function findOrphanH2(html: string): string[] {
  const found: string[] = []
  const blocks = Array.from(html.matchAll(/<h2[^>]*>[\s\S]*?<\/h2>([\s\S]*?)(?=<h2|$)/gi))
  for (const b of blocks) {
    const after = (b[1] ?? '').replace(/<[^>]+>/g, ' ').trim().toLowerCase()
    const firstWords = after.slice(0, 24)
    const hit = ORPHAN_STARTS.find(o => firstWords.startsWith(o))
    if (hit) found.push(hit)
  }
  return found
}

/** Lê a meta_description da home direto do banco (não vem no SiteContent). */
async function hasHomeMeta(supabase: SupabaseClient, siteId: string): Promise<boolean> {
  const { data } = await supabase
    .from('pages')
    .select('meta_description')
    .eq('site_id', siteId)
    .eq('slug', 'home')
    .maybeSingle()
  return !!(data?.meta_description as string | null)?.trim()
}
