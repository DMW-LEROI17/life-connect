import { isDemoText } from '@/lib/demo';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { MarketListingRow } from '@/types/db';

export async function listMarketListings(input: {
  q?: string;
  city?: string;
  condition?: string;
}): Promise<MarketListingRow[]> {
  try {
    const supabase = createSupabaseServerClient();
    let query = supabase
      .from('market_listings')
      .select('*, categories(nom_fr)')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(60);

    if (input.city) query = query.ilike('city', `%${input.city}%`);
    if (input.condition) query = query.eq('condition', input.condition);

    const { data, error } = await query;

    if (error) {
      console.error('[listMarketListings]', error.message);
      return [];
    }

    let rows = (data ?? []) as MarketListingRow[];
    rows = rows.filter(
      (row) => !isDemoText(row.seller_name) && !isDemoText(row.title),
    );
    const q = input.q?.toLowerCase().trim();

    if (q) {
      rows = rows.filter((row) =>
        `${row.title} ${row.description} ${row.city ?? ''} ${
          row.quartier ?? ''
        }`
          .toLowerCase()
          .includes(q),
      );
    }

    return rows;
  } catch (error) {
    console.error('[listMarketListings]', error);
    return [];
  }
}

export async function getMarketListing(
  id: string,
): Promise<MarketListingRow | null> {
  try {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from('market_listings')
      .select('*, categories(nom_fr)')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) return null;
    return data as MarketListingRow;
  } catch {
    return null;
  }
}
