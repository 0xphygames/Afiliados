-- Reclassifica produtos e artigos para a taxonomia pública aprovada.
-- Idempotente: pode ser executada novamente sem duplicar dados.

-- Normaliza macros antigas e micros antigas já gravadas.
update public.products
set department = case
  when department in ('Vestuário e Moda', 'Moda', 'Vestuário') then 'Moda Fitness'
  when department in ('Suplementos e Nutrição', 'Suplementos') then 'Suplementos'
  when department in ('Fitness e Treino', 'Fitness') then 'Equipamentos'
  when department in ('Casa, Beleza e Utilidades', 'Casa, Beleza e Utilidades') then 'Acessórios'
  else department
end,
subcategory = case
  when subcategory in ('Calça', 'Calças') then 'Calça comum'
  when subcategory in ('Calça Legging', 'Legging') then 'Calça legging'
  when subcategory in ('Camiseta', 'Blusa', 'Camisetas') then 'Camisetas e Blusas'
  when subcategory in ('Kit Fitness', 'Kits') then 'Kits'
  when subcategory in ('Bebidas', 'Bebidas proteicas') then 'Bebidas proteicas'
  when subcategory in ('Outros suplementos', 'Outros') then 'Outros'
  when subcategory = 'Acessórios' then 'Acessórios de equipamento'
  else subcategory
end;

-- Fonte principal: category legado, com correspondência explícita para os nomes usados no catálogo.
update public.products
set department = mapped.department,
    subcategory = mapped.subcategory
from (
  values
    ('Calça', 'Moda Fitness', 'Calça comum'),
    ('Calça Legging', 'Moda Fitness', 'Calça legging'),
    ('Top', 'Moda Fitness', 'Top'),
    ('Camiseta', 'Moda Fitness', 'Camisetas e Blusas'),
    ('Blusa', 'Moda Fitness', 'Camisetas e Blusas'),
    ('Cardigan', 'Moda Fitness', 'Agasalhos'),
    ('Colete', 'Moda Fitness', 'Agasalhos'),
    ('Moletom', 'Moda Fitness', 'Moletom'),
    ('Macacão', 'Moda Fitness', 'Macacão'),
    ('Conjunto', 'Moda Fitness', 'Conjunto'),
    ('Short', 'Moda Fitness', 'Short'),
    ('Whey Protein', 'Suplementos', 'Whey Protein'),
    ('Barra de Proteína', 'Suplementos', 'Barra de Proteína'),
    ('Hipercalórico', 'Suplementos', 'Hipercalórico'),
    ('Vitaminas', 'Suplementos', 'Vitaminas'),
    ('Creatina', 'Suplementos', 'Creatina'),
    ('Colágeno', 'Suplementos', 'Colágeno'),
    ('Aminoácidos', 'Suplementos', 'Aminoácidos'),
    ('Pré-treino', 'Suplementos', 'Pré-treino'),
    ('Super Coffee', 'Suplementos', 'Super Coffee'),
    ('Bebidas', 'Suplementos', 'Bebidas proteicas'),
    ('Pasta de Amendoim', 'Suplementos', 'Outros'),
    ('Psyllium', 'Suplementos', 'Outros'),
    ('Musculação', 'Equipamentos', 'Musculação'),
    ('Kit Fitness', 'Equipamentos', 'Kits'),
    ('Step', 'Equipamentos', 'Step'),
    ('Colchonete', 'Equipamentos', 'Colchonete'),
    ('Silicone para esteira', 'Equipamentos', 'Acessórios de equipamento'),
    ('Coqueteleira', 'Acessórios', 'Coqueteleiras'),
    ('Chapéu', 'Acessórios', 'Chapéus'),
    ('Eletrônicos', 'Acessórios', 'Eletrônicos')
) as mapped(category, department, subcategory)
where lower(trim(public.products.category)) = lower(trim(mapped.category));

-- Corrige equipamentos de cardio que foram classificados como musculação.
update public.products
set department = 'Equipamentos', subcategory = 'Cardio'
where department = 'Equipamentos'
  and (title ilike '%bike%' or title ilike '%bicicleta%' or title ilike '%esteira%');

-- Artigos podem usar a mesma taxonomia quando sua categoria já é uma micro ou macro válida.
update public.articles a
set department = coalesce(t.department, a.department),
    subcategory = coalesce(t.subcategory, a.subcategory)
from (
  select 'Moda Fitness' as department, 'Moda Fitness' as subcategory
  union all select 'Suplementos', 'Suplementos'
  union all select 'Equipamentos', 'Equipamentos'
  union all select 'Acessórios', 'Acessórios'
) t
where lower(trim(a.category)) = lower(trim(t.subcategory));

-- Auditoria final: deve retornar zero linhas.
select id, title, category, department, subcategory
from public.products
where department not in ('Moda Fitness', 'Suplementos', 'Equipamentos', 'Acessórios')
   or subcategory is null;
