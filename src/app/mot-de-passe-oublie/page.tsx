import type { Metadata } from 'next';
import Link from 'next/link';

import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { Icon } from '@/components/Icons';
import { Logo } from '@/components/layout/Logo';

export const metadata: Metadata = {
  title: 'Mot de passe oublié',
  description: 'Recevez un lien pour réinitialiser votre mot de passe LIFE CONNECT.',
};

export default function MotDePasseOubliePage() {
  return (
    <main id="contenu" className="relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-10">
      <div className="absolute inset-0 -z-10 gradient-night" />
      <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />

      <div className="w-full max-w-md rounded-3xl border border-white/20 bg-surface p-6 shadow-lift sm:p-8">
        <Logo />
        <Link
          href="/connexion"
          className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-ink"
        >
          <Icon name="arrowLeft" size={14} />
          Connexion
        </Link>
        <h1 className="mt-3 text-2xl font-black tracking-tight">
          Mot de passe oublié
        </h1>
        <p className="mt-1 text-sm text-muted">
          Entrez votre e-mail. Vous recevrez un lien sécurisé pour choisir un
          nouveau mot de passe.
        </p>
        <div className="mt-5">
          <ForgotPasswordForm />
        </div>
      </div>
    </main>
  );
}
