import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'LIFE CONNECT — Everything. Everyone. Everywhere.',
    short_name: 'LIFE CONNECT',
    description:
      'Emploi, logement, services, produits, opportunités et communauté : trouve une solution à chaque besoin.',
    start_url: '/',
    display: 'standalone',
    background_color: '#F5F5F5',
    theme_color: '#1FA34A',
    lang: 'fr',
    orientation: 'portrait',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
    ],
  };
}
