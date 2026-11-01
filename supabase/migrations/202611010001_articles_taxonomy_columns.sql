-- Macro and micro of each article, used by the blog sidebar and the admin article form.
-- The article save sends these columns, so they must exist before publishing works.
alter table public.articles add column if not exists department text;
alter table public.articles add column if not exists subcategory text;
