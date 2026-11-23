import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Icon } from '@/components/Icons';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { ContactButton } from '@/components/people/ContactButton';
import { Badge } from '@/components/ui/Badge';
import { ROLE_LABELS } from '@/lib/constants';
import { formatDate } from '@/lib/format';
import { getPublicPerson } from '@/lib/people';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Profil — LIFE PEOPLE' };

export default async function PersonPage({
  params,
}: {
  params: { id: string };
}) {
  const person = await getPublicPerson(params.id);
  if (!person) notFound();

  return (
    <>
      <Header />
      <main id="contenu" className="container-lc max-w-xl py-8">
        <Link
          href="/people"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink"
        >
          <Icon name="arrowLeft" size={16} />
          LIFE PEOPLE
        </Link>

        <div className="mt-3 rounded-2xl border border-line bg-surface p-5 shadow-soft">
          <div className="flex items-center gap-3">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-teal-50 text-lg font-bold text-teal-700 dark:bg-teal-500/10 dark:text-teal-300">
              {person.full_name
                .split(/\s+/)
                .slice(0, 2)
                .map((part) => part[0]?.toUpperCase())
                .join('') || 'LC'}
            </span>
            <div>
              <h1 className="text-xl font-bold">{person.full_name}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                <Badge className="border-teal-500/30 bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300">
                  {ROLE_LABELS[person.role] ?? person.role}
                </Badge>
                {person.city ? (
                  <span className="text-xs text-muted">{person.city}</span>
                ) : null}
              </div>
            </div>
          </div>

          {person.bio ? (
            <p className="mt-4 whitespace-pre-line text-sm leading-relaxed">{person.bio}</p>
          ) : (
            <p className="mt-4 text-sm text-muted">Ce membre n’a pas encore écrit de bio.</p>
          )}

          <p className="mt-4 text-[11px] text-muted">
            Membre depuis {formatDate(person.created_at)}
          </p>

          <div className="mt-5">
            <ContactButton
              targetUserId={person.id}
              title={`Contact avec ${person.full_name}`}
              label="Envoyer un message"
            />
          </div>
        </div>

        <p className="mt-4 text-center text-[11px] text-muted">
          Ne partagez jamais vos mots de passe ou codes de paiement.
        </p>
      </main>
      <Footer />
    </>
  );
}
