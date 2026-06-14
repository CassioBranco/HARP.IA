'use client'

// Métricas (client). Anéis + "o que melhorar" = reais (/api/score/[siteId]).
// Visitas e ranking = "em breve" (sem fonte de dado no beta — não fabricar).
import { useEffect, useState } from 'react'

type Pillar = 'seo' | 'geo' | 'aeo' | 'eeat'
type ScoreRule = { rule_key: string; description: string; pillar: Pillar; fix: string; passed: boolean }
type ScoreData = {
  overall: number; seo: number; geo: number; aeo: number; eeat: number
  rules: ScoreRule[]; calculated_at: string | null
}

const RINGS: { id: Exclude<Pillar, 'eeat'>; label: string; color: string; hint: (n: number) => string }[] = [
  { id: 'seo', label: 'SEO', color: '#22c55e', hint: n => `Busca tradicional no Google. ${grade(n)}.` },
  { id: 'geo', label: 'GEO', color: '#f5a30a', hint: n => `Citação pelas IAs. ${grade(n)}.` },
  { id: 'aeo', label: 'AEO', color: '#3b82f6', hint: n => `Resposta direta e por voz. ${grade(n)}.` },
]

function grade(n: number): string {
  if (n >= 80) return 'Forte'
  if (n >= 60) return 'Boa'
  if (n >= 40) return 'Pode melhorar'
  return 'Precisa de atenção'
}

export default function MetricsView({ siteId, domain }: { siteId: string; domain: string }) {
  const [data, setData] = useState<ScoreData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    setLoading(true)
    fetch(`/api/score/${siteId}`)
      .then(async r => {
        if (!r.ok) throw new Error('Falha ao calcular o score')
        return r.json()
      })
      .then(j => { if (alive) { setData(j); setLoading(false) } })
      .catch(e => { if (alive) { setError(e instanceof Error ? e.message : 'Erro'); setLoading(false) } })
    return () => { alive = false }
  }, [siteId])

  // "O que melhorar" = regras falhando (texto de correção real). Limita a 4.
  const toImprove = (data?.rules ?? []).filter(r => !r.passed).slice(0, 4)
  const allGood = !!data && toImprove.length === 0

  return (
    <>
      <div className="topbar">
        <div><h1>Métricas</h1><div className="sub">{domain} · como você está aparecendo</div></div>
      </div>

      {error && <div className="glass empty"><i className="ph-duotone ph-warning" /> {error}</div>}
      {loading && <div className="glass metric-loading">Calculando seu score…</div>}

      {data && !loading && (
        <>
          {/* anéis SEO / GEO / AEO — reais */}
          <div className="seo3">
            {RINGS.map(r => {
              const n = data[r.id]
              return (
                <div className="glass seo-card" key={r.id}>
                  <div className="ring" style={{ background: `conic-gradient(${r.color} 0 ${n}%,rgba(255,255,255,.1) ${n}%)` }}>
                    <div className="rin"><b>{n}</b><span>{r.label}</span></div>
                  </div>
                  <h3>{r.label}</h3>
                  <p>{r.hint(n)}</p>
                </div>
              )
            })}
          </div>

          <div className="cols">
            {/* visitas — em breve (sem analytics no beta) */}
            <div className="glass card">
              <h3><i className="ph-duotone ph-chart-bar" /> Visitas</h3>
              <div className="soon">
                <span className="bigic"><i className="ph-duotone ph-chart-line-up" /></span>
                <span className="pill">Em breve</span>
                <p>A análise de tráfego conecta ao seu site assim que a integração com o Google (Analytics e Search Console) for ativada.</p>
              </div>
            </div>

            {/* o que melhorar — real, das regras falhando */}
            <div className="glass card">
              <h3><i className="ph-duotone ph-lightbulb" /> O que melhorar</h3>
              <div className="mtodo">
                {allGood ? (
                  <div className="ti ok">
                    <span className="ic"><i className="ph-fill ph-check" /></span>
                    <div><b>Tudo certo por aqui</b><p>Seu site passa em todas as regras de SEO, GEO e AEO avaliadas.</p></div>
                  </div>
                ) : (
                  toImprove.map(rule => (
                    <div className="ti warn" key={rule.rule_key}>
                      <span className="ic"><i className="ph-fill ph-warning" /></span>
                      <div><b>{rule.description}</b><p>{rule.fix}</p></div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* ranking de keywords — em breve (sem Search Console no beta) */}
          <div className="glass card" style={{ marginTop: '1.2rem' }}>
            <h3><i className="ph-duotone ph-magnifying-glass" /> Palavras-chave que trazem você</h3>
            <div className="soon">
              <span className="bigic"><i className="ph-duotone ph-magnifying-glass" /></span>
              <span className="pill">Em breve</span>
              <p>As posições reais no Google aparecem aqui quando o Search Console estiver conectado. Não mostramos número estimado pra você não decidir em cima de dado que não é real.</p>
            </div>
          </div>

          {data.calculated_at && (
            <p className="sub" style={{ marginTop: '1rem', fontSize: '.76rem' }}>
              Score calculado em {new Date(data.calculated_at).toLocaleString('pt-BR')}
            </p>
          )}
        </>
      )}
    </>
  )
}
