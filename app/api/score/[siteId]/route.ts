import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { saveScoreSnapshot } from '@/lib/score/history'

export const runtime = 'nodejs'

// Regras SEO/GEO/AEO/EEAT — hardcoded aqui, peso pode vir de score_rules no banco
const RULES = [
  // SEO
  { key: 'keyword_100chars',    label: 'Keyword primária nos primeiros 100 chars',   pillar: 'seo',  weight: 10, fix: 'Inclua a keyword principal no headline ou subtítulo do hero.' },
  { key: 'cidade_2x',           label: 'Cidade mencionada 2x por 200 palavras',      pillar: 'seo',  weight: 10, fix: 'Mencione a cidade pelo menos 2x no hero e na seção Sobre.' },
  { key: 'h2_autossuficiente',  label: 'Seções com resposta direta na primeira frase', pillar: 'seo', weight: 15, fix: 'Cada seção deve começar com uma frase autossuficiente de ≤25 palavras.' },
  { key: 'json_ld_schema',      label: 'JSON-LD schema presente',                    pillar: 'seo',  weight: 15, fix: 'Gere o site novamente — o schema é inserido automaticamente na publicação.' },
  // GEO
  { key: 'robots_ai_bots',      label: 'robots.txt libera bots de IA',               pillar: 'geo',  weight: 10, fix: 'Publique o site — o robots.txt com permissão a GPTBot, ClaudeBot etc. é gerado automaticamente.' },
  { key: 'internal_links',      label: 'Toda página tem ≥2 links internos',          pillar: 'geo',  weight: 15, fix: 'Crie ao menos 2 artigos de blog e os vincule à home para fechar o grafo de links.' },
  // AEO
  { key: 'faq_6_perguntas',     label: 'FAQ com 6+ perguntas na home',               pillar: 'aeo',  weight: 15, fix: 'Adicione mais perguntas na seção FAQ até atingir pelo menos 6 itens.' },
  { key: 'cta_verbo_posse',     label: 'CTAs com verbo de posse',                    pillar: 'aeo',  weight: 10, fix: 'Troque "Clique aqui" por verbos de ação como "Quero agendar" ou "Ver serviços".' },
  // EEAT
  { key: 'eeat_autor',          label: 'Negócio identificado com nome e credencial', pillar: 'eeat', weight: 10, fix: 'Adicione o nome do responsável e a credencial (CRM, OAB, CREA etc.) na seção Sobre.' },
  { key: 'eeat_anos_exp',       label: 'Experiência declarada (anos de atuação)',    pillar: 'eeat', weight: 5,  fix: 'Mencione há quantos anos o negócio atua no onboarding — isso aparece no site.' },
  { key: 'eeat_faq_presente',   label: 'FAQ demonstra expertise do nicho',           pillar: 'eeat', weight: 10, fix: 'A FAQ precisa ter 6+ perguntas técnicas do nicho — não apenas "como funciona?".' },
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
    supabase.from('sites').select('id,domain,status,tenant_id').eq('id', siteId).single(),
    supabase.from('pages').select('id,slug,title,meta_description').eq('site_id', siteId),
    supabase.from('sections').select('section_type,content,page_id').in(
      'page_id',
      (await supabase.from('pages').select('id').eq('site_id', siteId)).data?.map(p => p.id) ?? []
    ),
  ])

  if (!site) return Response.json({ error: 'Site não encontrado' }, { status: 404 })

  // AEO Regra 7 — conta links internos reais (não usa nº de páginas como proxy).
  const { count: internalLinkCount } = await supabase
    .from('internal_links')
    .select('id', { count: 'exact', head: true })
    .eq('site_id', siteId)

  const homeSection = (sections ?? []).reduce<Record<string, unknown>>((acc, s) => {
    acc[s.section_type] = s.content
    return acc
  }, {})

  // Avalia cada regra
  const evaluated = RULES.map(rule => {
    const passed = evaluateRule(rule.key, { site, pages: pages ?? [], sections: homeSection, internalLinks: internalLinkCount ?? 0 })
    return {
      rule_key: rule.key,
      description: rule.label,
      pillar: rule.pillar,
      fix: rule.fix,
      score: passed ? 100 : 0,
      passed,
    }
  })

  // Calcula scores por pilar com pesos
  const totalWeight = RULES.reduce((sum, r) => sum + r.weight, 0)
  const weightedScore = evaluated.reduce((sum, r, i) => {
    return sum + (r.passed ? RULES[i]!.weight : 0)
  }, 0)
  const overall = Math.round((weightedScore / totalWeight) * 100)

  const seo  = calcPillarScore(evaluated, RULES, 'seo')
  const geo  = calcPillarScore(evaluated, RULES, 'geo')
  const aeo  = calcPillarScore(evaluated, RULES, 'aeo')
  const eeat = calcPillarScore(evaluated, RULES, 'eeat')

  // Congela o ponto de hoje no histórico. O site veio de uma query com RLS,
  // então o tenant_id aqui é o do dono de verdade. Não bloqueia a resposta.
  await saveScoreSnapshot({
    siteId,
    tenantId: (site.tenant_id as string | null) ?? '',
    overall, seo, geo, aeo, eeat,
    failing: evaluated.filter(r => !r.passed).map(r => r.rule_key),
  })

  return Response.json({
    overall,
    seo,
    geo,
    aeo,
    eeat,
    rules: evaluated,
    calculated_at: new Date().toISOString(),
  })
}

function calcPillarScore(
  evaluated: { rule_key: string; passed: boolean }[],
  rules: { key: string; pillar: string; weight: number }[],
  pillar: string
) {
  const pillarRules = rules.filter(r => r.pillar === pillar)
  if (pillarRules.length === 0) return 0
  const totalW = pillarRules.reduce((s, r) => s + r.weight, 0)
  const passedW = pillarRules.reduce((s, r) => {
    const ev = evaluated.find(e => e.rule_key === r.key)
    return s + (ev?.passed ? r.weight : 0)
  }, 0)
  return Math.round((passedW / totalW) * 100)
}

type EvalContext = {
  site: { domain: string | null; status: string }
  pages: { title: string | null; meta_description: string | null }[]
  sections: Record<string, unknown>
  internalLinks: number
}

function evaluateRule(key: string, ctx: EvalContext): boolean {
  switch (key) {
    case 'robots_ai_bots':
      return ctx.site.status === 'published'

    case 'json_ld_schema':
      return !!(ctx.sections['hero'] && ctx.sections['meta'])

    case 'h2_autossuficiente': {
      const about = ctx.sections['about'] as { title?: string; body?: string } | undefined
      return !!(about?.title && about?.body && about.body.length > 100)
    }

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
      return text.length > 200 && !!(aboutSec?.body)
    }

    case 'internal_links':
      // Grafo real: precisa de pelo menos 2 links internos registrados (Regra 7).
      return ctx.internalLinks >= 2

    case 'cta_verbo_posse': {
      const heroCta = ctx.sections['hero'] as { cta_label?: string } | undefined
      const cta = heroCta?.cta_label ?? ''
      const verbosPosse = /^(quero|agendar|ver|solicitar|contratar|falar|conhecer|baixar|garantir)/i
      return verbosPosse.test(cta)
    }

    // EEAT
    case 'eeat_autor': {
      const about = ctx.sections['about'] as { body?: string; credentials?: string } | undefined
      return !!(about?.body && about.body.length > 50 && about.credentials)
    }

    case 'eeat_anos_exp': {
      const about = ctx.sections['about'] as { years_experience?: number } | undefined
      return (about?.years_experience ?? 0) > 0
    }

    case 'eeat_faq_presente': {
      const faq = ctx.sections['faq'] as { items?: unknown[] } | undefined
      return (faq?.items?.length ?? 0) >= 6
    }

    default:
      return false
  }
}
