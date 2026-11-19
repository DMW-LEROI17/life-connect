-- =============================================================================
-- LIFE CONNECT – HELP ME
-- 02_functions.sql — fonctions métier (RPC)
-- À exécuter APRÈS 01_schema.sql.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Distance entre deux points (formule de Haversine), en kilomètres.
-- -----------------------------------------------------------------------------
create or replace function public.haversine_km(
  lat1 double precision,
  lng1 double precision,
  lat2 double precision,
  lng2 double precision
)
returns double precision
language sql
immutable
as $$
  select 6371 * acos(
    least(1, greatest(-1,
      sin(radians(lat1)) * sin(radians(lat2))
      + cos(radians(lat1)) * cos(radians(lat2)) * cos(radians(lng2 - lng1))
    ))
  );
$$;

-- -----------------------------------------------------------------------------
-- Lecture publique d'une demande par son token.
-- Marque la demande expirée si le délai est dépassé.
-- Ne renvoie le contact du prestataire QUE si la demande est assignée.
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
    where p.id = v_req.provider_id;
  end if;

  return jsonb_build_object(
    'ok', true,
    'token', v_req.token,
    'ville', v_req.ville,
    'categorie', v_req.categorie,
    'probleme', v_req.probleme,
    'description', v_req.description,
    'quartier', v_req.quartier,
    'statut', v_req.statut,
    'cree_le', v_req.cree_le,
    'expire_le', v_req.expire_le,
    'assigne_le', v_req.assigne_le,
    'note_donnee', v_req.note_donnee,
    'provider', v_provider
  );
end;
$$;

-- -----------------------------------------------------------------------------
-- Annulation par le client, uniquement avant assignation.
-- -----------------------------------------------------------------------------
create or replace function public.cancel_request(p_token uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_req public.requests%rowtype;
begin
  select * into v_req
  from public.requests
  where token = p_token
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'not_found');
  end if;

  if v_req.statut not in ('nouvelle', 'en_recherche') then
    return jsonb_build_object('ok', false, 'error', 'not_cancellable');
  end if;

  update public.requests
    set statut = 'annulee',
        annulee_le = now()
    where id = v_req.id;

  return jsonb_build_object('ok', true);
end;
$$;

-- -----------------------------------------------------------------------------
-- Notation par le client. Un seul avis par demande.
-- Met à jour la moyenne et le nombre d'avis du prestataire.
-- -----------------------------------------------------------------------------
create or replace function public.submit_rating(
  p_token uuid,
  p_etoiles integer,
  p_resolu boolean,
  p_commentaire text
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_req public.requests%rowtype;
  v_moyenne numeric;
  v_nombre integer;
begin
  select * into v_req
  from public.requests
  where token = p_token
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'not_found');
  end if;

  if v_req.statut not in ('assignee', 'resolue') then
    return jsonb_build_object('ok', false, 'error', 'not_rateable');
  end if;

  if v_req.note_donnee then
    return jsonb_build_object('ok', false, 'error', 'already_rated');
  end if;

  if p_etoiles is null or p_etoiles < 1 or p_etoiles > 5 then
    return jsonb_build_object('ok', false, 'error', 'invalid_rating');
  end if;

  insert into public.ratings (request_id, provider_id, etoiles, resolu, commentaire)
  values (
    v_req.id,
    v_req.provider_id,
    p_etoiles,
    coalesce(p_resolu, false),
    nullif(trim(coalesce(p_commentaire, '')), '')
  );

  update public.requests
    set statut = 'resolue',
        resolue_le = coalesce(resolue_le, now()),
        note_donnee = true
    where id = v_req.id;

  if v_req.provider_id is not null then
    select
      round(avg(etoiles)::numeric, 1),
      count(*)::integer
    into v_moyenne, v_nombre
    from public.ratings
    where provider_id = v_req.provider_id;

    update public.providers
      set note_moyenne = coalesce(v_moyenne, 0),
          nombre_avis = coalesce(v_nombre, 0)
      where id = v_req.provider_id;
  end if;

  return jsonb_build_object('ok', true);
end;
$$;

-- -----------------------------------------------------------------------------
-- Prestataires proches, pour l'administration.
-- Exécution réservée au service_role (voir 03_rls.sql).
-- -----------------------------------------------------------------------------
create or replace function public.nearby_providers(
  p_lat double precision,
  p_lng double precision,
  p_categorie text,
  p_limit integer default 10
)
returns table (
  id uuid,
  nom text,
  metier text,
  specialite text,
  quartier text,
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
  select
    p.id,
    p.nom,
    p.metier,
    p.specialite,
    p.quartier,
    round(
      public.haversine_km(p_lat, p_lng, p.latitude, p.longitude)::numeric,
      1
    )::double precision as distance_km,
    p.note_moyenne,
    p.nombre_avis,
    p.photo_url,
    p.whatsapp,
    p.disponible
  from public.providers p
  where p.statut = 'valide'
    and p.metier = p_categorie
  order by
    p.disponible desc,
    distance_km asc nulls last,
    p.note_moyenne desc
  limit greatest(1, least(coalesce(p_limit, 10), 50));
$$;

-- -----------------------------------------------------------------------------
-- Statistiques du tableau de bord admin.
-- -----------------------------------------------------------------------------
create or replace function public.admin_stats()
returns jsonb
language sql
security definer
set search_path = public, pg_temp
as $$
  select jsonb_build_object(
    'total_30j', (
      select count(*) from public.requests
      where cree_le > now() - interval '30 days'
    ),
    'aujourdhui', (
      select count(*) from public.requests
      where (cree_le at time zone 'Africa/Douala')::date
          = (now() at time zone 'Africa/Douala')::date
    ),
    'en_attente', (
      select count(*) from public.requests
      where statut in ('nouvelle', 'en_recherche')
    ),
    'temps_reponse_moyen_sec', (
      select round(avg(extract(epoch from (assigne_le - cree_le))))::integer
      from public.requests
      where assigne_le is not null
        and cree_le > now() - interval '30 days'
    ),
    'pourcentage_resolu', (
      select case
        when count(*) = 0 then 0
        else round(100.0 * count(*) filter (where statut = 'resolue') / count(*))
      end
      from public.requests
      where statut in ('resolue', 'annulee', 'expiree')
        and cree_le > now() - interval '30 days'
    ),
    'note_moyenne', (
      select round(avg(etoiles)::numeric, 2)
      from public.ratings
      where cree_le > now() - interval '30 days'
    )
  );
$$;

-- -----------------------------------------------------------------------------
-- Expiration des demandes actives trop anciennes.
-- Appelée par l'administration à chaque chargement du tableau de bord.
-- -----------------------------------------------------------------------------
create or replace function public.expire_stale_requests()
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_count integer;
begin
  update public.requests
    set statut = 'expiree'
    where statut in ('nouvelle', 'en_recherche')
      and expire_le < now();

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;
