import type { Metadata } from 'next';
import Link from 'next/link';

import { PostCard } from '@/components/connect/PostCard';
import { Icon } from '@/components/Icons';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { ButtonLink } from '@/components/ui/Button';
import { getCatalog } from '@/lib/catalog';
import { getRegions } from '@/lib/geo';
import { listPosts } from '@/lib/posts';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Demandes et offres — LIFE CONNECT',
  description:
    'Publiez un besoin ou une offre, comparez les propositions et trouvez une solution au Cameroun.',
};

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ConnectPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const kind = first(searchParams.kind);
  const categoryId = Number(first(searchParams.categorie) ?? '') || undefined;
  const regionId = Number(first(searchParams.region) ?? '') || undefined;
  const q = first(searchParams.q)?.trim() ?? '';

  const [catalog, regions, posts] = await Promise.all([
    getCatalog(),
    getRegions(),
    listPosts({ kind, categoryId, regionId, q }),
  ]);

  return (
    <>
      <Header />
      <main id="contenu" className="container-lc max-w-5xl py-8">
        <div className="rounded-3xl gradient-night p-5 text-white shadow-lift sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/60">
                LIFE CONNECT
              </p>
              <h1 className="mt-1 text-3xl font-black tracking-tight">
                Demandes et offres
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-white/70">
                Publiez un besoin, recevez des propositions, ou proposez vos
                services. Les échanges restent sur la plateforme.
              </p>
            </div>

            <Link
              href="/connect/nouveau"
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-4 text-sm font-bold text-teal-700 shadow-soft"
            >
              <Icon name="plus" size={18} />
              Publier
            </Link>
          </div>
        </div>

        <form
          method="get"
          action="/connect"
          className="mt-4 grid gap-2 rounded-2xl border border-line bg-surface p-3 shadow-soft sm:grid-cols-2 lg:grid-cols-5"
        >
          <select
            name="kind"
            defaultValue={kind ?? ''}
            className="select-lc h-10 text-sm"
            aria-label="Type"
          >
            <option value="">Tout</option>
            <option value="besoin">Besoins</option>
            <option value="offre">Offres</option>
          </select>

          <select
            name="categorie"
            defaultValue={categoryId ?? ''}
            className="select-lc h-10 text-sm"
            aria-label="Catégorie"
          >
            <option value="">Toutes catégories</option>
            {catalog.map((category) => (
              <option key={category.id} value={category.id}>
                {category.nom_fr}
              </option>
            ))}
          </select>

          <select
            name="region"
            defaultValue={regionId ?? ''}
            className="select-lc h-10 text-sm"
            aria-label="Région"
          >
            <option value="">Toutes régions</option>
            {regions.map((region) => (
              <option key={region.id} value={region.id}>
                {region.nom}
              </option>
            ))}
          </select>

          <input
            name="q"
            defaultValue={q}
            placeholder="Mot-clé, ville…"
            className="input-lc h-10 text-sm"
            aria-label="Recherche"
          />

          <button
            type="submit"
            className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl bg-navy-900 px-4 text-xs font-semibold text-white dark:bg-white dark:text-navy-900"
          >
            <Icon name="search" size={16} />
            Filtrer
          </button>
        </form>

        {posts.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-line bg-surface p-10 text-center">
            <p className="font-semibold">Aucune publication pour l’instant</p>
            <p className="mt-1 text-sm text-muted">
              Créez la première demande ou proposez votre premier service.
            </p>
            <Link
              href="/connect/nouveau"
              className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-teal-500 px-4 text-sm font-semibold text-white"
            >
              Publier maintenant
            </Link>
          </div>
        ) : (
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}

        <div className="mt-8 rounded-2xl border border-line bg-surface p-5">
          <h2 className="text-sm font-bold">Comment ça marche ?</h2>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-muted">
            <li>Vous publiez un besoin ou une offre, avec votre zone.</li>
            <li>Les membres concernés envoient une proposition.</li>
            <li>Vous comparez et acceptez la proposition qui vous convient.</li>
            <li>La demande passe « en cours », puis vous la clôturez.</li>
          </ol>
        </div>
      </main>
      <Footer />
    </>
  );
}
