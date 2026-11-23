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

// -----------------------------------------------------------------------------
// Catalogue : catégories et sous-catégories
// -----------------------------------------------------------------------------
const SLUG_RE = /^[a-z0-9_]{2,60}$/;

export interface CategoryInput {
  family_slug: string;
  slug: string;
  nom_fr: string;
  nom_en?: string;
  icon?: string;
  description?: string;
  sort_order?: number;
  is_emergency?: boolean;
}

export async function createCategory(
  input: CategoryInput,
): Promise<AdminActionResult> {
  const denied = await guard();
  if (denied) return denied;

  const slug = input.slug.trim().toLowerCase();
  const nom = input.nom_fr.trim();

  if (!SLUG_RE.test(slug)) {
    return { ok: false, error: 'Slug invalide (a-z, 0-9, _).' };
  }

  if (nom.length < 2 || nom.length > 80) {
    return { ok: false, error: 'Le nom doit contenir 2 à 80 caractères.' };
  }

  try {
    const supabase = getSupabaseAdmin();

    const { error } = await supabase.from('categories').insert({
      family_slug: input.family_slug,
      slug,
      nom_fr: nom,
      nom_en: input.nom_en?.trim() || null,
      icon: input.icon?.trim() || 'wrench',
      description: input.description?.trim() || null,
      sort_order: Number(input.sort_order ?? 99),
      is_emergency: Boolean(input.is_emergency),
      is_active: true,
    });

    if (error) {
      console.error('[createCategory]', error.message);
      return {
        ok: false,
        error:
          error.code === '23505'
            ? 'Ce slug existe déjà.'
            : 'La catégorie n’a pas pu être créée.',
      };
    }

    revalidatePath('/admin/categories');
    revalidatePath('/aide');
    revalidatePath('/');
    return { ok: true };
  } catch (error) {
    console.error('[createCategory]', error);
    return { ok: false, error: 'Le service est momentanément indisponible.' };
  }
}

export async function updateCategory(
  id: number,
  input: { nom_fr: string; nom_en?: string; icon?: string; description?: string; sort_order?: number; is_emergency?: boolean },
): Promise<AdminActionResult> {
  const denied = await guard();
  if (denied) return denied;

  const nom = input.nom_fr.trim();
  if (!Number.isInteger(id) || id <= 0 || nom.length < 2 || nom.length > 80) {
    return { ok: false, error: 'Données invalides.' };
  }

  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from('categories')
      .update({
        nom_fr: nom,
        nom_en: input.nom_en?.trim() || null,
        icon: input.icon?.trim() || 'wrench',
        description: input.description?.trim() || null,
        sort_order: Number(input.sort_order ?? 99),
        is_emergency: Boolean(input.is_emergency),
      })
      .eq('id', id);

    if (error) {
      console.error('[updateCategory]', error.message);
      return { ok: false, error: 'La mise à jour a échoué.' };
    }

    revalidatePath('/admin/categories');
    revalidatePath('/aide');
    revalidatePath('/');
    return { ok: true };
  } catch (error) {
    console.error('[updateCategory]', error);
    return { ok: false, error: 'Le service est momentanément indisponible.' };
  }
}

export async function toggleCategory(
  id: number,
  isActive: boolean,
): Promise<AdminActionResult> {
  const denied = await guard();
  if (denied) return denied;

  if (!Number.isInteger(id) || id <= 0) {
    return { ok: false, error: 'Identifiant invalide.' };
  }

  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from('categories')
      .update({ is_active: isActive })
      .eq('id', id);

    if (error) {
      console.error('[toggleCategory]', error.message);
      return { ok: false, error: 'La mise à jour a échoué.' };
    }

    revalidatePath('/admin/categories');
    revalidatePath('/aide');
    revalidatePath('/');
    return { ok: true };
  } catch (error) {
    console.error('[toggleCategory]', error);
    return { ok: false, error: 'Le service est momentanément indisponible.' };
  }
}

export async function createSubcategory(input: {
  category_id: number;
  slug: string;
  nom_fr: string;
  nom_en?: string;
  sort_order?: number;
}): Promise<AdminActionResult> {
  const denied = await guard();
  if (denied) return denied;

  const slug = input.slug.trim().toLowerCase();
  const nom = input.nom_fr.trim();

  if (
    !Number.isInteger(input.category_id) ||
    input.category_id <= 0 ||
    !SLUG_RE.test(slug) ||
    nom.length < 2 ||
    nom.length > 100
  ) {
    return { ok: false, error: 'Données invalides.' };
  }

  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from('subcategories').insert({
      category_id: input.category_id,
      slug,
      nom_fr: nom,
      nom_en: input.nom_en?.trim() || null,
      sort_order: Number(input.sort_order ?? 99),
      is_active: true,
    });

    if (error) {
      console.error('[createSubcategory]', error.message);
      return {
        ok: false,
        error:
          error.code === '23505'
            ? 'Ce sous-service existe déjà.'
            : 'Le sous-service n’a pas pu être créé.',
      };
    }

    revalidatePath('/admin/categories');
    revalidatePath('/aide');
    return { ok: true };
  } catch (error) {
    console.error('[createSubcategory]', error);
    return { ok: false, error: 'Le service est momentanément indisponible.' };
  }
}

export async function toggleSubcategory(
  id: number,
  isActive: boolean,
): Promise<AdminActionResult> {
  const denied = await guard();
  if (denied) return denied;

  if (!Number.isInteger(id) || id <= 0) {
    return { ok: false, error: 'Identifiant invalide.' };
  }

  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from('subcategories')
      .update({ is_active: isActive })
      .eq('id', id);

    if (error) {
      console.error('[toggleSubcategory]', error.message);
      return { ok: false, error: 'La mise à jour a échoué.' };
    }

    revalidatePath('/admin/categories');
    revalidatePath('/aide');
    return { ok: true };
  } catch (error) {
    console.error('[toggleSubcategory]', error);
    return { ok: false, error: 'Le service est momentanément indisponible.' };
  }
}
