-- =============================================================================
-- LIFE CONNECT — CORRECTION INSCRIPTION PRESTATAIRE
-- À exécuter une fois dans Supabase > SQL Editor.
-- L'insertion passe par la clé service_role côté serveur : aucune policy
-- publique d'insertion n'est créée (évite le spam).
-- =============================================================================

begin;

-- 1. Colonnes utilisées par le formulaire et le dashboard aideur.
alter table public.providers
  add column if not exists metier_nom text,
  add column if not exists region_id bigint references public.regions(id) on delete set null,
  add column if not exists departement_id bigint references public.departements(id) on delete set null,
  add column if not exists arrondissement_id bigint references public.arrondissements(id) on delete set null,
  add column if not exists quartier_id bigint references public.quartiers(id) on delete set null,
  add column if not exists type_aideur boolean not null default false;

create index if not exists providers_region_idx on public.providers (region_id);
create index if not exists providers_departement_idx on public.providers (departement_id);
create index if not exists providers_arrondissement_idx on public.providers (arrondissement_id);

-- 2. Normaliser les anciennes zones : une seule colonne selon le scope.
update public.provider_zones
set region_id = null
where scope in ('departement', 'arrondissement', 'quartier');

update public.provider_zones
set departement_id = null
where scope in ('region', 'arrondissement', 'quartier');

update public.provider_zones
set arrondissement_id = null
where scope in ('region', 'departement', 'quartier');

update public.provider_zones
set quartier_id = null
where scope in ('region', 'departement', 'arrondissement');

-- 3. Contrainte cohérente avec le code d'inscription.
alter table public.provider_zones
  drop constraint if exists provider_zones_scope_check;

alter table public.provider_zones
  add constraint provider_zones_scope_check check (
    (scope = 'region' and region_id is not null and departement_id is null and arrondissement_id is null and quartier_id is null)
    or (scope = 'departement' and departement_id is not null and region_id is null and arrondissement_id is null and quartier_id is null)
    or (scope = 'arrondissement' and arrondissement_id is not null and region_id is null and departement_id is null and quartier_id is null)
    or (scope = 'quartier' and quartier_id is not null and region_id is null and departement_id is null and arrondissement_id is null)
  ) not valid;

-- 4. Droits serveur (service_role contourne RLS).
grant insert, update, delete, select on public.providers to service_role;
grant insert, update, delete, select on public.provider_services to service_role;
grant insert, update, delete, select on public.provider_zones to service_role;

notify pgrst, 'reload schema';

commit;
