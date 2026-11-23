import type { Metadata } from 'next';
import Link from 'next/link';

import { PostCard } from '@/components/connect/PostCard';
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
  title: 'Trouver une solution — LIFE AI',
  description:
    'Décrivez votre besoin en français simple. LIFE CONNECT identifie la catégorie, la zone et les professionnels réellement enregistrés.',
};

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
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

  const [catalog, geo] = await Promise.all([getCatalog(), getGeoTree()]);
  const need = q ? await extractNeed(q, catalog, geo) : null;

  const allPosts = q ? await listPosts({}) : [];
  const categoryNames = new Set(
    catalog
      .filter((category) => need?.categorySlugs.includes(category.slug))
      .map((category) => category.nom_fr),
  );

  const posts = allPosts.filter((post) => {
    if (categoryNames.size > 0 && post.categories?.nom_fr) {
      if (!categoryNames.has(post.categories.nom_fr)) return false;
    }

    if (need?.regionId && post.region_id && post.region_id !== need.regionId) {
      return false;
    }

    if (need && need.keywords.length > 0) {
      const haystack = `${post.title} ${post.description} ${post.city ?? ''} ${
        post.quartier ?? ''
      }`.toLowerCase();

      if (!need.keywords.some((keyword) => haystack.includes(keyword))) {
        return false;
      }
    }

    return true;
  });

  const providers = need ? await searchProviders(need) : [];
  const regionName = geo.find((region) => region.id === need?.regionId)?.nom;

  return (
    <>
      <Header />
      <main id="contenu" className="container-lc max-w-4xl py-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-teal-600 dark:text-teal-300">
          LIFE AI
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">
          LIFE AI — Décrivez votre besoin.
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Écrivez comme vous parlez. La recherche identifie la catégorie, la zone
          et les professionnels réellement enregistrés. Aucun résultat inventé.
        </p>

        <form
          action="/match"
          method="get"
          className="mt-5 flex flex-col gap-2 rounded-2xl border border-line bg-surface p-3 shadow-soft sm:flex-row"
        >
          <input
            name="q"
            defaultValue={q}
            placeholder="Ex. : je cherche un plombier à Akwa pour une fuite"
            className="input-lc flex-1"
            aria-label="Décrivez votre besoin"
          />
          <button
            type="submit"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-teal-500 px-5 text-sm font-semibold text-white hover:bg-teal-500/90"
          >
            <Icon name="search" size={18} />
            Chercher
          </button>
        </form>

        {!q ? (
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
              <Badge className="border-violet-500/30 bg-teal-500/10 text-teal-600 dark:text-teal-300">
                {need?.source === 'ia' ? 'LIFE AI' : 'Recherche intelligente'}
              </Badge>
              {need?.categorySlugs.map((slug) => {
                const category = catalog.find((item) => item.slug === slug);
                return category ? (
                  <span
                    key={slug}
                    className="rounded-full bg-surface2 px-2.5 py-1 text-xs text-muted"
                  >
                    {category.nom_fr}
                  </span>
                ) : null;
              })}
              {regionName ? (
                <span className="rounded-full bg-surface2 px-2.5 py-1 text-xs text-muted">
                  {regionName}
                </span>
              ) : null}
              {need?.keywords.slice(0, 4).map((keyword) => (
                <span
                  key={keyword}
                  className="rounded-full bg-surface2 px-2.5 py-1 text-xs text-muted"
                >
                  {keyword}
                </span>
              ))}
            </div>

            <section className="mt-6">
              <h2 className="text-lg font-bold">
                Prestataires correspondants ({providers.length})
              </h2>
              {providers.length === 0 ? (
                <p className="mt-2 rounded-xl border border-dashed border-line p-4 text-sm text-muted">
                  Aucun prestataire vérifié ne correspond encore. Essayez une
                  autre catégorie ou publiez une demande.
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
