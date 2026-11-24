'use server';

import { revalidatePath } from 'next/cache';

import { getCurrentUser } from '@/lib/auth-user';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export type RadarActionResult =
  | { ok: true; message?: string }
  | { ok: false; error: string };

function numberOrNull(value: FormDataEntryValue | null): number | null {
  if (typeof value !== 'string' || value.trim() === '') return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export async function createOpportunityAction(
  formData: FormData,
): Promise<RadarActionResult> {
  const current = await getCurrentUser();
  if (!current) return { ok: false, error: 'Connectez-vous.' };

  const title = String(formData.get('title') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const kind = String(formData.get('kind') ?? 'projet');
  const city = String(formData.get('city') ?? '').trim();
  const deadline = String(formData.get('deadline') ?? '').trim();
  const link = String(formData.get('link') ?? '').trim();

  if (title.length < 3 || title.length > 140) {
    return { ok: false, error: 'Titre invalide (3 à 140 caractères).' };
  }

  if (description.length < 10 || description.length > 2000) {
    return { ok: false, error: 'Description invalide (10 à 2000 caractères).' };
  }

  if (!['emploi', 'stage', 'evenement', 'partenariat', 'projet'].includes(kind)) {
    return { ok: false, error: 'Catégorie invalide.' };
  }

  if (link && !/^https?:\/\//i.test(link)) {
    return { ok: false, error: 'Le lien doit commencer par http:// ou https://.' };
  }

  try {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase.from('opportunities').insert({
      author_id: current.user.id,
      author_name: current.profile.full_name || 'Membre',
      title,
      description,
      kind,
      city: city || current.profile.city,
      region_id: numberOrNull(formData.get('region_id')),
      departement_id: numberOrNull(formData.get('departement_id')),
      arrondissement_id: numberOrNull(formData.get('arrondissement_id')),
      deadline: deadline || null,
      link: link || null,
    });

    if (error) {
      return { ok: false, error: 'L’opportunité n’a pas pu être publiée.' };
    }

    revalidatePath('/radar');
    return { ok: true, message: 'Opportunité publiée.' };
  } catch {
    return { ok: false, error: 'Le service est momentanément indisponible.' };
  }
}
