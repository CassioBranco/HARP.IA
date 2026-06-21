// ============================================================
// RAG — Cofre de Conhecimento (knowledge_vault).
// Transforma o que o cliente respondeu no onboarding ("conhecimento
// vale ouro" / E-E-A-T) em vetores pesquisáveis, e recupera os
// trechos mais relevantes pra injetar nos prompts de geração.
// É o que faz o blog soar como AUTORIDADE real, não genérico.
// Tudo server-side (service_role) — a chave de embeddings nunca
// vai ao browser. Falha graciosa: se faltar OPENAI_API_KEY ou der
// erro, a geração segue SEM RAG (não quebra o fluxo do cliente).
// ============================================================

import type { SupabaseClient } from '@supabase/supabase-js'
import { embed, embedOne, hasEmbeddingsEnv } from '@/lib/embeddings/openai'

// Hash estável (FNV-1a) pra deduplicar conteúdo já vetorizado e não
// pagar embedding de novo a cada salvamento do onboarding.
function contentHash(s: string): string {
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return (h >>> 0).toString(16)
}

// Normaliza um trecho de conhecimento (limpa e marca a origem com hash no fim
// do texto, pra dedupe via UNIQUE lógico sem coluna nova).
function tag(content: string): { content: string; key: string } {
  const clean = content.replace(/\s+/g, ' ').trim()
  return { content: clean, key: contentHash(clean) }
}

// ── INGESTÃO ────────────────────────────────────────────────
// Vetoriza os itens de conhecimento do tenant e grava no knowledge_vault.
// Idempotente: pula o que já existe (mesmo conteúdo) pra esse tenant.
export async function ingestKnowledge(
  supabase: SupabaseClient,
  args: { tenantId: string; items: string[]; source?: string },
): Promise<{ inserted: number; skipped: number }> {
  if (!hasEmbeddingsEnv()) return { inserted: 0, skipped: 0 }

  const pieces = args.items
    .map(tag)
    .filter(p => p.content.length >= 20) // ignora respostas vazias/curtas demais
  if (pieces.length === 0) return { inserted: 0, skipped: 0 }

  // O que já está no cofre desse tenant (pra dedupe por conteúdo).
  const { data: existing } = await supabase
    .from('knowledge_vault')
    .select('content')
    .eq('tenant_id', args.tenantId)
  const seen = new Set((existing ?? []).map(r => contentHash((r.content as string) ?? '')))

  const fresh = pieces.filter(p => !seen.has(p.key))
  if (fresh.length === 0) return { inserted: 0, skipped: pieces.length }

  const vectors = await embed(fresh.map(p => p.content))
  const rows = fresh.map((p, i) => ({
    tenant_id: args.tenantId,
    content: p.content,
    embedding: vectors[i] as unknown as string, // pgvector aceita o array JSON
    source: args.source ?? 'onboarding',
  }))

  const { error } = await supabase.from('knowledge_vault').insert(rows)
  if (error) throw new Error(`Falha ao gravar knowledge_vault: ${error.message}`)

  return { inserted: fresh.length, skipped: pieces.length - fresh.length }
}

// ── RECUPERAÇÃO ─────────────────────────────────────────────
// Busca os k trechos mais relevantes pra uma consulta (ex.: a keyword do artigo).
// Usa a função SQL match_knowledge (cosine distance via pgvector).
export async function retrieveKnowledge(
  supabase: SupabaseClient,
  args: { tenantId: string; query: string; k?: number },
): Promise<string[]> {
  if (!hasEmbeddingsEnv() || !args.query.trim()) return []

  let queryVec: number[]
  try {
    queryVec = await embedOne(args.query)
  } catch {
    return [] // sem embedding, segue sem RAG
  }
  if (queryVec.length === 0) return []

  const { data, error } = await supabase.rpc('match_knowledge', {
    query_embedding: queryVec as unknown as string,
    match_tenant: args.tenantId,
    match_count: args.k ?? 5,
  })
  if (error || !data) return []

  return (data as { content: string }[]).map(r => r.content).filter(Boolean)
}

// Monta um bloco de texto pronto pra injetar no user prompt da geração.
export function knowledgeBlock(chunks: string[]): string {
  if (chunks.length === 0) return ''
  const list = chunks.map(c => `- ${c}`).join('\n')
  return `\n\nCONHECIMENTO REAL DO CLIENTE (use como base factual e de autoridade — não invente além disto):\n${list}\n`
}
