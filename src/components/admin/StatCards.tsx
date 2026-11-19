import { formatDuration, formatNote, formatPercent } from '@/lib/format';
import type { AdminStats } from '@/types/db';

export function StatCards({ stats }: { stats: AdminStats }) {
  const items = [
    {
      label: 'Aujourd’hui',
      value: String(stats.aujourdhui),
      hint: 'demandes reçues',
    },
    {
      label: 'En attente',
      value: String(stats.en_attente),
      hint: 'à traiter',
    },
    {
      label: 'Temps de réponse',
      value: formatDuration(stats.temps_reponse_moyen_sec),
      hint: 'moyen, 30 jours',
    },
    {
      label: 'Résolues',
      value: formatPercent(stats.pourcentage_resolu),
      hint: 'des demandes closes',
    },
    {
      label: 'Note moyenne',
      value:
        stats.note_moyenne == null
          ? '—'
          : `${formatNote(stats.note_moyenne)}/5`,
      hint: 'avis clients',
    },
  ];

  return (
    <div className="mt-5 grid grid-cols-2 gap-2.5 lg:grid-cols-5">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-2xl border border-line bg-surface p-4"
        >
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
            {item.label}
          </p>
          <p className="mt-1 text-xl font-bold tracking-tight">{item.value}</p>
          <p className="mt-0.5 text-[11px] text-muted">{item.hint}</p>
        </div>
      ))}
    </div>
  );
}
