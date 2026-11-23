import type { Metadata } from 'next';
import Link from 'next/link';

import { Icon } from '@/components/Icons';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { GroupForm } from '@/components/community/Forms';
import { requireUser } from '@/lib/auth-user';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Créer un groupe — LIFE COMMUNITY',
  robots: { index: false, follow: false },
};

export default async function NewGroupPage() {
  await requireUser('/community/nouveau');

  return (
    <>
      <Header />
      <main id="contenu" className="container-lc max-w-xl py-8">
        <Link
          href="/community"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink"
        >
          <Icon name="arrowLeft" size={16} />
          LIFE COMMUNITY
        </Link>
        <h1 className="mt-3 text-2xl font-bold tracking-tight">Créer un groupe</h1>
        <p className="mt-1 text-sm text-muted">
          Un groupe de quartier, de métier, d’entraide ou de projet.
        </p>
        <div className="mt-5 rounded-2xl border border-line bg-surface p-5 shadow-soft">
          <GroupForm />
        </div>
      </main>
      <Footer />
    </>
  );
}
