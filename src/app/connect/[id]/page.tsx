import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { ClosePostButton } from '@/components/connect/ClosePostButton';
import { ProposalActions } from '@/components/connect/ProposalActions';
import { ProposalForm } from '@/components/connect/ProposalForm';
import { Icon } from '@/components/Icons';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { Badge } from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/Button';
import { getCurrentUser } from '@/lib/auth-user';
import {
  POST_STATUS_LABELS,
  PROPOSAL_STATUS_LABELS,
} from '@/lib/constants';
import { formatDate } from '@/lib/format';
import { getPost, listProposals } from '@/lib/posts';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const post = await getPost(params.id);
  return {
    title: post ? post.title : 'Publication',
    description: post?.description.slice(0, 160),
  };
}

export default async function PostPage({
  params,
}: {
  params: { id: string };
}) {
  const post = await getPost(params.id);

  if (!post) {
    notFound();
  }

  const current = await getCurrentUser();
  const isOwner = current?.user.id === post.author_id;
  const proposals = isOwner ? await listProposals(post.id) : [];

  let myProposal: { id: string; status: string } | null = null;

  if (current && !isOwner) {
    const supabase = createSupabaseServerClient();
    const { data } = await supabase
      .from('proposals')
      .select('id, status')
      .eq('post_id', post.id)
      .eq('author_id', current.user.id)
      .maybeSingle();

    myProposal = data ?? null;
  }

  const open = post.status === 'ouverte';
  const isNeed = post.kind === 'besoin';

  return (
    <>
      <Header />
      <main id="contenu" className="container-lc max-w-3xl py-8">
        <Link
          href="/connect"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink"
        >
          <Icon name="arrowLeft" size={16} />
          Toutes les publications
        </Link>

        <div className="mt-4 rounded-2xl border border-line bg-surface p-5 shadow-soft sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              className={
                isNeed
                  ? 'border-urgent-500/30 bg-urgent-50 text-urgent-600 dark:bg-urgent-500/10'
                  : 'border-teal-500/30 bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300'
              }
            >
              {isNeed ? 'Besoin' : 'Offre'}
            </Badge>
            <Badge className="border-line bg-surface2 text-muted">
              {POST_STATUS_LABELS[post.status] ?? post.status}
            </Badge>
            <span className="text-xs text-muted">
              {formatDate(post.created_at)} · {post.author_name}
            </span>
          </div>

          <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
            {post.title}
          </h1>

          <div className="mt-2 flex flex-wrap gap-1.5 text-xs text-muted">
            {post.categories?.nom_fr ? (
              <span className="rounded-full bg-surface2 px-2.5 py-1">
                {post.categories.nom_fr}
              </span>
            ) : null}
            {post.city ? (
              <span className="rounded-full bg-surface2 px-2.5 py-1">
                {post.city}
                {post.quartier ? ` · ${post.quartier}` : ''}
              </span>
            ) : null}
            {post.budget ? (
              <span className="rounded-full bg-surface2 px-2.5 py-1">
                Budget : {post.budget}
              </span>
            ) : null}
            {post.deadline ? (
              <span className="rounded-full bg-surface2 px-2.5 py-1">
                Délai : {formatDate(post.deadline)}
              </span>
            ) : null}
          </div>

          <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-muted">
            {post.description}
          </p>

          {isOwner ? (
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-4">
              <span className="text-xs text-muted">Vous êtes l’auteur.</span>
              {open || post.status === 'en_cours' ? (
                <ClosePostButton postId={post.id} />
              ) : null}
            </div>
          ) : null}
        </div>

        {isOwner ? (
          <section className="mt-5 rounded-2xl border border-line bg-surface p-5">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-bold">
                Propositions reçues ({proposals.length})
              </h2>
            </div>

            {proposals.length === 0 ? (
              <p className="mt-2 text-sm text-muted">
                Aucune proposition pour l’instant. Partagez votre demande pour
                obtenir des réponses.
              </p>
            ) : (
              <div className="mt-3 space-y-2">
                {proposals.map((proposal) => (
                  <div
                    key={proposal.id}
                    className="rounded-xl border border-line p-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold">
                        {proposal.author_name}
                      </p>
                      <Badge className="border-line bg-surface2 text-muted">
                        {PROPOSAL_STATUS_LABELS[proposal.status] ??
                          proposal.status}
                      </Badge>
                    </div>
                    <p className="mt-1 whitespace-pre-line text-sm text-muted">
                      {proposal.message}
                    </p>
                    {proposal.price ? (
                      <p className="mt-1 text-xs font-semibold">
                        Prix : {proposal.price}
                      </p>
                    ) : null}
                    <ProposalActions
                      proposalId={proposal.id}
                      canDecide={proposal.status === 'envoyee' && open}
                      canWithdraw={false}
                    />
                  </div>
                ))}
              </div>
            )}
          </section>
        ) : (
          <section className="mt-5 rounded-2xl border border-line bg-surface p-5">
            {!current ? (
              <div className="text-center">
                <p className="text-sm font-semibold">
                  Connectez-vous pour répondre
                </p>
                <p className="mt-1 text-sm text-muted">
                  Un compte est nécessaire pour envoyer une proposition.
                </p>
                <ButtonLink
                  href={`/connexion?next=${encodeURIComponent(`/connect/${post.id}`)}`}
                  className="mt-3"
                >
                  Se connecter
                </ButtonLink>
              </div>
            ) : myProposal ? (
              <div>
                <h2 className="text-sm font-bold">Votre réponse</h2>
                <p className="mt-1 text-sm text-muted">
                  Statut :{' '}
                  {PROPOSAL_STATUS_LABELS[myProposal.status] ??
                    myProposal.status}
                </p>
                {myProposal.status === 'envoyee' ? (
                  <ProposalActions
                    proposalId={myProposal.id}
                    canDecide={false}
                    canWithdraw
                  />
                ) : null}
              </div>
            ) : open ? (
              <div>
                <h2 className="text-sm font-bold">Répondre à cette demande</h2>
                <p className="mt-1 text-xs text-muted">
                  Votre nom et votre message seront visibles par l’auteur.
                </p>
                <div className="mt-3">
                  <ProposalForm postId={post.id} />
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted">
                Cette publication n’accepte plus de propositions.
              </p>
            )}
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
