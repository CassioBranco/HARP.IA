# ANCOREO — Sprint Atual

> **Meta da sprint:** FASE 0 do roadmap — zerar a dívida "codado vs no ar" + iniciar o wireframe do site builder (Fase 2.1).
> **Janela:** 2026-07-18 → 2026-07-31.
> Dono: Scrum Master. Recorte focado do `01-BACKLOG.md` · plano completo: `04-ROADMAP.md`.

---

## 📜 Encerramento da sprint anterior (2026-06-30 → 10/07, fechada em 18/07)

Entregue: rename ANCOREO (S01 ✅), domínio ancoreo.com.br no ar (S05 ✅),
telemetria em produção (S02 ✅), páginas legais + banner codados e verdes
(S03/S04 — falta só dado da empresa + OK de deploy → viraram cartão 0.5 abaixo),
editor 2 painéis em produção (F15 ✅). Reconciliação de docs feita em 18/07
(NORTH-STAR/CLAUDE.md/LEIA-PRIMEIRO corrigidos; criados 04-ROADMAP e
05-PLANOS-PRECOS).

---

## 🎯 Cartões da sprint (ordem de prioridade — numeração = Fase 0/2 do roadmap)

### 0.1 — Auditoria ponta-a-ponta do fluxo do assinante · 🎯 SPRINT
- Cadastro → onboarding → gerar → editar → publicar → loja/checkout. **Só leitura.**
- Saída: relatório fato-a-fato (funciona / quebra / falta) — destrava o resto da fase.
- **Cargo:** QA (Claude)

### 0.2 + 0.3 — Aplicar 7 migrations + deploy da fila NV1–NV6 · ✅ FEITO (05/07)
- **Correção 23/07:** já está no ar. Banco de produção confirma as 7 migrations
  aplicadas (`20260705031256`–`20260705031415`); commit `fe81441` deployado.
  Este cartão estava marcado como GATE pendente por engano.

### 0.4 — Migration do prompt de sistema (mata "3 depoimentos fictícios") · 🚫 GATE
- Alinha o prompt do banco à REGRA DE FATOS já aplicada no código.

### 0.5 — Legal: dados da empresa + deploy do banner (ex-S03/S04) · 🚫 Cássio
- Preencher razão social/CNPJ/e-mails em /termos e /privacidade + OK de deploy.

### 0.6 — Refazer junction da memória (Desktop → Documents) · 🚫 Cássio (2 min)

### 0.7 — Limpar tenant de QA · 🎯 SPRINT · Backend (Claude)

### 2.1 — Wireframe do site builder (INÍCIO) · 🎯 SPRINT
- Fluxo completo: onboarding → geração → editor 2 painéis → publicar + telas de
  loja (produtos B04, pedidos B05). Ferramentas: Figma / Lovable / bibliotecas.
- Régua: **funcional e organizado primeiro, beleza depois** (princípio 2026-07-09).
- Saída desta sprint: wireframe navegável do fluxo principal pra aprovação do Cássio.
- **Cargo:** Design (Claude) + aprovação Cássio

---

## 🔓 Decisões pendentes desta sprint
1. **Preços dos 4 planos** — proposta pronta em `05-PLANOS-PRECOS.md` §4 (checklist de decisão). Não bloqueia a sprint; bloqueia a Fase 4.
2. **Q2 (de ESTADO-MVP §7):** resolvida na prática pela Fase 0 = aplicar migrations + deployar as NV agora (com OK), antes de feature nova.

## 📌 Próxima ação do Scrum Master
Seguir a **Fase 2.1** (porte do wireframe pro editor — próximo: gerador de IA no
dropdown do score). Em paralelo, rodar a **auditoria 0.1**. Pedir ao Cássio, num
bloco só, o que ainda depende dele: 0.4 (migration do prompt) + dados da empresa
(0.5) + chaves MP/Resend (Fase 1). Migrations/deploy 0.2/0.3 já estão feitos.
