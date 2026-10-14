-- Allow only the configured administrators to manage blog articles.
-- Public visitors keep read-only access through the existing select policy.

drop policy if exists "admins can insert articles" on public.articles;
drop policy if exists "admins can update articles" on public.articles;
drop policy if exists "admins can delete articles" on public.articles;

create policy "admins can insert articles" on public.articles
for insert to authenticated
with check (
  lower(auth.jwt() ->> 'email') in ('taper.sant@gmail.com', '0xphy.games@gmail.com')
);

create policy "admins can update articles" on public.articles
for update to authenticated
using (
  lower(auth.jwt() ->> 'email') in ('taper.sant@gmail.com', '0xphy.games@gmail.com')
)
with check (
  lower(auth.jwt() ->> 'email') in ('taper.sant@gmail.com', '0xphy.games@gmail.com')
);

create policy "admins can delete articles" on public.articles
for delete to authenticated
using (
  lower(auth.jwt() ->> 'email') in ('taper.sant@gmail.com', '0xphy.games@gmail.com')
);
