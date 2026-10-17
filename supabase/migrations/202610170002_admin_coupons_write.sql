-- Permite que os administradores criem, editem e excluam cupons pelo painel.
-- Mesmo critério de e-mail das migrações 202610140001 e 202610170001.

create policy "admins can insert coupons" on public.coupons
for insert to authenticated
with check (lower(auth.jwt() ->> 'email') in ('taper.sant@gmail.com', '0xphy.games@gmail.com'));

create policy "admins can update coupons" on public.coupons
for update to authenticated
using (lower(auth.jwt() ->> 'email') in ('taper.sant@gmail.com', '0xphy.games@gmail.com'))
with check (lower(auth.jwt() ->> 'email') in ('taper.sant@gmail.com', '0xphy.games@gmail.com'));

create policy "admins can delete coupons" on public.coupons
for delete to authenticated
using (lower(auth.jwt() ->> 'email') in ('taper.sant@gmail.com', '0xphy.games@gmail.com'));
