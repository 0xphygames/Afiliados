-- Itens dos menus: o menu público (barra superior) e o menu do painel admin.
-- Leitura pública; escrita só para os administradores (mesmo critério de e-mail das outras migrações).

create table if not exists public.site_menu_items (
  id text primary key,
  area text not null check (area in ('public', 'admin')),
  label text not null,
  href text not null,
  icon text not null default 'Tag',
  color_class text not null default 'text-stone-500',
  exact boolean not null default false,
  position integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.site_menu_items enable row level security;

create policy "public can read menu items" on public.site_menu_items
for select to anon, authenticated using (true);

create policy "admins can insert menu items" on public.site_menu_items
for insert to authenticated
with check (lower(auth.jwt() ->> 'email') in ('taper.sant@gmail.com', '0xphy.games@gmail.com'));

create policy "admins can update menu items" on public.site_menu_items
for update to authenticated
using (lower(auth.jwt() ->> 'email') in ('taper.sant@gmail.com', '0xphy.games@gmail.com'))
with check (lower(auth.jwt() ->> 'email') in ('taper.sant@gmail.com', '0xphy.games@gmail.com'));

create policy "admins can delete menu items" on public.site_menu_items
for delete to authenticated
using (lower(auth.jwt() ->> 'email') in ('taper.sant@gmail.com', '0xphy.games@gmail.com'));

-- Itens iniciais: os mesmos que estavam fixos no código
insert into public.site_menu_items (id, area, label, href, icon, color_class, exact, position) values
  ('pub-home', 'public', 'Home', '/', 'Home', 'text-stone-500', true, 1),
  ('pub-achadinhos', 'public', 'Achadinhos', '/achadinhos', 'ShoppingBag', 'text-[#EE4D2D]', false, 2),
  ('pub-blog', 'public', 'Blog', '/blog', 'BookOpen', 'text-amber-600', false, 3),
  ('pub-cupons', 'public', 'Cupons', '/cupons', 'Tag', 'text-emerald-600', false, 4),
  ('pub-campanhas', 'public', 'Campanhas', '/campanha', 'Flame', 'text-rose-500', false, 5),
  ('adm-visao', 'admin', 'Visão Geral', '/painel', 'LayoutDashboard', 'text-stone-500', true, 1),
  ('adm-produtos', 'admin', 'Achadinhos & Produtos', '/painel/produtos', 'ShoppingBag', 'text-stone-500', false, 2),
  ('adm-novo', 'admin', 'Novo Achadinho', '/painel/produtos/novo', 'PlusCircle', 'text-stone-500', false, 3),
  ('adm-categorias', 'admin', 'Categorias & Setores', '/painel/categorias', 'Tag', 'text-stone-500', false, 4),
  ('adm-campanhas', 'admin', 'Páginas & Campanhas', '/painel/campanhas', 'Layers', 'text-stone-500', false, 5),
  ('adm-cupons', 'admin', 'Cupons', '/painel/cupons', 'Tag', 'text-stone-500', false, 6),
  ('adm-paginas', 'admin', 'Páginas do Site', '/painel/paginas', 'FileText', 'text-stone-500', false, 7),
  ('adm-blog', 'admin', 'Blog & Posts', '/painel/artigos', 'BookOpen', 'text-stone-500', false, 8),
  ('adm-config', 'admin', 'Textos & Configurações', '/painel/configuracoes', 'Settings', 'text-stone-500', false, 9),
  ('adm-menu', 'admin', 'Menu & Rotas', '/painel/menu', 'Layers', 'text-stone-500', false, 10)
on conflict (id) do nothing;
