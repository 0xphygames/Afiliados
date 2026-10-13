create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  display_name text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.permissions (
  id text primary key,
  description text not null
);

create table if not exists public.admin_user_permissions (
  admin_user_id uuid not null references public.admin_users(id) on delete cascade,
  permission_id text not null references public.permissions(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (admin_user_id, permission_id)
);

alter table public.admin_users enable row level security;
alter table public.permissions enable row level security;
alter table public.admin_user_permissions enable row level security;

drop policy if exists "admins can read own admin record" on public.admin_users;
create policy "admins can read own admin record"
on public.admin_users for select
to authenticated
using (lower(email) = lower(auth.jwt() ->> 'email') and is_active = true);

drop policy if exists "admins can read permissions" on public.permissions;
create policy "admins can read permissions"
on public.permissions for select
to authenticated
using (exists (
  select 1 from public.admin_users au
  where lower(au.email) = lower(auth.jwt() ->> 'email')
    and au.is_active = true
));

drop policy if exists "admins can read own permission links" on public.admin_user_permissions;
create policy "admins can read own permission links"
on public.admin_user_permissions for select
to authenticated
using (exists (
  select 1
  from public.admin_users au
  where au.id = admin_user_id
    and lower(au.email) = lower(auth.jwt() ->> 'email')
    and au.is_active = true
));

insert into public.admin_users (email, display_name)
values
  ('taper.sant@gmail.com', 'Tamires Santos'),
  ('0xphy.games@gmail.com', '0xphy Games')
on conflict (email) do update set is_active = true;

insert into public.permissions (id, description)
values
  ('products.read', 'Visualizar produtos'),
  ('products.write', 'Criar e editar produtos'),
  ('products.delete', 'Excluir produtos'),
  ('articles.write', 'Criar e editar artigos'),
  ('pages.write', 'Criar e editar páginas'),
  ('settings.write', 'Editar configurações do site'),
  ('media.write', 'Enviar e excluir imagens')
on conflict (id) do update set description = excluded.description;

insert into public.admin_user_permissions (admin_user_id, permission_id)
select au.id, p.id
from public.admin_users au
cross join public.permissions p
where lower(au.email) in ('taper.sant@gmail.com', '0xphy.games@gmail.com')
on conflict do nothing;
