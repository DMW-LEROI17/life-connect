-- =============================================================================
-- LIFE CONNECT – V2 NATIONALE — migration complète
-- À exécuter dans Supabase > SQL Editor, APRÈS les scripts 01 à 04.
-- Ce fichier regroupe 05 à 10. Il ne supprime aucune donnée existante.
-- =============================================================================

begin;

-- =============================================================================
-- FICHIER : supabase\05_v2_schema.sql
-- =============================================================================
-- =============================================================================
-- LIFE CONNECT – V2 NATIONALE
-- 05_v2_schema.sql — géographie, catalogue, urgences, zones prestataires
-- À exécuter APRÈS 01 à 04. Ne supprime aucune donnée existante.
-- =============================================================================

create extension if not exists pgcrypto;

-- -----------------------------------------------------------------------------
-- Géographie : région > département > arrondissement/commune > quartier
-- -----------------------------------------------------------------------------
create table if not exists public.regions (
  id bigserial primary key,
  slug text not null unique,
  nom text not null,
  chef_lieu text,
  is_verified boolean not null default true,
  source text,
  cree_le timestamptz not null default now()
);

create table if not exists public.departements (
  id bigserial primary key,
  region_id bigint not null references public.regions(id) on delete cascade,
  slug text not null,
  nom text not null,
  chef_lieu text,
  is_verified boolean not null default true,
  source text,
  cree_le timestamptz not null default now(),
  unique (region_id, slug)
);

create table if not exists public.arrondissements (
  id bigserial primary key,
  departement_id bigint not null references public.departements(id) on delete cascade,
  slug text not null,
  nom text not null,
  type text not null default 'commune'
    check (type in ('commune', 'arrondissement', 'ville', 'district')),
  is_verified boolean not null default false,
  source text,
  cree_le timestamptz not null default now(),
  unique (departement_id, slug)
);

create table if not exists public.quartiers (
  id bigserial primary key,
  arrondissement_id bigint not null references public.arrondissements(id) on delete cascade,
  slug text not null,
  nom text not null,
  is_verified boolean not null default false,
  source text,
  cree_le timestamptz not null default now(),
  unique (arrondissement_id, slug)
);

-- -----------------------------------------------------------------------------
-- Catalogue de services
-- -----------------------------------------------------------------------------
create table if not exists public.families (
  slug text primary key,
  nom_fr text not null,
  nom_en text,
  icon text not null default 'spark',
  description text,
  sort_order integer not null default 0,
  is_active boolean not null default true
);

create table if not exists public.categories (
  id bigserial primary key,
  slug text not null unique,
  family_slug text not null references public.families(slug) on delete restrict,
  nom_fr text not null,
  nom_en text,
  icon text not null default 'wrench',
  description text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  is_emergency boolean not null default false,
  cree_le timestamptz not null default now()
);

create table if not exists public.subcategories (
  id bigserial primary key,
  category_id bigint not null references public.categories(id) on delete cascade,
  slug text not null,
  nom_fr text not null,
  nom_en text,
  description text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  cree_le timestamptz not null default now(),
  unique (category_id, slug)
);

-- -----------------------------------------------------------------------------
-- Prestataires : plusieurs services, plusieurs zones
-- -----------------------------------------------------------------------------
create table if not exists public.provider_services (
  provider_id uuid not null references public.providers(id) on delete cascade,
  subcategory_id bigint not null references public.subcategories(id) on delete cascade,
  cree_le timestamptz not null default now(),
  primary key (provider_id, subcategory_id)
);

create table if not exists public.provider_zones (
  id bigserial primary key,
  provider_id uuid not null references public.providers(id) on delete cascade,
  scope text not null check (scope in ('region', 'departement', 'arrondissement', 'quartier')),
  region_id bigint references public.regions(id) on delete cascade,
  departement_id bigint references public.departements(id) on delete cascade,
  arrondissement_id bigint references public.arrondissements(id) on delete cascade,
  quartier_id bigint references public.quartiers(id) on delete cascade,
  cree_le timestamptz not null default now(),
  constraint provider_zones_scope_check check (
    (scope = 'region' and region_id is not null and departement_id is null and arrondissement_id is null and quartier_id is null)
    or (scope = 'departement' and departement_id is not null and region_id is null and arrondissement_id is null and quartier_id is null)
    or (scope = 'arrondissement' and arrondissement_id is not null and region_id is null and departement_id is null and quartier_id is null)
    or (scope = 'quartier' and quartier_id is not null and region_id is null and departement_id is null and arrondissement_id is null)
  )
);

-- -----------------------------------------------------------------------------
-- Urgences : guides de premiers gestes et établissements
-- -----------------------------------------------------------------------------
create table if not exists public.emergency_guides (
  slug text primary key,
  title text not null,
  summary text,
  icon text not null default 'alert',
  do_steps jsonb not null default '[]'::jsonb,
  dont_steps jsonb not null default '[]'::jsonb,
  warning text not null default 'Ne remplace pas un médecin.',
  sort_order integer not null default 0,
  is_active boolean not null default true
);

create table if not exists public.emergency_facilities (
  id bigserial primary key,
  nom text not null,
  type text not null check (type in ('hopital', 'clinique', 'centre_sante', 'pharmacie', 'ambulance', 'protection_civile')),
  region_id bigint references public.regions(id) on delete set null,
  departement_id bigint references public.departements(id) on delete set null,
  arrondissement_id bigint references public.arrondissements(id) on delete set null,
  quartier_id bigint references public.quartiers(id) on delete set null,
  region_nom text,
  departement_nom text,
  ville text not null,
  adresse text,
  telephone text,
  telephone_alt text,
  latitude double precision,
  longitude double precision,
  horaires text,
  is_verified boolean not null default false,
  source text,
  cree_le timestamptz not null default now()
);

create unique index if not exists emergency_facilities_nom_ville_idx
  on public.emergency_facilities (nom, ville);

-- -----------------------------------------------------------------------------
-- Colonnes ajoutées aux tables existantes (migration douce)
-- -----------------------------------------------------------------------------
alter table public.requests drop constraint if exists requests_categorie_check;
alter table public.providers drop constraint if exists providers_metier_check;

alter table public.requests drop constraint if exists requests_probleme_check;
alter table public.requests add constraint requests_probleme_check
  check (char_length(probleme) between 2 and 160);

alter table public.requests drop constraint if exists requests_quartier_check;
alter table public.requests add constraint requests_quartier_check
  check (char_length(quartier) between 2 and 80);

alter table public.requests
  add column if not exists region_id bigint references public.regions(id) on delete set null,
  add column if not exists departement_id bigint references public.departements(id) on delete set null,
  add column if not exists arrondissement_id bigint references public.arrondissements(id) on delete set null,
  add column if not exists quartier_id bigint references public.quartiers(id) on delete set null,
  add column if not exists sous_categorie_id bigint references public.subcategories(id) on delete set null,
  add column if not exists categorie_nom text,
  add column if not exists region_nom text,
  add column if not exists departement_nom text,
  add column if not exists arrondissement_nom text,
  add column if not exists is_emergency boolean not null default false,
  add column if not exists emergency_type text,
  add column if not exists needs_transport boolean not null default false;

alter table public.providers
  add column if not exists metier_nom text,
  add column if not exists region_id bigint references public.regions(id) on delete set null,
  add column if not exists departement_id bigint references public.departements(id) on delete set null,
  add column if not exists arrondissement_id bigint references public.arrondissements(id) on delete set null,
  add column if not exists quartier_id bigint references public.quartiers(id) on delete set null,
  add column if not exists type_aideur boolean not null default false;

-- -----------------------------------------------------------------------------
-- Index
-- -----------------------------------------------------------------------------
create index if not exists requests_region_idx on public.requests (region_id);
create index if not exists requests_emergency_idx on public.requests (is_emergency, cree_le desc);
create index if not exists providers_region_idx on public.providers (region_id);
create index if not exists provider_zones_provider_idx on public.provider_zones (provider_id);
create index if not exists provider_zones_quartier_idx on public.provider_zones (quartier_id);
create index if not exists provider_zones_arrondissement_idx on public.provider_zones (arrondissement_id);
create index if not exists provider_zones_departement_idx on public.provider_zones (departement_id);
create index if not exists provider_zones_region_idx on public.provider_zones (region_id);

create unique index if not exists provider_zones_unique_idx on public.provider_zones (
  provider_id,
  scope,
  coalesce(quartier_id, 0::bigint),
  coalesce(arrondissement_id, 0::bigint),
  coalesce(departement_id, 0::bigint),
  coalesce(region_id, 0::bigint)
);
create index if not exists provider_services_provider_idx on public.provider_services (provider_id);
create index if not exists provider_services_subcategory_idx on public.provider_services (subcategory_id);
create index if not exists emergency_facilities_region_idx on public.emergency_facilities (region_id, type);
create index if not exists categories_family_idx on public.categories (family_slug, sort_order);
create index if not exists subcategories_category_idx on public.subcategories (category_id, sort_order);

comment on table public.regions is 'Les 10 régions du Cameroun.';
comment on table public.departements is 'Les 58 départements du Cameroun.';
comment on table public.arrondissements is 'Communes et arrondissements. Les données locales sont à vérifier.';
comment on table public.quartiers is 'Quartiers et villages. Les données locales sont à vérifier.';
comment on table public.provider_zones is 'Zones d intervention déclarées par un prestataire.';


-- =============================================================================
-- FICHIER : supabase\06_v2_functions.sql
-- =============================================================================
-- =============================================================================
-- LIFE CONNECT – V2 NATIONALE
-- 06_v2_functions.sql — RPC mises à jour
-- À exécuter APRÈS 05_v2_schema.sql.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Suivi public : ajoute les noms de catégorie et de zone.
-- -----------------------------------------------------------------------------
create or replace function public.get_request_by_token(p_token uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_req public.requests%rowtype;
  v_provider jsonb;
begin
  select * into v_req
  from public.requests
  where token = p_token;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'not_found');
  end if;

  if v_req.statut in ('nouvelle', 'en_recherche') and v_req.expire_le < now() then
    update public.requests
      set statut = 'expiree'
      where id = v_req.id;
    v_req.statut := 'expiree';
  end if;

  if v_req.provider_id is not null then
    select jsonb_build_object(
      'nom', p.nom,
      'metier', p.metier,
      'metier_nom', coalesce(p.metier_nom, c.nom_fr, initcap(replace(p.metier, '_', ' '))),
      'specialite', p.specialite,
      'photo_url', p.photo_url,
      'note_moyenne', p.note_moyenne,
      'nombre_avis', p.nombre_avis,
      'quartier', p.quartier,
      'whatsapp', p.whatsapp,
      'distance_km', case
        when v_req.latitude is not null and p.latitude is not null
          then round(
            public.haversine_km(
              v_req.latitude, v_req.longitude, p.latitude, p.longitude
            )::numeric,
            1
          )
        else null
      end
    )
    into v_provider
    from public.providers p
    left join public.categories c on c.slug = p.metier
    where p.id = v_req.provider_id;
  end if;

  return jsonb_build_object(
    'ok', true,
    'token', v_req.token,
    'ville', v_req.ville,
    'categorie', v_req.categorie,
    'categorie_nom', coalesce(
      v_req.categorie_nom,
      initcap(replace(v_req.categorie, '_', ' '))
    ),
    'probleme', v_req.probleme,
    'description', v_req.description,
    'quartier', v_req.quartier,
    'region_nom', v_req.region_nom,
    'departement_nom', v_req.departement_nom,
    'arrondissement_nom', v_req.arrondissement_nom,
    'statut', v_req.statut,
    'is_emergency', v_req.is_emergency,
    'emergency_type', v_req.emergency_type,
    'needs_transport', v_req.needs_transport,
    'cree_le', v_req.cree_le,
    'expire_le', v_req.expire_le,
    'assigne_le', v_req.assigne_le,
    'note_donnee', v_req.note_donnee,
    'provider', v_provider
  );
end;
$$;

-- -----------------------------------------------------------------------------
-- Prestataires pertinents pour une demande :
-- même quartier (100), même arrondissement (80), même département (60),
-- même région (40), puis distance, disponibilité et note.
-- Réservé au service_role (administration).
-- -----------------------------------------------------------------------------
create or replace function public.providers_for_request(p_request_id uuid)
returns table (
  id uuid,
  nom text,
  metier text,
  metier_nom text,
  specialite text,
  quartier text,
  quartier_id bigint,
  zone_score integer,
  distance_km double precision,
  note_moyenne numeric,
  nombre_avis integer,
  photo_url text,
  whatsapp text,
  disponible boolean
)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  with req as (
    select * from public.requests where id = p_request_id
  ),
  candidates as (
    select
      p.id,
      p.nom,
      p.metier,
      coalesce(p.metier_nom, c.nom_fr, initcap(replace(p.metier, '_', ' '))) as metier_nom,
      p.specialite,
      p.quartier,
      p.quartier_id,
      case
        when p.quartier_id is not null and p.quartier_id = req.quartier_id then 100
        when exists (
          select 1 from public.provider_zones z
          where z.provider_id = p.id
            and z.scope = 'quartier'
            and z.quartier_id = req.quartier_id
        ) then 100
        when exists (
          select 1 from public.provider_zones z
          where z.provider_id = p.id
            and z.scope = 'arrondissement'
            and z.arrondissement_id = req.arrondissement_id
        ) then 80
        when exists (
          select 1 from public.provider_zones z
          where z.provider_id = p.id
            and z.scope = 'departement'
            and z.departement_id = req.departement_id
        ) then 60
        when exists (
          select 1 from public.provider_zones z
          where z.provider_id = p.id
            and z.scope = 'region'
            and z.region_id = req.region_id
        ) then 40
        else 0
      end as zone_score,
      case
        when req.latitude is not null and p.latitude is not null
          then round(
            public.haversine_km(
              req.latitude, req.longitude, p.latitude, p.longitude
            )::numeric,
            1
          )::double precision
        else null
      end as distance_km,
      p.note_moyenne,
      p.nombre_avis,
      p.photo_url,
      p.whatsapp,
      p.disponible
    from public.providers p
    cross join req
    left join public.categories c on c.slug = p.metier
    where p.statut = 'valide'
      and (
        p.metier = req.categorie
        or exists (
          select 1
          from public.provider_services ps
          join public.subcategories s on s.id = ps.subcategory_id
          where ps.provider_id = p.id
            and s.category_id = (
              select id from public.categories where slug = req.categorie limit 1
            )
        )
      )
  )
  select
    id, nom, metier, metier_nom, specialite, quartier, quartier_id,
    zone_score, distance_km, note_moyenne, nombre_avis, photo_url, whatsapp, disponible
  from candidates
  order by
    zone_score desc,
    disponible desc,
    distance_km asc nulls last,
    note_moyenne desc
  limit 30;
$$;

-- -----------------------------------------------------------------------------
-- Statistiques par région (administration).
-- -----------------------------------------------------------------------------
create or replace function public.admin_stats_by_region()
returns table (
  region_nom text,
  total integer,
  en_attente integer,
  resolues integer,
  urgentes integer
)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select
    coalesce(nullif(q.region_nom, ''), r.nom, 'Non renseigné') as region_nom,
    count(*)::integer as total,
    count(*) filter (where q.statut in ('nouvelle', 'en_recherche'))::integer as en_attente,
    count(*) filter (where q.statut = 'resolue')::integer as resolues,
    count(*) filter (where q.is_emergency)::integer as urgentes
  from public.requests q
  left join public.regions r on r.id = q.region_id
  where q.cree_le > now() - interval '30 days'
  group by 1
  order by total desc;
$$;


-- =============================================================================
-- FICHIER : supabase\07_v2_rls.sql
-- =============================================================================
-- =============================================================================
-- LIFE CONNECT – V2 NATIONALE
-- 07_v2_rls.sql — lecture publique des données de référence
-- À exécuter APRÈS 06_v2_functions.sql.
-- =============================================================================

grant usage on schema public to anon, authenticated;

-- -----------------------------------------------------------------------------
-- Données publiques en lecture seule
-- -----------------------------------------------------------------------------
alter table public.regions enable row level security;
alter table public.departements enable row level security;
alter table public.arrondissements enable row level security;
alter table public.quartiers enable row level security;
alter table public.families enable row level security;
alter table public.categories enable row level security;
alter table public.subcategories enable row level security;
alter table public.emergency_guides enable row level security;
alter table public.emergency_facilities enable row level security;

drop policy if exists regions_public_read on public.regions;
create policy regions_public_read on public.regions
  for select to anon, authenticated using (true);

drop policy if exists departements_public_read on public.departements;
create policy departements_public_read on public.departements
  for select to anon, authenticated using (true);

drop policy if exists arrondissements_public_read on public.arrondissements;
create policy arrondissements_public_read on public.arrondissements
  for select to anon, authenticated using (true);

drop policy if exists quartiers_public_read on public.quartiers;
create policy quartiers_public_read on public.quartiers
  for select to anon, authenticated using (true);

drop policy if exists families_public_read on public.families;
create policy families_public_read on public.families
  for select to anon, authenticated using (true);

drop policy if exists categories_public_read on public.categories;
create policy categories_public_read on public.categories
  for select to anon, authenticated using (is_active = true);

drop policy if exists subcategories_public_read on public.subcategories;
create policy subcategories_public_read on public.subcategories
  for select to anon, authenticated using (is_active = true);

drop policy if exists emergency_guides_public_read on public.emergency_guides;
create policy emergency_guides_public_read on public.emergency_guides
  for select to anon, authenticated using (is_active = true);

drop policy if exists emergency_facilities_public_read on public.emergency_facilities;
create policy emergency_facilities_public_read on public.emergency_facilities
  for select to anon, authenticated using (true);

grant select on public.regions to anon, authenticated;
grant select on public.departements to anon, authenticated;
grant select on public.arrondissements to anon, authenticated;
grant select on public.quartiers to anon, authenticated;
grant select on public.families to anon, authenticated;
grant select on public.categories to anon, authenticated;
grant select on public.subcategories to anon, authenticated;
grant select on public.emergency_guides to anon, authenticated;
grant select on public.emergency_facilities to anon, authenticated;

-- -----------------------------------------------------------------------------
-- Données privées : services et zones des prestataires
-- -----------------------------------------------------------------------------
alter table public.provider_services enable row level security;
alter table public.provider_zones enable row level security;

revoke all on public.provider_services from anon, authenticated;
revoke all on public.provider_zones from anon, authenticated;

-- -----------------------------------------------------------------------------
-- Fonctions
-- -----------------------------------------------------------------------------
revoke all on function public.get_request_by_token(uuid) from public;
grant execute on function public.get_request_by_token(uuid) to anon, authenticated;

revoke all on function public.providers_for_request(uuid) from public;
grant execute on function public.providers_for_request(uuid) to service_role;

revoke all on function public.admin_stats_by_region() from public;
grant execute on function public.admin_stats_by_region() to service_role;


-- =============================================================================
-- FICHIER : supabase\08_v2_geo_seed.sql
-- =============================================================================
-- =============================================================================
-- LIFE CONNECT – V2 NATIONALE
-- 08_v2_geo_seed.sql — 10 régions, 58 départements, villes et quartiers
-- À exécuter APRÈS 07_v2_rls.sql.
--
-- Sources : découpage administratif officiel du Cameroun (10 régions, 58
-- départements). Les quartiers sont une base de départ locale : ils sont
-- marqués is_verified = false et doivent être complétés/validés.
-- =============================================================================

insert into public.regions (slug, nom, chef_lieu, is_verified, source)
values
  ('adamaoua', 'Adamaoua', 'Ngaoundéré', true, 'Découpage administratif du Cameroun'),
  ('centre', 'Centre', 'Yaoundé', true, 'Découpage administratif du Cameroun'),
  ('est', 'Est', 'Bertoua', true, 'Découpage administratif du Cameroun'),
  ('extreme_nord', 'Extrême-Nord', 'Maroua', true, 'Découpage administratif du Cameroun'),
  ('littoral', 'Littoral', 'Douala', true, 'Découpage administratif du Cameroun'),
  ('nord', 'Nord', 'Garoua', true, 'Découpage administratif du Cameroun'),
  ('nord_ouest', 'Nord-Ouest', 'Bamenda', true, 'Découpage administratif du Cameroun'),
  ('ouest', 'Ouest', 'Bafoussam', true, 'Découpage administratif du Cameroun'),
  ('sud', 'Sud', 'Ebolowa', true, 'Découpage administratif du Cameroun'),
  ('sud_ouest', 'Sud-Ouest', 'Buea', true, 'Découpage administratif du Cameroun')
on conflict (slug) do update
  set nom = excluded.nom,
      chef_lieu = excluded.chef_lieu;

insert into public.departements (region_id, slug, nom, chef_lieu, is_verified, source)
select r.id, v.slug, v.nom, v.chef_lieu, true, 'Découpage administratif du Cameroun'
from (
  values
    ('adamaoua', 'djerem', 'Djérem', 'Tibati'),
    ('adamaoua', 'faro_et_deo', 'Faro-et-Déo', 'Tignère'),
    ('adamaoua', 'mayo_banyo', 'Mayo-Banyo', 'Banyo'),
    ('adamaoua', 'mbere', 'Mbéré', 'Meiganga'),
    ('adamaoua', 'vina', 'Vina', 'Ngaoundéré'),

    ('centre', 'haute_sanaga', 'Haute-Sanaga', 'Nanga-Eboko'),
    ('centre', 'lekie', 'Lekié', 'Monatélé'),
    ('centre', 'mbam_et_inoubou', 'Mbam-et-Inoubou', 'Bafia'),
    ('centre', 'mbam_et_kim', 'Mbam-et-Kim', 'Ntui'),
    ('centre', 'mefou_et_afamba', 'Méfou-et-Afamba', 'Mfou'),
    ('centre', 'mefou_et_akono', 'Méfou-et-Akono', 'Ngoumou'),
    ('centre', 'mfoundi', 'Mfoundi', 'Yaoundé'),
    ('centre', 'nyong_et_kelle', 'Nyong-et-Kéllé', 'Eséka'),
    ('centre', 'nyong_et_mfoumou', 'Nyong-et-Mfoumou', 'Akonolinga'),
    ('centre', 'nyong_et_soo', 'Nyong-et-So''o', 'Mbalmayo'),

    ('est', 'boumba_et_ngoko', 'Boumba-et-Ngoko', 'Yokadouma'),
    ('est', 'haut_nyong', 'Haut-Nyong', 'Abong-Mbang'),
    ('est', 'kadey', 'Kadey', 'Batouri'),
    ('est', 'lom_et_djerem', 'Lom-et-Djérem', 'Bertoua'),

    ('extreme_nord', 'diamare', 'Diamaré', 'Maroua'),
    ('extreme_nord', 'logone_et_chari', 'Logone-et-Chari', 'Kousséri'),
    ('extreme_nord', 'mayo_danay', 'Mayo-Danay', 'Yagoua'),
    ('extreme_nord', 'mayo_kani', 'Mayo-Kani', 'Kaélé'),
    ('extreme_nord', 'mayo_sava', 'Mayo-Sava', 'Mora'),
    ('extreme_nord', 'mayo_tsanaga', 'Mayo-Tsanaga', 'Mokolo'),

    ('littoral', 'moungo', 'Moungo', 'Nkongsamba'),
    ('littoral', 'nkam', 'Nkam', 'Yabassi'),
    ('littoral', 'sanaga_maritime', 'Sanaga-Maritime', 'Édéa'),
    ('littoral', 'wouri', 'Wouri', 'Douala'),

    ('nord', 'benoue', 'Bénoué', 'Garoua'),
    ('nord', 'faro', 'Faro', 'Poli'),
    ('nord', 'mayo_louti', 'Mayo-Louti', 'Guider'),
    ('nord', 'mayo_rey', 'Mayo-Rey', 'Tcholliré'),

    ('nord_ouest', 'boyo', 'Boyo', 'Fundong'),
    ('nord_ouest', 'bui', 'Bui', 'Kumbo'),
    ('nord_ouest', 'donga_mantung', 'Donga-Mantung', 'Nkambe'),
    ('nord_ouest', 'menchum', 'Menchum', 'Wum'),
    ('nord_ouest', 'mezam', 'Mezam', 'Bamenda'),
    ('nord_ouest', 'momo', 'Momo', 'Mbengwi'),
    ('nord_ouest', 'ngoketunjia', 'Ngoketunjia', 'Ndop'),

    ('ouest', 'bamboutos', 'Bamboutos', 'Mbouda'),
    ('ouest', 'haut_nkam', 'Haut-Nkam', 'Bafang'),
    ('ouest', 'hauts_plateaux', 'Hauts-Plateaux', 'Baham'),
    ('ouest', 'koung_khi', 'Koung-Khi', 'Bandjoun'),
    ('ouest', 'menoua', 'Menoua', 'Dschang'),
    ('ouest', 'mifi', 'Mifi', 'Bafoussam'),
    ('ouest', 'nde', 'Ndé', 'Bazou'),
    ('ouest', 'noun', 'Noun', 'Foumban'),

    ('sud', 'dja_et_lobo', 'Dja-et-Lobo', 'Sangmélima'),
    ('sud', 'mvila', 'Mvila', 'Ebolowa'),
    ('sud', 'ocean', 'Océan', 'Kribi'),
    ('sud', 'vallee_du_ntem', 'Vallée-du-Ntem', 'Ambam'),

    ('sud_ouest', 'fako', 'Fako', 'Buea'),
    ('sud_ouest', 'koupe_manengouba', 'Koupé-Manengouba', 'Bangem'),
    ('sud_ouest', 'lebialem', 'Lebialem', 'Menji'),
    ('sud_ouest', 'manyu', 'Manyu', 'Mamfe'),
    ('sud_ouest', 'meme', 'Meme', 'Kumba'),
    ('sud_ouest', 'ndian', 'Ndian', 'Mundemba')
) as v(region_slug, slug, nom, chef_lieu)
join public.regions r on r.slug = v.region_slug
on conflict (region_id, slug) do update
  set nom = excluded.nom,
      chef_lieu = excluded.chef_lieu;

-- -----------------------------------------------------------------------------
-- Villes / communes de départ (les arrondissements fins seront ajoutés ensuite)
-- -----------------------------------------------------------------------------
insert into public.arrondissements (departement_id, slug, nom, type, is_verified, source)
select d.id, v.slug, v.nom, v.type, true, 'Chef-lieu / ville principale'
from (
  values
    ('littoral', 'wouri', 'douala', 'Douala', 'ville'),
    ('littoral', 'moungo', 'nkongsamba', 'Nkongsamba', 'commune'),
    ('littoral', 'sanaga_maritime', 'edea', 'Édéa', 'commune'),
    ('littoral', 'nkam', 'yabassi', 'Yabassi', 'commune'),
    ('centre', 'mfoundi', 'yaounde', 'Yaoundé', 'ville'),
    ('ouest', 'mifi', 'bafoussam', 'Bafoussam', 'ville'),
    ('ouest', 'haut_nkam', 'bafang', 'Bafang', 'commune'),
    ('ouest', 'noun', 'foumban', 'Foumban', 'commune'),
    ('ouest', 'menoua', 'dschang', 'Dschang', 'commune'),
    ('nord', 'benoue', 'garoua', 'Garoua', 'ville'),
    ('nord_ouest', 'mezam', 'bamenda', 'Bamenda', 'ville'),
    ('nord_ouest', 'bui', 'kumbo', 'Kumbo', 'commune'),
    ('est', 'lom_et_djerem', 'bertoua', 'Bertoua', 'ville'),
    ('extreme_nord', 'diamare', 'maroua', 'Maroua', 'ville'),
    ('adamaoua', 'vina', 'ngaoundere', 'Ngaoundéré', 'ville'),
    ('sud', 'mvila', 'ebolowa', 'Ebolowa', 'ville'),
    ('sud', 'ocean', 'kribi', 'Kribi', 'ville'),
    ('sud_ouest', 'fako', 'buea', 'Buea', 'ville'),
    ('sud_ouest', 'fako', 'limbe', 'Limbe', 'ville'),
    ('sud_ouest', 'meme', 'kumba', 'Kumba', 'ville')
) as v(region_slug, dep_slug, slug, nom, type)
join public.regions r on r.slug = v.region_slug
join public.departements d on d.region_id = r.id and d.slug = v.dep_slug
on conflict (departement_id, slug) do update
  set nom = excluded.nom,
      type = excluded.type;

-- -----------------------------------------------------------------------------
-- Quartiers principaux (base de départ, à compléter et vérifier)
-- -----------------------------------------------------------------------------
insert into public.quartiers (arrondissement_id, slug, nom, is_verified, source)
select a.id, v.slug, v.nom, false, 'Liste locale à vérifier'
from (
  values
    ('douala', 'akwa', 'Akwa'),
    ('douala', 'bonanjo', 'Bonanjo'),
    ('douala', 'bonapriso', 'Bonapriso'),
    ('douala', 'deido', 'Deïdo'),
    ('douala', 'bepanda', 'Bépanda'),
    ('douala', 'makepe', 'Makepe'),
    ('douala', 'ndokoti', 'Ndokoti'),
    ('douala', 'ndogbong', 'Ndogbong'),
    ('douala', 'kotto', 'Kotto'),
    ('douala', 'bonaberi', 'Bonabéri'),
    ('douala', 'logbessou', 'Logbessou'),
    ('douala', 'pk8', 'PK8'),
    ('douala', 'pk14', 'PK14'),
    ('douala', 'yassa', 'Yassa'),
    ('douala', 'japoma', 'Japoma'),
    ('douala', 'cite_des_palmiers', 'Cité des Palmiers'),
    ('douala', 'new_bell', 'New Bell'),
    ('douala', 'bassa', 'Bassa'),
    ('douala', 'dikolo', 'Dikolo'),
    ('douala', 'nylon', 'Nylon'),

    ('yaounde', 'bastos', 'Bastos'),
    ('yaounde', 'centre_ville', 'Centre-ville'),
    ('yaounde', 'mvog_mbi', 'Mvog-Mbi'),
    ('yaounde', 'mvog_ada', 'Mvog-Ada'),
    ('yaounde', 'nlongkak', 'Nlongkak'),
    ('yaounde', 'biyem_assi', 'Biyem-Assi'),
    ('yaounde', 'mendong', 'Mendong'),
    ('yaounde', 'ngousso', 'Ngousso'),
    ('yaounde', 'etoa_meki', 'Etoa-Meki'),
    ('yaounde', 'ekounou', 'Ekounou'),
    ('yaounde', 'mimboman', 'Mimboman'),
    ('yaounde', 'nsam', 'Nsam'),
    ('yaounde', 'briqueterie', 'Briqueterie'),
    ('yaounde', 'odza', 'Odza'),
    ('yaounde', 'nkolbisson', 'Nkolbisson'),
    ('yaounde', 'emana', 'Emana'),

    ('bafoussam', 'tamdja', 'Tamdja'),
    ('bafoussam', 'djeleng', 'Djeleng'),
    ('bafoussam', 'tougang', 'Tougang'),
    ('bafoussam', 'banengo', 'Banengo'),
    ('bafoussam', 'kamkop', 'Kamkop'),
    ('bafoussam', 'tyo', 'Tyo'),
    ('bafoussam', 'ndiangdam', 'Ndiangdam'),
    ('bafoussam', 'foto', 'Foto'),

    ('garoua', 'rounde_adjia', 'Roumdé Adjia'),
    ('garoua', 'poumpoumre', 'Poumpoumré'),
    ('garoua', 'foulbere', 'Foulbéré'),
    ('garoua', 'djamboutou', 'Djamboutou'),
    ('garoua', 'ouro_labo', 'Ouro Labo'),
    ('garoua', 'yelwa', 'Yelwa'),
    ('garoua', 'bockle', 'Bocklé'),
    ('garoua', 'pitoare', 'Pitoaré'),

    ('bamenda', 'nkwen', 'Nkwen'),
    ('bamenda', 'mankon', 'Mankon'),
    ('bamenda', 'azire', 'Azire'),
    ('bamenda', 'old_town', 'Old Town'),
    ('bamenda', 'up_station', 'Up Station'),
    ('bamenda', 'ntarikon', 'Ntarikon'),
    ('bamenda', 'mile_4', 'Mile 4'),
    ('bamenda', 'mile_8', 'Mile 8'),
    ('bamenda', 'songwa', 'Songwa'),

    ('bertoua', 'nkolbikon', 'Nkolbikon'),
    ('bertoua', 'mokolo', 'Mokolo'),
    ('bertoua', 'tigaza', 'Tigaza'),
    ('bertoua', 'bercail', 'Bercail'),
    ('bertoua', 'ecole', 'École'),
    ('bertoua', 'madagascar', 'Madagascar'),
    ('bertoua', 'nkoumadjap', 'Nkoumadjap'),

    ('maroua', 'domayo', 'Domayo'),
    ('maroua', 'founangue', 'Founangué'),
    ('maroua', 'kakatare', 'Kakataré'),
    ('maroua', 'djarengol', 'Djarengol'),
    ('maroua', 'pont_vert', 'Pont Vert'),
    ('maroua', 'zokok', 'Zokok'),
    ('maroua', 'dougouggui', 'Dougouggui'),

    ('ngaoundere', 'dang', 'Dang'),
    ('ngaoundere', 'baladji_i', 'Baladji I'),
    ('ngaoundere', 'baladji_ii', 'Baladji II'),
    ('ngaoundere', 'mbideng', 'Mbideng'),
    ('ngaoundere', 'bamyanga', 'Bamyanga'),
    ('ngaoundere', 'madagascar', 'Madagascar'),
    ('ngaoundere', 'petit_marche', 'Petit Marché'),

    ('ebolowa', 'angale', 'Angalé'),
    ('ebolowa', 'nkoovos', 'Nko''ovos'),
    ('ebolowa', 'mvog_betsi', 'Mvog-Betsi'),
    ('ebolowa', 'efoulan', 'Efoulan'),
    ('ebolowa', 'ebolowa_centre', 'Ebolowa Centre'),

    ('buea', 'molyko', 'Molyko'),
    ('buea', 'bomaka', 'Bomaka'),
    ('buea', 'mile_17', 'Mile 17'),
    ('buea', 'great_soppo', 'Great Soppo'),
    ('buea', 'small_soppo', 'Small Soppo'),
    ('buea', 'buea_town', 'Buea Town'),
    ('buea', 'bokwango', 'Bokwango'),
    ('buea', 'wokaka', 'Wokaka'),

    ('limbe', 'mile_4', 'Mile 4'),
    ('limbe', 'mile_2', 'Mile 2'),
    ('limbe', 'bota', 'Bota'),
    ('limbe', 'down_beach', 'Down Beach'),
    ('limbe', 'mokundange', 'Mokundange'),
    ('limbe', 'batoke', 'Batoke'),
    ('limbe', 'idenau', 'Idenau'),

    ('kribi', 'mboamanga', 'Mboamanga'),
    ('kribi', 'dombe', 'Dombé'),
    ('kribi', 'ngoye', 'Ngoyé'),
    ('kribi', 'talla', 'Talla'),
    ('kribi', 'mpangou', 'Mpangou'),
    ('kribi', 'bongandoue', 'Bongandoué'),

    ('bafang', 'bafang_centre', 'Bafang Centre'),
    ('bafang', 'babong', 'Babong'),
    ('bafang', 'bapa', 'Bapa'),
    ('bafang', 'ndoungue', 'Ndoungue'),
    ('bafang', 'bafang_ville', 'Bafang Ville')
) as v(city_slug, slug, nom)
join public.arrondissements a on a.slug = v.city_slug
on conflict (arrondissement_id, slug) do update
  set nom = excluded.nom;


-- =============================================================================
-- FICHIER : supabase\09_v2_catalog_seed.sql
-- =============================================================================
-- =============================================================================
-- LIFE CONNECT – V2 NATIONALE
-- 09_v2_catalog_seed.sql — familles, catégories et sous-catégories
-- À exécuter APRÈS 08_v2_geo_seed.sql.
-- Ces données sont administratives : l'admin peut ensuite les modifier.
-- =============================================================================

insert into public.families (slug, nom_fr, nom_en, icon, description, sort_order)
values
  ('urgence_sante', 'Urgence & santé', 'Emergency & health', 'alert', 'Urgences, premiers gestes, soins à domicile', 1),
  ('auto_moto', 'Auto & moto', 'Auto & moto', 'wrench', 'Mécanique, dépannage, transport', 2),
  ('maison_construction', 'Maison & construction', 'Home & construction', 'bolt', 'Plomberie, électricité, bâtiment, froid', 3),
  ('numerique_reseau', 'Numérique & réseau', 'Digital & network', 'wifi', 'Wi-Fi, téléphone, ordinateur, TV', 4),
  ('famille_education', 'Famille & éducation', 'Family & education', 'user', 'Cours, nounou, aide à domicile', 5),
  ('beaute_mode', 'Beauté & mode', 'Beauty & fashion', 'spark', 'Coiffure, couture, maquillage', 6),
  ('evenements_restauration', 'Événements & restauration', 'Events & catering', 'star', 'Traiteur, photo, sonorisation', 7),
  ('agriculture_elevage', 'Agriculture & élevage', 'Agriculture & livestock', 'shield', 'Vétérinaire, champ, tracteur', 8),
  ('administratif_juridique', 'Administratif & juridique', 'Admin & legal', 'shield', 'Démarches, traduction, conseil', 9),
  ('transport_livraison', 'Transport & livraison', 'Transport & delivery', 'send', 'Coursier, camion, taxi, moto', 10),
  ('autre', 'Autre besoin', 'Other need', 'search', 'Un besoin qui ne rentre dans aucune case', 11)
on conflict (slug) do update
  set nom_fr = excluded.nom_fr,
      nom_en = excluded.nom_en,
      icon = excluded.icon,
      description = excluded.description,
      sort_order = excluded.sort_order;

insert into public.categories
  (family_slug, slug, nom_fr, nom_en, icon, description, sort_order, is_emergency)
values
  -- Urgence & santé
  ('urgence_sante', 'urgences', 'Urgences', 'Emergencies', 'alert', 'Enfant blessé, accident, saignement, brûlure, accouchement…', 1, true),
  ('urgence_sante', 'sante_domicile', 'Santé à domicile', 'Home health', 'alert', 'Infirmier, sage-femme, kiné, pharmacie, ambulancier privé', 2, false),

  -- Auto & moto
  ('auto_moto', 'mecanicien', 'Mécanicien', 'Mechanic', 'wrench', 'Voiture et moto : moteur, freins, diagnostic', 1, false),
  ('auto_moto', 'electricien_auto', 'Électricien auto', 'Auto electrician', 'bolt', 'Batterie, alternateur, démarreur, feux', 2, false),
  ('auto_moto', 'vulcanisateur', 'Vulcanisateur', 'Tire repair', 'wrench', 'Pneus, chambres à air, valves', 3, false),
  ('auto_moto', 'depannage_remorquage', 'Dépannage / remorquage', 'Towing', 'alert', 'Remorquage, panne sur route, carburant', 4, false),
  ('auto_moto', 'carrossier', 'Carrossier', 'Bodywork', 'wrench', 'Tôle, peinture, pare-chocs', 5, false),
  ('auto_moto', 'lavage_auto', 'Lavage auto', 'Car wash', 'spark', 'Lavage, intérieur, lustrage', 6, false),
  ('auto_moto', 'transport_vehicule', 'Transport de personnes', 'Passenger transport', 'send', 'Taxi, location, chauffeur', 7, false),

  -- Maison & construction
  ('maison_construction', 'depanneur', 'Dépannage maison', 'Home repair', 'bolt', 'Plomberie, électricité, serrure, froid', 1, false),
  ('maison_construction', 'plombier', 'Plombier', 'Plumber', 'bolt', 'Fuites, installations, chauffe-eau, WC', 2, false),
  ('maison_construction', 'electricien', 'Électricien', 'Electrician', 'bolt', 'Pannes, installations, tableaux', 3, false),
  ('maison_construction', 'macon', 'Maçon', 'Mason', 'wrench', 'Fondations, murs, dalles', 4, false),
  ('maison_construction', 'menuisier', 'Menuisier', 'Carpenter', 'wrench', 'Meubles, portes, fenêtres', 5, false),
  ('maison_construction', 'soudeur', 'Soudeur', 'Welder', 'bolt', 'Grilles, portails, structures', 6, false),
  ('maison_construction', 'peintre', 'Peintre', 'Painter', 'spark', 'Intérieur, extérieur, façades', 7, false),
  ('maison_construction', 'carreleur', 'Carreleur', 'Tiler', 'wrench', 'Sols, murs, terrasses', 8, false),
  ('maison_construction', 'serrurier', 'Serrurier', 'Locksmith', 'shield', 'Ouverture, changement, blindage', 9, false),
  ('maison_construction', 'vitrier', 'Vitrier', 'Glazier', 'wrench', 'Vitres, miroirs, douches', 10, false),
  ('maison_construction', 'toiture', 'Toiture', 'Roofing', 'bolt', 'Tôles, étanchéité, charpente', 11, false),
  ('maison_construction', 'froid_clim', 'Froid / climatisation', 'Refrigeration', 'bolt', 'Frigo, climatisation, chambre froide', 12, false),
  ('maison_construction', 'solaire', 'Panneaux solaires', 'Solar', 'spark', 'Installation, batteries, entretien', 13, false),
  ('maison_construction', 'groupe_electrogene', 'Groupe électrogène', 'Generator', 'bolt', 'Installation, entretien, réparation', 14, false),
  ('maison_construction', 'forage_puits', 'Forage / puits', 'Water drilling', 'bolt', 'Forage, pompe, entretien', 15, false),
  ('maison_construction', 'nettoyage', 'Nettoyage', 'Cleaning', 'spark', 'Maison, bureau, tapis, vitres', 16, false),
  ('maison_construction', 'jardinier', 'Jardinier', 'Gardener', 'spark', 'Entretien, taille, gazon', 17, false),
  ('maison_construction', 'demenagement', 'Déménagement', 'Moving', 'send', 'Déménagement, emballage, meubles', 18, false),
  ('maison_construction', 'deratisation', 'Dératisation', 'Pest control', 'shield', 'Rats, insectes, termites', 19, false),

  -- Numérique & réseau
  ('numerique_reseau', 'technicien', 'Technicien numérique', 'IT technician', 'wifi', 'Wi-Fi, téléphone, ordinateur, TV', 1, false),
  ('numerique_reseau', 'wifi_reseau', 'Wi-Fi / réseau', 'Network', 'wifi', 'Installation, panne, configuration', 2, false),
  ('numerique_reseau', 'telephone', 'Téléphone', 'Phone repair', 'wifi', 'Écran, batterie, logiciel', 3, false),
  ('numerique_reseau', 'ordinateur', 'Ordinateur', 'Computer', 'wifi', 'Panne, installation, virus, récupération', 4, false),
  ('numerique_reseau', 'tv_antenne', 'TV / antenne', 'TV', 'wifi', 'Antenne, décodeur, installation', 5, false),
  ('numerique_reseau', 'imprimante', 'Imprimante', 'Printer', 'wifi', 'Panne, installation, cartouche', 6, false),
  ('numerique_reseau', 'cameras', 'Caméras de surveillance', 'CCTV', 'shield', 'Installation, configuration, maintenance', 7, false),
  ('numerique_reseau', 'dev_graphiste', 'Développeur / graphiste', 'Developer', 'spark', 'Site web, application, logo, flyer', 8, false),

  -- Famille & éducation
  ('famille_education', 'cours_domicile', 'Cours à domicile', 'Home tutoring', 'user', 'Primaire, secondaire, université, langues', 1, false),
  ('famille_education', 'repetiteur', 'Répétiteur', 'Tutor', 'user', 'Maths, physique, français, anglais', 2, false),
  ('famille_education', 'nounou', 'Nounou', 'Nanny', 'user', 'Garde d’enfants, aide aux devoirs', 3, false),
  ('famille_education', 'aide_domicile', 'Aide à domicile', 'Home help', 'user', 'Ménage, cuisine, accompagnement', 4, false),

  -- Beauté & mode
  ('beaute_mode', 'coiffeur', 'Coiffeur', 'Hairdresser', 'spark', 'Homme, femme, enfant, à domicile', 1, false),
  ('beaute_mode', 'tailleur', 'Tailleur / couturier', 'Tailor', 'spark', 'Habits, retouches, uniformes', 2, false),
  ('beaute_mode', 'maquilleur', 'Maquilleur', 'Makeup artist', 'spark', 'Mariage, soirée, photo', 3, false),
  ('beaute_mode', 'barbier', 'Barbier', 'Barber', 'spark', 'À domicile, événement', 4, false),

  -- Événements & restauration
  ('evenements_restauration', 'traiteur', 'Traiteur', 'Caterer', 'star', 'Mariage, buffet, entreprise', 1, false),
  ('evenements_restauration', 'photographe', 'Photographe', 'Photographer', 'star', 'Mariage, portrait, événement', 2, false),
  ('evenements_restauration', 'dj_sono', 'DJ / sonorisation', 'DJ', 'star', 'DJ, sonorisation, éclairage', 3, false),
  ('evenements_restauration', 'baches_chaises', 'Bâches / chaises', 'Event rental', 'star', 'Bâches, chaises, tentes', 4, false),
  ('evenements_restauration', 'cuisinier', 'Cuisinier', 'Cook', 'star', 'À domicile, événement', 5, false),

  -- Agriculture & élevage
  ('agriculture_elevage', 'veterinaire', 'Vétérinaire', 'Veterinarian', 'shield', 'Consultation, vaccination, urgence', 1, false),
  ('agriculture_elevage', 'ouvrier_agricole', 'Ouvrier agricole', 'Farm worker', 'shield', 'Champ, récolte, plantation', 2, false),
  ('agriculture_elevage', 'tracteur', 'Tracteur', 'Tractor', 'wrench', 'Labour, transport', 3, false),
  ('agriculture_elevage', 'produits_agricoles', 'Produits agricoles', 'Farm products', 'shield', 'Vente, livraison', 4, false),

  -- Administratif & juridique
  ('administratif_juridique', 'ecrivain_public', 'Écrivain public', 'Public writer', 'shield', 'Lettres, dossiers, demandes', 1, false),
  ('administratif_juridique', 'aide_demarches', 'Aide aux démarches', 'Admin help', 'shield', 'Administration, visa, passeport', 2, false),
  ('administratif_juridique', 'huissier', 'Huissier', 'Bailiff', 'shield', 'Constat, signification', 3, false),
  ('administratif_juridique', 'avocat', 'Avocat', 'Lawyer', 'shield', 'Conseil, procédure', 4, false),
  ('administratif_juridique', 'traducteur', 'Traducteur', 'Translator', 'shield', 'Français-anglais, documents', 5, false),

  -- Transport & livraison
  ('transport_livraison', 'coursier', 'Coursier', 'Courier', 'send', 'Documents, colis, repas', 1, false),
  ('transport_livraison', 'camion', 'Camion', 'Truck', 'send', 'Déménagement, fret, chantier', 2, false),
  ('transport_livraison', 'bus', 'Bus', 'Bus', 'send', 'Location, groupe', 3, false),
  ('transport_livraison', 'taxi_moto', 'Taxi / moto-taxi', 'Taxi', 'send', 'Taxi, moto-taxi, transport urgent', 4, false),

  -- Autre
  ('autre', 'autre_besoin', 'Autre besoin', 'Other need', 'search', 'Décrivez librement votre besoin', 1, false)
on conflict (slug) do update
  set family_slug = excluded.family_slug,
      nom_fr = excluded.nom_fr,
      nom_en = excluded.nom_en,
      icon = excluded.icon,
      description = excluded.description,
      sort_order = excluded.sort_order,
      is_emergency = excluded.is_emergency;

insert into public.subcategories (category_id, slug, nom_fr, nom_en, sort_order)
select c.id, v.slug, v.nom_fr, v.nom_en, v.sort_order
from (
  values
    ('urgences', 'enfant_blesse', 'Enfant blessé / malade', 'Injured or sick child', 1),
    ('urgences', 'accident_route', 'Accident de la route', 'Road accident', 2),
    ('urgences', 'saignement', 'Saignement important', 'Severe bleeding', 3),
    ('urgences', 'brulure', 'Brûlure', 'Burn', 4),
    ('urgences', 'accouchement', 'Accouchement', 'Childbirth', 5),
    ('urgences', 'intoxication_morsure', 'Intoxication / morsure', 'Poisoning / bite', 6),
    ('urgences', 'etouffement', 'Étouffement', 'Choking', 7),
    ('urgences', 'malaise', 'Malaise', 'Fainting', 8),
    ('urgences', 'incendie', 'Incendie', 'Fire', 9),
    ('urgences', 'agression', 'Agression', 'Assault', 10),

    ('sante_domicile', 'infirmier', 'Infirmier à domicile', 'Home nurse', 1),
    ('sante_domicile', 'sage_femme', 'Sage-femme', 'Midwife', 2),
    ('sante_domicile', 'kine', 'Kinésithérapeute', 'Physiotherapist', 3),
    ('sante_domicile', 'pharmacie', 'Pharmacie', 'Pharmacy', 4),
    ('sante_domicile', 'garde_malade', 'Garde-malade', 'Caregiver', 5),
    ('sante_domicile', 'ambulancier_prive', 'Ambulancier privé', 'Private ambulance', 6),
    ('sante_domicile', 'medecin_domicile', 'Médecin à domicile', 'Home doctor', 7),

    ('mecanicien', 'mecanique_generale', 'Mécanique générale', 'General mechanics', 1),
    ('mecanicien', 'freins', 'Freins', 'Brakes', 2),
    ('mecanicien', 'moteur', 'Moteur', 'Engine', 3),
    ('mecanicien', 'boite_vitesse', 'Boîte de vitesses', 'Gearbox', 4),
    ('mecanicien', 'moto', 'Moto', 'Motorcycle', 5),
    ('mecanicien', 'diagnostic', 'Diagnostic', 'Diagnosis', 6),

    ('electricien_auto', 'batterie', 'Batterie', 'Battery', 1),
    ('electricien_auto', 'alternateur', 'Alternateur', 'Alternator', 2),
    ('electricien_auto', 'demarreur', 'Démarreur', 'Starter', 3),
    ('electricien_auto', 'feux', 'Feux', 'Lights', 4),

    ('vulcanisateur', 'pneu', 'Pneu', 'Tire', 1),
    ('vulcanisateur', 'chambre_a_air', 'Chambre à air', 'Inner tube', 2),
    ('vulcanisateur', 'valve', 'Valve', 'Valve', 3),

    ('depannage_remorquage', 'remorquage', 'Remorquage', 'Towing', 1),
    ('depannage_remorquage', 'depannage_sur_route', 'Dépannage sur route', 'Roadside repair', 2),
    ('depannage_remorquage', 'carburant', 'Carburant', 'Fuel', 3),

    ('carrossier', 'tole', 'Tôle', 'Body panels', 1),
    ('carrossier', 'peinture', 'Peinture', 'Paint', 2),
    ('carrossier', 'pare_chocs', 'Pare-chocs', 'Bumper', 3),

    ('lavage_auto', 'lavage_simple', 'Lavage simple', 'Basic wash', 1),
    ('lavage_auto', 'nettoyage_interieur', 'Nettoyage intérieur', 'Interior cleaning', 2),
    ('lavage_auto', 'lustrage', 'Lustrage', 'Polishing', 3),

    ('transport_vehicule', 'taxi', 'Taxi', 'Taxi', 1),
    ('transport_vehicule', 'moto_taxi', 'Moto-taxi', 'Moto taxi', 2),
    ('transport_vehicule', 'location_vehicule', 'Location de véhicule', 'Car rental', 3),
    ('transport_vehicule', 'chauffeur', 'Chauffeur', 'Driver', 4),

    ('depanneur', 'plomberie', 'Plomberie', 'Plumbing', 1),
    ('depanneur', 'electricite', 'Électricité', 'Electricity', 2),
    ('depanneur', 'serrure', 'Serrure', 'Lock', 3),
    ('depanneur', 'froid_clim', 'Froid / climatisation', 'Refrigeration', 4),

    ('plombier', 'fuite', 'Fuite', 'Leak', 1),
    ('plombier', 'installation', 'Installation', 'Installation', 2),
    ('plombier', 'chauffe_eau', 'Chauffe-eau', 'Water heater', 3),
    ('plombier', 'wc', 'WC / sanitaires', 'Toilet', 4),

    ('electricien', 'panne', 'Panne', 'Breakdown', 1),
    ('electricien', 'installation', 'Installation', 'Installation', 2),
    ('electricien', 'tableau', 'Tableau électrique', 'Fuse board', 3),
    ('electricien', 'groupe', 'Groupe électrogène', 'Generator', 4),

    ('macon', 'fondation', 'Fondation', 'Foundation', 1),
    ('macon', 'mur', 'Mur', 'Wall', 2),
    ('macon', 'dalle', 'Dalle', 'Slab', 3),
    ('macon', 'carrelage', 'Carrelage', 'Tiling', 4),

    ('menuisier', 'meuble', 'Meuble', 'Furniture', 1),
    ('menuisier', 'porte', 'Porte', 'Door', 2),
    ('menuisier', 'fenetre', 'Fenêtre', 'Window', 3),

    ('soudeur', 'grille', 'Grille', 'Grille', 1),
    ('soudeur', 'portail', 'Portail', 'Gate', 2),
    ('soudeur', 'structure', 'Structure', 'Structure', 3),

    ('peintre', 'interieur', 'Intérieur', 'Interior', 1),
    ('peintre', 'exterieur', 'Extérieur', 'Exterior', 2),
    ('peintre', 'facade', 'Façade', 'Facade', 3),

    ('carreleur', 'sol', 'Sol', 'Floor', 1),
    ('carreleur', 'mur', 'Mur', 'Wall', 2),
    ('carreleur', 'terrasse', 'Terrasse', 'Terrace', 3),

    ('serrurier', 'ouverture', 'Ouverture de porte', 'Lock opening', 1),
    ('serrurier', 'changement', 'Changement de serrure', 'Lock replacement', 2),
    ('serrurier', 'blindage', 'Blindage', 'Reinforcement', 3),

    ('vitrier', 'vitre', 'Vitre', 'Glass pane', 1),
    ('vitrier', 'miroir', 'Miroir', 'Mirror', 2),
    ('vitrier', 'douche', 'Douche', 'Shower glass', 3),

    ('toiture', 'tole', 'Tôle', 'Roof sheet', 1),
    ('toiture', 'etancheite', 'Étanchéité', 'Waterproofing', 2),
    ('toiture', 'charpente', 'Charpente', 'Frame', 3),

    ('froid_clim', 'frigo', 'Frigo', 'Fridge', 1),
    ('froid_clim', 'climatisation', 'Climatisation', 'Air conditioning', 2),
    ('froid_clim', 'chambre_froide', 'Chambre froide', 'Cold room', 3),

    ('solaire', 'installation', 'Installation', 'Installation', 1),
    ('solaire', 'batterie', 'Batterie', 'Battery', 2),
    ('solaire', 'entretien', 'Entretien', 'Maintenance', 3),

    ('groupe_electrogene', 'installation', 'Installation', 'Installation', 1),
    ('groupe_electrogene', 'entretien', 'Entretien', 'Maintenance', 2),
    ('groupe_electrogene', 'reparation', 'Réparation', 'Repair', 3),

    ('forage_puits', 'forage', 'Forage', 'Drilling', 1),
    ('forage_puits', 'pompe', 'Pompe', 'Pump', 2),
    ('forage_puits', 'entretien', 'Entretien', 'Maintenance', 3),

    ('nettoyage', 'maison', 'Maison', 'House', 1),
    ('nettoyage', 'bureau', 'Bureau', 'Office', 2),
    ('nettoyage', 'tapis', 'Tapis', 'Carpet', 3),
    ('nettoyage', 'vitres', 'Vitres', 'Windows', 4),

    ('jardinier', 'entretien', 'Entretien', 'Maintenance', 1),
    ('jardinier', 'taille', 'Taille', 'Pruning', 2),
    ('jardinier', 'gazon', 'Gazon', 'Lawn', 3),

    ('demenagement', 'demenagement', 'Déménagement', 'Moving', 1),
    ('demenagement', 'emballage', 'Emballage', 'Packing', 2),
    ('demenagement', 'transport_meubles', 'Transport de meubles', 'Furniture transport', 3),

    ('deratisation', 'rats', 'Rats', 'Rats', 1),
    ('deratisation', 'insectes', 'Insectes', 'Insects', 2),
    ('deratisation', 'termites', 'Termites', 'Termites', 3),

    ('technicien', 'wifi', 'Wi-Fi', 'Wi-Fi', 1),
    ('technicien', 'telephone', 'Téléphone', 'Phone', 2),
    ('technicien', 'ordinateur', 'Ordinateur', 'Computer', 3),
    ('technicien', 'tv', 'TV', 'TV', 4),
    ('technicien', 'imprimante', 'Imprimante', 'Printer', 5),

    ('wifi_reseau', 'installation', 'Installation', 'Installation', 1),
    ('wifi_reseau', 'panne', 'Panne', 'Breakdown', 2),
    ('wifi_reseau', 'configuration', 'Configuration', 'Configuration', 3),

    ('telephone', 'ecran', 'Écran', 'Screen', 1),
    ('telephone', 'batterie', 'Batterie', 'Battery', 2),
    ('telephone', 'logiciel', 'Logiciel', 'Software', 3),

    ('ordinateur', 'panne', 'Panne', 'Breakdown', 1),
    ('ordinateur', 'installation', 'Installation', 'Installation', 2),
    ('ordinateur', 'virus', 'Virus', 'Virus', 3),
    ('ordinateur', 'recuperation', 'Récupération de données', 'Data recovery', 4),

    ('tv_antenne', 'antenne', 'Antenne', 'Antenna', 1),
    ('tv_antenne', 'decodeur', 'Décodeur', 'Decoder', 2),
    ('tv_antenne', 'installation', 'Installation', 'Installation', 3),

    ('imprimante', 'panne', 'Panne', 'Breakdown', 1),
    ('imprimante', 'installation', 'Installation', 'Installation', 2),
    ('imprimante', 'cartouche', 'Cartouche', 'Cartridge', 3),

    ('cameras', 'installation', 'Installation', 'Installation', 1),
    ('cameras', 'configuration', 'Configuration', 'Configuration', 2),
    ('cameras', 'maintenance', 'Maintenance', 'Maintenance', 3),

    ('dev_graphiste', 'site_web', 'Site web', 'Website', 1),
    ('dev_graphiste', 'application', 'Application', 'App', 2),
    ('dev_graphiste', 'logo', 'Logo', 'Logo', 3),
    ('dev_graphiste', 'flyer', 'Flyer / affiche', 'Flyer', 4),

    ('cours_domicile', 'primaire', 'Primaire', 'Primary', 1),
    ('cours_domicile', 'secondaire', 'Secondaire', 'Secondary', 2),
    ('cours_domicile', 'universite', 'Université', 'University', 3),
    ('cours_domicile', 'langues', 'Langues', 'Languages', 4),

    ('repetiteur', 'maths', 'Maths', 'Maths', 1),
    ('repetiteur', 'physique', 'Physique', 'Physics', 2),
    ('repetiteur', 'francais', 'Français', 'French', 3),
    ('repetiteur', 'anglais', 'Anglais', 'English', 4),

    ('nounou', 'nounou', 'Nounou', 'Nanny', 1),
    ('nounou', 'garde_enfants', 'Garde d’enfants', 'Childcare', 2),
    ('nounou', 'aide_devoirs', 'Aide aux devoirs', 'Homework help', 3),

    ('aide_domicile', 'menage', 'Ménage', 'Cleaning', 1),
    ('aide_domicile', 'cuisine', 'Cuisine', 'Cooking', 2),
    ('aide_domicile', 'accompagnement', 'Accompagnement', 'Support', 3),

    ('coiffeur', 'homme', 'Homme', 'Men', 1),
    ('coiffeur', 'femme', 'Femme', 'Women', 2),
    ('coiffeur', 'enfant', 'Enfant', 'Children', 3),
    ('coiffeur', 'domicile', 'À domicile', 'At home', 4),

    ('tailleur', 'habit', 'Habit', 'Outfit', 1),
    ('tailleur', 'retouche', 'Retouche', 'Alteration', 2),
    ('tailleur', 'uniforme', 'Uniforme', 'Uniform', 3),

    ('maquilleur', 'mariage', 'Mariage', 'Wedding', 1),
    ('maquilleur', 'soiree', 'Soirée', 'Evening', 2),
    ('maquilleur', 'photo', 'Photo', 'Photo', 3),

    ('barbier', 'domicile', 'À domicile', 'At home', 1),
    ('barbier', 'evenement', 'Événement', 'Event', 2),

    ('traiteur', 'mariage', 'Mariage', 'Wedding', 1),
    ('traiteur', 'buffet', 'Buffet', 'Buffet', 2),
    ('traiteur', 'entreprise', 'Entreprise', 'Corporate', 3),

    ('photographe', 'mariage', 'Mariage', 'Wedding', 1),
    ('photographe', 'portrait', 'Portrait', 'Portrait', 2),
    ('photographe', 'evenement', 'Événement', 'Event', 3),

    ('dj_sono', 'dj', 'DJ', 'DJ', 1),
    ('dj_sono', 'sonorisation', 'Sonorisation', 'Sound system', 2),
    ('dj_sono', 'eclairage', 'Éclairage', 'Lighting', 3),

    ('baches_chaises', 'baches', 'Bâches', 'Tarpaulins', 1),
    ('baches_chaises', 'chaises', 'Chaises', 'Chairs', 2),
    ('baches_chaises', 'tentes', 'Tentes', 'Tents', 3),

    ('cuisinier', 'domicile', 'À domicile', 'At home', 1),
    ('cuisinier', 'evenement', 'Événement', 'Event', 2),

    ('veterinaire', 'consultation', 'Consultation', 'Consultation', 1),
    ('veterinaire', 'vaccination', 'Vaccination', 'Vaccination', 2),
    ('veterinaire', 'urgence', 'Urgence', 'Emergency', 3),

    ('ouvrier_agricole', 'champ', 'Travail aux champs', 'Field work', 1),
    ('ouvrier_agricole', 'recolte', 'Récolte', 'Harvest', 2),
    ('ouvrier_agricole', 'plantation', 'Plantation', 'Planting', 3),

    ('tracteur', 'labour', 'Labour', 'Ploughing', 1),
    ('tracteur', 'transport', 'Transport', 'Transport', 2),

    ('produits_agricoles', 'vente', 'Vente', 'Sale', 1),
    ('produits_agricoles', 'livraison', 'Livraison', 'Delivery', 2),

    ('ecrivain_public', 'lettre', 'Lettre', 'Letter', 1),
    ('ecrivain_public', 'dossier', 'Dossier', 'File', 2),
    ('ecrivain_public', 'demande', 'Demande', 'Request', 3),

    ('aide_demarches', 'administration', 'Administration', 'Administration', 1),
    ('aide_demarches', 'visa', 'Visa', 'Visa', 2),
    ('aide_demarches', 'passeport', 'Passeport', 'Passport', 3),

    ('huissier', 'constat', 'Constat', 'Report', 1),
    ('huissier', 'signification', 'Signification', 'Service', 2),

    ('avocat', 'conseil', 'Conseil', 'Advice', 1),
    ('avocat', 'procedure', 'Procédure', 'Procedure', 2),

    ('traducteur', 'francais_anglais', 'Français-anglais', 'French-English', 1),
    ('traducteur', 'documents', 'Documents', 'Documents', 2),

    ('coursier', 'documents', 'Documents', 'Documents', 1),
    ('coursier', 'colis', 'Colis', 'Parcel', 2),
    ('coursier', 'repas', 'Repas', 'Meal', 3),

    ('camion', 'demenagement', 'Déménagement', 'Moving', 1),
    ('camion', 'fret', 'Fret', 'Freight', 2),
    ('camion', 'chantier', 'Chantier', 'Construction site', 3),

    ('bus', 'location_bus', 'Location de bus', 'Bus rental', 1),
    ('bus', 'groupe', 'Transport de groupe', 'Group transport', 2),

    ('taxi_moto', 'taxi', 'Taxi', 'Taxi', 1),
    ('taxi_moto', 'moto_taxi', 'Moto-taxi', 'Moto taxi', 2),
    ('taxi_moto', 'transport_urgent', 'Transport urgent', 'Urgent transport', 3),

    ('autre_besoin', 'autre', 'Autre', 'Other', 1)
) as v(category_slug, slug, nom_fr, nom_en, sort_order)
join public.categories c on c.slug = v.category_slug
on conflict (category_id, slug) do update
  set nom_fr = excluded.nom_fr,
      nom_en = excluded.nom_en,
      sort_order = excluded.sort_order;

-- -----------------------------------------------------------------------------
-- Compatibilité avec les anciennes données
-- -----------------------------------------------------------------------------
update public.requests q
set categorie_nom = c.nom_fr
from public.categories c
where q.categorie = c.slug
  and q.categorie_nom is null;

update public.providers p
set metier_nom = c.nom_fr
from public.categories c
where p.metier = c.slug
  and p.metier_nom is null;

update public.providers
set type_aideur = true
where metier in ('taxi_moto', 'transport_vehicule', 'coursier', 'camion', 'bus');


-- =============================================================================
-- FICHIER : supabase\10_v2_emergency_seed.sql
-- =============================================================================
-- =============================================================================
-- LIFE CONNECT – V2 NATIONALE
-- 10_v2_emergency_seed.sql — guides d'urgence et établissements de santé
-- À exécuter APRÈS 09_v2_catalog_seed.sql.
--
-- Les guides sont des premiers gestes généraux. Ils ne remplacent pas un
-- médecin. Les établissements sont listés sans numéro de téléphone tant que
-- le numéro n'a pas été vérifié : l'admin doit les compléter.
-- =============================================================================

insert into public.emergency_guides
  (slug, title, summary, icon, do_steps, dont_steps, warning, sort_order)
values
  (
    'enfant_blesse',
    'Enfant blessé ou malade',
    'Un enfant tombé, fiévreux ou blessé : restez calme et vérifiez d’abord sa respiration.',
    'alert',
    jsonb_build_array(
      'Mettez l’enfant en sécurité, à l’écart du danger.',
      'Parlez-lui doucement et vérifiez s’il répond et s’il respire.',
      'Appelez le 119 (SAMU) ou le 117 (police) selon la situation.',
      'Si l’enfant saigne, appuyez fort sur la plaie avec un linge propre.',
      'Gardez-le au chaud et rassurez-le jusqu’aux secours.'
    ),
    jsonb_build_array(
      'Ne le déplacez pas s’il est tombé de haut ou se plaint du dos ou du cou.',
      'Ne lui donnez pas à manger ou à boire s’il est inconscient ou somnolent.',
      'Ne lui donnez aucun médicament sans l’avis d’un soignant.',
      'Ne le secouez pas et ne le giflez pas pour le réveiller.'
    ),
    'Ne remplace pas un médecin. En cas de doute, appelez le 119.',
    1
  ),
  (
    'accident_route',
    'Accident de la route',
    'Protéger la zone, alerter les secours, ne pas aggraver les blessures.',
    'alert',
    jsonb_build_array(
      'Coupez le contact du véhicule si vous pouvez le faire sans danger.',
      'Allumez les feux de détresse et éloignez les autres personnes de la route.',
      'Appelez le 117 (police), le 118 (pompiers) ou le 119 (SAMU).',
      'Parlez aux blessés, couvrez-les et rassurez-les.',
      'Si une personne saigne beaucoup, appuyez sur la plaie avec un linge propre.'
    ),
    jsonb_build_array(
      'Ne déplacez pas un blessé sauf danger immédiat (feu, explosion).',
      'Ne retirez pas un casque de moto sauf si la personne ne respire plus.',
      'Ne donnez pas à boire à un blessé.',
      'Ne filmez pas et ne gênez pas les secours.'
    ),
    'Ne remplace pas un médecin. En cas de doute, appelez le 119.',
    2
  ),
  (
    'saignement',
    'Saignement important',
    'Appuyer fort, ne pas retirer l’objet planté, alerter.',
    'alert',
    jsonb_build_array(
      'Allongez la personne et surélevez doucement la partie qui saigne.',
      'Appuyez fortement sur la plaie avec un linge propre ou vos mains gantées.',
      'Maintenez la pression sans relâcher pendant au moins 10 minutes.',
      'Si le sang traverse, ajoutez un autre linge par-dessus.',
      'Appelez le 119 ou faites appeler un proche.'
    ),
    jsonb_build_array(
      'Ne retirez pas un objet planté dans la plaie.',
      'N’utilisez pas de garrot sauf si vous êtes formé et que le saignement est incontrôlable.',
      'Ne mettez pas de terre, de cendre ou de plante sur la plaie.',
      'Ne donnez pas à boire ni à manger.'
    ),
    'Ne remplace pas un médecin. Un saignement abondant est une urgence.',
    3
  ),
  (
    'brulure',
    'Brûlure',
    'Refroidir avec de l’eau tiède, couvrir proprement, ne rien appliquer.',
    'alert',
    jsonb_build_array(
      'Éloignez la personne de la source de chaleur.',
      'Refroidissez la brûlure sous de l’eau tiède (pas glacée) pendant 15 à 20 minutes.',
      'Retirez bagues, montres et vêtements non collés à la peau.',
      'Couvrez avec un linge propre et humide, sans serrer.',
      'Appelez le 119 si la brûlure est étendue, au visage, aux mains ou chez un enfant.'
    ),
    jsonb_build_array(
      'N’appliquez pas d’huile, de beurre, de dentifrice, de cendre ou d’alcool.',
      'Ne percez pas les cloques.',
      'N’utilisez pas de glace directement sur la peau.',
      'N’arrachez pas les vêtements collés à la brûlure.'
    ),
    'Ne remplace pas un médecin. Une brûlure grave nécessite un hôpital.',
    4
  ),
  (
    'accouchement',
    'Accouchement imminent',
    'Appeler les secours, installer la mère, ne pas tirer sur le bébé.',
    'alert',
    jsonb_build_array(
      'Appelez le 119 et une sage-femme ou un proche qui peut aider.',
      'Installez la mère dans un endroit propre, calme et chaud.',
      'Lavez-vous les mains et préparez des linges propres.',
      'Laissez la nature faire : soutenez le bébé sans tirer.',
      'Après la naissance, séchez le bébé, couvrez-le et gardez-le contre sa mère.'
    ),
    jsonb_build_array(
      'Ne tirez pas sur le bébé ni sur le cordon.',
      'Ne coupez pas le cordon vous-même.',
      'Ne donnez pas de médicament pour accélérer ou arrêter le travail.',
      'Ne laissez pas la mère seule.'
    ),
    'Ne remplace pas un médecin. Appelez le 119 dès que possible.',
    5
  ),
  (
    'intoxication_morsure',
    'Intoxication ou morsure',
    'Identifier le produit ou l’animal, ne pas faire vomir, appeler.',
    'alert',
    jsonb_build_array(
      'Éloignez la personne du produit ou de l’animal.',
      'Gardez l’emballage, la plante ou une photo pour identifier la cause.',
      'Appelez le 119 et décrivez ce qui a été avalé ou la morsure.',
      'En cas de morsure de serpent, immobilisez le membre et gardez-le plus bas que le cœur.',
      'Retirez bagues et vêtements serrés avant que le membre ne gonfle.'
    ),
    jsonb_build_array(
      'Ne faites pas vomir.',
      'Ne coupez pas, ne sucez pas et ne brûlez pas une morsure.',
      'Ne posez pas de garrot.',
      'Ne donnez ni lait ni huile.'
    ),
    'Ne remplace pas un médecin. Appelez immédiatement le 119.',
    6
  ),
  (
    'etouffement',
    'Étouffement',
    'La personne ne peut plus parler ni respirer : agir vite.',
    'alert',
    jsonb_build_array(
      'Demandez à la personne de tousser si elle le peut encore.',
      'Si elle ne peut plus respirer, donnez 5 claques fermes entre les omoplates.',
      'Si cela ne suffit pas, faites 5 compressions abdominales (adultes et enfants de plus de 1 an).',
      'Chez le nourrisson, alternez 5 claques dans le dos et 5 compressions thoraciques.',
      'Appelez le 119 et continuez jusqu’à l’arrivée des secours.'
    ),
    jsonb_build_array(
      'Ne mettez pas vos doigts dans la gorge à l’aveugle.',
      'Ne donnez pas à boire.',
      'Ne secouez pas le nourrisson par les pieds.',
      'N’arrêtez pas les gestes si la personne perd connaissance : commencez la réanimation si vous êtes formé.'
    ),
    'Ne remplace pas un médecin. Chaque seconde compte.',
    7
  ),
  (
    'malaise',
    'Malaise ou perte de connaissance',
    'Allonger, vérifier la respiration, appeler.',
    'alert',
    jsonb_build_array(
      'Allongez la personne et surélevez légèrement ses jambes.',
      'Desserrez les vêtements serrés et aérez la pièce.',
      'Vérifiez qu’elle respire et qu’elle répond.',
      'Si elle est inconsciente mais respire, mettez-la sur le côté (position de sécurité).',
      'Appelez le 119 et restez avec elle.'
    ),
    jsonb_build_array(
      'Ne la relevez pas brutalement.',
      'Ne lui donnez pas à boire si elle est somnolente ou inconsciente.',
      'Ne la laissez pas seule.',
      'Ne lui donnez pas de médicament sans avis médical.'
    ),
    'Ne remplace pas un médecin. Une perte de connaissance est une urgence.',
    8
  ),
  (
    'incendie',
    'Incendie',
    'Alerter, évacuer, ne pas respirer la fumée.',
    'alert',
    jsonb_build_array(
      'Appelez le 118 (pompiers) et faites évacuer les lieux.',
      'Sortez en restant près du sol, sous la fumée.',
      'Fermez les portes derrière vous sans les verrouiller.',
      'Si vos vêtements brûlent : arrêtez-vous, couvrez-vous le visage et roulez au sol.',
      'Rejoignez un point de rassemblement et comptez les personnes.'
    ),
    jsonb_build_array(
      'Ne retournez pas dans un bâtiment en feu.',
      'Ne jetez pas d’eau sur un feu électrique ou sur de l’huile.',
      'N’utilisez pas l’ascenseur.',
      'Ne respirez pas la fumée et ne restez pas près des flammes.'
    ),
    'Ne remplace pas les pompiers. Appelez le 118.',
    9
  ),
  (
    'agression',
    'Agression ou violence',
    'Se mettre en sécurité, appeler la police, ne pas se venger.',
    'alert',
    jsonb_build_array(
      'Éloignez-vous du danger et rejoignez un lieu public ou une personne de confiance.',
      'Appelez le 117 (police) ou le 113 (gendarmerie).',
      'Demandez une prise en charge médicale si vous êtes blessé.',
      'Conservez les preuves (vêtements, messages, photos) sans les modifier.',
      'Demandez un accompagnement psychologique si nécessaire.'
    ),
    jsonb_build_array(
      'Ne confrontez pas l’agresseur.',
      'Ne nettoyez pas les blessures avant un examen médical si elles peuvent servir de preuve.',
      'Ne restez pas seul si vous êtes en danger.',
      'Ne diffusez pas les informations personnelles de la victime.'
    ),
    'Ne remplace pas la police ni un médecin. En danger immédiat, appelez le 117.',
    10
  )
on conflict (slug) do update
  set title = excluded.title,
      summary = excluded.summary,
      icon = excluded.icon,
      do_steps = excluded.do_steps,
      dont_steps = excluded.dont_steps,
      warning = excluded.warning,
      sort_order = excluded.sort_order;

-- -----------------------------------------------------------------------------
-- Établissements de santé : noms connus, numéros à vérifier
-- -----------------------------------------------------------------------------
insert into public.emergency_facilities
  (nom, type, region_id, departement_id, arrondissement_id, region_nom, departement_nom,
   ville, adresse, telephone, horaires, is_verified, source)
select
  v.nom, v.type, r.id, d.id, a.id, r.nom, d.nom,
  v.ville, v.adresse, null, '24h/24 (à confirmer)', false,
  'Coordonnées à vérifier — appelez le 119'
from (
  values
    ('littoral', 'wouri', 'douala', 'Hôpital Général de Douala', 'hopital', 'Douala', 'Douala'),
    ('littoral', 'wouri', 'douala', 'Hôpital Laquintinie', 'hopital', 'Douala', 'Douala'),
    ('littoral', 'wouri', 'douala', 'Clinique des Cocotiers', 'clinique', 'Douala', 'Douala'),
    ('centre', 'mfoundi', 'yaounde', 'Hôpital Central de Yaoundé', 'hopital', 'Yaoundé', 'Yaoundé'),
    ('centre', 'mfoundi', 'yaounde', 'Hôpital Général de Yaoundé', 'hopital', 'Yaoundé', 'Yaoundé'),
    ('centre', 'mfoundi', 'yaounde', 'Hôpital Gynéco-Obstétrique et Pédiatrique de Yaoundé', 'hopital', 'Yaoundé', 'Yaoundé'),
    ('ouest', 'mifi', 'bafoussam', 'Hôpital Régional de Bafoussam', 'hopital', 'Bafoussam', 'Bafoussam'),
    ('nord', 'benoue', 'garoua', 'Hôpital Régional de Garoua', 'hopital', 'Garoua', 'Garoua'),
    ('nord_ouest', 'mezam', 'bamenda', 'Bamenda Regional Hospital', 'hopital', 'Bamenda', 'Bamenda'),
    ('est', 'lom_et_djerem', 'bertoua', 'Hôpital Régional de Bertoua', 'hopital', 'Bertoua', 'Bertoua'),
    ('extreme_nord', 'diamare', 'maroua', 'Hôpital Régional de Maroua', 'hopital', 'Maroua', 'Maroua'),
    ('adamaoua', 'vina', 'ngaoundere', 'Hôpital Régional de Ngaoundéré', 'hopital', 'Ngaoundéré', 'Ngaoundéré'),
    ('sud', 'mvila', 'ebolowa', 'Hôpital Régional d’Ebolowa', 'hopital', 'Ebolowa', 'Ebolowa'),
    ('sud_ouest', 'fako', 'buea', 'Buea Regional Hospital', 'hopital', 'Buea', 'Buea'),
    ('sud_ouest', 'fako', 'limbe', 'Limbe Regional Hospital', 'hopital', 'Limbe', 'Limbe'),
    ('sud', 'ocean', 'kribi', 'Hôpital de District de Kribi', 'hopital', 'Kribi', 'Kribi'),
    ('ouest', 'haut_nkam', 'bafang', 'Hôpital de District de Bafang', 'hopital', 'Bafang', 'Bafang')
) as v(region_slug, dep_slug, city_slug, nom, type, ville, adresse)
join public.regions r on r.slug = v.region_slug
join public.departements d on d.region_id = r.id and d.slug = v.dep_slug
join public.arrondissements a on a.departement_id = d.id and a.slug = v.city_slug
on conflict (nom, ville) do nothing;

-- -----------------------------------------------------------------------------
-- Prestataire de démonstration pour tester l'alerte transport
-- -----------------------------------------------------------------------------
insert into public.providers
  (nom, metier, metier_nom, specialite, quartier, quartier_id, region_id, departement_id,
   arrondissement_id, whatsapp, statut, disponible, note_moyenne, nombre_avis, est_demo, type_aideur, valide_le)
select
  'Démo – Moto Taxi Akwa', 'taxi_moto', 'Taxi / moto-taxi', 'Transport urgent',
  'Akwa', q.id, r.id, d.id, a.id, '+237699000007', 'valide', true, 4.7, 9, true, true, now()
from public.regions r
join public.departements d on d.region_id = r.id and d.slug = 'wouri'
join public.arrondissements a on a.departement_id = d.id and a.slug = 'douala'
join public.quartiers q on q.arrondissement_id = a.id and q.slug = 'akwa'
where r.slug = 'littoral'
  and not exists (
    select 1 from public.providers where nom = 'Démo – Moto Taxi Akwa'
  );

insert into public.provider_zones (provider_id, scope, quartier_id)
select p.id, 'quartier', q.id
from public.providers p
join public.quartiers q on q.slug = 'akwa'
where p.nom = 'Démo – Moto Taxi Akwa'
on conflict do nothing;


commit;
