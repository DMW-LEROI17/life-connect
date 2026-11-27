'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { Icon } from '@/components/Icons';

export function NotificationBell() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let channel: any = null;

    async function load() {
      try {
        const { createSupabaseBrowserClient } = await import(
          '@/lib/supabase/browser'
        );
        const supabase = createSupabaseBrowserClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user || cancelled) return;

        const { count: unread } = await supabase
          .from('notifications')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('is_read', false);

        if (!cancelled) setCount(unread ?? 0);

        if (!channel) {
          channel = supabase
            .channel(`notifications-${user.id}`)
            .on(
              'postgres_changes',
              {
                event: '*',
                schema: 'public',
                table: 'notifications',
                filter: `user_id=eq.${user.id}`,
              },
              () => {
                void load();
              },
            )
            .subscribe();
        }
      } catch {
        // Table non installée ou session absente.
      }
    }

    void load();

    return () => {
      cancelled = true;
      if (channel) channel.unsubscribe();
    };
  }, []);

  return (
    <Link
      href="/notifications"
      className="relative grid h-10 w-10 place-items-center rounded-xl text-muted transition-colors hover:bg-surface2 hover:text-ink"
      aria-label="Notifications"
    >
      <Icon name="alert" size={19} />
      {count > 0 ? (
        <span className="absolute right-1 top-1 grid min-h-4 min-w-4 place-items-center rounded-full bg-urgent-500 px-1 text-[9px] font-bold text-white">
          {count > 9 ? '9+' : count}
        </span>
      ) : null}
    </Link>
  );
}
