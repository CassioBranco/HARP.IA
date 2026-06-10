'use client'

import { useState, useEffect } from 'react'

type Props = { siteId: string }

type ScoreRule = {
  rule_key: string
  description: string
  score: number   // 0-100 por regra
  passed: boolean
  scope: string
}

type ScoreData = {
  overall: number
  seo: number
  geo: number
  aeo: number
  rules: ScoreRule[]
  calculated_at: string | null
}

const EMPTY: ScoreData = {
  overall: 0, seo: 0, geo: 0, aeo: 0,
  rules: [], calculated_at: null,
}

export default function MetricsPanel({ siteId }: Props) {
  const [data, setData] = useState<ScoreData>(EMPTY)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Métricas</p>
        <button
          onClick={fetchScore}
          disabled={loading}
          className="text-[11px] font-semibold text-primary hover:underline disabled:opacity-50"
        >
          {loading ? 'Calculando...' : '↻ Atualizar'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">

        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[11px] text-red-600">{error}</p>
        )}

        {/* Score geral */}
        <div className="rounded-xl border border-border p-4 text-center">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Score Geral</p>
          <ScoreCircle value={data.overall} size="lg" />
          {data.calculated_at && (
            <p className="mt-2 text-[10px] text-muted-foreground">
              Atualizado em {new Date(data.calculated_at).toLocaleString('pt-BR')}
            </p>
          )}
        </div>

        {/* Três pilares */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'SEO', value: data.seo, color: 'blue' },
            { label: 'GEO', value: data.geo, color: 'purple' },
            { label: 'AEO', value: data.aeo, color: 'orange' },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex flex-col items-center rounded-xl border border-border p-3 gap-1">
              <ScoreCircle value={value} size="sm" color={color} />
              <p className="text-[10px] font-bold text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>

        {/* Regras individuais */}
        {data.rules.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Regras ({data.rules.length})</p>
            {data.rules.map(rule => (
              <div key={rule.rule_key} className="flex items-start gap-2.5 rounded-lg border border-border p-2.5">
                <span className={`mt-0.5 shrink-0 text-sm ${rule.passed ? 'text-green-500' : 'text-red-400'}`}>
                  {rule.passed ? '✓' : '✗'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-foreground truncate">{rule.rule_key}</p>
                  <p className="text-[10px] text-muted-foreground leading-tight">{rule.description}</p>
                </div>
                <span className={`shrink-0 text-[10px] font-bold ${rule.passed ? 'text-green-600' : 'text-muted-foreground'}`}>
                  {rule.score}%
                </span>
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
  const r = size === 'lg' ? 32 : 20
  const stroke = size === 'lg' ? 5 : 3.5
  const dim = (r + stroke) * 2
  const circumference = 2 * Math.PI * r
  const offset = circumference - (value / 100) * circumference

  const colorMap: Record<string, string> = {
    blue: '#3b82f6',
    purple: '#8b5cf6',
    orange: '#f97316',
    green: '#22c55e',
  }
  const stroke_color = colorMap[color] ?? '#3b82f6'
  const text_color = value >= 70 ? 'text-foreground' : value >= 40 ? 'text-yellow-600' : 'text-red-500'

  return (
    <div className="relative flex items-center justify-center" style={{ width: dim, height: dim }}>
      <svg width={dim} height={dim} className="-rotate-90">
        <circle cx={dim / 2} cy={dim / 2} r={r} fill="none" stroke="currentColor" strokeWidth={stroke} className="text-muted/30" />
        <circle
          cx={dim / 2} cy={dim / 2} r={r}
          fill="none" stroke={stroke_color} strokeWidth={stroke}
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <span className={`absolute text-center font-black tabular-nums ${size === 'lg' ? 'text-xl' : 'text-[11px]'} ${text_color}`}>
        {value}
      </span>
    </div>
  )
}
