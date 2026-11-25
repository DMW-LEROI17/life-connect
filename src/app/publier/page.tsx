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
  {
    href: '/connect/nouveau',
    label: 'Publier un besoin ou une offre',
    text: 'Décrivez ce que vous cherchez ou proposez et recevez des réponses réelles.',
    icon: 'send' as const,
    tag: 'LIFE CONNECT',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    href: '/market/nouveau',
    label: 'Publier une annonce',
    text: 'Vendre, acheter ou louer un produit avec photos, prix et localisation.',
    icon: 'cart' as const,
    tag: 'LIFE MARKET',
    color: 'bg-orange-50 text-orange-600',
  },
  {
    href: '/demande',
    label: 'Demander une aide HELP ME',
    text: 'Décrivez un problème et trouvez un prestataire adapté à votre zone.',
    icon: 'wrench' as const,
    tag: 'HELP ME',
    color: 'bg-urgent-50 text-urgent-600',
  },
  {
    href: '/radar/nouveau',
    label: 'Publier une opportunité',
    text: 'Emploi, stage, événement, projet ou partenariat à partager.',
    icon: 'trophy' as const,
    tag: 'LIFE RADAR',
    color: 'bg-violet-50 text-violet-500',
  },
  {
    href: '/exchange/nouveau',
    label: 'Proposer un échange',
    text: 'Échangez une compétence, un service ou un savoir-faire.',
    icon: 'handshake' as const,
    tag: 'LIFE EXCHANGE',
    color: 'bg-emerald-50 text-emerald-600',
  },
  {
    href: '/community/nouveau',
    label: 'Créer un groupe',
    text: 'Rassemblez une communauté autour d’un intérêt, d’un métier ou d’un projet.',
    icon: 'users' as const,
    tag: 'LIFE COMMUNITY',
    color: 'bg-cyan-50 text-cyan-600',
  },
  {
    href: '/devenir-aideur',
    label: 'Devenir prestataire',
    text: 'Présentez vos services, vos zones et recevez des demandes.',
    icon: 'shield' as const,
    tag: 'LIFE PEOPLE',
    color: 'bg-teal-50 text-teal-700',
  },
];

export default function PublierPage() {
  return (
    <>
      <Header />
      <main id="contenu" className="container-lc max-w-4xl py-6 sm:py-8">
        <div className="overflow-hidden rounded-[2rem] gradient-night p-6 text-white shadow-lift sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/60">
                Publier
              </p>
              <h1 className="mt-1 max-w-2xl text-3xl font-black tracking-tight sm:text-4xl">
                Que souhaitez-vous partager avec la communauté LIFE CONNECT ?
              </h1>
              <p className="mt-2 max-w-xl text-sm text-white/70">
                Choisissez un format. Chaque action ouvre son véritable
                formulaire connecté à la base de données.
              </p>
            </div>
            <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl border border-white/20 bg-white/10 backdrop-blur">
              <Icon name="plus" size={30} />
            </span>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {ACTIONS.map((action, index) => (
            <Link
              key={action.href}
              href={action.href}
              className="card-hover group flex min-h-[170px] flex-col justify-between rounded-3xl border border-line bg-surface p-5 shadow-soft"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <span
                    className={`grid h-12 w-12 place-items-center rounded-2xl ${action.color}`}
                  >
                    <Icon name={action.icon} size={23} />
                  </span>
                  <span className="text-[10px] font-black tabular-nums text-line">
                    0{index + 1}
                  </span>
                </div>
                <p className="mt-3 text-[9px] font-black uppercase tracking-[0.16em] text-muted">
                  {action.tag}
                </p>
                <p className="mt-1 text-base font-black leading-snug text-ink">
                  {action.label}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted">
                  {action.text}
                </p>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs font-bold text-teal-700 dark:text-teal-300">
                  Continuer
                </span>
                <span className="grid h-8 w-8 place-items-center rounded-full bg-surface2 text-muted transition-colors group-hover:bg-teal-500 group-hover:text-white">
                  <Icon name="chevronRight" size={15} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
