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
  title: 'Inscription prestataire — Cameroun',
  description:
    'Créez votre profil de mécanicien, plombier, technicien, soignant, taxi ou autre professionnel dans les 10 régions du Cameroun.',
};

export default async function InscriptionPage() {
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
          Devenir prestataire
        </Link>

        <h1 className="mt-4 text-2xl font-bold tracking-tight">
          Créer mon profil prestataire
        </h1>
        <p className="mt-2 text-sm text-muted">
          Choisissez tous vos services et toutes vos zones d’intervention.
          L’administrateur vérifie chaque profil avant de le rendre visible.
        </p>

        <div className="mt-6">
          <ProviderForm catalog={catalog} geo={geo} />
        </div>
      </main>

      <Footer />
    </>
  );
}
