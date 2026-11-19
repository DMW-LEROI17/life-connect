'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';

import { Icon } from '@/components/Icons';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Spinner } from '@/components/ui/Spinner';

export function LoginForm({ next }: { next: string }) {
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
      };

      if (!response.ok) {
        setError(data.error ?? 'Connexion impossible.');
        setLoading(false);
        return;
      }

      router.replace(next);
      router.refresh();
    } catch {
      setError('Connexion impossible. Vérifiez votre réseau.');
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Mot de passe" htmlFor="password" required>
        <div className="relative">
          <input
            id="password"
            type={show ? 'text' : 'password'}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            className="input-lc pr-20"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShow((value) => !value)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-semibold text-muted hover:bg-surface2"
          >
            {show ? 'Cacher' : 'Afficher'}
          </button>
        </div>
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
        {loading ? <Spinner /> : <Icon name="shield" size={20} />}
        SE CONNECTER
      </Button>
    </form>
  );
}
