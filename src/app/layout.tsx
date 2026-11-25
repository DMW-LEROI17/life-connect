import type { Metadata, Viewport } from 'next';

import { ThemeScript } from '@/components/layout/ThemeScript';
import { BottomNav } from '@/components/layout/BottomNav';

import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  ),
  title: {
    default: 'LIFE CONNECT — Un besoin. Une connexion. Une solution.',
    template: '%s | LIFE CONNECT',
  },
  description:
    'Emploi, logement, services, produits, partenariats, communauté : LIFE CONNECT rassemble les solutions au même endroit. Cameroun et international.',
  applicationName: 'LIFE CONNECT',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'LIFE CONNECT — Everything. Everyone. Everywhere.',
    description:
      'Un besoin. Une connexion. Une solution. La plateforme qui rassemble emploi, logement, services, market, opportunités et communauté.',
    type: 'website',
    locale: 'fr_FR',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F3F6FC' },
    { media: '(prefers-color-scheme: dark)', color: '#0B1330' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-dvh bg-bg pb-16 font-sans text-ink antialiased md:pb-0">
        <a
          href="#contenu"
          className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-navy-900 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
        >
          Aller au contenu
        </a>
        {children}
        <BottomNav />
      </body>
    </html>
  );
}
