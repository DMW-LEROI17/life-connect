import Link from 'next/link';

import { Icon } from '@/components/Icons';
import { ADMIN_WHATSAPP } from '@/lib/constants';
import { waLink } from '@/lib/whatsapp';

const EXPLORER = [
  { href: '/market', label: 'Market' },
  { href: '/radar', label: 'Emplois & opportunités' },
  { href: '/people', label: 'People' },
  { href: '/community', label: 'Community' },
  { href: '/exchange', label: 'Exchange' },
  { href: '/explorer', label: 'Tout explorer' },
];

const SERVICES = [
  { href: '/aide', label: 'HELP ME' },
  { href: '/connect', label: 'Demandes & offres' },
  { href: '/match', label: 'LIFE AI' },
  { href: '/demande', label: 'Créer une demande' },
  { href: '/prestataire', label: 'Devenir prestataire' },
  { href: '/regions', label: 'Les régions' },
];

const INFO = [
  { href: '/a-propos', label: 'À propos' },
  { href: '/faq', label: 'FAQ' },
  { href: '/contact', label: 'Contact' },
  { href: '/legal/confidentialite', label: 'Confidentialité' },
  { href: '/legal/conditions', label: "Conditions d’utilisation" },
  { href: '/admin', label: 'Administration' },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 bg-navy-950 text-white">
      <div className="container-lc grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl gradient-brand text-white shadow-soft">
              <Icon name="spark" size={22} />
            </span>
            <div>
              <p className="text-base font-black tracking-tight">LIFE CONNECT</p>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/50">
                Everything. Everyone. Everywhere.
              </p>
            </div>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/65">
            Un besoin. Une connexion. Une solution. Emploi, logement, services,
            produits, opportunités et communauté, au même endroit.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              href="/publier"
              className="inline-flex min-h-10 items-center gap-2 rounded-xl gradient-brand px-4 text-xs font-bold text-white"
            >
              <Icon name="plus" size={15} />
              Publier
            </Link>
            <Link
              href="/urgence"
              className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-urgent-500/40 px-4 text-xs font-bold text-urgent-100"
            >
              <Icon name="alert" size={15} />
              Urgence
            </Link>
          </div>
        </div>

        <FooterColumn title="Explorer" links={EXPLORER} />
        <FooterColumn title="Nos services" links={SERVICES} />
        <FooterColumn title="Informations" links={INFO} />

        <div className="sm:col-span-2 lg:col-span-5">
          <div className="mt-2 flex flex-col gap-3 border-t border-white/10 pt-5 text-xs text-white/60 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {year} LIFE CONNECT. Les secours officiels restent le 117, le
              118 et le 119.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <a
                href={waLink(
                  `+${ADMIN_WHATSAPP}`,
                  'Bonjour, j’ai besoin d’aide sur LIFE CONNECT.',
                )}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 hover:text-white"
              >
                <Icon name="whatsapp" size={15} />
                WhatsApp
              </a>
              <a
                href="mailto:dmwleroi17@gmail.com"
                className="inline-flex items-center gap-1.5 hover:text-white"
              >
                <Icon name="send" size={14} />
                dmwleroi17@gmail.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/40">
        {title}
      </p>
      <ul className="mt-3 space-y-2 text-sm">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-white/65 transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
