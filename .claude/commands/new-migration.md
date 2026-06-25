# /new-migration [descrição]

Cria uma migration SQL para o Projeto ANCOREO com RLS, rollback e versionamento corretos.

## Uso
```
/new-migration add_intent_secondary_to_pages
/new-migration create_score_snapshots_table
/new-migration add_gbp_place_id_index
```

## O que este comando faz

1. **Gera** o arquivo `supabase/migrations/{YYYYMMDDHHMMSS}_{descrição}.sql`
2. **Inclui** DDL principal + RLS policy (se tabela com `tenant_id`) + rollback comentado
3. **Regenera** os tipos TypeScript: `supabase gen types typescript > lib/supabase/database.types.ts`
4. **Para** antes de executar — mostra o SQL completo para aprovação humana

## Restrições ABSOLUTAS

- **NUNCA** executa `supabase db push` sem aprovação explícita do Cássio
- **NUNCA** faz `DROP TABLE` ou `DROP COLUMN` sem listagem de todas as referências no código
- **SEMPRE** inclui rollback comentado no final da migration
- **SEMPRE** adiciona RLS em tabelas com `tenant_id`

## Estrutura gerada

```sql
-- supabase/migrations/20260527143000_add_intent_secondary_to_pages.sql
-- Descrição: adiciona intent secundário opcional em páginas do site
-- Autor: gerado via /new-migration
-- Data: 2026-05-27

-- ============================================================
-- MIGRATION
-- ============================================================

ALTER TABLE pages
  ADD COLUMN intent_secondary TEXT
  CHECK (intent_secondary IN ('informacional','comercial','transacional','navegacional'));

-- ============================================================
-- ROLLBACK (executar manualmente se necessário reverter)
-- ============================================================
-- ALTER TABLE pages DROP COLUMN intent_secondary;
```

## Para tabela nova — inclui automaticamente

```sql
-- DDL completo
CREATE TABLE nova_tabela ( ... );

-- RLS
ALTER TABLE nova_tabela ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON nova_tabela
  USING (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()));

-- Indexes
CREATE INDEX CONCURRENTLY idx_nova_tabela_tenant
  ON nova_tabela (tenant_id);

-- ROLLBACK
-- DROP TABLE nova_tabela;
```

## Checklist antes de apresentar ao humano
- [ ] Timestamp correto no nome do arquivo
- [ ] RLS incluída (se `tenant_id` presente)
- [ ] Rollback comentado no final
- [ ] `CREATE INDEX CONCURRENTLY` (não bloqueia produção)
- [ ] Tipos Supabase regenerados
- [ ] **Aguardando aprovação do Cássio antes de executar**
