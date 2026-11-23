import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

import { Icon, safeIcon } from '@/components/Icons';
import { EmergencyBanner } from '@/components/layout/EmergencyBanner';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { RequestForm } from '@/components/request/RequestForm';
import { getCategoryWithSubs } from '@/lib/catalog';
import { getGeoTree } from '@/lib/geo';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: { categorie: string };
}): Promise<Metadata> {
  const category = await getCategoryWithSubs(params.categorie);

  return {
    title: category ? category.nom_fr : 'Demander de l’aide',
    description: category?.description ?? undefined,
  };
}

export default async function CategoriePage({
  params,
}: {
  params: { categorie: string };
}) {
  const [category, geo] = await Promise.all([
    getCategoryWithSubs(params.categorie),
    getGeoTree(),
  ]);

  if (!category) {
    notFound();
  }

  if (category.slug === 'urgences') {
    redirect('/urgence');
  }

  return (
    <>
      <Header />
      <EmergencyBanner />

      <main id="contenu" className="container-lc max-w-xl py-8">
        <Link
          href={`/aide?famille=${category.family_slug}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink"
        >
          <Icon name="arrowLeft" size={16} />
          Changer de catégorie
        </Link>

        <div className="mt-4 flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-300">
            <Icon name={safeIcon(category.icon)} size={24} />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {category.nom_fr}
            </h1>
            <p className="text-sm text-muted">
              {category.description || 'Tout le Cameroun'}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <RequestForm category={category} geo={geo} />
        </div>
      </main>

      <Footer />
    </>
  );
}
