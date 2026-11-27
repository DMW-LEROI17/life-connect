import Link from 'next/link';

import { EmergencyNumbers } from '@/components/emergency/EmergencyNumbers';
import { ModuleGrid } from '@/components/home/ModuleGrid';
import { SuggestionCard, type SuggestionItem } from '@/components/home/SuggestionCard';
import { UniversalSearch } from '@/components/home/UniversalSearch';
import { Icon, safeIcon } from '@/components/Icons';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { ButtonLink } from '@/components/ui/Button';
import { formatDate, formatFcfa } from '@/lib/format';
import { getCatalog, getFamilies } from '@/lib/catalog';
import { listGroups } from '@/lib/community';
import { listMarketListings } from '@/lib/market';
import { listOpportunities } from '@/lib/radar';
import { getFeaturedProviders } from '@/lib/search';

export const dynamic = 'force-dynamic';

const STATS = [
  { value: '10', label: 'régions' },
  { value: '360', label: 'communes' },
  { value: '8', label: 'univers' },
];

export default async function HomePage() {
  const [providers, listings, opportunities, groups, families, catalog] =
    await Promise.all([
      getFeaturedProviders(),
      listMarketListings({}),
      listOpportunities({}),
      listGroups({}),
      getFamilies(),
      getCatalog(),
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

          <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[54%] lg:block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/hero-people.jpg"
              alt=""
              className="h-full w-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-navy-950 via-navy-950/35 to-transparent" />
            <p className="absolute right-8 top-10 max-w-[190px] rotate-[-5deg] text-right text-2xl font-black italic leading-tight text-cyan-200 drop-shadow-lg">
              Ensemble, connectons le monde !
            </p>
          </div>

          <div className="container-lc relative z-10 pb-7 pt-8 sm:pb-10 sm:pt-12">
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
                  {providers.slice(0, 4).map((provider) => (
                    <Link
                      key={provider.id}
                      href={`/prestataires/${provider.id}`}
                      className="group rounded-2xl border border-line bg-surface p-3 shadow-soft transition-all hover:-translate-y-0.5 hover:border-teal-500/30 hover:shadow-lift"
                    >
                      <div className="relative h-24 overflow-hidden rounded-xl bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-500/10 dark:to-cyan-500/10">
                        {provider.photo_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={provider.photo_url}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="grid h-full w-full place-items-center text-3xl font-black text-teal-600 dark:text-teal-300">
                            {provider.nom
                              .split(/\s+/)
                              .slice(0, 2)
                              .map((part) => part[0]?.toUpperCase())
                              .join('')}
                          </span>
                        )}
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
                <div className="mt-3 rounded-2xl border border-dashed border-line p-6 text-sm text-muted">
                  Aucun prestataire pour le moment.{' '}
                  <Link href="/devenir-aideur" className="font-bold text-teal-700">
                    Inscrivez le premier.
                  </Link>
                </div>
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
                <div className="mt-3 rounded-2xl border border-dashed border-line p-6 text-sm text-muted">
                  Aucune annonce pour le moment.{' '}
                  <Link href="/market/nouveau" className="font-bold text-teal-700">
                    Publier.
                  </Link>
                </div>
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
              {families.slice(0, 8).map((family) => {
                const count = catalog.filter(
                  (category) => category.family_slug === family.slug,
                ).length;

                return (
                  <Link
                    key={family.slug}
                    href={`/aide?famille=${family.slug}`}
                    className="group flex items-center gap-3 rounded-2xl border border-line bg-surface p-3.5 shadow-soft transition-all hover:-translate-y-0.5 hover:border-teal-500/30 hover:shadow-lift"
                  >
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-teal-50 to-cyan-50 text-teal-700 dark:from-teal-500/10 dark:to-cyan-500/10 dark:text-teal-300">
                      <Icon name={safeIcon(family.icon)} size={20} />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-xs font-black text-ink">
                        {family.nom_fr}
                      </span>
                      <span className="block text-[10px] text-muted">
                        {count} service{count > 1 ? 's' : ''}
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        ) : null}

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

        {suggestions.length === 0 ? (
          <section className="container-lc py-5">
            <div className="rounded-3xl border border-dashed border-line bg-surface p-8 text-center">
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300">
                <Icon name="spark" size={26} />
              </span>
              <h2 className="mt-3 text-lg font-black">
                La plateforme démarre avec vous
              </h2>
              <p className="mx-auto mt-1 max-w-md text-sm text-muted">
                Aucune annonce pour le moment. Publiez la première et donnez le
                ton à votre communauté.
              </p>
              <ButtonLink href="/publier" className="mt-4">
                <Icon name="send" size={18} />
                Publier la première annonce
              </ButtonLink>
            </div>
          </section>
        ) : null}

        {providers.length > 0 ? (
          <section className="container-lc py-4 sm:py-6">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-teal-600 dark:text-teal-300">
                  LIFE PEOPLE
                </p>
                <h2 className="mt-1 text-xl font-black tracking-tight sm:text-2xl">
                  Personnes recommandées
                </h2>
              </div>
              <Link
                href="/people"
                className="text-sm font-semibold text-teal-700 hover:underline dark:text-teal-300"
              >
                Annuaire
              </Link>
            </div>
            <div className="mt-3 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
              {providers.slice(0, 4).map((provider) => (
                <Link
                  key={provider.id}
                  href={`/prestataires/${provider.id}`}
                  className="rounded-2xl border border-line bg-surface p-4 shadow-soft transition-colors hover:border-teal-500/30"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="grid h-10 w-10 place-items-center rounded-full gradient-brand text-xs font-black text-white">
                      {provider.nom
                        .split(/\s+/)
                        .slice(0, 2)
                        .map((part) => part[0]?.toUpperCase())
                        .join('')}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold">{provider.nom}</p>
                      <p className="truncate text-[10px] text-muted">
                        {provider.metier_nom} · {provider.quartier}
                      </p>
                    </div>
                  </div>
                  <p className="mt-2 text-[10px] text-muted">
                    ★ {provider.note_moyenne.toFixed(1)} · {provider.nombre_avis}{' '}
                    avis
                  </p>
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

        {listings.length > 0 ? (
          <section className="container-lc py-4 sm:py-6">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-coral-500">
                  LIFE MARKET
                </p>
                <h2 className="mt-1 text-xl font-black tracking-tight sm:text-2xl">
                  Annonces à découvrir
                </h2>
              </div>
              <Link
                href="/market"
                className="text-sm font-semibold text-teal-700 hover:underline dark:text-teal-300"
              >
                Voir tout
              </Link>
            </div>
            <div className="mt-3 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
              {listings.slice(0, 4).map((listing) => (
                <Link
                  key={listing.id}
                  href={`/market/${listing.id}`}
                  className="overflow-hidden rounded-2xl border border-line bg-surface shadow-soft transition-colors hover:border-coral-500/30"
                >
                  <div className="grid h-28 place-items-center bg-surface2">
                    {listing.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={listing.image_url}
                        alt=""
                        className="h-28 w-full object-cover"
                      />
                    ) : (
                      <Icon name="cart" size={30} className="text-muted" />
                    )}
                  </div>
                  <div className="p-3">
                    <p className="line-clamp-2 text-xs font-bold">
                      {listing.title}
                    </p>
                    <p className="mt-1 text-sm font-black text-teal-600 dark:text-teal-300">
                      {listing.price_fcfa != null
                        ? `${new Intl.NumberFormat('fr-FR').format(listing.price_fcfa)} FCFA`
                        : 'Prix à discuter'}
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-[10px] text-muted">
                      <Icon name="mapPin" size={11} />
                      {listing.city ?? 'Cameroun'}
                    </p>
                  </div>
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
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-600 via-teal-500 to-sky-500 p-5 text-white shadow-soft sm:p-7">
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
