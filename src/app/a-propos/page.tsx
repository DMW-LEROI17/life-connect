import type { Metadata } from 'next';

import { Icon } from '@/components/Icons';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { ButtonLink } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'À propos',
  description:
    'LIFE CONNECT – HELP ME : un besoin, une connexion, une solution. Assistance locale dans les 10 régions du Cameroun.',
};

export default function AProposPage() {
  return (
    <>
      <Header />
      <main id="contenu" className="container-lc max-w-2xl py-10">
        <h1 className="text-3xl font-bold tracking-tight">
          Un besoin. Une connexion. Une solution.
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          LIFE CONNECT – HELP ME met en relation, au Cameroun, des personnes qui
          ont un besoin concret avec des prestataires et des aideurs vérifiés :
          santé, maison, auto, numérique, famille, événements, transport,
          démarches.
        </p>

        <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted">
          <p>
            Le client n’a pas besoin de créer un compte : un numéro de téléphone,
            une zone et une description suffisent. L’administrateur alerte les
            professionnels proches, puis le client est mis en contact.
          </p>
          <p>
            Les prestataires sont inscrits avec leurs services et leurs zones
            d’intervention. Chaque profil est validé avant d’être proposé. Le
            client paie directement le prestataire : la plateforme ne prélève
            pas de commission dans cette version.
          </p>
          <p>
            LIFE CONNECT couvre les 10 régions du Cameroun. Les quartiers et
            villages non listés peuvent être saisis librement dans le
            formulaire.
          </p>
        </div>

        <div className="mt-6 rounded-2xl bg-urgent-600 p-5 text-white">
          <div className="flex items-start gap-3">
            <Icon name="alert" size={22} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-bold">LIFE CONNECT ne remplace pas les secours</p>
              <p className="mt-1 text-sm text-white/85">
                En cas d’urgence vitale, appelez le 117 (police), le 118
                (pompiers) ou le 119 (SAMU / ambulance). Les fiches de premiers
                gestes ne remplacent pas un médecin.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <ButtonLink href="/aide">
            <Icon name="search" size={18} />
            Trouver un service
          </ButtonLink>
          <ButtonLink href="/prestataire" variant="outline">
            <Icon name="user" size={18} />
            Devenir prestataire
          </ButtonLink>
        </div>
      </main>
      <Footer />
    </>
  );
}
