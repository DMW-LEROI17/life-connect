'use server';

import { getCurrentUser } from '@/lib/auth-user';
import { ensureConversationBetweenUsers } from '@/lib/chat';
import { notifyUser } from '@/lib/notifications';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import type { ProfileRow } from '@/types/db';

export type DirectChatResult =
  | { ok: true; conversationId: string }
  | { ok: false; error: string };

export async function startConversationAction(
  targetUserId: string,
  title: string,
): Promise<DirectChatResult> {
  const current = await getCurrentUser();

  if (!current) {
    return { ok: false, error: 'Connectez-vous pour contacter ce membre.' };
  }

  if (!targetUserId || targetUserId === current.user.id) {
    return { ok: false, error: 'Destinataire invalide.' };
  }

  const cleanTitle = title.trim().slice(0, 120) || 'Prise de contact';

  try {
    const admin = getSupabaseAdmin();
    const { data: target } = await admin
      .from('profiles')
      .select('*')
      .eq('id', targetUserId)
      .maybeSingle();

    if (!target) {
      return { ok: false, error: 'Ce membre est introuvable.' };
    }

    const conversationId = await ensureConversationBetweenUsers({
      client: current.profile,
      provider: target as ProfileRow,
      title: cleanTitle,
    });

    if (!conversationId) {
      return { ok: false, error: 'La conversation n’a pas pu être ouverte.' };
    }

    await notifyUser({
      userId: targetUserId,
      type: 'message',
      title: 'Nouveau contact',
      body: `${current.profile.full_name || 'Un membre'} souhaite vous contacter : ${cleanTitle}`,
      link: `/messages/${conversationId}`,
    });

    return { ok: true, conversationId };
  } catch (error) {
    console.error('[startConversationAction]', error);
    return { ok: false, error: 'Le service est momentanément indisponible.' };
  }
}
