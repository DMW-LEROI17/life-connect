import type { Metadata } from 'next';
import Link from 'next/link';

import { markAllNotificationsReadAction } from '@/actions/notifications';
import { Icon } from '@/components/Icons';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { requireUser } from '@/lib/auth-user';
import { formatDateTime } from '@/lib/format';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { NotificationRow } from '@/types/db';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Notifications',
  robots: { index: false, follow: false },
};

export default async function NotificationsPage() {
  const current = await requireUser('/notifications');
  const supabase = createSupabaseServerClient();

  const { data } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', current.user.id)
    .order('created_at', { ascending: false })
    .limit(100);

  const notifications = (data ?? []) as NotificationRow[];
  const unread = notifications.filter((item) => !item.is_read).length;

  return (
    <>
      <Header />
      <main id="contenu" className="container-lc max-w-2xl py-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-teal-600 dark:text-teal-300">
              ALERTES
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight">
              Notifications
            </h1>
            <p className="mt-1 text-sm text-muted">
              {unread > 0 ? `${unread} non lue(s)` : 'Tout est à jour.'}
            </p>
          </div>

          {unread > 0 ? (
            <form action={markAllNotificationsReadAction}>
              <Button type="submit" variant="outline" size="sm">
                <Icon name="check" size={16} />
                Tout marquer comme lu
              </Button>
            </form>
          ) : null}
        </div>

        {notifications.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-line bg-surface p-10 text-center">
            <p className="font-semibold">Aucune notification</p>
            <p className="mt-1 text-sm text-muted">
              Les messages, propositions et paiements apparaîtront ici.
            </p>
          </div>
        ) : (
          <div className="mt-5 space-y-2">
            {notifications.map((notification) => {
              const content = (
                <>
                  <span
                    className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${
                      notification.type === 'sos'
                        ? 'bg-urgent-50 text-urgent-600 dark:bg-urgent-500/10'
                        : 'bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300'
                    }`}
                  >
                    <Icon
                      name={notification.type === 'paiement' ? 'send' : 'alert'}
                      size={16}
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-semibold">
                        {notification.title}
                      </span>
                      {!notification.is_read ? (
                        <span className="h-2 w-2 shrink-0 rounded-full bg-teal-500" />
                      ) : null}
                    </span>
                    {notification.body ? (
                      <span className="mt-0.5 block text-xs text-muted">
                        {notification.body}
                      </span>
                    ) : null}
                    <span className="mt-1 block text-[10px] text-muted">
                      {formatDateTime(notification.created_at)}
                    </span>
                  </span>
                </>
              );

              return notification.link ? (
                <Link
                  key={notification.id}
                  href={notification.link}
                  className={`flex items-start gap-3 rounded-2xl border bg-surface p-3.5 ${
                    notification.is_read
                      ? 'border-line'
                      : 'border-teal-500/30'
                  }`}
                >
                  {content}
                </Link>
              ) : (
                <div
                  key={notification.id}
                  className={`flex items-start gap-3 rounded-2xl border bg-surface p-3.5 ${
                    notification.is_read
                      ? 'border-line'
                      : 'border-teal-500/30'
                  }`}
                >
                  {content}
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
