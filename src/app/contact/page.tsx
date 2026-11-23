import type { Metadata } from 'next';

import { Icon } from '@/components/Icons';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { ADMIN_WHATSAPP } from '@/lib/constants';
import { waLink } from '@/lib/whatsapp';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Contactez LIFE CONNECT – HELP ME à Douala, Cameroun : WhatsApp, e-mail, administration.',
};

export default function ContactPage() {
  return (
    <>
      <Header />
      <main id="contenu" className="container-lc max-w-2xl py-10">
        <h1 className="text-3xl font-bold tracking-tight">Contact</h1>
        <p className="mt-2 text-sm text-muted">
          Une question, un problème, une demande de suppression de données ?
          Écrivez-nous.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <a
            href={waLink(
              `+${ADMIN_WHATSAPP}`,
              'Bonjour, je vous contacte au sujet de LIFE CONNECT.',
            )}
            target="_blank"
            rel="noreferrer"
            className="rounded-2xl border border-line bg-surface p-5 hover:border-teal-500/40"
          >
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#25D366]/15 text-[#128C4A]">
              <Icon name="whatsapp" size={20} />
            </span>
            <p className="mt-3 font-semibold">WhatsApp</p>
            <p className="mt-1 text-sm text-muted">+237 672 115 570</p>
            <p className="mt-1 text-xs text-muted">Réponse sous 24 h.</p>
          </a>

          <a
            href="mailto:dmwleroi17@gmail.com"
            className="rounded-2xl border border-line bg-surface p-5 hover:border-teal-500/40"
          >
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-navy-900 text-white">
              <Icon name="send" size={20} />
            </span>
            <p className="mt-3 font-semibold">E-mail</p>
            <p className="mt-1 text-sm text-muted">dmwleroi17@gmail.com</p>
            <p className="mt-1 text-xs text-muted">
              Pour les demandes écrites et les données personnelles.
            </p>
          </a>
        </div>

        <div className="mt-5 rounded-2xl border border-line bg-surface p-5 text-sm text-muted">
          <p className="font-semibold text-ink">Adresse</p>
          <p className="mt-1">Douala, Cameroun.</p>
          <p className="mt-3 font-semibold text-ink">Urgences</p>
          <p className="mt-1">
            Ne nous écrivez pas pour une urgence vitale : appelez le 117, le 118
            ou le 119.
          </p>
        </div>

        <div className="mt-5 rounded-2xl border border-line bg-surface p-5 text-sm text-muted">
          <p className="font-semibold text-ink">Prestataires</p>
          <p className="mt-1">
            Pour être validé, créez votre profil puis attendez notre message
            WhatsApp. Aucun paiement n’est demandé.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
