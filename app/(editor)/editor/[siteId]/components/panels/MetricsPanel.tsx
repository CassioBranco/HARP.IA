'use client'

import { useState, useEffect } from 'react'

type Props = { siteId: string }

type Pillar = 'seo' | 'geo' | 'aeo' | 'eeat'

type ScoreRule = {
  rule_key: string
  description: string
  pillar: Pillar
  fix: string
  score: number
  passed: boolean
}

type ScoreData = {
  overall: number
  seo: number
  geo: number
  aeo: number
  eeat: number
  rules: ScoreRule[]
  calculated_at: string | null
}

const EMPTY: ScoreData = {
  overall: 0, seo: 0, geo: 0, aeo: 0, eeat: 0,
  rules: [], calculated_at: null,
}

const PILLARS: { id: Pillar; label: string; color: string }[] = [
  { id: 'seo',  label: 'SEO',  color: '#4a86f5' },
  { id: 'geo',  label: 'GEO',  color: '#a78bfa' },
  { id: 'aeo',  label: 'AEO',  color: '#f5a30a' },
  { id: 'eeat', label: 'EEAT', color: '#22c55e' },
]

export default function MetricsPanel({ siteId }: Props) {
  const [data, setData] = useState<ScoreData>(EMPTY)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activePillar, setActivePillar] = useState<Pillar | 'all'>('all')
  const [expandedFix, setExpandedFix] = useState<string | null>(null)

  useEffect(() => { fetchScore() }, [siteId])

  async function fetchScore() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/score/${siteId}`)
      if (!res.ok) throw new Error('Falha ao calcular score')
      const json = await res.json()
      setData(json)
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }

  const visibleRules = activePillar === 'all'
    ? data.rules
    : data.rules.filter(r => r.pillar === activePillar)

  const failedCount = data.rules.filter(r => !r.passed).length

  return (
    <>
      <div className="ed-ph">
        <div>
          <h2>Métricas</h2>
          {failedCount > 0 && !loading && (
            <p className="sub">{failedCount} {failedCount === 1 ? 'regra falhando' : 'regras falhando'}</p>
          )}
        </div>
        <button onClick={fetchScore} disabled={loading} className="ed-rule more">
          {loading ? 'Calculando…' : '↻ Atualizar'}
        </button>
      </div>

      <div className="ed-scroll">
        {error && <p className="ed-err">{error}</p>}

        {/* Score geral */}
        <div className="ed-card" style={{ textAlign: 'center' }}>
          <p className="ed-cap" style={{ marginBottom: '.5rem' }}>Score Geral</p>
          <ScoreCircle value={data.overall} size="lg" />
          {data.calculated_at && (
            <p className="mt" style={{ marginTop: '.5rem' }}>{new Date(data.calculated_at).toLocaleString('pt-BR')}</p>
          )}
        </div>

        {/* 4 pilares */}
        <div className="ed-pillars">
          {PILLARS.map(p => (
            <button
              key={p.id}
              onClick={() => setActivePillar(activePillar === p.id ? 'all' : p.id)}
              className={`ed-pillar ${activePillar === p.id ? 'on' : ''}`}
            >
              <ScoreCircle value={data[p.id]} size="sm" color={p.color} />
              <span className="pl">{p.label}</span>
            </button>
          ))}
        </div>
        {activePillar !== 'all' && (
          <p className="ed-hint" style={{ textAlign: 'center', marginTop: '-.3rem' }}>
            Regras de <b style={{ color: '#fff' }}>{activePillar.toUpperCase()}</b>{' '}
            <button onClick={() => setActivePillar('all')} className="ed-rule more">ver todas</button>
          </p>
        )}

        {/* Regras */}
        {visibleRules.length > 0 && (
          <div className="ed-list">
            <p className="ed-cap">
              Regras ({visibleRules.filter(r => r.passed).length}/{visibleRules.length} passando)
            </p>
            {visibleRules.map(rule => (
              <div key={rule.rule_key} className={`ed-rule ${rule.passed ? '' : 'fail'}`}>
                <div className="rh">
                  <span className={`ck ${rule.passed ? 'ok' : 'no'}`}>{rule.passed ? '✓' : '✗'}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="rd">{rule.description}</p>
                    <span className="badge muted" style={{ marginTop: '.3rem', textTransform: 'uppercase' }}>{rule.pillar}</span>
                  </div>
                  {!rule.passed && (
                    <button
                      onClick={() => setExpandedFix(expandedFix === rule.rule_key ? null : rule.rule_key)}
                      className="more"
                    >
                      {expandedFix === rule.rule_key ? '▲' : 'corrigir'}
                    </button>
                  )}
                </div>
                {!rule.passed && expandedFix === rule.rule_key && (
                  <div className="fix">{rule.fix}</div>
                )}
              </div>
            ))}
          </div>
        )}

        {data.rules.length === 0 && !loading && !error && (
          <div className="ed-empty">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
            <p className="ed-hint">Score disponível após<br/>o site ser gerado e publicado.</p>
          </div>
        )}
      </div>
    </>
  )
}

type CircleProps = {
  value: number
  size: 'sm' | 'lg'
  color?: string
}

function ScoreCircle({ value, size, color = '#4a86f5' }: CircleProps) {
  const r = size === 'lg' ? 32 : 18
  const stroke = size === 'lg' ? 5 : 3
  const dim = (r + stroke) * 2
  const circumference = 2 * Math.PI * r
  const offset = circumference - (value / 100) * circumference
  const textColor = value >= 70 ? '#eaf1fb' : value >= 40 ? '#fcd581' : '#ff9b9b'

  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: dim, height: dim }}>
      <svg width={dim} height={dim} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={dim/2} cy={dim/2} r={r} fill="none" stroke="rgba(150,170,200,.25)" strokeWidth={stroke} />
        <circle
          cx={dim/2} cy={dim/2} r={r}
          fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <span style={{ position: 'absolute', fontWeight: 800, fontVariantNumeric: 'tabular-nums', fontSize: size === 'lg' ? '1.3rem' : '.66rem', color: textColor }}>
        {value}
      </span>
    </div>
  )
}
