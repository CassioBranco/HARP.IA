import { headers } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/admin'
import { hasSupabaseEnv } from '@/lib/env'
import { buildSiteContent, type BuiltSite } from '@/lib/templates/build-site-content'

// Host-aware: lê o host a cada request, sem cache estático de rota.
export const dynamic = 'force-dynamic'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://ancoreo.com.br'

function isAppHost(host: string): boolean {
  const h = (host.split(':')[0] ?? '').toLowerCase()
  if (h === 'localhost' || h === '127.0.0.1') return true
  if (h.endsWith('.vercel.app')) return true
  try { if (h === new URL(APP_URL).hostname.toLowerCase()) return true } catch { /* ignora */ }
  return false
}

function txt(body: string): Response {
  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      // 1h de cache no CDN: llms.txt muda só quando o cliente republica.
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}

// Escapa quebras de linha internas pra não estourar um bullet do llms.txt.
function oneLine(s: string | null | undefined): string {
  return (s ?? '').replace(/\s+/g, ' ').trim()
}

type PageRow = { slug: string; title: string | null; published?: boolean | null }
type PostRow = { slug: string; title: string | null; meta_description: string | null }

// llms.txt do SITE PUBLICADO de um cliente (AEO — versão básica, Regra 2 item 5).
// Curadoria: quem é o negócio + links úteis pras IAs entenderem rápido, sem
// precisar rastrear o site inteiro. Gerado 100% dos dados que o site já usa.
function buildTenantLlms(
  baseUrl: string,
  built: BuiltSite,
  pages: PageRow[],
  posts: PostRow[],
): string {
  const c = built.content
  const name = oneLine(c.businessName) || baseUrl.replace(/^https?:\/\//, '')

  // Resumo (blockquote): tagline real; senão frase mínima com cidade.
  const local = [c.city, c.state].filter(Boolean).join('/')
  const summary =
    oneLine(c.tagline) ||
    oneLine(c.heroSub) ||
    (local ? `Negócio em ${local}.` : `Site de ${name}.`)

  const lines: string[] = []
  lines.push(`# ${name}`)
  lines.push('')
  lines.push(`> ${summary}`)
  lines.push('')

  // Linha de contexto E-E-A-T (local, experiência, credenciais).
  const ctx: string[] = []
  if (local) ctx.push(local)
  if (c.yearsExperience && c.yearsExperience > 0) {
    ctx.push(`${c.yearsExperience} anos de experiência`)
  }
  const cred = oneLine(c.credential)
  if (cred) ctx.push(cred)
  if (ctx.length) {
    lines.push(ctx.join(' · '))
    lines.push('')
  }

  // ── Páginas ────────────────────────────────────────────────────────────────
  const pageList = (pages ?? []).filter(p => p.slug)
  if (pageList.length) {
    lines.push('## Páginas')
    for (const p of pageList) {
      const url = p.slug === 'home' ? `${baseUrl}/` : `${baseUrl}/${p.slug}`
      const label = oneLine(p.title) || (p.slug === 'home' ? 'Início' : p.slug)
      lines.push(`- [${label}](${url})`)
    }
    lines.push('')
  }

  // ── Serviços ─────────────────────────────────────────────────────────────
  const services = (c.services ?? []).filter(s => oneLine(s.name))
  if (services.length) {
    lines.push('## Serviços')
    for (const s of services) {
      const desc = oneLine(s.description)
      lines.push(desc ? `- ${oneLine(s.name)}: ${desc}` : `- ${oneLine(s.name)}`)
    }
    lines.push('')
  }

  // ── Blog ─────────────────────────────────────────────────────────────────
  const postList = (posts ?? []).filter(p => p.slug)
  if (postList.length) {
    lines.push('## Blog')
    for (const p of postList) {
      const label = oneLine(p.title) || p.slug
      const desc = oneLine(p.meta_description)
      const link = `- [${label}](${baseUrl}/blog/${p.slug})`
      lines.push(desc ? `${link}: ${desc}` : link)
    }
    lines.push('')
  }

  // ── Perguntas frequentes (AEO) ───────────────────────────────────────────
  const faqs = (c.faqs ?? []).filter(f => oneLine(f.question))
  if (faqs.length) {
    lines.push('## Perguntas frequentes')
    for (const f of faqs) {
      lines.push(`- ${oneLine(f.question)}`)
    }
    lines.push('')
  }

  // ── Contato ──────────────────────────────────────────────────────────────
  lines.push('## Contato')
  const whats = (c.whatsapp ?? '').replace(/\D/g, '')
  if (whats) lines.push(`- WhatsApp: https://wa.me/${whats}`)
  if (c.gbpLink) lines.push(`- Google Perfil de Empresa: ${c.gbpLink}`)
  lines.push(`- Site: ${baseUrl}`)
  lines.push('')

  return lines.join('\n')
}

// llms.txt mínimo quando o host não resolve pra um site publicado.
function fallbackLlms(baseUrl: string): string {
  return `# ${baseUrl.replace(/^https?:\/\//, '')}\n\n> Site publicado na plataforma ANCOREO.\n\n## Contato\n- Site: ${baseUrl}\n`
}

// llms.txt do PAINEL ANCOREO (ancoreo.com.br).
function appLlms(): string {
  const base = APP_URL.replace(/\/$/, '')
  return [
    '# ANCOREO',
    '',
    '> Plataforma que cria sites de PMEs otimizados para SEO, GEO e AEO — visíveis no Google e citáveis por IAs generativas (ChatGPT, Gemini, Perplexity).',
    '',
    '## Sobre',
    '- ANCOREO gera, hospeda e otimiza sites institucionais e lojas para pequenas e médias empresas.',
    '- Cada site publicado nasce com robots.txt liberando bots de IA, sitemap.xml e llms.txt próprios.',
    '',
    '## Links',
    `- [Início](${base}/)`,
    `- [Entrar](${base}/login)`,
    `- [Criar site](${base}/signup)`,
    '',
  ].join('\n')
}

export async function GET(): Promise<Response> {
  const host = (await headers()).get('host') ?? ''

  // ── Painel ou ambiente sem banco ────────────────────────────────────────
  if (!host || isAppHost(host) || !hasSupabaseEnv()) {
    return txt(appLlms())
  }

  // ── Site publicado: llms.txt DESTE domínio ──────────────────────────────
  const hostname = host.split(':')[0] ?? host
  const baseUrl = `https://${hostname}`

  try {
    const supabase = createAdminClient()

    const built = await buildSiteContent(supabase, { domain: hostname })
    if (!built) return txt(fallbackLlms(baseUrl))

    const siteId = built.content.siteId

    const [{ data: pages }, { data: posts }] = await Promise.all([
      supabase
        .from('pages')
        .select('slug, title, published')
        .eq('site_id', siteId)
        .eq('published', true),
      supabase
        .from('blog_posts')
        .select('slug, title, meta_description, published_at')
        .eq('site_id', siteId)
        .eq('status', 'published')
        .order('published_at', { ascending: false }),
    ])

    return txt(buildTenantLlms(baseUrl, built, (pages ?? []) as PageRow[], (posts ?? []) as PostRow[]))
  } catch {
    return txt(fallbackLlms(baseUrl))
  }
}
