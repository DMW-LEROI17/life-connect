import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { Icon } from '@/components/Icons';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { MissionTools } from '@/components/tracking/MissionTools';
import { formatCmPhone } from '@/lib/phone';
import { getMissionByToken } from '@/lib/tracking';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Mission prestataire',
  robots: { index: false, follow: false },
};

export default async function MissionPage({
  params,
}: {
  params: { token: string };
}) {
  const mission = await getMissionByToken(params.token);

  if (!mission.ok) notFound();

  return (
    <>
      <Header />
      <main id="contenu" className="container-lc max-w-xl py-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-teal-600 dark:text-teal-300">
          Mission LIFE CONNECT
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">
          {mission.probleme}
        </h1>
        <p className="mt-1 text-sm text-muted">
          {mission.quartier}
          {mission.region_nom ? ` · ${mission.region_nom}` : ''} · Statut :{' '}
          {mission.statut}
        </p>

        <div className="mt-4 rounded-2xl border border-line bg-surface p-4 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Client
          </p>
          <p className="mt-1 text-lg font-bold">
            {mission.tel_client ? formatCmPhone(mission.tel_client) : '—'}
          </p>
          {mission.description ? (
            <p className="mt-2 text-sm text-muted">{mission.description}</p>
          ) : null}

          {mission.client_latitude != null && mission.client_longitude != null ? (
            <a
              href={`https://www.google.com/maps?q=${mission.client_latitude},${mission.client_longitude}`}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700 underline underline-offset-2 dark:text-teal-300"
            >
              <Icon name="mapPin" size={16} />
              Itinéraire vers le client
            </a>
          ) : (
            <p className="mt-2 text-xs text-muted">
              Le client n’a pas partagé de position GPS. Utilisez le quartier.
            </p>
          )}
        </div>

        <div className="mt-4">
          <MissionTools
            token={params.token}
            clientPhone={mission.tel_client ?? ''}
          />
        </div>

        <p className="mt-4 text-center text-[11px] text-muted">
          Ce lien est personnel. Ne le partagez pas. Il permet au client de voir
          votre position pendant la mission.
        </p>
      </main>
      <Footer />
    </>
  );
}
