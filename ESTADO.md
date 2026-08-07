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
- **ligado** — Ponte blog ↔ Perfil: artigo publicado vira post, post vira pauta

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

- `323c312` feat(gbp): pilar do Google Perfil ponta a ponta (5.2 a 5.6) _(27 minutes ago)_
- `f524226` docs: indexa os 7 wireframes de referencia e liga aos pilares do MVP _(4 hours ago)_
- `b6d5840` docs: escopo do MVP em 5 pilares + ESTADO.md gerado no lugar da prosa _(5 hours ago)_
- `249060a` feat(painel): metricas reais ponta a ponta + trava anti-depoimento inventado _(26 hours ago)_
- `eb15493` fix(editor): conserta grade do editor quebrada pela barra de score _(9 days ago)_

**Trabalho não commitado:** 

```
M app/(dashboard)/blog/[postId]/PostEditor.tsx
 M app/(dashboard)/gbp/GbpClient.tsx
 M app/(dashboard)/gbp/page.tsx
 M app/api/ai/gbp/mes/route.ts
 M scripts/estado.mjs
?? app/api/ai/gbp/do-artigo/
?? lib/seo/blog-para-gpe.ts
?? scripts/check-blog-para-gpe.ts
```

**Commits locais não enviados:** 

```
323c312 feat(gbp): pilar do Google Perfil ponta a ponta (5.2 a 5.6)
f524226 docs: indexa os 7 wireframes de referencia e liga aos pilares do MVP
b6d5840 docs: escopo do MVP em 5 pilares + ESTADO.md gerado no lugar da prosa
```

---

Próximos passos e definição de pronto: [MVP.md](MVP.md) · Como trabalhamos: [RITUAL.md](RITUAL.md)
