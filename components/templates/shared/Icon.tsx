import type { CSSProperties, ReactElement } from 'react'

// ════════════════════════════════════════════════════════════
// Icon — ícones SVG inline para os layouts publicados (sites dos clientes).
//
// Escolha deliberada vs. a fonte Phosphor usada no painel/editor: aqui cada
// ícone é SVG puro com `currentColor`, então NENHUMA fonte de ícones é
// carregada no site do cliente. Mantém a página leve (Core Web Vitals / SEO)
// e o ícone herda a cor do contexto. Renderiza no servidor (sem 'use client')
// — vira HTML estático, zero JS. O painel continua com Phosphor normalmente.
//
// Geometria em viewBox 0 0 24 24. Ícones de traço usam stroke=2 (Lucide-like);
// ícones cheios usam fill. Reutilizar em TODOS os layouts — não criar SVG solto.
// ════════════════════════════════════════════════════════════

export type IconName =
  | 'check'
  | 'star'
  | 'arrow-right'
  | 'arrow-down'
  | 'whatsapp'
  | 'phone'
  | 'chat'
  | 'envelope'
  | 'map-pin'
  | 'clock'
  | 'bolt'
  | 'x'
  | 'heart'
  | 'leaf'
  | 'book'
  | 'users'
  | 'award'

const ICONS: Record<IconName, { fill?: boolean; el: ReactElement }> = {
  check: { el: <path d="M20 6 9 17l-5-5" /> },
  'arrow-right': { el: <path d="M5 12h14M13 6l6 6-6 6" /> },
  'arrow-down': { el: <path d="M12 5v14M6 13l6 6 6-6" /> },
  x: { el: <path d="M18 6 6 18M6 6l12 12" /> },
  'map-pin': {
    el: (
      <>
        <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
      </>
    ),
  },
  clock: {
    el: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
  },
  envelope: {
    el: (
      <>
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
      </>
    ),
  },
  chat: { el: <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" /> },
  book: {
    el: (
      <>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </>
    ),
  },
  award: {
    el: (
      <>
        <circle cx="12" cy="8" r="6" />
        <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
      </>
    ),
  },
  users: {
    el: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
  },
  leaf: {
    el: (
      <>
        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
        <path d="M2 21c0-3 1.85-5.36 5.08-6" />
      </>
    ),
  },
  heart: {
    fill: true,
    el: <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />,
  },
  bolt: { fill: true, el: <path d="M13 2 4.5 13H11l-1 9 8.5-11H12z" /> },
  star: { fill: true, el: <path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.8 5.9 21.4l1.4-6.8L2.2 9.9l6.9-.8z" /> },
  phone: {
    fill: true,
    el: (
      <path d="M6.6 10.8a13.4 13.4 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.24 11 11 0 0 0 3.4.55 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11 11 0 0 0 .55 3.4 1 1 0 0 1-.24 1z" />
    ),
  },
  whatsapp: {
    fill: true,
    el: (
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347M12.05 21.785h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885M20.52 3.449C18.24 1.245 15.24 0 12.045 0 5.463 0 .104 5.358.101 11.892c0 2.096.549 4.14 1.595 5.945L0 24l6.335-1.652a11.978 11.978 0 0 0 5.71 1.454h.006c6.585 0 11.946-5.359 11.949-11.945a11.9 11.9 0 0 0-3.495-8.436" />
    ),
  },
}

export default function Icon({
  name,
  size = 20,
  style,
  className,
  title,
}: {
  name: IconName
  size?: number
  style?: CSSProperties
  className?: string
  /** rótulo acessível; quando ausente o ícone é decorativo (aria-hidden) */
  title?: string
}) {
  const def = ICONS[name]
  const stroke = !def.fill
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      style={{ display: 'inline-block', flex: 'none', verticalAlign: 'middle', ...style }}
      fill={def.fill ? 'currentColor' : 'none'}
      stroke={stroke ? 'currentColor' : 'none'}
      strokeWidth={stroke ? 2 : undefined}
      strokeLinecap={stroke ? 'round' : undefined}
      strokeLinejoin={stroke ? 'round' : undefined}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {title ? <title>{title}</title> : null}
      {def.el}
    </svg>
  )
}
