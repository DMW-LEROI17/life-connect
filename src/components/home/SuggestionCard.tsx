import Image from 'next/image';
import Link from 'next/link';

import { Icon } from '@/components/Icons';
import { formatFcfa } from '@/lib/format';
import type { MarketListingRow } from '@/types/db';
import type { ProviderSearchResult } from '@/lib/search';

export type SuggestionItem =
  | { kind: 'market'; listing: MarketListingRow }
  | { kind: 'provider'; provider: ProviderSearchResult };

export function SuggestionCard({ item }: { item: SuggestionItem }) {
  if (item.kind === 'market') {
    const listing = item.listing;

    return (
      <Link
        href={`/market/${listing.id}`}
        className="flex min-w-0 items-stretch gap-3 rounded-2xl border border-line bg-surface p-2.5 shadow-soft transition-colors hover:border-teal-500/40"
      >
        <div className="relative grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-xl bg-surface2">
          {listing.image_url ? (
            <Image
              src={listing.image_url}
              alt=""
              width={96}
              height={96}
              className="h-24 w-24 object-cover"
            />
          ) : (
            <Icon name="cart" size={28} className="text-muted" />
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-center">
          <div className="flex items-center gap-1.5">
            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-amber-700">
              {listing.condition === 'service' ? 'Service' : 'Vente'}
            </span>
            <span className="text-[10px] text-muted">
              {listing.categories?.nom_fr ?? 'Market'}
            </span>
          </div>
          <p className="mt-1 line-clamp-2 text-sm font-bold leading-snug">
            {listing.title}
          </p>
          <p className="mt-0.5 text-sm font-black text-teal-600 dark:text-teal-300">
            {listing.price_fcfa != null
              ? formatFcfa(listing.price_fcfa)
              : 'Prix à discuter'}
          </p>
          <p className="mt-1 flex items-center gap-1 text-[10px] text-muted">
            <Icon name="mapPin" size={12} />
            {listing.city ?? 'Cameroun'}
            {listing.quartier ? ` · ${listing.quartier}` : ''}
          </p>
        </div>
      </Link>
    );
  }

  const provider = item.provider;

  return (
    <Link
      href={`/prestataires/${provider.id}`}
      className="flex min-w-0 items-stretch gap-3 rounded-2xl border border-line bg-surface p-2.5 shadow-soft transition-colors hover:border-teal-500/40"
    >
      <div className="relative grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-teal-50 to-blue-50 dark:from-teal-500/10 dark:to-blue-500/10">
        {provider.photo_url ? (
          <Image
            src={provider.photo_url}
            alt=""
            width={96}
            height={96}
            className="h-24 w-24 object-cover"
          />
        ) : (
          <span className="text-2xl font-black text-teal-700 dark:text-teal-300">
            {provider.nom
              .split(/\s+/)
              .slice(0, 2)
              .map((part) => part[0]?.toUpperCase())
              .join('')}
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <div className="flex items-center gap-1.5">
          <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-teal-700 dark:bg-teal-500/10 dark:text-teal-300">
            Vérifié
          </span>
          <span className="text-[10px] text-muted">{provider.metier_nom}</span>
        </div>
        <p className="mt-1 line-clamp-2 text-sm font-bold leading-snug">
          {provider.nom}
        </p>
        <p className="mt-0.5 text-xs text-muted">
          {provider.specialite ?? provider.metier_nom ?? 'Professionnel'}
        </p>
        <p className="mt-1 flex items-center gap-1 text-[10px] text-muted">
          <Icon name="mapPin" size={12} />
          {provider.quartier} · ★ {provider.note_moyenne.toFixed(1)}
        </p>
      </div>
    </Link>
  );
}
