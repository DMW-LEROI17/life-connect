'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { setUserSuspended } from '@/actions/admin';
import { Icon } from '@/components/Icons';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';

export function UserActions({
  userId,
  suspended,
}: {
  userId: string;
  suspended: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function toggle() {
    if (
      !window.confirm(
        suspended
          ? 'Réactiver ce compte ?'
          : 'Suspendre ce compte ? Il ne pourra plus publier ni répondre.',
      )
    ) {
      return;
    }

    setLoading(true);
    setError('');
    const result = await setUserSuspended(userId, !suspended);

    if (!result.ok) {
      setError(result.error);
      setLoading(false);
      return;
    }

    router.refresh();
    setLoading(false);
  }

  return (
    <div>
      <Button
        variant={suspended ? 'outline' : 'ghost'}
        size="sm"
        onClick={toggle}
        disabled={loading}
        className={suspended ? '' : 'text-urgent-600'}
      >
        {loading ? <Spinner /> : <Icon name="shield" size={14} />}
        {suspended ? 'Réactiver' : 'Suspendre'}
      </Button>
      {error ? (
        <p className="text-[11px] text-urgent-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
