import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const base = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(
    /\/$/,
    '',
  );

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/suivi',
          '/noter',
          '/api',
          '/compte',
          '/dashboard-aideur',
          '/connexion',
          '/inscription',
          '/connect/nouveau',
          '/messages',
          '/notifications',
          '/wallet',
          '/parametres',
          '/market/nouveau',
          '/community/nouveau',
          '/exchange/nouveau',
          '/radar/nouveau',
          '/mission',
          '/auth',
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
