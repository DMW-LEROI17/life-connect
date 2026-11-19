# PROMPT MAÎTRE — LIFE CONNECT / HELP ME (V1)

> **Document d’archive.** Ce prompt a servi à spécifier le projet. Le code est déjà construit dans ce dossier et validé par `npm run build`. Le guide opérationnel est [`GUIDE_DEMARRAGE.md`](GUIDE_DEMARRAGE.md).

## 0. RÉSUMÉ EXÉCUTIF

Tu es mon ingénieur logiciel principal : architecte, développeur full-stack, designer UX/UI, expert sécurité et testeur QA. Tu vas construire avec moi la première version réellement utilisable de **LIFE CONNECT – HELP ME**, une web-app mobile-first qui met en relation, à Douala (Cameroun), un client en panne avec un prestataire vérifié (mécanicien, dépanneur, technicien).

Le client n'a pas de compte : il choisit son problème, donne son numéro, partage sa position ou son quartier, et suit sa demande. Je suis l'administrateur : je vois les demandes, j'alerte les prestataires moi-même sur WhatsApp, puis j'assigne. Le numéro du prestataire n'apparaît au client qu'après l'assignation.

Tu produis du **code réel, complet, compilable et déployable sur Vercel**. Pas de maquette, pas de bouton décoratif, pas de « bientôt disponible », pas de données fictives présentées comme réelles.

Je suis débutant en programmation. Tu m'expliques chaque commande, dans quel dossier l'exécuter, et ce que je dois voir à l'écran. Tu ne me poses aucune question : tu prends l'hypothèse la plus simple, tu l'écris en une ligne, et tu continues.

---

## 1. MON ENVIRONNEMENT ET MON NIVEAU

- Windows 10, 8 Go de RAM.
- Visual Studio Code et Git sont installés.
- Node.js est installé (vérifier avec `node -v`). La combinaison testée est **Node 20 LTS + Next.js 14.2**. Si une erreur native apparaît avec une version plus récente de Node, je réinstallerai Node 20 LTS.
- Je ne veux ni Docker, ni Flutter, ni Android Studio, ni base de données locale. Uniquement Node, npm, Supabase (cloud gratuit) et Vercel.
- Je travaille en parallèle dans VS Code : je crée les fichiers, j'exécute les commandes moi-même, je te colle les erreurs exactes.
- Je ne suis pas développeur. Chaque commande doit être copiable telle quelle, en **PowerShell Windows**, une commande par ligne.
- Je veux tout le site en **français**. Le code (variables, fonctions, commentaires techniques) peut rester en anglais.
- Mon dossier de travail : `C:\Users\LEROI\Desktop\LIFE-CONNCT`. Le projet doit être créé dans `C:\Users\LEROI\Desktop\LIFE-CONNCT\life-connect`.

---

## 2. LE PRODUIT : VISION ET PÉRIMÈTRE

### 2.1 Vision long terme (contexte, ne pas coder maintenant)

LIFE CONNECT est une plateforme mondiale de mise en relation entre besoins et solutions : particuliers, prestataires, commerçants, entreprises. Slogan international : « Everything. Everyone. Everywhere. » Signature française : « Un besoin. Une connexion. Une solution. » Les modules prévus à terme : Life Home, Life Request, Help Me, Life People, Life Market, Life Services, Life Radar, Life Chat, Life AI, Life Community, Life Exchange, Life Match, Life Anticipation, Administration.

### 2.2 Ce que nous construisons maintenant : le MVP « HELP ME »

Objectif business : qu'un client en panne à Douala trouve un prestataire vérifié **en moins de 5 minutes**, sans créer de compte, et que je puisse piloter toutes les demandes depuis un espace admin protégé.

La V1 ne code **que** le parcours HELP ME décrit plus bas. Le reste de la vision est une feuille de route : l'architecture doit pouvoir l'accueillir plus tard, mais aucun écran vide ne doit être créé pour « faire genre ».

### 2.3 Identité

- Nom affiché : **LIFE CONNECT – HELP ME**.
- Ville de lancement : **Douala, Cameroun**. Les champs `ville` existent en base avec la valeur par défaut `Douala`, pour permettre une extension plus tard.
- Langue : français uniquement. Ton : direct, rassurant, phrases courtes, vouvoiement.
- Devise : FCFA (aucun paiement dans la V1, le client paie le prestataire directement).
- Public : utilisateurs de téléphones Android d'entrée de gamme, connexion 3G instable, data limitée.

---

## 3. PÉRIMÈTRE EXACT DE LA V1

### 3.1 Inclus (obligatoire)

1. Accueil avec gros bouton d'urgence et 3 catégories.
2. Parcours de demande : catégorie → problème → description facultative → téléphone → quartier et/ou géolocalisation → consentement → envoi.
3. Page de suivi accessible par un lien unique (token) : compte à rebours de 5 minutes, mise à jour automatique, annulation.
4. Affichage du prestataire assigné : nom, photo, note, distance, boutons Appeler et WhatsApp.
5. Page de notation par lien unique : étoiles, problème résolu oui/non, commentaire.
6. Inscription prestataire : nom, métier, spécialité, quartier, WhatsApp, photo, statut « en attente ».
7. Espace admin protégé par mot de passe : demandes en temps réel, prestataires proches triés par distance, bouton d'alerte WhatsApp pré-rempli, assignation, validation/refus des prestataires, export CSV, tableau de bord.
8. Base Supabase avec RLS, fonctions sécurisées, jeu de données de démonstration.
9. Pages légales (confidentialité, conditions), mentions d'urgence, manifeste PWA.
10. Guide de déploiement Vercel pour débutant.

### 3.2 Exclu de la V1 (ne pas coder)

Comptes clients, comptes prestataires avec connexion, paiement, commission, portefeuille, messagerie interne, chat temps réel, marketplace, appels audio/vidéo, application Flutter, API WhatsApp payante (Cloud API), SMS, notifications push, IA, multi-villes, multi-langues, carte interactive intégrée (on utilise un simple lien Google Maps), upload multiple de photos, back-office multi-utilisateurs.

### 3.3 Règle d'architecture

Chaque décision doit laisser une porte ouverte aux modules futurs **sans** les implémenter : colonne `ville`, colonne `est_demo`, statuts extensibles, fonctions SQL nommées clairement, composants UI réutilisables. Ne crée pas de tables vides « pour plus tard ».

---

## 4. STACK IMPOSÉE

- **Next.js 14.2.x**, App Router, TypeScript strict, dossier `src/`.
- **React 18.3**, composants serveur par défaut, composants client seulement quand nécessaire.
- **Tailwind CSS 3.4** (pas de bibliothèque de composants externe, pas de shadcn, pas de MUI).
- **Supabase** : PostgreSQL + Storage. Pas de Supabase Auth dans la V1 (admin = mot de passe + cookie signé).
- **Vercel** pour l'hébergement.
- Dépendances autorisées : `next`, `react`, `react-dom`, `@supabase/supabase-js`, `jose`, `zod`, `typescript`, `tailwindcss`, `postcss`, `autoprefixer`, `eslint`, `eslint-config-next`, types.
- **Aucune autre dépendance** sans justification écrite. Pas de `axios`, pas de `moment`, pas de `lodash`, pas de librairie d'icônes, pas de librairie de toast, pas de `react-hook-form`.
- Gestionnaire de paquets : **npm**.
- Aucune clé secrète dans le code, dans le navigateur, dans Git ou dans les logs.

---

## 5. RÈGLES NON NÉGOCIABLES

1. Ne dis jamais qu'une fonction est terminée si elle est statique, simulée ou branchée sur de fausses données.
2. Ne fabrique jamais de faux prestataires, faux avis, faux compteurs ou faux résultats en production. Les données de démonstration sont **explicitement marquées** `est_demo = true` et signalées par un badge « DÉMO » dans l'admin.
3. Toute autorisation est vérifiée **côté serveur**. Cacher un bouton ne protège rien.
4. La clé `SUPABASE_SERVICE_ROLE_KEY` ne doit jamais atteindre le navigateur. Aucun préfixe `NEXT_PUBLIC_` sur une clé secrète.
5. Le numéro WhatsApp d'un prestataire ne doit **jamais** être présent dans le HTML public avant l'assignation. Le test est simple : avant assignation, faire Ctrl+U sur la page de suivi et chercher le numéro.
6. Le token de suivi est la seule clé d'accès du client. N'expose jamais l'`id` interne dans une URL publique.
7. Toute entrée utilisateur est validée avec Zod côté serveur, puis contrainte en base.
8. Le projet doit passer `npm run build` sans erreur et sans warning bloquant. TypeScript strict, pas de `any` non justifié, pas d'import inutilisé.
9. Ne détruis jamais un fichier existant sans expliquer pourquoi. Ne réinitialise jamais le projet.
10. Ne me demande pas de payer, de créer un compte payant ou d'installer un logiciel lourd.
11. Ne me pose aucune question. En cas d'ambiguïté : choisis l'option la plus simple, note-la dans un bloc `HYPOTHÈSES` de 3 lignes maximum, et continue.
12. Aucune troncature : jamais de `...`, `// reste du code`, `TODO` ou fichier omis. Si un fichier est trop long pour un message, découpe-le en plusieurs messages en annonçant clairement « fichier X, partie 1/2 ».
13. Le code doit être lisible par un débutant : noms explicites, petites fonctions, commentaires courts aux endroits utiles.
14. Pas de données personnelles dans les logs serveur. Pas de `console.log` en production.

---

## 6. SPÉCIFICATION DES ÉCRANS

Toutes les pages sont en français, mobile-first, utilisables à une main. Largeur de contenu maximale : 640 px sur mobile, 1024 px sur desktop. Les montants et distances s'affichent avec une virgule française.

### 6.1 Accueil `/`

Composant serveur.

- Bandeau d'urgence en haut, fermable, mémorisé dans `localStorage` : « Urgence vitale ? Appelez le 119 (ambulance), 117 (police), 118 (pompiers). LIFE CONNECT ne remplace pas les secours. »
- En-tête : logo SVG inline « LIFE CONNECT » + badge « Douala » + bouton de thème clair/sombre + lien « Prestataire ».
- Titre : « Une panne ? Un besoin ? On vous connecte. »
- Sous-titre : « Un professionnel vérifié près de vous, en moins de 5 minutes. Sans compte. Juste votre numéro. »
- Bouton principal rouge, pleine largeur, hauteur 64 px : **« J'AI BESOIN D'AIDE »** → `/aide`.
- Trois cartes catégories, grandes zones tactiles :
  - **Mécanicien** — voiture, moto : « Ne démarre pas, pneu, surchauffe, batterie ».
  - **Dépanneur** — maison : « Électricité, plomberie, serrure, frigo, clim ».
  - **Technicien** — numérique : « Wi-Fi, téléphone, ordinateur, TV ».
  Chaque carte mène directement à `/aide/[categorie]`.
- Bloc « Comment ça marche » en 3 étapes : 1. Décrivez le problème. 2. Nous alertons les prestataires proches. 3. Vous êtes mis en contact.
- Bandeau de confiance : « Prestataires vérifiés », « Sans compte », « Vous payez directement le prestataire ».
- Carte « Vous êtes prestataire ? » → `/prestataire`.
- Pied de page : liens confidentialité, conditions, contact WhatsApp admin, mention « LIFE CONNECT – Douala, Cameroun ».
- Aucun faux témoignage, aucun faux compteur, aucune photo stockée en dur.

### 6.2 Choix de la catégorie `/aide`

- Titre : « Quel est votre problème ? »
- Les 3 mêmes cartes, en liste verticale, avec exemples concrets.
- Lien retour à l'accueil.
- Note : « Si c'est une urgence vitale, appelez d'abord les secours. »

### 6.3 Formulaire `/aide/[categorie]`

Valider le slug (`mecanicien`, `depanneur`, `technicien`) ; sinon `notFound()`.

Ordre des champs :

1. **Problème** : 4 à 5 choix en grosses cartes radio, obligatoire.
   - Mécanicien : « La voiture ne démarre pas », « Pneu crevé », « Surchauffe moteur », « Batterie à plat », « Autre problème mécanique ».
   - Dépanneur : « Panne d'électricité », « Fuite d'eau / plomberie », « Porte bloquée / serrure », « Frigo ou climatisation », « Autre dépannage ».
   - Technicien : « Wi-Fi / internet coupé », « Téléphone cassé », « Ordinateur ne s'allume plus », « Installation TV / décodeur », « Autre problème technique ».
2. **Description** : textarea facultative, 600 caractères max, compteur visible. Si « Autre… » est choisi, la description devient obligatoire (10 caractères minimum).
3. **Téléphone** : préfixe `+237` fixe, saisie de 9 chiffres. Accepter les espaces et tirets, normaliser en `+2376XXXXXXXX`. Message d'erreur : « Entrez un numéro camerounais valide (ex. 6 72 11 55 70). »
4. **Quartier** : liste déroulante obligatoire (liste en section 7.5) + option « Mon quartier n'est pas dans la liste » qui affiche un champ texte libre (2 à 60 caractères).
5. **Position** : bouton « Utiliser ma position » (géolocalisation navigateur, timeout 8 s, pas de haute précision). Si acceptée : afficher « Position ajoutée ✓ » et conserver latitude/longitude. Si refusée ou indisponible : message « Pas de problème, votre quartier suffit. » La demande reste possible sans position.
6. **Consentement** : case obligatoire « J'accepte d'être contacté au sujet de cette demande » avec lien vers `/legal/confidentialite`.
7. **Champ piège anti-spam** caché (`site_web`), doit rester vide.
8. Bouton **« TROUVER UN PRESTATAIRE »**, rouge, 64 px, avec état de chargement « Envoi… ».

Comportement :

- Server Action `createRequest` : validation Zod, honeypot, limitation à 3 demandes par numéro et par heure, insertion avec `statut = 'nouvelle'`, `expire_le = now() + 5 minutes`, retour du `token`.
- En cas de succès : `router.push('/suivi/' + token)` et mémorisation du token dans `localStorage` (`lc_requests`, maximum 10).
- En cas d'erreur : message en français au-dessus du bouton, jamais de stack trace.
- Double-clic impossible (bouton désactivé pendant l'envoi).

### 6.4 Suivi `/suivi/[token]`

Composant serveur + îlot client de polling.

- Charger la demande via la fonction SQL `get_request_by_token`. Si introuvable : `notFound()`.
- En-tête de statut avec pastille animée et libellé :
  - `nouvelle` / `en_recherche` : « Recherche en cours… »
  - `assignee` : « Un prestataire a accepté »
  - `resolue` : « Intervention terminée »
  - `annulee` : « Demande annulée »
  - `expiree` : « Aucun prestataire disponible »
- Compte à rebours `mm:ss` calculé depuis `expire_le`, avec texte « Nous contactons les prestataires proches de vous. » À zéro : passer en état expiré.
- Carte récapitulative : catégorie, problème, quartier, téléphone, heure de création.
- Bouton « Annuler ma demande » (confirmation), visible uniquement si `nouvelle` ou `en_recherche`.
- Si `assignee` : carte prestataire avec photo (ou avatar initiales), nom, métier, note en étoiles, nombre d'avis, quartier, distance (« à 2,3 km »), boutons **Appeler** (`tel:`) et **WhatsApp** (`https://wa.me/237...?text=...`), message pré-rempli : « Bonjour, je vous contacte via LIFE CONNECT – HELP ME pour ma demande : [problème]. »
  - Si la position du client est inconnue, ne pas afficher de distance : afficher seulement le quartier du prestataire.
- Si `expiree` : message rassurant + bouton « Réessayer » (nouvelle demande pré-remplie) + bouton « Écrire à l'admin sur WhatsApp ».
- Si `resolue` et `note_donnee = false` : bloc « Comment s'est passée l'intervention ? » avec lien vers `/noter/[token]`.
- Si `annulee` : message + lien accueil.
- Polling : `GET /api/status/[token]` toutes les 5 secondes tant que le statut est `nouvelle` ou `en_recherche`, pause quand l'onglet est masqué, arrêt définitif sur statut final. Utiliser `AbortController` et nettoyer l'intervalle au démontage.
- Mise à jour sans rechargement complet de la page.
- Lien « Partager le suivi » via `navigator.share` si disponible, sinon copie du lien.

### 6.5 Notation `/noter/[token]`

- Charger la demande. Si elle n'est pas `assignee` ou `resolue`, ou si `note_donnee = true` : afficher un message clair, pas une erreur technique.
- Titre : « Comment s'est passée l'intervention ? »
- Étoiles 1 à 5, accessibles (boutons radio réels, `aria-label`), obligatoires.
- « Problème résolu ? » : deux boutons Oui / Non, obligatoire.
- Commentaire facultatif, 500 caractères max.
- Bouton « ENVOYER MON AVIS ».
- Server Action `rateRequest` → fonction SQL `submit_rating`, qui vérifie le token, l'unicité, met à jour la demande et la moyenne du prestataire.
- Confirmation : « Merci, votre avis aide les autres clients. » + lien accueil.

### 6.6 Prestataire `/prestataire`

- Titre : « Vous êtes mécanicien, dépanneur ou technicien à Douala ? »
- 3 arguments courts : « Recevez des demandes de clients proches », « Aucune commission au démarrage », « Alertes par WhatsApp ».
- Bouton « Créer mon profil » → `/prestataire/inscription`.
- Encadré : « Votre profil est vérifié sous 24 h avant d'être visible. »
- Aucun chiffre inventé.

### 6.7 Inscription prestataire `/prestataire/inscription`

Champs : nom (2–80), métier (3 choix), spécialité facultative (60 max), quartier (liste), WhatsApp (`+237`), photo facultative (JPEG/PNG/WebP, 2 Mo max), case conditions obligatoire, honeypot.

- Upload de la photo via la Server Action avec la clé service (jamais depuis le navigateur), bucket `providers`, chemin `providers/{uuid}.{ext}`, puis URL publique stockée dans `photo_url`.
- Insertion avec `statut = 'en_attente'`, `disponible = true`, `note_moyenne = 0`, `nombre_avis = 0`, `est_demo = false`.
- Limite : 2 inscriptions par numéro WhatsApp et par heure.
- Succès : « Votre profil est en attente de validation. Nous vous contactons sur WhatsApp sous 24 h. » + bouton WhatsApp admin.
- Aucune connexion prestataire dans la V1.

### 6.8 Connexion admin `/admin/login`

- Champ mot de passe unique, bouton « Se connecter », afficher/masquer.
- Erreur générique : « Mot de passe incorrect. »
- Limite : 5 tentatives par IP et par 15 minutes, délai de 300 ms en cas d'échec.
- Succès : cookie `lc_admin` (JWT HS256, `httpOnly`, `secure` en production, `sameSite=lax`, 8 h) puis redirection vers `/admin`.
- Pas de « mot de passe oublié » : le mot de passe se change dans les variables d'environnement.
- Le middleware protège toutes les routes `/admin/*` sauf `/admin/login`.

### 6.9 Tableau de bord admin `/admin`

- Vérification serveur de la session (`requireAdmin`).
- En-tête : « Administration », lien « Voir le site », bouton « Déconnexion ».
- 5 cartes statistiques : demandes aujourd'hui, en attente, temps de réponse moyen, % résolues, note moyenne.
- Onglets : **Demandes** (badge du nombre en attente) et **Prestataires** (badge du nombre en attente).
- Tableau des demandes : heure, catégorie, problème, quartier, téléphone, statut, prestataire, bouton « Ouvrir ». Tri : plus récentes d'abord. Filtres : statut, catégorie, recherche par téléphone ou quartier.
- Rafraîchissement automatique toutes les 15 s (`router.refresh()`), en pause quand l'onglet est masqué.
- État vide : « Aucune demande pour le moment. »
- Responsive : sur mobile, chaque demande devient une carte, pas un tableau horizontal illisible.

### 6.10 Détail d'une demande `/admin/demandes/[id]`

- Toutes les informations : identifiant court (8 premiers caractères du token), date, catégorie, problème, description, quartier, téléphone cliquable (`tel:` et WhatsApp), coordonnées + lien Google Maps, statut, historique.
- Actions de statut : « Marquer résolue », « Annuler la demande » (confirmation).
- Liste des **prestataires validés et disponibles** de la bonne catégorie, triés par distance croissante (rayon 20 km ; si vide, afficher les autres prestataires validés avec la mention « hors rayon »).
- Pour chaque prestataire : photo, nom, note, nombre d'avis, quartier, distance, bouton **« Alerter sur WhatsApp »** qui ouvre un nouvel onglet `wa.me` avec un message pré-rempli :
  ```
  Bonjour {nom}, ici LIFE CONNECT – HELP ME (Douala).
  Demande {ref} : {problème} — quartier {quartier} ({distance} km de vous).
  Le client attend sur place. Pouvez-vous intervenir maintenant ?
  Répondez OUI pour accepter. Merci.
  ```
  Si la distance est inconnue, remplacer `({distance} km de vous)` par `(quartier indiqué par le client)`.
- Bouton **« Assigner ce prestataire »** avec confirmation : « Assigner {nom} ? Le client verra immédiatement ses coordonnées. » → met `provider_id`, `statut = 'assignee'`, `assigne_le = now()`. Si la demande était `expiree`, l'assignation est autorisée.
- Après assignation : afficher le prestataire assigné, un bouton « Envoyer les coordonnées au prestataire » (WhatsApp avec le numéro du client et le problème), et « Renvoyer l'alerte ».
- Le numéro du client n'est envoyé au prestataire **qu'après** assignation.
- Si la demande a plus de 30 minutes : bandeau d'avertissement.

### 6.11 Prestataires admin `/admin/prestataires`

- Tableau : photo, nom, métier, quartier, WhatsApp, statut, note, date d'inscription, badge « DÉMO » si `est_demo`.
- Filtre par statut : en attente, validés, refusés, suspendus.
- Actions avec confirmation : Valider, Refuser, Suspendre, Réactiver.
- Valider : `statut = 'valide'`, `valide_le = now()`. Refuser : `statut = 'refuse'`.
- Aucune suppression physique : on conserve l'historique.

### 6.12 Export CSV `/api/admin/export`

- Route protégée par le cookie admin.
- Colonnes : `id_court;date;categorie;probleme;quartier;tel_client;statut;prestataire;assigne_le;resolue_le;note`.
- Séparateur `;`, encodage UTF-8 avec BOM, fins de ligne CRLF, champs échappés.
- Nom : `life-connect-demandes-AAAA-MM-JJ.csv`.

### 6.13 Pages légales

- `/legal/confidentialite` : données collectées (téléphone, quartier, position facultative, description), finalité, durée de conservation 90 jours, droits, contact `dmwleroi17@gmail.com` et WhatsApp `+237 672 115 570`, hébergement Supabase/Vercel, aucune revente.
- `/legal/conditions` : service de mise en relation, pas de garantie d'intervention, paiement direct au prestataire, responsabilité, urgence vitale → secours, droit applicable camerounais.
- Textes simples, lisibles, sans jargon.

### 6.14 Pages techniques

- `not-found.tsx`, `error.tsx` (client, bouton « Réessayer »), `loading.tsx` avec squelettes.
- `GET /api/health` : `{ ok: true }`.
- `src/app/robots.ts` : autorise le site public, interdit `/admin`, `/suivi`, `/noter` (ces pages ne doivent pas être indexées).
- Favicon et icône PWA : `src/app/icon.svg` (monogramme LC).
- `src/app/manifest.ts` : nom, nom court, `start_url: '/'`, `display: 'standalone'`, couleurs, icône SVG `sizes: 'any'`.

---

## 7. BASE DE DONNÉES ET SÉCURITÉ

### 7.1 Tables

**`providers`**

| Colonne | Type | Contraintes |
|---|---|---|
| `id` | uuid | PK, `gen_random_uuid()` |
| `nom` | text | 2–80 caractères |
| `metier` | text | `mecanicien`, `depanneur`, `technicien` |
| `specialite` | text | null, ≤ 60 |
| `quartier` | text | 2–60 |
| `latitude` | double precision | null, −90 à 90 |
| `longitude` | double precision | null, −180 à 180 |
| `whatsapp` | text | format `^\+2376[0-9]{8}$` |
| `photo_url` | text | null |
| `statut` | text | `en_attente`, `valide`, `refuse`, `suspendu` — défaut `en_attente` |
| `disponible` | boolean | défaut `true` |
| `note_moyenne` | numeric(2,1) | défaut 0, entre 0 et 5 |
| `nombre_avis` | integer | défaut 0, ≥ 0 |
| `est_demo` | boolean | défaut `false` |
| `cree_le` | timestamptz | défaut `now()` |
| `valide_le` | timestamptz | null |

**`requests`**

| Colonne | Type | Contraintes |
|---|---|---|
| `id` | uuid | PK, `gen_random_uuid()` |
| `token` | uuid | unique, défaut `gen_random_uuid()` |
| `ville` | text | défaut `Douala` |
| `categorie` | text | 3 valeurs |
| `probleme` | text | 3–120 |
| `description` | text | null, ≤ 600 |
| `tel_client` | text | `^\+2376[0-9]{8}$` |
| `latitude` | double precision | null, −90 à 90 |
| `longitude` | double precision | null, −180 à 180 |
| `quartier` | text | 2–60 |
| `statut` | text | `nouvelle`, `en_recherche`, `assignee`, `resolue`, `annulee`, `expiree` — défaut `nouvelle` |
| `provider_id` | uuid | null, FK `providers(id)` `on delete set null` |
| `cree_le` | timestamptz | défaut `now()` |
| `expire_le` | timestamptz | défaut `now() + interval '5 minutes'` |
| `assigne_le` | timestamptz | null |
| `resolue_le` | timestamptz | null |
| `annulee_le` | timestamptz | null |
| `note_donnee` | boolean | défaut `false` |
| `est_demo` | boolean | défaut `false` |

**`ratings`**

| Colonne | Type | Contraintes |
|---|---|---|
| `id` | uuid | PK |
| `request_id` | uuid | unique, FK `requests(id)` `on delete cascade` |
| `provider_id` | uuid | null, FK `providers(id)` `on delete set null` |
| `etoiles` | integer | 1 à 5 |
| `resolu` | boolean | obligatoire |
| `commentaire` | text | null, ≤ 500 |
| `cree_le` | timestamptz | défaut `now()` |

Contraintes supplémentaires : latitude et longitude doivent être toutes les deux nulles ou toutes les deux renseignées. Index sur `requests(statut, cree_le desc)`, `requests(tel_client, cree_le desc)`, `requests(provider_id)`, `providers(metier, statut)`, `ratings(provider_id)`.

### 7.2 Fonctions SQL (RPC)

Toutes en `security definer`, avec `set search_path = public, pg_temp`, et validation complète des entrées.

1. `get_request_by_token(p_token uuid) returns jsonb`
   - Retourne la demande (sans `id` interne, sans données du prestataire si non assigné).
   - Si `statut in ('nouvelle','en_recherche')` et `expire_le < now()` : passe d'abord la demande à `expiree`.
   - Si assignée : inclut `provider` (nom, métier, photo_url, note_moyenne, nombre_avis, quartier, whatsapp, distance_km).
   - Distance calculée avec la position du client si disponible, sinon null.
   - Ne retourne jamais le téléphone d'un prestataire non assigné.
2. `cancel_request(p_token uuid) returns jsonb` — autorisé seulement si `nouvelle` ou `en_recherche` ; passe à `annulee`, `annulee_le = now()`.
3. `submit_rating(p_token uuid, p_etoiles int, p_resolu boolean, p_commentaire text) returns jsonb` — refuse si la demande n'est pas `assignee`/`resolue`, si `note_donnee = true`, ou si les valeurs sont hors bornes. Insère l'avis, passe la demande à `resolue` + `note_donnee = true`, recalcule `note_moyenne` et `nombre_avis` du prestataire.
4. `nearby_providers(p_lat float8, p_lng float8, p_categorie text, p_limit int default 10) returns table(...)` — prestataires `valide` et `disponible` de la catégorie, avec `distance_km` (formule de Haversine), triés par distance. **Exécution réservée au service_role.**
5. `admin_stats() returns jsonb` — total 30 jours, demandes du jour, en attente, temps de réponse moyen en secondes, pourcentage résolu, note moyenne. **Service_role uniquement.**
6. `expire_stale_requests() returns int` — passe à `expiree` les demandes actives dont `expire_le < now()`. **Service_role uniquement.**

Haversine : `6371 * acos(least(1, greatest(-1, sin(radians(lat1)) * sin(radians(lat2)) + cos(radians(lat1)) * cos(radians(lat2)) * cos(radians(lng2 - lng1)))))`.

### 7.3 RLS et privilèges

Activer RLS sur les 3 tables.

- **`requests`** : aucune lecture publique directe. Autoriser `insert` pour `anon` et `authenticated` uniquement avec `statut = 'nouvelle'`, `provider_id is null`, `note_donnee = false`, `est_demo = false`. Aucun `select`, `update` ou `delete` public.
- **`providers`** : aucune lecture publique directe (le WhatsApp est dedans). Autoriser `insert` public uniquement avec `statut = 'en_attente'`, `est_demo = false`, `note_moyenne = 0`, `nombre_avis = 0`.
- **`ratings`** : aucun accès public. Insertion uniquement via `submit_rating`.
- **Vue `providers_public`** : `id`, `nom`, `metier`, `specialite`, `quartier`, `photo_url`, `note_moyenne`, `nombre_avis`, `disponible`, filtrée sur `statut = 'valide'`. `grant select` à `anon`. Jamais de `whatsapp`, `latitude`, `longitude` dans cette vue.
- **Fonctions** : `revoke all on function ... from public` puis `grant execute` à `anon` seulement pour `get_request_by_token`, `cancel_request`, `submit_rating`. `nearby_providers`, `admin_stats` et `expire_stale_requests` : `service_role` uniquement.
- **Storage** : bucket public `providers` en lecture ; aucune écriture anonyme ; upload via la clé service côté serveur ; types autorisés `image/jpeg`, `image/png`, `image/webp` ; taille max 2 Mo.

Le serveur Next.js utilise la clé `service_role` et contourne RLS : c'est normal et voulu, car toutes les règles métier sont dans les Server Actions et les RPC. Les policies restent une défense en profondeur si la clé anonyme fuit un jour.

### 7.4 Authentification admin

- Mot de passe en variable d'environnement `ADMIN_PASSWORD`, jamais en base.
- Comparaison en temps constant : SHA-256 des deux chaînes puis `crypto.timingSafeEqual` (route Node.js).
- Session : JWT HS256 signé avec `AUTH_SECRET` (32 octets aléatoires minimum), payload `{ sub: 'admin' }`, expiration 8 h.
- Cookie `lc_admin` : `httpOnly`, `secure` en production, `sameSite=lax`, `path=/`.
- Middleware Edge avec `jose.jwtVerify`, redirection vers `/admin/login?next=...`.
- Chaque Server Action admin appelle `requireAdmin()` et revérifie la session : le middleware ne suffit pas.
- Déconnexion : suppression du cookie.

### 7.5 Données de référence

**Quartiers de Douala** (liste initiale, modifiable dans `constants.ts`) : Akwa, Bonanjo, Bonapriso, Deïdo, Bépanda, Makepe, Ndokoti, Ndogbong, Kotto, Bonabéri, Logbessou, PK8, PK14, Yassa, Japoma, Cité des Palmiers, New Bell, Bassa, Dikolo, Nylon.

**Catégories** : voir section 6.3.

### 7.6 Jeu de données de démonstration

Le fichier `supabase/04_seed.sql` insère **6 prestataires fictifs** à Douala, tous `est_demo = true`, `statut = 'valide'`, avec des coordonnées approximatives cohérentes :

| Nom | Métier | Quartier | Lat | Lng | Note |
|---|---|---|---|---|---|
| Démo – Garage Akwa | mecanicien | Akwa | 4.0483 | 9.7043 | 4.8 |
| Démo – Moto Express Bonapriso | mecanicien | Bonapriso | 4.0301 | 9.7005 | 4.6 |
| Démo – Élec Service Deïdo | depanneur | Deïdo | 4.0702 | 9.7102 | 4.7 |
| Démo – Plomberie Bépanda | depanneur | Bépanda | 4.0605 | 9.7302 | 4.4 |
| Démo – NetFix Makepe | technicien | Makepe | 4.0803 | 9.7501 | 4.9 |
| Démo – Info Dépannage Bonabéri | technicien | Bonabéri | 4.0710 | 9.6605 | 4.3 |

Numéros WhatsApp de démonstration : `+237699000001` à `+237699000006` (fictifs, jamais utilisés pour envoyer de vrais messages). Chaque insertion est commentée `-- DONNÉE DE DÉMONSTRATION — ne pas utiliser en production`.

---

## 8. ARCHITECTURE TECHNIQUE

### 8.1 Arborescence cible (finale)

C'est la cible à la fin de la phase 4. En phase 1, tu ne crées que les fichiers de configuration, les librairies, le SQL et un accueil provisoire : les pages métier arrivent en phases 2 et 3. Ne crée jamais une page vide « pour respecter l'arborescence ».

```
life-connect/
├─ .env.example
├─ .env.local                  (créé par moi, jamais versionné)
├─ .gitignore
├─ next.config.mjs
├─ package.json
├─ postcss.config.mjs
├─ tailwind.config.ts
├─ tsconfig.json
├─ README.md
├─ supabase/
│  ├─ 01_schema.sql
│  ├─ 02_functions.sql
│  ├─ 03_rls.sql
│  └─ 04_seed.sql
└─ src/
   ├─ middleware.ts
   ├─ app/
   │  ├─ layout.tsx
   │  ├─ globals.css
   │  ├─ icon.svg
   │  ├─ manifest.ts
   │  ├─ robots.ts
   │  ├─ page.tsx
   │  ├─ not-found.tsx
   │  ├─ error.tsx
   │  ├─ loading.tsx
   │  ├─ aide/page.tsx
   │  ├─ aide/[categorie]/page.tsx
   │  ├─ suivi/[token]/page.tsx
   │  ├─ noter/[token]/page.tsx
   │  ├─ prestataire/page.tsx
   │  ├─ prestataire/inscription/page.tsx
   │  ├─ admin/login/page.tsx
   │  ├─ admin/page.tsx
   │  ├─ admin/demandes/[id]/page.tsx
   │  ├─ admin/prestataires/page.tsx
   │  ├─ legal/confidentialite/page.tsx
   │  ├─ legal/conditions/page.tsx
   │  └─ api/
   │     ├─ status/[token]/route.ts
   │     ├─ admin/login/route.ts
   │     ├─ admin/logout/route.ts
   │     ├─ admin/export/route.ts
   │     └─ health/route.ts
   ├─ actions/
   │  ├─ create-request.ts
   │  ├─ cancel-request.ts
   │  ├─ rate-request.ts
   │  ├─ register-provider.ts
   │  └─ admin.ts
   ├─ components/
   │  ├─ Icons.tsx
   │  ├─ ui/Button.tsx
   │  ├─ ui/Card.tsx
   │  ├─ ui/Field.tsx
   │  ├─ ui/Badge.tsx
   │  ├─ ui/Spinner.tsx
   │  ├─ ui/Stars.tsx
   │  ├─ layout/Header.tsx
   │  ├─ layout/Footer.tsx
   │  ├─ layout/EmergencyBanner.tsx
   │  ├─ layout/ThemeToggle.tsx
   │  ├─ home/Hero.tsx
   │  ├─ home/CategoryGrid.tsx
   │  ├─ home/HowItWorks.tsx
   │  ├─ request/RequestForm.tsx
   │  ├─ request/LocationField.tsx
   │  ├─ request/Countdown.tsx
   │  ├─ request/StatusPoller.tsx
   │  ├─ request/ProviderCard.tsx
   │  ├─ request/CancelButton.tsx
   │  ├─ request/RatingForm.tsx
   │  ├─ admin/StatusBadge.tsx
   │  ├─ admin/StatCards.tsx
   │  ├─ admin/RequestsTable.tsx
   │  ├─ admin/AutoRefresh.tsx
   │  └─ admin/WhatsAppAlert.tsx
   ├─ lib/
   │  ├─ supabase/admin.ts
   │  ├─ auth.ts
   │  ├─ constants.ts
   │  ├─ validation.ts
   │  ├─ phone.ts
   │  ├─ whatsapp.ts
   │  ├─ format.ts
   │  └─ rate-limit.ts
   └─ types/db.ts
```

Tu peux regrouper deux petits composants UI dans un même fichier si cela simplifie, mais tu ne supprimes aucun écran ni aucune route. Tu m'annonces tout regroupement.

### 8.2 Choix techniques à respecter

- **Server Components par défaut**. `'use client'` uniquement pour les formulaires, le polling, le thème, les accordéons et les interactions.
- **Server Actions** pour toutes les mutations de formulaire : création de demande, annulation, notation, inscription prestataire, actions admin.
- **Route Handlers** uniquement pour : polling de statut, login/logout admin, export CSV, health.
- **Accès Supabase** : un seul client serveur dans `lib/supabase/admin.ts`, créé avec `createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })`. Erreur explicite si une variable manque. Aucun client Supabase dans le navigateur.
- **Revalidation** : après une action, `revalidatePath()` sur les pages concernées. Les pages admin et suivi sont dynamiques (`export const dynamic = 'force-dynamic'`).
- **Zod** : un schéma par formulaire dans `lib/validation.ts`, messages d'erreur en français.
- **Téléphone** : `lib/phone.ts` expose `normalizeCmPhone(input): string | null` et `formatCmPhone(phone): string`. Accepter `6XXXXXXXX`, `06XXXXXXXX` (si saisi), `2376XXXXXXXX`, `+237 6XX XX XX XX` ; retourner `+2376XXXXXXXX`.
- **WhatsApp** : `lib/whatsapp.ts` expose `waLink(phone, message)` qui ne garde que les chiffres et encode le message avec `encodeURIComponent`.
- **Distance** : calculée en SQL pour l'admin ; `lib/distance.ts` n'est pas nécessaire côté client, ne le crée pas.
- **Dates** : `Intl.DateTimeFormat('fr-FR', { timeZone: 'Africa/Douala', ... })` dans `lib/format.ts`. Douala est à UTC+1 toute l'année.
- **Limitation de débit** : `lib/rate-limit.ts` avec `Map` en mémoire (suffisant pour la V1, à documenter comme limite serverless). Login : 5/15 min par IP. Création de demande : 3/h par téléphone. Inscription : 2/h par WhatsApp.
- **Erreurs** : jamais de détail SQL renvoyé au client. Les Server Actions retournent `{ ok: true, ... }` ou `{ ok: false, error: 'message français' }`.
- **Sécurité HTTP** dans `next.config.mjs` : `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: geolocation=(self), camera=(), microphone=()`.
- **Images** : `next/image` avec `remotePatterns` pour `*.supabase.co`. Photos prestataires en `width={96} height={96}`, `sizes` adapté. Avatar de secours : initiales sur fond coloré, pas d'image externe.
- **Body limit** : `experimental.serverActions.bodySizeLimit: '4mb'` pour la photo.
- **Pas de `next/font`** : police système pour la performance 3G.
- **Pas de service worker** dans la V1 (manifest seulement). Explique pourquoi en une ligne : le cache offline mal maîtrisé peut servir des données périmées.

### 8.3 Variables d'environnement

`.env.example` (versionné) et `.env.local` (non versionné) :

```
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
ADMIN_PASSWORD=change-moi
AUTH_SECRET=une-chaine-aleatoire-de-32-octets-minimum
NEXT_PUBLIC_ADMIN_WHATSAPP=237672115570
```

- Pas de `NEXT_PUBLIC_SUPABASE_ANON_KEY` : tous les accès passent par le serveur. Explique ce choix en une phrase.
- La valeur de `SUPABASE_SERVICE_ROLE_KEY` peut être l'ancienne clé JWT `service_role` (`eyJ...`) ou la nouvelle **Secret key** (`sb_secret_...`) du tableau de bord Supabase : les deux sont acceptées par `supabase-js` côté serveur. Ne jamais utiliser la clé `anon` / `publishable` à la place.
- Génération de `AUTH_SECRET` sous PowerShell :
  `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`
- `.gitignore` doit contenir `.env*.local`, `.next`, `node_modules`, `*.log`, `.vercel`.

---

## 9. DESIGN SYSTEM

### 9.1 Palette (variables CSS dans `globals.css`)

```
--lc-navy-950: #07121F
--lc-navy-900: #0A1A2F
--lc-navy-800: #10243D
--lc-red-500:   #E24B4A
--lc-red-600:   #C93A39
--lc-red-50:    #FDECEC
--lc-teal-500:  #12B3A6
--lc-teal-50:   #E6F8F6
--lc-violet-500:#6D4AFF
--lc-coral-500: #FF7A59
--lc-bg:        #F6F8FB
--lc-surface:   #FFFFFF
--lc-ink:       #0F172A
--lc-muted:     #5B6B82
--lc-line:      #E3E9F2
```

Mode sombre : `bg #07121F`, `surface #0D1E33`, `ink #EAF1FA`, `muted #9FB0C7`, `line #1C3350`. Bascule par classe `dark` sur `<html>`, mémorisée dans `localStorage`, avec script inline dans `layout.tsx` pour éviter le flash.

Rouge = urgence et action principale. Turquoise = succès, connexion, WhatsApp. Violet = innovation (usage rare). Orange corail = accents et alertes secondaires.

### 9.2 Typographie et formes

- Police système : `ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif`.
- Corps 16 px, petit texte 14 px, titres `font-semibold tracking-tight`, H1 `clamp(1.75rem, 5vw, 2.5rem)`.
- Rayons : cartes 16 px, boutons 14 px, badges 999 px.
- Ombres douces, bordures 1 px `--lc-line`.
- Espacement base 4 px. Conteneur `max-w-5xl mx-auto px-4`.
- Cartes : `rounded-2xl border p-5 shadow-sm`.
- Boutons : primaire rouge `h-14 text-base font-semibold`, secondaire navy, `whatsapp` vert `#25D366`, fantôme. Hauteur minimale 48 px, 56 px pour l'action principale. Focus visible 3 px.
- Icônes SVG inline, 24 px, trait 1,8, `currentColor`. Aucune librairie.
- Animations 150–200 ms, `prefers-reduced-motion` respecté.

### 9.3 Règles UX

- Mobile first, testé à 360 px de large.
- Un seul objectif par écran, un seul bouton principal.
- États de chargement (squelettes), vide, erreur et succès prévus partout.
- Messages d'erreur sous le champ concerné, en français, sans jargon.
- `aria-live="polite"` sur le statut de recherche et les confirmations.
- Lien d'évitement « Aller au contenu ».
- Contrastes AA minimum.
- Zones tactiles ≥ 44 px.
- Le formulaire ne doit jamais perdre les données saisies en cas d'erreur serveur.

---

## 10. CONTENUS ET MICROCOPY

Écris les textes définitifs en français, pas de lorem ipsum. Ton rassurant, phrases courtes.

- Accueil : « Une panne ? Un besoin ? On vous connecte. »
- Bouton : « J'AI BESOIN D'AIDE »
- Formulaire : « Quel est votre problème ? », « Où êtes-vous ? », « Votre numéro », « Décrivez en quelques mots (facultatif) ».
- Recherche : « Nous contactons les prestataires proches… », « Cela prend en général moins de 5 minutes. »
- Trouvé : « Un prestataire a accepté », « Appelez-le maintenant », « Il est à 2,3 km de vous ».
- Expiré : « Aucun prestataire n'a répondu pour l'instant. », « Réessayez ou écrivez-nous sur WhatsApp. »
- Notation : « Comment s'est passée l'intervention ? », « Problème résolu ? », « Merci, votre avis aide les autres clients. »
- Admin : « Demandes », « Prestataires », « En attente », « Alerter sur WhatsApp », « Assigner », « Valider », « Refuser », « Exporter en CSV ».

---

## 11. PERFORMANCE, 3G ET ACCESSIBILITÉ

- Objectif : moins de 120 Ko de JavaScript compressé sur la première visite.
- Pas de librairie UI, pas de police distante, pas de vidéo, pas de carte intégrée.
- Images compressées, dimensions explicites, `loading="lazy"` hors écran.
- Composants serveur pour tout ce qui n'a pas besoin d'interactivité.
- Polling 5 s côté client, pause onglet masqué, arrêt sur statut final.
- Squelettes plutôt que sauts de mise en page.
- Le site doit rester lisible et utilisable si la géolocalisation est refusée, si JavaScript est lent, ou si l'utilisateur est sur un écran de 360 px.
- Pas de blocage du rendu par une police ou une API externe.
- `loading.tsx` et `error.tsx` utiles, pas décoratifs.

---

## 12. MÉTHODE DE TRAVAIL : 4 PHASES

Tu travailles en 4 phases. Chaque phase se termine par une application qui démarre et que je peux tester. Tu t'arrêtes après chaque phase et tu attends mon « SUITE ». Ne passe jamais à la phase suivante sans mon accord.

Si ton environnement te donne un accès réel au système de fichiers (agent de code, IDE, terminal), crée réellement les fichiers dans `C:\Users\LEROI\Desktop\LIFE-CONNCT\life-connect`, respecte exactement l'arborescence, et ne me donne que les commandes à exécuter et le récapitulatif. Ne prétends jamais avoir créé ou modifié un fichier que tu n'as pas réellement créé. Ne touche à aucun fichier en dehors de ce dossier. Si tu n'as pas cet accès, donne le contenu complet de chaque fichier, un par un.

### PHASE 1 — Fondations (SQL + configuration)

Livrables :

- Arborescence cible rappelée, et création des seuls fichiers de la phase 1 (configuration, libs, SQL, accueil provisoire).
- `package.json` avec les bonnes versions.
- `next.config.mjs`, `tailwind.config.ts`, `postcss.config.mjs`, `tsconfig.json`, `.gitignore`, `.env.example`.
- `globals.css` avec les variables de design et les styles de base.
- `layout.tsx`, `icon.svg`, `manifest.ts`, `loading.tsx`, `not-found.tsx`, `error.tsx`.
- `lib/supabase/admin.ts`, `lib/constants.ts`, `lib/format.ts`, `lib/phone.ts`, `lib/whatsapp.ts`, `lib/validation.ts`, `lib/auth.ts`, `lib/rate-limit.ts`.
- `types/db.ts`.
- Les 4 fichiers SQL complets : schéma, fonctions, RLS, seed.
- `README.md` : présentation, prérequis, installation, variables, commandes.
- Aucune page métier encore, sauf un accueil provisoire propre.

Commandes à me donner, dans l'ordre :

```powershell
cd C:\Users\LEROI\Desktop\LIFE-CONNCT
node -v
npm -v
npx create-next-app@14 life-connect --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
cd life-connect
npm install @supabase/supabase-js jose zod
```

Puis : création du projet Supabase, exécution des 4 fichiers SQL dans l'éditeur SQL, création du bucket `providers`, création de `.env.local`, `npm run dev`.

Critère de sortie : `npm run dev` démarre, `http://localhost:3000` affiche une page propre, et je peux te coller les erreurs.

### PHASE 2 — Parcours client complet

Livrables :

- `Button`, `Card`, `Field`, `Badge`, `Spinner`, `Stars`, `Icons`.
- `Header`, `Footer`, `EmergencyBanner`, `ThemeToggle`.
- `Hero`, `CategoryGrid`, `HowItWorks`.
- Page d'accueil complète.
- `/aide`, `/aide/[categorie]`, `RequestForm`, `LocationField`.
- `actions/create-request.ts`.
- `/suivi/[token]`, `Countdown`, `StatusPoller`, `ProviderCard`, `CancelButton`, `/api/status/[token]`.
- `actions/cancel-request.ts`.
- `/noter/[token]`, `RatingForm`, `actions/rate-request.ts`.
- `/api/health`.
- Pages légales.

Critère de sortie : je peux créer une demande depuis mon téléphone, voir le compte à rebours, annuler, et voir la page de notation. L'admin n'existe pas encore : pour tester l'assignation, tu me donnes une requête SQL manuelle à exécuter dans Supabase (clairement identifiée « test manuel »).

### PHASE 3 — Prestataires et administration

Livrables :

- `/prestataire`, `/prestataire/inscription`, `actions/register-provider.ts`, upload photo.
- `/admin/login`, `/api/admin/login`, `/api/admin/logout`, `middleware.ts`.
- `/admin`, `StatCards`, `RequestsTable`, `AutoRefresh`, `StatusBadge`.
- `/admin/demandes/[id]`, `WhatsAppAlert`, assignation, résolution, annulation.
- `/admin/prestataires`, validation, refus, suspension.
- `/api/admin/export` CSV.
- `actions/admin.ts` avec `requireAdmin()`.

Critère de sortie : connexion admin, demande visible, alerte WhatsApp correcte, assignation, mise à jour côté client en moins de 6 secondes, validation d'un prestataire, export CSV.

### PHASE 4 — Finitions, tests et déploiement

Livrables :

- PWA (manifest, icône, thème), vérification mobile 360 px.
- Accessibilité : focus, labels, contrastes, `aria-live`.
- Performance : première visite, images, JS.
- Tests d'acceptation de la section 14, un par un.
- `README.md` final avec captures textuelles des écrans et guide de dépannage.
- Guide Vercel pas à pas pour débutant.
- Liste de contrôle avant mise en ligne.
- Nettoyage : aucun `console.log`, aucun `TODO`, aucun fichier mort.

---

## 13. FORMAT DE TES RÉPONSES

À chaque phase :

1. Commence par `## PHASE X — Titre`.
2. Donne un résumé de 5 lignes maximum de ce que tu vas livrer.
3. Pour chaque fichier :

   **Fichier :** `chemin/complet/du/fichier.tsx`

   ```tsx
   // contenu complet, sans omission
   ```

4. Si un fichier dépasse la limite d'un message, écris `Fichier X — partie 1/2` et continue dans le message suivant sans rien omettre.
5. Termine par :
   - `### À FAIRE MAINTENANT` : commandes numérotées, une par ligne, avec le dossier courant.
   - `### CE QUE TU DOIS VOIR` : résultat attendu, écran par écran.
   - `### SI ÇA ÉCHOUE` : 3 causes probables et la correction.
   - `### HYPOTHÈSES` : 3 lignes maximum, uniquement si nécessaire.
   - `Réponds « SUITE » pour la phase suivante.`
6. Ne joins pas de fichiers zip, d'images ou de pièces jointes. Tout le code est dans le message.
7. Ne me renvoie pas un fichier déjà envoyé sauf s'il a changé. Dans ce cas, renvoie-le **entier**.
8. Si je te colle une erreur, corrige uniquement les fichiers concernés et redonne-les en entier.

---

## 14. CRITÈRES D'ACCEPTATION (TESTS FINAUX)

Je dois pouvoir faire tout ce qui suit, sans intervention technique :

1. Depuis un téléphone, ouvrir le site, appuyer sur « J'AI BESOIN D'AIDE », choisir « Mécanicien », « Pneu crevé », saisir mon numéro, choisir « Akwa », refuser la géolocalisation, envoyer. La demande apparaît dans l'admin en moins de 10 secondes.
2. La page de suivi affiche un compte à rebours de 5 minutes et se met à jour toute seule.
3. Depuis l'admin, je vois les prestataires mécaniciens triés par distance, j'ouvre WhatsApp avec le message pré-rempli correct, j'assigne un prestataire.
4. En moins de 6 secondes, la page du client affiche le prestataire, sa note, la distance, et les boutons Appeler / WhatsApp fonctionnels.
5. Avant assignation, le numéro du prestataire n'apparaît **nulle part** dans le HTML public (Ctrl+U).
6. Après intervention, le client note 5 étoiles + « résolu ». La note moyenne du prestataire augmente et le nombre d'avis aussi. Une deuxième notation est refusée.
7. Un prestataire s'inscrit avec photo ; il apparaît « en attente » ; je le valide ; il devient proposable dans l'admin.
8. L'export CSV s'ouvre dans Excel avec les accents corrects.
9. Les statistiques affichent des valeurs cohérentes avec les données réelles.
10. `npm run build` passe sans erreur. Le déploiement Vercel fonctionne. Les variables d'environnement sont documentées.
11. La page d'accueil est lisible à 360 px, sans zoom, sans débordement horizontal.
12. Aucun `console.log`, aucun `TODO`, aucun `...` dans le code livré.
13. Aucune clé secrète dans le dépôt Git.
14. Les pages légales sont accessibles et le consentement est obligatoire.
15. Une demande expirée affiche un message clair et permet de réessayer.

---

## 15. CE QUI EST INTERDIT

- Écrire « fonctionnel » pour un bouton sans action.
- Utiliser des données de démonstration comme si c'étaient de vrais prestataires.
- Exposer `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_PASSWORD` ou `AUTH_SECRET` côté client.
- Faire confiance à une vérification faite uniquement dans l'interface.
- Stocker le token d'admin dans `localStorage`.
- Mettre le numéro WhatsApp d'un prestataire dans la page publique avant assignation.
- Créer une table, une page ou un module hors périmètre « pour plus tard ».
- Ajouter une dépendance non listée sans justification.
- Livrer du code avec des `...`, des `TODO` ou des fichiers manquants.
- Me demander de payer un service.
- Me poser des questions au lieu d'avancer.
- Utiliser `any` sans commentaire justificatif.
- Ignorer les erreurs TypeScript ou ESLint en les désactivant globalement.

---

## 16. INFORMATIONS DÉJÀ CONNUES (NE PAS ME LES REDEMANDER)

- Administrateur : Leroi.
- WhatsApp admin principal : **+237 672 115 570** (`237672115570` pour `wa.me`).
- WhatsApp admin secondaire : **+237 656 151 246**.
- E-mail : **dmwleroi17@gmail.com** — c'est aussi l'e-mail de mon compte GitHub et de mon compte Vercel.
- Ville : Douala, Cameroun. Quartiers : voir section 7.5.
- Hébergement cible : Vercel (compte existant, j'ai déjà déployé un autre projet).
- Base : Supabase (compte gratuit à créer, je ne l'ai pas encore fait).
- Dépôt : GitHub (compte existant).
- Système : Windows 10, VS Code, Git installés.
- Le dossier du projet : `C:\Users\LEROI\Desktop\LIFE-CONNCT\life-connect`.
- Je veux une web-app, pas une application Flutter.
- Je veux pouvoir tester sur mon téléphone en local et en production.
- Je ne veux aucun service payant.

---

## 17. COMMENCE MAINTENANT

Tu as tout le contexte. Ne me pose aucune question.

Commence par la **PHASE 1** uniquement :

1. Rappelle en 5 lignes ce que tu vas construire et les hypothèses éventuelles.
2. Donne l'arborescence finale.
3. Donne les fichiers de configuration complets.
4. Donne les 4 scripts SQL complets, dans l'ordre d'exécution.
5. Donne les commandes PowerShell exactes.
6. Termine par `Réponds « SUITE » pour la phase 2.`

Contrainte finale : si tu dois choisir entre faire simple et faire impressionnant, choisis **simple, réel et testable**. Je préfère une V1 modeste qui fonctionne à une démo qui brille mais ne tient pas debout.
