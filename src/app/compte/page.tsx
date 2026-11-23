import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { signOutAction } from '@/actions/auth';
import { ProfileForm } from '@/components/auth/ProfileForm';
import { Icon } from '@/components/Icons';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { requireUser } from '@/lib/auth-user';
import {
  POST_STATUS_LABELS,
  PROPOSAL_STATUS_LABELS,
  ROLE_LABELS,
} from '@/lib/constants';
import { formatDate, initials } from '@/lib/format';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Mon compte',
  robots: { index: false, follow: false },
};

export default async function ComptePage() {
  const current = await requireUser('/compte');
  const supabase = createSupabaseServerClient();

  const [postsResult, proposalsResult] = await Promise.all([
    supabase
      .from('posts')
      .select('id, title, kind, status, created_at, categories(nom_fr)')
      .eq('author_id', current.user.id)
      .order('created_at', { ascending: false })
      .limit(20),
    supabase
      .from('proposals')
      .select('id, message, status, created_at, posts(id, title)')
      .eq('author_id', current.user.id)
      .order('created_at', { ascending: false })
      .limit(20),
  ]);

  const posts = (postsResult.data ?? []) as unknown as Array<{
    id: string;
    title: string;
    kind: string;
    status: string;
    created_at: string;
    categories: { nom_fr: string } | null;
  }>;

  const proposals = (proposalsResult.data ?? []) as unknown as Array<{
    id: string;
    message: string;
    status: string;
    created_at: string;
    posts: { id: string; title: string } | null;
  }>;

  return (
    <>
      <Header />
      <main id="contenu" className="container-lc max-w-4xl py-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {current.profile.avatar_url ? (
              <Image
                src={current.profile.avatar_url}
                alt=""
                width={64}
                height={64}
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <span className="grid h-16 w-16 place-items-center rounded-full bg-navy-900 text-xl font-bold text-white">
                {initials(current.profile.full_name || current.user.email || 'LC')}
              </span>
            )}
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {current.profile.full_name || 'Mon compte'}
              </h1>
              <p className="text-sm text-muted">{current.user.email}</p>
              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                <Badge className="border-teal-500/30 bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300">
                  {ROLE_LABELS[current.profile.role] ?? current.profile.role}
                </Badge>
                <span className="text-xs text-muted">
                  Membre depuis {formatDate(current.profile.created_at)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/connect/nouveau"
              className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-teal-500 px-3 text-xs font-semibold text-white"
            >
              <Icon name="send" size={16} />
              Publier un besoin
            </Link>
            <Link
              href="/wallet"
              className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-line bg-surface px-3 text-xs font-semibold"
            >
              <Icon name="send" size={16} />
              Portefeuille
            </Link>
            <Link
              href="/messages"
              className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-line bg-surface px-3 text-xs font-semibold"
            >
              <Icon name="whatsapp" size={16} />
              Messages
            </Link>
            <Link
              href="/parametres"
              className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-line bg-surface px-3 text-xs font-semibold"
            >
              <Icon name="shield" size={16} />
              Paramètres
            </Link>
            {current.profile.role === 'admin' ||
            current.profile.role === 'moderateur' ? (
              <Link
                href="/admin"
                className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-line bg-surface px-3 text-xs font-semibold"
              >
                <Icon name="shield" size={16} />
                Administration
              </Link>
            ) : null}
            <form action={signOutAction}>
              <Button type="submit" variant="ghost" size="sm">
                <Icon name="logout" size={16} />
                Déconnexion
              </Button>
            </form>
          </div>
        </div>

        <div className="mt-6 grid gap-2 sm:grid-cols-3">
          <div className="rounded-2xl border border-line bg-surface p-4">
            <p className="text-xs text-muted">Mes demandes</p>
            <p className="mt-1 text-2xl font-bold">{posts.length}</p>
          </div>
          <div className="rounded-2xl border border-line bg-surface p-4">
            <p className="text-xs text-muted">Mes réponses</p>
            <p className="mt-1 text-2xl font-bold">{proposals.length}</p>
          </div>
          <div className="rounded-2xl border border-line bg-surface p-4">
            <p className="text-xs text-muted">Statut</p>
            <p className="mt-1 text-sm font-semibold">Compte actif</p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <section className="rounded-2xl border border-line bg-surface p-5">
            <h2 className="text-sm font-bold">Mes demandes et offres</h2>
            {posts.length === 0 ? (
              <p className="mt-2 text-sm text-muted">
                Vous n’avez rien publié pour l’instant.
              </p>
            ) : (
              <div className="mt-2 space-y-1.5">
                {posts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/connect/${post.id}`}
                    className="block rounded-xl border border-line p-2.5 text-sm hover:bg-surface2"
                  >
                    <span className="font-medium">{post.title}</span>
                    <span className="mt-0.5 block text-[11px] text-muted">
                      {post.kind === 'besoin' ? 'Besoin' : 'Offre'} ·{' '}
                      {post.categories?.nom_fr ?? 'Sans catégorie'} ·{' '}
                      {POST_STATUS_LABELS[post.status] ?? post.status}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-line bg-surface p-5">
            <h2 className="text-sm font-bold">Mes réponses envoyées</h2>
            {proposals.length === 0 ? (
              <p className="mt-2 text-sm text-muted">
                Vous n’avez pas encore répondu à une demande.
              </p>
            ) : (
              <div className="mt-2 space-y-1.5">
                {proposals.map((proposal) => (
                  <Link
                    key={proposal.id}
                    href={
                      proposal.posts
                        ? `/connect/${proposal.posts.id}`
                        : '/connect'
                    }
                    className="block rounded-xl border border-line p-2.5 text-sm hover:bg-surface2"
                  >
                    <span className="font-medium">
                      {proposal.posts?.title ?? 'Demande'}
                    </span>
                    <span className="mt-0.5 block text-[11px] text-muted">
                      {PROPOSAL_STATUS_LABELS[proposal.status] ?? proposal.status}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>

        <section className="mt-5 rounded-2xl border border-line bg-surface p-5">
          <h2 className="text-sm font-bold">Modifier mon profil</h2>
          <p className="mt-1 text-xs text-muted">
            Le type de compte ne peut pas être changé depuis cette page.
          </p>
          <div className="mt-3">
            <ProfileForm profile={current.profile} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
