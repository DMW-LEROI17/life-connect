import type { Metadata } from 'next';
import Link from 'next/link';

import { Icon } from '@/components/Icons';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { EmptyState } from '@/components/ui/EmptyState';
import { listGroups } from '@/lib/community';
import { formatDate, formatFcfa } from '@/lib/format';
import { listMarketListings } from '@/lib/market';
import { listPeople } from '@/lib/people';
import { listOpportunities } from '@/lib/radar';
import { searchProviders } from '@/lib/search';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Explorer — LIFE CONNECT',
  description:
    'Explorez les services, produits, emplois, personnes, opportunités et communautés de LIFE CONNECT.',
};

const TABS = [
  { value: '', label: 'Tout', icon: 'grid' as const },
  { value: 'services', label: 'Services', icon: 'wrench' as const },
  { value: 'produits', label: 'Produits', icon: 'cart' as const },
  { value: 'emplois', label: 'Emplois', icon: 'briefcase' as const },
  { value: 'personnes', label: 'Personnes', icon: 'user' as const },
  { value: 'opportunites', label: 'Opportunités', icon: 'trophy' as const },
  { value: 'communautes', label: 'Communautés', icon: 'users' as const },
];

const PORTRAITS = [
  '/images/afr-woman-2.jpg',
  '/images/afr-man-1.jpg',
  '/images/afr-woman-1.jpg',
  '/images/afr-man-3.jpg',
  '/images/afr-woman-4.jpg',
];

function portraitFor(id: string) {
  return PORTRAITS[id.charCodeAt(0) % PORTRAITS.length];
}

export default async function ExplorerPage({
  searchParams,
}: {
  searchParams: {
    q?: string;
    type?: string;
    city?: string;
    condition?: string;
  };
}) {
  const q = searchParams.q?.trim() ?? '';
  const type = TABS.some((tab) => tab.value === searchParams.type)
    ? (searchParams.type ?? '')
    : '';
  const city = searchParams.city?.trim() ?? '';
  const condition = searchParams.condition?.trim() ?? '';

  const [providers, market, opportunities, groups, people] = await Promise.all([
    searchProviders({
      categorySlugs: [],
      regionId: null,
      city: city || undefined,
      keywords: q ? q.split(/\s+/).filter(Boolean) : [],
      limit: 24,
    }),
    listMarketListings({
      q,
      city: city || undefined,
      condition: condition || undefined,
    }),
    listOpportunities({ q, city: city || undefined }),
    listGroups({ q, city: city || undefined }),
    listPeople({ q, city: city || undefined }),
  ]);

  const counts: Record<string, number> = {
    services: providers.length,
    produits: market.length,
    emplois: opportunities.length,
    personnes: people.length,
    opportunites: opportunities.length,
    communautes: groups.length,
  };
  const total =
    providers.length + market.length + opportunities.length + people.length + groups.length;
  const activeCount = type ? (counts[type] ?? 0) : total;
  const show = (key: string) => !type || type === key;
  const limit = type ? 12 : 4;
  const filtersActive = Boolean(q || city || condition);

  function tabHref(value: string) {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (city) params.set('city', city);
    if (condition) params.set('condition', condition);
    if (value) params.set('type', value);
    const query = params.toString();
    return query ? `/explorer?${query}` : '/explorer';
  }

  return (
    <>
      <Header />
      <main id="contenu" className="container-lc py-4 sm:py-7">
        <section className="relative overflow-hidden rounded-[1.5rem] gradient-night p-4 text-white shadow-lift sm:rounded-3xl sm:p-6">
          <div className="absolute -right-10 -top-12 h-36 w-36 rounded-full bg-cyan-400/25 blur-2xl" />
          <div className="relative flex items-start justify-between gap-3">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-white/55">
                Explorer
              </p>
              <h1 className="mt-1 text-[1.7rem] font-black leading-tight tracking-tight sm:text-3xl">
                Tout LIFE CONNECT, près de vous.
              </h1>
              <p className="mt-1 max-w-lg text-xs text-white/70 sm:text-sm">
                Services, produits, emplois, personnes et communautés vérifiés.
              </p>
            </div>
            <Link
              href="/publier"
              className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-xl bg-white px-3 text-xs font-black text-teal-700 shadow-soft active:scale-[0.98]"
            >
              <Icon name="plus" size={16} />
              <span className="hidden sm:inline">Publier</span>
            </Link>
          </div>

          <form action="/explorer" method="get" className="relative mt-4">
            <div className="flex items-center gap-1.5 rounded-2xl bg-white p-1.5 shadow-soft">
              <Icon name="search" size={19} className="ml-1.5 shrink-0 text-muted" />
              <input
                name="q"
                defaultValue={q}
                placeholder="Rechercher un service, un produit, un emploi…"
                className="min-h-10 w-full min-w-0 bg-transparent px-1 text-sm text-ink outline-none placeholder:text-muted"
                aria-label="Rechercher dans Explorer"
              />
              <input
                name="city"
                defaultValue={city}
                placeholder="Ville"
                className="hidden min-h-10 w-24 rounded-xl bg-surface2 px-2.5 text-xs text-ink outline-none placeholder:text-muted sm:block"
                aria-label="Ville"
              />
              {type ? <input type="hidden" name="type" value={type} /> : null}
              {condition ? (
                <input type="hidden" name="condition" value={condition} />
              ) : null}
              <button
                type="submit"
                className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-xl gradient-brand px-3 text-xs font-black text-white active:scale-[0.98]"
              >
                <Icon name="search" size={15} />
                <span className="hidden sm:inline">Chercher</span>
              </button>
            </div>
          </form>

          <details className="group relative mt-2">
            <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 rounded-lg px-1 py-1.5 text-[11px] font-bold text-white/75 [&::-webkit-details-marker]:hidden">
              <Icon name="grid" size={14} />
              Filtres
              {filtersActive ? (
                <span className="grid h-4 min-w-4 place-items-center rounded-full bg-cyan-300 px-1 text-[9px] font-black text-navy-950">
                  actifs
                </span>
              ) : null}
              <Icon
                name="chevronRight"
                size={13}
                className="transition-transform group-open:rotate-90"
              />
            </summary>
            <form
              action="/explorer"
              method="get"
              className="mt-2 grid gap-2 rounded-2xl border border-white/15 bg-white/10 p-2.5 backdrop-blur sm:grid-cols-[1fr_150px_auto]"
            >
              {q ? <input type="hidden" name="q" value={q} /> : null}
              {type ? <input type="hidden" name="type" value={type} /> : null}
              <input
                name="city"
                defaultValue={city}
                placeholder="Ville ou quartier"
                className="min-h-10 rounded-xl border border-white/20 bg-white px-3 text-xs text-ink outline-none placeholder:text-muted"
                aria-label="Filtrer par ville"
              />
              <select
                name="condition"
                defaultValue={condition}
                className="min-h-10 rounded-xl border border-white/20 bg-white px-3 text-xs text-ink outline-none"
                aria-label="Filtrer par état"
              >
                <option value="">Tous les états</option>
                <option value="neuf">Neuf</option>
                <option value="occasion">Occasion</option>
                <option value="service">Service</option>
              </select>
              <button
                type="submit"
                className="min-h-10 rounded-xl bg-white px-4 text-xs font-black text-teal-700"
              >
                Appliquer
              </button>
            </form>
          </details>
        </section>

        <div className="scrollbar-none -mx-4 mt-3 flex snap-x gap-1.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
          {TABS.map((tab) => {
            const active = type === tab.value;
            const count = tab.value ? (counts[tab.value] ?? 0) : total;
            return (
              <Link
                key={tab.value}
                href={tabHref(tab.value)}
                aria-current={active ? 'page' : undefined}
                className={`inline-flex min-h-9 shrink-0 snap-start items-center gap-1.5 rounded-full px-3 text-[11px] font-bold transition active:scale-[0.98] ${
                  active
                    ? 'gradient-brand text-white shadow-soft'
                    : 'border border-line bg-surface text-muted'
                }`}
              >
                <Icon name={tab.icon} size={13} />
                {tab.label}
                <span
                  className={`rounded-full px-1 text-[9px] font-black ${
                    active ? 'bg-white/20 text-white' : 'bg-surface2 text-muted'
                  }`}
                >
                  {count}
                </span>
              </Link>
            );
          })}
        </div>

        <div className="mt-3 flex items-center justify-between gap-2">
          <p className="text-[11px] font-semibold text-muted">
            {activeCount} résultat{activeCount > 1 ? 's' : ''}
            {city ? ` à ${city}` : ''}
          </p>
          {filtersActive ? (
            <Link
              href="/explorer"
              className="text-[11px] font-bold text-teal-700 underline-offset-2 hover:underline dark:text-teal-300"
            >
              Réinitialiser
            </Link>
          ) : null}
        </div>

        {show('services') && providers.length > 0 ? (
          <section className="mt-4">
            <SectionTitle
              title="Services"
              subtitle="Des professionnels vérifiés près de vous."
              href="/people"
            />
            <div className="mt-2.5 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {providers.slice(0, limit).map((provider) => (
                <Link
                  key={provider.id}
                  href={`/prestataires/${provider.id}`}
                  className="group overflow-hidden rounded-2xl border border-line bg-surface shadow-soft transition active:scale-[0.99] sm:hover:-translate-y-0.5 sm:hover:border-teal-500/30 sm:hover:shadow-lift"
                >
                  <div className="relative h-32 overflow-hidden bg-teal-50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={provider.photo_url || portraitFor(provider.id)}
                      alt=""
                      className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    />
                    <span className="absolute left-2 top-2 rounded-full bg-teal-600 px-2 py-0.5 text-[9px] font-black text-white">
                      Vérifié
                    </span>
                  </div>
                  <div className="p-3">
                    <p className="truncate text-sm font-black">{provider.nom}</p>
                    <p className="truncate text-[11px] text-muted">
                      {provider.metier_nom ?? provider.metier} · {provider.quartier}
                    </p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span className="text-[10px] font-semibold text-amber-600">
                        ★ {provider.note_moyenne.toFixed(1)} ({provider.nombre_avis})
                      </span>
                      <span className="rounded-lg bg-teal-50 px-2 py-1 text-[9px] font-bold text-teal-700 dark:bg-teal-500/10 dark:text-teal-300">
                        Voir
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {show('produits') && market.length > 0 ? (
          <section className="mt-5">
            <SectionTitle
              title="Produits"
              subtitle="Les annonces réelles de la communauté."
              href="/market"
            />
            <div className="mt-2.5 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
              {market.slice(0, limit).map((listing) => (
                <Link
                  key={listing.id}
                  href={`/market/${listing.id}`}
                  className="group overflow-hidden rounded-2xl border border-line bg-surface shadow-soft transition active:scale-[0.99] sm:hover:-translate-y-0.5 sm:hover:shadow-lift"
                >
                  <div className="relative h-28 overflow-hidden bg-surface2 sm:h-32">
                    {listing.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={listing.image_url}
                        alt=""
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <span className="grid h-full place-items-center">
                        <Icon name="cart" size={28} className="text-muted" />
                      </span>
                    )}
                    <span className="absolute left-1.5 top-1.5 rounded-md bg-orange-500 px-1.5 py-0.5 text-[8px] font-black uppercase text-white">
                      {listing.condition === 'service' ? 'Service' : 'Vente'}
                    </span>
                  </div>
                  <div className="p-2.5">
                    <p className="line-clamp-2 text-xs font-bold leading-snug">
                      {listing.title}
                    </p>
                    <p className="mt-1 text-sm font-black text-teal-600 dark:text-teal-300">
                      {listing.price_fcfa != null
                        ? formatFcfa(listing.price_fcfa)
                        : 'Prix à discuter'}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1 truncate text-[9px] text-muted">
                      <Icon name="mapPin" size={10} />
                      {listing.city ?? 'Cameroun'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {show('emplois') && opportunities.length > 0 ? (
          <section className="mt-5">
            <SectionTitle
              title="Emplois & opportunités"
              subtitle="Offres d’emploi, stages et projets."
              href="/radar"
            />
            <div className="mt-2.5 grid gap-2.5 sm:grid-cols-2">
              {opportunities.slice(0, limit).map((opportunity) => (
                <Link
                  key={opportunity.id}
                  href="/radar"
                  className="rounded-2xl border border-line bg-surface p-4 shadow-soft transition active:scale-[0.99] sm:hover:-translate-y-0.5 sm:hover:shadow-lift"
                >
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[9px] font-black uppercase text-violet-500">
                      {opportunity.kind}
                    </span>
                    <span className="text-[10px] text-muted">
                      {formatDate(opportunity.created_at)}
                    </span>
                  </div>
                  <p className="mt-1.5 line-clamp-2 text-sm font-black">
                    {opportunity.title}
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">
                    {opportunity.description}
                  </p>
                  <p className="mt-2 flex items-center gap-1 text-[10px] text-muted">
                    <Icon name="mapPin" size={11} />
                    {opportunity.city ?? 'Cameroun'}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {show('personnes') && people.length > 0 ? (
          <section className="mt-5">
            <SectionTitle
              title="Personnes"
              subtitle="Des profils réels dans votre région."
              href="/people"
            />
            <div className="mt-2.5 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {people.slice(0, limit).map((person) => (
                <Link
                  key={person.id}
                  href={`/people/${person.id}`}
                  className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-3 shadow-soft transition active:scale-[0.99] sm:hover:shadow-lift"
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full gradient-brand text-xs font-black text-white">
                    {person.full_name.slice(0, 1).toUpperCase()}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold">
                      {person.full_name}
                    </span>
                    <span className="block truncate text-[10px] text-muted">
                      {person.bio || person.role} · {person.city ?? 'Cameroun'}
                    </span>
                  </span>
                  <Icon name="chevronRight" size={15} className="ml-auto shrink-0 text-muted" />
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {show('communautes') && groups.length > 0 ? (
          <section className="mt-5">
            <SectionTitle
              title="Communautés"
              subtitle="Groupes, entraide et partage."
              href="/community"
            />
            <div className="mt-2.5 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {groups.slice(0, limit).map((group) => (
                <Link
                  key={group.id}
                  href={`/community/${group.slug}`}
                  className="rounded-2xl border border-line bg-surface p-4 shadow-soft transition active:scale-[0.99] sm:hover:shadow-lift"
                >
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                    <Icon name="users" size={17} />
                  </span>
                  <p className="mt-2 text-sm font-black">{group.name}</p>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">
                    {group.description || 'Communauté LIFE CONNECT'}
                  </p>
                  <p className="mt-2 text-[10px] text-muted">
                    {group.city ?? 'Cameroun'}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {activeCount === 0 ? (
          <div className="mt-4">
            <EmptyState
              icon="search"
              title={
                filtersActive
                  ? 'Aucun résultat pour ces filtres'
                  : type === 'services'
                    ? 'Aucun prestataire dans cette zone pour le moment'
                    : 'Soyez le premier à publier ici'
              }
              text={
                filtersActive
                  ? 'Essayez une autre ville, un autre mot-clé ou réinitialisez les filtres.'
                  : 'La communauté se construit. Publiez une annonce ou créez votre profil prestataire.'
              }
              href={type === 'services' ? '/devenir-aideur' : '/publier'}
              action={type === 'services' ? 'Devenir prestataire' : 'Publier'}
            />
            {filtersActive ? (
              <Link
                href="/explorer"
                className="mt-2 flex min-h-11 items-center justify-center text-xs font-bold text-teal-700 dark:text-teal-300"
              >
                Réinitialiser les filtres
              </Link>
            ) : null}
          </div>
        ) : null}
      </main>
      <Footer />
    </>
  );
}

function SectionTitle({
  title,
  subtitle,
  href,
}: {
  title: string;
  subtitle: string;
  href: string;
}) {
  return (
    <div className="flex items-end justify-between gap-3">
      <div>
        <h2 className="text-base font-black tracking-tight sm:text-lg">{title}</h2>
        <p className="mt-0.5 text-[10px] text-muted sm:text-xs">{subtitle}</p>
      </div>
      <Link
        href={href}
        className="shrink-0 text-[11px] font-bold text-teal-700 hover:underline dark:text-teal-300"
      >
        Tout voir
      </Link>
    </div>
  );
}
