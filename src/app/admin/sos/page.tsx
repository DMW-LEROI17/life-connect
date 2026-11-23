import type { Metadata } from 'next';
import Link from 'next/link';

import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminTabs } from '@/components/admin/AdminTabs';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { SetupNotice } from '@/components/SetupNotice';
import { Badge } from '@/components/ui/Badge';
import { requireAdmin } from '@/lib/auth';
import { isSupabaseConfigured } from '@/lib/config';
import { formatCmPhone } from '@/lib/phone';
import { formatDateTime } from '@/lib/format';
import { getAdminStats, getPendingProviderCount } from '@/lib/queries';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Alertes SOS',
  robots: { index: false, follow: false },
};

export default async function AdminSosPage() {
  await requireAdmin();

  if (!isSupabaseConfigured()) {
    return (
      <>
        <AdminHeader />
        <SetupNotice />
      </>
    );
  }

  const [stats, pendingProviders] = await Promise.all([
    getAdminStats(),
    getPendingProviderCount(),
  ]);

  const admin = getSupabaseAdmin();
  const { data } = await admin
    .from('requests')
    .select('id, token, probleme, quartier, region_nom, tel_client, statut, cree_le, is_emergency, needs_transport')
    .eq('is_emergency', true)
    .order('cree_le', { ascending: false })
    .limit(100);

  const alerts = (data ?? []) as Array<Record<string, unknown>>;

  return (
    <div className="min-h-dvh bg-bg">
      <AdminHeader />
      <main id="contenu" className="container-lc py-6">
        <h1 className="text-2xl font-bold tracking-tight">Alertes SOS</h1>
        <p className="text-sm text-muted">
          Demandes marquées urgentes, y compris les demandes de transport.
        </p>

        <AdminTabs
          active="sos"
          pendingRequests={stats.en_attente}
          pendingProviders={pendingProviders}
        />

        {alerts.length === 0 ? (
          <p className="mt-5 rounded-2xl border border-dashed border-line bg-surface p-8 text-center text-sm text-muted">
            Aucune alerte SOS enregistrée.
          </p>
        ) : (
          <div className="mt-4 space-y-2">
            {alerts.map((alert) => (
              <Link
                key={String(alert.id)}
                href={`/admin/demandes/${alert.id}`}
                className="block rounded-2xl border border-urgent-500/30 bg-surface p-3 hover:bg-urgent-50/40 dark:hover:bg-urgent-500/5"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="border-urgent-500/40 bg-urgent-500 text-white">
                    SOS
                  </Badge>
                  <StatusBadge statut={alert.statut as never} />
                  <span className="text-[11px] text-muted">
                    {formatDateTime(String(alert.cree_le))}
                  </span>
                </div>
                <p className="mt-1 text-sm font-semibold">
                  {String(alert.probleme)}
                </p>
                <p className="text-[11px] text-muted">
                  {String(alert.quartier)} · {String(alert.region_nom ?? '')} ·{' '}
                  {formatCmPhone(String(alert.tel_client))}
                  {alert.needs_transport ? ' · transport demandé' : ''}
                </p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
