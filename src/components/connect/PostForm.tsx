'use client';

import { useState, type FormEvent } from 'react';

import { createPostAction } from '@/actions/posts';
import { Icon } from '@/components/Icons';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Spinner } from '@/components/ui/Spinner';
import type { CategoryWithSubs, RegionRow } from '@/types/db';

export function PostForm({
  catalog,
  regions,
}: {
  catalog: CategoryWithSubs[];
  regions: RegionRow[];
}) {
  const [kind, setKind] = useState<'besoin' | 'offre'>('besoin');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    formData.set('kind', kind);
    const result = await createPostAction(formData);

    if (!result.ok) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div>
        <p className="text-sm font-semibold">Je publie</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setKind('besoin')}
            className={`min-h-12 rounded-xl border text-sm font-semibold ${
              kind === 'besoin'
                ? 'border-urgent-500 bg-urgent-50 text-urgent-600 dark:bg-urgent-500/10'
                : 'border-line bg-surface text-muted'
            }`}
          >
            Un besoin
          </button>
          <button
            type="button"
            onClick={() => setKind('offre')}
            className={`min-h-12 rounded-xl border text-sm font-semibold ${
              kind === 'offre'
                ? 'border-teal-500 bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300'
                : 'border-line bg-surface text-muted'
            }`}
          >
            Une offre
          </button>
        </div>
      </div>

      <Field label="Titre" htmlFor="title" hint="5 à 120 caractères." required>
        <input
          id="title"
          name="title"
          maxLength={120}
          required
          className="input-lc"
          placeholder={
            kind === 'besoin'
              ? 'Ex. : besoin d’un plombier à Akwa'
              : 'Ex. : je propose des cours de maths'
          }
        />
      </Field>

      <Field
        label="Description"
        htmlFor="description"
        hint="10 à 2000 caractères. Décrivez le besoin, le lieu, le délai, le budget."
        required
      >
        <textarea
          id="description"
          name="description"
          rows={5}
          maxLength={2000}
          required
          className="textarea-lc"
        />
      </Field>

      <div className="grid gap-2 sm:grid-cols-2">
        <Field label="Catégorie" htmlFor="category_id" required>
          <select id="category_id" name="category_id" className="select-lc" required>
            <option value="">Choisir une catégorie</option>
            {catalog.map((category) => (
              <option key={category.id} value={category.id}>
                {category.nom_fr}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Région" htmlFor="region_id">
          <select id="region_id" name="region_id" className="select-lc">
            <option value="">Choisir une région</option>
            {regions.map((region) => (
              <option key={region.id} value={region.id}>
                {region.nom}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Ville" htmlFor="city">
          <input id="city" name="city" className="input-lc" placeholder="Douala, Yaoundé…" />
        </Field>

        <Field label="Quartier / repère" htmlFor="quartier">
          <input id="quartier" name="quartier" className="input-lc" placeholder="Akwa, Bonapriso…" />
        </Field>

        <Field label="Budget indicatif" htmlFor="budget" hint="Facultatif. Ex. : 15 000 FCFA.">
          <input id="budget" name="budget" maxLength={80} className="input-lc" />
        </Field>

        <Field label="Délai" htmlFor="deadline" hint="Facultatif.">
          <input id="deadline" name="deadline" type="date" className="input-lc" />
        </Field>
      </div>

      {error ? (
        <p className="rounded-xl border border-urgent-500/30 bg-urgent-50 p-3 text-sm font-medium text-urgent-600 dark:bg-urgent-500/10" role="alert">
          {error}
        </p>
      ) : null}

      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? <Spinner /> : <Icon name="send" size={20} />}
        PUBLIER
      </Button>
    </form>
  );
}
