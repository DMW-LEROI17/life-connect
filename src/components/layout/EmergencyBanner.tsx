'use client';

import { useEffect, useState } from 'react';

import { Icon } from '@/components/Icons';

const STORAGE_KEY = 'lc-emergency-dismissed';

export function EmergencyBanner() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) === '1') setHidden(true);
    } catch {
      // Ignore : le bandeau reste visible.
    }
  }, []);

  function dismiss() {
    setHidden(true);
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      // Ignore.
    }
  }

  if (hidden) return null;

  return (
    <div className="border-b border-amber-500/30 bg-amber-50 text-amber-950 dark:bg-amber-500/10 dark:text-amber-100">
      <div className="container-lc flex items-start gap-3 py-2.5 text-xs sm:text-sm">
        <Icon name="alert" size={18} className="mt-0.5 shrink-0" />
        <p className="flex-1">
          <strong>Urgence vitale ?</strong> Appelez le 119 (ambulance), le 117
          (police) ou le 118 (pompiers). LIFE CONNECT ne remplace pas les
          secours.
        </p>
        <button
          type="button"
          onClick={dismiss}
          className="rounded-lg p-1 hover:bg-black/10"
          aria-label="Masquer le bandeau d’urgence"
        >
          <Icon name="close" size={16} />
        </button>
      </div>
    </div>
  );
}
