'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import {
  acceptProposalAction,
  refuseProposalAction,
  withdrawProposalAction,
} from '@/actions/posts';
import { Icon } from '@/components/Icons';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';

export function ProposalActions({
  proposalId,
  canDecide,
  canWithdraw,
}: {
  proposalId: string;
  canDecide: boolean;
  canWithdraw: boolean;
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
    <div className="mt-2 space-y-1">
      <div className="flex flex-wrap gap-1.5">
        {canDecide ? (
          <>
            <Button
              size="sm"
              onClick={() =>
                run('accept', () => acceptProposalAction(proposalId))
              }
              disabled={loading !== null}
            >
              {loading === 'accept' ? <Spinner /> : <Icon name="check" size={14} />}
              Accepter
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                run('refuse', () => refuseProposalAction(proposalId))
              }
              disabled={loading !== null}
            >
              {loading === 'refuse' ? <Spinner /> : <Icon name="close" size={14} />}
              Refuser
            </Button>
          </>
        ) : null}

        {canWithdraw ? (
          <Button
            size="sm"
            variant="ghost"
            onClick={() =>
              run('withdraw', () => withdrawProposalAction(proposalId))
            }
            disabled={loading !== null}
          >
            {loading === 'withdraw' ? <Spinner /> : null}
            Retirer ma réponse
          </Button>
        ) : null}
      </div>

      {error ? (
        <p className="text-[11px] font-medium text-urgent-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
