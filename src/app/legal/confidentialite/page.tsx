import type { Metadata } from 'next';

import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';

export const metadata: Metadata = {
  title: 'Politique de confidentialité',
};

export default function ConfidentialitePage() {
  return (
    <>
      <Header />
      <main id="contenu" className="container-lc max-w-2xl py-10">
        <h1 className="text-3xl font-bold tracking-tight">
          Politique de confidentialité
        </h1>
        <p className="mt-2 text-sm text-muted">
          Dernière mise à jour : novembre 2026.
        </p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted">
          <section>
            <h2 className="text-base font-bold text-ink">1. Responsable</h2>
            <p className="mt-2">
              LIFE CONNECT – HELP ME, Douala, Cameroun. Contact :{' '}
              <a
                href="mailto:dmwleroi17@gmail.com"
                className="font-medium text-ink underline underline-offset-2"
              >
                dmwleroi17@gmail.com
              </a>{' '}
              ou WhatsApp au +237 672 115 570.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-ink">
              2. Données collectées
            </h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Votre numéro de téléphone.</li>
              <li>Votre quartier.</li>
              <li>
                Votre position géographique, uniquement si vous appuyez sur
                « Utiliser ma position ».
              </li>
              <li>La description de votre problème.</li>
              <li>La note et le commentaire que vous laissez après l’intervention.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-ink">
              3. Pourquoi ces données
            </h2>
            <p className="mt-2">
              Elles servent uniquement à mettre votre demande en relation avec
              un prestataire proche, à vous contacter au sujet de cette demande
              et à améliorer le service. Elles ne sont jamais revendues.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-ink">
              4. Qui peut les voir
            </h2>
            <p className="mt-2">
              L’administrateur de la plateforme voit toutes les demandes. Le
              prestataire assigné reçoit votre numéro et votre quartier
              uniquement après avoir accepté la demande. Aucun autre
              prestataire n’y a accès.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-ink">
              5. Durée de conservation
            </h2>
            <p className="mt-2">
              Les demandes sont conservées 90 jours, puis anonymisées ou
              supprimées. Les avis peuvent être conservés sous forme anonyme
              pour le calcul de la note des prestataires.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-ink">
              6. Hébergement et cookies
            </h2>
            <p className="mt-2">
              Les données sont hébergées par Supabase (base de données) et
              Vercel (hébergement du site). Le site n’utilise aucun cookie
              publicitaire ni traceur commercial. Le navigateur stocke
              localement votre thème et, si vous le souhaitez, les références de
              vos demandes.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-ink">7. Vos droits</h2>
            <p className="mt-2">
              Vous pouvez demander l’accès, la rectification ou la suppression
              de vos données en écrivant à dmwleroi17@gmail.com ou sur WhatsApp
              au +237 672 115 570. Nous répondons dans un délai raisonnable.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-ink">8. Sécurité</h2>
            <p className="mt-2">
              L’accès aux données est limité côté serveur. Les clés sensibles ne
              sont jamais exposées au navigateur. En cas d’incident, nous
              informons les personnes concernées.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-ink">
              9. Urgences et données de santé
            </h2>
            <p className="mt-2">
              Si vous utilisez l’écran urgence, la description peut contenir des
              informations de santé. Elles servent uniquement à orienter la
              demande vers un professionnel ou un établissement. LIFE CONNECT ne
              pose pas de diagnostic et ne conserve pas de dossier médical. Pour
              une urgence vitale, appelez le 117, le 118 ou le 119 : ces
              informations ne sont pas transmises automatiquement aux secours.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-ink">
              10. Localisation et mineurs
            </h2>
            <p className="mt-2">
              La position GPS n’est enregistrée que si vous appuyez sur
              « Utiliser ma position ». Elle est utilisée pour calculer la
              distance et n’est pas publiée. Si la demande concerne un mineur,
              le parent ou le tuteur doit donner son accord et rester le
              interlocuteur de la plateforme et du prestataire.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-ink">11. Contact</h2>
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
