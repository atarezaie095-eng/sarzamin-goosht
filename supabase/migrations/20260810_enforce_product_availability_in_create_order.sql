-- Replace create_order in-place so the already-applied signature and execute
-- privileges remain unchanged. Product availability is checked atomically with
-- authoritative pricing; no table policies or privileges are modified here.
create or replace function public.create_order(
  p_customer_name text,
  p_phone text,
  p_address text,
  p_note text,
  p_order_items jsonb
)
returns bigint
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_order_id bigint;
  v_item jsonb;
  v_priced_item jsonb;
  v_priced_items jsonb := '[]'::jsonb;
  v_product_id bigint;
  v_quantity integer;
  v_product_price numeric;
  v_product_discount numeric;
  v_product_available boolean;
  v_effective_price numeric;
  v_total numeric := 0;
  v_seen_product_ids bigint[] := array[]::bigint[];
begin
  if p_customer_name is null
     or btrim(p_customer_name) = ''
     or char_length(btrim(p_customer_name)) > 120 then
    raise exception using errcode = '22023', message = 'Invalid customer name';
  end if;

  if p_phone is null or p_phone !~ '^09[0-9]{9}$' then
    raise exception using errcode = '22023', message = 'Invalid phone number';
  end if;

  if p_address is null
     or btrim(p_address) = ''
     or char_length(btrim(p_address)) > 1000 then
    raise exception using errcode = '22023', message = 'Invalid address';
  end if;

  if p_note is not null and char_length(btrim(p_note)) > 1000 then
    raise exception using errcode = '22023', message = 'Invalid order note';
  end if;

  if p_order_items is null
     or jsonb_typeof(p_order_items) <> 'array'
     or jsonb_array_length(p_order_items) < 1
     or jsonb_array_length(p_order_items) > 100 then
    raise exception using errcode = '22023', message = 'Invalid order items';
  end if;

  for v_item in select value from jsonb_array_elements(p_order_items)
  loop
    if jsonb_typeof(v_item) <> 'object'
       or not (v_item ? 'product_id')
       or not (v_item ? 'quantity')
       or (select count(*) from jsonb_object_keys(v_item)) <> 2
       or (v_item->>'product_id') !~ '^[1-9][0-9]{0,18}$'
       or (v_item->>'quantity') !~ '^[1-9][0-9]*$' then
      raise exception using errcode = '22023', message = 'Invalid order item';
    end if;

    v_product_id := (v_item->>'product_id')::bigint;
    v_quantity := (v_item->>'quantity')::integer;

    if v_product_id = any(v_seen_product_ids) then
      raise exception using
        errcode = '22023',
        message = format('Duplicate product_id %s is not allowed', v_product_id);
    end if;
    v_seen_product_ids := array_append(v_seen_product_ids, v_product_id);

    if v_quantity > 10000 then
      raise exception using errcode = '22023', message = 'Invalid item quantity';
    end if;

    select price, coalesce(discount, 0), available
      into v_product_price, v_product_discount, v_product_available
      from public.products
      where id = v_product_id;

    if not found then
      raise exception using
        errcode = 'P0002',
        message = format('Product %s does not exist', v_product_id);
    end if;

    if v_product_available is not true then
      raise exception using
        errcode = 'P0003',
        message = format('Product %s is out of stock', v_product_id);
    end if;

    if v_product_price is null
       or v_product_price < 0
       or v_product_discount < 0
       or v_product_discount > 100 then
      raise exception using
        errcode = '22023',
        message = format('Product %s has invalid pricing', v_product_id);
    end if;

    v_effective_price := round(
      v_product_price * (1 - v_product_discount / 100.0)
    );

    if v_effective_price < 0 or v_effective_price > 2147483647 then
      raise exception using
        errcode = '22003',
        message = format('Product %s price is out of range', v_product_id);
    end if;

    v_total := v_total + (v_effective_price * v_quantity);
    if v_total > 2147483647 then
      raise exception using errcode = '22003', message = 'Order total is out of range';
    end if;

    v_priced_item := jsonb_build_object(
      'product_id', v_product_id,
      'quantity', v_quantity,
      'price', v_effective_price::integer
    );
    v_priced_items := v_priced_items || jsonb_build_array(v_priced_item);
  end loop;

  insert into public.orders (
    customer_name, phone, address, note, total_price, status
  )
  values (
    btrim(p_customer_name),
    p_phone,
    btrim(p_address),
    nullif(btrim(p_note), ''),
    v_total::integer,
    'pending'
  )
  returning id into v_order_id;

  for v_priced_item in select value from jsonb_array_elements(v_priced_items)
  loop
    insert into public.order_items (order_id, product_id, quantity, price)
    values (
      v_order_id,
      (v_priced_item->>'product_id')::bigint,
      (v_priced_item->>'quantity')::integer,
      (v_priced_item->>'price')::integer
    );
  end loop;

  return v_order_id;
end;
$$;
