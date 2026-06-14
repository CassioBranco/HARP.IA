import Anthropic from '@anthropic-ai/sdk'

// Singleton — uma instância por processo, chave nunca vai ao browser
let _client: Anthropic | null = null

export function getAnthropicClient(): Anthropic {
  if (!_client) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY não configurada')
    }
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  }
  return _client
}

// Modelos por agente — Sonnet cria, Haiku audita
export const MODELS = {
  generate: 'claude-sonnet-4-6',
  audit:    'claude-haiku-4-5-20251001',
} as const

// ─────────────────────────────────────────────────────────────────────────────
// Prompt caching — o system (global+agent+objetivo+nicho) é estável entre
// gerações do mesmo tipo. Marcar o bloco com cache_control faz a 2ª+ chamada
// (em até 5 min) ler o trecho do cache a 0,1x do custo (~90% off no input).
// ─────────────────────────────────────────────────────────────────────────────
export function cachedSystem(text: string): Anthropic.TextBlockParam[] {
  return [{ type: 'text', text, cache_control: { type: 'ephemeral' } }]
}

// Soma todos os tokens de uma resposta (input + output + escrita/leitura de cache)
export function totalTokens(usage: Anthropic.Usage): number {
  return (
    usage.input_tokens +
    usage.output_tokens +
    (usage.cache_creation_input_tokens ?? 0) +
    (usage.cache_read_input_tokens ?? 0)
  )
}

// Traduz erros da API da Claude em mensagem amigável (e status HTTP) para o cliente.
// Cobre: sem crédito/saldo, rate limit, chave inválida.
export function friendlyAIError(err: unknown): { status: number; message: string } {
  const e = err as { status?: number; message?: string }
  const status = e?.status ?? 500
  const msg = (e?.message ?? '').toLowerCase()

  if (status === 429) {
    return { status: 429, message: 'Estamos com muitas gerações ao mesmo tempo agora. Tente de novo em alguns instantes.' }
  }
  if (status === 401) {
    return { status: 503, message: 'Geração de IA indisponível no momento. Já estamos verificando.' }
  }
  if (status === 400 && (msg.includes('credit') || msg.includes('balance') || msg.includes('billing'))) {
    return { status: 503, message: 'Geração temporariamente indisponível. Tente novamente em alguns minutos.' }
  }
  if (status >= 500) {
    return { status: 503, message: 'A IA está instável agora. Tente novamente em instantes.' }
  }
  return { status: 500, message: 'Não foi possível gerar agora. Tente novamente em instantes.' }
}
