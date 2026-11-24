import type { Metadata } from 'next';

import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminRequestFilters } from '@/components/admin/AdminRequestFilters';
import { AdminTabs } from '@/components/admin/AdminTabs';
import { AutoRefresh } from '@/components/admin/AutoRefresh';
import { RequestsTable } from '@/components/admin/RequestsTable';
import { StatCards } from '@/components/admin/StatCards';
import { Icon } from '@/components/Icons';
import { SetupNotice } from '@/components/SetupNotice';
import { requireAdmin } from '@/lib/auth';
import { isSupabaseConfigured } from '@/lib/config';
import { getCatalog } from '@/lib/catalog';
import {
  getAdminRegionStats,
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

  const [stats, requests, pendingProviders, regionStats, catalog] =
    await Promise.all([
      getAdminStats(),
      listAdminRequests({ statut, categorie, q }),
      getPendingProviderCount(),
      getAdminRegionStats(),
      getCatalog(),
    ]);

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
              Suivez et traitez les demandes en cours. Actualisation automatique
              toutes les 5 s.
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

        <AdminRequestFilters categories={catalog} />

        <RequestsTable rows={requests} />

        {regionStats.length > 0 ? (
          <section className="mt-6">
            <h2 className="text-sm font-bold">
              Demandes par région — 30 derniers jours
            </h2>
            <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
              {regionStats.map((region) => (
                <div
                  key={region.region_nom}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line bg-surface px-3 py-2 text-xs"
                >
                  <span className="font-semibold">{region.region_nom}</span>
                  <span className="text-muted">
                    {region.total} demandes · {region.en_attente} en attente ·{' '}
                    {region.urgentes} urgences
                  </span>
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </main>

      <AutoRefresh />
    </div>
  );
}
