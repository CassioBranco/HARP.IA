// ============================================================
// Embeddings via OpenAI (text-embedding-3-small, 1536 dims —
// bate com a coluna knowledge_vault.embedding vector(1536)).
// A Anthropic não tem API de embeddings; este é o único ponto
// do sistema que fala com a OpenAI, e só no servidor (chave nunca
// vai ao browser). Usa fetch puro pra não adicionar dependência.
// ============================================================

const MODEL = 'text-embedding-3-small'
const ENDPOINT = 'https://api.openai.com/v1/embeddings'
export const EMBEDDING_DIMS = 1536

export function hasEmbeddingsEnv(): boolean {
  return Boolean(process.env.OPENAI_API_KEY)
}

// Gera o embedding de 1+ textos. Retorna um vetor por entrada, na mesma ordem.
export async function embed(input: string | string[]): Promise<number[][]> {
  const key = process.env.OPENAI_API_KEY
  if (!key) throw new Error('OPENAI_API_KEY não configurada (embeddings/RAG)')

  const texts = (Array.isArray(input) ? input : [input])
    .map(t => t.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
  if (texts.length === 0) return []

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({ model: MODEL, input: texts }),
  })

  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`Falha ao gerar embeddings (${res.status}): ${detail.slice(0, 200)}`)
  }

  const json = await res.json() as { data: { embedding: number[]; index: number }[] }
  // Garante a ordem pelo index retornado pela API.
  return json.data
    .sort((a, b) => a.index - b.index)
    .map(d => d.embedding)
}

// Atalho para um único texto.
export async function embedOne(text: string): Promise<number[]> {
  const [v] = await embed(text)
  return v ?? []
}
