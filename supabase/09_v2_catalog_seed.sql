-- =============================================================================
-- LIFE CONNECT – V2 NATIONALE
-- 09_v2_catalog_seed.sql — familles, catégories et sous-catégories
-- À exécuter APRÈS 08_v2_geo_seed.sql.
-- Ces données sont administratives : l'admin peut ensuite les modifier.
-- =============================================================================

insert into public.families (slug, nom_fr, nom_en, icon, description, sort_order)
values
  ('urgence_sante', 'Urgence & santé', 'Emergency & health', 'alert', 'Urgences, premiers gestes, soins à domicile', 1),
  ('auto_moto', 'Auto & moto', 'Auto & moto', 'wrench', 'Mécanique, dépannage, transport', 2),
  ('maison_construction', 'Maison & construction', 'Home & construction', 'bolt', 'Plomberie, électricité, bâtiment, froid', 3),
  ('numerique_reseau', 'Numérique & réseau', 'Digital & network', 'wifi', 'Wi-Fi, téléphone, ordinateur, TV', 4),
  ('famille_education', 'Famille & éducation', 'Family & education', 'user', 'Cours, nounou, aide à domicile', 5),
  ('beaute_mode', 'Beauté & mode', 'Beauty & fashion', 'spark', 'Coiffure, couture, maquillage', 6),
  ('evenements_restauration', 'Événements & restauration', 'Events & catering', 'star', 'Traiteur, photo, sonorisation', 7),
  ('agriculture_elevage', 'Agriculture & élevage', 'Agriculture & livestock', 'shield', 'Vétérinaire, champ, tracteur', 8),
  ('administratif_juridique', 'Administratif & juridique', 'Admin & legal', 'shield', 'Démarches, traduction, conseil', 9),
  ('transport_livraison', 'Transport & livraison', 'Transport & delivery', 'send', 'Coursier, camion, taxi, moto', 10),
  ('autre', 'Autre besoin', 'Other need', 'search', 'Un besoin qui ne rentre dans aucune case', 11)
on conflict (slug) do update
  set nom_fr = excluded.nom_fr,
      nom_en = excluded.nom_en,
      icon = excluded.icon,
      description = excluded.description,
      sort_order = excluded.sort_order;

insert into public.categories
  (family_slug, slug, nom_fr, nom_en, icon, description, sort_order, is_emergency)
values
  -- Urgence & santé
  ('urgence_sante', 'urgences', 'Urgences', 'Emergencies', 'alert', 'Enfant blessé, accident, saignement, brûlure, accouchement…', 1, true),
  ('urgence_sante', 'sante_domicile', 'Santé à domicile', 'Home health', 'alert', 'Infirmier, sage-femme, kiné, pharmacie, ambulancier privé', 2, false),

  -- Auto & moto
  ('auto_moto', 'mecanicien', 'Mécanicien', 'Mechanic', 'wrench', 'Voiture et moto : moteur, freins, diagnostic', 1, false),
  ('auto_moto', 'electricien_auto', 'Électricien auto', 'Auto electrician', 'bolt', 'Batterie, alternateur, démarreur, feux', 2, false),
  ('auto_moto', 'vulcanisateur', 'Vulcanisateur', 'Tire repair', 'wrench', 'Pneus, chambres à air, valves', 3, false),
  ('auto_moto', 'depannage_remorquage', 'Dépannage / remorquage', 'Towing', 'alert', 'Remorquage, panne sur route, carburant', 4, false),
  ('auto_moto', 'carrossier', 'Carrossier', 'Bodywork', 'wrench', 'Tôle, peinture, pare-chocs', 5, false),
  ('auto_moto', 'lavage_auto', 'Lavage auto', 'Car wash', 'spark', 'Lavage, intérieur, lustrage', 6, false),
  ('auto_moto', 'transport_vehicule', 'Transport de personnes', 'Passenger transport', 'send', 'Taxi, location, chauffeur', 7, false),

  -- Maison & construction
  ('maison_construction', 'depanneur', 'Dépannage maison', 'Home repair', 'bolt', 'Plomberie, électricité, serrure, froid', 1, false),
  ('maison_construction', 'plombier', 'Plombier', 'Plumber', 'bolt', 'Fuites, installations, chauffe-eau, WC', 2, false),
  ('maison_construction', 'electricien', 'Électricien', 'Electrician', 'bolt', 'Pannes, installations, tableaux', 3, false),
  ('maison_construction', 'macon', 'Maçon', 'Mason', 'wrench', 'Fondations, murs, dalles', 4, false),
  ('maison_construction', 'menuisier', 'Menuisier', 'Carpenter', 'wrench', 'Meubles, portes, fenêtres', 5, false),
  ('maison_construction', 'soudeur', 'Soudeur', 'Welder', 'bolt', 'Grilles, portails, structures', 6, false),
  ('maison_construction', 'peintre', 'Peintre', 'Painter', 'spark', 'Intérieur, extérieur, façades', 7, false),
  ('maison_construction', 'carreleur', 'Carreleur', 'Tiler', 'wrench', 'Sols, murs, terrasses', 8, false),
  ('maison_construction', 'serrurier', 'Serrurier', 'Locksmith', 'shield', 'Ouverture, changement, blindage', 9, false),
  ('maison_construction', 'vitrier', 'Vitrier', 'Glazier', 'wrench', 'Vitres, miroirs, douches', 10, false),
  ('maison_construction', 'toiture', 'Toiture', 'Roofing', 'bolt', 'Tôles, étanchéité, charpente', 11, false),
  ('maison_construction', 'froid_clim', 'Froid / climatisation', 'Refrigeration', 'bolt', 'Frigo, climatisation, chambre froide', 12, false),
  ('maison_construction', 'solaire', 'Panneaux solaires', 'Solar', 'spark', 'Installation, batteries, entretien', 13, false),
  ('maison_construction', 'groupe_electrogene', 'Groupe électrogène', 'Generator', 'bolt', 'Installation, entretien, réparation', 14, false),
  ('maison_construction', 'forage_puits', 'Forage / puits', 'Water drilling', 'bolt', 'Forage, pompe, entretien', 15, false),
  ('maison_construction', 'nettoyage', 'Nettoyage', 'Cleaning', 'spark', 'Maison, bureau, tapis, vitres', 16, false),
  ('maison_construction', 'jardinier', 'Jardinier', 'Gardener', 'spark', 'Entretien, taille, gazon', 17, false),
  ('maison_construction', 'demenagement', 'Déménagement', 'Moving', 'send', 'Déménagement, emballage, meubles', 18, false),
  ('maison_construction', 'deratisation', 'Dératisation', 'Pest control', 'shield', 'Rats, insectes, termites', 19, false),

  -- Numérique & réseau
  ('numerique_reseau', 'technicien', 'Technicien numérique', 'IT technician', 'wifi', 'Wi-Fi, téléphone, ordinateur, TV', 1, false),
  ('numerique_reseau', 'wifi_reseau', 'Wi-Fi / réseau', 'Network', 'wifi', 'Installation, panne, configuration', 2, false),
  ('numerique_reseau', 'telephone', 'Téléphone', 'Phone repair', 'wifi', 'Écran, batterie, logiciel', 3, false),
  ('numerique_reseau', 'ordinateur', 'Ordinateur', 'Computer', 'wifi', 'Panne, installation, virus, récupération', 4, false),
  ('numerique_reseau', 'tv_antenne', 'TV / antenne', 'TV', 'wifi', 'Antenne, décodeur, installation', 5, false),
  ('numerique_reseau', 'imprimante', 'Imprimante', 'Printer', 'wifi', 'Panne, installation, cartouche', 6, false),
  ('numerique_reseau', 'cameras', 'Caméras de surveillance', 'CCTV', 'shield', 'Installation, configuration, maintenance', 7, false),
  ('numerique_reseau', 'dev_graphiste', 'Développeur / graphiste', 'Developer', 'spark', 'Site web, application, logo, flyer', 8, false),

  -- Famille & éducation
  ('famille_education', 'cours_domicile', 'Cours à domicile', 'Home tutoring', 'user', 'Primaire, secondaire, université, langues', 1, false),
  ('famille_education', 'repetiteur', 'Répétiteur', 'Tutor', 'user', 'Maths, physique, français, anglais', 2, false),
  ('famille_education', 'nounou', 'Nounou', 'Nanny', 'user', 'Garde d’enfants, aide aux devoirs', 3, false),
  ('famille_education', 'aide_domicile', 'Aide à domicile', 'Home help', 'user', 'Ménage, cuisine, accompagnement', 4, false),

  -- Beauté & mode
  ('beaute_mode', 'coiffeur', 'Coiffeur', 'Hairdresser', 'spark', 'Homme, femme, enfant, à domicile', 1, false),
  ('beaute_mode', 'tailleur', 'Tailleur / couturier', 'Tailor', 'spark', 'Habits, retouches, uniformes', 2, false),
  ('beaute_mode', 'maquilleur', 'Maquilleur', 'Makeup artist', 'spark', 'Mariage, soirée, photo', 3, false),
  ('beaute_mode', 'barbier', 'Barbier', 'Barber', 'spark', 'À domicile, événement', 4, false),

  -- Événements & restauration
  ('evenements_restauration', 'traiteur', 'Traiteur', 'Caterer', 'star', 'Mariage, buffet, entreprise', 1, false),
  ('evenements_restauration', 'photographe', 'Photographe', 'Photographer', 'star', 'Mariage, portrait, événement', 2, false),
  ('evenements_restauration', 'dj_sono', 'DJ / sonorisation', 'DJ', 'star', 'DJ, sonorisation, éclairage', 3, false),
  ('evenements_restauration', 'baches_chaises', 'Bâches / chaises', 'Event rental', 'star', 'Bâches, chaises, tentes', 4, false),
  ('evenements_restauration', 'cuisinier', 'Cuisinier', 'Cook', 'star', 'À domicile, événement', 5, false),

  -- Agriculture & élevage
  ('agriculture_elevage', 'veterinaire', 'Vétérinaire', 'Veterinarian', 'shield', 'Consultation, vaccination, urgence', 1, false),
  ('agriculture_elevage', 'ouvrier_agricole', 'Ouvrier agricole', 'Farm worker', 'shield', 'Champ, récolte, plantation', 2, false),
  ('agriculture_elevage', 'tracteur', 'Tracteur', 'Tractor', 'wrench', 'Labour, transport', 3, false),
  ('agriculture_elevage', 'produits_agricoles', 'Produits agricoles', 'Farm products', 'shield', 'Vente, livraison', 4, false),

  -- Administratif & juridique
  ('administratif_juridique', 'ecrivain_public', 'Écrivain public', 'Public writer', 'shield', 'Lettres, dossiers, demandes', 1, false),
  ('administratif_juridique', 'aide_demarches', 'Aide aux démarches', 'Admin help', 'shield', 'Administration, visa, passeport', 2, false),
  ('administratif_juridique', 'huissier', 'Huissier', 'Bailiff', 'shield', 'Constat, signification', 3, false),
  ('administratif_juridique', 'avocat', 'Avocat', 'Lawyer', 'shield', 'Conseil, procédure', 4, false),
  ('administratif_juridique', 'traducteur', 'Traducteur', 'Translator', 'shield', 'Français-anglais, documents', 5, false),

  -- Transport & livraison
  ('transport_livraison', 'coursier', 'Coursier', 'Courier', 'send', 'Documents, colis, repas', 1, false),
  ('transport_livraison', 'camion', 'Camion', 'Truck', 'send', 'Déménagement, fret, chantier', 2, false),
  ('transport_livraison', 'bus', 'Bus', 'Bus', 'send', 'Location, groupe', 3, false),
  ('transport_livraison', 'taxi_moto', 'Taxi / moto-taxi', 'Taxi', 'send', 'Taxi, moto-taxi, transport urgent', 4, false),

  -- Autre
  ('autre', 'autre_besoin', 'Autre besoin', 'Other need', 'search', 'Décrivez librement votre besoin', 1, false)
on conflict (slug) do update
  set family_slug = excluded.family_slug,
      nom_fr = excluded.nom_fr,
      nom_en = excluded.nom_en,
      icon = excluded.icon,
      description = excluded.description,
      sort_order = excluded.sort_order,
      is_emergency = excluded.is_emergency;

insert into public.subcategories (category_id, slug, nom_fr, nom_en, sort_order)
select c.id, v.slug, v.nom_fr, v.nom_en, v.sort_order
from (
  values
    ('urgences', 'enfant_blesse', 'Enfant blessé / malade', 'Injured or sick child', 1),
    ('urgences', 'accident_route', 'Accident de la route', 'Road accident', 2),
    ('urgences', 'saignement', 'Saignement important', 'Severe bleeding', 3),
    ('urgences', 'brulure', 'Brûlure', 'Burn', 4),
    ('urgences', 'accouchement', 'Accouchement', 'Childbirth', 5),
    ('urgences', 'intoxication_morsure', 'Intoxication / morsure', 'Poisoning / bite', 6),
    ('urgences', 'etouffement', 'Étouffement', 'Choking', 7),
    ('urgences', 'malaise', 'Malaise', 'Fainting', 8),
    ('urgences', 'incendie', 'Incendie', 'Fire', 9),
    ('urgences', 'agression', 'Agression', 'Assault', 10),

    ('sante_domicile', 'infirmier', 'Infirmier à domicile', 'Home nurse', 1),
    ('sante_domicile', 'sage_femme', 'Sage-femme', 'Midwife', 2),
    ('sante_domicile', 'kine', 'Kinésithérapeute', 'Physiotherapist', 3),
    ('sante_domicile', 'pharmacie', 'Pharmacie', 'Pharmacy', 4),
    ('sante_domicile', 'garde_malade', 'Garde-malade', 'Caregiver', 5),
    ('sante_domicile', 'ambulancier_prive', 'Ambulancier privé', 'Private ambulance', 6),
    ('sante_domicile', 'medecin_domicile', 'Médecin à domicile', 'Home doctor', 7),

    ('mecanicien', 'mecanique_generale', 'Mécanique générale', 'General mechanics', 1),
    ('mecanicien', 'freins', 'Freins', 'Brakes', 2),
    ('mecanicien', 'moteur', 'Moteur', 'Engine', 3),
    ('mecanicien', 'boite_vitesse', 'Boîte de vitesses', 'Gearbox', 4),
    ('mecanicien', 'moto', 'Moto', 'Motorcycle', 5),
    ('mecanicien', 'diagnostic', 'Diagnostic', 'Diagnosis', 6),

    ('electricien_auto', 'batterie', 'Batterie', 'Battery', 1),
    ('electricien_auto', 'alternateur', 'Alternateur', 'Alternator', 2),
    ('electricien_auto', 'demarreur', 'Démarreur', 'Starter', 3),
    ('electricien_auto', 'feux', 'Feux', 'Lights', 4),

    ('vulcanisateur', 'pneu', 'Pneu', 'Tire', 1),
    ('vulcanisateur', 'chambre_a_air', 'Chambre à air', 'Inner tube', 2),
    ('vulcanisateur', 'valve', 'Valve', 'Valve', 3),

    ('depannage_remorquage', 'remorquage', 'Remorquage', 'Towing', 1),
    ('depannage_remorquage', 'depannage_sur_route', 'Dépannage sur route', 'Roadside repair', 2),
    ('depannage_remorquage', 'carburant', 'Carburant', 'Fuel', 3),

    ('carrossier', 'tole', 'Tôle', 'Body panels', 1),
    ('carrossier', 'peinture', 'Peinture', 'Paint', 2),
    ('carrossier', 'pare_chocs', 'Pare-chocs', 'Bumper', 3),

    ('lavage_auto', 'lavage_simple', 'Lavage simple', 'Basic wash', 1),
    ('lavage_auto', 'nettoyage_interieur', 'Nettoyage intérieur', 'Interior cleaning', 2),
    ('lavage_auto', 'lustrage', 'Lustrage', 'Polishing', 3),

    ('transport_vehicule', 'taxi', 'Taxi', 'Taxi', 1),
    ('transport_vehicule', 'moto_taxi', 'Moto-taxi', 'Moto taxi', 2),
    ('transport_vehicule', 'location_vehicule', 'Location de véhicule', 'Car rental', 3),
    ('transport_vehicule', 'chauffeur', 'Chauffeur', 'Driver', 4),

    ('depanneur', 'plomberie', 'Plomberie', 'Plumbing', 1),
    ('depanneur', 'electricite', 'Électricité', 'Electricity', 2),
    ('depanneur', 'serrure', 'Serrure', 'Lock', 3),
    ('depanneur', 'froid_clim', 'Froid / climatisation', 'Refrigeration', 4),

    ('plombier', 'fuite', 'Fuite', 'Leak', 1),
    ('plombier', 'installation', 'Installation', 'Installation', 2),
    ('plombier', 'chauffe_eau', 'Chauffe-eau', 'Water heater', 3),
    ('plombier', 'wc', 'WC / sanitaires', 'Toilet', 4),

    ('electricien', 'panne', 'Panne', 'Breakdown', 1),
    ('electricien', 'installation', 'Installation', 'Installation', 2),
    ('electricien', 'tableau', 'Tableau électrique', 'Fuse board', 3),
    ('electricien', 'groupe', 'Groupe électrogène', 'Generator', 4),

    ('macon', 'fondation', 'Fondation', 'Foundation', 1),
    ('macon', 'mur', 'Mur', 'Wall', 2),
    ('macon', 'dalle', 'Dalle', 'Slab', 3),
    ('macon', 'carrelage', 'Carrelage', 'Tiling', 4),

    ('menuisier', 'meuble', 'Meuble', 'Furniture', 1),
    ('menuisier', 'porte', 'Porte', 'Door', 2),
    ('menuisier', 'fenetre', 'Fenêtre', 'Window', 3),

    ('soudeur', 'grille', 'Grille', 'Grille', 1),
    ('soudeur', 'portail', 'Portail', 'Gate', 2),
    ('soudeur', 'structure', 'Structure', 'Structure', 3),

    ('peintre', 'interieur', 'Intérieur', 'Interior', 1),
    ('peintre', 'exterieur', 'Extérieur', 'Exterior', 2),
    ('peintre', 'facade', 'Façade', 'Facade', 3),

    ('carreleur', 'sol', 'Sol', 'Floor', 1),
    ('carreleur', 'mur', 'Mur', 'Wall', 2),
    ('carreleur', 'terrasse', 'Terrasse', 'Terrace', 3),

    ('serrurier', 'ouverture', 'Ouverture de porte', 'Lock opening', 1),
    ('serrurier', 'changement', 'Changement de serrure', 'Lock replacement', 2),
    ('serrurier', 'blindage', 'Blindage', 'Reinforcement', 3),

    ('vitrier', 'vitre', 'Vitre', 'Glass pane', 1),
    ('vitrier', 'miroir', 'Miroir', 'Mirror', 2),
    ('vitrier', 'douche', 'Douche', 'Shower glass', 3),

    ('toiture', 'tole', 'Tôle', 'Roof sheet', 1),
    ('toiture', 'etancheite', 'Étanchéité', 'Waterproofing', 2),
    ('toiture', 'charpente', 'Charpente', 'Frame', 3),

    ('froid_clim', 'frigo', 'Frigo', 'Fridge', 1),
    ('froid_clim', 'climatisation', 'Climatisation', 'Air conditioning', 2),
    ('froid_clim', 'chambre_froide', 'Chambre froide', 'Cold room', 3),

    ('solaire', 'installation', 'Installation', 'Installation', 1),
    ('solaire', 'batterie', 'Batterie', 'Battery', 2),
    ('solaire', 'entretien', 'Entretien', 'Maintenance', 3),

    ('groupe_electrogene', 'installation', 'Installation', 'Installation', 1),
    ('groupe_electrogene', 'entretien', 'Entretien', 'Maintenance', 2),
    ('groupe_electrogene', 'reparation', 'Réparation', 'Repair', 3),

    ('forage_puits', 'forage', 'Forage', 'Drilling', 1),
    ('forage_puits', 'pompe', 'Pompe', 'Pump', 2),
    ('forage_puits', 'entretien', 'Entretien', 'Maintenance', 3),

    ('nettoyage', 'maison', 'Maison', 'House', 1),
    ('nettoyage', 'bureau', 'Bureau', 'Office', 2),
    ('nettoyage', 'tapis', 'Tapis', 'Carpet', 3),
    ('nettoyage', 'vitres', 'Vitres', 'Windows', 4),

    ('jardinier', 'entretien', 'Entretien', 'Maintenance', 1),
    ('jardinier', 'taille', 'Taille', 'Pruning', 2),
    ('jardinier', 'gazon', 'Gazon', 'Lawn', 3),

    ('demenagement', 'demenagement', 'Déménagement', 'Moving', 1),
    ('demenagement', 'emballage', 'Emballage', 'Packing', 2),
    ('demenagement', 'transport_meubles', 'Transport de meubles', 'Furniture transport', 3),

    ('deratisation', 'rats', 'Rats', 'Rats', 1),
    ('deratisation', 'insectes', 'Insectes', 'Insects', 2),
    ('deratisation', 'termites', 'Termites', 'Termites', 3),

    ('technicien', 'wifi', 'Wi-Fi', 'Wi-Fi', 1),
    ('technicien', 'telephone', 'Téléphone', 'Phone', 2),
    ('technicien', 'ordinateur', 'Ordinateur', 'Computer', 3),
    ('technicien', 'tv', 'TV', 'TV', 4),
    ('technicien', 'imprimante', 'Imprimante', 'Printer', 5),

    ('wifi_reseau', 'installation', 'Installation', 'Installation', 1),
    ('wifi_reseau', 'panne', 'Panne', 'Breakdown', 2),
    ('wifi_reseau', 'configuration', 'Configuration', 'Configuration', 3),

    ('telephone', 'ecran', 'Écran', 'Screen', 1),
    ('telephone', 'batterie', 'Batterie', 'Battery', 2),
    ('telephone', 'logiciel', 'Logiciel', 'Software', 3),

    ('ordinateur', 'panne', 'Panne', 'Breakdown', 1),
    ('ordinateur', 'installation', 'Installation', 'Installation', 2),
    ('ordinateur', 'virus', 'Virus', 'Virus', 3),
    ('ordinateur', 'recuperation', 'Récupération de données', 'Data recovery', 4),

    ('tv_antenne', 'antenne', 'Antenne', 'Antenna', 1),
    ('tv_antenne', 'decodeur', 'Décodeur', 'Decoder', 2),
    ('tv_antenne', 'installation', 'Installation', 'Installation', 3),

    ('imprimante', 'panne', 'Panne', 'Breakdown', 1),
    ('imprimante', 'installation', 'Installation', 'Installation', 2),
    ('imprimante', 'cartouche', 'Cartouche', 'Cartridge', 3),

    ('cameras', 'installation', 'Installation', 'Installation', 1),
    ('cameras', 'configuration', 'Configuration', 'Configuration', 2),
    ('cameras', 'maintenance', 'Maintenance', 'Maintenance', 3),

    ('dev_graphiste', 'site_web', 'Site web', 'Website', 1),
    ('dev_graphiste', 'application', 'Application', 'App', 2),
    ('dev_graphiste', 'logo', 'Logo', 'Logo', 3),
    ('dev_graphiste', 'flyer', 'Flyer / affiche', 'Flyer', 4),

    ('cours_domicile', 'primaire', 'Primaire', 'Primary', 1),
    ('cours_domicile', 'secondaire', 'Secondaire', 'Secondary', 2),
    ('cours_domicile', 'universite', 'Université', 'University', 3),
    ('cours_domicile', 'langues', 'Langues', 'Languages', 4),

    ('repetiteur', 'maths', 'Maths', 'Maths', 1),
    ('repetiteur', 'physique', 'Physique', 'Physics', 2),
    ('repetiteur', 'francais', 'Français', 'French', 3),
    ('repetiteur', 'anglais', 'Anglais', 'English', 4),

    ('nounou', 'nounou', 'Nounou', 'Nanny', 1),
    ('nounou', 'garde_enfants', 'Garde d’enfants', 'Childcare', 2),
    ('nounou', 'aide_devoirs', 'Aide aux devoirs', 'Homework help', 3),

    ('aide_domicile', 'menage', 'Ménage', 'Cleaning', 1),
    ('aide_domicile', 'cuisine', 'Cuisine', 'Cooking', 2),
    ('aide_domicile', 'accompagnement', 'Accompagnement', 'Support', 3),

    ('coiffeur', 'homme', 'Homme', 'Men', 1),
    ('coiffeur', 'femme', 'Femme', 'Women', 2),
    ('coiffeur', 'enfant', 'Enfant', 'Children', 3),
    ('coiffeur', 'domicile', 'À domicile', 'At home', 4),

    ('tailleur', 'habit', 'Habit', 'Outfit', 1),
    ('tailleur', 'retouche', 'Retouche', 'Alteration', 2),
    ('tailleur', 'uniforme', 'Uniforme', 'Uniform', 3),

    ('maquilleur', 'mariage', 'Mariage', 'Wedding', 1),
    ('maquilleur', 'soiree', 'Soirée', 'Evening', 2),
    ('maquilleur', 'photo', 'Photo', 'Photo', 3),

    ('barbier', 'domicile', 'À domicile', 'At home', 1),
    ('barbier', 'evenement', 'Événement', 'Event', 2),

    ('traiteur', 'mariage', 'Mariage', 'Wedding', 1),
    ('traiteur', 'buffet', 'Buffet', 'Buffet', 2),
    ('traiteur', 'entreprise', 'Entreprise', 'Corporate', 3),

    ('photographe', 'mariage', 'Mariage', 'Wedding', 1),
    ('photographe', 'portrait', 'Portrait', 'Portrait', 2),
    ('photographe', 'evenement', 'Événement', 'Event', 3),

    ('dj_sono', 'dj', 'DJ', 'DJ', 1),
    ('dj_sono', 'sonorisation', 'Sonorisation', 'Sound system', 2),
    ('dj_sono', 'eclairage', 'Éclairage', 'Lighting', 3),

    ('baches_chaises', 'baches', 'Bâches', 'Tarpaulins', 1),
    ('baches_chaises', 'chaises', 'Chaises', 'Chairs', 2),
    ('baches_chaises', 'tentes', 'Tentes', 'Tents', 3),

    ('cuisinier', 'domicile', 'À domicile', 'At home', 1),
    ('cuisinier', 'evenement', 'Événement', 'Event', 2),

    ('veterinaire', 'consultation', 'Consultation', 'Consultation', 1),
    ('veterinaire', 'vaccination', 'Vaccination', 'Vaccination', 2),
    ('veterinaire', 'urgence', 'Urgence', 'Emergency', 3),

    ('ouvrier_agricole', 'champ', 'Travail aux champs', 'Field work', 1),
    ('ouvrier_agricole', 'recolte', 'Récolte', 'Harvest', 2),
    ('ouvrier_agricole', 'plantation', 'Plantation', 'Planting', 3),

    ('tracteur', 'labour', 'Labour', 'Ploughing', 1),
    ('tracteur', 'transport', 'Transport', 'Transport', 2),

    ('produits_agricoles', 'vente', 'Vente', 'Sale', 1),
    ('produits_agricoles', 'livraison', 'Livraison', 'Delivery', 2),

    ('ecrivain_public', 'lettre', 'Lettre', 'Letter', 1),
    ('ecrivain_public', 'dossier', 'Dossier', 'File', 2),
    ('ecrivain_public', 'demande', 'Demande', 'Request', 3),

    ('aide_demarches', 'administration', 'Administration', 'Administration', 1),
    ('aide_demarches', 'visa', 'Visa', 'Visa', 2),
    ('aide_demarches', 'passeport', 'Passeport', 'Passport', 3),

    ('huissier', 'constat', 'Constat', 'Report', 1),
    ('huissier', 'signification', 'Signification', 'Service', 2),

    ('avocat', 'conseil', 'Conseil', 'Advice', 1),
    ('avocat', 'procedure', 'Procédure', 'Procedure', 2),

    ('traducteur', 'francais_anglais', 'Français-anglais', 'French-English', 1),
    ('traducteur', 'documents', 'Documents', 'Documents', 2),

    ('coursier', 'documents', 'Documents', 'Documents', 1),
    ('coursier', 'colis', 'Colis', 'Parcel', 2),
    ('coursier', 'repas', 'Repas', 'Meal', 3),

    ('camion', 'demenagement', 'Déménagement', 'Moving', 1),
    ('camion', 'fret', 'Fret', 'Freight', 2),
    ('camion', 'chantier', 'Chantier', 'Construction site', 3),

    ('bus', 'location_bus', 'Location de bus', 'Bus rental', 1),
    ('bus', 'groupe', 'Transport de groupe', 'Group transport', 2),

    ('taxi_moto', 'taxi', 'Taxi', 'Taxi', 1),
    ('taxi_moto', 'moto_taxi', 'Moto-taxi', 'Moto taxi', 2),
    ('taxi_moto', 'transport_urgent', 'Transport urgent', 'Urgent transport', 3),

    ('autre_besoin', 'autre', 'Autre', 'Other', 1)
) as v(category_slug, slug, nom_fr, nom_en, sort_order)
join public.categories c on c.slug = v.category_slug
on conflict (category_id, slug) do update
  set nom_fr = excluded.nom_fr,
      nom_en = excluded.nom_en,
      sort_order = excluded.sort_order;

-- -----------------------------------------------------------------------------
-- Compatibilité avec les anciennes données
-- -----------------------------------------------------------------------------
update public.requests q
set categorie_nom = c.nom_fr
from public.categories c
where q.categorie = c.slug
  and q.categorie_nom is null;

update public.providers p
set metier_nom = c.nom_fr
from public.categories c
where p.metier = c.slug
  and p.metier_nom is null;

update public.providers
set type_aideur = true
where metier in ('taxi_moto', 'transport_vehicule', 'coursier', 'camion', 'bus');
