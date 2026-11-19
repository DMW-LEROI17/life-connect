import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { LoginForm } from '@/components/admin/LoginForm';
import { Logo } from '@/components/layout/Logo';
import { isAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Connexion administration',
  robots: { index: false, follow: false },
};

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  if (await isAdmin()) {
    redirect('/admin');
  }

  const candidate = first(searchParams.next);
  const next =
    candidate && candidate.startsWith('/admin') ? candidate : '/admin';

  return (
    <main
      id="contenu"
      className="flex min-h-dvh items-center justify-center bg-bg px-4 py-10"
    >
      <div className="w-full max-w-sm">
        <div className="flex justify-center">
          <Logo />
        </div>

        <div className="mt-6 rounded-2xl border border-line bg-surface p-6 shadow-soft">
          <h1 className="text-xl font-bold">Administration</h1>
          <p className="mt-1 text-sm text-muted">
            Accès réservé à l’administrateur.
          </p>

          <div className="mt-5">
            <LoginForm next={next} />
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-muted">
          <Link href="/" className="hover:text-ink">
            ← Retour au site
          </Link>
        </p>
      </div>
    </main>
  );
}
