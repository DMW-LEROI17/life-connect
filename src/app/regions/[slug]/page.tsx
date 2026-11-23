import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Icon } from '@/components/Icons';
import { EmergencyNumbers } from '@/components/emergency/EmergencyNumbers';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { ButtonLink } from '@/components/ui/Button';
import { getEmergencyFacilities } from '@/lib/emergency';
import { getGeoTree } from '@/lib/geo';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const geo = await getGeoTree();
  const region = geo.find((item) => item.slug === params.slug);

  return {
    title: region
      ? `Services et urgences — ${region.nom}`
      : 'Région du Cameroun',
    description: region
      ? `Trouvez un mécanicien, un plombier, un technicien, un soignant ou un transport à ${region.nom}, Cameroun.`
      : undefined,
  };
}

export default async function RegionPage({
  params,
}: {
  params: { slug: string };
}) {
  const geo = await getGeoTree();
  const region = geo.find((item) => item.slug === params.slug);

  if (!region) {
    notFound();
  }

  const facilities = await getEmergencyFacilities(region.id);
  const cities = region.departements.flatMap((departement) =>
    departement.arrondissements.map((arrondissement) => ({
      ...arrondissement,
      departement: departement.nom,
    })),
  );

  return (
    <>
      <Header />
      <main id="contenu" className="container-lc max-w-3xl py-8">
        <Link
          href="/regions"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink"
        >
          <Icon name="arrowLeft" size={16} />
          Toutes les régions
        </Link>

        <h1 className="mt-4 text-3xl font-bold tracking-tight">
          LIFE CONNECT — {region.nom}
        </h1>
        <p className="mt-2 text-sm text-muted">
          {region.departements.length} département
          {region.departements.length > 1 ? 's' : ''} · {cities.length} ville
          {cities.length > 1 ? 's' : ''} de départ. Les quartiers et villages
          peuvent être saisis librement dans le formulaire.
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          <ButtonLink href="/aide">
            <Icon name="search" size={18} />
            Trouver un service
          </ButtonLink>
          <ButtonLink href={`/urgence?region=${region.id}`} variant="outline">
            <Icon name="alert" size={18} />
            Urgences dans la région
          </ButtonLink>
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-bold">Départements et villes</h2>
          <div className="mt-3 space-y-2">
            {region.departements.map((departement) => (
              <details
                key={departement.id}
                className="rounded-xl border border-line bg-surface p-4"
              >
                <summary className="cursor-pointer text-sm font-semibold">
                  {departement.nom}
                  <span className="ml-2 text-xs font-normal text-muted">
                    {departement.arrondissements.length} ville
                    {departement.arrondissements.length > 1 ? 's' : ''}
                  </span>
                </summary>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {departement.arrondissements.length === 0 ? (
                    <span className="text-xs text-muted">
                      Villes à compléter.
                    </span>
                  ) : (
                    departement.arrondissements.map((arrondissement) => (
                      <span
                        key={arrondissement.id}
                        className="rounded-full bg-surface2 px-2.5 py-1 text-xs text-muted"
                      >
                        {arrondissement.nom}
                      </span>
                    ))
                  )}
                </div>
              </details>
            ))}
          </div>
        </div>

        <div className="mt-8 rounded-2xl bg-urgent-600 p-5 text-white">
          <h2 className="text-lg font-bold">Urgences — {region.nom}</h2>
          <p className="mt-1 text-sm text-white/85">
            {facilities.length > 0
              ? `${facilities.length} établissement(s) référencé(s). Numéros à vérifier avant usage.`
              : 'Aucun établissement référencé pour l’instant. Appelez le 119.'}
          </p>
          <div className="mt-3">
            <EmergencyNumbers compact />
          </div>
          <Link
            href={`/urgence?region=${region.id}`}
            className="mt-3 inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-white px-4 text-xs font-bold text-urgent-600"
          >
            Voir les fiches et établissements
          </Link>
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-bold">Villes de départ</h2>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {cities.map((city) => (
              <span
                key={city.id}
                className="rounded-full border border-line bg-surface px-3 py-1.5 text-xs text-muted"
              >
                {city.nom}
                <span className="ml-1 text-[10px] opacity-70">
                  ({city.departement})
                </span>
              </span>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
