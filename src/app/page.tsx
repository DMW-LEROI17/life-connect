import Link from 'next/link';

import { EmergencyNumbers } from '@/components/emergency/EmergencyNumbers';
import { ModuleGrid } from '@/components/home/ModuleGrid';
import { SuggestionCard, type SuggestionItem } from '@/components/home/SuggestionCard';
import { UniversalSearch } from '@/components/home/UniversalSearch';
import { Icon } from '@/components/Icons';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { ButtonLink } from '@/components/ui/Button';
import { listMarketListings } from '@/lib/market';
import { getFeaturedProviders } from '@/lib/search';

export const dynamic = 'force-dynamic';

const STATS = [
  { value: '10', label: 'régions' },
  { value: '360', label: 'communes' },
  { value: '8', label: 'univers' },
];

export default async function HomePage() {
  const [providers, listings] = await Promise.all([
    getFeaturedProviders(),
    listMarketListings({}),
  ]);

  const suggestions: SuggestionItem[] = [
    ...listings.slice(0, 3).map<SuggestionItem>((listing) => ({
      kind: 'market',
      listing,
    })),
    ...providers.slice(0, 3).map<SuggestionItem>((provider) => ({
      kind: 'provider',
      provider,
    })),
  ].slice(0, 3);

  return (
    <>
      <Header />

      <main id="contenu">
        <section className="relative isolate overflow-hidden bg-navy-950 text-white">
          <div
            className="absolute inset-0 -z-20 bg-cover bg-center"
            style={{ backgroundImage: "url('/hero-city.svg')" }}
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 -z-10 bg-gradient-to-b from-navy-950/45 via-navy-950/55 to-navy-950"
            aria-hidden="true"
          />

          <div className="container-lc pb-7 pt-8 sm:pb-10 sm:pt-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white/90 backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-400" />
              Everything. Everyone. Everywhere.
            </div>

            <h1 className="mt-4 max-w-2xl text-[2.35rem] font-black leading-[1.05] tracking-tight sm:text-6xl">
              Un besoin.
              <br />
              Une connexion.
              <br />
              <span className="text-teal-300">Une solution.</span>
            </h1>

            <p className="mt-3 max-w-xl text-sm text-white/80 sm:text-base">
              Emploi, logement, services, produits, partenariats, communauté :
              trouve ce qu’il te faut, près de chez toi.
            </p>

            <div className="mt-5 max-w-2xl">
              <UniversalSearch tone="hero" />
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <ButtonLink href="/publier" size="lg">
                <Icon name="send" size={19} />
                Publier une demande
              </ButtonLink>
              <ButtonLink
                href="/aide"
                size="lg"
                variant="outline"
                className="border-white/30 bg-white/10 text-white hover:bg-white/20"
              >
                <Icon name="alert" size={19} />
                HELP ME
              </ButtonLink>
            </div>

            <div className="mt-6 flex flex-wrap gap-4 text-[11px] text-white/65">
              {STATS.map((stat) => (
                <span key={stat.label} className="inline-flex items-baseline gap-1">
                  <strong className="text-lg font-black text-white">
                    {stat.value}
                  </strong>
                  {stat.label}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="container-lc -mt-1 py-6 sm:py-8">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-black tracking-tight sm:text-2xl">
                Que cherchez-vous ?
              </h2>
              <p className="mt-1 text-sm text-muted">
                Huit univers, une seule plateforme.
              </p>
            </div>
            <Link
              href="/explorer"
              className="text-sm font-semibold text-teal-700 hover:underline dark:text-teal-300"
            >
              Tout voir
            </Link>
          </div>

          <div className="mt-4">
            <ModuleGrid />
          </div>
        </section>

        {suggestions.length > 0 ? (
          <section className="container-lc py-4 sm:py-6">
            <div className="flex items-end justify-between gap-3">
              <div>
                <h2 className="text-xl font-black tracking-tight sm:text-2xl">
                  Suggestions pour vous
                </h2>
                <p className="mt-1 text-sm text-muted">
                  Des opportunités et profils réels publiés sur LIFE CONNECT.
                </p>
              </div>
              <Link
                href="/market"
                className="text-sm font-semibold text-teal-700 hover:underline dark:text-teal-300"
              >
                Voir tout
              </Link>
            </div>

            <div className="mt-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {suggestions.map((item) => (
                <SuggestionCard
                  key={
                    item.kind === 'market'
                      ? `market-${item.listing.id}`
                      : `provider-${item.provider.id}`
                  }
                  item={item}
                />
              ))}
            </div>
          </section>
        ) : null}

        <section className="container-lc py-4 sm:py-6">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-600 via-teal-500 to-emerald-500 p-5 text-white shadow-soft sm:p-7">
            <div className="absolute -right-8 -top-10 h-36 w-36 rounded-full bg-white/10" />
            <div className="absolute -bottom-12 right-16 h-28 w-28 rounded-full bg-white/10" />
            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/75">
                  Publier
                </p>
                <h2 className="mt-1 text-2xl font-black tracking-tight">
                  Une annonce, une demande, une opportunité ?
                </h2>
                <p className="mt-1 max-w-lg text-sm text-white/85">
                  Publiez en quelques secondes et laissez la communauté vous
                  répondre.
                </p>
              </div>
              <ButtonLink
                href="/publier"
                variant="secondary"
                size="lg"
                className="shrink-0 bg-white text-teal-700 hover:bg-white/90"
              >
                <Icon name="send" size={19} />
                Publier maintenant
              </ButtonLink>
            </div>
          </div>
        </section>

        <section className="container-lc py-4 sm:py-6">
          <div className="grid gap-2.5 sm:grid-cols-3">
            <div className="rounded-2xl border border-line bg-surface p-4">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300">
                <Icon name="shield" size={18} />
              </span>
              <p className="mt-2 text-sm font-bold">Profils vérifiés</p>
              <p className="mt-0.5 text-xs text-muted">
                Les prestataires sont validés avant publication.
              </p>
            </div>
            <div className="rounded-2xl border border-line bg-surface p-4">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300">
                <Icon name="search" size={18} />
              </span>
              <p className="mt-2 text-sm font-bold">Résultats réels</p>
              <p className="mt-0.5 text-xs text-muted">
                Aucun profil, prix ou avis inventé.
              </p>
            </div>
            <div className="rounded-2xl border border-line bg-surface p-4">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300">
                <Icon name="phone" size={18} />
              </span>
              <p className="mt-2 text-sm font-bold">Contact direct</p>
              <p className="mt-0.5 text-xs text-muted">
                Messagerie, téléphone ou WhatsApp.
              </p>
            </div>
          </div>
        </section>

        <section className="container-lc py-5">
          <div className="rounded-2xl border border-line bg-surface p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-urgent-600">
                  Urgence vitale
                </p>
                <p className="mt-1 text-sm font-semibold">
                  Appelez d’abord les secours. LIFE CONNECT ne remplace pas les
                  services d’urgence.
                </p>
              </div>
              <ButtonLink href="/urgence" variant="outline" size="sm">
                Numéros utiles
                <Icon name="chevronRight" size={16} />
              </ButtonLink>
            </div>
            <div className="mt-3">
              <EmergencyNumbers compact />
            </div>
          </div>
        </section>

        <section className="container-lc py-6">
          <div className="overflow-hidden rounded-3xl bg-navy-900 p-6 text-white sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold">
                  Vous proposez un service ou une compétence ?
                </h2>
                <p className="mt-1 max-w-lg text-sm text-white/75">
                  Créez votre profil, choisissez vos zones et recevez des
                  demandes adaptées.
                </p>
              </div>
              <ButtonLink href="/devenir-aideur" variant="secondary">
                <Icon name="user" size={18} />
                Devenir prestataire
              </ButtonLink>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
