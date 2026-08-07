'use client'

import { useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { gbpCadence } from '@/lib/seo/local-presence'
import VincularPerfil from './VincularPerfil'
import {
  POSTS_POR_MES, grupoDoPost, resumoDaAgenda, rotuloDaData,
  type GrupoAgenda,
} from '@/lib/seo/gbp-calendar'

export type GbpPostRow = {
  id: string
  post_type: 'novidade' | 'oferta' | 'evento'
  content: string
  cta_label: string | null
  cta_url: string | null
  status: 'draft' | 'used'
  published_at: string | null
  scheduled_for: string | null
  created_at: string
  /** Metadados livres. Guarda a origem quando o post nasceu de um artigo. */
  extra?: unknown
}

/** De qual artigo este post veio, se veio de algum. */
function origemDoPost(extra: unknown): { titulo: string; url: string } | null {
  if (!extra || typeof extra !== 'object') return null
  const o = (extra as { origem?: { tipo?: unknown; titulo?: unknown; url?: unknown } }).origem
  if (!o || o.tipo !== 'blog') return null
  if (typeof o.titulo !== 'string' || typeof o.url !== 'string') return null
  return { titulo: o.titulo, url: o.url }
}

/**
 * O assunto que este post levaria pro blog.
 *
 * O caminho contrário (perfil → artigo) é de um clique, não automático.
 * Gerar artigo sozinho a cada post custaria dinheiro de IA e encheria o
 * painel de rascunho que ninguém pediu. Aqui o post só entrega o assunto;
 * quem decide escrever é o dono.
 */
function pautaDoPost(content: string): string {
  const fim = content.search(/[.!?](\s|$)/)
  const primeira = fim > 0 ? content.slice(0, fim + 1) : content
  const limpa = primeira.replace(/\s+/g, ' ').trim()
  return limpa.length > 90 ? `${limpa.slice(0, 90).trim()}…` : limpa
}

const TYPES: { id: GbpPostRow['post_type']; label: string; icon: string; hint: string }[] = [
  { id: 'novidade', label: 'Novidade', icon: 'ph-megaphone',     hint: 'Dica, bastidor ou atualização do negócio' },
  { id: 'oferta',   label: 'Oferta',   icon: 'ph-tag',           hint: 'Promoção ou condição especial' },
  { id: 'evento',   label: 'Evento',   icon: 'ph-calendar-star', hint: 'Ação com começo e fim' },
]

const TYPE_LABEL: Record<GbpPostRow['post_type'], string> = {
  novidade: 'Novidade', oferta: 'Oferta', evento: 'Evento',
}

// A ordem em que as seções aparecem é a ordem em que o dono deve agir.
// Publicado por último: é histórico, não tarefa.
const ORDEM_GRUPOS: GrupoAgenda[] = ['atrasado', 'hoje', 'avulso', 'semana', 'depois', 'publicado']

const TITULO_GRUPO: Record<GrupoAgenda, string> = {
  atrasado:  'Passou da data',
  hoje:      'Pra hoje',
  avulso:    'Fora do calendário',
  semana:    'Esta semana',
  depois:    'Mais pra frente',
  publicado: 'Já publicados',
}

function dataCurta(iso: string | null) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

export default function GbpClient({
  siteId, gpeConnected, gpeLink, buscaAlternativa, initialPosts,
}: {
  siteId: string
  gpeConnected: boolean
  gpeLink: string
  /** "nome do negócio + cidade": o que procurar no mapa quando o link
   *  colado não trouxer nome nem identificador. */
  buscaAlternativa?: string
  initialPosts: GbpPostRow[]
}) {
  const [posts, setPosts] = useState<GbpPostRow[]>(initialPosts)
  const [postType, setPostType] = useState<GbpPostRow['post_type']>('novidade')
  const [topic, setTopic] = useState('')
  const [gen, setGen] = useState(false)
  const [genMes, setGenMes] = useState(false)
  const [avulsoAberto, setAvulsoAberto] = useState(false)
  const [err, setErr] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [marcando, setMarcando] = useState<string | null>(null)

  // Cadência: dias desde a última publicação CONFIRMADA no perfil. Rascunho
  // gerado não entra — ele não existe pro Google, e contar isso como presença
  // era o que fazia a tela dizer "você postou hoje" pra quem não postou.
  const cadence = gbpCadence(posts.map(p => p.published_at))

  // O calendário é o assunto principal da tela agora. Um mês montado é o
  // que faz o dono postar sem depender de lembrar; o post avulso virou
  // exceção, e a tela reflete isso.
  const agenda = useMemo(() => resumoDaAgenda(posts), [posts])
  const grupos = useMemo(() => {
    const mapa = new Map<GrupoAgenda, GbpPostRow[]>()
    for (const p of posts) {
      const g = grupoDoPost(p)
      const lista = mapa.get(g)
      if (lista) lista.push(p)
      else mapa.set(g, [p])
    }
    return ORDEM_GRUPOS
      .map(g => ({ grupo: g, itens: mapa.get(g) ?? [] }))
      .filter(s => s.itens.length > 0)
  }, [posts])

  const temAgenda = agenda.pendentes > 0
  const precisaAgir = agenda.atrasados > 0 || agenda.paraHoje > 0

  const listRef = useRef<HTMLDivElement | null>(null)
  const genRef = useRef<HTMLDivElement | null>(null)
  function focusLista() {
    listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // Sem o link do perfil salvo, manda pro painel do Google. É pior que o link
  // direto, mas não deixa o cliente parado no meio do fluxo.
  const perfilHref = gpeLink || 'https://business.google.com/posts'

  async function gerarMes() {
    if (!siteId) { setErr('Crie e publique um site primeiro.'); return }
    setGenMes(true); setErr('')
    try {
      const res = await fetch('/api/ai/gbp/mes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ site_id: siteId }),
      })
      const j = await res.json()
      if (!res.ok || !Array.isArray(j.posts)) {
        setErr(j.error ?? 'Não consegui montar o mês agora.')
        return
      }
      setPosts(p => [...(j.posts as GbpPostRow[]), ...p])
      setTimeout(focusLista, 60)
    } catch {
      setErr('Falha de conexão ao montar o mês.')
    } finally {
      setGenMes(false)
    }
  }

  async function generate() {
    if (!siteId) { setErr('Crie e publique um site primeiro.'); return }
    setGen(true); setErr('')
    try {
      const res = await fetch('/api/ai/gbp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ site_id: siteId, post_type: postType, topic }),
      })
      const j = await res.json()
      if (!res.ok || !j.post) { setErr(j.error ?? 'Não consegui gerar o post agora.'); return }
      setPosts(p => [j.post as GbpPostRow, ...p])
      setTopic('')
    } catch {
      setErr('Falha de conexão ao gerar o post.')
    } finally {
      setGen(false)
    }
  }

  async function copy(post: GbpPostRow) {
    try {
      await navigator.clipboard.writeText(post.content)
      setCopiedId(post.id)
      setTimeout(() => setCopiedId(c => (c === post.id ? null : c)), 8000)
    } catch { /* clipboard bloqueado */ }
  }

  // O registro de "publiquei" é a única fonte de verdade que temos sobre o
  // perfil do cliente enquanto não houver API do Google. Otimista na tela,
  // mas com rollback: se a rota falhar, o estado volta e o erro aparece.
  async function marcarPublicado(post: GbpPostRow, publicado: boolean) {
    const antes = post.published_at
    setMarcando(post.id); setErr('')
    setPosts(list => list.map(p => p.id === post.id
      ? { ...p, published_at: publicado ? new Date().toISOString() : null, status: publicado ? 'used' : 'draft' }
      : p))
    try {
      const res = await fetch('/api/gbp/publicado', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: post.id, publicado }),
      })
      const j = await res.json().catch(() => null)
      if (!res.ok) {
        setPosts(list => list.map(p => p.id === post.id
          ? { ...p, published_at: antes, status: antes ? 'used' : 'draft' }
          : p))
        setErr(j?.error ?? 'Não consegui registrar. Tente de novo.')
        return
      }
      // Carimba a hora que o servidor gravou, não a do relógio do navegador.
      if (j?.post) {
        setPosts(list => list.map(p => p.id === post.id
          ? { ...p, published_at: j.post.published_at ?? null, status: j.post.status }
          : p))
      }
    } catch {
      setPosts(list => list.map(p => p.id === post.id
        ? { ...p, published_at: antes, status: antes ? 'used' : 'draft' }
        : p))
      setErr('Falha de conexão ao registrar.')
    } finally {
      setMarcando(null)
    }
  }

  // Tirar da agenda o post que não serve. Sem isto o cliente fica preso ao
  // mês que a IA montou, porque um mês novo só pode ser montado com a
  // agenda vazia. Aqui o otimismo é caro (apagou some da tela), então o
  // rollback recoloca o post na posição em que estava.
  async function apagar(post: GbpPostRow) {
    if (!confirm('Tirar este post da sua agenda? O texto não volta.')) return
    const indice = posts.findIndex(p => p.id === post.id)
    setMarcando(post.id); setErr('')
    setPosts(list => list.filter(p => p.id !== post.id))
    try {
      const res = await fetch('/api/gbp/apagar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: post.id }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => null)
        setPosts(list => {
          const copia = [...list]
          copia.splice(Math.max(0, indice), 0, post)
          return copia
        })
        setErr(j?.error ?? 'Não consegui apagar. Tente de novo.')
      }
    } catch {
      setPosts(list => {
        const copia = [...list]
        copia.splice(Math.max(0, indice), 0, post)
        return copia
      })
      setErr('Falha de conexão ao apagar.')
    } finally {
      setMarcando(null)
    }
  }

  const cadenceTone =
    cadence.status === 'overdue' ? 'warn'
    : cadence.status === 'due' ? 'due'
    : cadence.status === 'never' ? 'start'
    : 'ok'

  // Quando há tarefa do dia, a agenda fala e a cadência cala: dizer "faz 9
  // dias que você não posta" logo acima de "o post de hoje está pronto" é
  // duas vozes brigando pela mesma atenção.
  const tomDoTopo = precisaAgir ? (agenda.atrasados > 0 ? 'warn' : 'due') : cadenceTone
  const mensagemDoTopo = precisaAgir || temAgenda ? agenda.mensagem : cadence.message

  return (
    <>
      {/* topo: o que fazer hoje. Uma coisa só. */}
      <div className={`gbp-cadence ${tomDoTopo}`}>
        <span className="ic">
          <i className={`ph-fill ${
            precisaAgir ? 'ph-clock-countdown'
            : temAgenda ? 'ph-calendar-check'
            : cadence.status === 'ok' ? 'ph-check-circle'
            : 'ph-rocket-launch'
          }`} />
        </span>
        <p style={{ flex: 1, minWidth: 0 }}>{mensagemDoTopo}</p>
        {precisaAgir && (
          <button type="button" className="btn sm" onClick={focusLista}>
            <i className="ph-fill ph-clipboard-text" /> Ver o post
          </button>
        )}
      </div>

      {/* Perfil não vinculado: aqui ele vincula, em vez de ser mandado de
          volta pro onboarding, que é uma tela que ele já terminou. */}
      {!gpeConnected && <VincularPerfil buscaAlternativa={buscaAlternativa} />}

      {/* montar o mês: a ação principal da tela */}
      {!temAgenda && (
        <div className="ai-banner" ref={genRef}>
          <span className="ic"><i className="ph-fill ph-calendar-plus" /></span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <b>Deixe seu mês no Google pronto de uma vez</b>
            <p>
              A IA escreve {POSTS_POR_MES} posts, um por semana, cada um com o dia de ir ao ar.
              Você só copia e cola quando o painel avisar. Nada é publicado sozinho.
            </p>
          </div>
          <button className="btn" onClick={gerarMes} disabled={genMes}>
            {genMes ? 'Montando seu mês…' : <><i className="ph-fill ph-sparkle" /> Preparar meu mês</>}
          </button>
        </div>
      )}

      {/* post avulso: exceção, não o caminho principal */}
      {!avulsoAberto ? (
        <button
          type="button"
          className="btn glass sm"
          style={{ alignSelf: 'flex-start' }}
          onClick={() => setAvulsoAberto(true)}
        >
          <i className="ph-fill ph-plus-circle" /> Quero um post fora do calendário
        </button>
      ) : (
        <div className="ai-banner">
          <span className="ic"><i className="ph-fill ph-magic-wand" /></span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <b>Um post agora, sem data marcada</b>
            <p>Pra quando acontecer algo que não dá pra esperar a próxima terça.</p>

            <div className="gbp-types" style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', marginTop: '.7rem' }}>
              {TYPES.map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setPostType(t.id)}
                  className={`btn glass sm${postType === t.id ? ' on' : ''}`}
                  title={t.hint}
                  style={postType === t.id ? { outline: '2px solid var(--accent, #8fc0ff)' } : undefined}
                >
                  <i className={`ph-fill ${t.icon}`} /> {t.label}
                </button>
              ))}
            </div>

            <input
              className="field"
              style={{ marginTop: '.7rem' }}
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="Assunto (opcional). Ex.: desconto de inverno, novo horário, dica de cuidado…"
            />
          </div>
          <button className="btn" onClick={generate} disabled={gen}>
            {gen ? 'Escrevendo…' : <><i className="ph-fill ph-sparkle" /> Gerar post</>}
          </button>
        </div>
      )}

      {err && <p className="ed-err" style={{ margin: '.4rem 0' }}><i className="ph-fill ph-warning-circle" /> {err}</p>}

      {/* o calendário */}
      {posts.length === 0 ? (
        <div className="glass" style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)' }}>
          Nenhum post ainda. Monte seu mês acima e o painel cuida do resto.
        </div>
      ) : (
        <div ref={listRef} style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
          {grupos.map(({ grupo, itens }) => (
            <section key={grupo} style={{ display: 'flex', flexDirection: 'column', gap: '.8rem' }}>
              <h2
                style={{
                  margin: 0, fontSize: '.82rem', fontWeight: 700, letterSpacing: '.04em',
                  textTransform: 'uppercase',
                  color: grupo === 'atrasado' ? 'var(--warn, #f5a30a)'
                    : grupo === 'hoje' ? 'var(--accent, #8fc0ff)'
                    : 'var(--muted)',
                }}
              >
                {TITULO_GRUPO[grupo]} <span style={{ opacity: .6, fontWeight: 600 }}>({itens.length})</span>
              </h2>

              {itens.map(post => {
                const publicado = !!post.published_at
                const copiado = copiedId === post.id
                const ocupado = marcando === post.id
                const urgente = grupo === 'atrasado' || grupo === 'hoje'
                const origem = origemDoPost(post.extra)
                return (
                  <div
                    key={post.id}
                    className="glass"
                    style={{
                      padding: '1.1rem 1.2rem',
                      opacity: publicado ? .78 : 1,
                      borderLeft: publicado ? '3px solid var(--ok, #46c37b)'
                        : grupo === 'atrasado' ? '3px solid var(--warn, #f5a30a)'
                        : grupo === 'hoje' ? '3px solid var(--accent, #8fc0ff)'
                        : undefined,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.5rem', flexWrap: 'wrap' }}>
                      <span className="chip" style={{ fontSize: '.74rem', fontWeight: 700, opacity: .85 }}>
                        {TYPE_LABEL[post.post_type]}
                      </span>

                      {!publicado && post.scheduled_for && (
                        <span
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: '.3rem',
                            fontSize: '.76rem', fontWeight: urgente ? 700 : 600,
                            color: grupo === 'atrasado' ? 'var(--warn, #f5a30a)'
                              : grupo === 'hoje' ? 'var(--accent, #8fc0ff)'
                              : 'var(--muted)',
                          }}
                        >
                          <i className="ph-fill ph-calendar-blank" /> {rotuloDaData(post.scheduled_for)}
                        </span>
                      )}

                      {post.cta_label && (
                        <span style={{ fontSize: '.74rem', color: 'var(--muted)' }}>
                          botão: <b>{post.cta_label}</b>
                        </span>
                      )}

                      {publicado && (
                        <span
                          style={{
                            marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: '.3rem',
                            fontSize: '.76rem', fontWeight: 700, color: 'var(--ok, #46c37b)',
                          }}
                        >
                          <i className="ph-fill ph-check-circle" /> No ar desde {dataCurta(post.published_at)}
                        </span>
                      )}
                    </div>

                    <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.55, margin: 0 }}>{post.content}</p>

                    {/* Post que nasceu de um artigo diz de qual. Sem isto o
                        dono vê um post curto no meio do mês e não entende
                        por que ele não conta a história inteira. */}
                    {origem && (
                      <p style={{ margin: '.6rem 0 0', fontSize: '.8rem', color: 'var(--muted)' }}>
                        <i className="ph-fill ph-article" /> Chama pro artigo{' '}
                        <a href={origem.url} target="_blank" rel="noopener noreferrer"><b>{origem.titulo}</b></a>.
                        O texto entrega só um gancho de propósito, pra quem ler ir até o site.
                      </p>
                    )}

                    {/* Ações: copiar → abrir o perfil → confirmar que publicou.
                        O terceiro passo é o que existe de métrica de GBP hoje. */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', flexWrap: 'wrap', marginTop: '.9rem' }}>
                      {!publicado ? (
                        <>
                          <button className="btn glass sm" onClick={() => copy(post)}>
                            {copiado
                              ? <><i className="ph-fill ph-check" /> Copiado</>
                              : <><i className="ph-fill ph-copy" /> Copiar texto</>}
                          </button>

                          <a
                            className="btn glass sm"
                            href={perfilHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={copiado ? { outline: '2px solid var(--accent, #8fc0ff)' } : undefined}
                          >
                            <i className="ph-fill ph-arrow-square-out" /> Abrir meu perfil
                          </a>

                          <button
                            className="btn glass sm"
                            style={{ opacity: .75 }}
                            disabled={ocupado}
                            onClick={() => apagar(post)}
                            title="Tirar este post da agenda"
                          >
                            <i className="ph-fill ph-trash" /> Tirar da agenda
                          </button>

                          <button
                            className="btn sm"
                            style={{ marginLeft: 'auto' }}
                            disabled={ocupado}
                            onClick={() => marcarPublicado(post, true)}
                          >
                            {ocupado
                              ? 'Registrando…'
                              : <><i className="ph-fill ph-check-circle" /> Já publiquei este</>}
                          </button>
                        </>
                      ) : (
                        <>
                          <button className="btn glass sm" onClick={() => copy(post)}>
                            {copiado
                              ? <><i className="ph-fill ph-check" /> Copiado</>
                              : <><i className="ph-fill ph-copy" /> Copiar de novo</>}
                          </button>
                          <button
                            className="btn glass sm"
                            style={{ marginLeft: 'auto', opacity: .8 }}
                            disabled={ocupado}
                            onClick={() => marcarPublicado(post, false)}
                            title="Marquei sem querer, ou o post saiu do ar"
                          >
                            {ocupado ? 'Desfazendo…' : <><i className="ph-fill ph-arrow-counter-clockwise" /> Não publiquei</>}
                          </button>
                        </>
                      )}
                    </div>

                    {/* Caminho inverso: perfil → blog. Um clique leva o
                        assunto pro editor de artigo, e nada é escrito antes
                        do dono mandar. Post que já veio de um artigo não
                        recebe o convite, senão vira círculo. */}
                    {!origem && (
                      <p style={{ margin: '.6rem 0 0', fontSize: '.82rem', color: 'var(--muted)' }}>
                        Rendeu conversa?{' '}
                        <Link href={`/blog/new?pauta=${encodeURIComponent(pautaDoPost(post.content))}`}>
                          <b>Vire este assunto em artigo</b>
                        </Link>{' '}
                        e o artigo passa a trabalhar o ano inteiro, não uma semana.
                      </p>
                    )}

                    {copiado && !publicado && (
                      <p className="hint" style={{ margin: '.55rem 0 0', fontSize: '.82rem' }}>
                        Texto copiado. Cole no seu perfil e volte aqui pra marcar
                        <b> Já publiquei este</b> — é assim que o painel conta sua presença no Google.
                      </p>
                    )}
                  </div>
                )
              })}
            </section>
          ))}
        </div>
      )}
    </>
  )
}
