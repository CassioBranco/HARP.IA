import { MetadataRoute } from 'next'
import { headers } from 'next/headers'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://harp-ia.vercel.app'

function isAppHost(host: string): boolean {
  const h = (host.split(':')[0] ?? '').toLowerCase()
  if (h === 'localhost' || h === '127.0.0.1') return true
  if (h.endsWith('.vercel.app')) return true
  try { if (h === new URL(APP_URL).hostname.toLowerCase()) return true } catch { /* ignora */ }
  return false
}

// Bots de IA generativa — SEMPRE liberados (AEO Regra 1).
const AI_BOTS = [
  'GPTBot', 'OAI-SearchBot', 'ChatGPT-User',
  'Google-Extended', 'Anthropic-AI', 'ClaudeBot', 'Claude-Web',
  'PerplexityBot', 'Applebot-Extended', 'YouBot', 'cohere-ai',
]

// robots.txt host-aware: site publicado serve o seu; painel serve o do app.
export default async function robots(): Promise<MetadataRoute.Robots> {
  const host = (await headers()).get('host') ?? ''

  // ── Site publicado de cliente ────────────────────────────────────────────
  // Libera tudo (AEO Regra 1) e aponta o sitemap pro próprio host.
  if (host && !isAppHost(host)) {
    const hostname = host.split(':')[0] ?? host
    return {
      rules: [
        ...AI_BOTS.map(userAgent => ({ userAgent, allow: '/' })),
        { userAgent: '*', allow: '/' },
      ],
      sitemap: `https://${hostname}/sitemap.xml`,
    }
  }

  // ── Painel ANCOREO ──────────────────────────────────────────────────────────
  return {
    rules: [
      ...AI_BOTS.map(userAgent => ({ userAgent, allow: '/' })),
      { userAgent: '*', allow: '/', disallow: ['/api/', '/(dashboard)/'] },
    ],
    sitemap: `${APP_URL}/sitemap.xml`,
  }
}
