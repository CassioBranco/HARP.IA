'use client'

// ============================================================
// ANCOREO — Escolher modelo (v2) — grade de templates
// O cliente vê uma grade com a thumbnail (prévia ao vivo) de TODOS os
// modelos e escolhe um pra customizar. A customização (paleta, cores,
// textos) acontece no editor. Aqui mora só a fiação (preview + criação).
// ============================================================

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { LayoutId } from '@/lib/templates/layouts'
import { createSiteWithModel } from '@/lib/onboarding/actions'
import { MODELS, OBJETIVO_TO_LAYOUT, ORIGINAL_PALETTES } from './model-data'
import type { Objetivo } from '@/lib/onboarding/types'

import '@phosphor-icons/web/fill'
import '@phosphor-icons/web/duotone'
import './escolher-modelo.css'

export interface EscolherModeloProps {
  businessName: string
  preset: string
  domain: string
  objetivo: Objetivo | null
}

// Carrega a prévia (iframe pesado) só quando o card entra na tela; antes mostra
// um placeholder com a cor do template. Evita 10 iframes carregando de uma vez —
// a causa da lentidão. ponytail: IntersectionObserver nativo, sem dependência.
function LazyThumb({ src, title, swatch }: { src: string; title: string; swatch: [string, string, string] }) {
  const ref = useRef<HTMLDivElement>(null)
  const [show, setShow] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || show) return
    const io = new IntersectionObserver(
      entries => { if (entries.some(e => e.isIntersecting)) { setShow(true); io.disconnect() } },
      { rootMargin: '250px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [show])
  return (
    <div className="thumb" ref={ref}>
      {show
        ? <iframe src={src} title={title} loading="lazy" tabIndex={-1} />
        : <div className="thumb-ph" style={{ background: `linear-gradient(135deg, ${swatch[0]}, ${swatch[1]})` }} aria-hidden="true" />}
      <div className="thumb-veil" />
    </div>
  )
}

export default function EscolherModelo({ businessName, preset, domain, objetivo }: EscolherModeloProps) {
  const router = useRouter()

  const suggested: LayoutId | null = (objetivo && OBJETIVO_TO_LAYOUT[objetivo]) || null
  const [creatingId, setCreatingId] = useState<LayoutId | null>(null)
  const [error, setError] = useState('')

  function previewSrc(layout: LayoutId) {
    const p = new URLSearchParams({ preset, layout })
    const colors = ORIGINAL_PALETTES[layout]
    if (colors) p.set('colors', colors.join(','))
    return `/preview/template?${p.toString()}`
  }

  async function choose(layout: LayoutId) {
    if (creatingId) return
    setCreatingId(layout)
    setError('')
    try {
      const res = await createSiteWithModel({
        layout,
        paletteName: 'Original',
        colors: ORIGINAL_PALETTES[layout] ?? null,
        group: 'base',
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
      setCreatingId(null)
    } catch (e) {
      setError(`Erro inesperado: ${String(e)}`)
      setCreatingId(null)
    }
  }

  // ordena: sugerido primeiro
  const ordered = suggested
    ? [...MODELS].sort((a, b) => (a.id === suggested ? -1 : b.id === suggested ? 1 : 0))
    : MODELS

  return (
    <div className="em-page">
      <div className="aura" />
      <div className="grain" />

      <div className="app">
        <header className="top">
          <div className="brand">
            <span className="mk"><i className="ph-fill ph-bird" /></span> ANCOREO
          </div>
          <div className="mid">
            <i className="ph-duotone ph-squares-four" /> {businessName || 'Seu site'}
          </div>
          <span className="top-spacer" />
        </header>

        <div className="gallery">
          <div className="ghead">
            <h1>Escolha um template pra começar</h1>
            <p>Todos já vêm prontos pra SEO. Escolha o que mais combina e personalize cores, textos e imagens no próximo passo.</p>
          </div>

          {error && <p className="err gerr">{error}</p>}

          <div className="tpl-grid">
            {ordered.map(m => {
              const isCreating = creatingId === m.id
              const dim = creatingId && !isCreating
              return (
                <div
                  key={m.id}
                  className={`tpl-card${m.id === suggested ? ' suggested' : ''}${dim ? ' dim' : ''}`}
                >
                  {m.id === suggested && (
                    <span className="tpl-badge"><i className="ph-fill ph-sparkle" /> Sugerido pra você</span>
                  )}
                  <LazyThumb src={previewSrc(m.id)} title={`Prévia — ${m.name}`} swatch={m.swatch} />
                  <div className="tpl-foot">
                    <div className="tpl-meta">
                      <span className="tpl-name">
                        <span className="sw">
                          <i style={{ background: m.swatch[0] }} />
                          <i style={{ background: m.swatch[1] }} />
                          <i style={{ background: m.swatch[2] }} />
                        </span>
                        {m.name}
                      </span>
                      <span className="tpl-desc">{m.desc}</span>
                    </div>
                    <button
                      className="btn amber sm"
                      onClick={() => choose(m.id)}
                      disabled={!!creatingId}
                      type="button"
                    >
                      {isCreating ? 'Criando…' : <>Customizar <i className="ph-fill ph-arrow-right" /></>}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          <p className="gnote"><i className="ph-duotone ph-info" /> Prévia com o endereço <b>{domain}</b>. Dá pra trocar de template depois, no editor.</p>
        </div>
      </div>
    </div>
  )
}
