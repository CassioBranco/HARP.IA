---
name: ancoreo-security
description: Revisão de segurança sob medida do ANCOREO (SaaS multi-tenant, Next.js 14 + Supabase/RLS). Use SEMPRE antes de marcar como pronta qualquer feature que crie tabela, rota de API, formulário público ou renderize HTML de usuário. Também serve pra auditoria geral sob demanda ("rode uma revisão de segurança").
---

# ANCOREO — Revisão de Segurança

Auditoria com evidência: cada achado precisa de `arquivo:linha` + o cenário concreto de exploração. Sem achado teórico ("poderia ser melhor") — só o que um atacante real faria. Saída = checklist PASS/FAIL por categoria abaixo, com veredito final: APROVADO / APROVADO COM RESSALVAS / REPROVADO.

## Contexto fixo do projeto (não redescobrir)

- Multi-tenant por `tenant_id` com RLS via `auth_tenant_id()` — TODA tabela nova precisa de policy `tenant_isolation`.
- Dois clientes Supabase: sessão (`lib/supabase/server.ts` / `client.ts`, respeita RLS) e **admin/service-role** (bypassa RLS — só em route handlers server-side, nunca importado em client component).
- Padrão de escrita pública estabelecido (booking/leads): visitante anônimo NÃO insere direto na tabela (sem policy de INSERT anon); o POST público valida `sites.published` + toggle da feature (`booking_enabled`/`leads_enabled`) e grava via admin client.
- Conteúdo de blog e sections é HTML/JSONB gerado por IA e editável pelo usuário — é renderizado nos sites públicos dos clientes (superfície de XSS real).

## Checklist

### 1. RLS e isolamento de tenant
- [ ] Tabela nova tem RLS habilitado + policy `tenant_isolation` (SELECT/UPDATE/DELETE restritos ao tenant dono)?
- [ ] NENHUMA policy de INSERT/UPDATE pra `anon` em tabela que recebe dado de visitante — escrita pública só via route handler com admin client?
- [ ] Query com admin client filtra explicitamente por `tenant_id`/`site_id` validado (admin client não tem RLS pra te salvar)?
- [ ] JOIN/subquery não vaza linha de outro tenant (ex.: buscar por slug global sem filtrar site)?

### 2. Rotas de API (route handlers)
- [ ] Rota autenticada confere a sessão E a posse do recurso (site/post pertence ao usuário) — não só "está logado"?
- [ ] Rota pública valida TODO input: UUID com formato checado, strings com teto de tamanho, enum com whitelist, data/telefone com formato?
- [ ] `site_id` vindo do client nunca é usado com admin client sem antes validar estado (`published`, toggle da feature)?
- [ ] Erro não vaza detalhe interno (stack, SQL, existência de recurso de outro tenant — 404 e 403 indistinguíveis pra quem não é dono)?
- [ ] Payload JSON tem catch pra malformado (não 500 com stack)?

### 3. XSS e HTML de usuário
- [ ] Todo `dangerouslySetInnerHTML` novo renderiza APENAS HTML que passou por sanitização no momento da escrita (ex.: `sanitizeText`)?
- [ ] Texto de usuário interpolado em HTML gerado (âncoras, títulos, atributos) passa por `escapeHtml` — inclusive em atributo (`href`, `title`, `alt`)?
- [ ] `href` construído com dado de usuário rejeita esquema perigoso (`javascript:`, `data:`)?
- [ ] Conteúdo gerado por IA é tratado como não-confiável igual input de usuário (a IA pode ser induzida via prompt do usuário a emitir HTML malicioso)?

### 4. Segredos e clientes
- [ ] Service-role key / API keys só em código server-side — nunca em client component, nunca em `NEXT_PUBLIC_*`?
- [ ] Chamada de IA (Anthropic) só via `lib/claude/client.ts` no servidor; custo registrado em `ia_generations`?
- [ ] Nenhum secret hardcoded (grep por `sk-`, `eyJ`, `service_role`)?

### 5. Abuso e limites
- [ ] Rota pública de escrita (booking/leads/track) tem proteção mínima contra flood — honeypot, teto de tamanho, dedup — ou um TODO explícito documentado?
- [ ] Rota que chama IA tem gate de autenticação + ownership (visitante anônimo nunca dispara custo de IA)?
- [ ] Upload/imagem valida tipo e tamanho no servidor, não só no client?

## Como rodar

1. `git diff` / lista dos arquivos da feature → classifica cada um nas categorias acima.
2. Lê o código de verdade (não confiar em resumo de agent) e marca cada item PASS/FAIL/N.A. com `arquivo:linha`.
3. FAIL de RLS, XSS ou vazamento de secret = REPROVADO (bloqueia a feature até corrigir). FAIL de rate-limit/abuso = RESSALVA (documenta TODO).
4. Reporta em PT-BR, mais grave primeiro.
