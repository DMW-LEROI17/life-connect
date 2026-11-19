-- =============================================================================
-- LIFE CONNECT – HELP ME
-- 04_seed.sql — données de démonstration
-- À exécuter APRÈS 03_rls.sql.
--
-- Ces 6 prestataires sont FICTIFS et marqués est_demo = true.
-- Les numéros WhatsApp sont faux et ne doivent jamais être contactés.
-- Pour les supprimer avant l'ouverture au public :
--   delete from public.providers where est_demo = true;
-- =============================================================================

delete from public.providers where est_demo = true;

insert into public.providers
  (nom, metier, specialite, quartier, latitude, longitude, whatsapp, statut, disponible, note_moyenne, nombre_avis, est_demo, valide_le)
values
  -- DONNÉE DE DÉMONSTRATION — ne pas utiliser en production
  ('Démo – Garage Akwa', 'mecanicien', 'Vidange, freins, diagnostic', 'Akwa',
   4.0483, 9.7043, '+237699000001', 'valide', true, 4.8, 12, true, now()),

  -- DONNÉE DE DÉMONSTRATION — ne pas utiliser en production
  ('Démo – Moto Express Bonapriso', 'mecanicien', 'Motos, scooters, pneus', 'Bonapriso',
   4.0301, 9.7005, '+237699000002', 'valide', true, 4.6, 8, true, now()),

  -- DONNÉE DE DÉMONSTRATION — ne pas utiliser en production
  ('Démo – Élec Service Deïdo', 'depanneur', 'Électricité, tableau, disjoncteur', 'Deïdo',
   4.0702, 9.7102, '+237699000003', 'valide', true, 4.7, 15, true, now()),

  -- DONNÉE DE DÉMONSTRATION — ne pas utiliser en production
  ('Démo – Plomberie Bépanda', 'depanneur', 'Fuites, robinets, chauffe-eau', 'Bépanda',
   4.0605, 9.7302, '+237699000004', 'valide', true, 4.4, 6, true, now()),

  -- DONNÉE DE DÉMONSTRATION — ne pas utiliser en production
  ('Démo – NetFix Makepe', 'technicien', 'Wi-Fi, ordinateurs, réseaux', 'Makepe',
   4.0803, 9.7501, '+237699000005', 'valide', true, 4.9, 21, true, now()),

  -- DONNÉE DE DÉMONSTRATION — ne pas utiliser en production
  ('Démo – Info Dépannage Bonabéri', 'technicien', 'Téléphones, TV, décodeurs', 'Bonabéri',
   4.0710, 9.6605, '+237699000006', 'valide', true, 4.3, 5, true, now());
