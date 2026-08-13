# ESTADO — ANCOREO

> **ARQUIVO GERADO. Não edite à mão.** Rode `node scripts/estado.mjs`.
> Cada linha abaixo foi verificada contra o código e o banco, não contra outro documento.
> Última geração: **2026-08-13**

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
- **ligado** — Lembrete semanal do post sai sozinho (rota + agendamento)
- **ligado** — Ponte blog ↔ Perfil: artigo publicado vira post, post vira pauta

### Fora do MVP

- `NÃO LIGADO` — Loja: botão de compra ligado ao checkout
- `NÃO LIGADO` — Loja: painel de produtos existe

## Banco (produção, contagem real)

| tabela | linhas |
|---|---:|
| tenants | 14 |
| onboarding_profiles | 13 |
| sites | 9 |
| blog_posts | 0 |
| score_snapshots | 1 |
| gbp_posts | 0 |
| leads | 0 |
| products | 0 |
| orders | 0 |
| sites (publicados) | 2 |

Zero linhas não significa quebrado: significa que ninguém exercitou aquele caminho ainda. Cruze com as sondas acima antes de concluir.

## Git

Branch: `master`

- `5ed97b8` docs: DIARIO.md gerado do git, pra responder "o que mudou desde que eu olhei" _(20 minutes ago)_
- `4e930c0` editor: preview de Desktop deixa de renderizar em largura de celular _(2 days ago)_
- `cf7f3fb` Nota unica de SEO, Google Perfil so com prova e limpeza de codigo morto _(2 days ago)_
- `0bdeb9f` test: empresa de teste sob demanda (seed idempotente + --limpar) _(2 days ago)_
- `cff8fe2` Ponte blog <-> Google Perfil: artigo publicado vira isca, sem estourar a cadencia _(6 days ago)_

**Trabalho não commitado:** 

```
M DIARIO.md
```

**Commits locais não enviados:** nenhum

---

O que mudou e quando: [DIARIO.md](DIARIO.md) · Próximos passos e definição de pronto: [MVP.md](MVP.md) · Como trabalhamos: [RITUAL.md](RITUAL.md)
