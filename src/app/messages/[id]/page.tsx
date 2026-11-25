import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { ChatThread } from '@/components/chat/ChatThread';
import { ConversationList } from '@/components/chat/ConversationList';
import { Icon } from '@/components/Icons';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { requireUser } from '@/lib/auth-user';
import { getConversations, getConversationThread } from '@/lib/chat';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Conversation',
  robots: { index: false, follow: false },
};

export default async function ConversationPage({
  params,
}: {
  params: { id: string };
}) {
  const current = await requireUser(`/messages/${params.id}`);
  const [thread, conversations] = await Promise.all([
    getConversationThread(params.id),
    getConversations(current.user.id),
  ]);

  if (!thread) notFound();

  const { conversation, messages } = thread;
  const isClient = conversation.client_id === current.user.id;
  const otherName = isClient
    ? conversation.provider_name
    : conversation.client_name;
  const otherPhone = isClient
    ? conversation.provider_phone
    : conversation.client_phone;

  return (
    <>
      <Header />
      <main id="contenu" className="container-lc max-w-5xl py-4 sm:py-6">
        <div className="mb-3 flex items-center justify-between gap-2">
          <Link
            href="/messages"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink lg:hidden"
          >
            <Icon name="arrowLeft" size={16} />
            Messages
          </Link>
          <Link
            href="/notifications"
            className="ml-auto inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-ink"
          >
            <Icon name="alert" size={14} />
            Alertes
          </Link>
        </div>

        <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
          <aside className="hidden rounded-3xl border border-line bg-surface p-3 shadow-soft lg:block">
            <div className="flex items-center justify-between px-1 pb-2">
              <p className="text-sm font-black">Conversations</p>
              <Link
                href="/messages"
                className="text-[10px] font-semibold text-teal-700 dark:text-teal-300"
              >
                Tout voir
              </Link>
            </div>
            {conversations.length > 0 ? (
              <ConversationList
                conversations={conversations}
                currentUserId={current.user.id}
                activeId={conversation.id}
              />
            ) : (
              <p className="p-3 text-xs text-muted">Aucune conversation.</p>
            )}
          </aside>

          <div className="min-w-0">
            <ChatThread
              conversation={conversation}
              initialMessages={messages}
              currentUserId={current.user.id}
              otherName={otherName}
              otherPhone={otherPhone}
            />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
