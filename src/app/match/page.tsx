import type { Metadata } from 'next';
import Link from 'next/link';

import { PostCard } from '@/components/connect/PostCard';
import { GeoFilter } from '@/components/geo/GeoFilter';
import { Icon } from '@/components/Icons';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { Badge } from '@/components/ui/Badge';
import { extractNeed } from '@/lib/ai';
import { getCatalog } from '@/lib/catalog';
import { getGeoTree } from '@/lib/geo';
import { listPosts } from '@/lib/posts';
import { searchProviders } from '@/lib/search';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'LIFE AI — Trouver une solution',
  description:
    'Décrivez votre besoin ou filtrez par catégorie, région et commune. LIFE CONNECT interroge les professionnels réellement enregistrés.',
};

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function numberOrNull(value: string | undefined): number | null {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

const EXAMPLES = [
  'Je cherche un mécanicien disponible à Douala pour réparer ma voiture.',
  'Besoin d’une infirmière à domicile à Yaoundé pour ma mère.',
  'Je cherche un plombier à Bafoussam pour une fuite d’eau.',
  'Besoin d’un moto-taxi pour transporter un enfant malade à Akwa.',
];

export default async function MatchPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const q = first(searchParams.q)?.trim() ?? '';
  const categorie = first(searchParams.categorie)?.trim() ?? '';
  const city = first(searchParams.ville)?.trim() ?? '';
  const regionId = numberOrNull(first(searchParams.region));
  const departementId = numberOrNull(first(searchParams.departement));
  const arrondissementId = numberOrNull(first(searchParams.arrondissement));

  const [catalog, geo] = await Promise.all([getCatalog(), getGeoTree()]);
  const selectedCategory = catalog.find((item) => item.slug === categorie) ?? null;
  const need = q ? await extractNeed(q, catalog, geo) : null;

  const hasFilters = Boolean(
    q || categorie || city || regionId || departementId || arrondissementId,
  );

  const categorySlugs = selectedCategory
    ? [selectedCategory.slug]
    : need?.categorySlugs ?? [];
  const effectiveRegionId = regionId ?? need?.regionId ?? null;
  const keywords = q ? need?.keywords ?? q.split(/\s+/).filter(Boolean) : [];

  const providers = hasFilters
    ? await searchProviders({
        categorySlugs,
        regionId: effectiveRegionId,
        departementId,
        arrondissementId,
        city,
        keywords,
        limit: 30,
      })
    : [];

  const allPosts = hasFilters ? await listPosts({}) : [];
  const categoryNames = new Set(
    catalog
      .filter((category) => categorySlugs.includes(category.slug))
      .map((category) => category.nom_fr),
  );

  const posts = allPosts.filter((post) => {
    if (categoryNames.size > 0 && post.categories?.nom_fr) {
      if (!categoryNames.has(post.categories.nom_fr)) return false;
    }

    if (effectiveRegionId && post.region_id && post.region_id !== effectiveRegionId) {
      return false;
    }

    if (city) {
      const haystack = `${post.city ?? ''} ${post.quartier ?? ''}`.toLowerCase();
      if (!haystack.includes(city.toLowerCase())) return false;
    }

    return true;
  });

  const regionName = geo.find((region) => region.id === effectiveRegionId)?.nom;

  return (
    <>
      <Header />
      <main id="contenu" className="container-lc max-w-4xl py-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-teal-600 dark:text-teal-300">
          LIFE AI
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">
          Décrivez votre besoin. Filtrez la zone.
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Recherche en langage naturel + filtres connectés à Supabase. Aucun
          prestataire inventé.
        </p>

        <form
          action="/match"
          method="get"
          className="mt-5 space-y-3 rounded-2xl border border-line bg-surface p-3 shadow-soft"
        >
          <div className="grid gap-2 sm:grid-cols-[1fr_180px_auto]">
            <input
              name="q"
              defaultValue={q}
              placeholder="Ex. : mécanicien à Douala"
              className="input-lc"
              aria-label="Décrivez votre besoin"
            />
            <select
              name="categorie"
              defaultValue={categorie}
              className="select-lc"
              aria-label="Catégorie"
            >
              <option value="">Toutes les catégories</option>
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
              placeholder="Ville ou quartier (ex. Douala, Akwa)"
              className="input-lc h-10 text-sm"
              aria-label="Ville ou quartier"
            />
            <button
              type="submit"
              className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-line px-4 text-xs font-semibold"
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

        {!hasFilters ? (
          <div className="mt-5 rounded-2xl border border-line bg-surface p-5">
            <p className="text-sm font-semibold">Exemples</p>
            <div className="mt-2 flex flex-col gap-1.5">
              {EXAMPLES.map((example) => (
                <Link
                  key={example}
                  href={`/match?q=${encodeURIComponent(example)}`}
                  className="rounded-xl border border-line px-3 py-2 text-sm text-muted hover:bg-surface2 hover:text-ink"
                >
                  {example}
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="mt-5 flex flex-wrap items-center gap-1.5">
              <Badge className="border-teal-500/30 bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300">
                {need?.source === 'ia' ? 'LIFE AI' : 'Recherche connectée'}
              </Badge>
              {selectedCategory ? (
                <span className="rounded-full bg-surface2 px-2.5 py-1 text-xs text-muted">
                  {selectedCategory.nom_fr}
                </span>
              ) : null}
              {regionName ? (
                <span className="rounded-full bg-surface2 px-2.5 py-1 text-xs text-muted">
                  {regionName}
                </span>
              ) : null}
              {city ? (
                <span className="rounded-full bg-surface2 px-2.5 py-1 text-xs text-muted">
                  {city}
                </span>
              ) : null}
            </div>

            <section className="mt-6">
              <h2 className="text-lg font-bold">
                Prestataires correspondants ({providers.length})
              </h2>
              {providers.length === 0 ? (
                <p className="mt-2 rounded-xl border border-dashed border-line p-4 text-sm text-muted">
                  Aucun prestataire trouvé dans cette zone. Essayez une autre
                  catégorie, élargissez la zone ou publiez une demande.
                </p>
              ) : (
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {providers.map((provider) => (
                    <Link
                      key={provider.id}
                      href={`/prestataires/${provider.id}`}
                      className="rounded-xl border border-line bg-surface p-4 hover:border-teal-500/40"
                    >
                      <p className="font-semibold">{provider.nom}</p>
                      <p className="text-xs text-muted">
                        {provider.metier_nom ?? provider.metier} ·{' '}
                        {provider.quartier}
                      </p>
                      <p className="mt-1 text-xs text-muted">
                        {provider.note_moyenne.toFixed(1)}/5 ·{' '}
                        {provider.nombre_avis} avis ·{' '}
                        {provider.disponible ? 'disponible' : 'indisponible'}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            <section className="mt-6">
              <h2 className="text-lg font-bold">
                Demandes et offres ({posts.length})
              </h2>
              {posts.length === 0 ? (
                <p className="mt-2 rounded-xl border border-dashed border-line p-4 text-sm text-muted">
                  Aucune publication ne correspond. Publiez votre besoin pour
                  recevoir des propositions.
                </p>
              ) : (
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {posts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              )}
            </section>

            <div className="mt-8 rounded-2xl bg-urgent-600 p-5 text-white">
              <p className="font-bold">Urgence vitale ?</p>
              <p className="mt-1 text-sm text-white/85">
                N’attendez pas une réponse : appelez le 117, 118 ou 119.
              </p>
              <Link
                href="/urgence"
                className="mt-3 inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-white px-4 text-xs font-bold text-urgent-600"
              >
                Écran urgence
              </Link>
            </div>
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
