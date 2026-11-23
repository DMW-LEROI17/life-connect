import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type {
  ConversationRow,
  MessageRow,
  PostRow,
  ProfileRow,
  ProposalRow,
} from '@/types/db';

export async function ensureConversationForProposal(input: {
  post: PostRow;
  proposal: ProposalRow;
  client: ProfileRow;
  provider: ProfileRow;
}): Promise<string | null> {
  try {
    const admin = getSupabaseAdmin();

    const { data: existing } = await admin
      .from('conversations')
      .select('id')
      .eq('post_id', input.post.id)
      .eq('client_id', input.client.id)
      .eq('provider_id', input.provider.id)
      .maybeSingle();

    if (existing?.id) return existing.id as string;

    const { data, error } = await admin
      .from('conversations')
      .insert({
        post_id: input.post.id,
        client_id: input.client.id,
        provider_id: input.provider.id,
        client_name: input.client.full_name || input.client.email || 'Client',
        provider_name:
          input.provider.full_name || input.provider.email || 'Prestataire',
        client_phone: input.client.phone,
        provider_phone: input.provider.phone,
        post_title: input.post.title,
        status: 'ouverte',
      })
      .select('id')
      .single();

    if (error || !data?.id) {
      console.error('[ensureConversationForProposal]', error?.message);
      return null;
    }

    await admin.from('messages').insert({
      conversation_id: data.id,
      sender_id: input.client.id,
      sender_name: input.client.full_name || 'Client',
      body: `Proposition acceptée pour « ${input.post.title} ». Vous pouvez maintenant échanger ici.`,
      kind: 'systeme',
    });

    return data.id as string;
  } catch (error) {
    console.error('[ensureConversationForProposal]', error);
    return null;
  }
}

export async function ensureConversationBetweenUsers(input: {
  client: ProfileRow;
  provider: ProfileRow;
  title: string;
}): Promise<string | null> {
  try {
    const admin = getSupabaseAdmin();

    const { data: existing } = await admin
      .from('conversations')
      .select('id')
      .eq('client_id', input.client.id)
      .eq('provider_id', input.provider.id)
      .eq('post_title', input.title)
      .maybeSingle();

    if (existing?.id) return existing.id as string;

    const { data, error } = await admin
      .from('conversations')
      .insert({
        client_id: input.client.id,
        provider_id: input.provider.id,
        client_name: input.client.full_name || 'Membre',
        provider_name: input.provider.full_name || 'Membre',
        client_phone: input.client.phone,
        provider_phone: input.provider.phone,
        post_title: input.title,
        status: 'ouverte',
      })
      .select('id')
      .single();

    if (error || !data?.id) {
      console.error('[ensureConversationBetweenUsers]', error?.message);
      return null;
    }

    await admin.from('messages').insert({
      conversation_id: data.id,
      sender_id: input.client.id,
      sender_name: input.client.full_name || 'Membre',
      body: `Conversation ouverte : ${input.title}`,
      kind: 'systeme',
    });

    return data.id as string;
  } catch (error) {
    console.error('[ensureConversationBetweenUsers]', error);
    return null;
  }
}

export async function getConversations(userId: string): Promise<ConversationRow[]> {
  try {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .or(`client_id.eq.${userId},provider_id.eq.${userId}`)
      .order('last_message_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('[getConversations]', error.message);
      return [];
    }

    return (data ?? []) as ConversationRow[];
  } catch (error) {
    console.error('[getConversations]', error);
    return [];
  }
}

export async function getConversationThread(
  conversationId: string,
): Promise<{ conversation: ConversationRow; messages: MessageRow[] } | null> {
  try {
    const supabase = createSupabaseServerClient();
    const { data: conversation, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .maybeSingle();

    if (error || !conversation) return null;

    const { data: messages } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(200);

    return {
      conversation: conversation as ConversationRow,
      messages: (messages ?? []) as MessageRow[],
    };
  } catch (error) {
    console.error('[getConversationThread]', error);
    return null;
  }
}
