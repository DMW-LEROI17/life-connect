'use server';

import { revalidatePath } from 'next/cache';

import { isUuid } from '@/lib/queries';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export type RatingResult = { ok: true } | { ok: false; error: string };

const ERRORS: Record<string, string> = {
  not_found: 'Demande introuvable.',
  not_rateable: 'Cette demande ne peut pas encore être notée.',
  already_rated: 'Vous avez déjà laissé un avis pour cette demande.',
  invalid_rating: 'Choisissez une note entre 1 et 5 étoiles.',
};

export async function rateRequest(
  token: string,
  input: { etoiles: number; resolu: boolean; commentaire: string },
): Promise<RatingResult> {
  if (!isUuid(token)) {
    return { ok: false, error: 'Lien invalide.' };
  }

  if (
    !Number.isInteger(input.etoiles) ||
    input.etoiles < 1 ||
    input.etoiles > 5
  ) {
    return { ok: false, error: 'Choisissez une note entre 1 et 5 étoiles.' };
  }

  if (typeof input.commentaire !== 'string' || input.commentaire.length > 500) {
    return { ok: false, error: 'Commentaire trop long.' };
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.rpc('submit_rating', {
      p_token: token,
      p_etoiles: input.etoiles,
      p_resolu: input.resolu,
      p_commentaire: input.commentaire.trim(),
    });

    if (error) {
      console.error('[rateRequest]', error.message);
      return { ok: false, error: 'L’envoi de l’avis a échoué. Réessayez.' };
    }

    const result = data as { ok: boolean; error?: string } | null;

    if (!result?.ok) {
      return {
        ok: false,
        error: ERRORS[result?.error ?? ''] ?? 'L’envoi de l’avis a échoué.',
      };
    }

    revalidatePath(`/suivi/${token}`);
    revalidatePath(`/noter/${token}`);
    return { ok: true };
  } catch (error) {
    console.error('[rateRequest]', error);
    return { ok: false, error: 'Le service est momentanément indisponible.' };
  }
}
