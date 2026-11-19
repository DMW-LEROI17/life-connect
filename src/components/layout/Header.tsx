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
            href="/prestataire"
            className="hidden items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface2 hover:text-ink sm:inline-flex"
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
