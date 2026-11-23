'use server';

import { revalidatePath } from 'next/cache';

import { getCurrentUser } from '@/lib/auth-user';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function markAllNotificationsReadAction(): Promise<void> {
  const current = await getCurrentUser();
  if (!current) return;

  try {
    const supabase = createSupabaseServerClient();
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', current.user.id)
      .eq('is_read', false);
  } catch (error) {
    console.error('[markAllNotificationsReadAction]', error);
  }

  revalidatePath('/notifications');
}
