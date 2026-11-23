'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { startConversationAction } from '@/actions/direct-chat';
import { Icon } from '@/components/Icons';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';

export function ContactButton({
  targetUserId,
  title,
  label = 'Contacter',
  className = '',
}: {
  targetUserId: string;
  title: string;
  label?: string;
  className?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function contact() {
    setLoading(true);
    setError('');
    const result = await startConversationAction(targetUserId, title);

    if (!result.ok) {
      setError(result.error);
      setLoading(false);
      return;
    }

    router.push(`/messages/${result.conversationId}`);
  }

  return (
    <div className={className}>
      <Button type="button" className="w-full" onClick={contact} disabled={loading}>
        {loading ? <Spinner /> : <Icon name="whatsapp" size={18} />}
        {label}
      </Button>
      {error ? (
        <p className="mt-1 text-[11px] text-urgent-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
