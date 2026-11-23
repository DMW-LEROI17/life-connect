import type { Metadata } from 'next';

import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminTabs } from '@/components/admin/AdminTabs';
import { WalletAdminActions } from '@/components/admin/WalletAdminActions';
import { SetupNotice } from '@/components/SetupNotice';
import { Badge } from '@/components/ui/Badge';
import { requireAdmin } from '@/lib/auth';
import { isSupabaseConfigured } from '@/lib/config';
import { formatFcfa } from '@/lib/format';
import { getAdminStats, getPendingProviderCount } from '@/lib/queries';
import { getAdminWalletTransactions } from '@/lib/wallet';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Paiements',
  robots: { index: false, follow: false },
};

export default async function AdminPaymentsPage() {
  await requireAdmin();

  if (!isSupabaseConfigured()) {
    return (
      <>
        <AdminHeader />
        <SetupNotice />
      </>
    );
  }

  const [stats, pendingProviders, transactions] = await Promise.all([
    getAdminStats(),
    getPendingProviderCount(),
    getAdminWalletTransactions(),
  ]);

  return (
    <div className="min-h-dvh bg-bg">
      <AdminHeader />
      <main id="contenu" className="container-lc py-6">
        <h1 className="text-2xl font-bold tracking-tight">Paiements</h1>
        <p className="text-sm text-muted">
          Recharges et retraits en attente. Confirmez uniquement après réception
          réelle du paiement mobile.
        </p>

        <AdminTabs
          active="payments"
          pendingRequests={stats.en_attente}
          pendingProviders={pendingProviders}
        />

        {transactions.length === 0 ? (
          <p className="mt-5 rounded-2xl border border-dashed border-line bg-surface p-8 text-center text-sm text-muted">
            Aucune transaction. Vérifiez que la migration V4 est exécutée.
          </p>
        ) : (
          <div className="mt-4 space-y-2">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-line bg-surface p-3"
              >
                <div>
                  <p className="text-sm font-semibold">
                    {transaction.type === 'recharge' ? 'Recharge' : 'Retrait'}{' '}
                    · {formatFcfa(transaction.amount)}
                  </p>
                  <p className="text-[11px] text-muted">
                    {transaction.profiles?.full_name ??
                      transaction.profiles?.email ??
                      transaction.user_id}{' '}
                    · {transaction.provider} · {transaction.status}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Badge
                    className={
                      transaction.status === 'en_attente'
                        ? 'border-amber-500/30 bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300'
                        : transaction.status === 'confirme'
                          ? 'border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
                          : 'border-line bg-surface2 text-muted'
                    }
                  >
                    {transaction.status}
                  </Badge>
                  {transaction.status === 'en_attente' ? (
                    <WalletAdminActions transactionId={transaction.id} />
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
