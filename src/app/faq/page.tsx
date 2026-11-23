import type { Metadata } from 'next';
import Link from 'next/link';

import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';

export const metadata: Metadata = {
  title: 'FAQ',
  description:
    'Questions fréquentes sur LIFE CONNECT – HELP ME : urgences, comptes, paiement, zones, prestataires, données.',
};

const QUESTIONS = [
  {
    q: 'LIFE CONNECT remplace-t-il les secours ?',
    a: 'Non. En cas d’urgence vitale, appelez le 117 (police), le 118 (pompiers) ou le 119 (SAMU). Les fiches de premiers gestes sont des repères généraux et ne remplacent pas un médecin.',
  },
  {
    q: 'Faut-il créer un compte ?',
    a: 'Non. Le client donne seulement son numéro de téléphone, sa zone et son besoin. Il suit sa demande avec un lien unique.',
  },
  {
    q: 'Combien ça coûte ?',
    a: 'La demande est gratuite pour le client. Le prix de l’intervention est convenu directement avec le prestataire. La plateforme ne prélève pas de commission dans cette version.',
  },
  {
    q: 'Dans quelles zones ?',
    a: 'Les 10 régions du Cameroun. Les grandes villes et quartiers sont préremplis, mais vous pouvez saisir librement votre village ou un repère connu.',
  },
  {
    q: 'Comment les prestataires sont-ils vérifiés ?',
    a: 'Chaque inscription est examinée par l’administrateur avant validation. Un prestataire en attente n’est jamais proposé aux clients.',
  },
  {
    q: 'Le numéro du prestataire est-il visible avant l’assignation ?',
    a: 'Non. Le contact n’apparaît qu’après l’assignation, pour protéger la vie privée des deux parties.',
  },
  {
    q: 'Puis-je demander un transport urgent ?',
    a: 'Oui. Depuis l’écran urgence, « Alerter les aideurs près de moi » permet de demander une moto, un taxi ou un véhicule.',
  },
  {
    q: 'Que faire si aucun prestataire ne répond ?',
    a: 'La page de suivi propose de réessayer ou d’écrire à l’administrateur sur WhatsApp. Pour une urgence médicale, appelez le 119.',
  },
  {
    q: 'Mes données sont-elles protégées ?',
    a: 'Les données sont limitées au nécessaire : téléphone, zone, description et avis. Elles sont conservées 90 jours puis anonymisées. Voir la politique de confidentialité.',
  },
  {
    q: 'Comment devenir prestataire ?',
    a: 'Créez un profil, choisissez vos services et vos zones d’intervention. L’administrateur vous contacte sur WhatsApp après vérification.',
  },
];

export default function FaqPage() {
  return (
    <>
      <Header />
      <main id="contenu" className="container-lc max-w-2xl py-10">
        <h1 className="text-3xl font-bold tracking-tight">Questions fréquentes</h1>
        <p className="mt-2 text-sm text-muted">
          Les réponses aux questions les plus courantes. Pour le reste,{' '}
          <Link href="/contact" className="font-semibold underline underline-offset-2">
            contactez-nous
          </Link>
          .
        </p>

        <div className="mt-6 space-y-2">
          {QUESTIONS.map((item) => (
            <details
              key={item.q}
              className="rounded-xl border border-line bg-surface p-4"
            >
              <summary className="cursor-pointer text-sm font-semibold">
                {item.q}
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-muted">{item.a}</p>
            </details>
          ))}
        </div>

        <div className="mt-8 rounded-2xl bg-urgent-600 p-5 text-white">
          <p className="font-bold">Urgence vitale ?</p>
          <p className="mt-1 text-sm text-white/85">
            117 police · 118 pompiers · 119 SAMU / ambulance.
          </p>
          <Link
            href="/urgence"
            className="mt-3 inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-white px-4 text-xs font-bold text-urgent-600"
          >
            Écran urgence
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
