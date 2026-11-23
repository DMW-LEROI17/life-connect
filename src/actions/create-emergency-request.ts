'use server';

import { normalizeCmPhone } from '@/lib/phone';
import { createRequestRecord } from '@/lib/request-service';

export type CreateEmergencyResult =
  | { ok: true; token: string }
  | { ok: false; error: string };

function numberOrNull(value: FormDataEntryValue | null): number | null {
  if (typeof value !== 'string' || value.trim() === '') return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

const TRANSPORT_LABELS: Record<string, string> = {
  moto: 'Moto-taxi',
  taxi: 'Taxi',
  vehicule: 'Véhicule',
  autre: 'Autre transport',
};

export async function createEmergencyRequest(
  formData: FormData,
): Promise<CreateEmergencyResult> {
  const phone = normalizeCmPhone(String(formData.get('tel_client') ?? ''));

  if (!phone) {
    return { ok: false, error: 'Numéro camerounais invalide.' };
  }

  if (formData.get('consent') !== 'on') {
    return {
      ok: false,
      error: 'Vous devez accepter d’être contacté.',
    };
  }

  if (String(formData.get('site_web') ?? '')) {
    return { ok: false, error: 'Requête invalide.' };
  }

  const regionId = numberOrNull(formData.get('region_id'));

  if (!regionId) {
    return { ok: false, error: 'Choisissez votre région.' };
  }

  const type = String(formData.get('type_transport') ?? 'moto');
  const typeLabel = TRANSPORT_LABELS[type] ?? 'Transport';

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

  if ((latitude === null) !== (longitude === null)) {
    return { ok: false, error: 'Position incomplète.' };
  }

  return createRequestRecord({
    categorie: 'taxi_moto',
    probleme: `Transport urgent — ${typeLabel}`,
    description: String(formData.get('description') ?? '').slice(0, 600),
    telClient: phone,
    regionId,
    departementId: numberOrNull(formData.get('departement_id')),
    arrondissementId: numberOrNull(formData.get('arrondissement_id')),
    quartierId: numberOrNull(formData.get('quartier_id')),
    quartierLibre: String(formData.get('quartier') ?? ''),
    latitude,
    longitude,
    isEmergency: true,
    emergencyType: 'transport',
    needsTransport: true,
  });
}
