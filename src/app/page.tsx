import Link from 'next/link';

import { EmergencyNumbers } from '@/components/emergency/EmergencyNumbers';
import { ModuleGrid } from '@/components/home/ModuleGrid';
import { UniversalSearch } from '@/components/home/UniversalSearch';
import { Icon, safeIcon } from '@/components/Icons';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { ButtonLink } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDate, formatFcfa } from '@/lib/format';
import { getCatalog, getFamilies } from '@/lib/catalog';
import { listGroups } from '@/lib/community';
import { listMarketListings } from '@/lib/market';
import { listPeople } from '@/lib/people';
import { listOpportunities } from '@/lib/radar';
import { getFeaturedProviders } from '@/lib/search';

export const dynamic = 'force-dynamic';

const STATS = [
  { value: '10', label: 'régions' },
  { value: '360', label: 'communes' },
  { value: '8', label: 'univers' },
];

const PEOPLE_IMAGES = [
  '/images/afr-woman-2.jpg',
  '/images/afr-man-1.jpg',
  '/images/afr-woman-1.jpg',
  '/images/afr-man-3.jpg',
  '/images/afr-woman-4.jpg',
  '/images/afr-man-2.jpg',
  '/images/afr-woman-3.jpg',
  '/images/afr-doctor.jpg',
];

const FAMILY_IMAGES: Record<string, string> = {
  urgence_sante: '/images/afr-doctor.jpg',
  auto_moto: '/images/cat-auto.jpg',
  maison_construction: '/images/cat-logement.jpg',
  numerique_reseau: '/images/cat-emploi.jpg',
  famille_education: '/images/afr-woman-2.jpg',
  beaute_mode: '/images/afr-woman-1.jpg',
  evenements_restauration: '/images/cat-community.jpg',
  agriculture_elevage: '/images/cat-construction.jpg',
  administratif_juridique: '/images/afr-man-3.jpg',
  transport_livraison: '/images/cat-auto.jpg',
  autre: '/images/cat-market.jpg',
};

export default async function HomePage() {
  const [providers, listings, opportunities, groups, families, catalog, people] =
    await Promise.all([
      getFeaturedProviders(),
      listMarketListings({}),
      listOpportunities({}),
      listGroups({}),
      getFamilies(),
      getCatalog(),
      listPeople({}),
    ]);

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

          <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[54%] lg:block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/hero-africa.jpg"
              alt=""
              className="h-full w-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-navy-950 via-navy-950/35 to-transparent" />
            <p className="absolute right-8 top-10 max-w-[190px] rotate-[-5deg] text-right text-2xl font-black italic leading-tight text-cyan-200 drop-shadow-lg">
              Ensemble, connectons le monde !
            </p>
          </div>

          <div className="pointer-events-none absolute inset-0 -z-10 lg:hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/hero-africa.jpg"
              alt=""
              className="h-full w-full object-cover object-[65%_center] opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-navy-950/80 via-navy-950/85 to-navy-950" />
          </div>

          <div className="container-lc relative z-10 pb-6 pt-7 sm:pb-10 sm:pt-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-white/90 backdrop-blur sm:text-[10px]">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-400" />
              Everything. Everyone. Everywhere.
            </div>

            <h1 className="mt-3 max-w-2xl text-[2.05rem] font-black leading-[1.04] tracking-tight sm:mt-4 sm:text-6xl">
              Un besoin.
              <br />
              Une connexion.
              <br />
              <span className="text-teal-300">Une solution.</span>
            </h1>

            <p className="mt-2.5 max-w-xl text-xs leading-relaxed text-white/80 sm:mt-3 sm:text-base">
              Emploi, logement, services, produits, partenariats, communauté :
              trouve ce qu’il te faut, près de chez toi.
            </p>

            <div className="mt-5 max-w-2xl">
              <UniversalSearch tone="hero" />
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Link
                href="/match"
                className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-white px-5 text-sm font-bold text-navy-900 shadow-lift transition hover:bg-white/90"
              >
                <Icon name="search" size={18} />
                Trouver une solution
                <Icon name="chevronRight" size={16} />
              </Link>
              <Link
                href="/connect/nouveau"
                className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-white/35 bg-white/10 px-5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20"
              >
                <Icon name="send" size={18} />
                Publier un besoin
              </Link>
            </div>

            <div className="mt-5 flex flex-wrap gap-4 text-[11px] text-white/70">
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

        <section className="container-lc py-2">
          <div className="flex flex-col items-start justify-between gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-urgent-600 via-urgent-500 to-coral-500 p-4 text-white shadow-soft sm:flex-row sm:items-center sm:p-5">
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white/20 backdrop-blur">
                <Icon name="alert" size={26} />
              </span>
              <div>
                <p className="text-lg font-black">HELP ME</p>
                <p className="text-xs text-white/80">
                  Obtenez une assistance immédiate pour vos problèmes du
                  quotidien.
                </p>
              </div>
            </div>
            <Link
              href="/demande"
              className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-white px-4 text-xs font-black text-urgent-600 shadow-soft"
            >
              Demander de l’aide
              <Icon name="chevronRight" size={15} />
            </Link>
          </div>
        </section>

        <section className="container-lc py-5 sm:py-7">
          <div className="grid gap-4 lg:grid-cols-[1.65fr_1fr]">
            <div>
              <div className="flex items-end justify-between gap-3">
                <div>
                  <h2 className="text-xl font-black tracking-tight sm:text-2xl">
                    Services recommandés
                  </h2>
                  <p className="mt-1 text-sm text-muted">
                    Des professionnels vérifiés, près de chez vous.
                  </p>
                </div>
                <Link
                  href="/people"
                  className="text-xs font-bold text-teal-700 hover:underline dark:text-teal-300"
                >
                  Voir tout
                </Link>
              </div>

              {providers.length > 0 ? (
                <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                  {providers.slice(0, 4).map((provider, index) => (
                    <Link
                      key={provider.id}
                      href={`/prestataires/${provider.id}`}
                      className="group rounded-2xl border border-line bg-surface p-3 shadow-soft transition-all hover:-translate-y-0.5 hover:border-teal-500/30 hover:shadow-lift"
                    >
                      <div className="relative h-28 overflow-hidden rounded-xl bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-500/10 dark:to-cyan-500/10">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={provider.photo_url || PEOPLE_IMAGES[index % PEOPLE_IMAGES.length]}
                          alt=""
                          className="h-full w-full object-cover object-top"
                        />
                        <span className="absolute left-2 top-2 rounded-full bg-teal-600 px-2 py-0.5 text-[9px] font-black text-white">
                          Vérifié
                        </span>
                      </div>
                      <p className="mt-2 truncate text-sm font-black">
                        {provider.nom}
                      </p>
                      <p className="truncate text-[11px] text-muted">
                        {provider.metier_nom} · {provider.quartier}
                      </p>
                      <div className="mt-1.5 flex items-center justify-between gap-2">
                        <span className="text-[10px] text-muted">
                          ★ {provider.note_moyenne.toFixed(1)} ·{' '}
                          {provider.nombre_avis} avis
                        </span>
                        <span className="rounded-lg bg-teal-50 px-2 py-1 text-[10px] font-bold text-teal-700 dark:bg-teal-500/10 dark:text-teal-300">
                          Voir
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <EmptyState
                  className="mt-3"
                  icon="wrench"
                  title="Aucun prestataire dans cette zone pour le moment"
                  text="Les profils vérifiés apparaîtront ici dès les premières inscriptions. Vous pouvez déjà publier votre besoin."
                  href="/demande"
                  action="Publier un besoin"
                />
              )}
            </div>

            <div>
              <div className="flex items-end justify-between gap-3">
                <div>
                  <h2 className="text-xl font-black tracking-tight sm:text-2xl">
                    Annonces à découvrir
                  </h2>
                  <p className="mt-1 text-sm text-muted">Les dernières annonces.</p>
                </div>
                <Link
                  href="/market"
                  className="text-xs font-bold text-teal-700 hover:underline dark:text-teal-300"
                >
                  Voir tout
                </Link>
              </div>

              {listings[0] ? (
                <Link
                  href={`/market/${listings[0].id}`}
                  className="group mt-3 block overflow-hidden rounded-2xl border border-line bg-surface shadow-soft transition-all hover:-translate-y-0.5 hover:border-teal-500/30 hover:shadow-lift"
                >
                  <div className="relative h-36 bg-surface2">
                    {listings[0].image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={listings[0].image_url}
                        alt=""
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <span className="grid h-full place-items-center">
                        <Icon name="cart" size={34} className="text-muted" />
                      </span>
                    )}
                    <span className="absolute left-2 top-2 rounded-lg bg-orange-500 px-2 py-1 text-[9px] font-black uppercase text-white">
                      À vendre
                    </span>
                  </div>
                  <div className="p-3">
                    <p className="line-clamp-2 text-sm font-black">
                      {listings[0].title}
                    </p>
                    <p className="mt-1 text-lg font-black text-teal-600 dark:text-teal-300">
                      {listings[0].price_fcfa != null
                        ? formatFcfa(listings[0].price_fcfa)
                        : 'Prix à discuter'}
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-[10px] text-muted">
                      <Icon name="mapPin" size={12} />
                      {listings[0].city ?? 'Cameroun'}
                    </p>
                  </div>
                </Link>
              ) : (
                <EmptyState
                  className="mt-3"
                  icon="cart"
                  title="Soyez le premier à publier une annonce"
                  text="Les produits et services de votre région apparaîtront ici."
                  href="/market/nouveau"
                  action="Publier une annonce"
                />
              )}
            </div>
          </div>
        </section>

        {families.length > 0 ? (
          <section className="container-lc py-4 sm:py-6">
            <div className="flex items-end justify-between gap-3">
              <div>
                <h2 className="text-xl font-black tracking-tight sm:text-2xl">
                  Services populaires
                </h2>
                <p className="mt-1 text-sm text-muted">
                  Le catalogue HELP ME pour les besoins précis.
                </p>
              </div>
              <Link
                href="/aide"
                className="text-sm font-semibold text-teal-700 hover:underline dark:text-teal-300"
              >
                Tout voir
              </Link>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {families.slice(0, 8).map((family, index) => {
                const count = catalog.filter(
                  (category) => category.family_slug === family.slug,
                ).length;
                const images = [
                  '/images/cat-logement.jpg',
                  '/images/cat-auto.jpg',
                  '/images/afr-doctor.jpg',
                  '/images/cat-emploi.jpg',
                  '/images/cat-community.jpg',
                  '/images/cat-services.jpg',
                  '/images/cat-market.jpg',
                  '/images/hero-africa.jpg',
                ];

                return (
                  <Link
                    key={family.slug}
                    href={`/aide?famille=${family.slug}`}
                    className="group relative h-[132px] overflow-hidden rounded-2xl border border-line bg-navy-900 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={
                        FAMILY_IMAGES[family.slug] ??
                        images[index % images.length]
                      }
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <span className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-950/20 to-transparent" />
                    <span className="relative flex h-full flex-col justify-between p-3">
                      <span className="grid h-8 w-8 place-items-center rounded-xl bg-white/90 text-navy-900">
                        <Icon name={safeIcon(family.icon)} size={17} />
                      </span>
                      <span className="flex items-end justify-between gap-2">
                        <span className="min-w-0">
                          <span className="block truncate text-xs font-black text-white">
                            {family.nom_fr}
                          </span>
                          <span className="block text-[9px] text-white/70">
                            {count} service{count > 1 ? 's' : ''}
                          </span>
                        </span>
                        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/20 text-white">
                          <Icon name="chevronRight" size={13} />
                        </span>
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        ) : null}

        {people.length > 0 ? (
          <section className="container-lc py-4 sm:py-6">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-teal-600 dark:text-teal-300">
                  LIFE PEOPLE
                </p>
                <h2 className="mt-1 text-xl font-black tracking-tight sm:text-2xl">
                  Personnes recommandées
                </h2>
                <p className="mt-1 text-xs text-muted">
                  Découvrez des profils réels près de chez vous.
                </p>
              </div>
              <Link
                href="/people"
                className="shrink-0 text-xs font-bold text-teal-700 hover:underline dark:text-teal-300 sm:text-sm"
              >
                Annuaire
              </Link>
            </div>
            <div className="mt-3 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
              {people.slice(0, 4).map((person) => (
                <Link
                  key={person.id}
                  href={`/people/${person.id}`}
                  className="group flex min-h-[132px] flex-col justify-between rounded-2xl border border-line bg-surface p-3.5 shadow-soft transition active:scale-[0.99] sm:hover:-translate-y-0.5 sm:hover:border-teal-500/30 sm:hover:shadow-lift"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-full gradient-brand text-base font-black text-white">
                      {person.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={person.avatar_url}
                          alt=""
                          className="h-full w-full object-cover object-top"
                        />
                      ) : (
                        person.full_name.slice(0, 1).toUpperCase()
                      )}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black">
                        {person.full_name}
                      </p>
                      <p className="truncate text-[10px] capitalize text-muted">
                        {person.role}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1 text-[10px] text-muted">
                        <Icon name="mapPin" size={11} />
                        {person.city ?? 'Cameroun'}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span className="line-clamp-1 text-[10px] text-muted">
                      {person.bio || 'Membre LIFE CONNECT'}
                    </span>
                    <span className="shrink-0 rounded-lg bg-teal-50 px-2 py-1 text-[10px] font-bold text-teal-700 dark:bg-teal-500/10 dark:text-teal-300">
                      Voir profil
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {opportunities.length > 0 ? (
          <section className="container-lc py-4 sm:py-6">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-violet-500">
                  LIFE RADAR
                </p>
                <h2 className="mt-1 text-xl font-black tracking-tight sm:text-2xl">
                  Opportunités récentes
                </h2>
              </div>
              <Link
                href="/radar"
                className="text-sm font-semibold text-teal-700 hover:underline dark:text-teal-300"
              >
                Voir tout
              </Link>
            </div>
            <div className="scrollbar-none mt-3 flex gap-2.5 overflow-x-auto pb-1">
              {opportunities.slice(0, 5).map((opportunity) => (
                <Link
                  key={opportunity.id}
                  href="/radar"
                  className="min-w-[240px] flex-1 rounded-2xl border border-line bg-surface p-4 shadow-soft transition-colors hover:border-violet-500/30"
                >
                  <span className="inline-flex rounded-full bg-violet-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-violet-500">
                    {opportunity.kind}
                  </span>
                  <p className="mt-2 line-clamp-2 text-sm font-bold">
                    {opportunity.title}
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs text-muted">
                    {opportunity.description}
                  </p>
                  <p className="mt-2 flex items-center gap-1 text-[10px] text-muted">
                    <Icon name="mapPin" size={12} />
                    {opportunity.city ?? 'Cameroun'} ·{' '}
                    {formatDate(opportunity.created_at)}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {groups.length > 0 ? (
          <section className="container-lc py-4 sm:py-6">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-600">
                  LIFE COMMUNITY
                </p>
                <h2 className="mt-1 text-xl font-black tracking-tight sm:text-2xl">
                  Activités de votre communauté
                </h2>
              </div>
              <Link
                href="/community"
                className="text-sm font-semibold text-teal-700 hover:underline dark:text-teal-300"
              >
                Rejoindre
              </Link>
            </div>
            <div className="scrollbar-none mt-3 flex gap-2.5 overflow-x-auto pb-1">
              {groups.slice(0, 4).map((group) => (
                <Link
                  key={group.id}
                  href={`/community/${group.slug}`}
                  className="min-w-[230px] rounded-2xl border border-line bg-surface p-4 shadow-soft transition-colors hover:border-emerald-500/30"
                >
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                    <Icon name="users" size={18} />
                  </span>
                  <p className="mt-2 line-clamp-1 text-sm font-bold">
                    {group.name}
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs text-muted">
                    {group.description || 'Une communauté LIFE CONNECT.'}
                  </p>
                  <p className="mt-2 text-[10px] text-muted">
                    {group.city ?? 'Cameroun'} · {group.visibility === 'publique' ? 'Public' : 'Privé'}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {opportunities.length === 0 ? (
          <section className="container-lc py-4">
            <div className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-dashed border-line bg-surface p-5 sm:flex-row sm:items-center">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-violet-500">
                  LIFE RADAR
                </p>
                <p className="mt-1 text-sm font-bold">
                  Aucune opportunité pour l’instant
                </p>
                <p className="text-xs text-muted">
                  Publiez la première offre d’emploi, de stage ou de partenariat.
                </p>
              </div>
              <Link
                href="/radar/nouveau"
                className="inline-flex min-h-10 items-center rounded-xl gradient-violet px-3 text-xs font-bold text-white"
              >
                Publier une opportunité
              </Link>
            </div>
          </section>
        ) : null}

        {groups.length === 0 ? (
          <section className="container-lc py-4">
            <div className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-dashed border-line bg-surface p-5 sm:flex-row sm:items-center">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-600">
                  LIFE COMMUNITY
                </p>
                <p className="mt-1 text-sm font-bold">
                  Aucune communauté pour l’instant
                </p>
                <p className="text-xs text-muted">
                  Créez un groupe autour d’un métier, d’un quartier ou d’un projet.
                </p>
              </div>
              <Link
                href="/community/nouveau"
                className="inline-flex min-h-10 items-center rounded-xl bg-emerald-600 px-3 text-xs font-bold text-white"
              >
                Créer un groupe
              </Link>
            </div>
          </section>
        ) : null}

        <section className="container-lc py-4 sm:py-6">
          <div className="relative overflow-hidden rounded-3xl gradient-night p-5 text-white shadow-soft sm:p-7">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/douala.jpg"
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-35"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-navy-950 via-navy-950/80 to-navy-950/30" />
            <div className="absolute -right-8 -top-10 h-36 w-36 rounded-full bg-cyan-400/20 blur-2xl" />
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
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-line bg-surface p-4 shadow-soft">
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
            <div className="rounded-2xl border border-line bg-surface p-4 shadow-soft">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300">
                <Icon name="phone" size={18} />
              </span>
              <p className="mt-2 text-sm font-bold">Contact direct</p>
              <p className="mt-0.5 text-xs text-muted">
                Messagerie, téléphone ou WhatsApp.
              </p>
            </div>
            <div className="rounded-2xl border border-line bg-surface p-4 shadow-soft">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300">
                <Icon name="users" size={18} />
              </span>
              <p className="mt-2 text-sm font-bold">Communauté active</p>
              <p className="mt-0.5 text-xs text-muted">
                Des personnes et des groupes qui répondent réellement.
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
