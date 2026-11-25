import Link from 'next/link';

import { Icon } from '@/components/Icons';

export function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2.5"
      aria-label="LIFE CONNECT – Accueil"
    >
      <span className="grid h-10 w-10 place-items-center rounded-2xl bg-navy-900 text-white shadow-soft">
        <Icon name="spark" size={20} />
      </span>
      <span className="leading-tight">
        <span className="block text-[15px] font-extrabold tracking-tight">
          LIFE CONNECT
        </span>
        <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
          Everything. Everyone.
        </span>
      </span>
    </Link>
  );
}
