'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { Icon } from '@/components/Icons';

export function AccountMenu() {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const { createSupabaseBrowserClient } = await import(
          '@/lib/supabase/browser'
        );
        const supabase = createSupabaseBrowserClient();
        const { data } = await supabase.auth.getUser();

        if (!cancelled) setLoggedIn(Boolean(data.user));
      } catch {
        if (!cancelled) setLoggedIn(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loggedIn === null) {
    return <span className="h-10 w-10" aria-hidden="true" />;
  }

  return (
    <Link
      href={loggedIn ? '/compte' : '/connexion'}
      className="inline-flex min-h-10 items-center gap-1.5 rounded-xl px-2.5 text-sm font-medium text-muted transition-colors hover:bg-surface2 hover:text-ink"
    >
      <Icon name="user" size={18} />
      <span className="hidden sm:inline">
        {loggedIn ? 'Mon compte' : 'Connexion'}
      </span>
    </Link>
  );
}
