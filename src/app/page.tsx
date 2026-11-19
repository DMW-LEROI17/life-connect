import { CategoryGrid } from '@/components/home/CategoryGrid';
import { Hero } from '@/components/home/Hero';
import { HowItWorks } from '@/components/home/HowItWorks';
import { Icon } from '@/components/Icons';
import { EmergencyBanner } from '@/components/layout/EmergencyBanner';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { ButtonLink } from '@/components/ui/Button';

const TRUST = [
  {
    icon: 'shield' as const,
    title: 'Prestataires vérifiés',
    text: 'Chaque profil est validé par l’administrateur avant d’être proposé.',
  },
  {
    icon: 'user' as const,
    title: 'Sans compte',
    text: 'Un numéro suffit. Pas de mot de passe, pas d’application à installer.',
  },
  {
    icon: 'phone' as const,
    title: 'Paiement direct',
    text: 'Vous payez le prestataire directement, sans commission cachée.',
  },
];

export default function HomePage() {
  return (
    <>
      <Header />
      <EmergencyBanner />

      <main id="contenu">
        <Hero />
        <CategoryGrid />
        <HowItWorks />

        <section className="container-lc py-8">
          <div className="overflow-hidden rounded-3xl bg-navy-900 p-6 text-white sm:p-10">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold">
                  Vous êtes prestataire ?
                </h2>
                <p className="mt-2 max-w-md text-sm text-white/80">
                  Recevez des demandes de clients proches. Inscription gratuite,
                  vérification sous 24 h.
                </p>
              </div>

              <ButtonLink
                href="/prestataire"
                variant="secondary"
                className="shrink-0"
              >
                <Icon name="user" size={18} />
                Créer mon profil
              </ButtonLink>
            </div>
          </div>
        </section>

        <section className="container-lc py-8">
          <div className="grid gap-3 sm:grid-cols-3">
            {TRUST.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-line bg-surface p-5"
              >
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-400">
                  <Icon name={item.icon} size={20} />
                </span>
                <p className="mt-3 font-semibold">{item.title}</p>
                <p className="mt-1 text-sm text-muted">{item.text}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
