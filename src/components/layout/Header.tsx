import Link from 'next/link';

import { AccountMenu } from '@/components/layout/AccountMenu';
import { Icon } from '@/components/Icons';
import { Logo } from '@/components/layout/Logo';
import { ThemeToggle } from '@/components/layout/ThemeToggle';

const NAV = [
  { href: '/aide', label: 'Services' },
  { href: '/connect', label: 'Demandes' },
  { href: '/match', label: 'Trouver' },
  { href: '/regions', label: 'Régions' },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg backdrop-blur">
      <div className="container-lc flex h-16 items-center justify-between gap-2">
        <Logo />

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-xl px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface2 hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <Link
            href="/urgence"
            className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-urgent-500 px-2.5 text-xs font-black tracking-wide text-white shadow-soft transition-colors hover:bg-urgent-600 sm:px-3.5 sm:text-sm"
          >
            <Icon name="alert" size={16} />
            URGENCE
          </Link>

          <Link
            href="/prestataire"
            className="hidden items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface2 hover:text-ink xl:inline-flex"
          >
            <Icon name="user" size={18} />
            Prestataire
          </Link>

          <AccountMenu />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
