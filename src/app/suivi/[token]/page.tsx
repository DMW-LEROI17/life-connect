import type { Metadata } from 'next';
import Link from 'next/link';

import { Icon } from '@/components/Icons';
import { EmergencyBanner } from '@/components/layout/EmergencyBanner';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { SetupNotice } from '@/components/SetupNotice';
import { StatusPoller } from '@/components/request/StatusPoller';
import { getRequestByToken } from '@/lib/queries';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Suivi de ma demande',
  robots: { index: false, follow: false },
};

export default async function SuiviPage({
  params,
}: {
  params: { token: string };
}) {
  const request = await getRequestByToken(params.token);

  if (!request.ok) {
    if (request.error === 'not_configured') {
      return (
        <>
          <Header />
          <SetupNotice />
          <Footer />
        </>
      );
    }

    return (
      <>
        <Header />
        <main id="contenu" className="container-lc max-w-xl py-14 text-center">
          <h1 className="text-2xl font-bold">Demande introuvable</h1>
          <p className="mt-2 text-sm text-muted">
            Ce lien est invalide ou la demande n’existe plus.
          </p>
          <Link
            href="/aide"
            className="mt-6 inline-flex min-h-12 items-center justify-center rounded-2xl bg-urgent-500 px-5 text-sm font-semibold text-white"
          >
            Faire une nouvelle demande
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <EmergencyBanner />

      <main id="contenu" className="container-lc max-w-xl py-6 sm:py-10">
        <StatusPoller token={request.token} initial={request} />

        <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-xs text-muted">
          <Icon name="shield" size={14} />
          Conservez ce lien : il permet de suivre votre demande.
        </p>
      </main>

      <Footer />
    </>
  );
}
