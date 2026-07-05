// ============================================================
// ANCOREO — Edição inline no preview (Fase 1 do editor visual)
// Contrato compartilhado entre o EDITOR (parent) e o IFRAME do
// preview: tipos das mensagens postMessage, mapa de campos
// editáveis de cada seção e helpers de leitura/escrita/sanitização.
// Sem React aqui — o módulo é usado dos dois lados da ponte
// (e também pelo SectionArrange, que roda no site publicado).
// ============================================================

/** Tipos de seção que aparecem visualmente no site (exclui 'meta', que é SEO). */
export const VISUAL_SECTION_TYPES = ['hero', 'about', 'services', 'testimonials', 'faq'] as const
export type VisualSectionType = (typeof VISUAL_SECTION_TYPES)[number]

export const SECTION_TYPE_LABELS: Record<string, string> = {
  hero: 'Hero (cabeçalho)',
  about: 'Sobre o negócio',
  services: 'Serviços',
  testimonials: 'Depoimentos',
  faq: 'Perguntas frequentes',
}

export type SectionContent = Record<string, unknown>

// ── Imagem editável (Fase 2: drag-n-drop) ───────────────────
/** Seções cujo `content.image` é persistido E renderizado pelos layouts
 *  (vira heroImage/aboutImage no buildSiteContent) — únicos alvos de drop.
 *  Espelha os SLOTS do painel Imagens (ImageUploader). */
export const IMAGE_SECTION_TYPES = ['hero', 'about'] as const

/** Limite do fluxo de upload existente ("máx 10 MB" no painel Imagens). */
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024

export type ImageFileIssue = 'type' | 'size'

/** Valida um arquivo de imagem ANTES do upload (roda no iframe e de novo
 *  no editor — não se confia no que atravessa a ponte). */
export function validateImageFile(file: File): ImageFileIssue | null {
  if (!file.type.startsWith('image/')) return 'type'
  if (file.size > MAX_IMAGE_BYTES) return 'size'
  return null
}

/** Snapshot de uma linha de `sections` que trafega editor ↔ iframe. */
export type SectionSnapshot = {
  id: string
  section_type: string
  order_index: number
  /** seção "removida" pelo dono = oculta (content._hidden), sem apagar o conteúdo */
  hidden: boolean
  content: SectionContent
}

// ── Mensagens (postMessage) ─────────────────────────────────
// Ambos os lados validam e.origin === window.location.origin e o
// e.source esperado antes de processar qualquer mensagem.

/** iframe (preview) → editor */
export type PreviewToEditorMsg =
  | { source: 'ancoreo-preview'; type: 'ready' }
  | { source: 'ancoreo-preview'; type: 'text-change'; sectionType: string; field: string; value: string }
  | { source: 'ancoreo-preview'; type: 'text-commit'; sectionType: string; field: string; value: string }
  | { source: 'ancoreo-preview'; type: 'section-op'; op: 'move-up' | 'move-down' | 'duplicate' | 'remove'; sectionType: string }
  | { source: 'ancoreo-preview'; type: 'section-add'; sectionType: string }
  // Fase 2 — o File atravessa a ponte por structured clone; o UPLOAD acontece
  // no editor (quem tem a sessão do dono), nunca aqui.
  | { source: 'ancoreo-preview'; type: 'image-drop'; sectionType: string; file: File }
  | { source: 'ancoreo-preview'; type: 'image-reject'; reason: ImageFileIssue }
  // Fase 2 — nova ordem COMPLETA das seções visíveis (section_type, com
  // repetição pra duplicatas), calculada após o arraste entre irmãos.
  | { source: 'ancoreo-preview'; type: 'section-reorder'; order: string[] }

/** editor → iframe (preview) */
export type EditorToPreviewMsg =
  | { source: 'ancoreo-editor'; type: 'init'; sections: SectionSnapshot[] }
  | { source: 'ancoreo-editor'; type: 'apply-content'; sectionType: string; content: SectionContent }
  // Fase 2 — feedback do upload no drop-target: spinner enquanto sobe,
  // troca do src na hora quando termina (url = webp_url final).
  | { source: 'ancoreo-editor'; type: 'image-status'; sectionType: string; status: 'uploading' | 'done' | 'error'; url?: string }

// ── Eventos DOM (mesma janela) que sincronizam painel ↔ ponte ──
/** hook do editor → SectionEditor (aba Textos): conteúdo mudou via edição inline */
export const EVT_INLINE_CONTENT = 'anc:inline-content'
/** SectionEditor → hook do editor: painel salvou; espelhar no preview sem reload */
export const EVT_PANEL_SAVED = 'anc:panel-saved'

// ── Atributos usados pra marcar o DOM do preview ────────────
export const SECTION_ATTR = 'data-anc-section'
export const FIELD_ATTR = 'data-anc-field'
/** img que aceita drop de arquivo (valor = section_type do slot) */
export const IMG_ATTR = 'data-anc-img'

// ── Campos editáveis inline (espelham o SectionEditor) ──────

export type InlineField = { field: string; value: string; multiline: boolean }

const asStr = (v: unknown): string => (typeof v === 'string' ? v : '')

/**
 * Lista os campos de texto editáveis de uma seção com seus valores atuais.
 * `field` usa caminho simples: 'headline' ou 'items.2.name'.
 */
export function listInlineFields(sectionType: string, content: SectionContent): InlineField[] {
  const out: InlineField[] = []
  const push = (field: string, value: unknown, multiline = false) => {
    const v = asStr(value).trim()
    if (v.length >= 2) out.push({ field, value: v, multiline })
  }
  const items = Array.isArray(content.items) ? (content.items as unknown[]) : []

  switch (sectionType) {
    case 'hero':
      push('headline', content.headline)
      push('sub', content.sub, true)
      push('cta_label', content.cta_label)
      break
    case 'about':
      push('title', content.title)
      push('body', content.body, true)
      push('credential', content.credential)
      break
    case 'services':
      items.forEach((it, i) => {
        const o = (it ?? {}) as Record<string, unknown>
        push(`items.${i}.name`, o.name)
        push(`items.${i}.description`, o.description, true)
      })
      break
    case 'testimonials':
      items.forEach((it, i) => {
        const o = (it ?? {}) as Record<string, unknown>
        push(`items.${i}.name`, o.name)
        push(`items.${i}.text`, o.text, true)
      })
      break
    case 'faq':
      items.forEach((it, i) => {
        const o = (it ?? {}) as Record<string, unknown>
        push(`items.${i}.question`, o.question)
        push(`items.${i}.answer`, o.answer, true)
      })
      break
  }
  return out
}

const ITEM_PATH = /^items\.(\d+)\.(\w+)$/

/** Lê o valor atual de um campo pelo caminho ('headline' ou 'items.2.name'). */
export function getInlineField(content: SectionContent, field: string): string | null {
  const m = ITEM_PATH.exec(field)
  if (m) {
    const items = Array.isArray(content.items) ? (content.items as unknown[]) : []
    const item = items[Number(m[1])] as Record<string, unknown> | undefined
    const v = item?.[m[2] ?? '']
    return typeof v === 'string' ? v : null
  }
  const v = content[field]
  return typeof v === 'string' ? v : null
}

/** Escreve um campo pelo caminho, sem mutar o objeto original. */
export function setInlineField(content: SectionContent, field: string, value: string): SectionContent {
  const m = ITEM_PATH.exec(field)
  if (m) {
    const idx = Number(m[1])
    const key = m[2] ?? ''
    const items = Array.isArray(content.items) ? [...(content.items as unknown[])] : []
    const cur = (items[idx] ?? {}) as Record<string, unknown>
    items[idx] = { ...cur, [key]: value }
    return { ...content, items }
  }
  return { ...content, [field]: value }
}

/**
 * Sanitiza texto vindo do contenteditable: só texto puro (o bridge já lê
 * innerText, sem tags), sem chars de controle, sem < >, com limite de tamanho.
 * Campos de linha única têm quebras de linha colapsadas em espaço.
 */
export function sanitizeInlineText(raw: string, multiline: boolean): string {
  let t = String(raw)
    .replace(/[<>]/g, '')
    .replace(/\u00a0/g, ' ')
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '')
  t = multiline ? t.replace(/\n{3,}/g, '\n\n') : t.replace(/\s*\n+\s*/g, ' ')
  return t.trim().slice(0, 4000)
}

/** Conteúdo inicial (placeholder em PT-BR) ao adicionar uma seção nova. */
export function defaultSectionContent(sectionType: string): SectionContent {
  switch (sectionType) {
    case 'hero':
      return { headline: 'Seu título principal aqui', sub: 'Escreva um subtítulo curto apresentando o negócio.', cta_label: 'Fale conosco' }
    case 'about':
      return { title: 'Sobre nós', body: 'Conte aqui a história do seu negócio.', credential: '' }
    case 'services':
      return { items: [{ name: 'Novo serviço', description: 'Descreva este serviço em uma ou duas frases.' }] }
    case 'testimonials':
      return { items: [{ name: 'Nome do cliente', text: 'Depoimento do cliente sobre o seu trabalho.', rating: 5 }] }
    case 'faq':
      return { items: [{ question: 'Pergunta frequente?', answer: 'Resposta objetiva e completa.' }] }
    default:
      return {}
  }
}

// ── Identificação dos blocos de seção no DOM ────────────────
// Os 10 layouts são composições fixas (não renderizam uma lista de
// sections), então o bloco de cada seção é identificado por casamento
// de texto: o elemento cujo texto bate com um campo da seção "vota"
// no bloco ancestral. Campos fracos (cta_label/credential) aparecem
// em nav/rodapé e não definem bloco sozinhos (peso 0).

const FIELD_WEIGHT: Record<string, number> = {
  headline: 3,
  sub: 2,
  body: 2,
  title: 2,
  cta_label: 0,
  credential: 0,
}

const TEXT_CANDIDATES =
  'h1,h2,h3,h4,h5,h6,p,li,a,button,span,summary,cite,blockquote,figcaption,em,strong,b,div'

/**
 * Marca os blocos de seção do documento com data-anc-section="tipo".
 * Idempotente. Usada pelo SectionArrange (preview E site publicado);
 * o PreviewBridge reaproveita as marcas pra seleção/toolbar.
 */
export function tagSectionBlocks(sections: SectionSnapshot[], doc: Document): void {
  // índice texto → elementos (fora de nav/rodapé)
  const textIndex = new Map<string, HTMLElement[]>()
  doc.querySelectorAll<HTMLElement>(TEXT_CANDIDATES).forEach(el => {
    if (el.closest('nav,footer')) return
    const t = (el.textContent ?? '').trim()
    if (t.length < 2 || t.length > 2000) return
    const arr = textIndex.get(t)
    if (arr) arr.push(el)
    else textIndex.set(t, [el])
  })

  const scores = new Map<HTMLElement, Map<string, number>>()
  for (const s of sections) {
    if (!(VISUAL_SECTION_TYPES as readonly string[]).includes(s.section_type)) continue
    for (const f of listInlineFields(s.section_type, s.content)) {
      const weight = f.field.startsWith('items.') ? 1 : (FIELD_WEIGHT[f.field] ?? 1)
      if (weight === 0) continue
      const els = textIndex.get(f.value)
      if (!els) continue
      for (const el of els) {
        const block = el.closest<HTMLElement>('section, header, figure')
        if (!block) continue
        const m = scores.get(block) ?? new Map<string, number>()
        m.set(s.section_type, (m.get(s.section_type) ?? 0) + weight)
        scores.set(block, m)
      }
    }
  }

  scores.forEach((m, block) => {
    let best: string | null = null
    let bestScore = 0
    m.forEach((v, k) => {
      if (v > bestScore) { bestScore = v; best = k }
    })
    if (best && bestScore >= 1) block.setAttribute(SECTION_ATTR, best)
  })
}
