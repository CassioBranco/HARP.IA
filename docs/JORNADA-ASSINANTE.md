# JORNADA DO ASSINANTE — Projeto ANCOREO
> O caminho que o assinante percorre na plataforma. Serve também como ORDEM DE CONSTRUÇÃO das telas (build na sequência que o usuário vivencia).
> Última atualização: 2026-06-04

---

## Visão geral (7 etapas)

```
1. APRESENTAÇÃO + LOGIN/CADASTRO
   Landing que explica o ANCOREO → convence → cria conta / entra

2. ONBOARDING (6 passos)
   Coleta dados do negócio: nome, nicho, área de atuação (cidade-base + raio),
   serviços, público, dores, diferenciais, credenciais, keywords, tom

3. ⚡ IA GERA O SITE   ← núcleo do produto
   A IA escreve TODOS os textos já otimizados (SEO/GEO/AEO, Método CPF,
   FAQ≥6, schema, search intent). O assinante NÃO escreve nada.

4. ESCOLHA DE TEMPLATE (por nicho)
   Vê o site pronto num template do nicho (8 nichos × 3 paletas) → escolhe

5. PERSONALIZAÇÃO
   Ajusta cores, fontes, imagens e textos (se quiser)

6. PUBLICAÇÃO
   Pipeline AEO (robots IA, JSON-LD, sitemap, internal_links, seo-validator)
   → site no ar no domínio próprio do cliente

7. PAINEL CONTÍNUO (uso diário)
   ├── Editor — mexe no site
   ├── Blog — gera/agenda posts com IA
   └── SEO/GEO/AEO — score de citabilidade + auditoria
```

---

## Detalhe por etapa (o que a tela faz)

| # | Tela | O que o assinante faz | Depende de |
|---|------|------------------------|------------|
| 1 | Apresentação + Login/Cadastro | Entende o produto, cria conta | Supabase Auth (✅ pronto) |
| 2 | Onboarding (6 steps) | Responde sobre o negócio, autossalvo, score ≥70 desbloqueia | schema onboarding_profiles (✅) |
| 3 | Geração (loading + preview) | Espera a IA gerar (~30-60s via Inngest) | **Blocos 1-13 + motor IA (pendente)** |
| 4 | Galeria de templates | Escolhe nicho/paleta | 8 templates (Sprint S3) |
| 5 | Personalização | Cor/fonte/imagem/texto | Editor + paletas |
| 6 | Publicar | Confirma e publica | Pipeline AEO (Sprint S5) |
| 7 | Painéis (editor/blog/SEO) | Gerencia o site no dia a dia | Sprints S6/S8 |

---

## Ordem de construção das TELAS (frente visual)

A casca visual pode ser construída ANTES do motor de IA (com conteúdo de exemplo), e depois a gente liga a IA.

1. **Apresentação + Login/Cadastro** ← COMEÇAR AQUI
2. **Onboarding wizard** (6 steps)
3. **Templates por nicho** (galeria + 1 template real)
4. **Painéis** (editor, blog, SEO)

O motor de IA (Blocos 1-13) entra em paralelo/depois, preenchendo as telas com conteúdo real.

---

## Princípio que não pode se perder

A parte visual (telas bonitas) é a casca. O **diferencial é o passo 3**: a IA gerando texto que aparece na busca (Google + LLMs). Mudar cor/fonte é fácil; o conteúdo otimizado é o produto. Sem isso, seríamos só mais um construtor de sites genérico. (Ver `NORTH-STAR.md`.)
