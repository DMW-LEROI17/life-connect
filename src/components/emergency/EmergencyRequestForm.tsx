'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';

import { createEmergencyRequest } from '@/actions/create-emergency-request';
import { LocationPicker } from '@/components/geo/LocationPicker';
import { Icon } from '@/components/Icons';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Spinner } from '@/components/ui/Spinner';
import type { GeoTree, LocationValue } from '@/types/db';

const EMPTY_LOCATION: LocationValue = {
  regionId: null,
  departementId: null,
  arrondissementId: null,
  quartierId: null,
  freeText: '',
};

export function EmergencyRequestForm({ geo }: { geo: GeoTree }) {
  const router = useRouter();

  const [tel, setTel] = useState('');
  const [typeTransport, setTypeTransport] = useState('moto');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState<LocationValue>(EMPTY_LOCATION);
  const [position, setPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [consent, setConsent] = useState(false);
  const [siteWeb, setSiteWeb] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function locate() {
    if (!('geolocation' in navigator)) return;

    navigator.geolocation.getCurrentPosition(
      (result) => {
        setPosition({
          lat: result.coords.latitude,
          lng: result.coords.longitude,
        });
      },
      () => setPosition(null),
      { timeout: 8000, maximumAge: 60000, enableHighAccuracy: false },
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (!tel.trim()) {
      setError('Entrez votre numéro.');
      return;
    }

    if (!location.regionId) {
      setError('Choisissez votre région.');
      return;
    }

    if (!location.quartierId && location.freeText.trim().length < 2) {
      setError('Indiquez votre quartier ou un repère connu.');
      return;
    }

    if (!consent) {
      setError('Vous devez accepter d’être contacté.');
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.set('tel_client', tel);
    formData.set('type_transport', typeTransport);
    formData.set('description', description);
    formData.set('region_id', String(location.regionId));
    formData.set(
      'departement_id',
      location.departementId ? String(location.departementId) : '',
    );
    formData.set(
      'arrondissement_id',
      location.arrondissementId ? String(location.arrondissementId) : '',
    );
    formData.set(
      'quartier_id',
      location.quartierId ? String(location.quartierId) : '',
    );
    formData.set('quartier', location.freeText);
    formData.set('site_web', siteWeb);
    formData.set('consent', consent ? 'on' : '');

    if (position) {
      formData.set('latitude', String(position.lat));
      formData.set('longitude', String(position.lng));
    }

    const result = await createEmergencyRequest(formData);

    if (!result.ok) {
      setError(result.error);
      setLoading(false);
      return;
    }

    router.push(`/suivi/${result.token}`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <Field
        label="Votre numéro"
        htmlFor="tel"
        hint="Un aideur vous appellera pour confirmer le lieu et le prix."
        required
      >
        <div className="flex items-stretch overflow-hidden rounded-xl border border-line bg-surface focus-within:ring-2 focus-within:ring-teal-500/30">
          <span className="flex items-center border-r border-line px-3 text-sm font-semibold text-muted">
            +237
          </span>
          <input
            id="tel"
            type="tel"
            inputMode="numeric"
            value={tel}
            onChange={(event) => setTel(event.target.value)}
            placeholder="6 72 11 55 70"
            className="h-12 w-full bg-transparent px-3 text-base outline-none placeholder:text-muted"
          />
        </div>
      </Field>

      <Field label="Quel transport ?" htmlFor="type_transport" required>
        <select
          id="type_transport"
          value={typeTransport}
          onChange={(event) => setTypeTransport(event.target.value)}
          className="select-lc"
        >
          <option value="moto">Moto-taxi (rapide)</option>
          <option value="taxi">Taxi</option>
          <option value="vehicule">Véhicule / voiture</option>
          <option value="autre">Autre moyen</option>
        </select>
      </Field>

      <div>
        <p className="text-sm font-semibold">Où êtes-vous ? *</p>
        <p className="mb-3 mt-1 text-sm text-muted">
          Le lieu exact aide l’aideur à vous trouver vite.
        </p>
        <LocationPicker geo={geo} value={location} onChange={setLocation} />
      </div>

      <div className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface p-4">
        <p className="text-xs text-muted">
          Ajoutez votre position GPS pour que l’aideur vous trouve.
        </p>
        <Button variant="outline" size="sm" onClick={locate}>
          <Icon name="mapPin" size={16} />
          {position ? 'Position ajoutée' : 'Ma position'}
        </Button>
      </div>

      <Field
        label="Précisions"
        htmlFor="description"
        hint="Ex. : enfant malade, besoin d’aller à l’hôpital, deux personnes."
      >
        <textarea
          id="description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          maxLength={600}
          rows={3}
          className="textarea-lc"
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
          J’accepte d’être contacté et que ma demande soit transmise à un
          aideur proche.
        </span>
      </label>

      <div className="absolute left-[-9999px]" aria-hidden="true">
        <input
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
        ALERTER LES AIDEURS PRÈS DE MOI
      </Button>

      <p className="text-center text-xs text-muted">
        Pour une urgence vitale, appelez d’abord le 119 ou le 117.
      </p>
    </form>
  );
}
