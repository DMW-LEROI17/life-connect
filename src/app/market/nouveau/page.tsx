import type { Metadata } from 'next';
import Link from 'next/link';

import { Icon } from '@/components/Icons';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { MarketForm } from '@/components/market/MarketForm';
import { requireUser } from '@/lib/auth-user';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Publier une annonce — LIFE MARKET',
  robots: { index: false, follow: false },
};

export default async function NewMarketListingPage() {
  await requireUser('/market/nouveau');

  return (
    <>
      <Header />
      <main id="contenu" className="container-lc max-w-xl py-8">
        <Link
          href="/market"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink"
        >
          <Icon name="arrowLeft" size={16} />
          LIFE MARKET
        </Link>
        <h1 className="mt-3 text-2xl font-bold tracking-tight">
          Publier une annonce
        </h1>
        <p className="mt-1 text-sm text-muted">
          Une photo, un prix honnête, une description claire.
        </p>

        <div className="mt-5 rounded-2xl border border-line bg-surface p-5 shadow-soft">
          <MarketForm />
        </div>
      </main>
      <Footer />
    </>
  );
}
