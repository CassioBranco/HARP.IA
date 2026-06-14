'use client'

// ============================================================
// HARPIA — Escolher modelo (v2) — porte React do protótipo
// design_handoff_harpia/onboarding/escolher-modelo.html
// O visual é o protótipo; aqui mora só a fiação (preview ao vivo,
// seleção de modelo/paleta e criação do site).
// ============================================================

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { LayoutId } from '@/lib/templates/layouts'
import { createSiteWithModel } from '@/lib/onboarding/actions'
import {
  MODELS,
  PALETTES,
  PALETTE_GROUPS,
  CUSTOM_DEFAULT,
  buildCustom,
  OBJETIVO_TO_LAYOUT,
  type NamedPalette,
} from './model-data'
import type { Objetivo } from '@/lib/onboarding/types'

import '@phosphor-icons/web/fill'
import '@phosphor-icons/web/duotone'
import './escolher-modelo.css'

const CUSTOM_I = PALETTES.length // índice "virtual" da paleta personalizada
const ORIGINAL_BARS = ['#3a4a63', '#26344a', '#5d6b82'] // amostra da paleta "Original"

export interface EscolherModeloProps {
  businessName: string
  preset: string
  domain: string
  objetivo: Objetivo | null
}

export default function EscolherModelo({ businessName, preset, domain, objetivo }: EscolherModeloProps) {
  const router = useRouter()

  const initialLayout: LayoutId = (objetivo && OBJETIVO_TO_LAYOUT[objetivo]) || 'clean'
  const [cur, setCur] = useState<LayoutId>(initialLayout)
  const [palIdx, setPalIdx] = useState(0) // 0 = Original
  const [custom, setCustom] = useState<string[]>(CUSTOM_DEFAULT)
  const [device, setDevice] = useState<'desk' | 'mob'>('desk')
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  const model = MODELS.find(m => m.id === cur) ?? MODELS[0]!

  // Cores efetivas da paleta selecionada (null = default do template)
  const selectedColors: string[] | null = useMemo(() => {
    if (palIdx === 0) return null
    if (palIdx === CUSTOM_I) return custom
    return PALETTES[palIdx]?.colors ?? null
  }, [palIdx, custom])

  const previewSrc = useMemo(() => {
    const p = new URLSearchParams({ preset, layout: cur })
    if (selectedColors) p.set('colors', selectedColors.join(','))
    return `/preview/template?${p.toString()}`
  }, [preset, cur, selectedColors])

  // Recarrega o preview a cada troca de modelo/paleta
  useEffect(() => { setLoading(true) }, [previewSrc])

  function pickCustom(idx: 0 | 1 | 2, val: string) {
    setCustom(prev => {
      const next = [...prev]
      next[idx] = val
      return buildCustom(next[0]!, next[1]!, next[2]!)
    })
    setPalIdx(CUSTOM_I)
  }

  async function useModel() {
    setCreating(true)
    setError('')
    const paletteName =
      palIdx === 0 ? 'Original' : palIdx === CUSTOM_I ? 'Personalizada' : PALETTES[palIdx]?.name ?? null
    const group =
      palIdx === 0 ? 'base' : palIdx === CUSTOM_I ? 'custom' : PALETTES[palIdx]?.group ?? null
    try {
      const res = await createSiteWithModel({
        layout: cur,
        paletteName,
        colors: selectedColors,
        group,
      })
      if (res.ok && res.site_id) {
        router.push(`/editor/${res.site_id}`)
        return
      }
      if (res.error === 'unauthenticated') { router.push('/login'); return }
      setError(
        res.error === 'site_limit'
          ? 'Seu plano permite 1 site. Remova o site atual ou faça upgrade para criar outro.'
          : res.error === 'tenant_not_found'
            ? 'Perfil não encontrado. Saia e entre novamente.'
            : `Não consegui criar o site: ${res.error ?? 'erro desconhecido'}`,
      )
    } catch (e) {
      setError(`Erro inesperado: ${String(e)}`)
    } finally {
      setCreating(false)
    }
  }

  const palBar = (p: NamedPalette | null) => {
    const c = p?.colors ?? ORIGINAL_BARS
    return (
      <span className="bars">
        <i style={{ background: c[0] }} />
        <i style={{ background: c[1] }} />
        <i style={{ background: c[2] ?? c[1] }} />
      </span>
    )
  }

  const PalButton = ({ idx, p, name }: { idx: number; p: NamedPalette | null; name: string }) => (
    <button
      className={`pal ${idx === palIdx ? 'on' : ''}`}
      onClick={() => setPalIdx(idx)}
      type="button"
    >
      {palBar(idx === CUSTOM_I ? ({ colors: custom } as NamedPalette) : p)}
      <span className="pn">{name}</span>
    </button>
  )

  return (
    <div className="em-page">
      <div className="aura" />
      <div className="grain" />

      <div className="app">
        <header className="top">
          <div className="brand">
            <span className="mk"><i className="ph-fill ph-bird" /></span> HARPIA
          </div>
          <div className="mid">
            <i className="ph-duotone ph-paint-brush-broad" /> Escolha o modelo do seu site
          </div>
          <button className="btn amber" onClick={useModel} disabled={creating} type="button">
            {creating ? 'Criando…' : <>Usar este modelo <i className="ph-fill ph-arrow-right" /></>}
          </button>
        </header>

        <div className="main">
          {/* rail */}
          <aside className="rail">
            <div className="glass sec">
              <h3><i className="ph-duotone ph-layout" /> Modelo</h3>
              <div className="layouts">
                {MODELS.map(m => (
                  <button
                    key={m.id}
                    className={`lay ${m.id === cur ? 'on' : ''}`}
                    onClick={() => setCur(m.id)}
                    type="button"
                  >
                    <span className="sw">
                      <i style={{ background: m.swatch[0] }} />
                      <i style={{ background: m.swatch[1] }} />
                      <i style={{ background: m.swatch[2] }} />
                    </span>
                    <span>
                      <span className="nm">{m.name}</span><br />
                      <span className="ds">{m.desc}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="glass sec">
              <h3><i className="ph-duotone ph-palette" /> Paleta de cores</h3>
              <div className="pals">
                {/* Original */}
                <PalButton idx={0} p={PALETTES[0]!} name="Original" />

                {/* Grupos */}
                {PALETTE_GROUPS.map(group => {
                  const items = PALETTES
                    .map((p, i) => ({ p, i }))
                    .filter(({ p }) => p.group === group)
                  if (items.length === 0) return null
                  return (
                    <div key={group}>
                      <div className="pal-cat">{group}</div>
                      <div className="pal-row">
                        {items.map(({ p, i }) => (
                          <PalButton key={i} idx={i} p={p} name={p.name} />
                        ))}
                      </div>
                    </div>
                  )
                })}

                {/* Personalizada */}
                <div className="pal-cat">Personalizada</div>
                <PalButton idx={CUSTOM_I} p={null} name="Personalizada" />
                <div className="pal-custom">
                  <label>Principal
                    <input type="color" value={custom[0]} onChange={e => pickCustom(0, e.target.value)} />
                  </label>
                  <label>Apoio
                    <input type="color" value={custom[1]} onChange={e => pickCustom(1, e.target.value)} />
                  </label>
                  <label>Destaque
                    <input type="color" value={custom[2]} onChange={e => pickCustom(2, e.target.value)} />
                  </label>
                </div>
              </div>

              {error && <p className="err">{error}</p>}
            </div>
          </aside>

          {/* stage */}
          <section className="stage">
            <div className="stagebar">
              <div className="info">
                <span className="t">{model.name}</span>
                <span className="u">{model.desc}</span>
              </div>
              <div className="tools">
                <span className="chip2"><i className="ph-fill ph-check-circle" /> SEO pronto</span>
                <div className="seg2">
                  <button className={device === 'desk' ? 'on' : ''} onClick={() => setDevice('desk')} type="button">
                    <i className="ph-fill ph-monitor" /> Desktop
                  </button>
                  <button className={device === 'mob' ? 'on' : ''} onClick={() => setDevice('mob')} type="button">
                    <i className="ph-fill ph-device-mobile" /> Mobile
                  </button>
                </div>
              </div>
            </div>

            <div className="frame">
              <div className={`loadlay ${loading ? 'show' : ''}`}><div className="sp" /></div>
              <div className={`browser ${device === 'mob' ? 'mobile' : ''}`}>
                <div className="bbar">
                  <div className="dots"><i className="r" /><i className="y" /><i className="g" /></div>
                  <div className="url">{domain}</div>
                </div>
                <iframe
                  key={previewSrc}
                  src={previewSrc}
                  title={`Prévia — ${model.name} (${businessName})`}
                  onLoad={() => setLoading(false)}
                />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
