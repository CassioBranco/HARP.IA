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
  { id: 'seo',  label: 'SEO',  color: 'blue'   },
  { id: 'geo',  label: 'GEO',  color: 'purple' },
  { id: 'aeo',  label: 'AEO',  color: 'orange' },
  { id: 'eeat', label: 'EEAT', color: 'green'  },
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
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Métricas</p>
          {failedCount > 0 && !loading && (
            <p className="text-[10px] text-red-500 font-semibold mt-0.5">{failedCount} {failedCount === 1 ? 'regra falhando' : 'regras falhando'}</p>
          )}
        </div>
        <button
          onClick={fetchScore}
          disabled={loading}
          className="text-[11px] font-semibold text-primary hover:underline disabled:opacity-50"
        >
          {loading ? 'Calculando...' : '↻ Atualizar'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col gap-4 px-4 py-4">

        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[11px] text-red-600">{error}</p>
        )}

        {/* Score geral */}
        <div className="rounded-xl border border-border p-4 text-center">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Score Geral</p>
          <ScoreCircle value={data.overall} size="lg" />
          {data.calculated_at && (
            <p className="mt-2 text-[10px] text-muted-foreground">
              {new Date(data.calculated_at).toLocaleString('pt-BR')}
            </p>
          )}
        </div>

        {/* 4 pilares */}
        <div className="grid grid-cols-4 gap-1.5">
          {PILLARS.map(p => (
            <button
              key={p.id}
              onClick={() => setActivePillar(activePillar === p.id ? 'all' : p.id)}
              className={`flex flex-col items-center rounded-xl border-2 p-2 gap-1 transition-all ${
                activePillar === p.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'
              }`}
            >
              <ScoreCircle value={data[p.id]} size="sm" color={p.color} />
              <p className="text-[9px] font-bold text-muted-foreground">{p.label}</p>
            </button>
          ))}
        </div>
        {activePillar !== 'all' && (
          <p className="text-[10px] text-center text-muted-foreground -mt-2">
            Mostrando regras de <span className="font-bold text-foreground">{activePillar.toUpperCase()}</span>
            {' '}<button onClick={() => setActivePillar('all')} className="text-primary underline">ver todas</button>
          </p>
        )}

        {/* Regras */}
        {visibleRules.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Regras ({visibleRules.filter(r => r.passed).length}/{visibleRules.length} passando)
            </p>
            {visibleRules.map(rule => (
              <div key={rule.rule_key} className={`rounded-lg border ${rule.passed ? 'border-border' : 'border-red-200 bg-red-50/40'} overflow-hidden`}>
                <div className="flex items-start gap-2.5 p-2.5">
                  <span className={`mt-0.5 shrink-0 text-sm ${rule.passed ? 'text-green-500' : 'text-red-400'}`}>
                    {rule.passed ? '✓' : '✗'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold text-foreground leading-tight">{rule.description}</p>
                    <span className={`inline-block mt-0.5 rounded-full px-1.5 py-px text-[8px] font-bold uppercase ${
                      rule.pillar === 'seo'  ? 'bg-blue-100 text-blue-700' :
                      rule.pillar === 'geo'  ? 'bg-purple-100 text-purple-700' :
                      rule.pillar === 'aeo'  ? 'bg-orange-100 text-orange-700' :
                                               'bg-green-100 text-green-700'
                    }`}>{rule.pillar}</span>
                  </div>
                  {!rule.passed && (
                    <button
                      onClick={() => setExpandedFix(expandedFix === rule.rule_key ? null : rule.rule_key)}
                      className="shrink-0 text-[10px] font-semibold text-primary hover:underline"
                    >
                      {expandedFix === rule.rule_key ? '▲' : 'como corrigir'}
                    </button>
                  )}
                </div>
                {!rule.passed && expandedFix === rule.rule_key && (
                  <div className="border-t border-red-200 bg-red-50 px-3 py-2">
                    <p className="text-[11px] text-red-700 leading-relaxed">{rule.fix}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {data.rules.length === 0 && !loading && !error && (
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-muted-foreground/40">
              <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
            <p className="text-[11px] text-muted-foreground">Score disponível após<br/>o site ser gerado e publicado.</p>
          </div>
        )}
      </div>
    </div>
  )
}

type CircleProps = {
  value: number
  size: 'sm' | 'lg'
  color?: string
}

function ScoreCircle({ value, size, color = 'blue' }: CircleProps) {
  const r = size === 'lg' ? 32 : 18
  const stroke = size === 'lg' ? 5 : 3
  const dim = (r + stroke) * 2
  const circumference = 2 * Math.PI * r
  const offset = circumference - (value / 100) * circumference

  const colorMap: Record<string, string> = {
    blue:   '#3b82f6',
    purple: '#8b5cf6',
    orange: '#f97316',
    green:  '#22c55e',
  }
  const strokeColor = colorMap[color] ?? '#3b82f6'
  const textColor = value >= 70 ? 'text-foreground' : value >= 40 ? 'text-yellow-600' : 'text-red-500'

  return (
    <div className="relative flex items-center justify-center" style={{ width: dim, height: dim }}>
      <svg width={dim} height={dim} className="-rotate-90">
        <circle cx={dim/2} cy={dim/2} r={r} fill="none" stroke="currentColor" strokeWidth={stroke} className="text-muted/30" />
        <circle
          cx={dim/2} cy={dim/2} r={r}
          fill="none" stroke={strokeColor} strokeWidth={stroke}
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <span className={`absolute font-black tabular-nums text-center ${size === 'lg' ? 'text-xl' : 'text-[10px]'} ${textColor}`}>
        {value}
      </span>
    </div>
  )
}
