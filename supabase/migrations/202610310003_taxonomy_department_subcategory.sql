-- Árvore de classificação: macro (department) e micro (subcategory).
-- A coluna category continua existindo para rollback; nada é apagado.
alter table public.products add column if not exists department text;
alter table public.products add column if not exists subcategory text;

-- Preenche a partir da categoria atual
update public.products set department = 'Moda Fitness', subcategory = 'Calça comum' where category = 'Calça';
update public.products set department = 'Moda Fitness', subcategory = 'Calça legging' where category = 'Calça Legging';
update public.products set department = 'Moda Fitness', subcategory = 'Top' where category = 'Top';
update public.products set department = 'Moda Fitness', subcategory = 'Camiseta' where category = 'Camiseta';
update public.products set department = 'Moda Fitness', subcategory = 'Blusa' where category = 'Blusa';
update public.products set department = 'Moda Fitness', subcategory = 'Agasalhos' where category = 'Cardigan';
update public.products set department = 'Moda Fitness', subcategory = 'Agasalhos' where category = 'Colete';
update public.products set department = 'Moda Fitness', subcategory = 'Moletom' where category = 'Moletom';
update public.products set department = 'Moda Fitness', subcategory = 'Macacão' where category = 'Macacão';
update public.products set department = 'Moda Fitness', subcategory = 'Conjunto' where category = 'Conjunto';
update public.products set department = 'Moda Fitness', subcategory = 'Short' where category = 'Short';
update public.products set department = 'Suplementos', subcategory = 'Whey Protein' where category = 'Whey Protein';
update public.products set department = 'Suplementos', subcategory = 'Barra de Proteína' where category = 'Barra de Proteína';
update public.products set department = 'Suplementos', subcategory = 'Hipercalórico' where category = 'Hipercalórico';
update public.products set department = 'Suplementos', subcategory = 'Vitaminas' where category = 'Vitaminas';
update public.products set department = 'Suplementos', subcategory = 'Creatina' where category = 'Creatina';
update public.products set department = 'Suplementos', subcategory = 'Colágeno' where category = 'Colágeno';
update public.products set department = 'Suplementos', subcategory = 'Aminoácidos' where category = 'Aminoácidos';
update public.products set department = 'Suplementos', subcategory = 'Pré-treino' where category = 'Pré-treino';
update public.products set department = 'Suplementos', subcategory = 'Pré-treino' where category = 'Eletrônicos';
update public.products set department = 'Suplementos', subcategory = 'Super Coffee' where category = 'Super Coffee';
update public.products set department = 'Suplementos', subcategory = 'Bebidas' where category = 'Bebidas';
update public.products set department = 'Suplementos', subcategory = 'Outros suplementos' where category = 'Pasta de Amendoim';
update public.products set department = 'Suplementos', subcategory = 'Outros suplementos' where category = 'Psyllium';
update public.products set department = 'Equipamentos', subcategory = 'Musculação' where category = 'Musculação';
update public.products set department = 'Equipamentos', subcategory = 'Kit Fitness' where category = 'Kit Fitness';
update public.products set department = 'Equipamentos', subcategory = 'Acessórios de equipamento' where category = 'Step';
update public.products set department = 'Equipamentos', subcategory = 'Acessórios de equipamento' where category = 'Colchonete';
update public.products set department = 'Equipamentos', subcategory = 'Acessórios de equipamento' where category = 'Silicone para esteira';
update public.products set department = 'Acessórios', subcategory = 'Coqueteleiras' where category = 'Coqueteleira';
update public.products set department = 'Acessórios', subcategory = 'Chapéus' where category = 'Chapéu';

-- Musculação: bikes, esteiras e kit cardio viram Cardio (pelo nome do produto)
update public.products set subcategory = 'Cardio' where category = 'Musculação' and (title ilike '%bike%' or title ilike '%bicicleta%' or title ilike '%esteira%' or title ilike '%kit cardio%');

-- Conferência: deve retornar zero linhas
select id, title, category from public.products where department is null;
