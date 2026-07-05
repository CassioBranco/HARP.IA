'use client'

// Preview ao vivo de como o artigo aparece fora do site:
//  (a) resultado do Google (title truncado em 60 + URL + meta em 160);
//  (b) resposta de IA (primeiro parágrafo + primeira pergunta da FAQ).
// 100% derivado do que já está digitado — zero configuração.
import { firstParagraph, TITLE_MAX, META_MAX, type FaqItem } from '@/lib/seo/score'

function truncate(s: string, max: number): string {
  const t = s.trim()
  return t.length <= max ? t : `${t.slice(0, max - 1).trimEnd()}…`
}

export default function SnippetPreview({
  domain,
  slug,
  title,
  meta,
  content,
  faq,
}: {
  domain: string
  slug: string
  title: string
  meta: string
  content: string
  faq: FaqItem[]
}) {
  const serpTitle = truncate(title || 'Título do artigo', TITLE_MAX)
  const serpMeta = truncate(meta || 'O resumo (meta description) aparece aqui…', META_MAX)
  const intro = firstParagraph(content)
  const firstFaq = faq.find(f => f.question.trim() && f.answer.trim())

  return (
    <div className="glass side-card">
      <h3><i className="ph-duotone ph-magnifying-glass" /> Como vão te encontrar</h3>

      {/* (a) resultado no Google */}
      <div className="serp-prev">
        <div className="serp-url">
          <i className="ph-fill ph-globe-simple" /> {domain} <span>› blog › {slug}</span>
        </div>
        <div className="serp-title">{serpTitle}</div>
        <div className="serp-desc">{serpMeta}</div>
      </div>

      {/* (b) resposta de IA (GEO/AEO) */}
      <div className="aians-prev">
        <div className="aians-head"><i className="ph-fill ph-sparkle" /> Resposta de IA (ChatGPT, Gemini…)</div>
        {intro ? (
          <p className="aians-p">{truncate(intro, 260)}</p>
        ) : (
          <p className="aians-p empty">O primeiro parágrafo do artigo vira a base da resposta. Comece respondendo a pergunta do título.</p>
        )}
        {firstFaq && (
          <p className="aians-p faq">
            <b>{firstFaq.question}</b> {truncate(firstFaq.answer, 160)}
          </p>
        )}
      </div>
    </div>
  )
}
