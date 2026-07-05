// ============================================================
// Allowlist de HTML para o corpo de artigos do blog.
// O conteúdo pode vir de geração por IA e de edição do cliente, e é
// renderizado via dangerouslySetInnerHTML no site público — então tudo que
// NÃO estiver nesta lista é descartado. Bloqueia por construção:
// <script>, <iframe>/<object>/<embed>, handlers on*=..., URLs javascript:,
// e style inline. Links externos em nova aba não vazam a origem (rel seguro).
// Server-only (usa htmlparser2 do sanitize-html).
// ============================================================
import sanitizeHtml from 'sanitize-html'

const CONFIG: sanitizeHtml.IOptions = {
  allowedTags: [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p', 'a', 'ul', 'ol', 'li',
    'blockquote', 'strong', 'b', 'em', 'i', 'u', 's', 'del', 'ins',
    'code', 'pre', 'br', 'hr',
    'img', 'figure', 'figcaption',
    'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption', 'colgroup', 'col',
    'span', 'div', 'sup', 'sub', 'mark', 'small',
    'details', 'summary',
  ],
  allowedAttributes: {
    a: ['href', 'name', 'target', 'rel', 'title', 'id'],
    img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
    th: ['colspan', 'rowspan', 'scope'],
    td: ['colspan', 'rowspan'],
    col: ['span'],
    colgroup: ['span'],
    details: ['open'],
    '*': ['id', 'class'],
  },
  // Sem 'data:' — imagens do blog são hospedadas (https). javascript: fica de fora.
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowProtocolRelative: false,
  transformTags: {
    // Link que abre em nova aba não vaza a origem (evita tabnabbing).
    a: (tagName, attribs) => {
      if (attribs.target === '_blank') attribs.rel = 'noopener noreferrer'
      return { tagName, attribs }
    },
  },
}

/** Limpa HTML de artigo por allowlist. Vazio/undefined → string vazia. */
export function sanitizeBlogHtml(html: string | null | undefined): string {
  if (!html) return ''
  return sanitizeHtml(html, CONFIG)
}
