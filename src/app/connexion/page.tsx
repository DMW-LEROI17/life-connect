import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { SignInForm } from '@/components/auth/SignInForm';
import { Icon } from '@/components/Icons';
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
    redirect(
      current.profile.role === 'professionnel'
        ? '/dashboard-aideur'
        : '/compte',
    );
  }

  const next = safeNext(first(searchParams.next));

  return (
    <main id="contenu" className="min-h-dvh bg-bg p-3 sm:p-5 lg:p-6">
      <div className="mx-auto grid min-h-[calc(100dvh-1.5rem)] max-w-6xl overflow-hidden rounded-[2rem] border border-line bg-surface shadow-lift sm:min-h-[calc(100dvh-2.5rem)] lg:grid-cols-[1.05fr_1fr]">
        <section className="relative hidden overflow-hidden gradient-night p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -right-20 -top-16 h-64 w-64 rounded-full bg-cyan-400/25 blur-3xl" />
          <div className="absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-violet-500/25 blur-3xl" />

          <div className="relative">
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-2xl gradient-brand text-white shadow-soft">
                <Icon name="spark" size={24} />
              </span>
              <div>
                <p className="text-lg font-black tracking-tight">LIFE CONNECT</p>
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/60">
                  Everything. Everyone. Everywhere.
                </p>
              </div>
            </div>

            <h1 className="mt-16 max-w-md text-5xl font-black leading-[1.05] tracking-tight">
              Un besoin.
              <br />
              Une connexion.
              <br />
              <span className="text-cyan-300">Une solution.</span>
            </h1>
            <p className="mt-4 max-w-sm text-base text-white/70">
              Retrouvez vos demandes, vos annonces, vos messages et toutes les
              opportunités de votre communauté.
            </p>

            <div className="mt-8 flex flex-wrap gap-2">
              {['Emploi', 'Logement', 'Services', 'Market', 'Communauté'].map(
                (item) => (
                  <span
                    key={item}
                    className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/85 backdrop-blur"
                  >
                    {item}
                  </span>
                ),
              )}
            </div>
          </div>

          <div className="relative grid grid-cols-3 gap-3">
            {[
              { value: '360', label: 'communes' },
              { value: '10', label: 'régions' },
              { value: '8', label: 'univers' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur"
              >
                <p className="text-xl font-black text-white">{stat.value}</p>
                <p className="text-[10px] uppercase tracking-wide text-white/60">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="flex items-center justify-center p-5 sm:p-8 lg:p-10">
          <div className="w-full max-w-md">
            <div className="flex items-center justify-between lg:hidden">
              <Link href="/" className="flex items-center gap-2.5">
                <span className="grid h-10 w-10 place-items-center rounded-2xl gradient-brand text-white">
                  <Icon name="spark" size={20} />
                </span>
                <span>
                  <span className="block text-sm font-black">LIFE CONNECT</span>
                  <span className="block text-[8px] font-bold uppercase tracking-[0.18em] text-muted">
                    Everything. Everyone.
                  </span>
                </span>
              </Link>
              <Link href="/" className="text-xs font-semibold text-muted">
                Accueil
              </Link>
            </div>

            <div className="mt-8 lg:mt-0">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-teal-600 dark:text-teal-300">
                Bon retour
              </p>
              <h2 className="mt-1 text-3xl font-black tracking-tight">
                Se connecter
              </h2>
              <p className="mt-1 text-sm text-muted">
                Retrouvez vos demandes, vos réponses et vos échanges.
              </p>
            </div>

            <div className="mt-6 rounded-3xl border border-line bg-surface p-5 shadow-soft sm:p-6">
              <SignInForm next={next} />
            </div>

            <p className="mt-5 text-center text-xs text-muted">
              <Link href="/" className="hover:text-ink">
                Retour à l’accueil
              </Link>
              {' · '}
              <Link href="/urgence" className="font-semibold text-urgent-600">
                Urgence
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
