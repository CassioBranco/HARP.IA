// ============================================================
// ANCOREO — Shell do painel (liquid-glass). Portado de
// design_handoff_ancoreo/painel/painel.css. Visual é o protótipo;
// aqui mora só a fiação (auth, nome do tenant, plano, nav ativa).
// ============================================================
import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'
import { LogoutButton } from '@/components/draft/LogoutButton'
import { hasSupabaseEnv } from '@/lib/env'
import { createServerClient } from '@/lib/supabase/server'
import PainelNav from './PainelNav'

import '@phosphor-icons/web/fill'
import '@phosphor-icons/web/duotone'
import './painel.css'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let userEmail = ''
  let bizName = ''
  let plan = ''
  let gpeConnected = true // assume ok; só avisa se houver perfil e não estiver vinculado
  if (hasSupabaseEnv()) {
    try {
      const supabase = await createServerClient()
      const { data } = await supabase.auth.getUser()
      userEmail = data.user?.email ?? ''
      if (data.user) {
        const { data: u } = await supabase
          .from('users')
          .select('tenant_id, tenants(plan)')
          .eq('id', data.user.id)
          .single()
        const t = u?.tenants as { plan?: string } | { plan?: string }[] | null
        plan = (Array.isArray(t) ? t[0]?.plan : t?.plan) ?? ''
        if (u?.tenant_id) {
          const { data: prof } = await supabase
            .from('onboarding_profiles')
            .select('business_name, gpe_modo')
            .eq('tenant_id', u.tenant_id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()
          bizName = prof?.business_name ?? ''
          // só avisa se o cliente já passou pelo onboarding e o Google não está vinculado
          if (prof && prof.gpe_modo && prof.gpe_modo !== 'vincular') gpeConnected = false
        }
      }
    } catch {
      // silencioso — não travar o layout por erro de auth
    }
  }

  const displayName = bizName || userEmail || 'Minha conta'
  const initials = (bizName || userEmail || '?')
    .split(/\s+/)
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
  const planLabel = plan ? `Plano ${plan.charAt(0).toUpperCase()}${plan.slice(1)}` : 'Trial Pro'

  return (
    <div className="painel-shell">
      <div className="aura" />
      <div className="app">
        <aside className="side">
          <div className="brand">
            <span className="mk"><i className="ph-fill ph-anchor" /></span> ANCOREO
          </div>
          <PainelNav />
          <Link href="/onboarding" className="nav-item">
            <i className="ph-duotone ph-rocket-launch" /> Novo site
          </Link>
          <div className="side-theme"><ThemeToggle /></div>
          <div className="foot">
            <span className="avatar">{initials}</span>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div className="nm">{displayName}</div>
              <div className="pl">{planLabel}</div>
            </div>
            <LogoutButton />
          </div>
        </aside>

        <main className="main">
          {!gpeConnected && (
            <div className="gpe-banner" role="alert">
              <i className="ph-fill ph-warning" />
              <span>
                <b>Conecte seu Perfil de Empresa no Google pro seu site aparecer.</b> Enquanto o
                Perfil não estiver conectado, seu site não aparece nas buscas do Google — que é o que
                mais traz cliente da sua região.
              </span>
              <Link href="/settings" className="gpe-banner-cta">Conectar agora</Link>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  )
}
