import { isSupabaseConfigured } from '@/lib/config';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import type {
  AdminStats,
  NearbyProvider,
  ProviderRow,
  ProviderStatus,
  RequestDetailRow,
  RequestListRow,
  RequestLookup,
  RequestStatus,
} from '@/types/db';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}

const REQUEST_STATUSES: RequestStatus[] = [
  'nouvelle',
  'en_recherche',
  'assignee',
  'resolue',
  'annulee',
  'expiree',
];

const PROVIDER_STATUSES: ProviderStatus[] = [
  'en_attente',
  'valide',
  'refuse',
  'suspendu',
];

export async function getRequestByToken(
  token: string,
): Promise<RequestLookup> {
  if (!isUuid(token)) {
    return { ok: false, error: 'not_found' };
  }

  if (!isSupabaseConfigured()) {
    return { ok: false, error: 'not_configured' };
  }

  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase.rpc('get_request_by_token', {
    p_token: token,
  });

  if (error) {
    console.error('[get_request_by_token]', error.message);
    return { ok: false, error: 'server' };
  }

  return data as RequestLookup;
}

export interface RequestFilters {
  statut?: string;
  categorie?: string;
  q?: string;
}

export async function listAdminRequests(
  filters: RequestFilters = {},
): Promise<RequestListRow[]> {
  const supabase = getSupabaseAdmin();

  // Le constructeur de requêtes Supabase a des génériques très complexes :
  // on le laisse en any ici, la validation des entrées est faite plus bas.
  let query: any = supabase
    .from('requests')
    .select(
      'id, token, categorie, probleme, quartier, tel_client, statut, cree_le, assigne_le, providers(nom)',
    )
    .order('cree_le', { ascending: false })
    .limit(200);

  if (filters.statut && REQUEST_STATUSES.includes(filters.statut as RequestStatus)) {
    query = query.eq('statut', filters.statut);
  }

  if (
    filters.categorie &&
    ['mecanicien', 'depanneur', 'technicien'].includes(filters.categorie)
  ) {
    query = query.eq('categorie', filters.categorie);
  }

  if (filters.q) {
    const safe = filters.q.replace(/[%,()]/g, ' ').trim();
    if (safe) {
      query = query.or(
        `tel_client.ilike.%${safe}%,quartier.ilike.%${safe}%,probleme.ilike.%${safe}%`,
      );
    }
  }

  const { data, error } = await query;

  if (error) {
    console.error('[listAdminRequests]', error.message);
    return [];
  }

  return (data ?? []) as RequestListRow[];
}

export async function getAdminStats(): Promise<AdminStats> {
  const empty: AdminStats = {
    total_30j: 0,
    aujourdhui: 0,
    en_attente: 0,
    temps_reponse_moyen_sec: null,
    pourcentage_resolu: 0,
    note_moyenne: null,
  };

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.rpc('admin_stats');

    if (error || !data) {
      if (error) console.error('[admin_stats]', error.message);
      return empty;
    }

    const raw = data as Record<string, unknown>;

    return {
      total_30j: Number(raw.total_30j ?? 0),
      aujourdhui: Number(raw.aujourdhui ?? 0),
      en_attente: Number(raw.en_attente ?? 0),
      temps_reponse_moyen_sec:
        raw.temps_reponse_moyen_sec == null
          ? null
          : Number(raw.temps_reponse_moyen_sec),
      pourcentage_resolu: Number(raw.pourcentage_resolu ?? 0),
      note_moyenne:
        raw.note_moyenne == null ? null : Number(raw.note_moyenne),
    };
  } catch (error) {
    console.error('[getAdminStats]', error);
    return empty;
  }
}

export async function getAdminProviders(
  statut?: string,
): Promise<ProviderRow[]> {
  const supabase = getSupabaseAdmin();

  let query = supabase
    .from('providers')
    .select('*')
    .order('cree_le', { ascending: false })
    .limit(300);

  if (statut && PROVIDER_STATUSES.includes(statut as ProviderStatus)) {
    query = query.eq('statut', statut);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[getAdminProviders]', error.message);
    return [];
  }

  return (data ?? []) as ProviderRow[];
}

export async function getPendingProviderCount(): Promise<number> {
  try {
    const supabase = getSupabaseAdmin();
    const { count, error } = await supabase
      .from('providers')
      .select('id', { count: 'exact', head: true })
      .eq('statut', 'en_attente');

    if (error) return 0;
    return count ?? 0;
  } catch {
    return 0;
  }
}

export async function getRequestDetail(
  id: string,
): Promise<RequestDetailRow | null> {
  if (!isUuid(id)) return null;

  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('requests')
    .select('*, providers(*), ratings(etoiles, resolu, commentaire, cree_le)')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('[getRequestDetail]', error.message);
    return null;
  }

  return (data as RequestDetailRow | null) ?? null;
}

export async function getNearbyForRequest(
  request: Pick<RequestDetailRow, 'categorie' | 'latitude' | 'longitude'>,
): Promise<NearbyProvider[]> {
  const supabase = getSupabaseAdmin();

  if (request.latitude == null || request.longitude == null) {
    const { data, error } = await supabase
      .from('providers')
      .select(
        'id, nom, metier, specialite, quartier, note_moyenne, nombre_avis, photo_url, whatsapp, disponible',
      )
      .eq('metier', request.categorie)
      .eq('statut', 'valide')
      .order('disponible', { ascending: false })
      .order('note_moyenne', { ascending: false })
      .limit(20);

    if (error) {
      console.error('[getNearbyForRequest:fallback]', error.message);
      return [];
    }

    return ((data ?? []) as Omit<NearbyProvider, 'distance_km'>[]).map(
      (provider) => ({ ...provider, distance_km: null }),
    );
  }

  const { data, error } = await supabase.rpc('nearby_providers', {
    p_lat: request.latitude,
    p_lng: request.longitude,
    p_categorie: request.categorie,
    p_limit: 20,
  });

  if (error) {
    console.error('[nearby_providers]', error.message);
    return [];
  }

  return (data ?? []) as NearbyProvider[];
}
