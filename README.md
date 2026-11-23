# LIFE CONNECT

Plateforme de mise en relation et de solutions, née à Douala et étendue au Cameroun puis à l’international.

**Slogan :** Everything. Everyone. Everywhere.
**Signature :** Un besoin. Une connexion. Une solution.

---

## 1. État actuel

Le projet existant a été conservé et étendu, sans réinitialisation.

### Fonctionnel

- **HELP ME** : demande d’assistance sans compte, urgence, suivi par lien, assignation, notation, WhatsApp.
- **Urgences Cameroun** : numéros 117 / 118 / 119, 10 fiches de premiers gestes, établissements de santé, partage GPS, alerte transport.
- **Géographie** : 10 régions, 58 départements, villes et quartiers de départ, champ libre pour villages et repères.
- **Catalogue** : 11 familles, 63 catégories, sous-services, gérés depuis l’admin.
- **Prestataires** : plusieurs services, plusieurs zones, validation admin.
- **Comptes** : inscription/connexion Supabase Auth, profils, rôles (particulier, professionnel, commerçant, entreprise), modération/admin.
- **LIFE CONNECT / REQUEST** : publication de besoins et d’offres, propositions, acceptation/refus, clôture.
- **LIFE CHAT** : messagerie temps réel, images, partage de position, appel, clôture de mission.
- **Suivi GPS** : lien mission prestataire, position en direct, distance et temps d’arrivée estimé.
- **LIFE WALLET** : solde FCFA, recharge/retrait Orange Money et MTN MoMo (demandes en attente, confirmation admin).
- **Notifications** : messages, propositions, paiements, alertes SOS.
- **Admin V4** : utilisateurs, publications, alertes SOS, paiements, catégories, prestataires, demandes.
- **Profil & paramètres** : avatar, préférences de notifications, mot de passe.
- **LIFE MATCH / LIFE AI** : recherche en langage naturel (règles locales, IA optionnelle), résultats réels uniquement.
- **LIFE MARKET** : annonces produits avec photo, prix, état, contact vendeur et clôture de l’annonce.
- **LIFE PEOPLE & SERVICES** : annuaire des membres, professionnels et entreprises, contact par messagerie.
- **LIFE COMMUNITY** : groupes publics/privés, adhésion, publications internes.
- **LIFE EXCHANGE** : offres et recherches de compétences.
- **LIFE RADAR** : emplois, stages, événements, projets et partenariats.
- **LIFE SERVICES** : profil public de prestataire, sans numéro exposé.
- **Admin** : demandes, prestataires, catégories, statistiques par région, export CSV.
- **SEO / légal** : pages régions, urgences, FAQ, à propos, contact, sitemap, confidentialité, conditions.

### Partiel / à venir

- **LIFE ANTICIPATION** : non commencé.
- **LIFE AI avancée** : la recherche fonctionne avec règles locales ; l’API IA externe reste optionnelle.
- **OTP SMS/WhatsApp** : non branché (nécessite un fournisseur).
- **Paiement réel** : les demandes Wallet sont enregistrées et confirmées par l’admin ; aucun agrégateur Orange/MTN n’est encore branché.
- **Bilingue FR/EN** : préférence stockée, traduction complète de l’interface à poursuivre.
- **2FA admin** : non activée.
- **PWA hors-ligne** : manifeste présent, pas de service worker.

---

## 2. Stack

- Next.js 14.2 (App Router, TypeScript)
- Tailwind CSS 3.4
- Supabase (PostgreSQL, Auth, Storage)
- `@supabase/ssr` pour les sessions cookies
- Vercel
- `jose` pour l’administration historique (cookie séparé)
- `zod` pour la validation

---

## 3. Base de données

### Nouveau projet

Exécuter dans Supabase → SQL Editor, dans cet ordre :

1. `supabase/01_schema.sql`
2. `supabase/02_functions.sql`
3. `supabase/03_rls.sql`
4. `supabase/04_seed.sql`
5. `supabase/V2_ALL.sql` (ou 05 à 10)
6. `supabase/V3_ALL.sql` (ou 11)
7. `supabase/V4_ALL.sql` (ou 12)
8. `supabase/V5_ALL.sql` (ou 13)

### Projet existant (V1 déjà en place)

Exécuter :

1. `supabase/V2_ALL.sql`
2. `supabase/V3_ALL.sql`
3. `supabase/V4_ALL.sql`
4. `supabase/V5_ALL.sql`

Puis :

```sql
notify pgrst, 'reload schema';
```

### Auth

Dans **Authentication → Providers → Email** :

- activer Email ;
- pour tester rapidement, désactiver **Confirm email** ;
- sinon, l’utilisateur doit confirmer son adresse avant de se connecter.

### Bucket

Storage → bucket `providers` : public, 2 Mo max, `image/jpeg`, `image/png`, `image/webp`.
La migration V4 crée aussi les buckets `chat` et `avatars`.

---

## 4. Variables d’environnement

Copier `.env.example` vers `.env.local` :

```
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
ADMIN_PASSWORD=...
AUTH_SECRET=...
NEXT_PUBLIC_ADMIN_WHATSAPP=237672115570

# Facultatif — LIFE AI (API compatible OpenAI)
LIFE_AI_API_URL=
LIFE_AI_API_KEY=
LIFE_AI_MODEL=
```

Générer `AUTH_SECRET` :

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

> `.env.local` ne doit jamais être commité. Si de vraies clés ont été placées dans `.env.example`, elles ont été retirées ; régénère-les par précaution dans Supabase et change le mot de passe admin.

---

## 5. Lancer et vérifier

```powershell
npm install
node scripts/check-supabase.mjs
npm run dev
```

Le script vérifie les clés, les fonctions et les tables V2/V3, le bucket et la présence de la clé anon.

### Parcours de test

1. `/inscription` : créer un compte particulier.
2. `/compte` : modifier le profil.
3. `/connect/nouveau` : publier un besoin.
4. Un deuxième compte répond à la demande.
5. L’auteur accepte la proposition : la demande passe « en cours ».
6. `/match?q=...` : vérifier que la recherche ne renvoie que des données réelles.
7. `/admin` : vérifier demandes, prestataires, catégories, export CSV.
8. `/urgence` : vérifier les numéros et les fiches.
9. `/aide` : vérifier le catalogue et la création d’une demande HELP ME.

---

## 6. Routes principales

| Route | Rôle |
|---|---|
| `/` | LIFE HOME, recherche universelle, familles, urgence |
| `/aide` | Catalogue par familles |
| `/aide/[categorie]` | Formulaire HELP ME |
| `/suivi/[token]` | Suivi d’une demande |
| `/noter/[token]` | Avis |
| `/urgence` | Urgences, fiches, établissements |
| `/urgence/[slug]` | Fiche premiers gestes |
| `/urgence/transport` | Alerte transport |
| `/connect` | Demandes et offres |
| `/connect/nouveau` | Publier (compte requis) |
| `/connect/[id]` | Détail + propositions |
| `/match` | LIFE MATCH / LIFE AI |
| `/prestataires/[id]` | Profil public prestataire |
| `/inscription`, `/connexion` | Comptes |
| `/compte` | Profil, publications, réponses |
| `/regions`, `/regions/[slug]` | SEO régional |
| `/suivi/[token]/carte` | Suivi GPS client |
| `/mission/[token]` | Lien GPS prestataire |
| `/messages` | Chat temps réel |
| `/wallet` | Portefeuille FCFA |
| `/notifications` | Alertes |
| `/parametres` | Notifications et sécurité |
| `/market` | LIFE MARKET |
| `/people` | LIFE PEOPLE & SERVICES |
| `/community` | LIFE COMMUNITY |
| `/exchange` | LIFE EXCHANGE |
| `/radar` | LIFE RADAR |
| `/match` | LIFE AI |
| `/admin` | Administration |

---

## 7. Sécurité

- RLS activée sur les données V1, V2 et V3.
- `profiles` : lecture/écriture de son propre profil ; le rôle est protégé par trigger.
- `posts` : lecture publique des publications ouvertes ; écriture par l’auteur.
- `proposals` : visibles uniquement par l’auteur de la demande et l’auteur de la réponse.
- `conversations` / `messages` : réservés aux participants ; Realtime activé.
- `wallets` / `wallet_transactions` : lecture par le propriétaire ; confirmation admin.
- `notifications` : lecture et mise à jour par le destinataire uniquement.
- Le suivi GPS passe par des RPC à token, jamais par une lecture publique de la table.
- Le numéro WhatsApp d’un prestataire n’est jamais public.
- `SUPABASE_SERVICE_ROLE_KEY` reste côté serveur.
- L’administration utilise un cookie JWT séparé (`jose`), pas le rôle Supabase.
- Validation Zod et limitation de débit sur les formulaires publics.

---

## 8. Déploiement Vercel

1. Pousser sur GitHub.
2. Importer le dépôt sur Vercel.
3. Ajouter les variables d’environnement (URL, anon, service role, admin, auth secret, WhatsApp, AI si utilisé).
4. Déployer.
5. Mettre `NEXT_PUBLIC_APP_URL` à l’URL de production, puis redéployer.

Le détail est dans [`GUIDE_DEMARRAGE.md`](GUIDE_DEMARRAGE.md).

---

## 9. Contact

- WhatsApp : +237 672 115 570 (secours : +237 656 151 246)
- E-mail : dmwleroi17@gmail.com
- Douala, Cameroun
