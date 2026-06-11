import { MetadataRoute } from 'next'

// robots.txt do painel HARPIA — libera todos os bots de IA (AEO Regra 1)
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Bots de IA generativa — SEMPRE permitidos (AEO Regra 1)
      { userAgent: 'GPTBot',          allow: '/' },
      { userAgent: 'Google-Extended', allow: '/' },
      { userAgent: 'ClaudeBot',       allow: '/' },
      { userAgent: 'PerplexityBot',   allow: '/' },
      { userAgent: 'Applebot',        allow: '/' },
      { userAgent: 'YouBot',          allow: '/' },
      { userAgent: 'cohere-ai',       allow: '/' },
      // Crawlers gerais
      { userAgent: '*', allow: '/', disallow: ['/api/', '/(dashboard)/'] },
    ],
    sitemap: `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://harp-ia.vercel.app'}/sitemap.xml`,
  }
}
