-- =============================================================================
-- LIFE CONNECT – HELP ME
-- 01_schema.sql — tables, contraintes, index et vue publique
-- À exécuter EN PREMIER dans Supabase > SQL Editor.
-- =============================================================================

create extension if not exists pgcrypto;

-- -----------------------------------------------------------------------------
-- Prestataires
-- -----------------------------------------------------------------------------
create table if not exists public.providers (
  id uuid primary key default gen_random_uuid(),
  nom text not null check (char_length(nom) between 2 and 80),
  metier text not null check (metier in ('mecanicien', 'depanneur', 'technicien')),
  specialite text check (specialite is null or char_length(specialite) <= 60),
  quartier text not null check (char_length(quartier) between 2 and 60),
  latitude double precision check (latitude is null or (latitude >= -90 and latitude <= 90)),
  longitude double precision check (longitude is null or (longitude >= -180 and longitude <= 180)),
  whatsapp text not null check (whatsapp ~ '^[+]2376[0-9]{8}$'),
  photo_url text,
  statut text not null default 'en_attente'
    check (statut in ('en_attente', 'valide', 'refuse', 'suspendu')),
  disponible boolean not null default true,
  note_moyenne numeric(2,1) not null default 0
    check (note_moyenne >= 0 and note_moyenne <= 5),
  nombre_avis integer not null default 0 check (nombre_avis >= 0),
  est_demo boolean not null default false,
  cree_le timestamptz not null default now(),
  valide_le timestamptz,
  constraint providers_position_complete check (
    (latitude is null and longitude is null)
    or (latitude is not null and longitude is not null)
  )
);

comment on table public.providers is
  'Prestataires (mecaniciens, depanneurs, techniciens) verifies par l''administrateur.';

-- -----------------------------------------------------------------------------
-- Demandes
-- -----------------------------------------------------------------------------
create table if not exists public.requests (
  id uuid primary key default gen_random_uuid(),
  token uuid not null unique default gen_random_uuid(),
  ville text not null default 'Douala' check (char_length(ville) between 2 and 60),
  categorie text not null check (categorie in ('mecanicien', 'depanneur', 'technicien')),
  probleme text not null check (char_length(probleme) between 3 and 120),
  description text check (description is null or char_length(description) <= 600),
  tel_client text not null check (tel_client ~ '^[+]2376[0-9]{8}$'),
  latitude double precision check (latitude is null or (latitude >= -90 and latitude <= 90)),
  longitude double precision check (longitude is null or (longitude >= -180 and longitude <= 180)),
  quartier text not null check (char_length(quartier) between 2 and 60),
  statut text not null default 'nouvelle'
    check (statut in ('nouvelle', 'en_recherche', 'assignee', 'resolue', 'annulee', 'expiree')),
  provider_id uuid references public.providers(id) on delete set null,
  cree_le timestamptz not null default now(),
  expire_le timestamptz not null default (now() + interval '5 minutes'),
  assigne_le timestamptz,
  resolue_le timestamptz,
  annulee_le timestamptz,
  note_donnee boolean not null default false,
  est_demo boolean not null default false,
  constraint requests_position_complete check (
    (latitude is null and longitude is null)
    or (latitude is not null and longitude is not null)
  )
);

comment on table public.requests is
  'Demandes d''assistance. Le token est la seule cle publique de suivi.';

-- -----------------------------------------------------------------------------
-- Avis
-- -----------------------------------------------------------------------------
create table if not exists public.ratings (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null unique references public.requests(id) on delete cascade,
  provider_id uuid references public.providers(id) on delete set null,
  etoiles integer not null check (etoiles between 1 and 5),
  resolu boolean not null,
  commentaire text check (commentaire is null or char_length(commentaire) <= 500),
  cree_le timestamptz not null default now()
);

comment on table public.ratings is
  'Avis laisses par les clients apres une intervention.';

-- -----------------------------------------------------------------------------
-- Index
-- -----------------------------------------------------------------------------
create index if not exists requests_statut_cree_idx on public.requests (statut, cree_le desc);
create index if not exists requests_tel_cree_idx on public.requests (tel_client, cree_le desc);
create index if not exists requests_provider_idx on public.requests (provider_id);
create index if not exists providers_metier_statut_idx on public.providers (metier, statut);
create index if not exists providers_quartier_idx on public.providers (quartier);
create index if not exists ratings_provider_idx on public.ratings (provider_id);

-- -----------------------------------------------------------------------------
-- Vue publique : aucune donnée de contact, aucune coordonnée exacte.
-- -----------------------------------------------------------------------------
create or replace view public.providers_public as
select
  id,
  nom,
  metier,
  specialite,
  quartier,
  photo_url,
  note_moyenne,
  nombre_avis,
  disponible
from public.providers
where statut = 'valide'
  and disponible = true;

comment on view public.providers_public is
  'Profils publics des prestataires valides. Ne contient ni WhatsApp ni coordonnees.';
