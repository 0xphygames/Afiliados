-- RLS policies control rows, while these grants expose the tables to the
-- Supabase Data API for public catalog reads.
grant usage on schema public to anon, authenticated;
grant select on table public.products to anon, authenticated;
grant select on table public.articles to anon, authenticated;
