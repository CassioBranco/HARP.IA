'use client'

// ============================================================
// ScoreBar — barra âncora do editor (topo, sempre visível).
// Porta o elemento central do wireframe Lovable/Figma pro editor
// real: score agregado + 3 sub-scores SEO · GEO · AEO, calculados
// AO VIVO do conteúdo do site (lib/seo/site-score). O botão abre
// "o que falta" — a lista de checks pendentes por dimensão.
//
// Slice 2: cada item pendente vira ACIONÁVEL. Item que só o dono
// sabe (telefone/contato) abre um campo pra digitar e grava direto
// em hero.cta_phone (mesmo caminho de escrita do editor: client
// Supabase + RLS por tenant). Os demais mostram "como resolver".
// Recarrega quando `refreshKey` muda (cada save do painel / preview).
// ============================================================

import { useState, useEffect, useMemo, useCallback } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import { buildSiteScores, type DimensionKey, type SiteScores } from '@/lib/seo/site-score'
import type { PageSection } from '@/lib/seo/score'

type Props = {
  siteId: string
  /** Muda a cada refresh do preview — dispara o recálculo do score. */
  refreshKey: number
}

const RING = 2 * Math.PI * 26 // circunferência do círculo (r=26)

// Mesma régua do check 'contato' em lib/seo/site-score (buildGeoChecks):
// telefone BR com ou sem DDD/9. Mantido em sincronia de propósito.
const PHONE_RE = /\(?\d{2}\)?\s*9?\d{4}[-\s]?\d{4}/

// "Como resolver" por check que NÃO tem correção automática aqui — a
// ação certa mora em outro painel (SEO, Serviços, FAQ, Blog). Texto
// curto e sem passo-a-passo de UI, só aponta o caminho.
const FIX_HINT: Record<string, string> = {
  titulo: 'Preencha o título da página na aba SEO do editor.',
  'titulo-60': 'Encurte o título para até 60 caracteres na aba SEO.',
  meta: 'Escreva o resumo (meta) entre 80 e 160 caracteres na aba SEO.',
  palavras: 'Adicione mais conteúdo às seções: o site precisa de 300+ palavras no total.',
  h2: 'Preencha ao menos uma seção com título (ex: Sobre ou Serviços).',
  'link-interno': 'Publique um artigo no blog e vincule-o à home.',
  entidade: 'Preencha o título do topo (hero) com o nome do negócio.',
  descricao: 'Preencha a seção "Sobre": quem é o negócio e o que faz.',
  oferta: 'Adicione ao menos 1 serviço ou produto na seção de serviços.',
  estrutura: 'Deixe pelo menos 3 seções de conteúdo preenchidas.',
  substancia: 'Escreva mais: 300+ palavras no total dão substância pra IA citar.',
  faq: 'Adicione perguntas e respostas na seção de FAQ.',
  'faq-3': 'Chegue a pelo menos 3 perguntas na FAQ.',
  'faq-objetiva': 'Deixe cada resposta da FAQ com até 60 palavras.',
  'oferta-itens': 'Liste pelo menos 3 itens de serviço ou produto.',
}

function scoreColor(n: number): string {
  if (n >= 80) return '#22c55e' // bom
  if (n >= 50) return '#f59e0b' // regular
  return '#ef4444' // fraco
}

function heroContentOf(sections: PageSection[]): Record<string, unknown> {
  const hero = sections.find(s => s.section_type === 'hero')
  return (hero?.content as Record<string, unknown> | null) ?? {}
}

export default function ScoreBar({ siteId, refreshKey }: Props) {
  const [title, setTitle] = useState('')
  const [meta, setMeta] = useState('')
  const [sections, setSections] = useState<PageSection[]>([])
  const [hasLinkTargets, setHasLinkTargets] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [open, setOpen] = useState<DimensionKey | null>(null)

  // Slice 2: estado da correção inline.
  const [pageId, setPageId] = useState<string | null>(null)
  const [fixOpen, setFixOpen] = useState<string | null>(null) // id do check aberto
  const [phoneVal, setPhoneVal] = useState('')
  const [saving, setSaving] = useState(false)
  const [fixErr, setFixErr] = useState<string | null>(null)

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
    setLoaded(true)
  }, [siteId])

  useEffect(() => { void load() }, [load, refreshKey])

  // Ao abrir o fixer do telefone, pré-preenche com o que já houver no hero.
  useEffect(() => {
    if (fixOpen === 'contato') {
      const cur = heroContentOf(sections).cta_phone
      setPhoneVal(typeof cur === 'string' ? cur : '')
      setFixErr(null)
    }
  }, [fixOpen, sections])

  const scores: SiteScores | null = useMemo(() => {
    if (!loaded || sections.length === 0) return null
    return buildSiteScores({ title, metaDescription: meta, sections, hasLinkTargets })
  }, [loaded, title, meta, sections, hasLinkTargets])

  // Grava o telefone no hero.cta_phone (preserva os demais campos do hero).
  async function saveHeroPhone() {
    const v = phoneVal.trim()
    if (!PHONE_RE.test(v)) {
      setFixErr('Digite um telefone válido com DDD, ex: (15) 98819-0210.')
      return
    }
    if (!pageId) { setFixErr('Não consegui identificar a página. Recarregue o editor.'); return }
    setSaving(true)
    setFixErr(null)
    const supabase = createBrowserClient()
    const content = { ...heroContentOf(sections), cta_phone: v }
    const { error } = await supabase
      .from('sections')
      .update({ content })
      .eq('page_id', pageId)
      .eq('section_type', 'hero')
    setSaving(false)
    if (error) { setFixErr('Não consegui salvar agora. Tente de novo.'); return }
    setFixOpen(null)
    await load() // recalcula o score na hora
  }

  // Sem conteúdo ainda (site recém-criado gerando): barra neutra, sem números falsos.
  if (!scores) {
    return (
      <div className="ed-score">
        <div className="ed-score-ring is-empty"><span>—</span></div>
        <div className="ed-score-empty">Otimização IA &amp; Busca — gerando o conteúdo…</div>
      </div>
    )
  }

  const openDim = open ? scores.dimensions.find(d => d.key === open) ?? null : null

  return (
    <div className="ed-score">
      {/* Score agregado — círculo */}
      <div className="ed-score-ring" title={`Otimização geral: ${scores.overall}/100`}>
        <svg viewBox="0 0 60 60" width="56" height="56">
          <circle cx="30" cy="30" r="26" fill="none" stroke="var(--line)" strokeWidth="6" />
          <circle
            cx="30" cy="30" r="26" fill="none"
            stroke={scoreColor(scores.overall)} strokeWidth="6" strokeLinecap="round"
            strokeDasharray={RING}
            strokeDashoffset={RING * (1 - scores.overall / 100)}
            transform="rotate(-90 30 30)"
            style={{ transition: 'stroke-dashoffset .5s ease, stroke .5s ease' }}
          />
        </svg>
        <span style={{ color: scoreColor(scores.overall) }}>{scores.overall}</span>
      </div>
      <div className="ed-score-cap">
        Otimização<br />IA &amp; Busca
      </div>

      {/* 3 sub-scores */}
      <div className="ed-score-dims">
        {scores.dimensions.map(d => {
          const pending = d.checks.filter(c => !c.ok).length
          return (
            <button
              key={d.key}
              className={`ed-score-dim ${open === d.key ? 'on' : ''}`}
              onClick={() => { setOpen(open === d.key ? null : d.key); setFixOpen(null) }}
              title={d.hint}
            >
              <div className="ed-score-dim-top">
                <span className="lbl">{d.label}</span>
                <span className="val" style={{ color: scoreColor(d.score) }}>{d.score}</span>
              </div>
              <div className="ed-score-track">
                <i style={{ width: `${d.score}%`, background: scoreColor(d.score) }} />
              </div>
              <span className="ed-score-pending">
                {pending === 0 ? 'tudo certo ✓' : `${pending} ${pending === 1 ? 'item' : 'itens'} pra melhorar`}
              </span>
            </button>
          )
        })}
      </div>

      {/* Botão de ação — abre a pior dimensão (a de menor score). */}
      <button
        className="ed-score-cta"
        onClick={() => {
          const worst = [...scores.dimensions].sort((a, b) => a.score - b.score)[0]
          setFixOpen(null)
          setOpen(open || !worst ? null : worst.key)
        }}
      >
        <i className="ph-fill ph-sparkle" /> Melhorar SEO/GEO/AEO
      </button>

      {/* Dropdown: checks da dimensão selecionada, itens pendentes acionáveis */}
      {openDim && (
        <div className="ed-score-pop">
          <div className="ed-score-pop-head">
            <b>{openDim.label}</b>
            <span style={{ color: scoreColor(openDim.score) }}>{openDim.score}/100</span>
          </div>
          <p className="ed-score-pop-hint">{openDim.hint}</p>
          <div className="ed-score-pop-list">
            {openDim.checks.map(c => {
              if (c.ok) {
                return (
                  <div className="row ok" key={c.id}>
                    <i className="ph-fill ph-check-circle" />
                    <span>{c.label}</span>
                  </div>
                )
              }
              const isOpen = fixOpen === c.id
              const canPhone = c.id === 'contato'
              return (
                <div key={c.id} className="ed-score-fix-wrap">
                  <button
                    className={`row todo as-btn ${isOpen ? 'on' : ''}`}
                    onClick={() => setFixOpen(isOpen ? null : c.id)}
                  >
                    <i className="ph-fill ph-circle-dashed" />
                    <span>{c.label}</span>
                    <i className={`ph ph-caret-${isOpen ? 'up' : 'down'} caret`} />
                  </button>

                  {isOpen && (
                    <div className="ed-score-fix">
                      {canPhone ? (
                        <>
                          <label className="ed-score-fix-lbl">
                            Telefone ou WhatsApp com DDD
                          </label>
                          <div className="ed-score-fix-row">
                            <input
                              className="ed-score-fix-input"
                              value={phoneVal}
                              onChange={e => setPhoneVal(e.target.value)}
                              placeholder="(15) 98819-0210"
                              inputMode="tel"
                            />
                            <button
                              className="ed-score-fix-save"
                              onClick={saveHeroPhone}
                              disabled={saving}
                            >
                              {saving ? 'Salvando…' : 'Salvar'}
                            </button>
                          </div>
                          {fixErr
                            ? <p className="ed-score-fix-err">{fixErr}</p>
                            : <p className="ed-score-fix-note">Aparece no botão de contato e ajuda a IA a citar seu negócio.</p>}
                        </>
                      ) : (
                        <p className="ed-score-fix-note">
                          {FIX_HINT[c.id] ?? 'Complete este item no painel de edição.'}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          <button className="ed-score-pop-close" onClick={() => { setOpen(null); setFixOpen(null) }}>Fechar</button>
        </div>
      )}
    </div>
  )
}
