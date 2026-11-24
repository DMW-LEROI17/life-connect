'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState, type FormEvent } from 'react';

import { Icon } from '@/components/Icons';
import { STATUS_LABELS } from '@/lib/constants';
import type { CategoryRow } from '@/types/db';

export function AdminRequestFilters({
  categories,
}: {
  categories: CategoryRow[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get('q') ?? '');

  function apply(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    apply({ q: q.trim() || null });
  }

  const hasFilters = Boolean(
    searchParams.get('statut') ||
      searchParams.get('categorie') ||
      searchParams.get('q'),
  );

  return (
    <form
      onSubmit={submit}
      className="mt-4 flex flex-wrap items-center gap-2"
    >
      <select
        value={searchParams.get('statut') ?? ''}
        onChange={(event) => apply({ statut: event.target.value || null })}
        className="select-lc h-10 w-auto min-w-40 text-sm"
        aria-label="Filtrer par statut"
      >
        <option value="">Tous les statuts</option>
        {Object.entries(STATUS_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>

      <select
        value={searchParams.get('categorie') ?? ''}
        onChange={(event) => apply({ categorie: event.target.value || null })}
        className="select-lc h-10 w-auto min-w-40 text-sm"
        aria-label="Filtrer par catégorie"
      >
        <option value="">Toutes les catégories</option>
        {categories.map((category) => (
          <option key={category.slug} value={category.slug}>
            {category.nom_fr}
          </option>
        ))}
      </select>

      <input
        value={q}
        onChange={(event) => setQ(event.target.value)}
        placeholder="Téléphone, client, quartier, problème"
        className="input-lc h-10 w-full text-sm sm:w-64"
        aria-label="Rechercher"
      />

      <button
        type="submit"
        className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-navy-900 px-4 text-xs font-semibold text-white dark:bg-white dark:text-navy-900"
      >
        <Icon name="search" size={16} />
        Filtrer
      </button>

      {hasFilters ? (
        <Link
          href="/admin"
          className="text-xs font-medium text-muted underline underline-offset-2 hover:text-ink"
        >
          Réinitialiser
        </Link>
      ) : null}
    </form>
  );
}
