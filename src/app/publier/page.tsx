import type { Metadata } from 'next';
import Link from 'next/link';

import { Icon } from '@/components/Icons';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { PublishWizard } from '@/components/publish/PublishWizard';

export const metadata: Metadata = {
  title: 'Publier — LIFE CONNECT',
  description:
    'Publiez une demande, une offre, une annonce, une opportunité ou créez votre profil prestataire sur LIFE CONNECT.',
};

export default function PublierPage() {
  return (
    <>
      <Header />
      <main id="contenu" className="container-lc max-w-3xl py-5 sm:py-8">
        <div className="relative overflow-hidden rounded-[1.75rem] gradient-night p-5 text-white shadow-lift sm:rounded-[2rem] sm:p-7">
          <div className="absolute -right-10 -top-12 h-36 w-36 rounded-full bg-cyan-400/25 blur-2xl" />
          <div className="absolute -bottom-12 left-1/3 h-28 w-28 rounded-full bg-violet-500/25 blur-2xl" />

          <div className="relative flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/55">
                Publier sur LIFE CONNECT
              </p>
              <h1 className="mt-1 max-w-xl text-[1.85rem] font-black leading-[1.1] tracking-tight sm:text-4xl">
                Votre publication en quelques secondes.
              </h1>
              <p className="mt-2 max-w-md text-xs leading-relaxed text-white/70 sm:text-sm">
                Choisissez un format, vérifiez les informations demandées, puis
                remplissez le formulaire adapté.
              </p>
            </div>
            <span className="hidden h-14 w-14 shrink-0 place-items-center rounded-2xl border border-white/20 bg-white/10 backdrop-blur sm:grid">
              <Icon name="plus" size={28} />
            </span>
          </div>

          <div className="relative mt-5 flex items-center gap-2">
            <span className="flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[10px] font-black text-navy-900">
              <span className="grid h-4 w-4 place-items-center rounded-full bg-teal-500 text-[8px] text-white">
                1
              </span>
              Type de publication
            </span>
            <span className="h-px flex-1 bg-white/20" />
            <span className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-bold text-white/65">
              <span className="grid h-4 w-4 place-items-center rounded-full bg-white/15 text-[8px]">
                2
              </span>
              Formulaire
            </span>
          </div>
        </div>

        <div className="mt-4 rounded-[1.5rem] border border-line bg-surface p-4 shadow-soft sm:p-5">
          <PublishWizard />
        </div>

        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <div className="flex items-start gap-2.5 rounded-2xl border border-line bg-surface p-3.5">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300">
              <Icon name="shield" size={17} />
            </span>
            <div>
              <p className="text-xs font-bold">Publication vérifiée</p>
              <p className="mt-0.5 text-[10px] leading-relaxed text-muted">
                Les contenus signalés sont modérés avant mise en avant.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2.5 rounded-2xl border border-line bg-surface p-3.5">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300">
              <Icon name="whatsapp" size={17} />
            </span>
            <div>
              <p className="text-xs font-bold">Besoin d’un coup de main ?</p>
              <p className="mt-0.5 text-[10px] leading-relaxed text-muted">
                <Link href="/contact" className="font-semibold text-teal-700 underline-offset-2 hover:underline dark:text-teal-300">
                  Contactez l’équipe
                </Link>{' '}
                pour être accompagné.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
