'use client';

import Link from 'next/link';
import { useState } from 'react';

import { Icon } from '@/components/Icons';
import type { IconName } from '@/types/db';

type PublishAction = {
  href: string;
  label: string;
  short: string;
  text: string;
  icon: IconName;
  tag: string;
  color: string;
  details: string[];
};

const ACTIONS: PublishAction[] = [
  {
    href: '/connect/nouveau',
    label: 'Publier un besoin ou une offre',
    short: 'Besoin / offre',
    text: 'Décrivez ce que vous cherchez ou proposez et recevez des réponses réelles.',
    icon: 'send',
    tag: 'LIFE CONNECT',
    color: 'bg-blue-50 text-blue-600',
    details: ['Votre besoin ou offre', 'Votre zone', 'Votre numéro de contact'],
  },
  {
    href: '/market/nouveau',
    label: 'Publier une annonce',
    short: 'Annonce produit',
    text: 'Vendre, acheter ou louer un produit avec photos, prix et localisation.',
    icon: 'cart',
    tag: 'LIFE MARKET',
    color: 'bg-orange-50 text-orange-600',
    details: ['Photos du produit', 'Prix en FCFA', 'Ville et quartier'],
  },
  {
    href: '/demande',
    label: 'Demander une aide HELP ME',
    short: 'Aide HELP ME',
    text: 'Décrivez un problème et trouvez un prestataire adapté à votre zone.',
    icon: 'wrench',
    tag: 'HELP ME',
    color: 'bg-urgent-50 text-urgent-600',
    details: ['Votre problème', 'Votre localisation', 'Votre numéro'],
  },
  {
    href: '/radar/nouveau',
    label: 'Publier une opportunité',
    short: 'Opportunité',
    text: 'Emploi, stage, événement, projet ou partenariat à partager.',
    icon: 'trophy',
    tag: 'LIFE RADAR',
    color: 'bg-violet-50 text-violet-500',
    details: ['Type d’opportunité', 'Description', 'Lieu ou télétravail'],
  },
  {
    href: '/exchange/nouveau',
    label: 'Proposer un échange',
    short: 'Échange',
    text: 'Échangez une compétence, un service ou un savoir-faire.',
    icon: 'handshake',
    tag: 'LIFE EXCHANGE',
    color: 'bg-emerald-50 text-emerald-600',
    details: ['Ce que vous proposez', 'Ce que vous cherchez', 'Votre zone'],
  },
  {
    href: '/community/nouveau',
    label: 'Créer un groupe',
    short: 'Communauté',
    text: 'Rassemblez une communauté autour d’un intérêt, d’un métier ou d’un projet.',
    icon: 'users',
    tag: 'LIFE COMMUNITY',
    color: 'bg-cyan-50 text-cyan-600',
    details: ['Nom du groupe', 'Description', 'Ville et visibilité'],
  },
  {
    href: '/devenir-aideur',
    label: 'Devenir prestataire',
    short: 'Profil pro',
    text: 'Présentez vos services, vos zones et recevez des demandes.',
    icon: 'shield',
    tag: 'LIFE PEOPLE',
    color: 'bg-teal-50 text-teal-700',
    details: ['Votre métier', 'Vos services', 'Vos zones d’intervention'],
  },
];

export function PublishWizard() {
  const [selected, setSelected] = useState<PublishAction | null>(null);

  if (selected) {
    return (
      <div className="animate-rise">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSelected(null)}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-line bg-surface px-3 text-xs font-bold text-muted shadow-soft active:scale-[0.98]"
          >
            <Icon name="arrowLeft" size={15} />
            Changer
          </button>
          <span className="ml-auto text-[10px] font-black uppercase tracking-[0.15em] text-muted">
            Étape 2 / 2
          </span>
        </div>

        <div className="mt-4 overflow-hidden rounded-[1.75rem] border border-line bg-surface shadow-lift">
          <div className="gradient-night p-5 text-white sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <span className={`grid h-14 w-14 place-items-center rounded-2xl ${selected.color}`}>
                <Icon name={selected.icon} size={27} />
              </span>
              <span className="rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-white/80">
                {selected.tag}
              </span>
            </div>
            <p className="mt-4 text-[10px] font-black uppercase tracking-[0.18em] text-white/55">
              Vous allez publier
            </p>
            <h2 className="mt-1 text-2xl font-black leading-tight sm:text-3xl">
              {selected.label}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-white/70">
              {selected.text}
            </p>
          </div>

          <div className="p-5 sm:p-6">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-muted">
              Préparez ces informations
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {selected.details.map((detail, index) => (
                <div
                  key={detail}
                  className="rounded-2xl border border-line bg-surface2/60 p-3"
                >
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-surface text-[10px] font-black text-teal-700 shadow-sm dark:text-teal-300">
                    0{index + 1}
                  </span>
                  <p className="mt-2 text-xs font-bold leading-snug">{detail}</p>
                </div>
              ))}
            </div>

            <Link
              href={selected.href}
              className="mt-5 flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl gradient-brand px-5 text-base font-black text-white shadow-lift transition active:scale-[0.99]"
            >
              Continuer vers le formulaire
              <Icon name="chevronRight" size={18} />
            </Link>
            <p className="mt-2 text-center text-[10px] text-muted">
              Les champs sont adaptés au type choisi. Publication immédiate.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-bold">
          Que voulez-vous partager aujourd’hui ?
        </p>
        <span className="text-[10px] font-black uppercase tracking-[0.15em] text-muted">
          Étape 1 / 2
        </span>
      </div>

      <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
        {ACTIONS.map((action, index) => (
          <button
            key={action.href}
            type="button"
            onClick={() => setSelected(action)}
            className="group flex min-h-[136px] w-full flex-col justify-between rounded-[1.4rem] border border-line bg-surface p-4 text-left shadow-soft transition-all active:scale-[0.99] sm:min-h-[154px] sm:hover:-translate-y-0.5 sm:hover:border-teal-500/30 sm:hover:shadow-lift"
          >
            <span className="flex w-full items-start justify-between gap-3">
              <span className={`grid h-11 w-11 place-items-center rounded-2xl ${action.color}`}>
                <Icon name={action.icon} size={21} />
              </span>
              <span className="text-[10px] font-black tabular-nums text-line">
                0{index + 1}
              </span>
            </span>
            <span className="mt-3 flex w-full items-end justify-between gap-2">
              <span className="min-w-0">
                <span className="block text-[9px] font-black uppercase tracking-[0.14em] text-muted">
                  {action.tag}
                </span>
                <span className="mt-0.5 block text-sm font-black leading-snug text-ink">
                  {action.short}
                </span>
                <span className="mt-0.5 line-clamp-1 block text-[11px] text-muted">
                  {action.text}
                </span>
              </span>
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-surface2 text-muted transition-colors group-hover:bg-teal-500 group-hover:text-white">
                <Icon name="chevronRight" size={15} />
              </span>
            </span>
          </button>
        ))}
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-2xl border border-line bg-surface2/60 p-3">
        <Icon name="shield" size={17} className="mt-0.5 shrink-0 text-teal-700 dark:text-teal-300" />
        <p className="text-[11px] leading-relaxed text-muted">
          Vos coordonnées restent protégées. Les publications sont vérifiées
          avant d’être mises en avant.
        </p>
      </div>
    </div>
  );
}
