import type { Metadata } from 'next';
import Link from 'next/link';

import { Icon } from '@/components/Icons';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { ProviderForm } from '@/components/provider/ProviderForm';
import { getCatalog } from '@/lib/catalog';
import { getGeoTree } from '@/lib/geo';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Devenir aideur — LIFE CONNECT',
  description:
    'Inscrivez votre métier, votre quartier et votre WhatsApp. Votre profil sera vérifié par l’administration.',
};

export default async function DevenirAideurPage() {
  const [catalog, geo] = await Promise.all([getCatalog(), getGeoTree()]);

  return (
    <>
      <Header />
      <main id="contenu" className="container-lc max-w-xl py-8">
        <Link
          href="/prestataire"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink"
        >
          <Icon name="arrowLeft" size={16} />
          Devenir aideur
        </Link>

        <h1 className="mt-4 text-2xl font-bold tracking-tight">
          Devenir aideur LIFE CONNECT
        </h1>
        <p className="mt-2 text-sm text-muted">
          Nom, métier, quartier, WhatsApp et photo. Votre statut sera
          « en attente » jusqu’à la validation de l’administrateur.
        </p>

        <div className="mt-6">
          <ProviderForm catalog={catalog} geo={geo} />
        </div>

        <p className="mt-6 text-center text-xs text-muted">
          Déjà inscrit ?{' '}
          <Link
            href="/dashboard-aideur"
            className="font-semibold text-teal-700 underline underline-offset-2 dark:text-teal-300"
          >
            Ouvrir mon tableau de bord
          </Link>
        </p>
      </main>
      <Footer />
    </>
  );
}
