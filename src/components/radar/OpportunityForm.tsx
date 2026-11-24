'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';

import { createOpportunityAction } from '@/actions/radar';
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

export function OpportunityForm({ geo }: { geo: GeoTree }) {
  const router = useRouter();
  const [location, setLocation] = useState<LocationValue>(EMPTY_LOCATION);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(event.currentTarget);
    formData.set('region_id', location.regionId ? String(location.regionId) : '');
    formData.set(
      'departement_id',
      location.departementId ? String(location.departementId) : '',
    );
    formData.set(
      'arrondissement_id',
      location.arrondissementId
        ? String(location.arrondissementId)
        : '',
    );

    const result = await createOpportunityAction(formData);

    if (!result.ok) {
      setError(result.error);
      setLoading(false);
      return;
    }

    router.push('/radar');
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <Field label="Titre" htmlFor="title" required>
        <input id="title" name="title" minLength={3} maxLength={140} required className="input-lc" />
      </Field>
      <Field label="Description" htmlFor="description" required>
        <textarea
          id="description"
          name="description"
          minLength={10}
          maxLength={2000}
          required
          className="textarea-lc"
          placeholder="Décrivez l’opportunité, les conditions, le public…"
        />
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Type" htmlFor="kind">
          <select id="kind" name="kind" className="select-lc">
            <option value="projet">Projet</option>
            <option value="emploi">Emploi</option>
            <option value="stage">Stage</option>
            <option value="evenement">Événement</option>
            <option value="partenariat">Partenariat</option>
          </select>
        </Field>
        <Field label="Ville" htmlFor="city">
          <input id="city" name="city" className="input-lc" placeholder="Douala" />
        </Field>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Date limite" htmlFor="deadline">
          <input id="deadline" name="deadline" type="date" className="input-lc" />
        </Field>
        <Field label="Lien (optionnel)" htmlFor="link">
          <input id="link" name="link" type="url" className="input-lc" placeholder="https://" />
        </Field>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold">Zone concernée</p>
        <LocationPicker geo={geo} value={location} onChange={setLocation} />
      </div>
      {error ? (
        <p className="rounded-xl border border-urgent-500/30 bg-urgent-50 p-2.5 text-xs font-medium text-urgent-600 dark:bg-urgent-500/10">
          {error}
        </p>
      ) : null}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? <Spinner /> : <Icon name="send" size={18} />}
        Publier l’opportunité
      </Button>
    </form>
  );
}
