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
            Douala, Cameroun.
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold">Le service</p>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li>
              <Link href="/aide" className="hover:text-ink">
                Demander de l’aide
              </Link>
            </li>
            <li>
              <Link href="/prestataire" className="hover:text-ink">
                Devenir prestataire
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
          © {year} LIFE CONNECT – HELP ME. Fait à Douala.
        </p>
      </div>
    </footer>
  );
}
