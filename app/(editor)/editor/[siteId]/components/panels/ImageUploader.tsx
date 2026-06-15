'use client'

import { useState, useRef } from 'react'

type Props = {
  siteId: string
  niche: string
}

type UploadedImage = {
  id: string
  original_url: string
  webp_url: string
  alt_text: string
  width: number
  height: number
  section_hint: string | null
}

export default function ImageUploader({ siteId, niche }: Props) {
  const [images, setImages] = useState<UploadedImage[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    setUploading(true)
    setError(null)

    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue
      setUploadProgress(`Processando ${file.name}...`)

      const formData = new FormData()
      formData.append('file', file)
      formData.append('site_id', siteId)
      formData.append('niche', niche)

      try {
        const res = await fetch('/api/images/upload', { method: 'POST', body: formData })
        if (!res.ok) {
          const { error: msg } = await res.json()
          setError(msg ?? 'Falha no upload')
          continue
        }
        const img: UploadedImage = await res.json()
        setImages(prev => [img, ...prev])
      } catch (e) {
        setError(String(e))
      }
    }

    setUploadProgress(null)
    setUploading(false)
  }

  return (
    <>
      <p className="ed-hint">
        Fotos do seu negócio. Geramos automaticamente alt text SEO, coordenadas GPS e metadados EXIF otimizados.
      </p>

      <button
        onClick={() => inputRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files) }}
        disabled={uploading}
        className="ed-drop"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="17 8 12 3 7 8"/>
          <line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
        <b style={{ fontSize: '.82rem', fontWeight: 700, color: '#fff' }}>
          {uploading ? uploadProgress ?? 'Enviando...' : 'Clique ou arraste imagens aqui'}
        </b>
        <span style={{ fontSize: '.72rem' }}>JPG, PNG, WebP — máx 10 MB</span>
      </button>

      <input ref={inputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => handleFiles(e.target.files)} />

      {error && <p className="ed-err">{error}</p>}

      {images.length > 0 && (
        <div>
          <p className="ed-cap" style={{ marginBottom: '.4rem' }}>Enviadas nesta sessão</p>
          <div className="ed-img-grid">
            {images.map(img => (
              <div key={img.id} className="ed-img">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.webp_url} alt={img.alt_text} />
                <span className="tag">SEO ✓</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="note">
        <i className="ph-duotone ph-sparkle" />
        <span>
          <b style={{ color: '#fff', fontFamily: "'Plus Jakarta Sans'" }}>Ao enviar, a gente faz:</b><br />
          WebP otimizado · alt text por IA · GPS da sua cidade · EXIF completo.
        </span>
      </div>
    </>
  )
}
