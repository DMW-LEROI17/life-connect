import type { Metadata } from 'next';
import Link from 'next/link';

import { Icon } from '@/components/Icons';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { UniversalSearch } from '@/components/home/UniversalSearch';

export const metadata: Metadata = {
  title: 'Explorer — LIFE CONNECT',
  description:
    'Tous les univers LIFE CONNECT : emploi, logement, market, services, communauté, échange, opportunités.',
};

const MODULES = [
  { href: '/market', label: 'LIFE MARKET', text: 'Acheter, vendre, louer', icon: 'spark' as const },
  { href: '/radar', label: 'LIFE RADAR', text: 'Emplois, stages, événements, partenariats', icon: 'star' as const },
  { href: '/market?q=logement', label: 'LOGEMENT', text: 'Appartements, maisons, terrains', icon: 'mapPin' as const },
  { href: '/people', label: 'LIFE PEOPLE', text: 'Professionnels et compétences', icon: 'user' as const },
  { href: '/aide', label: 'HELP ME', text: 'Urgence, dépannage, assistance', icon: 'wrench' as const },
  { href: '/community', label: 'LIFE COMMUNITY', text: 'Groupes et communautés', icon: 'user' as const },
  { href: '/exchange', label: 'LIFE EXCHANGE', text: 'Échanger des compétences', icon: 'wrench' as const },
  { href: '/match', label: 'LIFE AI', text: 'Décrivez votre besoin', icon: 'search' as const },
  { href: '/connect', label: 'LIFE CONNECT', text: 'Besoins, offres et propositions', icon: 'send' as const },
];

export default function ExplorerPage() {
  return (
    <>
      <Header />
      <main id="contenu" className="container-lc py-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-teal-600 dark:text-teal-300">
          EXPLORER
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">
          Tous les univers LIFE CONNECT
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Un seul endroit pour trouver, proposer, vendre, échanger et collaborer.
        </p>

        <div className="mt-5 max-w-2xl">
          <UniversalSearch />
        </div>

        <div className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((module) => (
            <Link
              key={module.href}
              href={module.href}
              className="rounded-2xl border border-line bg-surface p-4 shadow-soft transition-colors hover:border-teal-500/40"
            >
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300">
                <Icon name={module.icon} size={20} />
              </span>
              <p className="mt-3 text-sm font-bold">{module.label}</p>
              <p className="mt-1 text-xs text-muted">{module.text}</p>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
