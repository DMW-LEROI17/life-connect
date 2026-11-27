import Link from 'next/link';

import { Icon } from '@/components/Icons';
import { Logo } from '@/components/layout/Logo';

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
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-line bg-gradient-to-b from-[#EAF3FF] to-[#F8FBFF]">
      <div className="container-lc grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Logo />
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">
            Un besoin. Une connexion. Une solution. Emploi, logement, services,
            produits, opportunités et communauté, au même endroit.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/publier"
              className="inline-flex min-h-10 items-center gap-2 rounded-xl gradient-brand px-4 text-xs font-bold text-white shadow-soft"
            >
              <Icon name="plus" size={15} />
              Publier
            </Link>
            <Link
              href="/urgence"
              className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-urgent-500/25 bg-white px-4 text-xs font-bold text-urgent-600"
            >
              <Icon name="alert" size={15} />
              Urgence
            </Link>
          </div>
        </div>

        <FooterColumn title="Explorer" links={EXPLORER} />
        <FooterColumn title="Nos services" links={SERVICES} />
        <FooterColumn title="Informations" links={INFO} />
      </div>

      <div className="border-t border-line">
        <div className="container-lc flex flex-col gap-2 py-4 text-[11px] text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} LIFE CONNECT · Cameroun. Les secours officiels restent le
            117, le 118 et le 119.
          </p>
          <p className="font-semibold italic text-teal-700">
            Ensemble, connectons le monde !
          </p>
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
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted">
        {title}
      </p>
      <ul className="mt-3 space-y-2 text-sm">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-ink/70 transition-colors hover:text-teal-700"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
