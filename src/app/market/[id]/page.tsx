import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Icon } from '@/components/Icons';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { MarkSoldButton } from '@/components/market/MarkSoldButton';
import { ContactButton } from '@/components/people/ContactButton';
import { Badge } from '@/components/ui/Badge';
import { getCurrentUser } from '@/lib/auth-user';
import { formatDate, formatFcfa } from '@/lib/format';
import { getMarketListing } from '@/lib/market';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Annonce — LIFE MARKET' };

export default async function MarketListingPage({
  params,
}: {
  params: { id: string };
}) {
  const listing = await getMarketListing(params.id);
  if (!listing) notFound();

  const current = await getCurrentUser();
  const isOwner = current?.user.id === listing.seller_id;

  return (
    <>
      <Header />
      <main id="contenu" className="container-lc max-w-3xl py-8">
        <Link
          href="/market"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink"
        >
          <Icon name="arrowLeft" size={16} />
          LIFE MARKET
        </Link>

        <div className="mt-3 overflow-hidden rounded-2xl border border-line bg-surface shadow-soft">
          {listing.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={listing.image_url}
              alt={listing.title}
              className="max-h-96 w-full object-cover"
            />
          ) : (
            <div className="grid h-48 place-items-center bg-surface2">
              <Icon name="spark" size={48} className="text-muted" />
            </div>
          )}

          <div className="p-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="border-line bg-surface2 text-muted">
                {listing.condition === 'neuf'
                  ? 'Neuf'
                  : listing.condition === 'service'
                    ? 'Service'
                    : 'Occasion'}
              </Badge>
              <span className="text-[11px] text-muted">
                Publié le {formatDate(listing.created_at)}
              </span>
            </div>

            <h1 className="mt-2 text-2xl font-bold tracking-tight">
              {listing.title}
            </h1>
            <p className="mt-1 text-3xl font-black text-teal-600 dark:text-teal-300">
              {listing.price_fcfa != null
                ? formatFcfa(listing.price_fcfa)
                : 'Prix à discuter'}
            </p>
            <p className="mt-1 text-sm text-muted">
              {listing.city ?? 'Ville non précisée'}
              {listing.quartier ? ` · ${listing.quartier}` : ''}
            </p>

            <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-ink">
              {listing.description}
            </p>

            <div className="mt-5 rounded-xl bg-surface2 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                Vendeur
              </p>
              <p className="mt-1 text-sm font-bold">{listing.seller_name}</p>
            </div>

            {isOwner ? (
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <MarkSoldButton listingId={listing.id} />
                <Link
                  href="/market"
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border border-line px-4 text-sm font-semibold"
                >
                  Retour aux annonces
                </Link>
              </div>
            ) : (
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <ContactButton
                  targetUserId={listing.seller_id}
                  title={`Annonce : ${listing.title}`}
                  label="Contacter le vendeur"
                />
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(
                    `Regarde cette annonce sur LIFE CONNECT : ${listing.title}`,
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-line px-4 text-sm font-semibold"
                >
                  <Icon name="whatsapp" size={18} />
                  Partager l’annonce
                </a>
              </div>
            )}

            <p className="mt-4 text-[11px] text-muted">
              Ne payez jamais à l’avance sans avoir vu le produit. Signalez tout
              comportement suspect à l’administration.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
