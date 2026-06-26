# ANCOREO — Cronograma Completo do Projeto

> Fonte da verdade do "onde estamos". Ancorado em git + banco ao vivo, não em planejamento antigo.
> Última atualização: 2026-06-25. Substitui `trello-*.txt` e `STATUS-PROJETO.md` (ambos desatualizados).
> Marca: **ANCOREO** (âncora + SEO). Legado de infra ainda usa "harp-ia": repo HARP.IA, deploy harp-ia.vercel.app.

---

## PARTE 1 — LINHA DO TEMPO REALIZADA

### Fase A — Orquestração / planejamento (Claude.ai) — ✅ concluída (mai/2026)
- Visão de produto, North Star (SEO+GEO+AEO), Método CPF.
- Stack e 35 ADRs; 8 regras de arquitetura AEO; 14 presets/nichos.
- Schema do banco (17+ tabelas), arquitetura de agentes, guardrails.
- Prompts Bloco 0 (global) escrito.

### Fase B — Design (protótipos) — ✅ base feita / 🔄 redesign em curso
- Protótipos de onboarding, templates e painel serviram de base ao código.
- **Agora:** redesign visual "clean" do Ancoreo está com o **Claude Design** (fronteira: front = Design, back = Code).

### Fase C — Build (Claude Code) — núcleo ✅ concluído
| Data | Marco |
|------|-------|
| 2026-06-04 | **S1** Fundação: Next.js 14 + Supabase + 17 tabelas + auth |
| 2026-06-05 | Handoff sessão 4, status/roadmap |
| 2026-06-07 | **S2** Onboarding (13→11 telas, Typeform, autosave, score CPF) |
| 2026-06-10 | Multi-tenant: tenant_id nos inserts, RLS |
| 2026-06-11 | **S3** 10 layouts de template polidos + landing de marketing |
| 2026-06-12 | Briefing de front-end pro Claude Design (tokens, UI) |
| 2026-06-13 | 1 site por assinatura; paleta por site |
| 2026-06-14 | RLS recursion fix; GRANTs; re-skin liquid-glass do editor |
| 2026-06-15 | **S4** geração IA + galeria de imagens + painel métricas/calendário |
| 2026-06-16 | Selo de IA padronizado em todo ponto com IA |
| 2026-06-17 | Fix sharp (WebP) no bundle da Vercel |
| 2026-06-18 | **GBP nível 2** (gerador de post copia-e-cola) |
| 2026-06-19 | **S5/S6/S8** pipeline de publicação (gate AEO + links internos + score) + página pública de artigo + seeds de cotas/prompts; ponto focal de imagem |
| 2026-06-21 | Stack real documentada no CLAUDE.md; skill harpia-status; RAG (cofre de conhecimento, embeddings) |
| 2026-06-24 | **service_role rotacionada** (migração p/ chaves novas Supabase) |
| 2026-06-25 | Rename HARPIA→ANCOREO; gate onboarding 75%; fix apagar conta (FK cascade) |

**Resultado:** produto funciona ponta a ponta em produção (cadastro → onboarding → geração IA → editor → blog → score → publicação). Banco vivo com dados reais.

### Linha de sessões de trabalho (a jornada humana)
`0 INÍCIO` (29/05) → `1 ARQUITETURA` (04/06) → `2 DEPLOY VERCEL` (05/06) → `3 PROTÓTIPO` (07/06) → `4 CORREÇÃO ESTRUTURA` (08/06) → `5 / 5.1 LAYOUTS` (12-14/06) → `6 BETA FECHADA` (19/06) → sessão atual (24-25/06: service_role, rename ANCOREO, gate 75%, fix apagar conta, pesquisa SEO geográfico).

### Estado vivo do banco (snapshot 2026-06-25)
9 tenants · 1 user · 9 onboarding_profiles · 6 sites · 5 pages · 30 sections · 16 ia_generations · 5 images · 21 prompt_templates · 15 plan_quotas.
**Leitura:** o pipeline roda de verdade (sites/sections/gerações > 0). **Vazios:** blog_posts, gbp_posts, internal_links, knowledge_vault — ou seja, essas features existem em código mas **ainda não foram exercitadas com dado real** (blog/gbp não usados; internal_links só populam na publicação; knowledge_vault vazio pq RAG/OpenAI está desligado). **Alerta:** 9 tenants para 1 user = **tenants órfãos** de contas de teste apagadas (confirma a pendência do "apagar conta completa" — item 8 da Etapa 3).

---

## PARTE 2 — O QUE FALTA

### 🔴 ETAPA 1 — Gates pra beta com cliente real (ação do Cássio; Claude guia)
1. **DNS / domínio do Ancoreo** — registrar domínio + apontar wildcard pra Vercel. Sem isso, sites publicados não ficam no ar. **Gargalo nº 1.**
2. **Fluid Compute na Vercel** (toggle; precisa Vercel Pro) — pra geração longa (maxDuration 300) valer.
3. **OPENAI_API_KEY** (RAG) — pôr chave no .env.local + Vercel; testar blog ingerir/recuperar knowledge_vault.

### 🟡 ETAPA 2 — Polish (antes/durante beta)
4. Redesign visual clean — **Claude Design**.
5. Medidor de SEO no topo central + copy "vincule o Google" na tela 5 — **Claude Design**.
6. Sincronizar CLAUDE.md (gate 70%→75%) + aposentar trello/STATUS antigos.
7. Trocar hostnames `harp-ia`/`harpia.site` quando o domínio existir (Balde B do rename).

### 🟢 ETAPA 3 — Features novas (backlog priorizado)
8. **Apagar conta completa** — cascade leva junto tenant + sites (hoje só remove o usuário, deixa tenant órfão).
9. **Depoimentos/prova social com foto** do cliente (seção Avaliações do CPF).
10. **Avaliações do Google** no site (credibilidade; depende de API Places — avaliar custo/política).
11. **GPE integrado** — tirar aba isolada, postar/IA mais fluido; automação (postar sozinho) = plano superior (depende OAuth/Google Cloud).
12. **Páginas de área de atuação** (SEO geográfico programático) — 1 por coverage_area, com unicidade real (Método CPF + FAQ local), schema areaServed, grafo de links internos. NUNCA gerar página de bairro vazia (= doorway/spam). Escala PME: poucas áreas-chave dentro do raio.
13. **Pesquisa dedicada GEO/AEO** — como LLMs citam negócios locais (lacuna da pesquisa de 25/06).

### ⚪ ETAPA 4 — Pós-beta (não bloqueia)
14. Stripe (assinaturas + trial + inadimplência) — S9.
15. Inngest (fila assíncrona) quando escalar.
16. GBP nível 3 (automação via API Google).
17. Multilíngue (Pro+), white-label Agency, API access, painel de clientes.

---

## ORDEM RECOMENDADA
Etapa 1 (DNS → Fluid Compute → OPENAI) destrava a **beta**. Etapa 2 em paralelo (Claude Design + sync de docs). Features (Etapa 3) entram conforme prioridade comercial. Pós-beta (Etapa 4) só depois de validar com clientes reais.
