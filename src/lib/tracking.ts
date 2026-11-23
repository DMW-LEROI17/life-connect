import { getSupabaseAdmin } from '@/lib/supabase/admin';
import type { MissionData, RequestTracking } from '@/types/db';

export async function getRequestTracking(
  token: string,
): Promise<RequestTracking> {
  try {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin.rpc('get_request_tracking', {
      p_token: token,
    });

    if (error) {
      console.error('[getRequestTracking]', error.message);
      return { ok: false, error: 'server' };
    }

    return data as RequestTracking;
  } catch (error) {
    console.error('[getRequestTracking]', error);
    return { ok: false, error: 'server' };
  }
}

export async function getMissionByToken(token: string): Promise<MissionData> {
  try {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin.rpc('get_mission_by_token', {
      p_token: token,
    });

    if (error) {
      console.error('[getMissionByToken]', error.message);
      return { ok: false, error: 'server' };
    }

    return data as MissionData;
  } catch (error) {
    console.error('[getMissionByToken]', error);
    return { ok: false, error: 'server' };
  }
}
