'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { setProviderStatus } from '@/actions/admin';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import type { ProviderStatus } from '@/types/db';

export function ProviderActions({
  providerId,
  statut,
}: {
  providerId: string;
  statut: ProviderStatus;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState('');

  async function change(next: 'valide' | 'refuse' | 'suspendu') {
    const labels: Record<typeof next, string> = {
      valide: 'Valider ce prestataire ?',
      refuse: 'Refuser ce prestataire ?',
      suspendu: 'Suspendre ce prestataire ?',
    };

    if (!window.confirm(labels[next])) return;

    setLoading(next);
    setError('');

    const result = await setProviderStatus(providerId, next);

    if (!result.ok) {
      setError(result.error);
      setLoading(null);
      return;
    }

    router.refresh();
    setLoading(null);
  }

  return (
    <div className="space-y-1">
      <div className="flex flex-wrap gap-1.5">
        {statut !== 'valide' ? (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => change('valide')}
            disabled={loading !== null}
          >
            {loading === 'valide' ? <Spinner /> : null}
            Valider
          </Button>
        ) : null}

        {statut !== 'refuse' ? (
          <Button
            size="sm"
            variant="outline"
            onClick={() => change('refuse')}
            disabled={loading !== null}
            className="text-urgent-600"
          >
            {loading === 'refuse' ? <Spinner /> : null}
            Refuser
          </Button>
        ) : null}

        {statut === 'valide' ? (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => change('suspendu')}
            disabled={loading !== null}
          >
            {loading === 'suspendu' ? <Spinner /> : null}
            Suspendre
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
