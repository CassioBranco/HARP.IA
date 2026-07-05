// ============================================================
// Rate-limit anti-flood baseado no banco (serverless-safe).
// As rotas públicas anônimas (/api/leads, /api/booking) não têm estado entre
// invocações no Vercel, então contamos os inserts recentes DAQUELE site numa
// janela curta. Não é proteção criptográfica — é barreira contra flood/bot de
// baixo esforço, sem exigir infra nova nem guardar PII adicional (IP).
// ============================================================
import type { createAdminClient } from '@/lib/supabase/admin'

type Admin = ReturnType<typeof createAdminClient>

/**
 * true = já houve inserts demais nesta janela → a rota deve devolver 429.
 * Em erro de contagem, retorna false (não bloqueia envio legítimo por falha
 * de leitura — o insert em si ainda é validado depois).
 */
export async function tooManyRecent(
  admin: Admin,
  opts: { table: string; siteId: string; windowSec: number; max: number },
): Promise<boolean> {
  const since = new Date(Date.now() - opts.windowSec * 1000).toISOString()
  const { count, error } = await admin
    .from(opts.table)
    .select('id', { count: 'exact', head: true })
    .eq('site_id', opts.siteId)
    .gte('created_at', since)
  if (error) return false
  return (count ?? 0) >= opts.max
}
