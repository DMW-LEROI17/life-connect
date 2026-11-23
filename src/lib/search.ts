import { getSupabaseAdmin } from '@/lib/supabase/admin';

export interface ProviderSearchResult {
  id: string;
  nom: string;
  metier: string;
  metier_nom: string | null;
  specialite: string | null;
  quartier: string;
  note_moyenne: number;
  nombre_avis: number;
  photo_url: string | null;
  disponible: boolean;
}

export async function searchProviders(input: {
  categorySlugs: string[];
  regionId: number | null;
  keywords: string[];
}): Promise<ProviderSearchResult[]> {
  try {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('providers')
      .select(
        'id, nom, metier, metier_nom, specialite, quartier, region_id, note_moyenne, nombre_avis, photo_url, disponible',
      )
      .eq('statut', 'valide')
      .limit(200);

    if (error) {
      // Base V1 : la colonne region_id / metier_nom n'existe pas.
      const fallback = await supabase
        .from('providers')
        .select('*')
        .eq('statut', 'valide')
        .limit(200);

      if (fallback.error || !fallback.data) return [];

      return filterProviders(
        fallback.data as Record<string, unknown>[],
        input,
      );
    }

    return filterProviders(
      (data ?? []) as Record<string, unknown>[],
      input,
    );
  } catch (error) {
    console.error('[searchProviders]', error);
    return [];
  }
}

function filterProviders(
  rows: Record<string, unknown>[],
  input: {
    categorySlugs: string[];
    regionId: number | null;
    keywords: string[];
  },
): ProviderSearchResult[] {
  const categories = new Set(input.categorySlugs);

  const candidates = rows.filter((row) => {
    if (
      input.regionId &&
      typeof row.region_id === 'number' &&
      row.region_id !== input.regionId
    ) {
      return false;
    }
    return true;
  });

  return candidates
    .map<ProviderSearchResult>((row) => ({
      id: String(row.id),
      nom: String(row.nom),
      metier: String(row.metier),
      metier_nom: (row.metier_nom as string | null) ?? null,
      specialite: (row.specialite as string | null) ?? null,
      quartier: String(row.quartier ?? ''),
      note_moyenne: Number(row.note_moyenne ?? 0),
      nombre_avis: Number(row.nombre_avis ?? 0),
      photo_url: (row.photo_url as string | null) ?? null,
      disponible: Boolean(row.disponible),
    }))
    .filter((provider) => {
      if (categories.size > 0 && !categories.has(provider.metier)) {
        return false;
      }

      if (input.keywords.length > 0) {
        const haystack = `${provider.nom} ${provider.specialite ?? ''} ${
          provider.quartier
        } ${provider.metier_nom ?? ''}`.toLowerCase();

        if (
          !input.keywords.some((keyword) =>
            haystack.includes(keyword.toLowerCase()),
          )
        ) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      if (a.disponible !== b.disponible) return a.disponible ? -1 : 1;
      return b.note_moyenne - a.note_moyenne;
    })
    .slice(0, 12);
}

