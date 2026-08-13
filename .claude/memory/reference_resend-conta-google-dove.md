---
name: reference_resend-conta-google-dove
description: A conta do Resend do ANCOREO é a conta Google do Dove (login com Google), não e-mail/senha próprios
metadata:
  type: reference
---

O Resend do ANCOREO está registrado com a **conta do Google do Dove** (login "Sign in with Google"), informado pelo Cássio em 2026-08-13. Não existe usuário/senha separado do Resend — quem entra em `resend.com` entra pelo botão do Google com essa conta.

**Why:** quando a `RESEND_API_KEY` precisar ser criada, revogada ou trocada, saber por onde se entra evita a sessão inteira de "em qual conta está isso". Em 13/08 a chave ainda não existia no Vercel (o projeto tinha só as 4 do Supabase/Anthropic), e o módulo de e-mail é dormente por decisão de projeto: sem a chave, ele não quebra, só não envia.

**How to apply:** para pegar a chave, o Cássio abre `resend.com` no Chrome "Cassio Trabalho", entra com Google (conta do Dove), vai em **API Keys → Create**, e cola o valor em Vercel → ancoreo → Settings → Environment Variables → Production, com o nome `RESEND_API_KEY`. Eu nunca leio, gero nem guardo o valor — só confirmo se o nome existe. Endereço exato da conta ainda não confirmado por ele; não chutar.
