import Link from 'next/link';

import { Icon } from '@/components/Icons';
import { LogoutButton } from '@/components/admin/LogoutButton';

export function AdminHeader() {
  return (
    <header className="border-b border-line bg-surface">
      <div className="container-lc flex h-16 items-center justify-between gap-3">
        <Link href="/admin" className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-navy-900 text-white">
            <Icon name="spark" size={18} />
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-extrabold tracking-tight">
              LIFE CONNECT
            </span>
            <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
              Administration
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="hidden text-sm font-medium text-muted hover:text-ink sm:inline"
          >
            Voir le site
          </Link>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
