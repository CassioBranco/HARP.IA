# Pedido de acesso à Google Business Profile API

## PROTOCOLADO EM 07/08/2026

| | |
|---|---|
| **ID do caso** | `1-5531000041573` |
| **Prazo de análise informado pelo Google** | 7 a 10 dias úteis (resposta esperada entre 18/08 e 21/08/2026) |
| **Conta que abriu o pedido** | dicasdodove@gmail.com |
| **Perfil de empresa usado** | Dicas do Dove - Agência de Marketing (verificado) |
| **Projeto no Google Cloud** | nome `Ancoreo`, ID `ancoreo`, número `169630640039` |
| **APIs ativadas no projeto** | My Business Account Management · My Business Business Information · Business Profile Performance · My Business Notifications |

A resposta chega por e-mail na conta dicasdodove@gmail.com. Quando chegar, me
avise o resultado: aprovado libera o caminho A (publicação direta), negado
mantém o caminho B, que já está no ar e não depende de ninguém.

**O que foi respondido no formulário**, para o caso de precisar reabrir ou recorrer:

- *Número do projeto do Google Cloud:* 169630640039
- *Site da empresa:* https://dicasdodove.com.br
- *Como descobriu o formulário:* pela documentação oficial em developers.google.com/my-business, na página de pré-requisitos.
- *Principal motivo para buscar acesso:* gerenciar em escala os Perfis de Empresa dos clientes da plataforma — ler os dados do perfil para apontar o que falta, publicar posts aprovados pelo próprio cliente e ler as métricas de desempenho. Cada cliente autoriza o acesso ao próprio perfil por OAuth.

O restante deste documento é o material de preparação, mantido porque serve de
base se o pedido voltar negado e precisar ser refeito com mais detalhe.

---

> **Isto é o item 5.1 do MVP e o único da lista que eu não consigo fazer sozinho.**
> Precisa da conta Google do Cássio e dos dados da empresa. Eu deixei tudo o que
> vai ser digitado já escrito aqui: é copiar e colar.

## Por que agora, antes de tudo

A fila de aprovação do Google demora **semanas** e às vezes volta negada. Ela corre em
paralelo com o resto do desenvolvimento, então protocolar hoje custa 20 minutos e não
bloqueia nada. Protocolar em agosto empurra a integração pra depois do lançamento.

Enquanto a resposta não vem, o ANCOREO já funciona pelo **caminho B**: a IA escreve o
post, o cliente copia, cola no perfil dele e marca "Já publiquei". Isso está pronto.
A API é o caminho A: publicar direto, sem copiar e colar. Um substitui o outro depois,
não agora.

## O que você vai precisar em mãos

- Conta Google (pode ser a mesma do dia a dia)
- Nome da empresa e CNPJ
- Site: o domínio do ANCOREO
- Um e-mail de contato que você lê

## Passo a passo

**1. Criar o projeto no Google Cloud**
Entre no Google Cloud Console e crie um projeto novo chamado `ancoreo`.
Anote o **ID do projeto** que ele gerar (algo como `ancoreo-123456`) — o formulário pede.

**2. Ativar as APIs**
Ainda no Cloud Console, na biblioteca de APIs, ative estas quatro:

- My Business Account Management API
- My Business Business Information API
- Business Profile Performance API
- My Business Notifications API

Elas vão aparecer com cota zero. É esperado: a cota só é liberada depois da aprovação.
Ativar mesmo assim é pré-requisito do formulário.

**3. Preencher o formulário de acesso**
O link fica na página de pré-requisitos da documentação do Business Profile
(`developers.google.com/my-business/content/prereqs`). O Google muda o formulário de
tempos em tempos, então leia o que está na tela; os textos abaixo respondem ao que ele
costuma perguntar.

**4. Me avisar quando protocolar**
Só a data. Eu registro no ESTADO e paro de cobrar.

---

## Textos prontos para colar

### Descrição do uso pretendido

```
O ANCOREO é uma plataforma brasileira que cria e mantém a presença digital de
pequenas e médias empresas: site, blog e presença na busca local. Nossos clientes
são donos de negócio local (clínicas, oficinas, restaurantes, prestadores de
serviço) que não têm equipe de marketing.

Usaremos as APIs para, com autorização explícita de cada cliente via OAuth:
1. Ler as informações do Perfil de Empresa dele para checar se o cadastro está
   completo e apontar o que falta.
2. Publicar posts no perfil que o próprio cliente aprovou dentro da nossa
   plataforma.
3. Ler as métricas de desempenho do perfil para mostrar ao cliente quantas
   pessoas encontraram o negócio dele na busca e no Maps.

Cada cliente conecta o próprio perfil. Não gerenciamos perfis sem consentimento
e não criamos locais em massa.
```

### Você gerencia perfis em nome de terceiros?

```
Sim. Somos uma plataforma SaaS. Cada empresa cliente autoriza o acesso ao próprio
perfil por OAuth e pode revogar quando quiser. Não acessamos nenhum perfil sem
essa autorização.
```

### Volume esperado

```
Fase inicial: até 50 empresas nos primeiros seis meses, com previsão de crescimento
gradual. Cada empresa gera poucas chamadas por semana (leitura do perfil, publicação
de 1 a 4 posts e leitura de métricas).
```

### Como o usuário final autoriza

```
Dentro do painel do ANCOREO o cliente clica em conectar o Google Perfil de Empresa,
é levado à tela de consentimento do Google, escolhe a conta e o local, e volta ao
painel já conectado. A conexão pode ser desfeita pelo cliente a qualquer momento,
tanto no nosso painel quanto na conta Google dele.
```

---

## Se o pedido for negado

Não é o fim. O caminho B continua funcionando e o cliente não percebe diferença de
resultado: o post entra no perfil do mesmo jeito, só que pela mão dele. O que se perde
é a leitura automática das métricas do perfil, que passa a depender do cliente informar.

Motivo mais comum de negativa é descrição vaga do uso. Os textos acima são específicos
de propósito por causa disso.
