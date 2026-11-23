import type { Metadata } from 'next';
import Link from 'next/link';

import { Icon } from '@/components/Icons';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { getRegions } from '@/lib/geo';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Les 10 régions du Cameroun',
  description:
    'Adamaoua, Centre, Est, Extrême-Nord, Littoral, Nord, Nord-Ouest, Ouest, Sud, Sud-Ouest : trouvez un prestataire dans votre région.',
};

export default async function RegionsPage() {
  const regions = await getRegions();

  return (
    <>
      <Header />
      <main id="contenu" className="container-lc max-w-4xl py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink"
        >
          <Icon name="arrowLeft" size={16} />
          Accueil
        </Link>

        <h1 className="mt-4 text-3xl font-bold tracking-tight">
          Les 10 régions du Cameroun
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Choisissez votre région pour voir les départements, les villes et les
          services disponibles. Si votre village n’est pas listé, le champ libre
          du formulaire permet de le saisir.
        </p>

        {regions.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-line bg-surface p-6 text-sm text-muted">
            Les régions ne sont pas encore chargées. Exécutez les scripts SQL V2.
          </div>
        ) : (
          <div className="mt-6 grid gap-2 sm:grid-cols-2">
            {regions.map((region) => (
              <Link
                key={region.id}
                href={`/regions/${region.slug}`}
                className="group flex items-center justify-between gap-3 rounded-2xl border border-line bg-surface p-4 shadow-soft transition-colors hover:border-teal-500/40"
              >
                <div>
                  <p className="font-semibold">{region.nom}</p>
                  <p className="mt-0.5 text-xs text-muted">
                    Chef-lieu : {region.chef_lieu || 'à vérifier'}
                  </p>
                </div>
                <Icon
                  name="chevronRight"
                  size={18}
                  className="text-muted transition-transform group-hover:translate-x-0.5"
                />
              </Link>
            ))}
          </div>
        )}

        <div className="mt-8 rounded-2xl bg-urgent-600 p-5 text-white">
          <p className="font-bold">Urgence dans votre région ?</p>
          <p className="mt-1 text-sm text-white/85">
            Appelez le 117 (police), le 118 (pompiers) ou le 119 (SAMU).
          </p>
          <Link
            href="/urgence"
            className="mt-3 inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-white px-4 text-xs font-bold text-urgent-600"
          >
            <Icon name="alert" size={16} />
            Écran urgence
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
