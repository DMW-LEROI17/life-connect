import { isSupabaseAuthConfigured } from '@/lib/config';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { PostRow, ProposalRow } from '@/types/db';

export interface PostFilters {
  kind?: string;
  categoryId?: number;
  regionId?: number;
  q?: string;
}

export async function listPosts(filters: PostFilters = {}): Promise<PostRow[]> {
  if (!isSupabaseAuthConfigured()) return [];

  try {
    const supabase = createSupabaseServerClient();

    let query: any = supabase
      .from('posts')
      .select(
        'id, author_id, author_name, author_role, kind, title, description, category_id, region_id, city, quartier, budget, deadline, status, visibility, created_at, categories(nom_fr)',
      )
      .eq('status', 'ouverte')
      .eq('visibility', 'publique')
      .order('created_at', { ascending: false })
      .limit(60);

    if (filters.kind === 'besoin' || filters.kind === 'offre') {
      query = query.eq('kind', filters.kind);
    }

    if (filters.categoryId) {
      query = query.eq('category_id', filters.categoryId);
    }

    if (filters.regionId) {
      query = query.eq('region_id', filters.regionId);
    }

    if (filters.q) {
      const safe = filters.q.replace(/[%,()]/g, ' ').trim();
      if (safe) {
        query = query.or(
          `title.ilike.%${safe}%,description.ilike.%${safe}%,city.ilike.%${safe}%,quartier.ilike.%${safe}%`,
        );
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error('[listPosts]', error.message);
      return [];
    }

    return (data ?? []) as PostRow[];
  } catch (error) {
    console.error('[listPosts]', error);
    return [];
  }
}

export async function getPost(id: string): Promise<PostRow | null> {
  if (!isSupabaseAuthConfigured()) return null;

  try {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from('posts')
      .select(
        'id, author_id, author_name, author_role, kind, title, description, category_id, region_id, city, quartier, budget, deadline, status, visibility, created_at, categories(nom_fr)',
      )
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('[getPost]', error.message);
      return null;
    }

    return (data as PostRow | null) ?? null;
  } catch (error) {
    console.error('[getPost]', error);
    return null;
  }
}

export async function listProposals(postId: string): Promise<ProposalRow[]> {
  if (!isSupabaseAuthConfigured()) return [];

  try {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from('proposals')
      .select('id, post_id, author_id, author_name, message, price, status, created_at')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('[listProposals]', error.message);
      return [];
    }

    return (data ?? []) as ProposalRow[];
  } catch (error) {
    console.error('[listProposals]', error);
    return [];
  }
}
