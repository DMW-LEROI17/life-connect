import type { Metadata } from 'next';
import Link from 'next/link';

import { Icon } from '@/components/Icons';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { SosPanel } from '@/components/sos/SosPanel';
import { getCurrentUser } from '@/lib/auth-user';
import { normalizeCmPhone } from '@/lib/phone';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'SOS — LIFE CONNECT',
  description:
    'Envoyez une alerte SOS à l’administration LIFE CONNECT et appelez les secours.',
};

export default async function SosPage() {
  const current = await getCurrentUser();
  const phone = normalizeCmPhone(current?.profile.phone ?? '') ?? '';

  return (
    <>
      <Header />
      <main id="contenu" className="container-lc max-w-xl py-8">
        <Link
          href="/urgence"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink"
        >
          <Icon name="arrowLeft" size={16} />
          Urgences
        </Link>

        <div className="mt-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-urgent-600">
            SOS
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">
            Envoyer une alerte
          </h1>
          <p className="mt-2 text-sm text-muted">
            Votre position et votre numéro sont transmis à l’administration.
            Aucun paiement n’est demandé.
          </p>
        </div>

        <div className="mt-5">
          <SosPanel defaultPhone={phone} />
        </div>
      </main>
      <Footer />
    </>
  );
}
