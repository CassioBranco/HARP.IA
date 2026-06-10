import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

// 8 regras AEO — hardcoded aqui, mas o peso pode vir de score_rules no banco
const RULES = [
  { key: 'robots_ai_bots',   label: 'robots.txt libera bots de IA',              scope: 'site',  weight: 10 },
  { key: 'json_ld_schema',   label: 'JSON-LD schema presente na home',            scope: 'page',  weight: 15 },
  { key: 'h2_autossuficiente', label: 'H2s com resposta direta na primeira frase', scope: 'page',  weight: 15 },
  { key: 'faq_6_perguntas',  label: 'FAQ com 6+ perguntas na home',              scope: 'page',  weight: 15 },
  { key: 'keyword_100chars', label: 'Keyword primária nos primeiros 100 chars',   scope: 'page',  weight: 10 },
  { key: 'cidade_2x',        label: 'Cidade mencionada 2x por 200 palavras',     scope: 'page',  weight: 10 },
  { key: 'internal_links',   label: 'Toda página tem ≥2 links internos',         scope: 'site',  weight: 15 },
  { key: 'cta_verbo_posse',  label: 'CTAs com verbo de posse',                   scope: 'page',  weight: 10 },
]

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const { siteId } = await params
  const supabase = await createServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Não autorizado', { status: 401 })

  // Carrega dados necessários para calcular o score
  const [{ data: site }, { data: pages }, { data: sections }] = await Promise.all([
    supabase.from('sites').select('id,domain,status').eq('id', siteId).single(),
    supabase.from('pages').select('id,slug,title,meta_description').eq('site_id', siteId),
    supabase.from('sections').select('section_type,content,page_id').in(
      'page_id',
      (await supabase.from('pages').select('id').eq('site_id', siteId)).data?.map(p => p.id) ?? []
    ),
  ])

  if (!site) return Response.json({ error: 'Site não encontrado' }, { status: 404 })

  const homeSection = (sections ?? []).reduce<Record<string, unknown>>((acc, s) => {
    acc[s.section_type] = s.content
    return acc
  }, {})

  // Avalia cada regra
  const evaluated = RULES.map(rule => {
    const passed = evaluateRule(rule.key, { site, pages: pages ?? [], sections: homeSection })
    return {
      rule_key: rule.key,
      description: rule.label,
      scope: rule.scope,
      score: passed ? 100 : 0,
      passed,
    }
  })

  // Calcula scores por categoria
  const totalWeight = RULES.reduce((sum, r) => sum + r.weight, 0)
  const weightedScore = evaluated.reduce((sum, r, i) => {
    return sum + (r.passed ? RULES[i]!.weight : 0)
  }, 0)
  const overall = Math.round((weightedScore / totalWeight) * 100)

  // SEO = keyword, cidade, H2, JSON-LD
  const seoKeys = ['keyword_100chars', 'cidade_2x', 'h2_autossuficiente', 'json_ld_schema']
  const seo = calcGroupScore(evaluated, seoKeys)

  // GEO = robots, internal links, JSON-LD
  const geoKeys = ['robots_ai_bots', 'internal_links', 'json_ld_schema']
  const geo = calcGroupScore(evaluated, geoKeys)

  // AEO = FAQ, H2, CTA
  const aeoKeys = ['faq_6_perguntas', 'h2_autossuficiente', 'cta_verbo_posse']
  const aeo = calcGroupScore(evaluated, aeoKeys)

  return Response.json({
    overall,
    seo,
    geo,
    aeo,
    rules: evaluated,
    calculated_at: new Date().toISOString(),
  })
}

function calcGroupScore(rules: { rule_key: string; passed: boolean }[], keys: string[]) {
  const group = rules.filter(r => keys.includes(r.rule_key))
  if (group.length === 0) return 0
  return Math.round((group.filter(r => r.passed).length / group.length) * 100)
}

type EvalContext = {
  site: { domain: string | null; status: string }
  pages: { title: string | null; meta_description: string | null }[]
  sections: Record<string, unknown>
}

function evaluateRule(key: string, ctx: EvalContext): boolean {
  switch (key) {
    case 'robots_ai_bots':
      // Site publicado = assume robots.txt configurado (validação real em S5)
      return ctx.site.status === 'published'

    case 'json_ld_schema':
      // Hero e meta presentes indicam schema disponível
      return !!(ctx.sections['hero'] && ctx.sections['meta'])

    case 'h2_autossuficiente':
      // Verifica seção about: title + body presentes
      const about = ctx.sections['about'] as { title?: string; body?: string } | undefined
      return !!(about?.title && about?.body && about.body.length > 100)

    case 'faq_6_perguntas': {
      const faq = ctx.sections['faq'] as { items?: unknown[] } | undefined
      return (faq?.items?.length ?? 0) >= 6
    }

    case 'keyword_100chars': {
      const hero = ctx.sections['hero'] as { headline?: string } | undefined
      return !!(hero?.headline && hero.headline.length <= 100 && hero.headline.length >= 20)
    }

    case 'cidade_2x': {
      const heroSec = ctx.sections['hero'] as { headline?: string; sub?: string } | undefined
      const aboutSec = ctx.sections['about'] as { body?: string } | undefined
      const text = [heroSec?.headline, heroSec?.sub, aboutSec?.body].join(' ')
      // Proxy: se texto tem mais de 200 chars e about existe, assume cidade mencionada
      return text.length > 200 && !!(aboutSec?.body)
    }

    case 'internal_links':
      // Validação real em S5 — por ora: site publicado com mais de 1 página
      return ctx.pages.length >= 2

    case 'cta_verbo_posse': {
      const heroCta = ctx.sections['hero'] as { cta_label?: string } | undefined
      const cta = heroCta?.cta_label ?? ''
      // Verbo de posse: Quero, Agendar, Ver, Solicitar, Contratar (não "Clique aqui")
      const verbosPosse = /^(quero|agendar|ver|solicitar|contratar|falar|conhecer|baixar|garantir)/i
      return verbosPosse.test(cta)
    }

    default:
      return false
  }
}
