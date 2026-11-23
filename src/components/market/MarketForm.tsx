'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';

import { createMarketListingAction } from '@/actions/market';
import { Icon } from '@/components/Icons';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Spinner } from '@/components/ui/Spinner';

export function MarketForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [file, setFile] = useState<File | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(event.currentTarget);
    if (file) formData.set('image', file);

    const result = await createMarketListingAction(formData);

    if (!result.ok) {
      setError(result.error);
      setLoading(false);
      return;
    }

    router.push(result.id ? `/market/${result.id}` : '/market');
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <Field label="Titre de l’annonce" htmlFor="title" required>
        <input
          id="title"
          name="title"
          minLength={3}
          maxLength={120}
          required
          placeholder="Ex. : Téléphone Samsung A24, très bon état"
          className="input-lc"
        />
      </Field>

      <Field label="Description" htmlFor="description" required>
        <textarea
          id="description"
          name="description"
          minLength={10}
          maxLength={2000}
          required
          placeholder="Décrivez le produit, son état, ce qui est inclus…"
          className="textarea-lc"
        />
      </Field>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Prix en FCFA (optionnel)" htmlFor="price">
          <input
            id="price"
            name="price"
            type="number"
            min={0}
            step={100}
            placeholder="25000"
            className="input-lc"
          />
        </Field>

        <Field label="État" htmlFor="condition" required>
          <select id="condition" name="condition" className="select-lc" defaultValue="occasion">
            <option value="neuf">Neuf</option>
            <option value="occasion">Occasion</option>
            <option value="service">Service</option>
          </select>
        </Field>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Ville" htmlFor="city">
          <input id="city" name="city" placeholder="Douala" className="input-lc" />
        </Field>
        <Field label="Quartier" htmlFor="quartier">
          <input id="quartier" name="quartier" placeholder="Akwa" className="input-lc" />
        </Field>
      </div>

      <label
        htmlFor="market-image"
        className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-line p-3 text-sm text-muted hover:bg-surface2"
      >
        <Icon name="camera" size={18} />
        {file ? file.name : 'Ajouter une photo (2 Mo max)'}
      </label>
      <input
        id="market-image"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={(event) => setFile(event.target.files?.[0] ?? null)}
      />

      {error ? (
        <p
          className="rounded-xl border border-urgent-500/30 bg-urgent-50 p-2.5 text-xs font-medium text-urgent-600 dark:bg-urgent-500/10"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? <Spinner /> : <Icon name="send" size={18} />}
        Publier l’annonce
      </Button>
    </form>
  );
}
