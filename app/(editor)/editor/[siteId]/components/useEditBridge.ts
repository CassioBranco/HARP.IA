'use client'

// ============================================================
// Lado do EDITOR da ponte de edição inline (Fase 1 do editor visual).
//  - responde o handshake do iframe (`ready` → `init`) com o snapshot
//    das sections da home;
//  - recebe edições de texto do preview e salva com debounce (~800ms)
//    pelo MESMO caminho do SectionEditor (update de sections.content
//    por page_id + section_type, sessão do dono + RLS);
//  - executa as operações estruturais (mover/duplicar/remover/
//    adicionar seção) e recarrega o preview;
//  - sincroniza painel ↔ preview via CustomEvents (EVT_INLINE_CONTENT
//    / EVT_PANEL_SAVED), sem reload da página.
//
// Decisão de undo (Fase 1): o histórico de "Desfazer" do
// CustomizationPanel é local ao painel e tipado só pra modelo/cor/
// fonte — acoplar as operações estruturais exigiria içar esse estado.
// Em vez disso, remoção pede CONFIRMAÇÃO e toda operação estrutural
// mostra toast com "Desfazer" por 5s (reverte no banco e recarrega).
// "Remover" a última instância de uma seção OCULTA (content._hidden)
// em vez de apagar — o conteúdo continua no banco e "Adicionar seção"
// (ou o Desfazer) traz de volta. Duplicatas extras são apagadas de
// verdade (o conteúdo é compartilhado com a original, nada se perde).
// ============================================================

import { useCallback, useEffect, useRef, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import {
  EVT_INLINE_CONTENT,
  EVT_PANEL_SAVED,
  IMAGE_SECTION_TYPES,
  SECTION_TYPE_LABELS,
  VISUAL_SECTION_TYPES,
  defaultSectionContent,
  sanitizeInlineText,
  setInlineField,
  validateImageFile,
  type EditorToPreviewMsg,
  type PreviewToEditorMsg,
  type SectionContent,
  type SectionSnapshot,
} from '@/lib/editor/inline-edit'

type SectionRow = {
  id: string
  page_id: string
  tenant_id: string | null
  section_type: string
  content: SectionContent
  order_index: number
}

export type InlineSaveState = 'idle' | 'saving' | 'saved'
/** Toast sem `undo` = só aviso (ex.: erro de upload) — não mostra "Desfazer". */
export type UndoToast = { label: string; undo?: () => void }

const isVisual = (t: string) => (VISUAL_SECTION_TYPES as readonly string[]).includes(t)
const isHidden = (r: SectionRow) => Boolean(r.content['_hidden'])

export function useEditBridge(siteId: string, niche: string, onStructural: () => void) {
  const [saveState, setSaveState] = useState<InlineSaveState>('idle')
  const [toast, setToast] = useState<UndoToast | null>(null)

  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const rowsRef = useRef<SectionRow[]>([])
  const pageIdRef = useRef<string | null>(null)
  const readyRef = useRef(false) // iframe pediu init antes das rows carregarem
  const busyRef = useRef(false) // trava operação estrutural concorrente
  const debounceRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const onStructuralRef = useRef(onStructural)
  onStructuralRef.current = onStructural
  const nicheRef = useRef(niche)
  nicheRef.current = niche
  const uploadBusyRef = useRef(false) // trava drop de imagem concorrente

  // ── carga do snapshot (pages/home → sections) ──
  const loadRows = useCallback(async () => {
    const supabase = createBrowserClient()
    if (!pageIdRef.current) {
      const { data: page } = await supabase
        .from('pages')
        .select('id')
        .eq('site_id', siteId)
        .eq('slug', 'home')
        .maybeSingle()
      pageIdRef.current = page?.id ?? null
    }
    if (!pageIdRef.current) return
    const { data } = await supabase
      .from('sections')
      .select('id, page_id, tenant_id, section_type, content, order_index')
      .eq('page_id', pageIdRef.current)
      .order('order_index')
    rowsRef.current = (data ?? []).map(r => ({
      id: r.id as string,
      page_id: r.page_id as string,
      tenant_id: (r.tenant_id ?? null) as string | null,
      section_type: r.section_type as string,
      content: (r.content ?? {}) as SectionContent,
      order_index: (r.order_index ?? 0) as number,
    }))
  }, [siteId])

  const postInit = useCallback(() => {
    const win = iframeRef.current?.contentWindow
    if (!win || rowsRef.current.length === 0) return
    const sections: SectionSnapshot[] = rowsRef.current.map(r => ({
      id: r.id,
      section_type: r.section_type,
      order_index: r.order_index,
      hidden: isHidden(r),
      content: r.content,
    }))
    win.postMessage({ source: 'ancoreo-editor', type: 'init', sections }, window.location.origin)
  }, [])

  useEffect(() => {
    void loadRows().then(() => { if (readyRef.current) postInit() })
  }, [loadRows, postInit])

  // ── persistência de texto (mesmo caminho do SectionEditor) ──
  const persistType = useCallback(async (sectionType: string) => {
    const pageId = pageIdRef.current
    const row = rowsRef.current.find(r => r.section_type === sectionType)
    if (!pageId || !row) return
    setSaveState('saving')
    const supabase = createBrowserClient()
    const { error } = await supabase
      .from('sections')
      .update({ content: row.content })
      .eq('page_id', pageId)
      .eq('section_type', sectionType)
    if (savedTimerRef.current) clearTimeout(savedTimerRef.current)
    setSaveState(error ? 'idle' : 'saved')
    savedTimerRef.current = setTimeout(() => setSaveState('idle'), 1800)
  }, [])

  const onTextChange = useCallback((sectionType: string, field: string, value: string, flush: boolean) => {
    const rows = rowsRef.current.filter(r => r.section_type === sectionType)
    const first = rows[0]
    if (!first) return
    // defesa em profundidade: o bridge já sanitiza, mas a mensagem pode
    // vir de qualquer script da página do preview — sanitiza de novo aqui.
    const clean = sanitizeInlineText(value, true)
    const next = setInlineField(first.content, field, clean)
    rows.forEach(r => { r.content = next })
    // painel (aba Textos) acompanha sem reload
    window.dispatchEvent(new CustomEvent(EVT_INLINE_CONTENT, { detail: { sectionType, content: next } }))
    const timers = debounceRef.current
    const old = timers.get(sectionType)
    if (old) clearTimeout(old)
    if (flush) {
      timers.delete(sectionType)
      void persistType(sectionType)
    } else {
      timers.set(sectionType, setTimeout(() => {
        timers.delete(sectionType)
        void persistType(sectionType)
      }, 800))
    }
  }, [persistType])

  // ── operações estruturais ──
  const showToast = useCallback((label: string, undo?: () => void) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    setToast(undo ? { label, undo } : { label })
    toastTimerRef.current = setTimeout(() => setToast(null), 5000)
  }, [])

  const postToPreview = useCallback((msg: EditorToPreviewMsg) => {
    iframeRef.current?.contentWindow?.postMessage(msg, window.location.origin)
  }, [])

  const refreshAll = useCallback(async () => {
    await loadRows()
    onStructuralRef.current() // recarrega o iframe; a ponte refaz o handshake
  }, [loadRows])

  /** Regrava order_index sequencial na ordem dada (mesmo padrão do
   *  reorderSections em lib/editor/actions.ts, aqui por id). */
  const renumber = useCallback(async (orderedIds: string[]) => {
    const supabase = createBrowserClient()
    for (let i = 0; i < orderedIds.length; i++) {
      const id = orderedIds[i]
      if (!id) continue
      await supabase.from('sections').update({ order_index: i }).eq('id', id)
    }
  }, [])

  /** ids na ordem atual: visuais visíveis primeiro (ordem salva), resto depois */
  const currentOrderIds = useCallback(() => {
    const sorted = [...rowsRef.current].sort((a, b) => a.order_index - b.order_index)
    const visible = sorted.filter(r => isVisual(r.section_type) && !isHidden(r))
    const rest = sorted.filter(r => !visible.includes(r))
    return { visible, ids: [...visible, ...rest].map(r => r.id) }
  }, [])

  const moveSection = useCallback(async (sectionType: string, dir: -1 | 1) => {
    const { visible, ids } = currentOrderIds()
    const idx = visible.findIndex(r => r.section_type === sectionType)
    const j = idx + dir
    if (idx < 0 || j < 0 || j >= visible.length) return
    const before = [...ids]
    const swapped = [...visible]
    const a = swapped[idx]
    const b = swapped[j]
    if (!a || !b) return
    swapped[idx] = b
    swapped[j] = a
    const rest = ids.filter(id => !visible.some(r => r.id === id))
    await renumber([...swapped.map(r => r.id), ...rest])
    await refreshAll()
    showToast('Seção movida.', () => {
      void (async () => { await renumber(before); await refreshAll() })()
    })
  }, [currentOrderIds, renumber, refreshAll, showToast])

  const duplicateSection = useCallback(async (sectionType: string) => {
    const sorted = [...rowsRef.current].sort((a, b) => a.order_index - b.order_index)
    const base = sorted.find(r => r.section_type === sectionType)
    if (!base) return
    const supabase = createBrowserClient()
    const { data: ins, error } = await supabase
      .from('sections')
      .insert({
        page_id: base.page_id,
        tenant_id: base.tenant_id,
        section_type: sectionType,
        content: base.content,
        order_index: base.order_index,
      })
      .select('id')
      .single()
    if (error || !ins) return
    // renumera com a cópia logo depois da original
    const ids: string[] = []
    for (const r of sorted) {
      ids.push(r.id)
      if (r.id === base.id) ids.push(ins.id as string)
    }
    await renumber(ids)
    await refreshAll()
    showToast('Seção duplicada.', () => {
      void (async () => {
        await supabase.from('sections').delete().eq('id', ins.id as string)
        await refreshAll()
      })()
    })
  }, [renumber, refreshAll, showToast])

  const removeSection = useCallback(async (sectionType: string) => {
    const label = SECTION_TYPE_LABELS[sectionType] ?? sectionType
    if (!window.confirm(`Remover a seção "${label}" do site?`)) return
    const rows = rowsRef.current
      .filter(r => r.section_type === sectionType && !isHidden(r))
      .sort((a, b) => a.order_index - b.order_index)
    const supabase = createBrowserClient()
    if (rows.length > 1) {
      // instância duplicada: apaga a última cópia (conteúdo compartilhado)
      const last = rows[rows.length - 1]
      if (!last) return
      const backup = { ...last }
      await supabase.from('sections').delete().eq('id', last.id)
      await refreshAll()
      showToast('Seção removida.', () => {
        void (async () => {
          await supabase.from('sections').insert({
            page_id: backup.page_id,
            tenant_id: backup.tenant_id,
            section_type: backup.section_type,
            content: backup.content,
            order_index: backup.order_index,
          })
          await refreshAll()
        })()
      })
    } else {
      // última instância: oculta (não apaga — o conteúdo fica no banco)
      const row = rows[0]
      if (!row) return
      const next = { ...row.content, _hidden: true }
      await supabase.from('sections').update({ content: next }).eq('id', row.id)
      await refreshAll()
      showToast('Seção removida.', () => {
        void (async () => {
          const rest: SectionContent = { ...next }
          delete rest['_hidden']
          await supabase.from('sections').update({ content: rest }).eq('id', row.id)
          await refreshAll()
        })()
      })
    }
  }, [refreshAll, showToast])

  const addSection = useCallback(async (sectionType: string) => {
    if (!isVisual(sectionType)) return
    const supabase = createBrowserClient()
    const existing = rowsRef.current.filter(r => r.section_type === sectionType)
    if (existing.length > 0) {
      // já existe oculta → só reexibe (conteúdo antigo preservado)
      for (const r of existing) {
        const rest = { ...r.content }
        delete rest['_hidden']
        await supabase.from('sections').update({ content: rest }).eq('id', r.id)
      }
      await refreshAll()
      showToast('Seção adicionada.', () => {
        void (async () => {
          for (const r of existing) {
            await supabase.from('sections').update({ content: { ...r.content, _hidden: true } }).eq('id', r.id)
          }
          await refreshAll()
        })()
      })
    } else {
      const pageId = pageIdRef.current
      const tenantId = rowsRef.current[0]?.tenant_id ?? null
      if (!pageId) return
      const maxOrder = rowsRef.current.reduce((m, r) => Math.max(m, r.order_index), 0)
      const { data: ins, error } = await supabase
        .from('sections')
        .insert({
          page_id: pageId,
          tenant_id: tenantId,
          section_type: sectionType,
          content: defaultSectionContent(sectionType),
          order_index: maxOrder + 1,
        })
        .select('id')
        .single()
      if (error || !ins) return
      await refreshAll()
      showToast('Seção adicionada.', () => {
        void (async () => {
          await supabase.from('sections').delete().eq('id', ins.id as string)
          await refreshAll()
        })()
      })
    }
  }, [refreshAll, showToast])

  // ── Fase 2: reordenar por arraste (mesmo caminho de order_index) ──
  // `order` = section_types visíveis na nova ordem (repetidos = duplicatas).
  // Consome uma linha por tipo em fila, então duplicatas mantêm consistência.
  const reorderFromDrag = useCallback(async (order: string[]) => {
    if (!Array.isArray(order) || order.length === 0) return
    if (!order.every(t => typeof t === 'string' && isVisual(t))) return
    const { visible, ids } = currentOrderIds()
    const before = [...ids]
    const pool = new Map<string, SectionRow[]>()
    for (const r of visible) {
      const q = pool.get(r.section_type) ?? []
      q.push(r)
      pool.set(r.section_type, q)
    }
    const next: SectionRow[] = []
    for (const t of order) {
      const r = pool.get(t)?.shift()
      if (r) next.push(r)
    }
    // linha que a mensagem não citou (inconsistência) preserva a posição no fim
    for (const r of visible) if (!next.includes(r)) next.push(r)
    const rest = ids.filter(id => !visible.some(r => r.id === id))
    const after = [...next.map(r => r.id), ...rest]
    if (after.every((id, i) => id === before[i])) return // nada mudou
    await renumber(after)
    await refreshAll()
    showToast('Seção movida.', () => {
      void (async () => { await renumber(before); await refreshAll() })()
    })
  }, [currentOrderIds, renumber, refreshAll, showToast])

  // ── Fase 2: drop de imagem do desktop no preview ──
  // O File chega do iframe por postMessage (structured clone); o upload roda
  // AQUI (sessão do dono + RLS) pelo MESMO fluxo do painel Imagens:
  // POST /api/images/upload → webp_url → content.image da section.
  const uploadImageDrop = useCallback(async (sectionType: string, file: File) => {
    if (!(IMAGE_SECTION_TYPES as readonly string[]).includes(sectionType)) return
    // não confia no iframe: revalida MIME e tamanho antes de subir
    if (!(file instanceof File) || validateImageFile(file)) {
      showToast('Arquivo inválido — só imagens de até 10 MB.')
      return
    }
    const rows = rowsRef.current.filter(r => r.section_type === sectionType)
    const first = rows[0]
    if (!first || uploadBusyRef.current) return
    uploadBusyRef.current = true
    const prev = first.content
    setSaveState('saving')
    postToPreview({ source: 'ancoreo-editor', type: 'image-status', sectionType, status: 'uploading' })
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('site_id', siteId)
      formData.append('niche', nicheRef.current)
      const res = await fetch('/api/images/upload', { method: 'POST', body: formData })
      if (!res.ok) throw new Error('upload')
      const img = (await res.json()) as { webp_url?: string }
      if (!img.webp_url) throw new Error('upload')
      const url = img.webp_url
      const next = { ...first.content, image: url }
      rows.forEach(r => { r.content = next })
      await persistType(sectionType) // grava content.image (page_id + section_type, RLS)
      // painel acompanha sem reload; iframe troca o src na hora
      window.dispatchEvent(new CustomEvent(EVT_INLINE_CONTENT, { detail: { sectionType, content: next } }))
      postToPreview({ source: 'ancoreo-editor', type: 'image-status', sectionType, status: 'done', url })
      showToast('Imagem atualizada.', () => {
        void (async () => {
          rowsRef.current
            .filter(r => r.section_type === sectionType)
            .forEach(r => { r.content = prev })
          await persistType(sectionType)
          await refreshAll() // recarrega o preview com a imagem anterior
        })()
      })
    } catch {
      setSaveState('idle')
      postToPreview({ source: 'ancoreo-editor', type: 'image-status', sectionType, status: 'error' })
      showToast('Não consegui enviar a imagem. Tente de novo.')
    } finally {
      uploadBusyRef.current = false
    }
  }, [siteId, persistType, refreshAll, showToast, postToPreview])

  // ── mensagens vindas do iframe ──
  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      // só aceita mensagens do NOSSO iframe e da NOSSA origem
      if (e.origin !== window.location.origin) return
      if (!iframeRef.current?.contentWindow || e.source !== iframeRef.current.contentWindow) return
      const d = e.data as PreviewToEditorMsg | null
      if (!d || d.source !== 'ancoreo-preview' || !('type' in d) || typeof d.type !== 'string') return

      if (d.type === 'ready') {
        readyRef.current = true
        // site recém-gerado: as rows podem ter carregado vazias antes da
        // geração terminar — recarrega antes de responder o handshake.
        if (rowsRef.current.length === 0) void loadRows().then(postInit)
        else postInit()
        return
      }
      if (d.type === 'text-change' || d.type === 'text-commit') {
        onTextChange(d.sectionType, d.field, d.value, d.type === 'text-commit')
        return
      }
      // operações estruturais: uma por vez
      const run = async (fn: () => Promise<void>) => {
        if (busyRef.current) return
        busyRef.current = true
        try { await fn() } finally { busyRef.current = false }
      }
      if (d.type === 'section-op') {
        if (d.op === 'move-up') void run(() => moveSection(d.sectionType, -1))
        else if (d.op === 'move-down') void run(() => moveSection(d.sectionType, 1))
        else if (d.op === 'duplicate') void run(() => duplicateSection(d.sectionType))
        else if (d.op === 'remove') void run(() => removeSection(d.sectionType))
      } else if (d.type === 'section-add') {
        void run(() => addSection(d.sectionType))
      } else if (d.type === 'section-reorder') {
        void run(() => reorderFromDrag(d.order))
      } else if (d.type === 'image-drop') {
        if (typeof d.sectionType === 'string' && d.file instanceof File) {
          void uploadImageDrop(d.sectionType, d.file)
        }
      } else if (d.type === 'image-reject') {
        showToast(d.reason === 'size'
          ? 'Imagem acima de 10 MB — envie um arquivo menor.'
          : 'Só arquivos de imagem (JPG, PNG ou WebP).')
      }
    }
    window.addEventListener('message', onMsg)
    return () => window.removeEventListener('message', onMsg)
  }, [postInit, loadRows, onTextChange, moveSection, duplicateSection, removeSection, addSection, reorderFromDrag, uploadImageDrop, showToast])

  // ── painel (aba Textos) salvou → espelha no preview sem reload ──
  useEffect(() => {
    const onPanelSaved = (e: Event) => {
      const d = (e as CustomEvent).detail as { sectionType?: string; content?: SectionContent } | null
      if (!d?.sectionType || !d.content) return
      const content = d.content
      rowsRef.current
        .filter(r => r.section_type === d.sectionType)
        .forEach(r => { r.content = content })
      iframeRef.current?.contentWindow?.postMessage(
        { source: 'ancoreo-editor', type: 'apply-content', sectionType: d.sectionType, content },
        window.location.origin,
      )
    }
    window.addEventListener(EVT_PANEL_SAVED, onPanelSaved)
    return () => window.removeEventListener(EVT_PANEL_SAVED, onPanelSaved)
  }, [])

  const runUndo = useCallback(() => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    if (!toast) return
    const { undo } = toast
    setToast(null)
    undo?.()
  }, [toast])

  return { iframeRef, saveState, toast, runUndo }
}
