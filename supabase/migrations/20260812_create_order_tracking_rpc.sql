-- Anonymous order tracking is limited to an exact order ID + phone match and
-- returns no customer profile or item data.
create or replace function public.get_order_status(
  p_order_id bigint,
  p_phone text
)
returns table (
  order_id bigint,
  status text,
  total_price integer,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select
    orders.id as order_id,
    orders.status,
    orders.total_price,
    orders.created_at
  from public.orders
  where p_order_id > 0
    and p_phone ~ '^09[0-9]{9}$'
    and orders.id = p_order_id
    and orders.phone = p_phone
    and orders.status in (
      'pending',
      'confirmed',
      'preparing',
      'shipped',
      'completed',
      'cancelled'
    )
  limit 1;
$$;

revoke all on function public.get_order_status(bigint, text)
  from public, anon, authenticated;
grant execute on function public.get_order_status(bigint, text)
  to anon;
