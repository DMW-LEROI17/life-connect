import type { Metadata } from 'next';

import { Icon } from '@/components/Icons';
import { EmergencyBanner } from '@/components/layout/EmergencyBanner';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { ButtonLink } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'Devenir prestataire ou aideur — Cameroun',
  description:
    'Mécaniciens, plombiers, techniciens, soignants, taxis, moto-taxis : recevez des demandes de clients proches, dans tout le Cameroun.',
};

const BENEFITS = [
  {
    icon: 'phone' as const,
    title: 'Des clients qui ont besoin de vous',
    text: 'Vous recevez une alerte WhatsApp avec le problème et la zone.',
  },
  {
    icon: 'shield' as const,
    title: 'Profil vérifié',
    text: 'Votre profil est contrôlé avant d’être proposé aux clients.',
  },
  {
    icon: 'check' as const,
    title: 'Sans commission au démarrage',
    text: 'Le client vous paie directement. Aucun frais prélevé par la plateforme.',
  },
];

export default function PrestatairePage() {
  return (
    <>
      <Header />
      <EmergencyBanner />

      <main id="contenu" className="container-lc max-w-3xl py-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-muted">
          <Icon name="wrench" size={14} />
          Cameroun · prestataires et aideurs
        </div>

        <h1 className="mt-4 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
          Vous savez faire quelque chose ? Les clients vous cherchent.
        </h1>
        <p className="mt-3 max-w-2xl text-base text-muted">
          Mécanicien, plombier, électricien, technicien, infirmier, coiffeur,
          traducteur, taxi, moto-taxi… Inscrivez vos services et vos zones.
          Vérification sous 24 h.
        </p>

        <div className="mt-6">
          <ButtonLink href="/prestataire/inscription" size="lg" className="w-full sm:w-auto">
            <Icon name="user" size={20} />
            Créer mon profil
          </ButtonLink>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {BENEFITS.map((benefit) => (
            <div
              key={benefit.title}
              className="rounded-2xl border border-line bg-surface p-5"
            >
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-400">
                <Icon name={benefit.icon} size={20} />
              </span>
              <p className="mt-3 font-semibold">{benefit.title}</p>
              <p className="mt-1 text-sm text-muted">{benefit.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-line bg-surface p-5">
          <h2 className="font-semibold">Comment se passe l’inscription ?</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-muted">
            <li>Vous choisissez vos services et vos zones d’intervention.</li>
            <li>L’administrateur vérifie votre profil sous 24 h.</li>
            <li>
              Une fois validé, vous recevez les demandes par WhatsApp et vous
              répondez librement.
            </li>
          </ol>
          <p className="mt-3 text-xs text-muted">
            Aucun paiement n’est demandé. La plateforme ne prélève pas de
            commission dans cette version.
          </p>
        </div>
      </main>

      <Footer />
    </>
  );
}
