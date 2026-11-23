-- =============================================================================
-- LIFE CONNECT – V3 — comptes, profils, demandes/offres, propositions
-- À exécuter APRÈS V2_ALL.sql.
-- =============================================================================

begin;

-- =============================================================================
-- LIFE CONNECT – V3
-- 11_v3_accounts_posts.sql — comptes, profils, rôles, demandes/offres, propositions
-- À exécuter APRÈS la migration V2 (05 à 10).
-- =============================================================================

create extension if not exists pgcrypto;

-- -----------------------------------------------------------------------------
-- Profils liés à Supabase Auth
-- -----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  role text not null default 'particulier'
    check (role in ('particulier', 'professionnel', 'commercant', 'entreprise', 'moderateur', 'admin')),
  email text,
  phone text,
  bio text check (bio is null or char_length(bio) <= 600),
  avatar_url text,
  country text not null default 'Cameroun',
  city text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_role_idx on public.profiles (role);

alter table public.profiles enable row level security;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select to authenticated
  using (id = auth.uid());

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

revoke all on public.profiles from anon, authenticated;
grant select, update on public.profiles to authenticated;

-- Vue publique : jamais d'e-mail, de téléphone ni de données privées.
create or replace view public.profiles_public as
select id, full_name, role, bio, avatar_url, city, country, created_at
from public.profiles;

grant select on public.profiles_public to anon, authenticated;

-- -----------------------------------------------------------------------------
-- Fonctions de rôle et triggers
-- -----------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role in ('admin', 'moderateur')
  );
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create or replace function public.protect_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if auth.uid() is null then
    return new;
  end if;

  if new.role <> old.role and not public.is_admin() then
    raise exception 'Modification de rôle non autorisée.';
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_protect_role on public.profiles;
create trigger profiles_protect_role
  before update on public.profiles
  for each row execute function public.protect_profile_role();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_role text;
begin
  v_role := case
    when new.raw_user_meta_data->>'role' in ('particulier', 'professionnel', 'commercant', 'entreprise')
      then new.raw_user_meta_data->>'role'
    else 'particulier'
  end;

  insert into public.profiles (id, full_name, role, email, phone, country, city)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'full_name', ''), split_part(coalesce(new.email, ''), '@', 1)),
    v_role,
    new.email,
    new.phone,
    coalesce(nullif(new.raw_user_meta_data->>'country', ''), 'Cameroun'),
    nullif(new.raw_user_meta_data->>'city', '')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- -----------------------------------------------------------------------------
-- LIFE CONNECT / LIFE REQUEST : demandes et offres
-- -----------------------------------------------------------------------------
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  author_name text not null default '',
  author_role text,
  kind text not null default 'besoin' check (kind in ('besoin', 'offre')),
  title text not null check (char_length(title) between 5 and 120),
  description text not null check (char_length(description) between 10 and 2000),
  category_id bigint references public.categories(id) on delete set null,
  region_id bigint references public.regions(id) on delete set null,
  city text,
  quartier text,
  budget text,
  deadline date,
  status text not null default 'ouverte'
    check (status in ('ouverte', 'en_cours', 'close', 'expiree')),
  visibility text not null default 'publique'
    check (visibility in ('publique', 'membres')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists posts_status_created_idx on public.posts (status, created_at desc);
create index if not exists posts_category_idx on public.posts (category_id);
create index if not exists posts_region_idx on public.posts (region_id);
create index if not exists posts_author_idx on public.posts (author_id);

drop trigger if exists posts_updated_at on public.posts;
create trigger posts_updated_at
  before update on public.posts
  for each row execute function public.set_updated_at();

alter table public.posts enable row level security;

drop policy if exists posts_select_public on public.posts;
create policy posts_select_public on public.posts
  for select to anon, authenticated
  using (
    (visibility = 'publique' and status in ('ouverte', 'en_cours', 'close'))
    or author_id = auth.uid()
  );

drop policy if exists posts_insert_own on public.posts;
create policy posts_insert_own on public.posts
  for insert to authenticated
  with check (author_id = auth.uid());

drop policy if exists posts_update_own on public.posts;
create policy posts_update_own on public.posts
  for update to authenticated
  using (author_id = auth.uid())
  with check (author_id = auth.uid());

revoke all on public.posts from anon, authenticated;
grant select on public.posts to anon;
grant select, insert, update on public.posts to authenticated;

-- -----------------------------------------------------------------------------
-- Propositions reçues sur une demande
-- -----------------------------------------------------------------------------
create table if not exists public.proposals (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  author_name text not null default '',
  message text not null check (char_length(message) between 5 and 1200),
  price text,
  status text not null default 'envoyee'
    check (status in ('envoyee', 'acceptee', 'refusee', 'retiree')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (post_id, author_id)
);

create index if not exists proposals_post_idx on public.proposals (post_id, created_at desc);
create index if not exists proposals_author_idx on public.proposals (author_id);

drop trigger if exists proposals_updated_at on public.proposals;
create trigger proposals_updated_at
  before update on public.proposals
  for each row execute function public.set_updated_at();

alter table public.proposals enable row level security;

drop policy if exists proposals_select_involved on public.proposals;
create policy proposals_select_involved on public.proposals
  for select to authenticated
  using (
    author_id = auth.uid()
    or exists (
      select 1 from public.posts p
      where p.id = proposals.post_id and p.author_id = auth.uid()
    )
  );

drop policy if exists proposals_insert_own on public.proposals;
create policy proposals_insert_own on public.proposals
  for insert to authenticated
  with check (
    author_id = auth.uid()
    and exists (
      select 1 from public.posts p
      where p.id = proposals.post_id
        and p.author_id <> auth.uid()
        and p.status = 'ouverte'
    )
  );

drop policy if exists proposals_update_involved on public.proposals;
create policy proposals_update_involved on public.proposals
  for update to authenticated
  using (
    author_id = auth.uid()
    or exists (
      select 1 from public.posts p
      where p.id = proposals.post_id and p.author_id = auth.uid()
    )
  )
  with check (
    author_id = auth.uid()
    or exists (
      select 1 from public.posts p
      where p.id = proposals.post_id and p.author_id = auth.uid()
    )
  );

revoke all on public.proposals from anon, authenticated;
grant select, insert, update on public.proposals to authenticated;


commit;