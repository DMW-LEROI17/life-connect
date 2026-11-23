'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import {
  cancelWalletTransactionAction,
  confirmWalletTransactionAction,
} from '@/actions/admin-wallet';
import { Icon } from '@/components/Icons';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';

export function WalletAdminActions({
  transactionId,
}: {
  transactionId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState('');

  async function run(
    key: string,
    action: () => Promise<{ ok: boolean; error?: string }>,
  ) {
    setLoading(key);
    setError('');
    const result = await action();

    if (!result.ok) {
      setError(result.error ?? 'Action impossible.');
      setLoading(null);
      return;
    }

    router.refresh();
    setLoading(null);
  }

  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        <Button
          size="sm"
          onClick={() =>
            run('confirm', () => confirmWalletTransactionAction(transactionId))
          }
          disabled={loading !== null}
        >
          {loading === 'confirm' ? <Spinner /> : <Icon name="check" size={14} />}
          Confirmer
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() =>
            run('cancel', () => cancelWalletTransactionAction(transactionId))
          }
          disabled={loading !== null}
          className="text-urgent-600"
        >
          {loading === 'cancel' ? <Spinner /> : <Icon name="close" size={14} />}
          Annuler
        </Button>
      </div>
      {error ? (
        <p className="mt-1 text-[11px] text-urgent-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
