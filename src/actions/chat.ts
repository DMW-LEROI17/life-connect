'use server';

import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';

import { getCurrentUser } from '@/lib/auth-user';
import { notifyUser } from '@/lib/notifications';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export type ChatActionResult =
  | { ok: true; message?: string }
  | { ok: false; error: string };

async function loadConversation(conversationId: string) {
  const current = await getCurrentUser();
  if (!current) return { error: 'Connectez-vous.' as const };

  const supabase = createSupabaseServerClient();
  const { data: conversation } = await supabase
    .from('conversations')
    .select('*')
    .eq('id', conversationId)
    .maybeSingle();

  if (!conversation) {
    return { error: 'Conversation introuvable.' as const };
  }

  if (
    conversation.client_id !== current.user.id &&
    conversation.provider_id !== current.user.id
  ) {
    return { error: 'Conversation non autorisée.' as const };
  }

  return { current, conversation, supabase };
}

export async function sendMessageAction(
  conversationId: string,
  formData: FormData,
): Promise<ChatActionResult> {
  const loaded = await loadConversation(conversationId);
  if ('error' in loaded) return { ok: false, error: loaded.error ?? 'Conversation introuvable.' };

  const { current, conversation, supabase } = loaded;
  const body = String(formData.get('body') ?? '').trim();
  const file = formData.get('image');
  const hasImage = file instanceof File && file.size > 0;

  if (!body && !hasImage) {
    return { ok: false, error: 'Écrivez un message ou joignez une image.' };
  }

  if (body.length > 2000) {
    return { ok: false, error: 'Message trop long (2000 caractères max).' };
  }

  try {
    let attachmentUrl: string | null = null;

    if (hasImage) {
      const image = file as File;

      if (image.size > 2 * 1024 * 1024) {
        return { ok: false, error: 'Image trop lourde (2 Mo max).' };
      }

      if (!['image/jpeg', 'image/png', 'image/webp'].includes(image.type)) {
        return { ok: false, error: 'Format image non accepté.' };
      }

      const extension = image.type.split('/')[1] ?? 'jpg';
      const path = `${conversationId}/${randomUUID()}.${extension}`;
      const buffer = Buffer.from(await image.arrayBuffer());

      const { error: uploadError } = await supabase.storage
        .from('chat')
        .upload(path, buffer, { contentType: image.type });

      if (uploadError) {
        console.error('[sendMessageAction:upload]', uploadError.message);
        return { ok: false, error: 'L’image n’a pas pu être envoyée.' };
      }

      attachmentUrl = supabase.storage.from('chat').getPublicUrl(path).data.publicUrl;
    }

    const { error } = await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender_id: current.user.id,
      sender_name: current.profile.full_name || 'Membre',
      body: body || null,
      kind: hasImage ? 'image' : 'texte',
      attachment_url: attachmentUrl,
    });

    if (error) {
      console.error('[sendMessageAction]', error.message);
      return { ok: false, error: 'Le message n’a pas pu être envoyé.' };
    }

    await supabase
      .from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', conversationId);

    const otherId =
      conversation.client_id === current.user.id
        ? conversation.provider_id
        : conversation.client_id;

    await notifyUser({
      userId: otherId,
      type: 'message',
      title: 'Nouveau message',
      body: body ? body.slice(0, 120) : 'Image reçue',
      link: `/messages/${conversationId}`,
    });

    revalidatePath(`/messages/${conversationId}`);
    revalidatePath('/messages');
    return { ok: true, message: 'Message envoyé.' };
  } catch (error) {
    console.error('[sendMessageAction]', error);
    return { ok: false, error: 'Le service est momentanément indisponible.' };
  }
}

export async function sendLocationAction(
  conversationId: string,
  latitude: number,
  longitude: number,
): Promise<ChatActionResult> {
  const loaded = await loadConversation(conversationId);
  if ('error' in loaded) return { ok: false, error: loaded.error ?? 'Conversation introuvable.' };

  const { current, conversation, supabase } = loaded;

  if (
    typeof latitude !== 'number' ||
    typeof longitude !== 'number' ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return { ok: false, error: 'Position invalide.' };
  }

  const { error } = await supabase.from('messages').insert({
    conversation_id: conversationId,
    sender_id: current.user.id,
    sender_name: current.profile.full_name || 'Membre',
    body: 'Position partagée',
    kind: 'localisation',
    latitude,
    longitude,
  });

  if (error) {
    return { ok: false, error: 'La position n’a pas pu être partagée.' };
  }

  await supabase
    .from('conversations')
    .update({ last_message_at: new Date().toISOString() })
    .eq('id', conversationId);

  const otherId =
    conversation.client_id === current.user.id
      ? conversation.provider_id
      : conversation.client_id;

  await notifyUser({
    userId: otherId,
    type: 'message',
    title: 'Position partagée',
    link: `/messages/${conversationId}`,
  });

  revalidatePath(`/messages/${conversationId}`);
  return { ok: true, message: 'Position partagée.' };
}

export async function closeConversationAction(
  conversationId: string,
): Promise<ChatActionResult> {
  const loaded = await loadConversation(conversationId);
  if ('error' in loaded) return { ok: false, error: loaded.error ?? 'Conversation introuvable.' };

  const { current, conversation, supabase } = loaded;
  const admin = getSupabaseAdmin();

  const { error } = await supabase
    .from('conversations')
    .update({ status: 'fermee' })
    .eq('id', conversationId);

  if (error) {
    return { ok: false, error: 'La clôture a échoué.' };
  }

  await admin.from('messages').insert({
    conversation_id: conversationId,
    sender_id: current.user.id,
    sender_name: current.profile.full_name || 'Membre',
    body: 'Mission clôturée. Merci d’avoir utilisé LIFE CONNECT.',
    kind: 'systeme',
  });

  if (conversation.post_id) {
    await admin
      .from('posts')
      .update({ status: 'close' })
      .eq('id', conversation.post_id);
  }

  if (conversation.request_id) {
    await admin
      .from('requests')
      .update({
        statut: 'resolue',
        resolue_le: new Date().toISOString(),
      })
      .eq('id', conversation.request_id);
  }

  const otherId =
    conversation.client_id === current.user.id
      ? conversation.provider_id
      : conversation.client_id;

  await notifyUser({
    userId: otherId,
    type: 'systeme',
    title: 'Mission clôturée',
    body: 'La conversation est maintenant fermée.',
    link: `/messages/${conversationId}`,
  });

  revalidatePath(`/messages/${conversationId}`);
  revalidatePath('/messages');
  return { ok: true, message: 'Mission clôturée.' };
}
