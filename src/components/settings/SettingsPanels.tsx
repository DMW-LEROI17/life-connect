'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';

import {
  changePasswordAction,
  updateSettingsAction,
  uploadAvatarAction,
} from '@/actions/auth';
import { Icon } from '@/components/Icons';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Spinner } from '@/components/ui/Spinner';
import type { ProfileRow } from '@/types/db';

function Feedback({
  error,
  message,
}: {
  error: string;
  message: string;
}) {
  if (!error && !message) return null;

  return (
    <p
      className={`rounded-xl border p-2.5 text-xs font-medium ${
        error
          ? 'border-urgent-500/30 bg-urgent-50 text-urgent-600 dark:bg-urgent-500/10'
          : 'border-teal-500/30 bg-teal-50 text-teal-800 dark:bg-teal-500/10 dark:text-teal-200'
      }`}
      role={error ? 'alert' : 'status'}
    >
      {error || message}
    </p>
  );
}

export function SettingsForm({ profile }: { profile: ProfileRow }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    const result = await updateSettingsAction(new FormData(event.currentTarget));

    if (!result.ok) setError(result.error);
    else {
      setMessage(result.message ?? 'Paramètres enregistrés.');
      router.refresh();
    }

    setLoading(false);
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <input type="hidden" name="language" value={profile.language} />

      <div className="space-y-2">
        {[
          {
            name: 'notify_messages',
            label: 'Messages',
            hint: 'Recevoir une alerte quand un message arrive.',
            checked: profile.notify_messages,
          },
          {
            name: 'notify_requests',
            label: 'Demandes et propositions',
            hint: 'Recevoir une alerte quand quelqu’un répond à une publication.',
            checked: profile.notify_requests,
          },
          {
            name: 'notify_payments',
            label: 'Paiements',
            hint: 'Recevoir une alerte pour les recharges et retraits.',
            checked: profile.notify_payments,
          },
        ].map((item) => (
          <label
            key={item.name}
            className="flex items-start justify-between gap-3 rounded-xl border border-line p-3"
          >
            <span>
              <span className="block text-sm font-semibold">{item.label}</span>
              <span className="block text-xs text-muted">{item.hint}</span>
            </span>
            <input
              type="checkbox"
              name={item.name}
              defaultChecked={item.checked}
              className="mt-1 h-5 w-5 accent-teal-500"
            />
          </label>
        ))}
      </div>

      <Feedback error={error} message={message} />

      <Button type="submit" disabled={loading}>
        {loading ? <Spinner /> : <Icon name="check" size={18} />}
        Enregistrer les préférences
      </Button>
    </form>
  );
}

export function PasswordForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    const form = event.currentTarget;
    const result = await changePasswordAction(new FormData(form));

    if (!result.ok) setError(result.error);
    else {
      setMessage(result.message ?? 'Mot de passe modifié.');
      form.reset();
    }

    setLoading(false);
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-2">
        <Field label="Nouveau mot de passe" htmlFor="password" required>
          <input
            id="password"
            name="password"
            type="password"
            minLength={8}
            autoComplete="new-password"
            required
            className="input-lc"
          />
        </Field>
        <Field label="Confirmer" htmlFor="confirm" required>
          <input
            id="confirm"
            name="confirm"
            type="password"
            minLength={8}
            autoComplete="new-password"
            required
            className="input-lc"
          />
        </Field>
      </div>

      <Feedback error={error} message={message} />

      <Button type="submit" variant="outline" disabled={loading}>
        {loading ? <Spinner /> : <Icon name="shield" size={18} />}
        Modifier le mot de passe
      </Button>
    </form>
  );
}

export function AvatarUpload() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    const result = await uploadAvatarAction(new FormData(event.currentTarget));

    if (!result.ok) setError(result.error);
    else {
      setMessage(result.message ?? 'Photo mise à jour.');
      router.refresh();
    }

    setLoading(false);
  }

  return (
    <form onSubmit={submit} className="space-y-2">
      <label
        htmlFor="avatar"
        className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-line p-3 text-sm text-muted hover:bg-surface2"
      >
        <Icon name="camera" size={20} />
        Changer ma photo de profil
      </label>
      <input
        id="avatar"
        name="avatar"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
      />

      <Feedback error={error} message={message} />

      <Button type="submit" size="sm" disabled={loading}>
        {loading ? <Spinner /> : <Icon name="check" size={16} />}
        Envoyer la photo
      </Button>
    </form>
  );
}
