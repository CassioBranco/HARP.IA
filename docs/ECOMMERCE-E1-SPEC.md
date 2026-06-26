# ANCOREO — E-commerce · Spec da Fase E1 (Catálogo + Vitrine AEO-native)

> Status: **rascunho pra aprovação** (2026-06-26). Sem código até o Cássio aprovar.
> Decisões-mãe: [[project_ancoreo_ecommerce]]. Respeita a fronteira [[feedback_divisao-front-back]] (visual = Claude Design; back = Claude Code).

## 1. Objetivo da E1
Permitir que um lojista cadastre produtos com pouco esforço e o ANCOREO gere uma **vitrine pública que a IA lê, entende e recomenda** — JSON-LD completo, descrição resposta-primeiro, e feed de produto pra máquina. **Sem carrinho/checkout** (isso é E2). E1 já entrega valor de descoberta (Google + LLMs) mesmo antes de vender.

### Escopo — DENTRO da E1
- Modelo de dados de catálogo (produtos, coleções, imagens de produto).
- Tipo de site novo: **loja** (layout + página de produto + catálogo).
- Geração por IA da descrição (resposta-primeiro, densa em fatos) + FAQ + sugestão de specs.
- JSON-LD `Product` + `Offer` + `FAQPage` por produto.
- Endpoint de **feed de produto** (JSONL) pra Merchant Center / ChatGPT Shopping.
- Reuso do pipeline de imagem WebP (S5) com alt-text otimizado.

### Escopo — FORA da E1 (vai pra E2/E3)
- Carrinho, checkout, pagamento, pedidos, webhook → **E2**.
- Reviews/`AggregateRating`, submissão real do feed ao ChatGPT, ACP/Instant Checkout → **E3**.
- **Variantes** (tamanho/cor): fora da E1 pra entregar rápido — 1 SKU por produto na E1; variantes entram na E2. (Decisão explícita de corte de escopo.)

## 2. Modelo de dados (novas tabelas)
Padrão obrigatório do projeto: toda tabela tem `tenant_id` pra RLS via `auth_tenant_id()`, e precisa de **GRANTs explícitos** — ver [[learning_rls-tenant-id-insert]] e [[learning_supabase-grants-faltando]] (já queimamos a mão nisso).

### `products`
| coluna | tipo | nota |
|--------|------|------|
| id | uuid pk | |
| tenant_id | uuid not null | RLS |
| site_id | uuid not null fk→sites | de qual loja |
| slug | text not null | único por site; vira `/produto/[slug]` |
| name | text not null | |
| short_answer | text | a 1ª frase "resposta-primeiro" (o que é + pra quem) |
| description | text | corpo denso em fatos (gerado por IA) |
| specs | jsonb | atributos: {peso, dimensões, material, cor, compatibilidade...} |
| faq | jsonb | `[{q,a}]` → vira FAQPage schema |
| price_cents | integer not null | guardar em centavos (evita float) |
| currency | text default 'BRL' | |
| availability | text default 'in_stock' | in_stock / out_of_stock / preorder → mapeia p/ ISO schema.org |
| condition | text default 'new' | new / used / refurbished |
| sku | text | opcional, p/ schema + feed |
| gtin | text | opcional (EAN/UPC) — forte sinal p/ Google/IA |
| brand | text | opcional |
| category | text | opcional |
| rating_avg | numeric | null na E1; preenchido na E3 (reviews) |
| rating_count | integer default 0 | idem |
| status | text default 'draft' | draft / published |
| created_at / updated_at | timestamptz | |

### `collections` (categorias da loja)
`id, tenant_id, site_id, name, slug, description, position` — agrupa produtos. Relação N:N via `product_collections (product_id, collection_id)` **ou** `collection_id` direto no produto (1 produto = 1 coleção principal). **Decisão sugerida:** começar 1:N (coleção principal no produto) pra simplificar; N:N só se precisar.

### `product_images`
`id, tenant_id, product_id, url, alt, position`. Reusa o pipeline WebP existente (mesmo storage/conversão da S5). `alt` é obrigatório e otimizado (sinal AEO + acessibilidade).

> Migration a criar: `xxxx_ecommerce_catalog.sql` (3 tabelas + índices em (site_id, slug) + RLS policies espelhando o padrão atual + GRANTs select/insert/update/delete pro role autenticado).

## 3. Tipo de site "loja" (pluga no sistema atual)
- **[lib/templates/layouts.ts](../lib/templates/layouts.ts):** novo `LayoutId = 'loja'` com seções: hero, grade de produtos, coleções em destaque, sobre, FAQ.
- **[app/templates/model-data.ts](../app/templates/model-data.ts):** entrada nova em `MODELS` + paleta em `ORIGINAL_PALETTES` + `OBJETIVO_TO_LAYOUT.loja = 'loja'`.
- **components/templates/layouts/LojaLayout.tsx:** componente do layout. ⚠️ **O visual/clean é do Claude Design** — o Code entrega a estrutura funcional e os slots de dados; o acabamento visual vem do Design (fronteira [[feedback_divisao-front-back]]).
- Fluxo de escolha não muda: onboarding → [/templates](../app/templates/page.tsx) → `createSiteWithModel('loja', ...)` → editor.

## 4. Páginas públicas (dentro do [app/[domain]](../app/[domain]/page.tsx))
O roteamento por domínio já existe (middleware). Adicionar:
- **`/` (home da loja):** vitrine — hero + grade de produtos publicados + coleções.
- **`/produto/[slug]`:** página de produto (PDP) — short_answer no topo, fotos, specs em tabela, descrição, FAQ, preço, disponibilidade. Botão "Comprar" **desabilitado/placeholder na E1** (liga na E2).
- **`/loja` ou `/colecao/[slug]`:** listagem por coleção (opcional na E1).
- `buildSiteContent()` ([build-site-content.ts](../lib/templates/build-site-content.ts)) estendido pra buscar produtos por domínio.

## 5. Camada SEO/GEO/AEO (o diferencial — não é opcional)
Por produto, emitir **JSON-LD** (formato recomendado pelo Google):
- `Product`: name, description, image[], brand, sku, gtin, category + specs como `additionalProperty`.
- `Offer`: price, priceCurrency, **availability com valor ISO exato** (`https://schema.org/InStock` etc — nunca "yes"/"available"), itemCondition, url, priceValidUntil; e quando E2 existir, política de troca/frete.
- `FAQPage`: a partir do `faq` jsonb.
- `AggregateRating`/`Review`: só quando houver (E3).
Conteúdo da PDP segue **"resposta-primeiro"**: a 1ª frase responde "o que é + pra quem + por quê", depois fatos em tabela (specs), não marketing floreado — é assim que a IA extrai e cita.

### Feed de produto
Endpoint `/api/feed/[siteId]` (ou por domínio) gerando **JSONL** com 1 produto por linha (id, title, description, price, availability, image_link, link, brand, gtin, condition). Serve pro Google Merchant Center e é a base do feed do ChatGPT Shopping (submissão real = E3).

## 6. Geração por IA (reusa o motor atual)
- Novo escopo em `prompt_templates` (ex.: `scope='agent', agent='product'`) — carregado pelo [loader.ts](../lib/prompts/loader.ts) como as outras camadas. **Nunca hardcodar prompt no código** (regra do CLAUDE.md).
- Nova rota `/api/ai/product` espelhando [/api/ai/page](../app/api/ai/page/route.ts): recebe `product_id` + insumos mínimos do lojista (nome + 3–5 fatos) e gera `short_answer`, `description` densa, `faq`, e sugestão de `specs`.
- Reusa [lib/claude/client.ts](../lib/claude/client.ts) (Sonnet gera, prompt caching, SSE), log em `ia_generations` com `agent='product'`.
- **Quota:** geração de produto conta no cap diário via `plan_quotas` (mesmo mecanismo da geração de site).

## 7. Critérios de aceite da E1 (Definition of Done)
1. Lojista cria um produto com nome + fotos + preço + alguns fatos.
2. IA gera descrição resposta-primeiro + FAQ + specs; lojista revisa/edita.
3. PDP pública renderiza e **passa no Rich Results Test do Google** (Product + Offer + FAQ válidos).
4. Catálogo lista os produtos publicados; produto `draft` não aparece.
5. `/api/feed/...` retorna todos os produtos publicados em JSONL válido.
6. Imagens em WebP com alt-text preenchido.
7. Sem carrinho/checkout (botão Comprar é placeholder) — e isso é esperado.

## 8. Decisões pequenas ainda em aberto (resolver no início do build)
- Coleção 1:N (sugerido) vs N:N.
- Reusar tabela `images` existente vs `product_images` dedicada (sugiro dedicada, mais limpa).
- URL da PDP: `/produto/[slug]` (sugerido) vs `/p/[slug]`.

## 9. O que vem depois (resumo)
- **E2:** camada `PaymentProvider` (abstração) + **Mercado Pago Checkout Pro** + carrinho + pedidos + webhook + e-mail. Variantes entram aqui.
- **E3:** reviews/`AggregateRating` com foto + submissão do feed ao ChatGPT/Merchant Center + (Stripe) ACP/Instant Checkout = vender dentro do ChatGPT.

## 10. Status do build (2026-06-26) — backend E1 construído
✅ **Feito e com `tsc --noEmit` verde:**
- Migrations (NÃO aplicadas no banco ao vivo — aguardam OK): `20260626130000_ecommerce_catalog.sql` (products, collections, product_images + RLS + grants), `20260626140000_seed_product_prompt.sql` (agente `product`).
- Tipos: `lib/ecommerce/types.ts`.
- Dados da vitrine (leitura pública via admin client, filtrada a `published`): `lib/ecommerce/products.ts`.
- JSON-LD `Product`/`Offer`/`FAQPage`: `lib/ecommerce/product-jsonld.ts`.
- Geração por IA: `app/api/ai/product/route.ts`.
- Páginas públicas: `app/[domain]/loja/page.tsx` (catálogo), `app/[domain]/produto/[slug]/page.tsx` (PDP + JSON-LD), `app/[domain]/feed/route.ts` (feed JSONL).

⏳ **Falta na E1 (fora do meu alcance agora ou território Design):**
- Aplicar as 2 migrations no banco ao vivo (ação Cássio: OK explícito).
- UI do painel pra o lojista cadastrar/editar produtos e disparar a geração por IA (front = Claude Design + integração Code).
- Visual de marca das páginas de loja (hoje funcional/sem estilo — Claude Design).
- Wiring do tipo "loja" no seletor de templates (model-data.ts/layouts.ts) — território Design; deixei intocado de propósito.
- Quota de geração de produto: hoje só registra em `ia_generations` (agent='product'); cap diário fica pra E2.

⚠️ **Achado de segurança (fora do e-commerce):** nenhum site publicado é legível por visitante anônimo hoje (RLS `tenant_isolation` só libera o dono). A vitrine de e-commerce escapa porque lê via admin client, mas os sites de conteúdo não renderizam pro público até isso ser corrigido. Registrado como tarefa separada.
