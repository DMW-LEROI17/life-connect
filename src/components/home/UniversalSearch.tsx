'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';

import { Icon } from '@/components/Icons';
import { resolveUniversalSearch } from '@/lib/universal-search';

const EXAMPLES = [
  'Je cherche un appartement à Douala',
  'Je cherche un développeur',
  'Je veux vendre mon ordinateur',
  'Je cherche un mécanicien',
];

export function UniversalSearch() {
  const router = useRouter();
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = value.trim();

    if (query.length < 2) {
      setError('Écrivez ce que vous cherchez.');
      return;
    }

    setError('');
    const target = resolveUniversalSearch(query);
    router.push(target.href);
  }

  return (
    <div className="w-full">
      <form
        onSubmit={submit}
        className="rounded-2xl border border-line bg-surface p-2 shadow-soft sm:rounded-full"
      >
        <div className="flex items-center gap-1.5">
          <Icon name="search" size={21} className="ml-2 shrink-0 text-muted" />
          <input
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="De quoi avez-vous besoin aujourd’hui ? (Ex : un mécanicien, un appartement, un emploi…)"
            className="min-h-11 w-full bg-transparent px-1 text-sm text-ink outline-none placeholder:text-muted sm:text-base"
            aria-label="Recherche universelle"
          />
          <button
            type="submit"
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-teal-500 px-3 text-xs font-bold text-white sm:px-4 sm:text-sm"
          >
            <Icon name="search" size={16} />
            <span className="hidden sm:inline">Chercher</span>
          </button>
        </div>
      </form>

      {error ? (
        <p className="mt-1 text-xs font-medium text-urgent-600" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-2 flex flex-wrap gap-1.5">
        {EXAMPLES.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => setValue(example)}
            className="rounded-full border border-line bg-surface px-2.5 py-1 text-[10px] font-medium text-muted hover:border-teal-500/40 hover:text-ink"
          >
            {example}
          </button>
        ))}
      </div>
    </div>
  );
}
