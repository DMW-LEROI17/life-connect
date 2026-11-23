import { getSupabaseAdmin } from '@/lib/supabase/admin';
import type { PublicPersonRow } from '@/types/db';

const ROLE_FILTERS = [
  'particulier',
  'professionnel',
  'commercant',
  'entreprise',
] as const;

export async function listPeople(input: {
  q?: string;
  role?: string;
  city?: string;
}): Promise<PublicPersonRow[]> {
  try {
    const admin = getSupabaseAdmin();
    let query = admin
      .from('profiles')
      .select('id, full_name, role, bio, avatar_url, city, country, created_at')
      .eq('is_suspended', false)
      .in('role', [...ROLE_FILTERS])
      .order('created_at', { ascending: false })
      .limit(80);

    if (input.role && ROLE_FILTERS.includes(input.role as never)) {
      query = query.eq('role', input.role);
    }

    if (input.city) {
      query = query.ilike('city', `%${input.city}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[listPeople]', error.message);
      return [];
    }

    let rows = (data ?? []) as PublicPersonRow[];
    const q = input.q?.toLowerCase().trim();

    if (q) {
      rows = rows.filter((row) =>
        `${row.full_name} ${row.bio ?? ''} ${row.city ?? ''}`
          .toLowerCase()
          .includes(q),
      );
    }

    return rows;
  } catch (error) {
    console.error('[listPeople]', error);
    return [];
  }
}

export async function getPublicPerson(
  id: string,
): Promise<PublicPersonRow | null> {
  try {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from('profiles')
      .select('id, full_name, role, bio, avatar_url, city, country, created_at')
      .eq('id', id)
      .eq('is_suspended', false)
      .maybeSingle();

    if (error || !data) return null;
    return data as PublicPersonRow;
  } catch {
    return null;
  }
}
