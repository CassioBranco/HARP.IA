import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

// ============================================================
// GET /api/onboarding/segments?q=dent
// Autocomplete de segmento (Tela 3). Busca em niche_taxonomy.
// Retorna o flag `regulado` + dados do conselho pra UI decidir
// se mostra o campo de registro profissional (CRO, OAB, CRM…).
// ============================================================

interface SegmentResult {
  profissao_key: string
  label: string
  setor: string
  regulado: boolean
  conselho: string | null
  doc_label: string | null
  restricao: string | null
}

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get('q') ?? '').trim()

  const supabase = await createServerClient()

  let query = supabase
    .from('niche_taxonomy')
    .select('profissao_key, label, setor, regulado, conselho, doc_label, restricao')
    .eq('is_active', true)
    .order('ordem', { ascending: true })
    .limit(100)

  // O catálogo é pequeno (≈56). O cliente carrega tudo uma vez e filtra
  // sem acento (PT-BR). Mantemos o filtro por q como atalho/compat.
  // Sanitiza chars que têm significado na sintaxe de filtro do PostgREST.
  const safe = q.replace(/[,()*%\\]/g, '').slice(0, 60)
  if (safe.length >= 2) {
    query = query.or(`label.ilike.%${safe}%,profissao_key.ilike.%${safe}%`)
  }

  const { data, error } = await query

  if (error) {
    return Response.json({ error: 'Falha ao buscar segmentos' }, { status: 500 })
  }

  const results = (data ?? []) as SegmentResult[]
  return Response.json({ results }, {
    headers: { 'Cache-Control': 'public, max-age=300' },
  })
}
