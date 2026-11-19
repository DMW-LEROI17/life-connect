import type { Metadata } from 'next';

import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';

export const metadata: Metadata = {
  title: 'Conditions d’utilisation',
};

export default function ConditionsPage() {
  return (
    <>
      <Header />
      <main id="contenu" className="container-lc max-w-2xl py-10">
        <h1 className="text-3xl font-bold tracking-tight">
          Conditions d’utilisation
        </h1>
        <p className="mt-2 text-sm text-muted">
          Dernière mise à jour : novembre 2026.
        </p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted">
          <section>
            <h2 className="text-base font-bold text-ink">1. Objet</h2>
            <p className="mt-2">
              LIFE CONNECT – HELP ME est un service de mise en relation entre
              des personnes qui ont un besoin urgent (mécanique, dépannage,
              technique) et des prestataires indépendants à Douala.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-ink">
              2. Ce que le service ne fait pas
            </h2>
            <p className="mt-2">
              La plateforme ne réalise pas les réparations, n’emploie pas les
              prestataires et ne garantit pas qu’un prestataire sera disponible.
              Le prix, la qualité et les délais sont convenus directement entre
              le client et le prestataire.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-ink">
              3. Urgences vitales
            </h2>
            <p className="mt-2">
              En cas d’urgence vitale, d’incendie, d’agression ou de danger
              immédiat, appelez les secours : 119 (ambulance), 117 (police) ou
              118 (pompiers). LIFE CONNECT ne transmet aucune demande aux
              services de secours.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-ink">
              4. Engagements des utilisateurs
            </h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Donner un numéro de téléphone valide et joignable.</li>
              <li>Décrire honnêtement le problème.</li>
              <li>Ne pas envoyer de demandes abusives ou répétées.</li>
              <li>Respecter le prestataire et convenir clairement du prix.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-ink">
              5. Prestataires
            </h2>
            <p className="mt-2">
              L’inscription est gratuite. Chaque profil est vérifié avant d’être
              visible. La plateforme peut suspendre un profil en cas de
              comportement fautif, de fraude ou de plaintes répétées. Aucune
              commission n’est prélevée dans cette version.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-ink">
              6. Responsabilité
            </h2>
            <p className="mt-2">
              La plateforme met en relation les parties de bonne foi. Elle ne
              peut être tenue responsable des dommages, retards, prix ou
              malfaçons résultant de l’intervention d’un prestataire
              indépendant. Les utilisateurs doivent vérifier l’identité et les
              compétences du prestataire avant l’intervention.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-ink">
              7. Données personnelles
            </h2>
            <p className="mt-2">
              Le traitement des données est décrit dans la{' '}
              <a
                href="/legal/confidentialite"
                className="font-medium text-ink underline underline-offset-2"
              >
                politique de confidentialité
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-ink">
              8. Droit applicable
            </h2>
            <p className="mt-2">
              Les présentes conditions sont soumises au droit camerounais. Tout
              litige sera d’abord discuté à l’amiable, puis porté devant les
              juridictions compétentes de Douala.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-ink">9. Contact</h2>
            <p className="mt-2">
              dmwleroi17@gmail.com — WhatsApp : +237 672 115 570.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
