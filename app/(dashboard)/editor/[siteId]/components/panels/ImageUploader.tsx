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
    <div className="flex flex-col gap-4">
      <p className="text-xs text-muted-foreground">
        Fotos do seu negócio. Geraremos automaticamente alt text SEO, coordenadas GPS e metadados EXIF otimizados.
      </p>

      {/* Drop zone */}
      <button
        onClick={() => inputRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files) }}
        disabled={uploading}
        className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-8 transition-colors hover:border-primary/50 hover:bg-primary/5 disabled:opacity-50"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="17 8 12 3 7 8"/>
          <line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
        <span className="text-xs font-semibold text-foreground">
          {uploading ? uploadProgress ?? 'Enviando...' : 'Clique ou arraste imagens aqui'}
        </span>
        <span className="text-[11px] text-muted-foreground">JPG, PNG, WebP — máx 10 MB</span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={e => handleFiles(e.target.files)}
      />

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[11px] text-red-600">{error}</p>
      )}

      {/* Galeria de imagens já enviadas */}
      {images.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Enviadas nesta sessão</p>
          <div className="grid grid-cols-2 gap-2">
            {images.map(img => (
              <div key={img.id} className="group relative overflow-hidden rounded-lg border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.webp_url}
                  alt={img.alt_text}
                  className="aspect-square w-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <p className="line-clamp-2 text-[10px] text-white">{img.alt_text}</p>
                </div>
                <div className="absolute right-1 top-1">
                  <span className="rounded-full bg-green-500 px-1.5 py-0.5 text-[9px] font-bold text-white">SEO ✓</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info sobre o processo */}
      <div className="rounded-xl border border-border bg-muted/40 p-3">
        <p className="text-[11px] font-semibold text-foreground mb-1">O que acontece ao enviar:</p>
        <ul className="flex flex-col gap-0.5">
          {[
            'Conversão para WebP otimizado',
            'Alt text gerado por IA (SEO)',
            'Coordenadas GPS da sua cidade',
            'Metadados EXIF completos',
          ].map(item => (
            <li key={item} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span className="text-primary">✓</span> {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
