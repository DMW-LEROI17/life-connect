'use client';

import { useState } from 'react';

import { Icon } from '@/components/Icons';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';

export function ShareLocationButton() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [message, setMessage] = useState('');

  function share(latitude?: number, longitude?: number) {
    const position =
      latitude != null && longitude != null
        ? `\nMa position : https://www.google.com/maps?q=${latitude},${longitude}`
        : '';

    const text = `J’ai besoin d’aide.${position}\nMessage envoyé depuis LIFE CONNECT – HELP ME (Cameroun).`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  function handleClick() {
    setStatus('loading');
    setMessage('');

    if (!('geolocation' in navigator)) {
      setStatus('error');
      setMessage('Géolocalisation indisponible : partage sans position.');
      share();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (result) => {
        setStatus('idle');
        share(result.coords.latitude, result.coords.longitude);
      },
      () => {
        setStatus('error');
        setMessage(
          'Position refusée. WhatsApp s’ouvre sans position : décrivez votre lieu.',
        );
        share();
      },
      { timeout: 8000, maximumAge: 60000, enableHighAccuracy: false },
    );
  }

  return (
    <div>
      <Button variant="outline" className="w-full" onClick={handleClick}>
        {status === 'loading' ? <Spinner /> : <Icon name="whatsapp" size={18} />}
        Envoyer ma position à un proche
      </Button>
      {message ? (
        <p className="mt-2 text-center text-xs text-muted" role="status">
          {message}
        </p>
      ) : null}
    </div>
  );
}
