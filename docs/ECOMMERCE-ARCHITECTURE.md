# ANCOREO — Arquitetura de E-commerce (engenharia reversa dos líderes + nossa camada SEO/GEO/AEO)

> 2026-06-28. Base: pesquisa dos melhores e-commerces de 2026 + nosso stack já existente.
> Prazo-alvo do projeto: ~10/07/2026. Este doc prioriza MVP vs pós-launch.

## 0. Princípio (o que os líderes fazem — e por que já estamos alinhados)
Os e-commerces mais rápidos de 2026 são **headless**: front desacoplado em **Next.js App Router + React Server Components (RSC) + Server Actions**, hospedado na borda (Vercel), com o catálogo num backend de dados. Resultado: LCP 1.4–1.8s, Lighthouse 90+, Core Web Vitals verdes (que são sinal de ranqueamento no Google). ([headless 2026](https://www.csschopper.com/blog/top-10-headless-commerce-platforms/), [Next.js Commerce](https://vercel.com/blog/introducing-next-js-commerce-2-0))

**O ponto:** o ANCOREO **já roda nesse stack** (Next.js App Router + RSC + Server Actions + Supabase + Vercel). Nossa vitrine já é server-rendered, já usa server actions pra checkout, já emite JSON-LD. Ou seja, não trocamos de arquitetura — aplicamos os padrões de PDP/responsividade por cima e mantemos nosso diferencial: o conteúdo AEO/GEO que a IA cita.

## 1. Padrões a aplicar (engenharia reversa) × nosso estado × dono
Cada linha: o que os líderes fazem → onde estamos → ação → quem faz.

| Padrão (líderes) | Nosso estado | Ação | Dono |
|---|---|---|---|
| **RSC server-render do PDP**, hidratar só o interativo (carrinho/variante) | ✅ vitrine e PDP são server components | manter; carrinho/variante como ilhas client | Code |
| **Mobile-first, thumb-zone, LCP < 2s** (60%+ tráfego mobile) | parcial (layout funcional) | layout mobile-first, ação primária na "zona do polegar" | Design |
| **Imagens responsivas** (AVIF/WebP + `srcset`, tamanho certo por tela) | já pré-otimiza WebP via Sharp + `<img>` (grátis) | falta `srcset` por tamanho (seção 3) | Code |
| **Sticky add-to-cart** no mobile (alto impacto, baixo esforço) | não existe | barra fixa de "Comprar" no rodapé mobile | Design |
| **Galeria com swipe horizontal + indicador** | 1 imagem + thumbs | galeria deslizável | Design |
| **Acordeões** p/ specs, frete, trocas | ✅ specs em tabela + FAQ em accordion | manter | Code/Design |
| **Seletor de variante correto** (57% dos sites erram) | ❌ não temos variantes | modelo de dados de variantes (seção 4) | Code |
| **Transparência de preço + frete** (67% escondem frete) | preço ✅, frete ❌ | exibir frete/prazo claro | Code+Design |
| **Vídeo no PDP** (+83% conversão) | não | campo de vídeo (pós-MVP) | depois |

Fontes: [Baymard PDP UX](https://baymard.com/blog/current-state-ecommerce-product-page-ux), [PDP best practices 2026](https://www.mobiloud.com/blog/ecommerce-product-detail-page-best-practices).

## 2. Nossa camada SEO/GEO/AEO (o diferencial, por cima do formato dos líderes)
O que nos separa de um Shopify genérico — o site é a **resposta** que Google E IAs entregam:
- **JSON-LD** `Product`+`Offer` ✅ · `FAQPage` ✅ · `Review`/`AggregateRating` ⏳ (com reviews).
- **Descrição "resposta-primeiro" densa em fatos** ✅ (agente IA `product`).
- **Feed de produto** (JSONL) p/ Google Merchant + ChatGPT Shopping ✅ (`/feed`).
- **CWV verde = SEO + AEO ao mesmo tempo** (perf é ranqueamento e é o que a IA consegue ler).
- **Consistência de entidade** (nome/categoria estáveis entre site, feed e schema).

## 3. Ferramentas (grátis e escaláveis — decisões)
| Necessidade | Escolha | Por quê (grátis/escala) |
|---|---|---|
| Framework + hosting | **Next.js App Router + Vercel** (já) | mesmo stack do Next.js Commerce; free tier escala na borda |
| Banco/catálogo | **Supabase Postgres** (já) | free tier; RLS multi-tenant pronto |
| **Imagens responsivas** | **estender o pipeline Sharp (já existe) p/ emitir 2–3 tamanhos + `<img srcset>`** | o app já pré-otimiza WebP via Sharp no upload e serve com `<img>` — grátis, sem config (`next.config.mjs` não usa `next/image` de propósito). Falta só o `srcset` por tamanho de tela. `next/image` é alternativa, mas adiciona o custo de otimização da Vercel (free-tier limitado) e diverge do padrão atual — não trocar à toa. *(Supabase Image Transform exige Pro — descartado.)* |
| Busca de produto | **Postgres full-text (Supabase)** | grátis; suficiente p/ loja local. Algolia só se escalar muito |
| Pagamento | **Mercado Pago** (já decidido) | sem custo fixo, só taxa por venda; Pix nativo |
| CWV/analytics | **Vercel Speed Insights + Google Search Console** | grátis |
| Plataforma headless paga (Shopify/commercetools) | **NÃO** | nós *somos* a plataforma, nos mesmos padrões — sem custo de licença |

## 4. Variantes (a maior lacuna estrutural vs líderes)
Loja real tem tamanho/cor/SKU. Hoje é 1 SKU por produto. Modelo proposto (quando entrar):
`product_variants (id, product_id, tenant_id, sku, option_label, price_cents, stock, image_id, position)`.
O checkout passa a referenciar `variant_id` (preço/snapshot vêm da variante). **Decisão de prazo:** ver seção 5 — variantes podem ficar logo após o MVP, já que muito negócio local começa com produto simples.

## 5. Plano priorizado até ~10/07 (MVP vs depois)
**MVP pra ter loja no ar (ordem):**
1. 🎨 **Design:** PDP + vitrine mobile-first (sticky add-to-cart, galeria swipe, acordeões) sobre o náutico. Backend já expõe os dados.
2. 🟢 **Code:** adotar `next/image` na vitrine/PDP (responsivo + CWV) — decisão de tooling acima.
3. 🔴 **Você:** `MERCADOPAGO_ACCESS_TOKEN` (liga o checkout E2) + domínio/DNS.
4. 🟢 **Code:** carrinho (ilha client) + ligar `loja_modo` (checkout vs catálogo) no comportamento da vitrine.
5. 🟢 **Code:** frete/prazo visível no PDP (mesmo que "combinar" no início).

**Pós-MVP (não trava o launch):**
- Variantes (seção 4) · Reviews + `AggregateRating` · vídeo no PDP · submissão real do feed ao ChatGPT/Merchant · adaptador Stripe/ACP (vender dentro do ChatGPT).

## 6. O que NÃO mudar (já está certo)
Server actions p/ mutação (não expor API), JSON-LD no server, feed JSONL, preço sempre do banco, RLS multi-tenant, leitura pública via admin filtrando `published`. Tudo isso já segue o padrão dos líderes.
