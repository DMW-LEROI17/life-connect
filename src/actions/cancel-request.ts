'use server';

import { revalidatePath } from 'next/cache';

import { isUuid } from '@/lib/queries';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export type ActionResult = { ok: true } | { ok: false; error: string };

const ERRORS: Record<string, string> = {
  not_found: 'Demande introuvable.',
  not_cancellable: 'Cette demande ne peut plus être annulée.',
};

export async function cancelRequest(token: string): Promise<ActionResult> {
  if (!isUuid(token)) {
    return { ok: false, error: 'Lien invalide.' };
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.rpc('cancel_request', {
      p_token: token,
    });

    if (error) {
      console.error('[cancelRequest]', error.message);
      return { ok: false, error: 'L’annulation a échoué. Réessayez.' };
    }

    const result = data as { ok: boolean; error?: string } | null;

    if (!result?.ok) {
      return {
        ok: false,
        error: ERRORS[result?.error ?? ''] ?? 'L’annulation a échoué.',
      };
    }

    revalidatePath(`/suivi/${token}`);
    return { ok: true };
  } catch (error) {
    console.error('[cancelRequest]', error);
    return { ok: false, error: 'Le service est momentanément indisponible.' };
  }
}
