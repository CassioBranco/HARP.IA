# ANCOREO — PAINEL (comece por aqui)

> **O que é:** o resumo de uma tela do projeto — o que já está no ar, o que estou
> fazendo agora e o que vem em seguida. Qualquer sessão nova (ou depois de um
> `/clear`) lê **este arquivo primeiro**. Detalhe fino mora nos docs numerados.
> Atualizado: 2026-07-23.

---

## Onde estamos (em uma frase)

Beta no ar em `ancoreo.com.br` (login self-serve, editor de 2 painéis, telemetria,
loja/leads/agendamento/parcerias já em produção). Fase atual = **UX do site builder**:
portar o wireframe pro editor real, funcional primeiro, beleza depois.

---

## 🟢 JÁ FEITO (no ar, verificado)

- **Beta publicado** em `ancoreo.com.br` (domínio próprio + SSL).
- **Login do cliente** self-serve (e-mail/senha + Google) + tenant automático.
- **Editor de 2 painéis** (Conteúdo à esquerda, Design & Ajustes à direita).
- **NV1–NV6 + backend endurecido** (loja, leads, agendamento, parcerias, sanitizador
  de HTML, rate-limit, e-mail dormente) — commit `fe81441`, **deployado**.
- **As 7 migrations "pendentes" JÁ FORAM APLICADAS em produção (05/07/2026).**
  Confirmado no banco: `internal_links_triangulation`, `blog_cover_scheduling`,
  `social_links_onboarding`, `booking_requests`, `leads`, `blog_faq_updated_at`,
  `partner_backlinks`. *(O roadmap/sprint antigos diziam que faltava — estava errado,
  já corrigido.)*
- **Barra de score SEO · GEO · AEO no editor** (Fase 2.1, slices 1 e 2) — score ao vivo
  + itens pendentes acionáveis + fix de telefone inline. **Local, `tsc` verde, ainda
  não commitado.** Detalhe: `LOG-EDITOR-WIREFRAME.md`.
- **Atalho `/dev-login`** pra testar o editor local sem refazer login/onboarding.
  Detalhe: `../DEV-LOGIN.md`.

---

## 🔵 AGORA (Fase 2.1 — wireframe → editor real)

Porte do wireframe Lovable/Figma pro editor de verdade, um pedaço por vez.

- **Próximo passo aberto:** plugar **"Gerar com IA"** no dropdown do score, no item
  GEO "descrição" (chama `/api/ai/generate-description`, mostra preview, grava em
  `about.body` só depois de aprovar). Mesmo padrão do fix de telefone.
- Depois: preview do editor sem reload a cada edição (B02); revisar os 6 steps de
  onboarding contra o wireframe.

> Régua desta fase (decisão do Cássio, 09/07): **funciona e é organizado primeiro,
> bonito depois.**

---

## ⚪ PRÓXIMOS PASSOS (em ordem)

**Resíduos da Fase 0 (estabilizar) — o que sobrou de verdade:**
1. `0.4` Migration do prompt de sistema (mata "3 depoimentos fictícios" no banco) — **🔑 gate do Cássio**.
2. `0.5` Legal: CNPJ/razão social em /termos e /privacidade + deploy do banner — **🔑 Cássio (dados)**.
3. `0.7` Limpar tenant de QA (`qa-dentista@harpia.test`) — Claude.
4. `0.1` Auditoria ponta-a-ponta do fluxo do assinante (só leitura) — Claude.

**Fase 1 (fechar o MVP e-commerce) — travada em chaves do Cássio:**
5. `MERCADOPAGO_ACCESS_TOKEN` + `MERCADOPAGO_WEBHOOK_SECRET` na Vercel — **🔑 Cássio/Dove**.
6. MP Connect + validar assinatura do webhook de checkout — Claude, depois de (5).
7. `RESEND_API_KEY` + domínio verificado → liga e-mails transacionais — **🔑 Cássio**.
8. Painel do dono: gestão de produtos (B04) + lista de pedidos (B05) — sai do wireframe.

Plano completo e fases futuras: `04-ROADMAP.md`.

---

## ⚠️ Precisa de decisão do Cássio

- **Preço dos 4 planos** — proposta pronta em `05-PLANOS-PRECOS.md`. Não trava a fase atual; trava o lançamento pago (Fase 4).
- **Gates abertos** acima marcados com 🔑 (migrations/deploy/dados legais/chaves).

---

## 🚦 GATE ABSOLUTO (nunca pular)

`commit`, `push`, `deploy` e `migration_apply` só com **OK explícito do Cássio**.
`npx tsc --noEmit` verde antes de dizer "pronto". Segredos nunca são expostos.

---

## 🗺️ Mapa dos docs (o que abrir pra quê)

| Preciso saber… | Abro |
|---|---|
| Onde estamos hoje / próximos passos | **este PAINEL** |
| Como o projeto é tocado (o ritual) | `00-COMO-FUNCIONA.md` |
| Todos os cartões + status (kanban) | `01-BACKLOG.md` |
| Foco da semana | `02-SPRINT-ATUAL.md` |
| O que já foi decidido (não rediscute) | `03-DECISOES.md` |
| Plano por fases (visão longa) | `04-ROADMAP.md` |
| Planos e preços (proposta) | `05-PLANOS-PRECOS.md` |
| Custos operacionais (base do preço) | `CUSTOS-E-PLANOS.md` |
| Estado técnico fino (segurança, migrations, decisões) | `ESTADO-MVP.md` |
| Diário do porte do editor (Fase 2.1) | `LOG-EDITOR-WIREFRAME.md` |
| Como diagnosticar "está quebrado" | `PROTOCOLO-DIAGNOSTICO.md` |
| Bugs de onboarding mapeados | `BUGS-ONBOARDING.md` |
| Atalho de teste local sem login | `../DEV-LOGIN.md` |

> **Histórico morto** (filas noturnas concluídas, status antigos) foi pra
> `docs/_arquivo/` — não precisa ler, está lá só pra rastreabilidade. Tudo
> continua no git de qualquer forma.
