'use server';

import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';

import { getCurrentUser } from '@/lib/auth-user';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export type MarketActionResult =
  | { ok: true; id?: string; message?: string }
  | { ok: false; error: string };

export async function createMarketListingAction(
  formData: FormData,
): Promise<MarketActionResult> {
  const current = await getCurrentUser();
  if (!current) return { ok: false, error: 'Connectez-vous pour publier.' };

  const title = String(formData.get('title') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const priceRaw = String(formData.get('price') ?? '').trim();
  const condition = String(formData.get('condition') ?? 'occasion');
  const city = String(formData.get('city') ?? '').trim();
  const quartier = String(formData.get('quartier') ?? '').trim();
  const file = formData.get('image');

  if (title.length < 3 || title.length > 120) {
    return { ok: false, error: 'Titre invalide (3 à 120 caractères).' };
  }

  if (description.length < 10 || description.length > 2000) {
    return { ok: false, error: 'Description invalide (10 à 2000 caractères).' };
  }

  if (!['neuf', 'occasion', 'service'].includes(condition)) {
    return { ok: false, error: 'État invalide.' };
  }

  const price = priceRaw ? Number(priceRaw) : null;
  if (price != null && (!Number.isInteger(price) || price < 0)) {
    return { ok: false, error: 'Prix invalide.' };
  }

  try {
    const supabase = createSupabaseServerClient();
    let imageUrl: string | null = null;

    if (file instanceof File && file.size > 0) {
      if (file.size > 2 * 1024 * 1024) {
        return { ok: false, error: 'Photo trop lourde (2 Mo max).' };
      }

      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        return { ok: false, error: 'Format photo non accepté.' };
      }

      const extension = file.type.split('/')[1] ?? 'jpg';
      const path = `${current.user.id}/${randomUUID()}.${extension}`;
      const buffer = Buffer.from(await file.arrayBuffer());
      const { error: uploadError } = await supabase.storage
        .from('market')
        .upload(path, buffer, { contentType: file.type });

      if (uploadError) {
        console.error('[createMarketListingAction:upload]', uploadError.message);
        return {
          ok: false,
          error: 'La photo n’a pas pu être envoyée. Vérifiez la migration V5.',
        };
      }

      imageUrl = supabase.storage.from('market').getPublicUrl(path).data.publicUrl;
    }

    const { data, error } = await supabase
      .from('market_listings')
      .insert({
        seller_id: current.user.id,
        seller_name: current.profile.full_name || 'Membre',
        title,
        description,
        price_fcfa: price,
        condition,
        city: city || current.profile.city,
        quartier: quartier || null,
        image_url: imageUrl,
      })
      .select('id')
      .single();

    if (error || !data?.id) {
      console.error('[createMarketListingAction]', error?.message);
      return {
        ok: false,
        error:
          'L’annonce n’a pas pu être publiée. Vérifiez que la migration V5 est exécutée.',
      };
    }

    revalidatePath('/market');
    return { ok: true, id: data.id as string, message: 'Annonce publiée.' };
  } catch (error) {
    console.error('[createMarketListingAction]', error);
    return { ok: false, error: 'Le service est momentanément indisponible.' };
  }
}

export async function markMarketListingSoldAction(
  listingId: string,
): Promise<MarketActionResult> {
  const current = await getCurrentUser();
  if (!current) return { ok: false, error: 'Connectez-vous.' };

  try {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase
      .from('market_listings')
      .update({ status: 'vendue' })
      .eq('id', listingId)
      .eq('seller_id', current.user.id);

    if (error) {
      return { ok: false, error: 'La mise à jour a échoué.' };
    }

    revalidatePath('/market');
    revalidatePath(`/market/${listingId}`);
    return { ok: true, message: 'Annonce marquée comme vendue.' };
  } catch {
    return { ok: false, error: 'Le service est momentanément indisponible.' };
  }
}
