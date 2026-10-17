-- Páginas criadas pelo admin (com subpáginas). Leitura pública só das ativas;
-- escrita só para os administradores (mesmo critério de e-mail das outras migrações).

create table if not exists public.site_pages (
  id text primary key,
  slug text not null unique,
  title text not null,
  body text not null default '',
  parent_id text references public.site_pages(id) on delete cascade,
  show_in_menu boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.site_pages enable row level security;

create policy "public can read active site pages" on public.site_pages
for select to anon, authenticated
using (is_active = true or lower(auth.jwt() ->> 'email') in ('taper.sant@gmail.com', '0xphy.games@gmail.com'));

create policy "admins can insert site pages" on public.site_pages
for insert to authenticated
with check (lower(auth.jwt() ->> 'email') in ('taper.sant@gmail.com', '0xphy.games@gmail.com'));

create policy "admins can update site pages" on public.site_pages
for update to authenticated
using (lower(auth.jwt() ->> 'email') in ('taper.sant@gmail.com', '0xphy.games@gmail.com'))
with check (lower(auth.jwt() ->> 'email') in ('taper.sant@gmail.com', '0xphy.games@gmail.com'));

create policy "admins can delete site pages" on public.site_pages
for delete to authenticated
using (lower(auth.jwt() ->> 'email') in ('taper.sant@gmail.com', '0xphy.games@gmail.com'));
