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
