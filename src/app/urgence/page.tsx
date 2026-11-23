import type { Metadata } from 'next';
import Link from 'next/link';

import { EmergencyNumbers } from '@/components/emergency/EmergencyNumbers';
import { ShareLocationButton } from '@/components/emergency/ShareLocationButton';
import { Icon, safeIcon } from '@/components/Icons';
import { EmergencyBanner } from '@/components/layout/EmergencyBanner';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { Badge } from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/Button';
import { FACILITY_LABELS } from '@/lib/constants';
import { getEmergencyFacilities, getEmergencyGuides } from '@/lib/emergency';
import { getRegions } from '@/lib/geo';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Urgences au Cameroun : numéros et premiers gestes',
  description:
    'Numéros d’urgence officiels du Cameroun (117, 118, 119), premiers gestes, hôpitaux et pharmacies par région.',
};

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function UrgencePage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const regionParam = Number(first(searchParams.region) ?? '');
  const regionId = Number.isInteger(regionParam) && regionParam > 0 ? regionParam : undefined;

  const [guides, regions, facilities] = await Promise.all([
    getEmergencyGuides(),
    getRegions(),
    getEmergencyFacilities(regionId),
  ]);

  const selectedRegion = regions.find((region) => region.id === regionId);

  return (
    <>
      <Header />
      <EmergencyBanner />

      <main id="contenu">
        <section className="bg-urgent-600 text-white">
          <div className="container-lc py-8 sm:py-10">
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-white/80">
              Urgence · Cameroun
            </p>
            <h1 className="mt-2 max-w-3xl text-3xl font-black tracking-tight sm:text-4xl">
              D’abord les secours. Ensuite, les premiers gestes.
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-white/85">
              Numéros officiels, fiches simples et établissements de santé. LIFE
              CONNECT ne remplace ni la police, ni les pompiers, ni le SAMU.
            </p>

            <div className="mt-5">
              <EmergencyNumbers />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <ButtonLink href="/urgence/transport" variant="secondary" size="sm">
                <Icon name="send" size={16} />
                Demander un transport urgent
              </ButtonLink>
              <ButtonLink
                href="/aide/sante_domicile"
                variant="outline"
                size="sm"
                className="border-white/30 bg-white/10 text-white hover:bg-white/15"
              >
                <Icon name="user" size={16} />
                Santé à domicile
              </ButtonLink>
            </div>
          </div>
        </section>

        <section className="container-lc py-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold sm:text-2xl">
                Premiers gestes par situation
              </h2>
              <p className="mt-1 text-sm text-muted">
                Des consignes simples, à lire avant l’arrivée des secours.
              </p>
            </div>
            <ShareLocationButton />
          </div>

          {guides.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed border-line bg-surface p-5 text-sm text-muted">
              Les fiches ne sont pas encore chargées. Exécutez les scripts SQL V2
              (05 à 10).
            </div>
          ) : (
            <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {guides.map((guide) => (
                <Link
                  key={guide.slug}
                  href={`/urgence/${guide.slug}`}
                  className="group flex items-start gap-3 rounded-2xl border border-line bg-surface p-4 shadow-soft transition-colors hover:border-urgent-500/40"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-urgent-50 text-urgent-600 dark:bg-urgent-500/10">
                    <Icon name={safeIcon(guide.icon)} size={20} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold">
                      {guide.title}
                    </span>
                    <span className="mt-0.5 block text-xs text-muted">
                      {guide.summary}
                    </span>
                  </span>
                  <Icon
                    name="chevronRight"
                    size={16}
                    className="mt-1 shrink-0 text-muted transition-transform group-hover:translate-x-0.5"
                  />
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="container-lc py-6">
          <div className="rounded-2xl border border-line bg-surface p-5 shadow-soft">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold">
                  Hôpitaux, cliniques et centres de santé
                </h2>
                <p className="mt-1 text-sm text-muted">
                  {selectedRegion
                    ? `Zone : ${selectedRegion.nom}.`
                    : 'Choisissez une région pour filtrer.'}{' '}
                  Les numéros doivent être vérifiés avant usage.
                </p>
              </div>
              <form method="get" action="/urgence" className="flex gap-2">
                <select
                  name="region"
                  defaultValue={regionId ?? ''}
                  className="select-lc h-10 w-auto min-w-40 text-sm"
                  aria-label="Filtrer par région"
                >
                  <option value="">Tout le Cameroun</option>
                  {regions.map((region) => (
                    <option key={region.id} value={region.id}>
                      {region.nom}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="inline-flex min-h-10 items-center rounded-xl bg-navy-900 px-3 text-xs font-semibold text-white dark:bg-white dark:text-navy-900"
                >
                  Filtrer
                </button>
              </form>
            </div>

            {facilities.length === 0 ? (
              <p className="mt-4 rounded-xl border border-dashed border-line p-4 text-sm text-muted">
                Aucun établissement référencé dans cette zone pour l’instant.
                Appelez le 119 pour une urgence médicale.
              </p>
            ) : (
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {facilities.map((facility) => {
                  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    `${facility.nom} ${facility.ville}`,
                  )}`;

                  return (
                    <div
                      key={facility.id}
                      className="rounded-xl border border-line p-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold">{facility.nom}</p>
                          <p className="text-[11px] text-muted">
                            {FACILITY_LABELS[facility.type] ?? facility.type} ·{' '}
                            {facility.ville}
                            {facility.region_nom
                              ? ` · ${facility.region_nom}`
                              : ''}
                          </p>
                        </div>
                        {!facility.is_verified ? (
                          <Badge className="border-amber-500/30 bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                            À vérifier
                          </Badge>
                        ) : null}
                      </div>

                      {facility.adresse ? (
                        <p className="mt-1 text-xs text-muted">
                          {facility.adresse}
                        </p>
                      ) : null}

                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {facility.telephone ? (
                          <a
                            href={`tel:${facility.telephone}`}
                            className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-navy-900 px-3 text-xs font-semibold text-white dark:bg-white dark:text-navy-900"
                          >
                            <Icon name="phone" size={14} />
                            Appeler
                          </a>
                        ) : (
                          <span className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-line px-3 text-[11px] text-muted">
                            <Icon name="phone" size={14} />
                            Numéro à vérifier
                          </span>
                        )}

                        <a
                          href={mapsUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-line px-3 text-xs font-semibold"
                        >
                          <Icon name="mapPin" size={14} />
                          Itinéraire
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <section className="container-lc py-8">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-line bg-surface p-5">
              <h2 className="text-sm font-bold">Envoyer ma position</h2>
              <p className="mt-1 text-xs text-muted">
                Partagez votre position GPS à un proche via WhatsApp, même si
                vous ne pouvez pas parler.
              </p>
              <div className="mt-3">
                <ShareLocationButton />
              </div>
            </div>

            <div className="rounded-2xl border border-line bg-surface p-5">
              <h2 className="text-sm font-bold">Besoin d’un transport ?</h2>
              <p className="mt-1 text-xs text-muted">
                Moto, taxi ou véhicule : alertez les aideurs proches pour vous
                emmener à l’hôpital.
              </p>
              <ButtonLink
                href="/urgence/transport"
                variant="outline"
                size="sm"
                className="mt-3 w-full"
              >
                <Icon name="send" size={16} />
                Alerter les aideurs
              </ButtonLink>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-muted">
            Ces fiches ne remplacent pas un médecin. En cas de doute, appelez le
            119.
          </p>
        </section>
      </main>

      <Footer />
    </>
  );
}
