-- =============================================================================
-- LIFE CONNECT – V2 NATIONALE
-- 08_v2_geo_seed.sql — 10 régions, 58 départements, villes et quartiers
-- À exécuter APRÈS 07_v2_rls.sql.
--
-- Sources : découpage administratif officiel du Cameroun (10 régions, 58
-- départements). Les quartiers sont une base de départ locale : ils sont
-- marqués is_verified = false et doivent être complétés/validés.
-- =============================================================================

insert into public.regions (slug, nom, chef_lieu, is_verified, source)
values
  ('adamaoua', 'Adamaoua', 'Ngaoundéré', true, 'Découpage administratif du Cameroun'),
  ('centre', 'Centre', 'Yaoundé', true, 'Découpage administratif du Cameroun'),
  ('est', 'Est', 'Bertoua', true, 'Découpage administratif du Cameroun'),
  ('extreme_nord', 'Extrême-Nord', 'Maroua', true, 'Découpage administratif du Cameroun'),
  ('littoral', 'Littoral', 'Douala', true, 'Découpage administratif du Cameroun'),
  ('nord', 'Nord', 'Garoua', true, 'Découpage administratif du Cameroun'),
  ('nord_ouest', 'Nord-Ouest', 'Bamenda', true, 'Découpage administratif du Cameroun'),
  ('ouest', 'Ouest', 'Bafoussam', true, 'Découpage administratif du Cameroun'),
  ('sud', 'Sud', 'Ebolowa', true, 'Découpage administratif du Cameroun'),
  ('sud_ouest', 'Sud-Ouest', 'Buea', true, 'Découpage administratif du Cameroun')
on conflict (slug) do update
  set nom = excluded.nom,
      chef_lieu = excluded.chef_lieu;

insert into public.departements (region_id, slug, nom, chef_lieu, is_verified, source)
select r.id, v.slug, v.nom, v.chef_lieu, true, 'Découpage administratif du Cameroun'
from (
  values
    ('adamaoua', 'djerem', 'Djérem', 'Tibati'),
    ('adamaoua', 'faro_et_deo', 'Faro-et-Déo', 'Tignère'),
    ('adamaoua', 'mayo_banyo', 'Mayo-Banyo', 'Banyo'),
    ('adamaoua', 'mbere', 'Mbéré', 'Meiganga'),
    ('adamaoua', 'vina', 'Vina', 'Ngaoundéré'),

    ('centre', 'haute_sanaga', 'Haute-Sanaga', 'Nanga-Eboko'),
    ('centre', 'lekie', 'Lekié', 'Monatélé'),
    ('centre', 'mbam_et_inoubou', 'Mbam-et-Inoubou', 'Bafia'),
    ('centre', 'mbam_et_kim', 'Mbam-et-Kim', 'Ntui'),
    ('centre', 'mefou_et_afamba', 'Méfou-et-Afamba', 'Mfou'),
    ('centre', 'mefou_et_akono', 'Méfou-et-Akono', 'Ngoumou'),
    ('centre', 'mfoundi', 'Mfoundi', 'Yaoundé'),
    ('centre', 'nyong_et_kelle', 'Nyong-et-Kéllé', 'Eséka'),
    ('centre', 'nyong_et_mfoumou', 'Nyong-et-Mfoumou', 'Akonolinga'),
    ('centre', 'nyong_et_soo', 'Nyong-et-So''o', 'Mbalmayo'),

    ('est', 'boumba_et_ngoko', 'Boumba-et-Ngoko', 'Yokadouma'),
    ('est', 'haut_nyong', 'Haut-Nyong', 'Abong-Mbang'),
    ('est', 'kadey', 'Kadey', 'Batouri'),
    ('est', 'lom_et_djerem', 'Lom-et-Djérem', 'Bertoua'),

    ('extreme_nord', 'diamare', 'Diamaré', 'Maroua'),
    ('extreme_nord', 'logone_et_chari', 'Logone-et-Chari', 'Kousséri'),
    ('extreme_nord', 'mayo_danay', 'Mayo-Danay', 'Yagoua'),
    ('extreme_nord', 'mayo_kani', 'Mayo-Kani', 'Kaélé'),
    ('extreme_nord', 'mayo_sava', 'Mayo-Sava', 'Mora'),
    ('extreme_nord', 'mayo_tsanaga', 'Mayo-Tsanaga', 'Mokolo'),

    ('littoral', 'moungo', 'Moungo', 'Nkongsamba'),
    ('littoral', 'nkam', 'Nkam', 'Yabassi'),
    ('littoral', 'sanaga_maritime', 'Sanaga-Maritime', 'Édéa'),
    ('littoral', 'wouri', 'Wouri', 'Douala'),

    ('nord', 'benoue', 'Bénoué', 'Garoua'),
    ('nord', 'faro', 'Faro', 'Poli'),
    ('nord', 'mayo_louti', 'Mayo-Louti', 'Guider'),
    ('nord', 'mayo_rey', 'Mayo-Rey', 'Tcholliré'),

    ('nord_ouest', 'boyo', 'Boyo', 'Fundong'),
    ('nord_ouest', 'bui', 'Bui', 'Kumbo'),
    ('nord_ouest', 'donga_mantung', 'Donga-Mantung', 'Nkambe'),
    ('nord_ouest', 'menchum', 'Menchum', 'Wum'),
    ('nord_ouest', 'mezam', 'Mezam', 'Bamenda'),
    ('nord_ouest', 'momo', 'Momo', 'Mbengwi'),
    ('nord_ouest', 'ngoketunjia', 'Ngoketunjia', 'Ndop'),

    ('ouest', 'bamboutos', 'Bamboutos', 'Mbouda'),
    ('ouest', 'haut_nkam', 'Haut-Nkam', 'Bafang'),
    ('ouest', 'hauts_plateaux', 'Hauts-Plateaux', 'Baham'),
    ('ouest', 'koung_khi', 'Koung-Khi', 'Bandjoun'),
    ('ouest', 'menoua', 'Menoua', 'Dschang'),
    ('ouest', 'mifi', 'Mifi', 'Bafoussam'),
    ('ouest', 'nde', 'Ndé', 'Bazou'),
    ('ouest', 'noun', 'Noun', 'Foumban'),

    ('sud', 'dja_et_lobo', 'Dja-et-Lobo', 'Sangmélima'),
    ('sud', 'mvila', 'Mvila', 'Ebolowa'),
    ('sud', 'ocean', 'Océan', 'Kribi'),
    ('sud', 'vallee_du_ntem', 'Vallée-du-Ntem', 'Ambam'),

    ('sud_ouest', 'fako', 'Fako', 'Buea'),
    ('sud_ouest', 'koupe_manengouba', 'Koupé-Manengouba', 'Bangem'),
    ('sud_ouest', 'lebialem', 'Lebialem', 'Menji'),
    ('sud_ouest', 'manyu', 'Manyu', 'Mamfe'),
    ('sud_ouest', 'meme', 'Meme', 'Kumba'),
    ('sud_ouest', 'ndian', 'Ndian', 'Mundemba')
) as v(region_slug, slug, nom, chef_lieu)
join public.regions r on r.slug = v.region_slug
on conflict (region_id, slug) do update
  set nom = excluded.nom,
      chef_lieu = excluded.chef_lieu;

-- -----------------------------------------------------------------------------
-- Villes / communes de départ (les arrondissements fins seront ajoutés ensuite)
-- -----------------------------------------------------------------------------
insert into public.arrondissements (departement_id, slug, nom, type, is_verified, source)
select d.id, v.slug, v.nom, v.type, true, 'Chef-lieu / ville principale'
from (
  values
    ('littoral', 'wouri', 'douala', 'Douala', 'ville'),
    ('littoral', 'moungo', 'nkongsamba', 'Nkongsamba', 'commune'),
    ('littoral', 'sanaga_maritime', 'edea', 'Édéa', 'commune'),
    ('littoral', 'nkam', 'yabassi', 'Yabassi', 'commune'),
    ('centre', 'mfoundi', 'yaounde', 'Yaoundé', 'ville'),
    ('ouest', 'mifi', 'bafoussam', 'Bafoussam', 'ville'),
    ('ouest', 'haut_nkam', 'bafang', 'Bafang', 'commune'),
    ('ouest', 'noun', 'foumban', 'Foumban', 'commune'),
    ('ouest', 'menoua', 'dschang', 'Dschang', 'commune'),
    ('nord', 'benoue', 'garoua', 'Garoua', 'ville'),
    ('nord_ouest', 'mezam', 'bamenda', 'Bamenda', 'ville'),
    ('nord_ouest', 'bui', 'kumbo', 'Kumbo', 'commune'),
    ('est', 'lom_et_djerem', 'bertoua', 'Bertoua', 'ville'),
    ('extreme_nord', 'diamare', 'maroua', 'Maroua', 'ville'),
    ('adamaoua', 'vina', 'ngaoundere', 'Ngaoundéré', 'ville'),
    ('sud', 'mvila', 'ebolowa', 'Ebolowa', 'ville'),
    ('sud', 'ocean', 'kribi', 'Kribi', 'ville'),
    ('sud_ouest', 'fako', 'buea', 'Buea', 'ville'),
    ('sud_ouest', 'fako', 'limbe', 'Limbe', 'ville'),
    ('sud_ouest', 'meme', 'kumba', 'Kumba', 'ville')
) as v(region_slug, dep_slug, slug, nom, type)
join public.regions r on r.slug = v.region_slug
join public.departements d on d.region_id = r.id and d.slug = v.dep_slug
on conflict (departement_id, slug) do update
  set nom = excluded.nom,
      type = excluded.type;

-- -----------------------------------------------------------------------------
-- Quartiers principaux (base de départ, à compléter et vérifier)
-- -----------------------------------------------------------------------------
insert into public.quartiers (arrondissement_id, slug, nom, is_verified, source)
select a.id, v.slug, v.nom, false, 'Liste locale à vérifier'
from (
  values
    ('douala', 'akwa', 'Akwa'),
    ('douala', 'bonanjo', 'Bonanjo'),
    ('douala', 'bonapriso', 'Bonapriso'),
    ('douala', 'deido', 'Deïdo'),
    ('douala', 'bepanda', 'Bépanda'),
    ('douala', 'makepe', 'Makepe'),
    ('douala', 'ndokoti', 'Ndokoti'),
    ('douala', 'ndogbong', 'Ndogbong'),
    ('douala', 'kotto', 'Kotto'),
    ('douala', 'bonaberi', 'Bonabéri'),
    ('douala', 'logbessou', 'Logbessou'),
    ('douala', 'pk8', 'PK8'),
    ('douala', 'pk14', 'PK14'),
    ('douala', 'yassa', 'Yassa'),
    ('douala', 'japoma', 'Japoma'),
    ('douala', 'cite_des_palmiers', 'Cité des Palmiers'),
    ('douala', 'new_bell', 'New Bell'),
    ('douala', 'bassa', 'Bassa'),
    ('douala', 'dikolo', 'Dikolo'),
    ('douala', 'nylon', 'Nylon'),

    ('yaounde', 'bastos', 'Bastos'),
    ('yaounde', 'centre_ville', 'Centre-ville'),
    ('yaounde', 'mvog_mbi', 'Mvog-Mbi'),
    ('yaounde', 'mvog_ada', 'Mvog-Ada'),
    ('yaounde', 'nlongkak', 'Nlongkak'),
    ('yaounde', 'biyem_assi', 'Biyem-Assi'),
    ('yaounde', 'mendong', 'Mendong'),
    ('yaounde', 'ngousso', 'Ngousso'),
    ('yaounde', 'etoa_meki', 'Etoa-Meki'),
    ('yaounde', 'ekounou', 'Ekounou'),
    ('yaounde', 'mimboman', 'Mimboman'),
    ('yaounde', 'nsam', 'Nsam'),
    ('yaounde', 'briqueterie', 'Briqueterie'),
    ('yaounde', 'odza', 'Odza'),
    ('yaounde', 'nkolbisson', 'Nkolbisson'),
    ('yaounde', 'emana', 'Emana'),

    ('bafoussam', 'tamdja', 'Tamdja'),
    ('bafoussam', 'djeleng', 'Djeleng'),
    ('bafoussam', 'tougang', 'Tougang'),
    ('bafoussam', 'banengo', 'Banengo'),
    ('bafoussam', 'kamkop', 'Kamkop'),
    ('bafoussam', 'tyo', 'Tyo'),
    ('bafoussam', 'ndiangdam', 'Ndiangdam'),
    ('bafoussam', 'foto', 'Foto'),

    ('garoua', 'rounde_adjia', 'Roumdé Adjia'),
    ('garoua', 'poumpoumre', 'Poumpoumré'),
    ('garoua', 'foulbere', 'Foulbéré'),
    ('garoua', 'djamboutou', 'Djamboutou'),
    ('garoua', 'ouro_labo', 'Ouro Labo'),
    ('garoua', 'yelwa', 'Yelwa'),
    ('garoua', 'bockle', 'Bocklé'),
    ('garoua', 'pitoare', 'Pitoaré'),

    ('bamenda', 'nkwen', 'Nkwen'),
    ('bamenda', 'mankon', 'Mankon'),
    ('bamenda', 'azire', 'Azire'),
    ('bamenda', 'old_town', 'Old Town'),
    ('bamenda', 'up_station', 'Up Station'),
    ('bamenda', 'ntarikon', 'Ntarikon'),
    ('bamenda', 'mile_4', 'Mile 4'),
    ('bamenda', 'mile_8', 'Mile 8'),
    ('bamenda', 'songwa', 'Songwa'),

    ('bertoua', 'nkolbikon', 'Nkolbikon'),
    ('bertoua', 'mokolo', 'Mokolo'),
    ('bertoua', 'tigaza', 'Tigaza'),
    ('bertoua', 'bercail', 'Bercail'),
    ('bertoua', 'ecole', 'École'),
    ('bertoua', 'madagascar', 'Madagascar'),
    ('bertoua', 'nkoumadjap', 'Nkoumadjap'),

    ('maroua', 'domayo', 'Domayo'),
    ('maroua', 'founangue', 'Founangué'),
    ('maroua', 'kakatare', 'Kakataré'),
    ('maroua', 'djarengol', 'Djarengol'),
    ('maroua', 'pont_vert', 'Pont Vert'),
    ('maroua', 'zokok', 'Zokok'),
    ('maroua', 'dougouggui', 'Dougouggui'),

    ('ngaoundere', 'dang', 'Dang'),
    ('ngaoundere', 'baladji_i', 'Baladji I'),
    ('ngaoundere', 'baladji_ii', 'Baladji II'),
    ('ngaoundere', 'mbideng', 'Mbideng'),
    ('ngaoundere', 'bamyanga', 'Bamyanga'),
    ('ngaoundere', 'madagascar', 'Madagascar'),
    ('ngaoundere', 'petit_marche', 'Petit Marché'),

    ('ebolowa', 'angale', 'Angalé'),
    ('ebolowa', 'nkoovos', 'Nko''ovos'),
    ('ebolowa', 'mvog_betsi', 'Mvog-Betsi'),
    ('ebolowa', 'efoulan', 'Efoulan'),
    ('ebolowa', 'ebolowa_centre', 'Ebolowa Centre'),

    ('buea', 'molyko', 'Molyko'),
    ('buea', 'bomaka', 'Bomaka'),
    ('buea', 'mile_17', 'Mile 17'),
    ('buea', 'great_soppo', 'Great Soppo'),
    ('buea', 'small_soppo', 'Small Soppo'),
    ('buea', 'buea_town', 'Buea Town'),
    ('buea', 'bokwango', 'Bokwango'),
    ('buea', 'wokaka', 'Wokaka'),

    ('limbe', 'mile_4', 'Mile 4'),
    ('limbe', 'mile_2', 'Mile 2'),
    ('limbe', 'bota', 'Bota'),
    ('limbe', 'down_beach', 'Down Beach'),
    ('limbe', 'mokundange', 'Mokundange'),
    ('limbe', 'batoke', 'Batoke'),
    ('limbe', 'idenau', 'Idenau'),

    ('kribi', 'mboamanga', 'Mboamanga'),
    ('kribi', 'dombe', 'Dombé'),
    ('kribi', 'ngoye', 'Ngoyé'),
    ('kribi', 'talla', 'Talla'),
    ('kribi', 'mpangou', 'Mpangou'),
    ('kribi', 'bongandoue', 'Bongandoué'),

    ('bafang', 'bafang_centre', 'Bafang Centre'),
    ('bafang', 'babong', 'Babong'),
    ('bafang', 'bapa', 'Bapa'),
    ('bafang', 'ndoungue', 'Ndoungue'),
    ('bafang', 'bafang_ville', 'Bafang Ville')
) as v(city_slug, slug, nom)
join public.arrondissements a on a.slug = v.city_slug
on conflict (arrondissement_id, slug) do update
  set nom = excluded.nom;
