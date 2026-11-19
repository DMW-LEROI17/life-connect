'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { assignProvider } from '@/actions/admin';
import { Icon } from '@/components/Icons';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';

export function AssignButton({
  requestId,
  providerId,
  providerName,
  disabled = false,
}: {
  requestId: string;
  providerId: string;
  providerName: string;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function assign() {
    const confirmed = window.confirm(
      `Assigner ${providerName} ? Le client verra immédiatement ses coordonnées.`,
    );

    if (!confirmed) return;

    setLoading(true);
    setError('');

    const result = await assignProvider(requestId, providerId);

    if (!result.ok) {
      setError(result.error);
      setLoading(false);
      return;
    }

    router.refresh();
    setLoading(false);
  }

  return (
    <div className="space-y-1">
      <Button
        size="sm"
        variant="secondary"
        onClick={assign}
        disabled={loading || disabled}
        className="w-full"
      >
        {loading ? <Spinner /> : <Icon name="check" size={16} />}
        Assigner
      </Button>
      {error ? (
        <p className="text-[11px] font-medium text-urgent-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
