'use client'

// ============================================================
// Ponte de edição: roda DENTRO do iframe do preview (modo editor,
// chrome=0). Fase 1 do editor visual:
//  1) edição inline de texto (contenteditable) nos campos das seções;
//  2) seleção de seção + toolbar flutuante (mover/duplicar/remover/
//     adicionar seção).
//
// Segurança: o modo edição SÓ ativa quando a página está embedada
// (window.parent !== window) e o editor responde o handshake `init`
// da MESMA origem. Fora disso a ponte fica inerte — preview aberto
// direto e site publicado nunca entram em modo edição.
// Persistência: nada é salvo aqui — toda mudança vira postMessage
// pro editor (useEditBridge), que grava via Supabase com a sessão
// do dono (RLS). O texto sai daqui já sanitizado (texto puro).
// ============================================================

import { useEffect, useRef, useState } from 'react'
import '@phosphor-icons/web/fill'
import {
  FIELD_ATTR,
  IMAGE_SECTION_TYPES,
  IMG_ATTR,
  SECTION_ATTR,
  SECTION_TYPE_LABELS,
  VISUAL_SECTION_TYPES,
  getInlineField,
  listInlineFields,
  sanitizeInlineText,
  validateImageFile,
  type EditorToPreviewMsg,
  type PreviewToEditorMsg,
  type SectionContent,
  type SectionSnapshot,
} from '@/lib/editor/inline-edit'

const ML_ATTR = 'data-anc-ml'

type LegacyMsg = { source: 'ancoreo-preview'; kind: 'image' | 'text'; sectionType?: string }

function post(msg: PreviewToEditorMsg | LegacyMsg) {
  window.parent?.postMessage(msg, window.location.origin)
}

/** CSS do modo edição, injetado só depois do handshake com o editor. */
const EDIT_CSS = `
  [${FIELD_ATTR}] { cursor: text; }
  [${FIELD_ATTR}]:hover { outline: 1.5px dashed #3b82f6 !important; outline-offset: 3px; }
  [${FIELD_ATTR}][contenteditable] { outline: 2px solid #3b82f6 !important; outline-offset: 3px; }
  [${SECTION_ATTR}]:hover { outline: 1px solid rgba(59,130,246,.45); outline-offset: -1px; }
  .anc-sec-on { outline: 2px solid #3b82f6 !important; outline-offset: -2px; }
  img { cursor: pointer; }
  img[${IMG_ATTR}].anc-drop-on { outline: 3px dashed #3b82f6 !important; outline-offset: -3px; filter: brightness(.72); }
  img.anc-img-busy { opacity: .55; }
  .anc-spin { position: absolute; width: 28px; height: 28px; border-radius: 50%;
    border: 3px solid rgba(59,130,246,.25); border-top-color: #3b82f6;
    animation: ancSpin .8s linear infinite; z-index: 99991; pointer-events: none; }
  @keyframes ancSpin { to { transform: rotate(360deg) } }
`

export default function PreviewBridge() {
  const [snap, setSnap] = useState<SectionSnapshot[] | null>(null)
  const [sel, setSel] = useState<{ type: string; el: HTMLElement } | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [, setTick] = useState(0) // reposiciona a toolbar em resize
  const editingRef = useRef<HTMLElement | null>(null)

  // ── Handshake com o editor (parent) ──
  useEffect(() => {
    if (window.parent === window) return // não embedado: ponte inerte

    const applyContent = (sectionType: string, content: SectionContent) => {
      // painel salvou → espelha o texto novo nos campos já marcados
      document.querySelectorAll<HTMLElement>(`[${FIELD_ATTR}]`).forEach(el => {
        const attr = el.getAttribute(FIELD_ATTR) ?? ''
        const sep = attr.indexOf(':')
        if (sep < 0 || attr.slice(0, sep) !== sectionType) return
        if (el === editingRef.current) return // não atropela quem está digitando
        const v = getInlineField(content, attr.slice(sep + 1))
        if (typeof v === 'string') el.textContent = v
      })
    }

    // feedback do upload por drop: escurece o alvo + spinner enquanto sobe,
    // troca o src na hora quando o editor confirma o webp final.
    const spinners = new Map<string, HTMLElement>()
    const setSlotBusy = (slot: string, busy: boolean) => {
      document.querySelectorAll<HTMLImageElement>(`img[${IMG_ATTR}="${slot}"]`)
        .forEach(img => img.classList.toggle('anc-img-busy', busy))
      const cur = spinners.get(slot)
      if (!busy) { cur?.remove(); spinners.delete(slot); return }
      if (cur) return
      const img = document.querySelector<HTMLImageElement>(`img[${IMG_ATTR}="${slot}"]`)
      if (!img) return
      const r = img.getBoundingClientRect()
      const sp = document.createElement('div')
      sp.className = 'anc-spin'
      sp.setAttribute('data-anc-ui', '')
      sp.style.top = `${r.top + window.scrollY + r.height / 2 - 14}px`
      sp.style.left = `${r.left + window.scrollX + r.width / 2 - 14}px`
      document.body.appendChild(sp)
      spinners.set(slot, sp)
    }
    const applyImageStatus = (d: Extract<EditorToPreviewMsg, { type: 'image-status' }>) => {
      if (d.status === 'done' && d.url) {
        const url = d.url
        document.querySelectorAll<HTMLImageElement>(`img[${IMG_ATTR}="${d.sectionType}"]`)
          .forEach(img => { img.removeAttribute('srcset'); img.src = url })
      }
      setSlotBusy(d.sectionType, d.status === 'uploading')
    }

    const onMsg = (e: MessageEvent) => {
      if (e.origin !== window.location.origin || e.source !== window.parent) return
      const d = e.data as EditorToPreviewMsg | null
      if (!d || d.source !== 'ancoreo-editor') return
      if (d.type === 'init') setSnap(d.sections)
      else if (d.type === 'apply-content') applyContent(d.sectionType, d.content)
      else if (d.type === 'image-status') applyImageStatus(d)
    }

    window.addEventListener('message', onMsg)
    post({ source: 'ancoreo-preview', type: 'ready' })
    return () => {
      window.removeEventListener('message', onMsg)
      spinners.forEach(sp => sp.remove())
    }
  }, [])

  // ── Modo edição (só depois do init) ──
  useEffect(() => {
    if (!snap) return

    // 1) marca os campos editáveis: elemento cujo texto bate com o valor
    // atual do campo (o SectionArrange já marcou os blocos de seção antes).
    const candidates = Array.from(document.querySelectorAll<HTMLElement>(
      'h1,h2,h3,h4,h5,h6,p,li,a,button,span,summary,cite,blockquote,figcaption,em,strong,b,div',
    ))
    for (const s of snap) {
      for (const f of listInlineFields(s.section_type, s.content)) {
        const matches = candidates.filter(el => (el.textContent ?? '').trim() === f.value)
        // fica só com os mais internos (um wrapper e o filho podem ter o mesmo texto)
        const deepest = matches.filter(el => !matches.some(o => o !== el && el.contains(o)))
        for (const el of deepest) {
          el.setAttribute(FIELD_ATTR, `${s.section_type}:${f.field}`)
          el.setAttribute(ML_ATTR, f.multiline ? '1' : '0')
        }
      }
    }

    // 1b) marca as imagens que aceitam drop de arquivo: img dentro do bloco
    // hero/about (content.image persiste e o layout renderiza) e também
    // qualquer img cujo src é a própria imagem salva (ex.: faixa "band"
    // fora do bloco about em alguns layouts).
    for (const s of snap) {
      if (!(IMAGE_SECTION_TYPES as readonly string[]).includes(s.section_type) || s.hidden) continue
      document
        .querySelectorAll<HTMLImageElement>(`[${SECTION_ATTR}="${s.section_type}"] img`)
        .forEach(img => img.setAttribute(IMG_ATTR, s.section_type))
      const saved = typeof s.content.image === 'string' ? s.content.image : ''
      if (saved) {
        document.querySelectorAll<HTMLImageElement>('img').forEach(img => {
          if (img.src === saved || img.getAttribute('src') === saved) img.setAttribute(IMG_ATTR, s.section_type)
        })
      }
    }

    // 2) estilos do modo edição
    const style = document.createElement('style')
    style.setAttribute('data-ancoreo-edit', '')
    style.textContent = EDIT_CSS
    document.head.appendChild(style)

    // 3) seleção de seção + clique pra editar
    const selectSection = (el: HTMLElement | null) => {
      document.querySelectorAll('.anc-sec-on').forEach(x => x.classList.remove('anc-sec-on'))
      setMenuOpen(false)
      if (!el) { setSel(null); return }
      el.classList.add('anc-sec-on')
      setSel({ type: el.getAttribute(SECTION_ATTR) ?? '', el })
    }

    const startEdit = (el: HTMLElement) => {
      if (editingRef.current === el) return
      const attr = el.getAttribute(FIELD_ATTR) ?? ''
      const sep = attr.indexOf(':')
      if (sep < 0) return
      const sectionType = attr.slice(0, sep)
      const field = attr.slice(sep + 1)
      const multiline = el.getAttribute(ML_ATTR) === '1'
      const original = el.innerText

      const send = (type: 'text-change' | 'text-commit') => {
        post({ source: 'ancoreo-preview', type, sectionType, field, value: sanitizeInlineText(el.innerText ?? '', multiline) })
      }
      const mirror = () => {
        // mesmo campo repetido no layout (ex.: CTA no nav e no hero) fica em sincronia
        document.querySelectorAll<HTMLElement>(`[${FIELD_ATTR}="${attr}"]`).forEach(o => {
          if (o !== el) o.textContent = el.innerText
        })
      }
      const onInput = () => { mirror(); send('text-change') }
      const onPaste = (ev: ClipboardEvent) => {
        // cola SEMPRE como texto puro
        ev.preventDefault()
        const txt = sanitizeInlineText(ev.clipboardData?.getData('text/plain') ?? '', multiline)
        document.execCommand('insertText', false, txt)
      }
      const onKey = (ev: KeyboardEvent) => {
        if (ev.key === 'Enter' && !multiline) { ev.preventDefault(); el.blur() }
        else if (ev.key === 'Escape') { ev.preventDefault(); el.innerText = original; mirror(); el.blur() }
      }
      const onBlur = () => {
        el.removeAttribute('contenteditable')
        el.removeAttribute('spellcheck')
        el.removeEventListener('input', onInput)
        el.removeEventListener('paste', onPaste)
        el.removeEventListener('keydown', onKey)
        el.removeEventListener('blur', onBlur)
        editingRef.current = null
        send('text-commit')
      }

      el.setAttribute('contenteditable', 'true')
      el.setAttribute('spellcheck', 'false')
      el.addEventListener('input', onInput)
      el.addEventListener('paste', onPaste)
      el.addEventListener('keydown', onKey)
      el.addEventListener('blur', onBlur)
      editingRef.current = el
      el.focus()
    }

    const onClick = (e: MouseEvent) => {
      const t = e.target
      if (!(t instanceof Element)) return
      if (t.closest('[data-anc-ui]')) return // toolbar da ponte: clique normal

      const fieldEl = t.closest<HTMLElement>(`[${FIELD_ATTR}]`)
      if (fieldEl) {
        // no editor, clicar é pra EDITAR — não segue link/CTA
        e.preventDefault()
        e.stopPropagation()
        selectSection(fieldEl.closest<HTMLElement>(`[${SECTION_ATTR}]`))
        startEdit(fieldEl)
        const st = (fieldEl.getAttribute(FIELD_ATTR) ?? '').split(':')[0]
        post({ source: 'ancoreo-preview', kind: 'text', ...(st ? { sectionType: st } : {}) })
        return
      }
      if (t.closest('img')) {
        e.preventDefault()
        e.stopPropagation()
        selectSection(t.closest<HTMLElement>(`[${SECTION_ATTR}]`))
        post({ source: 'ancoreo-preview', kind: 'image' })
        return
      }
      const secEl = t.closest<HTMLElement>(`[${SECTION_ATTR}]`)
      if (secEl) {
        e.preventDefault()
        selectSection(secEl)
        return
      }
      selectSection(null)
    }

    const onResize = () => setTick(n => n + 1)

    // 4) drop de arquivo de imagem do desktop em cima de um alvo marcado.
    // O drop cai AQUI (iframe), mas quem faz o upload é o editor: o File
    // atravessa a ponte por postMessage (structured clone). Valida tipo/
    // tamanho antes de mandar — arquivo inválido nem atravessa.
    let dropEl: HTMLElement | null = null
    const isFileDrag = (e: DragEvent) => Array.from(e.dataTransfer?.types ?? []).includes('Files')
    const setDropTarget = (el: HTMLElement | null) => {
      if (dropEl === el) return
      dropEl?.classList.remove('anc-drop-on')
      dropEl = el
      el?.classList.add('anc-drop-on')
    }
    const findTarget = (t: EventTarget | null) =>
      t instanceof Element ? t.closest<HTMLElement>(`img[${IMG_ATTR}]`) : null
    const onDragOver = (e: DragEvent) => {
      if (!isFileDrag(e)) return
      e.preventDefault() // impede o browser de navegar pro arquivo solto fora do alvo
      const target = findTarget(e.target)
      if (e.dataTransfer) e.dataTransfer.dropEffect = target ? 'copy' : 'none'
      setDropTarget(target)
    }
    const onDrop = (e: DragEvent) => {
      if (!isFileDrag(e)) return
      e.preventDefault()
      const target = findTarget(e.target)
      setDropTarget(null)
      if (!target) return
      const file = e.dataTransfer?.files?.[0]
      if (!file) return
      const issue = validateImageFile(file)
      if (issue) { post({ source: 'ancoreo-preview', type: 'image-reject', reason: issue }); return }
      post({ source: 'ancoreo-preview', type: 'image-drop', sectionType: target.getAttribute(IMG_ATTR) ?? '', file })
    }
    const onDragLeaveWin = (e: DragEvent) => {
      // saiu da janela do iframe: apaga o highlight
      if (!e.relatedTarget) setDropTarget(null)
    }

    document.addEventListener('click', onClick, true)
    window.addEventListener('resize', onResize)
    document.addEventListener('dragover', onDragOver)
    document.addEventListener('drop', onDrop)
    document.addEventListener('dragleave', onDragLeaveWin)

    return () => {
      document.removeEventListener('click', onClick, true)
      window.removeEventListener('resize', onResize)
      document.removeEventListener('dragover', onDragOver)
      document.removeEventListener('drop', onDrop)
      document.removeEventListener('dragleave', onDragLeaveWin)
      setDropTarget(null)
      style.remove()
      document.querySelectorAll(`[${FIELD_ATTR}]`).forEach(el => {
        el.removeAttribute(FIELD_ATTR)
        el.removeAttribute(ML_ATTR)
      })
      document.querySelectorAll(`[${IMG_ATTR}]`).forEach(el => el.removeAttribute(IMG_ATTR))
      document.querySelectorAll('.anc-sec-on').forEach(x => x.classList.remove('anc-sec-on'))
    }
  }, [snap])

  // ── Toolbar contextual da seção selecionada ──
  if (!snap || !sel || !sel.el.isConnected) return null

  const rect = sel.el.getBoundingClientRect()
  const top = Math.max(rect.top + window.scrollY - 46, 8)
  const left = rect.left + window.scrollX + rect.width / 2

  // tipos que dá pra adicionar = sem nenhuma instância visível no momento
  const addable = VISUAL_SECTION_TYPES.filter(
    t => !snap.some(s => s.section_type === t && !s.hidden),
  )

  // ── Arraste da seção pelo handle (Fase 2) ──
  // Mesmo limite da NV1: reordena só entre blocos IRMÃOS no DOM. Enquanto
  // arrasta, a seção fica "fantasma" (opacidade) e uma linha azul marca a
  // vaga de soltura. Soltar envia a nova ordem completa pro editor, que
  // persiste pelo mesmo caminho de order_index dos botões ↑↓.
  const onHandleDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.preventDefault()
    const el = sel.el
    const parent = el.parentElement
    if (!parent) return
    const kids = Array.from(parent.children).filter(
      (c): c is HTMLElement =>
        c instanceof HTMLElement && c.hasAttribute(SECTION_ATTR) && c.style.display !== 'none',
    )
    if (kids.length < 2 || !kids.includes(el)) return
    const others = kids.filter(k => k !== el)

    // linha indicadora da posição de soltura
    const line = document.createElement('div')
    line.setAttribute('data-anc-ui', '')
    Object.assign(line.style, {
      position: 'absolute', height: '3px', background: '#3b82f6',
      borderRadius: '2px', zIndex: '99991', pointerEvents: 'none',
    })
    const pr = parent.getBoundingClientRect()
    line.style.left = `${pr.left + window.scrollX}px`
    line.style.width = `${pr.width}px`
    document.body.appendChild(line)

    el.style.opacity = '.45'
    document.body.style.userSelect = 'none'
    document.body.style.cursor = 'grabbing'

    let insertAt = kids.indexOf(el) > others.length ? others.length : kids.indexOf(el)

    const place = (clientY: number) => {
      const y = clientY + window.scrollY
      let idx = others.length
      for (let i = 0; i < others.length; i++) {
        const o = others[i]
        if (!o) continue
        const r = o.getBoundingClientRect()
        if (y < r.top + window.scrollY + r.height / 2) { idx = i; break }
      }
      insertAt = idx
      const ref = others[idx]
      const last = others[others.length - 1]
      const top = ref
        ? ref.getBoundingClientRect().top + window.scrollY - 2
        : last ? last.getBoundingClientRect().bottom + window.scrollY + 2 : 0
      line.style.top = `${top}px`
    }

    const onMove = (ev: PointerEvent) => {
      // rolagem automática perto das bordas do viewport
      if (ev.clientY < 80) window.scrollBy(0, -16)
      else if (ev.clientY > window.innerHeight - 80) window.scrollBy(0, 16)
      place(ev.clientY)
    }
    const finish = (commit: boolean) => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('keydown', onEsc, true)
      line.remove()
      el.style.opacity = ''
      document.body.style.userSelect = ''
      document.body.style.cursor = ''
      if (!commit) return
      const newKids = [...others]
      newKids.splice(insertAt, 0, el)
      if (newKids.every((k, i) => k === kids[i])) return // não mudou de vaga
      const groupNew = newKids.map(k => k.getAttribute(SECTION_ATTR) ?? '')
      // ordem global: na sequência salva das visíveis, as posições ocupadas
      // pelo grupo de irmãos são reescritas na nova ordem (multiset por tipo,
      // então duplicatas contam certo); o que não é irmão fica onde está.
      const visibleTypes = snap
        .filter(s => !s.hidden && (VISUAL_SECTION_TYPES as readonly string[]).includes(s.section_type))
        .sort((a, b) => a.order_index - b.order_index)
        .map(s => s.section_type)
      const remaining = new Map<string, number>()
      for (const k of kids) {
        const t = k.getAttribute(SECTION_ATTR) ?? ''
        remaining.set(t, (remaining.get(t) ?? 0) + 1)
      }
      let gi = 0
      const order = visibleTypes.map(t => {
        const n = remaining.get(t) ?? 0
        if (n > 0) { remaining.set(t, n - 1); return groupNew[gi++] ?? t }
        return t
      })
      post({ source: 'ancoreo-preview', type: 'section-reorder', order })
    }
    const onUp = () => finish(true)
    const onEsc = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') { ev.preventDefault(); finish(false) }
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('keydown', onEsc, true)
    place(e.clientY)
  }

  const opBtn = (op: 'move-up' | 'move-down' | 'duplicate' | 'remove', icon: string, title: string, danger = false) => (
    <button
      type="button"
      title={title}
      onClick={() => post({ source: 'ancoreo-preview', type: 'section-op', op, sectionType: sel.type })}
      style={{ ...btnStyle, ...(danger ? { color: '#fca5a5' } : {}) }}
    >
      <i className={`ph-fill ${icon}`} style={{ fontSize: 14 }} />
    </button>
  )

  return (
    <div
      data-anc-ui
      style={{
        position: 'absolute',
        top,
        left,
        transform: 'translateX(-50%)',
        zIndex: 99990,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        background: '#0f172a',
        color: '#fff',
        borderRadius: 8,
        padding: '4px 6px',
        boxShadow: '0 6px 20px rgba(0,0,0,.3)',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <button
        type="button"
        title="Arrastar pra reordenar"
        onPointerDown={onHandleDown}
        style={{ ...btnStyle, cursor: 'grab', touchAction: 'none' }}
      >
        <i className="ph-fill ph-dots-six-vertical" style={{ fontSize: 14 }} />
      </button>
      <span style={{ fontSize: 11, fontWeight: 600, padding: '0 6px', whiteSpace: 'nowrap', color: 'rgba(255,255,255,.85)' }}>
        {SECTION_TYPE_LABELS[sel.type] ?? sel.type}
      </span>
      {opBtn('move-up', 'ph-arrow-up', 'Mover pra cima')}
      {opBtn('move-down', 'ph-arrow-down', 'Mover pra baixo')}
      {opBtn('duplicate', 'ph-copy', 'Duplicar seção')}
      {opBtn('remove', 'ph-trash', 'Remover seção', true)}
      <span style={{ width: 1, height: 16, background: 'rgba(255,255,255,.18)', margin: '0 3px' }} />
      <div style={{ position: 'relative' }}>
        <button type="button" title="Adicionar seção" onClick={() => setMenuOpen(o => !o)} style={btnStyle}>
          <i className="ph-fill ph-plus" style={{ fontSize: 14 }} />
        </button>
        {menuOpen && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              right: 0,
              minWidth: 190,
              background: '#0f172a',
              borderRadius: 8,
              padding: 4,
              boxShadow: '0 6px 20px rgba(0,0,0,.3)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {addable.length === 0 && (
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,.6)', padding: '6px 8px' }}>
                Todas as seções do modelo já estão no site.
              </span>
            )}
            {addable.map(t => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setMenuOpen(false)
                  post({ source: 'ancoreo-preview', type: 'section-add', sectionType: t })
                }}
                style={{ ...btnStyle, justifyContent: 'flex-start', fontSize: 12, padding: '6px 8px', width: '100%' }}
              >
                {SECTION_TYPE_LABELS[t] ?? t}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const btnStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
  background: 'none',
  border: 0,
  color: '#fff',
  cursor: 'pointer',
  borderRadius: 6,
  padding: '5px 6px',
  lineHeight: 1,
}
