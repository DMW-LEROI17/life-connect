import { getSupabaseAdmin } from '@/lib/supabase/admin';

export interface CreateRequestRecordInput {
  categorie: string;
  sousCategorieId?: number | null;
  probleme: string;
  description: string;
  telClient: string;
  regionId?: number | null;
  departementId?: number | null;
  arrondissementId?: number | null;
  quartierId?: number | null;
  quartierLibre?: string;
  latitude?: number | null;
  longitude?: number | null;
  isEmergency?: boolean;
  emergencyType?: string | null;
  needsTransport?: boolean;
}

export type CreateRecordResult =
  | { ok: true; token: string }
  | { ok: false; error: string };

type RegionDb = { id: number; nom: string; chef_lieu: string | null };
type DepartementDb = { id: number; nom: string; region_id: number };
type ArrondissementDb = { id: number; nom: string; departement_id: number };
type QuartierDb = { id: number; nom: string; arrondissement_id: number };

interface ResolvedLocation {
  region: RegionDb;
  departement: DepartementDb | null;
  arrondissement: ArrondissementDb | null;
  quartier: QuartierDb | null;
  label: string;
}

async function resolveLocation(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  input: CreateRequestRecordInput,
): Promise<ResolvedLocation | { error: string }> {
  let region: RegionDb | null = null;
  let departement: DepartementDb | null = null;
  let arrondissement: ArrondissementDb | null = null;
  let quartier: QuartierDb | null = null;

  if (input.quartierId) {
    const { data } = await supabase
      .from('quartiers')
      .select('id, nom, arrondissement_id')
      .eq('id', input.quartierId)
      .maybeSingle();

    if (!data) return { error: 'Quartier introuvable.' };
    quartier = data as QuartierDb;

    const { data: arrData } = await supabase
      .from('arrondissements')
      .select('id, nom, departement_id')
      .eq('id', quartier.arrondissement_id)
      .maybeSingle();

    if (!arrData) return { error: 'Commune introuvable.' };
    arrondissement = arrData as ArrondissementDb;

    const { data: depData } = await supabase
      .from('departements')
      .select('id, nom, region_id')
      .eq('id', arrondissement.departement_id)
      .maybeSingle();

    if (!depData) return { error: 'Département introuvable.' };
    departement = depData as DepartementDb;
  } else if (input.arrondissementId) {
    const { data: arrData } = await supabase
      .from('arrondissements')
      .select('id, nom, departement_id')
      .eq('id', input.arrondissementId)
      .maybeSingle();

    if (!arrData) return { error: 'Commune introuvable.' };
    arrondissement = arrData as ArrondissementDb;

    const { data: depData } = await supabase
      .from('departements')
      .select('id, nom, region_id')
      .eq('id', arrondissement.departement_id)
      .maybeSingle();

    if (!depData) return { error: 'Département introuvable.' };
    departement = depData as DepartementDb;
  } else if (input.departementId) {
    const { data: depData } = await supabase
      .from('departements')
      .select('id, nom, region_id')
      .eq('id', input.departementId)
      .maybeSingle();

    if (!depData) return { error: 'Département introuvable.' };
    departement = depData as DepartementDb;
  }

  const regionId = departement?.region_id ?? input.regionId;

  if (!regionId) {
    return { error: 'Choisissez votre région.' };
  }

  const { data: regionData } = await supabase
    .from('regions')
    .select('id, nom, chef_lieu')
    .eq('id', regionId)
    .maybeSingle();

  if (!regionData) return { error: 'Région introuvable.' };
  region = regionData as RegionDb;

  if (departement && departement.region_id !== region.id) {
    return { error: 'La zone choisie est incohérente.' };
  }

  const label =
    quartier?.nom ||
    input.quartierLibre?.trim() ||
    arrondissement?.nom ||
    departement?.nom ||
    region.nom;

  if (!label || label.length < 2) {
    return { error: 'Indiquez votre quartier ou un repère connu.' };
  }

  return { region, departement, arrondissement, quartier, label };
}

export async function createRequestRecord(
  input: CreateRequestRecordInput,
): Promise<CreateRecordResult> {
  try {
    const supabase = getSupabaseAdmin();

    // Base encore en V1 (migration 05 à 10 non exécutée) : on garde HELP ME
    // fonctionnel avec les 3 catégories historiques.
    const probe = await supabase
      .from('regions')
      .select('id', { head: true, count: 'exact' })
      .limit(1);

    if (probe.error) {
      if (!['mecanicien', 'depanneur', 'technicien'].includes(input.categorie)) {
        return {
          ok: false,
          error:
            'Cette catégorie nécessite la migration nationale (scripts SQL V2).',
        };
      }

      const quartier = (input.quartierLibre || '').trim();

      if (quartier.length < 2) {
        return {
          ok: false,
          error: 'Indiquez votre quartier ou un repère connu.',
        };
      }

      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

      const { count } = await supabase
        .from('requests')
        .select('id', { count: 'exact', head: true })
        .eq('tel_client', input.telClient)
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
          probleme: input.probleme.trim().slice(0, 120),
          description: input.description.trim() || null,
          tel_client: input.telClient,
          quartier: quartier.slice(0, 60),
          latitude: input.latitude ?? null,
          longitude: input.longitude ?? null,
          statut: 'nouvelle',
        })
        .select('token')
        .single();

      if (error || !data?.token) {
        console.error('[createRequestRecord:legacy]', error?.message);
        return {
          ok: false,
          error:
            'La demande n’a pas pu être enregistrée. Réessayez dans un instant.',
        };
      }

      return { ok: true, token: data.token as string };
    }

    if (!input.regionId) {
      return { ok: false, error: 'Choisissez votre région.' };
    }

    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .select('id, slug, nom_fr, is_emergency')
      .eq('slug', input.categorie)
      .eq('is_active', true)
      .maybeSingle();

    if (categoryError || !category) {
      return { ok: false, error: 'Catégorie introuvable ou désactivée.' };
    }

    let subcategory: { id: number; nom_fr: string; category_id: number } | null =
      null;

    if (input.sousCategorieId) {
      const { data } = await supabase
        .from('subcategories')
        .select('id, nom_fr, category_id')
        .eq('id', input.sousCategorieId)
        .eq('is_active', true)
        .maybeSingle();

      if (!data || data.category_id !== category.id) {
        return { ok: false, error: 'Ce problème ne correspond pas à la catégorie.' };
      }

      subcategory = data;
    }

    const location = await resolveLocation(supabase, input);

    if ('error' in location) {
      return { ok: false, error: location.error };
    }

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    const { count } = await supabase
      .from('requests')
      .select('id', { count: 'exact', head: true })
      .eq('tel_client', input.telClient)
      .gte('cree_le', oneHourAgo);

    if ((count ?? 0) >= 3) {
      return {
        ok: false,
        error:
          'Vous avez déjà envoyé 3 demandes cette heure-ci. Réessayez plus tard ou écrivez-nous sur WhatsApp.',
      };
    }

    const probleme = subcategory?.nom_fr || input.probleme.trim();

    if (probleme.length < 2) {
      return { ok: false, error: 'Choisissez un problème.' };
    }

    const { data, error } = await supabase
      .from('requests')
      .insert({
        ville: location.arrondissement?.nom || location.departement?.nom || location.region.nom,
        categorie: category.slug,
        categorie_nom: category.nom_fr,
        sous_categorie_id: subcategory?.id ?? null,
        probleme: probleme.slice(0, 160),
        description: input.description.trim() || null,
        tel_client: input.telClient,
        region_id: location.region.id,
        region_nom: location.region.nom,
        departement_id: location.departement?.id ?? null,
        departement_nom: location.departement?.nom ?? null,
        arrondissement_id: location.arrondissement?.id ?? null,
        arrondissement_nom: location.arrondissement?.nom ?? null,
        quartier_id: location.quartier?.id ?? null,
        quartier: location.label.slice(0, 80),
        latitude: input.latitude ?? null,
        longitude: input.longitude ?? null,
        statut: 'nouvelle',
        is_emergency: Boolean(input.isEmergency || category.is_emergency),
        emergency_type: input.emergencyType ?? null,
        needs_transport: Boolean(input.needsTransport),
      })
      .select('token')
      .single();

    if (error || !data?.token) {
      console.error('[createRequestRecord]', error?.message);
      return {
        ok: false,
        error:
          'La demande n’a pas pu être enregistrée. Réessayez dans un instant.',
      };
    }

    return { ok: true, token: data.token as string };
  } catch (error) {
    console.error('[createRequestRecord]', error);
    return {
      ok: false,
      error: 'Le service est momentanément indisponible. Réessayez dans un instant.',
    };
  }
}
