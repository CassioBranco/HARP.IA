'use client'

// ============================================================
// HARPIA — Configurações (Fase 5). Visual = protótipo settings.html.
// Fiação real: Conta (saveAccount), senha (Supabase auth). Plano/uso reais.
// Pagamento e Notificações: visual portado, sem dados fabricados.
// ============================================================
import { useState } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import { saveAccount } from '@/lib/settings/actions'

type Tab = 'conta' | 'plano' | 'pagamento' | 'notif' | 'seg'

export type SettingsData = {
  email: string
  businessName: string
  city: string
  plan: string // starter | pro | agency
  sitesUsed: number
  sitesAllowed: number
  blogUsed: number
  blogLimit: number | null
}

const PLANS = [
  {
    id: 'starter', name: 'Starter', price: 'R$ 97',
    features: ['1 site no ar', '4 artigos de blog por mês', 'GBP básico'],
  },
  {
    id: 'pro', name: 'Pro', price: 'R$ 197', pop: true,
    features: ['3 sites no ar', '20 artigos de blog por mês', 'Domínio próprio', 'Score SEO, GEO e AEO'],
  },
  {
    id: 'agency', name: 'Agency', price: 'R$ 297',
    features: ['Sites ilimitados', 'Artigos ilimitados', 'White-label', 'Suporte prioritário'],
  },
]

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'conta', label: 'Conta', icon: 'ph-user-circle' },
  { id: 'plano', label: 'Plano', icon: 'ph-crown-simple' },
  { id: 'pagamento', label: 'Pagamento', icon: 'ph-credit-card' },
  { id: 'notif', label: 'Notificações', icon: 'ph-bell' },
  { id: 'seg', label: 'Segurança', icon: 'ph-shield-check' },
]

function initialsOf(s: string) {
  return (s || '?').split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase()
}

export default function SettingsClient({ data }: { data: SettingsData }) {
  const [tab, setTab] = useState<Tab>('conta')

  // Conta
  const [businessName, setBusinessName] = useState(data.businessName)
  const [city, setCity] = useState(data.city)
  const [savingAcct, setSavingAcct] = useState(false)
  const [acctMsg, setAcctMsg] = useState('')

  // Senha
  const [newPwd, setNewPwd] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [savingPwd, setSavingPwd] = useState(false)
  const [pwdMsg, setPwdMsg] = useState('')
  const [pwdErr, setPwdErr] = useState('')

  async function onSaveAccount() {
    setSavingAcct(true)
    setAcctMsg('')
    const res = await saveAccount({ businessName, city })
    setSavingAcct(false)
    setAcctMsg(res.ok ? 'Salvo' : `Erro: ${res.error}`)
  }

  async function onSavePassword() {
    setPwdErr('')
    setPwdMsg('')
    if (newPwd.length < 8) { setPwdErr('Use ao menos 8 caracteres.'); return }
    if (newPwd !== confirmPwd) { setPwdErr('As senhas não conferem.'); return }
    setSavingPwd(true)
    const supabase = createBrowserClient()
    const { error } = await supabase.auth.updateUser({ password: newPwd })
    setSavingPwd(false)
    if (error) { setPwdErr(error.message); return }
    setNewPwd(''); setConfirmPwd('')
    setPwdMsg('Senha atualizada')
  }

  const sitesPct = data.sitesAllowed > 0 ? Math.min(100, (data.sitesUsed / data.sitesAllowed) * 100) : 0
  const blogPct = data.blogLimit ? Math.min(100, (data.blogUsed / data.blogLimit) * 100) : 0
  const planLabel = data.plan.charAt(0).toUpperCase() + data.plan.slice(1)

  return (
    <>
      <div className="topbar">
        <div><h1>Configurações</h1><div className="sub">Conta, plano, pagamento e preferências</div></div>
      </div>

      <div className="tabs">
        {TABS.map(t => (
          <button key={t.id} className={`tab ${tab === t.id ? 'on' : ''}`} onClick={() => setTab(t.id)}>
            <i className={`ph-duotone ${t.icon}`} /> {t.label}
          </button>
        ))}
      </div>

      {/* ===== CONTA ===== */}
      {tab === 'conta' && (
        <div className="cols">
          <div className="glass card">
            <h3><i className="ph-duotone ph-identification-card" /> Dados pessoais</h3>
            <p className="ph">Essas informações aparecem no seu painel e nas faturas.</p>
            <div className="ava-row">
              <div className="ava-big">{initialsOf(businessName || data.email)}</div>
              <div className="meta">
                <b>Foto do perfil</b>
                <p>Em breve você poderá enviar uma foto.</p>
              </div>
            </div>
            <div className="frow"><label className="lbl">Nome do negócio</label>
              <input className="field" value={businessName} onChange={e => setBusinessName(e.target.value)} />
            </div>
            <div className="frow"><label className="lbl">Email</label>
              <input className="field" type="email" value={data.email} disabled />
            </div>
            <div className="frow"><label className="lbl">Cidade</label>
              <input className="field" value={city} onChange={e => setCity(e.target.value)} />
            </div>
            <div className="savebar">
              <button className="btn" onClick={onSaveAccount} disabled={savingAcct}>
                <i className="ph-fill ph-check" /> {savingAcct ? 'Salvando…' : 'Salvar alterações'}
              </button>
              {acctMsg && <span className="saved-msg"><i className="ph-fill ph-check-circle" /> {acctMsg}</span>}
            </div>
          </div>

          <div className="stack">
            <div className="glass card">
              <h3 style={{ fontSize: '.95rem' }}><i className="ph-duotone ph-warning-circle" /> Encerrar conta</h3>
              <p className="ph">Seus sites saem do ar. Esta ação não pode ser desfeita.</p>
              <button className="btn glass sm" style={{ color: '#ff9b9b' }} disabled title="Fale com o suporte para encerrar a conta">
                Excluir minha conta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== PLANO ===== */}
      {tab === 'plano' && (
        <>
          <div className="glass card" style={{ marginBottom: '1.4rem' }}>
            <h3><i className="ph-duotone ph-crown-simple" /> Seu plano atual</h3>
            <p className="ph">Plano e uso da sua conta neste mês.</p>
            <div className="plan-now">
              <span className="ic"><i className="ph-fill ph-crown-simple" /></span>
              <div><b>{planLabel}</b><p>Plano ativo</p></div>
            </div>
            <div className="usage">
              <div className="u-row"><span>Sites usados</span><span>{data.sitesUsed} de {data.sitesAllowed}</span></div>
              <div className="ubar"><i className={sitesPct >= 100 ? 'full' : ''} style={{ width: `${sitesPct}%` }} /></div>
            </div>
            <div className="usage" style={{ marginBottom: 0 }}>
              <div className="u-row">
                <span>Artigos do blog escritos pela IA neste mês</span>
                <span>{data.blogUsed} de {data.blogLimit ?? '∞'}</span>
              </div>
              <div className="ubar"><i style={{ width: `${blogPct}%` }} /></div>
            </div>
          </div>

          <h3 style={{ margin: '0 0 .9rem', fontSize: '1.05rem' }}>Trocar de plano</h3>
          <div className="plan-grid">
            {PLANS.map(p => {
              const current = p.id === data.plan
              return (
                <div key={p.id} className={`plan-card ${current ? 'on' : ''} ${p.pop ? 'pop' : ''}`}>
                  {p.pop && <span className="pop-tag">Recomendado</span>}
                  {current && <span className="cur">Atual</span>}
                  <div className="pname">{p.name}</div>
                  <div className="price">{p.price}<small>/mês</small></div>
                  <ul>
                    {p.features.map(f => <li key={f}><i className="ph-fill ph-check-circle" /> {f}</li>)}
                  </ul>
                  <button className={`btn ${p.pop ? 'amber' : 'glass'} sm block`} disabled title="Cobrança em breve">
                    {current ? 'Plano atual' : `Assinar ${p.name}`}
                  </button>
                </div>
              )
            })}
          </div>
          <div className="note" style={{ marginTop: '1rem' }}>
            <i className="ph-fill ph-info" /> A troca de plano com cobrança ainda será ativada. Por enquanto seu plano é gerenciado pelo suporte.
          </div>
        </>
      )}

      {/* ===== PAGAMENTO ===== */}
      {tab === 'pagamento' && (
        <div className="cols">
          <div className="glass card">
            <h3><i className="ph-duotone ph-credit-card" /> Forma de pagamento</h3>
            <p className="ph">Escolha como quer pagar a assinatura.</p>
            <div className="note">
              <i className="ph-fill ph-info" /> Nenhuma forma de pagamento cadastrada. O pagamento será ativado em breve.
            </div>
          </div>
          <div className="glass card">
            <h3><i className="ph-duotone ph-files" /> Histórico de faturas</h3>
            <p className="ph">Suas cobranças e notas fiscais aparecem aqui.</p>
            <div className="note"><i className="ph-fill ph-info" /> Sem faturas ainda.</div>
          </div>
        </div>
      )}

      {/* ===== NOTIFICAÇÕES ===== */}
      {tab === 'notif' && (
        <div className="cols">
          <div className="glass card">
            <h3><i className="ph-duotone ph-bell" /> Emails que você recebe</h3>
            <p className="ph">Escolha sobre o que a HARPIA te avisa.</p>
            {[
              ['ph-chart-line-up', 'Relatório semanal de desempenho', 'Resumo de visitas, posições no Google e score do seu site.', true],
              ['ph-magnifying-glass', 'Alertas de SEO e score', 'Quando algo derruba ou melhora seu score de busca.', true],
              ['ph-article', 'Post de blog publicado', 'Quando a IA publica um novo artigo no seu site.', true],
              ['ph-receipt', 'Avisos de cobrança', 'Faturas, renovações e falhas de pagamento. Recomendado.', true],
            ].map(([icon, title, desc, on]) => (
              <div className="toggle-row" key={title as string}>
                <div className="tx">
                  <b><i className={`ph-fill ${icon}`} /> {title}</b>
                  <p>{desc}</p>
                </div>
                <label className="switch"><input type="checkbox" defaultChecked={on as boolean} /><span className="tr" /></label>
              </div>
            ))}
            <div className="note" style={{ marginTop: '1rem' }}>
              <i className="ph-fill ph-info" /> Preferências de notificação serão salvas quando o envio de emails for ativado.
            </div>
          </div>
        </div>
      )}

      {/* ===== SEGURANÇA ===== */}
      {tab === 'seg' && (
        <div className="cols">
          <div className="glass card">
            <h3><i className="ph-duotone ph-lock-key" /> Alterar senha</h3>
            <p className="ph">Use ao menos 8 caracteres com letras e números.</p>
            <div className="inline">
              <div className="frow"><label className="lbl">Nova senha</label>
                <input className="field" type="password" placeholder="••••••••" value={newPwd} onChange={e => setNewPwd(e.target.value)} />
              </div>
              <div className="frow"><label className="lbl">Confirmar nova senha</label>
                <input className="field" type="password" placeholder="••••••••" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} />
              </div>
            </div>
            <div className="savebar">
              <button className="btn" onClick={onSavePassword} disabled={savingPwd}>
                <i className="ph-fill ph-check" /> {savingPwd ? 'Atualizando…' : 'Atualizar senha'}
              </button>
              {pwdMsg && <span className="saved-msg"><i className="ph-fill ph-check-circle" /> {pwdMsg}</span>}
              {pwdErr && <span className="err-msg">{pwdErr}</span>}
            </div>
          </div>

          <div className="stack">
            <div className="glass card">
              <h3><i className="ph-duotone ph-devices" /> Sessões ativas</h3>
              <p className="ph">Dispositivos conectados à sua conta.</p>
              <div className="sess">
                <span className="si"><i className="ph-fill ph-desktop" /></span>
                <div className="sm"><b>Este dispositivo</b><p>Sessão atual</p></div>
                <span className="now">Agora</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
