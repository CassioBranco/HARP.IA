'use client'

// ============================================================
// ANCOREO — Contador de visitas do site publicado do cliente
// Dispara um site_view por página renderizada. Não identifica ninguém:
// quem é o dono da visita (tenant_id, site_id) é resolvido no servidor a
// partir do Host da requisição, dentro de /api/track. Aqui só vai o tipo
// de página. Respeita o opt-out (cookie aco_no_track) via lib/analytics/client.
// ============================================================

import { useEffect } from 'react'
import { track } from '@/lib/analytics/client'

export type SiteViewKind = 'home' | 'blog' | 'post' | 'loja' | 'produto'

export default function SiteAnalytics({ kind }: { kind: SiteViewKind }) {
  useEffect(() => {
    track('site_view', { kind })
  }, [kind])
  return null
}
