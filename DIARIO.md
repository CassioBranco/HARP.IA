# DIÁRIO — ANCOREO

> **ARQUIVO GERADO. Não edite à mão.** Rode `node scripts/diario.mjs`.
> Cada linha é um commit real. A data é a do commit, não a da lembrança.
> Última geração: **2026-08-13**

Onde estamos hoje: [ESTADO.md](ESTADO.md) · Onde queremos chegar: [MVP.md](MVP.md) · Como trabalhamos: [RITUAL.md](RITUAL.md)

## Resumo

| | |
|---|---|
| Alterações registradas | **128** |
| Primeira | 2026-06-04 |
| Última | 2026-08-11 |
| Dias com trabalho | 28 |
| Ainda não enviadas pro ar | nenhuma |

Uma linha aqui não quer dizer que a coisa funciona para o cliente. Quer dizer
que o código mudou. Se funciona ou não, quem responde é o ESTADO.md, que testa
o código em vez de acreditar nele.

## agosto de 2026

| data | | mudança |
|---|---|---|
| 2026-08-11 | — | editor: preview de Desktop deixa de renderizar em largura de celular |
| 2026-08-11 | — | Nota unica de SEO, Google Perfil so com prova e limpeza de codigo morto |
| 2026-08-11 | teste | empresa de teste sob demanda (seed idempotente + --limpar) |
| 2026-08-07 | — | Ponte blog <-> Google Perfil: artigo publicado vira isca, sem estourar a cadencia |
| 2026-08-07 | novo | pilar do Google Perfil ponta a ponta (5.2 a 5.6) |
| 2026-08-07 | documento | indexa os 7 wireframes de referencia e liga aos pilares do MVP |
| 2026-08-07 | documento | escopo do MVP em 5 pilares + ESTADO.md gerado no lugar da prosa |
| 2026-08-06 | novo | metricas reais ponta a ponta + trava anti-depoimento inventado |

<details>
<summary>Por que cada uma dessas mudanças foi feita</summary>

**2026-08-11 — editor: preview de Desktop deixa de renderizar em largura de celular**

O palco do editor tem ~600px. O iframe herdava essa largura, entao o site abria em 592px e caia no layout estreito dos templates: titulo gigante, menu empilhado, tudo espremido. O dono editava no modo Desktop uma coisa que nao era o desktop dele, e publicava outra.

**2026-08-11 — Nota unica de SEO, Google Perfil so com prova e limpeza de codigo morto**

Uma nota so. O editor e o painel calculavam a pontuacao com duas implementacoes independentes e podiam divergir na mesma tela. Agora os dois chamam buildSiteScores; o painel ganhou o quarto anel (Autoridade) e o texto de "o que melhorar" passou a vir do proprio motor, em vez de um dicionario paralelo que ja divergia.

**2026-08-11 — empresa de teste sob demanda (seed idempotente + --limpar)**

O unico site publicado no banco e de cliente real. Testar a ponte blog -> Google Perfil exigia um site COM dominio e publicado, entao a alternativa era mexer no site do cliente. Agora nao: um comando cria uma padaria falsa completa (login, tenant, site publicado, perfil de onboarding preenchido, duas paginas) e outro apaga tudo sem rastro.

**2026-08-07 — Ponte blog <-> Google Perfil: artigo publicado vira isca, sem estourar a cadencia**

Ida (automatica): ao publicar um artigo, nasce um post do Perfil apontando pra ele. NAO e resumo. Resumo bom mata o clique, e o clique e onde mora o SEO: o prompt exige UM fato do artigo e proibe "leia o artigo completo". Quem faz esse trabalho e o botao.

**2026-08-07 — pilar do Google Perfil ponta a ponta (5.2 a 5.6)**

5.2 Link do perfil: o servidor abre o encurtador e le nome, place_id e cid. Link morto da 404 e e recusado. O que o servidor NAO consegue e provar que o negocio existe (URL de negocio inventado responde 200 igual a de um real), entao a confirmacao e visual: mostra o mapa e pergunta ao dono.

**2026-08-07 — indexa os 7 wireframes de referencia e liga aos pilares do MVP**

Os wireframes de blog e changelog (Magic UI) estavam no acervo mas orfaos: nenhum documento apontava pra eles, entao na pratica nao existiam. Mesmo problema que os docs de estado tinham.

**2026-08-07 — escopo do MVP em 5 pilares + ESTADO.md gerado no lugar da prosa**

Em 07/08 a documentacao mentiu duas vezes no mesmo dia: o ESTADO-MVP.md afirmava que a loja funcionava (botao de comprar `disabled`, tres modulos sem um unico importador) e havia tres arquivos disputando o papel de "leia primeiro". Doc em prosa envelhece sozinha.

**2026-08-06 — metricas reais ponta a ponta + trava anti-depoimento inventado**

Fecha a fila de back-end antes da semana de front.

</details>

## julho de 2026

| data | | mudança |
|---|---|---|
| 2026-07-29 | correção | conserta grade do editor quebrada pela barra de score |
| 2026-07-22 | documento | wireframe do builder (referência Lovable/Figma), protocolo de diagnóstico, roadmap e planos |
| 2026-07-22 | novo | llms.txt por tenant + robots 2026 + rota dos arquivos GEO/AEO |
| 2026-07-22 | correção | blindagem contra seção hero com payload aninhado (barras cinzas) |
| 2026-07-16 | junção | editor de 2 painéis (conteúdo + design) para produção |
| 2026-07-10 | novo | editor de 2 painéis (conteúdo + design) sobre o core da beta |
| 2026-07-10 | documento | corrige F15 (revertido) + registra hotfix do editor 820909b |
| 2026-07-10 | revertido | volta editor pra versão da beta (fe81441) — hotfix |
| 2026-07-10 | documento | registra deploy 59b4e48 (ícones SVG + editor) + D27 |
| 2026-07-10 | novo | ícones SVG inline nos 10 layouts + melhorias do editor |
| 2026-07-05 | novo | NV1–NV6 + endurecimento de backend + loja/leads/agendamento/parcerias |
| 2026-07-02 | — | Núcleo de design v2 (Carta Náutica): tema claro/escuro, onboarding, painel, editor, galeria e blog |

<details>
<summary>Por que cada uma dessas mudanças foi feita</summary>

**2026-07-29 — conserta grade do editor quebrada pela barra de score**

A ScoreBar virou filho do grid .ed mas o CSS commitado so tinha colunas (1 linha implicita) e nenhuma regra posicionando .ed-score. A barra caia solta na grade, empurrava os paineis e o preview: paineis cortados na metade da altura, preview jogado pra baixo, vazio no meio.

**2026-07-22 — llms.txt por tenant + robots 2026 + rota dos arquivos GEO/AEO**

- app/llms.txt/route.ts: llms.txt host-aware (painel e site publicado), gerado dos dados reais do site (páginas, serviços, blog, FAQ, contato) - app/robots.ts: lista de bots de IA atualizada pra 2026 - middleware.ts: robots.txt/sitemap.xml/llms.txt excluídos do rewrite de tenant pra que os handlers de raiz respondam no domínio do cliente - docs/AEO-ARCHITECTURE-RULES.md: diretrizes de implementaçã...

**2026-07-22 — blindagem contra seção hero com payload aninhado (barras cinzas)**

Uma linha legada de sections gravou o payload inteiro do site dentro da seção hero (content.hero.headline em vez de content.headline). O editor lia as chaves planas, achava undefined e renderizava os campos vazios. O SectionEditor agora desaninha linhas malformadas ao carregar e o primeiro save regrava no formato plano correto. A linha corrompida do site afetado já foi reparada direto no banco.

**2026-07-16 — editor de 2 painéis (conteúdo + design) para produção**

Substitui o editor da beta pela versão de 2 painéis testada na branch editor-2paineis. SectionEditor com load() endurecido (try/catch/finally). tsc verde.

**2026-07-10 — editor de 2 painéis (conteúdo + design) sobre o core da beta**

Refaz o layout de 4 colunas (rail | conteúdo | preview | design) que a reescrita anterior tentou, mas SEM o skeleton/cache que travou o SectionEditor. Painel esquerdo = Conteúdo (Textos/Imagens/Marca); painel direito = Design & Ajustes (Modelo/Cores/Fontes/SEO/Agenda/Leads). Abas quebram linha em vez de espremer.

**2026-07-10 — corrige F15 (revertido) + registra hotfix do editor 820909b**

F15 sai de FEITO (reescrita do editor revertida). Nota de deploy atualizada com o hotfix e a licao: tsc/build nao pegam o bug de runtime do editor.

</details>

## junho de 2026

| data | | mudança |
|---|---|---|
| 2026-06-30 | novo | beta ANCOREO — rename, domínio próprio e telemetria de funil |
| 2026-06-28 | velocidade | carrega prévia do template só quando entra na tela |
| 2026-06-28 | novo | casca compartilhada (SiteShell) + esqueleto de blog + lista de artigos |
| 2026-06-28 | novo | esqueleto de loja que veste qualquer template |
| 2026-06-28 | documento | corrige estratégia de imagem (Sharp+WebP+<img> já é o padrão; falta srcset) |
| 2026-06-28 | documento | arquitetura (engenharia reversa dos líderes + camada SEO/GEO/AEO) |
| 2026-06-27 | novo | sub-escolha de loja na tela 1 (checkout vs catálogo) |
| 2026-06-27 | documento | adota o ruleset ponytail (lazy senior dev) — AGENTS.md + ponteiro no CLAUDE.md |
| 2026-06-26 | novo | fundação E2 — checkout (abstração de pagamento + pedidos) |
| 2026-06-26 | documento | marca RLS de leitura pública como resolvida |
| 2026-06-26 | correção | site e blog publicados legíveis por visitante anônimo |
| 2026-06-26 | documento | marca backend E1 como concluído e migrations aplicadas |
| 2026-06-26 | novo | server actions de CRUD do catálogo (E1) |
| 2026-06-26 | novo | guia de como vincular domínio próprio (DNS) na escolha de endereço |
| 2026-06-26 | novo | fundação E1 — catálogo + vitrine AEO-native |
| 2026-06-26 | manutenção | ANCOREO em casa própria + rename harpia->ancoreo |
| 2026-06-26 | documento | cronograma alinhado ao roadmap original (Fase A-D/Sprints) + contexto pro novo chat |
| 2026-06-26 | novo | cronograma vivo do ANCOREO + snapshot do banco e linha de sessoes |
| 2026-06-26 | documento | cronograma completo do projeto (fonte da verdade) — substitui trello/STATUS antigos |
| 2026-06-25 | correção | users.id -> auth.users com ON DELETE CASCADE |
| 2026-06-25 | — | rebrand: HARPIA -> ANCOREO em toda a copy/docs + gate de onboarding 75% |
| 2026-06-24 | manutenção | redeploy para aplicar chaves novas do Supabase (publishable/secret) corrigidas |
| 2026-06-24 | documento | visual do front vai pro Claude Design + rotação service_role em andamento |
| 2026-06-21 | — | docs+tooling: stack real no CLAUDE.md + skill harpia-status + harness A/B cego de modelos |
| 2026-06-21 | novo | WhatsApp do cliente vira CTA principal + alt text transacional (SEO/GEO/AEO) |
| 2026-06-21 | correção | trava o furo do GPE + medidor SEO visivel + ultima tela compacta (recap 2x2) |
| 2026-06-21 | novo | clicar no preview p/ editar texto/imagem + trocar template do site |
| 2026-06-21 | correção | maxDuration 300/180 p/ geracao longa (requer Fluid Compute no Vercel) |
| 2026-06-21 | novo | cofre de conhecimento E-E-A-T (embeddings OpenAI + match_knowledge + blog usa conhecimento real do cliente) |
| 2026-06-19 | novo | fundação de ponto focal de imagem (image_pos) |
| 2026-06-19 | correção | faixa de funcionários no porte + saída pro painel no 2º site |
| 2026-06-19 | novo | página pública de artigo + seeds de cotas e prompts |
| 2026-06-19 | correção | score de links internos lê a tabela real, não o nº de páginas |
| 2026-06-19 | novo | publicação de artigo server-side com gate AEO + links internos |
| 2026-06-19 | novo | pipeline de publicação — gate seo-validator + grafo de links + roteamento por host |
| 2026-06-19 | novo | HARPIA é o nome oficial — codinome = marca = identidade |
| 2026-06-19 | novo | rename project from HARPIA (codename) to Ancoreo (commercial name) |
| 2026-06-18 | — | GBP nível 2: gerador de posts do Perfil de Empresa (copia e cola) |
| 2026-06-18 | — | GBP fase 1: conecta o Perfil de Empresa ao site publicado |
| 2026-06-18 | — | Onboarding: adiciona opção "já tenho um domínio" na tela de endereço |
| 2026-06-18 | novo | logo no site, favicon e botoes de redes sociais |
| 2026-06-17 | correção | inclui binarios do sharp no bundle da funcao (Vercel) |
| 2026-06-17 | novo | anima o overlay de geracao (estrelinha + barra + passos) |
| 2026-06-17 | manutenção | redeploy para aplicar ANTHROPIC_API_KEY no runtime |
| 2026-06-17 | correção | falha limpa quando ANTHROPIC_API_KEY falta no ambiente |
| 2026-06-17 | novo | limita raio de MEI/micro a no maximo 30 km |
| 2026-06-17 | correção | gera conteudo automaticamente ao abrir site vazio + guard no blog |
| 2026-06-17 | novo | saneamento deterministico do conteudo gerado |
| 2026-06-17 | velocidade | elimina download duplicado de fontes + remove dep morta |
| 2026-06-17 | correção | textos sumindo no preview + regenerar pagina quebrado |
| 2026-06-16 | novo | selo de IA padronizado (estrelinha) em todo ponto com IA |
| 2026-06-16 | novo | segmento por busca (autocomplete) sobre os 56 da taxonomia |
| 2026-06-16 | visual | scrollbars temáticas, scroll suave e polish de tela grande |
| 2026-06-16 | correção | upload de imagem funciona ponta a ponta |
| 2026-06-16 | correção | seta tenant_id nos inserts pra geração/blog/imagens persistirem |
| 2026-06-15 | novo | galeria de imagens, painel=métricas+calendário, páginas dedicadas, fix botão sair |
| 2026-06-15 | novo | preview mostra site real (texto+fonte+imagens) e fonte aplica nos layouts |
| 2026-06-14 | novo | re-skin liquid-glass + corrige chrome dobrado |
| 2026-06-14 | correção | /editor redireciona pro editor do site mais recente (era stub em breve) |
| 2026-06-14 | manutenção | remove rota temporaria /api/debug/provision (bug resolvido) |
| 2026-06-14 | correção | concede GRANTs faltantes a service_role/authenticated/anon |
| 2026-06-14 | manutenção | captura status HTTP cru do REST pra diagnosticar chave |
| 2026-06-14 | manutenção | rota temporaria /api/debug/provision pra diagnosticar service_role |
| 2026-06-14 | correção | auto-provisiona tenant na criação do site (resolve Perfil não encontrado) |
| 2026-06-14 | correção | criação de site falhava no CHECK de preset/niche/template |
| 2026-06-14 | correção | provisiona tenant/users no callback (login Google sem perfil) |
| 2026-06-14 | correção | grade rola + cada template com sua paleta original |
| 2026-06-14 | novo | grade de thumbnails + tag do Google no painel |
| 2026-06-14 | correção | Google não conectado avisa em vez de travar |
| 2026-06-14 | manutenção | re-trigger deploy (webhook do GitHub não disparou no push anterior) |
| 2026-06-14 | correção | validação por tela, selo reativo e score de SEO bloqueante |
| 2026-06-14 | novo | incorpora front-end (beta fechada) — telas, paleta por site e fix de RLS |
| 2026-06-12 | documento | briefing de front-end para o Claude Design (tokens, onboarding 5 telas, regras de UI) |
| 2026-06-12 | novo | reescreve fluxo de 11 para 5 telas |
| 2026-06-11 | novo | implement all 10 polished template layouts + marketing landing page |
| 2026-06-11 | novo | pipeline de publicação completo |
| 2026-06-11 | novo | score EEAT + blog cluster type + métricas com filtro por pilar |
| 2026-06-10 | correção | handleCreate inclui tenant_id e exibe mensagem de erro detalhada |
| 2026-06-10 | correção | instala sharp e corrige config para Next.js 14 (serverComponentsExternalPackages) |
| 2026-06-10 | correção | sharp como serverExternalPackage para build no Vercel |
| 2026-06-10 | novo | templates, editor completo, backend IA e score SEO/GEO/AEO |
| 2026-06-07 | novo | simplifica fluxo de 13 para 11 telas |
| 2026-06-07 | manutenção | remove roadmap-notion.csv obsoleto |
| 2026-06-07 | documento | STATUS-PROJETO.md atualizado S2 concluido |
| 2026-06-07 | novo | rewrite completo Typeform-style 13 telas |
| 2026-06-05 | documento | STATUS-PROJETO e roadmap-notion atualizados — handoff sessao 4 |
| 2026-06-04 | correção | mensagem amigavel para rate limit no signup |
| 2026-06-04 | correção | X-Frame-Options SAMEORIGIN para permitir preview em iframe |
| 2026-06-04 | novo | score CPF dinamico com barras de sinal, impacto por step e linguagem leiga |
| 2026-06-04 | novo | tooltips fade in/out + keywords sugeridas + banner IA no Step 5 |
| 2026-06-04 | correção | Suspense boundary para useSearchParams no confirme-email |
| 2026-06-04 | manutenção | force vercel rebuild |
| 2026-06-04 | novo | checklist de requisitos de senha + barra de forca no login e signup |
| 2026-06-04 | correção | remove double layout wrapper, eye toggle e forca de senha corrigidos |
| 2026-06-04 | documento | STATUS-PROJETO atualizado — handoff sessao 3 |
| 2026-06-04 | novo | Nominatim autocomplete + slider de raio, remove coverage_areas |
| 2026-06-04 | novo | galeria split-panel com preview desktop/mobile, sidebar de nichos e paletas |
| 2026-06-04 | novo | paleta azul, eye toggle, forca de senha, pagina confirme-email dedicada |
| 2026-06-04 | novo | tela de confirmacao de email com passos e reenvio |
| 2026-06-04 | correção | mensagem de erro especifica no login (email nao confirmado) |
| 2026-06-04 | — | debug: mostrar erro real do Supabase no signup |
| 2026-06-04 | correção | TypeScript errors em palettes e example-content |
| 2026-06-04 | correção | ensureProfile nao-fatal no signup |
| 2026-06-04 | correção | ensureProfile nao-fatal no login — redireciona mesmo sem tenant |
| 2026-06-04 | correção | ignorar ESLint/TS no build para prototipo |
| 2026-06-04 | correção | remover rota duplicada /onboarding |
| 2026-06-04 | novo | protótipo completo - landing, auth, onboarding, templates, dashboard, preview |
| 2026-06-04 | — | Fundação HARPIA: Next.js 14 + Supabase + 17 tabelas + docs de arquitetura |

---

## Como ler isto

**Etiqueta** diz a natureza da mudança:

| etiqueta | quer dizer |
|---|---|
| novo | funcionalidade que não existia |
| correção | algo estava quebrado e passou a funcionar |
| reescrita | mesmo comportamento, código melhor por dentro |
| velocidade | mesma coisa, mais rápido |
| documento | só texto mudou, o produto está igual |
| revertido | uma mudança anterior foi desfeita porque quebrou algo |
| manutenção · teste · build · ci | encanamento interno, invisível pro cliente |

**"no computador, ainda não no ar"** quer dizer que a mudança existe aqui mas
ninguém de fora consegue ver ainda. Some sozinho quando sobe.
