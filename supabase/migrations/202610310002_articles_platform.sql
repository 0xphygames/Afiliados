-- Loja de cada artigo, para o filtro de lojas do blog (igual ao de Achadinhos).
alter table public.articles add column if not exists platform text
  check (platform in ('shopee', 'shein', 'mercadolivre', 'amazon'));

-- Os 4 artigos de fundo de funil criados por loja
update public.articles set platform = 'shopee' where title like 'Melhores Achadinhos da Shopee%';
update public.articles set platform = 'shein' where title like 'Melhores Achadinhos da Shein%';
update public.articles set platform = 'mercadolivre' where title like 'Melhores Achadinhos do Mercado Livre%';
update public.articles set platform = 'amazon' where title like 'Melhores Achadinhos da Amazon%';
