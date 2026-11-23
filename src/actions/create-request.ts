'use server';

import { normalizeCmPhone } from '@/lib/phone';
import { createRequestRecord } from '@/lib/request-service';
import { createRequestSchema, firstZodError } from '@/lib/validation';

export type CreateRequestResult =
  | { ok: true; token: string }
  | { ok: false; error: string };

function numberOrNull(value: FormDataEntryValue | null): number | null {
  if (typeof value !== 'string' || value.trim() === '') return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

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
    sous_categorie_id: numberOrNull(formData.get('sous_categorie_id')),
    probleme: formData.get('probleme') ?? '',
    description: formData.get('description') ?? '',
    tel_client: formData.get('tel_client'),
    region_id: numberOrNull(formData.get('region_id')),
    departement_id: numberOrNull(formData.get('departement_id')),
    arrondissement_id: numberOrNull(formData.get('arrondissement_id')),
    quartier_id: numberOrNull(formData.get('quartier_id')),
    quartier: formData.get('quartier') ?? '',
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

  if ((latitude === null) !== (longitude === null)) {
    return { ok: false, error: 'Position incomplète.' };
  }

  const phone = normalizeCmPhone(input.tel_client);

  if (!phone) {
    return { ok: false, error: 'Numéro camerounais invalide.' };
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

  return createRequestRecord({
    categorie: input.categorie,
    sousCategorieId: input.sous_categorie_id ?? null,
    probleme: input.probleme,
    description: input.description,
    telClient: phone,
    regionId: input.region_id,
    departementId: input.departement_id ?? null,
    arrondissementId: input.arrondissement_id ?? null,
    quartierId: input.quartier_id ?? null,
    quartierLibre: input.quartier,
    latitude,
    longitude,
  });
}
