'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';

import { signInAction } from '@/actions/auth';
import { Icon } from '@/components/Icons';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Spinner } from '@/components/ui/Spinner';

export function SignInForm({ next }: { next: string }) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    formData.set('next', next);

    const result = await signInAction(formData);

    if (!result.ok) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
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

      <Field label="Mot de passe" htmlFor="password" required>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="input-lc"
        />
      </Field>

      {error ? (
        <p
          className="rounded-xl border border-urgent-500/30 bg-urgent-50 p-3 text-sm font-medium text-urgent-600 dark:bg-urgent-500/10"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? <Spinner /> : <Icon name="user" size={20} />}
        SE CONNECTER
      </Button>

      <p className="text-center text-xs text-muted">
        Pas encore de compte ?{' '}
        <Link href="/inscription" className="font-semibold underline underline-offset-2">
          Créer un compte
        </Link>
      </p>
    </form>
  );
}
