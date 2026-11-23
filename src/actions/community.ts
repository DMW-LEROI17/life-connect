'use server';

import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';

import { getCurrentUser } from '@/lib/auth-user';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export type CommunityActionResult =
  | { ok: true; id?: string; slug?: string; message?: string }
  | { ok: false; error: string };

function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50);
}

export async function createGroupAction(
  formData: FormData,
): Promise<CommunityActionResult> {
  const current = await getCurrentUser();
  if (!current) return { ok: false, error: 'Connectez-vous.' };

  const name = String(formData.get('name') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const city = String(formData.get('city') ?? '').trim();
  const visibility = String(formData.get('visibility') ?? 'publique');

  if (name.length < 3 || name.length > 80) {
    return { ok: false, error: 'Nom invalide (3 à 80 caractères).' };
  }

  if (description.length > 800) {
    return { ok: false, error: 'Description trop longue (800 max).' };
  }

  if (!['publique', 'privee'].includes(visibility)) {
    return { ok: false, error: 'Visibilité invalide.' };
  }

  try {
    const supabase = createSupabaseServerClient();
    const slug = `${slugify(name) || 'groupe'}-${randomUUID().slice(0, 6)}`;

    const { data, error } = await supabase
      .from('groups')
      .insert({
        owner_id: current.user.id,
        owner_name: current.profile.full_name || 'Membre',
        name,
        slug,
        description: description || null,
        city: city || current.profile.city,
        visibility,
      })
      .select('id, slug')
      .single();

    if (error || !data?.id) {
      console.error('[createGroupAction]', error?.message);
      return {
        ok: false,
        error:
          'Le groupe n’a pas pu être créé. Vérifiez que la migration V5 est exécutée.',
      };
    }

    await supabase.from('group_members').insert({
      group_id: data.id,
      user_id: current.user.id,
      role: 'admin',
    });

    revalidatePath('/community');
    return {
      ok: true,
      id: data.id as string,
      slug: data.slug as string,
      message: 'Groupe créé.',
    };
  } catch (error) {
    console.error('[createGroupAction]', error);
    return { ok: false, error: 'Le service est momentanément indisponible.' };
  }
}

export async function joinGroupAction(
  groupId: string,
): Promise<CommunityActionResult> {
  const current = await getCurrentUser();
  if (!current) return { ok: false, error: 'Connectez-vous.' };

  try {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase.from('group_members').insert({
      group_id: groupId,
      user_id: current.user.id,
      role: 'membre',
    });

    if (error && error.code !== '23505') {
      return { ok: false, error: 'Impossible de rejoindre ce groupe.' };
    }

    revalidatePath('/community');
    return { ok: true, message: 'Vous avez rejoint le groupe.' };
  } catch {
    return { ok: false, error: 'Le service est momentanément indisponible.' };
  }
}

export async function leaveGroupAction(
  groupId: string,
): Promise<CommunityActionResult> {
  const current = await getCurrentUser();
  if (!current) return { ok: false, error: 'Connectez-vous.' };

  try {
    const supabase = createSupabaseServerClient();
    await supabase
      .from('group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', current.user.id);

    revalidatePath('/community');
    return { ok: true, message: 'Vous avez quitté le groupe.' };
  } catch {
    return { ok: false, error: 'Le service est momentanément indisponible.' };
  }
}

export async function createGroupPostAction(
  groupId: string,
  formData: FormData,
): Promise<CommunityActionResult> {
  const current = await getCurrentUser();
  if (!current) return { ok: false, error: 'Connectez-vous.' };

  const body = String(formData.get('body') ?? '').trim();

  if (body.length < 2 || body.length > 2000) {
    return { ok: false, error: 'Message invalide (2 à 2000 caractères).' };
  }

  try {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase.from('group_posts').insert({
      group_id: groupId,
      author_id: current.user.id,
      author_name: current.profile.full_name || 'Membre',
      body,
    });

    if (error) {
      return { ok: false, error: 'Le message n’a pas pu être publié.' };
    }

    revalidatePath('/community');
    return { ok: true, message: 'Message publié.' };
  } catch {
    return { ok: false, error: 'Le service est momentanément indisponible.' };
  }
}

export async function createExchangeAction(
  formData: FormData,
): Promise<CommunityActionResult> {
  const current = await getCurrentUser();
  if (!current) return { ok: false, error: 'Connectez-vous.' };

  const title = String(formData.get('title') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const kind = String(formData.get('kind') ?? 'offre');
  const skill = String(formData.get('skill') ?? '').trim();
  const city = String(formData.get('city') ?? '').trim();

  if (title.length < 3 || title.length > 120) {
    return { ok: false, error: 'Titre invalide.' };
  }

  if (description.length < 10 || description.length > 1200) {
    return { ok: false, error: 'Description invalide (10 à 1200 caractères).' };
  }

  if (kind !== 'offre' && kind !== 'recherche') {
    return { ok: false, error: 'Type invalide.' };
  }

  try {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase.from('exchange_listings').insert({
      user_id: current.user.id,
      user_name: current.profile.full_name || 'Membre',
      title,
      description,
      kind,
      skill: skill || null,
      city: city || current.profile.city,
    });

    if (error) {
      return { ok: false, error: 'L’échange n’a pas pu être publié.' };
    }

    revalidatePath('/exchange');
    return { ok: true, message: 'Échange publié.' };
  } catch {
    return { ok: false, error: 'Le service est momentanément indisponible.' };
  }
}
