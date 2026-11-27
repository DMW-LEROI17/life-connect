'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { UnreadBadge } from '@/components/layout/UnreadBadge';

const NAV = [
  { href: '/', label: 'Accueil' },
  { href: '/explorer', label: 'Explorer' },
  { href: '/publier', label: 'Publier' },
  { href: '/messages', label: 'Messages' },
  { href: '/compte', label: 'Profil' },
];

export function HeaderNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden items-center gap-1 lg:flex">
      {NAV.map((item) => {
        const active =
          item.href === '/'
            ? pathname === '/'
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
              active
                ? 'bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300'
                : 'text-muted hover:bg-surface2 hover:text-ink'
            }`}
          >
            {item.label}
            {item.href === '/messages' ? <UnreadBadge /> : null}
          </Link>
        );
      })}
    </nav>
  );
}
