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
