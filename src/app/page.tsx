import Link from 'next/link';

import { EmergencyNumbers } from '@/components/emergency/EmergencyNumbers';
import { UniversalSearch } from '@/components/home/UniversalSearch';
import { Icon, safeIcon } from '@/components/Icons';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { ButtonLink } from '@/components/ui/Button';
import { getFamilies } from '@/lib/catalog';
import { getFeaturedProviders } from '@/lib/search';

export const dynamic = 'force-dynamic';

const MODULES = [
  {
    href: '/market',
    label: 'MARKET',
    title: 'Acheter, vendre, louer',
    text: 'Produits, téléphones, meubles, véhicules et plus.',
    icon: 'spark' as const,
    color: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
  },
  {
    href: '/radar?kind=emploi',
    label: 'RADAR',
    title: 'Emplois et stages',
    text: 'Offres, partenariats, projets et appels à candidatures.',
    icon: 'star' as const,
    color: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300',
  },
  {
    href: '/market?q=logement',
    label: 'LOGEMENT',
    title: 'Appartements et terrains',
    text: 'Louer, acheter ou publier un logement.',
    icon: 'spark' as const,
    color: 'bg-surface2 text-ink',
  },
  {
    href: '/people',
    label: 'SERVICES',
    title: 'Professionnels et compétences',
    text: 'Trouvez le bon profil, près de chez vous.',
    icon: 'user' as const,
    color: 'bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300',
  },
  {
    href: '/community',
    label: 'COMMUNITY',
    title: 'Groupes et communautés',
    text: 'Rejoignez des groupes locaux, métiers ou projets.',
    icon: 'user' as const,
    color: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300',
  },
  {
    href: '/exchange',
    label: 'EXCHANGE',
    title: 'Échanger des compétences',
    text: 'Un service contre un autre, sans argent.',
    icon: 'wrench' as const,
    color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
  },
];

const TRUST = [
  {
    icon: 'shield' as const,
    title: 'Profils vérifiés',
    text: 'Les professionnels sont validés avant publication.',
  },
  {
    icon: 'search' as const,
    title: 'Recherche connectée',
    text: 'Les résultats viennent de la base réelle, jamais inventés.',
  },
  {
    icon: 'phone' as const,
    title: 'Contact direct',
    text: 'Messagerie, téléphone ou WhatsApp selon votre choix.',
  },
];

export default async function HomePage() {
  const [families, providers] = await Promise.all([
    getFamilies(),
    getFeaturedProviders(),
  ]);

  return (
    <>
      <Header />

      <main id="contenu">
        <section className="relative overflow-hidden border-b border-line bg-surface">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-50 via-bg to-surface dark:from-teal-950/30 dark:via-bg dark:to-surface" />
          <div className="container-lc relative py-10 sm:py-14">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-surface px-3 py-1 text-[11px] font-bold text-teal-700 dark:text-teal-300">
              <span className="h-2 w-2 rounded-full bg-teal-500" />
              Everything. Everyone. Everywhere.
            </div>

            <h1 className="mt-4 max-w-3xl text-4xl font-black tracking-tight sm:text-5xl">
              Un besoin. Une connexion.
              <br />
              <span className="text-teal-600 dark:text-teal-300">
                Une solution.
              </span>
            </h1>

            <p className="mt-3 max-w-2xl text-base text-muted sm:text-lg">
              Emploi, logement, services, produits, partenariats, communauté :
              LIFE CONNECT rassemble les solutions au même endroit.
            </p>

            <div className="mt-6 max-w-3xl">
              <UniversalSearch />
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <ButtonLink href="/publier" size="lg">
                <Icon name="send" size={19} />
                Publier une demande
              </ButtonLink>
              <ButtonLink href="/aide" size="lg" variant="outline">
                <Icon name="wrench" size={19} />
                HELP ME
              </ButtonLink>
              <ButtonLink
                href="/sos"
                size="lg"
                variant="outline"
                className="border-urgent-500/40 text-urgent-600"
              >
                <Icon name="alert" size={19} />
                SOS
              </ButtonLink>
            </div>
          </div>
        </section>

        <section className="container-lc py-8 sm:py-10">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                Explorer les domaines
              </h2>
              <p className="mt-1 text-sm text-muted">
                Choisissez un univers, puis précisez votre besoin.
              </p>
            </div>
            <Link
              href="/explorer"
              className="hidden text-sm font-semibold text-teal-700 hover:underline sm:inline dark:text-teal-300"
            >
              Tout voir
            </Link>
          </div>

          <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {MODULES.map((module) => (
              <Link
                key={module.href}
                href={module.href}
                className="group rounded-2xl border border-line bg-surface p-4 shadow-soft transition-all hover:-translate-y-0.5 hover:border-teal-500/40"
              >
                <span
                  className={`grid h-10 w-10 place-items-center rounded-xl ${module.color}`}
                >
                  <Icon name={module.icon} size={21} />
                </span>
                <p className="mt-3 text-[10px] font-black tracking-[0.16em] text-teal-600 dark:text-teal-300">
                  {module.label}
                </p>
                <p className="mt-0.5 text-sm font-bold">{module.title}</p>
                <p className="mt-1 text-xs text-muted">{module.text}</p>
              </Link>
            ))}

            <Link
              href="/aide"
              className="rounded-2xl border border-urgent-500/30 bg-urgent-50 p-4 shadow-soft transition-all hover:-translate-y-0.5 hover:border-urgent-500 dark:bg-urgent-500/10 sm:col-span-2 lg:col-span-2"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black tracking-[0.16em] text-urgent-600">
                    HELP ME
                  </p>
                  <p className="mt-1 text-lg font-black text-urgent-700 dark:text-urgent-300">
                    Un problème urgent ? Trouvez de l’aide maintenant.
                  </p>
                  <p className="mt-1 text-xs text-urgent-700/80 dark:text-urgent-300/80">
                    Mécanicien, plombier, santé, transport, dépannage…
                  </p>
                </div>
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-urgent-500 text-white">
                  <Icon name="alert" size={22} />
                </span>
              </div>
            </Link>
          </div>
        </section>

        {providers.length > 0 ? (
          <section className="container-lc py-6">
            <div className="flex items-end justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold">Profils à découvrir</h2>
                <p className="mt-1 text-sm text-muted">
                  Des professionnels vérifiés, prêts à répondre.
                </p>
              </div>
              <Link
                href="/people"
                className="text-sm font-semibold text-teal-700 hover:underline dark:text-teal-300"
              >
                Voir l’annuaire
              </Link>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {providers.slice(0, 3).map((provider) => (
                <Link
                  key={provider.id}
                  href={`/prestataires/${provider.id}`}
                  className="rounded-2xl border border-line bg-surface p-4 shadow-soft transition-colors hover:border-teal-500/40"
                >
                  <div className="flex items-center gap-3">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-teal-50 text-sm font-bold text-teal-700 dark:bg-teal-500/10 dark:text-teal-300">
                      {provider.nom
                        .split(/\s+/)
                        .slice(0, 2)
                        .map((part) => part[0]?.toUpperCase())
                        .join('')}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold">{provider.nom}</p>
                      <p className="truncate text-[11px] text-muted">
                        {provider.metier_nom ?? provider.metier} ·{' '}
                        {provider.quartier}
                      </p>
                    </div>
                  </div>
                  <p className="mt-2 text-[11px] text-muted">
                    ★ {provider.note_moyenne.toFixed(1)} · {provider.nombre_avis}{' '}
                    avis
                  </p>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {families.length > 0 ? (
          <section className="container-lc py-6">
            <h2 className="text-xl font-bold">Services populaires</h2>
            <p className="mt-1 text-sm text-muted">
              Le catalogue HELP ME reste disponible pour les besoins précis.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {families.slice(0, 8).map((family) => (
                <Link
                  key={family.slug}
                  href={`/aide?famille=${family.slug}`}
                  className="flex items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2 text-xs font-semibold hover:border-teal-500/40"
                >
                  <Icon name={safeIcon(family.icon)} size={16} />
                  {family.nom_fr}
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        <section className="container-lc py-6">
          <div className="rounded-2xl border border-line bg-surface p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-urgent-600">
                  Urgence vitale
                </p>
                <p className="mt-1 text-sm font-semibold">
                  Appelez d’abord les secours. LIFE CONNECT ne remplace pas la
                  police, les pompiers ou le SAMU.
                </p>
              </div>
              <ButtonLink href="/urgence" variant="outline" size="sm">
                Numéros d’urgence
                <Icon name="chevronRight" size={16} />
              </ButtonLink>
            </div>
            <div className="mt-3">
              <EmergencyNumbers compact />
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
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-300">
                  <Icon name={item.icon} size={20} />
                </span>
                <p className="mt-3 font-semibold">{item.title}</p>
                <p className="mt-1 text-sm text-muted">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="container-lc py-8">
          <div className="overflow-hidden rounded-3xl bg-navy-900 p-6 text-white sm:p-10">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold">
                  Vous proposez un service ou une compétence ?
                </h2>
                <p className="mt-2 max-w-lg text-sm text-white/80">
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
