# Scripts Supabase

## Installation complète (nouveau projet)

Exécuter **dans cet ordre** dans Supabase → SQL Editor :

1. `01_schema.sql` — tables `providers`, `requests`, `ratings`, contraintes, index, vue `providers_public`.
2. `02_functions.sql` — RPC de suivi, notation, distance, statistiques.
3. `03_rls.sql` — RLS, privilèges, grants.
4. `04_seed.sql` — 6 prestataires de démonstration (`est_demo = true`).
5. `05_v2_schema.sql` — géographie, catalogue, urgences, zones prestataires.
6. `06_v2_functions.sql` — `providers_for_request`, `admin_stats_by_region`.
7. `07_v2_rls.sql` — lecture publique des données de référence.
8. `08_v2_geo_seed.sql` — 10 régions, 58 départements, villes et quartiers.
9. `09_v2_catalog_seed.sql` — 11 familles, 63 catégories, sous-services.
10. `10_v2_emergency_seed.sql` — 10 fiches d’urgence et établissements.
11. `11_v3_accounts_posts.sql` — comptes, profils, rôles, demandes/offres, propositions.

Ou, plus simple :

- exécuter `V2_ALL.sql` (regroupe 05 à 10) ;
- puis `V3_ALL.sql` (regroupe 11).

## Bucket Storage

- Nom : `providers`
- Public : oui (lecture)
- Taille max : 2 Mo
- Types : `image/jpeg`, `image/png`, `image/webp`

## Auth Supabase

Pour les comptes (V3), dans **Authentication → Providers → Email** :

- activer Email ;
- pour tester rapidement, désactiver **Confirm email** (sinon il faut confirmer l’adresse avant de se connecter).

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
select * from public.posts;             -- seulement les posts publics ouverts
reset role;
```

## Vérifier la configuration depuis le projet

```powershell
node scripts/check-supabase.mjs
```

Le script contrôle les clés, les fonctions, les tables V2 et V3, le bucket et
les comptes.
