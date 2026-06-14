import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getAnthropicClient, MODELS, friendlyAIError } from '@/lib/claude/client'

export const runtime = 'nodejs'
export const maxDuration = 30

// ============================================================
// POST /api/onboarding/analysis
// "Análise da presença online" da Tela 5 — RECURSO DE ASSINANTE.
// Gating: liberado só pra plano pro/agency. Usa Haiku (barato).
// Lê o perfil mais recente e devolve um diagnóstico estruturado.
// ============================================================

const PAID_PLANS = ['pro', 'agency']

interface AnalysisOutput {
  score: number
  pontos_fortes: string[]
  lacunas: string[]
  acoes: string[]
}

export async function POST(req: NextRequest) {
  const supabase = await createServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Não autorizado', { status: 401 })

  // ── Tenant + plano (gating de assinante) ──────────────────
  const { data: userData } = await supabase
    .from('users')
    .select('tenant_id, tenants(plan)')
    .eq('id', user.id)
    .single()

  const tenantId = userData?.tenant_id
  if (!tenantId) return new Response('Tenant não encontrado', { status: 403 })

  const plan = (userData?.tenants as unknown as { plan?: string } | null)?.plan ?? 'starter'
  if (!PAID_PLANS.includes(plan)) {
    return Response.json(
      { error: 'upgrade_required', message: 'A análise de presença é um recurso dos planos Pro e Agency.' },
      { status: 402 }
    )
  }

  // ── Perfil mais recente ───────────────────────────────────
  const { data: profile } = await supabase
    .from('onboarding_profiles')
    .select('business_name, profissao, niche, setor, city, state, gpe_modo, gpe_link')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!profile) return new Response('Perfil não encontrado', { status: 404 })

  const segmento = profile.profissao ?? profile.niche ?? profile.setor ?? 'negócio local'
  const local = [profile.city, profile.state].filter(Boolean).join(' - ') || 'cidade não informada'
  const gpe =
    profile.gpe_modo === 'vincular' && profile.gpe_link ? `Tem Google Perfil de Empresa: ${profile.gpe_link}` :
    profile.gpe_modo === 'criar' ? 'Vai criar um Google Perfil de Empresa agora.' :
    'Não tem Google Perfil de Empresa.'

  const prompt = `Você é um consultor de SEO local. Analise a presença online deste negócio e responda APENAS um JSON.

NEGÓCIO:
- Nome: ${profile.business_name ?? 'não informado'}
- Segmento: ${segmento}
- Localização: ${local}
- ${gpe}

Responda APENAS este JSON (sem texto fora dele):
{
  "score": número de 0 a 100 (maturidade da presença online),
  "pontos_fortes": [2 a 4 frases curtas do que já está bom],
  "lacunas": [2 a 4 frases curtas do que falta],
  "acoes": [3 a 5 ações práticas e específicas, verbo no infinitivo]
}
Regras: PT-BR direto, sem em-dash, sem gerundismo. Seja específico ao segmento e à cidade.`

  try {
    const anthropic = getAnthropicClient()
    const response = await anthropic.messages.create({
      model: MODELS.audit,
      max_tokens: 700,
      messages: [{ role: 'user', content: prompt }],
    })

    const raw = response.content[0]?.type === 'text' ? response.content[0].text : ''
    const match = raw.match(/\{[\s\S]*\}/)
    if (!match) return Response.json({ error: 'parse_failed' }, { status: 502 })

    const parsed = JSON.parse(match[0]) as AnalysisOutput
    return Response.json(parsed)
  } catch (err) {
    const friendly = friendlyAIError(err)
    return Response.json({ error: friendly.message }, { status: friendly.status })
  }
}
