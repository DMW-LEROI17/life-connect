import Link from 'next/link';

import { Badge } from '@/components/ui/Badge';

export function AdminTabs({
  active,
  pendingRequests,
  pendingProviders,
}: {
  active: 'requests' | 'providers';
  pendingRequests: number;
  pendingProviders: number;
}) {
  const base =
    'flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold transition-colors sm:flex-none sm:px-5';

  return (
    <nav className="mt-5 flex gap-1 rounded-xl border border-line bg-surface2 p-1">
      <Link
        href="/admin"
        className={`${base} ${
          active === 'requests'
            ? 'bg-surface text-ink shadow-sm'
            : 'text-muted hover:text-ink'
        }`}
      >
        Demandes
        {pendingRequests > 0 ? (
          <Badge className="border-urgent-500/30 bg-urgent-50 text-urgent-600 dark:bg-urgent-500/10">
            {pendingRequests}
          </Badge>
        ) : null}
      </Link>

      <Link
        href="/admin/prestataires"
        className={`${base} ${
          active === 'providers'
            ? 'bg-surface text-ink shadow-sm'
            : 'text-muted hover:text-ink'
        }`}
      >
        Prestataires
        {pendingProviders > 0 ? (
          <Badge className="border-amber-500/30 bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
            {pendingProviders}
          </Badge>
        ) : null}
      </Link>
    </nav>
  );
}
