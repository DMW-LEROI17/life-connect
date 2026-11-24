'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';

import { createSosAlertAction } from '@/actions/sos';
import { Icon } from '@/components/Icons';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Spinner } from '@/components/ui/Spinner';

export function SosPanel({ defaultPhone }: { defaultPhone: string }) {
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [geoState, setGeoState] = useState<'idle' | 'loading' | 'ok' | 'error'>(
    'idle',
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [token, setToken] = useState<string | null>(null);

  function locate() {
    setGeoState('loading');

    if (!('geolocation' in navigator)) {
      setGeoState('error');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (result) => {
        setPosition({
          lat: result.coords.latitude,
          lng: result.coords.longitude,
        });
        setGeoState('ok');
      },
      () => setGeoState('error'),
      { timeout: 8000, enableHighAccuracy: true, maximumAge: 0 },
    );
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(event.currentTarget);
    if (position) {
      formData.set('latitude', String(position.lat));
      formData.set('longitude', String(position.lng));
    }

    const result = await createSosAlertAction(formData);

    if (!result.ok) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setToken(result.token ?? null);
    setLoading(false);
  }

  if (token) {
    return (
      <div className="rounded-2xl border border-teal-500/30 bg-surface p-5 shadow-soft">
        <p className="text-lg font-bold">Alerte enregistrée</p>
        <p className="mt-1 text-sm text-muted">
          L’administration voit votre alerte. Pour une urgence vitale, appelez
          immédiatement les secours.
        </p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <a
            href="tel:117"
            className="inline-flex min-h-12 items-center justify-center rounded-xl bg-urgent-500 text-sm font-bold text-white"
          >
            117 Police
          </a>
          <a
            href="tel:118"
            className="inline-flex min-h-12 items-center justify-center rounded-xl bg-urgent-500 text-sm font-bold text-white"
          >
            118 Pompiers
          </a>
          <a
            href="tel:119"
            className="inline-flex min-h-12 items-center justify-center rounded-xl border border-urgent-500 bg-surface text-sm font-bold text-urgent-600"
          >
            119 SAMU
          </a>
        </div>
        <Link
          href={`/suivi/${token}`}
          className="mt-3 inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-line px-3 text-xs font-semibold"
        >
          Suivre ma demande
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="rounded-2xl border border-urgent-500/30 bg-urgent-50 p-4 dark:bg-urgent-500/10">
        <p className="text-sm font-bold text-urgent-700 dark:text-urgent-300">
          Danger immédiat ?
        </p>
        <p className="mt-1 text-xs text-urgent-700/80 dark:text-urgent-300/80">
          Appelez d’abord le 117 (police), le 118 (pompiers) ou le 119 (SAMU).
          L’alerte LIFE CONNECT prévient aussi l’administration.
        </p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <a
            href="tel:117"
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-urgent-500 text-xs font-bold text-white"
          >
            117
          </a>
          <a
            href="tel:118"
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-urgent-500 text-xs font-bold text-white"
          >
            118
          </a>
          <a
            href="tel:119"
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-urgent-500 bg-surface text-xs font-bold text-urgent-600"
          >
            119
          </a>
        </div>
      </div>

      <Field label="Votre nom (optionnel)" htmlFor="nom">
        <input id="nom" name="nom" maxLength={80} className="input-lc" />
      </Field>

      <Field
        label="Votre numéro"
        htmlFor="tel_client"
        hint="L’administrateur vous appelle sur ce numéro."
        required
      >
        <input
          id="tel_client"
          name="tel_client"
          type="tel"
          inputMode="numeric"
          defaultValue={defaultPhone}
          placeholder="6 72 11 55 70"
          required
          className="input-lc"
        />
      </Field>

      <Field label="Quartier ou repère" htmlFor="quartier">
        <input
          id="quartier"
          name="quartier"
          maxLength={120}
          placeholder="Ex. : Bali, Douala"
          className="input-lc"
        />
      </Field>

      <Field label="Décrire la situation (optionnel)" htmlFor="description">
        <textarea
          id="description"
          name="description"
          maxLength={600}
          rows={3}
          className="textarea-lc"
          placeholder="Ex. : accident, personne blessée, besoin d’une ambulance…"
        />
      </Field>

      <Button
        type="button"
        variant="outline"
        onClick={locate}
        disabled={geoState === 'loading'}
        className="w-full"
      >
        {geoState === 'loading' ? <Spinner /> : <Icon name="mapPin" size={18} />}
        {position ? 'Position GPS ajoutée' : 'Utiliser ma position GPS'}
      </Button>

      {geoState === 'error' ? (
        <p className="text-xs text-amber-700 dark:text-amber-300">
          GPS indisponible. Indiquez votre quartier.
        </p>
      ) : null}

      <div className="absolute left-[-9999px]" aria-hidden="true">
        <input name="site_web" tabIndex={-1} autoComplete="off" />
      </div>

      {error ? (
        <p
          className="rounded-xl border border-urgent-500/30 bg-urgent-50 p-3 text-sm font-medium text-urgent-600 dark:bg-urgent-500/10"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex min-h-16 w-full items-center justify-center gap-3 rounded-2xl bg-urgent-500 px-5 text-lg font-black text-white shadow-soft hover:bg-urgent-600 disabled:opacity-60"
      >
        {loading ? <Spinner /> : <Icon name="alert" size={24} />}
        ENVOYER L’ALERTE SOS
      </button>
    </form>
  );
}
