'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Icon } from '@/components/Icons';

const ITEMS = [
  { href: '/', label: 'Accueil', icon: 'spark' as const, accent: false },
  { href: '/explorer', label: 'Explorer', icon: 'search' as const, accent: false },
  { href: '/publier', label: 'Publier', icon: 'plus' as const, accent: true },
  { href: '/messages', label: 'Messages', icon: 'whatsapp' as const, accent: false },
  { href: '/compte', label: 'Profil', icon: 'user' as const, accent: false },
];

const HIDDEN_PREFIXES = ['/admin', '/suivi', '/noter', '/connexion', '/inscription'];

export function BottomNav() {
  const pathname = usePathname();

  if (HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return null;
  }

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/95 safe-bottom backdrop-blur md:hidden"
      aria-label="Navigation principale"
    >
      <div className="mx-auto grid max-w-md grid-cols-5">
        {ITEMS.map((item) => {
          const active =
            item.href === '/'
              ? pathname === '/'
              : pathname === item.href ||
                pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-h-14 flex-col items-center justify-center gap-0.5 text-[10px] font-semibold ${
                item.accent
                  ? '-mt-4'
                  : active
                    ? 'text-teal-600 dark:text-teal-300'
                    : 'text-muted'
              }`}
            >
              <span
                className={`grid place-items-center ${
                  item.accent
                    ? 'h-11 w-11 rounded-full bg-teal-500 text-white shadow-soft'
                    : ''
                }`}
              >
                <Icon name={item.icon} size={item.accent ? 22 : 20} />
              </span>
              <span className={item.accent ? 'text-teal-600 dark:text-teal-300' : ''}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
