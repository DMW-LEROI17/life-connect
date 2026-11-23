import Link from 'next/link';

import { Icon } from '@/components/Icons';
import { Logo } from '@/components/layout/Logo';
import { ADMIN_WHATSAPP } from '@/lib/constants';
import { waLink } from '@/lib/whatsapp';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-line bg-surface">
      <div className="container-lc grid gap-8 py-10 sm:grid-cols-3">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-muted">
            Un besoin. Une connexion. Une solution.
            <br />
            Tout le Cameroun, 10 régions.
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold">Le service</p>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li>
              <Link href="/urgence" className="font-semibold text-urgent-600 hover:text-urgent-500">
                Urgence 117 / 118 / 119
              </Link>
            </li>
            <li>
              <Link href="/aide" className="hover:text-ink">
                Demander de l’aide
              </Link>
            </li>
            <li>
              <Link href="/connect" className="hover:text-ink">
                Demandes & offres
              </Link>
            </li>
            <li>
              <Link href="/match" className="hover:text-ink">
                Trouver une solution
              </Link>
            </li>
            <li>
              <Link href="/regions" className="hover:text-ink">
                Les 10 régions
              </Link>
            </li>
            <li>
              <Link href="/prestataire" className="hover:text-ink">
                Devenir prestataire
              </Link>
            </li>
            <li>
              <Link href="/a-propos" className="hover:text-ink">
                À propos
              </Link>
            </li>
            <li>
              <Link href="/faq" className="hover:text-ink">
                FAQ
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-ink">
                Contact
              </Link>
            </li>
            <li>
              <Link href="/legal/confidentialite" className="hover:text-ink">
                Confidentialité
              </Link>
            </li>
            <li>
              <Link href="/legal/conditions" className="hover:text-ink">
                Conditions d’utilisation
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold">Contact</p>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li>
              <a
                href={waLink(
                  `+${ADMIN_WHATSAPP}`,
                  'Bonjour, j’ai besoin d’aide sur LIFE CONNECT.',
                )}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 hover:text-ink"
              >
                <Icon name="whatsapp" size={16} />
                WhatsApp
              </a>
            </li>
            <li>
              <a
                href="mailto:dmwleroi17@gmail.com"
                className="hover:text-ink"
              >
                dmwleroi17@gmail.com
              </a>
            </li>
            <li>
              <Link href="/admin" className="hover:text-ink">
                Espace administration
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line py-4">
        <p className="container-lc text-center text-xs text-muted">
          © {year} LIFE CONNECT – HELP ME. Cameroun. Les secours officiels
          restent le 117, le 118 et le 119.
        </p>
      </div>
    </footer>
  );
}
