import Link from 'next/link';

import { Icon } from '@/components/Icons';

const MODULES = [
  {
    href: '/radar?kind=emploi',
    label: 'Emploi',
    icon: 'briefcase' as const,
    color: 'bg-blue-50 text-blue-600',
  },
  {
    href: '/market?q=logement',
    label: 'Logement',
    icon: 'home' as const,
    color: 'bg-emerald-50 text-emerald-600',
  },
  {
    href: '/people',
    label: 'Services',
    icon: 'wrench' as const,
    color: 'bg-[#F3E8FF] text-[#7C3AED]',
  },
  {
    href: '/market',
    label: 'Acheter / vendre',
    icon: 'cart' as const,
    color: 'bg-orange-50 text-orange-600',
  },
  {
    href: '/radar?kind=partenariat',
    label: 'Partenaires',
    icon: 'handshake' as const,
    color: 'bg-cyan-50 text-cyan-600',
  },
  {
    href: '/radar',
    label: 'Opportunités',
    icon: 'trophy' as const,
    color: 'bg-purple-50 text-purple-600',
  },
  {
    href: '/community',
    label: 'Communauté',
    icon: 'users' as const,
    color: 'bg-emerald-50 text-emerald-600',
  },
  {
    href: '/aide',
    label: 'HELP ME',
    icon: 'alert' as const,
    color: 'bg-urgent-50 text-urgent-600',
  },
];

export function ModuleGrid() {
  return (
    <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
      {MODULES.map((module) => (
        <Link
          key={module.label}
          href={module.href}
          className="group flex min-h-[104px] flex-col items-center justify-center gap-2 rounded-2xl border border-line bg-surface p-2 text-center shadow-soft transition-all hover:-translate-y-0.5 hover:border-teal-500/30 sm:min-h-[112px]"
        >
          <span
            className={`grid h-11 w-11 place-items-center rounded-xl ${module.color}`}
          >
            <Icon name={module.icon} size={21} />
          </span>
          <span className="text-[10px] font-bold leading-tight text-ink sm:text-xs">
            {module.label}
          </span>
        </Link>
      ))}
    </div>
  );
}
