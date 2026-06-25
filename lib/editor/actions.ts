'use server'

// ============================================================
// ANCOREO — Server actions do editor
// Reordenação de seções (coluna reordenável do editor v2).
// RLS garante posse (sections → pages → sites → tenant do usuário).
// ============================================================

import { createServerClient } from '@/lib/supabase/server'

export interface ActionResult {
  ok: boolean
  error?: string
}

/**
 * Salva a nova ordem das seções de uma página.
 * `orderedSectionTypes` = lista de section_type na ordem desejada
 * (ex.: ['hero','about','services','faq',...]). order_index = posição.
 */
export async function reorderSections(
  pageId: string,
  orderedSectionTypes: string[]
): Promise<ActionResult> {
  const supabase = await createServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'unauthenticated' }

  for (let i = 0; i < orderedSectionTypes.length; i++) {
    const sectionType = orderedSectionTypes[i]
    if (!sectionType) continue
    const { error } = await supabase
      .from('sections')
      .update({ order_index: i })
      .eq('page_id', pageId)
      .eq('section_type', sectionType)
    if (error) return { ok: false, error: error.message }
  }

  return { ok: true }
}
