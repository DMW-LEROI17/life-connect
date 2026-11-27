import { isDemoText } from '@/lib/demo';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { OpportunityRow } from '@/types/db';

export async function listOpportunities(input: {
  q?: string;
  kind?: string;
  city?: string;
  regionId?: number | null;
  departementId?: number | null;
  arrondissementId?: number | null;
}): Promise<OpportunityRow[]> {
  try {
    const supabase = createSupabaseServerClient();
    let query = supabase
      .from('opportunities')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(60);

    if (input.kind) query = query.eq('kind', input.kind);
    if (input.city) query = query.ilike('city', `%${input.city}%`);
    if (input.regionId) query = query.eq('region_id', input.regionId);
    if (input.departementId) query = query.eq('departement_id', input.departementId);
    if (input.arrondissementId) {
      query = query.eq('arrondissement_id', input.arrondissementId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[listOpportunities]', error.message);
      return [];
    }

    let rows = (data ?? []) as OpportunityRow[];
    rows = rows.filter((row) => !isDemoText(row.title));
    const q = input.q?.toLowerCase().trim();

    if (q) {
      rows = rows.filter((row) =>
        `${row.title} ${row.description} ${row.city ?? ''}`
          .toLowerCase()
          .includes(q),
      );
    }

    return rows;
  } catch {
    return [];
  }
}
