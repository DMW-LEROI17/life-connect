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
      <main id="contenu" className="container-lc max-w-3xl py-6 sm:py-8">
        <div className="rounded-3xl gradient-night p-5 text-white shadow-lift sm:p-7">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/60">
            PUBLIER
          </p>
          <h1 className="mt-1 text-3xl font-black tracking-tight">
            Que voulez-vous publier ?
          </h1>
          <p className="mt-1 text-sm text-white/70">
            Choisissez le format adapté à votre besoin.
          </p>
        </div>

        <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
          {ACTIONS.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="card-hover rounded-2xl border border-line bg-surface p-4 shadow-soft"
            >
              <span className="grid h-10 w-10 place-items-center rounded-xl gradient-brand text-white">
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
