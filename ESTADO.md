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

- `249060a` feat(painel): metricas reais ponta a ponta + trava anti-depoimento inventado _(21 hours ago)_
- `eb15493` fix(editor): conserta grade do editor quebrada pela barra de score _(9 days ago)_
- `4d0c1ae` docs: wireframe do builder (referência Lovable/Figma), protocolo de diagnóstico, roadmap e planos _(2 weeks ago)_
- `957415c` feat(aeo): llms.txt por tenant + robots 2026 + rota dos arquivos GEO/AEO _(2 weeks ago)_
- `e240948` fix(editor): blindagem contra seção hero com payload aninhado (barras cinzas) _(2 weeks ago)_

**Trabalho não commitado:** 

```
M .claude/hooks/session-start.sh
 M .claude/settings.json
 M CLAUDE.md
R  docs/CRONOGRAMA.md -> docs/_arquivo/CRONOGRAMA.md
R  HANDOFF-COWORK.md -> docs/_arquivo/HANDOFF-COWORK.md
R  docs/HANDOFF-FRONTEND-CHANGES.md -> docs/_arquivo/HANDOFF-FRONTEND-CHANGES.md
R  HANDOFF.md -> docs/_arquivo/HANDOFF.md
R  LEIA-PRIMEIRO.md -> docs/_arquivo/LEIA-PRIMEIRO.md
R  docs/PROJETO/00-COMO-FUNCIONA.md -> docs/_arquivo/PROJETO/00-COMO-FUNCIONA.md
R  docs/PROJETO/01-BACKLOG.md -> docs/_arquivo/PROJETO/01-BACKLOG.md
R  docs/PROJETO/02-SPRINT-ATUAL.md -> docs/_arquivo/PROJETO/02-SPRINT-ATUAL.md
R  docs/PROJETO/04-ROADMAP.md -> docs/_arquivo/PROJETO/04-ROADMAP.md
R  docs/PROJETO/BUGS-ONBOARDING.md -> docs/_arquivo/PROJETO/BUGS-ONBOARDING.md
R  docs/PROJETO/CUSTOS-E-PLANOS.md -> docs/_arquivo/PROJETO/CUSTOS-E-PLANOS.md
R  docs/PROJETO/ESTADO-MVP.md -> docs/_arquivo/PROJETO/ESTADO-MVP.md
R  docs/PROJETO/LOG-EDITOR-WIREFRAME.md -> docs/_arquivo/PROJETO/LOG-EDITOR-WIREFRAME.md
R  docs/PROJETO/PAINEL.md -> docs/_arquivo/PROJETO/PAINEL.md
R  docs/PROJETO/PROTOCOLO-DIAGNOSTICO.md -> docs/_arquivo/PROJETO/PROTOCOLO-DIAGNOSTICO.md
R  docs/trello-1-a-fazer.txt -> docs/_arquivo/trello-1-a-fazer.txt
R  docs/trello-2-done.txt -> docs/_arquivo/trello-2-done.txt
R  docs/PROJETO/03-DECISOES.md -> docs/referencia/DECISOES.md
R  docs/PROJETO/05-PLANOS-PRECOS.md -> docs/referencia/PLANOS-PRECOS.md
 M package.json
?? ESTADO.md
?? MVP.md
?? RITUAL.md
?? docs/modelos-referencia/blog-magicui.html
?? docs/modelos-referencia/changelog-magicui.html
?? docs/testes/
?? scripts/estado.mjs
```

**Commits locais não enviados:** nenhum

---

Próximos passos e definição de pronto: [MVP.md](MVP.md) · Como trabalhamos: [RITUAL.md](RITUAL.md)
