-- 004_add_token_usage.sql

create table if not exists public.token_usage (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  date        date not null default current_date,
  tokens_used integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique(user_id, date)
);

create index if not exists idx_token_usage_user_date
  on public.token_usage(user_id, date);

alter table public.token_usage enable row level security;

create policy "token_usage: select own" on public.token_usage
  for select using (auth.uid() = user_id);

create policy "token_usage: insert own" on public.token_usage
  for insert with check (auth.uid() = user_id);

create policy "token_usage: update own" on public.token_usage
  for update using (auth.uid() = user_id);