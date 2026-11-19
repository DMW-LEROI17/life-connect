# Scripts Supabase

Exécuter **dans cet ordre** dans Supabase → SQL Editor :

1. `01_schema.sql` — tables `providers`, `requests`, `ratings`, contraintes, index, vue `providers_public`.
2. `02_functions.sql` — fonctions `get_request_by_token`, `cancel_request`, `submit_rating`, `nearby_providers`, `admin_stats`, `expire_stale_requests`, `haversine_km`.
3. `03_rls.sql` — RLS, privilèges, grants. Le public ne lit aucune table directement.
4. `04_seed.sql` — 6 prestataires de démonstration (`est_demo = true`).

## Bucket Storage

- Nom : `providers`
- Public : oui (lecture)
- Taille max : 2 Mo
- Types : `image/jpeg`, `image/png`, `image/webp`

## Après exécution

Forcer PostgREST à recharger le schéma :

```sql
notify pgrst, 'reload schema';
```

## Supprimer les données de démonstration

```sql
delete from public.providers where est_demo = true;
```

## Vérifier la RLS

```sql
set role anon;
select * from public.requests;          -- échoue ou 0 ligne
select * from public.providers;         -- échoue ou 0 ligne
select * from public.providers_public;  -- réussit
reset role;
```
