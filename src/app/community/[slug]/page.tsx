import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { GroupActions, GroupPostForm } from '@/components/community/Forms';
import { Icon } from '@/components/Icons';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { Badge } from '@/components/ui/Badge';
import { getCurrentUser } from '@/lib/auth-user';
import { getGroupBySlug } from '@/lib/community';
import { formatDateTime } from '@/lib/format';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Groupe — LIFE COMMUNITY' };

export default async function GroupPage({
  params,
}: {
  params: { slug: string };
}) {
  const result = await getGroupBySlug(params.slug);
  if (!result) notFound();

  const { group, posts, isMember } = result;
  const current = await getCurrentUser();

  return (
    <>
      <Header />
      <main id="contenu" className="container-lc max-w-2xl py-8">
        <Link
          href="/community"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink"
        >
          <Icon name="arrowLeft" size={16} />
          LIFE COMMUNITY
        </Link>

        <div className="mt-3 rounded-2xl border border-line bg-surface p-5 shadow-soft">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge className="border-line bg-surface2 text-muted">
                  {group.visibility === 'publique' ? 'Public' : 'Privé'}
                </Badge>
                {group.city ? (
                  <span className="text-[11px] text-muted">{group.city}</span>
                ) : null}
              </div>
              <h1 className="mt-2 text-2xl font-bold tracking-tight">{group.name}</h1>
              <p className="mt-1 text-[11px] text-muted">
                Par {group.owner_name}
              </p>
            </div>
            {current ? (
              <GroupActions groupId={group.id} isMember={isMember} />
            ) : (
              <Link
                href={`/connexion?next=/community/${group.slug}`}
                className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-teal-500 px-3 text-xs font-semibold text-white"
              >
                Se connecter pour rejoindre
              </Link>
            )}
          </div>

          {group.description ? (
            <p className="mt-3 whitespace-pre-line text-sm text-muted">
              {group.description}
            </p>
          ) : null}
        </div>

        {isMember ? (
          <div className="mt-4 rounded-2xl border border-line bg-surface p-4">
            <p className="mb-2 text-sm font-bold">Publier dans le groupe</p>
            <GroupPostForm groupId={group.id} />
          </div>
        ) : (
          <p className="mt-4 rounded-xl border border-dashed border-line p-4 text-sm text-muted">
            Rejoignez le groupe pour publier et lire les messages.
          </p>
        )}

        <section className="mt-5">
          <h2 className="text-lg font-bold">Messages ({posts.length})</h2>
          {posts.length === 0 ? (
            <p className="mt-2 rounded-xl border border-dashed border-line p-4 text-sm text-muted">
              Aucun message pour le moment.
            </p>
          ) : (
            <div className="mt-3 space-y-2">
              {posts.map((post) => (
                <div key={post.id} className="rounded-2xl border border-line bg-surface p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold">{post.author_name}</p>
                    <p className="text-[10px] text-muted">
                      {formatDateTime(post.created_at)}
                    </p>
                  </div>
                  <p className="mt-1 whitespace-pre-line text-sm text-ink">
                    {post.body}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
