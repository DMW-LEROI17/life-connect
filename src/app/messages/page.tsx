import type { Metadata } from 'next';
import Link from 'next/link';

import { Icon } from '@/components/Icons';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { requireUser } from '@/lib/auth-user';
import { getConversations } from '@/lib/chat';
import { formatDateTime } from '@/lib/format';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Messages',
  robots: { index: false, follow: false },
};

export default async function MessagesPage() {
  const current = await requireUser('/messages');
  const conversations = await getConversations(current.user.id);

  return (
    <>
      <Header />
      <main id="contenu" className="container-lc max-w-2xl py-8">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-teal-600 dark:text-teal-300">
              LIFE CHAT
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight">Messages</h1>
            <p className="mt-1 text-sm text-muted">
              Vos échanges avec les clients et prestataires.
            </p>
          </div>
          <Link
            href="/notifications"
            className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-line bg-surface px-3 text-xs font-semibold"
          >
            <Icon name="alert" size={15} />
            Alertes
          </Link>
        </div>

        {conversations.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-line bg-surface p-10 text-center">
            <p className="font-semibold">Aucune conversation</p>
            <p className="mt-1 text-sm text-muted">
              Une conversation s’ouvre automatiquement lorsqu’une proposition est acceptée.
            </p>
            <Link
              href="/connect"
              className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-teal-500 px-4 text-sm font-semibold text-white"
            >
              Voir les demandes
            </Link>
          </div>
        ) : (
          <div className="mt-5 space-y-2">
            {conversations.map((conversation) => {
              const other =
                conversation.client_id === current.user.id
                  ? conversation.provider_name
                  : conversation.client_name;

              return (
                <Link
                  key={conversation.id}
                  href={`/messages/${conversation.id}`}
                  className="flex items-start gap-3 rounded-2xl border border-line bg-surface p-4 shadow-soft transition-colors hover:border-teal-500/40"
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300">
                    <Icon name="user" size={20} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-bold">{other}</span>
                      <span className="shrink-0 text-[10px] text-muted">
                        {formatDateTime(conversation.last_message_at)}
                      </span>
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-muted">
                      {conversation.post_title || 'Mission LIFE CONNECT'}
                    </span>
                    <span className="mt-1 inline-flex rounded-full bg-surface2 px-2 py-0.5 text-[10px] font-semibold text-muted">
                      {conversation.status === 'ouverte' ? 'En cours' : 'Clôturée'}
                    </span>
                  </span>
                  <Icon name="chevronRight" size={16} className="mt-2 text-muted" />
                </Link>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
