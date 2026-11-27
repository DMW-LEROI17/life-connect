import Link from 'next/link';

import { AccountMenu } from '@/components/layout/AccountMenu';
import { HeaderNav } from '@/components/layout/HeaderNav';
import { NotificationBell } from '@/components/layout/NotificationBell';
import { Icon } from '@/components/Icons';
import { Logo } from '@/components/layout/Logo';
import { ThemeToggle } from '@/components/layout/ThemeToggle';

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-surface/90 shadow-[0_4px_22px_rgba(18,70,216,0.06)] backdrop-blur-xl">
      <div className="container-lc flex h-14 items-center justify-between gap-2 sm:h-16">
        <Logo />

        <HeaderNav />

        <div className="flex items-center gap-0.5 sm:gap-1">
          <Link
            href="/urgence"
            aria-label="Urgence"
            className="inline-flex h-10 min-w-10 touch-manipulation items-center justify-center gap-1.5 rounded-xl bg-urgent-500 px-2 text-xs font-black tracking-wide text-white shadow-soft transition active:scale-95 sm:px-3.5 sm:text-sm"
          >
            <Icon name="alert" size={16} />
            <span className="hidden sm:inline">URGENCE</span>
          </Link>

          <Link
            href="/prestataire"
            className="hidden items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-muted transition-colors hover:bg-surface2 hover:text-ink xl:inline-flex"
          >
            <Icon name="user" size={18} />
            Prestataire
          </Link>

          <NotificationBell />
          <AccountMenu />
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
