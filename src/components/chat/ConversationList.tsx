import Link from 'next/link';

import { Icon } from '@/components/Icons';
import { formatDateTime } from '@/lib/format';
import type { ConversationRow } from '@/types/db';

export function ConversationList({
  conversations,
  currentUserId,
  activeId,
}: {
  conversations: ConversationRow[];
  currentUserId: string;
  activeId?: string;
}) {
  return (
    <div className="space-y-2">
      {conversations.map((conversation) => {
        const other =
          conversation.client_id === currentUserId
            ? conversation.provider_name
            : conversation.client_name;
        const active = conversation.id === activeId;

        return (
          <Link
            key={conversation.id}
            href={`/messages/${conversation.id}`}
            className={`flex items-start gap-3 rounded-2xl border p-3.5 transition-colors ${
              active
                ? 'border-teal-500/40 bg-teal-50/70 dark:bg-teal-500/10'
                : 'border-line bg-surface hover:border-teal-500/30'
            }`}
          >
            <span
              className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ${
                active ? 'gradient-brand text-white' : 'bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300'
              }`}
            >
              <Icon name="user" size={19} />
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
              <span className="mt-1 inline-flex rounded-full bg-surface2 px-2 py-0.5 text-[9px] font-semibold text-muted">
                {conversation.status === 'ouverte' ? 'En cours' : 'Clôturée'}
              </span>
            </span>
            <Icon name="chevronRight" size={15} className="mt-2 text-muted" />
          </Link>
        );
      })}
    </div>
  );
}
