'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type FormEvent } from 'react';

import {
  closeConversationAction,
  sendLocationAction,
  sendMessageAction,
} from '@/actions/chat';
import { Icon } from '@/components/Icons';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { formatTime } from '@/lib/format';
import { waLink } from '@/lib/whatsapp';
import type { ConversationRow, MessageRow } from '@/types/db';

export function ChatThread({
  conversation,
  initialMessages,
  currentUserId,
  otherName,
  otherPhone,
}: {
  conversation: ConversationRow;
  initialMessages: MessageRow[];
  currentUserId: string;
  otherName: string;
  otherPhone: string | null;
}) {
  const router = useRouter();
  const [messages, setMessages] = useState<MessageRow[]>(initialMessages);
  const [body, setBody] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [sending, setSending] = useState(false);
  const [locating, setLocating] = useState(false);
  const [closing, setClosing] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const closed = conversation.status === 'fermee';

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length]);

  useEffect(() => {
    let channel: any = null;
    let cancelled = false;

    async function subscribe() {
      try {
        const { createSupabaseBrowserClient } = await import(
          '@/lib/supabase/browser'
        );
        const supabase = createSupabaseBrowserClient();
        channel = supabase
          .channel(`chat-${conversation.id}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'messages',
              filter: `conversation_id=eq.${conversation.id}`,
            },
            (payload: { new: MessageRow }) => {
              setMessages((previous) =>
                previous.some((message) => message.id === payload.new.id)
                  ? previous
                  : [...previous, payload.new],
              );
            },
          )
          .subscribe();
      } catch {
        // Realtime indisponible : l’envoi reste fonctionnel.
      }
    }

    void subscribe();

    return () => {
      cancelled = true;
      if (channel) channel.unsubscribe();
    };
  }, [conversation.id]);

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setNotice('');

    if (!body.trim() && !file) return;

    setSending(true);
    const formData = new FormData();
    formData.set('body', body);
    if (file) formData.set('image', file);

    const result = await sendMessageAction(conversation.id, formData);

    if (!result.ok) {
      setError(result.error);
      setSending(false);
      return;
    }

    setBody('');
    setFile(null);
    setSending(false);
    router.refresh();
  }

  async function shareLocation() {
    setError('');
    setNotice('');
    setLocating(true);

    if (!('geolocation' in navigator)) {
      setError('Géolocalisation indisponible.');
      setLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const result = await sendLocationAction(
          conversation.id,
          position.coords.latitude,
          position.coords.longitude,
        );

        if (!result.ok) setError(result.error);
        else setNotice('Position partagée.');
        setLocating(false);
        router.refresh();
      },
      () => {
        setError('Position refusée.');
        setLocating(false);
      },
      { timeout: 8000, maximumAge: 60000, enableHighAccuracy: false },
    );
  }

  async function closeMission() {
    if (!window.confirm('Clôturer cette mission ? La conversation sera fermée.')) {
      return;
    }

    setClosing(true);
    const result = await closeConversationAction(conversation.id);

    if (!result.ok) {
      setError(result.error);
      setClosing(false);
      return;
    }

    router.refresh();
    setClosing(false);
  }

  return (
    <div className="flex min-h-[70vh] flex-col rounded-2xl border border-line bg-surface shadow-soft">
      <div className="flex items-center justify-between gap-2 border-b border-line p-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold">{otherName}</p>
          <p className="truncate text-[11px] text-muted">
            {conversation.post_title || 'Mission LIFE CONNECT'} ·{' '}
            {closed ? 'Clôturée' : 'En cours'}
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          {otherPhone ? (
            <>
              <a
                href={`tel:${otherPhone}`}
                className="grid h-9 w-9 place-items-center rounded-full border border-line text-ink"
                aria-label={`Appeler ${otherName}`}
              >
                <Icon name="phone" size={16} />
              </a>
              <a
                href={waLink(otherPhone, `Bonjour ${otherName}, je vous contacte via LIFE CONNECT.`)}
                target="_blank"
                rel="noreferrer"
                className="grid h-9 w-9 place-items-center rounded-full bg-[#25D366] text-[#04331A]"
                aria-label="WhatsApp"
              >
                <Icon name="whatsapp" size={16} />
              </a>
            </>
          ) : null}
          {!closed ? (
            <button
              type="button"
              onClick={closeMission}
              disabled={closing}
              className="rounded-full border border-urgent-500/30 px-2.5 py-1 text-[10px] font-semibold text-urgent-600"
            >
              {closing ? '…' : 'Clôturer'}
            </button>
          ) : null}
        </div>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto bg-bg/40 p-3">
        {messages.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted">
            Aucun message. Écrivez le premier.
          </p>
        ) : null}

        {messages.map((message) => {
          const mine = message.sender_id === currentUserId;

          if (message.kind === 'systeme') {
            return (
              <p
                key={message.id}
                className="mx-auto max-w-[85%] rounded-full bg-surface2 px-3 py-1.5 text-center text-[11px] text-muted"
              >
                {message.body}
              </p>
            );
          }

          return (
            <div
              key={message.id}
              className={`flex ${mine ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[82%] rounded-2xl px-3 py-2 text-sm ${
                  mine
                    ? 'rounded-br-md bg-teal-500 text-white'
                    : 'rounded-bl-md border border-line bg-surface text-ink'
                }`}
              >
                {message.kind === 'image' && message.attachment_url ? (
                  <a
                    href={message.attachment_url}
                    target="_blank"
                    rel="noreferrer"
                    className="block"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={message.attachment_url}
                      alt="Pièce jointe"
                      className="max-h-64 w-full rounded-xl object-cover"
                    />
                  </a>
                ) : null}

                {message.kind === 'localisation' &&
                message.latitude != null &&
                message.longitude != null ? (
                  <a
                    href={`https://www.google.com/maps?q=${message.latitude},${message.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className={`inline-flex items-center gap-1.5 text-sm font-semibold underline underline-offset-2 ${
                      mine ? 'text-white' : 'text-teal-700 dark:text-teal-300'
                    }`}
                  >
                    <Icon name="mapPin" size={15} />
                    Voir la position
                  </a>
                ) : null}

                {message.body ? (
                  <p className="whitespace-pre-line break-words">{message.body}</p>
                ) : null}

                <p
                  className={`mt-1 text-right text-[10px] ${
                    mine ? 'text-white/70' : 'text-muted'
                  }`}
                >
                  {formatTime(message.created_at)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {error ? (
        <p className="border-t border-urgent-500/20 bg-urgent-50 px-3 py-2 text-xs font-medium text-urgent-600 dark:bg-urgent-500/10" role="alert">
          {error}
        </p>
      ) : null}

      {notice ? (
        <p className="border-t border-teal-500/20 bg-teal-50 px-3 py-2 text-xs font-medium text-teal-800 dark:bg-teal-500/10 dark:text-teal-200">
          {notice}
        </p>
      ) : null}

      {closed ? (
        <div className="border-t border-line p-3 text-center text-sm text-muted">
          Cette mission est clôturée.{' '}
          <Link href="/connect" className="font-semibold text-teal-700 dark:text-teal-300">
            Voir les demandes
          </Link>
        </div>
      ) : (
        <form onSubmit={send} className="border-t border-line p-3">
          {file ? (
            <p className="mb-1 flex items-center justify-between text-[11px] text-muted">
              <span>{file.name}</span>
              <button type="button" onClick={() => setFile(null)} className="font-semibold text-urgent-600">
                Retirer
              </button>
            </p>
          ) : null}

          <div className="flex items-end gap-1.5">
            <label
              htmlFor="chat-image"
              className="grid h-10 w-10 cursor-pointer place-items-center rounded-xl border border-line text-muted hover:bg-surface2"
              aria-label="Joindre une image"
            >
              <Icon name="camera" size={18} />
            </label>
            <input
              id="chat-image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              className="sr-only"
            />

            <button
              type="button"
              onClick={shareLocation}
              disabled={locating}
              className="grid h-10 w-10 place-items-center rounded-xl border border-line text-muted hover:bg-surface2"
              aria-label="Partager ma position"
            >
              {locating ? <Spinner /> : <Icon name="mapPin" size={18} />}
            </button>

            <input
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder="Écrire un message…"
              maxLength={2000}
              className="input-lc h-10 flex-1 text-sm"
              aria-label="Message"
            />

            <Button type="submit" className="h-10 px-3" disabled={sending}>
              {sending ? <Spinner /> : <Icon name="send" size={18} />}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
