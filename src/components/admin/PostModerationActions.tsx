'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { setPostHidden } from '@/actions/admin';
import { Icon } from '@/components/Icons';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';

export function PostModerationActions({
  postId,
  hidden,
}: {
  postId: string;
  hidden: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function toggle() {
    if (
      !window.confirm(
        hidden ? 'Rendre cette publication visible ?' : 'Masquer cette publication ?',
      )
    ) {
      return;
    }

    setLoading(true);
    setError('');
    const result = await setPostHidden(postId, !hidden);

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
        variant={hidden ? 'outline' : 'ghost'}
        size="sm"
        onClick={toggle}
        disabled={loading}
        className={hidden ? '' : 'text-urgent-600'}
      >
        {loading ? <Spinner /> : <Icon name="shield" size={14} />}
        {hidden ? 'Rendre visible' : 'Masquer'}
      </Button>
      {error ? (
        <p className="text-[11px] text-urgent-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
