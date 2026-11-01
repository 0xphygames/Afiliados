-- Reaplica as políticas do blog e do bucket de imagens de forma idempotente.
-- Isso corrige ambientes em que a migração original não foi executada.

drop policy if exists "admins can insert articles" on public.articles;
drop policy if exists "admins can update articles" on public.articles;
drop policy if exists "admins can delete articles" on public.articles;

create policy "admins can insert articles" on public.articles
for insert to authenticated
with check (lower(coalesce(auth.jwt() ->> 'email', '')) in ('taper.sant@gmail.com', '0xphy.games@gmail.com'));

create policy "admins can update articles" on public.articles
for update to authenticated
using (lower(coalesce(auth.jwt() ->> 'email', '')) in ('taper.sant@gmail.com', '0xphy.games@gmail.com'))
with check (lower(coalesce(auth.jwt() ->> 'email', '')) in ('taper.sant@gmail.com', '0xphy.games@gmail.com'));

create policy "admins can delete articles" on public.articles
for delete to authenticated
using (lower(coalesce(auth.jwt() ->> 'email', '')) in ('taper.sant@gmail.com', '0xphy.games@gmail.com'));

insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do update set public = true;

drop policy if exists "admins can upload images" on storage.objects;
drop policy if exists "admins can update images" on storage.objects;
drop policy if exists "admins can delete images" on storage.objects;

create policy "admins can upload images" on storage.objects
for insert to authenticated
with check (bucket_id = 'images' and lower(coalesce(auth.jwt() ->> 'email', '')) in ('taper.sant@gmail.com', '0xphy.games@gmail.com'));

create policy "admins can update images" on storage.objects
for update to authenticated
using (bucket_id = 'images' and lower(coalesce(auth.jwt() ->> 'email', '')) in ('taper.sant@gmail.com', '0xphy.games@gmail.com'))
with check (bucket_id = 'images' and lower(coalesce(auth.jwt() ->> 'email', '')) in ('taper.sant@gmail.com', '0xphy.games@gmail.com'));

create policy "admins can delete images" on storage.objects
for delete to authenticated
using (bucket_id = 'images' and lower(coalesce(auth.jwt() ->> 'email', '')) in ('taper.sant@gmail.com', '0xphy.games@gmail.com'));
