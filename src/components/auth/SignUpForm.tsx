'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';

import { signUpAction } from '@/actions/auth';
import { Icon } from '@/components/Icons';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Spinner } from '@/components/ui/Spinner';

const ROLES = [
  { value: 'particulier', label: 'Particulier — je cherche une solution' },
  { value: 'professionnel', label: 'Professionnel / prestataire' },
  { value: 'commercant', label: 'Commerçant / vendeur' },
  { value: 'entreprise', label: 'Entreprise / organisation' },
];

export function SignUpForm() {
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setMessage('');

    const form = event.currentTarget;
    const data = new FormData(form);

    if (String(data.get('password')) !== String(data.get('confirm'))) {
      setError('Les deux mots de passe ne correspondent pas.');
      return;
    }

    if (data.get('consent') !== 'on') {
      setError('Vous devez accepter les conditions d’utilisation.');
      return;
    }

    setLoading(true);
    const result = await signUpAction(data);

    if (!result.ok) {
      setError(result.error);
      setLoading(false);
      return;
    }

    if (result.message) {
      setMessage(result.message);
      form.reset();
    }

    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Field label="Nom complet" htmlFor="full_name" required>
        <input
          id="full_name"
          name="full_name"
          autoComplete="name"
          maxLength={80}
          required
          className="input-lc"
        />
      </Field>

      <Field label="Adresse e-mail" htmlFor="email" required>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="input-lc"
        />
      </Field>

      <Field label="Type de compte" htmlFor="role" required>
        <select id="role" name="role" className="select-lc" defaultValue="particulier">
          {ROLES.map((role) => (
            <option key={role.value} value={role.value}>
              {role.label}
            </option>
          ))}
        </select>
      </Field>

      <div className="grid gap-2 sm:grid-cols-2">
        <Field label="Téléphone (facultatif)" htmlFor="phone">
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            className="input-lc"
            placeholder="+237 6…"
          />
        </Field>
        <Field label="Ville (facultatif)" htmlFor="city">
          <input
            id="city"
            name="city"
            autoComplete="address-level2"
            className="input-lc"
            placeholder="Douala, Yaoundé…"
          />
        </Field>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <Field label="Mot de passe" htmlFor="password" hint="8 caractères minimum." required>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            className="input-lc"
          />
        </Field>
        <Field label="Confirmer" htmlFor="confirm" required>
          <input
            id="confirm"
            name="confirm"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            className="input-lc"
          />
        </Field>
      </div>

      <label className="flex items-start gap-3 text-sm">
        <input
          name="consent"
          type="checkbox"
          className="mt-0.5 h-5 w-5 accent-teal-500"
        />
        <span>
          J’accepte les{' '}
          <Link
            href="/legal/conditions"
            className="font-semibold underline underline-offset-2"
          >
            conditions
          </Link>{' '}
          et la{' '}
          <Link
            href="/legal/confidentialite"
            className="font-semibold underline underline-offset-2"
          >
            politique de confidentialité
          </Link>
          .
        </span>
      </label>

      {error ? (
        <p
          className="rounded-xl border border-urgent-500/30 bg-urgent-50 p-3 text-sm font-medium text-urgent-600 dark:bg-urgent-500/10"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      {message ? (
        <p className="rounded-xl border border-teal-500/30 bg-teal-50 p-3 text-sm font-medium text-teal-800 dark:bg-teal-500/10 dark:text-teal-200">
          {message}
        </p>
      ) : null}

      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? <Spinner /> : <Icon name="user" size={20} />}
        CRÉER MON COMPTE
      </Button>
    </form>
  );
}
