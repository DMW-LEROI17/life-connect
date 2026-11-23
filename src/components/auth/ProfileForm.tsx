'use client';

import { useState, type FormEvent } from 'react';

import { updateProfileAction } from '@/actions/auth';
import { Icon } from '@/components/Icons';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Spinner } from '@/components/ui/Spinner';
import type { ProfileRow } from '@/types/db';

export function ProfileForm({ profile }: { profile: ProfileRow }) {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    const result = await updateProfileAction(new FormData(event.currentTarget));

    if (!result.ok) {
      setError(result.error);
    } else {
      setMessage(result.message ?? 'Profil mis à jour.');
    }

    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-2 sm:grid-cols-2">
        <Field label="Nom complet" htmlFor="full_name" required>
          <input
            id="full_name"
            name="full_name"
            defaultValue={profile.full_name}
            maxLength={80}
            required
            className="input-lc"
          />
        </Field>
        <Field label="Téléphone" htmlFor="phone">
          <input
            id="phone"
            name="phone"
            defaultValue={profile.phone ?? ''}
            className="input-lc"
            placeholder="+237 6…"
          />
        </Field>
        <Field label="Ville" htmlFor="city">
          <input
            id="city"
            name="city"
            defaultValue={profile.city ?? ''}
            className="input-lc"
          />
        </Field>
        <Field label="Pays" htmlFor="country">
          <input
            id="country"
            name="country"
            defaultValue={profile.country}
            className="input-lc"
          />
        </Field>
      </div>

      <Field
        label="Présentation"
        htmlFor="bio"
        hint="600 caractères maximum. Visible publiquement."
      >
        <textarea
          id="bio"
          name="bio"
          defaultValue={profile.bio ?? ''}
          maxLength={600}
          rows={4}
          className="textarea-lc"
        />
      </Field>

      {error ? (
        <p className="rounded-xl border border-urgent-500/30 bg-urgent-50 p-3 text-sm font-medium text-urgent-600 dark:bg-urgent-500/10" role="alert">
          {error}
        </p>
      ) : null}

      {message ? (
        <p className="rounded-xl border border-teal-500/30 bg-teal-50 p-3 text-sm font-medium text-teal-800 dark:bg-teal-500/10 dark:text-teal-200">
          {message}
        </p>
      ) : null}

      <Button type="submit" disabled={loading}>
        {loading ? <Spinner /> : <Icon name="check" size={18} />}
        Enregistrer mon profil
      </Button>
    </form>
  );
}
