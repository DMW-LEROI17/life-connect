'use client';

import { useState, type FormEvent } from 'react';

import { createProposalAction } from '@/actions/posts';
import { Icon } from '@/components/Icons';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Spinner } from '@/components/ui/Spinner';

export function ProposalForm({ postId }: { postId: string }) {
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    const result = await createProposalAction(
      postId,
      new FormData(event.currentTarget),
    );

    if (!result.ok) {
      setError(result.error);
    } else {
      setMessage(result.message ?? 'Réponse envoyée.');
      event.currentTarget.reset();
    }

    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field
        label="Votre réponse"
        htmlFor="message"
        hint="Expliquez ce que vous proposez, votre disponibilité et vos conditions."
        required
      >
        <textarea
          id="message"
          name="message"
          rows={4}
          minLength={5}
          maxLength={1200}
          required
          className="textarea-lc"
          placeholder="Ex. : je peux passer demain matin, déplacement 5 000 FCFA."
        />
      </Field>

      <Field label="Prix indicatif" htmlFor="price" hint="Facultatif.">
        <input
          id="price"
          name="price"
          maxLength={80}
          className="input-lc"
          placeholder="Ex. : 15 000 FCFA"
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
        {loading ? <Spinner /> : <Icon name="send" size={18} />}
        Envoyer ma réponse
      </Button>
    </form>
  );
}
