'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';

import { createRequest } from '@/actions/create-request';
import { Icon } from '@/components/Icons';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Spinner } from '@/components/ui/Spinner';
import { QUARTIERS } from '@/lib/constants';
import type { CategoryDef } from '@/types/db';

export function RequestForm({ category }: { category: CategoryDef }) {
  const router = useRouter();

  const [probleme, setProbleme] = useState('');
  const [description, setDescription] = useState('');
  const [tel, setTel] = useState('');
  const [quartier, setQuartier] = useState('');
  const [autreQuartier, setAutreQuartier] = useState('');
  const [position, setPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [geoState, setGeoState] = useState<'idle' | 'loading' | 'ok' | 'error'>(
    'idle',
  );
  const [geoMessage, setGeoMessage] = useState('');
  const [consent, setConsent] = useState(false);
  const [siteWeb, setSiteWeb] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function locate() {
    setGeoState('loading');
    setGeoMessage('');

    if (!('geolocation' in navigator)) {
      setGeoState('error');
      setGeoMessage('La géolocalisation n’est pas disponible sur cet appareil.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (result) => {
        setPosition({
          lat: result.coords.latitude,
          lng: result.coords.longitude,
        });
        setGeoState('ok');
        setGeoMessage('Position ajoutée. Elle sert uniquement à trouver les pros proches.');
      },
      () => {
        setGeoState('error');
        setGeoMessage(
          'Position indisponible. Pas de problème : votre quartier suffit.',
        );
      },
      { timeout: 8000, maximumAge: 60000, enableHighAccuracy: false },
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (!probleme) {
      setError('Choisissez votre problème.');
      return;
    }

    if (probleme.startsWith('Autre') && description.trim().length < 10) {
      setError(
        'Décrivez votre problème en quelques mots (10 caractères minimum).',
      );
      return;
    }

    if (!tel.trim()) {
      setError('Entrez votre numéro de téléphone.');
      return;
    }

    if (!quartier) {
      setError('Choisissez votre quartier.');
      return;
    }

    if (quartier === '__autre__' && autreQuartier.trim().length < 2) {
      setError('Indiquez le nom de votre quartier.');
      return;
    }

    if (!consent) {
      setError('Vous devez accepter d’être contacté au sujet de cette demande.');
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.set('categorie', category.slug);
    formData.set('probleme', probleme);
    formData.set('description', description);
    formData.set('tel_client', tel);
    formData.set(
      'quartier',
      quartier === '__autre__' ? autreQuartier.trim() : quartier,
    );
    formData.set('site_web', siteWeb);
    formData.set('consent', consent ? 'on' : '');

    if (position) {
      formData.set('latitude', String(position.lat));
      formData.set('longitude', String(position.lng));
    }

    const result = await createRequest(formData);

    if (!result.ok) {
      setError(result.error);
      setLoading(false);
      return;
    }

    try {
      const saved = JSON.parse(
        localStorage.getItem('lc_requests') || '[]',
      ) as string[];
      localStorage.setItem(
        'lc_requests',
        JSON.stringify([result.token, ...saved].slice(0, 10)),
      );
    } catch {
      // Le suivi reste accessible par le lien affiché après l'envoi.
    }

    router.push(`/suivi/${result.token}`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div>
        <p className="text-sm font-semibold">Votre problème</p>
        <p className="mt-1 text-sm text-muted">
          Choisissez ce qui correspond le mieux à votre situation.
        </p>

        <div className="mt-3 grid gap-2">
          {category.problems.map((item) => {
            const selected = probleme === item;

            return (
              <label
                key={item}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors ${
                  selected
                    ? 'border-urgent-500 bg-urgent-50 dark:bg-urgent-500/10'
                    : 'border-line bg-surface hover:bg-surface2'
                }`}
              >
                <input
                  type="radio"
                  name="probleme"
                  value={item}
                  checked={selected}
                  onChange={() => setProbleme(item)}
                  className="h-5 w-5 accent-urgent-500"
                />
                <span className="text-sm font-medium">{item}</span>
              </label>
            );
          })}
        </div>
      </div>

      <Field
        label="Décrivez en quelques mots"
        htmlFor="description"
        hint="Facultatif, sauf pour « Autre ». 600 caractères maximum."
      >
        <textarea
          id="description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          maxLength={600}
          rows={3}
          className="textarea-lc"
          placeholder="Ex. : le pneu arrière est crevé devant la station."
        />
        <p className="mt-1 text-right text-xs text-muted">
          {description.length}/600
        </p>
      </Field>

      <Field
        label="Votre numéro"
        htmlFor="tel"
        hint="Il sert uniquement au prestataire assigné et à l’administrateur."
        required
      >
        <div className="flex items-stretch overflow-hidden rounded-xl border border-line bg-surface focus-within:ring-2 focus-within:ring-teal-500/30">
          <span className="flex items-center border-r border-line px-3 text-sm font-semibold text-muted">
            +237
          </span>
          <input
            id="tel"
            name="tel"
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            value={tel}
            onChange={(event) => setTel(event.target.value)}
            placeholder="6 72 11 55 70"
            className="h-12 w-full bg-transparent px-3 text-base outline-none placeholder:text-muted"
          />
        </div>
      </Field>

      <Field
        label="Où êtes-vous ?"
        htmlFor="quartier"
        hint="Votre quartier suffit. La position exacte est facultative."
        required
      >
        <select
          id="quartier"
          value={quartier}
          onChange={(event) => setQuartier(event.target.value)}
          className="select-lc"
        >
          <option value="">Choisir mon quartier</option>
          {QUARTIERS.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
          <option value="__autre__">Mon quartier n’est pas dans la liste</option>
        </select>

        {quartier === '__autre__' ? (
          <input
            type="text"
            value={autreQuartier}
            onChange={(event) => setAutreQuartier(event.target.value)}
            maxLength={60}
            placeholder="Nom de mon quartier"
            className="input-lc mt-2"
          />
        ) : null}
      </Field>

      <div className="rounded-xl border border-line bg-surface p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">Position précise</p>
            <p className="text-xs text-muted">
              Facultative. Elle aide à calculer la distance des prestataires.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={locate}
            disabled={geoState === 'loading'}
          >
            {geoState === 'loading' ? (
              <Spinner />
            ) : (
              <Icon name="mapPin" size={18} />
            )}
            {position ? 'Position ajoutée' : 'Utiliser ma position'}
          </Button>
        </div>

        {geoMessage ? (
          <p
            className={`mt-2 text-xs ${
              geoState === 'error' ? 'text-amber-700 dark:text-amber-300' : 'text-teal-600 dark:text-teal-400'
            }`}
            role="status"
          >
            {geoMessage}
          </p>
        ) : null}
      </div>

      <label className="flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          checked={consent}
          onChange={(event) => setConsent(event.target.checked)}
          className="mt-0.5 h-5 w-5 accent-teal-500"
        />
        <span>
          J’accepte d’être contacté au sujet de cette demande. Voir la{' '}
          <a
            href="/legal/confidentialite"
            className="font-semibold underline underline-offset-2"
          >
            politique de confidentialité
          </a>
          .
        </span>
      </label>

      <div className="absolute left-[-9999px]" aria-hidden="true">
        <label htmlFor="site_web">Site web</label>
        <input
          id="site_web"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={siteWeb}
          onChange={(event) => setSiteWeb(event.target.value)}
        />
      </div>

      {error ? (
        <p
          className="rounded-xl border border-urgent-500/30 bg-urgent-50 p-3 text-sm font-medium text-urgent-600 dark:bg-urgent-500/10"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={loading}
      >
        {loading ? (
          <>
            <Spinner /> Envoi…
          </>
        ) : (
          <>
            <Icon name="search" size={20} /> TROUVER UN PRESTATAIRE
          </>
        )}
      </Button>

      <p className="text-center text-xs text-muted">
        En envoyant, vous acceptez les{' '}
        <a
          href="/legal/conditions"
          className="underline underline-offset-2"
        >
          conditions d’utilisation
        </a>
        .
      </p>
    </form>
  );
}
