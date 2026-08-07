# RITUAL — como este projeto funciona

Você toca vários projetos ao mesmo tempo. O custo disso não é o trabalho, é a
**religada**: toda vez que você volta ao ANCOREO depois de uma semana no Dove ou
no SUORT, alguém precisa reconstruir o contexto. Hoje quem paga esse pedágio é
você, de cabeça, e eu, lendo 40 documentos que discordam entre si.

Este arquivo é o combinado pra ninguém mais pagar.

---

## Os três arquivos

Só três. O resto é histórico.

| arquivo | quem escreve | responde |
|---|---|---|
| **ESTADO.md** | `node scripts/estado.mjs` | onde estamos, de verdade |
| **MVP.md** | nós dois, quando o escopo muda | onde queremos chegar |
| **RITUAL.md** | quase nunca | como andamos |

**ESTADO.md não se edita à mão.** Ele é gerado de git, do banco de produção e de
sondas que rodam grep no código. Uma sonda só diz "ligado" se achar quem chama a
função — módulo escrito e sem chamador conta como não ligado.

Foi assim que descobrimos, em 07/08, que a loja estava documentada como pronta
com o botão de comprar `disabled` no código.

### Regra de ouro

> **Verifique o código e o banco. Nunca a prosa.**

Se ESTADO.md e qualquer outro documento discordarem, ESTADO.md ganha. Se
ESTADO.md estiver errado, o erro está no script ou no código — conserta lá.

---

## Início de sessão

O hook `.claude/hooks/session-start.sh` roda sozinho e me joga o ESTADO.md na
cara. Não preciso perguntar "onde paramos".

Se algum dia ele falhar, o comando é:

```bash
node scripts/estado.mjs && cat ESTADO.md
```

Nas primeiras palavras de toda sessão eu digo: em que sprint estamos, quantas
sondas estão vermelhas, e qual é o próximo item do MVP. Se eu começar a
trabalhar sem isso, me corrija.

---

## Ciclo da semana

| dia | o quê |
|---|---|
| **segunda** | gero ESTADO.md, escolho os itens do sprint, te mostro em 5 linhas |
| **terça a quinta** | eu construo o back; você constrói o front |
| **sexta** | **sessão de teste** (abaixo). Sprint sem sessão passada não fechou. |

Sprint é de uma semana porque duas semanas escondem problema.

---

## Sessões de teste

Uma sessão de teste é você, sentado, usando o produto como um cliente usaria,
com um roteiro na mão e eu anotando. Não é você olhando código.

Os roteiros vivem em [`docs/testes/`](docs/testes/). Um por pilar:

| | roteiro | pergunta que responde |
|---|---|---|
| T1 | onboarding ao site no ar | uma pessoa de fora chega ao site publicado sozinha? |
| T2 | editar e republicar | o cliente muda o texto sem quebrar nada? |
| T3 | escrever e publicar post | sai um post real sem ninguém tocar em código? |
| T4 | ler as métricas | o número na tela é medição ou chute? |
| T5 | post no Google Perfil | o post sai no perfil de verdade? |

Como funciona:

1. Você segue o roteiro **sem eu explicar nada**. Se travar, é achado, não erro seu.
2. Eu anoto cada travada com o horário e a tela.
3. Toda travada vira tarefa antes de qualquer feature nova.
4. Roteiro só passa quando você faz **do começo ao fim sem me perguntar**.

Um roteiro nunca "passa com ressalva". Passou ou não passou.

---

## Portões humanos

Os cinco portões estão no [MVP.md](MVP.md#portões-que-exigem-você). Resumindo o
princípio: você não é o aprovador de commits — você é o julgamento sobre
**texto que vai pro cliente**, **qualidade do que a IA escreveu** e **número
novo na tela**.

Trava de commit/push/deploy você removeu e não volta. Eu executo e reporto
depois.

---

## Quando eu errar

Aconteceu duas vezes em 07/08: reportei a loja como pronta lendo documentação em
vez de código, e a primeira versão do gerador jurou que a integração com o
Google existia porque casou com `fonts.googleapis.com`.

O padrão é o mesmo nos dois: **eu li um sinal fraco e afirmei forte.**

O combinado:

- Afirmação sobre o que está pronto vem com a evidência colada — arquivo, linha, contagem do banco.
- Sonda que quebra aparece como `SONDA QUEBRADA` no ESTADO.md, nunca como verde.
- Quando eu não sei, eu escrevo que não sei.

---

## Trabalhando em vários projetos

Cada projeto tem sua própria pasta e sua própria memória. Eles não se misturam.

| projeto | onde | memória |
|---|---|---|
| **ANCOREO** | `Documents\ancoreo` | própria, no projeto |
| **Blog Dove e clientes** | `Desktop\Marketing GERAL\claude` | o "porão", `MEMORY.md` |
| **SUORT** | pasta do site | contexto em `dove-clients\` |

Ao abrir o Claude, abra **na pasta do projeto**. Abrir na pasta errada é a causa
número um de eu responder com contexto de outro cliente.

Se você me perguntar sobre ANCOREO de dentro do porão, eu vou saber que ele
existe (está no `MEMORY.md`), mas não vou ter ESTADO.md, sondas, nem os
roteiros. Vou te mandar abrir aqui.
