import { isSupabaseConfigured } from '@/lib/config';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import type { EmergencyFacility, EmergencyGuide } from '@/types/db';

export async function getEmergencyGuides(): Promise<EmergencyGuide[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('emergency_guides')
      .select('slug, title, summary, icon, do_steps, dont_steps, warning, sort_order')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('[getEmergencyGuides]', error.message);
      return [];
    }

    return (data ?? []) as EmergencyGuide[];
  } catch (error) {
    console.error('[getEmergencyGuides]', error);
    return [];
  }
}

export async function getEmergencyGuide(
  slug: string,
): Promise<EmergencyGuide | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('emergency_guides')
      .select('slug, title, summary, icon, do_steps, dont_steps, warning, sort_order')
      .eq('slug', slug)
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      console.error('[getEmergencyGuide]', error.message);
      return null;
    }

    return (data as EmergencyGuide | null) ?? null;
  } catch (error) {
    console.error('[getEmergencyGuide]', error);
    return null;
  }
}

export async function getEmergencyFacilities(
  regionId?: number,
): Promise<EmergencyFacility[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const supabase = getSupabaseAdmin();

    let query = supabase
      .from('emergency_facilities')
      .select(
        'id, nom, type, region_id, region_nom, departement_nom, ville, adresse, telephone, telephone_alt, latitude, longitude, horaires, is_verified, source',
      )
      .order('ville', { ascending: true })
      .order('type', { ascending: true })
      .order('nom', { ascending: true })
      .limit(200);

    if (regionId) {
      query = query.eq('region_id', regionId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[getEmergencyFacilities]', error.message);
      return [];
    }

    return (data ?? []) as EmergencyFacility[];
  } catch (error) {
    console.error('[getEmergencyFacilities]', error);
    return [];
  }
}
