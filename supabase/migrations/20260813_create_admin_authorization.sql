-- Establish a server-controlled administrator registry. Administrator
-- membership is managed only through a trusted database/operator process.
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

-- No client-facing policies are created. Direct access remains unavailable to
-- both anonymous and authenticated API roles.
revoke all on table public.admin_users from public, anon, authenticated;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select auth.uid() is not null
    and exists (
      select 1
      from public.admin_users
      where user_id = auth.uid()
    );
$$;

revoke all on function public.is_admin() from public, anon, authenticated;
grant execute on function public.is_admin() to authenticated;

