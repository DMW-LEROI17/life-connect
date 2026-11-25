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
  const [showPassword, setShowPassword] = useState(false);

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
          placeholder="vous@exemple.com"
        />
      </Field>

      <Field label="Mot de passe" htmlFor="password" required>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            required
            className="input-lc pr-12"
            placeholder="Votre mot de passe"
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="absolute right-1 top-1 grid h-10 w-10 place-items-center rounded-lg text-muted hover:bg-surface2"
            aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
          >
            <Icon name={showPassword ? 'eyeOff' : 'eye'} size={18} />
          </button>
        </div>
      </Field>

      <div className="flex justify-end">
        <Link
          href="/mot-de-passe-oublie"
          className="text-xs font-semibold text-teal-700 hover:underline dark:text-teal-300"
        >
          Mot de passe oublié ?
        </Link>
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
        {loading ? <Spinner /> : <Icon name="user" size={20} />}
        SE CONNECTER
      </Button>

      <p className="text-center text-xs text-muted">
        Pas encore de compte ?{' '}
        <Link href="/inscription" className="font-semibold text-teal-700 underline underline-offset-2 dark:text-teal-300">
          Créer un compte
        </Link>
      </p>
    </form>
  );
}
