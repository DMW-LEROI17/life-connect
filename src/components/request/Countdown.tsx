'use client';

import { useEffect, useState } from 'react';

const TOTAL_MS = 5 * 60 * 1000;

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
  const percent = Math.max(0, Math.min(100, (remaining / TOTAL_MS) * 100));
  const urgent = remaining <= 60000;

  return (
    <span className="block w-full tabular-nums">
      <span className={urgent ? 'text-urgent-600' : ''}>
        {minutes}:{String(seconds).padStart(2, '0')}
      </span>
      <span className="mt-1 block h-1.5 w-full overflow-hidden rounded-full bg-surface2">
        <span
          className={`block h-full rounded-full transition-[width] duration-1000 ${
            urgent ? 'bg-urgent-500' : 'bg-teal-500'
          }`}
          style={{ width: `${percent}%` }}
        />
      </span>
    </span>
  );
}
