'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ensureProfileOnClient } from '@/lib/auth/client'
import { createBrowserClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [resent, setResent] = useState(false)
  const [resending, setResending] = useState(false)

  async function handleResend() {
    setResending(true)
    try {
      const supabase = createBrowserClient()
      await supabase.auth.resend({ type: 'signup', email })
      setResent(true)
    } finally {
      setResending(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('A senha precisa ter pelo menos 8 caracteres.')
      return
    }

    setLoading(true)

    try {
      const supabase = createBrowserClient()
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/sites`,
        },
      })

      if (authError) {
        if (authError.message.toLowerCase().includes('already registered')) {
          setError('Este email já tem uma conta. Faça login.')
        } else {
          setError(`Erro: ${authError.message}`)
        }
        return
      }

      if (data.session) {
        // Tenta criar tenant — falha silenciosa (retenta no próximo acesso)
        try { await ensureProfileOnClient() } catch { /* ignora */ }
        router.push('/sites')
        router.refresh()
        return
      }

      setDone(true)
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="w-full max-w-md">
          {/* Card principal */}
          <div className="rounded-2xl border border-border bg-card p-8 shadow-sm text-center">
            {/* Ícone */}
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>

            <h2 className="font-heading mb-2 text-2xl font-bold text-foreground">
              Confirme seu email
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Enviamos um link de confirmação para
            </p>
            <p className="mt-1 mb-6 font-semibold text-foreground">{email}</p>

            {/* Passos */}
            <div className="mb-6 rounded-xl bg-muted/50 p-4 text-left space-y-3">
              {[
                { n: '1', text: 'Abra o email na sua caixa de entrada' },
                { n: '2', text: 'Clique em "Confirmar email" no link que enviamos' },
                { n: '3', text: 'Volte aqui e faça login normalmente' },
              ].map(step => (
                <div key={step.n} className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {step.n}
                  </span>
                  <span className="text-sm text-foreground pt-0.5">{step.text}</span>
                </div>
              ))}
            </div>

            <Link
              href="/login"
              className="block w-full rounded-md bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Ir para o login
            </Link>

            {/* Reenviar */}
            <div className="mt-5 border-t border-border pt-5">
              <p className="text-xs text-muted-foreground mb-2">
                Não recebeu o email? Verifique o spam ou reenvie.
              </p>
              {resent ? (
                <p className="text-xs font-medium text-primary">✓ Email reenviado!</p>
              ) : (
                <button
                  onClick={handleResend}
                  disabled={resending}
                  className="text-xs font-medium text-primary hover:underline disabled:opacity-50"
                >
                  {resending ? 'Reenviando...' : 'Reenviar email de confirmação'}
                </button>
              )}
            </div>
          </div>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            Criou com o email errado?{' '}
            <Link href="/signup" className="text-primary hover:underline">
              Tente de novo
            </Link>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="font-heading text-2xl font-bold text-primary">
            HARPIA
          </Link>
          <h1 className="font-heading mt-6 text-2xl font-bold text-foreground">
            Criar conta grátis
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            7 dias grátis no plano Pro · sem cartão agora
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Já tem conta?{' '}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Entrar
            </Link>
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className="text-sm font-medium text-foreground">
                Seu nome
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="João Silva"
                className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 disabled:opacity-50"
                disabled={loading}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@email.com"
                className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 disabled:opacity-50"
                disabled={loading}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Senha <span className="text-muted-foreground">(mín. 8 caracteres)</span>
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 disabled:opacity-50"
                disabled={loading}
              />
            </div>

            {error && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-1 rounded-md bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Criando conta...' : 'Criar conta grátis'}
            </button>

            <p className="text-center text-xs text-muted-foreground">
              Ao criar conta você concorda com nossos{' '}
              <Link href="/termos" className="underline hover:text-foreground">
                Termos de Uso
              </Link>{' '}
              e{' '}
              <Link href="/privacidade" className="underline hover:text-foreground">
                Política de Privacidade
              </Link>
              .
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
