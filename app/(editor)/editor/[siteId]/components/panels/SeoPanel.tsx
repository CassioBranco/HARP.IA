'use client'

// ============================================================
// SeoPanel — SEO score ao vivo da página do site (home).
// Mesmo núcleo de 7 checks do editor de posts (lib/seo/score),
// adaptado pros campos de PÁGINA: título/meta da pages, texto
// visível das sections, H2 de section, FAQ e link interno.
// O usuário edita título SEO e meta description aqui mesmo
// (colunas pages.title / pages.meta_description já existentes).
// ============================================================

import { useState, useEffect, useMemo, useCallback } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import {
  buildPageSeoChecks,
  computeSeoScore,
  META_MAX,
  TITLE_MAX,
  type PageSection,
} from '@/lib/seo/score'

type Props = {
  siteId: string
  onSaved: () => void
}

export default function SeoPanel({ siteId, onSaved }: Props) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [pageId, setPageId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [meta, setMeta] = useState('')
  const [sections, setSections] = useState<PageSection[]>([])
  const [hasLinkTargets, setHasLinkTargets] = useState(false)
  const [dirty, setDirty] = useState(false)

  // Carrega página (home) + sections + se há artigos publicados pra linkar.
  const load = useCallback(async () => {
    const supabase = createBrowserClient()
    const { data: page } = await supabase
      .from('pages')
      .select('id, title, meta_description')
      .eq('site_id', siteId)
      .eq('slug', 'home')
      .maybeSingle()

    if (page?.id) {
      setPageId(page.id as string)
      setTitle((page.title as string) ?? '')
      setMeta((page.meta_description as string) ?? '')
      const { data: secs } = await supabase
        .from('sections')
        .select('section_type, content')
        .eq('page_id', page.id)
        .order('order_index')
      setSections((secs ?? []) as PageSection[])
    }

    const { count } = await supabase
      .from('blog_posts')
      .select('*', { count: 'exact', head: true })
      .eq('site_id', siteId)
      .eq('status', 'published')
    setHasLinkTargets((count ?? 0) > 0)
    setLoading(false)
  }, [siteId])

  useEffect(() => { void load() }, [load])

  // Salva título/meta na pages (colunas já existentes — sem migration).
  async function save() {
    if (!pageId || !dirty) return
    setSaving(true)
    const supabase = createBrowserClient()
    await supabase
      .from('pages')
      .update({ title: title.trim() || null, meta_description: meta.trim() || null })
      .eq('id', pageId)
    setSaving(false)
    setDirty(false)
    onSaved()
  }

  // Título efetivo pro check: o título SEO; se vazio, o H1 do hero.
  const heroHeadline = useMemo(() => {
    const hero = sections.find(s => s.section_type === 'hero')
    const h = (hero?.content as { headline?: unknown } | null)?.headline
    return typeof h === 'string' ? h : ''
  }, [sections])

  const checks = useMemo(
    () =>
      buildPageSeoChecks({
        title: title.trim() || heroHeadline,
        metaDescription: meta,
        sections,
        hasLinkTargets,
      }),
    [title, heroHeadline, meta, sections, hasLinkTargets],
  )
  const { score, label: scoreLabel } = computeSeoScore(checks)

  if (loading) return <p className="ed-saving">Carregando…</p>

  if (!pageId) {
    return (
      <p className="ed-hint">
        A página ainda não foi criada. Gere o conteúdo do site com a IA primeiro
        (aba Textos → Preencher tudo com IA).
      </p>
    )
  }

  return (
    <>
      {/* Score ao vivo — mesmos indicadores do editor de posts */}
      <div>
        <div className="seoscore">
          <span style={{ color: 'var(--ink)' }}>Força de SEO da página</span>
          <span>{scoreLabel}</span>
        </div>
        <div className="seobar"><i style={{ width: `${score}%` }} /></div>
        <div className="seochk">
          {checks.map(c => (
            <div className={`ck ${c.ok ? '' : 'todo'}`} key={c.id}>
              <i className={c.ok ? 'ph-fill ph-check-circle' : 'ph-fill ph-circle'} /> {c.label}
            </div>
          ))}
        </div>
      </div>

      <p className="ed-hint" style={{ borderTop: '1px solid var(--line)', paddingTop: '.8rem' }}>
        Título e resumo são o que aparece no resultado do Google. Palavras e
        subtítulos você edita na aba <b>Textos</b>; a FAQ, na seção Perguntas frequentes.
      </p>

      <div className="ed-field-group">
        <label className="lbl" style={{ margin: 0 }}>
          Título da página (Google) <span style={{ color: 'var(--muted2)', fontWeight: 400 }}>· {title.trim().length}/{TITLE_MAX}</span>
        </label>
        <input
          className="field"
          type="text"
          value={title}
          placeholder={heroHeadline || 'Ex.: Clínica Sorriso — Dentista em Chapecó'}
          onChange={e => { setTitle(e.target.value); setDirty(true) }}
          onBlur={save}
        />
      </div>

      <div className="ed-field-group">
        <label className="lbl" style={{ margin: 0 }}>
          Resumo (meta description) <span style={{ color: 'var(--muted2)', fontWeight: 400 }}>· {meta.trim().length}/{META_MAX}</span>
        </label>
        <textarea
          className="field"
          value={meta}
          rows={3}
          style={{ resize: 'vertical' }}
          placeholder="Resumo de 80 a 160 caracteres que aparece embaixo do título no Google."
          onChange={e => { setMeta(e.target.value); setDirty(true) }}
          onBlur={save}
        />
      </div>

      {saving && <p className="ed-saving">Salvando…</p>}
    </>
  )
}
