import { isSupabaseConfigured } from '@/lib/config';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import type {
  AdminRegionStats,
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

  function build(select: string) {
    // Le constructeur de requêtes Supabase a des génériques très complexes :
    // on le laisse en any ici, la validation des entrées est faite plus bas.
    let query: any = supabase
      .from('requests')
      .select(select)
      .order('cree_le', { ascending: false })
      .limit(200);

    if (
      filters.statut &&
      REQUEST_STATUSES.includes(filters.statut as RequestStatus)
    ) {
      query = query.eq('statut', filters.statut);
    }

    if (
      filters.categorie &&
      filters.categorie.trim().length > 0 &&
      filters.categorie.length <= 80
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

    return query;
  }

  const newColumns =
    'id, token, client_name, categorie, categorie_nom, probleme, quartier, region_nom, tel_client, statut, is_emergency, cree_le, assigne_le, providers(nom)';
  const legacyColumns =
    'id, token, categorie, probleme, quartier, tel_client, statut, cree_le, assigne_le, providers(nom)';

  let { data, error } = await build(newColumns);

  // Base encore en V1 : les colonnes V2 n'existent pas.
  if (error) {
    const fallback = await build(legacyColumns);
    data = fallback.data;
    error = fallback.error;
  }

  if (error) {
    console.error('[listAdminRequests]', error.message);
    return [];
  }

  return ((data ?? []) as Record<string, unknown>[]).map((row) => ({
    id: String(row.id),
    token: String(row.token),
    client_name: (row.client_name as string | null) ?? null,
    categorie: String(row.categorie),
    categorie_nom: (row.categorie_nom as string | null) ?? null,
    probleme: String(row.probleme),
    quartier: String(row.quartier),
    region_nom: (row.region_nom as string | null) ?? null,
    tel_client: String(row.tel_client),
    statut: row.statut as RequestStatus,
    is_emergency: Boolean(row.is_emergency),
    cree_le: String(row.cree_le),
    assigne_le: (row.assigne_le as string | null) ?? null,
    providers:
      (row.providers as { nom: string } | null | undefined) ?? null,
  }));
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

export async function getAdminRegionStats(): Promise<AdminRegionStats[]> {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.rpc('admin_stats_by_region');

    if (error) {
      console.error('[admin_stats_by_region]', error.message);
      return [];
    }

    return (data ?? []) as AdminRegionStats[];
  } catch (error) {
    console.error('[getAdminRegionStats]', error);
    return [];
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

export async function getProvidersForRequest(
  requestId: string,
): Promise<NearbyProvider[]> {
  if (!isUuid(requestId)) return [];

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.rpc('providers_for_request', {
      p_request_id: requestId,
    });

    if (!error) {
      return (data ?? []) as NearbyProvider[];
    }

    // Base encore en V1 : on retombe sur l'ancienne logique par métier.
    const { data: request } = await supabase
      .from('requests')
      .select('categorie')
      .eq('id', requestId)
      .maybeSingle();

    if (!request?.categorie) return [];

    const { data: providers, error: providersError } = await supabase
      .from('providers')
      .select('*')
      .eq('statut', 'valide')
      .eq('metier', request.categorie)
      .order('disponible', { ascending: false })
      .order('note_moyenne', { ascending: false })
      .limit(30);

    if (providersError || !providers) {
      console.error('[getProvidersForRequest]', providersError?.message);
      return [];
    }

    return (providers as Record<string, unknown>[]).map((provider) => ({
      id: String(provider.id),
      nom: String(provider.nom),
      metier: String(provider.metier),
      metier_nom: (provider.metier_nom as string | null) ?? null,
      specialite: (provider.specialite as string | null) ?? null,
      quartier: String(provider.quartier ?? ''),
      quartier_id: (provider.quartier_id as number | null) ?? null,
      zone_score: 0,
      distance_km: null,
      note_moyenne: Number(provider.note_moyenne ?? 0),
      nombre_avis: Number(provider.nombre_avis ?? 0),
      photo_url: (provider.photo_url as string | null) ?? null,
      whatsapp: String(provider.whatsapp ?? ''),
      disponible: Boolean(provider.disponible),
    }));
  } catch (error) {
    console.error('[getProvidersForRequest]', error);
    return [];
  }
}
