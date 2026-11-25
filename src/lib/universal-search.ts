export type UniversalModule =
  | 'market'
  | 'radar'
  | 'people'
  | 'community'
  | 'exchange'
  | 'match'
  | 'connect'
  | 'sos'
  | 'aide';

const CITIES: Record<string, string> = {
  douala: 'Douala',
  yaounde: 'Yaoundé',
  bafoussam: 'Bafoussam',
  bamenda: 'Bamenda',
  garoua: 'Garoua',
  maroua: 'Maroua',
  ngaoundere: 'Ngaoundéré',
  bertoua: 'Bertoua',
  ebolowa: 'Ebolowa',
  kribi: 'Kribi',
  limbe: 'Limbé',
  buea: 'Buea',
  kumba: 'Kumba',
  nkongsamba: 'Nkongsamba',
  dschang: 'Dschang',
  foumban: 'Foumban',
  edea: 'Édéa',
};

const RULES: Array<{
  module: UniversalModule;
  words: string[];
  kind?: string;
}> = [
  {
    module: 'sos',
    words: ['urgence', 'urgent', 'accident', 'blesse', 'blessé', 'ambulance', 'danger', 'police', 'pompier'],
  },
  {
    module: 'radar',
    words: ['emploi', 'travail', 'job', 'recrute', 'recrutement', 'stage', 'partenaire', 'partenariat', 'fournisseur', 'opportunite', 'opportunité', 'evenement', 'événement', 'projet', 'financement', 'appel'],
  },
  {
    module: 'community',
    words: ['communaute', 'communauté', 'groupe', 'rejoindre', 'club', 'reseau', 'réseau'],
  },
  {
    module: 'exchange',
    words: ['echange', 'échange', 'troc', 'contre', 'competence', 'compétence'],
  },
  {
    module: 'market',
    words: ['acheter', 'vendre', 'achat', 'vente', 'prix', 'produit', 'telephone', 'téléphone', 'ordinateur', 'voiture', 'meuble', 'appartement', 'logement', 'maison', 'chambre', 'terrain', 'location'],
  },
  {
    module: 'people',
    words: ['developpeur', 'développeur', 'graphiste', 'professeur', 'repetiteur', 'répétiteur', 'infirmier', 'infirmiere', 'infirmière', 'photographe', 'traducteur', 'comptable', 'avocat', 'architecte', 'freelance', 'cv'],
  },
  {
    module: 'match',
    words: ['mecanicien', 'mécanicien', 'plombier', 'electricien', 'électricien', 'reparer', 'réparer', 'depannage', 'dépannage', 'technicien', 'menage', 'ménage', 'coiffeur', 'couturier', 'taxi', 'moto'],
  },
];

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function detectCity(query: string): string | null {
  const text = normalize(query);

  for (const [key, label] of Object.entries(CITIES)) {
    if (text.includes(key)) return label;
  }

  return null;
}

export function resolveUniversalSearch(query: string): {
  module: UniversalModule;
  href: string;
} {
  const q = query.trim();
  if (!q) return { module: 'match', href: '/' };

  const text = normalize(q);
  const city = detectCity(q);
  const rule = RULES.find((item) =>
    item.words.some((word) => text.includes(normalize(word))),
  );

  const params = new URLSearchParams({ q });

  if (city) {
    if (rule?.module === 'market' || rule?.module === 'radar') {
      params.set('city', city);
    } else if (rule?.module === 'people' || rule?.module === 'match') {
      params.set('ville', city);
    }
  }

  switch (rule?.module) {
    case 'sos':
      return { module: 'sos', href: '/sos' };

    case 'radar': {
      if (text.includes('emploi') || text.includes('travail') || text.includes('stage')) {
        params.set('kind', 'emploi');
      }
      return { module: 'radar', href: `/radar?${params.toString()}` };
    }

    case 'community':
      return { module: 'community', href: `/community?${params.toString()}` };

    case 'exchange':
      return { module: 'exchange', href: `/exchange?${params.toString()}` };

    case 'market':
      return { module: 'market', href: `/market?${params.toString()}` };

    case 'people':
      return { module: 'people', href: `/people?${params.toString()}` };

    case 'match':
      return { module: 'match', href: `/match?${params.toString()}` };

    default:
      return { module: 'match', href: `/match?${params.toString()}` };
  }
}
