'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ensureProfileOnClient } from '@/lib/auth/client'
import { createBrowserClient } from '@/lib/supabase/client'

// ---------------------------------------------------------------------------
// Ícone de olho
// ---------------------------------------------------------------------------

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Força de senha
// ---------------------------------------------------------------------------

type StrengthLevel = 'vazia' | 'fraca' | 'média' | 'forte'

function getStrength(pwd: string): StrengthLevel {
  if (!pwd) return 'vazia'
  let score = 0
  if (pwd.length >= 8)  score++
  if (pwd.length >= 12) score++
  if (/[A-Z]/.test(pwd)) score++
  if (/[0-9]/.test(pwd)) score++
  if (/[^A-Za-z0-9]/.test(pwd)) score++
  if (score <= 1) return 'fraca'
  if (score <= 3) return 'média'
  return 'forte'
}

const STRENGTH_CONFIG: Record<StrengthLevel, { label: string; bars: number; color: string; text: string }> = {
  vazia: { label: '',      bars: 0, color: 'bg-muted',       text: 'text-muted-foreground' },
  fraca: { label: 'Fraca', bars: 1, color: 'bg-destructive', text: 'text-destructive'      },
  média: { label: 'Média', bars: 2, color: 'bg-accent',      text: 'text-accent-foreground' },
  forte: { label: 'Forte', bars: 3, color: 'bg-primary',     text: 'text-primary'           },
}

function PasswordStrength({ password }: { password: string }) {
  const level = getStrength(password)
  const cfg = STRENGTH_CONFIG[level]
  if (!password) return null

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1.5">
        {[1, 2, 3].map(i => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              i <= cfg.bars ? cfg.color : 'bg-muted'
            }`}
          />
        ))}
      </div>
      <p className={`text-xs font-medium ${cfg.text}`}>
        Senha {cfg.label}
        {level === 'fraca' && ' — use letras maiúsculas, números ou símbolos'}
        {level === 'média' && ' — adicione símbolos para ficar mais segura'}
        {level === 'forte' && ' ✓'}
      </p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Input class
// ---------------------------------------------------------------------------

const inputCls = "w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 disabled:opacity-50"

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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
        // Confirmação desligada — cria perfil e entra direto
        try { await ensureProfileOnClient() } catch { /* ignora */ }
        router.push('/sites')
        router.refresh()
        return
      }

      // Confirmação ativa — vai para página dedicada
      router.push(`/confirme-email?email=${encodeURIComponent(email)}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
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
            {/* Nome */}
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
                onChange={e => setName(e.target.value)}
                placeholder="João Silva"
                className={inputCls}
                disabled={loading}
              />
            </div>

            {/* Email */}
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
                onChange={e => setEmail(e.target.value)}
                placeholder="voce@email.com"
                className={inputCls}
                disabled={loading}
              />
            </div>

            {/* Senha com eye toggle + força */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Mín. 8 caracteres"
                  className={`${inputCls} pr-10`}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
              <PasswordStrength password={password} />
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
              <Link href="/termos" className="underline hover:text-foreground">Termos de Uso</Link>
              {' '}e{' '}
              <Link href="/privacidade" className="underline hover:text-foreground">Política de Privacidade</Link>.
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
