'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { markMarketListingSoldAction } from '@/actions/market';
import { Icon } from '@/components/Icons';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';

export function MarkSoldButton({ listingId }: { listingId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function mark() {
    setLoading(true);
    setError('');
    const result = await markMarketListingSoldAction(listingId);

    if (!result.ok) {
      setError(result.error);
      setLoading(false);
      return;
    }

    router.refresh();
  }

  return (
    <div>
      <Button type="button" variant="outline" className="w-full" onClick={mark} disabled={loading}>
        {loading ? <Spinner /> : <Icon name="check" size={18} />}
        Marquer comme vendu
      </Button>
      {error ? <p className="mt-1 text-[11px] text-urgent-600">{error}</p> : null}
    </div>
  );
}
