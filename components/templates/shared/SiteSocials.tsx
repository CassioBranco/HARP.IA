import type { SiteContent } from '@/lib/templates/example-content'
import type { PaletteColors } from '@/lib/templates/palettes'

// Botões de redes sociais + WhatsApp, flutuantes no canto inferior direito.
// Renderizado UMA vez pelo LayoutRenderer, então vale pros 10 layouts.
// Usa SVG inline (o site publicado não carrega a fonte de ícones Phosphor).

export type Socials = {
  instagram?: string
  facebook?: string
  whatsapp?: string
  tiktok?: string
  youtube?: string
  linkedin?: string
  site_externo?: string
}

// Normaliza handle/URL pra link absoluto da plataforma.
function urlFor(platform: keyof Socials, raw: string): string {
  const v = raw.trim()
  if (!v) return ''
  if (/^https?:\/\//i.test(v)) return v
  const handle = v.replace(/^@/, '').replace(/^\//, '')
  switch (platform) {
    case 'instagram': return `https://instagram.com/${handle}`
    case 'facebook':  return `https://facebook.com/${handle}`
    case 'tiktok':    return `https://tiktok.com/@${handle}`
    case 'youtube':   return `https://youtube.com/${handle}`
    case 'linkedin':  return `https://linkedin.com/in/${handle}`
    case 'whatsapp':  return `https://wa.me/${v.replace(/\D/g, '')}`
    default:          return `https://${v}`
  }
}

const PATHS: Record<string, string> = {
  whatsapp: 'M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2zm5.8 14.16c-.24.68-1.4 1.3-1.94 1.34-.5.05-1.13.07-1.82-.11-.42-.14-.96-.32-1.65-.62-2.9-1.25-4.8-4.17-4.94-4.36-.15-.19-1.19-1.58-1.19-3.01s.75-2.14 1.02-2.43c.27-.29.58-.36.78-.36.19 0 .39 0 .56.01.18.01.42-.07.66.5.24.59.83 2.02.9 2.17.07.14.12.31.02.5-.09.19-.14.31-.28.48-.14.17-.29.37-.42.5-.14.14-.28.29-.12.57.16.29.71 1.17 1.53 1.9 1.05.94 1.94 1.23 2.22 1.37.27.14.43.12.59-.07.16-.19.68-.79.86-1.07.18-.28.36-.23.61-.14.25.09 1.6.76 1.87.9.27.14.46.21.53.32.07.12.07.68-.17 1.36z',
  instagram: 'M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16zM12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63c-.79.3-1.46.72-2.12 1.38C1.36 2.67.94 3.34.63 4.14.33 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.3.79.72 1.46 1.38 2.12.66.66 1.33 1.08 2.12 1.38.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56.79-.3 1.46-.72 2.12-1.38.66-.66 1.08-1.33 1.38-2.12.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91a5.9 5.9 0 0 0-1.38-2.12A5.9 5.9 0 0 0 19.86.63c-.76-.3-1.64-.5-2.91-.56C15.67.01 15.26 0 12 0zm0 5.84A6.16 6.16 0 1 0 12 18.16 6.16 6.16 0 0 0 12 5.84zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.41-11.85a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z',
  facebook: 'M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.69.24 2.69.24v2.97h-1.52c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07z',
  tiktok: 'M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.3 0 .59.05.86.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 5.39 20.5a6.34 6.34 0 0 0 10.8-4.49v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.37-.44z',
  youtube: 'M23.5 6.2a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.51A3.02 3.02 0 0 0 .5 6.2C0 8.07 0 12 0 12s0 3.93.5 5.8a3.02 3.02 0 0 0 2.12 2.14c1.88.51 9.38.51 9.38.51s7.5 0 9.38-.51a3.02 3.02 0 0 0 2.12-2.14C24 15.93 24 12 24 12s0-3.93-.5-5.8zM9.6 15.6V8.4l6.2 3.6-6.2 3.6z',
  linkedin: 'M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zm1.78 13.02H3.56V9h3.56v11.45zM22.22 0H1.77C.8 0 0 .77 0 1.73v20.54C0 23.22.8 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z',
  site_externo: 'M12 0a12 12 0 1 0 0 24 12 12 0 0 0 0-24zm6.93 6h-2.95a15.7 15.7 0 0 0-1.38-3.56A8.03 8.03 0 0 1 18.93 6zM12 2.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM2.26 14a8 8 0 0 1 0-4h3.38a16.5 16.5 0 0 0 0 4H2.26zm.81 2h2.95c.3 1.27.76 2.47 1.38 3.56A8.03 8.03 0 0 1 3.07 16zm2.95-8H3.07a8.03 8.03 0 0 1 4.33-3.56A15.7 15.7 0 0 0 6.02 8zM12 21.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 16H9.66a14.7 14.7 0 0 1 0-4h4.68a14.7 14.7 0 0 1 0 4zm.27 5.56c.62-1.09 1.08-2.29 1.38-3.56h2.95a8.03 8.03 0 0 1-4.33 3.56zM18.36 14a16.5 16.5 0 0 0 0-4h3.38a8 8 0 0 1 0 4h-3.38z',
  // "G" do Google (Maps / Perfil de Empresa) — leva o visitante a ver e avaliar no Google
  google: 'M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47a5.4 5.4 0 0 1-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82zM12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09A11.99 11.99 0 0 0 12 24zM5.27 14.29A7.2 7.2 0 0 1 4.89 12c0-.8.14-1.57.38-2.29V6.62H1.29A11.99 11.99 0 0 0 0 12c0 1.94.46 3.77 1.29 5.38l3.98-3.09zM12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42A11.49 11.49 0 0 0 12 0 11.99 11.99 0 0 0 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z',
}
const COLORS: Record<string, string> = {
  whatsapp: '#25D366', instagram: '#E4405F', facebook: '#1877F2',
  tiktok: '#000000', youtube: '#FF0000', linkedin: '#0A66C2', site_externo: '#555',
  google: '#4285F4',
}
const LABELS: Record<string, string> = {
  whatsapp: 'WhatsApp', instagram: 'Instagram', facebook: 'Facebook',
  tiktok: 'TikTok', youtube: 'YouTube', linkedin: 'LinkedIn', site_externo: 'Site',
  google: 'Ver no Google',
}

export default function SiteSocials({ c }: { c: SiteContent; p?: PaletteColors }) {
  const s = (c.socials ?? {}) as Socials
  // WhatsApp também aceita o telefone do hero (c.whatsapp) como fallback.
  const wa = s.whatsapp || c.whatsapp || ''
  const order: (keyof Socials)[] = ['whatsapp', 'instagram', 'facebook', 'tiktok', 'youtube', 'linkedin', 'site_externo']
  const items: { k: string; href: string }[] = order
    .map((k) => ({ k, raw: k === 'whatsapp' ? wa : (s[k] ?? '') }))
    .filter((it) => it.raw && it.raw.trim())
    .map((it) => ({ k: it.k as string, href: urlFor(it.k, it.raw) }))
    .filter((it) => it.href)

  // Google Perfil de Empresa — botão pra ver/avaliar o negócio no Google.
  if (c.gbpLink) items.push({ k: 'google', href: c.gbpLink })

  if (items.length === 0) return null

  return (
    <div style={{
      position: 'fixed', right: '16px', bottom: '16px', zIndex: 9998,
      display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center',
    }}>
      {items.map(({ k, href }) => (
        <a
          key={k}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={LABELS[k]}
          title={LABELS[k]}
          style={{
            width: k === 'whatsapp' ? '52px' : '40px',
            height: k === 'whatsapp' ? '52px' : '40px',
            borderRadius: '50%',
            background: COLORS[k] ?? '#555',
            display: 'grid', placeItems: 'center',
            boxShadow: '0 6px 16px rgba(0,0,0,.22)',
            color: '#fff', textDecoration: 'none',
          }}
        >
          <svg viewBox="0 0 24 24" width={k === 'whatsapp' ? 28 : 20} height={k === 'whatsapp' ? 28 : 20} fill="currentColor" aria-hidden="true">
            <path d={PATHS[k]} />
          </svg>
        </a>
      ))}
    </div>
  )
}
