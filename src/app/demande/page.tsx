import type { Metadata } from 'next';
import Link from 'next/link';

import { Icon } from '@/components/Icons';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { RequestForm } from '@/components/request/RequestForm';
import { getCatalog } from '@/lib/catalog';
import { getGeoTree } from '@/lib/geo';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Créer une demande — LIFE CONNECT',
  description:
    'Décrivez votre besoin, utilisez votre position GPS et trouvez un prestataire vérifié.',
};

export default async function DemandePage({
  searchParams,
}: {
  searchParams: { categorie?: string };
}) {
  const [catalog, geo] = await Promise.all([getCatalog(), getGeoTree()]);
  const category = catalog.find(
    (item) =>
      item.slug === searchParams.categorie ||
      String(item.id) === searchParams.categorie,
  );

  return (
    <>
      <Header />
      <main id="contenu" className="container-lc max-w-xl py-8">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Link
            href="/aide"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink"
          >
            <Icon name="arrowLeft" size={16} />
            Services
          </Link>
          <Link
            href="/sos"
            className="inline-flex min-h-9 items-center rounded-lg bg-urgent-500 px-3 text-xs font-bold text-white"
          >
            SOS urgence
          </Link>
        </div>

        <h1 className="mt-4 text-2xl font-bold tracking-tight">
          Créer une demande
        </h1>
        <p className="mt-2 text-sm text-muted">
          Le bouton « Utiliser ma position » enregistre la latitude et la
          longitude dans Supabase. La zone reste modifiable.
        </p>

        {!category ? (
          <section className="mt-6">
            <p className="text-sm font-semibold">Choisissez une catégorie</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {catalog.map((item) => (
                <Link
                  key={item.id}
                  href={`/demande?categorie=${encodeURIComponent(item.slug)}`}
                  className="rounded-2xl border border-line bg-surface p-4 text-sm font-semibold shadow-soft hover:border-teal-500/40"
                >
                  {item.nom_fr}
                  <span className="mt-1 block text-[11px] font-normal text-muted">
                    {item.description || 'Service'}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        ) : (
          <>
            <div className="mt-4 rounded-xl border border-teal-500/30 bg-teal-50 p-3 text-sm dark:bg-teal-500/10">
              <span className="font-semibold">{category.nom_fr}</span>
              <Link
                href="/demande"
                className="ml-2 text-[11px] font-semibold underline underline-offset-2"
              >
                changer
              </Link>
            </div>
            <div className="mt-5">
              <RequestForm category={category} geo={geo} />
            </div>
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
