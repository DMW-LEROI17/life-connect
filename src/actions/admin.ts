'use server';

import { revalidatePath } from 'next/cache';

import { isAdmin } from '@/lib/auth';
import { isUuid } from '@/lib/queries';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import type { ProviderStatus, RequestStatus } from '@/types/db';

export type AdminActionResult = { ok: true } | { ok: false; error: string };

async function guard(): Promise<AdminActionResult | null> {
  if (!(await isAdmin())) {
    return { ok: false, error: 'Session expirée. Reconnectez-vous.' };
  }
  return null;
}

export async function assignProvider(
  requestId: string,
  providerId: string,
): Promise<AdminActionResult> {
  const denied = await guard();
  if (denied) return denied;

  if (!isUuid(requestId) || !isUuid(providerId)) {
    return { ok: false, error: 'Identifiant invalide.' };
  }

  try {
    const supabase = getSupabaseAdmin();

    const { data: request, error: requestError } = await supabase
      .from('requests')
      .select('id, token, statut, categorie')
      .eq('id', requestId)
      .maybeSingle();

    if (requestError || !request) {
      return { ok: false, error: 'Demande introuvable.' };
    }

    if (request.statut === 'annulee' || request.statut === 'resolue') {
      return { ok: false, error: 'Cette demande est déjà clôturée.' };
    }

    const { data: provider, error: providerError } = await supabase
      .from('providers')
      .select('id, statut, metier, disponible')
      .eq('id', providerId)
      .maybeSingle();

    if (providerError || !provider || provider.statut !== 'valide') {
      return { ok: false, error: 'Ce prestataire n’est pas validé.' };
    }

    if (!provider.disponible) {
      return { ok: false, error: 'Ce prestataire est indisponible.' };
    }

    if (provider.metier !== request.categorie) {
      return {
        ok: false,
        error: 'Ce prestataire n’intervient pas dans cette catégorie.',
      };
    }

    const { error } = await supabase
      .from('requests')
      .update({
        statut: 'assignee',
        provider_id: providerId,
        assigne_le: new Date().toISOString(),
      })
      .eq('id', requestId);

    if (error) {
      console.error('[assignProvider]', error.message);
      return { ok: false, error: 'L’assignation a échoué.' };
    }

    revalidatePath('/admin');
    revalidatePath(`/admin/demandes/${requestId}`);
    revalidatePath(`/suivi/${request.token}`);

    return { ok: true };
  } catch (error) {
    console.error('[assignProvider]', error);
    return { ok: false, error: 'Le service est momentanément indisponible.' };
  }
}

export async function updateRequestStatus(
  requestId: string,
  statut: Extract<RequestStatus, 'resolue' | 'annulee'>,
): Promise<AdminActionResult> {
  const denied = await guard();
  if (denied) return denied;

  if (!isUuid(requestId)) {
    return { ok: false, error: 'Identifiant invalide.' };
  }

  if (statut !== 'resolue' && statut !== 'annulee') {
    return { ok: false, error: 'Statut invalide.' };
  }

  try {
    const supabase = getSupabaseAdmin();

    const { data: request, error: requestError } = await supabase
      .from('requests')
      .select('id, token, statut')
      .eq('id', requestId)
      .maybeSingle();

    if (requestError || !request) {
      return { ok: false, error: 'Demande introuvable.' };
    }

    if (request.statut === 'annulee' || request.statut === 'resolue') {
      return { ok: false, error: 'Cette demande est déjà clôturée.' };
    }

    const now = new Date().toISOString();

    const { error } = await supabase
      .from('requests')
      .update(
        statut === 'resolue'
          ? { statut, resolue_le: now }
          : { statut, annulee_le: now },
      )
      .eq('id', requestId);

    if (error) {
      console.error('[updateRequestStatus]', error.message);
      return { ok: false, error: 'La mise à jour a échoué.' };
    }

    revalidatePath('/admin');
    revalidatePath(`/admin/demandes/${requestId}`);
    revalidatePath(`/suivi/${request.token}`);

    return { ok: true };
  } catch (error) {
    console.error('[updateRequestStatus]', error);
    return { ok: false, error: 'Le service est momentanément indisponible.' };
  }
}

export async function setProviderStatus(
  providerId: string,
  statut: Extract<ProviderStatus, 'valide' | 'refuse' | 'suspendu'>,
): Promise<AdminActionResult> {
  const denied = await guard();
  if (denied) return denied;

  if (!isUuid(providerId)) {
    return { ok: false, error: 'Identifiant invalide.' };
  }

  if (!['valide', 'refuse', 'suspendu'].includes(statut)) {
    return { ok: false, error: 'Statut invalide.' };
  }

  try {
    const supabase = getSupabaseAdmin();

    const { error } = await supabase
      .from('providers')
      .update({
        statut,
        valide_le: statut === 'valide' ? new Date().toISOString() : null,
      })
      .eq('id', providerId);

    if (error) {
      console.error('[setProviderStatus]', error.message);
      return { ok: false, error: 'La mise à jour a échoué.' };
    }

    revalidatePath('/admin/prestataires');
    revalidatePath('/admin');

    return { ok: true };
  } catch (error) {
    console.error('[setProviderStatus]', error);
    return { ok: false, error: 'Le service est momentanément indisponible.' };
  }
}
