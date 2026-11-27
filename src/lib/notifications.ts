import { getSupabaseAdmin } from '@/lib/supabase/admin';

export type NotificationType = 'message' | 'demande' | 'paiement' | 'systeme' | 'sos';

export async function notifyUser(input: {
  userId: string;
  type: NotificationType;
  title: string;
  body?: string;
  link?: string;
}) {
  try {
    const admin = getSupabaseAdmin();
    await admin.from('notifications').insert({
      user_id: input.userId,
      type: input.type,
      title: input.title,
      body: input.body ?? null,
      link: input.link ?? null,
    });
  } catch (error) {
    console.error('[notifyUser]', error);
  }
}

export async function notifyAdmins(input: {
  type: NotificationType;
  title: string;
  body?: string;
  link?: string;
}) {
  try {
    const admin = getSupabaseAdmin();
    const { data } = await admin
      .from('profiles')
      .select('id')
      .in('role', ['admin', 'moderateur']);

    for (const profile of data ?? []) {
      await notifyUser({ ...input, userId: String(profile.id) });
    }
  } catch (error) {
    console.error('[notifyAdmins]', error);
  }
}
