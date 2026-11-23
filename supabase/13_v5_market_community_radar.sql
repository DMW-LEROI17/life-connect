-- =============================================================================
-- LIFE CONNECT – V5
-- 13_v5_market_people_community_radar.sql
-- LIFE MARKET, LIFE PEOPLE, LIFE COMMUNITY, LIFE EXCHANGE, LIFE RADAR.
-- À exécuter APRÈS V4_ALL.sql.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- LIFE MARKET
-- -----------------------------------------------------------------------------
create table if not exists public.market_listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles(id) on delete cascade,
  seller_name text not null default '',
  title text not null check (char_length(title) between 3 and 120),
  description text not null check (char_length(description) between 10 and 2000),
  price_fcfa integer check (price_fcfa is null or price_fcfa >= 0),
  condition text not null default 'occasion'
    check (condition in ('neuf', 'occasion', 'service')),
  category_id bigint references public.categories(id) on delete set null,
  city text,
  quartier text,
  image_url text,
  status text not null default 'active'
    check (status in ('active', 'vendue', 'archivee')),
  created_at timestamptz not null default now()
);

create index if not exists market_status_idx on public.market_listings (status, created_at desc);
create index if not exists market_seller_idx on public.market_listings (seller_id);

alter table public.market_listings enable row level security;

drop policy if exists market_select_public on public.market_listings;
create policy market_select_public on public.market_listings
  for select to anon, authenticated
  using (status = 'active' or seller_id = auth.uid());

drop policy if exists market_insert_own on public.market_listings;
create policy market_insert_own on public.market_listings
  for insert to authenticated with check (seller_id = auth.uid());

drop policy if exists market_update_own on public.market_listings;
create policy market_update_own on public.market_listings
  for update to authenticated
  using (seller_id = auth.uid())
  with check (seller_id = auth.uid());

revoke all on public.market_listings from anon, authenticated;
grant select on public.market_listings to anon;
grant select, insert, update on public.market_listings to authenticated;

-- -----------------------------------------------------------------------------
-- LIFE COMMUNITY
-- -----------------------------------------------------------------------------
create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  owner_name text not null default '',
  name text not null check (char_length(name) between 3 and 80),
  slug text not null unique,
  description text check (description is null or char_length(description) <= 800),
  category_id bigint references public.categories(id) on delete set null,
  city text,
  visibility text not null default 'publique'
    check (visibility in ('publique', 'privee')),
  created_at timestamptz not null default now()
);

create index if not exists groups_created_idx on public.groups (created_at desc);

create table if not exists public.group_members (
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'membre' check (role in ('membre', 'admin')),
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

alter table public.groups enable row level security;

drop policy if exists groups_select_public on public.groups;
create policy groups_select_public on public.groups
  for select to anon, authenticated
  using (
    visibility = 'publique'
    or owner_id = auth.uid()
    or exists (
      select 1 from public.group_members m
      where m.group_id = groups.id and m.user_id = auth.uid()
    )
  );

drop policy if exists groups_insert_own on public.groups;
create policy groups_insert_own on public.groups
  for insert to authenticated with check (owner_id = auth.uid());

drop policy if exists groups_update_own on public.groups;
create policy groups_update_own on public.groups
  for update to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

revoke all on public.groups from anon, authenticated;
grant select on public.groups to anon;
grant select, insert, update on public.groups to authenticated;

alter table public.group_members enable row level security;

drop policy if exists group_members_select on public.group_members;
create policy group_members_select on public.group_members
  for select to authenticated
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.groups g
      where g.id = group_members.group_id
        and (g.visibility = 'publique' or g.owner_id = auth.uid())
    )
  );

drop policy if exists group_members_insert_self on public.group_members;
create policy group_members_insert_self on public.group_members
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists group_members_delete_self on public.group_members;
create policy group_members_delete_self on public.group_members
  for delete to authenticated using (user_id = auth.uid());

revoke all on public.group_members from anon, authenticated;
grant select, insert, delete on public.group_members to authenticated;

create table if not exists public.group_posts (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  author_name text not null default '',
  body text not null check (char_length(body) between 2 and 2000),
  created_at timestamptz not null default now()
);

create index if not exists group_posts_group_idx on public.group_posts (group_id, created_at desc);

alter table public.group_posts enable row level security;

drop policy if exists group_posts_select on public.group_posts;
create policy group_posts_select on public.group_posts
  for select to authenticated
  using (
    exists (
      select 1 from public.groups g
      where g.id = group_posts.group_id
        and (
          g.visibility = 'publique'
          or g.owner_id = auth.uid()
          or exists (
            select 1 from public.group_members m
            where m.group_id = g.id and m.user_id = auth.uid()
          )
        )
    )
  );

drop policy if exists group_posts_insert on public.group_posts;
create policy group_posts_insert on public.group_posts
  for insert to authenticated
  with check (
    author_id = auth.uid()
    and exists (
      select 1 from public.group_members m
      where m.group_id = group_posts.group_id and m.user_id = auth.uid()
    )
  );

revoke all on public.group_posts from anon, authenticated;
grant select, insert on public.group_posts to authenticated;

-- -----------------------------------------------------------------------------
-- LIFE EXCHANGE
-- -----------------------------------------------------------------------------
create table if not exists public.exchange_listings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  user_name text not null default '',
  title text not null check (char_length(title) between 3 and 120),
  description text not null check (char_length(description) between 10 and 1200),
  kind text not null default 'offre' check (kind in ('offre', 'recherche')),
  skill text,
  city text,
  status text not null default 'active' check (status in ('active', 'close')),
  created_at timestamptz not null default now()
);

alter table public.exchange_listings enable row level security;

drop policy if exists exchange_select on public.exchange_listings;
create policy exchange_select on public.exchange_listings
  for select to anon, authenticated
  using (status = 'active' or user_id = auth.uid());

drop policy if exists exchange_insert on public.exchange_listings;
create policy exchange_insert on public.exchange_listings
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists exchange_update on public.exchange_listings;
create policy exchange_update on public.exchange_listings
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

revoke all on public.exchange_listings from anon, authenticated;
grant select on public.exchange_listings to anon;
grant select, insert, update on public.exchange_listings to authenticated;

-- -----------------------------------------------------------------------------
-- LIFE RADAR
-- -----------------------------------------------------------------------------
create table if not exists public.opportunities (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references public.profiles(id) on delete set null,
  author_name text not null default 'LIFE CONNECT',
  title text not null check (char_length(title) between 3 and 140),
  description text not null check (char_length(description) between 10 and 2000),
  kind text not null default 'projet'
    check (kind in ('emploi', 'stage', 'evenement', 'partenariat', 'projet')),
  city text,
  deadline date,
  link text,
  created_at timestamptz not null default now()
);

create index if not exists opportunities_created_idx on public.opportunities (created_at desc);

alter table public.opportunities enable row level security;

drop policy if exists opportunities_select on public.opportunities;
create policy opportunities_select on public.opportunities
  for select to anon, authenticated using (true);

drop policy if exists opportunities_insert on public.opportunities;
create policy opportunities_insert on public.opportunities
  for insert to authenticated with check (author_id = auth.uid());

drop policy if exists opportunities_update on public.opportunities;
create policy opportunities_update on public.opportunities
  for update to authenticated
  using (author_id = auth.uid())
  with check (author_id = auth.uid());

revoke all on public.opportunities from anon, authenticated;
grant select on public.opportunities to anon;
grant select, insert, update on public.opportunities to authenticated;

-- -----------------------------------------------------------------------------
-- Storage : photos d’annonces
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('market', 'market', true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = true,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists market_public_read on storage.objects;
create policy market_public_read on storage.objects
  for select using (bucket_id = 'market');

drop policy if exists market_authenticated_insert on storage.objects;
create policy market_authenticated_insert on storage.objects
  for insert to authenticated with check (bucket_id = 'market');
