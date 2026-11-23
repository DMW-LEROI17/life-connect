-- =============================================================================
-- LIFE CONNECT – V2 NATIONALE
-- 10_v2_emergency_seed.sql — guides d'urgence et établissements de santé
-- À exécuter APRÈS 09_v2_catalog_seed.sql.
--
-- Les guides sont des premiers gestes généraux. Ils ne remplacent pas un
-- médecin. Les établissements sont listés sans numéro de téléphone tant que
-- le numéro n'a pas été vérifié : l'admin doit les compléter.
-- =============================================================================

insert into public.emergency_guides
  (slug, title, summary, icon, do_steps, dont_steps, warning, sort_order)
values
  (
    'enfant_blesse',
    'Enfant blessé ou malade',
    'Un enfant tombé, fiévreux ou blessé : restez calme et vérifiez d’abord sa respiration.',
    'alert',
    jsonb_build_array(
      'Mettez l’enfant en sécurité, à l’écart du danger.',
      'Parlez-lui doucement et vérifiez s’il répond et s’il respire.',
      'Appelez le 119 (SAMU) ou le 117 (police) selon la situation.',
      'Si l’enfant saigne, appuyez fort sur la plaie avec un linge propre.',
      'Gardez-le au chaud et rassurez-le jusqu’aux secours.'
    ),
    jsonb_build_array(
      'Ne le déplacez pas s’il est tombé de haut ou se plaint du dos ou du cou.',
      'Ne lui donnez pas à manger ou à boire s’il est inconscient ou somnolent.',
      'Ne lui donnez aucun médicament sans l’avis d’un soignant.',
      'Ne le secouez pas et ne le giflez pas pour le réveiller.'
    ),
    'Ne remplace pas un médecin. En cas de doute, appelez le 119.',
    1
  ),
  (
    'accident_route',
    'Accident de la route',
    'Protéger la zone, alerter les secours, ne pas aggraver les blessures.',
    'alert',
    jsonb_build_array(
      'Coupez le contact du véhicule si vous pouvez le faire sans danger.',
      'Allumez les feux de détresse et éloignez les autres personnes de la route.',
      'Appelez le 117 (police), le 118 (pompiers) ou le 119 (SAMU).',
      'Parlez aux blessés, couvrez-les et rassurez-les.',
      'Si une personne saigne beaucoup, appuyez sur la plaie avec un linge propre.'
    ),
    jsonb_build_array(
      'Ne déplacez pas un blessé sauf danger immédiat (feu, explosion).',
      'Ne retirez pas un casque de moto sauf si la personne ne respire plus.',
      'Ne donnez pas à boire à un blessé.',
      'Ne filmez pas et ne gênez pas les secours.'
    ),
    'Ne remplace pas un médecin. En cas de doute, appelez le 119.',
    2
  ),
  (
    'saignement',
    'Saignement important',
    'Appuyer fort, ne pas retirer l’objet planté, alerter.',
    'alert',
    jsonb_build_array(
      'Allongez la personne et surélevez doucement la partie qui saigne.',
      'Appuyez fortement sur la plaie avec un linge propre ou vos mains gantées.',
      'Maintenez la pression sans relâcher pendant au moins 10 minutes.',
      'Si le sang traverse, ajoutez un autre linge par-dessus.',
      'Appelez le 119 ou faites appeler un proche.'
    ),
    jsonb_build_array(
      'Ne retirez pas un objet planté dans la plaie.',
      'N’utilisez pas de garrot sauf si vous êtes formé et que le saignement est incontrôlable.',
      'Ne mettez pas de terre, de cendre ou de plante sur la plaie.',
      'Ne donnez pas à boire ni à manger.'
    ),
    'Ne remplace pas un médecin. Un saignement abondant est une urgence.',
    3
  ),
  (
    'brulure',
    'Brûlure',
    'Refroidir avec de l’eau tiède, couvrir proprement, ne rien appliquer.',
    'alert',
    jsonb_build_array(
      'Éloignez la personne de la source de chaleur.',
      'Refroidissez la brûlure sous de l’eau tiède (pas glacée) pendant 15 à 20 minutes.',
      'Retirez bagues, montres et vêtements non collés à la peau.',
      'Couvrez avec un linge propre et humide, sans serrer.',
      'Appelez le 119 si la brûlure est étendue, au visage, aux mains ou chez un enfant.'
    ),
    jsonb_build_array(
      'N’appliquez pas d’huile, de beurre, de dentifrice, de cendre ou d’alcool.',
      'Ne percez pas les cloques.',
      'N’utilisez pas de glace directement sur la peau.',
      'N’arrachez pas les vêtements collés à la brûlure.'
    ),
    'Ne remplace pas un médecin. Une brûlure grave nécessite un hôpital.',
    4
  ),
  (
    'accouchement',
    'Accouchement imminent',
    'Appeler les secours, installer la mère, ne pas tirer sur le bébé.',
    'alert',
    jsonb_build_array(
      'Appelez le 119 et une sage-femme ou un proche qui peut aider.',
      'Installez la mère dans un endroit propre, calme et chaud.',
      'Lavez-vous les mains et préparez des linges propres.',
      'Laissez la nature faire : soutenez le bébé sans tirer.',
      'Après la naissance, séchez le bébé, couvrez-le et gardez-le contre sa mère.'
    ),
    jsonb_build_array(
      'Ne tirez pas sur le bébé ni sur le cordon.',
      'Ne coupez pas le cordon vous-même.',
      'Ne donnez pas de médicament pour accélérer ou arrêter le travail.',
      'Ne laissez pas la mère seule.'
    ),
    'Ne remplace pas un médecin. Appelez le 119 dès que possible.',
    5
  ),
  (
    'intoxication_morsure',
    'Intoxication ou morsure',
    'Identifier le produit ou l’animal, ne pas faire vomir, appeler.',
    'alert',
    jsonb_build_array(
      'Éloignez la personne du produit ou de l’animal.',
      'Gardez l’emballage, la plante ou une photo pour identifier la cause.',
      'Appelez le 119 et décrivez ce qui a été avalé ou la morsure.',
      'En cas de morsure de serpent, immobilisez le membre et gardez-le plus bas que le cœur.',
      'Retirez bagues et vêtements serrés avant que le membre ne gonfle.'
    ),
    jsonb_build_array(
      'Ne faites pas vomir.',
      'Ne coupez pas, ne sucez pas et ne brûlez pas une morsure.',
      'Ne posez pas de garrot.',
      'Ne donnez ni lait ni huile.'
    ),
    'Ne remplace pas un médecin. Appelez immédiatement le 119.',
    6
  ),
  (
    'etouffement',
    'Étouffement',
    'La personne ne peut plus parler ni respirer : agir vite.',
    'alert',
    jsonb_build_array(
      'Demandez à la personne de tousser si elle le peut encore.',
      'Si elle ne peut plus respirer, donnez 5 claques fermes entre les omoplates.',
      'Si cela ne suffit pas, faites 5 compressions abdominales (adultes et enfants de plus de 1 an).',
      'Chez le nourrisson, alternez 5 claques dans le dos et 5 compressions thoraciques.',
      'Appelez le 119 et continuez jusqu’à l’arrivée des secours.'
    ),
    jsonb_build_array(
      'Ne mettez pas vos doigts dans la gorge à l’aveugle.',
      'Ne donnez pas à boire.',
      'Ne secouez pas le nourrisson par les pieds.',
      'N’arrêtez pas les gestes si la personne perd connaissance : commencez la réanimation si vous êtes formé.'
    ),
    'Ne remplace pas un médecin. Chaque seconde compte.',
    7
  ),
  (
    'malaise',
    'Malaise ou perte de connaissance',
    'Allonger, vérifier la respiration, appeler.',
    'alert',
    jsonb_build_array(
      'Allongez la personne et surélevez légèrement ses jambes.',
      'Desserrez les vêtements serrés et aérez la pièce.',
      'Vérifiez qu’elle respire et qu’elle répond.',
      'Si elle est inconsciente mais respire, mettez-la sur le côté (position de sécurité).',
      'Appelez le 119 et restez avec elle.'
    ),
    jsonb_build_array(
      'Ne la relevez pas brutalement.',
      'Ne lui donnez pas à boire si elle est somnolente ou inconsciente.',
      'Ne la laissez pas seule.',
      'Ne lui donnez pas de médicament sans avis médical.'
    ),
    'Ne remplace pas un médecin. Une perte de connaissance est une urgence.',
    8
  ),
  (
    'incendie',
    'Incendie',
    'Alerter, évacuer, ne pas respirer la fumée.',
    'alert',
    jsonb_build_array(
      'Appelez le 118 (pompiers) et faites évacuer les lieux.',
      'Sortez en restant près du sol, sous la fumée.',
      'Fermez les portes derrière vous sans les verrouiller.',
      'Si vos vêtements brûlent : arrêtez-vous, couvrez-vous le visage et roulez au sol.',
      'Rejoignez un point de rassemblement et comptez les personnes.'
    ),
    jsonb_build_array(
      'Ne retournez pas dans un bâtiment en feu.',
      'Ne jetez pas d’eau sur un feu électrique ou sur de l’huile.',
      'N’utilisez pas l’ascenseur.',
      'Ne respirez pas la fumée et ne restez pas près des flammes.'
    ),
    'Ne remplace pas les pompiers. Appelez le 118.',
    9
  ),
  (
    'agression',
    'Agression ou violence',
    'Se mettre en sécurité, appeler la police, ne pas se venger.',
    'alert',
    jsonb_build_array(
      'Éloignez-vous du danger et rejoignez un lieu public ou une personne de confiance.',
      'Appelez le 117 (police) ou le 113 (gendarmerie).',
      'Demandez une prise en charge médicale si vous êtes blessé.',
      'Conservez les preuves (vêtements, messages, photos) sans les modifier.',
      'Demandez un accompagnement psychologique si nécessaire.'
    ),
    jsonb_build_array(
      'Ne confrontez pas l’agresseur.',
      'Ne nettoyez pas les blessures avant un examen médical si elles peuvent servir de preuve.',
      'Ne restez pas seul si vous êtes en danger.',
      'Ne diffusez pas les informations personnelles de la victime.'
    ),
    'Ne remplace pas la police ni un médecin. En danger immédiat, appelez le 117.',
    10
  )
on conflict (slug) do update
  set title = excluded.title,
      summary = excluded.summary,
      icon = excluded.icon,
      do_steps = excluded.do_steps,
      dont_steps = excluded.dont_steps,
      warning = excluded.warning,
      sort_order = excluded.sort_order;

-- -----------------------------------------------------------------------------
-- Établissements de santé : noms connus, numéros à vérifier
-- -----------------------------------------------------------------------------
insert into public.emergency_facilities
  (nom, type, region_id, departement_id, arrondissement_id, region_nom, departement_nom,
   ville, adresse, telephone, horaires, is_verified, source)
select
  v.nom, v.type, r.id, d.id, a.id, r.nom, d.nom,
  v.ville, v.adresse, null, '24h/24 (à confirmer)', false,
  'Coordonnées à vérifier — appelez le 119'
from (
  values
    ('littoral', 'wouri', 'douala', 'Hôpital Général de Douala', 'hopital', 'Douala', 'Douala'),
    ('littoral', 'wouri', 'douala', 'Hôpital Laquintinie', 'hopital', 'Douala', 'Douala'),
    ('littoral', 'wouri', 'douala', 'Clinique des Cocotiers', 'clinique', 'Douala', 'Douala'),
    ('centre', 'mfoundi', 'yaounde', 'Hôpital Central de Yaoundé', 'hopital', 'Yaoundé', 'Yaoundé'),
    ('centre', 'mfoundi', 'yaounde', 'Hôpital Général de Yaoundé', 'hopital', 'Yaoundé', 'Yaoundé'),
    ('centre', 'mfoundi', 'yaounde', 'Hôpital Gynéco-Obstétrique et Pédiatrique de Yaoundé', 'hopital', 'Yaoundé', 'Yaoundé'),
    ('ouest', 'mifi', 'bafoussam', 'Hôpital Régional de Bafoussam', 'hopital', 'Bafoussam', 'Bafoussam'),
    ('nord', 'benoue', 'garoua', 'Hôpital Régional de Garoua', 'hopital', 'Garoua', 'Garoua'),
    ('nord_ouest', 'mezam', 'bamenda', 'Bamenda Regional Hospital', 'hopital', 'Bamenda', 'Bamenda'),
    ('est', 'lom_et_djerem', 'bertoua', 'Hôpital Régional de Bertoua', 'hopital', 'Bertoua', 'Bertoua'),
    ('extreme_nord', 'diamare', 'maroua', 'Hôpital Régional de Maroua', 'hopital', 'Maroua', 'Maroua'),
    ('adamaoua', 'vina', 'ngaoundere', 'Hôpital Régional de Ngaoundéré', 'hopital', 'Ngaoundéré', 'Ngaoundéré'),
    ('sud', 'mvila', 'ebolowa', 'Hôpital Régional d’Ebolowa', 'hopital', 'Ebolowa', 'Ebolowa'),
    ('sud_ouest', 'fako', 'buea', 'Buea Regional Hospital', 'hopital', 'Buea', 'Buea'),
    ('sud_ouest', 'fako', 'limbe', 'Limbe Regional Hospital', 'hopital', 'Limbe', 'Limbe'),
    ('sud', 'ocean', 'kribi', 'Hôpital de District de Kribi', 'hopital', 'Kribi', 'Kribi'),
    ('ouest', 'haut_nkam', 'bafang', 'Hôpital de District de Bafang', 'hopital', 'Bafang', 'Bafang')
) as v(region_slug, dep_slug, city_slug, nom, type, ville, adresse)
join public.regions r on r.slug = v.region_slug
join public.departements d on d.region_id = r.id and d.slug = v.dep_slug
join public.arrondissements a on a.departement_id = d.id and a.slug = v.city_slug
on conflict (nom, ville) do nothing;

-- -----------------------------------------------------------------------------
-- Prestataire de démonstration pour tester l'alerte transport
-- -----------------------------------------------------------------------------
insert into public.providers
  (nom, metier, metier_nom, specialite, quartier, quartier_id, region_id, departement_id,
   arrondissement_id, whatsapp, statut, disponible, note_moyenne, nombre_avis, est_demo, type_aideur, valide_le)
select
  'Démo – Moto Taxi Akwa', 'taxi_moto', 'Taxi / moto-taxi', 'Transport urgent',
  'Akwa', q.id, r.id, d.id, a.id, '+237699000007', 'valide', true, 4.7, 9, true, true, now()
from public.regions r
join public.departements d on d.region_id = r.id and d.slug = 'wouri'
join public.arrondissements a on a.departement_id = d.id and a.slug = 'douala'
join public.quartiers q on q.arrondissement_id = a.id and q.slug = 'akwa'
where r.slug = 'littoral'
  and not exists (
    select 1 from public.providers where nom = 'Démo – Moto Taxi Akwa'
  );

insert into public.provider_zones (provider_id, scope, quartier_id)
select p.id, 'quartier', q.id
from public.providers p
join public.quartiers q on q.slug = 'akwa'
where p.nom = 'Démo – Moto Taxi Akwa'
on conflict do nothing;
