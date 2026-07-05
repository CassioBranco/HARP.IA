'use client'

// ============================================================
// Aplica no DOM a estrutura salva das seções — ordem (order_index),
// ocultas (content._hidden) e duplicadas — SEM refatorar os 10
// layouts fixos: identifica os blocos por casamento de texto
// (tagSectionBlocks) e então esconde/reordena/clona.
// Roda no preview E no site publicado, pra que o que o dono vê no
// editor seja exatamente o que o visitante vê.
// Limite conhecido (Fase 1): a reordenação só vale entre blocos
// irmãos (mesmo pai no DOM) — hero dentro de <header> fica onde está.
// ============================================================

import { useEffect } from 'react'
import {
  SECTION_ATTR,
  VISUAL_SECTION_TYPES,
  tagSectionBlocks,
  type SectionSnapshot,
} from '@/lib/editor/inline-edit'

const CLONE_ATTR = 'data-anc-clone'

export default function SectionArrange({ sections }: { sections: SectionSnapshot[] }) {
  useEffect(() => {
    try {
      // idempotente (StrictMode roda o efeito 2x em dev): remove clones antigos
      document.querySelectorAll(`[${CLONE_ATTR}]`).forEach(el => el.remove())

      tagSectionBlocks(sections, document)

      const visual = sections.filter(s =>
        (VISUAL_SECTION_TYPES as readonly string[]).includes(s.section_type),
      )
      const visible = [...visual]
        .filter(s => !s.hidden)
        .sort((a, b) => a.order_index - b.order_index)

      // instâncias visíveis por tipo + posição (rank) do tipo na ordem salva
      const count = new Map<string, number>()
      const rank = new Map<string, number>()
      visible.forEach((s, i) => {
        count.set(s.section_type, (count.get(s.section_type) ?? 0) + 1)
        if (!rank.has(s.section_type)) rank.set(s.section_type, i)
      })

      const tagged = Array.from(document.querySelectorAll<HTMLElement>(`[${SECTION_ATTR}]`))
      const typesInDb = new Set(visual.map(s => s.section_type))

      // 1) ocultas: tipo existe no banco mas nenhuma instância visível
      for (const el of tagged) {
        const t = el.getAttribute(SECTION_ATTR) ?? ''
        if (typesInDb.has(t)) el.style.display = count.has(t) ? '' : 'none'
      }

      // 2) duplicadas: clona o bloco (o conteúdo é sincronizado entre as linhas
      // do mesmo tipo, então a cópia é sempre idêntica à original)
      for (const el of tagged) {
        const t = el.getAttribute(SECTION_ATTR) ?? ''
        const n = count.get(t) ?? 0
        for (let k = 1; k < n; k++) {
          const clone = el.cloneNode(true) as HTMLElement
          clone.setAttribute(CLONE_ATTR, '1')
          el.parentElement?.insertBefore(clone, el.nextSibling)
        }
      }

      // 3) ordem: reordena blocos irmãos conforme a ordem salva.
      const parents = new Set<HTMLElement>()
      document.querySelectorAll<HTMLElement>(`[${SECTION_ATTR}]`).forEach(el => {
        if (el.parentElement) parents.add(el.parentElement)
      })
      parents.forEach(parent => {
        const kids = Array.from(parent.children).filter(
          (c): c is HTMLElement => c.hasAttribute(SECTION_ATTR),
        )
        if (kids.length < 2) return
        const sorted = [...kids].sort((a, b) => {
          const ra = rank.get(a.getAttribute(SECTION_ATTR) ?? '') ?? 99
          const rb = rank.get(b.getAttribute(SECTION_ATTR) ?? '') ?? 99
          return ra - rb || kids.indexOf(a) - kids.indexOf(b)
        })
        if (sorted.every((el, i) => el === kids[i])) return
        // marca as "vagas" atuais e re-encaixa os blocos na nova ordem,
        // preservando o que existe entre eles (hr, figure etc.)
        const slots = kids.map(el => {
          const c = document.createComment('anc-slot')
          parent.insertBefore(c, el)
          return c
        })
        sorted.forEach((el, i) => {
          const slot = slots[i]
          if (slot) parent.insertBefore(el, slot)
        })
        slots.forEach(c => c.remove())
      })
    } catch {
      /* arranjo é progressivo — nunca quebra o site */
    }
  }, [sections])

  return null
}
