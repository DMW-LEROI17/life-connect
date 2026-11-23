import Link from 'next/link';

import { Badge } from '@/components/ui/Badge';

export function AdminTabs({
  active,
  pendingRequests,
  pendingProviders,
}: {
  active: 'requests' | 'providers' | 'categories';
  pendingRequests: number;
  pendingProviders: number;
}) {
  const base =
    'flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold transition-colors sm:flex-none sm:px-5';

  const items = [
    {
      key: 'requests' as const,
      href: '/admin',
      label: 'Demandes',
      badge: pendingRequests,
      badgeClass:
        'border-urgent-500/30 bg-urgent-50 text-urgent-600 dark:bg-urgent-500/10',
    },
    {
      key: 'providers' as const,
      href: '/admin/prestataires',
      label: 'Prestataires',
      badge: pendingProviders,
      badgeClass:
        'border-amber-500/30 bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
    },
    {
      key: 'categories' as const,
      href: '/admin/categories',
      label: 'Catégories',
      badge: 0,
      badgeClass: '',
    },
  ];

  return (
    <nav className="mt-5 flex flex-wrap gap-1 rounded-xl border border-line bg-surface2 p-1">
      {items.map((item) => (
        <Link
          key={item.key}
          href={item.href}
          className={`${base} ${
            active === item.key
              ? 'bg-surface text-ink shadow-sm'
              : 'text-muted hover:text-ink'
          }`}
        >
          {item.label}
          {item.badge > 0 ? (
            <Badge className={item.badgeClass}>{item.badge}</Badge>
          ) : null}
        </Link>
      ))}
    </nav>
  );
}
