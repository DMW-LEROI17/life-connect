import type { Metadata } from 'next';
import Link from 'next/link';

import { SuggestionCard, type SuggestionItem } from '@/components/home/SuggestionCard';
import { Icon } from '@/components/Icons';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { formatDate } from '@/lib/format';
import { listGroups } from '@/lib/community';
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
  { value: '', label: 'Tout' },
  { value: 'services', label: 'Services' },
  { value: 'produits', label: 'Produits' },
  { value: 'emplois', label: 'Emplois' },
  { value: 'personnes', label: 'Personnes' },
  { value: 'opportunites', label: 'Opportunités' },
  { value: 'communautes', label: 'Communautés' },
];

export default async function ExplorerPage({
  searchParams,
}: {
  searchParams: { q?: string; type?: string };
}) {
  const q = searchParams.q?.trim() ?? '';
  const type = searchParams.type ?? '';
  const show = (key: string) => !type || type === key;

  const [providers, market, opportunities, groups, people] = await Promise.all([
    searchProviders({
      categorySlugs: [],
      regionId: null,
      keywords: q ? q.split(/\s+/).filter(Boolean) : [],
      limit: 24,
    }),
    listMarketListings({ q }),
    listOpportunities({ q }),
    listGroups({ q }),
    listPeople({ q }),
  ]);

  const suggestions: SuggestionItem[] = [
    ...market.slice(0, 8).map<SuggestionItem>((listing) => ({
      kind: 'market',
      listing,
    })),
    ...providers.slice(0, 8).map<SuggestionItem>((provider) => ({
      kind: 'provider',
      provider,
    })),
  ];

  function tabHref(value: string) {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (value) params.set('type', value);
    const query = params.toString();
    return query ? `/explorer?${query}` : '/explorer';
  }

  return (
    <>
      <Header />
      <main id="contenu" className="container-lc py-6 sm:py-8">
        <div className="rounded-3xl gradient-night p-5 text-white shadow-lift sm:p-7">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/60">
                Explorer
              </p>
              <h1 className="mt-1 text-3xl font-black tracking-tight">
                Tout LIFE CONNECT
              </h1>
              <p className="mt-1 max-w-xl text-sm text-white/70">
                Services, produits, emplois, personnes, opportunités et
                communautés réunis.
              </p>
            </div>
            <Link
              href="/publier"
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-4 text-sm font-bold text-teal-700"
            >
              <Icon name="plus" size={18} />
              Publier
            </Link>
          </div>

          <form action="/explorer" method="get" className="mt-5">
            <div className="flex items-center gap-2 rounded-2xl bg-white p-2 shadow-soft">
              <Icon name="search" size={20} className="ml-2 text-muted" />
              <input
                name="q"
                defaultValue={q}
                placeholder="Rechercher un service, un produit, un emploi…"
                className="min-h-10 w-full bg-transparent px-1 text-sm text-ink outline-none placeholder:text-muted"
                aria-label="Rechercher dans Explorer"
              />
              {type ? <input type="hidden" name="type" value={type} /> : null}
              <button
                type="submit"
                className="inline-flex min-h-10 shrink-0 items-center rounded-xl bg-teal-500 px-3 text-xs font-bold text-white"
              >
                Chercher
              </button>
            </div>
          </form>
        </div>

        <div className="scrollbar-none mt-4 flex gap-1.5 overflow-x-auto pb-1">
          {TABS.map((tab) => {
            const active = type === tab.value;
            return (
              <Link
                key={tab.value}
                href={tabHref(tab.value)}
                className={`shrink-0 rounded-full px-3.5 py-2 text-xs font-bold ${
                  active
                    ? 'gradient-brand text-white shadow-soft'
                    : 'border border-line bg-surface text-muted'
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>

        {show('services') && providers.length > 0 ? (
          <section className="mt-6">
            <SectionTitle title="Services" href="/people" />
            <div className="mt-3 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {providers.slice(0, 6).map((provider) => (
                <SuggestionCard
                  key={provider.id}
                  item={{ kind: 'provider', provider }}
                />
              ))}
            </div>
          </section>
        ) : null}

        {show('produits') && market.length > 0 ? (
          <section className="mt-6">
            <SectionTitle title="Produits" href="/market" />
            <div className="mt-3 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {suggestions
                .filter((item) => item.kind === 'market')
                .slice(0, 6)
                .map((item) => (
                  <SuggestionCard
                    key={item.kind === 'market' ? item.listing.id : ''}
                    item={item}
                  />
                ))}
            </div>
          </section>
        ) : null}

        {show('emplois') && opportunities.length > 0 ? (
          <section className="mt-6">
            <SectionTitle title="Emplois et opportunités" href="/radar" />
            <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
              {opportunities.slice(0, 6).map((opportunity) => (
                <article
                  key={opportunity.id}
                  className="rounded-2xl border border-line bg-surface p-4 shadow-soft"
                >
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-violet-500">
                      {opportunity.kind}
                    </span>
                    <span className="text-[10px] text-muted">
                      {formatDate(opportunity.created_at)}
                    </span>
                  </div>
                  <h3 className="mt-1 text-sm font-bold">{opportunity.title}</h3>
                  <p className="mt-1 line-clamp-2 text-xs text-muted">
                    {opportunity.description}
                  </p>
                  <p className="mt-2 flex items-center gap-1 text-[10px] text-muted">
                    <Icon name="mapPin" size={12} />
                    {opportunity.city ?? 'Cameroun'}
                  </p>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {show('personnes') && people.length > 0 ? (
          <section className="mt-6">
            <SectionTitle title="Personnes" href="/people" />
            <div className="mt-3 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {people.slice(0, 6).map((person) => (
                <Link
                  key={person.id}
                  href={`/people/${person.id}`}
                  className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-4 shadow-soft"
                >
                  <span className="grid h-11 w-11 place-items-center rounded-full gradient-brand text-sm font-black text-white">
                    {person.full_name
                      .split(/\s+/)
                      .slice(0, 2)
                      .map((part) => part[0]?.toUpperCase())
                      .join('')}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold">
                      {person.full_name}
                    </span>
                    <span className="block text-[11px] text-muted">
                      {person.city ?? 'Cameroun'}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {show('opportunites') && opportunities.length > 0 ? (
          <section className="mt-6">
            <SectionTitle title="Opportunités" href="/radar" />
            <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
              {opportunities.slice(0, 6).map((opportunity) => (
                <Link
                  key={opportunity.id}
                  href="/radar"
                  className="rounded-2xl border border-line bg-surface p-4 shadow-soft"
                >
                  <p className="text-sm font-bold">{opportunity.title}</p>
                  <p className="mt-1 text-xs text-muted">{opportunity.city}</p>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {show('communautes') && groups.length > 0 ? (
          <section className="mt-6">
            <SectionTitle title="Communautés" href="/community" />
            <div className="mt-3 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {groups.slice(0, 6).map((group) => (
                <Link
                  key={group.id}
                  href={`/community/${group.slug}`}
                  className="rounded-2xl border border-line bg-surface p-4 shadow-soft"
                >
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                    <Icon name="users" size={18} />
                  </span>
                  <p className="mt-2 text-sm font-bold">{group.name}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-muted">
                    {group.description || 'Communauté LIFE CONNECT'}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {providers.length === 0 &&
        market.length === 0 &&
        opportunities.length === 0 &&
        groups.length === 0 &&
        people.length === 0 ? (
          <div className="mt-6 rounded-3xl border border-dashed border-line bg-surface p-10 text-center">
            <p className="text-lg font-black">Rien à afficher pour le moment</p>
            <p className="mt-1 text-sm text-muted">
              Publiez la première annonce ou revenez après les premières
              inscriptions.
            </p>
            <Link
              href="/publier"
              className="mt-4 inline-flex min-h-11 items-center rounded-xl gradient-brand px-4 text-sm font-bold text-white"
            >
              Publier
            </Link>
          </div>
        ) : null}
      </main>
      <Footer />
    </>
  );
}

function SectionTitle({ title, href }: { title: string; href: string }) {
  return (
    <div className="flex items-end justify-between gap-3">
      <h2 className="text-lg font-black tracking-tight">{title}</h2>
      <Link
        href={href}
        className="text-xs font-semibold text-teal-700 hover:underline dark:text-teal-300"
      >
        Tout voir
      </Link>
    </div>
  );
}
