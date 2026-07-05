# RELATÓRIO — Fila noturna #2 do ANCOREO (NV1→NV6)

> Fechado em 2026-07-03. Tudo validado por mim (Opus) pessoalmente, não só
> pelo self-report dos agents: `git status --porcelain` + `npx tsc --noEmit`
> + leitura dos arquivos sensíveis em cada item.
> PORTÃO ABSOLUTO respeitado o tempo todo: nenhum commit, push, deploy ou
> migration aplicada. Só arquivos locais e migrations ESCRITAS.

## O que foi construído

- **NV1 — Editor visual fase 1** ✅ Edição inline por clique no preview +
  toolbar de seção (mover/duplicar/ocultar/adicionar) via ponte postMessage.
- **NV2 — Editor visual fase 2** ✅ Drag-n-drop de imagem (desktop→preview,
  upload WebP + alt por IA) + reordenar seção arrastando.
- **NV3 — Blog SEO/GEO/AEO** ✅ JSON-LD Article+FAQPage, TOC automático,
  editor de FAQ com "Gerar com IA", preview de snippet, checks novos no score.
- **NV4 — Parcerias (backlinks entre clientes)** ✅ Anéis de 3 (A→B→C→A, nunca
  recíproco), matching por afinidade, convite/aceite, injeção pós-anel-ativo.
- **NV5 (a+b) — Presença local + indexação** ✅ Checklist do Google (auto +
  conferência guiada), cadência de post no GPE, card de sitemap/Search Console.
  NV5 (c/d/e) = pendente (ver Gates).
- **NV6 — Debug + segurança geral** ✅ Este relatório.
- **Bônus da sessão:** rail do editor unificado com o vocabulário/ícones do
  painel (integração de janelas, parte 1). Princípio-guia do editor gravado
  no doc da fila (foco: básico + cara da marca, não pro-builder).

## Veredito de segurança (NV6)

Método: `npm run build` (**exit 0**) + `tsc` (**verde**) + skill
`ancoreo-security` aplicada aos fluxos novos.

**APROVADO nas superfícies novas:**
- **postMessage (NV1/NV2)** — valida origem E source nas duas pontas, envia
  com `targetOrigin` próprio (nunca `*`), inerte fora do editor. Padrão-ouro.
- **JSON-LD do blog (NV3)** — `JSON.stringify(...).replace(/</g,'\\u003c')`
  fecha a quebra de `</script>`. Aplicado em Article e FAQPage.
- **Rota IA do FAQ (NV3)** — auth (401) + posse via RLS (404) antes de gastar
  IA; saída passa por stripTags + deepSanitize + teto. FAQ renderizada como
  TEXTO (React escapa), não HTML.
- **NV4 (cross-tenant)** — RLS denormalizada correta, `anon` bloqueado, admin
  client só pós-anel-ativo com revalidação. 🔒 Corrigi na revisão 1 XSS
  armazenado cross-tenant (slug/domínio sem escape no href da injeção) com
  validação de charset (SAFE_DOMAIN/SAFE_SLUG).
- **NV5** — não fabrica dado; JSX escapa; localStorage em useEffect (SSR-safe).

**⚠️ ACHADO — Sanitização de HTML do corpo do blog/seções (PRÉ-EXISTENTE, MÉDIO):**
- `deepSanitize`/`sanitizeText` **NÃO** são defesa de XSS — só trocam em-dash,
  tiram placeholder e normalizam espaço (limpeza de voz da marca).
- O `content` do artigo ("HTML completo", gerado por IA e **editável pelo
  usuário**) e o HTML das seções vão pro `dangerouslySetInnerHTML` **sem
  sanitizador de HTML** (sem DOMPurify/sanitize-html).
- **Gravidade contida:** cookies de sessão são **host-only** (sem `domain:`) e
  **httpOnly** → um site malicioso num subdomínio NÃO rouba a sessão do app
  nem de outro cliente. Não é o cenário crítico.
- **Risco residual:** auto-XSS / deface / phishing no próprio site publicado
  sob a marca `*.ancoreo.com.br`; abuso de plataforma por tenant mal
  intencionado.
- **Recomendação:** sanitizador de HTML por allowlist (ex.: `sanitize-html`
  ou `isomorphic-dompurify`) na ESCRITA do conteúdo de blog e seções —
  preservando tags legítimas (headings, listas, links, imagens, e as âncoras
  injetadas pelo NV4). É tarefa própria, com teste, não patch às pressas.
  Não bloqueia nada hoje (não há deploy), mas deve entrar antes de qualquer
  divulgação/escala.

## 🚪 GATES — precisam da sua aprovação explícita, Cássio

1. **Migrations ESCRITAS e NÃO aplicadas** (nenhuma rodou no banco):
   - `20260702020000_internal_links_triangulation.sql`
   - `20260702040000_social_links_onboarding.sql`
   - `20260702050000_booking_requests.sql`
   - `20260702060000_leads.sql`
   - `20260703120000_blog_faq_updated_at.sql`
   - `20260703140000_partner_backlinks.sql` (NV4)
   > Sem aplicar, as features tolerantes (Parcerias, FAQ, etc.) abrem sem
   > quebrar, mas não funcionam de verdade. Aplicar exige sua ordem.
2. **Segurança:** conserto do sanitizador de HTML do blog/seções (achado
   acima) — recomendo priorizar antes de marketing/escala.
3. **Commit / push / deploy:** nada foi commitado. Tudo é working tree local.
4. **Infra de e-mail:** ausente (convites de Parcerias e outros hoje não
   disparam e-mail — o fluxo funciona no painel, mas sem notificação externa).
5. **NV5 pendente:** (c) templates espera o link do frame do MODO SIMPLES no
   Figma; (d) animações + (e) transição painel↔editor = fase de front "com
   primazia" (seguindo o princípio-guia gravado no doc da fila).

## Status final

**NV1–NV4 e NV5(a+b): entregues e validados. NV6: concluído.**
Restam decisões suas (os 5 gates acima) e a fase de front do editor.
