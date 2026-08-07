# Modelos de referência (wireframes)

Sete wireframes em HTML puro. Cada um é **arranjo de elementos com
placeholder**, nunca visual final e nunca código para copiar.

Todos foram reescritos à mão de propósito. Os originais dependem de Next.js,
fumadocs, MDX, shadcn e Tailwind, e o site que o ANCOREO entrega ao cliente não
usa nada disso. Copiar o código traria a dependência junto; o que interessa é
onde cada coisa fica na tela.

Cada arquivo abre direto no navegador. O comentário no topo diz, bloco por
bloco, o que já existe no ANCOREO (`JÁ TEMOS`), o que é novo (`NOVO`) e o que
está pela metade (`PARCIAL`) — é por ali que se começa a ler.

---

## O acervo

### Sites de cliente

| arquivo | é para | quando usar |
|---|---|---|
| `landing-servico.html` | landing de serviço com captura de lead | **o mais alinhado ao ANCOREO.** Prestador, clínica, oficina: home única que termina em contato |
| `consultoria-agencia.html` | consultoria e agência | mesma família da landing, com mais prova e portfólio |
| `institucional.html` | institucional e organização | quem precisa existir bem no Google mas não vende pela página |
| `ecommerce-loja.html` | loja | **fora do MVP.** Fica guardado |

### Blog — dois extremos, escolha por densidade

| arquivo | é para | quando usar |
|---|---|---|
| `blog-magicui.html` | blog de produto: respirado, poucos elementos, grade de cartões colados por linha de 1px | **o padrão para a maioria dos clientes.** Cobre duas páginas: listagem `/blog` e artigo `/blog/[slug]` |
| `noticias-blog.html` | portal de notícias: denso, muitas seções, cara de jornal | volume alto de publicação, várias editorias |

### Painel

| arquivo | é para | quando usar |
|---|---|---|
| `changelog-magicui.html` | linha do tempo, data à esquerda e conteúdo à direita | **leia a nota do arquivo antes.** O uso bom é interno |
| `wireframe-lovable-builder.md` | anatomia do builder | referência do editor, não é página |

---

## A nota sobre o changelog

Ele quase virou um módulo errado. O arquivo argumenta o caso inteiro, mas o
resumo é:

**O uso que vale é no painel do assinante**, como registro do que o ANCOREO fez
pelo site dele naquela semana. Data à esquerda, entrega à direita. Isso é prova
de trabalho recorrente, que é exatamente o que segura assinatura mensal — e hoje
o assinante não tem onde ver isso.

**O uso que não vale é no site do cliente.** Clínica e restaurante não têm
produto que versiona. Changelog num site desses nasce vazio, e página vazia é
pior que página nenhuma.

---

## Como isso entra no MVP

| pilar | modelo que informa |
|---|---|
| [Site builder](../../MVP.md#pilar-2--site-builder) | landing-servico, consultoria-agencia, institucional |
| [Blog builder](../../MVP.md#pilar-3--blog-builder) | blog-magicui (padrão), noticias-blog (denso) |
| [Métricas](../../MVP.md#pilar-4--métricas-seo--geo--aeo) | changelog-magicui, como registro de entregas |

Wireframe não é tarefa. Nenhum destes vira sprint sozinho — eles são consultados
quando um item do MVP toca a tela correspondente.
