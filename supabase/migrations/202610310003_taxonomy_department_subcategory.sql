-- Árvore de classificação: macro (department) e micro (subcategory).
-- A coluna category continua existindo; nada é apagado.
alter table public.products add column if not exists department text;
alter table public.products add column if not exists subcategory text;

-- Preenche a partir da categoria atual
update public.products set department = 'Vestuário e Moda', subcategory = 'Calça comum' where category = 'Calça';
update public.products set department = 'Vestuário e Moda', subcategory = 'Calça legging' where category = 'Calça Legging';
update public.products set department = 'Vestuário e Moda', subcategory = 'Top' where category = 'Top';
update public.products set department = 'Vestuário e Moda', subcategory = 'Camiseta' where category = 'Camiseta';
update public.products set department = 'Vestuário e Moda', subcategory = 'Blusa' where category = 'Blusa';
update public.products set department = 'Vestuário e Moda', subcategory = 'Agasalhos' where category = 'Cardigan';
update public.products set department = 'Vestuário e Moda', subcategory = 'Agasalhos' where category = 'Colete';
update public.products set department = 'Vestuário e Moda', subcategory = 'Moletom' where category = 'Moletom';
update public.products set department = 'Vestuário e Moda', subcategory = 'Macacão' where category = 'Macacão';
update public.products set department = 'Vestuário e Moda', subcategory = 'Conjunto' where category = 'Conjunto';
update public.products set department = 'Vestuário e Moda', subcategory = 'Short' where category = 'Short';
update public.products set department = 'Suplementos e Nutrição', subcategory = 'Whey Protein' where category = 'Whey Protein';
update public.products set department = 'Suplementos e Nutrição', subcategory = 'Barra de Proteína' where category = 'Barra de Proteína';
update public.products set department = 'Suplementos e Nutrição', subcategory = 'Hipercalórico' where category = 'Hipercalórico';
update public.products set department = 'Suplementos e Nutrição', subcategory = 'Vitaminas' where category = 'Vitaminas';
update public.products set department = 'Suplementos e Nutrição', subcategory = 'Creatina' where category = 'Creatina';
update public.products set department = 'Suplementos e Nutrição', subcategory = 'Colágeno' where category = 'Colágeno';
update public.products set department = 'Suplementos e Nutrição', subcategory = 'Aminoácidos' where category = 'Aminoácidos';
update public.products set department = 'Suplementos e Nutrição', subcategory = 'Pré-treino' where category = 'Pré-treino';
update public.products set department = 'Suplementos e Nutrição', subcategory = 'Super Coffee' where category = 'Super Coffee';
update public.products set department = 'Suplementos e Nutrição', subcategory = 'Bebidas' where category = 'Bebidas';
update public.products set department = 'Suplementos e Nutrição', subcategory = 'Pré-treino' where category = 'Eletrônicos';
update public.products set department = 'Suplementos e Nutrição', subcategory = 'Outros suplementos' where category = 'Pasta de Amendoim';
update public.products set department = 'Suplementos e Nutrição', subcategory = 'Outros suplementos' where category = 'Psyllium';
update public.products set department = 'Fitness e Treino', subcategory = 'Musculação' where category = 'Musculação';
update public.products set department = 'Fitness e Treino', subcategory = 'Kit Fitness' where category = 'Kit Fitness';
update public.products set department = 'Fitness e Treino', subcategory = 'Step' where category = 'Step';
update public.products set department = 'Fitness e Treino', subcategory = 'Colchonete' where category = 'Colchonete';
update public.products set department = 'Fitness e Treino', subcategory = 'Acessórios de equipamento' where category = 'Silicone para esteira';
update public.products set department = 'Fitness e Treino', subcategory = 'Coqueteleiras' where category = 'Coqueteleira';
update public.products set department = 'Casa, Beleza e Utilidades', subcategory = 'Acessórios' where category = 'Chapéu';

-- Musculação: bikes e esteiras viram Cardio
update public.products set subcategory = 'Cardio' where category = 'Musculação' and (title ilike '%bike%' or title ilike '%bicicleta%' or title ilike '%esteira%');

-- Kit Funcional (está em Kit Fitness) continua em Kit Fitness; Kit Cardio (Musculação) vira Cardio acima

-- Conferência: produtos sem macro/micro depois do preenchimento
select category, count(*) from public.products where department is null group by category order by 2 desc;
