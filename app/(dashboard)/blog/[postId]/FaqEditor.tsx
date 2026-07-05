'use client'

// Bloco "Perguntas frequentes" do editor de post (AEO/GEO).
// Campo estruturado (blog_posts.schema_faq): adicionar/remover pergunta
// na mão ou gerar 3-5 com IA a partir do conteúdo do artigo.
// Vira acordeão + FAQPage JSON-LD no artigo publicado, sem config.
import type { FaqItem } from '@/lib/seo/score'

export default function FaqEditor({
  faq,
  onChange,
  onGenerate,
  generating,
  canGenerate,
  genErr,
}: {
  faq: FaqItem[]
  onChange: (faq: FaqItem[]) => void
  onGenerate: () => void
  generating: boolean
  /** Precisa de conteúdo suficiente no artigo pra IA ter de onde tirar. */
  canGenerate: boolean
  genErr: string | null
}) {
  function patchItem(i: number, p: Partial<FaqItem>) {
    onChange(faq.map((f, j) => (j === i ? { ...f, ...p } : f)))
  }

  return (
    <div className="glass side-card faq-ed">
      <h3><i className="ph-duotone ph-chats-circle" /> Perguntas frequentes</h3>
      <p className="faq-hint">
        Perguntas com resposta direta são o caminho mais curto pro seu negócio aparecer
        no Google e em respostas de IA. Elas entram no fim do artigo automaticamente.
      </p>

      {faq.map((f, i) => (
        <div className="faq-item" key={i}>
          <input
            className="field"
            placeholder={`Pergunta ${i + 1} (ex.: Quanto tempo demora?)`}
            value={f.question}
            onChange={e => patchItem(i, { question: e.target.value })}
          />
          <textarea
            className="field"
            style={{ minHeight: 56, resize: 'vertical' }}
            placeholder="Resposta direta, em 2 a 4 frases…"
            value={f.answer}
            onChange={e => patchItem(i, { answer: e.target.value })}
          />
          <button
            className="faq-rm"
            type="button"
            title="Remover pergunta"
            onClick={() => onChange(faq.filter((_, j) => j !== i))}
          >
            <i className="ph-fill ph-trash" />
          </button>
        </div>
      ))}

      <div className="faq-actions">
        <button
          className="btn ghost sm"
          type="button"
          onClick={() => onChange([...faq, { question: '', answer: '' }])}
        >
          <i className="ph-fill ph-plus-circle" /> Adicionar pergunta
        </button>
        <button
          className="btn sm"
          type="button"
          onClick={onGenerate}
          disabled={generating || !canGenerate}
          title={canGenerate ? 'Gera 3-5 perguntas a partir do texto do artigo' : 'Escreva o artigo primeiro'}
        >
          <i className="ph-fill ph-sparkle" /> {generating ? 'Gerando…' : 'Gerar com IA'}
        </button>
      </div>
      {genErr && <div className="ai-err">{genErr}</div>}
    </div>
  )
}
