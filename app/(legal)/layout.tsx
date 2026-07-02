import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'
import './legal.css'

// Casca das páginas legais (Termo de Uso / Política de Privacidade).
// Servida só no host do painel (na rota de site publicado o middleware reescreve
// pra /[domain]). Layout neutro e legível, separado do tema do app.
export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="legal">
      <header className="legal__bar">
        <Link href="/" className="legal__brand">ANCOREO</Link>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/" className="legal__back">← Voltar ao site</Link>
          <span className="legal__theme"><ThemeToggle /></span>
        </span>
      </header>

      <main className="legal__wrap">
        <article className="legal__doc">{children}</article>
      </main>

      <footer className="legal__foot">
        <p>
          © 2026 ANCOREO ·{' '}
          <Link href="/termos">Termos de Uso</Link> ·{' '}
          <Link href="/privacidade">Política de Privacidade</Link>
        </p>
      </footer>
    </div>
  )
}
