-- =============================================================================
-- LIFE CONNECT – V4
-- 12_v4_chat_tracking_wallet.sql
-- Messagerie, suivi GPS, portefeuille, notifications, modération.
-- À exécuter APRÈS V3_ALL.sql.
-- =============================================================================

create extension if not exists pgcrypto;

-- -----------------------------------------------------------------------------
-- Paramètres de profil
-- -----------------------------------------------------------------------------
alter table public.profiles
  add column if not exists notify_messages boolean not null default true,
  add column if not exists notify_requests boolean not null default true,
  add column if not exists notify_payments boolean not null default true,
  add column if not exists language text not null default 'fr'
    check (language in ('fr', 'en')),
  add column if not exists is_suspended boolean not null default false;

-- -----------------------------------------------------------------------------
-- Conversations et messages
-- -----------------------------------------------------------------------------
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.posts(id) on delete set null,
  request_id uuid references public.requests(id) on delete set null,
  client_id uuid not null references public.profiles(id) on delete cascade,
  provider_id uuid not null references public.profiles(id) on delete cascade,
  client_name text not null default '',
  provider_name text not null default '',
  client_phone text,
  provider_phone text,
  post_title text,
  status text not null default 'ouverte'
    check (status in ('ouverte', 'fermee')),
  last_message_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists conversations_client_idx on public.conversations (client_id, last_message_at desc);
create index if not exists conversations_provider_idx on public.conversations (provider_id, last_message_at desc);

alter table public.conversations enable row level security;

drop policy if exists conversations_select_involved on public.conversations;
create policy conversations_select_involved on public.conversations
  for select to authenticated
  using (client_id = auth.uid() or provider_id = auth.uid());

drop policy if exists conversations_insert_involved on public.conversations;
create policy conversations_insert_involved on public.conversations
  for insert to authenticated
  with check (client_id = auth.uid() or provider_id = auth.uid());

drop policy if exists conversations_update_involved on public.conversations;
create policy conversations_update_involved on public.conversations
  for update to authenticated
  using (client_id = auth.uid() or provider_id = auth.uid())
  with check (client_id = auth.uid() or provider_id = auth.uid());

revoke all on public.conversations from anon, authenticated;
grant select, insert, update on public.conversations to authenticated;

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  sender_name text not null default '',
  body text,
  kind text not null default 'texte'
    check (kind in ('texte', 'localisation', 'image', 'systeme')),
  latitude double precision,
  longitude double precision,
  attachment_url text,
  created_at timestamptz not null default now()
);

create index if not exists messages_conversation_idx on public.messages (conversation_id, created_at asc);

alter table public.messages enable row level security;
alter table public.messages replica identity full;

drop policy if exists messages_select_involved on public.messages;
create policy messages_select_involved on public.messages
  for select to authenticated
  using (
    exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id
        and (c.client_id = auth.uid() or c.provider_id = auth.uid())
    )
  );

drop policy if exists messages_insert_involved on public.messages;
create policy messages_insert_involved on public.messages
  for insert to authenticated
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id
        and (c.client_id = auth.uid() or c.provider_id = auth.uid())
    )
  );

revoke all on public.messages from anon, authenticated;
grant select, insert on public.messages to authenticated;

-- -----------------------------------------------------------------------------
-- Notifications
-- -----------------------------------------------------------------------------
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null default 'systeme'
    check (type in ('message', 'demande', 'paiement', 'systeme', 'sos')),
  title text not null,
  body text,
  link text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_idx on public.notifications (user_id, is_read, created_at desc);

alter table public.notifications enable row level security;

drop policy if exists notifications_select_own on public.notifications;
create policy notifications_select_own on public.notifications
  for select to authenticated using (user_id = auth.uid());

drop policy if exists notifications_update_own on public.notifications;
create policy notifications_update_own on public.notifications
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

revoke all on public.notifications from anon, authenticated;
grant select, update on public.notifications to authenticated;

-- -----------------------------------------------------------------------------
-- Portefeuille
-- -----------------------------------------------------------------------------
create table if not exists public.wallets (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  balance_fcfa integer not null default 0 check (balance_fcfa >= 0),
  updated_at timestamptz not null default now()
);

alter table public.wallets enable row level security;
drop policy if exists wallets_select_own on public.wallets;
create policy wallets_select_own on public.wallets
  for select to authenticated using (user_id = auth.uid());

revoke all on public.wallets from anon, authenticated;
grant select on public.wallets to authenticated;

create table if not exists public.wallet_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('recharge', 'retrait', 'paiement', 'remboursement')),
  amount integer not null check (amount > 0),
  status text not null default 'en_attente'
    check (status in ('en_attente', 'confirme', 'echoue', 'annule')),
  provider text not null default 'orange_money'
    check (provider in ('orange_money', 'mtn_momo', 'especes', 'systeme')),
  phone text,
  reference text,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists wallet_transactions_user_idx on public.wallet_transactions (user_id, created_at desc);

alter table public.wallet_transactions enable row level security;
drop policy if exists wallet_transactions_select_own on public.wallet_transactions;
create policy wallet_transactions_select_own on public.wallet_transactions
  for select to authenticated using (user_id = auth.uid());

revoke all on public.wallet_transactions from anon, authenticated;
grant select on public.wallet_transactions to authenticated;

create or replace function public.create_wallet_for_profile()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.wallets (user_id, balance_fcfa)
  values (new.id, 0)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists profile_create_wallet on public.profiles;
create trigger profile_create_wallet
  after insert on public.profiles
  for each row execute function public.create_wallet_for_profile();

insert into public.wallets (user_id, balance_fcfa)
select id, 0 from public.profiles
on conflict (user_id) do nothing;

-- -----------------------------------------------------------------------------
-- Suivi GPS
-- -----------------------------------------------------------------------------
create table if not exists public.request_locations (
  request_id uuid primary key references public.requests(id) on delete cascade,
  provider_id uuid references public.providers(id) on delete set null,
  latitude double precision not null,
  longitude double precision not null,
  updated_at timestamptz not null default now()
);

alter table public.request_locations enable row level security;
revoke all on public.request_locations from anon, authenticated;

alter table public.requests
  add column if not exists provider_access_token uuid default gen_random_uuid();

update public.requests
set provider_access_token = gen_random_uuid()
where provider_access_token is null;

create unique index if not exists requests_provider_access_token_idx
  on public.requests (provider_access_token);

-- -----------------------------------------------------------------------------
-- Modération
-- -----------------------------------------------------------------------------
alter table public.posts
  add column if not exists is_hidden boolean not null default false,
  add column if not exists moderation_note text;

drop policy if exists posts_select_public on public.posts;
create policy posts_select_public on public.posts
  for select to anon, authenticated
  using (
    is_hidden = false
    and (
      (visibility = 'publique' and status in ('ouverte', 'en_cours', 'close'))
      or author_id = auth.uid()
    )
  );

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references public.profiles(id) on delete set null,
  target_type text not null check (target_type in ('post', 'provider', 'user', 'message')),
  target_id text not null,
  reason text not null check (char_length(reason) between 5 and 800),
  status text not null default 'ouvert' check (status in ('ouvert', 'traite', 'rejete')),
  created_at timestamptz not null default now()
);

alter table public.reports enable row level security;
drop policy if exists reports_insert_own on public.reports;
create policy reports_insert_own on public.reports
  for insert to authenticated with check (reporter_id = auth.uid());

drop policy if exists reports_select_own on public.reports;
create policy reports_select_own on public.reports
  for select to authenticated using (reporter_id = auth.uid());

revoke all on public.reports from anon, authenticated;
grant select, insert on public.reports to authenticated;

-- -----------------------------------------------------------------------------
-- Storage : chat et avatars
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('chat', 'chat', true, 2097152, array['image/jpeg', 'image/png', 'image/webp']),
  ('avatars', 'avatars', true, 1048576, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = true,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists chat_public_read on storage.objects;
create policy chat_public_read on storage.objects
  for select using (bucket_id = 'chat');

drop policy if exists chat_authenticated_insert on storage.objects;
create policy chat_authenticated_insert on storage.objects
  for insert to authenticated with check (bucket_id = 'chat');

drop policy if exists avatars_public_read on storage.objects;
create policy avatars_public_read on storage.objects
  for select using (bucket_id = 'avatars');

drop policy if exists avatars_authenticated_insert on storage.objects;
create policy avatars_authenticated_insert on storage.objects
  for insert to authenticated with check (bucket_id = 'avatars');

-- -----------------------------------------------------------------------------
-- RPC : suivi client et mission prestataire
-- -----------------------------------------------------------------------------
create or replace function public.get_request_tracking(p_token uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_req public.requests%rowtype;
  v_provider_nom text;
  v_provider_whatsapp text;
  v_provider_lat double precision;
  v_provider_lng double precision;
  v_location_updated_at timestamptz;
begin
  select * into v_req from public.requests where token = p_token;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'not_found');
  end if;

  if v_req.provider_id is not null then
    select nom, whatsapp
      into v_provider_nom, v_provider_whatsapp
      from public.providers where id = v_req.provider_id;

    select latitude, longitude, updated_at
      into v_provider_lat, v_provider_lng, v_location_updated_at
      from public.request_locations where request_id = v_req.id;
  end if;

  return jsonb_build_object(
    'ok', true,
    'statut', v_req.statut,
    'probleme', v_req.probleme,
    'quartier', v_req.quartier,
    'client_latitude', v_req.latitude,
    'client_longitude', v_req.longitude,
    'provider_id', v_req.provider_id,
    'provider_nom', v_provider_nom,
    'provider_whatsapp', v_provider_whatsapp,
    'provider_latitude', v_provider_lat,
    'provider_longitude', v_provider_lng,
    'location_updated_at', v_location_updated_at
  );
end;
$$;

create or replace function public.get_mission_by_token(p_token uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_req public.requests%rowtype;
begin
  select * into v_req from public.requests where provider_access_token = p_token;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'not_found');
  end if;

  return jsonb_build_object(
    'ok', true,
    'request_id', v_req.id,
    'statut', v_req.statut,
    'probleme', v_req.probleme,
    'description', v_req.description,
    'quartier', v_req.quartier,
    'region_nom', v_req.region_nom,
    'tel_client', v_req.tel_client,
    'client_latitude', v_req.latitude,
    'client_longitude', v_req.longitude
  );
end;
$$;

create or replace function public.update_provider_location(
  p_token uuid,
  p_lat double precision,
  p_lng double precision
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_req public.requests%rowtype;
begin
  if p_lat is null or p_lng is null or p_lat < -90 or p_lat > 90 or p_lng < -180 or p_lng > 180 then
    return jsonb_build_object('ok', false, 'error', 'invalid_location');
  end if;

  select * into v_req from public.requests where provider_access_token = p_token;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'not_found');
  end if;

  if v_req.statut not in ('assignee', 'en_cours', 'resolue') then
    return jsonb_build_object('ok', false, 'error', 'not_assigned');
  end if;

  insert into public.request_locations (request_id, provider_id, latitude, longitude, updated_at)
  values (v_req.id, v_req.provider_id, p_lat, p_lng, now())
  on conflict (request_id) do update
    set latitude = excluded.latitude,
        longitude = excluded.longitude,
        updated_at = now();

  return jsonb_build_object('ok', true);
end;
$$;

create or replace function public.complete_mission(p_token uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_req public.requests%rowtype;
begin
  select * into v_req from public.requests where provider_access_token = p_token;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'not_found');
  end if;

  update public.requests
  set statut = 'resolue', resolue_le = now()
  where id = v_req.id;

  return jsonb_build_object('ok', true);
end;
$$;

-- -----------------------------------------------------------------------------
-- Realtime (messages, notifications, positions)
-- -----------------------------------------------------------------------------
do $$
begin
  alter publication supabase_realtime add table public.messages;
exception when duplicate_object then null;
          when undefined_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.notifications;
exception when duplicate_object then null;
          when undefined_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.request_locations;
exception when duplicate_object then null;
          when undefined_object then null;
end $$;
