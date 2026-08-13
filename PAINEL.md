# PAINEL — em que passo estamos

> **ARQUIVO GERADO. Não edite à mão.** Rode `node scripts/planilha.mjs`.
> Para abrir no Excel: **PAINEL.csv**, na mesma pasta.
> Última geração: **2026-08-13**

`█████████░░░░░░░░░░░` **46%** — 12 de 26 itens do MVP prontos
**19 dias** para o lançamento (01/09)
**3 itens dependem de você** para destravar

A coluna **como sabemos** é o que separa esta planilha de uma lista de desejos.
_Verificado no código_ quer dizer que um teste automático achou a coisa
funcionando de verdade. _Plano_ quer dizer que combinamos fazer, e só.

## Onboarding — 1/2

| nº | o que é | situação | como sabemos | quando |
|---:|---|---|---|---|
| 1 | Fluxo de onboarding existe e grava perfil | PRONTO | verificado no código | feito |
| 27 | Descobrir por que 8 sites são gerados e só 1 é publicado | falta | plano | S3 · 24 a 31/08 |

## Site builder — 2/7

| nº | o que é | situação | como sabemos | quando |
|---:|---|---|---|---|
| 2 | Geração de site por IA está ligada ao onboarding | PRONTO | verificado no código | feito |
| 3 | Publicação de site tem rota e chamador | PRONTO | verificado no código | feito |
| 22 | Tela de domínio próprio no painel (hoje o cliente não tem onde apontar o DNS) | falta | plano | S2 · 16 a 23/08 |
| 23 | Bloco de resposta direta abaixo do título: o trecho que a IA copia ao citar | falta | plano | S2 · 16 a 23/08 |
| 24 | Content-Signal: separar "pode me citar" de "pode me usar pra treinar" | falta | plano | S3 · 24 a 31/08 |
| 25 | Site lento não publica (trava acima de 2,5 segundos) | falta | plano | S3 · 24 a 31/08 |
| 26 | Avisar quando uma página fica a mais de 3 cliques da home | falta | plano | S3 · 24 a 31/08 |

## Blog builder — 1/2

| nº | o que é | situação | como sabemos | quando |
|---:|---|---|---|---|
| 4 | Editor de post chama a rota de publicação de blog | PRONTO | verificado no código | feito |
| 28 | Publicar 5 posts de verdade e conferir os links entre eles | falta | plano | S3 · 24 a 31/08 |

## Métricas de SEO, GEO e AEO — 2/5

| nº | o que é | situação | como sabemos | quando |
|---:|---|---|---|---|
| 5 | Painel lê score real da API (não hardcoded) | PRONTO | verificado no código | feito |
| 6 | Score é persistido em histórico (score_snapshots) | PRONTO | verificado no código | feito |
| 7 | AEO usa medição real (hoje: amostra sintética) | falta | verificado no código | S2 · 16 a 23/08 |
| 20 | Contar visitas de robô de IA no site do cliente (medição real, custo zero) | falta | plano | S2 · 16 a 23/08 |
| 21 | Posição real das palavras-chave, puxada do Search Console | falta | plano | S2 · 16 a 23/08 |

## Google Perfil — 6/10

| nº | o que é | situação | como sabemos | quando |
|---:|---|---|---|---|
| 8 | Existe integração com a API do Google (OAuth + publicação) | falta | verificado no código | esperando o Google liberar |
| 9 | Rascunho de post do Google é gerado por IA | PRONTO | verificado no código | feito |
| 10 | Cliente registra que publicou no perfil (published_at é escrito) | PRONTO | verificado no código | feito |
| 11 | Calendário do mês: posts saem com data marcada | PRONTO | verificado no código | feito |
| 12 | Link do Perfil é lido, guardado com place_id e vinculável no painel | PRONTO | verificado no código | feito |
| 13 | Lembrete semanal do post sai sozinho (rota + agendamento) | PRONTO | verificado no código | feito |
| 14 | Ponte blog ↔ Perfil: artigo publicado vira post, post vira pauta | PRONTO | verificado no código | feito |
| 17 | Você criar a senha do robô semanal no Vercel (CRON_SECRET) | **ESPERANDO VOCÊ** | plano | agora |
| 18 | Você confirmar se a chave de e-mail (RESEND) já está no Vercel | **ESPERANDO VOCÊ** | plano | agora |
| 19 | Sessão de teste T5: publicar um post no seu Perfil de verdade, 20 min | **ESPERANDO VOCÊ** | plano | agora |

## Fora do MVP — 0/3

| nº | o que é | situação | como sabemos | quando |
|---:|---|---|---|---|
| 15 | Loja: botão de compra ligado ao checkout | falta | verificado no código | depois do lançamento |
| 16 | Loja: painel de produtos existe | falta | verificado no código | depois do lançamento |
| 29 | Cobrança da assinatura (o beta é grátis, então não corre) | fora do MVP | plano | depois do lançamento |

---

Detalhe técnico do que está ligado: [ESTADO.md](ESTADO.md) ·
O que mudou e quando: [DIARIO.md](DIARIO.md) ·
Definição de pronto: [MVP.md](MVP.md)
