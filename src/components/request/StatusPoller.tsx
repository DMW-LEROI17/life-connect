'use client';

import { useEffect, useState } from 'react';

import { Icon } from '@/components/Icons';
import { CancelButton } from '@/components/request/CancelButton';
import { Countdown } from '@/components/request/Countdown';
import { ProviderCard } from '@/components/request/ProviderCard';
import { Badge } from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/Button';
import {
  ADMIN_WHATSAPP,
  STATUS_BADGE_CLASSES,
  STATUS_LABELS,
} from '@/lib/constants';
import { formatKm, shortRef } from '@/lib/format';
import type {
  PublicProvider,
  RequestPublic,
  RequestStatus,
} from '@/types/db';

type StatusPayload = {
  statut: RequestStatus;
  provider: PublicProvider | null;
  expire_le: string;
  note_donnee: boolean;
};

export function StatusPoller({
  token,
  initial,
}: {
  token: string;
  initial: RequestPublic;
}) {
  const [data, setData] = useState<RequestPublic>(initial);

  const active =
    data.statut === 'nouvelle' || data.statut === 'en_recherche';

  useEffect(() => {
    if (!active) return;

    let cancelled = false;

    async function tick() {
      if (document.hidden) return;

      try {
        const response = await fetch(`/api/status/${token}`, {
          cache: 'no-store',
        });

        if (!response.ok) return;

        const payload = (await response.json()) as StatusPayload;

        if (cancelled) return;

        setData((previous) => ({
          ...previous,
          statut: payload.statut,
          provider: payload.provider,
          expire_le: payload.expire_le,
          note_donnee: payload.note_donnee,
        }));
      } catch {
        // Réseau instable : le prochain passage réessaiera.
      }
    }

    const interval = setInterval(tick, 5000);
    const onVisibility = () => {
      if (!document.hidden) void tick();
    };

    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelled = true;
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [active, token]);

  const searching = active;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-line bg-surface p-5 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge className={STATUS_BADGE_CLASSES[data.statut]}>
              {searching ? (
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
              ) : null}
              {STATUS_LABELS[data.statut]}
            </Badge>
            {data.is_emergency ? (
              <Badge className="border-urgent-500/40 bg-urgent-500 text-white">
                URGENCE
              </Badge>
            ) : null}
          </div>
          <span className="text-xs font-semibold text-muted">
            Réf. {shortRef(token)}
          </span>
        </div>

        {searching ? (
          <>
            <h1 className="mt-4 text-2xl font-bold">
              Nous contactons les prestataires proches…
            </h1>
            <p className="mt-2 text-sm text-muted">
              Cela prend en général moins de 5 minutes. Vous pouvez garder cette
              page ouverte.
            </p>

            <div className="mt-5 flex items-center gap-3 rounded-xl bg-surface2 p-4">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-urgent-50 text-urgent-600 dark:bg-urgent-500/10">
                <Icon name="clock" size={20} />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Temps restant
                </p>
                <p className="text-xl font-bold">
                  <Countdown expireLe={data.expire_le} />
                </p>
              </div>
            </div>
          </>
        ) : null}

        {data.statut === 'assignee' && data.provider ? (
          <>
            <h1 className="mt-4 text-2xl font-bold">
              Un prestataire a accepté
            </h1>
            <p className="mt-2 text-sm text-muted">
              Appelez-le maintenant pour confirmer votre adresse et le prix.
            </p>
          </>
        ) : null}

        {data.statut === 'expiree' ? (
          <>
            <h1 className="mt-4 text-2xl font-bold">
              Aucun prestataire n’a répondu pour l’instant
            </h1>
            <p className="mt-2 text-sm text-muted">
              Vous pouvez réessayer ou nous écrire sur WhatsApp : nous vous
              aiderons à trouver quelqu’un.
            </p>
          </>
        ) : null}

        {data.statut === 'annulee' ? (
          <>
            <h1 className="mt-4 text-2xl font-bold">Demande annulée</h1>
            <p className="mt-2 text-sm text-muted">
              Vous pouvez refaire une demande à tout moment.
            </p>
          </>
        ) : null}

        {data.statut === 'resolue' ? (
          <>
            <h1 className="mt-4 text-2xl font-bold">Intervention terminée</h1>
            <p className="mt-2 text-sm text-muted">
              Merci d’avoir utilisé LIFE CONNECT – HELP ME.
            </p>
          </>
        ) : null}

        <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-line pt-4 text-sm">
          <div>
            <dt className="text-xs text-muted">Problème</dt>
            <dd className="font-medium">{data.probleme}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Zone</dt>
            <dd className="font-medium">
              {[data.quartier, data.arrondissement_nom, data.region_nom]
                .filter(Boolean)
                .join(' · ')}
            </dd>
          </div>
        </dl>

        {searching ? (
          <div className="mt-4">
            <CancelButton
              token={token}
              onCancelled={() => setData((previous) => ({ ...previous, statut: 'annulee' }))}
            />
          </div>
        ) : null}
      </div>

      {data.statut === 'assignee' && data.provider ? (
        <ProviderCard provider={data.provider} probleme={data.probleme} />
      ) : null}

      {data.statut === 'assignee' && data.provider ? (
        <ButtonLink
          href={`/suivi/${token}/carte`}
          variant="outline"
          className="w-full"
        >
          <Icon name="mapPin" size={18} />
          Suivre le prestataire sur la carte
        </ButtonLink>
      ) : null}

      {data.statut === 'assignee' && data.provider && !data.note_donnee ? (
        <div className="rounded-2xl border border-line bg-surface p-4 text-center">
          <p className="text-sm text-muted">
            L’intervention est terminée ?
          </p>
          <ButtonLink
            href={`/noter/${token}`}
            variant="outline"
            size="sm"
            className="mt-2"
          >
            <Icon name="star" size={16} />
            Noter le prestataire
          </ButtonLink>
        </div>
      ) : null}

      {data.statut === 'resolue' && !data.note_donnee ? (
        <div className="rounded-2xl border border-line bg-surface p-4 text-center">
          <p className="text-sm text-muted">
            Votre avis nous aide à améliorer le service.
          </p>
          <ButtonLink
            href={`/noter/${token}`}
            size="sm"
            className="mt-2"
          >
            <Icon name="star" size={16} />
            Laisser un avis
          </ButtonLink>
        </div>
      ) : null}

      {data.statut === 'expiree' ? (
        <div className="grid gap-2 sm:grid-cols-2">
          <ButtonLink href={`/aide/${data.categorie}`} variant="primary">
            <Icon name="search" size={18} />
            Réessayer
          </ButtonLink>
          <ButtonLink
            href={`https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(
              `Bonjour, ma demande LIFE CONNECT ${shortRef(token)} n’a pas trouvé de prestataire. Pouvez-vous m’aider ?`,
            )}`}
            variant="whatsapp"
            target="_blank"
            rel="noreferrer"
          >
            <Icon name="whatsapp" size={18} />
            Écrire à l’admin
          </ButtonLink>
        </div>
      ) : null}

      {data.provider && data.provider.distance_km != null ? (
        <p className="text-center text-xs text-muted">
          Distance estimée : {formatKm(data.provider.distance_km)}.
        </p>
      ) : null}
    </div>
  );
}
