'use client';

import { useState } from 'react';

import { cancelRequest } from '@/actions/cancel-request';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';

export function CancelButton({
  token,
  onCancelled,
}: {
  token: string;
  onCancelled: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleCancel() {
    if (
      !window.confirm(
        'Annuler votre demande ? Les prestataires ne seront plus alertés.',
      )
    ) {
      return;
    }

    setLoading(true);
    setError('');

    const result = await cancelRequest(token);

    if (!result.ok) {
      setError(result.error);
      setLoading(false);
      return;
    }

    onCancelled();
  }

  return (
    <div className="space-y-2">
      <Button
        variant="ghost"
        className="w-full text-muted"
        onClick={handleCancel}
        disabled={loading}
      >
        {loading ? <Spinner /> : null}
        Annuler ma demande
      </Button>
      {error ? (
        <p className="text-center text-xs font-medium text-urgent-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
