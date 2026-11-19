-- =============================================================================
-- LIFE CONNECT – HELP ME
-- 03_rls.sql — sécurité au niveau des lignes et privilèges
-- À exécuter APRÈS 02_functions.sql.
--
-- Principe : le public ne lit JAMAIS les tables directement.
-- Le client passe par les fonctions get_request_by_token / cancel_request /
-- submit_rating. L'administrateur passe par le serveur Next.js et la clé
-- service_role, qui contourne RLS.
-- =============================================================================

grant usage on schema public to anon, authenticated;

alter table public.providers enable row level security;
alter table public.requests enable row level security;
alter table public.ratings enable row level security;

-- -----------------------------------------------------------------------------
-- Retirer tous les droits directs, puis n'autoriser que l'insertion contrôlée.
-- -----------------------------------------------------------------------------
revoke all on table public.providers from anon, authenticated;
revoke all on table public.requests from anon, authenticated;
revoke all on table public.ratings from anon, authenticated;

grant insert on table public.requests to anon, authenticated;
grant insert on table public.providers to anon, authenticated;

-- -----------------------------------------------------------------------------
-- Demandes : insertion d'une demande neuve uniquement.
-- -----------------------------------------------------------------------------
drop policy if exists requests_insert_public on public.requests;
create policy requests_insert_public on public.requests
  for insert
  to anon, authenticated
  with check (
    statut = 'nouvelle'
    and provider_id is null
    and note_donnee = false
    and est_demo = false
    and cree_le >= now() - interval '1 minute'
    and expire_le <= now() + interval '10 minutes'
  );

-- -----------------------------------------------------------------------------
-- Prestataires : inscription en attente uniquement.
-- -----------------------------------------------------------------------------
drop policy if exists providers_insert_public on public.providers;
create policy providers_insert_public on public.providers
  for insert
  to anon, authenticated
  with check (
    statut = 'en_attente'
    and est_demo = false
    and note_moyenne = 0
    and nombre_avis = 0
    and disponible = true
  );

-- -----------------------------------------------------------------------------
-- Vue publique : lecture des profils validés, sans données de contact.
-- -----------------------------------------------------------------------------
grant select on public.providers_public to anon, authenticated;

-- -----------------------------------------------------------------------------
-- Fonctions accessibles au public (elles valident chacune leurs entrées).
-- -----------------------------------------------------------------------------
revoke all on function public.get_request_by_token(uuid) from public;
grant execute on function public.get_request_by_token(uuid) to anon, authenticated;

revoke all on function public.cancel_request(uuid) from public;
grant execute on function public.cancel_request(uuid) to anon, authenticated;

revoke all on function public.submit_rating(uuid, integer, boolean, text) from public;
grant execute on function public.submit_rating(uuid, integer, boolean, text) to anon, authenticated;

-- -----------------------------------------------------------------------------
-- Fonctions réservées au serveur (service_role).
-- -----------------------------------------------------------------------------
revoke all on function public.nearby_providers(double precision, double precision, text, integer) from public;
grant execute on function public.nearby_providers(double precision, double precision, text, integer) to service_role;

revoke all on function public.admin_stats() from public;
grant execute on function public.admin_stats() to service_role;

revoke all on function public.expire_stale_requests() from public;
grant execute on function public.expire_stale_requests() to service_role;

revoke all on function public.haversine_km(double precision, double precision, double precision, double precision) from public;
grant execute on function public.haversine_km(double precision, double precision, double precision, double precision)
  to anon, authenticated, service_role;
