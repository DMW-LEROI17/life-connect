import type { Metadata } from 'next';
import Link from 'next/link';

import { ConversationList } from '@/components/chat/ConversationList';
import { Icon } from '@/components/Icons';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { requireUser } from '@/lib/auth-user';
import { getConversations } from '@/lib/chat';

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
      <main id="contenu" className="container-lc max-w-2xl py-5 sm:py-8">
        <div className="rounded-3xl gradient-night p-5 text-white shadow-lift">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/60">
                LIFE CHAT
              </p>
              <h1 className="mt-1 text-3xl font-black tracking-tight">Messages</h1>
              <p className="mt-1 text-sm text-white/70">
                Vos échanges avec les clients et prestataires.
              </p>
            </div>
            <Link
              href="/notifications"
              className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-white/10 px-3 text-xs font-bold text-white backdrop-blur"
            >
              <Icon name="alert" size={15} />
              Alertes
            </Link>
          </div>
        </div>

        {conversations.length === 0 ? (
          <div className="mt-5 rounded-3xl border border-dashed border-line bg-surface p-10 text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300">
              <Icon name="whatsapp" size={26} />
            </span>
            <p className="mt-3 font-black">Aucune conversation</p>
            <p className="mt-1 text-sm text-muted">
              Une conversation s’ouvre automatiquement lorsqu’une proposition
              est acceptée.
            </p>
            <Link
              href="/connect"
              className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl gradient-brand px-4 text-sm font-bold text-white"
            >
              Voir les demandes
            </Link>
          </div>
        ) : (
          <div className="mt-4">
            <ConversationList
              conversations={conversations}
              currentUserId={current.user.id}
            />
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
