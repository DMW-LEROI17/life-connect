import type { Metadata } from 'next';
import Link from 'next/link';

import { Icon } from '@/components/Icons';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';

export const metadata: Metadata = {
  title: 'Publier — LIFE CONNECT',
  description:
    'Publiez une demande, une offre, une annonce, une opportunité ou créez votre profil prestataire.',
};

const ACTIONS = [
  { href: '/connect/nouveau', label: 'Publier un besoin ou une offre', text: 'Recevez des propositions réelles.', icon: 'send' as const },
  { href: '/market/nouveau', label: 'Publier une annonce', text: 'Vendre, acheter ou louer un produit.', icon: 'spark' as const },
  { href: '/demande', label: 'Demander une aide HELP ME', text: 'Décrivez un problème et trouvez un prestataire.', icon: 'wrench' as const },
  { href: '/radar/nouveau', label: 'Publier une opportunité', text: 'Emploi, stage, événement, projet, partenariat.', icon: 'star' as const },
  { href: '/exchange/nouveau', label: 'Proposer un échange', text: 'Échangez une compétence ou un service.', icon: 'wrench' as const },
  { href: '/community/nouveau', label: 'Créer un groupe', text: 'Rassemblez une communauté autour d’un intérêt.', icon: 'user' as const },
  { href: '/devenir-aideur', label: 'Devenir prestataire', text: 'Présentez vos services et vos zones.', icon: 'shield' as const },
];

export default function PublierPage() {
  return (
    <>
      <Header />
      <main id="contenu" className="container-lc max-w-3xl py-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-teal-600 dark:text-teal-300">
          PUBLIER
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">
          Que voulez-vous publier ?
        </h1>
        <p className="mt-1 text-sm text-muted">
          Choisissez le format adapté à votre besoin.
        </p>

        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          {ACTIONS.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="rounded-2xl border border-line bg-surface p-4 shadow-soft transition-colors hover:border-teal-500/40"
            >
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300">
                <Icon name={action.icon} size={20} />
              </span>
              <p className="mt-3 text-sm font-bold">{action.label}</p>
              <p className="mt-1 text-xs text-muted">{action.text}</p>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
