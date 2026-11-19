'use client';

import { useEffect, useState } from 'react';

export function Countdown({ expireLe }: { expireLe: string }) {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    function update() {
      setRemaining(Math.max(0, new Date(expireLe).getTime() - Date.now()));
    }

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [expireLe]);

  if (remaining === null) {
    return <span className="tabular-nums">5:00</span>;
  }

  const minutes = Math.floor(remaining / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);

  return (
    <span className="tabular-nums">
      {minutes}:{String(seconds).padStart(2, '0')}
    </span>
  );
}
