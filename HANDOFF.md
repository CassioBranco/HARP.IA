# HANDOFF — Projeto ANCOREO (ex-HARPIA)

> Documento de passagem entre sessões. Lê isto primeiro ao retomar.
> Última atualização: 2026-06-23 · Operador: Cássio · Owner produto: Anderson Dove
> **Antes de afirmar "está pronto/pendente", rode a skill `harpia-status`** (cruza git + banco ao vivo + build). Este arquivo é um resumo humano, não a fonte da verdade do estado técnico.

---

## 1. Onde estamos AGORA (tarefa em aberto)

**DECIDIDO (2026-06-23): o visual do front fica com o Claude Design. Claude Code NÃO mexe nos CSS/landing.**

- Cássio vai desenvolver o visual clean do ANCOREO usando o **Claude Design** ("deixe o mais simples possível").
- Papel do Claude Code daqui pra frente: **integrar a lógica no design que o Cássio trouxer, sem reescrever o design** (fronteira `feedback_divisao-front-back`).
- O mockup `_mockups/ancoreo-landing.html` cumpriu o papel de comparar direções e está **encerrado** — não é mais base de trabalho. Pode descartar quando quiser.
- Direção escuro vs claro: deixou em aberto, vai resolver no próprio Claude Design.

### O que sobra do lado do Claude Code (back-end / sem bloqueio externo)
Hoje não há tarefa de código pendente "minha" em aberto além dos gates de pré-lançamento (seção 3), que são majoritariamente ação do Cássio/externo. Próximo marco real = pré-launch.

### Fato técnico importante p/ o redesign
O front **NÃO tem tokens centralizados** — são **6 CSS com cores escritas na mão**:
`app/globals.css` (tokens Tailwind, tema azul claro) · `app/landing.css` (liquid glass) · `app/(dashboard)/painel.css` · `app/(editor)/editor.css` · `app/onboarding/onboarding.css` · `app/templates/escolher-modelo.css`.
**Jeito certo de fazer o overhaul:** criar 1 arquivo de tokens (cores/fontes/espaços/raios) e fazer as 6 telas beberem dele — aí mudar o visual vira mexer em 1 lugar. Hoje não é assim.
⚠️ CLAUDE.md (Bloco 8) proíbe mexer em `tailwind.config.ts`/átomos/moléculas sem instrução explícita — o Cássio já deu a instrução de refazer o front, mas confirmar antes de cada superfície (respeitar fronteira Design/Code — ver memória `feedback_divisao-front-back`).

---

## 2. Nome / Marca

- **Nome comercial final = ANCOREO** (âncora + SEO). HARPIA virou codinome interno/legado.
- Ainda como legado: repo HARP.IA, deploy `harp-ia.vercel.app`, CLAUDE.md fala "HARPIA", skill `harpia-status`.
- Logo: **não existe ainda** — Cássio desenha depois. No mockup usei âncora ⚓ + cor teal como placeholder.

---

## 3. Estado do produto (resumo — confirmar com `harpia-status`)

**Funciona:** geração de site em produção (Claude API), deploy na Vercel a partir de `master`, migration `match_knowledge` aplicada no banco, `ANTHROPIC_API_KEY` confirmada.

**Gates de pré-lançamento público** (detalhe na memória `project_harpia_pre-launch`):
1. **RAG / `OPENAI_API_KEY`** — ADIADO de propósito. Código já deployado, falha graciosa sem a chave. TEM que estar em pé antes do lançamento público (pôr chave no `.env.local` + Vercel → redeploy → testar blog ingerir/recuperar `knowledge_vault`).
2. **Ligar Fluid Compute na Vercel** (Settings → Functions; precisa Vercel Pro) — pro `maxDuration` valer.
3. **Rotacionar `service_role` do Supabase** (vazou em chat antigo) — reset + atualizar `.env.local` e Vercel.
4. **Domínio / DNS** (wildcard p/ sites publicados) — ação do Cássio, Claude guia campo a campo.

Não bloqueia beta grátis: Stripe, Inngest, GBP nível 3.

---

## 4. Decisões registradas nesta sessão

- **Modelo de IA = manter Claude** (Sonnet gera, Haiku mecânico; OpenAI só embeddings/RAG). Ver `project_harpia_modelo-ia`. Harness A/B cego em `scripts/ab-test.mjs` pra revisitar com dado.
- **Feature futura nova:** Gerador de Release / Nota à Imprensa Local (add-on de autoridade/E-E-A-T) — registrado em `project_harpia_features_futuras` (item 3). Origem: análise do blog da Knewin. Fora do MVP.
- **Redesign clean ANCOREO** em andamento (seção 1 acima).

---

## 5. Regras que NÃO podem ser esquecidas

- **Nunca expor/ler valores de segredos** (ANTHROPIC / OPENAI / service_role). Não colocar chave em arquivo nenhum.
- **Migrations ao vivo só com OK do Cássio.**
- **Ritmo simples** (memória `feedback_ritmo-simples`): explicar simples, 1 conceito por vez, confirmar antes de avançar; não pular pra código/mockup antes de alinhar.
- **Fronteira Design/Code** (`feedback_divisao-front-back`): não impor visual; integrar lógica sem reescrever design do Cássio.

---

## 6. Arquivos tocados nesta sessão

- `_mockups/ancoreo-landing.html` — NOVO. Protótipo de landing clean, toggle Escuro/Claro, marca ANCOREO. (mockup, fora do build do app)
- `HANDOFF.md` — este arquivo.
- Memórias atualizadas: `project_harpia_features_futuras.md` (item 3) + `MEMORY.md`.

---

## 7. Como retomar (cole isto no início da próxima sessão)

> "Retomando o ANCOREO. Leia `dove-site-builder/HANDOFF.md` e rode a skill `harpia-status`. A tarefa em aberto é o redesign clean do front: já existe o mockup `_mockups/ancoreo-landing.html` com as duas direções (escuro/claro). Eu escolhi a direção: **[ESCURO ou CLARO]**. Aplique na landing real como piloto, depois propaga pro resto."

(Troque **[ESCURO ou CLARO]** pela sua escolha depois de ver o mockup.)
