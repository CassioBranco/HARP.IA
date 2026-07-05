import Link from 'next/link'
import type { PublishedPost } from '@/lib/blog/posts'
import { buildToc } from '@/lib/blog/toc'
import { sanitizeBlogHtml } from '@/lib/blog/sanitize'

// Corpo do artigo. Cores/fonte das CSS vars do SiteShell (--st-*), então veste
// qualquer template. O conteúdo HTML já passou pelo gate de publicação.
// Automático (zero config): TOC quando há 3+ headings; acordeão de FAQ quando
// schema_faq tem perguntas completas. <details> nativo — sem JS no cliente.
export default function BlogArticle({ post }: { post: PublishedPost }) {
  // Sanitiza ANTES do TOC: allowlist mata qualquer HTML perigoso; o buildToc
  // só adiciona âncoras de slug seguro por cima do conteúdo já limpo.
  const { html, items } = buildToc(sanitizeBlogHtml(post.content))
  const faqs = (post.schema_faq ?? []).filter(
    f => (f?.question ?? '').trim().length > 0 && (f?.answer ?? '').trim().length > 0,
  )

  return (
    <article style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px 80px', lineHeight: 1.7 }}>
      {/* âncora do TOC não fica escondida atrás do header fixo */}
      <style>{`.ancoreo-article-body h2[id],.ancoreo-article-body h3[id]{scroll-margin-top:90px}`}</style>

      <h1 style={{ fontSize: '2rem', lineHeight: 1.2, margin: '0 0 24px', color: 'var(--st-primary)', fontFamily: 'var(--st-font-h, inherit)' }}>
        {post.title}
      </h1>

      {items.length >= 3 && (
        <details
          open
          style={{ margin: '0 0 32px', padding: '14px 18px', border: '1px solid color-mix(in srgb, var(--st-primary) 22%, transparent)', borderRadius: 12 }}
        >
          <summary style={{ cursor: 'pointer', fontWeight: 700, color: 'var(--st-primary)', fontFamily: 'var(--st-font-h, inherit)' }}>
            Neste artigo
          </summary>
          <nav aria-label="Sumário do artigo">
            <ol style={{ margin: '10px 0 0', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {items.map(it => (
                <li key={it.id} style={{ marginLeft: it.level === 3 ? 16 : 0, fontSize: it.level === 3 ? '.92rem' : '1rem' }}>
                  <a href={`#${it.id}`} style={{ color: 'inherit', textDecoration: 'underline', textDecorationColor: 'color-mix(in srgb, var(--st-primary) 45%, transparent)' }}>
                    {it.text}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </details>
      )}

      <div className="ancoreo-article-body" dangerouslySetInnerHTML={{ __html: html }} />

      {faqs.length > 0 && (
        <section aria-label="Perguntas frequentes" style={{ marginTop: 48 }}>
          <h2 style={{ fontSize: '1.4rem', color: 'var(--st-primary)', fontFamily: 'var(--st-font-h, inherit)', margin: '0 0 16px' }}>
            Perguntas frequentes
          </h2>
          {/* Texto puro renderizado pelo React (escapado) — FAQ nunca vira HTML */}
          {faqs.map((f, i) => (
            <details
              key={i}
              style={{ borderBottom: '1px solid color-mix(in srgb, var(--st-primary) 18%, transparent)', padding: '12px 0' }}
            >
              <summary style={{ cursor: 'pointer', fontWeight: 600 }}>{f.question}</summary>
              <p style={{ margin: '10px 0 4px' }}>{f.answer}</p>
            </details>
          ))}
        </section>
      )}

      <p style={{ marginTop: 56 }}>
        <Link href="/blog" style={{ color: 'var(--st-primary)', fontWeight: 600, textDecoration: 'none' }}>
          ← Ver todos os artigos
        </Link>
      </p>
    </article>
  )
}
