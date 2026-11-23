import type { Metadata } from 'next';

import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminTabs } from '@/components/admin/AdminTabs';
import { UserActions } from '@/components/admin/UserActions';
import { SetupNotice } from '@/components/SetupNotice';
import { Badge } from '@/components/ui/Badge';
import { requireAdmin } from '@/lib/auth';
import { isSupabaseConfigured } from '@/lib/config';
import { ROLE_LABELS } from '@/lib/constants';
import { formatDate } from '@/lib/format';
import { getAdminStats, getPendingProviderCount } from '@/lib/queries';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Utilisateurs',
  robots: { index: false, follow: false },
};

export default async function AdminUsersPage() {
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
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200);

  const users = (data ?? []) as Array<Record<string, unknown>>;

  return (
    <div className="min-h-dvh bg-bg">
      <AdminHeader />
      <main id="contenu" className="container-lc py-6">
        <h1 className="text-2xl font-bold tracking-tight">Utilisateurs</h1>
        <p className="text-sm text-muted">
          Comptes particuliers, professionnels, commerçants et entreprises.
        </p>

        <AdminTabs
          active="users"
          pendingRequests={stats.en_attente}
          pendingProviders={pendingProviders}
        />

        {users.length === 0 ? (
          <p className="mt-5 rounded-2xl border border-dashed border-line bg-surface p-8 text-center text-sm text-muted">
            Aucun utilisateur. Vérifiez que la migration V3 est exécutée.
          </p>
        ) : (
          <div className="mt-4 space-y-2">
            {users.map((user) => (
              <div
                key={String(user.id)}
                className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-line bg-surface p-3"
              >
                <div>
                  <p className="text-sm font-semibold">
                    {String(user.full_name || 'Sans nom')}
                  </p>
                  <p className="text-[11px] text-muted">
                    {String(user.email ?? '')} ·{' '}
                    {ROLE_LABELS[String(user.role)] ?? String(user.role)} ·{' '}
                    {formatDate(String(user.created_at))}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {user.is_suspended ? (
                    <Badge className="border-urgent-500/30 bg-urgent-50 text-urgent-600">
                      Suspendu
                    </Badge>
                  ) : (
                    <Badge className="border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                      Actif
                    </Badge>
                  )}
                  <UserActions
                    userId={String(user.id)}
                    suspended={Boolean(user.is_suspended)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
