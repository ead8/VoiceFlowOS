-- VoiceFlowOS application schema
--
-- Better Auth manages the core auth tables (`user`, `session`, `account`, `verification`).
-- Generate those tables against DATABASE_URL before using this schema in production.
--
-- The application tables below intentionally reference Better Auth's `user` table by `id`.

create extension if not exists pgcrypto;

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.business_profiles (
  user_id text primary key references public."user" (id) on delete cascade,
  company_name text,
  plan text not null default 'starter' check (plan in ('starter', 'pro', 'enterprise')),
  industry text,
  business_phone text,
  timezone text not null default 'UTC',
  transfer_phone_number text,
  spam_screening_enabled boolean not null default false,
  voicemail_detection_enabled boolean not null default true,
  languages text[] not null default array['English']::text[],
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table if exists public.business_profiles add column if not exists industry text;
alter table if exists public.business_profiles add column if not exists business_phone text;
alter table if exists public.business_profiles add column if not exists timezone text not null default 'UTC';
alter table if exists public.business_profiles add column if not exists transfer_phone_number text;
alter table if exists public.business_profiles add column if not exists spam_screening_enabled boolean not null default false;
alter table if exists public.business_profiles add column if not exists voicemail_detection_enabled boolean not null default true;
alter table if exists public.business_profiles add column if not exists languages text[] not null default array['English']::text[];

create table if not exists public.agents (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public."user" (id) on delete cascade,
  name text not null,
  voice text not null,
  instructions text not null,
  phone_number text not null unique,
  status text not null default 'draft' check (status in ('draft', 'active', 'paused')),
  retell_agent_id text unique,
  retell_phone_number text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.calls (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.agents (id) on delete cascade,
  external_call_id text unique,
  caller_number text not null,
  duration_seconds integer not null default 0 check (duration_seconds >= 0),
  transcript text,
  summary text,
  resolution_status text not null default 'completed' check (
    resolution_status in ('completed', 'transferred', 'voicemail', 'spam', 'failed')
  ),
  status text not null default 'completed' check (
    status in ('in_progress', 'completed', 'missed', 'failed', 'voicemail', 'spam')
  ),
  recording_url text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.knowledge_documents (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public."user" (id) on delete cascade,
  agent_id uuid references public.agents (id) on delete set null,
  title text not null,
  source_type text not null check (source_type in ('pdf', 'text', 'faq')),
  content text,
  source_url text,
  status text not null default 'ready' check (status in ('processing', 'ready', 'failed')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table if exists public.knowledge_documents add column if not exists source_url text;

create table if not exists public.integrations (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public."user" (id) on delete cascade,
  provider text not null,
  status text not null default 'disconnected' check (status in ('disconnected', 'connected', 'error')),
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, provider)
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public."user" (id) on delete cascade,
  call_id uuid references public.calls (id) on delete set null,
  name text,
  phone_number text,
  budget text,
  timeline text,
  problem text,
  location text,
  qualification text check (qualification in ('high', 'medium', 'low')),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public."user" (id) on delete cascade,
  agent_id uuid references public.agents (id) on delete set null,
  call_id uuid references public.calls (id) on delete set null,
  provider text not null,
  external_event_id text,
  contact_name text,
  contact_phone text,
  scheduled_for timestamptz not null,
  notes text,
  status text not null default 'scheduled' check (status in ('scheduled', 'completed', 'cancelled')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists agents_user_id_idx on public.agents (user_id);
create index if not exists agents_retell_agent_id_idx on public.agents (retell_agent_id);
create index if not exists calls_agent_id_idx on public.calls (agent_id);
create index if not exists calls_external_call_id_idx on public.calls (external_call_id);
create index if not exists calls_created_at_idx on public.calls (created_at desc);
create index if not exists knowledge_documents_user_id_idx on public.knowledge_documents (user_id);
create index if not exists integrations_user_id_idx on public.integrations (user_id);
create index if not exists leads_user_id_idx on public.leads (user_id);
create index if not exists appointments_user_id_idx on public.appointments (user_id);

drop trigger if exists business_profiles_set_updated_at on public.business_profiles;
create trigger business_profiles_set_updated_at
before update on public.business_profiles
for each row
execute function public.handle_updated_at();

drop trigger if exists agents_set_updated_at on public.agents;
create trigger agents_set_updated_at
before update on public.agents
for each row
execute function public.handle_updated_at();

drop trigger if exists knowledge_documents_set_updated_at on public.knowledge_documents;
create trigger knowledge_documents_set_updated_at
before update on public.knowledge_documents
for each row
execute function public.handle_updated_at();

drop trigger if exists integrations_set_updated_at on public.integrations;
create trigger integrations_set_updated_at
before update on public.integrations
for each row
execute function public.handle_updated_at();

drop trigger if exists appointments_set_updated_at on public.appointments;
create trigger appointments_set_updated_at
before update on public.appointments
for each row
execute function public.handle_updated_at();
