import type { Metadata } from 'next';
import Link from 'next/link';

import { Icon } from '@/components/Icons';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { Badge } from '@/components/ui/Badge';
import { ROLE_LABELS } from '@/lib/constants';
import { listPeople } from '@/lib/people';
import { getFeaturedProviders } from '@/lib/search';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'LIFE PEOPLE & SERVICES — Annuaire',
  description:
    'Découvrez les membres, professionnels et entreprises de LIFE CONNECT. Contactez-les directement.',
};

const ROLES = [
  { value: '', label: 'Tous' },
  { value: 'professionnel', label: 'Professionnels' },
  { value: 'commercant', label: 'Commerçants' },
  { value: 'entreprise', label: 'Entreprises' },
  { value: 'particulier', label: 'Particuliers' },
];

export default async function PeoplePage({
  searchParams,
}: {
  searchParams: { q?: string; role?: string; city?: string };
}) {
  const [people, providers] = await Promise.all([
    listPeople({ q: searchParams.q, role: searchParams.role, city: searchParams.city }),
    getFeaturedProviders(),
  ]);

  return (
    <>
      <Header />
      <main id="contenu" className="container-lc py-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-teal-600 dark:text-teal-300">
          LIFE PEOPLE &amp; SERVICES
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">
          Des personnes, des compétences
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Annuaire des membres et des professionnels vérifiés. Contactez
          directement par messagerie.
        </p>

        <form
          action="/people"
          method="get"
          className="mt-5 grid gap-2 rounded-2xl border border-line bg-surface p-3 shadow-soft sm:grid-cols-[1fr_180px_auto]"
        >
          <input
            name="q"
            defaultValue={searchParams.q ?? ''}
            placeholder="Nom, compétence, ville…"
            className="input-lc"
            aria-label="Rechercher une personne"
          />
          <input
            name="city"
            defaultValue={searchParams.city ?? ''}
            placeholder="Ville"
            className="input-lc"
            aria-label="Ville"
          />
          <button
            type="submit"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-teal-500 px-5 text-sm font-semibold text-white"
          >
            <Icon name="search" size={18} />
            Chercher
          </button>
          <input type="hidden" name="role" value={searchParams.role ?? ''} />
        </form>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {ROLES.map((role) => (
            <Link
              key={role.value}
              href={`/people?${new URLSearchParams({
                ...(searchParams.q ? { q: searchParams.q } : {}),
                ...(searchParams.city ? { city: searchParams.city } : {}),
                ...(role.value ? { role: role.value } : {}),
              }).toString()}`}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                (searchParams.role ?? '') === role.value
                  ? 'border-teal-500 bg-teal-500 text-white'
                  : 'border-line bg-surface text-muted'
              }`}
            >
              {role.label}
            </Link>
          ))}
        </div>

        <section className="mt-6">
          <h2 className="text-lg font-bold">Membres ({people.length})</h2>
          {people.length === 0 ? (
            <p className="mt-2 rounded-xl border border-dashed border-line p-4 text-sm text-muted">
              Aucun membre ne correspond. Essayez un autre filtre.
            </p>
          ) : (
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {people.map((person) => (
                <Link
                  key={person.id}
                  href={`/people/${person.id}`}
                  className="rounded-2xl border border-line bg-surface p-4 shadow-soft transition-colors hover:border-teal-500/40"
                >
                  <div className="flex items-center gap-3">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-surface2 text-sm font-bold text-teal-700 dark:text-teal-300">
                      {person.full_name
                        .split(/\s+/)
                        .slice(0, 2)
                        .map((part) => part[0]?.toUpperCase())
                        .join('') || 'LC'}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold">{person.full_name}</p>
                      <p className="truncate text-[11px] text-muted">
                        {ROLE_LABELS[person.role] ?? person.role}
                        {person.city ? ` · ${person.city}` : ''}
                      </p>
                    </div>
                  </div>
                  {person.bio ? (
                    <p className="mt-2 line-clamp-2 text-xs text-muted">{person.bio}</p>
                  ) : null}
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="mt-8">
          <div className="flex items-end justify-between gap-2">
            <h2 className="text-lg font-bold">Professionnels vérifiés</h2>
            <Link href="/match" className="text-sm font-semibold text-teal-700 dark:text-teal-300">
              LIFE AI
            </Link>
          </div>
          {providers.length === 0 ? (
            <p className="mt-2 rounded-xl border border-dashed border-line p-4 text-sm text-muted">
              Aucun prestataire vérifié pour le moment.
            </p>
          ) : (
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {providers.map((provider) => (
                <Link
                  key={provider.id}
                  href={`/prestataires/${provider.id}`}
                  className="rounded-2xl border border-line bg-surface p-4 shadow-soft transition-colors hover:border-teal-500/40"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-bold">{provider.nom}</p>
                    <Badge className="border-teal-500/30 bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300">
                      Vérifié
                    </Badge>
                  </div>
                  <p className="mt-1 truncate text-[11px] text-muted">
                    {provider.metier_nom ?? provider.metier} · {provider.quartier}
                  </p>
                  <p className="mt-1 text-[11px] text-muted">
                    ★ {provider.note_moyenne.toFixed(1)} · {provider.nombre_avis} avis
                  </p>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
