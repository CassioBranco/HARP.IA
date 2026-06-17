// ============================================================
// HARPIA — Selo de IA reutilizável.
// Padroniza a "estrelinha de IA" em TODO ponto com função de IA:
//   <AiSpark />            → só o ícone (pra dentro de botões/labels)
//   <AiHelp />             → pill "✨ A IA pode ajudar"
//   <AiHelp>texto</AiHelp> → pill com texto custom
// Estilos em app/globals.css (.ai-spark / .ai-help) — funcionam em
// fundo claro e escuro (login, painel, editor, onboarding, landing).
// ============================================================
import type { ReactNode } from 'react'

export function AiSpark({ className = '' }: { className?: string }) {
  return <i className={`ph-fill ph-sparkle ai-spark ${className}`} aria-hidden="true" />
}

export function AiHelp({
  children = 'A IA pode ajudar',
  className = '',
  title = 'Função com inteligência artificial',
}: {
  children?: ReactNode
  className?: string
  title?: string
}) {
  return (
    <span className={`ai-help ${className}`} title={title}>
      <i className="ph-fill ph-sparkle" aria-hidden="true" />
      <span>{children}</span>
    </span>
  )
}
