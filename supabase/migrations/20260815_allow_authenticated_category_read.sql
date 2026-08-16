-- Categories remain publicly readable, including from authenticated admin
-- sessions. No category mutation access is introduced.
alter policy "Allow public read categories"
  on public.categories
  to anon, authenticated
  using (true);
