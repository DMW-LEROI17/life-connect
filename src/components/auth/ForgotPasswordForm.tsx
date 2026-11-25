'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';

import { requestPasswordResetAction } from '@/actions/auth';
import { Icon } from '@/components/Icons';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Spinner } from '@/components/ui/Spinner';

export function ForgotPasswordForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    const result = await requestPasswordResetAction(
      new FormData(event.currentTarget),
    );

    if (!result.ok) setError(result.error);
    else setMessage(result.message ?? 'Lien envoyé.');

    setLoading(false);
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Adresse e-mail" htmlFor="email" required>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="input-lc"
          placeholder="vous@exemple.com"
        />
      </Field>

      {error ? (
        <p className="rounded-xl border border-urgent-500/30 bg-urgent-50 p-3 text-sm font-medium text-urgent-600" role="alert">
          {error}
        </p>
      ) : null}

      {message ? (
        <p className="rounded-xl border border-teal-500/30 bg-teal-50 p-3 text-sm font-medium text-teal-800 dark:bg-teal-500/10 dark:text-teal-200">
          {message}
        </p>
      ) : null}

      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? <Spinner /> : <Icon name="send" size={19} />}
        Envoyer le lien
      </Button>

      <p className="text-center text-xs text-muted">
        <Link href="/connexion" className="font-semibold underline underline-offset-2">
          Retour à la connexion
        </Link>
      </p>
    </form>
  );
}
