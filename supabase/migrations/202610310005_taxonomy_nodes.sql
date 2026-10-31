-- Árvore de classificação editável pelo painel (macro e micro).
-- Leitura pública; escrita só para os administradores (mesmo critério de e-mail das outras migrações).

create table if not exists public.taxonomy_nodes (
  id text primary key,
  kind text not null check (kind in ('macro', 'micro')),
  name text not null,
  parent_id text references public.taxonomy_nodes(id) on delete restrict,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  constraint micro_has_parent check ((kind = 'macro' and parent_id is null) or (kind = 'micro' and parent_id is not null))
);

alter table public.taxonomy_nodes enable row level security;

create policy "public can read taxonomy" on public.taxonomy_nodes
for select to anon, authenticated using (true);

create policy "admins can insert taxonomy" on public.taxonomy_nodes
for insert to authenticated
with check (lower(auth.jwt() ->> 'email') in ('taper.sant@gmail.com', '0xphy.games@gmail.com'));

create policy "admins can update taxonomy" on public.taxonomy_nodes
for update to authenticated
using (lower(auth.jwt() ->> 'email') in ('taper.sant@gmail.com', '0xphy.games@gmail.com'))
with check (lower(auth.jwt() ->> 'email') in ('taper.sant@gmail.com', '0xphy.games@gmail.com'));

create policy "admins can delete taxonomy" on public.taxonomy_nodes
for delete to authenticated
using (lower(auth.jwt() ->> 'email') in ('taper.sant@gmail.com', '0xphy.games@gmail.com'));

-- Seed: a árvore atual (idempotente)
insert into public.taxonomy_nodes (id, kind, name, parent_id, position) values
  ('m-moda', 'macro', 'Moda Fitness', null, 1),
  ('m-supl', 'macro', 'Suplementos', null, 2),
  ('m-equip', 'macro', 'Equipamentos', null, 3),
  ('m-acess', 'macro', 'Acessórios', null, 4)
on conflict (id) do nothing;

insert into public.taxonomy_nodes (id, kind, name, parent_id, position) values
  ('mi-calca-comum', 'micro', 'Calça comum', 'm-moda', 1),
  ('mi-calca-legging', 'micro', 'Calça legging', 'm-moda', 2),
  ('mi-top', 'micro', 'Top', 'm-moda', 3),
  ('mi-camisetas-blusas', 'micro', 'Camisetas e Blusas', 'm-moda', 4),
  ('mi-agasalhos', 'micro', 'Agasalhos', 'm-moda', 5),
  ('mi-macacao', 'micro', 'Macacão', 'm-moda', 6),
  ('mi-conjunto', 'micro', 'Conjunto', 'm-moda', 7),
  ('mi-moletom', 'micro', 'Moletom', 'm-moda', 8),
  ('mi-short', 'micro', 'Short', 'm-moda', 9),
  ('mi-whey', 'micro', 'Whey Protein', 'm-supl', 1),
  ('mi-barra', 'micro', 'Barra de Proteína', 'm-supl', 2),
  ('mi-hipercal', 'micro', 'Hipercalórico', 'm-supl', 3),
  ('mi-vitaminas', 'micro', 'Vitaminas', 'm-supl', 4),
  ('mi-creatina', 'micro', 'Creatina', 'm-supl', 5),
  ('mi-colageno', 'micro', 'Colágeno', 'm-supl', 6),
  ('mi-aminoacidos', 'micro', 'Aminoácidos', 'm-supl', 7),
  ('mi-pre-treino', 'micro', 'Pré-treino', 'm-supl', 8),
  ('mi-super-coffee', 'micro', 'Super Coffee', 'm-supl', 9),
  ('mi-bebidas', 'micro', 'Bebidas proteicas', 'm-supl', 10),
  ('mi-outros', 'micro', 'Outros', 'm-supl', 11),
  ('mi-musculacao', 'micro', 'Musculação', 'm-equip', 1),
  ('mi-cardio', 'micro', 'Cardio', 'm-equip', 2),
  ('mi-kits', 'micro', 'Kits', 'm-equip', 3),
  ('mi-step', 'micro', 'Step', 'm-equip', 4),
  ('mi-colchonete', 'micro', 'Colchonete', 'm-equip', 5),
  ('mi-acessorios-equip', 'micro', 'Acessórios de equipamento', 'm-equip', 6),
  ('mi-coqueteleiras', 'micro', 'Coqueteleiras', 'm-acess', 1),
  ('mi-chapeus', 'micro', 'Chapéus', 'm-acess', 2),
  ('mi-eletronicos', 'micro', 'Eletrônicos', 'm-acess', 3)
on conflict (id) do nothing;
