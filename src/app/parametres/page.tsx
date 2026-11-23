import type { Metadata } from 'next';
import Link from 'next/link';

import { Icon } from '@/components/Icons';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import {
  AvatarUpload,
  PasswordForm,
  SettingsForm,
} from '@/components/settings/SettingsPanels';
import { requireUser } from '@/lib/auth-user';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Paramètres',
  robots: { index: false, follow: false },
};

export default async function ParametresPage() {
  const current = await requireUser('/parametres');

  return (
    <>
      <Header />
      <main id="contenu" className="container-lc max-w-2xl py-8">
        <Link
          href="/compte"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink"
        >
          <Icon name="arrowLeft" size={16} />
          Mon compte
        </Link>

        <h1 className="mt-3 text-2xl font-bold tracking-tight">Paramètres</h1>
        <p className="mt-1 text-sm text-muted">
          Notifications, photo et sécurité de votre compte.
        </p>

        <section className="mt-5 rounded-2xl border border-line bg-surface p-5 shadow-soft">
          <h2 className="text-sm font-bold">Photo de profil</h2>
          <div className="mt-3">
            <AvatarUpload />
          </div>
        </section>

        <section className="mt-4 rounded-2xl border border-line bg-surface p-5 shadow-soft">
          <h2 className="text-sm font-bold">Notifications</h2>
          <p className="mt-1 text-xs text-muted">
            Choisissez les alertes que vous souhaitez recevoir dans
            l’application.
          </p>
          <div className="mt-3">
            <SettingsForm profile={current.profile} />
          </div>
        </section>

        <section className="mt-4 rounded-2xl border border-line bg-surface p-5 shadow-soft">
          <h2 className="text-sm font-bold">Sécurité</h2>
          <p className="mt-1 text-xs text-muted">
            Choisissez un mot de passe long et unique.
          </p>
          <div className="mt-3">
            <PasswordForm />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
