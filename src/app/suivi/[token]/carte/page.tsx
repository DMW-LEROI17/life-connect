import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Icon } from '@/components/Icons';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { TrackingView } from '@/components/tracking/TrackingView';
import { getRequestTracking } from '@/lib/tracking';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Suivi GPS',
  robots: { index: false, follow: false },
};

export default async function TrackingPage({
  params,
}: {
  params: { token: string };
}) {
  const tracking = await getRequestTracking(params.token);

  if (!tracking.ok) notFound();

  return (
    <>
      <Header />
      <main id="contenu" className="container-lc max-w-2xl py-6">
        <Link
          href={`/suivi/${params.token}`}
          className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink"
        >
          <Icon name="arrowLeft" size={16} />
          Suivi de la demande
        </Link>
        <TrackingView token={params.token} initial={tracking} />
      </main>
      <Footer />
    </>
  );
}
