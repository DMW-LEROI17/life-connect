import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'LIFE CONNECT – HELP ME',
    short_name: 'LIFE CONNECT',
    description:
      'Trouvez un professionnel vérifié dans les 10 régions du Cameroun : santé, maison, auto, numérique, famille, transport.',
    start_url: '/',
    display: 'standalone',
    background_color: '#F6F8FB',
    theme_color: '#0A1A2F',
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
