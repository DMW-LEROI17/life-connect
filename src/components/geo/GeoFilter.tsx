'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import type { GeoTree } from '@/types/db';

export function GeoFilter({ geo }: { geo: GeoTree }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const regionId = Number(searchParams.get('region')) || null;
  const departementId = Number(searchParams.get('departement')) || null;
  const arrondissementId = Number(searchParams.get('arrondissement')) || null;

  const region = geo.find((item) => item.id === regionId) ?? null;
  const departement =
    region?.departements.find((item) => item.id === departementId) ?? null;

  function apply(next: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(next)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  return (
    <div className="grid gap-2 sm:grid-cols-3">
      <label className="block">
        <span className="mb-1 block text-[11px] font-semibold text-muted">
          Région
        </span>
        <select
          value={regionId ?? ''}
          onChange={(event) =>
            apply({
              region: event.target.value || null,
              departement: null,
              arrondissement: null,
            })
          }
          className="select-lc h-10 text-sm"
        >
          <option value="">Toutes les régions</option>
          {geo.map((item) => (
            <option key={item.id} value={item.id}>
              {item.nom}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-1 block text-[11px] font-semibold text-muted">
          Département
        </span>
        <select
          value={departementId ?? ''}
          disabled={!region}
          onChange={(event) =>
            apply({
              departement: event.target.value || null,
              arrondissement: null,
            })
          }
          className="select-lc h-10 text-sm"
        >
          <option value="">Tous les départements</option>
          {(region?.departements ?? []).map((item) => (
            <option key={item.id} value={item.id}>
              {item.nom}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-1 block text-[11px] font-semibold text-muted">
          Commune / arrondissement
        </span>
        <select
          value={arrondissementId ?? ''}
          disabled={!departement}
          onChange={(event) =>
            apply({ arrondissement: event.target.value || null })
          }
          className="select-lc h-10 text-sm"
        >
          <option value="">Toutes les communes</option>
          {(departement?.arrondissements ?? []).map((item) => (
            <option key={item.id} value={item.id}>
              {item.nom}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
