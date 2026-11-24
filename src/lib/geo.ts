import { isSupabaseConfigured } from '@/lib/config';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import type {
  ArrondissementNode,
  DepartementNode,
  GeoTree,
  QuartierNode,
  RegionNode,
  RegionRow,
} from '@/types/db';

type RegionDb = { id: number; nom: string; slug: string; chef_lieu: string | null };
type DepartementDb = { id: number; region_id: number; nom: string };
type ArrondissementDb = { id: number; departement_id: number; nom: string };
type QuartierDb = { id: number; arrondissement_id: number; nom: string };

export async function getRegions(): Promise<RegionRow[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('regions')
      .select('id, nom, slug, chef_lieu')
      .order('nom', { ascending: true });

    if (error) {
      console.error('[getRegions]', error.message);
      return [];
    }

    return (data ?? []) as RegionRow[];
  } catch (error) {
    console.error('[getRegions]', error);
    return [];
  }
}

export async function getGeoTree(): Promise<GeoTree> {
  if (!isSupabaseConfigured()) return [];

  try {
    const supabase = getSupabaseAdmin();

    const [regionsResult, departementsResult, arrondissementsResult, quartiersResult] =
      await Promise.all([
        supabase.from('regions').select('id, nom, slug, chef_lieu').order('nom', { ascending: true }),
        supabase.from('departements').select('id, region_id, nom').order('nom', { ascending: true }),
        supabase.from('arrondissements').select('id, departement_id, nom').order('nom', { ascending: true }),
        supabase.from('quartiers').select('id, arrondissement_id, nom').order('nom', { ascending: true }),
      ]);

    if (regionsResult.error || departementsResult.error) {
      console.error(
        '[getGeoTree]',
        regionsResult.error?.message || departementsResult.error?.message,
      );
      return [];
    }

    if (arrondissementsResult.error) {
      console.error('[getGeoTree:arrondissements]', arrondissementsResult.error.message);
    }

    if (quartiersResult.error) {
      console.error('[getGeoTree:quartiers]', quartiersResult.error.message);
    }

    const regions = (regionsResult.data ?? []) as RegionDb[];
    const departements = (departementsResult.data ?? []) as DepartementDb[];
    const arrondissements = (arrondissementsResult.data ?? []) as ArrondissementDb[];
    const quartiers = (quartiersResult.data ?? []) as QuartierDb[];

    const quartiersByArrondissement = new Map<number, QuartierNode[]>();
    for (const quartier of quartiers) {
      const list = quartiersByArrondissement.get(quartier.arrondissement_id) ?? [];
      list.push({ id: quartier.id, nom: quartier.nom });
      quartiersByArrondissement.set(quartier.arrondissement_id, list);
    }

    const arrondissementsByDepartement = new Map<number, ArrondissementNode[]>();
    for (const arrondissement of arrondissements) {
      const list = arrondissementsByDepartement.get(arrondissement.departement_id) ?? [];
      list.push({
        id: arrondissement.id,
        nom: arrondissement.nom,
        quartiers: quartiersByArrondissement.get(arrondissement.id) ?? [],
      });
      arrondissementsByDepartement.set(arrondissement.departement_id, list);
    }

    const departementsByRegion = new Map<number, DepartementNode[]>();
    for (const departement of departements) {
      const list = departementsByRegion.get(departement.region_id) ?? [];
      list.push({
        id: departement.id,
        nom: departement.nom,
        arrondissements: arrondissementsByDepartement.get(departement.id) ?? [],
      });
      departementsByRegion.set(departement.region_id, list);
    }

    return regions.map<RegionNode>((region) => ({
      id: region.id,
      nom: region.nom,
      slug: region.slug,
      departements: departementsByRegion.get(region.id) ?? [],
    }));
  } catch (error) {
    console.error('[getGeoTree]', error);
    return [];
  }
}
