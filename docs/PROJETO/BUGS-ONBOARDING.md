# Debug do onboarding — 2026-07-02 (sessão noturna)

> Método: fluxo completo executado como usuário real no preview — conta de teste
> `teste-noite@ancoreo.com.br` criada via admin (confirmada), login pela UI,
> 7 telas preenchidas clicando/digitando, geração disparada, chegada em /templates,
> e conferência do que salvou no banco. Console e rede auditados na jornada inteira.

## Resultado geral

✅ O funil FUNCIONA de ponta a ponta: login → 7 telas → validações → SEO gate →
overlay de geração → /templates. Perfil salvo corretamente no banco
(nome, nicho, cidade, gpe, domínio, objetivo) e **11 eventos de telemetria**
registrados na jornada. Nenhum erro real de console.

## Bugs encontrados

### N2-1 · CRÍTICO · Autocomplete de cidades não achava digitação parcial — ✅ CORRIGIDO
- **Sintoma:** digitar "Chapec" → "Nenhuma cidade encontrada". Só o nome completo achava.
- **Causa raiz:** a rota `/api/onboarding/cities` era proxy do **Nominatim (geocoder)**,
  que não faz autocomplete de prefixo — além de depender de serviço externo com
  rate-limit de 1 req/s.
- **Correção:** lista oficial do IBGE (5.571 municípios) vendorizada em
  `lib/data/municipios-br.json` + busca local com normalização de acento e ranking
  prefixo>contém. "chapec", "sao jo", "florian" — tudo acha. Zero dependência externa.
- **Efeito colateral positivo:** o `state` agora salva a sigla ("SC") em vez do nome
  longo do Nominatim ("Santa Catarina"). Perfis antigos podem ter o nome longo.

### N2-2 · PRODUTO · Subdomínio grátis ainda era `.harpia.site` — ✅ CORRIGIDO no código
- **Sintoma:** a opção "Subdomínio grátis do ANCOREO" oferecia `slug.harpia.site`.
- **Correção:** trocado pra `slug.ancoreo.com.br` (onboarding + types).
- **🚫 GATE DO CÁSSIO:** pra esses subdomínios funcionarem de verdade é preciso
  (1) adicionar `*.ancoreo.com.br` como domínio wildcard no projeto Vercel e
  (2) criar um CNAME curinga `*` no Registro.br apontando pro mesmo alvo do www.
  Sem isso, sites em subdomínio não resolvem (igual já não resolviam no harpia.site).

### N2-3 · OBSERVAÇÃO · Autosave aborta requisições anteriores
- POSTs de autosave aparecem como ERR_ABORTED quando o próximo save/navegação
  os supera. O flushSave() final é aguardado antes de gerar, então nada se perde.
  Sem ação necessária — só não confundir com erro em debugging futuro.

## Melhorias aplicadas junto (N2)
- Onboarding reescrito no núcleo v2 minimal ("ficha de bordo"): token-based →
  já respeita tema claro/escuro; tipografia Fraunces + rótulos mono; decoração
  legada (aura/penas/pássaro/grão) removida do CSS e do TSX; marca com âncora;
  botão de gerar remapeado pro vermelho de sinal.
- `@import` de fonte do Google CDN removido do CSS (JetBrains Mono legado);
  o mono agora é o IBM Plex Mono self-hosted via next/font.

## Conta de teste
- `teste-noite@ancoreo.com.br` / senha `NoiteAncoreo#2026` (criada 2026-07-02,
  e-mail já confirmado). Tem 1 perfil de onboarding "Barbearia Farol Norte".
  Pode apagar depois do beta-test.
