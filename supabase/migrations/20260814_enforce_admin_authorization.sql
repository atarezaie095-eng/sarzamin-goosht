-- Replace broad authenticated access with the Stage 12B administrator
-- boundary. Public product reads and anonymous RPC behavior are unchanged.

drop policy if exists "Authenticated users can insert products"
  on public.products;
drop policy if exists "Authenticated users"
  on public.products;
drop policy if exists "Authenticated users can update products"
  on public.products;

create policy "Admins can insert products"
  on public.products
  for insert
  to authenticated
  with check (public.is_admin());

create policy "Admins can update products"
  on public.products
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Authenticated users can view orders"
  on public.orders;
drop policy if exists "Authenticated users can update order status"
  on public.orders;

create policy "Admins can view orders"
  on public.orders
  for select
  to authenticated
  using (public.is_admin());

create policy "Admins can update order status"
  on public.orders
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Authenticated users can view order items"
  on public.order_items;

create policy "Admins can view order items"
  on public.order_items
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Authenticated users can upload product images"
  on storage.objects;

create policy "Admins can upload product images"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'products'
    and (storage.foldername(name))[1] = 'catalog'
    and public.is_admin()
  );

-- Keep only the direct table privileges required by public browsing and the
-- administrator workflows. RLS remains the row-level authorization boundary.
revoke insert, update, delete on table public.products from anon;
revoke insert, update, delete on table storage.objects from anon;

revoke delete on table public.products from authenticated;
revoke insert, delete on table public.orders from authenticated;
revoke insert, update, delete on table public.order_items from authenticated;
revoke delete on table storage.objects from authenticated;
