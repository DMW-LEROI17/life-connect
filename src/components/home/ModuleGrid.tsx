import Link from 'next/link';

import { Icon } from '@/components/Icons';

const MODULES = [
  {
    href: '/radar?kind=emploi',
    label: 'Emploi',
    icon: 'briefcase' as const,
    image: '/images/cat-emploi.jpg',
  },
  {
    href: '/market?q=logement',
    label: 'Logement',
    icon: 'home' as const,
    image: '/images/cat-logement.jpg',
  },
  {
    href: '/people',
    label: 'Services',
    icon: 'wrench' as const,
    image: '/images/cat-services.jpg',
  },
  {
    href: '/market',
    label: 'Acheter / vendre',
    icon: 'cart' as const,
    image: '/images/cat-market.jpg',
  },
  {
    href: '/radar?kind=partenariat',
    label: 'Partenaires',
    icon: 'handshake' as const,
    image: '/images/cat-partenaires.jpg',
  },
  {
    href: '/radar',
    label: 'Opportunités',
    icon: 'trophy' as const,
    image: '/images/cat-construction.jpg',
  },
  {
    href: '/community',
    label: 'Communauté',
    icon: 'users' as const,
    image: '/images/cat-community.jpg',
  },
  {
    href: '/aide',
    label: 'HELP ME',
    icon: 'alert' as const,
    image: null,
  },
];

export function ModuleGrid() {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
      {MODULES.map((module) => (
        <Link
          key={module.label}
          href={module.href}
          className={`group relative h-[120px] overflow-hidden rounded-[1.35rem] shadow-soft transition-all hover:-translate-y-1 hover:shadow-lift sm:h-[132px] ${
            module.image ? 'bg-navy-900' : 'bg-gradient-to-br from-urgent-500 to-urgent-600'
          }`}
        >
          {module.image ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={module.image}
                alt=""
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <span className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-950/25 to-transparent" />
            </>
          ) : (
            <span className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10" />
          )}

          <span className="relative flex h-full flex-col justify-between p-3">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-white/90 text-navy-900 shadow-sm backdrop-blur">
              <Icon name={module.icon} size={17} />
            </span>
            <span className="flex items-end justify-between gap-2">
              <span className="text-xs font-black leading-tight text-white sm:text-sm">
                {module.label}
              </span>
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/20 text-white backdrop-blur">
                <Icon name="chevronRight" size={13} />
              </span>
            </span>
          </span>
        </Link>
      ))}
    </div>
  );
}
