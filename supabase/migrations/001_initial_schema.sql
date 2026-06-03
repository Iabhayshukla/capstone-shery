-- ============================================================
-- AI Website Builder — Initial Schema
-- Migration: 001_initial_schema.sql
-- Run in: Supabase Dashboard → SQL Editor, or via Supabase CLI
-- ============================================================

-- ──────────────────────────────────────────
-- EXTENSIONS
-- ──────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ──────────────────────────────────────────
-- TABLES
-- ──────────────────────────────────────────

-- projects: one per user, stores the latest generated HTML
create table if not exists public.projects (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  name         text not null check (char_length(name) between 1 and 100),
  current_code text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- generations: append-only history of every LLM call per project
create table if not exists public.generations (
  id              uuid primary key default uuid_generate_v4(),
  project_id      uuid not null references public.projects(id) on delete cascade,
  prompt          text not null,
  output          text not null,
  is_section_edit boolean not null default false,
  section_id      text,                -- null for full-page generations
  created_at      timestamptz not null default now()
);

-- ──────────────────────────────────────────
-- INDEXES
-- ──────────────────────────────────────────
create index if not exists idx_projects_user_id
  on public.projects(user_id);

create index if not exists idx_generations_project_id
  on public.generations(project_id);

create index if not exists idx_projects_updated_at
  on public.projects(updated_at desc);

-- ──────────────────────────────────────────
-- AUTO-UPDATE updated_at TRIGGER
-- ──────────────────────────────────────────
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_projects_updated_at on public.projects;
create trigger set_projects_updated_at
  before update on public.projects
  for each row execute function public.handle_updated_at();

-- ──────────────────────────────────────────
-- ROW LEVEL SECURITY (RLS)
-- ──────────────────────────────────────────

alter table public.projects enable row level security;
alter table public.generations enable row level security;

-- Projects: users can only see and modify their own projects
create policy "projects: select own" on public.projects
  for select using (auth.uid() = user_id);

create policy "projects: insert own" on public.projects
  for insert with check (auth.uid() = user_id);

create policy "projects: update own" on public.projects
  for update using (auth.uid() = user_id);

create policy "projects: delete own" on public.projects
  for delete using (auth.uid() = user_id);

-- Generations: accessible only through projects the user owns
create policy "generations: select own" on public.generations
  for select using (
    exists (
      select 1 from public.projects p
      where p.id = project_id and p.user_id = auth.uid()
    )
  );

create policy "generations: insert own" on public.generations
  for insert with check (
    exists (
      select 1 from public.projects p
      where p.id = project_id and p.user_id = auth.uid()
    )
  );