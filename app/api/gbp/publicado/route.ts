// ============================================================
// ANCOREO — "Já publiquei este post no meu perfil".
//
// Por que existe: sem API do Google, a única forma honesta de saber
// que o post foi ao ar é o dono dizer. Até 07/08/2026 não havia como
// dizer: `status: 'used'` estava no tipo e no CHECK do banco, e nada
// escrevia nele. Resultado: a cadência media a data em que a IA
// escreveu o rascunho e afirmava ao cliente que ele tinha postado.
//
// Este endpoint é a fonte de tudo que vem depois no pilar 5:
// cadência real, lembrete semanal e métrica de GBP.
//
// A RLS de gbp_posts (tenant_id = auth_tenant_id()) já isola por
// tenant, então o UPDATE não alcança post de outro cliente. O filtro
// por tenant abaixo é redundante de propósito: se um dia alguém
// afrouxar a policy, a rota não vira porta aberta junto.
// ============================================================
import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const supabase = await createServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Não autorizado', { status: 401 })

  const body = await req.json().catch(() => null) as
    | { post_id?: string; publicado?: boolean }
    | null
  const postId = body?.post_id
  if (!postId) return Response.json({ error: 'post_id é obrigatório' }, { status: 400 })

  // Desmarcar é permitido: clicou sem querer, ou colou e o Google recusou.
  // Sem o desfazer, o cliente fica com um dado errado que não tem como corrigir.
  const publicado = body?.publicado !== false

  const { data: userData } = await supabase
    .from('users').select('tenant_id').eq('id', user.id).single()
  const tenantId = userData?.tenant_id as string | undefined
  if (!tenantId) return Response.json({ error: 'Conta sem tenant' }, { status: 403 })

  // status e published_at andam juntos: o CHECK do banco recusa qualquer
  // combinação incoerente, então os dois mudam sempre na mesma escrita.
  const { data: updated, error } = await supabase
    .from('gbp_posts')
    .update({
      status: publicado ? 'used' : 'draft',
      published_at: publicado ? new Date().toISOString() : null,
    })
    .eq('id', postId)
    .eq('tenant_id', tenantId)
    .select('id, status, published_at')
    .maybeSingle()

  if (error) {
    return Response.json({ error: 'Não consegui registrar agora.', detail: error.message }, { status: 500 })
  }
  if (!updated) {
    return Response.json({ error: 'Post não encontrado ou sem acesso' }, { status: 404 })
  }

  return Response.json({ ok: true, post: updated })
}
