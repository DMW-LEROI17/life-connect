'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Icon } from '@/components/Icons';
import { UnreadBadge } from '@/components/layout/UnreadBadge';

const ITEMS = [
  { href: '/', label: 'Accueil', icon: 'spark' as const, accent: false },
  { href: '/explorer', label: 'Explorer', icon: 'search' as const, accent: false },
  { href: '/publier', label: 'Publier', icon: 'plus' as const, accent: true },
  { href: '/messages', label: 'Messages', icon: 'whatsapp' as const, accent: false },
  { href: '/compte', label: 'Profil', icon: 'user' as const, accent: false },
];

const HIDDEN_PREFIXES = [
  '/admin',
  '/suivi',
  '/noter',
  '/connexion',
  '/inscription',
  '/mot-de-passe-oublie',
];

export function BottomNav() {
  const pathname = usePathname();

  if (HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return null;
  }

  return (
    <nav
      className="safe-bottom fixed inset-x-0 bottom-0 z-40 rounded-t-[1.35rem] border-t border-line/80 bg-surface/95 shadow-[0_-8px_30px_rgba(16,28,69,0.10)] backdrop-blur-xl md:hidden"
      aria-label="Navigation principale"
    >
      <div className="mx-auto grid max-w-md grid-cols-5 px-1">
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
              aria-current={active ? 'page' : undefined}
              aria-label={item.label}
              prefetch
              className={`relative flex min-h-[4.1rem] touch-manipulation select-none flex-col items-center justify-center gap-0.5 text-[10px] font-bold transition-transform duration-150 active:scale-95 ${
                item.accent
                  ? '-mt-5'
                  : active
                    ? 'text-teal-600 dark:text-teal-300'
                    : 'text-muted'
              }`}
            >
              {active && !item.accent ? (
                <span className="absolute top-1 h-1 w-5 rounded-full gradient-brand" />
              ) : null}
              <span
                className={`grid place-items-center transition-all duration-200 ${
                  item.accent
                    ? 'h-12 w-12 rounded-full gradient-brand text-white shadow-lift ring-4 ring-bg'
                    : active
                      ? 'h-8 w-8 rounded-xl bg-teal-50 dark:bg-teal-500/10'
                      : 'h-8 w-8'
                }`}
              >
                <Icon name={item.icon} size={item.accent ? 23 : 20} />
              </span>
              <span
                className={`flex items-center gap-1 ${
                  item.accent ? 'text-teal-600 dark:text-teal-300' : ''
                }`}
              >
                {item.label}
                {item.href === '/messages' ? <UnreadBadge /> : null}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
