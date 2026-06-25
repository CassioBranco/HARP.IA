# Briefing de Front-end — ANCOREO (para o Claude Design)

> Objetivo: melhorar o front-end do **onboarding** e do **ANCOREO** em geral.
> Última atualização: 2026-06-12. Leia junto com `CLAUDE.md` (regras de produto) e este arquivo (regras de UI).

---

## 1. Stack de front-end

| Camada | O que é |
|--------|---------|
| Framework | **Next.js 14** (App Router, React Server Components, TypeScript estrito) |
| Estilo | **Tailwind CSS** + tokens via CSS variables (HSL) em `app/globals.css` |
| Componentes base | padrão **shadcn/ui** (componente = código-fonte) |
| Fontes | **Plus Jakarta Sans** (headings, `--font-heading`) + **Inter** (corpo, `--font-body`) — carregadas via `next/font/google` em `app/layout.tsx` |
| Ícones atuais no onboarding | emojis (simples e leves). Pode evoluir pra lucide-react se quiser. |

---

## 2. Design tokens REAIS (fonte da verdade: `app/globals.css`)

> ⚠️ A cor da marca é **AZUL**, não esmeralda. O `docs/STATUS-PROJETO.md` está desatualizado (diz verde) — ignore-o para cor.

### Light mode
```
--background: 214 30% 99%     (quase branco, leve azulado)
--foreground: 222 30% 12%     (texto escuro)
--card: 0 0% 100%
--primary: 221 83% 53%        ≈ #3b82f6  (AZUL — cor da marca)
--accent:  217 91% 60%        (azul mais claro)
--secondary: 214 20% 94%
--muted: 214 16% 95%   /  --muted-foreground: 220 12% 46%
--border: 214 14% 88%
--ring: 221 83% 53%
--destructive: 0 72% 48%
```
Dark mode existe e segue a mesma paleta (azul `217 91% 60%`).

**Regra:** use sempre os tokens (`bg-primary`, `text-muted-foreground`, `border-border`…). Nunca cor hardcoded (`#3b82f6`, `text-blue-500`) em componente de UI — quebra o dark mode e a troca de tema.

---

## 3. Onboarding — estado atual (acabou de ser reescrito)

**Arquivo único:** `app/onboarding/page.tsx` (client component).
Saiu de 11 telas para **5 telas** estilo Typeform. Backup do antigo: `docs/_backups/onboarding-11telas.tsx.bak`.

### As 5 telas
1. **Nome** do negócio
2. **Sobre** — textarea "o que faz" + seletor de nicho (grade categoria→nicho, **pré-marcada** por um chute via regex `guessNiche`) + "quantas pessoas" + cidade (`CitySearch`) + slider de raio
3. **Perfil no Google** — cola link do Maps OU "não tenho ainda"
4. **Conhecimento vale ouro** — textarea + medidor de sinal SEO em tempo real
5. **Prévia + Gerar** — recap "você está pronto" + botão Gerar

### Componentes internos (todos no mesmo arquivo, à vontade pra extrair/restyle)
- `ScreenLayout` — wrapper Typeform: header (logo + "Salvando…") + barra de progresso + corpo + rodapé fixo (Voltar / Continuar). **É o esqueleto visual — melhorar aqui impacta todas as telas.**
- `CitySearch` — autocomplete de cidade (Nominatim/OpenStreetMap)
- `INPUT_CLS` / `TEXTAREA_CLS` — classes Tailwind compartilhadas dos campos
- `calcExpertiseSEO` — medidor de sinal SEO da tela 4
- `guessNiche` / `guessCategory` — chute de nicho (lógica, não UI)
- `CATEGORIES` / `NICHES_BY_CAT` — dados das grades

### ⚠️ NÃO QUEBRAR (lógica, não estilo) ao mexer no onboarding
Mexa no visual à vontade, mas preserve o comportamento:
- `init()` → auth (redireciona pra `/login` sem sessão) + restaura perfil salvo do Supabase
- `save()` / `scheduleSave()` → **autosave** com debounce de 1,5s no Supabase + localStorage
- Mapeamento de save: `about`+`team_size` → `differentials`; `expertise` → `cases`; Google → `gbp_data`
- `canNext` por tela (validação que libera o botão Continuar)
- O botão "Gerar" da tela 5 **não é mais bloqueado por score** — sempre ativo

---

## 4. Resto do app (ANCOREO) — mapa rápido

```
app/
├── (auth)/            login, signup, confirme-email, reset   ← fluxo de entrada
├── onboarding/        page.tsx (5 telas — recém reescrito)
├── templates/         galeria: nicho → layout → paleta (iframe preview)
├── (dashboard)/
│   ├── sites/         "Meus sites"
│   ├── editor/[siteId]/   editor do site (sidebar + painel + preview iframe)
│   │   └── components/panels/  CustomizationPanel, BlogPanel, MetricsPanel,
│   │                           AccountPanel, ImageUploader, SectionEditor
│   ├── blog/          gestão de posts
│   └── settings/      plano / conta
└── [domain]/          sites publicados dos clientes (rota dinâmica)

components/templates/layouts/   ← 10 layouts de site dos clientes:
   Clean, Bold, Profissional, Portfolio, Acolhedor, Conversao,
   Magazine, Academia, Jovem, Tech
```

### Telas com maior retorno visual pra melhorar
1. **Onboarding** (prioridade do Cássio agora)
2. **Editor** (`editor/[siteId]`) — sidebar + painéis; é onde o cliente passa mais tempo
3. **Templates** (galeria de escolha)
4. **Auth** (login/signup) — primeira impressão

---

## 5. Regras INEGOCIÁVEIS de componentes (do `CLAUDE.md`)

- ❌ **NÃO** editar `components/atoms/` nem `components/molecules/` (protegidos — só manual)
- ❌ **NÃO** alterar tokens em `tailwind.config.ts` / `globals.css` sem instrução explícita do Cássio
- ✅ Pode operar em `components/organisms/`, `components/templates/`, páginas e nos layouts de site
- ✅ Componente novo nasce em `components/draft/` antes de ser promovido
- ✅ Reaproveitar componente existente antes de criar um novo

---

## 6. Voz / tom da UI (texto que aparece na tela)

- Direto, sem rodeios. **Zero em-dash (—), zero gerundismo**, sem "jornada"/"transformador"/"no mundo atual".
- CTA sempre com **verbo de posse**: "Quero agendar", "Gerar meu site" — nunca "Clique aqui".
- PT-BR, próximo e humano (público = dono de pequeno negócio local, leigo em tecnologia).

---

## 7. Como rodar e ver

- `npm run dev` → `http://localhost:3000`
- Deploy: **harp-ia.vercel.app** (auto-deploy no push pro `master`)
- O onboarding exige **estar logado** (sem sessão, redireciona pra `/login`). Para testar: criar conta em `/signup` (na fase beta a confirmação de email está desligada no Supabase, então cai direto no onboarding).
- Repo: `github.com/CassioBranco/HARP.IA` — branch `master`. **Dê `git pull` antes de começar.**

---

## 8. North Star (não esquecer)

O ANCOREO existe pra fazer o site do cliente **aparecer quando o cliente dele busca no Google e nas IAs** (SEO + GEO + AEO). Qualquer melhoria de UI deve respeitar: conteúdo no HTML inicial (Server Components), performance alta (Core Web Vitals), semântica limpa. Beleza não pode custar SEO.
