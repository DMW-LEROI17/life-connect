'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { updateRequestStatus } from '@/actions/admin';
import { Icon } from '@/components/Icons';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';

export function RequestStatusActions({
  requestId,
  statut,
}: {
  requestId: string;
  statut: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<'resolue' | 'annulee' | null>(null);
  const [error, setError] = useState('');

  async function change(next: 'resolue' | 'annulee') {
    const label =
      next === 'resolue' ? 'Marquer cette demande comme résolue ?' : 'Annuler cette demande ?';

    if (!window.confirm(label)) return;

    setLoading(next);
    setError('');

    const result = await updateRequestStatus(requestId, next);

    if (!result.ok) {
      setError(result.error);
      setLoading(null);
      return;
    }

    router.refresh();
    setLoading(null);
  }

  if (statut === 'resolue' || statut === 'annulee') {
    return null;
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => change('resolue')}
          disabled={loading !== null}
        >
          {loading === 'resolue' ? (
            <Spinner />
          ) : (
            <Icon name="check" size={16} />
          )}
          Marquer résolue
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => change('annulee')}
          disabled={loading !== null}
          className="text-urgent-600"
        >
          {loading === 'annulee' ? <Spinner /> : <Icon name="close" size={16} />}
          Annuler la demande
        </Button>
      </div>

      {error ? (
        <p className="text-xs font-medium text-urgent-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
