'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';

import {
  createExchangeAction,
  createGroupAction,
  createGroupPostAction,
  joinGroupAction,
  leaveGroupAction,
} from '@/actions/community';
import { Icon } from '@/components/Icons';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Spinner } from '@/components/ui/Spinner';

function Feedback({ error, message }: { error: string; message: string }) {
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

export function GroupForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');
    const result = await createGroupAction(new FormData(event.currentTarget));

    if (!result.ok) {
      setError(result.error);
      setLoading(false);
      return;
    }

    router.push(`/community/${result.slug}`);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <Field label="Nom du groupe" htmlFor="name" required>
        <input id="name" name="name" minLength={3} maxLength={80} required className="input-lc" />
      </Field>
      <Field label="Description" htmlFor="description">
        <textarea
          id="description"
          name="description"
          maxLength={800}
          className="textarea-lc"
          placeholder="À quoi sert ce groupe ?"
        />
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Ville" htmlFor="city">
          <input id="city" name="city" className="input-lc" placeholder="Douala" />
        </Field>
        <Field label="Visibilité" htmlFor="visibility">
          <select id="visibility" name="visibility" className="select-lc">
            <option value="publique">Publique</option>
            <option value="privee">Privée</option>
          </select>
        </Field>
      </div>
      <Feedback error={error} message="" />
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? <Spinner /> : <Icon name="send" size={18} />}
        Créer le groupe
      </Button>
    </form>
  );
}

export function GroupActions({
  groupId,
  isMember,
}: {
  groupId: string;
  isMember: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function toggle() {
    setLoading(true);
    setError('');
    const result = isMember
      ? await leaveGroupAction(groupId)
      : await joinGroupAction(groupId);

    if (!result.ok) {
      setError(result.error);
      setLoading(false);
      return;
    }

    router.refresh();
    setLoading(false);
  }

  return (
    <div>
      <Button
        type="button"
        variant={isMember ? 'outline' : 'primary'}
        onClick={toggle}
        disabled={loading}
      >
        {loading ? <Spinner /> : null}
        {isMember ? 'Quitter le groupe' : 'Rejoindre le groupe'}
      </Button>
      {error ? <p className="mt-1 text-[11px] text-urgent-600">{error}</p> : null}
    </div>
  );
}

export function GroupPostForm({ groupId }: { groupId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [body, setBody] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');
    const formData = new FormData();
    formData.set('body', body);
    const result = await createGroupPostAction(groupId, formData);

    if (!result.ok) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setBody('');
    setLoading(false);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-2">
      <textarea
        value={body}
        onChange={(event) => setBody(event.target.value)}
        minLength={2}
        maxLength={2000}
        required
        placeholder="Écrire dans le groupe…"
        className="textarea-lc min-h-20"
      />
      <Feedback error={error} message="" />
      <Button type="submit" size="sm" disabled={loading}>
        {loading ? <Spinner /> : <Icon name="send" size={16} />}
        Publier
      </Button>
    </form>
  );
}

export function ExchangeForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');
    const result = await createExchangeAction(new FormData(event.currentTarget));

    if (!result.ok) {
      setError(result.error);
      setLoading(false);
      return;
    }

    router.push('/exchange');
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <Field label="Titre" htmlFor="title" required>
        <input id="title" name="title" minLength={3} maxLength={120} required className="input-lc" />
      </Field>
      <Field label="Description" htmlFor="description" required>
        <textarea
          id="description"
          name="description"
          minLength={10}
          maxLength={1200}
          required
          className="textarea-lc"
          placeholder="Ce que vous offrez ou recherchez…"
        />
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Type" htmlFor="kind">
          <select id="kind" name="kind" className="select-lc">
            <option value="offre">J’offre</option>
            <option value="recherche">Je recherche</option>
          </select>
        </Field>
        <Field label="Compétence" htmlFor="skill">
          <input id="skill" name="skill" className="input-lc" placeholder="Plomberie, couture…" />
        </Field>
      </div>
      <Field label="Ville" htmlFor="city">
        <input id="city" name="city" className="input-lc" placeholder="Douala" />
      </Field>
      <Feedback error={error} message="" />
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? <Spinner /> : <Icon name="send" size={18} />}
        Publier l’échange
      </Button>
    </form>
  );
}
