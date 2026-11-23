import Link from 'next/link';

import { Icon } from '@/components/Icons';
import { Logo } from '@/components/layout/Logo';
import { ThemeToggle } from '@/components/layout/ThemeToggle';

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg backdrop-blur">
      <div className="container-lc flex h-16 items-center justify-between gap-3">
        <Logo />

        <div className="flex items-center gap-1.5">
          <Link
            href="/urgence"
            className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-urgent-500 px-2.5 text-xs font-black tracking-wide text-white shadow-soft transition-colors hover:bg-urgent-600 sm:px-3.5 sm:text-sm"
          >
            <Icon name="alert" size={16} />
            URGENCE
          </Link>
          <Link
            href="/prestataire"
            className="hidden items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface2 hover:text-ink md:inline-flex"
          >
            <Icon name="user" size={18} />
            Prestataire
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
