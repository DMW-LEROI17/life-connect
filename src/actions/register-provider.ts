'use server';

import { randomUUID } from 'node:crypto';

import { normalizeCmPhone } from '@/lib/phone';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { firstZodError, providerSchema } from '@/lib/validation';

export type RegisterProviderResult =
  | { ok: true }
  | { ok: false; error: string };

const MAX_PHOTO_SIZE = 2 * 1024 * 1024;
const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export async function registerProvider(
  formData: FormData,
): Promise<RegisterProviderResult> {
  const parsed = providerSchema.safeParse({
    nom: formData.get('nom'),
    metier: formData.get('metier'),
    specialite: formData.get('specialite') ?? '',
    quartier: formData.get('quartier'),
    whatsapp: formData.get('whatsapp'),
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
      error: 'Vous devez accepter les conditions d’utilisation.',
    };
  }

  const phone = normalizeCmPhone(input.whatsapp);

  if (!phone) {
    return { ok: false, error: 'Numéro WhatsApp invalide.' };
  }

  const photo = formData.get('photo');
  const hasPhoto = photo instanceof File && photo.size > 0;

  if (hasPhoto) {
    const file = photo as File;

    if (file.size > MAX_PHOTO_SIZE) {
      return { ok: false, error: 'La photo ne doit pas dépasser 2 Mo.' };
    }

    if (!ALLOWED_TYPES[file.type]) {
      return {
        ok: false,
        error: 'Format de photo non accepté (JPEG, PNG ou WebP).',
      };
    }
  }

  try {
    const supabase = getSupabaseAdmin();

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    const { count } = await supabase
      .from('providers')
      .select('id', { count: 'exact', head: true })
      .eq('whatsapp', phone)
      .gte('cree_le', oneHourAgo);

    if ((count ?? 0) >= 2) {
      return {
        ok: false,
        error:
          'Vous avez déjà envoyé plusieurs inscriptions cette heure-ci. Réessayez plus tard.',
      };
    }

    let photoUrl: string | null = null;
    let uploadedPath: string | null = null;

    if (hasPhoto) {
      const file = photo as File;
      const extension = ALLOWED_TYPES[file.type];
      const path = `${randomUUID()}.${extension}`;
      const buffer = Buffer.from(await file.arrayBuffer());

      const { error: uploadError } = await supabase.storage
        .from('providers')
        .upload(path, buffer, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        console.error('[registerProvider:upload]', uploadError.message);
        return {
          ok: false,
          error:
            'La photo n’a pas pu être envoyée. Réessayez sans photo ou avec une image plus légère.',
        };
      }

      uploadedPath = path;
      const { data: publicUrl } = supabase.storage
        .from('providers')
        .getPublicUrl(path);

      photoUrl = publicUrl.publicUrl;
    }

    const { error } = await supabase.from('providers').insert({
      nom: input.nom,
      metier: input.metier,
      specialite: input.specialite.trim() || null,
      quartier: input.quartier,
      whatsapp: phone,
      photo_url: photoUrl,
      statut: 'en_attente',
      disponible: true,
      note_moyenne: 0,
      nombre_avis: 0,
      est_demo: false,
    });

    if (error) {
      if (uploadedPath) {
        await supabase.storage.from('providers').remove([uploadedPath]);
      }

      console.error('[registerProvider:insert]', error.message);
      return {
        ok: false,
        error:
          'L’inscription n’a pas pu être enregistrée. Réessayez dans un instant.',
      };
    }

    return { ok: true };
  } catch (error) {
    console.error('[registerProvider]', error);
    return {
      ok: false,
      error: 'Le service est momentanément indisponible.',
    };
  }
}
