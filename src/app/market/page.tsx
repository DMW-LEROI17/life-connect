import type { Metadata } from 'next';
import Link from 'next/link';

import { Icon } from '@/components/Icons';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { Badge } from '@/components/ui/Badge';
import { formatDate, formatFcfa } from '@/lib/format';
import { listMarketListings } from '@/lib/market';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'LIFE MARKET — Annonces produits',
  description:
    'Achetez, vendez et louez des produits au Cameroun. Annonces publiées par de vrais membres LIFE CONNECT.',
};

export default async function MarketPage({
  searchParams,
}: {
  searchParams: { q?: string; city?: string; condition?: string };
}) {
  const listings = await listMarketListings({
    q: searchParams.q,
    city: searchParams.city,
    condition: searchParams.condition,
  });

  return (
    <>
      <Header />
      <main id="contenu" className="container-lc py-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-teal-600 dark:text-teal-300">
              LIFE MARKET
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight">
              Acheter, vendre, louer
            </h1>
            <p className="mt-1 max-w-xl text-sm text-muted">
              Des annonces réelles, publiées par les membres. Aucun produit
              inventé, aucun faux prix.
            </p>
          </div>
          <Link
            href="/market/nouveau"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-teal-500 px-4 text-sm font-semibold text-white"
          >
            <Icon name="send" size={18} />
            Publier une annonce
          </Link>
        </div>

        <form
          action="/market"
          method="get"
          className="mt-5 grid gap-2 rounded-2xl border border-line bg-surface p-3 shadow-soft sm:grid-cols-[1fr_180px_160px_auto]"
        >
          <input
            name="q"
            defaultValue={searchParams.q ?? ''}
            placeholder="Que cherchez-vous ?"
            className="input-lc"
            aria-label="Rechercher une annonce"
          />
          <input
            name="city"
            defaultValue={searchParams.city ?? ''}
            placeholder="Ville"
            className="input-lc"
            aria-label="Ville"
          />
          <select
            name="condition"
            defaultValue={searchParams.condition ?? ''}
            className="select-lc"
            aria-label="État"
          >
            <option value="">Tous les états</option>
            <option value="neuf">Neuf</option>
            <option value="occasion">Occasion</option>
            <option value="service">Service</option>
          </select>
          <button
            type="submit"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-navy-900 px-5 text-sm font-semibold text-white"
          >
            <Icon name="search" size={18} />
            Filtrer
          </button>
        </form>

        {listings.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-line bg-surface p-10 text-center">
            <p className="font-semibold">Aucune annonce pour le moment</p>
            <p className="mt-1 text-sm text-muted">
              Soyez le premier à publier un produit ou un service.
            </p>
            <Link
              href="/market/nouveau"
              className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-teal-500 px-4 text-sm font-semibold text-white"
            >
              Publier la première annonce
            </Link>
          </div>
        ) : (
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <Link
                key={listing.id}
                href={`/market/${listing.id}`}
                className="overflow-hidden rounded-2xl border border-line bg-surface shadow-soft transition-colors hover:border-teal-500/40"
              >
                <div className="grid h-40 place-items-center bg-surface2">
                  {listing.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={listing.image_url}
                      alt=""
                      className="h-40 w-full object-cover"
                    />
                  ) : (
                    <Icon name="spark" size={40} className="text-muted" />
                  )}
                </div>
                <div className="p-3">
                  <div className="flex items-center justify-between gap-2">
                    <Badge className="border-line bg-surface2 text-muted">
                      {listing.condition === 'neuf'
                        ? 'Neuf'
                        : listing.condition === 'service'
                          ? 'Service'
                          : 'Occasion'}
                    </Badge>
                    <span className="text-[10px] text-muted">
                      {formatDate(listing.created_at)}
                    </span>
                  </div>
                  <p className="mt-1.5 line-clamp-2 text-sm font-bold">
                    {listing.title}
                  </p>
                  <p className="mt-0.5 text-lg font-black text-teal-600 dark:text-teal-300">
                    {listing.price_fcfa != null
                      ? formatFcfa(listing.price_fcfa)
                      : 'Prix à discuter'}
                  </p>
                  <p className="mt-0.5 truncate text-[11px] text-muted">
                    {listing.city ?? 'Ville non précisée'}
                    {listing.quartier ? ` · ${listing.quartier}` : ''}
                  </p>
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
