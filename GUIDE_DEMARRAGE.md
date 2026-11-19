# GUIDE DE MISE EN LIGNE — LIFE CONNECT / HELP ME

## 1. État du projet

Le code complet est déjà écrit dans ce dossier :

- application Next.js 14.2 + TypeScript + Tailwind ;
- 4 scripts SQL Supabase ;
- parcours client, espace admin, export CSV, statistiques ;
- `npm run build` validé, 19 routes générées ;
- page d’accueil, formulaires, suivi et pages légales testés en local.

Ce qui reste à faire ne peut pas être fait à ta place : créer **ton** projet Supabase, saisir **tes** clés, pousser sur **ton** GitHub et connecter **ton** Vercel. Ce guide te donne chaque clic.

---

## 2. Les 4 choses à faire

1. Créer le projet Supabase et exécuter les 4 scripts SQL.
2. Remplir `.env.local` et tester le parcours complet en local.
3. Pousser le projet sur GitHub.
4. Importer sur Vercel, ajouter les variables, déployer.

Compte 45 à 60 minutes.

---

## 3. Étape 1 — Créer Supabase

1. Va sur `https://supabase.com` et connecte-toi (GitHub ou `dmwleroi17@gmail.com`).
2. Clique **New project**.
   - Nom : `life-connect`
   - Mot de passe de la base : clique sur **Generate a password**, copie-le dans un endroit sûr.
   - Région : **Europe (Paris)** si proposée, sinon **Frankfurt**.
3. Attends 1 à 2 minutes que le projet soit prêt.
4. Ouvre **SQL Editor** (icône terminal dans le menu de gauche).
5. Pour chaque fichier, dans cet ordre :
   - ouvre le fichier dans VS Code ;
   - `Ctrl + A`, `Ctrl + C` ;
   - colle dans l’éditeur SQL de Supabase ;
   - clique **Run** (ou `Ctrl + Entrée`) ;
   - vérifie le message **Success**.

Ordre obligatoire :

1. `supabase/01_schema.sql`
2. `supabase/02_functions.sql`
3. `supabase/03_rls.sql`
4. `supabase/04_seed.sql`

> Si une erreur apparaît, copie-la-moi avec le numéro de ligne et le nom du fichier. Ne passe pas au fichier suivant tant que le précédent n’a pas réussi.

6. Crée le bucket de photos :
   - menu **Storage** → **New bucket** ;
   - nom : `providers` ;
   - **Public bucket** : activé ;
   - **File size limit** : `2 MB` ;
   - **Allowed MIME types** : `image/jpeg`, `image/png`, `image/webp` ;
   - **Create bucket**.

7. Récupère les clés :
   - **Project Settings** (roue dentée) → **API** ;
   - copie **Project URL** ;
   - copie la clé **`service_role`** (ancien tableau de bord) ou **Secret key** `sb_secret_...` (nouveau tableau de bord). Ne prends **jamais** la clé `anon` / `publishable`.

---

## 4. Étape 2 — Remplir `.env.local`

Dans VS Code, ouvre le terminal (`Ctrl + ù` ou **Terminal → Nouveau terminal**) :

```powershell
cd C:\Users\LEROI\Desktop\LIFE-CONNCT
Copy-Item .env.example .env.local
notepad .env.local
```

Remplis exactement ces 6 lignes :

```
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://ton-projet.supabase.co
SUPABASE_SERVICE_ROLE_KEY=ta-cle-service-role-ou-secret-key
ADMIN_PASSWORD=ton-mot-de-passe-admin
AUTH_SECRET=la-chaine-generee-ci-dessous
NEXT_PUBLIC_ADMIN_WHATSAPP=237672115570
```

Génère `AUTH_SECRET` :

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Copie le résultat (une longue chaîne) dans `AUTH_SECRET`.

Règles :

- Pas d’espace autour du `=`.
- Si le mot de passe contient `#`, mets-le entre guillemets doubles : `ADMIN_PASSWORD="Mon#MotDePasse"`.
- Ne mets jamais `.env.local` sur GitHub.
- Après chaque modification, arrête le serveur (`Ctrl + C`) et relance.

---

## 5. Étape 3 — Tester en local

Avant de lancer le site, vérifie la configuration Supabase :

```powershell
node scripts/check-supabase.mjs
```

Le script contrôle : les variables, la connexion, la fonction `admin_stats`, la vue `providers_public`, le bucket `providers` et la table `requests`. Il n’affiche jamais tes clés.

Puis lance :

```powershell
npm run dev
```

Ouvre `http://localhost:3000`.

### Test 1 — Accueil

Tu dois voir :

- le bandeau d’urgence ;
- le gros bouton rouge **J’AI BESOIN D’AIDE** ;
- les 3 catégories ;
- le bloc « Comment ça marche ».

### Test 2 — Créer une demande

1. Clique **J’AI BESOIN D’AIDE**.
2. Choisis **Mécanicien**.
3. Choisis **Pneu crevé**.
4. Saisis ton numéro (9 chiffres, ex. `672115570`).
5. Choisis **Akwa**.
6. Refuse la géolocalisation (ou accepte).
7. Coche le consentement.
8. Clique **TROUVER UN PRESTATAIRE**.

Tu dois arriver sur `/suivi/...` avec un compte à rebours de 5 minutes.

### Test 3 — Admin

1. Va sur `http://localhost:3000/admin`.
2. Saisis le mot de passe `ADMIN_PASSWORD`.
3. La demande apparaît dans le tableau.
4. Ouvre-la.
5. Les prestataires mécaniciens apparaissent, triés par distance.
6. Clique **Alerter** : WhatsApp s’ouvre avec le message pré-rempli (tu peux ne pas envoyer).
7. Clique **Assigner** sur un prestataire.

### Test 4 — Côté client

Reviens sur la page de suivi. En moins de 6 secondes, tu dois voir :

- le nom du prestataire ;
- sa note et sa distance ;
- les boutons **Appeler** et **WhatsApp**.

**Test de confidentialité :** avant l’assignation, fais `Ctrl + U` sur la page de suivi et cherche le numéro du prestataire. Il ne doit pas y être.

### Test 5 — Notation

1. Sur la page de suivi, clique **Noter le prestataire**.
2. Mets 5 étoiles, choisis **Oui**, écris un commentaire.
3. Envoie.
4. Retourne dans l’admin : la note moyenne du prestataire a augmenté.
5. Réessaie de noter : le deuxième avis doit être refusé.

### Test 6 — Inscription prestataire

1. Va sur `/prestataire/inscription`.
2. Remplis le formulaire avec une photo.
3. Envoie.
4. Dans l’admin → **Prestataires**, le profil est **En attente**.
5. Clique **Valider**.
6. Il devient proposable dans les demandes de sa catégorie.

### Test 7 — Export CSV

Dans l’admin, clique **Exporter en CSV**. Le fichier doit s’ouvrir dans Excel avec les accents corrects.

---

## 6. Étape 4 — GitHub

Le dossier est **déjà** un dépôt Git local, avec un premier commit qui contient tout le code. Tu n’as donc pas besoin de refaire `git init`, `git add` et `git commit`, sauf si tu modifies des fichiers toi-même.

Crée d’abord un dépôt **vide** sur `https://github.com/new` :

- nom : `life-connect` ;
- visibilité : privé de préférence ;
- **ne coche ni README, ni .gitignore, ni licence**.

Puis dans VS Code :

```powershell
cd C:\Users\LEROI\Desktop\LIFE-CONNCT
git status
git remote add origin https://github.com/TON-COMPTE/life-connect.git
git push -u origin main
```

Si `git status` affiche des fichiers modifiés que tu veux garder :

```powershell
git add .
git commit -m "Mise à jour"
```

Vérifie que `.env.local` **n’apparaît jamais** dans `git status`.

Si Git demande une authentification, utilise un **Personal Access Token** GitHub (Settings → Developer settings → Personal access tokens) comme mot de passe. Ne me partage jamais ce token.

---

## 7. Étape 5 — Vercel

1. Va sur `https://vercel.com/new`.
2. Clique **Import Git Repository** et choisis `life-connect`.
3. Framework Preset : **Next.js** (détecté).
4. Root Directory : `.` (la racine du dépôt).
5. Dans **Environment Variables**, ajoute les 6 variables :

| Nom | Valeur |
|---|---|
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` pour l’instant |
| `NEXT_PUBLIC_SUPABASE_URL` | ton URL Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | ta clé service role / secret |
| `ADMIN_PASSWORD` | ton mot de passe admin |
| `AUTH_SECRET` | la même chaîne que `.env.local` |
| `NEXT_PUBLIC_ADMIN_WHATSAPP` | `237672115570` |

6. Clique **Deploy** et attends 1 à 3 minutes.
7. Copie l’URL de production (`https://life-connect-xxxx.vercel.app`).
8. **Settings → Environment Variables** → modifie `NEXT_PUBLIC_APP_URL` avec cette URL exacte, sans slash final.
9. **Deployments → … → Redeploy** pour appliquer la nouvelle valeur.

Optionnel : **Settings → Functions → Region** → **Paris (cdg1)** pour réduire la latence depuis le Cameroun.

---

## 8. Étape 6 — Vérifier en production

1. Ouvre `https://ton-url.vercel.app/api/health` : tu dois voir `{"ok":true,...}`.
2. Refais le parcours complet depuis ton téléphone, en 3G si possible.
3. Vérifie la connexion admin en HTTPS.
4. Vérifie que le cookie `lc_admin` est bien `Secure` (onglet Application des outils de développement).
5. Supprime les données de démonstration :

```sql
delete from public.providers where est_demo = true;
```

6. Change le mot de passe admin si tu as utilisé un mot de passe de test.

---

## 9. Dépannage

| Problème | Cause | Solution |
|---|---|---|
| `Supabase n’est pas configuré` | `.env.local` absent ou incomplet | Vérifier les 2 variables Supabase, redémarrer |
| `Administration non configurée` | `ADMIN_PASSWORD` absent | Ajouter la variable, redémarrer ou redéployer |
| Connexion admin en boucle | `AUTH_SECRET` différent entre local et Vercel | Mettre la même valeur, vider les cookies |
| `function ... does not exist` | Script `02_functions.sql` non exécuté | L’exécuter puis `notify pgrst, 'reload schema';` |
| `row-level security policy` | Écriture directe sans service role | Vérifier que l’action serveur utilise `getSupabaseAdmin` |
| Photo non affichée | Bucket non public | Storage → `providers` → rendre public |
| `Invalid src prop` | Domaine Supabase non autorisé | Vérifier `remotePatterns` dans `next.config.mjs` |
| `Port 3000 already in use` | Ancien serveur | `npx kill-port 3000` puis `npm run dev` |
| Build Vercel échoue | Logs | Coller l’erreur exacte pour correction |
| Projet Supabase en pause | Inactivité | Le réactiver dans Supabase |

---

## 10. Sécurité — à ne pas négliger

- `.env.local` ne doit jamais être commité. Vérifie `git status` avant chaque `git add`.
- La clé `service_role` / `sb_secret_...` est un secret serveur. Ne la colle dans aucun chat, aucun fichier public, aucune capture d’écran.
- `ADMIN_PASSWORD` doit être long et unique.
- Si une clé fuite : Supabase → **Settings → API → Rotate**, puis mets à jour Vercel et `.env.local`.
- Teste la RLS dans Supabase SQL Editor :

```sql
set role anon;
select * from public.requests;          -- doit échouer ou renvoyer 0 ligne
select * from public.providers;         -- doit échouer ou renvoyer 0 ligne
select * from public.providers_public;  -- doit réussir
reset role;
```

---

## 11. Checklist avant d’ouvrir au public

- [ ] Les 4 scripts SQL sont exécutés sans erreur.
- [ ] Le bucket `providers` est public, limité à 2 Mo.
- [ ] `.env.local` est rempli et le serveur redémarre sans erreur.
- [ ] Le parcours complet fonctionne en local.
- [ ] Le numéro du prestataire n’apparaît pas avant assignation.
- [ ] La notation met à jour la moyenne.
- [ ] L’inscription prestataire + validation fonctionne.
- [ ] L’export CSV s’ouvre dans Excel.
- [ ] Les données `est_demo` sont supprimées.
- [ ] Le dépôt GitHub ne contient pas `.env.local`.
- [ ] Les 6 variables sont présentes sur Vercel.
- [ ] `NEXT_PUBLIC_APP_URL` correspond à l’URL de production.
- [ ] Le parcours fonctionne en production depuis un téléphone.
- [ ] Le mot de passe admin a été changé.

---

## 12. Commandes utiles

```powershell
# Installer
npm install

# Développement
npm run dev

# Build de production
npm run build

# Lancer le build
npm start

# Vérifier les types
node .\node_modules\typescript\bin\tsc --noEmit

# Voir l’état Git
git status

# Voir les fichiers ignorés
git status --ignored
```

---

## 13. Ce que je peux faire ensuite

- Corriger une erreur exacte que tu me colles (message + fichier + commande).
- Ajouter une fonctionnalité : compte prestataire, disponibilité, SMS, paiement, statistiques avancées.
- T’aider à préparer une page de présentation ou un message WhatsApp pour les premiers prestataires.

En cas de blocage, envoie-moi :

1. la commande exécutée ;
2. le message d’erreur complet ;
3. le fichier concerné si tu le connais.
