'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ensureProfileOnClient } from '@/lib/auth/client'
import { createBrowserClient } from '@/lib/supabase/client'

// ---------------------------------------------------------------------------
// Eye icon
// ---------------------------------------------------------------------------
function EyeIcon({ open }: { open: boolean }) {
  if (open) return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  )
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Shared input style
// ---------------------------------------------------------------------------
const inputCls =
  'w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm ' +
  'text-foreground placeholder:text-muted-foreground ' +
  'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 ' +
  'disabled:opacity-50 transition-colors'

// ---------------------------------------------------------------------------
// Page — auth layout já centraliza, não precisa re-envolver
// ---------------------------------------------------------------------------
export default function LoginPage() {
  const router = useRouter()
  const [email,        setEmail]        = useState('')
  const [password,     setPassword]     = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error,        setError]        = useState('')
  const [loading,      setLoading]      = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const supabase = createBrowserClient()
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
      if (authError) {
        const m = authError.message.toLowerCase()
        setError(
          m.includes('invalid login credentials') ? 'Email ou senha incorretos.' :
          m.includes('email not confirmed')        ? 'Email não confirmado. Verifique sua caixa de entrada.' :
          `Erro: ${authError.message}`
        )
        return
      }
      try { await ensureProfileOnClient() } catch { /* ignora */ }
      const next = new URLSearchParams(window.location.search).get('next')
      router.push(next?.startsWith('/') ? next : '/sites')
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Cabeçalho */}
      <div className="mb-8 text-center">
        <Link href="/" className="font-heading text-2xl font-bold text-primary">
          HARPIA
        </Link>
        <h1 className="font-heading mt-5 text-2xl font-bold text-foreground">
          Entrar na conta
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Não tem conta?{' '}
          <Link href="/signup" className="font-medium text-primary hover:underline">
            Criar grátis
          </Link>
        </p>
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium text-foreground">
              Email
            </label>
            <input
              id="email" type="email" autoComplete="email" required
              value={email} onChange={e => setEmail(e.target.value)}
              placeholder="voce@email.com"
              className={inputCls}
              disabled={loading}
            />
          </div>

          {/* Senha + eye toggle */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Senha
              </label>
              <Link href="/reset" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                Esqueci a senha
              </Link>
            </div>

            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password" required
                value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`${inputCls} pr-11`}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                className="absolute inset-y-0 right-0 flex items-center justify-center w-11 text-muted-foreground hover:text-foreground transition-colors"
              >
                <EyeIcon open={showPassword} />
              </button>
            </div>
          </div>

          {/* Erro */}
          {error && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit" disabled={loading}
            className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
      </div>
    </>
  )
}
