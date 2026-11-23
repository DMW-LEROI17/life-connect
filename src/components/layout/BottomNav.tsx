'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Icon } from '@/components/Icons';

const ITEMS = [
  { href: '/', label: 'Accueil', icon: 'spark' as const },
  { href: '/aide', label: 'Aide', icon: 'search' as const },
  { href: '/connect', label: 'Demandes', icon: 'send' as const },
  { href: '/messages', label: 'Messages', icon: 'whatsapp' as const },
  { href: '/compte', label: 'Compte', icon: 'user' as const },
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
                active ? 'text-teal-600 dark:text-teal-300' : 'text-muted'
              }`}
            >
              <Icon name={item.icon} size={20} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
