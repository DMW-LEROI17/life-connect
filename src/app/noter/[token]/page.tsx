import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Icon } from '@/components/Icons';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { SetupNotice } from '@/components/SetupNotice';
import { RatingForm } from '@/components/request/RatingForm';
import { getRequestByToken } from '@/lib/queries';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Noter l’intervention',
  robots: { index: false, follow: false },
};

export default async function NoterPage({
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

    notFound();
  }

  const canRate =
    (request.statut === 'assignee' || request.statut === 'resolue') &&
    !request.note_donnee;

  return (
    <>
      <Header />

      <main id="contenu" className="container-lc max-w-xl py-8">
        <Link
          href={`/suivi/${request.token}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink"
        >
          <Icon name="arrowLeft" size={16} />
          Retour au suivi
        </Link>

        <h1 className="mt-4 text-2xl font-bold tracking-tight">
          Comment s’est passée l’intervention ?
        </h1>
        <p className="mt-2 text-sm text-muted">
          Votre avis est publié de façon anonyme.
        </p>

        <div className="mt-6">
          {request.note_donnee ? (
            <div className="rounded-2xl border border-line bg-surface p-6 text-center">
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-teal-50 text-teal-600 dark:bg-teal-500/10">
                <Icon name="check" size={24} />
              </span>
              <p className="mt-3 font-semibold">
                Vous avez déjà laissé un avis.
              </p>
              <p className="mt-1 text-sm text-muted">
                Merci, il aide les autres clients.
              </p>
            </div>
          ) : canRate ? (
            <RatingForm token={request.token} />
          ) : (
            <div className="rounded-2xl border border-line bg-surface p-6 text-center">
              <p className="font-semibold">
                La notation n’est pas encore disponible.
              </p>
              <p className="mt-1 text-sm text-muted">
                Elle s’ouvre dès qu’un prestataire est assigné à votre demande.
              </p>
              <Link
                href={`/suivi/${request.token}`}
                className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl border border-line px-4 text-sm font-semibold"
              >
                Voir le suivi
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
