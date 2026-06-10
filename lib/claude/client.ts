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
  generate: 'claude-sonnet-4-20250514',
  audit:    'claude-haiku-4-5-20251001',
} as const
