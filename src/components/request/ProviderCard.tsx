import Image from 'next/image';

import { Icon } from '@/components/Icons';
import { ButtonLink } from '@/components/ui/Button';
import { Stars } from '@/components/ui/Stars';
import { getCategory } from '@/lib/constants';
import { formatKm, formatNote, initials } from '@/lib/format';
import { waLink } from '@/lib/whatsapp';
import type { PublicProvider } from '@/types/db';

export function ProviderCard({
  provider,
  probleme,
}: {
  provider: PublicProvider;
  probleme: string;
}) {
  const distance = formatKm(provider.distance_km);
  const message = `Bonjour ${provider.nom}, je vous contacte via LIFE CONNECT – HELP ME pour ma demande : ${probleme}.`;
  const metier = getCategory(provider.metier)?.label ?? provider.metier;

  return (
    <div className="rounded-2xl border border-teal-500/30 bg-surface p-5 shadow-soft">
      <div className="flex items-center gap-4">
        {provider.photo_url ? (
          <Image
            src={provider.photo_url}
            alt={`Photo de ${provider.nom}`}
            width={64}
            height={64}
            className="h-16 w-16 rounded-full object-cover"
          />
        ) : (
          <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-navy-900 text-lg font-bold text-white">
            {initials(provider.nom)}
          </span>
        )}

        <div className="min-w-0">
          <p className="truncate font-semibold">{provider.nom}</p>
          <p className="text-sm text-muted">
            {provider.specialite || metier}
            {provider.quartier ? ` · ${provider.quartier}` : ''}
          </p>
          <div className="mt-1 flex items-center gap-1.5 text-sm">
            <Stars value={provider.note_moyenne} size={14} />
            <span className="font-semibold">
              {formatNote(provider.note_moyenne)}
            </span>
            <span className="text-muted">({provider.nombre_avis})</span>
          </div>
        </div>
      </div>

      {distance ? (
        <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700 dark:bg-teal-500/10 dark:text-teal-300">
          <Icon name="mapPin" size={14} />À {distance} de vous
        </p>
      ) : null}

      <div className="mt-4 grid grid-cols-2 gap-2">
        <ButtonLink href={`tel:${provider.whatsapp}`} variant="secondary">
          <Icon name="phone" size={18} />
          Appeler
        </ButtonLink>

        <ButtonLink
          href={waLink(provider.whatsapp, message)}
          variant="whatsapp"
          target="_blank"
          rel="noreferrer"
        >
          <Icon name="whatsapp" size={18} />
          WhatsApp
        </ButtonLink>
      </div>
    </div>
  );
}
