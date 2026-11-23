'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { getCurrentUser } from '@/lib/auth-user';
import { ensureConversationForProposal } from '@/lib/chat';
import { notifyUser } from '@/lib/notifications';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export type PostActionResult =
  | { ok: true; message?: string; conversationId?: string }
  | { ok: false; error: string };

export async function createPostAction(
  formData: FormData,
): Promise<PostActionResult> {
  const current = await getCurrentUser();

  if (!current) {
    return { ok: false, error: 'Connectez-vous pour publier.' };
  }

  const kind = String(formData.get('kind') ?? 'besoin');
  const title = String(formData.get('title') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const categoryId = Number(formData.get('category_id') ?? 0) || null;
  const regionId = Number(formData.get('region_id') ?? 0) || null;
  const city = String(formData.get('city') ?? '').trim();
  const quartier = String(formData.get('quartier') ?? '').trim();
  const budget = String(formData.get('budget') ?? '').trim();
  const deadline = String(formData.get('deadline') ?? '').trim();

  if (kind !== 'besoin' && kind !== 'offre') {
    return { ok: false, error: 'Type de publication invalide.' };
  }

  if (title.length < 5 || title.length > 120) {
    return { ok: false, error: 'Le titre doit contenir 5 à 120 caractères.' };
  }

  if (description.length < 10 || description.length > 2000) {
    return {
      ok: false,
      error: 'La description doit contenir 10 à 2000 caractères.',
    };
  }

  let createdId: string | null = null;

  try {
    const supabase = createSupabaseServerClient();

    const { data, error } = await supabase
      .from('posts')
      .insert({
        author_id: current.user.id,
        author_name:
          current.profile.full_name ||
          current.user.email?.split('@')[0] ||
          'Membre LIFE CONNECT',
        author_role: current.profile.role,
        kind,
        title,
        description,
        category_id: categoryId,
        region_id: regionId,
        city: city || current.profile.city || null,
        quartier: quartier || null,
        budget: budget || null,
        deadline: deadline || null,
        status: 'ouverte',
        visibility: 'publique',
      })
      .select('id')
      .single();

    if (error || !data?.id) {
      console.error('[createPostAction]', error?.message);
      return {
        ok: false,
        error:
          'La publication a échoué. Vérifiez que la migration V3 est exécutée.',
      };
    }

    createdId = data.id as string;
    revalidatePath('/connect');
  } catch (error) {
    console.error('[createPostAction]', error);
    return { ok: false, error: 'Le service est momentanément indisponible.' };
  }

  if (createdId) {
    redirect(`/connect/${createdId}`);
  }

  return { ok: false, error: 'Publication impossible.' };
}

export async function createProposalAction(
  postId: string,
  formData: FormData,
): Promise<PostActionResult> {
  const current = await getCurrentUser();

  if (!current) {
    return { ok: false, error: 'Connectez-vous pour répondre.' };
  }

  const message = String(formData.get('message') ?? '').trim();
  const price = String(formData.get('price') ?? '').trim();

  if (message.length < 5 || message.length > 1200) {
    return {
      ok: false,
      error: 'Le message doit contenir 5 à 1200 caractères.',
    };
  }

  try {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase.from('proposals').insert({
      post_id: postId,
      author_id: current.user.id,
      author_name:
        current.profile.full_name ||
        current.user.email?.split('@')[0] ||
        'Membre LIFE CONNECT',
      message,
      price: price || null,
      status: 'envoyee',
    });

    if (error) {
      console.error('[createProposalAction]', error.message);

      if (error.code === '23505') {
        return { ok: false, error: 'Vous avez déjà répondu à cette demande.' };
      }

      return { ok: false, error: 'Votre réponse n’a pas pu être envoyée.' };
    }

    const { data: post } = await supabase
      .from('posts')
      .select('author_id, title')
      .eq('id', postId)
      .maybeSingle();

    if (post?.author_id) {
      await notifyUser({
        userId: post.author_id,
        type: 'demande',
        title: 'Nouvelle proposition',
        body: `${current.profile.full_name || 'Un membre'} a répondu à « ${post.title} ».`,
        link: `/connect/${postId}`,
      });
    }

    revalidatePath(`/connect/${postId}`);
    return { ok: true, message: 'Votre réponse a été envoyée.' };
  } catch (error) {
    console.error('[createProposalAction]', error);
    return { ok: false, error: 'Le service est momentanément indisponible.' };
  }
}

async function decideProposal(
  proposalId: string,
  decision: 'acceptee' | 'refusee',
): Promise<PostActionResult> {
  const current = await getCurrentUser();

  if (!current) {
    return { ok: false, error: 'Connectez-vous.' };
  }

  try {
    const supabase = createSupabaseServerClient();

    const { data: proposal } = await supabase
      .from('proposals')
      .select('id, post_id, author_id')
      .eq('id', proposalId)
      .maybeSingle();

    if (!proposal) return { ok: false, error: 'Réponse introuvable.' };

    const { data: post } = await supabase
      .from('posts')
      .select('id, author_id, title, status')
      .eq('id', proposal.post_id)
      .maybeSingle();

    if (!post || post.author_id !== current.user.id) {
      return { ok: false, error: 'Action réservée à l’auteur de la demande.' };
    }

    const { error } = await supabase
      .from('proposals')
      .update({ status: decision })
      .eq('id', proposalId);

    if (error) {
      console.error('[decideProposal]', error.message);
      return { ok: false, error: 'La mise à jour a échoué.' };
    }

    let conversationId: string | undefined;

    if (decision === 'acceptee') {
      await supabase
        .from('proposals')
        .update({ status: 'refusee' })
        .eq('post_id', proposal.post_id)
        .neq('id', proposalId)
        .eq('status', 'envoyee');

      await supabase
        .from('posts')
        .update({ status: 'en_cours' })
        .eq('id', proposal.post_id);

      try {
        const admin = getSupabaseAdmin();
        const [{ data: clientProfile }, { data: providerProfile }, { data: postRow }] =
          await Promise.all([
            admin.from('profiles').select('*').eq('id', current.user.id).maybeSingle(),
            admin.from('profiles').select('*').eq('id', proposal.author_id).maybeSingle(),
            admin
              .from('posts')
              .select('id, title, author_id, author_name, description')
              .eq('id', proposal.post_id)
              .maybeSingle(),
          ]);

        if (clientProfile && providerProfile && postRow) {
          const created = await ensureConversationForProposal({
            post: {
              ...(postRow as any),
              created_at: new Date().toISOString(),
            },
            proposal: {
              id: proposalId,
              post_id: proposal.post_id,
              author_id: proposal.author_id,
              author_name: providerProfile.full_name || 'Prestataire',
              message: '',
              price: null,
              status: 'acceptee',
              created_at: new Date().toISOString(),
            },
            client: clientProfile as any,
            provider: providerProfile as any,
          });

          if (created) {
            conversationId = created;
            await notifyUser({
              userId: proposal.author_id,
              type: 'demande',
              title: 'Proposition acceptée',
              body: `Votre proposition pour « ${postRow.title} » a été acceptée.`,
              link: `/messages/${created}`,
            });
          }
        }
      } catch (conversationError) {
        console.error('[decideProposal:conversation]', conversationError);
      }
    }

    revalidatePath(`/connect/${proposal.post_id}`);
    revalidatePath('/compte');
    return {
      ok: true,
      message:
        decision === 'acceptee'
          ? 'Proposition acceptée. La demande passe en cours.'
          : 'Proposition refusée.',
      conversationId,
    };
  } catch (error) {
    console.error('[decideProposal]', error);
    return { ok: false, error: 'Le service est momentanément indisponible.' };
  }
}

export async function acceptProposalAction(
  proposalId: string,
): Promise<PostActionResult> {
  return decideProposal(proposalId, 'acceptee');
}

export async function refuseProposalAction(
  proposalId: string,
): Promise<PostActionResult> {
  return decideProposal(proposalId, 'refusee');
}

export async function closePostAction(
  postId: string,
): Promise<PostActionResult> {
  const current = await getCurrentUser();
  if (!current) return { ok: false, error: 'Connectez-vous.' };

  try {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase
      .from('posts')
      .update({ status: 'close' })
      .eq('id', postId)
      .eq('author_id', current.user.id);

    if (error) {
      console.error('[closePostAction]', error.message);
      return { ok: false, error: 'La clôture a échoué.' };
    }

    revalidatePath(`/connect/${postId}`);
    revalidatePath('/connect');
    return { ok: true, message: 'Publication clôturée.' };
  } catch (error) {
    console.error('[closePostAction]', error);
    return { ok: false, error: 'Le service est momentanément indisponible.' };
  }
}

export async function withdrawProposalAction(
  proposalId: string,
): Promise<PostActionResult> {
  const current = await getCurrentUser();
  if (!current) return { ok: false, error: 'Connectez-vous.' };

  try {
    const supabase = createSupabaseServerClient();
    const { data: proposal } = await supabase
      .from('proposals')
      .select('post_id')
      .eq('id', proposalId)
      .eq('author_id', current.user.id)
      .maybeSingle();

    if (!proposal) return { ok: false, error: 'Réponse introuvable.' };

    const { error } = await supabase
      .from('proposals')
      .update({ status: 'retiree' })
      .eq('id', proposalId);

    if (error) {
      return { ok: false, error: 'Le retrait a échoué.' };
    }

    revalidatePath(`/connect/${proposal.post_id}`);
    return { ok: true, message: 'Réponse retirée.' };
  } catch (error) {
    console.error('[withdrawProposalAction]', error);
    return { ok: false, error: 'Le service est momentanément indisponible.' };
  }
}
