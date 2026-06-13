create table if not exists public.user_commissions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  cards jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.user_commissions enable row level security;

create policy "Users can view own commissions"
on public.user_commissions
for select
using (auth.uid() = user_id);

create policy "Users can insert own commissions"
on public.user_commissions
for insert
with check (auth.uid() = user_id);

create policy "Users can update own commissions"
on public.user_commissions
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
