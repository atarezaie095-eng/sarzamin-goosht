-- The storefront uses the public anon key, so product catalogue rows must be
-- readable by the anon role. RLS remains enabled and only SELECT is allowed.
grant usage on schema public to anon, authenticated;
grant select on table public.products to anon, authenticated;

alter table public.products enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'products'
      and policyname = 'Public can read products'
  ) then
    create policy "Public can read products"
      on public.products
      for select
      to anon, authenticated
      using (true);
  end if;
end
$$;
