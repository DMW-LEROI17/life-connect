'use client';

import { useEffect, useState } from 'react';

export function UnreadBadge() {
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
            .channel(`badge-${user.id}`)
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
        // Pas de session / table notifications absente.
      }
    }

    void load();

    return () => {
      cancelled = true;
      if (channel) channel.unsubscribe();
    };
  }, []);

  if (count <= 0) return null;

  return (
    <span className="ml-1 inline-grid min-h-4 min-w-4 place-items-center rounded-full bg-urgent-500 px-1 text-[9px] font-black leading-none text-white">
      {count > 9 ? '9+' : count}
    </span>
  );
}
