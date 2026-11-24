-- =============================================================================
-- LIFE CONNECT — V6 — relations géographiques pour LIFE RADAR
-- À exécuter une fois dans Supabase SQL Editor.
-- =============================================================================

begin;

alter table public.opportunities
  add column if not exists region_id bigint references public.regions(id) on delete set null,
  add column if not exists departement_id bigint references public.departements(id) on delete set null,
  add column if not exists arrondissement_id bigint references public.arrondissements(id) on delete set null;

create index if not exists opportunities_region_idx
  on public.opportunities (region_id);
create index if not exists opportunities_departement_idx
  on public.opportunities (departement_id);
create index if not exists opportunities_arrondissement_idx
  on public.opportunities (arrondissement_id);

create index if not exists providers_departement_idx
  on public.providers (departement_id);
create index if not exists providers_arrondissement_idx
  on public.providers (arrondissement_id);

commit;
