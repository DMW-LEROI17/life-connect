'use client';

import { useEffect, useState } from 'react';

import { Icon } from '@/components/Icons';

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'));
    setMounted(true);
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    try {
      localStorage.setItem('lc-theme', next ? 'dark' : 'light');
    } catch {
      // Le stockage local peut être bloqué : le thème reste appliqué pour la session.
    }
  }

  if (!mounted) {
    return <span className="h-10 w-10" aria-hidden="true" />;
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-surface text-muted transition-colors hover:text-ink"
      aria-label={dark ? 'Activer le thème clair' : 'Activer le thème sombre'}
      title={dark ? 'Thème clair' : 'Thème sombre'}
    >
      <Icon name={dark ? 'sun' : 'moon'} size={18} />
    </button>
  );
}
