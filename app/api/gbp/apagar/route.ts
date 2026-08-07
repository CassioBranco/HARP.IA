// ============================================================
// ANCOREO — apagar um post do calendário do Google.
//
// Por que existe: o mês só pode ser remontado quando a agenda está
// vazia (senão dois cliques viram oito posts sem dono). Sem um jeito
// de tirar da agenda o post que não serve, essa trava vira uma parede:
// o cliente fica preso a um mês que não gostou até as datas passarem.
//
// Só apaga rascunho. Post já publicado no perfil é histórico e é a
// única fonte de cadência que temos — quem marcou por engano usa o
// "Não publiquei" em /api/gbp/publicado, que devolve o post pra
// rascunho, e só então pode apagar.
// ============================================================
import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const supabase = await createServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Não autorizado', { status: 401 })

  const body = await req.json().catch(() => null) as { post_id?: string } | null
  const postId = body?.post_id
  if (!postId) return Response.json({ error: 'post_id é obrigatório' }, { status: 400 })

  const { data: userData } = await supabase
    .from('users').select('tenant_id').eq('id', user.id).single()
  const tenantId = userData?.tenant_id as string | undefined
  if (!tenantId) return Response.json({ error: 'Conta sem tenant' }, { status: 403 })

  // O filtro por tenant é redundante com a RLS de propósito: se um dia
  // alguém afrouxar a policy, esta rota não vira porta aberta junto.
  const { data: apagado, error } = await supabase
    .from('gbp_posts')
    .delete()
    .eq('id', postId)
    .eq('tenant_id', tenantId)
    .is('published_at', null)
    .select('id')
    .maybeSingle()

  if (error) {
    return Response.json({ error: 'Não consegui apagar agora.', detail: error.message }, { status: 500 })
  }
  if (!apagado) {
    // Não distingue "não existe" de "já publicado" no status por segurança,
    // mas a mensagem cobre o caso real que o cliente vai encontrar.
    return Response.json({
      error: 'Não achei esse post na sua agenda. Se ele já está marcado como publicado, use "Não publiquei" antes de apagar.',
    }, { status: 404 })
  }

  return Response.json({ ok: true, id: apagado.id })
}
