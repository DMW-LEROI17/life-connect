import type { Metadata } from 'next';
import Link from 'next/link';

import { Icon } from '@/components/Icons';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/format';
import { listOpportunities } from '@/lib/radar';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'LIFE RADAR — Opportunités',
  description:
    'Emplois, stages, événements, projets et partenariats publiés par la communauté LIFE CONNECT.',
};

const KINDS = [
  { value: '', label: 'Tout' },
  { value: 'emploi', label: 'Emplois' },
  { value: 'stage', label: 'Stages' },
  { value: 'evenement', label: 'Événements' },
  { value: 'partenariat', label: 'Partenariats' },
  { value: 'projet', label: 'Projets' },
];

const KIND_LABELS: Record<string, string> = {
  emploi: 'Emploi',
  stage: 'Stage',
  evenement: 'Événement',
  partenariat: 'Partenariat',
  projet: 'Projet',
};

export default async function RadarPage({
  searchParams,
}: {
  searchParams: { q?: string; kind?: string; city?: string };
}) {
  const opportunities = await listOpportunities({
    q: searchParams.q,
    kind: searchParams.kind,
    city: searchParams.city,
  });

  return (
    <>
      <Header />
      <main id="contenu" className="container-lc py-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-teal-600 dark:text-teal-300">
          LIFE RADAR
        </p>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="mt-1 text-3xl font-bold tracking-tight">
              Les opportunités du moment
            </h1>
            <p className="mt-1 max-w-xl text-sm text-muted">
              Emplois, stages, événements, projets et partenariats. Publiés par
              des membres réels.
            </p>
          </div>
          <Link
            href="/radar/nouveau"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-teal-500 px-4 text-sm font-semibold text-white"
          >
            <Icon name="send" size={18} />
            Publier une opportunité
          </Link>
        </div>

        <form
          action="/radar"
          method="get"
          className="mt-5 grid gap-2 rounded-2xl border border-line bg-surface p-3 shadow-soft sm:grid-cols-[1fr_170px_160px_auto]"
        >
          <input
            name="q"
            defaultValue={searchParams.q ?? ''}
            placeholder="Mot-clé, projet, employeur…"
            className="input-lc"
            aria-label="Rechercher une opportunité"
          />
          <select name="kind" defaultValue={searchParams.kind ?? ''} className="select-lc">
            <option value="">Tous les types</option>
            <option value="emploi">Emploi</option>
            <option value="stage">Stage</option>
            <option value="evenement">Événement</option>
            <option value="partenariat">Partenariat</option>
            <option value="projet">Projet</option>
          </select>
          <input
            name="city"
            defaultValue={searchParams.city ?? ''}
            placeholder="Ville"
            className="input-lc"
            aria-label="Ville"
          />
          <button
            type="submit"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-navy-900 px-5 text-sm font-semibold text-white"
          >
            <Icon name="search" size={18} />
            Filtrer
          </button>
        </form>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {KINDS.map((kind) => (
            <Link
              key={kind.value}
              href={`/radar?${new URLSearchParams(
                kind.value ? { kind: kind.value } : {},
              ).toString()}`}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                (searchParams.kind ?? '') === kind.value
                  ? 'border-teal-500 bg-teal-500 text-white'
                  : 'border-line bg-surface text-muted'
              }`}
            >
              {kind.label}
            </Link>
          ))}
        </div>

        {opportunities.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-line bg-surface p-10 text-center">
            <p className="font-semibold">Aucune opportunité pour le moment</p>
            <p className="mt-1 text-sm text-muted">
              Publiez un projet, un emploi ou un événement.
            </p>
          </div>
        ) : (
          <div className="mt-5 space-y-2">
            {opportunities.map((opportunity) => (
              <article
                key={opportunity.id}
                className="rounded-2xl border border-line bg-surface p-4 shadow-soft"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="border-teal-500/30 bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300">
                    {KIND_LABELS[opportunity.kind] ?? opportunity.kind}
                  </Badge>
                  <span className="text-[11px] text-muted">
                    {opportunity.author_name} · {formatDate(opportunity.created_at)}
                  </span>
                  {opportunity.city ? (
                    <span className="text-[11px] text-muted">· {opportunity.city}</span>
                  ) : null}
                </div>
                <h2 className="mt-2 text-lg font-bold">{opportunity.title}</h2>
                <p className="mt-1 whitespace-pre-line text-sm text-muted">
                  {opportunity.description}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  {opportunity.deadline ? (
                    <span className="text-[11px] font-semibold text-urgent-600">
                      Date limite : {formatDate(opportunity.deadline)}
                    </span>
                  ) : null}
                  {opportunity.link ? (
                    <a
                      href={opportunity.link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 underline underline-offset-2 dark:text-teal-300"
                    >
                      <Icon name="chevronRight" size={14} />
                      Voir le lien
                    </a>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
