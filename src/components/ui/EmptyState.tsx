import Link from 'next/link';

import { Icon } from '@/components/Icons';
import type { IconName } from '@/types/db';

export function EmptyState({
  icon = 'spark',
  title,
  text,
  href,
  action = 'Publier',
  className = '',
}: {
  icon?: IconName;
  title: string;
  text: string;
  href?: string;
  action?: string;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[1.5rem] border border-dashed border-line bg-gradient-to-b from-surface2/70 to-surface px-5 py-8 text-center shadow-soft ${className}`}
    >
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-teal-50 to-cyan-50 text-teal-700 shadow-sm dark:from-teal-500/10 dark:to-cyan-500/10 dark:text-teal-300">
        <Icon name={icon} size={25} />
      </span>
      <p className="mt-3 text-base font-black">{title}</p>
      <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-muted sm:text-sm">
        {text}
      </p>
      {href ? (
        <Link
          href={href}
          className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl gradient-brand px-4 text-xs font-bold text-white shadow-soft active:scale-[0.98]"
        >
          <Icon name="plus" size={15} />
          {action}
        </Link>
      ) : null}
    </div>
  );
}
