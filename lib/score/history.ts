// ============================================================
// ANCOREO — Histórico do score (score_snapshots)
// Grava 1 ponto por site por dia e lê a série pro painel.
//
// Tudo aqui é tolerante à tabela ausente: enquanto a migration
// 20260805120000_score_snapshots.sql não for aplicada, gravar vira no-op e
// ler devolve série vazia. O score do dia continua funcionando sem histórico.
// ============================================================

import { createAdminClient } from '@/lib/supabase/admin'

export type ScorePoint = {
  day: string
  overall: number
  seo: number
  geo: number
  aeo: number
  eeat: number
}

export type ScoreSnapshotInput = Omit<ScorePoint, 'day'> & {
  siteId: string
  tenantId: string
  /** rule_keys que falharam hoje */
  failing: string[]
}

function todayUTC(): string {
  return new Date().toISOString().slice(0, 10)
}

/**
 * Regrava o ponto de hoje. Chamado a cada cálculo de score — por isso é upsert
 * em (site_id, day) e não insert: o painel abre várias vezes por dia e a série
 * precisa continuar com um ponto por dia.
 */
export async function saveScoreSnapshot(input: ScoreSnapshotInput): Promise<void> {
  if (!input.siteId || !input.tenantId) return
  try {
    const admin = createAdminClient()
    await admin.from('score_snapshots').upsert(
      {
        site_id: input.siteId,
        tenant_id: input.tenantId,
        day: todayUTC(),
        overall: input.overall,
        seo: input.seo,
        geo: input.geo,
        aeo: input.aeo,
        eeat: input.eeat,
        failing: input.failing,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'site_id,day' },
    )
  } catch {
    /* histórico é acessório — nunca derruba o cálculo do score */
  }
}

/**
 * Série dos últimos `days` dias, do mais antigo pro mais recente.
 * Usa admin client porque roda em Server Component do painel, onde o siteId
 * já foi resolvido pelo tenant do usuário logado.
 */
export async function getScoreHistory(siteId: string, days = 90): Promise<ScorePoint[]> {
  if (!siteId) return []
  try {
    const admin = createAdminClient()
    const since = new Date(Date.now() - days * 86400_000).toISOString().slice(0, 10)
    const { data, error } = await admin
      .from('score_snapshots')
      .select('day, overall, seo, geo, aeo, eeat')
      .eq('site_id', siteId)
      .gte('day', since)
      .order('day', { ascending: true })
    if (error || !data) return []
    return data.map(r => ({
      day: r.day as string,
      overall: Number(r.overall),
      seo: Number(r.seo),
      geo: Number(r.geo),
      aeo: Number(r.aeo),
      eeat: Number(r.eeat),
    }))
  } catch {
    return []
  }
}
