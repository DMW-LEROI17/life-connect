'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function AutoRefresh({ intervalMs = 15000 }: { intervalMs?: number }) {
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      if (!document.hidden) router.refresh();
    }, intervalMs);

    return () => clearInterval(interval);
  }, [intervalMs, router]);

  return null;
}
