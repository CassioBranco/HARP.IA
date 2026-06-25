# Configuração do Supabase — Projeto ANCOREO (beta)
> Referência das configs feitas no painel do Supabase. NÃO guardar chaves secretas aqui.
> Última atualização: 2026-06-03

## Projeto
- Nome: **HARP.IA**
- Organização: Dicas do Dove (plano Free)
- Região: **South America (São Paulo)** — sa-east-1
- Compute: Nano (free tier)
- Project URL: `https://yejjeiveqgkgrtcettkl.supabase.co`

## Banco de dados
- 17 tabelas + RLS multi-tenant aplicadas
- Migration: `supabase/migrations/20260603120000_schema_inicial.sql`
- Extensão `vector` (pgvector) habilitada para o knowledge_vault (RAG)

## Autenticação
- **Email**: habilitado (método principal da beta)
- **Passkeys (WebAuthn)**: habilitado (login por biometria/chave de segurança — opcional)
  - Relying Party Display Name: HARP.IA
  - Relying Party ID: `localhost` (DEV) — ⚠️ trocar pro domínio real quando publicar
  - Relying Party Origins: `http://localhost:3000` (DEV) — ⚠️ trocar pro domínio real quando publicar
- **Google OAuth**: pendente (sprint S2, junto com o GBP)

## Configurações de segurança (na criação)
- Enable Data API: ✅ ligado
- Automatically expose new tables: ❌ desligado (controle manual de acesso)
- Enable automatic RLS: ✅ ligado (toda tabela nova nasce protegida)

## Onde ficam as chaves (NÃO colar aqui)
As 3 chaves ficam em **Settings → API** no painel do Supabase:
- Project URL → `NEXT_PUBLIC_SUPABASE_URL`
- anon public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- service_role key → `SUPABASE_SERVICE_ROLE_KEY` (SECRETA — só no `.env.local`, nunca em doc/repo/chat)
