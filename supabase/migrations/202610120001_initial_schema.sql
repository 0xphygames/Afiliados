create extension if not exists pgcrypto;

create table if not exists public.products (
  id text primary key,
  title text not null,
  platform text not null,
  category text not null,
  image_url text not null,
  images jsonb not null default '[]'::jsonb,
  affiliate_url text not null,
  price numeric not null default 0,
  original_price numeric,
  rating numeric default 5,
  review_count integer default 1,
  badge text,
  tamires_tip text,
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.articles (
  id text primary key,
  title text not null,
  category text not null,
  summary text not null,
  content text not null,
  cover_image_url text,
  author text not null default 'Tamires Santos',
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.coupons (
  id text primary key,
  code text not null,
  title text not null,
  discount text not null,
  platform text not null,
  description text not null,
  min_spend text,
  expiration_date text,
  affiliate_url text not null,
  is_verified boolean not null default true,
  category text default 'Geral',
  created_at timestamptz not null default now()
);

create table if not exists public.landing_pages (
  id text primary key,
  title text not null,
  slug text not null unique,
  headline text not null,
  subheading text not null,
  platform text,
  category text,
  badge text,
  banner_image_url text,
  is_active boolean not null default true,
  content jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  id text primary key default 'main',
  hero_headline text not null,
  hero_subheading text not null,
  top_banner_notice text not null,
  whatsapp_url text not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id text primary key,
  name text not null,
  platform text not null default 'all',
  icon text not null default 'Tag',
  color text,
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;
alter table public.articles enable row level security;
alter table public.coupons enable row level security;
alter table public.landing_pages enable row level security;
alter table public.site_settings enable row level security;
alter table public.categories enable row level security;

create policy "public can read products" on public.products for select to anon, authenticated using (true);
create policy "public can read articles" on public.articles for select to anon, authenticated using (true);
create policy "public can read coupons" on public.coupons for select to anon, authenticated using (true);
create policy "public can read active landing pages" on public.landing_pages for select to anon, authenticated using (is_active = true or auth.jwt() ->> 'email' in ('taper.sant@gmail.com', '0xphy.games@gmail.com'));
create policy "public can read settings" on public.site_settings for select to anon, authenticated using (true);
create policy "public can read categories" on public.categories for select to anon, authenticated using (true);

insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do update set public = true;

drop policy if exists "public can read images" on storage.objects;
drop policy if exists "admins can upload images" on storage.objects;
drop policy if exists "admins can update images" on storage.objects;
drop policy if exists "admins can delete images" on storage.objects;

create policy "public can read images" on storage.objects
for select to anon, authenticated using (bucket_id = 'images');

create policy "admins can upload images" on storage.objects
for insert to authenticated
with check (bucket_id = 'images' and lower(auth.jwt() ->> 'email') in ('taper.sant@gmail.com', '0xphy.games@gmail.com'));

create policy "admins can update images" on storage.objects
for update to authenticated
using (bucket_id = 'images' and lower(auth.jwt() ->> 'email') in ('taper.sant@gmail.com', '0xphy.games@gmail.com'))
with check (bucket_id = 'images' and lower(auth.jwt() ->> 'email') in ('taper.sant@gmail.com', '0xphy.games@gmail.com'));

create policy "admins can delete images" on storage.objects
for delete to authenticated
using (bucket_id = 'images' and lower(auth.jwt() ->> 'email') in ('taper.sant@gmail.com', '0xphy.games@gmail.com'));
