# GUIDE DE MISE EN LIGNE — LIFE CONNECT

## 1. Où en est le projet

Le code est construit et le build passe. La base Supabase actuelle contient
encore **uniquement l’ancien schéma V1** : les tables `regions`, `categories`,
`posts`, `profiles` n’existent pas encore. Tant que les migrations V2 et V3 ne
sont pas exécutées :

- HELP ME continue de fonctionner avec les 3 catégories historiques ;
- les pages régions, catalogue, urgences détaillées et LIFE CONNECT restent
  vides ou partielles.

Trois scripts suffisent :

1. `supabase/V2_ALL.sql` (géographie, catalogue, urgences, zones)
2. `supabase/V3_ALL.sql` (comptes, profils, demandes/offres, propositions)
3. `supabase/V4_ALL.sql` (chat, GPS, wallet, notifications, modération)

---

## 2. Exécuter les migrations

Dans Supabase → **SQL Editor** :

1. Ouvre `supabase/V2_ALL.sql`, `Ctrl+A`, `Ctrl+C`, colle et **Run**.
2. Attends le message **Success**.
3. Ouvre `supabase/V3_ALL.sql`, même opération.
4. Ouvre `supabase/V4_ALL.sql`, même opération.
5. Exécute :

```sql
notify pgrst, 'reload schema';
```

Si l’éditeur refuse le fichier V2 complet (il est long), exécute les fichiers
05 à 10 un par un, dans l’ordre, puis 11.

> Les scripts sont prévus pour ne pas supprimer les demandes existantes. Ils
> ajoutent des tables et des colonnes. Le seed V2 supprime uniquement les
> prestataires marqués `est_demo = true` avant de les recréer.

---

## 3. Activer les comptes

Dans **Authentication → Providers → Email** :

- active Email ;
- pour tester immédiatement, désactive **Confirm email** ;
- pour la production, réactive la confirmation d’adresse.

L’inscription crée automatiquement un profil via un trigger.

---

## 4. Variables d’environnement

Dans `.env.local` :

```
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://ton-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=ta-cle-anon
SUPABASE_SERVICE_ROLE_KEY=ta-cle-service-role
ADMIN_PASSWORD=un-mot-de-passe-long
AUTH_SECRET=une-chaine-de-32-octets
NEXT_PUBLIC_ADMIN_WHATSAPP=237672115570
```

Optionnel, pour LIFE AI :

```
LIFE_AI_API_URL=
LIFE_AI_API_KEY=
LIFE_AI_MODEL=
```

Sans ces trois variables, LIFE MATCH utilise les règles locales : aucune
fonctionnalité ne casse.

> **Sécurité :** si tu avais mis tes vraies clés dans `.env.example`, elles ont
> été retirées. Par précaution, régénère la clé `service_role` dans Supabase et
> change `ADMIN_PASSWORD`, puis mets à jour `.env.local` et Vercel. Ne mets
> jamais ces valeurs dans un fichier suivi par Git.

---

## 5. Vérifier la configuration

```powershell
cd C:\Users\LEROI\Desktop\LIFE-CONNCT
node scripts/check-supabase.mjs
```

Tu dois voir :

- connexion Supabase ;
- fonction `admin_stats` ;
- 10 régions ;
- table `categories` ;
- fiches d’urgence ;
- fonctions `providers_for_request` et `admin_stats_by_region` ;
- tables `profiles`, `posts`, `proposals` ;
- clé anon présente.

Puis :

```powershell
npm run dev
```

---

## 6. Tester les parcours

### A. Aide classique

1. `/aide` → Mécanicien → Pneu crevé.
2. Numéro, région, quartier, consentement.
3. La page de suivi s’ouvre.
4. Admin → demandes → alerter → assigner.
5. Le client voit le prestataire et peut noter.

### B. Comptes

1. `/inscription` : créer un compte particulier.
2. Si la confirmation e-mail est active, confirmer l’adresse.
3. `/compte` : modifier le profil.
4. `/deconnexion` via le bouton du compte.

### C. LIFE CONNECT

1. `/connect/nouveau` : publier un besoin.
2. Créer un deuxième compte.
3. Répondre à la demande.
4. Avec le premier compte, accepter la proposition.
5. La demande passe « en cours » ; la clôturer.

### D. LIFE MATCH

1. `/match?q=je cherche un plombier à Akwa`.
2. Vérifier que les résultats proviennent uniquement de la base.
3. Cliquer sur un prestataire : profil public, sans numéro.

### E. Urgences

1. `/urgence` : 117, 118, 119.
2. Ouvrir une fiche.
3. Vérifier les établissements et le lien itinéraire.
4. Tester « Envoyer ma position à un proche ».

### F. LIFE CHAT

1. Accepter une proposition depuis `/connect/[id]`.
2. La conversation s’ouvre dans `/messages`.
3. Envoyer un message, une image et une position.
4. Vérifier l’arrivée en temps réel dans un second navigateur.
5. Clôturer la mission.

### G. Suivi GPS

1. Dans l’admin, ouvrir une demande assignée.
2. Cliquer « Lien GPS prestataire » et ouvrir le lien sur un téléphone.
3. Partager la position.
4. Côté client, ouvrir `/suivi/[token]/carte` : la position se met à jour.

### H. Wallet et notifications

1. `/wallet` : demander une recharge.
2. Admin → Paiements : confirmer.
3. Vérifier le solde et la notification.
4. `/notifications` : marquer tout comme lu.

### I. Admin

1. `/admin/utilisateurs` : suspendre/réactiver un compte.
2. `/admin/publications` : masquer une publication.
3. `/admin/sos` : voir les alertes.
4. `/admin/paiements` : confirmer/annuler.

---

## 7. GitHub et Vercel

Le dépôt local est déjà initialisé. Crée un dépôt GitHub vide `life-connect`,
puis :

```powershell
git remote add origin https://github.com/TON-COMPTE/life-connect.git
git push -u origin main
```

Si `origin` existe déjà :

```powershell
git remote set-url origin https://github.com/TON-COMPTE/life-connect.git
git push -u origin main
```

Sur Vercel :

1. **Add New → Project** → importer `life-connect`.
2. Framework : Next.js.
3. Ajouter les variables :
   `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
   `ADMIN_PASSWORD`, `AUTH_SECRET`, `NEXT_PUBLIC_ADMIN_WHATSAPP`.
4. Déployer.
5. Remplacer `NEXT_PUBLIC_APP_URL` par l’URL de production, puis redéployer.
6. Dans Supabase → Authentication → URL Configuration, ajouter l’URL Vercel et
   `${URL}/auth/callback` dans les Redirect URLs.

---

## 8. Après le déploiement

- Tester `/api/health`.
- Créer un compte réel, publier, répondre.
- Vérifier que `/compte` redirige vers `/connexion` sans session.
- Vérifier que `/messages`, `/wallet`, `/notifications` redirigent sans session.
- Vérifier que `/admin` reste protégé par le mot de passe.
- Supprimer les données de démonstration :

```sql
delete from public.providers where est_demo = true;
```

- Sauvegarder les accès Supabase, GitHub, Vercel.
- Activer la confirmation e-mail en production.

---

## 9. Dépannage

| Problème | Solution |
|---|---|
| `regions` introuvable | Exécuter `V2_ALL.sql` |
| `posts` introuvable | Exécuter `V3_ALL.sql` |
| Inscription mais pas de profil | Vérifier le trigger `on_auth_user_created`, ou se reconnecter (le profil est réparé au login) |
| Connexion impossible | Vérifier la confirmation e-mail et `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| `/compte` boucle | Vérifier `profiles` et le trigger ; supprimer les cookies `sb-*` |
| Aucun prestataire dans MATCH | Vérifier que les prestataires sont `valide` et ont des services |
| Admin en boucle | Vérifier `AUTH_SECRET` et `ADMIN_PASSWORD` |
| Build Vercel échoue | Coller les logs ; vérifier les variables |
| Photos non affichées | Bucket `providers` public + `remotePatterns` |

---

## 10. Prochaines étapes

Modules déjà ajoutés : chat, suivi GPS, wallet, notifications, profil/paramètres,
admin utilisateurs/publications/SOS/paiements.

Restent à développer :

1. LIFE MARKET (annonces produits, images, modération).
2. LIFE PEOPLE / RADAR / COMMUNITY / EXCHANGE.
3. OTP SMS/WhatsApp et notifications push.
4. Paiement réel Orange Money / MTN MoMo via un agrégateur officiel.
5. Traduction complète FR/EN et multi-pays.
6. 2FA administrateur et sauvegardes automatisées.

Chaque module doit être ajouté avec sa migration SQL, ses politiques RLS et ses
tests, sans casser HELP ME.
