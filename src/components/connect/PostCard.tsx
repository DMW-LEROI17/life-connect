import Link from 'next/link';

import { Icon } from '@/components/Icons';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/format';
import type { PostRow } from '@/types/db';

export function PostCard({ post }: { post: PostRow }) {
  const isNeed = post.kind === 'besoin';

  return (
    <Link
      href={`/connect/${post.id}`}
      className="group flex flex-col rounded-2xl border border-line bg-surface p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:border-teal-500/40"
    >
      <div className="flex items-center justify-between gap-2">
        <Badge
          className={
            isNeed
              ? 'border-urgent-500/30 bg-urgent-50 text-urgent-600 dark:bg-urgent-500/10'
              : 'border-teal-500/30 bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300'
          }
        >
          {isNeed ? 'Besoin' : 'Offre'}
        </Badge>
        <span className="text-[11px] text-muted">
          {formatDate(post.created_at)}
        </span>
      </div>

      <h3 className="mt-2 text-base font-bold leading-snug">{post.title}</h3>
      <p className="mt-1 line-clamp-2 text-sm text-muted">{post.description}</p>

      <div className="mt-3 flex flex-wrap gap-1.5 text-[11px] text-muted">
        {post.categories?.nom_fr ? (
          <span className="rounded-full bg-surface2 px-2 py-0.5">
            {post.categories.nom_fr}
          </span>
        ) : null}
        {post.city ? (
          <span className="rounded-full bg-surface2 px-2 py-0.5">
            {post.city}
            {post.quartier ? ` · ${post.quartier}` : ''}
          </span>
        ) : null}
        {post.budget ? (
          <span className="rounded-full bg-surface2 px-2 py-0.5">
            Budget : {post.budget}
          </span>
        ) : null}
      </div>

      <div className="mt-auto flex items-center justify-between gap-2 pt-3 text-[11px] text-muted">
        <span className="truncate">{post.author_name || 'Membre'}</span>
        <span className="inline-flex items-center gap-1 font-semibold text-teal-700 dark:text-teal-300">
          Voir
          <Icon name="chevronRight" size={12} />
        </span>
      </div>
    </Link>
  );
}
