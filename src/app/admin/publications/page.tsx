import type { Metadata } from 'next';
import Link from 'next/link';

import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminTabs } from '@/components/admin/AdminTabs';
import { PostModerationActions } from '@/components/admin/PostModerationActions';
import { SetupNotice } from '@/components/SetupNotice';
import { Badge } from '@/components/ui/Badge';
import { requireAdmin } from '@/lib/auth';
import { isSupabaseConfigured } from '@/lib/config';
import { POST_STATUS_LABELS } from '@/lib/constants';
import { formatDate } from '@/lib/format';
import { getAdminStats, getPendingProviderCount } from '@/lib/queries';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Publications',
  robots: { index: false, follow: false },
};

export default async function AdminPostsPage() {
  await requireAdmin();

  if (!isSupabaseConfigured()) {
    return (
      <>
        <AdminHeader />
        <SetupNotice />
      </>
    );
  }

  const [stats, pendingProviders] = await Promise.all([
    getAdminStats(),
    getPendingProviderCount(),
  ]);

  const admin = getSupabaseAdmin();
  const { data } = await admin
    .from('posts')
    .select('id, title, kind, status, is_hidden, city, quartier, author_name, created_at, categories(nom_fr)')
    .order('created_at', { ascending: false })
    .limit(200);

  const posts = (data ?? []) as unknown as Array<{
    id: string;
    title: string;
    kind: string;
    status: string;
    is_hidden: boolean;
    city: string | null;
    quartier: string | null;
    author_name: string;
    created_at: string;
    categories: { nom_fr: string } | null;
  }>;

  return (
    <div className="min-h-dvh bg-bg">
      <AdminHeader />
      <main id="contenu" className="container-lc py-6">
        <h1 className="text-2xl font-bold tracking-tight">Publications</h1>
        <p className="text-sm text-muted">
          Modérez les demandes et offres publiées par les membres.
        </p>

        <AdminTabs
          active="posts"
          pendingRequests={stats.en_attente}
          pendingProviders={pendingProviders}
        />

        {posts.length === 0 ? (
          <p className="mt-5 rounded-2xl border border-dashed border-line bg-surface p-8 text-center text-sm text-muted">
            Aucune publication. Vérifiez que la migration V3 est exécutée.
          </p>
        ) : (
          <div className="mt-4 space-y-2">
            {posts.map((post) => (
              <div
                key={post.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-line bg-surface p-3"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge className="border-line bg-surface2 text-muted">
                      {post.kind === 'besoin' ? 'Besoin' : 'Offre'}
                    </Badge>
                    {post.is_hidden ? (
                      <Badge className="border-urgent-500/30 bg-urgent-50 text-urgent-600">
                        Masquée
                      </Badge>
                    ) : null}
                    <span className="text-[11px] text-muted">
                      {POST_STATUS_LABELS[post.status] ?? post.status}
                    </span>
                  </div>
                  <Link
                    href={`/connect/${post.id}`}
                    className="mt-1 block truncate text-sm font-semibold hover:underline"
                  >
                    {post.title}
                  </Link>
                  <p className="text-[11px] text-muted">
                    {post.author_name} · {post.categories?.nom_fr ?? 'Sans catégorie'} ·{' '}
                    {post.city ?? post.quartier ?? '—'} · {formatDate(post.created_at)}
                  </p>
                </div>
                <PostModerationActions postId={post.id} hidden={post.is_hidden} />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
