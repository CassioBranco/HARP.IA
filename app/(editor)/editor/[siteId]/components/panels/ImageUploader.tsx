'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import { AiHelp } from '@/components/draft/AiHelp'

type Props = {
  siteId: string
  niche: string
  onAssigned?: () => void
}

type UploadedImage = {
  id: string
  webp_url: string
  alt_text: string | null
}

// Onde cada imagem pode ser usada no site. section_type = chave na tabela sections.
const SLOTS: { key: string; label: string }[] = [
  { key: 'hero',  label: 'Capa (hero)' },
  { key: 'about', label: 'Sobre' },
]

export default function ImageUploader({ siteId, niche, onAssigned }: Props) {
  const [images, setImages] = useState<UploadedImage[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  // mapa section_type -> webp_url atualmente usado, pra marcar o que está aplicado
  const [assigned, setAssigned] = useState<Record<string, string>>({})
  const inputRef = useRef<HTMLInputElement>(null)

  const load = useCallback(async () => {
    const supabase = createBrowserClient()
    // galeria de imagens do site (banco de imagens do cliente)
    const { data: imgs } = await supabase
      .from('images')
      .select('id, webp_url, alt_text')
      .eq('site_id', siteId)
      .order('created_at', { ascending: false })
    setImages((imgs ?? []) as UploadedImage[])

    // descobre o que já está aplicado em cada seção
    const { data: page } = await supabase
      .from('pages').select('id').eq('site_id', siteId).eq('slug', 'home').maybeSingle()
    if (page?.id) {
      const { data: secs } = await supabase
        .from('sections').select('section_type, content').eq('page_id', page.id)
      const map: Record<string, string> = {}
      for (const s of secs ?? []) {
        const url = (s.content as { image?: string } | null)?.image
        if (url) map[s.section_type] = url
      }
      setAssigned(map)
    }
    setLoading(false)
  }, [siteId])

  useEffect(() => { load() }, [load])

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    setUploading(true)
    setError(null)
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue
      setProgress(`Processando ${file.name}…`)
      const formData = new FormData()
      formData.append('file', file)
      formData.append('site_id', siteId)
      formData.append('niche', niche)
      try {
        const res = await fetch('/api/images/upload', { method: 'POST', body: formData })
        if (!res.ok) {
          const j = await res.json().catch(() => ({}))
          setError(j.error ?? 'Falha no upload')
          continue
        }
        const img: UploadedImage = await res.json()
        setImages(prev => [img, ...prev])
      } catch (e) {
        setError(String(e))
      }
    }
    setProgress(null)
    setUploading(false)
  }

  // Aplica a imagem numa seção: grava content.image na section correspondente.
  async function assign(sectionType: string, url: string) {
    const supabase = createBrowserClient()
    const { data: page } = await supabase
      .from('pages').select('id, tenant_id').eq('site_id', siteId).eq('slug', 'home').maybeSingle()
    if (!page?.id) { setError('Gere o site antes de aplicar imagens.'); return }

    const { data: sec } = await supabase
      .from('sections').select('id, content').eq('page_id', page.id).eq('section_type', sectionType).maybeSingle()

    const merged = { ...((sec?.content as Record<string, unknown>) ?? {}), image: url }
    if (sec?.id) {
      await supabase.from('sections').update({ content: merged }).eq('id', sec.id)
    } else {
      // tenant_id obrigatório pela RLS de sections (herda da página)
      await supabase.from('sections').insert({ page_id: page.id, tenant_id: page.tenant_id, section_type: sectionType, content: merged })
    }
    setAssigned(prev => ({ ...prev, [sectionType]: url }))
    onAssigned?.()
  }

  return (
    <>
      <p className="ed-hint">
        Seu banco de imagens. Envie as fotos do negócio e escolha onde cada uma aparece no site.
        Geramos WebP e metadados de SEO automaticamente.
      </p>
      <div style={{ margin: '0 0 .6rem' }}>
        <AiHelp>A IA escreve o alt text (SEO) de cada foto</AiHelp>
      </div>

      <button
        onClick={() => inputRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files) }}
        disabled={uploading}
        className="ed-drop"
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <b style={{ fontSize: '.82rem', fontWeight: 700, color: '#fff' }}>
          {uploading ? progress ?? 'Enviando…' : 'Clique ou arraste fotos aqui'}
        </b>
        <span style={{ fontSize: '.72rem' }}>JPG, PNG, WebP — máx 10 MB</span>
      </button>

      <input ref={inputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => handleFiles(e.target.files)} />

      {error && <p className="ed-err">{error}</p>}

      <p className="ed-cap" style={{ marginTop: '.2rem' }}>
        {loading ? 'Carregando galeria…' : images.length ? `Suas fotos (${images.length})` : 'Nenhuma foto ainda'}
      </p>

      {!loading && images.length > 0 && (
        <div className="ed-gal">
          {images.map(img => {
            const usedIn = SLOTS.filter(s => assigned[s.key] === img.webp_url)
            return (
              <div key={img.id} className="ed-gal-card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.webp_url} alt={img.alt_text ?? ''} />
                {usedIn.length > 0 && (
                  <span className="ed-gal-used">{usedIn.map(s => s.label).join(' · ')}</span>
                )}
                <div className="ed-gal-actions">
                  {SLOTS.map(s => (
                    <button
                      key={s.key}
                      onClick={() => assign(s.key, img.webp_url)}
                      className={`ed-gal-btn ${assigned[s.key] === img.webp_url ? 'on' : ''}`}
                      title={`Usar como ${s.label}`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
                {img.alt_text && <span className="ed-gal-alt" title={img.alt_text}>{img.alt_text}</span>}
              </div>
            )
          })}
        </div>
      )}

      <div className="note">
        <i className="ph-duotone ph-sparkle" />
        <span>
          <b style={{ color: '#fff', fontFamily: "'Plus Jakarta Sans'" }}>Ao enviar:</b> WebP otimizado · alt text por IA · GPS da cidade · EXIF. Clique em <b>Capa</b> ou <b>Sobre</b> pra usar a foto naquela seção.
        </span>
      </div>
    </>
  )
}
