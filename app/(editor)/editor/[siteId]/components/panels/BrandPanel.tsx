'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import { AiHelp } from '@/components/draft/AiHelp'

type Socials = {
  instagram?: string; facebook?: string; whatsapp?: string
  tiktok?: string; youtube?: string; linkedin?: string; site_externo?: string
}

const SOCIAL_FIELDS: { key: keyof Socials; label: string; ph: string }[] = [
  { key: 'whatsapp',     label: 'WhatsApp',  ph: '5515991234567 (com DDD)' },
  { key: 'instagram',    label: 'Instagram', ph: '@seunegocio ou link' },
  { key: 'facebook',     label: 'Facebook',  ph: 'sua página ou link' },
  { key: 'tiktok',       label: 'TikTok',    ph: '@seunegocio ou link' },
  { key: 'youtube',      label: 'YouTube',   ph: 'link do canal' },
  { key: 'linkedin',     label: 'LinkedIn',  ph: 'seu perfil ou link' },
  { key: 'site_externo', label: 'Outro site',ph: 'https://...' },
]

export default function BrandPanel({ siteId }: { siteId: string }) {
  const [profileId, setProfileId] = useState<string | null>(null)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [faviconUrl, setFaviconUrl] = useState<string | null>(null)
  const [socials, setSocials] = useState<Socials>({})
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [savedMsg, setSavedMsg] = useState('')
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const load = useCallback(async () => {
    const supabase = createBrowserClient()
    const { data } = await supabase
      .from('onboarding_profiles')
      .select('id, logo_url, favicon_url, social_links')
      .eq('site_id', siteId)
      .maybeSingle()
    if (data) {
      setProfileId(data.id as string)
      setLogoUrl((data.logo_url as string) ?? null)
      setFaviconUrl((data.favicon_url as string) ?? null)
      setSocials(((data.social_links as Socials) ?? {}))
    }
    setLoading(false)
  }, [siteId])

  useEffect(() => { load() }, [load])

  async function handleLogo(file: File | null) {
    if (!file) return
    setUploading(true); setError('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/onboarding/logo', { method: 'POST', body: fd })
      const j = await res.json()
      if (!res.ok) { setError(j.error ?? 'Falha no upload da logo'); return }
      setLogoUrl(j.logo_url ?? null)
      setFaviconUrl(j.favicon_url ?? null)
    } catch {
      setError('Falha de conexão no upload')
    } finally {
      setUploading(false)
    }
  }

  // Salva as redes no perfil (debounce simples ao sair do campo).
  async function saveSocials(next: Socials) {
    if (!profileId) return
    const supabase = createBrowserClient()
    const { error: e } = await supabase
      .from('onboarding_profiles')
      .update({ social_links: next })
      .eq('id', profileId)
    if (e) { setError('Não consegui salvar as redes'); return }
    setSavedMsg('Redes salvas'); setTimeout(() => setSavedMsg(''), 1800)
  }

  if (loading) return <p className="ed-saving">Carregando…</p>

  return (
    <>
      <p className="ed-hint">A logo aparece no topo do site e vira o favicon (ícone da aba). As redes viram botões flutuantes no site.</p>

      {/* ── LOGO ── */}
      <p className="ed-cap">Logo do negócio</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '.4rem 0 .8rem' }}>
        <div style={{
          width: 72, height: 72, borderRadius: 14, flexShrink: 0,
          display: 'grid', placeItems: 'center', overflow: 'hidden',
          background: 'rgba(255,255,255,.06)', border: '1px solid var(--line)',
        }}>
          {logoUrl
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={logoUrl} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%' }} />
            : <i className="ph-duotone ph-image" style={{ fontSize: '1.6rem', color: 'var(--muted)' }} />}
        </div>
        <div>
          <button onClick={() => inputRef.current?.click()} disabled={uploading} className="btn glass sm">
            {uploading ? 'Enviando…' : logoUrl ? 'Trocar logo' : 'Enviar logo'}
          </button>
          <p className="ed-cap" style={{ marginTop: '.35rem' }}>PNG, JPG, SVG ou WEBP</p>
        </div>
        <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" style={{ display: 'none' }} onChange={e => handleLogo(e.target.files?.[0] ?? null)} />
      </div>
      {faviconUrl && (
        <div className="note" style={{ marginBottom: '.8rem' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={faviconUrl} alt="Favicon" style={{ width: 18, height: 18 }} />
          <span>Favicon gerado a partir da logo.</span>
        </div>
      )}

      {/* ── REDES SOCIAIS ── */}
      <p className="ed-cap" style={{ marginTop: '.6rem' }}>Redes sociais</p>
      <p className="ed-hint" style={{ marginTop: '.1rem' }}>Deixe em branco as que não usa. Pode colar o link completo ou só o @usuário.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '.55rem', marginTop: '.5rem' }}>
        {SOCIAL_FIELDS.map(({ key, label, ph }) => (
          <div key={key} className="ed-field-group">
            <label className="lbl" style={{ margin: 0 }}>{label}</label>
            <input
              className="field"
              type="text"
              value={socials[key] ?? ''}
              placeholder={ph}
              onChange={e => setSocials(s => ({ ...s, [key]: e.target.value }))}
              onBlur={() => saveSocials(socials)}
            />
          </div>
        ))}
      </div>

      {savedMsg && <p className="saved-msg" style={{ marginTop: '.6rem' }}><i className="ph-fill ph-check-circle" /> {savedMsg}</p>}
      {error && <p className="ed-err">{error}</p>}

      <div style={{ margin: '.8rem 0 0' }}>
        <AiHelp>A IA já escreve o alt text das suas fotos</AiHelp>
      </div>
    </>
  )
}
