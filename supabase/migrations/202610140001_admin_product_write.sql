drop policy if exists "admins can insert products" on public.products;
drop policy if exists "admins can update products" on public.products;
drop policy if exists "admins can delete products" on public.products;

create policy "admins can insert products" on public.products
for insert to authenticated
with check (lower(auth.jwt() ->> 'email') in ('taper.sant@gmail.com', '0xphy.games@gmail.com'));

create policy "admins can update products" on public.products
for update to authenticated
using (lower(auth.jwt() ->> 'email') in ('taper.sant@gmail.com', '0xphy.games@gmail.com'))
with check (lower(auth.jwt() ->> 'email') in ('taper.sant@gmail.com', '0xphy.games@gmail.com'));

create policy "admins can delete products" on public.products
for delete to authenticated
using (lower(auth.jwt() ->> 'email') in ('taper.sant@gmail.com', '0xphy.games@gmail.com'));
