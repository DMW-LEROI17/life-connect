'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { closePostAction } from '@/actions/posts';
import { Icon } from '@/components/Icons';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';

export function ClosePostButton({ postId }: { postId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function close() {
    if (!window.confirm('Clôturer cette publication ?')) return;
    setLoading(true);
    const result = await closePostAction(postId);

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
      <Button variant="outline" size="sm" onClick={close} disabled={loading}>
        {loading ? <Spinner /> : <Icon name="close" size={14} />}
        Clôturer
      </Button>
      {error ? (
        <p className="mt-1 text-[11px] text-urgent-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
