# Relatório da noite — 2026-07-03

> Trabalho autônomo executado durante a madrugada com permissão do Cássio,
> usando o modelo **Fable 5** pra codar cada item (Agent com `model:"fable"`)
> e esta sessão orquestrando, validando e mantendo o log. Gates respeitados:
> **nenhum** commit, push, deploy ou migration aplicada — só arquivos locais.
> Fila detalhada: `NOITE-2026-07-03.md`.
>
> Prioridade da fila: força de SEO + melhora de UX dupla (usuário da
> plataforma E cliente final/visitante do site), re-ranqueada a partir da
> análise Hostinger.

## O que foi feito (NN1–NN6)

### NN1 — Verificador de links quebrados ✅
- `lib/seo/link-checker.ts`: extração de links do HTML/JSONB das sections,
  classificação interno/externo, checagem HEAD→fallback GET (timeout 5s,
  concorrência limitada a 5).
- `app/api/score/[siteId]/links/route.ts`: GET autenticado (RLS), monta
  rotas reais do site + links dos posts do blog, retorna total/quebrados.
- Card novo "Links quebrados" em `MetricsView.tsx` (verificação sob
  demanda por botão, lista os 10 primeiros). Sem migration (roda ao vivo,
  não persiste).

### NN2 — Widget de FAQ/chat (WhatsApp) no site do cliente ✅
- `components/templates/shared/ChatWidget.tsx`: botão flutuante (canto
  inferior direito) + acordeão de FAQ + CTA WhatsApp, visual neutro (sem
  tokens da plataforma) — integrado nos 10 layouts via `LayoutRenderer.tsx`.
- Edição manual de FAQ no editor (`SectionEditor.tsx`).
- **Migration escrita, NÃO aplicada**: `20260702040000_social_links_onboarding.sql`
  (formaliza a coluna `social_links` que o código já usava sem versionamento).

### NN3 — Motor de agendamento/reserva (booking) ✅
- *(1ª tentativa via Fable caiu por erro de conexão da API antes de
  escrever qualquer arquivo — detectado porque o "completed" da notificação
  não batia com o volume de trabalho; confirmado com `git status` que nada
  precisava ser desfeito; relançado do zero.)*
- `components/templates/shared/BookingWidget.tsx`: botão flutuante (canto
  inferior esquerdo, pra não colidir com o ChatWidget), form com data/hora
  nativos + serviço.
- `app/api/booking/route.ts`: POST público, valida site `published` +
  `booking_enabled` antes de gravar via admin client (sem insert anônimo
  direto na tabela).
- `app/(dashboard)/agendamentos/`: lista de solicitações do dono, com
  troca de status. Toggle "Agenda" no editor (`CustomizationPanel.tsx`).
- **Migration escrita, NÃO aplicada**: `20260702050000_booking_requests.sql`
  (tabela `booking_requests` + coluna `sites.booking_enabled`, RLS por tenant).
- **Sem infra de e-mail** pra notificar o dono na hora (projeto não tem
  Resend instalado apesar do ADR mencionar) — TODO documentado no código;
  por ora o dono acompanha em `/agendamentos`.

### NN4 — Formulário de captura de lead não-intrusivo ✅
- Padrão escolhido: **faixa inline** ("Fique por dentro") no fluxo normal
  da página (última seção do site) — sem popup/modal, sem overlay, evitando
  o interstitial penalty do Google no mobile e sem disputar canto com
  ChatWidget/BookingWidget.
- `components/templates/shared/LeadCaptureBar.tsx`: nome + e-mail/telefone
  + interesse; botão fechar lembra a escolha por 1 dia (localStorage).
- `app/api/leads/route.ts`: mesmo padrão do booking (valida site + toggle,
  grava via admin client).
- `app/(dashboard)/leads/`: listagem espelhando `/agendamentos`.
- **Migration escrita, NÃO aplicada**: `20260702060000_leads.sql` (coluna
  `sites.leads_enabled` + tabela `leads`, RLS por tenant).

### NN5 — Geração de descrição de produto/serviço via IA ✅
- Reaproveitado o **mesmo provider do onboarding** (Anthropic via
  `lib/claude/client.ts` — `getAnthropicClient()` + `MODELS.generate` +
  `cachedSystem()` + `friendlyAIError()`); nenhum provider novo.
- `app/api/ai/generate-description/route.ts`: POST autenticado, valida
  ownership do site via RLS, usa contexto de `onboarding_profiles`.
- `SectionEditor.tsx`: a seção `services` ganhou editor de itens completo
  com botão "Gerar com IA" ao lado da descrição (desabilita durante
  geração, erro vira mensagem simples no botão). Sem migration.

### NN6 — SEO score ao vivo estendido pro site principal ✅
- Núcleo dos 7 checks (já existia no editor de posts) extraído pra
  `lib/seo/score.ts` (`buildPostSeoChecks`/`buildPageSeoChecks`/
  `computeSeoScore`) — `PostEditor.tsx` refatorado pra usar o módulo
  compartilhado em vez de lógica duplicada.
- Adaptado pra página: título = `pages.title`, meta = `pages.meta_description`,
  contagem de palavras do texto visível das sections (piso 300 em vez de
  600), H2 = section com título, FAQ = section `faq` com itens, link
  interno = link relativo nas sections.
- Painel novo `SeoPanel.tsx`, aba "SEO" no `CustomizationPanel` — mesma
  barra + checklist do editor de posts, com campos editáveis de título/meta
  e contador de caracteres. Sem migration.

## ⚠️ Gates pra sua aprovação

1. **Aplicar 3 migrations novas** (escritas, NÃO aplicadas, desta noite):
   - `20260702040000_social_links_onboarding.sql` (coluna `social_links`)
   - `20260702050000_booking_requests.sql` (tabela + `sites.booking_enabled`)
   - `20260702060000_leads.sql` (tabela + `sites.leads_enabled`)
   O código do agendamento e dos leads **depende** dessas duas últimas —
   sem aplicar, os toggles e as APIs quebram (coluna/tabela não existem
   ainda no banco). Aplicar ANTES de deployar este trabalho.
2. **Infra de e-mail** (Resend ou similar) — hoje não existe no projeto.
   Sem ela, o dono só fica sabendo de um novo agendamento/lead abrindo o
   painel; decidir se vale a pena adicionar antes do lançamento.
3. **Deploy**: nada foi commitado nem deployado. Revisar → commit → deploy.
4. Gates **herdados da noite 2026-07-02** ainda pendentes (não mexidos
   nesta noite): aplicar as 2 migrations daquela noite (triangulação de
   links + capa/agendamento do blog), wildcard `*.ancoreo.com.br`
   (Vercel + Registro.br), decidir o job de agendamento de posts, e os
   dados reais da empresa nas páginas legais.

## Decisões tomadas (pra você validar)
- Leads: escolhida faixa inline em vez de qualquer padrão de overlay —
  prioriza SEO mobile sobre taxa de conversão bruta do popup; dá pra
  reavaliar depois com dados reais de uso.
- Booking: sem calendário de terceiros (Google Calendar etc.) neste MVP —
  é só uma fila de solicitações que o dono confirma manualmente.
- IA de descrição: reaproveitar o mesmo provider/padrão do onboarding em
  vez de introduzir uma segunda integração — mantém uma única superfície
  de custo/observabilidade de IA no projeto.
- NN3 teve uma tentativa falha (erro de conexão da API do Fable) tratada
  como falha limpa — confirmado que zero arquivos foram tocados antes de
  relançar, sem risco de estado parcial/corrompido.

## Resultado do build de produção
✅ `npm run build` **verde** (exit 0) na madrugada de 2026-07-03. Todas as
rotas novas presentes e compiladas: `/agendamentos` (1.71 kB), `/leads`
(1.66 kB), `/api/booking`, `/api/leads`, `/api/ai/generate-description`,
`/api/score/[siteId]/links`. Shared JS segue em 87.4 kB, middleware 82.3 kB.
Nenhum erro ou warning de compilação.

## Como conferir de manhã
1. `preview_start` (config `ancoreo-dev`) ou `npm run dev`.
2. `/editor/[siteId]`: aba "Agenda" (toggle booking), aba "Leads" (toggle
   lead capture), aba "SEO" (checklist novo), seção Serviços com botão
   "Gerar com IA" nas descrições.
3. `/agendamentos` e `/leads` no painel (vão aparecer vazios até aplicar
   as migrations e ter dados reais).
4. Aprovar os gates da seção acima (migrations → infra de e-mail →
   commit → deploy).
