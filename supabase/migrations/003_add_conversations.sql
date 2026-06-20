-- 003_add_conversations.sql

create table if not exists public.conversations (
  id           uuid primary key default uuid_generate_v4(),
  project_id   uuid not null references public.projects(id) on delete cascade,
  role         text not null check (role in ('user', 'assistant')),
  content      text not null,
  created_at   timestamptz not null default now()
);

create index if not exists idx_conversations_project_id
  on public.conversations(project_id);

alter table public.conversations enable row level security;

create policy "conversations: select own" on public.conversations
  for select using (
    exists (
      select 1 from public.projects p
      where p.id = project_id and p.user_id = auth.uid()
    )
  );

create policy "conversations: insert own" on public.conversations
  for insert with check (
    exists (
      select 1 from public.projects p
      where p.id = project_id and p.user_id = auth.uid()
    )
  );