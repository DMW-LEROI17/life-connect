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
