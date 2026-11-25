import type { MetadataRoute } from 'next';

const REGION_SLUGS = [
  'adamaoua',
  'centre',
  'est',
  'extreme_nord',
  'littoral',
  'nord',
  'nord_ouest',
  'ouest',
  'sud',
  'sud_ouest',
];

const GUIDE_SLUGS = [
  'enfant_blesse',
  'accident_route',
  'saignement',
  'brulure',
  'accouchement',
  'intoxication_morsure',
  'etouffement',
  'malaise',
  'incendie',
  'agression',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(
    /\/$/,
    '',
  );
  const now = new Date();

  const staticPages = [
    '',
    '/aide',
    '/connect',
    '/explorer',
    '/publier',
    '/demande',
    '/sos',
    '/match',
    '/urgence',
    '/urgence/transport',
    '/market',
    '/people',
    '/community',
    '/exchange',
    '/radar',
    '/regions',
    '/prestataire',
    '/prestataire/inscription',
    '/devenir-aideur',
    '/a-propos',
    '/faq',
    '/contact',
    '/legal/confidentialite',
    '/legal/conditions',
  ];

  return [
    ...staticPages.map((path) => ({
      url: `${base}${path}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: path === '' ? 1 : 0.8,
    })),
    ...REGION_SLUGS.map((slug) => ({
      url: `${base}/regions/${slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
    ...GUIDE_SLUGS.map((slug) => ({
      url: `${base}/urgence/${slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ];
}
