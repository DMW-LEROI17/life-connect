import type { Metadata } from 'next';
import Link from 'next/link';

import { PostForm } from '@/components/connect/PostForm';
import { Icon } from '@/components/Icons';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { requireUser } from '@/lib/auth-user';
import { getCatalog } from '@/lib/catalog';
import { getRegions } from '@/lib/geo';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Publier un besoin ou une offre',
  robots: { index: false, follow: false },
};

export default async function NouveauPostPage() {
  await requireUser('/connect/nouveau');

  const [catalog, regions] = await Promise.all([getCatalog(), getRegions()]);

  return (
    <>
      <Header />
      <main id="contenu" className="container-lc max-w-xl py-8">
        <Link
          href="/connect"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink"
        >
          <Icon name="arrowLeft" size={16} />
          Demandes et offres
        </Link>

        <h1 className="mt-4 text-2xl font-bold tracking-tight">
          Publier sur LIFE CONNECT
        </h1>
        <p className="mt-2 text-sm text-muted">
          Décrivez clairement votre besoin ou votre offre. Les autres membres
          pourront vous répondre.
        </p>

        <div className="mt-6">
          <PostForm catalog={catalog} regions={regions} />
        </div>
      </main>
      <Footer />
    </>
  );
}
