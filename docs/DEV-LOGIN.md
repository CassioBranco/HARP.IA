# Atalho `/dev-login` — modo de teste local (sem senha)

Existe pra **testar o editor sem refazer o processo do cliente** (login + onboarding)
toda vez. Loga um usuário de teste direto, sem senha.

## Como usar

1. Sobe o dev server:

   ```bash
   cd "C:/Users/cassio/Documents/ancoreo" && npm run dev
   ```

2. Abre no navegador:

   - `http://localhost:3000/dev-login` → loga e vai pra `/sites`
   - `http://localhost:3000/dev-login?next=/editor/<siteId>` → cai direto no editor do site
   - `http://localhost:3000/dev-login?email=<outro-email>` → loga outra conta de teste

   Exemplo (site Anteteguemon):
   `http://localhost:3000/dev-login?next=/editor/103e98bc-f3d6-4ba7-b12b-c9b2143d7789`

## Como funciona

- Rota: `app/dev-login/route.ts`.
- O service role gera um magic link (`auth.admin.generateLink`, não envia e-mail),
  e o server client valida o token (`verifyOtp`) — isso cria a sessão e grava os
  cookies. Sem senha, sem e-mail.
- E-mail padrão: variável `DEV_LOGIN_EMAIL` no `.env.local`. Pode sobrescrever com `?email=`.

## Trava de segurança

- A rota responde **404 fora de `NODE_ENV=development`**. No build de produção
  (Vercel) ela não existe pro mundo — nunca cria sessão em prod.
- Depende do `SUPABASE_SERVICE_ROLE_KEY` (já usado pelo `createAdminClient`), que só
  existe no ambiente local/servidor.

## Nota de ambiente

Se `DEV_LOGIN_EMAIL` for adicionado/alterado no `.env.local`, **reinicie o dev server**
pra ele ler o valor novo.
