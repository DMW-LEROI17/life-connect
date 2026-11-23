import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { EmergencyNumbers } from '@/components/emergency/EmergencyNumbers';
import { ShareLocationButton } from '@/components/emergency/ShareLocationButton';
import { Icon, safeIcon } from '@/components/Icons';
import { EmergencyBanner } from '@/components/layout/EmergencyBanner';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { ButtonLink } from '@/components/ui/Button';
import { getEmergencyGuide } from '@/lib/emergency';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const guide = await getEmergencyGuide(params.slug);

  return {
    title: guide ? `${guide.title} : premiers gestes` : 'Urgence',
    description: guide?.summary ?? undefined,
  };
}

export default async function GuidePage({
  params,
}: {
  params: { slug: string };
}) {
  const guide = await getEmergencyGuide(params.slug);

  if (!guide) {
    notFound();
  }

  const doSteps = Array.isArray(guide.do_steps) ? guide.do_steps : [];
  const dontSteps = Array.isArray(guide.dont_steps) ? guide.dont_steps : [];

  return (
    <>
      <Header />
      <EmergencyBanner />

      <main id="contenu" className="container-lc max-w-2xl py-8">
        <Link
          href="/urgence"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink"
        >
          <Icon name="arrowLeft" size={16} />
          Toutes les urgences
        </Link>

        <div className="mt-4 flex items-start gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-urgent-50 text-urgent-600 dark:bg-urgent-500/10">
            <Icon name={safeIcon(guide.icon)} size={24} />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {guide.title}
            </h1>
            {guide.summary ? (
              <p className="mt-1 text-sm text-muted">{guide.summary}</p>
            ) : null}
          </div>
        </div>

        <div className="mt-5 rounded-2xl bg-urgent-600 p-4 text-white">
          <p className="text-xs font-bold uppercase tracking-wide text-white/80">
            Appelez d’abord
          </p>
          <div className="mt-2">
            <EmergencyNumbers compact />
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <section className="rounded-2xl border border-teal-500/30 bg-surface p-5">
            <h2 className="flex items-center gap-2 text-sm font-bold text-teal-700 dark:text-teal-300">
              <Icon name="check" size={18} />
              À faire
            </h2>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              {doSteps.map((step, index) => (
                <li key={index} className="flex gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" />
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-urgent-500/30 bg-surface p-5">
            <h2 className="flex items-center gap-2 text-sm font-bold text-urgent-600">
              <Icon name="close" size={18} />
              À ne pas faire
            </h2>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              {dontSteps.map((step, index) => (
                <li key={index} className="flex gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-urgent-500" />
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <p className="mt-4 rounded-xl border border-amber-500/30 bg-amber-50 p-3 text-xs font-medium text-amber-900 dark:bg-amber-500/10 dark:text-amber-200">
          {guide.warning}
        </p>

        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          <ShareLocationButton />
          <ButtonLink href="/urgence/transport" variant="outline">
            <Icon name="send" size={18} />
            Demander un transport
          </ButtonLink>
        </div>

        <div className="mt-6 rounded-2xl border border-line bg-surface p-5">
          <h2 className="text-sm font-bold">Après les premiers gestes</h2>
          <p className="mt-1 text-sm text-muted">
            Faites évacuer la personne vers un hôpital dès que possible. Vous
            pouvez aussi chercher un professionnel de santé à domicile.
          </p>
          <ButtonLink
            href="/aide/sante_domicile"
            variant="secondary"
            size="sm"
            className="mt-3"
          >
            Trouver un soignant
          </ButtonLink>
        </div>
      </main>

      <Footer />
    </>
  );
}
