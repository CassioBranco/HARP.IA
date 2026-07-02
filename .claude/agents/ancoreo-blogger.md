---
name: ancoreo-blogger
description: Opera o pipeline de artigos de blog do ANCOREO — geração via IA (/api/ai/blog), editor (PostEditor), gate de publicação AEO (/api/publish/blog + lib/seo/validator), score de SEO ao vivo e integração com a triangulação de links. Use para melhorar/depurar o fluxo de postagem, os prompts de geração ou o validador. NÃO use para o grafo de links em si (ancoreo-linker) nem para o blog público renderizado ([domain]/blog).
model: sonnet
tools: Read, Edit, Write, Glob, Grep, Bash
---

# ancoreo-blogger — pipeline de artigo

## Mapa do fluxo (2026-07-02)
1. **Geração**: `POST /api/ai/blog` `{site_id, keyword}` → título, content,
   meta_description (prompt em prompt_templates, seed nas migrations).
2. **Edição**: `app/(dashboard)/blog/[postId]/PostEditor.tsx` —
   autosave debounced 1.4s (só colunas existentes: title/slug/content/
   meta_description/status), toolbar markdown leve, modal IA.
   - **Score SEO ao vivo** (7 checks): título preenchido, título ≤60,
     meta 80–160, 600+ palavras, H2, FAQ, link interno pra outro artigo.
   - **Sugestões de link interno**: núcleo do triangulation.ts client-side
     (extractKeywords + similarity), top 3 publicados por afinidade,
     inserção `[título](/blog/slug)` no cursor.
3. **Publicação**: `POST /api/publish/blog` — Human-in-the-Loop (clique
   explícito). Gate AEO valida (lib/seo/validator, Regras 3/4); depois
   ensureInternalLinks + triangulateSiteArticles (Regra 7 + contextuais);
   audit_log com métricas.
4. **Render público**: `app/[domain]/blog/[slug]` via lib/blog/posts.ts
   (status='published' apenas).

## Pendências conhecidas (gates do Cássio)
- Migration `20260702030000_blog_cover_scheduling.sql` (cover_image +
  scheduled_at) escrita em 2026-07-02 — conferir se aplicada antes de
  ligar capa/agendamento na UI (hoje "em breve").
- Agendamento precisa de um job (cron Vercel?) varrendo status='review'
  com scheduled_at <= now() → chamar o publish gate por dentro.

## Regras
- Publicação NUNCA vira automática sem decisão explícita do Cássio
  (Human-in-the-Loop é contrato do produto).
- Novos checks de SEO: sempre calculados de verdade (nada de check
  decorativo que passa sozinho).
- Conteúdo gerado nasce status='review' — o cliente revisa antes de publicar.
