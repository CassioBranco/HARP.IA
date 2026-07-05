// ============================================================
// TOC automático do artigo público: extrai H2/H3 do HTML salvo,
// injeta id (âncora) em cada heading e devolve a lista pro sumário.
// Puro e sem dependências — id sai do slug (só [a-z0-9-], seguro
// pra injetar de volta no HTML sem risco de XSS).
// ============================================================

export type TocItem = { level: 2 | 3; text: string; id: string }

/** Slug de âncora: "Como funciona o serviço?" → "como-funciona-o-servico" */
export function slugifyAnchor(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 64) || 'secao'
}

/**
 * Varre os <h2>/<h3> do HTML: injeta id único em quem não tem
 * (preserva id existente) e monta a lista do sumário.
 */
export function buildToc(html: string): { html: string; items: TocItem[] } {
  const items: TocItem[] = []
  const used = new Map<string, number>()

  const out = html.replace(/<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi, (full, lvl: string, attrs: string, inner: string) => {
    const text = inner.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    if (!text) return full

    const existing = /\bid\s*=\s*["']([^"']+)["']/i.exec(attrs)
    let id = existing?.[1] ?? slugifyAnchor(text)
    if (!existing) {
      const n = used.get(id) ?? 0
      used.set(id, n + 1)
      if (n > 0) id = `${id}-${n + 1}` // heading repetido não duplica âncora
    }

    items.push({ level: lvl === '3' ? 3 : 2, text, id })
    return existing ? full : `<h${lvl}${attrs} id="${id}">${inner}</h${lvl}>`
  })

  return { html: out, items }
}
