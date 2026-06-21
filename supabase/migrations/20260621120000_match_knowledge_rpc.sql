-- ============================================================
-- RAG — função de busca por similaridade no knowledge_vault.
-- Retorna os trechos mais próximos (cosine) do embedding da consulta,
-- escopados ao tenant. Chamada server-side (service_role) pela camada
-- lib/rag/knowledge.ts. pgvector já está habilitado (índice HNSW existe).
-- ============================================================

create or replace function match_knowledge(
  query_embedding vector(1536),
  match_tenant uuid,
  match_count int default 5
)
returns table (id uuid, content text, similarity float)
language sql
stable
as $$
  select
    kv.id,
    kv.content,
    1 - (kv.embedding <=> query_embedding) as similarity
  from knowledge_vault kv
  where kv.tenant_id = match_tenant
    and kv.embedding is not null
  order by kv.embedding <=> query_embedding
  limit greatest(1, match_count)
$$;

grant execute on function match_knowledge(vector, uuid, int) to authenticated, service_role;
