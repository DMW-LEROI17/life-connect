import Link from 'next/link';

import { StatusBadge } from '@/components/admin/StatusBadge';
import { getCategory } from '@/lib/constants';
import { formatCmPhone } from '@/lib/phone';
import { formatDateTime, shortRef } from '@/lib/format';
import type { RequestListRow } from '@/types/db';

export function RequestsTable({ rows }: { rows: RequestListRow[] }) {
  if (rows.length === 0) {
    return (
      <div className="mt-4 rounded-2xl border border-dashed border-line bg-surface p-10 text-center">
        <p className="font-semibold">Aucune demande pour le moment</p>
        <p className="mt-1 text-sm text-muted">
          Les nouvelles demandes apparaîtront ici automatiquement.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="mt-4 hidden overflow-hidden rounded-2xl border border-line bg-surface md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface2 text-[11px] uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3 font-semibold">Date</th>
              <th className="px-4 py-3 font-semibold">Catégorie</th>
              <th className="px-4 py-3 font-semibold">Problème</th>
              <th className="px-4 py-3 font-semibold">Quartier</th>
              <th className="px-4 py-3 font-semibold">Téléphone</th>
              <th className="px-4 py-3 font-semibold">Statut</th>
              <th className="px-4 py-3 font-semibold">Prestataire</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((row) => {
              const category = getCategory(row.categorie);

              return (
                <tr key={row.id} className="align-top">
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-muted">
                    {formatDateTime(row.cree_le)}
                  </td>
                  <td className="px-4 py-3 text-xs font-medium">
                    {category?.label ?? row.categorie}
                  </td>
                  <td className="max-w-[240px] px-4 py-3">
                    <p className="font-medium">{row.probleme}</p>
                    <p className="text-[11px] text-muted">
                      Réf. {shortRef(row.token)}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-xs">{row.quartier}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs">
                    {formatCmPhone(row.tel_client)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge statut={row.statut} />
                  </td>
                  <td className="px-4 py-3 text-xs text-muted">
                    {row.providers?.nom ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/demandes/${row.id}`}
                      className="inline-flex min-h-9 items-center rounded-lg border border-line px-3 text-xs font-semibold hover:bg-surface2"
                    >
                      Ouvrir
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 grid gap-2 md:hidden">
        {rows.map((row) => {
          const category = getCategory(row.categorie);

          return (
            <Link
              key={row.id}
              href={`/admin/demandes/${row.id}`}
              className="rounded-2xl border border-line bg-surface p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <StatusBadge statut={row.statut} />
                <span className="text-[11px] text-muted">
                  {formatDateTime(row.cree_le)}
                </span>
              </div>
              <p className="mt-2 font-semibold">{row.probleme}</p>
              <p className="mt-0.5 text-xs text-muted">
                {category?.label ?? row.categorie} · {row.quartier} ·{' '}
                {formatCmPhone(row.tel_client)}
              </p>
              <p className="mt-1 text-[11px] text-muted">
                Réf. {shortRef(row.token)}
                {row.providers?.nom ? ` · ${row.providers.nom}` : ''}
              </p>
            </Link>
          );
        })}
      </div>
    </>
  );
}
