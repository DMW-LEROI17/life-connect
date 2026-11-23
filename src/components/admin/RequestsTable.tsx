import Link from 'next/link';

import { StatusBadge } from '@/components/admin/StatusBadge';
import { Badge } from '@/components/ui/Badge';
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
              <th className="px-4 py-3 font-semibold">Demande</th>
              <th className="px-4 py-3 font-semibold">Zone</th>
              <th className="px-4 py-3 font-semibold">Téléphone</th>
              <th className="px-4 py-3 font-semibold">Statut</th>
              <th className="px-4 py-3 font-semibold">Prestataire</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((row) => (
              <tr key={row.id} className="align-top">
                <td className="whitespace-nowrap px-4 py-3 text-xs text-muted">
                  {formatDateTime(row.cree_le)}
                </td>
                <td className="max-w-[280px] px-4 py-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {row.is_emergency ? (
                      <Badge className="border-urgent-500/40 bg-urgent-500 text-white">
                        URGENCE
                      </Badge>
                    ) : null}
                    <span className="text-[11px] font-semibold text-muted">
                      {row.categorie_nom || row.categorie}
                    </span>
                  </div>
                  <p className="mt-0.5 font-medium">{row.probleme}</p>
                  <p className="text-[11px] text-muted">
                    Réf. {shortRef(row.token)}
                  </p>
                </td>
                <td className="px-4 py-3 text-xs">
                  <p>{row.quartier}</p>
                  {row.region_nom ? (
                    <p className="text-[11px] text-muted">{row.region_nom}</p>
                  ) : null}
                </td>
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
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 grid gap-2 md:hidden">
        {rows.map((row) => (
          <Link
            key={row.id}
            href={`/admin/demandes/${row.id}`}
            className={`rounded-2xl border bg-surface p-4 ${
              row.is_emergency
                ? 'border-urgent-500/40'
                : 'border-line'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <StatusBadge statut={row.statut} />
              <span className="text-[11px] text-muted">
                {formatDateTime(row.cree_le)}
              </span>
            </div>
            {row.is_emergency ? (
              <p className="mt-2 text-[10px] font-black tracking-wide text-urgent-600">
                URGENCE
              </p>
            ) : null}
            <p className="mt-1 font-semibold">{row.probleme}</p>
            <p className="mt-0.5 text-xs text-muted">
              {row.categorie_nom || row.categorie} · {row.quartier}
              {row.region_nom ? ` · ${row.region_nom}` : ''}
            </p>
            <p className="mt-1 text-[11px] text-muted">
              {formatCmPhone(row.tel_client)} · Réf. {shortRef(row.token)}
              {row.providers?.nom ? ` · ${row.providers.nom}` : ''}
            </p>
          </Link>
        ))}
      </div>
    </>
  );
}
