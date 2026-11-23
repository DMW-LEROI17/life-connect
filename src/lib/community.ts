import { createSupabaseServerClient } from '@/lib/supabase/server';
import type {
  CommunityGroupRow,
  ExchangeListingRow,
  GroupPostRow,
} from '@/types/db';

export async function listGroups(input: {
  q?: string;
  city?: string;
}): Promise<CommunityGroupRow[]> {
  try {
    const supabase = createSupabaseServerClient();
    let query = supabase
      .from('groups')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(60);

    if (input.city) query = query.ilike('city', `%${input.city}%`);

    const { data, error } = await query;

    if (error) {
      console.error('[listGroups]', error.message);
      return [];
    }

    let rows = (data ?? []) as CommunityGroupRow[];
    const q = input.q?.toLowerCase().trim();

    if (q) {
      rows = rows.filter((row) =>
        `${row.name} ${row.description ?? ''} ${row.city ?? ''}`
          .toLowerCase()
          .includes(q),
      );
    }

    return rows;
  } catch {
    return [];
  }
}

export async function getGroupBySlug(slug: string): Promise<{
  group: CommunityGroupRow;
  posts: GroupPostRow[];
  isMember: boolean;
} | null> {
  try {
    const supabase = createSupabaseServerClient();
    const { data: group, error } = await supabase
      .from('groups')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (error || !group) return null;

    const { data: posts } = await supabase
      .from('group_posts')
      .select('*')
      .eq('group_id', group.id)
      .order('created_at', { ascending: false })
      .limit(50);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    let isMember = false;

    if (user) {
      const { data: membership } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('group_id', group.id)
        .eq('user_id', user.id)
        .maybeSingle();

      isMember = Boolean(membership);
    }

    return {
      group: group as CommunityGroupRow,
      posts: (posts ?? []) as GroupPostRow[],
      isMember,
    };
  } catch {
    return null;
  }
}

export async function listExchange(input: {
  q?: string;
  kind?: string;
}): Promise<ExchangeListingRow[]> {
  try {
    const supabase = createSupabaseServerClient();
    let query = supabase
      .from('exchange_listings')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(60);

    if (input.kind === 'offre' || input.kind === 'recherche') {
      query = query.eq('kind', input.kind);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[listExchange]', error.message);
      return [];
    }

    let rows = (data ?? []) as ExchangeListingRow[];
    const q = input.q?.toLowerCase().trim();

    if (q) {
      rows = rows.filter((row) =>
        `${row.title} ${row.description} ${row.skill ?? ''} ${row.city ?? ''}`
          .toLowerCase()
          .includes(q),
      );
    }

    return rows;
  } catch {
    return [];
  }
}
