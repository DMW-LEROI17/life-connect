'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import {
  completeMissionAction,
  updateProviderLocationAction,
} from '@/actions/tracking';
import { Icon } from '@/components/Icons';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';

export function MissionTools({
  token,
  clientPhone,
}: {
  token: string;
  clientPhone: string;
}) {
  const router = useRouter();
  const [locating, setLocating] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  function shareLocation() {
    setError('');
    setNotice('');
    setLocating(true);

    if (!('geolocation' in navigator)) {
      setError('Géolocalisation indisponible sur cet appareil.');
      setLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const result = await updateProviderLocationAction(
          token,
          position.coords.latitude,
          position.coords.longitude,
        );

        if (!result.ok) {
          setError(result.error ?? 'Position non envoyée.');
        } else {
          setNotice('Position envoyée. Le client la voit sur sa carte.');
        }

        setLocating(false);
        router.refresh();
      },
      () => {
        setError('Position refusée. Autorisez la géolocalisation.');
        setLocating(false);
      },
      { timeout: 8000, maximumAge: 0, enableHighAccuracy: true },
    );
  }

  async function complete() {
    if (!window.confirm('Marquer la mission comme terminée ?')) return;

    setCompleting(true);
    setError('');
    const result = await completeMissionAction(token);

    if (!result.ok) {
      setError(result.error ?? 'Clôture impossible.');
    } else {
      setNotice('Mission terminée. Merci.');
    }

    setCompleting(false);
    router.refresh();
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-2">
        <a
          href={`tel:${clientPhone}`}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-teal-500 px-4 text-sm font-semibold text-white"
        >
          <Icon name="phone" size={18} />
          Appeler le client
        </a>
        <a
          href={`https://wa.me/${clientPhone.replace(/\D/g, '')}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-4 text-sm font-bold text-[#04331A]"
        >
          <Icon name="whatsapp" size={18} />
          WhatsApp
        </a>
      </div>

      <Button
        type="button"
        className="w-full"
        onClick={shareLocation}
        disabled={locating}
      >
        {locating ? <Spinner /> : <Icon name="mapPin" size={18} />}
        Partager ma position en direct
      </Button>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={complete}
        disabled={completing}
      >
        {completing ? <Spinner /> : <Icon name="check" size={18} />}
        Marquer la mission terminée
      </Button>

      {notice ? (
        <p className="rounded-xl border border-teal-500/30 bg-teal-50 p-3 text-sm font-medium text-teal-800 dark:bg-teal-500/10 dark:text-teal-200">
          {notice}
        </p>
      ) : null}

      {error ? (
        <p className="rounded-xl border border-urgent-500/30 bg-urgent-50 p-3 text-sm font-medium text-urgent-600 dark:bg-urgent-500/10">
          {error}
        </p>
      ) : null}
    </div>
  );
}
