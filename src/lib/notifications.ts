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
