import type { Metadata } from 'next';
import Link from 'next/link';

import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminTabs } from '@/components/admin/AdminTabs';
import { AutoRefresh } from '@/components/admin/AutoRefresh';
import { RequestsTable } from '@/components/admin/RequestsTable';
import { StatCards } from '@/components/admin/StatCards';
import { Icon } from '@/components/Icons';
import { SetupNotice } from '@/components/SetupNotice';
import { requireAdmin } from '@/lib/auth';
import { isSupabaseConfigured } from '@/lib/config';
import { CATEGORIES, STATUS_LABELS } from '@/lib/constants';
import {
  getAdminStats,
  getPendingProviderCount,
  listAdminRequests,
} from '@/lib/queries';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Tableau de bord',
  robots: { index: false, follow: false },
};

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  await requireAdmin();

  if (!isSupabaseConfigured()) {
    return (
      <>
        <AdminHeader />
        <SetupNotice />
      </>
    );
  }

  const statut = first(searchParams.statut);
  const categorie = first(searchParams.categorie);
  const q = first(searchParams.q);

  try {
    await getSupabaseAdmin().rpc('expire_stale_requests');
  } catch (error) {
    console.error('[expire_stale_requests]', error);
  }

  const [stats, requests, pendingProviders] = await Promise.all([
    getAdminStats(),
    listAdminRequests({ statut, categorie, q }),
    getPendingProviderCount(),
  ]);

  const hasFilters = Boolean(statut || categorie || q);

  return (
    <div className="min-h-dvh bg-bg">
      <AdminHeader />

      <main id="contenu" className="container-lc py-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Tableau de bord
            </h1>
            <p className="text-sm text-muted">
              Suivez et traitez les demandes en cours.
            </p>
          </div>

          <a
            href="/api/admin/export"
            className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-line bg-surface px-3 text-xs font-semibold hover:bg-surface2"
          >
            <Icon name="download" size={16} />
            Exporter en CSV
          </a>
        </div>

        <StatCards stats={stats} />

        <AdminTabs
          active="requests"
          pendingRequests={stats.en_attente}
          pendingProviders={pendingProviders}
        />

        <form
          method="get"
          action="/admin"
          className="mt-4 flex flex-wrap items-center gap-2"
        >
          <select
            name="statut"
            defaultValue={statut ?? ''}
            className="select-lc h-10 w-auto min-w-40 text-sm"
            aria-label="Filtrer par statut"
          >
            <option value="">Tous les statuts</option>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          <select
            name="categorie"
            defaultValue={categorie ?? ''}
            className="select-lc h-10 w-auto min-w-40 text-sm"
            aria-label="Filtrer par catégorie"
          >
            <option value="">Toutes les catégories</option>
            {CATEGORIES.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.label}
              </option>
            ))}
          </select>

          <input
            name="q"
            defaultValue={q ?? ''}
            placeholder="Téléphone, quartier, problème"
            className="input-lc h-10 w-full text-sm sm:w-64"
            aria-label="Rechercher"
          />

          <button
            type="submit"
            className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-navy-900 px-4 text-xs font-semibold text-white dark:bg-white dark:text-navy-900"
          >
            <Icon name="search" size={16} />
            Filtrer
          </button>

          {hasFilters ? (
            <Link
              href="/admin"
              className="text-xs font-medium text-muted underline underline-offset-2 hover:text-ink"
            >
              Réinitialiser
            </Link>
          ) : null}
        </form>

        <RequestsTable rows={requests} />
      </main>

      <AutoRefresh />
    </div>
  );
}
