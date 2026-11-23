import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { SignInForm } from '@/components/auth/SignInForm';
import { Logo } from '@/components/layout/Logo';
import { getCurrentUser } from '@/lib/auth-user';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Connexion',
  description: 'Connectez-vous à votre compte LIFE CONNECT.',
};

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function safeNext(value: string | undefined): string {
  if (value && value.startsWith('/') && !value.startsWith('//')) return value;
  return '/compte';
}

export default async function ConnexionPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const current = await getCurrentUser();

  if (current) {
    redirect('/compte');
  }

  const next = safeNext(first(searchParams.next));

  return (
    <main id="contenu" className="container-lc flex min-h-dvh max-w-lg flex-col justify-center py-10">
      <div className="flex justify-center">
        <Logo />
      </div>

      <div className="mt-6 rounded-2xl border border-line bg-surface p-5 shadow-soft sm:p-6">
        <h1 className="text-2xl font-bold tracking-tight">Se connecter</h1>
        <p className="mt-1 text-sm text-muted">
          Retrouvez vos demandes, vos réponses et vos échanges.
        </p>

        <div className="mt-5">
          <SignInForm next={next} />
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-muted">
        <Link href="/" className="hover:text-ink">
          Retour à l’accueil
        </Link>
        {' · '}
        <Link href="/urgence" className="font-semibold text-urgent-600">
          Urgence
        </Link>
      </p>
    </main>
  );
}
