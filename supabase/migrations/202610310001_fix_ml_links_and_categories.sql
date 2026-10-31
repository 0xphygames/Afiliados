-- 1) Links de afiliado do Mercado Livre (link direto do produto com a tag de afiliado)
update public.products set affiliate_url = 'https://www.mercadolivre.com.br/whey-protein-900g-femini-whey-protein-max-titanium-morango-proteina-e-colageno/p/MLB6099966?matt_tool_id=14450882' where id = 'ml-pre-treino-egide';
update public.products set affiliate_url = 'https://www.mercadolivre.com.br/barra-de-proteina-max-titanium-proteina-power-protein-bar-41g-display-com-12-unid-sabor-cookies/p/MLB26842866?matt_tool_id=14450882' where id = 'ml-azeite-extra-virgem-grego';
update public.products set affiliate_url = 'https://www.mercadolivre.com.br/bcaa-drink-max-titanium-411-280g-aminoacidos-sabor-limao/p/MLB75094567?matt_tool_id=14450882' where id = 'ml-barra-fixa-porta';
update public.products set affiliate_url = 'https://www.mercadolivre.com.br/dux-nutrition-skin-e-body-proteinasminerais-collagen-po/up/MLBU4055927747?matt_tool_id=14450882' where id = 'prod-1792159731110';
update public.products set affiliate_url = 'https://produto.mercadolivre.com.br/MLB-3258819762-dux-melhor-whey-poten-concentrado-wey-100-puro-ganhar-massa-_JM?matt_tool_id=14450882' where id = 'prod-1792159132244';
update public.products set affiliate_url = 'https://www.mercadolivre.com.br/dux-pre-workout-stim-free-300g-sabor-frutas-vermelhas/p/MLB43513985?matt_tool_id=14450882' where id = 'prod-1792174363652';
update public.products set affiliate_url = 'https://www.mercadolivre.com.br/creatina-dux-nutrition-em-po-sem-sabor-x-300g/p/MLB19698479?matt_tool_id=14450882' where id = 'prod-1792159535259';
update public.products set affiliate_url = 'https://www.mercadolivre.com.br/whey-protein-isolado-dux-nutrition-pote-900g-sabor-cookies/p/MLB18512110?matt_tool_id=14450882' where id = 'prod-1792159262076';
update public.products set affiliate_url = 'https://produto.mercadolivre.com.br/MLB-3941231047-multivitaminico-multimax-max-titanium-90-capsulas-max-titanium-sabor-natural-_JM?matt_tool_id=14450882' where id = 'prod-1792095485675';
update public.products set affiliate_url = 'https://www.mercadolivre.com.br/whey-isolado-hidrolisado-concentrado-top-whey-3-w-900g-sabor-morango/p/MLB43897399?matt_tool_id=14450882' where id = 'prod-1792622886815';
update public.products set affiliate_url = 'https://produto.mercadolivre.com.br/MLB-4648888080-pre-treino-night-train-pote-300g-sabor-frutas-vermelhas-max-titanium-_JM?matt_tool_id=14450882' where id = 'ml-multivitaminico-daily';

-- 2) Categorias parecidas: unificar
update public.products set category = 'Whey Protein' where category in ('Whey', 'Whey Proteín', 'Whey Protein');
update public.products set category = 'Pré-treino' where category in ('Pré - Treino', 'Pré treino', 'Pré Treino', 'Pre Treino', 'Pre Treino');
update public.products set category = 'Colágeno' where category in ('Colageno', 'Colágeno');
update public.products set category = 'Barra de Proteína' where category in ('Barra de Proteina', 'Barra de Proteinas', 'Barra de Proteínas', 'Barras de Cereais');
update public.products set category = 'Vitaminas' where category in ('Multivitamínico');
update public.products set category = 'Macacão' where category in ('Macacão esportivo');
update public.products set category = 'Aminoácidos' where category in ('Beta Alanina', 'L-Glutamina');
update public.products set category = 'Coqueteleira' where category in ('Squeeze', 'Mini Galão');
