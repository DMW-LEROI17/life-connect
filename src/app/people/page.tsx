import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { GeoFilter } from '@/components/geo/GeoFilter';
import { Icon } from '@/components/Icons';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { Badge } from '@/components/ui/Badge';
import { getCatalog } from '@/lib/catalog';
import { getGeoTree } from '@/lib/geo';
import { searchProviders } from '@/lib/search';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'LIFE PEOPLE & SERVICES — Annuaire des prestataires',
  description:
    'Annuaire connecté des professionnels vérifiés : filtrez par métier, région et commune.',
};

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function numberOrNull(value: string | undefined): number | null {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export default async function PeoplePage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const q = first(searchParams.q)?.trim() ?? '';
  const metier = first(searchParams.metier)?.trim() ?? '';
  const city = first(searchParams.ville)?.trim() ?? '';
  const regionId = numberOrNull(first(searchParams.region));
  const departementId = numberOrNull(first(searchParams.departement));
  const arrondissementId = numberOrNull(first(searchParams.arrondissement));

  const [catalog, geo] = await Promise.all([getCatalog(), getGeoTree()]);
  const hasFilters = Boolean(
    q || metier || city || regionId || departementId || arrondissementId,
  );

  const providers = hasFilters
    ? await searchProviders({
        categorySlugs: metier ? [metier] : [],
        regionId,
        departementId,
        arrondissementId,
        city,
        keywords: q ? q.split(/\s+/).filter(Boolean) : [],
        limit: 200,
      })
    : await searchProviders({
        categorySlugs: [],
        regionId: null,
        keywords: [],
        limit: 200,
      });

  return (
    <>
      <Header />
      <main id="contenu" className="container-lc py-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-teal-600 dark:text-teal-300">
          LIFE PEOPLE &amp; SERVICES
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">
          Annuaire des prestataires
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Profils validés par l’administration. Filtrez par métier et par zone.
        </p>

        <form
          action="/people"
          method="get"
          className="mt-5 space-y-3 rounded-2xl border border-line bg-surface p-3 shadow-soft"
        >
          <div className="grid gap-2 sm:grid-cols-[1fr_200px_auto]">
            <input
              name="q"
              defaultValue={q}
              placeholder="Nom, compétence, spécialité…"
              className="input-lc"
              aria-label="Rechercher un prestataire"
            />
            <select
              name="metier"
              defaultValue={metier}
              className="select-lc"
              aria-label="Métier"
            >
              <option value="">Tous les métiers</option>
              {catalog.map((item) => (
                <option key={item.id} value={item.slug}>
                  {item.nom_fr}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-teal-500 px-5 text-sm font-semibold text-white"
            >
              <Icon name="search" size={18} />
              Chercher
            </button>
          </div>

          <GeoFilter geo={geo} />

          <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
            <input
              name="ville"
              defaultValue={city}
              placeholder="Ville ou quartier"
              className="input-lc h-10 text-sm"
              aria-label="Ville"
            />
            <button
              type="submit"
              className="inline-flex min-h-10 items-center justify-center rounded-xl border border-line px-4 text-xs font-semibold"
            >
              Appliquer
            </button>
          </div>

          <input type="hidden" name="region" value={regionId ?? ''} />
          <input type="hidden" name="departement" value={departementId ?? ''} />
          <input
            type="hidden"
            name="arrondissement"
            value={arrondissementId ?? ''}
          />
        </form>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold">
            {hasFilters ? 'Résultats' : 'Prestataires à découvrir'} (
            {providers.length})
          </h2>
          {hasFilters ? (
            <Link
              href="/people"
              className="text-xs font-semibold text-muted underline underline-offset-2"
            >
              Réinitialiser les filtres
            </Link>
          ) : null}
        </div>

        {providers.length === 0 ? (
          <div className="mt-3 rounded-2xl border border-dashed border-line bg-surface p-8 text-center">
            <p className="font-semibold">
              Aucun prestataire trouvé dans cette zone
            </p>
            <p className="mt-1 text-sm text-muted">
              Essayez un métier différent, élargissez la zone ou publiez une
              demande.
            </p>
            <Link
              href="/demande"
              className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-teal-500 px-4 text-sm font-semibold text-white"
            >
              Publier une demande
            </Link>
          </div>
        ) : (
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {providers.map((provider) => (
              <Link
                key={provider.id}
                href={`/prestataires/${provider.id}`}
                className="rounded-2xl border border-line bg-surface p-4 shadow-soft transition-colors hover:border-teal-500/40"
              >
                <div className="flex items-center gap-3">
                  {provider.photo_url ? (
                    <Image
                      src={provider.photo_url}
                      alt=""
                      width={44}
                      height={44}
                      className="h-11 w-11 rounded-full object-cover"
                    />
                  ) : (
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-surface2 text-xs font-bold text-teal-700 dark:text-teal-300">
                      {provider.nom
                        .split(/\s+/)
                        .slice(0, 2)
                        .map((part) => part[0]?.toUpperCase())
                        .join('') || 'LC'}
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{provider.nom}</p>
                    <p className="truncate text-[11px] text-muted">
                      {provider.metier_nom ?? provider.metier} · {provider.quartier}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between gap-2">
                  <p className="text-[11px] text-muted">
                    ★ {provider.note_moyenne.toFixed(1)} · {provider.nombre_avis}{' '}
                    avis
                  </p>
                  <Badge
                    className={
                      provider.disponible
                        ? 'border-teal-500/30 bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300'
                        : 'border-line bg-surface2 text-muted'
                    }
                  >
                    {provider.disponible ? 'Disponible' : 'Indisponible'}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
