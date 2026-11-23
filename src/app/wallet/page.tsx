import type { Metadata } from 'next';
import Link from 'next/link';

import { Icon } from '@/components/Icons';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { WalletPanel } from '@/components/wallet/WalletPanel';
import { requireUser } from '@/lib/auth-user';
import { getWallet, getWalletTransactions } from '@/lib/wallet';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'LIFE WALLET',
  robots: { index: false, follow: false },
};

export default async function WalletPage() {
  const current = await requireUser('/wallet');
  const [wallet, transactions] = await Promise.all([
    getWallet(current.user.id),
    getWalletTransactions(current.user.id),
  ]);

  return (
    <>
      <Header />
      <main id="contenu" className="container-lc max-w-xl py-8">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-teal-600 dark:text-teal-300">
              LIFE WALLET
            </p>
            <h1 className="text-2xl font-bold tracking-tight">Mon portefeuille</h1>
          </div>
          <Link
            href="/compte"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink"
          >
            <Icon name="user" size={16} />
            Compte
          </Link>
        </div>

        <WalletPanel
          balance={Number(wallet.balance_fcfa)}
          transactions={transactions}
        />
      </main>
      <Footer />
    </>
  );
}
