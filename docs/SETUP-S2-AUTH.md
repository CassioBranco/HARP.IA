# S2 — Login e cadastro (Supabase Auth)

## O que o app faz

- **Cadastro** (`/signup`) — cria usuário no Supabase Auth + tenant + linha em `users` (owner)
- **Login** (`/login`) — sessão por cookie; área logada protegida
- **Sair** — botão no painel (sidebar)
- **Esqueci senha** (`/reset`) — email com link; nova senha em `/reset/update`

## Configurar no Supabase (painel)

1. **Authentication → URL Configuration**
   - **Site URL:** `http://localhost:3000` (dev) ou URL da Vercel (prod)
   - **Redirect URLs:** adicione:
     - `http://localhost:3000/auth/callback`
     - `https://SEU_DOMINIO.vercel.app/auth/callback` (quando tiver deploy)

2. **Authentication → Providers → Email**
   - Email ligado (já feito no S1)
   - **Confirm email:** se estiver ON, após cadastro o usuário precisa clicar no email antes de entrar. Se OFF, entra direto após criar conta.

3. **Authentication → Email templates** (opcional)
   - Personalizar textos de confirmação e reset

## Testar localmente

```bash
npm run dev
```

1. Abra http://localhost:3000/signup — crie conta de teste
2. Se pedir confirmação de email, confira a caixa de entrada (ou desligue confirmação no Supabase para teste rápido)
3. http://localhost:3000/login — entre
4. http://localhost:3000/sites — deve abrir o painel
5. Abra http://localhost:3000/sites em aba anônima sem login — deve redirecionar para `/login`

## Variáveis

`.env.local` precisa das 3 chaves (inclui `SUPABASE_SERVICE_ROLE_KEY` para criar tenant no primeiro login).
