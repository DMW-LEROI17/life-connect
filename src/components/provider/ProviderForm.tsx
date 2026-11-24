'use client';

import Link from 'next/link';
import { useState, type ChangeEvent, type FormEvent } from 'react';

import { registerProvider } from '@/actions/register-provider';
import { Icon } from '@/components/Icons';
import { ServicesPicker } from '@/components/provider/ServicesPicker';
import { ZonesPicker } from '@/components/provider/ZonesPicker';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Spinner } from '@/components/ui/Spinner';
import type {
  CategoryWithSubs,
  GeoTree,
  ZoneSelection,
} from '@/types/db';

const MAX_PHOTO_SIZE = 2 * 1024 * 1024;

export function ProviderForm({
  catalog,
  geo,
}: {
  catalog: CategoryWithSubs[];
  geo: GeoTree;
}) {
  const [nom, setNom] = useState('');
  const [specialite, setSpecialite] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [serviceIds, setServiceIds] = useState<number[]>([]);
  const [zones, setZones] = useState<ZoneSelection[]>([]);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoError, setPhotoError] = useState('');
  const [consent, setConsent] = useState(false);
  const [siteWeb, setSiteWeb] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  function handlePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;

    if (!file) {
      setPhoto(null);
      setPhotoError('');
      return;
    }

    if (file.size > MAX_PHOTO_SIZE) {
      setPhoto(null);
      setPhotoError('La photo ne doit pas dépasser 2 Mo.');
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setPhoto(null);
      setPhotoError('Format non accepté (JPEG, PNG ou WebP).');
      return;
    }

    setPhoto(file);
    setPhotoError('');
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (!consent) {
      setError('Vous devez accepter les conditions d’utilisation.');
      return;
    }

    if (serviceIds.length === 0) {
      setError('Choisissez au moins un service.');
      return;
    }

    if (zones.length === 0) {
      setError('Choisissez au moins une zone d’intervention.');
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.set('nom', nom);
    formData.set('specialite', specialite);
    formData.set('whatsapp', whatsapp);
    formData.set('consent', consent ? 'on' : '');
    formData.set('site_web', siteWeb);
    formData.set('zones', JSON.stringify(zones));

    for (const id of serviceIds) {
      formData.append('service_ids', String(id));
    }

    if (photo) {
      formData.set('photo', photo);
    }

    const result = await registerProvider(formData);

    if (!result.ok) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setDone(true);
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-teal-500/30 bg-surface p-6 text-center shadow-soft">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-teal-50 text-teal-600 dark:bg-teal-500/10">
          <Icon name="check" size={28} />
        </span>
        <h2 className="mt-4 text-xl font-bold">Inscription envoyée</h2>
        <p className="mt-2 text-sm text-muted">
          Votre profil est en attente de validation. Nous vous contactons sur
          WhatsApp sous 24 h.
        </p>
        <Link
          href="/dashboard-aideur"
          className="mt-3 inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-teal-500 px-5 text-sm font-semibold text-white"
        >
          <Icon name="user" size={18} />
          Ouvrir mon tableau de bord
        </Link>
        <Link
          href="/"
          className="mt-2 inline-flex min-h-12 items-center justify-center rounded-2xl border border-line px-5 text-sm font-semibold"
        >
          Retour à l’accueil
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <Field label="Votre nom complet" htmlFor="nom" required>
        <input
          id="nom"
          type="text"
          value={nom}
          onChange={(event) => setNom(event.target.value)}
          maxLength={80}
          autoComplete="name"
          className="input-lc"
          placeholder="Ex. : Jean Mbarga"
        />
      </Field>

      <Field
        label="Spécialité / présentation courte"
        htmlFor="specialite"
        hint="Facultatif. Ex. : électricité, plomberie, Wi-Fi, moto."
      >
        <input
          id="specialite"
          type="text"
          value={specialite}
          onChange={(event) => setSpecialite(event.target.value)}
          maxLength={80}
          className="input-lc"
        />
      </Field>

      <Field
        label="Votre numéro WhatsApp"
        htmlFor="whatsapp"
        hint="C’est par ce numéro que l’administrateur vous alertera."
        required
      >
        <div className="flex items-stretch overflow-hidden rounded-xl border border-line bg-surface focus-within:ring-2 focus-within:ring-teal-500/30">
          <span className="flex items-center border-r border-line px-3 text-sm font-semibold text-muted">
            +237
          </span>
          <input
            id="whatsapp"
            type="tel"
            inputMode="numeric"
            value={whatsapp}
            onChange={(event) => setWhatsapp(event.target.value)}
            placeholder="6 72 11 55 70"
            className="h-12 w-full bg-transparent px-3 text-base outline-none placeholder:text-muted"
          />
        </div>
      </Field>

      <ServicesPicker
        catalog={catalog}
        selected={serviceIds}
        onChange={setServiceIds}
      />

      <ZonesPicker geo={geo} zones={zones} onChange={setZones} />

      <Field
        label="Photo de profil"
        htmlFor="photo"
        hint="Facultatif, 2 Mo maximum. JPEG, PNG ou WebP."
        error={photoError}
      >
        <label
          htmlFor="photo"
          className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-line bg-surface p-4 text-sm text-muted hover:bg-surface2"
        >
          <Icon name="camera" size={20} />
          <span>{photo ? photo.name : 'Choisir une photo'}</span>
        </label>
        <input
          id="photo"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handlePhoto}
          className="sr-only"
        />
      </Field>

      <label className="flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          checked={consent}
          onChange={(event) => setConsent(event.target.checked)}
          className="mt-0.5 h-5 w-5 accent-teal-500"
        />
        <span>
          J’accepte les{' '}
          <a
            href="/legal/conditions"
            className="font-semibold underline underline-offset-2"
          >
            conditions d’utilisation
          </a>{' '}
          et la{' '}
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

      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? <Spinner /> : <Icon name="send" size={20} />}
        ENVOYER MON INSCRIPTION
      </Button>

      <p className="text-center text-xs text-muted">
        Votre profil restera invisible jusqu’à sa validation.
      </p>
    </form>
  );
}
