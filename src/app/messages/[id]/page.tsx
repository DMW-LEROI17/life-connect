import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { ChatThread } from '@/components/chat/ChatThread';
import { Icon } from '@/components/Icons';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { requireUser } from '@/lib/auth-user';
import { getConversationThread } from '@/lib/chat';

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
  const thread = await getConversationThread(params.id);

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
      <main id="contenu" className="container-lc max-w-2xl py-4 sm:py-6">
        <div className="mb-3 flex items-center justify-between gap-2">
          <Link
            href="/messages"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink"
          >
            <Icon name="arrowLeft" size={16} />
            Messages
          </Link>
          <Link
            href="/notifications"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-ink"
          >
            <Icon name="alert" size={14} />
            Alertes
          </Link>
        </div>

        <ChatThread
          conversation={conversation}
          initialMessages={messages}
          currentUserId={current.user.id}
          otherName={otherName}
          otherPhone={otherPhone}
        />
      </main>
      <Footer />
    </>
  );
}
