'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { rateRequest } from '@/actions/rate-request';
import { Icon } from '@/components/Icons';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';

export function RatingForm({ token }: { token: string }) {
  const router = useRouter();

  const [stars, setStars] = useState(0);
  const [resolu, setResolu] = useState<'oui' | 'non' | null>(null);
  const [commentaire, setCommentaire] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit() {
    setError('');

    if (stars < 1) {
      setError('Choisissez une note de 1 à 5 étoiles.');
      return;
    }

    if (!resolu) {
      setError('Indiquez si le problème est résolu.');
      return;
    }

    setLoading(true);

    const result = await rateRequest(token, {
      etoiles: stars,
      resolu: resolu === 'oui',
      commentaire,
    });

    if (!result.ok) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setDone(true);
    router.refresh();
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-teal-500/30 bg-surface p-6 text-center shadow-soft">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-teal-50 text-teal-600 dark:bg-teal-500/10">
          <Icon name="check" size={28} />
        </span>
        <h2 className="mt-4 text-xl font-bold">Merci pour votre avis</h2>
        <p className="mt-2 text-sm text-muted">
          Votre retour aide les autres clients à choisir un professionnel de
          confiance.
        </p>
        <a
          href="/"
          className="mt-5 inline-flex min-h-12 items-center justify-center rounded-2xl bg-navy-900 px-5 text-sm font-semibold text-white dark:bg-white dark:text-navy-900"
        >
          Retour à l’accueil
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold">Votre note</p>
        <div className="mt-2 flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setStars(value)}
              aria-label={`${value} étoile${value > 1 ? 's' : ''}`}
              aria-pressed={stars === value}
              className="rounded-lg p-1"
            >
              <Icon
                name="star"
                size={36}
                className={
                  value <= stars
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-line transition-colors hover:text-amber-300'
                }
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold">Problème résolu ?</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setResolu('oui')}
            aria-pressed={resolu === 'oui'}
            className={`min-h-12 rounded-xl border text-sm font-semibold transition-colors ${
              resolu === 'oui'
                ? 'border-teal-500 bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300'
                : 'border-line bg-surface text-muted hover:bg-surface2'
            }`}
          >
            Oui
          </button>
          <button
            type="button"
            onClick={() => setResolu('non')}
            aria-pressed={resolu === 'non'}
            className={`min-h-12 rounded-xl border text-sm font-semibold transition-colors ${
              resolu === 'non'
                ? 'border-urgent-500 bg-urgent-50 text-urgent-600 dark:bg-urgent-500/10'
                : 'border-line bg-surface text-muted hover:bg-surface2'
            }`}
          >
            Non
          </button>
        </div>
      </div>

      <div>
        <label htmlFor="commentaire" className="text-sm font-semibold">
          Un commentaire ?{' '}
          <span className="font-normal text-muted">(facultatif)</span>
        </label>
        <textarea
          id="commentaire"
          value={commentaire}
          onChange={(event) => setCommentaire(event.target.value)}
          maxLength={500}
          rows={4}
          className="textarea-lc mt-2"
          placeholder="Ponctualité, qualité du travail, prix…"
        />
        <p className="mt-1 text-right text-xs text-muted">
          {commentaire.length}/500
        </p>
      </div>

      {error ? (
        <p
          className="rounded-xl border border-urgent-500/30 bg-urgent-50 p-3 text-sm font-medium text-urgent-600 dark:bg-urgent-500/10"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <Button
        size="lg"
        className="w-full"
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? <Spinner /> : <Icon name="send" size={20} />}
        ENVOYER MON AVIS
      </Button>
    </div>
  );
}
