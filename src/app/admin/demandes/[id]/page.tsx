import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { AdminHeader } from '@/components/admin/AdminHeader';
import { AssignButton } from '@/components/admin/AssignButton';
import { RequestStatusActions } from '@/components/admin/RequestStatusActions';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { WhatsAppAlert } from '@/components/admin/WhatsAppAlert';
import { Icon } from '@/components/Icons';
import { SetupNotice } from '@/components/SetupNotice';
import { Badge } from '@/components/ui/Badge';
import { Stars } from '@/components/ui/Stars';
import { requireAdmin } from '@/lib/auth';
import { isSupabaseConfigured } from '@/lib/config';
import { labelFromSlug } from '@/lib/constants';
import {
  formatDateTime,
  formatKm,
  formatNote,
  initials,
  shortRef,
} from '@/lib/format';
import { formatCmPhone } from '@/lib/phone';
import { getProvidersForRequest, getRequestDetail } from '@/lib/queries';
import { waLink } from '@/lib/whatsapp';
import type { NearbyProvider } from '@/types/db';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Détail de la demande',
  robots: { index: false, follow: false },
};

const ZONE_LABELS: Record<number, string> = {
  100: 'Même quartier',
  80: 'Même commune',
  60: 'Même département',
  40: 'Même région',
  0: 'Hors zone déclarée',
};

export default async function DemandePage({
  params,
}: {
  params: { id: string };
}) {
  await requireAdmin();

  if (!isSupabaseConfigured()) {
    return (
      <>
        <AdminHeader />
        <SetupNotice />
      </>
    );
  }

  const request = await getRequestDetail(params.id);

  if (!request) {
    notFound();
  }

  const providers = await getProvidersForRequest(request.id);
  const categoryName = request.categorie_nom || labelFromSlug(request.categorie);
  const rating = request.ratings?.[0];
  const assigned = request.providers;
  const requestToken = request.token;
  const requestProbleme = request.probleme;

  const zonePath = [
    request.quartier,
    request.arrondissement_nom,
    request.departement_nom,
    request.region_nom,
  ]
    .filter(Boolean)
    .join(' › ');

  function alertHref(provider: NearbyProvider): string {
    const distance =
      provider.distance_km != null
        ? ` (${formatKm(provider.distance_km)} de vous)`
        : '';

    const message = `Bonjour ${provider.nom}, ici LIFE CONNECT – HELP ME (Cameroun).
Demande ${shortRef(requestToken)} : ${requestProbleme} — ${zonePath}${distance}.
Le client attend sur place. Pouvez-vous intervenir maintenant ?
Répondez OUI pour accepter. Merci.`;

    return waLink(provider.whatsapp, message);
  }

  return (
    <div className="min-h-dvh bg-bg">
      <AdminHeader />

      <main id="contenu" className="container-lc py-6">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink"
        >
          <Icon name="arrowLeft" size={16} />
          Toutes les demandes
        </Link>

        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <div className="rounded-2xl border border-line bg-surface p-5 shadow-soft">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge statut={request.statut} />
                {request.is_emergency ? (
                  <Badge className="border-urgent-500/40 bg-urgent-500 text-white">
                    URGENCE
                  </Badge>
                ) : null}
                {request.est_demo ? (
                  <Badge className="border-violet-500/30 bg-violet-500/10 text-violet-500">
                    DÉMO
                  </Badge>
                ) : null}
                <span className="text-xs font-semibold text-muted">
                  Réf. {shortRef(request.token)}
                </span>
              </div>

              <h1 className="mt-3 text-2xl font-bold tracking-tight">
                {request.probleme}
              </h1>
              <p className="mt-1 text-sm text-muted">
                {categoryName} · {zonePath || 'Zone non renseignée'} ·{' '}
                {formatDateTime(request.cree_le)}
              </p>

              {request.needs_transport ? (
                <p className="mt-2 inline-flex rounded-full bg-urgent-50 px-2.5 py-1 text-xs font-semibold text-urgent-600 dark:bg-urgent-500/10">
                  Transport urgent demandé
                </p>
              ) : null}

              <div className="mt-4 rounded-xl bg-surface2 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Description du client
                </p>
                <p className="mt-1 whitespace-pre-line text-sm">
                  {request.description?.trim() || 'Aucune description fournie.'}
                </p>
              </div>

              <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-muted">Téléphone</dt>
                  <dd className="mt-1 flex flex-wrap gap-2">
                    <a
                      href={`tel:${request.tel_client}`}
                      className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-line px-2.5 text-xs font-semibold"
                    >
                      <Icon name="phone" size={14} />
                      {formatCmPhone(request.tel_client)}
                    </a>
                    <a
                      href={waLink(
                        request.tel_client,
                        `Bonjour, ici LIFE CONNECT – HELP ME. Nous avons reçu votre demande ${shortRef(request.token)}.`,
                      )}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-[#25D366] px-2.5 text-xs font-bold text-[#04331A]"
                    >
                      <Icon name="whatsapp" size={14} />
                      WhatsApp
                    </a>
                  </dd>
                </div>

                <div>
                  <dt className="text-xs text-muted">Position</dt>
                  <dd className="mt-1 text-sm">
                    {request.latitude != null && request.longitude != null ? (
                      <a
                        href={`https://www.google.com/maps?q=${request.latitude},${request.longitude}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 font-medium text-teal-700 underline underline-offset-2 dark:text-teal-300"
                      >
                        <Icon name="mapPin" size={14} />
                        Ouvrir dans Google Maps
                      </a>
                    ) : (
                      <span className="text-muted">
                        Non partagée — zone : {zonePath}
                      </span>
                    )}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs text-muted">Créée le</dt>
                  <dd className="text-sm">{formatDateTime(request.cree_le)}</dd>
                </div>

                <div>
                  <dt className="text-xs text-muted">Assignée le</dt>
                  <dd className="text-sm">
                    {request.assigne_le
                      ? formatDateTime(request.assigne_le)
                      : '—'}
                  </dd>
                </div>
              </dl>

              <div className="mt-5 border-t border-line pt-4">
                <RequestStatusActions
                  requestId={request.id}
                  statut={request.statut}
                />
              </div>
            </div>

            {rating ? (
              <div className="rounded-2xl border border-line bg-surface p-5">
                <h2 className="text-sm font-bold">Avis du client</h2>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Stars value={rating.etoiles} size={16} />
                  <span className="text-sm font-semibold">{rating.etoiles}/5</span>
                  <Badge
                    className={
                      rating.resolu
                        ? 'border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
                        : 'border-urgent-500/30 bg-urgent-50 text-urgent-600'
                    }
                  >
                    {rating.resolu ? 'Problème résolu' : 'Non résolu'}
                  </Badge>
                </div>
                {rating.commentaire ? (
                  <p className="mt-2 text-sm text-muted">
                    « {rating.commentaire} »
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="space-y-3">
            {assigned ? (
              <div className="rounded-2xl border border-teal-500/30 bg-surface p-5">
                <h2 className="text-sm font-bold">Prestataire assigné</h2>
                <p className="mt-2 font-semibold">{assigned.nom}</p>
                <p className="text-sm text-muted">
                  {assigned.metier_nom || labelFromSlug(assigned.metier)} ·{' '}
                  {assigned.quartier}
                </p>
                <p className="mt-1 text-sm">
                  {formatNote(assigned.note_moyenne)}/5 ·{' '}
                  {assigned.nombre_avis} avis
                </p>

                <a
                  href={waLink(
                    assigned.whatsapp,
                    `Bonjour ${assigned.nom}, voici les coordonnées du client : ${request.tel_client} — ${zonePath}. Problème : ${request.probleme}. Merci.`,
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-1.5 rounded-xl bg-[#25D366] px-3 text-xs font-bold text-[#04331A]"
                >
                  <Icon name="whatsapp" size={16} />
                  Envoyer les coordonnées
                </a>

                {request.provider_access_token ? (
                  <div className="mt-2 grid gap-1.5">
                    <Link
                      href={`/mission/${request.provider_access_token}`}
                      className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-line px-2.5 text-[11px] font-semibold"
                    >
                      <Icon name="mapPin" size={14} />
                      Lien GPS prestataire
                    </Link>
                    <Link
                      href={`/suivi/${request.token}/carte`}
                      className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-line px-2.5 text-[11px] font-semibold"
                    >
                      <Icon name="search" size={14} />
                      Suivi client
                    </Link>
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className="rounded-2xl border border-line bg-surface p-5">
              <h2 className="text-sm font-bold">Prestataires à alerter</h2>
              <p className="mt-1 text-xs text-muted">
                Même quartier d’abord, puis commune, département et région.
              </p>

              <div className="mt-3 space-y-2">
                {providers.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-line p-4 text-xs text-muted">
                    Aucun prestataire validé pour cette catégorie. Validez-en un
                    depuis l’onglet Prestataires, ou ajoutez des services.
                  </p>
                ) : null}

                {providers.map((provider) => {
                  const isAssigned = request.provider_id === provider.id;
                  const distance = formatKm(provider.distance_km);

                  return (
                    <div
                      key={provider.id}
                      className="rounded-xl border border-line p-3"
                    >
                      <div className="flex items-start gap-2.5">
                        {provider.photo_url ? (
                          <Image
                            src={provider.photo_url}
                            alt=""
                            width={40}
                            height={40}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-navy-900 text-xs font-bold text-white">
                            {initials(provider.nom)}
                          </span>
                        )}

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">
                            {provider.nom}
                          </p>
                          <p className="text-[11px] text-muted">
                            {provider.quartier}
                            {distance ? ` · ${distance}` : ''}
                          </p>
                          <p className="text-[11px] text-muted">
                            {ZONE_LABELS[provider.zone_score] ?? 'Zone'} ·{' '}
                            {formatNote(provider.note_moyenne)}/5 ·{' '}
                            {provider.nombre_avis} avis
                            {provider.disponible ? '' : ' · indisponible'}
                          </p>
                        </div>

                        {isAssigned ? (
                          <Badge className="border-teal-500/30 bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300">
                            Assigné
                          </Badge>
                        ) : null}
                      </div>

                      <div className="mt-2 grid grid-cols-2 gap-1.5">
                        <WhatsAppAlert href={alertHref(provider)} />
                        <AssignButton
                          requestId={request.id}
                          providerId={provider.id}
                          providerName={provider.nom}
                          disabled={!provider.disponible}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
