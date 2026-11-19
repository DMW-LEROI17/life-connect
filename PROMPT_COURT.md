# PROMPT COURT — LIFE CONNECT / HELP ME

> **Document d’archive.** Le projet est déjà construit dans ce dossier. Le guide opérationnel est [`GUIDE_DEMARRAGE.md`](GUIDE_DEMARRAGE.md).

> Version condensée. À utiliser si la conversation complète devient trop longue, ou pour relancer DeepSeek en cours de route. Le document principal reste `PROMPT_DEEPSEEK_LIFE_CONNECT.md`.

---

Tu es mon ingénieur logiciel principal. Construis avec moi la V1 de **LIFE CONNECT – HELP ME**, une web-app mobile-first pour Douala (Cameroun) : un client en panne choisit son problème, donne son numéro, indique son quartier ; moi, l'administrateur, j'alerte un prestataire vérifié via WhatsApp, puis je l'assigne.

**Stack imposée :** Next.js 14.2 (App Router, TypeScript strict, `src/`), Tailwind CSS 3.4, Supabase (Postgres + Storage), Vercel, npm. Dépendances autorisées : `@supabase/supabase-js`, `jose`, `zod`. Aucune librairie UI, aucune police distante, aucun service payant.

**Mon contexte :** Windows 10, 8 Go, VS Code, Git. Je suis débutant : explique chaque commande PowerShell, où l'exécuter, ce que je dois voir. Dossier : `C:\Users\LEROI\Desktop\LIFE-CONNCT\life-connect`. Ne me pose aucune question : prends l'hypothèse la plus simple, note-la en une ligne, continue.

**Périmètre V1 (uniquement) :**
1. Accueil : gros bouton rouge « J'AI BESOIN D'AIDE », 3 catégories (mécanicien, dépanneur, technicien).
2. Demande : 4–5 problèmes par catégorie, description facultative, téléphone `+237`, quartier + géolocalisation facultative, consentement, anti-spam.
3. Suivi par lien unique (token) : compte à rebours 5 min, polling 5 s, annulation, états nouvelle / en recherche / assignée / résolue / annulée / expirée.
4. Prestataire assigné : nom, photo, note, distance, boutons Appeler et WhatsApp. **Le numéro n'apparaît qu'après assignation.**
5. Notation par lien unique : étoiles 1–5, résolu oui/non, commentaire.
6. Inscription prestataire : nom, métier, quartier, WhatsApp, photo (bucket `providers`, 2 Mo max), statut `en_attente`.
7. Admin protégé par mot de passe + cookie JWT : demandes, prestataires proches triés par distance, alerte WhatsApp pré-remplie, assignation, validation/refus, export CSV, 5 statistiques.

**Hors périmètre :** comptes clients, comptes prestataires, paiement, messagerie, marketplace, IA, Flutter, API WhatsApp payante, multi-villes, notifications push.

**Base :** tables `providers`, `requests` (avec `token uuid unique`, `expire_le` à +5 min, `est_demo`), `ratings`. RLS activée : aucune lecture publique directe ; insertion publique limitée à `statut = 'nouvelle'` ; le WhatsApp des prestataires n'est jamais dans une vue publique. Fonctions `security definer` : `get_request_by_token`, `cancel_request`, `submit_rating`, `nearby_providers` (Haversine), `admin_stats`. Toutes les écritures passent par des Server Actions avec la clé `service_role` côté serveur uniquement.

**Sécurité :** `SUPABASE_SERVICE_ROLE_KEY` jamais côté client ; `ADMIN_PASSWORD` + `AUTH_SECRET` en variables d'environnement ; comparaison en temps constant ; middleware sur `/admin/*` ; validation Zod de toutes les entrées ; en-têtes de sécurité ; limitation de débit (3 demandes/h par téléphone, 5 logins/15 min) ; aucune donnée personnelle dans les logs.

**Design :** mobile first, français, phrases courtes, boutons ≥ 48 px. Couleurs : navy `#0A1A2F`, rouge `#E24B4A` (urgence), turquoise `#12B3A6`, violet `#6D4AFF`, corail `#FF7A59`, fond clair `#F6F8FB`. Mode sombre, focus visibles, `aria-live`, contrastes AA. Aucune image externe obligatoire, logo SVG inline.

**Méthode en 4 phases, avec arrêt après chacune :**
- Phase 1 : configuration, design tokens, libs, SQL complet (schéma, fonctions, RLS, seed de 6 prestataires « DÉMO » à Douala), `.env.example`, README, accueil provisoire.
- Phase 2 : parcours client complet (accueil, formulaire, suivi, notation, pages légales).
- Phase 3 : inscription prestataire, login admin, dashboard, détail demande, alerte WhatsApp, assignation, validation, export CSV.
- Phase 4 : finitions, PWA, accessibilité, tests, guide Vercel.

**Format :** chaque fichier avec son chemin exact et son contenu **complet**, jamais de `...`, de `TODO` ou de fichier omis. Si un fichier est trop long, découpe-le en « partie 1/2 » sans rien oublier. Termine chaque phase par les commandes à exécuter, le résultat attendu, les erreurs probables, puis « Réponds SUITE pour la phase suivante ». Si je te colle une erreur, corrige uniquement les fichiers concernés et redonne-les entiers. Le projet doit passer `npm run build`.

**Infos connues :** WhatsApp admin `+237 672 115 570` (secours `+237 656 151 246`), e-mail `dmwleroi17@gmail.com` (GitHub et Vercel), Douala, Supabase à créer, Vercel existant.

Commence par la phase 1 : rappelle le plan en 5 lignes, donne l'arborescence, les fichiers de configuration, les 4 scripts SQL complets et les commandes PowerShell.
