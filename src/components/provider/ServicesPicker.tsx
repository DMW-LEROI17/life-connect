'use client';

import { useMemo, useState } from 'react';

import { Icon, safeIcon } from '@/components/Icons';
import { Badge } from '@/components/ui/Badge';
import type { CategoryWithSubs } from '@/types/db';

export function ServicesPicker({
  catalog,
  selected,
  onChange,
}: {
  catalog: CategoryWithSubs[];
  selected: number[];
  onChange: (ids: number[]) => void;
}) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    if (!q) return catalog;

    return catalog
      .map((category) => {
        const categoryMatch =
          category.nom_fr.toLowerCase().includes(q) ||
          category.slug.includes(q);

        const subcategories = category.subcategories.filter(
          (sub) =>
            sub.nom_fr.toLowerCase().includes(q) || sub.slug.includes(q),
        );

        if (categoryMatch) return category;
        if (subcategories.length === 0) return null;
        return { ...category, subcategories };
      })
      .filter(Boolean) as CategoryWithSubs[];
  }, [catalog, query]);

  function toggle(id: number) {
    if (selected.includes(id)) {
      onChange(selected.filter((value) => value !== id));
    } else {
      onChange([...selected, id]);
    }
  }

  if (catalog.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-line bg-surface p-4 text-sm text-muted">
        Le catalogue de services n’est pas encore chargé. Exécutez les scripts
        SQL V2 puis rechargez la page.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold">Mes services *</p>
          <p className="text-xs text-muted">
            Choisissez tout ce que vous savez faire. Les clients vous trouveront
            pour chacun de ces services.
          </p>
        </div>
        <Badge className="border-teal-500/30 bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300">
          {selected.length} sélectionné{selected.length > 1 ? 's' : ''}
        </Badge>
      </div>

      <div className="relative">
        <Icon
          name="search"
          size={18}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
        />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Rechercher un service (plombier, moto, couture…)"
          className="input-lc pl-10"
        />
      </div>

      <div className="max-h-[420px] space-y-2 overflow-y-auto rounded-xl border border-line bg-surface p-2">
        {filtered.length === 0 ? (
          <p className="p-3 text-sm text-muted">Aucun service trouvé.</p>
        ) : null}

        {filtered.map((category) => {
          const open = query.trim().length > 0;

          return (
            <details
              key={category.id}
              open={open || undefined}
              className="rounded-lg border border-line bg-bg"
            >
              <summary className="flex cursor-pointer items-center justify-between gap-2 px-3 py-2.5 text-sm font-semibold">
                <span className="flex items-center gap-2">
                  <Icon name={safeIcon(category.icon)} size={16} />
                  {category.nom_fr}
                </span>
                <span className="text-[11px] font-normal text-muted">
                  {category.subcategories.length} service
                  {category.subcategories.length > 1 ? 's' : ''}
                </span>
              </summary>

              <div className="grid gap-1 border-t border-line p-2 sm:grid-cols-2">
                {category.subcategories.map((subcategory) => (
                  <label
                    key={subcategory.id}
                    className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-surface2"
                  >
                    <input
                      type="checkbox"
                      checked={selected.includes(subcategory.id)}
                      onChange={() => toggle(subcategory.id)}
                      className="h-4 w-4 accent-teal-500"
                    />
                    <span>{subcategory.nom_fr}</span>
                  </label>
                ))}
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}
