import Link from 'next/link';

import { Icon } from '@/components/Icons';

export function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2.5"
      aria-label="LIFE CONNECT – Accueil"
    >
      <span className="grid h-10 w-10 place-items-center rounded-2xl gradient-brand text-white shadow-soft">
        <Icon name="spark" size={20} />
      </span>
      <span className="leading-tight">
        <span className="block text-[15px] font-black tracking-tight text-ink">
          LIFE CONNECT
        </span>
        <span className="block text-[9px] font-bold uppercase tracking-[0.18em] text-teal-600 dark:text-teal-300">
          Everything. Everyone.
        </span>
      </span>
    </Link>
  );
}
