'use client'

// ============================================================
// ANCOREO — Vincular o Perfil de Empresa a partir do painel.
//
// O onboarding promete "dá pra vincular depois, no painel". Este é o
// depois. Mesma conversa da tela 5: cola o link, a gente abre o mapa do
// que veio, e quem diz se é o negócio certo é o dono.
//
// O servidor não consegue provar que o perfil é dele (o Google responde
// 200 pra endereço de negócio que não existe). Por isso a confirmação é
// visual, e a única checagem dura é o encurtador morto, que dá 404.
// ============================================================
import { useState } from 'react'
import { lerLinkGpe, problemaDoLink, urlDeMapaEmbed } from '@/lib/seo/gpe-link'

type Leitura = ReturnType<typeof lerLinkGpe>

export default function VincularPerfil({ buscaAlternativa }: { buscaAlternativa?: string }) {
  const [link, setLink] = useState('')
  const [erro, setErro] = useState('')
  const [ocupado, setOcupado] = useState(false)
  const [mapa, setMapa] = useState('')
  const [nome, setNome] = useState('')
  const [pronto, setPronto] = useState(false)

  function digitou(v: string) {
    setLink(v)
    setErro(problemaDoLink(lerLinkGpe(v)) ?? '')
    setMapa('')
    setNome('')
  }

  async function conferir() {
    if (!link.trim()) return
    setOcupado(true)
    setErro('')
    try {
      const r = await fetch('/api/onboarding/gpe-resolver', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ link: link.trim() }),
      })
      const j = await r.json() as { ok?: boolean; erro?: string; leitura?: Leitura }
      if (!j.ok || !j.leitura) {
        setErro(j.erro ?? 'Não consegui abrir esse link. Confira e cole de novo.')
        return
      }
      setNome(j.leitura.nome ?? '')
      const m = urlDeMapaEmbed(j.leitura, buscaAlternativa)
      if (m) setMapa(m)
      else await salvar()   // sem mapa pra mostrar, não dá pra pedir confirmação visual
    } catch {
      // Rede ruim não pode impedir de vincular: salva o que ele colou.
      await salvar()
    } finally {
      setOcupado(false)
    }
  }

  async function salvar() {
    setOcupado(true)
    setErro('')
    try {
      const r = await fetch('/api/gbp/vincular', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ link: link.trim() }),
      })
      const j = await r.json() as { ok?: boolean; error?: string }
      if (!j.ok) {
        setErro(j.error ?? 'Não consegui salvar agora. Tente de novo.')
        return
      }
      setPronto(true)
      setMapa('')
      // A tela inteira depende disto (banner, cadência, conteúdo do site),
      // então vale recarregar do servidor em vez de remendar o estado local.
      setTimeout(() => window.location.reload(), 900)
    } catch {
      setErro('Não consegui salvar agora. Tente de novo.')
    } finally {
      setOcupado(false)
    }
  }

  if (pronto) {
    return (
      <div className="ai-banner" style={{ borderColor: 'rgba(34,197,94,.45)' }}>
        <span className="ic"><i className="ph-fill ph-check-circle" /></span>
        <div>
          <b>Perfil vinculado{nome ? `: ${nome}` : ''}</b>
          <p>Atualizando a tela…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="ai-banner" style={{ borderColor: 'rgba(245,163,10,.4)', flexDirection: 'column', alignItems: 'stretch' }}>
      <div style={{ display: 'flex', gap: '.8rem' }}>
        <span className="ic"><i className="ph-fill ph-warning" /></span>
        <div>
          <b>Vincule seu Perfil de Empresa pra aproveitar de verdade</b>
          <p>
            Você já pode gerar e copiar posts. Com o perfil vinculado, o site passa a
            mostrar mapa, horário e avaliações, que é o que faz aparecer na busca da sua região.
            Abra seu perfil no Google, toque em Compartilhar e cole o link aqui.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '.5rem', marginTop: '.8rem' }}>
        <input
          className="field"
          style={{ flex: 1, minWidth: 0 }}
          value={link}
          onChange={(e) => digitou(e.target.value)}
          placeholder="https://g.co/kgs/… ou link do seu perfil"
          autoComplete="off"
        />
        <button
          className="btn sm"
          onClick={conferir}
          disabled={!link.trim() || !!erro || ocupado}
        >
          {ocupado ? 'Conferindo…' : 'Conferir'}
        </button>
      </div>

      {erro && (
        <p style={{ margin: '.5rem 0 0', fontSize: '.85rem', color: 'hsl(var(--destructive))' }}>
          {erro}
        </p>
      )}

      {mapa && (
        <div style={{ marginTop: '.8rem', border: '1px solid var(--line)', borderRadius: 11, overflow: 'hidden' }}>
          <iframe
            src={mapa}
            title="Mapa do perfil que você colou"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            style={{ display: 'block', width: '100%', height: 190, border: 0 }}
          />
          <div style={{ padding: '.8rem 1rem' }}>
            <p style={{ margin: '0 0 .6rem' }}>
              É este o seu negócio{nome ? <>, <b>{nome}</b></> : ''}?
            </p>
            <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
              <button className="btn sm" onClick={salvar} disabled={ocupado}>
                {ocupado ? 'Salvando…' : 'Sim, vincular'}
              </button>
              <button
                className="btn glass sm"
                onClick={() => { setMapa(''); setNome(''); setErro('Sem problema. Abra o perfil certo no Google, toque em Compartilhar e cole o link aqui.') }}
              >
                Não é esse
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
