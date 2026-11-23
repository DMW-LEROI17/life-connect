'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { Icon } from '@/components/Icons';
import { Button } from '@/components/ui/Button';
import { formatTime } from '@/lib/format';
import { waLink } from '@/lib/whatsapp';
import type { RequestStatus, RequestTracking } from '@/types/db';

function distanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const STATUS_TEXT: Record<RequestStatus, string> = {
  nouvelle: 'Recherche en cours',
  en_recherche: 'Recherche en cours',
  assignee: 'Prestataire en route',
  resolue: 'Mission terminée',
  annulee: 'Demande annulée',
  expiree: 'Demande expirée',
};

export function TrackingView({
  token,
  initial,
}: {
  token: string;
  initial: RequestTracking;
}) {
  const [data, setData] = useState<RequestTracking>(initial);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (document.hidden) return;

      try {
        const response = await fetch(`/api/tracking/${token}`, {
          cache: 'no-store',
        });
        if (!response.ok) return;
        const payload = (await response.json()) as RequestTracking;
        if (payload.ok) setData(payload);
      } catch {
        // Réseau instable.
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [token]);

  const hasProvider =
    data.provider_latitude != null && data.provider_longitude != null;
  const distance =
    hasProvider &&
    data.client_latitude != null &&
    data.client_longitude != null
      ? distanceKm(
          data.client_latitude,
          data.client_longitude,
          data.provider_latitude as number,
          data.provider_longitude as number,
        )
      : null;

  const eta = distance != null ? Math.max(1, Math.round((distance / 25) * 60)) : null;

  const centerLat =
    data.provider_latitude ?? data.client_latitude ?? 4.0511;
  const centerLng =
    data.provider_longitude ?? data.client_longitude ?? 9.7679;

  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${centerLng - 0.03}%2C${centerLat - 0.03}%2C${centerLng + 0.03}%2C${centerLat + 0.03}&layer=mapnik&marker=${centerLat}%2C${centerLng}`;

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-line bg-surface p-4 shadow-soft">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-teal-600 dark:text-teal-300">
              Suivi GPS
            </p>
            <p className="text-lg font-bold">
              {data.statut ? STATUS_TEXT[data.statut] : 'Suivi'}
            </p>
          </div>
          <span className="rounded-full bg-surface2 px-2.5 py-1 text-[10px] font-semibold text-muted">
            {data.location_updated_at
              ? `Position ${formatTime(data.location_updated_at)}`
              : 'En attente de position'}
          </span>
        </div>

        <p className="mt-1 text-sm text-muted">
          {data.probleme} · {data.quartier}
        </p>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-surface2 p-3">
            <p className="text-[10px] uppercase text-muted">Distance</p>
            <p className="text-lg font-bold">
              {distance != null ? `${distance.toFixed(1).replace('.', ',')} km` : '—'}
            </p>
          </div>
          <div className="rounded-xl bg-surface2 p-3">
            <p className="text-[10px] uppercase text-muted">Arrivée estimée</p>
            <p className="text-lg font-bold">
              {eta != null ? `${eta} min` : '—'}
            </p>
          </div>
        </div>

        {!hasProvider ? (
          <p className="mt-3 rounded-xl border border-dashed border-line p-3 text-xs text-muted">
            Le prestataire n’a pas encore partagé sa position. Demandez-lui
            d’ouvrir son lien de mission.
          </p>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-surface">
        <iframe
          title="Carte du suivi"
          src={mapSrc}
          className="h-72 w-full"
          loading="lazy"
        />
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {data.provider_whatsapp ? (
          <>
            <a
              href={`tel:${data.provider_whatsapp}`}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-teal-500 px-4 text-sm font-semibold text-white"
            >
              <Icon name="phone" size={18} />
              Appeler le prestataire
            </a>
            <a
              href={waLink(
                data.provider_whatsapp,
                `Bonjour, je suis le client LIFE CONNECT pour ${data.probleme}.`,
              )}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-4 text-sm font-bold text-[#04331A]"
            >
              <Icon name="whatsapp" size={18} />
              WhatsApp
            </a>
          </>
        ) : null}
      </div>

      <div className="flex flex-wrap justify-center gap-3 text-xs">
        <Link
          href={`/suivi/${token}`}
          className="font-semibold text-teal-700 underline underline-offset-2 dark:text-teal-300"
        >
          Retour au suivi
        </Link>
        {data.provider_latitude != null && data.provider_longitude != null ? (
          <a
            href={`https://www.google.com/maps?q=${data.provider_latitude},${data.provider_longitude}`}
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-muted underline underline-offset-2"
          >
            Ouvrir dans Google Maps
          </a>
        ) : null}
      </div>
    </div>
  );
}
