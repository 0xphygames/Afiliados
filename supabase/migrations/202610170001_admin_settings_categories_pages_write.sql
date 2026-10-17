-- Permite que os administradores gravem configurações, categorias e campanhas
-- (antes eram gravadas no Firestore). Mesmo critério de e-mail de 202610140001.

drop policy if exists "admins can upsert settings" on public.site_settings;
drop policy if exists "admins can update settings" on public.site_settings;
create policy "admins can insert settings" on public.site_settings
for insert to authenticated
with check (lower(auth.jwt() ->> 'email') in ('taper.sant@gmail.com', '0xphy.games@gmail.com'));
create policy "admins can update settings" on public.site_settings
for update to authenticated
using (lower(auth.jwt() ->> 'email') in ('taper.sant@gmail.com', '0xphy.games@gmail.com'))
with check (lower(auth.jwt() ->> 'email') in ('taper.sant@gmail.com', '0xphy.games@gmail.com'));

create policy "admins can insert categories" on public.categories
for insert to authenticated
with check (lower(auth.jwt() ->> 'email') in ('taper.sant@gmail.com', '0xphy.games@gmail.com'));
create policy "admins can update categories" on public.categories
for update to authenticated
using (lower(auth.jwt() ->> 'email') in ('taper.sant@gmail.com', '0xphy.games@gmail.com'))
with check (lower(auth.jwt() ->> 'email') in ('taper.sant@gmail.com', '0xphy.games@gmail.com'));
create policy "admins can delete categories" on public.categories
for delete to authenticated
using (lower(auth.jwt() ->> 'email') in ('taper.sant@gmail.com', '0xphy.games@gmail.com'));

create policy "admins can insert landing pages" on public.landing_pages
for insert to authenticated
with check (lower(auth.jwt() ->> 'email') in ('taper.sant@gmail.com', '0xphy.games@gmail.com'));
create policy "admins can update landing pages" on public.landing_pages
for update to authenticated
using (lower(auth.jwt() ->> 'email') in ('taper.sant@gmail.com', '0xphy.games@gmail.com'))
with check (lower(auth.jwt() ->> 'email') in ('taper.sant@gmail.com', '0xphy.games@gmail.com'));
create policy "admins can delete landing pages" on public.landing_pages
for delete to authenticated
using (lower(auth.jwt() ->> 'email') in ('taper.sant@gmail.com', '0xphy.games@gmail.com'));
