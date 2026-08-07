// ============================================================
// ANCOREO — POST /api/gbp/vincular · liga o Perfil de Empresa depois.
//
// Por que existe: o onboarding sempre disse "dá pra vincular depois, no
// painel", e o painel respondia "vincule no onboarding". Quem terminou o
// cadastro sem o perfil ficava girando entre as duas telas. Esta rota é o
// lado que faltava — a partir dela a frase do onboarding vira verdade.
//
// Conferir o link (abrir encurtador, pegar nome) é trabalho da rota
// /api/onboarding/gpe-resolver, que não escreve nada. Aqui só se grava,
// e só depois que o dono confirmou olhando o mapa.
// ============================================================
import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { lerLinkGpe, identificadorDoPerfil, problemaDoLink } from '@/lib/seo/gpe-link'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const supabase = await createServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Não autorizado', { status: 401 })

  const body = await req.json().catch(() => null) as { link?: string } | null
  const bruto = (body?.link ?? '').trim()
  if (!bruto) return Response.json({ error: 'link é obrigatório' }, { status: 400 })
  if (bruto.length > 2048) return Response.json({ error: 'Link grande demais.' }, { status: 400 })

  const leitura = lerLinkGpe(bruto)
  const problema = problemaDoLink(leitura)
  if (problema) return Response.json({ error: problema }, { status: 400 })

  const { data: userData } = await supabase
    .from('users').select('tenant_id').eq('id', user.id).single()
  const tenantId = userData?.tenant_id as string | undefined
  if (!tenantId) return Response.json({ error: 'Conta sem tenant' }, { status: 403 })

  // Uma conta pode ter mais de um perfil de cadastro (quem recomeçou o
  // onboarding). O painel lê o mais recente, então é nele que se grava.
  const { data: alvo } = await supabase
    .from('onboarding_profiles')
    .select('id')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (!alvo) {
    return Response.json({ error: 'Nenhum perfil de cadastro encontrado nesta conta.' }, { status: 404 })
  }

  // O perfil de onboarding é onde o resto do sistema procura o link
  // (build-site-content, /metrics, /gbp). Gravar em outro lugar seria
  // criar uma segunda verdade que ninguém lê.
  const { data: atualizado, error } = await supabase
    .from('onboarding_profiles')
    .update({
      gpe_modo: 'vincular',
      gpe_link: leitura.url,
      gbp_place_id: identificadorDoPerfil(leitura),
      updated_at: new Date().toISOString(),
    })
    .eq('id', alvo.id as string)
    .eq('tenant_id', tenantId)
    .select('id, gpe_link, gbp_place_id')
    .maybeSingle()

  if (error) {
    return Response.json({ error: 'Não consegui salvar agora.', detail: error.message }, { status: 500 })
  }
  if (!atualizado) {
    return Response.json({ error: 'Perfil de cadastro fora do alcance desta conta.' }, { status: 404 })
  }

  return Response.json({ ok: true, perfil: atualizado })
}
