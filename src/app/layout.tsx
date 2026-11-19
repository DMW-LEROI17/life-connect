import type { Metadata, Viewport } from 'next';

import { ThemeScript } from '@/components/layout/ThemeScript';

import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  ),
  title: {
    default: 'LIFE CONNECT – HELP ME | Douala',
    template: '%s | LIFE CONNECT',
  },
  description:
    'Trouvez un mécanicien, un dépanneur ou un technicien vérifié à Douala en moins de 5 minutes. Sans compte, juste votre numéro.',
  applicationName: 'LIFE CONNECT – HELP ME',
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
    title: 'LIFE CONNECT – HELP ME',
    description:
      'Un besoin. Une connexion. Une solution. Assistance locale à Douala.',
    type: 'website',
    locale: 'fr_FR',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F6F8FB' },
    { media: '(prefers-color-scheme: dark)', color: '#07121F' },
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
      <body className="min-h-dvh bg-bg font-sans text-ink antialiased">
        <a
          href="#contenu"
          className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-navy-900 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
        >
          Aller au contenu
        </a>
        {children}
      </body>
    </html>
  );
}
