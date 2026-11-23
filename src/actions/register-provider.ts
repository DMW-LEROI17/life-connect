'use server';

import { randomUUID } from 'node:crypto';

import { normalizeCmPhone } from '@/lib/phone';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { firstZodError, providerSchema } from '@/lib/validation';
import type { ZoneScope } from '@/types/db';

export type RegisterProviderResult =
  | { ok: true }
  | { ok: false; error: string };

const MAX_PHOTO_SIZE = 2 * 1024 * 1024;
const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

interface ZoneInput {
  scope: ZoneScope;
  region_id?: number | null;
  departement_id?: number | null;
  arrondissement_id?: number | null;
  quartier_id?: number | null;
}

interface ResolvedZone {
  scope: ZoneScope;
  region_id: number | null;
  departement_id: number | null;
  arrondissement_id: number | null;
  quartier_id: number | null;
  label: string;
}

function parseIds(formData: FormData, key: string): number[] {
  return Array.from(
    new Set(
      formData
        .getAll(key)
        .map((value) => Number(value))
        .filter((value) => Number.isInteger(value) && value > 0),
    ),
  ).slice(0, 30);
}

function parseZones(raw: FormDataEntryValue | null): ZoneInput[] | null {
  if (typeof raw !== 'string' || !raw.trim()) return null;

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return null;
    return parsed.slice(0, 20) as ZoneInput[];
  } catch {
    return null;
  }
}

async function resolveZone(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  zone: ZoneInput,
): Promise<ResolvedZone | { error: string }> {
  const scopes: ZoneScope[] = [
    'region',
    'departement',
    'arrondissement',
    'quartier',
  ];

  if (!scopes.includes(zone.scope)) {
    return { error: 'Zone invalide.' };
  }

  if (zone.scope === 'region') {
    if (!zone.region_id) return { error: 'Région invalide.' };
    const { data } = await supabase
      .from('regions')
      .select('id, nom')
      .eq('id', zone.region_id)
      .maybeSingle();
    if (!data) return { error: 'Région introuvable.' };
    return {
      scope: 'region',
      region_id: data.id,
      departement_id: null,
      arrondissement_id: null,
      quartier_id: null,
      label: data.nom,
    };
  }

  if (zone.scope === 'departement') {
    if (!zone.departement_id) return { error: 'Département invalide.' };
    const { data } = await supabase
      .from('departements')
      .select('id, nom, region_id')
      .eq('id', zone.departement_id)
      .maybeSingle();
    if (!data) return { error: 'Département introuvable.' };
    return {
      scope: 'departement',
      region_id: data.region_id,
      departement_id: data.id,
      arrondissement_id: null,
      quartier_id: null,
      label: data.nom,
    };
  }

  if (zone.scope === 'arrondissement') {
    if (!zone.arrondissement_id) return { error: 'Commune invalide.' };
    const { data } = await supabase
      .from('arrondissements')
      .select('id, nom, departement_id')
      .eq('id', zone.arrondissement_id)
      .maybeSingle();
    if (!data) return { error: 'Commune introuvable.' };

    const { data: departement } = await supabase
      .from('departements')
      .select('region_id')
      .eq('id', data.departement_id)
      .maybeSingle();

    return {
      scope: 'arrondissement',
      region_id: departement?.region_id ?? null,
      departement_id: data.departement_id,
      arrondissement_id: data.id,
      quartier_id: null,
      label: data.nom,
    };
  }

  if (!zone.quartier_id) return { error: 'Quartier invalide.' };

  const { data } = await supabase
    .from('quartiers')
    .select('id, nom, arrondissement_id')
    .eq('id', zone.quartier_id)
    .maybeSingle();

  if (!data) return { error: 'Quartier introuvable.' };

  const { data: arrondissement } = await supabase
    .from('arrondissements')
    .select('id, departement_id')
    .eq('id', data.arrondissement_id)
    .maybeSingle();

  const { data: departement } = arrondissement
    ? await supabase
        .from('departements')
        .select('region_id')
        .eq('id', arrondissement.departement_id)
        .maybeSingle()
    : { data: null };

  return {
    scope: 'quartier',
    region_id: departement?.region_id ?? null,
    departement_id: arrondissement?.departement_id ?? null,
    arrondissement_id: data.arrondissement_id,
    quartier_id: data.id,
    label: data.nom,
  };
}

export async function registerProvider(
  formData: FormData,
): Promise<RegisterProviderResult> {
  const parsed = providerSchema.safeParse({
    nom: formData.get('nom'),
    specialite: formData.get('specialite') ?? '',
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

  const serviceIds = parseIds(formData, 'service_ids');
  const zoneInputs = parseZones(formData.get('zones'));

  if (serviceIds.length === 0) {
    return { ok: false, error: 'Choisissez au moins un service.' };
  }

  if (!zoneInputs || zoneInputs.length === 0) {
    return { ok: false, error: 'Choisissez au moins une zone d’intervention.' };
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

    const { data: services, error: servicesError } = await supabase
      .from('subcategories')
      .select('id, nom_fr, category_id, categories(slug, nom_fr, family_slug)')
      .in('id', serviceIds)
      .eq('is_active', true);

    if (servicesError || !services || services.length === 0) {
      return { ok: false, error: 'Services introuvables ou désactivés.' };
    }

    const firstService = services[0] as {
      id: number;
      nom_fr: string;
      category_id: number;
      categories:
        | { slug: string; nom_fr: string; family_slug: string }
        | { slug: string; nom_fr: string; family_slug: string }[]
        | null;
    };

    const category = Array.isArray(firstService.categories)
      ? firstService.categories[0]
      : firstService.categories;

    if (!category) {
      return { ok: false, error: 'Catégorie du service introuvable.' };
    }

    const resolvedZones: ResolvedZone[] = [];

    for (const zone of zoneInputs) {
      const resolved = await resolveZone(supabase, zone);
      if ('error' in resolved) {
        return { ok: false, error: resolved.error };
      }
      resolvedZones.push(resolved);
    }

    const baseZone =
      resolvedZones.find((zone) => zone.quartier_id) ??
      resolvedZones.find((zone) => zone.arrondissement_id) ??
      resolvedZones.find((zone) => zone.departement_id) ??
      resolvedZones[0];

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

    const { data: provider, error } = await supabase
      .from('providers')
      .insert({
        nom: input.nom,
        metier: category.slug,
        metier_nom: category.nom_fr,
        specialite: input.specialite.trim() || firstService.nom_fr,
        quartier: baseZone.label.slice(0, 60),
        region_id: baseZone.region_id,
        departement_id: baseZone.departement_id,
        arrondissement_id: baseZone.arrondissement_id,
        quartier_id: baseZone.quartier_id,
        whatsapp: phone,
        photo_url: photoUrl,
        statut: 'en_attente',
        disponible: true,
        note_moyenne: 0,
        nombre_avis: 0,
        est_demo: false,
        type_aideur: category.family_slug === 'transport_livraison',
      })
      .select('id')
      .single();

    if (error || !provider?.id) {
      if (uploadedPath) {
        await supabase.storage.from('providers').remove([uploadedPath]);
      }
      console.error('[registerProvider:insert]', error?.message);
      return {
        ok: false,
        error:
          'L’inscription n’a pas pu être enregistrée. Réessayez dans un instant.',
      };
    }

    const providerId = provider.id as string;

    const { error: servicesInsertError } = await supabase
      .from('provider_services')
      .insert(
        services.map((service) => ({
          provider_id: providerId,
          subcategory_id: service.id,
        })),
      );

    const { error: zonesInsertError } = await supabase
      .from('provider_zones')
      .insert(
        resolvedZones.map((zone) => ({
          provider_id: providerId,
          scope: zone.scope,
          region_id: zone.region_id,
          departement_id: zone.departement_id,
          arrondissement_id: zone.arrondissement_id,
          quartier_id: zone.quartier_id,
        })),
      );

    if (servicesInsertError || zonesInsertError) {
      console.error(
        '[registerProvider:relations]',
        servicesInsertError?.message || zonesInsertError?.message,
      );
      await supabase.from('providers').delete().eq('id', providerId);
      if (uploadedPath) {
        await supabase.storage.from('providers').remove([uploadedPath]);
      }
      return {
        ok: false,
        error:
          'Les services ou zones n’ont pas pu être enregistrés. Réessayez.',
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
