-- Alinha os nomes das micro categorias com lib/taxonomy.ts.
-- Idempotente: pode ser rodada mais de uma vez.

-- Moda Fitness
update public.products set subcategory = 'Calça comum' where department = 'Moda Fitness' and subcategory = 'Calça';
update public.products set subcategory = 'Calça legging' where department = 'Moda Fitness' and subcategory = 'Calça Legging';
update public.products set subcategory = 'Blusa' where department = 'Moda Fitness' and subcategory = 'Camisetas e Blusas' and title ilike '%blusa%';
update public.products set subcategory = 'Camiseta' where department = 'Moda Fitness' and subcategory = 'Camisetas e Blusas';
update public.products set subcategory = 'Moletom' where department = 'Moda Fitness' and subcategory = 'Agasalhos' and title ilike '%moletom%';

-- Suplementos
update public.products set subcategory = 'Super Coffee' where department = 'Suplementos' and subcategory = 'Outros' and title ilike '%supercoffee%';
update public.products set subcategory = 'Outros suplementos' where department = 'Suplementos' and subcategory = 'Outros';
update public.products set subcategory = 'Bebidas' where department = 'Suplementos' and subcategory = 'Bebidas proteicas';
update public.products set department = 'Suplementos', subcategory = 'Pré-treino' where department = 'Acessórios' and subcategory = 'Eletrônicos' and title ilike '%cafe%';

-- Equipamentos
update public.products set subcategory = 'Kit Fitness' where department = 'Equipamentos' and subcategory = 'Kits';

-- Conferência: deve retornar zero linhas
select id, title, department, subcategory from public.products
where (department, subcategory) not in (
  ('Moda Fitness','Calça comum'),('Moda Fitness','Calça legging'),('Moda Fitness','Top'),('Moda Fitness','Camiseta'),
  ('Moda Fitness','Blusa'),('Moda Fitness','Agasalhos'),('Moda Fitness','Macacão'),('Moda Fitness','Conjunto'),
  ('Moda Fitness','Moletom'),('Moda Fitness','Short'),
  ('Suplementos','Whey Protein'),('Suplementos','Barra de Proteína'),('Suplementos','Hipercalórico'),('Suplementos','Vitaminas'),
  ('Suplementos','Creatina'),('Suplementos','Colágeno'),('Suplementos','Aminoácidos'),('Suplementos','Pré-treino'),
  ('Suplementos','Super Coffee'),('Suplementos','Bebidas'),('Suplementos','Outros suplementos'),
  ('Equipamentos','Musculação'),('Equipamentos','Cardio'),('Equipamentos','Kit Fitness'),('Equipamentos','Step'),
  ('Equipamentos','Colchonete'),('Equipamentos','Acessórios de equipamento'),
  ('Acessórios','Coqueteleiras'),('Acessórios','Chapéus'),('Acessórios','Eletrônicos')
);
