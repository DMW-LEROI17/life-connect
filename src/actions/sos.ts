'use server';

import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';

import { normalizeCmPhone } from '@/lib/phone';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export type SosResult =
  | { ok: true; token?: string; alertId?: string }
  | { ok: false; error: string };

function coordinate(value: FormDataEntryValue | null, max: number): number | null {
  if (typeof value !== 'string' || value.trim() === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && Math.abs(parsed) <= max ? parsed : null;
}

export async function createSosAlertAction(
  formData: FormData,
): Promise<SosResult> {
  if (String(formData.get('site_web') ?? '')) {
    return { ok: false, error: 'Requête invalide.' };
  }

  const phone = normalizeCmPhone(String(formData.get('tel_client') ?? ''));

  if (!phone) {
    return { ok: false, error: 'Entrez un numéro camerounais valide.' };
  }

  const nom = String(formData.get('nom') ?? '').trim().slice(0, 80);
  const quartier = String(formData.get('quartier') ?? '').trim().slice(0, 120);
  const description = String(formData.get('description') ?? '')
    .trim()
    .slice(0, 600);
  const latitude = coordinate(formData.get('latitude'), 90);
  const longitude = coordinate(formData.get('longitude'), 180);

  if ((latitude === null) !== (longitude === null)) {
    return { ok: false, error: 'Position GPS incomplète.' };
  }

  if (!quartier && latitude === null) {
    return {
      ok: false,
      error: 'Indiquez votre quartier ou utilisez votre position GPS.',
    };
  }

  const admin = getSupabaseAdmin();
  let alertId: string | undefined;

  // Table dédiée si elle existe dans le projet Supabase.
  try {
    const { data, error } = await admin
      .from('sos_alerts')
      .insert({
        nom: nom || 'Anonyme',
        telephone: phone,
        quartier: quartier || 'Position GPS',
        latitude,
        longitude,
        statut: 'nouvelle',
        source: 'web',
      })
      .select('id')
      .maybeSingle();

    if (!error && data?.id) alertId = String(data.id);
  } catch {
    // La table sos_alerts n'existe pas : on utilise requests, qui alimente
    // déjà l'écran /admin/sos et le suivi client.
  }

  try {
    const token = randomUUID();

    const payload = {
      token,
      ville: 'Cameroun',
      categorie: 'urgence',
      probleme: nom ? `Alerte SOS — ${nom}` : 'Alerte SOS',
      description:
        description ||
        'Alerte SOS envoyée depuis la page /sos. Le client attend un contact immédiat.',
      tel_client: phone,
      quartier: quartier || 'Position GPS',
      latitude,
      longitude,
      is_emergency: true,
      emergency_type: 'sos',
      needs_transport: false,
      statut: 'nouvelle',
    };

    const { error } = await admin.from('requests').insert(payload);

    if (error) {
      // Compatibilité avec un schéma plus ancien (sans colonnes SOS).
      const { error: fallbackError } = await admin.from('requests').insert({
        token,
        ville: 'Cameroun',
        categorie: 'technicien',
        probleme: nom ? `Alerte SOS — ${nom}` : 'Alerte SOS',
        description:
          description ||
          'Alerte SOS envoyée depuis la page /sos. Le client attend un contact immédiat.',
        tel_client: phone,
        quartier: quartier || 'Position GPS',
        latitude,
        longitude,
      });

      if (fallbackError) {
        console.error('[createSosAlertAction]', error.message, fallbackError.message);
        return {
          ok: false,
          error: 'L’alerte n’a pas pu être enregistrée. Appelez le 117 ou le 118.',
        };
      }
    }

    revalidatePath('/admin');
    revalidatePath('/admin/sos');
    return { ok: true, token, alertId };
  } catch (error) {
    console.error('[createSosAlertAction]', error);
    return {
      ok: false,
      error: 'L’alerte n’a pas pu être enregistrée. Appelez le 117 ou le 118.',
    };
  }
}
