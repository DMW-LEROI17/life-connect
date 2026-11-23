import type { Metadata } from 'next';
import Link from 'next/link';

import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminTabs } from '@/components/admin/AdminTabs';
import { CategoryManager } from '@/components/admin/CategoryManager';
import { SetupNotice } from '@/components/SetupNotice';
import { requireAdmin } from '@/lib/auth';
import { getCatalog, getFamilies } from '@/lib/catalog';
import { isSupabaseConfigured } from '@/lib/config';
import { getAdminStats, getPendingProviderCount } from '@/lib/queries';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Catégories et services',
  robots: { index: false, follow: false },
};

export default async function AdminCategoriesPage() {
  await requireAdmin();

  if (!isSupabaseConfigured()) {
    return (
      <>
        <AdminHeader />
        <SetupNotice />
      </>
    );
  }

  const [families, catalog, stats, pendingProviders] = await Promise.all([
    getFamilies(),
    getCatalog({ includeInactive: true }),
    getAdminStats(),
    getPendingProviderCount(),
  ]);

  return (
    <div className="min-h-dvh bg-bg">
      <AdminHeader />

      <main id="contenu" className="container-lc py-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Catégories et services
            </h1>
            <p className="text-sm text-muted">
              Ajoutez, renommez ou désactivez les services sans toucher au code.
            </p>
          </div>
          <Link
            href="/aide"
            className="inline-flex min-h-10 items-center rounded-xl border border-line bg-surface px-3 text-xs font-semibold hover:bg-surface2"
          >
            Voir le catalogue public
          </Link>
        </div>

        <AdminTabs
          active="categories"
          pendingRequests={stats.en_attente}
          pendingProviders={pendingProviders}
        />

        <CategoryManager families={families} catalog={catalog} />
      </main>
    </div>
  );
}
