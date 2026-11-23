import type { Metadata } from 'next';
import Link from 'next/link';

import { Icon } from '@/components/Icons';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { Badge } from '@/components/ui/Badge';
import { listExchange, listGroups } from '@/lib/community';
import { formatDate } from '@/lib/format';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'LIFE COMMUNITY & EXCHANGE',
  description:
    'Rejoignez des groupes locaux et échangez des compétences et services au Cameroun.',
};

export default async function CommunityPage({
  searchParams,
}: {
  searchParams: { q?: string; city?: string };
}) {
  const [groups, exchanges] = await Promise.all([
    listGroups({ q: searchParams.q, city: searchParams.city }),
    listExchange({}),
  ]);

  return (
    <>
      <Header />
      <main id="contenu" className="container-lc py-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-teal-600 dark:text-teal-300">
          LIFE COMMUNITY
        </p>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="mt-1 text-3xl font-bold tracking-tight">
              Groupes et communautés
            </h1>
            <p className="mt-1 max-w-xl text-sm text-muted">
              Créez un groupe de quartier, de métier ou d’entraide. Échangez vos
              compétences dans LIFE EXCHANGE.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/community/nouveau"
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-teal-500 px-4 text-sm font-semibold text-white"
            >
              <Icon name="send" size={18} />
              Créer un groupe
            </Link>
            <Link
              href="/exchange"
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-line bg-surface px-4 text-sm font-semibold"
            >
              LIFE EXCHANGE
            </Link>
          </div>
        </div>

        <form
          action="/community"
          method="get"
          className="mt-5 grid gap-2 rounded-2xl border border-line bg-surface p-3 shadow-soft sm:grid-cols-[1fr_180px_auto]"
        >
          <input
            name="q"
            defaultValue={searchParams.q ?? ''}
            placeholder="Nom du groupe, thème…"
            className="input-lc"
            aria-label="Rechercher un groupe"
          />
          <input
            name="city"
            defaultValue={searchParams.city ?? ''}
            placeholder="Ville"
            className="input-lc"
            aria-label="Ville"
          />
          <button
            type="submit"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-navy-900 px-5 text-sm font-semibold text-white"
          >
            <Icon name="search" size={18} />
            Chercher
          </button>
        </form>

        <section className="mt-6">
          <h2 className="text-lg font-bold">Groupes ({groups.length})</h2>
          {groups.length === 0 ? (
            <p className="mt-2 rounded-xl border border-dashed border-line p-4 text-sm text-muted">
              Aucun groupe encore. Créez le premier groupe de votre quartier.
            </p>
          ) : (
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {groups.map((group) => (
                <Link
                  key={group.id}
                  href={`/community/${group.slug}`}
                  className="rounded-2xl border border-line bg-surface p-4 shadow-soft transition-colors hover:border-teal-500/40"
                >
                  <div className="flex items-center justify-between gap-2">
                    <Badge className="border-line bg-surface2 text-muted">
                      {group.visibility === 'publique' ? 'Public' : 'Privé'}
                    </Badge>
                    <span className="text-[10px] text-muted">
                      {group.city ?? ''}
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-bold">{group.name}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-muted">
                    {group.description || 'Pas encore de description.'}
                  </p>
                  <p className="mt-2 text-[10px] text-muted">
                    Par {group.owner_name} · {formatDate(group.created_at)}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="mt-8">
          <div className="flex items-end justify-between gap-2">
            <h2 className="text-lg font-bold">Échanges récents</h2>
            <Link href="/exchange" className="text-sm font-semibold text-teal-700 dark:text-teal-300">
              Tout voir
            </Link>
          </div>
          {exchanges.length === 0 ? (
            <p className="mt-2 rounded-xl border border-dashed border-line p-4 text-sm text-muted">
              Aucun échange publié. Proposez une compétence dans LIFE EXCHANGE.
            </p>
          ) : (
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {exchanges.slice(0, 4).map((exchange) => (
                <div key={exchange.id} className="rounded-2xl border border-line bg-surface p-4">
                  <Badge className="border-teal-500/30 bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300">
                    {exchange.kind === 'offre' ? 'J’offre' : 'Je recherche'}
                  </Badge>
                  <p className="mt-2 text-sm font-bold">{exchange.title}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-muted">
                    {exchange.description}
                  </p>
                  <p className="mt-1 text-[10px] text-muted">
                    {exchange.user_name} · {exchange.city ?? '—'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
