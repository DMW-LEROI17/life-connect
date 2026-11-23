import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { SignUpForm } from '@/components/auth/SignUpForm';
import { Logo } from '@/components/layout/Logo';
import { getCurrentUser } from '@/lib/auth-user';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Créer un compte',
  description:
    'Créez votre compte LIFE CONNECT : particulier, professionnel, commerçant ou entreprise.',
};

export default async function InscriptionPage() {
  const current = await getCurrentUser();

  if (current) {
    redirect('/compte');
  }

  return (
    <main id="contenu" className="container-lc flex min-h-dvh max-w-lg flex-col justify-center py-10">
      <div className="flex justify-center">
        <Logo />
      </div>

      <div className="mt-6 rounded-2xl border border-line bg-surface p-5 shadow-soft sm:p-6">
        <h1 className="text-2xl font-bold tracking-tight">Créer mon compte</h1>
        <p className="mt-1 text-sm text-muted">
          Un compte pour publier des demandes, répondre et suivre vos échanges.
          Pour une urgence, aucun compte n’est nécessaire : appelez le 117, 118
          ou 119.
        </p>

        <div className="mt-5">
          <SignUpForm />
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-muted">
        Déjà inscrit ?{' '}
        <Link href="/connexion" className="font-semibold underline underline-offset-2">
          Se connecter
        </Link>
        {' · '}
        <Link href="/" className="hover:text-ink">
          Retour à l’accueil
        </Link>
      </p>
    </main>
  );
}
