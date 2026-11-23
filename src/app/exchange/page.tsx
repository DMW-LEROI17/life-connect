import type { Metadata } from 'next';
import Link from 'next/link';

import { Icon } from '@/components/Icons';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { Badge } from '@/components/ui/Badge';
import { listExchange } from '@/lib/community';
import { formatDate } from '@/lib/format';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'LIFE EXCHANGE — Échanges de compétences',
  description:
    'Échangez des compétences et des services entre membres LIFE CONNECT.',
};

export default async function ExchangePage({
  searchParams,
}: {
  searchParams: { q?: string; kind?: string };
}) {
  const exchanges = await listExchange({
    q: searchParams.q,
    kind: searchParams.kind,
  });

  return (
    <>
      <Header />
      <main id="contenu" className="container-lc py-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-teal-600 dark:text-teal-300">
          LIFE EXCHANGE
        </p>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="mt-1 text-3xl font-bold tracking-tight">
              Échanger sans argent
            </h1>
            <p className="mt-1 max-w-xl text-sm text-muted">
              Une compétence contre une autre : couture, plomberie, cours,
              réparation, traduction…
            </p>
          </div>
          <Link
            href="/exchange/nouveau"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-teal-500 px-4 text-sm font-semibold text-white"
          >
            <Icon name="send" size={18} />
            Publier un échange
          </Link>
        </div>

        <form
          action="/exchange"
          method="get"
          className="mt-5 grid gap-2 rounded-2xl border border-line bg-surface p-3 shadow-soft sm:grid-cols-[1fr_180px_auto]"
        >
          <input
            name="q"
            defaultValue={searchParams.q ?? ''}
            placeholder="Compétence, service…"
            className="input-lc"
            aria-label="Rechercher un échange"
          />
          <select name="kind" defaultValue={searchParams.kind ?? ''} className="select-lc">
            <option value="">Tous</option>
            <option value="offre">J’offre</option>
            <option value="recherche">Je recherche</option>
          </select>
          <button
            type="submit"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-navy-900 px-5 text-sm font-semibold text-white"
          >
            <Icon name="search" size={18} />
            Chercher
          </button>
        </form>

        {exchanges.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-line bg-surface p-10 text-center">
            <p className="font-semibold">Aucun échange pour le moment</p>
            <p className="mt-1 text-sm text-muted">
              Proposez une compétence, même petite.
            </p>
          </div>
        ) : (
          <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {exchanges.map((exchange) => (
              <div key={exchange.id} className="rounded-2xl border border-line bg-surface p-4 shadow-soft">
                <div className="flex items-center justify-between gap-2">
                  <Badge className="border-teal-500/30 bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300">
                    {exchange.kind === 'offre' ? 'J’offre' : 'Je recherche'}
                  </Badge>
                  <span className="text-[10px] text-muted">
                    {formatDate(exchange.created_at)}
                  </span>
                </div>
                <p className="mt-2 text-sm font-bold">{exchange.title}</p>
                <p className="mt-1 line-clamp-3 text-xs text-muted">
                  {exchange.description}
                </p>
                <p className="mt-2 text-[10px] text-muted">
                  {exchange.user_name} · {exchange.city ?? '—'}
                  {exchange.skill ? ` · ${exchange.skill}` : ''}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
