'use server';

import { getCategory } from '@/lib/constants';
import { normalizeCmPhone } from '@/lib/phone';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { createRequestSchema, firstZodError } from '@/lib/validation';

export type CreateRequestResult =
  | { ok: true; token: string }
  | { ok: false; error: string };

export async function createRequest(
  formData: FormData,
): Promise<CreateRequestResult> {
  const latRaw = formData.get('latitude');
  const lngRaw = formData.get('longitude');
  const latitude =
    typeof latRaw === 'string' && latRaw.trim() !== ''
      ? Number(latRaw)
      : null;
  const longitude =
    typeof lngRaw === 'string' && lngRaw.trim() !== ''
      ? Number(lngRaw)
      : null;

  const parsed = createRequestSchema.safeParse({
    categorie: formData.get('categorie'),
    probleme: formData.get('probleme'),
    description: formData.get('description') ?? '',
    tel_client: formData.get('tel_client'),
    quartier: formData.get('quartier'),
    latitude,
    longitude,
    site_web: formData.get('site_web') ?? '',
  });

  if (!parsed.success) {
    return { ok: false, error: firstZodError(parsed.error) };
  }

  const input = parsed.data;

  if (input.site_web) {
    return { ok: false, error: 'Requête invalide.' };
  }

  if (formData.get('consent') !== 'on') {
    return {
      ok: false,
      error: 'Vous devez accepter d’être contacté au sujet de cette demande.',
    };
  }

  const category = getCategory(input.categorie);

  if (!category || !category.problems.includes(input.probleme)) {
    return {
      ok: false,
      error: 'Ce problème ne correspond pas à la catégorie choisie.',
    };
  }

  if (
    input.probleme.startsWith('Autre') &&
    input.description.trim().length < 10
  ) {
    return {
      ok: false,
      error:
        'Décrivez votre problème en quelques mots (10 caractères minimum).',
    };
  }

  const phone = normalizeCmPhone(input.tel_client);

  if (!phone) {
    return { ok: false, error: 'Numéro camerounais invalide.' };
  }

  if ((latitude === null) !== (longitude === null)) {
    return { ok: false, error: 'Position incomplète.' };
  }

  try {
    const supabase = getSupabaseAdmin();

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    const { count } = await supabase
      .from('requests')
      .select('id', { count: 'exact', head: true })
      .eq('tel_client', phone)
      .gte('cree_le', oneHourAgo);

    if ((count ?? 0) >= 3) {
      return {
        ok: false,
        error:
          'Vous avez déjà envoyé 3 demandes cette heure-ci. Réessayez plus tard ou écrivez-nous sur WhatsApp.',
      };
    }

    const { data, error } = await supabase
      .from('requests')
      .insert({
        ville: 'Douala',
        categorie: input.categorie,
        probleme: input.probleme,
        description: input.description.trim() || null,
        tel_client: phone,
        latitude,
        longitude,
        quartier: input.quartier,
        statut: 'nouvelle',
      })
      .select('token')
      .single();

    if (error || !data?.token) {
      console.error('[createRequest]', error?.message);
      return {
        ok: false,
        error:
          'La demande n’a pas pu être enregistrée. Réessayez dans un instant.',
      };
    }

    return { ok: true, token: data.token as string };
  } catch (error) {
    console.error('[createRequest]', error);
    return {
      ok: false,
      error:
        'Le service est momentanément indisponible. Réessayez dans un instant.',
    };
  }
}
