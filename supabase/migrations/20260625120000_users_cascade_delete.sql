-- Corrige "Database error deleting user" no Supabase Auth.
-- A FK public.users.id -> auth.users(id) estava com ON DELETE NO ACTION:
-- ao apagar um usuário do Auth, a linha em public.users segurava a exclusão.
-- Passa pra ON DELETE CASCADE: apagar o usuário do Auth remove junto a linha
-- em public.users (que por sua vez não derruba o tenant — relação é tenant->user).

alter table public.users drop constraint users_id_fkey;

alter table public.users
  add constraint users_id_fkey
  foreign key (id) references auth.users(id) on delete cascade;
