# ESTADO — ANCOREO

> **ARQUIVO GERADO. Não edite à mão.** Rode `node scripts/estado.mjs`.
> Cada linha abaixo foi verificada contra o código e o banco, não contra outro documento.
> Última geração: **2026-08-07**

## Sondas por pilar do MVP

Uma sonda é uma afirmação que o script testa por grep no código. `ligado` só
aparece se o grep encontrar o chamador — módulo escrito e sem ninguém chamando
conta como **não ligado**.

### Onboarding

- **ligado** — Fluxo de onboarding existe e grava perfil

### Site builder

- **ligado** — Geração de site por IA está ligada ao onboarding
- **ligado** — Publicação de site tem rota e chamador

### Blog builder

- **ligado** — Editor de post chama a rota de publicação de blog

### Métricas

- **ligado** — Painel lê score real da API (não hardcoded)
- **ligado** — Score é persistido em histórico (score_snapshots)
- `NÃO LIGADO` — AEO usa medição real (hoje: amostra sintética)

### GBP

- `NÃO LIGADO` — Existe integração com a API do Google (OAuth + publicação)
- **ligado** — Rascunho de post do Google é gerado por IA
- **ligado** — Cliente registra que publicou no perfil (published_at é escrito)
- **ligado** — Calendário do mês: posts saem com data marcada
- **ligado** — Link do Perfil é lido, guardado com place_id e vinculável no painel
- `NÃO LIGADO` — Lembrete semanal do post sai sozinho (rota + agendamento)

### Fora do MVP

- `NÃO LIGADO` — Loja: botão de compra ligado ao checkout
- `NÃO LIGADO` — Loja: painel de produtos existe

## Banco (produção, contagem real)

| tabela | linhas |
|---|---:|
| tenants | 13 |
| onboarding_profiles | 13 |
| sites | 8 |
| blog_posts | 0 |
| score_snapshots | 0 |
| gbp_posts | 0 |
| leads | 0 |
| products | 0 |
| orders | 0 |
| sites (publicados) | 1 |

Zero linhas não significa quebrado: significa que ninguém exercitou aquele caminho ainda. Cruze com as sondas acima antes de concluir.

## Git

Branch: `master`

- `f524226` docs: indexa os 7 wireframes de referencia e liga aos pilares do MVP _(4 hours ago)_
- `b6d5840` docs: escopo do MVP em 5 pilares + ESTADO.md gerado no lugar da prosa _(5 hours ago)_
- `249060a` feat(painel): metricas reais ponta a ponta + trava anti-depoimento inventado _(26 hours ago)_
- `eb15493` fix(editor): conserta grade do editor quebrada pela barra de score _(9 days ago)_
- `4d0c1ae` docs: wireframe do builder (referência Lovable/Figma), protocolo de diagnóstico, roadmap e planos _(2 weeks ago)_

**Trabalho não commitado:** 

```
M ESTADO.md
 M MVP.md
 M app/(dashboard)/gbp/GbpClient.tsx
 M app/(dashboard)/gbp/page.tsx
 M app/(dashboard)/metrics/MetricsView.tsx
 M app/(dashboard)/metrics/page.tsx
 M app/api/ai/gbp/route.ts
 M app/onboarding/onboarding.css
 M app/onboarding/page.tsx
 M lib/onboarding/types.ts
 M lib/seo/local-presence.ts
 M scripts/estado.mjs
?? app/(dashboard)/gbp/VincularPerfil.tsx
?? app/api/ai/gbp/mes/
?? app/api/cron/
?? app/api/gbp/
?? app/api/onboarding/gpe-resolver/
?? docs/PEDIDO-API-GOOGLE.md
?? lib/email/gbp-lembrete.ts
?? lib/seo/gbp-calendar.ts
?? lib/seo/gpe-link.ts
?? scripts/check-gbp-calendar.ts
?? scripts/check-gbp-lembrete.ts
?? scripts/check-gpe-link.ts
?? supabase/migrations/20260807120000_gbp_published_at.sql
?? supabase/migrations/20260807130000_gbp_scheduled_for.sql
```

**Commits locais não enviados:** 

```
f524226 docs: indexa os 7 wireframes de referencia e liga aos pilares do MVP
b6d5840 docs: escopo do MVP em 5 pilares + ESTADO.md gerado no lugar da prosa
```

---

Próximos passos e definição de pronto: [MVP.md](MVP.md) · Como trabalhamos: [RITUAL.md](RITUAL.md)
