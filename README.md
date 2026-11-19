# LIFE CONNECT – HELP ME

Web-app mobile-first d’assistance locale à Douala. Un client en panne choisit son problème, laisse son numéro et son quartier, puis l’administrateur alerte un prestataire vérifié sur WhatsApp et l’assigne. Le client voit alors le contact du prestataire et peut noter l’intervention.

> **Le projet est déjà construit dans ce dossier.** Ne relance pas `create-next-app` : tu écraserais le code. Suis `GUIDE_DEMARRAGE.md` pour Supabase, GitHub et Vercel.

**Stack :** Next.js 14.2 (App Router, TypeScript), Tailwind CSS 3.4, Supabase (PostgreSQL + Storage), Vercel. Aucune dépendance payante.

---

## 1. Ce qui fonctionne

- Accueil mobile-first, 3 catégories (mécanicien, dépanneur, technicien).
- Demande sans compte : problème, description, téléphone `+237`, quartier, géolocalisation facultative, consentement, anti-spam.
- Suivi par lien unique : compte à rebours de 5 minutes, mise à jour automatique toutes les 5 s, annulation.
- Prestataire assigné : photo, note, distance, boutons **Appeler** et **WhatsApp**. Le numéro n’apparaît qu’après l’assignation.
- Notation : 1 à 5 étoiles, problème résolu oui/non, commentaire. Un seul avis par demande.
- Inscription prestataire avec photo (2 Mo max), statut « en attente ».
- Administration protégée : demandes, filtres, détail, prestataires proches triés par distance, alerte WhatsApp pré-remplie, assignation, validation/refus/suspension, export CSV, statistiques.
- Pages légales, bandeau d’urgence, manifeste PWA, mode sombre.
- RLS Supabase : le public ne lit jamais les tables directement ; les fonctions SQL valident chaque accès.

## 2. Prérequis

- Node.js 20 LTS recommandé (le build a été validé avec Node 26.13.1 et Next.js 14.2.35).
- Un compte Supabase gratuit.
- Un compte GitHub et un compte Vercel.
- Git et VS Code.

## 3. Installation locale

```powershell
cd C:\Users\LEROI\Desktop\LIFE-CONNCT
npm install
```

Crée le fichier `.env.local` à partir du modèle :

```powershell
Copy-Item .env.example .env.local
notepad .env.local
```

Renseigne les 6 variables (voir section 4), puis :

```powershell
npm run dev
```

Ouvre `http://localhost:3000`. Pour tester depuis un téléphone sur le même Wi-Fi :

```powershell
npm run dev -- -H 0.0.0.0
```

Puis ouvre `http://IP-DU-PC:3000` sur le téléphone (autorise Node.js dans le pare-feu Windows).

## 4. Configuration Supabase

1. Crée un projet sur `https://supabase.com` (région Europe – Paris si disponible).
2. Dans **SQL Editor**, exécute les fichiers **dans cet ordre**, en copiant tout leur contenu :
   1. `supabase/01_schema.sql`
   2. `supabase/02_functions.sql`
   3. `supabase/03_rls.sql`
   4. `supabase/04_seed.sql`
3. Dans **Storage**, crée un bucket nommé `providers` :
   - public : oui ;
   - taille maximale : 2 Mo ;
   - types MIME : `image/jpeg`, `image/png`, `image/webp`.
4. Dans **Project Settings → API**, copie :
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - la clé **`service_role`** (ancien tableau de bord) ou la **Secret key** `sb_secret_...` (nouveau) → `SUPABASE_SERVICE_ROLE_KEY`. Jamais la clé `anon` / `publishable`.

Variables `.env.local` :

```
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://ton-projet.supabase.co
SUPABASE_SERVICE_ROLE_KEY=ta-cle-service-role-ou-secret-key
ADMIN_PASSWORD=un-mot-de-passe-long-et-unique
AUTH_SECRET=une-chaine-aleatoire-de-32-octets-minimum
NEXT_PUBLIC_ADMIN_WHATSAPP=237672115570
```

Génère `AUTH_SECRET` :

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

> Si ton mot de passe contient `#`, mets-le entre guillemets doubles dans `.env.local`.
> Après toute modification de `.env.local`, arrête le serveur (`Ctrl + C`) et relance `npm run dev`.

## 5. Accès administration

- URL : `http://localhost:3000/admin`
- Mot de passe : la valeur de `ADMIN_PASSWORD`.
- La session est un cookie JWT `httpOnly` de 8 heures, protégé par `middleware.ts`.
- Le mot de passe se change uniquement dans les variables d’environnement (local et Vercel).

## 6. Scripts

| Commande | Effet |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production |
| `npm start` | Serveur de production (après build) |
| `npm run lint` | ESLint |
| `node scripts/check-supabase.mjs` | Vérifie les clés, les fonctions SQL, la vue et le bucket |

## 7. Structure

```
.
├─ supabase/
│  ├─ 01_schema.sql          Tables, contraintes, index, vue publique
│  ├─ 02_functions.sql       RPC : suivi, annulation, notation, distance, stats
│  ├─ 03_rls.sql             RLS, privilèges, grants
│  └─ 04_seed.sql            6 prestataires de démonstration
├─ src/
│  ├─ actions/               Server Actions (création, notation, admin…)
│  ├─ app/                   Pages et routes API
│  ├─ components/            UI, parcours client, admin
│  ├─ lib/                   Supabase, auth, validation, format, constantes
│  ├─ types/                 Types TypeScript
│  └─ middleware.ts          Protection de /admin
├─ public/icon.svg
├─ scripts/check-supabase.mjs  Vérification de la configuration Supabase
├─ next.config.mjs
├─ tailwind.config.ts
└─ .env.example
```

## 8. Modèle de données

- `providers` : nom, métier, spécialité, quartier, coordonnées, WhatsApp, photo, statut, disponibilité, note moyenne, nombre d’avis, `est_demo`.
- `requests` : token public unique, catégorie, problème, description, téléphone, position, quartier, statut, prestataire assigné, dates, `note_donnee`, `est_demo`.
- `ratings` : une note par demande, étoiles, résolu, commentaire.

Statuts d’une demande : `nouvelle`, `en_recherche`, `assignee`, `resolue`, `annulee`, `expiree`.
Statuts d’un prestataire : `en_attente`, `valide`, `refuse`, `suspendu`.

## 9. Déploiement Vercel

1. Crée un dépôt GitHub **vide** `life-connect`.
2. Le dossier est déjà un dépôt Git local avec un commit initial. Pousse-le :

```powershell
git remote add origin https://github.com/TON-COMPTE/life-connect.git
git push -u origin main
```

Si tu modifies des fichiers avant de pousser :

```powershell
git add .
git commit -m "Mise à jour"
git push
```

3. Sur `https://vercel.com/new`, importe le dépôt. Framework : **Next.js**.
4. Ajoute les 6 variables d’environnement (mêmes valeurs que `.env.local`, sauf `NEXT_PUBLIC_APP_URL`).
5. Déploie, puis récupère l’URL de production.
6. Modifie `NEXT_PUBLIC_APP_URL` avec cette URL exacte (sans slash final) et **redéploie**.
7. Teste : accueil, création de demande, connexion admin, assignation, notation, export CSV.

Le guide détaillé, clic par clic, se trouve dans [`GUIDE_DEMARRAGE.md`](GUIDE_DEMARRAGE.md).

## 10. Sécurité

- `SUPABASE_SERVICE_ROLE_KEY` reste côté serveur ; aucun composant client ne l’importe.
- `.env.local` est ignoré par Git (`.gitignore`).
- Les Server Actions admin revérifient la session, en plus du middleware.
- Toutes les entrées sont validées avec Zod côté serveur, puis contraintes en base.
- RLS activée : le public n’a aucun `select` direct sur `requests` ou `providers`.
- Le numéro WhatsApp d’un prestataire n’est renvoyé qu’après assignation.
- Limitation : 3 demandes/h par téléphone, 2 inscriptions/h par WhatsApp, 5 tentatives de connexion/15 min.

Test RLS dans Supabase SQL Editor :

```sql
set role anon;
select * from public.requests;          -- doit échouer ou renvoyer 0 ligne
select * from public.providers;         -- doit échouer ou renvoyer 0 ligne
select * from public.providers_public;  -- doit réussir
reset role;
```

## 11. Données de démonstration

Le seed ajoute 6 prestataires fictifs marqués `est_demo = true` et affichés « DÉMO » dans l’admin. Avant l’ouverture au public :

```sql
delete from public.providers where est_demo = true;
```

## 12. Limites connues de la V1

- Pas de compte client ni prestataire (voulu pour le MVP).
- Pas de paiement, de messagerie interne ni d’API WhatsApp payante.
- La limitation de débit en mémoire est indicative sur Vercel (plusieurs instances possibles) ; la base reste la protection principale.
- Pas de service worker : le site n’est pas utilisable hors ligne.
- Les photos sont stockées dans Supabase Storage ; le bucket doit rester public en lecture.

## 13. Dépannage

| Problème | Solution |
|---|---|
| `Supabase n’est pas configuré` | Renseigner `.env.local`, redémarrer le serveur |
| `Administration non configurée` | `ADMIN_PASSWORD` manquant dans `.env.local` ou Vercel |
| Connexion admin refusée | Vérifier le mot de passe, puis supprimer le cookie `lc_admin` |
| `function get_request_by_token does not exist` | Exécuter `02_functions.sql`, puis `notify pgrst, 'reload schema';` |
| `new row violates row-level security policy` | Vérifier que l’action utilise la clé service role, pas la clé anon |
| Photo non affichée | Bucket `providers` public + `remotePatterns` dans `next.config.mjs` |
| Build Vercel échoue | Lire les logs ; vérifier Node et les variables |
| Projet Supabase en pause | Le réactiver dans le tableau de bord |

## 14. Contact

- WhatsApp : +237 672 115 570 (secours : +237 656 151 246)
- E-mail : dmwleroi17@gmail.com
- Douala, Cameroun
