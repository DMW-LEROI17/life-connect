'use server';

import { revalidatePath } from 'next/cache';

import { getSupabaseAdmin } from '@/lib/supabase/admin';

export async function updateProviderLocationAction(
  token: string,
  latitude: number,
  longitude: number,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin.rpc('update_provider_location', {
      p_token: token,
      p_lat: latitude,
      p_lng: longitude,
    });

    if (error) {
      console.error('[updateProviderLocationAction]', error.message);
      return { ok: false, error: 'La position n’a pas pu être envoyée.' };
    }

    const result = data as { ok: boolean; error?: string } | null;

    if (!result?.ok) {
      return { ok: false, error: 'Lien de mission invalide ou expiré.' };
    }

    revalidatePath(`/mission/${token}`);
    return { ok: true };
  } catch (error) {
    console.error('[updateProviderLocationAction]', error);
    return { ok: false, error: 'Le service est momentanément indisponible.' };
  }
}

export async function completeMissionAction(
  token: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin.rpc('complete_mission', {
      p_token: token,
    });

    if (error) {
      console.error('[completeMissionAction]', error.message);
      return { ok: false, error: 'La clôture a échoué.' };
    }

    const result = data as { ok: boolean; error?: string } | null;
    if (!result?.ok) {
      return { ok: false, error: 'Mission introuvable.' };
    }

    revalidatePath(`/mission/${token}`);
    return { ok: true };
  } catch (error) {
    console.error('[completeMissionAction]', error);
    return { ok: false, error: 'Le service est momentanément indisponible.' };
  }
}
